/**
 * Class implementing "Must finish on" constraint.
 * Restricting the task to finish on a {@link Gnt.model.Task#ConstraintDate specified date}.
 *
 * The constraint cannot be used for a summary task.
 */
Ext.define('Gnt.constraint.MustFinishOn', {
    extend      : 'Gnt.constraint.BaseEndDate',

    alias       : 'gntconstraint.mustfinishon',

    singleton   : true,

    isInflexibleConstraint : true,

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     *      - "name" : "Must finish on",
     *      - "Move the task to finish on {0}" : "Move the task to finish on {0}"
     */

    isApplicable : function (task) {
        return task.get('leaf');
    },


    isSatisfied : function (task, date) {
        var endDate = task.getEndDate();

        date = date || task.getConstraintDate();

        return !date || !endDate || (endDate.valueOf() == date.valueOf());
    },


    getResolutionOptions : function (callback, task, date) {
        var me          = this,
            resolutions = me.callParent(arguments);

        // Support of the "old" constraints mode:
        // If constrainst are not used for tasks scheduling we show an option to fix
        // the task position by putting it to the constraint date manually
        var store                 = task.getTaskStore(true),
            scheduleByConstraints = store && store.scheduleByConstraints;

        if (!scheduleByConstraints) {
            date = date || task.getConstraintDate();

            resolutions.push({
                id      : 'move-task',
                title   : me.L("Move the task to finish on {0}"),
                resolve : function () {
                    task.setEndDateWithoutPropagation(date, true);
                    callback();
                }
            });
        }

        return resolutions;
    },

    getRemoveConstraintResolutionOption : function (callback, task, date) {
        var result = this.callParent(arguments);
        result.getTitleValues = function () { return [ task.getEndDate() ]; };
        return result;
    },

    getRestrictions : function (task) {
        return this.hasThisConstraintApplied(task) && { endDate : task.getConstraintDate() };
    }
});
