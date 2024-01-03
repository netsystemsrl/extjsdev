//*************************************************************************************************************//
//			DYNAMIC VIEW MAP

Ext.define('dynamicwmsviewmap', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.dynamicwmsviewmap',
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
	
    scrollable: true,

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


	PositionDB: new Array(),
	
	
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'TABLE',
	backgroundImage: '',
	
	valueFieldX: "X",
	valueFieldY: "Y",
	valueFieldH: "H",
	valueFieldTimer: "TIMER",
	valueFieldObject: "OBJ",
	valueFieldIcon: "ICON",
	valueFieldColor: "COLOR",
	valueFieldWeight: "WEIGHT",
	valueFieldImage: "IMAGE",
	valueFieldTooltip: "",
	displayField: 'DESCRIZIONE',
	valueField: 'ID',
	
	valueFieldX1: 10,
	valueFieldY1: 10,
	datasourcefield: 'dynamicwmsviewmap1',
	valueFieldOFFSETX: 0,
	valueFieldOFFSETY: 0,
	valueFieldLockAxis: "",
	
	
	/*RECORD EDITING DEFINITION*/
	layouteditorid:'',
	layouteditorWindowMode: 'acDialog',
	
	//  me.limitStart = ;
	//	me.limitEnd = ;
	scrollX : 0,
	scrollY : 0,
	
	/* add store to obj */
    config: {
        store: 'ext-empty-store'
    },
    publishes: 'store',
    applyStore: function(store) {
        return Ext.getStore(store);
    },
	
	layout : {
		type: 'fit',
		align: 'stretch'
	},
	bodyBorder: false,
	defaults: {
		collapsible: true,
		split: true,
		bodyPadding: 15
	},
	initComponent: function () {
		var me = this;

		this.bbar = [{
				tooltip: 'Fit to window',
				iconCls: 'x-fa fa-arrows-alt',
				xid: 'fit'
			}, {
				tooltip: 'Zoom out',
				iconCls: 'x-fa fa-search-minus',
				xid: 'zoom-out'
			}, {
				xtype: 'slider',
				hidden : ((CurrentDeviceType == 'phone') ? true: false), 
				xid: 'zoomlevel',
				increment: 1,
				minValue: 10,
				maxValue: 200,
				value: 100,
				width: 200
			}, {
				xtype: 'tbtext',
				xid: 'zoomlevel-text',
				width: 40,
				style: 'text-align:right;',
				text: '100%'
			}, {
				tooltip: 'Zoom in',
				iconCls: 'x-fa fa-search-plus',
				xid: 'zoom-in'
			}
		];
		this.items = [
			{
				xtype: 'panel',
				region:'center',
				itemId: 'MyMapPanel',
				name: 'MyMapPanel',
				minWidth: 200,
				closable: false,
				collapsible: false,
				scrollable: {
					y: 'scroll',
					x: 'scroll',
				},
				columnWidth :0.9,
                bodyPadding: 2,
                border: 2,
				layout: {
					type: 'auto'
				},
				
				touchAction: {
					panY: true,
					panX: true,
					body: {
						pinchZoom: true
					}
				},
				listeners: {
					drag: function(e) {
						// handle drag on the panel's main element
					},
					pinch: {
						element: 'body',
						fn: function(e, node) {
							var me = this.component.up('dynamicwmsviewmap');
							me.zoomOut(10);
						}
					},
					DoubleTap: {
						element: 'body',
						fn: function(e, node) {
							var me = this.component.up('dynamicwmsviewmap');
							me.zoomIn(10);
						}
					},
					swipe: {
						element: 'body',
						fn: function(e, node, options, eOpts) {
							var me = this.component.up('dynamicwmsviewmap');
							if(e.direction === 'left') {
								me.scrollX = me.scrollX + 500;
								this.component.body.scrollTo('left',me.scrollX); 
							}
							if(e.direction === 'right') {
								me.scrollX = me.scrollX - 500;
								if (me.scrollX <0) me.scrollX = 0;
								this.component.body.scrollTo('left',me.scrollX); 
							}
							if(e.direction === 'up') {
								me.scrollY = me.scrollY + 500;
								this.component.body.scrollTo('top',me.scrollY); 
							}
							if(e.direction === 'down') {
								me.scrollY = me.scrollY - 500;
								if (me.scrollY <0) me.scrollY = 0;
								this.component.body.scrollTo('top',me.scrollY); 
							}

							//Ext.Msg.alert('swipe', 'direction: ' + e.direction, Ext.emptyFn);
						}
					}
				},
				items: [
					{
						xtype: 'draw',
						itemId: 'MyMap',
						cls: 'MyMap',
						margin: '1 0 0 1',
						minHeight: 100,
						minWidth: 100,
						height: 5000,
						width: 50000,
						x: 0,
						y: 0,
						viewBox: true,
						plugins: ['spriteevents'],
						listeners: {
							spriteclick: function(item, event) {
								console.log ('spriteclick');
								var me = this.up('dynamicwmsviewmap');
								
								var PositionXY = event.xy;
								var X = event.clientX  - me.x;
								var Y = event.clientY  - me.y;
								
								X = parseInt(X / ratiox);
								Y = parseInt(Y / ratioy);
								
								alert ('X:' + X + ' Y:' + Y);
							}
						}
					}
				]
			}
		];
				
		
		for (var i = 0; i < me.MaxMachine; ++i) {
			var Machine = { name:  'name' + i,
							color: me.MachineColorMatrix[i],
							//color: getRandomColor(),
							type:  'muletto',
							positioncount: 0,
							positions: []
							};
			me.PositionDB[i] = Machine;
		}
		
		me.callParent();

		me.on('afterrender', this.onImagePanelRendered, this);
		me.on('resize', this.onPanelResized, this);
		//me.child('draw').on('afterrender', this.onImageRendered, this);
	},

    getSubmitData: function () {
	    var me = this,
            data = null;
        data = {};
        data[me.getName()] = '' + me.text;
        return data;
    },
    setValue: function (value) {
        var me = this;
        console.log('setvalue text in grid=' + value);
        me.text = value;
        me.keyValue = '';
        me.textFilter = value;
		
		//DAFARE
		//me.backgroundImage
		
        if (me.valueField != '') {
            me.localdatawhere = '';
            if (value == undefined) {
                me.localdatawhere = "1=2";
                me.store.proxy.extraParams.datawhere = me.localdatawhere;
                me.store.load();
            } else if ((value != '') && (value != 0)) {
                if (Custom.isNumber(value) == true) {
                    me.localdatawhere = me.valueField + '=' + value;
                } else {
                    me.localdatawhere = me.valueField + "='" + value + "'";
                }
                me.store.proxy.extraParams.datawhere = me.localdatawhere;
                me.store.load();
            } else {
                me.store.load();
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
	
	dataURItoBlob: function (dataURI) {
		// convert base64/URLEncoded data component to raw binary data held in a string
		var byteString;
		if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
		else
			byteString = unescape(dataURI.split(',')[1]);
		// separate out the mime component
		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
		// write the bytes of the string to a typed array
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}
		return new Blob([ia], {
			type: mimeString
		});
	},

	getCoords:	function(c){		
		if (parseInt(c.w) > 0) {
		xsize = 130,
		ysize = 100;

		var rx = xsize / c.w;
		var ry = ysize / c.h;
		$pimg = $('#preview');
		$pimg.css({
			width: Math.round(rx * boundx) + 'px',
			height: Math.round(ry * boundy) + 'px',
			marginLeft: '-' + Math.round(rx * c.x) + 'px',
			marginTop: '-' + Math.round(ry * c.y) + 'px'
		});
		}
	},
	
	// Events -----------------------------------------------------------------------------------------

	onImagePanelRendered: function () {
		var me = this;
		var bdy = this.body;
		//bdy.on('mousedown', this.onImagePanelMouseDown, this);
		//bdy.on('mouseup', this.onImagePanelMouseUp, this);

		var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
		Ext.each(tb.query('button'), function (btn) {
			btn.on('click', me.onToolbarButtonClicked, me);
		});

		tb.child('slider[xid=zoomlevel]').on('change', this.onZoomlevelChanged, this);
		tb.child('slider[xid=zoomlevel]').on('drag', this.onZoomlevelSelected, this);
		tb.child('slider[xid=zoomlevel]').getEl().on('click', this.onZoomlevelSelected, this);

		this.fireEvent('resize');
	},

	onPanelResized: function () {
		this.panWidth = Ext.get(this.body.dom).getWidth() - 20;
		this.panHeight = Ext.get(this.body.dom).getHeight() - 20;
		this.resize();
	},

	onImagePanelMouseDown: function (e) {
		if (e.button == 0) {
			this.mousedowntime = new Date().getTime();
			this.sourceX = this.targetX = e.browserEvent.clientX;
			this.sourceY = this.targetY = e.browserEvent.clientY;
			this.body.on('mousemove', this.onBodyMouseMove, this);
			e.stopEvent();
		}
	},

	onImagePanelMouseUp: function (e) {
		if (e.button == 0) {

			var klicktime = ((new Date().getTime()) - this.mousedowntime);

			if (klicktime < 180 && (this.targetX - this.sourceX) < 5 &&
				(this.targetX - this.sourceX) > -5 && (this.targetY - this.sourceY) < 5 &&
				(this.targetY - this.sourceY) > -5) {
				this.next();
			}

			this.body.un("mousemove", this.onBodyMouseMove, this);

		}
		this.mousedowntime = 0;
	},

	onBodyMouseMove: function (e) {
		this.scrollBy((this.targetX - e.browserEvent.clientX), (this.targetY - e.browserEvent.clientY));
		this.targetX = e.browserEvent.clientX;
		this.targetY = e.browserEvent.clientY;
	},

	onImageChange: function () {
		var tb = this.getDockedItems('toolbar[dock=bottom]')[0];
		tb.child('button[xid=next]').enable();
		tb.child('button[xid=prev]').enable();
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

	onImageRendered: function (img) {
		var me = this;
		img.el.on({
			load: function (evt, ele, opts) {
				ele.style.width = "";
				ele.style.height = "";
				me.orgWidth = Ext.get(ele).getWidth();
				me.orgHeight = Ext.get(ele).getHeight();
				me.resize();
				me.fireEvent('imageloaded');
				if (ele.src != "") {
					me.setLoading(false);
				}
			},
			error: function (evt, ele, opts) {}
		});
		this.prev();
	},

	onRender: function(ct, position){
		dynamicwmsviewmap.superclass.onRender.call(this, ct, position);
		
		var me = this;
		me.maxHeight = Ext.getBody().getViewSize().height - (me.y + 100);
		if (me.hasOwnProperty('height') == false) me.height = Ext.getBody().getViewSize().height - (me.y + 100);
		
		this.store.on('load', this.storeLoad, this);
    },
	storeLoad: function(){
		var me = this;
		var allRecords = me.store.snapshot || me.store.data;
		var items = allRecords.items;
		
		var MyMap = me.down('draw');
		if (MyMap == undefined) return;
		var mainSurface = MyMap.getSurface();
		mainSurface.removeAll();
	
		var myImagea  = new Image();
		myImagea.addEventListener('load', function () {
			var width = myImagea.width,
				height = myImagea.height;
			var myImage = new Ext.draw.sprite.Image({
				src: '/includes/io/CallFile.php?fileid=' + me.backgroundImage,
				x: 0,
				y: 0,
				width: myImagea.width,
				height: myImagea.height,
				draggable: false
			});	
			mainSurface.add(myImage);
			MyMap.setWidth(myImagea.width);
			MyMap.setHeight(myImagea.height);
		
			
			var allRecords = me.store.snapshot || me.store.data;
			var items = allRecords.items;
			var coeff = 4.98;
			for (index = 0; index < items.length; ++index) {
				var record = items[index];
				if ((record.data[me.valueFieldIcon]) == 'circle'){
					if (record.data[me.valueFieldLockAxis]== 'Y'){
						var udcaxis = {
							type: 'rect',
							id: 'udcaxis-' + record.data[me.keyField],
							name: 'udcaxis-' + record.data[me.keyField],
							itemId: 'udcaxis-' + record.data[me.keyField],
							x: (record.data[me.valueFieldX] + record.data[me.valueFieldOFFSETX]) * coeff,
							y: ( record.data[me.valueFieldOFFSETY]) * coeff,
							width: parseInt(record.data[me.valueFieldX1])  * coeff,
							height: parseInt(record.data[me.valueFieldY1])  * coeff,
							lineWidth: 1,
							draggable: false,
							strokeStyle: 'black'
						};
						PositionDraw = mainSurface.add(udcaxis);
					}
					var udc = {
						type: 'circle',
						id: 'udc-' + record.data[me.keyField],
						name: 'udc-' + record.data[me.keyField],
						itemId: 'udc-' + record.data[me.keyField],
						cx: (record.data[me.valueFieldX] + record.data[me.valueFieldOFFSETX]) * coeff,
						cy: (record.data[me.valueFieldY] + record.data[me.valueFieldOFFSETY]) * coeff,
						r: 1  * coeff,
						lineWidth: 1,
						draggable: false,
						strokeStyle: 'black',
						fillStyle: record.data[me.valueFieldColor]
					};
				}else{
					var udc = {
						type: 'rect',
						id: 'udc-' + record.data[me.keyField],
						name: 'udc-' + record.data[me.keyField],
						itemId: 'udc-' + record.data[me.keyField],
						x: (record.data[me.valueFieldX] + record.data[me.valueFieldOFFSETX]) * coeff,
						y: (record.data[me.valueFieldY] + record.data[me.valueFieldOFFSETY]) * coeff,
						width: parseInt(record.data[me.valueFieldX1])  * coeff,
						height: parseInt(record.data[me.valueFieldY1])  * coeff,
						lineWidth: 1,
						draggable: false,
						strokeStyle: 'black',
						fillStyle: record.data[me.valueFieldColor]
					};
				}
				
				PositionDraw = mainSurface.add(udc);
				//me.UDCS['udc-' + [me.keyField]] = record.data;
			}
			mainSurface.renderFrame();
			me.imageZoom(me.zoomLevel);
		});

		//myImagea.src = '/includes/io/CallFile.php?fileid=' + me.backgroundImage;
		myImagea.src = CurrentUser.UserArchive + 'repository/'+ me.backgroundImage;
			
	},
	
	//Map Draw ----------------------------------------------------------------------------------------
	
	getRandomColor: function () {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
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
		var me = this;
		this.zoomLevel = level;
		
		var MyMap = me.down('draw');
		var mainSurface = MyMap.getSurface(); 
		var mainSurfaceItems = mainSurface.getItems();
		
		Ext.each(mainSurfaceItems || [], function(item) {
		
			item.setAttributes({scalingX: level/100, scalingY: level/100, scalingCenterX: 0, scalingCenterY: 0});

        }, this);
		
		mainSurface.renderFrame()
		
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
		var ip = this.child('draw');
		this.setLoading('Loading...');
		ip.setSrc(img);
	},
	
	// Methods CROP SELECT ----------------------------------------------------------------------------------------

	getResultPosition: function () {
		var me = this;
		var parent = me.getBox();
		var myImage = me.down('image');
		var img = myImage.getBox();
		var res = {
			x: (img.x - parent.x),
			y: (img.y - parent.y),
			width: img.width,
			height: img.height
		};
		myImage.setStyle({
			'background-position': (-res.x) + 'px ' + (-res.y) + 'px'
		});
		return res;
	},
	getCropData: function () {
		return this.getResultPosition();
	},
	
	/**
	 * Returns the Calculated Size of the Image.
	 *
	 * @param {Number} width Original Width of the Image
	 * @param {Number} height Original Height of the Image
	 * @param {Number} maxWidth The maximum width that is allowed for Resize.
	 * @param {Number} maxHeight The Maximum height that is allowed for Resize.
	 */
	imageSize: function (width, height, maxWidth, maxHeight) {
		var newHeight = width,
		newWidth = height,
		shouldResize = width > maxWidth || height > maxHeight;

		if (width > height) {
			newHeight = height * (maxWidth / width);
			newWidth = maxWidth;
		} else {
			newWidth = width * (maxHeight / height);
			newHeight = maxHeight;
		}
		return {
			width: newWidth,
			height: newHeight,
			shouldResize: shouldResize
		};
	}
});
