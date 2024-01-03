var RowLimitMax = 100;
var CurrentUser = [];

var SQLFilter = '';
var gridtable = [];

var CurrentObjectName = '';
var windowObjectReference = null; 

var designer = {};

var DefinitionPanel = {
	'id': 0,
	'ViewType': "",
	'name': '',
	'WindowMode': 'acWindowNormal',
	
	'DataSource': "",
	'DataMode': "edit",
	'DataSourceType': "",
	'DataSourceField': "",
	'DataWhere': "",
	
	'Skin': "absolute",
	'WindowWidth' : 0,
	'WindowHeight' : 0,
	'WindowX' : 0,
	'WindowY' : 0,
	'RequireValidation': false,
	'ActionSave': "",
	
	'Json': [],
	
	'DataSourceAggregate': "",
	'DataSourceLeftAxis': "",
	'DataSourceTopAxis': "",
	'DataSourceRemote': false,
	
	'ParentIdName': "",
	'ParentIdStart': "",
	'ChildrenIdName': "",
	'DisplayField': "",
		
	'columnWidth': "",
	'columnAction':"",
	'ActionColumn': "",
	'ActionTrueFalseColumn': "",
	'CheckColumn': "",
	'groupField': "",
	
	'PrinterName': "",
	
	'DataSources': [],
	'DataSourceFieldValue': "",
	'RowId': 0, 
	'RowLimit': 1,
	'themeUI': themeUI,
	'Override': "",
	'rendered': false,
	'Valid': true,
	'LayoutDataSave': false,
	'ProcId': 0
};

var CurrentPanel = {};
var CurrentWindow = {};
var CurrentToolBar = {};
var CurrentPanelRaw = {};
var OriginalPanelRaw = {};
var CurrentProcRequestId = '';

var CurrentUser = [];

