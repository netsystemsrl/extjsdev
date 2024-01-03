/**
 @class Sch.mixin.TimelineView

 A base mixin for {@link Ext.view.View} classes, giving to the consuming view the "time line" functionality.
 This means that the view will be capable to display a list of "events", ordered on the {@link Sch.data.TimeAxis time axis}.

 By itself this mixin is not enough for correct rendering. The class, consuming this mixin, should also consume one of the
 {@link Sch.view.Horizontal}, {@link Sch.view.Vertical} or {@link Sch.view.WeekView} mixins, which provides the implementation of some mode-specfic methods.

 Generally, should not be used directly, if you need to subclass the view, subclass the {@link Sch.view.SchedulerGridView} instead.

 */
Ext.define("Sch.mixin.TimelineView", {
    extend : 'Sch.mixin.AbstractTimelineView',

    requires : [
        'Ext.tip.ToolTip',
        'Sch.patches.Element_6_7',
        'Sch.patches.NavigationModel6_0_2',
        'Sch.patches.View',
        'Sch.patches.Scroller_6_5',
        'Sch.patches.Scroller_7_3',
        'Sch.patches.LayoutContext_6_5',
        'Sch.patches.ToolTip',
        'Sch.patches.AbstractView',
        'Sch.patches.SpreadsheetModel',
        'Sch.patches.CellEditingPlugin',
        'Sch.patches.TableScroller',
        'Sch.tooltip.EventTip'
    ],

    tip : null,

    /**
     * @cfg {String} overScheduledEventClass
     * A CSS class to apply to each event in the view on mouseover (defaults to 'sch-event-hover').
     */
    overScheduledEventClass : 'sch-event-hover',

    ScheduleBarEvents : [
        "mousedown",
        "mouseup",
        "click",
        "dblclick",
        "longpress",
        "contextmenu"
    ],

    ResourceRowEvents : [
        "keydown",
        "keyup"
    ],

    // allow the panel to prevent adding the hover CSS class in some cases - during drag drop operations
    preventOverCls : false,

    // The last hovered over event bar HTML node
    hoveredEventNode       : null,

    /**
     * @event beforetooltipshow
     * @preventable
     * Fires before the event tooltip is shown, return false to suppress it.
     * @param {Sch.mixin.SchedulerPanel} scheduler The scheduler object
     * @param {Sch.model.Event} eventRecord The event record corresponding to the rendered event
     */

    /**
     * @event columnwidthchange
     * @private
     * Fires after the column width has changed
     */

    _initializeTimelineView : function () {
        this.callParent(arguments);

        this.on('destroy', this._onDestroy, this);
        this.on('afterrender', this._onAfterRender, this);

        this.setMode(this.mode);

        this.enableBubble('columnwidthchange');

        this.addCls("sch-timelineview");

        if (this.readOnly) {
            this.addCls(this._cmpCls + '-readonly');
        }

        this.addCls(this._cmpCls);

        if (this.eventAnimations) {
            this.addCls('sch-animations-enabled');
        }

    },

    handleScheduleBarEvent : function (e, eventBarNode) {
        this.fireEvent(this.scheduledEventName + e.type, this, this.resolveEventRecord(eventBarNode), e);
    },

    handleResourceRowEvent : function (e, resourceRowNode) {
        this.fireEvent(this.scheduledEventName + e.type, this, this.resolveEventRecordFromResourceRow(resourceRowNode), e);
    },

    // private, clean up
    _onDestroy : function () {
        if (this.tip) {
            this.tip.destroy();
        }
    },

    _onAfterRender : function () {
        if (this.overScheduledEventClass) {
            this.setMouseOverEnabled(true);
        }

        if (this.tooltipTpl) {
            if (typeof this.tooltipTpl === 'string') {
                this.tooltipTpl = new Ext.XTemplate(this.tooltipTpl);
            }
            this.el.on(Ext.supports.Touch ? 'touchstart' : 'mousemove', this.setupTooltip, this, { single : true });
        }

        this.setupTimeCellEvents();

        var eventBarListeners = {
            delegate : this.eventSelector,
            scope    : this
        };

        var resourceRowListeners = {
            delegate : this.rowSelector,
            scope    : this
        };

        Ext.Array.each(this.ScheduleBarEvents, function (name) {
            eventBarListeners[name] = this.handleScheduleBarEvent;
        }, this);
        Ext.Array.each(this.ResourceRowEvents, function (name) {
            resourceRowListeners[name] = this.handleResourceRowEvent;
        }, this);

        this.el.on(eventBarListeners);
        this.el.on(resourceRowListeners);
    },

    setMouseOverEnabled : function (enabled) {
        this[enabled ? "mon" : "mun"](this.el, {
            mouseover : this.onEventMouseOver,
            mouseout  : this.onEventMouseOut,
            delegate  : this.eventSelector,
            scope     : this
        });

        if (!enabled) {
            this.getEl().select('.' + this.overScheduledEventClass).removeCls(this.overScheduledEventClass);
        }
    },

    // private
    onEventMouseOver : function (e, t) {
        if (t !== this.hoveredEventNode && !this.preventOverCls) {
            this.hoveredEventNode = t;

            Ext.fly(t).addCls(this.overScheduledEventClass);

            var eventModel = this.resolveEventRecord(t);

            // do not fire this event if model cannot be found
            // this can be the case for "sch-dragcreator-proxy" elements for example
            if (eventModel) this.fireEvent('eventmouseenter', this, eventModel, e);
        }
    },

    // private
    onEventMouseOut : function (e, t) {
        if (this.hoveredEventNode) {
            if (!e.within(this.hoveredEventNode, true, true)) {
                Ext.fly(this.hoveredEventNode).removeCls(this.overScheduledEventClass);

                this.fireEvent('eventmouseleave', this, this.resolveEventRecord(this.hoveredEventNode), e);
                this.hoveredEventNode = null;
            }
        }
    },

    // Overridden since locked grid can try to highlight items in the unlocked grid while it's loading/empty
    highlightItem : function (item) {
        if (item) {
            var me             = this;
            me.clearHighlight();
            me.highlightedItem = item;
            Ext.fly(item).addCls(me.overItemCls);
        }
    },

    // private
    setupTooltip : function () {
        var me     = this,
            target = me.getEl();

        me.tip = new Sch.tooltip.EventTip(Ext.apply({
            view             : me,
            delegate         : me.eventSelector,
            target           : target,
            showOnTap        : true, // On hybrid mouse/touch systems, we want to show the tip on touch
            dismissDelay     : 0,
            rtl              : me.rtl
        }, me.tipCfg));
    },

    getHorizontalTimeAxisColumn : function () {
        if (!this.timeAxisColumn) {
            this.timeAxisColumn = this.headerCt.down('timeaxiscolumn');

            if (this.timeAxisColumn) {
                this.timeAxisColumn.on('destroy', function () {
                    this.timeAxisColumn = null;
                }, this);
            }
        }

        return this.timeAxisColumn;
    },

    /**
     * Template method to allow you to easily provide data for your {@link Sch.mixin.TimelinePanel#tooltipTpl} template.
     * @param {Sch.model.Range} record The event record corresponding to the HTML element that triggered the tooltip to show.
     * @param {HTMLElement} triggerElement The HTML element that triggered the tooltip.
     * @return {Object} The data to be applied to your template, typically any object or array.
     */
    getDataForTooltipTpl : function (record, triggerElement) {
        return Ext.apply({
            _record : record
        }, record.data);
    },

    /**
     * Refreshes the view and maintains the scroll position.
     */
    refreshKeepingScroll : function () {
        Ext.suspendLayouts();

        this.blockRestoringInfiniteScrollDate();

        this.refreshView();
        // we have to resume layouts before scroll in order to let element receive its new width after refresh
        Ext.resumeLayouts(true);

        this.resumeRestoringInfiniteScrollDate();
    },

    setupTimeCellEvents : function () {
        this.mon(this.el, {
            // `handleScheduleEvent` is an abstract method, defined in "SchedulerView" and "GanttView"
            click       : this.handleScheduleEvent,
            dblclick    : this.handleScheduleEvent,
            contextmenu : this.handleScheduleEvent,
            longpress   : this.handleScheduleEvent,
            pinch       : this.handleScheduleEvent,
            pinchstart  : this.handleScheduleEvent,
            pinchend    : this.handleScheduleEvent,
            scope       : this
        });
    },

    getTableRegion : function () {
        var tableEl = this.el.down('.' + Ext.baseCSSPrefix + 'grid-item-container');

        // Also handle odd timing cases where the table hasn't yet been inserted into the dom
        return (tableEl || this.el).getRegion();
    },

    // Returns the row element for a given row record
    getRowNode : function (resourceRecord) {
        return this.getNodeByRecord(resourceRecord);
    },

    findRowByChild : function (t) {
        return this.findItemByChild(t);
    },

    getRecordForRowNode : function (node) {
        return this.getRecord(node);
    },

    /**
     * Refreshes the view and maintains the resource axis scroll position.
     */
    refreshKeepingResourceScroll : function () {
        var scroll = this.getScroll();

        this.refreshView();

        if (this.isHorizontal()) {
            this.scrollVerticallyTo(scroll.top);
        } else {
            this.scrollHorizontallyTo(scroll.left);
        }
    },

    scrollHorizontallyTo : function (x, animate) {
        if (this.rendered)
            this.scrollTo(x, null, animate);
    },

    scrollVerticallyTo : function (y, animate) {
        if (this.rendered)
            this.scrollTo(null, y, animate);
    },

    getVerticalScroll : function () {
        return this.getScrollY();
    },

    getHorizontalScroll : function () {
        return this.getScrollX();
    },

    getScroll : function () {
        var me = this;

        return {
            top  : me.getVerticalScroll(),
            left : me.getHorizontalScroll()
        };
    },

    handleScheduleEvent : function () {
    },

    disableViewScroller : function (disabled) {
        var scroller = this.getScrollable();

        if (scroller) {
            if (scroller.setDisabled) {
                scroller.setDisabled(disabled);
            }
            else {
                var verticalScroller = this.up('timelinetree,timelinegrid').getScrollable();

                // Ext 6.2.0+ has vertical/horizontal scrolling implemented on different scrollers
                scroller.setConfig({ x : !disabled, y : !disabled });

                verticalScroller.setConfig({ x : !disabled, y : !disabled });
            }
        }
    },

    // Since Ext JS has different internal RTL behavior depending on presence of a Viewport,
    // we use this method to check if we need to adjust for RTL or if it's done internally in Ext
    shouldAdjustForRtl : function() {
        return this.rtl && !Ext.rootInheritedState.rtl;
    },

    // Decides whether to use 'left' or 'right' based on RTL mode
    getHorizontalPositionSide : function() {
        return this.rtl ? 'right' : 'left';
    },

    getViewContainerElementTop : function() {
        var el = this.up('timelinegrid,timelinetree').getView().el;

        return el.getY();
    },

    // Returns the height of the scrollable view area
    // https://www.sencha.com/forum/showthread.php?327418-6-2-Breaking-change-GridView-getHeight-contract-changed&p=1157660#post1157660
    getViewContainerHeight : function() {
        return this.up('timelinegrid,timelinetree').getView().el.getHeight();
    },

    getScrollableMaxPosition : function() {
        return {
            x : this.getScrollable().getMaxPosition().x,
            y : this.getVerticalScrollableMaxHeight()
        };
    },


    getVerticalScroller : function() {
        return this.up('timelinegrid,timelinetree').getScrollable();
    },

    getVerticalScrollableMaxHeight : function () {
        return this.getVerticalScroller().getMaxPosition().y;
    },

    getScrollableContainerRegion : function(){
        var region = this.getEl().getRegion();

        region.top = this.up('timelinegrid, timelinetree').getScrollable().getElement().getY();

        return new Ext.util.Region(region.top, region.right, region.top + this.getViewContainerHeight(), region.left);
    },

    scrollHorizontallyBy : function(deltaX, options) {
        // bug in ext https://support.sencha.com/#ticket-40066
        this.scrollBy(deltaX, null, options);
    },

    scrollVerticallyBy : function(deltaY, options) {
        var scrollable = this.up('timelinegrid, timelinetree').getScrollable();

        scrollable.scrollBy(0, deltaY, options);
    },

    // The code is copied from Ext.dom.Element.doScrollIntoView of Ext 6.2.1 and 6.0.2
    // Modified for including edgeOffset and calling callback function with passed scope
    scrollElementIntoView : function (el, hscroll, animate, highlight, edgeOffset, callback, scope) {
        var me         = this,
            dom        = el.dom,
            scroll     = me.getScroll(),
            scrollX    = scroll.left,
            scrollY    = scroll.top,
            position   = me.getScrollIntoViewXY(el, scrollX, scrollY, edgeOffset),
            newScrollX = position.x,
            newScrollY = position.y,
            x, y;

        x = hscroll !== false ? newScrollX : scrollX;
        y = newScrollY;

        if (x !== scrollX || y !== scrollY) {
            me.on({
                scrollend : {
                    fn     : function () {
                                     // Element could have been destroyed during scrolling
                        highlight && el.dom && el.highlight();
                        callback && callback.call(scope);
                    },
                    scope  : me,
                    single : true
                }
            });

            me.scrollTo(x, y, animate);
        } else {
            // No scrolling needed
            highlight && el.dom && el.highlight();
            callback && callback.call(scope);
        }

        return me;
    },

    getScrollIntoViewXY : function (el, scrollX, scrollY, edgeOffset) {
        edgeOffset = Ext.isEmpty(edgeOffset) ? 20 : edgeOffset;

        // grid element is used to calculate view width and X offset
        // vertical scroll element is used to calculate view height and Y offset
        var gridEl                 = this.ownerCt.getEl(),
            verticalScrollEl       = this.getVerticalScroller().getElement(),
            offsetToGrid           = el.getOffsetsTo(gridEl),
            offsetToVerticalScroll = el.getOffsetsTo(verticalScrollEl),
            offsetX                = offsetToGrid[0],
            offsetY                = offsetToVerticalScroll[1],

            width                  = el.dom.offsetWidth,
            height                 = el.dom.offsetHeight,
            left                   = offsetX + scrollX,
            top                    = offsetY + scrollY,
            right                  = left + width,
            bottom                 = top + height,

            viewWidth              = gridEl.getWidth(),
            viewHeight             = verticalScrollEl.getHeight(),
            viewLeft               = scrollX,
            viewTop                = scrollY,
            viewRight              = viewLeft + viewWidth,
            viewBottom             = viewTop + viewHeight;

        /*
        Scroll direction is taken into account when scroll position is calculated
        so at the end it will look like natural scrolling
        we scroll to the event and stop as soon as we get to the event and leave some offset
        */

        // We scroll from bottom to the top (or if element > available view) and stop as soon as event is visible taking offset into account
        if (height > viewHeight || top < viewTop) {
            // Extract edgeOffset from top
            scrollY = top - edgeOffset;
        }
        // We scroll from top to the bottom and stop as soon as event is visible taking offset into account
        else if (bottom > viewBottom) {
            // Add edgeOffset to bottom
            scrollY = bottom - viewHeight + edgeOffset;
        }

        // We scroll from right to the left (or if element > available view) and stop as soon as event is visible taking offset into account
        if (width > viewWidth || left < viewLeft) {
            // Extract edgeOffset from left
            scrollX = left - edgeOffset;
        }
        // We scroll from left to the right and stop as soon as event is visible taking offset into account
        else if (right > viewRight) {
            // Add edgeOffset to right
            scrollX = right - viewWidth + edgeOffset;
        }


        // scrollX and scrollY positions should be from 0 to MAX, so need to adjust them in case they are less than 0
        scrollX = scrollX < 0 ? 0 : scrollX;
        scrollY = scrollY < 0 ? 0 : scrollY;

        return {
            x : scrollX,
            y : scrollY
        };
    }
    // End of the copied code
});
