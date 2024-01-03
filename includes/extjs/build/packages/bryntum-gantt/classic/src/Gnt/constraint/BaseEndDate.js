/**
 * @abstract
 */
Ext.define('Gnt.constraint.BaseEndDate', {
    extend   : 'Gnt.constraint.Base',

    requires : [
        'Ext.Date',
        'Sch.util.Date'
    ],

    getDisplayableConstraintDateForFormat : function(date, format, task) {
        var taskStore              = task.getTaskStore(true),
            disableDateAdjustments = taskStore && taskStore.disableDateAdjustments;

        if (!disableDateAdjustments && date && !Ext.Date.formatContainsHourInfo(format) && (date - Ext.Date.clearTime(date, true) === 0)) {
            date = Sch.util.Date.add(date, Sch.util.Date.DAY, -1);
        }
        return date;
    },

    adjustConstraintDateFromDisplayableWithFormat : function(date, format, task) {
        var taskStore              = task.getTaskStore(true),
            disableDateAdjustments = taskStore && taskStore.disableDateAdjustments;

        if (!disableDateAdjustments && date && !Ext.Date.formatContainsHourInfo(format) && (date - Ext.Date.clearTime(date, true) === 0)) {
            date = Sch.util.Date.add(date, Sch.util.Date.DAY, 1);
        }
        return date;
    },

    getInitialConstraintDate : function(task) {
        return task.getEndDate();
    }

});
