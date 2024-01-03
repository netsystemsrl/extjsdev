/**

@class Sch.panel.SchedulerTree
@extends Sch.panel.TimelineTreePanel
@mixins Sch.mixin.SchedulerPanel

A complete scheduler panel using a tree view. This class can be used when you have a lot of resources organized in a hierarchical structure.

{@img scheduler/images/scheduler-tree.png}

Please refer to the {@link Sch.panel.SchedulerGrid} for additional documentation, as these classes
are virtually identical. This document will only provide the tree-specific details.

In the scheduler tree case:

- the `resourceStore` is expected to be an instance of the {@link Sch.data.ResourceTreeStore}.
- the scheduler tree does not support vertical orientation.
- in your columns definition, you must include a column which will contain the tree itself (the `treecolumn` xtype):

        var schedulerTree = Ext.create('Sch.panel.SchedulerTree', {
            columns: [
                {
                    xtype       : 'treecolumn',

                    text        : 'Name',
                    width       : 200,
                    sortable    : true,
                    dataIndex   : 'Name'
                }
            ]
        });


*/
Ext.define("Sch.panel.SchedulerTree", {
    extend          : "Sch.panel.TimelineTreePanel",
    mixins          : [
        'Sch.mixin.SchedulerPanel'/* @cut-if-calendar-> */,
        'Sch.view.dependency.Mixin'
        /* <-@ */
    ],
    alias           : [ 'widget.schedulertree'],
    viewType        : 'schedulergridview',

    isSchedulerTree : true,

    setMode : function (mode) {
        if (mode !== 'horizontal') {
            Ext.Error.raise("Sch.panel.SchedulerTree only support horizontal mode");
        }
    },

    initComponent : function() {
        this.callParent(arguments);
        this.getSchedulingView()._initializeSchedulerView();
    }
}, function() {
    this.override(Sch.mixin.SchedulerPanel.prototype.inheritables() || {});
});