//*************************************************************************************************************//
//				PARTE COMUNE LAYOUT 
Custom.LayoutLoad = function (LayoutId) {
	CurrentPanelRaw = clone(DefinitionPanel);
	Ext.Ajax.request({
		method: 'GET',
		type: 'ajax',
		async: false,
		url: '../includes/io/LayoutRead.php',
		params: {layoutid: LayoutId, 
				layoutthemename: themeName},
		success: function (response, opts) {
			var JsonAppo = Ext.util.JSON.decode(response.responseText)
			if(JsonAppo.success){
				if (JsonAppo.data[0].id !== undefined) 				{CurrentPanelRaw.id = JsonAppo.data[0].id;}
				if (JsonAppo.data[0].name !== undefined) 			{CurrentPanelRaw.name = JsonAppo.data[0].name;}
				if (JsonAppo.data[0].viewtype !== undefined) 		{CurrentPanelRaw.ViewType = JsonAppo.data[0].viewtype;}
				if (JsonAppo.data[0].layoutjson !== undefined) 		{CurrentPanelRaw.Json = JsonAppo.data[0].layoutjson;}
				
				//form
				if (JsonAppo.data[0].actionsave !== undefined) 		{CurrentPanelRaw.ActionSave = JsonAppo.data[0].actionsave;}
				if (JsonAppo.data[0].requirevalidation !== undefined){CurrentPanelRaw.RequireValidation = JsonAppo.data[0].requirevalidation;}
				if (JsonAppo.data[0].layoutskin !== undefined) 		{CurrentPanelRaw.Skin = JsonAppo.data[0].layoutskin;}
				if (CurrentPanelRaw.Skin == '') CurrentPanelRaw.Skin = 'absolute';
				
				//db
				if (JsonAppo.data[0].datasource !== undefined) 		{CurrentPanelRaw.DataSource = JsonAppo.data[0].datasource;}
				if (JsonAppo.data[0].datasourcetype !== undefined) 	{CurrentPanelRaw.DataSourceType = JsonAppo.data[0].datasourcetype;}
				if (JsonAppo.data[0].datasourcefield !== undefined) {CurrentPanelRaw.DataSourceField = JsonAppo.data[0].datasourcefield;}
				if (JsonAppo.data[0].jsonfilter !== undefined) 		{CurrentPanelRaw.JsonFilter = JsonAppo.data[0].jsonfilter;}
				
				//pivot
				if (JsonAppo.data[0].aggregate !== undefined) 		{CurrentPanelRaw.DataSourceAggregate = JsonAppo.data[0].aggregate;}
				if (JsonAppo.data[0].leftaxis !== undefined) 		{CurrentPanelRaw.DataSourceLeftAxis = JsonAppo.data[0].leftaxis;}
				if (JsonAppo.data[0].topaxis !== undefined) 		{CurrentPanelRaw.DataSourceTopAxis = JsonAppo.data[0].topaxis;}
				if (JsonAppo.data[0].remote !== undefined) 			{CurrentPanelRaw.DataSourceRemote = JsonAppo.data[0].remote;}
				
				//theme
				if (JsonAppo.data[0].layoutoverride !== undefined) 	{CurrentPanelRaw.Override = JsonAppo.data[0].layoutoverride;}
				if (JsonAppo.data[0].layoutthemeui !== undefined) 	{CurrentPanelRaw.themeUI = JsonAppo.data[0].layoutthemeui;}
				
				//grid
				if (JsonAppo.data[0].columnwidth !== undefined) 	{CurrentPanelRaw.columnWidth = JsonAppo.data[0].columnwidth;}
				if (JsonAppo.data[0].columnaction !== undefined) 	{CurrentPanelRaw.columnAction = JsonAppo.data[0].columnaction;}
				if (JsonAppo.data[0].groupfield !== undefined) 		{CurrentPanelRaw.groupField = JsonAppo.data[0].groupfield;}
				if (JsonAppo.data[0].actioncolumn !== undefined) 	{CurrentPanelRaw.ActionColumn = JsonAppo.data[0].actioncolumn;}
				if (JsonAppo.data[0].actiontruefalse !== undefined) {CurrentPanelRaw.ActionTrueFalseColumn = JsonAppo.data[0].actiontruefalse;}
				if (JsonAppo.data[0].checkcolumn !== undefined) 	{CurrentPanelRaw.CheckColumn = JsonAppo.data[0].checkcolumn;}
				
				//label printer
				if (JsonAppo.data[0].printername !== undefined) 	{CurrentPanelRaw.PrinterName = JsonAppo.data[0].printername;}
				
				//window
				if (JsonAppo.data[0].windowmode !== undefined) 		{CurrentPanelRaw.WindowMode = JsonAppo.data[0].windowmode;}
				if (JsonAppo.data[0].windowwidth !== undefined) 	{CurrentPanelRaw.WindowWidth = JsonAppo.data[0].windowwidth;}
				if (JsonAppo.data[0].windowheight !== undefined) 	{CurrentPanelRaw.WindowHeight = JsonAppo.data[0].windowheight;}
				if (JsonAppo.data[0].windowx !== undefined) 		{CurrentPanelRaw.WindowX = JsonAppo.data[0].windowx;}
				if (JsonAppo.data[0].windowy !== undefined) 		{CurrentPanelRaw.WindowY = JsonAppo.data[0].windowy;}
				
				//tree
				if (JsonAppo.data[0].parentidname !== undefined) 	{CurrentPanelRaw.ParentIdName = JsonAppo.data[0].parentidname;}
				if (JsonAppo.data[0].parentidstart !== undefined) 	{CurrentPanelRaw.ParentIdStart = JsonAppo.data[0].parentidstart;}
				if (JsonAppo.data[0].childrenidname !== undefined) 	{CurrentPanelRaw.ChildrenIdName = JsonAppo.data[0].childrenidname;}
				if (JsonAppo.data[0].displayfield !== undefined) 	{CurrentPanelRaw.DisplayField = JsonAppo.data[0].displayfield;}
		
			} else{
				Ext.MessageBox.show({
					title: "Errore",
					msg: JsonAppo.message,
					icon: Ext.MessageBox.ERROR,
					buttons: Ext.Msg.OK
				});		
			}
		},
		failure: function (response, opts) {
			Ext.MessageBox.show({
				title: "Server Not Responding!!",
				msg: '',
				icon: Ext.MessageBox.ERROR,
				buttons: Ext.Msg.OK
			});	
		}
	});
}
Custom.LayoutSave   = function(){
	//Invia i dati al server
	//Panel.Json = jsreports.getReportDefinition();
	//$(designer).trigger('save');
	var Appo = Ext.util.JSON.encode(CurrentPanelRaw.Json);
	Ext.Ajax.request({
		method: 'POST',
		async: false,
		params: {layoutid:CurrentPanelRaw.id,
				layoutjson:Appo,
				datasource:CurrentPanelRaw.DataSource,
				//datasourcefield:CurrentPanelRaw.DataSourceField,
				//datasourcetype:CurrentPanelRaw.DataSourceType,
				//viewtype:CurrentPanelRaw.ViewType,
				},
		url: '../includes/io/LayoutWrite.php',
		success: function(response) {
			var JsonAppo = Ext.util.JSON.decode(response.responseText);
			Ext.Msg.alert('Sending', JsonAppo.message);
		},
		failure: function(response) {
			Ext.Msg.alert('Error',response);
		}
	});
}
Custom.LayoutErase = function(){
	CurrentPanelRaw.Json = jsreports.createReport()
									.data('defaultds')
									.setPage(210, 297, "mm")
									.done(); 
}

