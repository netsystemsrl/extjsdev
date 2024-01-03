/**
 @class Gnt.field.ActualCost

 A specialized field, for showing the actual cost value.
 This class inherits from the {@link Gnt.field.Cost} field, which inherits from `Ext.form.field.Number` so any regular {@link Ext.form.field.Number} configs can be used (like `minValue/maxValue` etc).
 */
Ext.define('Gnt.field.ActualCost', {
    extend             : 'Gnt.field.Cost',

    alias              : 'widget.actualcostfield',
    alternateClassName : 'Gnt.widget.ActualCostField',

    fieldProperty      : 'actualCostField',
    setTaskValueMethod : 'setActualCost',
    getTaskValueMethod : 'getActualCost'
});
