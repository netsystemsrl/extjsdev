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
 * @private
 */
Ext.define('Ext.grid.plugin.filters.SingleFilter', {
    extend: 'Ext.grid.plugin.filters.Base',

    initFilter: function (config) {
        var me = this,
            filter, value;

        value = me.value;
        filter = me.getStoreFilter();

        if (filter) {
            // This filter was restored from stateful filters on the store so enforce it as active.
            me.active = true;
            me.setOperator(filter.getOperator());
        } else {
            // Once we've reached this block, we know that this grid filter doesn't have a stateful filter, so if our
            // flag to begin saving future filter mutations is set we know that any configured filter must be nulled
            // out or it will replace our stateful filter.
            if (me.grid.stateful && me.getGridStore().saveStatefulFilters) {
                value = undefined;
            }

            me.active = me.getActiveState(config, value);

            filter = me.createFilter({
                operator: me.operator,
                value: value
            });

            if (me.active) {
                me.addStoreFilter(filter);
            }
        }

        if (me.active) {
            me.setColumnActive(true);
        }

        me.filter = filter;
    },

    setValue: function (value) {
        var me = this;

        me.filter.setValue(value);

        if(Ext.isEmpty(value)) {
            me.setActive(false);
        } else if(me.active) {
            me.value = value;
            me.updateStoreFilter();
        } else {
            me.setActive(true);
        }
    },

    activate: function () {
        this.addStoreFilter(this.filter);
    },

    deactivate: function () {
        this.removeStoreFilter(this.filter);
    },

    resetFilter: function () {
        var me = this,
            filter = me.getStoreFilter(),
            field = me.getField(),
            value;

        if(filter) {
            me.active = true;
            value = filter.getValue();
            me.setOperator(filter.getOperator());

        }

        field.suspendEvents();
        field.setValue(value);
        field.resumeEvents(true);
    }

});