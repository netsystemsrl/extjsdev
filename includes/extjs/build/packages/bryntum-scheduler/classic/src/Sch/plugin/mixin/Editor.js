/**
 * @class Sch.plugin.mixin.Editor
 * @private
 *
 * A mixin providing floating functionality to the {@link Sch.plugin.EventEditor} which extends {@link Sch.widget.EventEditor}
 * and to the {@link Sch.plugin.EditorWindow} which contains {@link Sch.widget.EventEditor} as a child component.
 */
Ext.define('Sch.plugin.mixin.Editor', {
    extend : 'Ext.Mixin',

    mixinConfig : {
        before : {
            showRecord : 'beforeShowRecord',
            hide       : 'beforeEditorHide'
        },
        after  : {
            showRecord : 'afterShowRecord'
        }
    },

    /**
     * @cfg {Boolean} hideOnBlur True to hide this panel if a click is detected outside the panel (defaults to true)
     */
    hideOnBlur : true,

    /**
     * @cfg {Boolean} saveAndCloseOnEnter True to save and close this panel if ENTER is pressed in one of the input fields inside the panel.
     */
    saveAndCloseOnEnter : true,

    /**
     * @cfg {String} triggerEvent The event that shall trigger showing the editor. Defaults to `eventdblclick`, set to `` or null to disable editing of existing events.
     */
    triggerEvent : 'eventdblclick',

    record              : null,
    dragProxyEl         : null,
    ignoreCls           : 'sch-event-editor-ignore-click',
    ignoreCheckMaxDepth : 30,
    lockableScope       : 'normal',
    width               : 400,

    initEditor : function () {
        var me     = this;
        var cmp    = me.getCmp();
        var editor = me.getEventEditor();

        editor.saveOnEnter  = me.saveAndCloseOnEnter;
        editor.allowOverlap = cmp.allowOverlap === undefined ? true : cmp.allowOverlap;

        // In case recurring event fields were explicitly turned off on the event editor,
        // no need to turn them on again
        var editorRecurringEvents = editor.getRecurringEvents && editor.getRecurringEvents();
        editor.setRecurringEvents && editor.setRecurringEvents(editorRecurringEvents !== false && cmp.recurringEvents !== false);

        me.setEventStore(cmp.getEventStore());
        me.setResourceStore(cmp.getResourceStore());

        if (cmp.rendered) {
            me.onCmpAfterRender();
        } else {
            me.mon(cmp, 'afterrender', me.onCmpAfterRender, me);
        }

        me.mon(cmp, {
            dragcreateend       : me.onDragCreateEnd,
            eventstorechange    : me.onCmpEventStoreChange,
            resourcestorechange : me.onCmpResourceStoreChange,
            scope               : me
        });

        me.mon(editor, {
            aftereventadd    : me.onAfterEventAdd,
            aftereventsave   : me.onAfterEventSave,
            aftereventdelete : me.onAfterEventDelete,
            scope            : me
        });

        me.on('hide', me.hideDragProxy, me);

        if (me.triggerEvent) {
            me.mon(cmp, me.triggerEvent, me.onActivateEditor, me);
        }
    },

    /**
     * Before showRecord hook
     * @private
     * @param {Sch.model.Event} record The record to show in the editor panel
     * @param {Object} options Extra options:
     * @param {Ext.dom.Element} options.alignToEl Element to align the editor to (otherwise the editor is centered)
     */
    beforeShowRecord : function (record, options) {
        var me = this;

        me.addRepaintListener();
        me.show();
    },

    // should be overridden for non-scheduler components
    addRepaintListener : function () {
        var me  = this;
        var cmp = me.getCmp();

        if (cmp.isSchedulerGrid || cmp.isSchedulerTree) {
            me.eventRepaintListener = me.mon(cmp.getSchedulingView(), 'eventrepaint', me.onEventRepaint, me, {
                destroyable : true
            });
        }
    },

    /**
     * After showRecord hook
     * @private
     * @param {Sch.model.Event} record The record to show in the editor panel
     * @param {Object} options Extra options:
     * @param {Ext.dom.Element} options.alignToEl Element to align the editor to (otherwise the editor is centered)
     */
    afterShowRecord : function (record, options) {
        var me       = this;
        var cmp      = me.getCmp();
        var readOnly = cmp && cmp.isReadOnly && cmp.isReadOnly();
        var editor   = me.getEventEditor();

        me.setRecord(record);
        me.alignEditorToElement(Ext.isObject(options) && options.alignToEl);
        editor.loadRecord(record, readOnly);
    },

    beforeEditorHide : function (record, options) {
        var me = this;

        me.eventRepaintListener && me.eventRepaintListener.destroy();
    },

    setEventStore : function (store) {
        var me     = this;
        var editor = me.getEventEditor();

        editor.setEventStore(store);
    },

    setResourceStore : function (store) {
        var me     = this;
        var editor = me.getEventEditor();

        editor.setResourceStore(store);
    },

    getEventEditor : function () {
        // this mixin could be mixed in the editor window (Sch.plugin.EditorWindow) and in the editor itself (Sch.plugin.EventEditor)
        return this.isEventEditor ? this : this.editor;
    },

    onAfterEventAdd : function (editor, eventRecord) {
        if (editor.scrollNewEventIntoView && eventRecord.getResources().length < 2) {
            this.scrollEventIntoView(eventRecord);
        }
    },

    onAfterEventSave : function (editor, eventRecord) {
        this.hideEditor();
    },

    scrollEventIntoView : function (eventRecord) {
        this.getCmp().getSchedulingView().scrollEventIntoView(eventRecord);
    },

    onCmpEventStoreChange : function (cmp, store) {
        this.setEventStore(store);
    },

    onCmpResourceStoreChange : function (cmp, store) {
        this.setResourceStore(store);
    },

    onAfterEventDelete : function () {
        this.hideEditor();
    },

    onCmpAfterRender : function () {
        var me = this;

        if (!me.isWindow) {
            me.render(document.body);
        }

        if (me.hideOnBlur) {
            // Hide when clicking outside panel
            me.mon(Ext.getDoc(), 'mousedown', me.mouseDownAction, me);
        }

        me.registerEditorInComponent();
    },

    // should be overridden for non-scheduler components
    registerEditorInComponent : function () {
        var me  = this;
        var cmp = me.getCmp();

        // This mixin could be mixed in Sch.plugin.EditorWindow which contains Sch.widget.EventEditor (editor form) as a child item
        // or in Sch.plugin.EventEditor which extends Sch.widget.EventEditor (editor form).
        // In both cases it makes sense to keep link to the top level component instead of a form,
        // so whenever you need to show record there will be `showRecord` function.
        // And if you need to refer to the form you can access it through the top level component.
        cmp.getSchedulingView().registerEventEditor(me);
    },

    onDragCreateEnd : function (s, eventRecord, resourceRecord, e, proxyEl) {
        var me        = this;
        var cmp       = me.getCmp();
        var editor    = me.getEventEditor();
        var resources = [];

        if (resourceRecord && resourceRecord.isResourceModel) {
            editor.resourceRecord = resourceRecord;
            resources             = [resourceRecord];
        }

        // Call a template method
        if (cmp.onEventCreated) {
            cmp.onEventCreated(eventRecord, resources);
        }

        var target = proxyEl || (e.getTarget && e.getTarget()) || e.target || null;

        me.showRecord(eventRecord, {
            alignToEl : target
        });

        // Clone proxy after showing editor so it's not deleted
        if (proxyEl) {
            var dragProxyEl = proxyEl.dom.cloneNode(true);
            dragProxyEl.id  = '';
            proxyEl.dom.parentNode.appendChild(dragProxyEl);

            me.dragProxyEl = Ext.get(dragProxyEl);
        }
    },

    // Set ignore cls automatically on inner form elements
    addIgnoreCls : function () {
        var me       = this,
            editor   = me.getEventEditor(),
            toIgnore = editor.getFloatingComponents();

        Ext.Array.each(toIgnore, function (cmp) {
            cmp.addCls(me.ignoreCls);
        });
    },

    mouseDownAction : function (e) {
        if (this.isVisible() && !this.isEventWithinComponent(e)) {
            this.hideEditor();
        }
    },

    isEventWithinComponent : function (e) {
        return e.within(this.getEl()) ||
            !!e.getTarget('.' + this.ignoreCls, this.ignoreCheckMaxDepth) ||
            !!e.getTarget('.' + Ext.baseCSSPrefix + 'mask', 1);
    },

    onActivateEditor : function (g, record, e) {
        var me       = this;
        var selector = me.getSelectorToAlignEditorBy();
        var target   = e.getTarget(selector);

        this.showRecord(record, {
            alignToEl : target
        });
    },

    getSelectorToAlignEditorBy : function () {
        var me  = this;
        var cmp = me.getCmp();
        var cls = cmp.getSchedulingView && cmp.getSchedulingView() && cmp.getSchedulingView().eventCls;

        return cls ? '.' + cls : null;
    },

    hideDragProxy : function () {
        var dpEl = this.dragProxyEl;

        if (dpEl && dpEl.dom.parentNode) {
            dpEl.dom.parentNode.removeChild(dpEl.dom);
            delete this.dragProxyEl;
        }
    },

    hideEditor : function () {
        this.hide();
    },

    /**
     * Sets the record being edited.
     * @param {Sch.model.Event} record The record being edited
     */
    setRecord : function (record) {
        this.record = record;
    },

    /**
     * Returns the record being edited.
     * @return {Sch.model.Event} The record being edited
     */
    getRecord : function () {
        return this.record;
    }
});
