/**
 * Class which finds rectangular path, i.e. path with 90 degrees turns, between two boxes.
 */
Ext.define("Sch.util.RectangularPathFinder", {

    alias : 'schpathfinder.rectangular',

    mixins : [
        'Ext.mixin.Factoryable'
    ],

    uses : [
        'Ext.Array'
    ],

    config : {
        /**
         * @cfg {String|Boolean} startSide
         *
         * Default start connection side: 'left', 'right', 'top', 'bottom'
         */
        startSide : 'right',
        /**
         * @cfg {Number} startArrowSize
         *
         * Default start arrow size in pixels
         */
        startArrowSize : 8,
        /**
         * @cfg {Number} startArrowMargin
         *
         * Default start arrow staff size in pixels
         */
        startArrowMargin : 6,
        /**
         * @cfg {Number} startShift
         *
         * Default starting connection point shift from box's arrow pointing side middle point
         */
        startShift : 0,
        /**
         * @cfg {String|Boolean} endSide
         *
         * Default end arrow pointing direction, possible values are: 'left', 'right', 'top', 'bottom'
         */
        endSide : 'left',
        /**
         * @cfg {Number} endArrowSize
         *
         * Default end arrow size in pixels
         */
        endArrowSize : 8,
        /**
         * @cfg {Number} endArrowMargin
         *
         * Default end arrow staff size in pixels
         */
        endArrowMargin : 6,
        /**
         * @cfg {Number} endShift
         *
         * Default ending connection point shift from box's arrow pointing side middle point
         */
        endShift : 0,
        /**
         * @cfg {Number} verticalMargin
         *
         * Start / End box vertical marging, the amount of pixels from top and bottom line of a box where drawing
         * is prohibited
         */
        verticalMargin : 2,
        /**
         * @cfg {Number} horizontalMargin
         *
         * Start / End box horizontal margin, the amount of pixels from left and right line of a box where drawing
         * is prohibited
         */
        horizontalMargin : 5,
        /**
         * @cfg {Object[]} otherBoxes
         *
         * Other rectangular areas (obstacles) to search path through
         */
        otherBoxes : null
    },

    constructor : function(config) {
        var me = this;

        me.callParent([config]);
        me.initConfig(config);
    },

    /**
     * @method findPath
     * Returns list of horizontal and vertical segments connecting two boxes
     *
     *    |    | |  |    |       |
     *  --+----+----+----*-------*---
     *  --+=>Start  +----*-------*--
     *  --+----+----+----*-------*--
     *    |    | |  |    |       |
     *    |    | |  |    |       |
     *  --*----*-+-------+-------+--
     *  --*----*-+         End <=+--
     *  --*----*-+-------+-------+--
     *    |    | |  |    |       |
     *
     *  Path goes by lines (-=) and turns at intersections (+), boxes depicted are adjusted by horizontal/vertical
     *  margin and arrow margin, original boxes are smaller (path can't go at original box borders). Algorithm finds
     *  the shortest path with minimum amount of turns. In short it's mix of "Lee" and "Dijkstra pathfinding"
     *  with turns amount taken into account for distance calculation.
     *
     *  The algorithm is not very performant though, it's O(N^2), where N is amount of
     *  points in the grid, but since the maximum amount of points in the grid might be up to 34 (not 36 since
     *  two box middle points are not permitted) that might be ok for now.
     *
     * @param {Object} lineDef An object containing any of the class configuration option overrides as well
     *                         as `startBox`, `endBox`, `startHorizontalMargin`, `startVerticalMargin`,
     *                         `endHorizontalMargin`, `endVerticalMargin` properties
     * @param {Object} lineDef.startBox An object containing `start`, `end`, `top`, `bottom` properties
     * @param {Object} lineDef.endBox   An object containing `start`, `end`, `top`, `bottom` properties
     * @param {Number} lineDef.startHorizontalMargin Horizontal margin override for start box
     * @param {Number} lineDef.startVerticalMargin   Vertical margin override for start box
     * @param {Number} lineDef.endHorizontalMargin   Horizontal margin override for end box
     * @param {Number} lineDef.endVerticalMargin     Vertical margin override for end box
     *
     *
     * @return {Object[]/Boolean} Array of line segments or false if path cannot be found
     * @return {Number} return.x1
     * @return {Number} return.y1
     * @return {Number} return.x2
     * @return {Number} return.y2
     */
    /**
     * @ignore
     * @privateparam {Function[]|Function} noPathFallbackFn
     *      A function or array of functions which will be tried in case a path can't be found
     *      Each function will be given a line definition it might try to adjust somehow and return.
     *      The new line definition returned will be tried to find a path.
     *      If a function returns false, then next function will be called if any.
     */
    findPath : function(lineDef, noPathFallbackFn) {
        var me = this,

            lineDefFull,
            startBox,
            endBox,
            startShift,
            endShift,
            startSide,
            endSide,
            startArrowSize,
            endArrowSize,
            startArrowMargin,
            endArrowMargin,
            horizontalMargin,
            verticalMargin,
            startHorizontalMargin,
            startVerticalMargin,
            endHorizontalMargin,
            endVerticalMargin,
            otherBoxes,

            connStartPoint, connEndPoint,
            pathStartPoint, pathEndPoint,
            gridStartPoint, gridEndPoint,
            startGridBox, endGridBox,
            grid, path, tryNum;

        if (noPathFallbackFn && !Ext.isArray(noPathFallbackFn)) {
            noPathFallbackFn = [noPathFallbackFn];
        }

        for (tryNum = 0; lineDef && !path; ) {

            lineDefFull           = Ext.applyIf(lineDef, me.getConfig());

            startBox              = lineDefFull.startBox,
            endBox                = lineDefFull.endBox,
            startShift            = lineDefFull.startShift,
            endShift              = lineDefFull.endShift,
            startSide             = lineDefFull.startSide,
            endSide               = lineDefFull.endSide,
            startArrowSize        = lineDefFull.startArrowSize,
            endArrowSize          = lineDefFull.endArrowSize,
            startArrowMargin      = lineDefFull.startArrowMargin,
            endArrowMargin        = lineDefFull.endArrowMargin,
            horizontalMargin      = lineDefFull.horizontalMargin,
            verticalMargin        = lineDefFull.verticalMargin,
            startHorizontalMargin = lineDefFull.hasOwnProperty('startHorizontalMargin') ? lineDefFull.startHorizontalMargin : horizontalMargin,
            startVerticalMargin   = lineDefFull.hasOwnProperty('startVerticalMargin')   ? lineDefFull.startVerticalMargin   : verticalMargin,
            endHorizontalMargin   = lineDefFull.hasOwnProperty('endHorizontalMargin')   ? lineDefFull.endHorizontalMargin   : horizontalMargin,
            endVerticalMargin     = lineDefFull.hasOwnProperty('endVerticalMargin')     ? lineDefFull.endVerticalMargin     : verticalMargin,
            otherBoxes            = lineDefFull.otherBoxes;

            startSide      = me.normalizeSide(startSide);
            endSide        = me.normalizeSide(endSide);

            connStartPoint = me.getConnectionCoordinatesFromBoxSideShift(startBox, startSide, startShift);
            connEndPoint   = me.getConnectionCoordinatesFromBoxSideShift(endBox, endSide, endShift);

            startGridBox   = me.calcGridBaseBoxFromBoxAndDrawParams(startBox, startSide, startArrowSize, startArrowMargin, startHorizontalMargin, startVerticalMargin);
            endGridBox     = me.calcGridBaseBoxFromBoxAndDrawParams(endBox, endSide, endArrowSize, endArrowMargin, endHorizontalMargin, endVerticalMargin);
            otherBoxes     = otherBoxes && Ext.Array.map(otherBoxes, function(box) {
                return me.calcGridBaseBoxFromBoxAndDrawParams(box, false, 0, 0, horizontalMargin, verticalMargin);
            });
            pathStartPoint = me.getConnectionCoordinatesFromBoxSideShift(startGridBox, startSide, startShift);
            pathEndPoint   = me.getConnectionCoordinatesFromBoxSideShift(endGridBox, endSide, endShift);
            grid           = me.buildPathGrid(startGridBox, endGridBox, pathStartPoint, pathEndPoint, startSide, endSide, otherBoxes);
            gridStartPoint = me.convertDecartPointToGridPoint(grid, pathStartPoint);
            gridEndPoint   = me.convertDecartPointToGridPoint(grid, pathEndPoint);
            path           = me.findPathOnGrid(grid, gridStartPoint, gridEndPoint, startSide, endSide);

            // Loop if
            // - path is still not found
            // - have no next line definition (which should be obtained from call to one of the functions from noPathFallbackFn array
            // - have noPathFallBackFn array
            // - current try number is less then noPathFallBackFn array length
            for (lineDef = false; !path && !lineDef && noPathFallbackFn && tryNum < noPathFallbackFn.length; tryNum++) {
                lineDef = (noPathFallbackFn[tryNum])(lineDefFull);
            }
        }

        if (path) {
            path           = me.prependPathWithArrowStaffSegment(path, connStartPoint, startArrowSize, startSide);
            path           = me.appendPathWithArrowStaffSegment(path, connEndPoint, endArrowSize, endSide);
            path           = me.optimizePath(path);
        }

        return path;
    },

    getConnectionCoordinatesFromBoxSideShift : function(box, side, shift) {
        var coords;

        switch (side) {
            case 'left':
                coords = {
                    x : box.start,
                    y : (box.top + box.bottom) / 2 + shift
                };
                break;
            case 'right':
                coords = {
                    x : box.end,
                    y : (box.top + box.bottom) / 2 + shift
                };
                break;
            case 'top':
                coords = {
                    x : (box.start + box.end) / 2 + shift,
                    y : box.top
                };
                break;
            case 'bottom':
                coords = {
                    x : (box.start + box.end) / 2 + shift,
                    y : box.bottom
                };
                break;
        }

        return coords;
    },

    calcGridBaseBoxFromBoxAndDrawParams : function(box, side, arrowSize, arrowMargin, horizontalMargin, verticalMargin) {
        var gridBox;

        switch (side) {
            case 'left':
                gridBox = {
                    start  : box.start  - Math.max(arrowSize + arrowMargin, horizontalMargin),
                    end    : box.end    + horizontalMargin,
                    top    : box.top    - verticalMargin,
                    bottom : box.bottom + verticalMargin
                };
                break;
            case 'right':
                gridBox = {
                    start  : box.start  - horizontalMargin,
                    end    : box.end    + Math.max(arrowSize + arrowMargin, horizontalMargin),
                    top    : box.top    - verticalMargin,
                    bottom : box.bottom + verticalMargin
                };
                break;
            case 'top':
                gridBox = {
                    start  : box.start  - horizontalMargin,
                    end    : box.end    + horizontalMargin,
                    top    : box.top    - Math.max(arrowSize + arrowMargin, verticalMargin),
                    bottom : box.bottom + verticalMargin
                };
                break;
            case 'bottom':
                gridBox = {
                    start  : box.start  - horizontalMargin,
                    end    : box.end    + horizontalMargin,
                    top    : box.top    - verticalMargin,
                    bottom : box.bottom + Math.max(arrowSize + arrowMargin, verticalMargin)
                };
                break;
            default:
                gridBox = {
                    start  : box.start  - horizontalMargin,
                    end    : box.end    + horizontalMargin,
                    top    : box.top    - verticalMargin,
                    bottom : box.bottom + verticalMargin
                };
        }

        return gridBox;
    },

    buildPathGrid : function(startGridBox, endGridBox, pathStartPoint, pathEndPoint, startSide, endSide, otherGridBoxes) {
        var xs, ys,
            y, x, ix, iy, xslen, yslen, ib, blen, box, permitted, point,
            points = {},
            linearPoints = [];

        xs = [
            startGridBox.start,
            (startSide == 'left' || startSide == 'right') ? (startGridBox.start + startGridBox.end) / 2 : pathStartPoint.x,
            startGridBox.end,
            endGridBox.start,
            (endSide == 'left' || endSide == 'right') ? (endGridBox.start + endGridBox.end) / 2 : pathEndPoint.x,
            endGridBox.end
        ];
        ys = [
            startGridBox.top,
            (startSide == 'top' || startSide == 'bottom') ? (startGridBox.top + startGridBox.bottom) / 2 : pathStartPoint.y,
            startGridBox.bottom,
            endGridBox.top,
            (endSide == 'top' || endSide == 'bottom') ? (endGridBox.top + endGridBox.bottom) / 2 : pathEndPoint.y,
            endGridBox.bottom
        ];

        if (otherGridBoxes) {
            Ext.Array.forEach(otherGridBoxes, function(box) {
                xs.push(box.start, (box.start + box.end) / 2, box.end);
                ys.push(box.top, (box.top + box.bottom) / 2, box.bottom);
            });
        }

        xs = Ext.Array.unique(Ext.Array.sort(xs, Ext.Array.numericSortFn));
        ys = Ext.Array.unique(Ext.Array.sort(ys, Ext.Array.numericSortFn));

        for (iy = 0, yslen = ys.length; iy < yslen; ++iy) {
            points[iy] = points[iy] || {};
            y = ys[iy];
            for (ix = 0, xslen = xs.length; ix < xslen; ++ix) {
                x = xs[ix];

                permitted = (
                    (x <= startGridBox.start || x >= startGridBox.end || y <= startGridBox.top || y >= startGridBox.bottom) &&
                    (x <= endGridBox.start   || x >= endGridBox.end   || y <= endGridBox.top   || y >= endGridBox.bottom)
                );

                if (otherGridBoxes) {
                    for (ib = 0, blen = otherGridBoxes.length; permitted && ib < blen; ++ib) {
                        box = otherGridBoxes[ib];
                        permitted = (x <= box.start || x >= box.end || y <= box.top || y >= box.bottom);
                    }
                }

                point = {
                    distance  : Math.pow(2, 53) - 1, // Number.MAX_SAFE_INTEGER (not supported in Opera/IE)
                    permitted : permitted,
                    x  : x,
                    y  : y,
                    ix : ix,
                    iy : iy
                };

                points[iy][ix] = point;
                linearPoints.push(point);
            }
        }

        return {
            width        : xs.length,
            height       : ys.length,
            xs           : xs,
            ys           : ys,
            points       : points,
            linearPoints : linearPoints
        };
    },

    convertDecartPointToGridPoint : function(grid, point) {
        var x = Ext.Array.indexOf(grid.xs, point.x),
            y = Ext.Array.indexOf(grid.ys, point.y);

        return grid.points[y][x];
    },

    findPathOnGrid : function(grid, gridStartPoint, gridEndPoint, startSide, endSide) {
        var me = this,
            path = false;

        if (gridStartPoint.permitted && gridEndPoint.permitted) {
            grid = me.waveForward(grid, gridStartPoint, 0);
            path = me.collectPath(grid, gridEndPoint, endSide);
        }

        return path;
    },

    // Returns neighbors from Von Neiman ambit (see Lee pathfinding algorithm description)
    getGridPointNeighbors : function(grid, gridPoint, predicateFn) {
        var ix = gridPoint.ix,
            iy = gridPoint.iy,
            result = [],
            neighbor;

        // NOTE:
        // It's important to push bottom neighbors first since this method is used
        // in collectPath(), which reversively collects path from end to start node
        // and if bottom neighbors are pushed first in result array then collectPath()
        // will produce a line which is more suitable (pleasant looking) for our purposes.
        if (iy < grid.height - 1) {
            neighbor = grid.points[iy+1][ix];
            (!predicateFn || predicateFn(neighbor)) && result.push(neighbor);
        }
        if (iy > 0) {
            neighbor = grid.points[iy-1][ix];
            (!predicateFn || predicateFn(neighbor)) && result.push(neighbor);
        }
        if (ix < grid.width - 1) {
            neighbor = grid.points[iy][ix+1];
            (!predicateFn || predicateFn(neighbor)) && result.push(neighbor);
        }
        if (ix > 0) {
            neighbor = grid.points[iy][ix-1];
            (!predicateFn || predicateFn(neighbor)) && result.push(neighbor);
        }

        return result;
    },

    // This method might lead to stack overflow if there're a lot of other boxes defined for the grid,
    // a lot here means hundreds
    // TODO: refactor the method such it won't use recursion
    waveForward : function(grid, gridStartPoint, distance) {
        var me = this,
            neighbors,
            i, len, neighbor,
            neighborDistance,
            neighborDir,
            xDiff, yDiff;

        gridStartPoint.distance = distance;

        // Taking all point neigbors which are permitted for path and which distance is higher then
        // it might be if we move through this point. Initially each point has Number.MAX_SAFE_INTEGER (2^53-1) distance.
        neighbors = me.getGridPointNeighbors(grid, gridStartPoint, function(point) {
            return point.permitted && (point.distance > distance + 1);
        });

        // It's important to set neighbor distance first, before waving to a neighbor, otherwise waving might
        // get through a neighbor point setting it's distance to a value more then (distance + 1) whereas we,
        // at this point, already know that it's possibly optimal distance is (distance + 1)
        for (i = 0, len = neighbors.length; i < len; ++i) {
            neighbor = neighbors[i];
            neighbor.distance = distance + 1;
        }

        for (i = 0, len = neighbors.length; i < len; ++i) {
            neighbor = neighbors[i];
            me.waveForward(grid, neighbor, distance + 1);
        }

        return grid;
    },

    collectPath : function(grid, gridEndPoint, endSide) {
        var me = this,
            pathFound = true,
            neighbors,
            lowestDistanceNeighbor,
            xDiff, yDiff,
            path = [];

        while (pathFound && gridEndPoint.distance) {

            neighbors = me.getGridPointNeighbors(grid, gridEndPoint, function(point) {
                return point.permitted && (point.distance == gridEndPoint.distance - 1);
            });

            pathFound = neighbors.length > 0;

            if (pathFound) {

                // Prefer turnless neighbors first
                neighbors = Ext.Array.sort(neighbors, function(a, b) {
                    var xDiff, yDiff;

                    xDiff = a.ix - gridEndPoint.ix;
                    yDiff = a.iy - gridEndPoint.iy;

                    var result_a = (
                        ((endSide == 'left' || endSide == 'right') && yDiff === 0) ||
                        ((endSide == 'top'  || endSide == 'bottom') && xDiff === 0)
                    ) ? -1 : 1;

                    xDiff = b.ix - gridEndPoint.ix;
                    yDiff = b.iy - gridEndPoint.iy;

                    var result_b = (
                        ((endSide == 'left' || endSide == 'right') && yDiff === 0) ||
                        ((endSide == 'top'  || endSide == 'bottom') && xDiff === 0)
                    ) ? -1 : 1;

                    if (result_a > result_b) {
                        return 1;
                    } else if (result_a < result_b) {
                        return -1;
                    } else if (result_a == result_b) {
                        // apply additional sorting to be sure to pick bottom path in IE
                        return a.y > b.y ? -1 : 1;
                    }
                });

                lowestDistanceNeighbor = neighbors[0];

                path.push({
                    x1  : lowestDistanceNeighbor.x,
                    y1  : lowestDistanceNeighbor.y,
                    x2  : gridEndPoint.x,
                    y2  : gridEndPoint.y
                });

                // Detecting new side, either xDiff or yDiff must be 0 (but not both)
                xDiff = lowestDistanceNeighbor.ix - gridEndPoint.ix;
                yDiff = lowestDistanceNeighbor.iy - gridEndPoint.iy;

                switch (true) {
                case !yDiff && xDiff > 0:
                    endSide = 'left';
                    break;
                case !yDiff && xDiff < 0:
                    endSide = 'right';
                    break;
                case !xDiff && yDiff > 0:
                    endSide = 'top';
                    break;
                case !xDiff && yDiff < 0:
                    endSide = 'bottom';
                    break;
                }

                gridEndPoint = lowestDistanceNeighbor;
            }
        }

        return pathFound && path.reverse() || false;
    },

    prependPathWithArrowStaffSegment : function(path, connStartPoint, startArrowSize, startSide) {
        var prependSegment,
            firstSegment;

        if (path.length > 0) {
            firstSegment = path[0];
            prependSegment = {
                x2  : firstSegment.x1,
                y2  : firstSegment.y1
            };

            switch (startSide) {
                case 'left':
                    prependSegment.x1 = connStartPoint.x - startArrowSize;
                    prependSegment.y1 = firstSegment.y1;
                    break;
                case 'right':
                    prependSegment.x1 = connStartPoint.x + startArrowSize;
                    prependSegment.y1 = firstSegment.y1;
                    break;
                case 'top':
                    prependSegment.x1 = firstSegment.x1;
                    prependSegment.y1 = connStartPoint.y - startArrowSize;
                    break;
                case 'bottom':
                    prependSegment.x1 = firstSegment.x1;
                    prependSegment.y1 = connStartPoint.y + startArrowSize;
                    break;
            }

            path.unshift(prependSegment);
        }

        return path;
    },

    appendPathWithArrowStaffSegment : function(path, connEndPoint, endArrowSize, endSide) {
        var appendSegment,
            lastSegment;

        if (path.length > 0) {
            lastSegment = path[path.length - 1];
            appendSegment = {
                x1  : lastSegment.x2,
                y1  : lastSegment.y2
            };

            switch (endSide) {
                case 'left':
                    appendSegment.x2 = connEndPoint.x - endArrowSize;
                    appendSegment.y2 = lastSegment.y2;
                    break;
                case 'right':
                    appendSegment.x2 = connEndPoint.x + endArrowSize;
                    appendSegment.y2 = lastSegment.y2;
                    break;
                case 'top':
                    appendSegment.x2 = lastSegment.x2;
                    appendSegment.y2 = connEndPoint.y - endArrowSize;
                    break;
                case 'bottom':
                    appendSegment.x2 = lastSegment.x2;
                    appendSegment.y2 = connEndPoint.y + endArrowSize;
                    break;
            }

            path.push(appendSegment);
        }

        return path;
    },

    optimizePath : function(path) {
        var optPath = [],
            prevSegment,
            curSegment;

        if (path.length > 0) {
            prevSegment = path.shift();
            optPath.push(prevSegment);

            while (path.length > 0) {
                curSegment = path.shift();

                // both segments are equal
                if (prevSegment.x1 == curSegment.x1 && prevSegment.y1 == curSegment.y1 && prevSegment.x2 == curSegment.x2 && prevSegment.y2 == curSegment.y2) {
                    prevSegment = curSegment;
                }
                // both segments are horizontal
                else if (
                    (prevSegment.y1 - prevSegment.y2 === 0) && (curSegment.y1 - curSegment.y2 === 0)
                ) {
                    prevSegment.x2 = curSegment.x2;
                }
                // both segments are vertical
                else if (
                    (prevSegment.x1 - prevSegment.x2 === 0) && (curSegment.x1  - curSegment.x2 === 0)
                ) {
                    prevSegment.y2 = curSegment.y2;
                }
                // segments has different orientation (path turn)
                else {
                    optPath.push(curSegment);
                    prevSegment = curSegment;
                }
            }
        }

        return optPath;
    },

    normalizeSide : function(side) {
        return this.self.sideToSide[side] || side;
    },

    statics : {
        sideToSide : {
            'l' : 'left',
            'r' : 'right',
            't' : 'top',
            'b' : 'bottom'
        }
    }
});

