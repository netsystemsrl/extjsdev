Ext.define('kpigauge', {
	extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
    alias: 'widget.kpigauge',
	title: 'Title',
	store: {},
	width: '100%',
	height: '100%',
	flex:1,
	text : '',
	fieldLabel : '',
	
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	valueField: 'ID',
	valueFieldDual: null,
	displayField: 'NOME',
	minField : 100,
	maxField : 1000,
	datasourcefield: '',
	defaultValue: '',
	hiddenLegend: false,
    referenceHolder: true,

	layout: {
        type: 'auto'
    },
	
    initComponent: function () {
        var me = this;
		var fieldConfig = {
			width:me.width, 
			height:me.height
		};
		var MyStore = {} ;
		var MySeries = {};
		var MyAxes = {};
		var MyObject = {};
		
        if (me.store.toString() != "[object Object]") {
			MyStore = Ext.StoreManager.lookup(me.store);
			MySeries = {
				type    : 'gauge',
				angleField: me.valueField,
				radiusField : me.valueFieldDual,
				minValue : me.minField,
				maxValue : me.maxField,
				needle: true,
				donut   : 30,
				colors  : ["#115fa6", "lightgrey"]
			};
			MyAxes = [{
				type     : 'numeric',
				position : 'angular', //'left',
				//title	 : me.displayField,
			}];
		}else{
			//demo store
			MyStore = {
			   fields: ['EXPR0', 'fuel', 'temp', 'rpm'],
			   data: [{
				   EXPR0: 25,
				   fuel: 50,
				   temp: 150,
				   rpm: 6000
			   }]
		   };
			MySeries = {
                type    : 'gauge',
                angleField   : 'EXPR0',
				radiusField : 'EXPR1', 
                minValue : 100,
                maxValue : 1000,
                value   : 500,
                donut   : 30,
                colors  : ["#115fa6", "lightgrey"]
            };
			MyAxes = [{
                type     : 'numeric',
                position : 'angular', //'left',
				//title	 : 'Number of Hits'
            }];
		}
		
		MyObject = {
			xtype: 'polar',		
			store: MyStore,
			axes: MyAxes,
			series: MySeries,
			tooltip: {
				trackMouse: true,
				renderer: 'onSeriesTooltipRender'
			},
			highlight: true
		};
		
		Ext.apply(MyObject,fieldConfig);
		me.items = [MyObject];
		me.setTitle(me.fieldLabel);
		me.callParent(); 
	}
});

