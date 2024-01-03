/**
 * A singleton class allowing to get a human readable description of the provided recurrence.
 *
 * ```javascript
 * var event = new Sch.model.Event({ StartDate : new Date(2018, 6, 3),  EndDate : new Date(2018, 6, 4) });
 * var recurrence = new Sch.model.Recurrence({ Frequency : 'WEEKLY', Days : ['MO', 'TU', 'WE'] });
 * event.setRecurrence(recurrence);
 * // "Weekly on  Mon, Tue and Wed"
 * Sch.data.util.recurrence.Legend.getLegend(recurrence);
 * ```
 */
Ext.define('Sch.data.util.recurrence.Legend', {

    requires            : ['Sch.data.util.recurrence.DayRuleEncoder'],

    mixins              : ['Sch.mixin.Localizable'],

    singleton           : true,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - ', '                            : ', ',
     * - ' and '                         : ' and ',
     * - 'Daily'                         : 'Daily',
     * - 'Weekly on {1}'                 : 'Weekly on {1}',
     * - 'Monthly on {1}'                : 'Monthly on {1}',
     * - 'Yearly on {1} of {2}'          : 'Yearly on {1} of {2}',
     * - 'Every {0} days'                : 'Every {0} days',
     * - 'Every {0} weeks on {1}'        : 'Every {0} weeks on {1}',
     * - 'Every {0} months on {1}'       : 'Every {0} months on {1}',
     * - 'Every {0} years on {1} of {2}' : 'Every {0} years on {1} of {2}',
     * - 'position1'                     : 'the first',
     * - 'position2'                     : 'the second',
     * - 'position3'                     : 'the third',
     * - 'position4'                     : 'the fourth',
     * - 'position5'                     : 'the fifth',
     * - 'position-1'                    : 'the last',
     * - 'day'                           : 'day',
     * - 'weekday'                       : 'weekday',
     * - 'weekend day'                   : 'weekend day',
     * - 'daysFormat'                    : '{0} {1}'
     */

    allDaysValue        : 'SU,MO,TU,WE,TH,FR,SA',
    workingDaysValue    : 'MO,TU,WE,TH,FR',
    nonWorkingDaysValue : 'SU,SA',

    /**
     * Returns the provided recurrence description. The recurrence might be not set to an event,
     * in this case the event start date should be provided in the second argument.
     * @param  {Sch.model.Recurrence} recurrence       Recurrence model.
     * @param  {Date}                 [eventStartDate] The event start date. Can be omitted if the recurrence is set to an event (and the event has {@link #StartDate start date} filled).
     *                                                 Then event start date will be retrieved from the event.
     * @return {String}                                The recurrence description.
     */
    getLegend : function (recurrence, eventStartDate) {
        var me             = this,
            DayRuleEncoder = Sch.data.util.recurrence.DayRuleEncoder,
            sformat        = Ext.String.format,
            event          = recurrence.getEvent(),
            startDate      = eventStartDate || event.getStartDate(),
            interval       = recurrence.getInterval(),
            days           = recurrence.getDays(),
            monthDays      = recurrence.getMonthDays(),
            months         = recurrence.getMonths(),
            positions      = recurrence.getPositions(),
            result         = '',
            when           = '',
            fn;

        switch (recurrence.getFrequency()) {
            case 'DAILY':
                result = interval == 1 ? me.L('Daily') : sformat(me.L('Every {0} days'), interval);
                break;

            case 'WEEKLY':
                if (days && days.length) {
                    when = me.getDaysLegend(days);
                } else if (startDate) {
                    when = Ext.Date.dayNames[ startDate.getDay() ];
                }

                result = sformat(interval == 1 ? me.L('Weekly on {1}') : me.L('Every {0} weeks on {1}'), interval, when);

                break;

            case 'MONTHLY':
                if (days && days.length && positions && positions.length) {
                    when = me.getDaysLegend(days, positions);

                } else if (monthDays && monthDays.length) {
                    // sort dates to output in a proper order
                    monthDays.sort(function (a, b) {
                        return a - b;
                    });

                    when = me.arrayToText(monthDays);

                } else if (startDate) {
                    when = startDate.getDate();
                }

                result = sformat(interval == 1 ? me.L('Monthly on {1}') : me.L('Every {0} months on {1}'), interval, when);

                break;

            case 'YEARLY':

                var hasDaysNPositions = days && days.length && positions && positions.length,
                    hasMonths         = months && months.length,
                    whenMonths, whenDate;

                whenDate = hasDaysNPositions ? me.getDaysLegend(days, positions) : startDate.getDate();

                if (hasMonths) {
                    // sort months to output in a proper order
                    months.sort(function (a, b) {
                        return a - b;
                    });

                    if (months.length > 2) {
                        fn = function (month) {
                            return Ext.Date.getShortMonthName(month - 1);
                        };
                    } else {
                        fn = function (month) {
                            return Ext.Date.monthNames[month - 1];
                        };
                    }

                    whenMonths = me.arrayToText(months, fn);
                } else {
                    whenMonths = Ext.Date.monthNames[startDate.getMonth()];
                }

                result = sformat(interval == 1 ? me.L('Yearly on {1} of {2}') : me.L('Every {0} years on {1} of {2}'), interval, whenDate, whenMonths);

                break;
        }

        return result;
    },

    getDaysLegend : function (days, positions) {
        var me             = this,
            DayRuleEncoder = Sch.data.util.recurrence.DayRuleEncoder,
            positionsText  = '',
            daysText       = '',
            fn;

        if (positions && positions.length) {
            positionsText = me.arrayToText(positions, function (position) {
                // the following lines are added to satisfy the 904_unused localization test
                // to let it know that these locales are used:
                // me.L('position1')
                // me.L('position2')
                // me.L('position3')
                // me.L('position4')
                // me.L('position5')
                // me.L('position-1')
                return me.L('position' + position);
            });
        }

        if (days.length) {
            days.sort(function (a, b) {
                return DayRuleEncoder.decodeDay(a)[0] - DayRuleEncoder.decodeDay(b)[0];
            });

            var daysStringValue = days.join(',');

            switch (daysStringValue) {
                case me.allDaysValue :
                    daysText = me.L('day');
                    break;

                case me.workingDaysValue :
                    daysText = me.L('weekday');
                    break;

                case me.nonWorkingDaysValue :
                    daysText = me.L('weekend day');
                    break;

                default :
                    if (days.length > 2) {
                        fn = function (day) {
                            return Ext.Date.getShortDayName(DayRuleEncoder.decodeDay(day)[0]);
                        };
                    } else {
                        fn = function (day) {
                            return Ext.Date.dayNames[DayRuleEncoder.decodeDay(day)[0]];
                        };
                    }

                    daysText = me.arrayToText(days, fn);
            }
        }

        return Ext.String.format(me.L('daysFormat'), positionsText, daysText);
    },

    // Converts array of items to a human readable list.
    // For example: [1,2,3,4]
    // to: "1, 2, 3 and 4"
    arrayToText : function (array, fn, glue, lastGlue) {
        glue     = glue || this.L(', ');
        lastGlue = lastGlue || this.L(' and ');

        var result = '',
            delim  = '';

        for (var i = 0, l = array.length; i < l;) {
            result += delim + (fn ? fn(array[i]) : array[i]);
            i++;
            delim = (i == l - 1 ? lastGlue : glue);
        }

        return result;
    }

});
