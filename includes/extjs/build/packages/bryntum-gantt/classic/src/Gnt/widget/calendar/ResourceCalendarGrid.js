Ext.define('Gnt.widget.calendar.ResourceCalendarGrid', {
    extend              : 'Ext.grid.Panel',

    requires            : [
        'Ext.data.Store',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.ComboBox',
        'Sch.patches.BoundList',
        'Sch.util.Date',
        'Gnt.model.Calendar',
        'Gnt.data.Calendar'
    ],

    mixins              : ['Gnt.mixin.Localizable'],

    alias               : 'widget.resourcecalendargrid',

    resourceStore       : null,
    calendarStore       : null,

    border : true,
    height : 180,

    /*
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - name      : 'Name',
            - calendar  : 'Calendar'
     */

    cellEditingConfig   : null,

    initComponent   : function() {
        var me = this;

        this.calendarStore = this.calendarStore || {
            xclass : 'Ext.data.Store',
            model  : 'Gnt.model.Calendar'
        };

        if (!(this.calendarStore instanceof Ext.data.Store)) {
            this.calendarStore = Ext.create(this.calendarStore);
        }

        var plugin  = Ext.create('Ext.grid.plugin.CellEditing', Ext.apply({ clicksToEdit : 2 }, this.cellEditingConfig));

        plugin.on({
            beforeedit    : function (editor, e) {
                var resource = e.record;

                if (e.value === null || e.value === undefined) {
                    var projectCal = resource.getProjectCalendar();

                    if (projectCal) {
                        e.value = projectCal.calendarId;
                    }
                }
            },

            edit    : function (editor, e) {
                this.onCalendarChange(e.record, e.value);
            },

            scope   : this
        });

        Ext.apply(me, {
            store           : me.resourceStore,

            columns: [{
                text      : this.L('name'),
                dataIndex : me.resourceStore.getModel().prototype.nameField,
                flex      : 1
            }, {
                text      : this.L('calendar'),
                dataIndex : me.resourceStore.getModel().prototype.calendarIdField,
                flex      : 1,
                renderer  : function (value, meta, record) {
                    var cal     = record.getCalendar();
                    var fn      = me.calendarStore.getModelById ? 'getModelById' : 'getById';
                    var rec     = me.calendarStore[fn](cal && cal.calendarId);

                    return rec && rec.getName() || value;
                },
                editor    : {
                    xtype        : 'combobox',
                    store        : me.calendarStore,
                    queryMode    : 'local',
                    displayField : 'Name',
                    valueField   : 'Id',
                    editable     : false,
                    allowBlank   : false,
                    listConfig   : {
                        htmlEncode : true
                    }
                }
            }],

            plugins     : plugin
        });

        this.calendarStore.loadData(this.getCalendarData());
        this.callParent(arguments);
    },

    getCalendarData : function () {
        return Ext.Array.map(Gnt.data.Calendar.getAllCalendars(), function (cal) {
            return { Id : cal.calendarId, Name : cal.name || cal.calendarId };
        });
    },

    onCalendarChange : function (record, calendarId) {
        record.setCalendarId(calendarId);
    },

    destroy : function() {
        this.calendarStore.destroy();

        this.callParent(arguments);
    }
});
