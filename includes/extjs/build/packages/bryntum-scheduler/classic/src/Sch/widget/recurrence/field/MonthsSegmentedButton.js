/**
 * A segmented button field allowing to pick months for the "Yearly" mode in the {@link Sch.widget.recurrence.Dialog recurrence dialog}.
 */
Ext.define('Sch.widget.recurrence.field.MonthsSegmentedButton', {

    extend       : 'Sch.field.SegmentedButton',

    alias        : 'widget.monthssegmentedbutton',

    allowBlank   : false,

    margin       : '0 0 10 0',

    columns      : 4,

    initComponent : function () {
        var me = this;

        me.items = me.buildItems();

        me.callParent(arguments);
    },

    buildItems : function () {
        var me = this;

        return Ext.Array.map(Ext.Date.monthNames, function (item, index) {
            // button config
            return {
                text  : item.substring(0, 3),
                value : index + 1 // 1-based
            };
        });
    }

});
