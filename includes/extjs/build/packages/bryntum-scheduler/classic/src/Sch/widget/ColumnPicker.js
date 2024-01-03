/**
 @class Sch.widget.ColumnPicker
 @private
 @extends Ext.form.field.ComboBox

 Columnpicker widget for picking columns from a panel.
 */

Ext.define('Sch.widget.ColumnPicker', {
    extend            : 'Ext.form.field.ComboBox',

    requires          : [
        'Ext.data.Store'
    ],

    multiSelect       : true,
    valueField        : 'id',
    displayField      : 'name',

    forceSelection    : true,

    editable          : false,

    listConfig        : {
        htmlEncode      : true,
        cls             : 'sch-columnpicker-list',
        // Has no effect due to https://www.sencha.com/forum/showthread.php?348390-Not-possible-to-provide-selectedItemCls-to-BoundList-cfg&p=1189906#post1189906
        selectedItemCls : Ext.baseCSSPrefix + 'fa fa-check'
    },

    /**
     * @cfg {Ext.grid.column.Column[]} An array of columns to choose from
     */
    columns           : null,

    /**
     * @cfg {String} columnEmptyText Text to show when column text is empty
     */
    columnEmptyText   : null,

    columnEmptyRegExp : /^(\s*|&(nbsp|#160);)$/,

    initComponent : function () {

        this.store = new Ext.data.Store({
            proxy  : 'memory',
            fields : ['id', 'name', 'column'],
            data   : this.processColumns(this.columns)
        });

        this.callParent(arguments);
    },

    processColumns : function (columns) {
        var me      = this,
            value   = [],
            data    = Ext.Array.map(columns || [], function (column) {

            if (!column.isHidden()) {
                value.push(column.id);
            }

            return {
                id     : column.id,
                name   : me.getColumnTitle(column),
                column : column
            };
        });

        this.value = this.value || value;

        return data;
    },


    getColumnTitle : function (column) {
        var me = this;

        return (!Ext.String.trim(column.text) || column.text.match(me.columnEmptyRegExp)) ? me.columnEmptyText : column.text;
    },

    // @OVERRIDE
    // https://www.sencha.com/forum/showthread.php?348390-Not-possible-to-provide-selectedItemCls-to-BoundList-cfg&p=1189906#post1189906
    getPicker : function () {
        var list = this.callParent(arguments);

        list.selectedItemCls += ' ' + Ext.baseCSSPrefix + 'fa fa-check';

        return list;
    },


    getSelectedColumns : function () {
        var me    = this,
            value = me.getValue();

        if (!Ext.isArray(value)) {
            value = [value];
        }

        return Ext.Array.map(value, function (id) {
            return me.store.getById(id).get('column');
        });
    }
});
