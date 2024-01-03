/**
 * A column representing {@link Gnt.model.Task#BaselineEffort BaselineEffort} field of a task. The column is editable, however to enable the editing you will need to add a
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
 *                        xtype       : 'baselineeffortcolumn',
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
 * This column uses a field - {@link Gnt.field.BaselineEffort} which allows the
 * user to specify not only the effort value, but also the duration units.
 *
 * When rendering the name of the duration unit, the {@link Sch.util.Date#getReadableNameOfUnit}
 * method will be used to retrieve the name of the unit.
 *
 */
Ext.define('Gnt.column.BaselineEffort', {
    extend                  : 'Gnt.column.Duration',

    alias                   : [
        'widget.baselineeffortcolumn',
        'widget.ganttcolumn.baselineeffort'
    ],

    requires                : ['Gnt.field.BaselineEffort'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - text : 'Baseline Effort'
     */

    /**
     * @cfg {Number} decimalPrecision A number of digits to show after the dot when rendering the value of the field or when editing it.
     * When set to 0, the effort values containing decimals part (like "6.5 days") will be considered invalid.
     */

    fieldProperty           : 'baselineEffortField',

    editor                  : 'baselineeffortfield',

    defaultEditor           : 'baselineeffortfield',

    getValueToRender : function (value, meta, task) {
        if (!Ext.isNumber(value)) return '';

        return this.field.valueToVisible(value, task.getEffortUnit());
    },

    putRawData : function (data, task) {
        task.setEffort(data);
    }

});
