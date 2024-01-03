
//*************************************************************************************************************//
//			DYNAMIC GRID
Ext.define('dynamictreegrid', {
    extend: 'Ext.tree.Panel',
	mixins: {
        field: 'Ext.form.field.Base'
    },
    alias: 'widget.dynamictreegrid',
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
    /*COLUMN DEFINITION*/
    columnWidthSplit: '',
    columnDefaultVisible: false,
    columnAction: '',
    rowHeight: '',
	
	toolbarVisible: true,
	
	/*ACTIVABLE ACTIONS*/
    allowfilter: false,
    allowadd: false,
    allowedit: false,
    //alloweditcell: false,
    //alloweditrow: false,
    allowdragdrop: false,
    allowexport: true,
    allowimport: true,
    allowsearch: false,
	
    /*ACTIVABLE PROCESS*/
    CheckColumn: false, //layouteditorid, ActionColumn or ActionTrueFalseColumn requested
    CheckColumnCleanUp: true, 
    ActionColumn: false, //procid requested
    ActionTrueFalseColumn: false, //procid requested
    NoteColumn: false, //layouteditorid requested
	
	
    /* VIEW COLUMN*/
    DectailColumn: false, //layouteditorid requested
    DectailIcon: 'fa-expand',
    DeleteColumn: false,
    NumberColumn: false,
    rowexpander: false,
    subgrid: false,
    groupField: true,
    groupSummary: false,
	groupStartCollapsed: true,
    summary: false,
    summaryField: false,
	enumerateField : false,
	
	goToLastRow: false,
	rowexpander: false,
	
    stripeRows       : false,
	
    /* DATA */
    valueField: null,
    displayField: null,
    keyField: 'ID',
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    datasourcefield: null,
    orderField: '',  //manage for enumerate
	filterwhere: '',
	filterwhereonstart: false,

    /* RECORD EDITING DEFINITION */
    layouteditorid: '',
    layouteditorWindowMode: 'acWindowNormal',
	ParentCmbSearch: '',
	
    /* EVENT ON CHANGE*/
    autopostback: false,

    /*EXCEL EXPORT DEF*/
    xlsTitle: 'export',
    xlsHeaderColor: 'A3C9F1',
    xlsGroupHeaderColor: 'EBEBEB',
    xlsSummaryColor: 'FFFFFF',
    xlsShowHeader: false,
    loadedColumns: false,

    //columnLines: true,
    //enableLocking: true,
    scrollable: true,
	
	/*DATA TREE*/
	parentidname: 'ID_PARENT',
	childrenidname: 'ID',
	parentidstart: '0',
	
	waytoexpand: 'down', // 'top'
	rootVisible : true,
    useArrows: true,
    multiSelect: false,
    singleExpand: false,
	//columns: [],
	//fields: [],
	
	//QUESTO FA CASINO
    //features: [{ftype:'grouping'}],
	
	//columnLines: true,
    //enableLocking: true,
	
	bbar: {
		xtype: 'toolbar',
		itemId: 'gridtoolbar',
		items:[
			'-', {
				itemId: 'RefreshBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-refresh',
				cls: 'x-btn-text-icon',
				handler:function(button, event) {
					
					var me = button.up('dynamictreegrid');
					CurrentPanel = me.up('panel');
					
					var curTabPanel = CurrentPanel.up('tabpanel');
					if ((curTabPanel != undefined) && (curTabPanel != null)){
						CurrentPanel = curTabPanel.up('panel');
					}
					
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
					
					var me = button.up('dynamictreegrid');
					CurrentPanel = me.up('panel');
					
					var curTabPanel = CurrentPanel.up('tabpanel');
					if ((curTabPanel != undefined) && (curTabPanel != null)){
						CurrentPanel = curTabPanel.up('panel');
					}
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					me.SaveMassUpdate();
				}
			},
			'-', {
				itemId: 'DeleteBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-trash-o',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler:function(button, event) {
					
					var me = button.up('dynamictreegrid');
					CurrentPanel = me.up('panel');
					
					var curTabPanel = CurrentPanel.up('tabpanel');
					if ((curTabPanel != undefined) && (curTabPanel != null)){
						CurrentPanel = curTabPanel.up('panel');
					}
					
					if (CurrentPanel.name == 'DesignPanel' ) {
						CurrentWindow = MainViewPort.getComponent('centerViewPortId');
					}else{
						CurrentWindow = CurrentPanel.up('window');
						CurrentPanel = CurrentWindow.down('form');
					}
					CurrentToolBar  = CurrentWindow.getComponent('toolbar');
					CurrentPanelRaw = CurrentPanel.definitionraw;
					me.SaveMassUpdate();
					Custom.ExecuteProc('DELETE',null,null);
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
					
					var me = button.up('dynamictreegrid');
					CurrentPanel = me.up('panel');
					
					var curTabPanel = CurrentPanel.up('tabpanel');
					if ((curTabPanel != undefined) && (curTabPanel != null)){
						CurrentPanel = curTabPanel.up('panel');
					}
					
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
					if ((me.layouteditorid != 0) && (me.layouteditorid != undefined)) {
						CurrentLayoutDataSourceFieldValue = "";
						var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
						if ((me.datasourcefield ) && (DS_Form00)){
							ValRiga = DS_Form00.data.items[0].data[me.datasourcefield];
							log('dynamictreegrid add' + NameChiave + '=' + ValRiga );
							if ((CurrentPanelRaw.ViewType == 'form') && (ValRiga === undefined)){
								Custom.ExecuteProcRequest('SAVE');
								Custom.FormDataSave();	
							}else{
								Custom.LayoutRender(me.layouteditorid, 'form', NameChiave + " = " + ValRiga + "", 'add', me.layouteditorWindowMode);
							}
						}else{
							Custom.LayoutRender(me.layouteditorid, 'form', "", 'add', me.layouteditorWindowMode);
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
					
					var me = button.up('dynamictreegrid');
					CurrentPanel = me.up('panel');
					
					var curTabPanel = CurrentPanel.up('tabpanel');
					if ((curTabPanel != undefined) && (curTabPanel != null)){
						CurrentPanel = curTabPanel.up('panel');
					}
					
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
						log('dynamictreegrid clone' + NameChiave + '=' + ValRiga );
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
					
					var me = button.up('dynamictreegrid');
					Custom.setCurrentPanelForm(me);
                    /*promize load all
                    if (me.localdatawhere != '') {
                        me.getStore().reload({
                            params: {
                                datawhere: me.localdatawhere,
                                limit: -1
                            }
                        });
                    } else {
                        me.getStore().reload({
                            params: {
                                limit: -1
                            }
                        });
                    }
                    */
					me.exportXLSX();
				}
			},
			'-', {
				itemId: 'SearchField',
				xtype: 'textfield',
				width: 120,
				emptyText: 'search...',
				hidden: true,
				listeners: {
					specialkey: function(field, event){
						
						if(event.getKey() === event.ENTER){
							
							var me = this;
							field.up('dynamictreegrid').store.clearFilter();
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
									field.up('dynamictreegrid').store.addFilter(remoteFilter);
									//appowhere = 'innerSearch' + '=' + me.getValue();
									//field.up('dynamictreegrid').store.load({ params: { datawhere: appowhere } });
								}else{
									log('local filtering');
									var regex = new RegExp(me.getValue(), 'i');
									if (me.getValue() != '') {
										regex = new RegExp(me.getValue(), 'i');
										field.up('dynamictreegrid').store.filter(new Ext.util.Filter({
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
				}
			},
			'-', {
				itemId: 'ActionTrueBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-long-arrow-right',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler:function(button, event) {	
					
					var me = button.up('dynamictreegrid');
					CurrentPanel = me.up('panel');
					
					var curTabPanel = CurrentPanel.up('tabpanel');
					if ((curTabPanel != undefined) && (curTabPanel != null)){
						CurrentPanel = curTabPanel.up('panel');
					}
					
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
						Custom.ExecuteProc(me.CheckColumn,null,null);
						Ext.getBody().unmask();
					}, 10);	
					var current = me.store.currentPage;
					if (me.fireEvent('beforechange', me, current) !== false) {
						me.store.loadPage(current);
						//me.getStore().reload();
					}
				}
			},
			'-', {
				itemId: 'ActionTrueFalseTrueBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-thumbs-up',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler:function(button, event) {	
					
					var me = button.up('dynamictreegrid');
					CurrentPanel = me.up('panel');
					
					var curTabPanel = CurrentPanel.up('tabpanel');
					if ((curTabPanel != undefined) && (curTabPanel != null)){
						CurrentPanel = curTabPanel.up('panel');
					}
					
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
						Custom.ExecuteProc(me.CheckColumn,null,null);
						Ext.getBody().unmask();
					}, 10);	
					var current = me.store.currentPage;
					if (me.fireEvent('beforechange', me, current) !== false) {
						me.store.loadPage(current);
						//me.getStore().reload();
					}
				}
			},
			'-', {
				itemId: 'ActionTrueFalseFalseBtn',
				pressed: false,
				enableToggle:false,
				iconCls: 'x-fa fa-thumbs-o-down',
				cls: 'x-btn-text-icon',
				hidden: true,
				handler:function(button, event) {	
					
					var me = button.up('dynamictreegrid');
					CurrentPanel = me.up('panel');
					
					var curTabPanel = CurrentPanel.up('tabpanel');
					if ((curTabPanel != undefined) && (curTabPanel != null)){
						CurrentPanel = curTabPanel.up('panel');
					}
					
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
						Custom.ExecuteProc(me.CheckColumn,null,null);
						Ext.getBody().unmask();
					}, 10);	
					var current = me.store.currentPage;
					if (me.fireEvent('beforechange', me, current) !== false) {
						me.store.loadPage(current);
						//me.getStore().reload();
					}
				}
			},
            '-', {
                itemId: 'ActionDeleteBtn',
                pressed: false,
                enableToggle: false,
                tooltip: 'Cancella',
                iconCls: 'x-fa fa-thumbs-o-down',
                cls: 'x-btn-text-icon',
                hidden: true,
                handler: function (btn, evt) {
                    var me = btn.up('dynamictreegrid');

					Custom.setCurrentPanelForm(me);
                    Ext.getBody().mask("Wait, executing for every selected row ..");
					Ext.MessageBox.show({
						title : 'Cancella ' + CurrentWindow.title,
						msg : 'Confermi la cancellazione?',
						buttons : Ext.MessageBox.OKCANCEL,
						icon : Ext.MessageBox.WARNING,
						fn : function (btn) {
							if (btn == 'ok') {
								Ext.Function.defer(function () {
									//colleziona record selezionati ed esegue action abbinata
									
									var me = this.up('dynamictreegrid');
									Ext.getBody().mask("Wait, executing for every selected row ..");
									Ext.Function.defer(function() {
										//colleziona record selezionati ed esegue action abbinata
										me.PostMassAction('DELETE','autocommit=false');
										Ext.getBody().unmask();
									}, 10);	
									var current = me.store.currentPage;
									if (me.fireEvent('beforechange', me, current) !== false) {
										me.store.loadPage(current);
										//me.getStore().reload();
									}
									Ext.getBody().unmask();
								}, 10);
								var current = me.store.currentPage;
								if (me.fireEvent('beforechange', me, current) !== false) {
									me.store.loadPage(current);
									//me.getStore().reload();
								}
								return
							} else {
								return;
							}
						}
					});
                    
                }
            },
            '-', {
                itemId: 'LabelRecord',
                xtype: 'label',
                text: 'Record 0 of 0'
            },
            '-', {
                itemId: 'GetAllBtn',
                pressed: false,
                enableToggle: false,
                tooltip: 'Elenco Completo',
                iconCls: 'x-fa fa-fast-forward',
                cls: 'x-btn-text-icon',
                handler: function (btn, evt) {
                    var me = btn.up('dynamictreegrid');

					Custom.setCurrentPanelForm(me);
                    if (me.localdatawhere != '') {
                        me.getStore().reload({
                            params: {
                                datawhere: me.localdatawhere,
                                limit: -1
                            }
                        });
                    } else {
                        me.getStore().reload({
                            params: {
                                limit: -1
                            }
                        });
                    }
                }
            }
		],
		doRefresh : function(){
			
			var me = this,
			current = me.store.currentPage;
			if (me.fireEvent('beforechange', me, current) !== false) {
				me.store.loadPage(current);
				//me.getStore().reload();
			}
		}
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
		log('setvalue text in grid=' + value);
        me.text = value;
		me.keyValue = '';
		me.textFilter = value;
		if  (me.valueField != ''){
			me.localdatawhere = '';
			if(value == undefined){
				me.localdatawhere = "1=2";
				me.store.proxy.extraParams.datawhere = me.localdatawhere;
				me.store.load();

			}else if ((value != '') && (value != 0)){
				if (Custom.isNumber(value) == true){
					me.localdatawhere =  me.valueField + '=' + value;
				}else{
					me.localdatawhere =  me.valueField + "='" + value + "'";
				}
				//me.store.proxy.extraParams.datawhere = me.localdatawhere;
				//me.store.load();
				
				me.store.load({ params: { datawhere: me.localdatawhere } });
			} else{
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
	isVisible: function(deep) {
		
        var me = this,
            hidden;
 
        if (me.hidden || !me.rendered || me.destroyed) {
            hidden = true;
        } else if (deep) {
            hidden = me.isHierarchicallyHidden();
        }
 
        return !hidden;
    },
	
	initComponent: function(){
        var me = this;
        var config = {
            columns: [],
            plugins: [],
            features: [],
            multiSelect: true
        };
		var viewconfig = {
            features: [],
            plugins: []
        };
        if (CurrentDeviceType != 'desktop') {
            me.addCls('custom-grid');
        }
		
		//if (me.allowfilter) {config.plugins.push('gridfilters');}
		//if (me.allowfilter) {config.plugins.push('gridfilterbar');}
		//if (me.allowfilter) {config.plugins.push('GroupingPanel');}
		//if (me.allowfilter) {config.plugins.push('Summaries');}
	
        //filter in toolbar
        //if (me.allowfilter) {config.plugins.push('gfilters');}
		
		if (me.allowdragrop) {
			viewconfig.plugins.push({
                ptype: 'gridviewdragdrop',
                pluginId: 'gridviewdragdrop',
                //dragGroup: 'grid-to-calendar',
                //dropGroup: 'grid-to-calendar',
				ddGroup: 'grid-to-calendar',
                enableDrop: false
			});
		}
		if (me.enumerateField) {
			viewconfig.plugins.push({
                ptype: 'gridviewdragdrop',
                pluginId: 'gridviewdragdrop'
			});
		}
		
		/*
			viewConfig: {
                plugins: {
                    gridviewdragdrop: {
                        ddGroup: 'grid-to-calendar',
                        enableDrop: false
                    }
                }
            },
		*/
			
			
        /*if (me.allowfilter) {
			config.plugins.push({	ptype: 'saki-gms',
									pluginId:'gms',
									filterOnEnter:false
								});
		}*/
		
		//plulgins order by
		//if (me.orderField != '') {
        //    config.plugins.push('gridviewdragdrop');
        // }
		

        if (me.summary) {
            config.features.push({
                ftype: 'treesummary'
            });
            viewconfig.features.push({
                ftype: 'treesummary'
            });
        }

         
        if (me.alloweditcell === true)		{
			config.plugins.push({
                ptype: 'cellediting',
				clicksToEdit: 1
			});
		}else if (me.alloweditrow === true)	{
			config.plugins.push({
				pluginId: 'MyRowEditingPlugin',
				ptype: 'rowediting',
				clicksToEdit: 1,
				listeners: {
					cancelEdit: function(rowEditing, context) {
						// your stuff will go here
					},
					edit: function(editor, e) {
						var me = editor.grid;

						Custom.setCurrentPanelForm(me);
						/************************************************/
						
						var data = {};
						data.ID = e.newValues['ID'];
						data[editor.grid.keyField] = e.newValues[editor.grid.keyField];
						data['datasourcefield'] = editor.grid.keyField;

						var selectedRowDataString = '';
						var selectedRowIndexes = [];
						var selectedRowData = [];
						
						for (var key in e.newValues) {
							var value = e.newValues[key];
							if (toType(value) == 'date') {
								var curr_day = value.getDay()
								var curr_month = value.getMonth() + 1; //Months are zero based
								var curr_year = value.getFullYear();
								if (curr_day < 10) curr_day = "0" + curr_day;
								if (curr_month < 10) curr_month = "0" + curr_month;
								value = curr_year + "-" + curr_month + "-" + curr_day;
							}
							if ((key.indexOf('SOURCE') == -1) && (key.indexOf('JSON') == -1)) {
								selectedRowDataString += key + '=' + encodeURIComponent(value) + '&';
							}
						};
		
						if (Custom.IsNOTNullOrEmptyOrZeroString(me.layouteditorid)) {
							selectedRowDataString += 'layoutid' + '=' + me.layouteditorid + '&'
						} else {
							selectedRowDataString += 'layoutid' + '=' + CurrentPanelRaw.id + '&'
						}
						
						processId = 'SAVE';
						Ext.Ajax.request({
							params: selectedRowDataString,
							url: 'includes/io/DataWrite.php',
							method: 'POST',
							async: false,
							waitTitle: 'Connecting',
							waitMsg: 'Sending data...',
							success: function (resp) {
								var appo = Ext.util.JSON.decode(resp.responseText)
								var store = me.getStore();
								var current = store.currentPage;
								if ((me.fireEvent('beforechange', me, current) !== false) && (processId != '')) {
									store.loadPage(current);
								}
								if (Custom.IsNOTNullOrEmptyOrZeroString(me.layouteditorid)) {
									Custom.ExecuteProc(processId, me.layouteditorid,null);
								} else {
									Custom.ExecuteProc(processId,null,null);
								}
								
							},
							failure: function () {
								Ext.Msg.alert('error', 'Not Ok');
							}
						});
					}
				}
			});
		}
			
        //config.plugins.push('gridExporter');
        var gRow = -1; // define a variable gRow.

        Ext.apply(me.initialConfig, config);
        Ext.apply(me.viewConfig, viewconfig);
        Ext.apply(me, config);
        Ext.apply(me.keepRawData = true);

        me.callParent(arguments);
    },
	listeners: {
		select: function(selModel, record, index, options){
            console.log('dynamictreegrid event ' + 'select');
			
            var me = this;
			var RowSelectedKey = '';
			var RowSelectedText = '';
			selModel.selected.items.forEach(function(row) {
				if (me.keyField != '') {
					//me.keyValue = row.data[me.keyField];
					RowSelectedKey = RowSelectedKey + row.data[me.keyField] + ",";
				}
				if (me.valueField != '') {
					//me.text = row.data[me.valueField];
					RowSelectedText = RowSelectedText + row.data[me.valueField] + ",";
				}
			});
			
			if (me.valueField != '') {
				me.text = RowSelectedText.substring(0, RowSelectedText.length - 1);
			}
			if (me.keyField != '') {
				me.keyValue = RowSelectedKey.substring(0, RowSelectedKey.length - 1);
				me.text = me.keyValue;
			}
			
			if (me.name == 'FormInGrid')	{
				log('setvalue text in grid=' + me.keyValue);
				CurrentLayoutDataSourceFieldValue = me.keyValue; 
				me.text =  me.keyValue;
			}
			log('select keyField grid '  + me.keyField + ':' + me.keyValue  );
			log('select valueField grid '  + me.valueField + ':' + me.text  );
			CurrentRowId = index;
			log('select grid CurrentRowId:' + CurrentRowId );
			//Ext.getCmp('labelcountrecord').setText(CurrentRowId);
			
			//summarize selectedrows
			if (me.summaryField){
				var Summarized = 0;
				for (var i = 0; i < me.getSelectionModel().getSelection().length; i++) {
					Summarized = Summarized + me.getSelectionModel().getSelection()[i].data[me.summaryField];
				}
				//label record sum
				me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Rec ' + me.store.data.length + '/' + me.store.totalCount + 
																				' Sel ' + me.getSelectionModel().getSelection().length + 
																				' Sum ' + Ext.util.Format.number(Summarized, '0,000.00')+ 
																				' Avg ' + Ext.util.Format.number(Summarized / me.getSelectionModel().getSelection().length, '0,000.00'));
			}else{
				//label record count
				me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Rec ' + me.store.data.length + '/' + me.store.totalCount + 
																				' Sel' + me.getSelectionModel().getSelection().length);
			}
			
			//SAVE RECORD AUTOPOSTBACK
			if (me.autopostback == true){
				var selectedRowDataString = '';
				var selectedRowIndexes = [];
				var selectedRowData = [];
				Ext.iterate(record.data, function(key, value) {
					selectedRowData[key] = value;
					valueappo = value;
					if (toType(value) == 'date'){
						var curr_day = value.getDay();
						var curr_month = value.getMonth() + 1; //Months are zero based
						var curr_year = value.getFullYear();
						if (curr_day < 10) {curr_day = "0" + curr_day;}
						if (curr_month < 10) {curr_month = "0" + curr_month;}
						value = curr_year + "-" + curr_month + "-" + curr_day;
					}
					selectedRowDataString += key + '=' + value + '&';
				});
				//selectedRowDataString += 'registrationid' + '=' + me.CurrentRegistrationId + '&';
				selectedRowDataString += 'layoutid' + '=' + me.layouteditorid + '&';
				//selectedRowDataString += 'userid' + '=' + me.CurrentUser.UserId + '&';
				selectedRowDataString += 'autocommit' + '=false&';
				Ext.Ajax.request({
					params:  selectedRowDataString,
					url: 'includes/io/DataWrite.php',
					method:'POST',
					async: false,
					waitTitle:'Connecting',
					waitMsg:'Invio dati...',
					/*
					success: function(resp) {
						// grid.getStore().commitChanges();
						// var appo = Ext.util.JSON.decode(resp.responseText)
						// Custom.ExecuteProc(this.ActionColumn,null,null);
					},
					*/
					failure: function() {
						Ext.Msg.alert('error', 'Not Ok');
					}
				});
			}
		},
        selectionchange ( selModel, selected, options ) {
			
            var me = this;
			//summarize selectedrows
			if (me.summaryField){
				var Summarized = 0;
				for (var i = 0; i < me.getSelectionModel().getSelection().length; i++) {
					Summarized = Summarized + me.getSelectionModel().getSelection()[i].data[me.summaryField];
				}
				//label record sum
				me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Rec ' + me.store.data.length + '/' + me.store.totalCount + 
																				' Sel ' + me.getSelectionModel().getSelection().length + 
																				' Sum ' + Ext.util.Format.number(Summarized, '0,000.00')+ 
																				' Avg ' + Ext.util.Format.number(Summarized / me.getSelectionModel().getSelection().length, '0,000.00'));
			}else{
				//label record count
				me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Rec ' + me.store.data.length + '/' + me.store.totalCount + 
																				' Sel' + me.getSelectionModel().getSelection().length);
			}
		},
		itemdblclick: function(dv, record, item, index, e) {
			
			log('dynamictreegrid event ' +  'itemdblclick');
			var NameChiave = dv.grid.keyField;
			var Riga = clone(record.data);
			var ValRiga = Riga[NameChiave];
			dv.grid.processOnButton(dv, index, record, '', 'autocommit=false');
			
			//apri in edit il record
			if ( (dv.grid.allowedit) && (!Custom.IsNullOrEmptyOrZeroString(dv.grid.layouteditorid)) ) {
				if (!Custom.IsNullOrEmptyOrZeroString(dv.grid.layouteditorid)){
					//NameChiave = CurrentLayoutDataSourceField;
					CurrentLayoutDataSourceFieldValue = ValRiga;
					log('dynamictreegrid ' + NameChiave + '=' + ValRiga );
					appowhere = '';
					if (Custom.isNumber(ValRiga) == true){
						appowhere =  NameChiave + '=' + ValRiga;
					}else{
						appowhere =  NameChiave + "='" + ValRiga + "'";
					}
					Custom.LayoutRender(dv.grid.layouteditorid, 'form', appowhere, 'edit', dv.grid.layouteditorWindowMode);
				}
			}
		},
		cellclick: function(iView, iCellEl, iColIdx, iStore, iRowEl, iRowIdx, iEvent) {
			
			log('dynamictreegrid event ' +  'cellclick');
			var zRec = iView.getRecord(iRowEl);		        
			var me = this;
			if ((me.DectailColumn) && (CurrentDeviceType != 'desktop')) {
				log('dynamictreegrid eventResponsive=' +  'cellclick');
				var NameChiave = iView.grid.keyField;
				var Riga = clone(zRec.data);
				var ValRiga = Riga[NameChiave];
				iView.grid.processOnButton(iView, iRowIdx, zRec, '', 'autocommit=false');
				
				//apri in edit il record
				if ( (iView.grid.allowedit) && (!Custom.IsNullOrEmptyOrZeroString(iView.grid.layouteditorid)) ) {
					if (!Custom.IsNullOrEmptyOrZeroString(iView.grid.layouteditorid)) {
						//NameChiave = CurrentLayoutDataSourceField;
						CurrentLayoutDataSourceFieldValue = ValRiga;
						log('dynamictreegrid ' + NameChiave + '=' + ValRiga );
						appowhere = '';
						if (Custom.isNumber(ValRiga) == true){
							appowhere =  NameChiave + '=' + ValRiga;
						}else{
							appowhere =  NameChiave + "='" + ValRiga + "'";
						}
						Custom.LayoutRender(iView.grid.layouteditorid, 'form', appowhere, 'edit', iView.grid.layouteditorWindowMode);
					}
				}
			}
			else if ((me.ActionColumn) && (CurrentDeviceType != 'desktop')) {
				var SaveStringData = Custom.ArrayToString(zRec.data);
				SaveStringData += '&objname' + '=' + iView.grid.name + '';
				Custom.SaveStringData(SaveStringData,'');
			}
		},
		edit: function(editor, e) {
			
			if (this.massUpdate == false){
				this.SaveRecordUpdate(e.record);
			}
		},
		drop: function( node, data, overModel, dropPosition, eOpts ){
			
			log('nodo mittente id:' + this.keyValue);
			log('nodo destinatario id:' + overModel.data[this.keyField]);
			
			var selectedRowDataString = '';
			selectedRowDataString += 'layoutid' + '=' + this.layouteditorid +'&';
			selectedRowDataString += 'datasource' + '=' + this.datasource +'&';
			selectedRowDataString += 'datasourcetype' + '=' + this.datasourcetype +'&';
			selectedRowDataString += 'datasourcefield' + '=' + this.keyField +'&';
			selectedRowDataString += this.parentidname + '=' + overModel.data[this.keyField] + '&';
			selectedRowDataString += 'autocommit' + '= true';
			Ext.Msg.confirm('Storicizzazione', 'Il nodo è stato spostato in un nuova posizione Vuoi salvare lo storico di posizione', function(btn){
				if(btn === "no"){
					selectedRowDataString += '&recordaudit' + '= false';
					Ext.Ajax.request({
						params:  selectedRowDataString,
						url: 'includes/io/DataWrite.php',
						method:'POST',
						async: false,
						waitTitle:'Connecting',
						waitMsg:'Invio dati...',
						/*
						success: function(resp) {
							//DAFARE
							//storicita con msgbox
							//grid.getStore().commitChanges();
						},
						*/
						failure: function() {
							Ext.Msg.alert('error', 'Not Ok');
						}
					});
				}
				else if(btn === "yes"){
					selectedRowDataString += '&recordaudit' + '= true';
					Ext.Ajax.request({
						params:  selectedRowDataString,
						url: 'includes/io/DataWrite.php',
						method:'POST',
						async: false,
						waitTitle:'Connecting',
						waitMsg:'Invio dati...',
						/*
						success: function(resp) {
							//DAFARE
							//storicita con msgbox
							//grid.getStore().commitChanges();
						},
						*/
						failure: function() {
							Ext.Msg.alert('error', 'Not Ok');
						}
					});
				}
			}, this);
		},
		/*
		load: function(store,records) {
		 // me.storeInitialCount = records.length;
		},
		*/
		viewready: function( grid ) {
			/*	*/
			
			var map = new Ext.KeyMap({
				target: grid.getEl(),
				binding: [
				/*
				{
					key: Ext.event.Event.DELETE,
					handler: function(keyCode, e) {
						Ext.MessageBox.show({
							title : 'Cancella ',
							msg : 'Confermi la cancellazione?',
							buttons : Ext.MessageBox.OKCANCEL,
							icon : Ext.MessageBox.WARNING,
							fn : function (btn) {
								if (btn == 'ok') {
									var me = CurrentPanel.up('dynamictreegrid');
									Ext.getBody().mask("Wait, executing for every selected row ..");
									Ext.Function.defer(function() {
										//colleziona record selezionati ed esegue action abbinata
										me.PostMassAction('DELETE','autocommit=false');
										Ext.getBody().unmask();
									}, 10);	
									var current = me.store.currentPage;
									if (me.fireEvent('beforechange', me, current) !== false) {
										me.store.loadPage(current);
										//me.getStore().reload();
									}
									return;
								} else {
									return;
								}
							}
						});
					}
				},
				*/
				{
					key: "c",
					ctrl:true,
					handler: function(keyCode, e) {
						var recs = grid.getSelectionModel().getSelection();
						if (recs && recs.length != 0) {
							var clipText = grid.getCsvDataFromRecs(recs);
							var ta = document.createElement('textarea');
							ta.id = 'cliparea';
							ta.style.position = 'absolute';
							ta.style.left = '-1000px';
							ta.style.top = '-1000px';
							ta.value = clipText;
							document.body.appendChild(ta);
							document.designMode = 'off';
							ta.focus();
							ta.select();
							setTimeout(function(){
								document.body.removeChild(ta);
							}, 100);
						}
					}
				},{
					key: "i",
					ctrl:true,
					handler: function(keyCode, e) {
						var ta = document.createElement('textarea');
						ta.id = 'cliparea';
						ta.style.position = 'absolute';
						ta.style.left = '-1000px';
						ta.style.top = '-1000px';
						ta.value = '';
						document.body.appendChild(ta);
						document.designMode = 'off';

						setTimeout(function(){
							Ext.getCmp('grid-pnl').getRecsFromCsv(grid, ta);
						}, 100);
						ta.focus();
						ta.select();
					}
				}
				]
			});
		},
		sortchange: function(){
			this.ownerGrid.refreshRank();
        }
		/*
		itemexpand: function (node, eOpts) {
			var store = this.getStore();
			store.reload();
			node.expand();
		}
		*/
	},
	viewConfig: {
		listeners: {
			drop: function(node, data, overModel, dropPosition, eOpts){
				var me = this.grid;
				if (me.ownerGrid.enumerateField) {
					me.processOnButton(this, 0, me.localEnumerateRec, 'ENUMERATE', 	'&ENUMERATEWHEREFIELD=' + me.valueField + 
																					'&ENUMERATEFIELD=' + me.enumerateField + 
																					'&ENUMERATEFROMROW=' + me.localEnumerateStart + 
																					'&ENUMERATETOROW=' + me.getSelectionModel().getCurrentPosition().rowIdx + 
																					'&autocommit=false');
				}
			},
			beforedrop: function(node, data, dropRec, dropPosition) {
				var me = this.up('dynamictreegrid');
				Custom.setCurrentPanelForm(me);
				var selectedRecord = this.grid.getSelectionModel().getSelection()[0];
				
				if (this.grid.ownerGrid.enumerateField) {
					me.localEnumerateStart = this.grid.store.indexOf(selectedRecord);
					me.localEnumerateRec = dropRec;
				}else{
					Ext.Array.each(data.records, function(rec) {
						rec.setDirty();
					});
				}
			},
			afterrender: {
				delay: 100,
				fn: function () {
					this.ownerGrid.refreshRank();
				}
			},
			// Column Autosize to its data
			refresh: function(dataview) {
				Ext.each(dataview.panel.columns, function(column) {
					if (column.autoSizeColumn === true) {
						column.autoSize();
						log ('autoSizeColumn Setting');
					}
				});
			}
		},
		stripeRows: true,
		// commenting out the "plugins" object fixes the issue!
		plugins: [
			{
				ptype: 'treeviewdragdrop',
				containerScroll: true
			}
		]
	},
	
	/* store is loading then reconfigure the column model of the grid    */
    storeLoad: function(){
		var me = this;
		var columns = [];
				
		if (me.loadedColumns == true) {return;}
		me.loadedColumns = true;
		
		if (me.allowdelete) {
			this.getComponent('gridtoolbar').getComponent('DeleteBtn').show();
			this.getComponent('gridtoolbar').getComponent('SaveBtn').show();
		}
		if (me.allowadd) {
			this.getComponent('gridtoolbar').getComponent('AddBtn').show();
			this.getComponent('gridtoolbar').getComponent('DplBtn').show();
			this.getComponent('gridtoolbar').getComponent('SaveBtn').show();
		}
		if (me.allowexport) {this.getComponent('gridtoolbar').getComponent('ExcelBtn').show();}
		if (me.allowsearch) {this.getComponent('gridtoolbar').getComponent('SearchField').show();}
		
        /*  adding NumberColumn  */
        if (me.NumberColumn) {
            columns.push(Ext.create('Ext.grid.RowNumberer'));
        }

		/*  adding DectailColumn  */	
        if (CurrentDeviceType == 'desktop') {		
			if (me.DectailColumn) {
				columns.push(Ext.create('Ext.grid.column.Action',{
					header : 'DET',
					width:40,
					align : 'center',
					items : [{
						iconCls: 'x-fa fa-expand',
						tooltip : 'Dectail',
						handler : function (grid, rowIndex, colIndex, item, e, record) {
							var NameChiave = grid.panel.keyField;
							var Riga = clone(record.data);
							var ValRiga = Riga[NameChiave];
							grid.grid.processOnButton(grid, rowIndex, record, '', 'autocommit=false');
							
							//apri in edit il record
							if ( (grid.grid.allowedit) && (!Custom.IsNullOrEmptyOrZeroString(grid.grid.layouteditorid)) ) {
								//NameChiave = CurrentLayoutDataSourceField;
								CurrentLayoutDataSourceFieldValue = ValRiga;
								log('dynamictreegrid ' + NameChiave + '=' + ValRiga );
								appowhere = '';
								if (Custom.isNumber(ValRiga) == true){
									appowhere =  NameChiave + '=' + ValRiga;
								}else{
									appowhere =  NameChiave + "='" + ValRiga + "'";
								}
								Custom.LayoutRender(grid.panel.layouteditorid, 'form', appowhere, 'edit', grid.panel.layouteditorWindowMode);
							}
						}
					}]
				}));
			}
		}
		
		/*  adding DESCRIZIONE of grid  */
		columns.push(Ext.create('Ext.tree.Column',{
			//text : me.displayField,
			sortable: true,
			minWidth:50,
			flex: 1.5,
			autoSizeColumn : true,
			autoSize : true,
			locked:true
			
			//header: me.displayField, 
			//dataIndex: me.displayField
		}));

        /*  adding DataColumn  */
        var columnnprog = 0;
        var columnname = '';
        var columnWidthSplitted = [];
        if ((me.columnWidthSplit != null) && (me.columnWidthSplit != '')) {
            columnWidthSplitted = me.columnWidthSplit.split(',');
        }
        
		var columnActionSplitted = [];
        if ((me.columnAction != null) && (me.columnAction != '')) {
            columnActionSplitted = me.columnAction.split(',');
        }

        if (me.store.proxy.reader.rawData !== undefined) {
            Ext.each(me.store.proxy.reader.rawData.columns, function (columnphp) {
                columnkeys = {};
                columnkeys.sortable = true;
                columnkeys.editor = {
                    allowBlank: true
                };
                columnkeys = columnphp;
                columnname = columnphp.dataIndex;
                columnkeys.text = columnkeys.dataIndex;

                if ((me.alloweditrow == true) || (me.alloweditcell == true)) {
                    if ((columnkeys.editor["xtype"] == "combobox") || (columnkeys.editor["xtype"] == "dynamiccombo")) {
                        if (columnkeys.editableInGrid == true) {
                            //create combo in row
                            if (Ext.data.StoreManager.lookup(CurrentPanelRaw.name + "_" + me.name + '_' + columnkeys.editor["name"]) === undefined) {
                                //create store if not exist
                                console.log('create store in gridpanel:' + CurrentPanelRaw.name + "_" + me.name)

                                columnkeys.editor.layoutid = me.layouteditorid;
                                columnkeys.editor.layouteditorid = me.layouteditorid;
                                //columnkeys.editor.name = me.name;
                                columnkeys.editor.datamode = '';
                                columnkeys.editor.datawhere = '';
                                columnkeys.editor.store = "DS_" + CurrentPanelRaw.name + "_" + me.name;

                                var appoPanel = [];
                                appoPanel['name'] = CurrentPanelRaw.name;
                                appoPanel['id'] = me.layouteditorid;
                                //appoPanel['ViewType'] = '';
                                //appoPanel['DataMode'] = '';
                                //appoPanel['DataSource'] = me.datasource;
                                //appoPanel['DataSourceType'] = me.datasourcetype;
                                if (me.datasourcetype == 'FIELD') {
                                    var storedef = me.datasource.split("|");
                                    Ext.create('Ext.data.Store', {
                                        storeId: "DS_" + CurrentPanelRaw.name + "_" + me.name,
                                        fields: ['ID', 'DESCRIZIONE'],
                                        data: {
                                            'items': [{
                                                "ID": 1,
                                                "DESCRIZIONE": 1
                                            }, {
                                                "ID": 2,
                                                "DESCRIZIONE": 2
                                            }, {
                                                "ID": 3,
                                                "DESCRIZIONE": 3
                                            }]
                                        },
                                        proxy: {
                                            type: 'memory',
                                            reader: {
                                                type: 'json',
                                                root: 'items'
                                            }
                                        }
                                    });
                                } else {
                                    Custom.ObjLoadDataSource(columnkeys.editor, appoPanel);
                                }
                            }
                            //render combo
                            columnkeys.renderer = function (value, metaData) {
                                return ComboRenderer(value, metaData);
                            };
                        } else {
                            //change combo in textfield
                            columnkeys.editable = false;
                        }
                    }
                } else {
                    //change combo in textfield
                    columnkeys.editable = false;
                }

                if (typeof columnWidthSplitted[columnnprog] === undefined) {
                    //columnkeys.width = 100;
                    if (typeof columnkeys['width'] === undefined) {
                        columnkeys.flex = 1;
                        columnkeys.autoSizeColumn = true;
                        console.log('autoSizeColumn SETA');
                    } else {
                        if (columnkeys.width == 0) {
                            columnkeys.flex = 1;
                            columnkeys.autoSizeColumn = true;
                            console.log('autoSizeColumn SETB');
                        }
                    }
                } else {
                    if (parseInt(columnWidthSplitted[columnnprog]) >= 0) {
                        columnkeys.flex = 0;
                        columnkeys.width = parseInt(columnWidthSplitted[columnnprog]);
                    } else {
                        if (me.columnDefaultVisible == true) {
                            columnkeys.flex = 1;
                            columnkeys.autoSizeColumn = true;
                        }
                    }
                }

                //HIDE LOG FIELD
                if (columnkeys.dataIndex == 'SR') {
                    columnkeys.hidden = true;
                } else if (columnkeys.dataIndex == 'SA') {
                    columnkeys.hidden = true;
                } else if (columnkeys.dataIndex == 'SC') {
                    columnkeys.hidden = true;
                } else if (columnkeys.dataIndex == 'SI') {
                    columnkeys.hidden = true;
                } else if (columnkeys.dataIndex == 'SD') {
                    columnkeys.hidden = true;
                }

                //COLUMN FUNCTION
				if (columnkeys.summaryType == 'sum') {
					columnkeys.summaryRenderer = function(value){
						//return Ext.util.Format.currency(value,'',2,true);
						return Ext.util.Format.number ( value,'0,000.00');
						
					}
					columnkeys.renderer = Ext.util.Format.numberRenderer('0,000.00');
				}
				
                if (typeof columnkeys.hiddenInGrid !== undefined) {
                    if ((columnkeys.hiddenInGrid == 'nd') && (me.columnDefaultVisible == false)) {
                        columnkeys.hidden = true;
                    } else if (columnkeys.hiddenInGrid == true) {
                        columnkeys.hidden = true;
                    }else if (columnkeys.hiddenInGrid == false) {
                        columnkeys.hidden = false;
                    }
                }
				if (columnkeys["xtype"] == "numberfield") {
					columnkeys.renderer = Ext.util.Format.numberRenderer('0,000.00');
				}

                //RENDER IN GRID FIELD OVERRIDE
                if ((columnkeys.renderInGridIcon !== undefined) && (columnkeys.renderInGridIcon != '')) {
                    columnkeys = {
                        text: columnphp.dataIndex,
                        header: columnphp.header,
                        xtype: 'widgetcolumn',
                        sortable: false,
                        autoSizeColumn: false,
                        flex: 0,
                        minWidth: 40,
                        width: 40,
                        maxWidth: 40,
                        editor: {},
                        widget: {
                            xtype: 'button'
                        },
                        onWidgetAttach: function (col, widget, record) {
                            var renderArray = columnphp.renderInGridIcon.split(',');
                            for (var i = 0; i < renderArray.length; i = i + 2) {
                                //widget.setIconCls(null);
                                widget.setStyle('backgroundColor', 'transparent');
                                widget.setStyle('border', '1px');
                                if (Custom.isNumber(renderArray[i])) {
                                    //es: valore = colore
                                    if (record.get(columnphp.dataIndex) == renderArray[i]) {
                                        widget.setIconCls('grigio x-fa  ' + renderArray[i + 1]);
                                        widget.setHandler(function (button) {
                                            var record = button.getWidgetRecord();
                                            var grid = this.up('panel');
                                        });
                                    } else {
                                        widget.hide();
                                    }
                                } else {
                                    //es: funzione  (val>0) = colore
                                    if (eval("'" + record.get(columnphp.dataIndex) + "' " + renderArray[i])) {
                                        widget.setIconCls('grigio x-fa  ' + renderArray[i + 1]);
                                        widget.setHandler(function (button) {
                                            var record = button.getWidgetRecord();
                                            var grid = this.up('panel');
                                        });
                                    } else {
                                        widget.hide();
                                    }

                                }
                            }
                        }
                    };
                } else if ((columnkeys.renderInGridColor !== undefined) && (columnkeys.renderInGridColor != '')) {
                    columnkeys.renderer = function (value, metaData, record) {
                        if (metaData.column == null) return;
                        var renderArray = metaData.column.config.renderInGridColor.split(',');
                        for (var i = 0; i < renderArray.length; i = i + 2) {
                            if (Custom.isNumber(renderArray[i])) {
                                //valore = colore
                                if (record.get(columnphp.dataIndex) == renderArray[i]) {
                                    metaData.style = 'background-color: #' + renderArray[i + 1];
                                }
                            } else {
                                // funzione  (val>0) = colore
                                if (eval("'" + record.get(columnphp.dataIndex) + "' " + renderArray[i])) {
                                    metaData.style = 'background-color: #' + renderArray[i + 1];
                                }

                            }
                        }
						if (metaData.column.config.format){
							return Ext.util.Format.number(value, metaData.column.config.format);
						}else{
							return value;
						}
                    };
                } else if ((columnkeys.renderInGridButton !== undefined) && (columnkeys.renderInGridButton != '')) {
                    columnkeys = {
                        text: columnphp.dataIndex,
                        //dataIndex: columnphp.dataIndex,
                        header: columnphp.header,
                        xtype: 'widgetcolumn',
                        minWidth: 40,
                        //tooltip: me.DectailColumn,
                        sortable: false,
                        editor: {},
                        widget: {
                            xtype: 'button'
                        },
                        onWidgetAttach: function (col, widget, rec) {
                            var renderArray = metaData.column.config.renderInGridButton.split(',');
                            for (var i = 0; i < renderArray.length; i = i + 2) {
                                widget.setIconCls(null);
                                if (rec.get(columnphp.dataIndex) == renderArray[i]) {
                                    widget.setIconCls('x-fa ' + renderArray[i + 1]);
                                    widget.setHandler(function (button) {
                                        var record = button.getWidgetRecord();
                                        var grid = this.up('panel');
                                        grid.processOnButton(grid, rowIndex, record, renderArray[i + 3], 'autocommit=false');
                                    });
                                }
                            }
                        }
                    };
                } else if ((columnkeys.renderInGridStyle !== undefined) && (columnkeys.renderInGridStyle != '')) {
                    columnkeys.renderer = function (value, metaData, record) {
                        if (metaData.column == null) return;
                        metaData.style = "	content:'" + value + "'; display:inline-block; font-size:1em; width:2.5em; height:2.5em; line-height:normal; text-align:center; border-radius:50%; background:#ffffff; vertical-align:middle; margin-right:1em; color:black; border: solid Black 1px;";
                        
						if (metaData.column.config.format){
							return Ext.util.Format.number(value, metaData.column.config.format);
						}else{
							return value;
						}
                    };
                }

                columnkeys.autoSizeColumn = true;
                if (columnkeys["minWidth"] !== undefined) {
                    if (columnkeys["width"] !== undefined) {
                        columnkeys.minWidth = columnkeys.width;
                    } else {
                        columnkeys.minWidth = 100;
                    }
                }
				
				if (columnkeys["xtype"] == "checkcolumn") {
					columnkeys.disabled = true;
					columnkeys.disabledCls = ''; // or don't add this config if you want the field to look disabled
				}
				
                if (columnkeys.dataIndex == 'FILENAME') {
					columnkeys["xtype"] = 'dynamicimagecolumn';
                    columnkeys.flex = 3;
                    columnkeys.autoSizeColumn = true;
					columnkeys.width = 500;
				}
				
                if ((columnkeys["editor"] !== undefined) && (columnkeys.editor["xtype"] !== undefined)) {
                    if (columnkeys.editor["xtype"] == "button") {
                        // Colonna con comando all interno
                        columns.push(Ext.create('Ext.grid.column.Action', {
                            header: columnname,
                            width: 40,
                            align: 'center',
                            items: [{
                                iconCls: 'x-fa fa-external-link-square',
                                tooltip: columnname,
                                handler: function (grid, rowIndex, colIndex, item, e, record) {
                                    grid.grid.processOnButton(grid, rowIndex, record, columnkeys.procremoteonclick, '');
                                }
                            }],
                        }));
                    } else if (columnkeys.editor["xtype"] == "dynamicfile") {
                        // Colonna con file all interno
                        columns.push(Ext.create('Ext.grid.column.Action', {
                            header: columnname,
                            width: 40,
                            align: 'center',
                            items: [{
                                iconCls: 'x-fa fa-file-pdf-o',
                                tooltip: columnname,
                                handler: function (grid, rowIndex, colIndex, item, e, record) {
                                    var Riga = clone(record.data);
                                    var ValRiga = Riga[columnname];
                                    if (typeof columnkeys.procremoteonclick === undefined) {
                                        columnkeys.procremoteonclick = 'openfile';
                                    };
                                    grid.grid.processOnButton(grid, rowIndex, record, columnkeys.procremoteonclick, 'FILENAME=' + ValRiga);
                                }
                            }],
                        }));
                    } else {
                        // Colonna normale di dati
                        columns.push(columnkeys);
                    }
                } else {
                    // Colonna normale di dati
                    columns.push(columnkeys);
                }
                columnnprog++;
            });
        }
		
		/*  adding NoteColumn  */
        if (me.NoteColumn) {
            columns.push(Ext.create('Ext.grid.column.Action', {
                header: 'EXE',
                autoSizeColumn: false,
                flex: 0,
                minWidth: 40,
                width: 40,
                maxWidth: 40,
                align: 'center',
                items: [{
                    iconCls: 'x-fa fa-sticky-note',
                    tooltip: 'Action',
                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                        grid.grid.processOnButton(grid, rowIndex, record, grid.grid.NoteColumn, 'autocommit=false');
                    }
                }],
            }));
        };

        if (CurrentDeviceType == 'desktop') {
			
            /*  adding CheckColumn FUNIZONI DI GRUPPO */
            if (me.CheckColumn ) {
                columns.push(Ext.create('dynamiccheckcolumn', {
                    xtype: 'dynamiccheckcolumn',
                    header: 'CHK',
                    autoSizeColumn: false,
                    flex: 0,
                    minWidth: 40,
                    width: 40,
                    maxWidth: 40,
                    dataIndex: 'active',
                    editor: [],
                }));
                if (me.DeleteColumn) this.getComponent('gridtoolbar').getComponent('ActionDeleteBtn').show();
                if (me.ActionColumn) this.getComponent('gridtoolbar').getComponent('ActionTrueBtn').show();
                if (me.ActionTrueFalseColumn) {
                    this.getComponent('gridtoolbar').getComponent('ActionTrueFalseTrueBtn').show();
                    this.getComponent('gridtoolbar').getComponent('ActionTrueFalseFalseBtn').show();
                }
            };

            /*  adding ActionColumn */
            if ((me.ActionColumn) && (! me.CheckColumn)) {
                columns.push(Ext.create('Ext.grid.column.Action', {
                    header: 'EXE',
                    autoSizeColumn: false,
                    flex: 0,
                    minWidth: 40,
                    width: 40,
                    maxWidth: 40,
                    align: 'center',
                    items: [{
                        iconCls: 'x-fa fa-long-arrow-right',
                        tooltip: 'Action',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            grid.grid.processOnButton(grid, rowIndex, record, grid.grid.ActionColumn, 'autocommit=false');
                        }
                    }],
                }));
            };
			
            /*  adding DeleteColumn  */
            if (me.DeleteColumn != 0) {
                columns.push(Ext.create('Ext.grid.column.Action', {
                    header: 'DEL',
                    autoSizeColumn: false,
                    flex: 0,
                    minWidth: 40,
                    width: 40,
                    maxWidth: 40,
                    align: 'center',
                    items: [{
                        iconCls: 'x-fa fa-trash-o',
                        tooltip: 'Delete',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
							Ext.MessageBox.show({
								title : 'Cancellazione ',
								msg : 'Confermi la cancellazione?',
								buttons : Ext.MessageBox.OKCANCEL,
								icon : Ext.MessageBox.WARNING,
								fn : function (btn) {
									if (btn == 'ok') {
										grid.grid.processOnButton(grid, rowIndex, record, 'DELETE', 'autocommit=false');
										return
									} else {
										return;
									}
								}
							});
                        }
                    }],
                }));
            };

            /*  adding ActionTrueFalseColumn */
            if ( (me.ActionTrueFalseColumn) && (! me.CheckColumn) ) {
                columns.push(Ext.create('Ext.grid.column.Action', {
                    header: 'V-F',
                    autoSizeColumn: false,
                    flex: 0,
                    minWidth: 40,
                    width: 40,
                    maxWidth: 40,
                    align: 'center',
                    items: [{
                        iconCls: 'x-fa fa-thumbs-up',
                        tooltip: 'ActionTrue',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            ParametersExtraString = 'Action=true' + '&autocommit=false';
                            grid.grid.processOnButton(grid, rowIndex, record, grid.grid.ActionTrueFalseColumn, ParametersExtraString);
                        }
                    }, {
                        iconCls: 'x-fa fa-thumbs-o-down',
                        tooltip: 'ActionFalse',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            ParametersExtraString += 'Action=false' + '&autocommit=false';
                            grid.grid.processOnButton(grid, rowIndex, record, grid.config.grid.ActionTrueFalseColumn, ParametersExtraString);
                        }
                    }],
                }));
            };
		}
        
		/*  reconfigure the column model of the grid        */
        me.reconfigure(me.store, columns);
        me.getView().refresh();

    },
	
    processOnButton: function(grid, rowIndex, record, processId, ParametersExtraString){
		if (typeof ParametersExtraString === undefined) { ParametersExtraString = ''; }
		var rec = grid.getStore().getAt(rowIndex);
		var data = {}; 
		data.ID = record.data.ID;
		data[grid.config.grid.keyField] = rec.get(grid.config.grid.keyField);
		data['datasourcefield'] = grid.config.grid.keyField;
		
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
		
		if (Custom.IsNOTNullOrEmptyOrZeroString(grid.config.grid.layouteditorid)){
			selectedRowDataString += 'layoutid' + '=' + grid.config.grid.layouteditorid + '&'
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
				grid.getStore().commitChanges();
				var appo = Ext.util.JSON.decode(resp.responseText)

				var store = grid.getStore();
				var current = store.currentPage;
				if ((grid.fireEvent('beforechange', grid, current) !== false) && (processId != '')) {
					store.loadPage(current);
				}
				Custom.ExecuteProc(processId,null,null);
			},
			failure: function() {
				Ext.Msg.alert('error', 'Not Ok');
			}
		});
	},
	
	/* assign the event to itself when the object is initialising    */
	onRender: function (ct, position) {
        dynamictreegrid.superclass.onRender.call(this, ct, position);
        this.store.on('load', this.storeLoad, this);
        var me = this;
		
        //me.maxHeight = Ext.getBody().getViewSize().height - (me.y + 100);
        //if (me.hasOwnProperty('height') == false) me.height = Ext.getBody().getViewSize().height - (me.y + 100);
        if ((me.hasOwnProperty('height') == false) && (me.hasOwnProperty('anchor')) == false) {
			me.anchor = 'none 100%';
		}

    },
	
    /* RE ORDER ROW */
    refreshRank: function () {
        // custom method
        var me = dynamictreegrid;
        this.getStore().each(function (rec, ind) {
            rec.set(me.orderField, ind + 1);
        });
    },
    clearSort: function () {
        // custom method
        var grid = this,
            store = grid.getStore();

        store.sorters.clear();
        grid.view.refresh();

        grid.refreshRank();

        grid.clearSortHappened = true;
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
				if (rec.data.active == true){
					this.PostRecordAction(rec,actionid,action);
				}
			}
		}
	},
	
	PostRecordAction: function(dirtyRecord,actionid,action) {
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
					Custom.ExecuteProc(actionid,null,null);
				},
				failure: function() {
					Ext.Msg.alert('error', 'Not Ok');
				}
			});
		}else{
			Ext.Msg.alert('error', 'LayoutEditor in Grid REQUESTED !!!');
		}
	},
	
	GetColumnWidth: function() {
		var Appo = '';
		var columnnprog = 0;
		Ext.each(this.columnManager.columns, function(columnphp){
			if (columnnprog > 0) Appo = Appo + columnphp.width + ',';
			columnnprog++;
		});
		return Appo;
	},
	
	/* COPY OUT */
    getCsvDataFromRecs: function (grid, records) {
		var me = grid;
		Custom.setCurrentPanelForm(me);
        var clipText = '';
        //var records = this.getStore().getRange();
		
		var columns = grid.getColumns();
        var rec = records[0];

        for (var i = 0; i < columns.length; i++) {
			if ( (columns[i].hidden == false) && (columns[i].hasOwnProperty('dataIndex')) ){
				clipText = clipText.concat( columns[i].text, "\t");
			}
		}

        clipText = clipText.concat("\n");

        for (var i = 0; i < records.length; i++) {
            var rec = records[i];
            Ext.iterate(rec.data, function (key, value) {
				for (var i = 0; i < columns.length; i++) {
					if ( (columns[i].hidden == false) && (columns[i].hasOwnProperty('dataIndex')) &&  (columns[i].dataIndex == key) ) {
						var valuetowrite = rec.data[columns[i].dataIndex];
						if (toType(valuetowrite) == 'date') {
							valuetowrite = Custom.yyyymmdd(valuetowrite);
						}
						if (valuetowrite != undefined){
							clipText = clipText.concat(valuetowrite, "\t");
						}else{
							clipText = clipText.concat("", "\t");
						}
					}
				}
            });
            clipText = clipText.concat("\n");
        };
        return clipText;
    },
	
    /* COPY IN */
    getRecsFromCsv: function (grid, ta) {
        var eol = '';
		var me = grid;
		Custom.setCurrentPanelForm(me);
		
        if (ta.indexOf("\r\n")) {
            eol = "\r\n";
        } else if (ta.indexOf("\n")) {
            eol = "\n";
        }
        var rows = ta.split(eol);

		//header columns
		var colsHeader = rows[0].split("\t");
		var columns = grid.getColumns();
            
        for (var i = 1; i < rows.length; i++) {
            var cols = rows[i].split("\t");
			//data
			IdPresente = false;
			ForeingPresente = false;
			selectedRowDataString = "";
            for (var j = 0; j < cols.length; j++) {
                if (cols[j] !== "") {
					var valueraw = cols[j];
					if (Custom.isNumber(valueraw.replace(".", "").replace(",", "."))){
						valueraw = valueraw.replace(".", "");
						valueraw = valueraw.replace(",", ".");
					}
					//selectedRowDataString += colsHeader[j] + '=' + encodeURIComponent(valueraw) + '&';
				
					for (var k = 0; k < columns.length; k++) {
						if (columns[k].hasOwnProperty('dataIndex')){
							if (columns[k].dataIndex.indexOf('decoded') != -1){	key = columns[k].dataIndex.replace('decoded','');}else{key = columns[k].dataIndex;}
							if (  ( (columns[k].text == colsHeader[j]) || (key == colsHeader[j]) ) ) {
								selectedRowDataString += key + '=' + encodeURIComponent(valueraw) + '&';
								if (key == me.keyField) IdPresente = true;
								if (key == me.valueField) ForeingPresente = true;
								break;
							}
						}
					}
		
					
				}
            }
			if (selectedRowDataString == "") break;
			
			if (!IdPresente)      selectedRowDataString += me.keyField   + '='  + '&';
            if (!ForeingPresente) selectedRowDataString += me.valueField + '='  + encodeURIComponent(me.textFilter) + '&'; 
			
			if (Custom.IsNOTNullOrEmptyOrZeroString(me.layouteditorid)) {
				selectedRowDataString += 'layoutid' + '=' + me.layouteditorid + '&'
			} else {
				selectedRowDataString += 'layoutid' + '=' + CurrentPanelRaw.id + '&'
			}
			
			processId = 'SAVE';
			Ext.Ajax.request({
				params: selectedRowDataString,
				url: 'includes/io/DataWrite.php',
				method: 'POST',
				async: false,
				waitTitle: 'Connecting',
				waitMsg: 'Sending data...',
				success: function (resp) {
					var appo = Ext.util.JSON.decode(resp.responseText)
					var store = me.getStore();
					var current = store.currentPage;
					if ((me.fireEvent('beforechange', me, current) !== false) && (processId != '')) {
						store.loadPage(current);
					}
					if (Custom.IsNOTNullOrEmptyOrZeroString(me.layouteditorid)) {
						Custom.ExecuteProc(processId, me.layouteditorid,null);
					} else {
						Custom.ExecuteProc(processId,null,null);
					}
					
				},
				failure: function () {
					Ext.Msg.alert('error', 'Not Ok');
				}
			});
        }
		me.localdatawhere = "";
		me.datawhere = "";
		me.keyValue = "";
		CurrentPanelRaw.DataSourceFieldValue = "";
		if (me.localdatawhere != '') {
			me.getStore().reload({
				params: {
					datawhere: me.localdatawhere
				}
			});
		} else {
			me.getStore().reload();
		}
    },

    /* DUPLICATE */
	duplicateDataFromRecs: function (grid, records) {
		var me = grid;
		Custom.setCurrentPanelForm(me);
        var clipText = '';
        //var records = this.getStore().getRange();
		var columns = grid.getColumns();
		
		//COLLECT
        for (var i = 0; i < records.length; i++) {
			var selectedRowDataString = "";
            var rec = records[i];
            Ext.iterate(rec.data, function (key, value) {
				if (key == me.keyField ){
					selectedRowDataString += key  + '=' + value + '&';
					//break();
				}
            });
			
			if (Custom.IsNOTNullOrEmptyOrZeroString(me.layouteditorid)) {
				selectedRowDataString += 'layoutid' + '=' + me.layouteditorid + '&'
			} else {
				selectedRowDataString += 'layoutid' + '=' + CurrentPanelRaw.id + '&'
			}
			
            processId = 'CLONE';
			Ext.Ajax.request({
				params: selectedRowDataString,
				url: 'includes/io/DataWrite.php',
				method: 'POST',
				async: false,
				waitTitle: 'Connecting',
				waitMsg: 'Sending data...',
				success: function (resp) {
					var appo = Ext.util.JSON.decode(resp.responseText)
					var store = me.getStore();
					var current = store.currentPage;
					if ((me.fireEvent('beforechange', me, current) !== false) && (processId != '')) {
						store.loadPage(current);
					}
					if (Custom.IsNOTNullOrEmptyOrZeroString(me.layouteditorid)) {
						Custom.ExecuteProc(processId, me.layouteditorid,null);
					} else {
						Custom.ExecuteProc(processId,null,null);
					}
					
				},
				failure: function () {
					Ext.Msg.alert('error', 'Not Ok');
				}
			});
        };
        
		me.localdatawhere = "";
		me.datawhere = "";
		me.keyValue = "";
		CurrentPanelRaw.DataSourceFieldValue = "";
		if (me.localdatawhere != '') {
			me.getStore().reload({
				params: {
					datawhere: me.localdatawhere
				}
			});
		} else {
			me.getStore().reload();
		}
    },

    /* EXCEL https://github.com/yorl1n/ext.ExportableGrid */
	exportXLSX: function (name) {
        var exportTask = {
            zip: new JSZip(),
            xlsTitle: name || this.xlsTitle,
            sharedStrings: this.xlsShowHeader ? [this.xlsTitle] : [],
            totalStrings: this.xlsShowHeader ? 1 : 0,
            totalColumns: 0,
            exportableColumns: [],
            style: {
                styles: []
            },
            export: function (grid) {
                this.zip.generateAsync({
                    type: 'blob',
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                }).then(function (content) {
                    saveAs(content, exportTask.xlsTitle + '.xlsx');
                });
            }
        };

        var cols = this.getView().getGridColumns();
        var depth = this.getTotalHeaderDepth(cols);
        var expColHeaders = new Ext.util.HashMap();
        for (var i = 0; i < cols.length; i++) {
            if (this.isColumnExportable(cols[i])) {
                var stl = {
                    align: cols[i].align ? cols[i].align : 'left',
                    width: cols[i].getWidth() / 5
                };
                if (cols[i].exportNumberFormat != null) {
                    stl.numFmt = cols[i].exportNumberFormat;
                }
				if (cols[i].xtype == "numbercolumn"){
					//format
					//stl.numFmt = '#.##';
				}
				if (cols[i].xtype == "checkcolumn"){
					//format
					stl.numFmt = '#';
				}
                exportTask.style.styles.push(stl);
                exportTask.totalColumns++;
                exportTask.exportableColumns.push(cols[i]);
                var topLvlCol = this.getTopLevelColOrDepth(cols[i]);
                if (!expColHeaders.containsKey(topLvlCol.id)) {
                    expColHeaders.add(topLvlCol.id, this.prepareExportableColumnHeader(topLvlCol, depth));
                }
            }
        }

        exportTask.levels = new Ext.util.HashMap();
        expColHeaders.each(function (k, v, l) {
            this.expandOnLevels(v, exportTask.levels);
        }, this);
        exportTask.levels.each(function (k, v) {
            for (var i = 0; i < v.length; i++) {
                this.totalStrings++;
                if (v[i].text != null && exportTask.sharedStrings.indexOf(v[i].text) < 0) {
                    exportTask.sharedStrings.push(v[i].text);
                }
            }
        }, this);
        this.generateAlphabetPositions(exportTask);
        this.generateStructure(exportTask);
        exportTask.export(this);
    },
	
	addKeyMap:function(){
		var me = this;
		//this.body.on("mouseover", this.onMouseOver, this);
		//this.body.on("mouseup", this.onMouseUp, this);

		//var dom = Ext.dom.Query.selectNode('div[class*=x-grid-item-container]', me.getEl().dom);
		//dom.style.overflowX='hidden';
		//dump(me.getEl())
		//return
		// map multiple keys to multiple actions by strings and array of codes
		me.getEl().on("keydown", this.onKeyDown , this);
		/*
		document.addEventListener("copy", function(e){
			dump("copy")
		}, false);*/
		new Ext.KeyMap(me.getEl(), [
			{
				key: "c",
				ctrl:true,
				fn: function(){
					//dump("COPY:::")
					//me.copyToClipBoard();
					var sm = me.getSelectionModel();
					setTimeout(function(){
						var pos = sm.getCurrentPosition();
						sm.deselectAll();
						sm.setPosition(pos, false, true);
					}, 500);
			}
		/*},{
				key: "v",
				ctrl:true,
				fn: function(){
					//me.pasteFromClipBoard();
			}*/
		}]);
		
	},
	

	
	updateGridData:function(e){
		//dump(["updateGridData", e, Ext.event.Event.V])
		if(e.parentEvent.keyCode != Ext.event.Event.V){
			return;	
		}
		
		//var Record 			= Ext.data.Record.create(this.store.fields.items);        	
		var tsvData 		= this.hiddentextarea.getValue();        
		tsvData				= tsvData.split("\n");
		//dump(this.hiddentextarea.getValue()+"ssssss")
		var column			= [];
		var cr 				= this.getSelectionModel().getSelectedCellRange();
		var nextIndex 		= cr[0];
		var cm 				= this.getColumnManager();
		var col;
		if( tsvData[0].split("\t").length==1 && ( (tsvData.length==1) || (tsvData.length==2  && tsvData[1].trim()== ""))){//if only one cell in clipboard data, block fill process (i.e. copy a cell, then select a group of cells to paste)
			for( var rowIndex = cr[0]; rowIndex<= cr[2]; rowIndex++){
				for( var columnIndex = cr[1]; columnIndex<= cr[3]; columnIndex++){
					col = cm.getHeaderAtIndex(columnIndex);
					if (!col) {
						continue;
					};
					this.store.getAt(rowIndex).set( col.dataIndex, tsvData[0] );
				}
			}
		}else{   		    		
			var gridTotalRows	= this.store.getCount();
			for(var rowIndex = 0; rowIndex < tsvData.length; rowIndex++ ){
				if( tsvData[rowIndex].trim()== "" ){
					continue;
				}
				columns	= tsvData[rowIndex].split("\t");
				if( nextIndex > gridTotalRows-1 ){
					//var NewRecord 	= new Record({});
					//dump("nextIndex"+nextIndex)
					this.editing && this.editing.cancelEdit();        			
					this.store.insert(nextIndex, {});						
				}
				pasteColumnIndex = cr[1];				
				for(var columnIndex=0; columnIndex < columns.length; columnIndex++ ){
					col = cm.getHeaderAtIndex(pasteColumnIndex);
					if (!col) {
						continue;
					};
					this.store.getAt(nextIndex).set( col.dataIndex, columns[columnIndex] );
					pasteColumnIndex++;
				}
				nextIndex++;
			}
		}
		//this.hiddentextarea.blur();
		var sm = this.getSelectionModel();
		sm.deSelectCellRange();
		sm.deselectAll();
		//sm.select(cr[0])
		//sm.setPosition({row: 0, column: 0});
		//setTimeout(function(){
		sm.setPosition({row: cr[0], column: cr[1]}, true, true);
		// }, 100);
	},

    privates: {
        alphabet: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
        columnTypes: {
            int: 'n',
            float: 'n',
            bool: 'b',
            boolean: 'b',
            date: 's',
            string: 's'
        },
        /**
         * The count of predefined styles.
         */
        staticStylesCount: 7,
        /**
         * Default type is string.
         */
        defaultType: 's',
        /**
         * Returns an excel type by provided extjs's type.
         * @param {type} type
         * @returns {ExportableGridAnonym$0.privates.columnTypes|String}
         */
        getExportableColumnType: function (type) {
            return this.columnTypes[type] ? this.columnTypes[type] : this.defaultType;
			/*
			if (Ext.grid.column.Number && gridColumn instanceof Ext.grid.column.Number) {
				return this.columnTypes['float'];
			}
			if (Ext.grid.column.Date && gridColumn instanceof Ext.grid.column.Date) {
				return this.columnTypes['date'];
			}
			if (Ext.grid.column.Boolean && gridColumn instanceof Ext.grid.column.Boolean) {
				return this.columnTypes['boolean'];
			}
			if (Ext.grid.column.Check && gridColumn instanceof Ext.grid.column.Check) {
				return this.['boolean'];
			}
			return this.defaultType;
			*/
			
        },
        /**
         * Checks if the column is exportable and should be exported.
         * @param {type} col
         * @returns {Boolean}
         */
        isColumnExportable: function (col) {
            if (col.xtype !== 'actioncolumn' && (col.dataIndex !== '') && !col.hidden && (col.exportable === undefined || col.exportable) && col.innerCls !== Ext.baseCSSPrefix + 'grid-cell-inner-row-expander') {
                return true;
            } else {
                return false;
            }
        },
        /**
         * Expand the object and it's children on levels.
         * @param {type} obj
         * @param {type} map
         * @returns map[level, exportable column]
         */
        expandOnLevels: function (obj, map) {
            if (map.containsKey(obj.level)) {
                map.get(obj.level).push(obj);
            } else {
                map.add(obj.level, [obj]);
            }
            if (obj.children.length > 0) {
                for (var i = 0; i < obj.children.length; i++) {
                    this.expandOnLevels(obj.children[i], map);
                }
            }
        },
        /**
         * Gets total depth of columns.
         * @param {type} cols
         * @returns 
         */
        getTotalHeaderDepth: function (cols) {
            var depth = 1;
            for (var i = 0; i < cols.length; i++) {
                if (this.isColumnExportable(cols[i])) {
                    var tmpDepth = this.getTopLevelColOrDepth(cols[i], 1);
                    if (depth < tmpDepth) {
                        depth = tmpDepth;
                    }
                }
            }
            return depth;
        },
        /**
         * Prepares the exportable column
         * @param {type} col
         * @param {type} depth
         * @param {type} parent
         * @returns 
         */
        prepareExportableColumnHeader: function (col, depth, parent) {
            var obj = {
                id: col.id,
                text: col.text,
                level: parent ? parent.level + 1 : 0,
                mergeDown: 0, //how many cells should merged down
                align: col.headerAlign || col.align || 'left',
                children: []
            };
            if (col.items && col.items.items && col.items.items.length > 0) {
                for (var i = 0; i < col.items.items.length; i++) {
                    if (!col.items.items[i].hidden) {
                        obj.children.push(this.prepareExportableColumnHeader(col.items.items[i], depth, obj));
                    }
                }
            } else {
                obj.mergeDown = depth - obj.level - 1;
            }
            obj.mergeRight = this.countSubheaders(obj, -1); //how many cells should be merged right.
            return obj;
        },
        /**
         * Count amount of actual columns.
         * @param {type} obj
         * @param {type} counter
         * @returns 
         */
        countSubheaders: function (obj, counter) {
            if (obj.children.length > 0) {
                for (var i = 0; i < obj.children.length; i++) {
                    counter = this.countSubheaders(obj.children[i], counter);
                }
                return counter;
            }
            return counter + 1;
        },
        /**
         * Get the top level column for provided column or the depth for provided column.
         * @param {type} col
         * @param {type} depth
         * @returns 
         */
        getTopLevelColOrDepth: function (col, depth) {
            if (col.ownerCt.xtype === 'gridcolumn') {
                if (depth == null) {
                    return this.getTopLevelColOrDepth(col.ownerCt);
                } else {
                    return this.getTopLevelColOrDepth(col.ownerCt, depth + 1);
                }
            } else {
                if (depth == null) {
                    return col;
                } else {
                    return depth;
                }
            }
        },
        generateAlphabetPositions: function (exportTask) {
            var counter = 0;
            exportTask.alphabetColumns = [];
            var pos = exportTask.totalColumns;
            while (counter < pos) {
                if (exportTask.alphabetColumns.length < this.alphabet.length) {
                    for (var i = 0; i < this.alphabet.length; i++) {
                        exportTask.alphabetColumns.push(this.alphabet[i]);
                        counter++;
                        if (counter >= pos) {
                            break;
                        }
                    }
                } else {
                    var tmpAlpCols = exportTask.alphabetColumns.slice();
                    for (var i = 0; i < this.alphabet.length; i++) {
                        for (var j = 0; j < tmpAlpCols.length; j++) {
                            if (exportTask.alphabetColumns.indexOf(this.alphabet[i] + tmpAlpCols[j]) < 0) {
                                exportTask.alphabetColumns.push(this.alphabet[i] + tmpAlpCols[j]);
                                counter++;
                                if (counter >= pos) {
                                    break;
                                }
                            }
                        }
                        if (counter >= pos) {
                            break;
                        }
                    }
                }
            }
        },
        /**
         * Generates total structure.
         * @param {type} exportTask
         * @returns {undefined}
         */
        generateStructure: function (exportTask) {
            this.generateContentType(exportTask.zip);
            this.generateRels(exportTask.zip);
            this.generateDocProps(exportTask.zip);
            this.generateXl(exportTask);
        },
        /**
         * Generates [Content_Types].xml.
         * @param {type} zip
         * @returns {undefined}
         */
        generateContentType: function (zip) {
            zip.file('[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8"?>' +
                '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
                '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' +
                '<Default Extension="xml" ContentType="application/xml" />' +
                '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />' +
                '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />' +
                '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />' +
                '<Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml" />' +
                '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml" />' +
                '</Types>');
        },
        /**
         * Generates _rels folder with structure.
         * @param {type} zip
         * @returns {undefined}
         */
        generateRels: function (zip) {
            var _rels = zip.folder("_rels");
            _rels.file('.rels', '<?xml version="1.0" encoding="UTF-8"?>' +
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
                '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml" />' +
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml" />' +
                '</Relationships>');
        },
        /**
         * Generates docProps folder with structure.
         * @param {type} zip
         * @returns {undefined}
         */
        generateDocProps: function (zip) {
            var docProps = zip.folder("docProps");
            docProps.file('app.xml', '<?xml version="1.0" encoding="UTF-8"?>' +
                '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">' +
                '<TotalTime>0</TotalTime>' +
                '<Application>Microsoft Excel</Application>' +
                '<DocSecurity>0</DocSecurity>' +
                '<ScaleCrop>false</ScaleCrop>' +
                '<HeadingPairs>' +
                '<vt:vector size="2" baseType="variant">' +
                '<vt:variant>' +
                '<vt:lpstr>Worksheets</vt:lpstr>' +
                '</vt:variant>' +
                '<vt:variant>' +
                '<vt:i4>1</vt:i4>' +
                '</vt:variant>' +
                '</vt:vector>' +
                '</HeadingPairs>' +
                '<TitlesOfParts>' +
                '<vt:vector size="1" baseType="lpstr">' +
                '<vt:lpstr>Sheet1</vt:lpstr>' +
                '</vt:vector>' +
                '</TitlesOfParts>' +
                '<Company />' +
                '<LinksUpToDate>false</LinksUpToDate>' +
                '<SharedDoc>false</SharedDoc>' +
                '<HyperlinksChanged>false</HyperlinksChanged>' +
                '<AppVersion>15.0300</AppVersion>' +
                '</Properties>');
        },
        /**
         * Generates xl folder with structure.
         * @param {type} exportTask
         * @returns {undefined}
         */
        generateXl: function (exportTask) {
            var xl = exportTask.zip.folder("xl");
            this.generateXlRels(xl);
            this.generateWorkbook(xl);
            this.generateWorksheets(xl, exportTask);
            this.generateSharedStrings(xl, exportTask);
            this.generateStyles(xl, exportTask);
        },
        /**
         * Generates _rels subfolder of xl folder.
         * @param {type} xl
         * @returns {undefined}
         */
        generateXlRels: function (xl) {
            var _rels = xl.folder("_rels");
            _rels.file('workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8"?>' +
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml" />' +
                '<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml" />' +
                '<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml" />' +
                '</Relationships>');
        },
        /**
         * Generates workbook.xml.
         * @param {type} xl
         * @returns {undefined}
         */
        generateWorkbook: function (xl) {
            xl.file('workbook.xml', '<?xml version="1.0" encoding="UTF-8"?>' +
                '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main" mc:Ignorable="x15">' +
                '<fileVersion appName="xl" lastEdited="6" lowestEdited="6" rupBuild="14420" />' +
                '<workbookPr defaultThemeVersion="153222" />' +
                '<bookViews>' +
                '<workbookView xWindow="0" yWindow="0" windowWidth="28800" windowHeight="14235" />' +
                '</bookViews>' +
                '<sheets>' +
                '<sheet name="Sheet1" sheetId="1" r:id="rId1" />' +
                '</sheets>' +
                '<calcPr calcId="0" />' +
                '</workbook>');
        },
        /**
         * Generates main worksheet.
         * @param {type} xl
         * @param {type} exportTask
         * @returns {undefined}
         */
        generateWorksheets: function (xl, exportTask) {
            var ws = xl.folder('worksheets');
            var currentRow = 1,
                currentCol = 1,
                mergeCells = [],
                rows = '';
            if (this.xlsShowHeader) {
                currentRow = 2;
                rows += '<row r="1" customHeight="1" ht="38.1" spans="1:' + exportTask.totalColumns + '">' +
                    '<c r="A1" t="s" s="1"><v>0</v></c>';
                for (currentCol; currentCol < exportTask.totalColumns; currentCol++) {
                    rows += '<c r="' + exportTask.alphabetColumns[currentCol] + '1" t="s" s="1"/>';
                }
                rows += '</row>';
                mergeCells.push('A1:' + exportTask.alphabetColumns[exportTask.totalColumns - 1] + '1');
            }
            currentCol = 0;
            exportTask.mergedHeaders = [];
            exportTask.levels.each(function (k, v) {
                rows += '<row r="' + currentRow + '" customHeight="1" spans="1:' + exportTask.totalColumns + '">';
                for (var i = 0; i < v.length; i++) {
                    var styleId = 3;
                    switch (v[i].align) {
                    case 'right':
                        styleId = 2;
                        break;
                    case 'left':
                        styleId = 4;
                        break;
                    }
                    while (exportTask.mergedHeaders.indexOf(exportTask.alphabetColumns[currentCol] + currentRow) >= 0) {
                        rows += '<c r="' + exportTask.alphabetColumns[currentCol] + currentRow + '" t="s" s="' + styleId + '"/>';
                        currentCol++;
                    }
                    rows += '<c r="' + exportTask.alphabetColumns[currentCol] + currentRow + '" t="s" s="' + styleId + '"><v>' + exportTask.sharedStrings.indexOf(v[i].text) + '</v></c>';
                    if (v[i].mergeRight || v[i].mergeDown) {
                        var merge = exportTask.alphabetColumns[currentCol] + currentRow + ':';
                        var pos = currentRow;
                        if (v[i].mergeRight) {
                            for (var j = 0; j < v[i].mergeRight; j++) {
                                rows += '<c r="' + exportTask.alphabetColumns[++currentCol] + currentRow + '" t="s" s="' + styleId + '"/>';
                            }
                        }
                        if (v[i].mergeDown) {
                            for (var mc = 0; mc < v[i].mergeDown; mc++) {
                                pos++;
                                if (v[i].mergeRight) {
                                    for (var mr = 0; mr < v[i].mergeRight; mr++) {
                                        exportTask.mergedHeaders.push(exportTask.alphabetColumns[currentCol + mr] + pos);
                                    }
                                } else {
                                    exportTask.mergedHeaders.push(exportTask.alphabetColumns[currentCol] + pos);
                                }
                            }
                        }
                        merge += exportTask.alphabetColumns[currentCol] + pos;
                        mergeCells.push(merge);
                    }
                    currentCol++;
                    if (i + 1 >= v.length && currentCol < exportTask.totalColumns) {
                        while (exportTask.mergedHeaders.indexOf(exportTask.alphabetColumns[currentCol] + currentRow) >= 0) {
                            rows += '<c r="' + exportTask.alphabetColumns[currentCol] + currentRow + '" t="s" s="' + styleId + '"/>';
                            currentCol++;
                        }
                    }
                }
                rows += '</row>';
                currentRow++;
                currentCol = 0;
            }, this);

            var renderRecords = [];

            var features = {};

            for (var i = 0; i < this.view.features.length; i++) {
                features[this.view.features[i].ftype] = this.view.features[i];
            }
            if (!this.store.isGrouped()) {
                renderRecords = Ext.clone(this.store.data.items);
            } else {
                var storeGroups = this.store.getGroups();
                var tpl = null;
                for (var i = 0; i < this.view.features.length; i++) {
                    if (this.view.features[i].ftype === 'grouping' || this.view.features[i].ftype === 'groupingsummary') {
                        tpl = this.view.features[i].groupHeaderTpl;
                    }
                }
                if (tpl != null) {
                    storeGroups.each(function (gr) {
                        var groupColumn = this.view.getColumnManager().getHeaderByDataIndex(this.store.getGroupField());
                        var renderedGroupValue = groupColumn.config.renderer ? groupColumn.config.renderer(gr.getAt(0).get(this.store.getGroupField()), {}, gr.getAt(0)) : gr.getGroupKey();
                        var groupingHeaderValue = tpl.apply({
                            groupValue: gr.getGroupKey(),
                            groupField: this.store.groupField,
                            columnName: groupColumn.text,
                            name: renderedGroupValue,
                            renderedGroupValue: renderedGroupValue
                        });
                        var grH = Ext.create('Ext.data.Model', {
                            groupingHeaderValue: groupingHeaderValue
                        });
                        grH.isGroupingHeader = true;
                        renderRecords.push(grH);
                        for (var i = 0; i < gr.items.length; i++) {
                            renderRecords.push(gr.items[i]);
                        }

                        if (features['groupingsummary']) {
                            var modelData = {};
                            for (var i = 0; i < exportTask.exportableColumns.length; i++) {
                                var exCol = exportTask.exportableColumns[i];
                                if (exCol) {
                                    var summaryObj = features['groupingsummary'].getSummary(this.store, exCol.summaryType, exCol.dataIndex);
                                    var summaryVal = null;
                                    if (summaryObj) {
                                        summaryVal = summaryObj[gr.getGroupKey()];
                                    }
                                    if (exCol.summaryRenderer) {
                                        modelData[exCol.dataIndex] = exCol.summaryRenderer(summaryVal, features['groupingsummary'].summaryData, exCol.dataIndex, this.view.cellValues);
                                    } else {
                                        modelData[exCol.dataIndex] = summaryVal;
                                    }
                                }
                            }
                            var summaryM = Ext.create('Ext.data.Model', modelData);
                            summaryM.isSummary = true;
                            renderRecords.push(summaryM);
                        }
                    }, this);
                }
            }
            if (features['summary']) {
                var modelData = {};
                for (var i = 0; i < exportTask.exportableColumns.length; i++) {
                    var exCol = exportTask.exportableColumns[i];
                    if (exCol) {
                        var summaryVal = features['summary'].getSummary(this.store, exCol.summaryType, exCol.dataIndex);
                        if (exCol.summaryRenderer) {
                            modelData[exCol.dataIndex] = exCol.summaryRenderer(summaryVal, features['summary'].summaryData, exCol.dataIndex, this.view.cellValues);
                        } else {
                            modelData[exCol.dataIndex] = summaryVal;
                        }
                    }
                }
                var summaryM = Ext.create('Ext.data.Model', modelData);
                summaryM.isSummary = true;
                renderRecords.push(summaryM);
            }

            for (var i = 0; i < renderRecords.length; i++) {
                rows += '<row r="' + currentRow + '" customHeight="1" spans="1:' + exportTask.totalColumns + '">';
                var rec = renderRecords[i];
                for (var j = 0; j < exportTask.exportableColumns.length; j++) {
                    if (rec.isGroupingHeader === true) {
                        if (j > 0) {
                            continue;
                        } else {
                            mergeCells.push(exportTask.alphabetColumns[0] + currentRow + ':' + exportTask.alphabetColumns[exportTask.exportableColumns.length - 1] + currentRow);
                        }
                    }

                    var param = rec.isGroupingHeader === true ? {
                        dataIndex: 'groupingHeaderValue'
                    } : exportTask.exportableColumns[j];
                    var type;
                    if (!rec.isSummary && !rec.isGroupingHeader) {
                        if (param.xtype === 'templatecolumn') {
                            type = 'template';
                        } else if (param.xtype === 'numbercolumn') {
                            type = 'num';
                        } else if (param.xtype === 'checkcolumn') {
							type = 'num';
                        }else if (param.exportConverter) {
                            type = 'converter';
                        } else if (!param.skipRenderer && param.renderer) {
                            type = 'renderer';
                        } else {
                            type = rec.getField(param.dataIndex) ? this.getExportableColumnType(rec.getField(param.dataIndex).type) : this.defaultType;
                        }
                    } else {
                        type = 's';
                    }

                    switch (type) {
                    case 's':
                        var styleId = rec.isGroupingHeader === true ? 5 : rec.isSummary ? 6 : (j + this.staticStylesCount);
                        if (rec.get(param.dataIndex) != null) {
                            rows += '<c r="' + exportTask.alphabetColumns[currentCol++] + currentRow + '" t="str" s="' + styleId + '"><v>' + this.removeSpecials(Ext.util.Format.htmlEncode(String(rec.get(param.dataIndex)))) + '</v></c>';
                        } else {
                            rows += '<c r="' + exportTask.alphabetColumns[currentCol++] + currentRow + '" t="str" s="' + styleId + '"/>';
                        }
                        break;
                    case 'template':
                        rows += '<c r="' + exportTask.alphabetColumns[currentCol++] + currentRow + '" t="str" s="' + (j + this.staticStylesCount) + '"><v>' + this.removeSpecials(Ext.util.Format.htmlEncode(String(this.getView().getGridColumns()[param].tpl.apply(rec.data)))) + '</v></c>';
                        break;
                    case 'renderer':
                        var renderCol = exportTask.exportableColumns[j];
                        var renderedValue = param.renderer.call(renderCol.usingDefaultRenderer ? renderCol : renderCol.scope || this.view.ownerCt, rec.get(param.dataIndex), this.view.cellValues, rec, i, j, this.store, this.view);
                        if (renderedValue != null) {
                            rows += '<c r="' + exportTask.alphabetColumns[currentCol++] + currentRow + '" t="str" s="' + (j + this.staticStylesCount) + '"><v>' + this.removeSpecials(Ext.util.Format.htmlEncode(String(renderedValue))) + '</v></c>';
                        } else {
                            rows += '<c r="' + exportTask.alphabetColumns[currentCol++] + currentRow + '" t="str" s="' + (j + this.staticStylesCount) + '"/>';
                        }
                        break;
                    case 'converter':
                        var renderedValue = param.exportConverter(rec.get(param.dataIndex), this.view.cellValues, rec, i, j, this.store, this.view);
                        if (renderedValue != null) {
                            rows += '<c r="' + exportTask.alphabetColumns[currentCol++] + currentRow + '" t="str" s="' + (j + this.staticStylesCount) + '"><v>' + this.removeSpecials(Ext.util.Format.htmlEncode(String(renderedValue))) + '</v></c>';
                        } else {
                            rows += '<c r="' + exportTask.alphabetColumns[currentCol++] + currentRow + '" t="str" s="' + (j + this.staticStylesCount) + '"/>';
                        }
                        break;
                    default:
                        if (rec.get(param.dataIndex) != null) {
                            rows += '<c r="' + exportTask.alphabetColumns[currentCol++] + currentRow + '" t="' + type + '" s="' + (j + this.staticStylesCount) + '"><v>' + rec.get(param.dataIndex) + '</v></c>';
                        } else {
                            rows += '<c r="' + exportTask.alphabetColumns[currentCol++] + currentRow + '" t="' + type + '" s="' + (j + this.staticStylesCount) + '"/>';
                        }
                    }
                }
                rows += '</row>\n';
                currentRow++;
                currentCol = 0;
            }
            var columns = '';
            if (exportTask.style.styles.length > 0) {
                columns += '<cols>';
                for (var i = 0; i < exportTask.style.styles.length; i++) {
                    columns += '<col customWidth="1" width="' + exportTask.style.styles[i].width + '" max="' + (i + 1) + '" min="' + (i + 1) + '"/>';
                }
                columns += '</cols>';
            }
            var result = '<?xml version="1.0" encoding="UTF-8"?>' +
                '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" mc:Ignorable="x14ac">' +
                '<dimension ref="A1:' + exportTask.alphabetColumns[exportTask.totalColumns - 1] + (currentRow - 1) + '"/>' +
                '<sheetViews>' +
                '<sheetView tabSelected="1" workbookViewId="0" />' +
                '</sheetViews>' +
                '<sheetFormatPr baseColWidth="10" defaultColWidth="9.140625" defaultRowHeight="15" x14ac:dyDescent="0.25" />' +
                columns +
                '<sheetData>' +
                rows +
                '</sheetData>';
            if (mergeCells.length > 0) {
                result += '<mergeCells count="' + mergeCells.length + '">';
                for (var i = 0; i < mergeCells.length; i++) {
                    result += '<mergeCell ref="' + mergeCells[i] + '"/>';
                }
                result += '</mergeCells>';
            }
            result += '</worksheet>';
            ws.file('sheet1.xml', result);
        },
        /**
         * Generates a sharedStrings.xml.
         * @param {type} xl
         * @param {type} exportTask
         * @returns {undefined}
         */
        generateSharedStrings: function (xl, exportTask) {
            var strings = '';
            for (var i = 0; i < exportTask.sharedStrings.length; i++) {
                strings += '<si><t>' + this.removeSpecials(Ext.util.Format.htmlEncode(exportTask.sharedStrings[i])) + '</t></si>';
            }
            xl.file('sharedStrings.xml', '<?xml version="1.0" encoding="UTF-8"?>' +
                '<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="' + this.totalStrings + '" uniqueCount="' + exportTask.sharedStrings.length + '">' +
                strings +
                '</sst>');
        },
        /**
         * Removes special symbols from the string.
         */
        removeSpecials: function (str) {
            var spec = /[\x00-\x08\x0E-\x1F\x7F]/g;
            var tab = /\x09/g;
            str = str.replace(spec, "");
            return str.replace(tab, "   ");
        },
        /**
         * Generates a styles.xml.
         * @param {type} xl
         * @param {type} exportTask
         * @returns {undefined}
         */
        generateStyles: function (xl, exportTask) {
            var fonts = '<fonts count="3">' +
                //common font
                '<font>' +
                '<sz val="10"/>' +
                '<name val="Arial"/>' +
                '</font>' +
                //Table name font
                '<font>' +
                '<b/>' +
                '<sz val="18"/>' +
                '<name val="Arial"/>' +
                '</font>' +
                //headers font
                '<font>' +
                '<b/>' +
                '<sz val="10"/>' +
                '<name val="Arial"/>' +
                '</font>' +
                '</fonts>';
            var fills = '<fills count="5">' +
                '<fill>' +
                '<patternFill patternType="none" />' +
                '</fill>' +
                '<fill>' +
                '<patternFill patternType="gray125" />' +
                '</fill>' +
                '<fill>' +
                '<patternFill patternType="solid">' +
                '<fgColor rgb="FF' + this.xlsHeaderColor + '"/>' +
                '<bgColor indexed="64"/>' +
                '</patternFill>' +
                '</fill>' +
                '<fill>' +
                '<patternFill patternType="solid">' +
                '<fgColor rgb="FF' + this.xlsGroupHeaderColor + '"/>' +
                '<bgColor indexed="64"/>' +
                '</patternFill>' +
                '</fill>' +
                '<fill>' +
                '<patternFill patternType="solid">' +
                '<fgColor rgb="FF' + this.xlsSummaryColor + '"/>' +
                '<bgColor indexed="64"/>' +
                '</patternFill>' +
                '</fill>' +
                '</fills>';
            var colStyles = '';
            var numFmtId = 500;
            var numFmtStyles = '';
            var nfsCount = 0;
            for (var i = 0; i < exportTask.style.styles.length; i++) {
                var tmpNumFmtId = 0;
                if (exportTask.style.styles[i].numFmt != null) {
                    nfsCount++;
                    numFmtStyles += '<numFmt formatCode="' + exportTask.style.styles[i].numFmt + '" numFmtId="' + numFmtId + '"/>';
                    tmpNumFmtId = numFmtId;
                    numFmtId++;

                }
                colStyles += '<xf borderId="1" fillId="0" fontId="0" numFmtId="' + tmpNumFmtId + '" xfId="0">' +
                    '<alignment wrapText="1" vertical="center" horizontal="' + exportTask.style.styles[i].align + '"/>' +
                    '</xf>';
            }
            if (numFmtStyles.length > 0) {
                numFmtStyles = '<numFmts count="' + nfsCount + '">' + numFmtStyles + '</numFmts>';
            }
            xl.file('styles.xml', '<?xml version="1.0" encoding="UTF-8"?>' +
                '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" mc:Ignorable="x14ac">' +
                numFmtStyles +
                fonts +
                fills +
                '<borders count="2">' +
                '<border>' +
                '<left />' +
                '<right />' +
                '<top />' +
                '<bottom />' +
                '<diagonal />' +
                '</border>' +
                '<border>' +
                '<left style="thin">' +
                '<color auto="1"/>' +
                '</left>' +
                '<right style="thin">' +
                '<color auto="1"/>' +
                '</right>' +
                '<top style="thin">' +
                '<color auto="1"/>' +
                '</top>' +
                '<bottom  style="thin">' +
                '<color auto="1"/>' +
                '</bottom>' +
                '<diagonal/>' +
                '</border>' +
                '</borders>' +
                '<cellStyleXfs count="1">' +
                '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" />' +
                '</cellStyleXfs>' +
                '<cellXfs count="' + (exportTask.style.styles.length + this.staticStylesCount) + '">' +
                '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" />' +
                //Title style
                '<xf borderId="1" fillId="0" fontId="1" numFmtId="0" xfId="0">' +
                '<alignment wrapText="1" vertical="center" horizontal="center"/>' +
                '</xf>' +
                //Header align right
                '<xf borderId="1" fillId="2" fontId="2" numFmtId="0" xfId="0">' +
                '<alignment wrapText="1" vertical="center" horizontal="right"/>' +
                '</xf>' +
                //Header align center
                '<xf borderId="1" fillId="2" fontId="2" numFmtId="0" xfId="0">' +
                '<alignment wrapText="1" vertical="center" horizontal="center"/>' +
                '</xf>' +
                //Header align left
                '<xf borderId="1" fillId="2" fontId="2" numFmtId="0" xfId="0">' +
                '<alignment wrapText="1" vertical="center" horizontal="left"/>' +
                '</xf>' +
                //Grouping headers
                '<xf borderId="1" fillId="3" fontId="0" numFmtId="0" xfId="0">' +
                '<alignment wrapText="1" vertical="center" horizontal="left"/>' +
                '</xf>' +
                //Summary
                '<xf borderId="1" fillId="4" fontId="0" numFmtId="0" xfId="0">' +
                '<alignment wrapText="1" vertical="center" horizontal="left"/>' +
                '</xf>' +
                colStyles +
                '</cellXfs>' +
                '<cellStyles count="1">' +
                '<cellStyle name="Standard" xfId="0" builtinId="0" />' +
                '</cellStyles>' +
                '<dxfs count="0" />' +
                '<tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleMedium9" />' +
                '<extLst>' +
                '<ext xmlns:x14="http://schemas.microsoft.com/office/spreadsheetml/2009/9/main" uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}">' +
                '<x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1" />' +
                '</ext>' +
                '<ext xmlns:x15="http://schemas.microsoft.com/office/spreadsheetml/2010/11/main" uri="{9260A510-F301-46a8-8635-F512D64BE5F5}">' +
                '<x15:timelineStyles defaultTimelineStyle="TimeSlicerStyleLight1" />' +
                '</ext>' +
                '</extLst>' +
                '</styleSheet>');
        }
    }

});

