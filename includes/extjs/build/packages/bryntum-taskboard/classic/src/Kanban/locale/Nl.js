// @tag alternative-locale
Ext.define('Kanban.locale.Nl', {
    extend      : 'Sch.locale.Locale',

    singleton : true,

    constructor : function (config) {

        Ext.apply(this , {
            l10n        : {
                'Kanban.menu.TaskMenuItems' : {
                    copy    : 'Kopie',
                    remove  : 'Verwijder',
                    edit    : 'Bewerk',
                    states  : 'Voortgang',
                    users   : 'Toewijzen'
                }
            },

            NotStarted : 'Nog niet gestart',
            InProgress : 'Bezig',
            Test       : 'Test',
            Done       : 'Klaar'
        });

        this.callParent(arguments);
    }
});
