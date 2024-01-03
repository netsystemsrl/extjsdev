/**

@class Gnt.panel.ResourceHistogram
@extends Sch.panel.TimelineGridPanel

A histogram panel, which allows you to visualize resource utilization and highlight overallocation.
The panel is a subclass of the Ext.grid.Panel class so any normal grid configs can be applied to it.

#Two ways of using

You can either use this widget as a standalone panel or it can be used together with a {@link Gnt.panel.Gantt gantt panel}.
When using it together with a {@link Gnt.panel.Gantt gantt panel} you need to specify its instance as the {@link Sch.mixin.TimelinePanel#partnerTimelinePanel partnerTimelinePanel} config.

#Predefined columns

The panel has a default set of columns which is used if no `columns` config has been specified.
The default columns include a resource name column and a {@link Gnt.column.Scale scale column} to display a resource utilization scale.

For example in the following code snippet, the histogram will be created with a default set of columns:

    var histogram = Ext.create('Gnt.panel.ResourceHistogram', {
        taskStore           : taskStore,
        resourceStore       : resourceStore,
        viewPreset          : 'weekAndDayLetter',
        startDate           : new Date(2010, 0, 11),
        endDate             : new Date(2010, 1, 11),
        renderTo            : Ext.getBody()
    });


{@img gantt/images/histogram-panel.png}

*/
Ext.define('Gnt.panel.ResourceHistogram', {
    extend                  : 'Sch.panel.TimelineGridPanel',

    requires                : [
        'Ext.XTemplate',
        'Sch.util.Date',
        'Sch.plugin.NonWorkingTime',
        'Gnt.column.Scale',
        'Gnt.view.ResourceHistogram'
    ],

    mixins                  : [
        'Gnt.mixin.Localizable'
    ],

    alias                   : 'widget.resourcehistogram',

    viewType                : 'resourcehistogramview',

    layout                  : 'border',

    preserveScrollOnRefresh : true,

    /**
     * @cfg {Ext.XTemplate} barTpl The template used to render the bars in the histogram view.
     *
     * When specifying a custom template please make sure that the bar element must have:
     *
     *  - unique `id` attribute, like this: ... id="{id}" ...
     *  - `gnt-bar-index` attribute defined this way: ... gnt-bar-index="{index}" ...
     *  - support for {@link #barCls} config.
     *  - support bar labels
     *
     * Please take a look at the default markup of this template to see an example of how the above restrictions can be applied:
     *
     *      this.barTpl = new Ext.XTemplate(
     *          '<tpl for=".">',
     *              '<div id="{id}" class="gnt-resourcehistogram-bar '+ (this.barCls || '') +' {cls}" gnt-bar-index="{index}" style="left:{left}px;top:{top}px;height:{height}px;width:{width}px">',
     *                  '<tpl if="text !== \'\'">',
     *                      '<span class="gnt-resourcehistogram-bar-text" style="bottom:' + Math.floor(this.rowHeight/2) + 'px">{text}</span>',
     *                  '</tpl>',
     *              '</div>',
     *          '</tpl>'
     *      );
     *
     * See {@link Ext.XTemplate} for more information on templates syntax.
     */

    /**
     * @cfg {Function} barRenderer When provided this function creates a data object for {@link #barTpl} template.
     *
     *
     *      Ext.create('Gnt.panel.ResourceHistogram', {
     *          crudManager     : crudManager,
     *          viewPreset      : 'weekAndDayLetter',
     *          height          : 300,
     *          width           : 500,
     *          renderTo        : Ext.getBody(),
     *
     *          barTpl          : new Ext.XTemplate(
     *                              '<tpl for=".">',
     *                                  '<div id="{id}" class="gnt-resourcehistogram-bar {cls}" gnt-bar-index="{index}" style="left:{left}px;top:{top}px;height:{height}px;width:{width}px">',
     *                                      '<span class="gnt-resourcehistogram-bar-text" style="bottom:20px">{text}<br>{taskName}</span>',
     *                                  '</div>',
     *                              '</tpl>'
     *                            ),
     *
     *          barRenderer     : function (resourceId, allocationData, tplData) {
     *              var task = allocationData.assignments[0].getTask();
     *
     *              return {
     *                  taskName : task.getName(),
     *                  cls      : 'foo' // provide a custom CSS class for a histogram bar
     *              };
     *          }
     *      });
     *
     *
     * @param {Number} resourceId Id of the current resource
     *
     * @param {Object} allocationData
     * @param {Data} allocationData.startDate Bar start date
     * @param {Data} allocationData.endDate Bar end date
     * @param {Int} allocationData.allocationMS Duration of rendering bar
     * @param {Number} allocationData.totalAllocation Allocation of resource in percent
     * @param {Gnt.model.Assignment[]} allocationData.assignments Assignments for current resource
     *
     * @return {Object} Specify properties you would like to use in your {@link #barTpl template}
     */

    /**
     * @cfg {String} barCls The CSS class to apply to rendered bars in the histogram view.
     * This can be used if you want to implement your own bar styling.
     */

    /**
     * @cfg {Ext.XTemplate} lineTpl The template used to render the scale line in the histogram view.
     */

    /**
     * @cfg {String} lineCls The CSS class to apply to scale lines in the histogram view.
     * This can be used if you want to implement your own line styling.
     */

    /**
     * @cfg {Ext.XTemplate} limitLineTpl The template used to render the maximum resource utilization line in the histogram view.
     */

    /**
     * @cfg {String} limitLineCls The CSS class to apply to the maximum resource utilization lines in the histogram view.
     * This can be used if you want to implement your own line styling.
     */

    /**
     * @cfg {Number} limitLineWidth The width of the maximum resource utilization line. Used for the line coordinates calculations.
     * Should be specified only if the width of that utilization line was changed as result of any custom styling.
     */

    /**
     * @cfg {Mixed} labelMode Defines the type of scale labels to be used or disables labels completely.
     * Possible values are:
     *
     *  - empty string or `false` to disable labels (default).
     *  - `units` - displays the per day allocation in {@link #scaleUnit units}.
     *  - `percent` - displays the per day allocation in percents.
     *  - any other non-empty value will be considered as compiled `Ext.XTemplate` instance.
     */

    /**
     * @cfg {String} labelPercentFormat Defines the label format to use when the {@link #labelMode} is set to `percent`.
     *
     * For more details on format usage please refer to the `Ext.util.Format.number` method description.
     */

    /**
     * @cfg {String} labelUnitsFormat Defines the label format to use when the {@link #labelMode} is set to `units`.
     *
     * For more details on format usage please refer to the `Ext.util.Format.number` method description.
     */

    /**
     * @cfg {Object[]} scalePoints Alternative way of defining the utilization scale.
     * Can be used instead of setting {@link #scaleMin}, {@link #scaleMax}, {@link #scaleStep} configs.
     * When using the default columns, this config will be applied to the {@link Gnt.column.Scale} instance.
     *
     * For usage details please refer to the {@link Gnt.column.Scale#scalePoints scalePoints} property.
     */

    /**
     * @cfg {Boolean} showScaleLines Whether to show scale lines or not.
     */
    showScaleLines          : false,

    /**
     * @cfg {Boolean} showLimitLines
     * Whether to show maximum resource allocation lines or not.
     * See {@link #showVerticalLimitLines} to disable vertical segments of the lines drawing.
     */
    showLimitLines          : true,

    /**
     * @cfg {Number} showLimitLinesThreshold Sets the histogram to show maximum resource allocation lines only wider than specified width in pixels.
     * This option allows to get rid of redundant details during zooming out (which also implicitly raises performance).
     * When line has smaller size than the provided value the histogram will merge it with neighbor segments and approximate its level.
     * Use {@link #showLimitLines} to completely disable resource allocation lines rendering.
     */
    showLimitLinesThreshold : 10,

    /**
     * @cfg {Boolean} showVerticalLimitLines
     * Set this to false to not render vertical segments of maximum resource allocation lines.
     * This implicitly raises performance due to reducing the number of DOM elements being generated.
     */
    showVerticalLimitLines  : true,

    cacheLimitDurationMS    : 0,

    /**
     * @cfg {Number} cacheLimitDuration Combined with {@link #cacheLimitDurationUnit} forces cache to hold only data
     * for visible time span and {@link #cacheLimitDuration} number of {@link #cacheLimitDurationUnit units} to the left/right from it.
     *
     * **Note:** Does not limit the cache size when set to zero `0`.
     */
    cacheLimitDuration      : 6,

    /**
     * @cfg {String} cacheLimitDurationUnit Combined with {@link #cacheLimitDuration} forces cache to hold only data
     * for visible time span and {@link #cacheLimitDuration} number of units to the left/right from it.
     */
    cacheLimitDurationUnit  : 'mo',

    calendarResources       : null,

    calendarListenersHash   : null,

    /**
     * @cfg {Gnt.data.Calendar} calendar A {@link Gnt.data.Calendar calendar} instance for the histogram panel. Can be also provided
     * as a {@link Gnt.data.TaskStore#calendar configuration option} of the `taskStore`.
     *
     * **Please note,** that this option is required if the {@link #taskStore} option is not specified.
     */
    calendar                : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore The {@link Gnt.data.TaskStore store} holding the tasks.
     * When using this option, the histogram will instantly reflect any changes made to a task.
     *
     * **Please note,** that this option is required if the {@link #calendar} option is not specified.
     */
    taskStore               : null,

    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore The {@link Gnt.data.ResourceStore store} holding the resources to be rendered into the histogram (required).
     *
     * See also {@link Gnt.model.Resource}
     */
    resourceStore           : null,

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore The {@link Gnt.data.AssignmentStore store} holding the assignments information (optional).
     *
     * If not specified, it will be taken from the {@link #resourceStore} or {@link #taskStore}.
     *
     * See also {@link Gnt.model.Assignment}
     */
    assignmentStore         : null,

    /**
     * @cfg {Date} startDate Defines the start date of this panel.
     *
     * **Note:** This option is **required** if a {@link Sch.mixin.TimelinePanel#partnerTimelinePanel partnerTimelinePanel} is not specified.
     */
    startDate               : null,

    /**
     * @cfg {Date} endDate Defines the end date of this panel.
     *
     * **Note:** This option is **required** if a {@link Sch.mixin.TimelinePanel#partnerTimelinePanel partnerTimelinePanel} is not specified.
     */
    endDate                 : null,

    highlightWeekends       : true,

    allocationData          : null,

    /**
     * @cfg {String} scaleUnit Name of the resource utilization scale unit. `Sch.util.Date` constants can be used, like `Sch.util.Date.HOUR`.
     */
    scaleUnit               : 'HOUR',

    /**
     * @cfg {Number} scaleMin Minimum for the resource utilization scale (required).
     */
    scaleMin                : 0,

    /**
     * @cfg {Number} scaleMax Maximum for the resource utilization scale.
     *
     * **Note:** this option is **required** except in cases when you use {@link #scalePoints} to define utilization scale.
     */
    scaleMax                : 24,

    /**
     * @cfg {Number} scaleLabelStep Defines the interval between two adjacent scale lines which have labels.
     * The histogram itself does not render any labels but corresponding lines will get a specific CSS class for styling purposes.
     */
    scaleLabelStep          : 4,

    /**
     * @cfg {Number} scaleStep Defines the interval between two adjacent scale lines.
     *
     * **Also,** this value is used as a margin between the top scale line (defined by {@lin #scaleMax} option) and the top border of the cell
     * containing the histogram for a resource.
     */
    scaleStep               : 2,

    rowHeight               : 50,

    groupAllocationByDay    : true,

    /**
     * Class name to be used for the scale column creating
     * @cfg {String} scaleColumnClass
     */
    scaleColumnClass        : 'Gnt.column.Scale',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

        - resourceText : 'Resource'
     */

    scaleColumnConfigs      : [ 'scalePoints', 'scaleStep', 'scaleLabelStep', 'scaleMin', 'scaleMax', 'scaleLabelStep', 'scaleStep' ],

    normalViewConfigs       : [
        'barCls', 'barTpl', 'barRenderer', 'lineRenderer', 'limitLineRenderer',
        'lineTpl', 'lineCls', 'limitLineTpl', 'limitLineCls', 'limitLineWidth', 'labelMode', 'labelPercentFormat', 'labelUnitsFormat',
        'scaleMin', 'scaleMax', 'scaleStep', 'scaleLabelStep', 'scalePoints', 'scaleUnit', 'loadMask', 'showLimitLinesThreshold', 'showVerticalLimitLines', 'calendar'
    ],

    cacheUpdateSuspended        : false,

    suspendedCacheUpdatesCount  : 0,

    gapThreshold                : 24*3600000, // 24 hrs
    rowLines                    : true,

    initComponent : function () {
        // convert "cacheLimitDuration" value to ms
        this.cacheLimitDurationMS = Sch.util.Date.getUnitDurationInMs(this.cacheLimitDurationUnit) * this.cacheLimitDuration;

        // initialize the allocation cache
        this.resetAllocationDataCache();

        // initialize store references
        this.initStores();

        this.lockedGridConfig   = Ext.applyIf(this.lockedGridConfig || {}, {
            reserveScrollbar    : false,
            width               : 300,
            forceFit            : true
        });

        this.normalViewConfig       = Ext.apply(this.normalViewConfig || {}, {
            histogram               : this,
            trackOver               : false,
            rowHeight               : this.rowHeight,
            preserveScrollOnRefresh : this.preserveScrollOnRefresh
        });

        this.lockedViewConfig       = Ext.apply(this.lockedViewConfig || {}, {
            rowHeight               : this.rowHeight,
            preserveScrollOnRefresh : this.preserveScrollOnRefresh
        });

        // if scale was specified by scalePoints
        if (this.scalePoints) {
            this.scalePoints.sort(function (a, b) { return a.value > b.value ? 1 : -1; });

            this.scaleMin   = this.scalePoints[0].value;
            this.scaleMax   = this.scalePoints[this.scalePoints.length - 1].value;
            this.scaleStep  = (this.scaleMax - this.scaleMin) / 10;
        }

        this.initColumns();

        // transfer some configs to the view instance
        Ext.Array.each(this.normalViewConfigs, function (prop) {
            if (prop in this) this.normalViewConfig[prop] = this[prop];
        }, this);

        this.callParent(arguments);

        var cls     = 'gnt-resourcehistogram sch-horizontal ';

        this.addCls(cls);

        // register our renderer
        this.registerRenderer(this.columnRenderer, this);

        var view = this.getSchedulingView();

        this.relayEvents(view, [
            /**
            * @event barclick
            * Fires when a histogram bar is clicked
            *
            * @param {Gnt.view.ResourceHistogram} view The histogram panel view.
            * @param {Object} context Object containing a description of the clicked bar.
            * @param {Gnt.model.Resource} context.resource The resource record.
            * @param {Date} context.startDate Start date of corresponding period.
            * @param {Date} context.endDate End date of corresponding period.
            * @param {Number} context.allocationMS Resource allocation time in milliseconds.
            * @param {Number} context.totalAllocation Resource allocation (in percents).
            * @param {Gnt.model.Assignment[]} context.assignments List of resource assignments for the corresponding period.
            * @param {Ext.EventObject} e The event object
            */
            'barclick',
            /**
            * @event bardblclick
            * Fires when a histogram bar is double clicked
            *
            * @param {Gnt.view.ResourceHistogram} view The histogram panel view.
            * @param {Object} context Object containing description of clicked bar.
            * @param {Gnt.model.Resource} context.resource The resource record.
            * @param {Date} context.startDate Start date of corresponding period.
            * @param {Date} context.endDate End date of corresponding period.
            * @param {Number} context.allocationMS Resource allocation time in milliseconds.
            * @param {Number} context.totalAllocation Resource allocation (in percents).
            * @param {Gnt.model.Assignment[]} context.assignments List of resource assignments for the corresponding period.
            * @param {Ext.EventObject} e The event object
            */
            'bardblclick',
            /**
            * @event barcontextmenu
            * Fires when contextmenu is activated on a histogram bar
            *
            * @param {Gnt.view.ResourceHistogram} view The histogram panel view.
            * @param {Object} context Object containing description of clicked bar.
            * @param {Gnt.model.Resource} context.resource The resource record.
            * @param {Date} context.startDate Start date of corresponding period.
            * @param {Date} context.endDate End date of corresponding period.
            * @param {Number} context.allocationMS Resource allocation time in milliseconds.
            * @param {Number} context.totalAllocation Resource allocation (in percents).
            * @param {Gnt.model.Assignment[]} context.assignments List of resource assignments for the corresponding period.
            * @param {Ext.EventObject} e The event object
            */
            'barcontextmenu'
        ]);

    },


    onRender : function () {
        var scaleCol = this.getScaleColumn();

        if (scaleCol) {
            // before render give scale column information about row height
            scaleCol.setAvailableHeight(this.getSchedulingView().getAvailableRowHeight());
        }

        this.callParent(arguments);
    },

    initStores : function () {
        var listenersBound = false;

        // if CrudManager is used let's grab store references from it
        if (this.crudManager) {
            this.setCrudManager(this.crudManager);
            // we called bindStores() in setCrudManager() call
            listenersBound = true;
        }

        // resourceStore acts as store for the grid
        this.store      = this.resourceStore;

        this.taskStore  = this.taskStore || this.store.getTaskStore();

        // get project calendar
        this.calendar   = this.calendar || this.taskStore && this.taskStore.getCalendar();

        if (!this.calendar) throw 'Cannot get project calendar instance: please specify either "calendar" or "taskStore" option';

        this.assignmentStore = this.assignmentStore || this.store.getAssignmentStore() || this.taskStore && this.taskStore.getAssignmentStore();

        if (!listenersBound) this.bindStores();
    },


    getCrudManager : function () {
        return this.crudManager;
    },


    setCrudManager : function (crudManager) {
        this.unbindStores();

        // if we set another crud manager unbind from the previous one
        this.crudManagerListeners && this.crudManagerListeners.destroy();

        this.crudManager        = crudManager;

        this.taskStore          = this.crudManager.getTaskStore();
        this.store              = this.resourceStore = this.crudManager.getResourceStore();
        this.assignmentStore    = this.crudManager.getAssignmentStore();

        this.crudManagerListeners = this.mon(this.crudManager, {
            beforeloadapply : {
                fn          : this.beforeCrudManagerLoad,
                // we want to listen to "beforeloadapply" the last one
                // to have some guarantee that the event is not cancelled
                priority    : -999
            },
            load            : this.afterCrudManagerLoad,
            destroyable     : true,
            scope           : this
        });

        this.bindStores();
    },


    beforeCrudManagerLoad : function () {
        // suspend store listeners upon crud manager stores loading
        this.suspendStoreListeners();
    },


    afterCrudManagerLoad : function () {
        // keep showing loading mask
        this.beforeCrudOperationStart(this.crudManager, null, 'load');
        // resume stores listeners and refresh the histogram
        this.resumeStoreListeners(true);
        // hide loading mask
        this.onCrudOperationComplete();
    },


    bindStores  : function () {
        if (this.taskStore) {
            this.mon(this.taskStore, {
                refresh     : this.onTaskStoreRefresh,
                // Ext JS 5: tree store doesn't fire 'refresh' on load completion so we listen to 'load' as well
                load        : this.onTaskStoreRefresh,
                update      : this.onTaskUpdateOrAppend,
                // we listen to append to support twisted case when someone first adds assignment and then adds a task
                nodeappend  : this.onTaskUpdateOrAppend,

                scope       : this
            });
        }

        if (this.assignmentStore) {
            // on assignments change we update corresponding resource row
            this.mon(this.assignmentStore, {
                refresh : this.onAssignmentsRefresh,
                remove  : this.onAssignmentsChange,
                update  : this.onAssignmentUpdate,
                add     : this.onAssignmentsChange,

                scope   : this
            });
        }

        // track the project calendar changes
        this.calendar && this.mon(this.calendar, {
            calendarchange  : this.onProjectCalendarChange,
            scope           : this
        });

        // bind resource calendars listeners
        this.bindCalendarListeners();

        this.store && this.mon(this.store, {
            update  : this.onResourceUpdate,
            refresh : this.onResourceStoreRefresh,

            scope   : this,
            priority : 100
        });
    },


    unbindStores : function () {
        if (this.taskStore) {
            this.mun(this.taskStore, {
                refresh     : this.onTaskStoreRefresh,
                // EtxJS5: tree store doesn't fire 'refresh' on load completion so we listen to 'load' as well
                load        : this.onTaskStoreRefresh,
                update      : this.onTaskUpdateOrAppend,
                // we listen to append to support twisted case when someone first adds assignment and then adds a task
                nodeappend  : this.onTaskUpdateOrAppend,

                scope       : this
            });
        }

        if (this.assignmentStore) {
            // on assignments change we update corresponding resource row
            this.mun(this.assignmentStore, {
                refresh : this.onAssignmentsRefresh,
                remove  : this.onAssignmentsChange,
                update  : this.onAssignmentUpdate,
                add     : this.onAssignmentsChange,

                scope   : this
            });
        }

        this.calendar && this.mun(this.calendar, {
            calendarchange  : this.onProjectCalendarChange,
            scope           : this
        });

        this.unbindCalendarListeners();

        this.store && this.mun(this.store, {
            update  : this.onResourceUpdate,
            refresh : this.onResourceStoreRefresh,

            scope   : this,
            priority : 100
        });
    },


    /**
     * Suspends the histogram stores listeners. Call this method before massive stores data modifications
     * (like data loading) if you want to speed the histogram up.
     * Use {@link #resumeStoreListeners} to restore store listeners back.
     */
    suspendStoreListeners : function () {
        // set flag to avoid cache updating
        this.cacheUpdateSuspended       = true;
        this.suspendedCacheUpdatesCount = 0;

        // unbind stores listeners
        this.unbindStores();
    },

    /**
     * Resumes the histogram stores listeners suspended by {@link #suspendStoreListeners} call.
     * @param {Boolean} [refreshIfAttempted] Pass `true` to refresh the histogram if there were suspended refresh attempts
     */
    resumeStoreListeners : function (refreshIfAttempted) {
        // restore cache recalculations
        this.cacheUpdateSuspended = false;

        // restore listeners
        this.bindStores();

        // refresh if it's asked and there were attempts to update the histogram cache
        if (refreshIfAttempted && this.suspendedCacheUpdatesCount) {
            this.clearCacheAndRefresh();
        }
    },


    // Clears allocation cache for the resource and refreshes corresponding view node
    clearCacheAndRefresh : function (resource) {
        this.resetAllocationDataCache(resource);
        this.refreshIfRendered(resource);
    },


    createDefaultColumns : function () {
        var columns         = [],
            scaleCol;

        columns.push({
            flex        : 1,
            resizable   : false,
            text        : this.L('resourceText'),
            dataIndex   : this.resourceStore.model.prototype.nameField,
            renderer    : Ext.htmlEncode
        });

        scaleCol        = { width : 40, resizable : false, availableHeight: this.rowHeight };

        // map some scale column configs from this panel
        Ext.copyTo(scaleCol, this, this.scaleColumnConfigs, true);

        scaleCol = this.scaleCol = Ext.create(this.scaleColumnClass, scaleCol);

        // before column render we'll give it information about row height
        scaleCol.on({
            beforerender    : function () {
                scaleCol.setAvailableHeight(this.getSchedulingView().getAvailableRowHeight());

                if (this.scalePoints) {
                    // we update scalePoints since it was
                    // filled in with calculated top-coordinates
                    this.scalePoints    = scaleCol.scalePoints;
                }
            },
            scope           : this
        });

        columns.push(scaleCol);

        return columns;
    },


    initColumns : function () {
        // if no columns provided we'll generate default column set: resource name & scale
        if (!this.columns) {

            this.columns    = this.createDefaultColumns();

            var scaleCol    = this.scaleCol;

            // if scale was specified by scalePoints let's set params equal to scale column ones
            // since they were calculated there
            if (this.scalePoints) {
                this.scaleMin       = scaleCol.scaleMin;
                this.scaleMax       = scaleCol.scaleMax;
                this.scaleStep      = scaleCol.scaleStep;
            }

        // if columns specified we try to find Gnt.column.Scale instances and set its configs
        } else {
            var columns = !Ext.isArray(this.columns) ? [this.columns] : this.columns;

            for (var i = 0; i < columns.length; i++) {
                var col = columns[i];

                if (this.isScaleColumn(col)) {

                    // map some scale column configs from this panel
                    Ext.copyToIf(col, this, this.scaleColumnConfigs);
                }
            }
        }
    },


    isScaleColumn : function (col) {
        var proto   = col.xtype && (Ext.ClassManager.getByAlias('widget.' + col.xtype));

        proto       = proto && proto.prototype;

        return (col instanceof Gnt.column.Scale || (proto && proto.isXType('scalecolumn')));
    },

    getScaleColumn : function () {
        return this.lockedGrid.down('scalecolumn');
    },


    destroy : function () {
        this.unbindStores();
        this.callParent(arguments);
    },


    /**
     * Returns the resource store instance
     * @return {Gnt.data.ResourceStore}
     */
    getResourceStore : function () {
        return this.resourceStore;
    },

    /**
     * Returns the assignment store instance
     * @return {Gnt.data.AssignmentStore}
     */
    getAssignmentStore : function () {
        return this.assignmentStore;
    },

    /**
     * Returns the task store instance
     * @return {Gnt.data.TaskStore}
     */
    getEventStore : function () {
        return this.taskStore;
    },

    getTimeSpanDefiningStore : function () {
        return this.taskStore;
    },

    unbindResourceCalendarListener : function (resource, calendarId) {
        var calendarResources = this.calendarResources[calendarId];

        if (calendarResources) {
            Ext.Array.remove(calendarResources, resource);

            // if no more resources left bound to the calendar
            // destroy the calendar listener
            if (!calendarResources.length) {
                this.calendarListenersHash[calendarId].destroy();
                delete this.calendarListenersHash[calendarId];
                delete this.calendarResources[calendarId];
            }
        }
    },


    bindResourceCalendarListener : function (resource) {
        var me          = this,
            calendar    = resource.getOwnCalendar(),
            calendarId  = calendar.getCalendarId();

        // bind new listener to the calendar if it doesn't have it yet
        if (!me.calendarListenersHash[calendarId]) {
            me.calendarListenersHash[calendarId] = me.mon(calendar, {
                // on calendar load/change we'll recalculate allocation data and redraw resource(s) rows
                load            : me.onCalendarChange,
                calendarchange  : me.onCalendarChange,
                scope           : me,
                destroyable     : true
            });
        }

        if (!me.calendarResources[calendarId]) {
            me.calendarResources[calendarId] = [resource];
        } else if (Ext.Array.indexOf(me.calendarResources, resource) === -1) {
            me.calendarResources[calendarId].push(resource);
        }
        // resource is already bound to this calendar
    },


    bindCalendarListeners : function () {
        var me = this;

        // unbind exisiting listeners (if any)
        me.unbindCalendarListeners();

        me.store.each(function (resource) {
            // if resource has own calendar and it differs from project one
            var calendar    = resource.getOwnCalendar();
            if (calendar && calendar !== me.calendar) {
                me.bindResourceCalendarListener(resource);
            }
        });
    },


    unbindCalendarListeners : function () {
        for (var calendarId in this.calendarListenersHash) {
            this.calendarListenersHash[calendarId].destroy();
        }
        // reset array of listeners
        this.calendarResources      = [];
        this.calendarListenersHash  = {};
    },


    onTaskStoreRefresh : function () {
        this.clearCacheAndRefresh();
    },


    onCalendarChange : function (calendar) {
        var resources   = this.calendarResources[calendar.getCalendarId()];

        if (resources) {
            // reset allocation cache and render row for each resource bound to the calendar
            for (var i = 0; i < resources.length; i++) {
                this.clearCacheAndRefresh(resources[i]);
            }
        }
    },


    onProjectCalendarChange : function () {
        this.clearCacheAndRefresh();
    },

    onTaskUpdateOrAppend : function (notUsed, task) {
        var assignments;
        var taskStore = task.getTreeStore();

        if (!taskStore.isSettingRoot && !task.isRoot()){
            if (this.assignmentStore && task.getAssignmentStore() != this.assignmentStore) {
                assignments = this.assignmentStore.getAssignmentsForTask(task.getId());
            } else {
                assignments = task.getAssignments();
            }

            this.onAssignmentsChange(this.assignmentStore, assignments);
        }
    },


    onAssignmentsRefresh : function (assignmentStore) {
        this.onAssignmentsChange(assignmentStore, assignmentStore.getRange());
    },


    onAssignmentUpdate : function (assignmentStore, assignment, operation, modifiedFieldNames) {
        var me              = this,
            resourceIdField = me.assignmentStore.model.prototype.resourceIdField,
            resource;

        if (operation == Ext.data.Model.EDIT) {

            // if the assignment resource has been changed
            if (modifiedFieldNames && Ext.Array.contains(modifiedFieldNames, resourceIdField)) {
                var oldResourceId   = assignment.previous[resourceIdField];

                resource = this.resourceStore.getModelById(oldResourceId);
                if (resource) {
                    // resetting previous resource allocation and refresh corresponding row,
                    // resource allocation data will be updated upon row rendering
                    this.clearCacheAndRefresh(resource);
                }
            }

            // invoke refreshing of rows of all the resources associated w/ the assignment
            me.onAssignmentsChange(assignmentStore, [ assignment ]);
        }
    },


    onAssignmentsChange : function (assignmentStore, assignments) {
        var me = this,
            resource;

        if (!Ext.isArray(assignments)) assignments = [assignments];

        // for each provided assignment
        for (var i = 0, l = assignments.length; i < l; i++) {
            // get assigned resource
            resource = me.resourceStore.getModelById(assignments[i].getResourceId());

            // this might be called as result of resource calendar change
            // if task(s) get realigned, but we don't need this since the histogram also listens
            // to calendar changes and updates resource rows accordingly.
            // So here we skip resources that are in the middle of reacting on their calendar change
            if (resource && !resource.inOnCalendarChange) {
                // resetting resource allocation and refresh corresponding row,
                // resource allocation data will be updated upon row rendering
                me.clearCacheAndRefresh(resource);
            }
        }
    },

    findEndIndex : function (array, endDate) {
        endDate = endDate || this.getEndDate();

        var result  = array.length - 1;

        for (var i = result; i >= 0; i--) {
            if (array[i].startDate < endDate) {
                result = i;
                break;
            }
        }

        return result;
    },

    findStartIndex : function (array, startDate) {
        startDate   = startDate || this.getStartDate();

        var result  = 0;

        for (var i = 0, l = array.length; i < l; i++) {
            if (array[i].endDate > startDate) {
                result = i;
                break;
            }
        }

        return result;
    },

    resetAllocationDataCache : function (resource) {
        var me = this;

        if (!resource) {
            me.allocationData = {};
        }
        else {
            me.allocationData = me.allocationData || {};
            me.allocationData[resource.getId()] = null;
        }
    },


    constrainAllocationDataCache : function (allocData) {
        var me                  = this,
            // minimum allowed cached date
            cacheMinStartDate   = new Date(me.timeAxis.getStart() - this.cacheLimitDurationMS),
            // maximum allowed cached date
            cacheMaxEndDate     = new Date(me.timeAxis.getEnd() - 0 + this.cacheLimitDurationMS),
            maxBarsLastIndex    = allocData.maxBars.length - 1,
            maxBarsFirstIndex   = 0,
            barsLastIndex       = allocData.bars.length - 1,
            barsFirstIndex      = 0,
            trimCache           = false;

        // if right cache border violates its allowed maximum
        if (allocData.cacheEnd > cacheMaxEndDate) {
            maxBarsLastIndex        = me.findEndIndex(allocData.maxBars, cacheMaxEndDate);
            barsLastIndex           = me.findEndIndex(allocData.bars, cacheMaxEndDate);

            allocData.cacheEnd      = cacheMaxEndDate;
            trimCache               = true;
        }

        // if left cache border violates its allowed minimum
        if (allocData.cacheStart < cacheMinStartDate) {
            maxBarsFirstIndex       = me.findStartIndex(allocData.maxBars, cacheMinStartDate);
            barsFirstIndex          = me.findStartIndex(allocData.bars, cacheMinStartDate);

            allocData.cacheStart    = cacheMinStartDate;
            trimCache               = true;
        }

        // truncate caches if needed
        if (trimCache) {
            allocData.maxBars   = Ext.Array.splice(allocData.maxBars, maxBarsFirstIndex, maxBarsLastIndex + 1 - maxBarsFirstIndex);
            allocData.bars      = Ext.Array.splice(allocData.bars, barsFirstIndex, barsLastIndex + 1 - barsFirstIndex);
        }

        return trimCache;
    },


    updateAllocationDataCache : function (resource, start, end) {
        var DATE    = Sch.util.Date,
            me      = this,
            allocData,
            cacheStart, cacheEnd,
            left, right;

        if (me.cacheUpdateSuspended) {
            me.suspendedCacheUpdatesCount++;
            return;
        }

        start = start || me.getStartDate();
        end   = end   || me.getEndDate();

        if (!resource) {
            me.resourceStore.each(function(resource) {
                me.updateAllocationDataCache(resource, start, end);
            });
        }
        else {
            // Update resource cache
            allocData  = me.allocationData[resource.getId()] || {};
            cacheStart = allocData.cacheStart;
            cacheEnd   = allocData.cacheEnd;

            // check if update is needed at all
            if (cacheStart != start || cacheEnd != end) {

                // if we already have cached allocation data for required span or part of it
                if (cacheStart && cacheEnd && DATE.intersectSpans(cacheStart, cacheEnd, start, end)) {
                    // new span starts earlier, calculate missing allocation
                    if (cacheStart > start) {
                        left = me.processAllocationData(resource.getAllocationInfo({
                            startDate               : start,
                            endDate                 : cacheStart,
                            includeResCalIntervals  : true
                        }));

                        // there can be an extra max bar element for span end, that we don't need
                        if (left.maxBars.length) {
                            if (left.maxBars[left.maxBars.length - 1].startDate.getTime() === cacheStart.getTime()) {
                                // extra max bar can appear after merge
                                left.maxBars.pop();
                            }
                        }

                        // we don't split allocation bar element to avoid inconsistency
                        // if last new allocation element is a subset of first cached - we can drop it because it's cached
                        if (left.bars.length && allocData.bars.length) {
                            var lastNewBar = left.bars[left.bars.length - 1];
                            var firstOldBar = allocData.bars[0];

                            if (lastNewBar.startDate >= firstOldBar.startDate && lastNewBar.endDate <= firstOldBar.endDate) {
                                left.bars.pop();
                            }
                        }

                        // clue to previous cache borders
                        left.maxBars.length      && (left.maxBars[left.maxBars.length - 1].endDate = cacheStart);
                        allocData.maxBars.length && (allocData.maxBars[0].startDate                = cacheStart);

                        // insert missing allocation data to the allocation cache beginning
                        allocData.bars              = left.bars.concat(allocData.bars);
                        allocData.maxBars           = left.maxBars.concat(allocData.maxBars);

                        // visible span starts from the very first cached item
                        allocData.maxBarsStartIndex = 0;
                        allocData.barsStartIndex    = 0;

                        allocData.cacheStart = start;
                    }

                    // new span ends later, calculate trailing allocation
                    if (cacheEnd < end) {
                        right = me.processAllocationData(resource.getAllocationInfo({
                            startDate               : cacheEnd,
                            endDate                 : end,
                            includeResCalIntervals  : true
                        }));

                        // there can be an extra max bar element that we don't need
                        if (right.maxBars.length) {
                            var firstBar = right.maxBars[0];

                            if (firstBar.endDate.getTime() === cacheEnd.getTime()) {
                                // extra max bar can appear after merge
                                right.maxBars.shift();
                            } else {
                                firstBar.startDate = cacheEnd;
                            }
                        }

                        // we don't split allocation bar element to avoid inconsistency
                        // if first new allocation element is a subset of last cached - we can drop it because it's cached
                        if (right.bars.length && allocData.bars.length) {
                            var firstNewBar = right.bars[0];
                            var lastOldBar = allocData.bars[allocData.bars.length - 1];

                            if (firstNewBar.startDate >= lastOldBar.startDate && firstNewBar.endDate <= lastOldBar.endDate) {
                                right.bars.shift();
                            }
                        }

                        right.maxBars.length     && (right.maxBars[right.maxBars.length - 1].endDate = end);
                        allocData.maxBars.length && (allocData.maxBars[allocData.maxBars.length - 1].endDate = cacheEnd);

                        allocData.bars            = allocData.bars.concat(right.bars);
                        allocData.maxBars         = allocData.maxBars.concat(right.maxBars);

                        allocData.maxBarsEndIndex = allocData.maxBars.length - 1;
                        allocData.barsEndIndex    = allocData.bars.length - 1;

                        allocData.cacheEnd        = end;
                    }

                    // constrain cached data if needed
                    if (me.cacheLimitDuration > 0) {
                        me.constrainAllocationDataCache(allocData);
                    }

                    // update indexes of first/last visible cache elements
                    allocData.maxBarsStartIndex = me.findStartIndex(allocData.maxBars, start);
                    allocData.barsStartIndex    = me.findStartIndex(allocData.bars, start);
                    allocData.maxBarsEndIndex   = me.findEndIndex(allocData.maxBars, end);
                    allocData.barsEndIndex      = me.findEndIndex(allocData.bars, end);

                // if new timespan does not intersect the cached one data
                } else {
                    allocData = me.processAllocationData(resource.getAllocationInfo({
                        startDate              : start,
                        endDate                : end,
                        includeResCalIntervals : true
                    }));

                    // we completely replace cache so indexes have to wrap whole arrays
                    allocData.maxBarsStartIndex = 0;
                    allocData.maxBarsEndIndex   = allocData.maxBars.length - 1;
                    allocData.barsStartIndex    = 0;
                    allocData.barsEndIndex      = allocData.bars.length - 1;

                    allocData.cacheStart        = start;
                    allocData.cacheEnd          = end;
                }
            }

            me.allocationData[resource.getId()] = allocData;
        }
    },


    // Another set of task started
    isBarAssignmentsChanged : function (context) {
        var bar     = context.bar,
            period  = context.period;

        if (!bar.assignments || !period.inResourceCalendar || !period.totalAllocation || !period.inTasksCalendar) return false;

        for (var i = 0, l = bar.assignments.length; i < l; i++) {
            if (period.assignmentsHash[ bar.assignments[i].getTaskId() ]) return false;
        }

        // no intersection with previous set of tasks
        return true;
    },


    // Opens new bar
    openBar : function (openDate, context) {
        if (this.groupAllocationByDay) {
            context.bar                 = {
                startDate               : openDate,
                totalAllocation         : context.totalAllocation,
                allocationMS            : context.allocationMS,
                assignments             : context.period.assignments,
                totalOverAllocationMS   : context.totalOverAllocationMS
            };

        } else {
            context.bar                 = {
                startDate               : openDate,
                totalAllocation         : context.period.totalAllocation,
                allocationMS            : context.period.totalAllocationMS,
                assignments             : context.period.assignments,
                totalOverAllocationMS   : context.period.totalOverAllocationMS || 0
            };
        }

        context.barOpened = true;

        return context.bar;
    },


    // Closes histogram bar
    closeBar : function (closeDate, context) {
        if (!context.barOpened) return false;

        if (closeDate) context.bar.endDate = closeDate;
        context.bars.push(context.bar);

        context.barOpened   = false;
    },


    splitBar : function (closeDate, context, openDate) {
        this.closeBar(closeDate, context);
        return this.openBar(openDate || closeDate, context);
    },


    // Appends zero level limit line
    appendZeroMaxBars : function (fromDate, toDate, context) {
        if (!fromDate) return false;

        var me      = this,
            diff    = Sch.util.Date.getDurationInDays(fromDate, toDate);

        if (diff < 2) return false;

        var add     = true,
            maxBar  = context.maxBar,
            maxBars = context.maxBars;

        // if there is a previous level line
        if (maxBar) {
            if (!maxBar.allocationMS) {
                add     = false;
            // and it's not zero
            } else {
                // let's close it
                maxBar.endDate      = Sch.util.Date.getStartOfNextDay(fromDate, true);
                maxBars.push(maxBar);
            }
        }

        if (add) {
            // ..and start new line with zero level
            context.maxBar      = {
                startDate       : maxBar && maxBar.endDate || me.getStart(),
                allocationMS    : 0
            };
        }

        // update last calculated allocation limit
        context.maxAllocationMS = 0;

        return context.maxBar;
    },


    // By default we sum up allocations per day.
    // So here we just trim time part to get period start by date
    getPeriodDay : function (date, period, context) {
        return this.getMergePeriodStart.apply(this, arguments);
    },

    getMergePeriodStart : function (date, period, context) {
        return Ext.Date.clearTime(date, true);
    },

    getTotalAllocationAverage : function (values) {
        var result = 0, totalDuration = 0;

        Ext.Array.each(values, function (item) {
            result += item.totalAllocation * item.duration;
            totalDuration += item.duration;
        });

        result /= totalDuration;

        return result;
    },

    // This function processes report made by resource.getAllocationInfo() method and build arrays of
    // histogram bars and levels of max resource allocation.
    // Returns:
    //      {
    //        bars: [], // array of histogram bars
    //        maxBars: [] // levels of max resource allocation
    //      }
    processAllocationData : function (data) {
        var period, bar, maxBar, prevPeriodStart, closeDate, openDate,
            allocationMS, prevAllocationMS, maxAllocationMS, prevMaxAllocationMS, totalOverAllocationMS, prevTotalOverAllocationMS, totalAllocation, totalAllocationChanged,
            bars        = [],
            maxBars     = [],
            me          = this,
            context     = {
                bars    : bars,
                maxBars : maxBars
            };

        // if there's nothing to process
        if (!data || !data.length) return context;

        var newPeriodStart = me.getPeriodDay(data[0].startDate, data[0]);

        if (this.showLimitLines && newPeriodStart > this.getStartDate()) {
            maxBars.push({
                startDate       : this.getStartDate(),
                endDate         : newPeriodStart,
                allocationMS    :  0
            });
        }

        for (var i = 0, l = data.length; i < l; i++) {
            period = data[i];

            newPeriodStart = me.getPeriodDay(period.startDate, period, context);

            context.period = period;

            // if it's 1st period of a new day
            if (me.groupAllocationByDay && newPeriodStart - prevPeriodStart !== 0) {
                // if there is a gap between working days in resource calendar
                // we need to fill it with zero level lines
                if (this.showLimitLines) {
                    if (me.appendZeroMaxBars(prevPeriodStart, newPeriodStart, context)) {
                        maxBar              = context.maxBar;
                    }
                }

                prevPeriodStart             = newPeriodStart;

                prevAllocationMS            = context.allocationMS;
                prevTotalOverAllocationMS   = context.totalOverAllocationMS;
                prevMaxAllocationMS         = context.maxAllocationMS;

                // reset allocation time counters
                allocationMS                = 0;
                totalOverAllocationMS       = 0;
                maxAllocationMS             = 0;

                totalAllocation = 0;

                totalAllocationChanged = false;

                var j = i;
                var totalAllocationValues = [];

                // let's calculate allocation time for the period
                while (data[j] && me.getPeriodDay(data[j].startDate, data[j], context) - newPeriodStart === 0) {
                    // if it's working time according to resource calendar
                    if (data[j].inResourceCalendar) {
                        // increment maximum possible resource allocation time
                        maxAllocationMS     += data[j].endDate - data[j].startDate;
                        // if it's working time and task is in progress
                        if (data[j].totalAllocationMS) {
                            // increment allocation time
                            allocationMS            += data[j].totalAllocationMS;
                            totalOverAllocationMS   += data[j].totalOverAllocationMS || 0;

                            if (!totalAllocationChanged && totalAllocation && totalAllocation != data[j].totalAllocation) {
                                totalAllocationChanged = true;
                            }

                            totalAllocationValues.push({
                                totalAllocation : data[j].totalAllocation,
                                duration        : data[j].endDate - data[j].startDate
                            });

                            totalAllocation = data[j].totalAllocation;
                        }
                    }

                    j++;
                }

                if (totalAllocationChanged) {
                    totalAllocation = me.getTotalAllocationAverage(totalAllocationValues);
                }

                context.allocationMS            = allocationMS;
                context.totalOverAllocationMS   = totalOverAllocationMS;
                context.maxAllocationMS         = maxAllocationMS;
                context.totalAllocation         = totalAllocation;

            } else {
                newPeriodStart = false;
            }

            me.onProcessAllocationDataIterateFn && me.onProcessAllocationDataIterateFn(context);

            // if we need to render limit lines
            if (me.showLimitLines) {
                // here we trace resource max available allocation changes
                if (newPeriodStart && maxAllocationMS != prevMaxAllocationMS) {
                    // on change we close existing line
                    if (maxBar) {
                        maxBar.endDate      = newPeriodStart;
                        maxBars.push(maxBar);
                    }


                    // ..and start new one with new allocationMS value
                    maxBar = context.maxBar = {
                        startDate       : newPeriodStart,
                        allocationMS    : maxAllocationMS
                    };
                }

                // update end of max available allocation line
                maxBar.endDate  = period.endDate;
            }

            // if no bar opened
            if (!context.barOpened) {
                // if period belongs to some task(s)
                // need to open new bar
                if (period.inTask) {
                    bar = me.openBar(new Date(period.startDate), context);
                }

            // bar opened & task is finished
            // need to close opened bar
            } else if (!period.inTask) {
                me.closeBar(null, context);

            // bar opened & task in progress
            } else {

                var splitBar = false;

                // if all the tasks got ended ..and new set of tasks has started
                if (me.isBarAssignmentsChanged(context)) {

                    closeDate   = bar.endDate;
                    openDate    = new Date(period.startDate);
                    splitBar    = true;

                // if there is a gap we need to close old bar and start new one
                // ("gap" is when we have no periods during day before newPeriodStart)
                } else if (newPeriodStart && newPeriodStart - bar.endDate >= me.gapThreshold) {

                    // close bar at midnight after bar.endDate
                    closeDate   = Ext.Date.clearTime(bar.endDate, true);
                    if (closeDate < bar.endDate) {
                        closeDate   = Sch.util.Date.add(closeDate, Sch.util.Date.DAY, 1);
                    }

                    // open new bar at midnight before period.startDate
                    openDate    = Ext.Date.clearTime(period.startDate, true);
                    splitBar    = true;

                // if day allocation has changed (due to calendars)
                } else if (newPeriodStart && allocationMS !== prevAllocationMS && period.totalAllocation) {

                    closeDate   = openDate = Ext.Date.clearTime(period.startDate, true);
                    splitBar    = true;

                }

                // let's update the current bar assignments
                // otherwise isBarAssignmentsChanged() above won't be able
                // to track changes properly
                bar.assignments = context.period.assignments;

                if (splitBar) {
                    me.closeBar(closeDate, context);
                    bar = me.openBar(openDate, context);

                } else if (!me.groupAllocationByDay) {
                    context.allocationMS          += period.totalAllocationMS;
                    context.totalOverAllocationMS += period.totalOverAllocationMS || 0;
                    context.maxAllocationMS       += period.endDate - period.startDate;
                    context.totalAllocation       = period.totalAllocation;
                }
            }

            // if we have opened bar
            if (context.barOpened) {
                // update its end date
                bar.endDate     = period.endDate;
            }

        }

        // close bar if task goes after timeline end
        me.closeBar(null, context);

        // if we need to render limits lines
        if (me.showLimitLines) {
            // if there is a gap between working days in resource calendar
            // we need to fill it with zero level lines
            if (me.appendZeroMaxBars(prevPeriodStart || me.getStart(), me.getEnd(), context)) {
                maxBar  = context.maxBar;
            }

            // push last line to lines array
            if (maxBar) {
                maxBars.push(maxBar);
            }
        }

        me.onProcessAllocationDataFinalizeFn && me.onProcessAllocationDataFinalizeFn(context);

        return {
            bars    : bars,
            maxBars : maxBars
        };
    },

    onResourceUpdate : function (store, resource, operation, changedFieldNames) {
        // if calendar on resource was changed
        if (Ext.Array.indexOf(changedFieldNames, resource.calendarIdField) > -1) {
            // setting allocation data for resource it will be updated upon next resource row rendering
            // which should happen as the result of update
            this.resetAllocationDataCache(resource);

            // unbind old listeners from resource calendar
            var oldCalendarId = resource.previous[resource.calendarIdField];
            this.unbindResourceCalendarListener(resource, oldCalendarId);

            // if new resource calendar differs from the project one
            var calendar    = resource.getOwnCalendar();
            if (calendar && calendar !== this.calendar) {
                // bind listener on it
                this.bindResourceCalendarListener(resource);
            }
        }
    },

    onResourceStoreRefresh : function () {
        var me = this;
        // Reset all allocations data and refresh view
        me.clearCacheAndRefresh();
        // bind listeners to resources calendars
        me.bindCalendarListeners();
    },

    refreshIfRendered : function(resource) {
        var me = this;

        if (me.rendered && me.resourceStore && resource) {
            var index = me.resourceStore.indexOf(resource);

            if (index >= 0) {
                me.getView().refreshNode(index);
            }
        }
        else if (me.rendered) {
            me.refreshViews();
        }
    },

    columnRenderer : function (val, meta, resource, rowIndex, colIndex) {
        var me          = this,
            resourceId  = resource.getId(),
            view        = this.normalGrid.getView(),
            data, bars, maxBars;

        // The method is protected against unneeded recalculation
        me.updateAllocationDataCache(resource);

        data    = me.allocationData[resourceId];
        bars    = data && data.bars;
        maxBars = data && data.maxBars;

        // if visible window for the histogram bars is less than all cached bars
        // let's cut this array to pass only related data
        if (bars && (data.barsStartIndex > 0 || data.barsEndIndex < bars.length - 1)) {
            bars    = bars.slice(data.barsStartIndex, data.barsEndIndex + 1);
        }

        // if visible window for the resource limit lines is less than all cached limit lines info
        // let's cut this array to pass only related data
        if (maxBars && (data.maxBarsStartIndex > 0 || data.maxBarsEndIndex < maxBars.length - 1)) {
            maxBars = maxBars.slice(data.maxBarsStartIndex, data.maxBarsEndIndex + 1);
        }

        // changed, rowHeight must be matched in css '.' + Ext.baseCSSPrefix + '-grid-cell-inner'
        //meta.style = 'height:' + this.getSchedulingView().getAvailableRowHeight() + 'px';

        // render: scale lines (if requested),
        return (me.showScaleLines ? view.renderLines() : '') +
            // histogram bars,
            view.renderBars(bars, resourceId) +
            // max resource allocation line (if requested)
            (me.showLimitLines ? view.renderLimitLines(maxBars) : '');
    },

    setRowHeight : function (value, preventRefresh) {
        // TODO add support for setting row height
    }
});
