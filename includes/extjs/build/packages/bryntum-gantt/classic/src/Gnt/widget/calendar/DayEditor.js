Ext.define('Gnt.widget.calendar.DayEditor', {
    extend      : 'Gnt.widget.calendar.AvailabilityGrid',

    requires    : [
        'Ext.grid.plugin.CellEditing',
        'Gnt.data.Calendar',
        'Sch.util.Date'
    ],

    mixins      : ['Gnt.mixin.Localizable'],

    alias       : 'widget.calendardayeditor',

    height      : 160,

    /*
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - startText           : 'Start',
            - endText             : 'End',
            - workingTimeText     : 'Working time',
            - nonworkingTimeText  : 'Non-working time'
     */

    initComponent : function() {

        var isWorkingDay        = this.calendarDay.getIsWorkingDay();

        this.dockedItems = this.dockedItems || [
            {
                xtype       : 'radiogroup',
                dock        : 'top',
                name        : 'dayType',
                padding     : "0 5px",
                margin      : 0,
                items       : [
                    { boxLabel : this.L('workingTimeText'), name: 'IsWorkingDay', inputValue : true, checked : isWorkingDay },
                    { boxLabel : this.L('nonworkingTimeText'), name: 'IsWorkingDay', inputValue : false, checked : !isWorkingDay }
                ],

                listeners   : {
                    change      : this.onDayTypeChanged,
                    scope       : this
                }
            }
        ];

        this.on('afterrender', this.myApplyState, this);

        this.callParent(arguments);
    },


    getDayTypeRadioGroup : function () {
        return this.down('radiogroup[name="dayType"]');
    },


    myApplyState : function () {
        if (!this.isWorkingDay()) {
            this.viewSetDisabled(true);
            this.addButton.disable();
        }
    },

    // we cannot use view.disable() because it blocks also radio buttons to switch working/non working day modes
    // http://www.sencha.com/forum/showthread.php?291799
    viewSetDisabled : function (disabled) {
        if (disabled) {
            this.getView().getEl().mask();
            this.getHeaderContainer().getEl().mask();
        } else {
            this.getView().getEl().unmask();
            this.getHeaderContainer().getEl().unmask();
        }
    },

    onDayTypeChanged : function(sender) {
        var value = sender.getValue();

        if (Ext.isArray(value.IsWorkingDay)) return;

        this.viewSetDisabled(!value.IsWorkingDay);

        this.addButton.setDisabled(!value.IsWorkingDay || this.getStore().getCount() >= this.maxIntervalsNum);
    },


    isWorkingDay : function() {
        return this.getDayTypeRadioGroup().getValue().IsWorkingDay;
    },


    isValid: function () {
        if (this.isWorkingDay()) return this.callParent();

        return true;
    },


    getIntervals : function () {
        if (!this.isWorkingDay()) return [];

        return this.callParent();
    }
});
