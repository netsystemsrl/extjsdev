/**

 @class Sch.mixin.SchedulerPanel
 @extends Sch.mixin.AbstractSchedulerPanel

 A mixin for {@link Ext.panel.Panel} classes, providing "scheduling" functionality to the consuming panel.
 A consuming class should have already consumed the {@link Sch.mixin.TimelinePanel} mixin.

 Generally, should not be used directly, if you need to subclass the scheduler panel, subclass the {@link Sch.panel.SchedulerGrid} or {@link Sch.panel.SchedulerTree}
 instead.

 */
Ext.define('Sch.mixin.SchedulerPanel', {

    extend              : 'Sch.mixin.AbstractSchedulerPanel',

    requires            : [
        'Sch.view.SchedulerGridView',
        'Sch.feature.RecurringEvents',
        'Sch.selection.EventModel',
        'Sch.selection.AssignmentModel',
        'Sch.column.Resource',
        'Sch.column.timeAxis.Vertical',
        'Sch.column.ResourceName'
    ],

    uses : [
        'Sch.panel.AllDayHeader'
    ],

    /**
     * @cfg {String} eventSelModelType The xtype of the selection model to be used to events. Should be a {@link Sch.selection.EventModel} or its subclass.
     */
    eventSelModelType   : null, // 'eventmodel', 'assignmentmodel'

    /**
     * @cfg {Object} eventSelModel The configuration object for the event selection model. See {@link Sch.selection.EventModel} for available configuration options.
     */
    eventSelModel       : null,

    /**
     * @cfg {Boolean} enableEventDragDrop true to enable drag and drop of events, defaults to true
     */
    enableEventDragDrop : true,

    /**
     * @cfg {Boolean} enableDragCreation true to enable creating new events by click and drag, defaults to true
     */
    enableDragCreation  : true,

    /**
     * @cfg {Boolean} createEventOnDblClick true to enable creating new events by dblclicking or longpressing scheduling view
     */
    createEventOnDblClick : false,

    /**
     * @cfg {Object} dragConfig Custom config to pass to the {@link Sch.feature.SchedulerDragZone}
     * instance which will be created by {@link Sch.feature.DragDrop}.
     */
    dragConfig          : null,

    /**
     * @cfg {String} weekViewColumnClass
     * Defines the column class for the days, override this to use your own custom column class. (Used only in weekview mode)
     */
    weekViewColumnClass : 'Sch.column.Day',

    /**
     * @cfg {Object} timeAxisColumnCfg A {@link Ext.grid.column.Column} config used to configure the time axis column in vertical mode.
     */

     /**
     * @cfg {Object} weekViewTimeAxisCfg A {@link Ext.grid.column.Column} config used to configure the time axis column in weekview mode.
     */

    /**
     * @cfg {Object} createConfig Custom config to pass to the {@link Sch.feature.DragCreator} instance
     */

    /**
     * @cfg {Object} resizeConfig Custom config to pass to the {@link Sch.feature.ResizeZone} instance
     */

    componentCls                : 'sch-schedulerpanel',

    // even that this config "belongs" to the Sch.mixin.TimelinePanel mixin
    // we can't define it there, because of various reasons (extjs mixin system)
    // this is guarded by the 203_buffered_view_1.t.js test in gantt and 092_rowheight.t.js in scheduler
    /**
     * @ignore
     * @cfg {Boolean} lockedGridDependsOnSchedule set this to true if you require the left (locked) grid section to be refreshed when the schedule is updated.
     */
    lockedGridDependsOnSchedule : true,

    /**
     * @cfg {Boolean} showAllDayHeader Shows an all day header above the main schedule for All Day events.
     */
    showAllDayHeader : true,

    /**
     * @cfg {Boolean} [multiSelect=false]
     * True to allow selection of more than one event at a time, false to allow selection of only a single item
     * at a time or no selection at all, depending on the value of {@link #singleSelect}.
     */
    /**
     * @cfg {Boolean} [singleSelect]
     * Allows selection of exactly one event at a time. As this is the default selection mode anyway, this config
     * is completely ignored.
     */
    /**
     * @cfg {Boolean} [simpleSelect=false]
     * True to enable multiselection by clicking on multiple events without requiring the user to hold Shift or Ctrl,
     * false to force the user to hold Ctrl or Shift to select more than on item.
     */

    /**
     * @cfg {Function} dndValidatorFn
     * An empty function by default, but provided so that you can perform custom validation on
     * the item being dragged. This function is called during a drag and drop process and also after the drop is made.
     * To control what 'this' points to inside this function, use
     * {@link Sch.panel.TimelineGridPanel#validatorFnScope} or {@link Sch.panel.TimelineTreePanel#validatorFnScope}.
     * Return true if the drop position is valid, else false to prevent a drop.
     * @param {Array} dragRecords an array containing the records for the events being dragged
     * @param {Sch.model.Resource} targetResourceRecord the target resource of the the event
     * @param {Date} date The date corresponding to the drag proxy position
     * @param {Number} duration The duration of the item being dragged in milliseconds
     * @param {Event} e The event object
     * @return {Boolean}
     */

    /**
     * @cfg {Function} resizeValidatorFn
     * Provide to perform custom validation on an item being resized.
     * To control what 'this' points to inside this function, use
     * {@link Sch.panel.TimelineGridPanel#validatorFnScope} or {@link Sch.panel.TimelineTreePanel#validatorFnScope}.
     * Return true if the resize state is valid, else false.
     * @param {Sch.model.Resource} resourceRecord the resource of the row in which the event is located
     * @param {Sch.model.Event} eventRecord the event being resized
     * @param {Date} startDate
     * @param {Date} endDate
     * @param {Event} e The event object
     * @return {Boolean}
     */


    /**
     * @cfg {Function} createValidatorFn
     * Provide to perform custom validation on the item being created.
     * To control what 'this' points to inside this function, use
     * {@link Sch.panel.TimelineGridPanel#validatorFnScope} or {@link Sch.panel.TimelineTreePanel#validatorFnScope}.
     * Return true to signal that the new event is valid, or false prevent it.
     * @param {Sch.model.Resource} resourceRecord the resource for which the event is being created
     * @param {Date} startDate
     * @param {Date} endDate
     * @param {Event} e The event object
     * @return {Boolean} true
     */

    verticalListeners : null,

     /**
      * @event beforemodechange
      * Fires before a mode change
      * @preventable
      * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} scheduler The scheduler panel
      * @param {String/Object}   modeCfg A string like 'horizontal', 'vertical', 'weekview' or an object
      * @param {String}          modeCfg.mode The new mode ('horizontal', 'vertical', 'weekview')
      * @param {String/Object}   [modeCfg.viewPreset] The id of the new preset (see {@link Sch.preset.Manager} for details)
      * @param {Date}            [modeCfg.startDate] A new start date for the time axis
      * @param {Date}            [modeCfg.endDate] A end start date for the time axis
      */

     /**
      * @event modechange
      * Fires after a mode change
      * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} scheduler The scheduler panel
      * @param {String/Object}   modeCfg A string like 'horizontal', 'vertical', 'weekview' or an object
      * @param {String}          modeCfg.mode The new mode ('horizontal', 'vertical', 'weekview')
      * @param {String/Object}   [modeCfg.viewPreset] The id of the new preset (see {@link Sch.preset.Manager} for details)
      * @param {Date}            [modeCfg.startDate] A new start date for the time axis
      * @param {Date}            [modeCfg.endDate] A end start date for the time axis
      */

     // Cached value of locked grid width used when switching mode
    horizontalLockedWidth : null,

    verticalColumns       : null,
    calendarColumns       : null,

    /**
     * Provide `false` to disable the recurring events feature.
     * By default the feature is enabled and populates the panel view with repeating events visible in the current timespan.
     * @cfg {Boolean}
     */
    recurringEvents       : true,

    // weekview and vertical modes are similar, but we have to recognize them individually
    // in order to do that we consider sch-vertical as a main CSS for both,
    // sch-calendar for weekview (previous name was calendar) and sch-vertical-resource for vertical
    horizontalCls : ['sch-horizontal'],
    verticalCls   : ['sch-vertical-resource', 'sch-vertical'],
    weekviewCls   : ['sch-calendar', 'sch-vertical'],

    // Hold previous view preset as arguments to be able pass them to setViewPreset method,
    // if we switched from weekview to horizontal/vertical mode and vice versa
    _oldViewPresetArgs : null,

    /**
     * @cfg {Boolean} splitGrid
     * @inheritdoc Sch.plugin.Split#splitGrid
     * @localdoc Available in horizontal mode when {@link Sch.plugin.Split split plugin} is configured.
     */

    /**
     * @method split
     * @inheritdoc Sch.plugin.Split#split
     * @localdoc Available in horizontal mode when {@link Sch.plugin.Split split plugin} is configured.
     */

    /**
     * @method merge
     * @inheritdoc Sch.plugin.Split#merge
     * @localdoc Available in horizontal mode when {@link Sch.plugin.Split split plugin} is configured.
     */

    /**
     * @method isSplit
     * @inheritdoc Sch.plugin.Split#isSplit
     * @localdoc Available in horizontal mode when {@link Sch.plugin.Split split plugin} is configured.
     */

    relayedViewEvents : [
        /**
         * @event eventclick
         * Fires when an event is clicked
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} eventRecord The event record of the clicked event
         * @param {Ext.event.Event} e The event object
         */
        'eventclick',

        /**
         * @event eventlongpress
         * Fires when an event is longpressed
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} eventRecord The event record of the clicked event
         * @param {Ext.event.Event} e The event object
         */
        'eventlongpress',

        /**
         * @event eventmousedown
         * Fires when a mousedown event is detected on a rendered event
         * @param {Mixed} view The scheduler view instance
         * @param {Sch.model.Event} eventRecord The event record
         * @param {Ext.event.Event} e The event object
         */
        'eventmousedown',

        /**
         * @event eventmouseup
         * Fires when a mouseup event is detected on a rendered event
         * @param {Mixed} view The scheduler view instance
         * @param {Sch.model.Event} eventRecord The event record
         * @param {Ext.event.Event} e The event object
         */
        'eventmouseup',

        /**
         * @event eventdblclick
         * Fires when an event is double clicked
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} eventRecord The event record of the clicked event
         * @param {Ext.event.Event} e The event object
         */
        'eventdblclick',

        /**
         * @event eventcontextmenu
         * Fires when contextmenu is activated on an event
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} eventRecord The event record of the clicked event
         * @param {Ext.event.Event} e The event object
         */
        'eventcontextmenu',

        /**
         * @event eventmouseenter
         * Fires when the mouse moves over an event
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} eventRecord The event record of the clicked event
         * @param {Ext.event.Event} e The event object
         */
        'eventmouseenter',

        /**
         * @event eventmouseleave
         * Fires when the mouse moves out of an event
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} eventRecord The event record of the clicked event
         * @param {Ext.event.Event} e The event object
         */
        'eventmouseleave',

        /**
         * @event eventkeydown
         * Fires when a keydown event is detected on an event
         * @param {Mixed} view The scheduler view instance
         * @param {Sch.model.Event} eventRecord The event record
         * @param {Ext.event.Event} e The event object
         */
        'eventkeydown',

        /**
         * @event eventkeyup
         * Fires when a keyup event is detected on an event
         * @param {Mixed} view The scheduler view instance
         * @param {Sch.model.Event} eventRecord The event record
         * @param {Ext.event.Event} e The event object
         */
        'eventkeyup',
        // Resizing events start --------------------------
        /**
         * @event beforeeventresize
         * @preventable
         * Fires before a resize starts, return false to stop the execution
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} record The record about to be resized
         * @param {Ext.event.Event} e The event object
         */
        'beforeeventresize',

        /**
         * @event eventresizestart
         * Fires when resize starts
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} record The event record being resized
         */
        'eventresizestart',

        /**
         * @event eventpartialresize
         * Fires during a resize operation and provides information about the current start and end of the resized event
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} record The event record being resized
         * @param {Date} startDate The new start date of the event
         * @param {Date} endDate The new end date of the event
         * @param {Ext.Element} element The proxy element being resized
         */
        'eventpartialresize',

        /**
         * @event beforeeventresizefinalize
         * @preventable
         * Fires before a successful resize operation is finalized. Return false from a listener function to prevent the finalizing to
         * be done immediately, giving you a chance to show a confirmation popup before applying the new values.
         * To finalize the operation, call the 'finalize' method available on the resizeContext object.
         * @param {Sch.view.SchedulerGridView} view The scheduler view instance
         * @param {Object} resizeContext An object containing 'eventRecord', 'start', 'end' and 'finalize' properties.
         * @param {Ext.event.Event} e The event object
         */
        'beforeeventresizefinalize',

        /**
         * @event eventresizeend
         * Fires after a successful resize operation
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} record The updated event record
         */
        'eventresizeend',

        /**
         * @event aftereventresize
         * Always fires after a resize operation
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} record The updated event record
         */
        'aftereventresize',
        // Resizing events end --------------------------

        // Dnd events start --------------------------
        /**
         * @event beforeeventdrag
         * @preventable
         * Fires before a dnd operation is initiated, return false to cancel it
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} record The record corresponding to the node that's about to be dragged
         * @param {Ext.event.Event} e The event object
         */
        'beforeeventdrag',

        /**
         * @event eventdragstart
         * Fires when a dnd operation starts
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event[]} records An array with the records being dragged
         */
        'eventdragstart',

        /**
         * @event eventdrag
         * Fires when an event is dragged onto a new resource or time slot
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event[]} records An array with the records being dragged
         * @param {Date} date The new start date of the main event record
         * @param {Sch.model.Resource} resource The new resource for the main event record
         * @param {Object} dragData A custom drag drop context object
         */
        'eventdrag',

        /**
         * @event beforeeventdropfinalize
         * @preventable
         * Fires before a successful drop operation is finalized. Return false to finalize the drop at a later time.
         * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
         * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Object} dragContext An object containing 'eventRecord', 'start', 'end', 'newResource', 'finalize' properties.
         * @param {Ext.event.Event} e The event object
         */
        'beforeeventdropfinalize',

        /**
         * @event eventdrop
         * Fires after a successful drag-drop operation
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event[]} records the affected records (if copies were made, they were inserted into the store)
         * @param {Boolean} isCopy True if the records were copied instead of moved
         */
        'eventdrop',

        /**
         * @event aftereventdrop
         * Fires after a drag-drop operation, even when drop was performed on an invalid location
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event[]} records The affected records
         */
        'aftereventdrop',
        // Dnd events end --------------------------

        // Drag create events start --------------------------
        /**
         * @event beforedragcreate
         * @preventable
         * Fires before a drag starts, return false to stop the execution
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Resource} resource The resource record
         * @param {Date} date The clicked date on the timeaxis
         * @param {Ext.event.Event} e The event object
         */
        'beforedragcreate',

        /**
         * @event dragcreatestart
         * Fires before a drag starts
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Ext.Element} el The proxy element
         */
        'dragcreatestart',

        /**
         * @event beforedragcreatefinalize
         * @preventable
         * Fires before a successful resize operation is finalized. Return false from a listener function to prevent the finalizing to
         * be done immediately, giving you a chance to show a confirmation popup before applying the new values.
         * To finalize the operation, call the 'finalize' method available on the createContext object.
         * @param {Mixed} view The scheduler view instance
         * @param {Object} createContext An object containing, 'start', 'end', 'resourceRecord' properties.
         * @param {Ext.event.Event} e The event object
         * @param {Ext.Element} el The proxy element
         */
        'beforedragcreatefinalize',

        /**
         * @event dragcreateend
         * Fires after a successful drag-create operation
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} newEventRecord The newly created event record (added to the store in onEventCreated method)
         * @param {Sch.model.Resource} resource The resource record to which the event belongs
         * @param {Ext.event.Event} e The event object
         * @param {Ext.Element} el The proxy element
         */
        'dragcreateend',

        /**
         * @event afterdragcreate
         * Always fires after a drag-create operation
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Ext.Element} el The proxy element
         */
        'afterdragcreate',
        // Drag create events end --------------------------

        /**
         * @event beforeeventadd
         * @preventable
         * Fires after a successful drag-create operation, before the new event is added to the store.
         * Return false to prevent the event from being added to the store.
         * @param {Sch.view.SchedulerGridView} scheduler The scheduler view
         * @param {Sch.model.Event} eventRecord The newly created event record
         * @param {Sch.model.Resource[]} resources The resources to which the event is assigned
         */
        'beforeeventadd'
    ],

    inheritables : function () {
        return {
            variableRowHeight   : true,

            // private
            initComponent : function () {
                var me = this,
                    viewConfig              = me.normalViewConfig = me.normalViewConfig || {},
                    dependencyViewConfig    = me.getDependencyViewConfig && me.getDependencyViewConfig() || {};

                me._initializeSchedulerPanel();

                me.verticalListeners = {
                    clear       : me.refreshResourceColumns,
                    datachanged : me.refreshResourceColumns,
                    update      : me.refreshResourceColumns, // TODO WASTEFUL
                    load        : me.refreshResourceColumns,
                    scope       : me
                };

                me.calendarListeners = {
                    reconfigure     : me.refreshCalendarColumns,
                    priority        : 1,
                    scope           : me
                };

                me.calendarNormalGridListeners = {
                    columnresize    : me.onCalendarColumnResize,
                    scope           : me
                };

                me.calendarResourceStoreListeners = {
                    load            : me.onCalendarResourceStoreChange,
                    add             : me.onCalendarResourceStoreChange,
                    remove          : me.onCalendarResourceStoreChange,
                    scope           : me
                };

                me.normalViewConfig = me.normalViewConfig || {};

                Ext.apply(me.normalViewConfig, {
                    eventStore        : me.eventStore,
                    resourceStore     : me.resourceStore,
                    dependencyStore   : me.dependencyStore,
                    eventBarTextField : me.eventBarTextField || this.getEventStore().getModel().prototype.nameField
                });

                // Configure event template with extra dependency markup
                if (me.getDependencyStore() && dependencyViewConfig.enableDependencyDragDrop !== false) {
                    viewConfig.terminalSides = dependencyViewConfig.terminalSides || ['left', 'right', 'top', 'bottom'];
                }

                Ext.copy(me.normalViewConfig, me,  [
                    'barMargin',
                    'eventBodyTemplate',
                    'eventTpl',
                    'allowOverlap',
                    'dragConfig',
                    'eventBarIconClsField',
                    'onEventCreated',
                    'constrainDragToResource',
                    'snapRelativeToEventStartDate',
                    'eventSelModelType',
                    'eventSelModel',
                    'simpleSelect',
                    'multiSelect',
                    'allowDeselect',
                    'lockedGridDependsOnSchedule',
                    'showAllDayHeader'
                ], true);

                me.callParent(arguments);

                if (me.recurringEvents !== false && (!me.recurringEvents || !me.recurringEvents.isInstance)) {
                    me.recurringEvents = Ext.create(Ext.apply({
                        xclass : 'Sch.feature.RecurringEvents',
                        panel  : me
                    }, me.recurringEvents));
                }

                if (!me.isHorizontal()) {
                    me.setGroupingFeatureDisabled(true);
                }

                // mode is safe to use after callParent where we check for deprecated 'orientation' option
                if (me.isVertical()) {
                    me.mon(me.resourceStore, me.verticalListeners);
                }
                else if (me.isWeekView() && me.showAllDayHeader) {
                    me.addDockedAllDayHeader();
                }

                var lockedView      = me.lockedGrid.getView();
                var normalView      = me.getSchedulingView();

                lockedView.on('resize', me.onLockedViewResize, me);
                // normalView.on('resize', me.onNormalViewResize, me);

                me.registerRenderer(normalView.columnRenderer, normalView);

                if (me.resourceZones) {
                    var resourceZoneStore = Ext.StoreManager.lookup(me.resourceZones);

                    me.resourceZonesPlug = new Sch.plugin.ResourceZones(Ext.apply({
                        store : resourceZoneStore
                    }, me.resourceZonesConfig));

                    me.resourceZonesPlug.init(me);
                }

                normalView.on('columnwidthchange', me.onColWidthChange, me);

                // Relaying after parent class has setup the locking grid components
                me.relayEvents(normalView, me.relayedViewEvents);

                // enable our row height injection if the default extjs row height synching mechanism is disabled
                // (it is disabled by default in our Lockable mixin, because it's slow)
                if (!me.syncRowHeight) me.enableRowHeightInjection(lockedView, normalView);

                if (me.getDependencyStore()) {
                    me.addCls('sch-scheduler-with-dependencies');
                }
            },

            configureColumns: function (columns) {
                var me        = this;

                columns       = columns || [{ xtype : 'scheduler_resourcenamecolumn' }];

                me.callParent(arguments);

                me.verticalColumns = me.verticalColumns || [
                        Ext.apply({
                            xtype                 : 'verticaltimeaxis'
                        }, me.timeAxisColumnCfg || {})
                    ];

                Ext.Array.each(me.verticalColumns, function(col) {
                    Ext.apply(col, {
                        timeAxis              : me.timeAxis,
                        timeAxisViewModel     : me.timeAxisViewModel,
                        cellTopBorderWidth    : me.cellTopBorderWidth,
                        cellBottomBorderWidth : me.cellBottomBorderWidth
                    });
                });


                me.calendarColumns = [
                    Ext.apply({
                        xtype                 : 'verticaltimeaxis',
                        width                 : 60,
                        timeAxis              : me.timeAxis,
                        timeAxisViewModel     : me.timeAxisViewModel,
                        cellTopBorderWidth    : me.cellTopBorderWidth,
                        cellBottomBorderWidth : me.cellBottomBorderWidth
                    }, me.calendarTimeAxisCfg || me.weekViewTimeAxisCfg || {})
                ];

                if (me.isVertical()) {
                    me.columns    = me.verticalColumns.concat(me.createResourceColumns(me.resourceColumnWidth || me.timeAxisViewModel.resourceColumnWidth));
                    me.store      = me.timeAxis;
                    if (me.resourceStore.isGrouped()) {
                        me.timeAxis.group(me.resourceStore.groupField);
                        me.bindGroupingFeatureListener();
                    }
                } else if (me.isWeekView()) {
                    // in order to build columns/rows for weekview we need time axis with view preset consumed
                    // but axis is filled only after columns are initialized thus can be changed only via 'reconfigure' method
                    // than requires grid to be rendered.
                    // We provide empty configs for columns and rows in order to make me procedure slightly faster
                    // There is almost no other way until timeaxis is filled before 'callParent' call.
                    me.columns = [];
                    me.store   = null;
                    // in 6.2.1 scrollable on normal view is not initialized to 'afterrender' event, move reconfigure
                    // to beforerender to not invoke scrolling throwing exceptions
                    me.on('beforerender', me.refreshCalendarColumns, me);
                }
            },

            applyViewSettings: function (preset, initial) {
                this.callParent(arguments);

                var schedulingView = this.getSchedulingView(),
                    height;

                if (this.orientation === 'vertical') {
                    // timeColumnWidth is used for row height in vertical mode
                    height = preset.timeColumnWidth || 60;
                    schedulingView.setColumnWidth(preset.resourceColumnWidth || 100, true);
                    schedulingView.setRowHeight(height, true);
                }
            },

            onRender : function() {
                // Adjust buffered rendering settings based on mode. See comments at function definition
                if (!this.isHorizontal()) {
                    this.reconfigureBufferedRendering(true);
                }
                this.callParent(arguments);
            },

            afterRender : function (){
                var me = this;
                var schedulingView = this.getSchedulingView();

                this.callParent(arguments);

                if (this.isVertical()) {
                    this.onLockedViewResize(null, null, this.lockedGrid.getView().getHeight());
                }
                else if (this.isWeekView()) {
                    this.mon(this.timeAxis, this.calendarListeners);
                    this.mon(this.resourceStore, this.calendarResourceStoreListeners);
                    this.normalGrid.on(this.calendarNormalGridListeners);
                }

                if (this.infiniteScroll) {
                    schedulingView.on({
                        eventdragstart      : this.doSuspendLayouts,
                        aftereventdrop      : this.doResumeLayouts,

                        eventresizestart    : this.doSuspendLayouts,
                        aftereventresize    : this.doResumeLayouts,

                        scope               : this
                    });
                }

                if (this.lockedGridDependsOnSchedule) {
                    schedulingView.on('itemupdate', this.onNormalViewItemUpdate, this);
                }

                this.relayEvents(this.getEventSelectionModel(), [
                    /**
                     * @event eventselectionchange
                     * Fired after a selection change has occurred
                     * @param {Sch.selection.EventModel} this
                     * @param {Sch.model.Event[]} selected The selected events
                     */
                    'selectionchange',

                    /**
                     * @event eventdeselect
                     * Fired after a record is deselected
                     * @param {Sch.selection.EventModel} this
                     * @param  {Sch.model.Event} record The deselected event
                     */
                    'deselect',

                    /**
                     * @event eventselect
                     * Fired after a record is selected
                     * @param {Sch.selection.EventModel} this
                     * @param  {Sch.model.Event} record The selected event
                     */
                    'select'
                ], 'event');

                this.getView().on('refresh', function() {
                    if (!me.isHorizontal()) {
                        me.reconfigureBufferedRendering();
                    }
                });

                // #7510
                var listeners = {
                    keydown  : me.handleTimelineKeyEvent,
                    keypress : me.handleTimelineKeyEvent,
                    keyup    : me.handleTimelineKeyEvent,
                    scope    : me
                };

                // normal grid body element can only be focused in IE11
                if (Ext.isIE11) {
                    me.normalGrid.el.on(listeners);
                }
                else {
                    schedulingView.el.on(listeners);
                }

                schedulingView.on({
                    eventclick : me.handleTimelineEventClick,
                    scope      : me
                });

                // We already instantiated calendar columns in the 'beforerender' event listener. If we do it here, we
                // will trigger view refresh -> clearViewEl (it is filtered out if view is not yet rendered) -> viewModel
                // notify which expects view is fully functional. But it is yet not fully functional, because layouts
                // are not yet calculated.
                // 40_calendar_basic 'Viewmodel..' test
                // if (this.isWeekView()) {
                //     this.refreshCalendarColumns();
                // }
            },

            getTimeSpanDefiningStore : function () {
                return this.eventStore;
            },

            destroy : function() {
                var me = this;

                if (me.destroyStores) {
                    me.getDependencyStore() && me.getDependencyStore().destroy();
                    me.getAssignmentStore() && me.getAssignmentStore().destroy();
                    me.getEventStore() && me.getEventStore().destroy();
                    me.getResourceStore() && me.getResourceStore().destroy();
                }

                me.destroyDockedAllDayHeader();

                Ext.destroyMembers(
                    me,
                    'resourceZonesPlug'
                );

                me.callParent(arguments);
            },

            scrollToDateCentered : function (date, animate) {
                var view = this.getSchedulingView();

                if (view.isWeekView()) {
                    var column = view.weekview.getColumnsBy(function (column) {
                        return column.start <= date && column.end > date;
                    })[0];
                    if (column) {
                        var deltaX = view.getWidth() / 2;
                        var deltaY = view.getViewContainerHeight() / 2;

                        view.scrollHorizontallyTo(Math.max(column.getLocalX() - deltaX, 0));
                        view.scrollVerticallyTo(Math.max(view.getCoordinateFromDate(date, true) - deltaY, 0));
                    }
                } else {
                    return this.callParent(arguments);
                }
            }
        };
    },

    doSuspendLayouts : function() {
        // if infinite scroll is set we want to resume layouts for short timespan when scheduler is being refreshed
        this.timeAxis.on({
            beginreconfigure    : this.onBeginReconfigure,
            endreconfigure      : this.onEndReconfigure,
            scope               : this
        });

        this.lockedGrid.suspendLayouts();
        this.normalGrid.suspendLayouts();
    },

    doResumeLayouts : function() {
        this.timeAxis.un({
            beginreconfigure : this.onBeginReconfigure,
            endreconfigure   : this.onEndReconfigure,
            scope            : this
        });

        this.lockedGrid.resumeLayouts();
        this.normalGrid.resumeLayouts();
    },

    onBeginReconfigure : function() {
        this.normalGrid.resumeLayouts();
    },

    onEndReconfigure : function() {
        this.normalGrid.suspendLayouts();
    },

    onColWidthChange : function (timeAxisViewModel, width) {
        if (this.isVertical()) {
            this.resourceColumnWidth = width;
            this.refreshResourceColumns();
        } else if (this.isWeekView()) {
            this.weekViewColumnWidth = width;
            this.refreshCalendarColumns();
        }
    },

    enableRowHeightInjection : function (lockedView) {
        var me = this;

        var cellTpl = new Ext.XTemplate(
            '{%',
                'this.processCellValues(values);',
                'this.nextTpl.applyOut(values, out, parent);',
            '%}',
            {
                priority          : 1,
                processCellValues : Ext.Function.bind(me.embedRowHeight, me)
            }
        );

        lockedView.addCellTpl(cellTpl);

        // this is a workaround, to force ExtJS grid to use "long" rendering path when doing cell updates
        // which involves the cell templates (which we had overrode)
        // w/o it, grid may use "fast" path and only update the cell content, leaving the row height unsynchronized
        Ext.Array.each(this.columns, function (column) {
            column.hasCustomRenderer    = true;
        });

        // Use same workaround for horizontal columns as it's a config for future mode changes
        // ticket #2925
        Ext.Array.each(this.horizontalColumns, function (column) {
            column.hasCustomRenderer    = true;
        });
    },

    embedRowHeight : function (cellValues) {
        var me             = this,
            schedulingView = me.getSchedulingView();

        if (schedulingView.isHorizontal()) {
            var nbrBands = 1;

            if (schedulingView.rowHasDynamicRowHeight(cellValues.record)) {
                var resource = cellValues.record;
                var layout   = schedulingView.eventLayout.horizontal;

                nbrBands = layout.getNumberOfBands(resource, function () {
                    return schedulingView.getEventStore().filterEventsForResource(resource, schedulingView.timeAxis.isRangeInAxis, schedulingView.timeAxis);
                });
            }

            // We should actually increase row height on cellTop/BottomBorder
            var rowHeight = (nbrBands * me.getRowHeight()) - ((nbrBands - 1) * schedulingView.barMargin) +
                // 1 px for top row border width
                schedulingView.cellTopBorderWidth + schedulingView.cellBottomBorderWidth - 1;

            cellValues.style = (cellValues.style || '') + ';height:' + rowHeight + 'px;';
        }
    },

    /**
     * Returns the selection model being used, and creates it via the configuration
     * if it has not been created already.
     * @return {Sch.selection.EventModel} selModel
     */
    getEventSelectionModel : function () {
        return this.getSchedulingView().getEventSelectionModel();
    },

    refreshResourceColumns : function () {
        var w = this.resourceColumnWidth || this.timeAxisViewModel.resourceColumnWidth;
        // for vertical mode we only care about one vertical column and generated resource columns
        // this is not customizable
        this.reconfigure(this.verticalColumns.concat(this.createResourceColumns(w)));
    },

    onCalendarColumnResize : function (headerCt, column, width) {
        // Columns are not resizable individually, but we need to track their size to
        // adjust events accordingly in following cases:
        // 1: switching view preset with suspended layouts (e.g. when viewPreset is a binding in a viewmodel, #2641)
        // 2: panel is resized
        // tested by 40_calendar_basic
        if (width !== this.timeAxisViewModel.weekViewColumnWidth) {
            this.timeAxisViewModel.setViewColumnWidth(width, true);
        }

        // this may produce an animation of events resizing, but it's most straightforwad approach
        this.getSchedulingView().weekview.repaintEventsForColumn(column, headerCt.columnManager.indexOf(column));
    },

    onCalendarResourceStoreChange : function () {
        this.getSchedulingView().refreshView();
    },

    refreshCalendarColumns : function () {
        var rows    = this.createCalendarRows();
        var columns = this.createCalendarColumns();

        this.reconfigure(rows, this.calendarColumns.concat(columns));
    },

    // This method will disable grouping feature and hide all UI related to groups
    setGroupingFeatureDisabled : function (disabled) {
        var me = this,
            view = me.normalGrid.view;

        // We can only support our scheduler_gropuing feature, which will be stored by this reference
        if (!view.groupingFeature || view.groupingFeature.disabled === disabled) {
            return;
        }

        // Feature is not shared between views, so it has to disabled on each one
        view.groupingFeature[disabled ? 'disable' : 'enable']();
        view = me.lockedGrid.view;
        view.groupingFeature[disabled ? 'disable' : 'enable']();
    },

    refreshGroupingStore : function () {
        var feature = this.normalGrid.view.groupingFeature;
        if (feature) {
            // Let grouping store know that time axis is reconfigured, otherwise view can be empty
            feature.dataSource.processStore(this.timeAxis);
        }
    },

    // When grid is configured with grouping feature, data source for each view will be replaced with grouping store,
    // which is bound to panel store. It will listen to datachanged event on panel store to update groups. But in vertical view
    // store is a time axis which will suspend all events except 'reconfigure'. So we have to listen to that to update
    // grouping store content
    bindGroupingFeatureListener : function () {
        // Set higher priority to refresh grouping store before view is refreshed
        this.mon(this.timeAxis, 'reconfigure', this.refreshGroupingStore, this, { priority : 10 });
    },

    unbindGroupingFeatureListener : function () {
        this.mun(this.timeAxis,'reconfigure', this.refreshGroupingStore);
    },

    /**
     * Switches the mode of this panel
     *
     * @param {String/Object}   modeCfg A string like 'horizontal', 'vertical', 'weekview' or an object
     * @param {String}          modeCfg.mode The new mode ('horizontal', 'vertical', 'weekview')
     * @param {String/Object}   [modeCfg.viewPreset] The id of the new preset (see {@link Sch.preset.Manager} for details)
     * @param {Date}            [modeCfg.startDate] A new start date for the time axis
     * @param {Date}            [modeCfg.endDate] A end start date for the time axis
     */
    setMode : function (modeCfg, force) {
        var me = this;

        // This could be called too early during initComponent phase (by responsive mechanism in Ext JS)
        if (!me.normalGrid) {
            me.on('afterrender', function () {
                me.setMode(modeCfg, true);
            });

            return;
        }

        var mode = typeof modeCfg === 'string' ? modeCfg : modeCfg.mode;

        if (!mode) {
            throw new Error('Mode is undefined');
        }

        // Due to #3345 - Rename 'calendar' mode in scheduler to weekview
        // silently fallback to 'weekview', if user passes 'calendar' as a mode
        if (mode === 'calendar') mode = 'weekview';

        var viewPresetArgs;

        if (modeCfg.viewPreset) {
            viewPresetArgs = [modeCfg.viewPreset, modeCfg.startDate || null, modeCfg.endDate || null];
        }

        if (mode === me.mode && !force) {
            viewPresetArgs && me.setViewPreset.apply(me, viewPresetArgs);
            return;
        }

        if (me.fireEvent('beforemodechange', me, modeCfg) !== false) {
            me.mode = mode;

            var normalGrid     = me.normalGrid,
                schedulingView = me.getSchedulingView(),
                normalHeaderCt = normalGrid.headerCt;

            me.suspendRefresh();
            Ext.suspendLayouts();

            me.destroyDockedAllDayHeader();

            me.unbindGroupingFeatureListener();

            var isWeekView    = me.isWeekView();
            var isSchWeekView = schedulingView.isWeekView();

            // if switched from weekview to horizontal/vertical and vice versa
            if ((isSchWeekView && !isWeekView) || (!isSchWeekView && isWeekView)) {
                viewPresetArgs        = viewPresetArgs || me._oldViewPresetArgs || [isWeekView ? 'week' : 'weekAndDay'];
                me._oldViewPresetArgs = [me.viewPreset, me.timeAxis.getStart(), me.timeAxis.getEnd()];
            }

            schedulingView.setMode(mode);

            normalHeaderCt.removeAll(true);

            me.reconfigureBufferedRendering();

            switch (mode) {
                case 'horizontal':
                    me.configureHorizontalMode();
                    break;

                case 'vertical':
                    me.configureVerticalMode();
                    break;

                case 'weekview':
                    me.configureWeekViewMode();
                    break;
            }

            viewPresetArgs && me.setViewPreset.apply(me, viewPresetArgs);

            me.resumeRefresh(false);

            var splitter = me.getSplitter();

            if (splitter) {
                splitter.setVisible(mode === 'horizontal');
            }

            me.refreshViews(false);

            Ext.resumeLayouts(true);

            me.fireEvent('modechange', me, modeCfg);
        }
    },

    configureHorizontalMode : function () {
        var me             = this;
        var schedulingView = me.getSchedulingView();

        me.timeAxis.setMode('plain');

        me.removeCls(me.verticalCls).removeCls(me.weekviewCls).addCls(me.horizontalCls);

        me.setGroupingFeatureDisabled(false);

        me.mun(me.resourceStore, me.verticalListeners);
        me.mun(me.resourceStore, me.calendarResourceStoreListeners);
        me.normalGrid.un(me.calendarNormalGridListeners);

        schedulingView.setRowHeight(me.getRowHeight(), true);
        me.reconfigure(me.resourceStore, me.horizontalColumns);

        if (me.horizontalLockedWidth !== null) {
            me.lockedGrid.setWidth(me.horizontalLockedWidth);
        }

        var groupField = me.resourceStore.groupField;
        if (groupField) {
            me.store.group(groupField);
        }

        // remove listeners to avoid refreshing weekview columns using wrong presets
        me.mun(me.timeAxis, me.calendarListeners);
    },

    configureVerticalMode : function () {
        var me             = this;
        var schedulingView = me.getSchedulingView();

        me.removeCls(me.horizontalCls).removeCls(me.weekviewCls).addCls(me.verticalCls);

        me.setGroupingFeatureDisabled(true);

        me.normalGrid.un(me.calendarNormalGridListeners);
        me.mun(me.resourceStore, me.calendarResourceStoreListeners);

        var lockedWidth = 0;

        if (me.rendered) {
            me.horizontalLockedWidth = me.lockedGrid.getWidth();
        }

        me.mon(me.resourceStore, me.verticalListeners);

        me.bindGroupingFeatureListener();

        me.reconfigure(me.timeAxis, me.verticalColumns.concat(me.createResourceColumns(me.resourceColumnWidth || me.timeAxisViewModel.resourceColumnWidth)));

        Ext.Array.each(me.lockedGrid.query('gridcolumn'), function (col) {
            lockedWidth += col.rendered ? col.getWidth() : col.width || 100;
        });

        schedulingView.setColumnWidth(me.timeAxisViewModel.resourceColumnWidth || 100, true);

        me.lockedGrid.setWidth(lockedWidth);
    },

    configureWeekViewMode : function () {
        var me             = this;
        var normalGrid     = me.normalGrid,
            schedulingView = me.getSchedulingView();

        me.removeCls(me.horizontalCls).removeCls(me.verticalCls).addCls(me.weekviewCls);

        me.setGroupingFeatureDisabled(true);

        me.timeAxis.setMode('week');

        // TODO: we want to save time span of the axis and restore it upon switching back
        me.mun(me.resourceStore, me.verticalListeners);
        me.mon(me.resourceStore, me.calendarResourceStoreListeners);
        me.normalGrid.on(me.calendarNormalGridListeners);

        me.bindGroupingFeatureListener();

        me.refreshCalendarColumns();

        schedulingView.setRowHeight(me.getRowHeight(), true);
        schedulingView.setColumnWidth(me.timeAxisViewModel.weekViewColumnWidth || 100, true);

        me.mon(me.timeAxis, me.calendarListeners);
    },

    addDockedAllDayHeader : function() {
        var me = this;

        if (me.showAllDayHeader) {
            me.allDayLockedHeader = me.lockedGrid.addDocked({
                xtype  : 'component',
                dock   : 'top',
                cls    : [
                    'sch-all-day-locked-header',
                    Ext.baseCSSPrefix + 'unselectable'
                ],
                height : 24,
                weight : 100,
                html   : me.L('All day')
            })[0];

            me.allDayNormalHeader = me.normalGrid.addDocked({
                xtype               : 'alldayheader',
                height              : 24,
                weight              : 100,
                lockedHeaderPartner : me.allDayLockedHeader,
                eventSelModel       : me.eventSelModel && !me.eventSelModel.isSelectionModel ? me.eventSelModel : null,
                mainScheduler       : me
            })[0];
        }
    },

    destroyDockedAllDayHeader : function() {
        var me = this;

        if (me.allDayLockedHeader) {
            me.allDayLockedHeader.destroy();
            me.allDayNormalHeader.destroy();
            me.allDayLockedHeader = me.allDayNormalHeader = null;
        }
    },

    // Disable buffered rendering mechanism for non-horizontal views using the time axis as the row-backing store input
    // https://app.assembla.com/spaces/bryntum/tickets/2956-scroll-not-working-properly-when-time-increment---15/details#
    reconfigureBufferedRendering : function(initial) {
        var me = this;

        if (me.bufferedRenderer && me.rendered) {
            var lockedPlugin    = me.lockedGrid.bufferedRenderer,
                normalPlugin    = me.normalGrid.bufferedRenderer,
                value;

            if (!me.isHorizontal()) {
                value = me.timeAxis.getCount();

                me.__oldLeadingBufferZone = lockedPlugin.leadingBufferZone;

            } else if (me.__oldLeadingBufferZone){
                value = me.__oldLeadingBufferZone;
                me.__oldLeadingBufferZone = null;
            }

            if (!initial && lockedPlugin.scroller && lockedPlugin.scroller.getLockedScroller()) {
                // HACK, me cached size property must be cleared when our mode changes or when view size changes
                var height      = me.lockedGrid.view.getHeight(),
                    viewSize    = Math.ceil(height / lockedPlugin.rowHeight) + lockedPlugin.trailingBufferZone + value;

                // Pass true as a second argument to force new calculated value
                lockedPlugin.setViewSize(viewSize, true);
                normalPlugin.setViewSize(viewSize, true);
            }

            lockedPlugin.leadingBufferZone = normalPlugin.leadingBufferZone = value;
        }
    },

    createCalendarRows    : function () {
        var me      = this,
            rows    = me.timeAxis.getRowTicks();

        // we have to cache weekview rows amount to use it in timeAxisViewModel calculations
        me.timeAxisViewModel.calendarRowsAmount = rows.length;

        return new Ext.data.Store({
            model   : 'Sch.model.TimeAxisTick',
            data    : rows
        });
    },

    createCalendarColumns : function () {
        var me              = this,
            timeAxis        = me.timeAxis,
            currentHeader   = timeAxis.headerConfig.middle,
            columns         = [],
            lastDay;

        var startTime = me.startTime = timeAxis.startTime;
        var endTime = me.endTime = timeAxis.endTime;

        // iterate over ticks to find actual days in axis
        timeAxis.each(function (tick) {
            var start = tick.getStartDate();

            if (lastDay !== start.getDay()) {
                lastDay = start.getDay();

                start.setHours(startTime);
                var end = new Date(start);
                end.setHours(endTime);

                var header = {
                    xclass      : me.weekViewColumnClass,
                    renderer    : me.mainRenderer,
                    scope       : me,
                    start       : start,
                    end         : end
                };

                if (currentHeader.renderer) {
                    header.text = currentHeader.renderer.call(currentHeader.scope || me, start, end, header, columns.length, me.getEventStore());
                } else {
                    header.text = Ext.Date.format(start, currentHeader.dateFormat);
                }

                columns.push(header);
            }
        });

        me.timeAxisViewModel.updateCalendarColumnDates(columns);

        return columns;
    },

    onNormalViewItemUpdate : function (record) {
        if (this.lockedGridDependsOnSchedule) {
            var lockedView = this.lockedGrid.getView();

            lockedView.suspendEvents();
            // we cannot trust 'index' argument it may be wrong in case of grouping feature enabled
            lockedView.refreshNode(lockedView.indexOf(record));
            // Locked rowheight not properly updated when syncRowHeights is true and adding an overlapping event
            if (this.syncRowHeight) {
                this.syncRowHeights();
            }
            lockedView.resumeEvents();
        }
    },

    onLockedViewResize : function (cmp, width, height, oldWidth, oldHeight) {
        if (!this.isHorizontal() && height !== oldHeight) {
            // Grab the full height of the view, minus the spacer el height and an extra buffer
            this.timeAxisViewModel.update(height - 21);
        }
    },

    // onNormalViewResize : function (view, width, height, oldWidth, oldHeight) {
    //     if (this.isWeekView() && oldWidth !== width) {
    //         var columns = view.headerCt.getGridColumns(),
    //             colWidth   = Math.floor(width / columns.length) - Ext.getScrollbarSize().width;
    //
    //         this.suspendLayouts();
    //         columns.forEach(function (col) {
    //             col.setWidth(colWidth);
    //         });
    //         this.resumeLayouts(true);
    //     }
    // },
    /**
     * Sets the row height of the timeline panel
     * @param {Number} height The height to set
     * @param {Boolean} preventRefresh `true` to prevent view refresh
     */
    setRowHeight: function (height, preventRefresh) {
        // Prevent any side effects if the panel is not yet done initializing
        preventRefresh = preventRefresh || !this.lockedGrid;

        this.readRowHeightFromPreset    = false;

        this.timeAxisViewModel.setViewRowHeight(height, preventRefresh);
    },

    handleTimelineKeyEvent : function (e) {
        var me = this,
            view = me.getSchedulingView(),
            sm = view.getEventSelectionModel(),
            selection = sm.getSelection();

        // Take last selected event (it would be focused normally) and fire eventkeydown for it
        if (selection.length) {
            view.fireEvent(view.scheduledEventName + e.type, view, selection.pop(), e);
        }
    },

    handleTimelineEventClick : function (view, eventRecord, e) {
        // When event element is clicked, focus normal view. It shouldn't scroll anything and would allow to simulate
        // eventkeydown using event selection (see above)
        if (Ext.isIE11) {
            this.normalGrid.el.focus();
        } else {
            view.getNavigationModel().setPosition(view.getRecord(e.getTarget(view.itemSelector)), 0);
            view.el.focus();
        }
    }
});
