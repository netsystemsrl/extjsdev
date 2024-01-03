/**
 * A column showing the {@link Gnt.model.Task#Note Note} field of the task.
 *
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height      : 600,
 *         width       : 1000,
 *
 *         columns         : [
 *             ...
 *             {
 *                 xtype       : 'notecolumn',
 *                 width       : 80
 *             }
 *             ...
 *         ],
 *
 *         plugins             : [
 *             Ext.create('Sch.plugin.TreeCellEditing', {
 *                 clicksToEdit: 1
 *             })
 *         ],
 *         ...
 *     })
 *
 */
Ext.define("Gnt.column.Note", {
    extend              : "Ext.grid.column.Column",

    requires            : ['Gnt.field.Note'],

    mixins              : ['Gnt.column.mixin.TaskFieldColumn'],

    alias               : [
        "widget.notecolumn",
        "widget.ganttcolumn.note"
    ],

    editor              : 'notefield',

    defaultEditor       : 'notefield',

    fieldProperty       : 'noteField',

    previewFn           : null,
    previewFnScope      : null,
    htmlEncode          : true,

    fieldConfigs        : [ 'instantUpdate', 'previewFn', 'previewFnScope', 'fieldProperty' ],

    initComponent : function () {
        this.initTaskFieldColumn();

        this.callParent(arguments);
    }
});
