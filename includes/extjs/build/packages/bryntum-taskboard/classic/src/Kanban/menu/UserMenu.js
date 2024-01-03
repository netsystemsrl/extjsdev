/**

@class Kanban.menu.UserMenu
@extends Ext.menu.Menu

A simple menu showing a list of users that can be assigned to a task. Intended to be used together with the TaskBoard.
Sample usage:

    var taskBoard = new Kanban.view.TaskBoard({
        resourceStore : resourceStore,
        taskStore : taskStore,

        userMenu : new Kanban.menu.UserMenu({
            resourceStore : resourceStore
        }),

        ...
    });
*/
Ext.define('Kanban.menu.UserMenu', {
    extend    : 'Ext.menu.Menu',
    alias     : 'widget.kanban_usermenu',

    cls           : 'sch-usermenu',
    plain         : true,

    /**
     * @cfg {Kanban.data.ResourceStore} store (required) The task store
     */
    resourceStore : null,

    initComponent : function () {
        var me      = this;

        Ext.apply(this, {

            renderTo : document.body,

            listeners : {
                beforeshow : function () {
                    var user = this.task.getResource();

                    if (user) {
                        this.items.each(function (item) {
                            if (user == item.user) {
                                item.addCls('sch-user-selected');
                            }
                            else {
                                item.removeCls('sch-user-selected');
                            }
                        });
                    }
                }
            }
        });

        this.resourceStore = Ext.data.StoreManager.lookup(this.resourceStore);

        this.mon(this.resourceStore, {
            load    : this.populate,
            add     : this.populate,
            remove  : this.populate,
            update  : this.populate,

            scope   : this
        });

        this.callParent(arguments);

        this.populate();
    },

    showForTask : function (task, xy) {
        this.task = task;

        if (this.resourceStore.getCount() > 0) {
            this.showAt(xy);
        }
    },

    onUserSelected : function (item) {
        this.task.assign(item.user);
    },

    populate : function () {
        var me      = this;
        var items   = [];

        this.resourceStore.each(function (user) {
            items.push({
                text    : user.getName(),
                user    : user,
                handler : me.onUserSelected,
                scope   : me
            });
        });

        this.removeAll(true);

        this.add(items);
    }
});
