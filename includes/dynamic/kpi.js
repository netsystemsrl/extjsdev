Ext.define('kpigauge', {
    extend: 'Ext.panel.Panel',
    //extend: 'Ext.container.Container',
    alias: 'widget.kpigauge',
	mixins: {
		field: 'Ext.form.field.Base'
	},
    title: 'Title',
    store: {},
    width: '100%',
    height: '100%',
    flex: 1,
    text: '',
    fieldLabel: '',

    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    valueField: 'TOT',
    valueFieldDual: null,
    displayField: 'NOME',
    minField: 100,
    maxField: 1000,
    datasourcefield: '',
    defaultValue: '',
    legend: false,
    referenceHolder: true,

    layout: {
        type: 'auto'
    },

    initComponent: function() {
        var me = this;
        var fieldConfig = {
            width: me.width,
            height: me.height
        };
        var MySeries = {};
        var MyAxes = {};
        var MyObject = {};

        if (me.store.toString() != "[object Object]") {
            me.store = Ext.StoreManager.lookup(me.store);
            MySeries = {
                type: 'gauge',
                angleField: me.valueField,
                radiusField: me.valueFieldDual,
                minValue: me.minField,
                maxValue: me.maxField,
                needle: true,
                donut: 30,
                colors: ["#115fa6", "lightgrey"]
            };
            MyAxes = [{
                type: 'numeric',
                position: 'angular', //'left',
                //title	 : me.displayField,
            }];
        } else {
            //demo store
            me.store = {
                fields: ['EXPR0', 'fuel', 'temp', 'rpm'],
                data: [{
                    EXPR0: 25,
                    fuel: 50,
                    temp: 150,
                    rpm: 6000
                }]
            };
            MySeries = {
                type: 'gauge',
                angleField: 'EXPR0',
                radiusField: 'EXPR1',
                minValue: 100,
                maxValue: 1000,
                value: 500,
                donut: 30,
                colors: ["#115fa6", "lightgrey"]
            };
            MyAxes = [{
                type: 'numeric',
                position: 'angular', //'left',
                //title	 : 'Number of Hits'
            }];
        }

        MyObject = {
            xtype: 'polar',
            store: me.store,
            axes: MyAxes,
            series: MySeries,
            tooltip: {
                trackMouse: true,
                renderer: 'onSeriesTooltipRender'
            },
            highlight: true,
			legend: me.legend,
        };

        Ext.apply(MyObject, fieldConfig);
        me.items = [MyObject];
        me.setTitle(me.fieldLabel);
        me.callParent();
    }
});


