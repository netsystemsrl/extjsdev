//*************************************************************************************************************//
//			DYNAMIC MAP

Ext.define('dynamicwmsmap', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.dynamicwmsmap',
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
	scaledrawzoom:1,
	
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

	localMediaStream: null,
	videoON: false,
	imageloaded:false,
	imageWidth: 0,
	imageHeight: 0,
	
	MaxMachine: 255,
	MachineColorMatrix: {	1:"red", 
							2:"green", 
							3:"yellow", 
							4:"blue", 
							5:"yellow", 
							6:"red", 
							7:"blue", 
							8:"green", 
							9:"red",
							10:"blue",
							241:"blue",
							242:"red", 
							243:"green", 
							244:"yellow", 
							245:"blue",
							246:"yellow", 
							254:"red", 
							253:"green", 
							252:"yellow", 
							251:"blue"
						},
	PositionDB: new Array(),
	EventDB: new Array(),
	
	
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'TABLE',
	valueFieldX: "X",
	valueFieldY: "Y",
	valueFieldTimer: "TIMER",
	valueFieldObject: "OBJ",
	valueFieldPallet: "PALLET",
	valueFieldWeight: "WEIGHT",
	valueFieldImage: "IMAGE",
	valueFieldTooltip: "",
	
	refreshPosition : 0,
	
	actionProcessCalc: 1730,
	
	displayField: 'DESCRIZIONE',		
	iconField: '',
	imageField:'',
	datasourcefield: 'dynamicwmsmap1',
	defaultValue: '',
	
	
	backgroundImage: '',
	globalStartTime: '',
	globalEndTime: '',
	
	/*RECORD EDITING DEFINITION*/
	layouteditorid:'',
	layouteditorWindowMode: 'acDialog',
	
	//   me.limitStart = ;
	//	me.limitEnd = ;
	
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
	layout : 'border',
	bodyBorder: false,
	defaults: {
		collapsible: true,
		split: true,
		bodyPadding: 15
	},
	initComponent: function () {
		var me = this;

		me.bbar = [{
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
			},{
                itemId: 'RefreshBtn',
                pressed: false,
                enableToggle: false,
                tooltip: 'Aggiorna',
                iconCls: 'x-fa fa-refresh',
                cls: 'x-btn-text-icon',
                handler: function (button, event) {
                    var me = button.up('dynamicwmsmap');
                    CurrentPanel = me.up('panel');

                    var curTabPanel = CurrentPanel.up('tabpanel');
                    if ((curTabPanel != undefined) && (curTabPanel != null)) {
                        CurrentPanel = curTabPanel.up('panel');
                    }

                    if (CurrentPanel.name == 'DesignPanel') {
                        CurrentWindow = MainViewPort.getComponent('centerViewPortId');
                    } else {
                        CurrentWindow = CurrentPanel.up('window');
                        CurrentPanel = CurrentWindow.down('form');
                    }
                    CurrentToolBar = CurrentWindow.getComponent('toolbar');
                    CurrentPanelRaw = CurrentPanel.definitionraw;
                    if (me.localdatawhere != '') {
                        me.getStore().reload({
                            params: {
                                datawhere: me.localdatawhere
                            }
                        });
                    } else {
                        me.getStore().reload();
                    }
                }
            }
		];
		me.items = [
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
								var me = this.up('dynamicwmsmap');
								
								var myImage = me.down('image');
								var myImg = myImage.el.dom;
								var width = myImg.naturalWidth; //595
								var height = myImg.naturalHeight; //842
								
								var MyDefinition = me.getComponent('MyDefinition')
								var ID = MyDefinition.getComponent('DYNWMSID');
								var TIMER = MyDefinition.getComponent('DYNWMSTIMER');
								var POSIZIONE = MyDefinition.getComponent('DYNWMSPOSIZIONE');
								var WEIGHT = MyDefinition.getComponent('DYNWMSWEIGHT');
								var MACHINE = MyDefinition.getComponent('DYNWMSMACHINE');
								var TOOLTIP = MyDefinition.getComponent('DYNWMSTOOLTIP');
								var IMMAGINE = MyDefinition.getComponent('DYNWMSIMMAGINE');
								
								console.log(item, 'clicked');
								
								var EventDBLen = me.EventDB.length;
								for (i = 0; i < EventDBLen; i++) {
									if (item.sprite.id == me.EventDB[i].objext.id){
										ID.setValue(me.EventDB[i].ID);
										TIMER.setValue(me.EventDB[i].time);
										POSIZIONE.setValue(me.EventDB[i].x + ' - ' + me.EventDB[i].y);
										MACHINE.setValue(me.EventDB[i].machine);
										WEIGHT.setValue(me.EventDB[i].machine);
										TOOLTIP.setValue(me.EventDB[i].tooltip);
										IMMAGINE.setSrc('/repositorycom/pallet6.png');
										break
									}
								}
							
								var ratiox =  me.zoomration / 100;
								var ratioy =  me.zoomration / 100;
									
								var PositionXY = event.xy;
								var X = event.clientX  - me.x;
								var Y = event.clientY  - me.y;
								
								X = parseInt(X / ratiox);
								Y = parseInt(Y / ratioy);
								
								//	selectedRowDataString =  me.text + '&';
								//	selectedRowDataString += me.name + '_X1' + '=' + parseInt(c.x / ratiox) + '&';
								//	selectedRowDataString += me.name + '_Y1' + '=' + parseInt(height - (c.y / ratioy)) + '&';
								//	selectedRowDataString += me.name + '_X2' + '=' + parseInt(c.x2 / ratiox) + '&';
								//	selectedRowDataString += me.name + '_Y2' + '=' + parseInt(height - (c.y2 / ratioy)) + '&';
									
								alert ('X:' + X + ' Y:' + Y);
							}
						}
					}
				]
			}, {
				xtype: 'panel',
				region:'east',
				title: 'Definition',
				itemId: 'MyDefinition',
				minWidth: 200,
				closable: false,
				collapsible: true,
				columnWidth :0.1,
                bodyPadding: 2,
                border: 2,
				layout: {
					type: 'vbox',
					align : 'stretch',
					pack  : 'start'
				},
				items: [
					{
						xtype: 'panel',
						itemId: 'MyRange',
						margin: 2,
						//bodyPadding: 2,
						border: 2,
						layout: {
							type: 'vbox',
							align : 'stretch',
							pack  : 'start'
						},
						items: [
							{
								"xtype": "multislider",
								"itemId": 'wmsmultislider',
								"width": 300,
								//"values": [0, 60, 120, 240],
								"values": [50,60],
								"maxValue": 200,
								"minValue": 1,
								"minRange": 4,
								"increment": 5,
								//"constrainThumbs": false,
								
								listeners: {
									afterrender: function(t, options) {
										var me = this.up('dynamicwmsmap');
										me.canvasDraw('multislider');
										me.WriteSliderValue(t, options);
										me.updateinfoMultiSlider(t, options);
									},
									change: function(t, options) {
										var me = this.up('dynamicwmsmap');
										me.canvasDraw('multislider');
										me.WriteSliderValue(t, options);
										me.canvasDraw('multislider');
										me.updateinfoMultiSlider(t, options);
									},
								}
								
							},{
								"xtype": 'panel',
								"bodyStyle": '',
								"height": 100,
								"html":'<div id="infoMultiSlider"></div>',
								"itemId": 'infoMultiSlider'
							},
							{
								"xtype": "sliderRanges",
								"itemId": 'slider',
								"width": 300,
								//"values": [0, 60, 120, 240],
								"values": [50,60],
								"maxValue": 200,
								"minValue": 1,
								"minRange": 4,
								"hidden": true,
								"generateTitle": function (n) {
									var title;
									if (n % 2 === 0) {
										//title = "EVEN " + Math.ceil(n / 2);
										title = "RANGE " + Math.ceil(n / 2);
									} else {
										//title = "ODD " + Math.ceil(n / 2);
										title = " " + Math.ceil(n / 2);
									}
									return title;
								},
								listeners: {
									//render: function (n) {me.MockTable();},
									//resize: function (n) {me.MockTable();},
									afterrender: function(t, options) {
										//me.WriteSliderValue(t, options);
										var me = this.up('dynamicwmsmap');
										me.canvasDraw('multislider');
										me.updateinfoRange();
									},
									dragend: function(t, options) {
										//me.WriteSliderValue(t, options);
										//me.storeLoad();
									},
									change: function(t, options) {
										//me.WriteSliderValue(t, options);
										var me = this.up('dynamicwmsmap');
										me.canvasDraw('multislider');
										me.canvasDraw('rangeslider');
										me.updateinfoRange();
									},
								}
							},/*{
								"xtype": 'component',
								"itemId": 'gridRange',
								"tag": "div",
								"bodyStyle": '',
								"height": 100,
								"html":'<div id="grid"></div>',
							},*/{
								"xtype": 'panel',
								"bodyStyle": '',
								"height": 150,
								"hidden": true,
								"html":'<div id="infoRange"></div>',
								"itemId": 'infoRange'
							},{
								"bodyStyle": 'clear: both;',
								"html":'',
								"itemId": 'filler1'
							}
						]
					},{
						xtype: "textfield",
						width: 300,
						itemId: "DYNWMSID",
						fieldLabel: "ID"
					},{
						xtype: "textfield",
						width: 300,
						itemId: "DYNWMSTIMER",
						fieldLabel: "TIMER"
					},{
						xtype: "textfield",
						width: 300,
						itemId: "DYNWMSPOSIZIONE",
						fieldLabel: "POSIZIONE"
					},{
						xtype: "textfield",
						width: 300,
						itemId: "DYNWMSWEIGHT",
						fieldLabel: "WEIGHT"
					},{
						xtype: "textfield",
						width: 300,
						itemId: "DYNWMSMACHINE",
						fieldLabel: "MACHINE"
					},{
						xtype: "textfield",
						width: 300,
						itemId: "DYNWMSTOOLTIP",
						fieldLabel: "TOOLTIP"
					},{
						xtype: "image",
						width: 300,
						itemId: "DYNWMSIMMAGINE"
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

	initValue: function () {
		me.backgroundImage = this.value;
		this.setValue(this.value);
	},
	setValue: function (new_value) {
		var me = this;
		me.text = new_value;
		me.backgroundImage = new_value;
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

	//Obj Draw
	
	onRender: function(ct, position){
		dynamicwmsmap.superclass.onRender.call(this, ct, position);
		
		var me = this;
		me.maxHeight = Ext.getBody().getViewSize().height - (me.y + 100);
		if (me.hasOwnProperty('height') == false) me.height = Ext.getBody().getViewSize().height - (me.y + 100);
		
		/* refreshPosition */
		if (me.refreshPosition > 0 ){
			var task = Ext.TaskManager.start({
				run: function () {
										var CurrentToolBarWms = me.down('toolbar');
										var RefreshBtn = CurrentToolBarWms.getComponent('RefreshBtn');
										//RefreshBtn.fireEvent('click', RefreshBtn);
										me.getStore().reload();
									},
				interval: 3000
			});
		}
		
		this.store.on('load', this.storeLoad, this);
    },
	storeLoad: function(){
		var me = this;
		var allRecords = me.store.snapshot || me.store.data;
		var items = allRecords.items;
		me.imageloaded = false;
		me.SliderDraw(Math.floor(new Date(items[0].data[me.valueFieldTimer]).getTime() / 1000),Math.floor(new Date(items[items.length - 1].data[me.valueFieldTimer]).getTime() / 1000));
		me.imageloaded = true;
		me.canvasDraw();
	},
	
	storeFilter: function(){
		//Aggiorna STORE
		//pero va chiamato solo se cambi lo slider... 
		var limitStart = "'2018-11-11'";
		var limitEnd = "'2018-11-13'";
		me.store.clearFilter();
		me.remoteSearch = true;
		var remoteFilterStart = new Ext.util.Filter({
			id: 'innerSearch',
			property: me.valueFieldTimer,
			type: 'strings',
			operator: 'gt',
			value: limitStart   //<---  2019-01-08
		});
		me.store.addFilter(remoteFilterStart);
		var remoteFilterEnd = new Ext.util.Filter({
			id: 'innerSearch',
			property: me.valueFieldTimer,
			type: 'strings',
			operator: 'lt',
			value: limitEnd     //<---  2019-01-08
		});
		me.store.addFilter(remoteFilterEnd);
		// qery che genera lo store verso la dataread.php     query: [{"operator":"gt","value":"2019-01-08","property":"DOCDATA"}]

	},
	
	canvasDraw: function(filterSourceTxt = ""){
		var me = this;
		var MyMap = me.down('draw');
		var mainSurface = MyMap.getSurface(); 
		
		if (me.backgroundImage == '') return;
		if (me.imageloaded == false) return;
		
		var myPoints = [];
		var allRecords = me.store.snapshot || me.store.data;
		var items = allRecords.items;		var timerstartDate;
		var timerDate;
		var MachineId;
		var MachineColor;
		var record,recordPrev;
		var Position;
		var PositionDraw;
		var imagesrc;
		var MyDefinition = me.getComponent('MyDefinition');
		var MyRange = MyDefinition.getComponent('MyRange');
		var rangeslider = MyRange.getComponent('slider');
		//var infoRange = MyRange.getComponent('infoRange');
		var multislider = MyRange.getComponent('wmsmultislider');
		
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
			
			// PATH
			var curOpacity = 0.5;
			for (index = 0; index < items.length; ++index) {
				record = items[index];
				
				MachineId = record.data[me.valueFieldObject];
				MachineColor = me.MachineColorMatrix[MachineId];
				//timerDate = new Date(record.data[me.valueFieldTimer]);
				timerDate = Math.floor(new Date(record.data[me.valueFieldTimer]).getTime() / 1000);
				
				//filtra lo store per i valori del multislider
				//TODO: implementare con me.storeFilter()
				if(filterSourceTxt == "rangeslider") {
					filterSource = rangeslider;
				} else if(filterSourceTxt == "multislider") {
					filterSource = multislider;
				} else {
					filterSource = false;
				}
				
				if(filterSource && filterSource.getValues().length > 1) {
					//console.log(filterSource.getValues());
					if(timerDate < filterSource.getValues()[1] || timerDate > filterSource.getValues()[2]) { 
						//console.log(record.data);
						continue;
					}
				}
				
				if (index == 1){
					//timerstartDate = new Date(record.data[me.valueFieldTimer]);
					timerstartDate = Math.floor(new Date(record.data[me.valueFieldTimer]).getTime() / 1000);
				}
				
				if ((index < items.length -1) && (items[index].data[me.valueFieldObject] == items[index+1].data[me.valueFieldObject])){
					//DRAW point line
					recordNext = items[index +1];
					
					var point1 = {
						X: parseFloat(record.data[me.valueFieldX] ),
						Y: parseFloat(record.data[me.valueFieldY] )
					};
					var point2 = {
						X: parseFloat(recordNext.data[me.valueFieldX ]),
						Y: parseFloat(recordNext.data[me.valueFieldY ])
					};
					
					//TIME BREAK
					var line = {};
					if ( 		((Math.floor(new Date(recordNext.data[me.valueFieldTimer]).getTime()) - Math.floor(new Date(record.data[me.valueFieldTimer]).getTime())) < 100000 )
							&& 	(Math.abs(point1.X - point2.X) < 500 ) 
							&& 	(Math.abs(point1.Y - point2.Y) < 500 )
						){ 
						curOpacity = curOpacity + 0.01
						line = {
							type: 'path',
							path: 'M' + point1.X + ' ' + point1.Y + ' ' +
								  'L' + point2.X + ' ' + point2.Y + ' ',
							strokeStyle: MachineColor,
							fillStyle: MachineColor,
							lineWidth: 2,
							opacity: curOpacity
						};
						PositionDraw = mainSurface.add(line);
					}else{
						curOpacity = 0.5;
						startline = {
							type: 'circle',
							cx:  point2.X ,
							cy:	 point2.Y ,
							r: 5,
							strokeStyle: MachineColor,
							fillStyle: MachineColor,
							lineWidth: 2,
							opacity: 1
						};
						PositionDraw = mainSurface.add(startline);
					}	
				}else{
					startline = {
						type: 'circle',
						cx:  parseFloat(record.data[me.valueFieldX] ) ,
						cy:	 parseFloat(record.data[me.valueFieldY] ) ,
						r: 5,
						strokeStyle: MachineColor,
						fillStyle: MachineColor,
						lineWidth: 2,
						opacity: 1
					};
					PositionDraw = mainSurface.add(startline);
				}
					
				//SAVE POSITION - CREATE PositionDB
				Position = {time:    record.data[me.valueFieldTimer],
							machine: record.data[me.valueFieldObject],
							x:       record.data[me.valueFieldX], 
							y:       record.data[me.valueFieldY],
							pallet:  record.data[me.valueFieldPallet],
							weight:  record.data[me.valueFieldWeight],
							image:   record.data[me.valueFieldImage],
							tooltip: record.data[me.valueFieldTooltip],
							objext:  PositionDraw
							};
				
				me.PositionDB[MachineId].positions.push(Position);
				me.PositionDB[MachineId].positioncount = me.PositionDB[MachineId].positioncount +1;
				
				//EVENT START
				if (me.PositionDB[MachineId].positioncount == 1){
					me.EventDB.push(Position);
				}
				
				//DRAW START STOP
				if (me.PositionDB[MachineId].positioncount > 1){
					PositionPrev = me.PositionDB[MachineId].positions[me.PositionDB[MachineId].positioncount-2];								
					if (
						((PositionPrev.pallet == 0) && (Position.pallet == 1)) ||
						((PositionPrev.pallet == 1) && (Position.pallet == 0))
						){
						//DRAW Image
						imagesrc = "repositorycom/" + record.data[me.valueFieldImage] + '_' + record.data[me.valueFieldPallet] + '.png';	
						PositionDraw = mainSurface.add({
							type: 'image',
							src: imagesrc,
							width: 32,
							height: 25,
							//anchor: "100% 100%",
							x: Position.x,
							y: Position.y,
							draggable: false
						});
						Position = {	time:    record.data[me.valueFieldTimer],
										machine: record.data[me.valueFieldObject],
										x:       record.data[me.valueFieldX], 
										y:       record.data[me.valueFieldY],
										pallet:  record.data[me.valueFieldPallet],
										weight:  record.data[me.valueFieldWeight],
										image:   record.data[me.valueFieldImage],
										tooltip: record.data[me.valueFieldTooltip],
										objext:  PositionDraw
										};
						me.EventDB.push(Position);
						
					}				
				}
			
			};

			mainSurface.renderFrame();
			me.imageZoom(me.zoomLevel);
		});

		myImagea.src = '/includes/io/CallFile.php?fileid=' + me.backgroundImage;
			
		
	},
	
	//RANGE slider ----------------------------------------------------------------------------------------
	WriteSliderValue: function(t, options) {
		for(i=0; i<t.thumbs.length; i++){
			var thumbElId = t.thumbs[i].el.id;
			var thumbTimeValue = new Date(t.thumbs[i].value*1000).toLocaleTimeString();
			Ext.DomHelper.overwrite(thumbElId,
				{
					tag: 'div',
					id: 'thumb-label-'+i,
					cls: 'thumb-label',
					html: thumbTimeValue,
				}
			);
		}
	},
	
	updateinfoMultiSlider: function(t, options) {
		txt = "<p>";
		for(i=0; i<t.thumbs.length; i++){
			txt += ""+new Date(t.thumbs[i].value*1000)+"<br>"
		}
		txt += "</p>";
		Ext.fly('infoMultiSlider').update(txt);
	},	
	
	MockTable: function () {
		//create mock table
		var me = this;
		var MyDefinition = me.getComponent('MyDefinition');
		var MyRange = MyDefinition.getComponent('MyRange');
		var slider = MyRange.getComponent('slider');
		var gridRange = MyRange.getComponent('gridRange')
		//var w = slider.getScreenWidth();
		var w = slider.getWidth();
		var size = 11;
		if (w <= 1600) {
			size = 10;
		}
		if (w <= 1400) {
			size = 9;
		}

		if (w <= 800) {
			size = 8;
		}
		
		var colWidth = 16;
		var colHeight = 40;
		var width = ( slider.maxValue - slider.minValue + 1) * colWidth;

		/*
		gridRange.items.each(function(item, index, len) {
            item.destroy();
        });
		*/
		
		//gridRange.body.update('');
		
		for (var i = slider.minValue; i <= slider.maxValue; i++) {
			var sfx = i % 2 === 0 ? "even" : "odd";
			Ext.get('grid').createChild({
				tag: 'div',
				style: 'float: left; font-size: ' + size + 'px; height: ' + colHeight + 'px; width: ' + colWidth + 'px;',
				cls: sfx,
				html: "<div class='_270'>" + Ext.String.leftPad((i), 3, '0') + "</div>"
			});
		}

		Ext.get('grid').setStyle("width", width + "px");
	},
	
	SliderDraw: function (timerstartDate,timerendDate) {
		var me = this;
		var MyDefinition = me.getComponent('MyDefinition');
		var MyRange = MyDefinition.getComponent('MyRange');
		
		var slider = MyRange.getComponent('slider');
		var infoRange = MyRange.getComponent('infoRange');
		var multislider = MyRange.getComponent('wmsmultislider');
		
		//bordi allungati di 1 ora per lato
		/*
		timerstartDate.setHours( timerstartDate.getHours() - 1);
		timerendDate.setHours( timerendDate.getHours() + 1);
		*/
		
		//multislider.addThumb(timerstartDate);
		multislider.minValue = timerstartDate;
		multislider.maxValue = timerendDate;
		slider.minValue = timerstartDate;
		slider.maxValue = timerendDate;
		
		//multislider.removeThumb(0);
		//slider.removeThumb(0);
		multislider.setValue(0, timerstartDate);
		slider.setValue(0, timerstartDate);
		multislider.setValue(1, timerendDate);
		slider.setValue(1, timerendDate);
		
		//multislider.addThumb(timerstartDate);
		//multislider.addThumb(timerendDate);
		//slider.addThumb(timerstartDate);
		//slider.addThumb(timerendDate);
		
		me.updateinfoRange();
		/*
		slider.on('dragend',
			function () {
				me.updateinfoRange();
			}
		);
		*/
	},
	
	updateinfoRange: function () {
		var me = this;
		var MyDefinition = me.getComponent('MyDefinition');
		var MyRange = MyDefinition.getComponent('MyRange');
		
		var slider = MyRange.getComponent('slider');
		var ranges = slider.getRanges(),
			total = 0,
			r,
			i,
			txt = "<p>";

		txt += "<table><thead><td class='text-left'>Range</td><td>From</td><td>To</td><td>Length</td></thead>";
		for (i in ranges) {
			r = ranges[i];
			from = new Date(r.from*1000).toLocaleTimeString();
			to = new Date(r.to*1000).toLocaleTimeString();
			//length = new Date(r.length*1000).toMinutes();
			txt += "<tr><td class='text-left'>" + r.range + "</td><td>" + r.from + "</td><td>" + r.to + "</td><td>" + r.length + "</td></tr>";
			total += r.length;

		}
		txt += "<tr><td class='text-left'><b>TOTAL</b></td><td></td><td></td><td>" + total + "</td></tr>";
		txt += "</table>";
		
		Ext.fly('infoRange').update(txt);
		/*
		Ext.fly('colHeight').update(colHeight);
		Ext.fly('maxValue').update(maxValue);
		Ext.fly('maxValue1').update(maxValue);
		Ext.fly('minValue').update(minValue);
		Ext.fly('minRange').update(minRange);
		Ext.fly('minRange1').update(minRange);
		Ext.fly('width').update(width);
		*/
		//Aggiorna STORE
		//pero va chiamato solo se cambi lo slider... 
		/*
		var limitStart = "'2018-11-11'";
		var limitEnd = "'2018-11-13'";
		me.store.clearFilter();
		me.remoteSearch = true;
		var remoteFilterStart = new Ext.util.Filter({
			id: 'innerSearch',
			property: me.valueFieldTimer,
			type: 'strings',
			operator: 'gt',
			value: limitStart   //<---  2019-01-08
		});
		me.store.addFilter(remoteFilterStart);
		var remoteFilterEnd = new Ext.util.Filter({
			id: 'innerSearch',
			property: me.valueFieldTimer,
			type: 'strings',
			operator: 'lt',
			value: limitEnd     //<---  2019-01-08
		});
		me.store.addFilter(remoteFilterEnd);
		*/
		// qery che genera lo store verso la dataread.php     query: [{"operator":"gt","value":"2019-01-08","property":"DOCDATA"}]

		//infoRange.update(txt);
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


//*************************************************************************************************************//
//			sliderRanges
Ext.define('ThumbRange', {
    extend: 'Ext.slider.Thumb',
	alias: 'widget.ThumbRange',
	/*
    onDrag: function (e) {
        me = this,
            slider = me.slider,
            index = me.index,
            //newValue = parseInt(me.getValueFromTracker()),
			//newValue = parseInt(me.slider.width);
			newValues = [],
			
            //aboveValue,
            //belowValue,
            //above,
            //below
	 

        if (newValue !== undefined) {

            above = slider.thumbs[index + 1];
            below = slider.thumbs[index - 1];
            aboveValue = above ? parseInt(above.value) : slider.maxValue;
            belowValue = below ? parseInt(below.value) : slider.minValue - 1;


            if (newValue <= belowValue + slider.minRange) {
                newValue = belowValue + slider.minRange;
            }
            if (newValue >= aboveValue - slider.minRange) {
                newValue = aboveValue - slider.minRange
            }


			//console.log(newValue);
			//console.log('====');

            slider.setValue(index, newValue, false);
            slider.fireEvent('drag', slider, e, me);
        }
    },*/
	updateValues: function (values, animate, supressEvents) {
        var me = this,
            len = values.length,
            thumbs = me.thumbs,
            thumbLen = thumbs.length,
            newValues = [],
            skipEvents = me.initializingValues || supressEvents,
            i, thumb, value, addLen, removeLen;
        
        for (i=0; i<len; i++) {
            thumb = thumbs[i];
            value = values[i];
 
            if (thumb) {
                me.setValue(i, value, animate);
            } else {
                newValues.push(value);
            }
        }
 
        if (me.thumbPerValue || me.initializingValues) {
            addLen = newValues.length;
            removeLen = thumbLen - len;
 
 
            for (i=0; i<addLen; i++) {
                value = newValues[i];
 
                if (skipEvents || me.fireEvent('beforechange', me, value, null, null, 'add') !== false) {
                    thumb = me.addThumb(me.normalizeValue(value));
                    
                    if (!skipEvents) {
                        me.fireEvent('change', me, value, thumb, 'add');
                    }
                    me.checkDirty();
                }
            }
 
            for (i=0; i<removeLen; i++) {
                thumb = thumbs[thumbs.length-1];
 
                if (skipEvents || me.fireEvent('beforechange', me, null, thumb.value, thumb, 'remove') !== false) {
                    me.removeThumb(thumb);
 
                    if (!skipEvents) {
                        me.fireEvent('change', me, null, null, 'remove');
                    }
                    me.checkDirty();
                }
            }
        }
 
        return me;
    }
});

Ext.define('sliderRanges', {
    extend: 'Ext.slider.Multi',
	alias: 'widget.sliderRanges',
    cls: "x-slider-range",
    headerPrefix: "-x-slider-range-header-",
    useTips: false,
    //todo clickToChange some day
    clickToChange: false,
    increment: 1,
    minRange: 1,
    minValue: 1,
    maxValue: 100,
    colWidth: 14,
    width: "100%",
    // note: {id} here is really {inputId}, but {cmpId} is available
    fieldSubTpl: [
		/*
            '<div id="{id}" class="' + Ext.baseCSSPrefix + 'slider {fieldCls} {vertical}',
        '{childElCls}',
        '" aria-valuemin="{minValue}" aria-valuemax="{maxValue}" aria-valuenow="{value}" aria-valuetext="{value}">',
            '<div id="{cmpId}-endEl" class="' + Ext.baseCSSPrefix + 'slider-end" role="presentation">',
            '<div id="{cmpId}-innerEl" class="' + Ext.baseCSSPrefix + 'slider-inner" role="presentation">',
        '{%this.renderThumbs(out, values)%}',
        '</div>',
        '</div>',
        '</div>',
		*/
        '<div id="{id}" data-ref="inputEl" {inputAttrTpl}',
            ' class="', Ext.baseCSSPrefix, 'slider {fieldCls} {vertical}',
            '{childElCls}"',
            '<tpl if="tabIdx != null"> tabindex="{tabIdx}"</tpl>',
            '<tpl foreach="ariaElAttributes"> {$}="{.}"</tpl>',
            '<tpl foreach="inputElAriaAttributes"> {$}="{.}"</tpl>',
            '>',
            '<div id="{cmpId}-endEl" data-ref="endEl" class="' + Ext.baseCSSPrefix + 'slider-end" role="presentation">',
                '<div id="{cmpId}-innerEl" data-ref="innerEl" class="' + Ext.baseCSSPrefix + 'slider-inner" role="presentation">',
                    '{%this.renderThumbs(out, values)%}',
                '</div>',
            '</div>',
        '</div>',
		{
            renderThumbs: function (out, values) {
                var me = values.$comp,
                    i = 0,
                    thumbs = me.thumbs,
                    len = thumbs.length,
                    headerConfig,
                    headerCnt = 0,
                    bgPosition = me.getThumbBgPosition(),
                    thumb,
                    thumbConfig;

                //prepend header before first thumb
                headerConfig = {
                    cls: "x-slider-range-header-odd",
                    id: me.id + me.headerPrefix + headerCnt
                };
                Ext.DomHelper.generateMarkup(headerConfig, out);

                for (; i < len; i++) {
                    thumb = thumbs[i];
                    thumbConfig = thumb.getElConfig();
                    thumbConfig.id = me.id + '-thumb-' + i;
                    //fix for different resolutions
                    thumbConfig.style["backgroundPosition"] = bgPosition + "px 0";
                    Ext.DomHelper.generateMarkup(thumbConfig, out);

                    headerCnt += 1;
                    headerConfig = {
                        cls: headerCnt % 2 === 0 ? "x-slider-range-header-odd" : "x-slider-range-header-even",
                        id: me.id + me.headerPrefix + headerCnt
                    };

                    Ext.DomHelper.generateMarkup(headerConfig, out);
                }
            },
            disableFormats: true
        }
    ],
    listeners: {
        afterrender: function (el, newVal, thumb) {
            // console.log("afterrender");
            el.rebuildHeaders();
        },

        change: function (el, newVal, thumb) {
            // console.log("change");
            el.rebuildHeaders();
        }
    },

    initComponent: function () {
        this.totalRange = this.maxValue - this.minValue;

        if (this.width && this.totalRange){
            this.colWidth = this.width / (this.totalRange + 1);
        }
        this.callParent(arguments);
    },

    validateRanges: function () {
        var me = this,
            element,
            errors = "",
            elementPrev,
            i;

        if (!me.minRange) {
            errors += "No positive minRange found\n\r";
        }


        if (!me.values) {
            errors += "No initial values found in config\n\r";
        }

        //check ranges validity
        //for (i in me.values) {
		for (i in me.getValues()) {
            //elementPrev = me.values[i - 1] ? me.values[i - 1] : 0;
            //element = me.values[i];
			values = me.getValues();
            elementPrev = values[i - 1] ? values[i - 1] : 0;
            element = values[i];

            if ((element - elementPrev) < me.minRange) {
                errors += elementPrev + "..." + element + " range is less than minRange\n\r";
            }

            if (element < this.minValue || element > this.maxValue) {
                errors += element + " is out of range\n\r";
            }
        }

        //check last range validity
        if ((me.maxValue - element) < me.minRange) {
            errors += element + "..." + me.maxValue + " range is less than minRange\n\r";
        }

        if (errors.length) {
            //console.error(errors);
        }
    },

// IE bug
//    onMouseDown : function(e) {
//        var me = this,
//            thumbClicked = false,
//            i = 0,
//            thumbs = me.thumbs,
//            len = thumbs.length,
//            trackPoint;
//
//        if (me.disabled) {
//            return;
//        }
//
//        //see if the click was on any of the thumbs
//        for (; i < len; i++) {
//            thumbClicked = thumbClicked || e.target == thumbs[i].el.dom;
//        }
//
//            console.log(me.clickToChange ,thumbClicked);
//
//        if (me.clickToChange && !thumbClicked) {
//            trackPoint = me.getTrackpoint(e.getXY());
//            if (trackPoint !== undefined) {
//                me.onClickChange(trackPoint);
//            }
//        }
//        e.preventDefault();
//        me.focus();
//        return false;
//    },


    //default generateTitle
    // could be passed in config
    generateTitle: function (n) {
        return "Region " + n;
    },

    rebuildHeaders: function () {
        var headers = this.getHeaders(),
            len = headers.length,
            header;


        //just to be sure about ranges
        this.validateRanges();

        while (len--) {
            header = headers[len];
            Ext.get(header.id).setStyle("left", header.left + "%").setStyle("width", header.width + "%").update(header.title).set({title :  header.title});
        }
    },

    getThumbBgPosition: function () {
        var w = this.getScreenWidth(),
            pos = 0.50 * this.colWidth;

        if (w <= 1600) {
            pos = 0.55 * this.colWidth;
        }
        if (w <= 800) {
            pos = 0.60 * this.colWidth;
        }
        return  pos;
    },

    getScreenWidth: function () {
        return Ext.getBody().getViewSize().width;
    },

    getHeaders: function () {
        var i,
            me = this,
            p,
            n,
            k,
            headers = [],
            header,
            isFirst,
            width,
            left,
            elThumb,
            prevPadding,
            thisPadding,
            thumbsCollection = [];

        for (i in this.thumbs) {
            elThumb = this.thumbs[i].el;
            thumbsCollection.push(elThumb);
        }

        var sum = 0;

        for (i in thumbsCollection) {
            p = parseInt(i) - 1;
            n = parseInt(i) + 1;
            prevPadding = thumbsCollection[p] ? parseFloat(thumbsCollection[p].getStyle("left", true)) : 0;
            thisPadding = parseFloat(thumbsCollection[i].getStyle("left", true));

            isFirst = prevPadding === 0;

            k =100 / me.totalRange;
            width = thisPadding - prevPadding;
            left = prevPadding ;

            if (isFirst){
                left  =  - k;
                width  =  width + k;
            }

            sum += width;

            header = {
                "id": me.id + me.headerPrefix + i,
                "left": left,
                "thisPadding": thisPadding,
                "width": width,
                "title": this.generateTitle(n)
            };

            //console.log(i + " left  " + header.left + " / width " + header.width);
            headers.push(header);

        }

        //add last header
        prevPadding = parseFloat(headers[headers.length - 1].thisPadding)  ;
        thisPadding = 100;
        width = thisPadding - prevPadding;
        sum += width;
        headers.push({
            "id": me.id + me.headerPrefix + headers.length,
            "left": prevPadding,
            "thisPadding": thisPadding,
            "width": width,
            "title": this.generateTitle(n + 1)
        });

        //console.log((i + 1 ) + " left  " + prevPadding + " / width " + (thisPadding - prevPadding));
		//console.log(sum);
		//console.log("----");
        return headers;
    },

    addThumb: function (value) {
        var me = this,
            thumb = new ThumbRange({
                ownerCt: me,
                ownerLayout: me.getComponentLayout(),
                value: value,
                slider: me,
                index: me.thumbs.length,
                disabled: !!me.readOnly
            });

        me.thumbs.push(thumb);

        if (me.rendered) {
            thumb.render();
        }

        return thumb;
    },

    getRangesArr: function () {
        var RangesArr = [];
        var data = this.getRanges();
        Ext.each(data, function (item) {
            RangesArr.push(item.from);
            RangesArr.push(item.to);
        });
        return RangesArr;
    },

    getRanges: function (el) {

        var values = this.getValues(),
            ranges = [],
            range = {},
            i,
            y,
            firstIsCollapsed,
            isFirst,
            title;

        values.push(this.maxValue);
        values.unshift(this.minValue);

        for (i in values) {

            y = 1 + parseInt(i);

            if (values[y]) {


                if (i > 0 && values[i] === this.minValue) {
                    firstIsCollapsed = true;
                }
                isFirst = i == 0;
                range = {
                    "range": this.generateTitle(y),
                    "from": !isFirst || firstIsCollapsed ? parseInt(values[i]) + 1 : parseInt(values[i]),
                    "to": parseInt(values[y]),
                    "length": !isFirst || firstIsCollapsed ? values[y] - values[i] : values[y] - values[i] + 1
                };

                ranges.push(range);

            }


        }

		//console.log(ranges);
		//console.log('---');

        return ranges;
    }
});
