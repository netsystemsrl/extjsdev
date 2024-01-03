/**
@class Sch.plugin.DragSelector
@extends Ext.util.DragTracker

Plugin (ptype = 'scheduler_dragselector') for selecting multiple events by "dragging" an area in the scheduler chart. Currently only enabled **when CTRL is pressed**

{@img scheduler/images/drag-selector.png}

To add this plugin to scheduler:

    var scheduler = Ext.create('Sch.panel.SchedulerGrid', {
        ...

        resourceStore   : resourceStore,
        eventStore      : eventStore,

        plugins         : [
            Ext.create('Sch.plugin.DragSelector')
        ]
    });

 */
Ext.define("Sch.plugin.DragSelector", {
    extend : "Sch.util.DragTracker",
    alias  : 'plugin.scheduler_dragselector',
    mixins : ['Ext.AbstractPlugin'],

    requires : [
        'Sch.util.ScrollManager'
    ],

    lockableScope : 'top',

    schedulerView : null,
    eventBoxes    : null,
    sm            : null,
    proxy         : null,
    bodyRegion    : null,

    constructor : function (cfg) {
        cfg = cfg || {};

        Ext.applyIf(cfg, {
            onBeforeStart : this.onBeforeStart,
            onStart       : this.onStart,
            onDrag        : this.onDrag,
            onEnd         : this.onEnd
        });

        this.callParent(arguments);
    },

    bindListenersOnDragStart : function () {
        var el = this.getCmp().getScrollable().getElement();
        el && el.on('scroll', this.onScroll, this);

        this.callParent(arguments);
    },

    unbindListenersOnDragEnd : function () {
        var el = this.getCmp().getScrollable().getElement();
        el && el.un('scroll', this.onScroll, this);

        this.callParent(arguments);
    },

    init : function (scheduler) {
        this.setCmp(scheduler);

        var view = this.schedulerView = scheduler.getSchedulingView();

        view.on({
            afterrender : this.onSchedulingViewRender,
            scope       : this
        });
    },

    onScroll : function (event) {
        this.updateEventNodeBoxes();
        this.onMouseMove.apply(this, arguments);
    },

    onBeforeStart : function (e) {
        // Only react when not clicking event nodes and when CTRL is pressed
        return !e.getTarget('.sch-event') && e.ctrlKey;
    },

    onStart : function (e) {
        var schedulerView = this.schedulerView;

        this.proxy.show();

        this.bodyRegion = schedulerView.getScheduleRegion();

        this.eventBoxes = {};

        this.updateEventNodeBoxes();

        this.sm.deselectAll();

        Sch.util.ScrollManager.activate(schedulerView);

        schedulerView.on('bufferedrefresh', this.updateSelection, this);
        this.mon(schedulerView.getScrollable(), 'scroll', this.onSchedulerViewScroll, this);
    },

    onSchedulerViewScroll : function() {
        this.updateEventNodeBoxes();
        this.updateSelection();
    },

    updateEventNodeBoxes : function () {
        var me            = this,
            schedulerView = this.schedulerView;

        schedulerView.getEventNodes().each(function (eventElement) {
            var region = eventElement.getRegion();

            me.eventBoxes[eventElement.dom.id] = {
                eventRecord : schedulerView.getEventRecordFromDomElement(eventElement.dom),
                region      : region,
                node        : eventElement.dom
            };
        });
    },

    onDrag : function () {
        var dragRegion = this.getRegion().constrainTo(this.bodyRegion);

        this.proxy.setBox(dragRegion);

        this.updateSelection();
    },

    getCurrentScroll    : function () {
        return this.schedulerView.getScroll();
    },

    updateSelection : function () {
        var sm         = this.sm,
            eventBoxes = this.eventBoxes,
            dragRegion = this.getRegion(),
            shouldSelect;

        Ext.Object.getValues(eventBoxes).forEach(function (eventData) {
            var eventRecord = eventData.eventRecord;

            shouldSelect = dragRegion.intersect(eventData.region);

            if (shouldSelect && !sm.isSelected(eventRecord)) {
                sm.selectNode(eventData.node, true);
            }
            else if (!shouldSelect && sm.isSelected(eventRecord)) {
                sm.deselectNode(eventData.node);
            }
        });
    },

    onEnd : function (e) {
        if (this.proxy) {
            this.proxy.setDisplayed(false);
        }

        this.schedulerView.un('bufferedrefresh', this.updateSelection, this);
        this.mun(this.schedulerView.getScrollable(), 'scroll', this.onSchedulerViewScroll, this);
        Sch.util.ScrollManager.deactivate();
    },

    onSchedulingViewRender : function (view) {
        this.sm = view.getEventSelectionModel();

        this.initEl(this.schedulerView.el);

        // the proxy has to be set up immediately after rendering the view, so it will be included in the
        // "fixedNodes" of the grid view and won't be overwritten after refresh
        this.proxy = view.el.createChild({ cls : 'sch-drag-selector' });
    },

    destroy : function () {
        if (this.proxy) Ext.destroy(this.proxy);

        this.callParent(arguments);
    }
});

