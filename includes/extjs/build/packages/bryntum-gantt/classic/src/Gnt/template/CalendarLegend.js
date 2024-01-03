/**
 @class Gnt.template.CalendarLegend
 @extends Ext.Template

 Template class showing the legend for the calendar widget
 */
Ext.define("Gnt.template.CalendarLegend", {
    extend         : 'Ext.Template',

    disableFormats : true,

    markup         : '<ul class="gnt-calendar-legend">' +
    '<li class="gnt-calendar-legend-item">' +
    '<div class="gnt-calendar-legend-itemstyle {workingDayCls}"></div>' +
    '<span class="gnt-calendar-legend-itemname">{workingDayText}</span>' +
    '<div style="clear: both"></div>' +
    '</li>' +
    '<li>' +
    '<div class="gnt-calendar-legend-itemstyle {nonWorkingDayCls}"></div>' +
    '<span class="gnt-calendar-legend-itemname">{weekendsText}</span>' +
    '<div style="clear: both"></div>' +
    '</li>' +
    '<li class="gnt-calendar-legend-override">' +
    '<div class="gnt-calendar-legend-itemstyle {overriddenDayCls}">31</div>' +
    '<span class="gnt-calendar-legend-itemname">{overriddenDayText}</span>' +
    '<div style="clear: both"></div>' +
    '</li>' +
    '<li class="gnt-calendar-legend-override">' +
    '<div class="gnt-calendar-legend-itemstyle {overriddenWeekDayCls}">31</div>' +
    '<span class="gnt-calendar-legend-itemname">{overriddenWeekText}</span>' +
    '<div style="clear: both"></div>' +
    '</li>' +
    '</ul>',

    constructor : function () {
        this.callParent([this.markup]);
    }
});
