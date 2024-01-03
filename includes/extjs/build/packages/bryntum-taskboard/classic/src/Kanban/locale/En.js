Ext.define('Kanban.locale.En', {
    extend      : 'Sch.locale.Locale',

    singleton : true,

    constructor : function (config) {

        Ext.apply(this , {
            l10n        : {
                'Kanban.menu.TaskMenuItems' : {
                    copy    : 'Duplicate',
                    remove  : 'Delete',
                    edit    : 'Edit',
                    states  : 'Status',
                    users   : 'Assign to'
                }
            },

            NotStarted : 'Not Started',
            InProgress : 'In Progress',
            Test       : 'Test',
            Done       : 'Done'
        });

        this.callParent(arguments);
    }
});
