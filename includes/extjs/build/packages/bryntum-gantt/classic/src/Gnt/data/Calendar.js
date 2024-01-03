/**

@class Gnt.data.Calendar
@extends Sch.data.Calendar
@aside guide gantt_calendars

A class representing a customizable calendar with weekends, holidays and availability information for any day.
Internally, it's just a subclass of the Ext.data.Store class which should be loaded with a collection
of {@link Gnt.model.CalendarDay} instances. Additionally, calendars may have parent-child relations, allowing "child" calendars to "inherit"
all special dates from its "parent" and add its own. See {@link #parent} property for details.

* **Note, that this calendar class is configured for backward compatibility and sets whole 24 hours of every day except weekends,
as available time. If you are looking for a calendar with regular business hours and availability, use {@link Gnt.data.calendar.BusinessTime}**

A calendar can be instantiated like this:

    var calendar        = new Gnt.data.Calendar({
        data    : [
            {
                Date            : new Date(2010, 0, 13),
                Cls             : 'gnt-national-holiday'
            },
            {
                Date            : new Date(2010, 1, 1),
                Cls             : 'gnt-company-holiday'
            },
            {
                Date            : new Date(2010, 0, 16),
                IsWorkingDay    : true
            }
        ]
    });

It can then be provided as a {@link Gnt.data.TaskStore#calendar configuration option} for the {@link Gnt.data.TaskStore}. Note that the calendar should be
loaded prior to loading the taskStore where it's consumed.

Please refer to the {@link Gnt.model.CalendarDay} class to know with what data calendar can be loaded with.

To edit the data in the calendar visually you can use {@link Gnt.widget.calendar.Calendar}

*/
Ext.define('Gnt.data.Calendar', {
    extend   : 'Sch.data.Calendar',

    model                       : 'Gnt.model.CalendarDay',
    defaultNonWorkingTimeCssCls : 'gnt-holiday'
});
