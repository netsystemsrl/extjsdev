/**
 * A combobox field displaying the recurrence by either mode: "Daily", "Weekly", "Monthly" or "Yearly" if the recurrence
 * has no other non-default settings, or "Custom..." if the recurrence has custom setting applied.
 */
Ext.define('Sch.widget.recurrence.field.RecurrenceComboBox', {
    extend       : 'Sch.widget.recurrence.field.FrequencyComboBox',

    alias        : 'widget.recurrencecombo',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - 'None'      : 'None',
     * - 'Daily'     : 'Daily',
     * - 'Weekly'    : 'Weekly',
     * - 'Monthly'   : 'Monthly',
     * - 'Yearly'    : 'Yearly',
     * - 'Custom...' : 'Custom...'
     */

    allowBlank   : false,

    emptyText    : 'L{None}',

    customValue  : 'custom',

    splitCls     : 'sch-recurrencecombo-split',

    listConfig   : {
        htmlEncode : true
    },

    buildOptions : function () {
        var me = this,
            options = me.callParent(arguments);

        options.unshift([ null, me.L('None') ]);
        options.push([ me.customValue, me.L('Custom...'), me.splitCls ]);

        return options;
    },

    setRecurrence : function (recurrence) {
        var me = this;

        if (recurrence) {
            me.setValue(me.isCustomRecurrence(recurrence) ? me.customValue : recurrence.getFrequency());
        } else {
            // `null` as a value resets the field to empty value,
            // so need to wrap it in array to select 'None' option
            me.setValue([null]);
        }
    },

    isCustomRecurrence : function (recurrence) {
        var interval  = recurrence.getInterval(),
            days      = recurrence.getDays(),
            monthDays = recurrence.getMonthDays(),
            months    = recurrence.getMonths();

        return Boolean(interval != 1 || (days && days.length) || (monthDays && monthDays.length) || (months && months.length));
    }
});
