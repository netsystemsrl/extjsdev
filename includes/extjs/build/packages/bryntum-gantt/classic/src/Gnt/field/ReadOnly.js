/**
 * A specialized field allowing a user to switch a task to readonly mode.
 */
Ext.define('Gnt.field.ReadOnly', {
    extend                  : 'Ext.form.field.Checkbox',
    mixins                  : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],
    alias                   : 'widget.readonlyfield',
    alternateClassName      : ['Gnt.widget.ReadOnlyField'],

    fieldProperty           : 'readOnlyField',
    setTaskValueMethod      : 'setReadOnly',
    getTaskValueMethod      : 'getReadOnly',
    instantUpdate           : true,

    initEvents : function() {
        var me = this;

        me.on('change', me.onFieldValueChange, me);

        return me.callParent();
    },

    valueToVisible : function (value) {
        return value ? this.L('yes') : this.L('no');
    },

    onFieldValueChange : function (me, newValue, oldValue) {
        if (me.instantUpdate && !me.getSuppressTaskUpdate() && me.task) {
            // apply changes to task
            me.applyChanges();
        }
    }
});
