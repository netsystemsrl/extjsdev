/**

@class Gnt.view.Gantt
@extends Sch.view.TimelineGridView

A view of the gantt panel. Use the {@link Gnt.panel.Gantt#getSchedulingView} method to get its instance from gantt panel.

*/
Ext.define("Gnt.view.Gantt", {
    extend                   : "Sch.view.TimelineGridView",

    alias                    : ['widget.ganttview'],

    requires                 : [
        'Sch.patches.DragDropManager',
        'Sch.patches.NavigationModel',
        'Sch.util.Date',
        'Sch.util.ScrollManager',
        'Gnt.patches.NavigationModel_6_2_0',
        'Gnt.model.Task',
        'Gnt.template.Task',
        'Gnt.template.ParentTask',
        'Gnt.template.Milestone',
        'Gnt.template.RollupTask',
        'Gnt.template.Deadline',
        'Gnt.tooltip.EventTip',
        'Gnt.feature.taskdd.DragZone',
        'Gnt.feature.ProgressBarResize',
        'Gnt.feature.TaskResize',
        'Sch.view.Horizontal',
        'Gnt.feature.LabelEditor',
        'Gnt.feature.DragCreator'
    ],

    mixins                   : [
        'Sch.mixin.GridViewCanvas',
        'Sch.mixin.FilterableTreeView'
    ],

    _cmpCls                  : 'sch-ganttview',

    scheduledEventName       : 'task',

    trackOver                : false,
    toggleOnDblClick         : false,

    // private
    eventSelector            : '.sch-gantt-item',

    eventWrapSelector        : '.sch-event-wrap',

    barMargin                : 4,

    progressBarResizer       : null,
    taskResizer              : null,
    taskDragDrop             : null,
    dragCreator              : null,

    resizeConfig             : null,
    createConfig             : null,
    dragDropConfig           : null,
    progressBarResizeConfig  : null,

    externalGetRowClass      : null,
    baselineVisible          : false,

    /**
     * @cfg {Number} outsideLabelsGatherWidth Defines width of special zone outside (before and after) of visible area within which tasks will be still rendered into DOM.
     * This is used to render partially visible labels of invisible tasks bordering with visible area.
     *
     * Increase this value to see long labels, set to 0 if you want to hide labels of invisible tasks completely.
     */
    outsideLabelsGatherWidth : 200,

    // Task click-events --------------------------
    /**
     * @event taskclick
     * Fires when a task is clicked
     *
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task record
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event taskdblclick
     * Fires when a task is double clicked
     *
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task record
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event taskcontextmenu
     * Fires when contextmenu is activated on a task
     *
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task record
     * @param {Ext.EventObject} e The event object
     */

    // Resizing events start --------------------------
    /**
     * @event beforetaskresize
     * @preventable
     * Fires before a resize starts, return false to stop the execution
     *
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task about to be resized
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event taskresizestart
     * Fires when resize starts
     *
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task about to be resized
     */

    /**
     * @event partialtaskresize
     * Fires during a resize operation and provides information about the current start and end of the resized event
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     *
     * @param {Gnt.model.Task} taskRecord The task being resized
     * @param {Date} startDate The start date of the task
     * @param {Date} endDate The end date of the task
     * @param {Ext.Element} element The element being resized
     */

    /**
     * @event aftertaskresize
     * Fires after a succesful resize operation
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task that has been resized
     */

    // Task progress bar resizing events start --------------------------
    /**
     * @event beforeprogressbarresize
     * @preventable
     * Fires before a progress bar resize starts, return false to stop the execution
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The record about to be have its progress bar resized
     */

    /**
     * @event progressbarresizestart
     * Fires when a progress bar resize starts
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The record about to be have its progress bar resized
     */

    /**
     * @event afterprogressbarresize
     * Fires after a succesful progress bar resize operation
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord record The updated record
     */

    // Dnd events start --------------------------
    /**
     * @event beforetaskresizefinalize
     * @preventable
     * Fires before a succesful resize operation is finalized. Return false to finalize the resize at a later time.
     * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
     * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
     * @param {Mixed} view The gantt view instance
     * @param {Object} resizeContext An object containing 'record', 'start', 'end', 'finalize' properties.
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event beforedragcreatefinalize
     * @preventable
     * Fires before a succesful create operation is finalized. Return false to finalize creating at a later time.
     * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
     * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
     * @param {Mixed} view The gantt view instance
     * @param {Object} createContext An object containing 'record', 'start', 'end', 'finalize' properties.
     * @param {Ext.EventObject} e The event object
     */

    // Label editors events --------------------------
    /**
     * @event labeledit_beforestartedit
     * Fires before editing is started for a field
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Gnt.model.Task} taskRecord The task record
     */

    /**
     * @event labeledit_beforecomplete
     * Fires after a change has been made to a label field, but before the change is reflected in the underlying field.
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Mixed} value The current field value
     * @param {Mixed} startValue The original field value
     * @param {Gnt.model.Task} taskRecord The affected record
     */

    /**
     * @event labeledit_complete
     * Fires after editing is complete and any changed value has been written to the underlying field.
     * @param {Gnt.view.Gantt} gantt The gantt view instance
     * @param {Mixed} value The current field value
     * @param {Mixed} startValue The original field value
     * @param {Gnt.model.Task} taskRecord The affected record
     */

    // Drag create events start --------------------------
    /**
     * @event beforedragcreate
     * @preventable
     * Fires before a drag create operation starts, return false to prevent the operation
     * @param {Gnt.view.Gantt} gantt The gantt view
     * @param {Gnt.model.Task} task The task record being updated
     * @param {Date} date The date of the drag start point
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event dragcreatestart
     * Fires before a drag starts, return false to stop the operation
     * @param {Gnt.view.Gantt} view The gantt view
     */

    /**
     * @event dragcreateend
     * Fires after a successful drag-create operation
     * @param {Gnt.view.Gantt} view The gantt view
     * @param {Gnt.model.Task} task The updated task record
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event afterdragcreate
     * Always fires after a drag-create operation
     * @param {Gnt.view.Gantt} view The gantt view
     */
    // Drag create events end --------------------------


    /**
     * @event scheduleclick
     * Fires after a click on the schedule area
     * @param {Gnt.view.Gantt} ganttView The gantt view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event scheduledblclick
     * Fires after a doubleclick on the schedule area
     * @param {Gnt.view.Gantt} ganttView The gantt view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Ext.EventObject} e The event object
     */

    /**
     * @event schedulecontextmenu
     * Fires after a context menu click on the schedule area
     * @param {Gnt.view.Gantt} ganttView The gantt view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Ext.EventObject} e The event object
     */

    constructor : function (config) {
        config = config || {};

        if (config) {
            this.externalGetRowClass = config.getRowClass;

            delete config.getRowClass;
        }

        this.callParent(arguments);

        this.on({
            itemupdate   : this.onRowUpdate,
            scope        : this
        });

        this.mon(this.taskStore, {
            update       : this.onTaskStoreUpdate,
            scope        : this
        });

        this.initTreeFiltering();
    },

    setupTooltip : function () {
        var me = this,
            target = me.getEl();

        me.callParent(arguments);

        me.tip.destroy();

        me.tip = new Gnt.tooltip.EventTip(Ext.apply({
            view             : me,
            delegate         : me.eventSelector,
            target           : target,
            dismissDelay     : 0,
            constrainTo      : me.grid.getEl(), // Stay within target region
            rtl              : me.rtl
        }, me.tipCfg));
    },

    onBeforeIndentationChange   : function () {
        var position = this.getNavigationModel().getPosition();
        if (position && position.record) {
            this._lastNavigatedRecord = position.record;
        }
    },

    onIndentationChange    : function () {
        this._lastNavigatedRecord && this.getNavigationModel().setPosition(this._lastNavigatedRecord);
        delete this._lastNavigatedRecord;
    },

    onRender : function () {
        // 213_indent
        // save navigation position during indenting
        this.mon(this.getTaskStore(), {
            beforeindentationchange : this.onBeforeIndentationChange,
            indentationchange       : this.onIndentationChange,
            scope                   : this
        });

        this.configureLabels();
        this.setupGanttEvents();
        this.setupTemplates();
        this.callParent(arguments);
    },

    /**
     * Returns the associated dependency store
     * @return {Gnt.data.TaskStore}
     */
    getDependencyStore : function () {
        return this.dependencyStore;
    },

    configureFeatures : function () {
        if (this.enableProgressBarResize !== false) {
            this.progressBarResizer = Ext.create("Gnt.feature.ProgressBarResize", Ext.apply({
                ganttView: this
            }, this.progressBarResizeConfig || {}));

            this.on({
                beforeprogressbarresize : this.onBeforeTaskProgressBarResize,
                progressbarresizestart  : this.onTaskProgressBarResizeStart,
                afterprogressbarresize  : this.onTaskProgressBarResizeEnd,
                scope                   : this
            });
        }

        if (this.taskResizeHandles !== 'none') {

            this.taskResizer = Ext.create("Gnt.feature.TaskResize", Ext.apply({
                ganttView           : this,
                validatorFn         : this.resizeValidatorFn || Ext.emptyFn,
                validatorFnScope    : this
            }, this.resizeConfig || {}));

            this.on({
                beforedragcreate       : this.onBeforeDragCreate,
                beforetaskresize       : this.onBeforeTaskResize,
                taskresizestart        : this.onTaskResizeStart,
                aftertaskresize        : this.onTaskResizeEnd,
                progressbarresizestart : this.onTaskResizeStart,
                afterprogressbarresize : this.onTaskResizeEnd,
                scope                  : this
            });
        }

        if (this.enableTaskDragDrop) {
            this.taskDragDrop = Ext.create(this.dragDropConfig && this.dragDropConfig.xclass || "Gnt.feature.taskdd.DragZone", this.getEl(), Ext.apply({
                gantt                        : this,
                taskSelector                 : this.eventSelector,
                deadlineSelector             : '.gnt-deadline-indicator',
                validatorFn                  : this.dndValidatorFn || Ext.emptyFn,
                validatorFnScope             : this,
                skipWeekendsDuringDragDrop   : this.taskStore.skipWeekendsDuringDragDrop,
                snapRelativeToEventStartDate : this.snapRelativeToEventStartDate
            }, this.dragDropConfig));

            this.on({
                beforetaskdrag  : this.onBeforeTaskDrag,
                taskdragstart   : this.onDragDropStart,
                aftertaskdrop   : this.onDragDropEnd,
                scope: this
            });
        }

        if (this.enableDragCreation) {
            this.dragCreator = Ext.create("Gnt.feature.DragCreator", Ext.apply({
                ganttView           : this,
                validatorFn         : this.createValidatorFn || Ext.emptyFn,
                validatorFnScope    : this
            }, this.createConfig));
        }
    },

    /**
     * Returns the template for the task. Override this template method to supply your own custom UI template for a certain type of task.
     *
     * @template
     * @protected
     * @param {Gnt.model.Task} task The task to get template for.
     * @param {Boolean} isBaseline True to return the template for a baseline version of the task.
     * @return {Gnt.template.Template} Template for the task.
     */
    getTemplateForTask : function (task, isBaseline) {
        if (task.isMilestone(isBaseline)) {
            return this.milestoneTemplate;
        }
        if (task.isLeaf()) {
            return this.eventTemplate;        // return baseline templates
        }
        return this.parentEventTemplate;
    },

    refreshNotReadOnlyChildNodes : function (record) {
        record.cascadeBy({
            // if a child is explicitly marked as readonly then parent readonly change
            // doesn't affect the child state so we don't cascade it or its children
            before : function (child) {
                return child == record || !child.getReadOnly();
            },
            after : function (child) {
                if (child !== record) {
                    this.refreshNode(child);
                }
            },
            scope : this
        });
    },

    setShowRollupTasks : function (show) {

        this.showRollupTasks = show;

        var parentNodes = {};

        this.taskStore.getRootNode().cascadeBy(function (node) {

            if (node.getRollup()) {
                var parentNode = node.parentNode;

                parentNodes[parentNode.internalId] = parentNode;
            }
        });

        for (var id in parentNodes) {
            var index = this.store.indexOf(parentNodes[id]);

            if (index >= 0) {
                this.refreshNode(index);
            }
        }
    },

    getRollupTasks : function(parentTask) {
        return Ext.Array.filter(parentTask.childNodes, function (task) {
            return task.getRollup();
        });
    },


    //Todo combine generic parts this function with columnRenderer
    getRollupRenderData : function (parentModel) {

        var rollupData  = [];
        var ta          = this.timeAxis,
            viewStart   = ta.getStart(),
            viewEnd     = ta.getEnd(),
            rollupTasks = this.getRollupTasks(parentModel);

        for (var i = 0; i < rollupTasks.length; i++) {

            var taskModel = rollupTasks[i];
            var taskStart = taskModel.getStartDate();
            var taskEnd   = taskModel.getEndDate() || taskStart && Sch.util.Date.add(taskStart, taskModel.getDurationUnit(), 1);

            if (taskStart && taskEnd) {

                if (Sch.util.Date.intersectSpans(taskStart, taskEnd, viewStart, viewEnd)) {

                   var data = {}, isMileStone = taskModel.isMilestone(), rollupLabel;

                   data.isRollup = true;
                   data.id = Ext.id();
                   data.attr = 'rolluptaskid="' + taskModel.getId() + '"';

                    var endsOutsideView  = taskEnd > viewEnd,
                        startsInsideView = Sch.util.Date.betweenLesser(taskStart, viewStart, viewEnd),
                        taskStartX       = this.getCoordinateFromDate(startsInsideView ? taskStart : viewStart),
                        taskEndX         = this.getCoordinateFromDate(endsOutsideView ? viewEnd : taskEnd),
                        itemWidth        = isMileStone ? 0 : taskEndX - taskStartX;

                    data.offset = (isMileStone ? (taskEndX || taskStartX) : taskStartX);
                    data.tpl    = isMileStone ? this.milestoneTemplate : this.eventTemplate;
                    data.cls    = taskModel.getCls();
                    data.ctcls  = '';
                    data.record = taskModel;

                    if (rollupLabel = this.rollupLabelField) {
                        var value = taskModel.data[rollupLabel.dataIndex || rollupLabel];

                        data.rollupLabel = rollupLabel.renderer ? rollupLabel.renderer.call(rollupLabel.scope || this, value, taskModel) : Ext.htmlEncode(value);
                    }

                    if (isMileStone) {
                        data.side = Math.round(0.5 * this.getRowHeight());
                        data.ctcls += ' sch-gantt-milestone';
                    } else {
                        data.width = Math.max(1, itemWidth);

                        if (endsOutsideView) {
                            data.ctcls += ' sch-event-endsoutside ';
                        }

                        if (!startsInsideView) {
                            data.ctcls += ' sch-event-startsoutside ';
                        }

                        data.ctcls += ' sch-gantt-task';
                    }

                    if (taskModel.isReadOnly()) {
                        data.ctcls += ' sch-gantt-task-readonly';
                    }

                    if (taskModel.isProject) {
                        data.ctcls += ' sch-gantt-project-task';
                    }

                    data.cls += ' sch-rollup-task';

                    rollupData.push(data);
                }
            }
        }

        return rollupData;
    },

    getLabelRenderData : function (taskModel) {
        var left       = this.leftLabelField,
            right      = this.rightLabelField,
            top        = this.topLabelField,
            bottom     = this.bottomLabelField,
            value,
            renderData = {
                labelRendered: true
            };

        if (left) {
            value = left.dataIndex ? taskModel.data[ left.dataIndex ] : undefined;

            renderData.leftLabel = left.renderer ? left.renderer.call(left.scope || this, value, taskModel) : Ext.htmlEncode(value);
        }

        if (right) {
            value = right.dataIndex ? taskModel.data[ right.dataIndex ] : undefined;

            renderData.rightLabel = right.renderer ? right.renderer.call(right.scope || this, value, taskModel) : Ext.htmlEncode(value);
        }

        if (top) {
            value = top.dataIndex ? taskModel.data[ top.dataIndex ] : undefined;

            renderData.topLabel = top.renderer ? top.renderer.call(top.scope || this, value, taskModel) : Ext.htmlEncode(value);
        }

        if (bottom) {
            value = bottom.dataIndex ? taskModel.data[ bottom.dataIndex ] : undefined;

            renderData.bottomLabel = bottom.renderer ? bottom.renderer.call(bottom.scope || this, value, taskModel) : Ext.htmlEncode(value);
        }

        return renderData;
    },

    getSegmentsRenderData : function (taskModel, percentDone, taskStartX) {
        var D                   = Sch.util.Date,
            parts               = taskModel.getSegments(),
            viewStart           = this.timeAxis.getStart(),
            viewEnd             = this.timeAxis.getEnd(),
            segments            = [],
            percentDoneDuration = 0,
            i, l, part, partStartX, partEndX, partStartDate, partEndDate,
            segmentCls, progressBarWidth, segmentWidth, percentDoneAtDate, percentDoneX;

        // since task is fragmented we cannot use just: (taskEnd - taskStart) * percentDone
        // we have to get sum of all parts instead
        for (i = 0, l = parts.length; i < l; i++) {
            part = parts[i];
            percentDoneDuration += (part.getEndDate() - part.getStartDate()) * percentDone;
        }

        for (i = 0, l = parts.length; i < l; i++) {
            part            = parts[i];
            segmentCls      = part.getCls() || '';
            partEndDate     = part.getEndDate() || taskModel.getStartDate();
            partStartDate   = part.getStartDate();

            // if this segment starts in the visible area
            if (D.betweenLesser(partStartDate, viewStart, viewEnd)) {
                partStartX = this.getCoordinateFromDate(partStartDate);

                // if it ends in visible area as well
                if (D.betweenLesser(partEndDate, viewStart, viewEnd)) {
                    partEndX = this.getCoordinateFromDate(partEndDate);
                } else {
                    partEndX = this.getCoordinateFromDate(viewEnd);
                }

                // if its start is invisible
            } else {
                partStartX = this.getCoordinateFromDate(viewStart);

                // if end is visible
                if (D.betweenLesser(partEndDate, viewStart, viewEnd)) {
                    partEndX = this.getCoordinateFromDate(partEndDate);

                    // if both ends are invisible lets move them outside of visible area
                } else if (partStartDate >= viewEnd && partEndDate > viewEnd) {
                    partStartX = partEndX = this.getCoordinateFromDate(viewEnd) + 100;
                } else if (partStartDate < viewStart && partEndDate < viewStart) {
                    partStartX = partEndX = this.getCoordinateFromDate(viewStart) - 100;

                    // if segment start before view start and ends after view end
                } else {
                    partEndX = this.getCoordinateFromDate(viewEnd);
                }
            }

            segmentWidth = partEndX - partStartX;

            if (!percentDoneAtDate) {
                percentDoneDuration -= (partEndDate - partStartDate);

                if (percentDoneDuration <= 0) {
                    percentDoneAtDate = D.add(partEndDate, D.MILLI, percentDoneDuration);

                    // mark part that has progress bar slider
                    segmentCls += ' sch-segment-in-progress';

                    percentDoneX = this.getCoordinateFromDate(percentDoneAtDate);

                    // get progress bar size for this part
                    progressBarWidth = Math.min(Math.abs(percentDoneX - partStartX), segmentWidth);

                    // all parts before the time span that has "percentDoneAtDate" have 100% percent done
                } else {
                    progressBarWidth = part.width;
                }
                // all parts after the time span that has "percentDoneAtDate" have zero percent done
            } else {
                progressBarWidth = 0;
            }

            segments.push(Ext.applyIf({
                left                : partStartX - taskStartX,
                width               : segmentWidth,
                cls                 : segmentCls,
                percentDone         : percentDone * 100,
                SegmentIndex        : i,
                progressBarWidth    : progressBarWidth
            }, part.data));
        }

        segments[0].cls += ' sch-gantt-task-segment-first';
        segments[segments.length - 1].cls += ' sch-gantt-task-segment-last';

        return {
            percentDoneAtDate: percentDoneAtDate,
            segments: segments
        };
    },

    buildTaskCls : function (taskModel, tplData, startsInsideView, endsOutsideView) {
        var dataCls = '', ctcls = '';

        if (taskModel.isMilestone()) {
            tplData.side = Math.round((this.enableBaseline ? 0.4 : 0.5) * this.getRowHeight());
            ctcls += " sch-gantt-milestone";
        } else {
            var minWidthForShowingArrows = 8;

            if (tplData.width < minWidthForShowingArrows) {
                ctcls += 'sch-gantt-parent-noarrows';
            }

            if (endsOutsideView) {
                ctcls += ' sch-event-endsoutside ';
            }

            if (!startsInsideView) {
                ctcls += ' sch-event-startsoutside ';
            }

            if (taskModel.isLeaf()) {
                var resizableMode = taskModel.getResizable();

                ctcls += " sch-gantt-task";

                if (typeof resizableMode === 'boolean' || typeof resizableMode === 'string') {
                    dataCls += ' sch-event-resizable-' + resizableMode;
                }
            } else {
                ctcls += " sch-gantt-parent-task";
            }
        }

        if (taskModel.isReadOnly()) {
            ctcls += " sch-gantt-task-readonly";
        }

        if (taskModel.isProject) {
            ctcls += " sch-gantt-project-task";
        }

        if (taskModel.dirty)                    dataCls += ' sch-dirty ';
        if (taskModel.isDraggable() === false)  dataCls += ' sch-event-fixed ';

        dataCls += taskModel.isSegmented() ? ' sch-event-segmented ' : ' sch-event-notsegmented ';

        tplData.cls += ' ' + dataCls;
        tplData.ctcls += ' ' + ctcls;
    },

    // private
    columnRenderer    : function (value, meta, taskModel) {

        var taskStart   = taskModel.getStartDate(),
            timeAxis    = this.timeAxis,
            D           = Sch.util.Date,
            tplData     = {},
            cellResult  = '',
            viewStart   = timeAxis.getStart(),
            viewEnd     = timeAxis.getEnd(),
            isMilestone = taskModel.isMilestone(),
            userData, startsInsideView, endsOutsideView;

        if (taskStart) {
            var taskEnd         = taskModel.getEndDate() || D.add(taskStart, taskModel.getDurationUnit() || D.DAY, 1),
                tick            = timeAxis.getAt(0),
                // milliseconds per pixel ratio
                msPerPx         = (tick.getEndDate() - tick.getStartDate()) / this.timeAxisViewModel.getTickWidth(),
                timeDelta       = msPerPx * this.outsideLabelsGatherWidth,
                // if task belongs to the visible time span
                doRender        = D.intersectSpans(taskStart, taskEnd, viewStart, viewEnd),
                renderBuffer    = this.outsideLabelsGatherWidth > 0,
                // if task belongs to the buffered zone before/after visible time span
                renderAfter     = renderBuffer && D.intersectSpans(taskStart, taskEnd, viewEnd, new Date(viewEnd.getTime() + timeDelta)),
                renderBefore    = renderBuffer && D.intersectSpans(taskStart, taskEnd, new Date(viewStart.getTime() - timeDelta), viewStart);

            // if task belongs to the visible time span
            // or belongs to the buffered zone before/after visible time span
            if (doRender || renderAfter || renderBefore) {
                endsOutsideView     = taskEnd > viewEnd;
                startsInsideView    = D.betweenLesser(taskStart, viewStart, viewEnd);

                var taskStartX, taskEndX, itemWidth;

                // regular case ..task intersects visible time span
                if (doRender) {
                    taskStartX  = this.getCoordinateFromDate(startsInsideView ? taskStart : viewStart);
                    taskEndX    = this.getCoordinateFromDate(endsOutsideView ? viewEnd : taskEnd);
                    itemWidth   = isMilestone ? 0 : taskEndX - taskStartX;
                // task belongs to the buffered zone before/after visible time span
                } else {
                    startsInsideView = true;
                    itemWidth = 0;

                    if (renderAfter) {
                        taskStartX  = Math.floor(this.getCoordinateFromDate(viewEnd) + (taskStart - viewEnd) / msPerPx);
                    } else {
                        taskStartX  = Math.floor(this.getCoordinateFromDate(viewStart) - (viewStart - taskEnd) / msPerPx);
                    }
                }

                // if task is partially hidden progress bar should be rendered accordingly
                // eg. task is halfway done and rendered only half of the task
                // progress bar in this case should be hidden (width is 0)
                var percentDone = Math.min(taskModel.getPercentDone() || 0, 100) / 100,
                    percentDoneAtDate,
                    percentDoneX,
                    progressBarWidth,
                    segments;

                // if task is split
                if (taskModel.isSegmented()) {
                    var segmentsRenderData = this.getSegmentsRenderData(taskModel, percentDone, taskStartX);
                    percentDoneAtDate = segmentsRenderData.percentDoneAtDate;
                    segments = segmentsRenderData.segments;
                    // if task is NOT split
                } else {
                    // picks date between task start and end according to percentDone value
                    percentDoneAtDate = new Date((taskEnd - taskStart) * percentDone + taskStart.getTime());

                    if (percentDoneAtDate < viewStart) {
                        percentDoneAtDate = viewStart;
                    } else if (percentDoneAtDate > viewEnd) {
                        percentDoneAtDate = viewEnd;
                    }

                }

                percentDoneX = this.getCoordinateFromDate(percentDoneAtDate);

                // what if rtl?
                // in case task is rendered outside of view and has width 0, we should also set progress bar
                // width to 0 or progress bar will be visible as a 1px width vertical lines
                progressBarWidth = Math.min(Math.abs(percentDoneX - taskStartX), itemWidth);

                // Data provided to the Task XTemplate is composed in these steps
                //
                // 1. Get the default data from the Task Model
                // 2. Apply internal rendering properties: id, sizing, position etc
                // 3. Allow user to add extra properties at runtime using the eventRenderer template method
                tplData = {
                    // Core properties
                    id               : taskModel.internalId + '-x-x',
                    offset           : isMilestone ? (taskEndX || taskStartX) - this.getXOffset(taskModel) : taskStartX,
                    width            : Math.max(1, itemWidth),
                    ctcls            : '',
                    cls              : taskModel.getCls() || '',
                    print            : this._print,
                    record           : taskModel,
                    percentDone      : percentDone * 100,
                    progressBarWidth : Math.max(0, progressBarWidth - 2*this.eventBorderWidth),
                    segments         : segments
                };

                // Labels
                Ext.apply(tplData, this.getLabelRenderData(taskModel));

                // Get data from user "renderer"
                userData = this.eventRenderer && this.eventRenderer.call(this.eventRendererScope || this, taskModel, tplData, taskModel.store, meta) || {};

                if (userData) {
                    Ext.apply(tplData, userData);
                }

                this.buildTaskCls(taskModel, tplData, startsInsideView, endsOutsideView);

                if (this.showRollupTasks) {
                    var rollupData = this.getRollupRenderData(taskModel);

                    if (rollupData.length > 0) {
                        cellResult += this.rollupTemplate.apply(rollupData);
                    }
                }

                cellResult += this.getTemplateForTask(taskModel).apply(tplData);
            }
        }

        // if baselines enabled
        if (this.enableBaseline) {
            // userData might be not initialized if we do not render the task bar (unscheduled or out of visible span)
            if (!userData) {
                userData    = this.eventRenderer && this.eventRenderer.call(this, taskModel, tplData, taskModel.store, meta) || {};
            }

            // render baseline bar
            cellResult += this.baselineRenderer(taskModel, userData, viewStart, viewEnd, tplData.labelRendered);
        }

        var deadline = taskModel.getDeadlineDate();

        if (deadline && timeAxis.dateInAxis(deadline)) {
            cellResult += this.deadlineRenderer(taskModel, deadline);
        }

        return cellResult;
    },

    deadlineRenderer : function (taskModel, deadline) {
        return this.deadlineTemplate.apply({
            dir     : this.rtl ? 'right' : 'left',
            offset  : this.getCoordinateFromDate(deadline),
            date    : this.getFormattedEndDate(deadline),
            cls     : (new Date() > deadline && !taskModel.isCompleted()) ? 'gnt-deadline-indicator-late' : ''
        });
    },

    baselineRenderer : function (taskModel, userData, viewStart, viewEnd, labelsRenderDataPrepared) {
        var D                   = Sch.util.Date,
            taskBaselineStart   = taskModel.getBaselineStartDate(),
            taskBaselineEnd     = taskModel.getBaselineEndDate();

        if (taskBaselineStart && taskBaselineEnd && D.intersectSpans(taskBaselineStart, taskBaselineEnd, viewStart, viewEnd)) {
            var endsOutsideView             = taskBaselineEnd > viewEnd;
            var startsInsideView            = D.betweenLesser(taskBaselineStart, viewStart, viewEnd);

            userData = userData || {};

            var isBaselineMilestone     = taskModel.isBaselineMilestone(),
                baseStartX              = this.getCoordinateFromDate(startsInsideView ? taskBaselineStart : viewStart),
                baseEndX                = this.getCoordinateFromDate(endsOutsideView ? viewEnd : taskBaselineEnd),
                baseWidth               = Math.max(1, isBaselineMilestone ? 0 : baseEndX - baseStartX),
                baseTpl                 = this.getTemplateForTask(taskModel, true),
                data                    = {
                    progressBarStyle : userData.baseProgressBarStyle || '',
                    // Putting 'base-' as suffix ('-base') conflicts with task element id creating rules where
                    // task element id is [commonprefix]-(task.internalId)-(resource.internalId)-(partnum)
                    id               : 'base-' + taskModel.internalId,
                    // TODO: this should use same rendering as the regular task
                    progressBarWidth : Math.min(100, taskModel.getBaselinePercentDone()) * baseWidth / 100,
                    percentDone      : taskModel.getBaselinePercentDone(),
                    offset           : isBaselineMilestone ? (baseEndX || baseStartX) - this.getXOffset(taskModel, true) : baseStartX,
                    print            : this._print,
                    width            : Math.max(1, baseWidth),
                    style            : userData.baseStyle || '',
                    baseline         : true
                };

            var ctcls                   = '';

            if (isBaselineMilestone) {
                data.side               = Math.round(0.40 * this.getRowHeight());
                ctcls                   = "sch-gantt-milestone-baseline sch-gantt-baseline-item";
            } else if (taskModel.isLeaf()) {
                ctcls                   = "sch-gantt-task-baseline sch-gantt-baseline-item";
            } else {
                ctcls                   = "sch-gantt-parenttask-baseline sch-gantt-baseline-item";
            }

            if (endsOutsideView) {
                ctcls                   += ' sch-event-endsoutside ';
            }

            if (!startsInsideView) {
                ctcls                   += ' sch-event-startsoutside ';
            }

            // HACK, a bit inconsistent. 'basecls' should probably end up on the task el instead of the wrapper.
            data.ctcls                  = ctcls + ' ' + (userData.basecls || '');

            if (!labelsRenderDataPrepared) {
                Ext.apply(data, this.getLabelRenderData(taskModel));
            }

            return baseTpl.apply(data);
        }

        return '';
    },

    getTemplateConfig : function () {
        return {
            leftLabel                   : this.leftLabelField,
            rightLabel                  : this.rightLabelField,
            topLabel                    : this.topLabelField,
            bottomLabel                 : this.bottomLabelField,
            rollupLabel                 : this.rollupLabelField,
            prefix                      : this.eventPrefix,
            taskResizeHandles           : this.taskResizeHandles,
            enableDependencyDragDrop    : this.enableDependencyDragDrop !== false,
            allowParentTaskDependencies : this.allowParentTaskDependencies !== false,
            enableProgressBarResize     : this.enableProgressBarResize,
            rtl                         : this.rtl
        };
    },

    setupTemplate : function (template, defaultClass, defaultConfig) {
        // if no template provided or it's not a template class instance
        if (!template || !template.isTemplate) {
            template   = Ext.create(Ext.apply({ xclass : defaultClass }, template, defaultConfig));
        }

        return template;
    },

    setupTemplates : function () {
        var tplCfg = this.getTemplateConfig();

        var config = Ext.apply({}, this.taskBodyTemplate && { innerTpl : this.taskBodyTemplate }, tplCfg);
        this.eventTemplate = this.setupTemplate(this.eventTemplate, "Gnt.template.Task", config);

        config = Ext.apply({}, this.parentTaskBodyTemplate && { innerTpl : this.parentTaskBodyTemplate }, tplCfg);
        this.parentEventTemplate = this.setupTemplate(this.parentEventTemplate, "Gnt.template.ParentTask", config);

        config = Ext.apply({}, this.milestoneBodyTemplate && { innerTpl : this.milestoneBodyTemplate }, tplCfg);
        this.milestoneTemplate = this.setupTemplate(this.milestoneTemplate, "Gnt.template.Milestone", config);

        this.rollupTemplate   = this.setupTemplate(this.rollupTemplate, "Gnt.template.RollupTask");
        this.deadlineTemplate = this.setupTemplate(this.deadlineTemplate, "Gnt.template.Deadline");
    },

    /**
     * Returns the associated task store
     * @return {Gnt.data.TaskStore}
     */
    getTaskStore     : function () {
        return this.taskStore;
    },

    // To be compatible with Sch.view.dependency.View
    getEventStore : function() {
        return this.getTaskStore();
    },

    // private
    setupGanttEvents : function () {
        var me          = this,
            taskStore   = this.taskStore;

        if (this.toggleParentTasksOnClick) {
            this.on({
                taskclick : function (view, task, e) {

                    if (e.getTarget('.sch-rollup-wrap')) return;

                    var dependencyView       = this.ownerGrid.dependencyView,
                        isCreatingDependency = dependencyView &&
                            dependencyView.dragZone &&
                            dependencyView.dragZone.dragging;

                    if (!isCreatingDependency && !task.isLeaf() && (!taskStore.isTreeFiltered() || taskStore.allowExpandCollapseWhileFiltered)) {
                        task.isExpanded() ? task.collapse() : task.expand();
                    }
                }
            });
        }
    },

    // private
    configureLabels  : function () {

        Ext.Array.each(['left', 'right', 'top', 'bottom'], function(pos) {

            var field = this[pos+'LabelField'];

            if (field) {
                field = Ext.isObject(field) ? Ext.apply({}, field) : field;

                if (Ext.isString(field)) {
                    field = this[pos + 'LabelField'] = { dataIndex : field };
                }

                // Initialize editor (if defined)
                if (field.editor) {
                    var editor = field.editor;

                    // if user provided an object we should clone it in case it sits on a class prototype
                    if (!editor.isComponent) {
                        editor = Ext.clone(editor);
                    }

                    field.editor = Ext.create("Gnt.feature.LabelEditor", this, {
                        labelPosition : pos,
                        field         : editor,
                        dataIndex     : field.dataIndex
                    });
                }

                this[pos+'LabelField'] = field;
            }
        }, this);

        this.on('labeledit_beforestartedit', this.onBeforeLabelEdit, this);
    },

    // private
    onBeforeTaskDrag : function (p, record) {
        return !this.readOnly && record.isDraggable() !== false && !record.isReadOnly() && (this.allowParentTaskMove || record.isLeaf());
    },

    onDragDropStart : function () {
        var me         = this,
            DD         = me.taskDragDrop,
            horizontal = DD.getConstrainDragToTaskRow && DD.getConstrainDragToTaskRow();

        if (me.tip) {
            me.tip.disable();
            me.tip.hide();
        }

        Sch.util.ScrollManager.activate(me, horizontal ? 'horizontal' : 'both');

        // In order to fix treeviewdragdrop scroll body is registered in scroll manager.
        // It makes all drag operations close to edges to trigger scroll.
        // Issue in 6.5.1 can be resolved by registering locked body, instead of scroll body. But 6.2.1 doesn't
        // allow such approach. In order to prevent task dragdrop to scroll vertically we make threshold too low
        // to ever be reached with mouse.
        if (!DD.outOfRowTaskDragDrop && DD.dragging) {
            me._oldVThresh = Ext.dd.ScrollManager.vthresh;

            Ext.dd.ScrollManager.vthresh = -1;
        }
    },

    onDragDropEnd : function () {
        if (this.tip) {
            this.tip.enable();
        }

        Sch.util.ScrollManager.deactivate(this);

        if (!this.taskDragDrop.outOfRowTaskDragDrop && this.taskDragDrop.dragging) {
            Ext.dd.ScrollManager.vthresh = this._oldVThresh;
            delete this._oldVThresh;
        }
    },

    onTaskProgressBarResizeStart : function () {
        if (this.tip) {
            this.tip.hide();
            this.tip.disable();
        }
    },

    onTaskProgressBarResizeEnd : function () {
        if (this.tip) {
            this.tip.enable();
        }
    },

    onTaskResizeStart : function () {
        var scrollable = this.getScrollable();

        if (this.tip) {
            this.tip.hide();
            this.tip.disable();
        }

        // While resizing a task, we don't want the scroller to interfere
        scrollable.setDisabled && scrollable.setDisabled(true);
    },

    onTaskResizeEnd : function () {
        var scrollable = this.getScrollable();

        if (this.tip) {
            this.tip.enable();
        }

        // While resizing a task, we don't want the scroller to interfere
        scrollable.setDisabled && scrollable.setDisabled(false);
    },

    // private
    onBeforeDragCreate : function () {
        return !this.readOnly;
    },

    // private
    onBeforeTaskResize : function (view, task) {
        return !this.readOnly && !task.isEffortDriven();
    },

    onBeforeTaskProgressBarResize : function () {
        return !this.readOnly;
    },

    onBeforeLabelEdit : function () {
        return !this.readOnly;
    },

    afterRender : function () {
        this.callParent(arguments);

        this.getEl().on('mousemove', this.configureFeatures, this, { single : true });
    },

    resolveTaskRecord : function (el) {
        var node = this.findItemByChild(el);

        if (node) {
            return this.getRecord(node);
        }
        return null;
    },

    resolveEventRecord : function (el) {
        return this.resolveTaskRecord(el);
    },

    resolveEventRecordFromResourceRow: function (el) {
        return this.resolveTaskRecord(el);
    },

    /**
     * @private
     * @param {Gnt.model.Task} task Task to highlight
     * @param {Boolean} highlight Pass true to highlight task and false to unhighlight it
     * @param {Boolean} [includeDependent] Pass false to ignore dependent tasks/dependencies
     */
    triggerHighlightTask : function (task, highlight, includeDependent) {
        if (!(task instanceof Ext.data.Model)) {
            task = this.taskStore.getModelById(task);
        }

        if (task) {
            task.isHighlighted = highlight;

            var el = this.getRow(task);
            if (el) {
                Ext.fly(el)[highlight ? 'addCls' : 'removeCls']('sch-gantt-task-highlighted');
            }

            if (includeDependent !== false) {
                for (var i = 0, l = task.successors.length; i < l; i++) {
                    var dep = task.successors[i];

                    this[(highlight ? '' : 'un') + 'highlightDependency'](dep);
                    this[(highlight ? '' : 'un') + 'highlightTask'](dep.getTargetTask(), includeDependent);
                }
            }
        }
    },


    /**
     * Highlights a task and optionally any dependent tasks. Highlighting will add the `sch-gantt-task-highlighted`
     * class to the task row element.
     *
     * @param {Gnt.model.Task/Number} task Either a task record or the id of a task
     * @param {Boolean} highlightDependentTasks `true` to highlight the depended tasks. Defaults to `true`
     *
     */
    highlightTask : function (task, highlightDependentTasks) {
        this.triggerHighlightTask(task, true, highlightDependentTasks);
    },

    /**
     * Un-highlights a task and optionally any dependent tasks.
     *
     * @param {Gnt.model.Task/Number} task Either a task record or the id of a task
     * @param {Boolean} includeSuccessorTasks `true` to also highlight successor tasks. Defaults to `true`
     *
     */
    unhighlightTask : function (task, includeSuccessorTasks) {
        this.triggerHighlightTask(task, false, includeSuccessorTasks);
    },

    /**
     * Highlights tasks in the current view that match the passed filter function
     * @param {Function} fn Function to filter tasks to hightlight
     * @param {Object} [scope] Scope for filter function
     */
    highlightTasksBy : function (fn, scope) {
        var me = this;

        scope = scope || me;

        me.taskStore.getRoot().cascadeBy(function (task) {
            fn.call(scope, task) && me.highlightTask(task, false);
        });
    },

    /**
     * Clears highlighted tasks/dependencies
     */
    clearHighlightedTasks : function () {
        var me = this,
            dependencyView = me.ownerGrid.getDependencyView();

        me.taskStore.getRoot().cascadeBy(function (task) {
            me.unhighlightTask(task, false);
        });

        Ext.Array.each(dependencyView.getHighlightedDependencies(), function (dependency) {
            dependencyView.unhighlightDependency(dependency);
        });
    },

    getRowClass : function (task) {
        var cls = '';

        if (task.isHighlighted) {
            cls += ' sch-gantt-task-highlighted';
        }

        if ('_GroupValue_' in task.data) {
            cls += ' gnt-group-item';
        }

        if (this.externalGetRowClass) {
            cls += ' ' + (this.externalGetRowClass.apply(this, arguments) || '');
        }

        return cls;
    },

    /**
     * Returns the critical path(s) that can affect the end date of the project
     * @return {Array} paths An array of arrays (containing task chains)
     */
    getCriticalPaths : function () {
        return this.taskStore.getCriticalPaths();
    },

    /**
     * Highlights the critical path(s) that can affect the end date of the project.
     */
    highlightCriticalPaths : function () {
        var me = this;

        // First clear any selected tasks/dependencies
        me.clearHighlightedTasks();

        var paths           = me.getCriticalPaths(),
            dependencyStore = me.getDependencyStore(),
            dependencyView  = me.ownerGrid.getDependencyView();

        // we might have multiple projects
        Ext.Array.each(paths, function (path) {
            var prevLevelTasks;

            // walk through the path
            Ext.Array.each(path, function (levelTasks) {
                // every element is an array of critical predecessors
                for (var i = 0, l = levelTasks.length; i < l; i++) {
                    var task = levelTasks[i];

                    // for leaves we highlight the task itself and its parents that are also critical
                    if (task.isLeaf()) {
                        task.bubble(function (parent) {
                            if (!parent.isRoot() && !parent.isProject && (parent === task || parent.isCritical())) {
                                me.highlightTask(parent, false);
                            }
                        });

                    // for summaries we highlight the task itself and its children that are also critical
                    } else {
                        task.cascadeBy(function (child) {
                            if (child === task || child.isCritical()) {
                                me.highlightTask(child, false);
                            }
                        });
                    }

                    // If we have the previous path chain
                    // let's loop over its tasks and highlight stressed dependencies
                    if (prevLevelTasks) {
                        Ext.each(prevLevelTasks, function (prevTask) {
                            var dependency = dependencyStore.getTasksLinkingDependency(task, prevTask);
                            dependency && dependencyView.highlightDependency(dependency);
                        });
                    }
                }

                prevLevelTasks = levelTasks;
            });
        });

        me.addCls('sch-gantt-critical-chain');
    },


    /**
     * Removes the highlighting of the critical path(s).
     */
    unhighlightCriticalPaths : function () {
        var me = this;

        me.removeCls('sch-gantt-critical-chain');

        me.clearHighlightedTasks();
    },


    //private
    getXOffset               : function (task, isBaseline) {
        var offset = 0;

        if (task.isMilestone(isBaseline)) {
            // For milestones, the offset should be one forth of the row height
            // #4784
            offset = Math.floor(this.getRowHeight() / 4);
        }

        return offset;
    },

    //private
    onDestroy                : function () {
        if (this.rendered) {
            Ext.dd.ScrollManager.unregister(this.el);
        }

        clearTimeout(this.scrollTimer);
        clearTimeout(this.unbindListenerTimer);

        this.taskDragDrop && Ext.destroy(this.taskDragDrop);

        this.callParent(arguments);
    },

    /**
     * Convenience method wrapping the dependency manager method which highlights the elements representing a particular dependency
     * @param {Mixed} record Either the id of a record or a record in the dependency store
     */
    highlightDependency : function (record) {
        this.ownerGrid.getDependencyView().highlightDependency(record);
    },

    /**
     * Convenience method wrapping the dependency manager method which unhighlights the elements representing a particular dependency
     * @param {Mixed} record Either the id of a record or a record in the dependency store
     */
    unhighlightDependency  : function (record) {
        this.ownerGrid.getDependencyView().unhighlightDependency(record);
    },

    /**
     * Returns the editor defined for the left task label
     * @return {Gnt.feature.LabelEditor} editor The editor
     */
    getLeftEditor : function () {
        return this.leftLabelField && this.leftLabelField.editor;
    },

    /**
     * Returns the editor defined for the right task label
     * @return {Gnt.feature.LabelEditor} editor The editor
     */
    getRightEditor : function () {
        return this.rightLabelField && this.rightLabelField.editor;
    },

    /**
     * Returns the editor defined for the top task label
     * @return {Gnt.feature.LabelEditor} editor The editor
     */
    getTopEditor : function () {
        return this.topLabelField && this.topLabelField.editor;
    },

    /**
     * Returns the editor defined for the bottom task label
     * @return {Gnt.feature.LabelEditor} editor The editor
     */
    getBottomEditor : function () {
        return this.bottomLabelField && this.bottomLabelField.editor;
    },

    /**
     * Programmatically activates the editor for the left label
     * @param {Gnt.model.Task} record The task record
     */
    editLeftLabel : function (record) {
        var ed = this.getLeftEditor();
        if (ed) {
            ed.edit(record);
        }
    },

    /**
     * Programmatically activates the editor for the right label
     * @param {Gnt.model.Task} record The task record
     */
    editRightLabel : function (record) {
        var ed = this.getRightEditor();
        if (ed) {
            ed.edit(record);
        }
    },

    /**
     * Programmatically activates the editor for the top label
     * @param {Gnt.model.Task} record The task record
     */
    editTopLabel : function (record) {
        var ed = this.getTopEditor();
        if (ed) {
            ed.edit(record);
        }
    },

    /**
     * Programmatically activates the editor for the bottom label
     * @param {Gnt.model.Task} record The task record
     */
    editBottomLabel : function (record) {
        var ed = this.getBottomEditor();
        if (ed) {
            ed.edit(record);
        }
    },

    // Repaint parents of rollup tasks and readonly child tasks
    onRowUpdate : function (store, index) {
        var record = this.store.getAt(index);

        if (record && record.previous) {
            var prev = record.previous;
            // The code below will handle the redraw when user does "setRollup" on some task
            // However generally the parent tasks are refreshed at the end of the cascading in the `onAfterCascade` method
            // of the Gnt.panel.Gantt
            if (record.parentNode && (record.rollupField in prev || record.getRollup())) {
                this.refreshNode(record.parentNode);
            }

            // refresh the task child nodes when the task readOnly status changes
            if (record.readOnlyField in prev) {
                this.refreshNotReadOnlyChildNodes(record);
            }
        }
    },

    // Repaint parents of rollup tasks if such tasks are hidden due to collapsed parent and update is done
    // via undo-redo (though there might be other cases when rollup task is changed and those changes might
    // not propagate to a parent task, if, for example, recalculate parents or cascade changes are off)
    onTaskStoreUpdate : function(taskStore, task, operation, modifiedFieldNames, details) {
        var prev = task.previous;

        if (prev && task.getRollup() && task.parentNode && !task.parentNode.expanded && taskStore.isUndoingOrRedoing()) {
            this.refreshNode(task.parentNode);
        }
    },

    handleScheduleEvent : function (e) {
        var t = e.getTarget('.' + this.timeCellCls, 3);

        if (t) {
            var rowNode = this.findRowByChild(t);

            if (e.type.indexOf('pinch') >= 0) {
                this.fireEvent('schedule' + e.type, this, e);
            } else {
                this.fireEvent('schedule' + e.type, this, this.getDateFromDomEvent(e, 'floor'), this.indexOf(rowNode), e);
            }
        }
    },


    /**
     *  Scrolls a task record into the viewport.
     *  This method will also expand all relevant parent nodes to locate the event.
     *
     *  @param {Gnt.model.Task} taskRec, the task record to scroll into view
     *  @param {Boolean/Object} highlight, either `true/false` or a highlight config object used to highlight the element after scrolling it into view
     *  @param {Boolean/Object} animate, either `true/false` or an animation config object used to scroll the element
     */
    scrollEventIntoView : function (taskRec, highlight, animate, callback, scope) {
        scope = scope || this;

        var me = this;
        var taskStore = this.taskStore;

        var basicScroll = function (el, scrollHorizontally) {

            // HACK
            // After a time axis change, the header is resized and Ext JS TablePanel reacts to the size change.
            // Ext JS reacts after a short delay, so we cancel this task to prevent Ext from messing up the scroll sync
            me.up('panel').scrollTask.cancel();

            // Add a little breathing room on the left of the task
            me.scrollElementIntoView(el, scrollHorizontally, animate, highlight, 100, callback, scope);
        };

        // Make sure the resource is expanded all the way up first.
        if (!taskRec.isVisible()) {
            taskRec.bubble(function (node) {
                node.expand();
            });
        }

        var targetEl;

        var startDate = taskRec.getStartDate(),
            endDate = taskRec.getEndDate(),
            isScheduled = Boolean(startDate && endDate),
            elements;

        if (isScheduled) {
            var timeAxis = this.timeAxis;

            // If task is not in the currently viewed time span, change time span
            if (!timeAxis.dateInAxis(startDate)) {
                timeAxis.shiftTo(Sch.util.Date.add(startDate, timeAxis.mainUnit, -timeAxis.increment * 1));
            }

            elements = this.getElementsFromEventRecord(taskRec);
            targetEl = elements && elements[0];
        } else {
            // No date information in the task, scroll to row element instead
            targetEl = this.getNode(taskRec);

            if (targetEl) {
                targetEl = Ext.fly(targetEl).down(this.getCellSelector());
            }
        }

        if (targetEl) {
            basicScroll(targetEl, isScheduled);
        } else {
            if (this.bufferedRenderer) {
                // If task store is grouped bufferedRenderer.scrollTo() raises
                // an exception if we try to scroll to a summary task
                if (taskStore.indexOf(taskRec) >= 0) {
                    this.scrollTimer = Ext.Function.defer(function () {
                        me.bufferedRenderer.scrollTo(taskRec, false, function () {
                            // el should be present now
                            var elements = me.getElementsFromEventRecord(taskRec);
                                targetEl = elements && elements[0];

                            if (targetEl) {
                                basicScroll(targetEl, true);
                            } else {
                                callback && callback.call(scope);
                            }
                        });

                    }, 10);
                }
            }
        }
    },

    // Checks if the element provided has been rendered and if it's currently displayed.
    // At the state when it's rendered and displayed we can query DOM for element dimensions and offsets
    isElementRenderedAndDisplayed : function(taskRecordOrRowEl) {
        if (taskRecordOrRowEl instanceof Gnt.model.Task) {
            taskRecordOrRowEl = this.view.getRowNode(taskRecordOrRowEl);
        }

        return !!(taskRecordOrRowEl && Ext.fly(taskRecordOrRowEl).getHeight());
    },

    /**
     * Gets the task box of the given task.
     *
     * @param {Sch.model.Event} taskRecord
     * @return {Object/Object[]/Null}
     * @return {Number} return.top
     * @return {Number} return.bottom
     * @return {Number} return.start
     * @return {Number} return.end
     * @return {Boolean} return.rendered Whether the box was calculated for the rendered scheduled record or was
     *                                   approximately calculated for the scheduled record outside of the current
     *                                   vertical view area.
     * @return {String} return.relPos if the item is not rendered then provides a view relative position one of 'before', 'after'
     */
    getItemBox : function(taskRecord) {
        var DATE = Sch.util.Date,
            me = this,
            result = null,
            viewStartDate  = me.getViewStartDate(),
            viewEndDate    = me.getViewEndDate(),
            // For milestones we tend to use end date since there might be a milestone having non-zero duration and in such case
            // no full length task bar is rendered, we just render a "diamond" on the end date
            taskStartDate  = taskRecord.isMilestone() && taskRecord.getEndDate() || taskRecord.getStartDate(),
            taskEndDate    = taskRecord.getEndDate(),
            taskStore      = me.getTaskStore(),
            taskStartX, taskEndX,
            rowEl, rowIndex, rowHeight,
            firstRowIndex, firstRowRecord,
            lastRowIndex, lastRowRecord, lastRowEl;

        // Checking if task record is:
        result = (
            // - scheduled;
            taskStartDate && taskEndDate &&
            // - visible, i.e. it's not within a collapsed row
            // - actually rendered or might be filtered out by Sencha's filters
            me.store.indexOf(taskRecord) >= 0 &&
            // - not filtered out
            (!taskStore.isTreeFiltered() || taskStore.lastTreeFilter.filter.call(taskStore.lastTreeFilter.scope || taskStore, taskRecord))
        ) || null;

        if (result) {

            rowEl = me.getNode(taskRecord);

            // If task row is rendered and displayed
            if (rowEl && me.isElementRenderedAndDisplayed(rowEl)) {
                var taskNodeTop, taskNodeBottom;
                var nodeContainer       = me.getNodeContainer();
                var OUTSIDE_VIEW_OFFSET = 40; // To make sure non-relevant dependency lines aren't seen

                if (taskRecord.isMilestone()) {
                    var verticalMargin  = me.getRowHeight() * 0.16,
                        rowTop          = Ext.fly(rowEl).getOffsetsTo(nodeContainer)[1],
                        milestoneEl, leftOffset;

                    taskNodeTop     = rowTop + verticalMargin;
                    taskNodeBottom  = rowTop + me.getRowHeight() - verticalMargin;

                    // If there is a diamond element - use it for calculations
                    milestoneEl = Ext.fly(rowEl).down('.sch-gantt-milestone-diamond') ||
                        Ext.fly(rowEl).down('.sch-gantt-milestone-diamond-ct');

                    if (milestoneEl) {
                        leftOffset      = milestoneEl.getOffsetsTo(rowEl)[0];
                        taskStartX      = leftOffset;
                        taskEndX        = leftOffset + milestoneEl.getWidth();
                    }
                } else {
                    var taskNode    = Ext.fly(rowEl).down('.' + Ext.baseCSSPrefix + 'grid-cell-inner > .sch-event-wrap .sch-gantt-item', true) || rowEl;

                    taskNodeTop     = Ext.fly(taskNode).getOffsetsTo(nodeContainer)[1];
                    taskNodeBottom  = taskNodeTop + Ext.fly(taskNode).getHeight();
                }

                if (!taskStartX) {
                    taskStartX      = me.getCoordinateFromDate(DATE.min(DATE.max(taskStartDate, viewStartDate), viewEndDate));
                    taskEndX        = me.getCoordinateFromDate(DATE.max(DATE.min(taskEndDate, viewEndDate), viewStartDate));
                }

                // Make sure start/end points are not in view
                // NOTE: getTime() is for Chrome optimization
                if (viewStartDate.getTime() > taskStartDate.getTime()) taskStartX   -= OUTSIDE_VIEW_OFFSET;
                if (viewStartDate.getTime() > taskEndDate.getTime())   taskEndX     -= OUTSIDE_VIEW_OFFSET;
                if (viewEndDate.getTime()   < taskStartDate.getTime()) taskStartX   += OUTSIDE_VIEW_OFFSET;
                if (viewEndDate.getTime()   < taskEndDate.getTime())   taskEndX     += OUTSIDE_VIEW_OFFSET;

                // Finally we have all the data needed to calculate the task record box
                result = {
                    rendered   : true,
                    start      : taskStartX,
                    end        : taskEndX,
                    top        : Math.round(taskNodeTop),
                    bottom     : Math.round(taskNodeBottom)
                };
            }
            // Resource row is not rendered and it's not collapsed. We calculate a task box approximately.
            else {
                result = {
                    rendered   : false,
                    start      : me.getCoordinateFromDate(DATE.max(taskStartDate, viewStartDate)),
                    end        : me.getCoordinateFromDate(DATE.min(taskEndDate, viewEndDate))
                    // top and bottom to go
                };

                // WARNING: view.all is a private property
                firstRowIndex  = me.all.startIndex;
                firstRowRecord = me.getRecord(firstRowIndex);
                // WARNING: view.all is a private property
                lastRowIndex   = me.all.endIndex;
                lastRowRecord  = me.getRecord(lastRowIndex);

                if (firstRowRecord && lastRowRecord) {

                    rowHeight      = me.getRowHeight();

                    // Task row is not rendered and it's above first visible row.
                    // Here we provide box coordinates requested to be in the row above the first visible row, this should suffice. The real box coordinates are somewhere above,
                    // and it will take way to much effort to calculate them to exact values, so we provide some sufficient surrogate coordinates.
                    if (taskRecord.isAbove(firstRowRecord)) {
                        result.top    = -rowHeight;
                        result.bottom = result.top + rowHeight;
                        result.relPos = 'before';
                    }
                    // Task row is not rendered or displayed and it's inside visible rows range, the case happens when a view or one of it's parents is hidden
                    // with 'display:none' rule.
                    else if (taskRecord == lastRowRecord || taskRecord.isAbove(lastRowRecord)) {
                        rowIndex = me.indexOf(taskRecord);
                        result.top = rowIndex * rowHeight;
                        result.bottom = result.top + rowHeight;
                    }
                    // Task row is not rendered and it's below last visible row.
                    // Here we provide box coordinates requested to be in the row bellow the last visible row, this should suffice. The real box coordniates are somewhere below,
                    // and it will take way to much effort to calculate them to exact values, so we provide some sufficient surrogate coordinates.
                    else {
                        lastRowEl     = me.getNode(lastRowIndex);

                        // Rows can be stretched, use last row's real coordinates if offsets are reliable
                        if (me.isElementRenderedAndDisplayed(lastRowEl)) {
                            result.top = Ext.fly(lastRowEl).getOffsetsTo(me.getNodeContainer())[1] + Ext.fly(lastRowEl).getHeight();
                        }
                        else {
                            result.top = (lastRowIndex + 1) * rowHeight;
                        }

                        result.bottom = result.top + rowHeight;
                        result.relPos = 'after';
                    }
                } else {
                    result = null;
                }
            }

            // Milestone boxes need special adjustments
            if (result) {
                result = me.adjustItemBox(taskRecord, result);
            }
        }

        return result;
    },

    /**
     * Adjusts task record box if needed
     *
     * @param {Gnt.model.Task} taskRecord
     * @param {Object} taskBox
     * @return {Number} taskBox.top
     * @return {Number} taskBox.bottom
     * @return {Number} taskBox.start
     * @return {Number} taskBox.end
     * @return {Object}
     * @return {Number} return.top
     * @return {Number} return.bottom
     * @return {Number} return.start
     * @return {Number} return.end
     * @protected
     */
    adjustItemBox : function(taskRecord, taskBox) {
        var result = taskBox;

        if (taskRecord.isMilestone()) {
            result.bottom++;
        }

        return result;
    },

    getDataForTooltipTpl : function (record, triggerElement, e) {
        var id             = triggerElement.getAttribute('rolluptaskid'),
            targetRecord   = record,
            overlappingRecords = [],
            data;

        // If hovering a rollup miniature, we should show the rolled up task info
        if (id) {
            var rolledUpRecord = this.getTaskStore().getNodeById(id);

            if (rolledUpRecord) {
                targetRecord       = rolledUpRecord;
                overlappingRecords = this.getAdjacentRollupRecords(record, targetRecord, triggerElement, e);
            }
        }

        data = Ext.Array.map([targetRecord].concat(overlappingRecords), function (record) {
            return Ext.apply({ _record : record }, record.data);
        });

        // To make this structure BW compatible, single object has to be returned with _record
        // property (accessed by few examples). At the same time we should pass array of records for overlappig
        // rollups, that should include all records (for convenience). Resulting structure is recursive.
        return Ext.apply(data[0], {
            _useBaselineData : Boolean(Ext.fly(triggerElement).up('.sch-gantt-baseline-item')),
            records          : data
        });
    },

    getAdjacentRollupRecords : function (rootRecord, rollupRecord, triggerElement, e) {
        var taskStore                  = this.getTaskStore(),
            adjacentRecords            = [],
            threshold                  = this.rollupIntersectThreshold,
            cursorPoint                = e.getPoint();

        Ext.fly(triggerElement).up('.sch-rollup-wrap').select('.sch-gantt-item').each(function (rollupEl) {
            if (triggerElement != rollupEl.dom) {
                var targetRegion = rollupEl.getRegion();
                var include;

                // Add a threshold distance for milestones to identify overlapping tasks
                if (rollupRecord.isMilestone()) {
                    var hoveredRollupElementRegion = Ext.fly(triggerElement).getRegion(),
                        sourceRegion               = Ext.util.Region.from({
                            top    : hoveredRollupElementRegion.top - threshold,
                            right  : hoveredRollupElementRegion.right + threshold,
                            bottom : hoveredRollupElementRegion.bottom + threshold,
                            left   : hoveredRollupElementRegion.left - threshold
                        });

                    include = sourceRegion.intersect(targetRegion);
                } else {
                    include = targetRegion.contains(cursorPoint);
                }

                if (include) {
                    var id             = rollupEl.getAttribute('rolluptaskid');
                    var rolledUpRecord = taskStore.getNodeById(id);

                    if (rolledUpRecord) {
                        adjacentRecords.push(rolledUpRecord);
                    }
                }
            }
        });

        return adjacentRecords;
    },

    /**
     * Shows the baseline tasks
     */
    showBaseline : function () {
        var me = this;

        if (!me.baselineVisible) {
            me.baselineVisible = true;
            me.addCls('sch-ganttview-showbaseline');
            /**
             * Fired when baseline elements visiblity is set to on.
             *
             * @event baseline-show
             *
             * @param {Gnt.view.Gantt} this
             */
            me.fireEvent('baseline-show', me);
        }
    },

    /**
     * Hides the baseline tasks
     */
    hideBaseline : function () {
        var me = this;

        if (me.baselineVisible) {
            me.baselineVisible = false;
            /**
             * Fired when baseline elements visiblity is set to off.
             *
             * @event baseline-hide
             *
             * @param {Gnt.view.Gantt} this
             */
            me.removeCls('sch-ganttview-showbaseline');
            me.fireEvent('baseline-hide', me);
        }
    },

    /**
     * Toggles the display of the baseline
     */
    toggleBaseline : function () {
        var me = this;

        me.baselineVisible ? me.hideBaseline() : me.showBaseline();
    }
});
