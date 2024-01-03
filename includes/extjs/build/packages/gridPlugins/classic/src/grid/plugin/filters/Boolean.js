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
 * This filter type uses a combobox with an array store to display
 * the boolean values
 */
Ext.define('Ext.grid.plugin.filters.Boolean', {
    extend: 'Ext.grid.plugin.filters.SingleFilter',
    alias: 'grid.filters.boolean',

    requires: [
        'Ext.form.field.ComboBox'
    ],


    type: 'boolean',

    operator: '==',
    operators: ['==', '!='],

    fieldDefaults: {
        xtype: 'combobox',
        queryMode: 'local',
        editable: true,
        forceSelection: true
    },

    trueText: 'Yes',
    falseText: 'No',
    trueValue: 1,
    falseValue: 0,

    getFieldConfig: function () {
        var me = this,
            config = me.callParent();

        config.store = [
            [me.trueValue, me.trueText],
            [me.falseValue, me.falseText]
        ];

        return config;
    }
});