/**
 * A plugin (ptype = 'scheduler_editorwindow') used to edit event start/end dates as well as any meta data.
 *
 *
 *     var scheduler = Ext.create('Sch.panel.SchedulerGrid', {
 *         resourceStore   : resourceStore,
 *         eventStore      : eventStore,
 *         plugins         : [
 *             { ptype : 'scheduler_editorwindow' }
 *         ]
 *     });
 *
 */
Ext.define('Sch.plugin.EditorWindow', {
    extend : 'Ext.window.Window',

    mixins : [
        'Ext.AbstractPlugin',
        'Sch.plugin.mixin.Editor'
    ],

    requires : [
        'Sch.widget.EventEditor'
    ],

    alias : ['widget.scheduler_editorwindow', 'plugin.scheduler_editorwindow'],

    cls : 'sch-eventeditor-window',

    layout : 'fit',

    closeAction : 'hide',

    constrain : true,

    /**
     * @cfg {Object} editorConfig Config to pass to the {@link Sch.widget.EventEditor} widget.
     */
    editorConfig : null,

    // HACK, prevent Ext JS bug when browser window is resize, this window disappears
    // TODO: Cannot find test for this case and no mentions of `alignOnResize` in Ext or Sch/Gnt sources.
    privates : {
        alignOnResize : function () {

        }
    },

    initComponent : function () {
        var me = this;

        if (!me.editor) {

            me.editor = Ext.create(Ext.apply({
                xtype         : 'eventeditorform',
                saveOnEnter   : me.saveAndCloseOnEnter,
                onCancelClick : function () {
                    me.hide();
                }
            }, me.editorConfig));

            me.items = me.editor;
        }

        me.callParent(arguments);
    },

    init : function (grid) {
        this.initEditor(grid);
    },

    afterRender : function () {
        this.callParent(arguments);

        var floatingContainer = this.getCmp().up('[floating=true]');

        if (floatingContainer) {
            this.mon(floatingContainer, {
                activate : this.floatAboveFloatingContainer,
                move     : this.floatAboveFloatingContainer,
                scope    : this
            });
        }

        this.addIgnoreCls();
    },

    /**
     * Activates the editor for the passed event record.
     * @param {Sch.model.Event} record The record to show in the editor panel
     * @param {Object} options Extra options:
     * @param {Ext.dom.Element} options.alignToEl Element to align the editor to (otherwise the editor is centered)
     */
    showRecord : function (record, options) {
        // beforeShowRecord hook and show()
        this.floatAboveFloatingContainer();
        this.setTitle(record.getName());
        // afterShowRecord hook
    },

    alignEditorToElement : function (el) {
        var me = this;

        if (el) {
            me.alignTo(el, 'tl-tr' + (me.constrain ? '?' : ''));
        } else {
            me.center();
        }
    },

    /**
     * Return an event record which is shown.
     *
     * @return {Sch.model.Event} eventRecord The record about to be edited
     */
    getEventRecord : function () {
        return this.editor.getEventRecord();
    },

    floatAboveFloatingContainer : function () {
        var floatingContainer = this.getCmp().up('[floating=true]');

        if (this.isVisible() && floatingContainer) {
            this.setZIndex(floatingContainer.getEl().getZIndex() + 1);
        }
    },

    // Reposition / update form content if event is moved
    onEventRepaint : function (store, record) {
        if (this.isVisible() && record === this.getEventRecord() && !this.getEventEditor().isSavingEvent) {
            this.showRecord(record);
        }
    }
});
