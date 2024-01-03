Ext.define('Robo.action.flat.Add', {
    extend : 'Robo.action.Base',

    store   : null,
    records : null,

    index : null,

    autoSync : false,

    undo : function () {
        var records = this.records;

        this.store.remove(records);

        // We should only interfere with store's removed property when changes are not synced automatically. If they are,
        // we will remove record from `removed` property, telling store that record should not be sent to server as deleted
        if (!this.autoSync) {
            for (var i = 0; i < records.length; i++) {
                this.store.removeFromRemoved(records[i]);
            }
        }
    },

    redo : function () {
        // When adding records back to the store we should prepare them to make them appear new
        if (this.autoSync) {
            this.records = Ext.Array.map(this.records, this.prepareRecord);
        }
        this.store.insert(this.index, this.records);
    },

    getRecord : function () {
        return this.records[0];
    },

    getTitle : function () {
        var me = this;

        var titles = Ext.Array.map(this.records, function (record) {
            if (record.getTitle) return record.getTitle(me);

            if (record.modelName) return record.modelName + ' ' + record.getId();

            return 'unknown';
        });

        return 'Addition of ' + titles.join(',');
    }

});
