/**
 * A column displaying the {@link Gnt.model.Task#BaselineEndDate baseline end date} of a task.
 *
 * ```javascript
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height  : 600,
 *         width   : 1000,
 *
 *         columns : [
 *             ...
 *             {
 *                 xtype : 'baselineenddatecolumn',
 *                 width : 80
 *             }
 *             ...
 *         ],
 *         ...
 *     });
 * ```
 *
 * **Note**, that this class inherits from Ext.grid.column.Date and supports its configuration options, notably the "format" option.
 */
Ext.define('Gnt.column.BaselineEndDate', {
    extend              : 'Gnt.column.EndDate',

    requires            : ['Gnt.field.BaselineEndDate'],

    alias               : [
        'widget.baselineenddatecolumn',
        'widget.ganttcolumn.baselineenddate'
    ],

    width               : 100,

    fieldProperty       : 'baselineEndDateField',

    fieldConfigs        : [ 'instantUpdate', 'adjustMilestones', 'keepDuration', 'validateStartDate', 'fieldProperty' ],

    editor              : 'baselineenddatefield',

    defaultEditor       : 'baselineenddatefield',

    // When copying from end date column, take display value, not real value
    // #4061
    getRawData : function (record) {
        var date = record.getBaselineEndDate();
        return date ? Ext.Date.parse(this.getValueToRender(date, null, record), this.format) : null;
    },

    putRawData : function (data, task) {
        if (data) {
            data = this.prepareNewEndDate(data, task);
        }

        task.setBaselineEndDate(data);
    }
});
