Ext.define('DateTimeField', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.datetimefield',
    //format: "m/d/Y H:i",
    //altFormats: "m/d/Y H:i:s|c",
    format: "Y-m-d H:i:s",
    altFormats: "Y-m-d H:i:s",
    createPicker: function () {
        var me = this,
            format = Ext.String.format;
        var pickerConfig = {
            pickerField: me,
            ownerCt: me.ownerCt,
            renderTo: document.body,
            floating: true,
            hidden: true,
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: me.format,
            showToday: me.showToday,
            startDay: me.startDay,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                scope: me,
                yes: me.onSelect,
                select: me.select,
                close: me.onClose,
                blur: me.onBlur,
                showPicker: me.expand
            },
            keyNavConfig: {
                esc: function () {
                    me.defCollapse();
                }
            }
        };
        return new My.picker.DateTime(pickerConfig);
    },
    onSelect: function (m, d) {
        var me = this;
        me.setValue(d);
        me.fireEvent('select', me, d);
        me.defCollapse();
    },
    select: function () {

    },
    collapse: function () {

    },
    defCollapse: function () {
        var me = this;
        if (me.isExpanded && !me.isDestroyed && !me.destroying) {
            var openCls = me.openCls,
                picker = me.picker,
                aboveSfx = '-above';
            picker.hide();
            me.isExpanded = false;
            me.bodyEl.removeCls([openCls, openCls + aboveSfx]);
            picker.el.removeCls(picker.baseCls + aboveSfx);
            // remove event listeners
            //me.removeListener.destroy();
            me.removeListener();
            Ext.un('resize', me.alignPicker, me);
            me.fireEvent('collapse', me);
            me.onCollapse();
        }
    },
    onBlur: function (e) {
        var me = this,
            v = me.rawToValue(me.getRawValue());
        if (Ext.isDate(v)) {
            me.setValue(v);
        }
        me.defCollapse();
        me.callParent([e]);
    },
    onClose: function () {
        this.defCollapse();
    }
});

