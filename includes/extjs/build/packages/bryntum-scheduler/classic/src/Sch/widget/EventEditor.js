/**
 * A widget (ptype = 'scheduler_eventeditorform') used to edit event start/end dates as well as any meta data. It inherits from {@link Ext.form.FormPanel} so you can define any fields and use any layout you want.
 *
 * {@img scheduler/images/event-editor.png 2x}
 *
 * Normally, this widget shows the same form for all events. However you can show different forms for different event types. To do that:
 *
 * - the event type is supposed to be provided as the value of the `EventType` field in the event model.
 * - in the {@link #fieldsPanelConfig} provide a container with a card layout. The children of that container should be the forms which will be used to edit different
 * event types
 * - each such form should contain `EventType` configuration option, matching to the appropriate event type.
 * - the default form containing the start date, start time, end date, end time and name fields is always shared among all forms.
 * - this whole behavior can be disabled with the `dynamicForm : false` option.
 *
 * The overall picture will look like:
 *
 * ```javascript
 * fieldsPanelConfig : {
 *     xtype  : 'container',
 *     layout : 'card',
 *     items  : [
 *         // form for "Meeting" EventType
 *         {
 *             EventType : 'Meeting',
 *             xtype     : 'form',
 *             items     : [
 *                 ...
 *             ]
 *         },
 *         // eof form for "Meeting" EventType
 *
 *         // form for "Appointment" EventType
 *         {
 *             EventType : 'Appointment',
 *             xtype     : 'form',
 *             items     : [
 *                 ...
 *             ]
 *         }
 *         // eof form for "Appointment" EventType
 *     ]
 * }
 * ```
 *
 * Note, that you can customize the start date, start time, end date and end time fields with appropriate configuration options: {@link #startDateConfig}, {@link #startTimeConfig},  {@link #endDateConfig}, {@link #endTimeConfig}
 *
 * ```javascript
 * var eventEditor = Ext.create('Sch.widget.EventEditor', {
 *     ...
 *     startTimeConfig : {
 *         minValue : '08:00',
 *         maxValue : '18:00'
 *     },
 *     ...
 * });
 * ```
 */
