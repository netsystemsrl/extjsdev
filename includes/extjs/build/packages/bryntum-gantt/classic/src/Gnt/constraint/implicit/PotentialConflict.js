/**
 * A class implementing the pseudo-constraint alerting a user when setting a
 * "Start no later than", "Finish no later than", "Must start on" or "Must finish on" constraint
 * on a task having a predecessor (which might cause a conflict in the future):
 *
 * {@img gantt/images/constraint-potential-conflict.png}
 *
 * The constraint is used when {@link Gnt.data.TaskStore#checkPotentialConflictConstraint checkPotentialConflictConstraint} config is set to `true`.
 */
Ext.define('Gnt.constraint.implicit.PotentialConflict', {
    extend      : 'Gnt.constraint.Base',

    singleton   : true,

    requires    : ['Ext.String'],

    getId : function () {
        return 'potentialconflict';
    },

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     *      - 'This could result in a scheduling conflict' : 'You set a {0} constraint on the task "{1}". This could result in a scheduling conflict since the task has a predecessor.',
     *      - 'Remove the constraint'                      : 'Continue. Set the {0} constraint',
     *      - 'Replace the constraint'                     : 'Continue but avoid the conflict by using a {0} constraint instead'
     */

    isSatisfied : function (task) {
        var result = true;

        // If scheduling by constraints is enabled and if the task is summary and propagating
        if (this.hasThisConstraintApplied(task)) {

            var oldConstraintType = task.getUnprojected(task.constraintTypeField),
                newConstraintType = task.getConstraintType();

            result = !(oldConstraintType != newConstraintType && this.isConstraintTypeHandled(newConstraintType));
        }

        return result;
    },


    isConstraintTypeHandled : function (constraintType) {
        return Boolean(this.getConstraintTypeForReplacement(constraintType));
    },


    hasThisConstraintApplied : function (task) {
        var store = task.getTaskStore(true),
            scheduleBackwards = task.getProjectScheduleBackwards();

        return Boolean(store && store.scheduleByConstraints && !scheduleBackwards && task.propagating && task.getIncomingDependencies().length);
    },


    getConstraintTypeForReplacement : function (originalConstraintType) {
        var result;

        switch (originalConstraintType) {
            case 'startnolaterthan':
            case 'muststarton':
                result = 'startnoearlierthan';
                break;
            case 'finishnolaterthan':
            case 'mustfinishon':
                result = 'finishnoearlierthan';
                break;
        }

        return result;
    },


    getResolution : function (callback, task) {
        var me         = this,
            resolution = me.callParent(arguments);

        // proceedAction is default (used when no user input can be provided)
        resolution.defaultAction = resolution.proceedAction;

        if (me.hasThisConstraintApplied(task)) {

            var oldConstraintType = task.getUnprojected(task.constraintTypeField),
                newConstraintType = task.getConstraintType();

            if (oldConstraintType != newConstraintType && me.isConstraintTypeHandled(newConstraintType)) {

                var constraintName = Gnt.constraint.Base.getConstraintClass(newConstraintType).L('name'),
                    removeOption   = resolution.getResolution('remove-constraint');

                resolution.description = Ext.String.format(me.L('This could result in a scheduling conflict'), constraintName, task.getName());

                // "remove-constraint" will mean proceedAction since nothing to remove really

                Ext.apply(removeOption, {
                    title   : Ext.String.format(me.L("Remove the constraint"), constraintName),
                    resolve : resolution.proceedAction
                });

                var constraintTypeToSuggest = me.getConstraintTypeForReplacement(task.getConstraintType()),
                    constraintNameToSuggest = Gnt.constraint.Base.getConstraintClass(constraintTypeToSuggest).L('name');

                // Put replace the dangerous constraint option before the proceed option

                Ext.Array.insert(resolution.resolutions, Ext.Array.indexOf(resolution.resolutions, removeOption), [{
                    id      : 'replace-constraint',
                    title   : Ext.String.format(me.L("Replace the constraint"), constraintNameToSuggest),
                    resolve : function () {
                        task.setConstraintWithoutPropagation(constraintTypeToSuggest);
                        callback();
                    }
                }]);
            }
        }

        return resolution;
    }

});
