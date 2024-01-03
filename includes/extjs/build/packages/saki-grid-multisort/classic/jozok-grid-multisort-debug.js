// vim: sw=4:ts=4:nu:nospell:fdc=4
/*global Ext:true, GD:true */
/*jslint browser: true, devel:true, sloppy: true, white: true, plusplus: true */
/**
 * # Grid MultiSort Feature by Jozok
 *
 * @author Jozef Kejst
 * @date 24.2.2015
 * @copyright (c) 2014, Jozef Kejst
 * @license This file is proprietary and it is only
 * meant to be run as a part of Sencha Examples application.
 * All other uses (reading, copying, reverse engineering
 * to name a few) are prohibited.
 */
Ext.define('Ext.jozok.grid.MultiSort', {
    extend: 'Ext.grid.feature.Feature',
    alternateClassName: 'Ext.ux.grid.MultiSort',
    alias: [
        'feature.ux-gmsrt',
        'feature.jozok-gmsrt'
    ],
    /**
     * @cfg removeSortText
     */
    removeSortText: "Remove from Sort",
    /**
     * @cfg displaySortOrder
     * flag to display counters in column header for sorting order
     */
    displaySortOrder: false,
    config: {
        /**
         * sortersCount
         * total count of sortered columns
         */
        sortersCount: 0
    },
    /**
     * function init
     * Attach events to view and view header container
     */
    init: function(grid) {
        var me = this,
            view = me.view,
            headerCt = view.headerCt;
        me.callParent(arguments);
        view.on({
            afterrender: {
                fn: me.afterViewRender,
                scope: me
            }
        });
        headerCt.on({
            headerclick: {
                fn: me.onHeaderClick,
                scope: me
            }
        });
        headerCt.onHeaderCtEvent = function(e, t) {
            var oldSortClickVal = headerCt.sortOnClick;
            if (e.altKey) {
                headerCt.sortOnClick = false;
            }
            Ext.grid.header.Container.prototype.onHeaderCtEvent.apply(headerCt, [
                e,
                t
            ]);
            headerCt.sortOnClick = oldSortClickVal;
        };
    },
    /**
     * function afterViewRender
     * change sorting grid panel submenu and add new for remove column from sorting
     * update sortered columns in grid (depend on stateful grid property)
     *
     */
    afterViewRender: function() {
        var me = this;
        me.injectMultiSortMenu();
        if (!me.grid.viewModel) {
            me.updateSorteredColumns();
        } else {
            me.setSortersCount(0);
        }
    },
    /**
     * function onHeaderClick
     * listener for grid header click event
     */
    onHeaderClick: function(ct, column, e) {
        var me = this,
            store = me.view.getStore(),
            sorter,
            direction = 'ASC',
            version = Ext.versions.extjs.major;
        // first remove old labels from column header
        me.removeOldSorterLabels();
        // shift pressed has special functionality only in extjs 5
        if (e.altKey && version > 4) {
            // check if column is in sorters
            sorter = store.sorters.getByKey(column.dataIndex);
            if (sorter) {
                // change direction only
                if (sorter.direction !== 'DESC') {
                    sorter.setDirection('DESC');
                } else {
                    sorter.setDirection('ASC');
                }
                column.setSortState(sorter);
                store.sort();
            } else {
                // add to sorting with ASC direction
                column.setSortState(sorter);
                column.enableRemSortItem = true;
                me.setSortersCount(me.getSortersCount() + 1);
                store.sort(column.dataIndex, direction, 'append');
            }
        }
        me.updateSorteredColumns();
    },
    /**
     * function injectMultiSortMenu
     */
    injectMultiSortMenu: function() {
        var me = this,
            headerCt = me.view.headerCt;
        if (headerCt.sortable) {
            headerCt.getMenuItems = me.getMenuItems();
            headerCt.getMenu().on({
                beforeshow: function(menu) {
                    menu.down('#remSortItem').setDisabled(!menu.activeHeader.enableRemSortItem);
                }
            });
        }
    },
    // eo function injectMultiSortMenu
    /**
     * function removeOldSorterlabels
     */
    removeOldSorterLabels: function() {
        var me = this,
            headerCt = me.view.headerCt;
        Ext.each(headerCt.getGridColumns(), function(column) {
            column.enableRemSortItem = false;
            if (me.displaySortOrder) {
                column.setText(column.text.split(' <small>(')[0]);
            }
        });
    },
    /**
     * function updateSorteredColumns
     * function to update counter labels and enable/disable remove sort submenu for sortered columns
     */
    updateSorteredColumns: function() {
        var me = this,
            store = me.view.getStore(),
            activeHeader,
            sorters = store.sorters,
            sorter, text, dataIndex, i;
        me.setSortersCount(sorters.getCount());
        for (i = 0; i < me.getSortersCount(); i++) {
            sorter = sorters.getAt(i);
            dataIndex = sorter.property || sorter.getProperty();
            activeHeader = me.view.headerCt.down('[dataIndex=' + dataIndex + ']');
            if (activeHeader) {
                activeHeader.enableRemSortItem = true;
                //activeHeader.setSortState(sorter.direction,true,true);
                me.setSortState(activeHeader, sorter);
                if (me.displaySortOrder) {
                    text = activeHeader.text.split(' <small>');
                    activeHeader.setText(text[0] + ' <small>(' + (i + 1) + ')</small>');
                }
            }
        }
    },
    // eo function updateSorteredColumns
    /**
     * function getMenuItems
     * update exisiting grid column menu with new functionality
     */
    getMenuItems: function() {
        var me = this,
            headerCt = me.view.headerCt,
            getMenuItems = headerCt.getMenuItems;
        // runs in the scope of headerCt
        return function() {
            // We cannot use the method from HeaderContainer's prototype here
            // because other plugins or features may already have injected an implementation
            var o = getMenuItems.call(this),
                index = o.length;
            Ext.each(o, function(item, idx) {
                if (item.itemId === 'ascItem') {
                    item.text = 'Add ' + item.text;
                    item.handler = me.onSortAscClick;
                    item.scope = me;
                }
                if (item.itemId === 'descItem') {
                    item.text = 'Add ' + item.text;
                    item.handler = me.onSortDescClick;
                    item.scope = me;
                    index = idx + 1;
                }
            });
            Ext.Array.insert(o, index, [
                {
                    itemId: 'remSortItem',
                    text: me.removeSortText,
                    iconCls: me.menuSortDescCls,
                    handler: me.onRemoveSortClick,
                    disabled: true,
                    scope: me
                }
            ]);
            return o;
        };
    },
    // eo function getMenuItems
    /**
     * function onRemoveSortClick
     * remove one column form sorting
     */
    onRemoveSortClick: function() {
        var me = this,
            headerCt = me.view.headerCt,
            menu = headerCt.getMenu(),
            activeHeader = menu.activeHeader,
            dataIndex = activeHeader.dataIndex,
            store = me.view.getStore(),
            sorters = store.sorters,
            text = activeHeader.text.split(' <small>('),
            ascCls = activeHeader.ascSortCls,
            descCls = activeHeader.descSortCls,
            version = Ext.versions.extjs.major,
            sorter;
        //activeHeader.setSortState(null);
        activeHeader.removeCls([
            ascCls,
            descCls
        ]);
        sorter = sorters.getByKey(dataIndex);
        if (sorter) {
            // sencha ext 5.0.1 bug
            if (!(version < 5)) {
                sorter.isFilter = true;
            }
            sorters.removeAtKey(dataIndex);
        }
        headerCt.fireEvent('sortchange', headerCt, activeHeader);
        if (version < 5) {
            store.sort();
        }
        // for counters displayed we must set new order to column
        // or only remove enableRemSort submenu for this column
        if (me.displaySortOrder) {
            activeHeader.setText(text[0]);
            me.updateSorteredColumns();
        }
        activeHeader.enableRemSortItem = false;
        // if sorters is empty we load remote sorting store without sorting
        if (sorters.length === 0 && store.remoteSort) {
            store.load();
        }
    },
    // eo function onRemoveSortClick
    /**
     * function onSortClick
     * add new column to sorting
     * @param bool direction
     */
    onSortClick: function(direction) {
        var me = this,
            menu = me.view.headerCt.getMenu(),
            activeHeader = menu.activeHeader,
            dataIndex = activeHeader.dataIndex,
            text = activeHeader.text.split(' <small>('),
            store = me.view.getStore(),
            sorters = store.sorters,
            sorter = sorters.getByKey(dataIndex),
            version = Ext.versions.extjs.major;
        if (version < 5) {
            activeHeader.setSortState(direction, true, true);
        } else if (sorter) {
            activeHeader.setSortState(sorter);
        }
        activeHeader.enableRemSortItem = true;
        // special case is when we change sort direction
        // selected column will be move to last position and we must update counter labels
        if (sorter) {
            sorters.removeAtKey(dataIndex);
            if (me.displaySortOrder) {
                activeHeader.setText(text[0]);
                me.updateSorteredColumns();
            }
        }
        me.setSortersCount(me.getSortersCount() + 1);
        if (me.displaySortOrder) {
            activeHeader.setText(activeHeader.text + ' <small>(' + me.getSortersCount() + ')</small>');
        }
        if (version < 5) {
            sorters.add(Ext.create('Ext.util.Sorter', {
                property: dataIndex,
                direction: direction,
                id: dataIndex
            }));
            if (store.remoteSort) {
                store.sort();
            } else {
                me.sortLocalSortingStore();
            }
        } else {
            store.sort(dataIndex, direction, 'append');
        }
    },
    // eo function onSortClick
    /**
     * function onSortAscClick
     * listeners for sort submenu
     */
    onSortAscClick: function() {
        this.onSortClick('ASC');
    },
    // eo function onSortAscClick
    /**
     * function onSortDescClick
     * listener for sort submenu
     */
    onSortDescClick: function() {
        this.onSortClick('DESC');
    },
    // eo function onSortDescClick
    setSortState: function(column, sorter) {
        var version = Ext.versions.extjs.major;
        if (version < 5) {
            column.setSortState(sorter.direction, true, true);
        } else if (sorter) {
            column.setSortState(sorter);
        }
    },
    /**
     * function sortLocalSortingStore
     */
    sortLocalSortingStore: function() {
        var me = this,
            store = me.view.getStore(),
            sorters = store.sorters,
            sorter,
            sortItems = [],
            i, property, direction;
        for (i = 0; i < sorters.getCount(); i++) {
            sorter = sorters.getAt(i);
            property = sorter.property || sorter.getProperty();
            direction = sorter.direction || sorter.getDirection();
            sortItems.push({
                property: property,
                direction: direction
            });
        }
        sortItems.push({
            property: property,
            direction: direction
        });
        store.sort(sortItems);
    }
});