//*************************************************************************************************************//
//				RENDERING LAYOUT IN GRID FORM PIVOT REPORT ETC... 
Custom.ReportEdit = function(){
	var DesignPanel = Ext.getCmp('DesignPanel');
	DesignPanel.removeAll();
	
	iterateDataSources(CurrentPanelRaw.Json);
	
	var ReportDiv =  {
		xtype: 'panel',
		html: "<div class='report-output'></div>",
		//height: Ext.getBody().getViewSize().height-10,
		//width: '100%',
	};
	//document.getElementById('div_register').setAttribute("style","width:500px");
	
	DesignPanel.add(ReportDiv);
	
	//se null esegue create report
	if ((CurrentPanelRaw.Json == '') || (CurrentPanelRaw.Json == null)){ 
		Custom.LayoutErase();		
		CurrentPanelRaw.DataSources = [{
			"id": "defaultds",
			"name": "defaultds",
			"url": "../includes/io/DataRead.php?onlydata=true&layoutid=" + CurrentPanelRaw.Id,
			"schema_url": "../includes/io/DataRead.php?modeldef=true&layoutid=" + CurrentPanelRaw.Id,
		}];
	}
	
	var ReportImages = {};
	Ext.Ajax.request({
		url: '../includes/io/dictionaryfile.php',
		params: { filedir : '../../' + CurrentUser.UserArchive + 'repositorycom' },
		async: false,
		success: function(response) {
			var JsonFormAppo = Ext.util.JSON.decode(response.responseText);
			if (JsonFormAppo.status = 'Success'){ 
				ReportImages = JsonFormAppo.data;
			} else {
				Ext.MessageBox.show({
					title: "Error Parse DataREAD" + JsonFormAppo.status,
					msg: JsonFormAppo.message,
					icon: Ext.MessageBox.ERROR,
					buttons: Ext.Msg.OK
				});
			}
		},
		failure: function() {
			Ext.MessageBox.show({
				title: "Error",
				msg: 'DataREAD',
				icon: Ext.MessageBox.ERROR,
				buttons: Ext.Msg.OK
			});
		},
	});
	
	designer = new jsreports.Designer({
		embedded: true,
		container: $(".report-output"),
		data_sources: CurrentPanelRaw.DataSources,
		report_def: CurrentPanelRaw.Json,
		showPageHeaderAndFooter: true,
		layout: "horizontal",
		images: ReportImages,
		Locale : "it",
		//getSetGlobalLocale
		gridSizeInches: 0.25,
		gridSizeMm: 5,
		paper_sizes: {
		  "a5": { name: 'A5', inches: ["5.8", "8.3"], mm: ["148", "210"]},
		  "a5l": { name: 'A5 landscape', inches: ["8.3","5.8"], mm: ["210","148"]},
		  "a6": { name: 'A6', inches: ["4.13", "5.83"], mm: ["105", "148"]},
		  "a6l": { name: 'A6 landscape', inches: ["5.83","4.13"], mm: ["148","105"]},
		  "a7": { name: 'A7', inches: ["2.91", "4.13"], mm: ["74", "105"]},
		  "a7l": { name: 'A7 landscape', inches: [ "4.13","2.91"], mm: ["105","74"]},
		  "a8": { name: 'A8', inches: ["2.05", "2.91"], mm: ["52", "74"]},
		  "a8l": { name: 'A8 landscape', inches: ["2.91", "2.05"], mm: ["74","52"]},
		  "a8la": { name: 'A8 landscapeAd', inches: ["2.91", "2.15"], mm: ["78","60"]},
		  "Label55x35": { name: 'Label55x35', inches: ["2.1", "1.37"], mm: ["55", "35"]},
		  "Label75x25": { name: 'Label75x25', inches: ["2.9", "0.98"], mm: ["75", "25"]},
		  "Label62x31": { name: 'Label62x31', inches: ["2.44", "1.22"], mm: ["62", "31"]},
		  "Label55x35": { name: 'Label80x70', inches: ["3,15", "2,76"], mm: ["80", "70"]},
		  "Label50x100": { name: 'Label50x100', inches: ["1,96", "3,93"], mm: ["50", "100"]}
		},
		plugins: [],
		getDataSourceOptions: (dataSources) => {
			// dataSources is the existing list, specified elsewhere
			// We need to return an array of { id, text } objects here
			const options = dataSources.map(ds => ({
				id: ds.id.toLowerCase(),
				text: ds.name || ""
			}));
			options.sort(function(dsA, dsB) {
				return dsA.text.localeCompare(dsB.text);
			});
			// Add an option at the end of the list to create a new data source
			options.push({
				id: 'EDIT_DATA_SOURCES',
				text: 'Edit data sources...'
			});
			return options;
		},
		onDataSourceSelected: (selectedId) => {
			if (selectedId === 'EDIT_DATA_SOURCES') {
				dataOverlay.className += ' active';
				return true;
			}
		}
	});
  
	designer.on("save", function(reportdef) {
		CurrentPanelRaw.Json = Ext.util.JSON.decode(reportdef);
		Custom.LayoutSave();
	});
}
function iterateDataSources(obj) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object")
                iterateDataSources(obj[property]);
            else
				//data_source
				if ((property == 'data_source') && (obj[property] != "__parentgroup")){
					log(property + "   " + obj[property]);
					CurrentPanelRaw.DataSources[CurrentPanelRaw.DataSources.length++] = {
						"id": obj['data_source'],
						"name": obj['data_source'],
						"url": "../includes/io/DataRead.php?onlydata=true" + 
														"&layoutid=" + CurrentPanelRaw.id + 
														"&objid=" + obj['data_source'] +
														"&datawhere=" + CurrentPanelRaw.DataWhere,
						"schema_url": "../includes/io/DataRead.php?modeldef=true" + 
																"&layoutid=" + CurrentPanelRaw.id + 
																"&objid=" + obj['data_source'] +
																"&datawhere=" + CurrentPanelRaw.DataWhere,
					};
				}
        }
    }
}


