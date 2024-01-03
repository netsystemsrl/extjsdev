/**
 * English translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Sch.locale.En', {
    extend    : 'Sch.locale.Locale',
    singleton : true,


    l10n : {
        'Sch.util.Date' : {
            unitNames : {
                YEAR    : { single : 'year', plural : 'years', abbrev : 'yr' },
                QUARTER : { single : 'quarter', plural : 'quarters', abbrev : 'q' },
                MONTH   : { single : 'month', plural : 'months', abbrev : 'mon' },
                WEEK    : { single : 'week', plural : 'weeks', abbrev : 'w' },
                DAY     : { single : 'day', plural : 'days', abbrev : 'd' },
                HOUR    : { single : 'hour', plural : 'hours', abbrev : 'h' },
                MINUTE  : { single : 'minute', plural : 'minutes', abbrev : 'min' },
                SECOND  : { single : 'second', plural : 'seconds', abbrev : 's' },
                MILLI   : { single : 'ms', plural : 'ms', abbrev : 'ms' }
            }
        },
        
        'Sch.model.CalendarDay' : {
            startTimeAfterEndTime                   : 'Start time {0} is greater than end time {1}',
            availabilityIntervalsShouldNotIntersect : 'Availability intervals should not intersect: [{0}] and [{1}]',
            invalidFormat                           : 'Invalid format for availability string: {0}. It should have exact format: hh:mm-hh:mm'
        },

        "Sch.panel.SchedulerTree" : {
            'All day'    : 'All day'
        },

        "Sch.panel.SchedulerGrid" : {
            'All day'    : 'All day'
        },

        'Sch.panel.TimelineGridPanel' : {
            weekStartDay : 1,
            loadingText  : 'Loading, please wait...',
            savingText   : 'Saving changes, please wait...'
        },

        'Sch.panel.TimelineTreePanel' : {
            weekStartDay : 1,
            loadingText  : 'Loading, please wait...',
            savingText   : 'Saving changes, please wait...'
        },

        'Sch.mixin.SchedulerView' : {
            loadingText : 'Loading events...'
        },

        'Sch.plugin.CurrentTimeLine' : {
            tooltipText : 'Current time'
        },

        //region Recurrence
        'Sch.widget.recurrence.ConfirmationDialog' : {
            'delete-title'              : 'You’re deleting an event',
            'delete-all-message'        : 'Do you want to delete all occurrences of this event?',
            'delete-further-message'    : 'Do you want to delete this and all future occurrences of this event, or only the selected occurrence?',
            'delete-all-btn-text'       : 'Delete All',
            'delete-further-btn-text'   : 'Delete All Future Events',
            'delete-only-this-btn-text' : 'Delete Only This Event',

            'update-title'              : 'You’re changing a repeating event',
            'update-all-message'        : 'Do you want to change all occurrences of this event?',
            'update-further-message'    : 'Do you want to change only this occurrence of the event, or this and all future occurrences?',
            'update-all-btn-text'       : 'All',
            'update-further-btn-text'   : 'All Future Events',
            'update-only-this-btn-text' : 'Only This Event',

            'Yes'    : 'Yes',
            'Cancel' : 'Cancel'
        },

        'Sch.widget.recurrence.Dialog' : {
            'Repeat event' : 'Repeat event',
            'Cancel'       : 'Cancel',
            'Save'         : 'Save'
        },

        'Sch.widget.recurrence.Form' : {
            'Frequency'           : 'Frequency',
            'Every'               : 'Every',
            'DAILYintervalUnit'   : 'day(s)',
            'WEEKLYintervalUnit'  : 'week(s) on:',
            'MONTHLYintervalUnit' : 'month(s)',
            'YEARLYintervalUnit'  : 'year(s) in:',
            'Each'                : 'Each',
            'On the'              : 'On the',
            'End repeat'          : 'End repeat',
            'time(s)'             : 'time(s)'
        },

        'Sch.widget.recurrence.field.DaysComboBox' : {
            'day'         : 'day',
            'weekday'     : 'weekday',
            'weekend day' : 'weekend day'
        },

        'Sch.widget.recurrence.field.PositionsComboBox' : {
            'position1'  : 'first',
            'position2'  : 'second',
            'position3'  : 'third',
            'position4'  : 'fourth',
            'position5'  : 'fifth',
            'position-1' : 'last'
        },

        'Sch.data.util.recurrence.Legend' : {
            // list delimiters
            ', '                            : ', ',
            ' and '                         : ' and ',
            // frequency patterns
            'Daily'                         : 'Daily',

            // Weekly on Sunday
            // Weekly on Sun, Mon and Tue
            'Weekly on {1}'                 : 'Weekly on {1}',

            // Monthly on 16
            // Monthly on the last weekday
            'Monthly on {1}'                : 'Monthly on {1}',

            // Yearly on 16 of January
            // Yearly on the last weekday of January and February
            'Yearly on {1} of {2}'          : 'Yearly on {1} of {2}',

            // Every 11 days
            'Every {0} days'                : 'Every {0} days',

            // Every 2 weeks on Sunday
            // Every 2 weeks on Sun, Mon and Tue
            'Every {0} weeks on {1}'        : 'Every {0} weeks on {1}',

            // Every 2 months on 16
            // Every 2 months on the last weekday
            'Every {0} months on {1}'       : 'Every {0} months on {1}',

            // Every 2 years on 16 of January
            // Every 2 years on the last weekday of January and February
            'Every {0} years on {1} of {2}' : 'Every {0} years on {1} of {2}',

            // day position translations
            'position1'                     : 'the first',
            'position2'                     : 'the second',
            'position3'                     : 'the third',
            'position4'                     : 'the fourth',
            'position5'                     : 'the fifth',
            'position-1'                    : 'the last',
            // day options
            'day'                           : 'day',
            'weekday'                       : 'weekday',
            'weekend day'                   : 'weekend day',
            // {0} - day position info ("the last"/"the first"/...)
            // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
            // For example:
            //  "the last Sunday"
            //  "the first weekday"
            //  "the second weekend day"
            'daysFormat'                    : '{0} {1}'
        },

        'Sch.widget.recurrence.field.StopConditionComboBox' : {
            'Never'   : 'Never',
            'After'   : 'After',
            'On date' : 'On date'
        },

        'Sch.widget.recurrence.field.FrequencyComboBox' : {
            'Daily'   : 'Daily',
            'Weekly'  : 'Weekly',
            'Monthly' : 'Monthly',
            'Yearly'  : 'Yearly'
        },

        'Sch.widget.recurrence.field.RecurrenceComboBox' : {
            'None'      : 'None',
            'Custom...' : 'Custom...'
        },

        'Sch.widget.EventEditor' : {
            'Repeat'      : 'Repeat',
            saveText      : 'Save',
            deleteText    : 'Delete',
            cancelText    : 'Cancel',
            nameText      : 'Name',
            allDayText    : 'All day',
            startDateText : 'Start',
            endDateText   : 'End',
            resourceText  : 'Resource'
        },
        //endregion Recurrence

        'Sch.plugin.SimpleEditor' : {
            newEventText : 'New booking...'
        },

        'Sch.widget.ExportDialogForm' : {
            formatFieldLabel         : 'Paper format',
            orientationFieldLabel    : 'Orientation',
            rangeFieldLabel          : 'Schedule range',
            showHeaderLabel          : 'Show header',
            showFooterLabel          : 'Show footer',
            orientationPortraitText  : 'Portrait',
            orientationLandscapeText : 'Landscape',
            completeViewText         : 'Complete schedule',
            currentViewText          : 'Visible schedule',
            dateRangeText            : 'Date range',
            dateRangeFromText        : 'Export from',
            dateRangeToText          : 'Export to',
            exportersFieldLabel      : 'Control pagination',
            adjustCols               : 'Adjust column width',
            adjustColsAndRows        : 'Adjust column width and row height',
            specifyDateRange         : 'Specify date range',
            columnPickerLabel        : 'Select columns',
            completeDataText         : 'Complete schedule (for all events)',
            dpiFieldLabel            : 'DPI (dots per inch)',
            rowsRangeLabel           : 'Rows range',
            allRowsLabel             : 'All rows',
            visibleRowsLabel         : 'Visible rows',
            columnEmptyText          : '[no title]'
        },

        'Sch.widget.ExportDialog' : {
            title            : 'Export Settings',
            exportButtonText : 'Export',
            cancelButtonText : 'Cancel',
            progressBarText  : 'Exporting...'
        },

        'Sch.plugin.Export' : {
            generalError          : 'An error occurred',
            fetchingRows          : 'Fetching row {0} of {1}',
            builtPage             : 'Built page {0} of {1}',
            requestingPrintServer : 'Please wait...'
        },

        'Sch.plugin.Printable' : {
            dialogTitle          : 'Print settings',
            exportButtonText     : 'Print',
            disablePopupBlocking : 'Please disable pop-up blocker since the print-plugin needs to be able to open new tabs',
            popupBlockerDetected : 'Browser pop-up blocker detected'
        },

        'Sch.plugin.exporter.AbstractExporter' : {
            name : 'Exporter'
        },

        'Sch.plugin.exporter.SinglePage' : {
            name : 'Single page'
        },

        'Sch.plugin.exporter.MultiPageVertical' : {
            name : 'Multiple pages (vertically)'
        },

        'Sch.plugin.exporter.MultiPage' : {
            name : 'Multiple pages'
        },

        'Sch.plugin.Split' : {
            splitText : 'Split',
            mergeText : 'Hide split part'
        },

        'Sch.plugin.SummaryBar' : {
            totalText : 'Total'
        },

        'Sch.column.ResourceName' : {
            name : 'Name'
        },

        'Sch.template.DependencyInfo' : {
            fromText : 'From',
            toText   : 'To'
        },

        // -------------- View preset date formats/strings -------------------------------------
        'Sch.preset.Manager' : {
            hourAndDay : {
                displayDateFormat : 'G:i',
                middleDateFormat  : 'G:i',
                topDateFormat     : 'D d/m'
            },

            secondAndMinute : {
                displayDateFormat : 'g:i:s',
                topDateFormat     : 'D, d g:iA'
            },

            dayAndWeek : {
                displayDateFormat : 'm/d h:i A',
                middleDateFormat  : 'D d M'
            },

            weekAndDay : {
                displayDateFormat : 'm/d',
                bottomDateFormat  : 'd M',
                middleDateFormat  : 'Y F d'
            },

            weekAndMonth : {
                displayDateFormat : 'm/d/Y',
                middleDateFormat  : 'm/d',
                topDateFormat     : 'm/d/Y'
            },

            weekAndDayLetter : {
                displayDateFormat : 'm/d/Y',
                middleDateFormat  : 'D d M Y'
            },

            weekDateAndMonth : {
                displayDateFormat : 'm/d/Y',
                middleDateFormat  : 'd',
                topDateFormat     : 'Y F'
            },

            monthAndYear : {
                displayDateFormat : 'm/d/Y',
                middleDateFormat  : 'M Y',
                topDateFormat     : 'Y'
            },

            year : {
                displayDateFormat : 'm/d/Y',
                middleDateFormat  : 'Y'
            },

            manyYears : {
                displayDateFormat : 'm/d/Y',
                middleDateFormat  : 'Y'
            }
        }
    }
});
