Ext.define('dynamiccombobutton', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.dynamiccombobutton',
	mixins: {
        field: 'Ext.form.field.Base'
    },
	//style: { borderColor: '#000000', borderStyle: 'solid', borderWidth: '1px' },
	minHeight: 50,
	minWidth: 50,
  //  width: 500, 
	scrollX : 0,
	scrollY : 0,
	scrollable: {
		y: 'scroll'
	},
	touchAction: {
		panY: true,
		panX: true,
		body: {
			pinchZoom: true
		}
	},
	listeners: {
		swipe: {
			element: 'body',
			fn: function(e, node, options, eOpts) {
				var me = this.component;
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
	
	buttonHeight : 250,
	buttonWidth : 250,
	buttonColumnWidth : 0.25,
	text:'',
	
	fontColor: 'white',
	backColor: 'red',
	iconColor: 'white',
	iconAW: 'fa-external-link',
	
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'TABLE',
	valueField: 'ID',
	displayField: 'DESCRIZIONE',
	iconField: '',
	imageField:'',
	colorField:'',
	colorFieldNum: '',
	datasourcefield: 'dynamicgrid1',
	defaultValue: '',
	
	/*RECORD EDITING DEFINITION*/
	layouteditorid:'',
	layouteditorWindowMode: 'acDialog',
	
	/* ACTIVABLE COLUMNS */
	ActionColumn: false, //procid requested
	
	/* EVENT ON CHANGE*/
	autopostback: false,
	
	layout : {
		type: 'auto',
		align: 'stretch'
	},
	
	/* add store to obj */
    config: {
        store: 'ext-empty-store'
    },
    publishes: 'store',
    applyStore: function(store) {
        return Ext.getStore(store);
    },
	
	/* init component */
	initComponent: function () {
        var me = this;
		var fieldConfig = {
			width:me.width, 
			height:me.height
		};
		if (me.store.toString() != "[object Object]") {
			//store defined
		}else{
			//demo store
			var myButtons = [];
			myButtons[myButtons.length++] = myButton;
			var myButton = {
				xtype: 'button',
				name: 'btn2',
				text: me.displayField,
				textvalue: me.valueField,
				columnWidth: me.buttonColumnWidth,
				cls : 'wrap-button',
				height: me.buttonHeight,
				width: me.buttonWidth,
				bodyPadding: '20 0',
				scale: 'large'
			};
			myButtons[myButtons.length++] = myButton;
			
			//Ext.suspendLayouts();
			//me.removeAll();
			//me.add(myButtons);
			//Ext.resumeLayouts(true);
			Ext.apply(myButton,fieldConfig);
			me.items = [myButton];
		}
		me.callParent();
    },
	
	/* assign the event to itself when the object is initialising    */
    onRender: function(ct, position){
		dynamiccombobutton.superclass.onRender.call(this, ct, position);
		this.store.on('load', this.storeLoad, this);
    },
    storeLoad: function(){
		var me = this;
		var myButtons = [];
		var allRecords = me.store.snapshot || me.store.data;
		var items = allRecords.items;
		for (index = 0; index < items.length; ++index) {
			var record = items[index];
			var myButton = {
				xtype : 'button',
				text: record.data[me.displayField],
				textvalue: record.data[me.valueField],
				record: record.data,
				columnWidth: me.buttonColumnWidth,
				cls: ((me.colorField != '') ? 'color' + record.data[me.colorField] + '-button'   : 'wrap-button'),
				height: me.buttonHeight,
				width: me.buttonWidth,
				shrinkWrap: true,
				bodyPadding: '20 0',
				margin: '10 10 10 10',
				scale  : ((me.iconField != '') ? 'large': 'small'),	
				iconCls: ((me.iconField != '') ? 'x-fa ' + record.data[me.iconField] + ' fa-4x' : null),
				style: {
					'fontSize': '10px',
					'color': me.fontColor,
					'backgroundColor': record.data[me.colorFieldNum], 
					'fontWeight': '700',
					'border': 0,
					'background-image': ((me.imageField != '') ? "url('includes/io/CallFile.php?fileid=" + record.data[me.imageField] + "')" : null),
					'background-size': '100%',
					'white-space': 'normal',
					'text-overflow': 'clip',
					'overflow': 'visible'
				},
				listeners : {
					click: function(){
						log('pressed value' + this.textvalue)
						me.text = this.textvalue;
						
						if (me.ActionColumn) {
							var SaveStringData = Custom.ArrayToString(record.data);
							SaveStringData += '&objname' + '=' + me.name + '';
							Custom.SaveStringData(SaveStringData,'');
						}else{
							me.fireEvent('click',me, event);
						}
						//this.store.on('load', this.storeLoad, this);
					}
				}
			};
			myButtons[myButtons.length++] = myButton;
		}
		Ext.suspendLayouts();
		me.removeAll();
		me.add(myButtons);
		Ext.resumeLayouts(true);
	},
	
	/* add property to manage as field in form*/
	initValue : function(){
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
        var me = this,
            data = null;
		data = {};
		data[me.getName()] = '' + me.text;
        return data;
    }
});