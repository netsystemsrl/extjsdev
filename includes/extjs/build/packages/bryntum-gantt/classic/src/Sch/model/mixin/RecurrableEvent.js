/**
 * This mixin class provides recurring events related fields and methods to the {@link Sch.model.Event event model}.
 *
 * The mixin introduces two types of events: __recurring event__ and its __occurrences__.
 * __Recurring event__ is an event having {@link #RecurrenceRule recurrence rule} specified and its __occurrences__ are "fake" dynamically generated events.
 * The occurrences are not persistable (the mixin overrides {@link Sch.model.Event#isPersistable isPersistable} method to take that into account).
 * Their set depends on the scheduler visible timespan and changes upon the timespan change.
 *
 * There are few methods allowing to distinguish a recurring event and an occurrence: {@link #isRecurring}, {@link #isOccurrence}
 * and {@link #getRecurringEvent} (returns the event this record is an occurrence of).
 *
 * The {@link #RecurrenceRule recurrence rule} defined for the event is parsed and
 * represented with {@link Sch.model.Recurrence} class (can be changed with {@link #recurrenceModel} config) instance.
 * See: {@link #getRecurrence}, {@link #setRecurrence} methods.
 */
Ext.define('Sch.model.mixin.RecurrableEvent', {

    extend            : 'Ext.Mixin',

    requires          : ['Sch.model.Recurrence'],

    /**
     * Indicates the model supports event recurrence.
     * @property {Boolean}
     */
    isRecurrableEvent : true,

    /**
     * @cfg {String}
     * {@link #RecurringEvent} field mapping.
     */
    recurringEventIdField    : 'RecurringEventId',

    /**
     * @cfg {String}
     * {@link #RecurrenceRule} field mapping.
     */
    recurrenceRuleField      : 'RecurrenceRule',

    /**
     * @cfg {String}
     * {@link #ExceptionDates} field mapping.
     */
    exceptionDatesField      : 'ExceptionDates',

    customizableFields : [
        /**
         * @field
         * Identifier of the "main" event this model is an occurrence of.
         * **Applicable to occurrences only.**
         */
        { name : 'RecurringEventId' },
        /**
         * @field
         * The event recurrence rule. A string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format ("RRULE" expression).
         */
        {
            name : 'RecurrenceRule',
            allowNull : true,
            convert : function (value, record) {
                // undefined, null and zero-length string will be converted to null
                if (Ext.isEmpty(value)) {
                    value = null;
                }

                return value;
            }
        },
        /**
         * @field
         * @type {Date[]}
         * The event exception dates. The dates that must be skipped when generating occurrences for a repeating event.
         * This is used to modify only individual occurrences of the event so the further regenerations
         * won't create another copy of this occurrence again.
         * Use {@link #addExceptionDate} method to add an individual entry to the dates array:
         *
         * ```javascript
         * // let the main event know that this date should be skipped when regenerating the occurrences
         * occurrence.getRecurringEvent().addExceptionDate( occurrence.getStartDate() );
         *
         * // cut the main event cord
         * occurrence.setRecurringEventId(null);
         *
         * // now the occurrence is an individual event that can be changed & persisted freely
         * occurrence.setName("I am detached!");
         * occurrence.setStartEndDate(new Date(2018, 6, 2), new Date(2018, 6, 3));
         * ```
         * **Note:** The dates in this field get automatically removed when the event changes its {@link #StartDate start date}.
         */
        {
            name       : 'ExceptionDates',
            dateFormat : 'c',
            convert    : function (value, record) {
                if (value) {
                    var dateFormat = this.dateFormat,
                        useStrict  = this.useStrict;

                    value = Ext.isString(value) ? value.split(',') : value;

                    value = Ext.Array.map(value, function (item) {
                        if (!Ext.isDate(item)) {
                            item = Ext.Date.parse(item, dateFormat, useStrict);
                        }

                        return item;
                    });
                }

                return value;
            }
        }
    ],

    /**
     * Name of the class representing the recurrence model.
     * @cfg {String}
     */
    recurrenceModel : 'Sch.model.Recurrence',

    /**
     * Sets a recurrence for the event with a given frequency, interval, and end.
     * @param {String/Object/Sch.model.Recurrence} frequency The frequency of the recurrence, configuration object or the recurrence model. The frequency can be `DAILY`, `WEEKLY`, `MONTHLY`, or `YEARLY`.
     * ```javascript
     * // let repeat the event every other week till Jan 2 2019
     * event.setRecurrence("WEEKLY", 2, new Date(2019, 0, 2));
     * ```
     * Also a {@link Sch.model.Recurrence recurrence model} can be provided as the only argument for this method:
     *
     * ```javascript
     * var recurrence = new Sch.model.Recurrence({ Frequency : 'DAILY', Interval : 5 });
     *
     * event.setRecurrence(recurrence);
     * ```
     * @param {Integer} [interval] The interval between occurrences (instances of this recurrence). For example, a daily recurrence with an interval of 2 occurs every other day. Must be greater than 0.
     * @param {Integer/Date} [recurrenceEnd] The end of the recurrence. The value can be specified by a date or by a maximum count of occurrences (has to greater than 1, since 1 means the event itself).
     */
    setRecurrence : function (frequency, interval, recurrenceEnd) {
        var me         = this,
            previousRecurrence,
            recurrence,
            value;

        // If this is an occurrence - turn it into an event first
        if (me.isOccurrence()) {
            var recurringEvent = me.getRecurringEvent();
            previousRecurrence = recurringEvent && recurringEvent.getRecurrence();
            me.setRecurringEventId(null);
        }

        // if it's a recurring event we remove its current occurrences
        // me.removeOccurrences();

        if (frequency) {
            // if we set recurrence on an occurrence model
            // we stop previous main recurrence
            previousRecurrence && previousRecurrence.setEndDate(new Date(me.getStartDate() - 1));

            if (frequency.isRecurrenceModel) {
                recurrence = frequency;

            } else if (Ext.isObject(frequency)) {
                recurrence = new this.recurrenceModel(frequency);

            } else {
                recurrence = new this.recurrenceModel();

                recurrence.setFrequency(frequency);
                interval && recurrence.setInterval(interval);

                // if the recurrence is limited
                if (recurrenceEnd) {
                    if (recurrenceEnd instanceof Date) {
                        recurrence.setEndDate(recurrenceEnd);
                    } else {
                        recurrence.setCount(recurrenceEnd);
                    }
                }
            }

            recurrence.setEvent(me);

            value = recurrence.getRule();
        }

        me.recurrence = recurrence;

        me.set(me.recurrenceRuleField, value);
    },

    /**
     * Returns the event recurrence settings.
     * @return {Sch.model.Recurrence} The recurrence model.
     */
    getRecurrence : function () {
        var me             = this,
            recurrenceRule = me.getRecurrenceRule();

        if (!me.recurrence && recurrenceRule) {
            me.recurrence = new me.recurrenceModel({ rule : recurrenceRule, event : me });
        }

        return me.recurrence;
    },

    /**
     * Indicates if the event is recurring.
     * @return {Boolean} `True` if the event is recurring.
     */
    isRecurring : function () {
        return this.getRecurrence() && !this.isOccurrence();
    },

    /**
     * Indicates if the event is an occurrence of another recurring event.
     * @return {Boolean} `True` if the event is an occurrence.
     */
    isOccurrence : function () {
        return Boolean(this.getRecurringEventId());
    },

    /**
     * Returns the "main" event this model is an occurrence of. For non-occurrences returns `null`-value.
     * @return {Sch.model.Event} The recurring event of this occurrence.
     */
    getRecurringEvent : function () {
        var masterEventId = this.getRecurringEventId(),
            eventStore    = this.getEventStore();

        return masterEventId && eventStore && eventStore.getModelById(masterEventId);
    },

    getOccurrenceByStartDate : function (startDate) {
        var result, occurrences;

        if (startDate) {
            occurrences = this.getOccurrences();

            for (var i = 0; i < occurrences.length; i++) {
                if (occurrences[i].getStartDate() - startDate === 0) {
                    result = occurrences[i];
                    break;
                }
            }
        }

        return result;
    },

    /**
     * Returns list of this recurring event occurrences.
     * @return {Sch.model.Event[]} Array of the occurrences.
     */
    getOccurrences : function () {
        var eventStore = this.getEventStore();

        return eventStore && eventStore.getOccurrencesForEvents(this);
    },

    /**
     * Removes this recurring event occurrences.
     */
    removeOccurrences : function () {
        var eventStore = this.getEventStore();

        return eventStore && eventStore.removeOccurrencesForEvents(this);
    },

    /**
     * @private
     * The method is triggered when the event recurrence gets changed.
     * It updates the {@link #RecurrenceRule} field in this case.
     */
    onRecurrenceChanged : function () {
        var recurrence = this.getRecurrence();

        this.setRecurrenceRule(recurrence && recurrence.getRule() || null);
    },

    /**
     * @protected
     * Builds this event occurrence by cloning the event data.
     * The method is used internally by the __recurring events__ feature.
     * Override it if you need to customize the generated occurrences.
     * @param  {Date}    startDate  The occurrence start date.
     * @param  {Integer} [duration] The event duration in milliseconds. The value is used to calculate the occurrence end date.
     *                              If omitted the value will be calculated based on the event start/end dates.
     * @return {Sch.model.Event}    The occurrence.
     */
    buildOccurrence : function (startDate, duration) {
        duration = duration || this.getEndDate() - this.getStartDate();

        var copy = this.copy(null);

        copy.beginEdit();
        copy.setStartEndDate(startDate, new Date(startDate.getTime() + duration));
        copy.setRecurringEventId(this.getId());
        copy.endEdit();

        return copy;
    },

    /**
     * Sets a {@link #RecurrenceRule recurrence rule} for the event.
     * Provide empty value to reset the event recurrence.
     * @param {String/null} rule The event recurrence rule (a string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format ("RRULE" expression))
     *                      or null to reset the event recurrence.
     */
    setRecurrenceRule : function (rule) {
        var me = this,
            recurrence;

        if (rule != me.getRecurrenceRule()) {

            if (rule) {
                recurrence = new me.recurrenceModel({ rule : rule, event : me });
            }

            me.recurrence = recurrence;

            me.set(me.recurrenceRuleField, rule);
        }
    },

    /**
     * Adds an exception date that should be skipped when generating occurrences for the event.
     * The methods adds an entry to the array kept in {@link #ExceptionDates} field.
     * @param {Date} date Exception date.
     */
    addExceptionDate : function (date) {
        var me = this,
            dates = me.getExceptionDates() || [];

        if (date) {
            me.setExceptionDates(dates.concat(date));
        }
    },

    beforeStartDateChange : function () {
        this._startDateValue = this.getStartDate();
    },

    afterStartDateChange : function () {
        if (this._startDateValue - this.getStartDate() && this.getExceptionDates()) this.setExceptionDates();
    },

    mixinConfig: {

        before : {
            setStartDate    : 'beforeStartDateChange',
            setStartEndDate : 'beforeStartDateChange'
        },

        after : {
            setStartDate    : 'afterStartDateChange',
            setStartEndDate : 'afterStartDateChange'
        },

        // This function is called whenever a new "derivedClass" is created
        // that extends a "baseClass" in to which this mixin was mixed.
        extended : function (baseClass, derivedClass, classBody) {
            var recurrenceModel = classBody.recurrenceModel;

            // TODO: check this
            if (typeof recurrenceModel == 'string') {
                Ext.require(recurrenceModel, function () {
                    classBody.recurrenceModel = Ext.data.schema.Schema.lookupEntity(recurrenceModel);

                    Ext.override(derivedClass, {
                        recurrenceModel : Ext.data.schema.Schema.lookupEntity(recurrenceModel)
                    });
                });
            }
        }
    },

    onClassMixedIn : function (targetClass) {
        var recurrenceModel = targetClass.prototype.recurrenceModel || this.prototype.recurrenceModel;

        if (typeof recurrenceModel == 'string') {
            Ext.require(recurrenceModel, function () {
                Ext.override(targetClass, {
                    recurrenceModel : Ext.data.schema.Schema.lookupEntity(recurrenceModel)
                });
            });
        }

        Ext.override(targetClass, {
            // override "isPersistable" method to take into account event type: event/occurrence
            // occurrence are not persistable
            isPersistable : function () {
                var me = this;
                return me.callParent(arguments) && !me.isOccurrence();
            },

            set : function (fieldName, value) {
                // reset cached recurrence link if new recurrence rule is provided to the event
                if (typeof fieldName == 'string' ? fieldName == this.recurrenceRuleField : this.recurrenceRuleField in fieldName) {
                    this.recurrence = null;
                }

                return this.callParent(arguments);
            },

            // merge the mixin and target class "customizableFields" arrays
            customizableFields : (targetClass.prototype.customizableFields || []).concat(this.prototype.customizableFields)
        });
    }
});
