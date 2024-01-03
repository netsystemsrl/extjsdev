/**
 * A specialized field for editing the task baseline end date value. This class inherits from the `Ext.form.field.Date` field
 * and any of its configuration options can be used. You can find this field used in the {@link Gnt.widget.TaskForm}
 * and in the {@link Gnt.column.BaselineStartDate} classes but you can also use it in your own components.
 */
Ext.define('Gnt.field.BaselineEndDate', {
    extend              : 'Gnt.field.EndDate',

    alias               : 'widget.baselineenddatefield',

    /**
     * @hide
     * @cfg keepDuration
     */

    fieldProperty       : 'baselineEndDateField',
    getTaskValueMethod  : 'getBaselineEndDate',
    setTaskValueMethod  : 'setBaselineEndDate',

    isBaseline          : true,

    isValidAgainstStartDate : function (value) {
        return !this.task || !value || value >= this.task.getBaselineStartDate();
    },

    applyChanges : function (toTask, silent) {
        toTask  = toTask || this.task;

        this.setTaskValue(toTask, this.value || null);

        // since we have an "applyChanges" method different from the one provided by "TaskField" mixin
        // we need to fire "taskupdated" ourself
        if (!silent) toTask.fireEvent('taskupdated', toTask, this);
    },

    onSetTask : function (task) {
        var picker = this.getPicker();

        picker.calendar = task.getCalendar();

        this.callParent(arguments);
    }

});
