/**
 * A specialized field for editing the task end date value. This class inherits from the Ext.form.field.Date field
 * and any of its configuration options can be used. You can find this field used in the {@link Gnt.widget.TaskForm}
 * and in the {@link Gnt.column.StartDate} classes but you can also use it in your own components.
 * See "Using field standalone" in the documentation of {@link Gnt.field.StartDate}.
 *
 * This field must be bound to a {@link Gnt.model.Task task} instance, which is used for date value processing
 * (calendars, holidays etc).
 *
 * #Task interaction
 *
 * By default the field instantly applies all changes to the bound task. This can be turned off with the {@link #instantUpdate} option.
 *
 * #Using field standalone
 *
 * Please refer to {@link Gnt.field.StartDate} for details.
 */
Ext.define('Gnt.field.EndDate', {
    extend : 'Gnt.field.Date',

    alias : 'widget.enddatefield',

    requires : ['Sch.util.Date'],

    fieldProperty      : 'endDateField',
    getTaskValueMethod : 'getEndDate',
    setTaskValueMethod : 'setEndDate',

    /**
     * @cfg {Boolean} validateStartDate When set to `true`, the field will validate a "startDate <= endDate" condition and will not allow user to save invalid value.
     * Set it to `false` if you use different validation mechanism.
     */
    validateStartDate : true,

    isBaseline : false,

    valueToVisible : function (value, task) {
        var me = this;

        task = task || me.task;

        if (task) {
            var store = me.getTaskStore(task);

            if (!store || !store.disableDateAdjustments) {
                value = task.getDisplayEndDate(me.format, me.adjustMilestones, value, true, me.isBaseline);
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
                // "getDisplayEndDate" uses this condition to subtract 1 day - so here we do opposite
                if ((!task.isMilestone(me.isBaseline) || me.adjustMilestones) && value - Ext.Date.clearTime(value, true) === 0 && !Ext.Date.formatContainsHourInfo(me.format)) {
                    value = Sch.util.Date.add(value, Sch.util.Date.DAY, 1);
                }
            }

        } else {
            value = null;
        }

        return value;
    },


    isValidAgainstStartDate : function (value) {
        var task = this.task;

        return !task || !value || (!task.getDuration() ? value >= task.getStartDate() : value > task.getStartDate());
    },


    // @OVERRIDE
    getErrors : function (value) {
        var errors = this.callParent(arguments);

        if (errors && errors.length) {
            return errors;
        }

        if (this.validateStartDate) {
            if (!this.isValidAgainstStartDate(this.rawToValue(value))) {
                return [this.L('endBeforeStartText')];
            }
        }

        return [];
    },

    onSetTask : function (task) {
        var picker = this.getPicker();

        picker.calendar = task.getCalendar();

        this.callParent(arguments);
    }
});
