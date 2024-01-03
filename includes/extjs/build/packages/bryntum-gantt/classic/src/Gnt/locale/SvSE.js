// @tag alternative-locale
/**
 * Swedish translations for the Gantt component
 * including Swedish translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Gnt.locale.SvSE', {
    extend    : 'Sch.locale.Locale',
    requires  : 'Sch.locale.SvSE',
    singleton : true,

    l10n : {
        'Gnt.util.DurationParser' : {
            unitsRegex : {
                MILLI   : /^ms$|^mil/i,
                SECOND  : /^s$|^sek/i,
                MINUTE  : /^m$|^min/i,
                HOUR    : /^t$|^tim/i,
                DAY     : /^d$|^dag/i,
                WEEK    : /^v$|^ve|^vecka/i,
                MONTH   : /^må|^mån/i,
                QUARTER : /^kv$|^kva/i,
                YEAR    : /^år/i
            }
        },

        'Gnt.util.DependencyParser' : {
            typeText : {
                SS : 'SS',
                SF : 'SA',
                FS : 'AS',
                FF : 'AA'
            }
        },

        'Gnt.panel.Timeline' : {
            start : 'Start',
            end   : 'Slut',
            format : 'Y-m-d'
        },

        'Gnt.field.ShowInTimeline' : {
            yes : 'Ja',
            no  : 'Nej'
        },

        'Gnt.column.ShowInTimeline' : {
            text : 'Lägg till i tidslinje'
        },

        'Gnt.field.ConstraintType' : {
            none : 'Ingen',
            invalidText : 'Ogiltig värde'
        },

        'Gnt.field.Duration' : {
            invalidText : 'Ogiltig värde'
        },

        'Gnt.field.Cost' : {
            invalidText         : 'Ogiltig värde',
            currencySymbol      : '€',
            currencySymbolAlign : 'left'
        },

        'Gnt.field.Effort' : {
            invalidText : 'Ogiltig värde'
        },

        'Gnt.field.ActualEffort' : {
            invalidText : 'Ogiltig värde'
        },

        'Gnt.field.Percent' : {
            invalidText : 'Ogiltig värde'
        },

        'Gnt.field.SchedulingMode' : {
            Normal              : 'Normal',
            FixedDuration       : 'Fast varaktighet',
            EffortDriven        : 'Insatsberoende',
            DynamicAssignment   : 'Variabel tilldelning',
            invalidText         : 'Ogiltig värde'
        },

        'Gnt.template.Deadline' : {
            deadline : 'Tidsgräns'
        },

        'Gnt.column.DeadlineDate' : {
            text : 'Tidsgräns'
        },

        'Gnt.Tooltip' : {
            startText    : 'Börjar: ',
            endText      : 'Slutar: ',
            durationText : 'Längd:'
        },

        'Gnt.template.TaskTooltip' : {
            startText    : 'Börjar',
            endText      : 'Slutar',
            percentText  : 'Färdig',
            format       : 'Y-m-d',
            overflowText : 'Det finns ytterligare {nbrOverflowing} {[values.nbrOverflowing > 1 ? "aktiviteter" : "aktivitet"]}'
        },

        'Gnt.plugin.ProjectLines' : {
            startOf : 'Början av:',
            endOf   : 'Slutet av:'
        },

        'Gnt.plugin.TaskContextMenu' : {
            taskInformation    : 'Information...',
            projectInformation : 'Projekt-information...',
            newTaskText        : 'Ny aktivitet',
            deleteTask         : 'Ta bort aktivitet(er)',
            editLeftLabel      : 'Ändra vänster text',
            editRightLabel     : 'Ändra höger text',
            add                : 'Lägg till...',
            deleteDependency   : 'Ta bort koppling...',
            addTaskAbove       : 'Aktivitet ovanför',
            addTaskBelow       : 'Aktivitet nedanför',
            addMilestone       : 'Milstolpe',
            addSubtask         : 'Underaktivitet',
            addSuccessor       : 'Efterföljare',
            addPredecessor     : 'Föregångare',
            convertToMilestone : 'Konvertera till milstolpe',
            convertToRegular   : 'Konvertera till vanlig aktivitet',
            splitTask          : 'Dela aktivitet'
        },

        'Gnt.plugin.DependencyEditor' : {
            fromText         : 'Från',
            toText           : 'Till',
            typeText         : 'Typ',
            lagText          : 'Fördröjning',
            endToStartText   : 'Slut-Till-Start',
            startToStartText : 'Start-Till-Start',
            endToEndText     : 'Slut-Till-Slut',
            startToEndText   : 'Start-Till-Slut',
            okButtonText     : 'Ok',
            cancelButtonText : 'Avbryt',
            deleteButtonText : 'Ta bort'
        },

        'Gnt.widget.calendar.Calendar' : {
            format                    : 'Y-m-d',
            dateInTextFormat          : 'M j, Y',
            dayOverrideNameHeaderText : 'Namn',
            overrideName              : 'Namn',
            startDate                 : 'Startdatum',
            endDate                   : 'Slutdatum',
            error                     : 'Fel',
            dateText                  : 'Datum',
            addText                   : 'Lägg till',
            editText                  : 'Ändra',
            removeText                : 'Ta bort',
            workingDayText            : 'Arbetstid',
            weekendsText              : 'Ej arbetstid',
            overriddenDayText         : 'Undantagsdag',
            overriddenWeekText        : 'Icke-standard arbetsvecka',
            workingTimeText           : 'Arbetstid',
            nonworkingTimeText        : 'Ledig tid',
            dayOverridesText          : 'Undantag - dag',
            weekOverridesText         : 'Undantag - vecka',
            okText                    : 'OK',
            cancelText                : 'Avbryt',
            parentCalendarText        : 'Baskalender',
            noParentText              : 'Ingen baskalender',
            selectParentText          : 'Välj baskalender',
            newDayName                : '[Inget namn]',
            calendarNameText          : 'Kalendernamn',
            isProjectCalendarText     : 'Projektkalender',
            tplTexts                  : {
                tplWorkingHours  : 'Arbetstimmar för',
                tplIsNonWorking  : 'ej arbetstid',
                tplOverride      : 'undantag',
                tplInCalendar    : 'i kalender',
                tplDayInCalendar : 'vanlig dag i kalender',
                tplBasedOn       : 'Baserat på'
            },
            overrideErrorText         : 'Det finns redan ett undantag för denna dagen',
            overrideDateError         : 'Det finns redan en undantagsvecka på det här datumet: {0}',
            startAfterEndError        : 'Startdatum måste vara tidigare än slutdatum',
            weeksIntersectError       : 'Undantagsveckor får inte överlappa'
        },

        'Gnt.widget.calendar.AvailabilityGrid' : {
            startText  : 'Start',
            endText    : 'Slut',
            addText    : 'Lägg till',
            removeText : 'Ta bort',
            error      : 'Fel'
        },

        'Gnt.widget.calendar.DayEditor' : {
            workingTimeText    : 'Arbetstid',
            nonworkingTimeText : 'Ej arbetstid'
        },

        'Gnt.widget.calendar.WeekEditor' : {
            defaultTimeText    : 'Vanlig tid',
            workingTimeText    : 'Arbetstid',
            nonworkingTimeText : 'Ej arbetstid',
            error              : 'Fel',
            noOverrideError    : "Undantagsveckan innehåller bara 'vanliga' dagar - kan inte sparas"
        },

        'Gnt.widget.calendar.ResourceCalendarGrid' : {
            name     : 'Namn',
            calendar : 'Kalender'
        },

        'Gnt.widget.calendar.CalendarWindow' : {
            title  : 'Kalender',
            ok     : 'Ok',
            cancel : 'Avbryt'
        },

        'Gnt.widget.calendar.CalendarManager' : {
            addText         : 'Lägg till',
            removeText      : 'Ta bort',
            add_child       : 'Lägg till underkalender',
            add_node        : 'Lägg till kalender',
            add_sibling     : 'Lägg till kalender',
            remove          : 'Ta bort',
            calendarName    : 'Kalender',
            confirm_action  : 'Bekräfta',
            confirm_message : 'Det finns ändringar som inte sparats. Vill du spara dina ändringar?'
        },

        'Gnt.widget.calendar.CalendarManagerWindow' : {
            title           : 'Hantera kalendrar',
            confirm_action  : 'Bekräfta',
            confirm_message : 'Det finns ändringar som inte sparats. Vill du spara dina ändringar?',
            ok              : 'Applicera ändringar',
            cancel          : 'Stäng'
        },

        'Gnt.field.Assignment' : {
            cancelText : 'Avbryt',
            closeText  : 'Spara och stäng'
        },

        'Gnt.column.AssignmentUnits' : {
            text : 'Enheter'
        },

        'Gnt.column.Duration' : {
            text : 'Varaktighet'
        },

        'Gnt.column.Effort' : {
            text : 'Arbetsinsats'
        },

        'Gnt.column.BaselineEffort' : {
            text : 'Originalarbete'
        },

        'Gnt.column.ActualEffort' : {
            text : 'Verkligt arbete'
        },

        'Gnt.column.EffortVariance' : {
            text : 'Arbetsavvikelse'
        },

        'Gnt.column.Cost' : {
            text : 'Kostnad'
        },

        'Gnt.column.BaselineCost' : {
            text : 'Originalkostnad'
        },

        'Gnt.column.ActualCost' : {
            text : 'Verklig kostnad'
        },

        'Gnt.column.CostVariance' : {
            text                : 'Kostnadsavvikelse',
            currencySymbol      : '€',
            currencySymbolAlign : 'left'
        },

        'Gnt.column.EndDate' : {
            text : 'Slut'
        },

        'Gnt.column.PercentDone' : {
            text : '% Färdig'
        },

        'Gnt.column.ResourceAssignment' : {
            text : 'Tilldelade Resurser'
        },

        'Gnt.column.ResourceName' : {
            text : 'Resursnamn'
        },

        'Gnt.column.Rollup' : {
            text : 'Upplyft',
            yes  : 'Ja',
            no   : 'Nej'
        },

        'Gnt.field.ManuallyScheduled' : {
            yes : 'Ja',
            no  : 'Nej'
        },

        'Gnt.field.ReadOnly' : {
            yes : 'Ja',
            no  : 'Nej'
        },

        'Gnt.column.ManuallyScheduled' : {
            text : 'Manuellt planerad'
        },

        'Gnt.column.SchedulingMode' : {
            text : 'Läge'
        },

        'Gnt.column.Predecessor' : {
            text : 'Föregående'
        },

        'Gnt.column.Successor' : {
            text : 'Efterföljande'
        },

        'Gnt.column.StartDate' : {
            text : 'Start'
        },

        'Gnt.column.WBS' : {
            text : 'Strukturkod'
        },

        'Gnt.column.Sequence' : {
            text : '#'
        },

        'Gnt.column.Calendar' : {
            text : 'Kalender'
        },

        'Gnt.column.ReadOnly' : {
            text : 'Låst'
        },

        'Gnt.widget.taskeditor.ProjectForm' : {
            nameText                : 'Namn',
            startText               : 'Start',
            finishText              : 'Slut',
            calendarText            : 'Kalender',
            readOnlyText            : 'Låst',
            allowDependenciesText   : 'Tillåt beroenden till andra projekt',
            'Schedule from'         : 'Schemalägg från'
        },

        'Gnt.widget.taskeditor.TaskForm' : {
            taskNameText            : 'Namn',
            durationText            : 'Varaktighet',
            datesText               : 'Datum',
            baselineText            : 'Originalplan',
            startText               : 'Start',
            finishText              : 'Slut',
            percentDoneText         : 'Procent avklarad',
            baselineStartText       : 'Start',
            baselineFinishText      : 'Slut',
            baselinePercentDoneText : 'Procent avklarad',
            baselineEffortText      : 'Arbetsinsats',
            effortText              : 'Arbetsinsats',
            invalidEffortText       : 'Ogiltigt värde',
            calendarText            : 'Kalendar',
            manuallyScheduledText   : 'Manuellt planerad',
            schedulingModeText      : 'Aktivitetstyp',
            rollupText              : 'Upplyft',
            // To translate
            wbsCodeText             : 'Strukturkod',
            "Constraint Type"       : 'Villkorstyp',
            "Constraint Date"       : 'Måldatum',
            readOnlyText            : 'Låst'
        },

        'Gnt.widget.DependencyGrid' : {
            addDependencyText  : 'Lägg till',
            dropDependencyText : 'Ta bort',
            idText                    : 'ID',
            snText                    : 'SN',
            taskText                  : 'Aktivitetsnamn',
            blankTaskText             : 'Välj en aktivitet',
            invalidDependencyText     : 'Ogiltigt beroende',
            parentChildDependencyText : 'Beroende upptäckt mellan en aktivitet och dess sammanfattningsaktivitet',
            duplicatingDependencyText : 'Dubblett-beroende upptäckt',
            transitiveDependencyText  : 'Transitivt beroende',
            cyclicDependencyText      : 'Cirkulärt beroende',
            typeText                  : 'Typ',
            lagText                   : 'Fördröjning',
            clsText                   : 'CSS klass',
            endToStartText            : 'Slut-Till-Start',
            startToStartText          : 'Start-Till-Start',
            endToEndText              : 'Slut-Till-Slut',
            startToEndText            : 'Start-Till-Slut',
            predecessorsText          : 'Föregående aktiviteter',
            successorsText            : 'Efterföljande aktiviteter'
        },

        'Gnt.widget.AssignmentEditGrid' : {
            confirmAddResourceTitle        : 'Bekräfta',
            confirmAddResourceText         : 'Resursen &quot;{0}&quot; finns ej tillagd i listan än. Vill du skapa resursen?',
            noValueText                    : 'Välj en resurs att tilldela',
            noResourceText                 : 'Resurs &quot;{0}&quot; finns inte i listan',
            'Resource is already assigned' : 'Resurs redan tilldelad',
            addAssignmentText  : 'Lägg till',
            dropAssignmentText : 'Ta bort'
        },

        'Gnt.widget.taskeditor.ProjectEditor' : {
            generalText     : 'Information',
            descriptionText : 'Beskrivning'
        },

        'Gnt.widget.taskeditor.TaskEditor' : {
            generalText        : 'Information',
            resourcesText      : 'Resurser',
            notesText          : 'Anteckningar',
            advancedText       : 'Avancerat'
        },

        'Gnt.plugin.taskeditor.BaseEditor' : {
            title        : 'Information',
            alertCaption : 'Meddelande',
            alertText    : 'Rätta till felen för att kunna spara ändringarna',
            okText       : 'Ok',
            cancelText   : 'Avbryt'
        },

        'Gnt.plugin.taskeditor.ProjectEditor' : {
            title : 'Project information'
        },

        'Gnt.field.EndDate' : {
            endBeforeStartText : 'Slutdatum är före startdatum'
        },

        'Gnt.field.ConstraintDate' : {
            format : 'Y-m-d H:i'
        },

        'Gnt.column.Note' : {
            text : 'Anteckning'
        },

        'Gnt.column.AddNew' : {
            text : 'Lägg till ny kolumn...'
        },

        'Gnt.column.EarlyStartDate' : {
            text : 'Tidig Start'
        },

        'Gnt.column.EarlyEndDate' : {
            text : 'Tidigt Slut'
        },

        'Gnt.column.LateStartDate' : {
            text : 'Sen Start'
        },

        'Gnt.column.LateEndDate' : {
            text : 'Sent Slut'
        },

        'Gnt.field.Calendar' : {
            calendarNotApplicable : 'Aktivitetskalendern överlappar inte med dess tilldelade resursers kalendrar',
            invalidText : 'Ogiltig värde'
        },

        'Gnt.field.ScheduleBackwards' : {
            'Project start date'  : 'Projektets startdatum',
            'Project finish date' : 'Projektets slutdatum'
        },

        'Gnt.column.Slack' : {
            text : 'Fritt slack'
        },

        'Gnt.column.TotalSlack' : {
            text : 'Totalt slack'
        },

        'Gnt.column.Name' : {
            text        : 'Aktivitet'
        },

        'Gnt.column.BaselineStartDate' : {
            text : 'Originalplan Start'
        },

        'Gnt.column.BaselineEndDate' : {
            text : 'Originalplan Slut'
        },

        'Gnt.column.Milestone' : {
            text : 'Milstolpe'
        },

        'Gnt.field.Milestone' : {
            yes : 'Ja',
            no  : 'Nej'
        },

        'Gnt.field.Dependency' : {
            invalidFormatText     : 'Felaktigt format för koppling',
            invalidDependencyText : 'Felaktig koppling upptäckt, vänligen verifiera att du inte har några cykliska beroenden mellan dina aktiviteter',
            invalidDependencyType : 'Ogiltid kopplingstyp {0}. Tillåtna typer är: {1}.'
        },

        'Gnt.constraint.Base' : {
            name                               : "Ett villkor",
            "Remove the constraint"            : "Ta bort villkoret",
            "Cancel the change and do nothing" : "Avbryt ändringen",
            // {0} task name, {1} constraint name
            "This action will cause a scheduling conflict" : 'Åtgärden leder till en schemaläggningskonflikt för sammanfattningsaktiviteten "{0}". Villkoret {1} på sammanfattningsaktiviteten orsakar en konflikt med en underaktivitet.'
        },

        'Gnt.constraint.AsLateAsPossible' : {
            name : 'Så sent som möjligt'
        },

        'Gnt.constraint.AsSoonAsPossible' : {
            name : 'Så snart som möjligt'
        },

        'Gnt.constraint.implicit.Dependency' : {
            // {0} dependency type
            // {1} from task
            // {2} to task
            'You moved the task away'             : 'Du flyttade aktiviteten "{2}" bort från "{1}" och aktivteterna är länkade ({0}). Det medför att länken inte kommer att bestämma den senare aktivitetens position.',
            'You moved the task before'           : 'Du flyttade aktiviteten "{2}" före "{1}" och aktivteterna är länkade ({0}). Det medför att länken inte kan bibehållas.',
            'Remove the constraint'               : 'Ta bort kopplingen',
            depType0                              : 'Start-Till-Start',
            depType1                              : 'Start-Till-Slut',
            depType2                              : 'Slut-Till-Start',
            depType3                              : 'Slut-Till-Slut',
            'Keep the dependency & move the task' : 'Behåll kopplingen & flytta aktiviteten {0}'
        },

        'Gnt.constraint.implicit.PotentialConflict' : {
            'This could result in a scheduling conflict' : 'Du anvgav ett {0} villkor på aktiviteten "{1}". Detta kan leda till en schemaläggningskonflikt då aktiviteten har en annan aktivitet länkad till sig.',
            'Remove the constraint'                   : 'Fortsätt, ange {0} villkoret',
            'Replace the constraint'                  : 'Fortsätt, men undvik konflikt genom att sätta ett {0} villkor istället'
        },

        'Gnt.constraint.FinishNoEarlierThan' : {
            name                             : "Avsluta tidigast",
            // {0} date
            "Move the task to finish on {0}" : "Flytta aktiviteten så att den slutar på {0}"
        },

        "Gnt.constraint.FinishNoLaterThan" : {
            name                             : "Avsluta senast",
            // {0} date
            "Move the task to finish on {0}" : "Flytta aktiviteten så att den slutar på {0}"
        },

        "Gnt.constraint.MustFinishOn" : {
            name                             : "Måste avslutas",
            // {0} date
            "Move the task to finish on {0}" : "Flytta aktiviteten så att den slutar på {0}"
        },

        "Gnt.constraint.MustStartOn" : {
            name                            : "Måste starta",
            // {0} date
            "Move the task to start at {0}" : "Flytta aktiviteten så att den startar på {0}"
        },

        "Gnt.constraint.StartNoEarlierThan" : {
            name                            : "Starta tidigast",
            // {0} date
            "Move the task to start at {0}" : "Flytta aktiviteten så att den startar på {0}"
        },

        "Gnt.constraint.StartNoLaterThan" : {
            name                            : "Starta senast",
            // {0} date
            "Move the task to start at {0}" : "Flytta aktiviteten så att den startar på {0}"
        },

        "Gnt.column.ConstraintDate" : {
            text : "Måldatum",
            format : 'Y-m-d H:i'
        },

        "Gnt.column.ConstraintType" : {
            text : "Villkorstyp"
        },

        "Gnt.widget.ConstraintResolutionForm" : {
            dateFormat                             : "Y-m-d H:i",
            "OK"                                   : 'OK',
            "Cancel"                               : 'Avbryt',
            "Resolution options"                   : "Alternativ",
            "Don't ask again"                      : "Fråga inte igen",
            // {0} task name, {1} constraint name
            "Task {0} violates constraint {1}"     : "Aktiviteten \"{0}\" bryter villkoret {1}",
            // {0} task name, {1} constraint name, {2} constraint date
            "Task {0} violates constraint {1} {2}" : "Aktiviteten \"{0}\" bryter villkoret {1} {2}"
        },

        "Gnt.widget.ConstraintResolutionWindow" : {
            "Constraint violation" : "Villkor brutet"
        },

        "Gnt.panel.ResourceHistogram" : {
            resourceText : 'Resurs'
        },

        "Gnt.panel.ResourceUtilization" : {
            "calculating {0}% done" : "beräknad {0}% fullständig"
        }
    },


    apply : function (classNames) {
        // apply corresponding scheduler locale first
        Sch.locale.SvSE.apply(classNames);
        this.callParent(arguments);
    }
});
