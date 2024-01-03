/**
 * @class Robo.Manager
 * @extends Ext.util.Observable
 *
 * This is the main class that provides undo-redo capabilities for an array of {@link Ext.data.Store} instances.
 * To enable undo support, simply create a Robo.Manager instance and configure it with your stores:
 *
 * ```
 * var yourStore1  = new Ext.data.Store({ ... });
 * var yourStore2  = new Ext.data.TreeStore({ ... });
 *
 * var robo        = new Robo.Manager({
 *        stores              : [ yourStore1, yourStore2 ]
 *    });
 *
 * // start monitoring
 * robo.start();
 * ```
 *
 * See also {@link Robo.data.Model} and {@link Robo.data.Store} mixins - they need to be mixed into your models and stores.
 *
 * By default, Robo uses timeout-based transactions (see {@link #transactionBoundary}). So all changes during {@link #transactionMaxDuration}
 * ms will be batched into a single transaction:
 *
 * ```
 * // in some button handler, several changes are batched in single transaction
 * yourStore.getAt(0).set('name', 'a new name');
 * yourStore.getAt(1).set('value', 'a new value');
 *
 * // user clicks the `undo` button after some time
 * // whole transaction is reverted
 * robo.undo();
 * ```
 */
Ext.define('Robo.Manager', {
    extend : 'Ext.util.Observable',

    requires : [
        'Robo.util.Array',
        'Robo.Transaction',

        'Robo.data.Model',

        'Robo.action.flat.Update',
        'Robo.action.flat.Add',
        'Robo.action.flat.Remove',

        'Robo.action.tree.Append',
        'Robo.action.tree.Insert',
        'Robo.action.tree.Remove',
        'Robo.action.tree.Update',

        'Ext.data.Store',
        'Ext.data.StoreManager'
    ],

    /**
     * @cfg {Ext.data.Store[]} stores An array of stores to be managed by the Robo
     */
    stores     : null,
    storesById : null,

    /**
     * @cfg {Boolean} autoSync Pass true to avoid messing with added/removed properties on store. Useful when
     * crudManager or store is configured with autoSync : true
     */
    autoSync : false,

    treeStoreListeners : null,
    flatStoreListeners : null,
    stub               : function () {
    },

    undoQueue : null,
    redoQueue : null,

    ignoredFieldNames : {
        // Tree store view state should not be considered 'data' to be tracked
        expanded : 1
    },

    // one of the 'created', 'enabled', 'disabled', 'paused', 'hold'
    state : 'created',

    /**
     * @cfg {String} transactionBoundary
     *
     * Transaction boundary mode, either 'manual' or 'timeout'.
     *
     * In the 'timeout' mode, the manager waits for the first change in any store being managed and starts a transaction, i.e.
     * records any changes in its monitored stores. The transaction lasts for {@link #transactionMaxDuration} and
     * afterwards creates one undo/redo step, including all changes in the stores during that period of time.
     *
     * In 'manual' mode you have to call {@link #startTransaction} / {@link #endTransaction} to start and end
     * a transaction. Note, that in this mode a change in any tracked store will start a transaction automatically,
     * so you will need to issue a finalizing {@link #endTransaction} call manually.
     */
    transactionBoundary : 'timeout',

    /**
     * @cfg {Number} transactionMaxDuration
     *
     * The transaction duration (in ms) for the 'manual' {@link #transactionBoundary transaction boundary}
     */
    transactionMaxDuration : 100,

    /**
     * @cfg {Boolean} clearQueuesOnLoad
     *
     * True to automatically clear the queues upon 'load' and 'clear' events on any of the stores monitored
     */
    clearQueuesOnLoad : false,

    transactionTimeout : null,

    currentTransaction : null,

    /**
     * @event start Fired when the undo manager starts recording events
     *
     * @param {Robo.Manager} this
     */

    /**
     * @event stop Fired after the undo manager has stopped recording events
     *
     * @param {Robo.Manager} this
     */

    /**
     * @event transactionadd
     *
     * @param {Robo.Manager} this
     * @param {Robo.Transaction} transaction
     */

    /**
     * @event undoqueuechange
     *
     * @param {Robo.Manager} this
     * @param {[Robo.Transaction]} undoQueue
     */

    /**
     * @event redoqueuechange
     *
     * @param {Robo.Manager} this
     * @param {[Robo.Transaction]} redoQueue
     */

    /**
     * @event beforeundo Fired before an undo operation
     *
     * @param {Robo.Manager} this
     */

    /**
     * @event afterundo Fired after an undo operation
     *
     * @param {Robo.Manager} this
     */

    /**
     * @event beforeredo Fired before a redo operation
     *
     * @param {Robo.Manager} this
     */

    /**
     * @event afterredo Fired after a redo operation
     *
     * @param {Robo.Manager} this
     */

    constructor : function (config) {
        var me = this;

        config = config || {};

        Ext.apply(me, config);

        me.treeStoreListeners = {
            nodeappend     : me.onTreeStoreAppend,
            nodeinsert     : me.onTreeStoreInsert,
            noderemove     : me.onTreeStoreRemove,
            update         : me.onTreeStoreUpdate,
            'robo-command' : me.onIncomingCommand,
            scope          : me
        };

        me.flatStoreListeners = {
            add            : me.onFlatStoreAdd,
            remove         : me.onFlatStoreRemove,
            update         : me.onFlatStoreUpdate,
            'robo-command' : me.onIncomingCommand,
            scope          : me
        };

        if (me.clearQueuesOnLoad) {
            Ext.apply(me.treeStoreListeners, {
                load  : me.clearQueues,
                clear : me.clearQueues
            });

            Ext.apply(me.flatStoreListeners, {
                load  : me.clearQueues,
                clear : me.clearQueues
            });
        }

        me.callParent([config]);

        var myStores = me.stores || [];
        me.stores = [];
        me.storesById = {};

        me.undoQueue = [];
        me.redoQueue = [];

        Ext.Array.forEach(myStores, function (store) {
            me.addStore(store);
        });
    },

    /**
     * Adds a store to the list of managed stores
     *
     * @param {Ext.data.Store/String} store A data store or a 'storeId' identifier
     */
    addStore : function (store, id) {
        store = Ext.data.StoreManager.lookup(store);

        // <debug>
        Ext.Assert && Ext.Assert.isObject(store, 'Must provide a store or a valid store id');
        // </debug>
        this.stores.push(store);

        if (id) store.setStoreId(id);

        var model = store.getModel();
        var associations = model.prototype.associations || {};

        for (var roleName in associations) {
            var role = associations[roleName];
            var old = role.getAssociatedStore;

            if (old && (!role.ROBO_MANAGED || !role.ROBO_MANAGED[this.getId()])) {

                var me = this;

                role.getAssociatedStore = function () {
                    var store = old.apply(this, arguments);

                    if (!me.hasStore(store)) {
                        me.addStore(store);

                        if (me.state !== 'disabled' && me.state !== 'created') {
                            me.bindStore(store);
                        }
                    }

                    return store;
                };

                role.ROBO_MANAGED = role.ROBO_MANAGED || {};
                role.ROBO_MANAGED[this.getId()] = me;
            }
        }

        if (store.storeId) {
            this.storesById[store.storeId] = store;
        }
    },

    /**
     * Gets a store from the managed store list by its id
     *
     * @param {String} id
     * @return {Ext.data.Store}
     */
    getStoreById : function (id) {
        return this.storesById[id];
    },

    hasStore : function (store) {
        return Ext.Array.indexOf(this.stores, store) !== -1;
    },

    bindStore : function (store) {
        (store.undoRedoEventBus || store).on(this.getStoreTypeListeners(store));

        // subscribe to the stubs (empty functions) to fill the "hasListeners" cache of the store
        // this is to enable events propagation in tree store, in which event first bubbles through the
        // nodes (to the root) and then is fired on the store itself (if the "hasListeners" check passes)
        if (store.undoRedoEventBus) store.on(this.getStoreTypeListenerStubs(store));
    },

    unbindStore : function (store) {
        (store.undoRedoEventBus || store).un(this.getStoreTypeListeners(store));

        if (store.undoRedoEventBus) store.un(this.getStoreTypeListenerStubs(store));
    },

    getStoreTypeListenerStubs : function (store) {
        var me = this;
        var listeners = this.getStoreTypeListeners(store);

        listeners = Ext.apply({}, listeners);

        Ext.Object.each(listeners, function (key) {
            listeners[key] = me.stub;
        });

        return listeners;
    },

    /**
     * Returns the listeners object to use with a particular store type
     *
     * @param {Ext.data.Store} store
     * @return {Object}
     *
     * @protected
     */
    getStoreTypeListeners : function (store) {
        var listeners;

        if (Ext.data.TreeStore && store instanceof Ext.data.TreeStore) {
            listeners = this.treeStoreListeners;
        }
        else {
            listeners = this.flatStoreListeners;
        }

        return listeners;
    },

    /**
     * Removes a store from the list of managed stores
     *
     * @param {Ext.data.Store} store
     */
    removeStore : function (store) {
        Ext.Array.remove(this.stores, store);

        this.storesById[store.storeId] = null;

        this.unbindStore(store);
    },

    forEachStore : function (func) {
        Ext.Array.forEach(this.stores, func, this);
    },

    onAnyChangeInAnyStore : function (store) {
        if (this.state === 'paused' || (store.isRootSettingOrLoading && store.isRootSettingOrLoading())) {
            return false;
        }

        if (!this.currentTransaction) {
            this.startTransaction();
        }

        return true;
    },

    hasPersistableChanges : function (record, modifiedFieldNames) {
        var ignored = this.ignoredFieldNames;

        return Robo.util.Array.reduce(modifiedFieldNames, function (result, field) {
            var fieldInstance = record.getField(field);

            return result || !fieldInstance || (fieldInstance.persist && !ignored.hasOwnProperty(field));
        }, false);
    },

    onIncomingCommand : function (store, command, args) {
        args = args || [];

        var me = this;

        if (me.areIncomingCommandsEnabled()) {
            switch (command) {
                case 'pause':
                case 'resume':
                case 'endTransaction':
                case 'startTransaction':
                case 'addTransaction':
                    me[command].apply(me, args);
                    break;
            }
        }
    },

    incomingCommandsDisabled : 0,

    areIncomingCommandsEnabled : function () {
        return !this.incomingCommandsDisabled;
    },

    disableIncomingCommands : function () {
        this.incomingCommandsDisabled++;
    },

    enableIncomingCommands : function () {
        this.incomingCommandsDisabled--;
    },

    onFlatStoreUpdate : function (store, record, operation, modifiedFieldNames) {
        var me = this;

        if (!me.onAnyChangeInAnyStore(store) ||
            operation !== 'edit' ||
            !modifiedFieldNames ||
            !modifiedFieldNames.length ||
            !me.hasPersistableChanges(record, modifiedFieldNames)) {
            return;
        }

        me.currentTransaction.addAction(new Robo.action.flat.Update({
            record     : record,
            fieldNames : modifiedFieldNames.filter(function (field) {
                return !(field in me.ignoredFieldNames);
            })
        }));
    },

    onFlatStoreAdd : function (store, records, index) {
        if (!this.onAnyChangeInAnyStore(store)) {
            return;
        }

        this.currentTransaction.addAction(new Robo.action.flat.Add({
            autoSync : this.autoSync,
            store    : store,
            records  : records,
            index    : index
        }));
    },

    onFlatStoreRemove : function (store, records, index, isMove) {
        if (!this.onAnyChangeInAnyStore(store)) {
            return;
        }

        this.currentTransaction.addAction(new Robo.action.flat.Remove({
            autoSync : this.autoSync,
            store    : store,
            records  : records,
            index    : index,
            isMove   : isMove
        }));
    },

    onTreeStoreUpdate : function (store, record, operation, modifiedFieldNames) {
        var me = this;

        if (!me.onAnyChangeInAnyStore(store) ||
            operation !== 'edit' ||
            !modifiedFieldNames ||
            !modifiedFieldNames.length ||
            !me.hasPersistableChanges(record, modifiedFieldNames)) {
            return;
        }

        me.currentTransaction.addAction(new Robo.action.tree.Update({
            record     : record,
            fieldNames : modifiedFieldNames.filter(function (field) {
                return !(field in me.ignoredFieldNames);
            })
        }));
    },

    onTreeStoreAppend : function (parent, newChild) {
        if (!parent || !this.onAnyChangeInAnyStore(parent.getTreeStore())) {
            return;
        }

        if (newChild.$undoRedoMoving && newChild.$undoRedoMoving[this.getId()]) {
            delete newChild.$undoRedoMoving[this.getId()];
        }
        else {
            this.currentTransaction.addAction(new Robo.action.tree.Append({
                autoSync : this.autoSync,
                parent   : parent,
                newChild : newChild
            }));
        }
    },

    onTreeStoreInsert : function (parent, newChild, insertedBefore) {
        // Don't react to root loading
        if (!parent || !this.onAnyChangeInAnyStore(parent.getTreeStore())) {
            return;
        }

        if (newChild.$undoRedoMoving && newChild.$undoRedoMoving[this.getId()]) {
            delete newChild.$undoRedoMoving[this.getId()];
        }
        else {
            this.currentTransaction.addAction(new Robo.action.tree.Insert({
                autoSync       : this.autoSync,
                parent         : parent,
                newChild       : newChild,
                insertedBefore : insertedBefore
            }));
        }
    },

    onTreeStoreRemove : function (parent, removedChild, isMove, context) {
        if (!parent || !this.onAnyChangeInAnyStore(parent.getTreeStore())) {
            return;
        }

        if (isMove) {
            removedChild.$undoRedoMoving = removedChild.$undoRedoMoving || {};
            removedChild.$undoRedoMoving[this.getId()] = true;
        }

        this.currentTransaction.addAction(new Robo.action.tree.Remove({
            autoSync     : this.autoSync,
            parent       : parent,
            removedChild : removedChild,
            nextSibling  : context.nextSibling,
            isMove       : isMove
        }));
    },

    /**
     * Starts the undo/redo monitoring.
     */
    start : function () {
        // when we start first time - fire events to notify the possibly listening UI about our current state
        if (this.state === 'created' || this.state === 'disabled') {
            this.fireEvent('start', this);

            this.fireEvent('undoqueuechange', this, this.undoQueue);
            this.fireEvent('redoqueuechange', this, this.redoQueue);
        }

        if (this.state !== 'hold') {
            this.forEachStore(this.bindStore);
            this.state = 'enabled';
        }
    },

    /**
     * Stops the undo/redo monitoring and clears any recorded transactions (since we cannot guarantee correct
     * undo or redo after monitoring has stopped).
     */
    stop : function () {
        this.endTransaction();

        this.forEachStore(this.unbindStore);

        this.state = 'disabled';

        this.clearQueues();

        this.fireEvent('stop', this);
    },

    /**
     * Clears the undo and redo queues.
     */
    clearQueues : function () {
        this.clearUndoQueue();
        this.clearRedoQueue();
    },

    // @protected
    pause : function () {
        this.state = 'paused';
    },

    // @protected
    resume : function () {
        this.state = 'enabled';
    },

    // @protected
    hold : function () {
        // <debug>
        Ext.Assert && Ext.Assert.isObject(this.currentTransaction, 'Can\'t hold, no transaction is currently in progress');
        // </debug>

        this.state = 'hold';
    },

    // @protected
    release : function () {
        // <debug>
        Ext.Assert && Ext.Assert.isObject(this.currentTransaction, 'Can\'t release, no transaction is currently in progress');
        // </debug>
        this.state = 'enabled';
    },

    /**
     * Gets the undo queue
     *
     * @return {Robo.Transaction[]}
     */
    getUndoQueue : function () {
        return this.undoQueue.slice();
    },

    /**
     * Gets the redo queue
     *
     * @return {Robo.Transaction[]}
     */
    getRedoQueue : function () {
        return this.redoQueue.slice();
    },

    clearUndoQueue : function () {
        if (this.undoQueue.length) {
            this.undoQueue = [];
            this.fireEvent('undoqueuechange', this, this.undoQueue.slice());
        }
    },

    clearRedoQueue : function () {
        if (this.redoQueue.length) {
            this.redoQueue = [];
            this.fireEvent('redoqueuechange', this, this.redoQueue.slice());
        }
    },

    /**
     * Starts a new undo/redo transaction.
     *
     * @param {String} [title] Transaction title
     */
    startTransaction : function (title) {
        var me = this,
            transaction;

        if (me.state === 'disabled') {
            return;
        }

        if (me.currentTransaction) {
            me.endTransaction();
        }

        transaction = new Robo.Transaction({
            title : title
        });

        me.currentTransaction = transaction;

        me.notifyStoresAboutTransactionStart(transaction);

        if (me.transactionBoundary === 'timeout') {
            me.scheduleEndTransaction();
        }
    },

    scheduleEndTransaction : function () {
        var me = this;

        if (me.transactionTimeout) {
            clearTimeout(me.transactionTimeout);
        }

        me.transactionTimeout = setTimeout(function () {
            if (me.state !== 'hold') {
                me.endTransaction();
                me.transactionTimeout = null;
            }
            else {
                me.scheduleEndTransaction();
            }
        }, me.transactionMaxDuration);
    },

    /**
     * Ends the current undo/redo transaction.
     */
    endTransaction : function () {
        var me                 = this,
            currentTransaction = me.currentTransaction;

        if (!currentTransaction) {
            return false;
        }

        me.currentTransaction = null;

        if (me.transactionBoundary === 'timeout') {
            clearTimeout(me.transactionTimeout);
            me.transactionTimeout = null;
        }

        if (currentTransaction.hasActions()) {
            me.addTransaction(currentTransaction);
        }

        me.notifyStoresAboutTransactionEnd(currentTransaction);

        return currentTransaction.hasActions();
    },

    addTransaction : function (transaction) {
        this.undoQueue.push(transaction);
        this.fireEvent('undoqueuechange', this, this.undoQueue.slice());

        if (this.redoQueue.length) {
            this.redoQueue.length = 0;
            this.fireEvent('redoqueuechange', this, this.redoQueue.slice());
        }

        this.fireEvent('transactionadd', this, transaction);
    },

    /**
     * Undoes previously recorded undo/redo transaction(s), amount of transactions defined by the optional parameter.
     *
     * @param {Number} [howMany] The number of transactions to undo. Optional, default value is 1
     */
    undo : function (howMany) {
        var undoQueue = this.undoQueue,
            index,
            transaction,
            i, l      = undoQueue.length;

        if (this.state === 'disabled' || howMany === 0 || !undoQueue.length) {
            return;
        }

        // is this feature used anywhere? probably unnesessary complication
        if (howMany instanceof Robo.Transaction) {
            index = Ext.Array.indexOf(undoQueue, howMany);

            if (index === -1) {
                return;
            }

            howMany = undoQueue.length - index;
        }

        howMany = howMany || 1;

        this.fireEvent('beforeundo', this);

        this.pause();

        this.notifyStoresAboutUndoRedoStart();

        for (i = 0; i < Math.min(howMany, l); i++) {
            transaction = undoQueue.pop();

            transaction.undo();

            this.redoQueue.unshift(transaction);
        }

        this.notifyStoresAboutUndoRedoComplete();

        this.fireEvent('undoqueuechange', this, undoQueue.slice());
        this.fireEvent('redoqueuechange', this, this.redoQueue.slice());

        this.resume();

        this.fireEvent('afterundo', this);
    },

    /**
     * Redoes previously recorded undo/redo transaction(s), amount of transactions defined by the optional parameter.
     *
     * @param {Number} [howMany] how many transactions to redo. Optional, default value is 1
     */
    redo : function (howMany) {
        var redoQueue = this.redoQueue,
            transaction,
            index,
            i, l      = redoQueue.length;

        if (this.state === 'disabled' || howMany === 0 || !redoQueue.length) {
            return;
        }

        // is this feature used anywhere? probably unnesessary complication
        if (howMany instanceof Robo.Transaction) {
            index = Ext.Array.indexOf(redoQueue, howMany);

            if (index === -1) {
                return;
            }

            howMany = index + 1;
        }

        howMany = howMany || 1;

        this.fireEvent('beforeredo', this);

        this.pause();

        this.notifyStoresAboutUndoRedoStart();

        for (i = 0; i < Math.min(howMany, l); i++) {
            transaction = this.redoQueue.shift();

            transaction.redo();

            this.undoQueue.push(transaction);
        }

        this.notifyStoresAboutUndoRedoComplete();

        this.fireEvent('redoqueuechange', this, this.redoQueue.slice());
        this.fireEvent('undoqueuechange', this, this.undoQueue.slice());

        this.resume();

        this.fireEvent('afterredo', this);
    },

    /**
     * Undoes all previously recorded transactions
     */
    undoAll : function () {
        this.undo(this.undoQueue.length);
    },

    /**
     * Redoes all previously recorded transactions
     */
    redoAll : function () {
        this.redo(this.redoQueue.length);
    },

    notifyStoresAboutTransactionStart : function (transaction) {
        this.forEachStore(function (store) {
            store.onUndoRedoTransactionStart && store.onUndoRedoTransactionStart(this, transaction);
        });
    },

    notifyStoresAboutTransactionEnd : function (transaction) {
        this.forEachStore(function (store) {
            store.onUndoRedoTransactionEnd && store.onUndoRedoTransactionEnd(this, transaction);
        });
    },

    notifyStoresAboutUndoRedoStart : function () {
        this.forEachStore(function (store) {
            store.beforeUndoRedo && store.beforeUndoRedo(this);
        });
    },

    notifyStoresAboutUndoRedoComplete : function () {
        this.forEachStore(function (store) {
            store.afterUndoRedo && store.afterUndoRedo(this);
        });
    }
}, function () {

    Ext.apply(Robo, {
        VERSION : '6.1.5'
    });
});
