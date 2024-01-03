//*************************************************************************************************************//
//			DYNAMIC GALLERY
// https://fiddle.sencha.com/#view/editor&fiddle/1s1q

Ext.define('dynamicgallery', {
	extend: 'Ext.panel.Panel',
    suspendLayout: true,
    alias: 'widget.dynamicgallery',
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
	
    autoScroll: true,

    zoomLevel: 100,
    mousedowntime: 0,
    images: [],
	store: [],
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
	selectedImage : '',
	
    //  me.limitStart = ;
    //	me.limitEnd = ;
    scrollX: 0,
    scrollY: 0,
	
    addToCart: function(partno, qty) {
        console.log(partno,qty);
    },

    initComponent: function () {
        var me = this;

        me.bbar = [
			{
                xtype: 'filefield',
                itemId: 'FileSaveBtn',
                tooltip: 'File Save',
                iconCls: 'x-fa fa-floppy-o',
                cls: 'x-btn-text-icon',
                buttonOnly: true,
                multiple: false,
                width: 40,
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
                        var me = button.up('dynamicgallery');

                        var reader = new FileReader();
                        reader.onload = function (e) {
                            // image content is in e.target.result
                            // we can then put it into img.src, for example
                            var me = button.up('dynamicgallery');
                            me.store.add({
									id: 99,
									url: e.target.result
								});
                        };
                        reader.readAsDataURL(file);

                        //save
						var newfile = Math.floor(Math.random() * 1000000000) + 1 + '.png';
                        var data = new FormData();
						if (me.text != null)
							me.text = me.text + ";" + newfile;
						else
							me.text =  newfile;
						
						data.append('file', file, newfile);
						Ext.Ajax.request({
							url: '/includes/io/DataWrite.php',
							rawData: data,
							params: {
								layoutid: CurrentPanelRaw.id,
							},
							headers: {
								'Content-Type': null
							}, //to use content type of FormData
							success: function (response) {
							}
						});

                        // reset file from upload element
                        fileField = button.fileInputEl.dom;
                        parentNod = fileField.parentNode;
                        tmpForm = document.createElement("form");
                        parentNod.replaceChild(tmpForm, fileField);
                        tmpForm.appendChild(fileField);
                        tmpForm.reset();
                        parentNod.replaceChild(fileField, tmpForm);

                    }
                },
			},
			{
                xtype: 'button',
                itemId: 'FileDeleteBtn',
                tooltip: 'File Delete',
                iconCls: 'x-fa fa-trash-o',
                tooltip: 'Delete',
                cls: 'x-btn-text-icon',
                buttonOnly: true,
                multiple: false,
                width: 40,
				listeners: {
					click: function (button, event) {
                        var me = button.up('dynamicgallery');
						
						new_valueArray = me.text.split(';');
						var i = 0;
						me.text = '';
						while (i < new_valueArray.length) {
							if (new_valueArray[i] == me.selectedImage){
								
							}else{
								me.text = me.text + new_valueArray[i] + ";";
							}
							i++;
						}
						me.setValue(me.text)
                    }
                },
			}
        ];
		
		me.store = Ext.create('Ext.data.Store', {
            id: 'myGridGalleryStore',
            name: 'myGridGalleryStore',
            storeId: 'myGridGalleryStore',
            fields: ['id', 'url'],
            async: false,
            columns: [],
            data: [],
            listeners: {}
        });
		
		me.store.suspendEvents();
		me.store.add({
						id: 0,
						url: '/repositorycom/empty.png'
					});
		me.store.resumeEvents();
				
		var imageTpl = new Ext.XTemplate(
			'<tpl for=".">',
				'<div class="myGridGallery_selector">',
					'<span><img src="{url}" width="200" style="max-height:100%;"/></span>',
					//'<span><input type="button" itemid="ImageDel" name="ImageDel" value="Del"></span>',
					//'<span><input type="button" itemid="ImageDel" name="ImageDel" value="Del" onclick="Delete(\'{id}\',1)"></span>',
				'</div>',
			'</tpl>');	
        me.items = [
			{	
				itemId: 'myGridGallery',
				id: 'myGridGallery',
				xtype: 'dataview',
				cls: 'myGridGallery',
				//itemSelector: '.myGridGallery_selector',
				border: 1,
				itemTpl: imageTpl,
				multiSelect: false,
				singleSelect: true,
				frame: true,
				store: me.store,
                bind: {
                    store: me.store
                },
				listeners: {
                    itemclick: function(view,index,node,event){
						var me = this.up('dynamicgallery');
						var new_image_str = '';
						var record = view.getRecord(node);
						new_valueArray = me.text.split(';');
						me.selectedImage = new_valueArray[index.id];
						// view.setStyle('border', '3px solid #00FFFF');
                    }
				}
			}
        ];
		// Trigger a layout.
		me.suspendLayout = false;
		me.updateLayout();
        me.callParent();

        me.on('afterrender', this.onImagePanelRendered, this);
        //me.on('resize', this.onPanelResized, this);
        //me.on('firstimage', this.onFirstImage, this);
        //me.on('lastimage', this.onLastImage, this);
        //me.on('imagechange', this.onImageChange, this);
        //me.child('image').on('afterrender', this.onImageRendered, this);
        this.callParent(arguments);
    },
    initValue: function () {
        this.setValue(this.value);
    },
    setValue: function (new_value) {
        var me = this;
        me.text = new_value;
		me.store.clearData();
		me.store.removeAll();
        if (new_value != undefined && new_value != null) {
			me.store.suspendEvents();
			new_valueArray = new_value.split(';');
			var i = 0;
			while (i < new_valueArray.length) {
				if (new_valueArray[i] != ''){
					me.store.add({
									id: i,
									url: '/includes/io/CallFile.php?fileid=' + new_valueArray[i] + '&nocache=' + Math.floor(Math.random() * 1000)
								}); 
				}
				i = i + 1;
			}
			me.store.resumeEvents();
			var medataview = me.down('dataview');
			medataview.refresh();
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
        dynamicgallery.superclass.onRender.call(this, ct, position);

        var me = this;
        me.maxHeight = Ext.getBody().getViewSize().height - (me.y + 100);
        if (me.hasOwnProperty('height') == false)
            me.height = Ext.getBody().getViewSize().height - (me.y + 100);

    },

// Events -----------------------------------------------------------------------------------------
	onImagePanelRendered: function () {
		var me = this;
		var bdy = this.body;
		bdy.on('mousedown', this.onImagePanelMouseDown, this);
		bdy.on('mouseup', this.onImagePanelMouseUp, this);

		var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
		Ext.each(tb.query('button'), function (btn) {
			btn.on('click', me.onToolbarButtonClicked, me);
		});

		tb.child('slider[xid=zoomlevel]').on('change', this.onZoomlevelChanged, this);
		tb.child('slider[xid=zoomlevel]').on('drag', this.onZoomlevelSelected, this);
		tb.child('slider[xid=zoomlevel]').getEl().on('click', this.onZoomlevelSelected, this);

		this.fireEvent('resize');
	},
	
	onToolbarButtonClicked: function (btn) {
		if (btn.xid == "fit") {
			this.resizeMode = "fit";
		}
		if (btn.xid == "fit-h") {
			this.resizeMode = "fith";
		}
		if (btn.xid == "fit-v") {
			this.resizeMode = "fitv";
		}
		if (btn.xid == "org") {
			this.resizeMode = null;
		}
		if (btn.xid == "fit" || btn.xid == "fit-h" || btn.xid == "fit-v" || btn.xid == "org") {
			this.resize();
		}
		if (btn.xid == "next") {
			this.next();
		}
		if (btn.xid == "prev") {
			this.prev();
		}
		if (btn.xid == "zoom-in") {
			this.zoomIn(10);
		}
		if (btn.xid == "zoom-out") {
			this.zoomOut(10);
		}
	},
	onImagePanelRendered: function () {
		var me = this;
		var bdy = this.body;
		bdy.on('mousedown', this.onImagePanelMouseDown, this);
		bdy.on('mouseup', this.onImagePanelMouseUp, this);

		var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
		Ext.each(tb.query('button'), function (btn) {
			btn.on('click', me.onToolbarButtonClicked, me);
		});
		this.fireEvent('resize');
	},

	onZoomlevelChanged: function (combo, newval) {
		this.zoomLevel = newval;
		var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
		var tbtext = tb.child('tbtext[xid=zoomlevel-text]');
		tbtext.setText(this.zoomLevel + '%');
		this.imageZoom(this.zoomLevel);
	},
	onZoomlevelSelected: function (slider) {
		this.resizeMode = "zoom";
	},

// Methods ZOOM ----------------------------------------------------------------------------------------
	resize: function () {
		if (this.resizeMode == "fit") {
			this.imageFit();
		} else if (this.resizeMode == "fith") {
			this.imageFitHorizontal();
		} else if (this.resizeMode == "fitv") {
			this.imageFitVertical();
		} else if (this.resizeMode == null) {
			this.imageFitNot();
		}
		this.imageZoom(this.zoomLevel);
	},
	imageFit: function () {
		var pwidth = this.panWidth;
		var pheight = this.panHeight;
		var iwidth = this.orgWidth;
		var iheight = this.orgHeight;

		if ((iwidth * pheight / iheight) > pwidth) {
			this.imageFitHorizontal();
		} else {
			this.imageFitVertical();
		}
	},
	imageFitHorizontal: function () {
		var pwidth = this.panWidth;
		var pheight = this.panHeight;
		var iwidth = this.orgWidth;
		var iheight = this.orgHeight;

		if (iwidth >= pwidth) {
			var perc = (100 / iwidth * pwidth);
			var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
			tb.child('slider[xid=zoomlevel]').setValue(perc);
		} else {
			this.imageFitNot();
		}
	},
	imageFitVertical: function (changemode) {
		var pwidth = this.panWidth;
		var pheight = this.panHeight;
		var iwidth = this.orgWidth;
		var iheight = this.orgHeight;

		if (iheight >= pheight) {
			var perc = (100 / iheight * pheight);
			var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
			tb.child('slider[xid=zoomlevel]').setValue(perc);
		} else {
			this.imageFitNot();
		}
	},
	imageZoom: function (level) {
		this.zoomration = level;
		
		var iwidth = this.orgWidth;
		var iheight = this.orgHeight;
		this.child('image').getEl().dom.style.width = parseInt((iwidth / 100 * level)) + "px";
		this.child('image').getEl().dom.style.height = parseInt((iheight / 100 * level)) + "px";
	},
	zoomIn: function (interval) {
		this.resizeMode = "zoom";
		var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
		var slider = tb.child('slider[xid=zoomlevel]');
		var min = slider.minValue;
		var max = slider.maxValue;
		var current = slider.getValue();

		var target = current + interval;
		if (target > max) {
			target = max;
		}

		slider.setValue(target);
	},
	zoomOut: function (interval) {
		this.resizeMode = "zoom";
		var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
		var slider = tb.child('slider[xid=zoomlevel]');
		var min = slider.minValue;
		var max = slider.maxValue;
		var current = slider.getValue();

		var target = current - interval;
		if (target > max) {
			target = max;
		}
		slider.setValue(target);
	},
	imageFitNot: function (changemode) {
		var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
		tb.child('slider[xid=zoomlevel]').setValue(100);
	},
	setImage: function (img) {
		var ip = this.child('image');
		this.setLoading('Loading...');
		ip.setSrc(img);
	},
	
});
