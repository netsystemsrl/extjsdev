/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
/**
 * This feature can display summaries for all nested groups and a grand summary
 * for the entire store assigned to the grid panel.
 */
Ext.define('Ext.grid.feature.MultiGroupingSummary', {
    extend: 'Ext.grid.feature.MultiGrouping',
    alias: 'feature.multigroupingsummary',

    groupSummaryPosition: 'bottom',
    /**
     * @cfg summaryPosition
     * @inheritdoc
     * @localdoc
     *  * `'docked'`: Show the summary row docked at the top/bottom of the grid. Used together with the {@link dock} config
     */
    summaryPosition: 'docked',

    /**
     * @cfg {String} dock
     * Configure `'top'` or `'bottom'` to create a fixed summary row either above or below the scrollable table.
     *
     */
    dock: 'bottom',

    dockedSummaryCls: Ext.baseCSSPrefix + 'docked-grid-summary',
    summaryCls: Ext.baseCSSPrefix + 'grid-summary',
    summarySelector: '.' + Ext.baseCSSPrefix + 'grid-summary',
    summaryTableCls: Ext.baseCSSPrefix + 'grid-item',

    init: function (grid) {
        var me = this,
            view = me.view,
            showSummary;

        me.callParent([grid]);

        grid.headerCt.on({
            columnschanged: me.onStoreUpdate, // this includes columns visibility
            afterlayout: me.afterHeaderCtLayout,
            scope: me
        });
        grid.on({
            beforerender: me.onBeforeGridRendered,
            afterrender: me.onAfterGridRendered,
            afterlayout: me.onGridLayout,
            scope: me,
            single: true
        });
    },

    destroy: function () {
        this.grid.summaryBar = null;
        this.callParent();
    },

    /**
     * @inheritDoc
     */
    setSummaryPosition: function (value) {
        var me = this,
            lockingPartner = me.lockingPartner,
            bar = me.getSummaryBar(),
            dock = me.dock;

        me.showSummary = (value === 'docked' && (dock === 'top' || dock === 'bottom'));
        bar.setHidden(!me.showSummary);
        if (lockingPartner) {
            lockingPartner.getSummaryBar().setHidden(!me.showSummary);
        }

        me.callParent([value]);
    },

    onBeforeGridRendered: function () {
        var me = this,
            view = me.view,
            grid = me.grid,
            dock = me.dock,
            pos = me.summaryPosition,
            tableCls = [me.summaryTableCls],
            showSummary;

        me.showSummary = showSummary = (pos === 'docked' && (dock === 'top' || dock === 'bottom'));

        if (view.columnLines) {
            tableCls[tableCls.length] = view.ownerCt.colLinesCls;
        }
        me.summaryBar = grid.addDocked({
            focusable: true,
            childEls: ['innerCt', 'item'],
            renderTpl: [
                '<div id="{id}-innerCt" data-ref="innerCt" role="presentation">',
                '<table id="{id}-item" data-ref="item" cellPadding="0" cellSpacing="0" class="' + tableCls.join(' ') + '">',
                '<tr class="' + me.summaryCls + '"></tr>',
                '</table>',
                '</div>'
            ],
            scrollable: {
                x: false,
                y: false
            },
            itemId: 'summaryBar',
            hidden: !showSummary,
            cls: [me.dockedSummaryCls, me.dockedSummaryCls + '-' + dock],
            xtype: 'component',
            dock: dock,
            weight: 10000000
        })[0];

        grid.summaryBar = me.summaryBar;
    },

    onAfterGridRendered: function () {
        var me = this,
            bar = me.summaryBar;

        me.onStoreUpdate();

        bar.innerCt.on({
            click: 'onBarEvent',
            dblclick: 'onBarEvent',
            contextmenu: 'onBarEvent',
            delegate: '.' + Ext.baseCSSPrefix + 'grid-cell',
            scope: me
        });
    },

    onGridLayout: function (grid) {
        var view = grid.getView(),
            scroller;

        if(view.isLockedView != null || view.isNormalView != null) {
            if(view.isLockedView) {
                scroller = view.ownerGrid.lockedScrollbarScroller;
            } else {
                scroller = view.ownerGrid.normalScrollbarScroller;
            }
        } else {
            scroller = view.getScrollable();
        }
        scroller.addPartner(this.summaryBar.getScrollable(), 'x');
    },

    getSummaryBar: function () {
        var me = this;

        if(!me.summaryBar) {
            me.onBeforeGridRendered();
            me.onAfterGridRendered();
        }
        return me.summaryBar;
    },

    setupRowValues: function (rowValues, renderData) {
        this.callParent([rowValues, renderData]);

        if(renderData.isSummary && this.showSummary) {
            Ext.Array.remove(rowValues.rowClasses, this.eventCls);
            rowValues.rowClasses.push('x-grid-row', this.summaryCls);
        }
    },

    onStoreUpdate: function() {
        var me = this,
            view = me.view,
            selector = me.summarySelector,
            record, newRowDom, oldRowDom, p, data;

        if (!view.rendered || !me.showSummary) {
            return;
        }

        record = view.getStore().getSummaryRecord();
        data = me.dataSource.renderData[record.getId()] = {
            isSummary: true
        };

        me.setRenderers(data);
        newRowDom = Ext.fly(view.createRowElement(record, -1)).down(selector, true);
        me.resetRenderers();

        if (!newRowDom) {
            return;
        }

        // Summary row is inside the docked summaryBar Component
        p = me.summaryBar.item.dom.firstChild;
        oldRowDom = p.firstChild;

        p.insertBefore(newRowDom, oldRowDom);
        p.removeChild(oldRowDom);
    },

    // Synchronize column widths in the docked summary Component or the inline summary row
    // depending on whether we are docked or not.
    afterHeaderCtLayout: function(headerCt) {
        var me = this,
            view = me.view,
            columns = view.getVisibleColumnManager().getColumns(),
            column,
            len = columns.length, i,
            summaryEl,
            el, width, innerCt;

        if (me.showSummary && view.refreshCounter) {
            // We purge the cache to solve a bug in the framework
            // A grouped column gets hidden while rendering the grid
            // and the summary cell is visible though the column is not
            headerCt.purgeCache();

            summaryEl = me.summaryBar.el;
            width = headerCt.getTableWidth();
            innerCt = me.summaryBar.innerCt;

            // Stretch the innerCt of the summary bar upon headerCt layout
            me.summaryBar.item.setWidth(width);

            // headerCt's tooNarrow flag is set by its layout if the columns overflow.
            // Must not measure+set in after layout phase, this is a write phase.
            if (headerCt.tooNarrow) {
                width += Ext.getScrollbarSize().width;
            }
            innerCt.setWidth(width);

            // If the layout was in response to a clearView, there'll be no summary element
            if (summaryEl) {
                for (i = 0; i < len; i++) {
                    column = columns[i];
                    el = summaryEl.down(view.getCellSelector(column), true);
                    if (el) {
                        Ext.fly(el).setWidth(column.width || (column.lastBox ? column.lastBox.width : 100));
                    }
                }
            }
        }
    },

    onBarEvent: function (e, cell) {
        var me = this,
            view = me.view,
            grid = view.ownerGrid,
            record = view.getStore().getSummaryRecord(),
            fireArg = Ext.apply({
                record: record,
                column: view.getHeaderByCell(cell),
                cell: cell,
                row: me.summaryBar.getEl(),
                grid: grid,
                feature: me,
                e: e
            }, me.dataSource.getRenderData(record));

        return grid.fireEvent('summary' + e.type, grid, fireArg);
    },

    privates: {
        getOwnerGridListeners: function () {
            var listeners = this.callParent();

            return Ext.apply(listeners, {
                columnmove: this.onStoreUpdate
            });
        },

        getStoreListeners: function () {
            var me = this,
                listeners = me.callParent();

            return Ext.apply(listeners, {
                update: me.onStoreUpdate,
                datachanged: me.onStoreUpdate,
                remotesummarieschanged: me.onStoreUpdate,
                summarieschanged: me.onStoreUpdate
            });
        }
    }

});