Ext.define('Ext.tree.Panel.feature.Feature', {
    extend: 'Ext.util.Observable',
    alias: 'feature.treefeature',
 
    wrapsItem: false,
 
    /**
     * @property {Boolean} isFeature 
     * `true` in this class to identify an object as an instantiated Feature, or subclass thereof.
     */
    isFeature: true,
 
    /**
     * True when feature is disabled.
     */
    disabled: false,
 
    /**
     * @property {Boolean}
     * Most features will expose additional events, some may not and will
     * need to change this to false.
     */
    hasFeatureEvent: true,
 
    /**
     * @property {String}
     * Prefix to use when firing events on the view.
     * For example a prefix of group would expose "groupclick", "groupcontextmenu", "groupdblclick".
     */
    eventPrefix: null,
 
    /**
     * @property {String}
     * Selector used to determine when to fire the event with the eventPrefix.
     */
    eventSelector: null,
 
    /**
     * @property {Ext.view.Table}
     * Reference to the TableView.
     */
    view: null,
 
    /**
     * @property {Ext.grid.Panel}
     * Reference to the grid panel
     */
    grid: null,
 
    constructor: function(config) {
        this.initialConfig = config;
        this.callParent(arguments);
    },
 
    clone: function() {
        return new this.self(this.initialConfig);
    },
 
    /**
     * Protected method called during {@link Ext.view.Table View} construction.  The 
     * owning {@link Ext.grid.Panel Grid} is passed as a param.
     * @param {Ext.grid.Panel} grid The View's owning Grid.  **Note** that in a 
     * {@link Ext.grid.Panel#cfg-enableLocking locking Grid} the passed grid will be 
     * either the normal grid or the locked grid, which is the view's direct owner.
     * @method
     * @protected
     */
    init: Ext.emptyFn,
 
    /**
     * Abstract method to be overriden when a feature should add additional
     * arguments to its event signature. By default the event will fire:
     *
     * - view - The underlying Ext.view.Table
     * - featureTarget - The matched element by the defined {@link #eventSelector}
     *
     * The method must also return the eventName as the first index of the array
     * to be passed to fireEvent.
     * @template
     */
    getFireEventArgs: function(eventName, view, featureTarget, e) {
        return [eventName, view, featureTarget, e];
    },
 
    vetoEvent: Ext.emptyFn,
 
    /**
     * Enables the feature.
     */
    enable: function() {
        this.disabled = false;
    },
 
    /**
     * Disables the feature.
     */
    disable: function() {
        this.disabled = true;
    }
 
});

