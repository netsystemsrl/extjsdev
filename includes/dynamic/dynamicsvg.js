//*************************************************************************************************************//
//			DYNAMIC FRAME
Ext.define('dynamicsvg', {
	extend: 'Ext.Component',
    //suspendLayout: true,
    alias: 'widget.dynamicsvg',
    mixins: {
        field: 'Ext.form.field.Base'
    },
    submitFormat: 't',
    submitValue: true,
    buttonOnly: true,
    text: null,
    //zoomration: 1,
    allowadd: false,
    allowedit: false,
    allowdelete: false,
    allowexport: false,
    pdfExtractorMode: false,
    procremoteonselect: false,
	fieldPointSVG: '',
	panelPointSVG: '',
	processPointSVG: '',
    width: '100%',
    height: '100%',
	text: '',
	id: 'MyDynamicSVG',
	iFrame : null,
    initComponent: function () {
        var me = this;
		me.panelPointSVG = me.up('panel').up('panel').name;
        this.callParent(arguments);
	},
	autoEl: {
		tag: "iframe",
		id: "resultFrame",
		src: "/svgeditor/index.html"
	},
    listeners: {
		afterrender: function () {
			console.log('rendered');
			me = this;
			this.getEl().on('load', function (ObjFrame, el) {
				console.log('loaded');
				me = Ext.getCmp(this.id);
				if (me.text){
					src = "../includes/io/CallFile.php?fileid=" + me.text + '&nocache=' + Math.floor(Math.random() * 1000);
				}else{
					src = "";
				}
				//me.fieldPointSVG;
				//function displayMessage (evt)
				const newMsg = { 	src: src, 
									panelPointSVG : me.panelPointSVG, 
									fieldPointSVG : me.fieldPointSVG, 
									processPointSVG : me.processPointSVG };
				el.contentWindow.postMessage(JSON.stringify(newMsg), "*");
				//el.contentWindow.postMessage(src, "*");
			});
		}
	},
	initValue: function () {
        var me = this;
        this.setValue(this.value);
    },
    setValue: function (new_value) {
        var me = this;
        me.text = new_value;
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
        dynamicsvg.superclass.onRender.call(this, ct, position);
        var me = this;
        if ((me.hasOwnProperty('height') == false) && (me.hasOwnProperty('anchor')) == false) {
			me.anchor = '100% 100%';
		}
    },
	afterrender: function() {
        var me = this;
		console.log('afterrender');
	 },
	ready:function () {
        var me = this;
		console.log('ready');
	},
	load:function () {
        var me = this;
		console.log('load');
	},
	postImage: function () {
		console.log('trigger upload of file:', value);
		var file = button.fileInputEl.dom.files[0];
		
		//preview
		var me = button.up('dynamicsvg');
		var myImage = me.down('image');
		var FileSaveBtn = me.down('#FileSaveBtn');
		myImage.show();
		
		var reader = new FileReader();
		reader.onload = function (e) {
			// image content is in e.target.result
			// we can then put it into img.src, for example
			var me = button.up('dynamicsvg');
			var myImage = me.down('image');
			myImage.setSrc(e.target.result);
		};
		reader.readAsDataURL(file);

		//save
		var data = new FormData();
		me.text = Math.floor(Math.random() * 1000000000) + 1 + '.svg';
		data.append('file', file, me.text);
		Ext.Ajax.request({
			url: '/includes/io/DataWrite.php',
			rawData: data,
			params: {
				layoutid: CurrentPanelRaw.id,
			},
			headers: {
				'Content-Type': null
			}, //to use content type of FormData
			success: function (response) {}
		});

		// reset file from upload element
		fileField     = button.fileInputEl.dom;
		parentNod     = fileField.parentNode;
		tmpForm        = document.createElement("form");
		parentNod.replaceChild(tmpForm,fileField);
		tmpForm.appendChild(fileField);
		tmpForm.reset();
		parentNod.replaceChild(fileField,tmpForm);

		
		
		
		
		
		
        //to image
        var me = this;
		
        var data = new FormData();
        me.text = Math.floor(Math.random() * 1000000000) + 1 + '.svg';
		
        var imagesrc = me.canvas.toDataURL();
        var blobBin = atob(imagesrc.split(',')[1]);
        var array = [];
        for (var i = 0; i < blobBin.length; i++) {
            array.push(blobBin.charCodeAt(i));
        }
        var file = new Blob([new Uint8Array(array)], {
            type: 'image/svg+xml'
        });

        data.append('file', file, me.text);

        Ext.Ajax.request({
            url: '/includes/io/DataWrite.php',
            rawData: data,
            params: {
                layoutid: CurrentPanelRaw.id,
            },
            headers: {
                'Content-Type': null
            }, //to use content type of FormData
            success: function (response) {}
        });
    },
});
