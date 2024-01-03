/**
 * @class Sch.panel.AllDayHeader
 * @extends Sch.panel.SchedulerGrid
 */
Ext.define("Sch.panel.AllDayHeader", {
    extend           : "Sch.panel.SchedulerGrid",

    requires         : [
        'Sch.view.AllDay'
    ],

    xtype            : 'alldayheader',
    cls              : 'sch-all-day-header',
    columns          : [],
    weight           : 1000,
    height           : 24,
    rowHeight        : 24,
    hideHeaders      : true,
    reserveScrollbar : false,
    barMargin        : 1,
    enableDragCreation   : false,
    enablePinchZoom   : false,

    // Should be provided via instance config object
    mainScheduler         : null,
    // Filled in the constructor
    mainSchedulerView     : null,
    mainSchedulerTimeAxis : null,

    storedColumnWidth     : null,
    lastTimeTdHeight      : 0,

    // snapToIncrement   : true,

    // fake resource store hardcoded to be able to show events in horizontal scheduler
    resourceStore : {
        type : 'resourcestore',
        data : [{ Id : 1 }]
    },

    relayedConfigs : [
        'readOnly',
        'eventStore',
        'recurringEvents',
        'eventRenderer',
        'eventRendererScope',
        'onEventCreated',
        'tooltipTpl'
    ],

    normalViewConfig : null,

    createConfig : {
        showHoverTip : false,
        showDragTip  : false
    },

    enableEventDragDrop : false,

    resizeConfig : {
        showTooltip : false
    },

    viewPreset : {
        name            : 'dayAndWeek',
        timeColumnWidth : 25,
        timeResolution  : {
            unit      : 'd',
            increment : 1
        },
        headerConfig    : {
            middle : {
                unit       : 'd',
                align      : 'center',
                dateFormat : 'G'
            }
        }
    },

    constructor : function (config) {
        var me = this,
            mainScheduler = config.mainScheduler;

        me.relayedConfigs.forEach(function(name){
            config[name] = mainScheduler[name];
        });

        me.mainSchedulerTimeAxis = mainScheduler.timeAxis;
        me.mainSchedulerView     = mainScheduler.getSchedulingView();
        me.resourceStore.model   = mainScheduler.resourceStore.model;

        me.normalViewConfig = Ext.apply({
            xclass             : 'Sch.view.AllDay',
            eventPrefix        : me.mainSchedulerView.id,
            eventBodyTemplate  : me.mainSchedulerView.eventBodyTemplate,
            additionalEventCls : me.mainSchedulerView.additionalEventCls || '',
            selectedEventCls   : me.mainSchedulerView.selectedEventCls || ''
        }, config.normalViewConfig);

        me.callParent(arguments);

        var alldaySchedulingView = me.getSchedulingView();

        me.mon(me.mainSchedulerTimeAxis, {
            reconfigure : me.onMainTimeAxisReconfigure,
            scope       : me
        });

        alldaySchedulingView.on({
            refresh    : me.onSchedulingViewUpdate,
            itemupdate : me.onSchedulingViewUpdate,
            scope      : me
        });

        me.syncTimeAxisSpan();

        me.syncScroll();
        me.fixEventSelection();
        me.mainSchedulerView.relayEvents(me.getSchedulingView(), me.relayedViewEvents.concat([
            'scheduleclick',
            'scheduledblclick',
            'schedulecontextmenu',
            'schedulelongpress'
        ]));

        // HACK: but otherwise there's no way to make vertical scheduler column lines to have horizontally
        //       synchronized positions with the horizontal scheduler column lines
        me.oldHeaderCtLayout = mainScheduler.normalGrid.headerCt.layout.roundFlex;
        mainScheduler.normalGrid.headerCt.layout.roundFlex = Ext.Function.bind(me.roundFlex, me);
        mainScheduler.normalGrid.on('afterlayout', me.onContainerGridAfterLayout, me);
        // END HACK
    },

    roundFlex : function (flex) {
        var me = this;

        if (!me.storedColumnWidth) {
            me.storedColumnWidth = Math.floor(flex);
        }

        return me.storedColumnWidth;
    },

    resetStoredColumnWidth: function () {
        delete this.storedColumnWidth;
    },

    onContainerGridAfterLayout : function(p) {
        if (this.storedColumnWidth) {
            if (this.timeAxisViewModel.getTickWidth() !== this.storedColumnWidth) {
                this.timeAxisViewModel.suppressFit = true;
                this.timeAxisViewModel.setTickWidth(this.storedColumnWidth);
            }
        }
        else {
            if (this.timeAxisViewModel.getTickWidth() !== this.mainScheduler.timeAxisViewModel.weekViewColumnWidth) {
                this.timeAxisViewModel.setTickWidth(
                    this.mainScheduler.timeAxisViewModel.weekViewColumnWidth
                );
            }
        }

        this.resetStoredColumnWidth();
    },

    onMainTimeAxisReconfigure : function() {
        this.syncTimeAxisSpan();
    },

    syncTimeAxisSpan : function() {
        var me = this;
        me.setTimeSpan(me.mainSchedulerTimeAxis.getStart(), me.mainSchedulerTimeAxis.getEnd());
    },

    onResize : function(w, h) {
        var me = this;

        me.callParent(arguments);
        me.syncLockedHeaderComponent();

        return me;
    },

    syncLockedHeaderComponent : function() {
        this.lockedHeaderPartner.setHeight(this.getHeight());
    },

    getDesiredComponentHeight : function() {
        return this.el.down('.sch-timetd').getHeight();
    },

    onSchedulingViewUpdate : function() {
        var me = this,
            fullHeight = me.getDesiredComponentHeight();

        // If view is updated due to event D&D then there's the case we have to consider.
        // During D&D operation calendar view scrollbar is hidden, and if we set height
        // to all day header here instantly then we will run re-layout process when
        // D&D feature hasn't restored the scrollbar yet. This will lead to the situation
        // when calendar view columns will be re-layout without getting scrollbar place into account
        // and they will be wider then all day header time axis columns. So to avoid this
        // we need calendar view scrollbar to be restored and thus we set height on all day header
        // with a delay.
        //
        // https://app.assembla.com/spaces/bryntum/tickets/6588-allday-header-columns-disalign-after-event-drop-from-normal-view-onto-event-/details
        if (fullHeight !== me.lastTimeTdHeight) {
            me.lastTimeTdHeight = fullHeight;
            Ext.asap(function() {
                if (!me.destroyed) {
                    me.setHeight(fullHeight);
                }
            });
        }
    },

    onDestroy : function () {
        // Restore hacked override
        this.mainScheduler.normalGrid.headerCt.layout.roundFlex = this.oldHeaderCtLayout;

        this.callParent();
    },

    syncScroll : function() {
        this.getView().normalView.getScrollable().addPartner(this.mainScheduler.getView().normalView.getScrollable(), 'x');
    },

    fixEventSelection : function () {
        var me        = this,
            otherView = me.mainSchedulerView;

        // When mouse is down on event in main view, clear selection in all day header
        otherView.on({
            eventmousedown : me.clearPartnerSelection,
            scope          : me
        });

        // When mouse is down on schedule zone in all day header, clear selection in main view
        me.on({
            scheduleclick       : me.clearSelection,
            schedulecontextmenu : me.clearSelection,
            schedulelongpress   : me.clearSelection,
            scope               : me
        });
    },

    clearPartnerSelection : function (view, record, e) {
        var me           = this,
            sel          = me.getEventSelectionModel(),
            mode         = sel.getSelectionMode(),
            // Single mode (default) allows selecting one item at a time, so need to deselect other events
            // Multi mode allows complex selection of multiple items using Ctrl, so need to deselect other events only if ctrl key is not pressed
            // Simple mode allows simple selection of multiple items one-by-one, so no need to deselect other events
            needDeselect = mode === 'SINGLE' || (mode === 'MULTI' && !e.ctrlKey);

        // Need to check the event comes from main scheduler view,
        // because all day header eventclick is relayed to the main scheduler
        // and needDeselect flag is needed to fix #6753
        if (view === me.mainSchedulerView && needDeselect) {
            sel.deselectAll();
        }
    },

    clearSelection : function () {
        this.mainScheduler.getEventSelectionModel().deselectAll();
    }
});
