//*************************************************************************************************************//
//                GLOBAL VAR
var DefinitionPanel = {
    'id': 0,
    'ViewType': '',
    'name': '',
    'title': '',
    'WindowMode': 'acWindowNormal',

    'GuideToolTip': '',
    'GuideLink': '',

    'DataSource': '',
    'DataMode': 'EDIT',
    'DataSourceType': '',
    'DataSourceField': '',
    'DataWhere': '',

    'Skin': 'absolute',
    'RecordBar': true,
    'ToolBar': true,
    'AutoUpdate': false,
    'WindowWidth': 0,
    'WindowHeight': 0,
    'WindowX': 0,
    'WindowY': 0,
    'RequireValidation': false,
    'ActionSave': '',
    'ActionClone': '',

    'Json': [],
    'JSReportOBJ': null,
    'DataSourceAggregate': '',
    'DataSourceLeftAxis': '',
    'DataSourceTopAxis': '',
    'DataSourceRemote': false,

    'ParentIdName': '',
    'ParentIdStart': '',
    'ChildrenIdName': '',
    'DisplayField': '',

    'columnWidthSplit': '',
    'columnAction': '',
    'ActionColumn': '',
    'ActionTrueFalseColumn': '',
    'CheckColumn': '',
    'groupField': '',
    'groupStartCollapsed': true,
    'enumeratefield': '',

    'DataSources': [],
    'DataSourceFieldValue': '',
    'RowId': 0,
    'RowLimit': 1,
    'themeUI': themeUI,
    'Override': '',
    'rendered': false,
    'Valid': true,
    'LayoutDataSave': false,
    'ProcId': 0
};

var MainViewPort;
var Menu;
var MenuSearch;
var CurrentWindow = {};
var CurrentPanel = {};
var CurrentPanelRaw = {};
var CurrentToolBar = {};
var CurrentTaskBar = {};
var CurrentMenuIcon = {};
var DesignToolBar = {};
var CurrentProcRequestId = '';
var CurrentProcNoWait = false;
var CurrentObjectRequestId = '';
var LanguageManager = false;

var CurrentNFC = '';
var scaledim = 'medium'; //large medium little

var LastObjUpdated = '';
var LastProcRequestId = '';
var LastLayout = '';

var CurrentUser = [];
CurrentUser.UserArchive = '';

var RowLimitMax = 300;

//    RECORD OFFLINE SALVATAGGI                FUTURO NN USATO
var CurrentCollectorOffLineAjax = [];
var CurrentCollectorOffLineProc = [];

// WIDTH HEIGHT
var GridHeight;
var GridWidth;

var qbWindow;

var isIE = navigator.userAgent.indexOf('MSIE') !== -1 || !!document.documentMode;
var isEdge = !isIE && !!window.StyleMedia;
//*************************************************************************************************************//
//                TIMER UPDATE
var FormObjUpdate = {};
var task = Ext.TaskManager.start({
    run: function () {
        if ((CurrentPanel != undefined) && (CurrentPanelRaw.ViewType == 'form') && (CurrentPanelRaw.AutoUpdate > 0)) {
            obj = {
                datasource: CurrentPanelRaw.DataSource,
                datasourcetype: CurrentPanelRaw.DataSourceType,
                datamode: CurrentPanelRaw.DataMode,
                rowlimit: 1,
                name: 'Form00',
                datawhere: CurrentPanelRaw.DataWhere,
                xtype: ''
            };
            if ((CurrentPanelRaw.DataSourceType != 'NONE') && (CurrentPanelRaw.DataSourceType != 'WF') && (CurrentPanelRaw.DataSourceType != '')) {
                Custom.ObjLoadDataSource(obj, CurrentPanelRaw, true);
            } else {
                Custom.RefreshAllDataStore();
            }
        }
    },
    interval: 3000
});

/*
if (id == 'ok') {
                Ext.TaskManager.start(task);
            } else {
                Ext.MessageBox.updateText('Paused!');
                Ext.TaskManager.stop(task);
            }
*/

