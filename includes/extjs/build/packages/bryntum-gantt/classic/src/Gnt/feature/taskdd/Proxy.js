/**
 * Special status proxy class capable of being attached to any element on the page. The parent class allows attaching
 * to body only.
 */
Ext.define('Gnt.feature.taskdd.Proxy', {
    extend : 'Ext.dd.StatusProxy',
    alias  : 'widget.gnt-task-ddproxy',

    config : {
        /**
         * @cfg {Ext.dom.Element|HTMLElement|String} Element or node or node id to force attach to
         */
        forceAttachTo : null
    },

    shadow : false,

    forceStatusProc : null,
    lastRecievedStatus : null,

    destroy : function() {
        var me = this;

        me.callParent();

        if (me.forceStatusProc) {
            clearTimeout(me.forceStatusProc);
            me.forceStatusProc = null;
        }
    },

    applyForceAttachTo : function(el) {

        if (el) {
            el = Ext.get(el);
            if (el.dom == Ext.getBody().dom) {
                el = null;
            }
        }

        return el;
    },

    updateForceAttachTo : function(el, oldEl) {
        this.forceAttach(el);
    },

    forceAttach : function(containerEl) {
        var me = this,
            el,
            pageXY,
            localXY;

        if (me.rendered) {

            el          = me.getEl();
            containerEl = containerEl || Ext.getBody();

            pageXY  = me.getXY();
            localXY = containerEl.translatePoints(pageXY);

            el.hide();
            containerEl.appendChild(el);
            el.setLocalXY(localXY.left, localXY.top);

            !me.hidden && el.show();
        }
    },

    /**
     * @inheritdoc
     */
    ensureAttachedToBody : function(runLayout) {
        // do nothing for now
    },

    /**
     * @inheritdoc
     */
    afterRender : function() {
        var me = this;

        me.callParent();
        me.forceAttach(me.getForceAttachTo());
    },

    /**
     * Returns task element inside proxy ghost.
     *
     * @return {HTMLElement|null}
     */
    getTaskGhostEl : function() {
        return Ext.fly(this.getGhost()).first(null, true);
    },

    /**
     * @inheritdoc
     *
     * Overriden to support status forcing
     */
    setStatus : function(status) {
        var me = this;

        if (me.forceStatusProc) {
            me.lastRecievedStatus = status;
        }
        else {
            me.callParent([status]);
        }
    },

    /**
     * @inheritdoc
     *
     * Overriden to support status forcing cleanup
     */
    reset : function(clearGhost) {
        var me = this;

        if (me.forceStatusProc) {
            clearTimeout(me.forceStatusProc);
            me.lastRecievedStatus = null;
            me.forceStatusProc = null;
        }

        me.callParent([clearGhost]);
    },

    /**
     * Sets proxy status and forces it to stay for given time span.
     *
     * After time span ends proxy switches to last recieved via {@link #setStatus}() status
     */
    forceStatus : function(status, timeSpanMs) {
        var me = this;

        if (!me.forceStatusProc) {

            me.lastRecievedStatus = me.dropStatus;

            me.setStatus(status);

            me.forceStatusProc = Ext.Function.defer(function() {
                me.forceStatusProc = null;
                me.setStatus(me.lastRecievedStatus);
            }, timeSpanMs || 100);
        }
    }
});
