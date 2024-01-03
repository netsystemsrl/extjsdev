/**
 * A combobox field allowing to pick frequency in the {@link Sch.widget.recurrence.Dialog recurrence dialog}.
 */
Ext.define('Sch.widget.recurrence.field.FrequencyComboBox', {
    extend       : 'Ext.form.field.ComboBox',

    alias        : 'widget.frequencycombo',

    mixins       : ['Sch.mixin.Localizable'],

    tpl : [
        '<ul class="' + Ext.baseCSSPrefix + 'list-plain">',
        '<tpl for=".">',
        '<li class="' + Ext.baseCSSPrefix + 'boundlist-item {cls}">{text}</li>',
        '</tpl>',
        '</ul>'
    ],

    listConfig : {
        htmlEncode : true
    },

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - 'Daily'   : 'Daily',
     * - 'Weekly'  : 'Weekly',
     * - 'Monthly' : 'Monthly',
     * - 'Yearly'  : 'Yearly'
     */

    editable     : false,
    queryMode    : 'local',
    displayField : 'text',
    valueField   : 'name',

    initComponent : function () {
        var me = this;

        this.emptyText = me.localizeText(this.emptyText);

        me.store = me.store || {
            fields : ['name', 'text', 'cls'],
            data   : me.buildOptions()
        };

        me.callParent(arguments);
    },

    buildOptions : function () {
        var me = this;

        return [
            [ 'DAILY', me.L('Daily') ],
            [ 'WEEKLY', me.L('Weekly') ],
            [ 'MONTHLY', me.L('Monthly') ],
            [ 'YEARLY', me.L('Yearly') ]
        ];
    }
});
