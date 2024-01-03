// @tag alternative-locale
/**
 * Polish translations for the Gantt component
 * including Polish translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Gnt.locale.Pl', {
    extend      : 'Sch.locale.Locale',
    requires    : 'Sch.locale.Pl',
    singleton   : true,

    l10n        : {
        'Gnt.util.DurationParser' : {
            unitsRegex : {
                MILLI       : /^ms$|^mil/i,
                SECOND      : /^s$|^sek/i,
                MINUTE      : /^min/i,
                HOUR        : /^g$|^godzin/i,
                DAY         : /^d$|^dni|^dzie/i,
                WEEK        : /^t$|^tydzie|^tygodni/i,
                MONTH       : /^m$|^miesi/i,
                QUARTER     : /^kw$|^kwarta/i,
                YEAR        : /^r$|^rok$|^lat/i
            }
        },

        'Gnt.util.DependencyParser' : {
            typeText    : {
                SS  : 'RR',
                SF  : 'RZ',
                FS  : 'ZR',
                FF  : 'ZZ'
            }
        },

        'Gnt.panel.Timeline' : {
            start : 'Początek',
            end   : 'Koniec',
            format : 'Y-m-d'
        },

        'Gnt.field.ShowInTimeline' : {
            yes   : 'Tak',
            no    : 'Nie'
        },

        'Gnt.column.ShowInTimeline' : {
            text  : 'Dodaj do osi czasu'
        },

        'Gnt.field.ConstraintType' : {
            none : 'Brak',
            invalidText : 'Nieprawidłowa wartość'
        },

        'Gnt.field.Duration' : {
            invalidText : "Nieprawidłowa wartość czasu"
        },

        'Gnt.field.Cost' : {
            invalidText         : 'Nieprawidłowa wartość kosztów',
            currencySymbol      : 'zł',
            currencySymbolAlign : 'right'
        },

        'Gnt.field.Effort' : {
            invalidText : 'Niepoprawna wartość pracy'
        },

        'Gnt.field.Percent' : {
            invalidText : 'Niepoprawna wartość procentowa'
        },

        'Gnt.field.SchedulingMode' : {
            Normal              : 'Normalny',
            FixedDuration       : 'Zadanie o stałym czasie trwania',
            EffortDriven        : 'Według nakładu pracy',
            DynamicAssignment   : 'Dynamiczne przydzielanie',
            invalidText         : 'Nieprawidłowa wartość'
        },

        'Gnt.template.Deadline' : {
            deadline : 'Termin ostateczny'
        },

        'Gnt.column.DeadlineDate' : {
            text : 'Termin ostateczny'
        },

        'Gnt.Tooltip' : {
            startText       : 'Rozpoczyna się: ',
            endText         : 'Kończy: ',
            durationText    : 'Trwa: '
        },

        'Gnt.template.TaskTooltip' : {
            startText    : 'Rozpoczyna się',
            endText      : 'Kończy',
            percentText  : 'Wykonania',
            format       : 'Y-m-d',
            overflowText : '{[values.nbrOverflowing > 1 ? "Są jeszcze " + values.nbrOverflowing + " zadania" : "Jest jeszcze jedno zadanie"]}'
        },

        'Gnt.plugin.TaskContextMenu' : {
            projectInformation  : 'Informacje o projekcie...',
            taskInformation     : 'Informacje o zadaniu...',
            newTaskText         : 'Nowe zadanie',
            deleteTask          : 'Usuń zadanie(a)',
            editLeftLabel       : 'Edytuj lewą etykietę',
            editRightLabel      : 'Edytuj prawą etykietę',
            add                 : 'Dodaj...',
            deleteDependency    : 'Usuń zależność...',
            addTaskAbove        : 'Zadanie wyżej',
            addTaskBelow        : 'Zadanie poniżej',
            addMilestone        : 'Kamień milowy',
            addSubtask          : 'Pod-zadanie',
            addSuccessor        : 'Następce',
            addPredecessor      : 'Poprzednika',
            convertToMilestone  : 'Konwertuj na kamień milowy',
            convertToRegular    : 'Konwertuj na normalne zadanie',
            splitTask           : 'Podziel zadanie'
        },

        'Gnt.plugin.DependencyEditor' : {
            fromText            : 'Od',
            toText              : 'Do',
            typeText            : 'Typ',
            lagText             : 'Opóźnienie',
            endToStartText      : 'Koniec-Do-Początku',
            startToStartText    : 'Początek-Do-Początku',
            endToEndText        : 'Koniec-Do-Końca',
            startToEndText      : 'Początek-Do-Końca',
            okButtonText        : 'Ok',
            cancelButtonText    : 'Anuluj',
            deleteButtonText    : 'Usuń'
        },

        'Gnt.widget.calendar.Calendar' : {
            dayOverrideNameHeaderText : 'Nazwa',
            overrideName        : 'Nazwa',
            startDate           : 'Początek',
            endDate             : 'Koniec',
            error               : 'Błąd',
            dateText            : 'Data',
            addText             : 'Dodaj',
            editText            : 'Edytuj',
            removeText          : 'Usuń',
            workingDayText      : 'Dzień pracujący',
            weekendsText        : 'Weekend',
            overriddenDayText   : 'Nadpisany dzień',
            overriddenWeekText  : 'Nadpisany tydzień',
            workingTimeText     : 'Czas pracy',
            nonworkingTimeText  : 'Czas niepracujący',
            dayOverridesText    : 'Nadpisane dni',
            weekOverridesText   : 'Nadpisane tygodnie',
            okText              : 'OK',
            cancelText          : 'Anuluj',
            parentCalendarText  : 'Kalendarz-rodzic',
            noParentText        : 'Brak rodzica',
            selectParentText    : 'Wybierz rodzica',
            newDayName          : '[Bez nazwy]',
            calendarNameText    : 'Nazwa kalendarza',
            isProjectCalendarText     : 'Kalendarz projektu',
            tplTexts            : {
                tplWorkingHours : 'Godziny pracujące dla',
                tplIsNonWorking : 'jest niepracujący',
                tplOverride     : 'nadpisane',
                tplInCalendar   : 'w kalendarzu',
                tplDayInCalendar: 'normalny dzień w kalendarzu',
                tplBasedOn      : 'W oparciu'
            },
            overrideErrorText   : 'Ten dzień został juz nadpisany',
            overrideDateError   : 'Istnieje już nadpisany tydzień dla tej daty: {0}',
            startAfterEndError  : 'Data początku musi być wcześniejsza od daty końca',
            weeksIntersectError : 'Nadpisania tygodnia nie powinny się nakładać'
        },

        'Gnt.widget.calendar.AvailabilityGrid' : {
            startText          : 'Początek',
            endText            : 'Koniec',
            addText            : 'Dodaj',
            removeText         : 'Usuń',
            error              : 'Błąd'
        },

        'Gnt.widget.calendar.DayEditor' : {
            workingTimeText    : 'Czas pracujący',
            nonworkingTimeText : 'Czas niepracujący'
        },

        'Gnt.widget.calendar.WeekEditor' : {
            defaultTimeText    : 'Domyślny czas',
            workingTimeText    : 'Czas pracujący',
            nonworkingTimeText : 'Czas niepracujący',
            error              : 'Błąd',
            noOverrideError    : "Nadpisania tygodnia zawierają tylko 'domyślne' dni - nie można zapisać"
        },

        'Gnt.widget.calendar.ResourceCalendarGrid' : {
            name        : 'Nazwa',
            calendar    : 'Kalendarz'
        },

        'Gnt.widget.calendar.CalendarWindow' : {
            title   : 'Kalendarz',
            ok      : 'Ok',
            cancel  : 'Anuluj'
        },

        'Gnt.widget.calendar.CalendarManager' : {
            addText         : 'Dodaj',
            removeText      : 'Usuń',
            add_child       : 'Dodaj kalendarz podrzędny',
            add_node        : 'Dodaj kalendarz',
            add_sibling     : 'Dodaj kalendarz',
            remove          : 'Usuń',
            calendarName    : 'Kalendarz',
            confirm_action  : 'Potwierdź akcję',
            confirm_message : 'Kalendarz ma niezapisane zmiany. Czy chcesz je zachować?'
        },

        'Gnt.widget.calendar.CalendarManagerWindow' : {
            title           : 'Zarządzaj kalendarze',
            confirm_action  : 'Potwierdź akcję',
            confirm_message : 'Kalendarz ma niezapisane zmiany. Czy chcesz je zachować?',
            ok              : 'Zastosuj zmiany',
            cancel          : 'Anuluj'
        },


        'Gnt.field.Assignment' : {
            cancelText : 'Anuluj',
            closeText  : 'Zapisz i zamknij'
        },

        'Gnt.column.AssignmentUnits' : {
            text : 'Jednostki'
        },

        'Gnt.column.Duration' : {
            text : 'Czas trwania'
        },

        'Gnt.column.Effort' : {
            text : 'Praca'
        },

        'Gnt.column.BaselineEffort' : {
            text : 'Praca bazowego'
        },

        'Gnt.column.ActualEffort' : {
            text : 'Rzeczywisty Praca'
        },

        'Gnt.column.EffortVariance' : {
            text : 'Praca Zmienność'
        },

        'Gnt.column.Cost' : {
            text : 'Koszt'
        },

        'Gnt.column.BaselineCost' : {
            text : 'Koszt bazowego'
        },

        'Gnt.column.ActualCost' : {
            text : 'Koszt rzeczywisty'
        },

        'Gnt.column.CostVariance' : {
            text                : 'Odchylenie kosztowe',
            currencySymbol      : 'zł',
            currencySymbolAlign : 'right'
        },

        'Gnt.column.EndDate' : {
            text : 'Koniec'
        },

        'Gnt.column.PercentDone' : {
            text : '% Wykonania'
        },

        'Gnt.column.ResourceAssignment' : {
            text : 'Przypisane zasoby'
        },

        'Gnt.column.ResourceName' : {
            text : 'Nazwa zasobu'
        },

        'Gnt.column.Rollup' : {
            text : 'Rzutowanie',
            yes  : 'Tak',
            no   : 'Nie'
        },

        'Gnt.field.ManuallyScheduled' : {
            yes : 'Tak',
            no  : 'Nie'
        },

        'Gnt.field.ReadOnly' : {
            yes : 'Tak',
            no  : 'Nie'
        },

        'Gnt.column.ManuallyScheduled' : {
            text : 'Planowanie ręczne'
        },

        'Gnt.column.SchedulingMode' : {
            text : 'Tryb'
        },

        'Gnt.column.Predecessor' : {
            text : 'Poprzednicy'
        },

        'Gnt.column.Successor' : {
            text : 'Następcy'
        },

        'Gnt.column.StartDate' : {
            text : 'Początek'
        },

        'Gnt.column.WBS' : {
            text : '#'
        },

        'Gnt.column.Sequence' : {
            text : '#'
        },

        'Gnt.column.Calendar' : {
            text : 'Kalendarz'
        },

        'Gnt.column.ReadOnly' : {
            text : 'Tylko do odczytu'
        },

        'Gnt.widget.taskeditor.ProjectForm' : {
            nameText                : 'Nazwa',
            startText               : 'Początek',
            finishText              : 'Koniec',
            calendarText            : 'Kalendarz',
            readOnlyText            : 'Tylko Czytać',
            allowDependenciesText   : 'Rozwiązać zależności na zewnętrznych projektów'
        },

        'Gnt.widget.taskeditor.TaskForm' : {
            taskNameText            : 'Nazwa',
            durationText            : 'Długość',
            datesText               : 'Daty',
            baselineText            : 'Baseline',
            startText               : 'Początek',
            finishText              : 'Koniec',
            percentDoneText         : '% Wykonano',
            baselineStartText       : 'Początek',
            baselineFinishText      : 'Koniec',
            baselinePercentDoneText : '% Wykonano',
            baselineEffortText      : 'Praca',
            effortText              : 'Praca',
            invalidEffortText       : 'Niepoprawna wartość pracy',
            calendarText            : 'Kalendarz',
            manuallyScheduledText   : 'Planowanie ręczne',
            schedulingModeText      : 'Tryb kalendarza',
            rollupText              : 'Rzutowanie',
            wbsCodeText             : 'Kod WBS',
            "Constraint Type"       : 'Typ ograniczenia',
            "Constraint Date"       : 'Data ograniczenia',
            readOnlyText            : 'Tylko Czytać'
        },

        'Gnt.widget.DependencyGrid' : {
            addDependencyText   : 'Dodaj',
            dropDependencyText  : 'Usuń',
            idText                      : 'ID',
            snText                      : 'SN',
            taskText                    : 'Nazwa zadania',
            blankTaskText               : 'Proszę wybrać zadanie',
            invalidDependencyText       : 'Nieprawidłowa zależność',
            parentChildDependencyText   : 'Zależność pomiędzy dzieckiem a rodzicem znaleziona',
            duplicatingDependencyText   : 'Zduplikowana zależność znaleziona',
            transitiveDependencyText    : 'Przechodnia zależność',
            cyclicDependencyText        : 'Cykliczna zależność',
            typeText                    : 'Typ',
            lagText                     : 'Opóźnienie',
            clsText                     : 'Klasa CSS',
            endToStartText              : 'Koniec-Do-Początku',
            startToStartText            : 'Początek-Do-Początku',
            endToEndText                : 'Koniec-Do-Końca',
            startToEndText              : 'Początek-Do-Końca',
            predecessorsText            : 'Poprzedniki',
            successorsText              : 'Następniki'
        },

        'Gnt.widget.AssignmentEditGrid' : {
            confirmAddResourceTitle        : 'Potwierdz',
            confirmAddResourceText         : 'Nie ma jeszcze zasobu &quot;{0}&quot; . Czy chcesz go dodać?',
            noValueText                    : 'Proszę wybrać zasób do przypisania',
            noResourceText                 : 'Brak zasobu &quot;{0}&quot;',
            'Resource is already assigned' : 'Zasób jest już przypisany',
            addAssignmentText   : 'Dodaj',
            dropAssignmentText  : 'Usuń'
        },

        'Gnt.widget.taskeditor.ProjectEditor' : {
            generalText        : 'Ogólne',
            descriptionText    : 'Opis'
        },

        'Gnt.widget.taskeditor.TaskEditor' : {
            generalText         : 'Ogólne',
            resourcesText       : 'Zasoby',
            notesText           : 'Notatki',
            advancedText        : 'Zaawansowane'
        },

        'Gnt.plugin.taskeditor.BaseEditor' : {
            title           : 'Informacje o zadaniu',
            alertCaption    : 'Informacje',
            alertText       : 'Proszę poprawić zaznaczone błędy aby zapisać zmiany',
            okText          : 'Ok',
            cancelText      : 'Anuluj'
        },

        'Gnt.plugin.taskeditor.ProjectEditor' : {
            title        : 'Informacje o projekcie'
        },

        'Gnt.field.EndDate' : {
            endBeforeStartText : 'Data końca jest przed datą początku'
        },

        'Gnt.field.ConstraintDate' : {
            format : 'd/m/Y H:i'
        },

        'Gnt.column.Note'   : {
            text            : 'Notatki'
        },

        'Gnt.column.AddNew' : {
            text            : 'Dodaj kolumnę...'
        },

        'Gnt.column.EarlyStartDate' : {
            text            : 'Wczesny Start'
        },

        'Gnt.column.EarlyEndDate' : {
            text            : 'Wczesny Koniec'
        },

        'Gnt.column.LateStartDate' : {
            text            : 'Późny Start'
        },

        'Gnt.column.LateEndDate' : {
            text            : 'Późny Koniec'
        },

        'Gnt.field.Calendar' : {
            calendarNotApplicable : 'Kalendarz zadań nie nakłada się z przypisanymi kalendarzami zasobów',
            invalidText : 'Nieprawidłowa wartość'
        },

        'Gnt.column.Slack' : {
            text            : 'Swobodny zapas czasu'
        },

        'Gnt.column.TotalSlack' : {
            text            : 'Całkowity zapas czasu'
        },

        'Gnt.column.Name' : {
            text            : 'Nazwa zadania'
        },

        'Gnt.column.BaselineStartDate'   : {
            text            : 'Data rozpoczęcia lini bazowej'
        },

        'Gnt.column.BaselineEndDate'   : {
            text            : 'Data zakończenia lini bazowej'
        },

        'Gnt.column.Milestone'   : {
            text            : 'Kamień milowy'
        },

        'Gnt.field.Milestone'   : {
            yes             : 'Tak',
            no              : 'Nie'
        },

        'Gnt.field.Dependency'  : {
            invalidFormatText       : 'Nieprawidłowy format zależności',
            invalidDependencyText   : 'Zaleziono nieprawidłową zależność, proszę upewnij się że nie masz zapętleń pomiędzy zadaniami',
            invalidDependencyType   : 'Nieprawidłowy typ zależności {0}. Dozwolone wartości to: {1}.'
        },

        'Gnt.constraint.Base' : {
            name                                : "Ograniczenie",
            "Remove the constraint"             : "Usunąć ograniczenie",
            "Cancel the change and do nothing"  : "Anuluj zmiany",
            // {0} task name, {1} constraint name
            "This action will cause a scheduling conflict" : 'Ta akcja spowoduje konflikt planowania dla zadania zbiorczego "{0}". Ograniczenie {1} w zadaniu zbiorczym powoduje konflikt z jednym z jego podzadań.'
        },

        'Gnt.constraint.implicit.Dependency' : {
            // {0} dependency type
            // {1} from task
            // {2} to task
            'You moved the task away'             : 'Przeniesiono zadanie "{2}" z dala od "{1}", a oba zadania są połączone ({0}). W rezultacie link między zadaniami nie wpłynie na późniejszą pozycję zadania.',
            'You moved the task before'           : 'Przeniosłeś zadanie "{2}" przed "{1}" i oba zadania są połączone ({0}). W rezultacie link nie może być honorowany.',
            'Remove the constraint'               : 'Usuń zależność',
            depType0                              : 'Początek-Do-Początku',
            depType1                              : 'Początek-Do-Końca',
            depType2                              : 'Koniec-Do-Początku',
            depType3                              : 'Koniec-Do-Końca',
            'Keep the dependency & move the task' : 'Zachowaj zależność i przenieś zadanie do {0}'
        },

        'Gnt.constraint.implicit.PotentialConflict' : {
            'This could result in a scheduling conflict' : 'Ustawiasz ograniczenie {0} na zadaniu "{1}". Może to spowodować konflikt planowania, ponieważ zadanie ma poprzednika.',
            'Remove the constraint'                   : 'Kontynuuj. Ustaw ograniczenie {0}',
            'Replace the constraint'                  : 'Kontynuuj, ale unikaj konfliktu, używając ograniczenia {0}'
        },

        'Gnt.constraint.FinishNoEarlierThan' : {
            name                             : "Zakończ nie wcześniej niż",
            // {0} date
            "Move the task to finish on {0}" : "Przesuń zadanie aby kończyło się {0}"
        },

        "Gnt.constraint.FinishNoLaterThan" : {
            name                             : "Zakończ nie później niż ",
            // {0} date
            "Move the task to finish on {0}" : "Przesuń zadanie aby kończyło się {0}"
        },

        "Gnt.constraint.MustFinishOn" : {
            name                             : "Musi zakończyć się",
            // {0} date
            "Move the task to finish on {0}" : "Przesuń zadanie aby kończyło się {0}"
        },

        "Gnt.constraint.MustStartOn" : {
            name                             : "Musi rozpocząć się",
            // {0} date
            "Move the task to start at {0}"  : "Przesuń zadanie aby zaczynało się {0}"
        },

        "Gnt.constraint.StartNoEarlierThan" : {
            name                             : "Rozpocznij nie wcześniej niż ",
            // {0} date
            "Move the task to start at {0}"  : "Przesuń zadanie aby zaczynało się {0}"
        },

        "Gnt.constraint.StartNoLaterThan" : {
            name                             : "Rozpocznij nie później niż ",
            // {0} date
            "Move the task to start at {0}"  : "Przesuń zadanie aby zaczynało się {0}"
        },

        "Gnt.column.ConstraintDate" : {
            text : "Data ograniczenia",
            format : 'd/m/Y H:i'
        },

        "Gnt.column.ConstraintType" : {
            text : "Typ ograniczenia"
        },

        "Gnt.widget.ConstraintResolutionForm" : {
            dateFormat           : "d/m/Y H:i",
            "OK"                 : 'OK',
            "Cancel"             : 'Anuluj',
            "Resolution options" : "Opcje rozdzielczości",
            "Don't ask again"    : "Nie pytaj ponownie",
            // {0} task name, {1} constraint name
            "Task {0} violates constraint {1}"     : "Zadanie \"{0}\" narusza ograniczenie ",
            // {0} task name, {1} constraint name, {2} constraint date
            "Task {0} violates constraint {1} {2}" : "Zadanie \"{0}\" narusza ograniczenie {1} {2}"
        },

        "Gnt.widget.ConstraintResolutionWindow" : {
            "Constraint violation" : "Naruszenie ograniczenia"
        },

        "Gnt.panel.ResourceHistogram" : {
            resourceText : 'Zasób'
        }
    },


    apply : function (classNames) {
        // apply corresponding scheduler locale first
        Sch.locale.Pl.apply(classNames);
        this.callParent(arguments);
    }
});
