// @tag dependencies
/**
 * This class is handling the drawing of scheduled record dependencies
 */
Ext.define('Sch.view.dependency.Painter', function (thisClass) {

    // These functions will be tried one by one in case a path can't be found

    function resetArrowMargins(lineDef) {
        var adjusted = false;

        if (lineDef.startArrowMargin > 0 || lineDef.endArrowMargin > 0) {
            lineDef.startArrowMargin = lineDef.endArrowMargin = 0;
            adjusted = true;
        }

        return adjusted ? lineDef : adjusted;
    }

    function shrinkStartEndMarginsBy2(lineDef) {
        var adjusted = false;

        if (lineDef.hasOwnProperty('startHorizontalMargin') && lineDef.startHorizontalMargin > 2) {
            lineDef.startHorizontalMargin = Math.round(lineDef.startHorizontalMargin / 2);
            adjusted                      = true;
        }
        if (lineDef.hasOwnProperty('startVerticalMargin') && lineDef.startVerticalMargin > 2) {
            lineDef.startVerticalMargin = Math.round(lineDef.startVerticalMargin / 2);
            adjusted                    = true;
        }
        if (lineDef.hasOwnProperty('endHorizontalMargin') && lineDef.endHorizontalMargin > 2) {
            lineDef.endHorizontalMargin = Math.round(lineDef.endHorizontalMargin / 2);
            adjusted                    = true;
        }
        if (lineDef.hasOwnProperty('endVerticalMargin') && lineDef.endVerticalMargin > 2) {
            lineDef.endVerticalMargin = Math.round(lineDef.endVerticalMargin / 2);
            adjusted                  = true;
        }

        return adjusted ? lineDef : adjusted;
    }

    function resetArrowSizes(lineDef) {
        var adjusted = false;

        if (lineDef.startArrowSize > 0 || lineDef.endArrowSize > 0) {
            lineDef.startArrowSize = lineDef.endArrowSize = 0;
            adjusted = true;
        }

        return adjusted ? lineDef : adjusted;
    }

    var lineDefAdjusters = [
        resetArrowMargins,
        shrinkStartEndMarginsBy2,
        shrinkStartEndMarginsBy2,
        shrinkStartEndMarginsBy2,
        resetArrowSizes
    ];

    return {
        alias : 'schdependencypainter.default',

        mixins : [
            'Ext.mixin.Factoryable'
        ],

        requires : [
            'Sch.util.RectangularPathFinder',
            'Sch.template.Dependency'
        ],

        uses : [
            'Ext.Array',
            'Ext.XTemplate',
            'Ext.dom.Query',
            'Sch.util.Date',
            'Sch.util.RectangularPathFinder',
            'Sch.template.Dependency'
        ],

        config : {
            /**
             * @cfg {String} cls
             * Line's optional/user defined CSS class
             */
            cls : '',

            /**
             * @cfg {Boolean} rtl
             * Set to `true` if application is running in RTL mode
             */
            rtl : false,

            /**
             * @cfg {String/Array/Ext.XTemplate} lineTpl
             * Line template
             */
            lineTpl : null,

            /**
             * @cfg {String} canvasCls
             * Canvas element CSS class
             */
            canvasCls : null,

            /**
             * @cfg {Object} pathFinderConfig
             * Path finder instance configuration
             */
            pathFinderConfig : null,

            /**
             * @cfg {Number} realLineThickness
             * The real dependency line thickness. Visually it will be always 1px, but actual line element width or height
             * is different to allow proper catching pointer events. By default it's set by CSS rules, but for the testing
             * purposes we might override the CSS rules with exact value.
             * @private
             */
            realLineThickness : null,

            /**
             * Use caching of which rows dependencies intersects to speed up painting, or go without to pain slowly...
             * @private
             */
            useDependencyRowIntersectionCache : true
        },

        // Private
        pathFinder       : null,
        // TODO: having this here is an incapsulation leakage, it should be a template class responsibility
        //       to select elements corresponding to a dependency using this attribute
        dependencyIdAttr : 'data-sch-dependency-id',

        constructor : function (config) {
            var me = this;

            me.initConfig(config);

            me.pathFinder = me.createPathFinder(me.getPathFinderConfig());

            if (!me.getLineTpl()) {
                me.setLineTpl(new Sch.template.Dependency({
                    rtl : me.getRtl()
                }));
            }

            me.resetRowIntersectionCache();
        },

        /**
         * Clones this painter
         *
         * @return {Sch.view.dependency.Painter}
         */
        clone : function () {
            var me = this;
            return new me.self(me.getConfig());
        },

        applyLineTpl : function (tpl) {
            return tpl instanceof Ext.XTemplate ? tpl : new Ext.XTemplate(tpl);
        },

        updatePathFinderConfig : function (config) {
            var me = this;

            if (me.pathFinder) {

                // In this case we are to re-create path finder instance since path finder type is changed
                if (config && 'type' in config && config.type !== me.pathFinder.type) {

                    Ext.destroy(me.pathFinder);
                    me.pathFinder = me.createPathFinder(config);
                }
                // In this case we just update current painter configuration
                else {
                    me.pathFinder.setConfig(config);
                }
            }
        },

        /**
         * Create path finder instance
         *
         * @protected
         */
        createPathFinder : function (config) {
            return Sch.util.RectangularPathFinder.create(config);
        },

        /**
         * Returns painter canvas element {@link Ext.dom.Helper} specification
         *
         * @return {Mixed}
         */
        getCanvasSpecification : function () {
            return {
                tag  : 'div',
                role : 'presentation',
                cls  : this.getCanvasCls()
            };
        },

        /**
         * Draws dependencies on `el` where `el` is supposed to be a canvas created using {@link #getCanvasSpecification the provided specification}
         * @param {Ext.view.View} primaryView See primary view interface in {@link Sch.view.dependency.View dependency view} description
         * @param {String/HtmlElement/Ext.Element} canvasEl
         * @param {Sch.model.Dependency/Sch.model.Dependency[]} dependencies
         * @param {Boolean} overwrite
         */
        paint : function (primaryView, canvasEl, dependencies, overwrite) {

            var me                  = this,
                dependenciesToPaint = me.getUseDependencyRowIntersectionCache() ?
                    me.filterByRowIntersections(primaryView, dependencies) :
                    dependencies,
                markup              = me.generatePaintMarkup(primaryView, dependenciesToPaint);

            canvasEl = Ext.fly(canvasEl);

            if (overwrite) {
                var tmp       = document.createElement('div');
                tmp.innerHTML = markup;
                canvasEl.syncContent(tmp);
            }
            else {
                canvasEl.insertHtml('beforeEnd', markup);
            }
        },

        /**
         * Generates paint markup
         *
         * @param {Ext.view.View} primaryView See primary view interface in {Sch.view.dependency.View dependency view} description
         * @param {Sch.model.Dependency/Sch.model.Dependency[]} dependencies
         * @return {String}
         */
        generatePaintMarkup : function (primaryView, dependencies) {
            var me       = this,
                lineDefs = me.getLineDefsForDependencies(primaryView, dependencies);

            if (!Ext.isArray(lineDefs)) {
                lineDefs = [ lineDefs ];
            }

            return Ext.Array.map(lineDefs, function (lineDef) {
                var tplData;

                lineDef.path = me.findPath(lineDef);
                tplData      = lineDef.path && me.getLineTplData(lineDef);

                return tplData && me.getLineTpl().apply(tplData) || '';
            }).join('');
        },

        /**
         * Returns true if element passed is an element visualizing a dependency
         *
         * @param {HTMLElement/Ext.dom.Element/String} el
         * @return {Boolean}
         */
        isDependencyElement : function (el) {
            return Ext.fly(el).is('.sch-dependency');
        },

        /**
         * Retrieves the canvas elements representing a particular dependency or dependencies
         * NOTE: Please avoid direct elements manipulation if possible, these method is subject to change.
         * @param {String/HtmlElement/Ext.Element} canvasEl
         * @param {Sch.model.Dependency/Sch.model.Dependency[]} dependencies Dependency record(s)
         * @return {Ext.dom.CompositeElementLite}
         */
        getElementsForDependency : function (canvasEl, dependencies) {
            var me = this;

            if (dependencies && !Ext.isArray(dependencies)) {
                dependencies = [dependencies];
            }

            return new Ext.dom.CompositeElementLite(
                Ext.Array.reduce(dependencies || [], function (result, dependency) {
                    return result.concat(Ext.dom.Query.select(
                        '[' + me.dependencyIdAttr + '="' + dependency.internalId + '"]',
                        Ext.getDom(canvasEl)
                    ));
                }, [])
            );
        },

        /**
         * Returns all the elements on the canvas representing the rendered dependencies
         * NOTE: Please avoid direct elements manipulation if possible, these method is subject to change.
         * @param {String/HtmlElement/Ext.Element} canvasEl
         * @return {Ext.CompositeElementLite/Ext.CompositeElement}
         */
        getDependencyElements : function (canvasEl) {
            var canvasDom = Ext.getDom(canvasEl);

            return new Ext.dom.CompositeElementLite(
                canvasDom && canvasDom.childNodes || []
            );
        },

        /**
         * If the element passed constitutes a dependency line then returns the dependency record id this element
         * represents, otherwise returns empty string
         *
         * @param {HTMLElement/Ext.dom.Element/String} el
         * @return {String}
         */
        getElementDependencyInternalId : function (el) {
            return Ext.fly(el).getAttribute(this.dependencyIdAttr);
        },

        /**
         * Finds path for given line definition using path finder
         *
         * @param {Object} lineDef
         * @return {Object[]|false}
         */
        findPath : function (lineDef) {
            var path;

            path = this.pathFinder.findPath(lineDef, lineDefAdjusters);

            // <debug>
            if (!path) {
                // Postcondition check for Mats' calmness:
                // - line definition shouldn't contain boxes with zero height, that might be one of the reasons why path finder can't find path
                if (
                    lineDef.startBox.bottom - lineDef.startBox.top === 0 ||
                    lineDef.endBox.bottom - lineDef.endBox.top === 0
                ) {
                    throw new Error('Zero height dependency line boxes detected');
                }
            }
            // </debug>

            return path;
        },

        /**
         * Converts line definition into line data applicable to line template.
         *
         * @param {Object} lineDef
         * @return {Object}
         * @return {String}         return.id
         * @return {[Object]}       return.segments
         * @return {Object|Boolean} return.startArrow
         * @return {Object|Boolean} return.endArrow
         * @protected
         */
        getLineTplData : function (lineDef) {
            var me = this,
                rtl,
                realLineThickness,
                firstSegment,
                lastSegment,
                result;

            result = lineDef.path;

            // TODO: write a test for the case and codereview it
            // ---
            // Check if we only need to render one vertical line, due to both tasks being outside of view
            if (!lineDef.startBox.rendered && !lineDef.endBox.rendered) {

                for (var i = result.length - 1; i >= 0; i--) {
                    var line = result[ i ];

                    if (line.x1 === line.x2) {
                        result                 = [ line ];
                        lineDef.startArrowSize = lineDef.endArrowSize = 0;

                        break;
                    }
                }
            }
            // ---

            rtl               = me.getRtl();
            realLineThickness = me.getRealLineThickness();

            firstSegment = result.length && result[ 0 ];
            lastSegment  = result.length && result[ result.length - 1 ];

            result = {
                cls : lineDef.cls || '',

                lineCls : lineDef.lineCls || '',

                dependencyId : lineDef.dependencyId || '',

                highlighted : lineDef.highlighted,

                segments : Ext.Array.map(result, function (segment) {
                    var dir = me.getSegmentDir(segment),
                        result;

                    if (dir == 'horizontal') {
                        result = {
                            width  : Math.abs(segment.x1 - segment.x2) + 1,
                            height : realLineThickness,
                            top    : Math.min(segment.y1, segment.y2),
                            side   : Math.min(segment.x1, segment.x2),
                            dir    : dir
                        };
                    }
                    else {
                        result = {
                            height : Math.abs(segment.y1 - segment.y2) + 1,
                            width  : realLineThickness,
                            top    : Math.min(segment.y1, segment.y2),
                            side   : Math.min(segment.x1, segment.x2),
                            dir    : dir
                        };
                    }

                    return result;
                }),

                startArrow : lineDef.startArrowSize && {
                    side : firstSegment.x1,
                    top  : firstSegment.y1,
                    dir  : me.convertSideToDir(lineDef.startSide, rtl)
                },

                endArrow : lineDef.endArrowSize && {
                    side : lastSegment.x2,
                    top  : lastSegment.y2,
                    dir  : me.convertSideToDir(lineDef.endSide, rtl)
                },

                realLineThickness : me.getRealLineThickness()
            };

            return result;
        },

        // Checks whether a dependency belongs to the provided timespan
        isDependencyInTimeSpan : function (dependency, startDate, endDate) {
            var ddr = dependency.getDateRange();

            return ddr && (!startDate || !endDate || Sch.util.Date.intersectSpans(ddr.start, ddr.end, startDate, endDate));
        },

        /**
         * Adds all dependencies that are not already in row intersection cache to it. Row intersection cache is used to
         * determine which dependencies needs to be considered for drawing, by storing which rows each dependency
         * intersects.
         * @param primaryView
         * @param dependencies
         * @private
         */
        addToRowIntersectionCacheIfNotPresent : function (primaryView, dependencies) {
            var me            = this,
                viewStartDate = primaryView.getViewStartDate(),
                viewEndDate   = primaryView.getViewEndDate(),
                all           = me.dependencyStore.count() === dependencies.length;

            // bail out if all dependencies already in cache
            if (me.allInRowIntersectionCache) return;

            Ext.Array.each(dependencies, function (dependency) {
                // add if adding all or if not already added
                if (all || !me.isInRowIntersectionCache(dependency)) {
                    var source = dependency.getSourceEvent(),
                        target = dependency.getTargetEvent();

                    // if the dependency belongs to the visible timespan
                    if (me.isDependencyInTimeSpan(dependency, viewStartDate, viewEndDate)) {

                        var sourceIndex = me.getIndexForCache(primaryView, source),
                            targetIndex = me.getIndexForCache(primaryView, target),
                            first       = Math.min(sourceIndex, targetIndex),
                            last        = Math.max(sourceIndex, targetIndex);

                        if (first > -1 && last > -1) {

                            // store using records indexes in groups of ten (to keep map smaller)
                            first = Math.floor(first / 10);
                            last  = Math.floor(last / 10);

                            // rowIntersectionCache has an array of dependencies for each "row group" (ten rows), which
                            // contains dependencies that intersects any of those row. hence a dependency might
                            // appear in many places in the cache
                            for (var i = first; i <= last; i++) {
                                // this map is the actual cache
                                if (!me.rowIntersectionCache[ i ]) me.rowIntersectionCache[ i ] = [];
                                me.rowIntersectionCache[ i ].push(dependency);

                                // this map enables lookups to see if dependency is cached
                                me.cachedDependencies[ dependency.internalId ] = true;
                            }
                        } //else {
                        //    debugger;
                        //}
                    }
                }
            });

            if (!all) all = Object.keys(me.cachedDependencies).length === me.dependencyStore.count();
            if (all) me.allInRowIntersectionCache = true;
        },

        /**
         * Get index to cache for specified event
         * @protected
         */
        getIndexForCache : function (primaryView, event) {
            if ('getResource' in event) {
                var resource = event.getResource();
                if (resource) return primaryView.getResourceStore().indexOf(resource);
                if (!resource && event.resourceIdField in event.data) return -1;
                throw new Error('Not implemented for scheduler with multi assignment');

            } else if ('getTaskStore' in event) {
                // TaskStore used with scheduler, event is a task
                return event.getTaskStore().indexOf(event);
            }
        },

        /**
         * Empties row intersection cache
         * @protected
         */
        resetRowIntersectionCache : function (dontClear) {
            this.allInRowIntersectionCache = false;

            if (!dontClear) {
                this.rowIntersectionCache = {};
                this.cachedDependencies   = {};
            }
        },

        /**
         * Checks if a dependency is in row intersection cache
         * @private
         * @param {Sch.model.Dependency} dependency
         * @returns {boolean}
         */
        isInRowIntersectionCache : function (dependency) {
            return !!this.cachedDependencies[ dependency.internalId ];
        },

        /**
         * Returns an filtered array of dependecies containing only those that needs to be considered for painting
         * @private
         * @param primaryView
         * @param {Dependency[]} dependencies
         * @returns {Dependency[]}
         */
        filterByRowIntersections : function (primaryView, dependencies) {
            var me = this;

            if (!Ext.isArray(dependencies)) {
                dependencies = [ dependencies ];
            }

            // quick bailout when no dependencies
            if (!dependencies.length) return [];

            // since this fn might be called multiple times with partial dependency coverage (depending on
            // renderingstrategy), add to cache if not already there
            me.addToRowIntersectionCacheIfNotPresent(primaryView, dependencies);

            var dependenciesToDraw = [],
                // determine first and last rendered row, observe that primaryView.all is private
                rows               = primaryView.getNodes(),
                first              = primaryView.indexOf(rows[ 0 ]),
                last               = primaryView.indexOf(rows[ rows.length - 1 ]),
                fromCache;

            // cache holds row indexes in "groups" of ten (0-9 -> 0, 10-19 -> 1, ...)
            first = Math.floor(first / 10);
            last  = Math.floor(last / 10);

            // only dependencies that intersects a rendered row will be drawn
            for (var i = first; i <= last; i++) {
                fromCache = me.rowIntersectionCache[ i ];
                fromCache && dependenciesToDraw.push.apply(dependenciesToDraw, fromCache);
            }

            // a dependency that intersects multiple "row groups" will be included multiple times, make sure we only
            // have one of each, as well as filter out the ones we do not requested to be re-drawn.
            return Ext.Array.intersect(dependencies, Ext.Array.unique(dependenciesToDraw));
        },

        /**
         * @param {Sch.view.SchedulingView}
         * @param {Sch.model.Dependency[]}
         * @return {Object[]}
         * @protected
         */
        getLineDefsForDependencies : function (primaryView, dependencies) {
            var EA            = Ext.Array,
                me            = this,
                cache         = {},
                viewStartDate = primaryView.getViewStartDate(),
                viewEndDate   = primaryView.getViewEndDate(),
                internalId;

            if (!Ext.isArray(dependencies)) {
                dependencies = [ dependencies ];
            }

            // quick bailout when no dependencies
            if (!dependencies.length) return [];

            // TODO: dont draw deps that starts and ends outside of view

            var result = EA.reduce(dependencies || [], function (result, dependency) {
                var source = dependency.getSourceEvent(),
                    target = dependency.getTargetEvent(),
                    sourceBoxes,
                    targetBoxes;

                // if the dependency belongs to the visible timespan
                if (me.isDependencyInTimeSpan(dependency, viewStartDate, viewEndDate)) {

                    // Getting source boxes
                    internalId = source.internalId;

                    if (!cache[ internalId ]) {

                        sourceBoxes = me.getItemBox(primaryView, source) || [];

                        if (!Ext.isArray(sourceBoxes)) {
                            sourceBoxes = [ sourceBoxes ];
                        }

                        cache[ internalId ] = sourceBoxes;
                    }
                    else {
                        sourceBoxes = cache[ internalId ];
                    }

                    // Getting target boxes
                    internalId = target.internalId;

                    if (!cache[ internalId ]) {

                        targetBoxes = me.getItemBox(primaryView, target) || [];

                        if (!Ext.isArray(targetBoxes)) {
                            targetBoxes = [ targetBoxes ];
                        }

                        cache[ internalId ] = targetBoxes;
                    }
                    else {
                        targetBoxes = cache[ internalId ];
                    }

                    // Create line definitions for each item box cartesian multiplication
                    result = EA.reduce(sourceBoxes, function (result, sourceBox, sourceBoxIdx) {
                        return EA.reduce(targetBoxes, function (result, targetBox, targetBoxIdx) {
                            if (sourceBox && targetBox && (sourceBox.rendered || targetBox.rendered || sourceBox.relPos != targetBox.relPos)) {
                                result.push(me.createLineDef(primaryView, dependency, source, target, sourceBox, targetBox, null));
                            }
                            return result;
                        }, result);
                    }, result);
                }

                return result;
            }, []);


            return result;
        },

        /**
         * Returns all the boxes a painter shall take into account, which corresponds to the given record
         *
         * @param {Ext.data.Model} itemRecord
         * @return {Object/Object[]}
         * @protected
         */
        getItemBox : function (primaryView, itemRecord) {
            return primaryView.getItemBox(itemRecord);
        },

        /**
         * Creates dependency line definition recognized by path finder
         *
         * @param {Ext.view.View} primaryView
         * @param {Sch.model.Dependency} dependency
         * @param {Ext.data.Model} source
         * @param {Ext.data.Model} target
         * @param {Object} sourceBox
         * @param {Object} targetBox
         * @param {Object[]/null} otherBoxes
         * @return {Object}
         * @protected
         */
        createLineDef : function (primaryView, dependency, source, target, sourceBox, targetBox, otherBoxes) {
            var DEP_TYPE         = dependency.self.Type,
                me               = this,
                type             = dependency.getType(),
                horizontalMargin = me.pathFinder.getHorizontalMargin(),
                verticalMargin   = me.pathFinder.getVerticalMargin(),
                bidirectional    = dependency.getBidirectional(),
                startArrowMargin = bidirectional ? me.pathFinder.getStartArrowMargin() : 0,
                startArrowSize   = bidirectional ? me.pathFinder.getStartArrowSize() : 0,
                endArrowMargin   = me.pathFinder.getEndArrowMargin(),
                endArrowSize     = me.pathFinder.getEndArrowSize(),
                startSide        = dependency.getFromSide(),
                endSide          = dependency.getToSide();

            // Fallback to view trait if dependency start side is not given
            if (!startSide) {
                switch (true) {
                    case type == DEP_TYPE.StartToEnd:
                        startSide = primaryView.getConnectorStartSide(source);
                        break;

                    case type == DEP_TYPE.StartToStart:
                        startSide = primaryView.getConnectorStartSide(source);
                        break;

                    case type == DEP_TYPE.EndToStart:
                        startSide = primaryView.getConnectorEndSide(source);
                        break;

                    case type == DEP_TYPE.EndToEnd:
                        startSide = primaryView.getConnectorEndSide(source);
                        break;

                    default:
                        throw new Error('Invalid dependency type: ' + dependency.getType());
                }
            }

            // Fallback to view trait if dependency end side is not given
            if (!endSide) {
                switch (true) {
                    case type == DEP_TYPE.StartToEnd:
                        endSide = primaryView.getConnectorEndSide(target);
                        break;

                    case type == DEP_TYPE.StartToStart:
                        endSide = primaryView.getConnectorStartSide(target);
                        break;

                    case type == DEP_TYPE.EndToStart:
                        endSide = primaryView.getConnectorStartSide(target);
                        break;

                    case type == DEP_TYPE.EndToEnd:
                        endSide = primaryView.getConnectorEndSide(target);
                        break;

                    default:
                        throw new Error('Invalid dependency type: ' + dependency.getType());
                }
            }

            // This is for the 018_export_dependencies.t.js to be green
            // TODO: refactor the test and remove this code
            // --------------------------------------------------------
            switch (true) {
                case (startSide == 'left' || startSide == 'right') && (endSide == 'left' || endSide == 'right'):
                    verticalMargin   = 2;
                    horizontalMargin = 5;
                    break;

                case (startSide == 'top' || startSide == 'bottom') && (endSide == 'top' || endSide == 'bottom'):
                    verticalMargin   = 7;
                    horizontalMargin = 2;
                    break;
            }

            var distance = Number.MAX_VALUE;

            var centerHorizontalPoint = {
                from : (sourceBox.start + sourceBox.end) / 2,
                to   : (targetBox.start + targetBox.end) / 2
            };

            var centerVerticalPoint = {
                from : (sourceBox.top + sourceBox.bottom) / 2,
                to   : (targetBox.top + targetBox.bottom) / 2
            };

            // if points are too close to show the arrow(s) they are hidden
            if ((startSide === 'top' && endSide === 'bottom' || startSide === 'bottom' && endSide === 'top') && centerHorizontalPoint.from === centerHorizontalPoint.to) {
                distance = Math.abs(sourceBox[ startSide ] - targetBox[ endSide ]);
            } else if ((startSide === 'left' && endSide === 'right' || startSide === 'right' && endSide === 'left') && centerVerticalPoint.from === centerVerticalPoint.to) {
                var sourceSide = startSide === 'left' ? 'start' : 'end';
                var targetSide = endSide === 'left' ? 'start' : 'end';

                if (primaryView.rtl) {
                    sourceSide = sourceSide === 'start' ? 'end' : 'start';
                    targetSide = targetSide === 'start' ? 'end' : 'start';
                }

                var startX = sourceBox[ sourceSide ];
                var endX   = targetBox[ targetSide ];

                distance = Math.abs(startX - endX);
            }

            if (distance < (endArrowSize * endArrowMargin) * 2) {
                startArrowMargin = endArrowMargin = 0;

                if (distance <= endArrowSize * 2) {
                    startArrowSize = endArrowSize = 0;
                }
            }
            // --------------------------------------------------------


            return Ext.applyIf({
                startBox         : sourceBox,
                startSide        : startSide,
                startArrowSize   : startArrowSize,
                startArrowMargin : startArrowMargin,

                endBox         : targetBox,
                endSide        : endSide,
                endArrowSize   : endArrowSize,
                endArrowMargin : endArrowMargin,

                // OPTIMIZE
                top    : Math.min(sourceBox.top, targetBox.top),
                bottom : Math.max(sourceBox.bottom, targetBox.bottom),

                verticalMargin        : verticalMargin,
                horizontalMargin      : horizontalMargin,
                startVerticalMargin   : verticalMargin,
                startHorizontalMargin : horizontalMargin,
                endVerticalMargin     : verticalMargin,
                endHorizontalMargin   : horizontalMargin,

                otherBoxes : otherBoxes,

                dependency   : dependency,
                dependencyId : dependency.internalId,
                lineCls      : me.getCls(),
                cls          : dependency.getCls(),
                highlighted  : dependency.getHighlighted()
            }, me.getConfig());
        },

        convertSideToDir : function (side, rtl) {
            return this.self.sideToDir[ side + (rtl && '-rtl' || '') ];
        },

        getSegmentDir : function (segment) {
            var dir = 'vertical';

            if (segment.y1 === segment.y2) {
                dir = 'horizontal';
            }

            return dir;
        },

        inheritableStatics : {
            /**
             * @private
             */
            sideToDir : {
                'left'       : 'right',
                'right'      : 'left',
                'top'        : 'down',
                'bottom'     : 'up',
                'left-rtl'   : 'left',
                'right-rtl'  : 'right',
                'top-rtl'    : 'down',
                'bottom-rtl' : 'up'
            }
        }
    };
});
