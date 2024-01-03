/**
 * Class implementing "Finish no later than" constraint.
 * Restricting the task to finish on or before a {@link Gnt.model.Task#ConstraintDate specified date}.
 */
Ext.define('Gnt.constraint.FinishNoLaterThan', {
    extend      : 'Gnt.constraint.BaseEndDate',

    alias       : 'gntconstraint.finishnolaterthan',

    singleton   : true,

    isSemiFlexibleConstraint : true,

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     *       - "name" : "Finish no later than",
     *       - "Move the task to finish on {0}" : "Move the task to finish on {0}"
     */

    isSatisfied : function (task, date) {
        var endDate = task.getEndDate();

        date = date || task.getConstraintDate();

        return !date || !endDate || endDate <= date;
    },

    getRemoveConstraintResolutionOption : function (callback, task, date) {
        var result = this.callParent(arguments);
        result.getTitleValues = function () { return [ task.getEndDate() ]; };
        return result;
    },

    getResolutionOptions : function (callback, task, date) {
        var me                    = this,
            store                 = task.getTaskStore(true),
            scheduleByConstraints = store && store.scheduleByConstraints,
            resolutions           = me.callParent(arguments);

        // Support of the "old" constraints mode:
        // If constrainst are not used for tasks scheduling we show an option to fix
        // the task position by putting it to the constraint date manually
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


    getRestrictions : function (task) {
        return this.hasThisConstraintApplied(task) && { max : { endDate : task.getConstraintDate() }};
    }
});
