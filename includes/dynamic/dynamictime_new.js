Ext.define('Ext.ux.picker.DateTime', {

    extend: 'Ext.picker.Date',
    alias: 'widget.datetimepicker',

    okText: 'OK',

    focusable: true,

    renderTpl: [
        '<div id="{id}-innerEl" data-ref="innerEl" role="presentation">',
            '<div class="{baseCls}-header">',
                '<div id="{id}-prevEl" data-ref="prevEl" class="{baseCls}-prev {baseCls}-arrow" role="presentation" title="{prevText}"></div>',
                '<div id="{id}-middleBtnEl" data-ref="middleBtnEl" class="{baseCls}-month" role="heading">{%this.renderMonthBtn(values, out)%}</div>',
                '<div id="{id}-nextEl" data-ref="nextEl" class="{baseCls}-next {baseCls}-arrow" role="presentation" title="{nextText}"></div>',
            '</div>',
            '<table role="grid" id="{id}-eventEl" data-ref="eventEl" class="{baseCls}-inner" cellspacing="0" tabindex="0" aria-readonly="true">',
                '<thead>',
                    '<tr role="row">',
                        '<tpl for="dayNames">',
                            '<th role="columnheader" class="{parent.baseCls}-column-header" aria-label="{.}">',
                                '<div role="presentation" class="{parent.baseCls}-column-header-inner">{.:this.firstInitial}</div>',
                            '</th>',
                        '</tpl>',
                    '</tr>',
                '</thead>',
                '<tbody>',
                    '<tr role="row">',
                        '<tpl for="days">',
                            '{#:this.isEndOfWeek}',
                            '<td role="gridcell">',
                                '<div hidefocus="on" class="{parent.baseCls}-date"></div>',
                            '</td>',
                        '</tpl>',
                    '</tr>',
                '</tbody>',
            '</table>',
            '<div style="text-align: center">',
                '<table id="{id}-timeEl" data-ref="timeEl" style="margin: 4px auto" class="{baseCls}-datepicker-inner" cellspacing="0">',
                    '<tbody>',
                        '<tr>',
                            '<td>{%this.renderHourFld(values, out)%}</td>',
                            '<td style="padding: 0 5px">:</td>',
                            '<td>{%this.renderMinuteFld(values, out)%}</td>',
                            '<td style="padding: 0 5px">:</td>',
                            '<td>{%this.renderSecondFld(values, out)%}</td>',
                        '</tr>',
                    '</tbody>',
                '</table>',
            '</div>',
            '<tpl if="showToday">',
                '<div id="{id}-footerEl" data-ref="footerEl" role="presentation" class="{baseCls}-footer">{%this.renderOkBtn(values, out)%}{%this.renderTodayBtn(values, out)%}</div>',
            '</tpl>',
            // These elements are used with Assistive Technologies such as screen readers
            '<div id="{id}-todayText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{todayText}.</div>',
            '<div id="{id}-ariaMinText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaMinText}.</div>',
            '<div id="{id}-ariaMaxText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaMaxText}.</div>',
            '<div id="{id}-ariaDisabledDaysText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaDisabledDaysText}.</div>',
            '<div id="{id}-ariaDisabledDatesText" class="' + Ext.baseCSSPrefix + 'hidden-clip">{ariaDisabledDatesText}.</div>',
        '</div>',
        {
            firstInitial: function(value) {
                return Ext.picker.Date.prototype.getDayInitial(value);
            },
            isEndOfWeek: function(value) {
                // Convert from 1-based index to 0-based by decrementing value once.
                value--;
                var end = value % 7 === 0 && value !== 0;
                return end ? '</tr><tr role="row">' : '';
            },
            renderTodayBtn: function(values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.todayBtn.getRenderTree(), out);
            },
            renderMonthBtn: function(values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.monthBtn.getRenderTree(), out);
            },
            renderHourFld: function(values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.hourFld.getRenderTree(), out);
            },
            renderMinuteFld: function(values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.minuteFld.getRenderTree(), out);
            },
            renderSecondFld: function(values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.secondFld.getRenderTree(), out);
            },
            renderOkBtn: function(values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.okBtn.getRenderTree(), out);
            }
        }
    ],

    beforeRender: function() {

        var me = this;

        var numberFldBaseCfg = {
            minValue: 0,
            allowDecimals: false,
            autoStripChars: true,
            width: 50,
            fieldStyle: 'text-align: right',
            ownerCt: me,
            ownerLayout: me.getComponentLayout()
        };
        me.hourFld = new Ext.form.field.Number(Ext.apply({}, numberFldBaseCfg, {
            maxValue: 23
        }));
        me.minuteFld = new Ext.form.field.Number(Ext.apply({}, numberFldBaseCfg, {
            maxValue: 59
        }));
        me.secondFld = new Ext.form.field.Number(Ext.apply({}, numberFldBaseCfg, {
            maxValue: 59
        }));

        me.okBtn = new Ext.button.Button({
            ui: me.footerButtonUI,
            ownerCt: me,
            ownerLayout: me.getComponentLayout(),
            text: me.okText,
            tooltipType: 'title',
            tabIndex: -1,
            ariaRole: 'presentation',
            handler: me.onOkClickMain,
            scope: me
        });

        me.callParent(arguments);

    },

    getRefItems: function() {

        var results = [],
            monthBtn = this.monthBtn,
            todayBtn = this.todayBtn,
            hourFld = this.hourFld,
            minuteFld = this.minuteFld,
            secondFld = this.secondFld,
            okBtn = this.okBtn;

        if (monthBtn) {
            results.push(monthBtn);
        }
        if (todayBtn) {
            results.push(todayBtn);
        }
        if (hourFld) {
            results.push(hourFld);
        }
        if (minuteFld) {
            results.push(minuteFld);
        }
        if (secondFld) {
            results.push(secondFld);
        }
        if (okBtn) {
            results.push(okBtn);
        }

        return results;

    },

    privates: {

        finishRenderChildren: function() {
            var me = this;
            me.callParent(arguments);
            me.hourFld.finishRender();
            me.minuteFld.finishRender();
            me.secondFld.finishRender();
            me.okBtn.finishRender();
        }

    },

    onOkClickMain: function() {
        var me = this,
            btn = me.okBtn,
            handler = me.handler;
        if (btn && !btn.disabled) {
            me.setValue(this.getValue(), true);
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            me.onSelect();
        }
        return me;
    },

    selectedUpdate: function(date) {
        this.callParent([Ext.Date.clearTime(date, true)]);
    },

    update: function(date, forceRefresh) {
        var me = this;
        me.hourFld.setValue(date.getHours());
        me.minuteFld.setValue(date.getMinutes());
        me.secondFld.setValue(date.getSeconds());
        return this.callParent(arguments);
    },

    setValue: function(date, applyTime) {
        var me = this;
        if (applyTime === true) {
            date.setHours(me.hourFld.getValue());
            date.setMinutes(me.minuteFld.getValue());
            date.setSeconds(me.secondFld.getValue());
        }
        me.value = date;
        return me.update(me.value);
    },

    beforeDestroy: function() {
        var me = this;
        if (me.rendered) {
            Ext.destroy(me.hourFld, me.minuteFld, me.secondFld, me.okBtn);
        }
        me.callParent(arguments);
    },

    selectToday: function() {
        var me = this,
            btn = me.todayBtn;
        if (btn && !btn.disabled) {
            me.setValue(new Date(), true);
        }
        return me;
    },

    onMouseDown: function(evt) {
        if (!evt.getTarget('input')) evt.preventDefault();
    },

    handleDateClick: function(evt, domEl) {
        var me = this,
            handler = me.handler;
        evt.stopEvent();
        if (!me.disabled && domEl.dateValue && !Ext.fly(domEl.parentNode).hasCls(me.disabledCellCls)) {
            me.setValue(new Date(domEl.dateValue), true);
            if (evt.getKey() === evt.ENTER) {
                if (handler) {
                    handler.call(me.scope || me, me, me.value);
                };
                me.onSelect();
            }
        }
    },

    handleTabKey: Ext.emptyFn // We don't want to collapse the picker on tab, cycle to time input fields instead

});

