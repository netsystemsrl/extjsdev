Ext.define('Gnt.selection.SpreadsheetModel', {
    extend : 'Ext.grid.selection.SpreadsheetModel',

    requires : ['Gnt.patches.CellContext'],

    uses : [
        'Gnt.column.WBS'
    ],

    alias : 'selection.gantt_spreadsheet',

    /**
     * @cfg {Object} wbsColumnConfig The optional configuration for WBS column that
     * can override or add to the default configuration.
     */
    wbsColumnConfig : null,

    privates : {
        getNumbererColumnConfig : function () {
            var me = this;

            return Ext.apply({
                xtype        : 'wbscolumn',
                width        : me.rowNumbererHeaderWidth,
                editRenderer : '&#160;',
                tdCls        : me.rowNumbererTdCls,
                cls          : me.rowNumbererHeaderCls,
                // disabling all interactions
                sortable     : false,
                //resizable  : false,
                draggable    : false,
                hideable     : false,
                menuDisabled : true,
                // to remove possibility to unlock column
                lockable     : false,
                locked       : true,
                // to exclude from export
                ignoreExport : true
            }, me.wbsColumnConfig);
        }
    }
});
