/**
 @class Gnt.feature.TaskResize
 @extends Ext.util.Observable

 A plugin enabling the task resizing feature. Generally there's no need to manually create it,
 it can be activated with the {@link Gnt.panel.Gantt#taskResizeHandles} option of the gantt panel and configured with the {@link Gnt.panel.Gantt#resizeConfig}.


 */
Ext.define("Gnt.feature.TaskResize", {

    requires : [
        'Ext.resizer.Resizer',
        'Gnt.patches.ResizeTracker',
        'Gnt.Tooltip'
    ],

    constructor : function(config) {
        Ext.apply(this, config);
        var g = this.ganttView;

        g.on({
            destroy : this.onDestroy,
            scope   : this
        });

        g.mon(g.el, 'mousedown', this.onMouseDown, this, { delegate : '.sch-resizable-handle' });

        this.callParent(arguments);
    },

    /**
     * @cfg {Boolean} showDuration true to show the duration instead of the end date when resizing a task
     */
    showDuration : true,

    /**
     * @type {Boolean} showExactResizePosition true to see exact task length during resizing
     */
    showExactResizePosition : false,

    /**
     * @cfg {Boolean} useTooltip `False` to not show a tooltip while resizing
     */
    useTooltip : true,

    /**
     * @cfg {Object} tooltipConfig A custom config object to apply to the {@link Gnt.Tooltip} instance.
     */
    tooltipConfig   : null,

    /**
     * @cfg {Function} validatorFn An empty function by default.
     * Provide to perform custom validation on the item being resized.
     * @param {Ext.data.Model} record The task being resized
     * @param {Date} startDate
     * @param {Date} endDate
     * @param {Event} e The event object
     * @return {Boolean} isValid True if the creation event is valid, else false to cancel
     */
    validatorFn : Ext.emptyFn,

    /**
     * @cfg {Object} validatorFnScope
     * The scope for the validatorFn
     */
    validatorFnScope : null,

    taskRec        : null,
    taskEl         : null,
    isStart        : null,
    ganttView      : null,
    resizable      : null,
    mouseDownEvent : null,
    handlePos      : null,

    onMouseDown    : function(e, t) {
        var ganttView   = this.ganttView;
        var segmentNode = e.getTarget('.sch-gantt-task-segment');
        var taskNode    = e.getTarget(ganttView.eventSelector);
        var taskRecord  = ganttView.resolveTaskRecord(taskNode);

        // Check if we're resizing a split-task segment
        if (segmentNode) {
            taskNode   = segmentNode;
            taskRecord = taskRecord.getSegment( parseInt(segmentNode.getAttribute('data-segmentIndex'), 10) );
        }

        var isResizable = taskRecord.isResizable();

        // Don't trigger on right clicks
        if (e.button !== 0 || isResizable === false || typeof isResizable === 'string' && !taskNode.className.match(isResizable)) {
            return;
        }

        // Allow observers to abort the resize operation
        if (ganttView.fireEvent('beforetaskresize', ganttView, taskRecord, e) === false) {
            return;
        }

        e.stopEvent();
        this.mouseDownEvent = e;
        this.handlePos      = this.getHandlePosition(t);

        this.taskEl  = Ext.get(taskNode);
        this.taskRec = taskRecord;
        this.isStart = !!t.className.match('sch-resizable-handle-start');

        ganttView.el.on({
            mousemove   : this.onMouseMove,
            mouseup     : this.onMouseUp,
            scope       : this,
            single      : true
        });
    },

    // private
    onMouseMove : function(e, t) {
        var g               = this.ganttView,
            record          = this.taskRec,
            taskEl          = this.taskEl,
            rtl             = g.rtl,
            isStart         = this.isStart,
            isWest          = (rtl && !isStart) || (!rtl && isStart),
            widthIncrement  = g.getSnapPixelAmount(),
            currentWidth    = taskEl.getWidth(),
            maxWidth,
            sibling;

        // Not all zoom levels support perfect snapping (e.g. in Month view we cannot snap to days)
        widthIncrement = Math.max(1, widthIncrement);

        var resizerConfig = {
            target         : taskEl,
            record         : record,
            isStart        : isStart,
            isWest         : isWest,
            handles        : isWest ? 'w' : 'e',
            minHeight      : 1,
            minWidth       : widthIncrement,
            widthIncrement : widthIncrement,
            listeners      : {
                resizedrag : this.partialResize,
                resize     : this.afterResize,
                scope      : this
            }
        };

        if (record instanceof Gnt.model.TaskSegment && (sibling = this.taskEl.next('.sch-gantt-task-segment'))) {
            // Segment tasks in a split-task are constrained horizontally to the following segment border
            resizerConfig.maxWidth  = rtl ? sibling.getRight() - taskEl.getRight() : sibling.getLeft() - taskEl.getLeft();
        }

        // Normal tasks, and last segment in a split-task are constrained to the row element
        resizerConfig.constrainRegion         = taskEl.up(g.getItemSelector()).getRegion();

        taskEl.addCls('sch-gantt-resizing');

        this.ganttView.fireEvent('taskresizestart', this.ganttView, this.taskRec);

        // Since percent complete indicator uses fixed amount of pixels, we need to switch
        // it to use % during the resize operation (visual indication only)
        var progressBarEl = taskEl.down('.sch-gantt-progress-bar', true);

        if (progressBarEl) {
            Ext.fly(progressBarEl).setWidth(100 * Ext.fly(progressBarEl).getWidth() / taskEl.getWidth() + '%');
        }

        this.resizable = Ext.create('Ext.resizer.Resizer', resizerConfig);

        // HACK calling private method
        this.resizable.resizeTracker.onMouseDown(this.mouseDownEvent, this.resizable[isWest ? 'west' : 'east'].dom);
        this.resizable.resizeTracker.onMouseMove(e, this.resizable[ this.handlePos ].dom);

        if (this.useTooltip) {

            if(!this.tip) {
                this.tip = Ext.create(Ext.apply({
                    xclass  : 'Gnt.Tooltip',
                    mode    : this.showDuration ? 'duration' : 'startend',
                    gantt   : this.ganttView,
                    constrainTo : this.ganttView.up('grid').el,
                    cls     : 'gnt-resize-tip'
                }, this.tooltipConfig));
            } else {
                this.tip.enable();
            }

            this.tip.updateContent(record.getStartDate(), record.getEndDate(), true, record);
            this.tip.showBy(taskEl, e.getX());

            // Catch case of user not moving the mouse at all
            Ext.getBody().on('mouseup', function(){ this.tip.disable(); }, this, { single : true });
        }
    },

    onMouseUp : function(e, t) {
        var g = this.ganttView;

        g.el.un({
            mousemove   : this.onMouseMove,
            mouseup     : this.onMouseUp,
            scope       : this,
            single      : true
        });

        this.mouseDownEvent = null;
        // manually clean up any cached elements, https://app.assembla.com/spaces/bryntum/tickets/realtime_list?tickets_report_id=filter:u2231773&ticket=4997

        if (this.resizable) {
            this.resizable.east && this.resizable.east.destroy();
            this.resizable.west && this.resizable.west.destroy();
        }
    },

    // private
    partialResize : function (resizer, newWidth, oldWidth, e) {
        var ganttView   = this.ganttView,
            isWest      = resizer.isWest,
            task        = resizer.record,
            el          = resizer.el,
            cursorDate;

        cursorDate = ganttView.getDateFromCoordinate(resizer.isStart ? el.getLeft() : el.getRight(), this.showExactResizePosition ? null : 'round');

        var start, end, newDate;

        if (this.showExactResizePosition) {
            var adjustedDate = ganttView.timeAxis.roundDate(cursorDate, ganttView.snapRelativeToEventStartDate ? task.getStartDate() : false);
            adjustedDate    = task.skipNonWorkingTime(adjustedDate, !task.isMilestone());

            var target = resizer.target.el,
                exactWidth;

            if (isWest) {
                start       = task.skipNonWorkingTime(adjustedDate, !task.isMilestone());
                newDate     = start;

                exactWidth    = ganttView.timeAxisViewModel.getDistanceBetweenDates(start, task.getEndDate());
                target.setWidth(exactWidth);

                var offsetX = ganttView.timeAxisViewModel.getDistanceBetweenDates(cursorDate, start);
                target.setX(target.getX() + offsetX);
            } else {
                // to calculate endDate properly we have to clone task and set endDate
                var clone = Gnt.util.Data.cloneModelSet([task])[0];
                var taskStore = task.getTaskStore();
                clone.setTaskStore(taskStore);
                clone.setCalendar(task.getCalendar());

                clone.setEndDateWithoutPropagation(adjustedDate, false, taskStore.skipWeekendsDuringDragDrop);

                end = clone.getEndDate();
                newDate     = end;

                exactWidth    = ganttView.timeAxisViewModel.getDistanceBetweenDates(task.getStartDate(), end);
                target.setWidth(exactWidth);
            }
        } else {
            start = resizer.isStart ? cursorDate : resizer.record.getStartDate();
            end   = resizer.isStart ? resizer.record.getEndDate() : cursorDate;
            newDate     = cursorDate;
        }

        resizer.date = newDate;

        ganttView.fireEvent('partialtaskresize', ganttView, task, start, end, resizer.el, e);

        // sometimes when you resize fast this.tip here is undefined
        // so checking just this.useTooltip is not enough
        if (this.useTooltip && this.tip) {
            var valid = this.validatorFn.call(this.validatorFnScope || this, task, start, end) !== false;
            this.tip.updateContent(start, end, valid, task);
        }
    },

    // private
    afterResize : function (resizer, w, h, e) {
        if (this.useTooltip) {
            this.tip.disable();
        }
        var me          = this,
            record      = resizer.record,
            oldStart    = record.getStartDate(),
            oldEnd      = record.getEndDate(),
            start       = resizer.isStart ? resizer.date : oldStart,
            end         = resizer.isStart ? oldEnd : resizer.date,
            ganttView   = me.ganttView,
            modified    = false,
            doFinalize  = true;

        me.resizeContext    = {
            record          : record,
            start           : start,
            end             : end,
            oldStart        : record.getStartDate(),
            finalize        : function() { me.finalize.apply(me, arguments); }
        };

        if (start && end && // Input sanity check
            (start - oldStart || end - oldEnd) && // Make sure start OR end changed
            me.validatorFn.call(me.validatorFnScope || me, record, start, end, e) !== false) {

            doFinalize  = ganttView.fireEvent('beforetaskresizefinalize', me, me.resizeContext, e) !== false;
            modified    = true;

        } else {
            ganttView.refreshKeepingScroll();
        }

        if (doFinalize) {
            me.finalize(modified);
        }
    },

    finalize    : function (updateRecord) {
        var me           = this,
            view         = me.ganttView,
            context      = me.resizeContext,
            record       = context.record,
            rowTask      = record.task || record, // Make sure we tell the view to resize a record in its store, and not a segment
            skipWeekends = view.taskStore.skipWeekendsDuringDragDrop,
            previousDate,
            newDate;


        if (updateRecord) {
            // start <= end is "normal" case
            // start > end is case when task should be resized to 0
            if (context.start - context.oldStart !== 0) {

                previousDate    = record.getStartDate();
                newDate         = context.start <= context.end ? context.start : context.end;

                record.setStartDate(newDate, false, skipWeekends, function(cancelChanges, affectedTasks) {
                    newDate     = record.getStartDate();
                    if (!(newDate < previousDate || newDate > previousDate)) {
                        view.refreshNode(view.store.indexOf(rowTask));
                    }
                    view.fireEvent('aftertaskresize', view, rowTask);
                });

            } else {

                previousDate    = record.getEndDate();
                newDate         = context.start <= context.end ? context.end : context.start;

                record.setEndDate(newDate, false, skipWeekends, function(cancelChanges, affectedTasks) {
                    newDate     = record.getEndDate();
                    if (!(newDate < previousDate || newDate > previousDate)) {
                        view.refreshNode(view.store.indexOf(rowTask));
                    }
                    view.fireEvent('aftertaskresize', view, rowTask);
                });
            }

        } else {
            view.refreshNode(view.store.indexOf(rowTask));
            view.fireEvent('aftertaskresize', view, rowTask);
        }

        // Destroy resizable
        me.resizable.destroy();
        me.resizable = null;
        me.resizeContext = null;
    },

    getHandlePosition : function(node) {
        var isStart = node.className.match('start');

        if (this.ganttView.rtl) {
            return isStart ? 'east' : 'west';
        }
        return isStart ? 'west' : 'east';
    },

    onDestroy : function() {
        if (this.tip) {
            this.tip.destroy();
        }
        this.mouseDownEvent = null;
    }
});
