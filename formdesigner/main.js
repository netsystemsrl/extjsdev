var MainViewPort;

var CurrentObjectName = '';
var CurrentObjectId = '';
var CurrentLastObjectId = '';
var CurrentLastPanelName = '';
var CurrentLastPanelId = '';

var CurrentLayoutId = 0;
var CurrentLayoutName = '';
var CurrentLayoutViewType = '';
var CurrentLayoutJson = [];
var CurrentLayoutArray = [];
var CurrentLayoutSkin = "absolute";
var CurrentLayoutJsonFilter = [];
var CurrentLayoutDataSource = '';
var CurrentLayoutDataSourceDBName = '';
var CurrentLayoutDataSourceType = '';
var CurrentLayoutDataSourceField = '';

var JsonObjKeysName = [];
var JsonObjKeysValue = [];


//*************************************************************************************************************//
//				FORM 
Custom.LayoutLoad   = function (LayoutId) {
	CurrentLayoutDataSource = 'ESEMPIO';
	CurrentLayoutDataSourceType = 'ESEMPIO';
	CurrentLayoutDataSourceField = 'ID';
	CurrentLayoutDataSource = '';
	CurrentLayoutDataSourceDBName = ''
	CurrentLayoutViewType = 'form';
	CurrentLayoutSkin = 'absolute';
	CurrentLayoutJson = [];
	Ext.Ajax.request({
		url: '../includes/io/LayoutRead.php',
		params: {
				layoutid: LayoutId, 
				themeName: themeName
		},
		timeout: 60000,
		async: false,
		success: function (response, opts) {
			var JsonAppo = Ext.util.JSON.decode(response.responseText);
			if (JsonAppo.data[0].datasourcedbname !== undefined) {CurrentLayoutDataSourceDBName = JsonAppo.data[0].datasourcedbname;}
			if (JsonAppo.data[0].datasource !== undefined) {CurrentLayoutDataSource = JsonAppo.data[0].datasource;}
			if (JsonAppo.data[0].datasourcetype !== undefined) {CurrentLayoutDataSourceType = JsonAppo.data[0].datasourcetype;}
			if (JsonAppo.data[0].datasourcefield !== undefined) {CurrentLayoutDataSourceField = JsonAppo.data[0].datasourcefield;}
			if (JsonAppo.data[0].viewtype !== undefined) {CurrentLayoutViewType = JsonAppo.data[0].viewtype;}
			if (JsonAppo.data[0].layoutskin !== undefined) {CurrentLayoutSkin = JsonAppo.data[0].layoutskin;}
			if (JsonAppo.data[0].layoutjson !== undefined) {CurrentLayoutJson = JsonAppo.data[0].layoutjson;}
			
			//toglie vecchie definizioni del Form00 (errori di salvataggio)
			var Form00 = getSubItemFromName(CurrentLayoutJson,'Form00');
			if (Form00 !== undefined) {removeSubItemFromName(CurrentLayoutJson,'Form00');}
			
			//DAFARE (serve ancora ?)
			//aggiunge il campo Form00 al CurrentLayoutJson
			var keys = {};
			keys.datasourcetype = CurrentLayoutDataSourceType;
			keys.datasourcefield = CurrentLayoutDataSourceField;
			keys.datasource = CurrentLayoutDataSource;
			keys.viewtype = CurrentLayoutViewType;
			keys.layout = CurrentLayoutSkin;
			keys.name = 'Form00';
			if (CurrentLayoutJson == null){
				CurrentLayoutJson[0] = keys;
			}else{
				if (CurrentLayoutJson.length == undefined){
					appo = clone(CurrentLayoutJson);
					CurrentLayoutJson  = []
					CurrentLayoutJson[0] = appo;
				}
				CurrentLayoutJson[CurrentLayoutJson.length++] = keys;
			}
		},
		failure: function (response) {
			Ext.Msg.alert('Error','Server Not Responding!!');
		}
	});
}
Custom.LayoutSave   = function(LayoutId){
	//cerca store della designstore
	var Form00 = getSubItemFromName(CurrentLayoutJson,'Form00');
	/*CurrentLayoutDataSource = Form00.datasource;
	CurrentLayoutDataSourceType = Form00.datasourcetype;
	CurrentLayoutDataSourceField = Form00.datasourcefield;
	CurrentLayoutViewType = Form00.viewtype;
	//toglie Form00 e riclcola il layout
	//converti in stringa
	*/
	if (Form00 !== undefined) removeSubItemFromName(CurrentLayoutJson,'Form00');
	
	var json = Ext.util.JSON.encode(CurrentLayoutJson);
	//Invia i dati al server
	Ext.Ajax.request({
		method: 'POST',
		async:  false,
		params: {layoutid: LayoutId,
				layoutjson: json,
				layoutskin: CurrentLayoutSkin,
				datasource: CurrentLayoutDataSource,
				datasourcefield: CurrentLayoutDataSourceField,
				datasourcetype: CurrentLayoutDataSourceType,
				viewtype: CurrentLayoutViewType
				},
		url: '../includes/io/LayoutWrite.php',
		success: function(response) {
			var JsonAppo = Ext.util.JSON.decode(response.responseText);
			Ext.Msg.alert('Saved', JsonAppo.message);
		},
		failure: function() {
			Ext.Msg.alert('Error','Server Not Responding!!');
		}
	})
}
Custom.FormDelete = function(){
	CurrentLayoutJson = {};
}
Custom.FormRender = function(){
	log('RenderForm');
	var centerView = MainViewPort.getComponent('centerViewPortId');
	var DesignPanel = centerView.getComponent('DesignPanel');
	//var DesignPanel = Ext.getCmp('DesignPanel');
	
	Ext.suspendLayouts();
	DesignPanel.removeAll();
	if (DesignPanel.layout.config.type != CurrentLayoutSkin) {
		Ext.Msg.alert('For This modify, Save and Reload page!');
	}
	DesignPanel.add(clone(CurrentLayoutJson));
	//DesignPanel.updateLayout();
	Ext.resumeLayouts(true);
	
	//Load ListObj
	log('LoadObjectList');
	var selPropertyCombo = Ext.getCmp('selPropertyCombo');
	var selPropertyComboStore = Ext.StoreManager.lookup('selPropertyComboStore') 
	
	JsonObjKeysName = [];
	JsonObjKeysValue = [];
	
	CurrentLayoutArray = [];
	JsonToArray(CurrentLayoutJson,'name');
	for (var i = 0; i < CurrentLayoutArray.length; i++) {
		JsonObjKeysName.push([CurrentLayoutArray[i].name]);
	}
	JsonObjKeysName.sort();
	selPropertyComboStore.loadData(JsonObjKeysName,false);
	
	if (CurrentLastPanelName != ''){
		CurrentLastPanelId = Ext.ComponentQuery.query('[name=' + CurrentLastPanelName + ']')[0].id;
		var curPanel = Ext.ComponentQuery.query('[name=' + CurrentLastPanelName + ']')[0];
		var curTabPanel = curPanel.up('tabpanel');
		if ((curTabPanel != undefined) && (curTabPanel != null)){
			var curTabPanelPanel = curTabPanel.child('[name=' + CurrentLastPanelName + ']' );
			curTabPanel.setActiveTab(curTabPanelPanel);
		}else{
			curPanel.focus();
		}
	}
	if (CurrentObjectName != ''){
		//var curObj = DesignPanel.getForm().findField(CurrentObjectName);
		var curObj = Ext.ComponentQuery.query('[name=' + CurrentObjectName + ']')[0];
		CurrentObjectId = curObj.id;
		curObj.focus();
	}
	
		
}
var JsonToArray = function (subItems, name) {
	if (subItems) {
		if ((subItems.length !== undefined) ) {
			for (var i = 0; i < subItems.length; i++) {
				if (subItems[i][name] !== undefined) {
					CurrentLayoutArray[CurrentLayoutArray.length++] =  subItems[i];
				}
			}
		}
		if ((subItems.items !== undefined) ) {
			JsonToArray(subItems.items, name);
		}
	}
};

