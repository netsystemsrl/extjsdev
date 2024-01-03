/**
 * A specialized field, allowing a user to specify task constraint date.
 * This class inherits from the standard Ext JS "date" field, so any usual `Ext.form.field.Date` configs can be used.
 */
Ext.define('Gnt.field.ConstraintDate', {

    extend              : 'Gnt.field.Date',
    alias               : 'widget.constraintdatefield',

    // This is required to properly handle the field's read only state as designated in task's isEditable() method
    fieldProperty       : 'constraintDateField',
    getTaskValueMethod  : 'getConstraintDate',
    setTaskValueMethod  : 'setConstraintDate',

    reAssertValue       : false,

    constructor : function (config) {
        config = config || {};

        this.format = config.format || this.L('format');

        return this.callParent(arguments);
    },

    valueToVisible : function (value, task) {
        var me     = this,
            format = me.format || Ext.Date.defaultFormat;

        task = task || me.task;

        var constraintClass = task && task.getConstraintClass();

        if (constraintClass) {
            value = constraintClass.getDisplayableConstraintDateForFormat(value, format, task);
        }

        return value;
    },

    visibleToValue : function (value) {
        var me              = this,
            format          = me.format || Ext.Date.defaultFormat,
            task            = me.task,
            constraintClass = task && task.getConstraintClass();

        if (constraintClass && !Ext.isEmpty(value)) {
            value = constraintClass.adjustConstraintDateFromDisplayableWithFormat(value, format, task);
        }

        return value;
    }
});
