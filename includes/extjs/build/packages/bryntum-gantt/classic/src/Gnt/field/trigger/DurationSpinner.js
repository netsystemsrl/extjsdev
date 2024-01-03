// https://www.assembla.com/spaces/bryntum/tickets/2424
// This spinner is used in duration field to keep it visible in IE
Ext.define('Gnt.field.trigger.DurationSpinner', {
    extend: 'Ext.form.trigger.Spinner',
    alias: 'trigger.gantt_durationspinner',

    initEvents: function() {
        var me = this,
            isFieldEnabled = me.isFieldEnabled,
            stateEl = me.getStateEl(),
            el = me.el;

        stateEl.addClsOnOver(me.overCls, isFieldEnabled, me);
        stateEl.addClsOnClick(me.clickCls, isFieldEnabled, me);

        if (me.repeatClick) {
            me.clickRepeater = new Ext.util.ClickRepeater(el, Ext.apply({
                preventDefault: true,
                handler: me.onClick,
                // increase delay to avoid one click to start infinite spinning
                delay : Ext.isIE ? 1000 : 250,
                listeners: {
                    mousedown: me.onClickRepeaterMouseDown,
                    scope: me
                },
                scope: me
            }, this.repeaterConfig));
        } else {
            me.field.mon(el, {
                click: me.onClick,
                mousedown: me.onMouseDown,
                scope: me
            });
        }
    },

    onClick: function() {
        var me = this,
            args = arguments,
            e = me.clickRepeater ? args[1] : args[0],
            field = me.field;
        if (!field.readOnly && !field.disabled) {
            if (me.upEl.contains(e.target)) {
                Ext.callback(me.upHandler, me.scope, [
                    field,
                    me,
                    e
                ], 0, field);
            } else if (me.downEl.contains(e.target)) {
                Ext.callback(me.downHandler, me.scope, [
                    field,
                    me,
                    e
                ], 0, field);
            }
        }

        // When changing duration with click, some itemupdates will be fired and ext will try to restore focus to field,
        // but following focusing will cause field to loose focus and view to exit actionable mode.
        !Ext.isIE && field.inputEl.focus();
    }
});