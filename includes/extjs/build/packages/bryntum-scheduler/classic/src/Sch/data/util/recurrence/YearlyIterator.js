Ext.define('Sch.data.util.recurrence.YearlyIterator', {

    extend    : 'Sch.data.util.recurrence.AbstractIterator',

    requires  : [
        'Sch.util.Date',
        'Sch.data.util.recurrence.DayRuleEncoder'
    ],

    singleton : true,

    frequency : 'YEARLY',

    forEachDate : function (config) {
        var me             = this,
            D              = Sch.util.Date,
            fn             = config.fn,
            scope          = config.scope || me,
            recurrence     = config.recurrence,
            event          = config.event || recurrence.getEvent(),
            eventStart     = config.eventStartDate || event.getStartDate(),
            startDate      = config.startDate || eventStart,
            until          = recurrence && recurrence.getEndDate(),
            endDate        = config.endDate || until,
            interval       = config.interval || recurrence.getInterval(),
            rawDays        = config.days || recurrence && recurrence.getDays(),
            weekDays       = Sch.data.util.recurrence.DayRuleEncoder.decode(rawDays),
            months         = config.months || recurrence && recurrence.getMonths(),
            count          = config.count || recurrence && recurrence.getCount(),
            positions      = config.positions || recurrence && recurrence.getPositions(),
            hasPositions   = positions && positions.length,
            counter        = 0,
            processedDate  = {},
            weekDayPosition,
            yearStartDate, yearEndDate,
            dates, date, i;

        if (until && endDate && endDate > until) endDate = until;

        // iteration should not start before the event starts
        if (eventStart > startDate) startDate = eventStart;

        // if the recurrence is limited w/ "Count"
        // we need to 1st count passed occurrences so we always start iteration from the event start date
        if (count) {
            yearStartDate = new Date(D.getNext(eventStart, D.YEAR, 0));
        } else {
            yearStartDate = new Date(D.getNext(startDate, D.YEAR, 0));
        }

        yearEndDate   = new Date(D.getNext(yearStartDate, D.YEAR, 1) - 1);

        months && months.sort(function (a, b) { return a - b; });

        // if no months provided let's use the event month
        if (!(months && months.length) && !(weekDays && weekDays.length)) {
            months = [ eventStart.getMonth() + 1 ];
        }

        if (weekDays && weekDays.length) {
            // Collect hash of positions indexed by week days
            Ext.each(weekDays, function (day) {
                if (day[1]) {
                    weekDayPosition         = weekDayPosition || {};
                    weekDayPosition[day[0]] = day[1];
                }
            });
        }

        // label to break nested loops
        top:

        while ((!endDate || endDate >= yearStartDate) && (!count || counter < count)) {

            dates = [];

            if (weekDays && weekDays.length) {

                Ext.each(weekDays, function (day) {
                    var weekDay = day[0],
                        from    = 1,
                        till    = 53;

                    // if position provided
                    if (day[1]) {
                        from = till = day[1];
                    }

                    for (i = from; i <= till; i++) {
                        if ((date = me.getNthDayInPeriod(yearStartDate, yearEndDate, weekDay, i))) {
                            date = D.copyTimeValues(date, eventStart);

                            if (!processedDate[date.getTime()]) {
                                // remember we processed the date
                                processedDate[date.getTime()] = true;

                                dates.push(date);
                            }
                        }
                    }
                });

                dates.sort(function (a, b) { return a - b; });

                if (!hasPositions) {
                    for (i = 0; i < dates.length; i++) {
                        date = dates[i];

                        if (date >= eventStart) {
                            counter++;

                            if (date >= startDate) {
                                if ((endDate && date > endDate) || (fn.call(scope, date, counter) === false) || (count && counter >= count)) return false;
                            }
                        }
                    }
                }

            } else {
                for (i = 0; i < months.length; i++) {

                    if ((date = me.buildDate(yearStartDate.getFullYear(), months[i] - 1, eventStart.getDate()))) {
                        date = D.copyTimeValues(date, eventStart);

                        // check if the date wasn't iterated over yet
                        if (!processedDate[date.getTime()]) {
                            processedDate[date.getTime()] = true;

                            if (hasPositions) {
                                dates.push(date);

                            } else if (date >= eventStart) {
                                counter++;

                                if (date >= startDate) {
                                    if ((endDate && date > endDate) || (fn.call(scope, date, counter) === false) || (count && counter >= count)) break top;
                                }
                            }
                        }
                    }
                }
            }

            if (hasPositions && dates.length) {
                me.forEachDateAtPositions(dates, positions, function (date) {
                    if (date >= eventStart) {
                        counter++;
                        // Ignore dates outside of the [startDate, endDate] range
                        if (date >= startDate && (!endDate || date <= endDate)) {
                            // return false if it's time to stop recurring
                            if (fn.call(scope, date, counter) === false || (count && counter >= count)) return false;
                        }
                    }
                });
            }

            // get next month start
            yearStartDate = D.getNext(yearStartDate, D.YEAR, interval);
            yearEndDate   = new Date(D.getNext(yearStartDate, D.YEAR, 1) - 1);
        }

    }
});
