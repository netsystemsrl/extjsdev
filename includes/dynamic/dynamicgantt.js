Ext.define('dynamicganttCalendars', {
    extend : 'Gnt.data.CalendarManager',
    alias  : 'widget.dynamicganttCalendars'
});

Ext.define('dynamicgantt', {
	extend : 'Gnt.panel.Gantt',
	alias : 'widget.dynamicgantt',

	/* DATA */
	datasource : 'ESEMPIO',
	datasourcetype : 'ESEMPIO',
	valueField : 'ID',
	displayField : 'NOME',
	datasourcefield : '',
	defaultValue: '',
	/*RECORD EDITING DEFINITION*/
	layouteditorid:'',
	layoutsearchid:'',
	layouteditorWindowMode: 'acDialog',
	allowedit: true,
	allowfilter: true, 
	
	datasource_task : 'ESEMPIO',
	datasourcetype_task : "GANTTTASK",
	
	datasource_dependency : 'ESEMPIO',
	datasourcetype_dependency : "GANTTDEPENCY",
	
	datasource_calendar  : 'ESEMPIO',
	datasourcetype_calendar : "GANTTCALENDAR",
	
	datasource_resource : 'ESEMPIO',
	datasourcetype_resource : "GANTTRESOURCE",
	
	startDateField: "STARTDATE",
	endDateField: "ENDDATE",
	percentDoneField: "COMPLETE",
	durationField: "DURATION",
	resourceNameField: "DESCNAME",
	
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
    timezoneOffset: (new Date().getTimezoneOffset()/60) * (-1),
	
	width : 'auto',
	height : 'auto',
	minWidth : 800,
	minHeight : 500,
	x : 0,
	y : 0,
	rowHeight : 35,

	snapToIncrement : true,
	
	showTodayLine: true,
	loadMask: true,
	autoAdjustTimeAxis: false,
	showRollupTasks: true,
	enableDragDropColumn: true,
	allowDeselect: true,

	// give weekends a contrasting color
	highlightWeekends : true,

	// enable setting PercentDone for a task by dragging a percentage handle
	enableProgressBarResize : true,

	// allow creating/editing of dependencies by dragging with the mouse
	enableDependencyDragDrop : true,

	// it is important to match eventBorderWidth with border-width from css.
	// this example uses triton theme, which is borderless
	eventBorderWidth : 0,

	viewPreset : 'monthAndYear',
	//viewPreset : 'weekAndDayLetter',

	// change to true to allow user to resize static column area
	split : false,
	
	//store
	StoreDependency: null,
	StoreTask: null,
	StoreResource: null,
	StoreAssignment: null,
	
	tbar : {
		xtype : 'toolbar',
		itemId : 'gantttoolbar',
		items : [{
				iconCls : 'x-fa fa-backward',
				tooltip : 'Previous timespan',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					me.shiftPrevious();
				}
			}, {
				iconCls : 'x-fa fa-forward',
				tooltip : 'Next timespan',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					me.shiftNext();
				}
			}, {
				iconCls : 'x-fa fa-search-plus',
				tooltip : 'Zoom in',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					me.zoomIn();
				}
			}, {
				tooltip : 'Zoom out',
				iconCls : 'x-fa fa-search-minus',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					me.zoomOut();
				}
			}, {
				tooltip : 'Collapse all',
				iconCls : 'x-fa fa-angle-double-up',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					me.collapseAll();
				}
			}, {
				tooltip : 'Expand all',
				iconCls : 'x-fa fa-angle-double-down',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					me.expandAll();
				}
			},
            {
                tooltip   : 'critical',
                iconCls   : 'x-fa fa-critical-path',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					var v = me.getSchedulingView();
					
					button.pressed = !button.pressed;
					if (button.pressed) {
						v.highlightCriticalPaths(true);
					} else {
						v.unhighlightCriticalPaths(true);
					}
		
				}
            },
            {
                tooltip   : 'Calendars',
                iconCls   : 'x-fa fa-calendar',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					me.calendarsWindow = new Gnt.widget.calendar.CalendarManagerWindow({
						calendarManager : me.getTaskStore().calendarManager,
						modal           : true
					});

					me.calendarsWindow.show();
				}
            },
			'->', {
				text : 'Weeks',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					me.switchViewPreset('weekAndDayLetter');
				}
			}, {
				text : 'Months',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					me.switchViewPreset('monthAndYear');
				}
			}, {
				text : 'Years',
				handler : function (button, event) {
					var me = button.up('dynamicgantt');
					CurrentPanel = me.up('panel');
					me.switchViewPreset('year', new Date(me.getStart().getFullYear(), 1, 1), new Date(me.getStart().getFullYear() + 5, 1, 1));
				}
			}, {
				xtype : 'textfield',
				emptyText : 'Find task...',
				width : 150,
				enableKeyEvents : true,
				listeners : {
					keyup : {
						fn : function (field, e) {
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
						buffer : 300
					},
					specialkey : {
						fn : function (field, e) {
							if (e.getKey() === e.ESC) {
								var gantt = field.scope.gantt;

								field.reset();
								gantt.taskStore.clearTreeFilter();
							}
						}
					}
				}
			}, {
				text : 'Save',
				handler : function (button, event) {
					// please setup proper crudManager.sync.url before uncommenting this line
					// this.gantt.crudManager.sync();
				}
			}
		]
	},

	requires : [
		//'dynamicgantttoolbar',

		'Sch.util.Date',
		'Sch.preset.Manager',
		'Gnt.column.Name',
		'Gnt.plugin.taskeditor.TaskEditor',
		'Gnt.plugin.TaskContextMenu',
		'Gnt.plugin.DependencyEditor',
		'Sch.plugin.TreeCellEditing',
		'Gnt.data.TaskStore',
		'Gnt.data.CrudManager',
		'Gnt.data.CalendarManager',
		'Gnt.data.calendar.BusinessTime',
		'Gnt.column.ResourceAssignment',
		'Gnt.panel.Gantt',
		'Gnt.panel.ResourceHistogram',

		'Gnt.plugin.taskeditor.ProjectEditor',

		'Gnt.column.StartDate',
		'Gnt.column.Duration',
		'Gnt.column.Predecessor',
		'Gnt.column.AddNew'
	],

	defaultPlugins : [
		// enables task editing by double clicking, displays a window with fields to edit
		'gantt_taskeditor',
		// enables double click dependency editing
		'gantt_dependencyeditor',
		// shows a context menu when right clicking a task
		'gantt_taskcontextmenu',
		// column editing
		'scheduler_treecellediting'
	],

	dependencyViewConfig : {
		overCls : 'dependency-over'
	},

	/* eventRenderer
		eventRenderer : function(event, resource, meta) {
		var bgColor = resource.get('Bg') || '';

		meta.style = 'background:' + bgColor + ';border-color:' + bgColor + ';color:' + resource.get('TextColor');
		meta.iconCls = 'fa ' + 'fa-' + resource.get('Icon');

		return event.getName() || 'NEW JOB';
	},
	 */

	initComponent : function () {
		var me = this;
		var FormPanel = me.up('form');
		var MytaskStore = null;
		var MydependencyStore = null;
		var MyresourceStore = null;
		var MyassignmentStore = null;
		var MycalendarStore = null;
		
		me.plugins = [].concat(me.plugins || []);
		Ext.each(me.defaultPlugins, function (plugin) {
			if (!me.hasPlugin(plugin))
				me.plugins.push(plugin);
		});
		
		me.toolTipTpl = [
			'<div class="sch-dd-dependency">', 
			'<table><tbody>', 
			'<tr>', 
			'<td><span class="sch-dd-dependency-from">{fromLabel}:</span></td>', 
			'<td><span class="sch-dd-dependency-from-name">{fromTaskName}AAA</span> - {fromSide}</td>', 
			'</tr>', '<tr>', 
			'<td><span class="sch-dd-dependency-to">{toLabel}:</span></td>', 
			'<td><span class="sch-dd-dependency-to-name">{toTaskName}</span> - {toSide}</td>', 
			'</tr>', 
			'</tbody></table>', 
			'</div>'
		];
		me.tipCfg = {cls: 'sch-tip', showDelay: 400, hideDelay: 0, constrain: true, autoHide: true, anchor: 't'};
		
		//stores
        if (me.datasource != null) {	
			//stores		
			MytaskStore       = Ext.StoreManager.lookup(me.store  + "_Task");
			MydependencyStore = Ext.StoreManager.lookup(me.store + "_Dependency");
			MyresourceStore   = Ext.StoreManager.lookup(me.store  + "_Resource");
			MyassignmentStore = Ext.StoreManager.lookup(me.store  + "_Assignment");
			MycalendarManager = Ext.StoreManager.lookup(me.store  + "_Calendar");
		}else{
			//demo
			MytaskStore = new Gnt.data.TaskStore({
					scheduleByConstraints : true,
					checkDependencyConstraint : true,
					checkPotentialConflictConstraint : true,
					proxy : {
						type : 'ajax',
						url : '/data/tasks.json'
					}
				});
			MydependencyStore = new Gnt.data.DependencyStore({
					autoLoad : true,
					proxy : {
						type : 'ajax',
						url : '/data/dependencies.json'
					}
				});
			MyresourceStore = new Gnt.data.ResourceStore({
					autoLoad : true,
					proxy : {
						type : 'ajax',
						url : '/data/resources.json'
					}
				});
			MyassignmentStore = new Gnt.data.AssignmentStore({
					autoLoad : true,
					proxy : {
						type : 'ajax',
						url : '/data/assignments.json'
					}
				});
			MycalendarManager = new Gnt.data.CalendarManager({
					autoLoad:true,
					proxy    : {
						type   : 'ajax',
						url    : '/data/calendars.json'
					}
				});
				
		}
		if (MycalendarManager){
			Ext.apply(me, {
				taskStore       : MytaskStore,
				dependencyStore : MydependencyStore,
				resourceStore	: MyresourceStore,
				assignmentStore	: MyassignmentStore,
				calendarManager : MycalendarManager
			});
		}else{
			var GanttCalendar = new Gnt.data.Calendar({
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
			MytaskStore.calendar = GanttCalendar;
			var MycalendarManager = Ext.create('Gnt.data.CalendarManager', {
				// by default we will create BusinessTime calendars
				calendarClass   : 'Gnt.data.calendar.BusinessTime'
			});
			Ext.apply(me, {
				taskStore       : MytaskStore,
				dependencyStore : MydependencyStore,
				resourceStore	: MyresourceStore,
				assignmentStore	: MyassignmentStore,
				calendarManager : MycalendarManager
			});
		}
		
		me.callParent();
	},

	/* assign the event to itself when the object is initialising    */
	onRender : function (ct, position) {
		dynamicgantt.superclass.onRender.call(this, ct, position);

		var me = this;
		me.maxHeight = Ext.getBody().getViewSize().height - (me.y + 100);
		if (me.hasOwnProperty('height') == false){
			me.height = Ext.getBody().getViewSize().height - (me.y + 100);
		}else if (me.height == 'auto'){
			me.height = Ext.getBody().getViewSize().height; //- (me.y + me.getY());
		}
	},

	hasPlugin : function (ptype) {
		return Ext.Array.some(this.plugins, function (plugin) {
			return (plugin === ptype || plugin.ptype === ptype);
		});
	},

	columns : [{
			xtype : 'namecolumn',
			flex : 1,
			width : 250,
		},
		/*{
			header : 'Assigned Resources',
			width  : 150,
			tdCls  : 'resourcecell',
			xtype  : 'resourceassignmentcolumn'
		},*/
		{
			xtype : 'startdatecolumn',
            dataIndex : 'StartDate',
            format    : 'm/d/y',
		}, {
			xtype : 'durationcolumn'
		}
	],

	/* demonstrates customization of the preset by specifing column width and removing the days-row */
	viewPreset : {
		timeColumnWidth : 100,
		name : 'weekAndDayLetter',
		headerConfig : {
			middle : {
				unit : 'w',
				dateFormat : 'D d M Y'
			}
		}
	},

	resizeConfig : {
		showDuration : false
	},

	viewConfig : {
		trackOver : false
	},

	/* STORE taskStore dependencyStore
	eventRenderer: function (taskRecord) {
		return {
			ctcls: "Id-" + taskRecord.get('Id') // Add a CSS class to the task container element
		};
	},

	// a gantt chart requires a taskStore, which holds the tasks to display
	taskStore : {
	type : 'gantt_taskstore',
	// Schedule by constraints
	scheduleByConstraints : true,
	// Activate logic to warn on     :
	// - violating dependencies
	// - potential scheduling conflicts
	checkDependencyConstraint : true,
	checkPotentialConflictConstraint : true,

	proxy : {
	type : 'ajax',
	url : '/data/tasks.json'
	}
	},

	// a gantt chart also requires a dependency store, which defines the connections between the tasks
	dependencyStore : {
	type : 'gantt_dependencystore',
	allowedDependencyTypes : ['EndToStart'],
	autoLoad : true,
	proxy : {
	type : 'ajax',
	url : '/data/dependencies.json'
	}
	},
	 */

	/* STORE crudManager
	crudManager : {
		autoLoad        : true,
		transport       : {
			load : {
				method      : 'GET',
				url         : '/data/data.json'
			},
			sync : {
				method      : 'POST',
				url         : 'TODO'
			}
		}
	},
	 */

	onAddTaskClick : function (btn) {
		var me = this,
		taskStore = me.getTaskStore();

		// create empty ask
		var newTask = new taskStore.model({
				Name : 'New task',
				leaf : true,
				PercentDone : 0
			});
		// add and scroll to it
		taskStore.getRoot().appendChild(newTask);
		me.getSchedulingView().scrollEventIntoView(newTask);

		Ext.toast('Click and drag on row to plan task', 'New task added');
	}
});