/**
 * A specialized field to enter cost values.
 * This class inherits from the standard Ext JS "number" field, so any usual `Ext.form.field.Number` configs can be used.
 */
Ext.define('Gnt.field.Cost', {
    extend              : 'Ext.form.field.Number',

    alias               : 'widget.costfield',

    mixins              : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],

    alternateClassName  : 'Gnt.widget.CostField',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - invalidText         : 'Invalid value',
     - currencySymbol      : '$',
     - currencySymbolAlign : 'left'
     */

    disableKeyFilter    : false,

    minValue            : 0,
    allowExponential    : false,

    baseChars           : '0123456789',

    fieldProperty           : 'costField',
    setTaskValueMethod      : 'setCost',
    getTaskValueMethod      : 'getCost',
    instantUpdate           : true,

    /**
     * @cfg {String} currencySymbol The currency to set on display. By default the value is taken from the class locale.
     */
    currencySymbol          : null,

    /**
     * @cfg {String} currencySymbolAlign The currency symbol align. Defines where the symbol should be rendered.
     * Possible options are:
     *
     *  - 'left' - left to the value,
     *  - 'right' - right to the value.
     *
     * By default the value is taken from the class locale.
     */
    currencySymbolAlign     : null,

    initComponent : function () {
        this.invalidText         = this.L('invalidText');
        this.currencySymbol      = this.currencySymbol || this.L('currencySymbol');
        this.currencySymbolAlign = this.currencySymbolAlign || this.L('currencySymbolAlign');
        this.baseChars           = this.baseChars + this.currencySymbol;
        this.callParent(arguments);
    },

    valueToRaw: function (value) {
        return this.valueToVisible(value);
    },

    valueToVisible : function (value) {
        var result = '';

        if (Ext.isNumber(value)) {
            result = Ext.Number.toFixed(value, this.decimalPrecision);

            if (this.currencySymbolAlign == 'left') {
                result = this.currencySymbol + ' ' + result;
            } else {
                result += ' ' + this.currencySymbol;
            }
        }

        return result;
    },

    rawToValue: function (value) {

        if (value)
            return this.parseValue(value);

        return value;
    },

    parseValue : function (value) {
        return this.callParent([value && value.replace(this.currencySymbol, '')]);
    },

    getErrors: function (value) {
        var cost = this.parseValue(value);

        if (cost === null) {
            if (value !== null && value !== '') {
                return [this.invalidText];
            } else {
                cost = '';
            }
        }
        return this.callParent([cost]);
    },

    setValue : function (value) {
        this.callParent([ value ]);

        if (this.instantUpdate && !this.getSuppressTaskUpdate() && this.task) {
            // apply changes to task
            this.applyChanges();
        }
    }
});
