/**
 * A Column representing {@link Gnt.model.Task#Cost Cost} field of a task. The column is editable when {@link Gnt.model.Task#autoCalculateCost autoCalculateCost} is set to `false`, however to enable the editing you will need to add a
 * Sch.plugin.TreeCellEditing plugin to your gantt panel. The overall setup will look like this:
 *
 * ```javascript
 *        var gantt = Ext.create('Gnt.panel.Gantt', {
 *            height  : 600,
 *            width   : 1000,
 *
 *            // Setup your grid columns
 *            columns : [
 *                ...
 *                {
 *                    xtype : 'costcolumn',
 *                    width : 70
 *                }
 *                ...
 *            ],
 *
 *            plugins : [
 *                Ext.create('Sch.plugin.TreeCellEditing', {
 *                    clicksToEdit : 1
 *                })
 *            ],
 *            ...
 *        })
 * ```
 *
 * This column uses a field - {@link Gnt.field.Cost} which allows the
 * user to specify the cost value.
 */
Ext.define('Gnt.column.Cost', {
    extend                  : 'Ext.grid.column.Column',

    alias                   : [
        'widget.costcolumn',
        'widget.ganttcolumn.cost'
    ],

    requires                : ['Gnt.field.Cost'],

    mixins                  : ['Gnt.column.mixin.TaskFieldColumn'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     *  - text : 'Cost'
     *
     */

    /**
     * @cfg {Number} width The width of the column.
     */
    width                   : 80,

    /**
     * @cfg {String} align The alignment of the text in the column.
     */
    align                   : 'left',

    decimalPrecision        : 2,

    instantUpdate           : true,

    fieldProperty           : 'costField',

    fieldConfigs            : [ 'instantUpdate', 'decimalPrecision', 'currencySymbol', 'currencySymbolAlign', 'fieldProperty' ],

    /**
     * @cfg {String} currencySymbol The currency to set on display. By default the value is taken from the associated field locale.
     */
    currencySymbol          : null,

    /**
     * @cfg {String} currencySymbolAlign The currency symbol align. Defines where the symbol should be rendered.
     * Possible options are:
     *
     *  - 'left' - left to the value,
     *  - 'right' - right to the value.
     *
     * By default the value is taken from the associated field locale.
     */
    currencySymbolAlign     : null,

    editor                  : 'costfield',
    defaultEditor           : 'costfield',

    editorConfig            : null,

    initComponent : function () {
        this.initTaskFieldColumn(this.editorConfig);

        this.callParent(arguments);
    },

    getValueToRender : function (value, meta, task) {
        return this.field.valueToVisible(value);
    },

    putRawData : function (data, task) {
        task.set(task[this.fieldProperty], data);
    }
});
