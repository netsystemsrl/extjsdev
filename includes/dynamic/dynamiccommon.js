Ext.namespace('Custom');

var majorVersion;
var fullVersion;
if (Ext.version != undefined) {
	majorVersion = Ext.version.substring(0, Ext.version.indexOf("."));
	fullVersion = Ext.version;
} else {
	majorVersion = Ext.getVersion().getMajor();
	fullVersion = Ext.getVersion().version;
}

Ext.override(Ext.data.proxy.Ajax, {
	timeout:60000
});
Ext.override(Ext.form.action.Action, {
	timeout:60
});
Ext.DatePicker.prototype.firstDayOfWeek = 1;

//*************************************************************************************************************//
//				OVERRIDE
//*************************************************************************************************************//

// extjs Trigger readonly
Ext.define('App.overrides.Trigger', {
	override:'Ext.form.trigger.Trigger',
	onClick:function () {
		var me = this,
			args = arguments,
			e = me.clickRepeater ? args[1] :args[0],
			handler = me.handler,
			field = me.field;
		if (handler && (!field.readOnly || !me.hideOnReadOnly) && me.isFieldEnabled()) {
			Ext.callback(me.handler, me.scope, [field, me, e], 0, field);
		}
	}
});

// extjs AfterLabelInfo
Ext.define('Ext.ux.plugin.AfterLabelInfo', {
	extend:'Ext.AbstractPlugin',
	alias:'plugin.afterlabelinfo',

	init:function (cmp) {
		var me = this; // the plugin

		cmp.afterLabelTextTpl = [
			'<span',
			' class="x-ux-plugin-afterlabelinfo"',
			' data-qtip="',
			Ext.util.Format.htmlEncode(me.qtip || ''),
			'">',
			'</span>'
		].join('');
	}
});

// extjs autocomplete
Ext.define('Ext.form.ComboBox', {
	override:'Ext.form.ComboBox',
	onLoad:function () {
		this.callParent(arguments);
		if (this.inputEl != undefined) {
			this.inputEl.dom.setAttribute('autocomplete', 'off');
		}
	}
});
/*
,	
	listConfig:{
		itemTpl:[
			'<div><i class="{icon}"></i>{name}</div>'
		]
	}
*/

Ext.define('Ext.form.TextField', {
	override:'Ext.form.TextField',
	allowkeypad:false,
	allowscale:false,
	allowautocomplete: false,
	keypadLoaded:false,

	onLoad:function () {
		var me = this;
		this.callParent(arguments);
		if (me.allowautocomplete == false) {
			this.inputEl.dom.setAttribute('autocomplete', 'off');
		}
	},
	listeners:{
	/*
		focus:function (el) {
			var me = this;
			if ((me.allowkeypad) && (me.keypadLoaded == false) && ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone'))) {
				var referenceMe = me.el.dom;
				var referenceInput = me.getInputId()
					//console.log(referenceMe)
				$(referenceMe).numpad({
					target:$('#' + referenceInput)
				});
				me.keypadLoaded = true;
			}
		},
	*/
	/*
		beforeBlur:function (el) {
			if (me.keypadLoaded == true) {
				var referenceMe = me.el.dom;
				var referenceInput = me.getInputId()
				me.keypadLoaded = false;
			}
		}
	*/
		/*,
		afterrender:function(cmp){
			cmp.inputEl.set({
				autocomplete:'off'
			});
		}
		*/
	}
});

// extjs textField UPPERCASE
Ext.define('Ext.form.TextField', {
	extend:'Ext.form.field.Text',
	alias:'widget.uppertextfield',

	//configuration
	config:{
		uppercaseValue:false //defaults
	},

	constructor:function (config) {
		this.initConfig(config);
		this.callParent([config]);
	},

	initComponent:function () {
		var me = this;
		Ext.apply(me, {
			fieldStyle:'text-transform:uppercase',
		});

me.callParent();
	},

	//overriden function
	getValue:function () {
		var val = this.callParent();
		return this.getUppercaseValue() ? val.toUpperCase() :val;
	}
});

// extjs DateField
Ext.define('Ext.form.DateField', {
	override:'Ext.form.DateField',
	startDay:1,
	getSubTplMarkup:function (fieldDate) {
		var value = this.callParent(arguments);
		value = value.replace('autocomplete="off"', 'autocomplete="new-password"');
		return value;
	},
	views:{
		week:{
			visibleDays:7,
			firstDayOfWeek:1
		}
	},
	listeners:{
		afterrender:function (el) {
			var me = this;
			this.inputEl.set({
				autocomplete:'off'
			});
		},
	},
});

// error extjs time localization
Ext.define("Ext.locale.it.form.field.Time", {
	override:"Ext.form.field.Time",
	minText:"L'Ora deve essere maggiore o uguale a {0}",
	maxText:"L'Ora deve essere mainore o uguale a {0}",
	invalidText:"{0} non \u00E8 un Orario valido",
	//		format:"g:i A",
	format:"H:i:s",
	//Original altFormats
	//altFormats:"g:ia|g:iA|g:i a|g:i A|h:i|g:i|H:i|ga|ha|gA|h a|g a|g A|gi|hi|gia|hia|g|H"
	//Proposed New
	altFormats:"Gi|Gi a|g:ia|g:iA|g:i a|g:i A|h:i|g:i|H:i|H:i:s|ga|ha|gA|h a|g a|g A|gi|hi|gia|hia|g|H"

});

//error extjs treeitem
Ext.define('override', {
	override:'Ext.list.AbstractTreeItem',
	config:{
		floated:false
	}

})

// manage time data format submit
Ext.define('Ext.view.override.TimeField', {
	override:'Ext.form.field.Time',

	getSubmitValue:function () {
		var me = this,
			format = me.submitFormat || me.format,
			value = me.getValue();

		return value ? Ext.Date.format(value, format) :"";
	},

	setValue:function (v) {
		this.getPicker();
		if (Ext.isDate(v)) {
			var parts = this.initDateParts;
			v = new Date(parts[0], parts[1], parts[2], v.getHours() || 0, v.getMinutes() || 0, v.getSeconds() || 0, 0);
		}
		return Ext.form.field.Time.superclass.setValue.call(this, v);
	}
});

// disable chrome yellow login
Ext.override(Ext.form.field.Base, {
	getSubTplMarkup:function (fieldDate) {
		var value = this.callParent(arguments);
		value = value.replace('autocomplete="off"', 'autocomplete="new-password"');
		return value;
	}
})

