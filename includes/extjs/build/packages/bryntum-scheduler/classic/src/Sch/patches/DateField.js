// TODO Write test for this
// For now Calendar test tests/ui/calendar/misc.t.js is failed
Ext.define('Sch.patches.DateField', {
    extend : 'Sch.util.Patch',

    target   : 'Ext.form.field.Date',

    minVersion : '6.0.2',
    maxVersion : '6.5.1.345',

    overrides : {
        // BRYNTUM: This function is called on Ext.picker.Date select
        onSelect: function(m, d) {
            var me = this;

            me.setValue(d);

            // BRYNTUM: commented
            // rawDate and rawDateText is set by setValue function
            // me.setValue will trigger 'change' event,
            // so if you set another value onChange, d variable will contain wrong value
            // and onBlur the value from me.rawDate will be set back to the field.

            // me.rawDate = d;

            // BRYNTUM: pass me.rawDate instead of d since me.rawDate contains actual value
            me.fireEvent('select', me, me.rawDate);

            // Focus the inputEl first and then collapse. We configure
            // the picker not to revert focus which is a normal thing to do
            // for floaters; in our case when the picker is focusable it will
            // lead to unexpected results on Tab key presses.
            // Note that this focusing might happen synchronously during Tab
            // key handling in the picker, which is the way we want it.
            me.onTabOut(m);
        }
    }
});