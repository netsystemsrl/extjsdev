/**
 @class Gnt.field.BaselineCost

 A specialized field for editing the baseline cost value.
 This class inherits from the {@link Gnt.field.Cost} field, which inherits from Ext.form.field.Number so any regular {@link Ext.form.field.Number} configs can be used (like `minValue/maxValue` etc).
 */
Ext.define('Gnt.field.BaselineCost', {
    extend             : 'Gnt.field.Cost',

    alias              : 'widget.baselinecostfield',
    alternateClassName : 'Gnt.widget.BaselineCostField',

    fieldProperty      : 'baselineCostField',
    setTaskValueMethod : 'setBaselineCost',
    getTaskValueMethod : 'getBaselineCost'
});
