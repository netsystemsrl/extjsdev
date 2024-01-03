/**

@class Kanban.menu.UserPictureMenu
@extends Ext.menu.Menu

A simple menu showing a picture for each user that can be assigned to a task. Intended to be used together with the TaskBoard.
Sample usage:

    var taskBoard = new Kanban.view.TaskBoard({
        resourceStore : resourceStore,
        taskStore : taskStore,

        userMenu : new Kanban.menu.UserPictureMenu({
            resourceStore : resourceStore
        }),

        ...
    });

*/
Ext.define('Kanban.menu.UserPictureMenu', {
    extend : 'Ext.menu.Menu',

    alias : [
        'widget.userpicturemenu',
        'widget.kanban_userpicturemenu'
    ],

    requires : [
        'Kanban.menu.UserPicker'
    ],

    cls    : 'sch-userpicturemenu',
    width  : 290,
    height : 200,

    resourceStore   : null,
    hideOnSelect    : true,

    initComponent : function () {
        var me = this,
            cfg = Ext.apply({}, me.initialConfig);

        delete cfg.listeners;

        Ext.apply(me, {
            plain         : true,
            showSeparator : false,
            bodyPadding   : 0,
            items         : Ext.applyIf({
                margin : 0,
                store  : this.resourceStore,
                xtype  : 'userpicker'
            }, cfg)
        });

        me.callParent(arguments);

        me.picker = me.down('userpicker');

        me.relayEvents(me.picker, ['select']);

        if (me.hideOnSelect) {
            me.on('select', me.onUserSelected, me);
        }

        this.mon(Ext.getBody(), 'click', this.onBodyClick, this);
    },

    showForTask : function (task, xy) {
        this.task = task;

        this.showAt(xy);

        var user = task.getResource();

        if (user) {
            this.picker.select(user, false, true);
        } else {
            this.picker.getSelectionModel().deselectAll();
        }
    },

    onUserSelected : function (picker, user) {
        this.hide();

        this.task.assign(user);
    },

    onBodyClick : function(e, t) {
        if (!e.within(this.el)) {
            this.hide();
        }
    }
});
