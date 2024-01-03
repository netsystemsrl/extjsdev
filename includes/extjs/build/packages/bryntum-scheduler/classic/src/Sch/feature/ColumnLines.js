/**
 @class Sch.feature.ColumnLines
 @extends Sch.plugin.Lines

 A simple feature adding column lines to the timeline panel.

 */
Ext.define("Sch.feature.ColumnLines", {
    extend : 'Sch.plugin.Lines',

    requires : [
        'Ext.data.JsonStore'
    ],

    showTip                 : false,
    cls                     : 'sch-column-line',

    timeAxisViewModel       : null,

    renderingDoneEvent      : 'columnlinessynced',
    useLowestHeader         : null,

    init : function (panel) {
        this.timeAxis           = panel.getTimeAxis();
        this.timeAxisViewModel  = panel.timeAxisViewModel;
        this.panel              = panel;

        this.store = new Ext.data.JsonStore({
            fields   : [ 'Date' ]
        });

        this.callParent(arguments);

        panel.on({
            destroy             : this.onHostDestroy,
            scope               : this
        });

        this.timeAxisViewModel.on('update', this.populate, this);

        this.populate();
    },

    onHostDestroy : function() {
        this.timeAxisViewModel.un('update', this.populate, this);
    },

    populate: function() {
        this.store.setData(this.getData());
    },

    getData : function() {
        var ticks = [];

        var timeAxisViewModel   = this.timeAxisViewModel;
        var linesForLevel       = this.useLowestHeader ? timeAxisViewModel.getLowestHeader() : timeAxisViewModel.columnLinesFor;
        var hasGenerator        = !!(timeAxisViewModel.headerConfig && timeAxisViewModel.headerConfig[linesForLevel].cellGenerator);

        if (hasGenerator) {
            var cells = timeAxisViewModel.getColumnConfig()[linesForLevel];

            for (var i = 1, l = cells.length; i < l; i++) {
                ticks.push({ Date : cells[i].start });
            }
        } else {
            timeAxisViewModel.forEachInterval(linesForLevel, function(start, end, i) {
                if (i > 0) {
                    ticks.push({
                        Date : start,
                        Cls  : timeAxisViewModel.isMajorTick(start) ? 'sch-column-line-solid' : ''
                    });
                }
            });
        }

        return ticks;
    }
});