Ext.define('kpipolar', {
    extend: 'Ext.panel.Panel',
    //extend: 'Ext.container.Container',
    alias: 'widget.kpipolar',
	mixins: {
		field: 'Ext.form.field.Base'
	},
    title: 'Title',
    store: {},
    width: '100%',
    height: '100%',
    text: '',
    fieldLabel: '',
    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    valueField: 'ID',
    valueFieldDual: null,
    displayField: 'NOME',
    datasourcefield: '',
    defaultValue: '',
    referenceHolder: true,
    theme: 'green',
    credits: '',
    titleInternal: null,
    totalInternal: null,
    legend: false,

    layout: {
        type: 'hbox'
    },

    initComponent: function() {
        var me = this;
        var fieldConfig = {
            //fieldLabel: me.fieldLabel, 
            width: me.width,
            height: me.height
        };
        var MySeries = {};
        var MyObject = {};
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
            me.store = Ext.StoreManager.lookup(me.store);
        } else {
            //demo store
            me.store = {
                fields: [me.displayField, me.valueField, me.valueFieldDual],
                data: [
					{[me.displayField]: "Item-0", [me.valueField]: 18.34, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-1", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-2", [me.valueField]:  1.90, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-3", [me.valueField]: 21.37, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-4", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-5", [me.valueField]: 18.22, [me.valueFieldDual]: 2}
				]
            };
        };

        MySeries = {
            type: 'pie',
            //xField: me.valueField,
            angleField: me.valueField,
            radiusField: me.valueFieldDual,
            //radiusField: (me.valueFieldDual == true ? (me.valueField > 0 ? 2 : 1 ) : null),
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
                renderer: function(tooltip, record, item) {
                    // calculate and display percentage on hover
                    var total = 0;
					var totalpos = 0;
					var totalneg = 0;
                    this.getStore().each(function(rec) {
                        total += rec.get(me.valueField);
						if (rec.get(me.valueField) > 0){
							totalpos += rec.get(me.valueField);
						}else{
							totalneg += rec.get(me.valueField);
						}
                    });
					
					if (record.get(me.valueField) > 0){
						percent = Math.round(record.get(me.valueField) / totalpos * 100) + '%';
					}else{
						percent = Math.round(record.get(me.valueField) / totalneg * 100) + '%';
					}
					total = totalpos + totalneg;
                    percentab = Math.round(100 - Math.abs(totalneg * 100) / Math.abs(totalpos)) + '%';

					
                    tooltip.setHtml(record.get(me.displayField) + ': ' +
                        percent + ' ' +
                        Ext.util.Format.currency(Math.round(record.get(me.valueField)))
                    );
                    me.totalInternal.setText(Ext.util.Format.currency(Math.round(total)) + ' ' + percentab);
                },
            },
        };
        MyObject = {
            xtype: 'polar',
            reference: 'chart',
            theme: me.theme,
            insetPadding: 30,
            innerPadding: 20,
            store: me.store,
            interactions: ['itemhighlight', 'rotate'],
            legend: me.legend,
            interactions: ['rotate'],
            //interactions : ['rotate', 'itemhighlight'],
            sprites: [
                this.totalInternal
            ],
            listeners: {
                afterrender: function(obj) {
                    // calculate and display percentage on hover
                    var total = 0;
                    var me = obj.up('kpipolar');
                    this.getStore().each(function(rec) {
                        total += rec.get(me.valueField);
                    });

                    //me.totalInternal.setText(Ext.util.Format.currency(Math.round(total)));
                }
            },
            series: [MySeries]
        };

        Ext.apply(MyObject, fieldConfig);
        me.items = [MyObject];
        me.setTitle(me.fieldLabel);
        me.callParent();
    }
});


Ext.define('kpipie', {
    extend: 'Ext.panel.Panel',
    //extend: 'Ext.container.Container',
    alias: 'widget.kpipie',
	mixins: {
		field: 'Ext.form.field.Base'
	},
    title: 'Title',
    store: {},
    width: '100%',
    height: '100%',
    text: '',
    fieldLabel: '',
    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    valueField: 'ID',
    valueFieldDual: null,
    displayField: 'NOME',
    datasourcefield: '',
    defaultValue: '',
    referenceHolder: true,
    theme: 'green',
    credits: '',
    titleInternal: null,
    totalInternal: null,
    legend: false,

    layout: {
        type: 'hbox'
    },

    initComponent: function() {
        var me = this;
        var fieldConfig = {
            //fieldLabel: me.fieldLabel, 
            width: me.width,
            height: me.height
        };
        var MySeries = {};
        var MyObject = {};
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
            me.store = Ext.StoreManager.lookup(me.store);
        } else {
            //demo store
            
            me.store = {
                fields: [me.displayField, me.valueField, me.valueFieldDual],
                data: [
					{[me.displayField]: "Item-0", [me.valueField]: 18.34, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-1", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-2", [me.valueField]:  1.90, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-3", [me.valueField]: 21.37, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-4", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-5", [me.valueField]: 18.22, [me.valueFieldDual]: 2}
				]
            };
        }

        MySeries = {
            type: 'pie',
            //xField: me.valueField,
            angleField: me.valueField,
            radiusField: me.valueFieldDual,
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
                renderer: function(tooltip, record, item) {
                    var total = 0;
                    this.getStore().each(function(rec) {
                        total += rec.get(me.valueField);
                    });
                    percent = Math.round(record.get(me.valueField) / total * 100) + '%';
                    tooltip.setHtml(record.get(me.displayField) + ': ' +
                        Math.round(record.get(me.valueField) / total * 100) + '%' + ' ' +
                        Ext.util.Format.currency(Math.round(record.get(me.valueField)))
                    );
                },
            },
        };

        MyObject = {
            xtype: 'polar',
            reference: 'chart',
            theme: me.theme,
            insetPadding: 30,
            innerPadding: 20,
            store: me.store,
            interactions: ['itemhighlight', 'rotate'],
            legend: me.legend,
            interactions: ['rotate'],
            //interactions : ['rotate', 'itemhighlight'],
            sprites: [
                this.totalInternal
            ],
            listeners: {
                afterrender: function(obj) {
                    // calculate and display percentage on hover
                    var total = 0;
                    var me = obj.up('kpipolar');
                    this.getStore().each(function(rec) {
                        total += rec.get(me.valueField);
                    });

                    me.totalInternal.setText(Ext.util.Format.currency(Math.round(total)));
                }
            },
            //interactions : ['rotate', 'itemhighlight'],
            series: [MySeries]
        };

        Ext.apply(MyObject, fieldConfig);
        me.items = [MyObject];
        me.setTitle(me.fieldLabel);
        me.callParent();
    }
});

