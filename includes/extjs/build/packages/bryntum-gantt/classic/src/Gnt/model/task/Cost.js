/**
 @class Gnt.model.task.Cost
 @mixin

 Internal mixin class providing task specific cost related logic and functionality belonging to the Task model class.
 */
Ext.define('Gnt.model.task.Cost', {

    recalculateCost : function () {
        var me = this;

        if (!me.autoCalculateCost)
            return false;

        me.beginEdit();
        me.setActualCost(me.calculateActualCost());
        me.setCost(me.calculateCost());
        me.endEdit();

        return true;
    },

    calculateActualCost : function () {
        var effort       = this.getEffort(),
            actualEffort = this.getActualEffort(),
            result       = 0;

        // no effort -> no cost
        if (effort) {
            // Actual Cost = (Actual Work * Standard Rate) + Resource Per Use Costs
            // Since we don't have "ActualEffort" on the resource level we use here task ActualEffort/Effort (which is "PercentDone/100" strictly speaking)
            result = this.calculateResourcesCost(true) * actualEffort/effort + this.calculateResourcesPerUseCost();
        }

        return result;
    },

    /**
     * @method getCostVariance
     * Returns the cost variance of this task.
     * This is the calculated value of the `Cost` minus the `BaselineCost` value.
     * @return {Number} The cost variance of this task
     */

    calculateCostVariance : function () {
        return this.getCost() - this.getBaselineCost();
    },

    // NOTE: "Cost" depends on "ActualCost", "Effort" and "ActualEffort" fields
    calculateCost : function () {

        var me     = this,
            effort = me.getEffort(),
            result = 0;

        if (effort) {
            var actualEffort = this.getActualEffort(),
                actualCost   = this.getActualCost();

            // Cost = Actual Cost + Remaining Cost
            var remainingEffort = effort - actualEffort,
                // we don't add "Resources Per Use Costs" to the remaining cost
                // if the task has "actualCost" ..assuming that Per Use Costs are already included
                remainingCost = me.calculateResourcesCost(!!actualCost) * remainingEffort/effort;

            result = actualCost + remainingCost;
        }

        return result;
    },

    /**
     * Set the cost baseline for the task.
     * @param number The cost baseline value
     * @returns {boolean}
     */
    setBaselineCost : function (number) {
        var me = this;

        me.beginEdit();
        me.set(me.baselineCostField, number);
        me.setCostVariance(me.calculateCostVariance());
        me.endEdit();

        return true;
    },


    /**
     * @method getActualCost
     * Returns the current cost of the task based on its assignments and % completion.
     * This field is calculated based on assigned resources costs and the actual current effort of the task (`ActualEffort` field).
     * @return {Number} The actual cost for this task
     */

    /**
     * @method getCost
     * Returns the cost of this task.
     * This value is either calculated (if {@link #autoCalculateCost} is enabled) as {@link #getActualCost actual cost} plus remaining cost or {@link #setCost provided manually}.
     * @return {Number} The cost of this task
     */


    /**
     * Set the cost of the task.
     * Don't use this when {@link Gnt.model.Task#autoCalculateCost autoCalculateCost} is `true` otherwise the provided value will get overriden.
     * @param number The cost value
     * @returns {boolean}
     */
    setCost : function (number) {
        var me = this;
        me.beginEdit();
        me.set(me.costField, number);
        me.setCostVariance(me.calculateCostVariance());
        me.endEdit();

        return true;
    },


    calculateResourcesCost : function (excludePerUseCost) {
        var result = 0,
            effort = this.getEffort();

        // if no effort to do -> cost is zero
        if (effort) {
            var assignments = this.getAssignments(),
                cost        = 0,
                perUseCost  = 0;

            for (var i = 0; i < assignments.length; i++) {
                var assignment = assignments[i],
                    resource   = assignment.getResource();

                if (resource && assignment.getTask()) {
                    cost       += assignment.getCost();
                    perUseCost += resource.getPerUseCost();
                }
            }

            result = cost;

            if (!excludePerUseCost) result += perUseCost;
        }

        return result;
    },


    calculateResourcesPerUseCost : function () {
        var assignments = this.getAssignments(),
            result      = 0;

        for (var i = 0; i < assignments.length; i++) {

            var resource = assignments[i].getResource();

            if (resource)
                result += resource.getPerUseCost();

        }

        return result;
    }

});