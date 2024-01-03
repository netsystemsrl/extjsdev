/**
 * English translations for the Gantt component
 * including English translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Gnt.locale.En', {
    extend    : 'Sch.locale.Locale',
    requires  : 'Sch.locale.En',
    singleton : true,

    l10n : {
        'Gnt.util.DurationParser' : {
            unitsRegex : {
                MILLI   : /^ms$|^mil/i,
                SECOND  : /^s$|^sec/i,
                MINUTE  : /^m$|^min/i,
                HOUR    : /^h$|^hr$|^hour/i,
                DAY     : /^d$|^day/i,
                WEEK    : /^w$|^wk|^week/i,
                MONTH   : /^mo|^mnt/i,
                QUARTER : /^q$|^quar|^qrt/i,
                YEAR    : /^y$|^yr|^year/i
            }
        },

        'Gnt.util.DependencyParser' : {
            typeText : {
                SS : 'SS',
                SF : 'SF',
                FS : 'FS',
                FF : 'FF'
            }
        },

        'Gnt.panel.Timeline' : {
            start : 'Start',
            end   : 'End',
            format : 'm/d/Y'
        },

        'Gnt.field.ShowInTimeline' : {
            yes : 'Yes',
            no  : 'No'
        },

        'Gnt.column.ShowInTimeline' : {
            text : 'Show in timeline'
        },

        'Gnt.field.ConstraintType' : {
            none : 'None',
            invalidText : 'Invalid value'
        },

        'Gnt.field.Duration' : {
            invalidText : 'Invalid value'
        },

        'Gnt.field.Cost' : {
            invalidText         : 'Invalid value',
            currencySymbol      : '$',
            currencySymbolAlign : 'left'
        },

        'Gnt.field.Effort' : {
            invalidText : 'Invalid effort value'
        },

        'Gnt.field.Percent' : {
            invalidText : 'Invalid value'
        },

        'Gnt.field.SchedulingMode' : {
            Normal              : 'Normal',
            FixedDuration       : 'Fixed duration',
            EffortDriven        : 'Effort driven',
            DynamicAssignment   : 'Dynamic assignment',
            invalidText         : 'Invalid value'
        },

        'Gnt.template.Deadline' : {
            deadline : 'Deadline'
        },

        'Gnt.column.DeadlineDate' : {
            text : 'Deadline'
        },

        'Gnt.Tooltip' : {
            startText    : 'Starts: ',
            endText      : 'Ends: ',
            durationText : 'Duration: '
        },

        'Gnt.template.TaskTooltip' : {
            startText    : 'Start',
            endText      : 'End',
            percentText  : 'Complete',
            format       : 'm/d/Y',
            overflowText : 'There {[values.nbrOverflowing > 1 ? "are" : "is"]} {nbrOverflowing} more {[values.nbrOverflowing > 1 ? "tasks" : "task"]}'
        },

        'Gnt.plugin.ProjectLines' : {
            startOf : 'Start of:',
            endOf   : 'End of:'
        },

        'Gnt.plugin.TaskContextMenu' : {
            taskInformation    : 'Task information...',
            projectInformation : 'Project information...',
            newTaskText        : 'New task',
            deleteTask         : 'Delete task(s)',
            editLeftLabel      : 'Edit left label',
            editRightLabel     : 'Edit right label',
            add                : 'Add...',
            deleteDependency   : 'Delete dependency...',
            addTaskAbove       : 'Task above',
            addTaskBelow       : 'Task below',
            addMilestone       : 'Milestone',
            addSubtask         : 'Sub-task',
            addSuccessor       : 'Successor',
            addPredecessor     : 'Predecessor',
            convertToMilestone : 'Convert to milestone',
            convertToRegular   : 'Convert to regular task',
            splitTask          : 'Split task'
        },

        'Gnt.plugin.DependencyEditor' : {
            fromText         : 'From',
            toText           : 'To',
            typeText         : 'Type',
            lagText          : 'Lag',
            endToStartText   : 'Finish-To-Start',
            startToStartText : 'Start-To-Start',
            endToEndText     : 'Finish-To-Finish',
            startToEndText   : 'Start-To-Finish',
            okButtonText     : 'Ok',
            cancelButtonText : 'Cancel',
            deleteButtonText : 'Delete'
        },

        'Gnt.widget.calendar.Calendar' : {
            format                    : 'm/d/Y',
            dateInTextFormat          : 'M j, Y',
            dayOverrideNameHeaderText : 'Name',
            overrideName              : 'Name',
            startDate                 : 'Start Date',
            endDate                   : 'End Date',
            error                     : 'Error',
            dateText                  : 'Date',
            addText                   : 'Add',
            editText                  : 'Edit',
            removeText                : 'Remove',
            workingDayText            : 'Working day',
            weekendsText              : 'Weekends',
            overriddenDayText         : 'Overridden day',
            overriddenWeekText        : 'Overridden week',
            workingTimeText           : 'Working time',
            nonworkingTimeText        : 'Non-working time',
            dayOverridesText          : 'Day overrides',
            weekOverridesText         : 'Week overrides',
            okText                    : 'OK',
            cancelText                : 'Cancel',
            parentCalendarText        : 'Parent calendar',
            noParentText              : 'No parent',
            selectParentText          : 'Select parent',
            newDayName                : '[Without name]',
            calendarNameText          : 'Calendar name',
            isProjectCalendarText     : 'Project calendar',
            tplTexts                  : {
                tplWorkingHours  : 'Working hours for',
                tplIsNonWorking  : 'is non-working',
                tplOverride      : 'override',
                tplInCalendar    : 'in calendar',
                tplDayInCalendar : 'standard day in calendar',
                tplBasedOn       : 'Based on'
            },
            overrideErrorText         : 'There is already an override for this day',
            overrideDateError         : 'There is already a week override on this date: {0}',
            startAfterEndError        : 'Start date should be less than end date',
            weeksIntersectError       : 'Week overrides should not intersect'
        },

        'Gnt.widget.calendar.AvailabilityGrid' : {
            startText  : 'Start',
            endText    : 'End',
            addText    : 'Add',
            removeText : 'Remove',
            error      : 'Error'
        },

        'Gnt.widget.calendar.DayEditor' : {
            workingTimeText    : 'Working time',
            nonworkingTimeText : 'Non-working time'
        },

        'Gnt.widget.calendar.WeekEditor' : {
            defaultTimeText    : 'Default time',
            workingTimeText    : 'Working time',
            nonworkingTimeText : 'Non-working time',
            error              : 'Error',
            noOverrideError    : "Week override contains only 'default' days - can't save it"
        },

        'Gnt.widget.calendar.ResourceCalendarGrid' : {
            name     : 'Name',
            calendar : 'Calendar'
        },

        'Gnt.widget.calendar.CalendarWindow' : {
            title  : 'Calendar',
            ok     : 'Ok',
            cancel : 'Cancel'
        },

        'Gnt.widget.calendar.CalendarManager' : {
            addText         : 'Add',
            removeText      : 'Remove',
            add_child       : 'Add child',
            add_node        : 'Add calendar',
            add_sibling     : 'Add sibling',
            remove          : 'Remove',
            calendarName    : 'Calendar',
            confirm_action  : 'Confirm action',
            confirm_message : 'Calendar has unsaved changes. Would you like to save your changes?'
        },

        'Gnt.widget.calendar.CalendarManagerWindow' : {
            title           : 'Calendar manager',
            ok              : 'Apply changes',
            cancel          : 'Close',
            confirm_action  : 'Confirm action',
            confirm_message : 'Calendar has unsaved changes. Would you like to save your changes?'
        },

        'Gnt.field.Assignment' : {
            cancelText : 'Cancel',
            closeText  : 'Save and Close'
        },

        'Gnt.column.AssignmentUnits' : {
            text : 'Units'
        },

        'Gnt.column.Duration' : {
            text : 'Duration'
        },

        'Gnt.column.Effort' : {
            text : 'Effort'
        },

        'Gnt.column.BaselineEffort' : {
            text : 'Baseline Effort'
        },

        'Gnt.column.ActualEffort' : {
            text : 'Actual Effort'
        },

        'Gnt.column.EffortVariance' : {
            text : 'Effort Variance'
        },

        'Gnt.column.Cost' : {
            text : 'Cost'
        },

        'Gnt.column.BaselineCost' : {
            text : 'Baseline Cost'
        },

        'Gnt.column.ActualCost' : {
            text : 'Actual Cost'
        },

        'Gnt.column.CostVariance' : {
            text                : 'Cost Variance',
            currencySymbol      : '$',
            currencySymbolAlign : 'left'
        },

        'Gnt.column.EndDate' : {
            text : 'Finish'
        },

        'Gnt.column.PercentDone' : {
            text : '% Done'
        },

        'Gnt.column.ResourceAssignment' : {
            text : 'Assigned Resources'
        },

        'Gnt.column.ResourceName' : {
            text : 'Resource Name'
        },

        'Gnt.column.Rollup' : {
            text : 'Rollup task',
            no   : 'No',
            yes  : 'Yes'
        },

        'Gnt.field.ManuallyScheduled' : {
            yes : 'Yes',
            no  : 'No'
        },

        'Gnt.field.ReadOnly' : {
            yes : 'Yes',
            no  : 'No'
        },

        'Gnt.column.ManuallyScheduled' : {
            text : 'Manual mode'
        },

        'Gnt.column.SchedulingMode' : {
            text : 'Mode'
        },

        'Gnt.column.Predecessor' : {
            text : 'Predecessors'
        },

        'Gnt.column.Successor' : {
            text : 'Successors'
        },

        'Gnt.column.StartDate' : {
            text : 'Start'
        },

        'Gnt.column.WBS' : {
            text : 'WBS'
        },

        'Gnt.column.Sequence' : {
            text : '#'
        },

        'Gnt.column.Calendar' : {
            text : 'Calendar'
        },

        'Gnt.column.ReadOnly' : {
            text : 'Read Only'
        },

        'Gnt.widget.taskeditor.ProjectForm' : {
            nameText                : 'Name',
            startText               : 'Start',
            finishText              : 'Finish',
            calendarText            : 'Calendar',
            readOnlyText            : 'Read Only',
            allowDependenciesText   : 'Allow cross-project dependencies',
            'Schedule from'         : 'Schedule from'
        },

        'Gnt.widget.taskeditor.TaskForm' : {
            taskNameText            : 'Name',
            durationText            : 'Duration',
            datesText               : 'Dates',
            baselineText            : 'Baseline',
            startText               : 'Start',
            finishText              : 'Finish',
            percentDoneText         : 'Percent Complete',
            baselineStartText       : 'Start',
            baselineFinishText      : 'Finish',
            baselinePercentDoneText : 'Percent Complete',
            baselineEffortText      : 'Effort',
            effortText              : 'Effort',
            invalidEffortText       : 'Invalid effort value',
            calendarText            : 'Calendar',
            manuallyScheduledText   : 'Manually Scheduled',
            schedulingModeText      : 'Scheduling Mode',
            rollupText              : 'Rollup',
            wbsCodeText             : 'WBS code',
            "Constraint Type"       : "Constraint Type",
            "Constraint Date"       : "Constraint Date",
            readOnlyText            : 'Read Only'
        },

        'Gnt.widget.DependencyGrid' : {
            addDependencyText         : 'Add new',
            dropDependencyText        : 'Remove',
            idText                    : 'ID',
            snText                    : 'SN',
            taskText                  : 'Task Name',
            blankTaskText             : 'Please select task',
            invalidDependencyText     : 'Invalid dependency',
            parentChildDependencyText : 'Dependency between child and parent found',
            duplicatingDependencyText : 'Duplicate dependency found',
            transitiveDependencyText  : 'Transitive dependency',
            cyclicDependencyText      : 'Cyclic dependency',
            typeText                  : 'Type',
            lagText                   : 'Lag',
            clsText                   : 'CSS class',
            endToStartText            : 'Finish-To-Start',
            startToStartText          : 'Start-To-Start',
            endToEndText              : 'Finish-To-Finish',
            startToEndText            : 'Start-To-Finish',
            predecessorsText          : 'Predecessors',
            successorsText            : 'Successors'
        },

        'Gnt.widget.AssignmentEditGrid' : {
            confirmAddResourceTitle        : 'Confirm',
            confirmAddResourceText         : 'Resource &quot;{0}&quot; not found in list. Would you like to add it?',
            noValueText                    : 'Please select resource to assign',
            noResourceText                 : 'No resource &quot;{0}&quot; found in the list',
            'Resource is already assigned' : 'Resource is already assigned',
            addAssignmentText  : 'Add new',
            dropAssignmentText : 'Remove'
        },

        'Gnt.widget.taskeditor.TaskEditor' : {
            generalText        : 'General',
            resourcesText      : 'Resources',
            notesText          : 'Notes',
            advancedText       : 'Advanced'
        },

        'Gnt.widget.taskeditor.ProjectEditor' : {
            generalText        : 'General',
            descriptionText    : 'Description'
        },

        'Gnt.plugin.taskeditor.BaseEditor' : {
            title        : 'Task Information',
            alertCaption : 'Information',
            alertText    : 'Please correct marked errors to save changes',
            okText       : 'Ok',
            cancelText   : 'Cancel'
        },

        'Gnt.plugin.taskeditor.ProjectEditor' : {
            title : 'Project Information'
        },

        'Gnt.field.EndDate' : {
            endBeforeStartText : 'End date is before start date'
        },

        'Gnt.field.ConstraintDate' : {
            format : 'm/d/Y H:i'
        },

        'Gnt.column.Note' : {
            text : 'Note'
        },

        'Gnt.column.AddNew' : {
            text : 'Add new column...'
        },

        'Gnt.column.EarlyStartDate' : {
            text : 'Early Start'
        },

        'Gnt.column.EarlyEndDate' : {
            text : 'Early Finish'
        },

        'Gnt.column.LateStartDate' : {
            text : 'Late Start'
        },

        'Gnt.column.LateEndDate' : {
            text : 'Late Finish'
        },

        'Gnt.field.Calendar' : {
            calendarNotApplicable : 'Task calendar has no overlapping with assigned resources calendars',
            invalidText : 'Invalid value'
        },

        'Gnt.field.ScheduleBackwards' : {
            'Project start date'  : 'Project start date',
            'Project finish date' : 'Project finish date'
        },

        'Gnt.column.Slack' : {
            text : 'Free Slack'
        },

        'Gnt.column.TotalSlack' : {
            text : 'Total Slack'
        },

        'Gnt.column.Name' : {
            text        : 'Task Name'
        },

        'Gnt.column.BaselineStartDate' : {
            text : 'Baseline Start Date'
        },

        'Gnt.column.BaselineEndDate' : {
            text : 'Baseline End Date'
        },

        'Gnt.column.Milestone' : {
            text : 'Milestone'
        },

        'Gnt.field.Milestone' : {
            yes : 'Yes',
            no  : 'No'
        },

        'Gnt.field.Dependency' : {
            invalidFormatText     : 'Invalid dependency format',
            invalidDependencyText : 'Invalid dependency found, please make sure you have no cyclic paths between your tasks',
            invalidDependencyType : 'Invalid dependency type {0}. Allowed values are: {1}.'
        },

        'Gnt.constraint.Base' : {
            name                                           : "A constraint",
            // {0} constraint name
            "Remove the constraint"                        : "Continue. Remove the {0} constraint",
            "Cancel the change and do nothing"             : "Cancel the change and do nothing",
            // {0} task name, {1} constraint name
            "This action will cause a scheduling conflict" : 'This action will cause a scheduling conflict for summary task "{0}". The {1} constraint on the summary task puts it in conflict with one of its subtasks.'
        },

        'Gnt.constraint.AsLateAsPossible' : {
            name : 'As late as possible'
        },

        'Gnt.constraint.AsSoonAsPossible' : {
            name : 'As soon as possible'
        },

        'Gnt.constraint.implicit.Dependency' : {
            // {0} dependency type
            // {1} from task
            // {2} to task
            'You moved the task away'             : 'You moved the task "{2}" away from "{1}" and the two tasks are linked ({0}). As a result the link between the tasks will not drive the later task position.',
            'You moved the task before'           : 'You moved the task "{2}" before "{1}" and the two tasks are linked ({0}). As a result the link cannot be honored.',
            'Remove the constraint'               : 'Remove the dependency',
            depType0                              : 'Start-To-Start',
            depType1                              : 'Start-To-Finish',
            depType2                              : 'Finish-To-Start',
            depType3                              : 'Finish-To-Finish',
            'Keep the dependency & move the task' : 'Keep the dependency and move the task to {0}'
        },

        'Gnt.constraint.implicit.PotentialConflict' : {
            'This could result in a scheduling conflict' : 'You set a {0} constraint on the task "{1}". This could result in a scheduling conflict since the task has a predecessor.',
            'Remove the constraint'                      : 'Continue. Set the {0} constraint',
            'Replace the constraint'                     : 'Continue but avoid the conflict by using a {0} constraint instead'
        },

        'Gnt.constraint.FinishNoEarlierThan' : {
            name                             : "Finish no earlier than",
            "Move the task to finish on {0}" : "Move the task to finish on {0}"
        },

        "Gnt.constraint.FinishNoLaterThan" : {
            name                             : "Finish no later than",
            "Move the task to finish on {0}" : "Move the task to finish on {0}"
        },

        "Gnt.constraint.MustFinishOn" : {
            name                             : "Must finish on",
            "Move the task to finish on {0}" : "Move the task to finish on {0}"
        },

        "Gnt.constraint.MustStartOn" : {
            name                            : "Must start on",
            "Move the task to start at {0}" : "Move the task to start at {0}"
        },

        "Gnt.constraint.StartNoEarlierThan" : {
            name                            : "Start no earlier than",
            "Move the task to start at {0}" : "Move the task to start at {0}"
        },

        "Gnt.constraint.StartNoLaterThan" : {
            name                            : "Start no later than",
            // {0} potential start date
            "Move the task to start at {0}" : "Move the task to start at {0}"
        },

        "Gnt.column.ConstraintDate" : {
            text   : "Constraint date",
            format : 'm/d/Y H:i'
        },

        "Gnt.column.ConstraintType" : {
            text : "Constraint"
        },

        "Gnt.widget.ConstraintResolutionForm" : {
            dateFormat                             : "m/d/Y H:i",
            "OK"                                   : "OK",
            "Cancel"                               : "Cancel",
            "Resolution options"                   : "Resolution options",
            "Don't ask again"                      : "Don't ask again",
            // {0} task name, {1} constraint name
            "Task {0} violates constraint {1}"     : "Task \"{0}\" violates constraint {1}",
            // {0} task name, {1} constraint name, {2} constraint date
            "Task {0} violates constraint {1} {2}" : "Task \"{0}\" violates constraint {1} {2}"
        },

        "Gnt.widget.ConstraintResolutionWindow" : {
            "Constraint violation" : "Constraint violation"
        },

        "Gnt.panel.ResourceHistogram" : {
            resourceText : 'Resource'
        },

        "Gnt.panel.ResourceUtilization" : {
            "calculating {0}% done" : "calculating {0}% done"
        }
    },


    apply : function (classNames) {
        // apply corresponding scheduler locale first
        Sch.locale.En.apply(classNames);
        this.callParent(arguments);
    }

});
