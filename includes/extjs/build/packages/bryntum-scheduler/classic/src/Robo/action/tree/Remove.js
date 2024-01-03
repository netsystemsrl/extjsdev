Ext.define('Robo.action.tree.Remove', {
    extend : 'Robo.action.Base',

    parent       : null,
    removedChild : null,
    nextSibling  : null,

    newParent      : null,
    newNextSibling : null,

    dirty : false,

    isMove : false,

    autoSync : false,

    constructor : function (config) {
        this.callParent(arguments);

        this.dirty = this.removedChild.dirty;
    },

    undo : function () {
        var me = this;

        if (me.isMove) {
            me.newParent = me.removedChild.parentNode;
            me.newNextSibling = me.removedChild.nextSibling;
        }

        var nextSibling = me.nextSibling;
        var insertedAsFirst = nextSibling && nextSibling.isFirst();

        if (!me.isMove && me.autoSync) {
            me.removedChild = me.prepareRecord(me.removedChild);
        }

        var removedChild = me.removedChild;

        me.parent.insertBefore(removedChild, nextSibling);

        removedChild.dirty = me.dirty;

        if (!me.isMove && !me.autoSync) {
            var store = removedChild.getTreeStore();

            removedChild.cascadeBy(function (node) {
                Ext.Array.remove(store.removedNodes, node);
            });
        }

        if (insertedAsFirst) nextSibling.updateInfo(false, { isFirst : false });
    },

    redo : function () {
        if (this.isMove) {
            var newNextSibling = this.newNextSibling;
            var insertedAsFirst = newNextSibling && newNextSibling.isFirst();

            this.newParent.insertBefore(this.removedChild, newNextSibling);

            // https://www.sencha.com/forum/showthread.php?308814-6.0.1-quot-isFirst-quot-field-is-not-updated-correctly-after-the-child-node-insertion&p=1127985#post1127985
            if (insertedAsFirst) newNextSibling.updateInfo(false, { isFirst : false });
        }
        else {
            this.parent.removeChild(this.removedChild);

            delete this.removedChild.data.lastParentId;
        }
    },

    getRecord : function () {
        return this.removedChild;
    },

    getTitle : function () {
        var record = this.removedChild;

        var title;

        if (record.getTitle)
            title = record.getTitle(this);
        else if (record.modelName) return record.modelName + ' ' + record.getId();

        return this.isMove ? 'Move of ' + title : 'Removal of ' + title;
    }
});
