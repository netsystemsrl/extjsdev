/**
 @class Gnt.widget.taskeditor.AdvancedForm
 @extends Gnt.widget.taskeditor.TaskForm

 This form represents the `Advanced` tab of {@link Gnt.widget.taskeditor.TaskEditor the task editor widget}.
 By default it supports editing of the following fields:

 - calendar assigned to the task
 - scheduling mode for the task
 - manually scheduled flag
 - WBS code
 - rollup flag
 - constraint type
 - constraint date
 - read only flag

 * **Note:** However this standard set of fields can be easily overwritten (for more details check {@link #items}).

 ## Extending the default field set

 The default field set can be overwritten using the {@link #items} config.
 In case you want to keep the default fields and add some new custom fields, you can use the code below:

 // Extend the standard AdvancedForm class
 Ext.define('MyAdvancedForm', {
        extend : 'Gnt.widget.taskeditor.AdvancedForm',

        constructor : function(config) {
            this.callParent(arguments);

            // add some custom field
            this.add({
                fieldLabel  : 'Foo',
                name        : 'Name',
                width       : 200
            });
        }
    });

 // create customized form
 var form = new MyAdvancedForm({...});

 */
Ext.define('Gnt.widget.taskeditor.AdvancedForm', {

    extend : 'Gnt.widget.taskeditor.TaskForm',

    alias : 'widget.advanced_taskform',

    requires : [
        'Gnt.model.Task',
        'Ext.form.FieldSet',
        'Ext.form.FieldContainer',
        'Ext.form.field.Text',
        'Ext.form.field.Date',
        'Gnt.field.SchedulingMode',
        'Gnt.field.ManuallyScheduled',
        'Gnt.field.Calendar',
        'Gnt.field.ConstraintType',
        'Gnt.field.ConstraintDate',
        'Gnt.field.ReadOnly'
    ],

    mixins : ['Gnt.mixin.Localizable'],

    alternateClassName : ['Gnt.widget.AdvancedForm'],

    border : false,
    margin : 0,
    layout : {
        type    : 'table',
        columns : 2
    },

    defaults   : {
        width      : '97%'
    },

    /**
     * @hide
     * @cfg showGeneral
     */
    showGeneral  : false,
    /**
     * @hide
     * @cfg showBaseline
     */
    showBaseline : false,
    /**
     * @hide
     * @cfg editBaseline
     */
    editBaseline : false,

    /**
     * @cfg {Boolean} showCalendar `true` to show `Calendar` field.
     */
    showCalendar          : true,
    /**
     * @cfg {Boolean} showManuallyScheduled `true` to show `ManuallyScheduled` field.
     */
    showManuallyScheduled : true,
    /**
     * @cfg {Boolean} showSchedulingMode `true` to show `Scheduling Mode` field.
     */
    showSchedulingMode    : true,
    /**
     * @cfg {Boolean} showWbsCode `true` to show `WBS code` field.
     */
    showWbsCode           : true,
    /**
     * @cfg {Boolean} showRollup `true` to show `Rollup` field.
     */
    showRollup            : false,
    /**
     * @cfg {Boolean} showConstraint `true` to show `Constraint Type`, `Constraint Date` fields.
     */
    showConstraint        : true,

    /**
     * @cfg {Boolean} showReadOnly `true` to show `ReadOnly field`.
     */
    showReadOnly : false,

    /**
     * @cfg {Object} l10n
     *    A object, purposed for the class localization. Contains the following keys/values:
     *
     * @cfg {String} l10n.calendarText            'Calendar'
     * @cfg {String} l10n.manuallyScheduled       'Manually Scheduled'
     * @cfg {String} l10n.schedulingModeText      'Scheduling Mode'
     * @cfg {String} l10n.wbsCodeText             'WBS code'
     * @cfg {String} l10n."Constraint Type"       'Constraint Type'
     * @cfg {String} l10n."Constraint Date"       'Constraint Date'
     * @cfg {String} l10n.readOnlyText            'ReadOnly'
     */

    /**
     * @cfg {Object} calendarConfig A config object to be applied to the `Calendar` field.
     */
    calendarConfig : null,

    /**
     * @cfg {Object} manuallyScheduledConfig A config object to be applied to the `Manually Scheduled` field.
     */
    manuallyScheduledConfig : null,

    /**
     * @cfg {Object} schedulingModeConfig A config object to be applied to the `Scheduling Mode` field.
     */
    schedulingModeConfig : null,
    /**
     * @cfg {Object} wbsCodeConfig A config object to be applied to the `WBS code` field.
     */
    wbsCodeConfig        : null,
    /**
     * @cfg {Object} rollupConfig A config object to be applied to the `Rollup` field.
     */
    rollupConfig         : null,
    /**
     * @cfg {Object} constraintTypeConfig A config object to be applied to the `Constraint Type` field.
     */
    constraintTypeConfig : null,
    /**
     * @cfg {Object} constraintDateConfig A config object to be appied to the `Constraint Date` field.
     */
    constraintDateConfig : null,

    /*
     * @cfg {Object} readOnlyConfig A config object to be applied to the `ReadOnly` field.
     */
    readOnlyConfig : null,

    constructor : function (config) {

        this.callParent(arguments);

        this.addBodyCls('gnt-taskeditor-advancedtaskform');
    },

    // Builds default set of form fields.
    buildFields : function () {
        var me = this,
            f  = me.customizableFieldNames;

        me.items = me.items || [];

        if (me.showCalendar) {
        me.items.push(
            me.initFieldDefinition({
                xtype      : 'calendarfield',
                fieldLabel : this.L('calendarText'),
                name       : f.calendarIdField,
                value      : me.getTaskFieldValue(f.calendarIdField)
            }, me.calendarConfig));
        }

        if (me.showManuallyScheduled) {
            me.items.push(me.initFieldDefinition({
                xtype      : 'manuallyscheduledfield',
                fieldLabel : me.L('manuallyScheduledText'),
                name       : f.manuallyScheduledField,
                value      : me.getTaskFieldValue(f.manuallyScheduledField)
            }, me.manuallyScheduledConfig));
        }

        if (me.showSchedulingMode) {
            me.items.push(me.initFieldDefinition({
                xtype      : 'schedulingmodefield',
                fieldLabel : me.L('schedulingModeText'),
                name       : f.schedulingModeField,
                value      : me.getTaskFieldValue(f.schedulingModeField),
                allowBlank : false
            }, me.schedulingModeConfig));
        }

        if (me.showWbsCode) {
            me.wbsField = Ext.create(me.initFieldDefinition({
                xtype         : 'textfield',
                fieldLabel    : me.L('wbsCodeText'),
                name          : 'wbsCode',
                forceReadOnly : true,
                readOnly      : true,
                value         : me.task && me.task.getWBSCode()
            }, me.wbsCodeConfig));

            me.items.push(me.wbsField);
        }

        if (me.showRollup) {
            this.items.push(me.initFieldDefinition({
                xtype          : 'checkboxfield',
                fieldLabel     : this.L('rollupText'),
                name           : f.rollupField,
                // TO fix Ext JS 6.0.2 bug
                // https://www.sencha.com/forum/showthread.php?310395
                uncheckedValue : false,
                value          : me.getTaskFieldValue(f.rollupField)
            }, me.rollupConfig));
        }

        if (me.showReadOnly) {
            this.items.push(me.initFieldDefinition({
                xtype      : 'readonlyfield',
                fieldLabel : me.L('readOnlyText'),
                name       : f.readOnlyField,
                value      : me.getTaskFieldValue(f.readOnlyField)
            }, me.readOnlyConfig));
        }

        if (me.showConstraint) {
            me.items.push(
            me.initFieldDefinition({
                xtype      : 'constrainttypefield',
                fieldLabel : me.L("Constraint Type"),
                name       : f.constraintTypeField,
                value      : me.getTaskFieldValue(f.constraintTypeField)
            }, me.constraintTypeConfig),

            me.initFieldDefinition({
                xtype      : 'constraintdatefield',
                fieldLabel : me.L("Constraint Date"),
                name       : f.constraintDateField,
                value      : me.getTaskFieldValue(f.constraintDateField)
            }, me.constraintDateConfig)
            );
        }
    },

    loadRecord : function (task) {
        var result = this.callParent(arguments);

        if (this.wbsField) {
            this.wbsField.setValue(task.getWBSCode());
        }

        return result;
    }
});
