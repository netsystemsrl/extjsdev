// Patch for https://www.sencha.com/forum/showthread.php?469558
Ext.define('Gnt.patches.Rows', {
    extend : 'Sch.util.Patch',

    target : 'Ext.grid.selection.Rows',

    minVersion : '6.5.2',

    maxVersion : '6.5.3.57',

    overrides : {
        getCount: function() {
            var me = this,
                selectedRecords = me.selectedRecords,
                result = selectedRecords ? selectedRecords.getCount() : 0,
                range = me.getRange(),
                i,
                store = me.view.dataSource;
            // If dragging, add all records in the drag that are *not* in the collection
            for (i = range[0]; i <= range[1]; i++) {
                // Range may be outside of the store count if last record was selected and removed
                if (!selectedRecords || (i < store.getCount() && !selectedRecords.byInternalId.get(store.getAt(i) && store.getAt(i).internalId))) {
                    result++;
                }
            }
            return result;
        }
    }
});
