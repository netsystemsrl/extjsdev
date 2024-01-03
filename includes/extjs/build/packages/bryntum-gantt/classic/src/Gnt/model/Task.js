/**
 * This class represents a single task in your Gantt chart.
 * The inheritance hierarchy of this class includes the {@link Sch.model.Customizable} and {@link Ext.data.Model} classes. Fields that begin
 * with a capital letter come from this class directly, and lowercase field names are inherited from {@link Ext.data.NodeInterface}.
 * This class will not only inherit fields but also a set of methods that stem from the {@link Ext.data.NodeInterface}.
 * Please refer to the documentation of those classes to become familiar with the base interface of this class.
 *
 * By default, a Task has the following fields as seen below.
 *
 * ## Modifying task Fields
 *
 * If you want to add new fields or change the name/options for the existing ones,
 * you can do that by subclassing this class (see example below).
 *
 * ## Subclassing the Task class
 *
 * The name of any field can be customized in the subclass. Please refer to {@link Sch.model.Customizable} for details.
 *
 * ```javascript
 * Ext.define('MyProject.model.Task', {
 *     extend           : 'Gnt.model.Task',
 *     nameField        : 'myName',
 *     percentDoneField : 'percentComplete',
 *     isAlmostDone     : function () {
 *         return this.get('percentComplete') > 80;
 *     },
 *     ...
 * });
 * ```
 *
 * ## Creating a new Task instance programmatically
 *
 * To create a new task programmatically, simply call the Gnt.model.Task constructor and pass in any default field values.
 *
 * ```javascript
 * var newTask = new Gnt.model.Task({
 *     Name        : 'An awesome task',
 *     PercentDone : 80, // So awesome it's almost done
 *     ...
 * });
 *
 * // To take weekends and non-working time into account, the new task needs a reference to the task store (which has access to the global calendar)
 * newTask.taskStore = taskStore;
 *
 * // Initialize new task to today
 * newTask.setStartDate(new Date());
 *
 * // This is a leaf task
 * newTask.set('leaf', true);
 *
 * // Now it will appear in the UI if the Gantt panel is rendered
 * taskStore.getRootNode().appendChild(newTask);
 * ```
 *
 * ## Start and End dates
 *
 * For all tasks, the range between start date and end date is supposed to be not-inclusive on the right side: {@link #StartDate} <= date < {@link #EndDate}.
 * So, for example, the task which starts at 2018/07/18 and has 2 days duration, should have the end date: 2018/07/20, **not** 2018/07/19 23:59:59.
 * Both start and end dates of tasks in our components are *points* on time axis and if user specifies that some task starts
 * 01/01/2018 and has 1 day duration, that means the start point is 01/01/2018 00:00 and end point is 02/01/2018 00:00.
 *
 * ## Conversion to "days" duration unit
 *
 * Some duration units cannot be converted to "days" consistently. For example a month may have 28, 29, 30 or 31 days. The year may have 365 or 366 days and so on.
 * So in such conversion operations, we will always assume that a task with a duration of 1 month will have a duration of 30 days.
 * This is {@link Gnt.data.Calendar#daysPerMonth a configuration option} of the calendar class.
 *
 * ## Task API
 *
 * One important thing to consider is that, if you are using the availability/scheduling modes feature, then you need to use the task API call to update the fields like `StartDate / EndDate / Duration`.
 * Those calls will calculate the correct value of each the field, taking into account the information from calendar/assigned resources.
 *
 * ## Server-side integration
 *
 * Also, at least for now you should not use the "save" method of the model available in Ext 4:
 *
 * ```javascript
 * task.save() // WON'T WORK
 * ```
 *
 * This is because there are some quirks in using CRUD for Ext tree stores. These quirks are fixed in the TaskStore. To save the changes in task to server
 * use the "sync" method of the task store:
 *
 * ```javascript
 * taskStore.sync() // OK
 * ```
 */
