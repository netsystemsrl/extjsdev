/**
 @class Sch.model.Range

 This class represent a simple date range. It is being used in various subclasses and plugins which operate on date ranges.

 Its a subclass of the {@link Sch.model.Customizable}, which is in turn subclass of {@link Ext.data.Model}.
 Please refer to documentation of those classes to become familar with the base interface of this class.

 The name of any field can be customized in the subclass. Please refer to {@link Sch.model.Customizable} for details.
 */
Ext.define('Sch.model.Range', {
    extend         : 'Sch.model.Customizable',

    requires       : [
        'Sch.util.Date',
        'Sch.patches.DateFieldConvertDate'
    ],

    idProperty     : 'Id',

    isRangeModel   : true,

    /**
     * @cfg {String} startDateField The name of the field that defines the range start date. Defaults to "StartDate".
     */
    startDateField : 'StartDate',

    /**
     * @cfg {String} endDateField The name of the field that defines the range end date. Defaults to "EndDate".
     */
    endDateField   : 'EndDate',

    /**
     * @cfg {String} nameField The name of the field that defines the range name. Defaults to "Name".
     */
    nameField      : 'Name',

    /**
     * @cfg {String} clsField The name of the field that holds the range "class" value (usually corresponds to a CSS class). Defaults to "Cls".
     */
    clsField       : 'Cls',

    customizableFields : [
        /**
         * @field Id
         * A unique identifier of the range
         */
        /**
         * @method getStartDate
         *
         * Returns the range start date
         *
         * @return {Date} The start date
         */
        /**
         * @field
         * The start date of the range in the ISO 8601 format. See {@link Ext.Date} for a formats definitions.
         */
        { name : 'StartDate', type : 'date', dateFormat : 'c' },

        /**
         * @method getEndDate
         *
         * Returns the range end date
         *
         * @return {Date} The end date
         */
        /**
         * @field
         * The end date of the range in the ISO 8601 format. See {@link Ext.Date} for a formats definitions.
         */
        { name : 'EndDate', type : 'date', dateFormat : 'c' },

        /**
         * @method getCls
         *
         * Gets the "class" of the range
         *
         * @return {String} cls The "class" of the range
         */
        /**
         * @method setCls
         *
         * Sets the "class" of the range
         *
         * @param {String} cls The new class of the range
         */
        /**
         * @field
         * An optional CSS class to be associated with the range.
         */
        { name : 'Cls', type : 'string' },

        /**
         * @method getName
         *
         * Gets the name of the range
         *
         * @return {String} name The "name" of the range
         */
        /**
         * @method setName
         *
         * Sets the "name" of the range
         *
         * @param {String} name The new name of the range
         */
        /**
         * @field
         * An optional name of the range
         */
        { name : 'Name', type : 'string' }
    ],

    /**
     * @method setStartDate
     *
     * Sets the range start date
     *
     * @param {Date} date The new start date
     * @param {Boolean} keepDuration Pass `true` to keep the duration of the task ("move" the event), `false` to change the duration ("resize" the event).
     * Defaults to `false`
     */
    setStartDate : function (date, keepDuration) {
        var endDate  = this.getEndDate();
        var oldStart = this.getStartDate();

        this.beginEdit();

        this.set(this.startDateField, date);

        if (keepDuration === true && endDate && oldStart) {
            this.setEndDate(Sch.util.Date.add(date, Sch.util.Date.MILLI, endDate - oldStart));
        }

        this.endEdit();
    },

    /**
     * @method setEndDate
     *
     * Sets the range end date
     *
     * @param {Date} date The new end date
     * @param {Boolean} keepDuration Pass `true` to keep the duration of the task ("move" the event), `false` to change the duration ("resize" the event).
     * Defaults to `false`
     */
    setEndDate : function (date, keepDuration) {
        var startDate = this.getStartDate();
        var oldEnd    = this.getEndDate();

        this.beginEdit();

        this.set(this.endDateField, date);

        if (keepDuration === true && startDate && oldEnd) {
            this.setStartDate(Sch.util.Date.add(date, Sch.util.Date.MILLI, -(oldEnd - startDate)));
        }

        this.endEdit();
    },

    /**
     * Sets the event start and end dates
     *
     * @param {Date} start The new start date
     * @param {Date} end The new end date
     */
    setStartEndDate : function (start, end) {
        this.beginEdit();

        this.set(this.startDateField, start);
        this.set(this.endDateField, end);

        this.endEdit();
    },

    /**
     * Returns an array of all dates between start and end for this range.
     * @return {Date[]}
     */
    getDates : function () {
        var dates   = [],
            endDate = this.getEndDate();

        if (this.isScheduled()) {
            var startFloored = Ext.Date.clearTime(this.getStartDate(), true);

            // Zero duration range
            if (endDate - this.getStartDate() === 0) {
                dates.push(startFloored);
            } else {
                for (var date = startFloored; date < endDate; date = Sch.util.Date.add(date, Sch.util.Date.DAY, 1)) {
                    dates.push(date);
                }
            }
        }

        return dates;
    },

    /**
     * Iterates over the results from {@link #getDates}
     * @param {Function} func The function to call for each date
     * @param {Object} scope The scope to use for the function call
     */
    forEachDate : function (func, scope) {
        return Ext.Array.each(this.getDates(), func, scope);
    },

    /**
     * Checks if the range record has both start and end dates set and start <= end
     *
     * @return {Boolean}
     */
    isScheduled : function() {
        var me = this;
        return Boolean(me.getStartDate() && me.getEndDate() && me.areDatesValid());
    },

    // Simple check if end date is greater than start date
    isValid : function () {
        var me = this,
            result = me.callParent(),
            start,
            end;

        if (result) {
            start  = me.getStartDate(),
            end    = me.getEndDate();
            result = !start || !end || (end - start >= 0);
        }

        return result;
    },

    // Simple check if just end date is greater than start date
    areDatesValid : function() {
        var me = this,
            start = me.getStartDate(),
            end   = me.getEndDate();

        return !start || !end || (end - start >= 0);
    },

    /**
     * Shift the dates for the date range by the passed amount and unit
     * @param {String} unit The unit to shift by (e.g. range.shift(Sch.util.Date.DAY, 2); ) to bump the range 2 days forward
     * @param {Number} amount The amount to shift
     */
    shift : function (unit, amount) {
        this.setStartEndDate(
            Sch.util.Date.add(this.getStartDate(), unit, amount),
            Sch.util.Date.add(this.getEndDate(), unit, amount)
        );
    },

    fullCopy : function () {
        return this.copy.apply(this, arguments);
    },

    intersectsRange : function (start, end) {
        var myStart = this.getStartDate();
        var myEnd   = this.getEndDate();

        return myStart && myEnd && Sch.util.Date.intersectSpans(myStart, myEnd, start, end);
    }
});
