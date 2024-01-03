/**
 * This class represents an event recurrence settings.
 */
Ext.define('Sch.model.Recurrence', {

    extend             : 'Sch.model.Customizable',

    idProperty         : 'Id',

    isRecurrenceModel  : true,

    customizableFields : [
        /**
         * @field Id
         * Unique identifier of the recurrence.
         */
        /**
         * @field
         * Field defines the recurrence frequency. Supported values are: "DAILY", "WEEKLY", "MONTHLY", "YEARLY".
         */
        { name : 'Frequency', defaultValue : "DAILY" },
        /**
         * @field
         * Field defines how often the recurrence repeats.
         * For example, if the recurrence is weekly its interval is 2, then the event repeats every two weeks.
         */
        { name : 'Interval', type : 'int', defaultValue : 1 },
        /**
         * @field
         * End date of the recurrence in ISO 8601 format (see {@link Ext.Date} available formats). Specifies when the recurrence ends.
         * The value is optional, the recurrence can as well be stopped using {@link #Count} field value.
         */
        { name : 'EndDate', type : 'date' },
        /**
         * @field
         * Specifies the number of occurrences after which the recurrence ends.
         * The value includes the associated event itself so values less than 2 make no sense.
         * The field is optional, the recurrence as well can be stopped using {@link #EndDate} field value.
         */
        { name : 'Count', type : 'int', allowNull : true },
        /**
         * @field
         * @type {String[]}
         * Specifies days of the week on which the event should occur.
         * An array of string values "SU", "MO", "TU", "WE", "TH", "FR", "SA"
         * corresponding to Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, and Saturday days of the week.
         * Each value can also be preceded by a positive (+n) or negative (-n) integer.
         * If present, this indicates the nth occurrence of a specific day within the monthly or yearly recurrence.
         *
         * **Not applicable** for daily {@link #Frequency frequency}.
         */
        {
            name    : 'Days',
            convert : function (value, record) {
                if (value) {
                    if (Ext.isString(value)) {
                        value = value.split(',');
                    }
                } else {
                    value = null;
                }

                return value;
            },
            isEqual : function (value1, value2) {
                return String(value1) === String(value2);
            }
        },
        /**
         * @field
         * @type {Integer[]}
         * Specifies days of the month on which the event should occur.
         * An array of integer values (-31..-1 - +1..+31, negative values mean counting backwards from the month end).
         * **Applicable only** for monthly {@link #Frequency frequency}.
         */
        {
            name    : 'MonthDays',
            convert : function (value, record) {
                if (value) {
                    if (Ext.isString(value)) {
                        value = Ext.Array.map(value.split(','), function (item) { return parseInt(item, 10); });
                    }
                } else {
                    value = null;
                }

                return value;
            },
            isEqual : function (value1, value2) {
                return String(value1) === String(value2);
            }
        },
        /**
         * @field
         * @type {Integer[]}
         * Specifies months of the year on which the event should occur.
         * An array of integer values (1 - 12).
         * **Applicable only** for yearly {@link #Frequency frequency}.
         */
        {
            name    : 'Months',
            convert : function (value, record) {
                if (value) {
                    if (Ext.isString(value)) {
                        value = Ext.Array.map(value.split(','), function (item) { return parseInt(item, 10); });
                    }
                } else {
                    value = null;
                }

                return value;
            },
            isEqual : function (value1, value2) {
                return String(value1) === String(value2);
            }
        },
        /**
         * @field
         * @type {Integer}
         * The positions to include in the recurrence. The values operate on a set of recurrence instances **in one interval** of the recurrence rule.
         * An array of integer values (valid values are 1 to 366 or -366 to -1, negative values mean counting backwards from the end of the built list of occurrences).
         * **Not applicable** for daily {@link #Frequency frequency}.
         */
        {
            name    : 'Positions',
            convert : function (value, record) {
                if (value) {
                    if (Ext.isString(value)) {
                        value = Ext.Array.map(value.split(','), function (item) { return parseInt(item, 10); });
                    }
                } else {
                    value = null;
                }

                return value;
            },
            isEqual : function (value1, value2) {
                return String(value1) === String(value2);
            }
        }
    ],

    /**
     * @cfg {String} frequencyField The name of the {@link #Frequency} field.
     */
    frequencyField      : 'Frequency',

    /**
     * @cfg {String} intervalField The name of the {@link #Interval} field.
     */
    intervalField       : 'Interval',

    /**
     * @cfg {String} endDateField The name of the {@link #EndDate} field.
     */
    endDateField        : 'EndDate',

    /**
     * @cfg {String} countField The name of the {@link #Count} field.
     */
    countField          : 'Count',

    /**
     * @cfg {String} daysField The name of the {@link #Weekdays} field.
     */
    daysField           : 'Days',

    /**
     * @cfg {String} monthDaysField The name of the {@link #MonthDays} field.
     */
    monthDaysField      : 'MonthDays',

    /**
     * @cfg {String} monthsField The name of the {@link #Months Months} field.
     */
    monthsField         : 'Months',

    /**
     * @cfg {String} positionsField The name of the {@link #Positions} field.
     */
    positionsField      : 'Positions',

    inheritableStatics  : {
        /**
         * @static
         * Constant for daily {@link #Frequency frequency}.
         */
        DAILY   : "DAILY",
        /**
         * @static
         * Constant for weekly {@link #Frequency frequency}.
         */
        WEEKLY  : "WEEKLY",
        /**
         * @static
         * Constant for monthly {@link #Frequency frequency}.
         */
        MONTHLY : "MONTHLY",
        /**
         * @static
         * Constant for yearly {@link #Frequency frequency}.
         */
        YEARLY  : "YEARLY"
    },

    dateFormat : 'Ymd\\THis\\Z',

    /**
     * @cfg {Sch.model.Event}
     * The event this recurrence is associated with.
     */
    event : null,

    /**
     * @cfg {String}
     * The recurrence rule. A string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format ("RRULE" expression).
     */
    rule  : null,

    suspendedEventNotifying : 0,

    constructor : function (cfg) {
        cfg = cfg || {};

        var rule, event;

        if (cfg.event) {
            event = cfg.event;
            delete cfg.event;
        }

        if (cfg.rule) {
            rule = cfg.rule;
            delete cfg.rule;
        }

        this.callParent(arguments);

        this.suspendEventNotifying();

        if (rule) {
            this.setRule(rule);
        }

        this.resumeEventNotifying();

        this.event = event;
    },

    sanitize : function () {
        var me             = this,
            frequency      = me.getFrequency(),
            event          = me.getEvent(),
            eventStartDate = event && event.getStartDate();

        me.sanitizing = true;

        switch (frequency) {
            case 'DAILY' :
                me.setPositions(null);
                me.setDays(null);
                me.setMonthDays(null);
                me.setMonths(null);
                break;

            case 'WEEKLY' :
                me.setPositions(null);
                me.setMonthDays(null);
                me.setMonths(null);

                var days      = me.getDays(),
                    encodeDay = Sch.data.util.recurrence.DayRuleEncoder.encodeDay;

                if (eventStartDate && days && days.length == 1 && days[0] == encodeDay(eventStartDate.getDay())) {
                    me.setDays(null);
                }
                break;

            case 'MONTHLY' :
                if (me.getMonthDays() && me.getMonthDays().length) {
                    me.setPositions(null);
                    me.setDays(null);
                }

                me.setMonths(null);

                var monthDays = me.getMonthDays();

                if (eventStartDate && monthDays && monthDays.length == 1 && monthDays[0] == eventStartDate.getDate()) {
                    me.setMonthDays(null);
                }
                break;

            case 'YEARLY' :
                me.setMonthDays(null);

                var months = me.getMonths();

                if (eventStartDate && months && months.length == 1 && months[0] == eventStartDate.getMonth() + 1) {
                    me.setMonths(null);
                }
                break;
        }

        me.sanitizing = false;
    },

    copy : function () {
        var result = this.callParent(arguments);

        result.dateFormat = this.dateFormat;
        result.event = this.event;

        return result;
    },

    set : function (field, value) {
        this.callParent(arguments);

        // TODO: handle beginEdit/endEdit to call this block only once
        if (!this.sanitizing) {
            // cleanup data to match the chosen frequency
            this.sanitize();
        }

        var event = this.getEvent();

        if (event && !this.suspendedEventNotifying) {
            event.onRecurrenceChanged();
        }
    },

    suspendEventNotifying : function () {
        this.suspendedEventNotifying++;
    },

    resumeEventNotifying : function () {
        if (this.suspendedEventNotifying) this.suspendedEventNotifying--;
    },

    /**
     * Returns the event associated with this recurrence.
     * @return {Sch.model.Event} Event instance.
     */
    getEvent : function () {
        return this.event;
    },

    /**
     * Sets the event associated with this recurrence.
     * @param {Sch.model.Event} Event instance.
     */
    setEvent : function (event) {
        return this.event = event;
    },

    /**
     * Returns the recurrence rule - a string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format ("RRULE" expression).
     * @return {String} The recurrence rule.
     */
    getRule : function () {
        var me     = this,
            result = [];

        if (me.getFrequency()) {
            result.push('FREQ='+ me.getFrequency());

            if (me.getInterval() > 1) {
                result.push('INTERVAL='+ me.getInterval());
            }
            if (me.getDays() && me.getDays().length) {
                result.push('BYDAY='+ me.getDays().join(','));
            }
            if (me.getMonthDays() && me.getMonthDays().length) {
                result.push('BYMONTHDAY='+ me.getMonthDays().join(','));
            }
            if (me.getMonths() && me.getMonths().length) {
                result.push('BYMONTH='+ me.getMonths().join(','));
            }
            if (me.getCount()) {
                result.push('COUNT='+ me.getCount());
            }
            if (me.getEndDate()) {
                result.push('UNTIL='+ Ext.Date.format(me.getEndDate(), me.dateFormat));
            }
            if (me.getPositions() && me.getPositions().length) {
                result.push('BYSETPOS='+ me.getPositions().join(','));
            }
        }

        return result.join(';');
    },

    /**
     * Sets the recurrence rule - a string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format ("RRULE" expression).
     * @param {String} The recurrence rule.
     */
    setRule : function (rule) {
        var me = this;

        if (rule) {
            me.beginEdit();

            var parts = rule.split(';');

            for (var i = 0, len = parts.length; i < len; i++) {
                var part = parts[i].split('='),
                    value = part[1];

                switch (part[0]) {
                    case 'FREQ':
                        me.setFrequency(value);
                        break;
                    case 'INTERVAL':
                        me.setInterval(value);
                        break;
                    case 'COUNT':
                        me.setCount(value);
                        break;
                    case 'UNTIL':
                        me.setEndDate(Ext.Date.parse(value, me.dateFormat));
                        break;
                    case 'BYDAY':
                        me.setDays(value);
                        break;
                    case 'BYMONTHDAY':
                        me.setMonthDays(value);
                        break;
                    case 'BYMONTH':
                        me.setMonths(value);
                        break;
                    case 'BYSETPOS':
                        me.setPositions(value);
                        break;
                }
            }

            me.endEdit();
        }
    }

});
