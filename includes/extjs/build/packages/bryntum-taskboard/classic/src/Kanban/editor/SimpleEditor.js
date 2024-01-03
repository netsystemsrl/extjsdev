/**

 @class Kanban.editor.SimpleEditor
 @extends Ext.Editor

 A textfield editor for the TaskBoard allowing you to edit the name of a task easily. By default, it reacts to the 'taskdblclick' event but you
 can configure this by using the {@link #triggerEvent} config.

 Sample usage below:

 var taskBoard = new Kanban.view.TaskBoard({
        resourceStore : resourceStore,
        taskStore     : taskStore,

        editor        : new Kanban.editor.SimpleEditor({
            dataIndex       : 'Name'
        })
    });

 */
Ext.define('Kanban.editor.SimpleEditor', {
    extend : 'Ext.Editor',

    mixins : [
        'Kanban.editor.Base'
    ],

    alias     : 'widget.kanban_simpleeditor',
    alignment : 'tl',
    autoSize  : {
        width : 'boundEl' // The width will be determined by the width of the boundEl, the height from the editor (21)
    },

    selector : '.sch-task-name',

    /**
     * @cfg {String} dataIndex The data field in your {@link Kanban.model.Task} that this being editor should be editing.
     */
    dataIndex    : 'Name',

    /**
     * @cfg {Object/Ext.form.Field} field The Ext JS form field (or config) to use for editing.
     */
    field : {
        xtype      : 'textfield',
        minWidth   : 100,
        allowEmpty : false
    },

    minWidth   : 100,

    initComponent: function() {
        var me = this;

        me.on('complete', me.onEditDone, me);

        me.callParent();
    },

    triggerEdit : function (record, e) {
        // ignore editing in mini mode
        var taskEl    = this.panel.getElementForTask(record);

        if (taskEl) {
            var view      = this.panel.resolveViewByNode(taskEl);
            var zoomLevel = view.up('panel').zoomLevel;

            if (zoomLevel !== 'mini') {
                this.record = record;

                this.startEdit(taskEl.down(this.selector));
            }
        }
    },

    onEditDone : function () {
        this.record.set(this.dataIndex, this.getValue());
    }
});