/**
 * @class Gnt.feature.taskdd.plugin.SegmentDragDrop
 *
 * Task segment drag & drop plugin
 */
Ext.define('Gnt.feature.taskdd.plugin.SegmentDragDrop', function(thisClass) {

    function getSegmentAvailableTimespan(gantt, taskSegment, taskSegmentIdx) {
        var task = taskSegment.getTask(),
            segments = task.getSegments(),
            timeAxisStartDate,
            timeAxisEndDate,
            prevSegment,
            nextSegment;

        // <debug>
        Ext.Assert &&
            Ext.Assert.truthy(
                taskSegmentIdx >= 0 && taskSegmentIdx < segments.length,
                "Task segment index is not present"
            );
        // </debug>

        prevSegment = (taskSegmentIdx > 0) && segments[taskSegmentIdx - 1];
        nextSegment = (taskSegmentIdx < segments.length - 1) && segments[taskSegmentIdx + 1];

        timeAxisStartDate = gantt.timeAxis.getStart();
        timeAxisEndDate   = gantt.timeAxis.getEnd();

        return {
            prevSegment         : prevSegment || null,
            nextSegment         : nextSegment || null,
            startDate           : prevSegment ? prevSegment.getEndDate()   : null,
            endDate             : nextSegment ? nextSegment.getStartDate() : null,
            timeAxisStartDate   : timeAxisStartDate,
            timeAxisEndDate     : timeAxisEndDate,
            startDateWithinAxis : prevSegment && Sch.util.Date.betweenLesser(prevSegment.getEndDate(), timeAxisStartDate, timeAxisEndDate) || false,
            endDateWithinAxis   : nextSegment && Sch.util.Date.betweenLesser(nextSegment.getStartDate(), timeAxisStartDate, timeAxisEndDate) || false
        };
    }

    function withSnappedTaskSegmentCoordinates(currentPointX, startPointDate, taskSegment, taskSegmentIdx, gantt, showExactDropPosition, snapRelativeToEventStartDate, skipWeekendsDuringDragDrop, doFn) {
        var result = false,
            currentPointDate, timeDiffMs,
            newStartDate, newEndDate,
            newStartDateX, newEndDateX,
            segmentAvailableTimespan,
            startShrinked = false,
            endShrinked   = false;

        // Calculating current pointer date from its X coordinate to be able to calculate time shift
        // the pointer movement presents
        currentPointDate = gantt.getDateFromCoordinate(currentPointX);
        timeDiffMs       = currentPointDate - startPointDate;

        // Segments are restricted in movement by their sibling segments. Here we calculate valid segment
        // movement timespan
        segmentAvailableTimespan = getSegmentAvailableTimespan(gantt, taskSegment, taskSegmentIdx);

        //
        // Now calculating new start date
        //
        newStartDate = Sch.util.Date.add(taskSegment.getStartDate(), Sch.util.Date.MILLI, timeDiffMs);

        // If showing exact drop position is requested
        if (showExactDropPosition) {

            // Rounding new start date value using timeaxis which will also snap the date rounded to gantt's
            // snap pixel amount
            newStartDate = gantt.timeAxis.roundDate(newStartDate, snapRelativeToEventStartDate ? taskSegment.getStartDate() : false);

            // If weekends skipping is requested then skipping
            if (skipWeekendsDuringDragDrop) {
                newStartDate = taskSegment.skipNonWorkingTime(newStartDate, !taskSegment.isMilestone());
            }
        }

        // We can't go earlier than segment available time span start date if one is given
        startShrinked = segmentAvailableTimespan.startDate && newStartDate < segmentAvailableTimespan.startDate || false;
        newStartDate  = startShrinked ? segmentAvailableTimespan.startDate : newStartDate;

        //
        // Now calculating new end date
        //

        if (showExactDropPosition) {
            // WARNING: calling private method, but the same has been done in original/non-refactored
            //          Gnt.features.TaskDragDrop code, so don't blame me.
            newEndDate = taskSegment.recalculateEndDate(newStartDate);
        }
        else {
            newEndDate = Sch.util.Date.add(newStartDate, taskSegment.getDurationUnit(), taskSegment.getDuration());
        }

        // We can't go later than segment available time span end date if one is given
        endShrinked = segmentAvailableTimespan.endDate && newEndDate > segmentAvailableTimespan.endDate || false;
        newEndDate  = endShrinked ? segmentAvailableTimespan.endDate : newEndDate;

        // NOTE: This code was added to keep new segment D&D implementation compatible
        //       with features/1204_dragdrop.t.js
        // --------------------------------------
        if (endShrinked) {
            newStartDate = Sch.util.Date.add(newEndDate, taskSegment.getDurationUnit(), -taskSegment.getDuration());
            startShrinked = segmentAvailableTimespan.startDate && newStartDate < segmentAvailableTimespan.startDate || false;
            newStartDate  = startShrinked ? segmentAvailableTimespan.startDate : newStartDate;
        }
        // --------------------------------------

        //
        // Calculating new start / end horizontal coordinates, which always should be within visible time span
        //

        // NOTE: We need page coordniates here, they are usually passed to DragZone#alignElWithMouse()
        //       via DragZone::setDragElPos() later on

        if (Sch.util.Date.betweenLesser(newStartDate, segmentAvailableTimespan.timeAxisStartDate, segmentAvailableTimespan.timeAxisEndDate)) {
            newStartDateX = gantt.getCoordinateFromDate(newStartDate, false);
        }
        else {
            newStartDateX = gantt.getCoordinateFromDate(segmentAvailableTimespan.timeAxisStartDate, false);
        }

        if (Sch.util.Date.betweenLesser(newEndDate, segmentAvailableTimespan.timeAxisStartDate, segmentAvailableTimespan.timeAxisEndDate)) {
            newEndDateX = gantt.getCoordinateFromDate(newEndDate, false);
        }
        else {
            newEndDateX = gantt.getCoordinateFromDate(segmentAvailableTimespan.timeAxisEndDate, false);
        }

        result = (doFn || Ext.returnTrue)(newStartDate, newEndDate, newStartDateX, newEndDateX);

        return result;
    }

    function processDrop(me, gantt, target, taskSegment, startDate, endDate, dropSource, data, e) {

        (new Ext.Promise(function(resolve, reject) {

            var dropHandler = new Gnt.feature.taskdd.AsyncDropHandler(resolve, reject, function() {
                    doDefaultDropProcessing(me, taskSegment, startDate, endDate);
                }),
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
                            dropHandler.cancel();
                        }
                    }
                });

                // NOTE: Event is document in InRowTaskDragDrop plugin

                // Sane event signature
                //eventCanceled = (false === gantt.fireEvent('beforetaskdropfinalize', gantt, data, dropHandler, e));

                // Backward compatible event signature
                eventCanceled = (false === gantt.fireEvent('beforetaskdropfinalize', gantt, dragContext, e));
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

            // NOTE: Event is document in InRowTaskDragDrop plugin
            gantt.hasListeners.taskdrop && gantt.fireEvent('taskdrop', gantt, taskSegment);

        }).then(undefined, function(result) {

            // NOTE: Event is document in InRowTaskDragDrop plugin
            gantt.hasListeners.taskdropcancel && gantt.fireEvent('taskdropcancel', gantt, taskSegment);

        }));
    }

    function doDefaultDropProcessing(me, taskSegment, newStartDate, newEndDate) {
        // NOTE: This code was added and the later one commented out to keep new segment
        //       D&D implementation compatible with features/1204_dragdrop.t.js
        taskSegment.setStartDate(newStartDate, true, me.getSkipWeekendsDuringDragDrop());

        // taskSegment.setStartEndDate(newStartDate, newEndDate);
    }

    function setDraggingHorizontalMovementConstrains(dropSource, gantt, taskSegment, taskSegmentIdx, taskSegmentXY, taskSegmentWidth) {
        var segmentAvailableTimespan,
            timespanStartDateX,
            timespanEndDateX;

        segmentAvailableTimespan  = getSegmentAvailableTimespan(gantt, taskSegment, taskSegmentIdx);

        if (segmentAvailableTimespan.startDateWithinAxis && segmentAvailableTimespan.endDateWithinAxis) {
            timespanStartDateX = gantt.getCoordinateFromDate(segmentAvailableTimespan.startDate, false);
            timespanEndDateX   = gantt.getCoordinateFromDate(segmentAvailableTimespan.endDate, false);
            dropSource.setXConstraint(taskSegmentXY.x - timespanStartDateX, timespanEndDateX - taskSegmentXY.x - taskSegmentWidth);
        }
        else if (segmentAvailableTimespan.startDateWithinAxis) {
            timespanStartDateX = gantt.getCoordinateFromDate(segmentAvailableTimespan.startDate, false);
            dropSource.setXConstraint(taskSegmentXY.x - timespanStartDateX, Ext.Number.MAX_SAFE_INTEGER);
        }
        else if (segmentAvailableTimespan.endDateWithinAxis) {
            timespanEndDateX   = gantt.getCoordinateFromDate(segmentAvailableTimespan.endDate, false);
            dropSource.setXConstraint(Ext.Number.MAX_SAFE_INTEGER, timespanEndDateX - taskSegmentXY.x - taskSegmentWidth);
        }
    }

    return {

        extend : 'Ext.plugin.Abstract',
        alias  : 'plugin.gantt_segmentdragdrop',
        id     : 'segmentdragdrop',

        requires : [
            'Ext.Number',
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
             * @cfg {Function} validatorFn An empty function by default.
             *
             * Provide to perform custom validation on the item being dragged.
             * This function is called during the drag and drop process and also after the drop is made.
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
             * @cfg {Boolean} [snapRelativeToEventStartDate=false] Whether to snap relative to task start position or to time axis start date.
             *
             * The option is in effect only if {@link #showExactDropPosition} is set to *true*.
             */
            snapRelativeToEventStartDate : false,

            /**
             * @cfg {Boolean} [skipWeekendsDuringDragDrop=false] When enabled, that task being dragged will skip weekend dates.
             */
            skipWeekendsDuringDragDrop : false,

            /**
             * @cfg {String} [dropAllowedCls='sch-gantt-dragproxy'] A CSS class to apply to drag proxy if drop is valid at the point
             */
            dropAllowedCls : 'sch-gantt-dragproxy'
        },

        ganttDetacher : null,
        lastValidDragElX   : null,
        lastValidDragElY   : null,

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
         * Enables segment drag & drop
         */
        enable : function() {
            var me = this;

            if (me.disabled) {
                me.callParent();
                me.attachToGantt();
            }
        },

        /**
         * Disables segment drag & drop
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
                'task-row-drag-enter' : me.onTaskRowDragEnter,
                'task-row-drag-over'  : me.onTaskRowDragOver,
                'task-row-drag-drop'  : me.onTaskRowDragDrop,
                'schedule-drag-over'  : me.onTaskContainerOver,
                'schedule-drag-out'   : me.onTaskContainerOut,
                'aftertaskdrop'       : me.onAfterTaskDrop
            });
        },

        detachFromGantt : function() {
            var me = this;

            me.ganttDetacher && (Ext.destroy(me.ganttDetacher), me.ganttDetacher = null);
        },

        applyTooltip : function(tooltip) {
            var me = this;
            //Change 6.5 constrainTo  : me.getGantt().getEl() contraints the tip on the task when there is only one row.
            if (tooltip && !(tooltip instanceof Gnt.Tooltip)) {
                tooltip = Ext.create(Ext.apply({}, tooltip === true ? {} : tooltip, {
                    xclass       : 'Gnt.Tooltip',
                    gantt        : me.getGantt(),
                    constrainTo  : me.getGantt().ownerGrid.getEl(),
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

        updateTipContent : function(tip, taskSegmentRecord, start, end) {
            start = start || taskSegmentRecord.getStartDate();
            end   = end   || taskSegmentRecord.getEndDate();

            tip.updateContent(start, end, true, taskSegmentRecord);
        },

        onTaskRowDragEnter : function(gantt, target, dropSource, data, e) {
            var me = this,
                taskSegmentXY,
                elXY,
                offsets,
                taskSegment,
                taskSegmentIdx,
                segmentAvailableTimespan,
                timespanStartDateX,
                timespanEndDateX,
                segmentElWidth,
                tip;

            if (data.isTaskSegmentDrag) {

                // Segments dragging is always withing task view, attaching proxy to gantt view element
                dropSource.getProxy().setForceAttachTo(gantt.getSecondaryCanvasEl());

                // Hiding initial task segment element (it's now presented by the proxy);
                Ext.fly(data.ddel).hide();

                // Constraining proxy movement within initial task row and within segment's sibling segments
                taskSegmentXY = Ext.fly(data.ddel).getXY();
                taskSegmentXY = new Ext.util.Point(taskSegmentXY[0], taskSegmentXY[1]);
                elXY          = Ext.fly(dropSource.getEl()).getXY();
                elXY          = new Ext.util.Point(elXY[0], elXY[1]);
                offsets       = taskSegmentXY.getOffsetsTo(elXY);

                // This is DD magic, believe me it should be like this
                // Internally setInitPosition() takes page coordinates of the dropSource.getEl() (which is gantt view
                // in our case, and then substracts from it deltaX, deltaY, passed as arguments, and stores the result
                // as dragging initial page coordinates.

                // Setting Y axis constraint
                dropSource.setInitPosition(-offsets.x, -offsets.y);
                dropSource.setDelta(data.startOffsets.x, data.startOffsets.y);
                dropSource.setYConstraint(0, 0);

                // Setting X axis constraint
                segmentElWidth     = Ext.fly(dropSource.getProxy().getTaskGhostEl()).getWidth();
                setDraggingHorizontalMovementConstrains(
                    dropSource, gantt, data.record, data.segmentIndex, taskSegmentXY, segmentElWidth
                );

                // Saving initial valid proxy X, Y coordinates
                // We add offsets here because the same offsets has been passing to DragZone::setDelta()
                // The offsets set via setDelta will be automatically substracted
                // from the coordinates we pass to DragZone::setDragElPos() later, thus we adding them back.
                // In other words DragZone::setDragElPos() expects the coordinates of the mouse pointer,
                // not the coordinates the of dragged element
                me.lastValidDragElX = me.lastValidDragElX !== null ? me.lastValidDragElX : (taskSegmentXY.x + data.startOffsets.x);
                me.lastValidDragElY = me.lastValidDragElY !== null ? me.lastValidDragElY : (taskSegmentXY.y + data.startOffsets.y);

                dropSource.unlockDragProxyPosition();
                dropSource.setDragElPos(me.lastValidDragElX, me.lastValidDrarElY);

                // Aligning tooltip
                tip = me.getTooltip();
                tip && me.updateTipContent(tip, data.record);
                tip && tip.showBy(dropSource.getProxy().getGhost());
            }
        },

        onTaskRowDragOver : function(gantt, target, dropSource, data, e, canHandleDrop) {
            var me = this,
                eXY,
                tip,
                taskSegment,
                taskSegmentIdx,
                taskSegmentXY,
                availableTimespan,
                timespanStartDateX,
                timespanEndDateX,
                segmentElWidth;

            if (data.isTaskSegmentDrag) {

                // To keep visual compatibility with previous task drag & drop implementation we should always
                // report as if we can handle task drop here
                canHandleDrop(me.getDropAllowedCls());

                taskSegment    = data.record;
                taskSegmentIdx = data.segmentIndex;

                eXY = e.getXY();

                // The method contains the logic to snap task to exact drop start/end dates
                withSnappedTaskSegmentCoordinates(
                    eXY[0],
                    data.startPointDate,
                    taskSegment,
                    taskSegmentIdx,
                    gantt,
                    me.getShowExactDropPosition(),
                    me.getSnapRelativeToEventStartDate(),
                    me.getSkipWeekendsDuringDragDrop(),
                    function(newStartDate, newEndDate, newStartDateX, newEndDateX) {
                        var validDragElX,
                            validDragElY,
                            valid;


                        // We add offsets here because the same offsets has been passing to DragZone::setDelta() at
                        // the drag enter event handler. The offsets set via setDelta will be automatically substracted
                        // from the coordinates we pass here, thus we adding them back. In other words
                        // DragZone::setDragElPos() expects here the coordinates of the mouse pointer, not the coordinates
                        // of dragged element
                        me.lastValidDragElX = validDragElX = newStartDateX + data.startOffsets.x;
                        me.lastValidDragElY = validDragElY = eXY[1] + data.startOffsets.y;

                        // We do not rely on default proxy movement here and update drag element position manually
                        // due to the fact that node over notification might come via emulation layer in
                        // Gnt.feature.taskdd.DropZone activated upon drop zone element scrolling.
                        dropSource.setDragElPos(validDragElX, validDragElY);

                        // If we don't require showing exact drop position then default proxy movement handling is
                        // enough and we should do nothing, we calculate start/end dates just for the tooltip then
                        if (me.getShowExactDropPosition()) {

                            // Updating ghost task element width, due to snapping it might have been changed
                            // and we should reflect it visually
                            segmentElWidth = newEndDateX - newStartDateX;
                            Ext.fly(dropSource.getProxy().getTaskGhostEl()).setWidth(segmentElWidth);

                            // Reconstraining drag proxy X axis since proxy width might have changed
                            taskSegmentXY  = Ext.fly(data.ddel).getXY();
                            taskSegmentXY  = new Ext.util.Point(taskSegmentXY[0], taskSegmentXY[1]);

                            setDraggingHorizontalMovementConstrains(
                                dropSource, gantt, taskSegment, taskSegmentIdx, taskSegmentXY, segmentElWidth
                            );
                        }

                        // Validating drop with user supplied validatorFn, here just to update the tip
                        if (me.getValidatorFn()) {
                            valid = (false !== (me.getValidatorFn())(taskSegment, newStartDate, newEndDate - newStartDate, e));
                        }

                        // Aligning tooltip
                        tip = me.getTooltip();
                        tip && me.updateTipContent(tip, taskSegment, newStartDate, newEndDate, valid);
                        tip && tip.showBy(dropSource.getProxy().getGhost());
                    }
                );
            }
        },

        onTaskRowDragDrop : function(gantt, target, dropSource, data, e) {
            var me = this,
                taskSegment,
                taskSegmentIdx,
                eXY;

            if (data.isTaskSegmentDrag) {

                taskSegment    = data.record;
                taskSegmentIdx = data.segmentIndex;

                eXY = e.getXY();

                // The method contains the logic to snap task to exact drop start/end dates
                withSnappedTaskSegmentCoordinates(
                    eXY[0],
                    data.startPointDate,
                    taskSegment,
                    taskSegmentIdx,
                    gantt,
                    // Here at the drop time we need to calculate new start / end dates exactly how it will be adjusted
                    // after taking into account snapping and weekend skipping settings, thus we pass true here
                    // instead of me.getShowExactDropPosition()
                    true,
                    me.getSnapRelativeToEventStartDate(),
                    me.getSkipWeekendsDuringDragDrop(),
                    function(newStartDate, newEndDate, newStartDateX, newEndDateX) {
                        var valid = true;

                        // Processing drop only if segment's start date is to be changed
                        if (taskSegment.getStartDate() - newStartDate) {

                            // Validating drop with user supplied validatorFn
                            if (me.getValidatorFn()) {
                                valid = (false !== (me.getValidatorFn())(taskSegment, newStartDate, newEndDate - newStartDate, e));
                            }

                            valid && processDrop(me, gantt, target, taskSegment, newStartDate, newEndDate, dropSource, data, e);
                        }
                    }
                );
            }
        },

        onTaskContainerOver : function(gantt, dropSource, data, e, canHandleDrop) {
            var me = this;

            if (data.isTaskSegmentDrag) {
                // Upon segment dragging the proxy is constrained to be within initial task row and thus we always
                // should report as if we can handle drop to keep visual compatibility with the previous task
                // drag & drop implementation
                canHandleDrop(me.getDropAllowedCls());

                // This is important here otherwise drag proxy element might be aligned incorrectly
                // by the default proxy movement code
                dropSource.setDragElPos(me.lastValidDragElX, me.lastValidDragElY);
                dropSource.lockDragProxyPosition();
            }
        },

        onTaskContainerOut : function(gantt, dropSource, data, e) {
            var me = this;

            if (data.isTaskSegmentDrag) {
                // This is important here otherwise drag proxy element might be aligned incorrectly
                // by the default proxy movement code
                dropSource.setDragElPos(me.lastValidDragElX, me.lastValidDragElY);
                dropSource.lockDragProxyPosition();
            }
        },

        onAfterTaskDrop : function(gantt, record, e, data, dropSource) {
            var me = this,
                tip;

            // We don't always get drag out event, thus this is the last chance to do cleanup
            if (data.isTaskSegmentDrag) {

                // Returning proxy back to body
                dropSource.getProxy().setForceAttachTo(null);

                // Hiding tooltip
                tip = me.getTooltip();
                tip && tip.hide();

                // Just in case
                dropSource.clearConstraints();

                // Showing original task segment element back, we have hidden in in onTaskRowDragEnter
                Ext.fly(data.ddel).show();

                // Resetting last valid drag coordinates
                me.lastValidDragElX = me.lastValidDragElY = null;

                // Unlocking drag proxy position, it might have been locked at onTaskContainerOut
                dropSource.unlockDragProxyPosition();
            }
        }
    };
});
