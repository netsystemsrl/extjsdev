/**

@class Kanban.field.AddNew
@extends Ext.form.field.Text

A basic text field that allows you to easily add new tasks by typing a name and hitting the Enter key.

Sample usage:

    var taskBoard = new Kanban.view.TaskBoard({
        resourceStore : userStore,
        taskStore     : taskStore,

        // Configure each state column individually
        columnConfigs : {
            all : {
                iconCls : 'sch-header-icon'
            },

            "NotStarted" : {
                dockedItems : {
                    xtype   : 'container',
                    dock    : 'bottom',
                    layout  : 'fit',

                    items   : {
                        xtype    : 'addnewfield',
                        store    : taskStore,

                        // Configurations applied to the newly created taska
                        defaults : {
                            State : 'NewTask'
                        }
                    }
                }
            }
        }
    });

 */
Ext.define('Kanban.field.AddNew', {
    extend            : 'Ext.form.TextField',
    alias             : 'widget.addnewfield',
    enableKeyEvents   : true,
    emptyText         : 'Add new task...',

    /**
     * @cfg {Kanban.data.TaskStore} store (required) The task store
     */
    store             : null,

    /**
     * @cfg {Object} defaults Any default properties to be applied to the newly created tasks
     */
    defaults          : null,

    initComponent : function () {
        this.on('keyup', this.onMyKeyUp, this);

        if (Ext.isString(this.store)) {
            this.store = Ext.getStore(this.store);
        }

        this.callParent(arguments);
    },

    onMyKeyUp : function(field, e) {
        if (e.getKey() === e.ENTER) {
            this.addTask();
        }
    },

    addTask : function() {
        var vals   = {};
        var column = this.up('taskcolumn');

        vals[this.store.model.prototype.nameField] = this.getValue();

        var newTask = this.store.add(Ext.apply(vals, this.defaults))[ 0 ];

        this.reset();

        if (column) {
            var view = column.down('taskview'),
                node = view.getNode(newTask);

            if (node) {
                Ext.fly(node).scrollIntoView(view.el, false, true);
            }
        }
    }
});
