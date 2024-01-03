/**
 @class Gnt.widget.DependencyGrid
 @extends Ext.grid.Panel

 A widget used to display and edit the dependencies of a task.
 This widget is used as the `Predecessors` tab of the {@link Gnt.widget.taskeditor.TaskEditor}.
 There you can configure it through the {@link Gnt.widget.taskeditor.TaskEditor#dependencyGridConfig dependencyGridConfig} object
 available both on the {@link Gnt.widget.taskeditor.TaskEditor} and on the {@link Gnt.plugin.TaskEditor} classes.

 {@img gantt/images/dependency-grid.png}

 You can create an instance of the grid like this:

```javascript
 dependencyGrid = Ext.create('Gnt.widget.DependencyGrid', {
     renderTo : Ext.getBody()
 });
```

 To load data into the grid you can use the {@link #loadDependencies} method:

```javascript
 // create grid
 dependencyGrid = Ext.create('Gnt.widget.DependencyGrid', {
     renderTo : Ext.getBody()
 });

 // load data
 dependencyGrid.loadDependencies(someTask);
```

 * **Note:** If you plan to use this grid for tasks that don't belong to any taskStore you should specify a {@link #dependencyStore}:

```javascript
 dependencyGrid = Ext.create('Gnt.widget.DependencyGrid', {
     renderTo        : Ext.getBody(),
     dependencyStore : dependencyStore
 });
```

 Let's make our example more interesting by adding toolbar with buttons for editing:

```javascript
 dependencyGrid = Ext.create('Gnt.widget.DependencyGrid', {
     renderTo        : Ext.getBody(),
     dependencyStore : dependencyStore,

     // toolbar with buttons
     tbar            : {
         items   : [
             {
                 xtype       : 'button',
                 iconCls     : 'add',
                 text        : 'Add',
                 handler     : function() {
                     dependencyGrid.insertDependency();
                 }
             },
             {
                 xtype       : 'button',
                 iconCls     : 'remove',
                 text        : 'Remove',
                 handler     : function() {
                     var recs = dependencyGrid.getSelectionModel().getSelection();
                     if (recs && recs.length) {
                         dependencyGrid.store.remove(recs);
                     }
                 }
             }
         ]
     }
 });
```

# Set grid direction

 By default this grid displays predecessors of a task. To display successors instead, set the {@link #cfg-direction} config to 'successors'.
 Example:

```javascript
 dependencyGrid = Ext.create('Gnt.widget.DependencyGrid', {
     // set grid to display successors
     direction : 'successors'
 });
```

# Embedded checks

 This class contains embedded transitivity and cycle detection algorithms. It runs them every time a new dependency is being added.
 * **For example**: There is `Task A`->`Task B` and `Task B`->`Task C` dependencies.
 In this case dependency `Task A`->`Task C` will be **transitive** and therefore will be considered invalid.
 And dependency `Task C`->`Task A` (or `Task B`->`Task A`) will form a **cycle** and will also be considered invalid.

 */
