//*************************************************************************************************************//
//			DYNAMIC VIDEO


Ext.define('dynamicvideo', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.dynamicvideo',
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
	procremoteonselect: false,
	
	autoScroll: true,

	resizeMode: 'fit',
	zoomLevel: 100,
	mousedowntime: 0,
	images: [],
	imageindex: 1,
	sourceX: 0,
	sourceY: 0,
	targetX: 0,
	targetY: 0,
	panWidth: 0,
	panHeight: 0,
	orgWidth: 0,
	orgHeight: 0,
	text: '',

	layout : {
		type: 'fit',
		align: 'stretch'
	},
		
	initComponent: function () {
		var me = this;

		this.bbar = [
			{
				xtype: 'filefield',
				itemId: 'FileSaveBtn',
				tooltip: 'File Save',
				iconCls: 'x-fa fa-floppy-o',
				cls: 'x-btn-text-icon',
				buttonOnly: true,
				multiple: false,
				width: 60,
				buttonConfig: {
					text: 'File',
					width: '100%',
					ui: 'default-toolbar-small'
				},
				listeners: {
					change: function (button, value, eOpts) {
						console.log('trigger upload of file:', value);
						var file = button.fileInputEl.dom.files[0];
						
						//preview
						var me = button.up('dynamicvideo');
						var myImage = me.down('image');
						var MyPreview = me.down('#MyPreview');
						var MySnapshot = me.down('#MySnapshot');
						var FileSaveBtn = me.down('#FileSaveBtn');
						MyPreview.hide();
						myImage.show();
						
						var reader = new FileReader();
						reader.onload = function (e) {
							// image content is in e.target.result
							// we can then put it into img.src, for example
							var me = button.up('dynamicvideo');
							var myImage = me.down('image');
							myImage.setSrc(e.target.result);
						};
						reader.readAsDataURL(file);

						//save
						var data = new FormData();
						me.text = Math.floor(Math.random() * 1000000000) + 1 + '.png';
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
		
					}
				},
				anchor: '100%',
				hidden: false,
			}, {
				xtype: 'button',
				itemId: 'FileOpenBtn',
				tooltip: 'File Open',
				iconCls: 'x-fa fa-floppy-o',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler: function (button, event) {
					var me = button.up('dynamicvideo');
					CurrentPanel = me.up('panel');
					//DAFARE IL SAVE
				},
			}
		];
			
		me.callParent();
	},

	initValue: function () {
		this.setValue(this.value);
	},
	setValue: function (new_value) {
		var me = this;
		var myImage = me.down('image');
		me.text = new_value;
		if (new_value == undefined || new_value == null) {
			myImage.setSrc('');
		} else {
			var imagesrc = '/includes/io/CallFile.php?fileid=' + new_value;
			myImage.setSrc(imagesrc);
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
	
	onRender: function(ct, position){
		dynamicvideo.superclass.onRender.call(this, ct, position);
		
		var me = this;
		me.maxHeight = Ext.getBody().getViewSize().height - (me.y + 100);
		if (me.hasOwnProperty('height') == false) me.height = Ext.getBody().getViewSize().height - (me.y + 100);
    }
	
});