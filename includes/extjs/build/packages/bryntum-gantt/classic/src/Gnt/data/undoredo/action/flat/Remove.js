Ext.define('Gnt.data.undoredo.action.flat.Remove', {
    extend  : 'Robo.action.flat.Remove',
    
    // This collection holds records, removed from flat store. It provides convenient way to
    // update records (e.g. when we need to update links between entities in the undo/redo queue)
    collection : null,
    
    undo : function () {
        this.callParent();
        
        this.collection.remove(this.records);
    },
    
    redo : function () {
        this.callParent();
        
        this.collection.add(this.records);
    }
});
