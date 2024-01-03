/**
 * @private
 * @experimental
 * The mixin adds support for grouping the task store by either a TaskModel field name or a custom function.
 *
 * **NOTE:** Grouping while filtering is not supported, so using the grouping feature resets filters.
 */
Ext.define('Gnt.data.mixin.Groupable', {
    extend : 'Ext.Mixin',

    mixinConfig : {
        after : {
            constructor : 'afterConstructor'
        }
    },

    currentGroupField : null,
    originalTree      : null,
    fieldsToIgnore    : null,
    realCommitFn      : null,

    // Old state of certain tree structure data fields that we modify in grouping mode
    oldFieldPersistStates : null,

    // Flat array of all parent nodes in the original taskstore before grouping
    savedParentNodes : null,

    /**
     * @return {Boolean} True if tree is grouped, and false otherwise
     */
    isTreeGrouped : function () {
        return !!this.getTreeGroupField();
    },

    /**
     * @return {String} A field name by which the store is grouped by, or `null` if it's not grouped
     */
    getTreeGroupField : function () {
        return this.currentGroupField;
    },

    afterConstructor : function () {
        var model = this.getModel();

        this.oldFieldPersistStates = {};
        this.realCommitFn          = model.prototype.commit;

        this.fieldsToIgnore = [
            'index',
            this.parentIdProperty || 'parentId',
            model.prototype.phantomParentIdField
        ];

        // Save initial persist settings to certain tree structure fields
        Ext.Array.forEach(this.fieldsToIgnore, function (field) {
            this.oldFieldPersistStates[field] = model.getField(field).persist;
        }, this);
    },

    /**
     * Groups tasks by the provided field name or a function or resets grouping if empty value is provided.
     * @param {String/Function} [fieldName] A field name or a function to group tasks by.
     *
     * ```javascript
     *     // let's group task store records by duration field values
     *     taskStore.groupBy('Duration');
     * ```
     *
     * If a function is provided it accepts a task as the only argument and grouping is done by its returning
     * value:
     *
     * ```javascript
     *     // let's get tasks grouped by their complete/incomplete status
     *     taskStore.groupBy(function (task) {
     *         return task.isComplete();
     *     });
     * ```
     *
     * Pass falsy value to clear grouping:
     *
     * ```javascript
     *     // let's reset grouping
     *     taskStore.groupBy();
     * ```
     *
     * @return {Boolean} `false` if no grouping can be performed for the field.
     */
    groupBy : function (fieldName) {
        // The node to group
        var node = this.getRoot();

        if (this.currentGroupField !== fieldName) {

            if (fieldName) {
                // Grouping while filtering is not supported
                this.clearTreeFilter();

                // Store/model modifications, undone when store is ungrouped
                this.applyStoreAndModelOverrides();

                var groups = this.groupNodeByFieldName(node, fieldName);

                // If no leaf tasks exists, just return - nothing to group
                if (groups.length === 0) {
                    this.revertStoreAndModelOverrides();

                    return false;
                }

                this.currentGroupField = fieldName;

                this.beforeTreeRestructuring();
                this.disableCommitFn();

                node.removeAll();
                node.appendChild(groups, true, false);

                this.enableCommitFn();
                this.protectGroupNodes(node);
                this.afterTreeRestructuring();

            } else if (this.isTreeGrouped()) {
                this.restoreTreeStructure();
            }
        }
    },

    protectGroupNodes : function (node) {
        // Make sure any group nodes are not considered dirty in case a store sync is performed
        Ext.Array.forEach(node.childNodes, function (group) {
            // If user deletes all children of a group node, it should stay a group
            group.convertEmptyParentToLeaf = false;

            // Group nodes should aggregate child node values
            group.refreshCalculatedParentNodeData();

            // Group nodes should never trigger a store sync, nor be marked as dirty in the UI
            group.commit(true);
        });
    },

    /**
     * Clears grouping
     */
    clearGroup : function () {
        this.groupBy();
    },

    sortGroups : function (groups, fieldName) {
        var model = this.getModel();
        var sorter;

        if (typeof fieldName === 'string') {
            var field = model.getField(fieldName);

            // <debug>
            if (!field) {
                throw new Error('No field found with name: ' + fieldName);
            }
            // </debug>

            sorter = function (group1, group2) {
                // Put No value group at the top
                if (group1._GroupValue_ === '_novalue_') return -1;
                if (group2._GroupValue_ === '_novalue_') return 1;

                // Let the field decide how to sort values
                return field.collate(group1._GroupValue_, group2._GroupValue_);
            };
        } else {
            // Sort based on the raw _GroupValue_
            sorter = function (group1, group2) {
                // Put No value group at the top
                if (group1._GroupValue_ === '_novalue_') return -1;
                if (group2._GroupValue_ === '_novalue_') return 1;

                return group1._GroupValue_ < group2._GroupValue_ ? -1 : 1;
            };
        }

        return groups.sort(sorter);
    },

    disableCommitFn : function () {
        // HACK: Ext will commit nodes as they are appended into another treenode, we need to prevent this
        var model              = this.getModel();
        model.prototype.commit = Ext.emptyFn;
    },

    enableCommitFn : function () {
        this.getModel().prototype.commit = this.realCommitFn;
    },

    applyStoreAndModelOverrides : function () {
        var model = this.getModel();

        // HACK: We need to also look in the original tree for any parent nodes which are not part of the grouped tree structure
        // This is required when rendering for example predecessor column, if a leaf task predecessor has a link to a parent task (not part
        // of the grouped store)
        this.getModelById = function (id) {
            return this.self.prototype.getModelById.call(this, id) || this.savedParentNodes[id];
        };

        Ext.Array.forEach(this.fieldsToIgnore, function (field) {
            model.getField(field).persist = false;
        });
    },

    revertStoreAndModelOverrides : function () {
        var model = this.getModel();

        delete this.getModelById;

        // Restore old persist settings to certain tree structure fields
        Ext.Object.each(this.oldFieldPersistStates, function (field, value) {
            model.getField(field).persist = value;
        });
    },

    beforeTreeRestructuring : function () {
        // While rebuilding the tree we should not recalculate any parents, due to nodes being removed
        this.suspendAutoRecalculateParents++;

        // Need to keep our own saved copy of the removed records as it may be modified by tree operations
        this.__removedNodes = this.getRemovedRecords().slice();

        // Prevent any events to fire, triggering sync on any stores etc
        this.suspendEvents();

        // Prevent dependencies from being removed during restructuring
        this.setDependencyStore(new Gnt.data.DependencyStore({
            oldStore : this.getDependencyStore()
        }));
    },

    afterTreeRestructuring : function () {
        this.suspendAutoRecalculateParents--;

        this.resumeEvents();

        this.setDependencyStore(this.getDependencyStore().oldStore);

        // HACK need to reset removed records
        this.removedNodes = this.__removedNodes;

        this.__removedNodes = null;

        // Let the world know, so the view can be updated
        this.fireEvent('refresh');
    },

    getGroupTaskConfig : function (groupValue, rawValue, child) {
        var modelPrototype = this.getModel().prototype;

        var result = {
            _GroupValue_ : groupValue,
            _RawValue_   : rawValue,
            expanded     : true
        };

        result[modelPrototype.idProperty]      = '-group-' + groupValue;
        result[modelPrototype.nameField]       = rawValue;
        result[modelPrototype.draggableField]  = false;
        result[modelPrototype.resizableField]  = false;

        if (child) {
            result.children = [child];
        }

        return result;
    },

    // Creates an array of new group nodes containing the children matching the passed fieldName.
    // Also, this method save the full tree structure of all parent nodes to be able to recreate the original tree
    groupNodeByFieldName : function (rootNode, fieldName) {
        this.savedParentNodes = this.savedParentNodes || {};

        var me               = this,
            groupTasks       = {},
            isString         = typeof fieldName === 'string',
            savedParentNodes = me.savedParentNodes,
            isStoreGrouped   = me.isTreeGrouped();

        rootNode.cascadeBy(function (task) {
            // we group only leaf tasks
            if (task.isLeaf()) {
                var groupValue = isString ? task.getGroupValue(fieldName) : fieldName.call(me, task);
                var value      = isString ? task.get(fieldName) : groupValue;

                if (value == null || value === '') groupValue = '_novalue_';

                var groupNode = groupTasks[groupValue];

                // if no such group made yet
                if (!groupNode) {
                    groupTasks[groupValue] = me.getGroupTaskConfig(groupValue, value, task);
                // add the task to existing group
                } else {
                    groupNode.children.push(task);
                }

            // summary tasks we just backup to restore when grouping is reset
            } else if (!isStoreGrouped) {
                if (!task.isRoot()) {
                    savedParentNodes[task.id] = task;
                }

                // Save old value so we can restore it
                task.__convertEmptyParentToLeaf = task.convertEmptyParentToLeaf;
                // Prevent store from reacting to 'leaf' flag changing state
                task.convertEmptyParentToLeaf = false;

                // Save a reference to the original childNodes array
                task.__children = task.childNodes.slice();
            }
        });

        if (!isStoreGrouped && Ext.Object.getKeys(groupTasks).length > 0) {
            me.beforeTreeRestructuring();

            //This creates a new full tree, all nodes are removed from "this" store after this line.
            //The leaf tasks will be automatically removed from when creating the grouped tree structure
            me.originalTree = new Ext.data.TreeModel({
                children : rootNode.childNodes.slice()
            });

            me.afterTreeRestructuring();

            // Save a shallow copy of the root children too
            me.originalTree.__children = rootNode.childNodes.slice();
        }

        // Convert to an array of groups, then sort
        groupTasks = me.sortGroups(Ext.Object.getValues(groupTasks), fieldName);

        return groupTasks;
    },

    restoreTreeStructure : function () {
        var clonedRoot   = this.originalTree;
        var removedNodes = this.getRemovedRecords().slice();
        var newNodes     = this.getNewRecords();

        this.beforeTreeRestructuring();

        function reducer (result, record) {
            if (record.phantom) {
                // if record is phantom check if it is still present in new nodes array
                if (Ext.Array.indexOf(newNodes, record) !== -1) {
                    result.push(record);
                }
            } else if (record.get('_GroupValue_') == null && Ext.Array.indexOf(removedNodes, record) === -1) {
                result.push(record);
            }
            return result;
        }

        // Put all the child nodes back in the empty parents of the cloned tree
        Ext.Array.forEach(Ext.Object.getValues(this.savedParentNodes), function (parentTask) {
            // Also need to respect any nodes that were removed while the task store was grouped
            parentTask.appendChild(Ext.Array.reduce(parentTask.__children, reducer, []));

            parentTask.convertEmptyParentToLeaf = parentTask.__convertEmptyParentToLeaf;

            delete parentTask.convertEmptyParentToLeaf;
            delete parentTask.__children;
        });

        var root = this.getRoot();

        root.removeAll();
        root.appendChild(Ext.Array.reduce(clonedRoot.__children, reducer, []).concat(newNodes));

        this.revertStoreAndModelOverrides();

        this.currentGroupField = this.savedParentNodes = this.originalTree = null;

        this.afterTreeRestructuring();
    }
});
