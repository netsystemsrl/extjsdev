/**
 * A Column representing the {@link Gnt.model.Task#PercentDone PercentDone} field of the task. The column is editable when adding a
 * Sch.plugin.TreeCellEditing plugin to your Gantt panel. The overall setup will look like this:
 *
 * ```javascript
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height  : 600,
 *         width   : 1000,
 *
 *         columns : [
 *             ...
 *             {
 *                 xtype : 'percentdonecolumn',
 *                 width : 80
 *             }
 *             ...
 *         ],
 *
 *         plugins : [
 *             Ext.create('Sch.plugin.TreeCellEditing', {
 *                 clicksToEdit : 1
 *             })
 *         ],
 *         ...
 *     })
 * ```
 */
Ext.define("Gnt.column.PercentDone", {
    extend             : "Ext.grid.column.Number",

    requires           : ['Gnt.field.PercentDone'],

    alias              : [
        "widget.percentdonecolumn",
        "widget.ganttcolumn.percentdone"
    ],

    mixins             : ['Gnt.column.mixin.TaskFieldColumn'],

    width              : 90,
    format             : '##0.##',
    align              : 'center',

    editor             : 'percentdonefield',

    defaultEditor      : 'percentdonefield',

    fieldProperty      : 'percentDoneField',
    useRenderer        : false,

    fieldConfigs       : 'instantUpdate,fieldProperty,decimalPrecision',

    /**
     * @cfg {Number} decimalPrecision The maximum precision to display after the decimal separator. The config value is used by the column editor.
     */
    decimalPrecision   : 2,

    initComponent : function () {
        this.initTaskFieldColumn();

        this.callParent(arguments);
    },

    putRawData : function (data, task) {
        task.setPercentDone(data);
    }
});