//*************************************************************************************************************//
//                LAYOUT LOAD SAVE
Custom.LayoutLoad = function (LayoutId, LayoutViewType, LayoutWhere) {
    CurrentPanelRaw = clone(DefinitionPanel);
    Ext.Ajax.request({
        method: 'GET',
        type: 'ajax',
        async: false,
        url: 'includes/io/LayoutReadRun.php',
        params: {
            layoutid: LayoutId,
            layoutthemename: themeName,
            layoutviewtype: LayoutViewType,
            layoutwhere: LayoutWhere
        },
        success: function (response, opts) {
            var JsonAppo;
            try {
                //var JsonAppo = Ext.util.JSON.decode(response.responseText);
                var appo = response.responseText;
                appo = appo.replace(/<source>"/gi, "");
                appo = appo.replace(/"<source>/gi, "");
                JsonAppo = eval('(' + appo + ')');
            } catch (e) {
                Ext.MessageBox.show({
                    title: 'Error LayoutLoad',
                    msg: response.responseText,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                });
                return;
            }
            if (JsonAppo.success) {
                if (JsonAppo.data[0].id !== undefined) {
                    CurrentPanelRaw.id = JsonAppo.data[0].id;
                    CurrentPanelRaw.layoutid = JsonAppo.data[0].id;
                }
                if (JsonAppo.data[0].name !== undefined) {
                    CurrentPanelRaw.name = JsonAppo.data[0].name;
                }
                if (JsonAppo.data[0].title !== undefined) {
                    CurrentPanelRaw.title = JsonAppo.data[0].title;
                }
                if (JsonAppo.data[0].viewtype !== undefined) {
                    CurrentPanelRaw.ViewType = JsonAppo.data[0].viewtype;
                }
                if (JsonAppo.data[0].layoutjson !== undefined) {
                    CurrentPanelRaw.Json = JsonAppo.data[0].layoutjson;
                }

                //form
                if (JsonAppo.data[0].actionsave !== undefined) {
                    CurrentPanelRaw.ActionSave = JsonAppo.data[0].actionsave;
                }
                if (JsonAppo.data[0].actionclone !== undefined) {
                    CurrentPanelRaw.ActionClone = JsonAppo.data[0].actionclone;
                }
                if (JsonAppo.data[0].requirevalidation !== undefined) {
                    CurrentPanelRaw.RequireValidation = JsonAppo.data[0].requirevalidation;
                }
                if (JsonAppo.data[0].layoutskin !== undefined) {
                    CurrentPanelRaw.Skin = JsonAppo.data[0].layoutskin;
                }
                if (CurrentPanelRaw.Skin == '') {
                    CurrentPanelRaw.Skin = 'absolute';
                }
                if (JsonAppo.data[0].recordbar !== undefined) {
                    CurrentPanelRaw.RecordBar = JsonAppo.data[0].recordbar;
                }
                if (JsonAppo.data[0].toolbar !== undefined) {
                    CurrentPanelRaw.ToolBar = JsonAppo.data[0].toolbar;
                }
                if (JsonAppo.data[0].autoupdate !== undefined) {
                    CurrentPanelRaw.AutoUpdate = JsonAppo.data[0].autoupdate;
                }
                if (JsonAppo.data[0].datamode !== undefined) {
                    CurrentPanelRaw.DataMode = JsonAppo.data[0].datamode;
                }

                //db
                if (JsonAppo.data[0].datasource !== undefined) {
                    CurrentPanelRaw.DataSource = JsonAppo.data[0].datasource;
                }
                if (JsonAppo.data[0].datasourcetype !== undefined) {
                    CurrentPanelRaw.DataSourceType = JsonAppo.data[0].datasourcetype;
                }
                if (JsonAppo.data[0].datasourcefield !== undefined) {
                    CurrentPanelRaw.DataSourceField = JsonAppo.data[0].datasourcefield;
                }
                if (JsonAppo.data[0].jsonfilter !== undefined) {
                    CurrentPanelRaw.JsonFilter = JsonAppo.data[0].jsonfilter;
                }

                //pivot
                if (JsonAppo.data[0].aggregate !== undefined) {
                    CurrentPanelRaw.DataSourceAggregate = JsonAppo.data[0].aggregate;
                }
                if (JsonAppo.data[0].leftaxis !== undefined) {
                    CurrentPanelRaw.DataSourceLeftAxis = JsonAppo.data[0].leftaxis;
                }
                if (JsonAppo.data[0].topaxis !== undefined) {
                    CurrentPanelRaw.DataSourceTopAxis = JsonAppo.data[0].topaxis;
                }
                if (JsonAppo.data[0].remote !== undefined) {
                    CurrentPanelRaw.DataSourceRemote = JsonAppo.data[0].remote;
                }

                //theme
                if (JsonAppo.data[0].layoutoverride !== undefined) {
                    CurrentPanelRaw.Override = JsonAppo.data[0].layoutoverride;
                }
                if (JsonAppo.data[0].layoutthemeui !== undefined) {
                    CurrentPanelRaw.themeUI = JsonAppo.data[0].layoutthemeui;
                }

                //grid
                if (JsonAppo.data[0].columnwidthsplit !== undefined) {
                    CurrentPanelRaw.columnWidthSplit = JsonAppo.data[0].columnwidthsplit;
                }
                if (JsonAppo.data[0].columnaction !== undefined) {
                    CurrentPanelRaw.columnAction = JsonAppo.data[0].columnaction;
                }
                if (JsonAppo.data[0].groupfield !== undefined) {
                    CurrentPanelRaw.groupField = JsonAppo.data[0].groupfield;
                }
                if (JsonAppo.data[0].groupstartcollapsed !== undefined) {
                    CurrentPanelRaw.groupStartCollapsed = JsonAppo.data[0].groupstartcollapsed;
                }
                if (JsonAppo.data[0].enumeratefield !== undefined) {
                    CurrentPanelRaw.enumeratefield = JsonAppo.data[0].enumeratefield;
                }
                if (JsonAppo.data[0].actioncolumn !== undefined) {
                    CurrentPanelRaw.ActionColumn = JsonAppo.data[0].actioncolumn;
                }
                if (JsonAppo.data[0].actiontruefalse !== undefined) {
                    CurrentPanelRaw.ActionTrueFalseColumn = JsonAppo.data[0].actiontruefalse;
                }
                if (JsonAppo.data[0].checkcolumn !== undefined) {
                    CurrentPanelRaw.CheckColumn = JsonAppo.data[0].checkcolumn;
                }
                if (JsonAppo.data[0].detailmodal !== undefined) {
                    CurrentPanelRaw.DetailModal = JsonAppo.data[0].detailmodal;
                }

                //window
                if (JsonAppo.data[0].windowmode !== undefined) {
                    CurrentPanelRaw.WindowMode = JsonAppo.data[0].windowmode;
                }
                if (JsonAppo.data[0].windowwidth !== undefined) {
                    CurrentPanelRaw.WindowWidth = parseInt(JsonAppo.data[0].windowwidth);
                }
                if (JsonAppo.data[0].windowheight !== undefined) {
                    CurrentPanelRaw.WindowHeight = parseInt(JsonAppo.data[0].windowheight);
                }
                if (JsonAppo.data[0].windowx !== undefined) {
                    CurrentPanelRaw.WindowX = JsonAppo.data[0].windowx;
                }
                if (JsonAppo.data[0].windowy !== undefined) {
                    CurrentPanelRaw.WindowY = JsonAppo.data[0].windowy;
                }

                //guide
                if (JsonAppo.data[0].guidetooltip !== undefined) {
                    CurrentPanelRaw.GuideToolTip = JsonAppo.data[0].guidetooltip;
                }
                if (JsonAppo.data[0].guidelink !== undefined) {
                    CurrentPanelRaw.GuideLink = JsonAppo.data[0].guidelink;
                }

                //tree
                if (JsonAppo.data[0].parentidname !== undefined) {
                    CurrentPanelRaw.ParentIdName = JsonAppo.data[0].parentidname;
                }
                if (JsonAppo.data[0].parentidstart !== undefined) {
                    CurrentPanelRaw.ParentIdStart = JsonAppo.data[0].parentidstart;
                }
                if (JsonAppo.data[0].childrenidname !== undefined) {
                    CurrentPanelRaw.ChildrenIdName = JsonAppo.data[0].childrenidname;
                }
                if (JsonAppo.data[0].displayfield !== undefined) {
                    CurrentPanelRaw.DisplayField = JsonAppo.data[0].displayfield;
                }

            } else {
                Ext.MessageBox.show({
                    title: 'Error LayoutLoad',
                    msg: JsonAppo.message,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                });
            }
        },
        failure: function (response) {
            if (Custom.isJson(response.responseText)) {
                Ext.MessageBox.show({
                    title: "Error LayoutLoad",
                    msg: 'Risposta del server inaspettata!!! A ' + response.responseText.message,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                });
            } else {
                Ext.MessageBox.show({
                    title: "Error LayoutLoad",
                    msg: 'Risposta del server inaspettata!!! B ' + response,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                });
            }
        }
    });
};
Custom.LayoutSaveRun = function (LayoutId) {
    //Invia i dati al server
    Ext.Ajax.request({
        method: 'POST',
        async: false,
        params: {
            layoutid: CurrentPanelRaw.id,
            aggregate: CurrentPanelRaw.DataSourceAggregate,
            leftAxis: CurrentPanelRaw.DataSourceLeftAxis,
            topAxis: CurrentPanelRaw.DataSourceTopAxis,
            columnwidthsplit: CurrentPanelRaw.columnWidthSplit,
            remote: CurrentPanelRaw.DataSourceRemote,
            override: CurrentPanelRaw.override,
        },
        url: 'includes/io/LayoutWriteRun.php',
        success: function (response) {
            var JsonAppo = Ext.util.JSON.decode(response.responseText);
            if (JsonAppo.success) {
                Ext.toast(JsonAppo.message);
            } else {
                Ext.MessageBox.show({
                    title: 'Error LayoutSaveRun',
                    msg: JsonAppo.message,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                });
            }
        },
        failure: function (response) {
            if (Custom.isJson(response.responseText)) {
                Ext.MessageBox.show({
                    title: "Error LayoutSaveRun",
                    msg: 'Risposta del server inaspettata!!! C ' + response.responseText.message,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                });
            } else {
                Ext.MessageBox.show({
                    title: "Error LayoutInPivot3D",
                    msg: 'Risposta del server inaspettata!!! D ' + response,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                });
            }
        }
    });
};
Custom.MenuRefresh = function () {
    var DS_MenuStore = Ext.data.StoreManager.lookup('MenuStore');
    DS_MenuStore.getRootNode().removeAll();
    DS_MenuStore.reload();
};

//*************************************************************************************************************//
//                LAYOUT RENDER COMMON
Custom.LayoutRender = function (LayoutId, ForceViewType, ForceDataWhere, ForceDataMode, ForceWindowMode, ForceTitle, ParentObj) {
    console.log('LayoutRender');

    if ((CurrentDeviceType != 'desktop')) {
        console.log('History Render LayoutId:' + LayoutId + 'ForceViewType:' + ForceViewType + 'ForceDataMode:' + ForceDataMode + 'ForceWindowMode:' + ForceWindowMode);
        Ext.History.add(LayoutId + ':' + ForceViewType + ':' + ForceDataWhere + ':' + ForceDataMode + ':' + ForceWindowMode + ':' + ForceTitle);
    }

    // LAYOUT SPEC LOAD FROM SRV
    Custom.LayoutLoad(LayoutId, ForceViewType, ForceDataWhere);

    //rendo unico la window
    CurrentPanelRaw.RowId = 0;
    CurrentPanelRaw.Valid = true;
    CurrentPanelRaw.ParentObj = ParentObj;

    //rendo unico la window
    CurrentPanelRaw.name = CurrentPanelRaw.name + '_' + Math.floor((Math.random() * 1000) + 1);
    console.log('CurrentPanelRaw:' + CurrentPanelRaw.name);

    //IMPOSTO title VISUALIZZAZIONE
    if (CurrentPanelRaw.title == '') {
        CurrentPanelRaw.title = CurrentPanelRaw.name;
    }
    if ((ForceTitle === undefined) || (ForceTitle == '')) {
        ForceTitle = CurrentPanelRaw.title;
    }
    CurrentPanelRaw.title = ForceTitle;

    //IMPOSTO ViewType FORMA DI VISUALIZZAZIONE
    if ((ForceViewType === undefined) || (ForceViewType == '')) {
        ForceViewType = CurrentPanelRaw.ViewType;
    }
    CurrentPanelRaw.ViewType = ForceViewType;
    console.log('CurrentPanelRaw.ViewType:' + ForceViewType);

    //IMPOSTO WindowMode dialog external DI PRESENTAZIONE
    if ((ForceWindowMode === undefined) || (ForceWindowMode == '')) {
        ForceWindowMode = CurrentPanelRaw.WindowMode;
    }
    if ((CurrentDeviceType == 'tablet') && (ForceWindowMode != 'acPrint')) {
        //DAFRARE MODIFICA APRI FORM DA GRID INV CP
        if ((ForceWindowMode != 'acDialog') && (ForceWindowMode != 'acDialogModal')) {
            ForceWindowMode = 'acWindowNormal';
        }
    }
    else if (CurrentDeviceType == 'app') {
        ForceWindowMode = 'acDialogModal';
    }
    CurrentPanelRaw.WindowMode = ForceWindowMode;

    //if ( (CurrentPanelRaw.WindowMode == 'acDialogModal') || (CurrentPanelRaw.WindowMode == 'acDialog') ){
    //	CurrentPanelRaw.WindowMode = 'acDialogExternal';
    //}
    console.log('CurrentPanelRaw.WindowMode:' + ForceWindowMode);
    if (CurrentPanelRaw.WindowMode === 'acDialogExternal') {
        Custom.openLinkInNewWindow('?layoutid=' + LayoutId + '&title=' + ForceTitle + '&datawhere=' + ForceDataWhere);
        return;
    }

    //CANCELLO I DS se apro nella window
    if (ForceWindowMode == 'acWindowNormal') {
        var centerView = MainViewPort.getComponent('centerViewPortId');
        var DesignPanel = centerView.getComponent('DesignPanel');
        Custom.ObjDestroyAllDataSource(DesignPanel.definitionraw.name);
    }

    //IMPOSTO BLOCCHI SUI DATI    
    if ((CurrentPanelRaw.DataMode == null) || (CurrentPanelRaw.DataMode == '')) CurrentPanelRaw.DataMode = 'edit';
    if ((ForceDataMode !== undefined) && (ForceDataMode != '')) {
        CurrentPanelRaw.DataMode = ForceDataMode;
    }
    if (ForceDataWhere !== undefined) {
        CurrentPanelRaw.DataWhere = ForceDataWhere;
    }

    //DATA LOAD DEL PANEL/FORM
    if ((CurrentPanelRaw.DataSourceType != '') && (CurrentPanelRaw.DataSourceType != 'NONE') && (CurrentPanelRaw.DataSource != '')) {
        var obj;
        switch (ForceViewType) {
            case 'form':
                obj = {
                    datasource: CurrentPanelRaw.DataSource,
                    datasourcetype: CurrentPanelRaw.DataSourceType,
                    datamode: CurrentPanelRaw.DataMode,
                    rowlimit: 1,
                    name: 'Form00',
                    datawhere: CurrentPanelRaw.DataWhere,
                    xtype: ''
                };
                Custom.ObjLoadDataSource(obj, CurrentPanelRaw, false);
                //PROMIZE NELLA LOAD DELLO STORE Custom.LayoutRenderExt();
                break;
            case 'grid':
                obj = {
                    datasource: CurrentPanelRaw.DataSource,
                    datasourcetype: CurrentPanelRaw.DataSourceType,
                    datamode: CurrentPanelRaw.DataMode,
                    rowlimit: RowLimitMax,
                    layouteditorid: CurrentPanelRaw.id,
                    name: 'Form00',
                    datawhere: CurrentPanelRaw.DataWhere,
                    groupField: CurrentPanelRaw.groupField,
                    groupStartCollapsed: CurrentPanelRaw.groupStartCollapsed,
                    columnDefaultVisible: false,
                    xtype: 'grid'
                };
                Custom.ObjLoadDataSource(obj, CurrentPanelRaw, false);
                Custom.LayoutRenderExt();
                break;
            case 'pivot':
                obj = {
                    datasource: CurrentPanelRaw.DataSource,
                    datasourcetype: CurrentPanelRaw.DataSourceType,
                    datamode: CurrentPanelRaw.DataMode,
                    rowlimit: -1,
                    layouteditorid: CurrentPanelRaw.id,
                    name: 'Form00',
                    datawhere: CurrentPanelRaw.DataWhere,
                    xtype: 'pivot'
                };
                Custom.ObjLoadDataSource(obj, CurrentPanelRaw, false);
                //PROMIZE NELLA LOAD DELLO STORE Custom.LayoutRenderExt();
                break;
            case 'report':
                obj = {
                    datasource: CurrentPanelRaw.DataSource,
                    datasourcetype: CurrentPanelRaw.DataSourceType,
                    datamode: CurrentPanelRaw.DataMode,
                    rowlimit: -1,
                    layouteditorid: CurrentPanelRaw.id,
                    name: 'Form00',
                    datawhere: CurrentPanelRaw.DataWhere,
                    xtype: ''
                };
                //mainReportExt
                //Custom.ObjLoadDataSource(obj, CurrentPanelRaw, false);
                Custom.LayoutRenderExt();
                break;
            case 'label':
                obj = {
                    datasource: CurrentPanelRaw.DataSource,
                    datasourcetype: CurrentPanelRaw.DataSourceType,
                    datamode: CurrentPanelRaw.DataMode,
                    rowlimit: -1,
                    layouteditorid: CurrentPanelRaw.id,
                    name: 'Form00',
                    datawhere: CurrentPanelRaw.DataWhere,
                    xtype: ''
                };
                Custom.ObjLoadDataSource(obj, CurrentPanelRaw, false);
                Custom.LayoutRenderExt();
                break;
            case 'raw':
                Custom.LayoutRenderExt();
                break;
            case 'treegrid':
                obj = {
                    datasource: CurrentPanelRaw.DataSource,
                    datasourcetype: CurrentPanelRaw.DataSourceType,
                    datamode: CurrentPanelRaw.DataMode,
                    rowlimit: -1,
                    layouteditorid: CurrentPanelRaw.id,
                    name: 'Form00',
                    datawhere: CurrentPanelRaw.DataWhere,
                    xtype: ''
                };
                Custom.ObjLoadDataSource(obj, CurrentPanelRaw, false);
                Custom.LayoutRenderExt();
                break;
            /*
            //pivot e report hanno il loro datasource
            case 'pivot':
            obj = {
            datasource: CurrentPanelRaw.DataSource,
            datasourcetype: CurrentPanelRaw.DataSourceType,
            datamode: CurrentPanelRaw.DataMode,
            rowlimit: -1,
            layouteditorid: CurrentPanelRaw.id,
            name: 'Form00',
            datawhere: CurrentPanelRaw.DataWhere,
            xtype:''
            };
            CurrentPanelRaw.WindowMode = ForceWindowMode;
            Custom.ObjLoadDataSource(obj, CurrentPanelRaw, false);
            break;
            case 'report':
            obj = {
            datasource: CurrentPanelRaw.DataSource,
            datasourcetype: CurrentPanelRaw.DataSourceType,
            datamode: CurrentPanelRaw.DataMode,
            rowlimit: -1,
            layouteditorid: CurrentPanelRaw.id,
            name: 'Form00',
            datawhere: CurrentPanelRaw.DataWhere,
            xtype:''
            };
            CurrentPanelRaw.WindowMode = ForceWindowMode;
            Custom.ObjLoadDataSource(obj, CurrentPanelRaw, false);
            break;
            case 'label':
            obj = {
            datasource: CurrentPanelRaw.DataSource,
            datasourcetype: CurrentPanelRaw.DataSourceType,
            datamode: CurrentPanelRaw.DataMode,
            rowlimit: -1,
            layouteditorid: CurrentPanelRaw.id,
            name: 'Form00',
            datawhere: CurrentPanelRaw.DataWhere,
            xtype:''
            };
            CurrentPanelRaw.WindowMode = ForceWindowMode;
            Custom.ObjLoadDataSource(obj, CurrentPanelRaw, false);
            break;
             */
            default:
                Custom.LayoutRenderExt();
        }
    }
    else {
        //form senza record dati origine
        Custom.LayoutRenderExt();
    }
};
Custom.LayoutRenderExt = function () {
    var ForceWindowMode = CurrentPanelRaw.WindowMode;
    var ForceViewType = CurrentPanelRaw.ViewType;
    var ForceDataMode = CurrentPanelRaw.DataMode;

    console.log('LayoutRenderExt CurrentPanelRaw.ViewTypeVIEW:' + ForceViewType);
    switch (ForceViewType) {
        case 'form':
            Custom.LayoutInForm(ForceWindowMode);
            break;
        case 'grid':
            Custom.LayoutInGrid(ForceWindowMode);
            break;
        case 'treegrid':
            Custom.LayoutInTreeGrid(ForceWindowMode);
            break;
        case 'pivot':
            Custom.LayoutInPivot(ForceWindowMode);
            break;
        case 'pivot3d':
            Custom.LayoutInPivot3D(ForceWindowMode);
            break;
        case 'report':
            Custom.LayoutInReport(ForceWindowMode);
            break;
        case 'label':
            Custom.LayoutInLabel(ForceWindowMode);
            ForceViewType = 'form';
            break;
        case 'raw':
            Custom.LayoutInRaw(ForceWindowMode);
            ForceViewType = 'form';
            break;
    }

    console.log('LayoutRenderExt ForceDataMode:' + ForceDataMode);
    //DATA MODE ForceDataMode (edit,new,clone,read)
    var ButtonRecNew = CurrentToolBar.getComponent('ButtonRecNew');
    var ButtonRecSave = CurrentToolBar.getComponent('ButtonRecSave');
    var ButtonRecDel = CurrentToolBar.getComponent('ButtonRecDel');
    var ButtonRecPrint = CurrentToolBar.getComponent('ButtonRecPrint');
    var ButtonRecSaveColumnDisp = CurrentToolBar.getComponent('ButtonRecSaveColumnDisp');
    var ButtonRecClone = CurrentToolBar.getComponent('ButtonRecClone');
    var ButtonLock = CurrentToolBar.getComponent('ButtonLock');

    var ButtonRecRefresh = CurrentToolBar.getComponent('ButtonRecRefresh');
    var ButtonSendObject = CurrentToolBar.getComponent('ButtonSendObject');
    var ButtonChat = CurrentToolBar.getComponent('ButtonChat');

    var ButtonViewGrid = CurrentToolBar.getComponent('ButtonViewGrid');
    var ButtonViewExchangeExcel = CurrentToolBar.getComponent('ButtonViewExchangeExcel');

    var ButtonHistory = CurrentToolBar.getComponent('ButtonHistory');
    var ButtonLanguage = CurrentToolBar.getComponent('ButtonLanguage');
    var ButtonActivity = CurrentToolBar.getComponent('ButtonActivity');
    var ButtonDocuments = CurrentToolBar.getComponent('ButtonDocuments');
    var ButtonNote = CurrentToolBar.getComponent('ButtonNote');

    console.log('ForceDataMode:' + ForceDataMode);


    //button bar 
    if (CurrentDeviceType == 'desktop') {

        //manage toolbar
        switch (ForceViewType) {
            case 'form':
                ButtonViewGrid.enable();
                ButtonRecPrint.hide();
                ButtonRecSaveColumnDisp.hide();
                switch (ForceDataMode) {
                    case 'read':

                        ButtonRecNew.disable();
                        ButtonRecClone.disable();
                        ButtonRecDel.disable();
                        ButtonRecSave.disable();
                        ButtonRecRefresh.enable();
                        break;
                    case 'edit':

                        ButtonRecNew.enable();
                        ButtonRecClone.enable();
                        ButtonRecDel.enable();
                        ButtonRecSave.enable();
                        ButtonRecRefresh.enable();
                        break;
                    case 'filter':

                        ButtonRecNew.disable();
                        ButtonRecClone.disable();
                        ButtonRecDel.disable();
                        ButtonRecSave.disable();
                        ButtonRecRefresh.disable();
                        Custom.FormSetFind();
                        break;
                    case 'add':

                        ButtonRecNew.disable();
                        ButtonRecClone.disable();
                        ButtonRecDel.disable();
                        ButtonRecSave.enable();
                        ButtonRecRefresh.disable();
                        break;
                    case 'clone':

                        ButtonRecNew.disable();
                        ButtonRecClone.disable();
                        ButtonRecDel.disable();
                        ButtonRecSave.enable();
                        ButtonRecRefresh.disable();
                        break;
                }
                break;
            case 'grid':
                ButtonViewGrid.disable();
                ButtonRecNew.disable();
                ButtonRecClone.disable();
                ButtonRecDel.disable();
                ButtonRecSave.disable();
                ButtonRecPrint.hide();
                ButtonRecSaveColumnDisp.show();
                ButtonRecRefresh.disable();
                break;
            case 'report':
                ButtonViewGrid.enable();
                ButtonRecNew.disable();
                ButtonRecClone.disable();
                ButtonRecDel.disable();
                ButtonRecSave.enable();
                ButtonRecPrint.show();
                ButtonRecSaveColumnDisp.hide();
                ButtonRecRefresh.disable();
                break;
        }
        if ((CurrentUser.UserManager == 0) && (CurrentUser.UserDeveloper == 0) && (CurrentUser.UserAdmin == 0)) {
            ButtonViewGrid.disable();
            ButtonViewExchangeExcel.disable();
            ButtonHistory.disable();
        }
    }

    if (CurrentDeviceType != 'desktop') {
        ButtonRecClone.hide();
        ButtonViewExchangeExcel.hide();
        ButtonHistory.hide();
        ButtonLanguage.hide();
        ButtonActivity.hide();
        ButtonDocuments.hide();
        ButtonNote.hide();
    }

    if (CurrentPanelRaw.ToolBar == false) {
        ButtonRecNew.hide();
        ButtonRecSave.hide();
        ButtonRecDel.hide();
        ButtonRecPrint.hide();
        ButtonRecSaveColumnDisp.hide();
        ButtonLock.hide();
        ButtonRecClone.hide();
        ButtonRecRefresh.hide();
        ButtonViewExchangeExcel.hide();
        ButtonHistory.hide();
        ButtonLanguage.hide();
        ButtonActivity.hide();
        ButtonDocuments.hide();
        ButtonNote.hide();
        ButtonViewGrid.hide();
        ButtonSendObject.hide();
        ButtonChat.hide();
    }
    if (CurrentPanelRaw.RecordBar == false) {
        ButtonRecNew.hide();
        ButtonRecSave.hide();
        ButtonRecDel.hide();
        ButtonRecPrint.hide();
        ButtonLock.hide();
        ButtonRecClone.hide();
    }
    //SAVE CURRENT
    CurrentPanelRaw.ViewType = ForceViewType;
    CurrentPanelRaw.DataMode = ForceDataMode;

    CurrentPanel.definitionraw = clone(CurrentPanelRaw);
};
Custom.SendToWebSocket = function (command, ip, port, protocol) {
    if (command != '') {
        var url = "ws://localhost:8080/send?command=" + command;
        if (!((protocol === undefined) || (protocol === ''))) {
            url = url + "&protocol=" + protocol;
        }
        if (!((port === undefined) || (port === ''))) {
            url = url + "&port=" + port;
        }
        if (!((ip === undefined) || (ip === ''))) {
            url = url + "&ip=" + ip;
        }

        if (("WebSocket" in window)) {
            console.log('socket:' + 'send:' + command);
            //var command = "3" + "101" + "1" + "01" + "22" + "4005001 TEST          " + "000000001";
            try {
                var ws = new WebSocket(url);
                console.log('Sent');
            } catch (e) {
                console.log('Sending failed ... .disconnected failed');
            }

            //websocketUrl  = "ws://localhost:8080/send?protocol=" + protocol + "&command=" + command;
            //websocketWaiter();
            /*
            ws.onopen = function() {
                console.log ('socket:' + 'open' );
            };
            ws.onmessage = function(evt) {
                var received_msg = evt.data;
                console.log ('socket:' + 'receive:' + received_msg);
            };
            ws.onclose = function() {
                console.log ('socket:' + 'close:' );
            };
            */
        } else {
            // The browser doesn't support WebSocket
            console.log('socket:' + 'supported:');
            alert('WebSocket NOT supported by your Browser!');
        }
    }
}
Custom.SendToWebUSB = function (command, ip, port, protocol) {
    if (command != '') {
        const getDevices = async () => navigator.usb.getDevices().then(([printer]) => Promise.resolve(printer));
        const sendMessageToPrinter = (device, content) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(content);
            console.log('trying ', endpointNumber)
            return device.transferOut(endpointNumber, data);
        }
        const startPrint = async (device, content) => sendMessageToPrinter(device, content.join('')).catch(e => {
            if (e.message.includes('The specified endpoint is not part of a claimed and selected alternate interface')) {
                if (endpointNumber < 15) {
                    endpointNumber = endpointNumber + 1;
                    startPrint(device, content);
                    return;
                }
                console.log('failed!');
                return;
            }
            console.error('Send Error:', e);
        }).then(e => console.log(e))
        let device;
        //SELECT PRINTER
        const requestPrinter = () => {
            navigator.usb.requestDevice({
                filters: [],
            });
        }
        //CONNECT PRINTER
        const initPrinter = async () => {
            device = await getDevices();

            await device.open();
            await device.selectConfiguration(1);

            device.claimInterface(
                device.configuration.interfaces[0].interfaceNumber
            );

            endpointNumber = 1;
        }
        //SEND DATA
        startPrint(device, [command]);

    }
}

//*************************************************************************************************************//
//                LAYOUT RENDERING GRID FORM PIVOT REPORT ETC...
Custom.PanelWindowModeChange = function (ForceWindowMode) {
    var CurWindow = [];
    var CurPanel = [];
    var CurToolBar = [];

    if (CurrentPanelRaw.title == '') {
        if ((CurrentUser.UserDeveloper)) {
            CurrentPanelRaw.title = CurrentPanelRaw.name + ' (' + CurrentPanelRaw.id + ')' + ' ' + CurrentPanelRaw.DataWhere;
        } else {
            CurrentPanelRaw.title = CurrentPanelRaw.name;
        }
    }
    if ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone')) {
        CurrentPanelRaw.title = null
    };

    //INDIPENDENT
    if ((ForceWindowMode == 'acDialog') || (ForceWindowMode == 'acDialogModal')) {
        if (ForceWindowMode == 'acDialogModal') {
            Custom.CreateLayoutIndipendent(true);
        } else {
            Custom.CreateLayoutIndipendent();
        }
        CurWindow = Ext.getCmp(CurrentPanelRaw.name + '_Window');
        CurPanel = CurWindow.getComponent(CurrentPanelRaw.name + '_Panel');
        CurToolBar = CurWindow.getComponent('toolbarmenu');
    }
    //DESIGN
    else {
        CurWindow = MainViewPort.getComponent('centerViewPortId');
        CurPanel = CurWindow.getComponent('DesignPanel');
        CurToolBar = CurWindow.getComponent('toolbarmenu');

        //if (CurPanel.layout.config.type != CurrentPanelRaw.Skin) {
        console.log('ChangeSKIN:acWindowNormal' + 'Actual:' + CurPanel.layout.config.type + 'Requested:' + CurrentPanelRaw.Skin);
        CurPanel.destory;
        CurWindow.remove(CurPanel);

        var DesignPanelNew = Ext.create('Ext.form.Panel', {
            itemId: 'DesignPanel',
            name: 'DesignPanel',
            maximizable: false,
            minimizable: false,
            maximized: true,
            closable: false,
            title: CurrentPanelRaw.title,
            width: '100%',
            iconCls: CurrentPanelRaw.iconCls,
            scrollable: true,
            //overflowY: ((CurrentPanelRaw.Skin == 'absolute') ? 'scroll' : false),
            //overflowX: ((CurrentPanelRaw.Skin == 'absolute') ? 'scroll' : false),
            definitionraw: '',
            rendered: false,
            //height: "100%",
            height: Ext.getBody().getViewSize().height - 50,
            //border: true,
            //padding: '5 5 0 5',
            monitorValid: true,
            trackResetOnLoad: true,
            items: [{}],
            layout: {
                type: CurrentPanelRaw.Skin, //vbox, hbox, auto, absolute,
                align: 'stretch'
            },
            waitTitle: 'Connecting...',
            waitMsg: 'Connecting...',
            listeners: {
                afterrender: onAfterRenderDesignPanel,
                resize: function () {
                    console.log('resizepanel');
                },
                focus: function () {
                    var me = this.down('form');
                    Custom.setCurrentPanelForm(me);
                    console.log('focus window ' + CurrentPanelRaw.name);
                },
                activate: function () {
                    //if (me.definitionraw != '') CurrentPanelRaw = clone(this.definitionraw);
                    //CurrentPanel = me;
                    //var CurrentWindow = MainViewPort.getComponent('centerViewPortId');
                    //CurrentToolBar  = CurrentWindow.getComponent('toolbarmenu');
                    //console.log('activate window ' + CurrentPanelRaw.name);
                },

                dirtychange: function (v, b, c) {
                    var me = this.down('form');
                    console.log('DesignPanelNew dirtychange');
                    console.log(b)
                },
            }
        });
        CurWindow.add(DesignPanelNew);
        CurPanel = DesignPanelNew;

        //ATTIVA TASTI SPECIALI PER QUEL LAYOUT SE FORM
        if (CurrentPanelRaw.ViewType == 'form') {
            if (CurToolBar) Custom.ToolBarProc(CurToolBar);
        }

        if (CurrentDeviceType != 'desktop') {
            if (CurToolBar) {
                var ToolBarLabel = CurToolBar.getComponent('ToolBarLabel');
                if (ToolBarLabel) ToolBarLabel.setText(CurrentPanelRaw.title);
            }
        }
    }
    CurrentWindow = CurWindow;
    CurrentToolBar = CurToolBar;
    CurrentPanel = CurPanel;
    //CSS
    if ((themeName == 'azzurra') && (CurrentPanelRaw.themeUI != '')) {
        CurrentPanel.setUI(CurrentPanelRaw.themeUI + '-panel');
    }
};
Custom.LayoutInGrid = function (ForceWindowMode) {
    console.log('LayoutInGrid');

    //RENDER SHOW dipendent indipendent WindowMode
    if ((ForceWindowMode === undefined) || (ForceWindowMode === '')) {
        ForceWindowMode = CurrentPanelRaw.WindowMode;
    }
    //if (CurrentPanelRaw.Skin === '') {
    CurrentPanelRaw.Skin = 'absolute';
    if ((CurrentPanelRaw.DetailModal !== undefined) && (CurrentPanelRaw.DetailModal !== '') && (CurrentPanelRaw.DetailModal !== null)) {
        CurrentPanelRaw.ForceWindowMode = CurrentPanelRaw.DetailModal;
    }
    Custom.PanelWindowModeChange(ForceWindowMode);

    var DS_Form00 = Ext.data.StoreManager.lookup('DS_' + CurrentPanelRaw.name + '_' + 'Form00');

    if ((CurrentPanelRaw.DataMode == null) || (CurrentPanelRaw.DataMode == '')) CurrentPanelRaw.DataMode = 'edit';

    if (CurrentPanelRaw.RecordBar == false) {
        CurrentPanelRaw.DataMode = 'read';
    }
    if (CurrentPanelRaw.ToolBar == false) {
        CurrentPanelRaw.DataMode = 'read';
    }

    var gridtable = Ext.create('dynamicgrid', {
        name: 'FormInGrid',
        itemId: 'FormInGrid',
        fieldLabel: '',
        datasource: CurrentPanelRaw.DataSource,
        datasourcetype: CurrentPanelRaw.DataSourceType,
        keyField: CurrentPanelRaw.DataSourceField,
        valueField: CurrentPanelRaw.DataSourceField,
        displayField: CurrentPanelRaw.DataSourceField,
        columnWidthSplit: CurrentPanelRaw.columnWidthSplit,
        columnAction: CurrentPanelRaw.columnAction,
        groupField: (((CurrentPanelRaw.groupField != true) && (CurrentPanelRaw.groupField != false) && (CurrentPanelRaw.groupField != '')) ? CurrentPanelRaw.groupField : true),
        groupSummary: ((CurrentPanelRaw.groupField != '') ? true : false),
        groupStartCollapsed: CurrentPanelRaw.groupStartCollapsed,
        enumerateField: CurrentPanelRaw.enumeratefield,
        navigationbutton: false,
        allowfilter: true,
        //allowfilterbar: true,
        allowadd: (CurrentPanelRaw.DataMode != 'read' ? true : false),
        allowedit: (CurrentPanelRaw.DataMode != 'read' ? true : false),
        allowdelete: (CurrentPanelRaw.DataMode != 'read' ? true : false),
        allowexport: true,
        allowsearch: true,
        ParentCmbSearch: ((CurrentPanelRaw.DataMode == 'search') ? LastObjUpdated : null),
        CheckColumn: CurrentPanelRaw.CheckColumn,
        CheckColumnCleanUp: true,
        NumberColumn: false,
        ActionColumn: CurrentPanelRaw.ActionColumn,
        ActionTrueFalseColumn: CurrentPanelRaw.ActionTrueFalseColumn,
        layouteditorWindowMode: CurrentPanelRaw.ForceWindowMode,
        layouteditorid: CurrentPanelRaw.id,
        DectailColumn: true,
        DeleteColumn: false,
        massUpdate: true,
        scrollable: true,
        rowWrap: ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone') ? true : false),
        //itemHeight: 100,
        anchor: '100% 100%',
        summary: true,
        //maxHeight : Ext.getBody().getViewSize().height - 90,
        store: DS_Form00
    });

    if ((themeName == 'azzurra') && (CurrentPanelRaw.themeUI != '')) {
        gridtable.setUI(CurrentPanelRaw.themeUI + '-panel');
    }
    //CurrentPanel.suspendLayout = true;
    //Ext.suspendLayouts();
    CurrentPanel.removeAll();
    CurrentPanel.add(gridtable);
    Ext.resumeLayouts(true);

    CurrentPanelRaw.ViewType = 'grid';
};
Custom.LayoutInTreeGrid = function (ForceWindowMode) {
    console.log('LayoutInTreeGrid');

    //RENDER SHOW dipendent indipendent WindowMode
    if ((ForceWindowMode === undefined) || (ForceWindowMode === '')) {
        ForceWindowMode = CurrentPanelRaw.WindowMode;
    }
    if (CurrentPanelRaw.Skin === '') {
        CurrentPanelRaw.Skin = 'absolute';
    }

    Custom.PanelWindowModeChange(ForceWindowMode);

    var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + 'Form00');

    if ((CurrentPanelRaw.DataMode == null) || (CurrentPanelRaw.DataMode == '')) CurrentPanelRaw.DataMode = 'edit';
    var treegridtable = Ext.create('dynamictreegrid', {
        height: Ext.getBody().getViewSize().height - 110,
        name: 'FormInGrid',
        itemId: 'FormInGrid',
        fieldLabel: '',
        parentidname: CurrentPanelRaw.ParentIdName,
        childrenidname: CurrentPanelRaw.ChildrenIdName,
        parentidstart: CurrentPanelRaw.ParentIdStart,
        waytoexpand: 'down',
        displayField: CurrentPanelRaw.DisplayField,
        datasource: CurrentPanelRaw.DataSource,
        datasourcetype: CurrentPanelRaw.DataSourceType,
        keyField: CurrentPanelRaw.DataSourceField,
        valueField: CurrentPanelRaw.DataSourceField,
        columnWidthSplit: CurrentPanelRaw.columnWidthSplit,
        navigationbutton: false,
        allowfilter: true,
        allowadd: (CurrentPanelRaw.DataMode != 'read' ? true : false),
        allowedit: (CurrentPanelRaw.DataMode != 'read' ? true : false),
        allowdelete: (CurrentPanelRaw.DataMode != 'read' ? true : false),
        allowexport: true,
        allowsearch: true,
        CheckColumn: CurrentPanelRaw.CheckColumn,
        NumberColumn: false,
        ActionColumn: CurrentPanelRaw.ActionColumn,
        ActionTrueFalseColumn: CurrentPanelRaw.ActionTrueFalseColumn,
        layouteditorWindowMode: ForceWindowMode,
        DectailColumn: true,
        DeleteColumn: false,
        massUpdate: true,
        layouteditorid: CurrentPanelRaw.id,
        scrollable: true,
        anchor: '100% 100%',
        store: DS_Form00
    });

    //CurrentPanel.suspendLayout = true;
    //Ext.suspendLayouts();
    CurrentPanel.removeAll();
    CurrentPanel.add(treegridtable);
    Ext.resumeLayouts(true);

    CurrentPanelRaw.ViewType = 'treegrid';
};
Custom.LayoutInPivot = function (ForceWindowMode) {
    console.log('LayoutInPivot');

    //RENDER SHOW dipendent indipendent WindowMode
    if ((ForceWindowMode === undefined) || (ForceWindowMode === '')) {
        ForceWindowMode = CurrentPanelRaw.WindowMode;
    }
    if (CurrentPanelRaw.Skin === '') {
        CurrentPanelRaw.Skin = 'absolute';
    }

    Custom.PanelWindowModeChange(ForceWindowMode);

    var pivotgrid = CurrentPanel.getComponent('PivotGrid1');
    if (pivotgrid != undefined) {
        pivotgrid.destroy();
    }

    /* MODEL Definition
    var fieldsDefined = {};
    Ext.Ajax.request({
    url: 'includes/io/DataRead.php',
    params: { modeldef:true,
    datasource:CurrentPanelRaw.DataSource,
    datasourcetype:CurrentPanelRaw.DataSourceType
    },
    async: false,
    success: function(response) {
    var JsonFormAppo = Ext.util.JSON.decode(response.responseText);
    if (JsonFormAppo.status = 'Success'){
    fieldsDefined = JsonFormAppo.fields;
    }else{
    Ext.MessageBox.show({
    title: 'Error Parse DataREAD' + obj.status,
    msg: obj.message,
    icon: Ext.MessageBox.ERROR,
    buttons: Ext.Msg.OK
    });
    }
    },
    failure: function() {
    Ext.MessageBox.show({
    title: 'Error',
    msg: 'DataREAD',
    icon: Ext.MessageBox.ERROR,
    buttons: Ext.Msg.OK
    });
    },
    });*/
    //DATA Definition
    if (CurrentPanelRaw.DataSourceRemote == true) {
        //DAFARE
        LocalmatrixConfig = {
            type: 'remote',
            url: 'includes/io/PivotDataRead.php?layoutid=' + CurrentPanelRaw.id + '&' + 'datawhere=' + CurrentPanelRaw.DataWhere,
            cache: false,
            timeout: 60000,
            async: false
        };
        Localmatrix = {
            url: 'includes/io/PivotDataRead.php?layoutid=' + CurrentPanelRaw.id + '&' + 'datawhere=' + CurrentPanelRaw.DataWhere,
            type: 'remote',
            cache: false,
            timeout: 60000,
            async: false,
            leftAxis: [],
            topAxis: [],
            aggregate: []
        };
    } else {
        var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + 'Form00');
        LocalmatrixConfig = {
            store: DS_Form00,
            type: 'local',
            recordsPerJob: 1000,
            timeBetweenJobs: 2
        };
        Localmatrix = {
            store: DS_Form00,
            type: 'local',
            recordsPerJob: 1000,
            timeBetweenJobs: 2,
            leftAxis: [],
            topAxis: [],
            aggregate: []
        };
    }

    var leftAxisConfig = [];
    var topAxisConfig = [];
    var aggregateConfig = [];
    var pMatrixConfig = [];

    if ((CurrentPanelRaw.DataSourceAggregate != '') && (CurrentPanelRaw.DataSourceAggregate !== undefined)) {
        aggregateConfig = Ext.util.JSON.decode(CurrentPanelRaw.DataSourceAggregate);
    }
    if ((CurrentPanelRaw.DataSourceLeftAxis != '') && (CurrentPanelRaw.DataSourceLeftAxis !== undefined)) {
        leftAxisConfig = Ext.util.JSON.decode(CurrentPanelRaw.DataSourceLeftAxis);
    }
    if ((CurrentPanelRaw.DataSourceTopAxis != '') && (CurrentPanelRaw.DataSourceTopAxis !== undefined)) {
        topAxisConfig = Ext.util.JSON.decode(CurrentPanelRaw.DataSourceTopAxis);
    }
    if ((CurrentPanelRaw.DataSourceMatrix != '') && (CurrentPanelRaw.DataSourceMatrix !== undefined)) {
        pMatrixConfig = Ext.util.JSON.decode(CurrentPanelRaw.DataSourceMatrix);
    }

    /* ----- PIVOT GRID -----------------------------------------------*/
    var PivotGrid = Ext.create('Ext.pivot.Grid', {
        name: 'PivotGrid1',
        id: 'PivotGrid1',
        enableLocking: false,
        //matrix: Localmatrix,
        matrixConfig: LocalmatrixConfig,
        height: Ext.getBody().getViewSize().height - 110,
        autoScroll: true,
        //width: Ext.getBody().getViewSize().width - 220,
        requires: [
            'Ext.pivot',
            'Ext.pivot.plugin.DrillDown',
            'Ext.pivot.plugin.Configurator',
            'Ext.pivot.plugin.Rangeeditor'
        ],
        plugins: [{
            ptype: 'pivotdrilldown'
        }, {
            ptype: 'pivotexporter'
        }, {
            ptype: 'pivotconfigurator'
        }
            // {ptype: 'pivotrangeeditor',pluginId:'rangeeditor'},
        ],
        tbar: [{
            text: 'Export',
            menu: [{
                text: 'XML',
                handler: function () {
                    PivotGrid.saveDocumentAs({
                        type: 'xml',
                        title: CurrentPanelRaw.name,
                        fileName: CurrentPanelRaw.name + '.xml'
                    });
                }
            }, {
                text: 'XLSX',
                handler: function () {
                    PivotGrid.saveDocumentAs({
                        type: 'excel',
                        title: CurrentPanelRaw.name,
                        fileName: CurrentPanelRaw.name + '.xlsx'
                    });
                }
            }]
        }],
        matrix: {
            leftAxis: leftAxisConfig,
            topAxis: topAxisConfig,
            aggregate: aggregateConfig,
            //rowSubTotalsPosition : pMatrixConfig.rowSubTotalsPosition,
            //rowGrandTotalsPosition : pMatrixConfig.rowGrandTotalsPosition,
            //colSubTotalsPosition : pMatrixConfig.colSubTotalsPosition,
            //colGrandTotalsPosition : pMatrixConfig.colGrandTotalsPosition,
        }
    });

    //CurrentPanel.suspendLayout = true;
    //Ext.suspendLayouts();
    CurrentPanel.removeAll();
    CurrentPanel.add(PivotGrid);
    //Ext.resumeLayouts(true);

    CurrentPanelRaw.ViewType = 'pivot';
};
Custom.LayoutInPivot3D = function (ForceWindowMode) {
    console.log('LayoutInPivot3D');

    //RENDER SHOW dipendent indipendent WindowMode
    if ((ForceWindowMode === undefined) || (ForceWindowMode == '')) {
        ForceWindowMode = CurrentPanelRaw.WindowMode;
    }
    if (CurrentPanelRaw.Skin == '') {
        CurrentPanelRaw.Skin = 'absolute';
    }

    Custom.PanelWindowModeChange(ForceWindowMode);

    //DESTROY Della Vecchi oggetti
    //Ext.destroy(PivotGrid, PivotStore);
    //PivotStore = PivotGrid = null;

    //MODEL Definition
    var fieldsDefined = {};
    Ext.Ajax.request({
        url: 'includes/io/DataRead.php',
        params: {
            modeldef: true,
            datasource: CurrentPanelRaw.DataSource,
            datasourcetype: CurrentPanelRaw.DataSourceType
        },
        async: false,
        success: function (response) {
            var JsonFormAppo = Ext.util.JSON.decode(response.responseText);
            if (JsonFormAppo.status == 'success') {
                fieldsDefined = JsonFormAppo.fields;
            } else {
                Ext.MessageBox.show({
                    title: "Error LayoutInPivot3D Parse DataREAD" + obj.status,
                    msg: obj.message,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                });
            }
        },
        failure: function (response) {
            if (Custom.isJson(response.responseText)) {
                Ext.MessageBox.show({
                    title: "Error LayoutInPivot3D",
                    msg: 'Risposta del server inaspettata!!! E ' + response.responseText.message,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                });
            } else {
                Ext.MessageBox.show({
                    title: "Error LayoutInPivot3D",
                    msg: 'Risposta del server inaspettata!!! F ' + response,
                    icon: Ext.MessageBox.ERROR,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                });
            }
        }
    });

    //DATA Definition
    CurrentPanel.DataSourceRemote = false;
    if ((CurrentPanelRaw.DataSourceRemote == true) && (1 == 0)) {
        LocalmatrixConfig = {
            type: 'remote',
            url: 'includes/io/PivotDataRead.php?layoutid=' + CurrentPanelRaw.id + '&' + 'datawhere=' + CurrentPanelRaw.DataWhere,
            cache: false,
            timeout: 60000,
            async: false
        };
    } else {
        var PivotStore3D = Ext.create('Ext.data.Store', {
            id: 'PivotStore',
            name: 'PivotStore',
            storeId: 'PivotStore',
            autoLoad: true,
            remoteSort: true,
            remoteFilter: true,
            filterParam: 'query',
            encodeFilters: function (filters) {
                return filters[0].value;
            },
            pageSize: 100,
            fields: fieldsDefined,
            async: false,
            columns: [],
            proxy: {
                type: 'ajax',
                url: 'includes/io/DataRead.php',
                filterParam: 'query',
                params: {},
                limitParam: null,
                extraParams: {
                    objname: '',
                    datawhere: CurrentPanelRaw.DataWhere,
                    limit: CurrentPanelRaw.CurrentRowLimit,
                    layoutid: CurrentPanelRaw.id,
                    datamode: CurrentPanelRaw.DataMode
                },
                reader: {
                    keepRawData: true,
                    type: 'json',
                    rootProperty: 'data',
                    totalProperty: 'total',
                    successProperty: 'success',
                    messageProperty: 'message'
                    //idProperty: 'node',
                },
                listeners: {
                    exception: function (proxy, response, operation) {
                        Ext.MessageBox.show({
                            title: 'Error Pivot3d',
                            msg: operation.getError(),
                            icon: Ext.MessageBox.ERROR,
                            buttons: Ext.Msg.OK,
                            alwaysOnTop: true,
                            maxWidth: 600
                        });
                    }
                }
            },
            listeners: {}
        });

        LocalmatrixConfig = {
            store: PivotStore3D,
            type: 'local'
        };
    }

    var leftAxisConfig = [];
    var topAxisConfig = [];
    var aggregateConfig = [];

    if ((CurrentPanelRaw.DataSourceAggregate != '') && (CurrentPanelRaw.DataSourceAggregate !== undefined)) {
        aggregateConfig = Ext.util.JSON.decode(CurrentPanelRaw.DataSourceAggregate);
    }
    if ((CurrentPanelRaw.DataSourceLeftAxis != '') && (CurrentPanelRaw.DataSourceLeftAxis !== undefined)) {
        leftAxisConfig = Ext.util.JSON.decode(CurrentPanelRaw.DataSourceLeftAxis);
    }
    if ((CurrentPanelRaw.DataSourceTopAxis != '') && (CurrentPanelRaw.DataSourceTopAxis !== undefined)) {
        topAxisConfig = Ext.util.JSON.decode(CurrentPanelRaw.DataSourceTopAxis);
    }

    //pivotd3container
    var PivotGrid3D = Ext.create('Ext.pivot.d3', {
        id: 'PivotGrid3D1',
        name: 'PivotGrid3D1',
        enableLocking: false,
        matrixConfig: LocalmatrixConfig,
        autoScroll: true,
        requires: [
            'Ext.pivot.d3.TreeMap'
        ],
        //store: PivotStore,
        drawing: {
            xtype: 'something' // one of the above pivot D3 components
            // more configs specific to that component
        },
        height: Ext.getBody().getViewSize().height - 110,
        //width: Ext.getBody().getViewSize().width - 220,
        leftAxis: leftAxisConfig,
        topAxis: topAxisConfig,
        aggregate: aggregateConfig
    });

    if ((CurrentPanelRaw.DataSourceAggregate != '') && (CurrentPanelRaw.DataSourceAggregate !== undefined)) {
        PivotGrid3D.aggregate = clone(CurrentPanelRaw.DataSourceAggregate);
    }
    if ((CurrentPanelRaw.DataSourceLeftAxis != '') && (CurrentPanelRaw.DataSourceLeftAxis !== undefined)) {
        PivotGrid3D.leftAxis = clone(CurrentPanelRaw.DataSourceLeftAxis);
    }
    if ((CurrentPanelRaw.DataSourceTopAxis != '') && (CurrentPanelRaw.DataSourceTopAxis !== undefined)) {
        PivotGrid3D.topAxis = clone(CurrentPanelRaw.DataSourceTopAxis);
    }

    //CurrentPanel.suspendLayout = true;
    //Ext.suspendLayouts();
    CurrentPanel.removeAll();
    CurrentPanel.add(PivotGrid);
    //Ext.resumeLayouts(true);

    CurrentPanelRaw.ViewType = 'pivot3d';
};
Custom.LayoutInLabel = function (ForceWindowMode) {
    //GESTIONE REMOTE PRINTING
    console.log('LayoutInLabel');
    Ext.Ajax.request({
        url: 'includes/io/LayoutReadRun.php',
        params: {
            layoutid: CurrentPanelRaw.id,
            themeName: themeName
        },
        timeout: 60000,
        async: false,
        success: function (response) {
            var JsonAppo = Ext.util.JSON.decode(response.responseText);
            Custom.openLinkInNewWindow('http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/' + JsonAppo.data[0].layoutjson, 'LabelView');
        },
        failure: function (response) {
            Ext.Msg.alert('Error', 'Server Not Responding!!');
        }
    });
};
Custom.LayoutInRaw = function (ForceWindowMode) {
    //GESTIONE REMOTE PRINTING
    console.log('LayoutInRaw');

    if (CurrentDeviceType == 'desktop') {
        Custom.SendToWebSocket(CurrentPanelRaw.Json);
    } else {
        window.location.href = 'intent://' + TextAppo + '#Intent;scheme=quickprinter;package=pe.diegoveloper.printerserverapp;end;';
        //Custom.openLinkInNewWindow('quickprinter://'+TextAppo, 'LabelPrint',true);
    }
    CurrentPanelRaw = clone(LastLayout);
    /*
    var me = this.down('form');
    if (me.definitionraw != '')
        CurrentPanelRaw = clone(me.definitionraw);
    CurrentPanel = me;
    CurrentWindow = this;
    CurrentToolBar = CurrentWindow.getComponent('toolbarmenu');
    console.log('focus window ' + CurrentPanelRaw.name);         
    */
};
Custom.LayoutInForm = function (ForceWindowMode) {
    console.log('LayoutInForm');

    //RENDER SHOW dipendent indipendent WindowMode
    if ((ForceWindowMode === undefined) || (ForceWindowMode == '')) {
        ForceWindowMode = CurrentPanelRaw.WindowMode;
    }
    if (CurrentPanelRaw.Skin == '') {
        CurrentPanelRaw.Skin = 'absolute';
    }

    Custom.PanelWindowModeChange(ForceWindowMode);

    if ((CurrentPanelRaw.DataMode == null) || (CurrentPanelRaw.DataMode == '')) CurrentPanelRaw.DataMode = 'edit';
    //datasource degli object nella form
    console.log('FormLoadDataSource');
    var result = '';

    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'combobox', 'Custom.AbbinaPropToCombo(objparam)');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'combobox', 'Custom.AbbinaWhereToCombo(objparam)');

    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamiccombo', 'Custom.AbbinaPropToCombo(objparam)');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamiccombo', 'Custom.AbbinaWhereToCombo(objparam)');

    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamictreecombo', 'Custom.AbbinaPropToCombo(objparam)');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamictreecombo', 'Custom.AbbinaWhereToCombo(objparam)');

    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'kpibar3d', 'Custom.AbbinaPropToCombo(objparam)');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'kpibar3d', 'Custom.AbbinaWhereToCombo(objparam)');

    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicwmsgmap', 'Custom.AbbinaPropToCombo(objparam)');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicwmsgmap', 'Custom.AbbinaWhereToCombo(objparam)');

    result = new ExecuteOnObjectPropertyExist(CurrentPanelRaw.Json, 'datasourcetype', 'Custom.ObjLoadDataSource(objparam, CurrentPanelRaw, false)');
    result = new ExecuteOnObjectPropertyExist(CurrentPanelRaw.Json, 'datasourcetype', 'Custom.AbbinaStoreAdObject(objparam)');

    //visibilita e gestioni particolari degli object nella form
    console.log('FormLoadPropForObj');
    result = new ExecuteOnObjectPropertyExist(CurrentPanelRaw.Json, 'regex', 'Custom.AbbinaRegexToObj(objparam)');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'tabpanel', 'Custom.AbbinaPropToTabPanel(objparam)');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'timefield', 'Custom.AbbinaPropToTimeField(objparam)');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'hiddenInForm', true, 'Custom.AbbinaPropToObj(objparam, "hidden", true)');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'checkbox', 'Custom.AbbinaPropToObj(objparam, "uncheckedValue", 0)');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'numberfield', 'Custom.AbbinaPropToObj(objparam, "decimalSeparator", ",")');

    //CSS SubTheme Azzurra AreaColor
    if ((themeName == 'azzurra') && (CurrentPanelRaw.themeUI != '')) {
        result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'panel', 'Custom.AbbinaPropToObj(objparam, "ui", "' + CurrentPanelRaw.themeUI + '-panel")');
        result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'tab', 'Custom.AbbinaPropToObj(objparam, "ui", "' + CurrentPanelRaw.themeUI + '-tab")');
        result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'progress', 'Custom.AbbinaPropToObj(objparam, "ui", "' + CurrentPanelRaw.themeUI + '-progress")');
        result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'button', 'Custom.AbbinaPropToObj(objparam, "ui", "' + CurrentPanelRaw.themeUI + '-button")');
        result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicbutton', 'Custom.AbbinaPropToObj(objparam, "ui", "' + CurrentPanelRaw.themeUI + '-button")');
        result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicbuttontimer', 'Custom.AbbinaPropToObj(objparam, "ui", "' + CurrentPanelRaw.themeUI + '-button")');
        result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamiccombobutton', 'Custom.AbbinaPropToObj(objparam, "ui", "' + CurrentPanelRaw.themeUI + '-button")');
    }

    //events
    console.log('FormLoadEventToObj');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'button', 'Custom.AbbinaEventToButton');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicbutton', 'Custom.AbbinaEventToButton');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicbuttontimer', 'Custom.AbbinaEventToButton');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamiccombobutton', 'Custom.AbbinaEventToButton');
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'autopostback', true, 'Custom.AbbinaAutopostbackToObj');
    result = new ExecuteOnObjectPropertyExist(CurrentPanelRaw.Json, 'procremoteonupdate', 'Custom.AbbinaEventToObj(objparam)');

    //DRAW Obj
    Ext.suspendLayouts();
    CurrentPanel.removeAll();
    try {
        CurrentPanel.add(clone(CurrentPanelRaw.Json));
    } catch (err) {
        Ext.MessageBox.show({
            title: 'Error Layout',
            msg: 'Error layout form: ' + err.message,
            buttons: Ext.MessageBox.OKCANCEL,
            maxWidth: 600,
            alwaysOnTop: true,
            icon: Ext.MessageBox.WARNING,
            fn: function (btn) {
                if (btn == 'ok') {
                    return;
                } else {
                    return;
                }
            }
        });
        alert(err.message);
        CurrentPanel.removeAll();
    }
    Ext.resumeLayouts(true);
    //SetFocus first tabIndex field
    result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'tabIndex', '1', 'Custom.SetFocus(objparam)');

    CurrentPanelRaw.ViewType = 'form';
};
Custom.LayoutInReport = function (ForceWindowMode) {
    console.log('LayoutInReport');
    CurrentPanelRaw.ViewType = 'report';
    jsreports.libraryPath = '/includes/jsreport';
    jsreports.dataSourceTimeout = 240;
    //jsreports.setLocale('it');

    //RENDER SHOW dipendent indipendent WindowMode
    if ((ForceWindowMode === undefined) || (ForceWindowMode == '')) {
        ForceWindowMode = CurrentPanelRaw.WindowMode;
    }
    if (CurrentPanelRaw.Skin == '') {
        CurrentPanelRaw.Skin = 'absolute';
    }
    if (CurrentPanelRaw.Json == '') {
        CurrentPanelRaw.Json = jsreports.createReport()
            .data('defaultds')
            .setPage(210, 297, 'mm')
            .done();
    }

    CurrentPanelRaw.DataSources[CurrentPanelRaw.DataSources.length++] = {
        'id': 'defaultds',
        'name': 'defaultds',
        'url': 'includes/io/DataRead.php?onlydata=true&limit=-1&layoutid=' + CurrentPanelRaw.id + '&datawhere=' + CurrentPanelRaw.DataWhere,
        'schema_url': 'includes/io/DataRead.php?modeldef=true&limit=-1&layoutid=' + CurrentPanelRaw.id + '&datawhere=' + CurrentPanelRaw.DataWhere,
        'timeout': 5000,
        'dataSourceTimeout': 5000
    };
    var decodedLayout = Ext.util.JSON.decode(CurrentPanelRaw.Json);
    //var decodedLayout = CurrentPanelRaw.Json;
    iterateDataSources(decodedLayout);

    if (CurrentPanel != undefined) {
        //CurrentPanel = null;
        CurrentPanel.JSReportOBJ = null;
    } else {
        CurrentPanel = {};
        CurrentPanel.JSReportOBJ = null;
    }

    if (CurrentPanelRaw.WindowMode == 'acPrint') {
        CurrentPanel.JSReportOBJ = jsreports;
        CurrentPanel.JSReportOBJ.export({
            report_def: CurrentPanelRaw.Json,
            datasets: CurrentPanelRaw.DataSources,
            format: 'pdf',
            showPageHeaderAndFooter: true,
            scaleFonts: true
        });
    } else {
        Custom.PanelWindowModeChange(ForceWindowMode);
        /* metodo A con ExtJs Div */
        var ReportDiv = {
            xtype: 'panel',
            html: "<div class='report-output'></div>",
            waitTitle: 'Connecting...',
            waitMsg: 'Connecting...'
        };
        CurrentPanel.removeAll();
        CurrentPanel.add(ReportDiv);
        CurrentPanel.JSReportOBJ = jsreports;
        CurrentPanel.JSReportOBJ.render({
            embedded: true,
            showToolbar: false,
            toolbarPosition: 'top',
            target: $('.report-output'),
            report_def: CurrentPanelRaw.Json,
            datasets: CurrentPanelRaw.DataSources,
            format: 'pdf',
            showPageHeaderAndFooter: true,
            scaleFonts: true
        });
    }
};
//STORE DEI REPORT DAFARE integrare nella ricorsiva std
function iterateDataSources(obj) {
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == 'object')
                iterateDataSources(obj[property]);
            else
                //data_source
                if ((property == 'data_source') && (obj[property] != '__parentgroup')) {
                    console.log(property + '   ' + obj[property]);
                    where = '';
                    if ((obj.hasOwnProperty('type')) && (obj['type'] == 'table')) {
                        where = CurrentPanelRaw.DataWhere;
                    }
                    CurrentPanelRaw.DataSources[CurrentPanelRaw.DataSources.length++] = {
                        'id': obj['data_source'],
                        'name': obj['data_source'],
                        'url': 'includes/io/DataRead.php?onlydata=true&limit=-1&' +
                            '&layoutid=' + CurrentPanelRaw.id +
                            '&objid=' + obj['data_source'] +
                            '&datawhere=' + where,
                        'schema_url': 'includes/io/DataRead.php?modeldef=true&limit=-1&' +
                            '&layoutid=' + CurrentPanelRaw.id +
                            '&objid=' + obj['data_source'] +
                            '&datawhere=' + where,
                        'timeout': 5000,
                        'dataSourceTimeout': 5000
                    };
                }
        }
    }
}

