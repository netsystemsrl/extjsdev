/**
 @class Sch.column.ResourceName
 @extends Ext.grid.Column

 A basic grid column showing the Name field of a resource
 */
Ext.define('Sch.column.ResourceName', {
    extend          : 'Ext.grid.Column',

    alias           : 'widget.scheduler_resourcenamecolumn',

    mixins      : [
        'Sch.mixin.Localizable'
    ],

    initComponent : function() {
        Ext.apply(this, {
            text : this.L('name')
        });

        this.callParent(arguments);
    },

    renderer        : function(value, meta, resource) {
        return resource.getName();
    }
});