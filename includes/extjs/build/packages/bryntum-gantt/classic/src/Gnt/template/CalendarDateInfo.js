/**
 @class Gnt.template.CalendarDateInfo
 @extends Ext.XTemplate

 Template class showing the legend for the calendar widget
 */
Ext.define("Gnt.template.CalendarDateInfo", {
    extend         : 'Ext.XTemplate',

    workingHoursText  : null,
    nonWorkingText    : null,
    basedOnText       : null,
    overrideText      : null,
    inCalendarText    : null,
    dayInCalendarText : null,

    markup :
    '<div class="gnt-calendar-overridedate">' +
        '<tpl if="isWorkingDay">__WORKINGHOURS__ {date}:<tpl else>{date} __NONWORKING__</tpl>' +
    '</div>' +
    '<ul class="gnt-calendar-availabilities">' +
        '<tpl for="availability">' +
            '<li>{.}</li>' +
        '</tpl>' +
    '</ul>' +
    '<span class="gnt-calendar-overridesource"> __BASEDON__: ' +
    '<tpl if="override">__OVERRIDE__ "{name:htmlEncode}" __INCALENDAR__ "{calendarName:htmlEncode}"<tpl else>__DAYINCALENDAR__ "{calendarName:htmlEncode}"</tpl>' +
    '</span>',

    constructor : function (config) {
        Ext.apply(this, config);

        this.markup = this.markup.replace('__WORKINGHOURS__', this.workingHoursText)
                      .replace('__NONWORKING__', this.nonWorkingText)
                      .replace('__BASEDON__', this.basedOnText)
                      .replace('__OVERRIDE__', this.overrideText)
                      .replace('__INCALENDAR__', this.inCalendarText)
                      .replace('__DAYINCALENDAR__', this.dayInCalendarText);

        this.callParent([this.markup]);
    }
});