Ext.define("Sch.widget.EventEditor", {
    extend : "Ext.form.Panel",

    mixins : [
        'Sch.widget.mixin.CustomizableRecordForm',
        'Sch.widget.recurrence.EventEditorMixin',
        'Sch.mixin.Localizable'
    ],

    alias : ['widget.eventeditorform', 'plugin.scheduler_eventeditorform'],

    isEventEditor : true,

    requires : [
        'Ext.util.Region',
        'Ext.form.Label',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Date',
        'Ext.form.field.Hidden',
        'Ext.form.field.Time',
        'Ext.Button',
        'Sch.model.Event',
        'Sch.util.Date',
        'Sch.patches.DateField'
    ],

    trackResetOnLoad : true,

    isSavingEvent : 0,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - saveText      : 'Save',
     * - deleteText    : 'Delete',
     * - cancelText    : 'Cancel',
     * - nameText      : 'Name',
     * - allDayText    : 'All day',
     * - startDateText : 'Start',
     * - endDateText   : 'End',
     * - resourceText  : 'Resource',
     * - 'Repeat'      : 'Repeat'
     */

    /**
     * @property {Object} eventStore The event store.
     */
    eventStore : null,

    /**
     * @cfg {Boolean} saveOnEnter True to save the form data and close if ENTER is pressed in one of the input fields inside the panel.
     */
    saveOnEnter : true,

    /**
     * @cfg {Boolean} showDeleteButton True to show a delete button in the form.
     */
    showDeleteButton : true,

    /**
     * The "All day" field.
     * @property {Ext.form.field.Checkbox} allDayField
     */
    allDayField : null,

    /**
     * The start date field.
     * @property {Ext.form.field.Date} startDateField
     */
    startDateField : null,

    /**
     * The start time field.
     * @property {Ext.form.field.Time} startTimeField
     */
    startTimeField : null,

    /**
     * The end date field.
     * @property {Ext.form.field.Date} endDateField
     */
    endDateField : null,

    /**
     * The end time field.
     * @property {Ext.form.field.Time} endTimeField
     */
    endTimeField : null,

    /**
     * The event name field.
     * @property {Ext.form.field.Text} nameField
     */
    nameField : null,

    /**
     * The resource picker field.
     * @property {Ext.form.field.ComboBox} resourceField
     */
    resourceField : null,

    /**
     * @cfg {Object} startTimeConfig Configuration object for the {@link #startTimeField}.
     */
    startTimeConfig : null,

    /**
     * @cfg {Object} startDateConfig Configuration object for the {@link #startDateField}.
     */
    startDateConfig : null,

    /**
     * @cfg {Object} endTimeConfig Configuration object for the {@link #endTimeField}.
     */
    endTimeConfig : null,

    /**
     * @cfg {Object} endDateConfig Configuration object for the {@link #endDateField}.
     */
    endDateConfig : null,

    /**
     * @cfg {Object} resourceFieldConfig Configuration object for the {@link #resourceField}.
     */
    resourceFieldConfig : null,

    /**
     * @cfg {Object} nameFieldConfig Configuration object for the {@link #nameField}.
     */
    nameFieldConfig : null,

    /**
     * @cfg {Object} allDayFieldConfig Configuration object for the {@link #allDayField}.
     */
    allDayFieldConfig : null,

    showResourceField : false,

    /**
     * @cfg {Boolean} scrollNewEventIntoView When set to True (default) the new event is scrolled into view.
     *
     * **Please note** that the config doesn't work for events assigned to multiple resources.
     */
    scrollNewEventIntoView : true,

    border : false,

    bodyPadding : 6,

    /**
     * @cfg {Object} fieldsPanelConfig (required) A panel config representing your fields that are associated with a scheduled event.
     *
     * Example:
     *
     * ```javascript
     * fieldsPanelConfig : {
     *     layout      : 'form',
     *
     *     style       : 'background : #fff',
     *     border      : false,
     *     cls         : 'editorpanel',
     *     labelAlign  : 'top',
     *
     *     defaults    : {
     *         width : 135
     *     },
     *
     *     items       : [
     *         titleField      = new Ext.form.TextField({
     *             name            : 'Title',
     *             fieldLabel      : 'Task'
     *         }),
     *
     *         locationField   = new Ext.form.TextField({
     *             name            : 'Location',
     *             fieldLabel      : 'Location'
     *         })
     *     ]
     * }
     * ```
     */
    fieldsPanelConfig : null,

    /**
     * @cfg {String} dateFormat This config parameter is passed to the {@link #startDateField} and {@link #endDateField} constructor.
     */
    dateFormat : 'Y-m-d',

    /**
     * @cfg {Number} weekStartDay
     * Day index on which the week begins (0-based, where 0 is Sunday).
     * This config parameter is passed to the {@link #startDateField} and {@link #endDateField} constructor.
     */
    weekStartDay : 1,

    /**
     * @cfg {String} timeFormat This config parameter is passed to the {@link #startTimeField} and {@link #endTimeField} constructor.
     */
    timeFormat : 'H:i',

    eventeditorCls : 'sch-eventeditor',

    /**
     * @cfg {Boolean} dynamicForm `True` to use several forms.
     */
    dynamicForm : true,

    /**
     * @property {Sch.model.Event} eventRecord The current {@link Sch.model.Event} record, which is being edited by the event editor.
     */
    eventRecord : null,

    /**
     * @property {Sch.model.Resource} resourceRecord The current {@link Sch.model.Resource} resource to which the event is assigned to.
     */
    resourceRecord : null,

    currentForm : null,

    allowOverlap : true,

    readOnly : false,

    /**
     *  @cfg {String} typeField This field in the model that defines the eventType.
     */

    typeField : 'EventType',

    layout : {
        type  : 'vbox',
        align : 'stretch'
    },

    /**
     * @event beforeeventdelete
     * Fires before an event is deleted
     * @param {Sch.widget.EventEditor} widget The widget instance
     * @param {Sch.model.Event} eventRecord The record about to be deleted
     * @preventable
     */

    /**
     * @event beforeeventadd
     * Fires before an event is added to the store
     * @param {Sch.widget.EventEditor} widget The widget instance
     * @param {Sch.model.Event} eventRecord The record about to be added to the store
     * @param {Sch.model.Resource} resourceRecord A resource record to which the record is assigned
     * @preventable
     */

    /**
     * @private
     * @event aftereventadd
     * Fires after an event is added to the store
     * @param {Sch.widget.EventEditor} widget The widget instance
     * @param {Sch.model.Event} eventRecord The record which has been added to the store
     */

    /**
     * @event beforeeventsave
     * Fires before an event is saved
     * @param {Sch.widget.EventEditor} widget The widget instance
     * @param {Sch.model.Event} eventRecord The record about to be saved
     * @param {Object} values The new values
     * @preventable
     */

    /**
     * @event aftereventsave
     * Fires after an event is successfully saved
     * @param {Sch.widget.EventEditor} widget The widget instance
     * @param {Sch.model.Event} eventRecord The record about to be saved
     */

    initComponent : function () {
        var me = this;

        me.addCls(me.eventeditorCls);

        // customizable fields will be updated on load record
        me.setupCustomizableRecordForm(me, Sch.model.Event);
        me.setupRecurrableEventEditorMixin(me);

        Ext.apply(me, {
            buttons : me.buttons || me.buildButtons(),
            items   : [
                {
                    xtype    : 'container',
                    itemId   : 'defaultFields',
                    margin   : '5 5 5 5',
                    defaults : {
                        width : '100%'
                    },
                    border   : false,
                    items    : me.getDefaultFields()
                },
                Ext.applyIf(me.fieldsPanelConfig, {
                    flex       : 1,
                    activeItem : 0
                })
            ]
        });

        me.callParent(arguments);

        me.defaultFields = me.down('#defaultFields');
    },

    afterRender : function () {
        this.callParent(arguments);

        if (this.saveOnEnter) {
            this.el.on({
                'keyup' : function (e, t) {
                    if (e.getKey() === e.ENTER && t.tagName.toLowerCase() === 'input') {
                        this.save();
                    }
                },
                scope   : this
            });
        }
    },

    onAllDayChange : function (checkbox, isAllDay) {
        var me = this,
            values,
            startDate,
            endDate;

        if (!me.loadingRecord) {
            values = this.getValues();

            me.suspendDateFieldsChange();

            if (isAllDay) {
                if (values.startDate) {
                    startDate = Sch.model.Event.getAllDayDisplayStartDate(values.startDate);

                    me.startDateField.setValue(startDate);
                    me.startTimeField.setValue(startDate);
                }

                if (values.startDate && values.endDate) {
                    endDate = Sch.model.Event.getAllDayDisplayEndDate(values.startDate, values.endDate);

                    me.endDateField.setValue(endDate);
                    me.endTimeField.setValue(endDate);
                }
            }
            else {
                if (values.startDate) {
                    endDate = Sch.util.Date.add(values.startDate, Sch.util.Date.HOUR, 1);

                    me.endDateField.setValue(endDate);
                    me.endTimeField.setValue(endDate);
                }
            }

            me.resumeDateFieldsChange();

            me.toggleAllDayFields();
        }
    },

    onDatesChange : function (field, newValue, oldValue) {
        var DATE   = Sch.util.Date;
        var values = this.getValues();

        if (!Ext.isDate(values.startDate) || !Ext.isDate(values.endDate) || (values.startDate.getTime() < values.endDate.getTime())) return;

        this.suspendDateFieldsChange();

        if (!values.allDay && values.startDate.getTime() >= values.endDate.getTime()) {
            if ((field === this.startDateField) || (field === this.startTimeField)) {
                this.endDateField.setValue(DATE.add(values.startDate, DATE.DAY, 1));
            } else {
                this.startDateField.setValue(DATE.add(values.endDate, DATE.DAY, -1));
            }
        }
        else if (values.allDay && values.startDate.getTime() > values.endDate.getTime()) {
            if ((field === this.startDateField) || (field === this.startTimeField)) {
                this.endDateField.setValue(values.startDate);
            } else {
                this.startDateField.setValue(values.endDate);
            }

        }

        this.resumeDateFieldsChange();
    },

    /**
     * @protected
     * Returns an array of default fields (name, start and end date).
     * @returns {*[]}
     */
    getDefaultFields : function () {
        var result = [];

        this.nameField = Ext.create(Ext.apply({
            fieldId       : this.eventeditorCls + '-name-field',
            xtype         : 'textfield',
            fieldLabel    : this.L('nameText'),
            name          : this.customizableFieldNames.nameField,
            selectOnFocus : true,
            allowBlank    : false
        }, this.nameFieldConfig));

        result.push(this.nameField);

        if (this.showResourceField) {
            this.resourceField = Ext.create(Ext.Object.merge({
                fieldId      : this.eventeditorCls + '-resource-field',
                xtype        : 'combo',
                listConfig   : {
                    htmlEncode : true
                },
                fieldLabel   : this.L('resourceText'),
                queryMode    : 'local',
                // default values, will be overriden from the resource store model fields
                valueField   : 'Id',
                displayField : 'Name',
                allowBlank   : false,
                editable     : false
            }, this.resourceFieldConfig));

            result.push(this.resourceField);
        }

        this.allDayField = Ext.create(Ext.apply({
            fieldId    : this.eventeditorCls + '-all-day-field',
            xtype      : 'checkboxfield',
            fieldLabel : this.L('allDayText'),
            handler    : this.onAllDayChange,
            scope      : this
        }, this.allDayFieldConfig));

        result.push(this.allDayField);

        this.startDateField = Ext.create(Ext.apply({
            fieldId    : this.eventeditorCls + '-start-date-field',
            xtype      : 'datefield',
            fieldLabel : this.L('startDateText'),
            allowBlank : false,
            format     : this.dateFormat,
            altFormats : '',
            startDay   : this.weekStartDay,
            flex       : 1,
            listeners  : {
                change : this.onDatesChange,
                scope  : this
            }
        }, this.startDateConfig));

        this.startTimeField = Ext.create(Ext.apply({
            fieldId    : this.eventeditorCls + '-start-time-field',
            cls        : this.eventeditorCls + '-timefield',
            xtype      : 'timefield',
            format     : this.timeFormat,
            altFormats : '',
            increment  : 30,
            width      : 100,
            margin     : '0 0 0 10',
            allowBlank : false,
            listeners  : {
                change : this.onDatesChange,
                scope  : this
            }
        }, this.startTimeConfig));

        this.endDateField = Ext.create(Ext.apply({
            fieldId    : this.eventeditorCls + '-end-date-field',
            xtype      : 'datefield',
            fieldLabel : this.L('endDateText'),
            allowBlank : false,
            format     : this.dateFormat,
            altFormats : '',
            startDay   : this.weekStartDay,
            flex       : 1,
            listeners  : {
                change : this.onDatesChange,
                scope  : this
            }
        }, this.endDateConfig));

        this.endTimeField = Ext.create(Ext.apply({
            fieldId    : this.eventeditorCls + '-end-time-field',
            cls        : this.eventeditorCls + '-timefield',
            xtype      : 'timefield',
            format     : this.timeFormat,
            altFormats : '',
            increment  : 30,
            width      : 100,
            margin     : '0 0 0 10',
            allowBlank : false,
            listeners  : {
                change : this.onDatesChange,
                scope  : this
            }
        }, this.endTimeConfig));

        result.push({
            xtype  : 'container',
            layout : 'hbox',
            margin : '0 0 10 0',
            items  : [
                this.startDateField,
                this.startTimeField
            ]
        });

        result.push({
            xtype  : 'container',
            layout : 'hbox',
            margin : '0 0 10 0',
            items  : [
                this.endDateField,
                this.endTimeField
            ]
        });

        return result;
    },

    setReadOnly : function (readOnly) {
        if (readOnly !== this.readOnly) {

            Ext.Array.each(this.query('field'), function (field) {
                field.setReadOnly(readOnly);
            });

            this.saveButton.setVisible(!readOnly);

            this.deleteButton && this.deleteButton.setVisible(!readOnly);

            this.readOnly = readOnly;
        }
    },

    /**
     * Return an event record which was loaded in the form widget.
     *
     * @return {Sch.model.Event} eventRecord The record about to be edited
     */
    getEventRecord : function () {
        return this.eventRecord;
    },

    suspendDateFieldsChange : function () {
        this.startDateField.suspendCheckChange++;
        this.startTimeField.suspendCheckChange++;
        this.endDateField.suspendCheckChange++;
        this.endTimeField.suspendCheckChange++;
    },

    resumeDateFieldsChange : function () {
        this.startDateField.suspendCheckChange--;
        this.startTimeField.suspendCheckChange--;
        this.endDateField.suspendCheckChange--;
        this.endTimeField.suspendCheckChange--;
    },

    /**
     * Load an event record in the form widget.
     *
     * @param eventRecord {Sch.model.Event}
     */
    loadRecord : function (eventRecord, readOnly) {
        var me = this;

        me.loadingRecord = true;

        // reset form previous
        me.reset();

        me.suspendDateFieldsChange();
        me.setReadOnly(readOnly);

        // Only show delete button if the event belongs to a store
        if (me.deleteButton) {
            me.deleteButton.setVisible(!readOnly && !me.isNewRecord(eventRecord));
        }

        me.eventRecord = eventRecord;

        var startDate = eventRecord.getStartDate();
        var endDate   = eventRecord.getEndDate();
        var isAllDay = eventRecord.getAllDay();

        me.startTimeField.setValue(startDate);
        me.endTimeField.setValue(endDate);

        if (!isAllDay) {
            me.startDateField.setValue(startDate);
            me.endDateField.setValue(endDate);
        }
        else {
            me.startDateField.setValue(
                Sch.model.Event.getAllDayDisplayStartDate(me.eventRecord)
            );
            me.endDateField.setValue(
                Sch.model.Event.getAllDayDisplayEndDate(me.eventRecord)
            );
        }

        me.allDayField.setValue(isAllDay);
        me.toggleAllDayFields();

        // we pass "eventStore" to "getResources" since the "eventRecord" might be NOT in the event store yet
        // and in the case "getResources" won't work
        var eventResources = eventRecord.getResources(me.getEventStore());

        if (me.isNewRecord(eventRecord) && !eventResources.length) {
            eventResources = [me.resourceRecord];
        }

        me.resourceField && me.setResourcesValue(eventResources);

        me.currentForm = me;

        // load the values to the main form
        me.callParent([eventRecord]);

        var eventType = eventRecord.get(me.typeField);

        if (eventType && me.dynamicForm) {
            var fieldsPanel = me.items.getAt(1),
                allForms    = fieldsPanel.query('> form[EventType]'),
                form        = fieldsPanel.query('> form[EventType=' + eventType + ']')[0];

            if (!form) {
                throw new Error("Can't find form for with EventType equal to " + eventType);
            }

            if (!fieldsPanel.getLayout().setActiveItem) {
                throw new Error("Can't switch active component in the 'fieldsPanel'");
            }

            fieldsPanel.getLayout().setActiveItem(form);

            me.currentForm = form;

            // load the values to additional form
            form.loadRecord(eventRecord);
        }

        me.fireEvent('loadevent', me, eventRecord, readOnly);

        me.nameField.focus();
        me.resumeDateFieldsChange();

        me.loadingRecord = false;
    },

    toggleAllDayFields : function () {
        var me = this;

        if (me.allDayField.isVisible()) {
            var isAllDay = me.allDayField.getValue();

            me.startTimeField.setDisabled(isAllDay);
            me.startTimeField.setHidden(isAllDay);
            me.endTimeField.setDisabled(isAllDay);
            me.endTimeField.setHidden(isAllDay);
        }
    },

    getFloatingComponents : function () {
        var me           = this,
            result       = [],
            pickerFields = me.query('pickerfield'),
            i;

        // HACK to render all pickers, so the query for floating components will return full result
        for (i = 0; i < pickerFields.length; i++) {
            var pickerField = pickerFields[i],
                picker      = pickerField.getPicker();

            // The fieldId is not required. It needs to make checking the field pickers in our tests easier.
            if (pickerField.fieldId) {
                picker.addCls(pickerField.fieldId + '-picker');
            }
        }

        var floatingComponents = me.query('[floating]');

        if (Ext.isArray(floatingComponents)) {
            result = result.concat(floatingComponents);
        }

        return result;
    },

    setEventStore : function (store) {
        this.eventStore = store;
    },

    setResourceStore : function (store) {
        var me = this;

        me.resourceStore = store;

        if (me.resourceField) {
            if (store) {
                me.resourceField.valueField   = store && store.getModel().prototype.idProperty;
                me.resourceField.displayField = store && store.getModel().prototype.nameField;

                // need to update the display tpl with new displayField value
                me.resourceField.setDisplayTpl();
            }

            me.resourceField.setStore(store);
        }
    },

    getEventStore : function () {
        return this.eventStore;
    },

    getResourceStore : function () {
        return this.resourceStore;
    },

    isNewRecord : function (eventRecord) {
        var store = this.getEventStore();

        return !store || store.indexOf(eventRecord) === -1;
    },

    onSaveClick : function () {
        this.save();
    },

    /**
     * This method first checks that the form values are valid and then updates the event.
     */
    save : function (eventRecord) {
        var me = this;

        eventRecord = eventRecord || me.eventRecord;

        if (!eventRecord || !me.isValid()) {
            return;
        }

        var eventStore        = me.getEventStore(),
            values            = me.getValues(),
            resourcesProvided = values.hasOwnProperty('resources');

        // check if resource has no overlapping events (if its prohibited)
        if (!me.allowOverlap && eventStore) {
            var abort = false;

            // we pass "eventStore" to "getResources" since the "eventRecord" might be NOT in the event store yet
            // and in the case "getResources" won't work
            Ext.each(resourcesProvided ? values.resources : eventRecord.getResources(me.getEventStore()), function (resource) {
                return abort = !eventStore.isDateRangeAvailable(values.startDate, values.endDate, eventRecord, resource);
            });

            if (abort) {
                return;
            }
        }

        var continueFn = function () {
            me.doSave(eventRecord, values);
        };

        if (me.fireEvent('beforeeventsave', me, eventRecord, values, continueFn) !== false) {
            continueFn();
        }

        return eventRecord;
    },

    doSave : function (eventRecord, values) {
        var me                = this,
            eventStore        = me.getEventStore(),
            resourcesProvided = values.hasOwnProperty('resources'),
            isAutoSyncEnabled = eventStore && eventStore.getAutoSync();

        if (isAutoSyncEnabled) {
            eventStore.suspendAutoSync();
        }

        me.isSavingEvent++;

        me.onBeforeSave(eventRecord);

        eventRecord.beginEdit();

        me.updateRecord(eventRecord);
        if (me.currentForm !== me) {
            me.currentForm.updateRecord(eventRecord);
        }

        if (values.allDay) {
            eventRecord.setStartEndDate(values.startDate, Sch.util.Date.getNext(values.endDate, Sch.util.Date.DAY, 1));
        }
        else {
            eventRecord.setStartEndDate(values.startDate, values.endDate);
        }

        eventRecord.setAllDay(values.allDay);

        eventRecord.endEdit();

        // if resources are provided either by "resourceField" or "resourceRecord" property
        if (resourcesProvided && !me.isNewRecord(eventRecord)) {
            me.assignResourcesToEvent(eventRecord, values.resources);
        }

        // Check if this is a new record
        if (eventStore && me.isNewRecord(eventRecord)) {
            if (me.fireEvent('beforeeventadd', me, eventRecord, values.resources) !== false) {
                if (eventStore.isTreeStore) {
                    eventRecord.set('leaf', true);
                }
                eventStore.append(eventRecord);
                // if resources are provided either by "resourceField" or "resourceRecord" property
                if (resourcesProvided) {
                    me.assignResourcesToEvent(eventRecord, values.resources);
                }
                me.fireEvent('aftereventadd', me, eventRecord);
            }
        }

        me.fireEvent('aftereventsave', me, eventRecord);
        me.onAfterSave(eventRecord);

        me.isSavingEvent--;

        if (isAutoSyncEnabled) {
            eventStore.resumeAutoSync(true);
        }
    },

    /**
     * Set resources as selected to a picker
     * @template
     * @protected
     * @param {Sch.model.Resource[]} resources
     */
    setResourcesValue : function (resources) {
        this.resourceField.setValue(resources);
    },

    /**
     * Returns resources to be applied to the event being edited.
     * @template
     * @protected
     * @return {Sch.model.Resource[]} resources
     */
    getResourcesValue : function () {
        return [this.resourceField.getSelection()];
    },

    /**
     * Assign selected resources to the event
     * @template
     * @private
     * @param {Sch.model.Event} eventRecord
     * @param {Sch.model.Resource[]} resources
     */
    assignResourcesToEvent : function (eventRecord, resources) {
        eventRecord.unassign();
        eventRecord.assign(resources);
    },

    isValid : function () {
        var valid = true;

        Ext.each(this.query('[isFormField]:not([excludeForm])'), function (field) {
            // Consider hidden fields are valid by default
            return valid = field.isHidden() || field.isValid();
        });

        return valid;
    },

    combineDateAndTime : function (date, time) {
        var result = null;

        if (Ext.isDate(date) && Ext.isDate(time)) {
            result = Sch.util.Date.copyTimeValues(Ext.Date.clone(date), time);
        }

        return result;
    },

    getStartDateValue : function () {
        return this.combineDateAndTime(this.startDateField.getValue(), this.startTimeField.getValue());
    },

    getEndDateValue : function () {
        return this.combineDateAndTime(this.endDateField.getValue(), this.endTimeField.getValue());
    },

    getValues : function () {
        var me     = this,
            values = me.callParent(arguments);

        if (me.resourceField) {
            values.resources = me.getResourcesValue();

        } else if (me.resourceRecord) {
            values.resources = [me.resourceRecord];
        }

        return Ext.apply(values, {
            startDate : me.getStartDateValue(),
            endDate   : me.getEndDateValue(),
            name      : me.nameField.getValue(),
            allDay    : me.allDayField.getValue(),
            resource  : values.resources && values.resources[0]
        });
    },

    /**
     * Template method, intended to be overridden. Called before the event record has been updated.
     * @param {Sch.model.Event} eventRecord The event record
     * @template
     */
    onBeforeSave : function (eventRecord) {
    },

    /**
     * Template method, intended to be overridden. Called after the event record has been updated.
     * @param {Sch.model.Event} eventRecord The event record
     * @template
     */
    onAfterSave : function (eventRecord) {
    },

    onDeleteClick : function () {
        this.deleteEvent();
    },

    deleteEvent : function (eventRecord) {
        var me = this;

        eventRecord = eventRecord || me.eventRecord;

        var continueFn = function () {
            me.doDeleteEvent(eventRecord);
        };

        if (me.fireEvent('beforeeventdelete', me, eventRecord, continueFn) !== false) {
            continueFn();
        }
    },

    doDeleteEvent : function (eventRecord) {
        var me         = this,
            eventStore = me.getEventStore();

        eventStore && eventStore.remove(eventRecord);

        me.fireEvent('aftereventdelete', me, eventRecord);
    },

    onCancelClick : Ext.emptyFn,

    buildButtons : function () {
        var buttons = [];

        this.saveButton = new Ext.Button({
            text    : this.L('saveText'),
            scope   : this,
            handler : this.onSaveClick
        });

        buttons.push(this.saveButton);

        if (this.showDeleteButton) {

            this.deleteButton = new Ext.Button({
                text    : this.L('deleteText'),
                scope   : this,
                handler : this.onDeleteClick
            });

            buttons.push(this.deleteButton);
        }

        this.cancelButton = new Ext.Button({
            text    : this.L('cancelText'),
            scope   : this,
            handler : this.onCancelClick
        });

        buttons.push(this.cancelButton);

        return buttons;
    }

});
