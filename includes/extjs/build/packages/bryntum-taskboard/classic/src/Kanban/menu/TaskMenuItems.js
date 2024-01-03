/**
 @class Kanban.menu.TaskMenuItems
 @private
 
 This class is a factory of items for the Kanban.menu.TaskMenu. This class should not be used directly.
 With the  {@link Kanban.menu.TaskMenu#defaultActions} this class can be configured.
 */

Ext.define('Kanban.menu.TaskMenuItems', {

    requires : [
        'Kanban.editor.SimpleEditor',
        'Kanban.menu.UserMenu'
    ],

    mixins : [
        'Sch.mixin.Localizable'
    ],

    taskBoard      : null,
    mainMenu       : null,
    defaultActions : null,
    editorClass    : null,
    editor         : null,
    userMenuClass  : null,
    userMenu       : null,

    constructor : function (config) {

        Ext.apply(this, config);

        this.mainMenu.on('beforeshow', this.onBeforeShow, this);

        this.items = this.items || [];

        if (this.defaultActions) {
            this.initEditor();
            this.initUserMenu();
            this.initStateMenu();

            this.items = this.items.concat([
                {
                    action  : 'edit',
                    text    : this.L('edit'),
                    handler : this.onEditClick,
                    scope   : this
                },
                {
                    action : 'assign',
                    text   : this.L('users'),
                    menu   : this.userMenu
                },
                {
                    action : 'setState',
                    text   : this.L('states'),
                    menu   : this.stateMenu
                },
                {
                    action  : 'copy',
                    text    : this.L('copy'),
                    handler : this.onCopyClick,
                    scope   : this
                },
                {
                    action  : 'remove',
                    text    : this.L('remove'),
                    handler : this.onRemoveClick,
                    scope   : this
                }
            ]);
        }

        this.callParent(arguments);
    },

    
    onBeforeShow : function (menu) {
        var task = menu.getTask();

        if (this.userMenu) {
            this.userMenu.task = task;
        }

        if (this.editor) {
            this.editor.task = task;
        }
    },


    getItems : function () {
        return this.items;
    },

    initEditor : function () {
        if (!this.editor) {
            if (this.taskBoard.getTaskEditor()) {
                this.editor = this.taskBoard.getTaskEditor();
            } else {
                this.editor = Ext.create(this.editorClass, {
                    dataIndex : this.taskBoard.taskStore.model.prototype.nameField,
                    panel     : this.taskBoard
                });
            }
        }
    },

    onEditClick : function (btn, e) {
        this.editor.editRecord(this.mainMenu.getTask(), e);
    },

    initUserMenu : function () {
        if (!this.userMenu) {
            this.userMenu = Ext.create(this.userMenuClass, {
                resourceStore : this.taskBoard.resourceStore,
                onBodyClick   : Ext.emptyFn
            });
        }
    },

    initStateMenu : function () {

        var me         = this,
            model      = this.taskBoard.taskStore.model,
            stateField = model.prototype.stateField,
            states     = model.prototype.states;

        var locale = Sch.locale.Active['Kanban.locale'] || {};
        var items  = Ext.Array.map(states, function (state) {
            return {
                text    : locale[state] || state,
                state   : state,
                handler : me.onStateClick,
                scope   : me
            };
        });

        var mainMenu = me.mainMenu;

        this.stateMenu = new Ext.menu.Menu({
            items     : items,
            plain     : true,
            listeners : {
                show : function () {
                    var task = mainMenu.getTask();
                    var state = task.get(stateField);

                    this.items.each(function (item) {
                        item.setDisabled(item.state === state || !task.isValidTransition(item.state));
                    });
                }
            }
        });
    },

    onStateClick : function (btn) {
        this.mainMenu.task.setState(btn.state);
    },

    onCopyClick : function (btn) {
        var store   = this.taskBoard.taskStore,
            task    = this.mainMenu.getTask(),
            newTask = task.copy(null);

        newTask.setName(newTask.getName());
        store.add(newTask);
    },

    onRemoveClick : function (btn) {
        var store = this.taskBoard.taskStore,
            task  = this.mainMenu.getTask();

        store.remove(task);
    }
});