Ext.define('kpipolar', {
	extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
    alias: 'widget.kpipolar',
	title: 'Title',
	store: {},
	width: '100%',
	height: '100%',
	text : '',
	fieldLabel : '',
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	valueField: 'ID',
	valueFieldDual: null,
	displayField: 'NOME',
	datasourcefield: '',
	defaultValue: '',
	hiddenLegend: false,
    referenceHolder: true,
    
	layout: {
        type: 'hbox'
    },

    initComponent: function () {
        var me = this;
		var fieldConfig = {
							//fieldLabel: me.fieldLabel, 
							width:me.width, 
							height:me.height
						};
		var MyStore = {} ;
		var MySeries = {};
		var MyObject= {};
		var ObjStore = me.store;
		
        if (ObjStore.toString() != "[object Object]") {
			//object store
            ObjStore = Ext.StoreManager.lookup(ObjStore);
			MyStore = ObjStore;
			//me.store.on('load', me.storeLoad, me);	
			MySeries = {
				type: 'pie',
				//xField: me.valueField,
				angleField: me.valueField,
				radiusField : me.valueFieldDual,
				label: {
					field: me.displayField,
					display: 'rotate'
				},
				highlight: {
                    margin: 40
                },
				donut: 25,
                distortion: 0.6,
				style: {
					miterLimit: 10,
					lineCap: 'miter',
					lineWidth: 2
				},
				tooltip: {
					trackMouse: true,
					renderer: function (tooltip, record, item) {
						var total = 0;
						this.getStore().each(function(rec) {
							total += rec.get(me.valueField);
						});
						percent = Math.round(record.get(me.valueField) / total * 100) + '%';
						tooltip.setHtml(record.get(me.displayField) + ': ' + 
										Math.round(record.get(me.valueField) / total * 100) + '%' + ' ' + 
										Ext.util.Format.currency(Math.round(record.get(me.valueField) ))  
										);
					},
				},
			};
        }else{
			//demo store
			log ('DEMOMODE KPI POLAR');
			MyStore = {
				fields: ['name', 'g1', 'g2'],
				data: [
					{"name": "Item-0", "g1": 18.34,"g2": 0.04},
					{"name": "Item-1", "g1": 2.67, "g2": 14.87},
					{"name": "Item-2", "g1": 1.90, "g2": 5.72},
					{"name": "Item-3", "g1": 21.37,"g2": 2.13},
					{"name": "Item-4", "g1": 2.67, "g2": 8.53},
					{"name": "Item-5", "g1": 18.22,"g2": 4.62}
				]
			};
			MySeries = {
				type: 'polar',
				xField: 'g1',
				label: {
					field: 'name',
					display: 'rotate'
				},
				highlight: {
                    margin: 40
                },
				donut: 25,
                distortion: 0.6,
				style: {
					miterLimit: 10,
					lineCap: 'miter',
					lineWidth: 2
				},
				tooltip: {
					trackMouse: true,
					renderer: function (tooltip, record, item) {
						tooltip.setHtml(record.get('name') + ': ' + record.get('g1') + '');
					},
				},
			};
		}
		
        MyObject = {
			xtype: 'polar',		
			reference: 'chart',	
			theme: 'Muted',
			insetPadding: 30,
			innerPadding: 20,
			store: MyStore,
			interactions : ['itemhighlight', 'rotatePie3d'],
			//interactions : ['rotate', 'itemhighlight'],
			series: [MySeries]
		};
		
		Ext.apply(MyObject,fieldConfig);
		me.items = [MyObject];
		me.setTitle(me.fieldLabel);
		me.callParent();    
    }
});

Ext.define('kpipie', {
	extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
    alias: 'widget.kpipie',
	title: 'Title',
	store: {},
	width: '100%',
	height: '100%',
	text : '',
	fieldLabel : '',
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	valueField: 'ID',
	valueFieldDual: null,
	displayField: 'NOME',
	datasourcefield: '',
	defaultValue: '',
	hiddenLegend: false,
    referenceHolder: true,
    
	layout: {
        type: 'hbox'
    },

    initComponent: function () {
        var me = this;
		var fieldConfig = {
							//fieldLabel: me.fieldLabel, 
							width:me.width, 
							height:me.height
						};
		var MyStore = {} ;
		var MySeries = {};
		var MyObject= {};
		var ObjStore = me.store;
		
        if (ObjStore.toString() != "[object Object]") {
			//object store
            ObjStore = Ext.StoreManager.lookup(ObjStore);
			MyStore = ObjStore;
			//me.store.on('load', me.storeLoad, me);	
			MySeries = {
				type: 'pie',
				//xField: me.valueField,
				angleField: me.valueField,
				radiusField : me.valueFieldDual,
				label: {
					field: me.displayField,
					display: 'rotate'
				},
				highlight: {
                    margin: 40
                },
				donut: 25,
                distortion: 0.6,
				style: {
					miterLimit: 10,
					lineCap: 'miter',
					lineWidth: 2
				},
				tooltip: {
					trackMouse: true,
					renderer: function (tooltip, record, item) {
						var total = 0;
						this.getStore().each(function(rec) {
							total += rec.get(me.valueField);
						});
						percent = Math.round(record.get(me.valueField) / total * 100) + '%';
						tooltip.setHtml(record.get(me.displayField) + ': ' + 
										Math.round(record.get(me.valueField) / total * 100) + '%' + ' ' + 
										Ext.util.Format.currency(Math.round(record.get(me.valueField) ))  
										);
					},
				},
			};
        }else{
			//demo store
			log ('DEMOMODE KPI PIE');
			MyStore = {
				fields: ['name', 'g1', 'g2'],
				data: [
					{"name": "Item-0", "g1": 18.34,"g2": 0.04},
					{"name": "Item-1", "g1": 2.67, "g2": 14.87},
					{"name": "Item-2", "g1": 1.90, "g2": 5.72},
					{"name": "Item-3", "g1": 21.37,"g2": 2.13},
					{"name": "Item-4", "g1": 2.67, "g2": 8.53},
					{"name": "Item-5", "g1": 18.22,"g2": 4.62}
				]
			};
			MySeries = {
				type: 'pie',
				xField: 'g1',
				label: {
					field: 'name',
					display: 'rotate'
				},
				highlight: {
                    margin: 40
                },
				donut: 25,
                distortion: 0.6,
				style: {
					miterLimit: 10,
					lineCap: 'miter',
					lineWidth: 2
				},
				tooltip: {
					trackMouse: true,
					renderer: function (tooltip, record, item) {
						tooltip.setHtml(record.get('name') + ': ' + record.get('g1') + '');
					},
				},
			};
		}
		
        MyObject = {
			xtype: 'polar',		
			reference: 'chart',	
			theme: 'Muted',
			insetPadding: 30,
			innerPadding: 20,
			store: MyStore,
			interactions : ['itemhighlight', 'rotatePie3d'],
			//interactions : ['rotate', 'itemhighlight'],
			series: [MySeries]
		};
		
		Ext.apply(MyObject,fieldConfig);
		me.items = [MyObject];
		me.setTitle(me.fieldLabel);
		me.callParent();    
    }
});

