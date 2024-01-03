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
 * This class is a grid {@link Ext.AbstractPlugin plugin} that adds a filter bar
 * below the grid column headers.
 *
 * # Example Usage
 *
 *     @example
 *     var shows = Ext.create('Ext.data.Store', {
 *         fields: ['id','show'],
 *         data: [
 *             {id: 0, show: 'Battlestar Galactica'},
 *             {id: 1, show: 'Doctor Who'},
 *             {id: 2, show: 'Farscape'},
 *             {id: 3, show: 'Firefly'},
 *             {id: 4, show: 'Star Trek'},
 *             {id: 5, show: 'Star Wars: Christmas Special'}
 *         ]
 *     });
 *
 *     Ext.create('Ext.grid.Panel', {
 *         renderTo: Ext.getBody(),
 *         title: 'Sci-Fi Television',
 *         height: 250,
 *         width: 250,
 *         store: shows,
 *         plugins: [
 *             "gridfilterbar"
 *         ],
 *         columns: [{
 *             dataIndex: 'id',
 *             text: 'ID',
 *             width: 50
 *         },{
 *             dataIndex: 'show',
 *             text: 'Show',
 *             flex: 1,
 *             filter: {
 *                 // required configs
 *                 type: 'string',
 *                 // optional configs
 *                 value: 'star',  // setting a value makes the filter active.
 *                 fieldDefaults: {
 *                     // any Ext.form.field.Text configs accepted
 *                 }
 *             }
 *         }]
 *     });
 *
 * # Features
 *
 * ## Filtering implementations
 *
 * Currently provided filter types are:
 *
 *   * `{@link Ext.grid.plugin.filters.Boolean boolean}`
 *   * `{@link Ext.grid.plugin.filters.Date date}`
 *   * `{@link Ext.grid.plugin.filters.List list}`
 *   * `{@link Ext.grid.plugin.filters.Number number}`
 *   * `{@link Ext.grid.plugin.filters.String string}`
 *
 *
 * ## Grid functions
 *
 * The following functions are added to the grid:
 * - showFilterBar - will make the filter bar visible
 * - hideFilterBar - will hide the filter bar
 *
 *
 */
