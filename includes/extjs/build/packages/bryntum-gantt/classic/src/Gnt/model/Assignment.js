/**
 * @class Gnt.model.Assignment
 *
 * This class represent a single assignment of a resource to a task in your gantt chart. It is a subclass of the {@link Sch.model.Customizable} class, which in its turn subclasses {@link Ext.data.Model}.
 * Please refer to documentation of those classes to become familar with the base interface of this class.
 *
 * Field names of the model can be customized by subclassing this class. Please refer to {@link Sch.model.Customizable} for details.
 *
 * See also: {@link Gnt.column.ResourceAssignment}
 */
Ext.define('Gnt.model.Assignment', {
    extend  : 'Sch.model.Assignment',

    uses : [
        'Sch.util.Date'
    ],

    customizableFields  : [
        /**
         * @field EventId
         * @hide
         */
        /**
         * @field TaskId
         * The id of the task to which the resource is assigned
         */
        { name : 'TaskId' },
        /**
         * @field
         * A float value representing the percent of how much of the resource's availability that is dedicated to this task
         */
        { name : 'Units', type : 'float', defaultValue : 100 }
    ],

    /**
     * @cfg {String} taskIdField The name of the {@link #TaskId field identifying the task} to which an event belongs.
     */
    taskIdField  : 'TaskId',
    eventIdField : 'TaskId',

    /**
     * @cfg {String} unitsField The name of the {@link #Units field identifying the units} of this assignment.
     */
    unitsField   : 'Units',

    constructor : function(data, session) {
        var me = this;
        me.eventIdField = me.taskIdField;
        me.callParent([data, session]);
    },

    getEventId : function() {
        var me = this;
        return me.get(me.taskIdField);
    },

    setEventId : function(eventId) {
        var me = this;
        return me.set(me.taskIdField, eventId);
    },

    /**
     * Returns the associated task store instance
     *
     * @return {Gnt.data.TaskStore}
     */
    getTaskStore : function() {
        return this.taskStore || (this.store && this.store.getTaskStore()) || null;
    },

    getEventStore : function() {
        return this.getTaskStore();
    },

    /**
     * Returns the units of this assignment
     *
     * @return {Number} units
     */
    getUnits : function () {
        var me = this;

        return Math.max(0, me.get(me.unitsField));
    },


    /**
     * Sets the units of this assignment
     *
     * @param {Number} value The new value for units
     */
    setUnits : function (value) {
        var me = this;

        // <debug>
        value < 0 &&
            Ext.Error.raise("`Units` value for an assignment can't be less than 0");
        // </debug>

        me.set(me.unitsField, value);
    },


    /**
     * @method getTask
     * Returns the task associated with this assignment.
     * @return {Gnt.model.Task} The associated task
     */
    /** @ignore */
    getTask : function (taskStore) {
        var me = this;
        return me.getEvent(taskStore);
    },

    /**
     * @method getTaskName
     * Returns the associated task name.
     * @return {String} The associated task name.
     */
    /** @ignore */
    getTaskName : function (taskStore) {
        var task = this.getTask(taskStore);
        return task && task.getName() || '';
    },


    /**
     * Returns the effort contributed by the assigned resource to the task.
     * @param {String} unit Unit to return the effort in. Defaults to the task {@link Gnt.model.Task#EffortUnit EffortUnit} value.
     * @return {Number} Effort contributed by the assigned resource.
     */
    getEffort : function (unit, taskStore, resourceStore) {
        var me          = this,
            task        = me.getTask(taskStore),
            totalEffort = 0;

        // task can be unreachable when we call this method during Task identifier modification
        if (task && task.getStartDate()) {
            task.forEachAvailabilityIntervalWithResources(
                {
                    startDate   : task.getStartDate(),
                    endDate     : task.getEndDate(),
                    resources   : [ me.getResource(resourceStore) ]
                },
                function (intervalStartDate, intervalEndDate, currentAssignments) {
                    var i, totalUnits;

                    for (i in currentAssignments) {
                        totalUnits = currentAssignments[ i ].units;
                    }

                    totalEffort += (intervalEndDate - intervalStartDate) * totalUnits / 100;
                }
            );

            totalEffort = task.getProjectCalendar().convertMSDurationToUnit(totalEffort, unit || task.getEffortUnit());
        }

        return totalEffort;
    },

    /**
     * Returns the cost based on assigned resource rates
     * @returns {Number}
     */
    getCost : function () {
        var me       = this,
            resource = me.getResource(),
            cost     = 0;

        // task can be unreachable when we call this method during Task identifier modification
        if (me.getTask()) {
            cost = resource.getRate() * me.getEffort(resource.getRateUnit());
        }

        return cost;
    },

    /**
     * Returns an effort which will be spent by the resource assignment designated resource on the assignment
     * designated task at the given date.
     *
     * @param {Date} date
     * @param {String} [unit]
     */
    getEffortAtDate: function (date, unit) {
        var SUD         = Sch.util.Date,
            me          = this,
            task        = me.getTask(),
            startDate   = task && task.getStartDate(),
            endDate     = task && task.getEndDate(),
            resource    = me.getResource(),
            totalEffort = 0;

        if (task && resource && startDate && endDate) {

            date = SUD.constrain(date, startDate, endDate);

            task.forEachAvailabilityIntervalWithResources(
                {
                    startDate: startDate,
                    endDate: date,
                    resources: [resource]
                },
                function (from, till, assignments) {
                    var totalUnits = 0;

                    // Actually we have an object with one key, and the loop here is just to get to that key
                    // since it's name is unknown
                    for (var i in assignments) totalUnits = assignments[i].units;

                    totalEffort += (till - from) * totalUnits / 100;
                }
            );

            totalEffort = task.getCalendar().convertMSDurationToUnit(totalEffort, unit || task.getEffortUnit());
        }

        return totalEffort;
    }
});
