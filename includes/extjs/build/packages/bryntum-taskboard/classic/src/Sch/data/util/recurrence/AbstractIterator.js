Ext.define('Sch.data.util.recurrence.AbstractIterator', {

    frequency : 'NONE',

    MAX_OCCURRENCES_COUNT : 1000000,

    /**
     * @private
     * Returns Nth occurrence of a week day in the provided period of time.
     * @param  {Date} startDate Period start date.
     * @param  {Date} endDate   Period end date.
     * @param  {Integer} day    Week day (0 - Sunday, 1 - Monday, 2 - Tuesday, etc.)
     * @param  {Integer} index  Index to find.
     * @return {Date}           Returns the found date or null if there is no `index`th entry.
     */
    getNthDayInPeriod : function (startDate, endDate, day, index) {
        var result, sign, delta, borderDate;

        if (index) {
            var dayDurationInMs  = 86400000,
                weekDurationInMs = 604800000;

            if (index > 0) {
                sign = 1;
                borderDate = startDate;
            } else {
                sign = -1;
                borderDate = endDate;
            }

            // delta between requested day and border day
            delta = day - borderDate.getDay();

            // if the requested day goes after (before, depending on borderDate used (start/end))
            // we adjust index +/-1
            if (sign*delta < 0) index += sign;

            // measure "index" weeks forward (or backward) ..take delta into account
            result = new Date(borderDate.getTime() + (index - sign)*weekDurationInMs + delta*dayDurationInMs);

            // if resulting date is outside of the provided range there is no "index"-th entry
            // of the day
            if (result < startDate || result > endDate) result = null;
        }

        return result;
    },

    buildDate : function (year, month, date) {
        var dt = new Date(year, month, date);

        if (dt.getFullYear() == year && dt.getMonth() == month && dt.getDate() == date) {
            return dt;
        }
    },

    isValidPosition : function (position) {
        return Boolean(position);
    },

    forEachDateAtPositions : function (dates, positions, fn, scope) {
        var datesLength = dates.length,
            processed   = {};

        for (var i = 0; i < positions.length; i++) {

            var index = positions[i];

            if (this.isValidPosition(index)) {
                var date = index > 0 ? dates[index - 1] : dates[datesLength + index];

                if (date && !processed[date.getTime()]) {

                    // remember that we've returned the date
                    processed[date.getTime()] = true;

                    // return false if it's time to stop recurring
                    if (fn.call(scope, date) === false) return false;
                }
            }
        }
    }
});
