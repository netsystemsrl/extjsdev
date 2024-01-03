//#https://fiddle.sencha.com/#view/editor&fiddle/33bh
//https://fiddle.sencha.com/#view/editor&fiddle/2vvb
/* global ActiveXObject,unescape */

Ext.define('dynamictaskboard', {
    extend: 'Kanban.view.TaskBoard',
    alias: 'widget.dynamictaskboard',

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

	
	/* week view
	mode: 'weekview',
	viewPreset : {
		name: 'week',
		timeResolution: {
			unit: 'MINUTE',
			increment: 15
		},
		timeRowHeight: 5
	},
	*/
	
    title           : 'taskboard with event editor',
	startTime: 8,
	endTime: 18,
    rowHeight       : 40,
    snapToIncrement : true,
    border          : false,
    colorResources  : false,
    forceFit        : true,
	
    //<locale>
    /**
     * @cfg {String} format
     * The default date format string which can be overriden for localization support. The format must be valid
     * according to {@link Ext.Date#parse}.
     */
    format: "m/d/Y H:i",
    //</locale>
    //<locale>
    /**
     * @cfg {String} altFormats
     * Multiple date formats separated by "|" to try when parsing a user input value and it does not match the defined
     * format.
     */
    altFormats: "m/d/Y H:i:s|c",
    timezoneOffset: (new Date().getTimezoneOffset() / 60) * (-1),

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

    // give weekends a contrasting color
    highlightWeekends: true,

    // enable setting PercentDone for a task by dragging a percentage handle
    enableProgressBarResize: true,

    // allow creating/editing of dependencies by dragging with the mouse
    enableDependencyDragDrop: true,

    // it is important to match eventBorderWidth with border-width from css.
    // this example uses triton theme, which is borderless
    eventBorderWidth: 0,

    viewPreset: 'hourAndDay',
    //viewPreset : 'weekAndDayLetter',

    // change to true to allow user to resize static column area
    split: false,

    //store
    StoreTask: null,
    StoreResource: null,

    createEventOnDblClick : true,
    tbar: {
        xtype: 'toolbar',
        itemId: 'taskboardtoolbar',
        items: [{
                iconCls: 'x-fa fa-backward',
                tooltip: 'Previous timespan',
                handler: function (button, event) {
                    var me = button.up('dynamictaskboard');
                    CurrentPanel = me.up('panel');
                    me.shiftPrevious();
                }
            }, {
                iconCls: 'x-fa fa-forward',
                tooltip: 'Next timespan',
                handler: function (button, event) {
                    var me = button.up('dynamictaskboard');
                    CurrentPanel = me.up('panel');
                    me.shiftNext();
                }
            }, {
                iconCls: 'x-fa fa-search-plus',
                tooltip: 'Zoom in',
                handler: function (button, event) {
                    var me = button.up('dynamictaskboard');
                    CurrentPanel = me.up('panel');
                    me.zoomIn();
                }
            }, {
                tooltip: 'Zoom out',
                iconCls: 'x-fa fa-search-minus',
                handler: function (button, event) {
                    var me = button.up('dynamictaskboard');
                    CurrentPanel = me.up('panel');
                    me.zoomOut();
                }
            }, {
                text: 'Print',
                tooltip: 'Print',
                iconCls: 'x-fa fa-calendar',
                handler: function (button, event) {
                    var me = button.up('dynamictaskboard');
                    CurrentPanel = me.up('panel');
                    me.print();
                }
            }, {
				xtype  : 'button',
				text   : 'Export to Excel',
				iconCls: 'x-fa fa-file-excel',
				handler: function (btn) {
                    var me = button.up('dynamictaskboard');
                    CurrentPanel = me.up('panel');
					me.exportToExcel();
				}
			},
            '->', {
                text: 'Weeks',
                handler: function (button, event) {
                    var me = button.up('dynamictaskboard');
                    CurrentPanel = me.up('panel');
                    me.switchViewPreset('weekAndDayLetter');
                }
            }, {
                text: 'Months',
                handler: function (button, event) {
                    var me = button.up('dynamictaskboard');
                    CurrentPanel = me.up('panel');
                    me.switchViewPreset('monthAndYear');
                }
            }, {
                text: 'Years',
                handler: function (button, event) {
                    var me = button.up('dynamictaskboard');
                    CurrentPanel = me.up('panel');
                    me.switchViewPreset('year', new Date(me.getStart().getFullYear(), 1, 1), new Date(me.getStart().getFullYear() + 5, 1, 1));
                }
            }, {
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
        ]
    },

    requires : [
        'Kanban.editor.SimpleEditor',
        'Kanban.plugin.DragSelector',
        'Sch.preset.Manager',
        'Sch.examples.excelexport.plugin.ExcelExport'

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
		
        me.toolTipTpl = '<dl class="eventTip">' +
						'<dt>Time</dt><dd>{[Ext.Date.format(values.StartDate, "Y-m-d G:i")]}</dd>' +
						'<dt>Task</dt><dd>{Title}</dd>' +
						'<dt>Location</dt><dd>{Location}</dd>' +
						'</dl>',
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
        dynamictaskboard.superclass.onRender.call(this, ct, position);

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

        if (resourceRec) {
            tplData.style = 'background-color:' + resourceRec.get('Color');
        }

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
        this.crudManager.destroy();
        this.callParent();
    },
	
});