Ext.define('Gnt.widget.calendar.WeekEditor', {
    extend                      : 'Ext.form.Panel',

    requires                    : [
        'Ext.grid.Panel',
        'Gnt.data.Calendar',
        'Sch.util.Date',
        'Gnt.widget.calendar.AvailabilityGrid'
    ],

    mixins                      : ['Gnt.mixin.Localizable'],

    alias                       : 'widget.calendarweekeditor',

    weekName                    : null,
    startDate                   : null,
    endDate                     : null,

    // the availability array for the week being edited
    weekAvailability            : null,

    // the `weekAvailability` of the calendar
    calendarWeekAvailability    : null,
    // the `defaultWeekAvailability` of the calendar
    defaultWeekAvailability     : null,

    backupWeekAvailability      : null,

    layout                      : 'anchor',

    defaults                    : { border: false, anchor: '100%' },

    calendarDayModel            : null,

    /*
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - defaultTimeText    : 'Default time',
            - workingTimeText    : 'Working time',
            - nonworkingTimeText : 'Non-working time',
            - error              : 'Error',
            - noOverrideError    : "Week override contains only 'default' days - can't save it"
     */

    currentDayIndex         : null,

    _weekDaysGrid           : null,
    _availabilityGrid       : null,

    initComponent: function () {

        this.backupWeekAvailability     = [];

        this.items = [
            {
                xtype       : 'radiogroup',
                padding     : "0 5px",
                name        : 'dayType',
                items       : [
                    {
                        boxLabel   : this.L('defaultTimeText'),
                        name       : 'IsWorkingDay',
                        inputValue : 0
                    },
                    {
                        boxLabel   : this.L('workingTimeText'),
                        name       : 'IsWorkingDay',
                        inputValue : 1
                    },
                    {
                        boxLabel   : this.L('nonworkingTimeText'),
                        name       : 'IsWorkingDay',
                        inputValue : 2
                    }
                ],
                listeners   : {
                    change      : this.onDayTypeChanged,
                    scope       : this
                }
            },
            {
                layout : {
                    type : 'hbox',
                    align : 'stretch'
                },
                padding     : '0 0 5px 0',

                items       : [
                    {
                        margin : '0 10px 0 5px',
                        flex   : 1,
                        items  : this.getWeekDaysGrid()
                    },
                    {
                        flex   : 1,
                        margin : '0 5px 0 0',
                        items  : this.getAvailabilityGrid()
                    }
                ]
            }
        ];

        this.callParent(arguments);
    },


    getWeekDaysGrid: function () {
        if (this._weekDaysGrid != null) return this._weekDaysGrid;

        var DN = Ext.Date.dayNames;

        return this._weekDaysGrid = new Ext.grid.Panel({
            hideHeaders     : true,
            minHeight       : 160,
            columns         : [{
                dataIndex       : 'name',
                flex            : 1
            }],

            store           : new Ext.data.Store({
                autoDestroy     : true,
                fields          :['id', 'name'],
                idProperty      : 'id',
                data            : [
                    { id : 1, name: DN[1] },
                    { id : 2, name: DN[2] },
                    { id : 3, name: DN[3] },
                    { id : 4, name: DN[4] },
                    { id : 5, name: DN[5] },
                    { id : 6, name: DN[6] },
                    { id : 0, name: DN[0] }
                ]
            }),

            listeners: {
                viewready           : this.onWeekDaysListViewReady,
                selectionchange     : this.onWeekDaysListSelectionChange,
                beforeselect        : this.onWeekDaysListBeforeSelect,

                scope               : this
            }
        });
    },


    getAvailabilityGrid: function () {
        if (!this._availabilityGrid) {
            this._availabilityGrid = new Gnt.widget.calendar.AvailabilityGrid({
                calendarDay     : new this.calendarDayModel()
            });
        }

        return this._availabilityGrid;
    },


    getDayTypeRadioGroup : function () {
        if (!this.dayTypeRadioGroup) this.dayTypeRadioGroup = this.down('radiogroup[name="dayType"]');
        return this.dayTypeRadioGroup;
    },


    getWeekAvailability : function () {
        return this.weekAvailability;
    },


    onWeekDaysListViewReady : function () {
        var weekDaysGrid            = this.getWeekDaysGrid(),
            monday                  = weekDaysGrid.getStore().getAt(0);

        this.currentDayIndex        = monday.getId();

        this.readFromData();

        weekDaysGrid.getSelectionModel().select(monday, false, true);
    },


    onWeekDaysListBeforeSelect : function () {
        if (!this.saveToData()) return false;
    },


    applyChanges : function (toWeekAvailability) {
        if (!this.saveToData()) return false;

        var weekAvailability    = this.weekAvailability;

        var hasOverride         = false;

        for (var i = 0; i < 7; i++) {
            var currentAvailability = weekAvailability[ i ];

            if (currentAvailability) {
                hasOverride = true;

                if (!toWeekAvailability[ i ]) toWeekAvailability[ i ] = currentAvailability;

                toWeekAvailability[ i ].setIsWorkingDay(currentAvailability.getIsWorkingDay());
                toWeekAvailability[ i ].setAvailability(currentAvailability.getAvailability());

            } else {
                toWeekAvailability[ i ] = null;
            }
        }

        if (!hasOverride) {
            Ext.MessageBox.show({
                title       : this.L('error'),
                msg         : this.L('noOverrideError'),
                modal       : true,
                icon        : Ext.MessageBox.ERROR,
                buttons     : Ext.MessageBox.OK
            });

            return false;
        }

        return true;
    },


    onWeekDaysListSelectionChange: function (view, records) {
        this.currentDayIndex            = records[ 0 ].getId();

        this.readFromData();
    },


    // 0 - default, 1 - working , 2 - non-working
    getCurrentTypeOfWeekDay : function (index) {
        return this.weekAvailability[ index ] ? (this.weekAvailability[ index ].getIsWorkingDay() ? 1 : 2) : 0;
    },


    getCurrentWeekDay : function (index) {
        return this.weekAvailability[ index ] || this.calendarWeekAvailability[ index ] || this.defaultWeekAvailability[ index ];
    },


    saveToData: function () {
        var currentDayIndex         = this.currentDayIndex;
        var type                    = this.getDayTypeRadioGroup().getValue().IsWorkingDay;

        var weekAvailability        = this.weekAvailability;

        // default day - remove the element from `weekAvailability`
        if (type === 0) {
            weekAvailability[ currentDayIndex ] = null;

            return true;
        }

        var availabilityGrid        = this.getAvailabilityGrid();

        // working day
        if (type == 1) {
            if (!availabilityGrid.isValid()) return false;

            if (!weekAvailability[ currentDayIndex ]) weekAvailability[ currentDayIndex ] = this.copyDefaultWeekDay(currentDayIndex);

            weekAvailability[ currentDayIndex ].setIsWorkingDay(true);
            weekAvailability[ currentDayIndex ].setAvailability(availabilityGrid.getIntervals());

            this.backupWeekAvailability[ currentDayIndex ] = null;

            return true;
        }

        // type == 2
        if (!weekAvailability[ currentDayIndex ]) weekAvailability[ currentDayIndex ] = this.copyDefaultWeekDay(currentDayIndex);

        weekAvailability[ currentDayIndex ].setIsWorkingDay(false);
        weekAvailability[ currentDayIndex ].setAvailability([]);

        return true;
    },


    copyDefaultWeekDay : function (index) {
        var copy = (this.calendarWeekAvailability[ index ] || this.defaultWeekAvailability[ index ]).copy();

        // copy should be a phantom
        copy.phantom = true;

        copy.beginEdit();
        copy.setType('WEEKDAYOVERRIDE');
        copy.setOverrideStartDate(this.startDate);
        copy.setOverrideEndDate(this.endDate);
        copy.setName(this.weekName);
        copy.endEdit();

        return copy;
    },


    readFromData : function (intervalsToRestore) {
        var day         = this.getCurrentWeekDay(this.currentDayIndex);
        var type        = this.getCurrentTypeOfWeekDay(this.currentDayIndex);

        var grid = this.getAvailabilityGrid();
        grid.setAvailability(intervalsToRestore || day.getAvailability());

        var group = this.getDayTypeRadioGroup();
        group.suspendEvents();
        group.setValue({ IsWorkingDay: [ type ] });
        group.resumeEvents();

        grid.setDisabled(type != 1);
    },


    onDayTypeChanged : function (sender, newValue, oldValue) {
        var value       = sender.getValue();

        // ignore case when no radio buttons selected?
        // weird call with empty object as "newValue"
        if (value.IsWorkingDay == null || Ext.isArray(value.IsWorkingDay)) return;

        var weekAvailability            = this.weekAvailability;
        var backupWeekAvailability      = this.backupWeekAvailability;
        var currentDayIndex             = this.currentDayIndex;

        var availabilityGrid            = this.getAvailabilityGrid();

        var intervalsToRestore;

        if (oldValue.IsWorkingDay == 1) backupWeekAvailability[ currentDayIndex ] = availabilityGrid.getIntervals();

        switch (value.IsWorkingDay) {
            case 0:
                weekAvailability[ currentDayIndex ] = null;
            break;

            case 1:
                if (!weekAvailability[ currentDayIndex ]) weekAvailability[ currentDayIndex ] = this.copyDefaultWeekDay(currentDayIndex);

                intervalsToRestore = backupWeekAvailability[ currentDayIndex ];

                weekAvailability[ currentDayIndex ].setIsWorkingDay(true);
            break;

            case 2:
                if (!weekAvailability[ currentDayIndex ]) weekAvailability[ currentDayIndex ] = this.copyDefaultWeekDay(currentDayIndex);

                weekAvailability[ currentDayIndex ].setAvailability([]);
                weekAvailability[ currentDayIndex ].setIsWorkingDay(false);
            break;

            default:
                throw "Unrecognized day type";
        }

        this.readFromData(intervalsToRestore);
    }
});
