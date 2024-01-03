/**
 * @class Gnt.feature.taskdd.plugin.DeadlineDragDrop
 *
 * In row deadline marker drag & drop plugin.
 */
Ext.define('Gnt.feature.taskdd.plugin.DeadlineDragDrop', function(thisClass) {

    function withSnappedDeadlineCoordinate(proposedX, task, gantt, showExactDropPosition, snapRelativeToEventStartDate, skipWeekendsDuringDragDrop, doFn) {
        var result = false,
            newDate, newDateX;

        // Calculating new start date using event - initial event element click offset coordinates, i.e.
        // using dragged element left coordinate.
        newDate = gantt.getDateFromCoordinate(proposedX);

        // If gantt is capable to calculate new deadline date (i.e. coordinate is within time axis)
        if (newDate) {

            // If showing exact drop position is requested
            if (showExactDropPosition) {

                // Rounding new deadline date value using timeaxis which will also snap the date rounded to gantt's
                // snap pixel amount
                newDate = gantt.timeAxis.roundDate(newDate, snapRelativeToEventStartDate ? task.getDeadlineDate() : false);

                // If weekends skipping is requested then skipping
                if (skipWeekendsDuringDragDrop) {
                    // WARNING: calling private method, but the same has been done in original/non-refactored
                    //          Gnt.features.TaskDragDrop code, so don't blame me.
                    newDate = task.skipNonWorkingTime(newDate, false);
                }

                // gantt.getCoordinateFromDate() call assumes date is within timeaxis time span
                // so we are to normalize new start, new end dates to be within it
                newDate = Sch.util.Date.max(newDate, gantt.timeAxis.getStart());
                newDate = Sch.util.Date.min(newDate, gantt.timeAxis.getEnd());
            }

            // We need page coordniates here, they are usually passed to DragZone#alignElWithMouse()
            // via DragZone::setDragElPos() later on
            newDateX = gantt.getCoordinateFromDate(newDate, false);

            result = (doFn || Ext.returnTrue)(newDate, newDateX);
        }

        return result;
    }

    function processDrop(me, gantt, target, task, newDate, dropSource, data, e) {
        (new Ext.Promise(function(resolve, reject) {

            var dropHandler = new Gnt.feature.taskdd.AsyncDropHandler(resolve, reject, function() {
                    doDefaultDropProcessing(me, task, newDate);
                }),
                eventCanceled;

            /**
             * @event before-deadline-drop-finalize
             *
             * Cancelable
             *
             * @param {Gnt.view.Gantt} gantt
             * @param {HTMLElement} target
             * @param {Date} newDate
             * @param {Gnt.feature.taskdd.DragZone} dropSource
             * @param {Object} data
             * @param {Ext.event.Event} e
             * @param {Gnt.feature.taskdd.AsyncDropHandler} dropHandler
             *
             * @member Gnt.view.Gantt
             */
            if (gantt.hasListeners['before-deadline-drop-finalize']) {
                eventCanceled = (false === gantt.fireEvent('before-deadline-drop-finalize', gantt, target, newDate, dropSource, data, e, dropHandler));
            }

            if (eventCanceled && !dropHandler.isWaiting() && (!dropHandler.isDone() || !dropHandler.isCanceled())) {
                dropHandler.cancel();
            }
            else if (!dropHandler.isWaiting() && (!dropHandler.isDone() || !dropHandler.isCanceled())) {
                dropHandler.process();
                dropHandler.done();
            }
        }).then(function(result) {

            /**
             * @event deadline-drop-done
             *
             * @param {Gnt.view.Gantt} gantt
             * @param {HTMLElement} target
             * @param {Date} newDate
             * @param {Gnt.feature.taskdd.DragZone} dropSource
             * @param {Object} data
             * @param {Ext.event.Event} e
             * @param {Mixed} result Processing done result
             *
             * @member Gnt.view.Gantt
             */
            gantt.hasListeners['deadline-drop-done'] && gantt.fireEvent('deadline-drop-done', gantt, target, newDate, dropSource, data, e, result);

        }).then(undefined, function(result) {

            /**
             * @event deadline-drop-cancel
             *
             * @param {Gnt.view.Gantt} gantt
             * @param {HTMLElement} target
             * @param {Date} newDate
             * @param {Gnt.feature.taskdd.DragZone} dropSource
             * @param {Object} data
             * @param {Ext.event.Event} e
             * @param {Mixed} result Processing cancel result
             *
             * @member Gnt.view.Gantt
             */
            gantt.hasListeners['deadline-drop-cancel'] && gantt.fireEvent('deadline-drop-cancel', gantt, target, newDate, dropSource, data, e, result);
        }));
    }

    function doDefaultDropProcessing(me, task, newDate) {
        task.setDeadlineDate(newDate);
    }

    return {
        extend : 'Ext.plugin.Abstract',
        alias  : 'plugin.gantt_deadlinedragdrop',
        id     : 'deadlinedragdrop',

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
             * @cfg {Function} validatorFn An empty function by default.
             *
             * Provide to perform custom validation on the item being dragged.
             * This function is called during the drag and drop process and also after the drop is made.
             *
             * @param {Gnt.model.Task} record The record the deadline of which is being dragged
             * @param {Date} date The new deadline date
             * @param {Ext.EventObject} e The event object
             * @return {Boolean} true if the drop position is valid, else false to prevent a drop
             */
            validatorFn : Ext.returnTrue,

            /**
             * @cfg {Boolean} [showExactDropPosition=false] When enabled, the deadline being dragged always "snaps" to the exact date that it will have after being dropped.
             */
            showExactDropPosition : false,

            /**
             * @cfg {Boolean} [snapRelativeToEventStartDate=false] Whether to snap relative to deadline start position or to time axis start date.
             *
             * The option is in effect only if {@link #showExactDropPosition} is set to *true*.
             */
            snapRelativeToEventStartDate : false,

            /**
             * @cfg {Boolean} [skipWeekendsDuringDragDrop=false] When enabled, that deadline being dragged will skip weekend dates.
             */
            skipWeekendsDuringDragDrop : false,

            /**
             * @cfg {String} [dropAllowedCls='sch-gantt-dragproxy'] A CSS class to apply to drag proxy if drop is valid at the point
             */
            dropAllowedCls : 'sch-gantt-dragproxy'
        },

        ganttDetacher : null,

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
         * Enables deadline drag & drop
         */
        enable : function() {
            var me = this;

            if (me.disabled) {
                me.callParent();
                me.attachToGantt();
            }
        },

        /**
         * Disables deadline drag & drop
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

        updateTipContent : function(tip, taskRecord, date, valid) {
            tip.updateContent(null, date || taskRecord.getDeadlineDate(), valid === undefined ? true : valid, taskRecord);
        },

        onTaskRowDragEnter : function(gantt, target, dropSource, data, e) {
            var me = this,
                taskXY,
                elXY,
                offsets,
                tip;

            if (data.isDeadlineDrag) {

                // Deadline dragging is always happens within task row, so attaching proxy to gantt view element
                dropSource.getProxy().setForceAttachTo(gantt.getSecondaryCanvasEl());

                // Hiding initial deadline element (it's now represented by the proxy)
                Ext.fly(data.ddel).hide();

                // Constraining proxy movement within initial task row
                taskXY   = Ext.fly(data.ddel).getXY();
                taskXY   = new Ext.util.Point(taskXY[0], taskXY[1]);
                elXY     = Ext.fly(dropSource.getEl()).getXY();
                elXY     = new Ext.util.Point(elXY[0], elXY[1]);
                offsets  = taskXY.getOffsetsTo(elXY);

                // This is DD magic, believe me it should be like this
                // Internally setInitPosition() takes page coordinates of the dropSource.getEl() (which is gantt view
                // in our case, and then substracts from it deltaX, deltaY, passed as arguments, and stores the result
                // as dragging initial page coordinates.
                dropSource.setInitPosition(-offsets.x, -offsets.y);
                dropSource.setDelta(data.startOffsets.x, data.startOffsets.y);
                dropSource.setYConstraint(0, 0);

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
                task;

            if (data.isDeadlineDrag) {

                // To keep visual compatibility with previous task drag & drop implementation we should always
                // report as if we can handle task drop here
                canHandleDrop(me.getDropAllowedCls());

                task = data.record;

                eXY = e.getXY();

                // The method contains the logic to snap task to exact drop start/end dates
                withSnappedDeadlineCoordinate(
                    // Providing function with dragged element top/left coordniate for it to be able to calculate
                    // proposed new deadline date
                    eXY[0] - data.startOffsets.x,
                    // Other params required for calculation
                    task,
                    gantt,
                    me.getShowExactDropPosition(),
                    me.getSnapRelativeToEventStartDate(),
                    me.getSkipWeekendsDuringDragDrop(),
                    function(newDate, newDateX) {
                        var valid = true,
                            validDragElX,
                            validDragElY;

                        // We add offsets here because the same offsets has been passing to DragZone::setDelta() at
                        // the drag enter event handler. The offsets set via setDelta will be automatically substracted
                        // from the coordinates we pass here, thus we adding them back. In other words
                        // DragZone::setDragElPos() expects here the coordinates of the mouse pointer, not the coordinates
                        // of dragged element
                        validDragElX = newDateX + data.startOffsets.x;
                        validDragElY = eXY[1] + data.startOffsets.y;

                        // We do not rely on default proxy movement here and update drag element position manually
                        // due to the fact that node over notification might come via emulation layer in
                        // Gnt.feature.taskdd.DropZone activated upon drop zone element scrolling.
                        dropSource.setDragElPos(validDragElX, validDragElY);

                        // Validating drop with user supplied validatorFn, here just to update the tip
                        if (me.getValidatorFn()) {
                            valid = (false !== (me.getValidatorFn())(task, newDate, e));
                        }

                        // Aligning tooltip
                        tip = me.getTooltip();
                        tip && me.updateTipContent(tip, task, newDate, valid);
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

            if (data.isDeadlineDrag) {
                task = data.record;

                eXY = e.getXY();

                // The method contains the logic to snap task to exact drop start/end dates
                withSnappedDeadlineCoordinate(
                    // Providing function with dragged element left coordniate for it to be able to calculate
                    // proposed new deadline date
                    eXY[0] - data.startOffsets.x,
                    // Other params required for calculation
                    task,
                    gantt,
                    me.getShowExactDropPosition(),
                    me.getSnapRelativeToEventStartDate(),
                    me.getSkipWeekendsDuringDragDrop(),
                    function(newDate, newDateX) {
                        var valid = true;

                        // Processing drop only if task's deadline date is to be changed
                        if (task.getDeadlineDate() - newDate) {

                            // Validating drop with user supplied validatorFn
                            if (me.getValidatorFn()) {
                                valid = (false !== (me.getValidatorFn())(task, newDate, e));
                            }

                            valid && processDrop(me, gantt, target, task, newDate, dropSource, data, e);
                        }
                    }
                );
            }
        },

        onTaskContainerOver : function(gantt, dropSource, data, e, canHandleDrop) {
            var me = this;

            if (data.isDeadlineDrag) {
                // Deadline dragging is always constrained to be within initial task row, so we should report
                // as if we can handle drop to keep compatibility with the previous task drag & drop implementation
                canHandleDrop(me.getDropAllowedCls());
            }
        },

        onAfterTaskDrop : function(gantt, record, e, data, dropSource) {
            var me = this,
                tip;

            // We don't always get drag out event, thus this is the last chance to do cleanup
            if (data.isDeadlineDrag) {

                // Returning proxy back to body
                dropSource.getProxy().setForceAttachTo(null);

                tip = me.getTooltip();
                tip && tip.hide();

                Ext.fly(data.ddel).show();
            }
        }
    };
});
