/**
 * A column displaying {@link Gnt.model.Task#BaselineStartDate the baseline start date} of a task.
 *
 * ```javascript
 *     var gantt = Ext.create('Gnt.panel.Gantt', {
 *         height  : 600,
 *         width   : 1000,
 *
 *         columns : [
 *             ...
 *             {
 *                 xtype : 'baselinestartdatecolumn',
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
Ext.define('Gnt.column.BaselineStartDate', {
    extend              : 'Gnt.column.StartDate',

    requires            : ['Gnt.field.BaselineStartDate'],

    alias               : [
        'widget.baselinestartdatecolumn',
        'widget.ganttcolumn.baselinestartdate'
    ],

    width               : 100,

    fieldProperty       : 'baselineStartDateField',

    fieldConfigs        : [ 'instantUpdate', 'adjustMilestones', 'fieldProperty' ],

    editor              : 'baselinestartdatefield',

    defaultEditor       : 'baselinestartdatefield',

    putRawData : function (data, task) {
        if (data && !(data instanceof Date)) {
            data = Ext.Date.parse(data, this.format);
        }

        task.setBaselineStartDate(data);
    }
});
