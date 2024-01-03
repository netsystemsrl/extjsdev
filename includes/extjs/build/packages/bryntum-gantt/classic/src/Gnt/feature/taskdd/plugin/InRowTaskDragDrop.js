/**
 * @class Gnt.feature.taskdd.plugin.InRowTaskDragDrop
 *
 * In row task drag & drop plugin.
 */
Ext.define('Gnt.feature.taskdd.plugin.InRowTaskDragDrop', function(thisClass) {

    function positionTaskElement(gantt, taskEl, startDate, endDate) {
        var startX = Ext.isDate(startDate) ? gantt.getCoordinateFromDate(startDate, false) : startDate,
            endX   = Ext.isDate(endDate) ? gantt.getCoordinateFromDate(endDate, false) : endDate;

        Ext.fly(taskEl).setX(startX);
        Ext.fly(taskEl).setWidth(endX - startX);
    }

    function withSnappedTaskCoordinates(currentPointX, startPointDate, task, gantt, showExactDropPosition, snapRelativeToEventStartDate, skipWeekendsDuringDragDrop, skipWeekendsFn, doFn) {
        var result = false,
            ltr = !gantt.rtl, //!gantt.shouldAdjustForRtl(), // NOTE: shouldAdjustForRtl() is either not reliable or handles different case
            //       it returns true in tests, but false in demos, regardless of Gantt's rtl : true setting
            currentPointDate, timeDiffMs,
            timeAxisStartDate, timeAxisEndDate,
            newStartDate, newEndDate,
            newStartDateX, newEndDateX,
            viewWidth;

        // Calculating current pointer date from its X coordinate to be able to calculate time shift
        // the pointer movement represents
        currentPointDate = gantt.getDateFromCoordinate(currentPointX);
        timeDiffMs       = currentPointDate - startPointDate;

        // Now calculating new start date
        newStartDate = Sch.util.Date.add(task.getStartDate(), Sch.util.Date.MILLI, timeDiffMs);

        // If showing exact drop position is requested
        if (showExactDropPosition) {

            // If weekends skipping is requested then skipping
            if (skipWeekendsDuringDragDrop) {
                newStartDate = skipWeekendsFn.call(this, task, newStartDate);
            }

            // Rounding new start date value using timeaxis which will also snap the date rounded to gantt's
            // snap pixel amount
            newStartDate = gantt.timeAxis.roundDate(newStartDate, snapRelativeToEventStartDate ? task.getStartDate() : false);

            // WARNING: calling private method, but the same has been done in original/non-refactored
            //          Gnt.features.TaskDragDrop code, so don't blame me.
            newEndDate = task.recalculateEndDate(newStartDate);
        }
        else {
            // in this branch we don't need to adjust drag proxy position and dimensions
            // position will be updated by drop source, and dimensions can't change here

            // NOTE: this simplistic "newEnddate" calculation is not accurate since it doesn't take into account non-working days. Though it's not critical until someone complains
            // We calculate end date here just for the tooltip
            if (task.isSegmented()) {
                newEndDate = Sch.util.Date.add(newStartDate, Sch.util.Date.MILLI, task.getLastSegment().getEndOffset());
            } else {
                newEndDate = Sch.util.Date.add(newStartDate, task.getDurationUnit(), task.getDuration());
            }

        }

        timeAxisStartDate = gantt.timeAxis.getStart();
        timeAxisEndDate   = gantt.timeAxis.getEnd();

        // Calculating new start / end horizontal coordinates, which always should be within visible time span

        // NOTE: We need page coordinates here, they are usually passed to DragZone#alignElWithMouse()
        //       via DragZone::setDragElPos() later on

        if (Sch.util.Date.betweenLesser(newStartDate, timeAxisStartDate, timeAxisEndDate)) {
            // Milestone tasks has additional offset that we should respect
            newStartDateX = gantt.getCoordinateFromDate(newStartDate, false) - gantt.getXOffset(task);
        }
        else {
            // If we show exact position and new start date is out of view's right bound - use time axis end date
            // as new start X.
            if (showExactDropPosition && timeAxisEndDate <= newStartDate) {
                newStartDateX = gantt.getCoordinateFromDate(timeAxisEndDate, false);
            } else {
                newStartDateX = gantt.getCoordinateFromDate(timeAxisStartDate, false);
            }
        }

        if (Sch.util.Date.betweenLesser(newEndDate, timeAxisStartDate, timeAxisEndDate)) {
            newEndDateX = gantt.getCoordinateFromDate(newEndDate, false);
        }
        else {
            newEndDateX = gantt.getCoordinateFromDate(timeAxisEndDate, false);
        }

        if (gantt.rtl && gantt.shouldAdjustForRtl()) {
            viewWidth     = gantt.getWidth();
            newStartDateX = viewWidth - newStartDateX;
            newEndDateX   = viewWidth - newEndDateX;
        }

        result = (doFn || Ext.returnTrue)(newStartDate, newEndDate, newStartDateX, newEndDateX);

        return result;
    }

    function doProcessDrop(me, gantt, target, task, startDate, endDate, dropSource, data, initialTaskElStartX, initialTaskElWidth, e, dropActionFn) {

        (new Ext.Promise(function(resolve, reject) {

            var dropHandler = new Gnt.feature.taskdd.AsyncDropHandler(resolve, reject, dropActionFn),
                eventCanceled,
                dragContext;

            if (gantt.hasListeners.beforetaskdropfinalize) {

                // TODO: other properties might be needed
                // Backward compatibility
                dragContext = Ext.apply({}, data, {
                    start : startDate,
                    end   : endDate,
                    finalize : function(validDrop) {
                        if (validDrop) {
                            dropHandler.process();
                            dropHandler.done();
                        }
                        else {
                            // Since we have moved task element to the drop coordinates to visually
                            // indicate possible task position during asynchronous drop processing
                            // so we have to restore the element position back to original task
                            // time coordinates
                            positionTaskElement(gantt, data.ddel, initialTaskElStartX, initialTaskElStartX + initialTaskElWidth);

                            dropHandler.cancel();
                        }
                    }
                });

                /**
                 * @event beforetaskdropfinalize
                 * @preventable
                 *
                 * Fires before a SUCCESSFUL drop operation is finalized.
                 * This event is supposed to be used as a SYNCHRONOUS hook before the drop finalizing, or as an ASYNCHRONOUS drop validator.
                 * Return `true` to finalize the drop operation immediately, or return `false` to finalize it later.
                 * To finalize the operation later, call the 'finalize' method available on the context object.
                 * Pass `true` to the `finalize` function to accept the drop or `false` if you want to cancel it.
                 *
                 * Here is an example of a **sync** hook:
                 *
                 * ```javascript
                 * beforetaskdropfinalize : function (view, dragContext, e) {
                 *     dragContext.record.setCls('dropped');
                 *     return true;
                 * }
                 *
                 * ```
                 *
                 * Here is an example of an **async** hook:
                 *
                 * ```javascript
                 * beforetaskdropfinalize : function (view, dragContext, e) {
                 *     Ext.Ajax.request({
                 *         url     : '/check-the-drop-operation',
                 *         success : function (response) {
                 *             // confirm the drop operation
                 *             dragContext.finalize(true);
                 *         },
                 *         failure : function (response) {
                 *             // decline the drop operation
                 *             dragContext.finalize(false);
                 *         }
                 *     });
                 *     return false;
                 * }
                 * ```
                 *
                 * **NOTE:** In case you return `false` from the listener, you should ALWAYS call the `finalize` function,
                 * no matter with `true` argument to confirm the drop operation, or with `false` argument to decline it.
                 *
                 * **NOTE2:** If you need to perform SYNCHRONOUS drop validation please take a look at {@link Gnt.feature.taskdd.plugin.InRowTaskDragDrop#validatorFn validatorFn}.
                 *
                 * @param {Mixed} view The gantt view instance
                 * @param {Object} dragContext An object containing 'record', 'start', 'finalize' properties.
                 * @param {Ext.EventObject} e The event object
                 *
                 * @member Gnt.view.Gantt
                 */

                // Sane event signature
                //eventCanceled = (false === gantt.fireEvent('beforetaskdropfinalize', gantt, data, dropHandler, e));

                // Backward compatible event signature
                eventCanceled = (false === gantt.fireEvent('beforetaskdropfinalize', gantt, dragContext, e));

                // Proxy element will be hidden at that moment but drop is being processed asynchronously
                // thus we still need a visual indication where a task element might be in case drop will
                // be considered valid after asynchronous processing. Lets move task element at the drop
                // coordinates.
                if (eventCanceled && !dropHandler.isCanceled()) {
                    positionTaskElement(gantt, data.ddel, startDate, task.isMilestone() ? null : endDate);
                }
            }

            // Sane behaviour
            //if (eventCanceled && !dropHandler.isWaiting() && (!dropHandler.isDone() || !dropHandler.isCanceled())) {
            //    dropHandler.cancel();
            //}
            //else if (!dropHandler.isWaiting() && (!dropHandler.isDone() || !dropHandler.isCanceled())) {
            //    dropHandler.process();
            //    dropHandler.done();
            //}

            // Backward compatible behaviour
            if (!eventCanceled && !dropHandler.isWaiting() && !(dropHandler.isDone() || dropHandler.isCanceled())) {
                dropHandler.process();
                dropHandler.done();
            }

        }).then(function(result) {

            /**
             * @event taskdrop
             *
             * Fires after a succesful drag and drop operation
             *
             * @param {Gnt.view.Gantt} gantt The gantt view instance
             * @param {Gnt.model.Task} taskRecord The dropped record
             *
             * @member Gnt.view.Gantt
             */
            gantt.hasListeners.taskdrop && gantt.fireEvent('taskdrop', gantt, task);

        }).then(undefined, function(result) {

            /**
             * @event taskdropcancel
             *
             * Fires if task drop operation is canceled
             *
             * @param {Gnt.view.Gantt} gantt The gantt view instance
             * @param {Gnt.model.Task} taskRecord The dropped record
             *
             * @member Gnt.view.Gantt
             */
            gantt.hasListeners.taskdropcancel && gantt.fireEvent('taskdropcancel', gantt, task);

        }));
    }

    function doDefaultDropProcessing(me, task, newStartDate, newEndDate) {
        task.setStartEndDate(newStartDate, newEndDate);
    }

    return {

        extend : 'Ext.plugin.Abstract',
        alias  : 'plugin.gantt_inrowtaskdragdrop',
        id     : 'inrowtaskdragdrop',

        requires : [
            'Ext.Promise',
            'Sch.util.Date',
            'Gnt.Tooltip',
            'Gnt.feature.taskdd.AsyncDropHandler'
        ],

        config : {
            /**
             * @cfg {Gnt.view.Gantt} gantt Gantt view the drop controller works with
             */
            gantt : null,

            /**
             * @cfg {Boolean|Object} tooltip True or a custom config object to enable and apply to the {@link Gnt.Tooltip} instance.
             *
             * Pass false to disable tooltip during in row dragging.
             */
            tooltip : null,

            /**
             * @cfg {Function} validatorFn
             * A custom validation function to be called during the drag and drop process
             * and also after the drop operation is made but before it's finalized.
             * If you need to perform an async validation,
             * please take a look at {@link Gnt.view.Gantt#beforetaskdropfinalize beforetaskdropfinalize} event instead.
             *
             * @param {Gnt.model.Task} record The record being dragged
             * @param {Date} date The new start date
             * @param {Number} duration The duration of the item being dragged, in minutes
             * @param {Ext.EventObject} e The event object
             * @return {Boolean} true if the drop position is valid, else false to prevent a drop
             */
            validatorFn : Ext.returnTrue,

            /**
             * @cfg {Boolean} [showExactDropPosition=false] When enabled, the task being dragged always "snaps" to the exact start date / duration that it will have after being dropped.
             */
            showExactDropPosition : false,

            /**
             * @cfg {Boolean} [snaprelativetoeventstartdate=false] Whether to snap relative to task start position or to time axis start date.
             *
             * The option is in effect only if {@link #showExactDropPosition} is set to *true*.
             */
            snapRelativeToEventStartDate : false,

            /**
             * @cfg {Boolean} [skipWeekendsDuringDragDrop=false] When enabled, that task being dragged will skip weekend dates.
             */
            skipWeekendsDuringDragDrop : false,

            /**
             * @cfg {Boolean} [constrainDragToTaskRow=true] When enabled dragged task element will constrained by task row
             */
            constrainDragToTaskRow : true,

            /**
             * @cfg {String} [dropAllowedCls='sch-gantt-dragproxy'] A CSS class to apply to drag proxy if drop is valid at the point
             */
            dropAllowedCls : 'sch-gantt-dragproxy'
        },

        ganttDetacher       : null,
        initialTaskElStartX : null,
        initialTaskElWidth  : null,

        /**
         * @private
         */
        skipWeekends : function (task, startDate) {
            var taskStore = task.getTaskStore(true),
                scheduleByConstraints = taskStore && taskStore.scheduleByConstraints;

            // If "scheduleByConstraints" is false we use old behavior - all tasks skip non-working time forwards, except milestones which skip backwards.
            // And when "scheduleByConstraints" is true we skip it forwards.
            return task.skipNonWorkingTime(startDate, scheduleByConstraints ? true : !task.isMilestone());
        },

        /**
         * @inheritdoc
         */
        destroy : function() {
            var me = this;

            me.setTooltip(null); // this will destroy the tooltip
            me.setGantt(null);   // this will detach from gantt events if any are being listened for
            me.callParent();
        },

        /**
         * Enables task in row drag & drop
         */
        enable : function() {
            var me = this;

            if (me.disabled) {
                me.callParent();
                me.attachToGantt();
            }
        },

        /**
         * Disables task in row drag & drop
         */
        disable : function() {
            var me = this;

            if (!me.disabled) {
                me.callParent();
                me.detachFromGantt();
            }
        },

        updateGantt : function(gantt, oldGantt) {
            var me = this;

            oldGantt && me.detachFromGantt();
            gantt && !me.disabled && me.attachToGantt();
        },

        attachToGantt : function() {
            var me = this;

            me.ganttDetacher = me.getGantt().on({
                scope : me,
                destroyable : true,
                'taskdragstart'       : me.onTaskDragStart,
                'task-row-drag-enter' : me.onTaskRowDragEnter,
                'task-row-drag-out'   : me.onTaskRowDragOut,
                'task-row-drag-over'  : me.onTaskRowDragOver,
                'task-row-drag-drop'  : me.onTaskRowDragDrop,
                'schedule-drag-over'  : me.onTaskContainerOver,
                'aftertaskdrop'       : me.onAfterTaskDrop
            });
        },

        detachFromGantt : function() {
            var me = this;

            me.ganttDetacher && (Ext.destroy(me.ganttDetacher), me.ganttDetacher = null);
        },

        applyTooltip : function(tooltip) {
            var me = this;

            if (tooltip && !(tooltip instanceof Gnt.Tooltip)) {
                tooltip = Ext.create(Ext.apply({}, tooltip === true ? {} : tooltip, {
                    xclass       : 'Gnt.Tooltip',
                    gantt        : me.getGantt(),
                    constrainTo  : me.getGantt().getEl(),
                    cls          : "gnt-dragdrop-tip",
                    hidden       : true,
                    avoidPointer : true,
                    $ownedBy     : me
                }));
            }

            return tooltip;
        },

        updateTooltip : function(tooltip, oldTooltip) {
            var me = this;

            if (oldTooltip && oldTooltip.$ownedBy === me) {
                Ext.destroy(oldTooltip);
            }
        },

        updateTipContent : function (tip, task, start, end, valid) {
            start = start || task.getStartDate();
            end   = end || task.getEndDate();

            var store  = task.getTaskStore(true),
                format = tip.gantt.getDisplayDateFormat();

            if (!store || !store.disableDateAdjustments) {
                start = task.getDisplayStartDate(format, tip.adjustMilestones, start, true);
                end   = task.getDisplayEndDate(format, tip.adjustMilestones, end, true);
            }

            tip.updateContent(start, end, valid, task);
        },

        constrainProxyToInitialTaskRow : function(gantt, taskEl, initialTaskElementClickOffsets, dropSource) {
            var proxy = dropSource.getProxy(),
                taskXY,
                viewXY,
                offsets;

            // If proxy will be within initial task row then we should attach it to Gantt's secondary canvas
            // such that Gantt's view bounded proxy element
            proxy.setForceAttachTo(gantt.getSecondaryCanvasEl());

            // Since proxy will now be a visual replacement of the task than we are to hide
            // the original task element
            Ext.fly(taskEl).hide();

            // Now constraining proxy movemeent within initial task row.
            // To be precise we will constrain proxy vertical movement, we will setup it such that
            // proxy vertical offset relative to original task element top be 0 always
            taskXY  = Ext.fly(taskEl).getXY();
            taskXY  = new Ext.util.Point(taskXY[0], taskXY[1]);
            viewXY  = Ext.fly(dropSource.getEl()).getXY();
            viewXY  = new Ext.util.Point(viewXY[0], viewXY[1]);
            offsets = taskXY.getOffsetsTo(viewXY);

            // This is DD magic, believe me it should be like this
            // Internally setInitPosition() takes page coordinates of the dropSource.getEl() (which is gantt view
            // in our case, and then substracts from it deltaX, deltaY, passed as arguments, and stores the result
            // as dragging initial page coordinates.
            dropSource.setInitPosition(-offsets.x, -offsets.y);
            dropSource.setDelta(initialTaskElementClickOffsets.x, initialTaskElementClickOffsets.y);
            dropSource.setYConstraint(0, 0);
        },

        onTaskDragStart : function(gantt, task, xy, data, dropSource) {
            var me = this;

            this.initialTaskElStartX = Ext.fly(data.ddel).getX();
            this.initialTaskElWidth  = Ext.fly(data.ddel).getWidth();

            // If it's task drag and drag should be constrained to task row only then constraining proxy
            if (data.isTaskDrag && me.getConstrainDragToTaskRow()) {
                me.constrainProxyToInitialTaskRow(gantt, data.ddel, data.startOffsets, dropSource);
            }
        },

        onTaskRowDragEnter : function(gantt, target, dropSource, data, e) {
            var me = this,
                tip;

            if (data.isTaskDrag && Ext.fly(data.item).contains(target)) {

                // Snapping proxy to task row
                me.constrainProxyToInitialTaskRow(gantt, data.ddel, data.startOffsets, dropSource);

                // Aligning tooltip
                tip = me.getTooltip();
                tip && me.updateTipContent(tip, data.record);
                tip && tip.showBy(dropSource.getProxy().getGhost());
            }
        },

        onTaskRowDragOut : function(gantt, target, dropSource, data, e) {
            var me = this,
                tip;

            if (data.isTaskDrag && !me.getConstrainDragToTaskRow() && Ext.fly(data.item).contains(target)) {

                // Returning proxy back to body
                dropSource.getProxy().setForceAttachTo(null);
                // Force removing cls to ensure proper proxy style
                dropSource.getProxy().removeCls(me.getDropAllowedCls());

                // Hiding tooltip
                tip = me.getTooltip();
                tip && tip.hide();

                // Resetting proxy delta and movement constraints
                dropSource.setDelta(0, 0);
                dropSource.clearConstraints();

                // Showing original task element back
                Ext.fly(data.ddel).show();
            }
        },

        onTaskRowDragOver : function(gantt, target, dropSource, data, e, canHandleDrop) {
            var me = this,
                eXY,
                tip,
                task;

            if (data.isTaskDrag && (me.getConstrainDragToTaskRow() || Ext.fly(data.item).contains(target))) {

                // To keep visual compatibility with previous task drag & drop implementation we should always
                // report as if we can handle task drop here
                canHandleDrop(me.getDropAllowedCls());

                task = data.record;

                eXY = e.getXY();

                // The method contains the logic to snap task to exact drop start/end dates
                withSnappedTaskCoordinates(
                    eXY[0],
                    data.startPointDate,
                    task,
                    gantt,
                    me.getShowExactDropPosition(),
                    me.getSnapRelativeToEventStartDate(),
                    me.getSkipWeekendsDuringDragDrop(),
                    me.skipWeekends,
                    function(newStartDate, newEndDate, newStartDateX, newEndDateX) {
                        var valid = true,
                            validDragElX,
                            validDragElY;

                        // We add offsets here because the same offsets has been passed to DragZone::setDelta() at
                        // the drag enter event handler. The offsets set via setDelta() will be automatically subtracted
                        // from the coordinates we pass here, thus we add them back. In other words
                        // DragZone::setDragElPos() expects here the coordinates of the mouse pointer, not the coordinates
                        // of the dragged element
                        validDragElY = eXY[1] + data.startOffsets.y;

                        if (gantt.rtl && gantt.shouldAdjustForRtl()) {
                            validDragElX = newEndDateX + data.startOffsets.x;
                        }
                        else {
                            validDragElX = newStartDateX + data.startOffsets.x;
                        }

                        // We do not rely on default proxy movement here and update drag element position manually
                        // due to the fact that node over notification might come via emulation layer in
                        // Gnt.feature.taskdd.DropZone activated upon drop zone element scrolling.
                        // Meant to fix position when snapToIncrement is enabled
                        dropSource.setDragElPos(validDragElX, validDragElY);

                        // If we don't require showing exact drop position then default proxy movement handling is
                        // enough and we should do nothing, we calculate start/end dates just for the tooltip then
                        // NOTE: remove that condition if you want proxy size adjusted for the case when partially
                        //       visible event is being moved
                        // NOTE: Math.abs() is for RTL mode, when (newEndDateX < newStartDateX)
                        if ((gantt.rtl || me.getShowExactDropPosition()) && !task.isMilestone()) {
                            Ext.fly(dropSource.getProxy().getTaskGhostEl()).setWidth(Math.abs(newEndDateX - newStartDateX));
                        }

                        // Validating drop with user supplied validatorFn, here just to update the tip
                        if (me.getValidatorFn()) {
                            valid = (false !== (me.getValidatorFn())(task, newStartDate, newEndDate - newStartDate, e));
                        }

                        // Aligning tooltip
                        tip = me.getTooltip();
                        tip && me.updateTipContent(tip, task, newStartDate, newEndDate, valid);
                        tip && tip.showBy(dropSource.getProxy().getGhost());

                        return true;
                    }
                );
            }
        },

        onTaskRowDragDrop : function(gantt, target, dropSource, data, e) {
            var me = this,
                eXY,
                task;

            if (data.isTaskDrag && (me.getConstrainDragToTaskRow() || Ext.fly(data.item).contains(target))) {

                task = data.record;

                eXY = e.getXY();

                // Returning proxy back to body, it's important to do here, after this moment secondary canvas
                // the proxy is attached to might be destroyed and then re-created back, but this will also
                // destroy proxy's ghost element. So by detaching it from secondary canvas back to body element
                // we save the ghost.
                dropSource.getProxy().setForceAttachTo(null);

                // The method contains the logic to snap task to exact drop start/end dates
                withSnappedTaskCoordinates(
                    eXY[0],
                    data.startPointDate,
                    task,
                    gantt,
                    // Here at the drop time we need to calculate new start / end dates exactly how it will be adjusted
                    // after taking into account snapping and weekend skipping settings, thus we pass true here
                    // instead of me.getShowExactDropPosition()
                    true,
                    me.getSnapRelativeToEventStartDate(),
                    me.getSkipWeekendsDuringDragDrop(),
                    me.skipWeekends,
                    function(newStartDate, newEndDate, newStartDateX, newEndDateX) {
                        var valid = true;

                        // Processing drop only if task's start date is to be changed
                        if (task.getStartDate() - newStartDate) {

                            // Validating drop with user supplied validatorFn
                            if (me.getValidatorFn()) {
                                valid = (false !== (me.getValidatorFn())(task, newStartDate, newEndDate - newStartDate, e));
                            }

                            valid && me.processDrop(gantt, target, task, newStartDate, newEndDate, dropSource, data, me.initialTaskElStartX, me.initialTaskElWidth, e, function() {
                                doDefaultDropProcessing(me, task, newStartDate, newEndDate);
                            });
                        }
                    }
                );
            }
        },

        onTaskContainerOver : function(gantt, dropSource, data, e, canHandleDrop) {
            var me = this;

            if (data.isTaskDrag && me.getConstrainDragToTaskRow()) {
                // If proxy is constrained to be within initial task row then we always should report
                // as if we can handle drop to keep visual compatibility with the previous task drag & drop implementation
                canHandleDrop(me.getDropAllowedCls());
            }
        },

        onAfterTaskDrop : function(gantt, record, e, data, dropSource) {
            var me = this,
                tip;

            // We don't always get drag out event, thus this is the last chance to do cleanup
            if (data.isTaskDrag) {

                // Returning proxy back to body
                dropSource.getProxy().setForceAttachTo(null);

                // Hiding tooltip
                tip = me.getTooltip();
                tip && tip.hide();

                // Just in case
                dropSource.clearConstraints();

                // Showing original task element back (just in case), we have hidden in in onTaskRowDragEnter() and
                // we might not get onTaskRowDragOut() call if drop is within different gantt component
                Ext.fly(data.ddel).show();

                this.initialTaskElStartX = null;
                this.initialTaskElWidth  = null;
            }
        },

        processDrop : function(gantt, target, task, newStartDate, newEndDate, dropSource, data, initialTaskElStartX, initialTaskElWidth, e, dropActionFn) {
            return doProcessDrop(this, gantt, target, task, newStartDate, newEndDate, dropSource, data, initialTaskElStartX, initialTaskElWidth, e, dropActionFn);
        }
    };
});
