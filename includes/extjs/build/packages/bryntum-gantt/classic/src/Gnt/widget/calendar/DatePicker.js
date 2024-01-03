Ext.define('Gnt.widget.calendar.DatePicker', {
    extend : 'Gnt.widget.DatePickerWithDateHighlighting',
    alias  : 'widget.gntdatepicker',

    getDateCls : function (date) {
        var cls = '';

        if (date.getMonth() !== this.getActive().getMonth()) {
            return;
        }

        var calendar    = this.dayOverridesCalendar,
            calendarDay = calendar.getOwnCalendarDay(date);

        if (calendarDay) {
            cls += ' ' + this.overriddenDayCls;

            if (!calendar.isWorkingDay(date)) {
                cls += ' ' + this.nonWorkingDayCls;
            }

            cls += ' ' + this.getCalendarDayCls(calendar, date);
        }
        else {
            // this will be an internal week override model instance from the weekStore
            var week = null;

            this.weekOverridesStore.each(function (internalWeekModel) {
                var startDate = internalWeekModel.get('startDate'),
                    endDate   = internalWeekModel.get('endDate');

                if (startDate != null && endDate != null && Ext.Date.between(date, startDate, endDate)) {
                    week = internalWeekModel;
                    return false;
                }
            });

            if (week) {
                cls += ' ' + this.overriddenWeekDayCls;

                var index            = date.getDay(),
                    weekAvailability = week.get('weekAvailability');

                if (weekAvailability && weekAvailability[index] && !weekAvailability[index].getIsWorkingDay()) {
                    cls += ' ' + this.nonWorkingDayCls;
                }

            }
            else if (!calendar.isWorkingDay(date)) {
                cls += ' ' + this.nonWorkingDayCls;
            }
        }

        return cls || this.workingDayCls;
    }
});
