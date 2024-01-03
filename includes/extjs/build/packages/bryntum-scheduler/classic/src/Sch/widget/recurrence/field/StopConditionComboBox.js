/**
 * A combobox field allowing to choose stop condition for the recurrence in the {@link Sch.widget.recurrence.Dialog recurrence dialog}.
 */
Ext.define('Sch.widget.recurrence.field.StopConditionComboBox', {

    extend       : 'Ext.form.field.ComboBox',

    alias        : 'widget.stopconditioncombo',

    mixins       : ['Sch.mixin.Localizable'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - 'Never'   : 'Never',
     * - 'After'   : 'After',
     * - 'On date' : 'On date'
     */

    editable     : false,
    queryMode    : 'local',
    displayField : 'text',
    valueField   : 'name',
    allowBlank   : false,

    listConfig   : {
        htmlEncode : true
    },

    initComponent : function () {
        var me = this;

        me.store = me.store || {
            fields : ['name', 'text'],
            data   : me.buildOptions()
        };

        me.addCls('sch-combo-with-no-value');

        me.callParent(arguments);
    },

    buildOptions : function () {
        var me = this;

        return [
            [ null, me.L('Never') ],
            [ 'count', me.L('After') ],
            [ 'date', me.L('On date') ]
        ];
    },

    setRecurrence : function (recurrence) {
        var value = null;

        if (recurrence.getEndDate()) {
            value = 'date';
        }
        else if (recurrence.getCount()) {
            value = 'count';
        }

        // `null` as a value resets the field to empty value,
        // so need to wrap it in array to select 'Never' option
        this.setValue([value]);
    }
});
