/**

@class Sch.view.TimelineGridView
@extends Ext.grid.View
@mixins Sch.mixin.TimelineView

A grid view class, that consumes the {@link Sch.mixin.TimelineView} mixin. Used internally.

*/

Ext.define('Sch.view.TimelineGridView', {
    extend                     : 'Ext.grid.View',
    mixins                     : [ 'Sch.mixin.TimelineView' ],

    infiniteScroll             : false,

    bufferCoef                 : 5,
    bufferThreshold            : 0.2,

    // the scrolLeft position, as Date (not as pixels offset)
    cachedScrollDate           : null,
    boxIsReady                 : false,

    ignoreNextHorizontalScroll : false,

    constructor : function (config) {
        this.callParent(arguments);

        // setup has to happen in the "afterrender" event, because at that point, the view is not "ready" yet
        // so we can freely change the start/end dates of the timeaxis and no refreshes will happen
        if (this.infiniteScroll) {
            this.on('boxready', this.setupInfiniteScroll, this);
        }

        if(this.timeAxisViewModel) {
            this.relayEvents(this.timeAxisViewModel, ['columnwidthchange']);
        }
    },

    setupInfiniteScroll : function () {
        var planner                 = this.panel.ownerCt;
        this.cachedScrollDate   = planner.startDate || this.timeAxis.getStart();

        // check if it's touch microsoft
        if (Ext.getVersion().isLessThan('6.0.1') && Ext.supports.Touch && Ext.os.is.Windows) {
            var headerScroll    = this.panel.headerCt.getScrollable();
            var viewScroll      = this.getScrollable();

            // When scroll is done, Ext throws special event called 'idle'
            // Touch scroller handles that event and performs scroll to [0, 0]
            // Our 'scroll' event handler remembers new view start date and keeps it in memory
            // Disabling this handler seemingly doesn't break anything in case of infinite scroll enabled
            headerScroll.onIdle && Ext.GlobalEvents.un('idle', headerScroll.onIdle, headerScroll);
            viewScroll.onIdle && Ext.GlobalEvents.un('idle', viewScroll.onIdle, viewScroll);
        }

        var me                      = this;

        planner.calculateOptimalDateRange = function (centerDate, panelSize, nextZoomLevel, span) {
            if (span) {
                return span;
            }

            var preset      = Sch.preset.Manager.getPreset(nextZoomLevel.preset);

            return me.calculateInfiniteScrollingDateRange(
                // me.ol.dom.scrollLeft can differ for obvious reasons thus method can return different result for same arguments
                // better user centerDate
                //me.getDateFromCoordinate(me.el.dom.scrollLeft, null, true),
                centerDate,
                preset.getBottomHeader().unit,
                nextZoomLevel.increment,
                nextZoomLevel.width,
                true
            );
        };

        // setup scroll/resize listeners
        this.bindInfiniteScrollListeners();
    },


    bindInfiniteScrollListeners : function () {
        this.getScrollable().on('scroll', this.onHorizontalScroll, this);
        this.infiniteScroll = true;

    },

    unbindInfiniteScrollListeners : function () {
        this.getScrollable().un('scroll', this.onHorizontalScroll, this);
        this.infiniteScroll = false;
    },


    onHorizontalScroll : function (scrollable, scrollLeft, scrollTop) {
        if (this.ignoreNextHorizontalScroll || this.cachedScrollDate) {
            this.ignoreNextHorizontalScroll = false;
            return;
        }

        var scrollbarSize = Ext.getScrollbarSize(),
            width         = this.getWidth(),
            limit         = width * this.bufferThreshold * this.bufferCoef,
            scrollWidth   = this.getScrollable().getMaxPosition().x;

        // we cannot do: scrollWidth = this.getScrollable().getMaxPosition().x - scrollbarSize.width;
        // since it'll cause false failing of unscoped css rules test ..because minified it looks similar to
        // hardcoded extjs selector
        scrollWidth -= scrollbarSize.width;

        // if scroll violates limits let's shift timespan
        if ((scrollWidth - scrollLeft < limit) || scrollLeft < limit) {
            this.shiftToDate(this.getDateFromCoordinate(scrollLeft, null, true));

            // Make sure any scrolling which could have been triggered by the Bryntum ScrollManager (drag drop of task),
            // is cancelled

            // https://www.sencha.com/forum/showthread.php?331677-Animation-is-not-stopping&p=1164840#post1164840
            // Animation in 6.2.0 stopped differently
            if (Ext.getVersion().isGreaterThan('6.2.0')) {
                var translatable = this.getScrollable()._translatable || this.getScrollable().translatable;
                translatable && translatable.stopAnimation();
            } else {
                this.el.stopAnimation();
            }
        }
    },

    // TODO: investigate if we need this method now when we use refreshView instead
    refresh : function () {
        this.callParent(arguments);

        // `scrollStateSaved` will mean that refresh happens as part of `refreshKeepingScroll`,
        // which already does `restoreScrollState`, which includes `restoreScrollToCachedDate`
        if (this.infiniteScroll && !this.scrollStateSaved && this.boxIsReady) {
            this.restoreScrollToCachedDate();
        }
    },


    onResize : function (width, height, oldWidth, oldHeight) {
        this.boxIsReady = true;

        this.callParent(arguments);

        // TODO this should be optimized to not perform any operations as long as view size doesn't increase
        // enough to pass the buffer limits
        if (this.infiniteScroll && width > 0 && width !== oldWidth) {
            // When size increases - we should maintain the left visible date in the component to not confuse the user
            this.shiftToDate(this.cachedScrollDate || this.getVisibleDateRange().startDate, this.cachedScrollDateIsCentered);
        }
    },


    restoreScrollToCachedDate : function () {
        if (this.cachedScrollDate && this.boxIsReady) {
            this.ignoreNextHorizontalScroll = true;

            this.scrollToDate(this.cachedScrollDate);

            this.cachedScrollDate           = null;
        }
    },


    scrollToDate : function (toDate) {
        this.cachedScrollDate = toDate;

        if (this.cachedScrollDateIsCentered) {
            this.panel.ownerCt.scrollToDateCentered(toDate);
        } else {
            this.panel.ownerCt.scrollToDate(toDate);
        }

        var scrollLeft                      = this.getScrollX();

        // the `onRestoreHorzScroll` method in Ext.panel.Table is called during Ext.resumeLayouts(true) (in the `refreshKeepingScroll`)
        // and messes up the scrolling position (in the called `syncHorizontalScroll` method).
        // Overwrite the property `syncHorizontalScroll` is using to read the scroll position, so that no actual change will happen
        this.panel.scrollLeftPos            = scrollLeft;

        // the previous line however, breaks the header sync, doing that manually
        this.headerCt.setScrollX(scrollLeft);

        if (Ext.getVersion().isGreaterThan('6.2.0')) {
            // 6.2.0 is saving scroll position on updateLayout and restore shortly after. If we want to save
            // scroll position we have to override this saved scroll, or call scrollTo on scheduler grid/tree
            // 01_rendering
            this.up('timelinegrid,timelinetree').lastScrollPos.x = scrollLeft;
        }
    },


    // This method is raising flag to show there's no need to restore scroll in refresh method
    blockRestoringInfiniteScrollDate : function () {
        this.scrollStateSaved = this.boxIsReady;
    },


    resumeRestoringInfiniteScrollDate : function () {
        this.scrollStateSaved = false;

        // if we have scroll date then let's calculate left-coordinate by this date
        // and top-coordinate we'll get from the last saved scroll state
        if (this.infiniteScroll && this.cachedScrollDate) {
            this.restoreScrollToCachedDate();
        }
    },


    // `calculateOptimalDateRange` already exists in Zoomable plugin
    calculateInfiniteScrollingDateRange : function (date, unit, increment, tickWidth, centered) {
        var timeAxis            = this.timeAxis,
            viewWidth           = this.getWidth(),
            result;

        tickWidth               = tickWidth || this.timeAxisViewModel.getTickWidth();
        increment               = increment || timeAxis.increment || 1;
        unit                    = unit || timeAxis.unit;

        var DATE                = Sch.util.Date;

        var bufferedTicks       = Math.ceil(viewWidth * this.bufferCoef / tickWidth);

        // if provided date is the central point on the timespan
        if (centered) {
            var halfSpan = Math.ceil((viewWidth * (1 + this.bufferCoef)) / (2 * tickWidth)) * increment;

            result = {
                start   : timeAxis.floorDate(DATE.add(date, unit, - halfSpan), false, unit, increment),
                end     : timeAxis.ceilDate(DATE.add(date, unit, halfSpan), false, unit, increment)
            };

        // if provided date is the left coordinate of the visible timespan area
        } else {
            result = {
                start   : timeAxis.floorDate(DATE.add(date, unit, -bufferedTicks * increment), false, unit, increment),
                end     : timeAxis.ceilDate(DATE.add(date, unit, Math.ceil((viewWidth / tickWidth + bufferedTicks) * increment)), false, unit, increment)
            };
        }

        return result;
    },


    shiftToDate : function (date, centered) {
        var newRange            = this.calculateInfiniteScrollingDateRange(date, null, null, null, centered);

        // we set scroll date here since it will be required during timeAxis.setTimeSpan() call
        this.cachedScrollDate           = date;
        this.cachedScrollDateIsCentered = centered;

        // this will trigger a refresh (`refreshKeepingScroll`) which will perform `restoreScrollState` and sync the scrolling position
        this.timeAxis.setTimeSpan(newRange.start, newRange.end);
    },

    clearViewEl : function() {
        var me = this,
            secondaryCanvas = me.getSecondaryCanvasEl(),
            proxy = secondaryCanvas && secondaryCanvas.dom.querySelector('.' + Ext.baseCSSPrefix + 'dd-drag-proxy');

        proxy && secondaryCanvas.dom.removeChild(proxy);

        this.callParent(arguments);

        if (proxy) {
            me.getSecondaryCanvasEl().dom.appendChild(proxy);
        }
    },

    destroy : function () {
        if (this.infiniteScroll && this.rendered) this.unbindInfiniteScrollListeners();

        this.callParent(arguments);
    }

});
