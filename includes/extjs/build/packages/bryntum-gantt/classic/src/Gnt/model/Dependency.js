/**
 * @class Gnt.model.Dependency
 *
 * This class represents a single Dependency in your gantt chart. It is a subclass of the {@link Sch.model.Customizable} class, which in its turn subclasses {@link Ext.data.Model}.
 * Please refer to documentation of those classes to become familiar with the base interface of this class.
 *
 * Subclassing the Dependency class
 * --------------------
 *
 * The name of any field can be customized in the subclass, see the example below. Please also refer to {@link Sch.model.Customizable} for details.
 *
 * ```javascript
 *     Ext.define('MyProject.model.Dependency', {
 *         extend      : 'Gnt.model.Dependency',
 *
 *         toField     : 'targetId',
 *         fromField   : 'sourceId',
 *
 *         ...
 *     })
 * ```
 */
Ext.define('Gnt.model.Dependency', {
    extend              : 'Sch.model.DependencyBase',

    requires            : [
        'Sch.util.Date'
    ],

    /**
     * @cfg bidirectionalField
     * @hide
     */
    customizableFields     : [
        /**
         * @field Bidirectional
         * @hide
         */
        /**
         * @field From
         * The id of the task at which the dependency starts
         */
        /**
         * @field To
         * The id of the task at which the dependency ends
         */
        /**
         * @field
         * A numeric part of the lag (lead) value between the tasks. Negative values can be used to provide lead.
         * Please note, that only working time is counted as "lag" time.
         * By default any lag-related calculations are performed using the successor task
         * calendar (can be changed with {@link Gnt.data.TaskStore#dependenciesCalendar} config).
         */
        { name: 'Lag', type : 'number', defaultValue : 0},
        /**
         * @field
         * A duration unit part of the lag value between the tasks. Valid values are:
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
        {
            name            : 'LagUnit',
            type            : 'string',
            defaultValue    : "d",
            // make sure the default value is applied when user provides empty value for the field, like "" or null
            convert         : function (value) {
                return value || Sch.util.Date.DAY;
            }
        }
    ],

    /**
     * @cfg {String} lagField The name of the field that contains the lag amount.
     */
    lagField        : 'Lag',

    /**
     * @cfg {String} lagUnitField The name of the field that contains the lag unit duration.
     */
    lagUnitField    : 'LagUnit',

    isHighlighted   : false,

    getTaskStore : function() {
        return Ext.isFunction(this.store.getTaskStore) ? this.store.getTaskStore() : this.store.taskStore;
    },

    getEventStore : function() {
        return this.getTaskStore();
    },

    /**
     * Returns the source task of the dependency
     *
     * @return {Gnt.model.Task} The source task of this dependency
     */
    getSourceTask : function(taskStore) {
        return this.getSourceEvent(taskStore);
    },

    /**
     * Sets the source task of the dependency
     *
     * @param {Gnt.model.Task} task The new source task of this dependency
     */
    setSourceTask : function(task) {
        return this.setSourceEvent(task);
    },

    /**
     * Returns the target task of the dependency
     *
     * @return {Gnt.model.Task} The target task of this dependency
     */
    getTargetTask : function(taskStore) {
        return this.getTargetEvent(taskStore);
    },

    /**
     * Sets the target task of the dependency
     *
     * @param {Gnt.model.Task} task The new target task of this dependency
     */
    setTargetTask : function(task) {
        return this.setTargetEvent(task);
    },

    /**
     * @method getLag
     *
     * Returns the amount of lag for the dependency
     *
     * @return {Number} The amount of lag for the dependency
     */

    /**
     * @method setLag
     *
     * Sets the amount of lag for the dependency
     *
     * @param {Number} amount The amount of lag for the dependency
     * @param {String} [unit] Lag duration unit
     */
    setLag : function (amount, unit) {
        var me = this;

        me.beginEdit();
        me.set(me.lagField, amount);
        if (arguments.length > 1) {
            me.setLagUnit(unit);
        }
        me.endEdit();
    },

    /**
     * Returns the duration unit of the lag.
     * @return {String} Lag duration unit
     */
    getLagUnit: function () {
        var me = this;

        return me.get(me.lagUnitField) || Sch.util.Date.DAY;
    },

    /**
     * @method setLagUnit
     * Updates the lag unit of the dependency.
     * @param {String} unit Lag duration unit
     */

    /**
     * Returns `true` if the dependency is valid. Note, this method assumes that the model is part of a {@link Gnt.data.DependencyStore}.
     * Invalid dependencies are:
     *
     * - a task linking to itself
     * - a dependency between a child and one of its parents
     * - transitive dependencies, e.g. if A -> B, B -> C, then A -> C is not valid (this check is optional, see Gnt.data.DependencyStore#transitiveDependencyValidation)
     * @param {Gnt.data.TaskStore} [taskStore] Task store reference.
     * @return {Boolean} `true` is the dependency is valid and `false` otherwise.
     */
    isValid : function (taskStore) {
        var me          = this,
            valid       = me.callParent(arguments),
            sourceId    = me.getSourceId(),
            targetId    = me.getTargetId(),
            type        = me.getType();

        if (valid && taskStore !== false && me.store) {
            valid = me.store.isValidDependency(sourceId, targetId, type, null, null, me);
        }

        return valid;
    },

    // Determines the type of dependency based on fromSide and toSide
    getTypeFromSides : function (fromSide, toSide) {
        var types     = this.self.Type,
            startSide = 'start',
            endSide   = 'end';

        if (fromSide === startSide) {
            return (toSide === startSide) ? types.StartToStart : types.StartToEnd;
        }

        return (toSide === endSide) ? types.EndToEnd : types.EndToStart;
    },

    /**
     * Returns `true` if the duration between the dependency source and target are less than {@link #Lag lag value}.
     * @return {Boolean} `true` if there is no slack between the dependency source and target tasks.
     */
    isCritical : function () {
        var me       = this,
            source   = me.getSourceTask(),
            target   = me.getTargetTask(),
            lag      = me.getLag(),
            depType  = Gnt.model.Dependency.Type,
            result   = false,
            calendar, sourceDate, targetDate, tasksDistance;

        if (source && target) {

            calendar = me.getCalendar();

            switch (me.getType()) {
                case depType.StartToStart:
                    sourceDate = source.getStartDate();
                    targetDate = target.getStartDate();
                    break;
                case depType.StartToEnd:
                    sourceDate = source.getStartDate();
                    targetDate = target.getEndDate();
                    break;
                case depType.EndToStart:
                    sourceDate = source.getEndDate();
                    targetDate = target.getStartDate();
                    break;
                case depType.EndToEnd:
                    sourceDate = source.getEndDate();
                    targetDate = target.getEndDate();
                    break;
            }

            if (lag < 0) {
                tasksDistance = calendar.calculateDuration(targetDate, sourceDate, me.getLagUnit());
                result        = tasksDistance <= -lag;
            } else {
                tasksDistance = calendar.calculateDuration(sourceDate, targetDate, me.getLagUnit());
                result        = tasksDistance <= lag;
            }
        }

        return result;
    },

    getCalendar : function (taskStore) {
        taskStore = taskStore || this.getTaskStore();

        var me     = this,
            mode   = taskStore && taskStore.dependenciesCalendar || 'target',
            source = me.getSourceTask(taskStore),
            target = me.getTargetTask(taskStore),
            result;

        if (source && target) {
            switch (mode) {
                case 'project': result = target.getProjectCalendar(); break;
                case 'source': result = source.getCalendar(); break;
                case 'target': result = target.getCalendar(); break;
                default:
                    throw "Unsupported value for `dependenciesCalendar` config option";
            }
        }

        return result;
    }

});
