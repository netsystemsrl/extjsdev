// https://www.sencha.com/forum/showthread.php?470447-Spreadsheet-selection-is-broken-in-locked-grid-Ext-6-6-0
Ext.define('Sch.patches.SpreadsheetModel', {
    extend : 'Sch.util.Patch',

    // need to specify here to let `sencha app build` add it to the bundle
    requires : ['Ext.grid.selection.SpreadsheetModel'],

    target : 'Ext.grid.selection.SpreadsheetModel',

    minVersion : '6.6.0',

    overrides : {
        privates : {
            onMouseMove : function (e, target, opts) {
                var me      = this,
                    view    = opts.view,
                    cell    = e.getTarget(view.cellSelector),
                    header  = opts.view.getHeaderByCell(cell),
                    selData = me.selected;

                //region OVERRIDE2
                var schedulingView;

                if (view.getSchedulingView) {
                    schedulingView = view.getSchedulingView();
                }
                else if (view.ownerGrid.getSchedulingView) {
                    schedulingView = view.ownerGrid.getSchedulingView();
                }

                // if mouse is moving over scheduling view - do nothing
                if (schedulingView && schedulingView._cmpCls && Ext.fly(target).up('.' + schedulingView._cmpCls)) {
                    return;
                }
                //endregion OVERRIDE2

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
                            selData.setRangeStart(me.store.indexOf(me.lastOverRecord));
                        }
                    }
                }

                me.isDragging = true;

                // Disable until a valid new selection is announced in fireSelectionChange
                if (me.extensible) {
                    me.extensible.disable();
                }

                //region OVERRIDE
                if (header) {
                    me.changeSelectionRange(view, cell, header, e);
                } else {
                    // Ext.grid.locking.View doesn't have `body`, so check view.ownerGrid.body.el
                    var el = view.body ? view.body.el : view.ownerGrid.body.el;

                    if (!e.within(el)) {
                        me.scrollTowardsPointer(e, view);
                    }
                }
                //endregion OVERRIDE
            }
        }
    }
});
