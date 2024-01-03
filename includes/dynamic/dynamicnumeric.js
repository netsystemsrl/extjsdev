//*************************************************************************************************************//
//			DYNAMIC NUMERIC
Ext.define('dynamicnumeric', {
    extend: 'Ext.form.NumberField',
    alias: 'widget.dynamicnumeric',
	/* DATA */
	datasourcefield: 'dynamicnumeric1',
	defaultValue: '',
	/*RECORD EDITING DEFINITION*/
	allowedit: true,
	allowfilter: true,
	allowscale : false,
	allowkeypad: false,
	allowclear : false,
	/* EVENT ON CHANGE*/
	autopostback: false,
	
	/**
	* @cfg {Boolean} allowThousandSeparator
	* False to disallow thousand separator feature.
	*/
	allowThousandSeparator: true,

	/**
	* @private
	*/
	toBaseNumber: function (value) {
		var me = this;
		return String(value).replace(new RegExp("[" + Ext.util.Format.thousandSeparator + "]", "g"), '').replace(me.decimalSeparator, '.');
	},

	/**
	* @private
	*/
	parseRawValue: function (value) {
		var me = this;
		//value = parseFloat(String(value).replace(",", "."));
		value = parseFloat(me.toBaseNumber(value));
		return isNaN(value) ? null : value;
	},
	
	getErrors: function (value) {
		if (!this.allowThousandSeparator)
			return this.callParent(arguments);
		value = arguments.length > 0 ? value : this.processRawValue(this.getRawValue());

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
	
	rawToValue: function (rawValue) {
		if (!this.allowThousandSeparator)
			return this.callParent(arguments);
		var value = this.fixPrecision(this.parseRawValue(rawValue));
		if (value === null) {
			value = rawValue || null;
		}
		return value;
	},
	
	valueToRaw: function (value) {
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
		value = Ext.isNumber(value) ? value : parseFloat(String(value).replace(decimalSeparator, '.'));
		value = isNaN(value) ? '' : Ext.util.Format.number(value, format);
		return value;
	},

	setMinValue: function (value) {
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
	
	getSubmitValue: function () {
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
            cls: null,
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
        calculator: {
            //cls: 'fa-2x fa-calculator',
            cls: null,
            glyph: 'xf1ec@FontAwesome',
            tooltip: 'Calc',
            //cls: Ext.baseCSSPrefix + 'form-clear-trigger',
            weight: +1, // negative to place before default triggers
            handler: function (field, button, e) {
                var me = this;

                var CalcPanel = new Ext.form.Panel({
                    minWidth: 300,
                    minHeight: 300,
                    items: [{
                        layout: 'column',
                        items: [{
                            columnWidth: 1,
                            xtype: 'textfield',
                            name: 'display',
                            id: 'display',
                            value: "0"
                        }]
                    }, {
                        layout: 'column',
                        items: [{
                            xtype: 'button',
                            text: 'CE',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
                                var cl = Ext.getCmp('display').getValue();
                                cl = "";
                                Ext.getCmp('display').setValue(cl);
                            }
                        }, {
                            xtype: 'button',
                            text: 'C',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
                                var no = new Array();
                                no = Ext.getCmp('display').getValue();
                                var len = no.length;
                                var sub = no.slice(0, len - 1)
                                Ext.getCmp('display').setValue(sub);
                            }
                        }, {
                            xtype: 'button',
                            text: '<-',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
                                no = Ext.getCmp('display').getValue();
                                me.setValue(no);
                                me.fireEvent('select');
                                CalcWindow.close();
                            }
                        }]
                    }, {
                        layout: 'column',
                        items: [{
                            xtype: 'button',
                            text: '1',
                            scale   : 'large',
                            margin: '2px',
                            columnWidth: 0.23,
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("1");
                                } else {
                                    num = num + "1";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        }, {
                            xtype: 'button',
                            text: '2',
                            scale   : 'large',
                            margin: '2px',
                            columnWidth: 0.23,
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("2");
                                } else {
                                    num = num + "2";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }

                        }, {
                            xtype: 'button',
                            text: '3',
                            scale   : 'large',
                            margin: '2px',
                            columnWidth: 0.23,
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("3");
                                } else {
                                    num = num + "3";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        }, {
                            xtype: 'button',
                            text: '-',
                            scale   : 'large',
                            margin: '2px',
                            columnWidth: 0.23,
                            handler: function () {
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
                        layout: 'column',
                        items: [{
                            xtype: 'button',
                            text: '4',
                            scale   : 'large',
                            margin: '2px',
                            columnWidth: 0.23,
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("4");
                                } else {
                                    num = num + "4";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        }, {
                            xtype: 'button',
                            text: '5',
                            scale   : 'large',
                            margin: '2px',
                            columnWidth: 0.23,
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("5");
                                } else {
                                    num = num + "5";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        }, {
                            xtype: 'button',
                            text: '6',
                            scale   : 'large',
                            margin: '2px',
                            columnWidth: 0.23,
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("6");
                                } else {
                                    num = num + "6";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        }, {
                            xtype: 'button',
                            text: '*',
                            scale   : 'large',
                            margin: '2px',
                            columnWidth: 0.23,
                            handler: function () {
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
                        layout: 'column',
                        items: [{
                            xtype: 'button',
                            text: '7',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("7");
                                } else {
                                    num = num + "7";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        }, {
                            xtype: 'button',
                            text: '8',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("8");
                                } else {
                                    num = num + "8";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        }, {
                            xtype: 'button',
                            text: '9',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("9");
                                } else {
                                    num = num + "9";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        }, {
                            xtype: 'button',
                            text: '/',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
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
                        layout: 'column',
                        items: [{
                            xtype: 'button',
                            text: '0',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
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
                            xtype: 'button',
                            text: '.',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
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
                            xtype: 'button',
                            text: '=',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
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
                            xtype: 'button',
                            text: '+',
                            scale   : 'large',
                            columnWidth: 0.23,
                            margin: '2px',
                            handler: function () {
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
                    align: 'right',
                    dock: 'top',
                    margin: '0px',
                    padding: '0px',
                    floating: true,
                    closable: true,
                    items: [
                        CalcPanel
                    ],
                    "keyMap": {
                        "1": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("1");
                                } else {
                                    num = num + "1";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        "2": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("2");
                                } else {
                                    num = num + "2";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        "3": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("3");
                                } else {
                                    num = num + "3";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        "4": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("4");
                                } else {
                                    num = num + "4";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        "5": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("5");
                                } else {
                                    num = num + "5";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        "6": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("6");
                                } else {
                                    num = num + "6";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        "7": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("7");
                                } else {
                                    num = num + "7";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        "8": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("8");
                                } else {
                                    num = num + "8";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        "9": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("9");
                                } else {
                                    num = num + "9";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        "0": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("0");
                                } else {
                                    num = num + "0";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        ".": {
                            handler: function () {
                                var num = Ext.getCmp('display').getValue();
                                if (num == 0) {
                                    Ext.getCmp('display').setValue("0.");
                                } else {
                                    num = num + ".";
                                    Ext.getCmp('display').setValue(num);
                                }
                            }
                        },
                        "/": {
                            handler: function () {
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
                        "-": {
                            handler: function () {
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
                        "+": {
                            handler: function () {
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
                        "=": {
                            handler: function () {
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
                        enter: {
                            handler: function () {
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
                        esc: {
                            handler: function () {
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
			if (me.allowkeypad == false) me.getTriggers()["calculator"].setVisible(false);
			
			this.inputEl.set({ autocomplete: 'off' });
			if (this.emptyText != '') {
				this.setValue(this.emptyText); 
			} 
			if (this.defaultValue != '') {
				this.setValue(this.defaultValue); 
			}
		}
     }
});