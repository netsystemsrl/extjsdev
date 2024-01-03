/**
 * A specialized field to be used for editing in the {@link Gnt.column.Note} column.
 */
Ext.define('Gnt.field.Note', {
    extend              : 'Ext.form.field.Picker',

    alias               : ['widget.notefield', 'widget.noteeditor'],
    alternateClassName  : 'Gnt.widget.NoteField',

    requires            : ['Ext.form.field.TextArea'],

    mixins              : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],

    matchFieldWidth     : false,
    editable            : false,
    selectOnFocus       : false,

    /**
     * @cfg {Object} pickerConfig Configuration of the field picker (Ext.form.field.HtmlEditor instance)
     */
    pickerConfig        : null,

    /**
     * @cfg {Function} previewFn
     * Function to return raw field value. If not provided the field uses text stripped of tags
     */
    previewFn           : null,
    /**
     * @cfg {Function} previewFnScope
     * Scope for {!link #previewFn} function to return raw field value
     */
    previewFnScope      : null,

    fieldProperty       : 'noteField',
    getTaskValueMethod  : 'getNote',
    setTaskValueMethod  : 'setNote',

    afterRender : function() {
        this.callParent(arguments);
        this.on('collapse', this.onPickerCollapse, this);
    },


    valueToVisible : function (value) {
        if (this.previewFn) {
            return this.previewFn.call(this.previewFnScope || this, value);
        } else {
            return Ext.util.Format.stripTags(value);
        }
    },

    createPicker: function() {
        var field = Ext.widget(Ext.apply({
            xtype       : 'textareafield',
            frame       : true,
            shadow      : false,
            floating    : true,
            height      : 200,
            width       : 300,
            listeners   : {
                change      : this.onPickerChange,
                specialkey  : this.onSpecialKey,
                scope       : this
            }
        }, this.pickerConfig || {}));

        return field;
    },

    onSpecialKey : function (picker, e) {

        var me = this;

        if (e.getKey() === e.ESC) {
            me.collapse();
        }
    },

    onPickerChange : function (picker, value) {
        var div = document.createElement('div');

        div.innerHTML = value;

        var text = div.innerText || div.textContent;

        this.setRawValue(this.valueToVisible(text));
    },

    getValue : function () {
        return this.getPicker().getValue();
    },

    setValue : function (value) {
        this.callParent([ this.valueToVisible(value) ]);

        this.getPicker().setValue(value);

        if (this.instantUpdate && !this.getSuppressTaskUpdate() && this.task) {
            this.applyChanges();
        }
    },

    onPickerCollapse : function() {
        this.setValue(this.getPicker().getValue());
    },

    onTriggerClick: function() {
        var me = this;

        if (!me.readOnly && !me.disabled) {
            if (me.isExpanded) {
                me.collapse();
            } else {
               me.expand();
            }
        }
    }
});
