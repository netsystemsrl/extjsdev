/**
 * Class implementing events layout in a row when using horizontal mode.
 */
Ext.define("Sch.eventlayout.Horizontal", {

    nbrOfBandsByResource      : null,
    bandIndexToPxConvertFn    : null,
    bandIndexToPxConvertScope : null,

    constructor : function (config) {
        Ext.apply(this, config);

        this.nbrOfBandsByResource = {};
    },


    clearCache : function (resource) {
        if (resource)
            delete this.nbrOfBandsByResource[resource.internalId];
        else
            this.nbrOfBandsByResource = {};
    },


    // Input:
    // 1. Resource record
    // 2. Array of Event models, or a function to call to receive such event records lazily
    getNumberOfBands    : function (resource, resourceEventsOrFn) {

        var nbrOfBandsByResource = this.nbrOfBandsByResource;

        if (nbrOfBandsByResource.hasOwnProperty(resource.internalId)) {
            return nbrOfBandsByResource[resource.internalId];
        }

        var resourceEvents = Ext.isFunction(resourceEventsOrFn) ? resourceEventsOrFn() : resourceEventsOrFn;

        var eventsData = Ext.Array.map(resourceEvents, function (event) {
            return {
                start : event.getStartDate(),
                end   : event.getEndDate(),
                event : event
            };
        });

        return this.applyLayout(eventsData, resource);
    },


    /**
     * Groups the provided resource events in horizontal bands by
     * calculating their top coordinates.
     * 
     * The method sorts events before grouping them by calling {@link #sortEvents} method.
     * 
     * @param {Object[]} eventsData Array of object representing the event to be positioned.
     * Each entry has the following properties:
     * - `event` - the event record
     * - `start` - start date
     * - `end` - end date.
     * @param {Sch.model.Resource} resource Resource.
     * @returns {Number} Number of collected bands.
     */
    applyLayout : function (events, resource) {
        var rowEvents = events.slice();

        // Sort events by start date, and text properties.
        var me = this;

        rowEvents.sort(function (a, b) {
            return me.sortEvents(a.event, b.event);
        });

        // return a number of bands required
        return this.nbrOfBandsByResource[resource.internalId] = this.layoutEventsInBands(rowEvents);
    },


    /**
     * Sorts events before positioning them.
     * The method by default sorts events by their start dates and then end dates.
     * 
     * Override the method to control in what order events are laid out.
     * 
     * **Please note** the method is overridden by the scheduling view {@link Sch.mixin.SchedulerView#horizontalEventSorterFn} config.
     * 
     * @param  {Sch.model.Event} a First event
     * @param  {Sch.model.Event} b Second event
     * @return {Int} If result is less than zero then `a` will go before `b`.
     * If it's greater than zero then `b` will go before `a`.
     * If the result is zero it will `a` and `b` will keep their positions. 
     */
    sortEvents : function (a, b) {

        var startA = a.getStartDate();
        var startB = b.getStartDate();
        var sameStart = (startA - startB === 0);

        if (sameStart) {
            return a.getEndDate() > b.getEndDate() ? -1 : 1;
        } else {
            return (startA < startB) ? -1 : 1;
        }
    },

    // Input: Array of event layout data
    layoutEventsInBands : function (events) {
        var verticalPosition = 0;

        do {
            var event = events[0];

            while (event) {
                // Apply band height to the event cfg
                event.top = this.bandIndexToPxConvertFn.call(this.bandIndexToPxConvertScope || this, verticalPosition, event.event);

                // Remove it from the array and continue searching
                Ext.Array.remove(events, event);

                event = this.findClosestSuccessor(event, events);
            }

            verticalPosition++;
        } while (events.length > 0);

        // Done!
        return verticalPosition;
    },


    /**
     * The method finds the next closest event that should be rendered on the same band as the
     * provided one.
     * When the method returns no event (null or undefined) the layout starts a new band.
     *
     * @param {Object} eventData Current event to find the successor of.
     * Represented with an object having the following properties:
     * - `event` - the event record
     * - `start` - start date
     * - `end` - end date
     * @param {Object[]} eventsData Array of events to find the closest successor in.
     * Each event is represented with an object hafing the following properties:
     * - `event` - the event record
     * - `start` - start date
     * - `end` - end date
     * @returns {Object} The found successor (an `eventsData` entry) or `undefined` if not found.
     */
    findClosestSuccessor : function (event, events) {
        var minGap = Infinity,
            closest,
            eventEnd = event.end,
            gap,
            isMilestone = event.end - event.start === 0;

        for (var i = 0, l = events.length; i < l; i++) {
            gap = events[i].start - eventEnd;

            if (gap >= 0 && gap < minGap &&
                    // Two milestones should not overlap
                (gap > 0 || events[i].end - events[i].start > 0 || !isMilestone)) {
                closest = events[i];
                minGap = gap;
            }
        }
        return closest;
    }
});
