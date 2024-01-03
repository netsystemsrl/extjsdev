//*************************************************************************************************************//
//			DYNAMIC TEXTFIELD
Ext.define('dynamictextfield', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.dynamictextfield',
	uppercase: false,
	/* DATA */
	insertwhere: '',
	filterwhere: '',
	valueField: 'ID',
	datasourcefield: 'dynamictextfield1',
	defaultValue: '',
	/*RECORD EDITING DEFINITION*/
	layouteditorid:'',
	layouteditorgrid:false,
	layoutsearchid:'',
	layouteditorWindowMode: 'acDialog',
	allowedit: true,
	allowfilter: true,
	allowscale :false,
	allowclear :false,
	/* EVENT ON CHANGE*/
	autopostback: false,
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
					
					if (me.layouteditorgrid == true)
						Custom.LayoutRender(me.layouteditorid, 'grid', appowhere, 'edit', me.layouteditorWindowMode);
					else
						Custom.LayoutRender(me.layouteditorid, 'form', appowhere, 'edit', me.layouteditorWindowMode);
					
					
				}
				
            }
        },
        layoutsearch: {
            cls: null,
			glyph: 'xf002@FontAwesome',
			tooltip: 'Search',
            scale   : 'large',
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
					Custom.LayoutRender(me.layouteditorid, 'grid', me.filterwhere, 'search', me.layouteditorWindowMode);
				}
            }
        },
		clear: {
			cls: 'x-form-clear-trigger',
			tooltip: 'Reset',
            weight: +1, // negative to place before default triggers
            handler: function() {
				var me = this;
				me.setValue('');
				me.fireEvent('select');
            }
        },
		serialread: {
			cls: 'x-fa fa-expand',
            glyph: 'xf24e@FontAwesome',
            tooltip: 'Read',
            weight: +1, // negative to place before default triggers
            handler: async function() {
				var me = this;
				if (CurrentScaleController.port == null){
					CurrentScaleController.init();
				}else{
					var newvalue = '' +  await CurrentScaleController.read();
					me.setValue(newvalue);
					me.fireEvent('select');
				}
            }
        },
		
    },
	
    fieldStyle: {
        //textTransform: "uppercase"
    },
    
	initComponent: function() {
        this.callParent(arguments);
    },
	
    listeners: {
		afterrender: function(el) {
			var me = this;
			
			if (me.allowedit == false) 	me.getTriggers()["layouteditor"].setVisible(false);
			if (me.allowfilter == false) me.getTriggers()["layoutsearch"].setVisible(false);
			if (me.readOnly == true) me.getTriggers()["layoutsearch"].setVisible(false);
			if (me.allowclear == false) me.getTriggers()["clear"].setVisible(false);
			if (me.allowscale == false) me.getTriggers()["serialread"].setVisible(false);
			
			this.inputEl.set({ autocomplete: 'off' });
			if (this.emptyText != '') {
				this.setValue(this.emptyText); 
			} 
			if (this.defaultValue != '') {
				this.setValue(this.defaultValue); 
			}
		},
        change: function (obj, newValue) {
            if (obj.uppercase == true) obj.setRawValue(newValue.toUpperCase());
        }
     }
});