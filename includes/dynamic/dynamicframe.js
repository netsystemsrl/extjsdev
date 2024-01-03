//*************************************************************************************************************//
//			DYNAMIC FRAME
Ext.define('dynamicframe', {
	extend: 'Ext.panel.Panel',
    suspendLayout: true,
    alias: 'widget.dynamicframe',
    mixins: {
        field: 'Ext.form.field.Base'
    },
    submitFormat: 't',
    submitValue: true,
    buttonOnly: true,
    text: null,
    zoomration: 1,
    allowadd: false,
    allowedit: false,
    allowdelete: false,
    allowexport: false,
    pdfExtractorMode: false,
    procremoteonselect: false,
	border :true,
	layout: {
        type: 'vbox',       // Arrange child items vertically
        align: 'stretch',    // Each takes up full width
        padding: 5
    },
    width: '100%',
    height: '100%',
	
    text: '',

    initComponent: function () {
        var me = this;
		
		var iframe = new Ext.ux.IFrame({
            src: me.text,
                itemId: 'uxiframe1',
                height: window.innerHeight,
                width: '100%',
			region:'center',
			margin: '5 5 5 5', 
        });
		me.items = [iframe];
		/*
		me.html = "<iframe src=" +
				"'" + "http://192.168.104.200/stream.mjpg" + "'" +
				"onload=" +
				"javascript:(function(o){o.style.height=o.contentWindow.document.body.scrollHeight+'px';}(this));" +
				"style='height:100%;width:100%;border:none;overflow:hidden;'></iframe>";
				*/
		me.suspendLayout = false;
		me.updateLayout();
        me.callParent();
	},
    initValue: function () {
        this.setValue(this.value);
    },
    setValue: function (new_value) {
        var me = this;
        me.text = new_value;
		/**/
		var iframe = new Ext.ux.IFrame({
            src: me.text,
                itemId: 'uxiframe1',
                height: window.innerHeight,
                width: '100%',
			region:'center',
			margin: '5 5 5 5',
        });
		
				
		me.items = [iframe];
		
        //me.html = "<iframe src=" +
		//		"'" + me.text + "'" +
		//		"onload=" +
		//		"javascript:(function(o){o.style.height=o.contentWindow.document.body.scrollHeight+'px';}(this));" +
		//		"style='height:100%;width:100%;border:none;overflow:hidden;'></iframe>";
		//me.html = '<iframe src="http://192.168.104.200/stream.mjpg" id="uxiframe-1634-iframeEl" data-ref="iframeEl" name="uxiframe-1634-frame" width="400px" height="400px" frameborder="0"></iframe>';
	},
    getValue: function () {
        var me = this;
        var data = {};
        data[me.getName()] = '' + me.text;
        //return data;
        return '' + me.text;
    },
    getSubmitData: function () {
        var me = this;
        var data = {};
        data[me.getName()] = '' + me.text;
        return data;
    },
	onRender: function (ct, position) {
        dynamicwmsgmap.superclass.onRender.call(this, ct, position);
        var me = this;
        if ((me.hasOwnProperty('height') == false) && (me.hasOwnProperty('anchor')) == false) {
			me.anchor = 'none 100%';
		}
    }
});