// manage dot comma number decimal
Ext.override(Ext.form.NumberField, {
	allowscale:false,
	allowclear:false,
	allowkeypad:false,

	keypadLoaded:false,
	/**
	 * @cfg {Boolean} allowThousandSeparator
	 * False to disallow thousand separator feature.
	 */
	allowThousandSeparator:true,

	/**
	 * @private
	 */
	toBaseNumber:function (value) {
		var me = this;
		return String(value).replace(new RegExp("[" + Ext.util.Format.thousandSeparator + "]", "g"), '').replace(me.decimalSeparator, '.');
	},

	/**
	 * @private
	 */
	 parseRawValue:function (value) {
		var me = this;
		//value = parseFloat(String(value).replace(",", "."));
		value = parseFloat(me.toBaseNumber(value));
		return isNaN(value) ? null :value;
	},

	getErrors:function (value) {
		if (!this.allowThousandSeparator)
			return this.callParent(arguments);
		value = arguments.length > 0 ? value :this.processRawValue(this.getRawValue());

		var me = this,
			errors = me.callSuper([value]),
			format = Ext.String.format,
			num;

		if (value.length < 1) { // if it's blank and textfield didn't flag it then it's valid
			return errors;
		}

		value = me.toBaseNumber(value);

		if (isNaN(value)) {
			errors.push(format(me.nanText, value));
		}

		num = me.parseValue(value);

		if (me.minValue === 0 && num < 0) {
			errors.push(this.negativeText);
		} else if (num < me.minValue) {
			errors.push(format(me.minText, me.minValue));
		}

		if (num > me.maxValue) {
			errors.push(format(me.maxText, me.maxValue));
		}

		return errors;
	},

	rawToValue:function (rawValue) {
		if (!this.allowThousandSeparator)
			return this.callParent(arguments);
		var value = this.fixPrecision(this.parseRawValue(rawValue));
		if (value === null) {
			value = rawValue || null;
		}
		return value;
	},

	valueToRaw:function (value) {
		if (!this.allowThousandSeparator) {
			return this.callParent(arguments);
		}
		var me = this,
			decimalSeparator = me.decimalSeparator,
			format = "0,000";
		if (me.allowDecimals) {
			for (var i = 0; i < me.decimalPrecision; i++) {
				if (i == 0) {
					format += ".";
				}
				format += "0";
			}
		}
		value = me.parseValue(value);
		value = me.fixPrecision(value);
		value = Ext.isNumber(value) ? value :parseFloat(String(value).replace(decimalSeparator, '.'));
		value = isNaN(value) ? '' :Ext.util.Format.number(value, format);
		return value;
	},

	getSubmitValue:function () {
		var me = this,
			value = me.callSuper();
		/*
		if (!this.allowThousandSeparator)
			return this.callParent();
		

		if (!me.submitLocaleSeparator) {
			value = me.toBaseNumber(value);
		}*/
		value = me.toBaseNumber(value);
		return value;
	},

	setMinValue:function (value) {
		if (!this.allowThousandSeparator)
			return this.callParent(arguments);
		var me = this,
			ariaDom = me.ariaEl.dom,
			minValue, allowed, ariaDom;

		me.minValue = minValue = Ext.Number.from(value, Number.NEGATIVE_INFINITY);
		me.toggleSpinners();

		// May not be rendered yet
		if (ariaDom) {
			if (minValue > Number.NEGATIVE_INFINITY) {
				ariaDom.setAttribute('aria-valuemin', minValue);
			} else {
				ariaDom.removeAttribute('aria-valuemin');
			}
		}

		// Build regexes for masking and stripping based on the configured options
		if (me.disableKeyFilter !== true) {
			allowed = me.baseChars + '';

			if (me.allowExponential) {
				allowed += me.decimalSeparator + '.' + 'e+-';
			} else {
				//allowed += Ext.util.Format.thousandSeparator;
				if (me.allowDecimals) {
					allowed += me.decimalSeparator + '.';
				}
				if (me.minValue < 0) {
					allowed += '-';
				}
			}

			allowed = Ext.String.escapeRegex(allowed);
			me.maskRe = new RegExp('[' + allowed + ']');
			if (me.autoStripChars) {
				me.stripCharsRe = new RegExp('[^' + allowed + ']', 'gi');
			}
		}
	},
	triggers:{
		clear:{
			hidden:true,
			cls:'x-form-clear-trigger',
			tooltip:'Reset',
			weight:+1, // negative to place before default triggers
			handler:function () {
				var me = this;
				me.setValue('');
				me.fireEvent('select');
			}
		},
		serialread:{
			hidden:true,
			cls:null,
			glyph:'xf24e@FontAwesome',
			tooltip:'Read',
			weight:+1, // negative to place before default triggers
			handler:async function () {
				var me = this;
				if (CurrentScaleController.port == null) {
					CurrentScaleController.init();
				} else {
					var newvalue = '' + await CurrentScaleController.read();
					me.setValue(newvalue);
					me.fireEvent('select');
				}
			}
		},
		calculator:{
			hidden:true,
			//cls:'fa-2x fa-calculator',
			cls:null,
			glyph:'xf1ec@FontAwesome',
			tooltip:'Calc',
			//cls:Ext.baseCSSPrefix + 'form-clear-trigger',
			weight:+1, // negative to place before default triggers
			handler:function (field, button, e) {
				var me = this;

				var CalcPanel = new Ext.form.Panel({
					minWidth:300,
					minHeight:300,
					items:[{
						layout:'column',
						items:[{
							columnWidth:1,
							xtype:'textfield',
							name:'display',
							id:'display',
							value:"0"
						}]
					}, {
						layout:'column',
						items:[{
							xtype:'button',
							text:'CE',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								var cl = Ext.getCmp('display').getValue();
								cl = "";
								Ext.getCmp('display').setValue(cl);
							}
						}, {
							xtype:'button',
							text:'C',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								var no = new Array();
								no = Ext.getCmp('display').getValue();
								var len = no.length;
								var sub = no.slice(0, len - 1)
								Ext.getCmp('display').setValue(sub);
							}
						}, {
							xtype:'button',
							text:'<-',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								no = Ext.getCmp('display').getValue();
								me.setValue(no);
								me.fireEvent('select');
								CalcWindow.close();
							}
						}]
					}, {
						layout:'column',
						items:[{
							xtype:'button',
							text:'1',
							scale   :'large',
							margin:'2px',
							columnWidth:0.23,
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("1");
								} else {
									num = num + "1";
									Ext.getCmp('display').setValue(num);
								}
							}
						}, {
							xtype:'button',
							text:'2',
							scale   :'large',
							margin:'2px',
							columnWidth:0.23,
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("2");
								} else {
									num = num + "2";
									Ext.getCmp('display').setValue(num);
								}
							}

						}, {
							xtype:'button',
							text:'3',
							scale   :'large',
							margin:'2px',
							columnWidth:0.23,
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("3");
								} else {
									num = num + "3";
									Ext.getCmp('display').setValue(num);
								}
							}
						}, {
							xtype:'button',
							text:'-',
							scale   :'large',
							margin:'2px',
							columnWidth:0.23,
							handler:function () {
								var num = new Array()
								num = Ext.getCmp('display').getValue();
								var len = num.length;
								var sub = num.substr(len - 1, len);
								if (sub != "+" && sub != "-" && sub != "*" && sub != "/") {
									num = num + "-";
									Ext.getCmp('display').setValue(num);
								}
							}
						}]
					}, {
						layout:'column',
						items:[{
							xtype:'button',
							text:'4',
							scale   :'large',
							margin:'2px',
							columnWidth:0.23,
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("4");
								} else {
									num = num + "4";
									Ext.getCmp('display').setValue(num);
								}
							}
						}, {
							xtype:'button',
							text:'5',
							scale   :'large',
							margin:'2px',
							columnWidth:0.23,
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("5");
								} else {
									num = num + "5";
									Ext.getCmp('display').setValue(num);
								}
							}
						}, {
							xtype:'button',
							text:'6',
							scale   :'large',
							margin:'2px',
							columnWidth:0.23,
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("6");
								} else {
									num = num + "6";
									Ext.getCmp('display').setValue(num);
								}
							}
						}, {
							xtype:'button',
							text:'*',
							scale   :'large',
							margin:'2px',
							columnWidth:0.23,
							handler:function () {
								var num = new Array()
								num = Ext.getCmp('display').getValue();
								var len = num.length;
								var sub = num.substr(len - 1, len);
								if (sub != "+" && sub != "-" && sub != "*" && sub != "/") {
									num = num + "*";
									Ext.getCmp('display').setValue(num);
								}
							}

						}]
					}, {
						layout:'column',
						items:[{
							xtype:'button',
							text:'7',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("7");
								} else {
									num = num + "7";
									Ext.getCmp('display').setValue(num);
								}
							}
						}, {
							xtype:'button',
							text:'8',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("8");
								} else {
									num = num + "8";
									Ext.getCmp('display').setValue(num);
								}
							}
						}, {
							xtype:'button',
							text:'9',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("9");
								} else {
									num = num + "9";
									Ext.getCmp('display').setValue(num);
								}
							}
						}, {
							xtype:'button',
							text:'/',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								var num = new Array()
								num = Ext.getCmp('display').getValue();
								var len = num.length;
								var sub = num.substr(len - 1, len);
								if (sub != "+" && sub != "-" && sub != "*" && sub != "/") {
									num = num + "/";
									Ext.getCmp('display').setValue(num);
								}
							}

						}]
					}, {
						layout:'column',
						items:[{
							xtype:'button',
							text:'0',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									num = num + "0";
									Ext.getCmp('display').setValue(num);
								} else {
									num = num + "0";
									Ext.getCmp('display').setValue(num);
								}
							}
						}, {
							xtype:'button',
							text:'.',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									num = num + ".";
									Ext.getCmp('display').setValue(num);
								} else {
									num = num + ".";
									Ext.getCmp('display').setValue(num);
								}
							}
						}, {
							xtype:'button',
							text:'=',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								var exp = new Array();
								exp = Ext.getCmp('display').getValue();
								var len = exp.length;
								var sub = exp.substr(len - 1, len);
								if (sub != "+" && sub != "-" && sub != "*" && sub != "/") {
									Ext.getCmp('display').setValue(eval(exp));
									no = Ext.getCmp('display').getValue();
									me.setValue(no);
									me.fireEvent('select');
									CalcWindow.close();
								}

							}
						}, {
							xtype:'button',
							text:'+',
							scale   :'large',
							columnWidth:0.23,
							margin:'2px',
							handler:function () {
								var num = new Array();
								num = Ext.getCmp('display').getValue();
								var len = num.length;
								var sub = num.substr(len - 1, len);
								if (sub != "+" && sub != "-" && sub != "*" && sub != "/") {
									num = num + "+";
									Ext.getCmp('display').setValue(num);
								}

								console.log("print +");
							}
						}]
					}]
				})

				var CalcWindow = new Ext.window.Window({
					align:'right',
					dock:'top',
					margin:'0px',
					padding:'0px',
					floating:true,
					closable:true,
					items:[
						CalcPanel
					],
					"keyMap":{
						"1":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("1");
								} else {
									num = num + "1";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"2":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("2");
								} else {
									num = num + "2";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"3":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("3");
								} else {
									num = num + "3";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"4":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("4");
								} else {
									num = num + "4";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"5":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("5");
								} else {
									num = num + "5";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"6":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("6");
								} else {
									num = num + "6";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"7":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("7");
								} else {
									num = num + "7";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"8":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("8");
								} else {
									num = num + "8";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"9":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("9");
								} else {
									num = num + "9";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"0":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("0");
								} else {
									num = num + "0";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						".":{
							handler:function () {
								var num = Ext.getCmp('display').getValue();
								if (num == 0) {
									Ext.getCmp('display').setValue("0.");
								} else {
									num = num + ".";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"/":{
							handler:function () {
								var num = new Array()
								num = Ext.getCmp('display').getValue();
								var len = num.length;
								var sub = num.substr(len - 1, len);
								if (sub != "+" && sub != "-" && sub != "*" && sub != "/") {
									num = num + "/";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"-":{
							handler:function () {
								var num = new Array()
								num = Ext.getCmp('display').getValue();
								var len = num.length;
								var sub = num.substr(len - 1, len);
								if (sub != "+" && sub != "-" && sub != "*" && sub != "/") {
									num = num + "-";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"+":{
							handler:function () {
								var num = new Array()
								num = Ext.getCmp('display').getValue();
								var len = num.length;
								var sub = num.substr(len - 1, len);
								if (sub != "+" && sub != "-" && sub != "*" && sub != "/") {
									num = num + "+";
									Ext.getCmp('display').setValue(num);
								}
							}
						},
						"=":{
							handler:function () {
								var exp = new Array();
								exp = Ext.getCmp('display').getValue();
								var len = exp.length;
								var sub = exp.substr(len - 1, len);
								if (sub != "+" && sub != "-" && sub != "*" && sub != "/") {
									Ext.getCmp('display').setValue(eval(exp));
									no = Ext.getCmp('display').getValue();
									me.setValue(no);
									me.fireEvent('select');
									CalcWindow.close();
								}

							}
						},
						enter:{
							handler:function () {
								var exp = new Array();
								exp = Ext.getCmp('display').getValue();
								var len = exp.length;
								var sub = exp.substr(len - 1, len);
								if (sub != "+" && sub != "-" && sub != "*" && sub != "/") {
									Ext.getCmp('display').setValue(eval(exp));
									no = Ext.getCmp('display').getValue();
									me.setValue(no);
									me.fireEvent('select');
									CalcWindow.close();
								}

							}
						},
						esc:{
							handler:function () {
								var cl = Ext.getCmp('display').getValue();
								cl = "";
								Ext.getCmp('display').setValue(cl);
							}
						}
					},
				}).show();
			}
		},
	},

	listeners:{
	/*
		focus:function (el) {
			var me = this;
			if ((me.allowkeypad) && (me.keypadLoaded == false) && ((CurrentDeviceType == 'tablet') || (CurrentDeviceType == 'phone'))) {
				var referenceMe = me.el.dom;
				var referenceInput = me.getInputId()
					//console.log(referenceMe)
				$(referenceMe).numpad({
					target:$('#' + referenceInput)
				});
				me.keypadLoaded = true;
			}
		},
	*/
	/**/
		beforerender:function (el) {
			var me = this;
			if (me.allowclear == true) me.getTriggers()["clear"].setVisible(true); else me.getTriggers()["clear"].setVisible(false);
			if (me.allowscale == true) me.getTriggers()["serialread"].setVisible(true); else me.getTriggers()["serialread"].setVisible(false);
			if (me.allowkeypad == true) me.getTriggers()["calculator"].setVisible(true); else me.getTriggers()["calculator"].setVisible(false);

		},
	
		afterrender:function (el) {
			var me = this;
/*
			if (me.allowclear == true) me.getTriggers()["clear"].setVisible(true); else me.getTriggers()["clear"].setVisible(false);
			if (me.allowscale == true) me.getTriggers()["serialread"].setVisible(true); else me.getTriggers()["serialread"].setVisible(false);
			if (me.allowkeypad == true) me.getTriggers()["calculator"].setVisible(true); else me.getTriggers()["calculator"].setVisible(false);
*/
			this.inputEl.set({
				autocomplete:'off'
			});
			if (this.emptyText != '') {
				this.setValue(this.emptyText);
			}
			if (this.defaultValue != '') {
				this.setValue(this.defaultValue);
			}
		}
	}

});

// custom Vtype for vtype:'time'
Ext.define('Override.form.field.VTypes', {
	override:'Ext.form.field.VTypes',

	// vtype validation function
	time:function (value) {
		return this.timeRe.test(value);
	},
	// RegExp for the value to be tested against within the validation function
	timeRe:/^([1-9]|1[0-9]):([0-5][0-9])(\s[a|p]m)$/i,
	// vtype Text property:The error text to display when the validation function returns false
	timeText:'Not a valid time. Must be in the format "12:34 PM".',
	// vtype Mask property:The keystroke filter mask
	timeMask:/[\d\s:amp]/i
});

// custom Vtype for vtype:'emailseries'
Ext.define('Override.form.field.VTypes', {
    override: 'Ext.form.field.VTypes',
    emailseries: function (value) {
        return this.emailseriesRe.test(value);
    },
    emailseriesText: 'Not a valid list email: mail@mail.com;mail2@mail.com".',
    emailseriesRe: /^(([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+([;,.](([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5}){1,25})+)*$/,
    emailserieslMask : /[\w.\-@'"!#$%&'*+/=?^_`{|}~]/i,
});

// custom Vtype for vtype:'IPAddress'
Ext.define('Override.form.field.VTypes', {
	override:'Ext.form.field.VTypes',

	IPAddress:function (value) {
		return this.IPAddressRe.test(value);
	},
	IPAddressRe:/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
	IPAddressText:'Must be a numeric IP address',
	IPAddressMask:/[\d\.]/i
});

// custom Vtype for vtype:'IBAN'
Ext.define('Override.form.field.VTypes', {
	override:'Ext.form.field.VTypes',

	_ibanregex:{
		'AD':'^AD[0-9]{2}[0-9]{8}[A-Z0-9]{12}$',
		'AT':'^AT[0-9]{2}[0-9]{5}[0-9]{11}$',
		'BA':'^BA[0-9]{2}[0-9]{6}[0-9]{10}$',
		'BE':'^BE[0-9]{2}[0-9]{3}[0-9]{9}$',
		'BG':'^BG[0-9]{2}[A-Z]{4}[0-9]{4}[0-9]{2}[A-Z0-9]{8}$',
		'CH':'^CH[0-9]{2}[0-9]{5}[A-Z0-9]{12}$',
		'CS':'^CS[0-9]{2}[0-9]{3}[0-9]{15}$',
		'CY':'^CY[0-9]{2}[0-9]{8}[A-Z0-9]{16}$',
		'CZ':'^CZ[0-9]{2}[0-9]{4}[0-9]{16}$',
		'DE':'^DE[0-9]{2}[0-9]{8}[0-9]{10}$',
		'DK':'^DK[0-9]{2}[0-9]{4}[0-9]{10}$',
		'EE':'^EE[0-9]{2}[0-9]{4}[0-9]{12}$',
		'ES':'^ES[0-9]{2}[0-9]{8}[0-9]{12}$',
		'FR':'^FR[0-9]{2}[0-9]{10}[A-Z0-9]{13}$',
		'FI':'^FI[0-9]{2}[0-9]{6}[0-9]{8}$',
		'GB':'^GB[0-9]{2}[A-Z]{4}[0-9]{14}$',
		'GI':'^GI[0-9]{2}[A-Z]{4}[A-Z0-9]{15}$',
		'GR':'^GR[0-9]{2}[0-9]{7}[A-Z0-9]{16}$',
		'HR':'^HR[0-9]{2}[0-9]{7}[0-9]{10}$',
		'HU':'^HU[0-9]{2}[0-9]{7}[0-9]{1}[0-9]{15}[0-9]{1}$',
		'IE':'^IE[0-9]{2}[A-Z0-9]{4}[0-9]{6}[0-9]{8}$',
		'IS':'^IS[0-9]{2}[0-9]{4}[0-9]{18}$',
		'IT':'^IT[0-9]{2}[A-Z]{1}[0-9]{10}[A-Z0-9]{12}$',
		'LI':'^LI[0-9]{2}[0-9]{5}[A-Z0-9]{12}$',
		'LU':'^LU[0-9]{2}[0-9]{3}[A-Z0-9]{13}$',
		'LT':'^LT[0-9]{2}[0-9]{5}[0-9]{11}$',
		'LV':'^LV[0-9]{2}[A-Z]{4}[A-Z0-9]{13}$',
		'MK':'^MK[0-9]{2}[A-Z]{3}[A-Z0-9]{10}[0-9]{2}$',
		'MT':'^MT[0-9]{2}[A-Z]{4}[0-9]{5}[A-Z0-9]{18}$',
		'NL':'^NL[0-9]{2}[A-Z]{4}[0-9]{10}$',
		'NO':'^NO[0-9]{2}[0-9]{4}[0-9]{7}$',
		'PL':'^PL[0-9]{2}[0-9]{8}[0-9]{16}$',
		'PT':'^PT[0-9]{2}[0-9]{8}[0-9]{13}$',
		'RO':'^RO[0-9]{2}[A-Z]{4}[A-Z0-9]{16}$',
		'SE':'^SE[0-9]{2}[0-9]{3}[0-9]{17}$',
		'SI':'^SI[0-9]{2}[0-9]{5}[0-9]{8}[0-9]{2}$',
		'SK':'^SK[0-9]{2}[0-9]{4}[0-9]{16}$',
		'TN':'^TN[0-9]{2}[0-9]{5}[0-9]{15}$',
		'TR':'^TR[0-9]{2}[0-9]{5}[A-Z0-9]{17}$'
	},

	_formatA:[
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
		'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
	],

	_formatN:[
		'10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22',
		'23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'
	],

	_ibanUnsupportedRegionText:'Unsupported IBNA region.',
	_ibanFalseFormatText:'False format.',
	_ibanCheckFailText:'IBAN check has failed.',
	_ibanDefultText:'Unsupported IBNA region.',
	_setIbanError:function (v) {
		this.IBANText = v;
	},
	IBANText:'Unsupported IBNA region',
	IBANMask:/[a-z0-9_]/i,

	IBAN:function (v) {
		v = v.toUpperCase();
		var me = this,
			preg,
			format,
			temp,
			len,
			region = v.substr(0, 2);

		if (!me._ibanregex[region]) {
			me._setIbanError(me._ibanUnsupportedRegionText);
			return false;
		}

		preg = new RegExp(me._ibanregex[region]);
		if (!v.match(preg)) {
			me._setIbanError(me._ibanFalseFormatText);
			return false;
		}

		format = v.substr(4) + v.substr(0, 4);
		// optimizie...maybe...
		for (var x in me._formatA) {
			if (!!me._formatA[x] && !!me._formatN[x]) {
				var reg = new RegExp(me._formatA[x], 'g');
				format = format.replace(reg, me._formatN[x]);
			}
		}
		temp = parseInt(format.charAt(0));
		len = format.length;

		for (var i = 1; i < len; i++) {
			temp *= 10;
			temp += parseInt(format.substr(i, 1));
			temp %= 97;
		}

		if (temp != 1) {
			me._setIbanError(me._ibanCheckFailText);
			return false;
		}
		return true;
	}
});

//tooltip:Lang._('Tooltip for edit'),

// custom blankText 'Checkbox'
Ext.define('Override', {
	override:'Ext.form.field.Checkbox',

	/**
	 * @cfg {Boolean} [allowBlank=true]
	 * Specify false to validate that the value's length must be > 0. If `true`, then a blank value is **always** taken to be valid regardless of any {@link #vtype}
	 * validation that may be applied.
	 *
	 * If {@link #vtype} validation must still be applied to blank values, configure {@link #validateBlank} as `true`;
	 */
	allowBlank:true,

	//<locale>
	/**
	 * @cfg {String} blankText
	 * The error text to display if the **{@link #allowBlank}** validation fails
	 */
	blankText:'This field is required',
	//</locale>

	getErrors:function (value) {
		var me = this,
			errors = me.callParent([value]);

		if (!me.checked && !me.allowBlank) {
			errors.push(me.blankText);
		}

		return errors;
	}
});


// custom 'File'
Ext.define('Ext.form.field.MyFile', {
    extend: 'Ext.form.field.File',
    alias: 'widget.multiplefileuploadfield',

    multiple: true,

    afterRender: function(){
        var me = this;

        me.callParent(arguments);

        if(me.multiple){
            me.fileInputEl.set({
                multiple:'multiple',
                name: me.name ? me.name + '[]' : 'files[]'
            });
        }
    }
});

Ext.define('Ext.form.field.FileButtonOverride', {
    override: 'Ext.form.field.FileButton',

    fireChange: function(e){
        var inp = this.fileInputEl.dom;

        if(!inp.files || !window.FileReader || !inp.files.length){
            this.fireEvent('change', this, e, inp.value);
            return;
        }

        var arrValues = [];
        for (var i = 0; i < inp.files.length; ++i) {
            arrValues.push(inp.files.item(i).name);
        }

        this.fireEvent('change', this, e, arrValues.join(', '));
    }
});

// custom skipDirty 
Ext.override(Ext.form, {
	isDirty:function () {
		return !!this.getFields().findBy(function (f) {
			return !f.skipDirty && !f.readOnly && f.isDirty();
		});
	}
});

// custom Currency 
Ext.define('Ext.ux.form.field.Currency', {
	extend:'Ext.form.field.Number', //Extending the NumberField
	xtype:['currencyfield', 'numericfield'],
	alternateClassName:['Ext.ux.form.field.Numeric', 'Ext.ux.form.NumericField'],
	currencySymbol:'€ ',
	useThousandSeparator:true,
	thousandSeparator:"'",
	alwaysDisplayDecimals:true,
	// MOD - chamacs
	// @private
	isCurrency:false,

	// MOD - pmiguelmartins
	currencySymbolPos:'left', // left , right

	// MOD - chamacs
	//fieldStyle:'text-align:right;',

	// MOD - chamacs
	allowExponential:false,

	/**
	 * initComponent
	 */
	initComponent:function () {
		if (this.useThousandSeparator && this.decimalSeparator == ',' && this.thousandSeparator == ',') {
			this.thousandSeparator = '.';
		} else if (this.allowDecimals && this.thousandSeparator == '.' && this.decimalSeparator == '.') {
			this.decimalSeparator = ',';
		}

		// MOD - chamacs
		this.isCurrency = !Ext.isEmpty(this.currencySymbol);

		this.callParent(arguments);
	},

	/**
	 * setValue
	 */
	setValue:function (value) {
		var me = this,
			bind, valueBind;

		// This portion of the code is to prevent a binding from stomping over
		// the typed value. Say we have decimalPrecision 4 and the user types
		// 1.23456. The value of the field will be set as 1.2346 and published to
		// the viewmodel, which will trigger the binding to fire and setValue to
		// be called on the field, which would then set the value (and rawValue) to
		// 1.2346. Instead, if we have focus and the value is the same, just leave
		// the rawValue alone
		if (me.hasFocus) {
			bind = me.getBind();
			valueBind = bind && bind.value;
			if (valueBind && valueBind.syncing && value === me.value) {
				return me;
			}
		}

		// MOD - chamacs
		Ext.ux.form.field.Currency.superclass.setValue.apply(this, [value != null ? value.toString().replace('.', this.decimalSeparator) :value]);

		this.setRawValue(this.getFormattedValue(this.getValue()));
	},

	/**
	 * getFormattedValue
	 */
	getFormattedValue:function (value) {
		if (Ext.isEmpty(value) || !this.hasFormat()) {
			return value;
		} else {
			var neg = null;

			value = (neg = value < 0) ? value * -1 :value;
			value = this.allowDecimals && this.alwaysDisplayDecimals ? value.toFixed(this.decimalPrecision) :value;

			if (this.useThousandSeparator) {
				if (this.useThousandSeparator && Ext.isEmpty(this.thousandSeparator)) {
					throw ('NumberFormatException:invalid thousandSeparator, property must has a valid character.');
				}
				if (this.thousandSeparator == this.decimalSeparator) {
					throw ('NumberFormatException:invalid thousandSeparator, thousand separator must be different from decimalSeparator.');
				}

				value = value.toString();

				var ps = value.split('.');
				ps[1] = ps[1] ? ps[1] :null;

				var whole = ps[0];

				var r = /(\d+)(\d{3})/;

				var ts = this.thousandSeparator;

				while (r.test(whole)) {
					whole = whole.replace(r, '$1' + ts + '$2');
				}

				value = whole + (ps[1] ? this.decimalSeparator + ps[1] :'');
			}

			// MOD - pmiguelmartins - updated by chamacs
			var position1 = this.isCurrency ? this.currencySymbol + ' ' :'';
			var position2 = value;
			if (this.currencySymbolPos === 'right') {
				position1 = value;
				position2 = this.isCurrency ? ' ' + this.currencySymbol :'';
			}
			return Ext.String.format('{0}{1}{2}', position1, (neg ? '-' :''), position2);
		}
	},

	/**
	 * overrides parseValue to remove the format applied by this class
	 */
	parseValue:function (value) {
		// MOD - chamacs
		//Replace the currency symbol and thousand separator
		return Ext.ux.form.field.Currency.superclass.parseValue.apply(this, [this.removeFormat(value)]);
	},

	/**
	 * Remove only the format added by this class to let the superclass validate with it's rules.
	 * @param {Object} value
	 */
	removeFormat:function (value) {
		// MOD - chamacs
		if (Ext.isEmpty(value)) {
			return '';
		} else if (!this.hasFormat()) {
			return value;
		} else {
			// MOD - bhaidaya
			value = Ext.String.trim(value.toString().replace(this.currencySymbol, ''));

			value = this.useThousandSeparator ? value.replace(new RegExp('[' + this.thousandSeparator + ']', 'g'), '') :value;
			return value;
		}
	},

	/** * Remove the format before validating the the value.
	 * @param {Number} value
	 */
	getErrors:function (value) {
		//FIX data binding by antiplaka
		value = arguments.length > 0 ? value :this.processRawValue(this.getRawValue());
		return this.callParent([this.removeFormat(value)]);
	},

	/**
	 * hasFormat
	 */
	hasFormat:function () {
		return this.decimalSeparator != '.' || (this.useThousandSeparator == true && this.getRawValue() != null) || !Ext.isEmpty(this.currencySymbol) || this.alwaysDisplayDecimals;
	},

	/**
	 * Display the numeric value with the fixed decimal precision and without the format using the setRawValue, don't need to do a setValue because we don't want a double
	 * formatting and process of the value because beforeBlur perform a getRawValue and then a setValue.
	 */
	onFocus:function () {
		this.setRawValue(this.removeFormat(this.getRawValue()));

		this.callParent(arguments);
	},

	/**
	 * MOD - Jeff.Evans
	 */
	processRawValue:function (value) {
		return this.removeFormat(value);
	},

	setMinValue:function (value) {
		if (!this.allowThousandSeparator)
			return this.callParent(arguments);
		var me = this,
			ariaDom = me.ariaEl.dom,
			minValue, allowed, ariaDom;

		me.minValue = minValue = Ext.Number.from(value, Number.NEGATIVE_INFINITY);
		me.toggleSpinners();

		// May not be rendered yet
		if (ariaDom) {
			if (minValue > Number.NEGATIVE_INFINITY) {
				ariaDom.setAttribute('aria-valuemin', minValue);
			} else {
				ariaDom.removeAttribute('aria-valuemin');
			}
		}

		// Build regexes for masking and stripping based on the configured options
		if (me.disableKeyFilter !== true) {
			allowed = me.baseChars + '';

			if (me.allowExponential) {
				allowed += me.decimalSeparator + '.' + 'e+-';
			} else {
				//allowed += Ext.util.Format.thousandSeparator;
				if (me.allowDecimals) {
					allowed += me.decimalSeparator + '.';
				}
				if (me.minValue < 0) {
					allowed += '-';
				}
			}

			allowed = Ext.String.escapeRegex(allowed);
			me.maskRe = new RegExp('[' + allowed + ']');
			if (me.autoStripChars) {
				me.stripCharsRe = new RegExp('[^' + allowed + ']', 'gi');
			}
		}
	}

});

/* ext62 custom sprite.Bar */
if (fullVersion < 7){
Ext.define(null, {
	override:'Ext.chart.series.sprite.Bar',

	renderClipped:function (surface, ctx, dataClipRect, surfaceClipRect) {
		if (this.cleanRedraw) {
			return;
		}

		// eslint-disable-next-line vars-on-top
		var me = this,
			attr = me.attr,
			dataX = attr.dataX,
			dataY = attr.dataY,
			dataText = attr.labels,
			dataStartY = attr.dataStartY,
			groupCount = attr.groupCount,
			groupOffset = attr.groupOffset - (groupCount - 1) * 0.5,
			inGroupGapWidth = attr.inGroupGapWidth,
			lineWidth = ctx.lineWidth,
			matrix = attr.matrix,
			xx = matrix.elements[0],
			yy = matrix.elements[3],
			dx = matrix.elements[4],
			dy = surface.roundPixel(matrix.elements[5]) - 1,
			maxBarWidth = Math.abs(xx) - attr.minGapWidth,
			minBarWidth = (Math.min(maxBarWidth, attr.maxBarWidth) -
				inGroupGapWidth * (groupCount - 1)) / groupCount,
			barWidth = surface.roundPixel(Math.max(attr.minBarWidth, minBarWidth)),
			surfaceMatrix = me.surfaceMatrix,
			left, right, bottom, top, i, center,
			halfLineWidth = 0.5 * attr.lineWidth,
			// Finding min/max so that bars render properly in both LTR and RTL modes.
			min = Math.min(dataClipRect[0], dataClipRect[2]),
			max = Math.max(dataClipRect[0], dataClipRect[2]),
			start = Math.max(0, Math.floor(min)),
			end = dataX.length - 1, // EXTJS-28455 Bar chart cutoff due to wrong length
			isDrawLabels = dataText && me.getMarker('labels'),
			yLow, yHi;

		// The scaling (xx) and translation (dx) here will already be such that the midpoints
		// of the first and last bars are not at the surface edges (which would mean that
		// bars are half-clipped), but padded, so that those bars are fully visible
		// (assuming no pan/zoom).
		for (i = start; i <= end; i++) {
			yLow = dataStartY ? dataStartY[i] :0;
			yHi = dataY[i];
			center = dataX[i] * xx + dx + groupOffset * (barWidth + inGroupGapWidth);
			left = surface.roundPixel(center - barWidth / 2) + halfLineWidth;
			top = surface.roundPixel(yHi * yy + dy + lineWidth);
			right = surface.roundPixel(center + barWidth / 2) - halfLineWidth;
			bottom = surface.roundPixel(yLow * yy + dy + lineWidth);

			me.drawBar(ctx, surface, dataClipRect, left, top - halfLineWidth, right,
				bottom - halfLineWidth, i);

			// We want 0 values to be passed to the renderer
			if (isDrawLabels && dataText[i] != null) {
				me.drawLabel(dataText[i], center, bottom, top, i, surfaceClipRect);
			}

			me.putMarker('markers', {
				translationX:surfaceMatrix.x(center, top),
				translationY:surfaceMatrix.y(center, top)
			}, i, true);
		}
	}
});
}

//gmaps Cannot read properties of null (reading 'style')
Ext.define('Overrides.dom.UnderlayPool', {
    override: 'Ext.dom.UnderlayPool',
    /**
     * Override to check if el is destroyed
     */
    checkOut: function() {
        var el = this.cache.shift();

        // If el is destroyed shift again
        if (el && el.isDestroyed) {
            el = this.cache.shift();
        }

        if (!el) {
            el = Ext.Element.create(this.elementConfig);
            el.setVisibilityMode(2);


            el.dom.setAttribute('data-sticky', true);
        }
        return el;
    }
});

//override TabPanel
Ext.override(Ext.TabPanel,{	
	blinkTab : function(tab){
		tab = Ext.isNumber(tab) ? this.getComponent(tab) : tab;
			
		var task;
		var objTab = Ext.get(this.getTabEl(tab));
		
		if (!objTab || objTab._blinking ){
			return;
		}
		
		objTab._blinking = true;
			
		task = Ext.TaskMgr.start({
			 scope	  : this
			,interval : 500
			,run	  : function()
			{
				if(task.taskRunCount == 10)
				{
					Ext.TaskMgr.stop(task);
					objTab.addClass('ext-ux-tab-orange');
					objTab._blinking = false;
					return;
				}
				
				objTab.toggleClass('ext-ux-tab-orange');
			}
		});
		
		var stopBlink = function(){
			objTab._blinking = false;	
			Ext.TaskMgr.stop(task);
			objTab.removeClass('ext-ux-tab-orange');
			
			tab.un('activate',stopBlink,this);
			if(tab.el){
				tab.mun(tab.el,'click',stopBlink,this);
			}						
		};
		
		tab.on('activate',stopBlink,this,{single:true});
		if(tab.el){
			tab.mon(tab.el,'click',stopBlink,this,{single:true});
		}
	}
});


//*************************************************************************************************************//
//				GENERIC
//*************************************************************************************************************//

Custom.ArrayToString = function (record) {
	var selectedRowDataString = '';
	var selectedRowData = [];
	Ext.iterate(record, function (key, value) {
		//log(key+ ' '+ value);
		selectedRowData[key] = value;
		valueappo = value;
		if (toType(value) == 'date') {
			value = Custom.yyyymmdd(value);
		}
		selectedRowDataString += key + '=' + value + '&';
	});
	return selectedRowDataString;
}
Custom.isNumber = function (n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
Custom.IsNullOrEmptyOrZeroString = function (obj) {
	return (obj === "null" || obj === "undefined" || obj === null || obj === undefined || obj == '0' || obj == 0) ? true :false;
}
Custom.IsNOTNullOrEmptyOrZeroString = function (obj) {
	return !(Custom.IsNullOrEmptyOrZeroString(obj));
}
Custom.isJson = function (str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
Custom.isStore = function (store) {
	return store && (store instanceof Ext.data.Store);

	//or pick a class method that any store should have
	return store && ('loadRecords' in store);
}
Custom.isNotNull = function (obj) {
	return obj && obj !== "null" && obj !== "undefined";
}
Custom.getURL = function (urlVarName) {
	var urlHalves = decodeURIComponent(String(document.location));
	urlHalves = urlHalves.split('?');
	return urlHalves[0];
}
Custom.getURLVar = function (urlVarName) {
	var urlHalves = decodeURIComponent(String(document.location));
	urlHalves = urlHalves.split('?');
	var urlVarValue = '';
	if (urlHalves[1]) {
		var urlVars = urlHalves[1].split('&');
		for (i = 0; i <= (urlVars.length); i++) {
			if (urlVars[i]) {
				var urlVarPair = urlVars[i].split('=');
				if (urlVarPair[0] && urlVarPair[0] == urlVarName) {
					urlVarValue = urlVarPair[1];
				}
			}
		}
	}
	return urlVarValue;
}
Custom.openLinkInNewWindow = function (strUrl, strWindowName, external = false) {
	if (strUrl != '') {
		if (external == false) {
			strUrl = strUrl + "&theme=classic%20azzurra";
			//strUrl = strUrl + "&theme=" + themeName;
		}
		var windowObjectReference = window.open(strUrl, strWindowName, 'resizable,scrollbars,status');
		if (windowObjectReference == null)
			Ext.MessageBox.show({
				title:"Abilitazione PopUp",
				msg:'Please change your popup settings ',
				icon:Ext.MessageBox.ERROR,
				buttons:Ext.Msg.OK
			});
		else {
			windowObjectReference.moveTo(0, 0);
			windowObjectReference.resizeTo(screen.width, screen.height);
		}
	} else {
		strUrl = '';
		location.reload(false);
	}
}
Custom.UTCToLocalTime = function (d) {
	timeOffsetInHours = (new Date().getTimezoneOffset() / 60) * (-1);
	d.setHours(d.getHours() + timeOffsetInHours);
	return d;
}
Custom.setCurrentPanelForm = function (panelParent) {
	while (true) {

		//TabPanel
		var parentTabPanel = panelParent.up('tabpanel');
		if ((parentTabPanel != undefined) && (parentTabPanel != null)) {
			panelParent = parentTabPanel.up('panel');
		}

		//is Window
		if (panelParent.xtype == 'window') {
			CurrentWindow = panelParent;
			CurrentPanel = CurrentWindow.down('form');
			CurrentToolBar = CurrentWindow.getComponent('toolbarmenu')
			CurrentPanelRaw = CurrentPanel.definitionraw;
		}

		//"centerViewPortId"
		if (panelParent.id == 'centerViewPortId') {
			CurrentWindow = MainViewPort.getComponent('centerViewPortId');
			CurrentPanel = CurrentWindow.down("form");
			CurrentToolBar = CurrentWindow.getComponent('toolbarmenu')
			CurrentPanelRaw = CurrentPanel.definitionraw;
			break;
		}

		//parent is Window
		var parentWindow = panelParent.up('window');
		if ((parentWindow != undefined) && (parentWindow != null)) {
			CurrentWindow = panelParent.up('window');
			CurrentPanel = CurrentWindow.down('form');
			CurrentToolBar = CurrentWindow.getComponent('toolbarmenu')
			CurrentPanelRaw = CurrentPanel.definitionraw;
			break;
		}

		//Panel
		if (panelParent.hasOwnProperty('name')) {
			if (panelParent.name == 'DesignPanel') {
				CurrentPanel = panelParent;
				CurrentWindow = MainViewPort.getComponent('centerViewPortId');
				CurrentToolBar = CurrentWindow.getComponent('toolbarmenu')
				CurrentPanelRaw = CurrentPanel.definitionraw;
				break;
			}
		} else {
			break;
		}

		//scale to top
		panelParent = panelParent.up('panel');
		if ((panelParent == undefined) || (panelParent == null)) {
			break;
		}
	}
}
Custom.resetInvalidFields = function (CurrentForm) {
	Ext.suspendLayouts();
	CurrentForm.getFields().filterBy(function (field) {
		if (field.validate()) return;
		field.allowBlank = true;
	});
	Ext.resumeLayouts(true);
},
function animate(target, opacityFrom, opacityTo, interval) {
    var anim = Ext.create('Ext.fx.Anim', {
        target: target,
        duration: interval,
        from: {
            opacity: opacityFrom
        },
        to: {
            opacity: opacityTo
        }
    });
    anim.on("afteranimate", function () {
        if (opacityFrom == 1) {
			beep();
            animate(target, 0, 1,1000);
        } else {
            animate(target, 1, 0,1000);
        }

    }, this, {
        single: true
    });
}
function beep() {
    var snd = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
    snd.play();
}
function clone(obj) {
	if (obj == null || typeof (obj) != 'object') return obj;

	var temp = new obj.constructor();
	for (var key in obj)
		temp[key] = clone(obj[key]);
	return temp;
}

function count_obj(obj) {
	var i = 0;
	for (var key in obj) {
		++i;
	}

	return i;
}

function sumArraysInObject(obj) {
	var result = [];
	Ext.Object.each(obj, function (key, value, myself) {
		if ((typeof value != 'object') && (typeof value != 'function')) {
			result[key] = value;
		} else {
			result[key] = 'array';
		}
	})
	return result;
}
Object.size = function (obj) {
	var size = 0,
		key;
	for (key in obj) {
		if (obj.hasOwnProperty(key)) size++;
	}
	return size;
};

function strip(key) {
	if (key.indexOf('-----') !== -1) {
		return key.split('-----')[2].replace(/\r?\n|\r/g, '');
	}
}
Custom.yyyymmdd = function (usrdate) {
	var yyyy = usrdate.getFullYear().toString();
	var mm = (usrdate.getMonth() + 1).toString(); // getMonth() is zero-based
	var dd = usrdate.getDate().toString();
	if (dd < 10) {
		dd = "0" + dd;
	}
	if (mm < 10) {
		mm = "0" + mm;
	}
	return yyyy + '-' + (mm[1] ? mm :"0" + mm[0]) + '-' + (dd[1] ? dd :"0" + dd[0]); // padding
}

function nvl(obj, defaultValue) {
	if (Custom.isNotNull(obj) == true) {
		return defaultValue;
	} else {
		return obj;
	}
}

function pad(num, size) {
	var s = num + "";
	while (s.length < size) s = "0" + s;
	return s;
}

String.prototype.alphaNumeric = function () {
		return this.replace(/[^a-z0-9]/gi, '');
	}
	/*
	Object.defineProperty(String.prototype, 'like', {
		value:function (that) {
			Str = this.toLowerCase();
			Str = Str.alphaNumeric();
			StrSearch = that.toLowerCase();
			StrSearch = StrSearch.alphaNumeric();
			if (Str.indexOf(StrSearch) == -1) {
				return false;
			} else {
				return true;
			}
		}
	});
	*/
var ExecuteOnObjectPropertyExist = function (subObjectItems, name, namefunction) {
	if (subObjectItems) {
		if ((subObjectItems.length === undefined)) {
			var appo = subObjectItems;
			subObjectItems = [];
			subObjectItems[0] = appo;
		}
		for (var i = 0; i < subObjectItems.length; i++) {
			if (subObjectItems[i][name] !== undefined) {
				log('ExecuteOnObjectPropertyExist Obj:' + subObjectItems[i].name);
				if (namefunction.indexOf("(") > 0) {
					namefunction = namefunction.replace('objparam', 'subObjectItems[i]');
					eval(namefunction + ';');
				} else {
					eval(namefunction + '(subObjectItems[i]);');
				}
				//return subObjectItems[i];
			}
			var found = ExecuteOnObjectPropertyExist(subObjectItems[i].items, name, namefunction);
			if (found) return found;
		}
	}
};
var ExecuteOnObjectPropertyValue = function (subObjectItems, name, valuekey, namefunction) {
	if (subObjectItems) {
		if ((subObjectItems.length === undefined)) {
			var appo = subObjectItems;
			subObjectItems = [];
			subObjectItems[0] = appo;
		}
		for (var i = 0; i < subObjectItems.length; i++) {
			if (subObjectItems[i][name] == valuekey) {
				log('ExecuteOnObjectPropertyValue Obj:' + subObjectItems[i].name + ' Property:' + name);
				if (namefunction.indexOf("(") > 0) {
					namefunction = namefunction.replace('objparam', 'subObjectItems[i]');
					eval(namefunction + ';');
				} else {
					eval(namefunction + '(subObjectItems[i]);');
				}
				//return subObjectItems[i];
			}
			var found = ExecuteOnObjectPropertyValue(subObjectItems[i].items, name, valuekey, namefunction);
			if (found) return found;
		}
	}
};
var getSubItemFromName = function (subItems, name) {
	if (subItems) {
		if ((subItems.length === undefined)) {
			var appo = subItems;
			subItems = [];
			subItems[0] = appo;
		}
		for (var i = 0; i < subItems.length; i++) {
			if (subItems[i].name == name) {
				return subItems[i];
			}
			var found = getSubItemFromName(subItems[i].items, name);
			if (found) return found;
		}
	}
};
var getSubItemFromDataSourceField = function (subItems, datasourcefield) {
	if (subItems) {
		for (var i = 0; i < subItems.length; i++) {
			if (subItems[i].datasourcefield == datasourcefield) {
				return subItems[i];
			}
			var found = getSubItemFromDataSourceField(subItems[i].items, datasourcefield);
			if (found) return found;
		}
	}
};
var removeSubItemFromName = function (subItems, name) {
	if (subItems) {
		for (var i = 0; i < subItems.length; i++) {
			if (subItems[i].name == name) {
				subItems.splice(i, 1);
				return subItems[i];
			}
			var found = removeSubItemFromName(subItems[i].items, name);
			if (found) return found;
		}
	}
};

//*************************************************************************************************************//
//			GRID PLUNGINS
//*************************************************************************************************************//

var rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
	//clicksToMoveEditor:1,
	clicksToEdit:2,
	pluginId:'roweditingId',
	//autoCancel:false,
	listeners:{
		beforeedit:function (editor, e, opt) {
				log(editor); //Contains the variables that should have been in the e var
				log(e);
				log(opt); //undefined
				//return editor.record.get('status'); 
				//you can update the above logic to something else
				//based on your criteria send false to stop editing
			}
			/*
		edit:function( editor, context, eOpts){
		var grid = Ext.ComponentQuery.query('#griditemId')[0];
		var store = grid.getView().getStore();

		var txtColIdx = 1; 
		var textfieldRef = context.grid.columns[txtColIdx].getEditor(context.record); 
		var tetxfieldValue = textfieldRef.getValue(); //OK

		context.record.set('theme', tetxfieldValue); //PROBLEM HERE ???
		store.sync(); //Just this or do I need to send a different request to server
		},
		canceledit :function ( editor, context, eOpts ){
		var grid = Ext.ComponentQuery.query('#griditemId')[0];
		var store = grid.getView().getStore();
		var record = grid.getSelectionModel().getSelection();
		store.remove(record);
		}
		*/
	}
});
var cellEditing = Ext.create('Ext.grid.plugin.CellEditing', {
	clicksToEdit:2
});
var rowWidget = Ext.create('Ext.grid.plugin.RowWidget', {
	widget:{
		xtype:'dynamicgrid',
		autoLoad:true,
	}
});

var toType = function (obj) {
	return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}
var ComboRenderer = function (val, metaData) {
	var combo = metaData.column.getEditor();
	if (val && combo && combo.store && combo.displayField) {
		var index = combo.store.findExact(combo.valueField, val);
		if (index >= 0) {
			return combo.store.getAt(index).get(combo.displayField);
		}
	}
	return val;
};

Ext.define('dynamiccheckcolumn', {
	extend:'Ext.grid.column.CheckColumn',
	alias:'widget.dynamiccheckcolumn',

	renderTpl:[
		'<div id="{id}-titleEl" data-ref="titleEl" {tipMarkup}class="', Ext.baseCSSPrefix, 'column-header-inner<tpl if="!$comp.isContainer"> ', Ext.baseCSSPrefix, 'leaf-column-header</tpl>',
		'<tpl if="empty"> ', Ext.baseCSSPrefix, 'column-header-inner-empty</tpl>">',

		'<span class="', Ext.baseCSSPrefix, 'column-header-text-container">',
		'<span class="', Ext.baseCSSPrefix, 'column-header-text-wrapper">',
		'<span id="{id}-textContainerEl" data-ref="textContainerEl" class="', Ext.baseCSSPrefix, 'column-header-text',
		'{childElCls}">',
		'<div class="', Ext.baseCSSPrefix, 'grid-checkcolumn" role="button" src="' + Ext.BLANK_IMAGE_URL + '"></div>',
		'</span>',
		'</span>',
		'</span>',
		'<tpl if="!menuDisabled">',
		'<div id="{id}-triggerEl" data-ref="triggerEl" role="presentation" class="', Ext.baseCSSPrefix, 'column-header-trigger',
		'{childElCls}" style="{triggerStyle}"></div>',
		'</tpl>',
		'</div>',
		'{%this.renderContainer(out,values)%}'
	],

	constructor:function (config) {
		var me = this;

		Ext.apply(config, {
			stopSelection:true,
			sortable:false,
			draggable:false,
			resizable:false,
			menuDisabled:true,
			hideable:false,
			tdCls:'no-tip',
			defaultRenderer:me.defaultRenderer,
			checked:false
		});

		me.callParent([config]);

		me.on('headerclick', me.onHeaderClick);
		me.on('selectall', me.onSelectAll);

	},

	getHeaderCheckboxEl:function (header) {
		return header.getEl().down("." + Ext.baseCSSPrefix + 'grid-checkcolumn');
	},

	onHeaderClick:function (headerCt, header, e, el) {
		var me = this,
			grid = headerCt.grid,
			checkboxEl = me.getHeaderCheckboxEl(header);

		if (!me.checked) {
			me.fireEvent('selectall', grid.getStore(), header, true);
			checkboxEl.addCls(Ext.baseCSSPrefix + 'grid-checkcolumn-checked');
			me.checked = true;
		} else {
			me.fireEvent('selectall', grid.getStore(), header, false);
			checkboxEl.removeCls(Ext.baseCSSPrefix + 'grid-checkcolumn-checked');
			me.checked = false;
		}

	},

	onSelectAll:function (store, column, checked) {
		var dataIndex = column.dataIndex;
		var groups = store.getGroups();
		//var groupRecord = this.getRecordGroup(event.record);

		if (groups) {
			var groupName = column.up('panel').getSelectionModel().getSelection()[0].data[groups._grouper._property];
			if (groupName == null) groupName = "";
			Ext.each(groups.items, function (groupRec) {
				var groupKey = groupRec.getGroupKey();
				if (groupKey == groupName) {
					groupRec.each(function (rec) {
						if (checked) {
							rec.set(dataIndex, true);
						} else {
							rec.set(dataIndex, false);
						}
					}, this);
				}
			});
		} else {
			for (var i = 0; i < store.getCount(); i++) {
				var record = store.getAt(i);
				if (checked) {
					record.set(dataIndex, true);
				} else {
					record.set(dataIndex, false);
				}
			}
		}
	}
});

Ext.define('dynamicimagecolumn', {
	extend:'Ext.grid.column.Column',
	alias:'widget.dynamicimagecolumn',

	constructor:function () {
		this.addEvents(
			/**
			 * @event checkchange
			 * Fires when the checked state of a row changes
			 * @param {Ext.ux.CheckColumn} this
			 * @param {Number} rowIndex The row index
			 * @param {Boolean} checked True if the box is checked
			 */
			'checkchange'
		);
		this.callParent(arguments);
	},

	processEvent:function (type, view, cell, recordIndex, cellIndex, e) {
		if (type == 'mousedown' || (type == 'keydown' && (e.getKey() == e.ENTER || e.getKey() == e.SPACE))) {
			var record = view.panel.store.getAt(recordIndex);
			var Riga = clone(record.data);
			var ValRiga = Riga[columnname];

			//do not change data and fire checkchange event if it's iOS
			if (record.get('os') != 'iOS') {
				dataIndex = this.dataIndex;
				checked = !record.get(dataIndex);
				record.set(dataIndex, checked);
				//this.fireEvent('checkchange', this, recordIndex, checked);
				grid.grid.processOnButton(grid, rowIndex, record, columnkeys.procremoteonclick, 'FILENAME=' + ValRiga);
			}
			return false;
		} else {
			return this.callParent(arguments);
		}
	},

	renderer:function (value, metaData, record) {
		if (value.match(/.(jpg|jpeg|png|gif|bmp|tiff)$/i)) {
			return '<img src="includes/io/CallFile.php?fileid=' + value + '" alt="image" width=100 height=100 class="imageZoomCls" />';
		} else if (value.match(/.(dxf|dwg|stl)$/i)) {
			return '<img src="repositorycom/iconfilecad.png" alt="image" />';
		} else if (value.match(/.(xls|xlsx)$/i)) {
			return '<img src="repositorycom/iconfilexls.png" alt="image" />';
		} else if (value.match(/.(doc|docx)$/i)) {
			return '<img src="repositorycom/iconfiledoc.png" alt="image" />';
		} else if (value.match(/.(pdf)$/i)) {
			return '<img src="repositorycom/iconfilepdf.png" alt="image" />';
		} else if (value.match(/.(zip|7z|rar)$/i)) {
			return '<img src="repositorycom/iconfilezip.png" alt="image" />';
		} else {
			return '<img src="repositorycom/iconfile.png" alt="image" />';
		}
	},

	constructor:function (config) {
		var me = this;

		Ext.apply(config, {
			stopSelection:true,
			sortable:false,
			draggable:false,
			resizable:true,
			menuDisabled:true,
			hideable:true,
			tdCls:'no-tip',
			defaultRenderer:me.defaultRenderer,
			checked:false
		});

		me.callParent([config]);
	}
});

/*
Ext.define('Ext.o.grid.filters.filter.String', {
	override:'Ext.grid.filters.filter.String',
	operator:'=',

	setValue:function (value) {
		var me = this;

		if (!value) value = null;
		//if (!value && me.allowEmptyFilter) me.filter.setOperator('=');
		if (!value ) me.filter.setOperator('=');
		else me.filter.setOperator('like');

		if (me.inputItem) {
			me.inputItem.setValue(value);
		}

		me.filter.setValue(value);

		if (value && me.active) {
			me.value = value;
			me.updateStoreFilter();
		//} else if (!value && me.active && me.allowEmptyFilter) {
		} else if (!value && me.active) {
			me.value = value;
			me.updateStoreFilter();
		} else {
			me.setActive(!!value);
		}
	}
});
*/
//*************************************************************************************************************//
//				DRAG&DROP
//*************************************************************************************************************//

Ext.define('myPanelDropTarget', {
	extend:'Ext.dd.DropTarget',
	notifyEnter:function (source, e, data) {
		log('enter');
		return this.callParent(arguments);
	},
	notifyOut:function (source, e, data) {
		log('out');
		return this.callParent(arguments);
	},
	notifyOver:function (source, e, data) {
		log('over');
		return this.callParent(arguments);
	},
	notifyDrop:function (source, e, data) {
		log('drop');

		var pos = e.getXY();
		var posx = pos[0];
		var posy = pos[1];

		var elementMouseIsOver = document.elementFromPoint(posx, posy);
		var elementMouseIsOverExt = Ext.get(elementMouseIsOver.id).component;
		log('Mouse:' + elementMouseIsOver);

		if (CurrentLastPanelId != '') {
			//creo il nuovo oggetto e lo aggiungo all array oggetti
			CurrentObjectId = '';
			CurrentObjectName = Custom.ObjAdd(data.records[0].data, posx, posy, CurrentLastPanelId);

			//aggiorno visualizzazione
			Custom.FormRender();

			//aggiorno propertygrid
			log('propertyingrid');
			Custom.ObjInPropertyGrid(CurrentObjectName);
		} else {
			Ext.Msg.alert("Errore oggetto panel nn riconosciuto", "oggetto panel");
			return false;
		}
	}
});

Ext.define("Ext.ux.form.field.RemoteToLocalComboBox", {
	extend:'Ext.AbstractPlugin',
	alias:'plugin.remotetolocalcombo',
	init:function (combo) {
		this.combo = combo;
		combo.queryMode = 'remote';
		this.callParent();

		combo.getStore().on('load', this.onComboStoreLoad, this);
	},
	onComboStoreLoad:function () {
		Ext.apply(this.combo, {
			queryMode:'local'
		});
	}
});

//*************************************************************************************************************//
//				MENU 
Ext.define("dynamicmenu", {
	extend:"Ext.menu.Menu",
	alias:'widget.dynamicmenu',
	loaded:false,
	loadMsg:'Loading...',
	store:undefined,
	icon:'',
	layout:'hbox',
	items:[{
		text:'regular item 1'
	}, {
		text:'regular item 2'
	}, {
		text:'regular item 3'
	}],
	margin:'0 0 10 0',
	floating:false,
	plain:true,
	constructor:function (config) {
		var me = this;
		Ext.apply(me, config);
		me.callParent();
	},
	initComponent:function () {
		var me = this;
		me.callParent(arguments);
		me.on('show', me.onMenuLoad, me);
		listeners = {
			scope:me,
			load:me.onLoad,
			beforeload:me.onBeforeLoad
		};
		me.mon(me.store, listeners);
	},
	onMenuLoad:function () {
		var me = this;
		if (!me.store.loaded) me.store.load();
	},
	onBeforeLoad:function (store) {
		this.updateMenuItems(false);
	},
	onLoad:function (store, records) {
		this.updateMenuItems(true, records);
	},
	updateMenuItems:function (loadedState, records) {
		var me = this;
		me.removeAll();
		if (loadedState) {
			me.setLoading(false, false);
			Ext.Array.each(records, function (record, index, array) {
				me.add({
					text:record.get('DESCNAME'),
					data:record.get('ID'),
					value:record.get('ID'),
					icon:record.get('ICONCLS'),
				});

			});
			me.store.loaded = true;
		} else {
			me.add({
				width:75,
				height:40
			});
			me.setLoading(me.loadMsg, false);
		}
		me.loaded = loadedState;
	}
});

//*************************************************************************************************************//
//				GEOMETRICAL 
Math.getDistance = function (x1, y1, x2, y2) {

	var xs = x2 - x1,
		ys = y2 - y1;

	xs *= xs;
	ys *= ys;

	return Math.sqrt(xs + ys);
}

function RotoTransZoom(obj) {
	if (obj.XOFFSET != 0) {
		obj.X = obj.X + obj.XOFFSET
	}
	if (obj.YOFFSET != 0) {
		obj.Y = obj.Y + obj.YOFFSET
	}
	if (obj.GRAD != 0) {
		obj.RAD = obj.GRAD * 3.14 * 2 / 360;
		obj.X = obj.XCENTRE + obj.X * Math.cos(obj.RAD) - obj.Y * Math.sin(obj.RAD);
		obj.Y = obj.YCENTRE + obj.X * Math.sin(obj.RAD) + obj.Y * Math.cos(obj.RAD);
	}
	if (obj.SCALE != 100) {
		obj.X = obj.X * (obj.SCALE / 100);
		obj.Y = obj.Y * (obj.SCALE / 100);
	}
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}
Ext.define('DraggyDraw', {
	extend:'Ext.draw.Component',
	xtype:'draggydraw',

	isDragging:false,
	startX:0,
	startY:0,
	translationX:0,
	translationY:0,
	target:null,

	listeners:{
		element:'element',
		scope:'this',
		mousedown:'onMouseDown',
		mousemove:'onMouseMove',
		mouseup:'onMouseUp',
		mouseleave:'onMouseUp'
	},

	findTarget:function (sprites, x, y) {
		var me = this,
			sprite,
			i, ln;

		if (me.target) {
			me.target.setAttributes({
				strokeStyle:'black'
			});
		}
		for (i = sprites.length - 1; i >= 0; i--) {
			sprite = sprites[i];
			if (sprite.isComposite) {
				var lastobj = sprite.getBBox();
				if (x > lastobj.x && x < lastobj.x + lastobj.width && y > lastobj.y && y < lastobj.y + lastobj.height) {
					me.target = sprite;
					return sprite;
				}
			} else {
				if (sprite.isPath && sprite.isPointInPath(x, y)) {
					me.target = sprite;
					return sprite;
				}
			}
		}
	},

	onMouseDown:function (e) {
		var me = this,
			surface = me.getSurface(),
			sprites = surface.getItems(),
			xy = surface.getEventXY(e),
			x = xy[0],
			y = xy[1],
			target;

		target = me.findTarget(sprites, x, y);

		if (target) {
			console.log('selected ' + target.id);
			target.setAttributes({
				strokeStyle:'red'
			});
			me.isDragging = true;
			me.startX = x;
			me.startY = y;
			me.translationX = target.attr.translationX;
			me.translationY = target.attr.translationY;
		}
	},

	onMouseMove:function (e) {
		var me = this,
			surface = me.getSurface(),
			sprites = surface.getItems(),
			xy = surface.getEventXY(e),
			x = xy[0],
			y = xy[1],
			deltaX, deltaY,
			sprite, target,
			points,
			i, ln;

		if (me.isDragging) {
			deltaX = x - me.startX;
			deltaY = y - me.startY;
			me.target.setAttributes({
				translationX:me.translationX + deltaX,
				translationY:me.translationY + deltaY
			});
			if (me.target.updatePlainBBox) {
				me.target.updatePlainBBox(me.target);
			}
		} else {
			target = me.findTarget(sprites, x, y);
			if (target) {
				target.setAttributes({
					strokeStyle:'red'
				});
			}
		}
		surface.renderFrame();
	},

	onMouseUp:function (e) {
		var me = this,
			surface = me.getSurface();
		me.isDragging = false;
		surface.renderFrame();
	}
});

Ext.define('overrides.form.trigger.Trigger', {
	override:'Ext.form.trigger.Trigger',

	renderTrigger:function (fieldData) {
		var me = this,
			width = me.width,
			triggerStyle = me.hidden ? 'display:none;' :'';

		if (width) {
			triggerStyle += 'width:' + width;
		}

		if (me.glyph) {
			me.glyph = Ext.Glyph.fly(me.glyph);
		}

		return Ext.XTemplate.getTpl(me, 'renderTpl').apply({
			$trigger:me,
			fieldData:fieldData,
			ui:fieldData.ui,
			childElCls:fieldData.childElCls,
			triggerId:me.domId = me.field.id + '-trigger-' + me.id,
			cls:me.cls,
			glyph:me.glyph,
			triggerStyle:triggerStyle,
			extraCls:me.extraCls,
			baseCls:me.baseCls,
			ariaRole:me.ariaRole
		});
	},

	renderTpl:[
		'<div id="{triggerId}" class="{baseCls} {baseCls}-{ui} {cls} {cls}-{ui} {extraCls} ',
		'{childElCls}"<tpl if="triggerStyle"> style="{triggerStyle}"</tpl>',
		'<tpl if="glyph"> style="font-family:{glyph.fontFamily} !important; vertical-align:middle !important; background:-webkit-linear-gradient(top, #fff, #f9f9f9 80%, #e2e2e2 80%, #e7e7e7)!important;"</tpl>',
		'<tpl if="ariaRole"> role="{ariaRole}"<tpl else> role="presentation"</tpl>',
		'>',
		'{[values.$trigger.renderBody(values)]}',
		'<tpl if="glyph">{glyph.character}</tpl>',
		'</div>'
	],

	afterFieldRender:function () {
		var fontAwesomeSize = Math.min(this.el.getWidth(), this.el.getHeight());
		this.el.dom.style.fontSize = Math.floor(0.8 * fontAwesomeSize) + 'px';
		this.callParent();
	},

	setGlyph:function (glyph) {
		var glyphCharacter = this.glyph.setGlyph(glyph).character;
		this.getEl().el.dom.innerText = glyphCharacter;
	}
});

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}



//*************************************************************************************************************//
//				IFRAME INTERFACE
//*************************************************************************************************************//

window.onmessage = function(ev){
	const msg = JSON.parse(ev.data);
	
	if ( msg.sender == 'SVGEditor') {
		//sender: "SVGEditor: " , event: "click" , objectId : idElement
		console.log(msg.eventField);
		CurrentPanel = Ext.ComponentQuery.query('[name=' + msg.eventPanel +']')[0];
		Custom.setCurrentPanelForm(CurrentPanel);
		var CurrentForm = CurrentPanel.getForm();
		var obj = CurrentForm.findField(msg.eventField);
		
		if ((obj !== undefined) && (obj !== null)){
			obj.setValue(msg.objectId);
			Custom.FormSaveVar(obj.name, msg.objectId);
			//Custom.RefreshAllDataStore();
			//var ProcessID = CurrentForm.findField(msg.eventProcess);
			
			if ((msg.eventProcess !== undefined) && (msg.eventProcess !== null)){
				Custom.ExecuteProc(msg.eventProcess);
				Custom.FormDataSave();
			}
			else{
				Ext.MessageBox.show({
					title:"SVG Editor Not defined processPointSVG  ",
					msg:'Please change your layout adding processPointSVG in SVGObject and add Process with same name/id',
					icon:Ext.MessageBox.ERROR,
					buttons:Ext.Msg.OK
				});
			}
			
			
		}
		else{
			Ext.MessageBox.show({
				title:"SVG Editor Not defined fieldPointSVG  ",
				msg:'Please change your layout adding fieldPointSVG in SVGObject and add Object with same name',
				icon:Ext.MessageBox.ERROR,
				buttons:Ext.Msg.OK
			});
		}
		console.log(msg);
	}
    else if (msg.sender == 'message') {
        console.log('messageaaaaaaaaaaaaaaaaa');
		console.log(msg);
    }
    else {
        console.log('none messageaaaaaaaaaaaaaaaaa');
		console.log(msg);
    }
};

//*************************************************************************************************************//
//				USB PORT INTERFACE
//*************************************************************************************************************//

class SerialScaleController {
	constructor() {
		this.encoder = new TextEncoder();
		this.decoder = new TextDecoder();
		this.port = null;
		this.reader = null;
	}
	async init() {
		if ('serial' in navigator) {
			try {
				this.port = await navigator.serial.requestPort();
				await this.port.open({
					baudRate:9600
				});
				this.reader = this.port.readable.getReader();
				let signals = await this.port.getSignals();
				this.reader.releaseLock();
				await this.port.close();
				console.log(signals);
			} catch (err) {
				console.error('There was an error opening the serial port:', err);
			}
		} else {
			console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:');
			console.error('chrome://flags/#enable-experimental-web-platform-features');
			console.error('opera://flags/#enable-experimental-web-platform-features');
			console.error('edge://flags/#enable-experimental-web-platform-features');
			console.error('https://developers.chrome.com/origintrials/#/view_trial/2992641952387694593');
		}
	}
	async read() {
		var buffer_string = '';
		var i = 0;
		console.log('statrt');

		await this.port.open({
			baudRate:9600
		});
		this.reader = this.port.readable.getReader();
		let signals = await this.port.getSignals();

		//READ LAST
		while (true) {
			try {
				sleep(300);
				const readerData = await this.reader.read();
				const buffer = this.decoder.decode(readerData.value);
				buffer_string = buffer_string + buffer;
				if ((buffer_string.length > 60) && (i > 3)) break;
				i = i + 1;
			} catch (err) {
				const errorMessage = `error reading data:${err}`;
				console.error(errorMessage);
				break;
			}
		}
		this.reader.releaseLock();
		await this.port.close();

		var lines = buffer_string.split("\r\n");
		for (i = 0; i < lines.length; i++) {
			var lastline = lines[i];

			if ((lastline.indexOf("ST,GS") >= 0) && (lastline.indexOf("kg") >= 0)) {
				lastline = '' + lastline.split(" ").pop();
				lastline = '' + lastline.split(",")[0];
				console.log('end' + lastline);
				return lastline;
				break;
			}
			if ((lastline.indexOf("ST") >= 0) && (lastline.indexOf("kg") >= 0)) {
				lastline = '' + lastline.split(" ").pop();
				lastline = '' + lastline.split(",")[0];
				console.log('end' + lastline);
				return lastline;
				break;
			}
		}
		return 0;
	}
}
const CurrentScaleController = new SerialScaleController();
