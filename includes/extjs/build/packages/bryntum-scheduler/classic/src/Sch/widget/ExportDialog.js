/**
 @class Sch.widget.ExportDialog
 @private
 @extends Ext.window.Window

 Widget for export options.

 */
Ext.define('Sch.widget.ExportDialog', {
    alternateClassName   : 'Sch.widget.PdfExportDialog',
    extend               : 'Ext.window.Window',
    requires             : [
        'Ext.ProgressBar',
        'Sch.widget.ExportDialogForm'
    ],
    mixins               : ['Sch.mixin.Localizable'],
    alias                : "widget.exportdialog",

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - title            : 'Export Settings',
            - exportButtonText : 'Export',
            - cancelButtonText : 'Cancel',
            - progressBarText  : 'Exporting...'
     */

    width                : 450,
    cls                  : 'sch-exportdialog',
    frame                : false,
    layout               : 'fit',
    draggable            : true,
    constrain            : true,

    /**
     * @cfg {Ext.Component} progressBar Progress bar component.
     */
    progressBar          : null,

    /**
     * @cfg {Ext.Component/Object/Object[]} buttonsPanel Component with buttons controlling export.
     */
    buttonsPanel         : null,

    /**
     * @cfg {Object} buttonsPanelScope
     * The scope for the {@link #buttonsPanel}
     */
    buttonsPanelScope    : null,

    /**
     * @cfg {String} dateRangeFormat Valid date format to be used by the date range fields ("Export from" and "Export to" fields).
     */

    /**
     * @cfg {Boolean} showHeaderField Indicates if the "Show header" checkbox should be displayed in the export dialog.
     * @removed This config was renamed since the name was used by another existing property. Please use {@link #showShowHeaderField} instead.
     */
    /**
     * @cfg {Boolean} showShowHeaderField Indicates if the "Show header" checkbox should be displayed in the export dialog.
     */

    /**
     * @cfg {Boolean} showFooterField Indicates if the "Show footer" checkbox should be displayed in the export dialog.
     * @removed This config was renamed since the name was used by another existing property. Please use {@link #showShowFooterField} instead.
     */
    /**
     * @cfg {Boolean} showShowFooterField Indicates if the "Show footer" checkbox should be displayed in the export dialog.
     */

    /**
     * @cfg {Boolean} showColumnPicker Indicates if the "Select columns for export" field should to be shown in the export dialog.
     */

    /**
     * @cfg {Object} columnPickerConfig Configuration for the "Select columns for export" field.
     */

    /**
     * @cfg {Boolean} showDPIField Indicates if the "DPI (dots per inch)" field should to be shown in the export dialog.
     */

    /**
     * @cfg {Object} dpiFieldConfig Configuration for the "DPI (dots per inch)" field
     */

    /**
     * @cfg {Boolean} showResizePicker Indicates if "Resize column/rows to desired value" panel should to be shown in the export dialog.
     */

    /**
     * @cfg {Boolean} dateRangeRestriction Set to "false" to disable the maximum and minimum allowed value limits for the date range fields ("Export from" and "Export to" fields).
     */


    /**
     * @cfg {Object} doExportFnScope Set the scope for the doExportFn.
     */
    doExportFnScope : null,

    /**
     * @cfg doExportFn The function to be called by the export buttonhandler. This function will be automatically set when using Sch.plugin.Export plugin.
     *
     * @param exportConfig
     * @param successFn
     * @param failFn
     */
    doExportFn : function (exportConfig, successFn, failFn) {
        throw 'Sch.widget.ExportDialog: doExportFn needs to be set in the config';
    },

    form                 : null,

    defaultFormXType     : 'export_dialog_form',

    exportButtonConfig   : null,
    cancelButtonConfig   : null,

    formConfigs          : 'pageFormats,startDate,endDate,rowHeight,columnWidth,defaultExporter,exporters,' +
        'dateRangeFormat,exportConfig,showColumnPicker,columnPickerConfig,showDPIField,dpiFieldConfig,showShowHeaderField,'+
        'showShowFooterField,showResizePicker,stateful,stateId,dateRangeRestriction,showRowsRangeField,'+
        'rowsRangeFieldConfig,rangeFieldConfig,formatFieldConfig,orientationFieldConfig,exportersFieldConfig',

    constructor : function (config) {
        Ext.apply(this, config);

        this.title = this.title || this.L('title');

        this.callParent(arguments);
    },


    // Some form configs can be provided directly to the dialog.
    // Their names are listed in "formConfigs" property.
    mapFormConfigs : function () {
        this.form = this.form || {};

        var form  = this.form;

        var names = this.formConfigs.split(',');

        for (var i = 0, n = names.length; i < n; i++) {
            var name = names[i];

            if (this.hasOwnProperty(name) && !form.hasOwnProperty(name)) {
                form[name] = this[name];
            }
        }

        // TODO: backward compatibility
        if (this.hasOwnProperty('showFooterField') && !form.hasOwnProperty('showShowFooterField')) {
            form.showShowFooterField = this.showFooterField;
        }

        // TODO: backward compatibility
        if (this.hasOwnProperty('showHeaderField') && !form.hasOwnProperty('showShowHeaderField')) {
            form.showShowHeaderField = this.showHeaderField;
        }

        //form stateId may not be the same as window stateId, needs prefix
        if (form.stateId) {
            form.stateId = 'form_' + form.stateId;
        }

    },



    initComponent : function () {
        var me          = this;

        if (!me.form || !me.form.isForm) {
            me.mapFormConfigs();

            me.form = me.buildForm();
        }

        me.buttonsPanel = me.buttonsPanel || me.buildButtons(me.buttonsPanelScope || me);

        Ext.apply(me, {
            items : {
                items : [
                    me.form,
                    me.progressBar || me.buildProgressBar()
                ]
            },

            fbar  : me.buttonsPanel
        });

        me.callParent(arguments);
    },

    afterRender : function () {
        var me = this;

        if (me.form.resizePicker) {
            me.relayEvents(me.form.resizePicker, ['change', 'changecomplete', 'select']);
        }

        me.callParent(arguments);
    },

    /**
     * Create Dialog's buttons.
     *
     * @param {Object} buttonsScope Scope for the buttons.
     * @return {Object[]} buttons Array containing buttons definition for Exporting/Cancelling export.
     */
    buildButtons : function (buttonsScope) {
        var me = this;

        return [
            Ext.apply({
                xtype   : 'button',
                scale   : 'medium',
                itemId  : 'export',
                text    : me.L('exportButtonText'),
                handler : me.onExportButtonPress,
                scope   : buttonsScope || me
            }, me.exportButtonConfig),
            Ext.apply({
                xtype   : 'button',
                scale   : 'medium',
                itemId  : 'cancel',
                text    : me.L('cancelButtonText'),
                handler : me.onCancelButtonPress,
                scope   : buttonsScope || me
            }, me.cancelButtonConfig)
        ];
    },

    onExportButtonPress : function () {
        if (this.form.isValid()) {
            var config          = this.form.getValues();

            // disable export button and siaply progress bar
            this.beforeExport();

            // convert strings to dates before passing date range to doExport method
            var dateFormat      = this.dateRangeFormat || Ext.Date.defaultFormat;

            if (config.dateFrom && !Ext.isDate(config.dateFrom)) {
                config.dateFrom = Ext.Date.parse(config.dateFrom, dateFormat);
            }

            if (config.dateTo && !Ext.isDate(config.dateTo)) {
                config.dateTo   = Ext.Date.parse(config.dateTo, dateFormat);
            }

            this.doExportFn.call(this.doExportFnScope || this, config, this.onExportSuccess, this.onExportFailure);
        }
    },


    afterExport : function () {
        var btn = this.down('#export');

        btn && btn.enable();

        this.progressBar && this.progressBar.hide();
    },


    beforeExport : function () {
        var btn = this.down('#export');

        btn && btn.disable();

        this.progressBar && this.progressBar.show();
    },


    onExportSuccess : function () {
        this.afterExport();
    },

    onExportFailure : function () {
        this.afterExport();
    },


    onCancelButtonPress : function () {
        this.destroy();
    },


    /**
     * Build the {@link Sch.widget.ExportDialogForm} for the dialog window.
     *
     * @param {Object} config Config object for the form, containing field names and values.
     * @return {Sch.widget.ExportDialogForm} form
     */
    buildForm : function (config) {
        this.form = Ext.apply(this.form || {}, config);

        return Ext.ComponentManager.create(this.form, this.defaultFormXType);
    },


    buildProgressBar : function () {
        return this.progressBar = new Ext.ProgressBar({
            text    : this.L('progressBarText'),
            animate : true,
            hidden  : true,
            margin  : '4px 10px 10px 10px'
        });
    }

});
