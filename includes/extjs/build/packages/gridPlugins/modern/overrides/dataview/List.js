/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.dataview.List', {
    override: 'Ext.dataview.List',

    updateStore: function (store, oldStore) {
        var me = this,
            groupers;

        me.callSuper([store, oldStore]);

        if (store) {
            // If grouped was explicitly set, then it shouldn't be changed.
            if (me.isConfiguring && this.getGrouped() != null) {
                return;
            }

            groupers = store.getGroupers();
            this.setGrouped( !!(groupers && groupers.length) );
        }
    },

    privates: {
        isGrouping: function() {
            var store = this.getGrouped() && this.store,
                groupers = store && store.getGroupers();

            return !!(groupers && groupers.length);
        },

        refreshGroupIndices: function() {
            var me = this,
                store = me.store,
                groups = me.isGrouping() ? store.getGroups() : null,
                groupingInfo = me.groupingInfo,
                footers = groupingInfo.footers,
                headers = groupingInfo.headers,
                groupCount = groups && groups.length;

            me.groups = groups;

            if (groupCount) {
                headers.map = {};
                headers.indices = [];
                footers.map = {};
                footers.indices = [];

                this.refreshBottomGroupIndices(groups);
            } else {
                headers.map = headers.indices = footers.map = footers.indices = null;
            }
        },

        refreshBottomGroupIndices: function (groups) {
            var length = groups.length,
                store = this.store,
                groupingInfo = this.groupingInfo,
                footers = groupingInfo.footers,
                headers = groupingInfo.headers,
                headerMap = headers.map,
                headerIndices = headers.indices,
                footerMap = footers.map,
                footerIndices = footers.indices,
                bottom = false,
                i, group, children, firstRecordIndex, previous;

            for(i = 0; i < length; i++) {
                group = groups.getAt(i);
                children = group.getGroups();

                if (children && children.length) {
                    previous = this.refreshBottomGroupIndices(children);
                } else {
                    // we reached the bottom group
                    bottom = true;
                    firstRecordIndex = store.indexOf(group.first());

                    headerIndices.push(firstRecordIndex);
                    headerMap[firstRecordIndex] = group;

                    if (previous) {
                        footerIndices.push(firstRecordIndex - 1);
                        footerMap[firstRecordIndex - 1] = previous;
                    }

                    previous = group;
                }
            }

            if(bottom) {
                i = store.indexOf(group.last());
                footerIndices.push(i);
                footerMap[i] = group;
            }

            return previous;
        }

    }
});