Ext.define('kpipie3d', {
	extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
    alias: 'widget.kpipie3d',
	title: 'Title',
	store: {},
	width: '100%',
	height: '100%',
	text : '',
	fieldLabel : '',
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	valueField: 'ID',
	valueFieldDual: null,
	displayField: 'NOME',
	datasourcefield: '',
	defaultValue: '',
	hiddenLegend: false,
    referenceHolder: true,
	theme: 'green',
	credits: '',
    titleInternal: null,
	totalInternal: null,
	legend:false,
	
	layout: {
        type: 'hbox'
    },

    initComponent: function () {
        var me = this;
		var fieldConfig = {
							//fieldLabel: me.fieldLabel, 
							width:me.width, 
							height:me.height
						};
		var MyStore = {} ;
		var MySeries = {};
		var MyObject= {};
		var ObjStore = me.store;
		
		this.totalInternal = new Ext.draw.sprite.Text({
			id: 'testId',
			x: 20,
			y: 20,
			text: '',
			fontSize: 20,
			fillStyle: 'yellowgreen'
		})
		
		
        if (ObjStore.toString() != "[object Object]") {
			//object store
            ObjStore = Ext.StoreManager.lookup(ObjStore);
			MyStore = ObjStore;
			//me.store.on('load', me.storeLoad, me);	
			MySeries = {
				type: 'pie3d',
				interactions: 'rotate',
				//xField: me.valueField,
				angleField: me.valueField,
				radiusField : me.valueFieldDual,
				label: {
					field: me.displayField,
					display: 'rotate'
				},
				highlight: {
                    margin: 40
                },
				donut: 25,
                distortion: 0.6,
				style: {
					miterLimit: 10,
					lineCap: 'miter',
					lineWidth: 2
				},
				tooltip: {
					trackMouse: true,
					
					renderer: function (tooltip, record, item) {
						// calculate and display percentage on hover
						var total = 0;
						this.getStore().each(function(rec) {
							total += rec.get(me.valueField);
						});
						percent = Math.round(record.get(me.valueField) / total * 100) + '%';
						tooltip.setHtml(record.get(me.displayField) + ': ' + 
										Math.round(record.get(me.valueField) / total * 100) + '%' + ' ' + 
										Ext.util.Format.currency(Math.round(record.get(me.valueField) ))  
										);
						me.totalInternal.setText(Ext.util.Format.currency(Math.round(total)));
					},		
					
				}
			};
        }else{
			//demo store
			log ('DEMOMODE KPI PIE');
			MyStore = {
				fields: ['name', 'g1', 'g2'],
				data: [
					{"name": "Item-0", "g1": 18.34,"g2": 0.04},
					{"name": "Item-1", "g1": 2.67, "g2": 14.87},
					{"name": "Item-2", "g1": 1.90, "g2": 5.72},
					{"name": "Item-3", "g1": 21.37,"g2": 2.13},
					{"name": "Item-4", "g1": 2.67, "g2": 8.53},
					{"name": "Item-5", "g1": 18.22,"g2": 4.62}
				]
			};
			MySeries = {
				type: 'pie',
				xField: 'g1',
				label: {
					field: 'name',
					display: 'rotate'
				},
				highlight: {
                    margin: 40
                },
				donut: 25,
                distortion: 0.6,
				style: {
					miterLimit: 10,
					lineCap: 'miter',
					lineWidth: 2
				},
				tooltip: {
					trackMouse: true,
					renderer: function (tooltip, record, item) {
						tooltip.setHtml(record.get('name') + ': ' + record.get('g1') + '');
					},
				},
			};
		}
		
        MyObject = {
			xtype: 'polar',		
			reference: 'chart',	
			theme: me.theme,
			insetPadding: 30,
			innerPadding: 20,
			store: MyStore,
			legend: me.legend,
			interactions : ['rotate'],
            captions: {
                title: me.titleInternal,
                credits: {
                    text: me.credits,
                    align: 'left'
                }
            },
			sprites: [
				this.totalInternal
			],
				listeners:{
			
				afterrender: function(obj) {
					// calculate and display percentage on hover
					var total = 0;
					var me = obj.up('kpipie3d');
					this.getStore().each(function(rec) {
						total += rec.get(me.valueField);
					});
					
					me.totalInternal.setText(Ext.util.Format.currency(Math.round(total)));
				},
				resize: function(chart, width, height, oldWidth, oldHeight, eOpts) {
					var label = this.totalInternal,
						dim = label.getBBox(),
						lWidth = dim.width,
						lHeight = dim.height,
						cWidth = chart.getWidth(),
						cHeight = chart.getHeight();

					if(lWidth && lHeight) {
						label.setAttributes({
							x: (cWidth/2+10)-(lWidth/2),
							y: (cHeight/2+10)-(lHeight/2),
						});
					}
				}
            },
			series: [MySeries]
		};
		
		Ext.apply(MyObject,fieldConfig);
		me.items = [MyObject];
		me.setTitle(me.fieldLabel);
		me.callParent();    
    }
});

