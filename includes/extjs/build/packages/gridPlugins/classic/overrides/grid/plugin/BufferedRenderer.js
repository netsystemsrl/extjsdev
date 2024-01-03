/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.grid.plugin.BufferedRenderer', {
    override: 'Ext.grid.plugin.BufferedRenderer',

    scrollTo: function(recordIdx, options) {
        var args = arguments,
            me = this,
            view = me.view,
            lockingPartner = view.lockingPartner && view.lockingPartner.grid.isVisible() && view.lockingPartner.bufferedRenderer,
            store = me.store,
            total = store.getCount(),
            startIdx, endIdx,
            targetRow,
            tableTop,
            groupingFeature,
            metaGroup,
            record,
            direction;

        // New option object API
        if (options !== undefined && !(options instanceof Object)) {
            options = {
                select : args[1],
                callback: args[2],
                scope: args[3]
            };
        }

        // <fix>
        if (view.dataSource.isMultigroupStore) {
            if (recordIdx.isEntity) {
                record = recordIdx;
            } else {
                record = view.store.getAt(Math.min(Math.max(recordIdx, 0), view.store.getCount() - 1));
            }

            if(!view.dataSource.isExpandingOrCollapsing && view.dataSource.isInCollapsedGroup(record)) {
                // we need to make sure all groups the record belongs to are expanded
                view.dataSource.expandToRecord(record);
            }
            recordIdx = view.dataSource.indexOf(record);

        // </fix>

        } else {

            if (recordIdx.isEntity) {
                record = recordIdx;
                recordIdx = store.indexOf(record);

                // Currently loaded pages do not contain the passed record, we cannot proceed.
                if (recordIdx === -1) {
                    //<debug>
                    Ext.raise('Unknown record passed to BufferedRenderer#scrollTo');
                    //</debug>
                    return;
                }
            } else {
                // Sanitize the requested record index
                recordIdx = Math.min(Math.max(recordIdx, 0), total - 1);
                record = store.getAt(recordIdx);
            }
        }

        // See if the required row for that record happens to be within the rendered range.
        if (record && (targetRow = view.getNode(record))) {
            view.grid.ensureVisible(record,options);

            // Keep the view immediately replenished when we scroll an existing element into view.
            // DOM scroll events fire asynchronously, and we must not leave subsequent code without a valid buffered row block.
            me.onViewScroll();
            me.onViewScrollEnd();

            return;
        }

        // Calculate view start index.
        // If the required record is above the fold...
        if (recordIdx < view.all.startIndex) {
            // The startIndex of the new rendered range is a little less than the target record index.
            direction = -1;
            startIdx = Math.max(Math.min(recordIdx - (Math.floor((me.leadingBufferZone + me.trailingBufferZone) / 2)), total - me.viewSize + 1), 0);
            endIdx = Math.min(startIdx + me.viewSize - 1, total - 1);
        }
        // If the required record is below the fold...
        else {
            // The endIndex of the new rendered range is a little greater than the target record index.
            direction = 1;
            endIdx = Math.min(recordIdx + (Math.floor((me.leadingBufferZone + me.trailingBufferZone) / 2)), total - 1);
            startIdx = Math.max(endIdx - (me.viewSize - 1), 0);
        }
        tableTop = Math.max(startIdx * me.rowHeight, 0);

        store.getRange(startIdx, endIdx, {
            callback: function(range, start, end) {
                // Render the range.
                // Pass synchronous flag so that it does it inline, not on a timer.
                // Pass fromLockingPartner flag so that it does not inform the lockingPartner.
                me.renderRange(start, end, true, true);
                record = store.data.getRange(recordIdx, recordIdx + 1)[0];
                targetRow = view.getNode(record);

                // bodyTop property must track the translated position of the body
                view.body.translate(null, me.bodyTop = tableTop);

                // Ensure the scroller knows about the range if we're going down
                if (direction === 1) {
                    me.refreshSize();
                }

                // Locking partner must render the same range
                if (lockingPartner) {
                    lockingPartner.renderRange(start, end, true, true);

                    // Sync all row heights
                    me.syncRowHeights();

                    // bodyTop property must track the translated position of the body
                    lockingPartner.view.body.translate(null, lockingPartner.bodyTop = tableTop);

                    // Ensure the scroller knows about the range if we're going down
                    if (direction === 1) {
                        lockingPartner.refreshSize();
                    }
                }

                // The target does not map to a view node.
                // Cannot scroll to it.
                if (!targetRow) {
                    return;
                }
                view.grid.ensureVisible(record,options);

                me.scrollTop = me.position = me.scroller.getPosition().y;

                if (lockingPartner) {
                    lockingPartner.position = lockingPartner.scrollTop = me.scrollTop;
                }
            }
        });
    }

//
// //     onViewScroll: function(scroller, x, scrollTop, deltaX, deltaY) {
// //         var me = this,
// //             bodyDom = me.view.body.dom,
// //             store = me.store,
// //             totalCount = (store.getCount()),
// //             vscrollDistance,
// //             scrollDirection,
// //             direction;
// //
// //         // May be directly called with no args, as well as from the Scroller's scroll event
// //         me.scrollTop = scrollTop == null ? (scrollTop = me.scroller.getPosition().y) : scrollTop;
// //
// //         // Because lockable assemblies now only have one Y scroller,
// //         // initially hidden grids (one side may begin with all the columns)
// //         // still get the scroll notification, but may not have any DOM
// //         // to scroll.
// //         if (bodyDom) {
// //             // Only check for nearing the edge if we are enabled, and if there is overflow beyond our view bounds.
// //             // If there is no paging to be done (Store's dataset is all in memory) we will be disabled.
// //             if (!(me.disabled || totalCount < me.viewSize)) {
// //
// //                 // vscrollDistance = scrollTop - me.position;
// //                 // HERE is the fix; deltaY should be taken into consideration because
// //                 // it represents the number of pixels we go into that direction
// //                 // so it's useful to calculate the scroll direction precisely
// //                 // If not then when keeping PgUp or PgDwn pressed the scroll direction
// //                 // is miscalculated and we end up in an endless loop
// //                 vscrollDistance = scrollTop - me.position;// - deltaY;
// //                 scrollDirection = vscrollDistance > 0 ? 1 : -1;
// // console.log(scrollTop, me.position, vscrollDistance, scrollDirection);
// //                 // Moved at least 20 pixels, or changed direction, so test whether the numFromEdge is triggered
// //                 if (Math.abs(vscrollDistance) >= 20 || (scrollDirection !== me.lastScrollDirection)) {
// //                     me.lastScrollDirection = scrollDirection;
// //                     me.handleViewScroll(me.lastScrollDirection, vscrollDistance);
// //                 }
// //             }
// //         }
// //     },
});