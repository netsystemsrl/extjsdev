//#https://fiddle.sencha.com/#view/editor&fiddle/33bh
//https://fiddle.sencha.com/#view/editor&fiddle/2vvb
/* global ActiveXObject,unescape */

// Sch.plugin.ExcelExport
Ext.define('Sch.excelexport.plugin.ExcelExport', {
    extend        : 'Ext.AbstractPlugin',
    alias         : 'plugin.excelexport',
    requires      : [
        'Ext.data.ArrayStore',
        'Ext.Window',
        'Ext.ux.form.ItemSelector'
    ],
    lockableScope : 'top',

    title              : 'Exported events',
    dateFormat         : 'Y-m-d g:i',
    windowTitle        : 'Choose fields to Export',
    resourceGridHeader : 'Resource fields',
    resourcePrefix     : 'Resource - ',
    eventPrefix        : 'Event - ',
    eventGridHeader    : 'Event fields',
    defaultColumnWidth : 100,

    window             : null,

    destroy : function () {
        this.window && this.window.destroy();
        this.callParent();
    },

    exportToExcel : function() {
        this.showFieldSelectionWindow();
    },

    showFieldSelectionWindow : function() {
        if (!this.window) {
            var data = [];

            Ext.each(this.grid.store.model.prototype.fields, function(field) {
                data.push([this.resourcePrefix + field.name]);
            }, this);

            Ext.each(this.grid.eventStore.model.prototype.fields, function(field) {
                data.push([this.eventPrefix + field.name]);
            }, this);

            var store = new Ext.data.ArrayStore({ fields : ['text'], data : data });

            var selector = new Ext.ux.form.ItemSelector({
                store        : store,
                displayField : 'text',
                valueField   : 'text',
                allowBlank   : false
            });

            this.window = Ext.create("Ext.Window", {
                height      : 334,
                width       : 400,
                bodyPadding : 10,
                title       : this.windowTitle,
                closeAction : 'hide',
                layout      : 'fit',
                items       : selector,

                buttons : [
                    {
                        text    : 'Export',
                        scope   : this,
                        handler : function() {

                            var selectedFields = selector.getValue(),
                                resourceFields = [],
                                eventFields = [];

                            if (!selector.isValid() || (selectedFields.length === 1 && !selectedFields[0])) return;

                            Ext.each(selectedFields, function(f) {
                                if (f.match(this.resourcePrefix)) {
                                    resourceFields.push(f.substring(this.resourcePrefix.length));
                                } else {
                                    eventFields.push(f.substring(this.eventPrefix.length));
                                }
                            }, this);

                            if (Ext.isIE) {
                                this.ieToExcel(resourceFields, eventFields);
                            } else {
                                var xml = this.getExcelXml(resourceFields, eventFields);
                                window.location = 'data:application/vnd.ms-excel;base64,' + xml;
                            }
                        }
                    },
                    {
                        text    : 'Cancel',
                        handler : function() {
                            this.window.hide();
                        },
                        scope   : this
                    }
                ]
            });
        }

        this.window.show();
    },

    /**
     *
     *  Base64 encode / decode
     *  http://www.webtoolkit.info/
     *
     **/
    base64 : function() {

        // private property
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        // private method for UTF-8 encoding
        function utf8Encode(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        }

        // public method for encoding
        return {
            encode : (typeof btoa == 'function') ? function(input) {
                return btoa(unescape(encodeURIComponent(input)));
            } : function(input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                input = utf8Encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
                        keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                        keyStr.charAt(enc3) + keyStr.charAt(enc4);
                }
                return output;
            }
        };
    }(),

    init : function(grid) {
        this.grid = grid;

        Ext.apply(grid, {
            exportToExcel : Ext.Function.bind(this.exportToExcel, this)
        });
    },

    getExcelXml : function(resourceFields, eventFields) {
        var worksheet = this.createWorksheet(resourceFields, eventFields);
        return this.base64.encode('<?xml version="1.0" encoding="utf-8"?>' +
            '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:o="urn:schemas-microsoft-com:office:office">' +
            '<o:DocumentProperties><o:Title>' + (this.title || '') + '</o:Title></o:DocumentProperties>' +
            '<ss:ExcelWorkbook>' +
            '<ss:WindowHeight>' + worksheet.height + '</ss:WindowHeight>' +
            '<ss:WindowWidth>' + worksheet.width + '</ss:WindowWidth>' +
            '<ss:ProtectStructure>False</ss:ProtectStructure>' +
            '<ss:ProtectWindows>False</ss:ProtectWindows>' +
            '</ss:ExcelWorkbook>' +
            '<ss:Styles>' +
            '<ss:Style ss:ID="Default">' +
            '<ss:Alignment ss:Vertical="Top" ss:WrapText="1" />' +
            '<ss:Font ss:FontName="arial" ss:Size="10" />' +
            '<ss:Borders>' +
            '<ss:Border ss:Color="#e4e4e4" ss:Weight="1" ss:LineStyle="Continuous" ss:Position="Top" />' +
            '<ss:Border ss:Color="#e4e4e4" ss:Weight="1" ss:LineStyle="Continuous" ss:Position="Bottom" />' +
            '<ss:Border ss:Color="#e4e4e4" ss:Weight="1" ss:LineStyle="Continuous" ss:Position="Left" />' +
            '<ss:Border ss:Color="#e4e4e4" ss:Weight="1" ss:LineStyle="Continuous" ss:Position="Right" />' +
            '</ss:Borders>' +
            '<ss:Interior />' +
            '<ss:NumberFormat />' +
            '<ss:Protection />' +
            '</ss:Style>' +
            '<ss:Style ss:ID="title">' +
            '<ss:Borders />' +
            '<ss:Font />' +
            '<ss:Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center" />' +
            '<ss:NumberFormat ss:Format="@" />' +
            '</ss:Style>' +
            '<ss:Style ss:ID="headercell">' +
            '<ss:Font ss:Bold="1" ss:Size="10" />' +
            '<ss:Alignment ss:WrapText="1" ss:Horizontal="Center" />' +
            '<ss:Interior ss:Pattern="Solid" ss:Color="#A3C9F1" />' +
            '</ss:Style>' +
            '<ss:Style ss:ID="even">' +
            '<ss:Interior ss:Pattern="Solid" ss:Color="#CCFFFF" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="even" ss:ID="evendate">' +
            '<ss:NumberFormat ss:Format="[ENG][$-409]dd-mmm-yyyy;@" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="even" ss:ID="evenint">' +
            '<ss:NumberFormat ss:Format="0" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="even" ss:ID="evenfloat">' +
            '<ss:NumberFormat ss:Format="0.00" />' +
            '</ss:Style>' +
            '<ss:Style ss:ID="odd">' +
            '<ss:Interior ss:Pattern="Solid" ss:Color="#CCCCFF" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="odd" ss:ID="odddate">' +
            '<ss:NumberFormat ss:Format="[ENG][$-409]dd-mmm-yyyy;@" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="odd" ss:ID="oddint">' +
            '<ss:NumberFormat ss:Format="0" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="odd" ss:ID="oddfloat">' +
            '<ss:NumberFormat ss:Format="0.00" />' +
            '</ss:Style>' +
            '</ss:Styles>' +
            worksheet.xml +
            '</ss:Workbook>');
    },


    createWorksheet : function(resourceFields, eventFields) {

        // Calculate cell data types and extra class names which affect formatting
        var cellType = [],
            cellTypeClass = [],
            totalWidthInPixels = 0,
            colXml = '',
            headerXml = '',
            nbrFields = resourceFields.length + eventFields.length,
            resourceProto = this.grid.store.model.prototype,
            eventProto = this.grid.eventStore.model.prototype;

        for (var i = 0; i < nbrFields; i++) {
            var field = i < resourceFields.length ? resourceProto.fieldsMap[resourceFields[i]] :
                    eventProto.fieldsMap[eventFields[i - resourceFields.length]],
                header = this.grid.child('gridcolumn[dataIndex=' + field.name + ']'),
                w = header ? header.getWidth() : this.defaultColumnWidth;

            header = header ? header.text : field.name;

            totalWidthInPixels += w;
            colXml += '<ss:Column ss:AutoFitWidth="1" ss:Width="' + w + '" />';
            headerXml += '<ss:Cell ss:StyleID="headercell">' +
                '<ss:Data ss:Type="String">' + header + '</ss:Data>' +
                '<ss:NamedCell ss:Name="Print_Titles" /></ss:Cell>';
            switch (field.type) {
                case "int":
                    cellType.push("Number");
                    cellTypeClass.push("int");
                    break;
                case "float":
                    cellType.push("Number");
                    cellTypeClass.push("float");
                    break;
                case "bool":
                case "boolean":
                    cellType.push("String");
                    cellTypeClass.push("");
                    break;
                case "date":
                    cellType.push("DateTime");
                    cellTypeClass.push("date");
                    break;
                default:
                    cellType.push("String");
                    cellTypeClass.push("");
                    break;
            }
        }
        var visibleColumnCount = cellType.length;

        var result = {
            height : 9000,
            width  : Math.floor(totalWidthInPixels * 30) + 50
        };

//      Generate worksheet header details.
        var t = '<ss:Worksheet ss:Name="' + this.title + '">' +
            '<ss:Names>' +
            '<ss:NamedRange ss:Name="Print_Titles" ss:RefersTo="=\'' + this.title + '\'!R1:R2" />' +
            '</ss:Names>' +
            '<ss:Table x:FullRows="1" x:FullColumns="1"' +
            ' ss:ExpandedColumnCount="' + visibleColumnCount +
            '" ss:ExpandedRowCount="' + (this.grid.eventStore.getCount() + 2) + '">' +
            colXml +
            '<ss:Row ss:Height="38">' +
            '<ss:Cell ss:StyleID="title" ss:MergeAcross="' + (visibleColumnCount - 1) + '">' +
            '<ss:Data xmlns:html="http://www.w3.org/TR/REC-html40" ss:Type="String">' +
            '<html:B><html:U><html:Font html:Size="15">' + (this.title || '') +
            '</html:Font></html:U></html:B></ss:Data><ss:NamedCell ss:Name="Print_Titles" />' +
            '</ss:Cell>' +
            '</ss:Row>' +
            '<ss:Row ss:AutoFitHeight="1">' +
            headerXml +
            '</ss:Row>';

//      Generate the data rows from the data in the Store
        t += this.getGridData(cellType, cellTypeClass, resourceFields, eventFields);

        result.xml = t + '</ss:Table>' +
            '<x:WorksheetOptions>' +
            '<x:PageSetup>' +
            '<x:Layout x:CenterHorizontal="1" x:Orientation="Landscape" />' +
            '<x:Footer x:Data="Page &amp;P of &amp;N" x:Margin="0.5" />' +
            '<x:PageMargins x:Top="0.5" x:Right="0.5" x:Left="0.5" x:Bottom="0.8" />' +
            '</x:PageSetup>' +
            '<x:FitToPage />' +
            '<x:Print>' +
            '<x:PrintErrors>Blank</x:PrintErrors>' +
            '<x:FitWidth>1</x:FitWidth>' +
            '<x:FitHeight>32767</x:FitHeight>' +
            '<x:ValidPrinterInfo />' +
            '<x:VerticalResolution>600</x:VerticalResolution>' +
            '</x:Print>' +
            '<x:Selected />' +
            '<x:DoNotDisplayGridlines />' +
            '<x:ProtectObjects>False</x:ProtectObjects>' +
            '<x:ProtectScenarios>False</x:ProtectScenarios>' +
            '</x:WorksheetOptions>' +
            '</ss:Worksheet>';
        return result;
    },

    getGridData : function(cellType, cellTypeClass, resourceFields, eventFields) {
        var eventData,
            resourceData,
            data = '',
            cellClass,
            eventItems = this.grid.eventStore.data.items,
            nbrFields = resourceFields.length + eventFields.length;

        for (var i = 0, l = eventItems.length; i < l; i++) {
            data += '<ss:Row>';
            cellClass = (i & 1) ? 'odd' : 'even';
            eventData = eventItems[i].data;
            resourceData = eventItems[i].getResource().data;

            for (var j = 0; j < nbrFields; j++) {
                var v;

                if (j < resourceFields.length) {
                    v = resourceData[resourceFields[j]];
                } else {
                    v = eventData[eventFields [j - resourceFields.length]];
                }
                data += '<ss:Cell ss:StyleID="' + cellClass + cellTypeClass[j] + '"><ss:Data ss:Type="' + (cellType[j] == 'DateTime' ? 'String' : cellType[j]) + '">';
                if (cellType[j] == 'DateTime') {
                    data += Ext.Date.format(v, this.dateFormat);
                } else {
                    data += v;
                }
                data += '</ss:Data></ss:Cell>';
            }
            data += '</ss:Row>';
        }

        return data;
    },

    ieGetGridData : function(resourceFields, eventFields, sheet) {
        var data = '',
            eventItems = this.grid.eventStore.data.items,
            cm = this.grid.getColumnModel(),
            nbrFields = resourceFields.length + eventFields.length,
            resourceData,
            eventData,
            l;


        for (var i = 0; i < nbrFields; i++) {
            var field = i < resourceFields.length ? this.grid.store.recordType.prototype.fields.get(resourceFields[i]) :
                    this.grid.eventStore.recordType.prototype.fields.get(eventFields[i - resourceFields.length]),
                colInd = cm.findColumnIndex(field.name),
                header = colInd > 0 ? cm.getColumnHeader(colInd) : field.name;

            sheet.cells(1, i + 1).value = header;
        }


        for (i = 0, l = eventItems.length; i < l; i++) {
            eventData = eventItems[i].data;
            resourceData = eventItems[i].getResource().data;

            for (var j = 0; j < nbrFields; j++) {
                var v;

                if (j < resourceFields.length) {
                    v = resourceData[resourceFields[j]];
                } else {
                    v = eventData[eventFields [j - resourceFields.length]];
                }
                if (v instanceof Date) {
                    sheet.cells(i + 2, j + 1).value = v.format(this.dateFormat);
                } else {
                    sheet.cells(i + 2, j + 1).value = v;
                }
            }
        }

        return data;
    },

    ieToExcel : function(resourceFields, eventFields) {
        if (window.ActiveXObject) {
            var xlApp, xlBook;
            try {
                xlApp = new ActiveXObject("Excel.Application");
                xlBook = xlApp.Workbooks.Add();
            } catch (e) {
                Ext.Msg.alert('Error', 'For the export to work in IE, you have to enable a security setting called "Initialize and script ActiveX control not marked as safe."');
                return;
            }


            xlBook.worksheets("Sheet1").activate;
            var XlSheet = xlBook.activeSheet;
            xlApp.visible = true;

            this.ieGetGridData(resourceFields, eventFields, XlSheet);
            XlSheet.columns.autofit;
        }
    }
});

