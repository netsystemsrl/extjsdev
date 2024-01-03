/**
 * A specialized field for editing the task start date value. This class inherits from the Ext.form.field.Date field
 * so any of its configuration options can be used. You can find this field in {@link Gnt.widget.TaskForm}
 * and in {@link Gnt.column.StartDate} but you can use it in your own components as well (see "Using field standalone" below).
 *
 * This field requires to be bound to {@link Gnt.model.Task task} instance, which is used for date value processing
 * (calendars, holidays etc).
 *
 * ## Task interacting
 *
 * By default the field instantly applies all changes to the {@link #task bound task}. This can be turned off with the {@link #instantUpdate} option.
 *
 * ## Using field standalone
 *
 * To use this field standalone you have to provide {@link Gnt.model.Task task} instance to it. You can make it by two ways:
 *
 * - Set the {@link #task} configuration option at field constructing step. Like this:
 *
 * ```javascript
 * var startDateField = Ext.create('Gnt.field.StartDate', {
 *     task : someTask
 * });
 * ```
 * - Or by calling {@link #setTask} method after field was created. Like this:
 *
 * ```javascript
 * startDateField.setTask(someTask);
 * ```
 *
 * **Note:** If task does not belong to any {@link Gnt.data.TaskStore} you also **have to** specify {@link #taskStore} config option for this field otherwise it won't work:
 *
 * ```javascript
 * // some tasks are not inserted in the task store yet
 * var someTask = new Gnt.model.Task({ ... });
 *
 * var startDateField = Ext.create('Gnt.field.StartDate', {
 *     task : someTask,
 *     // need to provide a task store instance in this case
 *     taskStore : taskStore
 * });
 * ```
 */
Ext.define('Gnt.field.StartDate', {
    extend : 'Gnt.field.Date',

    alias : 'widget.startdatefield',

    keepDuration : true,

    fieldProperty      : 'startDateField',
    getTaskValueMethod : 'getStartDate',
    setTaskValueMethod : 'setStartDate',

    isBaseline : false,

    valueToVisible : function (value, task) {
        var me = this;

        task = task || me.task;

        if (task) {
            var store = me.getTaskStore(task);

            if (!store || !store.disableDateAdjustments) {
                value = task.getDisplayStartDate(me.format, me.adjustMilestones, value, true, me.isBaseline);
            }
        }

        return value;
    },


    visibleToValue : function (value, task) {
        var me = this;

        task = task || me.task;

        // Special treatment of milestone task dates
        if (task && value) {
            var store = me.getTaskStore(task);

            if (!store || !store.disableDateAdjustments) {
                var isMidnight = !Ext.isDate(me.lastValue) || me.lastValue - Ext.Date.clearTime(me.lastValue, true) === 0;

                // "getDisplayStartDate" uses this condition to subtract 1 day - so here we do opposite
                if (me.adjustMilestones && task.isMilestone(me.isBaseline) && value - Ext.Date.clearTime(value, true) === 0 && isMidnight && !Ext.Date.formatContainsHourInfo(me.format)) {
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
