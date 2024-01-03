//*************************************************************************************************************//
//			DYNAMIC IMAGE
Ext.define('dynamicbarcode', {
	extend:'Ext.Component',
    alias: 'widget.dynamicbarcode',
	mixins: {
        field: 'Ext.form.field.Base'
    },
	mytext: '',
	html: '<svg class="Mybarcode"></svg>',
	
	bctext:"123456789012",
	
	bcformat:"EAN13",
	bcwidth:1,
	bcfontSize: 24,
	bcdisplayValue:true, 
	
	initComponent: function(){
		var me = this;
		me.callParent(arguments);
    },
	afterRender: function () {
        var me = this;
		me.CreateBarcode();
        me.callParent();
    },
	initValue : function(){
        this.setValue(this.value);
    },
	CreateBarcode: function(){
		var me = this;
		JsBarcode(".Mybarcode", me.bctext, {
			format: me.bcformat,
			displayValue: me.bcdisplayValue,
			fontSize:me.bcfontSize
		});
	},
    setValue: function (new_value) {
        var me = this;
		me.mytext = new_value;
		me.bctext = new_value;
		if (new_value == undefined || new_value == null) {				
			this.CreateBarcode();
		} else {
			this.CreateBarcode();
		}
    },
	getValue: function () {
		var me = this;
        var data = {};
		data[me.getName()] = '' + me.mytext;
        //return data;
		return '' + me.mytext;
    },
	getSubmitData: function () {
        var me = this;
        var data = {};
		data[me.getName()] = '' + me.mytext;
        return data;
    }
});