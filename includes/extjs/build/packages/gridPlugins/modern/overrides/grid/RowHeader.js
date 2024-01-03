/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.grid.RowHeader', {
    override: 'Ext.grid.RowHeader',

    privates: {
        getGroupHeaderTplData: function (skipHtml, group) {
            var data = this.callSuper([ /*skipHtml=*/true, group ]),
                grid = this.parent,
                column = data && grid.getColumnForField(data.groupField);

            if (column) {
                data.columnName = column.getText();

                if (column.printValue) {
                    data.html = column.printValue(data.value);
                }
            }
            else if (data) {
                data.html = Ext.htmlEncode(data.name);
            }

            return data;
        }
    }
});