//*************************************************************************************************************//
//			DYNAMIC CALENDAR
/*
Ext.define('Override.calendar.view.Weeks', {
	override: 'Ext.calendar.view.Weeks',
	privates: {
		handleEventTap: function(e) {
			var event = this.getEvent(e);
			if (event) {
				this.hideOverflowPopup();
				this.onEventTap(event, e);
			}
		}
	}
});
Ext.define('Override.calendar.view.Days', {
	override: 'Ext.calendar.view.Days',
	privates: {
		handleEventTap: function(e) {
			var event = this.getEvent(e);
			if (event) {
				this.up('dynamiccalendar').fireEvent('eventtap', this, {
					eventRecord: event, // calendar event model instance
					e: e // client tap event object
				});
			}
		}
	}
});
Ext.define('Override.calendar.view.Base', {
	override: 'Ext.calendar.view.Base',
	privates: {
		onEventTap: function (eventRecord, e) {
			this.up('dynamiccalendar').fireEvent('eventtap', this, {
				eventRecord: eventRecord, // calendar event model instance
				e: e // client tap event object
			});
		}
	}
});
*/
		
Ext.define('dynamiccalendar', {
    extend: 'Ext.calendar.panel.Panel',
	mixins: {
        field: 'Ext.form.field.Base'
    },
    alias: 'widget.dynamiccalendar',	
	submitFormat: 't',
	submitValue: true,
	massUpdate:false,
	title: '',
	editable: true,
	
	/* DATA */
	valueField: 'ID',
	displayField: 'DESCRIZIONE',
	datasource: 'ESEMPIO',
	datasourcetype: 'ESEMPIO',
	datasourcefield: 'dynamiccalendar1',
	
	/* CALENDAR */
	groupField: 'TIPO',
	groupDisplayField: 'TIPODESCRZIONE',
	eventStartDateField: 'DATAGIORNO',
	eventEndDateField: 'DATAGIORNO',
	
	/* RECORD EDITING DEFINITION */
	layouteditorid:'',
	layouteditorWindowMode: 'acDialog',
	
	/* EVENT ON CHANGE*/
	autopostback: false,
	allowdragrop: false,
	
	ActionOnAdd: false, 
	ActionOnClick: false, 
	
    startTime: 6,
    endTime: 22,
    timezoneOffset: (new Date().getTimezoneOffset()/60) * (-1),
    gestureNavigation: false,
	defaultView: 'month',
	
	flex: 1,
	border: false,
	layout: 'border',
	manageHeight: true,
	
	viewModel: {
        data: {
            value: new Date()
        }
	},
    bind: {
        title: '{value:date("M Y")}'
    },
	views:{
		day:{
			startTime:6,
			endTime:22,
			titleTpl:'{start:date("j M")} - {end:date("j M")}',
			label:'GIORNO',
			view: {
				xtype: 'calendar-dayview',
				timeRenderer: function(hour, formatted, firstInGroup) {
					return '';
				},
				addForm: null,
				editForm: null,
				listeners: {
					eventtap: function (view, context, eOpts) {
						var me = view.up('dynamiccalendar');
						if (me.editable){
							me.text = context.event.id;
							me.eventEditForm(context.event.id);
						}
						return false;
					},
					select: function (view, context, eOpts) {
						var me = view.up('dynamiccalendar');
						
						var value = context.date;
						if (toType(value) == 'date') {
							value = Custom.yyyymmdd(value);
						}
			
						if (me.ActionOnClick){		
							var selectedRecord = null;
							me.text = value;
							me.processOnClick(me, selectedRecord, me.ActionOnClick, me.name  + '=' + value );
						}else{							
							if (me.editable){
								me.eventEditForm(null);
							}
						}
						return false;
					},
				}
			},
			listeners: {
				beforeeventedit: function(view, context, eOpts) {
					this.up('dynamiccalendar').onBeforeEventEdit(view, context, eOpts);
					return false;
				},
				beforeeventdragstart:  function(view, o) {
					this.up('dynamiccalendar').onBeforeDragStart(view, o);
				},
				beforeeventresizestart:  function(view, o) {
					this.up('dynamiccalendar').onBeforeResizeStart(view, o);
				},
				validateeventdrop:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				},
				validateeventresize:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				},
				validateeventerase:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				}
			}
		},
		week:{
			startTime:6,
			endTime:22,
			xtype:'calendar-week',
			controlStoreRange:false,
			titleTpl:'{start:date("j M")} - {end:date("j M")}',
			label:'SETTIMANA',
			weight:15,
			dayHeaderFormat:'D d',
			firstDayOfWeek:1,
			visibleDays:7,
			view: {
				xtype: 'calendar-weekview',
				timeRenderer: function(hour, formatted, firstInGroup) {
					return '';
				},
				addForm: null,
				editForm: null,
				firstDayOfWeek: 1,
				listeners: {
					eventtap: function (view, context, eOpts) {
						var me = view.up('dynamiccalendar');
						if (me.editable){
							me.text = context.event.id;
							me.eventEditForm(context.event.id);
						}
						return false;
					},
					select: function (view, context, eOpts) {
						var me = view.up('dynamiccalendar');
						
						var value = context.date;
						if (toType(value) == 'date') {
							value = Custom.yyyymmdd(value);
						}
			
						if (me.ActionOnClick){		
							var selectedRecord = null;
							me.text = value;
							me.processOnClick(me, selectedRecord, me.ActionOnClick, me.name  + '=' + value );
						}else{							
							if (me.editable){
								me.eventEditForm(null);
							}
						}
						return false;
					},
				}
            },
			listeners: {
			
                beforeeventadd: function (view, context, eOpts) {
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
                beforeeventtap: function (view, context, eOpts) {
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
                validateeventedit: function (view, context, eOpts) {
                    debugger;
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
				beforeeventedit: function(view, context, eOpts) {
					this.up('dynamiccalendar').onBeforeEventEdit(view, context, eOpts);
					return false;
				},
				beforeeventdragstart:  function(view, o) {
					this.up('dynamiccalendar').onBeforeDragStart(view, o);
				},
				beforeeventresizestart:  function(view, o) {
					this.up('dynamiccalendar').onBeforeResizeStart(view, o);
				},
				validateeventdrop:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				},
				validateeventresize:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				},
				validateeventerase:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				}
			},
		},
		workweek: {
			startTime:6,
			endTime:22,
			xtype: 'calendar-week',
			scrollable: 'y',
			controlStoreRange:false,
			titleTpl:'{start:date("j M")} - {end:date("j M")}',
			label:'SETTIMANA WORK',
			weight:15,
			dayHeaderFormat:'D d',
			firstDayOfWeek:1,
			visibleDays: 6,
			view: {
				xtype: 'calendar-weekview',
				timeRenderer: function(hour, formatted, firstInGroup) {
					return '';
				},
				addForm: null,
				editForm: null,
				firstDayOfWeek: 1,
				listeners: {
					eventtap: function (view, context, eOpts) {
						var me = view.up('dynamiccalendar');
						if (me.editable){
							me.text = context.event.id;
							me.eventEditForm(context.event.id);
						}
						return false;
					},
					select: function (view, context, eOpts) {
						var me = view.up('dynamiccalendar');
						
						var value = context.date;
						if (toType(value) == 'date') {
							value = Custom.yyyymmdd(value);
						}
			
						if (me.ActionOnClick){		
							var selectedRecord = null;
							me.text = value;
							me.processOnClick(me, selectedRecord, me.ActionOnClick, me.name  + '=' + value );
						}else{							
							if (me.editable){
								me.eventEditForm(null);
							}
						}
						return false;
					},
				}
            },
			listeners: {
			
                beforeeventadd: function (view, context, eOpts) {
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
                beforeeventtap: function (view, context, eOpts) {
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
                validateeventedit: function (view, context, eOpts) {
                    debugger;
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
				beforeeventedit: function(view, context, eOpts) {
					this.up('dynamiccalendar').onBeforeEventEdit(view, context, eOpts);
					return false;
				},
				beforeeventdragstart:  function(view, o) {
					this.up('dynamiccalendar').onBeforeDragStart(view, o);
				},
				beforeeventresizestart:  function(view, o) {
					this.up('dynamiccalendar').onBeforeResizeStart(view, o);
				},
				validateeventdrop:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				},
				validateeventresize:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				},
				validateeventerase:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				}
			}
		},
        weeks: {
			startTime:6,
			endTime:22,
			xtype: 'calendar-weeks',
			scrollable: 'y',
			controlStoreRange:false,
			titleTpl:'{start:date("j M")} - {end:date("j M")}',
			label:' SETTIMANE',
			view: {
				xtype: 'calendar-weeksview',
				timeRenderer: function(hour, formatted, firstInGroup) {
					return '';
				},
				addForm: null,
				editForm: null,
				firstDayOfWeek: 1,
				listeners: {
					eventtap: function (view, context, eOpts) {
						var me = view.up('dynamiccalendar');
						if (me.editable){
							me.text = context.event.id;
							me.eventEditForm(context.event.id);
						}
						return false;
					},
					select: function (view, context, eOpts) {
						var me = view.up('dynamiccalendar');
						
						var value = context.date;
						if (toType(value) == 'date') {
							value = Custom.yyyymmdd(value);
						}
			
						if (me.ActionOnClick){		
							var selectedRecord = null;
							me.text = value;
							me.processOnClick(me, selectedRecord, me.ActionOnClick, me.name  + '=' + value );
						}else{							
							if (me.editable){
								me.eventEditForm(null);
							}
						}
						return false;
					},
				}
            },
			listeners: {
			
                beforeeventadd: function (view, context, eOpts) {
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
                beforeeventtap: function (view, context, eOpts) {
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
                validateeventedit: function (view, context, eOpts) {
                    debugger;
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
				beforeeventedit: function(view, context, eOpts) {
					this.up('dynamiccalendar').onBeforeEventEdit(view, context, eOpts);
					return false;
				},
				beforeeventdragstart:  function(view, o) {
					this.up('dynamiccalendar').onBeforeDragStart(view, o);
				},
				beforeeventresizestart:  function(view, o) {
					this.up('dynamiccalendar').onBeforeResizeStart(view, o);
				},
				validateeventdrop:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				},
				validateeventresize:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				},
				validateeventerase:  function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				}
			}
		},
		month:{
			startTime:6,
			endTime:22,
			xtype:'calendar-month',
			showOverflow: false,
			titleTpl:'{start:date("j M")} - {end:date("j M")}',
			label:'MESE',
			firstDayOfWeek:1,
			visibleDays:7,
			draggable: false,
			view: {
				xtype: 'calendar-monthview',
				addForm: null,
				editForm: null,
				firstDayOfWeek: 1,
				listeners: {
					eventtap: function (view, context, eOpts) {
						var me = view.up('dynamiccalendar');
						if (me.editable){
							me.text = context.event.id;
							me.eventEditForm(context.event.id);
						}
						return false;
					},
					select: function (view, context, eOpts) {
						var me = view.up('dynamiccalendar');
						
						var value = context.date;
						if (toType(value) == 'date') {
							value = Custom.yyyymmdd(value);
						}
			
						if (me.ActionOnClick){		
							var selectedRecord = null;
							me.text = value;
							me.processOnClick(me, selectedRecord, me.ActionOnClick, me.name  + '=' + value );
						}else{							
							if (me.editable){
								me.eventEditForm(null);
							}
						}
						return false;
					},
				}
			},
			listeners: {
                beforeeventadd: function (view, context, eOpts) {
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
                beforeeventtap: function (view, context, eOpts) {
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
                validateeventedit: function (view, context, eOpts) {
                    debugger;
                    console.log(context.event.data); //Some Event Data
                    return false;
                },
				beforeeventedit: function(view, context, eOpts) {
					this.up('dynamiccalendar').onBeforeEventEdit(view, context, eOpts);
				},
				beforeeventdragstart: function(view, o) {
					this.up('dynamiccalendar').onBeforeDragStart(view, o);
				},
				beforeeventresizestart: function(view, o) {
					this.up('dynamiccalendar').onBeforeResizeStart(view, o);
				},
				validateeventdrop: function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				},
				validateeventresize: function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				},
				validateeventerase: function(view, o) {
					this.up('dynamiccalendar').confirmAction(view, o);
				}
				// validateeventedit: function(view, context, eOpts) {
				// 	this.up('dynamiccalendar').confirmAction(view, context);
				// }
			}
		}
	},
	
	onBeforeEventEdit: function(view, context, eOpts) {
		var me = view.up('dynamiccalendar');
		if (me.editable){
			me.text = context.event.id;
			me.eventEditForm(context.event.id);
		}
		return false;
	},
	
	onBeforeDragStart: function(view, o) {
		var notAllowed = ['Not draggable', 'Not draggable/resizable'];
		return !Ext.Array.contains(notAllowed, o.event.getTitle());
	},

	onBeforeResizeStart: function(view, o) {
		var notAllowed = ['Not resizable', 'Not draggable/resizable'];
		return !Ext.Array.contains(notAllowed, o.event.getTitle());
	},

	confirmAction: function(view, o) {
		var me = view.up('dynamiccalendar');
		o.validate = o.validate.then(function() {
			return new Ext.Promise(function(resolve, reject) {
				Ext.Msg.confirm('Attenzione', 'Confermi modifica ?', function(btn) {
					if (btn === 'yes'){
						var me = view.up('dynamiccalendar')						
						me.UpdateEdit(view, o)
						resolve (true);
					}else{
						resolve (false);
					}
				});
			});
		});
	},
	
	UpdateEdit: function(view, context) {
		//salva modifica lato srv
		var selectedRowDataString = '';
		var me = view.up('dynamiccalendar');
		
		var valuetowrite = context.newRange.start;
		//valuetowrite = Custom.UTCToLocalTime(valuetowrite);
		var curr_day = valuetowrite.getUTCDay()
		if (curr_day < 10) curr_day = "0" + curr_day;
		var curr_month = valuetowrite.getUTCMonth() + 1; //Months are zero based
		if (curr_month < 10) curr_month = "0" + curr_month;
		var curr_year = valuetowrite.getUTCFullYear ();
		var curr_hours = valuetowrite.getUTCHours();
		if (curr_hours < 10) curr_hours = "0" + curr_hours;
		var curr_minutes = valuetowrite.getMinutes();
		if (curr_minutes < 10) curr_minutes = "0" + curr_minutes;
		var curr_seconds = valuetowrite.getSeconds();
		if (curr_seconds < 10) curr_seconds = "0" + curr_seconds;
		valuetowrite = curr_year + "-" + curr_month + "-" + curr_day + " " + curr_hours + ":" + curr_minutes + ":" + curr_seconds;
		selectedRowDataString += me.eventStartDateField + '=' + encodeURIComponent(valuetowrite) + '&';
		
		var valuetowrite = context.newRange.end
		//valuetowrite = Custom.UTCToLocalTime(valuetowrite);
		var curr_day = valuetowrite.getUTCDay()
		if (curr_day < 10) curr_day = "0" + curr_day;
		var curr_month = valuetowrite.getUTCMonth() + 1; //Months are zero based
		if (curr_month < 10) curr_month = "0" + curr_month;
		var curr_year = valuetowrite.getUTCFullYear ();
		var curr_hours = valuetowrite.getUTCHours();
		if (curr_hours < 10) curr_hours = "0" + curr_hours;
		var curr_minutes = valuetowrite.getMinutes();
		if (curr_minutes < 10) curr_minutes = "0" + curr_minutes;
		var curr_seconds = valuetowrite.getSeconds();
		if (curr_seconds < 10) curr_seconds = "0" + curr_seconds;
		valuetowrite = curr_year + "-" + curr_month + "-" + curr_day + " " + curr_hours + ":" + curr_minutes + ":" + curr_seconds;
		selectedRowDataString += me.eventEndDateField + '=' + encodeURIComponent(valuetowrite) + '&';
		
		selectedRowDataString += me.valueField + '=' + context.event.data[me.valueField] + '&';
		selectedRowDataString += 'autocommit' + '=' + 'true' + '&';
		
		if (Custom.isNumber(me.layouteditorid) == true) {
			selectedRowDataString += 'layoutid' + '=' + me.layouteditorid + '&'

			Ext.Ajax.request({
				params: selectedRowDataString,
				url: 'includes/io/DataWrite.php',
				method: 'POST',
				async: false,
				waitTitle: 'Connecting',
				waitMsg: 'Sending data...',
				success: function (resp) {
					var appo = Ext.util.JSON.decode(resp.responseText)
					return true;
					//Custom.ExecuteProc(actionid);
				},
				failure: function () {
					Ext.Msg.alert('error', 'Not Ok');
				}
			});
		} else {
			Ext.Msg.alert('error', 'LayoutEditor REQUESTED !!!');
		}
    },
	
	EventChange: function(view, context, eOpts) {
		var me = this.up('dynamiccalendar');
	},
		
	listeners: {
		eventtap: function(view, context, eOpts){
			var me = view.up('dynamiccalendar');
			var record = context.eventRecord.data;
			if (me.editable){
				me.eventEditForm(record[me.valueField] );
			}
		},
		eventadd: function(view, context, eOpts){
			var me = view.up('dynamiccalendar');
			var record = context.eventRecord.data;
			if (me.editable){
				me.eventEditForm(record[me.valueField] );
			}
		},
		boxready: function () {
			//debugger;
			// this = calendar
			var body = this.body;
			//if (allowdragrop
			this.calPanelDropTarget = new Ext.dd.DropTarget(body, {
				ddGroup: 'grid-to-calendar',
				notifyEnter: function (ddSource, e, data) {
					//Add some flare to invite drop.
					body.stopAnimation();
					body.highlight();
				},
				notifyDrop: function (ddSource, e, data) {
					var me = Ext.get(this.el.dom.parentNode).component;
					
					// Reference the record (single selection) for readability
					var selectedRecord = ddSource.dragData.records[0];
					
					me.processOnButton(me, selectedRecord, me.ActionOnAdd, me.eventEndDateField  + '=' + e.target.parentNode.getAttribute('data-date') );
					
					// code to add record to calendar
					Ext.toast('Aggiunto: ' + selectedRecord.get(me.displayField) + ' to ' + e.target.parentNode.getAttribute('data-date'));

					// Delete record from the source store.  not really required.
					//ddSource.view.store.remove(selectedRecord);
					return true;
				},
				notifyOut: function () {
					return this.dropNotAllowed;
				}
			});

			/*
			var el = this.el.dom;
			var dd = new Ext.dd.DropTarget(el, {
				ddGroup: 'ddd',
				notified: false,
				notifyOver: function (dragEl) {
					if (!this.notified) {
						Ext.toast('Over');
						this.notified = true;
					};
					// This breaks, should it really happen?
					//Ext.getCmp('titi').add(toto);
					return this.dropAllowed;
				},
				notifyDrop: function () {
					// here, it works
					Ext.getCmp('titi').add(toto);
				},
				notifyOut: function () {
					Ext.toast('OUT');
					this.notified = false;
					return this.dropNotAllowed;
				}
			})
			*/
		}
	},
	
	timezoneOffset:0,
	processOnClick: function (calendar, record, processId, ParametersExtraString) {
		var me = calendar;
        var selectedRowDataString = '';

		Custom.setCurrentPanelForm(me);
		var NameChiave = me.valueField;
		//var ValRiga = me.store.data.items[0].data[NameChiave];
		CurrentLayoutDataSourceFieldValue = "";
		var DS_Form00 = Ext.data.StoreManager.lookup("DS_" + CurrentPanelRaw.name + "_" + "Form00");
		ValRiga = DS_Form00.data.items[0].data[me.datasourcefield];
		console.log('dynamiccalendar add' + me.name + '=' + ValRiga);
		if ((CurrentPanelRaw.ViewType == 'form') && (Custom.IsNullOrEmptyOrZeroString(ValRiga))) {
			Custom.ExecuteProcRequest(processId);
			Custom.FormDataSave();
		}

        if (Custom.IsNOTNullOrEmptyOrZeroString(calendar.layouteditorid)) {
            selectedRowDataString += 'layoutid' + '=' + calendar.layouteditorid + '&'
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
               // Custom.ExecuteProc(processId);
            },
            failure: function () {
                Ext.Msg.alert('error', 'Not Ok');
            }
        });
		
		
	},
							
    processOnButton: function (calendar, record, processId, ParametersExtraString) {
        if (typeof ParametersExtraString === undefined) {
            ParametersExtraString = '';
        }
        
        var data = {};
        data[calendar.valueField] = record.data[calendar.valueField];
        data['datasourcefield'] = calendar.valueField;

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

        if (Custom.IsNOTNullOrEmptyOrZeroString(calendar.layouteditorid)) {
            selectedRowDataString += 'layoutid' + '=' + calendar.layouteditorid + '&'
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
                Custom.ExecuteProc(processId);
            },
            failure: function () {
                Ext.Msg.alert('error', 'Not Ok');
            }
        });
    },
	
	getSubmitData: function () {
        var me = this,
            data = null;
		data = {};
		data[me.getName()] = '' + me.text;
        return data;
    },
	
	getValue: function () {
		var me = this;
        var data = {};
		data[me.getName()] = '' + me.text;
        //return data;
		return '' + me.text;
    },
	
	eventEditForm: function(currentId){	
		//apri in edit il record
		var me = this;
		if ((me.layouteditorid != 0) && (me.layouteditorid != undefined)) {
			NameChiave = me.valueField;
			log('dynamiccalendar ' + NameChiave + '=' + currentId );
			appowhere = '';
			if (Custom.isNumber(currentId) == true)
				appowhere =  NameChiave + '=' + currentId;
			else
				appowhere =  NameChiave + "='" + currentId + "'";
			Custom.LayoutRender(me.layouteditorid, 'form', appowhere, 'edit', me.layouteditorWindowMode);
		}
	},
    onRender: function (ct, position) {
        dynamiccalendar.superclass.onRender.call(this, ct, position);
        var me = this;
		//me.setView('workweek');
		//if (me.hasOwnProperty('height') == false) {
		//	me.height = Ext.getBody().getViewSize().height - (me.y + 100);
		// }
        //if (me.hasOwnProperty('height') == false) me.height = Ext.getBody().getViewSize().height - (me.y + 100);
        if ((me.hasOwnProperty('height') == false) && (me.hasOwnProperty('anchor')) == false) {
			me.anchor = 'none 100%';
		}

    },
    initComponent: function () {
        var me = this,
            el;

        me.callParent();

        me.eventTip = Ext.create('Ext.tip.ToolTip', {
            target: me.getEl(),
            delegate: '.x-calendar-event',
            listeners: {
                beforeshow: function (tip) {
                    var eventSource = me.getStore().getEventSource(),
                        eventId = Ext.get(tip.currentTarget).getAttribute('data-eventid'),
                        //rec = eventSource.getById(Ext.Number.from(eventId, 0));
                        title = eventSource.getData().getAt(0).get('title');

                    //if (rec) {
                        tip.setHtml(title);
                    //}
                }
            }
        });
    },
});