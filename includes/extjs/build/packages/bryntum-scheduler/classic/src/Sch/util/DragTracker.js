/**
 * @class Sch.util.DragTracker
 * @private
 *
 * Simple drag tracker with an extra useful getRegion method
 **/
Ext.define('Sch.util.DragTracker', {
    extend : 'Ext.dd.DragTracker',

    requires : [
        'Ext.util.Region'
    ],

    /**
     * @cfg {Number} xStep
     * The number of horizontal pixels to snap to when dragging
     */
    xStep : 1,

    /**
     * @cfg {Number} yStep
     * The number of vertical pixels to snap to when dragging
     */
    yStep : 1,

    initEl: function(el) {
        var me = this,
            elCmp, touchScrollable;

        me.callParent(arguments);

        if (Ext.supports.Touch) {
            // HACK
            // DragTracker adds mousdown listener with option `translate : false`, which on touch desktop doesn't fire
            // mousedown on actual mousedown, only on touch. Reattaching this listener with translate : true
            // Default listeners in DragTracker IE11 will handle touch and click as 'mousedown' with pointerType 'mouse'
            // Beside that, we do not want this code to work in Edge with touch events enabled in flags. If they are enabled,
            // TouchEvent class is present on window.
            // This is also required now in chrome
            if (!Ext.isEdge || !window.TouchEvent) {
                me.mun(me.handle, me.handleListeners);
                me.handleListeners.mousedown.translate = true;
                me.mon(me.handle, me.handleListeners);
            }
        }
    },

    constructor : function () {

        this.callParent(arguments);

        // ScrollManager might trigger a scroll as we are dragging, trigger manual onMouseMove in this case
        this.on('dragstart', this.bindListenersOnDragStart);
    },

    bindListenersOnDragStart : function () {
        var el = this.el;

        el.on(this.getListeners());

        this.on('dragend', this.unbindListenersOnDragEnd, this, {single : true});
    },

    unbindListenersOnDragEnd : function () {
        this.el && this.el.un(this.getListeners());
    },

    getListeners    : function () {
        return {
            scroll     : this.onMouseMove,
            // We only care about single touches
            pinchstart : this.onMouseUp,
            scope      : this
        };
    },

    destroy : function () {
        clearTimeout(this.deferTimer);
        this.callParent(arguments);
    },

    /**
     * Set the number of horizontal pixels to snap to when dragging
     * @param {Number} step
     */
    setXStep : function (step) {
        this.xStep = step;
    },

    startScroll : null,

    /**
     * Set the number of vertical pixels to snap to when dragging
     * @param {Number} step
     */
    setYStep : function (step) {
        this.yStep = step;
    },

    getCurrentScroll    : function () {
        return this.el.getScroll();
    },

    getRegion   : function () {
        var startXY = this.startXY,
            currentScroll = this.getCurrentScroll();

        // In IE scroll on element will contain scroll from right-most position
        // All calculations are made with assumption scroll is from left edge
        if (Ext.isIE && this.rtl) {
            currentScroll.left = this.el.dom.scrollWidth - this.el.getWidth() - currentScroll.left;
        }

        var currentXY = this.getXY(),
            currentX = currentXY[0],
            currentY = currentXY[1],
            scrollLeftDelta = currentScroll.left - this.startScroll.left,
            scrollTopDelta = currentScroll.top - this.startScroll.top,
            startX = startXY[0] - scrollLeftDelta,
            startY = startXY[1] - scrollTopDelta,
            minX = Math.min(startX, currentX),
            minY = Math.min(startY, currentY),
            width = Math.abs(startX - currentX),
            height = Math.abs(startY - currentY);

        return new Ext.util.Region(minY, minX + width, minY + height, minX);
    },

    // @OVERRIDE
    onMouseDown : function (e, target) {
        var touches = e.event.touches || [];

        // Ignore multi touches and single touch in IE11
        // Only dragcreate event with mouse action
        if (touches.length > 1 || !(e.type === 'mousedown' && e.pointerType === 'mouse')) return;

        // HACK - Ext calls stopPropagation which prevents global mousedown listeners on the document/body
        // which messes up blur of EventEditor plugin. See event editor tests for reference
        e.stopPropagation = Ext.emptyFn;

        this.startXY = e.getXY();

        this.callParent([e, target]);

        this.lastXY = this.startXY;
        this.startScroll = this.getCurrentScroll();

        if (Ext.isIE && this.rtl) {
            this.startScroll.left = this.el.dom.scrollWidth - this.el.getWidth() - this.startScroll.left;
        }
    },

    // @OVERRIDE
    // Adds support for snapping to increments while dragging
    onMouseMove : function (e, target) {
        e.preventDefault();

        var xy = e.type === 'scroll' ? this.lastXY : e.getXY(),
            s = this.startXY;

        if (!this.active) {
            if (Math.max(Math.abs(s[0] - xy[0]), Math.abs(s[1] - xy[1])) > this.tolerance) {
                this.triggerStart(e);
            } else {
                return;
            }
        }

        var x = xy[0],
            y = xy[1];

        // TODO handle if this.el is scrolled
        if (this.xStep > 1) {
            x -= this.startXY[0];
            x = Math.round(x / this.xStep) * this.xStep;
            x += this.startXY[0];
        }

        if (this.yStep > 1) {
            y -= this.startXY[1];
            y = Math.round(y / this.yStep) * this.yStep;
            y += this.startXY[1];
        }

        var snapping = this.xStep > 1 || this.yStep > 1;

        if (!snapping || x !== xy[0] || y !== xy[1]) {
            this.lastXY = [x, y];

            if (this.fireEvent('mousemove', this, e) === false) {
                this.onMouseUp(e);
            } else {
                this.onDrag(e);
                this.fireEvent('drag', this, e);
            }
        }
    }
});
