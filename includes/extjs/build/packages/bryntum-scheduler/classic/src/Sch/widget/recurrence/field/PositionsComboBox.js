/**
 * A combobox field allowing to days positions in the {@link Sch.widget.recurrence.Dialog recurrence dialog}.
 */
Ext.define('Sch.widget.recurrence.field.PositionsComboBox', {
    extend   : 'Ext.form.field.ComboBox',
    requires : [
        'Ext.data.StoreManager',
        'Ext.data.ArrayStore'
    ],

    mixins : ['Sch.mixin.Localizable'],
    alias  : 'widget.positionscombobox',

    tpl : [
        '<ul class="' + Ext.baseCSSPrefix + 'list-plain">',
        '<tpl for=".">',
        '<li class="' + Ext.baseCSSPrefix + 'boundlist-item {cls}">{text}</li>',
        '</tpl>',
        '</ul>'
    ],

    splitCls : 'sch-recurrenceformpositions-split',

    listConfig : {
        htmlEncode : true
    },

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - 'position1'  : 'first',
     * - 'position2'  : 'second',
     * - 'position3'  : 'third',
     * - 'position4'  : 'fourth',
     * - 'position5'  : 'fifth',
     * - 'position-1' : 'last'
     */

    editable     : false,
    queryMode    : 'local',
    displayField : 'text',
    valueField   : 'name',
    allowBlank   : false,
    maxPosition  : 5,
    defaultValue : '1',

    initComponent : function () {
        var me = this;

        me.value = me.value || me.defaultValue;

        me.store = me.store && Ext.data.StoreManager.lookup(me.store) || new Ext.data.ArrayStore({
            fields : ['name', 'text', 'cls'],
            data   : me.buildDayNumbers().concat([
                // the following lines are added to satisfy the 904_unused localization test
                // to let it know that these locales are used:
                // this.L('position-1')
                ['-1', me.L('position-1'), me.splitCls]
            ])
        });

        me.callParent(arguments);
    },

    buildDayNumbers : function () {
        var me    = this,
            items = [],
            i;

        for (i = 1; i <= me.maxPosition; i++) {
            // the following lines are added to satisfy the 904_unused localization test
            // to let it know that these locales are used:
            // this.L('position1')
            // this.L('position2')
            // this.L('position3')
            // this.L('position4')
            // this.L('position5')
            items.push([i + '', me.L('position' + i)]);
        }

        return items;
    },

    setValue : function (value) {
        var me = this;

        if (value && Ext.isArray(value)) {
            value = value.join(',');
        }

        // if the value has no matching option in the store we need to use default value
        if (value && this.store.findExact('name', value) !== -1) {
            this.callParent([value]);
        } else {
            this.callParent([this.defaultValue]);
        }
    },

    getValue : function () {
        var value = this.callParent(arguments);

        return value ? Ext.Array.map(value.split(','), function (item) {
            return parseInt(item, 10);
        }) : [];
    }
});
