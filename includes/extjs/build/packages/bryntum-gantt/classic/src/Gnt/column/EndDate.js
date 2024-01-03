/**
 * A column showing the {@link Gnt.model.Task#EndDate EndDate} field of the tasks. The column is editable when adding a
 * Sch.plugin.TreeCellEditing plugin to your gantt panel. The overall setup will look like this:
 *
 * ```javascript
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height  : 600,
 *         width   : 1000,
 *
 *         columns : [
 *             ...
 *             {
 *                 xtype : 'enddatecolumn',
 *                 width : 80
 *             }
 *             ...
 *         ],
 *
 *         plugins : [
 *             Ext.create('Sch.plugin.TreeCellEditing', {
 *                 clicksToEdit: 1
 *             })
 *         ],
 *         ...
 *     });
 * ```
 *
 * **Note**, that this column by default provides only a day-level editor (using {@link Gnt.field.EndDate} which subclasses Ext JS Ext.form.field.Date).
 * If you need a more precise editing (ie also specify the end hour/minute) you will need to either provide a {@link #format} including time info
 * or use your own field (which should extend {@link Gnt.field.EndDate}). See this [forum thread][1] for more information.
 *
 * [1]: https://bryntum.com/forum/viewtopic.php?f=16&t=2277&start=10#p13964
 *
 * Also **note**, that this class inherits from Ext.grid.column.Date and supports its configuration options (notably the {@link #format} option).
 */
Ext.define("Gnt.column.EndDate", {
    extend                  : "Ext.grid.column.Date",

    alias                   : [
        'widget.enddatecolumn',
        'widget.ganttcolumn.enddate'
    ],

    requires                : [
        'Ext.grid.CellEditor',
        'Gnt.field.EndDate'
    ],

    mixins                  : ['Gnt.column.mixin.TaskFieldColumn'],

    isEndDateColumn         : true,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - text : 'Finish'
     */

    /**
     * @cfg {Number} width The width of the column.
     */
    width                   : 100,

    /**
     * @cfg {String} align The alignment of the text in the column.
     */
    align                   : 'left',

    /**
     * @cfg {String} format
     * A formatting string to format a Date for this Column (see Ext.Date `format` method for details).
     */

    /**
     * @cfg {String} editorFormat A date format to be used when editing the value of the column. By default it is the same as {@link #format} configuration
     * option of the column itself.
     */
    editorFormat            : null,

    /**
     * @cfg {Boolean} adjustMilestones
     * If `true`, the start/end dates of the milestones will be adjusted -1 day *during rendering and editing*.
     * The task model will still hold the raw unmodified date.
     *
     * **Note:** No adjustments will be applied if {@link Gnt.panel.Gantt#disableDateAdjustments} is set to `true`.
     */
    adjustMilestones        : true,

    /**
     * @cfg {Boolean} validateStartDate When set to `true`, the column will validate a "startDate <= endDate" condition and won't allow user to save the invalid end date.
     * Set it to `false` if you use different validation mechanism.
     */
    validateStartDate       : true,

    /**
     * @cfg {Boolean} keepDuration Pass `true` to keep the duration of the task ("move" the task), `false` to change the duration ("resize" the task).
     */
    keepDuration            : false,

    fieldProperty           : 'endDateField',

    fieldConfigs            : [ 'instantUpdate', 'adjustMilestones', 'keepDuration', 'validateStartDate', 'fieldProperty' ],

    editor                  : 'enddatefield',

    defaultEditor           : 'enddatefield',

    initComponent : function () {
        this.initTaskFieldColumn({
            format : this.editorFormat || this.format || Ext.Date.defaultFormat
        });

        this.callParent(arguments);
    },


    getValueToRender : function (value, meta, task) {
        return value && Ext.Date.format( this.field.valueToVisible(value, task), this.format ) || '';
    },

    // When copying from end date column, take display value, not real value
    // #4061
    getRawData : function (record) {
        var data = record.getEndDate();
        return data ? Ext.Date.parse(this.getValueToRender(data, null, record), this.format) : null;
    },

    // When pasting data to end date column value should be converted back to get correct visible value
    prepareNewEndDate : function (date, task) {
        if (date) {
            if (!(date instanceof Date)) {
                date = Ext.Date.parse(date, this.format);
            }

            date = this.field.visibleToValue(date, task);
        }

        return date;
    },

    // TODO: check this method it launches 2 propagations
    putRawData : function (data, task) {
        if (data) {
            data = this.prepareNewEndDate(data, task);

            if (task.getStartDate() && task.getStartDate() > data) {
                task.setDuration(0);
            }
        }

        task.setEndDate(data, task.isMilestone(), false);
    }
});
