//Patch for https://www.sencha.com/forum/showthread.php?469449-EXTJS-6-5-3-Focus-bug-in-spreadsheet-selection-model&p=1316838#post1316838
Ext.define('Gnt.patches.CellContext', {
    extend : 'Sch.util.Patch',

    target     : 'Ext.grid.CellContext',
    minVersion : '6.2.1',

    overrides : {
        setRow : function (row) {
            if (row === null)
                row = undefined;
            return this.callParent(arguments);
        },

        setColumn: function(col) {
            if (col === null)
                col = undefined;
            return this.callParent(arguments);
        }
    }
});

