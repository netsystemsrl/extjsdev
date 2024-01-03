Ext.define('Gnt.patches.SelectionExtender', {
    extend : 'Sch.util.Patch',

    target     : 'Ext.grid.selection.SelectionExtender',
    minVersion : '6.0.0',

    overrides     : {
        // prevent selection extending in normal view
        onDrag : function(e) {
            if (!Ext.fly(e.getTarget()).up('.sch-ganttview')) {
                this.callParent(arguments);
            }
        }
    }
});
