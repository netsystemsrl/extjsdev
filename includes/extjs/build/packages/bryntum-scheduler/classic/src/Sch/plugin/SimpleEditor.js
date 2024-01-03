/**
@class Sch.plugin.SimpleEditor
@extends Ext.Editor

A plugin (ptype = 'scheduler_simpleeditor') for basic text editing of an event name.

{@img scheduler/images/simple-editor.png}

To add this plugin to scheduler:

        var scheduler = Ext.create('Sch.panel.SchedulerGrid', {
            ...

            resourceStore   : resourceStore,
            eventStore      : eventStore,

            plugins         : [
                new Sch.plugin.SimpleEditor({ dataIndex : 'Title' })
            ]
        });


*/
Ext.define("Sch.plugin.SimpleEditor", {
    extend              : "Ext.Editor",
    alias               : 'plugin.scheduler_simpleeditor',

    requires            : [
        "Ext.form.TextField"
    ],

    mixins              : ['Ext.AbstractPlugin', 'Sch.mixin.Localizable'],
    lockableScope       : 'top',
    cls                 : 'sch-simpleeditor',
    allowBlur           : false,
    shadow              : false,
    // private
    delegate            : '.sch-event-inner',

    /**
     * @cfg {String} dataIndex A field of the {@Sch.model.Event eventModel} containing the task name that will be updated by the editor. Defaults to the value of the {@link Sch.model.Event#nameField}.
     */
    dataIndex           : null,

    completeOnEnter : true,
    cancelOnEsc     : true,
    dragProxyEl     : null,
    eventRecord     : null,
    resourceRecord  : null,
    //maxWidth        : 200,
    triggerEvent    : 'eventdblclick',

    /**
     * @cfg {String} newEventText The text to assign as the name for a newly created Event.
     */
    newEventText : null,

    autoSize            : {
        width   : 'boundEl' // The width will be determined by the width of the boundEl, the height from the editor
    },

    initComponent : function() {
        this.field = this.field || { xtype : 'textfield', selectOnFocus : true };
        this.callParent(arguments);
    },

    init : function(scheduler) {
        this.scheduler = scheduler.getSchedulingView();

        scheduler.on('afterrender', this.onSchedulerRender, this);
        this.scheduler.registerEventEditor(this);

        this.dataIndex = this.dataIndex || this.scheduler.getEventStore().model.prototype.nameField;
    },

    /**
     * Programmatically start editing for a selected Event (and optionally a Resource if using an AssignmentStore)
     *
     * @param {Sch.model.Event} eventRecord The Event record to edit
     * @param {Sch.model.Resource} [resourceRecord] The resource record (only relevant when editing assignment records)
     */
    edit : function (eventRecord, resourceRecord, el) {
        if (!this.rendered) {
            // Editor element should live in scheduler view to be part of scrolling and not overflow locked grid
            this.renderTo = this.scheduler.getEl();
        }

        this.eventEl = el || this.scheduler.getElementsFromEventRecord(eventRecord, resourceRecord)[ 0 ];

        this.eventRecord    = eventRecord;
        this.resourceRecord = resourceRecord;

        this.startEdit(el.dom.querySelector(this.delegate), this.eventRecord.get(this.dataIndex));

        // workaround http://www.sencha.com/forum/showthread.php?296716
        this.realign();
    },

    onSchedulerRender : function (scheduler) {
        var me = this;

        me.on({
            startedit : me.onStartEdit,

            complete : function (editor, value, original) {
                var eventRecord       = me.eventRecord,
                    eventStore        = me.scheduler.getEventStore(),
                    isAutoSyncEnabled = eventStore.getAutoSync();

                if (isAutoSyncEnabled) {
                    eventStore.suspendAutoSync();
                }

                eventRecord.set(me.dataIndex, value);

                // Check if this is a new record
                if (eventStore.indexOf(eventRecord) < 0) {
                    if (me.scheduler.fireEvent('beforeeventadd', me.scheduler, eventRecord, [me.resourceRecord]) !== false) {

                        me.scheduler.onEventCreated(eventRecord, [ me.resourceRecord ]);

                        eventStore.append(eventRecord);
                        eventRecord.assign(me.resourceRecord);
                    }
                }

                me.onAfterEdit();

                if (isAutoSyncEnabled) {
                    eventStore.resumeAutoSync(true);
                }
            },

            canceledit  : me.onAfterEdit,

            hide        : function() {
                var proxyEl = me.dragProxyEl;

                if (proxyEl && proxyEl.dom && proxyEl.dom.parentNode) {
                    proxyEl.destroy();
                }
            },

            scope       : me
        });

        scheduler.on('dragcreateend', me.onDragCreateEnd, me);
        scheduler.on(me.triggerEvent, me.onTriggerEvent, me);
    },

    onStartEdit  : function() {
        if (!this.allowBlur) {
            // This should be removed when this bug is fixed:
            // http://www.sencha.com/forum/showthread.php?244580-4.1-allowBlur-on-Ext.Editor-not-working
            Ext.getBody().on('mousedown', this.onMouseDown, this, { capture : true });
        }
    },

    onTriggerEvent : function (view, eventRecord, e) {
        if (!this.scheduler.isReadOnly()) {
            var target         = e.getTarget(view.eventSelector);
            var resourceRecord = view.resolveResource(target);

            this.edit(eventRecord, resourceRecord, Ext.get(target));

            this.getEl().setBox(this.getEl().getRegion().constrainTo(this.scheduler.getRegion()));
            /*
            // If editing a wider element than maxWidth, place the editor where the input event happened
            if (view.isHorizontal() && Ext.fly(target).getWidth() > this.maxWidth) {
                var proposedX       = e.getX() - view.getX() + view.getScrollX() - (this.maxWidth / 2);
                var eventLeft       = Ext.fly(target).getLeft(true);
                var constrainedLeft = Math.max(eventLeft, view.getScrollX());

                this.getEl().setLeft(Math.max(proposedX, constrainedLeft));
            }
            */
        }
    },

    onAfterEdit : function () {
        this.eventRecord    = null;
        this.resourceRecord = null;

        if (!this.allowBlur) {
            Ext.getBody().un('mousedown', this.onMouseDown, this, { capture : true });
        }
    },

    onMouseDown : function(e, t) {
        if (this.editing && this.el && !e.within(this.el)) {
            this.completeEdit();
        }
    },

    onDragCreateEnd : function (s, eventRecord, resourceRecord, e, proxyEl) {
        var dragProxyEl = proxyEl.dom.cloneNode(true);

        dragProxyEl.id = '';
        proxyEl.dom.parentNode.appendChild(dragProxyEl);

        this.dragProxyEl = Ext.get(dragProxyEl);

        if (eventRecord.get(this.dataIndex) === '') {
            eventRecord.set(this.dataIndex, this.newEventText || this.L('newEventText'));
        }

        this.edit(eventRecord, resourceRecord, this.dragProxyEl);
    },

    destroy : function () {
        this.cancelEdit();
        this.eventRecord    = null;
        this.resourceRecord = null;
        this.callParent(arguments);
    },

    realign : function(autoSize) {
        var me     = this,
            result = me.callParent([autoSize]),
            box    = me.eventEl && me.eventEl.getBox();

        if (box) {
            me.getEl().setBox(box);
            me.getEl().down('input').setBox(box);
        }

        return result;
    }
});
