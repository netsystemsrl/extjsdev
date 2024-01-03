/**
 * Class implementing "As late as possible" constraint.
 * The constraint schedules the task as late as possible.
 *
 * Please note, that this constraint is available only when {@link Gnt.data.TaskStore#scheduleByConstraints scheduleByConstraints} mode is enabled.
 */
Ext.define('Gnt.constraint.AsLateAsPossible', {
    extend      : 'Gnt.constraint.Base',

    alias       : 'gntconstraint.aslateaspossible',

    singleton   : true,

    isFlexibleConstraint : true,

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     *      - "name" : "As late as possible"
     */

    getInitialConstraintDate : function () {
        return null;
    },

    isApplicable : function (task) {
        var store                 = task.getTaskStore(true),
            scheduleByConstraints = store && store.scheduleByConstraints,
            scheduleBackwards     = task.getProjectScheduleBackwards(store);

        // This type of constraints is available for leaves when "scheduleByConstraints" mode is enabled
        return scheduleByConstraints && (task.isLeaf() || scheduleBackwards);
    },

    isSatisfied : function (task) {
        var endDate     = task.getEndDate(),
            lateEndDate = task.getLateEndDate();

        return !endDate || !lateEndDate || endDate - lateEndDate === 0;
    },

    canResolve : function (task, date) {
        return true;
    },

    resolve : function (task) {
        task.setEndDateWithoutPropagation(task.getLateEndDate());
    },

    // The constraint is flexible and does not apply some exact restricting values
    getRestrictions : function (task) {}

});
