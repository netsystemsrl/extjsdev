Ext.override(Ext.data.Store,{
  addField: function(field){
    field = new Ext.data.Field(field);
    this.recordType.prototype.fields.replace(field);
    if(typeof field.defaultValue != 'undefined'){
      this.each(function(r){
        if(typeof r.data[field.name] == 'undefined'){
          r.data[field.name] = field.defaultValue;
        }
      });
    }
    delete this.reader.ef;
    this.reader.buildExtractors();
  },
  removeField: function(name){
    this.recordType.prototype.fields.removeKey(name);
    this.each(function(r){
      delete r.data[name];
      if(r.modified){
        delete r.modified[name];
      }
    });
    delete this.reader.ef;
    this.reader.buildExtractors();
  }
});
Ext.override(Ext.grid.ColumnModel,{
	addColumn: function(column, colIndex){
		if(typeof column == 'string'){
			column = {header: column, dataIndex: column};
		}
		var config = this.config;
		this.config = [];
		if(typeof colIndex == 'number'){
			config.splice(colIndex, 0, column);
		}else{
			colIndex = config.push(column);
		}
		this.setConfig(config);
		return colIndex;
	},
	removeColumn: function(colIndex){
		var config = this.config;
		this.config = [config[colIndex]];
		config.splice(colIndex, 1);
		this.setConfig(config);
	}
});
Ext.override(Ext.grid.GridPanel,{
	addColumn: function(field, column, colIndex){
		if(!column){
			if(field.dataIndex){
				column = field;
				field = field.dataIndex;
			} else{
				column = field.name || field;
			}
		}
		this.store.addField(field);
		return this.colModel.addColumn(column, colIndex);
	},
	removeColumn: function(name, colIndex){
		this.store.removeField(name);
		if(typeof colIndex != 'number'){
			colIndex = this.colModel.findColumnIndex(name);
		}
		if(colIndex >= 0){
			this.colModel.removeColumn(colIndex);
		}
	}
});

Ext.namespace('Ext.ux.QueryBuilder');

/****************************************************
 * Query Builder class.
 * 
 * Author: Surinder singh http://www.sencha.com/forum/member.php?75710-Surinder-singh, surinder83singh@gmail.com
 * @class Ext.ux.QueryBuilder
 ************************************************/
Ext.ux.QueryBuilder = function(config){
	Ext.apply( this, config );
	config.plain 		= true;
	config.layout		= 'border';	
	
	this.treePanel =  new Ext.tree.TreePanel({
        useArrows		: true,
        autoScroll		: true,
        animate			: true,
        enableDD		: false,
        containerScroll	: true,
        border			: false,
		rootVisible		: false,
		queryBuilder	: this,
        dataUrl			: config.treeDataUrl? config.treeDataUrl : '',
		listeners:{
			click:function( node ){				
				if( node.attributes.json ){
					this.queryBuilder.selectedNode = node;					
					var rowsArray = eval( node.attributes.json );
					this.queryBuilder.queryBuilderForm.loadSavedForm( rowsArray );
				}else{
					node.toggle();	
				}
			}
		},
        root: {
            nodeType	: 'async',
            draggable	: false,
            id			: 'Root'
        }
    });
	this.queryBuilderForm 		= new Ext.ux.QueryBuilderForm({
		fieldStoreUrl: config.fieldStoreUrl? config.fieldStoreUrl : '', 
		multipleValuesStoreUrl: config.multipleValuesStoreUrl? config.multipleValuesStoreUrl : '',
		listeners: {
			scope		: this,
			setRowState	: this.updateRecordCountLabel	
		}
	});
	this.hiddenFieldJson	 	= new Ext.form.Hidden({
		value	: '',
		name	: 'json'
	});
	this.hiddenFieldQueryId	 	= new Ext.form.Hidden({
		value	: 0,
		name	: 'id'
	});
	this.hiddenFieldFilter	 	= new Ext.form.Hidden({
		value	: 0,
		name	: 'filter'
	});
	this.fieldTitle	 			= new Ext.form.TextField({
		xtype		: 'textfield',
		fieldLabel	: 'Title',
		name		: 'title',
		width		: 150
	});
	this.fieldParentComboStore = new Ext.data.Store({       
		url: this.parentNodesComboStoreUrl? this.parentNodesComboStoreUrl: '',
		autoLoad:true,
		reader: new Ext.data.JsonReader({
			root: 'data',
			totalProperty: 'total',
			id: 'id'
		},[
			{name: 'id', type:'string'},
			{name: 'text', type:'string'}
		 ])
	});
	
	this.fieldParent		 	= new Ext.form.ComboBox({
		allowBlank: false,
		store: this.fieldParentComboStore,
		displayField	: 'text',
		valueField		: 'id',
		typeAhead		: true,
		width			: 150,
		mode			: 'local',
		forceSelection	: true,
		triggerAction	: 'all',
		selectOnFocus	: true,				
		fieldLabel		: 'Parent',
		hiddenField		: 'parent',
		name			: 'parent'
	});
	this.queryBuilderFormWindow = new Ext.ux.QueryBuilderFormWindow({
		renderTo		: document.body,
		idField			: this.hiddenFieldQueryId,
		queryBuilder	: this,
		filePath		: this.filePath,
		querySaveUrl	: config.querySaveUrl? config.querySaveUrl : '', 
		formDetails		: {
			layout			: 'form',
			labelWidth		: 50,
			border			: false,
			bodyStyle		: {'padding':'5px', 'background-color':'#F5F5F5'},
			items			: [ this.fieldParent, this.fieldTitle, this.hiddenFieldJson, this.hiddenFieldQueryId, this.hiddenFieldFilter ]
		},
		listeners: {
			save: function( form, id ){
				var title 		= this.queryBuilder.fieldTitle.getValue();
				var json 		= this.queryBuilder.hiddenFieldJson.getValue();
				var parentId 	= this.queryBuilder.fieldParent.getValue();
				
				if( this.queryBuilder.selectedNode && this.queryBuilder.selectedNode.id == id ){//update old record
					this.queryBuilder.selectedNode.setText( title );
					this.queryBuilder.selectedNode.attributes.json = json;
					//check if  parent have been changed
					if( parentId != this.queryBuilder.selectedNode.parentNode.id ){
						//remove the node from old parentNode
						this.queryBuilder.selectedNode.remove();
						var parentNode = this.queryBuilder.treePanel.getNodeById( parentId );						
						if( parentNode ){
							this.queryBuilder.selectedNode = parentNode.appendChild({text:title, json:json, id:id, leaf:true});
						}
					}					
				}else{//add new node
					var parentNode = this.queryBuilder.treePanel.getNodeById( parentId );
					if( parentNode ){
						this.queryBuilder.selectedNode = parentNode.appendChild({text:title, json:json, id:id, leaf:true});
					}
				}
			}	
		}
	}); 
	this.recordCountLabel = new Ext.Toolbar.TextItem({
		text: '# Records'
	});
	config.items=[{
		region		: 'west',
		split		: true,
		collapsible	: true,
		title		: 'Queries',
		minSize		: 100,
		maxSize		: 300,
		width		: 150,
		autoScroll	: true,
		items		: this.treePanel
	},{
		region		: 'center',
		title		: 'Builder',
		minSize		: 375,
		autoScroll	: true,
		bbar: [this.recordCountLabel, '->', {
				text: 'New',
				icon : this.filePath+'images/icons/new.png',
				scope: this, 
				handler: function(){
					this.selectedNode = null;
					this.hiddenFieldQueryId.setValue( 0 );
					this.fieldTitle.setValue( '' );
					this.hiddenFieldJson.setValue( '' );
					this.hiddenFieldFilter.setValue( '' );
					this.queryBuilderForm.loadSavedForm( [] )
				}
			},{
				text:'Run',
				icon : this.filePath+'images/icons/run.png',
				scope: this, 
				handler: function(){					
					var filter	= this.getFilter();
					this.addRemoveAdditionalFields();//added for additional fields , v-1.3
					this.fireEvent('run', { filter: filter } );
					if( this.hideOnRun ){
						this.hide();	
					}
				}
			},{
				text	: 'Save',
				icon 	: this.filePath+'images/icons/save.png',
				scope	: this, 
				handler	: function( button ){
					var isValid = this.queryBuilderForm.validateQueryForm();
					if( isValid ){
						this.queryBuilderFormWindow.show(button.getEl(), false);
						
						/*Set the field values */
						var filter 	= this.getFilter();
						var json  	= Ext.encode( this.queryBuilderForm.rowStates );
						this.hiddenFieldJson.setValue( json );
						this.hiddenFieldFilter.setValue( filter );
						if( this.selectedNode ){
							this.hiddenFieldQueryId.setValue( this.selectedNode.id );					
							this.fieldTitle.setValue( this.selectedNode.text );
							this.fieldParent.setValue( this.selectedNode.parentNode.id );
						} 
					}else{
						Ext.MessageBox.alert( 'Error', 'Error in form. Please correct the invalid fields' );	
					}
				}
			},{
				text	: 'Clear All',
				icon 	: this.filePath+'images/icons/clearAll.png',
				scope	: this, 
				handler	: function(){
					this.queryBuilderForm.loadSavedForm( [] );	
				}
			}
		],
		items: this.queryBuilderForm
	}];
	Ext.ux.QueryBuilder.superclass.constructor.call(this, config);
	this.addEvents( 'save', 'run' );
};