Ext.define('My.picker.DateTime', {
    extend: 'Ext.picker.Date',
    alias: 'widget.datetimepicker',
    okText: 'OK',
    okTip: 'OK Tip',
    todayText: "Today",
    todayTip: 'Today Tip',
    renderTpl: [
        '<div id="{id}-innerEl" data-ref="innerEl">',
        '<div class="{baseCls}-header">',
        '<div id="{id}-prevEl" data-ref="prevEl" class="{baseCls}-prev {baseCls}-arrow" role="button" title="{prevText}"></div>',
        '<div id="{id}-middleBtnEl" data-ref="middleBtnEl" class="{baseCls}-month" role="heading">{%this.renderMonthBtn(values, out)%}</div>',
        '<div id="{id}-nextEl" data-ref="nextEl" class="{baseCls}-next {baseCls}-arrow" role="button" title="{nextText}"></div>',
        '</div>',
        '<table role="grid" id="{id}-eventEl" data-ref="eventEl" class="{baseCls}-inner" {%',
        'if (values.$comp.focusable) {out.push("tabindex=\\\"0\\\"");}',
        '%} cellspacing="0">',
        '<thead><tr role="row">',
        '<tpl for="dayNames">',
        '<th role="columnheader" class="{parent.baseCls}-column-header" aria-label="{.}">',
        '<div role="presentation" class="{parent.baseCls}-column-header-inner">{.:this.firstInitial}</div>',
        '</th>',
        '</tpl>',
        '</tr></thead>',
        '<tbody><tr role="row">',
        '<tpl for="days">',
        '{#:this.isEndOfWeek}',
        '<td role="gridcell">',
        '<div hidefocus="on" class="{parent.baseCls}-date"></div>',
        '</td>',
        '</tpl>',
        '</tr></tbody>',
        '</table>',
        '<tpl if="showToday">',
        '<table id="{id}-timeEl" style="table-layout:auto;width:auto;margin:0 3px;" class="x-datepicker-inner" cellspacing="0">',
        '<tbody><tr>',
        '<td>{%this.renderHourBtn(values,out)%}</td>',
        '<td>{%this.renderMinuteBtn(values,out)%}</td>',
        '<td>{%this.renderSecondBtn(values,out)%}</td>',
        '</tr></tbody>',
        '</table>',
        '<div id="{id}-footerEl" data-ref="footerEl" role="presentation" class="{baseCls}-footer">',
        '{%this.renderOkBtn(values,out)%}{%this.renderTodayBtn(values, out)%}</div>',
        '</tpl>',
        '</div>', {
            firstInitial: function (value) {
                return Ext.picker.Date.prototype.getDayInitial(value);
            },
            isEndOfWeek: function (value) {
                value--;
                var end = value % 7 === 0 && value !== 0;
                return end ? '</tr><tr role="row">' : '';
            },
            renderTodayBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.todayBtn.getRenderTree(), out);
            },
            renderMonthBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.monthBtn.getRenderTree(), out);
            },
            renderHourBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.hourBtn.getRenderTree(), out);
            },
            renderMinuteBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.minuteBtn.getRenderTree(), out);
            },
            renderSecondBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.secondBtn.getRenderTree(), out);
            },
            renderOkBtn: function (values, out) {
                Ext.DomHelper.generateMarkup(values.$comp.okBtn.getRenderTree(), out);
            }
        }
    ],
    beforeRender: function () {
        var me = this;
        var currentDate = new Date();
        me.hourBtn = new Ext.form.field.Number({
            minValue: 0,
            maxValue: 23,
            step: 1,
            value: currentDate.getHours(),
            width: 55
        });
        me.minuteBtn = new Ext.form.field.Number({
            minValue: 0,
            maxValue: 59,
            step: 1,
            width: 70,
            labelWidth: 10,
            value: currentDate.getMinutes(),
            fieldLabel: ' ',
            listeners: {
                focus: function () {
                    me.fireEvent("showPicker");
                }
            }
        });
        me.secondBtn = new Ext.form.field.Number({
            minValue: 0,
            maxValue: 59,
            step: 1,
            width: 70,
            labelWidth: 10,
            value: currentDate.getSeconds(),
            fieldLabel: ' ',
            listeners: {
                focus: function () {
                    me.fireEvent("showPicker");
                }
            }
        });
        me.okBtn = new Ext.button.Button({
            ownerCt: me,
            ownerLayout: me.getComponentLayout(),
            text: me.okText,
            tooltip: me.okTip,
            tooltipType: 'title',
            handler: me.okHandler,
            scope: me
        });
        me.callParent();
    },
    privates: {
        finishRenderChildren: function () {
            var me = this;
            me.hourBtn.finishRender();
            me.minuteBtn.finishRender();
            me.secondBtn.finishRender();
            me.okBtn.finishRender();
            me.callParent();
        }
    },
    okHandler: function () {
        var me = this,
            btn = me.okBtn;
        if (btn && !btn.disabled) {
            me.setValue(this.getValue());
            me.fireEvent('yes', me, me.value);
            me.onSelect();
        }
        return me;
    },
    setValue: function (value) {
        var me = this;
        value.setSeconds(0);
        me.value = new Date(value);
        //date.setHours(me.hourBtn.getValue());
        //date.setMinutes(me.minuteBtn.getValue());
        //date.setSeconds(me.secondBtn.getValue());  
        //me.value=date; 
        me.hourBtn.setValue(me.value.getHours());
        me.minuteBtn.setValue(me.value.getMinutes());
        me.secondBtn.setValue(me.value.getSeconds());
        me.update(me.value);
        return me;
    },
    beforeDestroy: function () {
        var me = this;
        if (me.rendered) {
            Ext.destroy(me.hourBtn, me.minuteBtn, me.secondBtn, me.okBtn, me.cancelBtn);
        }
        me.callParent();
    },
    selectedUpdate: function (date) {
        var me = this,
            t = Ext.Date.clearTime(date, true).getTime(),
            cells = me.cells,
            cls = me.selectedCls,
            c,
            cLen = cells.getCount(),
            cell;
        cell = me.activeCell;
        if (cell) {
            Ext.fly(cell).removeCls(cls);
            cell.setAttribute('aria-selected', false);
        }
        for (c = 0; c < cLen; c++) {
            cell = cells.item(c);
            if (me.textNodes[c].dateValue === t) {
                me.activeCell = cell.dom;
                me.eventEl.dom.setAttribute('aria-activedescendant', cell.dom.id);
                cell.dom.setAttribute('aria-selected', true);
                cell.addCls(cls);
                me.fireEvent('highlightitem', me, cell);
                break;
            }
        }
    },
    selectToday: function () {
        var me = this,
            btn = me.todayBtn,
            handler = me.handler;
        if (btn && !btn.disabled) {
            var date = new Date()
            me.hourBtn.setValue(date.getHours());
            me.minuteBtn.setValue(date.getMinutes());
            me.secondBtn.setValue(date.getSeconds());
            me.setValue(date);
            me.fireEvent('yes', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            me.onSelect();
        }
        return me;
    }
});