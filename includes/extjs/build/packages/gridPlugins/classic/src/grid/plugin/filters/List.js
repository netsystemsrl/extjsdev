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
 * This filter type will provide a combobox with a store. The options available in the store
 * can be configured.
 *
 * If no options are provided then they are extracted from the grid store
 */
Ext.define('Ext.grid.plugin.filters.List', {
    extend: 'Ext.grid.plugin.filters.SingleFilter',
    alias: 'grid.filters.list',

    requires: [
        'Ext.form.field.ComboBox'
    ],

    config: {
        /**
         * @cfg {String[]/Ext.data.Store} options
         *
         * An array of values or a store configuration
         */
        options: null
    },

    type: 'list',

    operator: '==',
    operators: ['==', '!='],

    fieldDefaults: {
        xtype: 'combobox',
        queryMode: 'local',
        forceSelection: true,
        editable: true,
        matchFieldWidth: false
    },

    constructor: function (config) {
        var me = this,
            options;

        me.callParent([config]);

        options = me.getOptions();

        if(!options) {
            me.monitorStore(me.getGridStore());
        }
    },

    destroy: function () {
        Ext.destroy(this.storeListeners);
        this.callParent();
    },

    monitorStore: function (store) {
        var me = this;

        Ext.destroy(me.storeListeners);
        me.storeListeners = store.on({
            add: 'resetFieldStore',
            remove: 'resetFieldStore',
            load: 'resetFieldStore',
            scope: me,
            destroyable: true
        });
    },

    getFieldConfig: function () {
        var config = this.callParent();

        config.store = this.createOptionsStore();

        return config;
    },

    createOptionsStore: function () {
        var me = this,
            options = me.getOptions(),
            store = me.getGridStore();

        if(!options) {
            // no options provided so we need to extract them from the grid store
            options = Ext.Array.sort(store.collect(me.getDataIndex(), false, true));
        }

        return options;
    },

    resetFieldStore: function () {
        var me = this,
            field = me.getField();

        if(field) {
            field.setStore(me.createOptionsStore());
            if(me.active) {
                field.suspendEvents();
                field.setValue(me.filter.getValue());
                field.resumeEvents(true);
            }
        }
    }

});