//*************************************************************************************************************//
//				FORMOBJ
Custom.ObjDelete = function(ObjectExt){
	//var result = getSubItemFromName(CurrentLayoutJson, ObjectExt);
	var result = removeSubItemFromName(CurrentLayoutJson, ObjectExt);
	CurrentObjectId = '';
	CurrentObjectName = '';
}
Custom.ObjAdd = function(record, posx, posy, pospanel){
	//creo nuovo oggetto extjs
	var keys = {};
	keys.xtype = 'textfield';
	keys.x = posx;
	keys.y = posy;
	keys.width = 300;
	
	for(var propertyName in record) {
		paramname = propertyName;
		paramvalue = record[propertyName];
		if ((paramvalue != '') && (paramname.substring(0, 3) == 'obj' )) {
			paramname = paramname.substring(3, (paramname.length));
			keys[paramname] = paramvalue;
		}
	}
	
	switch (true)  {
		case keys.xtype.indexOf('datefield') != -1:{
			keys.format = 'd-m-Y';
			keys.submitFormat = 'Y-m-d';
		}
		break;
		case keys.xtype.indexOf('timefield') != -1:{
			keys.format = 'H:i';
			keys.submitFormat = 'H:i';
		}
		break;
		case keys.xtype.indexOf('timerfield') != -1:{
			keys.format = 'H:i:s';
			keys.submitFormat = 'i';
		}
		break;
		case keys.xtype.indexOf('datetimefield') != -1:{
			keys.format = 'd-m-Y H:i';
			keys.submitFormat = 'Y-m-d H:i';
		}
		break;
		case keys.xtype.indexOf('button') != -1 :{
			keys.width = 100;
			keys.procremoteonclick = 1;
			//keys.procremoteonclick = record.get('objprocremoteonclick');
			keys.text = keys.name;
			};
		break;	
		case keys.xtype.indexOf('image') != -1 :{
			keys.width = 100;
			keys.height = 100;
			keys.src = '/repositorycom/logo.png';
		};
		break;
		case keys.xtype.indexOf('label') != -1 :{
			keys.margins ='0 0 0 10';
			keys.text = keys.name;
		};
		break;
		case keys.xtype.indexOf('checkbox') != -1 : {
			keys.width = 100;
			}
		break;
		case keys.xtype.indexOf('combobox') != -1 : {
			keys.queryMode ='remote';
			keys.queryParam ='searchStr';
			keys.queryField ='displayField';
			keys.typeAhead = true;
			keys.typeAheadDelay = 100;
			keys.minChars = 2;
			keys.editable = true;
			keys.rowlimit = 1000;
			keys.width = 600;
			//keys.store = 'DS' + LocalName;
			if (keys.datasource == '') keys.datasource = 'SELECT * FROM ' + keys.name ;
			if (keys.datasourcetype == '') keys.datasourcetype = 'SELECT';
			if (keys.valueField == '') keys.valueField = 'ID';
			if (keys.displayField == '') keys.displayField = 'DESCRIZIONE'; 
			}
		break;
		case keys.xtype.indexOf('dynamiccombo') != -1 : {
			keys.layouteditorid = 0;
			keys.layouteditorWindowMode = 'acWindowNormal';
		}
		break;
		case keys.xtype.indexOf('dynamictextfield') != -1 : {
			keys.layouteditorid = 0;
			keys.layouteditorWindowMode = 'acWindowNormal';
		}
		break;
		case keys.xtype.indexOf('dynamicbarcode') != -1 : {
			keys.bcformat = 'CODE39';
			keys.bcwidth = 1;
			keys.bcdisplayValue = true;
		}
		break;
		case keys.xtype.indexOf('treepanel') != -1 : {
			keys.queryMode ='remote';
			keys.queryParam ='searchStr';
			keys.editable=false;
			//keys.store = 'DS' + LocalName;
			if (keys.datasource == '') keys.datasource = 'ESEMPIO';
			if (keys.datasourcetype == '') keys.datasourcetype = 'TREE';
			if (keys.valueField == '') keys.valueField = 'ID';
			if (keys.displayField == '') keys.displayField = 'NOME'; 
			if (keys.waytoexpand == '') keys.waytoexpand = 'down'; 
			if (keys.childrenidname == '') keys.childrenidname = 'ID'; 
			if (keys.parentidname == '') keys.parentidname = 'ID_PARENT';
			if (keys.parentidstart == '') keys.parentidstart = 0;
			}
		break;
		case keys.xtype.indexOf('grid') != -1 : {
			keys.height = 200;
			keys.width = 400;
			keys.rowlimit = 100;
			//keys.store = 'DS' + LocalName;
			if (keys.datasource == '') keys.datasource = 'ESEMPIO';
			if (keys.datasourcetype == '') keys.datasourcetype = 'ESEMPIO';
			if (keys.valueField == '') keys.valueField = 'ID';
			
			keys.title = keys.name;
			
			keys.allowfilter = true;
			keys.allowsearch = true;
			keys.allowadd = true;
			keys.allowedit = true;
			keys.allowdelete = true;
			keys.allowexport = true;
			
			keys.navigationbutton = true;
			
			keys.CheckColumn = false;
			
			keys.NumberColumn = false;
			keys.enumerateField = false;
			
			keys.ActionColumn = false;
			keys.ActionTrueFalseColumn = false;
			keys.DeleteColumn= false;
			keys.DectailColumn = false;
			
			keys.columnDefaultVisible = false;
			keys.layouteditorid = 0;
			keys.layouteditorWindowMode = 'acWindowNormal';
			
			keys.remotesearch = true;
			/*ACTIVABLE ACTIONS*/
			};
		break;
		case keys.xtype.indexOf('gmappanel') != -1 :{
			keys.height = 200;
			keys.width = 400;
			//keys.store = 'DS' + LocalName;
			if (keys.datasource == '') keys.datasource = 'ESEMPIO';
			if (keys.datasourcetype == '') keys.datasourcetype = 'ESEMPIO';
			if (keys.valueField == '') keys.valueField = 'ID';
		};
		break;
		case keys.xtype.indexOf('kpi') != -1 :{
			//keys.store = 'DS' + LocalName;
			if (keys.datasource == '') keys.datasource = 'ESEMPIO';
			if (keys.datasourcetype == '') keys.datasourcetype = 'ESEMPIO';
			if (keys.valueField == '') keys.valueField = 'ID';
			keys.height = 300;
		};
		break;
		case keys.xtype.indexOf('tabpanel') != -1 : {
			keys.activeTab = 0;
			keys.height = 600;
			keys.width = 600;
			keys.deferredRender = false;
			keys.items = [
							{	xtype:"panel",
								name:"panelA",
								layout:{"type":"absolute"},
								title:"A",
								items:[]
							},{
								xtype:"panel",
								name:"panelB",
								layout:{"type":"absolute"},
								title:"B",
								items:[]
							},{
								xtype:"panel",
								name:"panelC",
								layout:{"type":"absolute"},
								title:"C",
								items:[]
							}
						];
		};
		break;
		case keys.xtype.indexOf('panel') != -1 : {
			keys.height = 600;
			keys.width = 600;
			keys.deferredRender = false;
			keys.title = 'Title';
			keys.layout = {
							type: "hbox",
							align: "stretch",
							padding: 5
						};
			keys.items = [];
		};
		break;
		case keys.xtype.indexOf('dynamicgridform') != -1 : {
			keys.height = 600;
			keys.width = 600;
			keys.deferredRender = false;
			keys.title = 'Title';
			keys.layout = {
							type: "hbox",
							align: "stretch",
							padding: 5
						};
			keys.items = [];
		};
		break;
		default:{
		}
		break;
	}
	
	if (keys.datasourcefield == '') keys.datasourcefield = keys.name;
	/*
	//posizionamento su oggetto esistente (all'interno di un panel)
	var elementMouseIsOver = document.elementFromPoint(keys.x, keys.y);
	var elementMouseIsOverExt = Ext.get(elementMouseIsOver.id).component;
	log('Mouse on Obj: ' + elementMouseIsOverExt.id);

	while (elementMouseIsOverExt.xtype != 'panel') {
		elementMouseIsOverExt = elementMouseIsOverExt.ownerCt;
	}
	*/
	
	//univocita del name
	if (keys.name.slice(-1) == '1'){
		keys.name = keys.name + 1000 + Math.floor((Math.random() * 100) + 1);
	}
	
	//aggiunge l'oggetto nella LayoutJson
	if (pospanel == 'DesignPanel'){
		//xy assoluto (pannello esterno - designpanel)
		//var FormPanel = elementMouseIsOverExt;
		//if (FormPanel.xtype != 'panel') { FormPanel = FormPanel.ownerCt;}
		var FormPanel = Ext.get(pospanel).component;
		log('offset x:' + FormPanel.getXY()[0] + ' y:' + FormPanel.getXY()[1] + ' position inside sub panel drag');
		keys.x = keys.x - FormPanel.getXY()[0];
		keys.y = keys.y - FormPanel.getXY()[1];
		CurrentLayoutJson[CurrentLayoutJson.length++] = keys;
	}else{
		//xy relativo (pannello interno)
		var FormPanel = Ext.get(pospanel).component;
		log('offset x:' + FormPanel.getXY()[0] + ' y:' + FormPanel.getXY()[1] + ' position inside sub panel drag');
		keys.x = keys.x - FormPanel.getXY()[0];
		keys.y = keys.y - FormPanel.getXY()[1];
		var FormPanelItems = getSubItemFromName(CurrentLayoutJson,FormPanel.name).items;
		FormPanelItems[FormPanelItems.length++] = keys;
	}
	log('added ' + keys.name + ' to ' + FormPanel.name);
	return keys.name;
}
Custom.ObjInPropertyGrid = function(ObjectExt){
	var i = 0;
	if (ObjectExt === undefined) return;
		
	var PropertyGrid = Ext.getCmp('PropertyGrid');
	var centerView = MainViewPort.getComponent('centerViewPortId');
	var DesignPanel = centerView.getComponent('DesignPanel');
	
	//evidenzio l'oggetto
	if (CurrentLastObjectId != ""){
		//azzerro cls per l'oggetto precedentemente selezionato
		var extElement = Ext.ComponentQuery.query('[id=' + CurrentLastObjectId + ']')[0];
		if (extElement !== undefined) extElement.removeCls('themeeditor-bordered');
	}
	//var extElement = Ext.get(ObjectExt); //.component;
	var extElement = Ext.ComponentQuery.query('[name=' + ObjectExt + ']')[0];
	extElement.addCls('themeeditor-bordered');
	CurrentLastObjectId = CurrentObjectId;
	
	var newPropertyCombo = Ext.getCmp('newPropertyCombo');
	var newPropertyComboStore = Ext.StoreManager.lookup('newPropertyComboStore') 
	var obj ;
	var i = 0;
	JsonObjKeysName = [];
	JsonObjKeysValue = [];
	
	var result = getSubItemFromName(CurrentLayoutJson, ObjectExt);
		
	// ACTIVE PROPERTY
	if (result){
		//carico store griproperty con l'array dell'oggetto
		PropertyGrid.setSource(sumArraysInObject(clone(result)));
		
	// ADD PROPERTY
		// trovo property dell'oggetto render
		var curObj = Ext.ComponentQuery.query('[name=' + result.name + ']')[0];
		//obj = DesignPanel.getForm().findField(result.name)
		
	// property da ext
		Ext.Object.each(curObj, function(key, value, myself) {
			if ((typeof value != 'object') && (typeof value != 'function') && (key.substring(0,1) != '$') && (key.substring(0,1)  != '_') ) {
				//property
				JsonObjKeysName.push([key]);
				JsonObjKeysValue[key] = value;
			}
		})
		
		//property aggiuntive
		JsonObjKeysName.push(['tabIndex']);
		JsonObjKeysValue.tabIndex = 1;
		
		JsonObjKeysName.push(['itemId']);
		JsonObjKeysValue.itemId = result.name;
		
		
		//definizione aspetto
		JsonObjKeysName.push(['labelWidth']);
		JsonObjKeysValue.labelWidth = 200;
		
		JsonObjKeysName.push(['fieldWidth']);
		JsonObjKeysValue.fieldWidth = 200;
		
		JsonObjKeysName.push(['labelAlign']);
		JsonObjKeysValue.labelAlign = 'left';
		
		JsonObjKeysName.push(['labelStyle']);
		JsonObjKeysValue.labelStyle = 'font-weight:bold';
		
		JsonObjKeysName.push(['style']);
		JsonObjKeysValue.style = 'font-weight:bold';
		
		JsonObjKeysName.push(['hasfocus']);
		JsonObjKeysValue.hasfocus = true;
		
		
		//definizione sorgente dati 
		JsonObjKeysName.push(['datasourcefield']);
		JsonObjKeysValue.datasourcefield = result.name;
		
		JsonObjKeysName.push(['value']);
		JsonObjKeysValue.value = '0';
		
		
		JsonObjKeysName.push(['bcdisplayValue']);
		JsonObjKeysValue.bcdisplayValue = true;
		
		//eventi sul campo + process
		JsonObjKeysName.push(['autopostback']);
		JsonObjKeysValue.autopostback = true;
		
		JsonObjKeysName.push(['procremoteonupdate']);
		JsonObjKeysValue.procremoteonupdate = 0;
		
		JsonObjKeysName.push(['procalert']);
		JsonObjKeysValue.procalert = 'Testo Alert';
			
		//definizione accettabilita del campo
		JsonObjKeysName.push(['editable']);
		JsonObjKeysValue.editable = false;
		
		JsonObjKeysName.push(['readOnly']);
		JsonObjKeysValue.readOnly = true;
		
		JsonObjKeysName.push(['allowBlank']);
		JsonObjKeysValue.allowBlank = false;
		
		JsonObjKeysName.push(['blankText']);
		JsonObjKeysValue.blankText = "Scelta obbligatoria!";
		
		JsonObjKeysName.push(['inputType']);
		JsonObjKeysValue.inputType = 'text';
		
		JsonObjKeysName.push(['emptyText']);
		JsonObjKeysValue.emptyText = '';
		
		JsonObjKeysName.push(['defaultValue']);
		JsonObjKeysValue.defaultValue = '';
		
		JsonObjKeysName.push(['regex']);
		JsonObjKeysValue.regex = '';
			
		JsonObjKeysName.push(['autoCapitalize']);
		JsonObjKeysValue.autoCapitalize = true;
		
		
		//definizione guida campo
		JsonObjKeysName.push(['tooltip']);
		JsonObjKeysValue.tooltip = '';
		
		JsonObjKeysName.push(['guideid']);
		JsonObjKeysValue.guideid = 1000 + Math.floor((Math.random() * 100) + 1);
		
		
		//tipologia dei caratteri nel campo
		JsonObjKeysName.push(['vtype']);
		JsonObjKeysValue.vtype = 'alpha';
		
		
		JsonObjKeysName.push(['maxLength']);
		JsonObjKeysValue.maxLength = 50;
		
		JsonObjKeysName.push(['maxLengthText']);
		JsonObjKeysValue.maxLengthText = 'Lunghezza Massima superata!';
		
		JsonObjKeysName.push(['minLength']);
		JsonObjKeysValue.minLength = 50;
		
		JsonObjKeysName.push(['minLengthText']);
		JsonObjKeysValue.minLengthText = 'Lunghezza Minima non superata!';
		
		JsonObjKeysName.push(['allowkeypad']);
		JsonObjKeysValue.allowkeypad = true;
		
		//definizione visibilita campo
		JsonObjKeysName.push(['hidden']);
		JsonObjKeysValue.hidden = true;
		
		JsonObjKeysName.push(['hiddenInForm']);
		JsonObjKeysValue.hiddenInForm = true;
		
		JsonObjKeysName.push(['hiddenInFormExp']);
		JsonObjKeysValue.hiddenInFormExp = 'FL_APPO';
		
		JsonObjKeysName.push(['height']);
		JsonObjKeysValue.height = 200;
		
		JsonObjKeysName.push(['width']);
		JsonObjKeysValue.width = 200;
				
		JsonObjKeysName.push(['minHeight']);
		JsonObjKeysValue.minHeight = 200;
		
		JsonObjKeysName.push(['minWidth']);
		JsonObjKeysValue.minWidth = 200;
		
		JsonObjKeysName.push(['maxHeight']);
		JsonObjKeysValue.maxHeight = 200;
		
		JsonObjKeysName.push(['maxWidth']);
		JsonObjKeysValue.maxWidth = 200;
		
		JsonObjKeysName.push(['flex']);
		JsonObjKeysValue.flex = 1;
		
		JsonObjKeysName.push(['columnWidth']);
		JsonObjKeysValue.columnWidth = 0.3;
		
		JsonObjKeysName.push(['margin']);
		JsonObjKeysValue.margin = '5 5 5 5';
		
		JsonObjKeysName.push(['anchor']);
		JsonObjKeysValue.anchor = '100% 50%';
		
		JsonObjKeysName.push(['widthInGrid']);
		JsonObjKeysValue.widthInGrid = 200;
		
		JsonObjKeysName.push(['flexInGrid']);
		JsonObjKeysValue.flexInGrid = 1;
		
		JsonObjKeysName.push(['hiddenInGrid']);
		JsonObjKeysValue.hiddenInGrid = true;
		
		JsonObjKeysName.push(['lockedInGrid']);
		JsonObjKeysValue.lockedInGrid = true;
		
		JsonObjKeysName.push(['loadAll']);
		JsonObjKeysValue.loadAll = true;
		
		JsonObjKeysName.push(['rowexpander']);
		JsonObjKeysValue.rowexpander = "'<p><b>Descrizione:</b> {DESCRIZIONE}</p>','<p><b>Nome:</b> {NOME}</p>'";
		
		JsonObjKeysName.push(['editableInGrid']);
		JsonObjKeysValue.editableInGrid = true;
		
		JsonObjKeysName.push(['renderInGridColor']);
		JsonObjKeysValue.renderInGridColor = 'Verde,6dce6d,Azzurro,cd7ddb,Rosso,bf6161';
		
		JsonObjKeysName.push(['renderInGridIcon']);
		JsonObjKeysValue.renderInGridIcon = '1,fa-bell,2,fa-car';
		
		JsonObjKeysName.push(['renderInGridButton']);
		JsonObjKeysValue.renderInGridButton = '1,fa-bell,1001,2,fa-car,1003';
		
		JsonObjKeysName.push(['renderInGridSummaryType']);
		JsonObjKeysValue.renderInGridSummaryType = 'sum';
	
		JsonObjKeysName.push(['summaryField']);
		JsonObjKeysValue.summaryField = 'VALORE';
			
		//bind
		JsonObjKeysName.push(['bind']);
		JsonObjKeysValue.bind = result.name;
		
		JsonObjKeysName.push(['reference']);
		JsonObjKeysValue.reference = "'hidden': '{!nameobj.property}'";
			
		JsonObjKeysName.push(['fieldLabel']);
		JsonObjKeysValue.fieldLabel = 'labelXX';
			
		//definizioni particolari
		if (result.xtype == 'codeeditor'){
			JsonObjKeysName.push(['width']);
			JsonObjKeysValue.width = 900;
		}
		
		if (result.xtype.substring(0, 7) == 'dynamic'){
			JsonObjKeysName.push(['layouteditorid']);
			JsonObjKeysValue.layouteditorid = '';
			
			JsonObjKeysName.push(['layoutsearchid']);
			JsonObjKeysValue.layoutsearchid = '';
			
			JsonObjKeysName.push(['layouteditorWindowMode']);
			JsonObjKeysValue.layouteditorWindowMode = 'acWindowNormal';
			
			JsonObjKeysName.push(['valueField']);
			JsonObjKeysValue.valueField = 'ID';
			
			JsonObjKeysName.push(['insertwhere']);
			JsonObjKeysValue.insertwhere = '';
			
			JsonObjKeysName.push(['filterwhere']);
			JsonObjKeysValue.filterwhere = '';
			
		}
		
		if (result.xtype == 'timerfield'){
			JsonObjKeysName.push(['format']);
			JsonObjKeysValue.format = 'H:i:s';
			
			JsonObjKeysName.push(['submitFormat']);
			JsonObjKeysValue.submitFormat = 'i';
		}
		
		if ((result.xtype.indexOf('panel') > 0 ) || (result.xtype.substring(0, 3) == 'kpi') || (result.xtype.indexOf('grid') > 0 ) ){
			JsonObjKeysName.push(['padding']);
			JsonObjKeysValue.padding = '5 5 0 5';
			
			JsonObjKeysName.push(['title']);
			JsonObjKeysValue.title = 'Title';
			
			JsonObjKeysName.push(['frame']);
			JsonObjKeysValue.frame = true;
		
			JsonObjKeysName.push(['layout']);
			JsonObjKeysValue.layout = 'absolute';
			
		}
		
		AddPanelButton = Ext.getCmp('AddPanelButton');
		//AddPanelButton = CurWindow.getComponent('AddPanelButton');
		if (result.xtype == 'tabpanel' ) {
			AddPanelButton.show();
		}else{
			AddPanelButton.hide();
		}
		
		if (result.xtype == 'dynamicgridform'){
			JsonObjKeysName.push(['layoutInternal']);
			JsonObjKeysValue.layoutInternal = 'absolute';
		}
		
		if ((result.xtype.indexOf('grid') > 0 )){
			JsonObjKeysName.push(['datasource']);
			JsonObjKeysValue.datasource = 'ESEMPIO';
			
			JsonObjKeysName.push(['datasourcetype']);
			JsonObjKeysValue.datasourcetype = 'ESEMPIO';
			
			JsonObjKeysName.push(['valueField']);
			JsonObjKeysValue.valueField = 'ID';
			
			JsonObjKeysName.push(['keyField']);
			JsonObjKeysValue.keyField = 'ID';
			
			JsonObjKeysName.push(['displayField']);
			JsonObjKeysValue.displayField = 'DESCRIZIONE';
			
			JsonObjKeysName.push(['allowexport']);
			JsonObjKeysValue.allowexport = false;
			
			JsonObjKeysName.push(['allowsearch']);
			JsonObjKeysValue.allowsearch = false;
			
			JsonObjKeysName.push(['allowfilter']);
			JsonObjKeysValue.allowfilter = false;
			
			JsonObjKeysName.push(['allowexport']);
			JsonObjKeysValue.allowexport = false;
			
			JsonObjKeysName.push(['allowadd']);
			JsonObjKeysValue.allowadd = false;
			
			JsonObjKeysName.push(['allowedit']);
			JsonObjKeysValue.allowedit = false;
			
			JsonObjKeysName.push(['alloweditrow']);
			JsonObjKeysValue.alloweditrow = false;
			
			JsonObjKeysName.push(['alloweditcell']);
			JsonObjKeysValue.alloweditcell = false;
			
			JsonObjKeysName.push(['allowdelete']);
			JsonObjKeysValue.allowdelete = false;
			
			JsonObjKeysName.push(['CheckColumn']);
			JsonObjKeysValue.CheckColumn = false;
			
			JsonObjKeysName.push(['NumberColumn']);
			JsonObjKeysValue.NumberColumn = false;
			
			JsonObjKeysName.push(['ActionColumn']);
			JsonObjKeysValue.ActionColumn = false;
			
			JsonObjKeysName.push(['ActionTrueFalseColumn']);
			JsonObjKeysValue.ActionTrueFalseColumn = false;
			
			JsonObjKeysName.push(['DectailColumn']);
			JsonObjKeysValue.DectailColumn = true;
			
			JsonObjKeysName.push(['DeleteColumn']);
			JsonObjKeysValue.DeleteColumn = false;
			
			JsonObjKeysName.push(['collapsible']);
			JsonObjKeysValue.collapsible = false;
			
			JsonObjKeysName.push(['columnWidthSplit']);
			JsonObjKeysValue.columnWidthSplit = '0,50,200';
			
			JsonObjKeysName.push(['columnDefaultVisible']);
			JsonObjKeysValue.columnDefaultVisible = false;
			
			JsonObjKeysName.push(['toolbarVisible']);
			JsonObjKeysValue.toolbarVisible = true;
			
			JsonObjKeysName.push(['columnGroup']);
			JsonObjKeysValue.columnGroup = 'CODICE';
			
			JsonObjKeysName.push(['orderField']);
			JsonObjKeysValue.orderField = 'RIGA';
			
			JsonObjKeysName.push(['groupStartCollapsed']);
			JsonObjKeysValue.groupStartCollapsed = true;
			
			JsonObjKeysName.push(['groupField']);
			JsonObjKeysValue.groupField = 'ID';
			
			JsonObjKeysName.push(['groupSummary']);
			JsonObjKeysValue.groupSummary = false;
			
			JsonObjKeysName.push(['summary']);
			JsonObjKeysValue.summary = false;
			
			JsonObjKeysName.push(['summaryField']);
			JsonObjKeysValue.summaryField = 'VALORE';
			
			JsonObjKeysName.push(['enumerateField']);
			JsonObjKeysValue.enumerateField = 'RIGA';
			
			JsonObjKeysName.push(['goToLastRow']);
			JsonObjKeysValue.goToLastRow = false;			
		}
		
		if ((result.xtype.indexOf('combo') > 0 )){
			
			JsonObjKeysName.push(['defaultValue']);
			JsonObjKeysValue.defaultValue = '1';
			
			JsonObjKeysName.push(['queryMode']);
			JsonObjKeysValue.queryMode = 'remote';
			
			JsonObjKeysName.push(['queryParam']);
			JsonObjKeysValue.queryParam = 'searchStr';
			
			JsonObjKeysName.push(['datasource']);
			JsonObjKeysValue.datasource = 'ESEMPIO';
			
			JsonObjKeysName.push(['datasourcetype']);
			JsonObjKeysValue.datasourcetype = 'ESEMPIO';
			
			JsonObjKeysName.push(['valueField']);
			JsonObjKeysValue.valueField = 'ID';
			
			JsonObjKeysName.push(['displayField']);
			JsonObjKeysValue.displayField = 'DESCRIZIONE';
			
			JsonObjKeysName.push(['queryField']);
			JsonObjKeysValue.queryField = 'displayField';
			
			JsonObjKeysName.push(['editable']);
			JsonObjKeysValue.editable = false;
					
			JsonObjKeysName.push(['typeAhead']);
			JsonObjKeysValue.typeAhead = false;
			
			JsonObjKeysName.push(['minChars']);
			JsonObjKeysValue.minChars = 2;
			
			JsonObjKeysName.push(['isnotinlist']);
			JsonObjKeysValue.isnotinlist = false;
			
			JsonObjKeysName.push(['isnotinlistField']);
			JsonObjKeysValue.isnotinlistField = 'DESCRIZIONE';
			
			JsonObjKeysName.push(['loadAll']);
			JsonObjKeysValue.loadAll = true;
		}
				
		if ((result.xtype == 'dynamiccombobutton') || (result.xtype == 'dynamicbutton')){
			JsonObjKeysName.push(['datasource']);
			JsonObjKeysValue.datasource = 'ESEMPIO';
			
			JsonObjKeysName.push(['datasourcetype']);
			JsonObjKeysValue.datasourcetype = 'ESEMPIO';
			
			JsonObjKeysName.push(['valueField']);
			JsonObjKeysValue.valueField = 'ID';
			
			JsonObjKeysName.push(['displayField']);
			JsonObjKeysValue.displayField = 'DESCRIZIONE';
			
			JsonObjKeysName.push(['fontColor']);
			JsonObjKeysValue.fontColor = 'black';
			
			JsonObjKeysName.push(['backColor']);
			JsonObjKeysValue.backColor = 'red';
			
			JsonObjKeysName.push(['iconColor']);
			JsonObjKeysValue.iconColor = 'white';
			
			JsonObjKeysName.push(['iconField']);
			JsonObjKeysValue.iconField = 'AWICON';
			
			JsonObjKeysName.push(['imageField']);
			JsonObjKeysValue.imageField = 'IMMAGINE';
			
			JsonObjKeysName.push(['iconAW']);
			JsonObjKeysValue.iconAW = 'fa-external-link';
	
			JsonObjKeysName.push(['buttonHeight']);
			JsonObjKeysValue.buttonHeight = 100;
			
			JsonObjKeysName.push(['buttonWidth']);
			JsonObjKeysValue.buttonWidth = 100;
		}
		
		if (result.xtype == 'button'){
			JsonObjKeysName.push(['procremoteonclick']);
			JsonObjKeysValue.procremoteonclick = 0;
			
			JsonObjKeysName.push(['iconCls']);
			JsonObjKeysValue.iconCls = 'x-fa fa-refresh';
		}
		
		if (result.xtype == 'dynamicbutton'){
			JsonObjKeysName.push(['datasource']);
			JsonObjKeysValue.datasource = 'ESEMPIO';
			
			JsonObjKeysName.push(['datasourcetype']);
			JsonObjKeysValue.datasourcetype = 'ESEMPIO';
			
			JsonObjKeysName.push(['valueField']);
			JsonObjKeysValue.valueField = 'ID';
			
			JsonObjKeysName.push(['displayField']);
			JsonObjKeysValue.displayField = 'DESCRIZIONE';
			
			JsonObjKeysName.push(['procremoteonclick']);
			JsonObjKeysValue.procremoteonclick = 0;
			
			JsonObjKeysName.push(['fieldLabel']);
			JsonObjKeysValue.fieldLabel = 'btnDescription';
			
			JsonObjKeysName.push(['fontColor']);
			JsonObjKeysValue.fontColor = 'white';
			
			JsonObjKeysName.push(['backColor']);
			JsonObjKeysValue.backColor = 'red';
		}
		
		if ((result.xtype == 'numberfield') || (result.xtype == 'currencyfield')) {
			JsonObjKeysName.push(['decimalPrecision']);
			JsonObjKeysValue.decimalPrecision = 2;
		}
		
		if ((result.xtype == 'dynamictreegrid') || (result.xtype == 'dynamictreecombo')){
			JsonObjKeysValue.datasourcetype = 'TREE';
			
			JsonObjKeysName.push(['parentidname']);
			JsonObjKeysValue.parentidname = 'ID_PARENT';
			
			JsonObjKeysName.push(['childrenidname']);
			JsonObjKeysValue.childrenidname = 'ID';
			
			JsonObjKeysName.push(['parentidstart']);
			JsonObjKeysValue.parentidstart = '0';
			
			JsonObjKeysName.push(['rootVisible']);
			JsonObjKeysValue.rootVisible = true;
			
			JsonObjKeysName.push(['waytoexpand']);
			JsonObjKeysValue.waytoexpand = 'down';
		}
		
		if (result.xtype.substring(0, 3) == 'kpi'){
			JsonObjKeysName.push(['datasource']);
			JsonObjKeysValue.datasource = 'ESEMPIO';
			
			JsonObjKeysName.push(['datasourcetype']);
			JsonObjKeysValue.datasourcetype = 'ESEMPIO';
			
			JsonObjKeysName.push(['valueField']);
			JsonObjKeysValue.valueField = 'ID';
			
			JsonObjKeysName.push(['displayField']);
			JsonObjKeysValue.displayField = 'DESCRIZIONE';
			
			JsonObjKeysName.push(['layoutsearchid']);
			JsonObjKeysValue.layoutsearchid = '';
			
			JsonObjKeysName.push(['layouteditorid']);
			JsonObjKeysValue.layouteditorid = '';
			
			JsonObjKeysName.push(['layouteditorWindowMode']);
			JsonObjKeysValue.layouteditorWindowMode = 'acWindowNormal';
			
			JsonObjKeysName.push(['fieldLabel']);
			JsonObjKeysValue.fieldLabel = 'KpiDescription';
		}
		
		if (result.xtype == 'dynamicbarcode'){
			JsonObjKeysName.push(['bcformat']);
			JsonObjKeysValue.bcformat = 'CODE39';
			
			JsonObjKeysName.push(['bcwidth']);
			JsonObjKeysValue.bcwidth = '1';
			
			JsonObjKeysName.push(['bcdisplayValue']);
			JsonObjKeysValue.bcdisplayValue = true;
		}
		
		if (result.xtype == 'dynamicimage'){
			JsonObjKeysName.push(['procremoteonselect']);
			JsonObjKeysValue.procremoteonselect = '0';
			
			JsonObjKeysName.push(['pdfExtractorMode']);
			JsonObjKeysValue.pdfExtractorMode = true;
		}
		
		if (result.xtype == 'dynamicgantt'){
			JsonObjKeysName.push(['datasourcetype_task']);
			JsonObjKeysValue.datasourcetype_task = "GANTTTASK";
			JsonObjKeysName.push(['datasourcetype_task']);
			JsonObjKeysValue.datasourcetype_task = "SELECT ";
			
			JsonObjKeysName.push(['startDateField']);
			JsonObjKeysValue.startDateField = '0';
			
			JsonObjKeysName.push(['endDateField']);
			JsonObjKeysValue.endDateField = '0';
			
			JsonObjKeysName.push(['percentDoneField']);
			JsonObjKeysValue.percentDoneField = 'MPS_COMPLETE';
			
			JsonObjKeysName.push(['durationField']);
			JsonObjKeysValue.durationField = 'MPS_DURATION';
			
			JsonObjKeysName.push(['datasourcetype_dependency']);
			JsonObjKeysValue.datasourcetype_dependency = 'GANTTDEPENCY';
		
			JsonObjKeysName.push(['datasource_dependency']);
			JsonObjKeysValue.datasource_dependency = "SELECT";
			
			JsonObjKeysName.push(['toField']);
			JsonObjKeysValue.toField = "To";
			JsonObjKeysName.push(['fromField']);
			JsonObjKeysValue.fromField = "From";
			
			JsonObjKeysName.push(['childrenidname']);
			JsonObjKeysValue.childrenidname = "ID";
			JsonObjKeysName.push(['parentidname']);
			JsonObjKeysValue.parentidname = "MPS_ID_PARENT";
			JsonObjKeysName.push(['parentidstart']);
			JsonObjKeysValue.parentidstart = "0";
			
			JsonObjKeysName.push(['datasourcetype_calendar']);
			JsonObjKeysValue.datasourcetype_calendar = "GANTTCALENDAR";
			JsonObjKeysName.push(['datasource_calendar']);
			JsonObjKeysValue.datasource_calendar = "SELECT ";
			
			JsonObjKeysName.push(['calendarStartTimeField']);
			JsonObjKeysValue.calendarStartTimeField = "START";
			JsonObjKeysName.push(['calendarEndTimeField']);
			JsonObjKeysValue.calendarEndTimeField = "END";
			
			JsonObjKeysName.push(['calendarDataField']);
			JsonObjKeysValue.calendarDataField = "DATA";
			
			JsonObjKeysName.push(['calendarKeyField']);
			JsonObjKeysValue.calendarKeyField = "ID";
			
			JsonObjKeysName.push(['calendarResourceKeyField']);
			JsonObjKeysValue.calendarResourceKeyField = "MPS_CT_RESOURCES";
			
			JsonObjKeysName.push(['calendarResourceNameField']);
			JsonObjKeysValue.calendarResourceNameField = "MPS_CT_RESOURCES";
			
			JsonObjKeysName.push(['datasourcetype_resource']);
			JsonObjKeysValue.datasourcetype_resource = "GANTTRESOURCE";
			
			JsonObjKeysName.push(['datasource_resource']);
			JsonObjKeysValue.datasource_resource = "SELECT";
			
			JsonObjKeysName.push(['resourceNameField']);
			JsonObjKeysValue.resourceNameField = "DESCRIZIONE";
			
			JsonObjKeysName.push(['datasource']);
			JsonObjKeysValue.datasource = "";
			JsonObjKeysName.push(['datasourcetype']);
			JsonObjKeysValue.datasourcetype = "NONE";
		}
		
		if (result.xtype == 'dynamicscheduler'){
			JsonObjKeysName.push(['datasourcetype_task']);
			JsonObjKeysValue.datasourcetype_task = "GANTTTASK";
			JsonObjKeysName.push(['datasourcetype_task']);
			JsonObjKeysValue.datasourcetype_task = "SELECT";
			
			JsonObjKeysName.push(['startDateField']);
			JsonObjKeysValue.startDateField = '0';
			
			JsonObjKeysName.push(['endDateField']);
			JsonObjKeysValue.endDateField = '0';
			
			JsonObjKeysName.push(['percentDoneField']);
			JsonObjKeysValue.percentDoneField = 'MPS_COMPLETE';
			
			JsonObjKeysName.push(['durationField']);
			JsonObjKeysValue.durationField = 'MPS_DURATION';
			
			JsonObjKeysName.push(['datasourcetype_dependency']);
			JsonObjKeysValue.datasourcetype_dependency = 'GANTTDEPENCY';
		
			JsonObjKeysName.push(['datasource_dependency']);
			JsonObjKeysValue.datasource_dependency = "SELECT";
			
			JsonObjKeysName.push(['toField']);
			JsonObjKeysValue.toField = "To";
			JsonObjKeysName.push(['fromField']);
			JsonObjKeysValue.fromField = "From";
			
			JsonObjKeysName.push(['childrenidname']);
			JsonObjKeysValue.childrenidname = "ID";
			JsonObjKeysName.push(['parentidname']);
			JsonObjKeysValue.parentidname = "MPS_ID_PARENT";
			JsonObjKeysName.push(['parentidstart']);
			JsonObjKeysValue.parentidstart = "0";
			
			JsonObjKeysName.push(['datasourcetype_calendar']);
			JsonObjKeysValue.datasourcetype_calendar = "GANTTCALENDAR";
			JsonObjKeysName.push(['datasource_calendar']);
			JsonObjKeysValue.datasource_calendar = "SELECT ";
			
			JsonObjKeysName.push(['calendarStartTimeField']);
			JsonObjKeysValue.calendarStartTimeField = "START";
			JsonObjKeysName.push(['calendarEndTimeField']);
			JsonObjKeysValue.calendarEndTimeField = "END";
			
			JsonObjKeysName.push(['calendarDataField']);
			JsonObjKeysValue.calendarDataField = "DATA";
			
			JsonObjKeysName.push(['calendarKeyField']);
			JsonObjKeysValue.calendarKeyField = "ID";
			
			JsonObjKeysName.push(['calendarResourceKeyField']);
			JsonObjKeysValue.calendarResourceKeyField = "MPS_CT_RESOURCES";
			
			JsonObjKeysName.push(['calendarResourceNameField']);
			JsonObjKeysValue.calendarResourceNameField = "MPS_CT_RESOURCES";
			
			JsonObjKeysName.push(['datasourcetype_resource']);
			JsonObjKeysValue.datasourcetype_resource = "GANTTRESOURCE";
			
			JsonObjKeysName.push(['datasource_resource']);
			JsonObjKeysValue.datasource_resource = "SELECT";
			
			JsonObjKeysName.push(['resourceNameField']);
			JsonObjKeysValue.resourceNameField = "DESCRIZIONE";
			
			JsonObjKeysName.push(['datasource']);
			JsonObjKeysValue.datasource = "";
			
			JsonObjKeysName.push(['datasourcetype']);
			JsonObjKeysValue.datasourcetype = "NONE";
			
			JsonObjKeysName.push(['viewPreset']);
			JsonObjKeysValue.viewPreset = 'weekAndDay'; // hourAndDay,weekAndDay,weekAndDayLetter,weekAndMonth,weekDateAndMonth,monthAndYear,year
		}
		
		/*remove duplicates
		const uniqueArray = JsonObjKeysName.arr.filter((value, index) => {
		  const _value = JSON.stringify(value);
		  return index === JsonObjKeysName.arr.findIndex(JsonObjKeysName => {
			return JSON.stringify(JsonObjKeysName) === _value;
		  });
		});
		*/
		//order property
		JsonObjKeysName.sort();
		
		newPropertyComboStore.loadData(JsonObjKeysName,false);
	}
}
Custom.ObjAddAll = function(){
	var DataSourceFieldStore = Ext.StoreManager.lookup('DataSourceFieldStore');
	DataSourceFieldStore.load({ params: { modeldef:true, datasource: CurrentLayoutDataSource, datasourcetype: CurrentLayoutDataSourceType, limit: this.rowlimit, layoutid: CurrentLayoutId, 	} });
	var posx = 20;
	var posy = 20;
	var shiftx = 0;
	var shifty = 0;
	var countfield =1;
	
	if(CurrentLastPanelId != ''){
		//per ogni field creo l'oggetto nel panel selezionato	
		DataSourceFieldStore.each(function(record,idx){
			if (countfield < 269) {
				CurrentObjectId = '';
				CurrentObjectName =  Custom.ObjAdd(record.data, posx + (300 * shiftx), posy + (40 *  shifty), CurrentLastPanelId);
			}
			shifty = shifty +1;
			if (shifty > 16) {shifty = 0; shiftx = shiftx + 1;}
			countfield = countfield + 1;
		});
			
		//aggiorno visualizzazione
		log('rendered');
		Custom.FormRender();
		
		//aggiorno propertygrid
		Custom.ObjInPropertyGrid(CurrentObjectName);
		return true;
	}else{
		Ext.Msg.alert("Errore oggetto panel nn riconosciuto","oggetto panel");
		return false;
	}
}
Custom.ObjAddPanel = function(ObjectExt){
	var result = getSubItemFromName(CurrentLayoutJson, ObjectExt);
	var keys = {};
	if (result.xtype == 'tabpanel'){
		keys.xtype = 'panel';
		keys.name = "panel" + 1000 + Math.floor((Math.random() * 100) + 1);
		keys.layout = {	"type" : "absolute"	};
		keys.title = keys.name;
		keys.items = [{}];
		result.items[result.items.length++] = keys;
	}else{
		Ext.Msg.alert("Errore, seleziona un tabpanel","oggetto tabpanel");
	}
}

