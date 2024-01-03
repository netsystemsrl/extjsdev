Ext.define('Sch.data.util.recurrence.MonthlyIterator', {

    extend    : 'Sch.data.util.recurrence.AbstractIterator',

    requires  : [
        'Sch.util.Date',
        'Sch.data.util.recurrence.DayRuleEncoder'
    ],

    singleton : true,

    frequency : 'MONTHLY',

    getNthDayOfMonth : function (date, dayNum) {
        var result      = null,
            daysInMonth = Ext.Date.getDaysInMonth(date);

        if (dayNum && Math.abs(dayNum) <= daysInMonth) {
            result = new Date(date.getFullYear(), date.getMonth(), dayNum < 0 ? daysInMonth + dayNum + 1 : dayNum);
        }

        return result;
    },

    isValidPosition : function (position) {
        return position && Math.abs(position) > 0 && Math.abs(position) <= 31;
    },

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
            monthDays      = config.monthDays || recurrence && recurrence.getMonthDays(),
            count          = config.count || recurrence && recurrence.getCount(),
            positions      = config.positions || recurrence && recurrence.getPositions(),
            hasPositions   = positions && positions.length,
            counter        = 0,
            processedDate  = {},
            weekDayPosition,
            monthStartDate, monthEndDate,
            dates, date, i;

        if (until && endDate && endDate > until) endDate = until;

        // iteration should not start before the event starts
        if (eventStart > startDate) startDate = eventStart;

        // if the recurrence is limited w/ "Count"
        // we need to 1st count passed occurrences so we always start iteration from the event start date
        if (count) {
            monthStartDate = new Date(D.getNext(eventStart, D.MONTH, 0));
        } else {
            monthStartDate = new Date(D.getNext(startDate, D.MONTH, 0));
        }

        monthEndDate   = new Date(D.getNext(monthStartDate, D.MONTH, 1) - 1);

        // if no month days nor week days are provided let's use event start date month day
        if (!(monthDays && monthDays.length) && !(weekDays && weekDays.length)) {
            monthDays = [ eventStart.getDate() ];
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

        while ((!endDate || endDate >= monthStartDate) && (!count || counter < count)) {

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
                        if ((date = me.getNthDayInPeriod(monthStartDate, monthEndDate, weekDay, i))) {
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
                var sortedMonthDates = [];

                for (i = 0; i < monthDays.length; i++) {
                    // check if the date wasn't iterated over yet
                    if ((date = me.getNthDayOfMonth(monthStartDate, monthDays[i])) && !processedDate[date.getTime()]) {
                        processedDate[date.getTime()] = true;
                        sortedMonthDates.push(date);
                    }
                }

                // it's important to sort the dates to iterate over them in the proper order
                sortedMonthDates.sort(function (a, b) { return a - b; });

                for (i = 0; i < sortedMonthDates.length; i++) {
                    date = D.copyTimeValues(sortedMonthDates[i], eventStart);

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
            monthStartDate = D.getNext(monthStartDate, D.MONTH, interval);
            monthEndDate   = new Date(D.getNext(monthStartDate, D.MONTH, 1) - 1);
        }

    }

});
