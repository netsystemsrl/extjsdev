/**
 * @class Sch.plugin.EventEditor
 * @extends Sch.widget.EventEditor
 *
 * A plugin (ptype = 'scheduler_eventeditor') used to edit event start/end dates as well as any meta data. It inherits from {@link Ext.form.FormPanel} so you can define any fields and use any layout you want.
 *
 *     var scheduler = Ext.create('Sch.panel.SchedulerGrid', {
 *         resourceStore   : resourceStore,
 *         eventStore      : eventStore,
 *
 *         plugins         : [
 *             { ptype : 'scheduler_eventeditor' }
 *         ]
 *     });
 *
 */
Ext.define('Sch.plugin.EventEditor', {
    extend : 'Sch.widget.EventEditor',

    mixins : [
        'Ext.AbstractPlugin',
        'Sch.plugin.mixin.Editor'
    ],

    alias : ['widget.eventeditor', 'plugin.scheduler_eventeditor'],


    requires : [
        'Ext.util.Region'
    ],

    border        : false,
    shadow        : false,
    hidden        : true,
    collapsed     : true,
    preventHeader : true,
    floating      : true,
    hideMode      : 'offsets',

    /**
     * @cfg {Boolean} constrain
     * Pass `true` to enable the constraining - i.e. editor panel will not exceed the document edges.
     * This option will disable the animation during the expansion. Default value is `false`.
     */
    constrain : false,

    floatingCls : 'sch-eventeditor-floating-container',

    constructor : function (config) {
        this.callParent(arguments);
        this.addCls(this.floatingCls);
    },

    init : function (grid) {
        // setting the ownerCt helps a possible container of the scheduler (such as a window), to not try to
        // position itself above the editor, since it's in sort of a "child" of the Window component in that case.
        this.ownerCt = grid;

        this.initEditor(grid);
    },

    afterRender : function () {
        this.callParent(arguments);
        this.addIgnoreCls();
    },

    /**
     * Activates the editor for the passed event record.
     * @param {Sch.model.Event} record The record to show in the editor panel
     * @param {Object} options Extra options:
     * @param {Ext.dom.Element} options.alignToEl Element to align the editor to (otherwise the editor is aligned to the event being edited element)
     */
    showRecord : function (record, options) {
        // beforeShowRecord hook and show()
        this.expand(!this.constrain);
        // afterShowRecord hook
    },

    alignEditorToElement : function (el) {
        var me  = this;
        var cmp = me.getCmp();

        el = el || (cmp.getElementsFromEventRecord && cmp.getElementsFromEventRecord(me.getRecord())[0]) || null;

        if (el) {
            me.alignTo(el, (cmp.isHorizontal && cmp.isHorizontal() ? 'bl' : 'tl-tr') + (me.constrain ? '?' : ''));
        }
    },

    /**
     * This method first checks that the form values are valid and then updates the event and hides the form.
     */
    onDeleteClick : function () {
        this.callParent(arguments);
        this.hideEditor();
    },

    onCancelClick : function () {
        this.hideEditor();
    },

    /**
     * Hides the editor.
     */
    hideEditor : function () {
        this.collapse(null, true);
    },

    // OVERRIDE: Always hide drag proxy on collapse
    afterCollapse : function () {
        // currently the header is kept even after collapse, so need to hide the form completely
        this.hide();
        this.callParent(arguments);
    },

    // Reposition / update form content if event is moved
    onEventRepaint : function (store, record) {
        if (!this.getCollapsed() && record === this.eventRecord) {
            this.showRecord(record);
        }
    }

});
