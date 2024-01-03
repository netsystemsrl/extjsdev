/**
* @class Gnt.feature.ProgressBarResize
*
* Internal plugin enabling resizing of a task progress bar, configure this feature using the {@link Gnt.panel.Gantt#progressBarResizeConfig} config setting.
*/
Ext.define("Gnt.feature.ProgressBarResize", {
    requires    : [
        'Ext.ToolTip',
        'Ext.resizer.Resizer'
    ],

    /**
    * @cfg {Boolean} useTooltip false to not show a tooltip while resizing. Defaults to true.
    */
    useTooltip  : true,

    /**
    * @cfg {Number} increment
    * The increment in percent to use during a progress element resize
    */
    increment   : 10,

    tip         : null,
    resizable   : null,
    ganttView   : null,

    constructor : function(config) {
        Ext.apply(this, config || {});
        var g = this.ganttView;

        g.on({
            destroy : this.cleanUp,
            scope   : this
        });

        g.el.on('mousedown', this.onMouseDown, this, { delegate: '.sch-gantt-progressbar-handle' });

        this.callParent(arguments);
    },

    onMouseDown: function (e, t) {
        var g   = this.ganttView,
            rec = g.resolveTaskRecord(t);

        if (g.fireEvent('beforeprogressbarresize', g, rec) !== false) {
            var progBar = Ext.fly(t).prev('.sch-gantt-progress-bar');

            e.stopEvent();

            progBar.addCls('sch-progress-bar-resizing');

            this.resizable = this.createResizable(progBar, rec, e);
            g.fireEvent('progressbarresizestart', g, rec);

            // If the mouse isn't moved after mousedown, no resize event will be fired by the Ext.Resizable. Handle this case manually
            Ext.getBody().on('mouseup', this.onBodyMouseUp, this, { single : true, delay : 1 });
        }
    },

    // private
    createResizable: function (el, taskRecord, e) {
        var rtl            = this.ganttView.rtl,
            taskEl         = el.up(this.ganttView.eventSelector),
            taskWidth      = taskEl.getWidth() - 2*this.ganttView.eventBorderWidth,
            widthIncrement = taskWidth * this.increment / 100;

        var rz = Ext.create('Ext.resizer.Resizer', {
            target          : el,
            taskRecord      : taskRecord,
            handles         : rtl ? 'w' : 'e',
            minWidth        : 0,
            maxWidth        : taskWidth,
            minHeight       : 1,
            widthIncrement  : widthIncrement,
            listeners       : {
                resizedrag  : this.partialResize,
                resize      : this.afterResize,
                scope       : this
            }
        });
        rz.resizeTracker.onMouseDown(e, rz[rtl ? 'west' : 'east'].dom);

        taskEl.addCls('sch-gantt-resizing');

        if (this.useTooltip) {
            this.tip = Ext.create("Ext.ToolTip", {
                autoHide    : false,
                anchor      : 'b',
                html        : '%'
            });

            this.tip.setTarget(el);
            this.tip.update(taskRecord.getPercentDone() + '%');

            this.tip.show();
        }

        return rz;
    },

    // private
    partialResize: function (rz, newWidth) {
        var percent = Math.round(newWidth * 100 / (rz.maxWidth * this.increment)) * this.increment;

        if (this.tip) {
            this.tip.body.update(percent + '%');
        }
    },

    // private
    afterResize: function (rz, w, h, e) {
        var rec = rz.taskRecord;

        if (this.tip) {
            this.tip.destroy();
            this.tip = null;
        }

        var old = rz.taskRecord.getPercentDone();

        if (Ext.isNumber(w)) {
            var percent = Math.round(w * 100 / (rz.maxWidth * this.increment)) * this.increment;

            // Constrain between 0-100
            percent = Math.min(100, Math.max(0, percent));

            rz.taskRecord.setPercentDone(percent);
        }

        if (old === rz.taskRecord.getPercentDone()) {
            // Value didn't change, manually refresh the row
            this.ganttView.refreshNode(this.ganttView.indexOf(rz.taskRecord));
        }

        // Destroy resizable
        rz.destroy();
        this.resizable = null;

        this.ganttView.fireEvent('afterprogressbarresize', this.ganttView, rec);
    },

    // If the new percent done is the same as the old, no resize event will be fired by the Ext.Resizable. Handle this case manually
    onBodyMouseUp : function() {
        if (this.resizable) {
            this.afterResize(this.resizable);
        }
    },

    cleanUp: function () {
        if (this.tip) {
            this.tip.destroy();
        }
    }
});
