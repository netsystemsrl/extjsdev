
Ext.define('codemirror', {
	alias: 'widget.codemirror',
    extend: 'Ext.form.field.Base',
    fieldBodyCls: 'extCodeMirror',
	
	listModes: [{
        text: 'PHP',
        mime: 'text/x-php'
    },{
        text: 'JSON',
        mime: 'application/json'
    },{
        text: 'Javascript',
        mime: 'text/javascript'
    },{
        text: 'HTML mixed',
        mime: 'text/html'
    },{
        text: 'CSS',
        mime: 'text/css'
    },{
        text: 'Plain text',
        mime: 'text/plain'
    }],
    Mimemodes: [{
        mime:           ['text/plain'],
        dependencies:   []
    },{
        mime:           ['application/x-httpd-php', 'text/x-php'],
        dependencies:   ['xml/xml.js', 'javascript/javascript.js', 'css/css.js', 'clike/clike.js', 'php/php.js']
    },{
        mime:           ['text/javascript', 'application/json'],
        dependencies:   ['javascript/javascript.js']
    },{
        mime:           ['text/html'],
        dependencies:   ['xml/xml.js', 'javascript/javascript.js', 'css/css.js', 'htmlmixed/htmlmixed.js']
    },{
        mime:           ['text/css'],
        dependencies:   ['css/css.js']
    }],
	
	mode:  'htmlmixed',
	lineNumbers : true,
    matchBrackets : true,
    indentUnit : 4,
    indentWithTabs : true,
	
    fieldSubTpl: [
        '',
        {
            compiled: true,
            disableFormats: true
        }
    ],

    config: {
        codeMirrorConfig: {}
    },
    listeners: {
        render: 'onRenderField',
        resize: 'onResize',
        scope: 'this'
    },

    focusable: false,
    minHeight: 10,
    codeMirror: null,
    suspendCodeChange: 0,

    destroy: function() {
        var me = this;

        if (me.codeMirror && me.codeMirror.clear) {
            me.codeMirror.clear();
        }
        me.codeMirror = null;

        me.callParent(arguments);
    },

    onRenderField: function() {
        var me = this;

        var codeMirror = new CodeMirror(me.bodyEl.dom, Ext.apply({
            value: (me.getValue() || ''),
            readOnly: !!me.readOnly,
            lineNumbers: true,
			extraKeys: {"Ctrl-Space": "autocomplete"},
			matchBrackets: true,
			mode: "text/x-php",
			indentUnit: 4,
			indentWithTabs: true,
            tabSize: 4
        }, me.getCodeMirrorConfig()));

        // hack to use the extjs eventhandler ;-)
        codeMirror.un = codeMirror.off;
        codeMirror.doAddListener = codeMirror.on;
        codeMirror.setSize("120%", me.getHeight());
		/*
		require.config({
		  packages: [{
			name: "codemirror",
			location: "../path/to/codemirror",
			main: "lib/codemirror"
		  }]
		});
		*/
        me.mon(codeMirror, 'change', function() {
            me.suspendCodeChange++;
            me.setValue(codeMirror.getValue());
            me.suspendCodeChange--;
        });
/*
		CodeMirror.commands.autocomplete = function(cm) {
			CodeMirror.showHint(cm, CodeMirror.hint.sql, { 
				tables: {
					"table1": [ "CAMPOA", "CAMPOB", "CAMPOC" ],
					"table2": [ "other_columns1", "other_columns2" ]
				}
			} );
		}
		*/
/*		
		CodeMirror.commands.autocomplete = function(cm) {
			CodeMirror.showHint(cm, CodeMirror.hint.anyword, { 
			  var inner = orig(cm) || {from: cm.getCursor(), to: cm.getCursor(), list: []};
			  inner.list.push("WFOpenForm");
			  inner.list.push("WFOpenReport");
			  inner.list.push("WFOpenPivot");
			  inner.list.push("WFOpenProc");
			  inner.list.push("WFOpenRoute");
			  inner.list.push("WFVALUES");
			  inner.list.push("WFGLOBAL");
			  inner.list.push("WFPROCESS");
			  inner.list.push("WFSQL");
			  return inner;
			} );
		}
		*/
        me.codeMirror = (codeMirror || null);
    },

    getValue: function() {
        var me = this;
        return me.value;
    },
	
	getSubmitValue: function(){
        var me = this;
        return me.getValue();
    },
	
    setValue: function(value) {
        var me = this;

        me.value = value;
        me.checkChange();

        return me;
    },

    onChange: function(value) {
        var me = this;
        if (me.rendered && !me.suspendCodeChange && me.codeMirror) {
            me.codeMirror.setValue((value || ''));
            me.codeMirror.clearHistory();
        }
        me.callParent(arguments);
    },

    setReadOnly: function(readOnly) {
        var me = this;
        readOnly = !!readOnly;
        me[readOnly ? 'addCls' : 'removeCls'](me.readOnlyCls);
        me.readOnly = readOnly;
        if (me.codeMirror) {
            me.codeMirror.setReadOnly(readOnly);
        }
        me.fireEvent('writeablechange', me, readOnly);
    },

    onResize: function() {
        var me = this;
        if (me.codeMirror) {
            me.codeMirror.setSize("100%", me.getHeight());
        }
    },

	getMimeMode2: function(mime){
        var mode = null;
        var mimes = CodeMirror.listMIMEs();
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
				return 'text/x-php';
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
        me.checkChange();
	}
});

