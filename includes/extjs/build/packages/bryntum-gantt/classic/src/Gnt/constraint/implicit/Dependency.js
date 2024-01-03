/**
 * A class implementing the pseudo-constraint alerting a user when moving a task
 * causes either a dependency breaking or making a dependency to not drive the task position:
 *
 * {@img gantt/images/constraint-dependency.png}
 *
 * The constraint is used when {@link Gnt.data.TaskStore#checkDependencyConstraint checkDependencyConstraint} config is set to `true`.
 */
Ext.define('Gnt.constraint.implicit.Dependency', {
    extend      : 'Gnt.constraint.Base',

    singleton   : true,

    requires    : ['Ext.String'],

    getId : function () {
        return 'dependency';
    },

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     *      - 'You moved the task away'             : 'You moved the task "{2}" away from "{1}" and the two tasks are linked ({0}). As a result the link between tasks will not drive the later task position.',
     *      - 'You moved the task before'           : 'You moved the task "{2}" before "{1}" and the two tasks are linked ({0}). As a result the link cannot be honored.',
     *      - 'Remove the constraint'               : 'Remove the dependency',
     *      - depType0                              : 'Start-To-Start',
     *      - depType1                              : 'Start-To-Finish',
     *      - depType2                              : 'Finish-To-Start',
     *      - depType3                              : 'Finish-To-Finish',
     *      - 'Keep the dependency & move the task' : 'Keep the dependency & move the task at {0}'
     *
     */

    getTaskDrivingDependenciesContexts : function (task) {
        var dependenciesLimits = task.getIncomingDependenciesConstraintContext({
                ignoreParents      : true,
                fetchAll           : true,
                skipNonWorkingTime : true
            }),
            earlyStartDate     = task.getEarlyStartDate(),
            result             = [];

        if (dependenciesLimits) {
            for (var i = 0; i < dependenciesLimits.all.length; i++) {
                var limit = dependenciesLimits.all[i];

                if (limit.startDate - earlyStartDate === 0) {
                    result.push(limit);
                }
            }
        }

        return result;
    },


    canResolve : function (task, date) {
        var dependenciesLimits = this.getTaskDrivingDependenciesContexts(task),
            startDate          = task.getStartDate(),
            earlyStartDate     = task.getEarlyStartDate();

        // If there are multiple dependencies we don't ask user for a resolution
        return (startDate - earlyStartDate) && dependenciesLimits.length > 1 && task.isPinnable();
    },


    resolve : function (task) {
        // pin the task if possible
        task.pinWithoutPropagation();

        // place the task to its earliest allowed position
        task.setStartDateWithoutPropagation(task.getEarlyStartDate());
    },


    isSatisfied : function (task, date) {
        var dependenciesLimits = this.getTaskDrivingDependenciesContexts(task),
            taskStore          = task.getTaskStore(true),
            scheduleBackwards  = task.getScheduleBackwards(taskStore),
            startDate          = task.getStartDate(),
            earlyStartDate     = task.getEarlyStartDate();

        // Satisfied if:
        return scheduleBackwards ||
            !startDate ||                  // task is not scheduled
            task.isManuallyScheduled() ||     // task is manually scheduled
            task.isReadOnly() ||              // task is read only
            task.isCompleted() ||             // task is completed
            !dependenciesLimits.length ||     // task is not dependency driven
            startDate - earlyStartDate === 0; // task is scheduled according to its early start date
    },


    hasThisConstraintApplied : function (task) {
        return !task.isManuallyScheduled() && task.getIncomingDependencies().length;
    },


    getResolution : function (callback, task, date) {
        var me                 = this,
            dependenciesLimits = task.getIncomingDependenciesConstraintContext(),
            resolution         = me.callParent([ callback, task, dependenciesLimits ]);

        resolution.dependenciesLimits = dependenciesLimits;
        resolution.date               = null;

        var dependency = dependenciesLimits.constrainingDependency,
            sourceTask = dependency.getSourceTask(),
            targetTask = dependency.getTargetTask();

        // we need to show the violated dependency info in the UI
        resolution.description = Ext.String.format(
            /*
            Satisfy "902_unused" test to let it know the following locales are used:
            this.L('You moved the task away')
            this.L('You moved the task before')
            */
            me.L(task.getStartDate() > dependenciesLimits.startDate ? 'You moved the task away' : 'You moved the task before'),
            /*
            Satisfy "902_unused" test to let it know the following locales are used:
            this.L('depType0')
            this.L('depType1')
            this.L('depType2')
            this.L('depType3')
            */
            me.L('depType' + dependency.getType()),
            sourceTask.getName(),
            targetTask.getName()
        );

        // defaultAction is to silently resolve
        resolution.defaultAction = function () {
            me.resolve(task);
        };

        // Override the "remove constraint" option to remove the dependency instead
        // plus pin the task w/ SNET constraint to not allow it to fall back

        var taskStore             = task.getTaskStore(true),
            scheduleByConstraints = taskStore && taskStore.scheduleByConstraints,
            dependencyStore       = task.getDependencyStore(),
            removeOption          = resolution.getResolution('remove-constraint');

        removeOption.resolve = function () {
            dependencyStore.remove(dependency);
            scheduleByConstraints && task.pinWithoutPropagation();
            callback();
        };


        if (task.getStartDate() > dependenciesLimits.startDate) {
            resolution.resolutions.push({
                id      : 'pin-task',
                title   : me.L('Keep the dependency & move the task'),
                getTitleValues : function () {
                    return [task.getStartDate()];
                },
                resolve : function () {
                    scheduleByConstraints && task.pinWithoutPropagation();
                    callback();
                }
            });
        }

        return resolution;
    }

});
