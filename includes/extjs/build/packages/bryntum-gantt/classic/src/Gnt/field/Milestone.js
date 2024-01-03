/**
 * A specialized field allowing a user to convert regular task to milestone and back.
 */
Ext.define('Gnt.field.Milestone', {
    extend         : 'Ext.form.field.ComboBox',
    requires       : [
        'Ext.data.JsonStore',
        'Sch.patches.BoundList'
    ],

    mixins         : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],

    alias          : 'widget.milestonefield',

    instantUpdate  : false,
    allowBlank     : false,
    forceSelection : true,
    displayField   : 'text',
    valueField     : 'value',
    queryMode      : 'local',

    listConfig     : {
        htmlEncode : true
    },

    constructor : function (config) {

        Ext.apply(this, config);

        this.store = new Ext.data.JsonStore({
            fields      : ['value', 'text'],
            autoDestroy : true,
            data        : [
                { value : 0, text : this.L('no') },
                { value : 1, text : this.L('yes') }
            ]
        });

        this.callParent(arguments);

        this.on('change', this.onFieldChange, this);
    },

    onSetTask : function () {
        this.setValue(this.task.isMilestone() ? 1 : 0);
    },

    valueToVisible : function (value) {
        return value ? this.L('yes') : this.L('no');
    },

    onFieldChange : function (field, value) {

        if (this.instantUpdate && !this.getSuppressTaskUpdate() && this.task) {

            if (this.task.isMilestone() != Boolean(this.value)) {
                // apply changes to task
                this.applyChanges();
            }
        }
    },

    getValue : function () {
        return this.value;
    },

    applyChanges : function (task) {
        task = task || this.task;

        if (this.getValue()) {
            task.convertToMilestone();
        } else {
            task.convertToRegular();
        }

        // since we have an "applyChanges" method different from the one provided by "TaskField" mixin
        // we need to fire "taskupdated" ourself
        task.fireEvent('taskupdated', task, this);
    }
});
