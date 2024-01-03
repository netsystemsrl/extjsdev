/**
 * @class Gnt.column.ActualCost
 *
 * A Column representing the {@link Gnt.model.Task#ActualCost ActualCost} field of a task. The column is editable when {@link Gnt.model.Task#autoCalculateCost autoCalculateCost} is set to `false`, however to enable the editing you will need to add a
 * {@link Sch.plugin.TreeCellEditing} plugin to your gantt panel. The overall setup will look like this:
 *
 * ```javascript
 *         var gantt = Ext.create('Gnt.panel.Gantt', {
 *                height  : 600,
 *                width   : 1000,
 *
 *                // Setup your grid columns
 *                columns : [
 *                    ...
 *                    {
 *                        xtype : 'actualcostcolumn',
 *                        width : 70
 *                    }
 *                    ...
 *                ],
 *
 *                plugins : [
 *                    Ext.create('Sch.plugin.TreeCellEditing', {
 *                        clicksToEdit : 1
 *                    })
 *                ],
 *                ...
 *         })
 * ```
 *
 * This column internally uses a field - {@link Gnt.field.ActualCost} which allows the
 * user to specify the actual cost value.
 */
Ext.define('Gnt.column.ActualCost', {
    extend                  : 'Gnt.column.Cost',

    alias                   : [
        'widget.actualcostcolumn',
        'widget.ganttcolumn.actualcost'
    ],

    requires                : ['Gnt.field.ActualCost'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     *  - text : 'Actual Cost'
     *
     */

    fieldProperty           : 'actualCostField',

    editor                  : 'actualcostfield',

    defaultEditor           : 'actualcostfield'

});
