// https://www.sencha.com/forum/showthread.php?308916-Crash-when-hiding-columns-spreadsheet-model&p=1128276#post1128276
Ext.define('Gnt.patches.LockingView', {
    extend      : 'Sch.util.Patch',

    target      : 'Ext.grid.locking.View',
    minVersion  : '6.0.0',

    overrides   : {
        getCellByPosition: function(pos, returnDom) {
            if (pos && !pos.column) return null;

            return this.callParent(arguments);
        },

        onCellDeselect: function(cellContext) {
            if (cellContext && !cellContext.column) return;

            return this.callParent(arguments);
        },

        //reported bug
        //https://www.sencha.com/forum/showthread.php?347157-ExtJs-6-5-0-Locked-grid-fires-multiple-view-refresh-events-on-sort
        onDataRefresh: function() {
            Ext.suspendLayouts();
            this.relayFn('onDataRefresh', arguments);
            Ext.resumeLayouts(true);
        }
    }
});