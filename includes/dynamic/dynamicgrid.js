//*************************************************************************************************************//
//			DYNAMIC GRID SUBGRID

var scaledim = 'medium'; //large medium little
Ext.define('dynamicgrid', {
    extend: 'Ext.grid.GridPanel',
    mixins: {
        field: 'Ext.form.field.Base'
    },
    alias: 'widget.dynamicgrid',
    submitFormat: 't',
    submitValue: true,
    massUpdate: true,
    title: '',
    text: '',
    keyValue: '',
    selectedid: '',
    remoteSort: true,
    multiColumnSort: false,
    remoteSearch: true,
    localdatawhere: '',
	localEnumerateStart: '',
	localEnumerateRec: '',
    //	cls: 'custom-grid',
    emptyText: 'No Records',
    loadMask: true,
    stateful: true,
    /*COLUMN DEFINITION*/
    columnWidthSplit: '',
    columnDefaultVisible: false,
    columnAction: '',
    rowHeight: '',
	rowWrap: false,
	
	toolbarVisible: true,

    /*ACTIVABLE ACTIONS*/
    allowfilter: true,
    allowfilterbar: false,
    allowadd: true,
    allowedit: true,
    alloweditcell: false,
    alloweditrow: false,
    allowdragdrop: false,
    allowexport: true,
    allowimport: true,
    allowsearch: true,
	
    /*ACTIVABLE PROCESS*/
    CheckColumn: false, //layouteditorid, ActionColumn or ActionTrueFalseColumn requested
    CheckColumnCleanUp: true, 
    selectionValueField: '',
    selectionDataSourceField: '',
    ActionColumn: false, //procid requested
    ActionTrueFalseColumn: false, //procid requested
    NoteColumn: false, //layouteditorid requested
    ButtonColumn: false,

    /* VIEW COLUMN*/
    DectailColumn: false, //layouteditorid requested
    DectailIcon: 'fa-expand',
    DeleteColumn: false,
    NumberColumn: false,
    rowexpander: false,
    subgrid: false,
    groupField: true,
    groupSummary: false,
    groupSummaryAdv :false,
	groupStartCollapsed: true,
    summary: false,
    summaryField: false,
	enumerateField: false,
	
	goToLastRow: false,
	
    stripeRows: false,
		
    /* DATA */
    valueField: null,
    displayField: null,
    keyField: 'ID',
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    datasourcefield: null,
    orderField: '', //manage for enumerate
	filterwhere: '',
	filterwhereonstart: false,


    /* RECORD EDITING DEFINITION */
    layouteditorid: '',
    layouteditorWindowMode: 'acDialog',
	ParentCmbSearch: '',
	
    /* DATA SUB*/
    subgrid: false,
    subgridvalueField: null,
    subgriddisplayField: null,
    subgriddkeyField: 'ID',
	subgriddatasource: null,
	subgriddatasourcetype: null,
	subgriddatasourcefield: null,
	subgridorderField: '', //manage for enumerate
    subgridfilterwhere: '',
    subgridfilterwhereonstart: false,
	
    subgridlayouteditorid: null,
    
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

    //PRIVATE
    isSubGrid: false,  
    chkcol: null,

    bbar: {
        xtype: 'toolbar',
        itemId: 'gridtoolbar',
		listeners: {
           afterrender: function() {
				var me = this.up('dynamicgrid');
				if (me.toolbarVisible == false) {
					this.hide();
				}
            }
       },
        items: [
            '-', {
                itemId: 'RefreshBtn',
                pressed: false,
                enableToggle: false,
                tooltip: 'Aggiorna',
                iconCls: 'x-fa fa-refresh',
                cls: 'x-btn-text-icon',
                handler: function(btn, evt) {
                    var me = btn.up('dynamicgrid');

					Custom.setCurrentPanelForm(me);
                    if (me.localdatawhere != '') {
                        me.getStore().reload({
                            params: {
                                datawhere: me.localdatawhere
                            }
                        });
                    } else {
                        me.getStore().reload();
                    }

                    if (me.CheckColumn && me.selectionValueField){
                        var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
                        var activeValue = DS_Form00.data.items[0].data[me.selectionDataSourceField];
                        var activeField = me.selectionValueField
                        me.chkcol.fireEvent('selectexisted',me, me.chkcol, activeField ,activeValue);
                    }

                }
            },
            '-', {
                itemId: 'SaveBtn',
                pressed: false,
                enableToggle: false,
                tooltip: 'Salva',
                iconCls: 'x-fa fa-floppy-o',
                cls: 'x-btn-text-icon',
                hidden: true,
                handler: function (btn, evt) {
                    var me = btn.up('dynamicgrid');

					Custom.setCurrentPanelForm(me);
                    me.SaveMassUpdate();
                }
            },
            '-', {
                itemId: 'AddBtn',
                pressed: false,
                enableToggle: false,
                tooltip: 'Nuovo',
                iconCls: 'x-fa fa-asterisk',
                cls: 'x-btn-text-icon',
                hidden: true,
                handler: function (btn, evt) {
                    var me = btn.up('dynamicgrid');
//var ValRiga = me.store.data.items[0].data[NameChiave];
                    if (me.isSubGrid){
                        var meSubGrid = btn.up('dynamicgrid');
                        var meGrid = meSubGrid.up('dynamicgrid');
                        Custom.setCurrentPanelForm(meGrid);
                        var NameChiave = meGrid.subgridvalueField

                        if ((meGrid.allowadd) && (meGrid.subgridlayouteditorid != 0) && (meGrid.subgridlayouteditorid !== undefined)) {
                            Custom.LayoutRender(meGrid.subgridlayouteditorid, 'form', meSubGrid.store.lastOptions.params.datawhere + "", 'add', meGrid.layouteditorWindowMode, '', meSubGrid.id);
                        }
                    }
                    else{
                        Custom.setCurrentPanelForm(me);
                        var NameChiave = me.valueField
                        if ((me.allowadd) && (me.layouteditorid != 0) && (me.layouteditorid !== undefined)) {
                            CurrentLayoutDataSourceFieldValue = "";
                            var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
                            ValRiga = DS_Form00.data.items[0].data[me.datasourcefield];
                            console.log('dynamicgrid add' + NameChiave + '=' + ValRiga);
                            if ((CurrentPanelRaw.ViewType == 'form') && (Custom.IsNullOrEmptyOrZeroString(ValRiga))) {
                                Custom.ExecuteProcRequest('SAVE');
                                Custom.FormDataSave();
                            } 
                            else if (me.allowadd) {
                                if ((CurrentPanelRaw.DataWhere != '') && (CurrentPanelRaw.ViewType == 'grid')) {
                                    Custom.LayoutRender(me.layouteditorid, 'form', CurrentPanelRaw.DataWhere + "", 'add', me.layouteditorWindowMode, '', me.id);
                                } else {
                                    Custom.LayoutRender(me.layouteditorid, 'form', NameChiave + " = " + ValRiga + "", 'add', me.layouteditorWindowMode, '', me.id);
                                }
                            }    
                            //Custom.LayoutRender(me.layouteditorid,'form', NameChiave + " = " + ValRiga + "", 'add');
                            //var DesignPanel = Ext.getCmp('DesignPanel');
                            //var form = DesignPanel.getForm();
                            //var FieldID = form.findField(NameChiave);
                            //FieldID.setValue(CurrentLayoutDataSourceFieldValue);
                            //Custom.FormDataNew();
                        }
                    }
                }
            },
            '-', {
                itemId: 'DplBtn',
                pressed: false,
                enableToggle: false,
                tooltip: 'Duplica',
                iconCls: 'x-fa fa-clone toolBarIcon',
                cls: 'x-btn-text-icon',
                hidden: true,
                handler: function (btn, evt) {
                    var me = btn.up('dynamicgrid');

					Custom.setCurrentPanelForm(me);
                    var NameChiave = me.keyField;
                    var ValRiga = me.keyValue;
                    if ((me.layouteditorid != 0) && (me.layouteditorid !== undefined)) {
                        //CurrentLayoutDataSourceFieldValue = ValRiga;
                        //var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
                        //ValRiga = DS_Form00.data.items[0].data[me.datasourcefield];
                        console.log('dynamicgrid clone' + NameChiave + '=' + ValRiga);
                        //Custom.LayoutRender(me.layouteditorid,'form', NameChiave + " = " + ValRiga + "", 'clone');
                        //var DesignPanel = Ext.getCmp('DesignPanel');
                        //Custom.FormDataClone();

                        Custom.LayoutRender(me.layouteditorid, 'form', NameChiave + " = " + ValRiga + "", 'clone', me.layouteditorWindowMode, '', me.id);
                    }
                }
            },
            '-', {
                itemId: 'ExcelBtn',
                pressed: false,
                enableToggle: false,
                tooltip: 'EsportaXLS',
                hidden: true,
                iconCls: 'x-fa fa-file-excel-o',
                cls: 'x-btn-text-icon',
                handler: function (btn, evt) {
                    var me = btn.up('dynamicgrid');

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
                itemId: 'PDFBtn',
                pressed: false,
                enableToggle: false,
                tooltip: 'EsportaPDF',
                hidden: false,
                iconCls: 'x-fa fa-file-pdf-o',
                cls: 'x-btn-text-icon',
                handler: function (btn, evt) {
                    var me = btn.up('dynamicgrid');

					Custom.setCurrentPanelForm(me);
                    //promize load all
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
                    
					//me.export();
					Ext.ux.grid.Printer.printAutomatically = false;
                    Ext.ux.grid.Printer.closeAutomaticallyAfterPrint = false;
                    Ext.ux.grid.Printer.print(me);
					
					/*
					dynamicgridprinter.Printer.print(me)*/
                }
            },
            '-', {
                itemId: 'SearchField',
                xtype: 'textfield',
                width: 150,
                //emptyText: 'Search...',
                hidden: true,
                enableKeyEvents: true,
                listeners: {
                    specialkey: function (field, event) {
                        var me = this;
                        if (event.getKey() === event.ENTER) {
							Custom.setCurrentPanelForm(me);
                            field.up('dynamicgrid').store.clearFilter();
                            //override remote
                            me.remoteSearch = true;
                            if (me.getValue() != '') {
                                if (me.remoteSearch == true) {
                                    console.log('remote filtering');
                                    var remoteFilter = new Ext.util.Filter({
                                        id: 'innerSearch',
                                        property: 'innerSearch',
                                        type: 'strings',
                                        operator: 'like',
                                        value: me.getValue()
                                    });
                                    field.up('dynamicgrid').store.addFilter(remoteFilter);
                                    //appowhere = 'innerSearch' + '=' + me.getValue();
                                    //field.up('dynamictreegrid').store.load({ params: { datawhere: appowhere } });
                                } else {
                                    console.log('local filtering');
                                    var regex = new RegExp(me.getValue(), 'i');
                                    if (me.getValue() != '') {
                                        regex = new RegExp(me.getValue(), 'i');
                                        field.up('dynamicgrid').store.filter(new Ext.util.Filter({
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
                enableToggle: false,
                tooltip: 'Vai Avanti',
                iconCls: 'x-fa fa-long-arrow-right',
                cls: 'x-btn-text-icon',
                hidden: true,
                handler: function (btn, evt) {
                    var me = btn.up('dynamicgrid');

					Custom.setCurrentPanelForm(me);
                    Ext.getBody().mask("Wait, executing for every selected row ..");
                    Ext.Function.defer(function () {
                        //cancella tabella appoggio action complessiva
                        if (me.CheckColumnCleanUp) {
							Custom.ExecuteProc('appotruncate', null, null);
						}
						
                        //colleziona record selezionati ed esegue action abbinata
                        me.PostMassAction(me.ActionColumn, '');
						
                        //esegue action complessiva
                        Custom.ExecuteProc(me.CheckColumn, null, null);
						
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
                enableToggle: false,
                tooltip: 'Accetta Tutti',
                iconCls: 'x-fa fa-thumbs-up',
                cls: 'x-btn-text-icon',
                hidden: true,
                handler: function (btn, evt) {
                    var me = btn.up('dynamicgrid');

					Custom.setCurrentPanelForm(me);
                    Ext.getBody().mask("Wait, executing for every selected row ..");
                    Ext.Function.defer(function () {
                        //colleziona record selezionati ed esegue action abbinata
                        me.PostMassAction(me.ActionTrueFalseColumn, 'true');
                        //esegue action complessiva
                        Custom.ExecuteProc(me.CheckColumn, null, null);
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
                enableToggle: false,
                tooltip: 'Rifiuta Tutti',
                iconCls: 'x-fa fa-thumbs-o-down',
                cls: 'x-btn-text-icon',
                hidden: true,
                handler: function (btn, evt) {
                    var me = btn.up('dynamicgrid');

					Custom.setCurrentPanelForm(me);
                    Ext.getBody().mask("Wait, executing for every selected row ..");
                    Ext.Function.defer(function () {
                        //colleziona record selezionati ed esegue action abbinata
                        me.PostMassAction(me.ActionTrueFalseColumn, 'false');
                        //esegue action complessiva
                        Custom.ExecuteProc(me.CheckColumn, null, null);
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
                    var me = btn.up('dynamicgrid');

					Custom.setCurrentPanelForm(me);
                    Ext.getBody().mask("Wait, executing for every selected row ..");
					Ext.MessageBox.show({
						title: 'Cancella ' + CurrentWindow.title,
						msg: 'Confermi la cancellazione?',
						buttons: Ext.MessageBox.OKCANCEL,
						icon: Ext.MessageBox.WARNING,
						fn: function (btn) {
							if (btn == 'ok') {
								Ext.Function.defer(function () {
									//colleziona record selezionati ed esegue action abbinata
									
									var me = this.up('dynamicgrid');
									Ext.getBody().mask("Wait, executing for every selected row ..");
									Ext.Function.defer(function () {
										//colleziona record selezionati ed esegue action abbinata
										me.PostMassAction('DELETE', 'autocommit=false');
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
                    var me = btn.up('dynamicgrid');

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
        doRefresh: function () {
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
        console.log('setvalue text in grid=' + value);
        me.text = value;
        me.keyValue = '';
        me.textFilter = value;
        if (me.valueField != '') {
            me.localdatawhere = '';
            if (value == undefined) {
				if ((me.datasourcefield != '') && (me.datasourcefield != null)) {
					me.localdatawhere = "1=2";
					me.store.proxy.extraParams.datawhere = me.localdatawhere;
					me.store.load();
				}
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
        //var data = {};
        //data[me.getName()] = '' + me.text;
        //return data;
        return '' + me.text;
    },

    initComponent: function () {
        var me = this;
//config.plugins.push('gridExporter');
        var gRow = -1; // define a variable gRow.
		
        var config = {
            plugins: [],
            features: [],
            columns: [],
            multiSelect: true
        };
        var viewconfig = {
            plugins: [],
            features: []
        };
        if (CurrentDeviceType != 'desktop') {
            me.addCls('custom-grid');
        }
        
		if (me.allowfilter) {
            if (me.allowfilterbar) {
                 config.plugins.push('gridfilterbar');
            }else{
                 config.plugins.push('gridfilters')
            }
         }
		
		if (me.allowdragdrop) {
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
		
		//plulgins groupField
        if (me.groupField && me.subgrid == false) {
            var AppoGroup = "grouping";
            if (me.groupSummary) {
                AppoGroup = "groupingsummary";
            }
            config.features.push({
                ftype: AppoGroup,
                groupHeaderTpl: ['{columnName}: {name} ({rows.length} Item)'],
                hideGroupedHeader: true,
                startCollapsed: me.groupStartCollapsed
            });

            viewconfig.features.push({
                ftype: AppoGroup,
                groupHeaderTpl: ['{columnName}: {name} ({rows.length} Item)'],
                hideGroupedHeader: true,
                startCollapsed: me.groupStartCollapsed
            });
        }

        if (me.summary) {
            config.features.push({
                ftype: 'summary'
            });

            viewconfig.features.push({
                ftype: 'summary'
            });
        }

         if (me.alloweditcell === true) {
			config.plugins.push({
                ptype: 'cellediting',
				clicksToEdit: 1
			});
		}
        else if (me.alloweditrow === true) {
			config.plugins.push({
				pluginId: 'MyRowEditingPlugin',
				ptype: 'rowediting',
				clicksToEdit: 1,
				listeners: {
					cancelEdit: function (rowEditing, context) {
						// your stuff will go here
					},
					edit: function (editor, e) {
						var me = editor.grid;

						Custom.setCurrentPanelForm(me);
						/************************************************/
						
						var data = {};
						//data.ID = e.newValues['ID'];
						data[editor.grid.keyField] = e.newValues[editor.grid.keyField];
						data['datasourcefield'] = editor.grid.keyField;

						var selectedRowDataString = '';
						var selectedRowIndexes = [];
						var selectedRowData = [];
						
						for (var key in e.newValues) {
							var value = e.newValues[key];
							if (toType(value) == 'date') {
								value = Custom.yyyymmdd(value);
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
									Custom.ExecuteProc(processId, me.layouteditorid, false);
								} else {
									Custom.ExecuteProc(processId, null, false);
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
			
        if (me.rowexpander === true) {
            me.autoHeight = true
            config.plugins.push({
                ptype: 'rowexpander',
                rowBodyTpl: new Ext.XTemplate(
                    '<p><b>DescName:</b> {DESCNAME}</p>',
                    '<p><b>Descrizione:</b> {DESCRIZIONE}</p>'
                )
            });
        }

        /* subgrid */
        if (me.subgrid === true) {
            config.plugins.push({
                ptype: 'rowwidget',
                widget: {
                    xtype: 'dynamicgrid',
                    name: me.name + "_SubGrid",
                    datasource: me.subgriddatasource,
                    datasourcetype: me.subgriddatasourcetype,
					datasourcefield: me.datasourcefield,
                    layouteditorid: me.subgridlayouteditorid,
                    autoWidth: true,
                    isSubGrid: true,
                    autoHeight: true,
                },
                onWidgetAttach: function (plugin, widget, record) {
                    console.log(record.get(me.subgriddatasourcefield));
                    var SubGrid = widget;
                    var JsonObj = widget.up('dynamicgrid');
                    var SubGridStore = Ext.create('Ext.data.Store', {
                        storeId: "DS_" + CurrentPanel.name + "_" + JsonObj.name + "_SubGrid" + record.get(me.subgriddatasourcefield),
                        autoLoad: false,
                        remoteSort: true,
                        remoteFilter: true,
                        //preserveNotNull: preserveNotNull,
                        filterParam: 'query',
                        encodeFilters: function (filters) {
                            return filters[0].value;
                        },
                        //pageSize: JsonObj.rowlimit,
                        async: false,
                        columns: [],
                        //DAFARE
                        //groupField: (((JsonObj.groupField != true) && (JsonObj.groupField != false) && (JsonObj.groupField != '')) ? JsonObj.groupField : null),
                        proxy: {
                            type: 'ajax',
                            url: 'includes/io/DataRead.php',
                            filterParam: 'query',
                            params: {
                                start: JsonObj.RowId,
                            },
                            extraParams: {
                                objname: JsonObj.name,
                                subgrid: true,
                                combofilter: JsonObj.combofilter,
                                datawhere: JsonObj.datawhere,
                                //valuefield: JsonObj.valueField,
                                limit: JsonObj.rowlimit,
                                layouteditorid: JsonObj.subgridlayouteditorid,
                                layoutid: CurrentPanelRaw.id,
                                datamode: JsonObj.datamode,
                            },
                            reader: {
                                keepRawData: true,
                                type: 'json',
                                rootProperty: 'data',
                                totalProperty: 'total',
                                successProperty: 'success',
                                //failureProperty: 'failure',
                                messageProperty: 'message',
                                //idProperty: 'node',
                            },
                            success: { /* success functions */ },
                            failure: { /* failure functions */ },
                            listeners: {
                                exception: function (proxy, response, operation) {
                                    Ext.MessageBox.show({
                                        title: 'Error ObjLoadData REMOTE EXCEPTION',
                                        msg: operation.getError(),
                                        icon: Ext.MessageBox.ERROR,
                                        maxWidth: 600,
                                        closable: false,
                                        buttons: Ext.Msg.OK
                                    });
                                },
                            }
                        },
                        listeners: {
                            load: function (store, records, successful, operation, eOpts) {
                                //raw data per la gestione nelle column
                                if (this.proxy.reader.rawData != undefined) {
                                    this.setFields(this.proxy.reader.rawData.fields);
                                    this.fields = this.proxy.reader.rawData.fields;
                                }
        
        
                                //se ho letto tutti i dati dalla sorgente filtri e ordinamenti li faccio in locale
                                if ((this.totalCount < this.proxy.extraParams.limit) || (this.proxy.extraParams.limit == -1)) {
                                    //DAFARE se lo attivo sbaglia ordinamento (non lo fa)
                                    //this.remoteSort = false;
                                    //DAFARE se lo attivo sbaglia la ricerca (non la fa)
                                    //this.remoteFilter = false;
                                } else {
                                    this.remoteSort = true;
                                    this.remoteFilter = true;
                                }    
                                
                                console.log('LoadedDATAin Store:' + this.storeId);
                            },
                            exception: function (proxy, response, operation) {
                                Ext.MessageBox.show({
                                    title: "Error ObjLoadData Server Data Error...",
                                    msg: operation.getError(),
                                    icon: Ext.MessageBox.ERROR,
                                    maxWidth: 600,
                                    closable: false,
                                    buttons: Ext.Msg.OK
                                });
                            },
                            metachange: function (store, meta) {
                                store.setFields(store.proxy.reader.rawData.fields);
                            }
                        }
                    });
                    SubGrid.store = "DS_" + CurrentPanel.name + "_" + JsonObj.name + "_SubGrid" + record.get(me.subgriddatasourcefield);
                    Ext.apply(SubGrid, { store : SubGridStore });
                    SubGrid.getView().bindStore(SubGridStore);
                    SubGrid.store.on('load', SubGrid.storeLoad, SubGrid);
                    SubGridStore.load({
                        params: {
                            datawhere:me.subgridvalueField + "="+ record.get(me.subgriddatasourcefield) 
                    
                        }
                    });
                    SubGrid.getView().refresh();
                }
                    
            });
            Ext.apply(me.viewConfig,null);
        }
		else{
            viewconfig['listeners'] = {
                drop: function (node, data, overModel, dropPosition, eOpts) {
                    var me = this.grid;
                    if (me.ownerGrid.enumerateField) {
    
                        //.processOnButton(grid, rowIndex, record, '', 'autocommit=false');
                        //me.getSelectionModel().getCurrentPosition().rowIdx
                        me.processOnButton(this, -1, me.localEnumerateRec, 'ENUMERATE', '&ENUMERATEWHEREFIELD=' + me.valueField +
                            '&ENUMERATEFIELD=' + me.enumerateField +
                            '&ENUMERATEFROMROW=' + me.localEnumerateStart[me.keyField] +
                            '&ENUMERATETOROW=' + overModel.data[me.keyField] +
                            '&autocommit=false');
                    }
                },
                beforedrop: function (node, data, dropRec, dropPosition) {
                    var me = this.up('dynamicgrid');
                    Custom.setCurrentPanelForm(me);
                    var selectedRecord = this.grid.getSelectionModel().getSelection()[0]; //-1
    
                    if (this.grid.ownerGrid.enumerateField) {
                        me.localEnumerateStart = selectedRecord.data;
                        //me.localEnumerateStart = selectedRecord.data[me.keyField];
                        me.localEnumerateRec = dropRec;
                    } else {
                        Ext.Array.each(data.records, function (rec) {
                            rec.setDirty();
                        });
                    }
                },
                afterrender: {
                    delay: 99,
                    fn: function () {
                        this.ownerGrid.refreshRank();
                    }
                },
                // Column Autosize to its data
                refresh: function (dataview) {
                    Ext.each(dataview.panel.columns, function (column) {
                        if (column.autoSizeColumn === true) {
                            column.autoSize();
                            console.log('autoSizeColumn Setting');
                        }
                    });
                }
            };
			Ext.apply(me.viewConfig, viewconfig);
		}

        Ext.apply(me.initialConfig, config);
        Ext.apply(me.viewConfig, viewconfig);
        Ext.apply(me, config);
        Ext.apply(me.keepRawData = true);

        me.callParent(arguments);
    },

    listeners: {
        select: function (selModel, record, index, options) {
			var startTime = performance.now()
            console.log('dynamicgrid event ' + 'select');
			
            var me = this;
			var RowSelectedKey = '';
			var RowSelectedText = '';
			selModel.selected.items.forEach(function (row) {
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
			
            if (me.name == 'FormInGrid') {
                console.log('dynamicgrid setvalue ' + me.keyValue);
                CurrentLayoutDataSourceFieldValue = me.keyValue;
                me.text = me.keyValue;
            }
            CurrentRowId = index;
            console.log('dynamicgrid keyField=' + me.keyField + ':' + me.keyValue + ' valueField=' + me.valueField + ':' + me.text + ' CurrentRowId: ' + CurrentRowId);
						
			//summarize selectedrows
			if (me.summaryField) {
				var Summarized = 0;
				for (var i = 0; i < me.getSelectionModel().getSelection().length; i++) {
					Summarized = Summarized + me.getSelectionModel().getSelection()[i].data[me.summaryField];
				}
				//label record sum
				me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Rec ' + me.store.totalCount + 
																				' Sel ' + me.getSelectionModel().getSelection().length + 
																				' Sum ' + Ext.util.Format.number(Summarized, '0,000.00')+ 
																				' Avg ' + Ext.util.Format.number(Summarized / me.getSelectionModel().getSelection().length, '0,000.00'));
			}else{
				//label record count
				me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Rec ' + me.store.totalCount + 
                                                                                ' Sel ' + me.getSelectionModel().getSelection().length + 
                                                                                ' Sum ' + Ext.util.Format.number(Summarized, '0,000.00')+ 
                                                                                ' Avg ' + Ext.util.Format.number(Summarized / me.getSelectionModel().getSelection().length, '0,000.00'));
			}
			var endTime = performance.now()
			console.log(endTime - startTime)
            //SAVE RECORD AUTOPOSTBACK
            if (me.autopostback == true) {
                var selectedRowDataString = '';
                var selectedRowIndexes = [];
                var selectedRowData = [];
                Ext.iterate(record.data, function (key, value) {
                    selectedRowData[key] = value;
                    valueappo = value;
                    if (toType(value) == 'date') {
						value = Custom.yyyymmdd(value);
                    }
                    selectedRowDataString += key + '=' + encodeURIComponent(value) + '&';
                });
                //selectedRowDataString += 'registrationid' + '=' + me.CurrentRegistrationId + '&';
                selectedRowDataString += 'layoutid' + '=' + me.layouteditorid + '&';
                //selectedRowDataString += 'userid' + '=' + me.CurrentUser.UserId + '&';
                selectedRowDataString += 'autocommit' + '=false&';
                Ext.Ajax.request({
                    params: selectedRowDataString,
                    url: 'includes/io/DataWrite.php',
                    method: 'POST',
                    async: false,
                    waitTitle: 'Connecting',
                    waitMsg: 'Sending data...',
                    /*
					success: function(resp) {
						//grid.getStore().commitChanges();
						//var appo = Ext.util.JSON.decode(resp.responseText)
						//Custom.ExecuteProc(this.ActionColumn,null,null);
					},
					*/
                    failure: function () {
                        Ext.Msg.alert('error', 'Not Ok');
                    }
                });
            }
        },
        selectionchange(selModel, selectedRecords, options) {
			
            var me = this;
			//summarize selectedrows
			if (me.summaryField) {
				var Summarized = 0;
				for (var i = 0; i < me.getSelectionModel().getSelection().length; i++) {
					Summarized = Summarized + me.getSelectionModel().getSelection()[i].data[me.summaryField];
				}
				//label record sum
				me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Rec ' + me.store.totalCount + 
																				' Sel ' + me.getSelectionModel().getSelection().length + 
																				' Sum ' + Ext.util.Format.number(Summarized, '0,000.00')+ 
																				' Avg ' + Ext.util.Format.number(Summarized / me.getSelectionModel().getSelection().length, '0,000.00'));
			}
            else{
				//label record count
				me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Rec ' + me.store.totalCount + 
																				' Sel' + me.getSelectionModel().getSelection().length);
			}

		},
        itemdblclick: function (dv, record, item, index, e) {
            console.log('dynamicgrid event ' + 'itemdblclick');
			
					
            var NameChiave = dv.grid.keyField;
            var Riga = clone(record.data);
            var ValRiga = Riga[NameChiave];
            dv.grid.processOnButton(dv, index, record, '', 'autocommit=false');
			//seleziona in ricerca
            if (!Custom.IsNullOrEmptyOrZeroString(dv.grid.ParentCmbSearch))  {
				dv.grid.ParentCmbSearch.setValue(ValRiga);
				dv.grid.up('window').close();
			}
			else if ( ((dv.grid.allowedit) || (dv.grid.allowadd)) 
						&& (!Custom.IsNullOrEmptyOrZeroString(dv.grid.layouteditorid)) && (dv.grid.alloweditrow == false) ) {
				//apri in edit il record
                //NameChiave = CurrentLayoutDataSourceField;
                CurrentLayoutDataSourceFieldValue = ValRiga;
                console.log('dynamicgrid ' + NameChiave + '=' + ValRiga);
                appowhere = '';
				
				//edit data in row selected
				if (ValRiga){
					if (Custom.isNumber(ValRiga) == true) {
						appowhere = NameChiave + '=' + ValRiga;
					} else {
						appowhere = NameChiave + "='" + ValRiga + "'";
					}
					if (dv.grid.allowedit){
						Custom.LayoutRender(dv.grid.layouteditorid, 'form', appowhere, 'edit', dv.grid.layouteditorWindowMode,'',dv.grid.id );
					}
					else{
						Custom.LayoutRender(dv.grid.layouteditorid, 'form', appowhere, 'read', dv.grid.layouteditorWindowMode,'',dv.grid.id );
					}
				}
				//add empty row selected
				else if (dv.grid.allowadd){
                    var me = dv.up('dynamicgrid');
                    var NameChiave = me.valueField;
					Custom.setCurrentPanelForm(me);
					CurrentLayoutDataSourceFieldValue = "";
					var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
					ValRiga = DS_Form00.data.items[0].data[me.datasourcefield];
					console.log('dynamicgrid add' + NameChiave + '=' + ValRiga);
					if ((CurrentPanelRaw.ViewType == 'form') && (Custom.IsNullOrEmptyOrZeroString(ValRiga))) {
						Custom.ExecuteProcRequest('SAVE');
						Custom.FormDataSave();
					}
					else{
						if ((CurrentPanelRaw.DataWhere != '') && (CurrentPanelRaw.ViewType == 'grid')) {
							Custom.LayoutRender(me.layouteditorid, 'form', CurrentPanelRaw.DataWhere + ""   , 'add', me.layouteditorWindowMode,'',dv.grid.id );
						} 
						else {
							Custom.LayoutRender(me.layouteditorid, 'form', NameChiave + " = " + ValRiga + "", 'add', me.layouteditorWindowMode,'',dv.grid.id );
						}
					}
				}
				
            }
        },
        cellclick: function (iView, iCellEl, iColIdx, iStore, iRowEl, iRowIdx, iEvent) {
            console.log('dynamicgrid event ' + 'cellclick');
	    	gRow = iRowIdx;
            var zRec = iView.getRecord(iRowEl);
            var me = this;
            if ((me.ActionColumn) && (CurrentDeviceType != 'desktop')) {
                console.log('dynamicgrid eventResponsive=' + 'cellclick');
                var NameChiave = iView.grid.keyField;
                var Riga = clone(zRec.data);
                var ValRiga = Riga[NameChiave];
                iView.grid.processOnButton(iView, iRowIdx, zRec, iView.grid.ActionColumn, 'autocommit=false');
            }
			else if ((me.DectailColumn) && (CurrentDeviceType != 'desktop')) {
                console.log('dynamicgrid eventResponsive=' + 'cellclick');
                var NameChiave = iView.grid.keyField;
                var Riga = clone(zRec.data);
                var ValRiga = Riga[NameChiave];
                iView.grid.processOnButton(iView, iRowIdx, zRec, '', 'autocommit=false');

                //apri in edit il record
                if ( ((iView.grid.allowedit) || (iView.grid.allowadd)) 
					&& (!Custom.IsNullOrEmptyOrZeroString(iView.grid.layouteditorid)) ) {
					//edit data in row selected
					if (ValRiga){
						if (Custom.isNumber(ValRiga) == true) {
							appowhere = NameChiave + '=' + ValRiga;
						} else {
							appowhere = NameChiave + "='" + ValRiga + "'";
						}
						if (iView.grid.allowedit){
							Custom.LayoutRender(iView.grid.layouteditorid, 'form', appowhere, 'edit', iView.grid.layouteditorWindowMode,'',iView.grid.id);
						}else{
							Custom.LayoutRender(iView.grid.layouteditorid, 'form', appowhere, 'read', iView.grid.layouteditorWindowMode,'',iView.grid.id);
						}
					}
					//add empty row selected
					else if (iView.grid.allowadd){
						var me = iView.up('dynamicgrid');
						var NameChiave = me.valueField;
						Custom.setCurrentPanelForm(me);
						CurrentLayoutDataSourceFieldValue = "";
						var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
						ValRiga = DS_Form00.data.items[0].data[me.datasourcefield];
						console.log('dynamicgrid add' + NameChiave + '=' + ValRiga);
						if ((CurrentPanelRaw.ViewType == 'form') && (Custom.IsNullOrEmptyOrZeroString(ValRiga))) {
							Custom.ExecuteProcRequest('SAVE');
							Custom.FormDataSave();
						} else {
							if ((CurrentPanelRaw.DataWhere != '') && (CurrentPanelRaw.ViewType == 'grid')) {
								Custom.LayoutRender(me.layouteditorid, 'form', CurrentPanelRaw.DataWhere + "", 'add', me.layouteditorWindowMode, '', iView.grid.id);
							} else {
								Custom.LayoutRender(me.layouteditorid, 'form', NameChiave + " = " + ValRiga + "", 'add', me.layouteditorWindowMode, '', iView.grid.id);
							}
						}
					}
                } else if ((me.ActionColumn) && (CurrentDeviceType != 'desktop')) {
                    var SaveStringData = Custom.ArrayToString(zRec.data);
                    SaveStringData += '&objname' + '=' + iView.grid.name + '';
                    Custom.SaveStringData(SaveStringData, '');
                }
            } 
        },
        edit: function (editor, context) {
            var field = context.column.getEditor(context.record);
			//if (!field.containsInitialValue(field.getValue())) {
			//context.record.set(context.field, context.originalValue);
			if (this.massUpdate == false) {
				this.SaveRecordUpdate(field);
			}
			// }
			// reset the initial value since we're done editing
			//field.initialValue = null; 
        },
        /*
		load: function(store,records) {
		 // me.storeInitialCount = records.length;
		},
		*/
        viewready: function (grid) {
            /*	*/
            var map = new Ext.util.KeyMap({
                target: grid.getEl(),
                binding: [
                    /*
				{
					key: Ext.event.Event.DELETE,
					handler: function(keyCode, e) {
						Ext.MessageBox.show({
							title : 'Cancella ' + CurrentWindow.title,
							msg : 'Confermi la cancellazione?',
							buttons : Ext.MessageBox.OKCANCEL,
							icon : Ext.MessageBox.WARNING,
							fn : function (btn) {
								if (btn == 'ok') {
									var me = this.up('dynamicgrid');
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
									return
								} else {
									return;
								}
							}
						});
					}
				}
				,*/
                    {
                        key: "c",
                        ctrl: true,
                        handler: function (keyCode, e) {
                            var recs = grid.getSelectionModel().getSelection();
                            if (recs && recs.length != 0) {
                                var clipText = grid.getCsvDataFromRecs(grid, recs);
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
                                setTimeout(function () {
                                    document.body.removeChild(ta);
                                }, 100);
                            }
                        }
                    }, {
                        key: "d",
                        ctrl: true,
                        handler: function (keyCode, e) {
                            var recs = grid.getSelectionModel().getSelection();
                            if (recs && recs.length != 0) {
                                grid.duplicateDataFromRecs(grid, recs);
							}
                        }
                    }, {
                        key: "i",
                        ctrl: true,
                        handler: function (keyCode, e) {
							if (grid.allowimport) {
								setTimeout(async() => {
								  const ta = await navigator.clipboard.readText();
								  grid.getRecsFromCsv(grid, ta);
								}, 100);
							}
						}
					}
						/*, {
                        key: "v",
                        ctrl: true,
                        handler: function (keyCode, e) {
							setTimeout(async () => {
							  const ta = await navigator.clipboard.readText();
							  grid.getRecsFromCsv(grid, ta);
							}, 100);
						}
					}*/
                ]
            });
        },
        sortchange: function () {
			this.ownerGrid.refreshRank();
        }, 
		headermenucreate: function (grid, menu, headerCt, eOpts) { //Fired immediately after the column header menu is created.
			let columnItems = menu.down('[itemId=columnItem]'),
				menuItems = columnItems.menu.items.items;
			// Sorting by column's lowercase "text" in ascending order
			menuItems.sort(function (item1, item2) {
				let name1 = item1.text.toLowerCase(),
					name2 = item2.text.toLowerCase()
				if (name1 < name2) //sort string ascending
					return -1
				if (name1 > name2)
					return 1
				return 0 //default return value (no sorting)
			});
			// We need to update keys order as well otherwise it will have old 
			// menu item keys order and grouping by field starts creating a problem.
			columnItems.menu.items.keys = menuItems.map(function (item) {
				return item.id;
			});
		}, 
    },

    viewConfig: {
        listeners: {
			drop: function(node, data, overModel, dropPosition, eOpts){
				var me = this.grid;
				if (me.ownerGrid.enumerateField) {
					
					//.processOnButton(grid, rowIndex, record, '', 'autocommit=false');
					//me.getSelectionModel().getCurrentPosition().rowIdx
					me.processOnButton(this, 0, me.localEnumerateRec, 'ENUMERATE', 	'&ENUMERATEWHEREFIELD=' + me.valueField + 
																					'&ENUMERATEFIELD=' + me.enumerateField + 
																					'&ENUMERATEFROMROW=' + me.localEnumerateStart[me.keyField]  + 
																					'&ENUMERATETOROW=' + overModel.data[me.keyField] + 
																					'&autocommit=false');
				}
			},
			beforedrop: function(node, data, dropRec, dropPosition) {
				var me = this.up('dynamicgrid');
				Custom.setCurrentPanelForm(me);
				var selectedRecord = this.grid.getSelectionModel().getSelection()[0];
				
				if (this.grid.ownerGrid.enumerateField) {
					me.localEnumerateStart = selectedRecord.data;
					//me.localEnumerateStart = selectedRecord.data[me.keyField];
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
            refresh: function (dataview) {
                Ext.each(dataview.panel.columns, function (column) {
                    if (column.autoSizeColumn === true) {
                        column.autoSize();
                        console.log('autoSizeColumn Setting');
                    }
                });
            }
        }
        // commenting out the "plugins" object fixes the issue!
        //plugins: [
        //	{
        //		ptype: 'treeviewdragdrop',
        //		containerScroll: true
        //	}
        //]
    },

    /* store is loading then reconfigure the column model of the grid    */
    storeLoad: function () {
        var me = this;
        var columns = [];

        //label record
		if (me.store.data.length == me.store.proxy.extraParams.limit) {
			me.getComponent('gridtoolbar').getComponent('GetAllBtn').enable()
			me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Rec >' + me.store.totalCount);
		} else {
			me.getComponent('gridtoolbar').getComponent('GetAllBtn').disable()
			me.getComponent('gridtoolbar').getComponent('LabelRecord').setText('Rec ' + me.store.totalCount);
		}
		
        if (me.loadedColumns == true) {
            return;
        }
        me.loadedColumns = true;

        var toolbar =  this.getComponent('gridtoolbar');
        if (toolbar){
        if (me.allowadd) {
            toolbar.getComponent('AddBtn').show();
        }
        //    toolbar.getComponent('DplBtn').show();
		if (me.alloweditcell) {
            toolbar.getComponent('SaveBtn').show();
		}
        if (me.allowexport) {
            toolbar.getComponent('ExcelBtn').show();
        }
        if (me.allowsearch) {
            toolbar.getComponent('SearchField').show();
        }

        /*  adding NumberColumn  */
        if (me.NumberColumn) {
            columns.push(Ext.create('Ext.grid.RowNumberer'));
        }
    }

        /*  adding DectailColumn  */
        if (CurrentDeviceType == 'desktop') {
			if (me.DectailColumn) {
				columns.push(Ext.create('Ext.grid.column.Action', {
					header: 'DET',
					autoSizeColumn: false,
					flex: 0,
					minWidth: 40,
					width: 40,
					maxWidth: 40,
					align: 'center',
					items: [{
						iconCls: 'x-fa fa-expand toolBarIcon',
						tooltip: 'Detail',
                        scale: scaledim,
						handler: function (grid, rowIndex, colIndex, item, e, record) {
							var NameChiave = grid.panel.keyField;
							var Riga = clone(record.data);
							var ValRiga = Riga[NameChiave];
							grid.grid.processOnButton(grid, rowIndex, record, '', 'autocommit=false');

							//apri in edit il record
							if (((grid.panel.allowedit) || (grid.panel.allowadd)) && (!Custom.IsNullOrEmptyOrZeroString(grid.panel.layouteditorid))) {
								//NameChiave = CurrentLayoutDataSourceField;
								CurrentLayoutDataSourceFieldValue = ValRiga;
								console.log('dynamicgrid ' + NameChiave + '=' + ValRiga);
								appowhere = '';
								
								//edit data in row selected
								if (ValRiga) {
									if (Custom.isNumber(ValRiga) == true) {
										appowhere = NameChiave + '=' + ValRiga;
									} else {
										appowhere = NameChiave + "='" + ValRiga + "'";
									}
									Custom.LayoutRender(grid.panel.layouteditorid, 'form', appowhere, 'edit', grid.panel.layouteditorWindowMode, '', grid.panel.id);
								}
								//add empty row selected
								else if (grid.panel.allowadd) {
									var me = grid.up('dynamicgrid');
									var NameChiave = me.valueField;
									Custom.setCurrentPanelForm(me);
									CurrentLayoutDataSourceFieldValue = "";
									var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
									ValRiga = DS_Form00.data.items[0].data[me.datasourcefield];
									console.log('dynamicgrid add' + NameChiave + '=' + ValRiga);
									if ((CurrentPanelRaw.ViewType == 'form') && (Custom.IsNullOrEmptyOrZeroString(ValRiga))) {
										Custom.ExecuteProcRequest('SAVE');
										Custom.FormDataSave();
									} else {
										if ((CurrentPanelRaw.DataWhere != '') && (CurrentPanelRaw.ViewType == 'grid')) {
											Custom.LayoutRender(me.layouteditorid, 'form', CurrentPanelRaw.DataWhere + "", 'add', me.layouteditorWindowMode, '', me.id);
										} else {
											Custom.LayoutRender(me.layouteditorid, 'form', NameChiave + " = " + ValRiga + "", 'add', me.layouteditorWindowMode, '', me.id);
										}
									}
								}
							}
						}
					}]
				}));
			}
		}

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
					columnkeys.summaryRenderer = function (value) {
						//return Ext.util.Format.currency(value,'',2,true);
						return Ext.util.Format.number(value, '0,000.00');
						
					}
					columnkeys.renderer = Ext.util.Format.numberRenderer('0,000.00');
				}
				
                if (typeof columnkeys.hiddenInGrid !== undefined) {
                    if ((columnkeys.hiddenInGrid == 'nd') && (me.columnDefaultVisible == false)) {
                        columnkeys.hidden = true;
                    } else if (columnkeys.hiddenInGrid == true) {
                        columnkeys.hidden = true;
                    } else if (columnkeys.hiddenInGrid == false) {
                        columnkeys.hidden = false;
                    }
                }
				if ((columnkeys["xtype"] == "numberfield") || (columnkeys["xtype"] == "numbercolumn")) {
                    //DAFARE MEGLIO leggere la definition dal json della grid
					columnkeys.renderer = Ext.util.Format.numberRenderer('0,000.000');
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
                                if (Custom.isNumber(renderArray[i])) {
                                    //es: valore = colore
                                    if (record.get(columnphp.dataIndex) == renderArray[i]) {
                                        widget.setStyle('backgroundColor', 'transparent');
                                        widget.setStyle('border', '1px');
                                        widget.setIconCls('fa-blue x-fa  ' + renderArray[i + 1]);
                                        widget.setHandler(function (button) {
                                            var record = button.getWidgetRecord();
                                            var grid = this.up('panel');
                                        });
                                        return
                                    } else {
                                        //widget.hide();
                                    }
                                } else {
                                    //es: funzione  (val>0) = colore
                                    if (eval("'" + record.get(columnphp.dataIndex) + "' " + renderArray[i])) {
                                        widget.setStyle('backgroundColor', 'transparent');
                                        widget.setStyle('border', '1px');
                                        widget.setIconCls('fa-blue x-fa  ' + renderArray[i + 1]);
                                        widget.setHandler(function (button) {
                                            var record = button.getWidgetRecord();
                                            var grid = this.up('panel');
                                        });
                                        return
                                    } else {
                                        //widget.hide();
                                    }
                                }
                            }
                            widget.setIconCls(null);
                            widget.hide();
                        }
                    };
                } else if ((columnkeys.renderInGridColor !== undefined) && (columnkeys.renderInGridColor != '')) {
                    columnkeys.renderer = function (value, metaData, record) {
                        if (metaData.column == null) return;
                        var renderArray = metaData.column.config.renderInGridColor.split(',');
                        for (var i = 0; i < renderArray.length; i = i + 2) {
                            //valore = colore
                            if (Custom.isNumber(renderArray[i])) {
                                if (record.get(columnphp.dataIndex) == renderArray[i]) {
                                    metaData.style = 'background-color: #' + renderArray[i + 1];
                                }
                            } 
                            // funzione  (val>0) = colore
							else {
                                if (eval("'" + record.get(columnphp.dataIndex) + "' " + renderArray[i])) {
                                    metaData.style = 'background-color: #' + renderArray[i + 1];
                                }

                            }
                        }
						if (metaData.column.config.format) {
							return Ext.util.Format.number(value, metaData.column.config.format);
						} else {
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
                        
						if (metaData.column.config.format) {
							return Ext.util.Format.number(value, metaData.column.config.format);
						} else {
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
				
				if (me.rowWrap == true) {
					columnkeys['tdCls'] = 'wrap';
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
                } 
                else {
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

        /*  adding ButtonColumn  */
        if (me.ButtonColumn != 0) {
            columns.push(Ext.create('Ext.grid.column.Action', {
                header: 'CMD',
                autoSizeColumn: false,
                flex: 0,
                minWidth: 40,
                width: 40,
                maxWidth: 40,
                align: 'center',
                items: [{
                    iconCls: 'x-fa fa-check-square',
                    tooltip: 'Esegui',
                    handler: function (grid, rowIndex, colIndex, item, e, record) {
                        Ext.MessageBox.show({
                            title: 'Bottone ',
                            msg: 'Confermi ?',
                            buttons: Ext.MessageBox.OKCANCEL,
                            icon: Ext.MessageBox.WARNING,
                            fn: function (btn) {
                                if (btn == 'ok') {
                                    grid.grid.processOnButton(grid, rowIndex, record, me.ButtonColumn, 'autocommit=false');
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
							title: 'Cancellazione ',
							msg: 'Confermi la cancellazione?',
							buttons: Ext.MessageBox.OKCANCEL,
							icon: Ext.MessageBox.WARNING,
							fn: function (btn) {
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
		
        if (CurrentDeviceType == 'desktop') {
			
            /*  adding CheckColumn FUNIZONI DI GRUPPO */
            if (me.CheckColumn) {
                /* manage selected rows */
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
                if (toolbar){
                    if (me.DeleteColumn) toolbar.getComponent('ActionDeleteBtn').show();
                    if (me.ActionColumn) toolbar.getComponent('ActionTrueBtn').show();
                    if (me.ActionTrueFalseColumn) {
                        toolbar.getComponent('ActionTrueFalseTrueBtn').show();
                        toolbar.getComponent('ActionTrueFalseFalseBtn').show();
                    }
                }
            };

            /*  adding ActionColumn */
            if ((me.ActionColumn) && (!me.CheckColumn)) {
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

            /*  adding ActionTrueFalseColumn */
            if ((me.ActionTrueFalseColumn) && (!me.CheckColumn)) {
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
		if (me.goToLastRow) me.getView().scrollBy(0, 999999, true);
				
    },
	
    processOnButton: function (grid, rowIndex, record, processId, ParametersExtraString) {
        if (typeof ParametersExtraString === undefined) {
            ParametersExtraString = '';
        }
        var rec = grid.getStore().getAt(rowIndex);
        var data = {};
        //data.ID = record.data.ID;
        data[grid.config.grid.keyField] = rec.get(grid.config.grid.keyField);
        data['datasourcefield'] = grid.config.grid.keyField;

        var selectedRowDataString = '';
        var selectedRowIndexes = [];
        var selectedRowData = [];
        Ext.iterate(record.data, function (key, value) {
            //console.log(key+ ' '+  value);
            selectedRowData[key] = value;
            valueappo = value;
            if (toType(value) == 'date') {
                value = Custom.yyyymmdd(value);
            }
            if ((key.indexOf('SOURCE') == -1) && (key.indexOf('JSON') == -1)) {
                selectedRowDataString += key + '=' + encodeURIComponent(value) + '&';
            }
        });

        if (Custom.IsNOTNullOrEmptyOrZeroString(grid.config.grid.layouteditorid)) {
            selectedRowDataString += 'layoutid' + '=' + grid.config.grid.layouteditorid + '&'
        } else {
            selectedRowDataString += 'layoutid' + '=' + CurrentPanelRaw.id + '&'
        }
        selectedRowDataString += ParametersExtraString;
        Ext.Ajax.request({
            params: selectedRowDataString,
            url: 'includes/io/DataWrite.php',
            method: 'POST',
            async: false,
            waitTitle: 'Connecting',
            waitMsg: 'Sending data...',
            success: function (resp) {
                grid.getStore().commitChanges();
                var appo = Ext.util.JSON.decode(resp.responseText)
                var store = grid.getStore();
                var current = store.currentPage;
                if ((grid.fireEvent('beforechange', grid, current) !== false) && (processId != '')) {
                    store.loadPage(current);
                }
				if (Custom.IsNOTNullOrEmptyOrZeroString(grid.config.grid.layouteditorid)) {
					Custom.ExecuteProc(processId, grid.config.grid.layouteditorid, false);
				} else {
					Custom.ExecuteProc(processId, null, false);
				}
                
            },
            failure: function () {
                Ext.Msg.alert('error', 'Not Ok');
            }
        });
    },

    /* assign the event to itself when the object is initialising    */
    onRender: function (ct, position) {
        dynamicgrid.superclass.onRender.call(this, ct, position);
        this.store.on('load', this.storeLoad, this);
        // this.store.on('reload',this.storeLoad, this);
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
        var me = dynamicgrid;
        this.getStore().each(function (rec, ind) {
            rec.set(me.orderField, ind + 10);
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
    SaveMassUpdate: function () {
        //trova record aggiornati
        var records = this.getStore().getRange();
        for (var i = 0; i < records.length; i++) {
            var rec = records[i];
            if (rec.dirty == true) {
                //this.SaveRecordUpdate(rec);
				this.SaveRecordUpdate(rec, 'SAVE', '');
            }
        }
    },

    SaveRecordUpdate: function (dirtyRecord, actionid, action) {
        var selectedRowDataString = '';
        var selectedRowIndexes = [];
        var selectedRowData = [];
        Ext.iterate(dirtyRecord.modified, function (key, value) {
            var valuetowrite = dirtyRecord.data[key];
            selectedRowData[key] = valuetowrite;
            if (toType(valuetowrite) == 'date') {
                var curr_day = valuetowrite.getDate()
                var curr_month = valuetowrite.getMonth() + 1; //Months are zero based
                var curr_year = valuetowrite.getFullYear();
                if (curr_day < 10) curr_day = "0" + curr_day;
                if (curr_month < 10) curr_month = "0" + curr_month;
                valuetowrite = curr_year + "-" + curr_month + "-" + curr_day;
            }
            if (key != 'id') selectedRowDataString += key + '=' + encodeURIComponent(valuetowrite) + '&';
        });
		selectedRowDataString += 'autocommit' + '=' + 'true' + '&';
		selectedRowDataString += this.keyField + '=' + dirtyRecord.data[this.keyField] + '&';
		
        if (Custom.isNumber(this.layouteditorid) == true) {
            selectedRowDataString += 'layoutid' + '=' + this.layouteditorid + '&'
            if ((action == 'true') || (action == 'false')) selectedRowDataString += 'Action' + '=' + action + '&';

            Ext.Ajax.request({
                params: selectedRowDataString,
                url: 'includes/io/DataWrite.php',
                method: 'POST',
                async: false,
                waitTitle: 'Connecting',
				waitMsg: 'Sending data...',
                success: function (resp) {
                    var appo = Ext.util.JSON.decode(resp.responseText)
                    //Custom.ExecuteProc(actionid,null,null);
                },
                failure: function () {
                    Ext.Msg.alert('error', 'Not Ok');
                }
            });
        } else {
            Ext.Msg.alert('error', 'LayoutEditor in Grid REQUESTED !!!');
        }
    },

    /* MASS POST ACTION --  POST RECORD TOUCHED */
    PostMassAction: function (actionid, action) {
        //trova record aggiornati ed esegue l'action (proc) abbinata
        var records = this.getStore().getRange();
        for (var i = 0; i < records.length; i++) {
            var rec = records[i];
            if (rec.dirty == true) {
                if (rec.data.active == true) {
                    this.PostRecordAction(rec, actionid, action);
                }
            }
        }
    },

    PostRecordAction: function (dirtyRecord, actionid, action) {
        var selectedRowDataString = '';
        var selectedRowIndexes = [];
        var selectedRowData = [];
        Ext.iterate(dirtyRecord.data, function (key, value) {
            var valuetowrite = dirtyRecord.data[key];
            selectedRowData[key] = valuetowrite;
            if (toType(valuetowrite) == 'date') {
                var curr_day = valuetowrite.getDate()
                var curr_month = valuetowrite.getMonth() + 1; //Months are zero based
                var curr_year = valuetowrite.getFullYear();
                if (curr_day < 10) curr_day = "0" + curr_day;
                if (curr_month < 10) curr_month = "0" + curr_month;
                valuetowrite = curr_year + "-" + curr_month + "-" + curr_day;
            }
            if (key != 'id') selectedRowDataString += key + '=' + encodeURIComponent(valuetowrite) + '&';
        });

        if (Custom.isNumber(this.layouteditorid) == true) {
            selectedRowDataString += 'layoutid' + '=' + this.layouteditorid + '&'
            if ((action == 'true') || (action == 'false')) selectedRowDataString += 'Action' + '=' + action + '&';

            Ext.Ajax.request({
                params: selectedRowDataString,
                url: 'includes/io/DataWrite.php',
                method: 'POST',
                async: false,
                waitTitle: 'Connecting',
				waitMsg: 'Sending data...',
                success: function (resp) {
                    var appo = Ext.util.JSON.decode(resp.responseText)
                    Custom.ExecuteProc(actionid, this.layouteditorid, false);
                },
                failure: function () {
                    Ext.Msg.alert('error', 'Not Ok');
                }
            });
        } else {
            Ext.Msg.alert('error', 'LayoutEditor in Grid REQUESTED !!!');
        }
    },

    GetColumnWidthSplit: function () {
        var Appo = '';
        var columnnprog = 0;
		var columns = [];
        Ext.each(this.columnManager.columns, function (columnphp) {
            if (columnnprog > 0) {
				var Field = {};
				var edited = false;
				Field.name = columnphp.dataIndex;
				if (columnphp.isVisible()) {
					Field.hiddenInGrid = false;
					edited = true;
					if (columnphp.hasOwnProperty('flex')) {
						Appo = Appo + columnphp.flex + ',';
					} else if (columnphp.hasOwnProperty('width')) {
						Appo = Appo + columnphp.width + ',';
					}
				} else {
					edited = true;
					Field.hiddenInGrid = true;
					Appo = Appo + 0 + ',';
				}
				
				if (edited) columns[columns.length++] = Field;
			}
            columnnprog++;
        });
        return Ext.util.JSON.encode(columns);
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
			if ((columns[i].hidden == false) && (columns[i].hasOwnProperty('dataIndex'))) {
				clipText = clipText.concat(columns[i].text, "\t");
			}
		}

        clipText = clipText.concat("\n");

        for (var i = 0; i < records.length; i++) {
            var rec = records[i];
            Ext.iterate(rec.data, function (key, value) {
				for (var i = 0; i < columns.length; i++) {
					if ((columns[i].hidden == false) && (columns[i].hasOwnProperty('dataIndex')) && (columns[i].dataIndex == key)) {
						var valuetowrite = rec.data[columns[i].dataIndex];
						if (toType(valuetowrite) == 'date') {
							valuetowrite = Custom.yyyymmdd(valuetowrite);
						}
						if (valuetowrite != undefined) {
							clipText = clipText.concat(valuetowrite, "\t");
						} else {
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
					if (Custom.isNumber(valueraw.replace(".", "").replace(",", "."))) {
						valueraw = valueraw.replace(".", "");
						valueraw = valueraw.replace(",", ".");
					}
					//selectedRowDataString += colsHeader[j] + '=' + encodeURIComponent(valueraw) + '&';
				
					for (var k = 0; k < columns.length; k++) {
						if (columns[k].hasOwnProperty('dataIndex')) {
							if (columns[k].dataIndex.indexOf('decoded') != -1) {
                                key = columns[k].dataIndex.replace('decoded', '');
                            } else {
                                key = columns[k].dataIndex;
                            }
							if (((columns[k].text == colsHeader[j]) || (key == colsHeader[j]))) {
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
			
			if (!IdPresente) selectedRowDataString += me.keyField + '=' + '&';
            if (!ForeingPresente) selectedRowDataString += me.valueField + '=' + encodeURIComponent(me.textFilter) + '&'; 
			
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
						Custom.ExecuteProc(processId, me.layouteditorid, false);
					} else {
						Custom.ExecuteProc(processId, null, false);
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
				if (key == me.keyField) {
					selectedRowDataString += key + '=' + value + '&';
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
						Custom.ExecuteProc(processId, me.layouteditorid, false);
					} else {
						Custom.ExecuteProc(processId, null, false);
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
				if (cols[i].xtype == "numbercolumn") {
					//format
					//stl.numFmt = '#.##';
				}
				if (cols[i].xtype == "checkcolumn") {
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

	addKeyMap: function () {
		var me = this;
		//this.body.on("mouseover", this.onMouseOver, this);
		//this.body.on("mouseup", this.onMouseUp, this);

		//var dom = Ext.dom.Query.selectNode('div[class*=x-grid-item-container]', me.getEl().dom);
		//dom.style.overflowX='hidden';
		//dump(me.getEl())
		//return
		// map multiple keys to multiple actions by strings and array of codes
		me.getEl().on("keydown", this.onKeyDown, this);
		/*
		document.addEventListener("copy", function(e){
			dump("copy")
		}, false);*/
		new Ext.KeyMap(me.getEl(), [{
				key: "c",
				ctrl: true,
				fn: function () {
					//dump("COPY:::")
					//me.copyToClipBoard();
					var sm = me.getSelectionModel();
					setTimeout(function () {
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
	
updateGridData: function (e) {
		//dump(["updateGridData", e, Ext.event.Event.V])
		if (e.parentEvent.keyCode != Ext.event.Event.V) {
			return;	
		}
		
		//var Record 			= Ext.data.Record.create(this.store.fields.items);        	
		var tsvData = this.hiddentextarea.getValue();        
		tsvData = tsvData.split("\n");
		//dump(this.hiddentextarea.getValue()+"ssssss")
		var column = [];
		var cr = this.getSelectionModel().getSelectedCellRange();
		var nextIndex = cr[0];
		var cm = this.getColumnManager();
		var col;
		if (tsvData[0].split("\t").length == 1 && ((tsvData.length == 1) || (tsvData.length == 2 && tsvData[1].trim() == ""))) { //if only one cell in clipboard data, block fill process (i.e. copy a cell, then select a group of cells to paste)
			for (var rowIndex = cr[0]; rowIndex <= cr[2]; rowIndex++) {
				for (var columnIndex = cr[1]; columnIndex <= cr[3]; columnIndex++) {
					col = cm.getHeaderAtIndex(columnIndex);
					if (!col) {
						continue;
					};
					this.store.getAt(rowIndex).set(col.dataIndex, tsvData[0]);
				}
			}
		} else {   		    		
			var gridTotalRows = this.store.getCount();
			for (var rowIndex = 0; rowIndex < tsvData.length; rowIndex++) {
				if (tsvData[rowIndex].trim() == "") {
					continue;
				}
				columns = tsvData[rowIndex].split("\t");
				if (nextIndex > gridTotalRows - 1) {
					//var NewRecord 	= new Record({});
					//dump("nextIndex"+nextIndex)
					this.editing && this.editing.cancelEdit();        			
					this.store.insert(nextIndex, {});						
				}
				pasteColumnIndex = cr[1];				
				for (var columnIndex = 0; columnIndex < columns.length; columnIndex++) {
					col = cm.getHeaderAtIndex(pasteColumnIndex);
					if (!col) {
						continue;
					};
					this.store.getAt(nextIndex).set(col.dataIndex, columns[columnIndex]);
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
		sm.setPosition({
            row: cr[0],
            column: cr[1]
        }, true, true);
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
                        } else if (param.exportConverter) {
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

                        if (renderedValue == null) {
                            if (rec.get(param.dataIndex) != null) {
                                renderedValue = String(rec.get(param.dataIndex));
                            }
                        }
                        
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

Ext.define('Ext.selection.ExcelCellModel', {
    extend: 'Ext.selection.CellModel',
    alias: 'selection.excelcellmodel',
    selectedCellRange: [0, 0, 0, 0],
    firstSelectedCell: [0, 0],

    bindComponent: function(view) {
        var me = this;
        me.callParent([view]);
        var grid = view.grid || view.ownerCt;
        me.initCellEvents(grid);
    },

    onNavigate: function(e) {
        // It was a navigate out event.
        var me = this;
        if (!e.record || !e.position.column) {
            return;
        }
        var recordIndex = e.position.rowIdx,
            cellIndex = e.position.colIdx;
        if (e.keyEvent && !e.keyEvent.shiftKey) {
            me.firstSelectedCell = [recordIndex, cellIndex];
        }
        //dump(["type:", e])
        me.deSelectCellRange();
        if (e.keyEvent && e.keyEvent.type == "mousedown") {
            me.mouseSelectionEnable = true;
        }
        

        me.makeCellRange(recordIndex, cellIndex, me.firstSelectedCell[0], me.firstSelectedCell[1]);
        //dump( e.position.column)
        me.selectCellRange()
        me.setPosition(e.position);
    },

    onSelectChange: function(record, isSelected, suppressEvent, commitFn) {
        var me = this,
            pos,
            eventName,
            view,
            nm;

        if (isSelected) {
            pos = me.nextSelection;
            eventName = 'select';
        } else {
            pos = me.selection;
            eventName = 'deselect';
        }

        // CellModel may be shared between two sides of a Lockable.
        // The position must include a reference to the view in which the selection is current.
        // Ensure we use the view specified by the position.
        view = pos.view || me.primaryView;

        if ((suppressEvent || me.fireEvent('before' + eventName, me, record, pos.rowIdx, pos.colIdx)) !== false &&
                commitFn() !== false) {

            if (isSelected) {
                // Focus the cell unless we are configured not to do so, or the NavigationModel reports
                // that that position is already focused.
                if (!me.preventFocus) {
                    nm = view.getNavigationModel();
                    if (!pos.isEqual(nm.getPosition())) {
                        nm.setPosition(pos, null, null, null, true);
                    }
                }
                view.onCellSelect(pos);
            } else {
                //dump(pos)
                if (!me.isInSelectedRange(pos.rowIdx, pos.colIdx)) {
                    view.onCellDeselect(pos);
                    delete me.selection;
                };
            }

            if (!suppressEvent) {
                me.fireEvent(eventName, me, record, pos.rowIdx, pos.colIdx);
            }
        }
    },

    initCellEvents: function(grid) {
        var me = this,
            item;
        me.view.on({
            itemmouseenter: me.handleMouseOver,
            itemmouseup: me.handleMouseUp,
            scope: me,
            afterRender: function() {
                me.view.mon(me.view.el, {
                    mousemove: function(e) {
                        item = e.getTarget(me.view.itemSelector);
                        if (!item) {
                            return
                        };
                        e.newType = 'mouseenter';
                        e.type = 'mouseover';
                        me.view.handleEvent(e);
                    }
                });
            }
        });
    },
    
    handleMouseOver: function(view, cell, cellIndex, record, e) {
        var me = this;
        if (me.mouseSelectionEnable) {
            me.mouseOverTask = me.mouseOverTask || new Ext.util.DelayedTask(function() {
                me.onNavigate(e)
            });
            
            me.mouseOverTask.delay(10);
        }
    },

    handleMouseUp: function() {
    	this.mouseSelectionEnable = false;       
    },

    makeCellRange: function(row1, col1, row2, col2) {
    	if (row1 > row2) {
        	temp_row = row1;
        	row1 = row2;
        	row2 = temp_row;
        }
        if (col1 > col2) {
        	temp_col = col1;
        	col1 = col2;
        	col2 = temp_col;
        }
        this.selectedCellRange = [row1, col1, row2, col2];
    },
    
    selectCellRange: function() {
   	   var cr = this.selectedCellRange;
       var row1 = cr[0],
            col1 = cr[1],
            row2 = cr[2],
            col2 = cr[3];
        for (var r = row1; r <= row2; r++) {
        	for (var c = col1; c <= col2; c++) {
        	  this.view.onCellSelect({
                    row: r,
                    column: c
                });
          	}
        }
    },

    isInSelectedRange: function(row, cell) {
        var range = this.selectedCellRange;
        if (range[0] > row || range[1] > cell || range[2] < row || range[3] < cell)
            return false;
        return true;
    },

    getSelectedCellRange: function() {
    	return this.selectedCellRange;    
    },
    
    deSelectCellRange:function(){
        var me = this;
        var cr = me.selectedCellRange;
        var row1 = cr[0], col1 = cr[1], row2 = cr[2], col2=cr[3];
        for(var r = row1; r<= row2; r++){
            for(var c = col1; c<= col2; c++){
                me.view.onCellDeselect({row: r, column: c});
            }
        }
    }
});

Ext.define('dynamicgridfilters', {
    extend: 'Ext.plugin.Abstract',

    requires: [
        'Ext.grid.filters.filter.*'
    ],

    mixins: [
        'Ext.util.StoreHolder'
    ],

    alias: 'plugin.gfilters',

    pluginId: 'gfilters',

    /**
     * @property {Object} defaultFilterTypes
     * This property maps {@link Ext.data.Model#cfg-field field type} to the appropriate
     * grid filter type.
     * @private
     */
    defaultFilterTypes: {
        'boolean': 'boolean',
        'int': 'number',
        date: 'date',
        number: 'number',
        string: 'string'
    },

    /**
     * @property {String} [filterCls="x-grid-filters-filtered-column"]
     * The CSS applied to column headers with active filters.
     */
    filterCls: Ext.baseCSSPrefix + 'grid-filters-filtered-column',

    /**
     * @cfg {String} [menuFilterText="Filters"]
     * The text for the filters menu.
     */
    menuFilterText: 'Filters',

    /**
     * @cfg {Boolean} showMenu
     * Defaults to true, including a filter submenu in the default header menu.
     */
    showMenu: true,

    /**
     * @cfg {String} stateId
     * Name of the value to be used to store state information.
     */
    stateId: undefined,

    init: function (grid) {
        var me = this,
            store, headerCt;

        me.grid = grid;
        grid.filters = me;

        if (me.grid.normalGrid) {
            me.isLocked = true;
        }

        grid.clearFilters = me.clearFilters.bind(me);

        store = grid.store;
        headerCt = grid.headerCt;
        /*        headerCt.on({
                    scope: me,
                    add: me.onAdd,
                    menucreate: me.onMenuCreate
                });
        */
        grid.on({
            scope: me,
            destroy: me.onGridDestroy,
            beforereconfigure: me.onBeforeReconfigure,
            reconfigure: me.onReconfigure
        });

        me.bindStore(store);

        if (grid.stateful) {
            store.statefulFilters = true;
        }

        me.initColumns();
    },

    /**
     * Creates the Filter objects for the current configuration.
     * Reconfigure and on add handlers.
     * @private
     */
    initColumns: function () {
        var grid = this.grid,
            store = grid.getStore(),
            columns = grid.columnManager.getColumns(),
            len = columns.length,
            i, column,
            filter, filterCollection, block;

        // We start with filters defined on any columns.
        //c4w create menu on toolbar
        var me = this;
        var its = [];
        for (i = 0; i < len; i++) {
            column = columns[i];
            filter = column.filter;

            if (filter && !filter.isGridFilter) {
                if (!filterCollection) {
                    filterCollection = store.getFilters();
                    filterCollection.beginUpdate();
                }
                this.createColumnFilter(column);
                column.filter.createMenu();
                its.push({
                    text: column.text,
                    checked: false,
                    menu: column.filter.menu,
                    filter: column.filter,
                    listeners: {
                        scope: me,
                        checkchange: me.onCheckChange,
                        activate: me.onBeforeActivate
                    }
                });
            }
        }
        /*
         */
        var tbar = grid.down('toolbar');
        tbar.insert(0, {
            xtype: 'splitbutton',
            text: 'ClearFilter',
            iconCls: null,
            menu: its,
            handler: 'onClearFilters',
            scope: me
        });
        if (filterCollection) {
            filterCollection.endUpdate();
        }
    },

    onClearFilters: function () {
        // The "filters" property is added to the grid (this) by gridfilters
        this.clearFilters();
    },

    createColumnFilter: function (column) {
        var me = this,
            columnFilter = column.filter,
            filter = {
                column: column,
                grid: me.grid,
                owner: me
            },
            field, model, type;

        if (Ext.isString(columnFilter)) {
            filter.type = columnFilter;
        } else {
            Ext.apply(filter, columnFilter);
        }

        if (!filter.type) {
            model = me.store.getModel();
            // If no filter type given, first try to get it from the data field.
            field = model && model.getField(column.dataIndex);
            type = field && field.type;

            filter.type = (type && me.defaultFilterTypes[type]) ||
                column.defaultFilterType || 'string';
        }

        column.filter = Ext.Factory.gridFilter(filter);
    },

    onAdd: function (headerCt, column, index) {
        var filter = column.filter;

        if (filter && !filter.isGridFilter) {
            this.createColumnFilter(column);
        }
    },

    /**
     * @private Handle creation of the grid's header menu.
     */
    onMenuCreate: function (headerCt, menu) {
        menu.on({
            beforeshow: this.onMenuBeforeShow,
            scope: this
        });
    },

    /**
     * @private Handle showing of the grid's header menu. Sets up the filter item and menu
     * appropriate for the target column.
     */
    onMenuBeforeShow: function (menu) {
        var me = this,
            menuItem, filter, ownerGrid, ownerGridId;

        if (me.showMenu) {
            // In the case of a locked grid, we need to cache the 'Filters' menuItem for each grid since
            // there's only one Filters instance. Both grids/menus can't share the same menuItem!
            if (!me.menuItems) {
                me.menuItems = {};
            }

            // Don't get the owner grid if in a locking grid since we need to get the unique menuItems key.
            ownerGrid = menu.up('grid');
            ownerGridId = ownerGrid.id;

            menuItem = me.menuItems[ownerGridId];

            if (!menuItem || menuItem.isDestroyed) {
                menuItem = me.createMenuItem(menu, ownerGridId);
            }

            me.activeFilterMenuItem = menuItem;

            filter = me.getMenuFilter(ownerGrid.headerCt);
            if (filter) {
                filter.showMenu(menuItem);
            }

            menuItem.setVisible(!!filter);
            me.sep.setVisible(!!filter);
        }
    },

    createMenuItem: function (menu, ownerGridId) {
        var me = this,
            item;

        me.sep = menu.add('-');

        item = menu.add({
            checked: false,
            itemId: 'filters',
            text: me.menuFilterText,
            listeners: {
                scope: me,
                checkchange: me.onCheckChange
            }
        });

        return (me.menuItems[ownerGridId] = item);
    },

    /**
     * Handler called by the grid 'beforedestroy' event
     */
    onGridDestroy: function () {
        var me = this,
            menuItems = me.menuItems,
            item;

        me.bindStore(null);
        me.sep = Ext.destroy(me.sep);

        for (item in menuItems) {
            menuItems[item].destroy();
        }

        me.grid = null;
    },

    onUnbindStore: function (store) {
        store.getFilters().un('remove', this.onFilterRemove, this);
    },

    onBindStore: function (store, initial, propName) {
        this.local = !store.getRemoteFilter();
        store.getFilters().on('remove', this.onFilterRemove, this);
    },

    onFilterRemove: function (filterCollection, list) {
        // We need to know when a store filter has been removed by an operation of the gridfilters UI, i.e.,
        // store.clearFilter().  The preventFilterRemoval flag lets us know whether or not this listener has been
        // reached by a filter operation (preventFilterRemoval === true) or by something outside of the UI
        // (preventFilterRemoval === undefined).
        var len = list.items.length,
            columnManager = this.grid.columnManager,
            i, item, header, filter;

        for (i = 0; i < len; i++) {
            item = list.items[i];

            header = columnManager.getHeaderByDataIndex(item.getProperty());
            if (header) {
                // First, we need to make sure there is indeed a filter and that its menu has been created. If not,
                // there's no point in continuing.
                //
                // Also, even though the store may be filtered by this dataIndex, it doesn't necessarily mean that
                // it was created via the gridfilters API. To be sure, we need to check the prefix, as this is the
                // only way we can be sure of its provenance (note that we can't check `operator`).
                //
                // Note that we need to do an indexOf check on the string because TriFilters will contain extra
                // characters specifiying its type.
                //
                // TODO: Should we support updating the gridfilters if one or more of its filters have been removed
                // directly by the bound store?
                filter = header.filter;
                if (!filter || !filter.menu || item.getId().indexOf(filter.getBaseIdPrefix()) === -1) {
                    continue;
                }

                if (!filter.preventFilterRemoval) {
                    // This is only called on the filter if called from outside of the gridfilters UI.
                    filter.onFilterRemove(item.getOperator());
                }
            }
        }
    },

    /**
     * @private
     * Get the filter menu from the filters MixedCollection based on the clicked header.
     */
    getMenuFilter: function (headerCt) {
        return headerCt.getMenu().activeHeader.filter;
    },
    onBeforeActivate: function (item, value) {
        this.activeFilterMenuItem = item;
        this.activeFilterMenuItem.activeFilter = item.filter;
    },
    /** @private */
    onCheckChange: function (item, value) {
        // Locking grids must lookup the correct grid.
        var grid = this.isLocked ? item.up('grid') : this.grid,
            //filter = this.getMenuFilter(grid.headerCt);
            filter = item.filter;

        filter.setActive(value);
    },

    getHeaders: function () {
        return this.grid.view.headerCt.columnManager.getColumns();
    },

    /**
     * Checks the plugin's grid for statefulness.
     * @return {Boolean}
     */
    isStateful: function () {
        return this.grid.stateful;
    },

    /**
     * Adds a filter to the collection and creates a store filter if has a `value` property.
     * @param {Object/Ext.grid.filter.Filter} filters A filter configuration or a filter object.
     */
    addFilter: function (filters) {
        var me = this,
            grid = me.grid,
            store = me.store,
            hasNewColumns = false,
            suppressNextFilter = true,
            dataIndex, column, i, len, filter, columnFilter;

        if (!Ext.isArray(filters)) {
            filters = [filters];
        }

        for (i = 0, len = filters.length; i < len; i++) {
            filter = filters[i];
            dataIndex = filter.dataIndex;
            column = grid.columnManager.getHeaderByDataIndex(dataIndex);

            // We only create filters that map to an existing column.
            if (column) {
                hasNewColumns = true;

                // Don't suppress active filters.
                if (filter.value) {
                    suppressNextFilter = false;
                }

                columnFilter = column.filter;

                // If already a gridfilter, let's destroy it and recreate another from the new config.
                if (columnFilter && columnFilter.isGridFilter) {
                    columnFilter.deactivate();
                    columnFilter.destroy();

                    if (me.activeFilterMenuItem) {
                        me.activeFilterMenuItem.menu = null;
                    }
                }

                column.filter = filter;
            }
        }

        // Batch initialize all column filters.
        if (hasNewColumns) {
            store.suppressNextFilter = suppressNextFilter;
            me.initColumns();
            store.suppressNextFilter = false;
        }
    },

    /**
     * Adds filters to the collection.
     * @param {Array} filters An Array of filter configuration objects.
     */
    addFilters: function (filters) {
        if (filters) {
            this.addFilter(filters);
        }
    },

    /**
     * Turns all filters off. This does not clear the configuration information.
     * @param {Boolean} autoFilter If true, don't fire the deactivate event in
     * {@link Ext.grid.filters.filter.Base#setActive setActive}.
     */
    clearFilters: function (autoFilter) {
        var grid = this.grid,
            columns = grid.columnManager.getColumns(),
            store = grid.store,
            oldAutoFilter = store.getAutoFilter(),
            column, filter, i, len, filterCollection;

        if (autoFilter !== undefined) {
            store.setAutoFilter(autoFilter);
        }

        // We start with filters defined on any columns.
        for (i = 0, len = columns.length; i < len; i++) {
            column = columns[i];
            filter = column.filter;

            if (filter && filter.isGridFilter) {
                if (!filterCollection) {
                    filterCollection = store.getFilters();
                    filterCollection.beginUpdate();
                }

                filter.setActive(false);
            }
        }

        if (filterCollection) {
            filterCollection.endUpdate();
        }

        if (autoFilter !== undefined) {
            store.setAutoFilter(oldAutoFilter);
        }
    },

    onBeforeReconfigure: function (grid, store, columns) {
        if (store) {
            store.getFilters().beginUpdate();
        }

        this.reconfiguring = true;
    },

    onReconfigure: function (grid, store, columns, oldStore) {
        var me = this;

        if (store && oldStore !== store) {
            me.bindStore(store);
        }

        if (columns) {
            me.initColumns();
        }

        if (store) {
            store.getFilters().endUpdate();
        }

        me.reconfiguring = false;
    }
});

Ext.define('Ext.ux.grid.plugin.AutoSizeColumn', function() {

        function onBindStore(store) {
        store.on('clear', onStoreClear, this);
    }
    function onUnbindStore(store) {
        store.un('clear', onStoreClear, this);
    }

        function onStoreClear(store) {
        if (this.isDisabled()) {
            this.enable();
        }
    }

        function onViewRefresh(view) {
        var ancestor;

        // There might be a hidden ancestor in the ownership hierarchy.
        // In this case, auto-sizing should be postponed until ancestor is shown.
        if (ancestor = this.getCmp().up('[hidden]')) {
            ancestor.on('show', function() {
                this.autoSizeColumns();
            }, this, {
                single: true
            });
            return;
        }

        this.autoSizeColumns();
    }

    return {
        extend: 'Ext.plugin.Abstract',

        alias: 'plugin.autosizecolumn',

        config: {
                        maxAutoSizeWidth: null
        },

                init: function(grid) {
            var view = grid.getView(),
                store = grid.getStore();

            this.setCmp(grid);

            store.on('clear', onStoreClear, this);

            view.onBindStore = Ext.Function.createSequence(view.onBindStore, onBindStore);
            view.onUnbindStore = Ext.Function.createSequence(view.onUnbindStore, onUnbindStore);

            this.enable();
        },

                autoSizeColumns: function() {
            var grid = this.getCmp(),
                view = grid.getView(),
                // HACK: not sure why Ext.state.Stateful#getStateId is private 'cause it seems to be valid to be public.
                id = grid.stateful && grid.getStateId(),
                maxAutoSizeWidth = this.getMaxAutoSizeWidth();

            // If grid is stateful and state is saved in a storage,
            // column widths are applied from the state (unless the auto-sizing is enforced).
            if (id && Ext.state.Manager.get(id)) {
                this.disable();
            }

            if (this.isDisabled() || !grid.getStore().getCount()) {
                return;
            }

            grid.suspendLayouts();

            Ext.each(grid.getVisibleColumns(), function(column) {
                var maxContentWidth;

                // Flexible columns should not be affected.
                if (column.flex) {
                    return;
                }

                // HACK: using private method Ext.view.View#getMaxContentWidth
                maxContentWidth = view.getMaxContentWidth(column);

                if (maxAutoSizeWidth > 0 && maxContentWidth > maxAutoSizeWidth) {
                    column.setWidth(maxAutoSizeWidth);
                } else {
                    column.autoSize();
                }
            });

            grid.resumeLayouts();

            this.disable();

            grid.updateLayout();
        },

        isDisabled: function() {
            return this.disabled;
        },

        disable: function() {
            this.callParent();

            this.getCmp().getView().un('refresh', onViewRefresh, this);
        },
        
        enable: function() {
            this.callParent();

            this.getCmp().getView().on('refresh', onViewRefresh, this);
        },

                destroy: function() {

        }
    };
});

/**/