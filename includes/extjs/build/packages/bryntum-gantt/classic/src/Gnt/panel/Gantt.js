/**
 * @class Gnt.panel.Gantt
 * @extends Sch.panel.TimelineTreePanel
 *
 * A gantt panel, which allows you to visualize and manage tasks and their dependencies.
 *
 * Please refer to the [getting started guide](#!/guide/gantt_getting_started) for a detailed introduction.
 *
 * {@img gantt/images/gantt-panel.png 2x}
 */
Ext.define("Gnt.panel.Gantt", {
    extend              : "Sch.panel.TimelineTreePanel",

    alias               : ['widget.ganttpanel'],
    alternateClassName  : ['Sch.gantt.GanttPanel'],

    mixins                  : [
        'Gnt.view.dependency.Mixin'
    ],

    requires            : [
        'Ext.layout.container.Border',
        'Ext.tree.plugin.TreeViewDragDrop',
        'Ext.util.CSS',
        'Sch.plugin.NonWorkingTime',
        'Gnt.patches.CellEditor',
        'Gnt.patches.Rows',
        'Gnt.patches.SpreadsheetModel',
        'Gnt.patches.SpreadsheetModel_2',
        'Gnt.patches.SpreadsheetModel_3',
        'Gnt.patches.SpreadsheetModel_4',
        'Gnt.patches.SpreadsheetModel_5',
        'Gnt.patches.TablePanel',
        'Gnt.patches.TreeView',
        'Gnt.patches.TreeViewDragDrop',
        'Gnt.patches.SelectionExtender2',
        'Gnt.patches.SelectionExtender3',
        'Gnt.patches.LockingView',
        'Gnt.data.ResourceStore',
        'Gnt.data.AssignmentStore',
        'Gnt.data.Calendar',
        'Gnt.data.TaskStore',
        'Gnt.data.DependencyStore',
        'Gnt.view.Gantt',
        'Gnt.plugin.ConstraintResolutionGui',
        'Gnt.plugin.ProjectLines',
        'Gnt.plugin.Replicator',
        'Gnt.template.TaskTooltip'
    ],

    uses                : [
        'Sch.plugin.CurrentTimeLine'
    ],

    viewType            : 'ganttview',
    layout              : 'border',
    rowLines            : true,
    syncRowHeight       : false,
    rowHeight           : 24,
    rowHeightStyleSheetNode : null,

    /**
     * @cfg {Boolean} disableDateAdjustments
     * If `true`, all dates in date fields, editors, columns, tooltips will be shown exactly as they are in data model.
     * {@link Gnt.model.Task#getDisplayStartDate getDisplayStartDate} and {@link Gnt.model.Task#getDisplayEndDate getDisplayEndDate} will not be invoked.
     */
    disableDateAdjustments : true,

    /**
     * @cfg {Boolean/String/Ext.Template} tooltipTpl
     * Template used to show a tooltip over a scheduled item, true by default (Gnt.template.TaskTooltip). Feel free to extend Gnt.template.TaskTooltip and set the instance directly on the property.
     * The tooltip will be populated with the data in record corresponding to the hovered element. See also {@link #tipCfg} and to provide your own custom data object for this
     * template, please see {@link Sch.mixin.TimelineView#getDataForTooltipTpl}.
     */
    tooltipTpl          : true,

    // holds instance of row numberer column
    rowNumberColumn     : null,

    /**
     * @cfg {String/Object} topLabelField
     * A configuration used to show/edit the field to the top of the task.
     * It can be either string indicating the field name in the data model or a custom object where you can set the following possible properties:
     *
     * - `dataIndex` : String - The field name in the data model
     * - `editor` : Ext.form.Field - The field used to edit the value inline
     * - `renderer` : Function - A renderer method used to render the label. The renderer is called with the 'value' and the record as parameters.
     * - `scope` : Object - The scope in which the renderer is called
     */
    topLabelField       : null,

    /**
     * @cfg {String/Object} leftLabelField
     * A configuration used to show/edit the field to the left of the task.
     * It can be either string indicating the field name in the data model or a custom object where you can set the following possible properties:
     *
     * - `dataIndex` : String - The field name in the data model
     * - `editor` : Ext.form.Field - The field used to edit the value inline
     * - `renderer` : Function - A renderer method used to render the label. The renderer is called with the 'value' and the record as parameters.
     * - `scope` : Object - The scope in which the renderer is called
     */
    leftLabelField      : null,

    /**
     * @cfg {String/Object} bottomLabelField
     * A configuration used to show/edit the field to the bottom of the task.
     * It can be either string indicating the field name in the data model or a custom object where you can set the following possible properties:
     *
     * - `dataIndex` : String - The field name in the data model
     * - `editor` : Ext.form.Field - The field used to edit the value inline
     * - `renderer` : Function - A renderer method used to render the label. The renderer is called with the 'value' and the record as parameters.
     * - `scope` : Object - The scope in which the renderer is called
     */
    bottomLabelField    : null,

    /**
     * @cfg {String/Object} rightLabelField
     * A configuration used to show/edit the field to the right of the task.
     * It can be either string indicating the field name in the data model or a custom object where you can set the following possible properties:
     *
     * - `dataIndex` : String - The field name in the data model
     * - `editor` : Ext.form.Field - The field used to edit the value inline
     * - `renderer` : Function - A renderer method used to render the label. The renderer is called with the 'value' and the record as parameters.
     * - `scope` : Object - The scope in which the renderer is called
     */
    rightLabelField     : null,

    /**
     * @cfg {String/Object} rollupLabelField
     * A configuration used to show the field to the top of the rollup task.
     * It can be either string indicating the field name in the data model or a custom object where you can set the
     * following possible properties:
     *
     * - `dataIndex` : String - The field name in the data model
     * - `renderer` : Function - A renderer method used to render the label. The renderer is called with the 'value' and the record as parameters.
     * - `scope` : Object - The scope in which the renderer is called
     */
    rollupLabelField    : null,

    /**
     * @cfg {Number} rollupIntersectThreshold
     * If two rollup task elements intersect within this value - they are considered to be overlapping.
     * @private
     */
    rollupIntersectThreshold : 5,

    /**
     * @cfg {Boolean} weekendsAreWorkdays
     * Set to `true` to treat *all* days as working, effectively removing the concept of non-working time from gantt. Defaults to `false`.
     * This option just will be translated to the {@link Gnt.data.Calendar#weekendsAreWorkdays corresponding option} of the calendar
     */
    weekendsAreWorkdays : false,

    /**
     * @cfg {Boolean} skipWeekendsDuringDragDrop
     * True to skip the weekends/holidays during drag&drop operations (moving/resizing) and also during cascading. Default value is `true`.
     *
     * Note, that holidays will still be excluded from the duration of the tasks. If you need to completely disable holiday skipping you
     * can do that on the gantt level with the {@link #weekendsAreWorkdays} option, or on the task level with the `SchedulingMode` field.
     *
     *
     * This option just will be translated to the {@link Gnt.data.TaskStore#skipWeekendsDuringDragDrop corresponding option} of the task store
     */
    skipWeekendsDuringDragDrop  : true,

    /**
     * @cfg {Boolean} enableTaskDragDrop
     * True to allow drag drop of tasks (defaults to `true`). To customize the behavior of drag and drop, you can use {@link #dragDropConfig} option
     */
    enableTaskDragDrop          : true,

    /**
     * @cfg {Boolean} enableProgressBarResize
     * True to allow resizing of the progress bar indicator inside tasks (defaults to `false`)
     */
    enableProgressBarResize     : false,


    /**
     * @cfg {Boolean} toggleParentTasksOnClick
     * True to toggle the collapsed/expanded state when clicking a parent task bar (defaults to `true`)
     */
    toggleParentTasksOnClick    : true,

    /**
     * @cfg {Boolean} addRowOnTab
     * True to automatically insert a new row when tabbing out of the last cell of the last row. Defaults to true.
     */
    addRowOnTab                 : true,

    /**
     * @cfg {Boolean} recalculateParents
     * True to update parent start/end dates after a task has been updated (defaults to `true`). This option just will be translated
     * to the {@link Gnt.data.TaskStore#recalculateParents corresponding option} of the task store
     */
    recalculateParents          : true,

    /**
     * @cfg {Boolean} cascadeChanges
     * A boolean flag indicating whether a change in a task should be propagated to its successors.
     * If specified, this option will be passed to the {@link Gnt.data.TaskStore#cascadeChanges corresponding option} of the task store.
     */
    cascadeChanges              : null,

    /**
     * @cfg {Boolean} enableBaseline
     * True to enable showing a base lines for tasks. Baseline information should be provided as the `BaselineStartDate`, `BaselineEndDate` and `BaselinePercentDone` fields.
     * Default value is `false`.
     */
    enableBaseline              : false,

    /**
     * @cfg {Boolean} baselineVisible
     * True to show the baseline in the initial rendering. You can show and hide the baseline programmatically via {@link #showBaseline} and {@link #hideBaseline}.
     * Default value is `false`.
     */
    baselineVisible             : false,

    enableAnimations            : false,
    animate                     : false,

    /**
     * If the {@link #highlightWeekends} option is set to true, you can access the created zones plugin through this property.
     * @property {Sch.plugin.Zones} workingTimePlugin
     */
    workingTimePlugin           : null,
    todayLinePlugin             : null,
    highlightWeekends           : true,

    /**
     * @cfg {Boolean} allowParentTaskMove True to allow moving parent tasks. Please note, that when moving a parent task, the
     * {@link Gnt.data.TaskStore#cascadeDelay cascadeDelay} option will not be used and cascading will happen synchronously (if enabled).
     *
     * Also, its possible to move the parent task as a group (along with its child tasks) or as individual task. This can be controlled with
     * {@link Gnt.data.TaskStore#moveParentAsGroup} option.
     */
    allowParentTaskMove         : true,

    /**
     * @cfg {Boolean} allowParentTaskDependencies Set to `false` to exclude parent tasks from the list of possible predecessors/successors.
     */
    allowParentTaskDependencies : true,

    /**
     * @cfg {Boolean} enableDragCreation
     * True to allow dragging to set start and end dates
     */
    enableDragCreation          : true,

    /**
     * @cfg {Function} eventRenderer
     * Provided so that you can override the rendering attributes provided to the various task HTML templates at runtime. This function is called each time a task
     * is rendered into the gantt grid. The function should return an object with properties that will be applied to the relevant task template.
     * By default, the task templates include placeholders for :
     *
     * - `cls` - CSS class which will be added to the task bar element
     * - `ctcls` - CSS class which will be added to the 'root' element containing the task bar and labels
     * - `style` - inline style declaration for the task bar element
     * - `progressBarStyle` - an inline CSS style to be applied to the progress bar of this task
     * - `leftLabel` - the content for the left label (usually being extracted from the task, using the {@link Gnt.panel.Gantt#leftLabelField leftLabelField} option.
     *   You still need to provide some value for the `leftLabelField` to activate the label rendering
     * - `rightLabel` - the content for the right label (usually being extracted from the task, using the {@link Gnt.panel.Gantt#rightLabelField rightLabelField} option
     *   You still need to provide a value for the `rightLabelField` to activate the label rendering
     * - `topLabel` - the content for the top label (usually being extracted from the task, using the {@link Gnt.panel.Gantt#topLabelField topLabelField} option
     *   You still need to provide a value for the `topLabelField` to activate the label rendering
     * - `bottomLabel` - the content for the bottom label (usually being extracted from the task, using the {@link Gnt.panel.Gantt#bottomLabelField bottomLabelField} option
     *   You still need to provide some value for the `bottomLabelField` to activate the label rendering
     * - `basecls` - a CSS class to be add to the baseline DOM element, only applicable when the {@link Gnt.panel.Gantt#baselineVisible baselineVisible} option is true and the task contains baseline information
     * - `baseStyle` - an inline CSS rule to be applied to the baseline DOM element, only applicable when the {@link Gnt.panel.Gantt#baselineVisible baselineVisible} option is true and the task contains baseline information
     * - `baseProgressBarStyle` - an inline CSS style to be applied to the baseline progress bar element
     *
     * Here is a sample usage of the config:
     *
     * ```javascript
     * eventRenderer : function (taskRec) {
     *     return {
     *         style : 'background-color:white',        // You can use inline styles too.
     *         cls   : taskRec.get('Priority'),         // Read a property from the task record, used as a CSS class to style the event
     *         foo   : 'some value'                     // Some custom value in your own template
     *     };
     * }
     * ```
     *
     * @param {Gnt.model.Task} taskRecord The task about to be rendered
     * @param {Gnt.data.TaskStore} ds The task store
     * @return {Object} The data which will be applied to the task template, creating the actual HTML
     */
    eventRenderer               : null,

    /**
     * @cfg {Object} eventRendererScope The scope (the "this" object)to use for the `eventRenderer` function
     */
    eventRendererScope          : null,

    /**
     * @cfg {Ext.XTemplate} eventTemplate The template used to render leaf tasks in the gantt view.
     * See {@link Ext.XTemplate} for more information, see also {@link Gnt.template.Task} for the definition.
     */
    eventTemplate               : null,

    /**
     * @cfg {Ext.XTemplate} parentEventTemplate The template used to render parent tasks in the gantt view. See {@link Ext.XTemplate} for more information, see also {@link Gnt.template.ParentTask} for the definition
     */
    parentEventTemplate         : null,

    /**
     * @cfg {Ext.XTemplate} rollupTemplate The template used to rollup tasks to the parent in the gantt view. See {@link Ext.XTemplate} for more information, see also {@link Gnt.template.RollupTask} for the definition
     */
    rollupTemplate              : null,

    /**
     * @cfg {Ext.XTemplate} milestoneTemplate The template used to render milestone tasks in the gantt view.
     * See {@link Ext.XTemplate} for more information, see also {@link Gnt.template.Milestone} for the definition.
     */
    milestoneTemplate           : null,

    /**
     * @cfg {String} taskBodyTemplate The markup making up the body of leaf tasks in the gantt view. See also {@link Gnt.template.Task#innerTpl} for the definition.
     */
    taskBodyTemplate            : null,

    /**
     * @cfg {String} parentTaskBodyTemplate The markup making up the body of parent tasks in the gantt view. See also {@link Gnt.template.ParentTask#innerTpl} for the definition.
     */
    parentTaskBodyTemplate      : null,

    /**
     * @cfg {String} milestoneBodyTemplate The markup making up the body of milestone tasks in the gantt view. See also {@link Gnt.template.Milestone#innerTpl} for the definition.
     */
    milestoneBodyTemplate       : null,

    /**
     * @cfg {Boolean} autoHeight Always hardcoded to null, the `true` value is not yet supported (by Ext JS).
     */
    autoHeight                  : null,

    /**
     * @cfg {Gnt.data.Calendar} calendar a {@link Gnt.data.Calendar calendar} instance for this gantt panel. Can be also provided
     * as a {@link Gnt.data.TaskStore#calendar configuration option} of the `taskStore`.
     */
    calendar                    : null,

    /**
     * @cfg {Gnt.data.CrudManager} crudManager The CRUD manager instance controling all the gantt related stores
     *
     * ```javascript
     * var taskStore   = new Gnt.data.TaskStore({
     *     ...
     * });
     *
     * var crudManager = new Gnt.data.CrudManager({
     *     autoLoad    : true,
     *     taskStore   : taskStore,
     *     transport   : {
     *         load    : {
     *             url     : 'load.php'
     *         },
     *         sync    : {
     *             url     : 'save.php'
     *         }
     *     }
     * });
     *
     * var gantt       = new Gnt.panel.Gantt({
     *     // CRUD manager instance having references to all the related stores
     *     crudManager : crudManager,
     *
     *     height      : 300,
     *     width       : 500,
     *     renderTo    : Ext.getBody(),
     *     columns     : [
     *         {
     *             xtype : 'namecolumn'
     *         },
     *         {
     *             xtype : 'startdatecolumn'
     *         },
     *         {
     *             xtype : 'enddatecolumn'
     *         }
     *     ]
     * });
     * ```
     */
    crudManager                 : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore The {@link Gnt.data.TaskStore store} holding the tasks to be rendered into the gantt chart (required).
     */
    taskStore                   : null,

    /**
     * @cfg {Gnt.data.DependencyStore} dependencyStore The {@link Gnt.data.DependencyStore store} holding the dependency information (optional).
     * See also {@link Gnt.model.Dependency}
     */
    dependencyStore             : null,

    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore The {@link Gnt.data.ResourceStore store} holding the resources that can be assigned to the tasks in the task store(optional).
     * See also {@link Gnt.model.Resource}
     */
    resourceStore               : null,

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore The {@link Gnt.data.AssignmentStore store} holding the assignments information (optional).
     * See also {@link Gnt.model.Assignment}
     */
    assignmentStore             : null,

    columnLines                 : false,

    /**
     * @cfg {Function} dndValidatorFn
     *
     * A custom validation function to be called during the drag and drop process
     * and also after the drop operation is made but before it's finalized.
     * If you need to perform an async validation, please take a look at {@link #beforetaskdropfinalize} event instead.
     *
     * @param {Gnt.model.Task} taskRecord The task record being dragged
     * @param {Date} date The new start date
     * @param {Number} duration The duration of the item being dragged, in minutes
     * @param {Ext.EventObject} e The event object
     *
     * @return {Boolean} true if the drop position is valid, else false to prevent a drop
     */
    dndValidatorFn                      : Ext.emptyFn,

    /**
     * @cfg {Function} createValidatorFn
     * An empty function by default, but provided so that you can perform custom validation when a new task is being scheduled using drag and drop.
     * To indicate the newly scheduled dates of a task are invalid, simply return false from this method.
     *
     * @param {Gnt.model.Task} taskRecord the task
     * @param {Date} startDate The start date
     * @param {Date} endDate The end date
     * @param {Event} e The browser event object
     * @return {Boolean} true if the creation event is valid, else false
     */
    createValidatorFn                   : Ext.emptyFn,

    /**
     * @cfg {String} eventResizeHandles
     * @hide
     */
    /**
     * @cfg {Number} startTime
     * @hide
     */
    /**
     * @cfg {Number} endTime
     * @hide
     */

    /**
     * @cfg {String} taskResizeHandles A string containing one of the following values
     *
     * - `none` - to disable resizing of tasks
     * - `left` - to enable changing of start date only
     * - `right` - to enable changing of end date only
     * - `both` - to enable changing of both start and end dates
     *
     * Default value is `both`. Resizing is performed with the {@link Gnt.feature.TaskResize} plugin.
     * You can customize it with the {@link #resizeConfig} and {@link #resizeValidatorFn} options
     */
    taskResizeHandles                   : 'both',

    /**
     * @cfg {Function} resizeValidatorFn
     * An empty function by default, but provided so that you can perform custom validation on
     * a task being resized. Simply return false from your function to indicate that the new duration is invalid.
     *
     * @param {Gnt.model.Task} taskRecord The task being resized
     * @param {Date} startDate The new start date
     * @param {Date} endDate The new end date
     * @param {Ext.EventObject} e The event object
     *
     * @return {Boolean} true if the resize state is valid, else false to cancel
     */
    resizeValidatorFn                   : Ext.emptyFn,

    /**
     *  @cfg {Object} resizeConfig A custom config object to pass to the {@link Gnt.feature.TaskResize} feature.
     */
    resizeConfig                        : null,

    /**
     *  @cfg {Object} progressBarResizeConfig A custom config object to pass to the {@link Gnt.feature.ProgressBarResize} feature.
     */
    progressBarResizeConfig             : null,

    /**
     *  @cfg {Object} dragDropConfig A custom config object to pass to the {@link Gnt.feature.taskdd.DragZone} feature.
     */
    dragDropConfig                      : null,

    /**
     *  @cfg {Object} createConfig A custom config to pass to the {@link Gnt.feature.DragCreator} instance
     */
    createConfig                        : null,

    /**
     *  @cfg {Boolean/Object} autoFitOnLoad True to change the timeframe of the gantt to fit all the tasks in it after every task store load.
     * Also accepts a config object passed as 'options' to the zoomToFit method
     * See also {@link #zoomToFit}.
     */

    autoFitOnLoad                       : false,

    /**
     *  @cfg {Boolean} showRollupTasks True to rollup information of tasks to their parent task bar.
     *  Only tasks with the {@link Gnt.model.Task#Rollup Rollup} field set to true will rollup.
     */
    showRollupTasks                     : false,

    /**
     * @cfg {Boolean} enableConstraintsResolutionGui `true` to enable the plugin, providing the constraint resolution popup window.
     * Enabled by default.
     */
    enableConstraintsResolutionGui      : true,

    /**
     * @cfg {Boolean}
     * `True` to mark project start/end dates with vertical lines using {@link Gnt.plugin.ProjectLines} plugin.
     * Use {@link #projectLinesConfig} to configure the plugin.
     */
    showProjectLines                    : true,

    /**
     * @cfg {Object} projectLinesConfig
     * Config to use for {@link Gnt.plugin.ProjectLines} plugin.
     */
    projectLinesConfig                  : null,

    /**
     * @cfg {Object} constraintResolutionGuiConfig Config to use for {@link Gnt.plugin.ConstraintResolutionGui} plugin.
     */
    constraintResolutionGuiConfig       : null,

    /**
     * @cfg {Boolean}
     * `True` to scroll tasks horizontally into view when clicking a task row.
     */
    scrollTaskIntoViewOnClick           : false,

    /**
     * @cfg {Boolean/Object}
     * `True` to scroll tasks to be reordered in the left table section of the Gantt chart. Adds a Ext.tree.plugin.TreeViewDragDrop plugin
     * to the Gantt chart. You can configure this plugin by passing an Object instead of a boolean.
     *
     */
    enableTaskReordering                : true,

    refreshLockedTreeOnDependencyUpdate : false,
    _lockedDependencyListeners          : null,

    // when gantt is configured to keep selection this property will hold return value of selectionModel.getSelected()
    _lastSpreadsheetSelection           : null,

    earlyColumns                        : null,
    lateColumns                         : null,
    columnListMenuItem                  : null,

    earlyDatesListeners                 : null,
    lateDatesListeners                  : null,
    fullRefreshColumnsListeners         : null,
    refreshTimeout                      : 100,
    batchUpdate                         : false,

                                          // Default to border less task bars in our Triton, Crisp, Aria, Graphite, Material themes
    eventBorderWidth                    : (Ext.theme && Ext.theme.name.match('Triton|Crisp|Aria|Graphite|Material') ? 0 : 1),

    //A reference to the editing plugin, if it exists
    ganttEditingPlugin                  : null,

    /**
     * @cfg {Number} simpleCascadeThreshold If number of tasks affected during cascading (see {@link Gnt.data.TaskStore} for details on __cascading__ term)
     * is below this number, the panel does a per-row update instead of a full refresh.
     */
    simpleCascadeThreshold              : 30,

    forceDefineTimeSpanByStore          : true,

    crudManagerDetacher                 : null,
    taskStoreDetacher                   : null,
    assignmentStoreDetacher             : null,
    resourceStoreDetacher               : null,

    // Prevent excessive view refreshes, but can lead to an error in buffered rendering
    // https://app.assembla.com/spaces/bryntum/tickets/7479
    suspendRefreshOnTaskReorder         : true,

    /**
     * This method shows or hides the visual presentation of task's rollups in the view.
     * @param {Boolean} show A boolean value indicating whether the visual presentation of task's rollups should be visible or not.
     */
    setShowRollupTasks : function (show) {
        this.showRollupTasks = show;

        this.getSchedulingView().setShowRollupTasks(show);
    },

    onCalendarSet : function (store, calendar) {
        if (this.needToTranslateOption('weekendsAreWorkdays')) {
            // may trigger a renormalization of all tasks - need all stores to be defined
            calendar.setWeekendsAreWorkDays(this.weekendsAreWorkdays);
        }

        if (this.workingTimePlugin) {
            this.workingTimePlugin.bindCalendar(calendar);
            this.timeAxisViewModel.setCalendar(calendar);
        }
    },

    bindTaskStore : function (taskStore) {
        var me = this;

        // if we have previously bound listeners - detach them
        Ext.destroy(me.taskStoreRelayers);

        taskStore.calendar.un('calendarchange', me.onCalendarChange, me);

        me.taskStoreRelayers = me.relayEvents(taskStore, [
            'resourcestorechange',
            'assignmentstorechange',
            'dependencystorechange'
        ]);

        // if we have previously bound listeners - detach them
        Ext.destroy(me.taskStoreDetacher);

        me.taskStoreDetacher = me.mon(taskStore, {
            'calendarset'             : me.onCalendarSet,
            'beforeindentationchange' : me.onBeforeBatchStoreUpdate,
            'indentationchange'       : me.onBatchStoreUpdate,
            'indentationcancel'       : me.onCancelBatchStoreUpdate,
            'beforebatchremove'       : me.onBeforeBatchStoreUpdate,
            'batchremove'             : me.onBatchStoreUpdate,
            'beforecascade'           : me.onBeforeCascade,
            'cascade'                 : me.onAfterCascade,

            scope                     : me,
            destroyable               : true
        });

        // Make sure header is refreshed if project calendar is changed (non-working time added, removed or updated)
        taskStore.calendar.on('calendarchange', me.onCalendarChange, me);
    },

    onCalendarChange : function () {
        var timeAxisColumn = this.getHorizontalTimeAxisColumn();

        timeAxisColumn && timeAxisColumn.refresh();
    },

    setTaskStore : function (taskStore, initial) {
        var me = this,
            oldStore = me.getTaskStore();

        if (taskStore !== oldStore || initial) {

            taskStore = Ext.StoreMgr.lookup(taskStore);

            if (!taskStore) {
                Ext.Error.raise("You have provided an incorrect taskStore identifier");
            }

            if (!(taskStore instanceof Gnt.data.TaskStore)) {
                Ext.Error.raise("A `taskStore` should be an instance of `Gnt.data.TaskStore` (or of a subclass)");
            }

            me.taskStore = taskStore;

            taskStore.disableDateAdjustments = me.disableDateAdjustments;

            if (!initial) {
                me.reconfigure(taskStore);
                me.fireEvent('taskstorechange', me, taskStore, oldStore);
            } else {
                me.store = taskStore;
            }

            // bind task store listeners
            me.bindTaskStore(taskStore);
        }
    },

    setDependencyStore : function (dependencyStore, initial) {
        if (this.dependencyStore !== dependencyStore || initial) {
            this.dependencyStore = Ext.StoreMgr.lookup(dependencyStore);

            if (!(this.dependencyStore instanceof Gnt.data.DependencyStore)) {
                Ext.Error.raise("The Gantt dependency store should be a Gnt.data.DependencyStore, or a subclass thereof.");
            }

            this.dependencyStore.allowParentTaskDependencies = this.allowParentTaskDependencies;

            this.getTaskStore().setDependencyStore(this.dependencyStore);
        }
    },

    bindResourceStore : function (resourceStore) {
        var me = this;

        me.resourceStoreDetacher && me.resourceStoreDetacher.destroy();

        if (resourceStore) {
            me.resourceStoreDetacher = me.mon(resourceStore, {
                'update'      : me.onResourceStoreUpdate,
                'add'         : me.onResourceStoreDataChanged,
                'remove'      : me.onResourceStoreDataChanged,
                'write'       : me.onResourceStoreDataChanged,
                'refresh'     : me.onResourceStoreDataChanged,
                'sort'        : me.onResourceStoreDataChanged,
                'filter'      : me.onResourceStoreDataChanged,
                'clear'       : me.onResourceStoreDataChanged,
                destroyable   : true,
                scope         : me
            });
        }
    },

    setResourceStore : function (resourceStore, initial) {
        var prevStore = this.resourceStore;

        if (prevStore !== resourceStore || initial) {

            resourceStore = Ext.StoreMgr.lookup(resourceStore);

            if (!(resourceStore instanceof Gnt.data.ResourceStore)) {
                Ext.Error.raise("A `ResourceStore` should be an instance of `Gnt.data.ResourceStore` (or of a subclass)");
            }

            // destroy previous resource store if it's meant to be
            prevStore && prevStore.autoDestroy && prevStore.destroy();

            this.getTaskStore().setResourceStore(resourceStore);

            this.resourceStore = resourceStore;

            this.bindResourceStore(resourceStore);

            if (resourceStore && !initial) {
                this.refreshViews();
            }
        }
    },

    bindAssignmentStore : function (assignmentStore) {
        var me = this;

        me.assignmentStoreDetacher && me.assignmentStoreDetacher.destroy();

        if (assignmentStore) {
            me.assignmentStoreDetacher = me.mon(assignmentStore, {
                'beforetaskassignmentschange' : me.onBeforeSingleTaskAssignmentChange,
                'taskassignmentschanged'      : me.onSingleTaskAssignmentChange,

                'update'      : me.onAssignmentStoreUpdate,
                'add'         : me.onAssignmentStoreDataChanged,
                'remove'      : me.onAssignmentStoreDataChanged,
                'write'       : me.onAssignmentStoreDataChanged,
                'refresh'     : me.onAssignmentStoreDataChanged,
                'filter'      : me.onAssignmentStoreDataChanged,
                'sort'        : me.onAssignmentStoreDataChanged,
                'clear'       : me.onAssignmentStoreDataChanged,
                // private event, required to update the UI after a removed assignment
                'commit'      : me.onAssignmentStoreDataChanged,

                destroyable : true,
                scope       : me
            });
        }
    },

    setAssignmentStore : function (assignmentStore, initial) {
        var prevStore = this.assignmentStore;

        if (prevStore !== assignmentStore || initial) {

            assignmentStore = Ext.StoreMgr.lookup(assignmentStore);

            if (!(assignmentStore instanceof Gnt.data.AssignmentStore)) {
                Ext.Error.raise("An `assignmentStore` should be an instance of `Gnt.data.AssignmentStore` (or of a subclass)");
            }

            prevStore && prevStore.autoDestroy && prevStore.destroy();

            this.getTaskStore().setAssignmentStore(assignmentStore);

            this.assignmentStore = assignmentStore;

            this.bindAssignmentStore(assignmentStore);

            if (assignmentStore && !initial) {
                this.refreshViews();
            }
        }
    },

    bindCrudManager : function (crudManager) {
        this.crudManagerDetacher && this.crudManagerDetacher.destroy();

        this.crudManagerDetacher = this.mon(crudManager, {
            'beforeresponseapply' : this.onBeforeCrudResponseApply,
            'requestdone'         : this.onCrudRequestDone,

            priority              : -900,
            destroyable           : true,
            scope                 : this
        });
    },

    initStores : function () {

        // if we have CrudManager instance assigned we can grab stores from it
        if (this.crudManager) {
            if (!(this.crudManager instanceof Gnt.data.CrudManager)) {
                this.crudManager = Ext.create(this.crudManager.xclass || 'Gnt.data.CrudManager', Ext.clone(this.crudManager));
            }

            if (!this.taskStore) this.taskStore             = this.crudManager.getTaskStore(this);
            if (!this.dependencyStore) this.dependencyStore = this.crudManager.getDependencyStore(this);
            if (!this.resourceStore) this.resourceStore     = this.crudManager.getResourceStore(this);
            if (!this.assignmentStore) this.assignmentStore = this.crudManager.getAssignmentStore(this);

            this.bindCrudManager(this.crudManager);
        }

        this.setTaskStore(this.taskStore, true);

        var taskStore = this.getTaskStore();

        this.setDependencyStore(this.dependencyStore || taskStore.getDependencyStore(), true);
        this.setResourceStore(this.resourceStore || taskStore.getResourceStore(), true);
        this.setAssignmentStore(this.assignmentStore || taskStore.getAssignmentStore(), true);

        if (this.needToTranslateOption('weekendsAreWorkdays')) {
            // may trigger a renormalization of all tasks - need all stores to be defined
            taskStore.getCalendar().setWeekendsAreWorkDays(this.weekendsAreWorkdays);
        }
    },

    // For buffered rendering, we need to avoid each indent/outdent operation causing a full view refresh + layouts + re-filtering
    // Tested in /#view/213_indent.t.js
    onBeforeBatchStoreUpdate : function () {
        var lockedView = this.lockedGrid.getView(),
            schedulingView = this.getSchedulingView();

        this.batchUpdate = true;

        this.taskStore.filterUpdateSuspended = true;

        // HACK prevent view from updating UI while indent is ongoing
        // this.lockedGrid.view.viewReady = this.normalGrid.view.viewReady = false;

        this._scrollStateBeforeBatchUpdate = {
            left: lockedView.getScrollX(),
            top: schedulingView.getVerticalScroll()
        };

        this.taskStore.suspendEvent('refresh', 'add', 'insert', 'remove');

        var position = this.getSchedulingView().getNavigationModel().getPosition();

        if (position) {
            // During indent (not outdent) operation store will fire few update events (for single record
            // 3 events will be fired) that will trigger view rows to be updated. Renderer will call getPosition() on
            // navigation model and that call will null position. So following refresh couldn't save navigation position
            // because it was already nulled. That doesn't happen on outdent, because no update events thrown on store
            // Idea behind this fix is to restore navigation position
            // 213_indent
            this._lastNavigationPosition = position.clone();
        }

        if (this.bufferedRenderer) {
            this.suspendLayouts();
        }
    },

    onBatchStoreUpdate : function () {
        var lockedView = this.lockedGrid.getView(),
            taskStore = this.getTaskStore(),
            navModel,
            lastNavigationPosition;

        taskStore.resumeEvent('refresh', 'add', 'insert', 'remove');

        // HACK prevent view from updating UI while indent is ongoing
        lockedView.viewReady = this.normalGrid.view.viewReady = true;

        taskStore.filterUpdateSuspended = false;

        lastNavigationPosition = this._lastNavigationPosition;

        if (lastNavigationPosition) {

            navModel = this.getSchedulingView().getNavigationModel();

            // HACK: This is the hack to solve #4699, but this all those hacks around I see no other method
            // https://app.assembla.com/spaces/bryntum/tickets/4699
            if (lastNavigationPosition.record && !taskStore.getNodeById(lastNavigationPosition.record.getId())) {
                lastNavigationPosition.record = taskStore.getAt(lastNavigationPosition.recordIndex);
            }

            navModel.setPosition(lastNavigationPosition);

            delete this._lastNavigationPosition;
        }

        this.refreshViews();

        // Ext JS resets grid scroll position when removing a task, restore it manually
        if (this._scrollStateBeforeBatchUpdate) {
            lockedView.setScrollX(this._scrollStateBeforeBatchUpdate.left);
            lockedView.setScrollY(this._scrollStateBeforeBatchUpdate.top);

            this._scrollStateBeforeBatchUpdate = null;
        }

        if (this.bufferedRenderer) {
            this.resumeLayouts(true);

            taskStore.onNeedToUpdateFilter();
        }

        this.batchUpdate = false;
    },

    onCancelBatchStoreUpdate : function () {
        var taskStore = this.getTaskStore(),
            navModel,
            lastNavigationPosition;

        taskStore.resumeEvent('refresh', 'add', 'insert', 'remove');

        // HACK prevent view from updating UI while indent is ongoing
        this.lockedGrid.view.viewReady = this.normalGrid.view.viewReady = true;

        taskStore.filterUpdateSuspended = false;

        lastNavigationPosition = this._lastNavigationPosition;

        if (lastNavigationPosition) {

            navModel = this.getSchedulingView().getNavigationModel();

            // HACK: This is the hack to solve #4699, but this all those hacks around I see no other method
            // https://app.assembla.com/spaces/bryntum/tickets/4699
            if (lastNavigationPosition.record && !taskStore.getNodeById(lastNavigationPosition.record.getId())) {
                lastNavigationPosition.record = taskStore.getAt(lastNavigationPosition.recordIndex);
            }

            navModel.setPosition(lastNavigationPosition);

            delete this._lastNavigationPosition;
        }

        if (this.bufferedRenderer) {
            this.resumeLayouts(true);
        }

        this.batchUpdate = false;
    },

    initComponent : function () {
        this.autoHeight = false;

        this.initStores();

        if (this.cascadeChanges != null) {
            this.setCascadeChanges(this.cascadeChanges);
        }

        if (this.needToTranslateOption('recalculateParents')) {
            this.setRecalculateParents(this.recalculateParents);
        }

        if (this.needToTranslateOption('skipWeekendsDuringDragDrop')) {
            this.setSkipWeekendsDuringDragDrop(this.skipWeekendsDuringDragDrop);
        }

        this.dependencyViewConfig = this.dependencyViewConfig || {};
        // Copy some settings to dependencyViewConfig instance
        Ext.applyIf(this.dependencyViewConfig, {
            enableDependencyDragDrop : this.enableDependencyDragDrop
        });

        this.normalViewConfig = this.normalViewConfig || {};
        // Copy some properties to the view instance
        Ext.applyIf(this.normalViewConfig, {
            taskStore                    : this.taskStore,
            dependencyStore              : this.dependencyStore,
            snapRelativeToEventStartDate : this.snapRelativeToEventStartDate,
            progressBarResizeConfig      : this.progressBarResizeConfig,
            enableDependencyDragDrop     : this.enableDependencyDragDrop,
            enableTaskDragDrop           : this.enableTaskDragDrop,
            enableProgressBarResize      : this.enableProgressBarResize,
            enableDragCreation           : this.enableDragCreation,

            allowParentTaskMove          : this.allowParentTaskMove,
            allowParentTaskDependencies  : this.allowParentTaskDependencies,
            toggleParentTasksOnClick     : this.toggleParentTasksOnClick,

            taskResizeHandles            : this.taskResizeHandles,
            enableBaseline               : this.baselineVisible || this.enableBaseline,

            leftLabelField               : this.leftLabelField,
            rightLabelField              : this.rightLabelField,
            topLabelField                : this.topLabelField,
            bottomLabelField             : this.bottomLabelField,

            rollupLabelField             : this.rollupLabelField,
            rollupIntersectThreshold     : this.rollupIntersectThreshold,

            eventTemplate                : this.eventTemplate,
            parentEventTemplate          : this.parentEventTemplate,
            milestoneTemplate            : this.milestoneTemplate,
            rollupTemplate               : this.rollupTemplate,

            taskBodyTemplate             : this.taskBodyTemplate,
            parentTaskBodyTemplate       : this.parentTaskBodyTemplate,
            milestoneBodyTemplate        : this.milestoneBodyTemplate,

            resizeConfig                 : this.resizeConfig,
            dragDropConfig               : this.dragDropConfig,
            showRollupTasks              : this.showRollupTasks
        });


        if (this.topLabelField || this.bottomLabelField) {
            this.addCls('sch-gantt-topbottom-labels ' + (this.topLabelField ? 'sch-gantt-top-label' : ''));
            this.rowHeight = Math.max(60, this.rowHeight);
        }

        this.configureFunctionality();

        if (this.tooltipTpl === true) {
            this.tooltipTpl = new Gnt.template.TaskTooltip();
        }

        this.callParent(arguments);

        var sm                 = this.getSelectionModel();
        var isSpreadsheetModel = Ext.grid.selection && Ext.grid.selection.SpreadsheetModel && sm instanceof Ext.grid.selection.SpreadsheetModel;

        // https://www.assembla.com/spaces/bryntum/tickets/2609
        // Selection should not be lost after record is removed
        if (isSpreadsheetModel) {
            this.mon(this.taskStore, {
                remove      : this.tryRestoreSelectionAfterRemove,
                // catch event before selection model can react to that
                // for ext 6.0.1 it's enough priority to get correct selection in listener
                priority    : 1,
                scope       : this
            });

            // In ext 6.0.0 remove event has listeners with priority 1000 that will refresh view
            // and loose selection before we can restore it
            this.mon(this.taskStore, {
                remove      : this.storeSelectionBeforeRemove,
                // this priority required to catch remove before view is refreshed
                // 200 is default priority in 6.2.0, look for "r.priority = 2000;"
                priority    : 2001,
                scope       : this
            });

            // batch remove will trigger refresh and clear cell selection, we need to save it
            this.mon(this.taskStore, {
                beforebatchremove   : this.storeSelectionBeforeRemove,
                batchremove         : this.tryRestoreSelectionAfterBatchRemove,
                scope               : this
            });
        }

        // https://app.assembla.com/spaces/bryntum/tickets/3915
        if (isSpreadsheetModel) {
            // HACK - move the drag handle into locked grid since it should not live in the 'top' grid
            // because it will be visible in normal view
            var lockedGrid  = this.lockedGrid;
            var old         = sm.applyExtensible;

            sm.applyExtensible = function (extensible) {
                var selExt = old.apply(this, arguments);

                lockedGrid.view.el.appendChild(selExt.handle);

                this.applyExtensible = old;

                return selExt;
            };
        }

        if (this.autoFitOnLoad) {
            var fitOptions = typeof this.autoFitOnLoad === 'object' ? this.autoFitOnLoad : {};

            // in order to make zoomToFit work ok, normal view should have some width
            this.normalGrid.on('afterlayout', function () {
                // if store already loaded
                if (this.store.getCount()) {
                    this.zoomToFit(null, fitOptions);
                }

                // append listener now to make sure we do not fit twice during initial rendering
                this.mon(this.store, 'load', function () {
                    this.zoomToFit(null, fitOptions);
                }, this);
            }, this, { single : true });
        }

        this.bodyCls = (this.bodyCls || '') + " sch-ganttpanel-container-body";

        var ganttView = this.getSchedulingView();

        this.relayEvents(ganttView, [
            /**
             * @event taskclick
             * Fires when a task is clicked
             *
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task record
             * @param {Ext.EventObject} e The event object
             */
            'taskclick',

            /**
             * @event taskdblclick
             * Fires when a task is double clicked
             *
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task record
             * @param {Ext.EventObject} e The event object
             */
            'taskdblclick',

            /**
             * @event taskcontextmenu
             * Fires when contextmenu is activated on a task
             *
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task record
             * @param {Ext.EventObject} e The event object
             */
            'taskcontextmenu',

            // Resizing events start --------------------------
            /**
             * @event beforetaskresize
             * @preventable
             * Fires before a resize starts, return false to stop the execution
             *
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task about to be resized
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskresize',

            /**
             * @event taskresizestart
             * Fires when resize starts
             *
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task about to be resized
             */
            'taskresizestart',

            /**
             * @event partialtaskresize
             * Fires during a resize operation and provides information about the current start and end of the resized event
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task being resized
             * @param {Date} startDate The start date of the task
             * @param {Date} endDate The end date of the task
             * @param {Ext.Element} element The element being resized
             */
            'partialtaskresize',

            /**
             * @event beforetaskresizefinalize
             * @preventable
             * Fires before a succesful resize operation is finalized. Return false to finalize the resize at a later time.
             * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
             * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
             * @param {Mixed} view The gantt view instance
             * @param {Object} resizeContext An object containing 'record', 'start', 'end', 'finalize' properties.
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskresizefinalize',

            /**
             * @event aftertaskresize
             * Fires after a succesful resize operation
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task that has been resized
             */
            'aftertaskresize',
            // Resizing events end --------------------------

            // Task progress bar resizing events start --------------------------
            /**
             * @event beforeprogressbarresize
             * @preventable
             * Fires before a progress bar resize starts, return false to stop the execution
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The record about to be have its progress bar resized
             */
            'beforeprogressbarresize',

            /**
             * @event progressbarresizestart
             * Fires when a progress bar resize starts
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The record about to be have its progress bar resized
             */
            'progressbarresizestart',

            /**
             * @event afterprogressbarresize
             * Fires after a succesful progress bar resize operation
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord record The updated record
             */
            'afterprogressbarresize',
            // Task progressbar resizing events end --------------------------

            // Dnd events start --------------------------
            /**
             * @event beforetaskdrag
             * @preventable
             * Fires before a task drag drop is initiated, return false to cancel it
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The task record that's about to be dragged
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskdrag',

            /**
             * @event taskdragstart
             * Fires when a dnd operation starts
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The record being dragged
             */
            'taskdragstart',

            /**
             * @event beforetaskdropfinalize
             * @preventable
             *
             * Fires before a SUCCESSFUL drop operation is finalized.
             * This event is supposed to be used as a SYNCHRONOUS hook before the drop finalizing, or as an ASYNCHRONOUS drop validator.
             * Return `true` to finalize the drop operation immediately, or return `false` to finalize it later.
             * To finalize the operation later, call the 'finalize' method available on the context object.
             * Pass `true` to the `finalize` function to accept the drop or `false` if you want to cancel it.
             *
             * Here is an example of a **sync** hook:
             *
             * ```javascript
             * beforetaskdropfinalize : function (view, dragContext, e) {
             *     dragContext.record.setCls('dropped');
             *     return true;
             * }
             *
             * ```
             *
             * Here is an example of an **async** hook:
             *
             * ```javascript
             * beforetaskdropfinalize : function (view, dragContext, e) {
             *     Ext.Ajax.request({
             *         url     : '/check-the-drop-operation',
             *         success : function (response) {
             *             // confirm the drop operation
             *             dragContext.finalize(true);
             *         },
             *         failure : function (response) {
             *             // decline the drop operation
             *             dragContext.finalize(false);
             *         }
             *     });
             *     return false;
             * }
             * ```
             *
             * **NOTE:** In case you return `false` from the listener, you should ALWAYS call the `finalize` function,
             * no matter with `true` argument to confirm the drop operation, or with `false` argument to decline it.
             *
             * **NOTE2:** If you need to perform SYNCHRONOUS drop validation please take a look at {@link #dndValidatorFn}.
             *
             * @param {Mixed} view The gantt view instance
             * @param {Object} dragContext An object containing 'record', 'start', 'duration' (in minutes), 'finalize' properties.
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskdropfinalize',

            /**
             * @event beforedragcreate
             * @preventable
             * Fires before a drag create operation starts, return false to prevent the operation
             * @param {Gnt.view.Gantt} gantt The gantt view
             * @param {Gnt.model.Task} task The task record being updated
             * @param {Date} date The date of the drag start point
             * @param {Ext.EventObject} e The event object
             */
            'beforedragcreate',

            /**
             * @event dragcreatestart
             * Fires before a drag starts, return false to stop the operation
             * @param {Gnt.view.Gantt} view The gantt view
             */
            'dragcreatestart',

            /**
             * @event beforedragcreatefinalize
             * @preventable
             * Fires before a succesful create operation is finalized. Return false to finalize creating at a later time.
             * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
             * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
             * @param {Mixed} view The gantt view instance
             * @param {Object} createContext An object containing 'record', 'start', 'end', 'finalize' properties.
             * @param {Ext.EventObject} e The event object
             */
            'beforedragcreatefinalize',

            /**
             * @event dragcreateend
             * Fires after a successful drag-create operation
             * @param {Gnt.view.Gantt} view The gantt view
             * @param {Gnt.model.Task} task The updated task record
             * @param {Ext.EventObject} e The event object
             */
            'dragcreateend',

            /**
             * @event afterdragcreate
             * Always fires after a drag-create operation
             * @param {Gnt.view.Gantt} view The gantt view
             */
            'afterdragcreate',

            /**
             * @event taskdrop
             * Fires after a succesful drag and drop operation
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} taskRecord The dropped record
             */
            'taskdrop',

            /**
             * @event aftertaskdrop
             * Fires after a drag and drop operation, regardless if the drop valid or invalid
             * @param {Gnt.view.Gantt} gantt The gantt panel instance
             * @param {Gnt.model.Task} task The task instance
             */
            'aftertaskdrop',
            // Dnd events end --------------------------

            /**
             * @event labeledit_beforestartedit
             * Fires before editing is started for a field
             * @param {Gnt.view.Gantt} gantt The gantt view instance
             * @param {Gnt.model.Task} taskRecord The task record
             * @param {Mixed} value The field value being set
             * @param {Gnt.feature.LabelEditor} editor The editor instance
             */
            'labeledit_beforestartedit',

            /**
             * @event labeledit_beforecomplete
             * Fires after a change has been made to a label field, but before the change is reflected in the underlying field.
             * @param {Gnt.view.Gantt} gantt The gantt view instance
             * @param {Mixed} value The current field value
             * @param {Mixed} startValue The original field value
             * @param {Gnt.model.Task} taskRecord The affected record
             * @param {Gnt.feature.LabelEditor} editor The editor instance
             */
            'labeledit_beforecomplete',

            /**
             * @event labeledit_complete
             * Fires after editing is complete and any changed value has been written to the underlying field.
             * @param {Gnt.view.Gantt} gantt The gantt view instance
             * @param {Mixed} value The current field value
             * @param {Mixed} startValue The original field value
             * @param {Gnt.model.Task} taskRecord The affected record
             * @param {Gnt.feature.LabelEditor} editor The editor instance
             */
            'labeledit_complete',

            /**
             * @event scheduleclick
             * Fires after a click on the schedule area
             * @param {Gnt.panel.Gantt} gantt The gantt panel object
             * @param {Date} clickedDate The clicked date
             * @param {Number} rowIndex The row index
             * @param {Ext.EventObject} e The event object
             */
            'scheduleclick',

            /**
             * @event scheduledblclick
             * Fires after a doubleclick on the schedule area
             * @param {Gnt.panel.Gantt} gantt The gantt panel object
             * @param {Date} clickedDate The clicked date
             * @param {Number} rowIndex The row index
             * @param {Ext.EventObject} e The event object
             */
            'scheduledblclick',

            /**
             * @event schedulecontextmenu
             * Fires after a context menu click on the schedule area
             * @param {Gnt.panel.Gantt} gantt The gantt panel object
             * @param {Date} clickedDate The clicked date
             * @param {Number} rowIndex The row index
             * @param {Ext.EventObject} e The event object
             */
            'schedulecontextmenu',

            // Not supported in gridview as of Ext 6.0.1
            // https://www.sencha.com/forum/showthread.php?307978-GridPanel-should-fire-rowlongpress-celllongpress-etc&p=1124914#post1124914
            'rowlongpress',
            'containerlongpress'
        ]);

        this.relayEvents(this.lockedGrid.getView(), [
            // Not supported in gridview as of Ext 6.0.1
            // https://www.sencha.com/forum/showthread.php?307978-GridPanel-should-fire-rowlongpress-celllongpress-etc&p=1124914#post1124914
            'rowlongpress',
            'containerlongpress'
        ]);

        if (this.addRowOnTab) {
            var lockedView = this.lockedGrid.getView();
            lockedView.onRowExit = Ext.Function.createInterceptor(lockedView.onRowExit, this.beforeRowExit, this);
        }

        this.registerRenderer(ganttView.columnRenderer, ganttView);

        var cls = ' sch-ganttpanel sch-horizontal ';

        this.addCls(cls);

        if (this.eventBorderWidth < 1) {
            this.addCls('sch-gantt-no-task-border');
        }

        if (this.baselineVisible) {
            this.showBaseline();
        }

        // HACK: Editors belong in the locked grid, otherwise they float visibly on top of the normal grid when scrolling the locked grid
        this.on('add', function (me, cmp) {
            if (cmp instanceof Ext.Editor) {
                me.lockedGrid.suspendLayouts();
                me.suspendLayouts();
                me.lockedGrid.add(cmp);
                me.resumeLayouts();
                me.lockedGrid.resumeLayouts();
            }
        });

        this.on({
            viewready        : this.onMyViewReady,

            // Prevent the Pan plugin from interfering with a dragcreate action
            dragcreatestart : function() {
                var panPlug = this.findPlugin('scheduler_pan');
                var scrollable = this.getSchedulingView().getScrollable();

                if (panPlug){
                    panPlug.disable();
                }

                scrollable.setDisabled && scrollable.setDisabled(true);
            },

            afterdragcreate : function() {
                var panPlug = this.findPlugin('scheduler_pan');
                var scrollable = this.getSchedulingView().getScrollable();

                if (panPlug){
                    panPlug.enable();
                }

                scrollable.setDisabled && scrollable.setDisabled(false);
            },

            scope : this
        });

        if (this.scrollTaskIntoViewOnClick) {
            this.lockedGrid.on('itemclick', this.onRowClicked, this);
        }

        Ext.Array.each(this.lockedGrid.plugins || [], function (plug) {
            if (Sch.plugin && Sch.plugin.TreeCellEditing && plug instanceof Sch.plugin.TreeCellEditing) {
                this.ganttEditingPlugin = plug;

                return false;
            }
        }, this);
    },

    tryRestoreSelectionAfterRemove : function (store, records, index, isMove) {
        // this listener is prioritized, it will get old data in selection model and modified store/view
        var selModel = this.getSelectionModel();
        var selected = this._lastSpreadsheetSelection || selModel.selected;

        this._lastSpreadsheetSelection = null;

        // Ignore move, or if nothing was selected yet or store is empty
        if (isMove || !selected || store.getCount() === 0) { return; }

        var view = this.lockedGrid.getView();

        if (selected.isCells) {
            var range = selected.getRange();

            // Do not do anything, if negative coordinates passed. Can happen when node is collapsed with
            // click in 6.0.1
            if (range[1][0] === -1) {
                return;
            }
            var nodesCount = view.getNodes().length - 1;
            selModel.selectCells(
                [range[0][0], Math.min(nodesCount, range[0][1])],
                [range[1][0], Math.min(nodesCount, range[1][1])]
            );
        } else if (selected.isRows) {
            var selectedRecords = selected.getRecords();

            if (selectedRecords.length) {
                var selectedRecordExists = false;

                for (var i = 0, len = selectedRecords.length; i < len; i++) {
                    // if any record from current selection is still alive - selection model will handle it itself
                    if (selectedRecordExists = selectedRecordExists || store.indexOf(selectedRecords[i]) !== -1) {
                        break;
                    }
                }

                // if smth was selected and nothing is now - select record by current index or last in store
                if (!selectedRecordExists) {
                    var recordToSelect = view.getRecord(Math.min(index, store.getCount() - 1));
                    recordToSelect && selModel.select(recordToSelect);
                }
            }
        }
    },

    storeSelectionBeforeRemove : function () {
        var selected = this.getSelectionModel().getSelected();

        if (!selected) { return ; }

        selected = selected.clone();

        if (selected.isRows) {
            var records = selected.getRecords();

            if (records.length) {
                selected._lastRecordIndex = this.getView().indexOf(records[records.length - 1]);
            }
        }

        this._lastSpreadsheetSelection = selected;
    },

    tryRestoreSelectionAfterBatchRemove : function (store, records) {
        var selected = this._lastSpreadsheetSelection;
        this._lastSpreadsheetSelection = null;

        // We suspend remove event for some operations, firing batchremove instead. In this case we should notify
        // selection model that records were removed.
        // 3rd argument is not utilized, 4th - should be false, because we don't move records
        this.getSelectionModel().onStoreRemove(store, records, null, false);

        if (!selected || store.getCount() === 0) { return; }

        var selModel = this.getSelectionModel();
        var view = this.lockedGrid.getView();

        if (selected.isCells) {
            var range = selected.getRange();

            // Do not do anything, if negative coordinates passed. Can happen when node is collapsed with
            // click in 6.0.1
            if (range[1][0] === -1) {
                return;
            }

            var nodesCount = view.getNodes().length;
            selModel.selectCells(
                [range[0][0], Math.min(nodesCount, range[0][1])],
                [range[1][0], Math.min(nodesCount, range[1][1])]
            );
        } else if (selected.isRows) {
            var selectedRecords = selected.getRecords();
            var selectedRecordExists = false;

            for (var i = 0, len = selectedRecords.length; i < len; i++) {
                // if any record from current selection is still alive - selection model will handle it itself
                if (selectedRecordExists = selectedRecordExists || store.indexOf(selectedRecords[i]) !== -1) {
                    break;
                }
            }

            // if smth was selected and nothing is now - select record by current index or last in store
            if (!selectedRecordExists) {
                var recordToSelect = view.getRecord(Math.min(selected._lastRecordIndex, store.getCount() - 1));
                recordToSelect && selModel.select(recordToSelect);
            }
        }
    },

    getTreeViewDragDropPlugin : function () {
        var plugins = this.lockedGrid.view.plugins || [];
        var plugin;

        for (var i = 0; i < plugins.length; i++) {
            plugin = plugins[i];
            // this class is required in patch
            if (plugin instanceof Ext.tree.plugin.TreeViewDragDrop) {
                return plugin;
            }
        }
    },

    doSetTreeViewDragDropDisabled : function (disabled) {
        var plugin = this.getTreeViewDragDropPlugin();

        if (plugin) {
            if (disabled) {
                plugin.disable();
            } else {
                plugin.enable();
            }
        }
    },

    setTreeViewDragDropDisabled : function (disabled) {
        var me      = this;
        var view    = this.lockedGrid.view;

        if (view.rendered) {
            me.doSetTreeViewDragDropDisabled(disabled);
        } else {
            view.on('render', function () {
                me.doSetTreeViewDragDropDisabled(disabled);
            });
        }
    },

    restoreSpreadsheetSelectionModel : function () {
        var selModel = this.getSelectionModel(),
            plugin   = this.getTreeViewDragDropPlugin();

        // only restore listener if selection model and dragdrop plugin are disabled
        if (selModel.isLocked() && plugin && !plugin.disabled) {
            selModel.setLocked(false);
            this.setTreeViewDragDropDisabled(true);
            this.lockedGrid.view.on('cellmousedown', selModel.handleMouseDown, selModel);

            selModel.navigationListeners = selModel.navigationModel.on({
                navigate    : selModel.onNavigate,
                scope       : selModel,
                destroyable : true
            });
        }

        //selectionModel.cellSelect = selectionModel._cellSelect;
        //selectionModel.rowSelect = selectionModel._rowSelect;
    },

    setReadOnly : function (readOnly) {
        this.callParent(arguments);

        // notify other parts of readOnly mode switching
        this.fireEvent('setreadonly', this, readOnly);
    },


    getTimeSpanDefiningStore : function () {
        return this.taskStore;
    },


    bindAutoTimeSpanListeners : function () {
        if (!this.autoFitOnLoad) {
            this.callParent(arguments);
        }
    },


    // Make sure views don't react to store changes during cascading
    onBeforeCascade : function () {
        // make sure UI is already there
        if (this.lockedGrid && this.lockedGrid.view) {
            // HACK no easy way to disable grid view from reacting to the store
            this.lockedGrid.view.onUpdate = this.normalGrid.view.onUpdate = Ext.emptyFn;

            this.suspendLayouts();
        }
    },


    // Re-activate view->store listeners and update views if needed
    onAfterCascade : function (treeStore, context) {
        var me = this;

        // make sure UI is already there
        if (me.lockedGrid && me.lockedGrid.view && me.normalGrid && me.normalGrid.view) {

            me.lockedGrid.view.onUpdate = me.lockedGrid.view.self.prototype.onUpdate;
            me.normalGrid.view.onUpdate = me.normalGrid.view.self.prototype.onUpdate;

            me.resumeLayouts();

            if (me.batchUpdate) return; // Views will be refreshed in when batch update is done

            if (context.nbrAffected > 0) {
                var lockedView = me.lockedGrid.getView();

                // Manual refresh of a few row nodes is way faster in large DOM scenarios where the
                // refresh operation takes too long (read/set scroll position, gridview refreshSize etc)
                if (context.nbrAffected <= me.simpleCascadeThreshold) {
                    var view = me.getView();
                    var ganttView = me.getSchedulingView();

                    // let the view finish redrawing all the rows before we are trying to repaint dependencies
                    ganttView.suspendEvents(true);

                    // "context.affected" will contain parent affected parent tasks as well
                    for (var id in context.affected) {
                        var task = context.affected[id];
                        var index = lockedView.store.indexOf(task);

                        // The target task may be inside a collapsed parent, in which case we should ignore updating it
                        if (index >= 0) {
                            view.refreshNode(index);
                        }

                    }

                    ganttView.resumeEvents();

                    return;
                }

                me.refreshViews();
            }
        }
    },

    updateFullRefreshColumns : function () {
        var me = this;

        if (!me.refreshTimer && me.fullRefreshColumns && me.fullRefreshColumns.length) {
            me.refreshTimer = setTimeout(function () {
                me.refreshTimer = null;

                me.redrawColumns(me.fullRefreshColumns);

            }, me.refreshTimeout);
        }
    },

    bindFullRefreshListeners : function () {
        var me = this;

        me.fullRefreshColumnsListeners = this.mon(this.taskStore, {
            nodeappend  : me.updateFullRefreshColumns,
            nodeinsert  : me.updateFullRefreshColumns,
            noderemove  : me.updateFullRefreshColumns,
            destroyable : true,
            scope       : this
        });
    },

    bindSequentialDataListeners : function (column) {
        var lockedView = this.lockedGrid.view;
        var taskStore = this.taskStore;

        // the combination of buffered renderer + tree will perform a full refresh on any CRUD,
        // no need to update only some of the cells
        // Update: Seems unreliable
        //if (lockedView.bufferedRenderer) return;

        column.mon(taskStore, {
            nodeappend : function (store, node) {
                if (!taskStore.fillCount) {
                    // We refresh all nodes following the inserted node parent (since at this point, node is not yet part of the store)
                    this.updateAutoGeneratedCells(column, lockedView.store.indexOf(node.parentNode));
                }
            },

            nodeinsert : function (store, node, insertedBefore) {
                this.updateAutoGeneratedCells(column, lockedView.store.indexOf(insertedBefore));
            },

            noderemove  : function(store, node, isMove) {
                if (!isMove) {
                    this.updateAutoGeneratedCells(column, lockedView.store.indexOf(node));
                }
            },

            nodemove  : function(store, oldParent) {
                this.updateAutoGeneratedCells(column, lockedView.store.indexOf(oldParent));
            },

            scope       : this
        });
    },


    bindEarlyDatesListeners : function () {
        var updateEarlyDateColumns = Ext.Function.createBuffered(this.updateEarlyDateColumns, this.refreshTimeout, this, []);

        this.earlyDatesListeners = this.mon(this.taskStore, {
            earlydatesreset : updateEarlyDateColumns,
            scope           : this,
            destroyable     : true
        });
    },

    bindLateDatesListeners : function () {
        var updateLateDateColumns = Ext.Function.createBuffered(this.updateLateDateColumns, this.refreshTimeout, this, []);

        this.lateDatesListeners = this.mon(this.taskStore, {
            latedatesreset : updateLateDateColumns,
            scope          : this,
            destroyable    : true
        });
    },

    startEditScrollToEditor : function () {
        var editingPlugin = this.ganttEditingPlugin;

        // HACK: Need to do an extra 'realign' call since the Ext call to show the editor messes up the scrollposition
        // See test 1002_tabbing.t.js
        !Sch.disableOverrides && editingPlugin && editingPlugin.on('beforeedit', function(plug, context) {
            context.column.getEl().scrollIntoView(context.column.ownerCt.getEl());
            context.view.scrollCellIntoView(context.cell);
        }, this, { single : true });
    },

    beforeRowExit      : function (keyEvent, prevRow, newRow, forward) {
        // In < Ext 6.2, only 3 arguments
        if (!(keyEvent instanceof Ext.event.Event)) {
            forward = newRow;
            newRow = prevRow;
            prevRow = keyEvent;
        }

        if (forward && !newRow) {
            var view = this.lockedGrid.getView();
            var record = view.getRecord(prevRow);

            // In ext 6.2.1 refreshSize method (called somewhere in store's 'endupdate' listener added by sencha)
            // began to save/restore scroll. In IEs that lead to blur/focus racing and editor, instead of being blurred,
            // is focused (having 0 dimentions at the same time). That leads to editor being unreachable by tabbing.
            // To reproduce this in IE9-11 run test, open editor in last cell of the last row and press TAB. Then check
            // DOM for class x-field-form-focus, there will two elements, first one is the previous editor,
            // focused erroneously, and 2nd is the active editor.
            // Covered by 1002_tabbing test
            var old = view.saveFocusState;
            view.saveFocusState = function () {
                return Ext.emptyFn;
            };
            record.addTaskBelow({ leaf : true });
            view.saveFocusState = old;

            // HACK needed to sync header with new editor position
            if (Ext.getVersion().isGreaterThanOrEqual('6.5.0')) {
                this.startEditScrollToEditor();
            }
        }
    },

    // this function checks whether the configuration option should be translated to task store or calendar
    // idea is that some configuration option (`cascadeChanges` for example) actually belongs to TaskStore
    // so they are not persisted in the gantt panel (panel only provides accessors which reads/write from/to TaskStore)
    // however the values for those options could also be specified in the prototype of the Gnt.panel.Gantt subclass
    // see #172
    needToTranslateOption : function (optionName) {
        return this.hasOwnProperty(optionName) || this.self.prototype.hasOwnProperty(optionName) && this.self != Gnt.panel.Gantt;
    },

    /**
     * <p>Returns the task record for a DOM node</p>
     * @param {Ext.Element/HTMLElement} el The DOM node or Ext Element to lookup
     * @return {Gnt.model.Task} The task record
     */
    resolveTaskRecord : function (el) {
        return this.getSchedulingView().resolveTaskRecord(el);
    },

    /**
     * Tries to fit the time columns to the available view width
     */
    fitTimeColumns : function () {
        this.getSchedulingView().fitColumns();
    },

    /**
     * Returns the resource store associated with the Gantt panel instance
     * @return {Gnt.data.ResourceStore}
     */
    getResourceStore : function () {
        return this.getTaskStore().getResourceStore();
    },

    /**
     * Returns the assignment store associated with the Gantt panel instance
     * @return {Gnt.data.AssignmentStore}
     */
    getAssignmentStore : function () {
        return this.getTaskStore().getAssignmentStore();
    },

    /**
     * Returns the associated CRUD manager
     * @return {Gnt.data.CrudManager}
     */
    getCrudManager : function () {
        return this.crudManager;
    },

    /**
     * Returns the associated task store
     * @return {Gnt.data.TaskStore}
     */
    getTaskStore : function () {
        return this.taskStore;
    },

    /**
     * Returns the task store instance
     * @return {Gnt.data.TaskStore}
     */
    getEventStore : function () {
        return this.taskStore;
    },

    /**
     * Returns the associated dependency store
     * @return {Gnt.data.DependencyStore}
     */
    getDependencyStore : function () {
        return this.dependencyStore;
    },


    // private
    onDragDropStart : function () {
        if (this.tip) {
            this.tip.hide();
            this.tip.disable();
        }
    },

    // private
    onDragDropEnd : function () {
        if (this.tip) {
            this.tip.enable();
        }
    },


    // private
    configureFunctionality : function () {
        // Normalize to array
        var plugins = this.plugins = [].concat(this.plugins || []);

        if (this.enableConstraintsResolutionGui && !Ext.Array.findBy(plugins, function (item) {
                return (item instanceof Gnt.plugin.ConstraintResolutionGui) ||
                       (item.ptype == 'constraintresolutiongui');
            })) {

            plugins.push(Ext.apply(this.constraintResolutionGuiConfig || {}, {
                pluginId : "constraintresolutiongui",
                ptype    : "constraintresolutiongui"
            }));
        }

        if (this.showProjectLines) {
            plugins.push(Ext.apply({
                pluginId    : 'gantt_projectlines',
                ptype       : 'gantt_projectlines'
            }, this.projectLinesConfig));
        }

        // Either object or boolean
        if (this.enableTaskReordering) {
            // if config is defined in prototype or not defined at all - define property on instance
            if (!this.hasOwnProperty('lockedViewConfig')) {
                this.lockedViewConfig           = Ext.apply({}, this.lockedViewConfig || {});
            }
            this.lockedViewConfig.plugins   = [].concat(this.lockedViewConfig.plugins || []);

            // HACK - remove post v4.0
            // Users may have added their own drag drop plugin, in such case we should not add our owns
            var lockedViewPlugins           = this.lockedViewConfig.plugins;
            var userAddedOwnDragDropPlugin;

            Ext.Array.each(lockedViewPlugins, function(plug) {
                if (plug === 'treeviewdragdrop' || plug.ptype === 'treeviewdragdrop') {
                    userAddedOwnDragDropPlugin = true;
                }
            });

            if (!userAddedOwnDragDropPlugin) {
                var pluginConfig        = Ext.apply({}, Ext.isObject(this.enableTaskReordering) && this.enableTaskReordering || {}, {
                    ptype                 : 'treeviewdragdrop',
                    pluginId              : 'bryntum_treedragdrop',
                    nodeHighlightOnDrop   : false,
                    nodeHighlightOnRepair : false,
                    containerScroll       : true,
                    dragZone : {
                        onBeforeDrag : Ext.Function.bind(this.onBeforeTaskReorder, this)
                    },
                    dropZone : {
                        onNodeDrop : this.onTaskReorder,
                        onNodeOver : this.onTaskReorderOver
                    }
                });

                lockedViewPlugins.push(pluginConfig);
            }
        }
    },

    /**
     * If configured to highlight non-working time, this method returns the {@link Sch.plugin.NonWorkingTime workingTime} feature
     * responsible for providing this functionality.
     * @return {Sch.plugin.NonWorkingTime} workingTime
     */
    getWorkingTimePlugin : function () {
        return this.workingTimePlugin;
    },

    registerLockedDependencyListeners : function () {
        var me = this;
        var depStore = this.getDependencyStore();

        // Need to save these to be able to deregister them properly.
        this._lockedDependencyListeners = this._lockedDependencyListeners || {
            load : function () {
                me.lockedGrid.getView().refreshView();
            },

            clear : function () {
                me.lockedGrid.getView().refreshView();
            },

            add : function (depStore, records) {
                me.refreshTasksForDependencies(records);
            },

            update : function (depStore, record, operation) {
                if (operation != Ext.data.Model.COMMIT) {
                    var view = me.lockedGrid.view;

                    if (record.previous[record.fromField]) {
                        var prevFromTask = me.taskStore.getModelById(record.previous[record.fromField]);

                        if (prevFromTask) {
                            view.refreshNode(prevFromTask);
                        }
                    }

                    if (record.previous[record.toField]) {
                        var prevToTask = me.taskStore.getModelById(record.previous[record.toField]);

                        if (prevToTask) {
                            view.refreshNode(prevToTask);
                        }
                    }

                }

                // we update the record related tasks not for EDIT operation only
                // since we need to react on record COMMIT as well
                me.refreshTasksForDependencies([ record ]);
            },

            remove : function (depStore, records) {
                me.refreshTasksForDependencies(records);
            }
        };

        // This could be called multiple times, if both predecessor and successor columns are used
        this.mun(depStore, this._lockedDependencyListeners);
        this.mon(depStore, this._lockedDependencyListeners);
    },


    getDependencyTasks : function (depRecord) {
        var sourceTask = depRecord.getSourceTask(this.taskStore),
            targetTask = depRecord.getTargetTask(this.taskStore),
            result     = [];

        // we should not refresh node which is being removed
        if (sourceTask && sourceTask.getTreeStore()) {
            result.push(sourceTask);
        }
        if (targetTask && targetTask.getTreeStore()) {
            result.push(targetTask);
        }

        return result;
    },


    refreshLockedViewRows : function (tasks) {
        var lockedView = this.lockedGrid.view;

        for (var i = 0; i < tasks.length; i++) {
            lockedView.refreshNode(tasks[i]);
        }
    },


    refreshTasksForDependencies : function (dependencies) {
        var me         = this,
            addedTasks = {},
            toRefresh  = [];

        Ext.Array.each(dependencies, function (dependency) {
            // get dependency related tasks
            var tasks = me.getDependencyTasks(dependency);

            for (var i = 0; i < tasks.length; i++) {
                // put them into toRefresh array if they aren't there already
                if (!addedTasks[tasks[i].getId()]) {
                    addedTasks[tasks[i].getId()] = 1;
                    toRefresh.push(tasks[i]);
                }
            }

            me.refreshLockedViewRows(toRefresh);
        });
    },


    /**
     * Shows the baseline tasks
     */
    showBaseline : function () {
        //this.addCls('sch-ganttpanel-showbaseline');
        this.getSchedulingView().showBaseline();
    },

    /**
     * Hides the baseline tasks
     */
    hideBaseline : function () {
        //this.removeCls('sch-ganttpanel-showbaseline');
        this.getSchedulingView().hideBaseline();
    },

    /**
     * Toggles the display of the baseline
     */
    toggleBaseline : function () {
        //this.toggleCls('sch-ganttpanel-showbaseline');
        this.getSchedulingView().toggleBaseline();
    },

    /**
     * Changes the timeframe of the gantt chart to fit all the tasks in it. Provide left/right margin if you want to fit also
     * labels.
     * @param {Gnt.model.Task/Gnt.model.Task[]} [tasks] A list of tasks to zoom to. If not specified then the gantt will
     * try to fit all the tasks in the {@link #taskStore task store}.
     * @param {Object} [options] Options object for zooming.
     * @param {Number} [options.leftMargin] Defines margin in pixel between the first task start date and first visible date
     * @param {Number} [options.rightMargin] Defines margin in pixel between the last task end date and last visible date
     */
    zoomToFit : function (tasks, options) {
        options = Ext.apply({
            adjustStart : 1,
            adjustEnd   : 1
        }, options);
        // If view is being filtered, only considered the matching results when zooming
        if (!tasks && this.taskStore.isTreeFiltered()) {
            tasks = this.getSchedulingView().store.getRange();
        }

        var span = tasks ? this.taskStore.getTimeSpanForTasks(tasks) : this.taskStore.getTotalTimeSpan();

        if (this.zoomToSpan(span, options) === null) {
            // if no zooming was performed - fit columns to view space
            if (!tasks) this.fitTimeColumns();
        }
    },


    /**
     * "Get" accessor for the `cascadeChanges` option
     */
    getCascadeChanges : function () {
        return this.taskStore.cascadeChanges;
    },


    /**
     * "Set" accessor for the `cascadeChanges` option
     */
    setCascadeChanges : function (value) {
        this.taskStore.cascadeChanges = value;
    },


    /**
     * "Get" accessor for the `recalculateParents` option
     */
    getRecalculateParents : function () {
        return this.taskStore.recalculateParents;
    },


    /**
     * "Set" accessor for the `recalculateParents` option
     */
    setRecalculateParents : function (value) {
        this.taskStore.recalculateParents = value;
    },


    /**
     * "Set" accessor for the `skipWeekendsDuringDragDrop` option
     */
    setSkipWeekendsDuringDragDrop : function (value) {
        this.taskStore.skipWeekendsDuringDragDrop = this.skipWeekendsDuringDragDrop = value;
    },


    /**
     * "Get" accessor for the `skipWeekendsDuringDragDrop` option
     */
    getSkipWeekendsDuringDragDrop : function () {
        return this.taskStore.skipWeekendsDuringDragDrop;
    },

    // BEGIN RESOURCE STORE LISTENERS
    onResourceStoreUpdate : function (store, resource) {

        Ext.Array.each(resource.getTasks(), function (task) {
            var index = this.lockedGrid.view.store.indexOf(task);

            if (index >= 0) {
                this.getView().refreshNode(index);
            }
        }, this);
    },

    onResourceStoreDataChanged   : function () {
        if (this.taskStore.getRootNode().childNodes.length > 0) {
            this.refreshViews();
        }
    },
    // EOF RESOURCE STORE LISTENERS

    // BEGIN ASSIGNMENT STORE LISTENERS
    onAssignmentStoreDataChanged : function () {
        if (this.taskStore.getRootNode().childNodes.length > 0) {
            this.refreshViews();
        }
    },

    onAssignmentStoreUpdate            : function (store, assignment) {
        var task = assignment.getTask();

        if (task) {
            var index = this.lockedGrid.view.store.indexOf(task);

            if (index >= 0) {
                this.getView().refreshNode(index);
            }
        }
    },

    // We should not react to changes in the assignment store when it is happening for a single resource
    // We rely on the "taskassignmentschanged" event for updating the UI
    onBeforeSingleTaskAssignmentChange : function () {
        this.assignmentStore.un('add', this.onAssignmentStoreDataChanged, this);
        this.assignmentStore.un('remove', this.onAssignmentStoreDataChanged, this);
    },

    onSingleTaskAssignmentChange : function (assignmentStore, taskId) {
        this.assignmentStore.on('add', this.onAssignmentStoreDataChanged, this);
        this.assignmentStore.on('remove', this.onAssignmentStoreDataChanged, this);

        if (this.rendered) {

            var task = this.taskStore.getModelById(taskId);

            // Make sure task is part of the tree and wasn't just removed
            if (task && task.parentNode) {
                var index = this.taskStore.indexOf(task);

                if (index >= 0) {
                    this.getView().refreshNode(index);
                }
            }
        }
    },
    // EOF ASSIGNMENT STORE LISTENERS

    updateAutoGeneratedCells : function (column, recordIndex) {
        var view = this.lockedGrid.view;
        var startIndex = view.all.startIndex;
        var endIndex = view.all.endIndex;

        if (recordIndex < 0 || recordIndex > endIndex) return;

        for (var i = Math.max(startIndex, recordIndex); i <= endIndex; i++) {
            var rec = view.store.getAt(i);
            var cell = this.getCellDom(view, rec, column);

            if (cell) {
                cell.firstChild.innerHTML = column.renderer(null, null, rec);
            }
        }
    },


    getCellDom : function (view, record, column) {
        var row = view.getNode(record, true);

        return row && Ext.fly(row).down(column.getCellSelector(), true);
    },

    redrawCell  : function (column, record, recordIndex, rowIndex, columnIndex) {
        if (!this.isDestroyed) {
            var view = this.lockedGrid.view;

            var cell = this.getCellDom(view, record, column);

            // cell might be null for a hidden column
            if (cell) {
                var out = [];

                if (recordIndex === undefined) {
                    recordIndex = this.taskStore.indexOf(record);
                }

                if (rowIndex === undefined) {
                    rowIndex = view.indexOf(record);
                }

                if (columnIndex === undefined) {
                    columnIndex = column.getIndex();
                }

                view.renderCell(column, record, recordIndex, rowIndex, columnIndex, out);

                // out contain whole cell element starting from <td>, but createDom will return only inner element
                var newContent = Ext.DomHelper.createDom(out.join(''));
                // use sync content for the inner element, because cell can still contain editor
                Ext.fly(cell).down('.' + Ext.baseCSSPrefix + 'grid-cell-inner').syncContent(newContent);
            }
        }
    },

    redrawColumns : function (cols) {
        // this method is called a lot from various buffered listeners, need to check
        // if component has not been destroyed
        if (cols.length && !this.isDestroyed) {
            var view = this.lockedGrid.view;

            for (var i = view.all.startIndex; i <= view.all.endIndex; i++) {
                var rec = view.store.getAt(i);

                for (var j = 0, ll = cols.length; j < ll; j++) {
                    var col = cols[j];
                    this.redrawCell(col, rec, i, i, col.getIndex());
                }
            }
        }
    },

    updateEarlyDateColumns : function () {
        this.earlyColumns && this.earlyColumns.length && this.redrawColumns(this.earlyColumns);
    },

    updateLateDateColumns : function () {
        this.lateColumns && this.lateColumns.length && this.redrawColumns(this.lateColumns);
    },

    onMyViewReady : function () {
        // Prevent editing of non-editable fields
        this.on('beforeedit', this.onBeforeEdit, this);

        this.setupColumnListeners();

        var splitter = this.down('splitter');

        if (splitter) {
            // Since Ext JS doesn't handle locked grid sizing, we do this ourselves.
            splitter.on('dragend', function() {
                this.saveState();
            }, this, { delay : 10 });
        }

        if (this.ganttEditingPlugin) {
            this.ganttEditingPlugin.on({
                editingstart : this.onEditingStart,
                edit         : this.onAfterEdit,
                canceledit   : this.onAfterEdit
            });
        }
    },

    onBeforeCrudResponseApply : function () {
        this.fireEvent('beforedatarefresh', this);
        var depView = this.getDependencyView();
        depView && depView.stopDrawDependencies();
    },

    onCrudRequestDone : function () {
        this.fireEvent('datarefresh', this);
        var depView = this.getDependencyView();
        depView && depView.startDrawDependencies();
    },

    onBeforeEdit : function (editor, o) {
        var column = o.column;
        var task   = o.record;

        return !this.isReadOnly() && o.record.isEditable(o.field) &&
            (!column.isEditable || column.isEditable(task));
    },

    onEditingStart : function(plug, editor) {
        var field = editor.field;

        // Set instant update enabled only after editing has started
        if (field.originalInstantUpdate) {
            field.setInstantUpdate(true);
        }
    },

    onAfterEdit : function(editor, context) {
        var field = context.column.getEditor();

        if (field.setInstantUpdate) {
            field.setInstantUpdate(false);
        }
    },

    setupColumnListeners : function () {
        var me = this;
        var lockedHeader = this.lockedGrid.getHeaderContainer();

        lockedHeader.on('add', this.onLockedColumnAdded, this);
        lockedHeader.on('remove', this.onLockedColumnRemoved, this);

        lockedHeader.items.each(function (col) {
            me.onLockedColumnAdded(lockedHeader, col);
        });
    },

    onLockedColumnRemoved : function (ct, col) {
        /*if (col.isWBSColumn || col.isSequenceColumn) {
            this.bindSequentialDataListeners(col);

        } else*/ if (col.isDependencyColumn && col.useSequenceNumber) {
            Ext.Array.remove(this.fullRefreshColumns, col);

        } else if (col.isEarlyStartDateColumn || col.isEarlyEndDateColumn) {
            Ext.Array.remove(this.earlyColumns, col);

        } else if (col.isLateStartDateColumn || col.isLateEndDateColumn) {
            Ext.Array.remove(this.lateColumns, col);
        }

        else if (col.isTotalSlackColumn || col.isFreeSlackColumn) {
            Ext.Array.remove(this.earlyColumns, col);
            Ext.Array.remove(this.lateColumns, col);
        }

        if (this.earlyDatesListeners && !(this.slackColumns && this.slackColumns.length) && !(this.earlyColumns && this.earlyColumns.length)) {
            this.earlyDatesListeners.destroy();
        }

        if (this.lateDatesListeners && !(this.slackColumns && this.slackColumns.length) && !(this.lateColumns && this.lateColumns.length)) {
            this.lateDatesListeners.destroy();
        }

        if (this.fullRefreshColumnsListeners && !(this.fullRefreshColumns && this.fullRefreshColumns.length)) {
            this.fullRefreshColumnsListeners.destroy();
        }
    },

    onLockedColumnAdded : function (ct, col) {

        if (col.isWBSColumn || col.isSequenceColumn) {
            this.bindSequentialDataListeners(col);

        } else if (col.isDependencyColumn && col.useSequenceNumber) {

            this.fullRefreshColumns = this.fullRefreshColumns || [];
            this.fullRefreshColumns.push(col);

        } else if (col.isEarlyStartDateColumn || col.isEarlyEndDateColumn) {
            this.earlyColumns = this.earlyColumns || [];
            this.earlyColumns.push(col);
        }

        else if (col.isLateStartDateColumn || col.isLateEndDateColumn) {
            this.lateColumns = this.lateColumns || [];
            this.lateColumns.push(col);
        }

        // Slack columns depend on both Late & End dates changes
        else if (col.isTotalSlackColumn || col.isFreeSlackColumn) {
            this.earlyColumns = this.earlyColumns || [];
            this.earlyColumns.push(col);
            this.lateColumns = this.lateColumns || [];
            this.lateColumns.push(col);
        }

        if (!this.fullRefreshColumnsListeners && this.fullRefreshColumns && this.fullRefreshColumns.length) {
            this.bindFullRefreshListeners();
        }

        if (!this.earlyDatesListeners && (this.slackColumns && this.slackColumns.length || this.earlyColumns && this.earlyColumns.length)) {
            this.bindEarlyDatesListeners();
        }

        if (!this.lateDatesListeners && (this.slackColumns && this.slackColumns.length || this.lateColumns && this.lateColumns.length)) {
            this.bindLateDatesListeners();
        }

        // Clear column list in Group by menu to rebuild upon next menu show
        if (this.columnListMenuItem) {
            this.columnListMenuItem.removeAll();
        }
    },

    getState : function () {
        var me = this,
            state = me.callParent(arguments);

        if (me.lockedGrid.rendered) {
            state.lockedWidth = me.lockedGrid.getWidth();
        }

        return state;
    },

    applyState : function (state) {
        var me = this;

        me.callParent(arguments);

        if (state && state.lockedWidth) {
            me.lockedGrid.setWidth(state.lockedWidth);
        }
    },

    completeEdit : function () {
        this.ganttEditingPlugin && this.ganttEditingPlugin.completeEdit();
    },

    cancelEdit : function () {
        this.ganttEditingPlugin && this.ganttEditingPlugin.cancelEdit();
    },

    setRowHeight : function (height, preventRefresh) {
        var rootElSelector    = this.isViewport ? '.sch-ganttpanel' : '#' + this.getId();
        var rowHeightSelector = rootElSelector + ' .' + Ext.baseCSSPrefix + 'grid-cell';
        var rule              = rowHeightSelector + '{ height:' + height + 'px; }';

        if (!this.rowHeightStyleSheetNode) {
            // Create panel specific row height rule
            this.rowHeightStyleSheetNode = Ext.util.CSS.createStyleSheet(rule).ownerNode;
        } else {
            this.rowHeightStyleSheetNode.innerHTML = rule;
        }

        // Let view know about this too
        this.timeAxisViewModel.setViewRowHeight(height, preventRefresh);
    },

    // If task is provided returns a proper task editor plugin instance that can be used for editing.
    // Return any task editor instance available when no task is provided.
    getTaskEditor : function (task) {
        var plugins = this.plugins;

        for (var i = 0, l = plugins.length; i < l; i++) {
            var plugin  = plugins[i];

            if (plugin.isTaskEditor && (!task || plugin.matchFilters(task))) return plugin;
        }
    },

    onRowClicked : function (panel, task) {
        this.getSchedulingView().scrollEventIntoView(task, false, false);
    },

    // BEGIN TREE NODE REORDERING HOOKS
    // Prevents a readonly task reordering or any task reordering if the gantt is in readonly mode.
    onBeforeTaskReorder : function (data, e) {
        var task                   = e.record;
        var isSpreadsheetSelection = Ext.grid.selection && Ext.grid.selection.SpreadsheetModel && this.getSelectionModel() instanceof Ext.grid.selection.SpreadsheetModel;

        // store task being reordered
        data._reorderingTask = task;

        // 1. The panel is readonly
        // 2. The task being dragged is readonly
        // 3. When column grouping is active
        // 4. When using spread sheet model, only allow row reordering using the special drag drop column cells
        return (!isSpreadsheetSelection || Boolean(e.getTarget('.sch-gantt-column-dragdrop'))) &&
               !this.isReadOnly() && task && !task.isReadOnly() && !this.taskStore.isTreeGrouped();
    },

    // Prevents dropping a task being reordered into another readonly task
    onTaskReorderOver : function (nodeData, source, e, data) {
        var result = this.self.prototype.onNodeOver.apply(this, arguments);

        if (result !== this.dropNotAllowed) {
            var target = this.getTargetFromEvent(e);

            if (target) {
                var targetTask = this.view.getRecord(target);

                result = targetTask !== data._reorderingTask && !targetTask.isReadOnly() ? this.dropAllowed : this.dropNotAllowed;
            }
        }

        return result;
    },

    // Prevent excessive parent node calculations during tree restructuring
    // https://app.assembla.com/spaces/bryntum/tickets/3049-treeviewdragdrop-is-slow-when-reordering-50+-nodes-/details#
    onTaskReorder : function(nodeData, source, e, data) {
        var valid = this.valid;

        if (valid) {
            var taskStore  = source.view.store;
            var gantt      = source.view.up('ganttpanel');
            var target     = this.getTargetFromEvent(e);
            var scrollTop = gantt.getSchedulingView().getVerticalScroll();
            var targetTask = this.view.getRecord(target),
                nodes = gantt.lockedGrid.view.getNodes();

            valid = targetTask !== data._reorderingTask && !targetTask.isReadOnly();

            if (valid) {
                var tasks           = data.records,
                    affectedParents = {},
                    lockedView      = this.view,
                    old             = source.view.grid.ensureVisible;

                // HACK: Workaround for an Ext JS bug, it crashes when dragging a node to the very last position in the tree.
                // https://app.assembla.com/spaces/bryntum/tickets/8400-stack-overflow-error-after-reordering-row/details
                if (this.lastOverNode === nodes[nodes.length - 1] && this.currentPosition === 'after') {
                    source.view.grid.ensureVisible = Ext.emptyFn;
                }

                // Prevent excessive view refreshes
                // https://www.sencha.com/forum/showthread.php?322186-Full-refresh-after-tree-view-drag-drop-once-for-every-dropped-node&p=1151897#post1151897
                if (gantt.suspendRefreshOnTaskReorder) {
                    gantt.suspendRefresh();
                }

                // Collect all old parent nodes of all moved tasks
                Ext.Array.each(tasks, function (task) {
                    affectedParents[task.parentNode.id] = task.parentNode;
                });

                // Prevent excessive parent recalculation
                taskStore.suspendAutoRecalculateParents++;

                valid = this.self.prototype.onNodeDrop.apply(this, arguments);

                taskStore.suspendAutoRecalculateParents--;

                if (valid) {
                    // Add the new parent node of moved tasks
                    affectedParents[tasks[0].parentNode.id] = tasks[0].parentNode;

                    var affectedParentsArray = Ext.Object.getValues(affectedParents);

                    // Process deepest nodes first, sort accordingly
                    affectedParentsArray.sort(function(node1, node2){
                        return node1.data.depth > node2.data.depth ? -1 : 1;
                    });

                    Ext.Array.each(affectedParentsArray, function (parent) {
                        parent.refreshCalculatedParentNodeData();
                    });
                }

                if (gantt.suspendRefreshOnTaskReorder) {
                    gantt.resumeRefresh(false);
                }

                source.view.grid.ensureVisible = old;

                // Required for IE11 / Safari, which have an async refresh/scroll behavior
                setTimeout(function () {
                    lockedView.setScrollY(scrollTop);
                    gantt.getView().refresh();
                }, 0);
            }
        }

        return valid;
    },
    // EOF TREE NODE REORDERING HOOKS

    /**
     * @return {Gnt.model.Task[]} An array of the currently selected rows
     */
    getSelectedRows : function() {
        var selected = this.getSelectionModel().getSelected();
        var tasks    = [];

        if (Ext.grid.selection.Cells && selected instanceof Ext.grid.selection.Cells) {
            selected.eachRow(function (task) {
                tasks.push(task);
            });
        } else {
            // Rows are being selected
            tasks = this.getSelectionModel().getSelection();
        }

        return tasks;
    },


    destroy : function() {
        clearTimeout(this.refreshTimer);

        if (this.destroyStores) {
            var calendarManager = this.taskStore.calendarManager;

            this.assignmentStore && this.assignmentStore.destroy();
            this.assignmentStore = null;

            this.resourceStore && this.resourceStore.destroy();
            this.resourceStore = null;

            this.taskStore && this.taskStore.destroy();
            this.taskStore = null;

            this.dependencyStore && this.dependencyStore.destroy();
            this.dependencyStore = null;

            calendarManager && calendarManager.destroy();
        }

        if (this.rowHeightStyleSheetNode) {
            this.rowHeightStyleSheetNode.parentNode.removeChild(this.rowHeightStyleSheetNode);
            this.rowHeightStyleSheetNode = null;
        }

        this.callParent(arguments);
    },

    // Overrides disabled since they break selection model: https://app.assembla.com/spaces/bryntum/tickets/8771-selection-is-broken-after-collapsing-nodes/details#
    // @OVERRIDE  Overridden due to bad performance in superclass implementation
    // collapseAll : function () {
    //
    //     this.taskStore.suspendEvent('refresh', 'add', 'insert', 'remove');
    //     this.lockedGrid.getView().blockRefresh = this.normalGrid.getView().blockRefresh = true;
    //
    //     this.callParent(arguments);
    //
    //     this.lockedGrid.getView().blockRefresh = this.normalGrid.getView().blockRefresh = false;
    //     this.taskStore.resumeEvent('refresh', 'add', 'insert', 'remove');
    //
    //     this.refreshViews();
    // },

    // @OVERRIDE Overridden due to bad performance in superclass implementation
    // expandAll : function () {
    //     this.lockedGrid.getView().blockRefresh = this.normalGrid.getView().blockRefresh = true;
    //
    //     this.callParent(arguments);
    //
    //     this.lockedGrid.getView().blockRefresh = this.normalGrid.getView().blockRefresh = false;
    //
    //     this.refreshViews();
    // },

    getCalendar : function() {
        return this.getTaskStore().getCalendar();
    }
});
