/**
 * Helper class for asynchronous drop processing.
 *
 * @class Gnt.feature.taskdd.AsyncDropHandler
 */
Ext.define("Gnt.feature.taskdd.AsyncDropHandler", {

    $resolveFn : null,
    $rejectFn  : null,
    $processFn : null,

    $canceled : false,
    $waiting  : false,
    $done     : false,

    /**
     * @param {Function} resolve Function to call when {@link #done} method is called
     * @param {Function} reject  Function to call when {@link #cancel} method is called
     * @param {Function} process Function to call when {@link #process} method is called
     *
     * @private
     */
    constructor : function(resolve, reject, process) {
        var me = this;
        me.$resolveFn = resolve;
        me.$rejectFn  = reject;
        me.$processFn = process;
    },

    /**
     * Checks whether drop processing is in progress
     *
     * @return {Boolean}
     */
    isWaiting : function() {
        return this.$waiting;
    },

    /**
     * Call to postpone custom or default drop processing.
     *
     * If method is called then call to {@link #done} or {@link #cancel} is mandatory afterwards
     */
    wait : function() {
        this.$waiting = true;
    },

    /**
     * Checks whether drop processing has been done
     *
     * @return {Boolean}
     */
    isDone : function() {
        return this.$done;
    },

    /**
     * Call to finilize drop processing
     *
     * @param {Mixed} result Done result
     */
    done : function(result) {
        var me = this;

        if (!me.$done && !me.$canceled) {
            me.$waiting = false;
            me.$done = true;
            me.$resolveFn(result);
        }
    },

    /**
     * Checks whether drop processing has been canceled
     *
     * @return {Boolean}
     */
    isCanceled : function() {
        return this.$canceled;
    },

    /**
     * Call to cancel drop processing.
     *
     * @param {Mixed} result Cancel result
     */
    cancel : function(result) {
        var me = this;

        if (!me.$canceled && !me.$done) {
            me.$waiting = false;
            me.$canceled = true;
            me.$rejectFn(result);
        }
    },

    /**
     * Call to initiate default drop processing.
     */
    process : function() {
        return this.$processFn();
    }

});
