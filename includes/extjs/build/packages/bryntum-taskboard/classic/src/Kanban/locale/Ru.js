// @tag alternative-locale
Ext.define('Kanban.locale.Ru', {
    extend      : 'Sch.locale.Locale',

    singleton : true,

    constructor : function (config) {

        Ext.apply(this , {
            l10n        : {
                'Kanban.menu.TaskMenuItems' : {
                    copy    : 'Дублировать',
                    remove  : 'Удалить',
                    edit    : 'Изменить',
                    states  : 'Состояние',
                    users   : 'Назначить'
                }
            },

            NotStarted : 'Не начато',
            InProgress : 'Выполняется',
            Test       : 'Тестирование',
            Done       : 'Закончено'
        });

        this.callParent(arguments);
    }
});
