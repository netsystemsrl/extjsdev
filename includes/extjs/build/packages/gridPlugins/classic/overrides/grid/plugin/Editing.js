/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.grid.plugin.Editing', {
    override: 'Ext.grid.plugin.Editing',

    // before editing a cell we need to check if it's part of a summary or group header
    // and forbid that
    getEditingContext: function (record, columnHeader, horizontalScroll) {
        var context = this.callParent([record, columnHeader, horizontalScroll]);

        if(context && context.record && context.record.isNonData) {
            return;
        }
        return context;
    }
});