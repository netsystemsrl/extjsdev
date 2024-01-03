Ext.application({
    name: 'Fiddle',

    launch: function () {
        Ext.create('Ext.data.Store', {
            storeId: 'simpsonsStore',
            fields: ['name', 'email', 'phone', 'status'],
            data: [{
                name: 'Lisa',
                email: 'lisa@simpsons.com',
                phone: '555-111-1224',
                status: '1'
            }, {
                name: 'Bart',
                email: 'bart@simpsons.com',
                phone: '555-222-1234',
                status: '1'
            }, {
                name: 'Homer',
                email: 'homer@simpsons.com',
                phone: '555-222-1244',
                status: '2'
            }, {
                name: 'Marge',
                email: 'marge@simpsons.com',
                phone: '555-222-1254',
                status: '0'
            }]
        });

        Ext.create('Ext.grid.Panel', {
            title: 'Simpsons',
            store: Ext.data.StoreManager.lookup('simpsonsStore'),
            columns: [{
                text: 'Name',
                dataIndex: 'name'
            }, {
                text: 'Email',
                dataIndex: 'email',
                flex: 1
            }, {
                text: 'Phone',
                dataIndex: 'phone'
            }, {
                text: 'status',
                xtype: 'widgetcolumn',
                sortable: false,
                autoSizeColumn: false,
                flex: 0,
                minWidth: 50,
                width: 50,
                maxWidth: 50,
                editor: {},
                widget: {
                    xtype: 'button'
                },
                onWidgetAttach: function (col, widget, rec) {
                    //simbolo in riga
                    //imposto in CSS
                    //widget.setText(rec.get(me.DectailFieldVisible));
                    widget.setStyle('border', '1px');
                    widget.setStyle('display', 'block');
                     widget.setStyle('margin','5px auto');
                    widget.setStyle('width', '1.0em');
                    widget.setStyle('height', '1.5em');
                    widget.setStyle('line-height', 'normal');
                    widget.setStyle('text-alignt', 'center');
                    widget.setStyle('border-radius', '50%');
                    widget.setStyle('background-color', 'red');
                    widget.setStyle('background-image', '-webkit-linear-gradient(-45deg, rgba(255,255,220,.7) 0%, transparent 100%');
                    widget.setStyle('background-image', '-moz-linear-gradient(-45deg, rgba(255,255,220,.7) 0%, transparent 100%');
                    widget.setStyle('background-image', '-o-linear-gradient(-45deg, rgba(255,255,220,.7) 0%, transparent 100%');
                    widget.setStyle('background-image', '-ms-linear-gradient(-45deg, rgba(255,255,220,.7) 0%, transparent 100%');
                    //tooltip
                    widget.setTooltip(rec.get('email'));

                }
            }],
            renderTo: Ext.getBody()
        });
    }
});
