/**
 * This mixin class provides recurring events functionality to the {@link Sch.data.EventStore event store}.
 */
Ext.define('Sch.data.mixin.RecurringEvents', {

    extend : 'Ext.Mixin',

    requires : [
        'Sch.model.Recurrence',
        'Sch.data.util.DelayedCalls',
        'Sch.data.util.recurrence.DailyIterator',
        'Sch.data.util.recurrence.WeeklyIterator',
        'Sch.data.util.recurrence.MonthlyIterator',
        'Sch.data.util.recurrence.YearlyIterator'
    ],

    /**
     * Indicates the store supports recurring events.
     * @property {Boolean}
     */
    isRecurringEventStore : true,

    /**
     * Timeout in milliseconds during which to collect calls for generating occurrences related methods.
     * @type {Number}
     */
    delayedCallTimeout : 100,

    setupRecurringEvents : function () {
        this.recurrenceIterators = this.recurrenceIterators || [];

        this.addRecurrenceIterators(
            Sch.data.util.recurrence.DailyIterator,
            Sch.data.util.recurrence.WeeklyIterator,
            Sch.data.util.recurrence.MonthlyIterator,
            Sch.data.util.recurrence.YearlyIterator
        );

        this.relayEvents(
            Sch.data.util.DelayedCalls,
            [
                'delayed-regenerate-occurrences-start',
                'delayed-regenerate-occurrences-end',
                'delayed-generate-occurrences-start',
                'delayed-generate-occurrences-end'
            ]
        );

        this.mon(Sch.data.util.DelayedCalls, {
            'delayed-regenerate-occurrences-end' : this.onDelayedRegenerateOccurrencesEnd,
            'delayed-generate-occurrences-end'   : this.onDelayedGenerateOccurrencesEnd,
            scope                                : this
        });

        this.on('destroy', this.onEventStoreDestroy, this);
    },

    onEventStoreDestroy : function () {
        Sch.data.util.DelayedCalls.cancel('generate-occurrences', 'regenerate-occurrences');
    },

    addRecurrenceIterators : function () {
        for (var i = 0; i < arguments.length; i++) {
            this.recurrenceIterators[arguments[i].frequency] = arguments[i];
        }
    },

    getRecurrenceIteratorForEvent : function (event) {
        return this.recurrenceIterators[event.getRecurrence().getFrequency()];
    },

    /**
     * @private
     * Builds the provided repeating event occurrences for the provided timespan.
     */
    buildOccurrencesForEvent : function (event, startDate, endDate, skipExisting) {
        var occurrences = [];

        // is recurring
        if (event.isRecurring() && event.getStartDate()) {
            var me         = this,
                recurrence = event.getRecurrence(),
                iterator   = me.getRecurrenceIteratorForEvent(event);

            // <debug>
            Ext.Assert && Ext.Assert.truthy(iterator, "Can't find iterator for " + recurrence.getFrequency() + " frequency");
            // </debug>

            var duration = event.getEndDate() - event.getStartDate();

            var exceptionDates = event.getExceptionDates() ? Ext.Array.toMap(event.getExceptionDates(), function (date) { return date - 0; }) : {};

            iterator.forEachDate({
                recurrence : recurrence,
                startDate  : startDate,
                endDate    : endDate,
                fn         : function (date) {
                    // when it's told we don't generate occurrences if we already have ones on the calculated dates
                    if (!exceptionDates[date - 0] && (!skipExisting || !event.getOccurrenceByStartDate(date))) {
                        occurrences.push(event.buildOccurrence(date, duration));
                    }
                }
            });
        }

        return occurrences;
    },

    mergeDelayedCallEntries : function (delayedCall) {
        var entries   = delayedCall.entries,
            byEventId = {},
            startDate,
            endDate,
            events,
            event,
            args;

        // first get the largest range for each requested event
        for (var i = 0; i < entries.length; i++) {
            args      = entries[i];
            events    = args[0];
            startDate = args[1];
            endDate   = args[2];

            // Go over the events and merge this call and other ones arguments
            // so start date will be the minimal start date requested
            // and the end date the maximal end date requested
            // TODO: need to handle cases when ranges don't intersect
            for (var j = 0; j < events.length; j++) {
                event = events[j];

                var savedArgs = byEventId[event.getId()];

                if (savedArgs) {
                    if (savedArgs[1] > startDate) savedArgs[1] = startDate;
                    if (savedArgs[2] < endDate) savedArgs[2] = endDate;

                } else {
                    byEventId[event.getId()] = [ [event] ].concat(args.slice(1));
                }
            }

        }

        // ranges are grouped by event id
        entries = Ext.Object.getValues(byEventId);

        // let's try to combine calls having the same ranges
        var combinedEntries = {};

        for (i = 0; i < entries.length; i++) {
            args      = entries[i];
            event     = args[0];
            startDate = args[1];
            endDate   = args[2];

            var key = (startDate ? startDate.getTime() : '') +'-'+ (endDate ? endDate.getTime() : '');

            // if this range met already
            if (combinedEntries[key]) {
                // add event to the first argument
                combinedEntries[key][0] = combinedEntries[key][0].concat(event);

            // if this range isn't met yet
            // remember we met it using that call arguments
            } else {
                combinedEntries[key] = args;
            }
        }

        // use combined entries
        delayedCall.entries = Ext.Object.getValues(combinedEntries);
    },

    /**
     * @private
     * Schedules regenerating (removing and building back) the occurrences of the provided recurring events in the provided time interval.
     * The method waits for {@link #delayedCallTimeout} milliseconds timeout during which it collects repeating calls.
     * Every further call restarts the timeout. After the timeout the method processes the collected calls trying to merge startDate/endDate ranges
     * to reduce the number of calls and then invokes {@link #generateOccurrencesForEvents} method and removes the previous occurrences.
     * @param  {Sch.model.Event[]} events                   Events to build occurrences for.
     * @param  {Date}              startDate                Time interval start.
     * @param  {Date}              endDate                  Time interval end.
     * @param  {Boolean}           [preserveExisting=false] `True` to not not generate occurrences if there are already existing ones on the calculated dates.
     */
    regenerateOccurrencesForEventsBuffered : function (events, startDate, endDate) {
        var me = this;

        if (!Ext.isIterable(events)) {
            events = [events];
        }

        events = Ext.Array.filter(events, function (event) { return event.isRecurring(); });

        if (events.length) {
            var delayedCall = Sch.data.util.DelayedCalls.schedule({
                id       : 'regenerate-occurrences',
                timeout  : me.delayedCallTimeout,
                beforeFn : me.mergeDelayedCallEntries,
                fn       : function (events, startDate, endDate) {
                    // Collect old occurrences we'll remove them later by using a single store.remove() call
                    var toRemove = delayedCall.occurrencesToRemove = delayedCall.occurrencesToRemove || [];
                    toRemove.push.apply(toRemove, me.getOccurrencesForEvents(events));

                    // add new occurrences
                    me.generateOccurrencesForEvents(events, startDate, endDate, false);
                },
                args     : [events, startDate, endDate],

                afterFn  : function (delayedCall) {
                    // remove previous occurrences (if we have any)
                    delayedCall.occurrencesToRemove.length && me.remove(delayedCall.occurrencesToRemove);
                },

                scope : me
            });
        }
    },

    /**
     * @private
     * Schedules generating the occurrences of the provided recurring events in the provided time interval.
     * The method waits for {@link #delayedCallTimeout} milliseconds timeout during which it collects repeating calls.
     * Every further call restarts the timeout. After the timeout the method processes the collected calls trying to merge startDate/endDate ranges
     * to reduce the number of calls and then invokes {@link #generateOccurrencesForEvents} method.
     * @param  {Sch.model.Event[]} events                   Events to build occurrences for.
     * @param  {Date}              startDate                Time interval start.
     * @param  {Date}              endDate                  Time interval end.
     * @param  {Boolean}           [preserveExisting=true]  `False` to generate occurrences even if there is already an existing one on a calculated date.
     */
    generateOccurrencesForEventsBuffered : function (events, startDate, endDate, preserveExisting) {
        var me = this;

        preserveExisting = preserveExisting !== false;

        if (!Ext.isIterable(events)) {
            events = [events];
        }

        events = Ext.Array.filter(events, function (event) { return event.isRecurring(); });

        if (events.length) {
            Sch.data.util.DelayedCalls.schedule({
                id       : 'generate-occurrences',
                timeout  : me.delayedCallTimeout,
                beforeFn : me.mergeDelayedCallEntries,
                fn       : me.generateOccurrencesForEvents,
                args     : [events, startDate, endDate, preserveExisting],

                scope  : me
            });
        }
    },

    /**
     * @private
     * Generates occurrences of the provided recurring events in the provided time interval.
     * @param  {Sch.model.Event[]} events                   Events to build occurrences for.
     * @param  {Date}              startDate                Time interval start.
     * @param  {Date}              endDate                  Time interval end.
     * @param  {Boolean}           [preserveExisting=true] `False` to generate occurrences even if there is already an existing one on a calculated date.
     */
    generateOccurrencesForEvents : function (events, startDate, endDate, preserveExisting) {
        if (events) {
            var me             = this,
                occurrences    = [],
                allOccurrences = [];

            preserveExisting = preserveExisting !== false;

            if (!Ext.isIterable(events)) events = [events];

            if (events.length) {

                me.fireEvent('generate-occurrences-start', me, events, startDate, endDate, preserveExisting);

                for (var i = 0; i < events.length; i++) {

                    var event = events[i],
                        firstOccurrenceStartDate,
                        firstOccurrence,
                        eventStartDate;

                    if ((occurrences = me.buildOccurrencesForEvent(event, startDate, endDate, preserveExisting))) {

                        eventStartDate = event.getStartDate();

                        // If requested timespan starts before or matches the event starts
                        // we treat the first built occurrence as the event itself
                        // and if the occurrence start doesn't match the event start
                        // we move the event accordingly
                        if (startDate <= eventStartDate) {
                            // get 1st occurrence
                            if ((firstOccurrence = occurrences.shift())) {
                                firstOccurrenceStartDate = firstOccurrence.getStartDate();
                                // compare its start date with the event one and shift the event if needed
                                if (firstOccurrenceStartDate - eventStartDate) {
                                    event.setStartEndDate(firstOccurrenceStartDate, firstOccurrence.getEndDate());
                                    // Since we've changed the event start date the recurrence "Days"/"MonthDays"/"Months"
                                    // might get redundant in case the event start date matches the fields values
                                    // Calling recurrence sanitize() will clean the fields in this case.
                                    event.getRecurrence().sanitize();
                                }
                            }
                        }

                        allOccurrences.push.apply(allOccurrences, occurrences);
                    }
                }

                if (allOccurrences.length) {
                    me.add(allOccurrences);
                }

                me.fireEvent('generate-occurrences-end', me, events, allOccurrences, startDate, endDate, preserveExisting);
            }
        }
    },

    /**
     * @private
     * Generates occurrences for all the existing recurring events in the provided time interval.
     * @param  {Date}    startDate                Time interval start.
     * @param  {Date}    endDate                  Time interval end.
     * @param  {Boolean} [preserveExisting=false] `True` to not not generate occurrences if there are already existing ones on the calculated dates.
     */
    generateOccurrencesForAll : function (startDate, endDate, preserveExisting) {
        var me = this,
            events;

        if ((events = me.getRecurringEvents()) && events.length) {
            me.fireEvent('generate-occurrences-all-start', me, events, startDate, endDate, preserveExisting);

            me.generateOccurrencesForEvents(events, startDate, endDate, preserveExisting);

            me.fireEvent('generate-occurrences-all-end', me, events, startDate, endDate, preserveExisting);
        }
    },

    /**
     * Returns all the recurring events.
     * @return {Sch.model.Event[]} Array of recurring events.
     */
    getRecurringEvents : function () {
        var me = this;

        return me.queryBy(function (event) {
            return event.isRecurrableEvent && event.isRecurring();
        }).getRange();
    },

    /**
     * Returns occurrences of the provided recurring events.
     * @param  {Sch.model.Event/Sch.model.Event[]} events Recurring events which occurrences should be retrieved.
     * @return {Sch.model.Event[]} Array of the events occurrences.
     */
    getOccurrencesForEvents : function (events) {
        var result = [];

        if (!Ext.isIterable(events)) events = [events];

        if (events.length) {
            for (var i = 0; i < events.length; i++) {
                var eventId = events[i].getId();

                // TODO: cache
                result.push.apply(result,
                    this.queryBy(function (event) {
                        return event.isRecurrableEvent && event.getRecurringEventId() == eventId;
                    }).getRange()
                );
            }
        }

        return result;
    },

    /**
     * Returns occurrences of all the existing recurring events.
     * @return {Sch.model.Event[]} Array of the occurrences.
     */
    getOccurrencesForAll : function () {
        return this.queryBy(function (event) { return event.isRecurrableEvent && event.isOccurrence(); }).getRange();
    },

    /**
     * Removes occurrences of the provided recurring events.
     * @param  {Sch.model.Event/Sch.model.Event[]} events Recurring events which occurrences should be removed.
     */
    removeOccurrencesForEvents : function (events) {
        return this.remove(this.getOccurrencesForEvents(events));
    },

    /**
     * Removes occurrences of all the existing recurring events.
     */
    removeOccurrencesForAll : function () {
        return this.remove(this.getOccurrencesForAll());
    },

    onDelayedRegenerateOccurrencesEnd : function () {
        /**
         * @event occurrencesready
         * Fires when repeating events occurrences building is done. This happens on:
         *
         * - after panel got rendered;
         * - on event store load/add/update/remove events;
         * - on visible timespan change.
         * @param {Sch.data.EventStore} eventStore Event store.
         */
        this.fireEvent('occurrencesready', this);
    },

    onDelayedGenerateOccurrencesEnd : function () {
        this.fireEvent('occurrencesready', this);
    }

});
