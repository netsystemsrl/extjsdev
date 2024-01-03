/**

@class Gnt.data.calendar.BusinessTime
@extends Gnt.data.Calendar

A class representing a customizable calendar with weekends, holidays and availability information for any day. 

This class is basically a subclass of {@link Gnt.data.Calendar}, configured for normal business hours availability, 
you can fine-tune its setting if needed. Default availability hours for every day are 08:00-12:00 and 13:00-17:00 
(can be configured with {@link #defaultAvailability} property.

See also {@link Gnt.data.Calendar} for additional information.

*/
Ext.define('Gnt.data.calendar.BusinessTime', {
    extend              : 'Gnt.data.Calendar',
    
    /**
     * Number of days per month. Will be used when converting the big duration units like month/year to days.
     * 
     * @cfg {Number} daysPerMonth
     */
    daysPerMonth        : 20,

    /**
     * Number of days per week. Will be used when converting the duration in weeks to days.
     * 
     * @cfg {Number} daysPerWeek
     */
    daysPerWeek         : 5,

    /**
     * Number of hours per day. Will be used when converting the duration in days to hours.
     * 
     * **Please note**, that this config is used for duration convertion and not anything else. If you need to change
     * the number of working hours in the day, update the {@link #defaultAvailability}
     * 
     * @cfg {Number} hoursPerDay
     */
    hoursPerDay         : 8,
    
    /**
     * @cfg {String[]} defaultAvailability The array of default availability intervals (in the format of the `Availability` field
     * in the {@link Gnt.model.CalendarDay}) for each working weekday (Monday-Friday). 
     */
    defaultAvailability : [ '08:00-12:00', '13:00-17:00' ]
});