// A simple preconfigured editor plugin
Ext.define('Sch.eventeditor.view.EventEditor', {
    extend : 'Sch.plugin.EditorWindow',
    alias  : 'plugin.myeditor',

    // modal    : true,

    // panel with form fields
    editorConfig : {
        // buttonAlign : 'center',

        showResourceField : true,

        startTimeConfig : {
            minValue : '08:00',
            maxValue : '18:00'
        },

        endTimeConfig : {
            minValue : '08:00',
            maxValue : '18:00'
        },

        fieldsPanelConfig : {
            xtype   : 'container',
            padding : 5,
            layout  : {
                type           : 'card',
                deferredRender : true
            },

            items : [
                // form for "Meeting" EventType
                {
                    EventType : 'Meeting',
                    xtype     : 'form',
                    items     : [
                        {
                            xtype      : 'textfield',
                            name       : 'Location',
                            fieldLabel : 'Location',
                            anchor     : '100%'
                        }
                    ]
                },
                // eof form for "Meeting" EventType

                // form for "Appointment" EventType
                {
                    EventType : 'Appointment',
                    xtype     : 'form',
                    defaults  : {
                        anchor : '100%'
                    },
                    items     : [
                        {
                            xtype      : 'textfield',
                            name       : 'Location',
                            fieldLabel : 'Location'
                        },
                        {
                            xtype      : 'combo',
                            store      : ['Dental', 'Medical'],
                            // Prevent clicks on the bound list to close the editor
                            listConfig : { cls : 'sch-event-editor-ignore-click' },
                            name       : 'Type',
                            fieldLabel : 'Type'
                        }
                    ]
                }
                // eof form for "Appointment" EventType
            ]
        }
    },

    showRecord : function (eventRecord) {
        // var resource = eventRecord.getResource() || this.editor.resourceRecord;

        // Do any custom processing here before editor is shown

        this.callParent(arguments);
    }
});

