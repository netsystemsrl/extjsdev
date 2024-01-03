/**
 * @class Sch.view.Vertical
 * @private
 *
 * A mixin, purposed to be consumed along with {@link Sch.mixin.AbstractTimelineView} and providing the implementation of some methods, specific to vertical mode.
*/
Ext.define("Sch.view.Vertical", {

    requires : [
        'Ext.util.Region',
        'Ext.Element',
        'Ext.Array',
        'Sch.util.Date'
    ],

    // Provided by creator, in the config object
    view : null,

    constructor : function(config) {
        Ext.apply(this, config);
    },

    getElementsFromEventRecord: function(eventRecord, resourceRecord, index, raw) {
        var view = this.view,
            query;

        raw = raw || false;

        if (resourceRecord) {
            query = '[id^=' + view.eventPrefix + eventRecord.internalId + '-' + resourceRecord.internalId + '-]';
        }
        else {
            query = '[id^=' + view.eventPrefix + eventRecord.internalId + '-]';
        }

        return view.getEl().query(query, raw);
    },

    translateToScheduleCoordinate: function (y) {
        var view = this.view;

        return y - view.getViewContainerElementTop() + view.getVerticalScroll();
    },

    // private
    translateToPageCoordinate: function (y) {
        var view    = this.view;
        var scroll  = view.getVerticalScroll();

        return y + view.getViewContainerElementTop() - scroll;
    },

    getDateFromXY   : function (xy, roundingMethod, local) {
        var coord   = xy[1];

        if (!local) {
            coord = this.translateToScheduleCoordinate(coord);
        }
        return this.view.timeAxisViewModel.getDateFromPosition(coord, roundingMethod);
    },

    getEventRenderData : function(event, resource) {
        var M           = Math,
            eventStart  = event.getStartDate(),
            eventEnd    = event.getEndDate(),
            view        = this.view,
            viewStart   = view.timeAxis.getStart(),
            viewEnd     = view.timeAxis.getEnd(),
            startY      = M.floor(view.getCoordinateFromDate(Sch.util.Date.max(eventStart, viewStart))),
            endY        = M.floor(view.getCoordinateFromDate(Sch.util.Date.min(eventEnd, viewEnd))),
            data        = { event : event };

        data.top    = M.max(0, M.min(startY, endY) - view.eventBorderWidth);
        data.height = M.max(1, M.abs(startY - endY));

        data.start = eventStart;
        data.end = eventEnd;
        data.startsOutsideView = eventStart < viewStart;
        data.endsOutsideView = eventEnd > viewEnd;

        return data;
    },

    getScheduleRegion: function (resourceRecord, eventRecord) {
        var view        = this.view,
            region      = resourceRecord ? Ext.fly(view.getScheduleCell(view.getNodes()[0], view.getResourceStore().indexOf(resourceRecord))).getRegion() : view.getTableRegion(),

            taStart     = view.timeAxis.getStart(),
            taEnd       = view.timeAxis.getEnd(),

            dateConstraints     = view.getDateConstraints(resourceRecord, eventRecord) || { start: taStart, end: taEnd },

            startY      = this.translateToPageCoordinate(view.getCoordinateFromDate(Sch.util.Date.max(taStart, dateConstraints.start))),
            endY        = this.translateToPageCoordinate(view.getCoordinateFromDate(Sch.util.Date.min(taEnd, dateConstraints.end))),

            left        = region.left + view.barMargin,
            right       = (resourceRecord ? (region.left + this.getResourceColumnWidth(resourceRecord)) : region.right) - view.barMargin;

        return new Ext.util.Region(Math.min(startY, endY), right, Math.max(startY, endY), left);
    },

    getResourceColumnWidth : function(resource) {
        return this.view.timeAxisViewModel.resourceColumnWidth;
    },

    getResourceColumnLayoutAvailableWidth : function(resourceRecord) {
        var me = this;
        return me.getResourceColumnWidth(resourceRecord) - (2 * me.view.barMargin) - me.view.cellBorderWidth;
    },

    /**
    * Gets the Ext.util.Region representing the passed resource and optionally just for a certain date interval.
    * @param {Sch.model.Resource} resourceRecord The resource record
    * @param {Date} startDate A start date constraining the region
    * @param {Date} endDate An end date constraining the region
    * @return {Ext.util.Region} The region of the resource
    */
    getResourceRegion: function (resourceRecord, startDate, endDate) {
        var view            = this.view,
            cellLeft        = view.getResourceStore().indexOf(resourceRecord) * this.getResourceColumnWidth(resourceRecord),
            taStart         = view.timeAxis.getStart(),
            taEnd           = view.timeAxis.getEnd(),
            start           = startDate ? Sch.util.Date.max(taStart, startDate) : taStart,
            end             = endDate ? Sch.util.Date.min(taEnd, endDate) : taEnd,
            startY          = Math.max(0, view.getCoordinateFromDate(start) - view.cellTopBorderWidth),
            endY            = view.getCoordinateFromDate(end) - view.cellTopBorderWidth,
            left            = cellLeft + view.cellBorderWidth,
            right           = cellLeft + this.getResourceColumnWidth(resourceRecord) - view.cellBorderWidth;

        return new Ext.util.Region(Math.min(startY, endY), right, Math.max(startY, endY), left);
    },

    columnRenderer: function (val, meta, resourceRecord, rowIndex, colIndex) {
        var view = this.view;
        var retVal = '';

        if (rowIndex === 0) {
            var D               = Sch.util.Date,
                ta              = view.timeAxis,
                columnEvents,
                resourceEvents,
                i, l;

            columnEvents = [];
            resourceEvents = view.getEventStore().getEventsForResource(resourceRecord);

            // Iterate events (belonging to current resource)
            for (i = 0, l = resourceEvents.length; i < l; i++) {
                var event   = resourceEvents[i],
                    start   = event.getStartDate(),
                    end     = event.getEndDate();

                // Determine if the event should be rendered or not
                if (start && end && ta.timeSpanInAxis(start, end)) {
                    columnEvents.push(view.generateTplData(event, resourceRecord, colIndex));
                }
            }
            view.eventLayout.vertical.applyLayout(columnEvents, this.getResourceColumnLayoutAvailableWidth(resourceRecord));
            retVal = '&#160;' + view.eventTpl.apply(columnEvents);
        }

        if (colIndex % 2 === 1) {
            meta.tdCls = (meta.tdCls || '') + ' ' + view.altColCls;
            meta.cellCls = (meta.cellCls || '') + ' ' + view.altColCls;
        }

        return retVal;
    },

    // private
    resolveResource: function(node) {
        var me     = this,
            view   = me.view,
            eventNode,
            index = -1,
            result;

        eventNode = Ext.fly(node).is(view.eventSelector) && node || Ext.fly(node).up(view.eventSelector, null, true);

        if (eventNode) {
            // Fast case
            result = view.getResourceRecordFromDomId(eventNode.id);
        }
        else {
            node = Ext.fly(node).is(view.timeCellSelector) ? node : Ext.fly(node).up(view.timeCellSelector, null, true);

            if (node) {
                index = Ext.Array.indexOf(Array.prototype.slice.call(node.parentNode.children), node);
            }

            result = index >= 0 && view.getResourceStore().getAt(index) || null;
        }

        return result;
    },

    // private
    onEventUpdate: function (store, event) {
        var me = this;
        var previous = event.previous || {};
        var view = me.view;
        var timeAxis = view.timeAxis;

        var newStartDate  = event.getStartDate();
        var newEndDate    = event.getEndDate();

        var startDate       = previous[event.startDateField] || newStartDate;
        var endDate         = previous[event.endDateField] || newEndDate;

        // event was visible or visible now
        var eventWasInView  = startDate && endDate && timeAxis.timeSpanInAxis(startDate, endDate);

        var resource;

        // resource has to be repainted only if it was changed and event was rendered/is still rendered
        if (event.resourceIdField in previous && eventWasInView) {
            // If an event has been moved to a new resource, refresh old resource first
            resource = store.getResourceStore().getById(previous[event.resourceIdField]);
            resource && me.relayoutRenderedEvents(resource);
        }

        // also resource has to be repanted if event was moved inside/outside of time axis
        if ((newStartDate && newEndDate && timeAxis.timeSpanInAxis(newStartDate, newEndDate)) || eventWasInView) {
            me.renderSingle(event);
            Ext.Array.each(event.getResources(), function(resource) {
                me.relayoutRenderedEvents(resource);
                view.getEventSelectionModel().isSelected(event) && view.onEventBarSelect(event, true);
            });
        }
    },

    // private
    onEventAdd: function (store, recs) {
        var me = this,
            view = me.view,
            event, startDate, endDate;

        if (recs.length === 1) {
            event     = recs[0];
            startDate = event.getStartDate();
            endDate   = event.getEndDate();

            if (startDate && endDate && view.timeAxis.timeSpanInAxis(startDate, endDate)) {
                me.renderSingle(event);
                // Here one could use event.getResources() as well, I use store.getResourcesForEvent() here
                // for consistency with onEventUpdate only
                Ext.Array.each(store.getResourcesForEvent(event), function(resource) {
                    me.relayoutRenderedEvents(resource);
                });
            }
        } else {
            view.repaintAllEvents();
        }
    },

    // private
    onEventRemove: function (s, events) {
        // a comment from `repaintEventsForResource`
        // For vertical, we always repaint all events (do per-column repaint is not supported)
        // so it seems we can't optimize and repaint only for single resource
        var me = this,
            view = me.view,
            event,
            startDate,
            endDate,
            i, len, gotEventInTimeSpan;

        for (gotEventInTimeSpan = false, i = 0, len = events.length; !gotEventInTimeSpan && i < len; i++) {
            event       = events[i];
            startDate   = event.getStartDate();
            endDate     = event.getEndDate();

            gotEventInTimeSpan = startDate && endDate && view.timeAxis.timeSpanInAxis(startDate, endDate);
            // Event repaint is deffered due to #4607.
            //
            // The issues happened when one loaded records with existing ids into the event store, in this case
            // the old records are replaced with the new ones. But this also leaded to replaced event elements
            // disappearing if event store is filtered.
            //
            // The issue has happened for Vertical mode but hasn't for Horizontal. The one big difference in those
            // modes onEventRemove() methods implementation is that Horizontal mode fades out the removed events'
            // elements and calls repaint code afterwards, i.e. repainting is delayed, whereas in Vertical mode
            // the repainting had happened instanly. After I switched to delayed repainting the issue related test
            // 1000_vertical_4607.t.js became green.
            gotEventInTimeSpan && Ext.asap(function() { view.repaintAllEvents(); });
        }
    },

    getScheduledEventsForResource : function (resourceRecord) {
        var view = this.view;

        return view.getEventStore().filterEventsForResource(resourceRecord, function(event) {
            return view.timeAxis.isRangeInAxis(event) && event.isScheduled();
        });
    },

    relayoutRenderedEvents : function(resource) {
        var data   = [],
            view   = this.view,
            events = this.getScheduledEventsForResource(resource);

        Ext.Array.each(events, function(event) {
            // In vertical mode there can be only 0 or 1 nodes rendered for each event/resource pair
            var nodes = view.getElementsFromEventRecord(event, resource);

            nodes.length && data.push({
                start : event.getStartDate(),
                end   : event.getEndDate(),
                event : event,
                node  : nodes[0]
            });
        });

        // Now do a layout pass to get updated dimension / position data for all affected events
        view.eventLayout.vertical.applyLayout(data, this.getResourceColumnLayoutAvailableWidth(resource));

        Ext.Array.each(data, function(event) {
            event.node.setStyle({
                left  : event.left + 'px',
                width : event.width + 'px'
            });

            view.fireEvent('eventrepaint', view, event.event, event.node);
        });
    },

    renderSingle : function (event) {
        // Inject moved event into correct cell
        var view        = this.view,
            startDate   = event.getStartDate(),
            endDate     = event.getEndDate();

        // First removing existing event DOM elements, there might be one element per each event/resource pair
        Ext.Array.each(view.getElementsFromEventRecord(event), function(el) {
            el.destroy();
        });

        // If event is within a currently displayed timespan
        if (startDate && endDate && view.timeAxis.timeSpanInAxis(startDate, endDate)) {
            // then render event DOM elements for each event assigned resource
            Ext.Array.each(event.getResources(), function(resource) {
                var rIndex        = view.getResourceStore().indexOf(resource),
                    containerCell = Ext.fly(view.getScheduleCell(0, rIndex)),
                    data;

                if (containerCell) { // This check is unclear, I've just left it as is after the method refactoring
                    data = view.generateTplData(event, resource, rIndex);
                    data && view.eventTpl.append(containerCell.first(), [data]);
                }
            });
        }
    },

    /**
    *  Returns the region for a "global" time span in the view. Coordinates are relative to element containing the time columns
    *  @param {Date} startDate The start date of the span
    *  @param {Date} endDate The end date of the span
    *  @return {Ext.util.Region} The region for the time span
    */
    getTimeSpanRegion: function (startDate, endDate) {
        var view        = this.view,
            startY      = view.getCoordinateFromDate(startDate),
            endY        = endDate ? view.getCoordinateFromDate(endDate) : startY,
            tableRegion = view.getTableRegion(),
            width       = tableRegion ? tableRegion.right - tableRegion.left : view.getEl().dom.clientWidth; // fallback in case grid is not rendered (no rows/table)

        return new Ext.util.Region(Math.min(startY, endY), width, Math.max(startY, endY), 0);
    },

    /**
    * Gets the start and end dates for an element Region
    * @param {Ext.util.Region} region The region to map to start and end dates
    * @param {String} roundingMethod The rounding method to use
    * @returns {Object} an object containing start/end properties
    */
    getStartEndDatesFromRegion: function (region, roundingMethod) {
        var topDate     = this.view.getDateFromCoordinate(region.top, roundingMethod),
            bottomDate  = this.view.getDateFromCoordinate(region.bottom, roundingMethod);

        if (topDate && bottomDate) {
            return {
                start   : topDate,
                end     : bottomDate
            };
        } else {
            return null;
        }
    },

    setColumnWidth : function (width, preventRefresh) {
        var view = this.view;

        view.resourceColumnWidth = width;
        view.getTimeAxisViewModel().setViewColumnWidth(width, preventRefresh);
    },

    /**
    * Method to get the currently visible date range in a scheduling view. Please note that it only works when the schedule is rendered.
    * @return {Object} object with `startDate` and `endDate` properties.
    */
    getVisibleDateRange: function () {
        var view = this.view;

        if (!view.rendered) {
            return null;
        }

        var scroll      = view.getScroll(),
            height      = view.getViewContainerHeight(),
            tableRegion = view.getTableRegion(),
            viewEndDate = view.timeAxis.getEnd();

        if (tableRegion.bottom - tableRegion.top < height) {
            var startDate   = view.timeAxis.getStart();

            return { startDate: startDate, endDate: viewEndDate };
        }

        return {
            startDate   : view.getDateFromCoordinate(scroll.top, null, true),
            endDate     : view.getDateFromCoordinate(scroll.top + height, null, true) || viewEndDate
        };
    },

    /**
     * Gets box for displayed item designated by the record. If there're several boxes are displayed for the given item
     * then the method returns all of them. Box coordinates are in view coordinate system.
     *
     * Boxes outside scheduling view timeaxis timespan will not be returned.
     *
     * @param {Sch.model.Event} eventRecord
     * @return {Object/Object[]/Null}
     * @return {Boolean} return.rendered Whether the box was calculated for the rendered scheduled record or was
     *                                   approximatelly calculated for the scheduled record outside of view area.
     * @return {Number} return.top
     * @return {Number} return.bottom
     * @return {Number} return.start
     * @return {Number} return.end
     * @return {String} return.relPos if the item is not rendered then provides a view relative position one of 'before', 'after'
     * @protected
     */
    getItemBox : function(eventRecord) {
        var me = this;
        return Ext.Array.map(eventRecord.getResources(), function(resourceRecord) {
            return me.getResourceEventBox(eventRecord, resourceRecord);
        });
    },

    getResourceEventBox : function(eventRecord, resourceRecord) {
        var SUD = Sch.util.Date,
            me = this,
            result = null,
            view = me.view,
            viewStartDate = view.timeAxis.getStart(), // WARNING: timeaxis is the private property of Sch.mixin.AbstractTimelineView
            viewEndDate   = view.timeAxis.getEnd(),   // WARNING: timeaxis is the private property of Sch.mixin.AbstractTimelineView
            eventStartDate = eventRecord.getStartDate(),
            eventEndDate   = eventRecord.getEndDate(),
            eventLayout, eventsLayoutData, eventRecordData,
            resourceColumnLeft,
            eventEls, eventEl, eventElOffsets, eventElBox;

        // Checking if event record is within current time axis timespan, i.e. if it's rendered
        if (eventStartDate && eventEndDate && SUD.intersectSpans(eventStartDate, eventEndDate, viewStartDate, viewEndDate)) {

            // Managed event sizing means that the view is responsible for event height setting, the oposite case
            // is when event height is controlled by CSS's top and height properties.

            // Fast case: managed event sizing on, querying the view for box position and dimensions
            if (view.managedEventSizing) {

                eventLayout = view.eventLayout.vertical;

                var resourceEvents = view.getEventStore().filterEventsForResource(resourceRecord, view.timeAxis.isRangeInAxis, view.timeAxis);
                // Preparing events layout data for event layout instance to process
                eventsLayoutData = Ext.Array.map(resourceEvents, me.getEventRenderData, me);

                // Processing event layout data injecting event horizontal position into them
                eventLayout.applyLayout(eventsLayoutData, me.getResourceColumnLayoutAvailableWidth(resourceRecord));

                // Now we are to find our particular event data inside all events data for the given row record
                eventRecordData = Ext.Array.findBy(eventsLayoutData, function(eventData) {
                    return eventData.event == eventRecord;
                });

                // We must find our event record corresponding layout data object here, but just to make sure
                if (eventRecordData) {

                    // We have event record data with coordinates within the row node, but we need
                    // those coordinates to be translated relative to view's viewport left.
                    resourceColumnLeft = view.getResourceStore().indexOf(resourceRecord) * me.getResourceColumnWidth(resourceRecord);

                    // Finally we have all the data needed to calculated the event record box
                    result = {
                        rendered : true,
                        start    : eventRecordData.left + resourceColumnLeft,
                        end      : eventRecordData.left + eventRecordData.width + resourceColumnLeft,
                        top      : eventRecordData.top,
                        bottom   : eventRecordData.top + eventRecordData.height
                    };
                }
            }
            // Slow case: managed event sizing off, querying the DOM for box position and dimensions
            else {
                eventEls = view.getElementsFromEventRecord(eventRecord, eventRecord !== resourceRecord && resourceRecord);

                // We must have at one and only one element here, but just to make sure
                if (eventEls.length) {
                    eventEl        = eventEls[0];
                    eventElOffsets = eventEl.getOffsetsTo(view.getEl());
                    eventElBox     = eventEl.getBox();

                    result = {
                        rendered : true,
                        start    : eventElOffsets[0],
                        end      : eventElOffsets[0] + eventElBox.width,
                        top      : eventElOffsets[1],
                        bottom   : eventElOffsets[1] + eventElBox.height
                    };
                }
            }

            // Some boxes might need special adjustments
            if (result) {
                result = me.adjustItemBox(eventRecord, result);
            }
        }

        return result;
    },

    /**
     * Adjusts task record box if needed
     *
     * @param {Sch.model.Event} eventRecord
     * @param {Object} eventRecordBox
     * @return {Number} eventRecordBox.top
     * @return {Number} eventRecordBox.bottom
     * @return {Number} eventRecordBox.start
     * @return {Number} eventRecordBox.end
     * @return {Object}
     * @return {Number} return.top
     * @return {Number} return.bottom
     * @return {Number} return.start
     * @return {Number} return.end
     * @protected
     */
    adjustItemBox : function(eventRecord, eventRecordBox) {
        return eventRecordBox;
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
