Ext.define('Sch.patches.CellContext', {
    extend : 'Sch.util.Patch',

    target     : 'Ext.grid.CellContext',

    minVersion : '6.0.0',

    maxVersion : '6.6.0',

    applyFn : function () {
        var overrides = {
            setAll: function(view, recordIndex, columnIndex, record, columnHeader) {
                var me = this;

                // Since we patched navigation model, nothing is focused in normal view, which means, keyevents have
                // unexpeted target. This will lead to a situation when we are trying to set position, passing column
                // from normal view and it's position in locked view (which is -1). In this case we want to perform
                // new lookup in correct view.
                // covered in 1000_vertical
                if (columnHeader && columnIndex == -1 && view !== me.view) {
                    view = me.view;
                    columnIndex = view.getVisibleColumnManager().indexOf(columnHeader);
                }

                return this.callParent(arguments);
            }
        };

        if (Ext.getVersion().isGreaterThanOrEqual('6.0.1')) {
            // Scheduler: test 313_single_time_axis_vertical
            // When we switch mode on scheduler grid with locked cell focused (e.g. if setMode is called in itemclick
            // listener) exception is raised. Sencha tries to save focus position and restore it later.
            // In order to optimize performance we suspend refresh before reconfigure. This leads to a situation when
            // view cannot get record and column from existing cell (because grid is already recofigured but view is not
            // yet refreshed) and passing null arguments to the "setPosition" method which doesn't accept it.
            //
            // Gantt: 223_spreadsheet.t.js?Ext=6.0.1
            // Gantt bulk operations suspend events on the taskStore which prevents the cell context of knowing that rows may have been removed
            // In these cases we set row index to 0;
            //
            // Also it's needed for Ext 6.5.3 since in Ext.grid.CellContext setRow/setColumn methods have
            // `if (row !== undefined) {` and `if (column !== undefined) {`
            // and in case row/column is `null` `null !== undefined` returns true and it gets failed few rows later.
            // That is fixed in 6.6.0 by using `!=` operator
            // Covered with tests/view/2119_cellcontext.t.js
            overrides.setPosition = function (row, col) {
                row = row || 0;
                col = col || 0;

                return this.callParent(arguments);
            };
        }

        Ext.override(Ext.grid.CellContext, overrides);
    }
});