Ext.define('Ext.tree.Panel.feature.AbstractSummary', {
 
    extend: 'Ext.tree.Panel.feature.Feature',
 
    alias: 'feature.treeabstractsummary',
 
    summaryRowCls: Ext.baseCSSPrefix + 'grid-row-summary',
    summaryRowSelector: '.' + Ext.baseCSSPrefix + 'grid-row-summary',
 
    readDataOptions: {
        recordCreator: Ext.identityFn
    },
 
    // High priority rowTpl interceptor which sees summary rows early, and renders them correctly and then aborts the row rendering chain. 
    // This will only see action when summary rows are being updated and Table.onUpdate->Table.bufferRender renders the individual updated sumary row. 
    summaryRowTpl: {
        fn: function(out, values, parent) {
            // If a summary record comes through the rendering pipeline, render it simply instead of proceeding through the tplchain 
            if (values.record.isSummary) {
                this.summaryFeature.outputSummaryRecord(values.record, values, out, parent);
            } else {
                this.nextTpl.applyOut(values, out, parent);
            }
        },
        priority: 1000
    },
 
   /**
    * @cfg {Boolean}
    * True to show the summary row.
    */
    showSummaryRow: true,
 
    // Listen for store updates. Eg, from an Editor. 
    init: function() {
        var me = this;
        me.view.summaryFeature = me;
        me.rowTpl = me.view.self.prototype.rowTpl;
 
        // Add a high priority interceptor which renders summary records simply 
        // This will only see action ona bufferedRender situation where summary records are updated. 
        me.view.addRowTpl(me.summaryRowTpl).summaryFeature = me;
 
        // Define on the instance to store info needed by summary renderers. 
        me.summaryData = {};
        me.groupInfo = {};
 
        // Cell widths in the summary table are set directly into the cells. There's no <colgroup><col> 
        // Some browsers use content box and some use border box when applying the style width of a TD 
        if (!me.summaryTableCls) {
            me.summaryTableCls = Ext.baseCSSPrefix + 'grid-item';
        }
 
        // We have been configured with another class. Revert to building the selector 
        if (me.hasOwnProperty('summaryRowCls')) {
            me.summaryRowSelector = '.' + me.summaryRowCls;
        }
    },
    
    bindStore: function(grid, store) {
        var me = this;
        
        Ext.destroy(me.readerListeners);
        
        if (me.remoteRoot) {
            me.readerListeners = store.getProxy().getReader().on({
                scope: me,
                destroyable: true,
                rawdata: me.onReaderRawData
            });
        }
    },
    
    onReaderRawData: function(data) {
        // Invalidate potentially existing summaryRows to force recalculation 
        this.summaryRows = null;
        this.readerRawData = data;
    },
 
    /**
     * Toggle whether or not to show the summary row.
     * @param {Boolean} visible True to show the summary row
     * @param fromLockingPartner (private)
     */
    toggleSummaryRow: function(visible, fromLockingPartner) {
        var me = this,
            prev = me.showSummaryRow,
            doRefresh;
 
        visible = visible != null ? !!visible : !me.showSummaryRow;
        me.showSummaryRow = visible;
        if (visible && visible !== prev) {
            // If being shown, something may have changed while not visible, so 
            // force the summary records to recalculate 
            me.updateSummaryRow = true;
        }
 
        // If there is another side to be toggled, then toggle it (as long as we are not already being commanded from that other side); 
        // Then refresh the whole arrangement. 
        if (me.lockingPartner) {
            if (!fromLockingPartner) {
                me.lockingPartner.toggleSummaryRow(visible, true);
                doRefresh = true;
            }
        } else {
            doRefresh = true;
        }
        if (doRefresh) {
            me.grid.ownerGrid.getView().refresh();
        }
    },
 
    createRenderer: function (column, record) {
        var me = this,
            ownerGroup = record.ownerGroup,
            summaryData = ownerGroup ? me.summaryData[ownerGroup] : me.summaryData,
            // Use the column.getItemId() for columns without a dataIndex. The populateRecord method does the same. 
            dataIndex = column.dataIndex || column.getItemId();
 
        return function (value, metaData) {
             return column.summaryRenderer ?
                column.summaryRenderer(record.data[dataIndex], summaryData, dataIndex, metaData) :
                // For no summaryRenderer, return the field value in the Feature record. 
                record.data[dataIndex];
        };
    },
 
    outputSummaryRecord: function(summaryRecord, contextValues, out) {
        var view = contextValues.view,
            savedRowValues = view.rowValues,
            columns = contextValues.columns || view.headerCt.getVisibleGridColumns(),
            colCount = columns.length, i, column,
            // Set up a row rendering values object so that we can call the rowTpl directly to inject 
            // the markup of a grid row into the output stream. 
            values = {
                view: view,
                record: summaryRecord,
                rowStyle: '',
                rowClasses: [ this.summaryRowCls, this.summaryItemCls ],
                itemClasses: [],
                recordIndex: -1,
                rowId: view.getRowId(summaryRecord),
                columns: columns
            };
 
        // Because we are using the regular row rendering pathway, temporarily swap out the renderer for the summaryRenderer 
        for (i = 0; i < colCount; i++) {
            column = columns[i];
            column.savedRenderer = column.renderer;
 
            if (column.summaryType || column.summaryRenderer) {
                column.renderer = this.createRenderer(column, summaryRecord);
            } else {
                column.renderer = Ext.emptyFn;
            }
        }
 
        // Use the base template to render a summary row 
        view.rowValues = values;
        view.self.prototype.rowTpl.applyOut(values, out, parent);
        view.rowValues = savedRowValues;
 
        // Restore regular column renderers 
        for (i = 0; i < colCount; i++) {
            column = columns[i];
            column.renderer = column.savedRenderer;
            column.savedRenderer = null;
        }
    },
 
    /**
     * Get the summary data for a field.
     * @private
     * @param {Ext.data.Store} store The store to get the data from
     * @param {String/Function} type The type of aggregation. If a function is specified it will
     * be passed to the stores aggregate function.
     * @param {String} field The field to aggregate on
     * @param {Ext.util.Group} group The group from which to calculate the value
     * @return {Number/String/Object} See the return type for the store functions.
     * if the group parameter is `true` An object is returned with a property named for each group who's
     * value is the summary value.
     */
    getSummary: function (store, type, field, group) {
        var isGrouped = !!group,
            item = isGrouped ? group : store;
 
        if (type) {
            if (Ext.isFunction(type)) {
                if (isGrouped) {
                    return item.aggregate(field, type);
                } else {
                    return item.aggregate(type, null, false, [field]);
                }
            }
 
            switch (type) {
                case 'count':
                    return item.count();
                case 'min':
                    return item.min(field);
                case 'max':
                    return item.max(field);
                case 'sum':
                    return item.sum(field);
                case 'average':
                    return item.average(field);
                default:
                    return '';
 
            }
        }
    },
    
    getRawData: function() {
        var data = this.readerRawData;
        
        if (data) {
            return data;
        }
        
        // Synchronous Proxies such as Memory proxy will set keepRawData to true 
        // on their Reader instances, and may have been loaded before we were bound 
        // to the store. Or the Reader may have been configured with keepRawData: true 
        // manually. 
        // In these cases, the Reader should have rawData on the instance. 
        return this.view.getStore().getProxy().getReader().rawData;
    },
 
    generateSummaryData: function(groupField) {
        var me = this,
            summaryRows = me.summaryRows,
            convertedSummaryRow = {},
            remoteData = {},
            storeReader, reader, rawData, i, len, summaryRows, rows, row;
        
        // Summary rows may have been cached by previous run 
        if (!summaryRows) {
            rawData = me.getRawData();
        
            if (!rawData) {
                return;
            }
            
            // Construct a new Reader instance of the same type to avoid 
            // munging the one in the Store 
            storeReader = me.view.store.getProxy().getReader();
            reader = Ext.create('reader.' + storeReader.type, storeReader.getConfig());
            
            // reset reader root and rebuild extractors to extract summaries data 
            reader.setRootProperty(me.remoteRoot);
            
            // At this point summaryRows is still raw data, e.g. XML node 
            summaryRows = reader.getRoot(rawData);
            
            if (summaryRows) {
                rows = [];
                
                if (!Ext.isArray(summaryRows)) {
                    summaryRows = [summaryRows];
                }
                
                len = summaryRows.length;
 
                for (i = 0; i < len; ++i) {
                    // Convert a raw data row into a Record's hash object using the Reader. 
                    row = reader.extractRecordData(summaryRows[i], me.readDataOptions);
                    rows.push(row);
                }
                
                me.summaryRows = summaryRows = rows;
            }
            
            // By the next time the configuration may change 
            reader.destroy();
            
            // We also no longer need the whole raw dataset 
            me.readerRawData = null;
        }
        
        if (summaryRows) {
            for (i = 0, len = summaryRows.length; i < len; i++) {
                convertedSummaryRow = summaryRows[i];
                
                if (groupField) {
                    remoteData[convertedSummaryRow[groupField]] = convertedSummaryRow;
                }
            }
        }
        
        return groupField ? remoteData : convertedSummaryRow;
    },
 
    setSummaryData: function (record, colId, summaryValue, groupName) {
        var summaryData = this.summaryData;
 
        if (groupName) {
            if (!summaryData[groupName]) {
                summaryData[groupName] = {};
            }
            summaryData[groupName][colId] = summaryValue;
        } else {
            summaryData[colId] = summaryValue;
        }
    },
    
    destroy: function() {
        Ext.destroy(this.readerListeners);
        this.readerRawData = this.summaryRows = null;
        
        this.callParent();
    }
});

