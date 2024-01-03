//https://www.sencha.com/forum/showthread.php?337241
// Spread sheet model doesn't react correctly to store.remove() called manually
Ext.define('Gnt.patches.SpreadsheetModel_4', {
    extend : 'Sch.util.Patch',

    target : 'Ext.grid.selection.SpreadsheetModel',

    minVersion : '6.0.2',

    overrides : {
        privates : {
            onStoreRemove : function () {
                var sel = this.getSelected();
                // Updating on store mutation is only valid if we are selecting records.

                if (sel && !sel.isCells) {
                    this.callParent(arguments);
                }
            }
        },

        deselect : function (records, suppressEvent) {
            // API docs are inherited
            var me      = this,
                sel     = me.selected,
                store   = me.view.dataSource,
                len, i, record,
                changed = false;

            if (sel && sel.isRows) {
                if (!Ext.isArray(records)) {
                    records = [
                        records
                    ];
                }
                len = records.length;
                for (i = 0; i < len; i++) {
                    record = records[i];
                    if (typeof record === 'number') {
                        record = store.getAt(record);
                    }

                    if (sel.remove(record)) {
                        changed = true;
                    }
                }
            }
            if (changed) {
                me.updateHeaderState();
                if (!suppressEvent) {
                    me.fireSelectionChange();
                }
            }
        }
    }
});