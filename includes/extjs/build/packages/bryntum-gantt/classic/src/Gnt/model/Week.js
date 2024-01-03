Ext.define('Gnt.model.Week', {
    extend      : 'Ext.data.Model',

    idProperty  : 'Id',

    fields      : [
        { name : 'Id' },
        { name : 'name', type : 'string' },
        { name : 'startDate', type : 'date' },
        { name : 'endDate', type : 'date' },
        { name : 'mainDay' }, // type : Gnt.model.CalendarDay
        { name : 'weekAvailability' }
    ],

    set : function (field, value) {
        if (field === 'name') {
            // rename every CalendarDay instance embedded
            Ext.Array.each(this.get('weekAvailability').concat(this.get('mainDay')), function (weekDay) {
                if (weekDay) {
                    weekDay.setName(value);
                }
            });
        }

        this.callParent(arguments);
    }
});