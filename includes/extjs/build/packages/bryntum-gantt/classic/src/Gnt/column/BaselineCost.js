/**
 * A Column representing the {@link Gnt.model.Task#BaselineCost BaselineCost} field of a task. The column is editable, however to enable the editing you will need to add a
 * Sch.plugin.TreeCellEditing plugin to your gantt panel. The overall setup will look like this:
 *
 *         var gantt = Ext.create('Gnt.panel.Gantt', {
 *                height      : 600,
 *                width       : 1000,
 *
 *                // Setup your grid columns
 *                columns         : [
 *                    ...
 *                    {
 *                        xtype       : 'baselinecostcolumn',
 *                        width       : 70
 *                    }
 *                    ...
 *                ],
 *
 *                plugins             : [
 *                    Ext.create('Sch.plugin.TreeCellEditing', {
 *                        clicksToEdit: 1
 *                    })
 *                ],
 *                ...
 *         })
 *
 * This column uses a field - {@link Gnt.field.BaselineCost} which allows the
 * user to specify the baseline cost value.
 */
Ext.define('Gnt.column.BaselineCost', {
    extend                  : 'Gnt.column.Cost',

    alias                   : [
        'widget.baselinecostcolumn',
        'widget.ganttcolumn.baselinecost'
    ],

    requires                : ['Gnt.field.BaselineCost'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - text : 'Baseline Cost'
     */

    fieldProperty           : 'baselineCostField',

    editor                  : 'baselinecostfield',

    defaultEditor           : 'baselinecostfield'

});
