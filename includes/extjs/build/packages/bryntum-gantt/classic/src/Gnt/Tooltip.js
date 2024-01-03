/*
@class Gnt.Tooltip
@extends Ext.ToolTip
@private

Internal tooltip class showing task start/end/duration information for a single task.
*/
Ext.define("Gnt.Tooltip", {
    extend      : 'Ext.tip.ToolTip',
    alias       : 'widget.gantt_task_tooltip',

    requires    : ['Ext.Template'],

    mixins      : ['Gnt.mixin.Localizable'],

    anchor           : 'bottom', // anhor direction advise
    autoHide         : false,
    maskOnDisable    : false,
    adjustMilestones : true,

    /*
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - startText       : 'Starts: ',
            - endText         : 'Ends: ',
            - durationText    : 'Duration:'
     */

    /*
     * @cfg {String} mode Either "startend" - showing start date and end date, or "duration" to show start date and duration
     */
    mode            : 'startend',

    /*
     * @cfg {Number} durationDecimalPrecision The number of decimals to show for a duration string
     */
    durationDecimalPrecision : 1,

    /*
     * @cfg {Ext.Template} template An HTML snippet used for the tooltip display.
     * In "startend" mode, it will receive a data object containing "startText", "endText" and "task" (the entire task) properties.
     * In "duration" mode, it will receive a data object containing "startText", "duration", "unit" and "task" (the entire task) properties.
     */
    template : null,

    /**
     * @cfg {Boolean} avoidPointer Whether to move the tip out of the pointer way
     */
    avoidPointer : false,

    gantt       : null,

    lastTarget  : null,

    defaultAlign : 'b-t',

    reverseDefaultAlign : 't-b',

    initComponent : function() {
        var me = this;

        me.initialDefaultAlign = me.defaultAlign;

        me.rtl = me.gantt.rtl;

        me.startLabel     = me.L('startText');
        me.label2Text     = me.mode === 'duration' ? me.L('durationText') : me.L('endText');

        if (!me.template) {
            me.template = new Ext.Template(
                '<div class="sch-timetipwrap x-fa {cls}">' +
                    '<table cellpadding="0" cellspacing="0">' +
                        '<tpl if="value1"><tr><td class="sch-gantt-tip-desc">{label1}</td><td class="sch-gantt-tip-value">{value1}</td></tr></tpl>' +
                        '<tr><td class="sch-gantt-tip-desc">{label2}</td><td class="sch-gantt-tip-value">{value2}</td></tr>' +
                    '</table>' +
                '</div>'
            ).compile();
        }

        me.callParent(arguments);

        me.update(me.template.apply({ value1 : '', value2 : '' }));
        me.addCls('gnt-tooltip');

        if (me.avoidPointer) {
            me.on({
                scope : me,
                'mouseover' : {
                    'element' : 'el',
                    fn        : me.onTipElementMouseOver
                }
            });
        }
    },

    updateContent : function (start, end, valid, taskRecord) {
        var me = this,
            content;

        if (me.mode === 'duration') {
            content = me.getDurationContent(start, end, valid, taskRecord);
        } else {
            content = me.getStartEndContent(start, end, valid, taskRecord);
        }

        me.update(content);
    },

    // private
    getStartEndContent : function(start, end, valid, taskRecord) {
        var gantt       = this.gantt,
            startText   = start && gantt.getFormattedDate(start),
            endText;

        if (start) {
            if(end - start > 0) {
                endText     = gantt.getFormattedEndDate(end, start);
            } else{
                endText     = startText;
            }
        } else {
            // Single point in time
            endText   = gantt.getFormattedEndDate(end);
        }

        var retVal = {
            cls         : valid ? 'sch-tip-ok fa-check' : 'sch-tip-notok fa-ban',
            label2      : this.label2Text,
            value2      : endText,
            task        : taskRecord
        };

        if (start) {
            retVal.label1      = this.startLabel;
            retVal.value1      = start && gantt.getFormattedDate(start);
        }

        return this.template.apply(retVal);
    },


    getDurationContent : function(start, end, valid, taskRecord) {
        var unit        = taskRecord.getDurationUnit();
        var duration    = taskRecord.calculateDuration(start, end, unit);

        return this.template.apply({
            cls         : valid ? 'sch-tip-ok fa-check' : 'sch-tip-notok fa-ban',
            label1      : this.startLabel,
            value1      : this.gantt.getFormattedDate(start),
            label2      : this.label2Text,
            value2      : parseFloat(Ext.Number.toFixed(duration, this.durationDecimalPrecision)) + ' ' + Sch.util.Date.getReadableNameOfUnit(unit, duration > 1),
            task        : taskRecord
        });
    },

    onTipElementMouseOver : function() {
        var me = this,
            align = me.defaultAlign;

        me.defaultAlign = me.reverseDefaultAlign;
        me.reverseDefaultAlign = align;

        me.lastTarget && me.showBy(me.lastTarget);
    },

    // In ExtJS 6.0.2 this method is defined on Ext.Component and has signature (cmp, [pos], [off])
    // Whereas in ExtJS 6.2.0 and later this method is defined on Ext.tip.Tip this (target) signature
    // and doesn't goes to Ext.Component::showBy() - no callParent() there.
    showBy : function(el) {
        var me = this,
            targetRegion,
            tipRegion,
            anchorRegion,
            newAnchor,
            newAlign,
            targetOffset;

        me.defaultAlign = me.initialDefaultAlign;

        me.lastTarget = el;
        if (me.anchor) {
            me.anchorTarget = el;
        }

        me.callParent([el]); // there call to alignTo() in parent call

        if (Ext.getVersion().isLessThanOrEqual('6.0.2.*') && me.syncAnchor) {

            targetRegion = Ext.fly(el).getRegion();
            tipRegion    = me.getEl().getRegion();

            if (targetRegion.bottom <= tipRegion.top && me.tipAnchor != 'top') {
                newAnchor = 'top';
                newAlign  = 'tl-bl?';
            }
            else if (targetRegion.top >= tipRegion.bottom && me.tipAnchor != 'bottom') {
                newAnchor = 'bottom';
                newAlign  = 'bl-tl?';
            }
            else if (targetRegion.right <= tipRegion.left && me.tipAnchor != 'left') {
                newAnchor = 'left';
                newAlign  = 'l-r?';
            }
            else if (targetRegion.left >= tipRegion.right && me.tipAnchor != 'right' ) {
                newAnchor = 'right';
                newAlign  = 'r-l?';
            }

            if (me.tipAnchor != newAnchor) {

                me.tipAnchor = me.anchor = newAnchor;
                me.syncAnchor();

                anchorRegion = Ext.fly(me.getEl().down('.' + Ext.baseCSSPrefix + 'tip-anchor')).getRegion();

                switch (newAnchor) {
                case 'top':
                    targetOffset = [0, (anchorRegion.bottom - anchorRegion.top) / 2];
                    break;
                case 'bottom':
                    targetOffset = [0, (anchorRegion.top - anchorRegion.bottom) / 2];
                    break;
                case 'left':
                    targetOffset = [(anchorRegion.left - anchorRegion.right) / 2, 0];
                    break;
                case 'right':
                    targetOffset = [(anchorRegion.right - anchorRegion.left) / 2, 0];
                    break;
                }

                me.alignTo(
                    el,
                    newAlign,
                    targetOffset
                );

                me.getTargetXY(); // Just, don't ask. It should be here.
            }
        }
    },

    afterHide : function(animateTarget, callback, scope) {
        var me = this;

        me.callParent([animateTarget, callback, scope]);

        me.lastTarget = null;
    }
});
