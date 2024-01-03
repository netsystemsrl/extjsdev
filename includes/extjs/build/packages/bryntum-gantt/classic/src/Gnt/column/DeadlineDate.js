/**
 * A column representing the {@link Gnt.model.Task#DeadlineDate DeadlineDate} date field of a task.
 * The column is editable, however to enable the editing you will need to add a
 * Sch.plugin.TreeCellEditing plugin to your gantt panel.
 */
Ext.define('Gnt.column.DeadlineDate', {
    extend              : 'Ext.grid.column.Date',
    requires            : ['Gnt.field.DeadlineDate'],

    alias               : [
        'widget.deadlinecolumn',
        'widget.ganttcolumn.deadline'
    ],

    mixins              : ['Gnt.column.mixin.TaskFieldColumn'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - text : 'Deadline'
     */

    // Ext 5.1.0 sets this to false
    draggable           : true,

    fieldProperty       : 'deadlineDateField',

    editor              : 'deadlinedatefield',

    initComponent : function () {
        this.initTaskFieldColumn();

        this.callParent(arguments);
    },

    getValueToRender : function (value, meta, task) {
        return value && Ext.Date.format( this.field.valueToVisible(value, task), this.format ) || '';
    }
});
