/**
 * @class Kanban.view.TaskBoard
 *
 * A panel based on the {@link Ext.panel.Panel} class which allows you to visualize and manage {@link Kanban.model.Task tasks} and you can
 * also assign {@link Kanban.model.Resource resources} to these tasks. The panel expects a {@link Kanban.data.TaskStore taskStore} to be provided and can also
 * be configured with a {@link Kanban.data.ResourceStore resourceStore}. Based on the array of {@link Kanban.model.Task#states states}, a list of
 * {@link Kanban.view.TaskColumn TaskColumns} will be generated. Tasks can be dragged between these state panels, and you can control which state transitions
 * are allowed by subclassing the {@link Kanban.model.Task Task} class and overriding the {@link Kanban.model.Task#isValidTransition} method.
 *
 * Sample usage below:
 *
 *     var resourceStore = new Kanban.data.ResourceStore({
 *         data    : [
 *             { Id : 1, Name : 'Dave' }
 *         ]
 *     });
 *
 *     var taskStore = new Kanban.data.TaskStore({
 *         data    : [
 *             { Id : 1, Name : 'Dig hole', State : 'NotStarted'}
 *         ]
 *     });
 *
 *     var taskBoard = new Kanban.view.TaskBoard({
 *         resourceStore : resourceStore,
 *         taskStore     : taskStore
 *     });
 *
 *     var vp = new Ext.Viewport({
 *         items       : taskBoard,
 *         layout      : 'fit'
 *     });
 *
 * Additionally, you can control the layout of the columns yourself by providing an array of Columns yourself.
 *
 *     var taskBoard = new Kanban.view.TaskBoard({
 *         ...
 *         columns : [
 *             {
 *                 state       : 'NotStarted',
 *                 title       : 'Not Started',
 *                 dockedItems : {
 *                     xtype   : 'container',
 *                     dock    : 'bottom',
 *                     layout  : 'fit',
 *                     ...
 *                 }
 *             },
 *             {
 *                 state : 'InProgress',
 *                 title : 'In Progress'
 *             },
 *             {
 *                 xtype    : 'container',
 *                 flex     : 1,
 *                 layout   : { type : 'vbox', align : 'stretch' },
 *                 defaults : { xtype : 'taskcolumn', flex : 1 },
 *                 items    : [
 *                     {
 *                         state : 'Test',
 *                         title : 'Test'
 *                     },
 *                     {
 *                         state     : 'Acceptance',
 *                         title     : 'Acceptance',
 *
 *                         // Column-level zoom setting
 *                         zoomLevel : 'mini'
 *                     }
 *                 ]
 *             },
 *             {
 *                 state : 'Done',
 *                 title : 'Done'
 *             }
 *         ]
 *     });
 *
 * {@img taskboard/images/board.png 2x}
 *
 * You can of course also subclass this class like you would with any other Ext JS class and provide your own custom behavior.
 * Make sure to also study the other classes used by this component, the various store, model and UI classes.
 */
