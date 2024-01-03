/**
 * @abstract
 * Base class for constraints. Each task constraint should subclass this class.
 */
Ext.define('Gnt.constraint.Base', {

    requires     : ['Ext.String'],

    mixins       : ['Gnt.mixin.Localizable'],

    isConstraint : true,

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     *      - "name" : "A constraint",
     *      - "Remove the constraint" : "Remove the constraint",
     *      - "Cancel the change and do nothing" : "Cancel the change and do nothing"
     */

    getId : function () {
        var alias = this.alias && this.alias[0];

        return alias && alias.split('.')[1];
    },

    /**
     * Indicates whether the constraint is satisfied or not for the provided task.
     * @param {Gnt.model.Task} task A task to check the constraint for.
     * @param {Date} [date] The constraint date (if applicable for this type of constraint).
     * @return {Boolean} `true` if the constraint is satisfied and `false` otherwise.
     */
    isSatisfied : function (task, date) {
        throw "Abstract method";
    },

    /**
     * Indicates if the constraint is applicable for the provided task.
     * The method is used by the {@link Gnt.field.ConstraintType constraint UI field} to define which constraints should be available for certain types of tasks.
     * For example {@link Gnt.constraint.MustStartOn Must start on} and {@link Gnt.constraint.MustFinishOn Must finish on} constraints can't be used for summary tasks.
     * @param {Gnt.model.Task} task Task to check the constraint applicability for.
     * @return {Boolean} `true` if the constraint is applicable and `false` otherwise.
     */
    isApplicable : function (task) {
        return true;
    },


    getResolution : function (callback, task, date) {
        var me = this,
            called = false;

        date = date || task.getConstraintDate();

        var next = function () {
            if (!called) {
                called  = true;
                callback.apply(this, arguments);
            }
        };

        var resolution = {
            title               : me.L("name"),
            task                : task,
            date                : date,
            constraintClassName : Ext.getClassName(me),

            resolutions         : this.getResolutionOptions(next, task, date),

            getCancelActionOption : function () {
                return this.resolutions[ 0 ];
            },

            cancelAction : function () {
                return this.getCancelActionOption().resolve();
            },

            proceedAction : function () {
                next();
            },

            getResolution : function (id) {
                return Ext.Array.findBy(this.resolutions, function(item) {
                    return item.id == id;
                });
            }
        };

        // cancelAction is default (used when no user input can be provided)
        resolution.defaultAction = resolution.cancelAction;

        var store = task.getTaskStore(true);

        // If scheduling by constraints is enabled and if the task is summary and propagating
        if (store && store.scheduleByConstraints && me.hasThisConstraintApplied(task) && task.propagating && task.childNodes.length) {

            var oldConstraintType = task.getUnprojected(task.constraintTypeField),
                oldConstraintDate = task.getUnprojected(task.constraintDateField),
                newConstraintType = task.getConstraintType(),
                newConstraintDate = task.getConstraintDate();

            // ..and the initial change was of its constraint type/date
            // we consider it a case when setting of the constraint caused its violation eventually
            // after child nodes has recalculated the parent
            if ((oldConstraintType != newConstraintType) || (!oldConstraintDate && newConstraintDate) || (oldConstraintDate && !newConstraintDate) || (oldConstraintDate - newConstraintDate)) {
                resolution.description = Ext.String.format(me.L("This action will cause a scheduling conflict"), task.getName(), me.L("name"));
            }
        }

        return resolution;
    },


    getCancelResolutionOption : function (callback, task, date) {
        date = date || task.getConstraintDate();

        var me = this;

        return {
            id          : 'cancel',
            title       : me.L("Cancel the change and do nothing"),
            resolve     : function () {
                callback(true);
            }
        };
    },

    getRemoveConstraintResolutionOption : function (callback, task, date) {
        date = date || task.getConstraintDate();

        var me    = this,
            store = task.getTaskStore(true);

        return {
            id      : 'remove-constraint',
            title   : Ext.String.format(me.L("Remove the constraint"), me.L("name")),
            resolve : function () {
                task.setConstraintWithoutPropagation('');
                // if scheduling by constraints is enabled and the task got hanging w/o any reason - let's pin it
                if (store.scheduleByConstraints && (task.getEarlyStartDate() < task.getStartDate())) {
                    task.pinWithoutPropagation();
                }
                callback();
            }
        };
    },

    getResolutionOptions : function (callback, task, date) {
        date = date || task.getConstraintDate();

        var me          = this;

        var resolutions = [me.getCancelResolutionOption(callback, task, date)];

        me.hasThisConstraintApplied(task) && resolutions.push(me.getRemoveConstraintResolutionOption(callback, task, date));

        return resolutions;
    },

    /**
     * @protected
     * Indicates if the constraint is able to resolve its violation automatically without notifying a user.
     * This method works together with {@link #resolve} method. It goes like this: once the Gantt detects the constraint violation
     * it first calls {@link #canResolve} and if `true` is returned it calls {@link #resolve} method that should fix the violation.
     * @param {Gnt.model.Task} task Task the constraint violation detected on.
     * @param {Date} date The constraint date (if applicable for this type of constraint).
     * @return {Boolean} `true` if the constraint can be resolved automatically.
     */
    canResolve : function (task, date) {
        return false;
    },

    /**
     * @protected
     * Resolves the constraint violation without notifying a user. The method is called if {@link #canResolve} returns `true`.
     * @param {Gnt.model.Task} task Task the constraint violation detected on.
     * @param {Date} date The constraint date (if applicable for this type of constraint).
     */
    resolve : function (task, date) {
    },

    /**
     * Indicates if the constraint is applied for the provided task.
     * @param {Gnt.model.Task} task Task to check the constraint for.
     * @return {Boolean} `true` if the constraint is applied.
     */
    hasThisConstraintApplied : function (task) {
        return task.getConstraintClass() === this;
    },

    /**
     * @protected
     * Returns the default constraint date value to be used when a user sets the constraint on the provided task.
     * @param {Gnt.model.Task} task Task to set the constraint on.
     * @return {Date} Default constraint date value.
     */
    getInitialConstraintDate : function (task) {
        return task.getConstraintDate();
    },

    getDisplayableConstraintDateForFormat : function (date, format, task) {
        return date;
    },

    adjustConstraintDateFromDisplayableWithFormat : function (date, format, task) {
        return date;
    },

    statics : {
        /**
         * Returns constraint instance by its type, if type is null or empty string returns null
         *
         * @param {String} type Constraint type to return instance for.
         * @return {Gnt.constraint.Base/null} Constraint class singleton
         */
        getConstraintClass : function (type) {
            var result = !Ext.isEmpty(type) && Ext.ClassManager.getByAlias('gntconstraint.' + type);
            // <debug>
            // Postcondition: constraint class must exist
            Ext.isEmpty(type) || result ||
                Ext.Error.raise("Can't get constraint class, unrecognized constraint type: " + type);
            // </debug>
            return result || null;
        }
    }
});
