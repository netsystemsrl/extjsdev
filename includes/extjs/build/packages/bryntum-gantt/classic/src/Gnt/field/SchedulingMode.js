/**
 * A specialized field, allowing a user to also specify task scheduling mode value.
 * This class inherits from the standard Ext JS "combo" field, so any usual `Ext.form.field.ComboBox` configs can be used.
 *
 * The value of this field can be one of the following strings: `Normal`, `FixedDuration`, `EffortDriven`, `DynamicAssignment`.
 */
Ext.define('Gnt.field.SchedulingMode', {
    extend                  : 'Ext.form.field.ComboBox',

    requires                : ['Sch.patches.BoundList'],

    mixins                  : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],

    alias                   : 'widget.schedulingmodefield',

    alternateClassName      : 'Gnt.widget.SchedulingmodeField',

    fieldProperty           : 'schedulingModeField',
    setTaskValueMethod      : 'setSchedulingMode',
    getTaskValueMethod      : 'getSchedulingMode',

    listConfig              : {
        htmlEncode : true
    },

    /**
     * @cfg {String} pickerAlign The align for combo-box's picker.
     */
    pickerAlign             : 'tl-bl?',

    /**
     * @cfg {Boolean} matchFieldWidth Whether the picker dropdown's width should be explicitly set to match the width of the field. Defaults to true.
     */
    matchFieldWidth         : true,

    editable                : false,
    selectOnFocus           : false,

    forceSelection          : true,

    triggerAction           : 'all',

    constructor : function (config) {
        config  = config || {};

        if (!config.store) this.initStore(config);
        this.callParent([ config ]);
        this.on('change', this.onFieldChange, this);
    },

    initStore : function (config) {
        var me = this;

        config.store = me.getDefaultSchedulingModes();
    },

    getDefaultSchedulingModes : function () {
        var me = this;

        return [
            [ 'Normal',             me.L('Normal') ],
            [ 'FixedDuration',      me.L('FixedDuration') ],
            [ 'EffortDriven',       me.L('EffortDriven') ],
            [ 'DynamicAssignment',  me.L('DynamicAssignment') ]
        ];
    },

    // will be used in the column's renderer
    valueToVisible : function (value, task) {
        var me              = this,
            displayTplData  = [];

        var record = this.findRecordByValue(value);

        if (record) {
            displayTplData.push(record.data);
        } else if (Ext.isDefined(me.valueNotFoundText)) {
            displayTplData.push(me.valueNotFoundText);
        }

        return me.displayTpl.apply(displayTplData);
    },

    getErrors   : function (value) {
        var errors = this.callParent(arguments);

        if (errors && errors.length) {
            return errors;
        }

        // allow empty values by default
        if (!Ext.isEmpty(value) && !(this.findRecordByDisplay(value) || this.findRecordByValue(value))) {
            return [this.L('invalidText')];
        } else {
            return [];
        }
    },

    getValue : function () {
        return this.value;
    },

    onFieldChange : function (field, value) {
        if (this.instantUpdate && !this.getSuppressTaskUpdate() && this.task && this.value) {
            // apply changes to task
            this.applyChanges();
        }
    }

});
