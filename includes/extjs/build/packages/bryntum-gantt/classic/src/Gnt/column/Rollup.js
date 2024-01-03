/**

@class Gnt.column.Rollup
@extends Ext.tree.Column

A Column which displays if the task should rollup to the parent task.
*/

Ext.define("Gnt.column.Rollup", {
    extend              : 'Ext.grid.Column',
    alias               : [
        'widget.rollupcolumn',
        'widget.ganttcolumn.rollup'
    ],

    requires            : [
        'Ext.form.field.ComboBox',
        'Sch.patches.BoundList'
    ],

    mixins              : ['Gnt.column.mixin.TaskFieldColumn'],

    fieldProperty       : 'rollupField',

    editor              : {
        xtype      : 'combobox',
        listConfig : {
            htmlEncode : true
        }
    },

    defaultEditor       : 'combobox',

    initComponent : function () {
        this.initTaskFieldColumn({
            store : [
                [ false, this.L('no') ],
                [ true, this.L('yes') ]
            ]
        });

        this.callParent(arguments);
    },

    getValueToRender : function (value, meta, task) {
        return this.L(value ? 'yes' : 'no');
    }

});

