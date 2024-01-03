/**
 * @class Sch.mixin.TimelinePanel
 * @extends Sch.mixin.AbstractTimelinePanel
 *
 * A base mixin for {@link Ext.panel.Panel} classes,
 * giving to the consuming panel the "time line" functionality.
 * This means that the panel will be capabale to display a list of "events",
 * ordered on the {@link Sch.data.TimeAxis time axis}.
 *
 * Generally, should not be used directly, if you need to subclass the scheduler panel,
 * subclass the {@link Sch.panel.SchedulerGrid} or {@link Sch.panel.SchedulerTree} instead.
 */
Ext.define('Sch.mixin.TimelinePanel', {
    extend : 'Sch.mixin.AbstractTimelinePanel',

    requires : [
        'Sch.column.timeAxis.Horizontal',
        'Sch.preset.Manager',
        'Sch.data.Calendar',
        'Sch.plugin.CurrentTimeLine',
        'Sch.layout.TableLayout',
        'Sch.patches.LockingScroller',
        'Sch.plugin.NonWorkingTime',

        // for Sencha Cmd in production mode
        'Ext.grid.plugin.BufferedRenderer'
    ],

    uses : [
        'Ext.layout.container.Border',
        'Sch.patches.TablePanel_6_2_1',
        'Sch.patches.TableView',
        'Sch.patches.BufferedRenderer',
        'Sch.patches.BufferedRenderer_6_2_1',
        'Sch.patches.BufferedRendererResize',
        'Sch.patches.CellContext',
        'Sch.patches.TimelineGridView',
        'Sch.patches.TimelineGridViewScroll6_2',
        'Sch.patches.TimelinePanel',
        'Sch.patches.TouchAction',
        'Sch.plugin.NonWorkingTime'
    ],

    mixins : [
        'Sch.mixin.Zoomable',
        'Sch.mixin.PartnerTimelinePanel'
    ],

    /**
     *  @cfg {Boolean} destroyStores True to delete all stores used by this component when it's destroyed (including the global CalendarManager)
     */
    destroyStores : false,

    /**
     * @cfg {Object} lockedGridConfig A custom config object used to initialize the left (locked) grid panel.
     */

    /**
     * @cfg {Object} schedulerConfig A custom config object used to initialize the right (schedule) grid panel.
     */

    /**
     * @cfg {String/Ext.Template} tooltipTpl
     * Template used to show a tooltip over a scheduled item, null by default (meaning no tooltip). The tooltip will be populated with the data in
     * record corresponding to the hovered element. See also {@link #tipCfg} and to provide your own custom data object for this
     * template, please see {@link Sch.mixin.TimelineView#getDataForTooltipTpl}.
     */

    /**
     * @cfg {Sch.mixin.TimelinePanel/String} partnerTimelinePanel A reference to another timeline panel (or a component id) that this panel should be 'partner' with.
     * If this config is supplied, this panel will:
     *
     * - Share and use the {@link Sch.data.TimeAxis} timeAxis from the partner panel.
     * - Synchronize the width of the two locked grid panels (after a drag of the splitter).
     * - Synchronize horizontal scrolling between two panels.
     */

    /**
     * @cfg {Number} bufferCoef
     *
     * This config defines the width of the left and right invisible parts of the timespan when {@link #infiniteScroll} set to `true`.
     *
     * It should be provided as a coefficient, which will be multiplied by the width of the scheduling area.
     *
     * For example, if `bufferCoef` is `5` and the panel view width is 200px then the timespan will be calculated to
     * have approximately 1000px (`5 * 200`) to the left and 1000px to the right of the visible area, resulting
     * in 2200px of totally rendered content.
     *
     * The timespan gets recalculated when the scroll position reaches the limits defined by the {@link #bufferThreshold} option.
     *
     */
    bufferCoef : 5,

    /**
     * @cfg {Number} bufferThreshold
     *
     * This config defines the horizontal scroll limit, which, when exceeded will cause a timespan shift.
     * The limit is calculated as the `panelWidth * {@link #bufferCoef} * bufferThreshold`. During scrolling, if the left or right side
     * has less than that of the rendered content - a shift is triggered.
     *
     * For example if `bufferCoef` is `5` and the panel view width is 200px and `bufferThreshold` is 0.2, then the timespan
     * will be shifted when the left or right side has less than 200px (5 * 200 * 0.2) of content.
     */
    bufferThreshold : 0.2,

    /**
     * @cfg {Boolean} infiniteScroll
     *
     * True to automatically adjust the panel timespan during horizontal scrolling, when the scroller comes close to the left/right edges.
     *
     * The actually rendered timespan in this mode (and thus the amount of HTML in the DOM) is calculated based
     * on the {@link #bufferCoef} option. The moment when the timespan shift happens is determined by the {@link #bufferThreshold} value.
     */
    infiniteScroll : false,

    /**
     * @cfg {Boolean} showCrudManagerMask set this to true to display a load mask during CRUD manager server requests. Note: works only if {@link #crudManager} is specified.
     */
    showCrudManagerMask : true,

    /**
     * @cfg {Boolean} highlightWeekends
     * True (default) to highlight weekends and holidays, using the {@link Sch.plugin.NonWorkingTime} plugin.
     */
    highlightWeekends   : false,

    /**
     * @cfg {Boolean} zoomOnTimeAxisDoubleClick
     * True to zoom to time span when double clicking a time axis cell.
     */
    zoomOnTimeAxisDoubleClick   : true,

    // that's to say a zoom in the week view
    switchToDayViewOnWeekDayHeaderDblClick : true,
    waitingForAutoTimeSpan                 : false,

    /**
     * @cfg {Boolean} showTodayLine
     * True to show a line indicating current time.
     */
    showTodayLine               : false,

    /**
     * @cfg {Sch.data.Calendar} calendar a {@link Sch.data.Calendar calendar} instance for this timeline panel.
     */
    calendar                    : null,

    /**
     * @cfg {String} horizontalTimeAxisColumnCfg
     *
     * Horizontal time axis column config
     *
     * @private
     */
    horizontalTimeAxisColumnCfg : null,

    columnLinesFeature : null,

    renderWaitListener : null,

    enablePinchZoom            : true,
    schedulePinchThreshold     : 30,
    pinchStartDistanceX        : null,
    pinchStartDistanceY        : null,
    pinchDistanceX             : null,
    pinchDistanceY             : null,
    horizontalColumns          : null,
    forceDefineTimeSpanByStore : false,
    workingTimePlugin          : null,

    // Split the left / right grid and add a draggable splitter
    split : true,

    /**
     * @property {Number} refreshSuspensionCount Increased on calls to suspendRefresh, decreased on resumeRefresh
     * @private
     */
    refreshSuspensionCount : 0,

    /**
     * @cfg {Object} tipCfg
     * The {@link Ext.Tooltip} config object used to configure a tooltip (only applicable if tooltipTpl is set).
     */
    tipCfg : {
        cls : 'sch-tip',

        showDelay : 400,
        hideDelay : 0,
        constrain : true,
        autoHide : true,
        anchor   : 't'
    },

    /**
     * @event timeheaderclick
     * Fires after a click on a time header cell
     * @param {Sch.view.HorizontalTimeAxis} column The column object
     * @param {Date} startDate The start date of the header cell
     * @param {Date} endDate The start date of the header cell
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event timeheaderdblclick
     * Fires after a double click on a time header cell
     * @param {Sch.view.HorizontalTimeAxis} column The column object
     * @param {Date} startDate The start date of the header cell
     * @param {Date} endDate The end date of the header cell
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event timeheadercontextmenu
     * Fires after a right click on a time header cell
     * @param {Sch.view.HorizontalTimeAxis} column The column object
     * @param {Date} startDate The start date of the header cell
     * @param {Date} endDate The start date of the header cell
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event scheduleclick
     * Fires after a click on the schedule area
     * @param {Sch.mixin.TimelinePanel} scheduler The scheduler object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event scheduledblclick
     * Fires after a doubleclick on the schedule area
     * @param {Sch.mixin.TimelinePanel} scheduler The scheduler object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event schedulecontextmenu
     * Fires after a context menu click on the schedule area
     * @param {Sch.mixin.TimelinePanel} scheduler The scheduler object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event schedulelongpress
     * Fires when a longpress on the schedule area
     * @param {Sch.mixin.SchedulerView} schedulerView The scheduler view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event schedulepinchstart
     * Fires after a click on the schedule area
     * @param {Sch.mixin.TimelinePanel} scheduler The scheduler object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event schedulepinch
     * Fires after a doubleclick on the schedule area
     * @param {Sch.mixin.TimelinePanel} scheduler The scheduler object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event schedulepinchend
     * Fires after a context menu click on the schedule area
     * @param {Sch.mixin.TimelinePanel} scheduler The scheduler object
     * @param {Date} clickedDate The pinched date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - loadingText : 'Loading, please wait...'
     - savingText : 'Saving changes, please wait...'
     */

    inheritables : function () {

        return {
            // Configuring underlying table panel
            columnLines   : true,
            enableLocking : true,
            lockable      : true,
            stateEvents   : ['viewchange'],
            syncRowHeight : false,

            // Without border layout splitter is hidden in view section and doesn't resize at all
            layout : 'border',

            // private
            initComponent : function () {

                if (this.partnerTimelinePanel) {

                    // Allow a cmp id to be passed in
                    if (typeof this.partnerTimelinePanel === 'string') {
                        this.partnerTimelinePanel = Ext.getCmp(this.partnerTimelinePanel);
                    }

                    this.timeAxisViewModel = this.partnerTimelinePanel.timeAxisViewModel;
                    this.timeAxis          = this.partnerTimelinePanel.getTimeAxis();
                    this.startDate         = this.timeAxis.getStart();
                    this.endDate           = this.timeAxis.getEnd();
                }

                this._initializeTimelinePanel();

                this.configureChildGrids();

                // Now the time axis view model is configured using the forceFit setting.
                // We never want the native Ext JS grid implementation of forceFit - disable it
                this.forceFit = false;

                this.configureColumns(this.columns);

                if (Ext.getVersion().equals('6.0.2.437')) {
                    this.viewConfig = Ext.apply(this.viewConfig || {}, {
                        componentLayout: 'timeline_tablelayout'
                    });
                }

                var viewConfig = this.normalViewConfig = this.normalViewConfig || {};
                var id = this.getId();

                // Copy some properties to the view instance
                Ext.apply(this.normalViewConfig, {
                    id                    : id + '-timelineview',
                    eventPrefix           : this.normalViewConfig.eventPrefix || (this.autoGenId ? null : id),
                    timeAxisViewModel     : this.timeAxisViewModel,
                    eventBorderWidth      : this.eventBorderWidth,
                    timeAxis              : this.timeAxis,
                    readOnly              : this.readOnly,
                    mode                  : this.mode,
                    rtl                   : this.rtl,
                    cellBorderWidth       : this.cellBorderWidth,
                    cellTopBorderWidth    : this.cellTopBorderWidth,
                    cellBottomBorderWidth : this.cellBottomBorderWidth,
                    infiniteScroll        : this.infiniteScroll,
                    bufferCoef            : this.bufferCoef,
                    bufferThreshold       : this.bufferThreshold
                });

                Ext.copy(viewConfig, this, [
                    "eventRendererScope",
                    "eventRenderer",
                    "dndValidatorFn",
                    "resizeValidatorFn",
                    "createValidatorFn",
                    "tooltipTpl",
                    "validatorFnScope",
                    "eventResizeHandles",
                    "enableEventDragDrop",
                    "enableDragCreation",
                    "createEventOnDblClick",
                    "resizeConfig",
                    "createConfig",
                    "tipCfg",
                    "getDateConstraints"
                ], true);

                this.callParent(arguments);

                this.lockedGrid.view.addCls('sch-lockedview');

                if (this.rtl) {
                    // Locked column in RTL positioned incorrectly by EXT
                    // https://www.sencha.com/forum/showthread.php?299582-RTL-locking-grid-bug
                    // https://www.sencha.com/forum/showthread.php?304826-Locked-column-content-is-misaligned-with-RTL-ext
                    this.lockedGrid.view.addCls('sch-locked-column-fixer');

                    this.addCls('sch-rtl');
                } else {
                    this.addCls('sch-ltr');
                }

                var plugins = this.plugins = [].concat(this.plugins || []);

                if (this.highlightWeekends) {
                    var calendar = this.getCalendar();

                    calendar = calendar && Ext.StoreMgr.lookup(calendar) || new Sch.data.Calendar();

                    this.workingTimePlugin = new Sch.plugin.NonWorkingTime({
                        calendar : calendar
                    });

                    this.timeAxisViewModel.setCalendar(calendar);

                    plugins.push(this.workingTimePlugin);

                    this.addCls('sch-timelinepanel-highlightweekends');
                }

                if (this.showTodayLine) {
                    this.todayLinePlugin = new Sch.plugin.CurrentTimeLine();
                    plugins.push(this.todayLinePlugin);
                }

                this.patchNavigationModel(this);

                if (Ext.supports.Touch) {
                    // During zooming operation header container sometimes cannot be scrolled to required position
                    // because touchscroller on header will return wrong size. Refresh it when header is updated
                    // https://www.assembla.com/spaces/bryntum/tickets/2690
                    // covered by several zooming tests on touch device
                    this.timeAxisViewModel.on('update', this.refreshHeaderContainerScrollable, this);
                }

                this.setViewPreset(this.viewPreset, this.startDate || this.timeAxis.getStart(), this.endDate || this.timeAxis.getEnd(), true);

                // if no start/end dates specified let's get them from event store
                if (!this.startDate) {
                    var crud = this.crudManager;

                    // If crud manager is provided, we should listen to it's loading status
                    if (crud && !crud.loaded) {
                        this.bindAutoTimeSpanListeners();
                    } else {
                        var store = this.getTimeSpanDefiningStore();

                        // if events already loaded
                        if (store.isTreeStore ? store.getRoot() && store.getRoot().childNodes.length : store.getCount()) {
                            this.applyStartEndDatesFromStore();

                            // if timespan defining store is in state of loading
                            // or forceDefineTimeSpanByStore enabled
                            // we wait till the store gets loaded and only then refresh view
                        } else if (store.isLoading() || this.forceDefineTimeSpanByStore) {
                            this.bindAutoTimeSpanListeners();
                        }
                    }
                }

                var columnLines = this.columnLines;

                if (columnLines) {
                    this.columnLinesFeature = new Sch.feature.ColumnLines(Ext.isObject(columnLines) ? columnLines : undefined);
                    this.columnLinesFeature.init(this);

                    this.columnLines = true;
                }

                this.relayEvents(this.getSchedulingView(), [
                /**
                 * @event beforetooltipshow
                 * @preventable
                 * Fires before the event tooltip is shown, return false to suppress it.
                 * @param {Sch.mixin.TimelinePanel} scheduler The scheduler object
                 * @param {Sch.model.Event} eventRecord The event record of the clicked record
                 */
                    'beforetooltipshow',

                    'scheduleclick',
                    'scheduledblclick',
                    'schedulecontextmenu',
                    'schedulelongpress',
                    'schedulepinch',
                    'schedulepinchstart',
                    'schedulepinchend'
                ]);

                // HACK, required since Ext has an async scroll sync mechanism setup which won't play nice with our "sync scroll" above.
                this.on('zoomchange', function () {
                    // After a zoom, the header is resized and Ext JS TablePanel reacts to the size change.
                    // Ext JS reacts after a short delay, so we cancel this task to prevent Ext from messing up the scroll sync
                    this.normalGrid.scrollTask.cancel();
                });


                if (this.crudManager) {
                    // if we have CrudManager instance assigned, we should show and hide a load mask
                    // But not with autoSync enabled, since that'll be a terrible user experience
                    if (!this.crudManager.autoSync && this.showCrudManagerMask) {
                        this.mon(this.crudManager, {
                            beforesend : this.beforeCrudOperationStart,

                            responseapplycancelled : this.onCrudOperationComplete,

                            synccanceled : this.onCrudOperationComplete,
                            loadcanceled : this.onCrudOperationComplete,
                            load         : this.onCrudOperationComplete,
                            sync         : this.onCrudOperationComplete,
                            requestfail  : this.onCrudOperationComplete,

                            scope : this
                        });

                        // User might already have triggered a load operation
                        if (this.crudManager.isLoading()) {
                            this.beforeCrudOperationStart(this.crudManager, null, 'load');
                        }
                    }

                    // prevent multiple refreshes on crud manager load
                    // #2494 - View is refreshed twice during crud manager load
                    this.mon(this.crudManager, {
                        beforeloadapply : this.onCrudBeforeLoad,
                        load            : this.onCrudLoad,
                        scope           : this
                    });
                }

                // Patching header/grid horizontal scroll position synchronization for Mac
                // though it might depend on floating scrollbars (which are mostly used on Mac)
                if (Ext.isMac) {
                    this.patchHeaderScrollSync(this);
                }

                this.afterInitComponent();
            },

            refreshHeaderContainerScrollable : function () {
                var scrollable = this.getSchedulingView().headerCt.getScrollable();

                // If panel is not yet rendered there is no scrollable
                if (!scrollable) return;

                if (Ext.getVersion().isLessThan('6.0.1')) {
                    var old = scrollable.isConfiguring;
                    // Without this hack view will continuously scroll to 0 and reconfigure until exception is raised
                    scrollable.isConfiguring = true;
                    // Refresh current scrollable size or it will constrain requested scroll
                    scrollable.refresh();
                    // This call will update max position for scrollable, if we don't do that, header won't be
                    // scrollable anymore
                    scrollable.refreshAxes();
                    scrollable.isConfiguring = old;
                } else {
                    scrollable.refresh();
                }
            },

            getState : function () {
                var me    = this,
                    state = me.callParent(arguments);

                Ext.apply(state, {
                    viewPreset       : me.viewPreset,
                    startDate        : me.getStart(),
                    endDate          : me.getEnd(),
                    zoomMinLevel     : me.zoomMinLevel,
                    zoomMaxLevel     : me.zoomMaxLevel,
                    currentZoomLevel : me.currentZoomLevel
                });
                return state;
            },

            applyState : function (state) {
                var me = this;

                me.callParent(arguments);

                if (state && state.viewPreset) {
                    me.setViewPreset(state.viewPreset, state.startDate, state.endDate);
                }
                if (state && state.currentZoomLevel) {
                    me.zoomToLevel(state.currentZoomLevel);
                }
            },

            setTimeSpan : function () {
                this.callParent(arguments);

                if (this.waitingForAutoTimeSpan) {
                    // we pass false to not refresh views inside of unbindAutoTimeSpanListeners()
                    // since we do it manually in the next line
                    this.unbindAutoTimeSpanListeners(false);
                    // If we unbind autotimespan listeners, that means refresh was prevented
                    // and now it's required. Normally it would be called inside 'callParent', but
                    // in 5.1.1 that call produces layout issue. This action seem to be similar
                    this.getView().refresh();
                }

                // if view was not initialized due to our refresh stopper the onTimeAxisViewModelUpdate method will not do a refresh
                // if that happened we do refresh manually
                if (!this.normalGrid.getView().viewReady) {
                    this.getView().refresh();
                }
            },


            onBoxReady : function () {
                var me = this;

                me.callParent(arguments);

                if (me.partnerTimelinePanel) {
                    if (me.partnerTimelinePanel.rendered) {
                        me.setupPartnerTimelinePanel(me.partnerTimelinePanel);
                    } else {
                        me.partnerTimelinePanel.on('boxready', me.setupPartnerTimelinePanel, me);
                    }
                }

                me.normalGrid.on({
                    collapse : me.onNormalGridCollapse,
                    expand   : me.onNormalGridExpand,
                    scope    : me
                });

                me.normalGrid.headerCt.el.on({
                    click       : me.onHeaderClick,
                    dblclick    : me.onHeaderClick,
                    contextmenu : me.onHeaderClick,
                    delegate    : '.sch-daycolumn-header',
                    scope       : me
                });

                me.lockedGrid.on({
                    collapse : me.onLockedGridCollapse,
                    expand   : me.onLockedGridExpand,
                    scope    : me
                });

                me.lockedGrid.on({
                    itemdblclick : me.onLockedGridItemDblClick,
                    scope        : me
                });

                if (me.enablePinchZoom && Ext.supports.Touch) {
                    this.getSchedulingView().on({
                        schedulepinchstart : this.onSchedulePinchStart,
                        schedulepinch      : this.onSchedulePinch,
                        schedulepinchend   : this.onSchedulePinchEnd,
                        scope              : this
                    });
                }
            }
        };
    },

    scrollToDate: function (date, animate) {
        var view = this.getSchedulingView();
        if (view.isWeekView()) {
            var column = view.weekview.getColumnsBy(function (column) {
                return column.start <= date && column.end > date;
            })[0];

            if (column) {
                view.scrollHorizontallyTo(column.getLocalX());
                view.scrollVerticallyTo(view.getCoordinateFromDate(date, true));
            }
        } else {
            return this.callParent(arguments);
        }
    },

    bindAutoTimeSpanListeners : function () {
        var store = this.getTimeSpanDefiningStore();

        this.waitingForAutoTimeSpan = true;

        // prevent panel refresh till eventStore gets loaded
        //this.suspendViewsRefresh();
        this.suspendRefresh();

        this.mon(store, 'load', this.applyStartEndDatesFromStore, this);

        if (store.isTreeStore) {
            this.mon(store, 'rootchange', this.applyStartEndDatesFromStore, this);
            this.mon(store, 'nodeappend', this.applyStartEndDatesAfterTreeAppend, this);
        } else {
            this.mon(store, 'add', this.applyStartEndDatesFromStore, this);
        }
    },

    getTimeSpanDefiningStore : function () {
        throw "Abstract method called";
    },

    unbindAutoTimeSpanListeners : function (doRefresh) {
        this.waitingForAutoTimeSpan = false;

        var store = this.getTimeSpanDefiningStore();

        // allow panel refresh back
        //this.resumeViewsRefresh(doRefresh);
        this.resumeRefresh(doRefresh);

        // unbind listener
        store.un('load', this.applyStartEndDatesFromStore, this);

        if (store.isTreeStore) {
            store.un('rootchange', this.applyStartEndDatesFromStore, this);
            store.un('nodeappend', this.applyStartEndDatesAfterTreeAppend, this);
        } else {
            store.un('add', this.applyStartEndDatesFromStore, this);
        }
    },


    applyStartEndDatesAfterTreeAppend : function () {
        var store = this.getTimeSpanDefiningStore();

        // Need to block the reading of the total store timespan until the store is done loading
        // With CRUD manager, we need the __loading flag since multiple append events are fired during load
        if (!store.isSettingRoot && !store.__loading) {
            this.applyStartEndDatesFromStore();
        }
    },


    applyStartEndDatesFromStore : function () {
        var store = this.getTimeSpanDefiningStore();
        var span  = store.getTotalTimeSpan();

        // If event store contains events without duration, add a 1 mainUnit buffer to each side
        if (span.end && span.start && span.end - span.start === 0) {
            span.start = Sch.util.Date.add(span.start, this.timeAxis.mainUnit, -1);
            span.end   = Sch.util.Date.add(span.end, this.timeAxis.mainUnit, 1);
        }

        this.setTimeSpan(span.start || new Date(), span.end);
    },


    onLockedGridItemDblClick : function (grid, record, el, rowIndex, event) {
        if (this.isVertical() && record) {
            this.fireEvent('timeheaderdblclick', this, record.get('start'), record.get('end'), rowIndex, event);
        }
    },

    onHeaderClick : function (event, t) {
        var columnEl = event.getTarget('.' + Ext.baseCSSPrefix + 'column-header');
        var index    = [].indexOf.call(columnEl.parentElement.childNodes, columnEl);
        var column   = this.normalGrid.getColumns()[ index ];

        if (Sch.column.Day && column instanceof Sch.column.Day) {
            var start = column.start;
            var end   = column.end;

            this.fireEvent('timeheader' + event.type, this, start, end, event);

            if (event.type === 'dblclick' && this.switchToDayViewOnWeekDayHeaderDblClick) {
                this.setViewPreset('day', start);
            }
        }
    },

    /**
     * Returns the view which renders the schedule and time columns. This method should be used instead of the usual `getView`,
     * since `getView` will return an instance of a special "locking" grid view, which has no scheduler-specific features.
     *
     * @return {Sch.mixin.SchedulerView} view A view implementing the {@link Sch.mixin.SchedulerView} mixin
     */
    getSchedulingView : function () {
        return this.normalGrid && this.normalGrid.view;
    },

    getHorizontalTimeAxisColumn : function () {
        var view = this.getSchedulingView();

        return view && view.getHorizontalTimeAxisColumn();
    },

    configureColumns : function (columns) {
        var lockedColumns = [];
        var normalColumns = [];

        columns       = columns || [];

        // The 'columns' config can also be a config object for Ext.grid.header.Container
        if (columns.items) {
            // If columns config not specified, this.columns will be taken from prototype and following code will change
            // it. Covered by 1114_memory and 1109_orientation
            this.columns = Ext.apply({}, this.columns);
            // Clone it to make sure we handle the case of a column array object put on the class prototype
            columns = this.columns.items = columns.items.slice();
        } else {
            // Clone it to make sure we handle the case of a column array object put on the class prototype
            columns = this.columns = columns.slice();
        }

        // Split locked and normal columns first
        Ext.Array.each(columns, function (column) {
            if (column.position === 'right' || column.locked === false) {
                if (!Ext.isNumber(column.width)) {
                    Ext.Error.raise('"Right" columns must have a fixed width');
                }
                column.locked = false;

                normalColumns.push(column);
            } else {
                column.locked = true;

                lockedColumns.push(column);
            }

            column.lockable = false;
        });

        // No splitter if there are no locked columns
        if (columns.length === 0) {
            this.split = false;
        }

        Ext.Array.erase(columns, 0, columns.length);
        Ext.Array.insert(columns, 0, lockedColumns.concat(Ext.apply({
            xtype             : 'timeaxiscolumn',
            timeAxisViewModel : this.timeAxisViewModel,
            trackHeaderOver   : this.trackHeaderOver,
            renderer          : this.mainRenderer,
            variableRowHeight : this.variableRowHeight,
            scope             : this
        }, this.horizontalTimeAxisColumnCfg || {})).concat(normalColumns));

        // Save reference to original set of columns
        this.horizontalColumns = columns.slice();
    },


    mainRenderer : function (val, meta, rowRecord, rowIndex, colIndex) {
        var renderers = this.renderers,
            resource  = this.isVertical() ? this.getResourceStore().getAt(colIndex) : rowRecord,
            retVal    = '&nbsp;'; // To ensure cells always consume correct height

        // Ext doesn't clear the meta object between cells
        meta.rowHeight = null;

        for (var i = 0; i < renderers.length; i++) {
            retVal += renderers[i].fn.call(renderers[i].scope || this, val, meta, resource, rowIndex, colIndex) || '';
        }

        if (this.variableRowHeight) {
            // Set row height
            var view = this.getSchedulingView();
            var rowHeight = meta.rowHeight || this.getRowHeight();

            if (view.isHorizontal()) {
                // 1 px for row top border width
                rowHeight += view.cellTopBorderWidth + view.cellBottomBorderWidth - (view.allDay ? 0 : 1);
            }
            else {
                // subtract 1px for cell top border, defined in Sch/view/Vertical.scss
                // see Sch.column.timeaxis.Vertical
                rowHeight -= 1;
            }

            meta.style = 'height:' + rowHeight + 'px';
        }

        return retVal;
    },

    onNormalGridCollapse : function () {
        var me = this;

        // Hack for Gantt to prevent creating second expander when normal grid initially collapsed
        if (!me.normalGrid.reExpander) {
            me.normalGrid.reExpander = me.normalGrid.placeholder;
        }

        if (!me.lockedGrid.rendered) {
            me.lockedGrid.on('render', me.onNormalGridCollapse, me, { delay : 1 });
        } else {
            me.lockedGrid.savedWidth = me.lockedGrid.getWidth();

            if (me.lockedGrid.collapsed) {
                me.lockedGrid.expand();
            }

            me.lockedGrid.setWidth(me.getWidth() - me.normalGrid.getPlaceholder().getWidth());

            // Show a vertical scrollbar in locked grid if normal grid is collapsed
            me.addCls('sch-normalgrid-collapsed');
        }
    },


    onNormalGridExpand : function () {
        this.removeCls('sch-normalgrid-collapsed');

    },

    onLockedGridCollapse : function() {
        var me = this;

        if (me.normalGrid.collapsed) {
            me.normalGrid.expand();
        }
    },

    onLockedGridExpand : function() {
        if (this.lockedGrid.savedWidth) {
            this.lockedGrid.setWidth(this.lockedGrid.savedWidth);
        }
    },


    beforeCrudOperationStart : function (manager, params, type) {
        if (this.rendered) {
            this.setLoading({
                msg : type === 'load' ? this.L('loadingText') : this.L('savingText')
            });
        } else {
            Ext.destroy(this.renderWaitListener);
            this.renderWaitListener = this.on('render', Ext.Function.bind(this.beforeCrudOperationStart, this, Array.prototype.slice.apply(arguments)), this, {
                delay       : 1,
                destroyable : true
            });
        }
    },

    onCrudBeforeLoad : function () {
        //this.suspendViewsRefresh();
        this.suspendRefresh();
    },

    onCrudLoad : function () {
        //this.resumeViewsRefresh();
        this.resumeRefresh(true);
    },

    onCrudOperationComplete : function () {
        Ext.destroy(this.renderWaitListener);

        this.setLoading(false);
    },

    onSchedulePinchStart : function (view, e) {
        this.pinchStartDistanceX = Math.abs(e.touches[0].pageX - e.touches[1].pageX);
        this.pinchStartDistanceY = Math.abs(e.touches[0].pageY - e.touches[1].pageY);
    },

    onSchedulePinch : function (view, e) {
        this.pinchDistanceX = Math.abs(e.touches[0].pageX - e.touches[1].pageX);
        this.pinchDistanceY = Math.abs(e.touches[0].pageY - e.touches[1].pageY);
    },

    onSchedulePinchEnd : function (view) {
        var xDistance    = this.pinchDistanceX;
        var yDistance    = this.pinchDistanceY;
        var isHorizontal = this.isHorizontal();

        if (Math.abs(xDistance - this.pinchStartDistanceX) > this.schedulePinchThreshold) {
            var scaleX = Math.abs(xDistance / this.pinchStartDistanceX);

            if (isHorizontal) {
                scaleX > 1 ? this.zoomIn() : this.zoomOut();
            } else {
                this.timeAxisViewModel.setViewColumnWidth(scaleX * this.timeAxisViewModel.resourceColumnWidth);
            }
        }

        if (Math.abs(yDistance - this.pinchStartDistanceY) > this.schedulePinchThreshold) {
            var scaleY = Math.abs(yDistance / this.pinchStartDistanceY);

            view.setRowHeight(view.getRowHeight() * scaleY);
        }

        this.pinchStartDistanceX = this.pinchStartDistanceY = this.pinchDistanceX = this.pinchDistanceY = null;
    },

    // Patches navigation model to skip undesired programmatic row focusing if timeline row is about to be focused.
    // This prevents timeline view scrolling to the top/left when clicking a non-focused timeline view row.
    // https://www.assembla.com/spaces/bryntum/tickets/1795
    // https://app.assembla.com/spaces/bryntum/tickets/5073
    // Test 'View should reset scroll when clicking empty area' in tests/view/2101_view.t.js
    patchNavigationModel : function (me) {
        me.getView().getNavigationModel().focusItem = function (item) {
            var scrollable = this.view.getScrollable();

            // See comment in Sch.patches.Scroller_7_3
            var scroller = scrollable.getLockingScroller && scrollable.getLockingScroller();

            if (scroller && scroller.isScrolling) {
                return null;
            }
            else {
                item.addCls(this.focusCls);

                if (((Ext.isIE || Ext.isEdge) && !item.hasCls('sch-timetd')) || // For IE, avoid focus when clicking on any schedule cell
                    (!(Ext.isIE || Ext.isEdge) && me.isHorizontal())) // For non-IE: in vertical or weekview, skip scroll to top
                {
                    item.focus();
                }
            }
        };

        // https://www.sencha.com/forum/showthread.php?301110
        var lockedView = me.lockedGrid.getView();
        var normalView = me.normalGrid.getView();

        lockedView.on('rowclick', function (view, record, tr, rowIndex) {
            if (normalView.lastFocused) {
                normalView.lastFocused.rowIdx = rowIndex;
                normalView.lastFocused.record = record;
            } else if (Ext.isIE) {
                normalView.lastFocused = this.lastFocused;
            }
        });

        normalView.on('rowclick', function (view, record, tr, rowIndex) {
            if (lockedView.lastFocused) {
                lockedView.lastFocused.rowIdx = rowIndex;
                lockedView.lastFocused.record = record;
            } else if (Ext.isIE) {
                lockedView.lastFocused = this.lastFocused;
            }
        });
    },

    patchHeaderScrollSync : function(me) {

        function sync () {
            var targetGrid = (me.normalGrid || me),
                headerCt   = targetGrid.getHeaderContainer();

            // Target grid may not have a header if 'hideHeaders' is true.
            // targetGrid.getHeaderContainer() always returns a container, no matter it's visible or not,
            // but in case 'hideHeaders' is true the height of this container is equal to 0 and 'scrollable' is null.
            if (me.rendered && headerCt && headerCt.getScrollable()) {
                headerCt.getScrollable().syncWithPartners();
            }
        }

        function patch() {
            me.patchHeaderScrollSyncDetacher && Ext.destroy(me.patchHeaderScrollSyncDetacher);

            me.patchHeaderScrollSyncDetacher = me.store && me.mon(me.store, {
                'nodeexpand'   : sync,
                'nodecollapse' : sync,
                buffer         : 1,
                destroyable    : true
            });
        }

        patch();

        me.on('storechange', patch);
    },

    configureChildGrids : function () {
        var me = this;

        // Make local copies of these configs in case someone puts them on the prototype of a subclass.
        me.lockedGridConfig = Ext.apply({}, me.lockedGridConfig || {});
        me.normalGridConfig = Ext.apply({}, me.schedulerConfig || me.normalGridConfig || {});

        var lockedGrid = me.lockedGridConfig,
            normalGrid = me.normalGridConfig;

        if (me.lockedXType) {
            lockedGrid.xtype = me.lockedXType;
        }

        if (me.normalXType) {
            normalGrid.xtype = me.normalXType;
        }

        // Configure the child grids
        Ext.applyIf(lockedGrid, {
            useArrows         : true,
            animCollapse      : false,
            collapseDirection : 'left',
            trackMouseOver    : false
        });

        Ext.applyIf(normalGrid, {
            viewType           : me.viewType,

            enableColumnMove   : false,
            enableColumnResize : false,
            enableColumnHide   : false,
            trackMouseOver     : false,

            collapseDirection : 'right',
            collapseMode      : 'placeholder',

            animCollapse : false
        });

        if (me.isVertical()) {
            lockedGrid.store = normalGrid.store = me.timeAxis;
        }

        if (lockedGrid.width) {
            // User has specified a fixed width for the locked section, disable the syncLockedWidth method
            me.syncLockedWidth = Ext.emptyFn;
            // Enable scrollbars for locked section
            lockedGrid.scroll        = Ext.supports.Touch ? 'both' : 'horizontal';
            lockedGrid.scrollerOwner = true;
        }
    },

    afterInitComponent : function () {
        var me = this;

        var lockedView = me.lockedGrid.getView();
        var normalView = me.normalGrid.getView();
        var isTree     = me.store && me.store.isTreeStore;

        if (me.normalGrid.collapsed) {
            // Need to workaround this, child grids cannot be collapsed initially
            me.normalGrid.collapsed = false;

            // Note, for the case of buffered view/store we need to wait for the view box to be ready before collapsing
            // since the paging scrollbar reads the view height during setup. When collapsing too soon, its viewSize will be 0.
            normalView.on('boxready', function () {
                me.normalGrid.collapse();
            }, me, { delay : 10 });
        }

        if (me.lockedGrid.collapsed) {
            // Need to workaround this, child grids cannot be collapsed initially
            me.lockedGrid.collapsed = false;

            // Note, for the case of buffered view/store we need to wait for the view box to be ready before collapsing
            // since the paging scrollbar reads the view height during setup. When collapsing too soon, its viewSize will be 0.
            lockedView.on('boxready', function () {
                me.lockedGrid.collapse();
            }, me, { delay : 10 });

            if (lockedView.bufferedRenderer) lockedView.bufferedRenderer.disabled = true;
        }

        if (isTree) {
            this.setupLockableFilterableTree();
        }

        var splitter = this.getSplitter();

        if (splitter) {
            splitter.addCls('sch-timelinepanel-splitter');

            splitter.setVisible(this.isHorizontal());
        }

        // In Ext JS 6.2.0+ we manually make sure a click in a time cell selects the containing row
        if (Ext.versions.extjs.isGreaterThan('6.2.0')) {
            this.normalGrid.on('cellclick', this.onNormalGridCellClick, this);
        }

        if (this.zoomOnTimeAxisDoubleClick) {
            this.on('timeheaderdblclick', function (me, tickStart, tickEnd) {
                if (this.isHorizontal()) {
                    this.zoomToSpan({
                        start : tickStart,
                        end   : tickEnd
                    });
                }
            });
        }
    },

    // In Ext JS 6.2.0+ we manually make sure a click in a time cell selects the containing row
    onNormalGridCellClick : function(panel , td , cellIndex , record , tr , rowIndex , e) {
        if (td.className.match('sch-timetd')) {
            var selectionModel = this.getSelectionModel();
            var deselect = e.ctrlKey && selectionModel.isSelected(record);

            if (deselect) {
                selectionModel.deselect(record);
            } else {
                selectionModel.select(record, e.ctrlKey);
            }
        }
    },

    getSplitter : function() {
        return this.child('splitter');
    },

    setupLockableFilterableTree : function () {
        var me         = this;
        var lockedView = me.lockedGrid.getView();

        // enable filtering support for trees
        var filterableProto = Sch.mixin.FilterableTreeView.prototype;

        lockedView.initTreeFiltering   = filterableProto.initTreeFiltering;
        lockedView.onFilterChangeStart = filterableProto.onFilterChangeStart;
        lockedView.onFilterChangeEnd   = filterableProto.onFilterChangeEnd;
        lockedView.onFilterCleared     = filterableProto.onFilterCleared;
        lockedView.onFilterSet         = filterableProto.onFilterSet;

        lockedView.initTreeFiltering();
    },

    showMenuBy : function (t, header) {
        var menu       = this.getMenu(),
            unlockItem = menu.down('#unlockItem'),
            lockItem   = menu.down('#lockItem'),
            sep        = unlockItem.prev();

        sep.hide();
        unlockItem.hide();
        lockItem.hide();
    },

    /**
     * Changes the timeframe of the scheduling chart to fit all the events in it.
     * @param {Object} [options] Options object for the zooming operation.
     * @param {Number} [options.leftMargin] Defines margin in pixel between the first event start date and first visible date
     * @param {Number} [options.rightMargin] Defines margin in pixel between the last event end date and last visible date
     */
    zoomToFit : function (options) {
        options = Ext.apply({
            adjustStart : 1,
            adjustEnd   : 1
        }, options);

        var eventStore = this.getEventStore();
        var span       = this.getEventStore().getTotalTimeSpan();

        if (this.zoomToSpan(span, options) === null) {
            // if no zooming was performed - fit columns to view space
            this.getSchedulingView().fitColumns();
        }
    },

    refreshViews : function (keepScrollPosition) {
        if (!this.rendered) return;

        var refreshed              = false;
        var schedulingViewListener = function () {
            refreshed = true;
        };
        var schedulingView         = this.normalGrid.getView();
        var lockedView             = this.lockedGrid.getView(),
            scroll                 = {
                left : lockedView.getScrollX(),
                top  : schedulingView.getVerticalScroll()
            };

        schedulingView.on('refresh', schedulingViewListener);
        lockedView.refreshView(); // this could trigger a normal view refresh, out of our control
        schedulingView.un('refresh', schedulingViewListener);

        if (keepScrollPosition !== false) {
            !refreshed && this.getSchedulingView().refreshKeepingScroll();

            lockedView.setScrollX(scroll.left);
            lockedView.setScrollY(scroll.top);
        } else if (!refreshed){
            this.getSchedulingView().refreshView();
        }
    },

    getCalendar : function() {
        return this.calendar;
    },

    /**
     * Toggles the weekend highlighting on or off
     * @param {Boolean} disabled
     */
    disableWeekendHighlighting : function (disabled) {
        this.workingTimePlugin.setDisabled(disabled);

        if (disabled) {
            this.removeCls('sch-timelinepanel-highlightweekends');
        } else {
            this.addCls('sch-timelinepanel-highlightweekends');
        }
    },

    preventRefresh: function() {
        return false;
    },

    /**
     * Prevents the underlying view from being refreshed, until resumeRefresh() is called.
     * Multiple calls of suspendRefresh() requires the same amount of calls of resumeRefresh().
     */
    suspendRefresh : function() {
        var me = this;
        if (me.refreshSuspensionCount++ === 0) {
            // prevent refresh calls
            me.getView().on('beforerefresh', me.preventRefresh, me);
            // prevent low level refreshView calls (e.g. from refreshKeepingScroll)
            me.normalGrid.view.blockRefresh = true;
            me.lockedGrid.view.blockRefresh = true;
        }
    },

    /**
     * Allows the underlying view the be refreshed again, after being suspended with suspendRefresh().
     * @param triggerRefresh true to also call view.refresh()
     */
    resumeRefresh: function(triggerRefresh) {
        var me = this;
        if (me.refreshSuspensionCount && !--me.refreshSuspensionCount) {
            me.getView().un('beforerefresh', me.preventRefresh, me);
            me.normalGrid.view.blockRefresh = false;
            me.lockedGrid.view.blockRefresh = false;
            if (triggerRefresh) me.refreshViews();
        }
    }
}, function () {
    var MIN_EXT_VERSION = '6.0.0';

    Ext.apply(Sch, {
        VERSION : '6.1.17'
    });

    // DELETE THIS CHECK IF YOU WANT TO RUN AGAINST AN OLDER UNSUPPORTED EXT JS VERSION
    if (Ext.versions.extjs.isLessThan(MIN_EXT_VERSION)) {
        var c = console;
        c && c.log('The Ext JS version you are using needs to be updated to at least ' + MIN_EXT_VERSION);
    }

    // In 6.0.2 there's additional check which is failing in gantt due to our refresh blockers. We simply ignore that
    // error for panels with Sch.mixin.TimelinePanel mixed in.
    // covered by 062_reload_store in gantt
    if (Ext.getVersion().isGreaterThan('6.0.2')) {
        Ext.define(null, {
            override : 'Ext.grid.plugin.BufferedRenderer',

            doRefreshView : function () {
                if (this.view.ownerGrid.is('timelinegrid,timelinetree')) {
                    var oldIgnore = Ext.Error.ignore;
                    Ext.Error.ignore = true;
                    this.callParent(arguments);
                    Ext.Error.ignore = oldIgnore;
                } else {
                    this.callParent(arguments);
                }
            }
        });
    }
});
