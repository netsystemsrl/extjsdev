/**
 * @class Gnt.data.undoredo.Manager
 * @extends Robo.Manager
 *
 * This class provides Gantt-aware undo-redo capabilities for the provided array of {@link Ext.data.Store} instances. To enable undo support for your Gantt chart stores, simply
 * create an UndoManager and configure it with your stores:
 *
 * ```
 *     var undoManager = new Gnt.data.undoredo.Manager({
 *         transactionBoundary : 'timeout',
 *         stores              : [
 *             taskStore,
 *             dependencyStore,
 *             ...
 *         ]
 *     });
 *
 *     undoManager.start();
 *
 *     yourStore.getAt(0).set('name', 'a new name');
 *
 *     undoManager.undo(); // Call 'undo' to revert last action
 * ```
 */
Ext.define('Gnt.data.undoredo.Manager', {
    extend : 'Robo.Manager',

    uses : [
        'Gnt.data.TaskStore',
        'Gnt.data.undoredo.IdConsistencyManager',
        'Gnt.data.undoredo.action.flat.Add',
        'Gnt.data.undoredo.action.flat.Remove',
        'Gnt.data.undoredo.action.taskstore.Update'
    ],

    idConsistencyManager : null,

    /**
     * @cfg {Gnt.data.CrudManager} crudManager
     * When provided, undo manager will start monitoring crud manager stores
     * and will correctly redo adding assignments/dependencies.
     */
    crudManager : null,

    constructor : function(config) {
        var crud = config.crudManager;

        if (crud) {
            config.stores = (config.stores || []).concat([
                crud.getCalendarManager(),
                crud.getTaskStore(),
                crud.getResourceStore(),
                crud.getAssignmentStore(),
                crud.getDependencyStore()
            ]);

            // Sync autoSync config, because it requires some additional logic on undomanager side
            config.autoSync = crud.autoSync;

            // Add idfield to ignored, we do not need to undo that
            config.ignoredFieldNames = Ext.apply(config.ignoredFieldNames || {}, {
                expanded : 1,
                Id       : 1
            });
        }

        this.callParent([config]);

        if (crud) {
            this.bindCrudManager(config.crudManager);
        }
    },

    bindCrudManager : function(crud) {
        var me = this;

        crud.on({
            beforesync : function () {
                me.pause();
            },
            sync       : function () {
                me.resume();
            }
        });
    },

    bindStore : function(store) {
        // When task store is added to undoredo manager we need to initialize id consistency manager on that task store
        // to keep task ids in correct state inside redo queue
        // NOTE: This manager only support one task store!
        if (store instanceof Gnt.data.TaskStore) {
            this.idConsistencyManager && this.idConsistencyManager.destroy();

            this.idConsistencyManager = new Gnt.data.undoredo.IdConsistencyManager({
                eventStore      : store,
                resourceStore   : store.getResourceStore(),
                // these two stores will hold records removed from stores and existing in redo queue
                assignmentStore : new Ext.util.Collection(),
                dependencyStore : new Ext.util.Collection()
            });
        }

        this.callParent(arguments);
    },

    onFlatStoreAdd : function(store, records, index) {
        if (!this.onAnyChangeInAnyStore(store)) {
            return;
        }

        if (this.idConsistencyManager) {
            // Dependency/assignment store contain records that are linked to tasks/resources.
            // When undoing/redoing task/resource id may change and that require us to
            // update corresponding records in the queues. To achieve that we provide
            // collection to the action, that is supposed to store all records affected
            // by action
            if (this.idConsistencyManager.getEventStore().getDependencyStore() === store) {
                this.currentTransaction.addAction(new Gnt.data.undoredo.action.flat.Add({
                    autoSync   : this.autoSync,
                    store      : store,
                    records    : records,
                    index      : index,
                    collection : this.idConsistencyManager.getDependencyStore()
                }));
            }
            else if (this.idConsistencyManager.getEventStore().getAssignmentStore() === store) {
                this.currentTransaction.addAction(new Gnt.data.undoredo.action.flat.Add({
                    autoSync   : this.autoSync,
                    store      : store,
                    records    : records,
                    index      : index,
                    collection : this.idConsistencyManager.getAssignmentStore()
                }));
            }
            else {
                this.callParent(arguments);
            }
        } else {
            this.callParent(arguments);
        }
    },

    onFlatStoreRemove : function(store, records, index, isMove) {
        if (!this.onAnyChangeInAnyStore(store)) {
            return;
        }

        if (this.idConsistencyManager) {
            // Dependency/assignment store contain records that are linked to tasks/resources.
            // When undoing/redoing task/resource id may change and that require us to
            // update corresponding records in the queues. To achieve that we provide
            // collection to the action, that is supposed to store all records affected
            // by action
            if (this.idConsistencyManager.getEventStore().getDependencyStore() === store) {
                this.currentTransaction.addAction(new Gnt.data.undoredo.action.flat.Remove({
                    autoSync   : this.autoSync,
                    store      : store,
                    records    : records,
                    index      : index,
                    isMove     : isMove,
                    collection : this.idConsistencyManager.getDependencyStore()
                }));

                this.idConsistencyManager.getDependencyStore().add(records);
            }
            else if (this.idConsistencyManager.getEventStore().getAssignmentStore() === store) {
                this.currentTransaction.addAction(new Gnt.data.undoredo.action.flat.Remove({
                    autoSync   : this.autoSync,
                    store      : store,
                    records    : records,
                    index      : index,
                    isMove     : isMove,
                    collection : this.idConsistencyManager.getAssignmentStore()
                }));

                this.idConsistencyManager.getAssignmentStore().add(records);
            }
            else {
                this.callParent(arguments);
            }
        } else {
            this.callParent(arguments);
        }
    },

    getStoreTypeListeners : function(store) {
        var me = this,
            listeners = me.callParent([store]);

        if (store instanceof Gnt.data.TaskStore) {
            listeners.update = me.onTaskStoreUpdate;
            listeners.projectionstart  = me.onTaskStoreProjectionStart;
            listeners.projectioncommit = me.onTaskStoreProjectionEnd;
            listeners.projectionreject = me.onTaskStoreProjectionEnd;
        }

        return listeners;
    },

    onTaskStoreUpdate : function(store, record, operation, modifiedFieldNames) {
        var me = this;

        if (!me.onAnyChangeInAnyStore(store) ||
            operation !== 'edit' ||
            !modifiedFieldNames ||
            !modifiedFieldNames.length ||
            !me.hasPersistableChanges(record, modifiedFieldNames)) {
            return;
        }

        me.currentTransaction.addAction(new Gnt.data.undoredo.action.taskstore.Update({
            autoSync        : me.autoSync,
            record          : record,
            fieldNames      : modifiedFieldNames.filter(function (field) { return !(field in me.ignoredFieldNames); })
        }));
    },

    onTaskStoreProjectionStart : function(store, projectionLevel) {
        var me = this;

        if (projectionLevel === 1 && me.transactionBoundary === 'timeout') {
            if (!me.currentTransaction) {
                // This will start an undo/redo transaction if one isn't started yet
                me.onAnyChangeInAnyStore(store);
            }
            if (me.currentTransaction) {
                me.hold();
            }
        }
    },

    onTaskStoreProjectionEnd : function(store, projection, data, projectionLevel) {
        var me = this;

        if (projectionLevel === 0 && me.transactionBoundary === 'timeout' && me.currentTransaction) {
            me.release();
        }
    }
});
