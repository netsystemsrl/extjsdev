/**
 * A specialized field for editing the project scheduling direction (either from the project start or from the project end date).
 * This class inherits from the Ext.form.field.ComboBox field and any of its configuration options can be used.
 */
Ext.define('Gnt.field.ScheduleBackwards', {
    extend             : 'Ext.form.field.ComboBox',

    requires           : [
        'Ext.data.JsonStore',
        'Sch.patches.BoundList'
    ],

    mixins             : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],

    alias              : 'widget.schedulebackwardsfield',

    allowBlank         : false,
    forceSelection     : true,
    displayField       : 'text',
    valueField         : 'value',
    queryMode          : 'local',

    listConfig         : {
        htmlEncode : true
    },

    instantUpdate      : true,

    fieldProperty      : 'scheduleBackwardsField',
    setTaskValueMethod : 'setScheduleBackwards',
    getTaskValueMethod : 'getScheduleBackwards',

    constructor : function (config) {

        Ext.apply(this, config);

        this.store = new Ext.data.JsonStore({
            fields      : ['value', 'text'],
            autoDestroy : true,
            data        : [
                { value : 0, text : this.L('Project start date') },
                { value : 1, text : this.L('Project finish date') }
            ]
        });

        this.callParent(arguments);

        this.on('change', this.onFieldChange, this);
    },

    onSetTask : function () {
        this.setValue(this.task.getScheduleBackwards() ? 1 : 0);
    },

    valueToVisible : function (value) {
        return value ? this.L('Project finish date') : this.L('Project start date');
    },

    onFieldChange : function (field, value) {
        if (this.instantUpdate && !this.getSuppressTaskUpdate() && this.task) {
            if (this.task.getScheduleBackwards() != Boolean(this.value)) {
                // apply changes to task
                this.applyChanges();
            }
        }
    },

    getValue : function () {
        return this.value;
    }

});
