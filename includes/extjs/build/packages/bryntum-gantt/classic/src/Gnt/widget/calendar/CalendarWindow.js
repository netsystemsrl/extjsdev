/**

@class Gnt.widget.calendar.CalendarWindow
@extends Ext.window.Window
@aside guide gantt_calendars

{@img gantt/images/calendar.png}

This is just a {@link Gnt.widget.calendar.Calendar} widget, wrapped with the Ext.window.Window instance.
It proxies the {@link #calendar} config and {@link #applyChanges} method.

*/
Ext.define('Gnt.widget.calendar.CalendarWindow', {
    extend          : 'Ext.window.Window',

    requires        : ['Gnt.widget.calendar.Calendar'],

    mixins          : ['Gnt.mixin.Localizable'],

    alias           : 'widget.calendarwindow',

    /**
     * @cfg {Object} calendarConfig An object to be applied to the newly created instance of the {@link Gnt.widget.calendar.Calendar}
     */
    calendarConfig  : null,

    /**
     * @cfg {Gnt.data.Calendar} calendar An instance of the {@link Gnt.data.Calendar} to read/change the holidays from/in.
     */
    calendar        : null,

    /**
     * @property {Gnt.widget.calendar.Calendar} calendarWidget An underlying calendar widget instance
     */
    calendarWidget  : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - ok         : 'Ok',
     * - cancel     : 'Cancel',
     */

    initComponent   : function () {

        // Only constrain width/height this way if user haven't set size
        Ext.applyIf(this, {
            width   : Math.min(Ext.getBody().getWidth() - 100, 800),
            height  : Math.min(Ext.getBody().getHeight() - 100, 650)
        });

        Ext.apply(this, {
            layout      : 'fit',
            title       : this.title || this.L('title'),
            items       : this.calendarWidget = new Gnt.widget.calendar.Calendar(Ext.apply({
                calendar        : this.calendar
            }, this.calendarConfig)),

            buttons     : [
                {
                    text        : this.L('ok'),
                    handler     : function () {
                        this.applyChanges();
                        this.close();
                    },
                    scope       : this
                },
                {
                    text        : this.L('cancel'),
                    handler     : this.close,
                    scope       : this
                }
            ]
        });

        this.callParent(arguments);
    },


    /**
     * Call this method when user is satisfied with the current state of the calendar in the UI. It will apply all the changes made in the UI
     * to the original calendar.
     */
    applyChanges : function () {
        this.calendarWidget.applyChanges();
    },


    setCalendar : function (calendar) {
        this.calendarWidget.setCalendar(calendar);
    }
});
