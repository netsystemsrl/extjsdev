/**
 @class Gnt.widget.taskeditor.ProjectForm
 @extends Gnt.widget.taskeditor.BaseForm

 This form is used to edit the project properties.
 By default it supports editing of the following fields:

 - the name of the project (project title)
 - the start date of the project
 - the end date of the project
 - the calendar assigned to the project
 - the dependency status, whether the project allows external tasks dependencies

 * **Note:** However this standard set of fields can be easily overwritten (for more details check {@link #items}).

 ## Extending the default field set

 The default field set can be overwritten using the {@link #items} config.
 In case you want to keep the default fields and add some new custom fields, you can use the code below:

            // Extend the standard ProjectForm class
            Ext.define('MyProjectForm', {
                    extend : 'Gnt.widget.taskeditor.ProjectForm',

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
            var form = new MyProjectForm({...});

 */
Ext.define('Gnt.widget.taskeditor.ProjectForm', {
    // This form by default contains various "standard" fields of the project
    // and it "knows" about their "applyChanges" methods (for our fields),
    // and about renamed field names
    // This form can be also used with any other set of fields, provided
    // as the "items" config

    extend                  : 'Gnt.widget.taskeditor.BaseForm',

    alias                   : 'widget.projectform',

    requires                : [
        'Gnt.model.Project',
        'Ext.Date',
        'Ext.form.FieldSet',
        'Ext.form.FieldContainer',
        'Ext.form.field.Text',
        'Gnt.field.Calendar',
        'Gnt.field.StartDate',
        'Gnt.field.EndDate',
        'Gnt.field.ReadOnly',
        'Gnt.field.ScheduleBackwards',
        'Ext.form.field.Checkbox'
    ],

    alternateClassName      : ['Gnt.widget.ProjectForm'],

    /**
     * @cfg {Object/Object[]} items A single item, or an array of child Components to be added to this container.
     *
     * **Note:** By default this form provide pre-configured set of fields. Using this option will overwrite that field set.
     */

    /**
     * @cfg {Boolean} showCalendar Provide `true` to display `Calendar` field.
     */
    showCalendar            : false,

    /**
     * @cfg {Object} l10n
     * An object, purposed for the class localization. Contains the following keys/values:
     *
     * - nameText                : 'Name',
     * - startText               : 'Start',
     * - finishText              : 'Finish',
     * - calendarText            : 'Calendar',
     * - readOnlyText            : 'Read Only',
     * - allowDependenciesText   : 'Allow cross-project dependencies',
     * - 'Schedule from'         : 'Schedule from'
     */

    /**
     * @cfg {Object} nameConfig A config object to be applied to the `Name` field.
     */
    nameConfig              : null,

    /*
     * @cfg {Object} readOnlyConfig A config object to be applied to the `ReadOnly` field.
     */
    readOnlyConfig          : null,

    /**
     * @cfg {Object} allowDependenciesConfig A config object to be applied to the `AllowDependencies` field.
     */
    allowDependenciesConfig : null,

    /**
     * @cfg {Object} startConfig A config object to be applied to the `Start` field.
     */
    startConfig             : null,

    /**
     * @cfg {Object} finishConfig A config object to be applied to the `Finish` field.
     */
    finishConfig            : null,

    /**
     * @cfg {Object} calendarConfig A config object to be applied to the `Calendar` field.
     */
    calendarConfig          : null,

    /**
     * @cfg {Object} schedulebackwardsConfig A config object to be applied to the `Schedule from` field.
     */
    schedulebackwardsConfig : null,

    defaults                : {
        anchor     : '100%',
        labelWidth : 110
    },

    constructor : function(config) {
        config      = config || {};

        // setup mixin that tracks "*Field" model properties and is responsible for fields renaming
        this.setupCustomizableRecordForm(this, Gnt.model.Project);

        this.callParent(arguments);

        this.addBodyCls('gnt-projecteditor-projectform');
    },

    // Builds default set of form fields.
    buildFields : function () {
        var me      = this,
            f       = me.customizableFieldNames;

        me.items    = me.items || [];

        me.items.push(
            me.initFieldDefinition({
                xtype      : 'textfield',
                fieldLabel : me.L('nameText'),
                name       : f.nameField,
                allowBlank : false,
                value      : me.getTaskFieldValue(f.nameField)
            }, me.nameConfig),

            {
                xtype      : 'container',
                layout     : 'hbox',
                defaults   : {
                    flex       : 1,
                    labelWidth : 110,
                    margin     : '5 5 5 0'
                },
                items               : [
                    me.initFieldDefinition({
                        allowBlank : false,
                        xtype      : 'startdatefield',
                        fieldLabel : me.L('startText'),
                        format     : Ext.Date.defaultFormat,
                        name       : f.startDateField,
                        value      : me.getTaskFieldValue(f.startDateField)
                    }, me.startConfig),

                    me.initFieldDefinition({
                        allowBlank : false,
                        margin     : '5 0',
                        xtype      : 'enddatefield',
                        format     : Ext.Date.defaultFormat,
                        fieldLabel : me.L('finishText'),
                        name       : f.endDateField,
                        value      : me.getTaskFieldValue(f.endDateField)
                    }, me.finishConfig)
                ]
            },

            me.initFieldDefinition({
                xtype      : 'schedulebackwardsfield',
                fieldLabel : me.L('Schedule from'),
                name       : f.scheduleBackwardsField
            }, me.schedulebackwardsConfig),

            {
                xtype      : 'container',
                layout     : 'hbox',
                padding    : '0 0 0 110',
                defaults   : {
                    flex   : 1,
                    margin : '5 5 5 0'
                },
                items      : [
                    me.initFieldDefinition({
                        xtype      : 'readonlyfield',
                        boxLabel   : me.L('readOnlyText'),
                        allowBlank : false,
                        name       : f.readOnlyField,
                        value      : me.getTaskFieldValue(f.readOnlyField)
                    }, me.readOnlyConfig),

                    me.initFieldDefinition({
                        xtype      : 'checkboxfield',
                        boxLabel   : me.L('allowDependenciesText'),
                        allowBlank : false,
                        name       : f.allowDependenciesField,
                        value      : me.getTaskFieldValue(f.allowDependenciesField)
                    }, me.allowDependenciesConfig)
                ]
            }
        );

        if (me.showCalendar) {
            me.items.push(
                me.initFieldDefinition({
                    xtype      : 'calendarfield',
                    fieldLabel : this.L('calendarText'),
                    flex       : 1,
                    margin     : '5 0 5 0',
                    name       : f.calendarIdField,
                    value      : me.getTaskFieldValue(f.calendarIdField)
                }, me.calendarConfig)
            );
        }
    }

});
