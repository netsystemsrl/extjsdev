/**

@class Kanban.view.TaskColumn
@extends Ext.panel.Panel

A panel representing a 'swim lane' in the task board, based on the {@link Ext.panel.Panel} class. The TaskColumn holds a single {@link Kanban.view.TaskView}
instance and is consumed by the TaskBoard class. You normally don't interact directly with this class, but you can configure each column
using the {@link Kanban.view.TaskBoard#columnConfigs} config option.

    var taskBoard = new Kanban.view.TaskBoard({
        resourceStore : userStore,
        taskStore     : taskStore,
        ..,

        columnConfigs : {
            // Applied to all Task Columns
            all : {
                iconCls : 'sch-header-icon'
            },

            // Configure a Task Column individually
            "NotStarted" : {
                dockedItems : {
                    xtype   : 'container',
                    dock    : 'bottom',
                    layout  : 'fit',
                    border  : 0,
                    padding : '5 8',
                    items   : {
                        height : 30,

                        xtype : 'addnewfield',
                        store : taskStore
                    }
                }
            }
        }
    });

You can also subclass it and have the {@link Kanban.view.TaskBoard} consume your own custom class instead by providing the {@link Kanban.view.TaskBoard#columnClass}
config.
*/
Ext.define('Kanban.view.TaskColumn', {
    extend            : 'Ext.Panel',
    alias             : 'widget.taskcolumn',

    requires          : [
        // Ext JS 5 bug
        'Ext.layout.container.Fit',

        'Kanban.view.TaskView'
    ],

    flex              : 1,
    layout            : 'fit',
    collapseDirection : 'right',

    /**
     * @cfg {String} state (required) The state name for this column. It should contain any special characters such as , . " '
     */
    state             : null,

    store             : null,
    taskBodyTpl       : null,
    taskToolTpl       : null,
    resourceImgTpl    : null,
    origTitle         : null,
    view              : null,
    zoomLevel         : 'large',

    /**
     * @cfg {Object} viewConfig (required) A custom object containing config properties for the {@link Ext.view.View} which is added to this column
     */
    viewConfig        : null,

    initComponent : function () {
        var me = this;

        if (me.state === null) {
            throw 'Must supply state';
        }

        var viewConfig = Ext.apply({
            state : me.state
        }, me.viewConfig || {});

        if (me.taskBodyTpl)       viewConfig.taskBodyTpl = me.taskBodyTpl;
        if (me.taskToolTpl)       viewConfig.taskToolTpl = me.taskToolTpl;
        if (me.resourceImgTpl)    viewConfig.resourceImgTpl = me.resourceImgTpl;

        me.items = me.view = new Kanban.view.TaskView(viewConfig);

        var locale = Sch.locale.Active['Kanban.locale'] || {};

        me.origTitle = me.title = (me.title || locale[me.state] || me.state);

        me.callParent(arguments);

        me.addCls('sch-taskcolumn sch-taskcolumn-state-' + me.state.replace(/\s/g, '-'));
    },

    onRender : function() {
        this.setZoomLevel(this.zoomLevel);

        if (this.header) {
            this.header.addCls('sch-taskcolumnheader-state-' + this.state.replace(/\s/g, '-'));
        }

        this.callParent(arguments);
    },

    refreshTitle : function () {
        var state = this.state;

        var nbrTasks = this.store.query(this.store.getModel().prototype.stateField, state, false, false, true).length;

        this.setTitle(this.origTitle + (nbrTasks ? ' (' + nbrTasks + ')' : ''));
    },

    /**
     * Bind new view store to current column
     * @param {Kanban.data.ViewStore} store New view store bound to task store
     * @private
     */
    bindStore : function(store) {
        var listeners = {
            load        : this.refreshTitle,
            datachanged : this.refreshTitle,
            update      : this.refreshTitle,
            add         : this.refreshTitle,
            remove      : this.refreshTitle,
            buffer      : 20,
            scope       : this
        };

        if (this.store) {
            // TODO: Need to refactor this to accept taskStore and create new viewStore here. See usages
            // To unbind old viewstore correctly, we need to also remove its listeners from master store.
            // See ViewStore constructor.
            this.store.unbindFromStore();
            this.mun(this.store, listeners);
        }

        if (store) {
            this.mon(store, listeners);

            this.view.bindStore(store);
        }

        this.store = store;

        this.refreshTitle();
    },

    getZoomLevel : function() { return this.zoomLevel; },

    setZoomLevel : function(level) {
        this.zoomLevel = level || 'large';

        this.el.set({
            size : level
        });
    }

});