Ext.define('kpiline', {
	extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
    alias: 'widget.kpiline',
	title: 'Title',
	store: {},
	width: '100%',
	height: '100%',
	text : '',
	fieldLabel : '',
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	valueField: 'ID',
	displayField: 'NOME',
	datasourcefield: '',
	defaultValue: '',
	hiddenLegend: false,
    referenceHolder: true,
    
	layout: {
        type: 'hbox'
    },

    initComponent: function () {
        var me = this;
		var fieldConfig = {
							//fieldLabel: me.fieldLabel, 
							width:me.width, 
							height:me.height
						};
		var MyStore = {} ;
		var MySeries = {};
		var MyAxes = [];
		var MyObject= {};
		
        if (me.store.toString() != "[object Object]") {
			//object store
            MyStore = Ext.StoreManager.lookup(me.store);
			MySeries = {
				type: 'area',
                axis: 'left',
				xField: [me.displayField],
				yField: [me.valueField],
                style: {
                    minGapWidth: 20
                },
                highlight: {
                    strokeStyle: 'black',
                    fillStyle: '#c1e30d',
                    lineDash: [5, 3]
                },
				label: {
					field: me.valueField,
                    display: 'insideEnd',
				},
				highlight: true,
				donut: 25,
                distortion: 0.6,
				style: {
					inGroupGapWidth: -7
				}
			};
			MyAxes = [{
				type: 'numeric',
				position: 'left',
			},{
				type: 'category',
				position: 'bottom'
			}];
		}else{
			//demo store
			log ('DEMOMODE KPI AREA');
			MyStore = {
				fields: ['name', 'g1', 'g2'],
				data: [
					{"name": "Item-0", "g1": 18.34,"g2": 0.04},
					{"name": "Item-1", "g1": 2.67, "g2": 14.87},
					{"name": "Item-2", "g1": 1.90, "g2": 5.72},
					{"name": "Item-3", "g1": 21.37,"g2": 2.13},
					{"name": "Item-4", "g1": 2.67, "g2": 8.53},
					{"name": "Item-5", "g1": 18.22,"g2": 4.62}
				]
			};
			MySeries = {
				type: 'line',
                axis: 'left',
				xField: ['name'],
				yField: ['g1'],
                style: {
                    minGapWidth: 20
                },
                highlight: {
                    strokeStyle: 'black',
                    fillStyle: '#c1e30d',
                    lineDash: [5, 3]
                },
				label: {
					field: 'g1',
                    display: 'insideEnd',
				},
				highlight: true,
				donut: 25,
                distortion: 0.6,
				style: {
					inGroupGapWidth: -7
				}
			};
			MyAxes = [{
				type: 'numeric',
				position: 'left',
			},{
				type: 'category',
				position: 'bottom'
			}];
		}
		
		MyObject = {
			xtype: 'cartesian',			
			store: MyStore,
			axes: MyAxes,
			series: MySeries,
            insetPadding: {
                top: 40,
                bottom: 40,
                left: 20,
                right: 40
            },
            interactions: 'itemhighlight',
            animation: Ext.isIE8 ? false : {
                easing: 'bounceOut',
                duration: 500
            },
		};
		
		Ext.apply(MyObject,fieldConfig);
		me.items = [MyObject];
		me.setTitle(me.fieldLabel);
		me.callParent();     
    },
});