Ext.define('VisualCodeMirror', {
    extend: 'Ext.window.Window',
    alias: 'widget.codewindow',
	mixins: ['Ext.form.field.Field'],
    height: 600,
    width: 900,
	text : '',
	fieldLabel : '',
	name: 'VisualCodeMirrorBuilder',
	id: 'VisualCodeMirrorBuilder',
	title: 'Visual Code Mirror Builder',
	config: {
		statusview: 'designer',
    },
    layout: {
        type: 'border'
    },
	listeners:{
		beforeclose:function(win) {
			var VisualCodeMirrorBuilder = Ext.get('VisualCodeMirrorBuilder').component;
			//ux.vqbuilder.sqlSelect.removeAllObj();
			VisualCodeMirrorBuilder.hide();
			return false;
		},
	},
	referenceHolder: true,
    afterRender: function () {
        var me = this;
        me.callParent();
    },
	initComponent: function(){
        var me = this;
		var config = {  
			statusview: 'designer',
		};
		Ext.apply(me, config);
		
		me.items = [
			Ext.apply({
				xtype:      'codemirror',
				name:       'codemirrorsource',
				id:       	'codemirrorsource',
				mode:       'application/x-httpd-php'}
				),	
		];
		
		// add toolbar to the dockedItems
        me.dockedItems = [{
            xtype: 'toolbar',
            dock: 'top',
            items: [
			{
                text: "Save",
                icon: "/assets/images/icon-save.gif",
				xtype: 'button',
				id: 'SaveSOURCEButton',
				listeners: {click: function() {	
					var me = this;
					var sqlQutputPanel = Ext.getCmp('SOURCEOutputPanel');
					var VisualCodeMirrorBuilder = Ext.get('VisualCodeMirrorBuilder').component;
					VisualCodeMirrorBuilder.hide();
					VisualCodeMirrorBuilder.fireEvent('applySOURCE',codemirrorsource.getValue);
					me.fireEvent('applySOURCE',codemirrorsource.getValue);
					},
				}
            }, {
                text: "Run/Design",
                icon: "/assets/images/run.png",
				xtype: 'button',
				id: 'RunSourceButton',
				listeners: {click: function() {	
					var subpanelnorth = Ext.getCmp('subpanelnorth');
					var subpanelsqlnorth = Ext.getCmp('subpanelsqlnorth');
					var VisualCodeMirrorBuilder = Ext.get('VisualCodeMirrorBuilder').component;
					if (VisualCodeMirrorBuilder.statusview == 'designer') {
						//metti in visualizzazione SQL
						subpanelnorth.hide();
						subpanelsqlnorth.setDisabled(true);
						//subpanelsqlnorth.store.removeAll();
						var DS_VisualSQLQueryTest = Ext.data.StoreManager.get('DS_VisualSQLQueryTest' );
						var sqlQutputPanel = Ext.getCmp('SQLOutputPanel');
						console.log('load sql test' + sqlQutputPanel.sqltext);
						DS_VisualSQLQueryTest.reload({params: { datasourcetype:'SELECT', datasource: sqlQutputPanel.sqltext, start: 1, limit: 100, datawhere: '' },});
						subpanelsqlnorth.show();
						subpanelsqlnorth.setDisabled(false);
						VisualCodeMirrorBuilder.statusview = 'sqltest'
					} else {
						//metti in visualizzazione Designer
						subpanelnorth.show();
						subpanelsqlnorth.hide();
						VisualCodeMirrorBuilder.statusview = 'designer'
					}
					subpanelnorth.updateLayout();
					},
				}
            }, {
                xtype: 'tbfill'
            }, 
			]
        }];
        
        // apply to the initialConfig
        Ext.apply(me.initialConfig, me);
		
        me.callParent(arguments);
    },
	getSubmitData: function () {
		var me = this;
        var sqlQutputPanel = Ext.getCmp('SQLOutputPanel');
        return sqlQutputPanel.sqltext;
    },
	setValue : function(value){
		var me = this;
		var codemirrorsource = Ext.getCmp('codemirrorsource');
        if (value == null) {
            return;
        } else {
			// apply to the initialConfig
			//codemirrorsource.mode =  'text/x-php';
			//codemirrorsource.setMode("php");
			//Ext.apply(this, this.initialConfig);
			codemirrorsource.setMode("text");
			codemirrorsource.setValue(value);
			//ux.vqbuilder.sqlSelect.setSQL(value);
        }
	},
	setMode: function(value){
		var me = this;
		var codemirrorsource = Ext.getCmp('codemirrorsource');
		if (value == null) {
            return;
        } else {
			// apply to the initialConfig
			//codemirrorsource.mode =  'text/x-php';
			//codemirrorsource.setMode("php");
			//Ext.apply(this, this.initialConfig);
			codemirrorsource.setMode(value);
			//ux.vqbuilder.sqlSelect.setSQL(value);
        }
	},
	getInputId: function () {
        return null;
    },
	getValue: function () {
        var me = this;
        //var sqlQutputPanel = Ext.getCmp('SQLOutputPanel');
        //return sqlQutputPanel.sqltext;
    },
	});