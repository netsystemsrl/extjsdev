/**

@class Gnt.widget.Calendar
@extends Ext.picker.Date

{@img gantt/images/widget-calendar.png}

This a very simple subclass of the {@link Ext.picker.Date} which will show holidays and weekends from the provided calendar.
Any non-working time will be shown as disabled dates.

*/
Ext.define('Gnt.widget.Calendar', {
    extend              : 'Ext.picker.Date',

    alias               : 'widget.ganttcalendar',

    requires            : ['Gnt.data.Calendar', 'Sch.util.Date'],

    mixins              : ['Gnt.mixin.Localizable'],

    /**
     * @cfg {Gnt.data.Calendar} calendar An instance of the {@link Gnt.data.Calendar} to read the holidays from
     */
    calendar            : null,

    /**
     * @cfg {Date} startDate The start date of the range to show holidays for.
     */
    startDate           : null,

    /**
     * @cfg {Date} endDate The end date of the range to show holidays for.
     */
    endDate             : null,

    initComponent : function () {
        if (!this.calendar) {
            Ext.Error.raise('Required attribute "calendar" missing during initialization of `Gnt.widget.Calendar`');
        }

        if (!this.startDate) {
            Ext.Error.raise('Required attribute "startDate" missing during initialization of `Gnt.widget.Calendar`');
        }

        if (!this.endDate) {
            this.endDate = Sch.util.Date.add(this.startDate, Sch.util.Date.MONTH, 1);
        }

        this.setCalendar(this.calendar);

        this.minDate        = this.value = this.startDate;

        this.callParent(arguments);
        
        // this method requires "this.format" presense which, starting from 4.2.1 is initialized in the parent "initComponent"
        this.injectDates();
    },

    injectDates : function() {
        var me              = this;
        var disabledDates   = me.disabledDates = [];

        Ext.Array.each(me.calendar.getHolidaysRanges(me.startDate, me.endDate), function (range) {
            range.forEachDate(function (date) {
                disabledDates.push(Ext.Date.format(date, me.format));
            });
        });

        me.setDisabledDates(disabledDates);
    },

    /**
     * Sets the calendar for this calendar picker
     *
     * @param {Gnt.data.Calendar} calendar The calendar
     */
    setCalendar : function (calendar) {
        var listeners = {
            update  : this.injectDates,
            remove  : this.injectDates,
            add     : this.injectDates,
            load    : this.injectDates,
            clear   : this.injectDates,
            scope   : this
        };

        if (this.calendar) {
            this.mun(calendar, listeners);
        }

        this.calendar = calendar;

        if (calendar) {
            this.mon(calendar, listeners);
        }
    }
});
