/**
 * This plugin will draw project progress line with SVG.
 *
 *      var gantt = new Gnt.panel.Gantt({
 *          plugins : [{
 *              ptype      : 'gantt_progressline',
 *              statusDate : new Date(2017, 2, 8)
 *          }]
 *      });
 *
 * Status date can be changed:
 *
 *      var plugin = gantt.findPlugin('gantt_progressline');
 *      plugin.setStatusDate(new Date(2017, 3, 8));
 *
 * If status date is not in the current gantt time span, progress line will use view start or end coordinates. This
 * behavior can be customized with {@link drawLineOnlyWhenStatusDateVisible} config. Or you can override {@link shouldDrawProgressLine}
 * method and provide more complex condition.
 *
 * Progress line is a set of SVG <line> elements drawn between all the tasks. The line can be customized with the {@link #tpl} config.
 * Additional render data for the template can be provided by overriding {@link #getProgressLineRenderData} method.
 */
Ext.define('Gnt.plugin.ProgressLine', {
    extend : 'Ext.AbstractPlugin',

    alias : 'plugin.gantt_progressline',

    config : {
        /**
         * @cfg {Date} statusDate Progress line status date. If not provided, current date is used.
         */
        statusDate : null
    },

    /**
     * @cfg {Boolean} drawLineOnlyWhenStatusDateVisible Set to true to hide progress line, when status date is not
     * in the current time axis.
     */
    drawLineOnlyWhenStatusDateVisible : false,

    /**
     * @cfg {String/Ext.XTemplate} tpl Template for line
     */
    tpl : '<tpl for=".">' +
        '<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="sch-gantt-progress-line">' +
        '</line>' +
        '</tpl>',

    constructor : function (config) {
        if (typeof this.tpl === 'string') {
            this.tpl = new Ext.XTemplate(this.tpl);
        }

        this.callParent([config]);

        if (!this.getStatusDate()) {
            this.setStatusDate(new Date());
        }
    },

    destroy : function () {
        this.cmp.un(this.getPanelListeners());
        this.unbindViewListeners();
        this.callParent(arguments);
    },

    init : function (gantt) {
        this.schedulerView = gantt.getSchedulingView();

        this.callParent(arguments);

        this.schedulerView.on({
            viewready       : this.onViewReady,
            bufferedrefresh : this.onBufferedRendererRefresh,
            scope           : this
        });

        gantt.on(this.getPanelListeners());
    },

    /**
     * Enables plugin and renders progress line.
     */
    enable : function () {
        if (this.disabled) {
            this.callParent(arguments);
            this.bindViewListeners();
            this.drawProgressLine();
        }
    },

    /**
     * Disables plugin and removes progress line.
     */
    disable : function () {
        if (!this.disabled) {
            this.removeCanvas();
            this.callParent(arguments);
            this.unbindViewListeners();
        }
    },

    /**
     * @param {Date} date New status date. Line will be updated.
     */
    setStatusDate : function (date) {
        this.callParent(arguments);

        this.drawProgressLine();
    },

    onViewReady : function () {
        this.bindViewListeners();
        this.drawProgressLine();
    },

    getTranslateYValue : function () {
        if (this.schedulerView.bufferedRenderer) {
            return this.schedulerView.bufferedRenderer.bodyTop;
        }
        else {
            return 0;
        }
    },

    // Line should be updated on top change (buffered renderer range fetched)
    onBufferedRendererRefresh : function () {
        if (!this.disabled) {
            this.drawProgressLine();
        }
    },

    bindViewListeners : function () {
        this.schedulerView.on(this.getViewListeners());
    },

    unbindViewListeners : function () {
        this.schedulerView.un(this.getViewListeners());
    },

    getViewListeners : function () {
        return {
            beforerefresh : {
                fn       : this.onBeforeViewRefresh,
                priority : -900,
                scope    : this
            },
            refresh       : this.onViewRefresh,
            // TODO: itemupdate should ideally only redraw affected nodes
            itemupdate    : this.drawProgressLine,
            // update and remove will affect vertical position of other elements, so we need to
            // repaint line completely
            itemadd       : this.drawProgressLine,
            itemremove    : this.drawProgressLine,
            scope         : this
        };
    },

    getPanelListeners : function () {
        return {
            beforedatarefresh : this.onBeforeDataRefresh,
            datarefresh       : this.onDataRefresh,
            scope             : this
        };
    },

    onBeforeDataRefresh : function () {
        if (!this.disabled) {
            this._wasEnabled = true;
            this.disable();
        }
    },

    onDataRefresh : function () {
        if (this._wasEnabled) {
            this.enable();
        }
    },

    /**
     * This method will calculate point inside task element to be connected with line.
     * @param {Gnt.model.Task} record
     * @param {HTMLElement} node Row node to look for progress bar in
     * @param {Number[]} translateBy View xy coordinates to calculate relative point position
     * @returns {Object/undefined} Object containing coordinates for point in progress line, or undefined if no progress bar el is found
     * @private
     */
    calculateCoordinateForTask : function (record, node, translateBy) {
        var progressBarEl = record.isSegmented() ? Ext.fly(node).down('.sch-segment-in-progress .sch-gantt-progress-bar') : Ext.fly(node).down('.sch-gantt-progress-bar');

        if (progressBarEl) {
            var box = progressBarEl.getBox();

            return {
                x : box.right + translateBy[0],
                y : box.top + box.height / 2 + translateBy[1]
            };
        }
    },

    /**
     * @returns {Boolean} Return false if the line should not be drawn.
     */
    shouldDrawProgressLine : function () {
        return !this.disabled && (!this.drawLineOnlyWhenStatusDateVisible || this.schedulerView.timeAxis.dateInAxis(this.getStatusDate()));
    },

    onBeforeViewRefresh : function () {
        this.refreshSuspended = true;
    },

    onViewRefresh : function () {
        this.refreshSuspended = false;
        this.drawProgressLine();
    },

    /**
     * Renders the progress line.
     */
    drawProgressLine : function () {
        var schedulerView = this.schedulerView;

        if (this.disabled || !schedulerView || !schedulerView.rendered || !schedulerView.isItemCanvasAvailable() || this.refreshSuspended){
            return;
        }

        var dateForStatusLine  = this.getStatusDate(),
            isStatusDateInAxis = schedulerView.timeAxis.dateInAxis(dateForStatusLine);

        if (!isStatusDateInAxis) {
            dateForStatusLine = dateForStatusLine < schedulerView.timeAxis.getStart() ? schedulerView.timeAxis.getStart() : schedulerView.timeAxis.getEnd();
        }

        var dateX = schedulerView.getCoordinateFromDate(dateForStatusLine);
        var data  = this.shouldDrawProgressLine() ? this.getProgressLineRenderData(dateX) : [];

        // IE11 doesn't support innerHTML property on SVG canvas, so we will destroy canvas each time and recreate with
        // correct innerHTML
        this.removeCanvas();

        var top = this.getTranslateYValue();

        schedulerView.getItemCanvasEl(11, {
            tag  : 'svg',
            role : 'presentation',
            cls  : 'sch-svg-canvas',
            style : 'transform: translateY(-' + top + 'px);',
            html : this.tpl.apply(data)
        });
    },

    removeCanvas : function() {
        var oldCanvas = this.schedulerView.getEl().down('.sch-svg-canvas') || this.schedulerView.getItemCanvasEl(11);

        oldCanvas && oldCanvas.remove();
    },

    /**
     * Returns data required to render progress line. Override this method to provide additional data for the template.
     * @param {Number} statusLineX Horizontal position of the status line.
     * @return {Object[]} Returns array of points for line.
     */
    getProgressLineRenderData : function (statusLineX) {
        var me              = this,
            view            = me.schedulerView,
            // we need to figure out view box xy position to calculate correct position for line element
            viewXY          = [view.getX(), view.el.up('.' + Ext.baseCSSPrefix + 'scroller').getY()],
            scroll          = view.getScroll(),
            lineDefinitions = [],
            statusDate      = this.getStatusDate();

        viewXY = [scroll.left - viewXY[0], scroll.top - viewXY[1]];

        Ext.Array.each(view.getNodes(), function (node) {
            if (!node) return; // view.getNodes() may temporarily contain undefined entries

            var taskRecord = view.getRecord(node),
                rowBox     = Ext.fly(node).getBox(),
                point;

            // If the task:
            // - exists (in case of batch remove, view may still contain nodes that are removed from store)
            // - is in the visible timespan
            // - is not a milestone
            if (taskRecord && view.timeAxis.isRangeInAxis(taskRecord) && !taskRecord.isMilestone() &&
                // - is in progress
                (taskRecord.isInProgress() ||
                // .. or is not started and its start date is before statusDate
                (!taskRecord.isStarted() && taskRecord.getStartDate() < statusDate) ||
                // .. or is finished and its start date is after statusDate
                (taskRecord.isCompleted() && taskRecord.getStartDate() > statusDate)))
            {
                point = me.calculateCoordinateForTask(taskRecord, node, viewXY);

                // If multiple rows are affected by event update, it could happen, that point
                // could not be resolved
                point && lineDefinitions.push(
                    {
                        x1 : statusLineX,
                        y1 : viewXY[1] + rowBox.top,
                        x2 : point.x,
                        y2 : point.y
                    },
                    {
                        x1 : point.x,
                        y1 : point.y,
                        x2 : statusLineX,
                        y2 : viewXY[1] + rowBox.bottom
                    }
                );
            }

            // otherwise we render vertical status line

            if (!point) {
                lineDefinitions.push(
                    {
                        x1 : statusLineX,
                        y1 : viewXY[1] + rowBox.top,
                        x2 : statusLineX,
                        y2 : viewXY[1] + rowBox.bottom
                    }
                );
            }
        });

        return lineDefinitions;
    }
});
