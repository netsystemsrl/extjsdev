/**
 * A column representing the {@link Gnt.model.Task#Name Name} field of a task. The column is editable, however to enable the editing you will need to add a
 * Sch.plugin.TreeCellEditing plugin to your Gantt panel. The overall setup will look like this:
 *
 * ```javascript
 * var gantt = Ext.create('Gnt.panel.Gantt', {
 *     height      : 600,
 *     width       : 1000,
 *
 *     // Setup your grid columns
 *     columns         : [
 *         ...
 *         {
 *             xtype       : 'namecolumn',
 *             width       : 200
 *         }
 *         ...
 *     ],
 *
 *     plugins             : [
 *         Ext.create('Sch.plugin.TreeCellEditing', {
 *             clicksToEdit: 1
 *         })
 *     ],
 *     ...
 * })
 * ```
 */
Ext.define('Gnt.column.Name', {
    extend : 'Ext.tree.Column',

    alias : [
        'widget.namecolumn',
        'widget.ganttcolumn.name'
    ],

    mixins : ['Gnt.column.mixin.TaskFieldColumn'],

    // Ext 5.1.0 sets this to false
    draggable : true,

    fieldProperty : 'nameField',

    editor        : 'textfield',
    cachedColumns : null,

    initComponent : function () {
        this.initTaskFieldColumn();

        this.callParent(arguments);
    },


    applyColumnCls : function (value, meta, task) {
        meta.tdCls = (meta.tdCls || '') + ' sch-gantt-name-cell';

        if (task.isProject) {
            meta.tdCls += ' sch-gantt-project-name';
        }

        if (!task.isLeaf()) {
            meta.tdCls += ' sch-gantt-parent-cell';
        }
    }
});
