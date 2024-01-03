// https://www.bryntum.com/forum/viewtopic.php?f=39&t=9258
// toggling collapse/expand of a tree parent node scrolls view to the top
Ext.define('Sch.patches.BufferedRenderer', {
    extend : 'Sch.util.Patch',
    target : 'Ext.grid.plugin.BufferedRenderer',

    overrides : {
        refreshView : function () {
            var view      = this.view,
                otherView = view.lockingPartner;

            // If the other view has refreshed first, use the same startIndex as that.
            if (!arguments.length && otherView && otherView.refreshCounter > view.refreshCounter) {
                this.callParent([otherView.all.startIndex]);
            }
            else {
                this.callParent(arguments);
            }
        },

        setBodyTop : function (bodyTop, skipStretchView) {
            var view = this.view,
                rows = view.all;

            if (!view.rendered) return;

            var spacerXY = this.grid.ownerCt && this.grid.ownerCt.scrollable && this.grid.ownerCt.scrollable.getSpacerXY();

            // BufferedRenderer#setBodyTop needs to do this.
            // Being at the end of the dataset means we MUST stretch the
            // scroll range. Otherwise we can't get to the end.
            if (rows.endIndex === view.store.getCount() - 1) {
                skipStretchView = false;
            }
                // Also, if we're *not* at the end of the dataset, but the set scrollHeight
            // is less than the real scrollHeight, we need to set the scroll range
            else if (spacerXY && spacerXY.y <= this.scrollHeight - 1) {
                skipStretchView = false;
            }

            var returnValue = this.callParent(arguments);

            view.fireEvent('bufferedrefresh', this);

            return returnValue;
        },

        getScrollHeight : function () {
            var me       = this,
                view     = me.view,
                rows     = view.all,
                store    = me.store,
                recCount = store.getCount(),
                rowCount = rows.getCount(),
                row, rowHeight, borderWidth, scrollHeight;
            if (!recCount) {
                return 0;
            }
            if (!me.hasOwnProperty('rowHeight')) {
                if (rowCount) {
                    if (me.variableRowHeight) {
                        me.rowHeight = Math.floor(me.bodyHeight / rowCount);
                    }
                    else {
                        row       = rows.first();
                        rowHeight = row.getHeight();
                        // In IE8 we're adding bottom border on all the rows to work around
                        // the lack of :last-child selector, and we compensate that by setting
                        // a negative top margin that equals the border width, so that top and
                        // bottom borders overlap on adjacent rows. Negative margin does not
                        // affect the row's reported height though so we have to compensate
                        // for that effectively invisible additional border width here.
                        if (Ext.isIE8) {
                            borderWidth = row.getBorderWidth('b');
                            if (borderWidth > 0) {
                                rowHeight -= borderWidth;
                            }
                        }
                        me.rowHeight = rowHeight;
                    }
                }
                else {
                    delete me.rowHeight;
                }
            }
            if (me.variableRowHeight) {
                // If this is the last page, ensure the scroll range is exactly enough
                // to scroll to the end of the rendered block.
                if (rows.endIndex === recCount - 1) {
                    scrollHeight = me.bodyTop + me.bodyHeight - 1;
                }
                else // Calculate the scroll range based upon measured row height and our scrollPosition.
                {
                    scrollHeight = Math.floor((recCount - rowCount) * me.rowHeight) + me.bodyHeight;
                    // If there's a discrepancy between the body position we have scrolled to,
                    // and the calculated position, account for that in the scroll range
                    // so that we have enough range to scroll all the data into view.
                    //
                    //
                    // THE FIX: must only increment the height, not decrement it
                    scrollHeight += Math.max(me.bodyTop - rows.startIndex * me.rowHeight, 0);
                }
            }
            else {
                scrollHeight = Math.floor(recCount * me.rowHeight);
            }
            return (me.scrollHeight = scrollHeight);
        }
    }
});