Ext.define('Ext.ux.form.field.DateTime', {

    extend: 'Ext.form.field.Date',
    alias: 'widget.datetimefield',
    requires: [
        'Ext.ux.picker.DateTime'
    ],

    format: "m/d/Y g:i:s A",
    ariaFormat: 'M j Y, g:i:s A',
    altFormats: "m/d/Y g:i:s A",

    createPicker: function() {

        var me = this,
            format = Ext.String.format;

        return new Ext.ux.picker.DateTime({
            pickerField: me,
            floating: true,
            preventRefocus: true,
            hidden: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            ariaDisabledDatesText: me.ariaDisabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            ariaDisabledDaysText: me.ariaDisabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            ariaMinText: format(me.ariaMinText, me.formatDate(me.minValue, me.ariaFormat)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            ariaMaxText: format(me.ariaMaxText, me.formatDate(me.maxValue, me.ariaFormat)),
            listeners: {
                scope: me,
                select: me.onSelect
            },
            keyNavConfig: {
                esc: function() {
                    me.inputEl.focus();
                    me.collapse();
                }
            }
        });
    },

    onExpand: function() {
        var value = this.getValue();
        this.picker.setValue(Ext.isDate(value) ? value : new Date());
    }

});

Ext.define('sys.view.Main', {
    extend: 'Ext.container.Container',
    
    items: [{
        xtype: 'datetimefield',
        fieldLable: 'Date Time',
        width: 200
    }]
});


Ext.application({
    name : 'sys',
    
    mainView: 'sys.view.Main',
    
    launch : function() {
        
    }
});