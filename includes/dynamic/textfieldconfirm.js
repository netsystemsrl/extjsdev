
Ext.define('textfieldconfirm', {
    extend: 'Ext.container.Container',
    mixins: ['Ext.form.field.Field'],
    alias: 'widget.textfieldconfirm',
	text : '',
	id:'textfieldconfirm',
	
    config: {
        FirstConfig: {},
        SecondConfig: {},
    },

    referenceHolder: true,

    layout: {
        type: 'hbox'
    },

    initComponent: function () {
        var me = this,
            FirstConfig = me.FirstConfig,
            SecondConfig = me.SecondConfig;

        me.items = [
			Ext.apply({
				xtype: 'textfield',
				reference: 'FirstField',
				width: me.width,
				minLength     : me.minLength,
				maxLength     : me.maxLength,
				ignoreOnSubmit: true,
			}, FirstConfig),
			Ext.apply({
				xtype: 'label',
				width: 5,
				text: ':',
			}),
			Ext.apply({
				xtype: 'textfield',
				reference: 'SecondField',
				width: me.width,
				minLength     : me.minLength,
				maxLength     : me.maxLength,
				ignoreOnSubmit: true
			}, SecondConfig)
		];
		
        me.callParent();
    },

    afterRender: function () {
        var me = this;

        if (me.hideData) {
            me.lookupReference('FirstField').hide();
			me.lookupReference('SecondField').hide();
        }

        me.callParent();
    },
	
	getSubmitData: function () {
        var me = this,
            data = null;
		data = {};
		data[me.getName()] = me.lookupReference('FirstField').getValue();
        return data;
    },
	
    getValue: function () {
        var me = this;
        return me.FirstField;
    },

    setValue: function (value) {
        var me = this;

    },

    getInputId: function () {
        return null;
    },

});