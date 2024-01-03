/**
 * @class Gnt.column.Dependency
 * @private
 *
 * An internal private class serving as base class for {@link Gnt.column.Predecessor} and {@link Gnt.column.Successor} column classes.
*/
Ext.define("Gnt.column.Dependency", {
    extend             : "Ext.grid.column.Column",

    requires           : [
        'Gnt.field.Dependency'
    ],

    isDependencyColumn : true,

    separator          : ';',
    type               : 'predecessors',        // Or 'successors'

    // Reference to the field used by the Editor
    field              : null,

    /**
     * @cfg {Boolean} useSequenceNumber Set to `true` to use auto-generated sequential identifiers
     * to reference other tasks (see {@link Gnt.model.Task#getSequenceNumber} for definition).
     * If value is `false`then the "real" id (that is stored in the database) will be used.
     */
    useSequenceNumber : false,

    constructor : function (config) {
        config      = config || {};

        var field   = config.editor;

        delete config.editor;

        Ext.apply(this, config);

        config.editor   = field || Ext.create('Gnt.field.Dependency', {
            type              : this.type,
            separator         : this.separator,
            useSequenceNumber : this.useSequenceNumber
        });

        if (!(config.editor instanceof Gnt.field.Dependency)) {
            config.editor = Ext.ComponentManager.create(config.editor, 'dependencyfield');
        }

        config.field = config.editor;

        this.scope      = this;

        this.callParent([ config ]);

    },

    afterRender : function() {
        var panel = this.up('ganttpanel');

        // Make top Gantt panel aware of the need for refreshing locked grid after changes in the dependency store
        panel.registerLockedDependencyListeners();

        this.callParent(arguments);
    },

    getContainingPanel : function() {
        if (!this.panel) {
            this.panel = this.up('tablepanel');
        }

        return this.panel;
    },

    setDirtyClass : function (meta, task) {
        var view    = this.getContainingPanel().getView();
        if (view.markDirty && this.field.isDirty(task)) {
            meta.tdCls   = view.dirtyCls;
        }
    },

    /**
     * @protected
     * Gantt panel is aware of this method and uses it (if the method is presented)
     * to check if corresponding column is editable.
     * @param  {Gnt.model.Task}  task Task about to being edited
     * @return {Boolean}      Return false to prevent editing
     */
    isEditable : function (task) {
        var panel   = this.gantt || this.up('ganttpanel');

        if (task.isProject) return false;

        return !task.isProject && (panel && panel.allowParentTaskDependencies || task.isLeaf());
    },

    /**
     * Return dependencies to be copied to memory, only works with 'raw' format
     * @param {Gnt.model.Task} task Task being copied
     * @return {Object[]}
     */
    getRawData : function (task) {
        var dependencies;

        if (this.type === 'predecessors') {
            dependencies = task.getIncomingDependencies(true);
        } else {
            dependencies = task.getOutgoingDependencies(true);
        }

        return Ext.Array.map(dependencies, function (dependency) {
            var data = dependency.copy(null).data;
            delete data[dependency.idProperty];

            return data;
        });
    },

    renderer    : function (value, meta, task) {
        if (!task.isEditable(this.dataIndex) || !this.isEditable(task)) {
            meta.tdCls      = (meta.tdCls || '') + ' sch-column-readonly';
        } else {
            this.setDirtyClass(meta, task);
        }

        return this.field.getFieldDisplayValue(task);
    }
});
