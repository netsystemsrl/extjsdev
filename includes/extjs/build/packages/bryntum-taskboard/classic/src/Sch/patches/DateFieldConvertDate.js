// When converting date from ISO string Ext.Date.parse adds extra hour, so use native JS parsing instead
// https://app.assembla.com/spaces/bryntum/tickets/9623
// Test in tests/datalayer/024_event_dst_switch_parse_iso_string.t.js
Ext.define('Sch.patches.DateFieldConvertDate', {
    extend : 'Sch.util.Patch',

    target : 'Ext.data.field.Date',

    minVersion : '7.0.0',
    maxVersion : '8.0.0',

    overrides : {
        // Override private implementation of convert function
        convert: function(v) {
            if (!v) {
                return null;
            }

            // instanceof check ~10 times faster than Ext.isDate. Values here will not be
            // cross-document objects
            if (v instanceof Date) {
                return v;
            }

            /* eslint-disable-next-line vars-on-top */
            var dateFormat = this.dateReadFormat || this.dateFormat,
                parsed;

            if (dateFormat) {
                //region OVERRIDE
                // Use native JS parsing in case of zero UTC string (for example '2021-03-28T01:00:00.000Z')
                // when format is one of the following:
                // - c         ISO 8601 date represented as the local time with an offset to UTC appended.
                // - C         An ISO date string as implemented by the native Date.toISOString method
                if ((dateFormat === 'c' || dateFormat === 'C') && /Z$/.test(v)) {
                    var result = new Date(v);
                    // Check if the result is not an Invalid Date object
                    return !isNaN(result.getTime()) ? result : null;
                }
                //endregion
                return Ext.Date.parse(v, dateFormat, this.useStrict);
            }

            parsed = Date.parse(v);

            return parsed ? new Date(parsed) : null;
        }
    }
});
