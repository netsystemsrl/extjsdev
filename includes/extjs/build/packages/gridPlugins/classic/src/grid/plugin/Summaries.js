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
* This plugin allows users to change summaries on grid columns using:
 * - a context menu on the summary row cell
 * - a header menu entry
 *
 * On each column of the grid you can define what summary functions are available
 * to the user by configuring {@link Ext.grid.column.Column#summaries}. They will
 * be displayed
*/
Ext.define('Ext.grid.plugin.Summaries', {
    extend: 'Ext.AbstractPlugin',

    alias: 'plugin.summaries',

    requires: [
        'Ext.data.summary.*',
        'Ext.menu.Menu',
        'Ext.menu.CheckItem'
    ],

    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope:  'top',

    /**
     * @cfg {Boolean} [enableContextMenu=true]
     * True to enable the summary grid cell context menu.
     */
    enableContextMenu: true,
    /**
     * @cfg {Boolean} [enableSummaryMenu=true]
     * True to enable the summary menu items in the header menu.
     */
    enableSummaryMenu: true,

    textNone: 'None',
    summaryText: 'Summary',
    
    init: function(grid){
        var me = this;

        /**
         * Fires before showing the summary context menu. Return false if you want to hide the menu.
         *
         * @event beforeshowsummarycontextmenu
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Object} options An object that has keys to help you out
         * @param {Ext.EventObject} e Event object
         */

        /**
         * Fires after showing the summary context menu.
         *
         * @event showsummarycontextmenu
         * @param {Ext.grid.Panel} grid The grid panel instance
         * @param {Object} options An object that has keys to help you out
         * @param {Ext.EventObject} e Event object
         */

        me.callParent([grid]);
        
        me.grid = grid;

        me.gridListeners = me.grid.on({
            groupcontextmenu: me.onGroupContextMenu,
            groupsummarycontextmenu: me.onGroupSummaryContextMenu,
            summarycontextmenu: me.onSummaryContextMenu,
            collectheadermenuitems: me.onCollectMenuItems,
            showheadermenuitems: me.onShowHeaderMenu,
            scope: me,
            destroyable: true
        });
    },
    
    destroy: function(){
        var me = this;
        
        Ext.destroyMembers(me, 'gridListeners', 'contextMenu');
        me.grid = null;
        
        me.callParent();
    },
    
    onGroupContextMenu: function(grid, params) {
        var pos = params.feature.groupSummaryPosition;

        if(pos === 'hide') {
            return;
        }
        if(pos === 'top' || (params.group.isCollapsed && pos === 'bottom')) {
            this.showMenu(params);
        }
    },

    onGroupSummaryContextMenu: function(grid, params) {
        this.showMenu(params);
    },

    onSummaryContextMenu: function(grid, params){
        this.showMenu(params);
    },

    showMenu: function(params) {
        var me = this,
            grid = params.grid,
            target = params.cell,
            column = params.column,
            groupIndex = params.feature.groupingColumn && params.feature.groupingColumn.getIndex(),
            e = params.e,
            menu, options;

        if(!me.enableContextMenu || !column.dataIndex || (groupIndex >= 0 && groupIndex >= column.getIndex())) {
            return;
        }

        menu = me.getSummaryMenu(params);
        if(!menu) {
            return;
        }

        Ext.destroy(me.contextMenu);

        menu = me.contextMenu = Ext.menu.Manager.get(menu);

        options = {
            menu: menu,
            params: params
        };

        if(grid.fireEvent('beforeshowsummarycontextmenu', me, options) !== false) {
            menu.showBy(target);
            menu.focus();
            grid.fireEvent('showsummarycontextmenu', me, options);
        }else{
            Ext.destroy(menu);
        }
        e.stopEvent();
    },

    getSummaryMenu: function (params) {
        var me = this,
            summaries = params.column.getListOfSummaries(),
            summaryType = me.getSummaryFieldType(params.column.dataIndex),
            items = [{
                text: me.textNone,
                summary: null,
                checked: !summaryType
            }],
            i, len, fns, value;

        fns = me.fns = me.fns || {};

        if(!summaries || !summaries.length) {
            return false;
        }

        len = summaries.length;
        for(i = 0; i < len; i++) {
            value = summaries[i];

            if(!fns[value]) {
                fns[value] = Ext.Factory.dataSummary(value);
            }

            items.push({
                text: fns[value].text,
                summary: fns[value],
                checked: (summaryType === fns[value].type)
            });
        }

        return {
            defaults: {
                xtype: 'menucheckitem',
                column: params.column,
                dataIndex: params.column.dataIndex,
                handler: me.onChanceSummary,
                group: 'summaries',
                scope: me
            },
            items: items
        };
    },

    onChanceSummary: function (menu) {
        var store = this.grid.getStore(),
            column = menu.column,
            model = store.model.getSummaryModel();

        // if this plugin is active then we don't need to monitor summaryType
        // in the MultiGrouping feature
        column.summaryType = null;
        if(column.onSummaryChange) {
            // this function is useful to change the summary renderer/formatter
            column.onSummaryChange(menu.summary);
        }
        model.setSummary(menu.dataIndex, menu.summary);

        if(store.getRemoteSummary()) {
            store.reload();
        } else if(model) {
            store.fireEvent('summarieschanged', store);
        }
    },

    getSummaryFieldType: function (name) {
        var store = this.grid.getStore(),
            model = store.model.getSummaryModel(),
            field = model.getField(name),
            summary = field ? field.getSummary() : false;

        return summary ? summary.type : false;
    },

    onCollectMenuItems: function (grid, params) {
        params.items.push({
            text: this.summaryText,
            itemId: 'summaryMenuItem'
        });
    },

    onShowHeaderMenu: function (grid, params) {
        var menuItem = params.menu.down('#summaryMenuItem');

        if(!menuItem) {
            return;
        }

        menuItem.setVisible(!params.column.isGroupsColumn);
        menuItem.setMenu(this.getSummaryMenu(params));
    }

});