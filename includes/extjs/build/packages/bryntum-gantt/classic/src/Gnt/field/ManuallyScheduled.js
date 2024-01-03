/**
 * A specialized field, allowing a user to also specify task manually scheduled value.
 * This class inherits from the standard Ext JS "checkbox" field, so any usual `Ext.form.field.Checkbox` configs can be used.
 */
Ext.define('Gnt.field.ManuallyScheduled', {
    extend             : 'Ext.form.field.Checkbox',

    mixins             : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],

    alias              : 'widget.manuallyscheduledfield',

    alternateClassName : ['Gnt.widget.ManuallyScheduledField'],

    fieldProperty      : 'manuallyScheduledField',
    setTaskValueMethod : 'setManuallyScheduled',
    getTaskValueMethod : 'getManuallyScheduled',

    instantUpdate      : true,

    valueToVisible : function (value) {
        return value ? this.L('yes') : this.L('no');
    },

    getValue : function () {
        return this.value;
    },

    initEvents : function() {
        var me = this;

        me.on('change', me.onFieldValueChange, me);

        return me.callParent();
    },

    onFieldValueChange : function (me, newValue, oldValue) {
        if (me.instantUpdate && !me.getSuppressTaskUpdate() && me.task) {
            // apply changes to task
            me.applyChanges();
        }
    }

});
