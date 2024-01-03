Ext.define('Robo.action.flat.Remove', {
    extend : 'Robo.action.Base',

    store   : null,
    records : null,

    index : null,

    autoSync : false,

    undo : function () {
        var me = this;
        // See comment in action.flat.Add#redo
        if (me.autoSync) {
            me.records = Ext.Array.map(me.records, me.prepareRecord);
        }
        me.store.insert(me.index, me.records);
    },

    redo : function () {
        var me = this;

        me.store.remove(me.records);
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

        return 'Removal of ' + titles.join(',');
    }
});
