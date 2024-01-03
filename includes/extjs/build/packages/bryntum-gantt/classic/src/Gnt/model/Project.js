/**
 * This class represents a single Project in your Gantt chart.
 *
 * The inheritance hierarchy of this class includes {@link Gnt.model.Task}, {@link Sch.model.Customizable} and {@link Ext.data.Model} classes.
 * This class will also receive a set of methods and additional fields that stem from the {@link Ext.data.NodeInterface}.
 * Please refer to the documentation of those classes to become familiar with the base interface of this class.
 */
Ext.define('Gnt.model.Project', {
    extend                  : 'Gnt.model.Task',

    alias                   : 'gntmodel.project',

    /**
     * @property {Boolean} isProject Indicates that this is a project model.
     * Can be used in heterogeneous stores to distinguish project records from task ones.
     */
    isProject               : true,

    /**
     * @cfg {String} descriptionField The name of the {@link #Description} field.
     */
    descriptionField        : 'Note',

    /**
     * @cfg {String} allowDependenciesField The name of the {@link #AllowDependencies} field.
     */
    allowDependenciesField  : 'AllowDependencies',

    /**
     * @cfg {String} scheduleBackwardsField The name of the {@link #ScheduleBackwards} field.
     */
    scheduleBackwardsField  : 'ScheduleBackwards',

    customizableFields      : [
        /**
         * @field
         * The description of the project, this field maps to the task {@link #Note} field.
         */
        { name : 'Description', type : 'string' },
        /**
         * @field
         * This field indicates if the project tasks are allowed to have dependencies with tasks of another project.
         */
        { name : 'AllowDependencies', persist : false, type : 'bool', defaultValue : false },
        /**
         * @field
         * This field indicates if the project is scheduled from its end to start.
         */
        { name : 'ScheduleBackwards', type : 'bool', defaultValue : false }
    ],

    recognizedSchedulingModes : ['Normal'],
    convertEmptyParentToLeaf  : false,

    startDateIsInvalid : false,
    endDateIsInvalid   : false,

    /**
     * Checks if the given project field is editable. You can subclass this class and override this method to provide your own logic.
     * **Please pay attention** that in contrast to the task model {@link Gnt.modelTask#isEditable isEditable} this method on the project level
     * returns `false` by default. Which means that after subclassing the class and adding new fields the one needs to explicitly handle them in this method to make the fields editable.
     */
    isEditable : function (fieldName) {
        // some fields doesn't make sense to edit for a project
        switch (fieldName) {
            case this.nameField:
            case this.readOnlyField:
            case this.durationField:
            case this.durationUnitField:
            case this.descriptionField:
            case this.allowDependenciesField:
            case this.scheduleBackwardsField:
            case this.calendarIdField:
            case this.clsField:
            case this.manuallyScheduledField:
            case this.showInTimelineField:
                return this.callParent(arguments);
            // start date of the project is editable if:
            // - project is scheduled from start to end (otherwise start date is auto-calculated)
            // - or it's manually scheduled
            case this.startDateField:
                return (!this.getScheduleBackwards() || this.isManuallyScheduled()) && this.callParent(arguments);
            // end date of the project is editable if:
            // - project is scheduled from end to start (otherwise end date is auto-calculated)
            // - or it's manually scheduled
            case this.endDateField:
                return (this.getScheduleBackwards() || this.isManuallyScheduled()) && this.callParent(arguments);
            default :
                return false;
        }
    },


    /**
     * @method getScheduleBackwards
     * Indicates if the project is scheduled from its end to start.
     * @return {Boolean} `True` if the project is scheduled from its end to start.
     */
    /**
     * @propagating
     * @method setScheduleBackwards
     * Sets if the project should be scheduled from its end to start.
     * @param {Boolean} value `True` to schedule the project its end to start.
     */

    setScheduleBackwards : function (value) {
        var me = this;

        me.propagateChanges(function () {
            me.set(me.scheduleBackwardsField, value);

            // mark all nested tasks as required re-scheduling
            me.cascadeChildren(function (task) {
                task.markForRescheduling();
            });

            return me;
        }, null, null, null, /*forceMoveParentAsGroup*/true);
    },

    getScheduleBackwards : function () {
        // This method is explicitly added here since we have method w/ the same name in Task model
        // (so we're avoiding infinite recursion)
        return this.get(this.scheduleBackwardsField);
    },

    /*
     * @method setReadOnly
     * Sets if the given project is read only. All underlying tasks will be considered as read only as well.
     *
     * @param {String} value `True` to mark the project as read only.
     */

    setStartDate : function (date, keepDuration, skipNonWorkingTime, callback) {
        var me  = this;

        me.propagateChanges(
            function () {
                var result = me.setStartDateWithoutPropagation(date, keepDuration, skipNonWorkingTime);

                // Make sure that ongoing propagation will reschedule all the nested tasks if needed
                me.maybeMarkChildrenForRescheduling();

                return result;
            },
            callback
        );
    },

    setStartEndDate : function (startDate, endDate, skipNonWorkingTime, callback) {
        var me  = this;

        me.propagateChanges(
            function() {
                var result = me.setStartEndDateWithoutPropagation(startDate, endDate, skipNonWorkingTime);

                // Make sure that ongoing propagation will reschedule all the nested tasks if needed
                me.maybeMarkChildrenForRescheduling();

                return result;
            },
            callback
        );
    },

    setEndDate : function (date, keepDuration, skipNonWorkingTime, callback) {
        var me  = this;

        me.propagateChanges(
            function() {
                var result = me.setEndDateWithoutPropagation(date, keepDuration, skipNonWorkingTime);

                // Make sure that ongoing propagation will reschedule all the nested tasks if needed
                me.maybeMarkChildrenForRescheduling();

                return result;
            },
            callback
        );
    },

    isChildrenReschedulingNeeded : function () {
        var me      = this,
            newData = me.getProjection();

        return newData && ((me.getScheduleBackwards() ? newData[me.endDateField] : newData[me.startDateField]) || newData.hasOwnProperty(me.scheduleBackwardsField));
    },

    /**
     * @private
     * Marks nested tasks as requiring rescheduling if the project start date (finish date for backward scheduling) has been changed
     * in the ongoing propagation.
     */
    maybeMarkChildrenForRescheduling : function () {
        var me = this;

        if (me.isChildrenReschedulingNeeded()) {
            // Make sure that ongoing propagation will reschedule all the nested tasks
            me.cascadeChildren(function (task) {
                task.markForRescheduling();
            });
        }
    },

    isInvalidatingStartDate : function () {
        return this.startDateIsInvalid;
    },

    isInvalidatingEndDate : function () {
        return this.endDateIsInvalid;
    },

    /**
     * @private
     * The method is called to invalidate the calculated project border (end date for forward scheduled projects and start date - for backward scheduled ones).
     * It's used during the propagation.
     */
    startInvalidatingRange : function () {
        var me = this;

        if (!me.isManuallyScheduled()) {
            if (me.getScheduleBackwards()) {
                me.startDateIsInvalid = true;
            } else {
                me.endDateIsInvalid = true;
            }
        }
    },

    /**
     * @private
     * The method is called to indicated that the calculated project border (end date for forward scheduled projects and start date - for backward scheduled ones)
     * is stable and can be used.
     * It's used during the propagation.
     */
    finishInvalidatingRange : function () {
        var me = this;

        if (!me.isManuallyScheduled()) {
            if (me.getScheduleBackwards()) {
                me.startDateIsInvalid = false;
            } else {
                me.endDateIsInvalid = false;
            }
        }
    },

    /**
     * Do not allow to indent/outdent project nodes
     * @hide
     */
    indent : Ext.emptyFn,

    /**
     * @hide
     */
    outdent : Ext.emptyFn,

    // Projects cannot be restricted w/ constraints
    maybePinWithoutPropagation : Ext.emptyFn

    /**
     * @hide
     * @field ActualCost
     */
    /**
     * @hide
     * @field ActualEffort
     */
    /**
     * @hide
     * @field BaselineCost
     */
    /**
     * @hide
     * @field BaselineEffort
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
     * @field Duration
     */
    /**
     * @hide
     * @field DurationUnit
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
     * @field SchedulingMode
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
     * @cfg autoCalculateEffortForParentTask
     */
    /**
     * @hide
     * @cfg autoCalculatePercentDoneForParentTask
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
     * @cfg durationField
     */
    /**
     * @hide
     * @cfg durationUnitField
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
     * @cfg effortVarianceField
     */
    /**
     * @hide
     * @cfg schedulingModeField
     */
    /**
     * @hide
     * @cfg segmentsField
     */


    /**
     * @hide
     * @method addPredecessor
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
     * @method getActualCost
     */
    /**
     * @hide
     * @method getActualEffort
     */
    /**
     * @hide
     * @method getAssignmentFor
     */
    /**
     * @hide
     * @method getAssignments
     */
    /**
     * @hide
     * @method getBaselineEffort
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
     * @method getConstraintClass
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
     * @method getCost
     */
    /**
     * @hide
     * @method getCostVariance
     */
    /**
     * @hide
     * @method getDeadlineDate
     */
    /**
     * @hide
     * @method getDuration
     */
    /**
     * @hide
     * @method getDurationUnit
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
     * @method getEffortVariance
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
     * @method getLateEndDate
     */
    /**
     * @hide
     * @method getLateStartDate
     */
    /**
     * @hide
     * @method getProject
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
     * @method hasAssignments
     */
    /**
     * @hide
     * @method hasConstraint
     */
    /**
     * @hide
     * @method hasResources
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
     * @method isCritical
     */
    /**
     * @hide
     * @method isMilestone
     */
    /**
     * @hide
     * @method isSegmented
     */
    /**
     * @hide
     * @method merge
     */
    /**
     * @hide
     * @method reassign
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
     * @method setCost
     */
    /**
     * @hide
     * @method setDeadlineDate
     */
    /**
     * @hide
     * @method setDuration
     */
    /**
     * @hide
     * @method setDurationUnit
     */
    /**
     * @hide
     * @method setDurationWithoutPropagation
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
     * @method setEffortWithoutPropagation
     */
    /**
     * @hide
     * @method setSchedulingMode
     */
    /**
     * @hide
     * @method setSchedulingModeWithoutPropagation
     */
    /**
     * @hide
     * @method setSegments
     */
    /**
     * @hide
     * @method setSegmentsWithoutPropagation
     */
    /**
     * @hide
     * @method split
     */
    /**
     * @hide
     * @method unassign
     */
    /**
     * @hide
     * @method getAllDependencies
     */
    /**
     * @hide
     * @method getIncomingDependencies
     */
    /**
     * @hide
     * @method getOutgoingDependencies
     */
    /**
     * @hide
     * @method hasDependencies
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
     * @method getPredecessors
     */
    /**
     * @hide
     * @method getSuccessors
     */
    /**
     * @hide
     * @method linkTo
     */
    /**
     * @hide
     * @method unlinkFrom
     */

});
