/**
 * Class implementing "Must start on" constraint.
 * Restricting the task to start on a {@link Gnt.model.Task#ConstraintDate specified date}.
 *
 * The constraint cannot be used for a summary task.
 */
Ext.define('Gnt.constraint.MustStartOn', {
    extend  : 'Gnt.constraint.BaseStartDate',

    alias       : 'gntconstraint.muststarton',

    singleton   : true,

    requires    : ['Sch.util.Date'],

    isInflexibleConstraint : true,

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     *      - "name" : "Must start on",
     *      - "Move the task to start at {0}" : "Move the task to start at {0}"
     */

    isApplicable : function (task) {
        return task.get('leaf');
    },


    isSatisfied : function (task, date) {
        var startDate = task.getStartDate();

        date = date || task.getConstraintDate();

        // read the following as: !date || !startDate || (startDate.valueOf() == date.valueOf())
        return !date || !startDate || (startDate.valueOf() == date.valueOf());
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
                title   : me.L("Move the task to start at {0}"),
                resolve : function () {
                    task.setStartDateWithoutPropagation(date, true);
                    callback();
                }
            });
        }
        return resolutions;
    },

    getRemoveConstraintResolutionOption : function (callback, task, date) {
        var result = this.callParent(arguments);
        result.getTitleValues = function () { return [ task.getStartDate() ]; };
        return result;
    },

    getRestrictions : function (task) {
        return this.hasThisConstraintApplied(task) && { startDate : task.getConstraintDate() };
    }
});
