/**
@class Sch.model.CalendarDay

A model representing a single day in the calendar. Depending from the `Type` field, day may be a concrete day per se (2012/01/01),
a certain weekday (all Thursdays), or an override for all certain weekdays in the timeframe
(all Fridays between 2012/01/01 - 2012/01/15, inclusive).

A collection of CalendarDay instances is supposed to be provided for the {@link Sch.data.Calendar calendar}.

The name of any field can be customized in the subclass. Please refer to {@link Sch.model.Customizable} for details.

*/
Ext.define('Sch.model.CalendarDay', {

    requires           : [ 'Ext.data.Types' ],

    extend             : 'Sch.model.Customizable',
    
    mixins             : ['Sch.mixin.Localizable'],

    idProperty         : 'Id',

    isCalendarDayModel : true,

    customizableFields : [
        /**
         * @field Id
         * The id of the date. Can be an arbitrary unique value, assigned by the server. For backward compatibility, if this field has one of the special formats
         * then some data will be extracted from it. This behavior will be kept for several coming releases, but you should not rely on it anymore.
         */

        /**
         * @method getDate
         *
         * Returns the value of the {@link #Date} field
         *
         * @return {Date} The date of this calendar day
         */
        /**
         * @field
         * The date for this day in the ISO 8601 format. Any time information in this field will be cleared. If this instance
         * represents a weekday or week override, this field will be ignored.
         */
        {
            name        : 'Date',
            type        : 'date',
            dateFormat  : 'c',
            persist     : true,
            convert     : function (value, record) {
                if (!value) return;

                var converted   = Ext.data.Types.DATE.convert.call(this, value);

                if (converted) {
                    Ext.Date.clearTime(converted);
                }

                return converted;
            }
        },
        /**
         * @method getWeekday
         *
         * Returns the value of the {@link #Weekday} field
         *
         * @return {Number} The index of the week day (0 - Sunday, 1 - Monday, etc).
         */
        /**
         * @method setWeekday
         *
         * Sets value of the {@link #Weekday} field
         *
         * @param {Number} weekday The index of the week day (0 - Sunday, 1 - Monday, etc).
         */
        /**
         * @field
         * The index of the week day (0 - Sunday, 1 - Monday and so on) if this instance contains information about the week day (applicable for `WEEKDAY` and `WEEKDAYOVERRIDE`).
         * Should be set to -1 for the "main" instance of the week overrides.
         */
        {
            name            : 'Weekday',
            type            : 'int'
        },
        /**
         * @method getOverrideStartDate
         *
         * Returns the start date of the timespan for the week day override.
         *
         * @return {Date} The start date
         */
        /**
         * @method setOverrideStartDate
         *
         * Sets the start date of the timespan for the week day override
         *
         * @param {Date} startDate The new start date
         */
        /**
         * @field
         * The start date of the timespan for week day override.
         */
        {
            name            : 'OverrideStartDate',
            type            : 'date',
            dateFormat      : 'c'
        },
        /**
         * @method getOverrideEndDate
         *
         * Returns the end date of the timespan for the week day override.
         *
         * @return {Date} The end date
         */
        /**
         * @method setOverrideEndDate
         *
         * Sets the end date of the timespan for the week day override
         *
         * @param {Date} endDate The new end date
         */
        /**
         * @field
         * The end date of the timespan for week day override.
         */
        {
            name            : 'OverrideEndDate',
            type            : 'date',
            dateFormat      : 'c'
        },
        /**
         * @field
         * The type of this calendar day. Can be one of the following `DAY`, `WEEKDAY`, `WEEKDAYOVERRIDE`:
         *
         * - Default value is `DAY` meaning this day represents a "real" day in the calendar (2012/01/01 for example) and contains availability information for that particular day only.
         *  The date is stored in the {@link #Date} field.
         * - The `WEEKDAY` value means calendar day contains information about all weekdays with the index, given in the {@link #Weekday} field (0 - Sunday, 1 - Monday and so on).
         *  For example - all Fridays. {@link #Date} field is ignored.
         * - <p>The `WEEKDAYOVERRIDE` value means calendar day contains information about all weekdays within certain timespan. For example - all Fridays between 2012/01/01 - 2012/01/15.
         *  Week day index should be stored in the {@link #Weekday} field again, beginning of the timespan - in the {@link #OverrideStartDate} field and the end of timespan - in the {@link #OverrideEndDate}.
         *  </p>
         *  <p>
         *  A single day instance contains the override for a single week day. So, to define overrides for several days (Monday and Tuesday for example) - add an additional instance
         *  to the calendar with the same `Name/OverrideStartDate/OverrideEndDate` values. There's no need to define an override for every weekday - if some day is not defined - the
         *  default availability will be used.
         *  </p>
         *  <p>
         *  **Note** Every week override should also have a "main" calendar day instance, representing the override itself. It should have the same
         *  values for `Name/OverrideStartDate/OverrideEndDate` fields and -1 for {@link #Weekday}. Also, the timespans of all week overrides should not intersect.
         *  </p>
         *  <p>
         *  To avoid manual creation of week overrides you can use the calendar API (for example, {@link Sch.data.Calendar#addNonStandardWeek addNonStandardWeek},
         *  {@link Sch.data.Calendar#removeNonStandardWeek removeNonStandardWeek} methods).
         *  </p>
         */
        {
            name            : 'Type',
            defaultValue    : 'DAY' // 'DAY', 'WEEKDAY', 'WEEKDAYOVERRIDE'
        },
        /**
         * @field
         * Optional boolean flag, allowing you to specify exceptions - working days which fall on weekends.
         *
         * **Please note**, that simply setting this field to "true" is not enough - you also need to specify
         * the exact hours that are available for work with the {@link #Availability} field.
         */
        { name: 'IsWorkingDay', type: 'boolean', defaultValue : false },

        /**
         * @method getCls
         *
         * Gets the "class" of the day
         *
         * @return {String} cls The "class" of the day
         */
        /**
         * @method setCls
         *
         * Sets the CSS class of the day, used when visualised in the UI
         *
         * @param {String} cls The new class of the day
         */
        /**
         * @field
         * Optional name of the CSS class, which can be used by various plugins working with weekends and holidays.
         * If a holiday lasts for several days, then all days should have the same `Cls` value.
         */
        {
            name            : 'Cls',
            defaultValue    : 'sch-nonworkingtime'
        },

        /**
         * @method getName
         *
         * Gets the "name" of the day
         *
         * @return {String} name The "name" of the day
         */
        /**
         * @method setName
         *
         * Sets the "name" of the day
         *
         * @param {String} name The new name of the day
         */
        /**
         * @field
         * Optional name of the day (holiday name for example)
         */
        'Name',

        // [ '08:00-12:00', '13:00-17:00' ]
        /**
         * @field
         * Should be an array of strings, containing the hourly availability for this day. Strings should have the following format:
         *
         *      // two working intervals
         *      [ '08:00-12:00', '13:00-17:00' ]
         *
         *      // whole 24 hours are available
         *      [ '00:00-24:00' ]
         *
         * **Please note**, that this field overrides the {@link #IsWorkingDay} - for example, a day with "IsWorkingDay : false" and "Availability : [ '08:00-12:00' ]" - will be considered working.
         */
        {
            name        : 'Availability',
            persist     : true,
            convert     : function (value, record) {
                if (value) {
                    return typeof value === 'string' ? [ value ] : value;
                } else {
                    return [];
                }
            }
        }
    ],

    availabilityCache           : null,

    /**
     * @cfg {String} weekdayField The name of the {@link #Weekday} field.
     */
    weekdayField                : 'Weekday',

    /**
     * @cfg {String} overrideStartDateField The name of the {@link #OverrideStartDate} field.
     */
    overrideStartDateField      : 'OverrideStartDate',

    /**
     * @cfg {String} overrideEndDateField The name of the {@link #OverrideEndDate} field.
     */
    overrideEndDateField        : 'OverrideEndDate',

    /**
     * @cfg {String} typeField The name of the {@link #Type} field.
     */
    typeField                   : 'Type',

    /**
     * @cfg {String} dateField The name of the {@link #Date} field.
     */
    dateField                   : 'Date',

    /**
     * @cfg {String} isWorkingDayField The name of the {@link #IsWorkingDay} field.
     */
    isWorkingDayField           : 'IsWorkingDay',

    /**
     * @cfg {String} clsField The name of the {@link #Cls} field.
     */
    clsField                    : 'Cls',


    /**
     * @cfg {String} nameField The name of the {@link #Name} field.
     */
    nameField                   : 'Name',

    /**
     * @cfg {String} availabilityField The name of the {@link #Availability} field.
     */
    availabilityField           : 'Availability',


    /**
     * Sets the date for this day (will clear the time part)
     * @param {Date} date
     */
    setDate : function (date) {
        if (date) date      = Ext.Date.clearTime(date, true);

        this.set(this.dateField, date);
    },

    /**
     * Clears the date for this day
     * @param {Date} date
     */
    clearDate : function () {
        this.set(this.dateField, null);
    },

    /**
     * This method returns the availability for this day. By default it will decode an array of strings '08:00-12:00' to an
     * array of objects like:
     *
     *      {
     *          startTime       : new Date(2016, 11, 0, 8),
     *          endTime         : new Date(2016, 11, 0, 12)
     *      }
     *
     * You can pass the "asString" flag to disable that and just return strings.
     *
     * @param {Boolean} asString Whether to just return an array of strings, instead of objects.
     * @return {Object[]/String[]} Array of objects with "startTime", "endTime" properties.
     */
    getAvailability : function (asString) {
        var me      = this;

        if (asString) {
            // Return the raw availability array with strings
            return this.get(this.availabilityField);
        }

        if (this.availabilityCache) {
            return this.availabilityCache;
        }

        var parsed  = Ext.Array.map(this.get(this.availabilityField), function (value) {
            return typeof value === 'string' ? me.parseInterval(value) : value;
        });

        this.verifyAvailability(parsed);

        return this.availabilityCache = parsed;
    },


    /**
     * This method updates the availability information for this day. It accept an array of strings: '08:00-12:00', or
     * objects like:
     *
     *      {
     *          startTime       : new Date(0, 0, 0, 8),
     *          endTime         : new Date(0, 0, 0, 12)
     *      }
     *
     * @param {Object[]/String[]} intervals Array of availability intervals
     */
    setAvailability : function (intervals) {
        // clear cache
        this.availabilityCache = null;

        this.set(this.availabilityField, this.stringifyIntervals(intervals));

        // to trigger the `verifyAvailability`
        this.getAvailability();
    },


    verifyAvailability : function (intervals) {
        var me = this;

        intervals.sort(function (a, b) {
            return a.startTime - b.startTime;
        });

        Ext.Array.each(intervals, function (interval, i) {

            if (interval.startTime > interval.endTime) {
                throw new Error(Ext.String.format(me.L('startTimeAfterEndTime'), Ext.Date.format(interval.startTime, 'H:i'), Ext.Date.format(interval.endTime, 'H:i')));
            }

            if (i > 0 && intervals[ i - 1 ].endTime > interval.startTime) {
                throw new Error(Ext.String.format(me.L('availabilityIntervalsShouldNotIntersect'), me.stringifyInterval(intervals[ i - 1 ]), me.stringifyInterval(interval)));
            }
        });
    },


    prependZero : function (value) {
        return value < 10 ? '0' + value : value;
    },


    stringifyInterval : function (interval) {
        var startTime   = interval.startTime;
        var endTime     = interval.endTime;

        return this.prependZero(startTime.getHours()) + ':' + this.prependZero(startTime.getMinutes()) + '-' +
            (endTime.getDate() == 1 ? 24 : this.prependZero(endTime.getHours())) + ':' + this.prependZero(endTime.getMinutes());
    },


    stringifyIntervals : function (intervals) {
        var me                  = this;

        return Ext.Array.map(intervals, function (interval) {
            if (typeof interval === 'string') return interval;

            return me.stringifyInterval(interval);
        });
    },


    parseInterval : function (string) {
        var match   = /(\d\d):(\d\d)-(\d\d):(\d\d)/.exec(string);

        if (!match) throw new Error(Ext.String.format(this.L('invalidFormat'), string));

        return {
            startTime       : new Date(2016, 11, 0, match[ 1 ], match[ 2 ]),
            endTime         : new Date(2016, 11, 0, match[ 3 ], match[ 4 ])
        };
    },


    /**
     * Returns the total length of all availability intervals for this day in hours.
     *
     * @return {Number}
     */
    getTotalHours : function () {
        return this.getTotalMS() / 1000 / 60 / 60;
    },


    /**
     * Returns the total length of all availability intervals for this day in milliseconds.
     *
     * @return {Number}
     */
    getTotalMS : function () {
        var totalMS      = 0;

        Ext.Array.each(this.getAvailability(), function (interval) {
            totalMS      += interval.endTime - interval.startTime;
        });

        return totalMS;
    },

    /**
     * Adds a new availability interval to this day. Both arguments should have the same format.
     *
     * @param {Date/String} startTime Start time of the interval. Can be a Date object (new Date(2016, 11, 0, 8)) or just a plain string: '08'
     * @param {Date/String} endTime End time of the interval. Can be a Date object (new Date(2016, 11, 0, 12)) or just a plain string: '12'
     */
    addAvailabilityInterval : function (startTime, endTime) {
        var interval;

        // User might provide something like: new Date(0, 0, 0, 12, 34)
        // but we need to have exact year & month to be able to compare interval borders
        function prepareDate (date) {
            return new Date(2016, 11, date.getDate() == 1 ? 1 : 0, date.getHours(), date.getMinutes());
        }

        if (startTime instanceof Date) {
            interval        = {
                startTime       : prepareDate(startTime),
                endTime         : prepareDate(endTime)
            };
        } else {
            interval        = this.parseInterval(startTime + (endTime ? '-' + endTime : ''));
        }

        var intervals       = this.getAvailability().concat(interval);

        this.verifyAvailability(intervals);

        this.setAvailability(intervals);
    },


    /**
     * Removes the availability interval by its index.
     *
     * @param {Number} index Ordinal position of the interval to be removed
     */
    removeAvailabilityInterval : function (index) {
        var intervals       = this.getAvailability();

        intervals.splice(index, 1);

        this.setAvailability(intervals);
    },


    /**
     * Applies the availability intervals to a concrete day. For example the availability intervals [ '08:00-12:00', '13:00-17:00' ],
     * applied to a day 2012/01/01 will return the following result:
     *
     *    [
     *        {
     *            startDate       : new Date(2012, 0, 1, 8),
     *            endDate         : new Date(2012, 0, 1, 12)
     *        },
     *        {
     *            startDate       : new Date(2012, 0, 1, 13),
     *            endDate         : new Date(2012, 0, 1, 17)
     *        }
     *    ]
     *
     *
     * @param {Date} date The date to apply the intervals to
     *
     * @returns {Object[]} Array of objects with "startDate / endDate" properties.
     */
    getAvailabilityIntervalsFor : function (timeDate) {
        timeDate                = typeof timeDate == 'number' ? new Date(timeDate) : timeDate;

        var year                = timeDate.getFullYear();
        var month               = timeDate.getMonth();
        var date                = timeDate.getDate();

        return Ext.Array.map(this.getAvailability(), function (interval) {

            var endDate     = interval.endTime.getDate();

            return {
                startDate       : new Date(year, month, date, interval.startTime.getHours(), interval.startTime.getMinutes()),
                endDate         : new Date(year, month, date + (endDate == 1 ? 1 : 0), interval.endTime.getHours(), interval.endTime.getMinutes())
            };
        });
    },


    /**
     * Returns the earliest available time for the given date. If this day has no availability intervals it returns `null`.
     *
     * @param {Date} date The date to get the earliest availability time for.
     *
     * @return {Date}
     */
    getAvailabilityStartFor : function (timeDate) {
        var intervals           = this.getAvailabilityIntervalsFor(timeDate);

        if (!intervals.length) {
            return null;
        }

        return intervals[ 0 ].startDate;
    },


    /**
     * Returns the latest available time for the given date. If this day has no availability intervals, it returns `null`.
     *
     * @param {Date} date The date to get the latest availability time for.
     *
     * @return {Date}
     */
    getAvailabilityEndFor : function (timeDate) {
        var intervals           = this.getAvailabilityIntervalsFor(timeDate);

        if (!intervals.length) {
            return null;
        }

        return intervals[ intervals.length - 1 ].endDate;
    }

});