//*************************************************************************************************************//
//				Generiche
Custom.ArrayToString = function(record){
	var selectedRowDataString = '';
	var selectedRowData = [];
	Ext.iterate(record, function(key, value) {
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
		selectedRowDataString += key + '=' + value + '&';
	});
	return selectedRowDataString;
},
Custom.isNumber = function (n) {
 return !isNaN(parseFloat(n)) && isFinite(n);
}
Custom.isJson = function (str) {
 try {
 JSON.parse(str);
 } catch (e) {
 return false;
 }
 return true;
}
Custom.isNotNull = function (obj) {
 return obj && obj !== "null" && obj!== "undefined";
}
Custom.getURL = function (urlVarName) {
	var urlHalves = decodeURIComponent(String(document.location));
	urlHalves = urlHalves.split('?');
	return urlHalves[0];
}
Custom.getURLVar = function (urlVarName) {
	var urlHalves = decodeURIComponent(String(document.location));
	urlHalves = urlHalves.split('?');
	var urlVarValue = '';
	if(urlHalves[1]) {var urlVars = urlHalves[1].split('&');for(i=0; i<=(urlVars.length); i++) {if(urlVars[i]) {var urlVarPair = urlVars[i].split('=');if (urlVarPair[0] && urlVarPair[0] == urlVarName) {urlVarValue = urlVarPair[1];}}}}
	return urlVarValue;
}
Custom.openLinkInNewWindow = function (strUrl, strWindowName) {
	var windowObjectReference = window.open(strUrl, strWindowName, "resizable,scrollbars,status");
}
function clone(obj) {
	if(obj == null || typeof(obj) != 'object') return obj;

	var temp = new obj.constructor(); 
	for(var key in obj)
		temp[key] = clone(obj[key]);
	return temp;
}
function count_obj(obj){
    var i = 0;
    for(var key in obj){
        ++i;
    }

    return i;
}
function log(str) {
 if (window.console) {
 console.log(str);
 }
}
function sumArraysInObject(obj) {
	var result =[];
	Ext.Object.each(obj, function(key, value, myself) {
		if ((typeof value != 'object') && (typeof value != 'function')) {				
			result[key] = value;
		}else{
			result[key] = 'array';
		}
	})
    return result;
}
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
function strip(key) {
    if (key.indexOf('-----') !== -1) {
        return key.split('-----')[2].replace(/\r?\n|\r/g, '');
    }
}
Custom.yyyymmdd = function(usrdate) {
	var yyyy = usrdate.getFullYear().toString();
	var mm = (usrdate.getMonth()+1).toString(); // getMonth() is zero-based
	var dd = usrdate.getDate().toString();
	return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]); // padding
}
function nvl(obj, defaultValue) {
	if (Custom.isNotNull(obj) == true) {return defaultValue;} else{ return obj;}
}