Ext.define('kpiarea', {
	extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
    alias: 'widget.kpiarea',
	title: 'Title',
	store: {},
	width: '100%',
	height: '100%',
	text : '',
	fieldLabel : '',
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	valueField: 'ID',
	displayField: 'NOME',
	datasourcefield: '',
	defaultValue: '',
	hiddenLegend: false,
    referenceHolder: true,
    
	layout: {
        type: 'hbox'
    },

    initComponent: function () {
        var me = this;
		var fieldConfig = {
							//fieldLabel: me.fieldLabel, 
							width:me.width, 
							height:me.height
						};
		var MyStore = {} ;
		var MySeries = {};
		var MyAxes = [];
		var MyObject= {};
		
        if (me.store.toString() != "[object Object]") {
			//object store
            MyStore = Ext.StoreManager.lookup(me.store);
			MySeries = {
				type: 'area',
                axis: 'left',
				xField: [me.displayField],
				yField: [me.valueField],
                style: {
                    minGapWidth: 20
                },
                highlight: {
                    strokeStyle: 'black',
                    fillStyle: '#c1e30d',
                    lineDash: [5, 3]
                },
				label: {
					field: me.valueField,
                    display: 'insideEnd',
				},
				highlight: true,
				donut: 25,
                distortion: 0.6,
				style: {
					inGroupGapWidth: -7
				}
			};
			MyAxes = [{
				type: 'numeric',
				position: 'left',
			},{
				type: 'category',
				position: 'bottom'
			}];
		}else{
			//demo store
			log ('DEMOMODE KPI AREA');
			MyStore = {
				fields: ['name', 'g1', 'g2'],
				data: [
					{"name": "Item-0", "g1": 18.34,"g2": 0.04},
					{"name": "Item-1", "g1": 2.67, "g2": 14.87},
					{"name": "Item-2", "g1": 1.90, "g2": 5.72},
					{"name": "Item-3", "g1": 21.37,"g2": 2.13},
					{"name": "Item-4", "g1": 2.67, "g2": 8.53},
					{"name": "Item-5", "g1": 18.22,"g2": 4.62}
				]
			};
			MySeries = {
				type: 'area',
                axis: 'left',
				xField: ['name'],
				yField: ['g1'],
                style: {
                    minGapWidth: 20
                },
                highlight: {
                    strokeStyle: 'black',
                    fillStyle: '#c1e30d',
                    lineDash: [5, 3]
                },
				label: {
					field: 'g1',
                    display: 'insideEnd',
				},
				highlight: true,
				donut: 25,
                distortion: 0.6,
				style: {
					inGroupGapWidth: -7
				}
			};
			MyAxes = [{
				type: 'numeric',
				position: 'left',
			},{
				type: 'category',
				position: 'bottom'
			}];
		}
		
		MyObject = {
			xtype: 'cartesian',			
			store: MyStore,
			axes: MyAxes,
			series: MySeries,
            insetPadding: {
                top: 40,
                bottom: 40,
                left: 20,
                right: 40
            },
            interactions: 'itemhighlight',
            animation: Ext.isIE8 ? false : {
                easing: 'bounceOut',
                duration: 500
            },
		};
		
		Ext.apply(MyObject,fieldConfig);
		me.items = [MyObject];
		me.setTitle(me.fieldLabel);
		me.callParent();     
    },
});

