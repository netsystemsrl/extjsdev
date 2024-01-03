Ext.define('Robo.action.tree.Insert', {
    extend : 'Robo.action.Base',

    parent   : null,
    newChild : null,

    insertedBefore : null,

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
        var insertedBefore  = this.insertedBefore,
            insertedAsFirst = insertedBefore && insertedBefore.isFirst();

        // See comment in action.flat.Add#redo
        if (this.autoSync) {
            this.newChild = this.prepareRecord(this.newChild);
        }

        this.parent.insertBefore(this.newChild, insertedBefore);

        // https://www.sencha.com/forum/showthread.php?308814-6.0.1-quot-isFirst-quot-field-is-not-updated-correctly-after-the-child-node-insertion&p=1127985#post1127985
        if (insertedAsFirst) insertedBefore.updateInfo(false, { isFirst : false });
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

        return 'Insertion of ' + title;
    }
});
