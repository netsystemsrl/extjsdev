/**
 * A column displaying a task {@link Gnt.modelTask#ConstraintDate ConstraintDate} field. The column is editable when adding a
 * Sch.plugin.TreeCellEditing plugin to your Gantt panel. The overall setup will look like this:
 *
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height  : 600,
 *         width   : 1000,
 *
 *         columns : [
 *             ...
 *             {
 *                 xtype : 'constraintdatecolumn',
 *                 width : 80
 *             }
 *             ...
 *         ],
 *
 *         plugins : [
 *             // add Sch.plugin.TreeCellEditing plugin
 *             {
 *                 ptype        : 'scheduler_treecellediting'
 *                 clicksToEdit : 1
 *             }
 *         ],
 *         ...
 *     })
 *
 * Note that this class inherits from {@link Ext.grid.column.Date} and supports its configuration options, notably the "format".
*/
Ext.define('Gnt.column.ConstraintDate', {
    extend              : 'Ext.grid.column.Date',

    alias               : [
        'widget.constraintdatecolumn',
        'widget.ganttcolumn.constraintdate'
    ],

    requires            : ['Gnt.field.ConstraintDate'],
    mixins              : ['Gnt.column.mixin.TaskFieldColumn'],

    /**
     * @cfg {Object} l10n A object, purposed for the class localization.
     * @cfg {String} l10n.text The text to show in the column header
     */

    /**
     * @cfg {Number} width The width of the column.
     */
    width               : 100,

    /**
     * @cfg {String} align The alignment of the text in the column.
     */
    align               : 'left',

    // Need to properly obtain the data index if none is given
    fieldProperty       : 'constraintDateField',

    editor              : 'constraintdatefield',

    defaultEditor       : 'constraintdatefield',

    initComponent : function () {
        this.format = this.format || this.L('format');

        this.initTaskFieldColumn({
            format        : this.editorFormat || this.format,
            fieldProperty : this.fieldProperty
        });

        this.callParent(arguments);
    },

    getValueToRender : function (value, meta, task) {
        return value && Ext.Date.format(this.field.valueToVisible(value, task), this.format) || '';
    },

    putRawData : function (data, task) {
        task.setConstraintDate(data);
    }
});
