/**
 @class Robo.widget.UndoButton

 A subclass of ExtJS split button, integrated with the {@link Robo.Manager} and reflecting the current list of Robo transactions,
 available for "undo".

 See the base class for a list of available config options.

 */
Ext.define('Robo.widget.UndoButton', {

    extend : 'Ext.button.Split',

    alias : 'widget.roboundobutton',

    iconCls : Ext.baseCSSPrefix + 'fa fa-undo',

    /**
     * @cfg {Robo.Manager} robo (required) Robo.Manager instance this button is bound to.
     */
    robo : null,

    transactionList : null,

    type : 'undo',

    text : 'Undo',

    disabled : true,

    constructor : function (config) {
        config = config || {};

        Ext.apply(this, config);

        if (!this.robo) throw new Error('`robo` is a required config for the ' + this.$className);

        this.callParent(config);
    },

    initComponent : function () {
        var me = this;

        Ext.apply(this, {
            menu : new Ext.menu.Menu({
                cls   : 'robo-transaction-list',
                items : this.getTransactionItems(),

                listeners : {
                    click : this.onTransactionClick,
                    scope : this
                }
            })
        });

        this.on('click', function () {
            me.robo[me.type]();
        });

        this.mon(me.robo, me.type + 'queuechange', this.onTransactionQueueChange, this);

        this.callParent();
    },

    onTransactionQueueChange : function (robo, queue) {
        this.setDisabled(queue.length === 0);

        var menu = this.menu;

        menu.removeAll();
        menu.add(this.getTransactionItems());

        if (!queue.length) menu.hide();
    },

    getTransactionItems : function () {
        var me = this;

        var res = Ext.Array.map(this.robo[this.type + 'Queue'], function (transaction) {
            return new Ext.menu.Item({
                text        : transaction.getTitle(),
                transaction : transaction,
                listeners   : {
                    activate   : me.onTransactionItemActivated,
                    deactivate : me.onTransactionItemDeActivated,
                    scope      : me
                }
            });
        });

        if (this.type == 'undo') res.reverse();

        return res;
    },

    onTransactionClick : function (menu, menuItem) {
        if (!menuItem) return;

        this.robo[this.type](menuItem.transaction);
    },

    onTransactionItemActivated : function (activatedItem) {
        this.menu.items.each(function (item) {
            if (item == activatedItem) return false;

            if (item.rendered) item.el.addCls(item.activeCls);
        });
    },

    onTransactionItemDeActivated : function (deActivatedItem) {
        this.menu.items.each(function (item) {
            if (item == deActivatedItem) return false;

            if (item.rendered) item.el.removeCls(item.activeCls);
        });
    }
});
