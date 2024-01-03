//*************************************************************************************************************//
//			DYNAMIC IMAGE
Ext.define('iconfield', {
    extend: 'Ext.Img',
	mixins: {
        field: 'Ext.form.field.Base'
    },
    alias: 'widget.iconfield',	
	initComponent: function(){
		var me = this;
        var config = {};
        Ext.apply(me, config);
		me.callParent(arguments);
    },
    setValue: function (new_value) {
        var me = this;
		if (new_value == undefined || new_value == null) {				
			this.setSrc('');
		} else {
			var imagesrc = '/includes/io/CallFile.php?fileid=' + new_value;
			this.setSrc(imagesrc);
		}
    },
	initValue : function(){
          this.setValue(this.value);
    }
});