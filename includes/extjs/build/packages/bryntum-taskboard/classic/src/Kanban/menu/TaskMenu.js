/**

 @class Kanban.menu.TaskMenu
 @extends Ext.menu.Menu

 A simple menu that can be attached to a task on the kanban board. When configured a menu-handle-icon will be rendered on the task.
 The handle template can be configured in {@link Kanban.template.Task#menuIconTpl}

 */
Ext.define('Kanban.menu.TaskMenu', {

    extend : 'Ext.menu.Menu',

    requires : [
        'Kanban.menu.TaskMenuItems'
    ],

    isTaskMenu : true,
    
    /**
     * @property alias
     */

    alias   : 'widget.kanban_taskmenu',

    cls     : 'sch-task-menu',

    handleCls : 'sch-task-menu-handle',

    /**
     * @property {Kanban.view.TaskBoard} taskBoard A reference to the Kanban taskboard.
     */

    taskBoard : null,

    /**
     * @property {Kanban.model.Task} task A reference to the current task.
     */

    config : {
        task: null
    },

    hideHandleTimer : null,

    /**
     * @cfg {Number} handleHideDelay The handle will be hidden after this number of ms, when the mouse leaves the task element.
     */

    handleHideDelay : 500,

    currentHandle : null,

    editorClass   : 'Kanban.editor.SimpleEditor',
    userMenuClass : 'Kanban.menu.UserMenu',

    /**
     * @cfg {Boolean} defaultActions Set to true to include the default toolitems (Copy, delete, edit etc).
     */
    defaultActions : true,

    /**
     * @cfg {String} itemFactoryClass A classname of the class that can generate items for the menu. The factory will be used when
     * no items are set in the config.
     *
     * A factory class needs to have a public function {@link Kanban.menu.TaskMenuItems#getItems} which is called to set the items for this menu.
     */

    itemFactoryClass : 'Kanban.menu.TaskMenuItems',

    initComponent : function () {
        this.on('beforeshow', this.onBeforeShow, this);

        if (this.defaultActions) {

            this.items = Ext.create(this.itemFactoryClass, {
                editorClass    : this.editorClass,
                userMenuClass  : this.userMenuClass,
                defaultActions : this.defaultActions,
                items          : this.items || [],
                taskBoard      : this.taskBoard,
                mainMenu       : this
            }).getItems();
        }

        this.callParent(arguments);
    },

    registerListeners : function () {

        this.mon(this.taskBoard.el, {
            click    : this.onMenuHandleClick,
            delegate : '.' + this.handleCls,
            scope    : this
        });

        this.mon(this.taskBoard, {
            taskmouseenter    : this.onHandleMouseOver,
            taskmouseleave    : this.onHandleMouseLeave,
            scope         : this
        });
    },

    /**
     * Shows this menu.
     * @param task
     */
    showForTask : function (task, e, node) {
        var el = e.getTarget('.sch-task');

        this.setTask(task);
        this.show();
        this.alignTo(el, 'tl-tr?');
    },

    onMenuHandleClick : function (e, node) {
        var task = this.taskBoard.resolveRecordByNode(node);

        e.stopEvent();

        this.showForTask(task, e, node);
    },

    onHandleMouseOver : function (view, task, taskNode, event, eOpts) {
        window.clearTimeout(this.hideHandleTimer);
        this.hide();
        this.currentHandle && this.currentHandle.setVisible(false);
        this.currentHandle = Ext.select('.' + this.handleCls, false, taskNode).setVisible(true);
    },

    onHandleMouseLeave : function (view, task, taskNode, event, eOpts) {

        this.hideHandleTimer = Ext.defer(function () {
            this.currentHandle && this.currentHandle.setVisible(false);
         }, this.handleHideDelay, this);
    },

    /**
     * Called once for each menuitem before the menu is shown. Use this to hide/disable items on a per-task basis.
     *
     * @param {Ext.menu.Item} menuItem the menu item
     * @param {Kanban.model.Task} task The task
     * @returns {Boolean} false to hide the menu item
     */
    shouldShowItem : function (menuItem, task) {
        return true;
    },

    onBeforeShow : function (menu) {
        var task = this.getTask();

        this.items.each(function (menuItem) {
            menuItem.task = task;
            menuItem.setVisible(this.shouldShowItem(menuItem, task));
        }, this);
    },

    destroy : function() {
        clearTimeout(this.hideHandleTimer);

        this.callParent(arguments);
    }
});