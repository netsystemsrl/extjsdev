/**
 * Class implementing a _form field_ looking as a _segmented button_.
 */
Ext.define('Sch.field.SegmentedButton', {
    extend : 'Ext.button.Segmented',
    alias  : 'widget.segmentedbuttonfield',

    mixins : [
        'Ext.form.field.Field'
    ],

    segmentedButtonFieldCls : 'sch-segmentedbuttonfield',

    // This layout supports 'columns' and 'vertical' configs:
    // http://docs.sencha.com/extjs/6.5.3/classic/Ext.form.CheckboxGroup.html#cfg-columns
    // http://docs.sencha.com/extjs/6.5.3/classic/Ext.form.CheckboxGroup.html#cfg-vertical
    layout : 'checkboxgroup',

    allowMultiple : true,

    defaults : {
        enableToggle : true,
        border       : 0 // To support borders need to customize checkboxgroup layout
    },

    // if `false`, the last selected value cannot be depressed
    allowBlank : true,

    initComponent : function () {
        var me = this;

        // Init mixin
        me.initField();
        me.initDefaultName();

        me.addCls(me.segmentedButtonFieldCls);

        me.callParent();

        me.on('change', me.onFieldChange, me);
    },

    initDefaultName : function () {
        this.name = this.name || this.getId();
    },

    onFieldChange : function (field, value, oldValue) {
        if (!this.allowBlank && Ext.isEmpty(value)) {
            this.setValue(oldValue);
        }
    }
});