var ExecuteOnObjectPropertyExist = function (subMenuItems, name, namefunction) {
	if (subMenuItems) {
		if ((subMenuItems.length === undefined) ) {
			var appo = subMenuItems;
			subMenuItems = [];
			subMenuItems[0] = appo;
		}
		for (var i = 0; i < subMenuItems.length; i++) {
			if (subMenuItems[i][name] !== undefined) {
				log('ExecuteOnObjectPropertyExist Obj:' + subMenuItems[i].name);
				if (namefunction.indexOf("(") > 0){
					namefunction = namefunction.replace('objparam', 'subMenuItems[i]');
					eval(namefunction + ';');
				}else{
					eval(namefunction + '(subMenuItems[i]);');
				}
				//return subMenuItems[i];
			}
			var found = ExecuteOnObjectPropertyExist(subMenuItems[i].items, name, namefunction);
			if (found) return found;
		}
	}
};
var ExecuteOnObjectPropertyValue = function (subMenuItems, name, valuekey, namefunction) {
	if (subMenuItems) {
		if ((subMenuItems.length === undefined) ) {
			var appo = subMenuItems;
			subMenuItems = [];
			subMenuItems[0] = appo;
		}
		for (var i = 0; i < subMenuItems.length; i++) {
			if (subMenuItems[i][name] == valuekey) {
				log('ExecuteOnObjectPropertyValue Obj:' + subMenuItems[i].name + ' Property: ' + name);
				if (namefunction.indexOf("(") > 0){
					namefunction = namefunction.replace('objparam', 'subMenuItems[i]');
					eval(namefunction + ';');
				}else{
					eval(namefunction + '(subMenuItems[i]);');
				}
				//return subMenuItems[i];
			}
			var found = ExecuteOnObjectPropertyValue(subMenuItems[i].items, name, valuekey, namefunction);
			if (found) return found;
		}
	}
};
var getSubItemFromName = function (subItems, name) {
	if (subItems) {
		for (var i = 0; i < subItems.length; i++) {
			if (subItems[i].name == name) {
				return subItems[i];
			}
			var found = getSubItemFromName(subItems[i].items, name);
			if (found) return found;
		}
	}
};
var getSubItemFromDataSourceField = function (subItems, datasourcefield) {
	if (subItems) {
		for (var i = 0; i < subItems.length; i++) {
			if (subItems[i].datasourcefield == datasourcefield) {
				return subItems[i];
			}
			var found = getSubItemFromDataSourceField(subItems[i].items, datasourcefield);
			if (found) return found;
		}
	}
};
var removeSubItemFromName = function (subItems, name) {
 if (subItems) {
 for (var i = 0; i < subItems.length; i++) {
 if (subItems[i].name == name) {
				subItems.splice(i,1);
 return subItems[i];
 }
 var found = removeSubItemFromName(subItems[i].items, name);
 if (found) return found;
 }
 }
};

