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
 * You can use this filter type to add an `in` or `notin` type of filter.
 *
 * You need to provide the `options` that the user can choose from.
 */
Ext.define('Ext.grid.plugin.filters.InList', {
    extend: 'Ext.grid.plugin.filters.SingleFilter',
    alias: 'grid.filters.inlist',

    requires: [
        'Ext.form.field.Tag'
    ],

    config: {
        /**
         * @cfg {String[]/Ext.data.Store} options
         *
         * An array of values or a store configuration
         */
        options: null
    },

    type: 'inlist',

    operator: 'in',
    operators: ['in', 'notin'],

    fieldDefaults: {
        xtype: 'tagfield',
        queryMode: 'local',
        forceSelection: true,
        selectOnFocus: false,
        editable: false,
        filterPickList: true
    },

    getFieldConfig: function () {
        var config = this.callParent();

        config.store = this.getOptions() || [];

        return config;
    },

    onFieldRender: function (field) {
        this.callParent([field]);
        if(field.isXType('tagfield') && !field.getEditable() && field.inputElCt) {
            field.inputElCt.setDisplayed(false);
        }
    }
});