Custom.ProcessOpen = function (ProcessId) {
	log('LoadProcess');
	Custom.openLinkInNewWindow('/procdesigner/index.php?id=' + ProcessId);
}

//*************************************************************************************************************//
//				SQL Builder
var qbWindow = Ext.create('VisualSQLQueryBuilder');
Ext.define('EditorSQL', {
	extend: 'Ext.form.field.Picker',
	alias: 'widget.editorsql',
	editable: true,
	onTriggerClick: function() {
		qbWindow.on({
			applySQL: function(vartext) {	
				if ((CurrentObjectName == 'Form00') ){
					//Form00
					CurrentLayoutDataSource = vartext;
					CurrentLayoutDataSourceType = 'SELECT';
					CurrentLayoutDataSourceField = 'ID';
					//update elenco field
					var DataSourceFieldStore = Ext.StoreManager.lookup('DataSourceFieldStore');
					DataSourceFieldStore.load({ params: { modeldef:true, datasource: CurrentLayoutDataSource, datasourcetype: CurrentLayoutDataSourceType, limit: this.rowlimit, layoutid: CurrentLayoutId, } });
					var ComDictionaryDBStore = Ext.StoreManager.lookup('ComDictionaryDBStore');
					ComDictionaryDBStore.load({ params: { modeldef:true, datasource: CurrentLayoutDataSource, datasourcetype: CurrentLayoutDataSourceType, limit: this.rowlimit, layoutid: CurrentLayoutId, } });
				}else{	
					var obj = getSubItemFromName(CurrentLayoutJson,CurrentObjectName);
					log('OggettoModificatoSQLDesigner=' + 'datasource' + 'Value=' + vartext);
					obj['datasource'] = vartext;
					//propertygrid
					Custom.ObjInPropertyGrid(CurrentObjectName);
				}
			}
		});
		qbWindow.show();	
		var obj = getSubItemFromName(CurrentLayoutJson,CurrentObjectName);
		qbWindow.setValue(obj['datasource']);
	}
});