Ext.define('Kanban.view.TaskBoard', {
    extend : 'Ext.Panel',
    alias  : 'widget.taskboard',

    requires : [
        "Sch.patches.View",
        "Kanban.patch.EXTJS_23846",
        "Kanban.locale.En",
        "Kanban.data.TaskStore",
        "Kanban.data.ResourceStore",
        "Kanban.view.TaskColumn",
        "Kanban.dd.DropZone",
        "Kanban.dd.DragZone",
        "Kanban.editor.SimpleEditor",
        "Kanban.field.AddNew",
        "Kanban.menu.UserMenu",
        "Kanban.menu.TaskMenu",
        "Kanban.selection.TaskModel"
    ],


    border      : false,
    layout      : { type : 'hbox', align : 'stretch' },
    defaultType : 'taskcolumn',

    // BEGIN PANEL SPECIFIC PROPERTIES
    config      : {
        /**
         * @cfg {Kanban.data.TaskStore} taskStore (required) The store containing the tasks
         */
        taskStore   : null,

        /**
         * @cfg {Kanban.data.ResourceStore} resourceStore The store containing the resources that can be assigned to tasks.
         */
        resourceStore : { type : 'kanban_resourcestore'}
    },

    /**
     * @cfg {Boolean} fitColumns Set to 'false' to make container scroll the content
     * */
    fitColumns : true,

    /**
     * @cfg {Object} dragZoneConfig A config object to apply to the DragZone used by the TaskBoard
     * */
    dragZoneConfig : null,

    /**
     * @cfg {Object} dropZoneConfig A config object to apply to the DropZone used by the TaskBoard
     * */
    dropZoneConfig : null,

    /**
     * @cfg {String} columnClass The class to use to instantiate the columns making up the task board. You can subclass
     * the default class and provide your own custom functionality by using this config property.
     * */
    columnClass : 'Kanban.view.TaskColumn',

    /**
     * @cfg {Kanban.view.TaskColumn[]} columns An array of {@link Kanban.view.TaskColumn} objects defining the various states of the tasks
     * in the board.
     * */
    columns : null,

    /**
     * @cfg {Object} columnConfigs An object containing configuration objects for individual TaskColumns. To set properties for the 'NotStarted' column,
     *               see the example below.
     *
     columnConfigs : {
        // Applied to all columns
        all : {
            iconCls : 'sch-header-icon'
        },

        "NotStarted" : {
            border : false
        }
    }
     * You can configure any columns matching the possible states defined in the TaskModel. Only relevant when not specifying the {@link columns} config option.
     * in the board.
     * */
    columnConfigs : null,

    /**
     * @cfg {Object} editor An array of objects containing configuration options for the columns which are automatically created based on
     * the possible states defined in the TaskModel. Only relevant when not specifying the {@link columns} config option.
     * in the board.
     * */
    editor : null,

    /**
     * @cfg {Object} viewConfig A custom config object that will be passed to each underlying {@link Ext.view.View} instance (one inside each state column)
     * */
    viewConfig : null,

    /**
     * @cfg {Boolean} enableUserMenu true to show a menu when clicking the user of a task.
     */
    enableUserMenu : true,

    /**
     * @cfg {Boolean} readOnly true to not allow editing or moving of tasks.
     * */
    readOnly : false,

    /**
     * @cfg {Ext.menu.Menu} userMenu A menu used to edit the assigned user for a task
     * */
    userMenu : null,

    /**
     * @cfg {Kanban.menu.TaskMenu/Object/Boolean} taskMenu Specify a menu for the task. A configuration will be passed to the {@link Kanban.view.TaskBoard#taskMenuClass}.
     *
     */

    taskMenu : true,

    /**
     * An empty function by default, but provided so that you can perform custom validation on
     * the tasks being dragged. This function is called after a drag and drop process to validate the operation.
     * To control what 'this' points to inside this function, use
     * {@link #validatorFnScope}.
     * @param {Kanban.model.Task[]} taskRecords an array containing the records being dragged
     * @param {String} newState The new state of the target task
     * @return {Boolean} true if the drop position is valid, else false to prevent a drop
     */
    dndValidatorFn : Ext.emptyFn,

    /**
     * @cfg {Object} validatorFnScope
     * The 'this' object to use for the {@link #dndValidatorFn} function
     */
    validatorFnScope : null,

    /**
     * @cfg {String} zoomLevel The size of the rendered tasks. Can also be controlled on a per-column level, see {@link Kanban.view.Column#zoomLevel}.
     * Options: ['large', 'medium', 'small', 'mini']
     * */
    zoomLevel : 'large',

    /**
     *  @cfg {Boolean} destroyStore True to destroy all stores used by this component when it's destroyed
     */
    destroyStores : false,

    /**
     *  @cfg {Boolean} enableClipboard True to allow user to copy/cut/paste selected tasks using standard keyboard shortcuts
     */
    enableClipboard : false,

    // EOF PANEL SPECIFIC PROPERTIES

    // Private properties
    taskCls        : 'sch-task',
    taskSelector   : '.sch-task',
    isHighlighting : false,
    views          : null,
    kanbanColumns  : null,
    selModel       : null,
    clipboard      : null,
    // EOF Private properties

    /**
     * @event taskclick
     * Fires when clicking a task
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The clicked task root HTMLElement
     * @param {Ext.EventObject} event The event object
     */

    /**
     * @event taskdblclick
     * Fires when double clicking a task
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The clicked task root HTMLElement
     * @param {Ext.EventObject} event The event object
     */

    /**
     * @event taskcontextmenu
     * Fires when right clicking a task
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The clicked task root HTMLElement
     * @param {Ext.EventObject} event The event object
     */

    /**
     * @event taskmouseenter
     * Fires when the mouse moves over a task.
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The hovered HTMLElement
     * @param {Ext.EventObject} event The event object
     */

    /**
     * @event taskmouseleave
     * Fires when the mouse leaves a task DOM node.
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The HTMLElement
     * @param {Ext.EventObject} event The event object
     */

    /**
     * @event taskkeydown
     * Fires when a keydown event happens on a task DOM node.
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The HTMLElement
     * @param {Ext.EventObject} event The event object
     */

    /**
     * @event taskkeyup
     * Fires when a keyup event happens on a task DOM node.
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The HTMLElement
     * @param {Ext.EventObject} event The event object
     */

    initComponent : function () {
        var me = this;

        me.defaults = me.defaults || {};

        Ext.applyIf(me.defaults, {
            margin : 12
        });

        me.taskStore     = Ext.data.StoreManager.lookup(me.taskStore);
        me.resourceStore = Ext.data.StoreManager.lookup(me.resourceStore);

        me.addCls('sch-taskboard');
        me.addBodyCls('sch-taskboard-body');

        if (!me.fitColumns) {
            me.addCls('sch-taskboard-scrollable');
            me.setScrollable('x');
            me.setLayout('auto');
        }

        var bindConfig = me.getConfig('bind');

        // If these configs are bound, we need to create empty stores, because those values will be applied
        // after render. So we need reliable setters for me stores.
        if (bindConfig) {
            if (bindConfig.taskStore) {
                me.taskStore = new Kanban.data.TaskStore();
            }

            if (bindConfig.resourceStore) {
                me.resourceStore = new Kanban.data.ResourceStore();
            }
        }

        me.taskStore = Ext.data.StoreManager.lookup(me.taskStore);
        me.resourceStore = Ext.data.StoreManager.lookup(me.resourceStore);

        me.on({
            add    : me.onColumnsAdded,
            remove : me.onColumnsRemoved,
            scope  : me
        });

        if (!me.columns) {
            me.columns = me.createColumns();
        }
        else {
            me.columns = Ext.clone(me.columns);
            me.initColumns(me.columns);
        }

        me.items = me.columns;

        if (!me.taskStore) {
            throw 'Must define a taskStore for the Panel';
        }

        if (!me.resourceStore) {
            throw 'Must define a resourceStore for the Panel';
        }

        me.callParent(arguments);

        me.bindResourceStore(me.resourceStore, true);
    },

    setTaskStore    : function (store) {
        this.taskStore = Ext.StoreManager.lookup(store);
        this.taskStore.setResourceStore(this.getResourceStore());

        this.rendered && this.forEachColumn(function (column) {
            column.bindStore(
                new Kanban.data.ViewStore({
                    masterStore : this.taskStore,
                    state       : column.state
                })
            );
        });
    },

    setResourceStore : function (store) {
        this.bindResourceStore(store);
    },

    createColumns : function () {
        var me = this;

        var states     = me.taskStore.model.prototype.states;
        var colConfigs = me.columnConfigs || {};

        return Ext.Array.map(states, function (state, index) {
            return Ext.create(me.columnClass, Ext.apply({
                state             : state,
                viewConfig        : me.viewConfig,
                zoomLevel         : me.zoomLevel,
                layout            : me.fitColumns ? 'fit' : 'auto',
                manageHeight      : !me.fitColumns,
            }, Ext.apply(colConfigs[ state ] || {}, colConfigs.all)));
        });
    },

    initColumns : function (columns) {
        var me = this;

        Ext.Array.forEach(columns, function (column) {

            if (column.items) {
                me.initColumns(column.items);
            }
            else {
                Ext.applyIf(column, {
                    viewConfig : me.viewConfig
                });
            }
        }, this);
    },

    onColumnsAdded : function (me, component) {
        var columns = component instanceof Kanban.view.TaskColumn ? [ component ] : component.query('taskcolumn');

        Ext.Array.forEach(columns, function (col) {
            col.bindStore(
                new Kanban.data.ViewStore({
                    masterStore : this.taskStore,
                    state       : col.state
                })
            );

            this.bindViewListeners(col.view);
            // we only need to add columns and views to lists when they are being added after component is rendered
            // this listener will be invoked before we fill these properties, we can skip this part for now
            this.kanbanColumns && this.kanbanColumns.push(col);
            this.views && this.views.push(col.view);
        }, this);
    },

    onColumnsRemoved : function (me, component) {
        var column = component instanceof Kanban.view.TaskColumn && component;

        Ext.Array.remove(this.kanbanColumns, column);
        Ext.Array.remove(this.views, column.view);
    },

    afterRender : function () {
        this.callParent(arguments);

        if (!this.isReadOnly()) {
            this.setupDragDrop();
            this.initEditor();
            this.initTaskMenu();

            if (this.enableUserMenu && this.userMenu) {
                this.initUserMenu();
            }
        }

        this.views         = this.query('taskview');
        this.kanbanColumns = this.query('taskcolumn');

        this.on('taskclick', this.onTaskClick, this);

        if (this.enableClipboard) {
            this.getEl().on({
                keydown : this.onKeyDown,
                scope   : this
            });
        }
    },

    onKeyDown : function(event) {
        var me = this;

        if (!event.ctrlKey) {
            return;
        }

        switch(event.browserEvent.key.toLowerCase()) {
            case 'c': // COPY
                me.copyTasksToClipboard();
                break;

            case 'v': // PASTE
                me.pasteTasks();
                break;

            case 'x': // CUT
                me.cutTasksToClipboard();
                break;
        }
    },

    copyTasksToClipboard : function() {
        var me = this;

        me.clipboard = me.getSelectedRecords();
        me.clipboard.copy = true;
    },

    cutTasksToClipboard : function() {
        var me = this;

        me.clipboard = me.getSelectedRecords();
        me.clipboard.copy = false;
        me.clipboard.forEach(function (task) {
            var el = me.getElementForTask(task);

            el && el.addCls('sch-taskboard-cut-task');
        });
    },

    pasteTasks : function() {
        var me = this;
        var state = me.resolveState(document.activeElement);

        if (me.clipboard && state !== false) {
            me.clipboard.forEach(function (task) {
                task = me.clipboard.copy ? task.copy(null) : task;
                task.setState(state);

                if (me.clipboard.copy) {
                    me.taskStore.add(task);
                }

                var el = me.getElementForTask(task);

                el && el.removeCls('sch-taskboard-cut-task');
            });
        }
    },

    setReadOnly : function (readOnly) {
        this.readOnly = readOnly;
    },

    isReadOnly : function () {
        return this.readOnly;
    },

    bindViewListeners : function (view) {

        view.on({
            itemclick       : this.getTaskListener('taskclick'),
            itemcontextmenu : this.getTaskListener('taskcontextmenu'),
            itemdblclick    : this.getTaskListener('taskdblclick'),
            itemmouseenter  : this.getTaskListener('taskmouseenter'),
            itemmouseleave  : this.getTaskListener('taskmouseleave'),
            itemkeydown     : this.getTaskListener('taskkeydown'),
            itemkeyup       : this.getTaskListener('taskkeyup'),
            scope           : this
        });
    },

    setupDragDrop : function () {
        var me      = this;
        var ddGroup = 'kanban-dd-' + me.id,
            ddEl    = me.el;

        me.dragZone = new Kanban.dd.DragZone(me.body.id, Ext.apply({
            panel           : me,
            containerScroll : !me.fitColumns,
            ddGroup         : ddGroup
        }, me.dragZoneConfig));

        me.dropZone = new Kanban.dd.DropZone(me.body.id, Ext.apply({
            panel            : me,
            validatorFn      : me.dndValidatorFn,
            validatorFnScope : me.validatorFnScope,
            ddGroup          : ddGroup
        }, me.dropZoneConfig));

        me.relayEvents(me.dragZone, [
            /**
             * @event beforetaskdrag
             * Fires before a drag-drop operation is initiated, return false to cancel it
             * @param {Kanban.dd.DragZone} drag zone The drag zone
             * @param {Kanban.model.Task} task The task corresponding to the HTML node that's about to be dragged
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskdrag',

            /**
             * @event taskdragstart
             * Fires when a drag-drop operation starts
             * @param {Kanban.dd.DragZone} drag zone The drag zone
             * @param {Kanban.model.Task[]} task The tasks being dragged
             */
            'taskdragstart',

            'aftertaskdrop'
        ]);

        this.relayEvents(this.dropZone, [
            /**
             * @event beforetaskdropfinalize
             * Fires before a succesful drop operation is finalized. Return false to finalize the drop at a later time.
             * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
             * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
             * @param {Ext.dd.DropZone} drop zone The drop zone
             * @param {Object} dragContext An object containing 'taskRecords', 'newState' and 'finalize' properties.
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskdropfinalize',

            /**
             * @event taskdrop
             * Fires after a succesful drag and drop operation
             * @param {Ext.dd.DropZone} drop zone The drop zone
             * @param {Kanban.model.Task[]} task The tasks being dragged
             */
            'taskdrop',

            /**
             * @event aftertaskdrop
             * Fires after a drag n drop operation, even when drop was performed on an invalid location
             * @param {Ext.dd.DropZone} drop zone The drop zone
             */
            'aftertaskdrop'
        ]);

        this.dropZone.on('aftertaskdrop', this.onAfterTaskDrop, this);

        this.dragZone.on('taskdragstarting', this.onDragStarting, this);
    },

    resolveState : function (el) {
        // HACK: If you drag the task bar outside the IE window or iframe it crashes (missing e.target)
        if (Ext.isIE && !el) {
            el = document.body;
        }

        if (!el.dom) {
            var columnEl = Ext.fly(el);
            if (!columnEl.is('.sch-taskview')) {
                columnEl = columnEl.up('.sch-taskview');
            }
            if (columnEl && columnEl.component) {
                return columnEl.component.state;
            }
        }

        return false;
    },

    setZoomLevel : function (level) {
        this.translateToColumns('setZoomLevel', [ level ]);
    },

    // Will simply return the zoom level of the first scrum column
    getZoomLevel : function () {
        return this.down('taskcolumn').getZoomLevel();
    },

    initEditor : function () {

        if (this.editor) {

            if (!this.editor.isComponent) {
                this.editor = Ext.widget(this.editor);
            }

            this.editor.init(this);
        }
    },

    initUserMenu : function () {
        if (!(this.userMenu instanceof Ext.Component)) {
            this.userMenu = Ext.ComponentManager.create(this.userMenu);
        }

        this.el.on({
            click    : this.onUserImgClick,
            delegate : '.sch-user-avatar',
            scope    : this
        });
    },

    initTaskMenu : function () {

        if (this.taskMenu) {

            var taskMenu = typeof this.taskMenu === 'boolean' ? { xtype : 'kanban_taskmenu' } : this.taskMenu;

            if (Ext.isArray(taskMenu)) {
                taskMenu = {
                    items : taskMenu
                };
            }

            taskMenu.taskBoard = this;

            if (!taskMenu.isTaskMenu) {
                this.taskMenu = Ext.widget(Ext.applyIf(taskMenu, {
                    xtype : 'kanban_taskmenu'
                }));
            }

            this.taskMenu.registerListeners();

            this.addCls('sch-taskboard-with-menu');
        }
    },

    onUserImgClick : function (e, t) {
        e.stopEvent();

        if (!this.isReadOnly()) {
            this.userMenu.showForTask(this.resolveRecordByNode(t), e.getXY());
        }
    },

    resolveViewByNode : function (node) {
        var viewEl = Ext.fly(node).up('.sch-taskview');

        return (viewEl && Ext.getCmp(viewEl.id)) || null;
    },

    resolveRecordByNode : function (node) {
        var view = this.resolveViewByNode(node);

        return (view && view.getRecord(view.findItemByChild(node))) || null;
    },

    // Clear selections in other views if CTRL is not clicked
    onTaskClick : function (view, record, item, event) {
        if (!event.ctrlKey) {
            this.deselectAllInOtherViews(view);
        }
    },

    deselectAllInOtherViews : function (view) {
        this.getSelectionModel().deselectAllInOtherSelectionModels(view.getSelectionModel());
    },

    // record or id
    getElementForTask : function (task) {

        if (!(task instanceof Ext.data.Model)) task = this.taskStore.getById(task);

        var state = task.getState();

        if (state) {
            return Ext.get(this.getViewForState(state).getNode(task));
        }
    },

    getViewForState : function (state) {
        return this.down('taskview[state=' + [ state ] + ']');
    },

    forEachColumn : function (fn, scope) {
        Ext.Array.each(this.query('taskcolumn'), fn, scope || this);
    },

    translateToViews : function (method, args) {
        Ext.Array.map(this.views, function (view) {
            return view[ method ].apply(view, args || []);
        });
    },

    translateToColumns : function (method, args) {
        Ext.Array.map(this.kanbanColumns, function (col) {
            return col[ method ].apply(col, args || []);
        });
    },

    translateToSelectionModels : function (method, args) {
        Ext.Array.map(this.views, function (view) {
            var sm = view.getSelectionModel();

            sm[ method ].apply(sm, args || []);
        });
    },

    getSelectedRecords : function () {
        return [].concat.apply([], Ext.Array.map(this.views, function (view) {
            return view.getSelectionModel().getSelection();
        }));
    },

    selectAll : function () {
        this.getSelectionModel().selectAll();
    },

    deselectAll : function () {
        this.getSelectionModel().deselectAll();
    },

    onDestroy : function () {
        Ext.destroy(
            this.dragZone,
            this.dropZone,
            this.userMenu,
            this.taskMenu,
            this.editor
        );

        this.clipboard = null;

        if (this.destroyStores) {
            this.taskStore.destroy();
            this.resourceStore.destroy();
        }
    },

    // private
    getTaskListener : function (eventName) {
        return function (view, record, item, index, event) {
            this.fireEvent(eventName, view, record, item, event);
        };
    },

    /**
     * Highlights tasks in the board based on a callback function.
     * @param {Function} callback A function returning true (to indicate a match) or false
     * @param {Object} scope Scope for callback
     * @return {Object} The 'this' object to use for the callback. Defaults to the panel instance.
     */
    highlightTasksBy : function (callback, scope) {

        if (!this.isHighlighting) {
            this.el.addCls('sch-taskboard-filtered');
            this.isHighlighting = true;
        }

        // Clear old matches first
        this.el.select('.sch-filter-match').removeCls('sch-filter-match');

        for (var i = 0, l = this.taskStore.getCount(); i < l; i++) {
            var rec = this.taskStore.getAt(i);

            if (callback.call(scope || this, rec)) {
                var el = this.getElementForTask(rec);

                if (el) {
                    el.addCls('sch-filter-match');
                }
            }
        }
    },

    /**
     * Clears any highlighted tasks.
     */
    clearHighlight : function () {
        this.isHighlighting = false;

        this.el.removeCls('sch-taskboard-filtered');
        this.el.select('.sch-filter-match').removeCls('sch-filter-match');
    },

    /**
     * Refreshes all the task columns manually, which can be useful after performing lots of data operations or changes.
     */
    refresh : function () {
        this.translateToViews('refresh');

        this.fireEvent('refresh', this);
    },

    /**
     * Refreshes the element of a single the task record.
     * @param {Kanban.model.Task} task the task record
     */
    refreshTaskNode : function (task) {
        var node = this.getElementForTask(task);

        if (node) {
            var view = this.resolveViewByNode(node);

            view.refreshNode(task);
        }
    },

    bindResourceStore : function (store, suppressRefresh) {

        var listeners = {
            update  : this.onResourceStoreUpdate,
            refresh : this.onResourceStoreRefresh,
            remove  : this.onResourceStoreRemove,

            scope : this
        };

        if (this.resourceStore) {
            this.mun(this.resourceStore, listeners);
        }

        if (store) {
            store = Ext.data.StoreManager.lookup(store);

            this.mon(store, listeners);

            this.taskStore && this.taskStore.setResourceStore(store);

            if (!suppressRefresh && this.rendered) {
                this.refresh();
            }
        }

        this.resourceStore = store;
    },

    onResourceStoreUpdate : function () {
        // can be done cheaper
        if (this.rendered) {
            this.refresh();
        }
    },

    onResourceStoreRefresh : function () {
        // can be done cheaper
        if (this.rendered) {
            this.refresh();
        }
    },

    onResourceStoreRemove : function () {
        // can be done cheaper
        if (this.rendered) {
            this.refresh();
        }
    },


    // clear selections if user is not multi selecting
    onDragStarting : function (dz, task, e) {
        var view = this.getViewForState(task.getState());

        if (!e.ctrlKey) {
            this.deselectAll();
        }
    },


    onAfterTaskDrop : function () {
        this.getSelectionModel().deselectAll();
    },

    /**
     * Returns the task menu instance (if the task board was configured to use one).
     * @return {Kanban.menu.TaskMenu}
     */
    getTaskMenu : function () {
        return this.taskMenu;
    },

    /**
     * Returns the task store instance associated with the task board.
     * @return {Kanban.data.TaskStore}
     */
    getTaskStore : function () {
        return this.taskStore;
    },

    /**
     * Returns the resource store instance associated with the task board.
     * @return {Kanban.data.ResourceStore}
     */
    getResourceStore : function () {
        return this.resourceStore;
    },

    /**
     * Returns the task editor associated with the task board.
     * @return {Ext.Component}
     */
    getTaskEditor : function () {
        return this.editor;
    },

    /**
     * Returns the selection model associated with the task board.
     * @return {Kanban.selection.TaskModel}
     */
    getSelectionModel : function () {
        if (!this.selModel) {
            this.selModel = this.createSelectionModel();
        }
        return this.selModel;
    },

    createSelectionModel : function () {
        var selModel = new Kanban.selection.TaskModel({
            panel : this
        });

        this.relayEvents(selModel, [

            /**
             * @event deselect
             * Fired after a task record is deselected
             * @param {Ext.selection.DataViewModel} this
             * @param  {Kanban.model.Task} record The deselected record
             */
            'deselect',

            /**
             * @event select
             * Fired after a task record is selected
             * @param {Ext.selection.DataViewModel} this
             * @param  {Kanban.model.Task} record The selected record
             */
            'select'
        ]);

        return selModel;
    }
}, function () {

    Ext.apply(Kanban, {
        VERSION : '2.0.31',
        LICENSE : '%LICENSE%'
    });

});
