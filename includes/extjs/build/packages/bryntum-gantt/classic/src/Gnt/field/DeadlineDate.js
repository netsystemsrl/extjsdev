/**
 * A specialized field for editing the task deadline date value. This class inherits from the Ext.form.field.Date field
 * and any of its configuration options can be used.
 *
 * This field must be bound to a {@link Gnt.model.Task task} instance, which is used for date value processing
 * (calendars, holidays etc).
 *
 * #Using field standalone
 *
 * Please refer to {@link Gnt.field.StartDate} for details.
 */
Ext.define('Gnt.field.DeadlineDate', {
    extend              : 'Gnt.field.Date',
    requires            : ['Sch.util.Date'],
    alias               : 'widget.deadlinedatefield',

    fieldProperty       : 'deadlineDateField',
    getTaskValueMethod  : 'getDeadlineDate',
    setTaskValueMethod  : 'setDeadlineDate',

    valueToVisible : function (value, task) {
        var me = this;

        task = task || me.task;

        if (value && task) {
            var store = me.getTaskStore(task);

            if (!store || !store.disableDateAdjustments) {
                value = task.getDisplayEndDate(me.format, true, value, true);
            }
        }

        return value;
    },

    visibleToValue : function (value, task) {
        var me = this;

        task = task || me.task;

        if (value && task) {
            var store = me.getTaskStore(task);

            if (!store || !store.disableDateAdjustments) {
                if (value - Ext.Date.clearTime(value, true) === 0) {
                    value = Sch.util.Date.add(value, Sch.util.Date.DAY, 1);
                }
            }
        }

        return value;
    },

    onSetTask : function (task) {
        var picker = this.getPicker();

        picker.calendar = task.getCalendar();

        this.callParent(arguments);
    }
});
