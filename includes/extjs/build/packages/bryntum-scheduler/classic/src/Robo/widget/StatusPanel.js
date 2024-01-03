/**
 @class Robo.widget.StatusPanel

 */
Ext.define('Robo.widget.StatusPanel', {
    extend : 'Ext.tree.Panel',

    alias : 'widget.robostatuspanel',

    /**
     * @cfg {Robo.Manager} robo (required) Robo.Manager instance this button is bound to.
     */
    robo : null,

    type : 'undo',

    constructor : function (config) {
        config = config || {};

        Ext.apply(this, config);

        if (!this.robo) throw new Error('`robo` is a required config for the ' + this.$className);

        this.callParent(config);
    },

    initComponent : function () {
        var me = this;

        Ext.apply(this, {
            rootVisible : false,

            columns : [
                {
                    xtype     : 'treecolumn',
                    text      : 'Title',
                    dataIndex : 'title',
                    width     : 250
                },
                {
                    text      : 'Changed fields',
                    dataIndex : 'fieldNames',
                    flex      : 1,
                    tdCls     : 'fieldnames'
                }
            ],

            store : {
                fields : ['title', 'fieldNames', 'isActive']
            },

            viewConfig : {
                getRowClass : Ext.Function.bind(this.getActiveRowClass, this)
            }
        });

        this.mon(me.robo, me.type + 'queuechange', this.onTransactionQueueChange, this);

        this.callParent();
    },

    getActiveRowClass : function (record, rowIndex, rowParams, store) {
        return record.get('isActive') ? 'robo-status-active' : '';
    },

    onTransactionQueueChange : function (robo, queue) {
        var type = this.type;

        var transactions = Ext.Array.map(queue, function (transaction, i) {
            var isActive = type == 'undo' ? i == queue.length - 1 : i === 0;

            return {
                leaf     : false,
                expanded : true,
                title    : transaction.getTitle(),

                isActive : isActive,

                children : Ext.Array.map(transaction.getActions(), function (action) {
                    var record = action.getRecord();

                    return {
                        leaf       : true,
                        title      : action.getTitle(),
                        fieldNames : action instanceof Robo.action.flat.Update ? action.fieldNames.join(', ') : '',
                        isActive   : isActive
                    };
                })
            };
        });

        this.store.setRootNode({
            expanded : true,
            children : transactions
        });

        this.getView().scrollTo(0, Infinity);
    }
});

