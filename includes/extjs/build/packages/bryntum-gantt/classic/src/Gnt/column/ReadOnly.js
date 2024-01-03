/**

 @class Gnt.column.ReadOnly
 @extends Ext.grid.Column

 A Column which displays if the task is readonly.
 */



Ext.define("Gnt.column.ReadOnly", {
    extend              : "Ext.grid.Column",
    alias               : [
        "widget.readonlycolumn",
        "widget.ganttcolumn.readonly"
    ],

    mixins              : ['Gnt.column.mixin.TaskFieldColumn'],

    fieldProperty       : 'readOnlyField',

    defaultEditor       : 'readonlyfield',

    editor              : 'readonlyfield',

    initComponent : function () {
        this.initTaskFieldColumn();

        this.callParent(arguments);
    },

    getValueToRender : function (value, meta, task) {
        return this.field.valueToVisible(value);
    }

});
