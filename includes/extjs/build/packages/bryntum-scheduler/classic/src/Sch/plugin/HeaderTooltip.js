/**
 * A plugin showing a tooltip for cells in the time axis header.
 *
 * Sample usage:
 *
 * ```javascript
 * new Sch.panel.SchedulerGrid({
 *     plugins : ['scheduler_headertooltip'],
 *     ...
 * });
 * ```
 */
Ext.define('Sch.plugin.HeaderTooltip', {
    extend   : 'Ext.AbstractPlugin',
    requires : [
        'Ext.tip.ToolTip',
        'Ext.Date',
        'Sch.view.HorizontalTimeAxis'
    ],

    alias : 'plugin.scheduler_headertooltip',

    /**
     * @cfg {String} dateFormat
     * The date format to use. See {@link #getTipContent} for details on how to provide custom content to the tooltip.
     */
    dateFormat : 'M j, Y H:i', // "Apr 5, 2018 17:00"

    /**
     * @cfg {Object} tipCfg
     * A config for the tooltip
     */
    tipCfg : null,

    tip : null,

    tipCls      : 'sch-header-tooltip',
    delegateCls : 'sch-column-header',

    init : function (grid) {
        grid.getSchedulingView().on('afterrender', this.setupTooltip, this);
    },

    setupTooltip : function () {
        var me     = this,
            header = me.getCmp().normalGrid.getHeaderContainer();

        me.tip = Ext.create(Ext.apply({
            xtype      : 'tooltip',
            cls        : me.tipCls,
            showDelay  : 0,
            trackMouse : true,
            target     : header.getEl(),
            // Each element triggers separate show and hide events
            delegate   : '.' + me.delegateCls
        }, me.tipCfg));

        me.tip.on('beforeshow', me.beforeTipShow, me);
    },

    beforeTipShow : function () {
        var me   = this,
            date = Ext.Date.parse(me.tip.triggerElement.dataset.date, Sch.view.HorizontalTimeAxis.encodeDateFormat);

        date = this.getCmp().getSchedulingView().convertDateToTimeZone(date);

        me.tip.update(me.getTipContent(date));
    },

    /**
     * A hook to provide content to the tooltip
     * @protected
     * @template
     * @param {Date} date The date for the time axis ´tick´
     * @return {String} The HTML string display in the tooltip
     */
    getTipContent : function (date) {
        return Ext.Date.format(date, this.dateFormat);
    },

    destroy : function () {
        if (this.tip) {
            this.tip.destroy();
        }

        this.callParent(arguments);
    }
});