Ext.define('kpibar', {
	extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
    alias: 'widget.kpibar',
	title: 'Title',
	store: {},
	width: '100%',
	height: '100%',
	text : '',
	fieldLabel : '',
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	valueField: 'ID',
	displayField: 'NOME',
	datasourcefield: '',
	defaultValue: '',
	hiddenLegend: false,
    referenceHolder: true,
    
	layout: {
        type: 'hbox'
    },

    initComponent: function () {
        var me = this;
		var fieldConfig = {
							//fieldLabel: me.fieldLabel, 
							width:me.width, 
							height:me.height
						};
		var MyStore = {} ;
		var MySeries = {};
		var MyAxes = [];
		var MyObject= {};
		
        if (me.store.toString() != "[object Object]") {
			//object store
            MyStore = Ext.StoreManager.lookup(me.store);
			MySeries = {
				type: 'bar',
                axis: 'left',
				xField: [me.displayField],
				yField: [me.valueField],
                stacked: true,
				renderer: function(sprite, config, rendererData, index) {
					var record = rendererData.store.getAt(index)
					//return Ext.apply(config, { fill: record.get('color') });
					if (record.get(me.valueField) < 0){
						return Ext.apply(config, { fill: 'red' });
					}
				}
			};
			MyAxes = [
			{
				type: 'numeric',
				position: 'left',
				fields: me.valueField,						
				label: {
					renderer: Ext.util.Format.numberRenderer('0,0')
				},
				grid: {
				   odd: {
					   fillStyle: 'rgba(255, 255, 255, 0.06)'
				   },
				   even: {
					   fillStyle: 'rgba(0, 0, 0, 0.03)'
				   }
				}
			},{
				type: 'category',
				position: 'bottom',
				fields: me.displayField
			}];
		}else{
			//demo store
			log ('DEMOMODE KPI BAR');
			MyStore = {
				fields: ['name', 'g1', 'g2'],
				data: [
					{"name": "Item-0", "g1": 18.34,"g2": 0.04},
					{"name": "Item-1", "g1": 2.67, "g2": 14.87},
					{"name": "Item-2", "g1": 1.90, "g2": 5.72},
					{"name": "Item-3", "g1": 21.37,"g2": 2.13},
					{"name": "Item-4", "g1": 2.67, "g2": 8.53},
					{"name": "Item-5", "g1": 18.22,"g2": 4.62}
				]
			};
			MySeries = {
				type: 'bar',
                axis: 'left',
				xField: ['name'],
				yField: ['g1'],
                style: {
                    minGapWidth: 20
                },
                highlight: {
                    strokeStyle: 'black',
                    fillStyle: '#c1e30d',
                    lineDash: [5, 3]
                },
				label: {
					field: 'g1',
                    display: 'insideEnd',
				},
				highlight: true,
				donut: 25,
                distortion: 0.6,
				style: {
					inGroupGapWidth: -7
				}
			};
			MyAxes = [{
				type: 'numeric',
				position: 'left',
			},{
				type: 'category',
				position: 'bottom'
			}];
		}
		
		MyObject = Ext.create('Ext.chart.Chart', {
			store: MyStore,
			axes: MyAxes,
			series: MySeries,
            insetPadding: {
                top: 40,
                bottom: 40,
                left: 20,
                right: 40
            },
            highlight: true,
			highlightCfg: {
				fillStyle: 'yellow',
				strokeStyle: 'red'
			},
            animation: Ext.isIE8 ? false : {
                easing: 'bounceOut',
                duration: 500
            },
		});
		
		Ext.apply(MyObject,fieldConfig);
		me.items = [MyObject];
		me.setTitle(me.fieldLabel);
		me.callParent();     
    },
});

