// @tag alternative-locale
/**
 * Dutch translations for the Gantt component
 * including Dutch translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Gnt.locale.Nl', {
    extend    : 'Sch.locale.Locale',
    requires  : 'Sch.locale.Nl',
    singleton : true,

    l10n      : {
        'Gnt.util.DurationParser' : {
            unitsRegex : {
                MILLI   : /^ms$|^mil/i,
                SECOND  : /^s$|^sec/i,
                MINUTE  : /^m$|^min/i,
                HOUR    : /^u$|^uur$|^uren/i,
                DAY     : /^d$|^dag/i,
                WEEK    : /^w$|^wk|^week|^weken/i,
                MONTH   : /^ma|^mnd/i,
                QUARTER : /^k$|^kwar|^kwt|^kw/i,
                YEAR    : /^j$|^jr|^jaar|^jaren/i
            }
        },

        'Gnt.util.DependencyParser' : {
            typeText : {
                SS : 'GB',
                SF : 'EB',
                FS : 'BE',
                FF : 'GE'
            }
        },

        'Gnt.panel.Timeline' : {
            start : 'Start',
            end   : 'Einde',
            format  : 'd-m-Y'
        },

        'Gnt.field.ShowInTimeline' : {
            yes   : 'Ja',
            no    : 'Nee'
        },

        'Gnt.column.ShowInTimeline' : {
            text  : 'Toevoegen aan tijdlijn'
        },

        'Gnt.field.ConstraintType' : {
            none : 'Geen',
            invalidText : 'Ongeldige waarde'
        },

        'Gnt.field.Duration' : {
            invalidText : 'Ongeldige waarde'
        },

        'Gnt.field.Cost' : {
            invalidText         : 'Ongeldige waarde',
            currencySymbol      : '€',
            currencySymbolAlign : 'left'
        },

        'Gnt.field.Effort' : {
            invalidText : 'Ongeldige waarde'
        },

        'Gnt.field.Percent' : {
            invalidText : 'Ongeldige waarde'
        },

        'Gnt.field.SchedulingMode' : {
            Normal              : 'Normaal',
            FixedDuration       : 'Vaste duur',
            EffortDriven        : 'Op inspanning',
            DynamicAssignment   : 'Op toewijzing',
            invalidText         : 'Ongeldige waarde'
        },

        'Gnt.template.Deadline' : {
            deadline : 'Deadline'
        },

        'Gnt.column.DeadlineDate' : {
            text : 'Deadline'
        },

        'Gnt.Tooltip' : {
            startText    : 'Begin: ',
            endText      : 'Einde: ',
            durationText : 'Duur: '
        },

        'Gnt.template.TaskTooltip' : {
            startText    : 'Begin',
            endText      : 'Einde',
            percentText  : 'Gedaan',
            format       : 'd-m-Y',
            overflowText : 'Er {[values.nbrOverflowing > 1 ? "zijn" : "is"]} {nbrOverflowing} meer dan {[values.nbrOverflowing > 1 ? "taken" : "taak"]}'
        },

        'Gnt.plugin.TaskContextMenu' : {
            projectInformation : 'Project informatie...',
            taskInformation    : 'Taak informatie...',
            newTaskText        : 'Nieuwe taak',
            deleteTask         : 'Verwijder taak/taken',
            editLeftLabel      : 'Bewerk linker label',
            editRightLabel     : 'Bewerk rechter label',
            add                : 'Voeg toe...',
            deleteDependency   : 'Verwijder afhankelijkheid...',
            addTaskAbove       : 'Bovenliggende taak',
            addTaskBelow       : 'Onderliggende Taak',
            addMilestone       : 'Mijlpaal',
            addSubtask         : 'Sub-taak',
            addSuccessor       : 'Opvolgende',
            addPredecessor     : 'Voorgaande',
            convertToMilestone : 'Converteren naar mijlpaal',
            convertToRegular   : 'Converteren naar reguliere taak',
            splitTask          : 'Taak splitsen'
        },

        'Gnt.plugin.DependencyEditor' : {
            fromText         : 'Van',
            toText           : 'Tot',
            typeText         : 'Type',
            lagText          : 'Achterstand',//?
            endToStartText   : 'Einde-Tot-Start',
            startToStartText : 'Begin-Tot-Begin',
            endToEndText     : 'Einde-Tot-Einde',
            startToEndText   : 'Begin-Tot-Einde',
            okButtonText     : 'Ok',
            cancelButtonText : 'Annuleer',
            deleteButtonText : 'Verwijder'
        },

        'Gnt.widget.calendar.Calendar' : {
            dayOverrideNameHeaderText : 'Naam',
            overrideName              : 'Naam',
            startDate                 : 'Startdatum',
            endDate                   : 'Einddatum',
            error                     : 'Fout',
            dateText                  : 'Datum',
            addText                   : 'Toevoegen',
            editText                  : 'Bewerken',
            removeText                : 'Verwijderen',
            workingDayText            : 'Werkdag',
            weekendsText              : 'Weekends',
            overriddenDayText         : 'Overschreven dag',
            overriddenWeekText        : 'Overschreven week',
            workingTimeText           : 'Werktijd',
            nonworkingTimeText        : 'Buiten-werktijd',
            dayOverridesText          : 'Overschreven dag',
            weekOverridesText         : 'Overschreven Week',
            okText                    : 'OK',
            cancelText                : 'Annuleer',
            parentCalendarText        : 'Bovenliggende kalender',
            noParentText              : 'Geen bovenliggende',
            selectParentText          : 'Selecteer bovenliggende',
            newDayName                : '[Zonder naam]',
            calendarNameText          : 'Kalender naam',
            isProjectCalendarText     : 'Projectkalender',
            tplTexts                  : {
                tplWorkingHours  : 'Werktijden voor',
                tplIsNonWorking  : 'is non-actief',
                tplOverride      : 'overschreven',
                tplInCalendar    : 'in kalender',
                tplDayInCalendar : 'standaard dag in kalender',
                tplBasedOn       : 'Gebaseerd op'
            },
            overrideErrorText         : 'Er is al een overschrijving voor deze dag',
            overrideDateError         : 'Er is al een overschrijving voor deze datum: {0}',
            startAfterEndError        : 'Startdatum moet eerder zijn dan de  einddatum',
            weeksIntersectError       : 'Week overschrijvingen mogen elkaar niet overschrijden'
        },

        'Gnt.widget.calendar.AvailabilityGrid' : {
            startText  : 'Start',
            endText    : 'Einde',
            addText    : 'Voeg toe',
            removeText : 'Verwijder',
            error      : 'Fout'
        },

        'Gnt.widget.calendar.DayEditor' : {
            workingTimeText    : 'Werktijd',
            nonworkingTimeText : 'Buiten werktijd'
        },

        'Gnt.widget.calendar.WeekEditor' : {
            defaultTimeText    : 'Standaard tijd',
            workingTimeText    : 'Werktijd',
            nonworkingTimeText : 'Buiten werktijd',
            error              : 'Fout',
            noOverrideError    : "Week overschrijving bevat alleen 'standaard' dagen - kan niet opslaan"
        },

        'Gnt.widget.calendar.ResourceCalendarGrid' : {
            name     : 'Naam',
            calendar : 'Kalender'
        },

        'Gnt.widget.calendar.CalendarWindow' : {
            title  : 'Kalender',
            ok     : 'Ok',
            cancel : 'Annuleer'
        },

        'Gnt.widget.calendar.CalendarManager' : {
            addText         : 'Voeg toe',
            removeText      : 'Verwijder',
            add_child       : 'Voeg sub kalender toe',
            add_node        : 'Voeg kalender toe',
            add_sibling     : 'Voeg kalender toe',
            remove          : 'Verwijder',
            calendarName    : 'Kalender',
            confirm_action  : 'Bevestig',
            confirm_message : 'De kalender is gewijzigd. Wilt u de wijzigingen opslaan?'
        },

        'Gnt.widget.calendar.CalendarManagerWindow' : {
            title           : 'Kalender manager',
            confirm_action  : 'Bevestig',
            confirm_message : 'De kalender is gewijzigd. Wilt u de wijzigingen opslaan?',
            ok              : 'Voer wijzigingen door',
            cancel          : 'Sluit'
        },

        'Gnt.field.Assignment' : {
            cancelText : 'Annuleer',
            closeText  : 'Opslaan en sluiten'
        },

        'Gnt.column.AssignmentUnits' : {
            text : 'Eenheden'
        },

        'Gnt.column.Duration' : {
            text : 'Duur'
        },

        'Gnt.column.Effort' : {
            text : 'Inspanning'
        },

        'Gnt.column.BaselineEffort' : {
            text : 'Baseline Inspanning'
        },

        'Gnt.column.ActualEffort' : {
            text : 'Werkelijke Inspanning'
        },

        'Gnt.column.EffortVariance' : {
            text : 'Afwijking Inspanning'
        },

        'Gnt.column.Cost' : {
            text : 'Kosten'
        },

        'Gnt.column.BaselineCost' : {
            text : 'Baseline Kosten'
        },

        'Gnt.column.ActualCost' : {
            text : 'Werkelijke Kosten'
        },

        'Gnt.column.CostVariance' : {
            text                : 'Afwijking Kosten',
            currencySymbol      : '€',
            currencySymbolAlign : 'left'
        },

        'Gnt.column.EndDate' : {
            text : 'Einde'
        },

        'Gnt.column.PercentDone' : {
            text : '% Gedaan'
        },

        'Gnt.column.ResourceAssignment' : {
            text : 'Toegewezen Resources'
        },

        'Gnt.column.ResourceName' : {
            text : 'Resource Naam'
        },

        'Gnt.column.Rollup' : {
            text : 'Samenvouwen',
            no   : 'Nee',
            yes  : 'Ja'
        },

        'Gnt.field.ManuallyScheduled' : {
            yes : 'Ja',
            no  : 'Nee'
        },

        'Gnt.field.ReadOnly' : {
            yes : 'Ja',
            no  : 'Nee'
        },

        'Gnt.column.ManuallyScheduled' : {
            text : 'Handmatig'
        },

        'Gnt.column.SchedulingMode' : {
            text : 'Mode'
        },

        'Gnt.column.Predecessor' : {
            text : 'Voorganger'
        },

        'Gnt.column.Successor' : {
            text : 'Opvolger'
        },

        'Gnt.column.StartDate' : {
            text : 'Begin'
        },

        'Gnt.column.WBS' : {
            text : 'WBS'
        },

        'Gnt.column.Sequence' : {
            text : '#'
        },

        'Gnt.column.Calendar' : {
            text : 'Kalender'
        },

        'Gnt.column.ReadOnly' : {
            text : 'Alleen lezen'
        },

        'Gnt.widget.taskeditor.ProjectForm' : {
            nameText                : 'Naam',
            startText               : 'Begin',
            finishText              : 'Einde',
            calendarText            : 'Kalender',
            readOnlyText            : 'Alleen lezen',
            allowDependenciesText   : 'Afhankelijkheden tussen projecten toestaan'
        },

        'Gnt.widget.taskeditor.TaskForm' : {
            taskNameText            : 'Naam',
            durationText            : 'Duur',
            datesText               : 'Datums',
            baselineText            : 'Baseline',
            startText               : 'Begin',
            finishText              : 'Einde',
            percentDoneText         : 'Percentage Compleet',
            baselineStartText       : 'Begin',
            baselineFinishText      : 'Einde',
            baselinePercentDoneText : 'Percentage Compleet',
            baselineEffortText      : 'Inspanning',
            effortText              : 'Inspanning',
            invalidEffortText       : 'Ongeldige Inspanningswaarde',
            calendarText            : 'Kalender',
            manuallyScheduledText   : 'Handmatig',
            schedulingModeText      : 'Scheduling Mode',
            rollupText              : 'Samenvouwen',
            wbsCodeText             : 'Structuurcode',
            "Constraint Type"       : 'Beperkingstype',
            "Constraint Date"       : 'Beperkingsdatum',
            readOnlyText            : 'Alleen lezen'
        },

        'Gnt.widget.DependencyGrid' : {
            addDependencyText  : 'Nieuwe toevoegen',
            dropDependencyText : 'Verwijderen',
            idText                    : 'ID',
            snText                    : 'SN',
            taskText                  : 'Taak Naam',
            blankTaskText             : 'Selecteer Taak A.u.b',
            invalidDependencyText     : 'Ongeldige afhankelijkheid',
            parentChildDependencyText : 'Afhankelijkheid tussen ouder en kind gevonden',//?
            duplicatingDependencyText : 'Duplicate afhankelijkheid gevonden',
            transitiveDependencyText  : 'Transitieve afhankelijkheid',
            cyclicDependencyText      : 'Cyclische afhankelijkheid',
            typeText                  : 'Type',
            lagText                   : 'Vertraging',//?
            clsText                   : 'CSS class',
            endToStartText            : 'Einde-Tot-Begin',
            startToStartText          : 'Begin-Tot-Begin',
            endToEndText              : 'Einde-Tot-Einde',
            startToEndText            : 'Begin-Tot-Einde',
            predecessorsText          : 'Voorafgaande taken',
            successorsText            : 'Opvolgende taken'
        },

        'Gnt.widget.AssignmentEditGrid' : {
            confirmAddResourceTitle        : 'Bevestig',
            confirmAddResourceText         : 'Resource &quot;{0}&quot; niet in de lijst gevonden. Wilt u deze toevoegen?',
            noValueText                    : 'Selecteer een toe te wijzen resource a.u.b.',
            noResourceText                 : 'Geen resource &quot;{0}&quot; gevonden in the lijst',
            'Resource is already assigned' : 'Resource is reeds toegewezen',
            addAssignmentText  : 'Nieuwe toevoegen',
            dropAssignmentText : 'Verwijderen'
        },

        'Gnt.widget.taskeditor.ProjectEditor' : {
            generalText        : 'Algemeen',
            descriptionText    : 'Omschrijving'
        },

        'Gnt.widget.taskeditor.TaskEditor' : {
            generalText        : 'Algemeen',
            resourcesText      : 'Resources',
            notesText          : 'Notities',
            advancedText       : 'Geavanceerd'
        },

        'Gnt.plugin.taskeditor.BaseEditor' : {
            title        : 'Taak Informatie',
            alertCaption : 'Informatie',
            alertText    : 'Corrigeer gemaakte fouten alvorens op te slaan a.u.b.',
            okText       : 'Ok',
            cancelText   : 'Annuleer'
        },

        'Gnt.plugin.taskeditor.ProjectEditor' : {
            title        : 'Project informatie'
        },

        'Gnt.field.EndDate' : {
            endBeforeStartText : 'Einddatum ligt voor begindatum'
        },

        'Gnt.field.ConstraintDate' : {
            format : 'd-m-Y H:i'
        },

        'Gnt.column.Note' : {
            text : 'Notitie'
        },

        'Gnt.column.AddNew' : {
            text : 'Voeg nieuwe kolom toe...'
        },

        'Gnt.column.EarlyStartDate' : {
            text : 'Vroegste startdatum'
        },

        'Gnt.column.EarlyEndDate' : {
            text : 'Vroegste einddatum'
        },

        'Gnt.column.LateStartDate' : {
            text : 'Late startdatum'
        },

        'Gnt.column.LateEndDate' : {
            text : 'Late einddatum'
        },

        'Gnt.field.Calendar' : {
            calendarNotApplicable : 'Taak kalender heeft geen overlapping met toegewezen resource kalenders',
            invalidText : 'Ongeldige waarde'
        },

        'Gnt.column.Slack' : {
            text : 'Vrije marge'
        },

        'Gnt.column.TotalSlack' : {
            text : 'Totale marge'
        },

        'Gnt.column.Name' : {
            text : 'Taak Naam'
        },

        'Gnt.column.BaselineStartDate' : {
            text : 'Baseline Begindatum'
        },

        'Gnt.column.BaselineEndDate' : {
            text : 'Baseline Einddatum'
        },

        'Gnt.column.Milestone' : {
            text : 'Mijlpaal'
        },

        'Gnt.field.Milestone' : {
            yes : 'Ja',
            no  : 'Nee'
        },

        'Gnt.field.Dependency' : {
            invalidFormatText     : 'Ongeldig formaat van de afhankelijkheid',
            invalidDependencyText : 'Ongeldige afhankelijkheid gevonden, zorg ervoor dat u geen cyclische paden heeft tussen uw taken',
            invalidDependencyType : 'Ongeldige afhankelijkheid type {0}. Toegestane waarden zijn: {1}.'
        },

        'Gnt.constraint.Base' : {
            name                               : "Een beperking",
            "Remove the constraint"            : "Verwijder beperking",
            "Cancel the change and do nothing" : "Annuleer wijziging en doe niks",
            // {0} task name, {1} constraint name
            "This action will cause a scheduling conflict" : 'Deze actie veroorzaakt een conflict op de samenvattende taak "{0}". De {1} beperking veroorzaakt een conflict met een van de subtaken.'
        },


        'Gnt.constraint.implicit.Dependency' : {
            // {0} dependency type
            // {1} from task
            // {2} to task
            'You moved the task away'             : 'U heeft taak "{2}" verplaatst achter "{1}" en de taken zijn verbonden als ({0}). De positie van de laatste taak wordt nu niet beïnvloed door de verbinding met de voorgaande taken.',
            'You moved the task before'           : 'U heeft taak "{2} voor taak "{1}" geplaatst en de taken zijn verbonden als ({0})". Hierdoor is de verbinding niet langer geldig.',
            'Remove the constraint'               : 'Verwijder afhankelijkheid',
            depType0                              : 'Begin-Tot-Begin',
            depType1                              : 'Begin-Tot-Einde',
            depType2                              : 'Einde-Tot-Begin',
            depType3                              : 'Einde-Tot-Einde',
            'Keep the dependency & move the task' : 'Bewaar de afhankelijkheid en verplaats de taak naar {0}'
        },

        'Gnt.constraint.implicit.PotentialConflict' : {
            'This could result in a scheduling conflict' : 'U heeft een {0} beperking op taak "{1}". Dit kan resulteren in een conflict aangezien de taak een afhankelijke taak heeft.',
            'Remove the constraint'                   : 'Ga door. Gebruik de {0} beperking',
            'Replace the constraint'                  : 'Ga door maar vermijd het conflict door in plaats daarvan een {0} beperking te gebruikten'
        },

        'Gnt.constraint.FinishNoEarlierThan' : {
            name                             : "Niet eerder eindigen dan",
            // {0} date
            "Move the task to finish on {0}" : "Verplaats taak van einde naar {0}"
        },

        "Gnt.constraint.FinishNoLaterThan" : {
            name                             : "Niet later eindigen dan",
            // {0} date
            "Move the task to finish on {0}" : "Verplaats taak van einde naar {0}"
        },

        "Gnt.constraint.MustFinishOn" : {
            name                             : "Moet eindigen op",
            // {0} date
            "Move the task to finish on {0}" : "Verplaats de taak van einde naar {0}"
        },

        "Gnt.constraint.MustStartOn" : {
            name                             : "Moet beginnen op",
            // {0} date
            "Move the task to start at {0}"  : "Verplaats de taak van begin naar {0}"
        },

        "Gnt.constraint.StartNoEarlierThan" : {
            name                             : "Niet eerder beginnen dan",
            // {0} date
            "Move the task to start at {0}"  : "Verplaats de taak van begin naar {0}"
        },

        "Gnt.constraint.StartNoLaterThan" : {
            name                             : "Niet later beginnen dan",
            // {0} date
            "Move the task to start at {0}"  : "Verplaats de taak van begin naar {0}"
        },

        "Gnt.column.ConstraintDate" : {
            text : "Beperkingsdatum",
            format : 'd-m-Y H:i'
        },

        "Gnt.column.ConstraintType" : {
            text : "Beperking"
        },

        "Gnt.widget.ConstraintResolutionForm" : {
            dateFormat                             : "d-m-Y H:i",
            "OK"                                   : "Ok",
            "Cancel"                               : "Annuleer",
            "Resolution options"                   : "Aktie",
            "Don't ask again"                      : "Vraag niet nogmaals",
            // {0} task name, {1} constraint name
            "Task {0} violates constraint {1}"     : "Taak \"{0}\" overtreedt beperking {1}",
            // {0} task name, {1} constraint name, {2} constraint date
            "Task {0} violates constraint {1} {2}" : "Taak \"{0}\" overtreedt beperking {1} {2}"
        },

        "Gnt.widget.ConstraintResolutionWindow" : {
            "Constraint violation" : "Beperking overtreding"
        },

        "Gnt.panel.ResourceHistogram" : {
            resourceText : 'Resource'
        }
    },


    apply : function (classNames) {
        // apply corresponding scheduler locale first
        Sch.locale.Nl.apply(classNames);
        this.callParent(arguments);
    }
});
