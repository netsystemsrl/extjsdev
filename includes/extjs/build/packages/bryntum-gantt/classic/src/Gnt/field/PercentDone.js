/**
 * A specialized field for editing the task percent complete value.
 * This class inherits from the standard Ext JS "number" field, so any usual `Ext.form.field.Number` configs can be used.
 */
Ext.define('Gnt.field.PercentDone', {
    extend             : 'Gnt.field.Percent',

    alias              : 'widget.percentdonefield',

    mixins             : ['Gnt.field.mixin.TaskField'],

    alternateClassName : 'Gnt.widget.PercentDoneField',

    fieldProperty      : 'percentDoneField',
    setTaskValueMethod : 'setPercentDone',
    getTaskValueMethod : 'getPercentDone',
    instantUpdate      : true,

    setValue : function (value) {
        this.callParent([ value ]);

        if (this.instantUpdate && !this.getSuppressTaskUpdate() && this.task) {
            // apply changes to task
            this.applyChanges();
        }
    }
});
