/**
 * This extension of EventDependencyCache is needed for backwards compatibility only. The keys of this cache are Task ids
 * (or complex keys encoding a Task id), the values are dependencies. The Task interface declares two deprecated properties
 * `successors` and `predecessors` this class fills those properties in supporting backwards compatibility.
 *
 * TODO: remove this class and modify Gnt.data.DependencyStore constructor, where instance of this class is created
 *       and assigned to `eventDependencyCache` property, when Task::successors/Task::predecessors are finaly removed
 *       and not supported anymore.
 */
Ext.define('Gnt.data.util.TaskDependencyCache', function(thisCls) {

    function keyToTask(me, k) {
        var ts;

        if (!(k instanceof Ext.data.Model)) {
            ts = me.dependencyStore.getTaskStore();
            k =  ts && ts.getModelById(k);
        }

        return k;
    }

    function fillSuccessors(me, k) {
        var t = keyToTask(me, k);
        t && (t.successors = me.getSuccessors(k));
    }

    function fillPredecessors(me, k) {
        var t = keyToTask(me, k);
        t && (t.predecessors = me.getPredecessors(k));
    }

    function clearSuccessorsPredecessors(me) {
        var ts   = me.dependencyStore.getTaskStore(),
            root = ts && ts.getRoot();

        root && root.cascadeBy(function(node) {
            node.successors   = [];
            node.predecessors = [];
        });
    }

    function fillTasksWithDepInfo(me) {
        var ts = me.dependencyStore.getTaskStore(),
            root = ts && ts.getRoot();

        root && root.cascadeBy(function(node) {
            node.successors   = me.getSuccessors(node);
            node.predecessors = me.getPredecessors(node);
        });
    }

    return {
        extend : 'Sch.data.util.EventDependencyCache',

        taskStoreDetacher : null,

        taskStoreDependencyStoreDetacher : null,

        constructor : function(dependencyStore) {
            var me = this,
                taskStore;

            me.callParent([dependencyStore]);

            function onTaskStoreRootChange(store) {
                fillTasksWithDepInfo(me);
            }

            function onTaskStoreNodeAppend(parent, node) {
                fillSuccessors(me, node);
                fillPredecessors(me, node);
            }

            function onTaskStoreNodeInsert(parent, node) {
                fillSuccessors(me, node);
                fillPredecessors(me, node);
            }

            function onTaskStoreRefresh(store) {
                fillTasksWithDepInfo(me);
            }

            function onDependencyStoreTaskStoreChange(store, taskStore) {
                attachToTaskStore(taskStore);
            }

            function onDependencyStoreRefresh(store) {
                fillTasksWithDepInfo(me);
            }

            function attachToTaskStore(store) {
                Ext.destroy(me.taskStoreDetacher);
                me.taskStoreDetacher = store && store.on({
                    'rootchange' : onTaskStoreRootChange,
                    'nodeappend' : onTaskStoreNodeAppend,
                    'nodeinsert' : onTaskStoreNodeInsert,
                    'refresh'    : onTaskStoreRefresh,
                    priority     : 99,
                    destroyable  : true
                });
                // This cache can't work lazyly, so if a task store changes then it should fill itself
                // otherwise task's `successors`, `predecessors` properties won't be up-to-date
                fillTasksWithDepInfo(me);
            }

            me.taskStoreDependencyStoreDetacher = dependencyStore.on({
                'eventstorechange' : onDependencyStoreTaskStoreChange,
                'refresh'          : onDependencyStoreRefresh,
                priority           : 100,
                destroyable        : true
            });

            attachToTaskStore(dependencyStore.getTaskStore());
        },

        destroy : function() {
            var me = this;
            me.callParent();
            Ext.destroyMembers(
                me,
                'taskStoreDetacher',
                'taskStoreDependencyStoreDetacher'
            );
        },

        addSuccessor : function(k, v) {
            var me = this;
            me.callParent([k, v]);
            fillSuccessors(me, k);
        },

        addPredecessor : function(k, v) {
            var me = this;
            me.callParent([k, v]);
            fillPredecessors(me, k);
        },

        setSuccessors : function(k, vals) {
            var me = this;
            me.callParent([k, vals]);
            fillSuccessors(me, k);
        },

        setPredecessors : function(k, vals) {
            var me = this;
            me.callParent([k, vals]);
            fillPredecessors(me, k);
        },

        removeSuccessor : function(k, v) {
            var me = this;
            me.callParent([k, v]);
            fillSuccessors(me, k);
        },

        removePredecessor : function(k, v) {
            var me = this;
            me.callParent([k, v]);
            fillPredecessors(me, k);
        },

        moveSuccessors : function(oldKey, newKey, v) {
            var me = this;
            me.callParent(arguments);
            fillSuccessors(me, oldKey);
            fillSuccessors(me, newKey);
        },

        movePredecessors : function(oldKey, newKey, v) {
            var me = this;
            me.callParent(arguments);
            fillPredecessors(me, oldKey);
            fillPredecessors(me, newKey);
        },

        clearSuccessors : function(k) {
            var me = this;
            me.callParent([k]);
            fillSuccessors(me, k);
        },

        clearPredecessors : function(k) {
            var me = this;
            me.callParent([k]);
            fillPredecessors(me, k);
        },

        clear : function(k) {
            var me = this;
            me.callParent(arguments);
            if (k) {
                fillSuccessors(me, k);
                fillPredecessors(me, k);
            }
            else {
                clearSuccessorsPredecessors(me);
            }
        }
    };
});
