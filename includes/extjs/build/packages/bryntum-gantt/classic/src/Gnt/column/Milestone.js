/**
 @class Gnt.column.Milestone
 @extends Ext.grid.column.Column

 A Column showing if a task is a milestone or not.

        var gantt = Ext.create('Gnt.panel.Gantt', {
            height      : 600,
            width       : 1000,

            // Setup your static columns
            columns         : [
                ...
                {
                    xtype       : 'milestonecolumn',
                    width       : 80
                }
                ...
            ],

            plugins             : [
                Ext.create('Sch.plugin.TreeCellEditing', {
                    clicksToEdit: 1
                })
            ],
            ...
        });


 */
Ext.define('Gnt.column.Milestone', {
    extend              : 'Ext.grid.column.Column',
    alias               : [
        'widget.milestonecolumn',
        'widget.ganttcolumn.milestone'
    ],

    requires            : ['Gnt.field.Milestone'],
    mixins              : ['Gnt.column.mixin.TaskFieldColumn'],

    isMilestoneColumn   : true,

    width               : 50,
    align               : 'center',

    editor              : 'milestonefield',

    defaultEditor       : 'milestonefield',

    initComponent : function () {
        this.initTaskFieldColumn();

        this.callParent(arguments);
    },

    getValueToRender : function (value, meta, task) {
        return this.field.valueToVisible(task.isMilestone());
    },

    applyColumnCls : function (value, meta, task) {
        // There's no milestone field that we can use, so we check if both fields that can set task to be a milestone
        // are not editable
        if (!task.isEditable(task.durationField) && !task.isEditable(task.endDateField)) {
            meta.tdCls      = (meta.tdCls || '') + ' sch-column-readonly';
        }
    },

    getRawData : function (record) {
        return record.isMilestone();
    },

    putRawData : function (value, record) {
        record[value ? 'convertToMilestone' : 'convertToRegular']();
    }
});
