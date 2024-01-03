// https://www.sencha.com/forum/showthread.php?334465-Crash-when-removing-all-rows-with-spreadsheet-model&p=1169814#post1169814
Ext.define('Gnt.patches.SelectionExtender2', {
    extend : 'Sch.util.Patch',

    target   :'Ext.grid.selection.SelectionExtender',

    minVersion : '6.0.0',

    overrides   : {
        setHandle  : function (firstPos, lastPos) {
            if ((this.view.lockedView && this.view.lockedView.getNodes().length === 0) || (firstPos && lastPos && (!firstPos.record || !lastPos.record))) {
                this.disable();
                return;
            }

            return this.callParent(arguments);
        }
    }
});
