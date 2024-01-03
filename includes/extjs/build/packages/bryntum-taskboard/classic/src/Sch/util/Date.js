/**
 * @class Sch.util.Date
 * @static
 * Static utility class for Date manipulation
 */
Ext.define('Sch.util.Date', {
    requires        : 'Ext.Date',
    mixins          : ['Sch.mixin.Localizable'],
    singleton       : true,

    // These stem from Ext.Date in Ext JS but since they don't exist in Sencha Touch we'll need to keep them here
    stripEscapeRe   : /(\\.)/g,
    hourInfoRe      : /([gGhHisucUOPZ]|MS)/,

    unitHash        : null,
    unitsByName     : {},

    // Readonly
    MIN_VALUE       : new Date(-8640000000000000),
    MAX_VALUE       : new Date(8640000000000000),

    // Override this to localize the time unit names.
    //unitNames   : {
        //YEAR    : { single : 'year', plural : 'years', abbrev : 'yr' },
        //QUARTER : { single : 'quarter', plural : 'quarters', abbrev : 'q' },
        //MONTH   : { single : 'month', plural : 'months', abbrev : 'mon' },
        //WEEK    : { single : 'week', plural : 'weeks', abbrev : 'w' },
        //DAY     : { single : 'day', plural : 'days', abbrev : 'd' },
        //HOUR    : { single : 'hour', plural : 'hours', abbrev : 'h' },
        //MINUTE  : { single : 'minute', plural : 'minutes', abbrev : 'min' },
        //SECOND  : { single : 'second', plural : 'seconds', abbrev : 's' },
        //MILLI   : { single : 'ms', plural : 'ms', abbrev : 'ms' }
    //},


    constructor : function () {
        var me = this,
            ED = Ext.Date;

        var unitHash = me.unitHash = {
            /**
             * Date interval constant
             * @static
             * @type String
             */
            MILLI : ED.MILLI,

            /**
             * Date interval constant
             * @static
             * @type String
             */
            SECOND : ED.SECOND,

            /**
             * Date interval constant
             * @static
             * @type String
             */
            MINUTE : ED.MINUTE,

            /** Date interval constant
             * @static
             * @type String
             */
            HOUR : ED.HOUR,

            /**
             * Date interval constant
             * @static
             * @type String
             */
            DAY : ED.DAY,

            /**
             * Date interval constant
             * @static
             * @type String
             */
            WEEK : "w",

            /**
             * Date interval constant
             * @static
             * @type String
             */
            MONTH : ED.MONTH,

            /**
             * Date interval constant
             * @static
             * @type String
             */
            QUARTER : "q",

            /**
             * Date interval constant
             * @static
             * @type String
             */
            YEAR : ED.YEAR
        };

        Ext.apply(me, unitHash);

        me.units = [me.MILLI, me.SECOND, me.MINUTE, me.HOUR, me.DAY, me.WEEK, me.MONTH, me.QUARTER, me.YEAR];
    },


    onLocalized : function () {
        this.setUnitNames(this.L('unitNames'));
    },


    /**
     * Call this method to provide your own, localized values for duration unit names. See the "/js/Sch/locale/sch-lang-*.js" files for examples
     *
     * @param {Object} unitNames
     */
    setUnitNames : function (unitNames) {
        var unitsByName = this.unitsByName = {};

        this.l10n.unitNames = unitNames;

        this._unitNames     = Ext.apply({}, unitNames);

        var unitHash        = this.unitHash;

        // Make it possible to lookup readable date names from both 'DAY' and 'd' etc.
        for (var name in unitHash) {
            if (unitHash.hasOwnProperty(name)) {
                var unitValue = unitHash[name];

                this._unitNames[ unitValue ] = this._unitNames[name];

                unitsByName[ name ] = unitValue;
                unitsByName[ unitValue ] = unitValue;
            }
        }
    },


    /**
     * Checks if this date is >= start and < end.
     * @param {Date} date The source date
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} true if this date falls on the start date or between the given start and end dates.
     * @static
     */
    betweenLesser : function (date, start, end) {
        return start <= date && date < end;
    },

    /**
     * Checks if this date is >= start and <= end.
     * @param {Date} date The source date
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} true if this date falls on or between the given start and end dates.
     * @static
     */
    betweenLesserEqual : function (date, start, end) {
        return start <= date && date <= end;
    },

    /**
     * Constrains the date within a min and a max date
     * @param {Date} date The date to constrain
     * @param {Date} min Min date
     * @param {Date} max Max date
     * @return {Date} The constrained date
     * @static
     */
    constrain : function (date, min, max) {
        return this.min(this.max(date, min), max);
    },

    /**
     * Returns 1 if first param is a greater unit than second param, -1 if the opposite is true or 0 if they're equal
     * @static
     *
     * @param {String} unit1 The 1st unit
     * @param {String} unit2 The 2nd unit
     */
    compareUnits : function (u1, u2) {
        var ind1 = Ext.Array.indexOf(this.units, u1),
            ind2 = Ext.Array.indexOf(this.units, u2);

        return ind1 > ind2 ? 1 : (ind1 < ind2 ? -1 : 0);
    },

    /**
     * Returns true if first unit passed is strictly greater than the second.
     * @static
     *
     * @param {String} unit1 The 1st unit
     * @param {String} unit2 The 2nd unit
     */
    isUnitGreater : function (u1, u2) {
        return this.compareUnits(u1, u2) > 0;
    },

    /**
     * Copies hours, minutes, seconds, milliseconds from one date to another
     * @static
     *
     * @param {Date} targetDate The target date
     * @param {Date} sourceDate The source date
     * @return {Date} The adjusted target date
     */
    copyTimeValues : function (targetDate, sourceDate) {
        targetDate.setHours(sourceDate.getHours());
        targetDate.setMinutes(sourceDate.getMinutes());
        targetDate.setSeconds(sourceDate.getSeconds());
        targetDate.setMilliseconds(sourceDate.getMilliseconds());
        return targetDate;
    },

    /**
     * Adds a date unit and interval
     * @param {Date} date The source date
     * @param {String} unit The date unit to add
     * @param {Number} value The number of units to add to the date
     * @return {Date} The new date
     * @static
     */
    add : function (date, unit, value) {
        var d = Ext.Date.clone(date);
        if (!unit || value === 0) return d;

        switch (unit.toLowerCase()) {
            case this.MILLI:
                d = new Date(date.getTime() + value);
                break;
            case this.SECOND:
                d = new Date(date.getTime() + (value * 1000));
                break;
            case this.MINUTE:
                d = new Date(date.getTime() + (value * 60000));
                break;
            case this.HOUR:
                d = new Date(date.getTime() + (value * 3600000));
                break;
            case this.DAY:
                d.setDate(date.getDate() + value);

                if(d.getHours() === 23 && date.getHours() === 0) {
                    d = Ext.Date.add(d, Ext.Date.HOUR, 1);
                }
                break;
            case this.WEEK:
                d.setDate(date.getDate() + value * 7);
                break;
            case this.MONTH:
                var day = date.getDate();
                if (day > 28) {
                    day = Math.min(day, Ext.Date.getLastDateOfMonth(this.add(Ext.Date.getFirstDateOfMonth(date), this.MONTH, value)).getDate());
                }
                d.setDate(day);
                d.setMonth(d.getMonth() + value);
                break;
            case this.QUARTER:
                d = this.add(date, this.MONTH, value * 3);
                break;
            case this.YEAR:
                d.setFullYear(date.getFullYear() + value);
                break;
        }
        return d;
    },


    getUnitDurationInMs : function (unit) {
        // hopefully there were no DST changes in year 1
        return this.add(new Date(1, 0, 1), unit, 1) - new Date(1, 0, 1);
    },


    getMeasuringUnit : function (unit) {
        if (unit === this.WEEK) {
            return this.DAY;
        }
        return unit;
    },


    /**
     * @method getDurationInUnit
     * Returns a duration of the timeframe in the given unit.
     * @static
     * @param {Date} start The start date of the timeframe
     * @param {Date} end The end date of the timeframe
     * @param {String} unit Duration unit
     * @return {Number} The duration in the units
     */
    /** @ignore */
    getDurationInUnit : function (start, end, unit, doNotRound) {
        var units;

        switch (unit) {
            case this.YEAR:
                units = this.getDurationInYears(start, end);
                break;

            case this.QUARTER:
                units = this.getDurationInMonths(start, end) / 3;
                break;

            case this.MONTH:
                units = this.getDurationInMonths(start, end);
                break;

            case this.WEEK:
                units = this.getDurationInDays(start, end) / 7;
                break;

            case this.DAY:
                units = this.getDurationInDays(start, end);
                break;

            case this.HOUR:
                units = this.getDurationInHours(start, end);
                break;

            case this.MINUTE:
                units = this.getDurationInMinutes(start, end);
                break;

            case this.SECOND:
                units = this.getDurationInSeconds(start, end);
                break;

            case this.MILLI:
                units = this.getDurationInMilliseconds(start, end);
                break;
        }

        return doNotRound ? units : Math.round(units);
    },


    getUnitToBaseUnitRatio : function (baseUnit, unit) {
        if (baseUnit === unit) {
            return 1;
        }

        switch (baseUnit) {
            case this.YEAR:
                switch (unit) {
                    case this.QUARTER:
                        return 1 / 4;

                    case this.MONTH:
                        return 1 / 12;
                }
                break;

            case this.QUARTER:
                switch (unit) {
                    case this.YEAR:
                        return 4;

                    case this.MONTH:
                        return 1 / 3;
                }
                break;

            case this.MONTH:
                switch (unit) {
                    case this.YEAR:
                        return 12;

                    case this.QUARTER:
                        return 3;
                }
                break;

            case this.WEEK:
                switch (unit) {
                    case this.DAY:
                        return 1 / 7;

                    case this.HOUR:
                        return 1 / 168;
                }
                break;

            case this.DAY:
                switch (unit) {
                    case this.WEEK:
                        return 7;

                    case this.HOUR:
                        return 1 / 24;

                    case this.MINUTE:
                        return 1 / 1440;
                }
                break;

            case this.HOUR:
                switch (unit) {
                    case this.DAY:
                        return 24;

                    case this.MINUTE:
                        return 1 / 60;
                }
                break;

            case this.MINUTE:
                switch (unit) {
                    case this.HOUR:
                        return 60;

                    case this.SECOND:
                        return 1 / 60;

                    case this.MILLI:
                        return 1 / 60000;
                }
                break;

            case this.SECOND:
                switch (unit) {
                    case this.MILLI:
                        return 1 / 1000;
                }
                break;


            case this.MILLI:
                switch (unit) {
                    case this.SECOND:
                        return 1000;
                }
                break;

        }

        return -1;
    },

    // Returns true if a unit can be expressed as a whole number of subunits
    isUnitDivisibleIntoSubunit : function (unit, subunit) {
        var indivisible = unit === this.MONTH && subunit === this.WEEK;

        return !indivisible;
    },

    /**
     * Returns the number of milliseconds between the two dates
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} true number of minutes between the two dates
     * @static
     */
    getDurationInMilliseconds : function (start, end) {
        return (end - start);
    },

    /**
     * Returns the number of seconds between the two dates
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} The number of seconds between the two dates
     * @static
     */
    getDurationInSeconds : function (start, end) {
        return (end - start) / 1000;
    },

    /**
     * Returns the number of minutes between the two dates
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} true number of minutes between the two dates
     * @static
     */
    getDurationInMinutes : function (start, end) {
        return (end - start) / 60000;
    },

    /**
     * Returns the number of hours between the two dates.
     *
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} true number of hours between the two dates
     * @static
     */
    getDurationInHours : function (start, end) {
        return (end - start) / 3600000;
    },

    /**
     * This method returns the number of days between the two dates. It assumes a day is 24 hours and tries to take the DST into account.
     *
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} true number of days between the two dates
     *
     * @static
     */
    getDurationInDays : function (start, end) {
        var dstDiff     = start.getTimezoneOffset() - end.getTimezoneOffset();

        return (end - start + dstDiff * 60 * 1000) / 86400000;
    },

    /**
     * Returns the number of whole months between the two dates
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} The number of whole months between the two dates
     * @static
     */
    getDurationInMonths : function (start, end) {
        return ((end.getFullYear() - start.getFullYear()) * 12) + (end.getMonth() - start.getMonth());
    },

    /**
     * Returns the number of years between the two dates
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} The number of whole months between the two dates
     * @static
     */
    getDurationInYears : function (start, end) {
        return this.getDurationInMonths(start, end) / 12;
    },

    /**
     * Returns the lesser of the two dates
     * @param {Date} date1
     * @param {Date} date2
     * @return {Date} Returns the lesser of the two dates
     * @static
     */
    min : function (d1, d2) {
        return (d1 && d1.valueOf() || d1) < (d2 && d2.valueOf() || d2) ? d1 : d2; // valueOf() is better for Chrome optimization
    },

    /**
     * Returns the greater of the two dates
     * @param {Date} date1
     * @param {Date} date2
     * @return {Date} Returns the greater of the two dates
     * @static
     */
    max : function (d1, d2) {
        return (d1 && d1.valueOf() || d1) > (d2 && d2.valueOf() || d2) ? d1 : d2; // valueOf() is better for Chrome optimization
    },

    /**
     * Returns true if dates intersect
     * @param {Date} start1
     * @param {Date} end1
     * @param {Date} start2
     * @param {Date} end2
     * @return {Boolean} Returns true if dates intersect
     * @static
     */
    intersectSpans : function (date1Start, date1End, date2Start, date2End) {
        return this.betweenLesser(date1Start, date2Start, date2End) ||
            this.betweenLesser(date2Start, date1Start, date1End);
    },

    /**
     * Returns a name of the duration unit, matching its property on the Sch.util.Date class.
     * So, for example:
     *
     *      Sch.util.Date.getNameOfUnit(Sch.util.Date.DAY) == 'DAY' // true
     *
     * @static
     * @param {String} unit Duration unit
     * @return {String}
     */
    getNameOfUnit : function (unit) {
        unit = this.getUnitByName(unit);

        switch (unit.toLowerCase()) {
            case this.YEAR      :
                return 'YEAR';
            case this.QUARTER   :
                return 'QUARTER';
            case this.MONTH     :
                return 'MONTH';
            case this.WEEK      :
                return 'WEEK';
            case this.DAY       :
                return 'DAY';
            case this.HOUR      :
                return 'HOUR';
            case this.MINUTE    :
                return 'MINUTE';
            case this.SECOND    :
                return 'SECOND';
            case this.MILLI     :
                return 'MILLI';
        }

        throw "Incorrect UnitName";
    },

    /**
     * Returns a human-readable name of the duration unit. For for example for `Sch.util.Date.DAY` it will return either
     * "day" or "days", depending from the `plural` argument
     * @static
     * @param {String} unit Duration unit
     * @param {Boolean} plural Whether to return a plural name or singular
     * @return {String}
     */
    getReadableNameOfUnit : function (unit, plural) {
        if (!this.isLocaleApplied()) this.applyLocale();
        return this._unitNames[ unit ][ plural ? 'plural' : 'single' ];
    },

    /**
     * Returns an abbreviated form of the name of the duration unit.
     * @static
     * @param {String} unit Duration unit
     * @return {String}
     */
    getShortNameOfUnit : function (unit) {
        if (!this.isLocaleApplied()) this.applyLocale();
        return this._unitNames[ unit ].abbrev;
    },

    getUnitByName : function (name) {
        if (!this.isLocaleApplied()) this.applyLocale();

        if (!this.unitsByName[ name ]) {
            Ext.Error.raise('Unknown unit name: ' + name);
        }

        return this.unitsByName[ name ];
    },


    /**
     * Returns the beginning of the Nth next duration unit, after the provided `date`.
     * For example for the this call:
     *      Sch.util.Date.getNext(new Date('Jul 15, 2011'), Sch.util.Date.MONTH, 1)
     *
     * will return: Aug 1, 2011
     *
     * @static
     * @param {Date} date The date
     * @param {String} unit The duration unit
     * @param {Number} increment How many duration units to skip
     * @param {Number} [weekStartDay] The day index of the 1st day of the week.
     *                Only required when `unit` is `WEEK`. 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on (defaults to 1).
     * @param {Number} [timeZone] Time zone offset in minutes
     * @return {Date} The beginning of the next duration unit interval
     */
    getNext : function (date, unit, increment, weekStartDay, timeZone) {
        var dt          = Ext.Date.clone(date);

        var hasTimeZone  = timeZone != null;
        var isUTC        = timeZone === 0;
        // convert to/from TZ only days and above, or hours for TZ with uneven hours offset
        var correctForTZ = this.compareUnits(this.DAY, unit) <= 0 || (unit === this.HOUR && timeZone % 60 !== 0);

        // UTC timezone has own DST correction
        if (hasTimeZone && !isUTC && correctForTZ) {
            dt = Sch.util.Date.toTimeZone(dt, timeZone);
        }

        weekStartDay    = arguments.length < 4 ? 1 : weekStartDay;
        // support 0 increment
        increment       = increment == null ? 1 : increment;

        switch (unit) {
            case this.MILLI:
                dt = this.add(dt, unit, increment);
                break;

            case this.SECOND:
                dt = this.add(dt, unit, increment);

                if (dt.getMilliseconds() > 0) {
                    dt.setMilliseconds(0);
                }
                break;

            case this.MINUTE:
                dt = this.add(dt, unit, increment);

                if (dt.getSeconds() > 0) {
                    dt.setSeconds(0);
                }
                if (dt.getMilliseconds() > 0) {
                    dt.setMilliseconds(0);
                }
                break;

            case this.HOUR:
                if (isUTC) {
                    dt = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours() + increment));
                }
                else {
                    dt = this.add(dt, unit, increment);

                    // Without these checks Firefox messes up the date and it changes timezone in certain edge cases
                    // See test 021_sch_util_date_dst.t.js
                    if (dt.getMinutes() > 0) {
                        dt.setMinutes(0);
                    }
                    if (dt.getSeconds() > 0) {
                        dt.setSeconds(0);
                    }
                    if (dt.getMilliseconds() > 0) {
                        dt.setMilliseconds(0);
                    }
                }

                break;

            case this.DAY:
                if (isUTC) {
                    // In case of UTC we just want to get start of the next day, or beginning of current day
                    dt = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate() + increment));
                }
                else {
                    // Check if date has 23 hrs and is in Chile timezone
                    var midnightNotInTimeScale = dt.getHours() === 23 && this.add(dt, this.HOUR, 1).getHours() === 1;

                    if (midnightNotInTimeScale) {
                        // Correct the date manually for DST transitions happening at 00:00
                        dt = this.add(dt, this.DAY, 2);
                        this.clearTime(dt);

                        return dt;
                    }

                    this.clearTime(dt);

                    dt = this.add(dt, this.DAY, increment);

                    // Brazil timezone issue #1642, tested in 028_timeaxis_dst.t.js
                    if (dt.getHours() === 1) {
                        this.clearTime(dt);
                    }
                }
                break;

            case this.WEEK:
                var day;

                if (isUTC) {
                    day = dt.getUTCDay();
                    var daysToAdd = weekStartDay - day + 7 * (increment - (weekStartDay <= day ? 0 : 1));

                    dt.setUTCDate(dt.getUTCDate() + daysToAdd);
                    dt = this.clearUTCTime(dt);
                }
                else {
                    this.clearTime(dt);
                    day = dt.getDay();
                    dt = this.add(dt, this.DAY, weekStartDay - day + 7 * (increment - (weekStartDay <= day ? 0 : 1)));

                    // For south american timezones, midnight does not exist on DST transitions, adjust...
                    if (dt.getDay() !== weekStartDay) {
                        dt = this.add(dt, this.HOUR, 1);
                    } else {
                        this.clearTime(dt);
                    }
                }
                break;

            case this.MONTH:
                if (isUTC) {
                    dt = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + increment, 1));
                }
                else {
                    dt = this.add(dt, this.MONTH, increment);
                    dt.setDate(1);
                    this.clearTime(dt);
                }
                break;

            case this.QUARTER:
                if (isUTC) {
                    var toAdd = (increment - 1) * 3 + (3 - dt.getUTCMonth() % 3)
                    dt = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + toAdd, 1));
                }
                else {
                    dt = this.add(dt, this.MONTH, ((increment - 1) * 3) + (3 - (dt.getMonth() % 3)));
                    this.clearTime(dt);
                    dt.setDate(1);
                }
                break;

            case this.YEAR:
                if (isUTC) {
                    dt = new Date(Date.UTC(dt.getUTCFullYear() + increment, 0, 1));
                }
                else {
                    dt = new Date(dt.getFullYear() + increment, 0, 1);
                }
                break;

            default:
                throw new Error('Invalid date unit' + unit);
        }

        if (hasTimeZone && !isUTC && correctForTZ) {
            // do not correct for weeks and above
            if (Sch.util.Date.compareUnits(Sch.util.Date.WEEK, unit) > 0) {
                // if DST occurred between input and output, we need to add correction
                var offset = dt.getTimezoneOffset() - date.getTimezoneOffset();

                if (offset !== 0) {
                    dt = Sch.util.Date.add(dt, this.MINUTE, offset);
                }
            }

            dt = Sch.util.Date.fromTimeZone(dt, timeZone);

            // getNext shouldn't return same date, if it wants to - just call getNext without TZ info
            if (dt - date === 0) {
                dt = this.getNext(date, unit, increment, weekStartDay);
            }
        }

        return dt;
    },


    getNumberOfMsFromTheStartOfDay : function (date) {
        return date - this.clearTime(date, true) || 86400000;
    },


    getNumberOfMsTillTheEndOfDay : function (date) {
        return this.getStartOfNextDay(date, true) - date;
    },


    getStartOfNextDay : function (date, clone, noNeedToClearTime) {
        var nextDay = this.add(noNeedToClearTime ? date : this.clearTime(date, clone), this.DAY, 1);

        // DST case
        if (nextDay.getDate() == date.getDate()) {
            var offsetNextDay   = this.add(this.clearTime(date, clone), this.DAY, 2).getTimezoneOffset();
            var offsetDate      = date.getTimezoneOffset();

            nextDay             = this.add(nextDay, this.MINUTE, offsetDate - offsetNextDay);
        }

        return nextDay;
    },

    getEndOfPreviousDay : function (date, noNeedToClearTime) {
        var dateOnly = noNeedToClearTime ? date : this.clearTime(date, true);

        // dates are different
        if (dateOnly - date) {
            return dateOnly;
        } else {
            return this.add(dateOnly, this.DAY, -1);
        }
    },

    /**
     * Returns true if the first time span completely 'covers' the second time span. E.g.
     *      Sch.util.Date.timeSpanContains(new Date(2010, 1, 2), new Date(2010, 1, 5), new Date(2010, 1, 3), new Date(2010, 1, 4)) ==> true
     *      Sch.util.Date.timeSpanContains(new Date(2010, 1, 2), new Date(2010, 1, 5), new Date(2010, 1, 3), new Date(2010, 1, 6)) ==> false
     * @static
     * @param {Date} spanStart The start date for initial time span
     * @param {Date} spanEnd The end date for initial time span
     * @param {Date} otherSpanStart The start date for the 2nd time span
     * @param {Date} otherSpanEnd The end date for the 2nd time span
     * @return {Boolean}
     */
    timeSpanContains : function (spanStart, spanEnd, otherSpanStart, otherSpanEnd) {
        return (otherSpanStart - spanStart) >= 0 && (spanEnd - otherSpanEnd) >= 0;
    },

    /**
     * Compares two days with given precision, for example if `date1` is Aug 1st, 2014 08:00 AM and `date2`
     * is Aug 1st, 2014 09:00 and `precisionUnit` is {@link Sch.util.Date.DAY} then both dates a considered equal
     * since they point to the same day.
     *
     * @param {Date} date1
     * @param {Date} date2
     * @param {String} [precisionUnit=Sch.util.Date.MILLI]
     * @return {Integer}
     * - -1 if `date1` is lesser than `date2`
     * - +1 if `date1` is greater than `date2`
     * -  0 if `date1` is equal to `date2`
     */
    compareWithPrecision : function(date1, date2, precisionUnit) {
        var D = Sch.util.Date,
            ED = Ext.Date,
            result;

        switch (precisionUnit) {
            case D.DAY:
                date1 = Number(ED.format(date1, 'Ymd'));
                date2 = Number(ED.format(date2, 'Ymd'));
                break;
            case D.WEEK:
                date1 = Number(ED.format(date1, 'YmW'));
                date2 = Number(ED.format(date2, 'YmW'));
                break;
            case D.MONTH:
                date1 = Number(ED.format(date1, 'Ym'));
                date2 = Number(ED.format(date2, 'Ym'));
                break;
            case D.QUARTER:
                date1 = date1.getFullYear() * 4 + Math.floor(date1.getMonth() / 3);
                date2 = date2.getFullYear() * 4 + Math.floor(date2.getMonth() / 3);
                break;
            case D.YEAR:
                date1 = date1.getFullYear();
                date2 = date2.getFullYear();
                break;
            default:
            case D.MILLI:
            case D.SECOND:
            case D.MINUTE:
            case D.HOUR:
                precisionUnit = precisionUnit && this.getUnitDurationInMs(precisionUnit) || 1;
                date1 = Math.floor(date1.valueOf() / precisionUnit);
                date2 = Math.floor(date2.valueOf() / precisionUnit);
                break;
        }

        ((date1 < date2) && (result = -1)) ||
        ((date1 > date2) && (result = +1)) ||
                            (result =  0);

        return result;
    },

    getValueInUnits : function (date, unit) {
        switch (unit) {
            case this.YEAR    : return date.getFullYear();
            case this.QUARTER : return Math.floor(date.getMonth() / 3) + 1;
            case this.MONTH   : return date.getMonth();
            case this.WEEK    : return Ext.Date.getWeekOfYear(date);
            case this.DAY     : return date.getDate();
            case this.HOUR    : return date.getHours();
            case this.MINUTE  : return date.getMinutes();
            case this.SECOND  : return date.getSeconds();
        }
    },

    setValueInUnits : function (date, unit, value) {
        var result = Ext.Date.clone(date),
            f;

        switch (unit) {
            case this.YEAR      : f = 'setFullYear'; break;
            case this.MONTH     : f = 'setMonth'; break;
            case this.DAY       : f = 'setDate'; break;
            case this.HOUR      : f = 'setHours'; break;
            case this.MINUTE    : f = 'setMinutes'; break;
            case this.SECOND    : f = 'setSeconds'; break;
            case this.MILLI     : f = 'setMilliseconds'; break;
        }

        result[f](value);

        return result;
    },

    getSubUnit          : function (unit) {
        switch (unit) {
            case this.YEAR      : return this.MONTH;
            /* falls through */
            case this.MONTH     : return this.DAY;
            /* falls through */
            case this.DAY       : return this.HOUR;
            /* falls through */
            case this.HOUR      : return this.MINUTE;
            /* falls through */
            case this.MINUTE    : return this.SECOND;
            /* falls through */
            case this.SECOND    : return this.MILLI;
            /* falls through */
        }
    },

    setValueInSubUnits  : function (date, unit, value) {
        unit = this.getSubUnit(unit);
        return this.setValueInUnits(date, unit, value);
    },
    /*
     * section for calendar view related functions
     */

    // Copies date parts from source to target
    mergeDates : function (target, source, unit) {
        var copy        = Ext.Date.clone(target);

        switch (unit) {
            case this.YEAR      : copy.setFullYear(source.getFullYear());

            /* falls through */
            case this.MONTH     : copy.setMonth(source.getMonth());

            /* falls through */
            case this.WEEK      :

            /* falls through */
            case this.DAY       :
                // we want to return week start day for this case
                if (unit === this.WEEK) {
                    copy = this.add(copy, this.DAY, source.getDay() - copy.getDay());
                } else {
                    copy.setDate(source.getDate());
                }

            /* falls through */
            case this.HOUR      : copy.setHours(source.getHours());

            /* falls through */
            case this.MINUTE    : copy.setMinutes(source.getMinutes());

            /* falls through */
            case this.SECOND    : copy.setSeconds(source.getSeconds());

            /* falls through */
            case this.MILLI     : copy.setMilliseconds(source.getMilliseconds());
        }

        return copy;
    },

    // splitting specified unit to subunits including start of the next span
    // e.g. week will be split to days, days to hours, etc.
    splitToSubUnits : function (start, unit, increment, weekStartDay) {
        increment       = increment || 1;
        weekStartDay    = arguments.length < 4 ? 1 : weekStartDay;
        switch (unit) {
//            case this.YEAR      : return this.splitYear(start, increment, weekStartDay);
            case this.MONTH     : return this.splitMonth(start, increment, weekStartDay);
            case this.WEEK      : //return this.splitWeek(start, increment, weekStartDay);
            /* falls through */
            case this.DAY       : return this.splitDay(start, increment);
//            case this.HOUR      : return this.splitHour(start, increment);
//            case this.MINUTE    : return this.splitMinute(start, increment);
            default : break;
        }
    },

    splitYear   : function (start, increment) {
        var newStart    = this.clearTime(start, true);
        newStart.setMonth(0);
        newStart.setDate(1);

        var result      = [];

        for (var i = 0; i <= 12; i = i + increment) {
            result.push(this.add(newStart, this.MONTH, i));
        }

        return result;
    },

    splitMonth  : function (start, increment, weekStartDay) {
        var newStart    = this.clearTime(start, true);
        newStart.setDate(1);
        newStart        = this.add(newStart, this.DAY, weekStartDay - newStart.getDay());

        var currentDate = Ext.Date.clone(newStart);
        var monthEnd    = this.add(newStart, this.MONTH, 1);

        var result      = [];

        for (var i = 0; currentDate.getTime() < monthEnd.getTime(); i = i + increment) {
            currentDate = this.add(newStart, this.WEEK, i);
            result.push(currentDate);
        }

        return result;
    },

    splitWeek   : function (start, increment, weekStartDay) {
        var newStart    = this.add(start, this.DAY, weekStartDay - start.getDay());
        newStart        = this.clearTime(newStart);

        var result      = [];

        for (var i = 0; i <= 7; i = i + increment) {
            result.push(this.add(newStart, this.DAY, i));
        }

        return result;
    },

    splitDay    : function (start, increment) {
        var copy    = this.clearTime(start, true);

        var result  = [];

        for (var i = 0; i <= 24; i = i + increment) {
            result.push(this.add(copy, this.HOUR, i));
        }

        return result;
    },

    splitHour   : function (start, increment) {
        var copy = new Date(start.getTime());
        copy.setMinutes(0);
        copy.setSeconds(0);
        copy.setMilliseconds(0);

        var result = [];

        for (var i = 0; i <= 60; i = i + increment) {
            result.push(this.add(copy, this.MINUTE, i));
        }

        return result;
    },

    splitMinute : function (start, increment) {
        var copy    = Ext.Date.clone(start);
        copy.setSeconds(0);
        copy.setMilliseconds(0);

        var result  = [];

        for (var i = 0; i <= 60; i = i + increment) {
            result.push(this.add(copy, this.SECOND, i));
        }

        return result;
    },

    // Need this to prevent some browsers (Safari in Sydney timezone) to not mess up a date
    // See tests marked *dst* and https://www.assembla.com/spaces/bryntum/tickets/1757#/activity/ticket:
    clearTime : function(dt, clone) {
        if (dt.getHours() > 0 || dt.getMinutes() > 0 || dt.getSeconds() > 0) {
            return Ext.Date.clearTime(dt, clone);
        }

        return clone ? Ext.Date.clone(dt) : dt;
    },

    clearUTCTime : function (dt) {
        dt = new Date(dt);

        dt.setUTCHours(0, 0, 0, 0);

        return dt;
    },

    getWeekNumber : function (date) {
        var target = new Date(date.valueOf());

        // ISO week date weeks start on monday
        // so correct the day number
        var dayNr = (date.getDay() + 6) % 7;

        // ISO 8601 states that week 1 is the week
        // with the first thursday of that year.
        // Set the target date to the thursday in the target week
        target.setDate(target.getDate() - dayNr + 3);

        // Store the millisecond value of the target date
        var firstThursday = target.valueOf();

        // Set the target to the first thursday of the year
        // First set the target to january first
        target.setMonth(0, 1);

        // Not a thursday? Correct the date to the next thursday
        if (target.getDay() != 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }

        // The weeknumber is the number of weeks between the
        // first thursday of the year and the thursday in the target week
        return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
    },

    // Returns first day of week (Monday by default)
    getWeekStartDate : function (date, weekStartDay) {
        var midday = this.setDateToMidday(date, true);

        weekStartDay = typeof weekStartDay !== 'number' ? 1 : weekStartDay;

        while (midday.getDay() !== weekStartDay) {
            midday = Sch.util.Date.add(midday, Sch.util.Date.DAY, -1);
        }

        return midday;
    },

    // Returns last day of week (Sunday by default)
    getWeekEndDate : function (date, weekEndDay) {
        var midday = this.setDateToMidday(date, true);

        weekEndDay = typeof weekEndDay !== 'number' ? 0 : weekEndDay;

        while (midday.getDay() !== weekEndDay) {
            midday = Sch.util.Date.add(midday, Sch.util.Date.DAY, 1);
        }

        return midday;
    },

    setDateToHours : function (date, clone, hours) {
        if (clone) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours);
        }

        date.setHours(hours);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        return date;

    },

    setDateToMidnight : function (date, clone) {
        return this.setDateToHours(date, clone, 0);
    },

    setDateToMidday : function (date, clone) {
        return this.setDateToHours(date, clone, 12);
    },

    isLaterDate : function (date, compareDate) {
        return !this.isSameDate(date, compareDate) && date > compareDate;
    },

    isSameDate : function (date, compareDate) {
        return date.getFullYear() === compareDate.getFullYear() &&
            date.getMonth() === compareDate.getMonth() &&
            date.getDate() === compareDate.getDate();
    },

    isEarlierDate : function (date, compareDate) {
        return !this.isSameDate(date, compareDate) && date < compareDate;
    },

    /**
     * Adjusts the time of the specified date to match the specified time zone. i.e. "what time is it now in this timezone?"
     *
     * JavaScript dates are always in the local time zone. This function adjusts the time to match the time in the
     * specified time zone, without altering the time zone. Thus it wont hold the same time as the original date.
     *
     * ```javascript
     * const localDate = new Date(2020, 7, 31, 7); // UTC+2
     * const utcDate   = Sch.util.Date.toTimeZone(localDate, 0); // 2020, 7, 31, 5 (still UTC+2, but appear as UTC+0)
     * ```
     * @static
     * @param {Date} date
     * @param {Number} timeZone
     * @returns {Date}
     */
    toTimeZone : function (date, timeZone) {
        var offset = date.getTimezoneOffset() + timeZone;

        var result = this.add(date, this.MINUTE, offset);

        // If date is the different time zone, add tz offset difference to it
        return this.add(result, this.MINUTE, result.getTimezoneOffset() - date.getTimezoneOffset());
    },

    /**
     * Adjusts the time of the specified date to match same local time in the specified time zone. i.e. "what time in my
     * timezone would match time in this timezone?"
     *
     * ```javascript
     * const localDate = new Date(2020, 7, 31, 7); // UTC+2
     * const utcDate   = Sch.util.Date.fromTimeZone(localDate, 0); // 2020, 7, 31, 9 (matches 2020-08-31 07:00+00:00)
     * ```
     * @static
     * @param {Date} date
     * @param {Number} timeZone
     * @returns {Date}
     */
    fromTimeZone : function (date, timeZone) {
        var offset = -date.getTimezoneOffset() - timeZone;

        return this.add(date, this.MINUTE, offset);
    },

    // returns date with time part matching UTC time
    getUTCTime : function (date) {
        // Pick any date in the mid of summer to not suffer from DST switch
        return new Date(2020, 6, 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
    },

    // returns date without time, date is matching date in UTC
    getUTCDate : function (date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    },

    // Useful handle to format date in UTC without DST and in regular timezones. Real date in -> time zone formatted date out
    format : function (date, format, timeZone) {
        if (timeZone === 0) {
            // For UTC timezone to get rid of DST switch dates we need to remove hour information from the format string
            // and use specially crafted date to render hour info in UTC.
            // aAgGhH should be our only point of interest
            // hours
            format = format.replace('a', '%10');
            format = format.replace('A', '%11');
            format = format.replace('g', '%12');
            format = format.replace('G', '%13');
            format = format.replace('h', '%14');
            format = format.replace('H', '%15');
            // tz
            format = format.replace('O', '%16');
            format = format.replace('P', '%17');
            format = format.replace('Z', '%18');
            // iso
            format = format.replace('c', '%19');

            // days
            format = format.replace('d', '%20');
            format = format.replace('D', '%21');
            format = format.replace('j', '%22');
            format = format.replace('l', '%23');
            format = format.replace('N', '%24');
            format = format.replace('w', '%25');
            format = format.replace('z', '%26');

            // month
            format = format.replace('F', '%27');
            format = format.replace('m', '%28');
            format = format.replace('M', '%29');
            format = format.replace('n', '%30');

            // year
            format = format.replace('Y', '%31');
            format = format.replace('y', '%32');

            var result = Ext.Date.format(date, format);

            var noDSTDate = this.getUTCTime(date);
            var noDSTHours = this.getUTCDate(date);

            result = result.replace('%10', Ext.Date.format(noDSTDate, 'a'));
            result = result.replace('%11', Ext.Date.format(noDSTDate, 'A'));
            result = result.replace('%12', Ext.Date.format(noDSTDate, 'g'));
            result = result.replace('%13', Ext.Date.format(noDSTDate, 'G'));
            result = result.replace('%14', Ext.Date.format(noDSTDate, 'h'));
            result = result.replace('%15', Ext.Date.format(noDSTDate, 'H'));
            result = result.replace('%16', '+0000');
            result = result.replace('%17', '+00:00');
            result = result.replace('%18', '0');
            result = result.replace('%19', Ext.Date.format(noDSTHours, 'Y-m-d') + 'T' + Ext.Date.format(noDSTDate, 'H:i:s+00:00'));
            result = result.replace('%20', Ext.Date.format(noDSTHours, 'd'));
            result = result.replace('%21', Ext.Date.format(noDSTHours, 'D'));
            result = result.replace('%22', Ext.Date.format(noDSTHours, 'j'));
            result = result.replace('%23', Ext.Date.format(noDSTHours, 'l'));
            result = result.replace('%24', Ext.Date.format(noDSTHours, 'N'));
            result = result.replace('%25', Ext.Date.format(noDSTHours, 'w'));
            result = result.replace('%26', Ext.Date.format(noDSTHours, 'z'));
            result = result.replace('%27', Ext.Date.format(noDSTHours, 'F'));
            result = result.replace('%28', Ext.Date.format(noDSTHours, 'm'));
            result = result.replace('%29', Ext.Date.format(noDSTHours, 'M'));
            result = result.replace('%30', Ext.Date.format(noDSTHours, 'n'));
            result = result.replace('%31', Ext.Date.format(noDSTHours, 'Y'));
            result = result.replace('%32', Ext.Date.format(noDSTHours, 'y'));

            return result;
        }
        else {
            date = this.toTimeZone(date, timeZone);

            return Ext.Date.format(date, format);
        }
    }
});