//*************************************************************************************************************//
//				SQL Builder
var qbWindow = Ext.create('VisualSQLQueryBuilder');
Ext.define('EditorSQL', {
	extend: 'Ext.form.field.Picker',
	alias: 'widget.editorsql',
	editable: true,
	onTriggerClick: function() {
		qbWindow.show();
		qbWindow.setValue(CurrentLayoutDataSource);		
	}
});
qbWindow.on({
    applySQL: function(vartext) {			
		CurrentLayoutDataSourceType = 'SELECT'
		CurrentLayoutDataSource = vartext;
	}
});

//*************************************************************************************************************//
//			GRID PLUNGINS
var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
	//clicksToMoveEditor: 1,
	clicksToEdit: 2,
	pluginId: 'roweditingId',
	//autoCancel: false,
	listeners: {
		beforeedit: function(editor,e,opt){
			log(editor); //Contains the variables that should have been in the e var
			log(e);
			log(opt); //undefined
			//return editor.record.get('status');  
			//you can update the above logic to something else
			//based on your criteria send false to stop editing
		} 
		/*
		edit: function( editor, context, eOpts){
		   var grid = Ext.ComponentQuery.query('#griditemId')[0];
		   var store = grid.getView().getStore();

		   var txtColIdx = 1; 
		   var textfieldRef = context.grid.columns[txtColIdx].getEditor(context.record); 
		   var tetxfieldValue = textfieldRef.getValue(); //OK

		   context.record.set('theme', tetxfieldValue); //PROBLEM HERE ???
		   store.sync(); //Just this or do I need to send a different request to server
		},
		canceledit : function ( editor, context, eOpts ){
		   var grid = Ext.ComponentQuery.query('#griditemId')[0];
		   var store = grid.getView().getStore();
		   var record = grid.getSelectionModel().getSelection();
		   store.remove(record);
		}
		*/
	}
});
var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
	clicksToEdit: 2
});
var rowWidget = Ext.create('Ext.grid.plugin.RowWidget', {
	widget: {
		xtype: 'dynamicgrid',
		autoLoad: true,
	}
});

var toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
} 
var ComboRenderer = function(val, metaData){
    var combo = metaData.column.getEditor();
    if(val && combo && combo.store && combo.displayField){
        var index = combo.store.findExact(combo.valueField, val);
        if(index >= 0){
            return combo.store.getAt(index).get(combo.displayField);
        }
    }
    return val;
};
Ext.define('dynamiccheckcolumn', {
    extend: 'Ext.grid.column.CheckColumn',
    alias: 'widget.dynamiccheckcolumn',

    renderTpl: [
        '<div id="{id}-titleEl" data-ref="titleEl" {tipMarkup}class="', Ext.baseCSSPrefix, 'column-header-inner<tpl if="!$comp.isContainer"> ', 	Ext.baseCSSPrefix, 'leaf-column-header</tpl>',
        '<tpl if="empty"> ', Ext.baseCSSPrefix, 'column-header-inner-empty</tpl>">',

        '<span class="', Ext.baseCSSPrefix, 'column-header-text-container">',
        '<span class="', Ext.baseCSSPrefix, 'column-header-text-wrapper">',
        '<span id="{id}-textContainerEl" data-ref="textContainerEl" class="', Ext.baseCSSPrefix, 'column-header-text',
        '{childElCls}">',
        '<div class="', Ext.baseCSSPrefix, 'grid-checkcolumn" role="button" src="' + Ext.BLANK_IMAGE_URL + '"></div>',
        '</span>',
        '</span>',
        '</span>',
        '<tpl if="!menuDisabled">',
        '<div id="{id}-triggerEl" data-ref="triggerEl" role="presentation" class="', Ext.baseCSSPrefix, 'column-header-trigger',
        '{childElCls}" style="{triggerStyle}"></div>',
        '</tpl>',
        '</div>',
        '{%this.renderContainer(out,values)%}'
    ],

    constructor : function(config) {
        var me = this;

        Ext.apply(config, {
            stopSelection: true,
            sortable: false,
            draggable: false,
            resizable: false,
            menuDisabled: true,
            hideable: false,
            tdCls: 'no-tip',
            defaultRenderer: me.defaultRenderer,
            checked: false
        });

        me.callParent([ config ]);

        me.on('headerclick', me.onHeaderClick);
        me.on('selectall', me.onSelectAll);
        
    },

    getHeaderCheckboxEl: function(header){
        return header.getEl().down("."+Ext.baseCSSPrefix+'grid-checkcolumn');
    },
    
    onHeaderClick: function(headerCt, header, e, el) {
        var me = this,
            grid = headerCt.grid,
            checkboxEl = me.getHeaderCheckboxEl(header);
        
        if (!me.checked) {
            me.fireEvent('selectall', grid.getStore(), header, true);
            checkboxEl.addCls(Ext.baseCSSPrefix + 'grid-checkcolumn-checked');
            me.checked = true;
        } else {
            me.fireEvent('selectall', grid.getStore(), header, false);
            checkboxEl.removeCls(Ext.baseCSSPrefix + 'grid-checkcolumn-checked');
            me.checked = false;
        }
    },
    
    onSelectAll: function(store, column, checked) {
        var dataIndex = column.dataIndex;
        for(var i = 0; i < store.getCount(); i++) {
            var record = store.getAt(i);
            if (checked) {
                record.set(dataIndex, true);
            } else {
                record.set(dataIndex, false);
            }
        }
	}
});

//*************************************************************************************************************//
//				LOGIN
Custom.InfoUser = function () {
	log('InfoUser');
	Ext.Ajax.request({
		url : '../includes/io/UserInfo.php',
		async : false,
		success : function (response) {
			log('InfoUserRead');
			var JsonAppo = Ext.util.JSON.decode(response.responseText);
			if (JsonAppo['success'] == true) CurrentUser = JsonAppo.data[0];
			//themeName = JsonAppo.data[0].UserThemeName;
			//themeUI = JsonAppo.data[0].UserThemeNameUI;
		},
		failure : function (response) {
			if (Custom.isJson(response.responseText)) {
				Ext.MessageBox.show({
					title : "Error InfoUser",
					msg : 'Risposta del server inaspettata!!! ' + response.responseText.message,
					icon : Ext.MessageBox.ERROR,
							closable: false,
					buttons : Ext.Msg.OK
				});
			} else {
				Ext.MessageBox.show({
					title : "Error InfoUser",
					msg : 'Risposta del server inaspettata!!! ' + response.responseText,
					icon : Ext.MessageBox.ERROR,
							closable: false,
					buttons : Ext.Msg.OK
				});
			}
		},
	});
}

