/**
 * A column representing {@link Gnt.model.Task#CalendarId CalendarId} field of a task. The column is editable, however to enable the editing you will
 * need to add a Sch.plugin.TreeCellEditing plugin to your gantt panel. The overall setup will look like this:
 *
 *        var gantt = Ext.create('Gnt.panel.Gantt', {
 *            height  : 600,
 *            width   : 1000,
 *
 *            // Setup your static columns
 *            columns : [
 *                ...
 *                {
 *                    xtype : 'calendarcolumn',
 *                    width : 80
 *                }
 *                ...
 *            ],
 *
 *            plugins : [
 *                // add Sch.plugin.TreeCellEditing plugin
 *                {
 *                    ptype        : 'scheduler_treecellediting'
 *                    clicksToEdit : 1
 *                }
 *            ],
 *            ...
 *        });
 *
 * This column uses a field - {@link Gnt.field.Calendar} as the editor.
 */
Ext.define('Gnt.column.Calendar', {
    extend                  : 'Ext.grid.column.Column',

    alias                   : [
        'widget.calendarcolumn',
        'widget.ganttcolumn.calendar'
    ],

    requires                : [
        'Gnt.model.Calendar',
        'Gnt.field.Calendar'
    ],

    mixins                  : ['Gnt.column.mixin.TaskFieldColumn'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     *  - text : 'Calendar'
     */

    /**
     * @cfg {Number} width
     * The width of the column.
     */
    width                   : 100,

    /**
     * @cfg {String} align
     * The alignment of the text in the column.
     */
    align                   : 'left',

    instantUpdate           : true,

    store                   : null,

    fieldProperty           : 'calendarIdField',

    fieldConfigs            : [ 'instantUpdate', 'store', 'fieldProperty' ],

    editor                  : 'calendarfield',

    defaultEditor           : 'calendarfield',

    initComponent : function () {
        this.initTaskFieldColumn({
            format      : this.editorFormat || this.format || Ext.Date.defaultFormat
        });

        this.callParent(arguments);
    },


    applyColumnCls : function (value, meta, task, col, index, store) {
        if (!value) {
            meta.tdCls  = (meta.tdCls || '') + ' gnt-default';
        }
    },


    getValueToRender : function (value, meta, task, col, index, store) {
        value       = value || (store.calendar ? store.calendar.calendarId : '');

        return this.field.valueToVisible(value, task) || value;
    },

    putRawData : function (value, record) {
        record.setCalendar(value);
    }
});
