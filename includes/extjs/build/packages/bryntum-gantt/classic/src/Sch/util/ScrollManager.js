/**
 * @class
 * @static
 * @private
 * Private utility class for dealing with scroll triggering based on various mousemove events in the UI
 */
Ext.define('Sch.util.ScrollManager', {
    singleton      : true,

    vthresh        : 25,
    hthresh        : 25,
    increment      : 100,
    frequency      : 500,
    animate        : true,
    animDuration   : 200,
    activeCmp      : null,
    activeEl       : null,
    scrollElRegion : null,
    scrollProcess  : {},
    pt             : null,

    // "horizontal", "vertical" or "both"
    direction      : 'both',

    constructor : function () {
        this.doScroll = Ext.Function.bind(this.doScroll, this);
    },

    triggerRefresh : function () {

        if (this.activeEl) {

            this.refreshElRegion();

            this.clearScrollInterval();
            this.onMouseMove();
        }
    },

    doScroll : function () {
        var scrollProcess   = this.scrollProcess,
            scrollProcessCmp = scrollProcess.cmp,
            // HACK: Ext JS has different behavior for viewport case vs non-viewport case.
            rtlWithoutViewport = scrollProcessCmp.rtl && !scrollProcessCmp.up('[isViewport]'),
            dir              = scrollProcess.dir[0],
            increment        = this.increment,
            scrollLeft       = this.activeCmp.getScrollX(),
            scrollTop        = this.activeCmp.getVerticalScroll();

        // Make sure we don't scroll too far
        if (dir === 'r') {
            increment = Math.min(increment, rtlWithoutViewport ? scrollLeft : this.maxPosition.x - scrollLeft);
        } else if (dir === 'd') {
            increment = Math.min(increment, this.maxPosition.y - scrollTop);
        }

        increment = Math.max(increment, 0);
        var deltaX = 0, deltaY = 0;

        if (dir === 'r') deltaX = increment;
        if (dir === 'l') deltaX = -increment;
        if (dir === 'u') deltaY = -increment;
        if (dir === 'd') deltaY = increment;

        if (rtlWithoutViewport) {
            deltaX = -deltaX;
        }

        if (deltaX) {
            scrollProcessCmp.scrollHorizontallyBy(deltaX, {
                duration : this.animDuration,
                callback : this.triggerRefresh,
                scope    : this
            });
        } else if (deltaY) {
            scrollProcessCmp.scrollVerticallyBy(deltaY, {
                duration : this.animDuration,
                callback : this.triggerRefresh,
                scope    : this
            });
        }
    },

    clearScrollInterval : function () {
        var scrollProcess = this.scrollProcess;

        if (scrollProcess.id) {
            clearTimeout(scrollProcess.id);
        }

        scrollProcess.id = 0;
        scrollProcess.cmp = null;
        scrollProcess.dir = "";
    },

    isScrollAllowed : function(dir){

        switch (this.direction) {
            case 'both':
                return true;

            case 'horizontal':
                return dir === 'right' || dir === 'left';

            case 'vertical':
                return dir === 'up' || dir === 'down';

            default:
                throw new Error('Invalid direction: ' + this.direction);
        }

    },

    startScrollInterval : function (cmp, dir) {

        if (!this.isScrollAllowed(dir)) {
            return;
        }

        this.clearScrollInterval();
        this.scrollProcess.cmp = cmp;
        this.scrollProcess.dir = dir;

        this.scrollProcess.id = setTimeout(this.doScroll, this.frequency);
    },

    onMouseMove : function (e) {

        var pt = e ? { x : e.getX(), y : e.getY(), right : e.getX(), bottom : e.getY() } : this.pt,
            x = pt.x,
            y = pt.y,
            scrollProcess = this.scrollProcess,
            cmp           = this.activeCmp,
            scrollLeft    = cmp.getScrollX(),
            scrollTop     = cmp.getVerticalScroll(),
            id,
            // HACK: Ext JS has different behavior for viewport case vs non-viewport case.
            rtlWithoutViewport = cmp.rtl && !cmp.up('[isViewport]'),
            el = this.activeEl,
            region = this.scrollElRegion,
            elDom = el.dom,
            me = this,
            // should be scrollable vertically or horizontally
            isScrollable = cmp.up('timelinegrid,timelinetree').getScrollable().getElement().isScrollable() || el.isScrollable();

        this.pt = pt;

        if (region && region.contains(pt) && isScrollable) {
            if (region.bottom - y <= me.vthresh && (scrollTop < this.maxPosition.y)) {
                if (scrollProcess.cmp != cmp) {
                    this.startScrollInterval(cmp, "down");
                }
                return;
            } else if (region.right - x <= me.hthresh && (rtlWithoutViewport ? scrollLeft > 0 : scrollLeft < this.maxPosition.x) ) {
                if (scrollProcess.cmp != cmp) {
                    this.startScrollInterval(cmp, "right");
                }
                return;
            } else if (y - region.top <= me.vthresh && scrollTop > 0) {
                if (scrollProcess.cmp != cmp) {
                    this.startScrollInterval(cmp, "up");
                }
                return;
            } else if (x - region.left <= me.hthresh && (rtlWithoutViewport ? scrollLeft < this.maxPosition.x : scrollLeft > 0 )) {
                if (scrollProcess.cmp != cmp) {
                    this.startScrollInterval(cmp, "left");
                }
                return;
            }
        }

        this.clearScrollInterval();
    },

    refreshElRegion : function () {
        var region = this.activeEl.getRegion();

        this.scrollElRegion = this.activeCmp.getScrollableContainerRegion();
    },

    // Pass an element, and optionally a direction ("horizontal", "vertical" or "both")
    activate : function (cmp, direction) {
        var scrollbarSize = Ext.getScrollbarSize();

        this.direction = direction || 'both';

        this.activeCmp = cmp;
        this.activeEl  = cmp.getEl();

        this.maxPosition = cmp.getScrollableMaxPosition();

        this.refreshElRegion();
        this.activeEl.on('mousemove', this.onMouseMove, this);
    },

    deactivate : function () {
        // check active to prevent crash on multiple deactivations
        if (this.activeEl) {
            this.clearScrollInterval();

            this.activeEl.un('mousemove', this.onMouseMove, this);
            this.activeEl = this.activeCmp = this.scrollElRegion = null;

            this.direction = 'both';
        }
    }
});