Ext.define('kpipie3d', {
    extend: 'Ext.panel.Panel',
    //extend: 'Ext.container.Container',
    alias: 'widget.kpipie3d',
	mixins: {
		field: 'Ext.form.field.Base'
	},
    title: 'Title',
    store: [],
    width: '100%',
    height: '100%',
    text: '',
    fieldLabel: '',
    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    valueField: 'ID',
    valueFieldDual: null,
	valueFormat : null,
    displayField: 'NOME',
    datasourcefield: '',
    defaultValue: '',
    referenceHolder: true,
    theme: 'green',
    credits: '',
    titleInternal: null,
    totalInternal: null,
    legend: false,
    layout: {
        type: 'hbox'
    },

    initComponent: function() {
        var me = this;
        var fieldConfig = {
            //fieldLabel: me.fieldLabel, 
            width: me.width,
            height: me.height
        };
        var MySeries = {};
        var MyObject = {};
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
            me.store = Ext.StoreManager.lookup(me.store);
        } else {
            //demo store
            me.store = {
                fields: [me.displayField, me.valueField, me.valueFieldDual],
                data: [
					{[me.displayField]: "Item-0", [me.valueField]: 18.34, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-1", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-2", [me.valueField]:  1.90, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-3", [me.valueField]: 21.37, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-4", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-5", [me.valueField]: 18.22, [me.valueFieldDual]: 2}
				]
            };
        }


        MySeries = {
            type: 'pie3d',
            interactions: 'rotate',
            //xField: me.valueField,
            angleField: me.valueField,
            radiusField: me.valueFieldDual,
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

                renderer: function(tooltip, record, item) {
                    // calculate and display percentage on hover
                    var total = 0;
                    this.getStore().each(function(rec) {
                        total += rec.get(me.valueField);
                    });
                    percent = Math.round(record.get(me.valueField) / total * 100) + '%';
					elValue = Math.round(record.get(me.valueField))
					if(me.valueFormat == "currency")
						elValue = Ext.util.Format.currency(Math.round(record.get(me.valueField)))
                    tooltip.setHtml(record.get(me.displayField) + ': ' +
                        percent + ' ' +
                        elValue
                    );
					
					let value = Math.round(total).toString()
					if(me.valueFormat == "currency")
						value = Ext.util.Format.currency(Math.round(total))
                    me.totalInternal.setText(value);
					
					//me.totalInternal.setText(Ext.util.Format.currency(Math.round(total)))
                },

            }
        };

        MyObject = {
            xtype: 'polar',
            reference: 'chart',
            theme: me.theme,
            insetPadding: 30,
            innerPadding: 20,
            store: me.store,
            legend: me.legend,
            interactions: ['itemhighlight', 'rotatePie3d'],
            //interactions : ['rotate', 'itemhighlight'],
            sprites: [
                this.totalInternal
            ],
            listeners: {
                afterrender: function(obj) {
                    // calculate and display percentage on hover
                    var total = 0;
                    var me = obj.up('kpipie3d');
                    this.getStore().each(function(rec) {
                        total += rec.get(me.valueField);
                    });
					
					let totalValue = Math.round(total).toString()
					if(me.valueFormat == "currency")
						totalValue = Ext.util.Format.currency(Math.round(total))
                    me.totalInternal.setText(totalValue);
					//me.totalInternal.setText('mah')
                }
            },
            series: [MySeries]
        };

        Ext.apply(MyObject, fieldConfig);
        me.items = [MyObject];
        me.setTitle(me.fieldLabel);
        me.callParent();
    }
});


