// Reported here https://www.sencha.com/forum/showthread.php?334034
Ext.define('Gnt.patches.SpreadsheetModel_2', {
    extend : 'Sch.util.Patch',

    target : 'Ext.grid.selection.SpreadsheetModel',

    minVersion : '6.2.1',

    overrides : {
        privates : {
            onMouseUp : function (e, target, opts) {
                var me   = this,
                    view = opts.view,
                    cell, record;

                me.checkCellClicked = null;

                if (view && !view.destroyed) {
                    // If we catch the event before the View sees it and stamps a position in, we need to know where they mouseupped.
                    if (!e.position) {
                        cell = e.getTarget(view.cellSelector);
                        if (cell) {
                            record = view.getRecord(cell);
                            if (record) {
                                e.position = new Ext.grid.CellContext(view).setPosition(record, view.getHeaderByCell(cell));
                            }
                        }
                    }
                    // Disable until a valid new selection is announced in fireSelectionChange unless it's a click
                    if (me.extensible && e.position && !e.position.isEqual(me.mousedownPosition)) {
                        me.extensible.disable();
                    }
                    view.el.un('mousemove', me.onMouseMove, me);
                    // Copy the records encompassed by the drag range into the record collection
                    if (me.selected.isRows) {
                        me.selected.addRange();
                    }
                    // Fire selection change only if we have dragged - if the mouseup position is different from the mousedown position.
                    // If there has been no drag, the click handler will select the single row
                    if (!e.position || !e.position.isEqual(me.mousedownPosition)) {
                        me.fireSelectionChange();
                    }
                }
            }
        }
    }
});