Ext.define('Gnt.widget.DependencyGrid', {
    extend : 'Ext.grid.Panel',
    alias  : 'widget.dependencygrid',

    requires : [
        'Ext.data.JsonStore',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.ComboBox',
        'Ext.util.Filter',
        'Sch.patches.BoundList',
        'Sch.util.Date',
        'Gnt.model.Dependency',
        'Gnt.model.Task',
        'Gnt.util.Data',
        'Gnt.field.Duration'
    ],

    mixins : ['Gnt.mixin.Localizable'],

    /**
     * @cfg {Boolean} readOnly Whether this grid is read only.
     */
    readOnly : false,

    /**
     * @cfg {Boolean} showCls Whether to show the column for `Cls` field of the dependencies.
     */
    showCls : false,

    cls : 'gnt-dependencygrid',

    /**
     * @property {Gnt.model.Task} task The task for which the dependencies are to be displayed.
     * @readonly
     */
    task : null,

    /**
     * @cfg {Gnt.data.DependencyStore} dependencyStore A store with dependencies.
     */
    dependencyStore : null,

    /**
     * @cfg {Gnt.model.Task} taskModel A task model class.
     * **Note:** This setting might be required when the grid shows dependencies of a task which subclasses {@link Gnt.model.Task}
     * and does not belong to any task store (if task store is not specified in dependency store).
     */
    taskModel : null,

    /**
     * @property {String} direction The type of dependencies that are displayed in the grid. Either 'predecessors' or 'successors'.
     * @readonly
     * **Note:** You should use this property for *reading only*.
     */

    /**
     * @cfg {String} direction Defines what kind of dependencies will be displayed in a grid. Either 'predecessors' or 'successors'.
     */
    direction : 'predecessors',

    oppositeStore : null,

    taskStoreListeners : null,

    refreshTimeout : 100,
    dependencyModel : 'Gnt.model.Dependency',

    /**
     * @cfg {Boolean} allowParentTaskDependencies Set to `true` to include parent tasks in the list of possible predecessors/successors.
     * @removed The panel now takes {@link Gnt.data.DependencyStore#allowParentTaskDependencies} setting into account.
     */
    allowParentTaskDependencies : false,

    /**
     * @cfg {Boolean} useSequenceNumber Set to `true` to use auto-generated sequential identifiers
     * to reference other tasks (see {@link Gnt.model.Task#getSequenceNumber} for definition).
     * If value is `false` then "real" id (that is stored in the database) will be used.
     */
    useSequenceNumber : false,

    /**
     * @cfg {Object} l10n
     * A object, purposed for class localization. Contains the following keys/values:

     - idText                      : 'ID',
     - taskText                    : 'Task Name',
     - blankTaskText               : 'Please select task',
     - invalidDependencyText       : 'Invalid dependency',
     - parentChildDependencyText   : 'Dependency between child and parent found',
     - duplicatingDependencyText   : 'Duplicating dependency found',
     - transitiveDependencyText    : 'Transitive dependency',
     - cyclicDependencyText        : 'Cyclic dependency',
     - typeText                    : 'Type',
     - lagText                     : 'Lag',
     - clsText                     : 'CSS class',
     - endToStartText              : 'Finish-To-Start',
     - startToStartText            : 'Start-To-Start',
     - endToEndText                : 'Finish-To-Finish',
     - startToEndText              : 'Start-To-Finish'
     */

    /**
     * @property {Gnt.field.Duration} lagEditor Editor instance used for the `Lag` column editing.
     */
    lagEditor : null,

    /**
     * @property {Ext.form.field.ComboBox} typesCombo Editor instance used for the `Type` column editing.
     */
    typesCombo : null,

    margin                      : 0,
    border                      : false,

    dependencyStoreRefreshSuspended : 0,

    initComponent : function () {
        var me = this;

        if (!me.readOnly) {
            me.plugins = me.buildPlugins();
        }

        // Configure taskModel automatically if not provided
        if (!me.taskModel) {
            if (me.dependencyStore) {
                var taskStore = me.dependencyStore.getTaskStore();

                if (taskStore) {
                    me.taskModel = taskStore.getModel();
                }
            }

            me.taskModel = me.taskModel || Gnt.model.Task;
        }

        if (me.oppositeStore) {
            me.setOppositeStore(me.oppositeStore);
        }

        me.store = me.store || new Ext.data.JsonStore({
            autoDestroy : true,
            model       : me.dependencyModel
        });

        if (me.task) {
            me.setTask(me.task);
            me.loadDependencies(me.task);
        }

        if (!me.title) {
            me.title  = me.direction === 'predecessors' ? me.L('predecessorsText') : me.L('successorsText');
        }

        me.columns = me.buildColumns();

        me.tbar = me.tbar || [
            {
                iconCls     : 'x-fa fa-plus',
                text        : me.L('addDependencyText'),
                itemId      : 'add-dependency-btn',
                handler     : function () {
                    me.insertDependency();
                }
            },
            {
                iconCls     : 'x-fa fa-trash',
                text        : me.L('dropDependencyText'),
                itemId      : 'drop-dependency-btn',
                disabled    : true,
                handler     : function () {
                    var recs = me.getSelectionModel().getSelection();

                    if (recs && recs.length) {
                        var store = me.store;
                        var index = store.indexOf(recs[ 0 ]);

                        me.cancelEdit();
                        store.remove(recs);

                        if (store.getCount() > 0) {
                            me.getSelectionModel().select((index === store.getCount()) ? index - 1 : index);
                        }
                    }
                }
            }
        ];

        me.callParent(arguments);

        me.on({
            selectionchange : function (sm, sel) {
                if (!me.dropDepBtn) {
                    me.dropDepBtn  = me.down('#drop-dependency-btn');
                }
                me.dropDepBtn && me.dropDepBtn.setDisabled(!sel.length);
            },
            scope : me
        });
    },

    destroy : function () {

        if (this.deferredStoreBind) {
            this.tasksCombo.un('render', this.bindTaskStore, this);
        }

        this.cellEditing.destroy();
        this.tasksCombo.destroy();
        this.typesCombo.destroy();
        this.lagEditor.destroy();

        this.callParent(arguments);
    },


    getDependencyStore : function () {
        return this.dependencyStore;
    },

    setDependencyStore : function (dependencyStore) {
        if (dependencyStore !== this.dependencyStore) {
            this.bindDependencyStore(dependencyStore);

            this.dependencyStore = dependencyStore;

            if (this.typesCombo) {
                this.typesCombo.store.filter(this.typesFilter);
            }

            if (!this.deferredStoreBind) {
                this.bindTaskStore();
            }
        }
    },

    bindDependencyStore : function (store) {
        var me = this;

        if (me.dependencyStoreDetacher) me.dependencyStoreDetacher.destroy();

        if (store) {
            me.dependencyStoreDetacher = me.mon(store, {
                'add'       : me.onDependencyStoreDataChanged,
                'remove'    : me.onDependencyStoreDataChanged,
                'load'      : me.onDependencyStoreDataChanged,
                'clear'     : me.onDependencyStoreDataChanged,

                scope       : me,
                destroyable : true
            });
        }
    },

    setTask : function (task) {
        if (!task) return;

        this.task = task;

        this.setDependencyStore(task.dependencyStore || task.getTaskStore().dependencyStore);

        this.setReadOnly(task.isReadOnly());
    },

    /**
     * Disable the cellediting plugin
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

        if (this.items) {
            this.down('toolbar').setVisible(!readOnly);
        }
    },

    onDependencyStoreDataChanged : function () {
        if (!this.dependencyStoreRefreshSuspended) this.loadDependencies();
    },

    buildPlugins : function () {

        var cellEditing = this.cellEditing = new Ext.grid.plugin.CellEditing({ clicksToEdit : 1 });

        cellEditing.on({
            beforeedit : this.onEditingStart,
            edit       : this.onEditingDone,

            scope : this
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

    onEditingStart : function (ed, e) {
        var model = this.store.model.prototype;

        switch (e.field) {
            case model.lagField:
                this.lagEditor.durationUnit = e.record.getLagUnit();
                break;

            case model.typeField:
                this.typesCombo.store.filter(this.typesFilter);
                // if set of dependency types is restricted and allowed number of types is less than 2
                // we won't show dropdown list
                if (this.typesCombo.store.count() < 2) return false;
                break;

            case model.fromField:
                if (this.direction == 'predecessors') {
                    this.activeDependency = e.record;
                    this.refilterTasksCombo();
                }
                break;

            case model.toField:
                if (this.direction != 'predecessors') {
                    this.activeDependency = e.record;
                    this.refilterTasksCombo();
                }
                break;
        }
    },


    onEditingDone : function (ed, e) {
        var model = this.store.model.prototype;

        if (e.field == model.lagField) {
            e.record.setLagUnit(this.lagEditor.durationUnit);
        }

        // after editing we refresh view since some records could become invalid
        this.getView().refreshView();
    },

    // dependency type column renderer
    dependencyTypeRender : function (value) {
        var type = this.store.model.Type;

        switch (value) {
            case type.EndToStart    :
                return this.L('endToStartText');
            case type.StartToStart  :
                return this.L('startToStartText');
            case type.EndToEnd      :
                return this.L('endToEndText');
            case type.StartToEnd    :
                return this.L('startToEndText');
        }

        return value;
    },


    // Returns list of dependency errors, used at task column renderer
    taskValidate : function (value, depRec) {
        if (!value) {
            return [this.L('blankTaskText')];
        }
        if (!depRec.isValid()) {
            var errors = this.getDependencyErrors(depRec);
            if (errors && errors.length) {
                return errors;
            }
            return [this.L('invalidDependencyText')];
        }
    },

    // Task name column renderer
    taskRender : function (value, meta, depRec) {
        var errors = this.taskValidate(value, depRec),
            record;

        if (errors && errors.length) {
            meta.tdCls  = 'gnt-cell-invalid';
            meta.tdAttr = 'data-errorqtip="' + errors.join('<br>') + '"';
        } else {
            meta.tdCls  = '';
            meta.tdAttr = 'data-errorqtip=""';
        }

        var taskStore = this.dependencyStore && this.dependencyStore.getTaskStore();
        if (taskStore) {
            record = taskStore.getModelById(value);
            return (record && Ext.htmlEncode(record.getName())) || '';
        }

        return '';
    },


    filterTasks : function (record) {
        var taskId = record.getId(),
            preserveTaskId,
            fromId,
            toId;

        if (this.direction === 'predecessors') {
            fromId         = taskId;
            toId           = this.task.getId();
            preserveTaskId = this.activeDependency && this.activeDependency.getSourceId();
        } else {
            toId           = taskId;
            fromId         = this.task.getId();
            preserveTaskId = this.activeDependency && this.activeDependency.getTargetId();
        }

        // 1) we don't filter out the task used in the dependency being edited (it's kept in this.activeDependency)
        // 2) other than that we simply filter out all the tasks that build invalid dependencies
        return !this.activeDependency || taskId == preserveTaskId || this.isValidDependency(fromId, toId);
    },


    refilterTasksCombo : function () {
        this.tasksCombo.getStore().addFilter(this.tasksFilter);
    },


    rebuildTasksComboStore : function () {
        var me = this;

        if (!me.destroyed) {
            var taskStore = me.getDependencyStore().getTaskStore();

            // make new store for the tasks dropdown list
            var store = new Ext.data.JsonStore({
                autoDestroy : true,
                model       : taskStore.model,
                sorters     : taskStore.model.prototype.nameField
            });

            var root = taskStore.getRoot();

            // load tasks from tasks store
            store.loadData(Gnt.util.Data.cloneModelSet(taskStore.toArray(), function (rec, src) {
                if (src === root || src.hidden || (me.direction === 'successors' && src.isReadOnly())) return false;
                // set phantomId as Id for records without Id
                // we need it since combo's valueField is 'Id'
                if (!src.getId()) {
                    rec.setId(src.getId());
                }
            }));

            me.tasksFilter = new Ext.util.Filter({
                id       : 'dependencygrid-tasksfilter',
                filterFn : me.filterTasks,
                scope    : me
            });

            // and apply filter to it
            store.filter(me.tasksFilter);

            if (me.tasksCombo) {
                me.tasksCombo.bindStore(store);
            } else {
                me.tasksComboStore = store;
            }
        }
    },


    bindTaskStore : function () {
        // This method is called via Ext.Function.createBuffered()
        // so in cases when task store get dirty during saveDependencies() call
        // this method can be called after the grid gets destroyed (happens in 1113_dependencygrid_negative_lag test)
        if (!this.destroyed) {
            var taskStore = this.dependencyStore && this.dependencyStore.getTaskStore();

            if (taskStore) {

                this.taskStoreListeners && this.taskStoreListeners.destroy();

                // merge multiple refreshes to single one
                var refreshTasks = Ext.Function.createBuffered(this.rebuildTasksComboStore, this.refreshTimeout, this, []);

                this.taskStoreListeners = this.mon(taskStore, {
                    nodeappend                 : refreshTasks,
                    nodeinsert                 : refreshTasks,
                    noderemove                 : refreshTasks,
                    update                     : refreshTasks,
                    refresh                    : refreshTasks,
                    clear                      : refreshTasks,
                    'nodestore-datachange-end' : refreshTasks,
                    scope                      : this,
                    destroyable                : true
                });

                this.rebuildTasksComboStore();
            }
        }
    },


    buildTasksCombo : function () {
        var me = this;

        return new Ext.form.field.ComboBox({
            queryMode      : 'local',
            allowBlank     : false,
            editing        : false,
            forceSelection : true,
            store          : this.tasksComboStore,
            valueField     : this.taskModel.prototype.idProperty,
            displayField   : this.taskModel.prototype.nameField,
            queryCaching   : false,
            validator      : function (value) {
                if (!value) {
                    return me.L('blankTaskText');
                }

                return true;
            },
            listConfig     : {
                htmlEncode : true
            }
        });
    },


    filterAllowedTypes : function (record) {
        if (!this.dependencyStore || !this.dependencyStore.allowedDependencyTypes) return true;

        var allowed = this.dependencyStore.allowedDependencyTypes;
        var depType = this.store.model.Type;

        for (var i = 0, l = allowed.length; i < l; i++) {
            var type = depType[allowed[i]];
            if (record.getId() == type) return true;
        }

        return false;
    },


    buildTypesCombo : function () {
        var depType = this.store.model.Type;

        // https://www.sencha.com/forum/showthread.php?300987-How-re-filter-chained-store.&viewfull=1#post1103214
        // assign id to filter fn to use filter(this.typesFilter)
        this.typesFilter = new Ext.util.Filter({
            id       : 'typesfilter',
            filterFn : this.filterAllowedTypes,
            scope    : this
        });

        var store = new Ext.data.ArrayStore({
            fields : [
                { name : 'id', type : 'int' },
                'text'
            ],
            data   : [
                [depType.EndToStart, this.L('endToStartText')],
                [depType.StartToStart, this.L('startToStartText')],
                [depType.EndToEnd, this.L('endToEndText')],
                [depType.StartToEnd, this.L('startToEndText')]
            ]
        });

        // and apply filter to it
        store.filter(this.typesFilter);

        return new Ext.form.field.ComboBox({
            triggerAction : 'all',
            queryMode     : 'local',
            editable      : false,
            valueField    : 'id',
            displayField  : 'text',
            store         : store,
            listConfig    : {
                htmlEncode : true
            }
        });
    },


    buildLagEditor : function () {
        return new Gnt.field.Duration({
            minValue : Number.NEGATIVE_INFINITY
        });
    },

    /**
     * @protected
     * Builds a list of columns that appear in this grid.
     * @return {Ext.grid.column.Column[]/Object[]} An array of {@link Ext.grid.column.Column column} definition objects which define columns that appear in the grid.
     */
    buildColumns : function () {
        var me        = this,
            model     = this.store.model.prototype,
            result    = [],
            taskStore = this.dependencyStore && this.dependencyStore.getTaskStore();

        // task name column editor
        this.tasksCombo = this.buildTasksCombo();

        // if no taskStore yet let`s defer its binding
        if (!taskStore) {
            this.deferredStoreBind = true;
            this.tasksCombo.on('afterrender', this.bindTaskStore, this);
            // let`s build & bind combobox store
        } else {
            this.bindTaskStore();
        }

        var fromOrToField = model[this.direction === 'predecessors' ? "fromField" : "toField"];

        if (this.useSequenceNumber) {
            result.push({
                text      : this.L('snText'),
                dataIndex : fromOrToField,
                renderer  : function (value, meta, record) {
                    var store = me.dependencyStore && me.dependencyStore.getTaskStore(),
                        node  = store && store.getModelById(record.get(fromOrToField));

                    return node ? node.getSequenceNumber() : '';
                },
                width     : 50
            });

        } else {
            result.push({
                text      : this.L('idText'),
                dataIndex : fromOrToField,
                width     : 50
            });
        }

        result.push({
            text      : this.L('taskText'),
            dataIndex : fromOrToField,
            flex      : 1,
            editor    : this.tasksCombo,
            renderer  : function (value, meta, depRec) {
                return me.taskRender(value, meta, depRec);
            }
        });

        this.lagEditor = this.buildLagEditor();

        this.typesCombo = this.buildTypesCombo();

        result.push(
            {
                text      : this.L('typeText'),
                dataIndex : model.typeField,
                width     : 120,
                renderer  : this.dependencyTypeRender,
                scope     : this,
                editor    : this.typesCombo
            },
            {
                text      : this.L('lagText'),
                dataIndex : model.lagField,
                width     : 100,
                editor    : this.lagEditor,
                renderer  : function (value, meta, record) {
                    return me.lagEditor.valueToVisible(value, record.get(model.lagUnitField), 2);
                }
            },
            {
                text      : this.L('clsText'),
                dataIndex : model.clsField,
                hidden    : !this.showCls,
                width     : 100
            }
        );

        return result;
    },


    /**
     * Creates new record and starts process of its editing.
     * @param {Gnt.model.Dependency/Object} [newRecord] New dependency to be added.
     * @param {Boolean} [doNotActivateEditor=false] `true` to just insert record without starting the editing after insertion.
     * @return {Gnt.model.Dependency[]} The records that were added.
     */
    insertDependency : function (newRecord, doNotActivateEditor) {
        if (!this.dependencyStore) return;

        var me     = this,
            taskId = me.task.getId(),
            model  = me.store.model;

        newRecord = newRecord || {};

        if (!newRecord.isModel) {
            if (!newRecord[model.prototype.typeField]) {
                var firstType = me.typesCombo && me.typesCombo.store && me.typesCombo.store.first();

                if (firstType) {
                    newRecord[model.prototype.typeField] = firstType.getId();
                }
            }

            newRecord = new model(newRecord);
        }

        if (this.direction === 'predecessors') {
            newRecord.setTo(taskId);
        } else {
            newRecord.setFrom(taskId);
        }

        // patch "isValid" method to use grid "isValidDependency" method
        var oldValidator = newRecord.isValid;

        newRecord.isValid = function () {
            return oldValidator.call(this, false) && me.isValidDependency(this);
        };

        var added = this.store.insert(0, newRecord);

        if (!doNotActivateEditor) {
            this.cellEditing.startEditByPosition({ row : 0, column : 1 });
        }

        return added;
    },

    onOppositeStoreChange : function () {
        this.getView().refreshView();
    },

    setOppositeStore : function (store) {

        // this can be made public after resolving the problem with transitivity detection
        //
        // Sets store with opposite to the grid dependencies direction.
        // This can be used for example to implement two grids one with predecessors and another one with successors of the task.
        // Grids will work in conjunction and validation of one grid will instantly react on changes made in another one.
        // @param {Ext.data.Store} store Store with dependencies.
        // @example
        //      var predecessorsGrid = Ext.create('Gnt.widget.DependencyGrid', {
        //          direction       : 'predecessors',
        //          dependencyStore : dependencyStore,
        //          task            : task
        //      });
        //
        //      var successorsGrid = Ext.create('Gnt.widget.DependencyGrid', {
        //          direction       : 'successors',
        //          dependencyStore : dependencyStore,
        //          // set predecessors grid store as opposite to successors
        //          oppositeStore   : predecessorsGrid.store,
        //          task            : task
        //      });
        //
        //      // set successors grid store as opposite to predecessors
        //      predecessorsGrid.setOppositeStore(successorsGrid.store);
        //

        var listeners = {
            update      : this.onOppositeStoreChange,
            datachanged : this.onOppositeStoreChange,
            scope       : this
        };

        if (this.oppositeStore) {
            this.mun(this.oppositeStore, listeners);
        }

        this.oppositeStore = store;

        // on opposite store changes we will refresh grid view
        // since it can affect rows validity
        this.mon(this.oppositeStore, listeners);
    },

    /**
     * Loads task dependencies to grid store.
     * @param {Gnt.model.Task} task Task dependencies of which should be loaded.
     */
    loadDependencies : function (task) {
        var me = this;

        task = task || this.task;

        if (!task) return;

        if (this.task !== task) {
            this.setTask(task);
        }

        var data;

        if (this.direction === 'predecessors') {
            data = task.getIncomingDependencies(true);
            if (!this.oppositeStore) {
                this.oppositeData = task.getOutgoingDependencies(true);
            }
        } else {
            data = task.getOutgoingDependencies(true);
            if (!this.oppositeStore) {
                this.oppositeData = task.getIncomingDependencies(true);
            }
        }

        // let`s clone it to not affect real data
        // we save changes only by saveDependencies() call
        var result = Gnt.util.Data.cloneModelSet(data, function (rec) {
            // validate record by our own validator
            var oldValidator = rec.isValid;
            rec.isValid      = function () {
                return oldValidator.call(this, false) && me.isValidDependency(this);
            };
        });

        this.store.loadData(result);

        this.fireEvent('loaddependencies', this, this.store, result, task);
    },


    /*
     * Gets an array of error messages for provided dependency.
     */
    getDependencyErrors : function (fromId, toId) {
        var me       = this,
            depStore = me.dependencyStore,
            errors   = [],
            dependency,
            type;

        if (fromId instanceof Gnt.model.Dependency) {
            dependency = fromId;
            fromId     = me.task.getId();
            toId       = fromId;
            type       = dependency.getType();

            if (me.direction === 'predecessors') {
                fromId = dependency.getSourceId();
            } else {
                toId = dependency.getTargetId();
            }
        }

        if (dependency) {
            me.store.each(function (dep) {
                // check duplicating records
                if ((fromId == dep.getSourceId()) && (toId == dep.getTargetId()) && (dep !== dependency)) {
                    errors.push(me.L('duplicatingDependencyText'));
                    return false;
                }
            });

            if (errors.length) return errors;
        }

        // let's ask dependency store to validate the dependency
        // we have to provide list of records that we're adding to the dependency store
        var toAdd = me.store.getRange();

        // ..minus dependency that we're validating (if we validating dependency instance)
        dependency && toAdd.splice(Ext.Array.indexOf(toAdd, dependency), 1);

        // and list of existing ..old dependencies ..that we plan to remove/replace
        var oldDependencies = me.task[me.direction];
        // run validation
        var error = depStore.getDependencyError(fromId, toId, type, toAdd, oldDependencies);

        if (error) {
            switch (error) {
                case -3:
                case -8:
                case -5:
                case -6:
                    return [me.L('transitiveDependencyText')];
                case -4:
                case -7:
                    return [me.L('cyclicDependencyText')];
                case -9:
                    return [me.L('parentChildDependencyText')];
            }

            return [this.L('invalidDependencyText')];
        }

        return errors;
    },


    /*
     * Checks if the dependency is valid.
     */
    isValidDependency : function () {
        return !this.getDependencyErrors.apply(this, arguments).length;
    },


    /*
     * Checks if the grid is valid.
     */
    isValid : function () {
        var result = true;
        this.store.each(function (record) {
            if (!record.isValid()) {
                result = false;
                return false;
            }
        });
        return result;
    },

    suspendDependencyStoreRefresh : function () {
        this.dependencyStoreRefreshSuspended++;
    },

    resumeDependencyStoreRefresh : function () {
        this.dependencyStoreRefreshSuspended--;
    },

    /**
     * Applies all changes that have been made to grid data to dependency store.
     */
    saveDependencies : function () {
        if (this.dependencyStore && this.isValid()) {
            this.suspendDependencyStoreRefresh();
            // push changes from grid store to real dependencyStore
            Gnt.util.Data.applyCloneChanges(this.store, this.dependencyStore);
            this.resumeDependencyStoreRefresh();
        }
    },


    isDataChanged : function () {
        var me = this;

        return me.store &&
            me.store.getUpdatedRecords().length > 0 ||
            me.store.getNewRecords().length > 0 ||
            me.store.getRemovedRecords().length > 0;
    },


    isDataValid : function () {
        return this.isValid();
    }
});
