/**
 * A Column showing the successors of a task. The column is editable, however to enable the editing you will need to add a
 * Sch.plugin.TreeCellEditing plugin to your gantt panel. The overall setup will look like this:
 *
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height  : 600,
 *         width   : 1000,
 *
 *         // Setup your grid columns
 *         columns : [
 *             ...
 *             {
 *                 xtype : 'successorcolumn',
 *                 width : 70
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
 *
 * This column uses a specialized field - {@link Gnt.field.Dependency} which allows the
 * user to specify multiple successors including lag. Please refer to {@link Gnt.field.Dependency}
 * documentation for the expected format when editing data in this column.
 */
Ext.define("Gnt.column.Successor", {
    extend : "Gnt.column.Dependency",

    mixins : ['Gnt.mixin.Localizable'],

    alias : [
        "widget.successorcolumn",
        "widget.ganttcolumn.successor"
    ],

    isSuccessorColumn : true,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - text : 'Successors'
     */

    type : 'successors',

    constructor : function (config) {
        var me = this;

        config = config || {};

        me.text = config.text || me.L('text');

        me.filter = me.filter || {
            type : 'string',
            filterFn: function(task, filterValue) {
                return Boolean(
                    Ext.Array.findBy(task.successors, function (successorDependency) {
                        var successor = successorDependency.getTargetTask();

                        return successor && filterValue == (me.useSequenceNumber ? successor.getSequenceNumber() : successor.id);
                    })
                );
            }
        };

        me.callParent(arguments);
    },

    /**
     * Will validate and insert previously prepared predecessors data
     * @param {Object[]} data Data to insert, should be valid input for store.add method
     * @param {Gnt.model.Task} task Record being populated with this data
     */
    putRawData : function (data, task) {
        var dependencyStore = task.getDependencyStore();
        var toAdd           = [];

        dependencyStore.remove(task.getOutgoingDependencies(true));

        Ext.isArray(data) && Ext.Array.each(data, function (item) {
            // check if source task exists
            if (task.getTaskStore().getById(item[dependencyStore.model.prototype.toField])) {
                var newDependency = new dependencyStore.model(item);

                newDependency.setSourceId(task.getId());

                if (dependencyStore.isValidDependency(newDependency)) {
                    toAdd.push(newDependency);
                }
            }
        });

        dependencyStore.add(toAdd);
    },

    eraseData : function(task) {
        this.putRawData([], task);
    }
});
