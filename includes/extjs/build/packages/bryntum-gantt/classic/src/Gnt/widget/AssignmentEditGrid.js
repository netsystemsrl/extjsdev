/**
@class Gnt.widget.AssignmentEditGrid
@extends Ext.grid.Panel

A widget used to display and edit the task assignments.
You can find this widget at the `Resources` tab of {@link Gnt.widget.taskeditor.TaskEditor}.
There you can configure it through the {@link Gnt.widget.taskeditor.TaskEditor#assignmentGridConfig assignmentGridConfig} object
available both on the {@link Gnt.widget.taskeditor.TaskEditor} and on the {@link Gnt.plugin.TaskEditor} (if you use TaskEditor by plugin).

{@img gantt/images/assignment-edit-grid2.png}

{@img gantt/images/assignment-edit-grid1.png}

You can also use this grid in your components, standalone:

    // the task store of the project
    var taskStore           = myGanttPanel.taskStore

    var assignmentGrid      = new Gnt.widget.AssignmentEditGrid({
        assignmentStore         : taskStore.assignmentStore,
        resourceStore           : taskStore.resourceStore,

        // identifier of task which assignments have to be displayed
        taskId                  : 100,
        // turn off in-place resource adding
        addResources            : false,

        renderTo                : Ext.getBody(),

        width                   : 800,
        height                  : 600
    })

*/
Ext.define('Gnt.widget.AssignmentEditGrid', {
    extend      : 'Ext.grid.Panel',

    alias       : 'widget.assignmenteditgrid',

    requires    : [
        'Ext.util.Filter',
        'Ext.data.JsonStore',
        'Ext.window.MessageBox',
        'Ext.form.field.ComboBox',
        'Ext.grid.plugin.CellEditing',
        'Sch.patches.BoundList',
        'Gnt.util.Data',
        'Gnt.data.AssignmentStore',
        'Gnt.data.ResourceStore',
        'Gnt.column.ResourceName',
        'Gnt.column.AssignmentUnits'
    ],

    mixins                  : ['Gnt.mixin.Localizable'],

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore A store with assignments.
     */
    assignmentStore         : null,

    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore A store with resources.
     */
    resourceStore           : null,

    /**
     * @cfg {Boolean} readOnly Whether this grid is read only.
     */
    readOnly                : false,

    cls                     : 'gnt-assignmentgrid',

    /**
     * @cfg {Number} defaultAssignedUnits Default amount of units. This value applies for new assignments.
     */
    defaultAssignedUnits    : 100,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - confirmAddResourceTitle : 'Confirm',
            - confirmAddResourceText  : 'No resource &quot;{0}&quot; in storage yet. Would you like to add it?',
            - noValueText             : 'Please select resource to assign',
            - noResourceText          : 'No resource &quot;{0}&quot; in storage'
     */
    /**
     * @cfg {Mixed} confirmAddResourceText A title for the confirmation window when a new resource is about to be added.
     * If you set this to `false`, no confirmation window will be displayed.
     * In this mode, for every "unknown" resource name entered into the combobox field, a new resource will be created.
     * @removed 2.5 Please use {@link #confirmAddResource} and {@link #l10n} instead.
     */

    /**
     * @cfg {Boolean} confirmAddResource False to not display a confirmation window before adding a new resource.
     */
    confirmAddResource      : true,

    /**
     * @cfg {Boolean} addResources `true` to enable in-place resource adding.
     */
    addResources            : true,

    /**
     * @property {String/Number} taskId Identifier of the task to which the assignments belong.
     */
    /**
     * @cfg {String/Number} taskId The task id indicating which assignments to load.
     * **Note**, that if the task doesn't have an identifier yet (a 'phantom' record), you can use its phantomId instead.
     */
    taskId                  : null,

    refreshTimeout          : 100,

    // copy of resource store
    resourceDupStore        : null,

    // copy of resource store used for resources combobox
    // (this store is affected by filters so we don't use `resourceDupStore` to always have "clean" copy there)
    resourceComboStore      : null,

    assignmentUnitsEditor   : null,

    refreshDataSuspended    : 0,

    initComponent : function() {
        var me              = this,
            assignmentStore = me.assignmentStore,
            taskStore       = me.taskStore || assignmentStore.getTaskStore();

        // Use an Gnt.data.AssignmentStore instance since
        // we need it to play this role in case we link grid with TaskForm.taskBuffer
        if (!me.store) {
            me.store = new assignmentStore.self({
                model       : assignmentStore.model,
                taskStore   : taskStore
            });
        }

        var resourceStore = taskStore.getResourceStore();

        if (!me.resourceDupStore) {
            me.resourceDupStore = new resourceStore.self({
                sorters   : resourceStore.model.prototype.nameField,
                model     : resourceStore.model,
                taskStore : taskStore
            });
        }

        // resource combo store
        me.resourceComboStore = new resourceStore.self({
            autoLoad    : false,
            autoDestroy : true
        });

        if (me.addResources !== undefined) {
            me.addResources = me.addResources;
        }

        me.columns        = me.buildColumns();

        if (!me.readOnly) {
            me.plugins = me.buildPlugins();
        }

        me.loadResources();
        me.loadTaskAssignments();

        if (!me.tbar) me.tbar = me.buildToolbarItems();

        me.callParent(arguments);

        me.setupListeners();
    },

    setAssignmentStore : function (store) {
        var me = this;

        if (store !== me.assignmentStore) {
            me.bindAssignmentStore(store);

            me.assignmentStore = store;
        }
    },

    setResourceStore : function (store) {
        var me = this;

        if (store !== me.resourceStore) {
            me.bindResourceStore(store);

            me.resourceStore = store;
        }
    },

    bindResourceStore : function (store) {
        var me = this;

        if (me.resourceStoreDetacher) me.resourceStoreDetacher.destroy();

        if (store) {
            me.resourceStoreDetacher = me.mon(store, {
                'add'       : me.refreshResources,
                'remove'    : me.refreshResources,
                'load'      : me.refreshResources,
                'clear'     : me.refreshResources,

                scope       : me,
                destroyable : true
            });
        }
    },

    bindAssignmentStore : function (store) {
        var me = this;

        if (me.assignmentStoreDetacher) me.assignmentStoreDetacher.destroy();

        if (store) {
            me.assignmentStoreDetacher = me.mon(store, {
                'add'       : me.refreshAssignments,
                'remove'    : me.refreshAssignments,
                'load'      : me.refreshAssignments,
                'clear'     : me.refreshAssignments,

                scope       : me,
                destroyable : true
            });
        }
    },

    setupListeners : function () {
        var me = this;

        me.bindResourceStore(me.resourceStore);
        me.bindAssignmentStore(me.assignmentStore);

        me.on({
            selectionchange : function(sm, sel) {
                if (!me.dropBtn) {
                    me.dropBtn = me.down('#drop-assignment-btn');
                }
                me.dropBtn && me.dropBtn.setDisabled(!sel.length);
            }
        });
    },

    buildToolbarItems : function () {
        var me = this;

        return [
            {
                xtype       : 'button',
                iconCls     : 'x-fa fa-plus',
                text        : me.L('addAssignmentText'),
                itemId      : 'add-assignment-btn',
                handler     : function () {
                    me.insertAssignment();
                }
            },
            {
                xtype       : 'button',
                iconCls     : 'x-fa fa-trash',
                text        : me.L('dropAssignmentText'),
                itemId      : 'drop-assignment-btn',
                disabled    : true,
                handler     : function () {
                    // close all the opened editors
                    me.setActionableMode(false);

                    var recs = me.getSelectionModel().getSelection();

                    if (recs && recs.length) {
                        var index = me.store.indexOf(recs[ 0 ]);

                        me.store.remove(recs);

                        if (me.store.getCount() > 0) {
                            me.getSelectionModel().select((index === me.store.getCount()) ? index - 1 : index);
                        }
                    }
                }
            }
        ];
    },

    suspendDataRefresh : function () {
        this.refreshDataSuspended++;
    },

    resumeDataRefresh : function () {
        this.refreshDataSuspended--;
    },


    refreshResources : function () {
        if (!this.refreshDataSuspended && !this.isDestroyed) {
            this.loadResources();
        }
    },

    refreshAssignments : function () {
        if (!this.refreshDataSuspended && !this.isDestroyed) {
            this.loadTaskAssignments();
        }
    },

    loadResources : function (justResources) {
        if (!this.resourceStore) return false;

        // make a copy of resourceStore
        var data = Gnt.util.Data.cloneModelSet(this.resourceStore);

        // clone data to not affect real store
        this.resourceDupStore.loadData(data);
        this.resourceComboStore.loadData(data);

        // we reload assignments as well since they depend on resources list
        if (!justResources) {
            this.loadTaskAssignments();
        }

        return true;
    },

    afterRender : function() {
        var task;

        this.callParent(arguments);

        // if taskId was provided at construction
        if (this.taskId) {
            var taskStore   = this.taskStore || this.assignmentStore.getTaskStore();
            // trying to get task
            task            = taskStore && taskStore.getModelById(this.taskId);
        }

        if (task) {
            this.setEditableFields(task);
        }
    },

    getUnitsEditor : function () {
        if (!this.readOnly) {
            // in readOnly mode we dont have cellEditing plugin instance and thus we don't have getEditor method at all
            if (!this.assignmentUnitsEditor) this.assignmentUnitsEditor = this.down('assignmentunitscolumn').getEditor();
        }

        return this.assignmentUnitsEditor;
    },


    setEditableFields : function (task) {
        var unitsEditor     = this.getUnitsEditor();

        if (unitsEditor) {
            switch (task.getSchedulingMode()) {
                case 'DynamicAssignment' :
                    unitsEditor.setReadOnly(true);
                    break;
                default :
                    unitsEditor.setReadOnly(false);
            }
        }
    },

    /**
     * Pass 'true' to disable the cell editing
     * @param readOnly
     */
    setReadOnly : function (readOnly) {
        if (this.cellEditing) {
            if (readOnly) {
                this.cellEditing.disable();
            }
            else {
                this.cellEditing.enable();
            }
        }
    },


    /**
     * Loads task assignments from {@link #assignmentStore}.
     *
     * @param {Mixed} [taskId] The task id indicating which assignments to load.
     * If this parameter is not specified then it will use current {@link #property-taskId} value (identifier provided to this function before (if any)
     * or initially specified by {@link #cfg-taskId} config).
     * **Note**, that if the task doesn't have an identifier yet (a 'phantom' record), you can use the task phantomId instead.
     *
     * @return {Boolean} False if {@link #assignmentStore} doesn't yet exist or if no task identifier has been provided.
     * Otherwise returns `true`.
     */
    loadTaskAssignments : function (taskId) {
        taskId          = taskId || this.taskId;

        if (!taskId) return false;

        var taskStore   = this.taskStore || this.assignmentStore.getTaskStore(),
            task        = taskStore && taskStore.getModelById(taskId),
            taskAssignments;

        if (task) {
            taskAssignments = task.getAssignments();

        } else {
            if (!this.assignmentStore) return false;

            // grab assignments for this task only
            taskAssignments = this.assignmentStore.queryBy(function(a) {
                return a.getTaskId() == taskId;
            });
        }

        this.taskId     = taskId;

        var store       = this.store,
            resStore    = this.resourceDupStore,
            // clone assignments to not affect real records
            data        = Gnt.util.Data.cloneModelSet(taskAssignments, function (copiedAssignment, srcAssignment) {
                // get original resource Id
                var resId       = srcAssignment.getResourceId();
                // get cloned version of that resource
                var clonedRes   = resStore.queryBy(function (resource) {
                    var r   = resource.originalRecord;
                    return (r.getId() || r.internalId) == resId;
                });
                if (clonedRes.getCount()) {
                    clonedRes   = clonedRes.first();
                    // and bind cloned resource to copy of assignment instead of real resource
                    copiedAssignment.setResourceId(clonedRes.getId() || clonedRes.internalId);
                }
            });

        // load data to the store
        store.loadData(data);

        if (task && this.rendered) {
            this.setEditableFields(task);
        }

        return true;
    },


    /**
     * Adds a new assignment record and starts the editor.
     *
     * @param {Gnt.model.Assignment/Object} [assignment] The new assignment to be added.
     * If this parameter is not provided, a new record will be created using the TaskId of the current task,
     * empty ResourceId field and Units field set to {@link #defaultAssignedUnits} amount.
     * @param {Boolean} [doNotActivateEditor=False] `true` to just insert record without activating editor after.
     *
     * @return {Gnt.model.Assignment} The record that was added.
     */
    insertAssignment : function (assignment, doNotActivateEditor) {
        var newAssignment;

        if (!assignment || !assignment.isModel) {
            newAssignment   = new this.store.model(assignment);

            if (!assignment) {
                newAssignment.setUnits(this.defaultAssignedUnits);
            }
        }

        // Fix for Ext.Editor bug when it tries to retrieve a value from the cell
        // when the corresponding field initial value is 'undefined'
        // ..problem is the cell might also contain invalid text tooltip
        if (newAssignment.getResourceId() === undefined) {
            newAssignment.setResourceId(null);
        }

        newAssignment.setTaskId(this.taskId);

        this.store.insert(0, newAssignment);

        var me              = this,
            oldValidator    = newAssignment.isValid;

        newAssignment.isValid    = function () {
            return oldValidator.apply(this, arguments) && me.isValidAssignment(this);
        };

        // there might be no cellEditing if the grid is in readOnly mode
        if (!doNotActivateEditor && this.cellEditing) {
            this.cellEditing.startEditByPosition({ row : 0, column : 0 });
        }

        return newAssignment;
    },

    /**
     * Returns an array of task assignment error messages.
     * @return {String[]} Array of error messages.
     */
    getAssignmentErrors : function (assignment) {
        var me          = this,
            errors      = [],
            resourceId  = assignment.getResourceId();

        if (!resourceId) {
            errors.push(me.L('noValueText'));

        } else if (!me.resourceDupStore.getModelById(resourceId)) {
            errors.push(Ext.String.format(me.L('noResourceText'), resourceId));

        } else {
            me.store.each(function (record) {
                if (record.getResourceId() == resourceId && record !== assignment) {
                    errors.push(me.L('Resource is already assigned'));
                    return false;
                }
            });
        }

        return errors;
    },

    isValidAssignment : function (assignment) {
        return !this.getAssignmentErrors(assignment).length;
    },


    // @private
    buildPlugins : function() {
        var cellEditing = this.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit : 1
        });

        var oldStartEdit = cellEditing.startEdit;

        cellEditing.startEdit = function() {
            this.completeEdit();

            return oldStartEdit.apply(this, arguments);
        };

        cellEditing.on({
            beforeedit : this.onEditingStart,

            scope      : this
        });

        return [cellEditing];
    },

    hide : function () {
        this.cancelEdit();
        this.callParent(arguments);
    },

    cancelEdit : function () {
        this.cellEditing.cancelEdit();
    },

    onEditingStart  : function (ed, e) {
        var model   = this.store.model.prototype;

        if (e.field == model.resourceIdField) {
            this.assignment = e.record;
            // keep resourceId of record being edited
            this.resourceId = e.record.getResourceId();

            this.resourceComboStore.loadData(this.resourceDupStore.getRange());

            // and re-apply filter to refresh dataset
            this.resourceComboStore.filter(this.resourcesFilter);
        }
    },

    resourceRender : function (value, meta, assignment) {
        var errors  = this.getAssignmentErrors(assignment);
        var name    = assignment.getResourceName(this.resourceDupStore) || value;

        if (errors && errors.length) {
            meta.tdCls  = 'gnt-cell-invalid';
            meta.tdAttr = 'data-errorqtip="'+errors.join('<br>')+'"';
        } else {
            meta.tdCls  = '';
            meta.tdAttr = 'data-errorqtip=""';
        }

        return Ext.htmlEncode(name);
    },

    // filters resources store to exclude resources that already assigned to the task.
    filterResources : function (resource) {
        var resourceId      = resource.getId(),
            resourceField   = this.store.model.prototype.resourceIdField,
            show            = true;

        // record that is being edited should always be presented in combobox dataset
        if (resourceId !== this.resourceId) {
            // filter out already assigned resources
            this.store.each(function (assignment) {
                if (resourceId == assignment.get(resourceField)) {
                    show    = false;
                    return false;
                }
            });
        }

        return show;
    },

    onAddResourceToCombo : function (name, assignment) {
        var me       = this,
            model    = me.resourceStore.model,
            resource = {},
            result;

        // let`s add a new record with such name
        resource[model.prototype.nameField] = name;

        resource = new model(resource);
        // set resource Id equal to internalId
        // we need filled Id to combobox proper working
        if (!resource.getId()) resource.setId(resource.internalId);

        // push to the store
        var added = me.resourceDupStore.add(resource);

        if (added && added.length) {
            assignment && assignment.setResourceId(added[0].getId());
            result = added[0];
        }

        return result;
    },

    onResourceComboAssert : function (combo) {
        var me          = this,
            rawValue    = combo.getRawValue();

        if (rawValue) {

            var idx = me.resourceDupStore.findExact(combo.displayField, rawValue);

            var record  = idx !== -1 ? me.resourceDupStore.getAt(idx) : false;

            // if no matching record in the store
            if (!record) {
                var assignment = me.assignment;

                // if confirmation required
                if (me.confirmAddResource) {
                    if (!me.addResourceMessageBoxIsVisible) {
                        // HACK: extjs triggers assertValue() more than one time so we raise flag to not bother showing the message twice
                        me.addResourceMessageBoxIsVisible = true;

                        var text = Ext.String.format(me.L('confirmAddResourceText'), Ext.htmlEncode(rawValue));

                        var messageBox = Ext.Msg.confirm(me.L('confirmAddResourceTitle'), text, function (buttonId) {
                            if (buttonId === 'yes') {
                                me.onAddResourceToCombo(rawValue, assignment);
                            }
                            me.addResourceMessageBoxIsVisible = false;
                        });

                        setTimeout(function () {
                            messageBox.toFront();
                        }, 10);
                    }
                } else {
                    var newResource = me.onAddResourceToCombo(rawValue);
                    combo.getStore().add(newResource);
                    // and set combobox value
                    combo.setValue(newResource.getId());
                }
            } else {
                combo.select(record, true);
            }
        }
    },

    buildColumns : function() {
        var me  = this;

        // task name column editor
        this.resourceCombo = new Ext.form.field.ComboBox({
            queryMode        : 'local',
            store            : this.resourceComboStore,
            allowBlank       : false,
            editing          : this.addResources,
            validateOnChange : false,
            autoSelect       : false,
            forceSelection   : !this.addResources,
            valueField       : this.resourceComboStore.model.prototype.idProperty,
            displayField     : this.resourceComboStore.model.prototype.nameField,
            queryCaching     : false,
            listConfig       : {
                htmlEncode : true
            }
        });

        this.resourcesFilter    = new Ext.util.Filter({
            filterFn    : this.filterResources,
            scope       : this
        });

        if (this.addResources) {
            // add new resource record to combo store before assertValue call
            Ext.Function.interceptBefore(this.resourceCombo, 'assertValue', function () {
                me.onResourceComboAssert(this);
            });
        }

        return [
            {
                xtype           : 'resourcenamecolumn',
                editor          : this.resourceCombo,
                dataIndex       : this.assignmentStore.model.prototype.resourceIdField,
                renderer        : this.resourceRender,
                resourceStore   : me.resourceDupStore,
                scope           : this
            },
            {
                xtype           : 'assignmentunitscolumn',
                assignmentStore : this.assignmentStore,
                dataIndex       : this.assignmentStore.model.prototype.unitsField
            }
        ];
    },


    saveResources : function () {
        this.suspendDataRefresh();
        Gnt.util.Data.applyCloneChanges(this.resourceDupStore, this.resourceStore);
        this.resumeDataRefresh();
    },


    /**
     * Persists task assignments to {@link #assignmentStore}.
     * @return {Boolean} `false` if saving error occurs. Otherwise returns `true`.
     */
    saveTaskAssignments : function () {
        // suspend the grid reacting on resource and assignment store changes
        // during applying changes to these stores
        this.suspendDataRefresh();

        // first we have to save resources in case of *new* resource assignment
        this.saveResources();

        var model       = this.store.model,
            comboStore  = this.resourceDupStore,
            result      = true;

        Gnt.util.Data.applyCloneChanges(this.store, this.assignmentStore, function (data) {
            // get assigned resource
            var resource    = comboStore.getById(this.getResourceId());
            // and its original record
            if (!resource || !resource.originalRecord) {
                // normally it should`t occur this way since we had to save resources at first
                result  = false;
                return;
            }
            var r   = resource.originalRecord;
            // now let's use real resource ID for saving
            data[model.prototype.resourceIdField] = r.getId() || r.internalId;
        });

        this.resumeDataRefresh();

        return result;
    },


    isDataChanged : function() {
        var me = this;

        return me.store &&
               me.store.getUpdatedRecords().length > 0  ||
               me.store.getNewRecords().length > 0      ||
               me.store.getRemovedRecords().length > 0;
    },


    /**
     * Checks if the data in the grid store is valid.
     * @return {Boolean}
     */
    isValid : function () {
        var result  = true;
        this.store.each(function (record) {
            if (!record.isValid()) {
                result  = false;
                return false;
            }
        });
        return result;
    },

    isDataValid : function() {
        return this.isValid();
    }

});
