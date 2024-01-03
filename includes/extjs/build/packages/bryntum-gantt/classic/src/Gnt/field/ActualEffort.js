/**
 @class Gnt.field.ActualEffort
 A specialized field, allowing a user to also specify a duration unit when editing the actual effort value.
 This class inherits from the {@link Gnt.field.Effort} field, which inherits from `Ext.form.field.Number` so any regular {@link Ext.form.field.Number} configs can be used (like `minValue/maxValue` etc).
 */
Ext.define('Gnt.field.ActualEffort', {
    extend             : 'Gnt.field.Effort',

    alias              : 'widget.actualeffortfield',
    alternateClassName : 'Gnt.widget.ActualEffortField',

    fieldProperty      : 'actualEffortField',
    setTaskValueMethod : 'setActualEffort',
    getTaskValueMethod : 'getActualEffort'
});
