Ext.define('dynamicbutton', {
	extend: 'Ext.panel.Panel',
	//extend: 'Ext.container.Container',
	//extend: 'Ext.Widget',
    alias: 'widget.dynamicbutton',	
	
	//padding:'5 5 5 5',
	//style: { borderColor: '#000000', borderStyle: 'solid', borderWidth: '1px' },
    frame: false,
    width: 250, 
	
	fieldLabel : '',
	fontColor: 'white',
	backColor: 'red',
	iconColor: 'white',
	iconAW: 'fa-external-link',
	
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	valueField: 'ID',
	displayField: 'NOME',
	datasourcefield: '',
	
	layout: {
		type: 'hbox', //vbox, hbox, auto, absolute,
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
	
	initComponent: function () {
        var me = this;
		me.bodyStyle = {
			"background-color":me.backColor, 
			"padding":'5px 5px 5px 5px' 
		};
		
		var TitleObj = {
			xtype: 'label',	
			itemId: 'titleLabel',
			labelWidth: 200,
			text: me.fieldLabel,
			style: {
				fontSize: '30px',
				color: me.fontColor,
				fontWeight: '700',
				background: 'transparent',
				border: 0
			},
		};
		var ValueObj = {
			xtype: 'label',	
			itemId: 'valueLabel',
			labelWidth: 200,
			text: 'valueXX099',
			style: {
				fontSize: '20px',
				color: me.fontColor,
				fontWeight: '700',
				background: 'transparent',
				border: 0
			},
		}
		var CommentObj = {
			xtype: 'label',	
			itemId: 'commentLabel',
			labelWidth: 200,
			text: me.tooltip,
			style: {
				fontSize: '15px',
				color: me.fontColor,
				//fontWeight: '700',
				background: 'transparent',
				border: 0
			}
		};
		var infoPanel = {
			xtype: 'panel',		
			flex:2,					
			layout: {
				type: 'vbox', //vbox, hbox, auto, absolute,
				align: 'stretch'
			},
			items: [TitleObj,ValueObj,CommentObj],
			style: {
				textAlign: 'left',
				lineHeight: '1.0',
			},
			bodyStyle: {
				background:"transparent"
			},
		}
		
		/*
		var immaPanel = {
			flex:1,	
			xtype: 'image',
			src: '/repositorycom/s_generico.jpg',
		};
		*/
		var valutationPanel = {
               xtype: 'image',
               autoEl: 'div',
               cls: 'x-fa fa-star',
               alt: 'star',
               style: {
                    fontSize: '36px',
					color: me.fontColor,
                    lineHeight: '36px'
               },
               height: 36,
               width: 36
        };
		var immaPanel = {
			flex:1,	
		//	padding: '10 0 0 0',
			xtype: 'button',
			iconCls: 'x-fa ' + me.iconAW + ' fa-4x',
			style: {
				background:"transparent",
				border: 0,
				color: me.iconColor,
				textAlign: 'center',
			}
		};
		
		me.items = [infoPanel,valutationPanel, immaPanel];
		me.callParent();     
    },
    onRender: function(ct, position){
		dynamicbutton.superclass.onRender.call(this, ct, position);
		this.store.on('load', this.storeLoad, this);
    },
    storeLoad: function(){
		var me = this;
		var objlabel = this.getComponent('valueLabel')
		//var objlabel = me.down('valueLabel');
		objlabel.setText( me.store.data.items[0].data[me.valueField]);
		
		//Ext.each(me.store.proxy.reader.rawData.columns, function(columnphp){
		//}
	}
});