/**
 * @class Gnt.column.ResourceAssignment
 * @extends Ext.grid.column.Column
 * 
 * A Column showing the resource assignments of a task. To make the column editable,
 * add the {@link Sch.plugin.TreeCellEditing} plugin to your gantt panel:
 * 
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height      : 600,
 *         width       : 1000,
 * 
 *         columns         : [
 *             ...
 *             {
 *                 xtype       : 'resourceassignmentcolumn',
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
 * {@img gantt/images/resource-assignment.png 2x}
 * 
 */
Ext.define("Gnt.column.ResourceAssignment", {
    extend      : "Ext.grid.column.Column",
    alias       : [
        "widget.resourceassignmentcolumn",
        "widget.ganttcolumn.resourceassignment"
    ],
    requires    : ['Gnt.field.Assignment'],
    mixins      : ['Gnt.mixin.Localizable'],

    tdCls       : 'sch-assignment-cell',

    isResourceAssignmentColumn : true,

    /**
     * @cfg {Boolean} showUnits Set to `true` to show the assignment units (in percent). Default value is `true`.
     */
    showUnits : true,

    /**
     * @cfg {String} unitDecimalPrecision The number of decimals to show after the unit value (e.g. a value of 1 would produce [Mike 46.3%])
     */
    unitDecimalPrecision : 1,

    // Reference to the field used by the Editor
    field       : null,

    // Copied from the panel view if cells for this columns should be marked dirty
    dirtyCls    : null,

    /**
     * @cfg {Boolean} finalizeEditingOnPickerClose Set this to 'true' to finalize the cell editing after the resource picker is hidden.
     */
    finalizeEditingOnPickerClose : false,

    initComponent : function() {
        var me = this;

        me.text   = me.L('text');
        me.editor   = me.editor || {};

        if (!this.editor.isFormField) {
            me.editor   = Ext.ComponentManager.create(Ext.applyIf(me.editor, {
                returnFocusToField   : true,
                unitDecimalPrecision : me.unitDecimalPrecision,
                formatString         : '{0}' + (me.showUnits ? ' [{1}%]' : '')
            }), 'assignmentfield');
        }

        me.filter = me.filter || {
            type : 'string',
            filterFn: function(task, filterValue) {
                return Boolean(
                    Ext.Array.findBy(task.getResources(), function (resource) {
                        return resource.getName().match(new RegExp(filterValue, 'i'));
                    })
                );
            }
        };

        me.field = me.editor;

        me.callParent(arguments);

        me.scope = me;
    },

    /**
     * @template
     * @private
     */
    getTableView : function() {
        // 'tablepanel' is used just for commonality this will work for both gridpanel and treepanel
        return this.up('tablepanel').getView();
    },

    sorterFn : function (task1, task2) {
        var me    = this;
        var name1 = me.field.getFieldDisplayValue(task1),
            name2 = me.field.getFieldDisplayValue(task2);

        return name1 && (name1 > name2) ? -1 : 1;
    },

    afterRender: function() {
        var me    = this,
            view  = me.getTableView();

        // Check if the current view is configured to highlight dirty cells
        if (view.markDirty) {
            me.dirtyCls = view.dirtyCls;
        }

        me.callParent(arguments);

        // #4305
        // complete editing when the field is collapsed
        if (me.field && me.finalizeEditingOnPickerClose){
            me.field.on('collapse', function () {
                me.getTableView().setActionableMode(false);
            });
        }

        me.setSorter(Ext.Function.bind(me.sorterFn, me));
    },

    getGroupValue : function (task) {
        var resourceNames = Ext.Array.map(task.getResources(), function(resource) { return resource.getName(); });

        return resourceNames.sort().join(', ');
    },

    /**
     * Return assignment data to be saved to memory, only works with 'raw' format
     * @param {Gnt.model.Task} task Task being copied
     * @return {Gnt.model.Assignment[]}
     */
    getRawData : function (task) {
        return task.getAssignments();
    },

    /**
     * Will validate and insert previously prepared assignment data
     * @param {Gnt.model.Task[]} assignments Assignments to insert, should be valid input for store.add method
     * @param {Gnt.model.Task} task Record being populated with this data
     */
    putRawData : function (assignments, task) {
        var assignmentStore = task.getAssignmentStore();
        var toAdd           = [];
        assignmentStore.removeAssignmentsForTask(task);

        Ext.isArray(assignments) && assignments.forEach(function (assignment) {
            var assignmentData = Ext.clone(assignment.isAssignmentModel ? assignment.data : assignment);

            if (task.getResourceStore().getById(assignmentData[assignmentStore.model.prototype.resourceIdField])) {
                delete assignmentData[assignmentStore.model.prototype.idProperty];

                assignmentData[assignmentStore.model.prototype.taskIdField] = task.getId();
                toAdd.push(Ext.clone(assignmentData));
            }
        });

        assignmentStore.add(toAdd);
    },

    eraseData : function(task) {
        this.putRawData([], task);
    },

    renderer : function(value, meta, task) {
        if (this.dirtyCls && this.field.isDirty(task)) {
            meta.tdCls   = this.dirtyCls;
        }

        return this.field.getFieldDisplayValue(task);
    }
});
