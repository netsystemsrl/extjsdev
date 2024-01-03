/**
 * A segmented button field allowing to pick month days for the "Monthly" mode in the {@link Sch.widget.recurrence.Dialog recurrence dialog}.
 */
Ext.define('Sch.widget.recurrence.field.MonthDaysSegmentedButton', {

    extend       : 'Sch.field.SegmentedButton',

    alias        : 'widget.monthdayssegmentedbutton',

    allowBlank   : false,

    margin       : '0 0 10 0',

    columns      : 7,

    initComponent : function () {
        var me = this;

        me.items = me.buildItems();

        me.callParent(arguments);
    },

    buildItems : function () {
        var items = [],
            i;

        for (i = 1; i <= Ext.Date.MAX_DAYS_IN_MONTH; i++) {
            // button config
            items.push({
                text  : i + '',
                value : i
            });
        }

        return items;
    }

});
