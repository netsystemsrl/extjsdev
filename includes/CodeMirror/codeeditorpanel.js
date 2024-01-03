Ext.define('codeeditor', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.codeeditor',
	mixins: {
        field: 'Ext.form.field.Base'
    },
    fieldBodyCls: 'extCodeEditor',
	
	//minWidth:700,
	//anchor: '83%',
    focusable: false,
    minHeight: 10,
    minWidth: 10,
    MyCodeEditor: null,
    suspendCodeChange: 0,
	
	config: {
		readOnly: false,
		mode:  'php',
		lineNumbers : true,
		matchBrackets : true,
		indentUnit : 4,
		tabSize: 4,
		indentWithTabs : true,
		toolbarHidden: false,
    },
	bbar:{
		xtype: 'toolbar',
		itemId: 'codetoolbar',
		items:[]
	},
	items: [
	{               
		xtype: 'textarea',
		width: '100%',
		height: '100%',
		listeners: {
			afterrender:function(textarea){
				var me = textarea.up('codeeditor');
				var codeMirrorOptions = {
					value: '',
					gutters: ["CodeMirror-linenumbers", "breakpoints", "CodeMirror-foldgutter"],
					matchBrackets: true,
					mode: me.getMimeMode('php'),
					readOnly: me.readOnly,
					lineNumbers: true,
					indentUnit: 4,
					tabSize: 4,
					lineWrapping: true,
					foldGutter: true,
					indentWithTabs: true,
					smartIndent: true,
					autofocus: true,
					hintOptions: {tables: {
					  users: {name: null, score: null, birthDate: null},
					  countries: {name: null, population: null, size: null}
					}},
	
					extraKeys: {
						"F11"	: function(cm) {
							cm.setOption("fullScreen", !cm.getOption("fullScreen"));
						},
						"Esc"	: function(cm) {
							if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
						},
						"Ctrl-Space" : "autocomplete",
						"Ctrl-R" : "replace",
						"Ctrl-Q": function(cm){ 
							cm.foldCode(cm.getCursor()); 
						},
						"F10": function(cm) {
							var me = this;
							var range = { from: this.editor.getCursor(true), to: this.editor.getCursor(false) };
							cm.autoFormatRange(range.from, range.to)
						},
					}
				};
				me.MyCodeEditor = CodeMirror.fromTextArea(textarea.getEl( ).query('textarea')[0], codeMirrorOptions);
				
				/*DAFARE DEBUG PHP ??		*/
				me.MyCodeEditor.on("gutterClick", function(cm, n) {
					var info = cm.lineInfo(n);
					var marker = null;
					if (info.gutterMarkers){
						 marker = null;
					}else{
						marker = document.createElement("div");
						marker.style.color = "#822";
						marker.innerHTML = "●";
					}
					cm.setGutterMarker(n, "breakpoints", marker);
				});
				// hack to use the extjs eventhandler ;-)
				me.MyCodeEditor.un = me.MyCodeEditor.off;
				me.MyCodeEditor.doAddListener = me.MyCodeEditor.on;
				//me.MyCodeEditor.setSize("100%", me.getHeight()-100);
				
			} 
		}
	}],
	
	/* init component */
	initComponent: function () {
        var me = this;
		if (! me.toolbarHidden) {
			me.bbar = {
				xtype: 'toolbar',
				itemId: 'codetoolbar',
				items:[
					{
						itemId: 'BuilderSQL',
						pressed: false,
						enableToggle:false,
						text: 'Add/Edit SQL',
						iconCls: 'x-fa fa-pencil-square',
						handler:function(button, event) {
							var me = button.up('codeeditor');
							CurrentPanel = me.up('panel');							
							qbWindow.on({
								applySQL: function(vartext) {			
									me.setValue(vartext);
								}
							});
							qbWindow.show();
							qbWindow.setValue(me.getValue());
						}
					},{
						itemId: 'BeautifyJS',
						pressed: false,
						enableToggle:false,
						text: 'BeautifyJS',
						iconCls: 'x-fa fa-magic',
						handler:function(button, event) {
							var me = button.up('codeeditor');
							Ext.Ajax.request({
								method: 'POST',
								async: false,
								params: {code:me.value,
										type:'JSON'
										},
								url: '/includes/io/EditorFunction.php',
								success: function(response) {
									var me = button.up('codeeditor');
									me.setValue(response.responseText);
								},
								failure: function(response) {
									Ext.Msg.alert('Error',response);
								}
							});
						}
					},{
						itemId: 'BeautifySQL',
						pressed: false,
						enableToggle:false,
						text: 'BeautifySQL',
						iconCls: 'x-fa fa-magic',
						handler:function(button, event) {
							var me = button.up('codeeditor');
							Ext.Ajax.request({
								method: 'POST',
								async: false,
								params: {code:me.value,
										type:'SQL'
										},
								url: '/includes/io/EditorFunction.php',
								success: function(response) {
									var me = button.up('codeeditor');
									me.setValue(response.responseText);
								},
								failure: function(response) {
									Ext.Msg.alert('Error',response);
								}
							});
						}
					}
				]
			};
		}
		me.callParent();
    },
	
    destroy: function() {
        var me = this;

        if (me.MyCodeEditor && me.MyCodeEditor.clear) {
            me.MyCodeEditor.clear();
        }
        me.MyCodeEditor = null;

        me.callParent(arguments);
    },

    getValue: function() {
        var me = this;
		this.text = me.MyCodeEditor.getValue();
        return this.text;
    },
	
	getSubmitValue: function(){
        var me = this;
        return me.getValue();
    },
	
    setValue: function(value) {
        var me = this;
        me.value = (value || '');
		me.MyCodeEditor.setValue(me.value);
    },
	
	isDirty : function() {
		return this.dirty;
	},

	setDirty : function(dirty) {
		this.dirty = dirty;
		this.fireEvent('dirtychange', dirty);
	},
	
    onChange: function(value) {
        var me = this;
        if (me.rendered && !me.suspendCodeChange && me.MyCodeEditor) {
            me.MyCodeEditor.setValue((value || ''));
            me.MyCodeEditor.clearHistory();
        }
        me.callParent(arguments);
    },

    setReadOnly: function(readOnly) {
        var me = this;
        readOnly = !!readOnly;
        me[readOnly ? 'addCls' : 'removeCls'](me.readOnlyCls);
        me.readOnly = readOnly;
        if (me.MyCodeEditor) {
            me.MyCodeEditor.setReadOnly(readOnly);
        }
        me.fireEvent('writeablechange', me, readOnly);
    },

    onResize: function() {
        var me = this;
        if (me.MyCodeEditor) {
            me.MyCodeEditor.setSize("100%", me.getHeight());
        }
    },

	getMimeMode2: function(mime){
        var mode = null;
        var mimes = MyCodeEditor.listMIMEs();
        for(var i=0; i<mimes.length; i++){
            if(mimes[i].mime == mime){
                mode = mimes[i].mode;
                if(typeof mode == "object")
                    mode = mode.name;
                break;
            }
        }
        return mode;
    },
    
    getMimeMode: function(tipomime){
		switch(tipomime){
			case 'php':
				return 'application/x-httpd-php';
			break;
			case 'json':
				return 'application/json';
			break;
			case 'js':
				return 'text/javascript';
			break;
			case 'html':
				return 'text/html';
			break;
			case 'css':
				return 'text/css';
			break;
			case 'sql':
				return 'text/x-sql';
			break;
			case 'mysql':
				return 'text/x-mysql';
			break;
			case 'mssql':
				return 'text/x-mssql';
			break;
			case 'plsql':
				return 'text/x-plsql';
			break;
			case 'pgsql':
				return 'text/x-pgsql';
			break;
			case 'text':
				case 'text/plain':
			break;
		}
	},
	
	setMode: function(mime){
        var me = this;
		me.lineNumbers = true;
        me.matchBrackets = true;
        me.mode = me.getMimeMode(mime);
        me.indentUnit = 4;
        me.indentWithTabs = true;
		if (mime == 'php') {me.value = "<?php" + me.value + "?>";}
	}
});

