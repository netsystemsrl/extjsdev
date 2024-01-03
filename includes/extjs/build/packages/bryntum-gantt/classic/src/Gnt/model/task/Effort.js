/**
 @class Gnt.model.task.Effort
 @mixin

 Internal mixin class providing task specific effort and work related logic and functionality belonging to the Task model class.
 */
Ext.define('Gnt.model.task.Effort', {

    calculateActualEffort : function () {
        var effort = this.get(this.effortField);
        return effort != null ? effort * this.getPercentDone() / 100 : null;
    },

    /**
     * @method getEffortVariance
     * Returns the effort variance of this task.
     * This is the calculated value of the `Effort` minus the `BaselineEffort` value.
     * @return {Number} The effort variance of this task
     */

    calculateEffortVariance : function () {
        var effort = this.get(this.effortField);
        return effort != null ? effort - this.getBaselineEffort() : null;
    },

    /**
     * @method getBaselineEffort
     * Returns the task effort baseline (the number of {@link #getEffortUnit units}).
     * @return {Number} The task effort baseline value
     */

    /**
     * Sets the task effort baseline.
     * @param {Number}   effort   Effort baseline value
     * @param {String}   unit     Unit name the effort baseline value is provided in
     */
    setBaselineEffort : function (effort, unit) {
        var me         = this,
            effortUnit = me.getEffortUnit();

        me.beginEdit();

        me.set(me.baselineEffortField, me.getUnitConverter().convertDuration(effort, unit || effortUnit, effortUnit));
        me.setEffortVariance(me.calculateEffortVariance());
        me.endEdit();

        return true;
    },

    /**
     * @method getActualEffort
     * Returns the actual current effort (the number of {@link #getEffortUnit units}) that has been completed. This number is calculated based on `PercentDone`.
     * @return {Number} The actual current effort value
     */

    /**
     * @propagating
     * Sets the actual current effort that has been completed. Only allowed for leaf tasks.
     * Calling this method will update `PercentDone` field value accordingly.
     * @param {Number}   effort   Effort value
     * @param {String}   unit     Unit name the effort value is provided in
     * @param {Function} [callback] Callback function to call after the actual effort value has been set and possible changes among dependent tasks were propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    setActualEffort : function (effort, unit, callback) {
        var me = this;

        me.propagateChanges(
            function () {
                return me.setActualEffortWithoutPropagation(effort, unit);
            },
            callback
        );
    },

    processActualEffortValue : function (actualEffort) {
        var me     = this,
            effort = me.getEffort();

        // TODO: below logic is experimental till we find more correct one (probably after we add all the required "Work*" fields)
        // The "ActualEffort" value cannot be greater than "Effort" value
        if (actualEffort > effort) {
            // if "Effort" is not initialized and we have "PercentDone" > 0
            // let's calculate "Effort" based on the "PercentDone"
            if (!effort && me.getPercentDone()) {
                me.set(me.effortField, actualEffort * 100 / me.getPercentDone());
            // otherwise let's update "Effort" w/ "ActualEffort" value
            } else {
                me.set(me.effortField, actualEffort);
            }
            // since we've modified Effort we need to update EffortVariance accordingly
            me.setEffortVariance(me.calculateEffortVariance());
        }

        return actualEffort;
    },

    setActualEffortWithoutPropagation : function (actualEffort, unit) {
        var me         = this,
            effortUnit = me.getEffortUnit(),
            converter  = me.getUnitConverter();

        // convert value to effortUnit units
        actualEffort = converter.convertDuration(actualEffort, unit || effortUnit, effortUnit);

        me.beginEdit();

        actualEffort = me.processActualEffortValue(actualEffort);

        me.set(me.actualEffortField, actualEffort);

        var effort      = me.getEffort(),
            percentDone = effort ? Math.min(100, 100 * actualEffort/effort) : 0;

        me.set(me.percentDoneField, percentDone);

        me.recalculateCost();

        me.endEdit();

        return true;
    }

});