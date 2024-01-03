/**

 @class Gnt.widget.calendar.Calendar
 @extends Ext.form.Panel
 @aside guide gantt_calendars

 {@img gantt/images/calendar.png}

 This widget can be used to edit the calendar content. As the input it should receive an instance of the {@link Gnt.data.Calendar} class.
 Once the editing is done and user is happy with the result the {@link #applyChanges} method should be called. It will apply
 all the changes user made in UI to the calendar.

 Note, this widget does not have the "Ok", "Apply changes" etc button intentionally, as you might want to combine it with your widgets.
 See {@link Gnt.widget.calendar.CalendarWindow} for this widget embedded in the Ext.window.Window instance.


 */
Ext.define('Gnt.widget.calendar.Calendar', {
    extend : 'Ext.form.Panel',

    requires : [
        'Ext.XTemplate',
        'Ext.data.Store',
        'Ext.grid.Panel',
        'Ext.grid.plugin.CellEditing',
        'Ext.layout.container.HBox',
        'Ext.layout.container.Column',
        'Ext.layout.container.Fit',
        'Ext.layout.container.Anchor',
        'Ext.form.FieldContainer',
        'Ext.form.field.Checkbox',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Text',
        'Ext.tab.Panel',
        'Sch.patches.BoundList',
        'Gnt.data.Calendar',
        'Gnt.model.Week',
        'Gnt.widget.calendar.DayEditor',
        'Gnt.widget.calendar.WeekEditor',
        'Gnt.widget.calendar.DatePicker',
        'Gnt.template.CalendarLegend',
        'Gnt.template.CalendarDateInfo'
    ],

    mixins : [ 'Gnt.mixin.Localizable' ],

    alias : 'widget.calendar',

    defaults : { border : false },

    /**
     * @cfg {String} workingDayCls class will be applied to all working days at legend block and datepicker
     */
    workingDayCls : 'gnt-datepicker-workingday',

    /**
     * @cfg {string} nonWorkingDayCls class will be applied to all non-working days at legend block and datepicker
     */
    nonWorkingDayCls : 'gnt-datepicker-nonworkingday',

    /**
     * @cfg {String} overriddenDayCls class will be applied to all overridden days at legend block and datepicker
     */
    overriddenDayCls : 'gnt-datepicker-overriddenday',

    /**
     * @cfg {String} overriddenWeekDayCls class will be applied to all overridden days inside overridden week at legend block and date picker
     */
    overriddenWeekDayCls : 'gnt-datepicker-overriddenweekday',

    /**
     * @cfg {Gnt.data.Calendar} calendar An instance of the {@link Gnt.data.Calendar} to read/change the holidays from/in.
     */
    calendar : null,

    calendarManager : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - dayOverrideNameHeaderText : 'Name',
     * - overrideName        : 'Name',
     * - startDate           : 'Start Date',
     * - endDate             : 'End Date',
     * - error               : 'Error',
     * - dateText            : 'Date',
     * - addText             : 'Add',
     * - editText            : 'Edit',
     * - removeText          : 'Remove',
     * - workingDayText      : 'Working day',
     * - weekendsText        : 'Weekends',
     * - overriddenDayText   : 'Overridden day',
     * - overriddenWeekText  : 'Overridden week',
     * - workingTimeText     : 'Working time',
     * - nonworkingTimeText  : 'Non-working time',
     * - dayOverridesText    : 'Day overrides',
     * - weekOverridesText   : 'Week overrides',
     * - okText              : 'OK',
     * - cancelText          : 'Cancel',
     * - parentCalendarText  : 'Parent calendar',
     * - noParentText        : 'No parent',
     * - selectParentText    : 'Select parent',
     * - newDayName          : '[Without name]',
     * - calendarNameText    : 'Calendar name',
     * - tplTexts            :
     *     - tplWorkingHours : 'Working hours for',
     *     - tplIsNonWorking : 'is non-working',
     *     - tplOverride     : 'override',
     *     - tplInCalendar   : 'in calendar',
     *     - tplDayInCalendar: 'standard day in calendar'
     * - overrideErrorText   : 'There is already an override for this day',
     * - overrideDateError   : 'There is already week override on this date: {0}',
     * - startAfterEndError  : 'Start date should be less than end date',
     * - weeksIntersectError : 'Week overrides should not intersect'
     */

    /**
     * @cfg {Object} dayGridConfig A custom config object to use when configuring the day overrides grid (Ext.grid.Panel instance).
     */
    dayGridConfig : null,

    /**
     * @cfg {Object} weekGridConfig A custom config object to use when configuring the week overrides grid (Ext.grid.Panel instance).
     */
    weekGridConfig : null,

    /**
     * @cfg {Object} datePickerConfig A custom config object to use when configuring the {@link Gnt.widget.calendar.DatePicker} instance.
     */
    datePickerConfig : null,

    /**
     * @cfg {Boolean} readOnly Set to true to disable editing
     */
    readOnly : false,

    /**
     * @property {Ext.grid.Panel} dayGrid Day overrides grid reference.
     */
    dayGrid : null,

    /**
     * @property {Ext.grid.Panel} weekGrid Week overrides grid reference.
     */
    weekGrid : null,

    /**
     * @property {Gnt.widget.calendar.DatePicker} datePicker Date picker reference.
     */
    datePicker : null,

    legendTpl : null,

    dateInfoTpl : null,

    dayOverridesCalendar : null,
    weekOverridesStore   : null,

    // reference to a window with day override editor used only in tests for now
    currentDayOverrideEditor : null,

    calendarDayModel : null,

    scrollable  : true,

    layout : {
        type  : 'vbox',
        align : 'stretch'
    },

    initComponent : function () {
        var me = this;

        // compiles templates
        me.setupTemplates();

        var calendar = me.calendar;

        if (!calendar && me.calendarManager) {
            calendar = me.calendarManager.getProjectCalendar();

            if (!calendar) {
                var root         = me.calendarManager.getRoot(),
                    calendarNode = root && root.firstChild;

                calendar = calendarNode && calendarNode.getCalendar();
            }
        }

        //  we need "calendarDayModel" to build days override grid
        if (!me.calendarDayModel && calendar) {
            me.calendarDayModel = calendar.getModel && calendar.getModel() || calendar.model;
        }

        // fills the panel "items"
        me.buildItems();

        me.bindListeners();

        me.callParent(arguments);

        me.projectCalendarCheckbox = me.down('#projectCalendarCheckbox');
        me.projectCalendarCheckbox.setVisible(me.calendarManager);

        me.setReadOnly(me.readOnly);

        // update the panel UI with active calendar data
        calendar && me.setCalendar(calendar);
    },

    /**
     * The {@link #readOnly} accessor. Use it to switch the `readonly` state.
     */
    setReadOnly : function (readOnly) {
        this.readOnly = readOnly;

        this.cmbParentCalendar.setDisabled(readOnly);
        this.down('#calendarName').setDisabled(readOnly);

        if (this.calendarManager && this.calendarManager.getProjectCalendar() !== this.calendar) {
            this.projectCalendarCheckbox.setDisabled(readOnly);
        }

        // disable/enable grids editing plugins and toolbar buttons
        this.setGridReadOnly(this.dayGrid, readOnly);
        this.setGridReadOnly(this.weekGrid, readOnly);
    },

    getReadOnly : function () {
        return this.readOnly;
    },

    /**
     * Returns true if the widget is currently read only.
     * @return {Boolean} readOnly
     */
    isReadOnly : function () {
        return this.getReadOnly();
    },

    setGridReadOnly : function (grid, readOnly) {
        var editingPlugin = grid.getPlugin('editingPlugin');

        // disable/enable grid editing plugin if any
        editingPlugin && editingPlugin[ readOnly ? 'disable' : 'enable' ]();

        // disable/enable toolbar buttons we're aware of
        grid.down('#btnAdd').setDisabled(readOnly);
        grid.down('#btnEdit').setDisabled(readOnly);
        grid.down('#btnRemove').setDisabled(readOnly);
    },

    bindListeners : function () {
        var me = this;

        me.on('calendarset', me.onCalendarSet);
        me.on('afterrender', me.onCalendarSet);

        me.dayGrid.on({
            selectionchange : me.onDayGridSelectionChange,
            validateedit    : me.onDayGridValidateEdit,
            edit            : me.onDayGridEdit,
            scope           : me
        });

        me.dayGrid.store.on({
            update : me.refreshView,
            remove : me.refreshView,
            add    : me.refreshView,
            scope  : me
        });

        me.weekGrid.on({
            selectionchange : me.onWeekGridSelectionChange,
            validateedit    : me.onWeekGridValidateEdit,
            edit            : me.onWeekGridEdit,
            scope           : me
        });

        me.weekGrid.store.on({
            update : me.refreshView,
            remove : me.refreshView,
            add    : me.refreshView,
            scope  : me
        });

        me.datePicker.on({
            select : me.onDateSelect,
            scope  : me
        });
    },

    buildItems : function () {

        this.dateInfoPanel = new Ext.Component({
            cls    : 'gnt-calendar-dateinfo',
            margin : '20 10',
            flex   : 1,
            border : false
        });

        this.cmbParentCalendar = new Ext.form.field.ComboBox({
            name         : 'cmb_parentCalendar',
            fieldLabel   : this.L('parentCalendarText'),
            labelAlign   : 'top',
            store        : {
                autoDestroy : true,
                fields      : ['Id', 'Name']
            },
            listConfig   : {
                htmlEncode : true
            },
            queryMode    : 'local',
            displayField : 'Name',
            valueField   : 'Id',
            anchor       : '100%',
            editable     : false,
            emptyText    : this.L('selectParentText')
        });

        this.buildWeekGrid();
        this.buildDayGrid();
        this.buildDatePicker();

        this.items = [
            {
                xtype  : 'container',
                layout : 'hbox',
                items  : [
                    {
                        xtype  : 'container',
                        flex   : 1,
                        margin : '15 5 15 15',
                        layout : 'anchor',
                        items  : [
                            {
                                xtype   : 'fieldcontainer',
                                defaults: {
                                    width : '100%'
                                },
                                layout  : 'vbox',
                                items   : [
                                    {
                                        xtype       : 'textfield',
                                        itemId      : 'calendarName',
                                        labelAlign  : 'top',
                                        fieldLabel  : this.L('calendarNameText')
                                    },
                                    {
                                        xtype       : 'checkbox',
                                        itemId      : 'projectCalendarCheckbox',
                                        fieldLabel  : this.L('isProjectCalendarText')
                                    },
                                    this.cmbParentCalendar
                                ]
                            },
                            {
                                xtype      : 'component',
                                padding    : '10 0 0 0',
                                renderTpl  : this.legendTpl,
                                anchor     : '100%',
                                renderData : {
                                    workingDayText       : this.L('workingDayText'),
                                    weekendsText         : this.L('weekendsText'),
                                    overriddenDayText    : this.L('overriddenDayText'),
                                    overriddenWeekText   : this.L('overriddenWeekText'),
                                    workingDayCls        : this.workingDayCls,
                                    nonWorkingDayCls     : this.nonWorkingDayCls,
                                    overriddenDayCls     : this.overriddenDayCls,
                                    overriddenWeekDayCls : this.overriddenWeekDayCls
                                }
                            }
                        ]
                    },
                    this.datePicker,
                    this.dateInfoPanel
                ]
            },
            {
                xtype       : 'tabpanel',
                minHeight   : 200,
                flex        : 1,
                items       : [ this.dayGrid, this.weekGrid ]
            }
        ];
    },


    buildDayGrid : function () {
        var calendarDayModel = this.calendarDayModel.prototype;

        // create day overrides grid
        this.dayGrid = new Ext.grid.Panel(Ext.apply({
            title   : this.L('dayOverridesText'),
            itemId  : 'dayGrid',
            tbar    : [
                {
                    text    : this.L('addText'),
                    itemId  : 'btnAdd',
                    action  : 'add',
                    iconCls : 'x-fa fa-plus',
                    handler : this.addDay,
                    scope   : this
                },
                {
                    text    : this.L('editText'),
                    itemId  : 'btnEdit',
                    action  : 'edit',
                    iconCls : 'x-fa fa-edit',
                    handler : this.editDay,
                    scope   : this
                },
                {
                    text    : this.L('removeText'),
                    itemId  : 'btnRemove',
                    action  : 'remove',
                    iconCls : 'x-fa fa-trash',
                    handler : this.removeDay,
                    scope   : this
                }
            ],
            store   : new Gnt.data.Calendar(),
            plugins : [ new Ext.grid.plugin.CellEditing({ clicksToEdit : 2, pluginId : 'editingPlugin' }) ],
            columns : [
                {
                    header    : this.L('dayOverrideNameHeaderText'),
                    dataIndex : calendarDayModel.nameField,
                    flex      : 1,
                    renderer  : Ext.htmlEncode,
                    editor    : { allowBlank : false }
                },
                {
                    xtype     : 'datecolumn',
                    header    : this.L('dateText'),
                    dataIndex : calendarDayModel.dateField,
                    width     : 100,
                    format    : this.L('format'),
                    editor    : {
                        xtype  : 'datefield',
                        format : this.L('format')
                    }
                }
            ]
        }, this.dayGridConfig || {}));

        this.dayOverridesCalendar = this.dayGrid.store;
    },

    updateGrids : function () {
        this.dayGrid && this.fillDaysStore();
        this.weekGrid && this.fillWeeksStore();
    },

    buildWeekGrid : function () {
        // create week overrides grid
        this.weekGrid = new Ext.grid.Panel(Ext.apply({
            title  : this.L('weekOverridesText'),
            itemId : 'weekGrid',

            plugins : [ new Ext.grid.plugin.CellEditing({ clicksToEdit : 2, pluginId : 'editingPlugin' }) ],

            store : new Ext.data.Store({
                autoDestroy : true,
                model       : 'Gnt.model.Week'
            }),

            tbar : [
                {
                    text    : this.L('addText'),
                    itemId  : 'btnAdd',
                    action  : 'add',
                    iconCls : 'x-fa fa-plus',
                    handler : this.addWeek,
                    scope   : this
                },
                {
                    text    : this.L('editText'),
                    itemId  : 'btnEdit',
                    action  : 'edit',
                    iconCls : 'x-fa fa-edit',
                    handler : this.editWeek,
                    scope   : this
                },
                {
                    text    : this.L('removeText'),
                    itemId  : 'btnRemove',
                    action  : 'remove',
                    iconCls : 'x-fa fa-trash',
                    handler : this.removeWeek,
                    scope   : this
                }
            ],

            columns : [
                {
                    header    : this.L('overrideName'),
                    dataIndex : 'name',
                    flex      : 1,
                    renderer  : Ext.htmlEncode,
                    editor    : { allowBlank : false }
                },
                {
                    xtype     : 'datecolumn',
                    header    : this.L('startDate'),
                    dataIndex : 'startDate',
                    width     : 100,
                    format    : this.L('format'),
                    editor    : {
                        xtype : 'datefield',
                        format : this.L('format'),
                        allowBlank : false
                    }
                },
                {
                    xtype     : 'datecolumn',
                    header    : this.L('endDate'),
                    dataIndex : 'endDate',
                    width     : 100,
                    format    : this.L('format'),
                    editor    : {
                        xtype : 'datefield',
                        format : this.L('format'),
                        allowBlank : false
                    }
                }
            ]

        }, this.weekGridConfig || {}));

        this.weekOverridesStore = this.weekGrid.store;
    },


    buildDatePicker : function () {
        this.datePicker = new Gnt.widget.calendar.DatePicker(Ext.apply({
            dayOverridesCalendar : this.dayGrid.store,
            weekOverridesStore   : this.weekGrid.store,
            margin               : '15 10 0 10',
            showToday            : false
        }, this.datePickerConfig));
    },


    onCalendarSet : function () {
        // data is an array of objects and store is considered as containing a modified records
        this.weekOverridesStore.commitChanges();
    },


    setCalendar : function (calendar) {

        if (this.calendar) {
            this.mun(this.calendar, {
                load         : this.onCalendarChange,
                add          : this.onCalendarChange,
                remove       : this.onCalendarChange,
                update       : this.onCalendarChange,
                parentchange : this.onParentChange,
                scope        : this
            });
        }

        this.calendar = calendar;

        if (calendar) {
            this.mon(this.calendar, {
                load         : this.onCalendarChange,
                add          : this.onCalendarChange,
                remove       : this.onCalendarChange,
                update       : this.onCalendarChange,
                parentchange : this.onParentChange,
                scope        : this
            });
        }

        this.onCalendarChange();

        this.fireEvent('calendarset', calendar);
    },


    onParentChange : function () {
        this.updateComboBox();
    },


    updateComboBox : function () {
        var me        = this,
            calendars = [];

        // Collect records for the combobox dropdown list, all calendars except the one being edited

        if (me.calendarManager) {
            var root       = me.calendarManager.getRoot();
            var activeNode = me.calendarManager.getNodeByCalendar(me.calendar);

            root.cascadeBy(function (item) {
                var calendar = item.getCalendar();

                if (item !== root && item !== activeNode && !activeNode.contains(item)) {
                    calendars.push({ Id : calendar.calendarId, Name : item.getName() || calendar.calendarId });
                }
            });

        } else {
            calendars = me.calendar.getParentableCalendars();
        }

        // fill the combobx store
        this.cmbParentCalendar.store.loadData([ { Id : -1, Name : this.L('noParentText') } ].concat(calendars));

        var parent   = this.calendar && this.calendar.parent,
            parentId = parent && parent.calendarId;

        this.cmbParentCalendar.setValue(parentId || -1);
    },


    onCalendarChange : function () {
        this.updateComboBox();

        if (this.calendarManager) {
            var isProjectCalendar = this.calendar === this.calendarManager.getProjectCalendar();
            this.projectCalendarCheckbox.setDisabled(isProjectCalendar);
            this.projectCalendarCheckbox.setValue(isProjectCalendar);
        }

        this.fillDaysStore();
        this.fillWeeksStore();
        this.refreshView();

        this.down('#calendarName').setValue(this.calendar.name);
    },


    setupTemplates : function () {
        var tplTexts = this.L('tplTexts');

        if (!(this.dateInfoTpl instanceof Ext.Template)) {
            this.dateInfoTpl = new Gnt.template.CalendarDateInfo({
                workingHoursText  : tplTexts.tplWorkingHours,
                nonWorkingText    : tplTexts.tplIsNonWorking,
                basedOnText       : tplTexts.tplBasedOn,
                overrideText      : tplTexts.tplOverride,
                inCalendarText    : tplTexts.tplInCalendar,
                dayInCalendarText : tplTexts.tplDayInCalendar
            });
        }

        if (!(this.legendTpl instanceof Ext.Template)) {
            this.legendTpl = new Gnt.template.CalendarLegend();
        }
    },

    afterRender : function () {
        this.callParent(arguments);

        this.onDateSelect(this.datePicker, new Date());
    },


    fillDaysStore : function () {
        // only filter days with type "DAY" that has "Date" set
        var dataTemp = Gnt.util.Data.cloneModelSet(this.calendar, function (calendarDay) {
            return (calendarDay.getType() == 'DAY' && calendarDay.getDate());
        });

        this.dayOverridesCalendar.loadData(dataTemp);
    },


    copyCalendarDay : function (calendarDay) {
        var copy = calendarDay.copy(null);

        copy.__COPYOF__ = calendarDay.getId();

        return copy;
    },


    fillWeeksStore : function () {
        var me   = this;
        var data = [];

        this.calendar.forEachNonStandardWeek(function (nonStandardWeek) {
            var week = Ext.apply({}, nonStandardWeek);

            week.weekAvailability = Ext.Array.map(week.weekAvailability, function (day) {
                return day && me.copyCalendarDay(day) || null;
            });

            week.mainDay = me.copyCalendarDay(week.mainDay);

            data.push(week);
        });

        this.weekOverridesStore.loadData(data);
    },


    addDay : function () {
        var date = this.datePicker.getValue();
        // do not allow duplicate day overrides
        if (this.dayOverridesCalendar.getOwnCalendarDay(date)) {
            this.alert({ msg : this.L('overrideErrorText') });
            return;
        }

        var dayModel = this.calendar.model;
        var dayProto = dayModel.prototype;
        var newDay   = {};

        newDay[ dayProto.nameField ] = this.L('newDayName');
        newDay[ dayProto.typeField ] = 'DAY';
        newDay[ dayProto.dateField ] = date;

        newDay = new dayModel(newDay);

        //this.dayOverridesCalendar.insert(0, newDay);
        this.dayGrid.getStore().insert(0, newDay);
        this.dayGrid.getSelectionModel().select([ newDay ], false, false);
    },


    editDay : function () {
        var me        = this,
            selection = this.dayGrid.getSelection(),
            day       = selection[ 0 ];

        if (day) {

            var editor = this.currentDayOverrideEditor = new Gnt.widget.calendar.DayEditor({
                addText            : this.L('addText'),
                removeText         : this.L('removeText'),
                workingTimeText    : this.L('workingTimeText'),
                nonworkingTimeText : this.L('nonworkingTimeText'),
                calendarDay        : day
            });

            var editorWindow = Ext.create('Ext.window.Window', {
                title : this.L('dayOverridesText'),
                modal : true,

                width  : 280,
                height : 260,

                layout : 'fit',
                items  : editor,

                buttons : [
                    {
                        text    : this.L('okText'),
                        handler : function () {
                            if (editor.isValid()) {
                                var calendarDay = editor.calendarDay;

                                calendarDay.setIsWorkingDay(editor.isWorkingDay());
                                calendarDay.setAvailability(editor.getIntervals());

                                me.applyCalendarDay(calendarDay, day);

                                me.refreshView();

                                editorWindow.close();
                            }
                        }
                    },
                    {
                        text    : this.L('cancelText'),
                        handler : function () {
                            editorWindow.close();
                        }
                    }
                ]
            });

            editorWindow.show();
        }
    },


    removeDay : function () {
        var grid      = this.dayGrid,
            selection = grid.getSelection();

        if (!selection[ 0 ]) return;

        grid.getStore().remove(selection[ 0 ]);

        this.refreshView();
    },


    refreshView : function () {
        var date        = this.datePicker.getValue(),
            day         = this.getCalendarDay(date),
            weekGrid    = this.weekGrid,
            dayGrid     = this.dayGrid,
            dayOverride = this.dayOverridesCalendar.getOwnCalendarDay(date),
            weekOverride;

        var name;

        // First check if there is an override on day level
        if (dayOverride) {
            dayGrid.getSelectionModel().select([ dayOverride ], false, true);
            name = dayOverride.getName();
        } else {
            // Now check if there is an override on week level
            weekOverride = this.getWeekOverrideByDate(date);
            if (weekOverride) {
                weekGrid.getSelectionModel().select([ weekOverride ], false, true);
                name = weekOverride.get('name');
            }
        }

        var dayData = {
            name         : name || day.getName(),
            date         : Ext.Date.format(date, this.L('dateInTextFormat')),
            calendarName : this.calendar.name || this.calendar.calendarId,
            availability : day.getAvailability(true),
            override     : Boolean(dayOverride || weekOverride),
            isWorkingDay : day.getIsWorkingDay()
        };

        this.dateInfoPanel.update(this.dateInfoTpl.apply(dayData));

        this.datePicker.rendered && this.datePicker.refreshCssClasses();
    },


    onDayGridSelectionChange : function (grid, selection) {
        if (selection[ 0 ]) {
            this.datePicker.setValue(selection[ 0 ].getDate());
            this.refreshView();
        }
    },


    onDayGridEdit : function (editor, context) {
        if (context.field === 'Date') {
            context.grid.getStore().clearCache();
            this.datePicker.setValue(context.value);
        }

        this.refreshView();
    },


    onDayGridValidateEdit : function (editor, context) {
        var calendar = this.dayGrid.store;

        if (context.value && context.field === calendar.model.prototype.dateField && calendar.getOwnCalendarDay(context.value) && context.value - context.originalValue !== 0) {
            this.alert({ msg : this.L('overrideErrorText') });
            return false;
        }
    },


    onDateSelect : function () {
        this.refreshView();
    },


    getCalendarDay : function (date) {
        var day = this.dayOverridesCalendar.getOwnCalendarDay(date);

        if (day) return day;

        day = this.getWeekOverrideDay(date);

        if (day) return day;

        return this.calendar.weekAvailability[ date.getDay() ] || this.calendar.defaultWeekAvailability[ date.getDay() ];
    },


    getWeekOverrideDay : function (date) {
        var internalWeekModel = this.getWeekOverrideByDate(date),
            index             = date.getDay();

        if (internalWeekModel == null) return null;

        var weekAvailability = internalWeekModel.get('weekAvailability');

        if (!weekAvailability) return null;

        return weekAvailability[ index ];
    },


    getWeekOverrideByDate : function (date) {
        var week = null;

        this.weekOverridesStore.each(function (internalWeekModel) {
            if (Ext.Date.between(date, internalWeekModel.get('startDate'), internalWeekModel.get('endDate'))) {
                week = internalWeekModel;
                return false;
            }
        });

        return week;
    },


    intersectsWithCurrentWeeks : function (startDate, endDate, except) {
        var result = false;

        this.weekOverridesStore.each(function (internalWeekModel) {
            if (internalWeekModel == except) return;

            var weekStartDate = internalWeekModel.get('startDate');
            var weekEndDate   = internalWeekModel.get('endDate');

            if (weekStartDate <= startDate && startDate < weekEndDate || weekStartDate < endDate && endDate <= weekEndDate) {
                result = true;

                // stop the iteration
                return false;
            }
        });

        return result;
    },


    addWeek : function () {
        var weekOverridesStore = this.weekOverridesStore;
        var startDate          = this.datePicker.getValue();
        var endDate;

        // we are about to create a week override and we need to make sure it does not
        // intersect with already created week overrides. Also we'd like to make it 1w long initially
        // but in case there will be an intersection with current overrides we are ok to shorten it
        for (var duration = 7; duration > 0; duration--) {
            endDate = Sch.util.Date.add(startDate, Sch.util.Date.DAY, duration);

            if (!this.intersectsWithCurrentWeeks(startDate, endDate)) break;
        }

        if (!duration) {
            this.alert({ msg : Ext.String.format(this.L('overrideDateError'), Ext.Date.format(startDate, 'Y/m/d')) });
            return;
        }

        var mainDay = new this.calendar.model();

        mainDay.setType('WEEKDAYOVERRIDE');
        mainDay.setName(this.L('newDayName'));
        mainDay.setOverrideStartDate(startDate);
        mainDay.setOverrideEndDate(endDate);
        mainDay.setWeekday(-1);

        var newWeek = weekOverridesStore.insert(0, {
            name      : this.L('newDayName'),
            startDate : startDate,
            endDate   : endDate,

            weekAvailability : [],
            mainDay          : mainDay
        })[ 0 ];

        this.weekGrid.getSelectionModel().select([ newWeek ], false, false);
    },


    editWeek : function () {
        var selection = this.weekGrid.getSelection(),
            me        = this;

        if (selection.length === 0) return;

        var weekModel = selection[ 0 ];

        var editor = new Gnt.widget.calendar.WeekEditor({
            startDate                : weekModel.get('startDate'),
            endDate                  : weekModel.get('endDate'),
            weekName                 : weekModel.get('name'),
            calendarDayModel         : this.calendar.model,
            // keep the "weekModel" private and pass individual fields to the editor
            weekAvailability         : weekModel.get('weekAvailability'),
            calendarWeekAvailability : this.calendar.weekAvailability,
            defaultWeekAvailability  : this.calendar.defaultWeekAvailability
        });

        var editorWindow = Ext.create('Ext.window.Window', {
            title    : this.L('weekOverridesText'),
            modal    : true,
            width    : 370,
            defaults : { border : false },

            layout : 'fit',
            items  : editor,

            buttons : [
                {
                    // this property will be used in test to locate the button
                    action : 'ok',

                    text    : this.L('okText'),
                    handler : function () {
                        if (editor.applyChanges(weekModel.get('weekAvailability'))) {
                            me.refreshView();
                            editorWindow.close();
                        }
                    }
                },
                {
                    text    : this.L('cancelText'),
                    handler : function () {
                        editorWindow.close();
                    }
                }
            ]
        });

        editorWindow.show();
    },


    removeWeek : function () {
        var selection = this.weekGrid.getSelection();

        if (selection[ 0 ]) {
            this.weekOverridesStore.remove(selection[ 0 ]);
            this.refreshView();
        }
    },


    onWeekGridSelectionChange : function (grid, selection) {
        if (selection[ 0 ]) {
            this.datePicker.setValue(selection[ 0 ].get('startDate'));
        }
    },


    onWeekGridEdit : function (editor, context) {
        var weekModel = context.record,
            startDate = weekModel.get('startDate'),
            endDate   = weekModel.get('endDate');

        if (context.field == 'startDate' || context.field == 'endDate') {
            Ext.Array.each(weekModel.get('weekAvailability').concat(weekModel.get('mainDay')), function (weekDay) {
                if (weekDay) {
                    weekDay.setOverrideStartDate(startDate);
                    weekDay.setOverrideEndDate(endDate);
                }
            });

            this.datePicker.setValue(startDate);
        }

//        if (context.field == 'name') {
//            weekModel.setName(weekModel.getName());
//            Ext.Array.each(weekModel.get('weekAvailability').concat(weekModel.get('mainDay')), function (weekDay) {
//                if (weekDay) {
//                    weekDay.setName(weekModel.get('name'));
//                }
//            });
//        }

        this.refreshView();
    },

    alert : function (config) {
        config = config || {};

        Ext.MessageBox.show(Ext.applyIf(config, {
            title   : this.L('error'),
            icon    : Ext.MessageBox.WARNING,
            buttons : Ext.MessageBox.OK
        }));
    },

    onWeekGridValidateEdit : function (editor, context) {
        var weekModel = context.record,
            startDate = context.field == 'startDate' ? context.value : weekModel.get('startDate'),
            endDate   = context.field == 'endDate' ? context.value : weekModel.get('endDate');

        if (startDate > endDate) {
            this.alert({ msg : this.L('startAfterEndError') });
            context.cancel = true;
            return false;
        }

        if (this.intersectsWithCurrentWeeks(startDate, endDate, weekModel)) {
            this.alert({ msg : this.L('weeksIntersectError') });
            context.cancel = true;
            return false;
        }
    },


    applyCalendarDay : function (from, to) {
        to.beginEdit();

        to.setName(from.getName());
        to.setIsWorkingDay(from.getIsWorkingDay());
        to.setDate(from.getDate());
        to.setOverrideStartDate(from.getOverrideStartDate());
        to.setOverrideEndDate(from.getOverrideEndDate());

        var fromAvailability = from.getAvailability(true);
        var toAvailability   = to.getAvailability(true);

        if (fromAvailability + '' != toAvailability + '') to.setAvailability(from.getAvailability());

        to.endEdit();
    },


    applySingleDay : function (copyDay, toAdd) {
        if (copyDay.__COPYOF__) {
            this.applyCalendarDay(copyDay, this.calendar.getModelById(copyDay.__COPYOF__));
        } else {
            if (copyDay.store) {
                copyDay.unjoin(copyDay.store);
            }
            // we reset id to not intersect w/ existing records
            copyDay.setId(null);
            toAdd.push(copyDay.getData());
        }
    },


    /**
     * Call this method when user is satisfied with the current state of the calendar in the UI. It will apply all the changes made in the UI
     * to the original calendar.
     *
     */
    applyChanges : function () {
        var me       = this;
        var calendar = this.calendar;
        var parent   = this.down('combobox[name="cmb_parentCalendar"]').getValue(),
            newName  = this.down('#calendarName').getValue(),
            setProjectCalendar  = this.projectCalendarCheckbox.getValue();

        if (this.calendarManager) {
            var node = this.calendarManager.getModelById(calendar.calendarId);
            if (node) {
                node.setName(newName);
            }

            if (this.calendarManager.getProjectCalendar() !== calendar && setProjectCalendar) {
                this.projectCalendarCheckbox.setDisabled(true);
                this.calendarManager.setProjectCalendar(calendar);
            }
        }

        calendar.suspendEvents(true);
        calendar.suspendCacheUpdate++;

        calendar.name = newName;

        calendar.setParent(parent ? Gnt.data.Calendar.getCalendar(parent) : null);

        if (calendar.getProxy() && calendar.getProxy().extraParams) {
            calendar.getProxy().extraParams.calendarId = calendar.calendarId;
        }

        // days part
        Gnt.util.Data.applyCloneChanges(this.dayOverridesCalendar, calendar, function (newData, recordCopy) {
            // forces clearing the CalendarDay availability cache
            recordCopy.originalRecord && recordCopy.originalRecord.setAvailability(recordCopy.getAvailability(true));
        });

        var daysToAdd         = [];
        var daysToRemove      = [];
        var remainingWeekDays = {};

        // weeks part
        this.weekOverridesStore.each(function (weekModel) {
            Ext.Array.each(weekModel.get('weekAvailability').concat(weekModel.get('mainDay')), function (weekDay) {
                if (weekDay) {
                    if (weekDay.__COPYOF__) remainingWeekDays[ weekDay.__COPYOF__ ] = true;

                    me.applySingleDay(weekDay, daysToAdd);
                }
            });
        });

        calendar.forEachNonStandardWeek(function (originalWeek) {
            Ext.Array.each(originalWeek.weekAvailability.concat(originalWeek.mainDay), function (originalWeekDay) {
                if (originalWeekDay && !remainingWeekDays[ originalWeekDay.getId() ]) daysToRemove.push(originalWeekDay);
            });
        });

        calendar.add(daysToAdd);
        calendar.remove(daysToRemove);

        calendar.suspendCacheUpdate--;
        calendar.clearCache();

        calendar.resumeEvents();

        this.fireEvent('calendarset', calendar);
    },


    hasChanges : function () {
        if (!this.calendar) return false;

        var dayChanges    = this.dayOverridesCalendar.getModifiedRecords().length || this.dayOverridesCalendar.getRemovedRecords().length,
            weekChanges   = this.weekOverridesStore.getModifiedRecords().length || this.weekOverridesStore.getRemovedRecords().length,
            // isDirty on field wouldn't work correct, so we are going to check it differently
            nameChanged   = this.down('#calendarName').getValue() != this.calendar.name,
            parentId      = this.calendar.parent && this.calendar.parent.calendarId || -1,
            parentChanged = this.cmbParentCalendar.getValue() != parentId,
            checkboxChanged = false;

        if (this.calendarManager) {
            checkboxChanged = this.projectCalendarCheckbox.getValue() && (this.calendarManager.getProjectCalendar() !== this.calendar);
        }

        return dayChanges || weekChanges || nameChanged || parentChanged || checkboxChanged;
    }
});