Ext.define('Gnt.model.Task', {
    extend              : 'Sch.model.Range',

    alias               : 'gntmodel.event',

    requires            : [
        'Sch.util.Date',
        'Ext.data.NodeInterface',
        'Ext.util.Format'
    ],

    uses                : [
        'Gnt.model.TaskSegment'
    ],

    mixins              : [
        'Gnt.model.mixin.ProjectableModel',
        'Gnt.model.task.More',
        'Gnt.model.task.Constraints',
        'Gnt.model.task.Splittable',
        'Gnt.model.task.Effort',
        'Gnt.model.task.Cost',
        'Gnt.model.task.DateAdjustment'
    ],

    isTaskModel         : true,

    /**
     * @cfg {String} Class name of the model to represent task segment
     */
    segmentClassName    : 'Gnt.model.TaskSegment',

    /**
     * @cfg {String} idProperty The name of the field treated as this Model's unique id.
     */
    idProperty          : "Id",

    customizableFields  : [
        /**
         * @field Id
         * A unique identifier of the task
         */
        /**
         * @field StartDate
         * @type Date
         * The start date of the task in the ISO 8601 format. See {@link Ext.Date} for a formats definitions.
         */
        /**
         * @field EndDate
         * @type Date
         * The end date of the task in the ISO 8601 format, **see "Start and End dates" section for important notes**
         */
        /**
         * @field Name
         * The name of the task (task title)
         */

        /**
         * @field
         * The numeric part of the task duration (the number of units).
         *
         * **Note:** When duration value is calculated, the project calendar {@link Sch.data.Calendar#cfg-hoursPerDay HoursPerDay} value is taken into account.
         * Please checkout [Using calendars](#!/guide/gantt_calendars) guide for details.
         */
        { name: 'Duration', type: 'number', allowNull: true },
        /**
         * @field
         * The numeric part of the task effort (the number of units). The effort of the "parent" tasks will be automatically set to the sum
         * of efforts of their "child" tasks
         */
        { name: 'Effort', type: 'number', allowNull: true },
        /**
         * @field
         * The unit part of the task effort (corresponds to units defined in {@link Sch.util.Date}), defaults to "h" (hours). Valid values are:
         *
         * - "ms" (milliseconds)
         * - "s" (seconds)
         * - "mi" (minutes)
         * - "h" (hours)
         * - "d" (days)
         * - "w" (weeks)
         * - "mo" (months)
         * - "q" (quarters)
         * - "y" (years)
         */
        { name: 'EffortUnit', type: 'string', defaultValue: 'h' },
        /**
         * @field
         * The actual current effort (the number of {@link #EffortUnit effort units}) that has been completed. This number is calculated based on {@link #PercentDone % completion}.
         */
        { name: 'ActualEffort', type: 'number', allowNull:true },
        /**
         * @field
         * The difference between the effort and its set baseline.
        */
        { name: 'EffortVariance', type: 'number', allowNull : true },
        /**
         * @field
         * The id of the calendar, assigned to the task. Allows you to set the time when task can be performed.
         *
         * Should be only provided for specific tasks - all tasks by default are assigned to the project calendar, provided as the
         * {@link Gnt.data.TaskStore#calendar} option.
         */
        { name: 'CalendarId', type: 'string'},
        /**
         * @field
         * A freetext note about the task.
         */
        { name: 'Note', type: 'string'},
        /**
         * @field
         * The unit part of the task duration (corresponds to units defined in {@link Sch.util.Date}), defaults to "d" (days). Valid values are:
         *
         * - "ms" (milliseconds)
         * - "s" (seconds)
         * - "mi" (minutes)
         * - "h" (hours)
         * - "d" (days)
         * - "w" (weeks)
         * - "mo" (months)
         * - "q" (quarters)
         * - "y" (years)
         *
         */
        {
            name: 'DurationUnit',
            type: 'string',
            defaultValue: "d",
            // make sure the default value is applied when user provides empty value for the field, like "" or null
            convert: function (value) {
                return value || Sch.util.Date.DAY;
            }
        },
        /**
         * @field
         * The progress of the task expressed as the percentage of completion. (Number 0..100).
         *
         * If `PercentDone >= 100%` it means the task {@link Gnt.model.task.More#isCompleted is completed} and it won't be affected by incoming dependencies.
         *
         * For "leaf" tasks, `PercentDone` value is provided by the user while the parent tasks `PercentDone` value is calculated based on its children.
         * This behavior is configurable and depends on the {@link #autoCalculatePercentDoneForParentTask} value.
         * If set to `false`, the parent `PercentDone` value can also be entered manually.
         *
         * A summary task `PercentDone` is calculated as `sum (completed portion of the duration of its children) / sum (children duration) * 100%`,
         * where `completed portion of the duration of its children = sum (child duration * child percent done)`.
         */
        { name: 'PercentDone', type: 'number', defaultValue: 0 },
        /**
         * @field
         * Cost of the task. Can also act as a calculated field containing the total cost of the task. Cost = Actual Cost + Remaining Cost
         */
        { name: 'Cost', type: 'number', allowNull: true },
        /**
         * @field
         * A calculated field containing the current cost of the task based on assignments and completion of the task.
         */
        { name: 'ActualCost', type: 'number', allowNull: true },
        /**
         * @field
         * A field showing the difference between the cost and its set baseline.
         */
        { name: 'CostVariance', type: 'number', allowNull: true },
        /**
         * @field
         * The task constraint. A string containing the alias for a constraint class (w/o the `gntconstraint` prefix). Valid values are:
         *
         * - "startnoearlierthan"
         * - "startnolaterthan"
         * - "muststarton"
         * - "finishnoearlierthan"
         * - "finishnolaterthan"
         * - "mustfinishon"
         * - "assoonaspossible"
         * - "aslateaspossible"
         *
         * If you want to define your own custom constraint class, you need to alias it:
         *
         * ```javascript
         *         Ext.define('MyConstraint', {
         *             extend      : 'Gnt.constraint.Base',
         *
         *             alias       : 'gntconstraint.myconstraint',
         *             ...
         *         });
         * ```
         */
        { name: 'ConstraintType', type: 'string', defaultValue: '' },
        /**
         * @field
         * The task constraint boundary date, if applicable.
         */
        { name: 'ConstraintDate', type: 'date', dateFormat: 'c' },
        /**
         * @field
         * When set to `true`, the {@link #StartDate start date} of the task will not be changed by any of its incoming dependencies
         * or constraints. Also, a manually scheduled parent task is not affected by its child tasks and behaves like any other normal task.
        */
        { name: 'ManuallyScheduled', type: 'boolean', defaultValue: false },
        /**
         * @field
         * The scheduling mode for the task. Based on this field some fields of the task
         * will be "fixed" (should be provided) and some - computed.
         *
         * Possible values are:
         *
         * - `Normal` is the default (and backward compatible) mode. It means the task will be scheduled based on information
         * about its start/end dates, task own calendar (project calendar if there's no one) and calendars of the assigned resources.
         *
         * - `FixedDuration` mode means, that task has fixed start and end dates, but its effort will be computed dynamically,
         * based on the assigned resources information. Typical example of such task is - meeting. Meetings typically have
         * pre-defined start and end dates and the more people are participating in the meeting, the more effort is spent on the task.
         * When duration of such task increases, its effort is increased too (and vice-versa).
         * **NOTE:** Fixed start and end dates here doesn't mean that a user can't update them via GUI,
         * the only field which won't be editable in GUI is the effort field,
         * it will be calculated according to duration and resources assigned to the task.
         *
         * - `EffortDriven` mode means, that task has fixed effort and computed duration. The more resources will be assigned
         * to this task, the less the duration will be. The typical example will be a "paint the walls" task -
         * several painters will complete it faster.
         * **NOTE:** Task is not EffortDriven if it has no assignments and {@link Gnt.data.TaskStore#enableSetDurationOnEffortDrivenTask} flag is enabled.
         *
         * - `DynamicAssignment` mode can be used when both duration and effort of the task are fixed. The computed value in this
         * case will be - the assignment units of the resources assigned. In this mode, the assignment level of all assigned resources
         * will be updated to evenly distribute the task's workload among them.
         *
         * **NOTE:** Parent tasks are always Normal and accumulate results from their children, except those which are {@link #ManuallyScheduled}.
         *
         */
        { name: 'SchedulingMode', type: 'string', defaultValue: 'Normal' },

        /**
         * @field
         * The baseline start date of the task in the ISO 8601 format. See {@link Ext.Date} for a formats definitions.
         */
        { name: 'BaselineStartDate', type: 'date', dateFormat: 'c' },
        /**
         * @field
         * The baseline end date of the task in the ISO 8601 format, **see "Start and End dates" section for important notes**
         */
        { name: 'BaselineEndDate', type: 'date', dateFormat: 'c' },
        /**
         * @field
         * The baseline status of a task, expressed as the percentage completed (integer from 0 to 100)
         */
        { name: 'BaselinePercentDone', type: 'int', defaultValue: 0 },
        /**
         * @field
         * The task effort baseline (the number of {@link #EffortUnit effort units}).
        */
        { name: 'BaselineEffort', type: 'number', allowNull: true },
        /**
         * @field
         * The cost baseline for the task.
         */
        { name: 'BaselineCost', type: 'number', allowNull: true  },

        { name: 'Draggable', type: 'boolean', persist: false, defaultValue : true },   // true or false
        { name: 'Resizable', persist: false, defaultValue : '' },                      // true, false, 'start' or 'end'
        /**
         * @field
         * 'true' to indicate that a task cannot be modified.
         */
        { name: 'ReadOnly', type : 'bool', defaultValue : false },

        /**
         * @field
         * Set this to 'true' if the task should rollup to its parent task.
         */
        { name: 'Rollup', type: 'boolean', defaultValue: false },
        /**
         * @field
         * @type {Gnt.model.TaskSegment[]}
         * Segments of the task that appear when the task gets {@link #split}.
         */
        {
            name    : 'Segments',
            persist : true,

            convert : function (value, record) {
                return record.processSegmentsValue(value, record);
            },

            serialize : function (value) {
                if (!value) return null;

                return Ext.Array.map([].concat(value), function(segment) {
                    return segment.serialize();
                });
            }
        },
        // Two fields which specify the relations between "phantom" tasks when they are
        // being sent to the server to be created (e.g. when you create a new task containing a new child task).
        { name: 'PhantomId', type : 'string' },
        { name: 'PhantomParentId', type : 'string' },
        /**
         * @field
         * Set this to true if this task should be shown in the Timeline widget
         */
        { name : 'ShowInTimeline', type : 'bool' },
        /**
         * @field
         * A deadline date for this task
         */
        { name : 'DeadlineDate', type: 'date', dateFormat: 'c' }
    ],


    fields                  : [
        // Override NodeInterface defaults
        { name: 'index', type : 'int', persist : true },

        // Internal flag saying that the task needs to be rescheduled. We don't want this to be persisted or mess the modified fields list.
        { name : 'needsRescheduling', type : 'bool', persist : false }
    ],

    /**
     * @cfg {String} constraintTypeField The name of the field specifying the constraint type of this task.
     */
    constraintTypeField     : 'ConstraintType',

    /**
     * @cfg {String} constraintDateField The name of the field specifying the constraint date for this task.
     */
    constraintDateField     : 'ConstraintDate',

    /**
     * @cfg {String} draggableField The name of the field specifying if the event should be draggable in the timeline
     */
    draggableField          : 'Draggable',

    /**
     * @cfg {String} resizableField The name of the field specifying if/how the event should be resizable.
     */
    resizableField          : 'Resizable',

    /**
     * @cfg {String} nameField The name of the field that holds the task name. Defaults to "Name".
     */
    nameField               : 'Name',

    /**
     * @cfg {String} durationField The name of the field holding the task duration.
     */
    durationField           : 'Duration',

    /**
     * @cfg {String} durationUnitField The name of the field holding the task duration unit.
     */
    durationUnitField       : 'DurationUnit',

    /**
     * @cfg {String} effortField The name of the field holding the value of task effort.
     */
    effortField             : 'Effort',

    /**
     * @cfg {String} effortUnitField The name of the field holding the task effort unit.
     */
    effortUnitField         : 'EffortUnit',

    /**
     * @cfg {String} actualEffortField The name of the field holding the task actual effort.
     */
    actualEffortField       : 'ActualEffort',

    /**
     * @cfg {String} effortVarianceField The name of the field holding the task effort variance.
     */
    effortVarianceField     : 'EffortVariance',

    /**
     * @cfg {String} costField The name of the field holding the task cost.
     */
    costField               : 'Cost',

    /**
     * @cfg {String} actualCostField The name of the field holding the task actualcost.
     */
    actualCostField         : 'ActualCost',

    /**
     * @cfg {String} costVarianceField The name of the field holding the task cost variance.
     */
    costVarianceField       : 'CostVariance',

    /**
     * @cfg {String} percentDoneField The name of the field specifying the level of completion.
     */
    percentDoneField        : 'PercentDone',

    /**
     * @cfg {String} manuallyScheduledField The name of the field defining if a task is manually scheduled or not.
     */
    manuallyScheduledField  : 'ManuallyScheduled',

    /**
     * @cfg {String} schedulingModeField The name of the field defining the scheduling mode of the task.
     */
    schedulingModeField     : 'SchedulingMode',

    /**
     * @cfg {String} rollupField The name of the field specifying if the task should rollup to its parent task.
     */
    rollupField             : 'Rollup',

    /**
     * @cfg {String} calendarIdField The name of the field defining the id of the calendar for this specific task. Task calendar has the highest priority.
     */
    calendarIdField         : 'CalendarId',

    /**
     * @cfg {String} baselineStartDateField The name of the field that holds the task baseline start date.
     */
    baselineStartDateField  : 'BaselineStartDate',

    /**
     * @cfg {String} baselineEndDateField The name of the field that holds the task baseline end date.
     */
    baselineEndDateField    : 'BaselineEndDate',

    /**
     * @cfg {String} baselinePercentDoneField The name of the field specifying the baseline level of completion.
     */
    baselinePercentDoneField    : 'BaselinePercentDone',

    /**
     * @cfg {String} baselineEffortField The name of the field specifying the baseline level of the effort.
     */
    baselineEffortField     : 'BaselineEffort',

    /**
     * @cfg {String} baselineCostField The name of the field specifying the cost baseline level.
     */
    baselineCostField       : 'BaselineCost',

    /**
     * @cfg {String} noteField The name of the field specifying the task note.
     */
    noteField               : 'Note',

    /**
     * @cfg {String} segmentsField The name of the field specifying the task segments.
     */
    segmentsField           : 'Segments',

    /*
     * @cfg {Boolean} readOnlyField The name of the field specifying if the task is read only. When set to true, a task
     * is not draggable, resizable and for all its fields {@link #isEditable} returns `false`
     */
    readOnlyField           : 'ReadOnly',

    /**
     * @cfg {Gnt.data.Calendar} calendar
     * Optional. An explicitly provided {@link Gnt.data.Calendar calendar} instance. Usually will be retrieved by the task from the {@link Gnt.data.TaskStore task store}.
     */
    calendar                : null,

    /**
     * @cfg {Gnt.data.DependencyStore} dependencyStore
     * Optional. An explicitly provided {@link Gnt.data.DependencyStore} with dependencies information. Usually will be retrieved by the task from the {@link Gnt.data.TaskStore task store}.
     */
    dependencyStore         : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore
     * Optional. An explicitly provided Gnt.data.TaskStore with tasks information. Usually will be set by the {@link Gnt.data.TaskStore task store}.
     */
    taskStore               : null,

    /**
     * @cfg {String} phantomIdField The name of the field specifying the phantom id when this task is being 'realized' by the server.
     */
    phantomIdField          : 'PhantomId',

    /**
     * @cfg {String} phantomParentIdField The name of the field specifying the parent task phantom id when this task is being 'realized' by the server.
     */
    phantomParentIdField    : 'PhantomParentId',

    /**
     * @cfg {String} showInTimelineField The name of the field saying if the task has to be displayed in a project timeline view.
     */
    showInTimelineField     : 'ShowInTimeline',

    /**
     * @cfg {String} deadlineDateField The name of the field that holds the task deadline date.
     */
    deadlineDateField       : 'DeadlineDate',

    normalized              : false,

    recognizedSchedulingModes   : [ 'Normal', 'FixedDuration', 'EffortDriven', 'DynamicAssignment' ],

    ignoreResourceCalendarsForSchedulingMode : null,

    /**
     * Returns the constraint type of the task.
     * @method getConstraintType
     * @return {String} Constraint type. The type string might be one of the following values:
     *
     *  - `finishnoearlierthan`
     *  - `finishnolaterthan`
     *  - `mustfinishon`
     *  - `muststarton`
     *  - `startnoearlierthan`
     *  - `startnolaterthan`
     */

    /**
     * Returns the constraint date of the task.
     * @method getConstraintDate
     * @return {Date} Constraint date
     */

    /**
     * @cfg {Boolean} convertEmptyParentToLeaf
     *
     * This configuration option allows you to control whether an empty parent task should be converted into a leaf. Note, that
     * it's not a new field, but a regular configuration property of this class.
     *
     * Usually you will want to enable/disable it for the whole class:
     *
     * ```javascript
     *  Ext.define('MyApp.model.Task', {
     *      extend                   : 'Gnt.model.Task',
     *      convertEmptyParentToLeaf : false
     *  })
     * ```
     */
    convertEmptyParentToLeaf    : true,

    /**
     * @cfg {Boolean} autoCalculateEffortForParentTask
     *
     * This configuration option enables auto-calculation of the effort value for the parent task. When this option is enabled,
     * effort value of the parent tasks becomes not editable.
     *
     * Usually you will want to enable/disable it for the whole class:
     *
     * ```javascript
     *  Ext.define('MyApp.model.Task', {
     *      extend                           : 'Gnt.model.Task',
     *      autoCalculateEffortForParentTask : false
     *  })
     * ```
     */
    autoCalculateEffortForParentTask        : true,

    /**
     * @cfg {Boolean} autoCalculatePercentDoneForParentTask
     *
     * This configuration option enables auto-calculation of the percent done value for the parent task. When this option is enabled,
     * percent done value of the parent tasks becomes not editable.
     *
     * Usually you will want to enable/disable it for the whole class:
     *
     * ```javascript
     *  Ext.define('MyApp.model.Task', {
     *      extend                                : 'Gnt.model.Task',
     *      autoCalculatePercentDoneForParentTask : false
     *  })
     * ```
     */
    autoCalculatePercentDoneForParentTask   : true,

    /**
     * @cfg {Boolean} autoCalculateCostForParentTask
     *
     * This configuration option enables auto-calculation of the cost and actualcost value for the parent task. When this option is enabled,
     * cost and actualcost of the parent tasks becomes not editable.
     *
     * Usually you will want to enable/disable it for the whole class:
     *
     * ```javascript
     *   Ext.define('MyApp.model.Task', {
     *      extend                         : 'Gnt.model.Task',
     *      autoCalculateCostForParentTask : false
     *   })
     * ```
     */
    autoCalculateCostForParentTask   : true,

    /**
     * @cfg {Boolean} autoCalculateCost
     *
     * When set to `true` the values of `cost`, and `actual cost` fields are calculated automatically based on assigned resources cost.
     * When set to `false` the manually set values will be used for the fields.
     */

    autoCalculateCost           : true,

    isHighlighted               : false,

    calendarWaitingListener     : null,

    childTasksDuration          : null,
    completedChildTasksDuration : null,

    totalCount                  : null,

    // TODO: How to remove predecessors/successors?

    // NOTE: The property is managed by Gnt.data.util.TaskDependencyCache class
    /**
     * @property {Gnt.model.Dependency[]} predecessors The task predecessors list.
     */
    predecessors : null,

    // NOTE: The property is managed by Gnt.data.util.TaskDependencyCache class
    /**
     * @property {Gnt.model.Dependency[]} successors The task successors list.
     */
    successors : null,

    // special flag, that prevents parent from being converted into leafs when using "replaceChild" method
    // see `data_components/077_task_replace_child.t.js`
    removeChildIsCalledFromReplaceChild     : false,

    // see comments in `endEdit` override
    savedDirty                  : null,

    // This flag is experimental. The main reason to DO NOT USE this flag is that if you have different calendars for your tasks under the same project,
    // you can't compare their length visually. 2 tasks can be equal by their lengths, but different by their values, and vice versa.
    useOwnCalendarAsConverter   : false,

    constructor : function () {
        this._singleProp = {};

        this.callParent(arguments);

        if (this.phantom) {
            this.data[ this.phantomIdField ]    = this.getId();
        }

        if (this.id === 'root') {
            this.convertEmptyParentToLeaf = false;
        }

        // NOTE: The properties are managed by Gnt.data.util.TaskDependencyCache class
        // TODO: Remove this code when those properties are remove from Task interface
        this.predecessors = [];
        this.successors   = [];
    },


    // should be called once after initial loading - will convert the "EndDate" field to "Duration"
    // the model should have the link to calendar
    normalize: function () {
        var durationUnit    = this.getDurationUnit(),
            startDate       = this.getStartDate(),
            endDate         = this.getEndDate(),
            data            = this.data,
            taskStore       = this.getTaskStore(true),
            schedulingMode  = this.getSchedulingMode();

        if (schedulingMode == 'Manual') {
            schedulingMode  = data[ this.schedulingModeField ] = 'Normal';
            data[ this.manuallyScheduledField ] = true;
        }

        var endDateField    = this.endDateField;

        // normalize segments if required
        if (taskStore && this.isSegmented()) {
            this.normalizeSegments();

            var last;
            // if task is still segmented after segments normalization
            // let's set the task end to the last segment finish
            if (last = this.getLastSegment()) {
                endDate = data[ endDateField ] = last.getEndDate();
            }
        }

        var duration            = this.getDuration();
        var effortField         = this.effortField;

        if (endDate && this.inclusiveEndDate) {
            // End date supplied, if end dates are inclusive we need to adjust them -
            // but only IF:
            //      * The end-date dateFormat does not contain any hour info, OR
            //      * The end-date dateFormat does contain any hour info AND it has no hours/minutes/seconds/ms

            var format = this.getField(endDateField).dateFormat;

            var doAdjust = (format && !Ext.Date.formatContainsHourInfo(format)) ||
                (endDate.getHours() === 0 && endDate.getMinutes() === 0 && endDate.getSeconds() === 0 && endDate.getMilliseconds() === 0);

            if (doAdjust) {
                if (Ext.isNumber(duration)) {
                    // Recalculate end date based on duration
                    endDate = data[ endDateField ] = this.calculateEndDate(startDate, duration, durationUnit);
                } else {
                    // Simply add 1 day to end date
                    endDate = data[ endDateField ] = Ext.Date.add(endDate, Ext.Date.DAY, 1);
                }
            }
        }

        // for all scheduling modes
        if (duration == null && startDate && endDate) {
            duration    = data[ this.durationField ] = this.calculateDuration(startDate, endDate, durationUnit);
        }

        if ((schedulingMode == 'Normal' || this.isManuallyScheduled() || (schedulingMode === 'EffortDriven' && !this.isEffortDriven())) &&
            endDate == null && startDate && Ext.isNumber(duration)) {
            endDate     = data[ endDateField ] = this.calculateEndDate(startDate, duration, durationUnit);
        }

        // accessing the field value directly here, since we are interested in "raw" value
        // `getEffort` now returns 0 for empty effort values
        var effort          = this.get(effortField),
            effortUnit      = this.getEffortUnit();

        switch (schedulingMode) {

            case 'FixedDuration' :

                if (endDate == null && startDate && Ext.isNumber(duration)) {
                    endDate = data[ endDateField ] = this.calculateEndDate(startDate, duration, durationUnit);
                }

                if (effort == null && startDate && endDate) {
                    data[ effortField ] = this.calculateEffort(startDate, endDate, effortUnit);
                }

                break;

            case 'EffortDriven' :

                if (effort == null && startDate && endDate) {
                    data[ effortField ] = this.calculateEffort(startDate, endDate, effortUnit);
                }

                if (endDate == null && startDate && effort) {
                    data[ endDateField ]  = this.calculateEffortDrivenEndDate(startDate, effort, effortUnit);

                    // for "effortDriven" task, user can only provide StartDate and Effort - that's all we need
                    if (duration == null) {
                        data[ this.durationField ] = this.calculateDuration(startDate, data[ endDateField ], durationUnit);
                    }
                }

                break;

            default :

                if (endDate == null && startDate && Ext.isNumber(duration)) {
                    endDate = data[endDateField] = this.calculateEndDate(startDate, duration, durationUnit);
                }

            break;
        }

        if (this.getActualEffort() == null) {
            data[this.actualEffortField] = this.calculateActualEffort();
        }

        // calculates costs if "autoCalculateCost" is enabled
        if (this.autoCalculateCost) {
            if (this.getActualCost() == null) {
                data[this.actualCostField] = this.calculateActualCost();
            }
            if (this.getCost() == null) {
                data[this.costField] = this.calculateCost();
            }
        }

        if (this.getCostVariance() == null) {
            this.data[this.costVarianceField] = this.calculateCostVariance();
        }

        if (this.getEffortVariance() == null) {
            this.data[this.effortVarianceField] = this.calculateEffortVariance();
        }

        var calendarId      = this.getCalendarId();

        if (calendarId) this.setCalendarId(calendarId, true);

        this.normalized = true;
    },


    /**
     * Returns the {@link Gnt.data.Calendar calendar} instance to be used as a converter
     * @return {Gnt.data.Calendar} calendar
     */
    getUnitConverter : function () {
        var taskStore   = this.getTaskStore(true),
            project     = this.getProject(),
            ownCalendar = this.getCalendar();

        // - use ownCalendar (if it's told to use it)
        // - otherwise use project calendar (if the task is in a task store or in a project node)
        // - otherwise fallback to own calendar
        return this.useOwnCalendarAsConverter && ownCalendar || (taskStore || project) && this.getProjectCalendar() || ownCalendar;
    },


    // recursive task
    normalizeParent : function () {
        var childNodes              = this.childNodes;

        var totalEffortInMS         = 0;
        var totalDurationInMS       = 0;
        var completedDurationInMS   = 0;
        var cost                    = 0;
        var actualCost              = 0;

        var autoCalculatePercentDoneForParentTask   = this.autoCalculatePercentDoneForParentTask;
        var autoCalculateEffortForParentTask        = this.autoCalculateEffortForParentTask;
        var autoCalculateCostForParentTask          = this.autoCalculateCostForParentTask;
        var allTasksAreMilestonesAndFinished        = childNodes.length > 0;
        var hasUnfinishedMilestone                  = false;

        for (var i = 0; i < childNodes.length; i++) {
            var child               = childNodes[ i ];
            var isLeaf              = child.isLeaf();

            if (!isLeaf) child.normalizeParent();

            if (autoCalculateEffortForParentTask) {
                totalEffortInMS         += child.getEffort('MILLI');
            }

            if (autoCalculateCostForParentTask) {
                cost += child.getCost();
                actualCost += child.getActualCost();
            }

            if (autoCalculatePercentDoneForParentTask) {
                var durationInMS        = isLeaf ? child.getDuration('MILLI') || 0 : child.childTasksDuration,
                    childPercentDone    = child.getPercentDone() || 0;

                totalDurationInMS       += durationInMS;
                completedDurationInMS   += isLeaf ? durationInMS * childPercentDone : child.completedChildTasksDuration;

                hasUnfinishedMilestone  = hasUnfinishedMilestone || this.hasUnfinishedMilestone || (durationInMS === 0 && childPercentDone < 100);
                allTasksAreMilestonesAndFinished = allTasksAreMilestonesAndFinished && durationInMS === 0 && childPercentDone >= 100;
            }
        }

        if (autoCalculatePercentDoneForParentTask) {
            var newPercentDone          = 0;

            this.childTasksDuration             = totalDurationInMS;
            this.completedChildTasksDuration    = completedDurationInMS;
            this.hasUnfinishedMilestone         = hasUnfinishedMilestone;

            if (totalDurationInMS > 0) {
                newPercentDone = completedDurationInMS / totalDurationInMS;

                // Indicate there are unfinished tasks
                if (newPercentDone === 100 && hasUnfinishedMilestone) {
                    newPercentDone = 99;
                }
            } else if (allTasksAreMilestonesAndFinished){
                // For parent tasks containing only milestones, if there is at least one task with < 100% done, the parent task should report itself as 0% done
                // If all children are 100%, parent reports 100% done too
                newPercentDone = 100;
            }

            if (this.getPercentDone() != newPercentDone)    this.data[ this.percentDoneField ] = newPercentDone;
        }

        if (autoCalculateEffortForParentTask) {
            if (this.getEffort('MILLI') != totalEffortInMS) this.data[ this.effortField ] = this.getUnitConverter().convertMSDurationToUnit(totalEffortInMS, this.getEffortUnit());
        }

        if (autoCalculatePercentDoneForParentTask && autoCalculateEffortForParentTask) {
            this.data[ this.actualEffortField ] = this.calculateActualEffort();
        }

        if (autoCalculateCostForParentTask) {
            this.data[ this.actualCostField ] = actualCost;
            this.data[ this.costField ] = cost;
        }

        this.data[this.costVarianceField] = this.calculateCostVariance();
        this.data[this.effortVarianceField] = this.calculateEffortVariance();
    },


    /**
     * Returns the {@link Gnt.data.Calendar calendar} instance, associated with this task. If task has no own calendar, it will be recursively looked up
     * starting from task's parent. If no one from parents have own calendar then project calendar will be returned.
     * See also `ownCalendarOnly` parameter and {@link #getOwnCalendar}, {@link #getProjectCalendar} methods.
     *
     * @param {Boolean} ownCalendarOnly (optional) When set to true, return only own calendar of this task and `null` if task has no calendar
     *
     * @return {Gnt.data.Calendar} calendar
     */
    getCalendar: function (ownCalendarOnly, ignoreAbsense) {
        return ownCalendarOnly ? this.getOwnCalendar() : this.getOwnCalendar() || this.parentNode && this.parentNode.getCalendar() || this.getProjectCalendar(ignoreAbsense);
    },


    /**
     * Returns the {@link Gnt.data.Calendar calendar} instance, associated with this task (if any). See also {@link #calendarIdField}.
     *
     * @return {Gnt.data.Calendar} calendar
     */
    getOwnCalendar : function () {
        var calendarId    = this.get(this.calendarIdField);

        return calendarId ? Gnt.data.Calendar.getCalendar(calendarId) : this.calendar;
    },

    // TODO: cache project
    /**
     * Returns the {@link Gnt.model.Project project} instance, associated with this task if this task belongs to a project
     *
     * @return {Gnt.model.Project} project
     */
    getProject : function () {
        var me      = this,
            project = null;

        if (this.isProject) {
            return this;
        }

        this.bubble(function (task) {
            if (me !== task && task.isProject) {
                project = task;
                return false;
            }
        }, this);

        return project;
    },


    /**
     * Returns the {@link Gnt.data.Calendar calendar} instance, associated with the project of this task (with the TaskStore instance
     * this task belongs to).
     *
     * @return {Gnt.data.Calendar} calendar
     */
    getProjectCalendar: function (ignoreAbsense) {
        var store       = this.getTaskStore(true);
        var calendar    = store && store.getCalendar() || this.parentNode && this.parentNode.getProjectCalendar() || this.isRoot() && this.calendar;

        if (!calendar && !ignoreAbsense) {
            Ext.Error.raise("Can't find a project calendar in `getProjectCalendar`");
        }

        return calendar;
    },

    getProjectStartDate : function () {
        var taskStore = this.getTaskStore(true),
            project   = this.getProject();

        return project && project.getStartDate() || taskStore && taskStore.getProjectStartDate();
    },

    getProjectEndDate : function () {
        var taskStore = this.getTaskStore(true),
            project   = this.getProject();

        return project && project.getEndDate() || taskStore && taskStore.getProjectEndDate();
    },

    getProjectScheduleBackwards : function (taskStore, project) {
        taskStore = taskStore || this.getTaskStore(true);
        project   = project || this.getProject();

        return Boolean(project ? project.getScheduleBackwards() : taskStore && taskStore.scheduleBackwards);
    },

    /**
     * @propagating
     * Sets the {@link Gnt.data.Calendar calendar}, associated with this task. Calendar must have a {@link Gnt.data.Calendar#calendarId calendarId} property
     * defined, which will be saved in the `CalendarId` field of this task.
     *
     * @param {Gnt.data.Calendar/String} calendar A calendar instance or string with calendar id
     * @param {Function} [callback] Callback function to call after task calendar has been changed and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setCalendar: function (calendar, callback) {
        var me = this,
            isCalendarInstance  = calendar instanceof Gnt.data.Calendar;

        if (isCalendarInstance && !calendar.calendarId) {
            throw new Error("Can't set calendar w/o `calendarId` property");
        }

        return me.setCalendarId(isCalendarInstance ? calendar.calendarId : calendar, false, callback);
    },


    /**
     * @propagating
     * @private
     */
    setCalendarId : function(calendarId, isInitial, callback) {
        var me = this;

        if (!isInitial) {
            me.propagateChanges(
                function() {
                    return me.setCalendarIdWithoutPropagation(calendarId, isInitial);
                },
                callback
            );
        }
        else {
            me.setCalendarIdWithoutPropagation(calendarId, isInitial);
        }
    },


    onCalendarChange : function (calendar) {
        if (!this.isReadOnly() && this.isTaskStored()) {
            this.adjustToCalendarWithoutPropagation();
        }
    },


    setCalendarIdWithoutPropagation : function (calendarId, isInitial) {
        var propagate = false;

        if (calendarId instanceof Gnt.data.Calendar) calendarId = calendarId.calendarId;

        var prevCalendarId  = this.getCalendarId();

        if (prevCalendarId != calendarId || isInitial) {

            propagate = true;

            if (this.calendarWaitingListener) {
                this.calendarWaitingListener.destroy();
                this.calendarWaitingListener = null;
            }

            var listeners       = {
                calendarchange  : this.onCalendarChange,
                scope           : this
            };

            var prevInstance    = this.calendar || Gnt.data.Calendar.getCalendar(prevCalendarId);

            // null-ifying the "explicit" property - it should not be used at all generally, only "calendarId"
            this.calendar   = null;

            prevInstance && prevInstance.un(listeners);

            this.set(this.calendarIdField, calendarId);

            if (!calendarId && !isInitial) {
                this.onCalendarChange();
            }
            else if (calendarId) {
                var calendarInstance = Gnt.data.Calendar.getCalendar(calendarId);

                if (calendarInstance) {
                    calendarInstance.on(listeners);

                    if (!isInitial) {
                        this.onCalendarChange();
                    }
                }
                else {
                    this.calendarWaitingListener = Ext.data.StoreManager.on('add', function onCalendarWaitingStoreManagerAdd() {
                        calendarInstance    = Gnt.data.Calendar.getCalendar(calendarId);

                        // Checking if we're still in an active store
                        if (this.isTaskStored()) {

                            // We are.

                            // Checking for calendar instance
                            if (calendarInstance) {
                                this.calendarWaitingListener.destroy();
                                this.calendarWaitingListener = null;

                                calendarInstance.on(listeners);

                                this.onCalendarChange();
                            }
                            // No calendar instance yet, wait again
                            else {
                                this.calendarWaitingListener = Ext.data.StoreManager.on(
                                    'add',
                                    onCalendarWaitingStoreManagerAdd,
                                    this,
                                    { destroyable : true, single : true }
                                );
                            }
                        }
                    }, this, { destroyable : true, single : true });
                }
            }
        }

        return propagate;
    },


    /**
     * Returns the dependency store, associated with this task.
     *
     * @return {Gnt.data.DependencyStore} The dependency store instance
     */
    getDependencyStore: function () {
        var taskStore = this.getTaskStore(true),
            dependencyStore = taskStore && taskStore.getDependencyStore();

        return dependencyStore;
    },


    /**
     * Returns the resource store, associated with this task.
     *
     * @return {Gnt.data.Resource} The resource store instance
     */
    getResourceStore : function () {
        var taskStore = this.getTaskStore(true);
        return taskStore && taskStore.getResourceStore();
    },


    /**
     * Returns the assignment store, associated with this task.
     *
     * @return {Gnt.data.AssignmentStore} The assignment store instance
     */
    getAssignmentStore : function () {
        var taskStore = this.getTaskStore(true);
        return taskStore && taskStore.getAssignmentStore();
    },


    /**
     * Returns the {@link Gnt.data.TaskStore task store} instance, associated with this task
     *
     * @return {Gnt.data.TaskStore} task store
     */
    getTaskStore: function (ignoreAbsense) {
        var me = this;

        if (!me.taskStore) {
            me.taskStore = me.getTreeStore() || me.parentNode && me.parentNode.getTaskStore(ignoreAbsense);
        }

        if (!me.taskStore && !ignoreAbsense) {
            Ext.Error.raise("Can't find a taskStore in `getTaskStore`");
        }

        return me.taskStore;
    },

    getEventStore : function() {
        return this.getTaskStore();
    },

    /**
     * Provides a reference to a {@link Gnt.data.TaskStore task store} instance, which the task will use to access the global
     * {@link Gnt.data.Calendar calendar}. Calling this does *not* add the model to the task store. Call this method if you want to use
     * methods like {@link #setStartDate} or {@link #setEndDate} that should take the store calendar into account.
     *
     * @param {Gnt.data.TaskStore} taskStore The task store
     */
    setTaskStore : function (taskStore) {
        this.taskStore = taskStore;
    },


    /**
     * Returns true if the task is manually scheduled. Manually scheduled task is not affected by incoming dependencies or constraints.
     * Also, the manually scheduled parent task is not affected by its child tasks positions and behaves like any other normal task.
     *
     * @return {Boolean} The value of the ManuallyScheduled field
     */
    isManuallyScheduled : function () {
        return this.get(this.manuallyScheduledField);
    },

    /**
     * Returns true if {@link Gnt.model.Task#field-SchedulingMode} is 'EffortDriven' and either it has assignments
     * or it has no assignments but {@link Gnt.data.TaskStore#enableSetDurationOnEffortDrivenTask} flag is disabled.
     * @return {boolean}
     * @private
     */
    isEffortDriven : function () {
        return this.getSchedulingMode() === 'EffortDriven' &&
            !(this.getAssignments().length === 0 && this.getTaskStore().enableSetDurationOnEffortDrivenTask);
    },

    isShowInTimeline : function () {
        return Boolean(this.getShowInTimeline());
    },

    /**
     * @propagating
     * Sets the task manually scheduled status.
     *
     * @param {Boolean} value The new value of the `SchedulingMode` field
     * @param {Function} [callback] Callback function to call after effort has been set and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setManuallyScheduled: function (value, callback) {

        var me  = this;

        me.propagateChanges(
            function() {
                return me.setManuallyScheduledWithoutPropagation(value);
            },
            callback
        );
    },

    /**
     * Sets the task manually scheduled status.
     */
    setManuallyScheduledWithoutPropagation : function(value) {
        var me = this;
        var wasManuallyScheduled = me.isManuallyScheduled();

        if (me.getManuallyScheduled() != value) {
            this.set(me.manuallyScheduledField, value);
        }

        // if the task is no longer manually scheduled we need to reschedule it
        if (wasManuallyScheduled && !me.isManuallyScheduled()) {
            me.markForRescheduling();
        }

        return true;
    },


    /**
     * @method getSchedulingMode
     *
     * Returns the scheduling mode of this task.
     *
     * May be one of the following strings:
     *
     * - `Normal` is the default (and backward compatible) mode. It means the task will be scheduled based on information
     * about its start/end dates, task own calendar (project calendar if there's no one) and calendars of the assigned resources.
     *
     * - `FixedDuration` mode means, that task has fixed start and end dates, but its effort will be computed dynamically,
     * based on the assigned resources information. Typical example of such task is - meeting. Meetings typically have
     * pre-defined start and end dates and the more people are participating in the meeting, the more effort is spent on the task.
     * When duration of such task increases, its effort is increased too (and vice-versa). **NOTE:** fixed start and end dates
     * here doesn't mean that a user can't update them via GUI, the only field which won't be editable in GUI is the effort field,
     * it will be calculated according to duration and resources assigned to the task.
     *
     * - `EffortDriven` mode means, that task has fixed effort and computed duration. The more resources will be assigned
     * to this task, the less the duration will be. The typical example will be a "paint the walls" task -
     * several painters will complete it faster.
     * **NOTE:** Task is not EffortDriven if it has no assignments and {@link Gnt.data.TaskStore#enableSetDurationOnEffortDrivenTask} flag is enabled.
     *
     * - `DynamicAssignment` mode can be used when both duration and effort of the task are fixed. The computed value in this
     * case will be - the assignment units of the resources assigned. In this mode, the assignment level of all assigned resources
     * will be updated to evenly distribute the task's workload among them.
     *
     * **NOTE:** Parent tasks are always Normal and accumulate results from their children, except those which are {@link #ManuallyScheduled}.
     *
     * @return {String} scheduling mode string
     */


    /**
     * @propagating
     * @inheritdoc #setSchedulingModeWithoutPropagation
     * @param {String} value Name of the scheduling mode.
     * The list of possible values is provided in the {@link #SchedulingMode} field description.
     * @param {Function} [callback] Callback function to call after task's scheduling mode has been changed and possible
     *  changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setSchedulingMode : function(value, callback) {
        var me = this;

        me.propagateChanges(
            function () {
                return me.setSchedulingModeWithoutPropagation(value);
            },
            callback
        );
    },

    /**
     * Sets the scheduling mode for this task.
     *
     * @param {String} value Name of the scheduling mode.
     * The list of possible values is provided in the {@link #SchedulingMode} field description.
     */
    setSchedulingModeWithoutPropagation : function(value) {
        var me = this,
            propagationSource;

        // <debug>
        Ext.Array.contains(me.recognizedSchedulingModes, value) ||
           Ext.Error.raise("Unrecognized scheduling mode: " + value);
        // </debug>

        if (me.getSchedulingMode() != value) {

            me.set(this.schedulingModeField, value);

            if (me.isEffortDriven()) {
                me.updateSpanBasedOnEffort();
            }
            else if (me.getSchedulingMode() == 'FixedDuration') {
                me.updateEffortBasedOnDuration();
            }

            var predecessors = me.getPredecessors();

            if (predecessors.length) {
                propagationSource = predecessors[0];
            } else {
                propagationSource = me;
            }
        }

        return propagationSource;
    },


    /**
     * @method getSegments
     * Gets segments of the task
     * @returns {Gnt.model.TaskSegment[]} Task segments
     */

    skipWorkingTime : function (date, duration, isForward, segments) {
        if (!date) return date;

        var result;
        var durationLeft;

        isForward   = isForward !== false;

        var me             = this,
            schedulingMode = me.getSchedulingMode(),
            useResources   = me.shouldUseResourceCalendarsForSchedulingMode(schedulingMode);

        var cfg            = {
            isForward   : isForward,
            segments    : segments || false,
            // take resources into account if any
            resources   : useResources && me.hasResources(),
            fn          : function (from, to) {
                var diff            = to - from,
                    dstDiff         = new Date(from).getTimezoneOffset() - new Date(to).getTimezoneOffset();

                if (diff >= durationLeft) {
                    result          = new Date((isForward ? from : to) - 0 + (isForward ? 1 : -1) * durationLeft);

                    return false;
                } else {
                    durationLeft    -= diff + dstDiff * 60 * 1000;
                }
            }
        };

        if (Ext.isObject(date)) {
            Ext.apply(cfg, date);
        } else {
            if (isForward) {
                cfg.startDate   = date;
            } else {
                cfg.endDate     = date;
            }
        }

        durationLeft    = duration || cfg.duration;

        if (!durationLeft) return date;

        me.forEachAvailabilityInterval(cfg);

        return result;
    },

    /**
     * @ignore
     */
    skipNonWorkingTime : function (date, isForward, segments) {
        if (!date) return date;

        var skipped     = false;

        isForward       = isForward !== false;

        var me             = this,
            schedulingMode = me.getSchedulingMode(),
            useResources   = me.shouldUseResourceCalendarsForSchedulingMode(schedulingMode);

        var cfg            = {
            isForward   : isForward,
            segments    : segments || false,
            // take resources into account if any
            resources   : useResources && me.hasResources(),
            fn          : function (from, to) {
                // if found interval has zero time length then nothing to skip so we just ignore it.
                // TODO: need to review a possibility to move this condition right into forEachAvailabilityInterval() body
                if (from !== to) {
                    date        = isForward ? from : to;
                    skipped     = true;

                    return false;
                }
            }
        };

        if (Ext.isObject(date)) {
            Ext.apply(cfg, date);
        } else {
            if (isForward) {
                cfg.startDate   = date;
            } else {
                cfg.endDate     = date;
            }
        }

        // resetting the date to the earliest availability interval
        me.forEachAvailabilityInterval(cfg);

        return skipped ? new Date(date) : me.getCalendar().skipNonWorkingTime(date, isForward);
    },


    /**
     * @method getStartDate
     *
     * Returns the start date of this task
     *
     * @return {Date} start date
     */


    /**
     * @propagating
     * @inheritdoc #setStartDateWithoutPropagation
     * @param {Date} date Start date to set
     * @param {Boolean} [keepDuration=true] Pass `true` to keep the duration of the task ("move" the task), `false` to change the duration ("resize" the task).
     * @param {Boolean} [skipNonWorkingTime=taskStore.skipWeekendsDuringDragDrop] Pass `true` to automatically move the start date to the earliest available working time (if it falls on non-working time).
     * @param {Function} [callback] Callback function to call after start date has been set and changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setStartDate : function (date, keepDuration, skipNonWorkingTime, callback) {
        var me  = this;

        me.propagateChanges(
            function (task, continueFn) {
                me.setStartDateAndPinWithoutPropagation(date, keepDuration, skipNonWorkingTime, continueFn);
            },
            callback,
            null,
            true
        );
    },

    setStartDateAndPinWithoutPropagation : function (startDate, keepDuration, skipNonWorkingTime, continueFn) {
        var me  = this,
            result = me.setStartDateWithoutPropagation(startDate, keepDuration, skipNonWorkingTime);

        me.maybePinWithoutPropagation(function (constraintSatisfied, cancelChanges) {
            // If user clicked to cancel changes in constraint resolution UI
            // we pass false to the callback (otherwise we pass the propagation source(s))
            if (continueFn) {
                continueFn(cancelChanges ? false : result);
            }
        });
    },


    // TODO: refactor this
    /**
     * Depending from the arguments, set either `StartDate + EndDate` fields of this task, or `StartDate + Duration`
     * considering the weekends/holidays rules. The modifications are wrapped with `beginEdit/endEdit` calls.
     *
     * @param {Date} date Start date to set
     * @param {Boolean} [keepDuration=true] Pass `true` to keep the duration of the task ("move" the task), `false` to change the duration ("resize" the task).
     * @param {Boolean} [skipNonWorkingTime=taskStore.skipWeekendsDuringDragDrop] Pass `true` to automatically move the start date to the earliest available working time (if it falls on non-working time).
     */
    setStartDateWithoutPropagation : function (date, keepDuration, skipNonWorkingTime) {
        var me = this,
            taskStore = me.getTaskStore(true),
            duration, endDate;

        // {{{ Parameters normalization
        // Effort driven tasks should always recalculate their duration
        // changing of their positions can cause duration changes because of assigned resources calendars
        keepDuration = typeof keepDuration == 'boolean' ? keepDuration : !me.isEffortDriven();
        skipNonWorkingTime = typeof skipNonWorkingTime == 'boolean' ? skipNonWorkingTime : taskStore && taskStore.skipWeekendsDuringDragDrop;
        // }}}

        me.autoCalculateLag();

        me.beginEdit();

        if (!date) {
            me.set(me.durationField, null);
            me.set(me.startDateField, null);
            me.setSegmentsWithoutPropagation(null);

        } else {

            if (skipNonWorkingTime && !(me.isMilestone() && taskStore && taskStore.scheduleByConstraints)) {
                // for milestones we skip non-working backwards, for normal tasks - forward
                date = me.skipNonWorkingTime(date, !me.isMilestone());
            }

            me.set(me.startDateField, date);

            // recalculate split dates
            if (taskStore && me.isSegmented()) {
                me.updateSegmentsDates();
            }

            if (keepDuration !== false) {
                me.set(me.endDateField, me.recalculateEndDate(date));
            } else {
                endDate  = this.getEndDate();

                if (endDate) {
                    // truncate segments that don't fit into master task range and shrink/expand last segment
                    this.constrainSegments();

                    me.set(me.durationField, me.calculateDuration(date, endDate, me.getDurationUnit()));
                }
            }
        }
        // eof "has `date`" branch

        duration            = me.getDuration();
        endDate             = me.getEndDate();

        if (date && endDate && (duration === undefined || duration === null)) {
            me.set(me.durationField, me.calculateDuration(date, endDate, me.getDurationUnit()));
        }

        me.onPotentialEffortChange();

        me.endEdit();

        return true;
    },

    // TODO: for milestones another constraint type has to be chosen (FNET instead of SNET)
    getPinConstraintType : function (taskStore) {
        return this.getProjectScheduleBackwards(taskStore) ? 'finishnolaterthan' : 'startnoearlierthan';
    },

    pinWithoutPropagation : function (date, force) {
        var me        = this,
            taskStore = me.getTaskStore(true);

        if (me.isPinnable(taskStore)) {
            var pinConstraintType = me.getPinConstraintType(taskStore),
                scheduleBackwards = me.getProjectScheduleBackwards(),
                taskDate          = date || (scheduleBackwards ? me.getEndDate() : me.getStartDate());

            me.unpinWithoutPropagation(true);

            if (force || (taskDate - (scheduleBackwards ? me.getLateEndDate() : me.getEarlyStartDate()))) {
                me.setConstraintWithoutPropagation(pinConstraintType, taskDate);
            }

        }
    },

    unpinWithoutPropagation : function (skipRescheduling) {
        this.setConstraintWithoutPropagation(null, null, skipRescheduling);
    },

    isPinnable : function (taskStore) {
        taskStore = taskStore || this.getTaskStore(true);

        var result = false;

        // we should not pin manually scheduled tasks
        if (!this.isManuallyScheduled()) {
            var constraintType = this.getConstraintType();

            // in the backward scheduling mode we pin tasks silently
            if (this.getProjectScheduleBackwards(taskStore)) {
                result = true;

            // in forward scheduling we ask of some constraints violation
            } else if (constraintType) {

                switch (constraintType) {
                    case 'assoonaspossible':
                    case 'aslateaspossible':
                    case 'startnoearlierthan':
                    case 'finishnoearlierthan':
                        result = true;
                }

            // no constraints -> we can pin
            } else {
                result = true;
            }
        }

        return result;
    },


    maybePinWithoutPropagation : function (callback) {
        var me                = this,
            taskStore         = me.getTaskStore(true),
            scheduleBackwards = me.getProjectScheduleBackwards(),
            taskDate          = (scheduleBackwards ? me.getEndDate() : me.getStartDate());

        // if the project is scheduled from its start to end
        if (taskStore && taskStore.scheduleByConstraints && !taskStore.isBackwardScheduled() && taskDate && me.isProjected(scheduleBackwards ? me.endDateField : me.startDateField)) {
            var dependencyConstraint = me.getDependencyConstraintClass();

            // If the dependency constraint is set and it's not satisfied let's run constraints verification loop
            // to ask user what to do ..and continue upon user's decision is provided
            if (taskStore.checkDependencyConstraint && dependencyConstraint && dependencyConstraint.hasThisConstraintApplied(me) && !dependencyConstraint.isSatisfied(me)) {

                me.doVerifyConstraints([ dependencyConstraint ], callback);

            } else {
                // pin the task w/ a constraint
                me.pinWithoutPropagation(taskDate);

                callback && callback();
            }

        } else {
            callback && callback();
        }
    },


    isPinned : function () {
        return this.getConstraintType() == this.getPinConstraintType();
    },


    /**
     * @method getEndDate
     * Returns the end date of this task
     * @return {Date} end date
     */

    /**
     * @propagating
     * @inheritdoc #setEndDateWithoutPropagation
     * @param {Date} date End date to set
     * @param {Boolean} [keepDuration=true] Pass `true` to keep the duration of the task ("move" the task), `false` to change the duration ("resize" the task).
     * @param {Boolean} [skipNonWorkingTime=taskStore.skipWeekendsDuringDragDrop] Pass `true` to automatically move the end date to the previous working day (if it falls on weekend/holiday).
     * @param {Function} [callback] Callback function to call after end date has been set and changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setEndDate : function (date, keepDuration, skipNonWorkingTime, callback) {
        var me  = this;

        me.propagateChanges(
            function (task, continueFn) {
                me.setEndDateAndPinWithoutPropagation(date, keepDuration, skipNonWorkingTime, continueFn);
            },
            callback,
            null,
            true
        );
    },

    setEndDateAndPinWithoutPropagation : function (endDate, keepDuration, skipNonWorkingTime, continueFn) {
        var me  = this,
            result = me.setEndDateWithoutPropagation(endDate, keepDuration, skipNonWorkingTime);

        me.maybePinWithoutPropagation(function (constraintSatisfied, cancelChanges) {
            // If user clicked to cancel changes in constraint resolution UI
            // we pass false to the callback (otherwise we pass the propagation source(s))
            if (continueFn) {
                continueFn(cancelChanges ? false : result);
            }
        });
    },

    // TODO: refactor this
    /**
     * Depending on the arguments, sets either `StartDate + EndDate` fields of this task, or `EndDate + Duration`
     * considering the weekends/holidays rules. The modifications are wrapped with `beginEdit/endEdit` calls.
     *
     * @param {Date} date End date to set
     * @param {Boolean} [keepDuration=true] Pass `true` to keep the duration of the task ("move" the task), `false` to change the duration ("resize" the task).
     * @param {Boolean} [skipNonWorkingTime=taskStore.skipWeekendsDuringDragDrop] Pass `true` to automatically move the end date to the previous working day (if it falls on weekend/holiday).
     */
    setEndDateWithoutPropagation : function (date, keepDuration, skipNonWorkingTime) {
        var me = this,
            taskStore = me.getTaskStore(true),
            duration, startDate;

        // {{{ Parameters normalization
        keepDuration = keepDuration !== false;

        if (skipNonWorkingTime !== true && skipNonWorkingTime !== false && taskStore) {
            skipNonWorkingTime = taskStore.skipWeekendsDuringDragDrop;
        }
        else if (skipNonWorkingTime !== true && skipNonWorkingTime !== false) {
            skipNonWorkingTime = false;
        }
        // }}}

        me.autoCalculateLag();

        me.beginEdit();

        var currentEndDate    = me.getEndDate();

        if (!date) {
            me.set(me.durationField, null);
            me.set(me.endDateField, null);
            me.setSegments(null);
        } else {
            startDate       = me.getStartDate();

            // task end date cannot be less than its start date
            if (!keepDuration && date < startDate) {
                date        = startDate;
            }

            if (skipNonWorkingTime && (!taskStore.scheduleByConstraints || (date - startDate !== 0))) {
                date        = me.skipNonWorkingTime(date, false);
            }

            if (keepDuration) {
                duration    = me.getDuration();

                if (Ext.isNumber(duration)) {
                    // recalculate segments dates (we need this to calculate the task start date properly)
                    if (taskStore && me.isSegmented() && (date - currentEndDate)) {
                        me.updateSegmentsDates({
                            isForward   : false,
                            endDate     : date
                        });
                    }
                    me.set(me.startDateField, me.calculateStartDate(date, duration, me.getDurationUnit()));
                    me.set(me.endDateField, date);
                } else {
                    me.set(me.endDateField, date);
                }
            } else {
                var wasMilestone    = me.isMilestone();

                // if end date after adjusting to calendar is less than start date
                // then it's going to be a milestone and we set start date equal to adjusted end date
                if (date < startDate) {
                    me.set(me.startDateField, date);
                }

                me.set(me.endDateField, date);

                me.constrainSegments();

                if (startDate) {
                    me.set(me.durationField, me.calculateDuration(startDate, date, me.getDurationUnit()));

                    // if we converted to regular task from milestone
                    // let's make sure that task start is adjusted to the calendar
                    if (wasMilestone && !me.isMilestone()) {
                        var properStartDate = me.skipNonWorkingTime(startDate, true);
                        if (properStartDate - startDate !== 0) {
                            // set start date adjusted to the calendar
                            me.set(me.startDateField, properStartDate);
                        }
                    }
                }
            }
        }

        duration            = me.getDuration();
        startDate           = me.getStartDate();

        if (date && startDate && (duration === undefined || duration === null)) {
            me.set(me.durationField, me.calculateDuration(startDate, date, me.getDurationUnit()));
        }

        me.onPotentialEffortChange();

        me.endEdit();

        return true;
    },

    /**
     * @propagating
     * @inheritdoc #setStartEndDateWithoutPropagation
     * @param {Date} startDate Start date to set
     * @param {Date} endDate End date to set
     * @param {Boolean} [skipNonWorkingTime=taskStore.skipWeekendsDuringDragDrop] Pass `true` to automatically move the start/end dates to the next/previous working day (if they falls on weekend/holiday).
     * @param {Function} [callback] Callback function to call after start/end date has been set and changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setStartEndDate : function (startDate, endDate, skipNonWorkingTime, callback) {
        var me  = this;

        me.propagateChanges(
            function (task, continueFn) {
                me.setStartEndDateAndPinWithoutPropagation(startDate, endDate, skipNonWorkingTime, continueFn);
            },
            callback,
            null,
            true
        );
    },

    setStartEndDateAndPinWithoutPropagation : function (startDate, endDate, skipNonWorkingTime, continueFn) {
        var me  = this,
            result = me.setStartEndDateWithoutPropagation(startDate, endDate, skipNonWorkingTime);

        me.maybePinWithoutPropagation(function (constraintSatisfied, cancelChanges) {
            // If user clicked to cancel changes in constraint resolution UI
            // we pass false to the callback (otherwise we pass the propagation source(s))
            if (continueFn) {
                continueFn(cancelChanges ? false : result);
            }
        });
    },

    /**
     * Sets the `StartDate / EndDate / Duration` fields of this task, considering the availability/holidays information.
     * The modifications are wrapped with `beginEdit/endEdit` calls.
     *
     * @param {Date} startDate Start date to set
     * @param {Date} endDate End date to set
     * @param {Boolean} [skipNonWorkingTime=taskStore.skipWeekendsDuringDragDrop] Pass `true` to automatically move the start/end dates to the next/previous working day (if they falls on weekend/holiday).
     */
    setStartEndDateWithoutPropagation : function(startDate, endDate, skipNonWorkingTime) {
        var me           = this,
            taskStore    = me.getTaskStore(true),
            zeroDuration = startDate && endDate && startDate - endDate === 0;

        // {{{ Parameters normalization
        if (skipNonWorkingTime !== true && skipNonWorkingTime !== false && taskStore) {
            skipNonWorkingTime = taskStore.skipWeekendsDuringDragDrop && (!zeroDuration || !taskStore.scheduleByConstraints);
        }
        else if (skipNonWorkingTime !== true && skipNonWorkingTime !== false) {
            skipNonWorkingTime = false;
        }
        // }}}

        if (skipNonWorkingTime) {
            startDate = startDate && me.skipNonWorkingTime(startDate, true);
            endDate   = endDate && me.skipNonWorkingTime(endDate, false);

            if (endDate != null && endDate < startDate) {
                startDate = endDate;
            }
        }

        var currentStartDate    = me.getStartDate(),
            currentEndDate      = me.getEndDate();

        me.beginEdit();

        me.set(me.startDateField, startDate);
        me.set(me.endDateField,   endDate);

        // recalculate split dates
        if (me.getTaskStore(true) && me.isSegmented() && ((startDate - currentStartDate) || (endDate != null && endDate - currentEndDate))) {
            me.updateSegmentsDates();
        }

        if (endDate != null && endDate - currentEndDate) {
            me.constrainSegments();
        }

        if (endDate == null) {
            me.set(me.durationField, null);
        }
        else {
            me.set(me.durationField, me.calculateDuration(startDate, endDate, me.getDurationUnit()));
        }

        me.onPotentialEffortChange();

        me.endEdit();

        return true;
    },


    /**
     * @propagating
     * Shifts the dates for the date range by the passed amount and unit
     * @param {String} unit The unit to shift by (e.g. range.shift(Sch.util.Date.DAY, 2); ) to bump the range 2 days forward
     * @param {Number} amount The amount to shift
     * @param {Function} [callback] Callback function to call after task has been shifted and changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    shift : function(unit, amount, callback) {
        var me        = this,
            startDate = me.getStartDate(),
            endDate   = me.getEndDate();

        me.setStartEndDate(
            startDate && Sch.util.Date.add(startDate, unit, amount),
            endDate && Sch.util.Date.add(endDate, unit, amount),
            false,
            callback
        );
    },


    /**
     * Returns the duration of the task expressed in the unit passed as the only parameter (or as specified by the DurationUnit for the task).
     *
     * @param {String} [unit] Unit to return the duration in. Defaults to the `DurationUnit` field of this task
     *
     * @return {Number} duration
     */
    getDuration: function (unit) {
        var result = this.get(this.durationField);

        if (result && unit) {
            result = this.getUnitConverter().convertDuration(result, this.getDurationUnit(), unit);
        }

        return result;
    },


    /**
     * Returns the effort of the task expressed in the unit passed as the only parameter (or as specified by the EffortUnit for the task).
     *
     * @param {String} [unit] Unit to return the effort in. Defaults to the `EffortUnit` field of this task
     *
     * @return {Number} effort
     */
    getEffort: function (unit) {
        var result = this.get(this.effortField) || 0;

        if (result && unit) {
            result = this.getUnitConverter().convertDuration(result, this.getEffortUnit(), unit);
        }

        return result;
    },


    /**
     * @propagating
     * @inheritdoc #setEffortWithoutPropagation
     * @param {Number} number The number of duration units
     * @param {String} [unit=task.getEffortUnit()] The unit of the effort.
     * @param {Function} [callback] Callback function to call after effort has been set and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setEffort: function (number, unit, callback) {
        var me  = this;

        me.propagateChanges(
            function() {
                return me.setEffortWithoutPropagation(number, unit);
            },
            callback
        );
    },

    /**
     * Sets the `Effort + EffortUnit` fields of this task. In case the task has the `EffortDriven`
     * scheduling mode will also update the duration of the task accordingly.
     * In case of `DynamicAssignment` mode - will update the assignments.
     *
     * The modifications are wrapped with `beginEdit/endEdit` calls.
     *
     * @param {Number} number The number of duration units
     * @param {String} [unit=task.getEffortUnit()] The unit of the effort.
     */
    setEffortWithoutPropagation : function(number, unit) {
        var me = this;

        //region Parameters normalization
        unit = unit || me.getEffortUnit();
        //endregion

        me.beginEdit();

        me.set(me.effortField, number);
        me.set(me.effortUnitField, unit);

        if (me.isEffortDriven()) {
            me.updateSpanBasedOnEffort();
        }
        else if (me.getSchedulingMode() == 'DynamicAssignment') {
            me.updateAssignments();
        }

        me.set(me.actualEffortField, me.calculateActualEffort());
        me.setEffortVariance(me.calculateEffortVariance());

        me.recalculateCost();

        me.endEdit();

        return true;
    },


    /**
     * Returns the "raw" calendar duration (difference between end and start date) of this task in the given units.
     *
     * Please refer to the "Task durations" section for additional important details about duration units.
     *
     * @param {String} unit Unit to return return the duration in. Defaults to the `DurationUnit` field of this task
     *
     * @return {Number} duration
     */
    getCalendarDuration: function (unit) {
        return this.getUnitConverter().convertMSDurationToUnit(this.getEndDate() - this.getStartDate(), unit || this.get(this.durationUnitField));
    },


    /**
     * @propagating
     * @inheritdoc #setDurationWithoutPropagation
     * @param {Number} number The number of duration units
     * @param {String} [unit=task.getDurationUnit()] The unit of the duration.
     * @param {Function} [callback] Callback function to call after duration has been set and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setDuration : function(number, unit, callback) {
        var me  = this;

        me.propagateChanges(
            function() {
                return me.setDurationWithoutPropagation(number, unit);
            },
            callback
        );
    },

    /**
     * Sets the `Duration + DurationUnit + EndDate` fields of this task, considering the weekends/holidays rules.
     * The modifications are wrapped with `beginEdit/endEdit` calls.
     *
     * May also update additional fields, depending on the scheduling mode.
     *
     * @param {Number} number The number of duration units
     * @param {String} [unit=task.getDurationUnit()] The unit of the duration.
     */
    setDurationWithoutPropagation: function(number, unit) {
        var me = this;

        // {{{ Parameters normalization
        unit = unit || me.getDurationUnit();
        // }}}

        var wasMilestone        = me.isMilestone(),
            taskStore           = me.getTaskStore(true),
            isManuallyScheduled = me.isManuallyScheduled(),
            // If a task has end predecessors, and no start predecessors we update the start date instead of the end date
            updateStartDate     = !isManuallyScheduled && me.hasEndPredecessorsButNoStartPredecessors() || me.getProjectScheduleBackwards(taskStore),
            startDate           = me.getStartDate(),
            endDate             = me.getEndDate(),
            newEndDate          = null,
            newStartDate        = null;

        me.beginEdit();

        // When scheduleByConstraints is enabled we just change the duration (and unit if provided)
        // and reschedule the task
        if (taskStore && taskStore.scheduleByConstraints) {

            me.set(me.durationField, number);
            me.set(me.durationUnitField, unit);

            // let's recalculate end/start dates
            if (startDate) {
                me.set(me.endDateField, me.recalculateEndDate(startDate));
            } else if (endDate) {
                me.set(me.startDateField, me.recalculateStartDate(endDate));
            }

            // for auto-scheduled task we need rescheduling since above end/start could be not enough
            // so we mark the task for rescheduling during the next (or ongoing) propagation
            if (!isManuallyScheduled) {
                me.markForRescheduling();
            }

            // TODO: We've just changed the duration which could affect Early/Late dates (including this task ones in case project start/end got changed)
            taskStore.resetEarlyDates();
            taskStore.resetLateDates();

            me.constrainSegments({ duration : number, unit : unit });

        // BW compatibility mode
        } else {

            // Provide project start date (if any) or now as start date if it isn't already set
            if (Ext.isNumber(number) && !startDate) {
                if (endDate) {
                    // If task has end date but no start date and we're setting the duration, modify start date (handled below)
                    updateStartDate = true;

                } else {
                    // TODO: this is wrong since does not take into account incoming dependencies (not speaking of constraints)
                    newStartDate        = (taskStore && taskStore.getProjectStartDate()) || Ext.Date.clearTime(new Date());
                    me.set(me.startDateField, newStartDate);
                }
            }

            me.constrainSegments({ duration : number, unit : unit });

            if (Ext.isNumber(number)) {
                if (updateStartDate && me.getEndDate()) {
                    newStartDate = me.calculateStartDate(me.getEndDate(), number, unit);

                } else if (me.getStartDate()) {
                    newEndDate = me.calculateEndDate(me.getStartDate(), number, unit);
                }
            }

            // Don't clear the end date if task isn't properly scheduled
            if (!updateStartDate && (newEndDate || me.getStartDate())) {
                me.set(me.endDateField, newEndDate);
            }

            if (updateStartDate && (newStartDate || me.getEndDate())) {
                me.set(me.startDateField, newStartDate);
            }

            me.set(me.durationField, number);
            me.set(me.durationUnitField, unit);

            // if task is switched to/from milestone then we also need
            // to check if start/end dates are adjusted to the calendar
            if (me.isMilestone() != wasMilestone) {
                // if it's not a milestone now
                if (wasMilestone) {
                    // check if start date is adjusted to calendar
                    startDate = me.getStartDate();
                    if (startDate) {
                        var properStartDate = me.skipNonWorkingTime(startDate, true);
                        if (properStartDate - startDate !== 0) {
                            // set start date adjusted to the calendar
                            me.set(me.startDateField, properStartDate);
                        }
                    }
                // if it's a milestone
                } else if (newEndDate) {
                    // skip non-working time backward
                    var properEndDate   = me.skipNonWorkingTime(newEndDate, false);
                    if (properEndDate - newEndDate !== 0) {
                        // set start/end dates adjusted to the calendar
                        me.set(me.startDateField, properEndDate);
                        me.set(me.endDateField, properEndDate);
                    }
                }
            }
        }

        me.onPotentialEffortChange();

        me.endEdit();

        return true;
    },

    /**
     * @private
     * Defines whether resource calendars should be taken into account for the provided scheduling mode or not.
     * @param  {String} schedulingMode A supported scheduling mode (one of allowed {@link #SchedulingMode} field values)
     * @return {Boolean} Return `false` to prevent using resource calendars when dealing with the provided scheduling mode.
     */
    shouldUseResourceCalendarsForSchedulingMode : function (schedulingMode) {
        return !this.ignoreResourceCalendarsForSchedulingMode || !this.ignoreResourceCalendarsForSchedulingMode[schedulingMode];
    },


    calculateStartDate : function (endDate, duration, unit, options) {
        unit = unit || this.getDurationUnit();

        if (!duration || !endDate) return endDate;

        var me             = this,
            schedulingMode = me.getSchedulingMode(),
            useResources   = me.shouldUseResourceCalendarsForSchedulingMode(schedulingMode) && me.hasResources(),
            durationInMS   = me.getUnitConverter().convertDurationToMs(duration, unit),
            isSegmented    = me.isSegmented(),
            result;

        // We use forEachAvailabilityInterval iterator when we need to take into account extra factors, namely:
        // - Task segments
        // - Resources calendars
        if (me.getTaskStore(true) && (me.isSegmented() || useResources)) {
            var leftDuration = durationInMS;

            options         = Ext.apply({
                endDate        : endDate,
                isForward      : false,
                offsetSegments : isSegmented,
                resources      : useResources
            }, options);

            me.forEachAvailabilityInterval(options, function (from, till) {
                var intervalDuration    = till - from;

                if (intervalDuration >= leftDuration) {

                    result           = new Date(till - leftDuration);

                    return false;

                } else {
                    var dstDiff     = new Date(till).getTimezoneOffset() - new Date(from).getTimezoneOffset();
                    leftDuration    -= intervalDuration + dstDiff * 60 * 1000;
                }
            });

        } else {
            // otherwise just consult the task calendar
            result = me.getCalendar().calculateStartDate(endDate, durationInMS, 'MILLI');
        }

        return result;
    },


    // Recalculates a task end date based on a new start date (use task start date if omitted)
    recalculateEndDate : function (startDate) {
        var me = this,
            result,
            duration;

        startDate = startDate || me.getStartDate();

        if (startDate && me.isEffortDriven()) {
            result = me.calculateEffortDrivenEndDate(startDate, me.getEffort());
        }
        else {
            duration = me.getDuration();

            if (startDate && Ext.isNumber(duration)) {
                result = me.calculateEndDate(startDate, duration, me.getDurationUnit());
            }
            else {
                result = me.getEndDate();
            }
        }

        return result;
    },

    recalculateStartDate : function (endDate) {
        var me = this,
            result,
            duration;

        endDate = endDate || me.getStartDate();

        if (endDate && me.isEffortDriven()) {
            result = me.calculateEffortDrivenStartDate(endDate, me.getEffort());
        }
        else {
            duration = me.getDuration();

            if (endDate && Ext.isNumber(duration)) {
                result = me.calculateStartDate(endDate, duration, me.getDurationUnit());
            }
            else {
                result = me.getStartDate();
            }
        }

        return result;
    },

    calculateEndDate : function (startDate, duration, unit, options) {
        unit = unit || this.getDurationUnit();

        if (!duration || !startDate) return startDate;

        var me             = this,
            schedulingMode = me.getSchedulingMode(),
            useResources   = me.shouldUseResourceCalendarsForSchedulingMode(schedulingMode) && me.hasResources(),
            durationInMS   = me.getUnitConverter().convertDurationToMs(duration, unit),
            isSegmented    = me.isSegmented(),
            result;

        // We use forEachAvailabilityInterval iterator when we need to take into account extra factors, namely:
        // - Task segments
        // - Resource calendars
        if (me.getTaskStore(true) && (isSegmented || useResources)) {
            var leftDuration = durationInMS;

            options = Ext.apply({
                startDate      : startDate,
                offsetSegments : isSegmented,
                resources      : useResources
            }, options);

            me.forEachAvailabilityInterval(options, function (from, till) {
                var intervalDuration    = till - from;

                if (intervalDuration >= leftDuration) {

                    result             = new Date(from + leftDuration);

                    return false;

                } else {
                    var dstDiff     = new Date(from).getTimezoneOffset() - new Date(till).getTimezoneOffset();
                    leftDuration    -= intervalDuration + dstDiff * 60 * 1000;
                }
            });

        } else {
            // otherwise just consult the task calendar
            result = me.getCalendar().calculateEndDate(startDate, durationInMS, 'MILLI');
        }

        return result;
    },


    calculateDuration : function (startDate, endDate, unit, options) {
        unit = unit || this.getDurationUnit();

        if (!startDate || !endDate) {
            return 0;
        }

        var me             = this,
            schedulingMode = me.getSchedulingMode(),
            useResources   = me.shouldUseResourceCalendarsForSchedulingMode(schedulingMode) && me.hasResources(),
            durationInMS   = 0;

        // We use forEachAvailabilityInterval iterator when we need to take into account extra factors, namely:
        // - Task segments
        // - Resource calendars
        if (me.getTaskStore(true) && (me.isSegmented() || useResources)) {

            me.forEachAvailabilityInterval(
                Ext.apply({
                    startDate   : startDate,
                    endDate     : endDate,
                    resources   : useResources
                }, options),
                function (from, till) {
                    var dstDiff     = new Date(from).getTimezoneOffset() - new Date(till).getTimezoneOffset();
                    durationInMS    += till - from + dstDiff * 60 * 1000;
                }
            );

        } else {
            // otherwise just consult the task calendar
            durationInMS = me.getCalendar().calculateDuration(startDate, endDate, 'MILLI');
        }

        return me.getUnitConverter().convertMSDurationToUnit(durationInMS, unit);
    },


    isCalendarApplicable : function (calendarId) {
        var startDate   = this.getStartDate();

        if (!startDate) return true;

        var taskStore   = this.getTaskStore(true);
        if (!taskStore) return true;

        var endDate     = Sch.util.Date.add(startDate, Sch.util.Date.DAY, (taskStore && taskStore.availabilitySearchLimit) || 5*365);

        var assignments         = this.getAssignments();
        var resourcesCalendars  = [];

        Ext.Array.each(assignments, function (assignment) {
            var resource    = assignment.getResource();

            if (resource) {
                resourcesCalendars.push(resource.getCalendar());
            }
        });

        if (!resourcesCalendars.length) return true;

        var calendar = Gnt.data.Calendar.getCalendar(calendarId);

        for (var i = 0, l = resourcesCalendars.length; i < l; i++) {
            if (calendar.isAvailabilityIntersected(resourcesCalendars[i], startDate, endDate)) return true;
        }

        return false;
    },


    forEachAvailabilityInterval : function (options, func, scope) {
        func                        = func || options.fn;
        scope                       = scope || options.scope || this;

        var me                      = this,
            startDate               = options.startDate,
            endDate                 = options.endDate,
            includeEmptyIntervals   = options.includeEmptyIntervals,
            needResources           = options.resources,
            useSegments             = (options.segments !== false) && me.isSegmented(),
            offsetSegments          = options.offsetSegments,
            // isForward enabled by default
            isForward               = options.isForward !== false,
            DATE                    = Sch.util.Date,
            cursorDate, pointTimesSortFn, pointsSortFn;

        // need taskStore to get default `availabilitySearchLimit` value
        var store                   = me.getTaskStore(true);

        var i, k, l, interval, intervalStart, intervalEnd;

        if (isForward) {
            if (!startDate) throw new Error("forEachAvailabilityInterval: `startDate` is required when `isForward` is true");

            // if no boundary we still have to specify some limit
            if (!endDate) endDate = DATE.add(Ext.isNumber(startDate) ? new Date(startDate) : startDate, Sch.util.Date.DAY, options.availabilitySearchLimit || (store && store.availabilitySearchLimit) || 5*365);

            cursorDate       = new Date(startDate);

            pointTimesSortFn = function (a, b) { return a - b; };
            pointsSortFn     = function (a, b) { return a.type < b.type ? 1 : -1; };

        } else {
            if (!endDate) throw new Error("forEachAvailabilityInterval: `endDate` is required when `isForward` is false");

            // if no boundary we still have to specify some limit
            if (!startDate) startDate = DATE.add(Ext.isNumber(endDate) ? new Date(endDate) : endDate, Sch.util.Date.DAY, - (options.availabilitySearchLimit || (store && store.availabilitySearchLimit) || 5*365));

            cursorDate       = new Date(endDate);

            pointTimesSortFn = function (a, b) { return b - a; };
            pointsSortFn     = function (a, b) { return a.type > b.type ? 1 : -1; };
        }

        var taskCalendar                = me.getOwnCalendar(),
            projectCalendar             = me.getProjectCalendar(true) || taskCalendar,
            resourceByCalendar          = {},
            calendars                   = [];

        // if we take resources into account
        if (needResources) {

            var resourceFound   = false;
            // we can provide list of assignments as well
            var assignments     = options.assignments;

            // helper function to prepare resources data
            var handleResource  = function (resource) {
                var resourceId  = resource.getId(),
                    assignment  = assignments && Ext.Array.findBy(assignments, function (a) {
                        return a.getResourceId() == resourceId;
                    }) || me.getAssignmentFor(resource),
                    calendar    = resource.getCalendar(),
                    id          = calendar.getCalendarId();

                if (!resourceByCalendar[id]) {
                    resourceByCalendar[id]  = [];

                    calendars.push(calendar);
                }

                resourceByCalendar[id].push({
                    assignment      : assignment,
                    resourceId      : resourceId,
                    units           : assignment && assignment.getUnits()
                });

                resourceFound   = true;
            };

            // user has provided the resources to use for iteration
            if (needResources !== true) {

                Ext.each(needResources, handleResource);

            // otherwise retrieve all assigned resources
            } else {
                Ext.Array.each(me.getAssignments(), function (assignment) {
                    var resource    = assignment.getResource();

                    if (resource) handleResource(resource);
                });
            }

            // if there are no resources - then iterator should not be called by contract, just return
            if (!resourceFound) return;

        // if we don't use resource calendars for calculation then we use the task/project calendar
        } else {
            taskCalendar    = taskCalendar || projectCalendar;
        }

        var workingTimeDuration = 0,
            inSegment           = true,
            splitStartDates,
            splitEndDates,
            splitStartDate,
            splitEndDate,
            splitStart,
            splitEnd;

        // We need to take segments into account
        // Let's walk over the segments and "invert" them.
        // We need to operate non working intervals (splits) instead of StartDate-EndDate pairs.
        if (useSegments) {
            var fillSplitDates;

            splitStartDates = [];
            splitEndDates   = [];

            // If this mode enabled we shift segments to match the first (last - depending isForward flag) availability interval found.
            // This is used when calculating the task start/end date.
            // We cannot operate segments dates since they are not updated yet ..we have to convert offsets to dates
            if (offsetSegments) {
                if (isForward) {
                    splitEnd = cursorDate;

                    fillSplitDates = function (segment) {
                        var neigbourSegment = segment.getNextSegment();

                        if (neigbourSegment) {
                            splitStart = segment.skipWorkingTime(splitEnd, segment.getEndOffset() - segment.getStartOffset(), isForward) - 0;
                            splitEnd   = segment.skipWorkingTime(splitStart, neigbourSegment.getStartOffset() - segment.getEndOffset(), isForward) - 0;
                        }

                        return neigbourSegment;
                    };

                } else {
                    splitStart = cursorDate;

                    fillSplitDates = function (segment) {
                        var neigbourSegment = segment.getPrevSegment();

                        if (neigbourSegment) {
                            splitEnd   = segment.skipWorkingTime(splitStart, segment.getEndOffset() - segment.getStartOffset(), isForward) - 0;
                            splitStart = segment.skipWorkingTime(splitEnd, segment.getStartOffset() - neigbourSegment.getEndOffset(), isForward) - 0;
                        }

                        return neigbourSegment;
                    };
                }
            // use segment dates as-is
            } else {
                if (isForward) {
                    fillSplitDates = function (segment) {
                        var neigbourSegment = segment.getNextSegment();

                        if (neigbourSegment) {
                            splitStart = segment.getEndDate() - 0;
                            splitEnd   = neigbourSegment.getStartDate() - 0;
                        }

                        return neigbourSegment;
                    };
                } else {
                    fillSplitDates = function (segment) {
                        var neigbourSegment = segment.getPrevSegment();

                        if (neigbourSegment) {
                            splitStart = segment.getEndDate() - 0;
                            splitEnd   = neigbourSegment.getStartDate() - 0;
                        }

                        return neigbourSegment;
                    };
                }
            }


            me.forEachSegment(function collectSplits (segment) {

                if (fillSplitDates(segment)) {
                    // set initial "inSegment" value (depending on "isForward" mode)
                    if (splitStart < startDate) {
                        inSegment = !isForward;

                    // we use the split only if it intersects w/ the requested timespan
                    } else if (splitStart <= endDate) {
                        splitStartDates.push(splitStart);
                    }

                    // set initial "inSegment" value (depending on "isForward" mode)
                    if (splitEnd < startDate) {
                        inSegment = isForward;

                    // we use the split only if it intersects w/ the requested timespan
                    } else if (splitEnd <= endDate) {
                        splitEndDates.push(splitEnd);
                    }
                }

            }, isForward);

            splitStartDate = splitStartDates.shift();
            splitEndDate   = splitEndDates.shift();
        }


        while (isForward ? cursorDate < endDate : cursorDate > startDate) {
            var pointsByTime        = {};
            var pointTimes          = [];
            var cursorDT            = cursorDate - (isForward ? 0 : 1);

            // if a task has a custom calendar
            if (taskCalendar) {
                var taskIntervals       = taskCalendar.getAvailabilityIntervalsFor(cursorDT);

                // the order of intervals processing doesn't matter here, since we are just collecting the "points of interest"
                for (k = 0, l = taskIntervals.length; k < l; k++) {
                    interval            = taskIntervals[ k ];
                    intervalStart       = interval.startDate - 0;
                    intervalEnd         = interval.endDate - 0;

                    if (!pointsByTime[ intervalStart ]) {
                        pointsByTime[ intervalStart ] = [];

                        pointTimes.push(intervalStart);
                    }
                    pointsByTime[ intervalStart ].push({ type : '00-taskAvailailabilityStart' });

                    pointTimes.push(intervalEnd);

                    pointsByTime[ intervalEnd ] = pointsByTime[ intervalEnd ] || [];
                    pointsByTime[ intervalEnd ].push({ type : '01-taskAvailailabilityEnd' });
                }
            }

            // If we take the task segmentation into account
            if (useSegments && (splitStartDate || splitEndDate)) {
                var nextCursorDT = isForward ? DATE.getStartOfNextDay(cursorDate) - 0 : DATE.getEndOfPreviousDay(cursorDate) - 1;

                // if split start is inside of this interval
                while (splitStartDate && (isForward ? splitStartDate < nextCursorDT : splitStartDate > nextCursorDT)) {
                    if (!pointsByTime[ splitStartDate ]) {
                        pointsByTime[ splitStartDate ] = [];
                        pointTimes.push(splitStartDate);
                    }

                    pointsByTime[ splitStartDate ].push({ type : '05-taskSegmentEnd' });

                    splitStartDate = splitStartDates.shift();
                }

                // if split end is inside of this interval
                while (splitEndDate &&  (isForward ? splitEndDate < nextCursorDT : splitEndDate > nextCursorDT)) {
                    if (!pointsByTime[ splitEndDate ]) {
                        pointsByTime[ splitEndDate ] = [];
                        pointTimes.push(splitEndDate);
                    }

                    pointsByTime[ splitEndDate ].push({ type : '04-taskSegmentStart' });

                    splitEndDate = splitEndDates.shift();
                }
            }

            var resourceList;

            // loop over resources having custom calendars
            for (i = 0, l = calendars.length; i < l; i++) {
                var cal                 = calendars[ i ],
                    resourceIntervals   = cal.getAvailabilityIntervalsFor(cursorDT);

                resourceList        = resourceByCalendar[ cal.getCalendarId() ];

                // using "for" instead of "each" should be blazing fast! :)
                // the order of intervals processing doesn't matter here, since we are just collecting the "points of interest"
                for (k = 0; k < resourceIntervals.length; k++) {
                    interval      = resourceIntervals[ k ];
                    intervalStart = interval.startDate - 0;
                    intervalEnd   = interval.endDate - 0;

                    if (!pointsByTime[ intervalStart ]) {
                        pointsByTime[ intervalStart ] = [];

                        pointTimes.push(intervalStart);
                    }
                    pointsByTime[ intervalStart ].push({
                        type      : '02-resourceAvailailabilityStart',
                        resources : resourceList
                    });

                    if (!pointsByTime[ intervalEnd ]) {
                        pointsByTime[ intervalEnd ] = [];

                        pointTimes.push(intervalEnd);
                    }
                    pointsByTime[ intervalEnd ].push({
                        type      : '03-resourceAvailailabilityEnd',
                        resources : resourceList
                    });
                }
            }

            pointTimes.sort(pointTimesSortFn);

            var inTaskCalendar   = false,
                currentResources = {},
                resourceCounter  = 0,
                isWorkingTime    = false,
                newPointTimes    = null,
                points, point, m, n;

            var inc = 1;

            if (isForward) {
                for (i = 0; i < pointTimes.length; i+=inc) {
                    inc = 1;
                    intervalStart       = pointTimes[i];
                    intervalEnd         = pointTimes[ i + 1 ];

                    points = pointsByTime[intervalStart];

                    points.sort(pointsSortFn);

                    for (k = 0; k < points.length; k++) {
                        point           = points[ k ];

                        switch (point.type) {
                            case '00-taskAvailailabilityStart' : inTaskCalendar  = true; break;

                            case '01-taskAvailailabilityEnd' : inTaskCalendar  = false; break;

                            case '02-resourceAvailailabilityStart' :
                                resourceList    = point.resources;
                                for (m = 0, n = resourceList.length; m < n; m++) {
                                    currentResources[resourceList[m].resourceId]    = resourceList[m];
                                    resourceCounter++;
                                }
                                break;

                            case '03-resourceAvailailabilityEnd' :
                                resourceList    = point.resources;
                                for (m = 0, n = resourceList.length; m < n; m++) {
                                    delete currentResources[resourceList[m].resourceId];
                                    resourceCounter--;
                                }
                                break;

                            case '04-taskSegmentStart' : inSegment = true; break;

                            case '05-taskSegmentEnd' : inSegment = false; break;
                        }
                    }


                    // availability interval is out of [ startDate, endDate )
                    if (intervalStart >= endDate || intervalEnd <= startDate) continue;

                    isWorkingTime = (inTaskCalendar || !taskCalendar) && (!needResources || resourceCounter);

                    if (inc && intervalStart && intervalEnd && ((isWorkingTime && inSegment) || includeEmptyIntervals)) {
                        if (intervalStart < startDate) intervalStart = startDate - 0;
                        if (intervalEnd > endDate) intervalEnd = endDate - 0;

                        if (func.call(scope, intervalStart, intervalEnd, currentResources) === false) return false;
                    }
                }

            } else {
                for (i = 0; i < pointTimes.length; i+=inc) {
                    inc = 1;
                    intervalStart = pointTimes[ i + 1 ];
                    intervalEnd   = pointTimes[ i ];

                    points        = pointsByTime[ intervalEnd ];

                    points.sort(pointsSortFn);

                    for (k = 0; k < points.length; k++) {
                        point           = points[ k ];

                        switch (point.type) {
                            case '01-taskAvailailabilityEnd' : inTaskCalendar  = true; break;

                            case '00-taskAvailailabilityStart' : inTaskCalendar  = false; break;

                            case '03-resourceAvailailabilityEnd' :
                                resourceList    = point.resources;
                                for (m = 0, n = resourceList.length; m < n; m++) {
                                    currentResources[resourceList[m].resourceId]    = resourceList[m];
                                    resourceCounter++;
                                }
                                break;

                            case '02-resourceAvailailabilityStart' :
                                resourceList    = point.resources;
                                for (m = 0, n = resourceList.length; m < n; m++) {
                                    delete currentResources[resourceList[m].resourceId];
                                    resourceCounter--;
                                }
                                break;

                            case '05-taskSegmentEnd' : inSegment = true; break;
                            case '04-taskSegmentStart' : inSegment = false; break;
                        }
                    }

                    // availability interval is out of [ startDate, endDate )
                    if (intervalStart > endDate || intervalEnd <= startDate) continue;

                    isWorkingTime = (inTaskCalendar || !taskCalendar) && (!needResources || resourceCounter);

                    if (inc && intervalStart && intervalEnd && ((isWorkingTime && inSegment) || includeEmptyIntervals)) {

                        if (intervalStart < startDate) intervalStart = startDate - 0;
                        if (intervalEnd > endDate) intervalEnd = endDate - 0;

                        if (func.call(scope, intervalStart, intervalEnd, currentResources) === false) return false;
                    }
                }
            }
            // eof backward branch

            // does not perform cloning internally!
            cursorDate       = isForward ? DATE.getStartOfNextDay(cursorDate) : DATE.getEndOfPreviousDay(cursorDate);
        }
        // eof while
    },

    // iterates over the common availability intervals for tasks and resources in between `startDate/endDate`
    // note, that function will receive start/end dates as number, not dates (for optimization purposes)
    // this method is not "normalized" intentionally because of performance considerations
    forEachAvailabilityIntervalWithResources : function (options, func, scope) {
        if (!options.resources) options.resources = true;

        this.forEachAvailabilityInterval.apply(this, arguments);
    },


    calculateEffortDrivenEndDate : function (startDate, effort, unit) {
        if (!effort) return startDate;

        var effortInMS      = this.getUnitConverter().convertDurationToMs(effort, unit || this.getEffortUnit());

        var endDate         = new Date(startDate);

        this.forEachAvailabilityIntervalWithResources({ startDate : startDate }, function (intervalStartDate, intervalEndDate, currentResources) {
            var totalUnits          = 0;

            for (var i in currentResources) totalUnits += currentResources[ i ].units;

            var intervalDuration    = intervalEndDate - intervalStartDate;
            var availableEffort     = totalUnits * intervalDuration / 100;

            if (availableEffort >= effortInMS) {

                endDate = new Date(intervalStartDate + effortInMS / availableEffort * intervalDuration);

                return false;

            } else {
                effortInMS -= availableEffort;
            }
        });

        return endDate;
    },


    calculateEffortDrivenStartDate : function (endDate, effort, unit) {
        if (!effort) return endDate;

        var effortInMS = this.getUnitConverter().convertDurationToMs(effort, unit || this.getEffortUnit());

        var result     = new Date(endDate);

        this.forEachAvailabilityIntervalWithResources({ endDate : endDate, isForward : false }, function (intervalStartDate, intervalEndDate, currentResources) {
            var totalUnits          = 0;

            for (var i in currentResources) totalUnits += currentResources[ i ].units;

            var intervalDuration    = intervalEndDate - intervalStartDate;
            var availableEffort     = totalUnits * intervalDuration / 100;

            if (availableEffort >= effortInMS) {

                result = new Date(intervalEndDate - effortInMS / availableEffort * intervalDuration);

                return false;

            } else {
                effortInMS -= availableEffort;
            }
        });

        return result;
    },


    // this method has a contract that all child parents should already have refreshed data, so it should be called
    // in the "bubbling" order - starting from deeper nodes to closer to root
    refreshCalculatedParentNodeData : function () {
        // Wrap with beginEdit/endEdit since otherwise this will cause an infinite loop
        // since endEdit calls taskStore.onEndUpdate() which in turn starts parents recalculation
        this.beginEdit();

        var childNodes                              = this.childNodes;
        var autoCalculatePercentDoneForParentTask   = this.autoCalculatePercentDoneForParentTask;
        var autoCalculateEffortForParentTask        = this.autoCalculateEffortForParentTask;
        var autoCalculateCostForParentTask          = this.autoCalculateCostForParentTask;

        var length                      = childNodes.length;
        var changedFields               = {};

        if (length > 0 && (autoCalculateEffortForParentTask || autoCalculatePercentDoneForParentTask || autoCalculateCostForParentTask)) {
            var totalEffortInMS                  = 0;
            var totalDurationInMS                = 0;
            var completedDurationInMS            = 0;
            var cost                             = 0;
            var actualCost                       = 0;
            var allTasksAreMilestonesAndFinished = true;
            var hasUnfinishedMilestone           = false;

            for (var k = 0; k < length; k++) {
                var childNode           = childNodes[ k ];

                // We could end up here as a result of taskStore#removeAll which means some of the child nodes could already
                // be removed
                if (childNode.parentNode) {
                    var isLeaf              = childNode.isLeaf();

                    if (autoCalculateEffortForParentTask) totalEffortInMS += childNode.getEffort('MILLI');

                    if (autoCalculateCostForParentTask) {
                        cost += childNode.getCost();
                        actualCost += childNode.getActualCost();
                    }

                    if (autoCalculatePercentDoneForParentTask) {
                        var durationInMS        = isLeaf ? childNode.getDuration('MILLI') || 0 : childNode.childTasksDuration,
                            childPercentDone    = childNode.getPercentDone() || 0;

                        totalDurationInMS       += durationInMS;
                        completedDurationInMS   += isLeaf ? durationInMS * childPercentDone : childNode.completedChildTasksDuration;

                        hasUnfinishedMilestone  = hasUnfinishedMilestone || childNode.hasUnfinishedMilestone || (durationInMS === 0 && childPercentDone < 100);
                        allTasksAreMilestonesAndFinished = allTasksAreMilestonesAndFinished && durationInMS === 0 && childPercentDone >= 100;
                    }
                }
            }

            if (autoCalculateEffortForParentTask && this.getEffort('MILLI') != totalEffortInMS) {
                changedFields.Effort        = true;
                this.setEffortWithoutPropagation(this.getUnitConverter().convertMSDurationToUnit(totalEffortInMS, this.getEffortUnit()));
            }

            if (autoCalculatePercentDoneForParentTask) {
                var newPercentDone          = 0;

                this.childTasksDuration             = totalDurationInMS;
                this.completedChildTasksDuration    = completedDurationInMS;
                this.hasUnfinishedMilestone         = hasUnfinishedMilestone;

                if (totalDurationInMS > 0) {
                    newPercentDone = completedDurationInMS / totalDurationInMS;

                    // Indicate there are unfinished tasks
                    if (newPercentDone === 100 && hasUnfinishedMilestone) {
                        newPercentDone = 99;
                    }
                }
                else if (allTasksAreMilestonesAndFinished){
                    // For parent tasks containing only milestones, if there is at least one task with < 100% done, the parent task should report itself as 0% done
                    // If all children are 100%, parent reports 100% done too
                    newPercentDone = 100;
                }

                if (this.getPercentDone() != newPercentDone) {
                    changedFields.PercentDone       = true;
                    this.setPercentDoneWithoutPropagation(newPercentDone);
                }
            }

            if (autoCalculateCostForParentTask) {
                this.setActualCost(actualCost);
                this.setCost(cost);
            }

        }


        var startChanged, endChanged;

        if (!this.isRoot() && length > 0 && !this.isManuallyScheduled() && !this.isReadOnly()) {

            var minDate   = new Date(-8640000000000000),
                maxDate   = new Date(+8640000000000000),
                earliest  = new Date(+8640000000000000), //new Date(maxDate)
                latest    = new Date(-8640000000000000), //new Date(minDate) - this works incorrect in FF
                isProject = this.isProject,
                scheduleBackwards = isProject && this.getScheduleBackwards();

            // If it's a project
            if (isProject) {
                if (scheduleBackwards) {
                    latest = this.getEndDate();
                } else {
                    earliest = this.getStartDate();
                }
            }

            for (var i = 0; i < length; i++) {
                var r       = childNodes[i];

                // If it's a project node
                if (isProject) {
                    // we calculate either its finish or start
                    if (scheduleBackwards) {
                        earliest = Sch.util.Date.min(earliest, r.getStartDate() || earliest);
                    } else {
                        latest   = Sch.util.Date.max(latest, r.getEndDate() || latest);
                    }
                } else {
                    earliest = Sch.util.Date.min(earliest, r.getStartDate() || earliest);
                    latest   = Sch.util.Date.max(latest, r.getEndDate() || latest);
                }

            }

            // This could happen if a parent task has two children, one having just start date and another having just an end date
            if (latest < earliest && earliest < maxDate && latest > minDate) {
                var tmp;

                tmp         = latest;
                latest      = earliest;
                earliest    = tmp;
            }

            startChanged    = changedFields.StartDate = earliest - maxDate !== 0 && this.getStartDate() - earliest !== 0;
            endChanged      = changedFields.EndDate = latest - minDate !== 0 && this.getEndDate() - latest !== 0;

            // special case to only trigger 1 update event and avoid extra "recalculateParents" calls
            // wrapping with `beginEdit / endEdit` is not an option, because they do not nest (one "endEdit" will "finalize" all previous "beginEdit")
            if (startChanged && endChanged) {
                this.setStartEndDateWithoutPropagation(earliest, latest, false);
            } else if (startChanged) {
                this.setStartDateWithoutPropagation(earliest, false, false);
            } else if (endChanged) {
                this.setEndDateWithoutPropagation(latest, false, false);
            }
        }

        this.endEdit();

        return changedFields;
    },


    // This function is mostly used for backward compatibility as it does not trigger the changes propagation
    recalculateParents: function () {
        var parent = this.parentNode;

        parent && (
            parent.refreshCalculatedParentNodeData(),
            !this.getTaskStore().cascading && parent.recalculateParents()
        );
    },


    /**
     * Returns true if this task is a milestone (has the same start and end dates).
     *
     * @param {Boolean} [isBaseline] Whether to check for baseline dates instead of "normal" dates. If this argument is provided with
     * "true" value, this method returns the result from the {@link #isBaselineMilestone} method.
     *
     * @return {Boolean}
     */
    isMilestone : function (isBaseline) {

        if (isBaseline) return this.isBaselineMilestone();

        // a summary task may have zero duration when "recalculateParents" is on
        // and a child task has working time on the summary task non-working time
        // so we operate start and end date pair here
        if (!this.get('leaf')) {

            var startDate = this.getStartDate(),
                endDate   = this.getEndDate();

            if (startDate && endDate) {
                return endDate - startDate === 0;
            }

        }

        return this.getDuration() === 0;
    },

    /**
     * @propagating
     * @inheritdoc #convertToMilestoneWithoutPropagation
     * @param {Function} [callback] Callback function to call after task has been converted and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    convertToMilestone : function(callback) {
        var me = this;

        me.propagateChanges(
            function() {
                return me.convertToMilestoneWithoutPropagation();
            },
            callback
        );
    },

    /**
     * Converts this task to a milestone (start date will match the end date).
     */
    convertToMilestoneWithoutPropagation : function() {
        var me = this,
            propagate = false;

        if (!me.isMilestone()) {
            propagate = me.setStartDateWithoutPropagation(me.getEndDate(), false);

            var taskStore             = me.getTaskStore(true),
                scheduleByConstraints = taskStore && taskStore.scheduleByConstraints;

            if (scheduleByConstraints) {
                me.markForRescheduling();
            }
        }

        return propagate;
    },

    /**
     * @propagating
     * @inheritdoc #convertToRegularWithoutPropagation
     * @param {Function} [callback] Callback function to call after task has been converted and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    convertToRegular : function(callback) {
        var me = this;

        me.propagateChanges(
            function() {
                return me.convertToRegularWithoutPropagation();
            },
            callback
        );
    },

    /**
     * Converts a milestone task to a regular task with a duration of 1 [durationUnit].
     */
    convertToRegularWithoutPropagation : function() {
        var me = this,
            propagate = false,
            unit,
            newStart;

        if (me.isMilestone()) {
            unit = me.get(me.durationUnitField);

            var taskStore             = me.getTaskStore(true),
                scheduleByConstraints = taskStore && taskStore.scheduleByConstraints;

            if (!scheduleByConstraints) {
                newStart = me.calculateStartDate(me.getStartDate(), 1, unit);
            }

            propagate = me.setDurationWithoutPropagation(1, unit);

            if (!scheduleByConstraints) {
                // we set the `moveParentAsGroup` flag to false, because in this case we don't want/need to
                // change any of child tasks
                propagate = propagate && me.setStartDateWithoutPropagation(newStart, true, false, false);
            }
        }

        return propagate;
    },

    /**
     * Returns true if this task is a "baseline" milestone (has the same start and end baseline dates) or false if it's not or the dates are wrong.
     *
     * @return {Boolean}
     */
    isBaselineMilestone: function() {
        var baseStart = this.getBaselineStartDate(),
            baseEnd   = this.getBaselineEndDate();

        if (baseStart && baseEnd){
            return baseEnd - baseStart === 0;
        }

        return false;
    },


    // Sets the task "leaf" attribute to `false` and resets `Segments` field
    // since a parent task cannot be split
    markAsParent : function() {
        var me = this;

        me.isSegmented() && me.setSegmentsWithoutPropagation(null); // Parent task should never be split
        me.set('leaf', false);
    },


    /**
     * Returns the duration unit of the task.
     * @return {String} the duration unit
     */
    getDurationUnit: function () {
        return this.get(this.durationUnitField) || Sch.util.Date.DAY;
    },

    /**
     * @method setDurationUnit
     *
     * Updates the duration unit of the task.
     *
     * @param {String} unit New duration unit
     * @return {String} the duration unit
     */


    /**
     * Returns the effort unit of the task.
     * @return {String} the effort unit
     */
    getEffortUnit: function () {
        return this.get(this.effortUnitField) || Sch.util.Date.HOUR;
    },

    /**
     * @method setEffortUnit
     *
     * Updates the effort unit of the task.
     *
     * @param {String} unit New effort unit
     * @return {String} the effort unit
     */

    /**
     * @method setDeadlineDate
     *
     * Sets the deadline date for this task
     *
     * @param {Date} date
     */

    /**
     * @method getDeadlineDate
     *
     * Returns the task deadline date
     *
     * @return {Date} date
     */

    /**
     * @method setRollup
     *
     * Controls if this task should roll up to its parent
     *
     * @param {Boolean} rollup
     */

    /**
     * @method getRollup
     *
     * Gets the rollup value for this task
     *
     * @return {Boolean} value
     */

    /**
     * Sets the percent complete value of the task
     *
     * @propagating This method might launch the changes propagation process over the dependent tasks in case
     * the task has percent complete set to 100% and the new value is less.
     * In this case the task stops being manually scheduled and thus requires rescheduling.
     *
     * @param {Number} value The new value
     * @param {Function} [callback] Callback function to call after the percent value has been set and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setPercentDone : function (percentDone, callback) {

        var me = this;

        if (me.rescheduleOnPercentDoneChange(percentDone)) {
            me.propagateChanges(
                function () {
                    return me.setPercentDoneWithoutPropagation(percentDone);
                },
                callback
            );

        } else {
            me.setPercentDoneWithoutPropagation(percentDone);

            var affectedTasks = {};
            affectedTasks[me.getId()] = me;
            callback && callback(true, affectedTasks);
        }
    },

    /**
     * Sets the percent complete value of the task
     * @param {Number} value The new value
     */
    setPercentDoneWithoutPropagation : function (percentDone) {
        var me = this;

        if (percentDone != me.getPercentDone()) {
            me.beginEdit();

            if (me.rescheduleOnPercentDoneChange(percentDone)) {
                me.markForRescheduling();
            }

            me.set(me.percentDoneField, percentDone);
            me.set(me.actualEffortField, me.calculateActualEffort());

            me.recalculateCost();

            me.endEdit();
        }

        return true;
    },

    // We need to reschedule the task (and all the related tasks too)
    // if the task will stop being manually scheduled because of the precent change
    rescheduleOnPercentDoneChange : function (percentDone) {
        return !this.getManuallyScheduled() && this.isCompleted() && percentDone < 100;
    },

    /**
     * @method getPercentDone
     *
     * Gets the percent complete value of the task
     * @return {Number} The percent complete value of the task
     */

    /**
     * @method getCls
     *
     * Returns the CSS class for the task element
     *
     * @return {String} CSS class for the task element
     */

    /**
     * @method getBaselineStartDate
     *
     * Returns the baseline start date of this task
     *
     * @return {Date} The baseline start date
     */

    /**
     * @method setBaselineStartDate
     *
     * Sets the baseline start date of this task
     *
     * @param {Date} date
     */

    /**
     * @method getBaselineEndDate
     *
     * Returns the baseline end date of this task
     *
     * @return {Date} The baseline end date
     */

    /**
     * @method setBaselineEndDate
     *
     * Sets the baseline end date of this task
     *
     * @param {Date} date
     */

    /**
     * @method setBaselinePercentDone
     *
     * Sets the baseline percent complete value
     *
     * @param {Number} value The new value
     */

    /**
     * Gets the baseline percent complete value
     * @return {Number} The percent done level of the task
     */
    getBaselinePercentDone : function() {
        return this.get(this.baselinePercentDoneField) || 0;
    },

    /**
     * Returns true if the Task can be persisted (e.g. task and resource are not 'phantoms')
     *
     * @return {Boolean} true if this model can be persisted to server.
     */
    isPersistable : function() {
        var parent = this.parentNode;
        return !parent || !parent.phantom || parent.isRoot();
    },

    /**
     * Returns an array of Gnt.model.Resource instances assigned to this Task.
     *
     * @return {Gnt.model.Resource[]} resources
     */
    getResources : function () {
        var me = this,
            assignmentStore = me.getAssignmentStore();

        return assignmentStore && assignmentStore.getResourcesForEvent(me) || [];
    },

    /**
     * Returns an array of Gnt.model.Assignment instances associated with this Task.
     *
     * @return {Gnt.model.Assignment[]} resources
     */
    getAssignments : function () {
        var me = this,
            assignmentStore = me.getAssignmentStore();

        return assignmentStore && assignmentStore.getAssignmentsForTask(me) || [];
    },

    /**
     * Returns true if this task has any assignments. **Note**, that this function returns `true` even if all assignment records are invalid
     * (ie pointing to non-existing resource in the resource store).
     *
     * @return {Boolean}
     */
    hasAssignments : function () {
        return this.getAssignments().length > 0;
    },

    /**
     * Returns true if this task has any assignments with valid resources. Returns `true` only if at least one assignment record is valid -
     * pointing to existed resource record in the resource store.
     *
     * @return {Boolean}
     */
    hasResources : function () {
        var assignments = this.getAssignments(),
            result = false,
            i, len;

        for (i = 0, len = assignments.length; !result && i < len; i++) {
            result = !!assignments[i].getResource();
        }

        return result;
    },

    /**
     * If given resource is assigned to this task, returns a Gnt.model.Assignment record.
     * Otherwise returns `null`
     *
     * @param {Gnt.model.Resource/Mixid} resourceOrId The instance of {@link Gnt.model.Resource} or resource id
     *
     * @return {Gnt.model.Assignment|null}
     */
    getAssignmentFor : function(resource) {
        var me = this,
            assignmentStore = me.getAssignmentStore();

        return assignmentStore && assignmentStore.getAssignmentForEventAndResource(me, resource) || null;
    },

    /**
     * @method isAssignedTo
     * Returns true if the task is assigned to a certain resource.
     *
     * @param {Sch.model.Resource} resource The resource to query for
     * @return {Boolean}
     */
    isAssignedTo : function(resource) {
        var me = this,
            assignmentStore = me.getAssignmentStore();

        return assignmentStore && assignmentStore.isTaskAssignedToResource(me, resource) || false;
    },

    /**
     * @propagating
     * Assigns this task to the passed Resource or Resource Id.
     *
     * @param {Gnt.model.Resource/Mixed} resource The instance of a {@link Gnt.model.Resource resource} or its id.
     * @param {Number} units The integer value for the {@link Gnt.model.Assignment#unitsField Units field} of the assignment record.
     * @param {Function} [callback] Callback function to call after resource has been assigned and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    assign : function(resource, units, callback) {
        var me = this,
            compatResult,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.assignWithoutPropagation(resource, units, function cancelAndResultFeedback(fn, result) {
                    cancelFn = fn;
                    compatResult = result;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );

        return compatResult;
    },


    assignWithoutPropagation : function (resource, units, cancelAndResultFeedback, assignmentData) {
        var me              = this,
            cancelActions   = [],
            taskStore       = me.getTaskStore(),
            assignmentStore = taskStore.getAssignmentStore(),
            resourceStore   = taskStore.getResourceStore(),
            assignment,
            resourceId;

        // {{{ Parameter normalization
        units = units || 100;
        assignmentData = assignmentData || {};
        // }}}

        // Preconditions:
        // <debug>
        !me.getAssignmentFor(resource) ||
            Ext.Error.raise("Resource can't be assigned twice to the same task");
        // </debug>

        // If we have a resource model instance but it's not in the resource store then adding it,
        // the resource is probably a phantom record
        if (resource.isResourceModel && resourceStore.indexOf(resource) == -1) {
            resourceId = resource.getId();
            resourceStore.add(resource);
            cancelActions.push(function() {
                resourceStore.remove(resource);
            });
        }
        // If we have a resource model already in the store then just getting it's id
        else if (resource.isResourceModel) {
            resourceId = resource.getId();
        }
        // If we don't have a resource model then we must have a resource id, and if a resource with the given id
        // is present in the store then we can proceed
        else if (resourceStore.indexOfId(resource) >= 0) {
            resourceId = resource;
        }
        // Otherwise we have nothing to assign to the task, raising an error
        else {
            // <debug>
            Ext.Error.raise("Can't assign resource to a task, task's resource store doesn't contain resource id given");
            // </debug>
            // @TODO: #2773 - Rhyno parse error - Syntax error while building the app
            var foo = false;
        }

        assignmentData[assignmentStore.model.prototype.unitsField] = units;

        assignment = assignmentStore.assignTaskToResource(me, resourceId, assignmentData);

        cancelActions.push(function() {
            assignmentStore.unassignTaskFromResource(me, resourceId);
        });

        cancelAndResultFeedback && cancelAndResultFeedback(function() {
            Ext.Array.each(cancelActions, function(action) {
                action();
            });
        }, assignment[0]);

        return [me];
    },

    /**
     * @propagating
     * Un-assign a resource from this task
     *
     * @param {Gnt.model.Resource/Number} resource An instance of the {@link Gnt.model.Resource} class or a resource id
     * @param {Function} [callback] Callback function to call after resource has been unassigned and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    unassign : function () {
        return this.unAssign.apply(this, arguments);
    },


    unAssign : function (resource, callback) {
        var me = this,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.unassignWithoutPropagation(resource, function cancelFeedback(fn) {
                    cancelFn = fn;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },


    unassignWithoutPropagation : function (resource, cancelFeedback) {
        var me               = this,
            resourceId       = resource.isResourceModel ? resource.getId() : resource,
            assignmentStore  = me.getAssignmentStore(),
            assignment       = me.getAssignmentFor(resourceId),
            indexOfAssignment;

        // <debug>
        assignment ||
            Ext.Error.raise("Can't unassign resource `" + resourceId + "` from task `" + me.getId() + "` resource is not assigned to the task!");
        // </debug>

        indexOfAssignment = assignmentStore.indexOf(assignment);
        assignmentStore.unassignTaskFromResource(me, resource);

        cancelFeedback && cancelFeedback(function() {
            assignmentStore.insert(indexOfAssignment, assignment);
        });

        return [me];
    },

    /**
     * @propagating
     * Reassigns a task from old resource to a new one.
     *
     * @param {Gnt.model.Resource/Mixed} oldResource A resource to unassign from
     * @param {Gnt.model.Resource/Mixed} newResource A resource to assign to
     * @param {Function} [callback] Callback function to call after resource has been reassigned and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    reassign : function (oldResource, newResource, callback) {
        var me = this,
            unassignCancelFn,
            assignCancelFn;

        me.propagateChanges(
            function() {
                var units = me.getAssignmentFor(oldResource).getUnits();
                var propagate = false;
                var oldAssignment = me.getAssignmentFor(oldResource);

                propagate = me.unassignWithoutPropagation(oldResource, function unassignCancelFeedback(fn) {
                    unassignCancelFn = fn;
                });

                propagate = propagate && me.assignWithoutPropagation(newResource, units, function assignCancelFeedback(fn) {
                    assignCancelFn = fn;
                }, oldAssignment.data);

                return propagate;
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                if (cancelChanges) {
                    assignCancelFn && assignCancelFn();
                    unassignCancelFn && unassignCancelFn();
                }
                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },

    // TODO: interceptor is needed only for Gnt.view.Dependency, ask Nick if it can be removed
    /**
     * @propagating
     * Links a task to another one given in `toId` with typed dependency given in `type`.
     *
     * @param {Gnt.model.Task|Number} toId
     * @param {Integer/Object} [type=Gnt.model.Dependency.Type.EndToStart] dependency type see {@link Gnt.model.Dependency#Type}.
     *
     * Or accepts a config object for the newly created dependency {@link Gnt.model.Dependency}:
     *
     * ```javascript
     * task.linkTo(sucessorTask, {
     *     Type    : Gnt.model.Dependency.Type.EndToStart,
     *     Lag     : 2,
     *     LagUnit : 'd'
     * })
     * ```
     *
     * @param {Function} [callback] Callback function to call after tasks has been linked and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    linkTo : function(toId, type, callback, /* private */interceptor) {
        var me = this,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.linkToWithoutPropagation(toId, type, function cancelFeedback(fn) {
                    cancelFn = fn;
                }, interceptor);
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },


    linkToWithoutPropagation : function(toId, type, cancelFeedback) {
        var me                = this,
            fromId            = me.getId(),
            taskStore         = me.getTaskStore(),
            dependencyStore   = me.getDependencyStore(),
            model             = dependencyStore.model,
            scheduleBackwards = me.getProjectScheduleBackwards(),
            result            = false,
            newDependency,
            config;

        toId  = toId instanceof Gnt.model.Task ? toId.getId() : toId;

        // {{{ Parameters normalization
        toId   = toId instanceof Gnt.model.Task ? toId.getId() : toId;
        type   = ((type === null || type === undefined) && Gnt.model.Dependency.Type.EndToStart) || type;
        // }}}

        // <debug>
        taskStore.getModelById(toId) !== -1 || Ext.Error.raise("Can't link task `" + fromId + "` to task with id `" + toId + "` the task is not present in the task store!");
        // </debug>

        if (typeof type === 'object') {
            config = type;
        } else {
            config = {};
            config[model.prototype.typeField] = type;
        }

        config[model.prototype.toField] = toId;
        config[model.prototype.fromField] = fromId;

        newDependency = new model(config);

        if (dependencyStore.isValidDependency(newDependency)) {
            dependencyStore.add(newDependency);

            // mark the tasks as requiring rescheduling so the next propagation will adjust them

            var target = newDependency.getTargetTask();

            if (scheduleBackwards) {
                target.isUnscheduled() && target.markForRescheduling();
                me.markForRescheduling();
                result = target;
            } else {
                me.isUnscheduled() && me.markForRescheduling();
                target.markForRescheduling();
                result = me;
            }

        }

        cancelFeedback && cancelFeedback(function() {
            dependencyStore.remove(newDependency);
        });

        return result;
    },


    /**
     * @propagating
     * Unlinks a task from another one given in `fromId`.
     *
     * @param {Gnt.model.Task|Number} fromId
     * @param {Function} [callback] Callback function to call after tasks has been unlinked and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    unlinkFrom : function(fromId, callback) {
        var me = this,
            cancelFn;

        me.propagateChanges(
            function() {
                return me.unlinkFromWithoutPropagation(fromId, function cancelFeedback(fn) {
                    cancelFn = fn;
                });
            },
            function onPropagationComplete(cancelChanges, affectedTasks) {
                cancelChanges && cancelFn && cancelFn();
                callback && callback(cancelChanges, affectedTasks);
            }
        );
    },


    unlinkFromWithoutPropagation : function(fromId, cancelFeedback) {
        var me                 = this,
            toId               = me.getId(),
            dependencyStore    = me.getDependencyStore(),
            dependency,
            indexOfDependency;

        // {{{ Parameters normalization
        fromId = fromId instanceof Gnt.model.Task ? fromId.getId() : fromId;
        // }}}

        dependency = dependencyStore.getTasksLinkingDependency(fromId, toId);

        // <debug>
        // Preconditions:
        dependency ||
            Ext.Error.raise("Can't unlink task '" + toId + "' from task '" + fromId + ", tasks are not linked!");
        // </debug>

        indexOfDependency = dependencyStore.indexOf(dependency);

        dependencyStore.remove(dependency);

        cancelFeedback && cancelFeedback(function() {
            dependencyStore.insert(indexOfDependency, dependency);
        });

        return me;
    },


    // side-effects free method - suitable for use in "normalization" stage
    // calculates the effort based on the assignments information
    calculateEffort : function (startDate, endDate, unit) {
        // effort calculation requires both dates
        if (!startDate || !endDate) return 0;

        var totalEffort     = 0;

        this.forEachAvailabilityIntervalWithResources({ startDate : startDate, endDate : endDate }, function (intervalStartDate, intervalEndDate, currentAssignments) {
            var totalUnits          = 0;

            for (var i in currentAssignments) totalUnits += currentAssignments[ i ].units;

            totalEffort             += (intervalEndDate - intervalStartDate) * totalUnits / 100;
        });

        return this.getUnitConverter().convertMSDurationToUnit(totalEffort, unit || this.getEffortUnit());
    },


    updateAssignments : function () {
        // prevent nested call of this method (we have assignment.setUnits() below)
        if (!this._inUpdateAssignments) {

            this._inUpdateAssignments = true;

            var startDate = this.getStartDate(),
                endDate   = this.getEndDate(),
                totalTime = 0;

            // do nothing if task is not scheduled
            if (startDate && endDate) {

                this.forEachAvailabilityIntervalWithResources({ startDate : startDate, endDate : endDate }, function (intervalStartDate, intervalEndDate, currentAssignments) {

                    for (var resourceId in currentAssignments) {
                        totalTime += intervalEndDate - intervalStartDate;
                    }
                });

                // found some assigned resource intervals
                if (totalTime) {
                    var effortInMS = this.getEffort(Sch.util.Date.MILLI);

                    Ext.Array.each(this.getAssignments(), function (assignment) {
                        assignment.setUnits(effortInMS / totalTime * 100);
                    });
                }
            }

            this._inUpdateAssignments = false;
        }
    },


    updateEffortBasedOnDuration : function () {
        this.setEffortWithoutPropagation(this.calculateEffort(this.getStartDate(), this.getEndDate()));
    },


    // Alias for updateEffortBasedOnDuration(). Added to have symmetry with updateSpanBasedOnEffort.
    updateEffortBasedOnSpan : function () {
        this.updateEffortBasedOnDuration();
    },


    updateSpanBasedOnEffort : function () {
        // we have to update startDate because duration change can turn the task into a milestone
        // and for milestones we should set startDate to the end of last working period
        this.setStartEndDateWithoutPropagation(this.getStartDate(), this.recalculateEndDate());
    },


    onPotentialEffortChange : function () {
        var me = this,
            taskStore = me.getTaskStore(true);

        if (me.isTaskStored() && (!taskStore || !taskStore.isUndoingOrRedoing())) {
            switch (me.getSchedulingMode()) {
                case 'FixedDuration'        : me.updateEffortBasedOnDuration(); break;
                case 'DynamicAssignment'    : me.updateAssignments(); break;
            }
        }
    },

    //TODO something here
    onAssignmentMutation : function () {
        var me = this,
            taskStore = me.getTaskStore(true),
            calculateCost = me.autoCalculateCost;

        if (me.isTaskStored() && (!taskStore || !taskStore.isUndoingOrRedoing())) {
            switch (me.getSchedulingMode()) {
                case 'FixedDuration'     :
                    me.updateEffortBasedOnDuration();
                    calculateCost = false;
                    break;
                case 'EffortDriven'      : me.updateSpanBasedOnEffort(); break;
                case 'DynamicAssignment' : me.updateAssignments(); break;
            }

            if (calculateCost)
                me.recalculateCost();
        }
    },

    //TODO something here
    onAssignmentStructureMutation : function () {
        var me = this,
            taskStore = me.getTaskStore(true),
            calculateCost = me.autoCalculateCost;

        if (me.isTaskStored() && (!taskStore || !taskStore.isUndoingOrRedoing())) {
            switch (me.getSchedulingMode()) {
                case 'FixedDuration'        :
                    me.updateEffortBasedOnDuration();
                    calculateCost = false;
                    break;
                case 'EffortDriven'         : me.updateSpanBasedOnEffort(); break;
                case 'DynamicAssignment'    : me.updateAssignments(); break;
            }

            if (calculateCost)
                me.recalculateCost();
        }
    },


    /**
     * @propagating
     * Adjusts the task start/end properly according to the calendar dates.
     * @param {Function} [callback] Callback function to call after the task has been adjusted and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    adjustToCalendar : function (callback) {
        var me = this;

        me.propagateChanges(
            function() {
                return me.adjustToCalendarWithoutPropagation();
            },
            callback
        );
    },


    adjustToCalendarWithoutPropagation : function () {
        var me        = this,
            taskStore = me.getTaskStore(true),
            propagate = false;

        if (taskStore) {

            if (me.get('leaf')) {
                me.setStartDateWithoutPropagation(me.getStartDate());

                me.scheduleWithoutPropagation({ taskStore : taskStore });

                // Should it be recalculated here too?
                // me.recalculateCost();
                propagate = me;

            } else if (me.getStartDate() && me.getEndDate()) {
                me.set(me.durationField, me.calculateDuration(me.getStartDate(), me.getEndDate(), me.getDurationUnit()));
                propagate = me;
            }
        }

        return propagate;
    },

    /**
     Returns if the task is readonly. When readonly is `true` the task {@link #isEditable} returns `false` for all its fields.
     @return {Boolean} Boolean value, indicating whether the model is readonly
     */
    isReadOnly : function () {
        var result = false;

        this.bubble(function (task) {
            if (task.getReadOnly()) {
                result = true;
                return false;
            }
        }, this);

        return result;
    },

    /*
     * @method setReadOnly
     * Sets if the given task is readonly. You can subclass this class and override this method to provide your own logic.
     *
     * When the task is readonly {@link #isEditable} returns `false` for all fields except the readonly field.
     * A task in readonly state will not allow dependency creation.
     *
     * @param {String} value indicating if the task is readonly
     */

    /**
     * Checks if the given task field is editable. You can subclass this class and override this method to provide your own logic.
     *
     * It takes the task scheduling mode into account. For example for "FixedDuration" mode, the {@link #Effort}
     * field is calculated and thus should not be editable by user directly.
     *
     * @param {String} fieldName Name of the field
     * @return {Boolean} Boolean value, indicating whether the given field is editable
     */
    isEditable : function (fieldName) {
        // if some parent is readonly
        if (!this.getReadOnly() && this.isReadOnly()) {
            return false;
        }

        if (fieldName === this.readOnlyField) return true;

        // check if the task is readonly
        if (this.getReadOnly()) return false;

        if (!this.isLeaf()) {

            if (this.autoCalculateEffortForParentTask) {
                if (fieldName === this.effortField) return false;
                if (fieldName === this.actualEffortField) return false;
            }

            if (this.autoCalculateCostForParentTask) {
                if (fieldName === this.costField) return false;
                if (fieldName === this.actualCostField) return false;
            }

            if (fieldName === this.percentDoneField && this.autoCalculatePercentDoneForParentTask) return false;
        }

        // "autoCalculateCost" mode means we calculate "Cost" and "ActualCost" based on assigned resources costs
        if (this.autoCalculateCost) {
            if (fieldName === this.costField) return false;
            if (fieldName === this.actualCostField) return false;
        }

        if ((fieldName === this.durationField || fieldName === this.endDateField) && this.isEffortDriven()) {
            return false;
        }

        if (fieldName === this.effortField && this.getSchedulingMode() === 'FixedDuration') {
            return false;
        }

        return true;
    },


    /**
     * @method isDraggable
     *
     * Returns true if event can be drag and dropped
     * @return {Mixed} The draggable state for the event.
     */
    isDraggable: function () {
        return this.getDraggable();
    },

    /**
     * @method setDraggable
     *
     * Sets the new draggable state for the event
     * @param {Boolean} draggable true if this event should be draggable
     */

    /**
     * @method isResizable
     *
     * Returns true if event can be resized, but can additionally return 'start' or 'end' indicating how this event can be resized.
     * @return {Mixed} The resource Id
     */
    isResizable: function () {
        return this.getResizable();
    },

    /**
     * @method getWBSCode
     *
     * Returns the WBS code of task.
     * @return {String} The WBS code string
     */
    getWBSCode: function () {
        var indexes     = [],
            index,
            task        = this;

        while (task.parentNode) {
            index = task.parentNode.childNodes.indexOf(task);
            indexes.push(index + 1);
            task        = task.parentNode;
        }

        return indexes.reverse().join('.');
    },


    resetTotalCount : function (preventCaching) {
        var task            = this;

        while (task) {
            task.totalCount = preventCaching ? -1 : null;
            task            = task.parentNode;
        }
    },

    /**
     * Returns total count of child nodes and their children.
     *
     * @return {Number} Total count of child nodes
     */
    getTotalCount : function () {
        var totalCount          = this.totalCount;
        var cachingPrevented    = totalCount == -1;

        // `cachingPrevented` (totalCount == -1) will cause the value to be always recalculated
        if (totalCount == null || cachingPrevented) {
            var childNodes  = this.childNodes;

            totalCount      = childNodes.length;

            for (var i = 0, l = childNodes.length; i < l; i++) {
                totalCount  += childNodes[ i ].getTotalCount();
            }

            if (cachingPrevented)
                return totalCount;
            else
                this.totalCount = totalCount;
        }

        return totalCount;
    },


    /**
     * @method getPreviousSiblingsTotalCount
     * Returns count of all sibling nodes (including their children).
     *
     * @return {Number}
     */
    getPreviousSiblingsTotalCount : function () {
        var task    = this.previousSibling,
            count   = this.parentNode.childNodes.indexOf(this);

        while (task) {
            count   += task.getTotalCount();
            task    = task.previousSibling;
        }

        return count;
    },


    /**
     * @method getSequenceNumber
     *
     * Returns the sequential number of the task. A sequential number means the ordinal position of the task in the total dataset, regardless
     * of its nesting level and collapse/expand state of any parent tasks. The root node has a sequential number equal to 0.
     *
     * For example, in the following tree data sample sequential numbers are specified in the comments:
     *
     *        root : {
     *            children : [
     *                {   // 1
     *                    leaf : true
     *                },
     *                {       // 2
     *                    children : [
     *                        {   // 3
     *                            children : [
     *                                {   // 4
     *                                    leaf : true
     *                                },
     *                                {   // 5
     *                                    leaf : true
     *                                }
     *                            ]
     *                        }]
     *                },
     *                {   // 6
     *                    leaf : true
     *                }
     *            ]
     *        }
     *
     * If we will collapse some of the parent tasks, sequential number of collapsed tasks won't change.
     *
     * See also {@link Gnt.data.TaskStore#getBySequenceNumber}.
     *
     * @return {Number} The code
     */
    getSequenceNumber: function () {
        var code    = 0,
            task    = this;

        while (task.parentNode) {
            code    += task.getPreviousSiblingsTotalCount() + 1;
            task    = task.parentNode;
        }

        return code;
    },

    // generally should be called on root node only
    getBySequenceNumber : function (number) {
        var resultNode = null,
            childNode, totalCount;

        if (number === 0) {
            resultNode = this;
        } else if (number > 0 && number <= this.getTotalCount()) {
            number--;

            for (var i = 0, l = this.childNodes.length; i < l; i++) {
                childNode       = this.childNodes[i];
                totalCount      = childNode.getTotalCount();

                if (number > totalCount)
                    number      -= totalCount + 1;
                else {
                    childNode   = this.childNodes[i];
                    resultNode  = childNode.getBySequenceNumber(number);
                    break;
                }
            }
        }

        return resultNode;
    },

    /**
     * @method setResizable
     *
     * Sets the new resizable state for the event. You can specify true/false, or 'start'/'end' to only allow resizing one end of an event.
     * @param {Boolean} resizable true if this event should be resizable
     */

    // Does a regular copy but also copies references to the model taskStore etc
    // Intended to be used when copying a task that will be added to the same taskStore
    fullCopy : function (model) {
        var cp = this.callParent(arguments);

        cp.taskStore = this.getTaskStore();

        return cp;
    },


    commit: function () {
        this.callParent(arguments);

        this.commitSegments();
    },


    reject: function () {
        this.callParent(arguments);

        this.rejectSegments();
    },

    isUnscheduled : function () {
        return !this.getStartDate() || !this.getEndDate();
    },

    isMarkedForRescheduling : function () {
        return this.get('needsRescheduling');
    },

    markForRescheduling : function () {
        this.set('needsRescheduling', true);
    },

    unmarkForRescheduling : function () {
        this.set('needsRescheduling', false);
    },


    isTaskStored : function() {
        // We can't rely on this.taskStore here only, it's value is managed in setRoot/onTaskRemoved method of the task store
        // and there's a time when task is removed already but onTaskRemoved() handle hasn't completed yet
        return !!(this.getTreeStore() && this.getTreeStore().getRoot() && !this.getTreeStore().destroyed);
        /*
        var root = this;
        while (!root.isRoot()) {
            root = root.parentNode;
        }
        return this.taskStore && this.taskStore.getRoot() === root;
        */
    },

    onRegisterTreeNode : function (store) {
        if (store && store.autoNormalizeNodes && !this.normalized) {
            this.normalize();
        }
    }

}, function () {
    // Do this first to be able to override NodeInterface methods
    Ext.data.NodeInterface.decorate(this);

    this.override({

        copy : function () {
            var result      = this.callParent(arguments),
                segments    = result.getSegments();

            // for a segmented task we also make a copy of each segment
            if (segments) {
                for (var i = 0; i < segments.length; i++) {
                    var segment = segments[i];

                    // clone segments but provide "task" property targeting the task copy
                    segments[i] = segment.copy(segment.getId(), false, { task : result });
                }
            }

            return result;
        },

        // @OVERRIDE
        insertBefore : function (node, refNode) {
            node        = this.createNode(node);

            if (!node) return;

            var store                   = this.getTaskStore(true),
                root                    = store && store.getRoot(),
                phantomParentIdField    = this.phantomParentIdField,
                phantom                 = this !== root && this.phantom,
                isMove                  = !!node.parentNode,
                internalId              = this.getId();

            if (phantom) {
                this.data[this.phantomIdField] = internalId;
            }

            if (internalId !== node.data[phantomParentIdField]) {
                var newPhantomParentIdValue = phantom ? internalId : null;

                if (!node.phantom && node.data[phantomParentIdField] !== newPhantomParentIdValue) {
                    node.modified                       = node.modified || {};
                    node.modified[phantomParentIdField] = node.data[phantomParentIdField];
                }

                node.data[phantomParentIdField]    = newPhantomParentIdValue;
            }

            var refNodeIndex            = refNode && refNode.get('index');

            this.resetTotalCount(isMove);

            // Scan for and remove invalid dependencies since a parent task may not have dependencies to its children etc.
            // Has to be done before callParent where the node move happens
            if (isMove && node.hasDependencies() && !store.isUndoingOrRedoing()) {
                node.removeDependenciesToParents(this);
            }

            var res                     = this.callParent(arguments);

            // Scan for and remove invalid dependencies since a parent task may not have dependencies to its children etc.
            if (isMove) {
                // if the task has dependencies
                if (this.hasDependencies()) {
                    // we just potentially changed dependencies setup so need to reset the dependency store cache
                    store.getDependencyStore().resetMethodsCache();
                    // Scan for and remove invalid dependencies.
                    if (!store.isUndoingOrRedoing()) {
                        this.removeInvalidDependencies();
                    }
                }
                this.resetTotalCount();
            }

            if (store && !store.isUndoingOrRedoing()) {
                // Check if the task constraint is no more sensible (some constraints are meant to be used for leaf nodes only)
                this.resetConstraintIfNotApplicable();
            }

            return res;
        },

        // @OVERRIDE
        appendChild : function (nodes, suppressEvents, commit) {
            nodes                       = nodes instanceof Array ? nodes : [ nodes ];

            var store                   = this.getTaskStore(true),
                root                    = store && store.getRoot(),
                isMove                  = false,
                phantomParentIdField    = this.phantomParentIdField,
                phantom                 = this !== root && this.phantom,
                internalId              = this.getId(),
                nodesCreated            = 0;

            if (store && nodes.length > 1) {
                store.suspendAutoRecalculateParents++;
            }

            for (var i = 0; i < nodes.length; i++) {
                var node = this.createNode(nodes[ i ]);

                if (!node) continue;

                nodesCreated++;

                nodes[ i ] = node;

                // appending child that is already in the same tree, will first remove it from previous parent.
                // Removing is hidden inside of the `appendChild` implementation and causes various side effects
                // which re-fills the `totalCount` cache with wrong value. Need to suspend caching during parent
                // "appendChild" implementation
                if (node.parentNode) {
                    isMove = true;
                    // Has to be done before callParent where the node move happens
                    if (node.hasDependencies() && store && !store.isUndoingOrRedoing()) {
                        node.removeDependenciesToParents(this);
                    }
                }

                if (internalId !== node.data[phantomParentIdField]) {
                    var newPhantomParentIdValue = phantom ? internalId : null;

                    if (!node.phantom && node.data[phantomParentIdField] !== newPhantomParentIdValue) {
                        node.modified                       = node.modified || {};
                        node.modified[phantomParentIdField] = node.data[phantomParentIdField];
                    }

                    node.data[phantomParentIdField]    = newPhantomParentIdValue;
                }
            }

            if (!nodesCreated) return;

            if (phantom) {
                this.data[ this.phantomIdField ]    = internalId;
            }

            this.resetTotalCount(isMove);

            // convert a single element array back to just element, to avoid extra function call
            var res     = this.callParent([ nodes.length > 1 ? nodes : nodes[ 0 ], suppressEvents, commit ]);

            if (isMove) {
                // if the task has dependencies
                if (this.hasDependencies()) {
                    // we just potentially changed dependencies setup so need to reset the dependency store cache
                    store.getDependencyStore().resetMethodsCache();
                    // Scan for and remove invalid dependencies.
                    if (store && !store.isUndoingOrRedoing()) {
                        this.removeInvalidDependencies();
                    }
                }

                this.resetTotalCount();
            }

            if (store && !store.isUndoingOrRedoing()) {
                this.beginEdit();

                // Bugfix ticket #1401
                this.markAsParent();
                // since the task became a parent we switch its scheduling mode to 'Normal' (ticket #1441)
                this.set(this.schedulingModeField, 'Normal');

                // Check if the task constraint is no more sensible (some constraints are meant to be used for leaf nodes only)
                this.resetConstraintIfNotApplicable();

                if (store && nodes.length > 1) {
                    store.suspendAutoRecalculateParents--;
                }

                this.endEdit();
            }

            if (store && store.recalculateParents && !store.suspendAutoRecalculateParents && !this.isRoot() && !store.cascading && !store.isUndoingOrRedoing()) {
                nodes[0].recalculateParents();
            }

            return res;
        },

        // @OVERRIDE
        removeChild : function (node, destroy, suppressEvents, isMove) {
            var me                  = this,
                needToConvertToLeaf = !me.removeChildIsCalledFromReplaceChild && me.convertEmptyParentToLeaf && me.childNodes.length == 1,
                taskStore           = me.getTaskStore(true),
                result;

            me.resetTotalCount();

            // need to reset the flag early, because the removal operation may cause some side effects (event listeners)
            // flag should be already reset in those listeners
            me.removeChildIsCalledFromReplaceChild    = false;

            // Calling parent
            result = me.callParent(arguments);

            // In case of node move we need to reset the total count cache one more time here.
            // This is for the case, when we append/insert some existing node to a different position
            // in its parent node. In this case, the total count cache will be originally reset in our
            // overrides for `insertBefore` or `appendChild`. This is supposed to be enough, but its not,
            // because before doing actuall append, not first will be removed from the parent ("removeChild" call
            // is part of the `appendChild/insertBefore` methods. The listeners of `remove` event may call
            // `getTotalCount` and fill the cache. Then, we continue to actual node insertion, but cache is already filled
            // with wrong data.
            if (isMove) {
                me.resetTotalCount();
            }

            // If this parent has children left, recalculate it's start/end dates if required
            if (me.childNodes.length > 0 && taskStore && taskStore.recalculateParents && !taskStore.suspendAutoRecalculateParents && !taskStore.isUndoingOrRedoing()) {
                // If the parent has some children left then recalculate it's start/end dates if required
                //me.refreshCalculatedParentNodeData();
                me.childNodes[0].recalculateParents();
            }

            // If the parent has no other children, change it to a leaf task
            if (needToConvertToLeaf && !me.isRoot() && taskStore && !taskStore.isUndoingOrRedoing()) {
                me.convertEmptyParentToLeafTask();
            }

            return result;
        },

        replaceChild : function () {
            // flag will be reset in the `removeChild` override
            this.removeChildIsCalledFromReplaceChild    = true;

            this.callParent(arguments);
        },

        removeAll : function () {
            var isLeaf    = this.isLeaf(),
                taskStore = this.getTaskStore(true);

            this.resetTotalCount();
            this.callParent(arguments);

            // if we don't know the task taskStore we cannot set its duration to 1 day (which happens in convertEmptyParentToLeafTask())
            if (!isLeaf && this.convertEmptyParentToLeaf && taskStore) {
                this.convertEmptyParentToLeafTask();
            }
        },


        // @OVERRIDE
        createNode : function (node) {

            var me          = this,
                store       = me.getTaskStore(true),
                root        = store && store.getRoot(),
                reader;

            if (store) {
                reader      = store.getProxy().getReader();

                var originalGetChildType = reader.getChildType;

                // TODO: check this in ext5.1.2+
                // parent "createNode" doesnot fallback to the reader model
                // and raises exception because of that (in ext5.1.0/ext5.1.1)
                reader.getChildType = function() {
                    return originalGetChildType.apply(this, arguments) || this.getModel();
                };
            }

            node = this.callParent(arguments);

            // restore original reader.getChildType
            if (store && reader) delete reader.getChildType;

            return node;
        }
    });
});
