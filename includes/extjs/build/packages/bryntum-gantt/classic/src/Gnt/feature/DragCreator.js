/**
 * @class Gnt.feature.DragCreator
 * @private
 *
 * An internal class which shows a drag proxy while clicking and dragging.
 * Create a new instance of this plugin
 */
Ext.define("Gnt.feature.DragCreator", {
    requires         : [
        'Ext.Template',
        'Sch.util.DragTracker',
        'Gnt.Tooltip'
    ],

    /**
     * @cfg {Boolean} disabled true to start disabled
     */
    disabled         : false,

    /**
     * @cfg {Boolean} showDragTip true to show a time tooltip when dragging to create a new event
     */
    showDragTip      : true,

    /**
     * @cfg {Object} tooltipConfig A custom config object to apply to the {@link Gnt.Tooltip} instance.
     */
    tooltipConfig    : null,

    /**
     * @cfg {Number} dragTolerance Number of pixels the drag target must be moved before dragging is considered to have started.
     */
    dragTolerance    : 2,

    /**
     * @cfg {Ext.Template/String} template The HTML template shown when dragging to create new items
     */
    template : '<div class="sch-gantt-dragcreator-proxy"></div>',

    /**
     * @cfg {Function} validatorFn An empty function by default.
     * Provide to perform custom validation on the item being created.
     * @param {Ext.data.Model} record the resource for which the task is being created
     * @param {Date} startDate
     * @param {Date} endDate
     * @param {Event} e The event object
     * @return {Boolean} isValid True if the creation event is valid, else false to cancel
     */
    validatorFn      : Ext.emptyFn,

    /**
    * @cfg {Object} validatorFnScope
    * The scope for the {@link #validatorFn}
    */
    validatorFnScope : null,


    start : null,
    end   : null,

    constructor : function (config) {
        Ext.apply(this, config || {});

        this.init();
    },


    // private
    init : function () {
        var view           = this.ganttView,
            gridViewBodyEl = view.el,
            bind           = Ext.Function.bind;

        view.on({
            destroy : this.onGanttDestroy,
            scope   : this
        });

        this.tracker = new Sch.util.DragTracker({
            el            : gridViewBodyEl,
            tolerance     : this.dragTolerance,
            onBeforeStart : bind(this.onBeforeDragStart, this),
            onStart       : bind(this.onDragStart, this),
            onDrag        : bind(this.onDrag, this),
            onEnd         : bind(this.onDragEnd, this)
        });

        if (this.showDragTip) {
            this.dragTip = new Gnt.Tooltip(Ext.apply({
                mode    : 'duration',
                cls     : 'gnt-dragcreate-tip',
                gantt   : view
            }, this.tooltipConfig));
        }
    },

    /**
    * Enables/disables the plugin
    * @param {Boolean} disabled True to disable this plugin
    */
    setDisabled : function (disabled) {
        this.disabled = disabled;
        if (this.dragTip) {
            this.dragTip.setDisabled(disabled);
        }
    },

    getProxy : function () {
        if (!this.proxy) {
            var containerEl = this.ganttView.up('tablepanel').el;

            if (!(this.template instanceof Ext.Template)) {
                this.template = new Ext.Template(this.template);
            }

            // Attach this element to the nested gantt panel element (view el is cleared by refreshes)
            this.proxy = this.template.append(containerEl, {}, true);
        }
        return this.proxy;
    },

    // private
    onBeforeDragStart : function (e) {
        var s = this.ganttView,
            t = e.getTarget('.' + s.timeCellCls, 2);

        if (t && !this.disabled) {
            var task   = s.resolveTaskRecord(t);
            var dateTime = s.getDateFromDomEvent(e);

            if (!task.isReadOnly() && task.isLeaf() && !task.getStartDate() && !task.getEndDate() && s.fireEvent('beforedragcreate', s, task, dateTime, e) !== false) {

                e.stopEvent();

                // Save record if the user ends the drag outside the current row
                this.record = task;

                // Start time of the task to be created
                this.originalStart = dateTime;

                // Constrain the dragging within the current row schedule area
                this.rowRegion = s.getScheduleRegion(this.record, this.originalStart);

                // Save date constraints
                this.dateConstraints = s.getDateConstraints(this.resourceRecord, this.originalStart);

                // TODO apply xStep or yStep to drag tracker
                return true;
            }
        }
        return false;
    },

    // private
    onDragStart : function () {
        var me    = this,
            view  = me.ganttView,
            proxy = me.getProxy();

        me.start = me.originalStart;
        me.end   = me.start;

        me.rowBoundaries = {
            top    : me.rowRegion.top,
            bottom : me.rowRegion.bottom
        };

        proxy.setBox({
            x      : me.tracker.startXY[0],
            y      : me.rowBoundaries.top,
            height : me.rowBoundaries.bottom - me.rowBoundaries.top
        });

        proxy.show();

        view.fireEvent('dragcreatestart', view);

        if (me.showDragTip) {
            me.dragTip.enable();
            me.dragTip.updateContent(me.start, me.end, true, me.record);
            me.dragTip.showBy(proxy);
        }
    },

    // private
    onDrag : function (e) {
        var me         = this,
            view       = me.ganttView,
            dragRegion = me.tracker.getRegion().constrainTo(me.rowRegion),
            dates      = view.getStartEndDatesFromRegion(dragRegion, 'round');

        if (!dates) {
            return;
        }

        me.start = dates.start || me.start;
        me.end   = dates.end || me.end;

        var dc = me.dateConstraints;

        if (dc) {
            me.end   = Sch.util.Date.constrain(me.end, dc.start, dc.end);
            me.start = Sch.util.Date.constrain(me.start, dc.start, dc.end);
        }

        me.valid = me.validatorFn.call(me.validatorFnScope || me, me.record, me.start, me.end, e) !== false;

        if (me.showDragTip) {
            me.dragTip.updateContent(me.start, me.end, me.valid, me.record);
            me.dragTip.showBy(me.getProxy());
        }

        Ext.apply(dragRegion, me.rowBoundaries);

        me.getProxy().setBox(dragRegion);
    },

    // private
    onDragEnd : function (e) {
        var me         = this,
            view       = me.ganttView,
            doFinalize = true;

        me.createContext = {
            start    : me.start,
            end      : me.end,
            e        : e,
            record   : me.record,
            finalize : function () {
                me.finalize.apply(me, arguments);
            }
        };

        if (me.showDragTip) {
            me.dragTip.disable();
        }

        if (!me.start || !me.end || (me.end < me.start)) {
            me.valid = false;
        }

        if (me.valid) {
            doFinalize = view.fireEvent('beforedragcreatefinalize', me, me.createContext, e) !== false;
        }

        if (doFinalize) {
            me.finalize(me.valid);
        }
    },

    finalize : function (doCreate) {
        var me      = this,
            context = me.createContext,
            view    = me.ganttView;

        if (doCreate) {
            context.record.setStartEndDate(context.start, context.end, context.record.getTaskStore().skipWeekendsDuringDragDrop);
            view.fireEvent('dragcreateend', view, context.record, context.e);
        }

        me.proxy.hide();

        view.fireEvent('afterdragcreate', view);
    },

    onGanttDestroy : function () {
        // In case panel is destroyed while drag create is ongoing, the below date reset indicates to the onDragEnd that the drag was invalid
        // and there should be no side effect
        this.start = this.end = null;

        if (this.tracker) {
            this.tracker.destroy();
        }

        if (this.dragTip) {
            this.dragTip.destroy();
        }

        if (this.proxy) {
            Ext.destroy(this.proxy);
            this.proxy = null;
        }
    }
});
