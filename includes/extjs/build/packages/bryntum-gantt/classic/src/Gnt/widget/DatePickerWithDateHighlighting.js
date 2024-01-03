// Basic internal date picker that colors dates based on the Task Calendar
Ext.define('Gnt.widget.DatePickerWithDateHighlighting', {
    extend : 'Ext.picker.Date',
    alias  : 'widget.datepickerwithdatehighlighting',

    workingDayCls        : 'gnt-datepicker-workingday',
    nonWorkingDayCls     : 'gnt-datepicker-nonworkingday',
    overriddenDayCls     : 'gnt-datepicker-overriddenday',
    overriddenWeekDayCls : 'gnt-datepicker-overriddenweekday',

    weekOverridesStore   : null,
    dayOverridesCalendar : null,

    // @OVERRIDE
    // Adds custom classes to certain day cells
    update : function () {
        this.callParent(arguments);

        this.refreshCssClasses();
    },

    removeCustomCls : function () {
        this.cells.removeCls([this.overriddenDayCls, this.nonWorkingDayCls, this.workingDayCls, this.overriddenWeekDayCls]);
    },

    refreshCssClasses : function () {
        var me = this;

        if (!me.cells || !me.cells.elements) {
            return;
        }

        var cells = me.cells.elements;

        this.removeCustomCls();

        for (var i = 0; i < me.numDays; i++) {
            // will contain number of ms since Epoch, so need to convert it into Date on the next line
            var timestamp = cells[i].firstChild.dateValue;
            cells[i].className += ' ' + this.getDateCls(new Date(timestamp));
        }
    },

    getCalendarDayCls : function (calendar, date) {
        var calendarDay   = calendar.getCalendarDay(date),
            clsField      = calendarDay.getField(calendarDay.clsField),
            defaultDayCls = clsField.getDefaultValue().trim(),
            dayCls        = calendarDay.getCls().trim();

        // historically default value equals to 'sch-nonworkingtime' or 'gnt-holiday', so need to add only manually specified classes, otherwise all days will be marked as non working time
        return dayCls != defaultDayCls ? dayCls : '';
    },

    getDateCls : function (date) {
        var cls = this.workingDayCls;

        if (date.getMonth() !== this.getActive().getMonth()) {
            return;
        }

        if (this.calendar) {
            if (!this.calendar.isWorkingDay(date)) {
                cls = this.nonWorkingDayCls;
            }

            cls += ' ' + this.getCalendarDayCls(this.calendar, date);
        }

        return cls;
    }
});
