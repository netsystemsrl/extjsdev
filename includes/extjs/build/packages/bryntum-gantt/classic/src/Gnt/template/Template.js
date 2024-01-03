/**
@class Gnt.template.Template
@extends Ext.XTemplate

Base class of all UI task templates. Subclass this class to implement your own UI template.
*/
Ext.define("Gnt.template.Template", {
    extend      : 'Ext.XTemplate',

    disableFormats  : true,

    getInnerTpl : Ext.emptyFn,

    innerTpl    : null,

    dependencyTerminalMarkup : '<div class="sch-terminal sch-terminal-start"></div><div class="sch-terminal sch-terminal-end"></div>',

    terminalSides : null,
    terminalTpl   : '<div class="sch-terminal sch-terminal-SIDE"></div>',

    constructor : function (cfg) {
        Ext.apply(this, cfg);

        var side = cfg.rtl ? 'right' : 'left';
        var inner = this.getInnerTpl(cfg) || '';

        this.callParent([
             '<div class="sch-event-wrap {ctcls} ' + Ext.baseCSSPrefix + 'unselectable" style="' + side + ':{offset}px">',
                '<tpl if="isRollup">',
                    inner,
                    (cfg.rollupLabel ? '<label class="sch-gantt-rollup-label">{rollupLabel}</label>' : ''),
                '<tpl else>',
                    (cfg.leftLabel ? '<div class="sch-gantt-labelct sch-gantt-labelct-left"><label class="sch-gantt-label sch-gantt-label-left">{leftLabel}</label></div>' : ''),
                    (cfg.rightLabel ? '<div class="sch-gantt-labelct sch-gantt-labelct-right" style="left:{width}px"><label class="sch-gantt-label sch-gantt-label-right">{rightLabel}</label></div>' : ''),
                    (cfg.topLabel ? '<div class="sch-gantt-labelct sch-gantt-labelct-top"><label class="sch-gantt-label sch-gantt-label-top">{topLabel}</label></div>' : ''),
                    inner,
                    (cfg.bottomLabel ? '<div class="sch-gantt-labelct sch-gantt-labelct-bottom"><label class="sch-gantt-label sch-gantt-label-bottom">{bottomLabel}</label></div>' : ''),
                '</tpl>',
            '</div>'
        ]);
    }
});
