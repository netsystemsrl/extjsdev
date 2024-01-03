/**

@class Gnt.column.TotalSlack
@extends Ext.grid.column.Column

A column showing the available amount of _total slack_ for a task. The _total slack_ (or _total float_) is the amount of time that this task can be delayed without causing a delay
to the project end.

The slack is displayed in units specified by the {@link #slackUnit} config (by default it's displayed in _days_).


    var gantt = Ext.create('Gnt.panel.Gantt', {
        height      : 600,
        width       : 1000,

        // Setup your grid columns
        columns         : [
            ...
            {
                xtype       : 'totalslackcolumn',
                width       : 70
            }
            ...
        ],
        ...
    })

*/
Ext.define('Gnt.column.TotalSlack', {
    extend             : 'Gnt.column.Slack',

    isTotalSlackColumn : true,

    alias              : [
        'widget.totalslackcolumn',
        'widget.ganttcolumn.totalslack'
    ],

    getSlackValue : function (task) {
        return task.getTotalSlack(this.slackUnit);
    }
});
