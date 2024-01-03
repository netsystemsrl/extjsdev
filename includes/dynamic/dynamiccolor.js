//*************************************************************************************************************//
//			DYNAMIC COLOR
Ext.define('dynamiccolor', {
    alias: 'widget.dynamiccolor',
    extend: 'Ext.form.field.Picker',

    matchFieldWidth: false,
    createPicker: function () {
        var me = this;

        return Ext.create('Ext.picker.Color', {
            pickerField: me,
            ownerCt: me.ownerCt,
            renderTo: document.body,
            floating: true,
            hidden: true,
            focusOnShow: true,
            style: {
                backgroundColor: "#fff" // Optional: style for the color picker
            },
            listeners: {
                select: function (picker, color) {
                    me.setValue('#' + color);
                    me.collapse();
                }
            }
        });
    },

    setValue: function (color) {
        this.callParent(arguments);
        if (this.rendered) {
            this.inputEl.setStyle('backgroundColor', color);
        }
    }
});