Ext.define('kpiline', {
    extend: 'Ext.panel.Panel',
    //extend: 'Ext.container.Container',
    alias: 'widget.kpiline',
	mixins: {
		field: 'Ext.form.field.Base'
	},
    title: 'Title',
    store: {},
    width: '100%',
    height: '100%',
    text: '',
    fieldLabel: '',
    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    valueField: 'ID',
    displayField: 'NOME',
    datasourcefield: '',
    defaultValue: '',
    legend: {
		docked : 'top'
	},
    referenceHolder: true,

    layout: {
        type: 'hbox'
    },

    initComponent: function() {
        var me = this;
        var fieldConfig = {
            //fieldLabel: me.fieldLabel, 
            width: me.width,
            height: me.height
        };
        var MySeries = {};
        var MyAxes = [];
        var MyObject = {};
        var ObjStore = me.store;
        this.totalInternal = new Ext.draw.sprite.Text({
            id: 'testId',
            x: 20,
            y: 20,
            text: '',
            fontSize: 20,
            fillStyle: 'yellowgreen'
        })

        if (me.store.toString() != "[object Object]") {
            //object store
            me.store = Ext.StoreManager.lookup(me.store);
        } else {
            //demo store
            me.store = {
                fields: [me.displayField, me.valueField, me.valueFieldDual],
                data: [
					{[me.displayField]: "Item-0", [me.valueField]: 18.34, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-1", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-2", [me.valueField]:  1.90, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-3", [me.valueField]: 21.37, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-4", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-5", [me.valueField]: 18.22, [me.valueFieldDual]: 2}
				]
            };
        }

		if(Array.isArray(me.valueField)){
			MySeries = []
			me.valueField.forEach(function(item, index, arr) {
				MySeries.push(
					{
						type: 'line',
						axis: 'left',
						xField: [me.displayField],
						yField: [item],
						style: {
							stroke: '#30BDA7',
							lineWidth: 2,
							minGapWidth: 20
						},
						marker: {
						   type: 'circle',
						   radius: 4,
						   lineWidth: 2,
						   fill: 'white'
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
					}
				)
			})
		} else {
			MySeries = {
				type: 'line',
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
			}			
		}

        MyAxes = [{
            type: 'numeric',
            position: 'left',
			//fields: [me.valueField],
        }, {
            type: 'category',
            position: 'bottom',
			fields: [me.displayField],
			title: {
			   text: me.displayField,
			   fontSize: 15
			}
        }];


        MyObject = {
            xtype: 'cartesian',
            store: me.store,
            axes: MyAxes,
            series: MySeries,
            insetPadding: {
                top: 40,
                bottom: 40,
                left: 20,
                right: 40
            },
            interactions: 'itemhighlight',
			legend: me.legend,
            animation: Ext.isIE8 ? false : {
                easing: 'bounceOut',
                duration: 500
            },
        };

        Ext.apply(MyObject, fieldConfig);
        me.items = [MyObject];
        me.setTitle(me.fieldLabel);
        me.callParent();
    },
});


Ext.define('kpiarea', {
    extend: 'Ext.panel.Panel',
    //extend: 'Ext.container.Container',
    alias: 'widget.kpiarea',
	mixins: {
		field: 'Ext.form.field.Base'
	},
    title: 'Title',
    store: {},
    minWidth: '100',
    minHeight: '100',
    text: '',
    fieldLabel: '',
    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    valueField: 'TOTA',
    displayField: 'NOME',
    datasourcefield: '',
    defaultValue: '',
    legend : {
				docked: 'bottom'
			},
    referenceHolder: true,

    layout: {
        type: 'hbox'
    },

    initComponent: function() {
        var me = this;
        var MySeries = {};
        var MyAxes = [];
        var MyObject = {};
        var ObjStore = me.store;
        me.setTitle(me.fieldLabel);
        this.totalInternal = new Ext.draw.sprite.Text({
            id: 'testId',
            x: 20,
            y: 20,
            text: '',
            fontSize: 20,
            fillStyle: 'yellowgreen'
        })

        if (me.store.toString() != "[object Object]") {
            //object store
            me.store = Ext.StoreManager.lookup(me.store);
        } else {
            //demo store
            me.store = {
                fields: [me.displayField, me.valueField],
                data: [
					{[me.displayField]: "Item-0", [me.valueField]: 18.34, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-1", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-2", [me.valueField]:  1.90, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-3", [me.valueField]: 21.37, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-4", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-5", [me.valueField]: 18.22, [me.valueFieldDual]: 2}
				]
            };
        }
        MySeries = {
            type: 'area',
            axis: 'left',
            xField: me.displayField.split(','),
            yField: me.valueField.split(','),
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
            
            donut: 25,
            distortion: 0.6,
            style: {
                inGroupGapWidth: -7
            }
        };
        MyAxes = [{
            type: 'numeric',
            position: 'left',
            grid: true
        }, {
            type: 'category',
            position: 'bottom',
            grid: true,
            label: {
                rotate: {
                    degrees: -45
                }
            }
        }];

        MyObject = {
            xtype: 'cartesian',
            store: me.store,
            axes: MyAxes,
			width: '100%',
			height: '100%',
            series: MySeries,
            insetPadding: {
                top: 10,
                bottom: 10,
                left: 10,
                right: 10
            },
            interactions: 'itemhighlight',
            animation: Ext.isIE8 ? false : {
                easing: 'bounceOut',
                duration: 500
            },
			legend: me.legend,
        };

        me.items = [MyObject];
        me.callParent();
    },
	onRender: function (ct, position) {
        kpiarea.superclass.onRender.call(this, ct, position);
        var me = this;
        if ((me.hasOwnProperty('height') == false) && (me.hasOwnProperty('anchor')) == false) {
			me.anchor = 'none 100%';
		}
    }
});


Ext.define('kpibar', {
    extend: 'Ext.panel.Panel',
    //extend: 'Ext.container.Container',
    alias: 'widget.kpibar',
	mixins: {
		field: 'Ext.form.field.Base'
	},
    title: 'Title',
    store: {},
    width: '100%',
    height: '100%',
    text: '',
    fieldLabel: '',
    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    valueField: 'TOT',
    valueFieldDual: null,
    displayField: 'NOME',
    datasourcefield: '',
    defaultValue: '',
    legend: false,
    referenceHolder: true,

    layout: {
        type: 'hbox'
    },

    initComponent: function() {
        var me = this;
        var fieldConfig = {
            //fieldLabel: me.fieldLabel, 
            width: me.width,
            height: me.height
        };
        var MySeries = {};
        var MyAxes = [];
        var MyObject = {};
        var ObjStore = me.store;
        this.totalInternal = new Ext.draw.sprite.Text({
            id: 'testId',
            x: 20,
            y: 20,
            text: '',
            fontSize: 20,
            fillStyle: 'yellowgreen'
        })

        if (me.store.toString() != "[object Object]") {
            //object store
            me.store = Ext.StoreManager.lookup(me.store);
        } else {
            //demo store
            me.store = {
                fields: [me.displayField, me.valueField, me.valueFieldDual],
                data: [
					{[me.displayField]: "Item-0", [me.valueField]: 18.34, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-1", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-2", [me.valueField]:  1.90, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-3", [me.valueField]: 21.37, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-4", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-5", [me.valueField]: 18.22, [me.valueFieldDual]: 2}
				]
            };
        }

        MySeries = {
            type: 'bar',
            axis: 'left',
            xField: [me.displayField],
            yField: [me.valueField],
            stacked: true,
            renderer: function(sprite, config, rendererData, index) {
                var record = rendererData.store.getAt(index)
                //return Ext.apply(config, { fill: record.get('color') });
                if (record){
                    if (record.get(me.valueField) < 0) {
                        return Ext.apply(config, {
                            fill: 'red'
                        });
                    }
                }
            }
        };
        MyAxes = [{
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
        }, {
            type: 'category',
            position: 'bottom',
            fields: me.displayField
        }];

        MyObject = Ext.create('Ext.chart.Chart', {
            store: me.store,
            axes: MyAxes,
            series: MySeries,
            insetPadding: {
                top: 40,
                bottom: 40,
                left: 20,
                right: 40
            },
            highlight: true,
			legend:me.legend,
            highlightCfg: {
                fillStyle: 'yellow',
                strokeStyle: 'red'
            },
            animation: Ext.isIE8 ? false : {
                easing: 'bounceOut',
                duration: 500
            },
        });

        Ext.apply(MyObject, fieldConfig);
        me.items = [MyObject];
        me.setTitle(me.fieldLabel);
        me.callParent();
    },
});

Ext.define('kpibar3d', {
    extend: 'Ext.panel.Panel',
    //extend: 'Ext.container.Container',
    alias: 'widget.kpibar3d',
	mixins: {
		field: 'Ext.form.field.Base'
	},
    title: 'Title',
    store: {},
    width: '100%',
    height: '100%',
    text: '',
    fieldLabel: '',
    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    valueField: 'TOT',
    valueFieldDual: null,
    displayField: 'NOME',
	groupDisplayField: 'TIPODESCRZIONE',
    datasourcefield: '',
    defaultValue: '',
    legend: {
                docked : 'top'
            },
    referenceHolder: true,
	stacked:true,
	colors: ['#A5BE23',"#2E7FC9"], // lime, blue
	
    layout: {
        type: 'hbox'
    },

    initComponent: function() {
        var me = this;
        var fieldConfig = {
            //fieldLabel: me.fieldLabel, 
            width: me.width,
            height: me.height
        };
        var MySeries = {};
        var MyAxes = [];
        var MyObject = {};
        var ObjStore = me.store;
        this.totalInternal = new Ext.draw.sprite.Text({
            id: 'testId',
            x: 20,
            y: 20,
            text: '',
            fontSize: 20,
            fillStyle: 'yellowgreen'
        })

        if (me.store.toString() != "[object Object]") {
            //object store
            me.store = Ext.StoreManager.lookup(me.store);
        } else {
            //demo store
            me.store = {
                fields: [me.displayField, me.valueField, me.valueFieldDual],
                data: [
					{[me.displayField]: "Item-0", [me.valueField]: 18.34, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-1", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-2", [me.valueField]:  1.90, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-3", [me.valueField]: 21.37, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-4", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-5", [me.valueField]: 18.22, [me.valueFieldDual]: 2}
				]
            };
        }
        MySeries = {
            type: 'bar3d',
            axis: 'left',
            xField: me.displayField,
            yField: me.groupDisplayField,
            stacked: me.stacked,
			marker: false,
			tooltip: {
				visible: true,
				trackMouse: false,
				renderer: function (toolTip, record, ctx) {
					let valuesTxt = '';
					me.valueField.forEach((el, idx, arr) => {
                        if (record.get(me.valueField[idx]) != undefined){
                            valuesTxt += el + ' ' + record.get(me.valueField[idx]);
                            if (idx + 1 !== arr.length){
                                valuesTxt += ' , ';
                            }
                        }
					});
					toolTip.setHtml(record.get(me.displayField) + ': ' + valuesTxt);
				}
			},
			/*
			tips: {
			  trackMouse: true,
			  width: 140,
			  height: 28,
			  renderer: function(storeItem, item) {
				this.setTitle(storeItem.get('name') + ': ' + storeItem.get('data') + ' views');
			  }
			},
			*/
			/*
			label: {
				display: 'insideEnd',
				field: 'data',
				renderer: Ext.util.Format.numberRenderer('0'),
				orientation: 'horizontal',
				color: '#333',
				'text-anchor': 'middle'
			},
			*/
            renderer: function(sprite, config, rendererData, index) {
                var record = rendererData.store.getAt(index)
                //return Ext.apply(config, { fill: record.get('color') });
                if (record){
                    if (record.get(me.valueField) < 0) {
                        return Ext.apply(config, {
                            fill: 'red'
                        });
                    }
                }
            }
        };
        MyAxes = [{
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
        }, {
            type: 'category3d',
            position: 'bottom',
            fields: me.displayField
        }];

        MyObject = Ext.create('Ext.chart.Chart', {
            store: me.store,
            axes: MyAxes,
            series: MySeries,
			legend: me.legend,
            insetPadding: {
                top: 40,
                bottom: 40,
                left: 20,
                right: 40
            },
			colors: me.colors,
            highlight: true,
            highlightCfg: {
                fillStyle: 'yellow',
                strokeStyle: 'red'
            },
            animation: Ext.isIE8 ? false : {
                easing: 'bounceOut',
                duration: 500
            }
        });

        Ext.apply(MyObject, fieldConfig);
        me.items = [MyObject];
        me.setTitle(me.fieldLabel);
        me.callParent();
    },
});


Ext.define('kpipietree', {
    extend: 'Ext.panel.Panel',
    //extend: 'Ext.container.Container',
    alias: 'widget.kpipietree',
	mixins: {
		field: 'Ext.form.field.Base'
	},
    title: 'Title',
    store: {},
    width: '100%',
    height: '100%',
    text: '',
    fieldLabel: '',
    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    valueField: 'TOT',
    valueFieldDual: null,
    displayField: 'NOME',
    datasourcefield: '',
    defaultValue: '',
    legend: false,
    referenceHolder: true,

    layout: {
        type: 'hbox'
    },

    initComponent: function() {
        var me = this;
        var fieldConfig = {
            //fieldLabel: me.fieldLabel, 
            width: me.width,
            height: me.height
        };
        var MySeries = {};
        var MyAxes = [];
        var MyObject = {};
        var ObjStore = me.store;
        this.totalInternal = new Ext.draw.sprite.Text({
            id: 'testId',
            x: 20,
            y: 20,
            text: '',
            fontSize: 20,
            fillStyle: 'yellowgreen'
        })

        if (me.store.toString() != "[object Object]") {
            //object store
            me.store = Ext.StoreManager.lookup(me.store);
        } else {
            //demo store
            me.store = {
                fields: [me.displayField, me.valueField, me.valueFieldDual],
                data: [
					{[me.displayField]: "Item-0", [me.valueField]: 18.34, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-1", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-2", [me.valueField]:  1.90, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-3", [me.valueField]: 21.37, [me.valueFieldDual]: 2},
					{[me.displayField]: "Item-4", [me.valueField]:  2.67, [me.valueFieldDual]: 1},
					{[me.displayField]: "Item-5", [me.valueField]: 18.22, [me.valueFieldDual]: 2}
				]
            };
        }
        MySeries = {
            type: 'd3-sunburst',
            axis: 'left',
            xField: [me.displayField],
            yField: [me.valueField],
            stacked: true,
            renderer: function(sprite, config, rendererData, index) {
                var record = rendererData.store.getAt(index)
                //return Ext.apply(config, { fill: record.get('color') });
                if (record){
                    if (record.get(me.valueField) < 0) {
                        return Ext.apply(config, {
                            fill: 'red'
                        });
                    }
                }
            }
        };
        MyAxes = [{
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
        }, {
            type: 'd3-sunburst',
            position: 'bottom',
            fields: me.displayField
        }];

        MyObject = Ext.create('Ext.chart.Chart', {
            store: me.store,
            axes: MyAxes,
            series: MySeries,
            reference: 'd3',
            padding: 20,
			legend: me.legend,
            tooltip: {
                renderer: function(component, tooltip, node) {
                    var total = 0;
                    this.getStore().each(function(rec) {
                        total += rec.get(me.valueField);
                    });
                    percent = Math.round(record.get(me.valueField) / total * 100) + '%';
                    tooltip.setHtml(record.get(me.displayField) + ': ' +
                        Math.round(record.get(me.valueField) / total * 100) + '%' + ' ' +
                        Ext.util.Format.currency(Math.round(record.get(me.valueField)))
                    );
                }
            },
            transitions: {
                select: false
            },
            listeners: {
                selectionchange: function(sunburst, node) {
                    sunburst.zoomInNode(node);
                }
            }
        });

        Ext.apply(MyObject, fieldConfig);
        me.items = [MyObject];
        me.setTitle(me.fieldLabel);
        me.callParent();
    },
});