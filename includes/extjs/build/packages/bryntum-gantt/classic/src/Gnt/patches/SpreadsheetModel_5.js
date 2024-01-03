// https://app.assembla.com/spaces/bryntum/tickets/5393-exception-in-spreadsheet-model-when-column-is-selected-and-hidden-from-header
// https://www.sencha.com/forum/showthread.php?469276
Ext.define('Gnt.patches.SpreadsheetModel_5', {
    extend : 'Sch.util.Patch',

    target : 'Ext.grid.selection.SpreadsheetModel',

    minVersion : '6.2.1',

    applyFn : function () {
        var overrides = {
            privates : {}
        };

        // this is intentional
        if (Ext.getVersion().isGreaterThan('6.5.0')) {
            overrides.privates.onViewChanged = function (view, isColumnChange) {
                var me = this, selData = me.selected, store = view.store, selectionChanged = false, rowRange, colCount,
                    colIdx, rowIdx, context;

                if (selData) {
                    view = selData.view;
                    if (isColumnChange) {
                        if (selData.isCells) {
                            context  = new Ext.grid.CellContext(view);
                            rowRange = selData.getRowRange();
                            colCount = view.ownerGrid.getColumnManager().getColumns().length;
                            if (colCount) {
                                for (rowIdx = rowRange[0]; rowIdx <= rowRange[1]; rowIdx++) {
                                    context.setRow(rowIdx);
                                    for (colIdx = 0; colIdx < colCount; colIdx++) {
                                        context.setColumn(colIdx);
                                        if (context.column) {
                                            view.onCellDeselect(context);
                                        }
                                        if (me.maybeClearSelection(context)) {
                                            selectionChanged = true;
                                        }
                                    }
                                }
                            } else {
                                me.clearSelections();
                                selectionChanged = true;
                            }
                        } else {
                            if (selData.isColumns) {
                                selectionChanged = false;
                                selData.eachColumn(function (column, columnIdx) {
                                    if (!column.isVisible() || !view.ownerGrid.isAncestor(column)) {
                                        // OVERRIDE
                                        this.remove(column);
                                        // END OVERRIDE
                                        if (me.maybeClearSelection({ column : column })) {
                                            selectionChanged = true;
                                        }
                                    }
                                });
                            }
                        }
                    } else {
                        if (selData.isRows && store.isFiltered()) {
                            selData.eachRow(function (rec) {
                                if (!store.contains(rec)) {
                                    this.remove(rec);
                                    if (me.maybeClearSelection({ rowIdx : view.indexOf(rec) })) {
                                        selectionChanged = true;
                                    }
                                }
                            });
                        }
                    }
                }
                return selectionChanged;
            };
        }
        // because in 6.2 branch corresponding method is
        else {
            overrides.privates.onColumnsChanged = function () {
                var me      = this,
                    selData = me.selected,
                    rowRange, colCount, colIdx, rowIdx, view, context, selectionChanged;

                // When columns have changed, we have to deselect *every* cell in the row range because we do not know where the
                // columns have gone to.
                if (selData) {
                    view = selData.view;
                    if (selData.isCells) {
                        context  = new Ext.grid.CellContext(view);
                        rowRange = selData.getRowRange();
                        colCount = view.getVisibleColumnManager().getColumns().length;

                        if (colCount) {
                            for (rowIdx = rowRange[0]; rowIdx <= rowRange[1]; rowIdx++) {
                                context.setRow(rowIdx);
                                for (colIdx = 0; colIdx < colCount; colIdx++) {
                                    context.setColumn(colIdx);
                                    view.onCellDeselect(context);
                                }
                            }
                        } else {
                            me.clearSelections();
                        }
                    }
                    // We have to deselect columns which have been hidden/removed
                    else if (selData.isColumns) {
                        selectionChanged = false;
                        selData.eachColumn(function (column, columnIdx) {
                            if (!column.isVisible() || !view.ownerGrid.isAncestor(column)) {
                                // OVERRIDE
                                this.remove(column);
                                // END OVERRIDE
                                selectionChanged = true;
                            }
                        });
                    }
                }
                // This event is fired directly from the HeaderContainer before the view updates.
                // So we have to wait until idle to update the selection UI.
                // NB: fireSelectionChange calls updateSelectionExtender after firing its event.
                Ext.on('idle', selectionChanged ? me.fireSelectionChange : me.updateSelectionExtender, me, {
                    single : true
                });
            };
        }

        Ext.override(Ext.grid.selection.SpreadsheetModel, overrides);
    }
});
