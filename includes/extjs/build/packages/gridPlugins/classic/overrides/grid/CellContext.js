/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.grid.CellContext', {
    override: 'Ext.grid.CellContext',

    setRow: function(row) {
        var me = this,
            dataSource = me.view.dataSource,
            oldRecord = me.record,
            count;

        if (row !== undefined) {
            // Row index passed, < 0 meaning count from the tail (-1 is the last, etc)
            if (typeof row === 'number') {
                count = dataSource.getCount();
                row = row < 0 ? Math.max(count + row, 0) : Math.max(Math.min(row, count - 1), 0);

                me.rowIdx = row;
                me.record = dataSource.getAt(row);
            }
            // row is a Record
            else if (row.isModel) {
                me.record = row;
                me.rowIdx = dataSource.indexOf(row);

                // <fix>
                // expand all collapsed groups the record belongs to
                if(me.rowIdx === -1 && dataSource.isMultigroupStore && dataSource.isInCollapsedGroup(row)) {
                    dataSource.expandToRecord(row);
                    me.rowIdx = dataSource.indexOf(row);
                }
                // </fix>
            }
            // row is a grid row, or Element wrapping row
            else if (row.tagName || row.isElement) {
                me.record = me.view.getRecord(row);

                // If it's a placeholder record for a collapsed group, index it correctly
                me.rowIdx = me.record ? (me.record.isCollapsedPlaceholder ? dataSource.indexOfPlaceholder(me.record) : dataSource.indexOf(me.record)) : -1;
            }
        }
        if (me.record !== oldRecord) {
            me.generation++;
        }
        return me;
    }

});