Ext.extend(Ext.ux.QueryBuilder, Ext.Window, {
	closeAction		: 'hide',
	hideOnRun		: true,
	filePath		: 'ext/ux/queryBuilder/',
	addRemoveAdditionalFields: function(){//add-remove the additional fields required for current query
		if(this.grid){
			var grid				= this.grid;
			var additionalFields 	= this.queryBuilderForm.additionalFields;
			var cm 					= this.grid.getColumnModel();
			var cols 				= cm.config;
			var i					= 0;
			for(i=0; i<10;i++){
				Ext.each(cols, function(col, colindex) {
					if (col && col.mandatory===false) {						
						grid.removeColumn(col.dataIndex);
						grid.getView().refresh( true );
					}
				});
			}
			var added		= [];
			Ext.each(additionalFields, function(field){
				//console.dir(field);
				if(added.indexOf(field.dataIndex)<0){
					added.push(field.dataIndex);
					grid.addColumn({name: field.dataIndex, defaultValue:  field.defaultValue?field.defaultValue:''}, {mandatory:false, header: field.name?field.name:field.dataIndex, dataIndex: field.dataIndex});
				}
			});
			
		}
	},
	showRecordCount : function(result){
		var count = result.responseText;
		
		this.recordCountLabel.removeClass('loading-indicator');
		if( count >1 ){
			this.recordCountLabel.setText(count+" Records");
		}else if(count==1){
			this.recordCountLabel.setText(count+" Record");
		}else{
			this.recordCountLabel.setText("No Record");
		}
	},
	updateRecordCountLabel	: function(){
		this.recordCountLabel.setText("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
		this.recordCountLabel.addClass('loading-indicator');
		
		Ext.Ajax.request({
			url: this.countRecordUrl,
			success: this.showRecordCount,
			params: { filter: this.getFilter()  },
			scope: this
		});
	},
	getFilter 		: function(){
		return  this.queryBuilderForm.generateSqlFilter();		
	}
});


//------------------------------------------------------------------

Ext.ux.QueryBuilderForm = function(config){
	config = config? config: {};
	Ext.apply(this, config);
	var queryBuilderForm = this;
	this.fieldNameComboStore = new Ext.data.Store({       
		url: this.fieldStoreUrl? this.fieldStoreUrl: '',
		autoLoad:true,
		reader: new Ext.data.JsonReader({
			root: 'fields',
			totalProperty: 'total',
			id: 'columnName'
		},[
			{name: 'id', type:'string'},
			{name: 'columnName', type:'string'},
			{name: 'columnAlias', type:'string'},
			{name: 'dataType', type:'string'},
			{name: 'valueType', type:'string'},
			{name: 'table', type:'string'},
			{name: 'condition', type:'string'},
			{name: 'multipleValues', type:'string'},
			{name: 'multipleValues2', type:'string'},
			{name: 'additionalFields', type:'string'}
		 ]),
		
		listeners: {
			load: function( store , records, options ){
				if( !queryBuilderForm.multipleValuesStoreLoaded ){
					queryBuilderForm.multipleValuesStores 		= {};
					queryBuilderForm.multipleValuesStores2 		= {};
					queryBuilderForm.multipleValuesStoreLoaded 	= true;
					Ext.each(records, function( record ){
						if( record.get( 'valueType' ) == 'multiple' ){
							if(record.get( 'multipleValues' ).trim()=='[calendar]'){
								queryBuilderForm.multipleValuesStores[ record.get( 'columnName' ) ] = '[calendar]';
							}else{
								queryBuilderForm.multipleValuesStores[ record.get( 'columnName' ) ] = queryBuilderForm.getMultipleValuesStore(record.get( 'multipleValues' ), record.get( 'table' ));
							}
							if(record.get( 'multipleValues2' ).trim()!=''){
								queryBuilderForm.multipleValuesStores2[ record.get( 'columnName' ) ] = queryBuilderForm.getMultipleValuesStore(record.get( 'multipleValues2' ), record.get( 'table' ));
							}else{
								queryBuilderForm.multipleValuesStores2[ record.get( 'columnName' ) ] = false;
							}							
						}
					});					
				}
			}	
		}
	});
	config.id 	= this.id = Ext.id();

	config.rowTemplate = new Ext.Template(
		'<tr id = "'+ this.id+'_queryBuilderFormFieldRow{rowID}">',
			'<td>',
				'<div style="display:inline;width:30px" id="'+ this.id+'_removeBox{rowID}"></div>',
			'</td>',
			'<td>',
				'<div style="display:inline" id="'+ this.id+'_andOr{rowID}"></div>',
			'</td>',
			'<td>',
				'<div style="display:inline" id="'+ this.id+'_fieldNameBox{rowID}"></div>',
			'</td>',
			'<td>',
				'<div style="display:inline" id="'+ this.id+'_valueBox2{rowID}"></div>',
			'</td>',
			'<td>',
				'<div style="display:inline" id="'+ this.id+'_operatorBox{rowID}"></div>',
			'</td>',
			'<td>',
				'<div style="display:inline" id="'+ this.id+'_valueBox{rowID}" ></div>',
			'</td>',
		'</tr>'
	  );
	 config.betweenBoxTemplate = new Ext.Template(
		'<table cellspacing="0" id="'+ this.id+'_betweenBox{rowID}">',
			'<tr>',
				'<td>',
					'<div style="display:inline" id="'+ this.id+'_betweenValueBox1_{rowID}"></div>',
				'</td>',
				'<td>',
					'<div><span>&nbsp;{betweenText}&nbsp;</span></div>',
				'</td>',
				'<td>',
					'<div style="display:inline" id="'+ this.id+'_betweenValueBox2_{rowID}" ></div>',
				'</td>',
			'</tr>',
		'</table>'
	);
	config.autoKey=0;
	config.rowStates = [ {rowID: 1, andOr:'', columnName:'', columnDataType:'', operatorText:'', operatorTemplate:'', entryValues:[], extraFields:[], tableName:'', condition:'', columnValueType:'', multipleValues:'' ,  multipleValues2:'' } ];
	config.items = {
		queryBuilderForm: this,
		border: false,
		html: '<div style="padding: 10px;"><table cellspacing="3"><tbody id="'+ this.id+'_FilterContainer"></tbody></table></div>',
		listeners: {
			afterrender: function(){
				this.queryBuilderForm.init();
			}
		}
	};
	Ext.ux.QueryBuilderForm.superclass.constructor.call(this, config);
	this.addEvents('setRowState');
};
 
Ext.extend(Ext.ux.QueryBuilderForm, Ext.Panel, {
	border		: false,
	autoKey		: 0,	
	operators  	: {
		defaults : [
			['equals', '= {0}'],
			['not equal', '!= {0}'],
			['greater than', '> {0}'],
			['greater than or equals ', '>= {0}'],
			['less than', '< {0}'],
			['less than or equals', '<= {0}'],
			['in', 'in ({0})'],
			['between', "BETWEEN {0} AND {1}"]
		],
		Boolean : [
			['is', '= {0}']
		],
		String : [
			['equals', "LIKE '{0}'"],
			['not equal', "!= '{0}'"],
			['begins with', "LIKE '{0}%'"],
			['ends with', "LIKE '%{0}'"],
			['contains', "LIKE '%{0}%'"], 
			['in', 'in ({0})']
		],
		Number : [
			['=', "= {0}"],
			['<=', "<= {0}"],
			['>=', ">= {0}"],
			['<', "< {0}"],
			['>', "> {0}"]
		],
		Date : [
			['on', "= '{0}'"],
			['not on', "!= '{0}'"],
			['after', "> '{0}'"],
			['on or after', ">= '{0}'"],
			['before ', "< '{0}'"],
			['on or before', "<= '{0}'"],
			['between', "BETWEEN '{0}' AND '{1}'"]
		],
		multiple : [
			['equals', "= '{0}'"],
			['not equal', "!= '{0}'"]
		]
	},
	getMultipleValuesStore:function(multipleValues, table){
		if(multipleValues.indexOf('[')===0 ){
			return new Ext.data.ArrayStore({
				data:Ext.decode( multipleValues ),									
				// reader configs
				idIndex: 0,  
				fields: ['id', 'title']
			});
		}else{
			return new Ext.data.Store({       
				url: this.multipleValuesStoreUrl? this.multipleValuesStoreUrl: '',
				baseParams: {multipleValues: multipleValues, table: table},
				autoLoad:true,
				reader: new Ext.data.JsonReader({
					root: 'data',
					totalProperty: 'total',
					id: 'id'
				},[
					{name: 'id', type:'string'},
					{name: 'title', type:'string'}
				 ])
			});	
		}
	},
	getNewKey	: function(){
		this.autoKey++; 
		return this.autoKey; 
	},
	addRemoveSecondEntryField: function(dataType, rowID){//Add/Remove the a single entry field (Second data selection field)
		var indx 		= this.getRowStateIndex( rowID );
		var rowState 	= this.rowStates[indx];
		//remove the old field
		var oldField 	= Ext.getCmp( this.id+'_searchValue2TextField'+rowID );
		if(oldField){
			oldField.destroy();	
		}
		if( rowState.columnValueType == 'multiple' && this.multipleValuesStores2[ rowState.columnName ] ){			
			new Ext.form.ComboBox({
				id: this.id+'_searchValue2TextField'+ rowID,
				allowBlank: false,
				store: this.multipleValuesStores2[ rowState.columnName ],
				displayField: 'title',
				valueField: 'id',
				typeAhead: true,
				width: 250,
				mode: 'local',
				forceSelection: true,
				triggerAction: 'all',
				selectOnFocus: true,
				queryBuilderFieldForm: this,
				queryBuilderField: true,
				rowID:rowID,
				formID:this.id,
				listeners: { 
					blur: function(thisField){
						var textField = Ext.getCmp(this.formID+'_searchValueTextField'+this.rowID);
						var textField1 = Ext.getCmp(this.formID+'_searchValueTextField1_'+this.rowID);
						var textField2 = Ext.getCmp(this.formID+'_searchValueTextField2_'+this.rowID);
						var values = [];
						if(textField){//if operator is not "between"
							values.push(textField.getValue());							
						}else{//if operator is "between"
							values.push(textField1.getValue());	
							values.push(textField2.getValue());	
						}
						this.queryBuilderFieldForm.setRowStateValue( this.rowID, values, [this.getValue()] );
					}
				},
				renderTo: this.id+'_valueBox2'+rowID
			});
		}
	},
	addNewEntryField: function(dataType, rowID){//Adds a single entry field
		var indx 		= this.getRowStateIndex( rowID );
		var rowState 	= this.rowStates[indx];
		if( rowState.columnValueType == 'multiple' ){
			if(this.multipleValuesStores[ rowState.columnName ]=='[calendar]'){
				new Ext.form.DateField({
					id: this.id+'_searchValueTextField'+ rowID,
					allowBlank: false,					
					queryBuilderFieldForm: this,
					queryBuilderField: true,
					rowID:rowID,
					width: 100,
					format:'Y-m-d',
					listeners: { 
						blur: function(thisField){
							var rowID = this.rowID;
							this.queryBuilderFieldForm.setRowStateValue( rowID, [this.getValue().format("Y-m-d")] );
						}
					},
					renderTo: this.id+'_valueBox'+rowID
				});
			}else{
				new Ext.form.ComboBox({
					id: this.id+'_searchValueTextField'+ rowID,
					allowBlank: false,
					store: this.multipleValuesStores[ rowState.columnName ],
					displayField: 'title',
					valueField: 'id',
					typeAhead: true,
					width: 225,
					mode: 'local',
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: true,
					queryBuilderFieldForm: this,
					queryBuilderField: true,
					rowID:rowID,
					listeners: { 
						blur: function(thisField){
							var rowID = this.rowID;
							this.queryBuilderFieldForm.setRowStateValue( rowID, [this.getValue()] );
						}
					},
					renderTo: this.id+'_valueBox'+rowID
				});
			}
		}else{
			switch(dataType){
				case 'number':
					new Ext.form.NumberField({
						id:this.id+'_searchValueTextField'+ rowID,
						width: 125,
						renderTo: this.id+'_valueBox'+rowID,
						queryBuilderFieldForm: this,
						queryBuilderField: true,
						rowID:rowID,
						listeners:{
							blur: function(thisField){
								var rowID = this.rowID;
								this.queryBuilderFieldForm.setRowStateValue( rowID, [ this.getValue() ] );
							}
						},
						allowBlank: false
					});
				break;
				case 'date':
					new Ext.form.DateField({
						id:this.id+'_searchValueTextField'+ rowID,
						width: 125,
						renderTo: this.id+'_valueBox'+rowID,
						queryBuilderFieldForm: this,
						queryBuilderField: true,
						rowID:rowID,
						listeners:{
							blur: function(thisField){
								var rowID = this.rowID;
								this.queryBuilderFieldForm.setRowStateValue( rowID, [this.getRawValue()] );
							}
						},
						allowBlank: false
					});
				break;
				case 'boolean':
					new Ext.form.ComboBox({
						id: this.id+'_searchValueTextField'+ rowID,
						allowBlank: false,
						store: new Ext.data.SimpleStore({
							fields: [
							{name: 'txt'},
							{name: 'val'}
							],
							data: [['True','1'], ['False', '0']]
						}),
						displayField: 'txt',
						valueField: 'val',
						typeAhead: true,
						width: 75,
						mode: 'local',
						forceSelection: true,
						triggerAction: 'all',
						selectOnFocus: true,
						queryBuilderFieldForm: this,
						queryBuilderField: true,
						rowID:rowID,
						listeners:{
							blur: function(thisField){
								var rowID = this.rowID;
								this.queryBuilderFieldForm.setRowStateValue( rowID, [ this.getValue() ] );
							}
						},
						renderTo: this.id+'_valueBox'+rowID
					});
				break;
				default:
					new Ext.form.TextField({
						id: this.id+'_searchValueTextField'+ rowID,
						allowBlank: false,
						width: 125,
						queryBuilderFieldForm: this,
						queryBuilderField: true,
						rowID:rowID,
						listeners: {
							blur: function( thisField ){
								var rowID = this.rowID;
								this.queryBuilderFieldForm.setRowStateValue( rowID, [ this.getValue() ] );
							}
						},
						renderTo: this.id+'_valueBox'+rowID
					});
				break;
			}
		}
	},
	addNewEntryField2: function(dataType, rowID, betweenText){ //Adds two entry fields
		this.betweenBoxTemplate.append( this.id+'_valueBox' + rowID, {'rowID': rowID, 'betweenText': betweenText} );
		var indx 		= this.getRowStateIndex( rowID );
		var rowState 	= this.rowStates[indx];
		if( rowState.columnValueType == 'multiple' ){
			if(this.multipleValuesStores[ rowState.columnName ]=='[calendar]'){
				new Ext.form.DateField({
					id: this.id+'_searchValueTextField1_'+ rowID,
					allowBlank: false,					
					queryBuilderFieldForm: this,
					queryBuilderField: true,
					rowID:rowID,
					format:'Y-m-d',
					width: 100,
					listeners: { 
						blur: function(thisField){
							var rowID = this.rowID;
							this.queryBuilderFieldForm.setRowStateValue( rowID, [this.getValue().format("Y-m-d")] );
						}
					},
					renderTo: this.id+'_betweenValueBox1_'+rowID
				});
				new Ext.form.DateField({
					id: this.id+'_searchValueTextField2_'+ rowID,
					allowBlank: false,					
					queryBuilderFieldForm: this,
					queryBuilderField: true,
					rowID:rowID,
					format:'Y-m-d',
					width: 100,
					listeners: { 
						blur: function(thisField){
							var rowID = this.rowID;
							this.queryBuilderFieldForm.setRowStateValue(rowID, [Ext.getCmp( this.queryBuilderFieldForm.id+'_searchValueTextField1_'+ rowID).getValue().format("Y-m-d"), this.getValue().format("Y-m-d")]);
						}
					},
					renderTo: this.id+'_betweenValueBox2_'+rowID
				});
			}else{			
				new Ext.form.ComboBox({
					id: this.id+'_searchValueTextField1_'+ rowID,
					allowBlank: false,
					store: this.multipleValuesStores[ rowState.columnName ],
					displayField: 'title',
					valueField: 'id',
					typeAhead: true,
					width: 100,
					mode: 'local',
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: true,
					queryBuilderFieldForm: this,
					queryBuilderField: true,
					renderTo: this.id+'_betweenValueBox1_'+rowID
				});
				new Ext.form.ComboBox({
					id: this.id+'_searchValueTextField2_'+ rowID,
					allowBlank: false,
					store: this.multipleValuesStores[ rowState.columnName ],
					displayField: 'title',
					valueField: 'id',
					typeAhead: true,
					width: 100,
					mode: 'local',
					forceSelection: true,
					triggerAction: 'all',
					selectOnFocus: true,
					queryBuilderFieldForm: this,
					queryBuilderField: true,
					renderTo: this.id+'_betweenValueBox2_'+rowID,
					rowID:rowID,
					listeners:{
						blur : function(thisField){
							var rowID = this.rowID;
							this.queryBuilderFieldForm.setRowStateValue(rowID, [Ext.getCmp( this.queryBuilderFieldForm.id+'_searchValueTextField1_'+ rowID).getValue(), this.getValue()]);
						}
					}
				});
			}
		}else{
			switch(dataType){
				case 'number':
					new Ext.form.NumberField({
						id:this.id+'_searchValueTextField1_'+ rowID,
						width: 125,
						allowBlank: false,
						queryBuilderField:true,
						renderTo: this.id+'_betweenValueBox1_'+ rowID
					});
					new Ext.form.NumberField({
						id:this.id+'_searchValueTextField2_'+ rowID,
						width: 125,
						allowBlank: false,
						queryBuilderFieldForm:this,
						queryBuilderField:true,
						rowID:rowID,
						listeners:{
							blur : function(thisField){
								var rowID = this.rowID;
								this.queryBuilderFieldForm.setRowStateValue(rowID, [Ext.getCmp( this.queryBuilderFieldForm.id+'_searchValueTextField1_'+ rowID).getValue(), this.getValue()]);
							}
						},
						renderTo: this.id+'_betweenValueBox2_'+rowID
					});
				break;
				case 'date':
					new Ext.form.DateField({
						id:this.id+'_searchValueTextField1_'+ rowID,
						width: 125,
						allowBlank: false,
						queryBuilderField:true,
						renderTo:this.id+'_betweenValueBox1_'+rowID
					});
					new Ext.form.DateField({
						id:this.id+'_searchValueTextField2_'+ rowID,
						width: 125,
						allowBlank: false,
						queryBuilderFieldForm: this,
						queryBuilderField:true,
						rowID:rowID,
						listeners:{
							blur: function(thisField){
								var rowID = this.rowID;
								this.queryBuilderFieldForm.setRowStateValue(rowID, [Ext.getCmp( this.queryBuilderFieldForm.id+'_searchValueTextField1_'+ rowID).getRawValue(), this.getRawValue()]);
							}
						},
						renderTo: this.id+'_betweenValueBox2_'+rowID
					});
				break;
				default:
					new Ext.form.TextField({
						id:this.id+'_searchValueTextField1_'+ rowID,
						width: 125,
						allowBlank: false,
						queryBuilderField:true,
						renderTo: this.id+'_betweenValueBox1_'+ rowID
					});
					new Ext.form.TextField({
						id:this.id+'_searchValueTextField2_'+ rowID,
						width: 125,
						allowBlank: false,
						queryBuilderFieldForm:this,
						queryBuilderField:true,
						rowID:rowID,
						listeners:{
							blur: function(thisField){
								var rowID = this.rowID;
								this.queryBuilderFieldForm.setRowStateValue(rowID, [Ext.getCmp(this.queryBuilderFieldForm.id+'_searchValueTextField1_'+ rowID).getValue(), this.getValue()]);
							}
						},
						renderTo: this.id+'_betweenValueBox2_'+rowID
					});
				break;
			}
		}
	},
	addNewRow: function(){
		this.getNewKey();
		if(this.autoKey != 1){
			this.rowStates.push({rowID: this.autoKey, andOr:'', columnName:'', columnDataType:'', operatorText:'', operatorTemplate:'', columnValueType:'', tableName:'', multipleValues:'', multipleValues2:''})
		};
		
		this.rowTemplate.append( this.id+'_FilterContainer', {rowID: this.autoKey} );
		
		if(this.autoKey == 1){
			new Ext.Button({
				id: this.id+'_addRowButton' + this.autoKey,
				cls: 'addBtn',
				tooltip:'Add new row',
				text:'<b style="font-size:15px"> + </b>',
				renderTo: this.id+'_removeBox'+ this.autoKey,
				queryBuilderFieldForm: this,
				handler: function(){
					this.queryBuilderFieldForm.addNewRow();
				}
			});
			Ext.get( this.id+'_andOr' + this.autoKey ).hide();
		}else{
			new Ext.Button({
				id: this.id+'_removeRowButton' + this.autoKey,
				cls: 'removeBtn',
				tooltip:'Delete row',
				text: '<b style="font-size:15px"> X </b>',
				renderTo: this.id+'_removeBox'+ this.autoKey,
				queryBuilderFieldForm:this,
				rowID:this.autoKey,
				handler: function(){
					var rowID = this.rowID;
					this.queryBuilderFieldForm.removeRow( rowID );
				}
			});
		
			new Ext.form.ComboBox({
				id: this.id+'_andOrCombo'+ this.autoKey,
				store: new Ext.data.SimpleStore({
					fields: [
					  {name: 'val'}
					],
					data: [['And'], ['Or']]
				}),
				displayField: 'val',
				valueField: 'val',
				typeAhead: true,
				width: 50,
				mode: 'local',
				forceSelection: true,
				triggerAction: 'all',
				value: 'And',
				selectOnFocus:true,
				allowBlank: false,
				queryBuilderField:true,
				queryBuilderFieldForm: this,
				hiddenName:this.id+'_andOrCombo',
				renderTo: this.id+'_andOr'+ this.autoKey,
				rowID:this.autoKey,
				listeners: {
					change: function(){
						//get the rowID by extracting it from the current component id.
						var rowID = this.rowID;
						//update the state for this row
						var indx = this.queryBuilderFieldForm.getRowStateIndex( rowID );
						this.queryBuilderFieldForm.rowStates[indx].andOr 	=  this.getValue();
					}
				}
			});
		};	  
		 
		new Ext.form.ComboBox({
			id: this.id+'_fieldNameCombo'+ this.autoKey,
			name: 'columnName',
			hiddenName:'columnName',
			xtype:'combo',				
			displayField:'columnAlias',
			valueField: 'columnName',
			triggerAction: 'all',		
			typeAhead: false,				
			mode:'local',	
			hideTrigger:false,
			allowBlank: false,
			queryBuilderField: true,
			queryBuilderFieldForm: this,
			emptyText: 'Select search field',
			renderTo: this.id+'_fieldNameBox'+ this.autoKey,
			store: this.fieldNameComboStore,
			rowID:this.autoKey,
			formID:this.id,
			listeners: {
				change: function(thisField,newVal,oldVal){
					//get the rowID by extracting it from the current component id.
					var rowID = this.rowID;
					//update the state for this row
					var indx = this.queryBuilderFieldForm.getRowStateIndex( rowID );
					this.queryBuilderFieldForm.rowStates[indx].columnDataType 	= this.store.getById( this.getValue() ).get('dataType');
					this.queryBuilderFieldForm.rowStates[indx].columnValueType 	= this.store.getById( this.getValue() ).get('valueType');
					this.queryBuilderFieldForm.rowStates[indx].multipleValues 	= this.store.getById( this.getValue() ).get('multipleValues');
					this.queryBuilderFieldForm.rowStates[indx].multipleValues2 	= this.store.getById( this.getValue() ).get('multipleValues2');
					this.queryBuilderFieldForm.rowStates[indx].tableName 		= this.store.getById( this.getValue() ).get('table');
					this.queryBuilderFieldForm.rowStates[indx].condition 		= this.store.getById( this.getValue() ).get('condition');
					var additionalFields	= false;
					try { additionalFields 	= Ext.decode(this.store.getById( this.getValue() ).get('additionalFields')); }catch(e){};
					this.queryBuilderFieldForm.rowStates[indx].additionalFields = additionalFields;
					
					this.queryBuilderFieldForm.rowStates[indx].columnName 		= this.getValue();
					
					/**************here we will add/remove the second drop down (entry field) *********************/
					this.queryBuilderFieldForm.addRemoveSecondEntryField(this.queryBuilderFieldForm.rowStates[indx].columnDataType, rowID);
					
					var datatype = this.store.getById( this.getValue() ).get('dataType');
					
					var opCombo = Ext.getCmp( this.formID+'_operatorsCombo' + rowID );
					opCombo.clearValue();
					this.queryBuilderFieldForm.loadSqlOperator( datatype, opCombo.store );
					//select a default value for operator combobox
					switch (datatype){
						case 'string':
							opCombo.setValue("LIKE '{0}'");
						break;
						case 'number':
						case 'croptype':
							opCombo.setValue('= {0}');
						break;
						case 'date':
						case 'multiple':
							opCombo.setValue("= '{0}'");
						break;
						case 'boolean':
						default:
							opCombo.setValue("= {0}");
						break;
					}
					opCombo.fireEvent('change');
				}
			}
		});
		new Ext.form.ComboBox({
		  id:this.id+'_operatorsCombo'+ this.autoKey,
		  store: new Ext.data.SimpleStore({
			  fields: [
				  {name: 'txt', type:'string'},
				  {name: 'val'}
			  ],
			  data: this.operators.defaults
		  }),
		  displayField:'txt',
		  valueField:'val',
		  typeAhead: true,
		  allowBlank: false,
		  queryBuilderField:true,
		  width: 140,
		  mode: 'local',
		  forceSelection: true,
		  triggerAction: 'all',
		  emptyText:'Select an operator',
		  selectOnFocus:true,
		  renderTo: this.id+'_operatorBox'+ this.autoKey,
		  queryBuilderFieldForm:this,
		  rowID:this.autoKey,
		  formID:this.id,
		  listeners:{
			  change: function( thisField, newVal, oldVal ){
					var rowID 			= this.rowID;
					var thisRowState 	= {};
					//update row's state
					var indx = this.queryBuilderFieldForm.getRowStateIndex(rowID);
					
					this.queryBuilderFieldForm.rowStates[indx].operatorText 		= this.getRawValue();
					this.queryBuilderFieldForm.rowStates[indx].operatorTemplate 	= this.getValue();
					var thisRowState = this.queryBuilderFieldForm.rowStates[indx];					
					
					var searchValCmp 		= Ext.getCmp( this.formID+'_searchValueTextField'+rowID );
					var searchValCmp1 		= Ext.getCmp( this.formID+'_searchValueTextField1_'+rowID );
		
				if( this.getRawValue() == 'between' ){
					  if( searchValCmp ){searchValCmp.destroy();}
					  if( searchValCmp1 ){//remove entry fields used for BETWEEN operator						 
						  searchValCmp1.destroy();
						  Ext.getCmp( this.formID+'_searchValueTextField2_'+rowID).destroy();
						  this.queryBuilderFieldForm.addNewEntryField2(thisRowState.columnDataType, rowID, "And");						  
					  }else{
						  this.queryBuilderFieldForm.addNewEntryField2(thisRowState.columnDataType, rowID, "And");
					  }
				  }else{
					  if(searchValCmp1){ //remove entry fields used for BETWEEN operator
						  searchValCmp1.destroy();
						  Ext.getCmp( this.formID+'_searchValueTextField2_' + rowID ).destroy();
						  var els = Ext.select( '#'+this.formID+'_betweenBox'+rowID, false );
						  els.removeElement( this.formID+'_betweenBox'+rowID, true );
					  }
					  if(searchValCmp){						  
						  searchValCmp.destroy();
						  if(this.getRawValue()== 'in' && thisRowState.columnDataType == 'number'){
							  this.queryBuilderFieldForm.addNewEntryField('string', rowID);
						  }else{
							  this.queryBuilderFieldForm.addNewEntryField(thisRowState.columnDataType, rowID);
						  }						  
					  }else{
						  if( this.getRawValue() == 'in' && thisRowState.columnDataType == 'number' ){
							  this.queryBuilderFieldForm.addNewEntryField('string', rowID);
						  }else{
							  this.queryBuilderFieldForm.addNewEntryField(thisRowState.columnDataType, rowID);
						  }
					  }
				  }
			  }
		  }
		});
	},
	setRowStateValue: function(rowID, entryValues, extraFields){
		var indx = this.getRowStateIndex( rowID );
		if(rowID > 1){
			this.rowStates[indx].andOr = Ext.getCmp(this.id+'_andOrCombo'+rowID).getValue();
		}
		this.rowStates[indx].entryValues = entryValues;
		if(extraFields){
			this.rowStates[indx].extraFields = extraFields;
		}
		
		this.fireEvent('setRowState', this);
	},
	//Loads sql operator base on data type
	loadSqlOperator : function (dataType, extStore){
		switch(dataType){
			case 'boolean':
				extStore.removeAll();
				extStore.loadData( this.operators.Boolean );
			break;
			case 'date':
				extStore.removeAll();
				extStore.loadData( this.operators.Date );
			break;
			case 'string':
				extStore.removeAll();
				extStore.loadData( this.operators.String );
			break;
			case 'multiple':
				extStore.removeAll();
				extStore.loadData( this.operators.multiple );
			break;
			default:
				extStore.removeAll();
				extStore.loadData( this.operators.defaults );
			break;
		}
	},
	getRowStateIndex: function(rowID){
		var rowStateIndex = -1;
		for(i = 0; i <= this.rowStates.length; i++){
			if(this.rowStates[i].rowID == rowID){
				rowStateIndex = i;
				break;
			}
		}
		return rowStateIndex;
	},
	//validate Ext input controls.
	validateQueryForm: function (){
		var valid = true;	
		var queryForm = this;
		//loops through and validate all Ext input controls
		Ext.each( Ext.ComponentMgr.all.items, function( item, indx ){
			var cmpXType = item.getXType();
			if( cmpXType && item.queryBuilderField && item.id && item.id.indexOf(queryForm.id)!=-1){
				if( cmpXType == 'combo' || cmpXType == 'textfield' || cmpXType == 'numberfield' || cmpXType == 'datefield' ){
					if(valid){
						valid = (valid && item.validate());
					}else{
						item.validate();
					}
				}
			}
		});		
		return valid;
	},
	isNumeric: function(txt){
		var myRegExp = /^-{0,1}\d*\.{0,1}\d+$/;
		return myRegExp.test(txt);
	},
	init: function(){
		this.rowTemplate.compile();
		this.betweenBoxTemplate.compile();
		this.addNewRow();
	},
	loadSavedForm: function(savedRowsArray){
		var queryForm = this;
		queryForm.resetForm();
		Ext.each(savedRowsArray, function(item, indx){
			//fieldNameCombo, operatorCombo = null;
			if(item.rowID > 1){
				queryForm.addNewRow();
				Ext.getCmp( queryForm.id+'_andOrCombo' + (indx+1) ).setValue( item.andOr );
			}
			var fieldNameCombo 	= Ext.getCmp( queryForm.id+'_fieldNameCombo'+ (indx+1) );
			var operatorCombo 	= Ext.getCmp( queryForm.id+'_operatorsCombo'+ (indx+1) );
			fieldNameCombo.setValue( item.columnName );
			fieldNameCombo.fireEvent('change', { 'thisField': fieldNameCombo,'newVal': item.columnName, 'oldVal':'' });
			operatorCombo.setValue(item.operatorTemplate);
			operatorCombo.fireEvent('change', { 'thisField':operatorCombo, 'newVal': item.operatorTemplate, 'oldVal':'' });
			if(item.extraFields && item.extraFields.length >0){
				var i=0;
				for(i=0;i < item.extraFields.length; i++){
					Ext.getCmp(queryForm.id+'_searchValue'+(i+2)+'TextField'+(indx+1)).setValue( item.extraFields[i] );
				}
			}
			if( item.entryValues.length == 1 ){
				Ext.getCmp(queryForm.id+'_searchValueTextField'+(indx+1)).setValue( item.entryValues[0] );
				Ext.getCmp(queryForm.id+'_searchValueTextField'+(indx+1)).fireEvent( 'blur',null );
			}else if( item.entryValues.length == 2 ){
				Ext.getCmp(queryForm.id+'_searchValueTextField1_'+(indx+1)).setValue( item.entryValues[0] );
				Ext.getCmp(queryForm.id+'_searchValueTextField2_'+(indx+1)).setValue( item.entryValues[1] );
				Ext.getCmp(queryForm.id+'_searchValueTextField2_'+(indx+1)).fireEvent( 'blur',null );
			}
			
		});
	},
	resetForm: function(){
		while( this.rowStates[1] ){
			this.removeRow( this.rowStates[1].rowID );
		}
		this.autoKey = 1;
		var cmpXType = '';
		var queryForm = this;
		//loops through and reset all Ext input controls
		Ext.each( Ext.ComponentMgr.all.items, function( item, indx ){
			cmpXType = item.getXType();
			if( cmpXType && item.queryBuilderField && item.id && item.id.indexOf(queryForm.id)!=-1){
				if( cmpXType == 'combo' || cmpXType == 'textfield' || cmpXType == 'numberfield' || cmpXType == 'datefield' ){
					item.reset();
				}
			}
		});				
	},
	removeRow: function(rowID){
		var rowState 		= {};
		var rowStateIndx 	= 0;
		for(var i = 0; i <= this.rowStates.length; i++){
			if(this.rowStates[i].rowID == rowID){
				rowState = this.rowStates[i];
				rowStateIndx = i;
				break;
			}
		}
		
		if(rowState.operatorText == "between"){
			if( Ext.getCmp(this.id+'_searchValueTextField1_' + rowID) ){
				Ext.destroy(Ext.getCmp(this.id+'_searchValueTextField1_' + rowID));
			}
			if( Ext.getCmp(this.id+'_searchValueTextField2_' + rowID) ){
				Ext.destroy(Ext.getCmp(this.id+'_searchValueTextField2_' + rowID));
			}
		}else{
			if( Ext.getCmp( this.id+'_searchValueTextField' + rowID) ){
				Ext.destroy(Ext.getCmp(this.id+'_searchValueTextField' + rowID)); 
			}
		}
		
		/************* remove second entry field *********/
		if( Ext.getCmp( this.id+'_searchValue2TextField' + rowID) ){
			Ext.destroy(Ext.getCmp(this.id+'_searchValue2TextField' + rowID)); 
		}
		
		Ext.getCmp( this.id+'_fieldNameCombo'+rowID ).destroy();
		Ext.getCmp( this.id+'_operatorsCombo'+rowID ).destroy();
		if(rowID > 1){
			Ext.getCmp( this.id+'_andOrCombo'+rowID ).destroy();
			Ext.getCmp( this.id+'_removeRowButton'+rowID ).destroy();
		}
		
		//remove the html container element
		var row = Ext.select( '#'+this.id+'_queryBuilderFormFieldRow'+rowID );
		row.removeElement( this.id+'_queryBuilderFormFieldRow'+rowID, true );
		//remove row from rowStates
		this.rowStates.splice(rowStateIndx,1);
		this.fireEvent('setRowState', this);
	},
	replacePlaceHolder: function(subject, selectedValue,selectedValueWithOperator, selectedValue1, selectedValue2, selectedValue3){
		subject = subject.replace(/\[\[selectedValue\]\]/g, selectedValue);
		subject = subject.replace(/\[\[selectedValueWithOperator\]\]/g, selectedValueWithOperator);
		subject = subject.replace(/\[\[selectedValue1\]\]/g, selectedValue1);
		subject = subject.replace(/\[\[selectedValue2\]\]/g, selectedValue2);
		subject = subject.replace(/\[\[selectedValue3\]\]/g, selectedValue3);
		return subject+' ';
	},
	generateSqlFilter: function(){
		var sqlFilter 		= '';
		var selectedValue	= '';
		var selectedValue1  = '';
		var selectedValue2  = '';
		var selectedValue3	= '';//it will hold second entry field. which is introduced for "assessment tracking item" field
		var selectedValueWithOperator = '';
		var tables			= [];
		var secondField		= '';
		var additionalFields= [];
		for(var i=0; i < this.rowStates.length; i++){
			var rowData = this.rowStates[i];
			if(tables.indexOf(rowData.tableName)==-1){
				tables.push(rowData.tableName);	
			}
			if(rowData.additionalFields ){
				if(Ext.isArray(rowData.additionalFields)){
					Ext.each(rowData.additionalFields, function(field){
						if(field.dataIndex){							
							additionalFields.push(field);							
						}
					});
				}else{
					if(rowData.additionalFields.dataIndex){						
						additionalFields.push(rowData.additionalFields);						
					}
				}
			}
			/**get second field data **/
			secondField = Ext.getCmp(this.id+'_searchValue2TextField'+rowData.rowID);			
			if(secondField){				
				selectedValue3 = secondField.getValue();
			}
			
			if(i > 0) { sqlFilter += rowData.andOr + ' '; };
			switch (rowData.operatorText){
				case 'between':
					if(Ext.getCmp(this.id+'_searchValueTextField1_'+rowData.rowID).getXType() == 'datefield'){
						selectedValue1 = Ext.getCmp(this.id+'_searchValueTextField1_'+rowData.rowID).getValue().format("Y-m-d");
						selectedValue2 = Ext.getCmp(this.id+'_searchValueTextField2_'+rowData.rowID).getValue().format("Y-m-d");						
					}else{
						selectedValue1 = Ext.getCmp(this.id+'_searchValueTextField1_'+rowData.rowID).getValue();
						selectedValue2 = Ext.getCmp(this.id+'_searchValueTextField2_'+rowData.rowID).getValue();												
					}
					selectedValue  = selectedValue1 +','+selectedValue2;
					selectedValueWithOperator = String.format(rowData.operatorTemplate, selectedValue1 , selectedValue2 );						
					sqlFilter += this.replacePlaceHolder(rowData.condition, selectedValue, selectedValueWithOperator, selectedValue1, selectedValue2, selectedValue3 );
				break;
				case 'in':
					var valueString =  '';
					if(rowData.columnDataType == "string"){						
						var valueArray  = Ext.getCmp(this.id+'_searchValueTextField'+rowData.rowID).getValue().split(',');
						var validValueArray = [];
						for(var k= 0; k < valueArray.length; k++){
							if(valueArray[k].trim() != ''){
								validValueArray.push(valueArray[k].trim());
							}
						}
						
						for(var j= 0; j < validValueArray.length - 1; j++){
							valueString += "'" + validValueArray[j] + "', ";
						}
						valueString += "'" + validValueArray[validValueArray.length - 1]+"'" ;						
							
						
					}else if(rowData.columnDataType == "number"){						
						var valueArray = Ext.getCmp(this.id+'_searchValueTextField'+rowData.rowID).getValue().split(',');
						var validValueArray = [];
						for(var k= 0; k < valueArray.length; k++){
							if(this.isNumeric(valueArray[k].trim())){
								validValueArray.push(valueArray[k].trim());
							}
						}
						
						for(var j = 0; j < validValueArray.length - 1; j++){
							valueString += validValueArray[j] + ", ";
						}
						valueString += validValueArray[validValueArray.length - 1];						
						
					}else{						
						var valueArray = Ext.getCmp(this.id+'_searchValueTextField'+rowData.rowID).getValue().split(',');
						var validValueArray = [];
						for(var k= 0; k < valueArray.length; k++){
							if(valueArray[k].trim() != ''){
								validValueArray.push(valueArray[k].trim());
							}
						}
						for(var j= 0; j < validValueArray.length - 1; j++){
							valueString += validValueArray[j] + ", ";
						}
						valueString += validValueArray[validValueArray.length - 1] ;						
					}
					selectedValue1 = '';
					selectedValue2 = '';
					selectedValue  = valueString;
					selectedValueWithOperator = ' IN ( '+valueString + ') ';					
					sqlFilter += this.replacePlaceHolder(rowData.condition, selectedValue, selectedValueWithOperator, selectedValue1, selectedValue2, selectedValue3  );
				break;
				default:
					var valField = Ext.getCmp(this.id+'_searchValueTextField'+rowData.rowID);
					if(valField){
						selectedValue1 = '';
						selectedValue2 = '';
						if(valField.getXType() == 'datefield'){							
							selectedValue  = valField.getValue().format("Y-m-d");
						}else{
							selectedValue  = valField.getValue();
						}
						selectedValueWithOperator = String.format(rowData.operatorTemplate, selectedValue);							
						sqlFilter += this.replacePlaceHolder(rowData.condition, selectedValue, selectedValueWithOperator, selectedValue1, selectedValue2 , selectedValue3 );
					}
				break
			}
		}
		this.additionalFields	= additionalFields;
		return Ext.encode({where:sqlFilter, tables: tables, additionalFields: additionalFields});
	}
});