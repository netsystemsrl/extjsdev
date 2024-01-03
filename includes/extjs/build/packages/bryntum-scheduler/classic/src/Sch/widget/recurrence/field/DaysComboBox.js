/**
 * A combobox field allowing to pick days for the "Monthly" and "Yearly" mode in the {@link Sch.widget.recurrence.Dialog recurrence dialog}.
 */
Ext.define('Sch.widget.recurrence.field.DaysComboBox', {
    extend   : 'Ext.form.field.ComboBox',
    requires : [
        'Ext.data.StoreManager',
        'Ext.data.ArrayStore',
        'Ext.Date',
        'Sch.data.util.recurrence.DayRuleEncoder'
    ],

    mixins : ['Sch.mixin.Localizable'],
    alias  : 'widget.dayscombo',

    tpl : [
        '<ul class="' + Ext.baseCSSPrefix + 'list-plain">',
        '<tpl for=".">',
        '<li class="' + Ext.baseCSSPrefix + 'boundlist-item {cls}">{text}</li>',
        '</tpl>',
        '</ul>'
    ],

    splitCls : 'sch-recurrenceformdays-split',

    listConfig : {
        htmlEncode : true,
        maxHeight  : 350
    },

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - 'day'         : 'day',
     * - 'weekday'     : 'weekday',
     * - 'weekend day' : 'weekend day'
     */

    editable     : false,
    queryMode    : 'local',
    displayField : 'text',
    valueField   : 'name',
    allowBlank   : false,
    weekStartDay : 1,
    dayNames     : null,
    defaultValue : null,

    allDaysValue        : 'SU,MO,TU,WE,TH,FR,SA',
    workingDaysValue    : 'MO,TU,WE,TH,FR',
    nonWorkingDaysValue : 'SU,SA',

    initComponent : function () {
        var me = this;

        me.defaultValue = me.defaultValue || me.allDaysValue;

        me.value = me.value || me.defaultValue;

        me.dayNames = me.dayNames || Ext.Date.dayNames.slice(me.weekStartDay).concat(Ext.Date.dayNames.slice(0, me.weekStartDay));

        me.store = me.store && Ext.data.StoreManager.lookup(me.store) || new Ext.data.ArrayStore({
            fields : ['name', 'text', 'cls'],
            data   : me.buildOptions()
        });

        me.callParent(arguments);
    },

    buildOptions : function () {
        var me = this;

        return me.buildWeekDays().concat([
            [me.allDaysValue, me.L('day'), me.splitCls],
            [me.workingDaysValue, me.L('weekday')],
            [me.nonWorkingDaysValue, me.L('weekend day')]
        ]);
    },

    buildWeekDays : function () {
        var me = this;

        return Ext.Array.map(me.dayNames, function (item, index) {
            var dayIndex = (index + me.weekStartDay) % me.dayNames.length;

            // Ext.data.field.Field records
            return [Sch.data.util.recurrence.DayRuleEncoder.encodeDay(dayIndex), item];
        });
    },

    setValue : function (value) {
        var me = this;

        if (value && Ext.isArray(value)) {
            //TODO Use Sch.data.util.recurrence.DayRuleEncoder to sort values
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

        return value ? value.split(',') : [];
    }
});
