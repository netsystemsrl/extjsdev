/**
 * Contains legacy methods implementing backward compatible
 * date adjustments when end date is displayed a day earlier than it's stored in the data model (see {@link #getDisplayEndDate}, {@link #getDisplayStartDate} methods for details).
 *
 * See also {@link Gnt.panel.Gantt#disableDateAdjustments disableDateAdjustments} config for enabling the adjustments.
 */
Ext.define('Gnt.model.task.DateAdjustment', {

    requires : [
        'Ext.util.Format',
        'Ext.Date',
        'Sch.util.Date'
    ],

    /**
     * Returns the formatted start date value to be used in the UI.
     * May adjust milestones to show them one day earlier than the actual raw date.
     * Start date of regular tasks stays untouchable.
     *
     * **Note:** Will not be invoked by fields, editors, columns and tooltips if {@link Gnt.panel.Gantt#disableDateAdjustments} is `true`.
     *
     * @param {String} format Date format.
     * @param {Boolean} [adjustMilestones=true] If true, milestones will display one day earlier than the actual raw date.
     * @param {Date} [value=this.getStartDate()] Start date value. If not specified, the Task start date will be used.
     * @return {String} Formatted start date value.
     */
    getDisplayStartDate : function (format, adjustMilestones, value, returnDate, isBaseline) {
        format = format || Ext.Date.defaultFormat;

        // if no value specified then we'll take task start date
        if (arguments.length < 3) {
            value       = this.getStartDate();
            // by default we consider adjustMilestones enabled
            if (arguments.length < 2) adjustMilestones = true;
        }

        if (value && adjustMilestones && this.isMilestone(isBaseline) && value - Ext.Date.clearTime(value, true) === 0 && !Ext.Date.formatContainsHourInfo(format)) {
            value       = Sch.util.Date.add(value, Sch.util.Date.MILLI, -1);
        }

        return returnDate ? value : (value ? Ext.util.Format.date(value, format) : '');
    },

    /**
     * Returns the formatted end date value to be used in the UI.
     * May adjust milestones to show them one day earlier than the actual raw date,
     * or adjust regular tasks end date to show them finish one day earlier than the actual raw date.
     *
     * **Note** that end date of all tasks in the Gantt chart is not inclusive, however this method may compensate the value.
     * For example, if you have a 1 day task which starts at **2018-07-20 00:00:00** and ends at **2018-07-21 00:00:00**
     * (remember the end date is not inclusive), this method will return **2018-07-20** if called with 'Y-m-d'.
     *
     * ```javascript
     *     var task = new Gnt.model.Task({
     *         StartDate : new Date(2018, 6, 20),
     *         EndDate   : new Date(2018, 6, 21)
     *     });
     *
     *     // the code below displays "2018/07/20"
     *     alert(task.getDisplayEndDate('Y/m/d'));
     * ```
     *
     * @param {String} format=Ext.Date.defaultFormat Date format.
     * @param {Boolean} [adjustMilestones=true] If true, milestones will display one day earlier than the actual raw date.
     * @param {Date} [value=this.getEndDate()] End date value. If not specified, the Task end date will be used.
     * @return {String} The formatted end date value.
     */
    getDisplayEndDate : function (format, adjustMilestones, value, returnDate, isBaseline) {
        format = format || Ext.Date.defaultFormat;

        if (arguments.length < 3) {
            value       = this.getEndDate();
            if (arguments.length < 2) adjustMilestones = true;
        }

        // If "value" has not time part (a midnight) and format specified to not show time info
        // we show the date 1 day earlier
        // (if it's a milestone we do it only when "adjustMilestones" is `true`)
        if (value && (!this.isMilestone(isBaseline) || adjustMilestones) && value - Ext.Date.clearTime(value, true) === 0 && !Ext.Date.formatContainsHourInfo(format)) {
            value       = Sch.util.Date.add(value, Sch.util.Date.MILLI, -1);
        }

        return returnDate ? value : (value ? Ext.util.Format.date(value, format) : '');
    }
});
