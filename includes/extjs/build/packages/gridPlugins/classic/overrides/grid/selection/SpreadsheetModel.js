/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.grid.selection.SpreadsheetModel', {
    override: 'Ext.grid.selection.SpreadsheetModel',

    privates: {
        // replaced me.store with view.dataSource
        onMouseMove: function (e, target, opts) {
            var me = this,
                view = opts.view,
                record,
                rowIdx,
                cell = e.getTarget(view.cellSelector),
                header = opts.view.getHeaderByCell(cell),
                selData = me.selected,
                pos,
                recChange,
                colChange;

            // when the mousedown happens in a checkcolumn, we need to verify is the mouse pointer has moved out of the initial clicked cell.
            // if it has, then we select the initial row and mark it as the range start, otherwise passing the lastOverRecord and return as
            // we don't want to select the record while moving the pointer around the initial cell.
            if (me.checkCellClicked) {
                // We are dragging within the check cell...
                if (cell === me.checkCellClicked) {
                    if (!me.lastOverRecord) {
                        me.lastOverRecord = view.getRecord(cell.parentNode);
                    }
                    return;
                } else {
                    me.checkCellClicked = null;
                    if (me.lastOverRecord) {
                        me.select(me.lastOverRecord);
                        selData.setRangeStart(view.dataSource.indexOf(me.lastOverRecord));
                    }
                }
            }

            // Disable until a valid new selection is announced in fireSelectionChange
            if (me.extensible) {
                me.extensible.disable();
            }

            if (header) {
                record = view.getRecord(cell.parentNode);
                rowIdx = view.dataSource.indexOf(record);
                recChange = record !== me.lastOverRecord;
                colChange = header !== me.lastOverColumn;

                if (recChange || colChange) {
                    pos = me.getCellContext(record, header);
                }

                // Initial mousedown was in rownumberer or checkbox column
                if (selData.isRows) {
                    // Only react if we've changed row
                    if (recChange) {
                        if (me.lastOverRecord) {
                            selData.setRangeEnd(rowIdx);
                        } else {
                            selData.setRangeStart(rowIdx);
                        }
                    }
                }
                // Selecting cells
                else if (selData.isCells) {
                    // Only react if we've changed row or column
                    if (recChange || colChange) {
                        if (me.lastOverRecord) {
                            selData.setRangeEnd(pos);
                        } else {
                            selData.setRangeStart(pos);
                        }
                    }
                }
                // Selecting columns
                else if (selData.isColumns) {
                    // Only react if we've changed column
                    if (colChange) {
                        if (me.lastOverColumn) {
                            selData.setRangeEnd(pos.column);
                        } else {
                            selData.setRangeStart(pos.column);
                        }
                    }
                }

                // Focus MUST follow the mouse.
                // Otherwise the focus may scroll out of the rendered range and revert to document
                if (recChange || colChange) {
                    // We MUST pass local view into NavigationModel, not the potentially outermost locking view.
                    // TODO: When that's fixed, use setPosition(pos).
                    view.getNavigationModel().setPosition(new Ext.grid.CellContext(header.getView()).setPosition(record, header));
                }
                me.lastOverColumn = header;
                me.lastOverRecord = record;
            }
        }
    }
});