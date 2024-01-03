Ext.define('codeeditor', {
	extend : 'Ext.panel.Panel',
	alias : 'widget.codeeditor',
	mixins : {
		field : 'Ext.form.field.Base'
	},
	fieldBodyCls : 'extCodeEditor',

	//minWidth:700,
	//anchor: '83%',
	focusable : false,
	minHeight : 10,
	minWidth : 10,
	MyCodeEditor : null,
	suspendCodeChange : 0,
	mode: 'php',
	modecode: 'php',
	config : {
		readOnly : false,
		mode : 'php',
		lineNumbers : true,
		matchBrackets : true,
		indentUnit : 4,
		tabSize : 4,
		indentWithTabs : true,
		toolbarHidden : false,
	},
	curposition : null,
	/*
	listeners: {
	render: 'onRenderField',
	resize: 'onResize',
	scope: 'this'
	},
	 */
	bbar : {
		xtype : 'toolbar',
		itemId : 'codetoolbar',
		items : []
	},
	items : [
		{
			xtype : 'textarea',
			width : '100%',
			height : '80%',
			listeners : {
				afterrender : function (textarea) {
					var me = textarea.up('codeeditor');

					var codeMirrorOptions = {
						value : '',
						gutters : ["CodeMirror-linenumbers", "breakpoints", "CodeMirror-foldgutter","CodeMirror-lint-markers"],
						matchBrackets : true,
						//mode: me.getMimeMode('php'),
						//mode : "text/x-php",
						mode: me.modecode,
						//mode : "application/x-httpd-php-open",
						readOnly : me.readOnly,
						lineNumbers : true,
						indentUnit : 4,
						tabSize : 4,
						//lineWrapping : false,
						foldGutter : true,
						indentWithTabs : true,
						smartIndent : true,
						autofocus : true,
						lint: {
							disableEval: false,
							disableExit: true,
							disablePHP7: false,
							disabledFunctions: ['proc_open', 'system'],
							deprecatedFunctions: ['wp_list_cats']
						},
						styleActiveLine: true,	
		/*				
						hintOptions : {
							tables : {
								users : {
									name : null,
									score : null,
									birthDate : null
								},
								countries : {
									name : null,
									population : null,
									size : null
								}
							}
						},
*/
						extraKeys : {
							"F11" : function (cm) {
								cm.setOption("fullScreen", !cm.getOption("fullScreen"));
							},
							"Esc" : function (cm) {
								if (cm.getOption("fullScreen"))
									cm.setOption("fullScreen", false);
							},
							"Ctrl-Space" : "autocomplete",
							"Ctrl-R" : "replace",
							"Ctrl-Q" : function (cm) {
								cm.foldCode(cm.getCursor());
							},
							"Ctrl-E": function (cm) { 
								var me = this;
								cm.operation(function() { 
								for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) 
									cm.foldCode({line: l, ch: 0}, null, "fold"); 
								}); 
							},
							"Ctrl-I": function (cm) {
								var me = this;
								cm.commands.unfoldAll(cm);
							},
							"F10" : function (cm) {
								var me = this;
								var range = {
									from : this.editor.getCursor(true),
									to : this.editor.getCursor(false)
								};
								cm.autoFormatRange(range.from, range.to)
							},
						}
					};

					me.MyCodeEditor = new CodeMirror.fromTextArea(textarea.getEl().query('textarea')[0], codeMirrorOptions);

					/*DAFARE DEBUG PHP ??		*/
					me.MyCodeEditor.on("gutterClick", function (cm, n) {
						var info = cm.lineInfo(n);
						var marker = null;
						if (info.gutterMarkers) {
							marker = null;
						} else {
							marker = document.createElement("div");
							marker.style.color = "#822";
							marker.innerHTML = "●";
						}
						cm.setGutterMarker(n, "breakpoints", marker);
					});

					// hack to use the extjs eventhandler ;-)
					me.MyCodeEditor.un = me.MyCodeEditor.off;
					me.MyCodeEditor.doAddListener = me.MyCodeEditor.on;
					
					//SET mode
					var Editor = me.MyCodeEditor.doc.getEditor();
					Editor.setOption("mode", me.mode);
					
					if (!me.toolbarHidden) {
						var Toolbar = me.down('toolbar');
						var Combo = Toolbar.down('combobox');
						Combo.setValue(me.mode);
					}

				}
			}
		}
	],

	/* init component */
	initComponent : function () {
		var me = this;
		if (!me.toolbarHidden) {
			var sourceTypeStore = Ext.create('Ext.data.Store', {
				fields: ['abbr', 'name'],
				data : [
					{"ID":"text/x-php", "DESCNAME":"PHP"},
					{"ID":"text/html", "DESCNAME":"PHTML"},
					{"ID":"text/json", "DESCNAME":"JSON"},
					{"ID":"text/javascript", "DESCNAME":"JSCRIPT"},
					{"ID":"text/css", "DESCNAME":"	CSS"},
					{"ID":"text/x-sql", "DESCNAME":"SQL"},
					{"ID":"text/x-mysql", "DESCNAME":"MYSQL"},
					{"ID":"text/x-plsql", "DESCNAME":"MSSQL"}
				]
			});
			

			me.bbar = {
				xtype : 'toolbar',
				itemId : 'codetoolbar',
				items : [{
						itemId : 'BuilderSQL',
						pressed : false,
						enableToggle : false,
						text : 'Add/Edit SQL',
						iconCls : 'x-fa fa-pencil-square',
						handler : function (button, event) {
							var me = button.up('codeeditor');
							CurrentPanel = me.up('panel');

							//var qbWindow = Ext.create('VisualSQLQueryBuilder');
							qbWindow.on({
								applySQL : function (vartext) {
									if (!Custom.IsNullOrEmptyOrZeroString(vartext)){
										me.value = (vartext || '');
										me.MyCodeEditor.mode = me.mode;
										me.MyCodeEditor.setValue(me.value);
										if (me.curposition){
											me.MyCodeEditor.scrollTo(me.curposition.left,me.curposition.top);   
										}
									}
								}
							});
							qbWindow.show();
							qbWindow.setValue(me.getValue());
						}
					}, {
						itemId : 'BeautifyJS',
						pressed : false,
						enableToggle : false,
						text : 'BeautifyJS',
						iconCls : 'x-fa fa-magic',
						handler : function (button, event) {
							var me = button.up('codeeditor');
							Ext.Ajax.request({
								method : 'POST',
								async : false,
								params : {
									code : me.value,
									type : 'JSON'
								},
								url : '/includes/io/EditorFunction.php',
								success : function (response) {
									var me = button.up('codeeditor');
									if (!Custom.IsNullOrEmptyOrZeroString(response.responseText)){
										me.value = (response.responseText || '');
										me.MyCodeEditor.mode = me.mode;
										me.MyCodeEditor.setValue(me.value);
										if (me.curposition){
											me.MyCodeEditor.scrollTo(me.curposition.left,me.curposition.top);   
										}
									}
								},
								failure : function (response) {
									Ext.Msg.alert('Error', response);
								}
							});
						}
					}, {
						itemId : 'BeautifySQL',
						pressed : false,
						enableToggle : false,
						text : 'BeautifySQL',
						iconCls : 'x-fa fa-magic',
						handler : function (button, event) {
							var me = button.up('codeeditor');
							Ext.Ajax.request({
								method : 'POST',
								async : false,
								params : {
									code : me.value,
									type : 'SQL'
								},
								url : '/includes/io/EditorFunction.php',
								success : function (response) {
									var me = button.up('codeeditor');
									if (!Custom.IsNullOrEmptyOrZeroString(response.responseText)){
										me.value = (response.responseText || '');
										me.MyCodeEditor.mode = me.mode;
										me.MyCodeEditor.setValue(me.value);
										if (me.curposition){
											me.MyCodeEditor.scrollTo(me.curposition.left,me.curposition.top);   
										}
									}
								},
								failure : function (response) {
									Ext.Msg.alert('Error', response);
								}
							});
						}
					}, {
						itemId : 'CodeType',
						xtype: 'combobox',
						store: sourceTypeStore,
						queryMode: 'local',
						displayField: 'DESCNAME',
						valueField: 'ID',
						listeners:{
							 scope: this,
							 'select':  function (combo, record, index) {
								var me = combo.up('codeeditor');
								var Editor = me.MyCodeEditor.doc.getEditor();
								Editor.setOption("mode", combo.getValue());
							 }
						}
					}
				]
			};
		}
		me.callParent();
	},

	/* assign the event to itself when the object is initialising    */
    onRender: function (ct, position) {
        codeeditor.superclass.onRender.call(this, ct, position);

        var me = this;
		/*
		me.maxHeight = Ext.getBody().getViewSize().height - (me.y + 100);
        if (me.hasOwnProperty('height') == false) {
			me.anchor = '100% 100%';
		}
		*/
		if ((me.hasOwnProperty('height') == false) && (me.hasOwnProperty('anchor')) == false) {
			me.anchor = 'none 100%';
		}

    },
	
	destroy : function () {
		var me = this;

		if (me.MyCodeEditor && me.MyCodeEditor.clear) {
			me.MyCodeEditor.clear();
		}
		me.MyCodeEditor = null;

		me.callParent(arguments);
	},

	getValue : function () {
		var me = this;
		this.text = me.MyCodeEditor.getValue();
		me.curposition = me.MyCodeEditor.getScrollInfo();
		return this.text;
	},

	getSubmitValue : function () {
		var me = this;
		return me.getValue();
	},

	setValue : function (value) {
		var me = this;
		if (Custom.IsNullOrEmptyOrZeroString(me.value)){
			me.value = (value || '');
			me.MyCodeEditor.mode = me.mode;
			me.MyCodeEditor.setValue(me.value);
			if (me.curposition){
				me.MyCodeEditor.scrollTo(me.curposition.left,me.curposition.top);   
			}
		}
	},

	isDirty : function () {
		return this.dirty;
	},

	setDirty : function (dirty) {
		this.dirty = dirty;
		this.fireEvent('dirtychange', dirty);
	},

	onChange : function (value) {
		var me = this;
		if (me.rendered && !me.suspendCodeChange && me.MyCodeEditor) {
			me.MyCodeEditor.setValue((value || ''));
			me.MyCodeEditor.clearHistory();
		}
		me.callParent(arguments);
	},

	setReadOnly : function (readOnly) {
		var me = this;
		readOnly = !!readOnly;
		me[readOnly ? 'addCls' : 'removeCls'](me.readOnlyCls);
		me.readOnly = readOnly;
		if (me.MyCodeEditor) {
			me.MyCodeEditor.setReadOnly(readOnly);
		}
		me.fireEvent('writeablechange', me, readOnly);
	},

	onResize : function () {
		var me = this;
		if (me.MyCodeEditor) {
			if (!me.toolbarHidden) {
				var bbar = me.down('toolbar');
				me.MyCodeEditor.setSize(me.getWidth()-1, me.getHeight()-bbar.getHeight()-5);
			}else{
				me.MyCodeEditor.setSize(me.getWidth()-1, me.getHeight()-8);
			}
		}
	},

	getMimeMode2 : function (mime) {
		var mode = null;
		var mimes = MyCodeEditor.listMIMEs();
		for (var i = 0; i < mimes.length; i++) {
			if (mimes[i].mime == mime) {
				mode = mimes[i].mode;
				if (typeof mode == "object")
					mode = mode.name;
				break;
			}
		}
		return mode;
	},

	getMimeMode : function (tipomime) {
		switch (tipomime) {
		case 'PHTML':
			return 'text/x-php';
			break;
		case 'PHP':
			return 'text/x-php';
			break;
		case 'JSON':
			return 'text/json';
			break;
		case 'JS':
			return 'text/javascript';
			break;
		case 'HTML':
			return 'text/html';
			break;
		case 'CSS':
			return 'text/css';
			break;
		case 'SQL':
			return 'text/x-sql';
			break;
		case 'MYSQL':
			return 'text/x-mysql';
			break;
		case 'MSSQL':
			return 'text/x-mssql';
			break;
		case 'PLSQL':
			return 'text/x-plsql';
			break;
		case 'PGSQL':
			return 'text/x-pgsql';
			break;
		case 'TEXT':
		case 'text/plain':
			break;
		}
	},

	setMode : function (mime) {
		var me = this;
		//var me = this.up('codeeditor');
		me.lineNumbers = true;
		me.matchBrackets = true;
		me.mode = mime;
		me.indentUnit = 4;
		me.indentWithTabs = true;
								
		if (mime == 'php') {
			//me.value = "text/x-php";
		}
	}
});