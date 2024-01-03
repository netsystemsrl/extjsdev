/**
 * A column showing the {@link Gnt.model.Task#ManuallyScheduled ManuallyScheduled} field of a task.
 */
Ext.define("Gnt.column.ManuallyScheduled", {
    extend              : "Ext.grid.Column",
    alias               : [
        'widget.manuallyscheduledcolumn',
        'widget.ganttcolumn.manuallyscheduledcolumn'
    ],

    requires            : ['Gnt.field.ManuallyScheduled'],

    mixins              : ['Gnt.column.mixin.TaskFieldColumn'],

    width               : 50,
    align               : 'center',

    instantUpdate       : false,

    fieldProperty       : 'manuallyScheduledField',

    editor              : 'manuallyscheduledfield',

    defaultEditor       : 'manuallyscheduledfield',

    initComponent : function () {
        this.initTaskFieldColumn();

        this.callParent(arguments);
    },

    getValueToRender : function (value, meta, task) {
        return this.field.valueToVisible(task.getManuallyScheduled());
    },

    putRawData : function (data, task) {
        task.setManuallyScheduled(data);
    }
});
