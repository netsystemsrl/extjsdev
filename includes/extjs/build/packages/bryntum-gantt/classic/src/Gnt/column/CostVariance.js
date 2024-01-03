/**
 * A "calculated" column which displays the difference between {@link Gnt.model.Task#BaselineCost BaselineCost} and {@link Gnt.model.Task#Cost Cost} of a task.
 * See {@link Gnt.model.Task#getCostVariance} for details.
 */
Ext.define("Gnt.column.CostVariance", {
    extend      : "Ext.grid.column.Column",

    requires : [
        'Ext.util.Format'
    ],

    alias       : [
        "widget.costvariancecolumn",
        "widget.ganttcolumn.costvariance"
    ],

    mixins      : ['Gnt.column.mixin.TaskFieldColumn'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - text : 'Cost Variance'
     */

    /**
     * @cfg {Number} width The width of the column.
     */
    width       : 80,

    decimalPrecision        : 2,

    /**
     * @cfg {String} decimalSeparator
     * The character that the {@link #number} function uses as a decimal point.
     *
     */
    decimalSeparator        : null,


    fieldProperty           : 'costVarianceField',

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
        this.currencySymbol      = this.currencySymbol || this.L('currencySymbol');
        this.currencySymbolAlign = this.currencySymbolAlign || this.L('currencySymbolAlign');

        this.initTaskFieldColumn();

        this.decimalSeparator = this.decimalSeparator || Ext.util.Format.decimalSeparator;

        this.callParent(arguments);
    },

    getValueToRender : function (value, meta, task) {
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
    }
});
