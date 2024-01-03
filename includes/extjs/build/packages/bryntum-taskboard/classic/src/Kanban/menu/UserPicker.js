Ext.define('Kanban.menu.UserPicker', {
    extend          : 'Ext.view.View',

    alias           : [
        'widget.userpicker',
        'widget.kanban_userpicker'
    ],

    cls             : 'sch-userpicture-view',
    autoScroll      : true,
    showName        : true,
    padding         : '10 5 5 5',

    itemSelector    : '.sch-user',
    overItemCls     : 'sch-user-hover',
    selectedItemCls : 'sch-user-selected',

    initComponent : function () {

        var modelProt     = this.store && this.store.model && this.store.model.prototype;
        var nameField     = modelProt && modelProt.nameField || 'Name';
        var imageUrlField = modelProt && modelProt.imageUrlField || 'ImageUrl';

        Ext.apply(this, {
            itemTpl : '<tpl for=".">' +
                '<div class="sch-user">' +
                '<img src="{'+ imageUrlField +':htmlEncode}" />' +
                (this.showName ? '<span>{'+ nameField +':htmlEncode}</span>' : '') +
                '</div>' +
                '</tpl>'
        });

        this.callParent(arguments);
    }
});
