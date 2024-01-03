/**
 * @class Sch.tooltip.ClockTemplate
 * @extends Ext.XTemplate
 * @private
 * A template showing a clock. It accepts an object containing a 'date' and a 'text' property to its apply method.
 * @constructor
 * @param {Object} config The object containing the configuration of this model.
 */
Ext.define('Sch.tooltip.ClockTemplate', {
    extend : 'Ext.XTemplate',

    minuteHeight : 8,
    minuteTop    : 2,
    hourHeight   : 8,
    hourTop      : 2,
    handLeft     : 10,

    // Supposed to be either 'hour' for a clock view or 'day' for a calendar view or 'allday' for weekview all day header
    mode : 'hour',

    setMode : function (mode) {
        this.mode = mode;
    },

    getRotateStyle : function (degrees) {
        return "transform:rotate(Ddeg);".replace(/D/g, degrees);
    },

    constructor : function () {
        var me = this;

        me.callParent([
            '<div class="sch-clockwrap sch-supports-border-radius' + ' sch-clock-{[this.mode]}">' +
            '<div class="sch-clock">' +
            '<div class="sch-hourIndicator" style="{[this.getHourStyle((values.date.getHours() % 12) * 30,' + this.hourTop + ', + ' + this.hourHeight + ')]}">{[Ext.Date.monthNames[values.date.getMonth()].substr(0,3)]}</div>' +
            '<div class="sch-minuteIndicator" style="{[this.getMinuteStyle(values.date.getMinutes() * 6,' + this.minuteTop + ', + ' + this.minuteHeight + ')]}">{[values.date.getDate()]}</div>' +
            '<div class="sch-clock-dot"></div>' +
            '</div>' +
            '<span class="sch-clock-text">{text}</span>' +
            '</div>',
            {
                getMinuteStyle : me.getRotateStyle,
                getHourStyle   : me.getRotateStyle
            }
        ]);
    }
})
;
