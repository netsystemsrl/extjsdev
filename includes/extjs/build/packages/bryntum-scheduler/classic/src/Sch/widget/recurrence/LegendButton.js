/**
 * Class implementing a button which text displays the associated recurrence info in a human readable form.
 */
Ext.define('Sch.widget.recurrence.LegendButton', {

    extend     : 'Ext.button.Button',

    requires   : ['Sch.data.util.recurrence.Legend'],

    alias      : 'widget.recurrencelegendbutton',

    recurrence : null,

    eventStartDate : null,

    initComponent : function () {
        this.callParent(arguments);
        this.setRecurrence(this.recurrence);
    },

    /**
     * Sets the recurrence to display description for.
     * @param {Sch.model.Recurrence} recurrence Recurrence model.
     */
    setRecurrence : function (recurrence) {
        this.recurrence = recurrence;
        this.refreshLegend();
    },

    setEventStartDate : function (eventStartDate) {
        this.eventStartDate = eventStartDate;
        this.refreshLegend();
    },

    refreshLegend : function () {
        var me = this,
            recurrence = me.recurrence;

        me.setText(recurrence ? Sch.data.util.recurrence.Legend.getLegend(recurrence, me.eventStartDate) : '');
    }
});
