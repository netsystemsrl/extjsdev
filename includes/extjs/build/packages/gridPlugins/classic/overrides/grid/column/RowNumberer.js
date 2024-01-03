/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.grid.column.RowNumberer', {
    override: 'Ext.grid.column.RowNumberer',

    // dataSource should be used instead of store
    defaultRenderer: function(value, metaData, record, rowIdx, colIdx, dataSource, view) {
        var me = this,
            rowspan = me.rowspan,
            page = dataSource.currentPage,
            // result = record ? view.store.indexOf(record) : value - 1;
            result = record ? dataSource.indexOf(record) : value - 1;

        if (metaData && rowspan) {
            metaData.tdAttr = 'rowspan="' + rowspan + '"';
        }

        if (page > 1) {
            result += (page - 1) * dataSource.pageSize;
        }
        return result + 1;
    }
});