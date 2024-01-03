Ext.define('Sch.data.util.recurrence.WeeklyIterator', {

    extend    : 'Sch.data.util.recurrence.AbstractIterator',

    requires  : ['Sch.util.Date', 'Sch.data.util.recurrence.DayRuleEncoder'],

    singleton : true,

    frequency : 'WEEKLY',

    forEachDate : function (config) {
        var me         = this,
            D          = Sch.util.Date,
            fn         = config.fn,
            scope      = config.scope || me,
            recurrence = config.recurrence,
            event      = config.event || recurrence && recurrence.getEvent(),
            eventStart = config.eventStartDate || event.getStartDate(),
            startDate  = config.startDate || eventStart,
            until      = recurrence && recurrence.getEndDate(),
            endDate    = config.endDate || until,
            interval   = config.interval || recurrence.getInterval(),
            weekDays   = Sch.data.util.recurrence.DayRuleEncoder.decode(config.days || recurrence && recurrence.getDays()),
            count      = config.count || recurrence && recurrence.getCount(),
            counter    = 0,
            weekStartDate, date;

        if (until && endDate && endDate > until) endDate = until;

        // days could be provided in any order so it's important to sort them
        if (weekDays && weekDays.length) {
            weekDays.sort(function (a, b) { return a[0] - b[0]; });

        // "Days" might be skipped then we use the event start day
        } else {
            weekDays = [[ eventStart.getDay() ]];
        }


        // iteration should not start before the event starts
        if (eventStart > startDate) {
            startDate = eventStart;
        }

        // if the recurrence is limited w/ "Count"
        // we need to 1st count passed occurrences so we always start iteration from the event start date
        if (count) {
            weekStartDate = D.getNext(eventStart, D.WEEK, 0, 0);

        } else {
            weekStartDate = D.getNext(startDate, D.WEEK, 0, 0);
        }


        if (!endDate && !count) count = me.MAX_OCCURRENCES_COUNT;

        while (!endDate || weekStartDate <= endDate) {

            for (var i = 0; i < weekDays.length; i++) {

                date = D.copyTimeValues(D.add(weekStartDate, D.DAY, weekDays[i][0]), eventStart);

                if (date >= eventStart) {
                    counter++;

                    if (date >= startDate) {
                        if ((endDate && date > endDate) || (fn.call(scope, date, counter) === false) || (count && counter >= count)) return;
                    }
                }
            }

            // get next week start
            weekStartDate = D.getNext(weekStartDate, D.WEEK, interval, 0);
        }
    }

});
