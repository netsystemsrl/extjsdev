/**
 Internal class syncing size/state of the locked grid in two Timeline panels.
 */
Ext.define('Sch.mixin.PartnerTimelinePanel', {
    extend : 'Ext.Mixin',

    setupPartnerTimelinePanel : function (panel) {
        // Sync locked grids by listening for splitter resize events of both locked grids.
        var otherPanel      = this.partnerTimelinePanel;
        var otherLockedGrid = otherPanel.lockedGrid;
        var ourLockedGrid   = this.lockedGrid;

        otherLockedGrid.mon(ourLockedGrid, 'resize', this.onLockedGridResize, otherLockedGrid);
        ourLockedGrid.mon(otherLockedGrid, 'resize', this.onLockedGridResize, ourLockedGrid);

        var lockedWidth = otherPanel.isVisible() ? otherPanel.lockedGrid.getWidth() : otherPanel.lockedGrid.width;

        // Ext doesn't support initially collapsed locked grid, exception will be raised.
        if (otherLockedGrid.getCollapsed()) {
            // after locked grid is initially expanded we can sync width
            this.mon(otherLockedGrid, 'viewready', function (panel) {
                ourLockedGrid.setWidth(panel.getWidth());
            });
        } else {
            ourLockedGrid.setWidth(lockedWidth);
        }

        // if we change collapse state in process of layout update
        // component won't be collapsible/expandable anymore
        this.on('afterlayout', function () {
            if (otherLockedGrid.getCollapsed()) {
                ourLockedGrid.collapse();
            } else {
                ourLockedGrid.expand();
                ourLockedGrid.setWidth(lockedWidth);
            }
        }, this, { single : true });

        otherLockedGrid.on({
            collapse : this.onPartnerCollapseExpand,
            expand   : this.onPartnerCollapseExpand,
            scope    : this
        });

        ourLockedGrid.on({
            collapse : this.onPartnerCollapseExpand,
            expand   : this.onPartnerCollapseExpand,
            scope    : otherPanel
        });

        this.setupScrollSync();

        /* HACK

         Ext.scroll.Scroller is responsible for sharing scroll position between partners. Partnership is a two-way
         binding between two scrollables, who are aware of own scroll and propagate it to another. While scroll on one
         is changing, other is told to stop sharing scroll.
         For example (refer to the picture below): view1 and header1 are partners. When view1 change left scroll it
         tells header1 to suspend, pass it new scroll value and start buffered callback with 100 ms interval. That
         callback will resume header1. When browser scroll event happen on header1 it tries to sync position with
         partner (view1), but it is told not to - here and after EXT-SYNC.

         Our partner panels also share scroll (here and after SCH-SYNC) between views - view1 and view2 on scheme.

         This lead to a following zooming scenario:
         1) view1 is zoomed and start throwing scroll events
         2) view2 is scrolled by SCH-SYNC
         3) header2 is scrolled by EXT-SYNC, because view2 scroll changed.
         4) view1 is scrolled to correct coordinate by zoomable mixin
         5) view2 is scrolled to correct coordinate by SCH-SYNC
         6) view2 tries to sync scroll with header2 - EXT-SYNC - but header2 at some point started scrolling and
         suspended view2 from sharing it's sync. In result header1, view1 and view2 have new, correct scroll and header2
         contain scroll position that was before zoom.
         |------------|   |------------|
         |   header1  |   |   header2  |
         |------------|   |------------|
         |    view1   |   |    view2   |
         |------------|   |------------|

         Idea to fix is simple - avoid suspending partner scroll. Works well for case with 2 partners. We also need this
         hack only with zooming, this is why beforezoomchange event is required.
         */
        otherPanel.mon(this, 'beforezoomchange', this.onBeforeZoomChange, this);
        otherPanel.mon(this, 'viewchange', this.onViewChange, this);
        this.mon(otherPanel, 'beforezoomchange', this.onBeforeZoomChange, this);
        this.mon(otherPanel, 'viewchange', this.onViewChange, this);
    },

    // Scope of 'this' is set to the other panel in the listener
    onLockedGridResize : function(cmp, width) {
        this.setWidth(width);
    },

    onPartnerCollapseExpand : function (panel) {
        if (panel.getCollapsed()) {
            this.lockedGrid.collapse();
        } else {
            this.lockedGrid.expand();
        }
    },


    setupScrollSync : function () {
        // sync scrolling with external timeline panel
        var otherView         = this.partnerTimelinePanel.getSchedulingView(),
            otherScrollSource = this.partnerTimelinePanel.getMode() === 'horizontal' ? otherView.getScrollable() : this.partnerTimelinePanel.getScrollable(),
            ownView           = this.getSchedulingView(),
            ownScrollSource   = this.getMode() === 'horizontal' ? ownView.getScrollable() : this.getScrollable(),
            asapScrolling;

        function onSyncScrollStart(scrollable) {
            var source = scrollable === ownScrollSource ? ownScrollSource : otherScrollSource,
                target = scrollable === ownScrollSource ? otherScrollSource : ownScrollSource;

            if (!asapScrolling) {
                source.component.mun(target, 'scrollstart', onSyncScrollStart);
                target.component.mun(source, 'scrollstart', onSyncScrollStart);

                source.component.mon(source, 'scroll',    doScrollSync);
                source.component.mon(source, 'scrollend', onSyncScrollEnd);
            }
        }

        function doScrollSync(syncFromScrollable, x, y) {
            var source = syncFromScrollable === ownScrollSource ? ownScrollSource : otherScrollSource,
                target = syncFromScrollable === ownScrollSource ? otherScrollSource : ownScrollSource;

            // header might be hidden with hideHeaders: true
            var headerScrollable = target.component.headerCt.getScrollable();

            asapScrolling = Ext.asap(function() {

                var delta, position;

                position = target.getPosition();

                if (position && ownView.getMode() === 'horizontal') {

                    delta = Math.abs(position.x - x);

                    if (delta) {
                        headerScrollable && !headerScrollable.destroyed && headerScrollable.scrollTo(x, null);
                        !target.destroyed && target.scrollTo(x);
                        asapScrolling = false;
                    }
                    else {
                        asapScrolling = false;
                    }
                } else if (position) {
                    delta = Math.abs(position.y != y);

                    if (delta) {
                        !target.destroyed && target.scrollTo(null, y);
                    }
                    asapScrolling = false;
                }
            });
        }

        function onSyncScrollEnd(scrollable) {
            var source = scrollable === ownScrollSource ? ownScrollSource : otherScrollSource,
                target = scrollable === ownScrollSource ? otherScrollSource : ownScrollSource;

            source.component.mun(source, 'scroll',    doScrollSync);
            source.component.mun(source, 'scrollend', onSyncScrollEnd);

            source.component.mon(target, 'scrollstart', onSyncScrollStart);
            target.component.mon(source, 'scrollstart', onSyncScrollStart);
        }

        function startScrollMonitoring() {
            otherScrollSource.component.mon(ownScrollSource, 'scrollstart', onSyncScrollStart);
            ownScrollSource.component.mon(otherScrollSource, 'scrollstart', onSyncScrollStart);
        }

        function stopScrollMonitoring() {
            otherScrollSource.component.mun(ownScrollSource, 'scrollstart', onSyncScrollStart);
            ownScrollSource.component.mun(otherScrollSource, 'scrollstart', onSyncScrollStart);
        }

        this.partnerTimelinePanel.mon(this, {
            'show'        : function () {
                doScrollSync(otherScrollSource, otherScrollSource.getPosition().x, otherScrollSource.getPosition().y);
            }
        });

        this.mon(this.partnerTimelinePanel, {
            'show'        : function () {
                doScrollSync(ownScrollSource, ownScrollSource.getPosition().x, ownScrollSource.getPosition().y);
            }
        });

        startScrollMonitoring();
    },

    // Update the 'viewPreset' property manually since it's a public property of the TimelinePanel.
    onViewChange : function (panel) {
        // Both panels associated with timeaxis viewmodel will fire viewchange event, but partner will do it last. We
        // need to sync viewPreset but we cannot know here which one is correct. Thus we get it from viewmodel which
        // will store value passed to setViewPreset method of panel
        if (panel === this) {
            this.partnerTimelinePanel.viewPreset = this.viewPreset = this.timeAxisViewModel.viewPreset;
        }
    },

    onBeforeZoomChange : function () {
        var otherPanel        = this.partnerTimelinePanel;
        var scrollable        = otherPanel.getSchedulingView().getScrollable(),
            old               = scrollable.suspendPartnerSync;

        scrollable.suspendPartnerSync = Ext.emptyFn;

        scrollable.on('scrollend', function () {
            scrollable.suspendPartnerSync = old;
        }, null, { single : true });
    }
});
