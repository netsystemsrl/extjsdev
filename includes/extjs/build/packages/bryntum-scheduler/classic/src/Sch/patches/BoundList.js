// https://app.assembla.com/spaces/bryntum/tickets/6645
Ext.define('Sch.patches.BoundList', {
    extend : 'Sch.util.Patch',

    requires : ['Ext.view.BoundList'],

    target : 'Ext.view.BoundList',

    overrides : {
        // HTML encode combobox items if htmlEncode flag is true
        getInnerTpl : function (displayField) {
            return this.htmlEncode ? '{' + displayField + ':htmlEncode}' : this.callParent(arguments);
        }
    }
});