Custom.CreateLayoutIndipendent = function (typemodal) {
    console.log('CreateLayoutIndipendent');
    if (typemodal === undefined) {
        ForceWindowMode = false;
    }

    var InDipendentPanel = Ext.create('Ext.form.Panel', {
        itemId: CurrentPanelRaw.name + '_Panel',
        name: CurrentPanelRaw.name + '_Panel',
        monitorValid: true,
        trackResetOnLoad: true,
        definitionraw: '',
        items: [{}],
        layout: {
            type: CurrentPanelRaw.Skin, //vbox, hbox, auto, absolute,
            align: 'stretch'
        },
        //autoScroll: true,
        scrollable: true,
        waitTitle: 'Connecting...',
        waitMsg: 'Connecting...',
        listeners: {
            dirtychange: function (v, b, c) {
                var me = this.down('form');
                console.log('InDipendentWindow dirtychange');
                console.log(b)
            },
        }
    });
    if ((themeName == 'azzurra') && (CurrentPanelRaw.themeUI != '')) {
        InDipendentPanel.setUI(CurrentPanelRaw.themeUI + '-panel');
    }

    var InDipendentWindow = Ext.getCmp(CurrentPanelRaw.name + '_Window');
    if (InDipendentWindow !== undefined) {
        var AppoPanel = InDipendentWindow.getComponent(CurrentPanelRaw.name + '_Panel');
        InDipendentWindow.remove(AppoPanel);
        AppoPanel.destory;
    }

    //DAFARE UNICA TOOLBAR con quella dipendent
    var ToolbarAppo = [{
        itemId: 'ButtonLayoutEdit',
        name: 'ButtonLayoutEdit',
        xtype: 'button',
        iconCls: 'x-fa fa-pencil-square toolBarIcon',
        hidden: !CurrentUser.UserDeveloper,
        tooltip: 'Edit Layout',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                switch (CurrentPanelRaw.ViewType) {
                    case 'report':
                        Custom.ReportEdit(CurrentPanelRaw.id);
                        break;
                    case 'label':
                        Custom.LabelEdit(CurrentPanelRaw.id);
                        break;
                    default:
                        Custom.FormEdit(CurrentPanelRaw.id);
                        break;
                }
            }
        }
    }, {
        itemId: 'ButtonLayoutDataEdit',
        name: 'ButtonLayoutDataEdit',
        xtype: 'button',
        iconCls: 'x-fa fa-wrench toolBarIcon',
        hidden: !CurrentUser.UserDeveloper,
        tooltip: 'Edit Property',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.FormSaveVar('ID', CurrentPanelRaw.id, 'aaalayout');
                Custom.ExecuteProc('aaalayoutID', null, null);
            }
        }
    }, '-', {
        itemId: 'ButtonRecSave',
        name: 'ButtonRecSave',
        xtype: 'button',
        iconCls: 'x-fa fa-floppy-o toolBarIconGreen toolBarIcon',
        tooltip: 'Save',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                if (CurrentPanel.JSReportOBJ != null) {
                    CurrentPanel.JSReportOBJ.export({
                        report_def: CurrentPanelRaw.Json,
                        datasets: CurrentPanelRaw.DataSources,
                        format: 'pdf',
                        showPageHeaderAndFooter: true,
                        scaleFonts: true
                    });
                } else {
                    var me = btn.up('panel');

                    Custom.ExecuteProcRequest('SAVE');
                    Custom.FormDataSave();

                    var ButtonRecRefresh = CurrentToolBar.getComponent('ButtonRecRefresh');
                    var ButtonRecDel = CurrentToolBar.getComponent('ButtonRecDel');
                    ButtonRecRefresh.enable();
                    ButtonRecDel.enable();
                }
            }
        }
    }, {
        itemId: 'ButtonRecPrint',
        name: 'ButtonRecPrint',
        xtype: 'button',
        iconCls: 'x-fa fa-print toolBarIcon',
        hidden: true,
        tooltip: 'Print',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);

                var finishPrint = function finishPrint(iframeElement) {
                    iframeElement.focus();
                    if (isEdge || isIE) {
                        try {
                            iframeElement.contentWindow.document.execCommand('print', false, null);
                        } catch (e) {
                            iframeElement.contentWindow.print();
                        }
                    } else {
                        //	iframeElement.contentWindow.document.execCommand('print', false, null);
                        try {
                            iframeElement.contentWindow.print();
                        } catch (e) {
                            CurrentPanel.JSReportOBJ.export({
                                report_def: CurrentPanelRaw.Json,
                                datasets: CurrentPanelRaw.DataSources,
                                format: 'pdf',
                                title: 'MYrEP',
                                showPageHeaderAndFooter: true,
                                scaleFonts: true
                            });
                        }

                    }
                    if (isIE) {
                        setTimeout(function () {
                            iframeElement.parentNode.removeChild(iframeElement);
                        }, 2000);
                    }
                };
                var printToIframeHandler = function printToIframeHandler(pdfBlob) {
                    var printFrame = document.createElement('iframe');
                    printFrame.style.width = 0;
                    printFrame.style.height = 0;
                    printFrame.style.visibility = 'hidden';
                    var onLoaded = function onLoaded() {
                        return finishPrint(printFrame);
                    };
                    document.getElementsByTagName('body')[0].appendChild(printFrame);
                    if (isIE || isEdge) {
                        printFrame.setAttribute('onload', onLoaded);
                    } else {
                        printFrame.onload = onLoaded;
                    }
                    $(printFrame).attr('src', URL.createObjectURL(pdfBlob));
                };

                CurrentPanel.JSReportOBJ.export({
                    report_def: CurrentPanelRaw.Json,
                    datasets: CurrentPanelRaw.DataSources,
                    format: 'pdf',
                    target: 'print',
                    showPageHeaderAndFooter: true,
                    scaleFonts: true,
                    outputHandler: function (pdfBlob) {
                        printToIframeHandler(pdfBlob);
                    }
                });
            }
        }
    }, {
        itemId: 'ButtonRecSaveColumnDisp',
        name: 'ButtonRecSaveColumnDisp',
        xtype: 'button',
        iconCls: 'x-fa fa-columns toolBarIcon',
        tooltip: 'Save Layout',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.ExecuteProcRequest('SAVE');
                Custom.FormDataSave();

                var ButtonRecRefresh = CurrentToolBar.getComponent('ButtonRecRefresh');
                var ButtonRecDel = CurrentToolBar.getComponent('ButtonRecDel');
                var ButtonRecClone = CurrentToolBar.getComponent('ButtonRecClone');
                ButtonRecRefresh.enable();
                ButtonRecDel.enable();
            }
        }
    }, {
        itemId: 'ButtonRecDel',
        name: 'ButtonRecDel',
        xtype: 'button',
        iconCls: 'x-fa fa-trash-o toolBarIconRed toolBarIcon',
        tooltip: 'Delete',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Ext.MessageBox.show({
                    title: 'Cancella ' + CurrentWindow.title,
                    msg: 'Confermi la cancellazione?',
                    buttons: Ext.MessageBox.OKCANCEL,
                    maxWidth: 600,
                    alwaysOnTop: true,
                    icon: Ext.MessageBox.WARNING,
                    fn: function (btn) {
                        if (btn == 'ok') {
                            Custom.ExecuteProcRequest('DELETE');
                            Custom.FormDataSave();
                            return;
                        } else {
                            return;
                        }
                    }
                });
            }
        }
    }, {
        itemId: 'ButtonRecFirst',
        name: 'ButtonRecFirst',
        xtype: 'button',
        iconCls: 'x-fa fa-fast-backward toolBarIcon',
        tooltip: 'Prev',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.FormDataLoadRecord('<');
            }
        }
    }, {
        itemId: 'ButtonRecPrev',
        name: 'ButtonRecPrev',
        xtype: 'button',
        iconCls: 'x-fa fa-backward toolBarIcon',
        tooltip: 'Prev',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.FormDataLoadRecord('-');
            }
        }
    }, {
        itemId: 'ButtonRecNext',
        name: 'ButtonRecNext',
        xtype: 'button',
        iconCls: 'x-fa fa-forward toolBarIcon',
        tooltip: 'Next',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.FormDataLoadRecord('+');

            }
        }
    }, {
        itemId: 'ButtonRecLast',
        name: 'ButtonRecLast',
        xtype: 'button',
        iconCls: 'x-fa fa-fast-forward toolBarIcon',
        tooltip: 'Prev',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.FormDataLoadRecord('>');
            }
        }
    }, {
        itemId: 'ButtonRecNew',
        name: 'ButtonRecNew',
        xtype: 'button',
        iconCls: 'x-fa fa-asterisk toolBarIcon',
        tooltip: 'New',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                var ForceDataWhere = '';
                Custom.setCurrentPanelForm(me);
                Custom.FormDataLoadRecord('*');
            }
        }
    }, {
        itemId: 'ButtonRecClone',
        name: 'ButtonRecClone',
        xtype: 'button',
        iconCls: 'x-fa fa-clone toolBarIcon',
        tooltip: 'Clone',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                //Custom.LayoutRender(CurrentPanelRaw.id, 'form', CurrentPanelRaw.DataWhere, 'clone');
                console.log('duplica:' + CurrentPanelRaw.DataSourceField);
                //svuota ID
                var CurrentForm = CurrentPanel.getForm();
                var FieldID = CurrentForm.findField(CurrentPanelRaw.DataSourceField);
                if (FieldID !== undefined) FieldID.setValue('');
                CurrentPanelRaw.DataMode = 'edit';

                if (CurrentPanelRaw.ActionClone != '') {
                    Custom.ExecuteProcRequest('SAVE');
                    Custom.FormDataSave();
                    Custom.ExecuteProc(CurrentPanelRaw.ActionClone, null, null);
                }
            }
        }
    }, {
        itemId: 'ButtonRecRefresh',
        name: 'ButtonRecRefresh',
        xtype: 'button',
        iconCls: 'x-fa fa-refresh toolBarIcon',
        tooltip: 'Refresh',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                if (CurrentPanelRaw.ViewType == 'form') {
                    var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + 'Form00');
                    if (DS_Form00 != undefined) {
                        DS_Form00.reload();
                        CurrentPanel.loadRecord(DS_Form00.data.first());
                    } else {
                        Custom.RefreshAllDataStore();
                    }
                }
            }
        }
    }, '-', {
        itemId: 'ButtonViewGrid',
        name: 'ButtonViewGrid',
        xtype: 'button',
        iconCls: 'x-fa fa-table toolBarIcon',
        pressed: false,
        enableToggle: true,
        tooltip: 'Grid',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                //CurrentPanelRaw.JsonFilter = Array();
                if (CurrentPanelRaw.ViewType == 'form') {
                    Custom.LayoutRender(CurrentPanelRaw.id, 'grid', CurrentPanelRaw.JsonFilter, '', 'acDialog');
                } else {
                    Custom.LayoutRender(CurrentPanelRaw.id, 'grid', CurrentPanelRaw.DataWhere, '', 'acDialog');
                }
            }
        }
    }, {
        itemId: 'ButtonViewExchangeExcel',
        name: 'ButtonViewExchangeExcel',
        xtype: 'button',
        iconCls: 'x-fa fa-exchange toolBarIcon',
        pressed: false,
        enableToggle: true,
        tooltip: 'ExportTo',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var extDir = location.origin;
                Ext.MessageBox.show({
                    title: 'Error Exchange',
                    msg: 'open excel and add Remote Web Query',
                    value: location.origin + '/includes/io/DataReadExt.php?limit=' + '-1' +
                        '&format=' + 'HTML' +
                        '&layoutid=' + CurrentPanelRaw.id +
                        '&username=' + CurrentUser.UserLogin +
                        '&password=' + CurrentUser.UserPassword +
                        '&dbname=' + CurrentUser.UserDBname + ' ',
                    width: 300,
                    multiline: true,
                    buttons: Ext.Msg.OK,
                    alwaysOnTop: true,
                    maxWidth: 600
                });
            }
        }
    }, '-', {
        itemId: 'ButtonSendObject',
        name: 'ButtonSendObject',
        xtype: 'button',
        iconCls: 'x-fa fa-envelope-o toolBarIcon',
        border: true,
        tooltip: 'Send Current',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.FormDataSave();
                var CurrentForm = CurrentPanel.getForm();
                var formemail = CurrentForm.getRecord().data['EMAIL'];
                Custom.SendObject(formemail);
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonHistory',
        name: 'ButtonHistory',
        iconCls: 'x-fa fa-history toolBarIcon',
        tooltip: 'Open History log',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var CurrentForm = CurrentPanel.getForm();
                var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                    var MsgHistory = 'SR:' + CurrentForm.getRecord().data['SR'] + '<BR>' +
                        'SI:' + CurrentForm.getRecord().data['SI'] + '<BR>' +
                        'SA:' + CurrentForm.getRecord().data['SA'];
                    Ext.toast(MsgHistory);
                    Custom.ExecuteProcRequest('aaalogsuseropen');
                    Custom.FormDataSave();
                } else {
                    Ext.MessageBox.show({
                        title: 'Error History',
                        msg: 'attenzione salvare prima di visualizzare la sua history',
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK,
                        alwaysOnTop: true,
                        maxWidth: 600
                    });
                }
            }
        }
    },
    {
        xtype: 'splitbutton',
        itemId: 'ButtonLanguage',
        name: 'ButtonLanguage',
        xtype: 'button',
        hidden: !LanguageManager,
        iconCls: 'x-fa fa-flag toolBarIcon',
        scale: scaledim,
        menu: [
            {
                xtype: 'button',
                itemId: 'ButtonLanguageData',
                name: 'ButtonLanguageData',
                text: 'LanguageData',
                iconCls: 'x-fa fa-flag',
                tooltip: 'Open Language Data',
                listeners: {
                    click: function (btn, evt) {
                        var me = btn.up('panel');
                        Custom.setCurrentPanelForm(me);
                        var CurrentForm = CurrentPanel.getForm();
                        var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                        if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                            Custom.ExecuteProcRequest('aaalanguagetableopen');
                            Custom.FormDataSave();
                        } else {
                            Ext.MessageBox.show({
                                title: 'Error Language',
                                msg: 'attenzione salvare prima di visualizzare la sua Language',
                                icon: Ext.MessageBox.ERROR,
                                buttons: Ext.Msg.OK,
                                alwaysOnTop: true,
                                maxWidth: 600
                            });
                        }
                    }
                }
            },
            {
                xtype: 'button',
                itemId: 'ButtonLanguageLayout',
                name: 'ButtonLanguageLayout',
                text: 'LanguageLayout',
                iconCls: 'x-fa fa-flag',
                tooltip: 'Open Language Layout',
                listeners: {
                    click: function (btn, evt) {
                        var me = btn.up('panel');
                        Custom.setCurrentPanelForm(me);
                        var CurrentForm = CurrentPanel.getForm();
                        var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                        if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                            Custom.ExecuteProcRequest('aaalanguagelayoutopen');
                            Custom.FormDataSave();
                        } else {
                            Ext.MessageBox.show({
                                title: 'Error Language',
                                msg: 'attenzione salvare prima di visualizzare la sua Language',
                                icon: Ext.MessageBox.ERROR,
                                buttons: Ext.Msg.OK,
                                alwaysOnTop: true,
                                maxWidth: 600
                            });
                        }
                    }
                }
            }
        ]
    },
    {
        xtype: 'button',
        itemId: 'ButtonActivity',
        name: 'ButtonActivity',
        iconCls: 'x-fa fa-anchor toolBarIcon',
        border: true,
        hidden: false,
        tooltip: 'Open Activity',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var CurrentForm = CurrentPanel.getForm();
                var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                    Custom.ExecuteProcRequest('aaaactivityopen');
                    Custom.FormDataSave();
                } else {
                    Ext.MessageBox.show({
                        title: 'Error Activity',
                        msg: 'attenzione salvare prima di impostare una activity',
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK,
                        alwaysOnTop: true,
                        maxWidth: 600
                    });
                }
            }
        }
    }, {
        itemId: 'ButtonDocuments',
        name: 'ButtonDocuments',
        xtype: 'button',
        iconCls: 'x-fa fa-folder-open-o toolBarIcon',
        border: true,
        tooltip: 'Open Document',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var CurrentForm = CurrentPanel.getForm();
                var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                    Custom.ExecuteProcRequest('aaadocumentsopen');
                    Custom.FormDataSave();
                } else {
                    Ext.MessageBox.show({
                        title: 'Error Document',
                        msg: 'attenzione salvare prima di allegare un documento',
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK,
                        alwaysOnTop: true,
                        maxWidth: 600
                    });
                }
            }
        }
    }, {
        itemId: 'ButtonNote',
        name: 'ButtonNote',
        xtype: 'button',
        iconCls: 'x-fa fa-sticky-note',
        border: true,
        hidden: false,
        tooltip: 'Open Note',
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var CurrentForm = CurrentPanel.getForm();
                var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                    Custom.ExecuteProcRequest('aaanoteopen');
                    Custom.FormDataSave();
                } else {
                    Ext.MessageBox.show({
                        title: 'Error Note',
                        msg: 'attenzione salvare prima di impostare una nota',
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK,
                        alwaysOnTop: true,
                        maxWidth: 600
                    });
                }
            }
        }
    }, {
        itemId: 'ButtonLock',
        name: 'ButtonLock',
        xtype: 'button',
        iconCls: 'x-fa fa-expeditedssl',
        border: true,
        tooltip: 'Lock Record',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var CurrentForm = CurrentPanel.getForm();
                var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                    //OLD STATO (QUINDI INVERSO)
                    if (CurrentUser.UserManager == 1) {
                        var ButtonRecSave = CurrentToolBar.getComponent('ButtonRecSave');
                        var ButtonRecDel = CurrentToolBar.getComponent('ButtonRecDel');
                        var ButtonLock = CurrentToolBar.getComponent('ButtonLock');
                        var ButtonRecClone = CurrentToolBar.getComponent('ButtonRecClone');
                        if (CurrentForm.getRecord().data['SL'] == 0) {
                            //btnlock.setStyle('color','red');
                            ButtonLock.setStyle('background-color', 'red');
                            //DAFARE READONLY FORM
                            ButtonRecSave.disable();
                            ButtonRecDel.disable();
                            ButtonRecClone.enable();
                        } else {
                            //btnlock.setStyle('color','red');
                            ButtonLock.setStyle('background-color', '');
                            //DAFARE READONLY FORM
                            ButtonRecSave.enable();
                            ButtonRecDel.enable();
                            ButtonRecClone.enable();
                        }

                        Custom.ExecuteProcRequest('aaalockrecord');
                        Custom.FormDataSave();
                    } else {
                        Ext.MessageBox.show({
                            title: 'Error ButtonLock',
                            msg: 'attenzione non autorizzato',
                            icon: Ext.MessageBox.ERROR,
                            buttons: Ext.Msg.OK,
                            alwaysOnTop: true,
                            maxWidth: 600
                        });
                    }

                } else {
                    Ext.MessageBox.show({
                        title: 'Error ButtonLock',
                        msg: 'attenzione salvare prima di impostare field ButtonLock',
                        icon: Ext.MessageBox.ERROR,
                        buttons: Ext.Msg.OK,
                        alwaysOnTop: true,
                        maxWidth: 600
                    });
                }
            }
        }
    }, '-', {
        itemId: 'ButtonChat',
        name: 'ButtonChat',
        xtype: 'button',
        iconCls: 'x-fa fa-comments toolBarIcon',
        border: true,
        tooltip: 'Help Chat Operator',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.Chat();
            }
        }
    },
    {
        xtype: 'button',
        itemId: 'ButtonHelp',
        name: 'ButtonHelp',
        iconCls: 'x-fa fa-question-circle toolBarIcon',
        border: true,
        tooltip: 'Help',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);


                result = new ExecuteOnObjectPropertyExist(CurrentPanelRaw.Json, 'tooltip', 'Custom.AbbinaEventToObj(objparam)');

                var CurrentGuideIntro = [];
                CurrentGuideIntro[0] = {
                    intro: CurrentPanelRaw.GuideToolTip
                };

                var toAddI = 1;
                /*
                var objsExt = CurrentPanel.items.getRange();
                Ext.Array.each(objsExt, function(objExt) {
                    if (objExt.hasOwnProperty('tooltip')) {
                        CurrentGuideIntro[toAddI] = {
                                                        element: '#' + objExt.id,
                                                        intro: toAddI + " Campo da compilare." + objExt.tooltip
                                                    }
                        toAddI++;
                    }
                });
                */
                //FORM
                var form = CurrentPanel.getForm();
                form.getFields().each(function (objExt) {
                    if (objExt.hasOwnProperty('tooltip')) {
                        CurrentGuideIntro[toAddI] = {
                            element: '#' + objExt.id,
                            intro: toAddI + " Campo da compilare." + objExt.tooltip
                        }
                        toAddI++;
                    }
                });


                if (CurrentGuideIntro == []) {
                    CurrentGuideIntro[toAddI] = {
                        intro: "Guida non presente"
                    };
                }

                introJs().setOptions({
                    steps: CurrentGuideIntro
                }).onchange(function () {
                    console.log(this, arguments, 'introJs change');
                }).onexit(function () {
                    console.log(this, arguments, 'introJs exit');
                }).oncomplete(function () {
                    console.log(this, arguments, 'introJs complete');
                }).start();
            }
        }
    }];
    var InDipendentToolbar = Ext.create('Ext.toolbar.Toolbar', {
        hidden: true,
        itemId: 'toolbarmenu',
        docked: 'top',
        defaults: {
            border: false
        },
        items: ToolbarAppo,
        overflowHandler: 'scroller' // 'menu'
    });
    CurrentToolBar = InDipendentToolbar;
    Custom.ToolBarProc(CurrentToolBar);

    //BUTTON BAR
    if (CurrentDeviceType == 'desktop') {
        CurrentToolBar.show();
    } else if (CurrentDeviceType == 'tablet') {
        CurrentToolBar.show();
    }

    CurrentPanel = InDipendentPanel;
    CurrentWindow = InDipendentWindow;
    //Trova maxWidth e maxHeight della form
    if ((CurrentPanelRaw.WindowWidth == 0) && (CurrentPanelRaw.WindowHeight == 0)) {
        if (CurrentPanelRaw.ViewType == 'grid') {
            CurrentPanelRaw.WindowHeight = Ext.getBody().getViewSize().height;
            CurrentPanelRaw.WindowHeight = CurrentPanelRaw.WindowHeight - ((CurrentPanelRaw.WindowHeight / 100) * 35);

            CurrentPanelRaw.WindowWidth = Ext.getBody().getViewSize().width;
            CurrentPanelRaw.WindowWidth = CurrentPanelRaw.WindowWidth - ((CurrentPanelRaw.WindowWidth / 100) * 35);
        } else {
            result = ExecuteOnObjectPropertyExist(CurrentPanelRaw.Json, 'name', 'Custom.MaxWidthHeightPropObj(objparam)');
        }
    }


    InDipendentWindow = Ext.create('Ext.window.Window', {
        name: CurrentPanelRaw.name + '_Window',
        id: CurrentPanelRaw.name + '_Window',
        //closeAction:'hide',
        constrainHeader: true,
        minHeight: 200,
        minWidth: 200,
        title: CurrentPanelRaw.title,
        width: ((CurrentPanelRaw.WindowWidth != 0) ? CurrentPanelRaw.WindowWidth : Ext.getBody().getViewSize().width - 130),
        height: ((CurrentPanelRaw.WindowHeight != 0) ? CurrentPanelRaw.WindowHeight : Ext.getBody().getViewSize().height - 20),
        modal: typemodal,
        closable: true,
        floating: true,
        maximizable: true,
        animCollapse: true,
        resizable: true,
        border: true,
        padding: '5 5 0 5',
        maximized: ((CurrentDeviceType == 'app') || (CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone') ? true : false),
        forceFit: true,
        layout: {
            type: 'fit',
            align: 'stretch'
        },
        autoScroll: true,
        items: [InDipendentPanel],
        dockedItems: [InDipendentToolbar],
        isMinimized: false,
        trackResetOnLoad: true,
        listeners: {
            minimize: function (window, opts) {
                // inutile nn ci entra
                window.collapse();
                window.setWidth(150);
                window.alignTo(Ext.getBody(), 'bl-bl');

            },
            beforeclose: function (win) {
                if (!win.closeConfirmed) {
                    var me = this.down('form');
                    CurrentPanelRaw = clone(me.definitionraw);
                    if ((CurrentPanelRaw.ViewType == 'form')) {
                        var dirty = me.isDirty();
                        if (dirty) {
                            Ext.MessageBox.show({
                                title: 'Warning',
                                msg: 'Le eventuali modifiche ai dati verranno perse, Vuoi Continuare ad uscire dalla maschera?',
                                buttons: Ext.Msg.YESNO,
                                maxWidth: 600,
                                closable: false,
                                fn: function (btnId) {
                                    if (btnId === 'yes') {
                                        win.closeConfirmed = true;
                                        win.close();
                                    }
                                }
                            });
                        } else {
                            win.closeConfirmed = true;
                            win.close();
                        }
                    } else {
                        win.closeConfirmed = true;
                        win.close();
                    }
                    return false;
                }
            },
            close: function (panel, eOpts) {
                //REMOVE STORE
                var me = this.down('form');
                if (me !== undefined) {
                    if (me.definitionraw != '') {
                        CurrentPanelRaw = clone(me.definitionraw);
                        CurrentPanel = undefined;
                        CurrentWindow = undefined;
                        CurrentToolBar = undefined;
                        Custom.ObjDestroyAllDataSource(CurrentPanelRaw.name);
                    }
                }

                //REMOVE TASKOBJ
                var toDelete = [];
                var toDeleteI = 0;
                Ext.each(CurrentTaskBar.items.items, function (objExt) {
                    if (objExt.itemId == 'Button_' + InDipendentWindow.id) {
                        toDelete[toDeleteI] = objExt;
                        toDeleteI++;
                    }
                });
                for (i = 0; i < toDeleteI; i++) {
                    CurrentTaskBar.remove(toDelete[i]);
                }
                this.destory;
            },
            focus: function (ThisWindow, event, eOpts) {
                var me = this.down('form');
                if (me.definitionraw != '')
                    CurrentPanelRaw = clone(me.definitionraw);
                CurrentPanel = me;
                CurrentWindow = this;
                CurrentToolBar = CurrentWindow.getComponent('toolbarmenu');
                console.log('focus window ' + CurrentPanelRaw.name);
            },
            activate: function (ThisWindow, eOpts) {
                //var me = this.down('form');
                //if (me.definitionraw != '') CurrentPanelRaw = clone(me.definitionraw);
                //CurrentPanel = me;
                //CurrentWindow = this;
                //CurrentToolBar  = CurrentWindow.getComponent('toolbarmenu');
                //console.log('activate window ' + me.name);
            },
            show: function (ThisWindow, eOpts) {
                //win.findById('id-of-your-field').focus();
                //ThisWindow.down('ID').focus();
                //Ext.getCmp('ID').focus();
            },
            render: function (ThisWindow, eOpts) { },
            resize: function () {
                console.log('resizepanelindip');
            },
            afterrender: function () {
                if (CurrentDeviceType == 'phone') {
                    var cmp = this;
                    var mySaveButton = Ext.create('Ext.panel.Tool', {
                        type: 'save',
                        handler: function () {
                            var me = this.up('panel');
                            Custom.setCurrentPanelForm(me);
                            Custom.ExecuteProcRequest('SAVE');
                            Custom.FormDataSave();

                            var ButtonRecRefresh = CurrentToolBar.getComponent('ButtonRecRefresh');
                            var ButtonRecDel = CurrentToolBar.getComponent('ButtonRecDel');
                            ButtonRecRefresh.enable();
                            ButtonRecDel.enable();
                        }
                    })
                    cmp.header.insert(2, mySaveButton); // number depends on other items in header
                }
            }
        },
        tools: [{
            type: 'restore',
            hidden: true,
            handler: function (evt, toolEl, owner, tool) {
                var window = owner.up('window');
                window.expand('', false);
                window.setWidth(winWidth);
                window.center();
                window.isMinimized = false;
                this.hide();
                this.nextSibling().show();
            }
        }, {
            type: 'minimize',
            handler: function (evt, toolEl, owner, tool) {
                var window = owner.up('window');
                //window.collapse();
                //winWidth = window.getWidth();
                //window.setWidth(150);
                //window.alignTo(Ext.getBody(), 'bl-bl');
                //this.hide();
                //this.previousSibling().show();
                window.isMinimized = true;
                window.hide();
            }
        }]
    });

    InDipendentWindow.show();

    //TASK BAR
    var AppoWindow = {
        itemId: 'Button_' + InDipendentWindow.id,
        name: 'Button_' + InDipendentWindow.id,
        windowobj: InDipendentWindow,
        html: InDipendentWindow.title,
        xtype: 'button',
        addedd: 'true',
        iconCls: 'x-fa fa-bars',
        scale: scaledim,
        tooltip: InDipendentWindow.title,
        listeners: {
            click: function (btn, evt) {
                var _self = this;
                var window = btn.windowobj;
                //window.expand('', false);
                //window.setWidth(winWidth);
                //window.center();
                if (window.isMinimized == true) {
                    window.isMinimized = false;
                    window.show();
                    window.focus();
                } else {
                    window.isMinimized = true;
                    window.hide();
                }
            }
        }
    };
    CurrentTaskBar.add(AppoWindow);

    //DIMENSION WINDOW
    if (CurrentPanelRaw.WindowX != 0) {
        InDipendentWindow.x = CurrentPanelRaw.WindowX;
    }
    if (CurrentPanelRaw.WindowY != 0) {
        InDipendentWindow.y = CurrentPanelRaw.WindowY;
    }

    if ((themeName == 'azzurra') || (themeName == 'chs')) {
        if (CurrentPanelRaw.themeUI != '') {
            InDipendentWindow.setUI(CurrentPanelRaw.themeUI + '-window');
        } 
        else {
            InDipendentWindow.setUI('black' + '-window');   //Blue Green Red Orange Black
        }
    }
}
Custom.MaxWidthHeightPropObj = function (obj) {
    if (obj.width !== undefined) {
        if ((obj.x + obj.width) > CurrentPanelRaw.WindowWidth) {
            CurrentPanelRaw.WindowWidth = obj.x + obj.width + 50;
        }
    } else if (obj.minWidth !== undefined) {
        if ((obj.x + obj.minWidth) > CurrentPanelRaw.WindowWidth) {
            CurrentPanelRaw.WindowWidth = obj.x + obj.minWidth + 50;
        }
    } else {
        if ((obj.x + 10) > CurrentPanelRaw.WindowWidth) {
            CurrentPanelRaw.WindowWidth = obj.x + 10 + 50;
        }
    }

    if (obj.height !== undefined) {
        if ((obj.y + obj.height) > CurrentPanelRaw.WindowHeight) {
            CurrentPanelRaw.WindowHeight = obj.y + obj.height + 150;
        }
    } else if (obj.minHeight !== undefined) {
        if ((obj.y + obj.minHeight) > CurrentPanelRaw.WindowHeight) {
            CurrentPanelRaw.WindowHeight = obj.y + obj.minHeight + 150;
        }
    } else {
        if ((obj.y + 10) > CurrentPanelRaw.WindowHeight) {
            CurrentPanelRaw.WindowHeight = obj.y + 10 + 150;
        }
    }

    if (CurrentPanelRaw.WindowWidth < 600) CurrentPanelRaw.WindowWidth = 600;
    if (CurrentPanelRaw.WindowHeight < 400) CurrentPanelRaw.WindowHeight = 400;

    if (CurrentPanelRaw.WindowWidth > Ext.getBody().getViewSize().width - 10)
        CurrentPanelRaw.WindowWidth = Ext.getBody().getViewSize().width - 10;
    if (CurrentPanelRaw.WindowHeight > Ext.getBody().getViewSize().height - 10)
        CurrentPanelRaw.WindowHeight = Ext.getBody().getViewSize().height - 10;

    console.log('WindowHeight' + CurrentPanelRaw.WindowHeight + ' WindowWidth' + CurrentPanelRaw.WindowWidth);
}

//*************************************************************************************************************//
//                LAYOUT VALIDAZIONE
Custom.FormIsValid = function () {
    console.log('FormValidation');
    var CurrentForm = CurrentPanel.getForm();
    CurrentPanelRaw.Valid = false;
    Ext.Ajax.request({
        url: 'includes/io/LayoutValidate.php',
        params: {
            layoutid: CurrentPanelRaw.id
        },
        async: false,
        success: function (response) {
            console.log('FormValidation Eva:');
            var message = '';
            eval(response.responseText);
            console.log('FormValidation message:' + message);
            if ((message == true) || (message == null) || (message == '')) {
                console.log('FormValidation' + 'OK');
                CurrentPanelRaw.Valid = true;
            } else {
                console.log('FormValidation' + 'KO');
                Ext.MessageBox.alert('Errore', message);
                CurrentPanelRaw.Valid = false;
            }
        },
        failure: function (response) {
            if (Custom.isJson(response.responseText)) {
                Ext.MessageBox.show({
                    title: 'Error FormIsValid',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText.message,
                    icon: Ext.MessageBox.ERROR,
                    closable: false,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            } else {
                Ext.MessageBox.show({
                    title: 'Error FormIsValid',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText,
                    icon: Ext.MessageBox.ERROR,
                    closable: false,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            }
        },
    });
}

//*************************************************************************************************************//
//                LAYOUT EDITOR
Custom.ReportEdit = function (LayoutId) {
    console.log('ReportEdit');
    Custom.openLinkInNewWindow('reportdesigner/index.php?id=' + LayoutId, 'ReportEdit');
}
Custom.LabelEdit = function (LayoutId) {
    console.log('LabelEdit');
    Custom.openLinkInNewWindow('labeldesigner/index.php?id=' + LayoutId, 'LabelEdit');
}
Custom.FormEdit = function (LayoutId) {
    console.log('FormEdit');
    Custom.openLinkInNewWindow('formdesigner/index.php?id=' + LayoutId, 'FormEdit');
}

//*************************************************************************************************************//
//                OGGETTI ABBINA
Custom.AbbinaStoreAdObject = function (obj) {
    obj.store = 'DS_' + CurrentPanelRaw.name + '_' + obj.name;
    if (obj['rowlimit'] === undefined) {
        obj.rowlimit = RowLimitMax;
    }
}

Custom.GridSaveRow = function (obj) {
    var ObjInForm = CurrentPanel.getForm().findField(obj['name']);
    if (ObjInForm.CheckColumn != 0) {
        //Ext.getBody().mask('Wait, executing for every selected row ..');
        //Ext.Function.defer(function () {

        //cancella tabella appoggio action complessiva
        if (ObjInForm.CheckColumnCleanUp) {
            Custom.ExecuteProc('appotruncate', null, null);
        }
        //colleziona record selezionati ed esegue action abbinata
        ObjInForm.PostMassAction(ObjInForm.ActionColumn, 'true');
        //    Ext.getBody().unmask();
        // }, 10);
    }
}
Custom.AbbinaEventToButton = function (obj) {
    obj.listeners = {};
    //EVENT ON CLICK
    obj.listeners.click = function (btn, evt) {
        var me = this;
        Custom.setCurrentPanelForm(btn.up('form'));
        CurrentObjectRequestId = me.name;
        if (me.processfree == undefined) {
            me.processfree = false;
        }
        // solo se ho finito di salvare passo al prossimo thread
        if (me.procremoteonclick !== undefined) {
            if (me.procalert !== undefined) {
                var messagebox = Ext.MessageBox.show({
                    title: 'Conferma Operazione ',
                    msg: 'Confermi ?' + me.procalert,
                    buttons: Ext.MessageBox.OKCANCEL,
                    icon: Ext.MessageBox.WARNING,
                    maxWidth: 600,
                    closable: false,
                    alwaysOnTop: true,
                    fn: function (btnConfirm) {
                        if (btnConfirm == 'ok') {
                            Custom.ExecuteProcRequest(me.procremoteonclick, me.processfree);
                            Custom.FormDataSave();
                            return;
                        } else {
                            return;
                        }
                    }
                });
                Ext.Function.defer(function () {
                    messagebox.zIndexManager.bringToFront(messagebox);
                }, 100);
            } else {
                Custom.ExecuteProcRequest(me.procremoteonclick, me.processfree);
                Custom.FormDataSave();
            }
        }
    };
}
Custom.AbbinaAutopostbackToObj = function (obj) {
    obj.listeners = {};
    // e.HOME, e.END, e.PAGE_UP, e.PAGE_DOWN,
    // e.TAB, e.ESC, arrow keys: e.LEFT, e.RIGHT, e.UP, e.DOWN
    switch (obj['xtype']) {
        case 'dynamictreegrid':
            obj.listeners.update = function () {
                Custom.FormSaveVar(obj.name, this.getValue());
                Custom.RefreshAllDataStore();
            };
            console.log('added autopostback on select to' + obj['name']);
            break;
        case 'combobox':
        case 'datefield':
        case 'datetimefield':
        case 'dynamiccombo':
        case 'dynamicgrid':
            obj.listeners.select = function () {
                Custom.FormSaveVar(obj.name, this.getValue());
                Custom.RefreshAllDataStore();
            };
            console.log('added autopostback on select to' + obj['name']);
            break;
        case 'textfield':
            obj.listeners.specialkey = function (field, e) {
                if (e.getKey() == e.ENTER) {
                    Custom.FormSaveVar(obj.name, this.getValue());
                    Custom.RefreshAllDataStore();
                }
                if (e.getKey() == e.TAB) {
                    Custom.FormSaveVar(obj.name, this.getValue());
                    Custom.RefreshAllDataStore();
                }
            }
            console.log('added autopostback on update to' + obj['name']);
            break;
        default:
            obj.listeners.update = function () {
                Custom.FormSaveVar(obj.name, this.getValue());
                Custom.RefreshAllDataStore();
            };
            console.log('added autopostback on update to' + obj['name']);
            break;
    }
}
Custom.AbbinaEventToObj = function (obj) {
    obj.listeners = {};

    switch (obj['xtype']) {
        case 'dynamictreegrid':
            obj.listeners.update = function () {
                // solo se ho finito di salvare passo al prossimo thread
                if (this.procremoteonupdate !== undefined) {

                    var me = this.up('form');
                    Custom.setCurrentPanelForm(me);
                    CurrentObjectRequestId = this.name;

                    Custom.ExecuteProcRequest(this.procremoteonupdate);
                    Custom.FormDataSave();
                }
            };
            console.log('added AbbinaEventToObj on select to' + obj['name']);
            break;
        case 'combobox':
        case 'datefield':
        case 'dynamiccombo':
        case 'dynamicgrid':
            obj.listeners.select = function () {
                // solo se ho finito di salvare passo al prossimo thread
                if (this.procremoteonupdate !== undefined) {

                    var me = this.up('form');
                    Custom.setCurrentPanelForm(me);
                    CurrentObjectRequestId = this.name;

                    Custom.ExecuteProcRequest(this.procremoteonupdate);
                    Custom.FormDataSave();
                }
            };
            console.log('added AbbinaEventToObj on select to' + obj['name']);
            break;
        case 'textfield':
            if ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone')) {
                obj.listeners.blur = function (f, e) {
                    // solo se ho finito di salvare passo al prossimo thread
                    if ((this.procremoteonupdate !== undefined) && (!Custom.IsNullOrEmptyOrZeroString(this.value))) {
                        var me = this.up('form');
                        Custom.setCurrentPanelForm(me);
                        CurrentObjectRequestId = this.name;

                        Custom.ExecuteProcRequest(this.procremoteonupdate);
                        Custom.FormDataSave();
                    }
                };
                obj.listeners.specialkey = function (f, e) {
                    if (e.getKey() == e.ENTER) { //Ext.event.Event.ENTER
                        // solo se ho finito di salvare passo al prossimo thread
                        if ((this.procremoteonupdate !== undefined) && (!Custom.IsNullOrEmptyOrZeroString(this.value))) {
                            var me = this.up('form');
                            Custom.setCurrentPanelForm(me);
                            CurrentObjectRequestId = this.name;

                            Custom.ExecuteProcRequest(this.procremoteonupdate);
                            Custom.FormDataSave();
                        }
                    }
                    if (e.getKey() == e.TAB) { //Ext.event.Event.ENTER
                        // solo se ho finito di salvare passo al prossimo thread
                        if ((this.procremoteonupdate !== undefined) && (!Custom.IsNullOrEmptyOrZeroString(this.value))) {
                            var me = this.up('form');
                            Custom.setCurrentPanelForm(me);
                            CurrentObjectRequestId = this.name;

                            Custom.ExecuteProcRequest(this.procremoteonupdate);
                            Custom.FormDataSave();
                        }
                    }
                };
            } else {
                obj.listeners.specialkey = function (f, e) {
                    if (e.getKey() == e.ENTER) { //Ext.event.Event.ENTER
                        // solo se ho finito di salvare passo al prossimo thread
                        if ((this.procremoteonupdate !== undefined) && (!Custom.IsNullOrEmptyOrZeroString(this.value))) {
                            var me = this.up('form');
                            Custom.setCurrentPanelForm(me);
                            CurrentObjectRequestId = this.name;

                            Custom.ExecuteProcRequest(this.procremoteonupdate);
                            Custom.FormDataSave();
                        }
                    }
                    if (e.getKey() == e.TAB) { //Ext.event.Event.ENTER
                        // solo se ho finito di salvare passo al prossimo thread
                        if ((this.procremoteonupdate !== undefined) && (!Custom.IsNullOrEmptyOrZeroString(this.value))) {
                            var me = this.up('form');
                            Custom.setCurrentPanelForm(me);
                            CurrentObjectRequestId = this.name;

                            Custom.ExecuteProcRequest(this.procremoteonupdate);
                            Custom.FormDataSave();
                        }
                    }
                };
            }
            console.log('added AbbinaEventToObj on enter to' + obj['name']);
            break;
        case 'dynamictextfield':
            obj.listeners.specialkey = function (f, e) {
                if (e.getKey() == e.ENTER) { //Ext.event.Event.ENTER
                    // solo se ho finito di salvare passo al prossimo thread
                    if (this.procremoteonupdate !== undefined) {
                        var me = this.up('form');
                        Custom.setCurrentPanelForm(me);
                        CurrentObjectRequestId = this.name;

                        Custom.ExecuteProcRequest(this.procremoteonupdate);
                        Custom.FormDataSave();
                    }
                }
                if (e.getKey() == e.TAB) { //Ext.event.Event.TAB
                    // solo se ho finito di salvare passo al prossimo thread
                    if (this.procremoteonupdate !== undefined) {
                        var me = this.up('form');
                        Custom.setCurrentPanelForm(me);
                        CurrentObjectRequestId = this.name;

                        Custom.ExecuteProcRequest(this.procremoteonupdate);
                        Custom.FormDataSave();
                    }
                }
            };
            console.log('added AbbinaEventToObj on enter to' + obj['name']);
            break;
        default:
            obj.listeners.update = function () {
                // solo se ho finito di salvare passo al prossimo thread
                if (this.procremoteonupdate !== undefined) {

                    var me = this.up('form');
                    Custom.setCurrentPanelForm(me);
                    CurrentObjectRequestId = this.name;

                    Custom.ExecuteProcRequest(this.procremoteonupdate);
                    Custom.FormDataSave();
                }
            };
            console.log('added AbbinaEventToObj on update to' + obj['name']);
            break;
    }
}
Custom.AbbinaPropToCombo = function (obj) {
    obj.editable = true;
    obj.typeAhead = true;
    obj.typeAheadDelay = 100;
    obj.minChars = 2;
    obj.mode = 'remote';
    obj.queryParam = 'searchStr';
    obj.autoLoadOnValue = true;

    // BLOCCA LA RICERCA obj.queryMode = 'local';
    if (CurrentPanelRaw.DataMode == 'edit')
        obj.lastQuery = '';
}
Custom.AbbinaHelper = function (obj) {
    obj.afterLabelTextTpl = '<img src="repositorycom/information.gif" class="info_image" data-qtip="' + obj.helperdesc + '"></img>';
}
Custom.SetFocus = function (obj) {
    CurrentPanel.getForm().findField(obj.name).focus();
}

Custom.AbbinaRegexToObj = function (obj) {
    obj.regex = RegExp(obj.regex);
}

Custom.AbbinaPropToObj = function (obj, propertyname, propertyvalue) {
    obj[propertyname] = propertyvalue;
}
Custom.AbbinaPropToObjRendered = function (obj, propertyname) {
    var ObjInForm = CurrentPanel.getForm().findField(obj['name']);
    var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + 'Form00');
    var FormData = DS_Form00.data.first().data;
    var expression = obj[propertyname];
    for (var key in FormData) {
        expression = expression.replace(key + ' ', FormData[key]);
    }
    if (eval(expression)) {
        // DAFARE hiddenInFormExp comando da ricavare dalla property  hidden + InFormExp
        ObjInForm.hide();
    }
}
Custom.AbbinaWhereToCombo = function (obj) {
    obj.datawhere = '';
    if ((CurrentPanelRaw.DataSourceType != '') && (CurrentPanelRaw.DataSourceType != 'NONE') && (CurrentPanelRaw.DataSource != '')) {
        var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + 'Form00');
        if (DS_Form00.data.items[0] !== undefined) {
            if (DS_Form00.data.items[0].data[obj.datasourcefield] !== undefined) {
                if (Custom.isNumber(DS_Form00.data.items[0].data[obj.datasourcefield]) == true) {
                    obj.datawhere = obj.valueField + '=' + DS_Form00.data.items[0].data[obj.datasourcefield];
                }
                else if (DS_Form00.data.items[0].data[obj.datasourcefield] == 'null') {
                    obj.datawhere = obj.valueField + ' is ' + DS_Form00.data.items[0].data[obj.datasourcefield];
                }
                else if (DS_Form00.data.items[0].data[obj.datasourcefield] == null) {
                    obj.datawhere = obj.valueField + ' is ' + DS_Form00.data.items[0].data[obj.datasourcefield];
                }
                else {
                    obj.datawhere = obj.valueField + '=' + "'" + DS_Form00.data.items[0].data[obj.datasourcefield].replace("'", "\\'") + "'";
                }
            } else {
                obj.datawhere = '';
            }
        } else {
            obj.datawhere = '';
        }
    }
}
Custom.AbbinaWhereToRenderedCombo = function (obj) {
    obj.datawhere = '';
    var CurrentForm = CurrentPanel.getForm();
    var objExt = CurrentForm.findField(obj.name);
    if ((CurrentPanelRaw.DataSourceType != '') && (CurrentPanelRaw.DataSourceType != 'NONE') && (CurrentPanelRaw.DataSource != '')) {
        var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + 'Form00');
        if (DS_Form00.data.items[0] !== undefined) {
            if (DS_Form00.data.items[0].data[obj.datasourcefield] !== undefined) {
                if (Custom.isNumber(DS_Form00.data.items[0].data[obj.datasourcefield]) == true) {
                    objExt.datawhere = obj.valueField + '=' + DS_Form00.data.items[0].data[obj.datasourcefield];
                    obj.datawhere = obj.valueField + '=' + DS_Form00.data.items[0].data[obj.datasourcefield];
                    objExt.store.proxy.extraParams.datawhere = objExt.datawhere;
                } else if (DS_Form00.data.items[0].data[obj.datasourcefield] == 'null') {
                    objExt.datawhere = obj.valueField + ' is ' + DS_Form00.data.items[0].data[obj.datasourcefield];
                    obj.datawhere = obj.valueField + ' is ' + DS_Form00.data.items[0].data[obj.datasourcefield];
                    objExt.store.proxy.extraParams.datawhere = objExt.datawhere;
                } else {
                    objExt.datawhere = obj.valueField + '=' + "'" + DS_Form00.data.items[0].data[obj.datasourcefield] + "'";
                    obj.datawhere = obj.valueField + '=' + "'" + DS_Form00.data.items[0].data[obj.datasourcefield] + "'";
                    objExt.store.proxy.extraParams.datawhere = objExt.datawhere;
                }
            } else {
                objExt.datawhere = '';
                obj.datawhere = '';
                objExt.store.proxy.extraParams.datawhere = objExt.datawhere;
            }
        } else {
            objExt.datawhere = '';
            obj.datawhere = '';
            objExt.store.proxy.extraParams.datawhere = objExt.datawhere;
        }
    }
}
Custom.AbbinaPropToTabPanel = function (obj) {
    if ((obj['deferredRender'] !== undefined) && (obj['deferredRender'] != '')) {
    } else {
        obj.deferredRender = false;
    }
}
Custom.AbbinaPropToTimeField = function (obj) {
    obj.format = 'H:i';
}

//*************************************************************************************************************//
//                OGGETTI DATASTORE
Custom.ObjLoadDataSource = function (JsonObj, FormPanel, preserveNotNull) {

    if ((preserveNotNull === undefined) || (preserveNotNull == '')) {
        preserveNotNull = false;
    }

    if ((JsonObj.xtype.indexOf('grid') != -1) && (JsonObj.rowlimit < RowLimitMax))
        JsonObj.rowlimit = RowLimitMax;
    if (JsonObj.xtype.indexOf('kpi') != -1)
        JsonObj.rowlimit = -1;
    if (JsonObj.xtype.indexOf('pivot') != -1)
        JsonObj.rowlimit = -1;
    if (JsonObj.xtype.indexOf('report') != -1)
        JsonObj.rowlimit = -1;
    if (JsonObj.xtype.indexOf('map') != -1)
        JsonObj.rowlimit = -1;

    if ((JsonObj['datasourcetype'] !== undefined) && (JsonObj['datasourcetype'] != '')) {
        if (JsonObj.xtype.indexOf('tree') > 0) {
            console.log('LoadingStoreDataTREE name:' + JsonObj.name + 'xtype:' + JsonObj.xtype);
            //STORE TREE PER TREE

            var objautoload = true;
            if ((JsonObj.xtype == 'dynamictreegrid') || (JsonObj.xtype == 'dynamicgrid') || (JsonObj.xtype == 'dynamiccombo') || (JsonObj.xtype == 'combobox')) {
                if ((JsonObj['datasourcefield'] !== undefined) && (JsonObj['datasourcefield'] != '')) {
                    if ((FormPanel.DataSourceType != 'NONE') && (FormPanel.DataSourceType != 'WF') && (FormPanel.DataSourceType != '')) {
                        //prevent load before Form00
                        objautoload = false;
                    }
                }
            }

            return Ext.create('Ext.data.TreeStore', {
                storeId: "DS_" + FormPanel.name + "_" + JsonObj.name,
                autoLoad: objautoload,
                //autoLoad: true,
                remoteSort: true,
                remoteFilter: true,
                encodeFilters: function (filters) {
                    return filters[0].value;
                },
                async: false,
                proxy: {
                    type: 'ajax',
                    node: JsonObj.childrenidname,
                    url: 'includes/io/DataRead.php',
                    filterParam: 'query',
                    params: {
                        start: FormPanel.RowId,
                    },
                    extraParams: {
                        objname: JsonObj.name,
                        //datasource: JsonObj.datasource,
                        datawhere: JsonObj.datawhere,
                        //valuefield: JsonObj.valueField,
                        parentidname: JsonObj.parentidname,
                        parentidstart: JsonObj.parentidstart,
                        limit: JsonObj.rowlimit,
                        layouteditorid: JsonObj.layouteditorid,
                        layoutid: FormPanel.id,
                        datamode: JsonObj.datamode,
                    },
                    reader: {
                        keepRawData: true,
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'total',
                        successProperty: 'success',
                        messageProperty: 'message',
                    },
                    listeners: {
                        exception: function (proxy, response, operation) {
                            Ext.MessageBox.show({
                                title: 'Error ObjLoadDataSource REMOTE EXCEPTION',
                                msg: operation.getError(),
                                icon: Ext.MessageBox.ERROR,
                                maxWidth: 600,
                                alwaysOnTop: true,
                                closable: false,
                                buttons: Ext.Msg.OK
                            });
                        },
                    }
                },
                listeners: {
                    append: function (thisNode, newChildNode, index, eOpts) {
                        // If the node that's being appended isn't a root node, then we can
                        // assume it's one of our UserModel instances that's been "dressed
                        // up" as a node
                        if (!newChildNode.isRoot()) {
                            newChildNode.set('leaf', true);
                            newChildNode.set('text', newChildNode.get('name'));
                        }
                    },
                    load: function (store, records, successful, operation, eOpts) {
                        this.setFields(this.proxy.reader.rawData.fields);
                        console.log('LoadedDATAin TreeStore:' + this.storeId);
                    },
                    metachange: function (store, meta) {
                        store.setFields(store.proxy.reader.rawData.fields);
                    }
                }
            });
        }
        else if (JsonObj.xtype.indexOf('calendar') > 0) {
            console.log('LoadingStoreDataCALENDAR name:' + JsonObj.name + 'xtype:' + JsonObj.xtype);
            //STORE CAL PER CALENDAR

            var objautoload = true;
            return Ext.create('Ext.calendar.store.Calendars', {
                storeId: "DS_" + FormPanel.name + "_" + JsonObj.name,
                autoLoad: objautoload,
                proxy: {
                    type: 'ajax',
                    url: 'includes/io/DataRead.php',
                    filterParam: 'query',
                    params: {
                        start: JsonObj.RowId
                    },
                    extraParams: {
                        objname: JsonObj.name,
                        datawhere: JsonObj.datawhere,
                        //valuefield: JsonObj.valueField,
                        limit: JsonObj.rowlimit,
                        layouteditorid: JsonObj.layouteditorid,
                        layoutid: FormPanel.id,
                        calendardef: 'type',
                        datamode: JsonObj.datamode,
                    },
                    reader: {
                        keepRawData: true,
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'total',
                        successProperty: 'success',
                        messageProperty: 'message',
                    },
                    success: { /* success functions */ },
                    failure: { /* failure functions */ },
                    listeners: {
                        exception: function (proxy, response, operation) {
                            Ext.MessageBox.show({
                                title: 'Error ObjLoadDataSource REMOTE EXCEPTION',
                                msg: operation.getError(),
                                icon: Ext.MessageBox.ERROR,
                                maxWidth: 600,
                                closable: false,
                                alwaysOnTop: true,
                                buttons: Ext.Msg.OK
                            });
                        },
                    }
                },
                listeners: {
                    load: function (store, records, successful, operation, eOpts) {
                        this.setFields(this.proxy.reader.rawData.fields);
                        this.fields = this.proxy.reader.rawData.fields;
                    },
                    exception: function (proxy, response, operation) {
                        Ext.MessageBox.show({
                            title: 'Error ObjLoadDataSource Server Data Error...',
                            msg: operation.getError(),
                            icon: Ext.MessageBox.ERROR,
                            maxWidth: 600,
                            closable: false,
                            alwaysOnTop: true,
                            buttons: Ext.Msg.OK
                        });
                    }
                },
                eventStoreDefaults: {
                    prefetchMode: 'week',
                    proxy: {
                        type: 'ajax',
                        url: 'includes/io/DataRead.php',
                        filterParam: 'query',
                        params: {
                            start: JsonObj.RowId
                        },
                        extraParams: {
                            objname: JsonObj.name,
                            datawhere: JsonObj.datawhere,
                            //valuefield: JsonObj.valueField,
                            limit: JsonObj.rowlimit,
                            layouteditorid: JsonObj.layouteditorid,
                            layoutid: FormPanel.id,
                            calendardef: 'event',
                            datamode: JsonObj.datamode,
                        },
                        reader: {
                            keepRawData: true,
                            type: 'json',
                            rootProperty: 'data',
                            totalProperty: 'total',
                            successProperty: 'success',
                            messageProperty: 'message',
                        },
                        listeners: {
                            exception: function (proxy, response, operation) {
                                Ext.MessageBox.show({
                                    title: 'Error ObjLoadDataSource REMOTE EXCEPTION',
                                    msg: operation.getError(),
                                    icon: Ext.MessageBox.ERROR,
                                    maxWidth: 600,
                                    closable: false,
                                    alwaysOnTop: true,
                                    buttons: Ext.Msg.OK
                                });
                            },
                        }
                    },
                },
            });
        }
        else if (JsonObj.xtype.indexOf('gantt') > 0) {
            console.log('LoadingStoreDataGANTT name:' + JsonObj.name + 'xtype:' + JsonObj.xtype);
            //STORE PER GANTT (MULTISTOREOBJ)
            //(carica in avvio)

            //StoreDependency: null,
            //StoreTask: null,
            //StoreResource: null,
            //StoreAssignment: null,
            //StoreCalendar: null,

            var objautoload = true;

            /**
            var GanttCalendar = new Gnt.data.Calendar({
                calendarId          : "DS_" + FormPanel.name + "_" + JsonObj.name + "_Calendar",
                name                : "DS_" + FormPanel.name + "_" + JsonObj.name + "_Calendar",
                daysPerWeek         : 7,
                daysPerMonth        : 30,
                hoursPerDay         : 24,
                weekendFirstDay     : 3,
                weekendSecondDay    : 0,
                weekendsAreWorkdays : false,
                defaultAvailability : [
                    '08:00-18:00'
                ],
            });
            */

            /* Calendar Store */
            if (JsonObj.datasourcetype_calendar) {
                var calendarManager = Ext.create('Gnt.data.CalendarManager', {
                    storeId: 'DS_' + FormPanel.name + '_' + JsonObj.name + '_CalendarManager',
                    proxy: {
                        type: 'ajax',
                        url: 'includes/io/DataRead.php',
                        filterParam: 'query',
                        params: {
                            start: FormPanel.RowId,
                        },
                        extraParams: {
                            objname: JsonObj.name,
                            objnamesub: 'calendar',
                            onlydata: true,
                            //datasource: JsonObj.datasource,
                            datawhere: JsonObj.datawhere,
                            //valuefield: JsonObj.valueField,
                            limit: JsonObj.rowlimit,
                            layouteditorid: JsonObj.layouteditorid,
                            layoutid: FormPanel.id,
                            datamode: JsonObj.datamode,
                        }
                    }
                });
            }

            /* Task Store */
            Ext.define('MyGanttTask', {
                extend: 'Gnt.model.Task',
                startDateField: JsonObj.startDateField,
                endDateField: JsonObj.endDateField,
                nameField: JsonObj.displayField,
                durationField: JsonObj.durationField,
                DurationUnit: 'n',
                percentDoneField: JsonObj.percentDoneField
            });

            var GanttTaskStore = Ext.create('Gnt.data.TaskStore', {
                //calendar : GanttCalendar,
                storeId: 'DS_' + FormPanel.name + '_' + JsonObj.name + '_Task',
                autoLoad: objautoload,
                model: 'MyGanttTask',
                scheduleByConstraints: true,
                checkDependencyConstraint: true,
                checkPotentialConflictConstraint: true,
                autoLoad: true,

                remoteSort: true,
                remoteFilter: true,
                encodeFilters: function (filters) {
                    return filters[0].value;
                },
                async: false,
                proxy: {
                    type: 'ajax',
                    node: JsonObj.childrenidname,
                    url: 'includes/io/DataRead.php',
                    filterParam: 'query',
                    params: {
                        start: FormPanel.RowId,
                    },
                    extraParams: {
                        objname: JsonObj.name,
                        objnamesub: 'task',
                        onlydata: true,
                        //datasource: JsonObj.datasource,
                        datawhere: JsonObj.datawhere,
                        //valuefield: JsonObj.valueField,
                        parentidname: JsonObj.parentidname,
                        parentidstart: JsonObj.parentidstart,
                        limit: JsonObj.rowlimit,
                        layouteditorid: JsonObj.layouteditorid,
                        layoutid: FormPanel.id,
                        datamode: JsonObj.datamode,
                    },
                    reader: {
                        keepRawData: true,
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'total',
                        successProperty: 'success',
                        messageProperty: 'message',
                    },
                    writer: {
                        type: 'json',
                        root: 'data',
                        encode: true,
                        allowSingle: false
                    },
                    listeners: {
                        exception: function (proxy, response, operation) {
                            Ext.MessageBox.show({
                                title: 'Error ObjLoadDataSource REMOTE EXCEPTION',
                                msg: operation.getError(),
                                icon: Ext.MessageBox.ERROR,
                                maxWidth: 600,
                                closable: false,
                                alwaysOnTop: true,
                                buttons: Ext.Msg.OK
                            });
                        },
                    }
                },
                listeners: {
                    append: function (thisNode, newChildNode, index, eOpts) {
                        // If the node that's being appended isn't a root node, then we can
                        // assume it's one of our UserModel instances that's been "dressed
                        // up" as a node
                        if (!newChildNode.isRoot()) {
                            newChildNode.set('leaf', true);
                            newChildNode.set('text', newChildNode.get('name'));
                        }
                    },
                    load: function (store, records, successful, operation, eOpts) {
                        this.setFields(this.proxy.reader.rawData.fields);
                        console.log('LoadedDATAin TreeStore:' + this.storeId);
                    },
                    metachange: function (store, meta) {
                        store.setFields(store.proxy.reader.rawData.fields);
                    }
                }
            });

            /* Dependency Store */
            Ext.define('MyGanttDependency', {
                extend: 'Gnt.model.Dependency',
                toField: JsonObj.toField,
                fromField: JsonObj.fromField
            });

            var GanttDependencyStore = Ext.create('Gnt.data.DependencyStore', {
                storeId: 'DS_' + FormPanel.name + '_' + JsonObj.name + '_Dependency',
                autoLoad: objautoload,
                allowedDependencyTypes: ['EndToStart'],
                model: 'MyGanttDependency',
                scheduleByConstraints: true,
                checkDependencyConstraint: true,
                checkPotentialConflictConstraint: true,
                preserveNotNull: preserveNotNull,
                filterParam: 'query',
                encodeFilters: function (filters) {
                    return filters[0].value;
                },
                pageSize: JsonObj.rowlimit,
                async: false,
                columns: [],
                proxy: {
                    type: 'ajax',
                    url: 'includes/io/DataRead.php',
                    filterParam: 'query',
                    params: {
                        start: JsonObj.RowId,
                    },
                    extraParams: {
                        objname: JsonObj.name,
                        objnamesub: 'dependency',
                        onlydata: true,
                        datawhere: JsonObj.datawhere,
                        //valuefield: JsonObj.valueField,
                        limit: JsonObj.rowlimit,
                        layouteditorid: JsonObj.layouteditorid,
                        layoutid: FormPanel.id,
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
                                alwaysOnTop: true,
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

                        console.log('LoadedDATAin GanttStore:' + this.storeId);
                    },
                    exception: function (proxy, response, operation) {
                        Ext.MessageBox.show({
                            title: 'Error ObjLoadData Server Data Error...',
                            msg: operation.getError(),
                            icon: Ext.MessageBox.ERROR,
                            maxWidth: 600,
                            closable: false,
                            alwaysOnTop: true,
                            buttons: Ext.Msg.OK
                        });
                    },
                    metachange: function (store, meta) {
                        store.setFields(store.proxy.reader.rawData.fields);
                    }
                }
            });

            /* Resource Store */
            if (JsonObj.datasourcetype_resource) {
                Ext.define('MyGanttResource', {
                    extend: 'Gnt.model.Resource',
                    NameField: JsonObj.resourceNameField,
                    fromField: JsonObj.fromField
                });

                var GanttResourceStore = Ext.create('Gnt.data.ResourceStore', {
                    storeId: "DS_" + FormPanel.name + "_" + JsonObj.name + "_Resource",
                    autoLoad: objautoload,
                    model: 'MyGanttResource',
                    filterParam: 'query',
                    encodeFilters: function (filters) {
                        return filters[0].value;
                    },
                    pageSize: JsonObj.rowlimit,
                    async: false,
                    columns: [],
                    proxy: {
                        type: 'ajax',
                        url: 'includes/io/DataRead.php',
                        filterParam: 'query',
                        params: {
                            start: JsonObj.RowId,
                        },
                        extraParams: {
                            objname: JsonObj.name,
                            objnamesub: 'resource',
                            onlydata: true,
                            datawhere: JsonObj.datawhere,
                            //valuefield: JsonObj.valueField,
                            limit: JsonObj.rowlimit,
                            layouteditorid: JsonObj.layouteditorid,
                            layoutid: FormPanel.id,
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
                                    alwaysOnTop: true,
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

                            console.log('LoadedDATAin GanttStore:' + this.storeId);
                        },
                        exception: function (proxy, response, operation) {
                            Ext.MessageBox.show({
                                title: 'Error ObjLoadData Server Data Error...',
                                msg: operation.getError(),
                                icon: Ext.MessageBox.ERROR,
                                maxWidth: 600,
                                closable: false,
                                alwaysOnTop: true,
                                buttons: Ext.Msg.OK
                            });
                        },
                        metachange: function (store, meta) {
                            store.setFields(store.proxy.reader.rawData.fields);
                        }
                    }
                });
            }
            return;

        }
        else if (JsonObj.xtype.indexOf('scheduler') > 0) {
            console.log('LoadingStoreDataSCHEDULER name:' + JsonObj.name + 'xtype:' + JsonObj.xtype);
            //STORE PER SCHEDULER (MULTISTOREOBJ)
            //(carica in avvio)

            //EventStore: null,
            //ResourceStore: null,

            var objautoload = true;

            /* Event Store */
            Ext.define('MySchEvent.model.Event', {
                extend: 'Sch.model.Event',
                startDateField: JsonObj.startDateField,
                endDateField: JsonObj.endDateField,

                nameField: JsonObj.displayField,
                resourceIdField: JsonObj.resourceIdField
            });

            var SchedulerTaskStore = Ext.create('Sch.data.EventStore', {
                //calendar : EventStore,
                storeId: "DS_" + FormPanel.name + "_" + JsonObj.name + "_Event",
                autoLoad: objautoload,
                model: 'MySchEvent.model.Event',
                autoLoad: true,

                remoteSort: true,
                remoteFilter: true,
                encodeFilters: function (filters) {
                    return filters[0].value;
                },
                async: false,
                proxy: {
                    type: 'ajax',
                    node: JsonObj.childrenidname,
                    url: 'includes/io/DataRead.php',
                    filterParam: 'query',
                    params: {
                        start: FormPanel.RowId,
                    },
                    extraParams: {
                        objname: JsonObj.name,
                        objnamesub: 'event',
                        onlydata: true,
                        //datasource: JsonObj.datasource,
                        datawhere: JsonObj.datawhere,
                        //valuefield: JsonObj.valueField,
                        parentidname: JsonObj.parentidname,
                        parentidstart: JsonObj.parentidstart,
                        limit: JsonObj.rowlimit,
                        layouteditorid: JsonObj.layouteditorid,
                        layoutid: FormPanel.id,
                        datamode: JsonObj.datamode,
                    },
                    reader: {
                        keepRawData: true,
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'total',
                        successProperty: 'success',
                        messageProperty: 'message',
                    },
                    writer: {
                        type: 'json',
                        root: 'data',
                        encode: true,
                        allowSingle: false
                    },
                    listeners: {
                        exception: function (proxy, response, operation) {
                            Ext.MessageBox.show({
                                title: 'Error ObjLoadDataSource REMOTE EXCEPTION',
                                msg: operation.getError(),
                                icon: Ext.MessageBox.ERROR,
                                maxWidth: 600,
                                closable: false,
                                alwaysOnTop: true,
                                buttons: Ext.Msg.OK
                            });
                        },
                    }
                },
                listeners: {
                    append: function (thisNode, newChildNode, index, eOpts) {
                        // If the node that's being appended isn't a root node, then we can
                        // assume it's one of our UserModel instances that's been "dressed
                        // up" as a node
                        if (!newChildNode.isRoot()) {
                            newChildNode.set('leaf', true);
                            newChildNode.set('text', newChildNode.get('name'));
                        }
                    },
                    load: function (store, records, successful, operation, eOpts) {
                        this.setFields(this.proxy.reader.rawData.fields);
                        console.log('LoadedDATAin TreeStore:' + this.storeId);
                    },
                    metachange: function (store, meta) {
                        store.setFields(store.proxy.reader.rawData.fields);
                    }
                }
            });

            /* Resource Store */
            if (JsonObj.datasourcetype_resource) {
                Ext.define('MySchResource.model.Resource', {
                    extend: 'Sch.model.Resource',
                    nameField: JsonObj.resourceNameField
                });

                var SchResourceStore = Ext.create('Sch.data.ResourceStore', {
                    storeId: "DS_" + FormPanel.name + "_" + JsonObj.name + "_Resource",
                    autoLoad: objautoload,
                    model: 'MySchResource.model.Resource',
                    filterParam: 'query',
                    encodeFilters: function (filters) {
                        return filters[0].value;
                    },
                    pageSize: JsonObj.rowlimit,
                    async: false,
                    columns: [],
                    proxy: {
                        type: 'ajax',
                        url: 'includes/io/DataRead.php',
                        filterParam: 'query',
                        params: {
                            start: JsonObj.RowId,
                        },
                        extraParams: {
                            objname: JsonObj.name,
                            objnamesub: 'resource',
                            onlydata: true,
                            datawhere: JsonObj.datawhere,
                            //valuefield: JsonObj.valueField,
                            limit: JsonObj.rowlimit,
                            layouteditorid: JsonObj.layouteditorid,
                            layoutid: FormPanel.id,
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
                                    alwaysOnTop: true,
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

                            console.log('LoadedDATAin GanttStore:' + this.storeId);
                        },
                        exception: function (proxy, response, operation) {
                            Ext.MessageBox.show({
                                title: "Error ObjLoadData Server Data Error...",
                                msg: operation.getError(),
                                icon: Ext.MessageBox.ERROR,
                                maxWidth: 600,
                                closable: false,
                                alwaysOnTop: true,
                                buttons: Ext.Msg.OK
                            });
                        },
                        metachange: function (store, meta) {
                            store.setFields(store.proxy.reader.rawData.fields);
                        }
                    }
                });
            }
            return;

        }
        else {
            console.log('LoadingStoreDataNORM name:' + JsonObj.name + 'xtype:' + JsonObj.xtype);
            //STORE STD PER TUTTO IL RESTO
            //(carica in avvio)
            var objautoload = true;
            if ((JsonObj.xtype == 'dynamictreegrid') || (JsonObj.xtype == 'dynamicgrid') || (JsonObj.xtype == 'dynamiccombo') || (JsonObj.xtype == 'combobox')) {
                if ((FormPanel.DataSourceType != 'NONE') && (FormPanel.DataSourceType != 'WF') && (FormPanel.DataSourceType != '')) {
                    if ((JsonObj['datasourcefield'] !== undefined) && (JsonObj['datasourcefield'] != '')) {
                        //prevent load before Form00
                        objautoload = false;
                    }
                }
            }

            //(filtro attivo in avvio)
            if ((JsonObj.filterwhereonstart) && (JsonObj.filterwhere)) {
                JsonObj.combofilter = JsonObj.filterwhere;
            } else {
                JsonObj.combofilter = null;
            }

            return Ext.create('Ext.data.Store', {
                storeId: "DS_" + FormPanel.name + "_" + JsonObj.name,
                autoLoad: objautoload,
                //autoLoad: true,
                remoteSort: true,
                remoteFilter: true,
                preserveNotNull: preserveNotNull,
                filterParam: 'query',
                encodeFilters: function (filters) {
                    return filters[0].value;
                },
                pageSize: JsonObj.rowlimit,
                async: false,
                columns: [],
                //DAFARE
                groupField: (((JsonObj.groupField != true) && (JsonObj.groupField != false) && (JsonObj.groupField != '')) ? JsonObj.groupField : null),
                proxy: {
                    type: 'ajax',
                    url: 'includes/io/DataRead.php',
                    filterParam: 'query',
                    params: {
                        start: JsonObj.RowId,
                    },
                    extraParams: {
                        objname: JsonObj.name,
                        combofilter: JsonObj.combofilter,
                        datawhere: JsonObj.datawhere,
                        //valuefield: JsonObj.valueField,
                        limit: JsonObj.rowlimit,
                        layouteditorid: JsonObj.layouteditorid,
                        layoutid: FormPanel.id,
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
                                alwaysOnTop: true,
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

                        //load del record di una form
                        if ((this.storeId == "DS_" + CurrentPanelRaw.name + "_" + "Form00") && (CurrentPanelRaw.ViewType == 'form')) {
                            if (CurrentPanelRaw.rendered == false) {
                                //esegue il resto degli store
                                CurrentPanelRaw.rendered = true;
                                Custom.LayoutRenderExt();
                            }

                            //carica i dati in maschera
                            if (this.data.length > 0) {
                                CurrentPanel.getForm().trackResetOnLoad = true;
                                if (this.preserveNotNull) {
                                    var FormData = this.data.first();
                                    CurrentPanel.getForm().getFields().each(function (field) {
                                        if (FormData.data[field.name]) {
                                            field.setValue(FormData.data[field.name]);
                                        }
                                    });
                                } else {
                                    //load in form current record
                                    CurrentPanel.loadRecord(this.data.first());

                                    //activate button documents
                                    if (CurrentToolBar) {
                                        var btndoc = CurrentToolBar.getComponent('ButtonDocuments');
                                        if (btndoc) {
                                            if (this.data.first().data['SD'] == 1) {
                                                btndoc.setStyle('background-color', 'red');
                                            } else {
                                                btndoc.setStyle('background-color', '');
                                            }

                                            //activate button lock
                                            var ButtonLock = CurrentToolBar.getComponent('ButtonLock');
                                            var ButtonRecSave = CurrentToolBar.getComponent('ButtonRecSave');
                                            var ButtonRecDel = CurrentToolBar.getComponent('ButtonRecDel');
                                            var ButtonRecNew = CurrentToolBar.getComponent('ButtonRecNew');
                                            var ButtonRecClone = CurrentToolBar.getComponent('ButtonRecClone');
                                            if (this.data.first().data['SL'] == 1) {
                                                ButtonLock.setStyle('background-color', 'red');
                                                //DAFARE READONLY FORM
                                                ButtonRecSave.disable();
                                                ButtonRecDel.disable();
                                                ButtonRecNew.disable();
                                                ButtonRecClone.enable();
                                            } else {
                                                //ButtonLock.setStyle('color','red');
                                                ButtonLock.setStyle('background-color', '');
                                                ButtonRecSave.enable();
                                                ButtonRecDel.enable();
                                                ButtonRecNew.enable();
                                                ButtonRecClone.enable();
                                            }

                                        }
                                    }
                                    //set dirty to false
                                    //CurrentPanel.getForm().getFields().each(function (field) {
                                    //    field.resetOriginalValue();
                                    // });
                                }
                            }

                            //se in add pulisce, se in duplica pulisce solo l'id
                            switch (CurrentPanelRaw.DataMode) {
                                case 'add':
                                    console.log('add:' + CurrentPanelRaw.DataSourceField);
                                    var CurrentForm = CurrentPanel.getForm();
                                    //Custom.FormDataErase();

                                    //mette valore predefinito di FOREIGN se è impostato WHERE di apertura della form
                                    /*
                                    if (CurrentPanelRaw.DataWhere != '') {
                                        var FieldName = CurrentPanelRaw.DataWhere.split("=")[0].trim();
                                        var FieldValue = CurrentPanelRaw.DataWhere.split("=")[1].trim();
                                        //var result = ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json,'datasource',FieldName,'Custom.AbbinaPropToCombo');
                                        var obj = getSubItemFromDataSourceField(CurrentPanelRaw.Json, FieldName);
                                        if (obj != undefined){
                                        var FieldID = CurrentForm.findField(obj.name);
                                        if (FieldID !== undefined) FieldID.setValue(FieldValue);
                                    */
                                    break;
                                case 'clone':
                                    console.log('duplica:' + CurrentPanelRaw.DataSourceField);
                                    //svuota ID
                                    var CurrentForm = CurrentPanel.getForm();
                                    var FieldID = CurrentForm.findField(CurrentPanelRaw.DataSourceField);
                                    if (FieldID !== undefined)
                                        FieldID.setValue('');
                                    break;
                                    CurrentPanelRaw.DataMode = 'edit';
                            }

                            //hidden in form sotto parametro
                            var result = ExecuteOnObjectPropertyExist(CurrentPanelRaw.Json, 'hiddenInFormExp', 'Custom.AbbinaPropToObjRendered(objparam, "hiddenInFormExp")');
                        }
                        else if ((this.storeId == "DS_" + CurrentPanelRaw.name + "_" + "Form00") && (CurrentPanelRaw.ViewType == 'pivot')) {
                            Custom.LayoutRenderExt();
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

                        //set dirty to false
                        if (CurrentPanel != undefined) {
                            CurrentPanel.getForm().getFields().each(function (field) {
                                field.resetOriginalValue();
                            });
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
        }
    }
}

Custom.ObjDestroyAllDataSource = function (PanelName) {
    var DS_Appo = Ext.data.StoreManager.items;
    var listOfStoreToDestroy = [];
    var ii = 0;
    console.log('ObjDestroyAllDataSource');

    //eseguo lista di distruzione e li distruggo dopo  altirmenti perdi id progressivo man mano li cancella
    for (var i = 0; i < DS_Appo.length; i++) {
        if (DS_Appo[i].storeId.indexOf(PanelName) > 0) {
            if (DS_Appo[i].storeId !== undefined) {
                console.log('DEstroyStore' + DS_Appo[i].storeId);
                listOfStoreToDestroy[ii] = DS_Appo[i].storeId;
                ii++;
            }
        }
    }

    for (var i = 0; i < ii; i++) {
        Ext.StoreMgr.lookup(listOfStoreToDestroy[i]).destroy();
    }
}
Custom.ObjAddDataSource = function (JsonObj, FormPanel) {
    CurrentPanelRaw.DataSources[CurrentPanelRaw.DataSources.length++] = {
        'id': 'defaultds',
        'name': 'defaultds',
        'url': 'includes/io/DataRead.php?onlydata=true' +
            '&layoutid=' + CurrentPanelRaw.id +
            '&objname=' + JsonObj.name +
            '&datawhere=' + CurrentPanelRaw.DataWhere,
        'schema_url': 'includes/io/DataRead.php?modeldef=true' +
            '&layoutid=' + CurrentPanelRaw.id +
            '&objname=' + JsonObj.name +
            '&datawhere=' + CurrentPanelRaw.DataWhere,
    };
}

//*************************************************************************************************************//
//                OGGETTI AUTOPOSTBACK (REFRESH VAR)
Custom.RefreshAllDataStore = function () {
    console.log('RefreshAllDataStore All');
    var result = ExecuteOnObjectPropertyExist(CurrentPanelRaw.Json, 'datasource', 'Custom.RefreshObjDataStore');
}
Custom.RefreshObjDataStore = function (obj) {
    console.log('RefreshObjDataStore ' + obj.name);
    if ((obj.name != LastObjUpdated) && (CurrentPanel)) {
        var CurrentForm = CurrentPanel.getForm();
        var objExt = CurrentForm.findField(obj.name);
        if (objExt != undefined) {
            console.log('RefreshObjDataStore CollegoStore ' + objExt.name);
            appo = objExt.getValue();
            //aggiorno il datasource di ogni controllo
            objExt.setDisabled(true);
            objExtStoreCurrent = objExt.store.currentPage;
            objExt.store.removeAll();
            objExt.store.reload({
                callback: function () {
                    var Appo = this.storeId.split('_');
                    var nomeobj = Appo[Appo.length - 1];
                    var CurrentForm = CurrentPanel.getForm();
                    var me = CurrentForm.findField(nomeobj)
                    if (LastObjUpdated != '') {
                        Custom.RefreshValidateField(nomeobj);
                    }
                    if (me) {
                        if (me.hasOwnProperty('xtype')) {
                            if (me.xtype == 'dynamicgrid') {
                                if (me.goToLastRow) me.getView().scrollBy(0, 999999, true);
                            }
                        }
                    }
                    //this.store.loadPage(objExtStoreCurrent);
                }
            });
            objExt.setDisabled(false);
        }
    }
}
Custom.RefreshValidateField = function (LastObjUpdated) {
    console.log('RefreshValidateField ' + LastObjUpdated);
    var CurrentForm = CurrentPanel.getForm();
    var appo = '';
    var trovato = '';
    appo = getSubItemFromName(CurrentPanelRaw.Json, LastObjUpdated);
    if (appo !== undefined) {
        var obj = CurrentForm.findField(appo.name);
        appo = obj.getValue();
    }

    //cerco il valore pre-esistente se esite nel nuovo datasource se nn esiste azzero il campo
    if ((appo != null) && (appo != '') && (appo !== undefined)) {
        trovato = Ext.StoreMgr.lookup("DS_" + CurrentPanelRaw.name + "_" + LastObjUpdated)
        if (trovato !== undefined) {
            trovato = trovato.findExact(obj.valueField, appo);
            if (trovato == -1) {
                console.log('RefreshValidateField Azzero');
                obj.setValue(null);
            } else {
                console.log('RefreshValidateField OK');
            }
        }
    }
}

//*************************************************************************************************************//
//                CHIAMATE ESTERNE
Custom.FileLoad = function (FileId, downloadable) {
    console.log('LoadExtFile');
    if (downloadable === undefined)
        downloadable = false;
    // Custom.openLinkInNewWindow('includes/io/CallFile.php?fileid=' + FileId + '&downloadable=' + downloadable);

    var link = document.createElement('a');
    link.href = 'includes/io/CallFile.php?fileid=' + FileId + '&downloadable=' + downloadable;
    link.download = 'download';
    link.click();

}
Custom.LinkOpen = function (LinkId) {
    console.log('LoadProcess');
    Custom.openLinkInNewWindow(LinkId, '', true);
}
Custom.Message = function (title, promptmsg, buttons, ontrue, onfalse) {
    Ext.Msg.confirm(
        title,
        promptmsg,
        function (btn) {
            if (btn === 'yes') {
                console.log('Message' + ontrue);
                Custom.ExecuteProc(ontrue, null, null);
            } else if (btn === 'no') {
                console.log('Message' + onfalse);
                Custom.ExecuteProc(onfalse, null, null);
            }
        },
        this
    );
}
Custom.MessageFilter = function (title, promptmsg, onFilter) {
    Ext.Msg.prompt(
        title,
        promptmsg,
        function (btnText, sInput) {
            if (btnText === 'ok') {
                console.log('Message' + ontrue);
                //DAFARE
                //sInput
                Custom.ExecuteProc(ontrue, null, null);
            }
        }, this);
}
Custom.MessageAsync = function (title, promptmsg) {
    if (window.Notification && Notification.permission !== 'denied') {
        Notification.requestPermission(function (status) { // status is 'granted', if accepted by user
            var n = new Notification(title, {
                body: promptmsg,
                //icon: '/path/to/icon.png' // optional
            });
        });
    }
}
Custom.SendObject = function (emailaddress) {

    if (emailaddress === undefined)
        emailaddress = '';
    //salva dati
    /* DAFARE  server email send
    i = CurrentCollectorOffLineAjax.length++;
    CurrentCollectorOffLineAjax[i] = CurrentProcRequestId;
    CurrentCollectorOffLineAjax[i] = CurrentPanelRaw.JsonFilter;
    Custom.SaveOffLineDataToServer(selectedRowDataString);
    var EmailWindow = Ext.create('Ext.window.Window', {
    title: 'Send Email',
    padding: '5 5 0 5',
    width: Ext.getBody().getViewSize().width - 300,
    height: Ext.getBody().getViewSize().height - 200,
    layout:{
    type: 'absolute', //vbox, hbox, auto, absolute
    align: 'stretch'
    },
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
    xtype: 'textfield',
    fieldLabel: 'Send To',
    fieldWidth: 60,
    msgTarget: 'side',
    allowBlank: false,
    x: 5,
    y: 40,
    name: 'to',
    anchor: '-5'
    }, {
    xtype: 'textfield',
    fieldLabel: 'Subject',
    fieldWidth: 60,
    x: 5,
    y: 80,
    name: 'subject',
    anchor: '-5'
    }, {
    x:5,
    y: 120,
    xtype: 'textarea',
    style: 'margin:0',
    hideLabel: true,
    name: 'msg',
    value: Custom.getURL() + '?' +    'RequestedUserId=' + CurrentUser.UserId +
    '&RequestedProcId=' + CurrentPanelRaw.ProcId +
    '&RequestedLayoutFilter=' + encodeURIComponent(Ext.util.JSON.encode(CurrentPanelRaw.JsonFilter).replace(/ /g,'')
    ),
    anchor: '-5 -5'
    }],
    listeners: {
    close: function () {
    //REMOVE STORE
    //var result = ExecuteOnObjectPropertyExist(this.definitionraw.Json,'datasource','Custom.ObjDestroyDataSource(CurrentPanelRaw.name,objparam)');
    //var me = this.down('form');
    //if (me.definitionraw != '') CurrentPanelRaw = clone(me.definitionraw);
    //var result = Custom.ObjDestroyAllDataSource(CurrentPanelRaw.name);
    CurrentPanel = undefined;
    CurrentWindow = undefined;
    CurrentToolBar  = undefined;
    this.destory;
    },
    }
    });

    EmailWindow.show();
     */

    var strLink = 'mailto:' + emailaddress + '?' +
        'subject=Suggestions' +
        '&body=' + 'RequestedUserId=' + CurrentUser.UserId
    /*
var strLink = 'http://office.net-system.it/groupoffice/?' +
    'r=email/message/mailto' +
    '&mailto=' + emailaddress +
    '&subject=Suggestions' +
    '&body=' + 'RequestedUserId=' + CurrentUser.UserId +
    '&RequestedProcId=' + CurrentPanelRaw.ProcId +
    '&RequestedLayoutFilter=' + encodeURIComponent(Ext.util.JSON.encode(CurrentPanelRaw.JsonFilter).replace(/ /g, ''));
    */
    Custom.LinkOpen(strLink, null, true);
}
Custom.Chat = function () {
    Tawk_API.toggle()
}
//*************************************************************************************************************//
//                FORM GESTIONE PROC
Custom.ExecuteProcRequest = function (ProcNameId, NoWait) {
    CurrentProcRequestId = ProcNameId;
    CurrentProcNoWait = NoWait;
};
Custom.ExecuteProc = function (ProcNameId, OverrideLayoutId, NoWait) {
    if ((NoWait === undefined) || (NoWait === ''))
        NoWait = false;
    if (ProcNameId == 'EDIT') {
        var CurrentForm = CurrentPanel.getForm();
        var CurrentObj = CurrentForm.findField(CurrentPanelRaw.DataSourceField);
        CurrentPanelRaw.DataSourceFieldValue = CurrentObj.getValue(CurrentPanelRaw.DataSourceField);
        Ext.Msg.show({
            title: 'Editor',
            msg: 'Open Designer:',
            minWidth: 300,
            minHeight: 200,
            closable: false,
            buttons: Ext.Msg.YESNOCANCEL,
            buttonText: {
                yes: 'REPORT',
                no: 'FORM',
                cancel: 'LABEL'
            },
            multiline: false,
            fn: function (buttonValue, inputText, showConfig) {
                if (buttonValue === 'no') {
                    Custom.FormEdit(CurrentPanelRaw.DataSourceFieldValue);
                }
                else if (buttonValue === 'yes') {
                    Custom.ReportEdit(CurrentPanelRaw.DataSourceFieldValue);
                }
                else if (buttonValue === 'cancel') {
                    Custom.LabelEdit(CurrentPanelRaw.DataSourceFieldValue);
                }
            },
            icon: Ext.Msg.QUESTION
        });
    }
    else if ((ProcNameId == '') || (ProcNameId == '0') || (ProcNameId === undefined) || (ProcNameId == null)) {
        return;
    }
    else {
        if (NoWait) {
            timeoutmax = 2400000;
            timeoutsync = true;
            Ext.toast('Procedura di lunga durata, il sistema ha preso in carico la richiesta, un messaggio verrà visualizzato al termine');
        } else {
            timeoutmax = 60000;
            timeoutsync = false;
        }
        Ext.Ajax.setTimeout(timeoutmax);
        Ext.Ajax.request({
            method: 'GET',
            type: 'ajax',
            async: timeoutsync,
            url: 'includes/io/CallProcess.php',
            params: {
                userid: CurrentUser.UserId,
                layoutid: ((OverrideLayoutId === undefined) ? CurrentPanelRaw.id : OverrideLayoutId),
                processid: ProcNameId
            },
            extraParams: {},
            success: function (response) {
                CurrentProcRequestId = 0;
                if (Custom.isJson(response.responseText)) {
                    var JsonAppo = Ext.util.JSON.decode(response.responseText)
                    var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + 'Form00');
                    if (JsonAppo.success) {
                        if (JsonAppo.commandlocal !== undefined) {
                            if (CurrentDeviceType == 'desktop') {
                                Custom.SendToWebSocket(JsonAppo.commandlocal, JsonAppo.commandip, JsonAppo.commandport, JsonAppo.commandprotocol);
                            } else {
                                window.location.href = "intent://" + JsonAppo.commandlocal + "#Intent;scheme=quickprinter;package=pe.diegoveloper.printerserverapp;end;";
                                //Custom.openLinkInNewWindow("quickprinter://"+TextAppo, 'LabelPrint',true);
                            }
                        }
                        if ((JsonAppo.usrsession !== undefined) && (JsonAppo.usrsession != '')) {
                            var ToolBarLabelSession = DesignToolBar.getComponent('ToolBarLabelSession');
                            //ToolBarLabelSession.setText(JsonAppo.usrsession);
                        }
                        if (JsonAppo.closeid) {
                            var InDipendentWindow = Ext.getCmp(CurrentPanelRaw.name + '_Window');
                            if (InDipendentWindow !== undefined) {
                                var AppoPanel = InDipendentWindow.getComponent(CurrentPanelRaw.name + '_Panel');
                                //InDipendentWindow.remove(AppoPanel);
                                //AppoPanel.destory;
                                InDipendentWindow.close();
                                InDipendentWindow.destory;
                            }
                        }
                        if (JsonAppo.requeryid) {
                            //reload self
                            var found = false;
                            var task = null;
                            if (CurrentToolBar != undefined) {
                                var ButtonRecRefreshBase = CurrentToolBar.getComponent('ButtonRecRefresh');
                                var task = new Ext.util.DelayedTask(function () {
                                    ButtonRecRefreshBase.fireEvent('click', ButtonRecRefreshBase);
                                });
                            }

                            // trova tutte i layout che nascono dallo stesso id e schiaccia il reload della form
                            Ext.WindowMgr.each(
                                function (win) {
                                    if (win.isVisible()) {
                                        var me = win.down('form');
                                        if (me !== null) {
                                            //if ((me.definitionraw != '') && (me.definitionraw.id == JsonAppo.requeryid)) {
                                            if ((me.definitionraw != '') && (JsonAppo.requeryid.split(';').includes(me.definitionraw.id))) {
                                                var myToolBar = win.getComponent('toolbarmenu');
                                                var ButtonRecRefresh = myToolBar.getComponent('ButtonRecRefresh');
                                                ButtonRecRefresh.fireEvent('click', ButtonRecRefresh);
                                                found = true;
                                            }
                                        }
                                    }
                                }
                            );
                            var centerView = MainViewPort.getComponent('centerViewPortId');
                            var DesignPanel = centerView.getComponent('DesignPanel');
                            if (found == false && (DesignPanel.definitionraw != '') && (JsonAppo.requeryid.split(';').includes(DesignPanel.definitionraw.id))) {
                                var myToolBar = CurrentWindow.getComponent('toolbarmenu');
                                var ButtonRecRefresh = myToolBar.getComponent('ButtonRecRefresh');
                                ButtonRecRefresh.fireEvent('click', ButtonRecRefresh);
                            };

                            if (task != null) {
                                task.delay(500);
                            }

                        }
                        if (JsonAppo.message != '') {
                            if (NoWait == false) {
                                //Ext.toast({message:JsonAppo.message, timeout: 2000});
                                Ext.toast({
                                    html: JsonAppo.message,
                                    title: 'Message',
                                    minWidth: 300,
                                    maxWidth: 1400,
                                    align: 't',
                                    hideDuration: 200,
                                    autoCloseDelay: 5000,
                                });
                            } else {
                                var messagebox = Ext.MessageBox.show({
                                    title: 'Message from Long Procedure ',
                                    msg: JsonAppo.message,
                                    icon: Ext.MessageBox.WARNING,
                                    maxWidth: 600,
                                    closable: false,
                                    alwaysOnTop: true,
                                    buttons: Ext.Msg.OK
                                });
                                Ext.Function.defer(function () {
                                    messagebox.zIndexManager.bringToFront(messagebox);
                                }, 100);
                            }
                        }
                        if (JsonAppo.type !== undefined) {
                            switch (JsonAppo.type) {
                                case 'layout':
                                    LastLayout = clone(CurrentPanelRaw);
                                    Custom.LayoutRender(JsonAppo.ctid, JsonAppo.viewtype, JsonAppo.datawhere, JsonAppo.datamode, JsonAppo.windowmode, JsonAppo.windowtitle);
                                    break;
                                case 'file':
                                    Custom.FileLoad(JsonAppo.ctid, JsonAppo.filedownload);
                                    break;
                                case 'link':
                                    Custom.LinkOpen(JsonAppo.ctid, null, true);
                                    break;
                                case 'logout':
                                    Custom.Logout();
                                    break;
                                case 'proc':
                                    Custom.ExecuteProc(JsonAppo.ctid, null, null);
                                    break;
                                case 'msgbox':
                                    Custom.Message(JsonAppo.title, JsonAppo.prompt, JsonAppo.buttons, JsonAppo.ontrue, JsonAppo.onfalse);
                                    break;
                            }
                            CurrentPanelRaw.ProcId = JsonAppo.id;
                            CurrentPanelRaw.DataWhere = JsonAppo.datawhere;
                            CurrentPanelRaw.DataMode = JsonAppo.datamode;
                        }
                        if (JsonAppo.recordstatus !== undefined) {
                            Ext.toast(JsonAppo.recordstatus);
                            if (JsonAppo.recordstatus == 'insert') {
                                CurrentPanelRaw.DataSourceFieldValue = JsonAppo[CurrentPanelRaw.DataSourceField];
                                CurrentPanelRaw.DataMode = 'edit';
                                DS_Form00.proxy.extraParams.datamode = CurrentPanelRaw.DataMode;
                                DS_Form00.proxy.extraParams.datawhere = CurrentPanelRaw.DataSourceField + '=' + CurrentPanelRaw.DataSourceFieldValue;
                            }
                        }
                        if (JsonAppo.clearForm !== undefined) {
                            Ext.each(CurrentPanel.getForm().getFields().items, function (objExt) {
                                if ((objExt.datasourcefield == '') || (objExt.datasourcefield == undefined)) {
                                    objExt.setValue('');
                                }
                            });
                        }
                        if ((DS_Form00 !== undefined) && (CurrentPanelRaw.DataMode != 'filter') && (CurrentPanelRaw.ViewType == 'form') && (CurrentPanelRaw.DataSourceType != 'NONE')) {
                            //DS_Form00.proxy.extraParams.datamode = 'edit';
                            CurrentPanelRaw.DataMode = 'edit';
                            if (response.request.params.processid != 'appotruncate') {
                                DS_Form00.reload();
                            }
                        }
                    } else {
                        if (JsonAppo.recordstatus !== undefined) {
                            Ext.toast(JsonAppo.recordstatus);
                            if (JsonAppo.recordstatus == 'insert') {
                                CurrentPanelRaw.DataSourceFieldValue = JsonAppo[CurrentPanelRaw.DataSourceField];
                                CurrentPanelRaw.DataMode = 'edit';
                                DS_Form00.proxy.extraParams.datamode = CurrentPanelRaw.DataMode;
                                DS_Form00.proxy.extraParams.datawhere = CurrentPanelRaw.DataSourceField + '=' + CurrentPanelRaw.DataSourceFieldValue;
                            }
                        }
                        if ((DS_Form00 !== undefined) && (CurrentPanelRaw.DataMode != 'filter') && (CurrentPanelRaw.ViewType == 'form') && (CurrentPanelRaw.DataSourceType != 'NONE')) {
                            //DS_Form00.proxy.extraParams.datamode = 'edit';
                            CurrentPanelRaw.DataMode = 'edit';
                            DS_Form00.reload();
                        }
                        Ext.MessageBox.show({
                            title: 'Error ExecuteProc',
                            msg: JsonAppo.message,
                            icon: Ext.MessageBox.ERROR,
                            minWidth: 300,
                            maxWidth: 1400,
                            closable: false,
                            animEl: 'elId',
                            alwaysOnTop: true,
                            buttons: Ext.Msg.OK
                        });
                        var x = Ext.getBody().getViewSize().width / 3;
                        var y = 0;
                        Ext.Msg.setXY([x, y], false);
                    }
                } else {
                    Ext.MessageBox.show({
                        title: 'Error ExecuteProc',
                        msg: 'Risposta del server inaspettata!!! ' + response.responseText,
                        icon: Ext.MessageBox.ERROR,
                        minWidth: 300,
                        maxWidth: 1400,
                        closable: false,
                        alwaysOnTop: true,
                        buttons: Ext.Msg.OK
                    });
                }
            },
            failure: function (response) {
                CurrentProcRequestId = 0;
                if (Custom.isJson(response.responseText)) {
                    Ext.MessageBox.show({
                        title: 'Error ExecuteProc',
                        msg: 'Risposta del server inaspettata!!! ' + response.responseText.message,
                        icon: Ext.MessageBox.ERROR,
                        minWidth: 300,
                        maxWidth: 1400,
                        closable: false,
                        alwaysOnTop: true,
                        buttons: Ext.Msg.OK
                    });
                } else {
                    Ext.MessageBox.show({
                        title: 'Error ExecuteProc',
                        msg: 'Risposta del server inaspettata!!! ' + response.responseText,
                        icon: Ext.MessageBox.ERROR,
                        minWidth: 300,
                        maxWidth: 1400,
                        closable: false,
                        alwaysOnTop: true,
                        buttons: Ext.Msg.OK
                    });
                }
            }
        });
    }
}
Custom.ToolBarProc = function (MyToolbar) {

    var MyTollBarAddOn = {};
    var MyTollBarAddOnCount = 0;

    Ext.Ajax.request({
        method: 'GET',
        type: 'ajax',
        async: false,
        url: 'includes/io/LayoutProc.php',
        params: {
            layoutid: CurrentPanelRaw.id
        },
        extraParams: {},
        success: function (response) {
            var JsonFormAppo = Ext.util.JSON.decode(response.responseText);
            if (JsonFormAppo.status = 'Success') {
                MyTollBarAddOnCount = JsonFormAppo.total;
                MyTollBarAddOn = JsonFormAppo.data;
            } else {
                Ext.MessageBox.show({
                    title: 'Error ToolBarProc Parse DataREAD' + JsonFormAppo.status,
                    msg: JsonFormAppo.message,
                    icon: Ext.MessageBox.ERROR,
                    minWidth: 300,
                    maxWidth: 1400,
                    closable: false,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            }
        },
        failure: function (response) {
            CurrentProcRequestId = 0;
            if (Custom.isJson(response.responseText)) {
                Ext.MessageBox.show({
                    title: 'Error ToolBar',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText.message,
                    icon: Ext.MessageBox.ERROR,
                    minWidth: 300,
                    maxWidth: 1400,
                    closable: false,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            } else {
                Ext.MessageBox.show({
                    title: 'Error ToolBar',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText,
                    icon: Ext.MessageBox.ERROR,
                    minWidth: 300,
                    maxWidth: 1400,
                    closable: false,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            }
        },
    });

    var MenuItem = {};
    var MenuChildItem = [];
    var MenuIconCLSLast = '';

    //view.down('toolbar').add({ text: 'user X' }); 

    //Pulisci  vecchio pulsanti aggiuntivi
    var toDelete = [];
    var toDeleteI = 0;
    Ext.each(MyToolbar.items.items, function (objExt) {
        if (objExt.hasOwnProperty('addedd')) {
            toDelete[toDeleteI] = objExt;
            toDeleteI++;
        }
    });
    for (i = 0; i < toDeleteI; i++) {
        MyToolbar.remove(toDelete[i]);
    }

    for (var i = 0; i < MyTollBarAddOnCount; i++) {
        if (MyTollBarAddOn[i].GROUP != true) {
            var Appo = {
                itemId: 'Button' + MyTollBarAddOn[i].ID,
                name: 'Button' + MyTollBarAddOn[i].ID,
                xtype: 'button',
                iconCls: MyTollBarAddOn[i].ICONCLS + ' toolBarIcon',
                tooltip: MyTollBarAddOn[i].DESCNAME + MyTollBarAddOn[i].TOOLTIP,
                processId: MyTollBarAddOn[i].CT_AAAPROC,
                addedd: 'true',
                scale: scaledim,
                listeners: {
                    click: function (btn, evt) {
                        var _self = this;
                        var me = btn.up('panel');
                        Custom.setCurrentPanelForm(me);
                        if (_self.procalert !== undefined) {
                            Ext.MessageBox.show({
                                title: 'Conferma Operazione ',
                                msg: 'Confermi ?',
                                buttons: Ext.MessageBox.OKCANCEL,
                                icon: Ext.MessageBox.WARNING,
                                minWidth: 300,
                                maxWidth: 1400,
                                closable: false,
                                alwaysOnTop: true,
                                fn: function (btnConfirm) {
                                    if (btnConfirm == 'ok') {
                                        Custom.ExecuteProcRequest(_self.processId);
                                        Custom.FormDataSave();
                                        return;
                                    } else {
                                        return;
                                    }
                                }
                            });
                        } else {
                            Custom.ExecuteProcRequest(_self.processId);
                            Custom.FormDataSave();
                        }
                    }
                }
            };
            MyToolbar.add(Appo);
        } else {
            var Appo = {
                itemId: 'Button' + MyTollBarAddOn[i].ID,
                name: 'Button' + MyTollBarAddOn[i].ID,
                xtype: 'button',
                text: MyTollBarAddOn[i].DESCNAME,
                tooltip: MyTollBarAddOn[i].TOOLTIP,
                processId: MyTollBarAddOn[i].CT_AAAPROC,
                dynamic: true,
                listeners: {
                    click: function (btn, evt) {
                        var _self = this;
                        var me = btn.up('panel');
                        Custom.setCurrentPanelForm(me);
                        if (_self.procalert !== undefined) {
                            Ext.MessageBox.show({
                                title: 'Conferma Operazione ',
                                msg: 'Confermi ?',
                                buttons: Ext.MessageBox.OKCANCEL,
                                icon: Ext.MessageBox.WARNING,
                                minWidth: 300,
                                maxWidth: 1400,
                                closable: false,
                                alwaysOnTop: true,
                                fn: function (btnConfirm) {
                                    if (btnConfirm == 'ok') {
                                        Custom.ExecuteProcRequest(_self.processId);
                                        Custom.FormDataSave();
                                        return;
                                    } else {
                                        return;
                                    }
                                }
                            });
                        } else {
                            Custom.ExecuteProcRequest(_self.processId);
                            Custom.FormDataSave();
                        }
                    }
                }
            };
            MenuChildItem.push(Appo);
        }
        if ((MyTollBarAddOn[i].ICONCLS != MyTollBarAddOn[i + 1].ICONCLS) && (MyTollBarAddOn[i].GROUP == true) && (count_obj(MenuChildItem) > 0)) {
            var MenuItem = {
                xtype: 'splitbutton',
                itemId: 'ButtonViewPrintPers' + MyTollBarAddOn[i].ID,
                name: 'ButtonViewPrintPers' + MyTollBarAddOn[i].ID,
                xtype: 'button',
                addedd: 'true',
                scale: scaledim,
                iconCls: MyTollBarAddOn[i].ICONCLS + ' toolBarIcon',
                menu: clone(MenuChildItem),
            };
            MyToolbar.add(MenuItem);
            MenuChildItem = [];
        }
    };
}

//*************************************************************************************************************//
//                RECORD FORM AZIONI
Custom.FormDataSave = function () {
    console.log('FormDataSave');
    var CurrentForm = CurrentPanel.getForm();

    // mette la riga scelta in view=CurrentForm
    switch (CurrentPanelRaw.ViewType) {
        case 'grid':
            //save grid layout
            var FormInGrid = CurrentPanel.getComponent('FormInGrid');
            AppoColumns = '';
            CurrentPanelRaw.override = FormInGrid.GetColumnWidthSplit();
            //if ((AppoColumns != '') && (AppoColumns !== undefined))
            //CurrentPanelRaw.columnWidthSplit = clone(AppoColumns); 
            Custom.LayoutSaveRun();

            //save records modified
            FormInGrid.SaveMassUpdate();

            //reload record in form (disattivano per gestione colonne layout) altrimenti apre una form vuota
            //Custom.LayoutRender(CurrentPanelRaw.id);
            //Custom.FormDataLoadRecord('=');
            break;
        case 'pivot':
            //save pivot layout
            var pivotgrid = CurrentPanel.getComponent('PivotGrid1');
            var pivotgridmatrix = pivotgrid.getConfig().matrix;

            CurrentPanelRaw.DataSourceAggregate = [];
            CurrentPanelRaw.DataSourceLeftAxis = [];
            CurrentPanelRaw.DataSourceTopAxis = [];

            var defAxis = pivotgridmatrix.aggregate.items;
            for (var i = 0; i < defAxis.length; i++) {
                var appo = {};
                for (var key in defAxis[i]) {
                    if (typeof defAxis[i][key] === 'string' || defAxis[i][key] instanceof String) {
                        if ((defAxis[i][key] != '') && (key != 'id') && (key != '$className')) {
                            appo[key] = defAxis[i][key];
                            console.log(key + ' aggregate -> ' + defAxis[i][key]);
                        }
                    }
                }
                CurrentPanelRaw.DataSourceAggregate.push(appo);
            }

            var defAxis = pivotgridmatrix.leftAxis.dimensions.items;
            for (var i = 0; i < defAxis.length; i++) {
                var appo = {};
                for (var key in defAxis[i]) {
                    if (typeof defAxis[i][key] === 'string' || defAxis[i][key] instanceof String) {
                        if ((defAxis[i][key] != '') && (key != 'id') && (key != '$className')) {
                            appo[key] = defAxis[i][key];
                            console.log(key + ' aggregate -> ' + defAxis[i][key]);
                        }
                    }
                }
                CurrentPanelRaw.DataSourceLeftAxis.push(appo);
            }

            var defAxis = pivotgridmatrix.topAxis.dimensions.items;
            for (var i = 0; i < defAxis.length; i++) {
                var appo = {};
                for (var key in defAxis[i]) {
                    if (typeof defAxis[i][key] === 'string' || defAxis[i][key] instanceof String) {
                        if ((defAxis[i][key] != '') && (key != 'id') && (key != '$className')) {
                            appo[key] = defAxis[i][key];
                            console.log(key + ' aggregate -> ' + defAxis[i][key]);
                        }
                    }
                }
                CurrentPanelRaw.DataSourceTopAxis.push(appo);
            }

            CurrentPanelRaw.DataSourceAggregate = Ext.util.JSON.encode(CurrentPanelRaw.DataSourceAggregate);
            CurrentPanelRaw.DataSourceLeftAxis = Ext.util.JSON.encode(CurrentPanelRaw.DataSourceLeftAxis);
            CurrentPanelRaw.DataSourceTopAxis = Ext.util.JSON.encode(CurrentPanelRaw.DataSourceTopAxis);

            Custom.LayoutSaveRun();
            break;
        case 'pivot3d':
            //save pivot layout
            var pivotgrid = CurrentPanel.getComponent('PivotGrid3D1');
            var pivotgridmatrix = pivotgrid.getConfig().matrix;

            CurrentPanelRaw.DataSourceAggregate = [];
            CurrentPanelRaw.DataSourceLeftAxis = [];
            CurrentPanelRaw.DataSourceTopAxis = [];

            var defAxis = pivotgridmatrix.aggregate.items;
            for (var i = 0; i < defAxis.length; i++) {
                var appo = {};
                for (var key in defAxis[i]) {
                    if (typeof defAxis[i][key] === 'string' || defAxis[i][key] instanceof String) {
                        if ((defAxis[i][key] != '') && (key != 'id') && (key != '$className')) {
                            appo[key] = defAxis[i][key];
                            console.log(key + ' aggregate -> ' + defAxis[i][key]);
                        }
                    }
                }
                CurrentPanelRaw.DataSourceAggregate.push(appo);
            }

            var defAxis = pivotgridmatrix.leftAxis.dimensions.items;
            for (var i = 0; i < defAxis.length; i++) {
                var appo = {};
                for (var key in defAxis[i]) {
                    if (typeof defAxis[i][key] === 'string' || defAxis[i][key] instanceof String) {
                        if ((defAxis[i][key] != '') && (key != 'id') && (key != '$className')) {
                            appo[key] = defAxis[i][key];
                            console.log(key + ' aggregate -> ' + defAxis[i][key]);
                        }
                    }
                }
                CurrentPanelRaw.DataSourceLeftAxis.push(appo);
            }

            var defAxis = pivotgridmatrix.topAxis.dimensions.items;
            for (var i = 0; i < defAxis.length; i++) {
                var appo = {};
                for (var key in defAxis[i]) {
                    if (typeof defAxis[i][key] === 'string' || defAxis[i][key] instanceof String) {
                        if ((defAxis[i][key] != '') && (key != 'id') && (key != '$className')) {
                            appo[key] = defAxis[i][key];
                            console.log(key + ' aggregate -> ' + defAxis[i][key]);
                        }
                    }
                }
                CurrentPanelRaw.DataSourceTopAxis.push(appo);
            }

            CurrentPanelRaw.DataSourceAggregate = Ext.util.JSON.encode(CurrentPanelRaw.DataSourceAggregate);
            CurrentPanelRaw.DataSourceLeftAxis = Ext.util.JSON.encode(CurrentPanelRaw.DataSourceLeftAxis);
            CurrentPanelRaw.DataSourceTopAxis = Ext.util.JSON.encode(CurrentPanelRaw.DataSourceTopAxis);

            Custom.LayoutSaveRun();
            break;
        case 'form':
            /* validation form
                if (CurrentPanelRaw.RequireValidation) {
                console.log('FormValidateRequireData');
                Custom.FormIsValid();
                if (CurrentForm.isValid() == false && CurrentPanelRaw.Valid == false) {
                return
                }
                }
             */
            //      Ext.getBody().mask('Wait, executing for every selected row ..');
            //        Ext.Function.defer(function () {

            //salvo il processo richiesto
            var PreserveCurrentProcRequestId = CurrentProcRequestId;

            //salva anche i dati dalle dynamicgrid nella form con il checkcolumn attivo 
            //questo permette di eseguire un botton quindi una operazione sui dati nelle griglie della form  
            //esegue il post e l'esecuzione del processo dietro ad ogni riga "grid.action"
            var result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicgrid', 'Custom.GridSaveRow');

            //salva dati form
            CurrentProcRequestId = PreserveCurrentProcRequestId;
            Custom.SaveOnLineData();

            //           Ext.getBody().unmask();
            //      }, 10);
            break;
    }
}
Custom.FormDataLoadRecord = function (Comando) {
    var ParentObj = Ext.getCmp(CurrentPanelRaw.ParentObj);
    var NameChiave = ParentObj.keyField;
    var ParentObjCurRow = ParentObj.getSelectionModel().getSelection()[0];
    var ParentObjCurRowID = ParentObjCurRow.data[NameChiave];
    var ParentObjStoreCurRec = ParentObj.store.indexOf(ParentObjCurRow);

    var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + 'Form00');
    CurrentPanelRaw.RowLimit = 1
    console.log('FormDataLoadRecord' + Comando);

    if (Comando == '=') {
        CurrentPanelRaw.RowId = 0;

        DS_Form00.on('load', function () {

            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'combobox', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamiccombo', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamictreecombo', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'kpibar3d', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicwmsgmap', 'Custom.AbbinaWhereToRenderedCombo(objparam)');

            //this.clearListeners();
            Custom.RefreshAllDataStore();
        });
        DS_Form00.on('load', function () {
            Custom.RefreshAllDataStore();
        });
        DS_Form00.load({
            params: {
                start: CurrentPanelRaw.RowId,
                limit: CurrentPanelRaw.RowLimit,
                datawhere: Ext.util.JSON.encode(CurrentPanelRaw.JsonFilter),
                datamode: CurrentPanelRaw.DataMode
            }
        });
    }
    else if (Comando == '*') {

        Custom.FormDataErase();
    }
    else if ((Comando == '>') && (ParentObjCurRow)) {
        var ParentObjStoreNewRow = ParentObj.store.getAt(ParentObj.store.count() - 1);
        ParentObj.getView().getSelectionModel().select(ParentObj.store.count() - 1);

        ValRiga = ParentObjStoreNewRow.data[NameChiave];
        if (Custom.isNumber(ValRiga) == true) {
            appowhere = NameChiave + '=' + ValRiga;
        } else {
            appowhere = NameChiave + "='" + ValRiga + "'";
        }

        DS_Form00.on('load', function () {

            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'combobox', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamiccombo', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamictreecombo', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'kpibar3d', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicwmsgmap', 'Custom.AbbinaWhereToRenderedCombo(objparam)');

            //this.clearListeners();
            Custom.RefreshAllDataStore();
        });
        DS_Form00.on('load', function () {
            Custom.RefreshAllDataStore();
        });
        DS_Form00.load({
            params: {
                start: CurrentPanelRaw.RowId,
                limit: CurrentPanelRaw.RowLimit,
                datawhere: appowhere,
                datamode: CurrentPanelRaw.DataMode
            }
        });
    }
    else if ((Comando == '<') && (ParentObjCurRow)) {
        var ParentObjStoreNewRow = ParentObj.store.getAt(0);
        ParentObj.getView().getSelectionModel().select(0);

        ValRiga = ParentObjStoreNewRow.data[NameChiave];
        if (Custom.isNumber(ValRiga) == true) {
            appowhere = NameChiave + '=' + ValRiga;
        } else {
            appowhere = NameChiave + "='" + ValRiga + "'";
        }

        DS_Form00.on('load', function () {

            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'combobox', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamiccombo', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamictreecombo', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'kpibar3d', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
            result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicwmsgmap', 'Custom.AbbinaWhereToRenderedCombo(objparam)');

            //this.clearListeners();
            Custom.RefreshAllDataStore();
        });
        DS_Form00.on('load', function () {
            Custom.RefreshAllDataStore();
        });
        DS_Form00.load({
            params: {
                start: CurrentPanelRaw.RowId,
                limit: CurrentPanelRaw.RowLimit,
                datawhere: appowhere,
                datamode: CurrentPanelRaw.DataMode
            }
        });
    }
    else if ((Comando == '+') && (ParentObjCurRow)) {
        if (ParentObjStoreCurRec < ParentObj.store.count() - 1) {
            var ParentObjStoreNewRow = ParentObj.store.getAt(ParentObjStoreCurRec + 1);
            ParentObj.getView().getSelectionModel().select(ParentObjStoreCurRec + 1);

            ValRiga = ParentObjStoreNewRow.data[NameChiave];
            if (Custom.isNumber(ValRiga) == true) {
                appowhere = NameChiave + '=' + ValRiga;
            } else {
                appowhere = NameChiave + "='" + ValRiga + "'";
            }

            DS_Form00.on('load', function () {

                result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'combobox', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
                result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamiccombo', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
                result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamictreecombo', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
                result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'kpibar3d', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
                result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicwmsgmap', 'Custom.AbbinaWhereToRenderedCombo(objparam)');

                //this.clearListeners();
                Custom.RefreshAllDataStore();
            });
            DS_Form00.load({
                params: {
                    start: CurrentPanelRaw.RowId,
                    limit: CurrentPanelRaw.RowLimit,
                    datawhere: appowhere,
                    datamode: CurrentPanelRaw.DataMode
                }
            });
        }
    }
    else if ((Comando == '-') && (ParentObjCurRow)) {
        if (ParentObjStoreCurRec > 0) {
            var ParentObjStoreNewRow = ParentObj.store.getAt(ParentObjStoreCurRec - 1);
            ParentObj.getView().getSelectionModel().select(ParentObjStoreCurRec - 1);

            ValRiga = ParentObjStoreNewRow.data[NameChiave];
            if (Custom.isNumber(ValRiga) == true) {
                appowhere = NameChiave + '=' + ValRiga;
            } else {
                appowhere = NameChiave + "='" + ValRiga + "'";
            }

            DS_Form00.on('load', function () {

                result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'combobox', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
                result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamiccombo', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
                result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamictreecombo', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
                result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'kpibar3d', 'Custom.AbbinaWhereToRenderedCombo(objparam)');
                result = new ExecuteOnObjectPropertyValue(CurrentPanelRaw.Json, 'xtype', 'dynamicwmsgmap', 'Custom.AbbinaWhereToRenderedCombo(objparam)');

                //this.clearListeners();
                Custom.RefreshAllDataStore();
            });
            DS_Form00.load({
                params: {
                    start: CurrentPanelRaw.RowId,
                    limit: CurrentPanelRaw.RowLimit,
                    datawhere: appowhere,
                    datamode: CurrentPanelRaw.DataMode
                }
            });
        }
    }

    CurrentPanel.definitionraw.RowId = CurrentPanelRaw.RowId;
    CurrentPanel.definitionraw.RowLimit = CurrentPanelRaw.RowLimit;
    CurrentPanel.definitionraw.JsonFilter = CurrentPanelRaw.JsonFilter;

}

Custom.FormDataErase = function () {
    var CurrentForm = CurrentPanel.getForm();
    CurrentForm.reset();
    var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + 'Form00');
    DS_Form00.loadData([], false);

    Ext.each(CurrentForm.getFields().items, function (objExt) {
        objExt.setValue('');
        if ((objExt.xtype == 'combobox') || (objExt.xtype == 'dynamiccombo') || (objExt.xtype == 'dynamictreecombo')) {
            var objExtStore = objExt.getStore();
            objExtStore.removeAll();
            objExtStore.proxy.extraParams.datawhere = '';
            objExtStore.load();
        }
    });
}
Custom.FormSetFind = function () {
    /*DA FARE*/
}
//*************************************************************************************************************//
//                RECORD ONLINE SALVATAGGI
Custom.SaveOnLineData = function () {
    var CurrentForm = CurrentPanel.getForm();

    //collezione i dati della maschera
    var selectedRowDataString = '';
    selectedRowDataString += 'layoutid' + '=' + CurrentPanelRaw.id + '&';
    selectedRowDataString += 'userid' + '=' + CurrentUser.UserId + '&';
    selectedRowDataString += 'objid' + '=' + CurrentObjectRequestId + '&';

    //find readonly field
    var CurrentObjectFields = '';
    CurrentPanel.getForm().getFields().each(function (objExt) {
        if (objExt.readOnly) {
            CurrentObjectFields += objExt.name + ';';
        }
    });

    selectedRowDataString += 'readonlyfields' + '=' + CurrentObjectFields + '&';

    //if(!CurrentForm.isValid() && CurrentProcRequestId == 'DELETE') {
    //    Custom.resetInvalidFields(CurrentForm);
    //}

    if (CurrentForm.isValid() || (CurrentProcRequestId == 'DELETE')) {
        /* METODO collect field value 
        var selectedRowDataArray = [];
        CurrentPanel.getForm().getFields().each(function (objExt) {
            var valuetowrite = objExt.getSubmitValue();
            if (valuetowrite == null) valuetowrite = objExt.emptyText;

            if ((objExt.readOnly) && (valuetowrite == null)) {
                //non postare
            }else{
                if (toType(valuetowrite) == 'date') {
                    var curr_day = valuetowrite.getDate()
                    var curr_month = valuetowrite.getMonth() + 1; //Months are zero based
                    var curr_year = valuetowrite.getFullYear();
                    if (curr_day < 10) curr_day = '0' + curr_day;
                    if (curr_month < 10) curr_month = '0' + curr_month;
                    valuetowrite = curr_year + '-' + curr_month + '-' + curr_day;
                }
                selectedRowDataArray[objExt.name] = valuetowrite;
                selectedRowDataString += objExt.name + '=' + valuetowrite + '&';
            }
        });
        Ext.Ajax.request({
                params: selectedRowDataString,
                url: 'includes/io/DataWrite.php',
                method: 'POST',
                async: false,
                waitTitle: 'Connecting',
                waitMsg: 'Invio dati...',
                success: function (resp) {
                    var JsonAppo = Ext.util.JSON.decode(resp.responseText)
                    if (JsonAppo.success) {
                        CurrentPanelRaw.LayoutDataSave = true;
                        //set dirty to false
                        CurrentPanel.getForm().getFields().each(function (field) {
                            field.resetOriginalValue();
                        });
                        Custom.ExecuteProc(CurrentProcRequestId);
                    } else {
                        Ext.MessageBox.show({
                            title : 'Error SaveOnLineData Server Not Responding!! Retry Later ...',
                            msg : 'Failed' + JsonAppo.message ? JsonAppo.message : 'No response',
                            icon : Ext.MessageBox.ERROR,
                                closable: false,
                            buttons : Ext.Msg.OK
                        });
                        CurrentPanelRaw.LayoutDataSave = false;
                    }
                },
                failure: function (resp) {
                    CurrentPanelRaw.LayoutDataSave = false;
                    var JsonAppo = Ext.util.JSON.decode(resp.responseText)
                    Ext.MessageBox.show({
                        title : 'Error SaveOnLineData Server Not Responding!! Retry Later ...',
                        msg : 'Failed' + JsonAppo.message ? JsonAppo.message : 'No response',
                        icon : Ext.MessageBox.ERROR,
                                closable: false,
                        buttons : Ext.Msg.OK
                        });
                    return;
                }
            });
            */
        /* METODO DIRETTO */

        CurrentForm.submit({
            method: 'POST',
            params: selectedRowDataString,
            url: 'includes/io/DataWrite.php',
            timeout: 60000,
            async: false,
            waitTitle: 'Connecting',
            waitMsg: 'Sending...',
            success: function (form, action) {
                //if (typeof action.response !== "undefined"){
                //    return;
                //}
                var JsonAppo = Ext.util.JSON.decode(action.response.responseText)
                if (JsonAppo.success) {
                    CurrentPanelRaw.LayoutDataSave = true;
                    //set dirty to false
                    CurrentPanel.getForm().getFields().each(function (field) {
                        field.resetOriginalValue();
                    });
                    Custom.ExecuteProc(CurrentProcRequestId, null, CurrentProcNoWait);
                } else {
                    Ext.MessageBox.show({
                        title: 'Error SaveOnLineData Server Not Responding!! Retry Later ...',
                        msg: 'Failed' + action.result ? action.result.message : 'No response',
                        icon: Ext.MessageBox.ERROR,
                        minWidth: 300,
                        maxWidth: 1400,
                        closable: false,
                        alwaysOnTop: true,
                        buttons: Ext.Msg.OK
                    });
                    CurrentPanelRaw.LayoutDataSave = false;
                }
            },
            failure: function (form, action) {
                CurrentPanelRaw.LayoutDataSave = false;
                var JsonAppo = Ext.util.JSON.decode(action.response.responseText)
                Ext.MessageBox.show({
                    title: 'Error SaveOnLineData Server Not Responding!! Retry Later ...',
                    msg: 'Failed' + action.result ? action.result.message : 'No response',
                    icon: Ext.MessageBox.ERROR,
                    minWidth: 300,
                    maxWidth: 1400,
                    closable: false,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
                return;
            }
        });
    }
    else { // display error alert if the data is invalid
        Ext.Msg.alert('Invalid Data', 'Dati non corretti nella form');
        return;
    }
}
Custom.FormSaveVar = function (key, value, SaveLayoutId) {
    console.log('FormSaveVar');

    if (toType(value) == 'date') {
        value = Custom.yyyymmdd(value);
    }
    if ((SaveLayoutId === undefined) || (SaveLayoutId === ''))
        SaveLayoutId = CurrentPanelRaw.id;

    Ext.Ajax.request({
        method: 'POST',
        async: false,
        url: 'includes/io/DataWrite.php?' + key + '=' + value,
        params: {
            userid: CurrentUser.UserId,
            layoutid: SaveLayoutId,
        },
        extraParams: {},
        timeout: 60000,
        async: false,
        success: function (response) {
            var JsonAppo = Ext.util.JSON.decode(response.responseText);
            if (JsonAppo.success) {
                LastObjUpdated = key;
            } else {
                Ext.MessageBox.show({
                    title: 'Error FormSaveVar Server Not Responding!! Retry Later ...',
                    msg: 'Failed' + action.result ? action.result.message : 'No response',
                    icon: Ext.MessageBox.ERROR,
                    minWidth: 300,
                    maxWidth: 1400,
                    closable: false,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            }
        },
        failure: function (response) {
            if (Custom.isJson(response.responseText)) {
                Ext.MessageBox.show({
                    title: 'Error FormSaveVar',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText.message,
                    icon: Ext.MessageBox.ERROR,
                    minWidth: 300,
                    maxWidth: 1400,
                    closable: false,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            } else {
                Ext.MessageBox.show({
                    title: 'Error FormSaveVar',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText,
                    icon: Ext.MessageBox.ERROR,
                    minWidth: 300,
                    maxWidth: 1400,
                    closable: false,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            }
        },
    });
}

//*************************************************************************************************************//
//                RECORD OFFLINE SALVATAGGI                        FUTURO NN USATO
Custom.SaveOffLineDataToServer = function () {
    // OFFLINE TO ONLINE
    for (i = 0; i <= CurrentCollectorOffLineAjax.length; i++) {
        Ext.Ajax.request({
            method: 'POST',
            params: CurrentCollectorOffLineAjax[i],
            url: 'includes/io/DataWrite.php',
            timeout: 60000,
            async: false,
            success: function (response) {
                var JsonAppo = Ext.util.JSON.decode(response.responseText);
                if (JsonAppo.success) {
                    CurrentPanelRaw.LayoutDataSave = true;
                    Custom.ExecuteProcRequest(CurrentCollectorOffLineProc[i]);
                } else {
                    Ext.MessageBox.show({
                        title: "Error SaveOffline Server Not Responding!! Retry Later ...",
                        msg: 'Failed' + action.result ? action.result.message : 'No response',
                        icon: Ext.MessageBox.ERROR,
                        minWidth: 300,
                        maxWidth: 1400,
                        closable: false,
                        alwaysOnTop: true,
                        buttons: Ext.Msg.OK
                    });
                    CurrentPanelRaw.LayoutDataSave = false;
                }
            },
            failure: function (response) {
                if (Custom.isJson(response.responseText)) {
                    Ext.MessageBox.show({
                        title: 'Error SaveOffline',
                        msg: 'Risposta del server inaspettata!!! ' + response.responseText.message,
                        icon: Ext.MessageBox.ERROR,
                        minWidth: 300,
                        maxWidth: 1400,
                        closable: false,
                        alwaysOnTop: true,
                        buttons: Ext.Msg.OK
                    });
                } else {
                    Ext.MessageBox.show({
                        title: 'Error SaveOffline',
                        msg: 'Risposta del server inaspettata!!! ' + response.responseText,
                        icon: Ext.MessageBox.ERROR,
                        minWidth: 300,
                        maxWidth: 1400,
                        closable: false,
                        alwaysOnTop: true,
                        buttons: Ext.Msg.OK
                    });
                }
            },
        });
    }
    if (CurrentPanelRaw.LayoutDataSave == true) {
        CurrentCollectorOffLineAjax = [];
        CurrentCollectorOffLineProc = [];
    }
}

//*************************************************************************************************************//
//                 STORE CACHE                                     FUTURO NN USATO
Ext.define('App.data.proxy.CachingAjax', {
    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.cachingajax',

    // use session storage, but can be configured to localStorage too
    storage: window.sessionStorage,

    // @Override
    doRequest: function (operation, callback, scope) {
        var cachedResponse = this.getItemFromCache(this.url);
        if (!cachedResponse) {
            this.callParent(arguments);
        } else {
            console.log('Got cached data for: ' + this.url);
            this.processResponse(true, operation, null, cachedResponse,
                callback, scope, true);
        }
    },

    // @Override
    processResponse: function (success, operation, request, response,
        callback, scope, isCached) {
        if (success === true && !isCached) {
            this.putItemInCache(this.url, response.responseText);
        }
        this.callParent(arguments);
    },

    /**
     * @private
     * Returns the data from the cache for the specified key
     * @param {String} the url
     * @return {String} the cached url response, or null if not in cache
     */
    getItemFromCache: function (key) {
        return this.storage ? this.storage.getItem(key) : null;
    },

    /**
     * @private
     * Puts an entry in the cache.
     * Removes a third of the entries if the cache is full.
     * @param {String} the url
     * @param {String} the data
     */
    putItemInCache: function (key, value) {
        if (!this.storage)
            return;
        try {
            this.storage.setItem(key, value);
        } catch (e) {
            // this might happen if the storage is full.
            // Remove a third of the items and retry.
            // If it fails again, disable the cache quietly.
            console.log('Error putting data in cache. CacheSize: ' + this.storage.length +
                ', ErrorCode: ' + e.code + ', Message: ' + e.name);
            while (this.storage.length != 0) {
                var toRemove = this.storage.length / 3;
                for (var i = 0; i < toRemove; i++) {
                    var item = this.storage.key(0);
                    if (item)
                        this.storage.removeItem(item);
                    else
                        break;
                }
                console.log('Removed one-third of the cache. Cache size is now: ' + this.storage.length);
                try {
                    this.storage.setItem(key, value);
                    break;
                } catch (e) {
                    console.log('Error putting data in cache again. CacheSize: ' + this.storage.length +
                        ', ErrorCode: ' + e.code + ', Message: ' + e.name);
                }
            }
            if (this.storage.length == 0) {
                console.log('Cache disabled');
                this.storage = null;
            }
        }
    }
});

(function () {
    // Key is the url, value is the response from the AJAX request
    var requestCache = {};
    /**
     * A proxy that caches GET requests.
     */
    Ext.define('Common.proxy.CachingRestProxy', {
        extend: 'Ext.data.proxy.Rest',
        alias: 'proxy.cachingrest',

        statics: {
            clearCache: function () {
                requestCache = {};
            }
        },

        createCacheKeyFromRequest: function (request) {
            var url = request.getUrl();
            var questionMarkIndex = url.indexOf('?');
            var queryString = '';
            // Don't want to include the cache buster in the cacheKey
            if (questionMarkIndex > -1) {
                queryString = url.substring(questionMarkIndex);
            }
            url = url.substring(0, questionMarkIndex);
            var queryStringObj = Ext.Object.fromQueryString(queryString);
            delete queryStringObj[this.cacheString];
            var params = Ext.apply(queryStringObj, request.getParams());
            return url + JSON.stringify(params);
        },

        // Overridden to use GET requests from the cache if available
        sendRequest: function (request) {
            // The cacheKey is just a non readable string that includes all the data that makes up a unique rest call,
            // including the url and the param keys and values.
            var cacheKey = this.createCacheKeyFromRequest(request);
            var cachedResponse = requestCache[cacheKey];
            if (cachedResponse) {
                this.processResponse(true, request.getOperation(), request, cachedResponse);
                return request;
            } else {
                return this.callParent([request]);
            }
        },

        // Overridden to cache GET responses
        processResponse: function (success, operation, request, response) {
            this.callParent(arguments);
            if (success && this.getMethod(request).toUpperCase() == 'GET') {
                requestCache[this.createCacheKeyFromRequest(request)] = response;
            }
        }
    });
})();

//*************************************************************************************************************//
//                HISTORY                                             IN MODALITA TABLET PHONE
function onAfterRenderDesignPanel() {
    if ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone')) {
        Ext.History.on('change', function (token) {
            if (CurrentPanelRaw.id + ':' + CurrentPanelRaw.ViewType != token) {
                console.log('LoadHistory:' + token);
                parts = token.split(":");
                //    if (parts[0] != '') Custom.LayoutRender(parts[0],parts[1],parts[2],parts[3],parts[4],parts[5]);
            }
        });
    }
}

//*************************************************************************************************************//
//                GEOLOCATE
Custom.GeoLocate = function () {
    var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(success, error, options);

    function success(pos) {
        var crd = pos.coords;

        console.log('Your current position is:');
        console.log(`Latitude : ${crd.latitude}`);
        console.log(`Longitude: ${crd.longitude}`);
        console.log(`More or less ${crd.accuracy} meters.`);
    };

    function error(err) {
        console.log(`ERROR(${err.code}): ${err.message}`);
    };

}

//*************************************************************************************************************//
//                PONTO FUNCTION                                      IN MODALITA APP
function ExecuteMenuItem() {
    this.show = function (params) {
        Custom.ExecuteMenuIem(params.text);
    };
    this.SetCurrentNFC = function (params) {
        CurrentNFC = params.text;
    };
}

//*************************************************************************************************************//
//                LOGIN
Custom.StartLogin = function () {
    /*
    var DataSourceDBNameStore = Ext.create('Ext.data.Store', {
        fields: [],
        autoLoad: true,
        proxy: {
            type: 'ajax',
            url: 'includes/io/dictionarydbname.php',
            reader: {
                type: 'json',
                rootProperty: 'data',
                totalProperty: 'total',
                successProperty: 'success',
                messageProperty: 'message',
            }
        }
    });
    DataSourceDBNameStore.sort();
    */

    var LoginPanel = Ext.create('Ext.form.Panel', {
        id: 'LoginPanel',
        name: 'LoginPanel',
        url: 'includes/io/Login.php',
        bodyStyle: 'background-color:transparent',
        waitTitle: 'Connecting...',
        waitMsg: 'Connecting...',
        padding: '5 5 0 5',
        items: [{
            xtype: 'box',
            autoEl: {
                tag: 'a',
                target: 'netsystem',
                href: 'http://www.net-system.it',
                html: '<span style="color: 006ba5;">ExtJS</span><span style="color: white;"><strong>Dev</strong></span>'
            },
            style: 'font-size: 20px; text-decoration:none; font-family: sans-serif, helvetica, "aria white"',
            x: 320,
            y: 8
        }, {
            xtype: 'label',
            style: 'color: #ffffff; font-weight: bold; font-size: 20px; float: left; margin: 10px 0;',
            padding: '5 5 5 5',
            text: 'LogIn',
            name: 'login-lable',
            id: 'login-lable',
            autoHeight: true
        }, {
            xtype: 'textfield',
            fieldLabel: 'Username',
            //style: 'color: #ffffff; font-weight: bold; font-size: 11px',
            style: 'margin-top: 30px;',
            fieldStyle: 'color: #000; font-weight: bold; font-size: 11px;',
            labelStyle: 'color: #fff; font-weight: bold; font-size: 11px;',
            name: 'username',
            allowBlank: false,
            autoHeight: true,
            autoShow: true,
            listeners: {
                afterrender: function () {
                    this.inputEl.set({
                        autocomplete: 'on'
                    });
                    this.setValue(this.defaultValue);
                },
                specialkey: function (field, e) {
                    if (e.getKey() == e.ENTER) {
                        var saveBtn = field.up('form').down('button#LoginBtn');
                        saveBtn.fireEvent('click', saveBtn);
                        saveBtn.handler.call(this.scope || this, this);
                    }
                }
            }
        }, {
            xtype: 'textfield',
            fieldLabel: 'Password',
            fieldStyle: 'color: #000; font-weight: bold; font-size: 11px;',
            labelStyle: 'color: #fff; font-weight: bold; font-size: 11px;',
            name: 'password',
            inputType: 'password',
            allowBlank: false,
            autoHeight: true,
            autoShow: true,
            listeners: {
                afterrender: function () {
                    this.inputEl.set({
                        autocomplete: 'on'
                    });
                    this.setValue(this.defaultValue);
                },
                specialkey: function (field, e) {
                    if (e.getKey() == e.ENTER) {
                        var saveBtn = field.up('form').down('button#LoginBtn');
                        saveBtn.fireEvent('click', saveBtn);
                        saveBtn.handler.call(this.scope || this, this);
                    }
                }
            }
        }, {
            xtype: 'textfield',
            fieldLabel: 'DBNAME',
            fieldStyle: 'color: #000; font-weight: bold; font-size: 11px;',
            labelStyle: 'color: #fff; font-weight: bold; font-size: 11px;',
            name: 'dbname',
            emptyText: '' + window.location.hostname.split('.')[0],
            autoHeight: true,
            listeners: {
                afterrender: function () {
                    this.inputEl.set({
                        autocomplete: 'on'
                    });
                    this.setValue(this.defaultValue);
                },
                specialkey: function (field, e) {
                    if (e.getKey() == e.ENTER) {
                        this.onLoginButton();
                    }
                }
            }
        }],
        buttons: [{
            text: 'Login',
            name: 'LoginBtn',
            id: 'LoginBtn',
            handler: function (btn, evt) {
                var form = this.up('form'); // get the form panel
                if (form.isValid()) { // make sure the form contains valid data before submitting
                    form.submit({
                        success: function (form, action) {
                            var appo = Ext.util.JSON.decode(action.response.responseText)
                            //responsive o user defined ?
                            var redirect = 'index.php?theme=classic ' + appo.UserThemeName;
                            window.location = redirect;
                        },
                        failure: function (form, action) {
                            var appo = Ext.util.JSON.decode(action.response.responseText)
                            Ext.Msg.alert('Failed', appo.message);
                            form.getForm().reset();
                        }
                    });
                } else {
                    Ext.Msg.alert('Invalid Data', 'Please insert user, password and db!')
                }
            }
        }, {
            text: 'Reset Password',
            name: 'ResetBtn',
            id: 'ResetBtn',
            handler: function (btn, evt) {
                var redirect = 'resetpwd.php';
                window.location = redirect;
            }
        }]
    });

    LoginWindow = Ext.create('Ext.window.Window', {
        //closeAction:'hide',
        autoShow: true,
        id: 'LoginWindow',
        name: 'LoginWindow',
        minHeight: 200,
        minWidth: 500,
        width: 500,
        height: 220,
        iconCls: 'x-fa fa-key fa-lg',
        title: 'Login',
        closeAction: 'hide',
        bodyStyle: "background: rgba(147,206,222,1);background: -moz-linear-gradient(left, rgba(147,206,222,1) 0%, rgba(117,189,209,1) 50%, rgba(73,165,191,1) 100%);background: -webkit-gradient(left top, right top, color-stop(0%, rgba(147,206,222,1)), color-stop(50%, rgba(117,189,209,1)), color-stop(100%, rgba(73,165,191,1)));background: -webkit-linear-gradient(left, rgba(147,206,222,1) 0%, rgba(117,189,209,1) 50%, rgba(73,165,191,1) 100%);background: -o-linear-gradient(left, rgba(147,206,222,1) 0%, rgba(117,189,209,1) 50%, rgba(73,165,191,1) 100%);background: -ms-linear-gradient(left, rgba(147,206,222,1) 0%, rgba(117,189,209,1) 50%, rgba(73,165,191,1) 100%);background: linear-gradient(to right, rgba(147,206,222,1) 0%, rgba(117,189,209,1) 50%, rgba(73,165,191,1) 100%);filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#93cede', endColorstr='#49a5bf', GradientType=1 );",
        header: false,
        closable: true,
        draggable: false,
        resizable: false,
        modal: true,
        floating: true,
        maximizable: false,
        resizable: false,
        border: false,
        //padding: '5 5 0 5',
        maximized: ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone') ? true : false),
        layout: ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone') ? {
            type: 'fit'
        } : {
            type: 'absolute'
        }),
        autoScroll: false,
        items: [LoginPanel],
        listeners: {
            close: function () {
                var me = this.down('form');
                me.destroy;
                this.destory;
            }
        }
    });

    if ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone')) {
        LoginWindow.responsiveActivate = true;
        //LoginWindow.setWidth('100%');
        //LoginWindow.setHeight('100%');
    } else {
        LoginWindow.responsiveActivate = false;
        LoginWindow.width = 400;
        LoginWindow.height = 400;
    }
};
Custom.Logout = function () {
    console.log('Login');
    Ext.Ajax.request({
        url: 'includes/io/Logout.php',
        async: false,
        success: function (response) {
            if (Custom.isJson(response.responseText)) {
                console.log('Logout');
                CurrentUser = [];
                Custom.openLinkInNewWindow('', '');
            } else {
                Ext.MessageBox.show({
                    title: 'Error Logout',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText.message,
                    icon: Ext.MessageBox.ERROR,
                    closable: false,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                    buttons: Ext.Msg.OK
                });
            }
        },
        failure: function (response) {
            if (Custom.isJson(response.responseText)) {
                Ext.MessageBox.show({
                    title: 'Error Logout',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText.message,
                    icon: Ext.MessageBox.ERROR,
                    closable: false,
                    minWidth: 300,
                    maxWidth: 1400,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            } else {
                Ext.MessageBox.show({
                    title: 'Error Logout',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText,
                    icon: Ext.MessageBox.ERROR,
                    closable: false,
                    minWidth: 300,
                    maxWidth: 1400,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            }
        },
    });
}
Custom.InfoUser = function () {
    console.log('InfoUser');
    Ext.Ajax.request({
        url: 'includes/io/UserInfo.php',
        async: false,
        success: function (response) {
            console.log('InfoUserRead');
            var JsonAppo = Ext.util.JSON.decode(response.responseText);
            if (JsonAppo['success'] == true) CurrentUser = JsonAppo.data[0];
            document.title = CurrentUser.UserDBname;
            //themeName = JsonAppo.data[0].UserThemeName;
            //themeUI = JsonAppo.data[0].UserThemeNameUI;
        },
        failure: function (response) {
            if (Custom.isJson(response.responseText)) {
                Ext.MessageBox.show({
                    title: 'Error InfoUser',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText.message,
                    icon: Ext.MessageBox.ERROR,
                    closable: false,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                    buttons: Ext.Msg.OK
                });
            } else {
                Ext.MessageBox.show({
                    title: 'Error InfoUser',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText,
                    icon: Ext.MessageBox.ERROR,
                    closable: false,
                    alwaysOnTop: true,
                    minWidth: 300,
                    maxWidth: 1400,
                    buttons: Ext.Msg.OK
                });
            }
        },
    });
}

Custom.ExecuteMenuIem = function (MenuRowId, iconCls) {
    CurrentMenuIcon = iconCls;
    Ext.Ajax.request({
        method: 'GET',
        type: 'ajax',
        async: false,
        url: 'includes/io/MenuInfo.php',
        params: {
            menuid: MenuRowId
        },
        success: function (response) {
            var me = this;
            me.CurrentPanelRaw.ProcId = 0;
            var JsonAppo = Ext.util.JSON.decode(response.responseText)
            if (JsonAppo.success) {
                if (JsonAppo.type == 'proc') {

                    if (Menu.responsiveActivate == true) {
                        var menuViewPort = MainViewPort.getComponent('westViewPortId');
                        menuViewPort.setWidth(0);
                    }
                    Ext.getBody().mask('Wait, executing process');
                    Ext.Function.defer(function () {
                        Custom.ExecuteProc(JsonAppo.ctid, null, null);
                        Ext.getBody().unmask();
                    }, 10);
                }
            } else {
                Ext.MessageBox.show({
                    title: 'Error ExecuteMenu',
                    msg: 'Sessione scaduta, F5 per re-login',
                    icon: Ext.MessageBox.ERROR,
                    closable: false,
                    minWidth: 300,
                    maxWidth: 1400,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            }
        },
        failure: function (response) {
            if (Custom.isJson(response.responseText)) {
                Ext.MessageBox.show({
                    title: 'Error ExecuteMenu',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText.message,
                    icon: Ext.MessageBox.ERROR,
                    closable: false,
                    minWidth: 300,
                    maxWidth: 1400,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            } else {
                Ext.MessageBox.show({
                    title: 'Error ExecuteMenu',
                    msg: 'Risposta del server inaspettata!!! ' + response.responseText,
                    icon: Ext.MessageBox.ERROR,
                    closable: false,
                    minWidth: 300,
                    maxWidth: 1400,
                    alwaysOnTop: true,
                    buttons: Ext.Msg.OK
                });
            }
        },
    });
}

//*************************************************************************************************************//
//                NOTIFICATION
function checkNotifications() {
    Ext.Ajax.request({
        method: 'GET',
        type: 'ajax',
        async: false,
        url: 'includes/io/notification.php',
        success: function (response, opts) {
            var JsonAppo = Ext.util.JSON.decode(response.responseText);
            if (JsonAppo.success) {
                var n = new Notification(JsonAppo.data[0].TITLE, {
                    body: JsonAppo.TITLE + '<br>' + JsonAppo.data[0].MESSAGE,
                    icon: '/repositorycom/icon.png',
                    /*   // optional
                    actions: [
                        { action: 'ok', title: 'Yes' },
                        { action: 'decline', title: 'No' }
                    ]*/
                });
            }
        }
    });
    //5min
    setTimeout(checkNotifications, 300000);
}

//*************************************************************************************************************//
//                MAIN
Ext.onReady(function () {
    Ext.QuickTips.init();
    Ext.tip.QuickTipManager.init();
    Ext.setGlyphFontFamily('FontAwesome');
    Ext.DatePicker.prototype.startDay = 1;
    Ext.util.Format.thousandSeparator = "'";
    Ext.util.Format.decimalSeparator = '.';

    /* ---- HISTORY INIT ----------------------------------------------- */
    Ext.History.init();

    //alert (Custom.GeoLocate());

    /* ----- RETRIVE USER INFO ----------------------------------------- */
    Custom.InfoUser();

    /* ----- NOTIFICATION USER ----------------------------------------- */
    if (CurrentUser.UserId > 0) {
        if (window.Notification && Notification.permission !== 'denied') {
            Notification.requestPermission(function (status) {
                // status is "granted", if accepted by user
                checkNotifications();
            });
        }
    }

    /* ----- MENU ------------------------------------------------------ */
    if (CurrentUser.UserId > 0) {
        /*  MENU SPLASH APP */
        if (CurrentDeviceType == 'app') {
            var MenuSplash = Ext.create('Ext.Panel', {
                title: 'MenuSplash',
                id: 'MenuSplash',
                width: 1000,
                height: '100%',
            });
            Menu = MenuSplash;
            MenuSearch = null;
            Menu.responsiveActivate = true;
            //document.body.requestFullscreen();
        }
        /* MENU TREE WEBAPP */
        else if ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone')) {
            var MenuStoreButton = Ext.create('Ext.data.Store', {
                id: 'MenuStore',
                autoLoad: true, //(carica in avvio)
                fields: [],
                columns: [],
                proxy: {
                    type: 'ajax',
                    url: 'includes/io/MenuRead.php',
                    extraParams: {
                        start: 0,
                        datasourcetype: 'TABLE',
                        datasource: 'aaamenu',
                        node: '3000'
                    },
                    reader: {
                        keepRawData: true,
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'total',
                        successProperty: 'success',
                        messageProperty: 'message',
                        //idProperty: 'node',
                    },
                    listeners: {
                        exception: function (proxy, response, operation) {
                            Ext.MessageBox.show({
                                title: 'Error Button',
                                msg: operation.getError(),
                                icon: Ext.MessageBox.ERROR,
                                closable: false,
                                minWidth: 300,
                                maxWidth: 1400,
                                alwaysOnTop: true,
                                buttons: Ext.Msg.OK
                            });
                        },
                    }
                }
            });
            var MenuButton = Ext.create('dynamiccombobutton', {
                //layout: 'hbox',
                id: 'MenuButton',
                name: 'MenuButton',
                itemId: 'MenuButton',
                valueField: 'id',
                iconField: 'iconCls',
                onclick: '1',
                anchor: '100% 100%',
                displayField: 'text',
                buttonWidth: '80%',
                buttonHeight: 100,
                fontColor: 'white',
                backColor: 'blue',
                iconColor: 'white',
                buttonxtype: 'dynamicbutton',
                store: MenuStoreButton,
                listeners: {
                    click: function (me) {
                        var menuViewPort = MainViewPort.getComponent('westViewPortId');
                        MenuButton.hide();
                        menuViewPort.setWidth(0);
                        CurWindow = MainViewPort.getComponent('centerViewPortId');
                        CurPanel = CurWindow.getComponent('DesignPanel');
                        CurToolBar = CurWindow.getComponent('toolbarmenu');
                        CurPanel.destory;
                        // CurWindow.remove(CurPanel);
                        /*DESIGN
                        */
                        //EXECUTE MENU CLICK
                        Custom.ExecuteMenuIem(this.text);
                    },
                }
            });
            Menu = MenuButton;
            MenuSearch = null;
            Menu.responsiveActivate = true;
            //document.body.requestFullscreen();
        }
        /*  MENU TREE STD */
        else if (CurrentDeviceType == 'desktop') {

            var rootNodeId = 2000;
            var MenuStore = Ext.create('Ext.data.TreeStore', {
                id: 'MenuStore',
                autoLoad: true,
                fields: [],
                noCache: false,
                columns: [],
                remoteSort: true,
                remoteFilter: true,
                encodeFilters: function (filters) {
                    return filters[0].value;
                },
                async: false,
                root: {
                    id: rootNodeId, //start or root value
                    text: 'Loading...',
                    expanded: true,
                    draggable: false,
                    loaded: true
                },
                proxy: {
                    url: 'includes/io/MenuRead.php',
                    filterParam: 'query',
                    type: 'ajax',
                    node: 'id',
                    reader: {
                        keepRawData: true,
                        type: 'json',
                        rootProperty: 'data',
                        totalProperty: 'total',
                        successProperty: 'success',
                        messageProperty: 'message',
                    },
                    listeners: {
                        exception: function (proxy, response, operation) {
                            Ext.MessageBox.show({
                                title: 'Error Menu',
                                msg: operation.getError(),
                                icon: Ext.MessageBox.ERROR,
                                closable: false,
                                minWidth: 300,
                                maxWidth: 1400,
                                alwaysOnTop: true,
                                buttons: Ext.Msg.OK
                            });
                        },
                    }
                },
                listeners: {
                    append: function (thisNode, newChildNode, index, eOpts) {
                        // If the node that's being appended isn't a root node, then we can
                        // assume it's one of our UserModel instances that's been "dressed
                        // up" as a node
                        if (!newChildNode.isRoot()) {
                            newChildNode.set('leaf', true);
                            newChildNode.set('text', newChildNode.get('name'));
                        }
                    }
                }
            });

            /* menu con tree list */
            var MenuListTree = Ext.create('Ext.list.Tree', {
                store: MenuStore,
                id: 'MenuB',
                name: 'MenuB',
                expanderOnly: false,
                singleExpand: false,
                highlightPath: true,
                floaterConfig: {
                    maxHeight: 200
                },
                listeners: {
                    itemkeydown: function (node, e) {
                        if (e.getKey() == e.ENTER) {
                            this.fireEvent('itemclick', node, e);
                        }
                    },
                    itemclick: function (node, e) {
                        var target = Ext.fly(e.event.target);
                        console.log('Menuitemclick');
                        if (e.node.data.disabled) {
                            Ext.toast("Modulo non attivo");
                            return false
                        }
                        Custom.ExecuteMenuIem(e.node.data.id, e.node.data.iconCls);
                    },
                    collapse: function (node) {
                        node.removeAll();
                        node.set("loaded", false);
                    }
                },
            });
            var MenuTree = Ext.create('Ext.Panel', {
                layout: 'fit',
                title: CurrentUser.UserDBname + ' ' + CurrentUser.UserLogin + ' ' + CurrentUser.RegistrationId,
                items: [MenuListTree]
            });

            Menu = MenuTree;
            MenuSearch = Ext.create('Ext.form.field.Text', {
                id: 'MenuSearch',
                name: 'MenuSearch',
                emptyText: 'Search...',
                enableKeyEvents: true,
                width: 'auto',
                border: 0,
                listeners: {
                    specialkey: function (field, event) {
                        var me = this;
                        if (event.getKey() === event.ENTER) {
                            MenuStore.clearFilter();
                            if (me.getValue() != '') {
                                console.log('remote filtering');
                                var remoteFilter = new Ext.util.Filter({
                                    id: 'innerSearch',
                                    property: 'innerSearch',
                                    type: 'strings',
                                    operator: 'like',
                                    value: me.getValue()
                                });
                                MenuStore.addFilter(remoteFilter);
                            }
                            MenuStore.removeAll();
                            MenuStore.reload();
                            //DAFARE nn va
                            //Menu.updateStore(MenuStore);
                        }
                    }
                }
            });
            Menu.responsiveActivate = false;
        }
    }
    else {
        Menu = null;
        MenuSearch = null;
    }

    if (Custom.getURLVar('procid') != 0) {
        //Menu = null;
        //MenuSearch = null;
        //westView.setWidth(0);
    }

    /* ----- TOOLBAR ---------------------------------------------------- */
    var ToolBarComplete = (CurrentDeviceType == 'desktop') ? true : false;

    var ToolbarAppo = [{
        xtype: 'button',
        id: 'ButtonMenu',
        iconCls: 'x-fa fa-bars toolBarIcon',
        tooltip: 'Menu',
        scale: scaledim,
        //setMenu: DesignMenu
        listeners: {
            click: function (btn, evt) {
                var centerView = MainViewPort.getComponent('centerViewPortId');
                var me = centerView.getComponent('DesignPanel');
                CurrentPanelRaw = clone(me.definitionraw);
                CurrentPanel = me;
                CurrentWindow = centerView;
                CurrentToolBar = CurrentWindow.getComponent('toolbarmenu');
                var westView = MainViewPort.getComponent('westViewPortId');

                if (CurrentDeviceType == 'desktop') {
                    if (westView.getWidth() == 0) {
                        westView.setWidth(null);
                    } else {
                        westView.setWidth(0);
                    }
                } else {
                    westView.setWidth('100%');
                    MenuButton.show();
                }
            }
        }
    }, {
        xtype: 'button',
        id: 'ButtonMenuEdit',
        name: 'ButtonMenuEdit',
        iconCls: 'x-fa fa-cogs toolBarIcon',
        hidden: !CurrentUser.UserDeveloper,
        tooltip: 'Edit Menu',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.ExecuteProc('aaamenuID', null, null);
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonLayoutEdit',
        name: 'ButtonLayoutEdit',
        iconCls: 'x-fa fa-pencil-square toolBarIcon',
        hidden: !CurrentUser.UserDeveloper,
        tooltip: 'Edit Layout',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                switch (CurrentPanelRaw.ViewType) {
                    case 'report':
                        Custom.ReportEdit(CurrentPanelRaw.id);
                        break;
                    case 'label':
                        Custom.LabelEdit(CurrentPanelRaw.id);
                        break;
                    default:
                        Custom.FormEdit(CurrentPanelRaw.id);
                        break;
                }
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonLayoutDataEdit',
        name: 'ButtonLayoutDataEdit',
        iconCls: 'x-fa fa-wrench toolBarIcon',
        hidden: !CurrentUser.UserDeveloper,
        tooltip: 'Edit Property',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.FormSaveVar('ID', CurrentPanelRaw.id, 'aaalayout');
                Custom.ExecuteProc('aaalayoutID', null, null);
            }
        }
    }, "-", {
        xtype: 'button',
        itemId: 'ButtonRecSave',
        name: 'ButtonRecSave',
        iconCls: 'x-fa fa-floppy-o toolBarIconGreen toolBarIcon',
        tooltip: 'Save',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                //DAFARE
                //CurrentPanel.JSReportOBJ.export({ format: 'pdf' });

                Custom.ExecuteProcRequest('SAVE');
                Custom.FormDataSave();

                var ButtonRecRefresh = CurrentToolBar.getComponent('ButtonRecRefresh');
                var ButtonRecDel = CurrentToolBar.getComponent('ButtonRecDel');
                var ButtonRecClone = CurrentToolBar.getComponent('ButtonRecClone');
                ButtonRecRefresh.enable();
                ButtonRecDel.enable();
                ButtonRecClone.enable
            }
        }
    }, {
        itemId: 'ButtonRecPrint',
        name: 'ButtonRecPrint',
        xtype: 'button',
        iconCls: 'x-fa fa-print',
        hidden: true,
        tooltip: 'Print',
        //hidden: true,
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {

                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);

                var finishPrint = function finishPrint(iframeElement) {
                    iframeElement.focus();
                    if (isEdge || isIE) {
                        try {
                            iframeElement.contentWindow.document.execCommand('print', false, null);
                        } catch (e) {
                            iframeElement.contentWindow.print();
                        }
                    } else {
                        iframeElement.contentWindow.print();
                    }
                    if (isIE) {
                        setTimeout(function () {
                            iframeElement.parentNode.removeChild(iframeElement);
                        }, 2000);
                    }
                };
                var printToIframeHandler = function printToIframeHandler(pdfBlob) {
                    var printFrame = document.createElement('iframe');
                    printFrame.style.width = 0;
                    printFrame.style.height = 0;
                    printFrame.style.visibility = 'hidden';
                    var onLoaded = function onLoaded() {
                        return finishPrint(printFrame);
                    };
                    document.getElementsByTagName('body')[0].appendChild(printFrame);
                    if (isIE || isEdge) {
                        printFrame.setAttribute('onload', onLoaded);
                    } else {
                        printFrame.onload = onLoaded;
                    }
                    $(printFrame).attr('src', URL.createObjectURL(pdfBlob));
                };

                CurrentPanel.JSReportOBJ.export({
                    report_def: CurrentPanelRaw.Json,
                    datasets: CurrentPanelRaw.DataSources,
                    format: "pdf",
                    target: "print",
                    showPageHeaderAndFooter: true,
                    scaleFonts: true,
                    outputHandler: function (pdfBlob) {
                        printToIframeHandler(pdfBlob);
                    }
                });
            }
        }
    }, "-", {
        xtype: 'button',
        itemId: 'ButtonRecSaveColumnDisp',
        name: 'ButtonRecSaveColumnDisp',
        iconCls: 'x-fa fa-columns toolBarIcon',
        hidden: true,
        tooltip: 'Save Layout',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.ExecuteProcRequest('SAVE');
                Custom.FormDataSave();

                var ButtonRecRefresh = CurrentToolBar.getComponent('ButtonRecRefresh');
                var ButtonRecDel = CurrentToolBar.getComponent('ButtonRecDel');
                var ButtonRecClone = CurrentToolBar.getComponent('ButtonRecClone');
                ButtonRecRefresh.enable();
                ButtonRecDel.enable();
                ButtonRecClone.enable();
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonRecDel',
        name: 'ButtonRecDel',
        iconCls: 'x-fa fa-trash-o toolBarIconRed toolBarIcon',
        tooltip: 'Delete',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Ext.MessageBox.show({
                    title: 'Cancella ' + CurrentWindow.title,
                    msg: 'Confermi la cancellazione?',
                    buttons: Ext.MessageBox.OKCANCEL,
                    icon: Ext.MessageBox.WARNING,
                    closable: false,
                    minWidth: 300,
                    maxWidth: 1400,
                    fn: function (btn) {
                        if (btn == 'ok') {
                            Custom.ExecuteProcRequest('DELETE');
                            Custom.FormDataSave();
                            return
                        } else {
                            return;
                        }
                    }
                });
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonRecNew',
        name: 'ButtonRecNew',
        iconCls: 'x-fa fa-asterisk toolBarIcon',
        border: true,
        tooltip: 'New',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                var ForceDataWhere = "";
                //ForceDataWhere = CurrentPanelRaw.DataWhere;
                Custom.setCurrentPanelForm(me);
                Custom.LayoutRender(CurrentPanelRaw.id, 'form', ForceDataWhere, 'add');
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonRecClone',
        name: 'ButtonRecClone',
        iconCls: 'x-fa fa-clone toolBarIcon',
        hidden: !ToolBarComplete,
        border: true,
        tooltip: 'Clone',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                //Custom.LayoutRender(CurrentPanelRaw.id, 'form', CurrentPanelRaw.DataWhere, 'clone')
                console.log('duplica:' + CurrentPanelRaw.DataSourceField);
                //svuota ID
                var CurrentForm = CurrentPanel.getForm();
                var FieldID = CurrentForm.findField(CurrentPanelRaw.DataSourceField);
                if (FieldID !== undefined) FieldID.setValue('');
                CurrentPanelRaw.DataMode = 'edit';
                if (CurrentPanelRaw.ActionClone != '') {
                    Custom.ExecuteProcRequest('SAVE');
                    Custom.FormDataSave();
                    Custom.ExecuteProc(CurrentPanelRaw.ActionClone, null, null);
                }
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonRecRefresh',
        name: 'ButtonRecRefresh',
        iconCls: 'x-fa fa-refresh toolBarIcon',
        tooltip: 'Refresh',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                if (CurrentPanelRaw.ViewType == 'form') {
                    var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + 'Form00');
                    if (DS_Form00 != undefined) {
                        DS_Form00.reload();
                        CurrentPanel.loadRecord(DS_Form00.data.first());
                        Custom.RefreshAllDataStore();
                    } else {
                        Custom.RefreshAllDataStore();
                    }
                } else if (CurrentPanelRaw.ViewType == 'grid') {

                    var FormInGrid = CurrentPanel.getComponent('FormInGrid');
                    FormInGrid.store.load();
                }
                //Custom.LayoutRender(CurrentPanelRaw.id, CurrentPanelRaw.viewtype , CurrentPanelRaw.datawhere, CurrentPanelRaw.datamode, CurrentPanelRaw.windowmode);
            }
        }
    }, "-", {
        xtype: 'button',
        itemId: 'ButtonViewGrid',
        name: 'ButtonViewGrid',
        iconCls: 'x-fa fa-table toolBarIcon',
        pressed: false,
        enableToggle: true,
        hidden: !ToolBarComplete,
        tooltip: 'Grid',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                //var appo = CurrentPanelRaw.id;
                //CurrentPanelRaw.id = 0;
                //CurrentPanelRaw.JsonFilter = Array();
                if (CurrentPanelRaw.ViewType == "form") {
                    Custom.LayoutRender(CurrentPanelRaw.id, 'grid', CurrentPanelRaw.JsonFilter, '', 'acDialog');
                } else {
                    Custom.LayoutRender(CurrentPanelRaw.id, 'grid', CurrentPanelRaw.DataWhere, '', 'acDialog');
                }
            }
        }
    }, {
        itemId: 'ButtonViewExchangeExcel',
        name: 'ButtonViewExchangeExcel',
        xtype: 'button',
        iconCls: 'x-fa fa-exchange toolBarIcon',
        pressed: false,
        enableToggle: true,
        hidden: !ToolBarComplete,
        tooltip: 'Data Exchange',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Ext.MessageBox.show({
                    title: "Error Exchange",
                    msg: 'open excel and add Remote Web Query',
                    value: location.origin + '/includes/io/DataReadExt.php?limit=-1&format=HTML&layoutid=' + CurrentPanelRaw.id,
                    minWidth: 300,
                    maxWidth: 1400,
                    multiline: true,
                    closable: false,
                    buttons: Ext.Msg.OK
                });
            }
        }
    }, "-", {
        xtype: 'button',
        itemId: 'ButtonSendObject',
        name: 'ButtonSendObject',
        iconCls: 'x-fa fa-envelope-o toolBarIcon',
        hidden: !ToolBarComplete,
        tooltip: 'Send Current',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.FormDataSave();
                var CurrentForm = CurrentPanel.getForm();
                var formemail = CurrentForm.getRecord().data['EMAIL'];
                Custom.SendObject(formemail);
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonDocuments',
        name: 'ButtonDocuments',
        iconCls: 'x-fa fa-folder-open-o toolBarIcon',
        hidden: !ToolBarComplete,
        tooltip: 'Open Document',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var CurrentForm = CurrentPanel.getForm();
                var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                    Custom.ExecuteProcRequest('aaadocumentsopen');
                    Custom.FormDataSave();
                } else {
                    Ext.MessageBox.show({
                        title: "Error Document",
                        msg: 'attenzione salvare prima di allegare un documento',
                        icon: Ext.MessageBox.ERROR,
                        closable: false,
                        minWidth: 300,
                        maxWidth: 1400,
                        buttons: Ext.Msg.OK
                    });
                }
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonNote',
        name: 'ButtonNote',
        iconCls: 'x-fa x-fa fa-sticky-note',
        hidden: true,
        tooltip: 'Open Note',
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var CurrentForm = CurrentPanel.getForm();
                var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                    Custom.ExecuteProcRequest('aaanoteopen');
                    Custom.FormDataSave();
                } else {
                    Ext.MessageBox.show({
                        title: "Error Note",
                        msg: 'attenzione salvare prima di inserire una nota',
                        icon: Ext.MessageBox.ERROR,
                        closable: false,
                        minWidth: 300,
                        maxWidth: 1400,
                        buttons: Ext.Msg.OK
                    });
                }
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonHistory',
        name: 'ButtonHistory',
        iconCls: 'x-fa fa-history toolBarIcon',
        hidden: !ToolBarComplete,
        tooltip: 'Open History',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var CurrentForm = CurrentPanel.getForm();
                var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                    var MsgHistory = "SR:" + CurrentForm.getRecord().data['SR'] + "<BR>" +
                        "SI:" + CurrentForm.getRecord().data['SI'] + "<BR>" +
                        "SA:" + CurrentForm.getRecord().data['SA'];
                    Ext.toast(MsgHistory);
                    Custom.ExecuteProcRequest('aaalogsuseropen');
                    Custom.FormDataSave();
                } else {
                    Ext.MessageBox.show({
                        title: "Error History",
                        msg: 'attenzione salvare prima di vedere la history',
                        icon: Ext.MessageBox.ERROR,
                        closable: false,
                        minWidth: 300,
                        maxWidth: 1400,
                        buttons: Ext.Msg.OK
                    });
                }
            }
        }
    },
    {
        xtype: 'splitbutton',
        itemId: 'ButtonLanguage',
        name: 'ButtonLanguage',
        xtype: 'button',
        hidden: !LanguageManager,
        iconCls: 'x-fa fa-flag toolBarIcon',
        scale: scaledim,
        menu: [
            {
                xtype: 'button',
                itemId: 'ButtonLanguageData',
                name: 'ButtonLanguageData',
                text: 'LanguageData',
                iconCls: 'x-fa fa-flag',
                tooltip: 'Open Language Data',
                listeners: {
                    click: function (btn, evt) {
                        var me = btn.up('panel');
                        Custom.setCurrentPanelForm(me);
                        var CurrentForm = CurrentPanel.getForm();
                        var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                        if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                            Custom.ExecuteProcRequest('aaalanguagetableopen');
                            Custom.FormDataSave();
                        } else {
                            Ext.MessageBox.show({
                                title: "Error Language",
                                msg: 'attenzione salvare prima di visualizzare la sua Language',
                                icon: Ext.MessageBox.ERROR,
                                buttons: Ext.Msg.OK,
                                minWidth: 300,
                                maxWidth: 1400,
                            });
                        }
                    }
                }
            },
            {
                xtype: 'button',
                itemId: 'ButtonLanguageLayout',
                name: 'ButtonLanguageLayout',
                text: 'LanguageLayout',
                iconCls: 'x-fa fa-flag',
                tooltip: 'Open Language Layout',
                listeners: {
                    click: function (btn, evt) {
                        var me = btn.up('panel');
                        Custom.setCurrentPanelForm(me);
                        var CurrentForm = CurrentPanel.getForm();
                        var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                        if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                            Custom.ExecuteProcRequest('aaalanguagelayoutopen');
                            Custom.FormDataSave();
                        } else {
                            Ext.MessageBox.show({
                                title: "Error Language",
                                msg: 'attenzione salvare prima di visualizzare la sua Language',
                                icon: Ext.MessageBox.ERROR,
                                buttons: Ext.Msg.OK,
                                minWidth: 300,
                                maxWidth: 1400,
                            });
                        }
                    }
                }
            }
        ]
    }, {
        xtype: 'button',
        itemId: 'ButtonActivity',
        name: 'ButtonActivity',
        iconCls: 'x-fa fa-anchor toolBarIcon',
        hidden: !ToolBarComplete,
        tooltip: 'Open Activity',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var CurrentForm = CurrentPanel.getForm();
                var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                    Custom.ExecuteProcRequest('aaaactivityopen');
                    Custom.FormDataSave();
                } else {
                    Ext.MessageBox.show({
                        title: "Error Activity",
                        msg: 'attenzione salvare prima di inserire una activity',
                        icon: Ext.MessageBox.ERROR,
                        closable: false,
                        minWidth: 300,
                        maxWidth: 1400,
                        buttons: Ext.Msg.OK
                    });
                }
            }
        }
    }, {
        itemId: 'ButtonLock',
        name: 'ButtonLock',
        xtype: 'button',
        iconCls: 'x-fa fa-expeditedssl toolBarIcon',
        hidden: !ToolBarComplete,
        tooltip: 'Lock Record',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                var CurrentForm = CurrentPanel.getForm();
                var ID = CurrentForm.getRecord().data[CurrentPanelRaw.DataSourceField];
                if (!Custom.IsNullOrEmptyOrZeroString(ID)) {
                    //OLD STATO (QUINDI INVERSO)
                    var btnlock = CurrentToolBar.getComponent('ButtonLock');
                    var btnsave = CurrentToolBar.getComponent('ButtonRecSave');
                    var btndel = CurrentToolBar.getComponent('ButtonRecDel');
                    var ButtonRecNew = CurrentToolBar.getComponent('ButtonRecNew');
                    var ButtonRecClone = CurrentToolBar.getComponent('ButtonRecClone');
                    if (CurrentUser.UserManager == 1) {
                        if (CurrentForm.getRecord().data['SL'] == 1) {
                            //btnlock.setStyle('color','red');
                            btnlock.setStyle('background-color', 'red');
                            //DAFARE READONLY FORM
                            btnsave.disable();
                            btndel.disable();
                            ButtonRecNew.disable();
                            ButtonRecClone.enable();
                        } else {
                            //btnlock.setStyle('color','red');
                            btnlock.setStyle('background-color', '');
                            //DAFARE READONLY FORM
                            btnsave.enable();
                            btndel.enable();
                            ButtonRecNew.enable();
                            ButtonRecClone.enable();
                        }

                        Custom.ExecuteProcRequest('aaalockrecord');
                        Custom.FormDataSave();
                    } else {
                        Ext.MessageBox.show({
                            title: "Error ButtonLock",
                            msg: 'attenzione non autorizzato',
                            icon: Ext.MessageBox.ERROR,
                            minWidth: 300,
                            maxWidth: 1400,
                            buttons: Ext.Msg.OK
                        });
                    }
                } else {
                    Ext.MessageBox.show({
                        title: "Error ButtonLock",
                        msg: 'attenzione salvare prima di impostare field ButtonLock',
                        icon: Ext.MessageBox.ERROR,
                        minWidth: 300,
                        maxWidth: 1400,
                        buttons: Ext.Msg.OK
                    });
                }
            }
        }
    }, '-', {
        itemId: 'ButtonChat',
        name: 'ButtonChat',
        xtype: 'button',
        iconCls: 'x-fa fa-comments toolBarIcon',
        border: true,
        tooltip: 'Help Chat Operator',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);
                Custom.Chat();
            }
        }
    }, {
        xtype: 'button',
        itemId: 'ButtonHelp',
        name: 'ButtonHelp',
        iconCls: 'x-fa fa-question-circle toolBarIcon',
        border: true,
        hidden: !ToolBarComplete,
        tooltip: 'Help',
        scale: scaledim,
        listeners: {
            click: function (btn, evt) {
                var me = btn.up('panel');
                Custom.setCurrentPanelForm(me);

                var CurrentGuideIntro = [];
                CurrentGuideIntro[0] = {
                    intro: "Guida segui i passaggi per l'inserimento"
                };

                var toAddI = 1;
                /*
                for (let objExt of CurrentPanel.items.items) {
                    if (objExt.hasOwnProperty('tooltip')) {
                        CurrentGuideIntro[toAddI] = {
                                                        element: '#' + objExt.id,
                                                        intro: toAddI + " Campo da compilare." + objExt.tooltip
                                                    }
                        toAddI++;
                    }
                };
                */

                CurrentPanel.getForm().getFields().each(function (objExt) {
                    if (objExt.hasOwnProperty('tooltip')) {
                        CurrentGuideIntro[toAddI] = {
                            element: '#' + objExt.id,
                            intro: toAddI + " Campo da compilare." + objExt.tooltip
                        }
                        toAddI++;
                    }
                });

                if (CurrentGuideIntro == []) {
                    CurrentGuideIntro[toAddI] = {
                        intro: "Guida non presente"
                    };
                }

                introJs().setOptions({
                    steps: CurrentGuideIntro
                }).onchange(function () {
                    console.log(this, arguments, 'introJs change');
                }).onexit(function () {
                    console.log(this, arguments, 'introJs exit');
                }).oncomplete(function () {
                    console.log(this, arguments, 'introJs complete');
                }).start();
            }
        }
    }, '-', {
        xtype: 'button',
        id: 'ButtonMenuExit',
        name: 'ButtonMenuExit',
        iconCls: 'x-fa fa-power-off toolBarIcon',
        hidden: !ToolBarComplete,
        tooltip: 'Exit',
        scale: scaledim,
        listeners: {
            click: function (button, event) {
                Custom.Logout();
            }
        }
    }, '-', {
        xtype: 'label',
        id: 'ToolBarLabel',
        name: 'ToolBarLabel',
        cls: 'toolbal-label-style toolBarIcon',
        scale: scaledim,
        hidden: !ToolBarComplete
    },];

    DesignToolBar = Ext.create('Ext.toolbar.Toolbar', {
        hidden: true,
        itemId: 'toolbarmenu',
        docked: 'top',
        defaults: {
            border: false
        },
        items: ToolbarAppo
    });
    CurrentToolBar = DesignToolBar;
    Custom.ToolBarProc(CurrentToolBar);

    /* ------ MIN TOOLBAR ----------------------------------------------- */
    CurrentTaskBar = Ext.create('Ext.toolbar.Toolbar', {
        hidden: false,
        itemId: 'taskbar',
        docked: 'top',
        defaults: {
            border: false
        },
        items: [
        ]
    });

    /* ----- DESIGN PANEL ----------------------------------------------- */
    var DesignPanel = Ext.create('Ext.form.Panel', {
        itemId: 'DesignPanel',
        name: 'DesignPanel',
        maximizable: false,
        minimizable: false,
        maximized: true,
        closable: false,
        header: ((CurrentDeviceType == 'desktop') ? true : false),
        title: 'Benvenuto: ' + window.location.hostname.split('.')[0],
        anchor: "100% 100%",
        scrollable: true,
        //overflowY: ((CurrentPanelRaw.Skin == 'absolute') ? 'scroll' : false),
        //overflowX: ((CurrentPanelRaw.Skin == 'absolute') ? 'scroll' : false),
        definitionraw: '',
        rendered: false,
        //height: "100%",
        //height: Ext.getBody().getViewSize().height - 50,
        //border: true,
        //padding: '5 5 0 5',
        monitorValid: true,
        trackResetOnLoad: true,
        // bodyStyle: 'background: transparent;',
        //bodyStyle:"background-image:url('repositorycom/sfondorepeat.png');background-repeat:repeat-all;",
        bodyStyle: "background-image:url('archive/" + window.location.hostname.split('.')[0] + "/repositorycom/splash.png');background-repeat:no-repeat;background-position: center;",
        items: [],
        layout: {
            type: 'fit',
            align: 'center',
            pack: 'center',
        },
        waitTitle: 'Connecting...',
        waitMsg: 'Connecting...',
        listeners: {
            afterrender: onAfterRenderDesignPanel,
            focus: function () {
                var me = this.down('form');
                if (me.definitionraw != '')
                    CurrentPanelRaw = clone(me.definitionraw);
                CurrentPanel = me;
                var CurrentWindow = MainViewPort.getComponent('centerViewPortId');
                CurrentToolBar = CurrentWindow.getComponent('toolbarmenu');
                console.log('focus window ' + CurrentPanelRaw.name);
            },
            activate: function () {
                //if (me.definitionraw != '') CurrentPanelRaw = clone(this.definitionraw);
                //CurrentPanel = me;
                //var CurrentWindow = MainViewPort.getComponent('centerViewPortId');
                //CurrentToolBar  = CurrentWindow.getComponent('toolbarmenu');
                //console.log('activate window ' + CurrentPanelRaw.name);
            }
        },
    });

    /* ----- VIEWPORT --------------------------------------------------- */
    var headerPanel = {
        xtype: 'panel',
        height: 80,
        //bodyStyle: "background-image:url('repositorycom/background-orange-banner.jpg')",
        layout: {
            type: 'hbox',
            padding: '5',
            align: 'top'
        },
        defaults: {
            margin: '0 5 0 0'
        },
        //style: {'background-image': 'url("repositorycom/background-orange-banner.jpg");'},
        items: [{
            xtype: 'image',
            height: 79,
            width: 180,
            src: CurrentUser.UserArchive + 'repositorycom/logo.png',
        }, {
            xtype: 'tbspacer',
            flex: 1
        }, {
            xtype: 'image',
            src: 'repositorycom/icon-login.png',
            height: 80,
            width: 80,
            listeners: {
                render: function (c) {
                    c.getEl().on('click', function (e) {
                        Custom.StartLogin();
                    }, c);
                }
            }
        }]
    };

    var MenuLogo = Ext.create('Ext.Img', {
        height: 31,
        margin: '1 1 1 1',
        mode: 'element',
        border: 0,
        src: CurrentUser.UserArchive + 'repositorycom/menulogo.png',
        //autoEl: {
        //    tag: 'a',
        //    href: 'http://www.net-system.it',
        //    target: '_blank'
        // }
    });

    var Logo = Ext.create('Ext.Img', {
        height: 31,
        margin: '1 1 1 1',
        mode: 'element',
        border: 0,
        src: CurrentUser.UserArchive + 'repositorycom/logo.png',
    });

    MainViewPort = Ext.create('Ext.Viewport', {
        id: 'MainViewport',
        name: 'MainViewport',
        margins: '5 5 5 0',
        layout: 'border',

        bodyBorder: false,

        defaults: {
            collapsible: false,
            split: true,
            bodyPadding: 0
        },

        items: [
        {
            region: 'north',
            id: 'northViewPortId',
            deferredRender: false,
            reference: "treelistContainer",
            items: [headerPanel]
        }, {
            region: 'west',
            id: 'westViewPortId',
            border: 1,
            deferredRender: false,
            reference: "treelistContainer",
            scrollable: 'vertical',
            width: ((CurrentDeviceType == 'desktop') ? 'auto' : '100%'),
            items: [MenuLogo, Menu, MenuSearch]
        }, {
            region: 'center',
            id: 'centerViewPortId',
            border: 0,
            deferredRender: false,
            activeTab: 0,
            layout: "fit",
            tbar: DesignToolBar,
            bbar: CurrentTaskBar,
            items: [DesignPanel]
        }]
    });

    /* ----- CSS themeUI ------------------------------------------------ */
    if ((themeName == 'azzurra') && (themeUI != '')) {
        DesignPanel.setUI(themeUI + '-panel');
        MainViewPort.setUI(themeUI + '-panel');
        //Menu.setUi(themeUI + '-panel');
    }

    /* ----- KEY MAPPING ------------------------------------------------ */
    var map = new Ext.util.KeyMap({
        target: MainViewPort.getEl(),
        binding: [{
            key: Ext.event.Event.ENTER, //'\t',
            ctrl: true,
            handler: function (keyCode, e) {
                //SAVE COMMAND
                Custom.ExecuteProcRequest('SAVE');
                Custom.FormDataSave();
                event.preventDefault();
                return false;
            }
        }, {
            key: Ext.event.Event.ENTER, //'\t',
            alt: true,
            handler: function (keyCode, e) {
                //INSERT COMMAND
                var InDipendentWindow = Ext.getCmp(CurrentPanelRaw.name + '_Window');
                if (InDipendentWindow !== undefined) {
                    var AppoPanel = InDipendentWindow.getComponent(CurrentPanelRaw.name + '_Panel');
                    //InDipendentWindow.remove(AppoPanel);
                    //AppoPanel.destory;
                    InDipendentWindow.close();
                    InDipendentWindow.destory;
                }

                //Custom.LayoutRender(CurrentPanelRaw.id, 'form', CurrentPanelRaw.DataWhere + "", 'clone');
                console.log('duplica:' + CurrentPanelRaw.DataSourceField);
                //svuota ID
                var CurrentForm = CurrentPanel.getForm();
                var FieldID = CurrentForm.findField(CurrentPanelRaw.DataSourceField);
                if (FieldID !== undefined) FieldID.setValue('');
                CurrentPanelRaw.DataMode = 'edit';
                if (CurrentPanelRaw.ActionClone != '') {
                    Custom.ExecuteProcRequest('SAVE');
                    Custom.FormDataSave();
                    Custom.ExecuteProc(CurrentPanelRaw.ActionClone, null, null);
                }

                event.preventDefault();
                return false;
            }
        }, {
            key: Ext.event.Event.ENTER, //'\t',
            shift: true,
            handler: function (keyCode, e) {
                //INSERT COMMAND
                var InDipendentWindow = Ext.getCmp(CurrentPanelRaw.name + '_Window');
                if (InDipendentWindow !== undefined) {
                    var AppoPanel = InDipendentWindow.getComponent(CurrentPanelRaw.name + '_Panel');
                    //InDipendentWindow.remove(AppoPanel);
                    //AppoPanel.destory;
                    InDipendentWindow.close();
                    InDipendentWindow.destory;
                }

                Custom.LayoutRender(CurrentPanelRaw.id, 'form', CurrentPanelRaw.DataWhere + '', 'add');

                event.preventDefault();
                return false;
            }
        }, {
            key: [Ext.event.Event.NUM_MINUS, Ext.event.Event.NUM_PLUS],
            ctrl: true,
            handler: function (keyCode, e) {
                //PREVENT ZOOMIN
                e.preventDefault();
            }
        }
        ]
    });
    /* ---- DISPOSITION MENU LAYOUT ON START --------------------------------------------------- */
    var northViewPortId = MainViewPort.getComponent('northViewPortId');
    var westViewPortId = MainViewPort.getComponent('westViewPortId');
    var centerViewPortId = MainViewPort.getComponent('centerViewPortId');

    if (CurrentUser.UserId > 0) {
        northViewPortId.hide();
        westViewPortId.show();
        if (CurrentDeviceType == 'desktop') {
            CurrentToolBar.show();
            CurrentTaskBar.show();
            //SQL Builder Admin or Developer Load QueryBuilder
            if ((CurrentUser.UserAdmin) || (CurrentUser.UserDeveloper)) {
                qbWindow = Ext.create('VisualSQLQueryBuilder');
            }
        } 
        else if ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone')) {
            //DAFARE ci vuole quella ridotta
            CurrentToolBar.show();
        }
    } else {
        westViewPortId.setWidth(0);
    }

    /* ---- EXECUTE ON START --------------------------------------------------- */
    if (CurrentUser.UserId > 0) {
        var appoProc = 0;
        var appoLayout = 0;

        if ((!Custom.IsNullOrEmptyOrZeroString(CurrentUser.UserStartProc))) appoProc = CurrentUser.UserStartProc;
        if (!Custom.IsNullOrEmptyOrZeroString(Custom.getURLVar('procid'))) appoProc = Custom.getURLVar('procid');
        if (!Custom.IsNullOrEmptyOrZeroString(Custom.getURLVar('layoutid'))) appoLayout = Custom.getURLVar('layoutid');


        if (!Custom.IsNullOrEmptyOrZeroString(appoLayout)) {
            valuekey = Custom.getURLVar('ID');
            appowhere = '';
            if (!Custom.IsNullOrEmptyOrZeroString(valuekey)) {
                if (Custom.isNumber(valuekey))
                    appowhere = 'ID' + ' = ' + valuekey + '';
                else
                    appowhere = 'ID' + " = '" + valuekey + "'";
            }
            valuecodice = Custom.getURLVar('CODICE');
            if (!Custom.IsNullOrEmptyOrZeroString(valuecodice)) {
                appowhere = 'CODICE' + " = '" + valuecodice + "'";
            }
            //DAFARE REPORT 
            if (Custom.getURLVar('layoutid') == 30401) {
                Custom.LayoutRender(appoLayout, 'form', appowhere, 'report', '');
            }
            else {
                Custom.LayoutRender(appoLayout, 'form', appowhere, 'edit', '');
            }
            //nasconde menu
            westViewPortId.setWidth(0);
        }
        else if (!Custom.IsNullOrEmptyOrZeroString(appoProc)) {
            Custom.ExecuteProc(appoProc, null, null);
            //nasconde menu
            if (CurrentDeviceType != 'desktop') {
                westViewPortId.setWidth(0);
            }
        }
    }

});