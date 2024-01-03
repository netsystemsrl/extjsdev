Ext.define('Robo.action.tree.Append', {
    extend : 'Robo.action.Base',

    parent   : null,
    newChild : null,

    autoSync : false,

    undo : function () {
        var newChild = this.newChild;

        this.parent.removeChild(newChild);

        delete newChild.data.lastParentId;

        // See comment in action.flat.Add#undo
        if (!this.autoSync) {
            Ext.Array.remove(this.parent.getTreeStore().removedNodes, newChild);
        }
    },

    redo : function () {
        // See comment in action.flat.Add#redo
        if (this.autoSync) {
            this.newChild = this.prepareRecord(this.newChild);
        }
        this.parent.appendChild(this.newChild);
    },

    getRecord : function () {
        return this.newChild;
    },

    getTitle : function () {
        var record = this.newChild;

        var title;

        if (record.getTitle)
            title = record.getTitle(this);
        else if (record.modelName) return record.modelName + ' ' + record.getId();

        return 'Append of ' + title;
    }
});
