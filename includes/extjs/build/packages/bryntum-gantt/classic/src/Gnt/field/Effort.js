/**
@class Gnt.field.Effort
@extends Gnt.field.Duration

A specialized field, allowing a user to also specify a duration unit when editing the effort value.
This class inherits from the {@link Gnt.field.Duration} field, which inherits from `Ext.form.field.Number` so any regular {@link Ext.form.field.Number} configs can be used (like `minValue/maxValue` etc).

*/
Ext.define('Gnt.field.Effort', {
    extend                  : 'Gnt.field.Duration',

    alias                   : 'widget.effortfield',
    alternateClassName      : 'Gnt.widget.EffortField',

    fieldProperty           : 'effortField',
    getDurationUnitMethod   : 'getEffortUnit',
    setTaskValueMethod      : 'setEffort',
    getTaskValueMethod      : 'getEffort',

    applyChanges : function (toTask) {
        toTask = toTask || this.task;

        this.setTaskValue(toTask, this.getValue() || null, this.durationUnit);

        // since we have an "applyChanges" method different from the one provided by "TaskField" mixin
        // we need to fire "taskupdated" ourself
        toTask.fireEvent('taskupdated', toTask, this);
    }
});
