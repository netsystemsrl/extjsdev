/**
 * @class Gnt.feature.taskdd.plugin.OutOfRowTaskDragDrop
 *
 * Task reording and moving / copying from other Gantt components drop controller
 */
Ext.define('Gnt.feature.taskdd.plugin.OutOfRowTaskDragDrop', function(thisClass) {

    var INS_INTO   = 'into',
        INS_BEFORE = 'before',
        INS_AFTER  = 'after';

    function calcSnappedDropMarkerCoordinate(targetRow, proposedY) {
        var result = false,
            rowRegion,
            rowInnerRegion,
            rowHeight,
            proposedRegion;

        targetRow = Ext.fly(targetRow);

        rowRegion = targetRow.getRegion();
        rowHeight = rowRegion.getHeight();

        rowInnerRegion = Ext.util.Region.from(rowRegion).adjust(rowHeight * 0.25, 0, -rowHeight * 0.25, 0).round();

        proposedRegion = new Ext.util.Region(proposedY, rowRegion.right, proposedY, rowRegion.left);

        if (proposedRegion.bottom < rowInnerRegion.top) {
            result = {
                coord : rowRegion.top,
                pos   : INS_BEFORE
            };
        }
        else if (proposedRegion.top > rowInnerRegion.bottom) {
            result = {
                coord : rowRegion.bottom,
                pos   : INS_AFTER
            };
        }
        else {
            result = {
                coord : proposedY,
                pos   : INS_INTO
            };
        }

        return result;
    }

    function withSnappedDropMarkerCoordinate(targetRow, proposedY, doFn) {
        var advice;

        doFn = doFn || Ext.returnTrue;

        advice = calcSnappedDropMarkerCoordinate(targetRow, proposedY);

        return doFn(advice.coord, advice.pos);
    }

    function isValidTarget(gantt, targetRow, dropSource, data, proposedY) {
        var result = false,
            draggedTask,
            overTask;

        // Can't drop on itself
        if (!Ext.fly(data.item).contains(targetRow)) {

            draggedTask = data.record;
            overTask    = gantt.getRecord(targetRow);

            // Ancestor node can't be dropped into/before/after it's descendant
            result      = overTask ? !overTask.isAncestor(draggedTask) : false;
        }

        return result;
    }

    function doProcessDrop(gantt, target, insPos, dropSource, data, e, dropActionFn) {

        (new Ext.Promise(function(resolve, reject) {

            var dropHandler = new Gnt.feature.taskdd.AsyncDropHandler(resolve, reject, dropActionFn),
                eventCanceled;

            /**
             * @event before-task-outrow-drop-finalize
             *
             * Cancelable
             *
             * @param {Gnt.view.Gantt} gantt
             * @param {HTMLElement} target
             * @param {String} insPos ("into" / "before" / "after")
             * @param {Gnt.feature.taskdd.DragZone} dropSource
             * @param {Object} data
             * @param {Ext.event.Event} e
             * @param {Gnt.feature.taskdd.AsyncDropHandler} dropHandler
             *
             * @member Gnt.view.Gantt
             */
            if (gantt.hasListeners['before-task-outrow-drop-finalize']) {

                eventCanceled = (false === gantt.fireEvent('before-task-outrow-drop-finalize', gantt, target, insPos, dropSource, data, e, dropHandler));

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
             * @event task-outrow-drop-done
             *
             * @param {Gnt.view.Gantt} gantt
             * @param {HTMLElement} target
             * @param {String} insPos ("into" / "before" / "after")
             * @param {Gnt.feature.taskdd.DragZone} dropSource
             * @param {Object} data
             * @param {Ext.event.Event} e
             * @param {Mixed} result Processing done result
             *
             * @member Gnt.view.Gantt
             */
            gantt.hasListeners['task-outrow-drop-done'] && gantt.fireEvent('task-outrow-drop-done', gantt, target, insPos, dropSource, data, e, result);

        }).then(undefined, function(result) {
            // This is a `catch` call (https://www.sencha.com/forum/showthread.php?333035-Ext-Promise-otherwise-vs-catch)

            /**
             * @event task-outrow-drop-cancel
             *
             * @param {Gnt.view.Gantt} gantt
             * @param {HTMLElement} target
             * @param {String} insPos ("into" / "before" / "after")
             * @param {Gnt.feature.taskdd.DragZone} dropSource
             * @param {Object} data
             * @param {Ext.event.Event} e
             * @param {Mixed} result Processing cancel result
             *
             * @member Gnt.view.Gantt
             */
            gantt.hasListeners['task-outrow-drop-canceled'] && gantt.fireEvent('task-outrow-drop-canceled', gantt, target, insPos, dropSource, data, e, result);

        }));
    }

    function doDefaultDropProcessing(gantt, target, insPos, draggedTask) {
        var overTask,
            wasLeaf;

        overTask = target && gantt.getRecord(target) || gantt.getTaskStore().getRoot();

        // Just in case
        if (overTask) {

            wasLeaf = overTask.isLeaf();

            // If tasks are from a different stores
            if (overTask.getTaskStore() !== draggedTask.getTaskStore()) {
                draggedTask = draggedTask.copy(null);
            }

            if (insPos == INS_INTO) {
                overTask.appendChild(draggedTask);
            }
            else if (insPos == INS_BEFORE) {
                overTask.parentNode.insertBefore(draggedTask, overTask);
            }
            else if (insPos == INS_AFTER) {
                overTask.parentNode.insertChild(
                    overTask.parentNode.indexOf(overTask) + 1,
                    draggedTask
                );
            }

            // Expanding over node if it's become parent
            if (wasLeaf && !overTask.isLeaf()) {
                overTask.expand();
            }
        }
    }

    return {

        extend : 'Ext.plugin.Abstract',
        alias  : 'plugin.gantt_outofrowtaskdragdrop',
        id     : 'outofrowtaskdragdrop',

        requires : [
            'Ext.util.Region',
            'Ext.util.Point',
            'Ext.Promise',
            'Gnt.feature.taskdd.AsyncDropHandler'
        ],

        config : {
            /**
             * @cfg {Gnt.view.Gantt} gantt Gantt view the drop controller works with
             */
            gantt : null,
            /**
             * @cfg {String} dropMarkerCls
             */
            dropMarkerCls : 'gnt-taskdd-dropmarker',
            /**
             * @cfg {Number} expandTimeout Timeout in milliseconds after which collapsed parent task will be expanded
             *                             if mouse stays in such task's row. Set to false to disable auto expansion
             */
            expandTimeout : 2000,
            /**
             * @cfg {Function} validatorFn An empty function by default
             *
             * Provide it to perform custom drop validation
             *
             * @param {Gnt.view.Gantt}    validatorFn.gantt              Gantt view dragged item is from
             * @param {HTMLElement}       validatorFn.target             Drop target element
             * @param {Ext.dd.DropSource} validatorFn.dropSource         Drag & Drop source object
             * @param {Object}            validatorFn.data               Drag & Drop data
             * @param {Number}            validatorFn.proposedY          Drop Y coordinate
             * @param {Function}          validatorFn.defaultValidatorFn Default validator function
             * @return {Boolean}          validatorFn.return
             *
             */
            validatorFn : null
        },

        ganttDetacher  : null,
        dropMarkerEl   : null,
        lastOverTarget : null,
        animating      : false,
        expandProcId   : null,

        destroy : function() {
            var me = this;

            me.destroyDropMarkerEl();
            me.stopScheduledExpanding();
            me.setGantt(null);   // this will detach from gantt events if any are being listened for
            me.callParent();
        },

        /**
         * Enables task out of row drag & drop
         */
        enable : function() {
            var me = this;

            if (me.disabled) {
                me.callParent();
                me.attachToGantt();
            }
        },

        /**
         * Disables task out of row drag & drop
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
                'task-row-drag-out'   : me.onTaskRowDragOut,
                'task-row-drag-over'  : me.onTaskRowDragOver,
                'task-row-drag-drop'  : me.onTaskRowDragDrop,
                'schedule-drag-over'  : me.onTaskContainerOver,
                'schedule-drag-out'   : me.onTaskContainerOut,
                'schedule-drag-drop'  : me.onTaskContainerDrop,
                'aftertaskdrop'       : me.onAfterTaskDrop
            });
        },

        detachFromGantt : function() {
            var me = this;

            me.ganttDetacher && (Ext.destroy(me.ganttDetacher), me.ganttDetacher = null);
        },

        hasDropMarkerEl : function() {
            return !!this.dropMarkerEl;
        },

        getDropMarkerEl : function() {
            var me = this,
                el = me.dropMarkerEl;

            if (!el) {
                el = me.dropMarkerEl = me.getGantt().getItemCanvasEl().createChild({
                    tag : 'div',
                    cls : me.getDropMarkerCls(),
                    style : {
                        display : 'none',
                        width   : me.getGantt().getEl().getWidth() + 'px'
                    }
                });
            }

            return el;
        },

        reAttachDropMarkerEl : function() {
            var me = this,
                el = me.dropMarkerEl;

            if (el) {
                el = me.getGantt().getItemCanvasEl().appendChild(el);
            }
        },

        destroyDropMarkerEl : function() {
            var me = this;

            me.dropMarkerEl && (Ext.destroy(me.dropMarkerEl), me.dropMarkerEl = null, me.animating = false);
        },

        stopScheduledExpanding : function() {
            var me = this;

            if (me.expandProcId) {
                clearTimeout(me.expandProcId);
                me.expandProcId = null;
            }
        },

        onTaskRowDragEnter : function(gantt, target, dropSource, data, e) {
            var me = this,
                overTask;

            // This is for the browsers which do not support pointer-events: none
            // See onContainerOver() for further details
            me.lastOverTarget = target;

            overTask = gantt.getRecord(target);

            if (!overTask.isLeaf() && !overTask.isExpanded() && me.getExpandTimeout()) {
                me.expandProcId = Ext.Function.defer(
                    function() {
                        me.stopScheduledExpanding();
                        overTask.expand(false, function() { me.reAttachDropMarkerEl(); });
                    },
                    me.getExpandTimeout()
                );
            }

        },

        onTaskRowDragOut : function(gantt, target, dropSource, data, e) {
            var me = this;
            // This is for the browsers which do not support pointer-events: none
            // See onContainerOver() for further details
            me.lastOverTarget = null;

            me.stopScheduledExpanding();
        },

        onTaskRowDragOver : function(gantt, target, dropSource, data, e, canHandleDrop) {
            var me = this,
                eXY,
                el,
                validatorFn = me.getValidatorFn() || isValidTarget;

            if (data.isTaskDrag && !Ext.fly(data.item).contains(target)) {

                eXY = e.getXY();
                el = me.getDropMarkerEl();

                withSnappedDropMarkerCoordinate(
                    target,
                    eXY[1],
                    function(snappedY, insPos) {
                        if (!me.animating) {

                            me.animating = true;

                            if (insPos != INS_INTO && !el.isVisible(true)) {
                                el.show();
                            }

                            el.animate({
                                to : {
                                    y : snappedY,
                                    opacity : insPos == INS_INTO ? 0 : 1
                                },
                                listeners : {
                                    afteranimate : function() {
                                        insPos == INS_INTO && el.hide();
                                        me.animating = false;
                                    }
                                }
                            });
                        }

                        if (validatorFn(gantt, target, dropSource, data, eXY[1], isValidTarget)) {
                            canHandleDrop();
                        }
                    }
                );
            }
            else if (data.isTaskDrag && me.hasDropMarkerEl()) {
                me.getDropMarkerEl().hide();
            }
        },

        onTaskRowDragDrop : function(gantt, target, dropSource, data, e) {
            var me = this,
                eXY,
                dragMarkerEl;

            if (data.isTaskDrag && !Ext.fly(data.item).contains(target)) {

                eXY = e.getXY();

                withSnappedDropMarkerCoordinate(
                    target,
                    eXY[1],
                    function(snappedY, insPos) {
                        me.processDrop(gantt, target, insPos, dropSource, data, e, function() {
                            doDefaultDropProcessing(gantt, target, insPos, data.record);
                        });
                    }
                );
            }
        },

        onTaskContainerOver : function(gantt, dropSource, data, e, canHandleDrop) {
            var me = this;

            // We can always handle drop on the container
            if (data.isTaskDrag) {
                canHandleDrop();
            }
        },

        onTaskContainerOut : function(gantt, dropSource, data, e) {
            var me = this;

            me.destroyDropMarkerEl();
        },

        onTaskContainerDrop : function(gantt, dropSource, data, e) {
            var me = this;

            // This is for the browsers which do not support pointer-events: none
            if (data.isTaskDrag && me.lastOverTarget) {
                me.onTaskRowDragDrop(gantt, me.lastOverTarget, dropSource, data, e);
            }
            else if (data.isTaskDrag) {
                me.processDrop(gantt, null, INS_INTO, dropSource, data, e, function() {
                    doDefaultDropProcessing(gantt, null, INS_INTO, data.record);
                });
            }
        },


        onAfterTaskDrop : function(gantt, record, e, data, dropSource) {
            var me = this;

            if (me.hasDropMarkerEl()) {
                // Any drop is a signal to remove marker from the view
                me.destroyDropMarkerEl();
            }
        },

        processDrop : function(gantt, target, insPos, dropSource, data, e, dropActionFn) {
            return doProcessDrop(gantt, target, insPos, dropSource, data, e, dropActionFn);
        }
    };
});
