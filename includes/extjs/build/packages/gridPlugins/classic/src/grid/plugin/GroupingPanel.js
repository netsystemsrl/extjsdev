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
 *  This plugin enables a grouping panel above the grid to allow easy grouping.
 *
 *  It adds the following methods to the grid panel instance:
 *
 *  - showGroupingPanel
 *  - hideGroupingPanel
 */
Ext.define('Ext.grid.plugin.GroupingPanel', {
    extend: 'Ext.AbstractPlugin',

    alias: 'plugin.groupingpanel',

    requires: [
        'Ext.grid.plugin.grouping.Panel'
    ],

    config: {
        panel: {
            xtype: 'groupingpanel',
            columnConfig: {
                xtype: 'groupingpanelcolumn'
            }
        },
        grid: null,
        view: null
    },

    /**
     *  `"both"` (the default) - The plugin is added to both grids
     *  `"top"` - The plugin is added to the containing Panel
     *  `"locked"` - The plugin is added to the locked (left) grid
     *  `"normal"` - The plugin is added to the normal (right) grid
     *
     * @private
     */
    lockableScope:  'top',

    init: function (grid) {
        this.setGrid(grid);
    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function () {
        this.setConfig({
            grid: null,
            view: null,
            panel: null
        });
        this.callParent();
    },

    enable: function () {
        this.disabled = false;
        this.showGroupingPanel();
    },

    disable: function () {
        this.disabled = true;
        this.hideGroupingPanel();
    },

    /**
     * Show the grouping panel
     */
    showGroupingPanel: function () {
        var view;

        this.setup();
        view = this.getView();

        view.show();
    },

    /**
     * Hide the grouping panel
     */
    hideGroupingPanel: function () {
        var view;

        this.setup();
        view = this.getView();

        view.hide();
    },

    toggleGroupingPanel: function () {
        var view;

        this.setup();
        view = this.getView();

        view.setHidden(!view.isHidden());
    },

    updateGrid: function (grid, oldGrid) {
        var me = this;

        Ext.destroy(me.gridListeners);

        if(oldGrid) {
            oldGrid.showGroupingPanel = oldGrid.hideGroupingPanel = null;
        }

        if(grid) {
            //<debug>
            if(!grid.isXType('gridpanel')) {
                Ext.raise('This plugin is only compatible with grid components');
            }
            //</debug>
            grid.showGroupingPanel = Ext.bind(me.showGroupingPanel, me);
            grid.hideGroupingPanel = Ext.bind(me.hideGroupingPanel, me);

            if(grid.rendered) {
                me.onAfterGridRendered();
            } else {
                me.gridListeners = grid.on({
                    afterrender: me.onAfterGridRendered,
                    single: true,
                    scope: me,
                    destroyable: true
                });
            }

            me.injectGroupingMenu();
        }
    },

    updateView: function (view, oldView) {
        var panel;

        Ext.destroy(oldView);

        if(view) {
            panel = view.isXType('groupingpanel') ? view : view.down('groupingpanel');

            if(panel) {
                panel.setConfig({
                    grid: this.getGrid()
                });
            }
            //<debug>
            else{
                Ext.raise('Wrong panel configuration! No "groupingpanel" component available');
            }
            //</debug>
        }
    },

    onAfterGridRendered: function () {
        var me = this;

        if (me.disabled === true) {
            me.disable();
        } else {
            me.enable();
        }
    },

    injectGroupingMenu: function() {
        var me = this,
            headerCt = me.getGrid().headerCt;

        // "getMenuItems" is only called once on the grid header container
        // so we need to inject our fn before the grid is rendered

        headerCt.showMenuBy = Ext.Function.createInterceptor(headerCt.showMenuBy, me.showMenuBy);
        headerCt.getMenuItems = me.getMenuItems();
    },

    showMenuBy: function(clickEvent, t, header) {
        var me = this,
            menuItem = me.getMenu().down('#groupingPanel'),
            panel = me.grid.down('groupingpanel');

        if(panel && menuItem) {
            menuItem.setText(panel.isHidden() ? panel.showGroupingPanelText : panel.hideGroupingPanelText);
        }
    },

    getMenuItems: function() {
        var me = this,
            view = me.getView(),
            getMenuItems = me.getGrid().headerCt.getMenuItems;

        // runs in the scope of headerCt
        return function() {

            // We cannot use the method from HeaderContainer's prototype here
            // because other plugins or features may already have injected an implementation
            var o = getMenuItems.call(this);

            o.push('-', {
                iconCls: view ? view.groupingPanelIconCls : Ext.baseCSSPrefix + 'grid-group-panel-icon',
                itemId: 'groupingPanel',
                text: me.groupsText,
                handler: me.toggleGroupingPanel,
                scope: me
            });

            return o;
        };
    },

    privates: {
        setup: function () {
            var me = this,
                ret;

            if (me.doneSetup) {
                return;
            }
            me.doneSetup = true;

            ret = me.getGrid().addDocked(me.getPanel());
            ret = ret && ret.length ? ret[0] : ret;
            me.setView(ret);
        }
    }


});