/**
 @class Kanban.editor.Base

 Internal base API for task editors
 */
Ext.define('Kanban.editor.Base', {

    /**
     * @cfg {String} triggerEvent The event that should trigger the editing to start. Set to null to disable the editor from being activated.
     */
    triggerEvent : 'taskdblclick',

    panel    : null,
    selector : '.sch-task',

    editRecord : function (record, e) {

        if (this.panel.isReadOnly()) return;

        var el = this.panel.getElementForTask(record);

        if (el) {
            this.triggerEdit(record, e);
        }
    },

    triggerEdit : function (record, e) {
        throw 'Abstract method call';
    }, 

    init : function (panel) {
        this.panel = panel;

        if (this.triggerEvent) {
            panel.on(this.triggerEvent, function (pnl, record, node, e) {
                this.editRecord(record, e);

            }, this);

            panel.on('taskkeydown', function (taskboard, record, item, e) {
                if (e.getKey() === e.ENTER && e.getTarget().nodeName.toLowerCase() !== 'input') {
                    this.editRecord(record, e);
                }

            }, this);
        }
    }
});