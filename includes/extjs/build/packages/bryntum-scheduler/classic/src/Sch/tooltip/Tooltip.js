/**
 @class Sch.tooltip.Tooltip
 @extends Ext.ToolTip
 @private

 Internal plugin showing a tooltip with event start/end information.
 */
Ext.define("Sch.tooltip.Tooltip", {
    extend : "Ext.tip.ToolTip",

    requires : [
        'Ext.XTemplate',
        'Sch.tooltip.ClockTemplate'
    ],

    autoHide          : false,
    anchor            : 'b',
    padding           : '0 3 0 0',
    showDelay         : 0,
    hideDelay         : 0,
    quickShowInterval : 0,
    dismissDelay      : 0,
    trackMouse        : false,
    anchorOffset      : 5,
    shadow            : false,
    frame             : false,

    schedulerView     : null,
    message           : null,
    startDate         : null,
    endDate           : null,
    template          : null,
    valid             : true,
    mode              : null,
    offsetAdjust      : [18, 5],

    clockTpl          : null,

    constructor : function (config) {
        var me = this;

        me.clockTpl = new Sch.tooltip.ClockTemplate();

        me.startDate = me.endDate = new Date();

        if (!me.template) {
            me.template = new Ext.XTemplate([
                '<div class="' + Ext.baseCSSPrefix + 'fa sch-tip-{[values.valid ? "ok fa-check" : "notok fa-ban"]} ">' +
                '{[this.renderClock(values.startDate, values.startText, "sch-tooltip-startdate")]}' +
                '{[this.renderClock(values.endDate, values.endText, "sch-tooltip-enddate")]}' +
                '<div class="sch-tip-message">{message}</div>' +
                '</div>',
                {
                    renderClock : function (date, text, cls) {
                        return me.clockTpl.apply({
                            date : date,
                            text : text,
                            cls  : cls
                        });
                    }
                }
            ]);
        }

        me.callParent(arguments);
    },

    // set redraw to true if you want to force redraw of the tip
    // required to update drag tip after scroll
    update      : function (startDate, endDate, valid, message, allDay) {

        if (this.startDate - startDate !== 0 ||
            this.endDate - endDate !== 0 ||
            this.valid !== valid ||
            this.message !== message ||
            this.allDay != allDay) {

            var timeAxis = this.schedulerView.timeAxis;
            var isUTC = timeAxis.isUTCTimeZone();

            if (!isUTC) {
                startDate = this.schedulerView.convertDateToTimeZone(startDate);
                endDate = this.schedulerView.convertDateToTimeZone(endDate);
            }

            // This will be called a lot so cache the values
            this.startDate = startDate;
            this.endDate = endDate;
            this.valid = valid;
            this.message = message;
            this.allDay = allDay;

            var startText, endText;

            if (isUTC) {
                startText = this.schedulerView.getTimeZoneFormattedDate(startDate);
                endText = this.schedulerView.getTimeZoneFormattedEndDate(endDate);
            }
            else {
                startText = this.schedulerView.getFormattedDate(startDate);
                endText = this.schedulerView.getFormattedEndDate(endDate, startDate);
            }

            if (allDay) {
                this.mode = 'calendar';
                this.clockTpl.setMode('allday');
            }
            else {
                this.mode = 'day';
                this.clockTpl.setMode('hour');
            }

            // If resolution is day or greater, and end date is greater then start date
            if (this.mode === 'calendar' && endDate.getHours() === 0 && endDate.getMinutes() === 0 && !(endDate.getYear() === startDate.getYear() && endDate.getMonth() === startDate.getMonth() && endDate.getDate() === startDate.getDate())) {
                endDate = Sch.util.Date.add(endDate, Sch.util.Date.DAY, -1);
            }

            this.callParent([
                this.template.apply({
                    valid     : valid,
                    startDate : startDate,
                    endDate   : endDate,
                    startText : startText,
                    endText   : endText,
                    message   : message,
                    allDay    : allDay
                })
            ]);
        }

        // #3929
        // Realign on every update to keep position in sync
        // covered by 070_dragcreate_tip
        if (this.rendered && this.isVisible()) {
            if (Ext.getVersion().isGreaterThan('6.2.1')) {
                // call new public method in 6.2.1 to align tip and fix anchor
                this.realignToTarget();
            } else {
                this.realign();
            }
        }
    },

    showForElement : function (el, xOffset) {

        if (Sch.util.Date.compareUnits(this.schedulerView.getTimeResolution().unit, Sch.util.Date.DAY) >= 0) {
            this.mode = 'calendar';

            this.addCls('sch-day-resolution');
            this.removeCls('sch-hour-resolution');
        } else {
            this.mode = 'clock';

            this.removeCls('sch-day-resolution');
            this.addCls('sch-hour-resolution');
        }

        // xOffset has to have default value
        // when it's 18 tip is aligned to left border
        xOffset = arguments.length > 1 ? xOffset : this.offsetAdjust[0];

        this.mouseOffsets = [xOffset - this.offsetAdjust[0], -this.offsetAdjust[1]];

        this.setTarget(el);
        this.show();

        this.realign();
    },

    realign : function () {
        this.alignTo(this.target, 'bl-tl?', this.mouseOffsets);
    },

    afterRender : function () {
        this.callParent(arguments);

        // In slower browsers, the mouse pointer may end up over the tooltip interfering with drag drop etc
        this.el.on('mouseenter', this.realign, this);
    }
});
