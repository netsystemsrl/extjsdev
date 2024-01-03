/**
@class Gnt.field.Percent
A specialized field to enter percent values.
This class inherits from the standard Ext JS "number" field, so any usual Ext.form.field.Number configs can be used.
*/
Ext.define('Gnt.field.Percent', {
    extend              : 'Ext.form.field.Number',

    alias               : 'widget.percentfield',

    mixins              : ['Gnt.mixin.Localizable'],

    alternateClassName  : 'Gnt.widget.PercentField',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - invalidText : 'Invalid value'
     */

    disableKeyFilter    : false,

    minValue            : 0,
    maxValue            : 100,
    allowExponential    : false,

    baseChars           : '0123456789%',

    selectOnFocus       : false,

    constructor : function () {
        this.callParent(arguments);

        this.invalidText = this.L('invalidText');
    },

    valueToRaw: function (value) {
        if (Ext.isNumber(value)) {
            // Prevent Ext from showing a task as fully completed (100%) when it's not
            if (value > 99 && value < 100) {
                var precisionCoef = Math.pow(10, this.decimalPrecision);

                value = Math.floor( value * precisionCoef) / precisionCoef;
            }

            return parseFloat(Ext.Number.toFixed(value, this.decimalPrecision)) + '%';
        }
        return '';
    },

    getErrors: function (value) {
        var percent = this.parseValue(value);

        if (percent === null) {
            if (value !== null && value !== '') {
                return [this.invalidText];
            } else {
                percent = '';
            }
        }
        return this.callParent([percent]);
    }
});
