/**
 * @class Gnt.model.CalendarDay
 *
 * A model representing a single day in the calendar. Depending from the `Type` field, day may be a concrete day per se (2012/01/01),
 * a certain weekday (all Thursdays), or an override for all certain weekdays in the timeframe
 * (all Fridays between 2012/01/01 - 2012/01/15, inclusive).
 *
 * A collection CalendarDay instances is supposed to be provided for the {@link Gnt.data.Calendar calendar}
 *
 * The name of any field can be customized in the subclass. Please refer to {@link Sch.model.Customizable} for details.
 */
Ext.define('Gnt.model.CalendarDay', {
    extend             : 'Sch.model.CalendarDay',

    customizableFields : [
        /**
         * @field
         * @inheritdoc
         */
        {
            name            : 'Cls',
            defaultValue    : 'gnt-holiday' // For backwards compatibility
        }
    ]
});
