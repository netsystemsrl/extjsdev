/**
 @class Sch.widget.ExportDialogForm
 @private
 @extends Ext.form.Panel

 Form for {@link Sch.widget.ExportDialog}. This is a private class and can be overridden by providing `formPanel` option to
 {@link Sch.plugin.Export#cfg-exportDialogConfig exportDialogConfig}.
 */
Ext.define('Sch.widget.ExportDialogForm', {
    extend                 : 'Ext.form.Panel',
    requires               : [
        'Ext.data.Store',
        'Ext.XTemplate',
        'Ext.form.field.Number',
        'Ext.form.field.ComboBox',
        'Ext.form.field.Date',
        'Ext.form.FieldContainer',
        'Ext.form.field.Checkbox',
        'Sch.widget.ResizePicker',
        'Sch.widget.ColumnPicker'
    ],

    mixins                 : ['Sch.mixin.Localizable'],

    alias                  : 'widget.export_dialog_form',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - formatFieldLabel         : 'Paper format',
            - orientationFieldLabel    : 'Orientation',
            - rangeFieldLabel          : 'Schedule range',
            - showHeaderLabel          : 'Show header',
            - showFooterLabel          : 'Show footer',
            - orientationPortraitText  : 'Portrait',
            - orientationLandscapeText : 'Landscape',
            - completeViewText         : 'Complete schedule',
            - currentViewText          : 'Visible schedule',
            - dateRangeText            : 'Date range',
            - dateRangeFromText        : 'Export from',
            - pickerText               : 'Resize column/rows to desired value',
            - dateRangeToText          : 'Export to',
            - exportersFieldLabel      : 'Control pagination',
            - adjustCols               : 'Adjust column width',
            - adjustColsAndRows        : 'Adjust column width and row height',
            - specifyDateRange         : 'Specify date range',
            - columnPickerLabel        : 'Select columns',
            - completeDataText         : 'Complete schedule (for all events)',
            - dpiFieldLabel            : 'DPI (dots per inch)',
            - rowsRangeLabel           : 'Rows range',
            - allRowsLabel             : 'All rows',
            - visibleRowsLabel         : 'Visible rows'
            - columnEmptyText          : '[no title]'
     */

    border                 : false,
    bodyPadding            : '10 10 0 10',
    autoHeight             : true,

    stateful               : true,

    /**
     * @property {Ext.form.field.ComboBox} rangeField "Export range" field.
     */
    rangeField             : null,
    resizerHolder          : null,
    /**
     * @property {Sch.widget.ResizePicker} resizePicker "Resize column/rows to desired value" picker.
     */
    resizePicker           : null,
    /**
     * @property {Ext.form.field.Date} "Export dateFromFieldfrom" field.
     */
    dateFromField          : null,
    /**
     * @property {Ext.form.field.Date} dateToField "Export to" field.
     */
    dateToField            : null,
    datesHolder            : null,
    /**
     * @property {Sch.widget.ColumnPicker} columnPicker "Select columns for export" field.
     */
    columnPicker           : null,
    /**
     * @property {Ext.form.field.ComboBox} rangeField "Rows range" field.
     */
    rowsRangeField         : null,
    /**
     * @property {Ext.form.field.ComboBox} exportersField "Manage pagination" field.
     */
    exportersField         : null,
    /**
     * @property {Ext.form.field.ComboBox} formatField "Paper format" field.
     */
    formatField            : null,
    /**
     * @property {Ext.form.field.ComboBox} orientationField "Orientation" field.
     */
    orientationField       : null,
    /**
     * @property {Ext.form.field.Number} dpiField "DPI (dots per inch)" field.
     */
    dpiField               : null,
    /**
     * @property {Ext.form.field.Checkbox} showHeaderField "Show header" field.
     */
    showHeaderField        : null,
    /**
     * @property {Ext.form.field.Checkbox} showFooterField "Show footer" field.
     */
    showFooterField        : null,

    /**
     * @cfg {String} dateRangeFormat Valid date format to be used by the date range fields ("Export from" and "Export to" fields).
     */
    dateRangeFormat        : '',

    /**
     * @cfg {Object} columnPickerConfig Configuration for the "Select columns for export" field.
     */
    columnPickerConfig     : null,
    /**
     * @cfg {Object} dpiFieldConfig Configuration for the "DPI (dots per inch)" field
     */
    dpiFieldConfig         : null,

    /**
     * @cfg {Boolean} dateRangeRestriction Set to "false" to disable the maximum and minimum allowed value limits for the date range fields ("Export from" and "Export to" fields).
     */
    dateRangeRestriction   : true,

    rangeFieldConfig       : null,
    rowsRangeFieldConfig   : null,
    formatFieldConfig      : null,
    orientationFieldConfig : null,
    exportersFieldConfig   : null,
    showHeaderFieldConfig  : null,
    showFooterFieldConfig  : null,
    dateFromFieldConfig    : null,
    dateToFieldConfig      : null,

    /**
     * @cfg {Boolean} showResizePicker Indicates if "Resize column/rows to desired value" panel should to be shown in the export dialog.
     */
    showResizePicker       : false,
    /**
     * @cfg {Boolean} showColumnPicker Indicates if the "Select columns for export" field should to be shown in the export dialog.
     */
    showColumnPicker       : true,
    /**
     * @cfg {Boolean} showDPIField Indicates if the "DPI (dots per inch)" field should to be shown in the export dialog.
     */
    showDPIField           : true,
    /**
     * @cfg {Boolean} showShowHeaderField Indicates if the "Show header" checkbox should be displayed in the export dialog.
     */
    showShowHeaderField    : true,
    /**
     * @cfg {Boolean} showShowFooterField Indicates if the "Show footer" checkbox should be displayed in the export dialog.
     */
    showShowFooterField    : false,
    /**
     * @cfg {Boolean} showRowsRangeField Indicates if the "Rows range" field should be displayed in the export dialog.
     */
    showRowsRangeField     : true,

    initComponent : function () {
        var me = this;

        me.fieldDefaults = Ext.apply({
            labelAlign   : 'left',
            labelWidth   : 120,
            anchor       : '99%'
        }, me.fieldDefaults);

        me.items = me.createFields();

        me.callParent(arguments);
        // trigger fields `change` listeners to enable/disable related fields and do other UI cosmetics changes
        me.onRangeChange(me.rangeField, me.rangeField.getValue());
        me.onExporterChange(me.exportersField, me.exportersField.getValue());
    },

    isValid : function () {
        var me  = this;

        if (me.rangeField.getValue() == 'date') {
            return me.dateFromField.isValid() && me.dateToField.isValid();
        }

        return true;
    },

    getValues : function (asString, dirtyOnly, includeEmptyText, useDataValues) {
        var result      = this.callParent(arguments);

        if (this.showShowHeaderField)
            result.showHeader = !!result.showHeader;

        if (this.showShowFooterField)
            result.showFooter = !!result.showFooter;

        result.onlyVisibleRows = !!result.onlyVisibleRows;

        if (this.resizePicker && this.rangeField.getValue() == 'current') {
            var cellSize = this.resizePicker.getValues();

            if (asString) {
                result += '&cellSize[0]=' + cellSize[0] + '&cellSize[1]=' + cellSize[1];
            } else {
                result.cellSize = cellSize;
            }
        }

        if (this.columnPicker) {
            result.columns = this.columnPicker.getSelectedColumns();
        }

        return result;
    },


    createFields : function () {
        var me                 = this,
            beforeLabelTextTpl = '<table class="sch-fieldcontainer-label-wrap"><td width="1" class="sch-fieldcontainer-label">',
            afterLabelTextTpl  = '<td><div class="sch-fieldcontainer-separator"></div></table>';

        // col/row resizer
        if (me.showResizePicker) {
            me.resizePicker = new Sch.widget.ResizePicker({
                dialogConfig : me,
                margin       : '10 20'
            });

            me.resizerHolder = new Ext.form.FieldContainer({
                fieldLabel         : me.scrollerDisabled ? me.L('adjustCols') : me.L('adjustColsAndRows'),
                labelAlign         : 'top',
                hidden             : true,
                labelSeparator     : '',
                beforeLabelTextTpl : beforeLabelTextTpl,
                afterLabelTextTpl  : afterLabelTextTpl,
                layout             : 'vbox',
                defaults           : {
                    flex       : 1,
                    allowBlank : false
                },
                items              : [me.resizePicker]
            });
        }

        // from date
        me.dateFromField = Ext.ComponentManager.create(Ext.apply(me.applyStateful({
            xtype       : 'datefield',
            fieldLabel  : me.L('dateRangeFromText'),
            baseBodyCls : 'sch-exportdialogform-date',
            name        : 'dateFrom',
            format      : me.dateRangeFormat || Ext.Date.defaultFormat,
            allowBlank  : false,
            maxValue    : me.dateRangeRestriction && me.endDate || null,
            minValue    : me.dateRangeRestriction && me.startDate || null,
            value       : me.startDate
        }), me.dateFromFieldConfig));

        // till date
        me.dateToField = Ext.ComponentManager.create(Ext.apply(me.applyStateful({
            xtype       : 'datefield',
            fieldLabel  : me.L('dateRangeToText'),
            name        : 'dateTo',
            format      : me.dateRangeFormat || Ext.Date.defaultFormat,
            baseBodyCls : 'sch-exportdialogform-date',
            allowBlank  : false,
            maxValue    : me.dateRangeRestriction && me.endDate || null,
            minValue    : me.dateRangeRestriction && me.startDate || null,
            value       : me.endDate
        }), me.dateToFieldConfig));

        // date fields holder
        me.datesHolder  = new Ext.form.FieldContainer({
            fieldLabel          : me.L('specifyDateRange'),
            labelAlign          : 'top',
            hidden              : true,
            labelSeparator      : '',
            beforeLabelTextTpl  : beforeLabelTextTpl,
            afterLabelTextTpl   : afterLabelTextTpl,
            layout              : 'vbox',
            defaults            : {
                flex        : 1,
                allowBlank  : false
            },
            items               : [me.dateFromField, me.dateToField]
        });

        if (me.showColumnPicker) {
            me.columnPicker = new Sch.widget.ColumnPicker(me.applyStateful(Ext.apply({
                fieldLabel      : me.L('columnPickerLabel'),
                columnEmptyText : me.L('columnEmptyText'),
                cls             : 'sch-export-dialog-columns'
            }, me.columnPickerConfig )));
        }

        if (me.showDPIField) {
            me.dpiField = Ext.ComponentManager.create(Ext.apply(me.applyStateful({
                xtype           : 'numberfield',
                fieldLabel      : me.L('dpiFieldLabel'),
                cls             : 'sch-export-dialog-dpi',
                minValue        : 65,
                name            : 'DPI',
                value           : me.exportConfig.DPI,
                maxValue        : 200
            }), me.dpiFieldConfig));
        }

        if (me.showShowHeaderField) {
            me.showHeaderField = Ext.ComponentManager.create(Ext.apply(me.applyStatefulFull({
                xtype           : 'checkbox',
                fieldLabel      : me.L('showHeaderLabel'),
                cls             : 'sch-export-dialog-header',
                name            : 'showHeader',
                checked         : !!me.exportConfig.showHeader,
                checkedValue    : true,
                uncheckedValue  : false
            }), me.showHeaderFieldConfig));
        }

        if (me.showShowFooterField) {
            me.showFooterField = Ext.ComponentManager.create(Ext.apply(me.applyStatefulFull({
                xtype           : 'checkbox',
                fieldLabel      : me.L('showFooterLabel'),
                cls             : 'sch-export-dialog-footer',
                name            : 'showFooter',
                checked         : !!me.exportConfig.showFooter,
                checkedValue    : true,
                uncheckedValue  : false
            }), me.showFooterFieldConfig));
        }

        me.formatField = Ext.ComponentManager.create(Ext.Object.merge(me.applyStateful({
            xtype          : 'combobox',
            listConfig     : {
                htmlEncode : true
            },
            fieldLabel     : me.L('formatFieldLabel'),
            value          : me.exportConfig.format,
            triggerAction  : 'all',
            forceSelection : true,
            editable       : false,
            name           : 'format',
            queryMode      : 'local',
            store          : me.pageFormats || ["A5", "A4", "A3", "Letter", "Legal"]
        }), me.formatFieldConfig));

        me.orientationField = Ext.ComponentManager.create(Ext.Object.merge(me.applyStateful({
            xtype          : 'combobox',
            listConfig     : {
                htmlEncode : true
            },
            fieldLabel     : me.L('orientationFieldLabel'),
            value          : me.exportConfig.orientation,
            triggerAction  : 'all',
            forceSelection : true,
            editable       : false,
            name           : 'orientation',
            displayField   : 'name',
            valueField     : 'value',
            queryMode      : 'local',
            store          : {
                fields : ['name', 'value'],
                data   : [
                    { name : me.L('orientationPortraitText'), value : 'portrait' },
                    { name : me.L('orientationLandscapeText'), value : 'landscape' }
                ]
            }
        }), me.orientationFieldConfig));

        me.rangeField = Ext.ComponentManager.create(Ext.Object.merge(me.applyStateful({
            xtype          : 'combobox',
            listConfig     : {
                htmlEncode : true
            },
            fieldLabel     : me.L('rangeFieldLabel'),
            value          : me.exportConfig.range,
            triggerAction  : 'all',
            cls            : 'sch-export-dialog-range',
            forceSelection : true,
            editable       : false,
            name           : 'range',
            queryMode      : 'local',
            displayField   : 'name',
            valueField     : 'value',
            store          : {
                fields : ['name', 'value'],
                data   : [
                    { name : me.L('completeViewText'), value : 'complete' },
                    { name : me.L('completeDataText'), value : 'completedata' },
                    { name : me.L('dateRangeText'), value : 'date' },
                    { name : me.L('currentViewText'), value : 'current' }
                ]
            }
        }), me.rangeFieldConfig));

        me.mon(me.rangeField, 'change', me.onRangeChange, me);

        me.exportersField = Ext.ComponentManager.create(Ext.Object.merge(me.applyStateful({
            xtype          : 'combobox',
            listConfig     : {
                htmlEncode : true
            },
            fieldLabel     : me.L('exportersFieldLabel'),
            value          : me.defaultExporter,
            triggerAction  : 'all',
            cls            : 'sch-export-dialog-exporter',
            forceSelection : true,
            editable       : false,
            name           : 'id',
            queryMode      : 'local',
            displayField   : 'name',
            valueField     : 'value',
            store          : {
                fields : ['name', 'value'],
                data   : Ext.Array.map(me.exporters, function (exporter) {
                    return {
                        name  : exporter.getName(),
                        value : exporter.getId()
                    };
                })
            }
        }), me.exportersFieldConfig));

        me.mon(me.exportersField, 'change', me.onExporterChange, me);

        if (me.showRowsRangeField) {
            me.rowsRangeField = Ext.ComponentManager.create(Ext.Object.merge(me.applyStateful({
                xtype          : 'combobox',
                listConfig     : {
                    htmlEncode : true
                },
                fieldLabel     : me.L('rowsRangeLabel'),
                value          : me.exportConfig.rowsRange,
                triggerAction  : 'all',
                cls            : 'sch-export-dialog-rowsrange',
                forceSelection : true,
                editable       : false,
                name           : 'rowsRange',
                queryMode      : 'local',
                displayField   : 'name',
                valueField     : 'value',
                store          : {
                    fields : ['name', 'value'],
                    data   : [{ name : me.L('allRowsLabel'), value : 'all' }, {
                        name  : me.L('visibleRowsLabel'),
                        value : 'visible'
                    }]
                }
            }), me.rowsRangeFieldConfig));
        }

        var items = [];

        items.push(me.rangeField);

        if (me.resizerHolder) {
            items.push(me.resizerHolder);
        }

        items.push(me.datesHolder);

        if (me.columnPicker) {
            items.push(me.columnPicker);
        }

        if (me.rowsRangeField) {
            items.push(me.rowsRangeField);
        }

        items.push(me.exportersField, me.formatField, me.orientationField);

        if (me.dpiField) {
            items.push(me.dpiField);
        }

        if (me.showHeaderField) {
            items.push(me.showHeaderField);
        }

        if (me.showFooterField) {
            items.push(me.showFooterField);
        }

        return items;
    },

    // Applies configs to enable "stateful" mode for the field ("config" being provided).
    // Should be used for the "textfield" ancestors (numberfield/picker fields etc)
    applyStateful : function (config) {
        if (!this.stateful) return config;

        var me     = this,
            prefix = me.stateId || 'exporter';

        return Ext.applyIf(config, {
            stateful : true,
            stateId  : prefix + '_' + config.name
        });
    },

    // Applies configs to enable "stateful" mode for the field ("config" being provided).
    // Should be used for the NON-"textfield" ancestors since they require implementing a pair of applyState/getState methods
    applyStatefulFull : function (config) {
        if (!this.stateful) return config;

        var me = this;

        return Ext.apply(me.applyStateful(config), {
            stateEvents : ['change'],
            applyState  : me.applyFieldState,
            getState    : me.getFieldState
        });
    },

    getFieldState : function () {
        return {
            value : this.getValue()
        };
    },

    applyFieldState : function (state) {
        if ('value' in state) {
            this.setValue(state.value);
        }
    },

    onRangeChange : function (field, newValue) {
        switch (newValue) {
            case 'complete':
            case 'completedata':
                this.datesHolder.hide();
                this.resizerHolder && this.resizerHolder.hide();
                break;
            case 'date':
                this.datesHolder.show();
                this.resizerHolder && this.resizerHolder.hide();
                break;
            case 'current':
                this.datesHolder.hide();

                if (this.resizerHolder) {
                    this.resizerHolder.show();
                    this.resizePicker.expand(true);
                }

                break;
        }
    },

    /**
     * @protected
     * This method is called after user selects an export mode in the corresponding field.
     * @param  {Ext.form.field.Field} field Reference to the form field
     * @param  {String} exporterId Selected exporter identifier
     */
    onExporterChange : function (field, id) {

        switch (id) {
            case  'singlepage':
                this.disableFields(true);
                break;
            default :
                this.disableFields(false);
        }

    },

    disableFields : function (value) {
        var me = this;

        me.formatField.setDisabled(value);
        me.orientationField.setDisabled(value);
    }
});
