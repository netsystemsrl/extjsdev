/**
 * @class Gnt.model.Resource
 *
 * This class represents a single Resource in your gantt chart.
 * The inheritance hierarchy of this class includes {@link Sch.model.Customizable} and {@link Ext.data.Model} classes.
 * Please refer to the documentation of those classes to become familiar with the base interface of this class.
 *
 * If you want to add or change some fields, describing resources - subclass this class:
 *
 *     Ext.define('MyProject.model.Resource', {
 *         extend      : 'Gnt.model.Resource',
 *
 *         fields      : [
 *             // `Id` and `Name` fields are already provided by the superclass
 *             { name: 'Company', type : 'string' }
 *         ],
 *
 *         getCompany : function () {
 *             return this.get('Company')
 *         },
 *         ...
 *     })
 *
 * Any field can be customized in the subclass. Please refer to {@link Sch.model.Customizable} for details.
 *
 * See also: {@link Gnt.model.Assignment}, {@link Gnt.column.ResourceAssignment}
 */
Ext.define('Gnt.model.Resource', {
    extend : 'Sch.model.Resource',

    customizableFields : [
        /**
         * @field
         * The resource calendar identifier
         */
        'CalendarId',
        /**
         * @field
         * The resource rate
         */
        { name : 'Rate',        type : 'number', defaultValue : 0 },
        /**
         * @field
         * The resource rate unit (corresponds to units defined in {@link Sch.util.Date}). Valid values are:
         *
         * - "mi" (minutes)
         * - "h" (hours)
         * - "d" (days)
         * - "w" (weeks)
         * - "mo" (months)
         * - "q" (quarters)
         * - "y" (years)
         */
        { name : 'RateUnit',    type : 'string', defaultValue : 'h' },
        /**
         * @field
         * The value of per-use-cost when this resource is assigned
         */
        { name : 'PerUseCost',  type : 'number', defaultValue : 0 }
    ],

    /**
     * @cfg {String} calendarIdField The name of the field defining the id of the calendar for this specific resource.
     */
    calendarIdField : 'CalendarId',

    /**
     * @cfg {String} rateField The name of the field defining the Rate of this resource.
     */
    rateField       : 'Rate',

    /**
     * @cfg {String} rateUnitField The name of the field defining the used RateUnit of this resource.
     */
    rateUnitField   : 'RateUnit',

    /**
     * @cfg {String} perUseCostField The name of the field defining the PerUseCost of this resource.
     */
    perUseCostField   : 'PerUseCost',

    normalized              : false,
    calendarWaitingListener : null,

    isResource              : true,

    /**
     * Returns a task store this resource uses as default. Resource must be part
     * of a resource store to be able to retrieve event store.
     *
     * @return {Gnt.data.TaskStore|null}
     */
    getTaskStore : function () {
        var store = this.store || (this.getTreeStore && this.getTreeStore());
        return store ? store.getTaskStore() : null;
    },


    getEventStore : function () {
        return this.getTaskStore();
    },

    /**
     * @method getRate Returns the set rate for this resource.
     *
     * @return {Number} The rate per unit for this resource
     */

    /**
     * Set the Rate and RateUnit for this resource. Setting a new unit or rate will have influence on the assigned tasks costs when {@link Gnt.model.Task#autoCalculateCost autoCalculateCost} is set to true.
     *
     * @param {Number} rate
     * @param {String} unit
     */

    setRate : function (rate, unit) {

        if (unit)
            this.set(this.rateUnitField, unit);

        this.set(this.rateField, rate);
        this.recalculateCost();
    },

    /**
     * @method getRateUnit Returns the RateUnit for this resource.
     *
     * @return {String} The RateUnit for this resource
     */

    /**
     *
     * @param {String} unit Set the RateUnit for this resource. Setting a new unit will have influence on the assigned tasks costs when {@link Gnt.model.Task#autoCalculateCost autoCalculateCost} is set to true.
     */

    setRateUnit : function (unit) {
        this.set(this.rateUnitField, unit);
        this.recalculateCost();
    },

    /**
     * @method getPerUseCost Returns the PerUseCost for this resource.
     *
     * @return {Number} The PerUseCost for this resource
     */


    /**
     * Set PerUseCost when this resource is assigned to a new task.
     * Setting a new PerUseCost will have influence on the assigned task costs when {@link Gnt.model.Task#autoCalculateCost autoCalculateCost} is set to true.
     *
     * @param {Number} cost
     */

    setPerUseCost : function (cost) {
        this.set(this.perUseCostField, cost);
        this.recalculateCost();
    },

    recalculateCost : function () {
        this.forEachTask(function (task) {
            task.recalculateCost();
        }, this);
    },


    /**
     * Returns an array of tasks associated with this resource
     *
     * @return {Sch.model.Task[]} Associated tasks
     */
    getTasks : function () {
        return this.getEvents();
    },

    /**
     * Returns the calendar, based on which is performed the schedule calculations for associated tasks.
     * It will be either the own calendar of this resource (if any) or the calendar of the whole project.
     *
     * @param {Boolean} ownCalendarOnly Pass `true` to return only own calendar.
     *
     * @return {Gnt.data.Calendar} The instance of calendar
     */
    getCalendar: function (ownCalendarOnly) {
        var me = this;
        return ownCalendarOnly ? me.getOwnCalendar() : me.getOwnCalendar() || me.getProjectCalendar();
    },


    /**
     * Returns the {@link Gnt.data.Calendar calendar} instance, associated with this resource (if any). See also {@link #calendarIdField}.
     *
     * @return {Gnt.data.Calendar} calendar
     */
    getOwnCalendar : function () {
        var calendarId      = this.getCalendarId();

        return calendarId ? Gnt.data.Calendar.getCalendar(calendarId) : null;
    },


    /**
     * Returns the {@link Gnt.data.Calendar calendar} instance, associated with the project of this resource (with the TaskStore instance
     * this resource belongs to).
     *
     * @return {Gnt.data.Calendar} calendar
     */
    getProjectCalendar : function () {
        return this.getTaskStore().getCalendar();
    },


    /**
     * Sets the {@link Gnt.data.Calendar calendar}, associated with this resource. Calendar must have a {@link Gnt.data.Calendar#calendarId calendarId} property
     * defined, which will be saved in the `CalendarId` field of this task.
     *
     * @param {Gnt.data.Calendar/String} calendar A calendar instance or string with calendar id
     */
    setCalendar: function (calendar) {
        var isCalendarInstance  = calendar instanceof Gnt.data.Calendar;

        if (isCalendarInstance && !calendar.calendarId) throw new Error("Can't set calendar w/o `calendarId` property");

        this.setCalendarId(isCalendarInstance ? calendar.calendarId : calendar);
    },


    setCalendarId : function (calendarId, isInitial) {
        if (calendarId instanceof Gnt.data.Calendar) calendarId = calendarId.calendarId;

        var prevCalendarId  = this.getCalendarId();

        if (prevCalendarId != calendarId || isInitial) {
            if (this.calendarWaitingListener) {
                this.calendarWaitingListener.destroy();
                this.calendarWaitingListener = null;
            }

            var listeners       = {
                calendarchange  : this.onCalendarChange,
                scope           : this
            };

            var prevInstance        = this.calendar || Gnt.data.Calendar.getCalendar(prevCalendarId);

            // null-ifying the "explicit" property - it should not be used at all generally, only "calendarId"
            this.calendar   = null;

            prevInstance && prevInstance.un(listeners);

            this.set(this.calendarIdField, calendarId);

            var calendarInstance    = Gnt.data.Calendar.getCalendar(calendarId);

            if (calendarInstance) {
                calendarInstance.on(listeners);

                if (!isInitial) this.onCalendarChange();
            } else {
                this.calendarWaitingListener = Ext.data.StoreManager.on('add', function (index, item, key) {
                    calendarInstance    = Gnt.data.Calendar.getCalendar(calendarId);

                    if (calendarInstance) {
                        this.calendarWaitingListener.destroy();
                        this.calendarWaitingListener = null;

                        calendarInstance.on(listeners);

                        this.onCalendarChange();
                    }
                }, this, { destroyable : true });
            }
        }
    },


    onCalendarChange : function () {
        // raise flag that the resource is processing its calendar change
        this.inOnCalendarChange = true;

        this.adjustToCalendar();

        this.inOnCalendarChange = false;
    },


    adjustToCalendar : function () {
        this.getTaskStore() && this.forEachTask(function (task) {
            task.adjustToCalendar();
        });
    },


    // TODO: move it to Scheduler codebase
    /**
     * Assigns this resource to a given task. A new {@link Gnt.model.Assignment assignment} will be created
     * and added to the {@link Gnt.data.AssignmentStore} of the project.
     *
     * @param {Gnt.model.Task/Number} taskOrId Either instance of {@link Gnt.model.Task} or id of the task
     * @param {Number} units The value for the "Units" field
     * @param {Function} [callback] Callback function to call after resource has been assigned and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    assignTo : function (taskOrId, units, callback) {
        var task    = taskOrId instanceof Gnt.model.Task ? taskOrId : this.getTaskStore().getModelById(taskOrId);

        return task.assign(this, units, callback);
    },


    // TODO: move it to Scheduler code base
    /**
     * Un assigns this resource from the given task. The corresponding {@link Gnt.model.Assignment assignment} record
     * will be removed from the {@link Gnt.data.AssignmentStore} of the project.
     *
     * @param {Gnt.model.Task/Number} taskOrId Either instance of {@link Gnt.model.Task} or id of the task
     * @param {Function} [callback] Callback function to call after resource has been unassigned and possible changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    unAssignFrom : function(taskOrId, callback) {
        var task    = taskOrId instanceof Gnt.model.Task ? taskOrId : this.getTaskStore().getModelById(taskOrId);
        return task.unAssign(this, callback);
    },

    // TODO: move it to Scheduler codebase
    /**
     * Alias to {@link #unAssignFrom}.
     */
    unassignFrom : function() {
        return this.unAssignFrom.apply(this, arguments);
    },


    // TODO: maybe refactor this method using assignment store map* functions
    // TODO: move it to Scheduler's code base
    /**
     * Iterator for each assignment, associated with this resource.
     *
     * @param {Function} func The function to call. This function will receive an {@link Gnt.model.Assignment assignment} instance
     * as the only argument
     *
     * @param {Object} scope The scope to run the function in.
     */
    forEachAssignment : function (func, scope) {
        var me = this,
            taskStore = me.getTaskStore(),
            assignmentStore = taskStore && taskStore.getAssignmentStore(),
            assignments = assignmentStore && assignmentStore.getAssignmentsForResource(me) || [],
            i, len, done;

        scope = scope || this;

        for (done = false, i = 0, len = assignments.length; !done && i < len; ++i) {
            done = (false === func.call(scope, assignments[i]));
        }
    },


    // TODO: maybe refactor this method using assignment store map* methods
    // TODO: move it to Scheduler's codebase with forEachEvent name
    /**
     * Iterator for tasks, assigned to this resource.
     *
     * @param {Function} func The function to call. This function will receive an {@link Gnt.model.Task task} instance
     * as the only argument.
     *
     * @param {Object} scope The scope to run the function in.
     */
    forEachTask : function (func, scope) {
        var me = this,
            taskStore = me.getTaskStore(),
            assignmentStore = taskStore && taskStore.getAssignmentStore(),
            assignments = assignmentStore && assignmentStore.getAssignmentsForResource(me) || [],
            i, len, done, task;

        scope = scope || this;

        for (done = false, i = 0, len = assignments.length; !done && i < len; ++i) {
            task = assignments[i].getTask();
            task && (done = (false === func.call(scope, task)));
        }
    },


    collectAvailabilityIntervalPoints : function (intervals, startPoint, endPoint, pointsByTime, pointTimes) {
        for (var k = 0, l = intervals.length; k < l; k++) {
            var interval            = intervals[ k ];

            var intervalStartDate   = interval.startDate - 0;
            var intervalEndDate     = interval.endDate - 0;

            if (!pointsByTime[ intervalStartDate ]) {
                pointsByTime[ intervalStartDate ] = [];

                pointTimes.push(intervalStartDate);
            }

            pointsByTime[ intervalStartDate ].push(startPoint);

            if (!pointsByTime[ intervalEndDate ]) {
                pointsByTime[ intervalEndDate ] = [];

                pointTimes.push(intervalEndDate);
            }

            pointsByTime[ intervalEndDate ].push(endPoint);
        }
    },


    forEachAvailabilityIntervalWithTasks : function (options, func, scope) {
        scope                       = scope || this;

        var startDate               = options.startDate;
        var endDate                 = options.endDate;
        var targetTask              = options.task;

        if (!startDate || !endDate) throw "Both `startDate` and `endDate` are required for `forEachAvailabilityIntervalWithTasks`";

        var cursorDate              = new Date(startDate);
        var includeAllIntervals     = options.includeAllIntervals;
        var includeResCalIntervals  = options.includeResCalIntervals;

        var resourceCalendar        = this.getCalendar();

        var assignments             = [];
        var tasks                   = [];
        var tasksCalendars          = [];

        var pointTimes              = [ startDate - 0, endDate - 0 ];
        var pointsByTime            = {};

        pointsByTime[ startDate - 0 ]   = [ { type  : '00-intervalStart' } ];
        pointsByTime[ endDate - 0 ]     = [ { type  : '00-intervalEnd' } ];

        this.forEachAssignment(function (assignment) {
            var task        = assignment.getTask();

            // filter out non-existing and irrelevant tasks
            if (!task || (targetTask && task !== targetTask)) return;

            var taskStart   = task.getStartDate();
            var taskEnd     = task.getEndDate();
            var taskId      = task.getId();

            // filter out tasks out of provided [ startDate, endDate ) interval
            if (taskStart > endDate || taskEnd < startDate) return;

            tasks.push(task);

            // We use the resource calendar if task has no an assigned calendar
            // Since we have to use resource calendar only in this case (project calendar should not be taken into account)
            tasksCalendars.push(task.getOwnCalendar() || this.getCalendar());

            // if task is segmented then segments start/end dates are points of interest
            if (task.isSegmented()) {

                for (var taskSegments = task.getSegments(), i = 0, l = taskSegments.length; i < l; i++) {
                    var segment     = taskSegments[i];

                    this.collectAvailabilityIntervalPoints([{ startDate : segment.getStartDate(), endDate : segment.getEndDate() }],
                        {
                            type        : '05-taskStart',
                            assignment  : assignment,
                            taskId      : taskId,
                            units       : assignment.getUnits()
                        },
                        {
                            type        : '04-taskEnd',
                            taskId      : taskId
                        },
                        pointsByTime,
                        pointTimes
                    );
                }

            // task start/end dates are points of interest
            } else {
                this.collectAvailabilityIntervalPoints([{ startDate : taskStart, endDate : taskEnd }],
                    {
                        type        : '05-taskStart',
                        assignment  : assignment,
                        taskId      : taskId,
                        units       : assignment.getUnits()
                    },
                    {
                        type        : '04-taskEnd',
                        taskId      : taskId
                    },
                    pointsByTime,
                    pointTimes
                );
            }

            assignments.push(assignment);
        });

        // if there are no tasks - then there are no common intervals naturally
        if (!tasks.length && !includeAllIntervals && !includeResCalIntervals) return;

        var DATE = Sch.util.Date;

        var i, l, taskId;

        while (cursorDate < endDate) {

            this.collectAvailabilityIntervalPoints(
                resourceCalendar.getAvailabilityIntervalsFor(cursorDate),
                {
                    type    : '00-resourceAvailabilityStart'
                },
                {
                    type    : '01-resourceAvailabilityEnd'
                },
                pointsByTime,
                pointTimes
            );

            // using "for" instead of "each" should be blazing fast! :)
            for (i = 0, l = tasksCalendars.length; i < l; i++) {

                taskId = tasks[i].getId();

                // resource specific calendar point
                this.collectAvailabilityIntervalPoints(
                    tasksCalendars[ i ].getAvailabilityIntervalsFor(cursorDate),
                    {
                        type        : '02-taskAvailabilityStart',
                        taskId      : taskId
                    },
                    {
                        type        : '03-taskAvailabilityEnd',
                        taskId      : taskId
                    },
                    pointsByTime,
                    pointTimes
                );

            }

            // does not perform cloning internally!
            cursorDate       = DATE.getStartOfNextDay(cursorDate);
        }

        // Numerical sort, can't use default JS sort
        // we have to define a sorting function here since there is a bug in Chrome
        // which affects large arrays sorting if you don't provide a sorting function (#1365)
        pointTimes.sort(function (a, b) { return a - b; });

        var inInterval          = false,
            inResource          = false,
            currentAssignments  = {},
            inTaskCalendar      = 0,
            inTask              = 0;

        var inTaskCalendarHash = {};

        for (i = 0, l = pointTimes.length - 1; i < l; i++) {

            var points      = pointsByTime[ pointTimes[ i ] ];

            points.sort(function (a, b) { return a.type < b.type ? 1 : -1; });

            for (var k = 0, j = points.length; k < j; k++) {
                var point       = points[ k ];

                switch (point.type) {
                    case '00-resourceAvailabilityStart' :
                        inResource = true;
                        break;

                    case '01-resourceAvailabilityEnd' :
                        inResource = false;
                        break;

                    case '02-taskAvailabilityStart' :
                        inTaskCalendar++;
                        inTaskCalendarHash[ point.taskId ] = true;
                        break;

                    case '03-taskAvailabilityEnd' :
                        inTaskCalendar--;
                        delete inTaskCalendarHash[ point.taskId ];
                        break;

                    case '05-taskStart' :
                        currentAssignments[ point.taskId ] = point;
                        inTask++;
                        break;

                    case '04-taskEnd' :
                        delete currentAssignments[ point.taskId ];
                        inTask--;
                        break;

                    case '00-intervalStart' :
                        inInterval = true;
                        break;

                    case '00-intervalEnd' : return;
                }
            }

            if (inInterval && (includeAllIntervals || includeResCalIntervals && inResource || inResource && inTaskCalendar && inTask)) {

                var meta = {
                    inResourceCalendar  : inResource,
                    inTasksCalendar     : !!inTaskCalendar,
                    inTask              : inTask,
                    inTaskCalendarHash  : Ext.apply({}, inTaskCalendarHash)
                };

                var intervalStartDate       = pointTimes[ i ];
                var intervalEndDate         = pointTimes[ i + 1 ];

                // availability interval is out of [ startDate, endDate )
                if (intervalStartDate > endDate || intervalEndDate < startDate) continue;

                if (intervalStartDate < startDate) intervalStartDate = startDate - 0;
                if (intervalEndDate > endDate) intervalEndDate = endDate - 0;

                if (func.call(scope, intervalStartDate, intervalEndDate, currentAssignments, meta) === false) return false;
            }
        }
    },


    /**
     * This method will generate a report about the resource allocation in the given timeframe.
     * The start and end dates of the timeframe are provided as the "startDate/endDate" properties of the `options` parameter.
     * Options may also contain additional property: `includeAllIntervals` which includes the intervals w/o any
     * assignments in the ouput (see the example below).
     *
     * For example, this resource `R1` has the availability from 10:00 till 17:00 on 2012/06/01 and from 12:00 till 15:00 on 2012/06/02.
     * It is also assigned on 50% to two tasks:
     *
     * - `T1` has availability from 11:00 till 16:00 on 2012/06/01 and from 13:00 till 17:00 on 2012/06/02.
     *   It starts at 11:00 2012/06/01 and ends at 17:00 2012/06/02
     * - `T2` has availability from 15:00 till 19:00 on 2012/06/01 and from 09:00 till 14:00 on 2012/06/02.
     *   It starts at 15:00 2012/06/01 and ends at 14:00 2012/06/02
     *
     * So the allocation information for the period 2012/06/01 - 2012/06/03 (note the 03 in day - it means 2012/06/02 inclusive)
     * will looks like the following (to better understand this example you might want to draw all the information on paper):
     *

    [
        {
            startDate           : new Date(2012, 5, 1, 11),
            endDate             : new Date(2012, 5, 1, 15),
            totalAllocation     : 50,
            assignments         : [ assignmentForTask1 ],
            assignmentsHash     : { 'T1' : assignmentForTask1 },
            inResourceCalendar  : true,
            inTasksCalendar     : true,
            inTask              : 1
        },
        {
            startDate           : new Date(2012, 5, 1, 15),
            endDate             : new Date(2012, 5, 1, 16),
            totalAllocation     : 100,
            assignments         : [ assignmentForTask1, assignmentForTask2 ],
            assignmentsHash     : {
                'T1' : assignmentForTask1,
                'T2' : assignmentForTask2
            },
            inResourceCalendar  : true,
            inTasksCalendar     : true,
            inTask              : 2
        },
        {
            startDate           : new Date(2012, 5, 1, 16),
            endDate             : new Date(2012, 5, 1, 17),
            totalAllocation     : 50,
            assignments         : [ assignmentForTask2 ],
            inResourceCalendar  : true,
            inTasksCalendar     : true,
            inTask              : 2
        },
        {
            startDate           : new Date(2012, 5, 2, 12),
            endDate             : new Date(2012, 5, 2, 13),
            totalAllocation     : 50,
            assignments         : [ assignmentForTask2 ],
            assignmentsHash     : { 'T2' : assignmentForTask2 },
            inResourceCalendar  : true,
            inTasksCalendar     : true,
            inTask              : 2
        },
        {
            startDate           : new Date(2012, 5, 2, 13),
            endDate             : new Date(2012, 5, 2, 14),
            totalAllocation     : 100,
            assignments         : [ assignmentForTask1, assignmentForTask2 ],
            assignmentsHash     : {
                'T1' : assignmentForTask1,
                'T2' : assignmentForTask2
            },
            inResourceCalendar  : true,
            inTasksCalendar     : true,
            inTask              : 2
        },
        {
            startDate           : new Date(2012, 5, 2, 14),
            endDate             : new Date(2012, 5, 2, 15),
            totalAllocation     : 50,
            assignments         : [ assignmentForTask1 ],
            assignmentsHash     : { 'T1' : assignmentForTask1 },
            inResourceCalendar  : true,
            inTasksCalendar     : true,
            inTask              : 1
        },
    ]

     *
     * As you can see its quite detailed information - every distinct timeframe is included in the report.
     * You can aggregate this information as you need.
     *
     * Setting the `includeAllIntervals` option to true, will include intervals w/o assignments in the report, so the in the
     * example above, the report will start with:
     *

    [
        {
            startDate           : new Date(2012, 5, 1, 00),
            endDate             : new Date(2012, 5, 1, 10),
            totalAllocation     : 0,
            assignments         : [],
            assignmentsHash     : {},
            inResourceCalendar  : false,
            inTasksCalendar     : false,
            inTask              : 0
        },
        {
            startDate           : new Date(2012, 5, 1, 10),
            endDate             : new Date(2012, 5, 1, 11),
            totalAllocation     : 0,
            assignments         : [],
            assignmentsHash     : {},
            inResourceCalendar  : true,
            inTasksCalendar     : false,
            inTask              : 0
        },
        {
            startDate           : new Date(2012, 5, 1, 11),
            endDate             : new Date(2012, 5, 1, 15),
            totalAllocation     : 50,
            assignments         : [ assignmentForTask1 ],
            assignmentsHash     : { 'T1' : assignmentForTask1 }
            inResourceCalendar  : true,
            inTasksCalendar     : true,
            inTask              : 1
        },
        ...
    ]


     *
     * @param {Object} options Object with the following properties:
     *
     * - "startDate" - start date for the report timeframe
     * - "endDate" - end date for the report timeframe
     * - "includeAllIntervals" - whether to include the intervals w/o assignments in the report
     * - "includeResCalIntervals" - whether to include the intervals of resource calendar in the report
     * - "task" - (optional) Only return allocation data relating to a certain task
     */
    getAllocationInfo : function (options) {
        var info        = [];

        this.forEachAvailabilityIntervalWithTasks(options, function (intervalStartDate, intervalEndDate, intervalAssignments, meta) {
            var effectiveTotalAllocation    = 0,
                effectiveAssignments        = [],
                effectiveAssignmentsHash    = {},
                totalAllocation             = 0,
                assignments                 = [],
                assignmentsHash             = {},
                durationMS                  = intervalEndDate - intervalStartDate,
                allocationMS                = 0;

            if (meta.inResourceCalendar && meta.inTasksCalendar && meta.inTask) {
                // loop over all the unfinished (on this period of time) resource assignments
                for (var i in intervalAssignments) {

                    // if this task is running in the interval
                    if (meta.inTaskCalendarHash[i]) {
                        // calculate allocation (in milliseconds)
                        allocationMS                += durationMS * intervalAssignments[i].units * 0.01;
                        // calculate "effective" total allocation % (by running tasks only)
                        effectiveTotalAllocation    += intervalAssignments[i].units;
                        // put it into array / hash of running tasks
                        effectiveAssignmentsHash[i] = intervalAssignments[i].assignment;
                        effectiveAssignments.push(intervalAssignments[i].assignment);
                    }

                    // keep sum of allocation % for all the not finished tasks
                    // (regardless of which task is been handled in this interval)
                    totalAllocation     += intervalAssignments[i].units;
                    // array / hash of ongoing tasks
                    assignmentsHash[i]  = intervalAssignments[i].assignment;
                    assignments.push(intervalAssignments[i].assignment);
                }
            }

            info.push(Ext.apply({
                startDate                   : new Date(intervalStartDate),
                endDate                     : new Date(intervalEndDate),

                effectiveTotalAllocation    : effectiveTotalAllocation,
                effectiveAssignmentsHash    : effectiveAssignmentsHash,
                effectiveAssignments        : effectiveAssignments,

                totalAllocationMS           : allocationMS,
                totalAllocation             : totalAllocation,
                assignments                 : assignments,
                assignmentsHash             : assignmentsHash
            }, meta));
        });

        return info;
    },

    /**
     * Returns resource utilization info for the given time span.
     *
     * @param {Date} startDate
     * @param {Date} endDate
     * @param {Number} underUtilizationThreshold
     * @param {Number} overUtilizationThreshold
     *
     * @return {Object}  info
     * @return {Number}  info.allocationMs
     * @return {Number}  info.allocationDeltaMs,
     * @return {Boolean} info.isOverallocated
     * @return {Boolean} info.isUnderallocated
     * @return {Number}  info.resourceAvailabilityMs,
     * @return {Object}  info.assignmentInfo   Assignment utilization information keyed by assignment id
     * @return {Object}  info.taskInfo         Assignment utilization information keyed by task id
     */
    getUtilizationInfo : function (startDate, endDate, underUtilizationThreshold, overUtilizationThreshold) {
        var me               = this,
            amountMs         = 0,
            isOverallocated  = false,
            isUnderallocated = false,
            assignmentInfo   = {},
            taskInfo         = {};

        if (arguments.length < 3) {
            underUtilizationThreshold = overUtilizationThreshold = 100;
        }

        // get resource allocation report (array of intervals)
        var allocationIntervals = me.getAllocationInfo({
            // include not only allocated intervals but also availability intervals defined by the resource calendar
            // to be able to detect resource under-allocation properly
            includeResCalIntervals : true,
            startDate              : startDate,
            endDate                : endDate
        });

        Ext.Array.each(allocationIntervals, function (intervalInfo) {
            amountMs += intervalInfo.totalAllocationMS;

            if (intervalInfo.effectiveTotalAllocation > overUtilizationThreshold) {
                isOverallocated  = true;
                isUnderallocated = false;
            }
            else if (!isOverallocated && intervalInfo.effectiveTotalAllocation < underUtilizationThreshold) {
                isUnderallocated = true;
            }

            // loop over individual assignments to have allocationMs/isOverallocated/isUnderallocated per each assignment
            Ext.Array.each(intervalInfo.effectiveAssignments, function (assignment) {
                var assignmentId      = assignment.getId(),
                    taskId            = assignment.getTaskId(),
                    assignmentUnits   = assignment.getUnits(),
                    allocationMs      = Math.floor((intervalInfo.endDate - intervalInfo.startDate) * assignmentUnits / 100),
                    allocationDeltaMs = 0,
                    isOverallocated   = assignmentUnits > overUtilizationThreshold,
                    isUnderallocated  = assignmentUnits < underUtilizationThreshold,
                    assignmentUtilization;

                // if the assignment counters already started increment them
                if (assignmentInfo[assignmentId]) {
                    assignmentUtilization                    = assignmentInfo[assignmentId];
                    assignmentUtilization.allocationMs      += allocationMs;
                    assignmentUtilization.allocationDeltaMs += allocationDeltaMs;
                    assignmentUtilization.isOverallocated    = assignmentUtilization.isOverallocated  || isOverallocated;
                    assignmentUtilization.isUnderallocated   = assignmentUtilization.isUnderallocated || isUnderallocated;
                }
                // init the assignment counters
                else {
                    assignmentUtilization = {
                        isUtilized        : true,
                        allocationMs      : allocationMs,
                        allocationDeltaMs : allocationDeltaMs,
                        isOverallocated   : isOverallocated,
                        isUnderallocated  : isUnderallocated
                    };
                    assignmentInfo[assignmentId] = assignmentUtilization;
                    taskInfo[taskId]             = assignmentUtilization;
                }
            });
        });

        return {
            isUtilized        : amountMs > 0,
            allocationMs      : amountMs,
            allocationDeltaMs : 0,
            isOverallocated   : isOverallocated,
            isUnderallocated  : isUnderallocated,
            // individual assignments utilization info
            assignmentInfo    : assignmentInfo,
            taskInfo          : taskInfo
        };
    }
});
