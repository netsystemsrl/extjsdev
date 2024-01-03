/**
 * @abstract
 */
Ext.define('Gnt.constraint.BaseStartDate', {
    extend  : 'Gnt.constraint.Base',

    getInitialConstraintDate : function(task) {
        return task.getStartDate();
    }

});
