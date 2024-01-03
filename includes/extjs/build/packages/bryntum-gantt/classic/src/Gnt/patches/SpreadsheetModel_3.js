// https://app.assembla.com/spaces/bryntum/tickets/4062-scrollbar-appears-in-locked-grid-when-adding-new-record/details
Ext.define('Gnt.patches.SpreadsheetModel_3', {
    extend : 'Sch.util.Patch',

    target : 'Ext.grid.selection.SpreadsheetModel',

    minVersion : '6.0.2',

    overrides : {
        privates : {
            // This method can be provided with first and last visible columns in grid when we select whole row/range.
            // Given that we moved selection extender to locked grid in ticket #3915, this method get selection
            // extender positioned far outside of locked view making view scrollable when it shouldn't. We constrain
            // range to locked grid columns here.
            // covered by 221_spreadsheet_1
            onSelectionFinish : function (sel, firstCell, lastCell) {
                var view = this.view;

                if (lastCell && view instanceof Gnt.view.Gantt) {
                    var lockedView = view.ownerGrid.lockedGrid.view,
                        header     = lockedView.getHeaderCt(),
                        columns    = header.getVisibleGridColumns();

                    if (Ext.Array.indexOf(columns, lastCell.column) === -1 && lastCell.record !== null) {
                        lastCell = new Ext.grid.CellContext(view).setPosition(lastCell.record, columns[columns.length - 1]);
                    }
                }

                this.callParent(arguments);
            }
        }
    }
});