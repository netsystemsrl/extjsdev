/**
 * A special form panel used to edit {@link Sch.model.Recurrence recurrence model} data.
 * The form is used by {@link Sch.widget.recurrence.Dialog} which includes it.
 *
 * The form dynamically changes its set of visible fields depending on {@link #frequencyField frequency} chosen.
 *
 * It inherits from {@link Ext.form.Panel} so you can define any fields and use any layout you want.
 */
Ext.define('Sch.widget.recurrence.Form', {

    extend : 'Ext.form.Panel',

    requires : [
        'Ext.layout.container.HBox',
        'Ext.layout.container.VBox',
        'Ext.form.field.Display',
        'Ext.form.field.Number',
        'Ext.form.field.Radio',
        'Sch.model.Recurrence',
        'Sch.widget.recurrence.field.FrequencyComboBox',
        'Sch.widget.recurrence.field.PositionsComboBox',
        'Sch.widget.recurrence.field.DaysComboBox',
        'Sch.widget.recurrence.field.DaysSegmentedButton',
        'Sch.widget.recurrence.field.MonthDaysSegmentedButton',
        'Sch.widget.recurrence.field.MonthsSegmentedButton',
        'Sch.widget.recurrence.field.StopConditionComboBox'
    ],

    mixins : [
        'Sch.widget.mixin.CustomizableRecordForm',
        'Sch.mixin.Localizable'
    ],

    alias : 'widget.recurrenceform',

    layout : {
        type  : 'vbox',
        align : 'stretch'
    },

    trackResetOnLoad  : true,
    updateAllFields   : true,
    weekStartDay      : 1,
    dateFormat        : 'Y-m-d',
    radioFieldName    : 'radio',
    checkboxFieldName : 'checkbox',
    recurrenceModel   : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - 'Frequency'           : 'Frequency',
     * - 'Every'               : 'Every',
     * - 'DAILYintervalUnit'   : 'day(s)',
     * - 'WEEKLYintervalUnit'  : 'week(s) on:',
     * - 'MONTHLYintervalUnit' : 'month(s)',
     * - 'YEARLYintervalUnit'  : 'year(s) in:',
     * - 'Each'                : 'Each',
     * - 'On the'              : 'On the',
     * - 'End repeat'          : 'End repeat',
     * - 'time(s)'             : 'time(s)'
     */

    /**
     * Configuration for {@link #property-frequencyField}.
     * @cfg {Object/Sch.widget.recurrence.field.FrequencyComboBox} frequencyField
     */
    /**
     * A combobox field allowing to pick the {@link Sch.model.Recurrence#Frequency recurrence frequency}.
     * @property {Sch.widget.recurrence.field.FrequencyComboBox}
     */
    frequencyField              : null,
    /**
     * Configuration for {@link #property-intervalField}.
     * @cfg {Object/Ext.form.field.Number} intervalField
     */
    /**
     * Number field allowing to edit the {@link Sch.model.Recurrence#Interval recurrence interval}.
     * @property {Ext.form.field.Number}
     */
    intervalField               : null,
    intervalUnit                : null,
    /**
     * Configuration for {@link #property-daysButtonField}.
     * @cfg {Object/Sch.widget.recurrence.field.DaysSegmentedButton} daysButtonField
     */
    /**
     * Segmented button field allowing to edit the {@link Sch.model.Recurrence#Days recurrence days}.
     * @property {Sch.widget.recurrence.field.DaysSegmentedButton}
     */
    daysButtonField             : null,
    /**
     * Configuration for {@link #property-monthdaysButtonField}.
     * @cfg {Object/Sch.widget.recurrence.field.MonthDaysSegmentedButton} monthdaysButtonField
     */
    /**
     * Segmented button field allowing to edit the {@link Sch.model.Recurrence#MonthDays recurrence month days}.
     * @property {Sch.widget.recurrence.field.MonthDaysSegmentedButton}
     */
    monthdaysButtonField        : null,
    monthDaysRadioField         : null,
    /**
     * Configuration for {@link #property-monthsButtonField}.
     * @cfg {Object/Sch.widget.recurrence.field.MonthsSegmentedButton} monthsButtonField
     */
    /**
     * Segmented button field allowing to edit the {@link Sch.model.Recurrence#MonthDays recurrence months}.
     * @property {Sch.widget.recurrence.field.MonthsSegmentedButton}
     */
    monthsButtonField           : null,
    positionAndDayRadioField    : null,
    positionAndDayCheckboxField : null,
    stopRecurrenceField         : null,
    /**
     * Configuration for {@link #property-countField}.
     * @cfg {Object/Ext.form.field.Number} countField
     */
    /**
     * Number field allowing to edit the {@link Sch.model.Recurrence#Count recurrence count}.
     * @property {Ext.form.field.Number}
     */
    countField                  : null,
    countUnit                   : null,
    /**
     * Configuration for {@link #property-endDateField}.
     * @cfg {Object/Ext.form.field.Date} endDateField
     */
    /**
     * Date field allowing to edit the {@link Sch.model.Recurrence#EndDate recurrence end date}.
     * @property {Ext.form.field.Date}
     */
    endDateField                : null,
    /**
     * Configuration for {@link #property-positionsCombo}.
     * @cfg {Object/Sch.widget.recurrence.field.PositionsComboBox} positionsCombo
     */
    /**
     * Combobox field allowing to edit the {@link Sch.model.Recurrence#Positions recurrence positions field}.
     * The field is displayed for "Monthly" and "Yearly" frequency values.
     * @property {Sch.widget.recurrence.field.PositionsComboBox}
     */
    positionsCombo              : null,
    /**
     * Configuration for {@link #property-daysCombo}.
     * @cfg {Object/Sch.widget.recurrence.field.DaysComboBox} daysCombo
     */
    /**
     * Combobox field allowing to edit the {@link Sch.model.Recurrence#Days recurrence days}.
     * The field is displayed for "Monthly" and "Yearly" frequency values.
     * @property {Sch.widget.recurrence.field.DaysComboBox}
     */
    daysCombo                   : null,
    intervalContainer           : null,
    positionDayContainer        : null,
    countFieldContainer         : null,

    initComponent : function () {
        var me = this;

        me.recurrenceModel = me.recurrenceModel || Sch.model.Recurrence;

        me.setupCustomizableRecordForm(me, me.recurrenceModel);

        me.items = me.buildItems();

        me.callParent(arguments);
    },

    buildItems : function () {
        var me = this;

        if (!me.frequencyField || !me.frequencyField.isInstance) {
            me.frequencyField = Ext.create(Ext.apply({
                xtype      : 'frequencycombo',
                name       : me.customizableFieldNames.frequencyField,
                fieldLabel : me.L('Frequency')
            }, me.frequencyField));

            me.mon(me.frequencyField, 'change', me.onFrequencyFieldChange, me);
        }

        if (!me.intervalField || !me.intervalField.isInstance) {
            me.intervalField = Ext.create(Ext.apply({
                xtype      : 'numberfield',
                name       : me.customizableFieldNames.intervalField,
                minValue   : 1,
                width      : 85,
                margin     : '0 5 0 0',
                allowBlank : false
            }, me.intervalField));
        }

        if (!me.intervalUnit || !me.intervalUnit.isInstance) {
            me.intervalUnit = Ext.create(Ext.apply({
                xtype       : 'displayfield',
                submitValue : false
            }, me.intervalUnit));
        }

        if (!me.daysButtonField || !me.daysButtonField.isInstance) {
            me.daysButtonField = Ext.create(Ext.apply({
                xtype        : 'dayssegmentedbutton',
                name         : me.customizableFieldNames.daysField,
                forFrequency : 'WEEKLY'
            }, me.daysButtonField));
        }

        // the radio button enabling "monthdaysButtonField" in MONTHLY mode
        if (!me.monthDaysRadioField || !me.monthDaysRadioField.isInstance) {
            me.monthDaysRadioField = Ext.create(Ext.apply({
                xtype        : 'radiofield',
                name         : me.radioFieldName,
                submitValue  : false,
                forFrequency : 'MONTHLY',
                boxLabel     : this.L('Each'),
                handler      : me.togglePositionAndDayFields,
                scope        : me
            }, me.monthDaysRadioField));
        }

        if (!me.monthdaysButtonField || !me.monthdaysButtonField.isInstance) {
            me.monthdaysButtonField = Ext.create(Ext.apply({
                xtype        : 'monthdayssegmentedbutton',
                name         : me.customizableFieldNames.monthDaysField,
                forFrequency : 'MONTHLY'
            }, me.monthdaysButtonField));
        }

        if (!me.monthsButtonField || !me.monthsButtonField.isInstance) {
            me.monthsButtonField = Ext.create(Ext.apply({
                xtype        : 'monthssegmentedbutton',
                name         : me.customizableFieldNames.monthsField,
                forFrequency : 'YEARLY'
            }, me.monthsButtonField));
        }

        // the radio button enabling positions & days combos in MONTLY mode
        if (!me.positionAndDayRadioField || !me.positionAndDayRadioField.isInstance) {
            me.positionAndDayRadioField = Ext.create(Ext.apply({
                xtype        : 'radiofield',
                name         : me.radioFieldName,
                submitValue  : false,
                forFrequency : 'MONTHLY',
                boxLabel     : this.L('On the'),
                handler      : me.togglePositionAndDayFields,
                scope        : me
            }, me.positionAndDayRadioField));
        }

        // the checkbox enabling positions & days combos in YEARLY mode
        if (!me.positionAndDayCheckboxField || !me.positionAndDayCheckboxField.isInstance) {
            me.positionAndDayCheckboxField = Ext.create(Ext.apply({
                xtype        : 'checkbox',
                // Checkboxes and Radio buttons have their initDefaultName functions overridden to Ext.emptyFn,
                // so `name` is required here, otherwise field.getModelData() returns {undefined : true}
                name         : me.checkboxFieldName,
                submitValue  : false,
                forFrequency : 'YEARLY',
                boxLabel     : this.L('On the'),
                handler      : me.togglePositionAndDayFields,
                scope        : me
            }, me.positionAndDayCheckboxField));
        }

        if (!me.stopRecurrenceField || !me.stopRecurrenceField.isInstance) {
            me.stopRecurrenceField = Ext.create(Ext.apply({
                xtype       : 'stopconditioncombo',
                submitValue : false,
                fieldLabel  : me.L('End repeat'),
                value       : [null]
            }, me.stopRecurrenceField));

            me.mon(me.stopRecurrenceField, 'change', me.onStopRecurrenceFieldChange, me);
        }

        if (!me.countField || !me.countField.isInstance) {
            me.countField = Ext.create(Ext.apply({
                xtype      : 'numberfield',
                name       : me.customizableFieldNames.countField,
                minValue   : 2,
                allowBlank : false,
                flex       : 1,
                margin     : '0 5 0 0',
                disabled   : true
            }, me.countField));
        }

        if (!me.countUnit || !me.countUnit.isInstance) {
            me.countUnit = Ext.create(Ext.apply({
                xtype       : 'displayfield',
                value       : me.L('time(s)'),
                submitValue : false,
                flex        : 1,
                disabled    : true
            }, me.countUnit));
        }

        if (!me.countFieldContainer || !me.countFieldContainer.isInstance) {
            me.countFieldContainer = Ext.create(Ext.apply({
                xtype          : 'fieldcontainer',
                layout         : 'hbox',
                margin         : 0,
                hideEmptyLabel : false,
                hidden         : true,
                items          : [
                    me.countField,
                    me.countUnit
                ]
            }, me.countFieldContainer));
        }

        if (!me.endDateField || !me.endDateField.isInstance) {
            me.endDateField = Ext.create(Ext.apply({
                xtype          : 'datefield',
                name           : me.customizableFieldNames.endDateField,
                hidden         : true,
                disabled       : true,
                hideEmptyLabel : false,
                allowBlank     : false,
                startDay       : me.weekStartDay,
                format         : me.dateFormat,
                altFormats     : ''
            }, me.endDateField));
        }

        if (!me.intervalContainer || !me.intervalContainer.isInstance) {
            me.intervalContainer = Ext.create(Ext.apply({
                xtype      : 'fieldcontainer',
                layout     : 'hbox',
                fieldLabel : me.L('Every'),
                margin     : 0,
                items      : [
                    me.intervalField,
                    me.intervalUnit
                ]
            }, me.intervalContainer));
        }

        if (!me.positionsCombo || !me.positionsCombo.isInstance) {
            me.positionsCombo = Ext.create(Ext.apply({
                xtype        : 'positionscombobox',
                name         : me.customizableFieldNames.positionsField,
                forFrequency : 'MONTHLY|YEARLY',
                flex         : 1,
                margin       : '0 5 0 0'
            }, me.positionsCombo));
        }

        if (!me.daysCombo || !me.daysCombo.isInstance) {
            me.daysCombo = Ext.create(Ext.apply({
                xtype        : 'dayscombo',
                // Need to set value manually since `name` should be unique within one form
                name         : me.customizableFieldNames.daysField,
                forFrequency : 'MONTHLY|YEARLY',
                weekStartDay : me.weekStartDay,
                flex         : 1
            }, me.daysCombo));
        }

        if (!me.positionDayContainer || !me.positionDayContainer.isInstance) {
            me.positionDayContainer = Ext.create(Ext.apply({
                xtype  : 'fieldcontainer',
                layout : 'hbox',
                items  : [
                    me.positionsCombo,
                    me.daysCombo
                ]
            }, me.positionDayContainer));
        }

        return [
            me.frequencyField,
            me.intervalContainer,
            me.daysButtonField,
            me.monthDaysRadioField,
            me.monthdaysButtonField,
            me.monthsButtonField,
            me.positionAndDayRadioField,
            me.positionAndDayCheckboxField,
            me.positionDayContainer,
            me.stopRecurrenceField,
            me.countFieldContainer,
            me.endDateField
        ];
    },

    loadRecord : function (record) {
        var me        = this,
            result    = this.callParent(arguments),
            event     = record.getEvent(),
            startDate = event && event.getStartDate();

        // Set value manually since `name` is not unique within the form
        me.daysCombo.setValue(record.getDays());

        if (startDate) {
            if (!record.getDays() || !record.getDays().length) {
                this.daysButtonField.setValue([Sch.data.util.recurrence.DayRuleEncoder.encodeDay(startDate.getDay())]);
            }

            if (!record.getMonthDays() || !record.getMonthDays().length) {
                this.monthdaysButtonField.setValue(startDate.getDate());
            }

            if (!record.getMonths() || !record.getMonths().length) {
                this.monthsButtonField.setValue(startDate.getMonth() + 1);
            }
        }

        var isDayAndPosition = Boolean(record.getDays() && record.getPositions());

        me.monthDaysRadioField.setValue(!isDayAndPosition);
        me.positionAndDayRadioField.setValue(isDayAndPosition);
        me.positionAndDayCheckboxField.setValue(isDayAndPosition);

        me.stopRecurrenceField.setRecurrence(record);

        return result;
    },

    toggleStopFields : function () {
        var me = this;

        switch (me.stopRecurrenceField.getValue()) {

            case 'count' :
                me.countFieldContainer.show();
                me.countField.enable();
                me.countUnit.enable();
                me.endDateField.hide();
                me.endDateField.disable();
                break;

            case 'date' :
                me.countFieldContainer.hide();
                me.countField.disable();
                me.countUnit.disable();
                me.endDateField.show();
                me.endDateField.enable();
                break;

            default :
                me.countFieldContainer.hide();
                me.endDateField.hide();
                me.countField.disable();
                me.countUnit.disable();
                me.endDateField.disable();
        }
    },

    togglePositionAndDayFields : function () {
        var me                     = this,
            frequency              = me.frequencyField.getValue(),
            positionAndDayDisabled = frequency == 'MONTHLY' ? !me.positionAndDayRadioField.getValue() : !me.positionAndDayCheckboxField.getValue();

        // toggle day & positions comboboxes
        me.daysCombo.setDisabled(positionAndDayDisabled);
        me.positionsCombo.setDisabled(positionAndDayDisabled);

        // month days buttons should be disabled if days are enabled
        if (frequency == 'MONTHLY') {
            me.monthdaysButtonField.setDisabled(!me.monthDaysRadioField.getValue());
        }
    },

    onFrequencyFieldChange : function (field, frequency) {
        var me    = this,
            items = me.query('[forFrequency]');

        for (var i = 0; i < items.length; i++) {
            var item = items[i];

            if (item.forFrequency.indexOf(frequency) > -1) {
                item.show();
                item.enable();
            } else {
                item.hide();
                item.disable();
            }
        }

        // the following lines are added to satisfy the 904_unused localization test
        // to let it know that these locales are used:
        // this.L('DAILYintervalUnit')
        // this.L('WEEKLYintervalUnit')
        // this.L('MONTHLYintervalUnit')
        // this.L('YEARLYintervalUnit')
        me.intervalUnit.setValue(me.L(frequency + 'intervalUnit'));

        me.togglePositionAndDayFields();
        me.toggleStopFields();
    },

    onStopRecurrenceFieldChange : function (field, value) {
        this.toggleStopFields();
    }
});
