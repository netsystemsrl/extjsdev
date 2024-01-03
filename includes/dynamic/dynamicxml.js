//*************************************************************************************************************//
//			DYNAMIC PDF EXTRACT
Ext.define('dynamicxml', {
	alias: 'widget.dynamicxml',
	mixins: {
        field: 'Ext.form.field.Base'
    },
    //extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
	extend: 'Ext.Component',
	
	//showLoadMaskOnInit: false,
	//disableTextLayer: false,
	//showPerPage: false,
	pageScale: 1.25,
	xsl: 'fattura.xsl' ,
    html:'',
	text: '',
	autoScroll: true,
	bodyStyle: 'background: #ffffff;',
	"border": true,
	"flex": 60,
	"layout": "fit",
	"html": "",
			
			
	initValue : function(){
        var me = this;
		this.setValue(this.value);
    },
			
    initComponent: function () {
        var me = this;
        this.callParent();
    },
    setValue: function (new_value) {
        var me = this;
		me.text = new_value;
		if (new_value == undefined || new_value == null) {	
			
		} else {
			var srcXml = "../includes/io/CallFile.php?fileid=" + me.text + '&nocache=' + Math.floor(Math.random() * 1000);
			var xmlObj = Ext.Ajax.request({
                url: srcXml,
                method: 'GET',
                headers: {
                    'Content-Type': 'text/xml'
                },
                async: false
            });

            var xml = xmlObj.responseXML;

			var srcXsl = "../includes/io/CallFile.php?fileid=" + me.xsl + '&nocache=' + Math.floor(Math.random() * 1000);
            var xslObj = Ext.Ajax.request({
                url: srcXsl,
                method: 'GET',
                headers: {
                    'Content-Type': 'text/xml'
                },
                async: false
            });
            var xsl = xslObj.responseText;
			
			
			if (xml && xsl){
				var    parser = new DOMParser();
				xsl = parser.parseFromString(xsl, "text/xml");

				var proc = new XSLTProcessor();
				proc.importStylesheet(xsl);
				xslHtml = proc.transformToFragment(xml, document);

				var serializer = new XMLSerializer()
				var document_fragment_string = serializer.serializeToString(xslHtml);

				//Ext.ComponentQuery.query('#newWin')[0].setHtml(document_fragment_string)
				//var mypanel = me.up('panel');
				//mypanel.Html = document_fragment_string;
				me.setHtml(document_fragment_string);
			}else{
			}
		}
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
        dynamicxml.superclass.onRender.call(this, ct, position);
        var me = this;
        if ((me.hasOwnProperty('height') == false) && (me.hasOwnProperty('anchor')) == false) {
			me.anchor = '100% 100%';
		}
    }
});