Ext.define('kpibar3d', {
	extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
    alias: 'widget.kpibar3d',
	title: 'Title',
	store: {},
	width: '100%',
	height: '100%',
	text : '',
	fieldLabel : '',
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	valueField: 'ID',
	displayField: 'NOME',
	datasourcefield: '',
	defaultValue: '',
	hiddenLegend: false,
    referenceHolder: true,
    
	layout: {
        type: 'hbox'
    },

    initComponent: function () {
        var me = this;
		var fieldConfig = {
							//fieldLabel: me.fieldLabel, 
							width:me.width, 
							height:me.height
						};
		var MyStore = {} ;
		var MySeries = {};
		var MyAxes = [];
		var MyObject= {};
		
        if (me.store.toString() != "[object Object]") {
			//object store
            MyStore = Ext.StoreManager.lookup(me.store);
			MySeries = {
				type: 'bar3d',
                axis: 'left',
				xField: [me.displayField],
				yField: [me.valueField],
                stacked: true,
				renderer: function(sprite, config, rendererData, index) {
					var record = rendererData.store.getAt(index)
					//return Ext.apply(config, { fill: record.get('color') });
					if (record.get(me.valueField) < 0){
						return Ext.apply(config, { fill: 'red' });
					}
				}
			};
			MyAxes = [
			{
				type: 'numeric3d',
				position: 'left',
				fields: me.valueField,						
				label: {
					renderer: Ext.util.Format.numberRenderer('0,0')
				},
				grid: {
				   odd: {
					   fillStyle: 'rgba(255, 255, 255, 0.06)'
				   },
				   even: {
					   fillStyle: 'rgba(0, 0, 0, 0.03)'
				   }
				}
			},{
				type: 'category3d',
				position: 'bottom',
				fields: me.displayField
			}];
		}else{
			//demo store
			log ('DEMOMODE KPI BAR');
			MyStore = {
				fields: ['name', 'g1', 'g2'],
				data: [
					{"name": "Item-0", "g1": 18.34,"g2": 0.04},
					{"name": "Item-1", "g1": 2.67, "g2": 14.87},
					{"name": "Item-2", "g1": 1.90, "g2": 5.72},
					{"name": "Item-3", "g1": 21.37,"g2": 2.13},
					{"name": "Item-4", "g1": 2.67, "g2": 8.53},
					{"name": "Item-5", "g1": 18.22,"g2": 4.62}
				]
			};
			MySeries = {
				type: 'bar',
                axis: 'left',
				xField: ['name'],
				yField: ['g1'],
                style: {
                    minGapWidth: 20
                },
                highlight: {
                    strokeStyle: 'black',
                    fillStyle: '#c1e30d',
                    lineDash: [5, 3]
                },
				label: {
					field: 'g1',
                    display: 'insideEnd',
				},
				highlight: true,
				donut: 25,
                distortion: 0.6,
				style: {
					inGroupGapWidth: -7
				}
			};
			MyAxes = [{
				type: 'numeric',
				position: 'left',
			},{
				type: 'category',
				position: 'bottom'
			}];
		}
		
		MyObject = Ext.create('Ext.chart.Chart', {
			store: MyStore,
			axes: MyAxes,
			series: MySeries,
            insetPadding: {
                top: 40,
                bottom: 40,
                left: 20,
                right: 40
            },
            highlight: true,
			highlightCfg: {
				fillStyle: 'yellow',
				strokeStyle: 'red'
			},
            animation: Ext.isIE8 ? false : {
                easing: 'bounceOut',
                duration: 500
            },
		});
		
		Ext.apply(MyObject,fieldConfig);
		me.items = [MyObject];
		me.setTitle(me.fieldLabel);
		me.callParent();     
    },
});

