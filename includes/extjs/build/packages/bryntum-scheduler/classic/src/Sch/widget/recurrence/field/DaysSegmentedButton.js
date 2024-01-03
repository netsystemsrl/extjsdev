/**
 * A segmented button field allowing to pick days for the "Weekly" mode in the {@link Sch.widget.recurrence.Dialog recurrence dialog}.
 */
Ext.define('Sch.widget.recurrence.field.DaysSegmentedButton', {

    extend       : 'Sch.field.SegmentedButton',

    alias        : 'widget.dayssegmentedbutton',

    allowBlank   : false,

    margin       : '0 0 10 0',

    weekStartDay : 0,

    initComponent : function () {
        var me = this;

        me.dayNames = Ext.Date.dayNames.slice(me.weekStartDay).concat(Ext.Date.dayNames.slice(0, me.weekStartDay));
        me.items = me.buildItems();

        me.callParent(arguments);
    },

    buildItems : function () {
        var me = this;

        return Ext.Array.map(me.dayNames, function (item, index) {
            var dayIndex = (index + me.weekStartDay) % me.dayNames.length;

            // Ext.button.Button config
            return {
                text  : item.substring(0, 3),
                value : Sch.data.util.recurrence.DayRuleEncoder.encodeDay(dayIndex)
            };
        });
    }

});
