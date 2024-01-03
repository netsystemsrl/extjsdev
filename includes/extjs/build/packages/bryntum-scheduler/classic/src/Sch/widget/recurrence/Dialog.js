/**
 * A class implementing dialog window to edit {@link Sch.model.Recurrence Recurrence model}.
 * The dialog contains {@link Sch.widget.recurrence.Form Recurrence form} and Save/Cancel buttons.
 * Before showing the dialog need to call {@link #loadRecord} to set {@link Sch.model.Recurrence Recurrence model} first.
 * The {@link Sch.widget.recurrence.Form form} fields will be loaded and shown accordingly with the model data.
 *
 * {@img scheduler/images/recurrence-dialog1.png 2x}
 *
 * The class extends Ext.window.Window so its normal configs are applicable.
 */
Ext.define('Sch.widget.recurrence.Dialog', {
    extend   : 'Ext.window.Window',
    requires : [
        'Ext.button.Button',
        'Sch.model.Recurrence',
        'Sch.widget.recurrence.Form'
    ],

    alias  : 'widget.recurrencedialog',
    mixins : ['Sch.mixin.Localizable'],

    border    : false,
    width     : 400,
    resizable : false,
    modal     : true,

    recurrenceDialogCls : 'sch-recurrencedialog',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - 'Repeat event' : 'Repeat event',
     * - 'Cancel'       : 'Cancel',
     * - 'Save'         : 'Save'
     */

    weekStartDay    : 1,
    dateFormat      : 'Y-m-d',

    /**
     * Configuration for {@link #property-form}.
     * @cfg {Object/Sch.widget.recurrence.Form} form
     */
    /**
     * Form panel displaying the loaded {@link Sch.model.Recurrence recurrence} fields.
     * @property {Sch.widget.recurrence.Form}
     */
    form            : null,
    recurrenceModel : null,

    /**
     * @cfg {Function}                     saveHandler            Function to call on "Save" button click.
     * @cfg {Sch.widget.recurrence.Dialog} saveHandler.this       The dialog instance.
     * @cfg {Sch.model.Recurrence}         saveHandler.recurrence Recurrence being edited.
     */
    saveHandler     : null,


    /**
     * @cfg {Function}                     cancelHandler            Function to call on "Cancel" button click.
     * @cfg {Sch.widget.recurrence.Dialog} cancelHandler.this       The dialog instance.
     * @cfg {Sch.model.Recurrence}         cancelHandler.recurrence Recurrence being edited.
     */
    cancelHandler   : null,

    /**
     * Scope for {@link #saveHandler} and {@link #cancelHandler} function call.
     * @cfg {Mixed}
     */
    scope           : null,

    title           : 'L{Repeat event}',

    initComponent : function () {
        var me = this;

        me.addCls(me.recurrenceDialogCls);

        me.title = me.localizeText(me.title);

        me.recurrenceModel = me.recurrenceModel || Sch.model.Recurrence;

        if (!me.form || !me.form.isInstance) {
            me.form = Ext.create(Ext.apply({
                xtype           : 'recurrenceform',
                padding         : '10 10 0 10',
                weekStartDay    : me.weekStartDay,
                dateFormat      : me.dateFormat,
                recurrenceModel : me.recurrenceModel,
                border          : false
            }, me.form));
        }

        me.items = [me.form];

        me.buttons = me.buttons || [{
            xtype   : 'button',
            text    : me.L('Save'),
            scope   : me,
            handler : me.onSaveClick
        }, {
            xtype   : 'button',
            text    : me.L('Cancel'),
            scope   : me,
            handler : me.onCancelClick
        }];

        me.callParent(arguments);
    },

    onSaveClick : function () {
        var me = this;

        if (me.saveHandler) {
            me.saveHandler.call(me.scope || me, me, me.getRecord());
        } else {
            me.updateRecord();
            me.close();
        }
    },

    onCancelClick : function () {
        var me = this;

        if (me.cancelHandler) {
            me.cancelHandler.call(me.scope || me, me, me.getRecord());
        } else {
            me.close();
        }
    },

    /**
     * Loads a recurrence model to the dialog.
     * @param  {Sch.model.Recurrence} record Recurrence model.
     * @return {Sch.widget.recurrence.Form} The form.
     */
    loadRecord : function (record) {
        return this.form.loadRecord.apply(this.form, arguments);
    },

    /**
     * Updates the provided recurrence model with the contained form data.
     * If recurrence model is not provided updates the last loaded recurrence model.
     * @return {Sch.widget.recurrence.Form} The form.
     */
    updateRecord : function (record) {
        return this.form.updateRecord.apply(this.form, arguments);
    },

    /**
     * Returns the loaded recurrence model.
     * @return  {Sch.model.Recurrence} Loaded recurrence model.
     */
    getRecord : function (record) {
        return this.form.getRecord.apply(this.form, arguments);
    },

    getFloatingComponents : function () {
        var me           = this,
            result       = [],
            pickerFields = me.query('pickerfield'),
            i;

        // HACK to render all pickers, so the query for floating components will return full result
        for (i = 0; i < pickerFields.length; i++) {
            var pickerField = pickerFields[i];

            pickerField.getPicker();
        }

        var floatingComponents = me.query('[floating]');

        if (Ext.isArray(floatingComponents)) {
            result = result.concat(floatingComponents);
        }

        return result;
    }
});
