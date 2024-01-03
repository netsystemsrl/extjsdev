//*************************************************************************************************************//
//			DYNAMIC COMBO
Ext.define('dynamiccombo', {   
	extend: 'Ext.form.field.ComboBox',
    alias: 'widget.dynamiccombo',
	/* DATA */
	datasource: 'ESEMPIO',
	datasourcetype: 'TABLE',
	insertwhere: '',
	filterwhere: '',
	filterwhereonstart: false,
	valueField: 'ID',
	displayField: 'DESCRIZIONE',
	datasourcefield: 'dynamiccombo1',
	defaultValue: '',
	/*RECORD EDITING DEFINITION*/
	layouteditorid:'',
	layoutsearchid:'',
	layouteditorWindowMode: 'acDialog',
	allowedit: true,
	allowfilter: true, 
	isnotinlist: false,
	isnotinlistField: '',
	/* EVENT ON CHANGE*/
	autopostback: false,
	
	initComponent: function () {
		var me = this;
		/*
		if (me.displayField == 'ICONNAME'){
			me.displayTpl = Ext.create('Ext.XTemplate', [
				'<tpl for=".">',
				'<div style="font-size:150%; text-align:center; padding:5px;"><i class="{ICONNAME}"></i>&nbsp;</div>',
				'</tpl>'
			]);
			me.fieldSubTpl = [
				'<div class="{hiddenDataCls}" role="presentation"></div>',
                '<div id="{id}" type="{type}" style="background-color:white; font-size:1.1em; line-height: 2.1em;" ',
                '<tpl if="size">size="{size}" </tpl>',
				'<tpl if="tabIdx">tabIndex="{tabIdx}" </tpl>',
                'class="{fieldCls} {typeCls}" autocomplete="off"></div>',
                '<div id="{cmpId}-triggerWrap" class="{triggerWrapCls}" role="presentation">',
                '{triggerEl}',
                '<div class="{clearCls}" role="presentation"></div>',
                '</div>', {
                    compiled: true,
                    disableFormats: true
                }
			];
			me.listConfig = {
				itemTpl: [
					'<div style="font-size:150%; text-align:center; padding:5px;"><i class="{ICONNAME}"></i>&nbsp;</div>'
				]
			};
			me.setRawValue = function (value) {
				var me = this;
				me.rawValue = value;
				// Some Field subclasses may not render an inputEl
				if (me.inputEl) {
					me.inputEl.dom.innerHTML = value;
				}
				return value;
			};
		}
		*/
		me.callParent(arguments);
	},
	onFieldMutation: function(e) {
        if (e.getKey() === e.ENTER) {
			var me = this;
			if (me.isnotinlist  == true){
				if(( me.getValue() == null) && (!Custom.IsNullOrEmptyOrZeroString(me.lastQuery))){
					appowhere = '';
				
					var ValRiga = me.lastQuery;
					var NameChiave = me.displayField;
					
					if (!Custom.IsNullOrEmptyOrZeroString(me.isnotinlistField)){
						NameChiave = me.isnotinlistField;
					}
						
					if ((me.layouteditorid != 0) && (me.layouteditorid != undefined)) {
						if (Custom.isNumber(ValRiga) == true)
							appowhere =  NameChiave + '=' + ValRiga;
						else
							appowhere =  NameChiave + "='" + ValRiga + "'";
						Custom.LayoutRender(me.layouteditorid, 'form', appowhere, 'add', me.layouteditorWindowMode);
					}
				}
			}
        }
        return this.callParent(arguments);
    },
    triggers: {
        layouteditor: {
			//cls: 'x-fa fa-expand',
			glyph: 'xf05a@FontAwesome',
			tooltip: 'Info Detail',
            hideOnReadOnly: false,
            weight: +1, // negative to place before default triggers
            handler: function() {
				var me = this;
				appowhere = '';
				
				var ValRiga = me.getValue();
				var NameChiave = me.valueField;
					
				if ((me.layouteditorid != 0) && (me.layouteditorid != undefined)) {
					if (Custom.isNumber(ValRiga) == true)
						appowhere =  NameChiave + '=' + ValRiga;
					else
						appowhere =  NameChiave + "='" + ValRiga + "'";
					Custom.LayoutRender(me.layouteditorid, 'form', appowhere, 'edit', me.layouteditorWindowMode);
				}
				
            }
        },
        layoutsearch: {
			//cls: 'x-fa fa-search',
			glyph: 'xf002@FontAwesome',
			tooltip: 'Search',
            weight: +1, // negative to place before default triggers
            handler: function() {
				var me = this;
				
				var ValRiga = me.getValue();
				var NameChiave = me.valueField;
				
				if ((me.layoutsearchid != 0) && (me.layoutsearchid != undefined)) {
					LastObjUpdated = me;
					Custom.LayoutRender(me.layoutsearchid, 'form', '', 'search', me.layouteditorWindowMode);
				}else if ((me.layouteditorid != 0) && (me.layouteditorid != undefined)) {
					LastObjUpdated = me;
					Custom.LayoutRender(me.layouteditorid, 'grid', '', 'search', me.layouteditorWindowMode);
				}
				
            }
        },
        filtered: {
			cls: 'x-form-clear-filter',
			glyph: 'xf0b0@FontAwesome',
			tooltip: 'Reset',
            weight: +1, // negative to place before default triggers
            handler: function() {
				var me = this;
				me.getTriggers()["filtered"].setVisible(false);
				me.getStore().proxy.extraParams['combofilter'] = true;
				me.getStore().load();
				me.expand();
            }
        }
    },
    listeners: {
		afterrender: function(el) {
			var me = this;
			
			if (me.allowedit == false) 	me.getTriggers()["layouteditor"].setVisible(false);
			if (me.allowfilter == false) me.getTriggers()["layoutsearch"].setVisible(false);
			if (me.filterwhere == "") me.getTriggers()["filtered"].setVisible(false);
			
			this.inputEl.set({ autocomplete: 'off' });
			if (this.emptyText != '') {
				this.setValue(this.emptyText); 
			} 
			if (this.defaultValue != '') {
				this.setValue(this.defaultValue); 
			}
            //this.callParent(arguments);
		}
	}
});
