Ext.define('Sch.data.util.recurrence.DailyIterator', {

    extend    : 'Sch.data.util.recurrence.AbstractIterator',

    requires  : ['Sch.util.Date'],

    singleton : true,

    frequency : 'DAILY',

    forEachDate : function (config) {
        var me         = this,
            recurrence = config.recurrence,
            event      = recurrence.getEvent(),
            eventStart = event.getStartDate(),
            startDate  = config.startDate || eventStart,
            until      = recurrence.getEndDate(),
            endDate    = config.endDate || until,
            fn         = config.fn,
            scope      = config.scope || me,
            D          = Sch.util.Date,
            interval   = recurrence.getInterval(),
            count      = recurrence.getCount(),
            counter    = 0;

        if (until && endDate && endDate > until) endDate = until;

        // iteration should not start before the event starts
        if (eventStart > startDate) startDate = eventStart;

        var delay            = startDate - eventStart,
            // recurrence interval duration in ms (86400000 is a single day duration in ms)
            intervalDuration = interval * 86400000,
            delayInIntervals = Math.floor(delay / intervalDuration);

        // TODO: need to make a constant
        if (!endDate && !count) count = me.MAX_OCCURRENCES_COUNT;

        var date = D.add(eventStart, D.DAY, delayInIntervals);

        while (!endDate || date <= endDate) {

            counter++;

            if (date >= startDate) {
                if ((endDate && date > endDate) || fn.call(scope, date, counter) === false || (count && counter >= count)) break;
            }

            // shift to the next day
            date = D.add(date, D.DAY, interval);
        }
    }
});
