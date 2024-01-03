/**
 * A Column showing the {@link Gnt.model.Task#ConstraintType ConstraintType} field of a task. The column is editable when adding a
 * Sch.plugin.TreeCellEditing plugin to your Gantt panel. The overall setup will look like this:
 *
 *      var gantt = Ext.create('Gnt.panel.Gantt', {
 *           height      : 600,
 *           width       : 1000,
 *
 *           columns         : [
 *               ...
 *               {
 *                   xtype       : 'constrainttypecolumn',
 *                   width       : 80
 *               }
 *               ...
 *           ],
 *
 *           plugins             : [
 *               Ext.create('Sch.plugin.TreeCellEditing', {
 *                   clicksToEdit: 1
 *               })
 *           ],
 *           ...
 *       })
 *
 */
Ext.define("Gnt.column.ConstraintType", {
    extend              : "Ext.grid.column.Column",

    requires            : ['Gnt.field.ConstraintType'],
    mixins              : ['Gnt.column.mixin.TaskFieldColumn'],

    alias               : [
        'widget.constrainttypecolumn',
        'widget.ganttcolumn.constrainttype'
    ],

    /**
     * @cfg {Object} l10n A object, purposed for the class localization.
     * @cfg {String} l10n.text Column title
     */

    /**
     * @cfg {Number} width The width of the column.
     */
    width               : 100,

    /**
     * @cfg {String} align The alignment of the text in the column.
     */
    align               : 'left',

    /**
     * @cfg {Array} data The to pass to Constraint Type field to be created in case the column is not configured with one already.
     * @cfg {String} data[][0] Valid constraint type
     * @cfg {String} data[][1] Constraint name
     */
    data                : null,

    // Need to properly obtain the data index if none is given
    fieldProperty       : 'constraintTypeField',

    editor              : 'constrainttypefield',

    defaultEditor       : 'constrainttypefield',

    initComponent : function () {
        this.initTaskFieldColumn({
            store         : this.data,
            fieldProperty : this.fieldProperty
        });

        this.callParent(arguments);
    },

    getValueToRender : function (value, meta, task) {
        return value && this.field.valueToVisible(value, task) || '';
    },

    putRawData : function (data, task) {
        task.setConstraintType(data);
    }
});