Ext.define('dynamicscheduler', {
    extend: 'Sch.panel.SchedulerGrid',
    alias: 'widget.dynamicscheduler',

    /* DATA */
    datasource: 'ESEMPIO',
    datasourcetype: 'ESEMPIO',
    valueField: 'ID',
    displayField: 'NOME',
    datasourcefield: '',
	defaultValue: '',
	/*RECORD EDITING DEFINITION*/
	layouteditorid:'',
	layoutsearchid:'',
	layouteditorWindowMode: 'acDialog',
	allowedit: true,
	allowfilter: true, 

    datasource_event: 'ESEMPIO',
    datasourcetype_event: "EVENTTASK",

    datasource_resource: 'ESEMPIO',
    datasourcetype_resource: "EVENTRESOURCE",

    startDateField: "STARTDATE",
    endDateField: "ENDDATE",
    percentDoneField: "COMPLETE",
    durationField: "DURATION",
    resourceNameField: "DESCNAME",

	toolbarVisible: true,

    /*ACTIVABLE ACTIONS*/
    allowfilter: false,
    allowadd: false,
    allowedit: false,
    alloweditcell: false,
    alloweditrow: false,
    allowdragdrop: false,
    allowexport: true,
    allowimport: true,
    allowsearch: false,
    workingTime : {
						fromDay  : 1,
						toDay    : 5,
						fromHour : 8,
						toHour   : 18
					},
	startTime: 8,
	endTime: 18,
	weekStartDay	:1,
    highlightWeekends : true,
    colorResources  : true,
	
    startDate          : new Date('2022-08-17'),
    endDate            : new Date('2022-09-25'),
	
    eventResizeHandles : 'both',
	
    viewConfig : {
        // Manually control event sizing/layout via CSS
		oadMask : true ,
        dynamicRowHeight   : false,
        managedEventSizing : false
    },
/*
    lockedGridConfig : {
        width : 200
    },
	*/
    rowHeight       : 40,
    snapToIncrement : false,
    border          : false,
    forceFit        : true,
    split           : true,
	mode: 'horizontal',  //['weekview', 'horizontal', 'vertical']
    viewPreset: 'weekAndDay', // hourAndDay,weekAndDay,weekAndDayLetter,weekAndMonth,weekDateAndMonth,monthAndYear,year

	
	
    /*<locale>
    format: "Y-m-d H:i",
    altFormats: "Y-m-d H:i:s|c",
    timezoneOffset: (new Date().getTimezoneOffset() / 60) * (-1),
	*/
    width: 'auto',
    height: 'auto',
    minWidth: 800,
    minHeight: 500,
    x: 0,
    y: 0,

    showTodayLine: true,
    loadMask: true,
    autoAdjustTimeAxis: false,
    showRollupTasks: true,
    enableDragDropColumn: true,
    allowDeselect: true,
    // enable setting PercentDone for a task by dragging a percentage handle
    enableProgressBarResize: true,
    // allow creating/editing of dependencies by dragging with the mouse
    enableDependencyDragDrop: true,
    eventBorderWidth: 0,

    //store
    StoreTask: null,
    StoreResource: null,

    createEventOnDblClick : true,
    tbar: {
        xtype: 'toolbar',
        itemId: 'schedulertoolbar',
		listeners:{
           afterrender: function() {
				var me = this.up('dynamicscheduler');
				if (me.toolbarVisible == false){
					this.hide();
				}
            }
		},
        items: [{
                iconCls: 'x-fa fa-backward',
                tooltip: 'Previous timespan',
                handler: function (button, event) {
                    var me = button.up('dynamicscheduler');
                    CurrentPanel = me.up('panel');
                    me.shiftPrevious();
                }
            }, {
                iconCls: 'x-fa fa-forward',
                tooltip: 'Next timespan',
                handler: function (button, event) {
                    var me = button.up('dynamicscheduler');
                    CurrentPanel = me.up('panel');
                    me.shiftNext();
                }
            }, {
                tooltip: 'Zoom out',
                iconCls: 'x-fa fa-search-minus',
                handler: function (button, event) {
                    var me = button.up('dynamicscheduler');
                    var meslider = me.down('slider');
                    CurrentPanel = me.up('panel');
					meslider.setValue(meslider.getValue()-1);
                    //me.zoomOut();
                }
            }, {
				xtype     : 'slider',
				style     : 'margin-left:10px',
				width     : 100,
				value     : 0,
				increment : 1,
				minValue  : 0,
				maxValue  : 10,
				listeners : {
					afterrender : function () {
						var me = this.up('dynamicscheduler');
						this.setMinValue(me.minZoomLevel);
						this.setMaxValue(me.maxZoomLevel);
						this.setValue(me.getCurrentZoomLevelIndex());
						this.on('change', me.onZoomSliderChange, me);
					}
				}
			},{
                iconCls: 'x-fa fa-search-plus',
                tooltip: 'Zoom in',
                handler: function (button, event) {
                    var me = button.up('dynamicscheduler');
                    var meslider = me.down('slider');
                    CurrentPanel = me.up('panel');
					meslider.setValue(meslider.getValue()+1);
                    //me.zoomIn();
                }
            }, {
                text: 'Print',
                tooltip: 'Print',
                iconCls: 'x-fa fa-calendar',
                handler: function (button, event) {
                    var me = button.up('dynamicscheduler');
                    CurrentPanel = me.up('panel');
                    me.print();
                }
            }, {
				xtype  : 'button',
				text   : 'Export to Excel',
				iconCls: 'x-fa fa-file-excel',
				handler: function (btn) {
                    var me = button.up('dynamicscheduler');
                    CurrentPanel = me.up('panel');
					me.exportToExcel();
				}
			},
			'->',
			{
                xtype: 'textfield',
                emptyText: 'Find task...',
                width: 150,
                enableKeyEvents: true,
                listeners: {
                    keyup: {
                        fn: function (field, e) {
                            var value = field.getValue();
                            var regexp = new RegExp(Ext.String.escapeRegex(value), 'i');
                            var gantt = field.scope.gantt;

                            if (value) {
                                gantt.taskStore.filterTreeBy(function (task) {
                                    return regexp.test(task.get('Name'));
                                });
                            } else {
                                gantt.taskStore.clearTreeFilter();
                            }
                        },
                        buffer: 300
                    },
                    specialkey: {
                        fn: function (field, e) {
                            if (e.getKey() === e.ESC) {
                                var gantt = field.scope.gantt;

                                field.reset();
                                gantt.taskStore.clearTreeFilter();
                            }
                        }
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
	
    requires: [
        'Sch.util.Date',
        'Ext.grid.plugin.CellEditing',
        'Sch.plugin.HeaderTooltip',
        'Sch.plugin.NonWorkingTime',
        'Sch.plugin.TimeGap',
        'Sch.excelexport.plugin.ExcelExport',
        'Sch.feature.HeaderResize',
        'Sch.preset.Manager',
        'Sch.data.CrudManager',
    ],

	defaultPlugins : [
	],

    dependencyViewConfig: {
        overCls: 'dependency-over'
    },

    /* eventRenderer
		eventRenderer : function(event, resource, meta) {
		var bgColor = resource.get('Bg') || '';

		meta.style = 'background:' + bgColor + ';border-color:' + bgColor + ';color:' + resource.get('TextColor');
		meta.iconCls = 'fa ' + 'fa-' + resource.get('Icon');

		return event.getName() || 'NEW JOB';
	},
	 */

    initComponent: function () {
        var me = this;
        var FormPanel = me.up('form');
        var MyeventStore = null;
        var MyresourceStore = null;

        me.plugins = [].concat(me.plugins || []);
        Ext.each(me.defaultPlugins, function (plugin) {
            if (!me.hasPlugin(plugin))
                me.plugins.push(plugin);
        });
		
        me.tipCfg = {
            cls: 'sch-tip',
            showDelay: 400,
            hideDelay: 0,
            constrain: true,
            autoHide: true,
            anchor: 't'
        };
		me.eventBodyTemplate = '<div class="sch-event-header">{headerText}</div><div class="sch-event-footer">{footerText}</div>';

        //stores
        if (me.datasource != null) {
            //stores		
            MyeventStore = Ext.StoreManager.lookup(me.store + "_Event");
            MyresourceStore = Ext.StoreManager.lookup(me.store + "_Resource");
        } else {
            //demo
            MyresourceStore = Ext.create('Sch.data.ResourceStore', {
										data: [{
											Id: 'r1',
											Name: 'Mats'
										}, {
											Id: 'r2',
											Name: 'Nick'

										}, {
											Id: 'r3',
											Name: 'Jakub'
										}, {
											Id: 'r4',
											Name: 'Tom'
										}, {
											Id: 'r5',
											Name: 'Mary'
										}]
									});
        var MyeventStore = Ext.create('Sch.data.EventStore', {
            data : [
                //To clearly see the seconds-length event the custom viewPreset should be added to zoomLevels
                {ResourceId : 'r1', Name : 'E1', StartDate : new Date(2011, 0, 1, 12, 10, 30), EndDate : new Date(2011, 0, 1, 18, 11)},
                {ResourceId : 'r2', Name : 'E2', StartDate : new Date(2011, 0, 2, 12, 10, 30), EndDate : new Date(2011, 0, 2, 18, 11)},
                {ResourceId : 'r3', Name : 'E3', StartDate : new Date(2011, 0, 3, 12, 10, 30), EndDate : new Date(2011, 0, 3, 18, 11)},
                {ResourceId : 'r4', Name : 'E4', StartDate : new Date(2011, 0, 4, 12, 10, 30), EndDate : new Date(2011, 0, 4, 18, 11)},
                {ResourceId : 'r5', Name : 'E5', StartDate : new Date(2011, 0, 5, 12, 10, 30), EndDate : new Date(2011, 0, 5, 18, 11)}
            ]
        });
			
		}
		Ext.apply(me, {
			eventStore: MyeventStore,
			resourceStore: MyresourceStore,
			plugins : [
					'scheduler_headertooltip',
					Ext.create('Sch.plugin.Printable', {
									// default values
									docType             : '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">',
									autoPrintAndClose   : true
								}),
					'excelexport',
					/*
					{
						ptype     : 'myeditor',
						listeners : {
							show  : me.onEditorShow,
							scope : me
						}
						// Editor configuration goes here
					},
					*/
					{
						ptype        : 'cellediting',
						clicksToEdit : 1
					},
					{
						ptype      : 'scheduler_timegap',
						// Use custom styling for long gaps (>= 1 days)
						getZoneCls : function(start, end) {
							if (Sch.util.Date.getDurationInDays(start, end) >= 1) {
								return 'long-unallocated-slot';
							}
						}
					},
					/*
					{
						ptype : 'scheduler_zones',
						store : zoneStore
					}
					*/
				]
		});
		
		me.on({
			eventcontextmenu  : me.onEventContextMenu,
			beforetooltipshow : me.beforeTooltipShow,
			scope : me
		});
		
		me.callParent();
	},

    /* assign the event to itself when the object is initialising    */
    onRender: function (ct, position) {
        dynamicscheduler.superclass.onRender.call(this, ct, position);

        var me = this;
        me.maxHeight = Ext.getBody().getViewSize().height - (me.y + 100);
        if (me.hasOwnProperty('height') == false) {
            me.height = Ext.getBody().getViewSize().height - (me.y + 100);
        } else if (me.height == 'auto') {
            me.height = Ext.getBody().getViewSize().height; //- (me.y + me.getY());
        }
    },

	hasPlugin : function (ptype) {
		return Ext.Array.some(this.plugins, function (plugin) {
			return (plugin === ptype || plugin.ptype === ptype);
		});
	},

	eventRenderer : function (item, resourceRec, tplData) {
        var bookingStart = item.getStartDate();
		/*
		if (item.isMilestone()) {
            tplData.cls = 'milestone';
        } else {
            tplData.cls = 'normalEvent';
        }
		*/
        if (resourceRec) {
            //tplData.style = 'background-color:' + resourceRec.get('Color');
        }
		tplData.style = 'color:white'; 
		tplData.cls = resourceRec.get('Category');
		//return Ext.Date.format(item.getStartDate(), 'Y-m-d') + ': ' + item.getName();
        return {
            headerText : Ext.Date.format(bookingStart, this.getDisplayDateFormat()),
            footerText : item.getName()
        };
    },
	dragConfig: {
		enableCopy: true
	},
	listeners: {
		eventkeydown: 'onEventKeyDown'
	},
	onEventKeyDown: function(){
		alert('eventkeydown!');
	},
	//showAllDayHeader: true,
	//multiSelect: true,
	
    onZoomSliderChange : function (s, v) {
        this.zoomToLevel(v);
    },

    onEventCreated : function (newEventRecord) {
        // Overridden to provide some defaults before adding it to the store
        newEventRecord.set('Title', 'Hello...');
    },
	
	resizeConfig : {
		showDuration : false
	},

	viewConfig : {
		trackOver : false
	},

	onEventCreated : function (newEventRecord, resources) {
        // Overridden to provide some default values
        newEventRecord.set({
            Title     : 'New task...',
            Location  : 'Local office',
            EventType : 'Meeting'
        });

        var resourceStore = this.getResourceStore();

        if (!newEventRecord.getResourceId()) {
            if (!Ext.isEmpty(resources)) {
                newEventRecord.assign(resources);
            } else if (resourceStore && resourceStore.getCount() > 0) {
                newEventRecord.assign(resourceStore.first());
            }
        }
    },

    onEventContextMenu : function (s, rec, e) {
        e.stopEvent();

        if (!s.ctx) {
            s.ctx = new Ext.menu.Menu({
                items : [ {
                    text    : 'Delete event',
                    iconCls : 'icon-delete',
                    handler : function () {
                        s.eventStore.remove(s.ctx.rec);
                    }
                } ]
            });
        }
        s.ctx.rec = rec;
        s.ctx.showAt(e.getXY());
    },

    // Don't show tooltip if editor is visible
    beforeTooltipShow : function (s, r) {
        return !s.getEventEditor() || !s.getEventEditor().isVisible(true);
    },

    addTask : function (resource) {
        var editor = this.normalGrid.findPlugin('myeditor');
/*
        var newTask = this.eventStore.add({
            ResourceId : resource.getId(),
            Title      : 'New Task',
            StartDate  : this.getStart(),
            EndDate    : Sch.util.Date.add(this.getStart(), Sch.util.Date.HOUR, 3)
        })[ 0 ];
*/
		var me = btn.up('dynamicgrid');
		Custom.setCurrentPanelForm(me);
		var NameChiave = me.valueField;
		//var ValRiga = me.store.data.items[0].data[NameChiave];
		if ((me.layouteditorid != 0) && (me.layouteditorid !== undefined)) {
			CurrentLayoutDataSourceFieldValue = "";
			var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
			ValRiga = DS_Form00.data.items[0].data[me.datasourcefield];
			console.log('dynamicgrid add' + NameChiave + '=' + ValRiga);
			if ((CurrentPanelRaw.ViewType == 'form') && (Custom.IsNullOrEmptyOrZeroString(ValRiga))) {
				Custom.ExecuteProcRequest('SAVE');
				Custom.FormDataSave();
			}else{
				if ((CurrentPanelRaw.DataWhere != '') && (CurrentPanelRaw.ViewType == 'grid')) {
					Custom.LayoutRender(me.layouteditorid, 'form', CurrentPanelRaw.DataWhere + ""   , 'add', me.layouteditorWindowMode);
				} else {
					Custom.LayoutRender(me.layouteditorid, 'form', NameChiave + " = " + ValRiga + "", 'add', me.layouteditorWindowMode);
				}
			}
			//Custom.LayoutRender(me.layouteditorid,'form', NameChiave + " = " + ValRiga + "", 'add');
			//var DesignPanel = Ext.getCmp('DesignPanel');
			//var form = DesignPanel.getForm();
			//var FieldID = form.findField(NameChiave);
			//FieldID.setValue(CurrentLayoutDataSourceFieldValue);

			//Custom.FormDataNew();
		}
					
        editor.showRecord(newTask);
    },

    onEditorShow : function () {
        this.getSchedulingView().tip && this.getSchedulingView().tip.hide();
    },

    onDestroy : function () {
        this.callParent();
    },
	
});