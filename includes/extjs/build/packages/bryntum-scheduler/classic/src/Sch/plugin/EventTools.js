/**
 * A plugin showing a tools menu with event actions when the mouse hovers over a rendered event in the timeline.
 * Each tool can also define a visibleFn, which is called before the tools menu is shown.
 * This allows you to get control over which actions can be performed on which events.
 *
 * Sample usage:
 *
 * ```javascript
 * plugins : [{
 *     ptype : 'scheduler_eventtools',
 *     items : [
 *         { type : 'details', callback : onToolClick, tooltip : 'Show Event Details' },
 *         { type : 'edit', callback : onToolClick, tooltip : 'Edit Event' },
 *         { type : 'repeat', callback : onToolClick, tooltip : 'Repeat Event' },
 *         {
 *             type      : 'drop', callback : onToolClick, tooltip : 'Remove Event',
 *             visibleFn : function (eventRecord) {
 *                 return !!eventRecord.get('Deletable');
 *             }
 *         }
 *     ]
 * }]
 * ```
*/
Ext.define('Sch.plugin.EventTools', {
    extend          : 'Ext.Container',
    mixins          : ['Ext.AbstractPlugin'],
    lockableScope   : 'top',
    alias           : 'plugin.scheduler_eventtools',

    /**
    * @cfg {Number} hideDelay The menu will be hidden after this number of ms, when the mouse leaves the tools element.
    */
    hideDelay       : 500,

    /**
    * @cfg {String} align The alignment of the tools menu to the event bar
    */
    align           : 'b-t',

    /**
    * @cfg {Object} defaults The defaults for each action item in the tools menu
    */
    defaults: {
        xtype       : 'tool',
        baseCls     : 'sch-tool',
        overCls     : 'sch-tool-over',
        width       : 24,
        height      : 24,
        visibleFn   : Ext.emptyFn
    },

    // private
    hideTimer       : null,

    // private
    cachedSize      : null,

    // private
    layout          : 'hbox',
    autoRender      : true,
    floating        : true,
    shadow          : false,
    hideMode        : 'offsets',
    hidden          : true,
    eventRecord     : null,
    resourceRecord  : null,

    /**
     * @property {HTMLElement} targetNode
     * The target element that triggered the event tools component to be shown
     */
    targetNode      : null,

    /**
     * Returns the event record that this tools menu is currently associated with
     * @return {Sch.model.Event} eventRecord The event record
     */
    getEventRecord : function() {
        return this.eventRecord;
    },

    /**
     * Returns the resource record that this tools menu is currently associated with
     * @return {Sch.model.Resource} resourceRecord The resource record
     */
    getResourceRecord : function() {
        return this.resourceRecord;
    },

    init: function (scheduler) {
        if (!this.items) throw 'Must define an items property for this plugin to function correctly';

        // Let client use 'cls' property
        this.addCls('sch-event-tools');

        this.scheduler = scheduler;
        this.defaultAlign = this.align; // 'align' property changed name to 'defaultAlign' since original implementation

        scheduler.on({
            // Suspend during resize
            'eventresizestart'  : this.onOperationStart,
            'aftereventresize'  : this.onOperationEnd,

            // Suspend during drag drop
            'eventdragstart'    : this.onOperationStart,
            'eventdrop'         : this.onOperationEnd,

            'eventmouseenter'   : this.onEventMouseEnter,
            'eventmouseleave'   : this.onContainerMouseLeave,

            scope: this
        });
    },


    onRender: function () {
        this.callParent(arguments);

        this.el.on({
            mouseenter : this.onContainerMouseEnter,
            mouseover  : this.onContainerMouseEnter,
            mouseleave : this.onContainerMouseLeave,
            scope      : this
        });
    },

    onEventMouseEnter : function (view, eventRecord, e) {
        window.clearTimeout(this.hideTimer);

        var me     = this,
            doShow = false,
            visible;

        me.targetNode     = e.getTarget(view.eventSelector);
        me.eventRecord    = eventRecord;
        me.resourceRecord = view.resolveResource(me.targetNode);

        me.items.each(function (tool) {
            visible = tool.visibleFn(me.eventRecord) !== false;
            tool.setVisible(visible);

            if (visible) doShow = true;
        });

        if (!doShow) return;

        me.showBy(me.targetNode);
    },

    onContainerMouseEnter: function () {
        window.clearTimeout(this.hideTimer);
    },

    onContainerMouseLeave: function () {
        window.clearTimeout(this.hideTimer);
        this.hideTimer = Ext.defer(this.hide, this.hideDelay, this);
    },

    onOperationStart: function () {
        this.scheduler.un('eventmouseenter', this.onEventMouseEnter, this);
        window.clearTimeout(this.hideTimer);
        this.hide();
    },

    onOperationEnd: function () {
        this.scheduler.on('eventmouseenter', this.onEventMouseEnter, this);
    },

    destroy : function () {
        clearTimeout(this.hideTimer);
        this.callParent(arguments);
    }
});


