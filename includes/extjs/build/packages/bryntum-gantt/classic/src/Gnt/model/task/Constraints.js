/**

@class Gnt.model.task.Constraints
@mixin
@protected

Internal mixin class providing additional logic and functionality related to task constraints.

*/
Ext.define('Gnt.model.task.Constraints', {

    requires : [
        'Gnt.constraint.Base',
        'Gnt.constraint.AsLateAsPossible',
        'Gnt.constraint.AsSoonAsPossible',
        'Gnt.constraint.StartNoEarlierThan',
        'Gnt.constraint.StartNoLaterThan',
        'Gnt.constraint.FinishNoEarlierThan',
        'Gnt.constraint.FinishNoLaterThan',
        'Gnt.constraint.MustStartOn',
        'Gnt.constraint.MustFinishOn',
        'Gnt.constraint.implicit.Dependency',
        'Gnt.constraint.implicit.PotentialConflict'
    ],

    // Checks if the task constraint is not applicable for the task
    // (some constraints are meant to be used for leaf nodes only for example)
    resetConstraintIfNotApplicable : function () {
        var constraint = this.getConstraintClass();
        if (constraint && !constraint.isApplicable(this)) {
            this.beginEdit();
            this.set(this.constraintTypeField, '');
            this.set(this.constraintDateField);
            this.endEdit();
        }
    },

    /**
     * @propagating
     * Sets the constraint type and constraining date (if applicable) to the task.
     *
     * @param {String} type
     *  Constraint type, see {@link #setConstraintType} for further description.
     * @param {Date}   date
     *  Constraint date
     * @param {Function} [callback] Callback to call after constraint application and constraint conflict resolution
     *  if any.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for cancelling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setConstraint : function (type, date, callback) {
        var me = this;

        me.propagateChanges(function () {
            return me.setConstraintWithoutPropagation(type, date);
        }, callback);
    },

    setConstraintWithoutPropagation : function (type, date, skipRescheduling) {
        var me                    = this,
            taskStore             = me.getTaskStore(true),
            scheduleByConstraints = taskStore && taskStore.scheduleByConstraints,
            constraint;

        if (type) {
            constraint = Gnt.constraint.Base.getConstraintClass(type);
        }

        if (!date && constraint) {
            date = constraint.getInitialConstraintDate(me, date);
        }

        me.beginEdit();
        me.set(me.constraintTypeField, type || '');
        me.set(me.constraintDateField, date);

        // If we have to schedule based on constraints data we need to reset early/late dates cache
        if (scheduleByConstraints) {
            // reset early/late dates cache
            taskStore.resetEarlyDates();
            taskStore.resetLateDates();
            if (!skipRescheduling) me.scheduleWithoutPropagation();
        }

        me.endEdit();

        return true;
    },

    /**
     * @propagating
     * Sets the constraint type of the task. The type string can be one of the following values:
     *
     *  - "startnoearlierthan"
     *  - "startnolaterthan"
     *  - "muststarton"
     *  - "finishnoearlierthan"
     *  - "finishnolaterthan"
     *  - "mustfinishon"
     *  - "assoonaspossible"
     *  - "aslateaspossible"
     *
     * @param {String} type
     *  Constraint type
     * @param {Function} [callback] Callback to call after constraint application and constraint conflict resolution
     *  if any.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setConstraintType : function (type, callback) {
        this.setConstraint(type, this.getConstraintDate(), callback);
    },


    setConstraintTypeWithoutPropagation : function (type) {
        this.setConstraintWithoutPropagation(type, this.getConstraintDate());
    },


    /**
     * @propagating
     * Sets the constraint date of the task.
     *
     * @param {Date}   date
     *  Constraint date
     * @param {Function} [callback] Callback to call after constraint application and constraint conflict resolution
     *  if any.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setConstraintDate : function (date, callback) {
        this.setConstraint(this.getConstraintType(), date, callback);
    },


    setConstraintDateWithoutPropagation : function (date) {
        this.setConstraintWithoutPropagation(this.getConstraintType(), date);
    },


    /**
     * Checks whether a constraint is set for the task.
     *
     * @return {Boolean}
     */
    hasConstraint : function() {
        return !!this.getConstraintType();
    },


    /**
     * Returns a constraint singleton class corresponding to the constraint type currently set for the task.
     *
     * @return {Gnt.constraint.Base} subclass of
     */
    getConstraintClass : function() {
        return Gnt.constraint.Base.getConstraintClass(this.getConstraintType());
    },


    /**
     * Returns true if task has no constraint set or if a constraint set is satisfied by the task.
     *
     * @return {Boolean}
     */
    isConstraintSatisfied : function () {
        var me = this;

        return !me.hasConstraint() || me.getConstraintClass().isSatisfied(me, me.getConstraintDate());
    },

    getDependencyConstraintClass : function () {
        return Gnt.constraint.implicit.Dependency;
    },

    getPotentialConflictConstraintClass : function () {
        return Gnt.constraint.implicit.PotentialConflict;
    },

    isDependencyConstraintSatisfied : function () {
        var taskStore         = this.getTaskStore(true),
            checkDependencies = taskStore && taskStore.checkDependencyConstraint;

        return !checkDependencies || this.getDependencyConstraintClass().isSatisfied(this);
    },

    // Extension point to provide a custom set of constraints
    getConstraintClasses : function () {
        var constraintClass = this.getConstraintClass();
        return constraintClass ? [ constraintClass ] : [];
    },

    /**
     * Verifies the constraints of the task.
     *
     * @param {Function} [onceResolvedContinueHere] Callback function to be called after constraint conflict resolution.
     * @param {Boolean}  onceResolvedContinueHere.constraintSatisfied Flag showing whether constraint has been satisfied or violated.
     * @param {Boolean}  onceResolvedContinueHere.cancelChanges Flag showing whether a user has opted for changes to be canceled.
     * @param {Object} By id map of affected tasks
     * @return {Boolean} True if no constraint conflict has been found, false otherwise
     *
     * @private
     */
    verifyConstraints : function (onceResolvedContinueHere, affectedTasks) {
        return this.doVerifyConstraints(this.getConstraintClasses(), onceResolvedContinueHere, false, affectedTasks);
    },

    doVerifyConstraints : function (constraintClasses, onceResolvedContinueHere, useCallbackAsIs, affectedTasks) {
        var me                  = this,
            taskStore           = me.getTaskStore(true),
            hasConflictListener = taskStore && taskStore.hasListener('constraintconflict'),
            constraintDate      = me.getConstraintDate(),
            constraintSatisfied = true,
            constraintResolutionContext,
            constraintClass,
            restartCallback,
            callback;

        // <debug>
        !onceResolvedContinueHere || Ext.isFunction(onceResolvedContinueHere) ||
            Ext.Error.raise("Can't verify task's constraint, resolution callback is invalid");
        // </debug>

        if (!constraintClasses.length && onceResolvedContinueHere) {
            callback = useCallbackAsIs ? onceResolvedContinueHere : Ext.Function.pass(onceResolvedContinueHere, [true]);
        }

        for (var i = 0; i < constraintClasses.length; i++) {
            constraintClass     = constraintClasses[i];
            constraintSatisfied = false;

            if (constraintClass && constraintClass.hasThisConstraintApplied(me)) {
                constraintSatisfied = constraintClass.isSatisfied(me, constraintDate);

                // If the constraint claims it can resolve the violation w/o alerting anyone
                if (!constraintSatisfied && constraintClass.canResolve(me, constraintDate)) {
                    constraintClass.resolve(me, constraintDate);
                    constraintSatisfied = true;
                }

            } else {
                constraintSatisfied = true;
            }

            // We bind the callback to [constraintSatisfied] array as its arguments list
            // unless useCallbackAsIs flag is passed. The flag is used when we repeat verification call
            // which means the callback is already wrapped and we don't want to do it twice.
            if (onceResolvedContinueHere) {
                callback = useCallbackAsIs ? onceResolvedContinueHere : Ext.Function.pass(onceResolvedContinueHere, [constraintSatisfied]);
            }

            if (!constraintSatisfied && constraintClass) {

                // Let's make a callback that will repeat the constraints check cycle
                // after user will pick a resolution option
                restartCallback = callback && function (cancelChanges, restartVerification) {
                    // if user picked to cancel changes we don't need extra verification
                    if (cancelChanges || !restartVerification) {
                        me._doVerifyConstraintsWatcher = null;
                        callback.apply(this, arguments);
                    // if user has used some other option, let's repeat the verification cycle
                    } else if (restartVerification) {
                        me.doVerifyConstraints(me.getConstraintClasses(), callback, true, affectedTasks);
                    }
                };

                constraintResolutionContext = constraintClass.getResolution(restartCallback, me, null);
                constraintResolutionContext.affectedTasks = affectedTasks;

                // check for infinite loop
                me._doVerifyConstraintsWatcher = me._doVerifyConstraintsWatcher || {};
                // if the constraint was violated earlier - it's an infinite cycle
                // (and if there is no conflict resolution UI attached)
                if (me._doVerifyConstraintsWatcher[constraintClass.getId()] && !hasConflictListener) {
                    // let's cancel the changes
                    constraintResolutionContext.cancelAction();
                    break;
                }
                // raise a flag marking that this constraint was violated
                me._doVerifyConstraintsWatcher[constraintClass.getId()] = true;


                if (hasConflictListener) {
                    /**
                     * @event constraintconflict
                     *
                     * Fires when task constraint conflict has been found and requires a resolution.
                     *
                     * @param {Gnt.model.Task} task The task whose constraint is violated
                     * @param {Object} context Constraint resolution context
                     * @param {String} context.title The description of the
                     *
                     * @member Gnt.data.TaskStore
                     */
                    taskStore.fireEvent('constraintconflict', me, constraintResolutionContext);
                } else {
                    constraintResolutionContext.defaultAction();
                }

                break;
            }
        }

        if (constraintSatisfied) {
            me._doVerifyConstraintsWatcher = null;

            callback && callback(false);
        }

        return constraintSatisfied;
    }

});
