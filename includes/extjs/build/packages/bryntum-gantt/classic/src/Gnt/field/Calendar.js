/**
 * A specialized field allowing a user to select particular calendar for a task.
 * This class inherits from the standard Ext JS "combo box" field, so any standard `Ext.form.field.ComboBox` configs can be used.
 */
Ext.define('Gnt.field.Calendar', {
    extend             : 'Ext.form.field.ComboBox',

    requires           : [
        'Ext.data.Store',
        'Sch.patches.BoundList',
        'Gnt.model.Calendar',
        'Gnt.data.Calendar'
    ],

    mixins             : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],

    alias              : 'widget.calendarfield',
    alternateClassName : 'Gnt.widget.CalendarField',

    fieldProperty      : 'calendarIdField',
    getTaskValueMethod : 'getCalendarId',
    setTaskValueMethod : 'setCalendarId',

    listConfig         : {
        htmlEncode : true
    },

    /**
     * @cfg {String} pickerAlign The align for combo-box's picker.
     */
    pickerAlign        : 'tl-bl?',

    /**
     * @cfg {Boolean} matchFieldWidth Defines if the picker dropdown width should be explicitly set to match the width of the field. Defaults to true.
     */
    matchFieldWidth    : true,

    editable           : true,

    triggerAction      : 'all',

    valueField         : 'Id',

    displayField       : 'Name',

    queryMode          : 'local',

    forceSelection     : true,

    allowBlank         : true,

    initComponent : function () {
        var me     = this,
            config = me.getInitialConfig();

        if (!config.store || me.store.isEmptyStore) {
            me.store = {
                xclass      : 'Ext.data.Store',
                autoDestroy : true,
                model       : 'Gnt.model.Calendar'
            };
        }

        if (!(me.store instanceof Ext.data.Store)) {
            me.store = Ext.create(me.store);
        }

        me.callParent(arguments);

        me.updateCalendarsStore();

        // listen to new calendars creation/removal and update the field store
        me.mon(Ext.data.StoreManager, {
            add    : function (index, store, key) {
                if (store instanceof Gnt.data.Calendar) {
                    this.updateCalendarsStore();
                }
            },
            remove : function (index, store, key) {
                if (store instanceof Gnt.data.Calendar) {
                    this.updateCalendarsStore();
                }
            },
            scope  : me
        });

        me.on({
            expand : me.updateCalendarsStore,
            show   : function () {
                me.setReadOnly(me.readOnly);
            },
            change : me.onFieldChange,
            scope  : me
        });
    },

    updateCalendarsStore : function () {
        var calendars = Ext.Array.map(Gnt.data.Calendar.getAllCalendars(), function (cal) {
            return {
                Id   : cal.calendarId,
                Name : cal.name || cal.calendarId
            };
        });

        this.store.loadData(calendars);
    },

    setReadOnly : function (readOnly) {
        this.updateCalendarsStore();

        readOnly = readOnly || this.store.count() === 0;

        this.callParent([readOnly]);
    },

    onSetTask : function (task) {
        // set field to readonly if no calendars
        this.setReadOnly(this.readOnly);

        var taskCalendarId = this.getTaskValue();

        // Fallback to project calendar if task does not have value assigned
        if (!taskCalendarId && typeof(taskCalendarId) !== "number") {
            var projectCalendar = task.getProjectCalendar();

            taskCalendarId = (projectCalendar && projectCalendar.calendarId) || taskCalendarId;
        }

        this.setValue(taskCalendarId);
    },


    // Used in the column renderer
    valueToVisible : function (value, task) {
        var me             = this,
            displayTplData = [];

        // When you type in a value that does not exist, for example "xxx",
        // the result in the combo list will be filtered out, so this.findRecordByValue(value) returns null.
        // forceSelection is true, so not valid value will force to select lastSelectedRecords[0], see combo.assertValue.
        // store.getById searches even in filtered out records
        var record = this.store.getById(value);

        if (record) {
            displayTplData.push(record.data);
        } else if (Ext.isDefined(me.valueNotFoundText) && typeof me.valueNotFoundText == 'string') {
            displayTplData.push(me.valueNotFoundText);
        }

        return me.displayTpl.apply(displayTplData);
    },


    // @OVERRIDE
    getValue : function () {
        return this.value || '';
    },


    getErrors : function (value) {
        if (value) {
            var record = this.findRecordByDisplay(value);

            if (record) {
                if (this.task && !this.task.isCalendarApplicable(record.getId())) {
                    return [this.L('calendarNotApplicable')];
                }
            }
        }

        var errors = this.callParent(arguments);

        if (errors && errors.length) {
            return errors;
        }

        // allow empty values by default
        if (!Ext.isEmpty(value) && !(this.findRecordByDisplay(value) || this.findRecordByValue(value))) {
            return [this.L('invalidText')];
        } else {
            return [];
        }
    },


    onFieldChange : function (field, value) {
        this.setValue(value);
    },


    // @OVERRIDE
    // We need to have both onFieldChange and setValue
    // since setValue is not called when user select an option from the dropdown list
    setValue : function (value) {

        this.callParent([value]);

        // we keep '' for empty field
        if (undefined === value || null === value || '' === value) this.value = '';

        if (this.instantUpdate && !this.getSuppressTaskUpdate() && this.task) {

            if (this.getTaskValue() != this.value) {
                // apply changes to task
                this.applyChanges();
            }

        }
    },


    // @OVERRIDE
    assertValue : function () {
        var raw = this.getRawValue();

        if (!raw && this.value) {
            this.setValue('');
        } else {
            this.callParent(arguments);
        }
    }
});
