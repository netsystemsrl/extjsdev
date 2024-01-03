Ext.define('Sch.feature.HeaderResize', {
    extend : 'Ext.AbstractPlugin',

    selector          : null,
    currentCell       : null,
    originalCellWidth : null,
    startClientX      : null,
    timeAxisViewModel : null,
    minCellWidth      : 15,

    init : function (column) {
        column.on('render', this.onColumnRender, this);
    },

    onColumnRender : function (column) {
        column.getEl().on('mousedown', this.onMouseDown, this, {
            delegate : this.selector
        });
    },

    getClientX : function (e) {
        return Ext.isNumber(e.clientX) ? e.clientX : e.browserEvent.clientX;
    },

    onMouseDown : function (e, t) {
        var me     = this,
            cellEl = t.parentElement;

        me.originalCellWidth = Ext.fly(cellEl).getWidth();
        me.startClientX      = me.getClientX(e);

        me.currentCell = cellEl;

        me.getCmp().mon(Ext.getBody(), 'mousemove', me.onMouseMove, me);

        me.getCmp().mon(Ext.getBody(), 'mouseup', me.onMouseUp, me, {
            capture : true,
            single  : true
        });
    },

    onMouseMove : function (e, t) {
        var me            = this,
            cellEl        = me.currentCell,
            nextCellEl    = cellEl.nextSibling,
            delta         = me.startClientX - me.getClientX(e),
            originalWidth = me.originalCellWidth,
            newWidth      = Math.max(me.minCellWidth, originalWidth - delta);

        if (nextCellEl && newWidth < originalWidth) {
            // Resize adjacent cell if shrinking this cell
            var nextWidth          = Math.min(originalWidth * 2 - me.minCellWidth, originalWidth + delta);

            nextCellEl.style.width = nextWidth + 'px';
        }

        cellEl.style.width = newWidth + 'px';
    },

    onMouseUp : function (e, t) {
        var me               = this,
            // HACK, should avoid using cmp.up() but this plugin + timeaxisColumn are heavily tied to Timeline Panel anyway
            // Better having the life cycle of this feature managed by column, then to place this code in top Scheduler component
            timelinePanel    = me.getCmp().up('timelinegrid,timelinetree'),
            date             = timelinePanel.getSchedulingView().getDateFromCoordinate(Ext.fly(me.currentCell).getLeft()),

            // The position of the time cell in the schedule view port, we want to maintain this scroll point after changing the tick width
            scrollOffset     = Ext.fly(me.currentCell).getX() - timelinePanel.getSchedulingView().getX(),
            deltaX           = me.getClientX(e) - me.startClientX,
            ratio            = (me.originalCellWidth / me.timeAxisViewModel.getTickWidth()),
            newTickWidth     = Math.max(me.minCellWidth, me.timeAxisViewModel.getTickWidth() + (deltaX / ratio));

        me.timeAxisViewModel.setTickWidth(Math.round(newTickWidth));

        timelinePanel.scrollToDate(date, false, scrollOffset);

        me.getCmp().mun(Ext.getBody(), 'mousemove', me.onMouseMove, me);

        this.currentCell = this.offset = null;
    }
});