/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.grid.SummaryRows', {
    extend: 'Ext.Container',
    xtype: 'gridsummaryrows',

    requires: [
        'Ext.grid.plugin.SummaryRow'
    ],

    isSummaryRow: true,

    config: {
        group: null
    },

    updateGroup: function () {
        this.syncSummary();
    },

    getColumns: function () {
        return this.getParent().getColumns();
    },

    getHeaderContainer: function () {
        return this.getParent().getHeaderContainer();
    },

    getGrid: function () {
        return this.getParent();
    },

    privates: {
        syncSummary: function () {
            var me = this,
                group = me.getGroup(),
                items = me.items,
                owner, i, parent, item, groups;

            if(items.length) {
                while (items.length > 1) {
                    item = me.getAt(1);
                    delete(item.getGrid);
                    delete(item.getParent);
                    me.remove(item);
                }
            } else {
                parent = me.getParent();
                item = me.add({
                    $initParent: parent,
                    ownerCmp: parent,
                    grid: parent,
                    xtype: 'gridsummaryrow'
                });

                item.getGrid = item.getParent = Ext.bind(me.getGrid, me);
            }

            if(!group) {
                return;
            }

            items.getAt(0).setGroup(group);

            owner = group.getParent();

            // if I'm the last group in the parent group then add a new summary
            groups = owner.getGroups();
            if(owner && owner.isGroup && groups && groups.last() === group) {
                while (owner && owner.isGroup) {
                    parent = me.getParent();
                    item = me.add({
                        $initParent: parent,
                        ownerCmp: parent,
                        list: parent,
                        xtype: 'gridsummaryrow'
                    });
                    item.getGrid = item.getParent = Ext.bind(me.getGrid, me);
                    item.setGroup(owner);
                    owner = owner.getParent();
                }
            }

            me.$height = null;
            me.getParent().variableHeights = true;
        }
    } // privates


});