// <debug>
/*
window.visualizeGrid = function() {
    var grid = window.grid,
        body = Ext.getBody(),
        vpWidth = Ext.dom.Element.getViewportWidth(),
        vpHeight = Ext.dom.Element.getViewportHeight();

    Ext.destroy(window.visGridEls);

    window.visGridEls = [];

    Ext.Array.forEach(grid.ys, function(y) {
        var el = body.appendChild({
            tag : 'div',
            style : {
                position: 'absolute',
                top : y + 'px',
                left : '0px',
                width : vpWidth + 'px',
                height : '1px',
                background : 'green',
                zIndex : 5
            }
        });
        window.visGridEls.push(el);
    });

    Ext.Array.forEach(grid.xs, function(x) {
        var el = body.appendChild({
            tag : 'div',
            style : {
                position: 'absolute',
                top : '0px',
                left : x + 'px',
                width : '1px',
                height : vpHeight + 'px',
                background : 'green',
                zIndex : 5
            }
        });
        window.visGridEls.push(el);
    });

    Ext.Array.forEach(grid.linearPoints, function(point) {
        var el = body.appendChild({
            tag : 'div',
            html : point.permitted && String(point.distance) || '!',
            style : {
                position: 'absolute',
                top : point.y - 15 + 'px',
                left : point.x - 15 + 'px',
                width : '15px',
                height : '15px',
                color: 'red',
                zIndex : 5
            }
        });
        window.visGridEls.push(el);
    });
};
*/
//</debug>
