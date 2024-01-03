/**
 * @class Sch.tooltip.HoverTip
 * HoverTip is a class that represents a tooltip with clock and time which updates as the mouse pointer moves over the schedule area.
 */
Ext.define('Sch.tooltip.HoverTip', {
    extend : 'Ext.tip.ToolTip',

    alias : 'widget.scheduler_hovertip',

    requires : [
        'Sch.tooltip.ClockTemplate'
    ],

    trackMouse : true,

    bodyCls : 'sch-hovertip',

    messageTpl : '<div class="sch-hovertip-msg">{message}</div>',

    autoHide : false,

    dismissDelay : 1000,

    showDelay : 0,

    /**
     * @cfg {Sch.mixin.SchedulerView} schedulerView (required) View instance to bind this tooltip to
     */
    schedulerView : null,

    clockTpl     : null,
    lastTime     : null,
    lastResource : null,

    initComponent : function () {
        var me   = this;
        var view = me.schedulerView;

        me.clockTpl = new Sch.tooltip.ClockTemplate();

        me.messageTpl = new Ext.XTemplate(me.messageTpl);

        me.callParent(arguments);

        me.on('beforeshow', me.tipOnBeforeShow, me);

        view.mon(view.el, {
            mouseleave : function () {
                me.hide();
            },
            mousemove  : me.handleMouseMove,
            scope      : me
        });


        // Force hide on a mouse down, in case the user is having a click listener on the schedule element
        // to show a window popup for example - in that case the hover-tooltip should not interfere
        view.mon(view.el, {
            click : me.onBodyMouseDown,
            scope : me,
            delay : 1
        });

    },

    onBodyMouseDown : function () {
        this.hide();
    },

    handleMouseMove : function (e) {
        var me   = this,
            view = me.schedulerView;

        if (me.disabled) {
            return;
        }

        // Hide tooltip in case user touched screen
        if (e.getTarget('.' + view.itemCls, 5) && !e.getTarget(view.eventSelector) && e.pointerType === 'mouse') {
            var time = view.getTimeZoneDateFromDomEvent(e, 'floor');

            if (time) {
                var resourceRecord = view.resolveResource(e.getTarget());

                if (!me.lastTime || time - me.lastTime !== 0 || resourceRecord !== me.lastResource) {
                    me.lastResource = resourceRecord;

                    if (me.hidden) {
                        me.setClockMode();
                        me.show();
                    }

                    me.updateHoverTip(time, e);
                }
            } else {
                me.hide();
            }
        } else {
            me.hide();
        }
    },

    setClockMode : function () {
        var me      = this,
            DATE    = Sch.util.Date,
            timeRes = me.schedulerView.getTimeResolution();

        if (DATE.compareUnits(timeRes.unit, DATE.DAY) >= 0) {
            me.clockTpl.setMode('day');
        } else {
            me.clockTpl.setMode('hour');
        }
    },

    /**
     * Override this to render custom text to default hover tip
     * @param {Date} date
     * @param {Ext.event.Event} e Browser event
     * @return {String}
     */
    getText : function () {
    },

    // private
    updateHoverTip : function (date, e) {
        if (date) {
            var view = this.schedulerView,
                timeAxis = view.timeAxis,
                tipDate,
                text;

            // In case of UTC date is passed here not adjusted to TZ
            if (timeAxis.isUTCTimeZone()) {
                text = Sch.util.Date.format(date, view.getDisplayDateFormat(), 0);

                if (this.clockTpl.mode === 'hour') {
                    tipDate = Sch.util.Date.getUTCTime(date);
                }
                else {
                    tipDate = Sch.util.Date.getUTCDate(date);
                }
            }
            else {
                tipDate = date;
                text = view.getFormattedDate(tipDate);
            }

            var clockHtml = this.clockTpl.apply({
                date : tipDate,
                text : text
            });

            var messageHtml = this.messageTpl.apply({
                message : this.getText(date, e)
            });

            this.update(clockHtml + messageHtml);

            this.lastTime = date;
        }
    },

    hide : function () {
        this.callParent(arguments);
        this.lastTime = this.lastResource = null;
    },

    tipOnBeforeShow : function (tip) {
        this.setClockMode();

        return !this.disabled;
    }
});
