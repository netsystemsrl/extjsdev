/**
 * A text field that allows you to filter out undesired columns from the TaskBoard view.
 *
 * @class Kanban.field.ColumnFilter
 * @extends Ext.form.field.ComboBox
 */
Ext.define('Kanban.field.ColumnFilter', {
    extend : 'Ext.form.ComboBox',
    alias  : 'widget.columnfilter',

    requires : [
        'Ext.data.JsonStore'
    ],

    multiSelect  : true,
    valueField   : 'id',
    displayField : 'name',
    panel        : null,
    queryMode    : 'local',
    listConfig   : {
        htmlEncode : true,
        cls        : 'sch-columnfilter-list'
    },

    initComponent : function () {
        var me = this;

        me.store = new Ext.data.JsonStore({
            proxy  : 'memory',
            fields : ['id', 'name']
        });

        me.loadStore();

        me.callParent(arguments);

        me.getPicker().on({
            beforeshow : me.onBeforeColumnListShow,
            scope      : me
        });

        me.getPicker().on({
            show : function (picker) {
                picker.on('selectionchange', me.applyFilterToColumns, me);
            },

            hide : function (picker) {
                picker.un('selectionchange', me.applyFilterToColumns, me);
            },

            delay : 50,  // The picker fires 'selectionchange' as it shows itself
            scope : me
        });

        me.value = me.value || me.panel.query('taskcolumn').map(function (column) {
            return column.state;
        });

        // Need to apply initial filtering if values are provided
        me.applyFilterToColumns();
    },

    loadStore : function () {
        var me     = this,
            locale = Sch.locale.Active['Kanban.locale'] || {},
            data   = me.panel.query('taskcolumn').map(function (column) {
                return {
                    id   : column.state,
                    name : column.origTitle || locale[column.state] || column.state
                };
            });

        me.store.loadData(data);
    },

    applyFilterToColumns : function () {
        var me     = this,
            values = me.value;

        me.store.each(function (rec) {
            var column  = me.panel.down('[state=' + rec.get('id') + ']'),
                visible = Ext.Array.indexOf(values, rec.get('id')) >= 0;

            column[visible ? 'show' : 'hide']();
        });
    },

    onBeforeColumnListShow : function () {
        var me      = this,
            visible = [];

        Ext.each(me.panel.query('taskcolumn'), function (column) {
            if (column.isVisible()) {
                visible.push(me.store.getById(column.state));
            }
        });

        me.select(visible);
    }

});
