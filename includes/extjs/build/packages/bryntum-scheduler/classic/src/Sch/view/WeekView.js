/**
 * @class Sch.view.WeekView
 * @private
 *
 * A mixin, purposed to be consumed along with {@link Sch.mixin.AbstractTimelineView} and providing the implementation
 * of some methods, specific to weekview mode.
 */
Ext.define('Sch.view.WeekView', {

    requires : [
        'Ext.util.Region'
    ],

    // Provided by creator, in the config object
    view : null,

    /**
     * @cfg {Boolean} showAllDayHeader Shows an all day header above the main schedule for All Day events.
     */
    showAllDayHeader : false,

    constructor : function (config) {
        Ext.apply(this, config);
    },

    getElementsFromEventRecord : function (eventRecord, resourceRecord, index, raw) {
        var me   = this,
            view = me.view,
            query,
            result;

        raw = raw || false;

        if (index !== null && index !== undefined) {
            query = '[id^=' + view.eventPrefix + eventRecord.internalId + '-calendar-' + index + '-]';
        }
        else {
            query = '[id^=' + view.eventPrefix + eventRecord.internalId + '-calendar-]';
        }

        result = view.getEl().query(query, raw);

        // When record changes status to allday it is rendered into allday header before update event is handled by
        // this view. This leads to situation when there are multiple DOM elements for one record: one in allday header
        // and one in weekview. It is easier to return all elements for passed record and filter them later.
        if (me.showAllDayHeader && eventRecord.getAllDay()) {
            [].push.apply(result,
                me.view.ownerGrid.allDayNormalHeader.getSchedulingView().getElementsFromEventRecord(
                    eventRecord, resourceRecord, index, raw
                )
            );
        }

        return result;
    },

    // return columns that passes condition
    // if includeIndex is true then column index is also returned
    getColumnsBy : function (conditionFn, includeIndex) {
        var columns = this.view.panel.headerCt.getGridColumns();

        var result = [];

        for (var i = 0; i < columns.length; i++) {
            if (conditionFn.call(this, columns[i])) {
                if (includeIndex !== true) {
                    result.push(columns[i]);
                } else {
                    result.push({
                        column : columns[i],
                        index  : i
                    });
                }
            }
        }

        return result;
    },

    getColumnsForDateRange : function (range, includeIndex) {
        return this.getColumnsBy(function (column) {
            return !(range.getEndDate() <= column.start || range.getStartDate() >= column.end);
        }, includeIndex);
    },

    getColumnEvents : function (column) {
        var me = this,
            result = [];

        this.view.getEventStore().each(function (record) {
            if (!(me.showAllDayHeader && record.getAllDay()) && !(record.getEndDate() <= column.start || record.getStartDate() >= column.end )) {
                result.push(record);
            }
        });

        return result;
    },

    getColumnsByResource : function (resource, includeIndex) {
        return this.getColumnsBy(function (column) {
            return column.start == resource.start;
        }, includeIndex)[0];
    },

    translateToScheduleCoordinate : function (coord) {
        var view = this.view;

        if (Ext.isArray(coord)) {
            return [
                coord[0] - view.getEl().getX() + view.getHorizontalScroll(),
                coord[1] - view.getViewContainerElementTop() + view.getVerticalScroll()
            ];
        } else {
            return coord - view.getViewContainerElementTop() + view.getVerticalScroll();
        }
    },

    // private
    translateToPageCoordinate : function (coord) {
        var view   = this.view;
        var el     = view.getEl();

        if (Ext.isArray(coord)) {
            return [
                coord[0] + el.getX() - view.getHorizontalScroll(),
                coord[1] + view.getViewContainerElementTop() - view.getVerticalScroll()
            ];
        } else {
            return coord + view.getViewContainerElementTop() - view.getVerticalScroll();
        }
    },

    getDateFromXY : function (xy, roundingMethod, local) {
        var coord = xy;

        if (!local) {
            coord = this.translateToScheduleCoordinate(coord);
        }
        return this.view.timeAxisViewModel.getDateFromPosition(coord, roundingMethod);
    },

    getEventRenderData : function (event, resource, resourceIndex) {
        var eventStart = event.getStartDate(),
            eventEnd   = event.getEndDate(),
            view       = this.view,
            columns    = view.panel.headerCt.getGridColumns(),
            viewStart  = columns[resourceIndex].start,
            viewEnd    = columns[resourceIndex].end,
            M          = Math;

        var startY   = Math.floor(view.getCoordinateFromDate(Sch.util.Date.max(eventStart, viewStart)));
        var endY     = Math.floor(view.timeAxisViewModel.getPositionFromDate(Sch.util.Date.min(eventEnd, viewEnd), true));
        var data;

        // in weekview we duplicate time for end of column and start of next column
        // if we got 0 that means end is in fact column bottom
        if (endY === 0) {
            endY = view.getStore().getCount() * view.getRowHeight();
        }

        data = {
            top    : M.max(0, M.min(startY, endY) - view.eventBorderWidth),
            height : M.max(1, M.abs(startY - endY))
        };

        data.start             = eventStart;
        data.end               = eventEnd;
        data.startsOutsideView = eventStart < viewStart;
        data.endsOutsideView   = eventEnd > viewEnd;

        return data;
    },

    // we consider resourceRecord to be date
    getScheduleRegion : function (resourceRecord, eventRecord) {
        var view   = this.view,
            region = resourceRecord ? this.getColumnsByResource(resourceRecord).getRegion() : view.getTableRegion(),

            startY = this.translateToPageCoordinate(0),
            endY   = this.translateToPageCoordinate(view.getStore().getCount() * view.getRowHeight()),

            left   = region.left + view.barMargin,
            right  = region.right - view.barMargin;

        return new Ext.util.Region(Math.min(startY, endY), right, Math.max(startY, endY), left);
    },

    getWeekViewColumnWidth : function () {
        return this.view.timeAxisViewModel.weekViewColumnWidth;
    },

    /**
     * Gets the Ext.util.Region representing the passed resource and optionally just for a certain date interval.
     * @param {Sch.model.Resource} resourceRecord The resource record
     * @param {Date} startDate A start date constraining the region
     * @param {Date} endDate An end date constraining the region
     * @return {Ext.util.Region} The region of the resource
     */
    getResourceRegion : function (resourceRecord, startDate, endDate) {
        var view     = this.view,
            cellLeft = view.getResourceStore().indexOf(resourceRecord) * this.getWeekViewColumnWidth(),
            taStart  = view.timeAxis.getStart(),
            taEnd    = view.timeAxis.getEnd(),
            start    = startDate ? Sch.util.Date.max(taStart, startDate) : taStart,
            end      = endDate ? Sch.util.Date.min(taEnd, endDate) : taEnd,
            startY   = Math.max(0, view.getCoordinateFromDate(start) - view.cellTopBorderWidth),
            endY     = view.getCoordinateFromDate(end) - view.cellTopBorderWidth,
            left     = cellLeft + view.cellBorderWidth,
            right    = cellLeft + this.getWeekViewColumnWidth() - view.cellBorderWidth;

        return new Ext.util.Region(Math.min(startY, endY), right, Math.max(startY, endY), left);
    },

    columnRenderer : function (val, meta, resourceRecord, rowIndex, colIndex) {
        var view   = this.view;
        var retVal = '';

        if (rowIndex === 0) {
            var columnEvents,
                dayEvents,
                i, l;

            columnEvents   = [];
            dayEvents = this.getColumnEvents(meta.column);

            // Iterate events (belonging to current resource)
            for (i = 0, l = dayEvents.length; i < l; i++) {
                var event = dayEvents[i],
                    data  = view.generateTplData(event, event.getResources()[0], colIndex);

                // resourceRecord is a timeAxis tick, we should try to get real resource
                data && columnEvents.push(data);
            }

            if (meta.column.rendered && this.getWeekViewColumnWidth() !== meta.column.getWidth()) {
                this.setColumnWidth(meta.column.getWidth(), true);
            }

            view.eventLayout.vertical.applyLayout(columnEvents, this.getWeekViewColumnWidth() - (2 * view.barMargin) - view.cellBorderWidth);
            retVal = '&#160;' + view.eventTpl.apply(columnEvents);
        }

        if (colIndex % 2 === 1) {
            meta.tdCls   = (meta.tdCls || '') + ' ' + view.altColCls;
            meta.cellCls = (meta.cellCls || '') + ' ' + view.altColCls;
        }

        return retVal;
    },

    // private
    // TODO Doesn't make any sense since columns and rows do not represent a resource! Has to return null.
    resolveResource : function (el) {
        var view = this.view;
        el       = Ext.fly(el).is(view.timeCellSelector) ? el : Ext.fly(el).up(view.timeCellSelector);

        if (el) {
            var node  = el.dom ? el.dom : el;
            var index = 0;

            index = Ext.Array.indexOf(Array.prototype.slice.call(node.parentNode.children), node);

            if (index >= 0) {
                // TODO: unsafe
                var column = view.panel.headerCt.getGridColumns()[index];
                return {
                    start : column.start,
                    end   : column.end
                };
            }
        }
    },

    // private
    onEventUpdate : function (store, model) {
        if (!this.view.rendered || !this.view.headerCt.items.get(0).rendered) return;

        this.renderSingle(model);

        // restore visual event selection
        var view = this.view;
        var sm   = view.getEventSelectionModel();

        sm.forEachEventRelatedSelection(model, function (selectedRecord) {
            view.onEventBarSelect(selectedRecord);
        });
    },

    // private
    onEventAdd : function (s, recs) {
        if (!this.view.rendered || !this.view.headerCt.items.get(0).rendered) return;

        var view = this.view;

        if (recs.length === 1) {
            this.renderSingle(recs[0]);
        } else {
            view.repaintAllEvents();
        }
    },

    // private
    onEventRemove : function (s, recs) {
        if (!this.view.rendered || !this.view.headerCt.items.get(0).rendered) return;

        var view = this.view;

        if (recs.length === 1) {
            // remove nodes from view
            Ext.Array.each(view.getElementsFromEventRecord(recs[0], undefined, undefined, true), function (el) {
                Ext.fly(el).destroy();
            });

            this.relayoutRenderedEvents(recs[0]);
        } else {
            view.repaintAllEvents();
        }
    },

    relayoutRenderedEvents : function (targetEvent) {
        var me      = this,
            columns = me.getColumnsForDateRange(targetEvent, true);

        // When event is rendered into multiple columns each part should behave like separate event.
        // For example, event is rendered into two columns. User created new event and dropped it so
        // new one is overlapping with old one in second column. Desired behavior is following:
        // part in the first column is untouched and part of old event in second column takes only half width.
        Ext.Array.each(columns, function (column) {
            me.repaintEventsForColumn(column.column, column.index);
        });
    },

    renderSingle : function (event) {
        var view = this.view;

        // remove rendered event nodes
        Ext.Array.each(this.getElementsFromEventRecord(event, undefined, undefined, true), function (el) {
            // Only remove elements that are inside weekview
            if (view.el.isAncestor(el)) {
                Ext.fly(el).destroy();
            }
        });

        var previous    = event.previous || {};

        var UD = Sch.util.Date;

        // relayout all affected columns
        var timeSpan = new Sch.model.Range({
            StartDate : UD.min(previous[event.startDateField] || event.getStartDate(), event.getStartDate()),
            EndDate   : UD.max(previous[event.endDateField] || event.getEndDate(), event.getEndDate())
        });

        var columns = this.getColumnsForDateRange(timeSpan);

        Ext.Array.each(columns, function (column) {
            var columnIndex = column.getIndex();

            // gather rendered events data to apply layout and calculate new correct size
            var events          = this.getColumnEvents(column);
            var eventRenderData = Ext.Array.map(events, function (record) {
                if (record === event) {
                    // append new render data for new event
                    return view.generateTplData(event, event.getResources()[0], columnIndex);
                } else {
                    return {
                        start : record.getStartDate() < column.start ? column.start : record.getStartDate(),
                        end   : record.getEndDate() > column.end ? column.end : record.getEndDate(),
                        event : record
                    };
                }
            });

            view.eventLayout.vertical.applyLayout(eventRenderData, column.getWidth() - (2 * view.barMargin) - view.cellBorderWidth);

            // refresh rendered events
            Ext.Array.each(eventRenderData, function (renderData) {
                if (renderData.event === event) {
                    // render new event
                    var containerCell = view.getScheduleCell(0, columnIndex);

                    // if grid content is not yet rendered, then just do nothing
                    if (containerCell) {
                        if (!Ext.versions.touch) {
                            containerCell = Ext.fly(containerCell).first();
                        }

                        view.eventTpl.append(containerCell, [renderData]);
                    }
                } else {
                    var eventNode = view.getElementsFromEventRecord(renderData.event, null, columnIndex)[0];

                    // Element could be missing if view is hidden and a store load happened while hidden
                    // since Ext JS blocks view refreshes while view is hidden
                    if (eventNode) {
                        eventNode.setStyle({
                            left  : renderData.left + 'px',
                            width : Math.max(renderData.width, 0) + 'px'
                        });
                    }
                }
            });
        }, this);
    },

    repaintEventsForColumn : function (column, index) {
        var me     = this;
        var events = me.getColumnEvents(column);
        var view   = me.view;
        var data   = [],
            i, l, event, node, start, end;

        for (i = 0, l = events.length; i < l; i++) {
            event = events[i];
            node  = view.getElementsFromEventRecord(event, undefined, undefined, true)[0];

            // nothing is rendered yet
            if (!node) {
                return;
            }

            // each event node if weekview has column index in it
            // we need a common id without column index, so we perform split/pop/join
            var commonId = node.id.split('-');
            commonId.pop();

            start = event.getStartDate();
            end   = event.getEndDate();

            // simulate one-column events for vertical layout
            data.push({
                start : start < column.start ? column.start : start,
                end   : end > column.end ? column.end : end,
                event : event,
                id    : commonId.join('-')
            });
        }

        view.eventLayout.vertical.applyLayout(data, column.getWidth() - (2 * view.barMargin) - view.cellBorderWidth);

        // We render events into first row in the table so we need this element to make lookups.
        var rowNode = view.getNode(0);

        for (i = 0; i < data.length; i++) {
            event = data[i];
            // We should only touch events (event's parts) that are rendered into changed column.
            // Since parts of one event share element id we have to look up in certain cell.
            var selector = 'td:nth-child(' + (index + 1) + ') [id^=' + event.id + '-]';

            node = Ext.dom.Query.selectNode(selector, rowNode);

            // for the case when we relayout short event
            node && Ext.fly(node).setStyle({
                left  : event.left + 'px',
                width : Math.max(event.width, 0) + 'px'
            });
        }
    },

    /**
     *  Returns the region for a "global" time span in the view. Coordinates are relative to element containing the time columns
     *  @param {Date} startDate The start date of the span
     *  @param {Date} endDate The end date of the span
     *  @return {Ext.util.Region} The region for the time span
     */
    getTimeSpanRegion : function (startDate, endDate) {
        var view   = this.view,
            startY = view.getCoordinateFromDate(startDate),
            endY   = endDate ? view.timeAxisViewModel.getPositionFromDate(endDate, true) : startY;

        // We have to use real columns here to get correct horizontal position, if we try to calculate
        // position via cached column dates and column width - zones will be misplaced.
        // E.g. we have 7 columns to fit into 69px wide view, then last column will be 9px wide and others - 10px wide
        // cached column width will be same 9px and if we will draw zone in 6th column it's left position will be
        // 9 * 6 = 54 and while it should be 60
        var startColumn = this.getColumnsBy(function (column) {
            return column.start <= startDate && column.end > startDate;
        })[0];

        var endColumn = this.getColumnsBy(function (column) {
            return column.start < endDate && column.end >= endDate;
        })[0];

        if (!startColumn || !endColumn || !startColumn.rendered || !endColumn.rendered) {
            return new Ext.util.Region(-1, 0, -1, 0);
        }

        var pair1 = this.translateToScheduleCoordinate([startColumn.getX(), 0]);
        var pair2 = this.translateToScheduleCoordinate([endColumn ? endColumn.getRegion().right : startColumn.getWidth() + pair1[0], 0]);

        return new Ext.util.Region(Math.min(startY, endY), pair2[0], Math.max(startY, endY), pair1[0]);
    },

    /**
     * Gets the start and end dates for an element Region
     * @param {Ext.util.Region} region The region to map to start and end dates
     * @param {String} roundingMethod The rounding method to use
     * @returns {Object} an object containing start/end properties
     */
    getStartEndDatesFromRegion : function (region, roundingMethod) {
        var topDate    = this.view.getDateFromCoordinate([region.left, region.top], roundingMethod),
            bottomDate = this.view.getDateFromCoordinate([region.left, region.bottom], roundingMethod);

        if (topDate && bottomDate) {
            return {
                start : topDate,
                end   : bottomDate
            };
        } else {
            return null;
        }
    },

    setColumnWidth : function (width, preventRefresh) {
        var view = this.view;

        view.weekViewColumnWidth = width;
        view.getTimeAxisViewModel().setViewColumnWidth(width, preventRefresh);
    },

    /**
     * Method to get the currently visible date range in a scheduling view. Please note that it only works when the schedule is rendered.
     * @return {Object} object with `startDate` and `endDate` properties.
     */
    getVisibleDateRange : function () {
        var view = this.view;

        if (!view.rendered) {
            return null;
        }

        var scroll      = view.getScroll(),
            height      = view.getViewContainerHeight(),
            tableRegion = view.getTableRegion(),
            viewEndDate = view.timeAxis.getEnd();

        if (tableRegion.bottom - tableRegion.top < height) {
            var startDate = view.timeAxis.getStart();

            return {startDate : startDate, endDate : viewEndDate};
        }

        return {
            startDate : view.getDateFromCoordinate(scroll.top, null, true),
            endDate   : view.getDateFromCoordinate(scroll.top + height, null, true) || viewEndDate
        };
    },

    /**
     * Gets box for displaying item disgnated by the record. If there're several boxes are displayed for the given
     * item then the method returns all of them
     *
     * @param {Sch.model.Event} eventRecord
     * @return {Object/Object[]/Null}
     * @return {Number} return.top
     * @return {Number} return.bottom
     * @return {Number} return.start
     * @return {Number} return.end
     * @return {Boolean} return.rendered
     */
    getItemBox : function(eventRecord) {
        return null;
    },

    /**
     * Gets displaying item start side
     *
     * @param {Sch.model.Event} eventRecord
     * @return {String} 'left' / 'right' / 'top' / 'bottom'
     */
    getConnectorStartSide : function(eventRecord) {
        return 'top';
    },

    /**
     * Gets displaying item end side
     *
     * @param {Sch.model.Event} eventRecord
     * @return {String} 'left' / 'right' / 'top' / 'bottom'
     */
    getConnectorEndSide : function(eventRecord) {
        return 'bottom';
    }
});
