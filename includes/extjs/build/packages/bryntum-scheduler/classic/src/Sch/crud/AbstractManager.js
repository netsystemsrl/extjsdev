/**
 * @class Sch.crud.AbstractManager
 * @abstract
 *
 * This is an abstract class serving as the base for the Sch.data.CrudManager class.
 * It implements basic mechanisms to organize batch communication with a server.
 * Yet it does not contain methods related to _data transfer_ nor _encoding_.
 * These methods are to be provided in sub-classes by consuming the appropriate mixins.
 *
 * For example, this is how the class can be used to implement an XML encoding system:
 *
 * ```javascript
 *     // let's make new CrudManager using AJAX as a transport system and XML for encoding
 *     Ext.define('MyCrudManager', {
 *         extend  : 'Sch.crud.AbstractManager',
 *
 *         mixins  : ['Sch.crud.encoder.Xml', 'Sch.crud.transport.Ajax']
 *     });
 * ```
 *
 * # Data transfer and encoding methods
 *
 * Here are the methods that must be provided by subclasses of this class:
 *
 * - {@link #sendRequest}
 * - {@link #cancelRequest}
 * - {@link #encode}
 * - {@link #decode}
 *
 */
Ext.define('Sch.crud.AbstractManager', {

    requires : [
        'Ext.data.StoreManager'
    ],

    mixins : {
        observable : 'Ext.util.Observable'
    },

    isCrudManager : true,

    /**
     * @property {Number} revision
     * @readonly
     * The server revision stamp.
     * The _revision stamp_ is a number which should be incremented after each server-side change.
     * This property reflects the current version of the data retrieved from the server and gets updated after each {@link #load} and {@link #sync} call.
     */
    revision : null,

    /**
     * @property {Object[]} stores
     * A list of registered stores whose server communication will be collected into a single batch.
     * Each store is represented by a _store descriptor_, an object having following structure:
     * @property {String} stores.storeId Unique store identifier.
     * @property {Ext.data.AbstractStore} stores.store Store itself.
     * @property {String} [stores.phantomIdField] Set this if store model has a predefined field to keep phantom record identifier.
     * @property {String} [stores.idProperty] id field name, if it's not specified then class will try to get it from a store model.
     */

    /**
     * @cfg {Ext.data.AbstractStore[]/String[]/Object[]} stores
     * Sets the list of stores controlled by the CRUD manager.
     * Store can be provided by itself, its storeId or an object having the following structure:
     * @cfg {String} stores.storeId Unique store identifier. Under this name the store related requests/responses will be sent.
     * @cfg {Ext.data.AbstractStore} stores.store The store itself.
     * @cfg {String} [stores.phantomIdField] Set this if the store model has a predefined field to keep phantom record identifier.
     * @cfg {String} [stores.idProperty] id field name, if it's not specified then class will try to get it from a store model.
     */
    stores : null,

    /**
     * @cfg {String} storeIdProperty Name of a store property to retrieve store identifiers from.
     * Store identifier is used as a container name holding corresponding store data while transferring them to/from the server.
     * By default `storeId` property is used. And in case a container identifier has to differ this config can be used:
     *
     * ```javascript
     *     Ext.define('CatStore', {
     *         model            : 'Cat',
     *         // storeId is "meow" but for sending/receiving store data
     *         // we want have "cats" container in JSON, so we create a new property "storeIdForCrud"
     *         storeId          : 'meow',
     *         storeIdForCrud   : 'cats',
     *         proxy            : 'memory'
     *     });
     *
     *     Ext.define('MyCrudManager', {
     *         ...
     *         stores           : ['meow'],
     *         // crud manager will get store identifier from "storeIdForCrud" property
     *         storeIdProperty  : 'storeIdForCrud'
     *     });
     * ```
     * The `storeIdProperty` property can also be specified directly on a store:
     *
     * ```javascript
     *     Ext.define('CatStore', {
     *         model            : 'Cat',
     *         // storeId is "meow" but for sending/receiving store data
     *         // we want have "cats" container in JSON
     *         storeId          : 'meow',
     *         // so we create a new property "storeIdForCrud"..
     *         storeIdForCrud  : 'cats',
     *         // and point CrudManager to use it as the store identifier source
     *         storeIdProperty  : 'storeIdForCrud',
     *         proxy            : 'memory'
     *     });
     *
     *     Ext.define('DogStore', {
     *         model            : 'MyModel',
     *         // storeId is "dogs" and it will be used as a container name for the store data
     *         storeId          : 'dogs',
     *         proxy            : 'memory'
     *     });
     *
     *     Ext.define('MyCrudManager', {
     *         ...
     *         stores           : ['meow', 'dogs']
     *     });
     * ```
     *
     */
    storeIdProperty : 'storeId',

    /**
     * @cfg {String} filterParam The name of the 'filter' parameter to send in a load request.
     * This config is also can be defined and a store level:
     *
     *
     */
    filterParam : 'filter',

    storesIndex    : null,
    activeRequests : null,
    delayedSyncs   : null,

    /**
     * @method sendRequest
     * @abstract
     * Sends request to the server.
     * @param {Object} request The request to send. An object having following properties:
     * @param {String} request.data {@link #encode Encoded} request.
     * @param {String} request.type Request type, can be either `load` or `sync`
     * @param {Function} request.success Callback to be started on successful request transferring
     * @param {Function} request.failure Callback to be started on request transfer failure
     * @param {Object} request.scope A scope for the above `success` and `failure` callbacks
     * @return {Object} The request descriptor.
     */

    /**
     * @method cancelRequest
     * @abstract
     * Cancels request to the server.
     * @param {Object} request The request to cancel (a value returned by corresponding {@link #sendRequest} call).
     */

    /**
     * @method encode
     * @abstract
     * Encodes request to the server.
     * @param {Object} request The request to encode.
     * @returns {String} The encoded request.
     */

    /**
     * @method decode
     * @abstract
     * Decodes response from the server.
     * @param {String} response The response to decode.
     * @returns {Object} The decoded response.
     */

    transport : null,

    /**
     * When `true` forces the CRUD manager to process responses depending on their `type` attribute.
     * So `load` request may be responded with `sync` response for example.
     * Can be used for smart server logic allowing the server to decide when it's better to respond with a complete data set (`load` response)
     * or it's enough to return just a delta (`sync` response).
     * @cfg {Boolean} trackResponseType
     */
    trackResponseType : false,

    /**
     * @cfg {String} phantomIdField
     * Field name to be used to transfer a phantom record identifier.
     */
    phantomIdField : '$PhantomId',

    /**
     * @cfg {Boolean} autoLoad
     * `true` to automatically call {@link #load} method after creation.
     */
    autoLoad : false,

    /**
     * @cfg {Number} autoSyncTimeout
     * The timeout in milliseconds to wait before persisting changes to the server.
     * Used when {@link #autoSync} is set to `true`.
     */
    autoSyncTimeout : 100,
    /**
     * @cfg {Boolean} autoSync
     * `true` to automatically persist store changes after edits are made in any of the stores monitored.
     * Please note that sync request will not be invoked immediately but only after {@link #autoSyncTimeout} interval.
     */
    autoSync        : false,

    /**
     * @cfg {Boolean} resetIdsBeforeSync
     * `True` to reset identifiers (defined by `idProperty` config) of phantom records before submitting them to the server.
     */
    resetIdsBeforeSync : true,

    /**
     * @property {Object[]} syncApplySequence
     * An array of stores presenting an alternative sync responses apply order.
     * Each store is represented by a _store descriptor_, an object having following structure:
     * @property {String} syncApplySequence.storeId Unique store identifier.
     * @property {Ext.data.Store/Ext.data.TreeStore} syncApplySequence.store Store itself.
     * @property {String} [syncApplySequence.phantomIdField] Set this if store model has a predefined field to keep phantom record identifier.
     * @property {String} [syncApplySequence.idProperty] id field name, if it's not specified then class will try to get it from a store model.
     */

    /**
     * @cfg {String[]} syncApplySequence
     * An array of store identifiers sets an alternative sync responses apply order.
     * By default the order in which sync responses are applied to the stores is the same as they registered in.
     * But in case of some tricky dependencies between stores this order can be changed:
     *
     *```javascript
     * Ext.create('MyCrudManager', {
     *     // register stores (they will be loaded in the same order: 'store1' then 'store2' and finally 'store3')
     *     stores : ['store1', 'store2', 'store3'],
     *     // but we apply changes from server to them in an opposite order
     *     syncApplySequence : ['store3', 'store2', 'store1']
     * });
     *```
     */
    syncApplySequence : null,

    /**
     * @cfg {Boolean} writeAllFields true to write all fields from the record to the server.
     * If set to false it will only send the fields that were modified.
     * Note that any fields that have Ext.data.field.Field.persist set to false will still be
     * ignored while those with Ext.data.field.Field.critical set to true will be included.
     */
    writeAllFields : false,

    /**
     * @cfg {Boolean/String/Function} fieldMapping
     * This property is used to read the key for each value that will be sent to the server.
     * Possible values are:
     *
     * - `false` - to disable fields mapping support;
     * - `true` - to enable fields mapping and "mapping" property on a field is used to get the field name;
     * - a string defining a custom property on a field is used to get the field name;
     * - a function to perform a custom processing of the data which is going to be sent to the server.
     * Accepts `data` and `record` and expects `data` object to be changed.
     *
     * This config is needed to achive something similar to Ext.data.writer.Writer.nameProperty in ExtJS.
     * Here is an example of the mapping:
     *
     * ```javascript
     *       Ext.define('Person', {
     *           extend : 'Ext.data.Model',
     *           fields : [
     *               {
     *                   name    : 'first',
     *                   mapping : 'firstName'
     *               },
     *               {
     *                   name    : 'last',
     *                   mapping : 'lastName'
     *               },
     *               {
     *                   name : 'age'
     *               }
     *           ]
     *       });
     *
     *       new Sch.data.CrudManager({
     *           // enable field mapping support
     *           fieldMapping : true,
     *           ...
     *       });
     *
     *       // This will be sent to the server
     *       {
     *           firstName : 'first name value',
     *           lastName  : 'last name value',
     *           age       : 1
     *       }
     * ```
     *
     */
    fieldMapping : false,

    /**
     * @property {Boolean} destroyed
     * This property is set to `true` after the `destroy` method is called.
     * @protected
     */
    destroyed : false,

    ignoreUpdates : 0,

    // Flag that shows if crud manager performed successful load request
    loaded : false,

    createMissingRecords : false,
    autoSyncTimerId      : null,

    applyingLoadResponse : false,
    applyingSyncResponse : false,

    constructor : function (config) {

        config = config || {};

        this.mixins.observable.constructor.call(this, config);

        this.activeRequests = {};
        this.delayedSyncs   = [];
        this.transport      = config.transport || this.transport || {};

        // support stores defined in the class prototype as well
        var stores  = config.stores || this.stores;
        this.stores = [];
        this.addStore(stores);

        var syncApplySequence = config.syncApplySequence || this.syncApplySequence;
        if (syncApplySequence) {
            // reset this.syncApplySequence since addStoreToApplySequence() will build it
            this.syncApplySequence = null;
            this.addStoreToApplySequence(syncApplySequence);
        }

        if (this.autoLoad) this.load();
    },


    updateStoreIndex : function () {
        var storesIndex = {};

        for (var i = 0, l = this.stores.length; i < l; i++) {
            var store = this.stores[i];
            if (store.storeId) {
                storesIndex[store.storeId] = this.stores[i];
            }
        }

        this.storesIndex = storesIndex;
    },

    /**
     * Returns a registered store descriptor.
     * @param {String/Ext.data.AbstractStore} storeId The store identifier or registered store instance.
     * @returns {Object} The descriptor of the store.
     * Store descriptor is an object having following structure:
     *
     *  - `storeId` The store identifier that will be used as a key in requests.
     *  - `store` The store itself.
     *  - `idProperty` The idProperty of the store.
     *  - `phantomIdField` The field holding unique Ids of phantom records (if store has such model).
     */
    getStoreDescriptor : function (storeId) {
        if (!storeId) return;

        if (storeId.isStore) {
            for (var i = 0, l = this.stores.length; i < l; i++) {
                if (this.stores[i].store === storeId) return this.stores[i];
            }

        }
        else if (typeof storeId == 'object') {
            return this.storesIndex[storeId.storeId];

        }
        else {
            return this.storesIndex[storeId] || this.getStoreDescriptor(Ext.data.StoreManager.get(storeId));
        }
    },

    /**
     * Returns a registered store.
     * @param {String} storeId Store identifier.
     * @returns {Ext.data.AbstractStore} Found store instance.
     */
    getStore : function (storeId) {
        var storeInfo = this.getStoreDescriptor(storeId);
        return storeInfo && storeInfo.store;
    },

    forEachStore : function (fn, scope) {
        if (!fn) return;

        var stores = this.stores;

        for (var i = 0, l = stores.length; i < l; i++) {
            if (fn.call(scope || this, stores[i].store, stores[i].storeId, stores[i]) === false) break;
        }
    },


    /**
     * Adds a store to the collection.
     *
     *```javascript
     * // append stores to the end of collection
     * crudManager.addStore([
     *     store1,
     *     // storeId
     *     'bar',
     *     // store descriptor
     *     {
     *         storeId : 'foo',
     *         store   : store3
     *     },
     *     {
     *         storeId         : 'bar',
     *         store           : store4,
     *         // to write all fields of modified records
     *         writeAllFields  : true
     *     }
     * ]);
     *```
     *
     * **Note:** Order in which stores are kept in the collection is very essential sometimes.
     * Exactly in this order the loaded data will be put into each store.
     * @param {Ext.data.AbstractStore/String/Object/Ext.data.AbstractStore[]/String[]/Object[]} store
     * A store or list of stores. Each store might be specified by its instance, `storeId` or _descriptor_.
     * The _store descriptor_ is an object having following properties:
     * @param {String} store.storeId The store identifier that will be used as a key in requests.
     * @param {Ext.data.AbstractStore} store.store The store itself.
     * @param {String} [store.idProperty] The idProperty of the store. If not specified will be taken from the store model.
     * @param {String} [store.phantomIdField] The field holding unique Ids of phantom records (if store has such model).
     * @param {Boolean} [store.writeAllFields] Set to true to write all fields from modified records
     * @param {String} [store.filterParam] The name of the 'filter' parameter to send in a load request
     * @param {Number} [position] The relative position of the store. If `fromStore` is specified the this position will be taken relative to it.
     * If not specified then store(s) will be appended to the end of collection.
     * Otherwise it will be just a position in stores collection.
     *
     * ```javascript
     * // insert stores store4, store5 to the start of collection
     * crudManager.addStore([ store4, store5 ], 0);
     * ```
     *
     * @param {String/Ext.data.AbstractStore/Object} [fromStore] The store relative to which position should be calculated. Can be defined as a store identifier, instance or descriptor (the result of {@link #getStoreDescriptor} call).
     *
     * ```javascript
     * // insert store6 just before a store having storeId equal to 'foo'
     * crudManager.addStore(store6, 0, 'foo');
     *
     * // insert store7 just after store3 store
     * crudManager.addStore(store7, 1, store3);
     * ```
     */
    addStore : function (store, position, fromStore) {
        if (!store) return;

        if (!Ext.isArray(store)) store = [store];

        var data = [];

        // loop over list of stores to be added
        for (var i = 0, l = store.length; i < l; i++) {
            var storeInfo = store[i];

            // if store instance provided
            if (storeInfo.isStore) {
                storeInfo = { store : storeInfo };

            }
            else if (typeof storeInfo == 'object') {
                // normalize sub-stores (if any)
                if (storeInfo.stores) {
                    if (!Ext.isArray(storeInfo.stores)) storeInfo.stores = [storeInfo.stores];

                    for (var j = 0, n = storeInfo.stores.length; j < n; j++) {
                        var subStore     = storeInfo.stores[j],
                            subStoreInfo = subStore;

                        if ('string' === typeof subStore) {
                            subStoreInfo = { storeId : subStore };
                        }

                        // keep reference to the "master" store descriptor
                        subStoreInfo.masterStoreInfo = storeInfo;

                        storeInfo.stores[j] = subStoreInfo;
                    }
                }

                // if it's a store identifier
            }
            else {
                storeInfo = { store : Ext.data.StoreManager.get(storeInfo) };
            }

            data.push(this.fillStoreDescriptor(storeInfo));

            // if the store has "setCrudManager" hook - use it
            if (storeInfo.store.setCrudManager) {
                storeInfo.store.setCrudManager(this);

                // otherwise decorate the store w/ "crudManager" property
            }
            else {
                storeInfo.store.crudManager = this;
            }

            // Prevent any ajax proxy from loading data into the store
            if (storeInfo.store.isTreeStore) {
                storeInfo.store.setProxy({ type : 'memory' });
            }

            // Required to prevent Sencha from using setTimeout
            // https://www.sencha.com/forum/showthread.php?316098-Store.setProxy-should-change-value-of-asynchronousLoad
            storeInfo.store.setAsynchronousLoad(false);

            // listen to store changes
            this.bindStoreListeners(storeInfo.store);
        }

        // if no position specified then append stores to the end
        if (typeof position === 'undefined') {

            this.stores.push.apply(this.stores, data);

            // if position specified
        }
        else {
            var pos = position;
            // if specified the store relative to which we should insert new one(-s)
            if (fromStore) {
                if (fromStore.isStore || typeof fromStore !== 'object') fromStore = this.getStoreDescriptor(fromStore);
                // get its position
                pos += Ext.Array.indexOf(this.stores, fromStore);
            }
            // insert new store(-s)
            this.stores.splice.apply(this.stores, [].concat([pos, 0], data));
        }

        this.updateStoreIndex();
    },


    bindStoreListeners : function (store, un) {
        var listeners = {
            update : this.onStoreUpdate,
            clear  : this.onStoreChange,
            scope  : this
        };

        // tree store has specific event names
        if (store.isTreeStore) {
            Ext.apply(listeners, {
                nodeappend : this.onTreeStoreInsertOrAppend,
                nodeinsert : this.onTreeStoreInsertOrAppend,
                noderemove : this.onNodeRemove
            });
        }
        else {
            Ext.apply(listeners, {
                add    : this.onStoreChange,
                remove : this.onStoreChange
            });
        }

        if (un) {
            this.mun(store, listeners);
        }
        else {
            this.mon(store, listeners);
        }
    },

    unbindStoreListeners : function (store) {
        this.bindStoreListeners(store, true);
    },

    fillStoreDescriptor : function (descriptor) {
        var store           = descriptor.store,
            storeIdProperty = store.storeIdProperty || this.storeIdProperty,
            model           = store.getModel && store.getModel() || store.model;

        model = model && model.prototype;

        Ext.applyIf(descriptor, {
            storeId        : store[storeIdProperty],
            phantomIdField : model && model.phantomIdField,
            idProperty     : model && model.idProperty,
            writeAllFields : store.writeAllFields
        });

        return descriptor;
    },


    /**
     * Removes a store from collection. If the store was registered in alternative sync sequence list
     * it will be removed from there as well.
     *
     * ```javascript
     *    // remove store having storeId equal to "foo"
     *    crudManager.removeStore("foo");
     *
     *    // remove store3
     *    crudManager.removeStore(store3);
     * ```
     *
     * @param {Object/String/Ext.data.AbstractStore} store The store to remove. Either the store descriptor, store identifier or store itself.
     */
    removeStore : function (store) {
        for (var i = 0, l = this.stores.length; i < l; i++) {
            var s = this.stores[i];
            if (s === store || s.store === store || s.storeId === store) {

                // unbind store listeners
                this.unbindStoreListeners(s.store);

                delete this.storesIndex[s.storeId];
                this.stores.splice(i, 1);
                if (this.syncApplySequence) {
                    this.removeStoreFromApplySequence(store);
                }

                break;
            }
        }
    },

    /**
     * Adds a store to the alternative sync responses apply sequence.
     * By default the order in which sync responses are applied to the stores is the same as they registered in.
     * But this order can be changes either on construction step using {@link #syncApplySequence} option
     * or but calling this method.
     *
     * **Please note**, that if the sequence was not initialized before this method call then
     * you will have to do it yourself like this for example:
     *
     *    ```javascript
     *    // alternative sequence was not set for this crud manager
     *    // so let's fill it with existing stores keeping the same order
     *    crudManager.addStoreToApplySequence(crudManager.stores);
     *
     *    // and now we can add our new store
     *
     *    // we will load its data last
     *    crudManager.addStore(someNewStore);
     *    // but changes to it will be applied first
     *    crudManager.addStoreToApplySequence(someNewStore, 0);
     *    ```
     * add registered stores to the sequence along with the store(s) you want to add
     *
     * @param {Ext.data.AbstractStore/Object/Ext.data.AbstractStore[]/Object[]} store The store to add or its _descriptor_ (or array of stores or descriptors).
     * Where _store descriptor_ is an object having following properties:
     * @param {String} store.storeId The store identifier that will be used as a key in requests.
     * @param {Ext.data.AbstractStore} store.store The store itself.
     * @param {String} [store.idProperty] The idProperty of the store. If not specified will be taken from the store model.
     * @param {String} [store.phantomIdField] The field holding unique Ids of phantom records (if store has such model).

     * @param {Integer} [position] The relative position of the store. If `fromStore` is specified the this position will be taken relative to it.
     * If not specified then store(s) will be appended to the end of collection.
     * Otherwise it will be just a position in stores collection.
     *
     *    ```javascript
     *    // insert stores store4, store5 to the start of sequence
     *    crudManager.addStoreToApplySequence([ store4, store5 ], 0);
     *    ```
     * @param {String/Ext.data.AbstractStore/Object} [fromStore] The store relative to which position should be calculated. Can be defined as a store identifier, instance or its descriptor (the result of {@link #getStoreDescriptor} call).
     *
     *    ```javascript
     *    // insert store6 just before a store having storeId equal to 'foo'
     *    crudManager.addStoreToApplySequence(store6, 0, 'foo');
     *
     *    // insert store7 just after store3 store
     *    crudManager.addStoreToApplySequence(store7, 1, store3);
     *    ```
     */
    addStoreToApplySequence : function (store, position, fromStore) {
        if (!store) return;

        if (!Ext.isArray(store)) store = [store];

        var data = [];
        // loop over list of stores to add
        for (var i = 0, l = store.length; i < l; i++) {
            var s = this.getStoreDescriptor(store[i]);
            if (s) data.push(s);
        }

        if (!this.syncApplySequence) this.syncApplySequence = [];

        // if no position specified then append stores to the end
        if (typeof position === 'undefined') {
            this.syncApplySequence.push.apply(this.syncApplySequence, data);

            // if position specified
        }
        else {
            var pos = position;
            // if specified the store relative to which we should insert new one(-s)
            if (fromStore) {
                if (fromStore.isStore || typeof fromStore !== 'object') fromStore = this.getStoreDescriptor(fromStore);
                // get its position
                pos += Ext.Array.indexOf(this.syncApplySequence, fromStore);
            }
            // insert new store(-s)
            this.syncApplySequence.splice.apply(this.syncApplySequence, [].concat([pos, 0], data));
        }
    },


    /**
     * Removes a store from the alternative sync sequence.
     *
     *    ```javascript
     *    // remove store having storeId equal to "foo"
     *    crudManager.removeStore("foo");
     *
     *    // remove store3
     *    crudManager.removeStore(store3);
     *    ```
     *
     * @param {Object/String/Ext.data.AbstractStore} store The store to remove. Either the store descriptor, store identifier or store itself.
     */
    removeStoreFromApplySequence : function (store) {
        for (var i = 0, l = this.syncApplySequence.length; i < l; i++) {
            var s = this.syncApplySequence[i];
            if (s === store || s.store === store || s.storeId === store) {
                this.syncApplySequence.splice(i, 1);
                break;
            }
        }
    },


    onNodeRemove : function (oldParent) {
        var treeStore = oldParent && oldParent.getTreeStore();
        // "noderemove" event is fired too early and getRemovedRecords() don't not have the removed node yet
        // so we wait till tree store "endupdate" event and only then invoke "onStoreChange" method
        treeStore && treeStore.on('endupdate', this.onStoreChange, this, { single : true });
    },


    onStoreUpdate : function (store, record, operation, fields) {
        if ((!store.isTreeStore || record !== store.getRoot())) {
            // If only a single field was changed, make sure it's a persistable field to avoid full scan of the store
            // Collapsing/expanding a tree node will trigger this behavior otherwise
            var isSingleNonPersistField = fields && fields.length === 1 && record.getField(fields[0]) && !record.getField(fields[0]).persist;

            if (!isSingleNonPersistField) {
                this.onStoreChange();
            }
        }
    },

    onTreeStoreInsertOrAppend : function (parent, child) {
        if (!child.isRoot()) {
            this.onStoreChange();
        }
    },

    suspendChangesTracking : function () {
        this.ignoreUpdates++;
    },

    resumeChangesTracking : function (triggerCheck) {
        this.ignoreUpdates--;

        triggerCheck && this.onStoreChange();
    },

    onStoreChange : function () {
        if (this.ignoreUpdates) return;

        var me = this;

        /**
         * @event haschanges
         * Fires when any record in a registered stores is changed.
         *
         * ```javascript
         *     crudManager.on('haschanges', function (crud) {
         *         // enable persist changes button when some store gets changed
         *         saveButton.enable();
         *     });
         * ```
         *
         * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
         */

        if (this.hasChanges()) {

            this.fireEvent('haschanges', this);

            if (this.autoSync) {
                // add deferred call if it's not scheduled yet
                if (!this.autoSyncTimerId) {
                    this.autoSyncTimerId = setTimeout(function () {
                        me.autoSyncTimerId = null;
                        me.sync();
                    }, this.autoSyncTimeout);
                }
            }

        }
        else {
            this.fireEvent('nochanges', this);
        }
    },

    /**
     * Returns `true` if any of registered stores (or some particular store) has non persisted changes.
     *
     *    ```javascript
     *    // if we have any unsaved changes
     *    if (crudManager.hasChanges()) {
     *        // persist them
     *        crudManager.sync();
     *    // otherwise
     *    } else {
     *        alert("There are no unsaved changes...");
     *    }
     *    ```
     *
     * @param {String/Ext.data.AbstractStore} [storeId] The store identifier or store instance to check changes for.
     * If not specified then will check changes for all of the registered stores.
     * @returns {Boolean} `true` if there are not persisted changes.
     */
    hasChanges : function (storeId) {
        var store;

        if (storeId) {
            store = this.getStore(storeId);

            if (!store) return false;

            return this.isStoreDirty(store);
        }

        for (var i = 0, l = this.stores.length; i < l; i++) {
            if (this.isStoreDirty(this.stores[i].store)) return true;
        }

        return false;
    },

    isStoreDirty : function (store) {
        if (store.getRemovedRecords().length) return true;

        if (store.isTreeStore) {
            for (var o in store.byIdMap) {
                var record = store.byIdMap[o];

                // NOTE: 'expanded' might be a persitent field which a user might want to store as well,
                //       it's better to check for field persistency instead of comparing it by name.
                //
                // root node "expanded" state should not be regarded as a dirty record
                if (record.dirty === true && !record.get('root') && (Ext.Object.getKeys(record.modified).length !== 1 ||
                    (!("expanded" in record.modified) && !("lastParentId" in record.modified)))
                ) {
                    return true;
                }
                else if (!record.get('root') && record.phantom && record.isValid()) {
                    return true;
                }
            }
        }
        else {
            var records = store.getData().items;

            for (var i = 0, l = records.length; i < l; i++) {
                if (records[i].dirty || records[i].phantom) return true;
            }

        }
        return false;
    },


    getLoadPackage : function (options) {
        var pack = {
            type      : 'load',
            requestId : this.getRequestId(),
            stores    : []
        };

        var stores     = this.stores,
            packStores = pack.stores;

        for (var i = 0, l = stores.length; i < l; i++) {

            var store       = stores[i],
                filterParam = store.filterParam || store.store.filterParam || this.filterParam,
                opts        = options && options[store.storeId],
                pageSize    = store.pageSize || store.store.pageSize;

            // if the store uses remote filtering
            if (store.store.remoteFilter && filterParam) {

                opts = opts || {};

                var filters = [];

                store.store.getFilters().each(function (f) {
                    filters.push(f.serialize());
                });

                // put filters info into the package
                opts[filterParam] = filters;
            }

            if (opts || pageSize) {

                var params = Ext.apply({
                    storeId  : store.storeId,
                    page     : 1,
                    pageSize : pageSize
                }, opts);

                stores[i].currentPage = params.page;

                packStores.push(params);

            }
            else {

                packStores.push(store.storeId);

            }
        }

        return pack;
    },

    // Extracts added record data to be persisted on the server
    getAddedRecordData : function (record, phantomIdField, stores) {
        var me           = this,
            data         = record.getData({
                serialize : true,
                persist   : true
            }),
            criticalData = record.getData({
                serialize : true,
                persist   : true,
                critical  : true,
                changes   : true
            });

        // We need to have all fields including critical, but getData returns critical only if changes flag is true,
        // but if changes is true that means that only modified fields will be returned.
        // Sencha assumes that getData returns all the fields by default (including critical), but in fact it's not.
        // So we merge critical fields with all fields manually.
        data = Ext.applyIf(data, criticalData);

        if (!data.hasOwnProperty(phantomIdField)) {
            data[phantomIdField] = record.getId();
        }

        if (me.resetIdsBeforeSync) {
            delete data[record.idProperty];
        }

        me.processFieldMapping(data, record);

        // if the store has embedded ones
        if (stores) {
            me.processSubStores(record, data, stores);
        }

        return data;
    },

    prepareAdded : function (records, phantomIdField, stores) {
        return records.map(function (record) {
            return this.getAddedRecordData(record, phantomIdField, stores);
        }, this);
    },

    // Extracts updated record data to be persisted on the server
    getUpdatedRecordData : function (record, stores, storeInfo) {
        var me             = this,
            writeAllFields = storeInfo.writeAllFields || (storeInfo.writeAllFields !== false && me.writeAllFields),
            data           = record.getData({
                serialize : true,
                persist   : true,
                critical  : !writeAllFields,
                changes   : !writeAllFields
            });

        // idProperty might be missing from getData output if `changes` value is true (writeAllFields - false)
        // In that case getData will return only fields which were changed and normally exclude id field
        data[record.idProperty] = record.getId();

        for (var fieldName in data) {
            var field = record.getField(fieldName);

            var toDelete = !field || (writeAllFields ? (!field.persist && !field.critical) : !field.persist);

            // remove not persistable/critical fields if writeAllFields is true,
            // or not persistable fields only otherwise
            if (toDelete) {
                delete data[fieldName];
            }
        }

        me.processFieldMapping(data, record);

        // if the store has embedded stores
        if (stores) {
            me.processSubStores(record, data, stores);
        }

        return data;
    },

    prepareUpdated : function (records, stores, storeInfo) {
        return records.map(function (record) {
            return this.getUpdatedRecordData(record, stores, storeInfo);
        }, this)
    },

    prepareRemoved : function (records) {
        var result = [];

        for (var i = 0, l = records.length; i < l; i++) {
            var record = records[i],
                data   = {};

            data[record.idProperty] = record.getId();

            result.push(data);
        }

        return result;
    },

    // changes `data`
    processFieldMapping : function (data, record) {
        var me = this;

        if (!me.fieldMapping) return;

        // maybe custom handler is applied
        if (Ext.isFunction(me.fieldMapping)) {
            me.fieldMapping(data, record);
            return;
        }

        for (var fieldName in data) {
            var field        = record.getField(fieldName),
                newFieldName = field && field[Ext.isString(me.fieldMapping) ? me.fieldMapping : 'mapping'];

            // ignore if new name matches old name
            if (newFieldName && newFieldName !== fieldName) {
                data[newFieldName] = data[fieldName];
                delete data[fieldName];
            }
        }
    },

    processSubStores : function (record, data, stores) {
        for (var j = 0, n = stores.length; j < n; j++) {
            var id    = stores[j].storeId,
                store = record.get(id);

            // if embedded store is assigned to the record
            if (store) {
                // let's collect its changes as well
                var changes = this.getStoreChanges(Ext.apply({ store : store }, stores[j]));

                if (changes) {
                    data[id] = Ext.apply(changes, { $store : true });
                }
                else {
                    delete data[id];
                }
            }
            else {
                delete data[id];
            }
        }
    },

    getStoreChanges : function (store, phantomIdField) {
        phantomIdField = phantomIdField || store.phantomIdField || this.phantomIdField;

        var s       = store.store,
            added   = s.getNewRecords(),
            updated = s.getUpdatedRecords(),
            removed = s.getRemovedRecords(),
            // sub-stores
            stores  = store.stores;

        var result;

        if (added.length) added = this.prepareAdded(added, phantomIdField, stores);
        if (updated.length) updated = this.prepareUpdated(updated, stores, store);
        if (removed.length) removed = this.prepareRemoved(removed);

        // if this store has changes
        if (added.length || updated.length || removed.length) {

            result = {};

            if (added.length) result.added = added;
            if (updated.length) result.updated = updated;
            if (removed.length) result.removed = removed;
        }

        return result;
    },


    getChangeSetPackage : function () {
        var pack = {
            type      : 'sync',
            requestId : this.getRequestId(),
            revision  : this.revision
        };

        var stores = this.stores,
            found  = 0;

        for (var i = 0, l = stores.length; i < l; i++) {
            var store          = stores[i],
                phantomIdField = store.phantomIdField || this.phantomIdField,
                storeId        = store.storeId;

            var changes = this.getStoreChanges(store, phantomIdField);
            if (changes) {
                found++;

                pack[storeId] = changes;
            }
        }

        return found ? pack : null;
    },


    getSubStoresData : function (rows, subStores, idProperty, isTree) {
        if (!rows) return;

        var result = [];

        var processRow = function (row, subStores) {
            for (var j = 0, m = subStores.length; j < m; j++) {
                var storeId = subStores[j].storeId;
                // if row contains data for this sub-store
                if (row[storeId]) {
                    // keep them for the later loading
                    result.push({
                        id        : row[idProperty],
                        storeDesc : subStores[j],
                        data      : row[storeId]
                    });
                    // and remove reference from the row
                    delete row[storeId];
                }
            }
        };

        var i = 0, l = rows.length;

        // if it's a TreeStore
        if (isTree) {
            // loop over nodes
            for (; i < l; i++) {
                processRow(rows[i], subStores);

                // also let's grab sub-stores from node children
                var childrenSubData = this.getSubStoresData(rows[i].children, subStores, idProperty, true);
                if (childrenSubData) {
                    result = result.concat(childrenSubData);
                }
            }
            // if it's a "flat" store
        }
        else {
            for (; i < l; i++) processRow(rows[i], subStores);
        }

        return result;
    },


    loadDataToTreeStore : function (store, data, options, storeDesc) {
        var rows = data && data.rows || [];

        // Root might contain modified fields, clear them
        var root = store.getRoot();
        if (root) {
            // If 'expanded' field is persisted, view will be empty after load until we expand root again
            // 060_crud_1
            root.modified = null;
            root.reject();
        }
        store.proxy.data = rows;
        // When store is loaded filters are not applied properly. This private callback allows us to reapply filters
        // before load event
        store.load({
            onChildNodesAvailable : function () {
                var filters = this.getFilters();

                filters.beginUpdate();
                filters.endUpdate();
            }
        });
    },


    loadDataToFlatStore : function (store, data, options, storeDesc) {
        var rows = data && data.rows || [];

        store.totalCount  = data.total;
        store.currentPage = storeDesc.currentPage;

        // instantiate models since we have to pass them to "load" event
        var records = Ext.Array.map(rows, function (recordData) {
            return new store.model(recordData);
        });

        store.loadData(records, options && options.append || data.append);

        store.fireEvent('load', store, records, true);
    },

    applyMetaDataToStore : function (store, metaData) {
        if (metaData) {
            if (store.applyMetaData) {
                store.applyMetaData(metaData, this);
            }
            else {
                store.metaData = metaData;
            }
        }
    },

    loadDataToStore : function (storeDesc, data, options) {
        var store      = storeDesc.store,
            model      = store.getModel(),
            // nested stores list
            subStores  = storeDesc.stores,
            idProperty = storeDesc.idProperty || model && model.prototype && model.prototype.idProperty || 'id',
            isTree     = store.isTreeStore,
            subData;

        store.__loading = true;

        if (data) {
            // apply server provided meta data to the store
            this.applyMetaDataToStore(store, data.metaData);

            var rows = data.rows || [];

            if (rows) {
                if (subStores) subData = this.getSubStoresData(rows, subStores, idProperty, isTree);

                // use load method dependeing on store type (tree/flat)
                var loadMethod = isTree ? this.loadDataToTreeStore : this.loadDataToFlatStore;

                loadMethod.call(this, store, data, options, storeDesc);

                if (subData) {
                    // load sub-stores as well (if we have them)
                    for (var i = 0, l = subData.length; i < l; i++) {
                        var subDatum = subData[i];

                        this.loadDataToStore(
                            Ext.apply({
                                store : store[isTree ? 'getNodeById' : 'getById'](subDatum.id).get(subDatum.storeDesc.storeId)
                            }, subDatum.storeDesc),
                            subDatum.data
                        );
                    }
                }
            }
        }

        store.__loading = false;
    },


    loadData : function (response, options) {
        options = options || {};

        // we don't want reacting on store changes during loading of them
        this.suspendChangesTracking();

        // we load data to the stores in the order they're kept in this.stores array
        for (var i = 0, l = this.stores.length; i < l; i++) {
            var storeDesc = this.stores[i],
                storeId   = storeDesc.storeId,
                data      = response[storeId];

            if (data) this.loadDataToStore(storeDesc, data, options[storeId]);
        }

        this.resumeChangesTracking();
    },

    // Returns for the provided record:
    // - changes sent to the server as part of the active sync request
    // - current changes
    getRecordChangesStates : function (record, changes, stores, store) {
        var storeInfo        = this.getStoreDescriptor(store),
            idProperty       = record.idProperty,
            phantomIdField   = storeInfo && storeInfo.phantomIdField || record.phantomIdField || this.phantomIdField,
            id               = record.getId(),
            activeSync       = this.activeRequests.sync,
            currentChanges,
            sentChanges;

        // If we have info on the active sync operation
        if (activeSync && storeInfo) {
            var sentData    = activeSync.pack[storeInfo.storeId],
                syncUpdated = sentData && sentData.updated,
                syncAdded   = sentData && sentData.added;

            // Get current changes snapshot made before CM started applying the response
            var currentData    = this._currentChangeSetPackage && this._currentChangeSetPackage[storeInfo.storeId],
                currentUpdated = currentData && currentData.updated,
                currentAdded   = currentData && currentData.added;

            // Get snapshot of the record data sent to the server (if it was updated)
            sentChanges = syncUpdated && Ext.Array.findBy(syncUpdated, function (entry) { return entry[idProperty] == id; });

            // the record was updated and sent to the server
            if (sentChanges) {
                // get its current state
                currentChanges = currentUpdated && Ext.Array.findBy(currentUpdated, function (entry) { return entry[idProperty] == id; });
            }
            // ..no snapshot means the record could be sent to the server as added
            else {
                // searching the record data in sent added data
                sentChanges    = syncAdded && Ext.Array.findBy(syncAdded, function (entry) { return entry[phantomIdField] == id; });
                currentChanges = currentAdded && Ext.Array.findBy(currentAdded, function (entry) { return entry[phantomIdField] == id; });
            }
        }

        return {
            sent    : sentChanges,
            current : currentChanges
        }
    },


    // Returns true if the provided field values are equal. The method is used when applying sync response.
    isFieldValueEqual : function (record, field, value1, value2) {

        if (field.isDateField) {
            if (value1 instanceof Date) {
                value1 = field.serialize(value1);
            }
            if (value2 instanceof Date) {
                value2 = field.serialize(value2);
            }
        }

        return record.isEqual(value1, value2, field);
    },


    // Applies value to a record field. The method is used when applying sync response.
    applyChangeToField : function (record, name, value, store) {
        var parentIdProperty = store && store.parentIdProperty || 'parentId';

        // for the record ID we will use setId() call
        if (name === record.idProperty) {
            record.setId(value);
        }
        // parentId requires special treatment
        else if (name === parentIdProperty && store.isTreeStore) {
            var parent = (value && store.getNodeById(value)) || store.getRoot();

            parent.appendChild(record);
        }
        // if the field exists
        else if (record.getField(name)) {
            record.set(name, value);
        }
    },


    applyChangesToRecord : function (record, changes, stores, store) {
        var data             = record.data,
            done             = {},
            editStarted      = false,
            name;

        var changesStates    = this.getRecordChangesStates.apply(this, arguments),
            sentChanges      = changesStates.sent,
            currentChanges   = changesStates.current,
            // copy current changes to a temporary object
            tmpCurrentChanges = Ext.apply({}, currentChanges);

        // if this store has sub-stores assigned to some fields
        if (stores) {
            // then first we apply changes to that stores
            for (var j = 0, n = stores.length; j < n; j++) {
                name = stores[j].storeId;

                if (changes.hasOwnProperty(name)) {
                    // remember that we processed this field
                    done[name]   = true;
                    var subStore = record.get(name);

                    if (subStore) {
                        this.applyChangesToStore(Ext.apply({ store : subStore }, stores[j]), changes[name]);
                    }
                    else {
                        Ext.log("Can't find store for the response sub-package");
                    }
                }
            }
        }

        var hasModifiedField = false,
            // combine sent and responded changes
            fieldValues      = Ext.apply({}, changes, sentChanges),
            fieldsToCommit   = Ext.apply({}, fieldValues);

        // sanitize done fields
        // TODO adjust this to support nested stores
        for (name in done) {
            if (done.hasOwnProperty(name)) {
                delete tmpCurrentChanges[name];
            }
        }

        // Iterate over fields sent to the server combined w/ responded ones
        for (name in fieldValues) {
            if (fieldValues.hasOwnProperty(name) && !done[name]) {
                var value         = fieldValues[name];
                var field         = record.getField(name);
                // Check if the field was modified while sync was in progress
                var modifiedField = sentChanges && !this.isFieldValueEqual(record, field || name, sentChanges[name], currentChanges ? currentChanges[name] : data[name]);

                hasModifiedField = hasModifiedField || modifiedField;

                // Remove the field from tmp list of current changes
                // to have in the end list of changes made on the client during the request
                delete tmpCurrentChanges[name];

                // If the client hasn't changed the field value while waiting for response
                if (!modifiedField) {
                    // If responded value doesn't match the client one
                    if (!this.isFieldValueEqual(record, field || name, data[name], value)) {
                        // Don't commit field modified on the server
                        delete fieldsToCommit[name];

                        // we call beginEdit/endEdit only if real changes were applied
                        if (!editStarted) {
                            editStarted = true;
                            record.beginEdit();
                        }

                        // Set field value
                        this.applyChangeToField(record, name, value, store);
                    }
                }
                // Don't commit fields changed while waiting for response
                else {
                    delete fieldsToCommit[name];
                    // In case the field change was reverted on the client while new value was sent to the server
                    // and appluied there.
                    // Then the field is not marked as changed on the client.
                    // So we manually mark the record as dirty and put the field value to record.modified.
                    if (!currentChanges || !currentChanges[name]) {
                        record.dirty          = true;
                        record.modified[name] = data[name];
                    }
                }
            }
        }

        // we call beginEdit/endEdit only if real changes were applied
        if (editStarted) record.endEdit();

        // Only commit if no records changed while a sync was ongoing
        // - if no sent field was modified
        // - and no other field changes
        if (!hasModifiedField && !Ext.Object.getValues(tmpCurrentChanges).length) {
            record.commit();
        }
        else if (record.modified) {
            var toCommit = Ext.Object.getKeys(fieldsToCommit);

            for (var i = 0, l = toCommit.length; i < l; i++) {
                delete record.modified[toCommit[i]];
            }
        }

        // Record data came from the server ...shouldn't be phantom anymore
        if (record.phantom) {
            record.phantom = false;
        }
    },

    applyRemovals : function (store, removed, context) {

        var idProperty     = context.idProperty,
            removedStash   = store.isTreeStore ? store.removedNodes : store.removed,
            findByIdFn     = context.findByIdFn,
            removeRecordFn = context.removeRecordFn,
            nbrRemoved     = 0;

        for (var j = 0, k = removed.length; j < k; j++) {
            var done = false;
            var id   = removed[j][idProperty];

            // just find the record in store.removed array and delete it from it
            for (var jj = 0, kk = removedStash.length; jj < kk; jj++) {
                if (removedStash[jj].getId() == id) {
                    removedStash.splice(jj, 1);
                    done = true;
                    // number of removals applied
                    nbrRemoved++;
                    break;
                }
            }

            // if removed record in response isn`t found in store.removed
            // then probably wasn't removed on the client side yet (server driven removes)
            if (!done) {
                var record = findByIdFn(id);

                if (record) {
                    this.suspendChangesTracking();

                    removeRecordFn(record);

                    Ext.Array.remove(removedStash, record);
                    // number of removals applied
                    nbrRemoved++;

                    this.resumeChangesTracking();
                }
                else {
                    Ext.log("Can't find record to remove from the response package");
                }
            }
        }

        return nbrRemoved;
    },


    getApplyChangesToStoreHelpers : function (store) {

        // TODO: this might need to be refactored taking Sch.data.mixin.UniversalModelGetter methods into account

        // if it's a tree store
        if (store.isTreeStore) {
            var findNode         = function (id) { return store.getNodeById(id); },
                parentIdProperty = store.parentIdProperty || 'parentId';

            return {
                findByPhantomFn : findNode,
                findByIdFn      : findNode,

                addRecordFn    : function (data) {
                    var parent = (data[parentIdProperty] && store.getNodeById(data[parentIdProperty])) || store.getRoot();

                    return parent.appendChild(data);
                },
                removeRecordFn : function (record) {
                    return record.parentNode.removeChild(record);
                }
            };

            // plain store
        }
        else {
            return {
                findByPhantomFn : function (id) { return store.data.getByKey(id); },
                findByIdFn      : function (id) { return store.getById(id); },
                addRecordFn     : function (data) { return store.add(data)[0]; },
                removeRecordFn  : function (record) { return store.remove(record); }
            };
        }
    },


    applyChangesToStore : function (storeDesc, storeResponse) {
        var me             = this,
            phantomIdField = storeDesc.phantomIdField || me.phantomIdField,
            idProperty     = storeDesc.idProperty,
            store          = storeDesc.store;

        if (!idProperty) {
            var model  = store.getModel && store.getModel() || store.model;
            model      = model && model.prototype;
            idProperty = model && model.idProperty || 'id';
        }

        var helpers         = me.getApplyChangesToStoreHelpers(store),
            findByPhantomFn = helpers.findByPhantomFn,
            findByIdFn      = helpers.findByIdFn,
            addRecordFn     = helpers.addRecordFn,
            removeRecordFn  = helpers.removeRecordFn,
            metaData        = storeResponse.metaData,
            rows            = storeResponse.rows,
            removedRecords  = storeResponse.removed,
            nbrRemoved      = 0,
            record;

        // apply server provided meta data to the store
        metaData && me.applyMetaDataToStore(store, metaData);

        if (removedRecords) {
            // process removed records
            nbrRemoved = me.applyRemovals(store, removedRecords, {
                idProperty     : idProperty,
                findByIdFn     : findByIdFn,
                removeRecordFn : removeRecordFn
            });
        }

        // process added/updated records
        if (rows) {

            var data, id, phantomId, hasPhantomId, hasId,
                // sub-stores
                stores = storeDesc.stores;

            for (var j = 0, k = rows.length; j < k; j++) {
                data         = rows[j];
                phantomId    = data[phantomIdField];
                id           = data[idProperty];
                hasPhantomId = phantomId != null && phantomId !== '';
                hasId        = id != null && id !== '';
                record       = null;

                // if phantomId is provided then we will use it to find persisted phantom record
                if (hasPhantomId) {
                    record = findByPhantomFn(phantomId);
                }
                // if id is provided then we will use it to find updated (or pushed by the server) record
                else if (hasId) {
                    record = findByIdFn(id);
                }

                // record found - apply changes to it
                if (record) {
                    me.applyChangesToRecord(record, data, stores, store);
                }
                // record not found
                else {
                    var removedStash = store.getRemovedRecords();

                    // add it if it was not removed while sync was in progress
                    if (
                        !removedStash.length
                        || (!hasId && !hasPhantomId)
                        || !Ext.Array.findBy(removedStash, id ? function (entry) { return entry.getId() == id } : function (entry) { return entry.data[phantomIdField] == phantomId })
                    ) {
                        // create new record in the store
                        record = addRecordFn(data);
                        record.commit();
                    }
                }
            }
        }

        if (nbrRemoved > 0) {
            store.fireEvent('datachanged', store);
            // HACK Fire an event (Ext JS private event) indicating records were committed in the store
            store.fireEvent('commit', store);
        }
    },


    applySyncResponse : function (response) {
        this.applyingSyncResponse = true;
        this.suspendChangesTracking();

        // remember modified data state before we start applying the response
        this._currentChangeSetPackage = this.getChangeSetPackage();

        // we apply received changes to the stores in the order they're kept in either this.syncApplySequence or this.stores array
        var stores = this.syncApplySequence || this.stores;
        for (var i = 0, l = stores.length; i < l; i++) {
            var storeResponse = response[stores[i].storeId];

            if (storeResponse) {
                this.applyChangesToStore(stores[i], storeResponse);
            }
        }

        this.applyingSyncResponse = false;
        this.resumeChangesTracking();
    },

    applyLoadResponse : function (response, options) {
        this.applyingLoadResponse = true;

        this.loadData(response, options);

        this.applyingLoadResponse = false;
    },


    applyResponse : function (requestType, response, options) {
        // in trackResponseType we check response type before deciding how to react on the response
        if (this.trackResponseType) {
            requestType = response.type || requestType;
        }

        switch (requestType) {
            case 'load' :
                this.applyLoadResponse(response, options);
                break;
            case 'sync' :
                this.applySyncResponse(response);
                break;
        }
    },


    /**
     * Generates unique request identifier.
     * @protected
     * @template
     * @return {Integer} The request identifier.
     */
    getRequestId : function () {
        return Math.floor(Math.random() * Date.now());
    },


    onResponse : function (requestType, rawResponse, responseOptions, options) {
        var response = this.decode(rawResponse);

        if (!response || !response.success) {

            /**
             * @event requestfail
             * Fires when a request gets failed.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {String} requestType The request type (`sync` or `load`).
             * @param {Object} response The decoded server response object.
             * @param {Object} responseOptions The response options.
             */
            this.fireEvent('requestfail', this, requestType, response, responseOptions);
            /**
             * @event loadfail
             * Fires when {@link #load load request} gets failed.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {Object} response The decoded server response object.
             * @param {Object} responseOptions The response options.
             * @param {Object} options Options provided to the {@link #load} method.
             */
            /**
             * @event syncfail
             * Fires when {@link #sync sync request} gets failed.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {Object} response The decoded server response object.
             * @param {Object} responseOptions The response options.
             */
            this.fireEvent(requestType + 'fail', this, response, responseOptions, options);

            // convert rawResponse to string to avoid exception in further rawResponse.length get
            if ('string' != typeof rawResponse) {
                rawResponse = '' + rawResponse;
            }

            this.warn('CrudManager: ' + requestType + ' failed, please inspect the server response', rawResponse.length < 1024 * 1024 && rawResponse || '');

        }
        else {

            /**
             * @event requestsuccess
             * Fires when a request is done right after the response is decoded successfully and before it's applied to the stores.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {String} requestType The request type (`sync` or `load`).
             * @param {Object} response The decoded server response object.
             * @param {Object} responseOptions The response options.
             */
            this.fireEvent('requestsuccess', this, requestType, response, responseOptions);
            /**
             * @event loadsuccess
             * Fires when a {@link #load load request} is done right after the response is decoded successfully and before it's applied to the stores.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {String} requestType The request type (`sync` or `load`).
             * @param {Object} response The decoded server response object.
             * @param {Object} responseOptions The response options.
             */
            /**
             * @event syncsuccess
             * Fires when a {@link #sync sync request} is done right after the response is decoded successfully and before it's applied to the stores.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {String} requestType The request type (`sync` or `load`).
             * @param {Object} response The decoded server response object.
             * @param {Object} responseOptions The response options.
             */
            this.fireEvent(requestType + 'success', this, response, responseOptions, options);

            /**
             * @event beforeresponseapply
             * @preventable
             * Fires before server response gets applied to the stores. Return `false` to prevent data applying.
             * This event can be used for server data preprocessing. To achieve it user can modify the `response` object.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {String} requestType The request type (`sync` or `load`).
             * @param {Object} response The decoded server response object.
             */
            /**
             * @event beforeloadapply
             * @preventable
             * Fires before loaded data get applied to the stores. Return `false` to prevent data applying.
             * This event can be used for server data preprocessing. To achieve it user can modify the `response` object.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {Object} response The decoded server response object.
             * @param {Object} options Options provided to the {@link #load} method.
             */
            /**
             * @event beforesyncapply
             * @preventable
             * Fires before sync response data get applied to the stores. Return `false` to prevent data applying.
             * This event can be used for server data preprocessing. To achieve it user can modify the `response` object.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {Object} response The decoded server response object.
             * @param {Object} options Options provided to the {@link #sync} method.
             */
            if ((this.fireEvent('beforeresponseapply', this, requestType, response) !== false) && (this.fireEvent('before' + requestType + 'apply', this, response, options) !== false)) {

                this.revision = response.revision;

                this.applyResponse(requestType, response, options);

                /**
                 * @event requestdone
                 * Fires on successful request completion after data gets applied to the stores.
                 * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
                 * @param {String} requestType The request type (`sync` or `load`).
                 * @param {Object} response The decoded server response object.
                 * @param {Object} responseOptions The server response options.
                 */
                this.fireEvent('requestdone', this, requestType, response, responseOptions);
                /**
                 * @event load
                 * Fires on successful {@link #load load request} completion after data gets loaded to the stores.
                 * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
                 * @param {Object} response The decoded server response object.
                 * @param {Object} responseOptions The server response options.
                 * @param {Object} options Options provided to the {@link #load} method.
                 */
                /**
                 * @event sync
                 * Fires on successful {@link #sync sync request} completion.
                 * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
                 * @param {Object} response The decoded server response object.
                 * @param {Object} responseOptions The server response options.
                 */
                this.fireEvent(requestType, this, response, responseOptions, options);

                if (requestType === 'load' || !this.hasChanges()) {
                    /**
                     * @event nochanges
                     * Fires when registered stores get into state when they don't have any
                     * not persisted change. This happens after {@link #method-load load} or {@link #method-sync sync} request
                     * completion. Or this may happen after a record update which turns its fields back to their original state.
                     *
                     * ```javascript
                     *     crudManager.on('nochanges', function (crud) {
                     *         // disable persist changes button when there is no changes
                     *         saveButton.disable();
                     *     });
                     * ```
                     *
                     * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
                     */
                    this.fireEvent('nochanges', this);
                }
            }
            else {
                this.fireEvent('responseapplycancelled', this, requestType, response);
                this.fireEvent(requestType + 'applycancelled', this, response, options);
            }
        }

        // reset last requested package ID
        this.activeRequests[requestType] = null;

        return response;
    },


    onLoad : function (rawResponse, responseOptions, options) {
        // Successful load request, mark crud manager as loaded
        this.loaded = true;
        return this.onResponse('load', rawResponse, responseOptions, options);
    },


    onSync : function (rawResponse, responseOptions, options) {
        return this.onResponse('sync', rawResponse, responseOptions, options);
    },

    /**
     * Loads data to the stores registered in the crud manager. For example:
     *
     *    ```javascript
     *    crudManager.load(
     *        // here are request parameters
     *        {
     *            store1 : { append : true, page : 3, smth : 'foo' },
     *            store2 : { page : 2, bar : '!!!' }
     *        },
     *        // here is callback
     *        function () { alert('OMG! It works!') },
     *        // here is errback
     *        function (response) { alert('Oops: '+response.message); }
     *    );
     *    ```
     *
     * ** Note: ** If there is an incomplete load request in progress then system will try to cancel it by {@link #cancelRequest} calling.
     * @param {Object} [parameters] The request parameters. This argument can be omitted like this:
     *
     *    ```javascript
     *    crudManager.load(
     *        // here is callback
     *        function () { alert('OMG! It works!') },
     *        // here is errback
     *        function (response) { alert('Oops: '+response.message); }
     *    );
     *    ```
     *
     * When presented it should be an object where keys are store Ids and values are, in turn, objects
     * of parameters related to the corresponding store. And these parameters will be transferred with a load request.
     *
     *    ```javascript
     *    {
     *        store1 : { page : 3, append : true, smth : 'foo' },
     *        store2 : { page : 2, bar : '!!!' }
     *    },
     *    ```
     *
     * Additionally for flat stores `append: true` can be specified to add loaded records to the existing records, default is to remove corresponding store's existing records first.
     * And for tree stores you can use Ext.data.TreeStore.clearOnLoad option to achieve a similar result.
     * **Please note** that for delta loading you can also use an {@link #trackResponseType alternative approach}.
     * @param {Function} [callback] An optional callback to be started on successful request completion.
     * There is also a {@link #event-load load} event which can be used for load request completion processing.
     * @param {Function} [errback] A callback to be started on request failure.
     * There is also an {@link #loadfail} event which can be used for load request failures processing.
     * @param {Object/Function} [scope] A scope to be used for `callback` and `errback` calls.
     */
    load : function (callback, errback, scope) {
        var options;

        if (typeof callback === 'object') {
            options  = callback;
            callback = errback;
            errback  = scope;
            scope    = arguments[3];
        }

        var pack = this.getLoadPackage(options);

        /**
         * @event beforeload
         * @preventable
         * Fires before {@link #load load request} is sent. Return `false` to cancel load request.
         * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
         * @param {Object} request The request object.
         */
        if (this.fireEvent('beforeload', this, pack) !== false) {
            scope = scope || this;

            // if another load request is in progress let's cancel it
            if (this.activeRequests.load) {
                this.cancelRequest(this.activeRequests.load.desc);

                this.fireEvent('loadcanceled', this, pack);
            }

            this.activeRequests.load = { id : pack.requestId };

            this.activeRequests.load.desc = this.sendRequest({
                data    : this.encode(pack),
                type    : 'load',
                success : function (rawResponse, responseOptions) {
                    var response = this.onLoad(rawResponse, responseOptions, options);

                    if (errback && (!response || !response.success)) {
                        errback.call(scope, response, rawResponse, options);

                    }
                    else if (callback) {
                        callback.call(scope, response, rawResponse, options);
                    }
                },
                failure : function (rawResponse, responseOptions) {
                    this.onLoad(rawResponse, responseOptions);

                    if (errback) errback.apply(scope, arguments);
                },
                scope   : this
            });
            // if loading was canceled let's fire event
        }
        else {
            /**
             * @event loadcanceled
             * Fired after {@link #load load request} was canceled by some {@link #beforeload} listener
             * or due to incomplete prior load request.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {Object} request The request object.
             */
            this.fireEvent('loadcanceled', this, pack);
        }
    },

    /**
     * Persists changes made on the registered stores to the server.
     * Request runs asynchronously so if some code needs to run after the request completion it has to be provided in the `callback` function:
     *
     * ```javascript
     *     // persist and run a callback on request completion
     *     sync(function(){ alert("Changes saved..."); }, function(response){ alert("Error: "+response.message); });
     * ```
     *
     * ** Note: ** If there is another incomplete sync request in progress then system will queue the call and delay it until previous request completion.
     * In this case {@link #syncdelayed} event will be fired.
     *
     * ** Note: ** Please take a look at {@link #autoSync} config. This option allows to persist changes automatically after any data modification.
     *
     * @param {Function} [callback] A function to start on successful request completion.
     * There is also a {@link #event-sync sync} event which can be used for sync request completion processing.
     *
     * **Note:** If there is no changes to persist then callback will be started immediately without sending any request
     * and {@link #event-sync sync} event will not be fired.
     * @param {Function} [errback] A function to start on request failure.
     * There is also an {@link #syncfail} event which can be used for sync request failures processing.
     * @param {Object} [scope] A scope for above `callback` and `errback` functions.
     */
    sync : function (callback, errback, scope) {
        if (this.activeRequests.sync) {
            // let's delay this call and start it only after server response
            this.delayedSyncs.push(arguments);

            /**
             * @event syncdelayed
             * Fires after {@link #sync sync request} was delayed due to incomplete previous one.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {Object} arguments The arguments of {@link #sync} call.
             */
            this.fireEvent('syncdelayed', this, arguments);

            return;
        }

        // get current changes set package
        var pack = this.getChangeSetPackage();

        scope = scope || this;

        // if no data to persist we run callback and exit
        if (!pack) {
            if (callback) callback.call(scope, null, null);

            return;
        }

        /**
         * @event beforesync
         * @preventable
         * Fires before {@link #sync sync request} is sent. Return `false` to cancel sync request.
         *
         * ```javascript
         *     crudManager.on('beforesync', function() {
         *        // cannot persist changes before at least one record is added
         *        // to the `someStore` store
         *        if (!someStore.getCount()) return false;
         *     });
         * ```
         * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
         * @param {Object} request The request object.
         */
        if (this.fireEvent('beforesync', this, pack) === false) {
            // if this sync was canceled let's fire event about it
            /**
             * @event synccanceled
             * Fires after {@link #sync sync request} was canceled by some {@link #beforesync} listener.
             * @param {Sch.crud.AbstractManager} crudManager The CRUD manager.
             * @param {Object} request The request object.
             */
            this.fireEvent('synccanceled', this, pack);

            return;
        }

        // keep active request data
        this.activeRequests.sync = {
            id   : pack.requestId,
            pack : pack
        };

        // send sync package
        this.activeRequests.sync.desc = this.sendRequest({
            data    : this.encode(pack),
            type    : 'sync',
            success : function (rawResponse, options) {
                var request  = this.activeRequests.sync;
                var response = this.onSync(rawResponse, options);

                if (errback && (!response || !response.success)) {
                    errback.call(scope, response, rawResponse, request);

                }
                else if (callback) {
                    callback.call(scope, response, rawResponse, request);
                }

                // execute delayed sync() call
                this.runDelayedSync();
            },
            failure : function (rawResponse, options) {
                this.onSync(rawResponse, options);

                if (errback) errback.apply(scope, arguments);

                // execute delayed sync() call
                this.runDelayedSync();
            },
            scope   : this
        });
    },


    runDelayedSync : function () {
        var args = this.delayedSyncs.shift();
        if (!args) return;

        this.sync.apply(this, args);
    },

    /**
     * Commits all records changes of all the registered stores.
     * @deprecated We plan to remove this method so please use store `commitChanges` method instead.
     */
    commit : function () {
        for (var i = 0, l = this.stores.length; i < l; i++) {
            var store = this.stores[i].store;

            // Need to suspend events here, for the commit to be 100% done before event is fired
            // Assignment column rendering looks at removed records to decide if a task resource assignment is 'dirty'
            // If we react to 'commit' operation of the store, the internal removedRecords array of the store has not yet been cleared
            store.suspendEvents(true);
            store.commitChanges();
            store.resumeEvents();
        }
    },

    /**
     * Rejects all records changes on all stores and re-insert any records that were removed locally. Any phantom records will be removed.
     * @deprecated We plan to remove this method so please use store `rejectChanges` method instead.
     */
    reject : function () {
        for (var i = 0, l = this.stores.length; i < l; i++) {
            this.stores[i].store.rejectChanges();
        }
    },

    warn : function () {
        if ('console' in window) {
            var c = console;
            c.log && c.log.apply && c.log.apply(c, arguments);
        }
    },

    // Used to help the UI know if the manager is already working and a loadmask should be shown when a consuming UI panel is created.
    isLoading : function () {
        return Boolean(this.activeRequests.load || this.applyingLoadResponse);
    },

    /**
     * Removes all stores and cancels active requests.
     */
    destroy : function () {
        var me = this;

        if (me.destroyed)
            return;

        me.activeRequests.load && me.cancelRequest(me.activeRequests.load.desc);
        me.activeRequests.sync && me.cancelRequest(me.activeRequests.sync.desc);

        while(me.stores.length > 0) {
            me.removeStore(me.stores[0]);
        }

        clearTimeout(me.autoSyncTimerId);

        me.destroyed = true;
    }
});