Ext.define('kpipietree', {
	extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
    alias: 'widget.kpipietree',
	title: 'Title',
	store: {},
	width: '100%',
	height: '100%',
	text : '',
	fieldLabel : '',
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	valueField: 'ID',
	displayField: 'NOME',
	datasourcefield: '',
	defaultValue: '',
	hiddenLegend: false,
    referenceHolder: true,
    
	layout: {
        type: 'hbox'
    },

    initComponent: function () {
        var me = this;
		var fieldConfig = {
							//fieldLabel: me.fieldLabel, 
							width:me.width, 
							height:me.height
						};
		var MyStore = {} ;
		var MySeries = {};
		var MyAxes = [];
		var MyObject= {};
		
        if (me.store.toString() != "[object Object]") {
			//object store
            MyStore = Ext.StoreManager.lookup(me.store);
			MySeries = {
				type: 'd3-sunburst',
                axis: 'left',
				xField: [me.displayField],
				yField: [me.valueField],
                stacked: true,
				renderer: function(sprite, config, rendererData, index) {
					var record = rendererData.store.getAt(index)
					//return Ext.apply(config, { fill: record.get('color') });
					if (record.get(me.valueField) < 0){
						return Ext.apply(config, { fill: 'red' });
					}
				}
			};
			MyAxes = [
			{
				type: 'numeric3d',
				position: 'left',
				fields: me.valueField,						
				label: {
					renderer: Ext.util.Format.numberRenderer('0,0')
				},
				grid: {
				   odd: {
					   fillStyle: 'rgba(255, 255, 255, 0.06)'
				   },
				   even: {
					   fillStyle: 'rgba(0, 0, 0, 0.03)'
				   }
				}
			},{
				type: 'd3-sunburst',
				position: 'bottom',
				fields: me.displayField
			}];
		}else{
			//demo store
			log ('DEMOMODE KPI BAR');
			MyStore = {
				fields: ['name', 'g1', 'g2'],
				data: [
					{"name": "Item-0", "g1": 18.34,"g2": 0.04},
					{"name": "Item-1", "g1": 2.67, "g2": 14.87},
					{"name": "Item-2", "g1": 1.90, "g2": 5.72},
					{"name": "Item-3", "g1": 21.37,"g2": 2.13},
					{"name": "Item-4", "g1": 2.67, "g2": 8.53},
					{"name": "Item-5", "g1": 18.22,"g2": 4.62}
				]
			};
			MySeries = {
				type: 'bar',
                axis: 'left',
				xField: ['name'],
				yField: ['g1'],
                style: {
                    minGapWidth: 20
                },
                highlight: {
                    strokeStyle: 'black',
                    fillStyle: '#c1e30d',
                    lineDash: [5, 3]
                },
				label: {
					field: 'g1',
                    display: 'insideEnd',
				},
				highlight: true,
				donut: 25,
                distortion: 0.6,
				style: {
					inGroupGapWidth: -7
				}
			};
			MyAxes = [{
				type: 'numeric',
				position: 'left',
			},{
				type: 'category',
				position: 'bottom'
			}];
		}
		
		MyObject = Ext.create('Ext.chart.Chart', {
			store: MyStore,
			axes: MyAxes,
			series: MySeries,
            reference: 'd3',
            padding: 20,
            tooltip: {
                renderer: function(component, tooltip, node) {
						var total = 0;
						this.getStore().each(function(rec) {
							total += rec.get(me.valueField);
						});
						percent = Math.round(record.get(me.valueField) / total * 100) + '%';
						tooltip.setHtml(record.get(me.displayField) + ': ' + 
										Math.round(record.get(me.valueField) / total * 100) + '%' + ' ' + 
										Ext.util.Format.currency(Math.round(record.get(me.valueField) ))  
										);
                }
            },
            transitions: {
                select: false
            },
            listeners: {
                selectionchange: function (sunburst, node) {
                    sunburst.zoomInNode(node);
                }
            }
		});
		
		Ext.apply(MyObject,fieldConfig);
		me.items = [MyObject];
		me.setTitle(me.fieldLabel);
		me.callParent();     
    },
});
