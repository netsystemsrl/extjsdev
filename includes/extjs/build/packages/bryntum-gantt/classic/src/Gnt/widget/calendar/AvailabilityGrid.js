Ext.define('Gnt.widget.calendar.AvailabilityGrid', {
    extend              : 'Ext.grid.Panel',

    requires            : [
        'Ext.Button',
        'Ext.data.Store',
        'Ext.grid.column.Date',
        'Ext.grid.plugin.CellEditing',
        'Ext.window.MessageBox'
    ],

    mixins              : ['Gnt.mixin.Localizable'],

    alias               : 'widget.calendaravailabilitygrid',

    // input
    calendarDay         : null,

    minHeight : 160,

    addButton           : null,
    removeButton        : null,

    maxIntervalsNum     : 5,

    /*
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - startText         : 'Start',
            - endText           : 'End',
            - addText           : 'Add',
            - removeText        : 'Remove',
            - error             : 'Error'
     */

    initComponent : function() {
        // in ext 5 tbar is null, so apply/applyif wouldn't work
        if (!this.tbar) {
            this.tbar = this.buildToolbar();
        }

        Ext.applyIf(this, {
            store       : new Ext.data.Store({
                fields      : [ 'startTime', 'endTime' ],
                autoDestroy : true,

                data        : this.calendarDay.getAvailability()
            }),

            plugins     : [ new Ext.grid.plugin.CellEditing({ clicksToEdit: 2 }) ],

            columns     : [
                {
                    xtype       : 'datecolumn',
                    header      : this.L('startText'),

                    format      : 'g:i a',
                    dataIndex   : 'startTime',
                    flex        : 1,
                    editor      : { xtype: 'timefield', allowBlank: false, initDate: '31/12/1899' }
                },
                {
                    xtype       : 'datecolumn',
                    header      : this.L('endText'),

                    format      : 'g:i a',
                    dataIndex   : 'endTime',
                    flex        : 1,
                    editor      : { xtype: 'timefield', allowBlank: false, initDate: '31/12/1899' }
                }
            ],

            listeners : {
                selectionchange : this.onAvailabilityGridSelectionChange,
                scope           : this
            }
        });

        this.callParent(arguments);
    },

    buildToolbar : function() {
        this.addButton      = new Ext.Button({
            text     : this.L('addText'),
            iconCls  : 'x-fa fa-plus',
            handler  : this.addAvailability,
            scope    : this
        });

        this.removeButton   = new Ext.Button({
            text     : this.L('removeText'),
            iconCls  : 'x-fa fa-trash',
            handler  : this.removeAvailability,
            scope    : this,
            disabled : true
        });

        return {
            padding : '0 0 5 0',
            items : [
                this.addButton,
                this.removeButton
            ]
        };
    },


    onAvailabilityGridSelectionChange : function (grid, selection) {
        this.removeButton.setDisabled(!selection.length);
    },


    setAvailability : function (availability) {
        this.store.loadData(availability);

        this.addButton.setDisabled(this.store.getCount() >= this.maxIntervalsNum);
    },


    addAvailability : function () {
        var store = this.getStore(),
            count = store.count();

        if (count >= this.maxIntervalsNum) {
            return;
        }

        store.add({
            startTime       : new Date(0, 0, 0, 12, 0),
            endTime         : new Date(0, 0, 0, 13, 0)
        });

        if (count + 1 >= this.maxIntervalsNum && this.addButton) {
            this.addButton.disable();
        }
    },


    removeAvailability : function() {
        var store       = this.getStore(),
            count       = store.getCount(),
            selection   = this.getSelection();

        if (!selection.length) return;

        store.remove(selection[ 0 ]);

        if (count < this.maxIntervalsNum && this.addButton) {
            this.addButton.enable();
        }
    },

    // output
    isValid: function (noMessage) {
        try {
            this.calendarDay.verifyAvailability(this.getIntervals());
        } catch (ex) {
            if (!noMessage) {
                Ext.MessageBox.show({
                    title       : this.L('error'),
                    msg         : ex,
                    modal       : true,
                    icon        : Ext.MessageBox.ERROR,
                    buttons     : Ext.MessageBox.OK
                });
            }

            return false;
        }

        return true;
    },


    extractTimeFromDate : function (date) {
        return new Date(0, 0, 0, date.getHours(), date.getMinutes(), date.getSeconds());
    },


    // output
    getIntervals : function () {
        var intervals   = [];
        var me          = this;

        this.getStore().each(function (item) {
            var endTime     = me.extractTimeFromDate(item.get('endTime'));

            // 12AM as the end time means 24:00
            if (endTime - new Date(0, 0, 0, 0, 0, 0) === 0) endTime = new Date(0, 0, 1, 0, 0);

            intervals.push({ startTime : me.extractTimeFromDate(item.get('startTime')), endTime : endTime });
        });

        return intervals;
    }
});
