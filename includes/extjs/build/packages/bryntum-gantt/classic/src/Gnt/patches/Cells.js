// https://app.assembla.com/spaces/bryntum/tickets/9477-shift+click-by-locked-grid-fails-with-an-exception/details#
Ext.define('Gnt.patches.Cells', {
    extend : 'Sch.util.Patch',

    target : 'Ext.grid.selection.Cells',

    applyFn : function () {
        delete Ext.grid.selection.Cells.prototype.setRangeStart.$privacy;

        Ext.grid.selection.Cells.override({
            setRangeStart: function (startCell, endCell) {
                if (startCell.record === undefined && startCell.column === undefined) {
                    startCell = this.view.selModel.getCellContext(0, 0);
                }
                return this.callParent(arguments);
            }
        });
    }
});
