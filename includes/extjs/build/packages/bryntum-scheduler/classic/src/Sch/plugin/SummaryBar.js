/**
 * A grid plugin that provides a summary bar.
 *
 * **Note:** The plugin only supported in horizontal mode.
 *
 * Sample usage:
 *
 * ```javascript
 * new Sch.panel.SchedulerGrid({
 *     plugins : [{
 *         ptype    : 'scheduler_summarybar',
 *         renderer : function (events, metaData) {
 *             return events.length || '';
 *         }
 *     }],
 *     ...
 * });
 * ```
 */
Ext.define('Sch.plugin.SummaryBar', {
    extend   : 'Ext.AbstractPlugin',
    mixins   : ['Sch.mixin.Localizable'],
    requires : ['Ext.XTemplate'],

    alias : 'plugin.scheduler_summarybar',

    /**
     * @cfg {Function} renderer
     * A renderer function responsible for calculating the value and generating the HTML to put into each summary cell.
     * @param {Sch.model.Event[]} events Events in the time interval
     * @param {Object} metaData A collection of metadata about the current bar. Recognized properties are: `cls`, `style`, `attr`.
     * @return {String} The HTML string to be rendered
     */
    renderer : false,

    /**
     * @cfg {Object} scope
     * This reference for the {@link #renderer} function
     */
    scope : null,

    /**
     * @cfg {Number} height
     * A height of the summary bar
     */
    height : 20,

    titleContainer : null,
    barContainer   : null,

    titleContainerCls : 'sch-summaryrow-title',
    barContainerCls   : 'sch-summaryrow-view',

    grid          : null,
    view          : null,
    resourceStore : null,
    eventStore    : null,

    tpl :
        '<table style="width: {totalWidth}px;" cellpadding="0" cellspacing="0">' +
            '<tr>' +
                '<tpl for="bars">' +
                    '<td style="width: {width}px;">' +
                        '<div class="sch-summaryrow-bar-wrapper">' +
                            '<div class="sch-summaryrow-bar {cls}" style="{style}" {attr}>' +
                                '<span class="sch-summaryrow-bar-text">{value}</span>' +
                            '</div>' +
                        '</div>' +
                    '</td>' +
                '</tpl>' +
            '</tr>' +
        '</table>',

    init : function (grid) {
        var me = this;

        me.grid          = grid;
        me.view          = grid.getSchedulingView();
        me.eventStore    = grid.getEventStore();
        me.resourceStore = grid.getResourceStore();

        me.tpl = new Ext.XTemplate(me.tpl);

        // Supported only in Horizontal mode
        if (grid.isHorizontal()) {
            me.initBars();
        }

        me.setupListeners();

        me.callParent(arguments);
    },

    initBars : function () {
        var me = this;

        me.titleContainer = me.grid.lockedGrid.addDocked({
            xtype  : 'component',
            dock   : 'bottom',
            height : me.height,
            cls    : me.titleContainerCls,
            html   : '<span class="sch-summaryrow-title-text" style="line-height: ' + me.height + 'px;">' + me.L('totalText') + '</span>'
        })[0];

        me.barContainer = me.grid.normalGrid.addDocked({
            xtype      : 'component',
            dock       : 'bottom',
            height     : me.height,
            cls        : me.barContainerCls,
            // Instantiate a Scroller, but no scrollbars
            scrollable : {
                x : false,
                y : false
            }
        })[0];

        // Partner the toolbar scroll with the view for X axis
        me.barContainer.getScrollable().addPartner(me.view.getScrollable(), 'x');
    },

    destroyBars : function () {
        var me = this;

        if (me.barContainer) {
            me.barContainer.destroy();
            me.barContainer = null;
        }

        if (me.titleContainer) {
            me.titleContainer.destroy();
            me.titleContainer = null;
        }
    },

    setupListeners : function () {
        var me   = this,
            grid = me.grid;

        me.view.on('refresh', me.renderSummaryRow, me);

        var eventListeners = {
            add    : me.renderSummaryRow,
            remove : me.renderSummaryRow,
            update : me.renderSummaryRow,
            scope  : me
        };

        grid.mon(me.eventStore, eventListeners);
        grid.mon(me.resourceStore, eventListeners);

        if (grid.getAssignmentStore()) {
            grid.mon(grid.getAssignmentStore(), eventListeners);
        }

        me.grid.on('modechange', me.onGridModeChange, me);
    },

    onGridModeChange : function () {
        var me = this;

        if (me.grid.isHorizontal()) {
            me.initBars();
            me.renderSummaryRow();
        }
        else {
            me.destroyBars();
        }
    },

    renderSummaryRow : function () {
        var me = this;

        if (!me.barContainer) return;

        var newEl = document.createElement('div');

        newEl.innerHTML = me.tpl.apply(me.buildRenderData());

        me.barContainer.el.syncContent(newEl);
    },

    buildRenderData : function () {
        var me         = this,
            ticks      = me.view.timeAxis.getTicks(),
            tickWidth  = me.view.timeAxisViewModel.getTickWidth(),
            totalWidth = tickWidth * ticks.length;

        return {
            totalWidth : totalWidth,
            bars       : Ext.Array.map(ticks, function (tick) {
                var events = me.resourceStore.getScheduledEventsInTimeSpan(tick.start, tick.end, me.eventStore),
                    data   = {
                        width : tickWidth,
                        cls   : '',
                        style : '',
                        attr  : ''
                    };

                data.value = me.renderer ? me.renderer.call(me.scope || me, events, data) : '&nbsp;';

                return data;
            })
        };
    }
});