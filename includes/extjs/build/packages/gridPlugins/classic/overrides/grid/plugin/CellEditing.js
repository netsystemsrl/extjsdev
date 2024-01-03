/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.grid.plugin.CellEditing', {
    override: 'Ext.grid.plugin.CellEditing',

    onEditComplete: function(ed, value, startValue) {
        var me = this,
            context = ed.context,
            view, record;

        view = context.view;
        record = context.record;
        context.value = value;

        // Only update the record if the new value is different than the
        // startValue. When the view refreshes its el will gain focus
        if (!record.isEqual(value, startValue)) {
            record.set(context.column.dataIndex, value);
            // Changing the record may impact the position
            context.rowIdx = view.indexOf(record);

            // <fix>
            if(context.rowIdx < 0 && view.dataSource.isMultigroupStore && view.dataSource.isInCollapsedGroup(record)) {
                // the record is probably in a collapsed group
                view.dataSource.expandToRecord(record);
                context.rowIdx = view.indexOf(record);
            }
            // </fix>
        }

        // We clear down our context here in response to the CellEditor completing.
        // We only do this if we have not already started editing a new context.
        if (me.context === context) {
            me.setActiveEditor(null);
            me.setActiveColumn(null);
            me.setActiveRecord(null);
            me.editing = false;
        }

        me.fireEvent('edit', me, context);
    }

});