Ext.define('Ext.grid.plugin.FilterBar', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.gridfilterbar',

    requires: [
        'Ext.grid.plugin.filters.String',
        'Ext.grid.plugin.filters.Date',
        'Ext.grid.plugin.filters.Number',
        'Ext.grid.plugin.filters.Boolean',
        'Ext.grid.plugin.filters.None',
        'Ext.grid.plugin.filters.List',
        'Ext.grid.plugin.filters.InList'
    ],

    config: {
        /**
         * @cfg {Boolean} hidden
         *
         * Should the filterbar be visible or hidden when created?
         */
        hidden: false,

        headerListeners: {
            columnshow: 'onColumnShow',
            columnhide: 'onColumnHide',
            add: 'onColumnAdd',
            remove: 'onColumnRemove',
            afterlayout: 'onHeaderLayout'
        },

        gridListeners: {
            reconfigure: 'onGridReconfigure',
            afterlayout: {
                fn: 'onGridLayout',
                single: true
            }
        }
    },

    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope:  'both',

    filterBarCls: Ext.baseCSSPrefix + 'grid-filterbar',
    filterCls: Ext.baseCSSPrefix + 'grid-filterbar-filtered-column',

    init: function (grid) {
        var me = this,
            headerCt = grid.headerCt;

        me.grid = grid;

        me.listenersHeader = headerCt.on(Ext.apply({
            scope: me,
            destroyable: me
        }, me.getHeaderListeners()));

        me.listenersGrid = grid.on(Ext.apply({
            scope: me,
            destroyable: me
        }, me.getGridListeners()));

        me.createFilterBar();
        me.initializeFilters(grid.columnManager.getColumns());
        me.setupGridFunctions();
    },

    destroy: function () {
        var me = this,
            grid = this.grid,
            mainGrid;

        if(grid) {
            mainGrid = grid.ownerGrid;
            if(mainGrid) {
                mainGrid.showFilterBar = mainGrid.hideFilterBar = null;
            }
            grid.showFilterBar = grid.hideFilterBar = null;
        }
        Ext.destroy(me.listenersGrid, me.listenersHeader, me.bar);
        me.callParent();
    },

    setupGridFunctions: function () {
        var me = this,
            grid = me.grid,
            mainGrid;

        if(grid) {
            if(grid.isLocked){
                mainGrid = grid.ownerGrid;
                mainGrid.showFilterBar = Ext.bind(me.showFilterBarPartners, me);
                mainGrid.hideFilterBar = Ext.bind(me.hideFilterBarPartners, me);
            }

            grid.showFilterBar = Ext.bind(me.showFilterBar, me);
            grid.hideFilterBar = Ext.bind(me.hideFilterBar, me);
        }
    },

    showFilterBar: function () {
        var barScroller = this.bar.getScrollable();

        if(this.isDestroyed) {
            return;
        }
        this.bar.show();
        barScroller.syncWithPartners();
    },

    hideFilterBar: function () {
        if(this.isDestroyed) {
            return;
        }
        this.bar.hide();
    },

    showFilterBarPartners: function () {
        this.showFilterBar();
        this.lockingPartner.showFilterBar();
    },

    hideFilterBarPartners: function () {
        this.hideFilterBar();
        this.lockingPartner.hideFilterBar();
    },

    createFilterBar: function () {
        var me = this;

        me.bar = me.grid.addDocked({
            weight: 100,
            xtype: 'container',
            hidden: me.getHidden(),
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            childEls: ['innerCt'],
            scrollable: {
                x: false,
                y: false
            }
        })[0];

        me.bar.addCls([me.filterBarCls, Ext.baseCSSPrefix + 'grid-header-ct']);
    },

    initializeFilters: function (columns) {
        var len = columns.length,
            i, filter;

        for(i = 0; i < len; i++) {
            filter = this.createColumnFilter(columns[i]);
            this.bar.add(filter.getField());
        }
    },

    onGridLayout: function (grid) {
        var view = grid.getView(),
            barScroller = this.bar.getScrollable(),
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
        scroller.addPartner(barScroller, 'x');
        // when bar scrollbar is moving due to tabbing through fields
        // then we need to keep the grid header in sync
        barScroller.addPartner(grid.headerCt.getScrollable(), 'x');
        barScroller.addPartner(view.getScrollable(), 'x');
        if(grid.summaryBar) {
            barScroller.addPartner(grid.summaryBar.getScrollable(), 'x');
        }
    },

    onHeaderLayout: function () {
        this.resizeFilters();
        this.adjustFilterBarSize();
    },

    onGridReconfigure: function (grid, store, columns) {
        if(store) {
            this.resetFilters();
        }
    },

    onColumnAdd: function (header, column, index) {
        var filter = column.filter;

        if(!filter || !filter.isGridFilter) {
            filter = this.createColumnFilter(column);
        }
        this.bar.insert(index, filter.getField());
        this.adjustFilterBarSize();
    },

    onColumnRemove: function () {
        this.adjustFilterBarSize();
    },

    onColumnShow: function (header, column) {
        this.setFilterVisibility(column, true);
    },

    onColumnHide: function (header, column) {
        this.setFilterVisibility(column, false);
    },

    setFilterVisibility: function (column, visible) {
        var filter = column.filter,
            field = filter && filter.isGridFilter ? filter.getField() : null;

        if(field) {
            field[visible ? 'show' : 'hide']();
        }
    },

    resizeFilters: function () {
        var columns = this.grid.columnManager.getColumns(),
            len = columns.length,
            i, filter;

        for(i = 0; i < len; i++) {
            filter = columns[i].filter;
            if(filter && filter.isGridFilter) {
                filter.resizeField();
            }
        }
    },

    adjustFilterBarSize: function () {
        var bar = this.bar,
            headerCt = this.grid.headerCt,
            width;

        if(bar.rendered) {
            width = bar.innerCt.getWidth();
            if (headerCt.tooNarrow) {
                width += Ext.getScrollbarSize().width;
            }
            bar.innerCt.setWidth(width);
        }
    },

    createColumnFilter: function (column) {
        var filter = column.filter,
            config = {
                grid: this.grid,
                column: column,
                owner: this
            };

        if(!filter) {
            config.type = 'none';
            filter = Ext.Factory.gridFilters(config);
        } else if(!filter.isGridFilter) {
            if(Ext.isString(filter)) {
                config.type = filter;
            } else {
                Ext.apply(config, filter);
            }
            filter = Ext.Factory.gridFilters(config);
        }

        column.filter = filter;
        return filter;
    },

    resetFilters: function () {
        var columns = this.grid.columnManager.getColumns(),
            len = columns.length,
            i, filter;

        for(i = 0; i < len; i++) {
            filter = columns[i].filter;
            if(filter && filter.isGridFilter) {
                filter.resetFilter();
            }
        }
    }

});