//*************************************************************************************************************//
//				Array Builder
var gdWindow = Ext.create('Ext.window.Window', {
	title: 'Array Builder',
	height: 600,
	width: 600,
	name: 'windowarray',
	layout:{type: 'absolute'},
	items: [{
		x: 5,
		y: 5,
		name: 'CmdSend',
		xtype: 'button',
		text: 'Send'
	},{
		x: 55,
		y: 5,
		name: 'CmdCancel',
		xtype: 'button',
		text: 'Cancel'
	},{
		xtype: 'propertygrid',
		x: 5,
		y: 40,
		height: 400,
		id: 'dynamicgridarray',
		name: 'dynamicgridarray',
		anchor: '-5'  
	}]
})
gdWindow.on({
    applyArray: function(vartext) {		
	}
});
Ext.define('EditorItems', {
	extend: 'Ext.form.field.Picker',
	alias: 'widget.editoritems',
	editable: true,
	onTriggerClick: function() {
		//gdWindow.show();
		var obj = getSubItemFromName(CurrentLayoutJson,CurrentObjectName);
		var result = obj.items;
		//var dynamicgridarray = Ext.getCmp('dynamicgridarray');
		//dynamicgridarray.setSource(sumArraysInObject(clone(objitems)));
			
		if (result){
			var PropertyGrid = Ext.getCmp('PropertyGrid');
			PropertyGrid.setSource(sumArraysInObject(clone(result)));
		}
	}
});
Ext.define('EditorLayout', {
	extend: 'Ext.form.field.Picker',
	alias: 'widget.editorlayout',
	editable: true,
	onTriggerClick: function() {
		//gdWindow.show();
		var obj = getSubItemFromName(CurrentLayoutJson,CurrentObjectName);
		var result = obj.layout;
		//var dynamicgridarray = Ext.getCmp('dynamicgridarray');
		//dynamicgridarray.setSource(sumArraysInObject(clone(result)));
		
		if (result){
			var PropertyGrid = Ext.getCmp('PropertyGrid');
			PropertyGrid.setSource(sumArraysInObject(clone(result)));
		}
	}
});

