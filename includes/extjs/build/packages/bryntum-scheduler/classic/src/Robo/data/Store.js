/**
 @class Robo.data.Store

 This is a mixin for your data stores, enabling integration with the Robo undo/redo framework.
 It should be included in your store classes as any other mixin:

 Ext.define('Example.store.Branch', {
        extend      : 'Ext.data.Store',

        mixins      : { robo : 'Robo.data.Store' },

        ...
    });

 With this mixin, {@link Robo.Manager} will call various "hook" methods of the store, notifying it about
 the current state of the data flow, like {@link #beforeUndoRedo}, {@link #afterUndoRedo}.

 The Store might override those methods, for example to turn off/on cache recalculation or other additional
 processing during the execution of the transaction.

 */
Ext.define('Robo.data.Store', {
    extend : 'Ext.Mixin',

    requires : [
        'Ext.util.Observable'
    ],

    undoRedoPostponed : null,

    inUndoRedoTransaction : false,

    undoRedoEventBus : null,

    /**
     * This is an important part of undo/redo management, it allows an undo/redo manager to always be notified about
     * low-level events of a store.
     */
    mixinConfig : {
        before : {
            constructor   : 'constructor',
            destroy       : 'destroy',
            fireEventArgs : 'fireEventArgs',
            setRoot       : 'beforeSetRoot',
            fillNode      : 'beforeFillNode'
        },

        after : {
            setRoot  : 'afterSetRoot',
            fillNode : 'afterFillNode'
        }
    },

    constructor : function () {
        var me = this;

        me.undoRedoEventBus = new Ext.util.Observable();
    },

    destroy : function () {
        Ext.destroy(this.undoRedoEventBus);
    },

    fireEventArgs : function (eventName, args) {
        var me = this;
        // HACK:
        // Args is an array (i.e. passes by reference) we will use it to mark it as being fired already
        // by undo/redo event bus by adding a private property to it, otherwise we will be firing the same event
        // twice if/when the event is suspended on the original bus, queued and then fired again upon resuming.
        // Since the same args array might be used several times (in 'before' event and 'normal' event, for example),
        // we do not use just boolean flag, instead we use a map with event names as keys.
        if (!args.hasOwnProperty('$undoRedoEventBusFired')) {
            args.$undoRedoEventBusFired = {};
        }
        if (!args.$undoRedoEventBusFired[eventName]) {
            args.$undoRedoEventBusFired[eventName] = true;
            me.undoRedoEventBus.hasListener(eventName) && me.undoRedoEventBus.fireEventArgs(eventName, args);
        }
    },

    /**
     * Checks whether an undo/redo transaction is currently in progress. Not to be confused
     * with the {@link #isUndoingOrRedoing}
     *
     * @return {Boolean}
     */
    isInUndoRedoTransaction : function () {
        return this.inUndoRedoTransaction;
    },

    /**
     * Called by undo/redo manager when starting a new undo/redo transaction
     *
     * @param {Robo.Manager} manager
     * @param {Robo.Transaction} transaction
     */
    onUndoRedoTransactionStart : function (manager, transaction) {
        this.inUndoRedoTransaction = true;
    },

    /**
     * Called by undo/redo manager when finishing an undo/redo transaction
     *
     * @param {Robo.Manager} manager
     * @param {Robo.Transaction} transaction
     */
    onUndoRedoTransactionEnd : function (manager, transaction) {
        this.inUndoRedoTransaction = false;
    },

    /**
     * Checks wheither a previously recorded undo/redo transaction is being rolled back or replayed.
     *
     * @return {Boolean}
     */
    isUndoingOrRedoing : function () {
        return !!this.undoRedoPostponed;
    },

    /**
     * Called by undo manager before executing a previously recorded undo/redo transaction
     *
     * @param {Robo.Manager} manager
     */
    beforeUndoRedo : function (manager) {
        this.undoRedoPostponed = [];
    },

    /**
     * Called by undo manager after executing a previously recorded undo/redo transaction
     *
     * @param {Robo.Manager} manager
     */
    afterUndoRedo : function (manager) {
        var me = this;

        if (me.undoRedoPostponed) {
            Ext.Array.forEach(me.undoRedoPostponed, function (fn) {
                fn();
            });
        }

        me.undoRedoPostponed = null;
    },

    /**
     * Store might use this method to postpone code execution to the moment right before undo/redo transaction is
     * done. The code postponed will be called right before the call to the {@link afterUndoRedo()} method.
     *
     * @param {Function} fn A code to postpone
     */
    postponeAfterUndoRedo : function (fn) {
        // <debug>
        Ext.Assert && Ext.Assert.isFunction(fn, 'Parameter must be a function');
        // </debug>

        this.undoRedoPostponed.push(fn);
    },

    beforeSetRoot : function () {
        this.__isSettingRoot = true;
    },

    afterSetRoot : function () {
        this.__isSettingRoot = false;

        // https://www.sencha.com/forum/showthread.php?307767-TreeStore-removeAll-doesn-t-fire-quot-clear-quot&p=1124119#post1124119
        if (!this.getRoot()) {
            this.fireEvent('clear', this);
        }
    },

    beforeFillNode : function (node) {
        if (node.isRoot()) this.beforeSetRoot();
    },

    afterFillNode : function (node) {
        if (node.isRoot()) this.afterSetRoot();
    },

    /**
     * Returns true if this store is in process of loading/filling the root node
     *
     * @return {Boolean}
     */
    isRootSettingOrLoading : function () {
        return this.isLoading() || (this.isTreeStore && this.__isSettingRoot);
    }
});
