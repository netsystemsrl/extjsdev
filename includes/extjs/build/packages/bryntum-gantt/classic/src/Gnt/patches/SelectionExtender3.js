// https://www.sencha.com/forum/showthread.php?334465-Crash-when-removing-all-rows-with-spreadsheet-model&p=1169814#post1169814
Ext.define('Gnt.patches.SelectionExtender3', {
    extend : 'Sch.util.Patch',

    target   :'Ext.grid.selection.SelectionExtender',

    minVersion : '6.7.0',

    overrides   : {
        alignHandle: function() {
            var me = this,
                firstCell = me.firstPos && me.firstPos.getCell(true),
                lastCell = me.lastPos && me.lastPos.getCell(true),
                handle = me.handle,
                shouldDisplay;
            // Cell corresponding to the position might not be rendered.
            // This will be called upon scroll
            if (firstCell && lastCell) {
                me.enable();
                handle.alignTo(lastCell, 'c-br');
                shouldDisplay = me.isHandleWithinView(Ext.fly(lastCell).up('.' + Ext.baseCSSPrefix + 'grid-view, .' + Ext.baseCSSPrefix + 'tree-view'));
                handle.setVisible(shouldDisplay);
            } else {
                me.disable();
            }
        }
    }
});
