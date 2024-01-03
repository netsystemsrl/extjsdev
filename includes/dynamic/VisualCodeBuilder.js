Ext.define('VisualCodeBuilder', {
    extend: 'Ext.window.Window',
    alias: 'widget.qbwindow',
	mixins: ['Ext.form.field.Field'],
	requires: ['Ext.draw.*',],
    height: 600,
    width: 900,
	text : '',
	fieldLabel : '',
	name: 'VisualCodeBuilder',
	id: 'VisualCodeBuilder',
	title: 'Visual Code Builder',
	config: {
        SqlStringConfig: {},
		statusview: 'designer',
    },
    layout: {
        type: 'border'
    },
	listeners:{
		beforeclose:function(win) {
			var VisualCodeBuilder = Ext.get('VisualCodeBuilder').component;
			ux.vqbuilder.sqlSelect.removeAllObj();
			VisualCodeBuilder.hide();
			return false;
		},
	},
	referenceHolder: true,
    afterRender: function () {
        var me = this;
        me.callParent();
    },
	initComponent: function(){
        var me = this;
		var config = {  
			statusview: 'designer',
		};
		Ext.apply(me, config);
		
		me.items = [
			Ext.apply({
				xtype: 'sqloutputpanel',
				border: false,
				region: 'center',
				autoScroll: true,
				html: '<pre class="brush: sql">CODE Output Window</pre>',
				margin: 5,
				height: 150,
				split: true
			},SqlStringConfig),
			Ext.apply({
				xtype: 'panel',
				id: 'subpanelnorth',
				border: false,
				height: 400,
				margin: 5,
				layout: {
					type: 'border'
				},
				region: 'north',
				split: true,
				items: [{
					xtype: 'sqltablepanel',
					border: false,
					region: 'center',
					height: 280,
					split: true,
					layout : {
						type: 'fit',
						align: 'stretch'
					},
				}, {
					xtype: 'sqlfieldsgrid',
					border: false,
					region: 'south',
					height: 120,
					split: true
				}, {
					xtype: 'sqltabletree',
					border: false,
					region: 'west',
					width: 200,
					height: 400,
					split: true
				}]
			}),
			Ext.apply({
				xtype: 'panel',
				id: 'subpanelsqlnorth',
				border: false,
				height: 400,
				margin: 5,			
				hidden: true,
				layout: {
					type: 'border'
				},
				region: 'north',
				split: true,
				items: [
					{	xtype: 'sqltest',
						border: false,
						region: 'center',
						height: 280,
						split: true,
						layout : {
							type: 'fit',
							align: 'stretch'
						}
					}
				]
			}
			)	
		];
		
		// add toolbar to the dockedItems
        me.dockedItems = [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
			{
                text: "Save",
                icon: "/assets/images/icon-save.gif",
				xtype: 'button',
				id: 'SaveSQLButton',
				listeners: {click: function() {	
					var me = this;
					var sqlQutputPanel = Ext.getCmp('SQLOutputPanel');
					var VisualCodeBuilder = Ext.get('VisualCodeBuilder').component;
					VisualCodeBuilder.hide();
					VisualCodeBuilder.fireEvent('applySQL',sqlQutputPanel.sqltext);
					me.fireEvent('applySQL',sqlQutputPanel.sqltext);
					},
				}
            }, {
                text: "Run/Design",
                icon: "/assets/images/run.png",
				xtype: 'button',
				id: 'RunSQLButton',
				listeners: {click: function() {	
					var subpanelnorth = Ext.getCmp('subpanelnorth');
					var subpanelsqlnorth = Ext.getCmp('subpanelsqlnorth');
					var VisualCodeBuilder = Ext.get('VisualCodeBuilder').component;
					if (VisualCodeBuilder.statusview == 'designer') {
						//metti in visualizzazione SQL
						subpanelnorth.hide();
						subpanelsqlnorth.setDisabled(true);
						//subpanelsqlnorth.store.removeAll();
						var DS_VisualSQLQueryTest = Ext.data.StoreManager.get('DS_VisualSQLQueryTest' );
						var sqlQutputPanel = Ext.getCmp('SQLOutputPanel');
						console.log('load sql test' + sqlQutputPanel.sqltext);
						DS_VisualSQLQueryTest.reload({params: { datasourcetype:'SELECT', datasource: sqlQutputPanel.sqltext, start: 1, limit: 100, datawhere: '' },});
						subpanelsqlnorth.show();
						subpanelsqlnorth.setDisabled(false);
						VisualCodeBuilder.statusview = 'sqltest'
					} else {
						//metti in visualizzazione Designer
						subpanelnorth.show();
						subpanelsqlnorth.hide();
						VisualCodeBuilder.statusview = 'designer'
					}
					subpanelnorth.updateLayout();
					},
				}
            }, {
                text: "LoadT",
                icon: "/assets/images/icon-load.gif",
				xtype: 'button', 
				hidden: true,
				id: 'LoadTSQLButton',
				listeners: {click: function() {	
					ux.vqbuilder.sqlSelect.toDesignerTable();
				},
				}
            }, {
                text: "LoadF",
                icon: "/assets/images/icon-load.gif",
				xtype: 'button', 
				hidden: true,
				id: 'LoadFSQLButton',
				listeners: {click: function() {	
					ux.vqbuilder.sqlSelect.toDesignerField();
					},
				}
            }, {
                text: "LoadJ",
                icon: "/assets/images/icon-load.gif",
				xtype: 'button', 
				hidden: true,
				id: 'LoadJSQLButton',
				listeners: {click: function() {	
					ux.vqbuilder.sqlSelect.toDesignerJoin();
					},
				}
            }, {
                xtype: 'tbfill'
            }, {
                text: "SELECT",
                icon: "/assets/images/icon-select.gif",
				xtype: 'button', 
				id: 'SelectSQLButton',
				listeners: {click: function() {	
					ux.vqbuilder.sqlSelect.typesql = 'SELECT';
					ux.vqbuilder.sqlSelect.updateSQLOutput();
					},
				}
            }, {
                text: "UPDATE",
                icon: "/assets/images/icon-update.gif",
				xtype: 'button', 
				id: 'UpdateSQLButton',
				listeners: {click: function() {	
					ux.vqbuilder.sqlSelect.typesql = 'UPDATE';
					ux.vqbuilder.sqlSelect.updateSQLOutput();
					},
				}
            }, {
                text: "DELETE",
                icon: "/assets/images/icon-delete.gif",
				xtype: 'button', 
				id: 'DeleteSQLButton',
				listeners: {click: function() {	
					ux.vqbuilder.sqlSelect.typesql = 'DELETE';
					ux.vqbuilder.sqlSelect.updateSQLOutput();
					},
				}
            }, {
                text: "INSERT",
                icon: "/assets/images/icon-insert.gif",
				xtype: 'button', 
				id: 'InsertSQLButton',
				listeners: {click: function() {	
					ux.vqbuilder.sqlSelect.typesql = 'INSERT';
					ux.vqbuilder.sqlSelect.updateSQLOutput();
					},
				}
            }
			]
        }];
        
        // apply to the initialConfig
        Ext.apply(me.initialConfig, me);
		
        me.callParent(arguments);
    },
	getSubmitData: function () {
		var me = this;
        var sqlQutputPanel = Ext.getCmp('SQLOutputPanel');
        return sqlQutputPanel.sqltext;
    },
	setValue : function(value){
		var me = this;
        if (value == null) {
            return;
        } else {
			// apply to the initialConfig
			//Ext.apply(this, this.initialConfig);
			ux.vqbuilder.sqlSelect.setSQL(value);
        }
	},
	getInputId: function () {
        return null;
    },
	getValue: function () {
        var me = this;
        var sqlQutputPanel = Ext.getCmp('SQLOutputPanel');
        return sqlQutputPanel.sqltext;
    },
	
    setCursorPosition: function(pos) {
       var el = this.getEl().dom;
       if (el.createTextRange) {
          var range = el.createTextRange();
          range.move("character", pos);
          range.select();
       } else if(typeof el.selectionStart == "number" ) { 
          el.focus(); 
          el.setSelectionRange(pos, pos); 
       } else {
         alert('Method not supported');
       }
    },

    getCursorPosition: function() {
       var el = this.getEl().dom;
       var rng, ii=-1;
       if (typeof el.selectionStart=="number") {
          ii=el.selectionStart;
       } else if (document.selection && el.createTextRange){
          rng=document.selection.createRange();
          rng.collapse(true);
          rng.moveStart("character", -el.value.length);
          ii=rng.text.length;
       }
       return ii;
    }
});


