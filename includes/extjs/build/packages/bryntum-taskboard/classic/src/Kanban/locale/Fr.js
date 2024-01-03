// @tag alternative-locale
Ext.define('Kanban.locale.Fr', {
    extend      : 'Sch.locale.Locale',

    singleton : true,

    constructor : function (config) {

        Ext.apply(this , {
            l10n        : {
                'Kanban.menu.TaskMenuItems' : {
                    copy    : 'Dupliquer',
                    remove  : 'Supprimer',
                    edit    : 'Éditer',
                    states  : 'État',
                    users   : 'Assigner à'
                }
            },

            NotStarted : 'Pas commencé',
            InProgress : 'En cours',
            Test       : 'Test',
            Done       : 'Achevé'
        });

        this.callParent(arguments);
    }
});
