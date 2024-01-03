// @tag alternative-locale
/**
 * German translations for the Gantt component
 * including German translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Gnt.locale.De', {
    extend      : 'Sch.locale.Locale',
    requires    : 'Sch.locale.De',
    singleton   : true,

    l10n        : {
        'Gnt.util.DurationParser' : {
            unitsRegex : {
                YEAR        : /^Jahr$|^Jahre$|^j/i,
                QUARTER     : /^Quartal$|^Quartale$|^q/i,
                MONTH       : /^Monat$|^Monate$|^m$/i,
                WEEK        : /^Woche$|^Wochen$|^w/i,
                DAY         : /^Tag$|^Tage$|^t/i,
                HOUR        : /^Stunde$|^Stunden$|^h/i,
                MINUTE      : /^Minute$|^Minuten$|^min/i,
                SECOND      : /^Sekunde$|^Sekunden$|^s$/i,
                MILLI       : /^Millisekunde$|^Millisekunden$|^ms/i
            }
        },

        'Gnt.util.DependencyParser' : {
            typeText    : {
                SS  : 'AA',
                SF  : 'AE',
                FS  : 'EA',
                FF  : 'EE'
            }
        },

        'Gnt.panel.Timeline' : {
            start : 'Start',
            end   : 'Ende',
            format : 'Y-m-d'
        },

        'Gnt.field.ShowInTimeline' : {
            yes   : 'Ja',
            no    : 'Nein'
        },

        'Gnt.column.ShowInTimeline' : {
            text  : 'Zur Zeitachse hinzufügen'
        },

        'Gnt.field.ConstraintType' : {
            none : 'Keine',
            invalidText : 'Ungültiger Wert'
        },

        'Gnt.field.Duration' : {
            invalidText : 'Ungültiger Wert'
        },

        'Gnt.field.Cost' : {
            invalidText         : 'Ungültiger Wert',
            currencySymbol      : '€',
            currencySymbolAlign : 'left'
        },

        'Gnt.field.Effort' : {
            invalidText : 'Ungültiger Wert'
        },

        'Gnt.field.Percent' : {
            invalidText : 'Ungültiger Wert'
        },

        'Gnt.field.SchedulingMode' : {
            Normal              : 'Normal',
            FixedDuration       : 'Feste Laufzeit',
            EffortDriven        : 'Nach Aufwand',
            DynamicAssignment   : 'Im Auftrag',
            invalidText         : 'Ungültiger Wert'
        },

        'Gnt.template.Deadline' : {
            deadline : 'Stichtag'
        },

        'Gnt.column.DeadlineDate' : {
            text : 'Stichtag'
        },

        'Gnt.Tooltip' : {
            startText       : 'Beginnt: ',
            endText         : 'Endet: ',
            durationText    : 'Dauer: '
        },

        'Gnt.template.TaskTooltip' : {
            startText    : 'Beginnt',
            endText      : 'Endet',
            percentText  : 'Erledigt',
            format       : 'Y-m-d',
            overflowText : 'Es gibt noch {nbrOverflowing} {[values.nbrOverflowing > 1 ? "aufgaben" : "aufgabe"]}'
        },

        'Gnt.plugin.TaskContextMenu' : {
            projectInformation  : 'Projektinformationen...',
            taskInformation     : 'Aufgabeninformationen...',
            newTaskText         : 'Neue Aufgabe',
            deleteTask          : 'Lösche Aufgabe(n)',
            editLeftLabel       : 'Bearbeite linke Bezeichnung',
            editRightLabel      : 'Bearbeite rechte Bezeichnung',
            add                 : 'Hinzufügen...',
            deleteDependency    : 'Lösche Abhängigkeit...',
            addTaskAbove        : 'Aufgabe vor',
            addTaskBelow        : 'Aufgabe unter',
            addMilestone        : 'Meilenstein',
            addSubtask          : 'Unteraufgabe',
            addSuccessor        : 'Nachfolger',
            addPredecessor      : 'Vorgänger',
            convertToMilestone  : 'Zu Meilenstein konvertieren',
            convertToRegular    : 'Zu regulärer Aufgabe konvertieren',
            splitTask           : 'Vorgang unterbrechen'
        },

        'Gnt.plugin.DependencyEditor' : {
            fromText            : 'Von',
            toText              : 'Zu',
            typeText            : 'Typ',
            lagText             : 'Verzögern',
            endToStartText      : 'Ende-Anfang',
            startToStartText    : 'Anfang-Anfang',
            endToEndText        : 'Ende-Ende',
            startToEndText      : 'Anfang-Ende',
            okButtonText        : 'Ok',
            cancelButtonText    : 'Abbrechen',
            deleteButtonText    : 'Löschen'
        },

        'Gnt.widget.calendar.Calendar' : {
            dayOverrideNameHeaderText : 'Name',
            overrideName        : 'Name',
            startDate           : 'Starddatum',
            endDate             : 'Enddatum',
            error               : 'Fehler',
            dateText            : 'Datum',
            addText             : 'Hinzufügen',
            editText            : 'Ändern',
            removeText          : 'Entfernen',
            workingDayText      : 'Arbeitstag',
            weekendsText        : 'Wochenende',
            overriddenDayText   : 'Tag mit Überschneidung',
            overriddenWeekText  : 'Woche mit Überschneidung',
            workingTimeText     : 'Arbeitszeit',
            nonworkingTimeText  : 'keine Arbeitszeit',
            dayOverridesText    : 'Überschneidungen an Tagen',
            weekOverridesText   : 'Überschneidungen in Wochen',
            okText              : 'OK',
            cancelText          : 'Abbrechen',
            parentCalendarText  : 'Ursprungskalender',
            noParentText        : 'Kein Ursprungskalender',
            selectParentText    : 'Ursprungskalender wählen',
            newDayName          : '[Ohne Name]',
            calendarNameText    : 'Kalendername',
            isProjectCalendarText   : 'Projektkalender',
            tplTexts            : {
                tplWorkingHours : 'Arbeitszeit für',
                tplIsNonWorking : 'ist keine Arbeitszeit',
                tplOverride     : 'Überschneidung',
                tplInCalendar   : 'in Kalender',
                tplDayInCalendar: 'Standardtag in Kalender',
                tplBasedOn      : 'Basierend auf'
            },
            overrideErrorText   : 'Für diesen Tag existiert bereits eine Überschneidung',
            overrideDateError   : 'In dieser Woche existiert bereits eine Überschneidung für folgendes Datum: {0}',
            startAfterEndError  : 'Startdatum größer als Enddatum',
            weeksIntersectError : 'Wochenüberschneidungen sollten sich nicht überlagern'
        },

        'Gnt.widget.calendar.AvailabilityGrid' : {
            startText           : 'Start',
            endText             : 'Ende',
            addText             : 'Hinzufügen',
            removeText          : 'Entfernen',
            error               : 'Fehler'
        },

        'Gnt.widget.calendar.DayEditor' : {
            workingTimeText     : 'Arbeitszeit',
            nonworkingTimeText  : 'Keine Arbeitszeit'
        },

        'Gnt.widget.calendar.WeekEditor' : {
            defaultTimeText     : 'Standardzeit',
            workingTimeText     : 'Arbeitszeit',
            nonworkingTimeText  : 'Keine Arbeitszeit',
            error               : 'Fehler',
            noOverrideError     : "Wochenüberschneidungen beinhaltet nur 'default' Tage - kann nicht gespeichert werden."
        },

        'Gnt.widget.calendar.ResourceCalendarGrid' : {
            name        : 'Name',
            calendar    : 'Kalender'
        },

        'Gnt.widget.calendar.CalendarWindow' : {
            title   : 'Kalender',
            ok      : 'Ok',
            cancel  : 'Abbrechen'
        },

        'Gnt.widget.calendar.CalendarManager' : {
            addText         : 'Hinzufügen',
            removeText      : 'Entfernen',
            add_child       : 'Untergeordneten Kalender hinzufügen',
            add_node        : 'Kalender hinzufügen',
            add_sibling     : 'Kalender hinzufügen',
            remove          : 'Entfernen',
            calendarName    : 'Kalender',
            confirm_action  : 'Aktion bestätigen',
            confirm_message : 'Der Kalender hat ungespeicherte Änderungen. Möchten Sie Ihre Änderungen speichern?'
        },

        'Gnt.widget.calendar.CalendarManagerWindow' : {
            title           : 'Kalender verwalten',
            ok              : 'Ok',
            cancel          : 'Abbrechen',
            confirm_action  : 'Aktion bestätigen',
            confirm_message : 'Der Kalender hat ungespeicherte Änderungen. Möchten Sie Ihre Änderungen speichern?'
        },

        'Gnt.field.Assignment' : {
            cancelText : 'Abbrechen',
            closeText  : 'Speichern und schliessen'
        },

        'Gnt.column.AssignmentUnits' : {
            text : 'Einheiten'
        },

        'Gnt.column.Duration' : {
            text : 'Dauer'
        },

        'Gnt.column.Effort' : {
            text : 'Aufwand'
        },

        'Gnt.column.BaselineEffort' : {
            text : 'Baseline Aufwand'
        },

        'Gnt.column.ActualEffort' : {
            text : 'Aktuelle Aufwand'
        },

        'Gnt.column.EffortVariance' : {
            text : 'Aufwand Abweichung'
        },

        'Gnt.column.Cost' : {
            text : 'Kosten'
        },

        'Gnt.column.BaselineCost' : {
            text : 'Baseline Kosten'
        },

        'Gnt.column.ActualCost' : {
            text : 'Aktuelle Kosten'
        },

        'Gnt.column.CostVariance' : {
            text                : 'Abweichung Kosten',
            currencySymbol      : '€',
            currencySymbolAlign : 'left'
        },

        'Gnt.column.EndDate' : {
            text : 'Fertig stellen'
        },

        'Gnt.column.PercentDone' : {
            text : '% erledigt'
        },

        'Gnt.column.ResourceAssignment' : {
            text : 'Zugwiesene Resourcen'
        },

        'Gnt.column.ResourceName' : {
            text : 'Resourcenname'
        },

        'Gnt.column.Rollup' : {
            text : 'Rollup',
            yes  : 'Ja',
            no   : 'Nein'
        },

        'Gnt.field.ManuallyScheduled' : {
            yes : 'Ja',
            no  : 'Nein'
        },

        'Gnt.field.ReadOnly' : {
            yes : 'Ja',
            no  : 'Nein'
        },

        'Gnt.column.ManuallyScheduled' : {
            text : 'Manuell geplant'
        },

        'Gnt.column.SchedulingMode' : {
            text : 'Modus'
        },

        'Gnt.column.Predecessor' : {
            text : 'Vorgänger'
        },

        'Gnt.column.Successor' : {
            text : 'Nachfolger'
        },

        'Gnt.column.StartDate' : {
            text : 'Anfang'
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
            text : 'Nur lesen'
        },

        'Gnt.widget.taskeditor.ProjectForm' : {
            nameText                : 'Name',
            startText               : 'Start',
            finishText              : 'Ende',
            calendarText            : 'Kalender',
            readOnlyText            : 'Nur Lesen',
            allowDependenciesText   : 'Erlauben projektübergreifende abhängigkeiten'
        },

        'Gnt.widget.taskeditor.TaskForm' : {
            taskNameText            : 'Name',
            durationText            : 'Dauer',
            datesText               : 'Daten',
            baselineText            : 'Baseline',
            startText               : 'Start',
            finishText              : 'Ende',
            percentDoneText         : 'Abgeschlossen in Prozent',
            baselineStartText       : 'Start',
            baselineFinishText      : 'Ende',
            baselinePercentDoneText : 'Prozent abgeschlossen',
            baselineEffortText      : 'Aufwand',
            effortText              : 'Aufwand',
            invalidEffortText       : 'Ungültiger Wert für Aufwand',
            calendarText            : 'Kalender',
            manuallyScheduledText   : 'Manuell geplant',
            schedulingModeText      : 'Planungsmodus',
            rollupText              : 'Rollup',
            wbsCodeText             : 'PSP code',
            "Constraint Type"       : 'Einschränkung',
            "Constraint Date"       : 'Einschränkung Datum',
            readOnlyText            : 'Nur Lesen'
        },

        'Gnt.widget.DependencyGrid' : {
            addDependencyText   : 'Neu hinzufügen',
            dropDependencyText  : 'Entfernen',
            idText                      : 'ID',
            snText                      : 'SN',
            taskText                    : 'Aufgabenname',
            blankTaskText               : 'Bitte Aufgabe wählen',
            invalidDependencyText       : 'Ungültige Abhängigkeit',
            parentChildDependencyText   : 'Abhängigkeit zwischen Unteraufgabe und Sammelaufgabe',
            duplicatingDependencyText   : 'Doppelte Abhängigkeit gefunden',
            transitiveDependencyText    : 'Transitive Abhängigkeit',
            cyclicDependencyText        : 'Zirkuläre Referenz',
            typeText                    : 'Typ',
            lagText                     : 'Verzögern',
            clsText                     : 'CSS class',
            endToStartText              : 'Finish-To-Start',
            startToStartText            : 'Start-To-Start',
            endToEndText                : 'Finish-To-Finish',
            startToEndText              : 'Start-To-Finish',
            predecessorsText            : 'Vorgänger',
            successorsText              : 'Nachfolger'
        },

        'Gnt.widget.AssignmentEditGrid' : {
            confirmAddResourceTitle        : 'Bestätigen',
            confirmAddResourceText         : 'Resource &quot;{0}&quot; Nicht in der Liste gefunden. Möchten Sie sie hinzufügen?',
            noValueText                    : 'Bitte eine Resource für die Zuordnung auswählen',
            noResourceText                 : 'Resource &quot;{0}&quot; nicht in der Liste gefunden',
            'Resource is already assigned' : 'Ressource ist bereits zugewiesen',
            addAssignmentText   : 'Neu hinzufügen',
            dropAssignmentText  : 'Entfernen'
        },

        'Gnt.widget.taskeditor.ProjectEditor' : {
            generalText        : 'Generell',
            descriptionText    : 'Beschreibung'
        },

        'Gnt.widget.taskeditor.TaskEditor' : {
            generalText         : 'Generell',
            resourcesText       : 'Resourcen',
            notesText           : 'Notizen',
            advancedText        : 'Fortgeschritten'
        },

        'Gnt.plugin.taskeditor.BaseEditor' : {
            title           : 'Aufgabeninformationen',
            alertCaption    : 'Information',
            alertText       : 'Bitte die markierten Fehler zum Speichern beheben',
            okText          : 'Ok',
            cancelText      : 'Abbrechen'
        },

        'Gnt.plugin.taskeditor.ProjectEditor' : {
            title        : 'Projektinformationen'
        },

        'Gnt.field.EndDate' : {
            endBeforeStartText : 'Das Enddatum liegt vor dem Startdatum'
        },

        'Gnt.field.ConstraintDate' : {
            format : 'd.m.Y H:i'
        },

        'Gnt.column.Note'   : {
            text            : 'Notiz'
        },

        'Gnt.column.AddNew' : {
            text            : 'Neue Spalte hinzufügen...'
        },

        'Gnt.column.EarlyStartDate' : {
            text            : 'Frühes Startdatum'
        },

        'Gnt.column.EarlyEndDate' : {
            text            : 'Frühes Ende'
        },

        'Gnt.column.LateStartDate' : {
            text            : 'Später Start'
        },

        'Gnt.column.LateEndDate' : {
            text            : 'Spätes Ende'
        },

        'Gnt.field.Calendar' : {
            calendarNotApplicable : 'Aufgabenkalender hat keine Überlappung mit den Kalendern der zugwiesenen Resourcen',
            invalidText : 'Ungültiger Wert'
        },

        'Gnt.column.Slack' : {
            text            : 'Freie Pufferzeit'
        },

        'Gnt.column.TotalSlack' : {
            text            : 'Gesamte Pufferzeit'
        },

        'Gnt.column.Name' : {
            text            : 'Vorgangsname'
        },

        'Gnt.column.BaselineStartDate'   : {
            text            : 'Baseline Start'
        },

        'Gnt.column.BaselineEndDate'   : {
            text            : 'Baseline Ende'
        },

        'Gnt.column.Milestone'   : {
            text            : 'Meilenstein'
        },

        'Gnt.field.Milestone'   : {
            yes             : 'Ja',
            no              : 'Nein'
        },

        'Gnt.field.Dependency'  : {
            invalidFormatText       : 'Unzulässiges Abhängigkeitsformat',
            invalidDependencyText   : 'Unzulässige Abhängigkeit gefunden; bitte stellen Sie sicher, dass keine Zirkelbezüge zwischen Ihren Tasks entstehen',
            invalidDependencyType   : 'Unzulässiger Abhängigkeitstyp {0}. Zulässige Werte sind: {1}.'
        },

        'Gnt.constraint.Base' : {
            name                                           : "Eine Einschränkung",
            "Remove the constraint"                        : "Einschränkung aufheben",
            "Cancel the change and do nothing"             : "Abbrechen der Änderung",
            // {0} task name, {1} constraint name
            "This action will cause a scheduling conflict" : 'Diese Aktion führt zu einem Planungskonflikt für die Zusammenfassungsaufgabe "{0}". Die {1} Einschränkung auf die Zusammenfassungsaufgabe setzt sie in Konflikt mit einer ihrer Teilaufgaben.'
        },

        'Gnt.constraint.implicit.Dependency' : {
            // {0} dependency type
            // {1} from task
            // {2} to task
            'You moved the task away'             : 'Sie haben die Aufgabe "{2}" aus "{1}" verschoben und beide Aufgaben sind miteinander verknüpft ({0}). Als Ergebnis kann die Verknüpfung der Aufgaben nicht mit der neuen Position der Aufgabe verwendet werden.',
            'You moved the task before'           : 'Sie haben die Aufgabe "{2}" vor Aufgabe “{1}“ verschoben und die Aufgaben sind miteinander verknüpft ({0}). Als Egebnis kann die Verknüpfung nicht erhalten werden.',
            'Remove the constraint'               : 'Lösche Abhängigkeit',
            depType0                              : 'Start-To-Start',
            depType1                              : 'Start-To-Finish',
            depType2                              : 'Finish-To-Start',
            depType3                              : 'Finish-To-Finish',
            'Keep the dependency & move the task' : 'Verschiebe den Task zu {0} und behalte die Abhängigkeiten bei'
        },

        'Gnt.constraint.implicit.PotentialConflict' : {
            'This could result in a scheduling conflict' : 'Sie setzen eine {0} Einschränkung auf die Aufgabe "{1}". Dies kann zu einem Planungskonflikt führen, da die Aufgabe einen verbundenen Vorläufer hat.',
            'Remove the constraint'                      : 'Fortsetzen. Legen Sie die {0} Einschränkung fest',
            'Replace the constraint'                     : 'Fortsetzen, aber den Konflikt stattdessen durch die Verwendung einer {0} Einschränkung vermeiden'
        },

        'Gnt.constraint.FinishNoEarlierThan' : {
            name                                : "Ende nicht früher als",
            // {0} date
            "Move the task to finish on {0}"    : "Verschiebe den Task um um {0} zu enden"
        },

        "Gnt.constraint.FinishNoLaterThan" : {
            name                                : "Ende nicht später als",
            // {0} date
            "Move the task to finish on {0}"    : "Verschiebe den Task um um {0} zu enden"
        },

        "Gnt.constraint.MustFinishOn" : {
            name                             : "Muss enden am",
            // {0} date
            "Move the task to finish on {0}" : "Verschiebe den Task um um {0} zu enden"
        },

        "Gnt.constraint.MustStartOn" : {
            name                            : "Muss anfangen am",
            // {0} date
            "Move the task to start at {0}" : "Verschiebe den Task um um {0} anzufangen"
        },

        "Gnt.constraint.StartNoEarlierThan" : {
            name                            : "Anfang nicht früher als ",
            // {0} date
            "Move the task to start at {0}" : "Verschiebe den Task um um {0} anzufangen"
        },

        "Gnt.constraint.StartNoLaterThan" : {
            name                            : "Anfang nicht später als ",
            // {0} date
            "Move the task to start at {0}" : "Verschiebe den Task um um {0} anzufangen"
        },

        "Gnt.column.ConstraintDate" : {
            text : "Datums-Beschränkung",
            format : 'd.m.Y H:i'
        },

        "Gnt.column.ConstraintType" : {
            text : "Einschränkung"
        },

        "Gnt.widget.ConstraintResolutionForm" : {
            dateFormat           : "d.m.Y H:i",
            "OK"                 : "OK",
            "Cancel"             : "Abbrechen",
            "Resolution options" : "Auflösungsoptionen",
            "Don't ask again"    : "Nicht mehr fragen",
            // {0} task name, {1} constraint name
            "Task {0} violates constraint {1}"     : "Task {0} verletzt Bedingung {1}",
            // {0} task name, {1} constraint name, {2} constraint date
            "Task {0} violates constraint {1} {2}" : "Task \"{0}\" verletzt die Bedingung {1}, {2}"
        },

        "Gnt.widget.ConstraintResolutionWindow" : {
            "Constraint violation" : "Gültigkeitsbereichs-Verletzung"
        },

        "Gnt.panel.ResourceHistogram" : {
            resourceText : 'Ressource'
        }
    },

    apply : function (classNames) {
        // apply corresponding scheduler locale first
        Sch.locale.De.apply(classNames);
        this.callParent(arguments);
    }
});