Ext.define('Ext.tree.Panel.feature.Summary', {
 
    /* Begin Definitions */
 
    extend: 'Ext.tree.Panel.feature.AbstractSummary',
 
    alias: 'feature.treesummary',
 
    /**
     * @cfg {String} dock 
     * Configure `'top'` or `'bottom'` top create a fixed summary row either above or below the scrollable table.
     *
     */
    dock: undefined,
 
    summaryItemCls: Ext.baseCSSPrefix + 'grid-row-summary-item',
    dockedSummaryCls: Ext.baseCSSPrefix + 'docked-summary',
 
    summaryRowCls: Ext.baseCSSPrefix + 'grid-row-summary ' + Ext.baseCSSPrefix + 'grid-row-total',
    summaryRowSelector: '.' + Ext.baseCSSPrefix + 'grid-row-summary.' + Ext.baseCSSPrefix + 'grid-row-total',
 
    panelBodyCls: Ext.baseCSSPrefix + 'summary-',
 
    // turn off feature events. 
    hasFeatureEvent: false,
 
    fullSummaryTpl: {
        fn: function(out, values, parent) {
            var me = this.summaryFeature,
                record = me.summaryRecord,
                view = values.view,
                bufferedRenderer = view.bufferedRenderer;
 
            this.nextTpl.applyOut(values, out, parent);
 
            if (!me.disabled && me.showSummaryRow && !view.addingRows && view.store.isLast(values.record)) {
                if (bufferedRenderer && !me.dock) {
                     bufferedRenderer.variableRowHeight = true;
                }
                me.outputSummaryRecord((record && record.isModel) ? record : me.createSummaryRecord(view), values, out, parent);
            }
        },
 
        priority: 300,
 
        beginRowSync: function (rowSync) {
            rowSync.add('fullSummary', this.summaryFeature.summaryRowSelector);
        },
 
        syncContent: function(destRow, sourceRow, columnsToUpdate) {
            destRow = Ext.fly(destRow, 'syncDest');
            sourceRow = Ext.fly(sourceRow, 'sycSrc');
            var summaryFeature = this.summaryFeature,
                selector = summaryFeature.summaryRowSelector,
                destSummaryRow = destRow.down(selector, true),
                sourceSummaryRow = sourceRow.down(selector, true);
 
            // Sync just the updated columns in the summary row. 
            if (destSummaryRow && sourceSummaryRow) {
 
                // If we were passed a column set, only update those, otherwise do the entire row 
                if (columnsToUpdate) {
                    this.summaryFeature.view.updateColumns(destSummaryRow, sourceSummaryRow, columnsToUpdate);
                } else {
                    Ext.fly(destSummaryRow).syncContent(sourceSummaryRow);
                }
            }
        }
    },
 
    init: function(grid) {
        var me = this,
            view = me.view,
            dock = me.dock;
 
        me.callParent(arguments);
 
        if (dock) {
            grid.addBodyCls(me.panelBodyCls + dock);
            grid.headerCt.on({
                add: me.onStoreUpdate,
                remove: me.onStoreUpdate,
                scope: me
            });
            grid.on({
                beforerender: function() {
                    var tableCls = [me.summaryTableCls];
                    if (view.columnLines) {
                        tableCls[tableCls.length] = view.ownerCt.colLinesCls;
                    }
                    me.summaryBar = grid.addDocked({
                        childEls: ['innerCt', 'item'],
                        renderTpl: [
                            '<div id="{id}-innerCt" data-ref="innerCt" role="presentation">',
                                '<table id="{id}-item" data-ref="item" cellPadding="0" cellSpacing="0" class="' + tableCls.join(' ') + '">',
                                    '<tr class="' + me.summaryRowCls + '"></tr>',
                                '</table>',
                            '</div>'
                        ],
                        scrollable: {
                            x: false,
                            y: false
                        },
                        hidden: !me.showSummaryRow,
                        itemId: 'summaryBar',
                        cls: [ me.dockedSummaryCls, me.dockedSummaryCls + '-' + dock ],
                        xtype: 'component',
                        dock: dock,
                        weight: 10000000
                    })[0];
                },
                afterrender: function() {
                    grid.getView().getScrollable().addPartner(me.summaryBar.getScrollable(), 'x');
                    me.onStoreUpdate();
                },
                single: true
            });
        } else {
            if (grid.bufferedRenderer) {
                me.wrapsItem = true;
                view.addRowTpl(me.fullSummaryTpl).summaryFeature = me;
                view.on('refresh', me.onViewRefresh, me);
            } else {
                me.wrapsItem = false;
                me.view.addFooterFn(me.renderSummaryRow);
            }
        }
 
        grid.headerCt.on({
            afterlayout: me.afterHeaderCtLayout,
            scope: me
        })
 
        grid.ownerGrid.on({
            beforereconfigure: me.onBeforeReconfigure,
            columnmove: me.onStoreUpdate,
            scope: me
        });
        me.bindStore(grid, grid.getStore());
    },
 
    onBeforeReconfigure: function(grid, store) {
        this.summaryRecord = null;
        
        if (store) {
            this.bindStore(grid, store);
        }
    },
 
    bindStore: function(grid, store) {
        var me = this;
 
        Ext.destroy(me.storeListeners);
        me.storeListeners = store.on({
            scope: me,
            destroyable: true,
            update: me.onStoreUpdate,
            datachanged: me.onStoreUpdate
        });
        
        me.callParent([grid, store]);
    },
 
    renderSummaryRow: function(values, out, parent) {
        var view = values.view,
            me = view.findFeature('summary'),
            record, rows;
 
        // If we get to here we won't be buffered 
        if (!me.disabled && me.showSummaryRow && !view.addingRows && !view.updatingRows) {
            record = me.summaryRecord;
 
            out.push('<table cellpadding="0" cellspacing="0" class="' +  me.summaryItemCls + '" style="table-layout: fixed; width: 100%;">');
            me.outputSummaryRecord((record && record.isModel) ? record : me.createSummaryRecord(view), values, out, parent);
            out.push('</table>');
        }
    },
 
    toggleSummaryRow: function(visible, fromLockingPartner) {
        var me = this,
            bar = me.summaryBar;
 
        me.callParent([visible, fromLockingPartner]);
        if (bar) {
            bar.setVisible(me.showSummaryRow);
            me.onViewScroll();
        }
    },
 
    getSummaryBar: function() {
        return this.summaryBar;
    },
    
    getSummaryRowPlaceholder: function(view) {
        var placeholderCls = this.summaryItemCls,
            nodeContainer, row;
        
        nodeContainer = Ext.fly(view.getNodeContainer());
        
        if (!nodeContainer) {
            return null;
        }
        
        row = nodeContainer.down('.' + placeholderCls, true);
        
        if (!row) {
            row = nodeContainer.createChild({
                tag: 'table',
                cellpadding: 0,
                cellspacing: 0,
                cls: placeholderCls,
                style: 'table-layout: fixed; width: 100%',
                children: [{
                    tag: 'tbody' // Ensure tBodies property is present on the row 
                }]
            }, false, true);
        }
        
        return row;
    },
 
    vetoEvent: function(record, row, rowIndex, e) {
        return !e.getTarget(this.summaryRowSelector);
    },
 
    onViewScroll: function() {
        this.summaryBar.setScrollX(this.view.getScrollX());
    },
 
    onViewRefresh: function(view) {
        var me = this,
            record, row;
 
        // Only add this listener if in buffered mode, if there are no rows then 
        // we won't have anything rendered, so we need to push the row in here 
        if (!me.disabled && me.showSummaryRow && !view.all.getCount()) {
            record = me.createSummaryRecord(view);
            row = me.getSummaryRowPlaceholder(view);
            row.tBodies[0].appendChild(view.createRowElement(record, -1).querySelector(me.summaryRowSelector));
        }
    },
 
    createSummaryRecord: function (view) {
        var me = this,
            columns = view.headerCt.getGridColumns(),
            remoteRoot = me.remoteRoot,
            summaryRecord = me.summaryRecord || (me.summaryRecord = new Ext.data.Model({
                id: view.id + '-summary-record'
            })),
            colCount = columns.length, i, column,
            dataIndex, summaryValue, modelData;
 
        // Set the summary field values 
        summaryRecord.beginEdit();
 
        if (remoteRoot) {
            summaryValue = me.generateSummaryData();
            
            if (summaryValue) {
                summaryRecord.set(summaryValue);
            }
        }
        else {
            for (i = 0; i < colCount; i++) {
                column = columns[i];
 
                // In summary records, if there's no dataIndex, then the value in regular rows must come from a renderer. 
                // We set the data value in using the column ID. 
                dataIndex = column.dataIndex || column.getItemId();
 
                // We need to capture this value because it could get overwritten when setting on the model if there 
                // is a convert() method on the model. 
                summaryValue = me.getSummary(view.store, column.summaryType, dataIndex);
                summaryRecord.set(dataIndex, summaryValue);
 
                // Capture the columnId:value for the summaryRenderer in the summaryData object. 
                me.setSummaryData(summaryRecord, column.getItemId(), summaryValue);
            }
        }
 
        summaryRecord.endEdit(true);
        // It's not dirty 
        summaryRecord.commit(true);
        summaryRecord.isSummary = true;
 
        return summaryRecord;
    },
 
    onStoreUpdate: function() {
        var me = this,
            view = me.view,
            selector = me.summaryRowSelector,
            dock = me.dock,
            record, newRowDom, oldRowDom, p;
 
        if (!view.rendered) {
            return;
        }
 
        record = me.createSummaryRecord(view);
        newRowDom = Ext.fly(view.createRowElement(record, -1)).down(selector, true);
 
        if (!newRowDom) {
            return;
        }
 
        // Summary row is inside the docked summaryBar Component 
        if (dock) {
            p = me.summaryBar.item.dom.firstChild;
            oldRowDom = p.firstChild;
            
            p.insertBefore(newRowDom, oldRowDom);
            p.removeChild(oldRowDom);
        }
        // Summary row is a regular row in a THEAD inside the View. 
        // Downlinked through the summary record's ID 
        else {
            oldRowDom = view.el.down(selector, true);
            p = oldRowDom && oldRowDom.parentNode;
            
            if (p) {
                p.removeChild(oldRowDom);
            }
            
            // We're always inserting the new summary row into the last rendered row, 
            // unless no rows exist. In that case we will be appending to the special 
            // placeholder in the node container. 
            p = view.getRow(view.all.last());
            
            if (p) {
                p = p.parentElement;
            }
            // View might not have nodeContainer yet. 
            else {
                p = me.getSummaryRowPlaceholder(view);
                p = p && p.tBodies && p.tBodies[0];
            }
            
            if (p) {
                p.appendChild(newRowDom);
            }
        }
    },
 
    // Synchronize column widths in the docked summary Component or the inline summary row 
    // depending on whether we are docked or not. 
    afterHeaderCtLayout: function(headerCt) {
        var me = this,
            view = me.view,
            columns = view.getVisibleColumnManager().getColumns(),
            column,
            len = columns.length, i,
            summaryEl,
            el, width, innerCt;
 
        if (me.showSummaryRow&& view.refreshCounter) {
            if (me.dock) {
                summaryEl = me.summaryBar.el;
                width = headerCt.getTableWidth();
                innerCt = me.summaryBar.innerCt;
 
                // Stretch the innerCt of the summary bar upon headerCt layout 
                me.summaryBar.item.setWidth(width);
 
                // headerCt's tooNarrow flag is set by its layout if the columns overflow. 
                // Must not measure+set in after layout phase, this is a write phase. 
                if (headerCt.tooNarrow) {
                    width += Ext.getScrollbarSize().width;
                }
                innerCt.setWidth(width);
            } else {
                summaryEl = Ext.fly(Ext.fly(view.getNodeContainer()).down('.' + me.summaryItemCls, true));
            }
 
            // If the layout was in response to a clearView, there'll be no summary element 
            if (summaryEl) {
                for (i = 0; i < len; i++) {
                    column = columns[i];
                    el = summaryEl.down(view.getCellSelector(column), true);
                    if (el) {
                        Ext.fly(el).setWidth(column.width || (column.lastBox ? column.lastBox.width : 100));
                    }
                }
            }
        }
    },
 
    destroy: function() {
        var me = this;
        me.summaryRecord = me.storeListeners = Ext.destroy(me.storeListeners);
        me.callParent();
    }
});