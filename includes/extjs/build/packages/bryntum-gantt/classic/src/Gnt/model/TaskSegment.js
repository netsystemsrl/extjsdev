/**
@class Gnt.model.TaskSegment
@extends Gnt.model.Task

This class represents a segment of a split task in your Gantt chart.

*/
Ext.define('Gnt.model.TaskSegment', {
    extend                  : 'Gnt.model.Task',

    /**
     * @cfg {Gnt.model.Task} task The task part of which this segment is.
     * @required
     */
    task                    : null,

    customizableFields      : [
        { name : 'StartOffset',     type : 'int', defaultValue : null },
        { name : 'EndOffset',       type : 'int', defaultValue : null }
    ],

    startOffsetField        : 'StartOffset',
    endOffsetField          : 'EndOffset',

    taskNotifyingSuspended  : 0,

    constructor : function (cfg) {
        cfg         = cfg || {};

        cfg.leaf    = true;

        if (!cfg.task) throw "'task' has to be specified";

        this.task = cfg.task;

        this.callParent(arguments);

        Ext.override(this, this.overridables);

        if (this.getTask().normalized && this.getTaskStore(true) && !this.normalized) {
            this.normalize();
        }
    },


    overridables : {

        // we have to treat set() method override this way since we use explicit Ext.override() call
        // to override it in Gnt.model.mixin.ProjectableModel, and thus we can override it using the same approach only
        set : function () {
            var task    = this.getTask();

            if (task && !this.__editCounter && !this.taskNotifyingSuspended) {
                // let master task know of editing being started
                task.onSegmentEditBegin(this);
            }

            this.callParent(arguments);

            if (task && !this.__editCounter && !this.taskNotifyingSuspended) {
                // let master task know of editing being ended
                task.onSegmentEditEnd(this);
            }
        }
    },

    getFieldsToSerialize : function () {
        var me = this;

        return [
            me.idProperty,
            me.phantomIdField,
            me.startDateField,
            me.endDateField,
            me.durationField,
            me.durationUnitField,
            me.clsField
        ];
    },

    serialize : function () {
        var me           = this,
            fieldsToKeep = me.getFieldsToSerialize(),
            data         = me.getData({
                serialize : true
            }),
            fieldName;

        // Need to get rid of unnecessary fields
        for (fieldName in data) {
            if (!Ext.Array.contains(fieldsToKeep, fieldName)) {
                delete data[fieldName];
            }
        }

        // To make sure idProperty is there
        if (me.getId()) {
            data[me.idProperty] = me.getId();
        }

        return data;
    },

    setStartOffset : function (startOffset) {
        var cal                 = this.getTask().getProjectCalendar();
        var durationInTaskUnit  = cal.convertMSDurationToUnit(this.getEndOffset() - startOffset, this.getDurationUnit());

        this.beginEdit();

        this.set(this.startOffsetField, startOffset);
        this.set(this.durationField, durationInTaskUnit);

        this.endEdit();
    },


    setEndOffset : function (endOffset) {
        var cal                 = this.getTask().getProjectCalendar();
        var durationInTaskUnit  = cal.convertMSDurationToUnit(endOffset - this.getStartOffset(), this.getDurationUnit());

        this.beginEdit();

        this.set(this.endOffsetField, endOffset);
        this.set(this.durationField, durationInTaskUnit);

        this.endEdit();
    },


    setStartEndOffset : function (startOffset, endOffset) {
        var cal                 = this.getTask().getProjectCalendar();
        var durationInTaskUnit  = cal.convertMSDurationToUnit(endOffset - startOffset, this.getDurationUnit());

        this.beginEdit();

        this.set(this.startOffsetField, startOffset);
        this.set(this.endOffsetField, endOffset);
        this.set(this.durationField, durationInTaskUnit);

        this.endEdit();
    },


    normalize : function () {
        // fill missing standard task fields: end date based on duration or duration based on end date etc.
        this.callParent(arguments);

        var startDate   = this.getStartDate();

        // fill offsets if needed
        if (!Ext.isNumber(this.getStartOffset()) && startDate) {
            var task                = this.getTask();
            var startOffset         = this.calculateDuration(task.getStartDate(), startDate, 'MILLI');
            var endOffset           = startOffset + this.getDuration('MILLI');
            var cal                 = task.getProjectCalendar();
            var durationInTaskUnits = cal.convertMSDurationToUnit(endOffset - startOffset, this.getDurationUnit());

            this.data[this.startOffsetField]    = startOffset;
            this.data[this.endOffsetField]      = endOffset;
            this.data[this.durationField]       = durationInTaskUnits;
        }
    },


    updateOffsetsByDates : function () {
        // we need task store to use its project calendar
        if (!this.getTaskStore(true)) return;

        // prevents nested updating of offsets
        // and updating of offsets during start/end recalculation (based on offsets)
        if (this.updatingOffsets || this.updatingDates) return;

        // set flag saying that we are in the middle of updating offsets by dates
        this.updatingOffsets    = true;

        var offset              = this.calculateDuration(this.getTask().getStartDate(), this.getStartDate(), 'MILLI');

        this.setStartEndOffset(offset, offset + this.getDuration('MILLI'));

        this.updatingOffsets    = false;
    },


    updateDatesByOffsets : function (options) {
        options                 = options || {};

        // prevents nested updating of dates
        // and updating of dates during offsets updating
        if (this.updatingDates || this.updatingOffsets) return;

        var isForward           = options.isForward !== false,
            useAbsoluteOffset   = options.useAbsoluteOffset !== false,
            startDate           = options.startDate,
            endDate             = options.endDate,
            taskStore           = this.getTaskStore(true);

        if (!taskStore) return;

        // set flag saying that we are in the middle of updating dates by offsets
        this.updatingDates      = true;

        var date, neighbour;

        if (isForward) {
            neighbour   = this.getPrevSegment();

            if (neighbour && !useAbsoluteOffset) {
                date    = this.skipWorkingTime(neighbour.getEndDate(), this.getStartOffset() - neighbour.getEndOffset());
            } else {
                date    = this.skipWorkingTime(startDate || this.getTask().getStartDate(), this.getStartOffset());
            }

        } else {
            neighbour   = this.getNextSegment();

            if (neighbour && !useAbsoluteOffset) {
                date    = this.skipWorkingTime(neighbour.getStartDate(), neighbour.getStartOffset() - this.getEndOffset() + this.getDuration('MILLI'), false);
            } else {
                date    = this.skipWorkingTime(endDate || this.getTask().getEndDate(), this.getDuration('MILLI'), false);
            }

        }

        this.setStartDateWithoutPropagation(date, true, taskStore.skipWeekendsDuringDragDrop);

        this.updatingDates      = false;
    },


    getPrevSegment : function () {
        var segments = this.task.getSegments();
        return segments[Ext.Array.indexOf(segments, this) - 1];
    },

    getNextSegment : function () {
        var segments = this.task.getSegments();
        return segments[Ext.Array.indexOf(segments, this) + 1];
    },

    buildSnapshot : function () {
        return [this, Ext.apply({}, this.data)];
    },

    readSnapshot : function (snapshot) {
        var result = snapshot;

        if (snapshot) {
            Ext.apply(this.data, snapshot[1]);

            result = this;
        }

        return result;
    },

    suspendTaskNotifying : function () {
        this.taskNotifyingSuspended++;
    },

    resumeTaskNotifying : function () {
        this.taskNotifyingSuspended--;
    },

    skipWorkingTime : function (date, duration, isForward, segments) {
        return this.callParent([date, duration, isForward, false]);
    },

    skipNonWorkingTime : function (date, isForward, segments) {
        return this.callParent([date, isForward, false]);
    },

    setStartDateWithoutPropagation : function (date, keepDuration, skipNonWorkingTime) {
        this.beginEdit();

        this.callParent(arguments);

        keepDuration = keepDuration !== false;

        this.updateOffsetsByDates();

        // if we have next segment(s) and we have to respect and not overlap them
        if (keepDuration) {
            if (!this.inShifting && this.getNextSegment()) {
                // this.shiftNeighboursWithoutPropagation();
                var neighbour   = this.getNextSegment();
                var shift       = this.getEndOffset() - neighbour.getStartOffset();

                if (neighbour && shift > 0) {
                    neighbour.suspendTaskNotifying();
                    neighbour.shiftWithoutPropagation(shift, true);
                    neighbour.resumeTaskNotifying();
                }
            }

        // if the segment has zero duration let's remove it
        } else if (!this.getDuration()) {
            var task = this.getTask();
            task.suspendSegmentsTracking();
            task.removeSegments(this);
            task.resumeSegmentsTracking();
        }

        this.endEdit();

        return true;
    },


    /**
     * @private
     * Shifts the segment by provided number of milliseconds.
     * @param {Number} amountMS Number of milliseconds the segment shoud be mover by.
     * @param {Boolean} [respectNeighbours=false] Pass `true` to shift further segments as well.
     */
    shiftWithoutPropagation : function (amountMS, respectNeighbours) {
        var me = this,
            neighbour;

        if (amountMS) {

            me.beginEdit();

            me.inShifting   = true;

            me.setStartEndOffset(me.getStartOffset() + amountMS, me.getEndOffset() + amountMS);
            me.updateDatesByOffsets();

            if (respectNeighbours) {
                neighbour = amountMS > 0 ? me.getNextSegment() : me.getPrevSegment();

                if (neighbour) {
                    neighbour.suspendTaskNotifying();
                    neighbour.shiftWithoutPropagation(amountMS, true);
                    neighbour.resumeTaskNotifying();
                }
            }

            me.inShifting   = false;

            me.endEdit();
        }

        return true;
    },


    setEndDateWithoutPropagation : function () {
        this.beginEdit();

        this.callParent(arguments);

        // if the segment has zero duration let's remove it
        if (!this.getDuration()) {
            var task = this.getTask();
            task.suspendSegmentsTracking();
            task.removeSegments(this);
            task.resumeSegmentsTracking();
        }

        this.updateOffsetsByDates();

        this.endEdit();

        return true;
    },

    setStartEndDateWithoutPropagation : function () {
        this.beginEdit();

        this.callParent(arguments);

        // if the segment has zero duration let's remove it
        if (!this.getDuration()) {
            var task = this.getTask();
            task.suspendSegmentsTracking();
            task.removeSegments(this);
            task.resumeSegmentsTracking();
        }

        this.updateOffsetsByDates();

        this.endEdit();

        return true;
    },

    setDurationWithoutPropagation: function (number, unit) {
        var me = this,
            newStartDate, newEndDate;

        // {{{ Parameters normalization
        unit = unit || me.getDurationUnit();
        // }}}

        me.beginEdit();

        var taskStore         = me.getTaskStore(true),
            scheduleBackwards = me.getProjectScheduleBackwards(taskStore);

        if (Ext.isNumber(number)) {
            if (scheduleBackwards) {
                newStartDate = me.getEndDate() && me.calculateStartDate(me.getEndDate(), number, unit);
            } else {
                newEndDate = me.getStartDate() && me.calculateEndDate(me.getStartDate(), number, unit);
            }
        }

        me.set(me.durationField, number);
        me.set(me.durationUnitField, unit);

        if (newEndDate) {
            me.set(me.endDateField, newEndDate);
        }

        if (newStartDate) {
            me.set(me.startDateField, newStartDate);
        }

        // if the segment has zero duration let's remove it
        if (!me.getDuration()) {
            var task = me.getTask();
            task.suspendSegmentsTracking();
            task.removeSegments(me);
            task.resumeSegmentsTracking();
        }

        me.updateOffsetsByDates();

        me.endEdit();

        return true;
    },

    /**
     * Gets the task to which the segment belongs.
     * @return {Gnt.model.Task} The task.
     */
    getTask : function () {
        return this.task;
    },

    beginEdit : function () {
        var task    = this.getTask();

        if (task && !this.__editCounter && !this.taskNotifyingSuspended) {
            // let master task know of editing being started
            task.onSegmentEditBegin(this);
        }

        this.callParent(arguments);
    },

    endEdit : function () {
        var modified    = this.previous,
            task        = this.getTask();

        this.callParent(arguments);

        if (task && !this.__editCounter && !this.taskNotifyingSuspended) {
            // if the timespan was affected by the change we let the master task know of it
            if (this.startDateField in modified || this.endDateField in modified || this.startOffsetField in modified || this.endOffsetField in modified || this.durationField in modified)
            {
                task.onSegmentsChanged(this, modified);
            }
            task.onSegmentEditEnd(this);
        }
    },

    // sub-segments are not supported

    // @ignore
    setSegments : Ext.emptyFn,
    // @ignore
    setSegmentsWithoutPropagation : Ext.emptyFn,
    // @ignore
    getSegments : Ext.emptyFn,

    callTask : function (args) {
        var task        = this.task;
        var method      = this.callTask.caller;
        var taskMethod  = method && task[method.$name];

        if (taskMethod) return taskMethod.apply(task, args);
    },

    // @ignore
    getSchedulingMode : function () {
        // #1902 here we redirected this call to the task previously (using: this.callTask(arguments);)
        // yet it brings few questions when it comes to "EfforDriven" mode
        // where end date is calculated based on effort value ..and segment just doesn't have it normally
        return 'Normal';
    },

    // methods mapped from the task

    getCalendar : function () {
        return this.callTask(arguments);
    },

    getOwnCalendar : function () {
        return this.callTask(arguments);
    },

    getProjectCalendar : function () {
        return this.callTask(arguments);
    },

    getDependencyStore : function () {
        return this.callTask(arguments);
    },

    getResourceStore : function () {
        return this.callTask(arguments);
    },

    getAssignmentStore : function () {
        return this.callTask(arguments);
    },

    getTaskStore : function () {
        return this.callTask(arguments);
    },

    forEachAvailabilityInterval : function (options) {
        // we query the task for available intervals
        // but force it to NOT take segmentation into account
        options.segments    = options.segments || false;

        return this.callTask(arguments);
    },

    propagateChanges : function(/*...*/) {
        return this.callTask(arguments);
    },

    rejectSegmentsProjection : function() {
        return this.callTask(arguments);
    },

    commitSegmentsProjection : function() {
        return this.callTask(arguments);
    },

    getAssignments : function () {
        return this.callTask(arguments);
    },

    getAssignmentFor : function () {
        return this.callTask(arguments);
    },

    isAssignedTo : function () {
        return this.callTask(arguments);
    },

    isDraggable: function () {
        return this.callTask(arguments);
    },

    getResources : function () {
        return this.callTask(arguments);
    },

    isReadOnly : function () {
        return this.task.isReadOnly();
    },

    // @ignore
    autoCalculateCost : false,
    // @ignore
    recalculateCost : Ext.emptyFn,

    copy : function (newId, session, /*private*/newData) {
        var me = this,
            // we need to provide custom properties to the copy
            data = Ext.apply({}, newData, me.data),
            idProperty = me.idProperty,
            T = me.self;

        if (newId || newId === 0) {
            data[idProperty] = newId;
        } else if (newId === null) {
            delete data[idProperty];
        }

        return new T(data, session);
    }

    /**
     * @hide
     * @field Name
     */
    /**
     * @hide
     * @field Note
     */
    /**
     * @hide
     * @field ActualEffort
     */
    /**
     * @hide
     * @field ActualCost
     */
    /**
     * @hide
     * @field BaselineEffort
     */
    /**
     * @hide
     * @field BaselineCost
     */
    /**
     * @hide
     * @field BaselineEndDate
     */
    /**
     * @hide
     * @field BaselinePercentDone
     */
    /**
     * @hide
     * @field BaselineStartDate
     */
    /**
     * @hide
     * @field CalendarId
     */
    /**
     * @hide
     * @field ConstraintDate
     */
    /**
     * @hide
     * @field ConstraintType
     */
    /**
     * @hide
     * @field Cost
     */
    /**
     * @hide
     * @field CostVariance
     */
    /**
     * @hide
     * @field DeadlineDate
     */
    /**
     * @hide
     * @field Effort
     */
    /**
     * @hide
     * @field EffortUnit
     */
    /**
     * @hide
     * @field EffortVariance
     */
    /**
     * @hide
     * @field ManuallyScheduled
     */
    /**
     * @hide
     * @field PercentDone
     */
    /**
     * @hide
     * @field ReadOnly
     */
    /**
     * @hide
     * @field Rollup
     */
    /**
     * @hide
     * @field SchedulingMode
     */
    /**
     * @hide
     * @field ShowInTimeline
     */

    /**
     * @hide
     * @method setName
     */
    /**
     * @hide
     * @method getCost
     */
    /**
     * @hide
     * @method getDeadlineDate
     */
    /**
     * @hide
     * @method getName
     */
    /**
     * @hide
     * @cfg autoCalculateEffortForParentTask
     */
    /**
     * @hide
     * @cfg autoCalculatePercentDoneForParentTask
     */
    /**
     * @hide
     * @cfg baselineEndDateField
     */
    /**
     * @hide
     * @cfg baselinePercentDoneField
     */
    /**
     * @hide
     * @cfg baselineStartDateField
     */
    /**
     * @hide
     * @cfg calendar
     */
    /**
     * @hide
     * @cfg calendarIdField
     */
    /**
     * @hide
     * @cfg constraintDateField
     */
    /**
     * @hide
     * @cfg constraintTypeField
     */
    /**
     * @hide
     * @cfg convertEmptyParentToLeaf
     */
    /**
     * @hide
     * @cfg draggableField
     */
    /**
     * @hide
     * @cfg effortField
     */
    /**
     * @hide
     * @cfg effortUnitField
     */
    /**
     * @hide
     * @cfg manuallyScheduledField
     */
    /**
     * @hide
     * @cfg percentDoneField
     */
    /**
     * @hide
     * @cfg phantomParentIdField
     */
    /**
     * @hide
     * @cfg resizableField
     */
    /**
     * @hide
     * @cfg rollupField
     */
    /**
     * @hide
     * @cfg schedulingModeField
     */
    /**
     * @hide
     * @cfg taskStore
     */
    /**
     * @hide
     * @cfg dependencyStore
     */
    /**
     * @hide
     * @property assignments
     */
    /**
     * @hide
     * @property predecessors
     */
    /**
     * @hide
     * @property successors
     */
    /**
     * @hide
     * @method addMilestone
     */
    /**
     * @hide
     * @method addPredecessor
     */
    /**
     * @hide
     * @method addSubtask
     */
    /**
     * @hide
     * @method addSuccessor
     */
    /**
     * @hide
     * @method addTaskAbove
     */
    /**
     * @hide
     * @method addTaskBelow
     */
    /**
     * @hide
     * @method assign
     */
    /**
     * @hide
     * @method cascadeChanges
     */
    /**
     * @hide
     * @method cascadeChildren
     */
    /**
     * @hide
     * @method convertToMilestone
     */
    /**
     * @hide
     * @method convertToRegular
     */
    /**
     * @hide
     * @method forEachDate
     */
    /**
     * @hide
     * @method getAllDependencies
     */
    /**
     * @hide
     * @method getAssignmentFor
     */
    /**
     * @hide
     * @method getAssignmentStore
     */
    /**
     * @hide
     * @method getAssignments
     */
    /**
     * @hide
     * @method getBaselineEndDate
     */
    /**
     * @hide
     * @method getBaselinePercentDone
     */
    /**
     * @hide
     * @method getBaselineStartDate
     */
    /**
     * @hide
     * @method setBaselineEndDate
     */
    /**
     * @hide
     * @method setBaselinePercentDone
     */
    /**
     * @hide
     * @method setBaselineStartDate
     */
    /**
     * @hide
     * @method getCalendar
     */
    /**
     * @hide
     * @method getCalendarDuration
     */
    /**
     * @hide
     * @method getConstraintClass
     */
    /**
     * @hide
     * @method getDates
     */
    /**
     * @hide
     * @method getDependencyStore
     */
    /**
     * @hide
     * @method getDisplayEndDate
     */
    /**
     * @hide
     * @method getDisplayStartDate
     */
    /**
     * @hide
     * @method getEarlyEndDate
     */
    /**
     * @hide
     * @method getEarlyStartDate
     */
    /**
     * @hide
     * @method getEffort
     */
    /**
     * @hide
     * @method getEffortUnit
     */
    /**
     * @hide
     * @method getIncomingDependencies
     */
    /**
     * @hide
     * @method getLateEndDate
     */
    /**
     * @hide
     * @method getLateStartDate
     */
    /**
     * @hide
     * @method getOutgoingDependencies
     */
    /**
     * @hide
     * @method getOwnCalendar
     */
    /**
     * @hide
     * @method getPercentDone
     */
    /**
     * @hide
     * @method getPredecessors
     */
    /**
     * @hide
     * @method getResourceStore
     */
    /**
     * @hide
     * @method getResources
     */
    /**
     * @hide
     * @method getSchedulingMode
     */
    /**
     * @hide
     * @method getSegment
     */
    /**
     * @hide
     * @method getSequenceNumber
     */
    /**
     * @hide
     * @method getSuccessors
     */
    /**
     * @hide
     * @method getTaskStore
     */
    /**
     * @hide
     * @method getTotalCount
     */
    /**
     * @hide
     * @method getWBSCode
     */
    /**
     * @hide
     * @method hasAssignments
     */
    /**
     * @hide
     * @method hasConstraint
     */
    /**
     * @hide
     * @method hasIncomingDependencies
     */
    /**
     * @hide
     * @method hasOutgoingDependencies
     */
    /**
     * @hide
     * @method hasResources
     */
    /**
     * @hide
     * @method indent
     */
    /**
     * @hide
     * @method insertSubtask
     */
    /**
     * @hide
     * @method isAssignedTo
     */
    /**
     * @hide
     * @method isBaselineMilestone
     */
    /**
     * @hide
     * @method isConstraintSatisfied
     */
    /**
     * @hide
     * @method isManuallyScheduled
     */
    /**
     * @hide
     * @method isMilestone
     */
    /**
     * @hide
     * @method isPersistable
     */
    /**
     * @hide
     * @method isProjected
     */
    /**
     * @hide
     * @method isSegmented
     */
    /**
     * @hide
     * @method linkTo
     */
    /**
     * @hide
     * @method merge
     */
    /**
     * @hide
     * @method outdent
     */
    /**
     * @hide
     * @method setBaselinePercentDone
     */
    /**
     * @hide
     * @method setCalendar
     */
    /**
     * @hide
     * @method setConstraint
     */
    /**
     * @hide
     * @method setConstraintDate
     */
    /**
     * @hide
     * @method setConstraintType
     */
    /**
     * @hide
     * @method setEffort
     */
    /**
     * @hide
     * @method setEffortUnit
     */
    /**
     * @hide
     * @method setPercentDone
     */
    /**
     * @hide
     * @method setSchedulingMode
     */
    /**
     * @hide
     * @method setSegments
     */
    /**
     * @hide
     * @method setTaskStore
     */
    /**
     * @hide
     * @method shift
     */
    /**
     * @hide
     * @method split
     */
    /**
     * @hide
     * @method unAssign
     */
    /**
     * @hide
     * @method unlinkFrom
     */
    /**
     * @hide
     * @method isResizable
     */
    /**
     * @hide
     * @method isScheduled
     */
    /**
     * @hide
     * @method isStarted
     */
    /**
     * @hide
     * @method propagateChanges
     */
    /**
     * @hide
     * @method reassign
     */
    /**
     * @hide
     * @method removeSubtask
     */
    /**
     * @hide
     * @method setActualEffort
     */
    /**
     * @hide
     * @method setBaselineCost
     */
    /**
     * @hide
     * @method setBaselineEffort
     */
    /**
     * @hide
     * @method setCost
     */
    /**
     * @hide
     * @method setDeadlineDate
     */
    /**
     * @hide
     * @method setDraggable
     */
    /**
     * @hide
     * @method setEffortWithoutPropagation
     */
    /**
     * @hide
     * @method setManuallyScheduled
     */
    /**
     * @hide
     * @method setManuallyScheduledWithoutPropagation
     */
    /**
     * @hide
     * @method setPercentDoneWithoutPropagation
     */
    /**
     * @hide
     * @method setResizable
     */
    /**
     * @hide
     * @method setRollup
     */
    /**
     * @hide
     * @method getRollup
     */
    /**
     * @hide
     * @method setSchedulingModeWithoutPropagation
     */
    /**
     * @hide
     * @method setSegmentsWithoutPropagation
     */
    /**
     * @hide
     * @method unassign
     */
    /**
     * @hide
     * @method adjustToCalendar
     */
    /**
     * @hide
     * @method convertToMilestoneWithoutPropagation
     */
    /**
     * @hide
     * @method convertToRegularWithoutPropagation
     */
    /**
     * @hide
     * @method getActualCost
     */
    /**
     * @hide
     * @method getActualEffort
     */
    /**
     * @hide
     * @method getBaselineEffort
     */
    /**
     * @hide
     * @method getConstraintDate
     */
    /**
     * @hide
     * @method getConstraintType
     */
    /**
     * @hide
     * @method getEndSlack
     */
    /**
     * @hide
     * @method getFreeSlack
     */
    /**
     * @hide
     * @method getPreviousSiblingsTotalCount
     */
    /**
     * @hide
     * @method getProject
     */
    /**
     * @hide
     * @method getProjectCalendar
     */
    /**
     * @hide
     * @method getSegmentByDate
     */
    /**
     * @hide
     * @method getSegments
     */
    /**
     * @hide
     * @method getStartSlack
     */
    /**
     * @hide
     * @method getTotalSlack
     */
    /**
     * @hide
     * @method hasDependencies
     */
    /**
     * @hide
     * @method isCompleted
     */
    /**
     * @hide
     * @method isCritical
     */
    /**
     * @hide
     * @method isDraggable
     */
    /**
     * @hide
     * @method isEditable
     */
    /**
     * @hide
     * @method isInProgress
     */
    /**
     * @hide
     * @method isReadOnly
     */
    /**
     * @hide
     * @cfg actualCostField
     */
    /**
     * @hide
     * @cfg actualEffortField
     */
    /**
     * @hide
     * @cfg autoCalculateCost
     */
    /**
     * @hide
     * @cfg autoCalculateCostForParentTask
     */
    /**
     * @hide
     * @cfg baselineCostField
     */
    /**
     * @hide
     * @cfg baselineEffortField
     */
    /**
     * @hide
     * @cfg clsField
     */
    /**
     * @hide
     * @cfg costField
     */
    /**
     * @hide
     * @cfg costVarianceField
     */
    /**
     * @hide
     * @cfg deadlineDateField
     */
    /**
     * @hide
     * @cfg effortVarianceField
     */
    /**
     * @hide
     * @cfg nameField
     */
    /**
     * @hide
     * @cfg noteField
     */
    /**
     * @hide
     * @cfg segmentsField
     */
    /**
     * @hide
     * @cfg showInTimelineField
     */
});
