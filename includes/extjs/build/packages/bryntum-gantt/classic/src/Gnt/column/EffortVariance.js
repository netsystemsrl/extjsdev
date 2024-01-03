/**
 * A "calculated" column which displays the difference between {@link Gnt.model.Task#BaselineEffort BaselineEffort} and {@link Gnt.model.Task#Effort Effort} of a task.
 * See {@link Gnt.model.Task#getEffortVariance} for details.
 */
Ext.define("Gnt.column.EffortVariance", {
    extend      : "Ext.grid.column.Column",

    requires : [
        'Ext.util.Format'
    ],

    alias       : [
        "widget.effortvariancecolumn",
        "widget.ganttcolumn.effortvariance"
    ],

    mixins      : ['Gnt.column.mixin.TaskFieldColumn'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - text : 'Effort Variance'
     */

    /**
     * @cfg {Number} width The width of the column.
     */
    width       : 80,

    /**
     * @cfg {Number} decimalPrecision A number of digits to show after the dot when rendering the value of the column.
     * When set to 0, the duration values containing decimals part (like "6.5 days") will be considered invalid.
     */
    decimalPrecision        : 2,

    /**
     * @cfg {String} decimalSeparator
     * The character that the {@link #number} function uses as a decimal point.
     *
     */
    decimalSeparator        : null,

    /**
     * @cfg {Boolean} useAbbreviation When set to `true`, the column will render the abbreviated duration unit name, not full. Abbreviation will also be used
     * when displaying the value. Useful if the column width is limited.
     */
    useAbbreviation         : false,

    fieldProperty           : 'effortVarianceField',


    initComponent : function () {
        this.initTaskFieldColumn();

        this.decimalSeparator = this.decimalSeparator || Ext.util.Format.decimalSeparator;

        this.callParent(arguments);
    },

    getValueToRender : function (value, meta, task) {

        if (!Ext.isNumber(value)) return '';

        var valueInt   = parseInt(value, 10),
            valueFixed = Ext.Number.toFixed(value, this.decimalPrecision),
            unit       = task.getEffortUnit();

        return String(valueInt == valueFixed ? valueInt : valueFixed).replace('.', this.decimalSeparator) + ' ' +
            Sch.util.Date[ this.useAbbreviation ? 'getShortNameOfUnit' : 'getReadableNameOfUnit' ](unit, value !== 1);

    }
});
