// Private class
Ext.define('Kanban.data.ViewStore', {
    extend            : 'Ext.data.Store',
    mixins            : [
        'Kanban.data.mixin.StoreView'
    ],

    proxy             : 'memory',
    masterStore       : null,
    state             : null,

    constructor : function (config) {

        Ext.apply(this, config);

        if (this.state === null || this.state === undefined) {
            throw 'Must supply state';
        }

        if (this.masterStore) {
            var master = this.masterStore = Ext.StoreMgr.lookup(this.masterStore);

            this.model = master.model;
        } else {
            throw 'Must supply a master store';
        }

        this.callParent(arguments);

        if (this.masterStore) {
            this.bindToStore(this.masterStore);
        }
    },

    getResourceStore : function() {
        return this.masterStore.getResourceStore();
    }
});
