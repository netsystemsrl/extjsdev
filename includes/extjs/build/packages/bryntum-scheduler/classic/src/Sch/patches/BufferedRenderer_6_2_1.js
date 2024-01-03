// When changing orientation to vertical reconfigureBufferedRendering is invoked to update view size on plugins,
// which lead to infinite recursion in method getFirstVisibleRowIndex
// Reproducible in older IE11 (less than 11.576) in tests 002_column_width, 040_schedulergrid, 3101_viewsorters
Ext.define('Sch.patches.BufferedRenderer_6_2_1', {
    extend      : 'Sch.util.Patch',

    target      : 'Ext.grid.plugin.BufferedRenderer',

    minVersion  : '6.2.1',

    applyFn     : function () {
        if (Ext.isIE11) {
            Ext.define(null, {
                override : 'Ext.grid.plugin.BufferedRenderer',

                getFirstVisibleRowIndex: function(startRow, endRow, viewportTop, viewportBottom) {
                    var me = this,
                        view = me.view,
                        rows = view.all,
                        elements = rows.elements,
                        clientHeight = me.viewClientHeight,
                        target, targetTop,
                        bodyTop = me.bodyTop;
                    // If variableRowHeight, we have to search for the first row who's bottom edge is within the viewport
                    if (rows.getCount() && me.variableRowHeight) {
                        if (!arguments.length) {
                            startRow = rows.startIndex;
                            endRow = rows.endIndex;
                            viewportTop = me.scrollTop;
                            viewportBottom = viewportTop + clientHeight;
                            // Teleported so that body is outside viewport: Use rowHeight calculation
                            if (bodyTop > viewportBottom || bodyTop + me.bodyHeight < viewportTop) {
                                me.teleported = true;
                                return Math.floor(me.scrollTop / me.rowHeight);
                            }
                            // In first, non-recursive call, begin targeting the most likely first row
                            target = startRow + Math.min(me.numFromEdge + ((me.lastScrollDirection === -1) ? me.leadingBufferZone : me.trailingBufferZone), Math.floor((endRow - startRow) / 2));
                        } else {
                            if (startRow === endRow) {
                                return endRow;
                            }
                            target = startRow + Math.floor((endRow - startRow) / 2);
                        }
                        var targetElement = elements[target];
                        targetTop = bodyTop + targetElement.offsetTop;
                        // If target is entirely above the viewport, chop downwards

                        // PATCH
                        // We add last condition to filter out cases when IE doesn't yet calculated offsetHeight.
                        // In fact, offsetHeight is 0 and clientHeight is properly calculated, which is obviously
                        // shouldn't be possible
                        if (targetTop + targetElement.offsetHeight <= viewportTop && targetElement.offsetHeight) {
                            return me.getFirstVisibleRowIndex(target + 1, endRow, viewportTop, viewportBottom);
                        }

                        // Target is first
                        if (targetTop <= viewportTop) {
                            return target;
                        }
                        // Not narrowed down to 1 yet; chop upwards
                        else if (target !== startRow) {
                            return me.getFirstVisibleRowIndex(startRow, target - 1, viewportTop, viewportBottom);
                        }
                    }
                    return Math.floor(me.scrollTop / me.rowHeight);
                }
            });
        }
    }
});