//*************************************************************************************************************//
//				MAIN
Ext.onReady(function(){

	Ext.QuickTips.init();
	Ext.tip.QuickTipManager.init();
	Ext.setGlyphFontFamily('FontAwesome');
	Ext.util.Format.thousandSeparator = "'";
	Ext.util.Format.decimalSeparator = '.';

	/* ---- HISTORY INIT ----------------------------------------------- */
	Ext.History.init();
	
	/* ----- RETRIVE USER INFO ----------------------------------------- */
	Custom.InfoUser();
	
	hljs.initHighlightingOnLoad();
	
	jsreports.libraryPath = "/includes/jsreports/lib/";

	/* ----- TOOLBAR ----------------------------------------------------*/
	var ToolBar = Ext.create('Ext.Toolbar', {
		id:'ToolBar',
		docked: 'top',
		hidden:true,
		defaults:{
			border:false
		},
		items: [{
				xtype: 'button', 
				text: 'Load',
				id: 'LoadButton',
				listeners: {click: function() {	
					Custom.LayoutLoad(CurrentPanel, Custom.getURLVar('id')); 
					Custom.ReportRender(CurrentPanel);
				}}
			},{
				xtype: 'button', 
				text: 'Erase',
				id: 'EraseButton',
				listeners: {click: function() {	
					Custom.LayoutErase(CurrentPanel);
					Custom.ReportRender(CurrentPanel);
				}}
			},{
				xtype: 'button', 
				text: 'EditSQL',
				id: 'EditSQLButton',
				listeners: {click: function() {	
					qbWindow.show();
					qbWindow.setValue(CurrentPanelRaw.DataSource);
				}}
			},{
				xtype: 'button', 
				text: 'Save',
				id: 'SaveButton',
				hidden: true,
				listeners: {click: function() {	
					Custom.LayoutSave(CurrentPanel);
				}}
			},
		]
	});
 
/* ----- DESIGN PANEL -----------------------------------------------*/
	var DesignPanel  =	Ext.create('Ext.form.Panel', {
		id: 'DesignPanel',
		//maximizable: false,
		//minimizable: false,
		//maximized: true,
		//closable: false,
		//width: Ext.getBody().getViewSize().width,
		height: Ext.getBody().getViewSize().height-2,
		//overflowY: 'scroll',
		//overflowX: 'scroll',
		//height: Ext.getBody().getViewSize().height,
		//border: true,
		//padding: '5 5 0 5',
		//monitorValid:true,
		items : [{ }],
		//layout: 'absolute', //vbox, hbox, auto, absolute
		waitTitle:'Connecting...',
        waitMsg:'Connecting...',
		renderTo:Ext.getBody()
	});
/*
	Ext.create('Ext.Viewport',{
		id: 'MainViewport',
		layout: {
			header: false,
			type: 'border'
		},
        items:[
		{
		},{
            region:'center',
            id:'main-tabs',
            deferredRender:false,
			autoScroll: true,
            activeTab:0,
			plain:true,
			layoutOnTabChange : true,
			items:[ToolBar,DesignPanel]
        }]
    });
*/
	//load standard layout printing
	//Custom.LayoutStdLoad();
	//load dei parametri del layout
	Custom.LayoutLoad(Custom.getURLVar('id')); 
	//visualizza Form
	Custom.ReportEdit();	
});