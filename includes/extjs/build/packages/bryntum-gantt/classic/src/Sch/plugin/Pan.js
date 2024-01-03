/**
 * A grid plugin enabling panning by clicking and dragging in a scheduling view.
 *
 * Sample usage:
 *
 * ```javascript
 * new Sch.panel.SchedulerGrid({
 *     plugins : ['scheduler_pan'],
 *     ...
 * });
 * ```
 */
Ext.define("Sch.plugin.Pan", {
    extend        : 'Ext.AbstractPlugin',
    alias         : 'plugin.scheduler_pan',
    lockableScope : 'top',

    /**
     * @cfg {Boolean} enableVerticalPan
     * Set to `false` to turn vertical panning off
     */
    enableVerticalPan : true,

    statics : {
        /**
         * @property {Number} KEY_SHIFT Constant for shift key
         */
        KEY_SHIFT : 1,

        /**
         * @property {Number} KEY_CTRL Constant for ctrl / meta key
         */
        KEY_CTRL : 2,

        /**
         * @property {Number} KEY_ALT Constant for alt key
         */
        KEY_ALT : 4,

        /**
         * @property {Number} KEY_ALL Constant for all modifier keys (shift, ctrl / meta, alt)
         */
        KEY_ALL : 7
    },

    /**
     * @cfg {Number} disableOnKey Specifies which key should be pressed to disable panning.
     * See {@link #KEY_SHIFT}, {@link #KEY_CTRL}, {@link #KEY_ALT}, {@link #KEY_ALL}.
     * For example to disable panning when shift or ctrl is pressed:
     *
     * ```javascript
     * Ext.create('Sch.plugin.Pan', {
     *     disableOnKey : Sch.plugin.Pan.KEY_SHIFT + Sch.plugin.Pan.KEY_CTRL
     * });
     * ```
     */
    disableOnKey : 0,

    constructor : function (config) {
        Ext.apply(this, config);
    },

    init : function (grid) {
        this.view = grid.getSchedulingView();

        this.view.on('afterrender', this.onRender, this);
    },

    onRender : function () {
        this.view.el.on('mousedown', this.onMouseDown, this);
    },

    onMouseDown : function (e) {
        if (
            (e.event.touches && e.event.touches.length > 0) || // ExtJS supports scrolling when using touch out of the box
            (!e.event.touches && e.button !== 0) // Do not react on context menu click
        ) return;

        var self         = this.self,
            disableOnKey = this.disableOnKey;

        // Ignore event if #disableOnKey is specified and at least one of the
        // functional keys is pressed
        if ((e.shiftKey && (disableOnKey & self.KEY_SHIFT)) ||
            (e.ctrlKey && (disableOnKey & self.KEY_CTRL)) ||
            (e.altKey && (disableOnKey & self.KEY_ALT))) {
            return;
        }

        // ignore actions on any rendered content on the schedule
        if (e.getTarget(this.view.timeCellSelector, 10) && !e.getTarget(this.view.timeCellSelector + ' > div > *')) {
            this.mouseX = e.getX();
            this.mouseY = e.getY();
            Ext.getBody().on('mousemove', this.onMouseMove, this);
            Ext.getDoc().on('mouseup', this.onMouseUp, this);

            // For IE (and FF if using frames), if you move mouse onto the browser chrome and release mouse button
            // we won't know about it. Next time mouse enters the body, cancel any ongoing pan activity as a fallback.
            if (Ext.isIE || Ext.isGecko) {
                Ext.getBody().on('mouseenter', this.onMouseUp, this);
            }

            // required for some weird chrome bug/behavior, when whole panel was scrolled-out
            e.stopEvent();
        }
    },

    onMouseMove : function (e) {
        if (this.disabled) return;

        e.stopEvent();

        var x      = e.getX(),
            y      = e.getY(),
            yDelta = 0,
            xDelta = this.mouseX - x;

        if (this.enableVerticalPan) {
            yDelta = this.mouseY - y;
        }

        this.mouseX = x;
        this.mouseY = y;

        var currentScrollPos = this.view.getScroll();

        yDelta && this.view.scrollVerticallyTo(Math.max(0, yDelta + currentScrollPos.top), false);
        xDelta && this.view.scrollHorizontallyTo(Math.max(0, xDelta + currentScrollPos.left), false);

        // scroll header as well to avoid "header-body" scroll bouncing
        var headerScrollable = this.view.headerCt.getScrollable();

        headerScrollable && headerScrollable.scrollBy(xDelta, 0, false);
    },

    onMouseUp : function () {
        Ext.getBody().un('mousemove', this.onMouseMove, this);
        Ext.getDoc().un('mouseup', this.onMouseUp, this);

        if (Ext.isIE || Ext.isGecko) {
            Ext.getBody().un('mouseenter', this.onMouseUp, this);
        }
    }
});
