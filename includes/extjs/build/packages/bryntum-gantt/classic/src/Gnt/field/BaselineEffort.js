/**
 @class Gnt.field.BaselineEffort
 A specialized field, allowing a user to also specify a duration unit when editing the baseline effort value.
 This class inherits from the {@link Gnt.field.Effort} field, which inherits from `Ext.form.field.Number` so any regular {@link Ext.form.field.Number} configs can be used (like `minValue/maxValue` etc).
 */
Ext.define('Gnt.field.BaselineEffort', {
    extend             : 'Gnt.field.Effort',

    alias              : 'widget.baselineeffortfield',
    alternateClassName : 'Gnt.widget.BaselineEffortField',

    fieldProperty      : 'baselineEffortField',
    setTaskValueMethod : 'setBaselineEffort',
    getTaskValueMethod : 'getBaselineEffort'
});
