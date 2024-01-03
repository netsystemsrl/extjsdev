Ext.define('dynamicgridform', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.dynamicgridform',
	mixins: {
        field: 'Ext.form.field.Base'
    },
	submitFormat: 't',
	submitValue: true,
	massUpdate:false,
	title: '',
	text : '',
	keyValue:'',
	selectedid : '',
	remoteSort: true,
	remoteSearch: true,
	localdatawhere : '',
	/*ACTIVABLE ACTIONS*/
	allowfilter: false,
	allowadd: false,
	allowedit: false,
	allowdelete: false,
	allowexport: false,
	allowsearch: false,
	/*ACTIVABLE PROCESS*/
	CheckColumn: false, //layouteditorid, ActionColumn or ActionTrueFalseColumn requested
	ActionColumn: false, //procid requested
	ActionTrueFalseColumn: false, //procid requested
	NoteColumn: false, //layouteditorid requested
	/* VIEW */
	DectailColumn: false, //layouteditorid requested
	DeleteColumn: false,
	NumberColumn: false,
	/* DATA */
	valueField: 'ID',
	displayField: 'DESCRIZIONE',
	keyField:'ID',
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	datasourcefield: 'dynamicgridform1',
	/* RECORD EDITING DEFINITION */
	layouteditorid:'',
	layouteditorWindowMode: 'acDialog',
	/* EVENT ON CHANGE*/
	autopostback: false,
	
	minHeight: 50,
	minWidth: 50,
	
	autoScroll: true,
	text:'',
	OriginalItems: '',
	
	layout : {
		type: 'absolute',
		align: 'stretch'
	},
	layoutInternal: 'absolute',
	
	/* add store to obj */
    config: {
        store: 'ext-empty-store'
    },
    publishes: 'store',
    applyStore: function(store) {
        return Ext.getStore(store);
    },
	
	bbar: {
		xtype: 'toolbar',
		itemId: 'gridtoolbar',
		dock: 'bottom',
		items:[
			'-', {
				itemId: 'RefreshBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-refresh',
				cls: 'x-btn-text-icon',
				handler:function(button, event) {
					var me = button.up('dynamicgridform');
					CurrentPanel = me.up('panel');
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					if  (me.localdatawhere != ''){
						me.getStore().reload({ params: { datawhere: me.localdatawhere } });
					}else{
						me.getStore().reload();
					}
				}
			},
			'-', {
				itemId: 'SaveBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-floppy-o',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler:function(button, event) {	
					var me = button.up('dynamicgridform');
					CurrentPanel = me.up('panel');
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					me.SaveMassUpdate();
				},
			},
			'-', {
				itemId: 'DeleteBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-trash-o',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler:function(button, event) {
					var me = button.up('dynamicgridform');
					CurrentPanel = me.up('panel');
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					me.SaveMassUpdate();
					Custom.ExecuteProc('DELETE');
					me.getStore().reload();
				}
			}, 				
			'-', {
				itemId: 'AddBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-asterisk',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler: function(button, event) {
					var me = button.up('dynamicgridform');
					CurrentPanel = me.up('panel');
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					var NameChiave = me.valueField;
					//var ValRiga = me.store.data.items[0].data[NameChiave];
					if ((me.layouteditorid != 0) && (me.layouteditorid !== undefined)) {
						CurrentLayoutDataSourceFieldValue = "";
						var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
						ValRiga = DS_Form00.data.items[0].data[me.datasourcefield];
						log('dynamicgridform add' + NameChiave + '=' + ValRiga );
						if ((CurrentPanelRaw.ViewType == 'form') && (ValRiga === undefined)){
							Custom.ExecuteProcRequest('SAVE');
							Custom.FormDataSave();	
						}else{
							Custom.LayoutRender(me.layouteditorid, 'form', NameChiave + " = " + ValRiga + "", 'add', me.layouteditorWindowMode);
						}
						//Custom.LayoutRender(me.layouteditorid,'form', NameChiave + " = " + ValRiga + "", 'add');
						//var DesignPanel = Ext.getCmp('DesignPanel');
						//var form = DesignPanel.getForm();
						//var FieldID = form.findField(NameChiave);
						//FieldID.setValue(CurrentLayoutDataSourceFieldValue);
						
						//Custom.FormDataNew();
					}
				}
			},
			'-', {
				itemId: 'DplBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-clone',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler: function(button, event) {
					var me = button.up('dynamicgridform');
					CurrentPanel = me.up('panel');
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					var NameChiave = me.keyField;
					var ValRiga = me.keyValue;
					if ((me.layouteditorid != 0) && (me.layouteditorid !== undefined)) {
						//CurrentLayoutDataSourceFieldValue = ValRiga;
						//var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
						//ValRiga = DS_Form00.data.items[0].data[me.datasourcefield];
						log('dynamicgridform clone' + NameChiave + '=' + ValRiga );
						//Custom.LayoutRender(me.layouteditorid,'form', NameChiave + " = " + ValRiga + "", 'clone');
						//var DesignPanel = Ext.getCmp('DesignPanel');
						//Custom.FormDataClone();
						
						Custom.LayoutRender(me.layouteditorid, 'form', NameChiave + " = " + ValRiga + "", 'clone', me.layouteditorWindowMode);
					}
				}
			},
			'-', {
				itemId: 'ExcelBtn',
				pressed: false,
				enableToggle:false,
				hidden: true,
				iconCls: 'x-fa fa-file-excel-o',
				cls: 'x-btn-text-icon',
				handler:function(button, event) {	
					var me = button.up('dynamicgridform');
					CurrentPanel = me.up('panel');
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					me.export();
				},
			},
			'-', {
				itemId: 'SearchField',
				xtype: 'textfield',
				width: 120,
				emptyText: 'search...',
				hidden: true,
                enableKeyEvents : true,
				listeners: {
					specialkey: function(field, event){
						if(event.getKey() === event.ENTER){
							var me = this;
							field.up('dynamicgridform').store.clearFilter();
							//override remote
							me.remoteSearch = true;
							if (me.getValue() != '') {
								if (me.remoteSearch == true) {
									log('remote filtering');
									var remoteFilter = new Ext.util.Filter({
										id: 'innerSearch',
										property: 'innerSearch',
										type:'strings',
										operator: 'like',
										value: me.getValue()
									});
									field.up('dynamicgridform').store.addFilter(remoteFilter);
									//appowhere = 'innerSearch' + '=' + me.getValue();
									//field.up('dynamictreegrid').store.load({ params: { datawhere: appowhere } });
								}else{
									log('local filtering');
									var regex = RegExp(me.getValue(), 'i');
									if (me.getValue() != '') {
										var regex = RegExp(me.getValue(), 'i');
										field.up('dynamicgridform').store.filter(new Ext.util.Filter({
											filterFn: function (object) {
												var match = false;
												Ext.Object.each(object.data, function (property, value) {
													match = match || regex.test(String(value));
												});
												return match;
											  }
										}));
									}
								}
							}
						}
					}
				},
			},
			'-', {
				itemId: 'ActionTrueBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-long-arrow-right',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler:function(button, event) {	
					var me = button.up('dynamicgridform');
					CurrentPanel = me.up('panel');
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					Ext.getBody().mask("Wait, executing for every selected row ..");
					Ext.Function.defer(function() {
						//colleziona record selezionati ed esegue action abbinata
						me.PostMassAction(me.ActionColumn,'');
						//esegue action complessiva
						Custom.ExecuteProc(me.CheckColumn);
						Ext.getBody().unmask();
					}, 10);	
					var current = me.store.currentPage;
					if (me.fireEvent('beforechange', me, current) !== false) {
						me.store.loadPage(current);
						//me.getStore().reload();
					}
				},
			},
			'-', {
				itemId: 'ActionTrueFalseTrueBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-thumbs-up',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler:function(button, event) {	
					var me = button.up('dynamicgridform');
					CurrentPanel = me.up('panel');
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					Ext.getBody().mask("Wait, executing for every selected row ..");
					Ext.Function.defer(function() {
						//colleziona record selezionati ed esegue action abbinata
						me.PostMassAction(me.ActionTrueFalseColumn,'true');
						//esegue action complessiva
						Custom.ExecuteProc(me.CheckColumn);
						Ext.getBody().unmask();
					}, 10);	
					var current = me.store.currentPage;
					if (me.fireEvent('beforechange', me, current) !== false) {
						me.store.loadPage(current);
						//me.getStore().reload();
					}
				},
			},
			'-', {
				itemId: 'ActionTrueFalseFalseBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-thumbs-o-down',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler:function(button, event) {	
					var me = button.up('dynamicgridform');
					CurrentPanel = me.up('panel');
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					Ext.getBody().mask("Wait, executing for every selected row ..");
					Ext.Function.defer(function() {
						//colleziona record selezionati ed esegue action abbinata
						me.PostMassAction(me.ActionTrueFalseColumn,'false');
						//esegue action complessiva
						Custom.ExecuteProc(me.CheckColumn);
						Ext.getBody().unmask();
					}, 10);	
					var current = me.store.currentPage;
					if (me.fireEvent('beforechange', me, current) !== false) {
						me.store.loadPage(current);
						//me.getStore().reload();
					}
				},
			},
			'-', {
				itemId: 'LabelRecord',
				xtype: 'label',
				width: 120,
				text: 'Record 0 of 0',
			}
		],
		doRefresh : function(){
			var me = this,
			current = me.store.currentPage;
			if (me.fireEvent('beforechange', me, current) !== false) {
				me.store.loadPage(current);
				//me.getStore().reload();
			}
		},
	},
	
	/* init component */
	initComponent: function () {
        var me = this;
		me.OriginalItems = me.items;
		if (me.store.toString() != "[object Object]") {
			//store defined
		}else{
			//demo store
		}
		me.callParent();
    },
	
	/* assign the event to itself when the object is initialising    */
    onRender: function(ct, position){
		dynamicgridform.superclass.onRender.call(this, ct, position);
		this.store.on('load', this.storeLoad, this);
    },
    storeLoad: function(){
		var me = this;
		var myRecordPanels = [];
		var allRecords = me.store.snapshot || me.store.data;
		var RecItems = allRecords.items;
		var myRecordPanel;
		var record;
		
		var me = this;
		var columns = [];
		
		Ext.suspendLayouts();
		me.removeAll();
		
		//label record
		if (me.store.totalCount > me.store.proxy.extraParams.limit){
			me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Record ' + me.store.proxy.extraParams.limit + ' of ' + me.store.totalCount);
		}else{
			me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Record ' + me.store.totalCount + ' of ' + me.store.totalCount);
		}
		
		if (me.allowdelete) {
			this.getComponent('gridtoolbar').getComponent('DeleteBtn').show();
			this.getComponent('gridtoolbar').getComponent('SaveBtn').show();
		}
		if (me.allowadd) {
			this.getComponent('gridtoolbar').getComponent('AddBtn').show();
			this.getComponent('gridtoolbar').getComponent('DplBtn').show();
			this.getComponent('gridtoolbar').getComponent('SaveBtn').show();
		}
		if (me.allowexport) this.getComponent('gridtoolbar').getComponent('ExcelBtn').show();
		if (me.allowsearch) this.getComponent('gridtoolbar').getComponent('SearchField').show();
		
		for (index = 0; index < RecItems.length; ++index) {
			record = RecItems[index];
			
		/*  generate FormToolbar  */
			myRecordPanelToolbar = [];
			
			/*  adding NumberColumn  */
			if(me.NumberColumn) {   };

			/*  adding DectailColumn  */			
			if (me.DectailColumn) { 
				myRecordPanelToolbar[myRecordPanelToolbar.length++] ={
					xtype : 'button',
					iconCls: 'x-fa fa-expand',
					tooltip : 'Dectail',
					listeners: {
						click: function (button, event) {
							
							var meForm = button.up('form');
							var me = button.up('dynamicgridform');
							CurrentPanel = me.up('panel');
							var rowIndex = meForm.name.split("_")[1];
							var NameChiave = me.keyField;
							var ValRiga = RecItems[rowIndex].data[NameChiave];
							me.processOnButton(me, rowIndex, RecItems[rowIndex], '', 'autocommit=false');
							
							//apri in edit il record
							if ((me.layouteditorid != 0) && (me.layouteditorid !== undefined)) {
								//NameChiave = CurrentLayoutDataSourceField;
								CurrentLayoutDataSourceFieldValue = ValRiga;
								log('dynamicgrid ' + NameChiave + '=' + ValRiga );
								appowhere = '';
								if (Custom.isNumber(ValRiga) == true)
									appowhere =  NameChiave + '=' + ValRiga;
								else
									appowhere =  NameChiave + "='" + ValRiga + "'";
								Custom.LayoutRender(me.layouteditorid, 'form', appowhere, 'edit', me.layouteditorWindowMode);
							}
						}
					}
				};
			};
			
			/*  adding NoteColumn  */			
			if (me.NoteColumn) { 
				myRecordPanelToolbar[myRecordPanelToolbar.length++] ={
					xtype : 'button',
					iconCls: 'x-fa fa-sticky-note',
					tooltip : 'Dectail',
					listeners: {
						click: function (button, event) {
							var meForm = button.up('form');
							var me = button.up('dynamicgridform');
							CurrentPanel = me.up('panel');
							var rowIndex = meForm.name.split("_")[1];
							var NameChiave = me.keyField;
							var ValRiga = RecItems[rowIndex].data[NameChiave];
							me.processOnButton(me, rowIndex, RecItems[rowIndex], me.NoteColumn,'autocommit=false');
						}
					}
				};
			};
			
			/*  adding CheckColumn  */
			if (me.CheckColumn != 0) { 
				myRecordPanelToolbar[myRecordPanelToolbar.length++] ={
					xtype : 'checkcolumn',
					listeners: {
						click: function (button, event) {
							var meForm = button.up('form');
							var me = button.up('dynamicgridform');
							CurrentPanel = me.up('panel');
							var rowIndex = meForm.name.split("_")[1];
							var NameChiave = me.keyField;
							var ValRiga = RecItems[rowIndex].data[NameChiave];
							me.processOnButton(me, rowIndex, RecItems[rowIndex], me.NoteColumn,'autocommit=false');
						}
					}
				};			
				if (me.ActionColumn) this.getComponent('gridtoolbar').getComponent('ActionTrueBtn').show();
				if (me.ActionTrueFalseColumn) {
					this.getComponent('gridtoolbar').getComponent('ActionTrueFalseTrueBtn').show();
					this.getComponent('gridtoolbar').getComponent('ActionTrueFalseFalseBtn').show();
				}
			};
			
			/*  adding ActionColumn  */			
			if (me.ActionColumn != 0) { 
				myRecordPanelToolbar[myRecordPanelToolbar.length++] ={
					xtype : 'button',
					iconCls: 'x-fa fa-long-arrow-right',
					tooltip : 'Action',
					listeners: {
						click: function (button, event) {
							var meForm = button.up('form');
							var me = button.up('dynamicgridform');
							CurrentPanel = me.up('panel');
							var rowIndex = meForm.name.split("_")[1];
							var NameChiave = me.keyField;
							var ValRiga = RecItems[rowIndex].data[NameChiave];
							me.processOnButton(me, rowIndex, RecItems[rowIndex], me.ActionColumn, 'autocommit=false');
						}
					}
				};
			};
			
			/*  adding DeleteColumn  */			
			if (me.DeleteColumn) {
				myRecordPanelToolbar[myRecordPanelToolbar.length++] ={
					xtype : 'button',
					iconCls: 'x-fa fa-trash-o',
					tooltip : 'Delete',
					listeners: {
						click: function (button, event) {
							var meForm = button.up('form');
							var me = button.up('dynamicgridform');
							CurrentPanel = me.up('panel');
							var rowIndex = meForm.name.split("_")[1];
							var NameChiave = me.keyField;
							var ValRiga = RecItems[rowIndex].data[NameChiave];
							me.processOnButton(me, rowIndex, RecItems[rowIndex], 'DELETE','autocommit=false');
						}
					}
				};
			};
			
			/*  adding ActionTrueFalseColumn  */			
			if (me.ActionTrueFalseColumn != 0) {
				myRecordPanelToolbar[myRecordPanelToolbar.length++] ={
					xtype : 'button',
					iconCls: 'x-fa fa-thumbs-up',
					tooltip : 'ActionTrue',
					listeners: {
						click: function (button, event) {
							var meForm = button.up('form');
							var me = button.up('dynamicgridform');
							CurrentPanel = me.up('panel');
							var rowIndex = meForm.name.split("_")[1];
							var NameChiave = me.keyField;
							var ValRiga = RecItems[rowIndex].data[NameChiave];
							ParametersExtraString = 'Action=true' + '&autocommit=false';
							me.processOnButton(me, rowIndex, record, me.ActionTrueFalseColumn, ParametersExtraString);
						}
					}
				};
				myRecordPanelToolbar[myRecordPanelToolbar.length++] ={
					xtype : 'button',
					iconCls: 'x-fa fa-thumbs-o-down',
					tooltip : 'ActionTrue',
					listeners: {
						click: function (button, event) {
						ParametersExtraString += 'Action=false' + '&autocommit=false';
							me.processOnButton(me, rowIndex, record, me.ActionTrueFalseColumn, ParametersExtraString);
						}
					}
				};
			};
				
			
		/*  generate Form  */
			myRecordPanel = null;
			myRecordPanel = Ext.create('Ext.form.Panel', {
								name: 'FormRow_' + index,
								layout : {
									type: me.layoutInternal,
									align: 'stretch'
								},
								bbar: {
									xtype: 'toolbar',
									itemId: 'gridtoolbar',
									items: myRecordPanelToolbar
								}
							});	
			/*  adding DataColumn  */
			myRecordPanel.add(clone(me.OriginalItems));	
			/*  compile data with curr record  */
			myRecordPanel.getForm().loadRecord(record);
			
			me.add(myRecordPanel);
		}
		Ext.resumeLayouts(true);
	},
	
	processOnButton: function(grid, rowIndex, record, processId, ParametersExtraString){
		if (typeof ParametersExtraString === undefined) { ParametersExtraString = ''; }
		
		var selectedRowDataString = '';
		var selectedRowIndexes = [];
		var selectedRowData = [];
		Ext.iterate(record.data, function(key, value) {
			//log(key+ ' '+  value);
			selectedRowData[key] = value;
			valueappo = value;
			if (toType(value) == 'date'){
				var curr_day = value.getDay()
				var curr_month = value.getMonth() + 1; //Months are zero based
				var curr_year = value.getFullYear();
				if (curr_day < 10) curr_day = "0" + curr_day;
				if (curr_month < 10) curr_month = "0" + curr_month;
				value = curr_year + "-" + curr_month + "-" + curr_day;
			}
			if ((key.indexOf('SOURCE') == -1) && (key.indexOf('JSON') == -1)){
				selectedRowDataString += key + '=' + value + '&';
			}
		});
		
		if (Custom.IsNOTNullOrEmptyOrZeroString(grid.layouteditorid)){
			selectedRowDataString += 'layoutid' + '=' + grid.layouteditorid + '&'
		}else{
			selectedRowDataString += 'layoutid' + '=' + CurrentPanelRaw.id + '&'
		}
		selectedRowDataString +=  ParametersExtraString;
		Ext.Ajax.request({
			params:  selectedRowDataString,
			url: 'includes/io/DataWrite.php',
			method:'POST',
			async: false,
			waitTitle:'Connecting',
			waitMsg:'Invio dati...',
			success: function(resp) {
				var appo = Ext.util.JSON.decode(resp.responseText)
				Custom.ExecuteProc(processId);
			},
			failure: function() {
				Ext.Msg.alert('error', 'Not Ok');
			}
		});
	},
	
	/* MASS UPDATE */
	SaveMassUpdate: function() {
		//trova record aggiornati
		var records = this.getStore().getRange();
		for(var i = 0; i < records.length; i++){
			var rec = records[i];
			if(rec.dirty == true){
				this.SaveRecordUpdate(rec);
			}
		}
	},
	
	SaveRecordUpdate: function(dirtyRecord) {
		var selectedRowDataString = '';
		var selectedRowIndexes = [];
		var selectedRowData = [];
		Ext.iterate(dirtyRecord.modified, function(key, value) {
			var valuetowrite = dirtyRecord.data[key];
			selectedRowData[key] = valuetowrite;
			if (toType(valuetowrite) == 'date'){
				var curr_day = valuetowrite.getDay()
				var curr_month = valuetowrite.getMonth() + 1; //Months are zero based
				var curr_year = valuetowrite.getFullYear();
				if (curr_day < 10) curr_day = "0" + curr_day;
				if (curr_month < 10) curr_month = "0" + curr_month;
				valuetowrite = curr_year + "-" + curr_month + "-" + curr_day;
			}
			if (key != 'id') selectedRowDataString += key + '=' + valuetowrite + '&';
		});
		selectedRowDataString += 'layouteditorid' + '=' + this.layouteditorid + '&';
		selectedRowDataString += 'autocommit' + '=' + 'true' + '&';;
		
		//salva dati
		i = CurrentCollectorOffLineAjax.length++;
		CurrentCollectorOffLineAjax[i] = CurrentProcRequestId;
		CurrentCollectorOffLineAjax[i] = selectedRowDataString;
		Custom.SaveOffLineDataToServer(selectedRowDataString);
	},
	
	/* MASS POST ACTION */
	PostMassAction: function(actionid,action) {
		//trova record aggiornati ed esegue l'action (proc) abbinata
		var records = this.getStore().getRange();
		for(var i = 0; i < records.length; i++){
			var rec = records[i];
			if(rec.dirty == true){
				this.PostRecordAction(rec,actionid,action);
			}
		}
	},
	
	PostRecordAction: function(dirtyRecord, actionid, action) {
		var selectedRowDataString = '';
		var selectedRowIndexes = [];
		var selectedRowData = [];
		Ext.iterate(dirtyRecord.data, function(key, value) {
			var valuetowrite = dirtyRecord.data[key];
			selectedRowData[key] = valuetowrite;
			if (toType(valuetowrite) == 'date'){
				var curr_day = valuetowrite.getDay()
				var curr_month = valuetowrite.getMonth() + 1; //Months are zero based
				var curr_year = valuetowrite.getFullYear();
				if (curr_day < 10) curr_day = "0" + curr_day;
				if (curr_month < 10) curr_month = "0" + curr_month;
				valuetowrite = curr_year + "-" + curr_month + "-" + curr_day;
			}
			if (key != 'id') selectedRowDataString += key + '=' + valuetowrite + '&';
		});
		
		if (Custom.isNumber(this.layouteditorid) == true) {
			selectedRowDataString += 'layoutid' + '=' + this.layouteditorid + '&'
			if ((action=='true') || (action=='false')) selectedRowDataString += 'Action' + '=' + action + '&';
				
			Ext.Ajax.request({
				params:  selectedRowDataString,
				url: 'includes/io/DataWrite.php',
				method:'POST',
				async: false,
				waitTitle:'Connecting',
				waitMsg:'Invio dati...',
				success: function(resp) {
					var appo = Ext.util.JSON.decode(resp.responseText)
					Custom.ExecuteProc(actionid);
				},
				failure: function() {
					Ext.Msg.alert('error', 'Not Ok');
				}
			});
		}else{
			Ext.Msg.alert('error', 'LayoutEditor in Grid REQUESTED !!!');
		}
	},
	
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