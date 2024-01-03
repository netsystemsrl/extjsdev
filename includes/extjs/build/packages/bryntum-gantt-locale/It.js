// @tag alternative-locale
/**
 * Italian translations for the Gantt component
 * including Italian translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Gnt.locale.It', {
    extend      : 'Sch.locale.Locale',
    requires    : 'Sch.locale.It',
    singleton   : true,

    l10n        : {
        'Gnt.util.DurationParser' : {
            unitsRegex : {
                MILLI       : /^ms$|^mil/i,
                SECOND      : /^s$|^sec/i,
                MINUTE      : /^m$|^min/i,
                HOUR        : /^o$|^ora|^ore/i,
                DAY         : /^g$|^giorn/i,
                WEEK        : /^sett$|^settiman/i,
                MONTH       : /^mese|^mesi/i,
                QUARTER     : /^q$|^quar|^quadrimestr/i,
                YEAR        : /^a$|^an|^anno/i
            }
        },

        'Gnt.util.DependencyParser' : {
            typeText    : {
                SS  : 'II',
                SF  : 'IF',
                FS  : 'FI',
                FF  : 'FF'
            }
        },

        'Gnt.panel.Timeline' : {
            start : 'Inizio',
            end   : 'Fine',
            format : 'd/m/Y'
        },

        'Gnt.template.TaskTooltip' : {
            startText    : 'Inizio',
            endText      : 'Fine',
            percentText  : 'Svolta',
            format       : 'd/m/Y',
            overflowText : '{[values.nbrOverflowing > 1 ? "Ci sono altre " + values.nbrOverflowing + " attività" : "C’è un’altra attività"]}'
        },

        'Gnt.field.ShowInTimeline' : {
            yes   : 'Si',
            no    : 'No'
        },

        'Gnt.column.ShowInTimeline' : {
            text  : 'Aggiungi a sequenza temporale'
        },

        'Gnt.field.ConstraintType' : {
            none : 'Nessun vincolo',
            invalidText : 'Valore non valido'
        },

        'Gnt.field.Duration' : {
            invalidText : 'Valore non valido'
        },

        'Gnt.field.Cost' : {
            invalidText         : 'Valore non valido',
            currencySymbol      : '€',
            currencySymbolAlign : 'left'
        },

        'Gnt.field.Effort' : {
            invalidText : 'Valore non valido'
        },

        'Gnt.field.Percent' : {
            invalidText : 'Valore non valido'
        },

        'Gnt.field.SchedulingMode' : {
            Normal              : 'Normale',
            FixedDuration       : 'Attività di durata fissa',
            EffortDriven        : 'Basata sulle risorse',
            DynamicAssignment   : 'Attività dinamico',
            invalidText         : 'Valore non valido'
        },

        'Gnt.template.Deadline' : {
            deadline : 'Scadenza'
        },

        'Gnt.column.DeadlineDate' : {
            text : 'Scadenza'
        },

        'Gnt.Tooltip' : {
            startText       : 'Inizio: ',
            endText         : 'Fine: ',
            durationText    : 'Durata: '
        },

        'Gnt.plugin.TaskContextMenu' : {
            projectInformation  : 'Informazioni sul progetto...',
            taskInformation     : 'Informazioni Attività...',
            newTaskText         : 'Nuova attività',
            deleteTask          : 'Elimina attività',
            editLeftLabel       : 'Modifica etichetta sinistra',
            editRightLabel      : 'Modifica etichetta destra',
            add                 : 'Aggiungi...',
            deleteDependency    : 'Elimina dipendenza...',
            addTaskAbove        : 'Attività precedente',
            addTaskBelow        : 'Attività seguente',
            addMilestone        : 'Milestone',
            addSubtask          : 'Sotto-attività',
            addSuccessor        : 'Successore',
            addPredecessor      : 'Predecessore',
            convertToMilestone  : 'Converti in milestone',
            convertToRegular    : 'Conferti in attività normale',
            splitTask           : 'Dividi attività'
        },

        'Gnt.plugin.DependencyEditor' : {
            fromText            : 'Da',
            toText              : 'A',
            typeText            : 'Tipo',
            lagText             : 'Lag',
            endToStartText      : 'Fine-a-Inizio',
            startToStartText    : 'Inizio-a-Inizio',
            endToEndText        : 'Fine-a-Fine',
            startToEndText      : 'Inizio-a-Fine',
            okButtonText        : 'Ok',
            cancelButtonText    : 'Annulla',
            deleteButtonText    : 'Elimina'
        },

        'Gnt.widget.calendar.Calendar' : {
            dayOverrideNameHeaderText : 'Nome',
            overrideName        : 'Nome',
            startDate           : 'Data Inizio',
            endDate             : 'Data Fine',
            error               : 'Errore',
            dateText            : 'Data',
            addText             : 'Aggiungi',
            editText            : 'Modifica',
            removeText          : 'Rimuovi',
            workingDayText      : 'Giorni Lavorativi',
            weekendsText        : 'Fine Settimana',
            overriddenDayText   : 'Giorno escluso',
            overriddenWeekText  : 'Settimana esclusa',
            workingTimeText     : 'Orario lavorativo',
            nonworkingTimeText  : 'Orario non lavorativo',
            dayOverridesText    : 'Giorno escluso',
            weekOverridesText   : 'Settimana esclusa',
            okText              : 'OK',
            cancelText          : 'Annulla',
            parentCalendarText  : 'Calendario parente',
            noParentText        : 'Nessun parente',
            selectParentText    : 'Seleziona parente',
            newDayName          : '[Senza nome]',
            calendarNameText    : 'Nome Calendario',
            isProjectCalendarText   : 'Calendario di progetto',
            tplTexts            : {
                tplWorkingHours : 'Ore lavorative per',
                tplIsNonWorking : 'è non lavorativa',
                tplOverride     : 'bypassa',
                tplInCalendar   : 'in calendario',
                tplDayInCalendar: 'giorno standard in calendario',
                tplBasedOn      : 'Basata su'
            },
            overrideErrorText   : 'C\'è già un override per questo giorno',
            overrideDateError   : 'C\'è già un override di settimana per questa data: {0}',
            startAfterEndError  : 'La data di inizio deve essere precedente a quella di fine',
            weeksIntersectError : 'L\'override di settimana non deve intersecarsi'
        },

        'Gnt.widget.calendar.CalendarManager' : {
            addText         : 'Aggiungi',
            removeText      : 'Rimuovi',
            add_child       : 'Aggiungi sotto-calendario',
            add_node        : 'Aggiungi calendario',
            add_sibling     : 'Aggiungi calendario',
            remove          : 'Rimuovi',
            calendarName    : 'Calendario',
            confirm_action  : 'Conferma azione',
            confirm_message : 'Il calendario ha delle modifiche non salvate. Vuoi salvarle?'
        },

        'Gnt.widget.calendar.CalendarManagerWindow' : {
            title           : 'Gestire i calendari',
            ok              : 'Ok',
            cancel          : 'Annulla',
            confirm_action  : 'Conferma azione',
            confirm_message : 'Il calendario ha delle modifiche non salvate. Vuoi salvarle?'
        },

        'Gnt.widget.calendar.AvailabilityGrid' : {
            startText           : 'Inizio',
            endText             : 'Fine',
            addText             : 'Aggiungi',
            removeText          : 'Rimuovi',
            error               : 'Errore'
        },

        'Gnt.widget.calendar.DayEditor' : {
            workingTimeText    : 'Tempo lavorativo',
            nonworkingTimeText : 'Tempo non-lavorativo'
        },

        'Gnt.widget.calendar.WeekEditor' : {
            defaultTimeText    : 'Tempo predefinito',
            workingTimeText    : 'Tempo lavorativo',
            nonworkingTimeText : 'Tempo non-lavorativo',
            error              : 'Errore',
            noOverrideError    : "L\'override settimanale contiene solo giorni 'predefiniti' - non posso salvarlo"
        },

        'Gnt.widget.calendar.ResourceCalendarGrid' : {
            name        : 'Nome',
            calendar    : 'Calendario'
        },

        'Gnt.widget.calendar.CalendarWindow' : {
            title   : 'Calendario',
            ok      : 'Ok',
            cancel  : 'Annulla'
        },

        'Gnt.field.Assignment' : {
            cancelText : 'Annulla',
            closeText  : 'Salva e Chiudi'
        },

        'Gnt.column.AssignmentUnits' : {
            text : 'Unità'
        },

        'Gnt.column.Duration' : {
            text : 'Durata'
        },

        'Gnt.column.Effort' : {
            text : 'Impegno'
        },

        'Gnt.column.BaselineEffort' : {
            text : 'Impegno previsto'
        },

        'Gnt.column.ActualEffort' : {
            text : 'Impegno effettivo'
        },

        'Gnt.column.EffortVariance' : {
            text : 'Impegno variazione'
        },

        'Gnt.column.Cost' : {
            text : 'Costo'
        },

        'Gnt.column.BaselineCost' : {
            text : 'Costo previsto'
        },

        'Gnt.column.ActualCost' : {
            text : 'Costo effettivo'
        },

        'Gnt.column.CostVariance' : {
            text                : 'Costo variazione',
            currencySymbol      : '€',
            currencySymbolAlign : 'left'
        },

        'Gnt.column.EndDate' : {
            text : 'Fine'
        },

        'Gnt.column.PercentDone' : {
            text : '% Svolta'
        },

        'Gnt.column.ResourceAssignment' : {
            text : 'Risorse Assegnate'
        },

        'Gnt.column.ResourceName' : {
            text : 'Nome Risorsa'
        },

        'Gnt.column.Rollup' : {
            text : 'Riporta',
            yes  : 'Si',
            no   : 'No'
        },

        'Gnt.field.ManuallyScheduled' : {
            yes : 'Si',
            no  : 'No'
        },

        'Gnt.field.ReadOnly' : {
            yes : 'Si',
            no  : 'No'
        },

        'Gnt.column.ManuallyScheduled' : {
            text : 'Programmata manualmente'
        },

        'Gnt.column.SchedulingMode' : {
            text : 'Modalità'
        },

        'Gnt.column.Predecessor' : {
            text : 'Predecessore'
        },

        'Gnt.column.Successor' : {
            text : 'Successore'
        },

        'Gnt.column.StartDate' : {
            text : 'Inizio'
        },

        'Gnt.column.WBS' : {
            text : '#'
        },

        'Gnt.column.Sequence' : {
            text : '#'
        },

        'Gnt.column.Calendar' : {
            text : 'Calendario'
        },

        'Gnt.column.ReadOnly' : {
            text : 'Sola lettura'
        },

        'Gnt.widget.taskeditor.ProjectForm' : {
            nameText                : 'Nome',
            startText               : 'Inizio',
            finishText              : 'Fine',
            calendarText            : 'Calendario',
            readOnlyText            : 'Sola lettura',
            allowDependenciesText   : 'Consentire le dipendenze tra progetti'
        },

        'Gnt.widget.taskeditor.TaskForm' : {
            taskNameText            : 'Nome',
            durationText            : 'Durata',
            datesText               : 'Date',
            baselineText            : 'Riferimento',
            startText               : 'Inizio',
            finishText              : 'Fine',
            percentDoneText         : 'Percentuale Completamento',
            baselineStartText       : 'Inizio',
            baselineFinishText      : 'Fine',
            baselinePercentDoneText : 'Percentuale Completamento',
            baselineEffortText      : 'Impegno',
            effortText              : 'Impegno',
            invalidEffortText       : 'Valore impegno non valido',
            calendarText            : 'Calendario',
            manuallyScheduledText   : 'Programmata manualmente',
            schedulingModeText      : 'Modalità schedulazione',
            rollupText              : 'Riporta',
            wbsCodeText             : 'Codice WBS',
            "Constraint Type"       : 'Tipo di vincolo',
            "Constraint Date"       : 'Data vincolo',
            readOnlyText            : 'Sola lettura'
        },

        'Gnt.widget.DependencyGrid' : {
            addDependencyText   : 'Aggiungi nuova',
            dropDependencyText  : 'Elimina',
            idText                      : 'ID',
            snText                      : 'SN',
            taskText                    : 'Nome attività',
            blankTaskText               : 'Selezionare attività',
            invalidDependencyText       : 'Dipendenza non valida',
            parentChildDependencyText   : 'Trovata dipendenza tra figlio e parente',
            duplicatingDependencyText   : 'Trovata duplicazione dipendenza',
            transitiveDependencyText    : 'Dipendenza transitiva',
            cyclicDependencyText        : 'Dipendenza ciclica',
            typeText                    : 'Tipo',
            lagText                     : 'Lag',
            clsText                     : 'Classe CSS',
            endToStartText              : 'Fine-a-Inizio',
            startToStartText            : 'Inizio-a-Inizio',
            endToEndText                : 'Fine-a-Fine',
            startToEndText              : 'Inizio-a-Fine',
            predecessorsText            : 'Predecessori',
            successorsText              : 'Successori'
        },

        'Gnt.widget.AssignmentEditGrid' : {
            confirmAddResourceTitle        : 'Conferma',
            confirmAddResourceText         : 'Nessuna risorsa &quot;{0}&quot; nell\'archivio al momento. Desideri aggiungerla?',
            noValueText                    : 'Seleziona una risorsa da assegnare',
            noResourceText                 : 'Nessuna risorsa &quot;{0}&quot; in archivio',
            'Resource is already assigned' : 'La risorsa è già assegnata',
            addAssignmentText   : 'Aggiungi nuova',
            dropAssignmentText  : 'Elimina'
        },

        'Gnt.widget.taskeditor.ProjectEditor' : {
            generalText        : 'Generale',
            descriptionText    : 'Descrizione'
        },

        'Gnt.widget.taskeditor.TaskEditor' : {
            generalText         : 'Generale',
            resourcesText       : 'Risorse',
            notesText           : 'Note',
            advancedText        : 'Avanzate'
        },

        'Gnt.plugin.taskeditor.BaseEditor' : {
            title           : 'Informazioni Attività',
            alertCaption    : 'Informazioni',
            alertText       : 'Correggi gli errori marcati per salvare i cambiamenti',
            okText          : 'Ok',
            cancelText      : 'Annulla'
        },

        'Gnt.plugin.taskeditor.ProjectEditor' : {
            title        : 'Informazioni sul progetto'
        },

        'Gnt.field.EndDate' : {
            endBeforeStartText : 'La data di fine è precedente a quella di inizio'
        },

        'Gnt.field.ConstraintDate' : {
            format : 'd/m/Y H:i'
        },

        'Gnt.column.Note'   : {
            text            : 'Note'
        },

        'Gnt.column.AddNew' : {
            text            : 'Aggiungi nuova colonna...'
        },

        'Gnt.column.EarlyStartDate' : {
            text            : 'Inizio Anticipato'
        },

        'Gnt.column.EarlyEndDate' : {
            text            : 'Fine Anticipata'
        },

        'Gnt.column.LateStartDate' : {
            text            : 'Inizio Ritardato'
        },

        'Gnt.column.LateEndDate' : {
            text            : 'Fine Ritardata'
        },

        'Gnt.field.Calendar' : {
            calendarNotApplicable : 'Il calendario attività non ha sovrapposizioni con il calendario delle risorse assegnate',
            invalidText : 'Valore non valido'
        },

        'Gnt.column.Slack' : {
            text            : 'Marg. di fless. libero'
        },

        'Gnt.column.TotalSlack' : {
            text            : 'Marg. di fless. totale'
        },

        'Gnt.column.Name'   : {
            text            : 'Nome Attività'
        },

        'Gnt.column.BaselineStartDate'   : {
            text            : 'Data Inizio Riferimento'
        },

        'Gnt.column.BaselineEndDate'   : {
            text            : 'Data Fine Riferimento'
        },

        'Gnt.column.Milestone'   : {
            text            : 'Milestone'
        },

        'Gnt.field.Milestone'   : {
            yes             : 'Si',
            no              : 'No'
        },

        'Gnt.field.Dependency'  : {
            invalidFormatText       : 'Formato della dipendenza non valido',
            invalidDependencyText   : 'Dipendenza non valida, per favore assicurati di non avere percorsi ciclici tra le tue attività',
            invalidDependencyType   : 'Tipo di dipendenza non valido {0}. I valori ammessi sono: {1}.'
        },

        'Gnt.constraint.Base' : {
            name                                : "Un vincolo",
            "Remove the constraint"             : "Rimuovere il vincolo",
            "Cancel the change and do nothing"  : "Annulla il cambiamento",
            // {0} task name, {1} constraint name
            "This action will cause a scheduling conflict" : 'Questa azione provocherà un conflitto di pianificazione per l\'attività di riepilogo "{0}". Il vincolo {1} sull\'attività di riepilogo crea un conflitto con una delle sotto-attività.'
        },

        'Gnt.constraint.implicit.Dependency' : {
            // {0} dependency type
            // {1} from task
            // {2} to task
            'You moved the task away'             : 'Hai spostato l\'attività "{2}" da "{1}" ed entrambe sono collegate ({0}). Di conseguenza il collegamento tra le attività non guiderà la posizione successiva dell\'attività.',
            'You moved the task before'           : 'Hai spostato l\'attività "{2}" prima di "{1}" ed entrambe sono collegate ({0}). Di conseguenza il collegamento non può essere rispettato.',
            'Remove the constraint'               : 'Elimina dipendenza',
            depType0                              : 'Inizio-a-Inizio',
            depType1                              : 'Inizio-a-Fine',
            depType2                              : 'Fine-a-Inizio',
            depType3                              : 'Fine-a-Fine',
            'Keep the dependency & move the task' : 'Mantieni la dipendenza e sposta l\'attività in {0}'
        },

        'Gnt.constraint.implicit.PotentialConflict' : {
            'This could result in a scheduling conflict' : 'Hai impostato il vincolo {0} sull\'attività "{1}". Questo potrebbe provocare un conflitto di pianificazione poichè l\'attività ha un predecessore.',
            'Remove the constraint'                      : 'Continua. Imposta il vincolo {0}',
            'Replace the constraint'                     : 'Continua ma evita il conflitto usando invece il vincolo {0}'
        },

        'Gnt.constraint.FinishNoEarlierThan' : {
            name                             : "Finire non prima del",
            // {0} date
            "Move the task to finish on {0}" : "Sposta l'attività per finire il {0}"
        },

        "Gnt.constraint.FinishNoLaterThan" : {
            name                             : "Finire non oltre il",
            // {0} date
            "Move the task to finish on {0}" : "Sposta l'attività per finire il {0}"
        },

        "Gnt.constraint.MustFinishOn" : {
            name                             : "Deve finire il",
            // {0} date
            "Move the task to finish on {0}" : "Sposta l'attività per finire il {0}"
        },

        "Gnt.constraint.MustStartOn" : {
            name                            : "Deve iniziare il",
            // {0} date
            "Move the task to start at {0}" : "Sposta l'attività per iniziare il {0}"
        },

        "Gnt.constraint.StartNoEarlierThan" : {
            name                            : "Iniziare non prima del",
            // {0} date
            "Move the task to start at {0}" : "Sposta l'attività per iniziare il {0}"
        },

        "Gnt.constraint.StartNoLaterThan" : {
            name                            : "Iniziare non oltre il",
            // {0} date
            "Move the task to start at {0}" : "Sposta l'attività per iniziare il {0}"
        },

        "Gnt.column.ConstraintDate" : {
            text : "Data vincolo",
            format : 'd/m/Y H:i'
        },

        "Gnt.column.ConstraintType" : {
            text : "Tipo di vincolo"
        },

        "Gnt.widget.ConstraintResolutionForm" : {
            dateFormat           : "d/m/Y H:i",
            "OK"                 : "OK",
            "Cancel"             : "Annulla",
            "Resolution options" : "Opzioni di risoluzione",
            "Don't ask again"    : "Non chiedermelo più",
            // {0} task name, {1} constraint name
            "Task {0} violates constraint {1}"     : "L'attività \"{0}\" non rispetta il vincolo {1}",
            // {0} task name, {1} constraint name, {2} constraint date
            "Task {0} violates constraint {1} {2}" : "L'attività \"{0}\" non rispetta il vincolo {1} {2}"
        },

        "Gnt.widget.ConstraintResolutionWindow" : {
            "Constraint violation" : "Violazione di un vincolo"
        },

        "Gnt.panel.ResourceHistogram" : {
            resourceText : 'Risorsa'
        }
    },


    apply : function (classNames) {
        // apply corresponding scheduler locale first
        Sch.locale.It.apply(classNames);
        this.callParent(arguments);
    }
});
