/**
 @class Sch.template.Event
 */
Ext.define("Sch.template.Event", {
    extend : 'Ext.XTemplate',

    eventPrefix   : null,

    // 'none', 'start', 'end' or 'both'
    resizeHandles : null,
    resizeTpl     : '<div class="sch-resizable-handle sch-resizable-handle-DIR"></div>',

    // Array of strings, ['left', 'top'] etc
    terminalSides : null,
    terminalTpl   : '<div class="sch-terminal sch-terminal-SIDE"></div>',

    constructor   : function (config) {
        var me = this;

        Ext.apply(me, config);

        me.callParent([this.getOuterMarkup()]);
    },

    getOuterMarkup : function () {
        var me = this;

        var terminalMarkup = Ext.Array.map(me.terminalSides || [], function(side) {
            return me.terminalTpl.replace(/SIDE/, side);
        }).join('');

        return [
            '<tpl for=".">',
                '<div unselectable="on" tabindex="-1" id="',
                me.eventPrefix,
                '{id}" style="right:{right}px;left:{left}px;top:{top}px;height:{height}px;width:{width}px;{style}" class="sch-event ',
                Ext.baseCSSPrefix,
                'unselectable {internalCls} {cls}">',
                    ((me.resizeHandles === 'start' || me.resizeHandles === 'both') ? me.resizeTpl.replace(/DIR/, 'start') : ''),
                    '<div unselectable="on" class="sch-event-inner">',
                        '<tpl if="iconCls"><i class="sch-event-icon {iconCls}"></i></tpl>',
                        this.getInnerMarkup(),
                    '</div>',
                    ((me.resizeHandles === 'end' || me.resizeHandles === 'both') ? me.resizeTpl.replace(/DIR/, 'end') : ''),
                    terminalMarkup,
                '</div>',
            '</tpl>'
        ].join('');
    },

    /**
     * Overriding this method will make {@link Sch.mixin.AbstractSchedulerPanel#eventBodyTemplate} obsolete, unless
     * you use '{body}' placeholder in returned string/template.
     * @returns {Ext.XTemplate/String}
     * @private
     */
    getInnerMarkup : function () {
        return '{body}';
    }
});