//*************************************************************************************************************//
//				CODE Builder
/* var cbWindow = Ext.create('VisualCodeBuilder');
Ext.define('EditorSQL', {
	extend: 'Ext.form.field.Picker',
	alias: 'widget.editorcode',
	editable: true,
	onTriggerClick: function() {
		cbWindow.show();	
		var obj = getSubItemFromName(CurrentLayoutJson,CurrentObjectName);
		cbWindow.setValue(obj['emptyText']);
	}
});
cbWindow.on({
    applyCODE: function(vartext) {			
		var obj = getSubItemFromName(CurrentLayoutJson,CurrentObjectName);
		log('OggettoModificatoSQLDesigner=' + 'emptyText' + 'Value=' + vartext);
		obj['emptyText'] = vartext;
		
		//propertygrid
		Custom.ObjInPropertyGrid(CurrentObjectName);
	}
});
*/

//*************************************************************************************************************//
//				MAIN
Ext.onReady(function(){
	Ext.QuickTips.init();
	Ext.tip.QuickTipManager.init();
	Ext.setGlyphFontFamily('FontAwesome');
	Ext.util.Format.thousandSeparator = "'";
	Ext.util.Format.decimalSeparator = '.';

/* ----- LOAD FORM --------------------------------------------------*/
	CurrentLayoutId = Custom.getURLVar('id');
	Custom.LayoutLoad(CurrentLayoutId);

/* ----- PROPERTY PANEL ---------------------------------------------*/
	var newPropertyComboStore = new Ext.data.ArrayStore({
		id: 'newPropertyComboStore',
		autoDestroy: true,
		fields: ['propertyname'],
		remoteSort: false, //true for server sorting
		sorters: [{
			property: 'propertyname',
			direction: 'ASC' // or 'ASC'
		}],
	});
	var newPropertyCombo =  Ext.create('Ext.form.field.ComboBox', {
		id: 'newPropertyCombo',
		store: newPropertyComboStore,
		displayField: 'propertyname',
		valueField: 'propertyname',
		queryMode: 'local',
		forceSelection: true,
		editable: true, 
		typeAhead: true,
		typeAheadDelay: 100,
		minChars: 2,
		triggerAction: 'all',
		listeners: {
			change: function (field, newValue, oldValue) {
				log(newValue);
				
				result = getSubItemFromName(CurrentLayoutJson, CurrentObjectName);
				result[newValue] = JsonObjKeysValue[newValue];
				if (newValue == 'allowBlank'){ result.blankText = 'Errore, Campo Richiesto';}
				if (newValue == 'regex'){ result.regexText = 'Errore, Campo Non Formattato Correttamente';}
				if (result.xtype == 'datefield') { result.invalidText = 'Errore, Campo Non Formattato Correttamente';}
						
				Custom.ObjInPropertyGrid(CurrentObjectName);
				newPropertyCombo.setValue('');
			},
			scope: this
		}
	});
	
	var selPropertyComboStore = new Ext.data.ArrayStore({
		id: 'selPropertyComboStore',
		autoDestroy: true,
		fields: ['propertyname'],
		remoteSort: false, //true for server sorting
		sorters: [{
			property: 'propertyname',
			direction: 'ASC' // or 'ASC'
		}],
	});
	var selPropertyCombo =  Ext.create('Ext.form.field.ComboBox', {
		id: 'selPropertyCombo',
		store: selPropertyComboStore,
		displayField: 'propertyname',
		valueField: 'propertyname',
		queryMode: 'local',
		forceSelection: true,
		editable: true, 
		typeAhead: true,
		typeAheadDelay: 100,
		minChars: 2,
		triggerAction: 'all',
		listeners: {
			change: function (field, newValue, oldValue) {
				log(newValue);
				var centerView = MainViewPort.getComponent('centerViewPortId');
				var DesignPanel = centerView.getComponent('DesignPanel');
				CurrentObjectName = newValue; // getSubItemFromName(CurrentLayoutJson, newValue);
				CurrentObjectId = Ext.ComponentQuery.query('[name=' + newValue + ']')[0];
				//CurrentObjectId = DesignPanel.getForm().findField(newValue);
				Custom.ObjInPropertyGrid(CurrentObjectName);
			},
			scope: this
		}
	});
	
	var DataSourceFieldStore = Ext.create('Ext.data.Store', {
		fields: ['id', 'text', 'objname','objxtype'],
		id:'DataSourceFieldStore',
		autoLoad: false, 
		remoteSort: false, 
		sorters: [{
			property: 'text',
			direction: 'ASC' // or 'ASC'
		}],
		proxy: {
			type: 'ajax',
			url: '../includes/io/dictionarydbfield.php?layoutid=' + CurrentLayoutId,
			extraParams:{ },
			reader: {
				type: 'json',
				rootProperty : '',
			}
		},
		listeners: {
			load: function (data) {
			}
		}
	});
	
	var XTypeStore = Ext.create('Ext.data.Store', {
		fields: ['objxtype'],
		autoLoad: true,
		remoteSort: false, 
		sorters: [{
			property: 'objxtype',
			direction: 'ASC' // or 'ASC'
		}],
		proxy: {
			type: 'ajax',
			url: '../includes/io/fields.json',
			reader: {
				type: 'json',
				rootProperty: '',
			}
		},
		listeners: {
			load: function (data) {
			}
		}
	});

	var ProcedureStore = Ext.create('Ext.data.Store', {
		fields: ['id', 'text'],
		autoLoad: true,
		remoteSort: false, 
		sorters: [{
			property: 'text',
			direction: 'ASC' // or 'ASC'
		}],
		proxy: {
			type: 'ajax',
			url: '../includes/io/dictionarycmd.php',
			reader: {
				type: 'json',
				rootProperty: '',
			}
		}
	});
	var LayoutStore = Ext.create('Ext.data.Store', {
		fields: ['id', 'text'],
		autoLoad: true,
		remoteSort: false, 
		sorters: [{
			property: 'text',
			direction: 'ASC' // or 'ASC'
		}],
		proxy: {
			type: 'ajax',
			url: '../includes/io/dictionarylayout.php',
			reader: {
				type: 'json',
				rootProperty: '',
			}
		}
	});
	var wayToExpandStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"down", "NOME":"DOWN: (verso figli)"},
				{"ID":"up", "NOME":"UP: (verso padri)"},
				{"ID":"mix", "NOME":"MIX: (verso padri e figli)"}
			]
	});
	var labelAlignStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"top", "NOME":"TOP: Sopra"},
				{"ID":"right", "NOME":"RIGHT: Destra"},
				{"ID":"left", "NOME":"LEFT: Sinistra"},
			]
	});
	var inputTypeStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"text", 	"NOME":"text"},
				{"ID":"password", "NOME":"password"},
				{"ID":"url", 	"NOME":"url"},
				{"ID":"email", 	"NOME":"email"}
			]
	});
	var DataSourceTypeStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"PSV", "NOME":"PSV"},
				{"ID":"PSV2", "NOME":"PSV2"},
				{"ID":"CSV", "NOME":"CSV"},
				{"ID":"CSV2", "NOME":"CSV2"},
				{"ID":"TABLE", "NOME":"TABLE"},
				{"ID":"PROC", "NOME":"PROC"},
				{"ID":"SELECT", "NOME":"SELECT"},
				{"ID":"CODE", "NOME":"CODE"},
				{"ID":"TREE", "NOME":"TREE"},
				{"ID":"CALENDAR", "NOME":"CALENDAR"},
				{"ID":"DIR", "NOME":"DIR"},
				{"ID":"WF", "NOME":"WF"},
				{"ID":"ESEMPIO", "NOME":"ESEMPIO"},
				{"ID":"SCHEMA", "NOME":"SCHEMA"},
				{"ID":"GMAP", "NOME":"GMAP"},
				{"ID":"GANTT", "NOME":"GANTT"},
				{"ID":"IMAP", "NOME":"IMAP"}				
			]
	});
	var FlexStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":1, "NOME":"1x1/n Dimension"},
				{"ID":2, "NOME":"1x2/n Dimension"},
				{"ID":3, "NOME":"1x3/n Dimension"},
				{"ID":4, "NOME":"1x4/n Dimension"}
			]
	});
	var TypeStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"absolute", "NOME":"Absolute"},
				{"ID":"hbox", "NOME":"Resp-Horizontal"},
				{"ID":"vbox", "NOME":"Resp-Vertical"},
				{"ID":"accordion", "NOME":"Resp-Accordion"},
				{"ID":"anchor", "NOME":"Resp-Anchor"},
				{"ID":"border", "NOME":"Resp-Border"},
				{"ID":"card", "NOME":"Resp-Card"},
				{"ID":"fit", "NOME":"Resp-Fit"},
				{"ID":"table", "NOME":"Resp-Table"},
				{"ID":"table", "NOME":"Resp-Table"}
			]
	});
	var AlignStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"stretch","NOME":"Stretch"},
				{"ID":"center",	"NOME":"Center"},
				{"ID":"left", 	"NOME":"Left"},
				{"ID":"right",	"NOME":"Right"}
			]
	});
	var summaryTypeStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"count",	"NOME":"count"},
				{"ID":"sum",	"NOME":"sum"},
				{"ID":"min", 	"NOME":"min"},
				{"ID":"max",	"NOME":"max"},
				{"ID":"average","NOME":"average"}
			]
	});
	var bcformatStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"CODE39",		"NOME":"CODE39"},
				{"ID":"EAN13",		"NOME":"EAN13"},
				{"ID":"EAN8", 		"NOME":"EAN8"},
				{"ID":"EAN5",		"NOME":"EAN5"},
				{"ID":"EAN2",		"NOME":"EAN2"},
				{"ID":"EAN",		"NOME":"EAN"},
				{"ID":"ITF14", 		"NOME":"ITF14"},
				{"ID":"MSI",		"NOME":"MSI"},
				{"ID":"MSI10",		"NOME":"MSI10"},
				{"ID":"MSI11",		"NOME":"MSI11"},
				{"ID":"MSI1010",	"NOME":"MSI1010"},
				{"ID":"MSI1110",	"NOME":"MSI1110"},
				{"ID":"CODE128", 	"NOME":"CODE128"},
				{"ID":"UPC",		"NOME":"UPC"},
				{"ID":"pharmacode",	"NOME":"pharmacode"},
				{"ID":"codabar",	"NOME":"codabar"}
			]
	});
	var LayoutSkinStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"vbox",		"NOME":"vbox"},
				{"ID":"hbox",		"NOME":"hbox"},
				{"ID":"column", 	"NOME":"column"},
				{"ID":"auto", 		"NOME":"auto"},
				{"ID":"absolute",	"NOME":"absolute"}
			]
	});
	var LayoutVtypeStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"email",		"NOME":"email"},
				{"ID":"emailseries","NOME":"emailseries"},
				{"ID":"alpha",		"NOME":"alpha"},
				{"ID":"alphanum",	"NOME":"alphanum"},
				{"ID":"url",		"NOME":"url"},
				{"ID":"IPAddress",	"NOME":"IPAddress"},
				{"ID":"IBAN",		"NOME":"IBAN"},
				{"ID":"time",		"NOME":"time"}
			]
	});
	var WindowModeStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"acDialog", 		"NOME":"acDialog - Indipendent"},
				{"ID":"acDialogModal", 	"NOME":"acDialogModal - Modal"},
				{"ID":"acWindowNormal",	"NOME": "acWindowNormal - Dipendent"}
			]
	});
	var viewPresetStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"secondAndMinute", "NOME":"secondAndMinute"},
				{"ID":"minuteAndHour", 	"NOME":"minuteAndHour"},
				{"ID":"hourAndDay", 	"NOME":"hourAndDay"},
				{"ID":"dayAndWeek", 	"NOME":"hourAndDay"},
				{"ID":"weekAndDay", 	"NOME":"weekAndDay"},
				{"ID":"weekAndDayLetter","NOME":"weekAndDayLetter"},
				{"ID":"weekAndMonth",	"NOME":"weekAndMonth"},
				{"ID":"weekDateAndMonth","NOME":"weekDateAndMonth"},
				{"ID":"monthAndYear","NOME":"monthAndYear"},
				{"ID":"year",			"NOME":"year"},
				{"ID":"manyYears",		"NOME":"manyYears"},
				{"ID":"dayNightShift",	"NOME":"dayNightShift"}
			]
	});
	var queryFieldStore = Ext.create('Ext.data.Store', {
		fields: ['ID', 'NOME'],
		data : [
				{"ID":"innerSearch", 	"NOME":"innerSearch (derived Obj)"},
				{"ID":"fieldsSearch", 	"NOME":"fieldsSearch (field in SELECT)"},
				{"ID":"displayField",	"NOME": "displayField (field in displayField)"}
			]
	});
	var PropertyGrid = Ext.create('Ext.grid.property.Grid', {
		title			: 'Parameters',
		id				: 'PropertyGrid',
		split			: true,
		source			: '',
		tbar			: ['Sel :', selPropertyCombo ],
		bbar            : ['Add :', newPropertyCombo ],
		newPropertyCombo: newPropertyCombo,
		selPropertyCombo: selPropertyCombo,
		groupingConfig	: {
            groupHeaderTpl: 'Settings: {name}',
            disabled: false
        },
		sourceConfig	: {  
							x:						{type: 'number'},
							y:						{type: 'number'},
							minlength:				{type: 'number'},
							maxlength:				{type: 'number'},
							backColor:				{editor: Ext.create('dynamiccolor', {}),
												},
							iconColor:				{editor: Ext.create('dynamiccolor', {}),
												},
							fontColor:				{editor: Ext.create('dynamiccolor', {}),
												},
							color:					{editor: Ext.create('dynamiccolor', {}),
												},
							procremoteonclick:  	{editor: Ext.create('Ext.form.ComboBox', {	store: ProcedureStore,
																								minChars: 2,
																								typeAhead: true,
																								queryMode: 'remote',
																								displayField: 'text',
																								valueField: 'id',
																								plugins: ['remotetolocalcombo'],
																								triggers: {
																									layouteditor: {
																										cls: 'x-fa fa-expand',
																										tooltip: 'Dectail',
																										hidden: false,
																										weight: +1, // negative to place before default triggers
																										handler: function() {
																											Custom.openLinkInNewWindow('../sourcedesigner/index.php?layoutid=aaaproc&ID=' + this.getValue());
																										}
																									},
																								}
																							}),
												},
							procremoteonselect:  	{editor: Ext.create('Ext.form.ComboBox', {	store: ProcedureStore,
																								minChars: 2,
																								typeAhead: true,
																								queryMode: 'remote',
																								displayField: 'text',
																								valueField: 'id',
																								plugins: ['remotetolocalcombo'],
																								triggers: {
																									layouteditor: {
																										cls: 'x-fa fa-expand',
																										tooltip: 'Dectail',
																										hidden: false,
																										weight: +1, // negative to place before default triggers
																										handler: function() {
																											Custom.openLinkInNewWindow('../sourcedesigner/index.php?layoutid=aaaproc&ID=' + this.getValue());
																										}
																									},
																								}
																							}),
												},
							procremoteonupdate:  	{editor: Ext.create('Ext.form.ComboBox', {	store: ProcedureStore,
																								minChars: 2,
																								typeAhead: true,
																								queryMode: 'remote',
																								displayField: 'text',
																								valueField: 'id',
																								plugins: ['remotetolocalcombo'],
																								triggers: {
																									layouteditor: {
																										cls: 'x-fa fa-expand',
																										tooltip: 'Dectail',
																										hidden: false,
																										weight: +1, // negative to place before default triggers
																										handler: function() {
																											Custom.openLinkInNewWindow('../sourcedesigner/index.php?layoutid=aaaproc&ID=' + this.getValue());
																										}
																									},
																								}
																							}),
												},
							ActionColumn:  			{editor: Ext.create('Ext.form.ComboBox', {	store: ProcedureStore,
																								minChars: 2,
																								typeAhead: true,
																								queryMode: 'remote',
																								displayField: 'text',
																								valueField: 'id',
																								plugins: ['remotetolocalcombo'],
																								triggers: {
																									layouteditor: {
																										cls: 'x-fa fa-expand',
																										tooltip: 'Dectail',
																										hidden: false,
																										weight: +1, // negative to place before default triggers
																										handler: function() {
																											Custom.openLinkInNewWindow('../sourcedesigner/index.php?layoutid=aaaproc&ID=' + this.getValue());
																										}
																									},
																								}
																							}),
												},
							ActionTrueFalseColumn:	{editor: Ext.create('Ext.form.ComboBox', {	store: ProcedureStore,
																								minChars: 2,
																								typeAhead: true,
																								queryMode: 'remote',
																								displayField: 'text',
																								valueField: 'id',
																								plugins: ['remotetolocalcombo'],
																								triggers: {
																									layouteditor: {
																										cls: 'x-fa fa-expand',
																										tooltip: 'Dectail',
																										hidden: false,
																										weight: +1, // negative to place before default triggers
																										handler: function() {
																											Custom.openLinkInNewWindow('../sourcedesigner/index.php?layoutid=aaaproc&ID=' + this.getValue());
																										}
																									},
																								}
																							}),
												},
							CheckColumn:			{editor: Ext.create('Ext.form.ComboBox', {	store: ProcedureStore,
																								queryMode: 'remote',
																								displayField: 'text',
																								valueField: 'id',
																								typeAhead: true,
																								plugins: ['remotetolocalcombo'],
																								triggers: {
																									layouteditor: {
																										cls: 'x-fa fa-expand',
																										tooltip: 'Dectail',
																										hidden: false,
																										weight: +1, // negative to place before default triggers
																										handler: function() {
																											Custom.openLinkInNewWindow('../sourcedesigner/index.php?layoutid=aaaproc&ID=' + this.getValue());
																										}
																									},
																								}
																							}),
												},
							datasourcetype : 		{editor: Ext.create('Ext.form.ComboBox', {	store: DataSourceTypeStore,
																								queryMode: 'remote',
																								displayField: 'NOME',
																								valueField: 'ID',
																								typeAhead: true,
																								plugins: ['remotetolocalcombo']
																							}),
												},
							datasourcefield : 		{editor: Ext.create('Ext.form.ComboBox', {	store: DataSourceFieldStore,
																								minChars: 2,
																								typeAhead: true,
																								queryMode: 'remote',
																								displayField: 'objfieldLabel',
																								valueField: 'objfieldLabel',
																								plugins: ['remotetolocalcombo']
																							}),
												},
							datasource: 			{editor: Ext.create('EditorSQL',		 {	selectOnFocus: true }),}, 
							layouteditorid:			{editor: Ext.create('Ext.form.ComboBox', {	store: LayoutStore,
																								minChars: 2,
																								typeAhead: true,
																								queryMode: 'remote',
																								displayField: 'text',
																								valueField: 'id',
																								plugins: ['remotetolocalcombo'],
																								triggers: {
																									layouteditor: {
																										cls: 'x-fa fa-expand',
																										tooltip: 'Dectail',
																										hidden: false,
																										weight: +1, // negative to place before default triggers
																										handler: function() {
																											Custom.openLinkInNewWindow('/formdesigner/index.php?id=' + this.getValue());
																										}
																									},
																								}
																							}),
												},
							layoutsearchid:			{editor: Ext.create('Ext.form.ComboBox', {	store: LayoutStore,
																								minChars: 2,
																								typeAhead: true,
																								queryMode: 'remote',
																								displayField: 'text',
																								valueField: 'id',
																								plugins: ['remotetolocalcombo'],
																								triggers: {
																									layouteditor: {
																										cls: 'x-fa fa-expand',
																										tooltip: 'Dectail',
																										hidden: false,
																										weight: +1, // negative to place before default triggers
																										handler: function() {
																											Custom.openLinkInNewWindow('/formdesigner/index.php?id=' + this.getValue());
																										}
																									},
																								}
																							}),
												},
							layouteditorWindowMode:	{editor: Ext.create('Ext.form.ComboBox', {	store: WindowModeStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							viewPreset:				{editor: Ext.create('Ext.form.ComboBox', {	store: viewPresetStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							queryField:				{editor: Ext.create('Ext.form.ComboBox', {	store: queryFieldStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							xtype: 					{editor: Ext.create('Ext.form.ComboBox', {	store: XTypeStore,
																								minChars: 2,
																								typeAhead: true,
																								queryMode: 'local',
																								displayField: 'objxtype',
																								valueField: 'objxtype'
																							}),
												},
							labelAlign: 			{editor: Ext.create('Ext.form.ComboBox', {	store: labelAlignStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							labelWidth:				{type: 'number'},
							waytoexpand: 			{editor: Ext.create('Ext.form.ComboBox', {	store: wayToExpandStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							iconAlign: 				{editor: Ext.create('Ext.form.ComboBox', {	store: labelAlignStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							flex: 					{editor: Ext.create('Ext.form.ComboBox', {	store: FlexStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							items:					{editor: Ext.create('EditorItems',		 {	selectOnFocus: true }),},
							layout:					{editor: Ext.create('Ext.form.ComboBox', {	store: LayoutSkinStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							layoutInternal:			{editor: Ext.create('Ext.form.ComboBox', {	store: LayoutSkinStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							vtype:					{editor: Ext.create('Ext.form.ComboBox', {	store: LayoutVtypeStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							type: 					{editor: Ext.create('Ext.form.ComboBox', {	store: TypeStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							align: 					{editor: Ext.create('Ext.form.ComboBox', {	store: AlignStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							inputType: 				{editor: Ext.create('Ext.form.ComboBox', {	store: inputTypeStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							renderInGridSummaryType:{editor: Ext.create('Ext.form.ComboBox', {	store: summaryTypeStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							bcformat:				{editor: Ext.create('Ext.form.ComboBox', {	store: bcformatStore,
																								queryMode: 'local',
																								displayField: 'NOME',
																								valueField: 'ID'
																							}),
												},
							bcfontSize:				{type: 'number'},
							bcwidth:				{type: 'number'},
							//emptyText: 			{editor: Ext.create('EditorCODE',		{ selectOnFocus: true }),}, 
							hiddenInForm: 			{type: 'boolean'},
							hiddenInGrid: 			{type: 'boolean'},
							lockedInGrid: 			{type: 'boolean'},
							loadAll: 				{type: 'boolean'},
							frame: 					{type: 'boolean'},
						 },
		listeners		: {
							propertychange:function(source, recordId, value, oldValue){
								//aggiorna property nel json della form
								var obj = getSubItemFromName(CurrentLayoutJson, CurrentObjectName);
								
								//aggiorna se è un cambio di xtype
								if (recordId == 'xtype'){
									if ((obj["xtype"] == 'textfield') && (value.indexOf('combo') != -1)) {
										//conversione proprieta
										obj["datasource"] = "ESEMPIO";
										obj["datasourcetype"] = "ESEMPIO";
										obj["datasourcefield"] = "CT_TABLE";
										obj["valueField"] = "ID";
										obj["displayField"] = "DESCRIZIONE";
										obj["queryMode"] = "remote";
										obj["queryParam"] = "searchStr";
										obj["queryField"] = "displayField";
										obj["typeAhead"] = true;
										obj["typeAheadDelay"] = 100;
										obj["minChars"] = 2;
										obj["editable"] = true;
										obj["rowlimit"] = 1000;
									}			
									else if ((obj["xtype"].indexOf('combo') != -1) && (value == 'textfield')) {
										//conversione proprieta
										delete(obj["datasource"]);
										delete(obj["datasourcetype"]);
										delete(obj["datasourcefield"]);
										delete(obj["valueField"]);
										delete(obj["displayField"]);
										delete(obj["queryMode"]);
										delete(obj["queryParam"]);
										delete(obj["typeAhead"]);
										delete(obj["typeAheadDelay"]);
										delete(obj["minChars"]);
										delete(obj["editable"]);
										delete(obj["rowlimit"]);
										delete(obj["layouteditorid"]);
										delete(obj["layoutsearchid"]);
										delete(obj["layouteditorWindowMode"]);
									}
									
									if (value === 'timerfield'){
										//keys.format = 'd-m-Y H:i';
										//keys.submitFormat = 'Y-m-d H:i';
									}
									else if (value === 'timefield'){
										obj["format"] = 'H:i';
										obj["submitFormat"] = 'H:i';
									}
									else if (value === 'datefield'){
										obj["format"] = 'd-m-Y';
										obj["submitFormat"] = 'Y-m-d';
									}
									else if (value === 'datetimefield'){
										obj["format"] = 'd-m-Y H:i';
										obj["submitFormat"] = 'Y-m-d H:i';
									}
									else if (value === 'dynamiccombo'){
										obj["layouteditorid"] = "0";
										obj["layouteditorWindowMode"] = "acDialog";
									}
									
									if (value.indexOf('tree') != -1) {	
										obj["layouteditorid"] = "0";
										obj["layouteditorWindowMode"] = "acDialog";
										obj["datasourcetype"] = "TREE";
										obj["parentidname"] = "CT_TABLEPARENT";
										obj["childrenidname"] = "CT_TABLE";
										obj["parentidstart"] = "0";
										obj["rootVisible"] = true;
										obj["waytoexpand"] = "down";
									}									
								}
									
								//aggiorna se è un cambio di valore nella prop
								if ((value === '') || (value === null)){
									log('Oggetto ' + CurrentObjectName + ' Prop' + obj[recordId] + ' Cancellato=' + recordId);
									delete(obj[recordId]);
								} else {
									log('Oggetto ' + CurrentObjectName + ' Prop' + obj[recordId] + ' Modificato=' + recordId + ' Value=' + value);
									obj[recordId] = value;
								}
								
								//aggiorna se è un cambio di name
								if (recordId == 'name') CurrentObjectName = value;
								
								//aggiorna property in form rendered
								Custom.FormRender()
								
								//propertygrid
								Custom.ObjInPropertyGrid(CurrentObjectName);
								
								//Form00
								if (CurrentObjectName == 'Form00'){
									if (recordId == 'datasource') CurrentLayoutDataSource = value;
									if (recordId == 'datasourcetype') CurrentLayoutDataSourceType = value;
									if (recordId == 'datasourcefield') CurrentLayoutDataSourceField = value;
									
									//update elenco field
									var DataSourceFieldStore = Ext.StoreManager.lookup('DataSourceFieldStore') ;
									DataSourceFieldStore.load({ params: {datasource: CurrentLayoutDataSource, datasourcetype: CurrentLayoutDataSourceType, datasourcedbname: CurrentLayoutDataSourceDBName, datasourcetype: CurrentLayoutDataSourceType, limit: this.rowlimit, layoutid: CurrentLayoutId, } });
									
									var ComDictionaryDBStore = Ext.StoreManager.lookup('ComDictionaryDBStore') ;
									ComDictionaryDBStore.load({ params: {datasource: CurrentLayoutDataSource, datasourcetype: CurrentLayoutDataSourceType, datasourcedbname: CurrentLayoutDataSourceDBName, datasourcetype: CurrentLayoutDataSourceType, limit: this.rowlimit, layoutid: CurrentLayoutId, } });
								}
							}
						 },
	});

/* ----- OBJECT COMPONENT TREE ------------------------------------------*/
	Ext.define('myTypeTreeDD', {
		extend: 'Ext.data.Model',
		fields: [
			{ name: 'objname', 			type: 'string' },
			{ name: 'objfieldLabel', 	type: 'string' },
			{ name: 'objxtype', 		type: 'string' },
			{ name: 'objregex', 		type: 'string' },
			{ name: 'objeditable', 		type: 'string' },
			{ name: 'objmaxLength', 	type: 'int' },
			{ name: 'objdecimalPrecision', type: 'int' },
			{ name: 'objmaxLengthText', type: 'string' },
			{ name: 'objminLength', 	type: 'int' },
			{ name: 'objminLengthText', type: 'string' },
			{ name: 'objinputType', 	type: 'string' },
			{ name: 'objdatasourcedbname', 	type: 'string' },
			{ name: 'objdatasource', 	type: 'string' },
			{ name: 'objdatasourcetype', type: 'string' },
			{ name: 'objdatasourcefield', type: 'string' },
			{ name: 'objlayouteditorid', type: 'string' },
			{ name: 'objlayouteditorWindowMode', type: 'string' },
			{ name: 'objvalueField', 	type: 'string' },
			{ name: 'objdisplayField', 	type: 'string' },
			{ name: 'objparentidname', 	type: 'string' },
			{ name: 'objchildrenidname', 	type: 'string' },
			{ name: 'objonclick', 		type: 'string' },
			{ name: 'objformat', 		type: 'string' },
		],
		proxy: {
			type: 'ajax'
		}

	});

	/* ---------------------- DictionaryDB -----------------------------*/
	var ComDictionaryDBStore  = Ext.create('Ext.data.TreeStore', {
		id:'ComDictionaryDBStore',		
		model:myTypeTreeDD,
		//autoSync: true, (ricarica ad ogni click)
		fields: [],
		root: {
			id:'0',  //start or root value
			text: 'SQLField',
			expanded:false,
			draggable: true
		},
		proxy: {
			type: 'ajax',
			url: '../includes/io/dictionarydbfield.php?layoutid=' + CurrentLayoutId,
			node: 'id', // send the parent id through GET (default 0)
			reader: {
				type: 'json',
				rootProperty: 'data',
			}
		}
	});
	
	var ComDictionaryDB = Ext.create('Ext.tree.Panel', {
        border:false,
        id:'ComDictionaryDB',
		useArrows: true,
        store: ComDictionaryDBStore ,
		viewConfig: {
			plugins: {
				ptype: 'treeviewdragdrop',
				copy: true,
				dragGroup: 'myDDGroup'
			}
		},
    });

	/* ---------------------- DictionaryCMD ----------------------------*/
	/*var ComDictionaryCmdStore  = Ext.create('Ext.data.TreeStore', {
		id:'ComDictionaryCmdStore',		
		model:myTypeTreeDD,
		//autoSync: true, (ricarica ad ogni click)
		fields: [],
		root: {
			id:'0',  //start or root value
			text: 'CMDButton',
			expanded:false,
			draggable: true
		},
		proxy: {
			type: 'ajax',
			url: '../includes/io/dictionarycmd.php?layoutid=' + CurrentLayoutId,
			node: 'id', // send the parent id through GET (default 0)
			reader: {
				type: 'json',
				rootProperty: 'data',
			}
		}
	});
	var ComDictionaryCmd = Ext.create('Ext.tree.Panel', {
        border:false,
        id:'ComDictionaryCmd',
		useArrows: true,
        store: ComDictionaryCmdStore ,
		viewConfig: {
			plugins: {
				ptype: 'treeviewdragdrop',
				copy: true,
				dragGroup: 'myDDGroup'
			}
		},
    });
	*/
	
	/* ---------------------- DictionaryField --------------------------*/
	var ComFieldsStore  = Ext.create('Ext.data.TreeStore', {
		id:'ComFieldsStore',	
		model:myTypeTreeDD,
		fields: [],
		root: {
			id:'0',  //start or root value
			text: 'Object',
			expanded:false,
			draggable: true
		},
		proxy: {
			type: 'ajax',
			url: '../includes/io/fields.json',
			node: 'id', // send the parent id through GET (default 0)
			reader: {
				type: 'json',
				rootProperty: 'data',
			}
		}
	});
    var ComFields = Ext.create('Ext.tree.Panel', {
        border:false,
        id:'ComFields',
        useArrows: true,
        store: ComFieldsStore ,
		viewConfig: {
			plugins: {
				ptype: 'treeviewdragdrop',
				copy: true,
				dragGroup: 'myDDGroup'
			}
		},
    });

/* ----- DESIGN PANEL -----------------------------------------------*/
	var overrides = {
		endDrag: function() {
			log('endDrag');
			//var CurrentObjectExt = DesignPanel.getForm().findField(CurrentObjectName)
			var CurrentObjectExt = Ext.get(CurrentObjectId).component;
			var CurrentObjectName = CurrentObjectExt.name;
			var i = 0;				
			var offsetx = 6;
			var offsety = 6;
			
			var mousePosX = CurrentObjectExt.getXY()[0];
			var mousePosY = CurrentObjectExt.getXY()[1];
			var elementMouseIsOver = document.elementFromPoint(mousePosX,mousePosY);
			var elementMouseIsOverExt = Ext.get(elementMouseIsOver.id).component;
			
			//cerco panel su cui sono sopra
			var FormPanel = elementMouseIsOverExt;
			if (FormPanel.xtype != 'panel') { FormPanel = FormPanel.ownerCt;}
			log('offset x' + FormPanel.getX() + ' y ' + FormPanel.getY() + ' position inside sub panel drag');
			offsetx = FormPanel.getXY()[0];
			offsety = FormPanel.getXY()[1];
			
			log('Obj->' + CurrentObjectName);	
			log('OBjExt->' + CurrentObjectExt.name);			
			var result = getSubItemFromName(CurrentLayoutJson, CurrentObjectName);
			
			if (result){
				result.x = CurrentObjectExt.getXY()[0] - offsetx;
				result.y = CurrentObjectExt.getXY()[1] - offsety;
			}
			
			//aggiorna property in form rendered
			Custom.FormRender(CurrentLayoutId);	
			Custom.ObjInPropertyGrid(CurrentObjectName);
		}
	};
	var DesignPanel  =	Ext.create('Ext.form.Panel', {
		itemId: 'DesignPanel',
		id: 'DesignPanel',
		name: 'DesignPanel',
		maximizable: false,
		minimizable: false,
		maximized: true,
		closable: false,
		width: "100%",
		scrollable: true,
		//overflowY: ((CurrentLayoutSkin == 'absolute') ? 'scroll' : false),
		//overflowX: ((CurrentLayoutSkin == 'absolute') ? 'scroll' : false),
		definitionraw: '',
		rendered: false,
		//height: "100%",
		height: Ext.getBody().getViewSize().height,
		border:true,
		//padding: '5 5 0 5',
		items: [{ }],
		layout: {
			type: CurrentLayoutSkin, //vbox, hbox, auto, absolute,
			align: 'stretch'
		},
		anchor: "100% 100%",
		draggable:false,
		bodyStyle:'background:transparent url(\'icons/bg.gif\') repeat',
		waitTitle:'Connecting',
        waitMsg:'Invio dati...',
		listeners: {
			afterrender: function () {
				DesignPanel.dropZone = Ext.create('myPanelDropTarget', DesignPanel.getEl(), {
					ddGroup: 'myDDGroup',
					panel: DesignPanel
				});							
			},
			click: {
				element	: 	'el', //bind to the underlying el property on the panel
				fn		:	function(object, selectedIndex, node, event){
					log('clickonobj');
					
					// cerco l'oggetto extjs selezionato padre (contenitore dei sotto oggetti selezionati)
					var ObjParent = selectedIndex;
					var ObjParentId = ObjParent.id;
					var CurrentObjectExt;
					var result;
					
					//cerco dal cliccato fino al designpanel fino a quando nn trovo un nome che esiste nell'array
					while (true) {
						if (ObjParent.id != ''){
							ObjParentId = ObjParent.id;
							CurrentObjectExt = Ext.get(ObjParentId).component;
							CurrentObjectName = '';
							CurrentObjectId = '';
							if ( CurrentObjectExt !== undefined) {
								if ('name' in CurrentObjectExt){ CurrentObjectName = CurrentObjectExt.name;}
								if ('id' in CurrentObjectExt){ CurrentObjectId = CurrentObjectExt.id;} 
								if ((CurrentObjectExt.xtype == 'panel') || (CurrentObjectExt.xtype == 'dynamicgridform')) {
									CurrentLastPanelName = CurrentObjectExt.name; CurrentLastPanelId = CurrentObjectExt.id;
									if (CurrentLastPanelId == 'centerViewPortId')  CurrentLastPanelId = 'DesignPanel';
									if (CurrentLastPanelName == 'centerViewPortId')  CurrentLastPanelName = 'DesignPanel';
								}
								if (ObjParent.id.substr(0,11) == "DesignPanel") {break;}
								result = getSubItemFromName(CurrentLayoutJson, CurrentObjectName);
								if (result) {break;}
							}
						}
						ObjParent = ObjParent.parentNode;
					}
					
					log('Obj:' + CurrentObjectName);
					
					if (CurrentObjectName == 'DesignPanel') 
						CurrentObjectName = 'Form00'
					else
						//abbino l'aggetto selezionato con l'array delle property
						Custom.ObjInPropertyGrid(CurrentObjectName);
					
					//dragdrop
					// if ((CurrentObjectExt.xtype == 'panel') || (CurrentObjectExt.xtype == 'dynamicgridform')) {
						var dd = Ext.create('Ext.dd.DD', CurrentObjectExt, 'myDDGroup', {
							isTarget  : false
						});
						Ext.apply(dd, overrides);
					// }
				}
			},
			mouseover: {
				fn: function(event, domElement) {
					var extElement = Ext.get(domElement).component;
					//if(Custom.IsThemeEditorWindow(extElement)) return true;
					extElement.addCls('themeeditor-bordered');
				}
			},
			mouseout: {
				fn: function(event, domElement) {
					//alert('bla bla');
					var extElement = Ext.get(domElement).component;
					//if(Custom.IsThemeEditorWindow(extElement)) return true;
					extElement.removeCls('themeeditor-bordered');
				}
			}
			
		},
	});

/* ----- TOOLBAR ----------------------------------------------------*/
	var ToolBar = Ext.create('Ext.Toolbar', {
		id:'ToolBar',
		defaults:{
			border:false
		},
		items: [{
				xtype: 'button', 
				text: 'Save',
				tooltip: 'Salva il layout della maschera',
				id: 'SaveButton',
				listeners: {click: function() {	
					Custom.LayoutSave(CurrentLayoutId);}
				}
			},{
				xtype: 'button', 
				text: 'Load',
				id: 'LoadButton',
				hidden: true,
				listeners: {click: function() {	
					Custom.LayoutLoad(CurrentLayoutId);
					Custom.FormRender(CurrentLayoutId);
				}}
			},{
				xtype: 'button', 
				text: 'Delete',
				id: 'DeleteButton',
				listeners: {click: function() {	
					Custom.ObjDelete(CurrentObjectName);
					Custom.FormRender(CurrentLayoutId);
				}}
			},{
				xtype: 'button', 
				text: 'Erase',
				id: 'EraseButton',
				listeners: {click: function() {	
					Custom.FormDelete(CurrentLayoutId);
					Custom.FormRender(CurrentLayoutId);
				}}
			},{
				xtype: 'button', 
				text: 'SQL',
				hidden: true,
				id: 'SQLButton',
				listeners: {click: function() {	
					CurrentObjectName = 'Form00';
					qbWindow.show();
					qbWindow.setValue(CurrentLayoutDataSource);
				}}
			},{
				xtype: 'button', 
				text: 'AddPanel',
				hidden: true,
				id: 'AddPanelButton',
				listeners: {click: function() {	
					Custom.ObjAddPanel(CurrentObjectName);
					Custom.FormRender(CurrentLayoutId);
				}}
			},{
				xtype: 'button', 
				text: 'AllField',
				id: 'AllFieldButton',
				listeners: {click: function() {	
					Custom.ObjAddAll();
				}}
			}
		]
	});

/* ----- VIEWPORT ---------------------------------------------------*/
	MainViewPort = Ext.create('Ext.Viewport',{
		id: 'MainViewport',
		name: 'MainViewport',
	    layout:'border',
        items:[
			{
				id: 'ElementRegion',
				region:'east',
				title: 'Elements',
				collapsible: true,
				split:true,
				width: 350,
				layout:'fit',
				margins:'0 5 0 0',
				items:[
				{
					id: 'ElementPanel',
					xtype:'panel',
					border:false,
					id:'VerticalToolBar',
					minHeight: 100,
                    enableOverflow: true,
					autoScroll:true,
					items:[ToolBar,ComFields,ComDictionaryDB,PropertyGrid]
				}]
			}, {
				region:'center',
				id:'centerViewPortId',
				deferredRender:false,
				activeTab:0,
				plain:true,
				layoutOnTabChange : true,
				items:[DesignPanel]
			}
        ]
    });

/* ----- LOAD FORM --------------------------------------------------*/
	Custom.FormRender(CurrentLayoutId);
	
	CurrentLastPanelName = 'DesignPanel';
	CurrentLastPanelId = 'DesignPanel';
	
	DataSourceFieldStore.load({ params: { datasource: CurrentLayoutDataSource, datasourcetype: CurrentLayoutDataSourceType, datasourcedbname: CurrentLayoutDataSourceDBName, } });
	ComDictionaryDBStore.load({ params: { datasource: CurrentLayoutDataSource, datasourcetype: CurrentLayoutDataSourceType, datasourcedbname: CurrentLayoutDataSourceDBName, } });
});
