// @tag alternative-locale
/**
 * Italian translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Sch.locale.It', {
    extend    : 'Sch.locale.Locale',
    singleton : true,

    l10n : {
        'Sch.util.Date' : {
            unitNames : {
                YEAR    : { single : 'anno', plural : 'anni', abbrev : 'anno' },
                QUARTER : { single : 'quadrimestre', plural : 'quadrimestri', abbrev : 'q' },
                MONTH   : { single : 'mese', plural : 'mesi', abbrev : 'mese' },
                WEEK    : { single : 'settimana', plural : 'settimane', abbrev : 'sett' },
                DAY     : { single : 'giorno', plural : 'giorni', abbrev : 'g' },
                HOUR    : { single : 'ora', plural : 'ore', abbrev : 'o' },
                MINUTE  : { single : 'minuto', plural : 'minuti', abbrev : 'min' },
                SECOND  : { single : 'secondo', plural : 'secondi', abbrev : 's' },
                MILLI   : { single : 'ms', plural : 'ms', abbrev : 'ms' }
            }
        },
    
        'Sch.model.CalendarDay' : {
            startTimeAfterEndTime                   : 'Ora di inizio {0} è maggiore dell\'ora di fine {1}',
            availabilityIntervalsShouldNotIntersect : 'Gli intervalli di disponibilità non devono intersecarsi: [{0}] e [{1}]',
            invalidFormat                           : 'Formato non valido per la stringa di disponibilità: {0}. dovrebbe avere il formato esatto: hh:mm-hh:mm'
        },

        "Sch.panel.SchedulerTree" : {
            'All day'    : 'Tutto il giorno'
        },

        "Sch.panel.SchedulerGrid" : {
            'All day'    : 'Tutto il giorno'
        },

        'Sch.panel.TimelineGridPanel' : {
            weekStartDay : 1,
            loadingText  : 'Caricamento in corso, attendere prego...',
            savingText   : 'Saving changes, attendere prego...'
        },

        'Sch.panel.TimelineTreePanel' : {
            weekStartDay : 1,
            loadingText  : 'Caricamento in corso, attendere prego...',
            savingText   : 'Saving changes, attendere prego...'
        },

        'Sch.mixin.SchedulerView' : {
            loadingText : 'Caricamento eventi...'
        },

        'Sch.plugin.CurrentTimeLine' : {
            tooltipText : 'Tempo attuale'
        },

        //region Recurrence
        'Sch.widget.recurrence.ConfirmationDialog' : {
            'delete-title'              : 'Stai cancellando un evento',
            'delete-all-message'        : 'Vuoi cancellare tutte le occorrenze di questo evento?',
            'delete-further-message'    : "Vuoi cancellare questo e tutte le occorrenze futuro di questo evento, o solo l'occorrenza selezionata?",
            'delete-all-btn-text'       : 'Elimina tutto',
            'delete-further-btn-text'   : 'Elimina tutti gli eventi futuri',
            'delete-only-this-btn-text' : 'Elimina solo questo evento',

            'update-title'              : 'Stai cambiando un evento ricorrente',
            'update-all-message'        : 'Vuoi cambiare tutte le occorrenze di questo evento?',
            'update-further-message'    : "Vuoi cambiare solo questa occorrenza dell'evento, o questo e tutti gli eventi futuri?",
            'update-all-btn-text'       : 'Tutti',
            'update-further-btn-text'   : 'Tutti gli eventi futuri',
            'update-only-this-btn-text' : 'Solo questo evento',

            'Yes'    : 'Si',
            'Cancel' : 'Annulla'
        },

        'Sch.widget.recurrence.Dialog' : {
            'Repeat event' : 'Ripeti evento',
            'Cancel'       : 'Annulla',
            'Save'         : 'Salva'
        },

        'Sch.widget.recurrence.Form' : {
            'Frequency'           : 'Frequenza',
            'Every'               : 'Ogni',
            'DAILYintervalUnit'   : 'giorno',
            'WEEKLYintervalUnit'  : 'settimana su:',
            'MONTHLYintervalUnit' : 'mese',
            'YEARLYintervalUnit'  : 'anno in:',
            'Each'                : 'Ogni',
            'On the'              : 'Sul',
            'End repeat'          : 'Fine ripetizione',
            'time(s)'             : 'tempo'
        },

        'Sch.widget.recurrence.field.DaysComboBox' : {
            'day'         : 'giorno',
            'weekday'     : 'giorno della settimana',
            'weekend day' : 'giorno del fine settimana'
        },

        'Sch.widget.recurrence.field.PositionsComboBox' : {
            'position1'  : 'primo',
            'position2'  : 'secondo',
            'position3'  : 'terzo',
            'position4'  : 'quarto',
            'position5'  : 'quinto',
            'position-1' : 'ultimo'
        },

        'Sch.data.util.recurrence.Legend' : {
            // list delimiters
            ', '                            : ', ',
            ' and '                         : ' e ',
            // frequency patterns
            'Daily'                         : 'Quotidiano',
            'Weekly on {1}'                 : 'Settimanale su {1}',
            'Monthly on {1}'                : 'Mensile su {1}',
            'Yearly on {1} of {2}'          : 'Ogni anno su {1} di {2}',
            'Every {0} days'                : 'Ogni {0} giorni',
            'Every {0} weeks on {1}'        : 'Ogni {0} settimane su {1}',
            'Every {0} months on {1}'       : 'Ogni {0} mesi su {1}',
            'Every {0} years on {1} of {2}' : 'Ogni {0} anni su {1} di {2}',
            // day position translations
            'position1'                     : 'il primo',
            'position2'                     : 'il secondo',
            'position3'                     : 'il terzo',
            'position4'                     : 'il quarto',
            'position5'                     : 'il quinto',
            'position-1'                    : "l'ultimo",
            // day options
            'day'                           : 'giorno',
            'weekday'                       : 'giorno della settimana',
            'weekend day'                   : 'giorno del fine settimana',
            // {0} - day position info ("the last"/"the first"/...)
            // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
            // For example:
            //  "the last Sunday"
            //  "the first weekday"
            //  "the second weekend day"
            'daysFormat'                    : '{0} {1}'
        },

        'Sch.widget.recurrence.field.StopConditionComboBox' : {
            'Never'   : 'Mai',
            'After'   : 'Dopo',
            'On date' : 'Alla data'
        },

        'Sch.widget.recurrence.field.FrequencyComboBox' : {
            'Daily'   : 'Quotidiano',
            'Weekly'  : 'Settimanale',
            'Monthly' : 'Mensile',
            'Yearly'  : 'Annuale'
        },

        'Sch.widget.recurrence.field.RecurrenceComboBox' : {
            'None'      : 'Nessuno',
            'Custom...' : 'Personalizzato...'
        },

        'Sch.widget.EventEditor' : {
            'Repeat'      : 'Ripeti',
            saveText      : 'Salva',
            deleteText    : 'Elimina',
            cancelText    : 'Annulla',
            nameText      : 'Nome',
            allDayText    : 'Tutto il giorno',
            startDateText : 'Inizio',
            endDateText   : 'Fine',
            resourceText  : 'Risorsa'
        },
        //endregion Recurrence

        'Sch.plugin.SimpleEditor' : {
            newEventText : 'Nuova prenotazione...'
        },

        'Sch.widget.ExportDialogForm' : {
            formatFieldLabel         : 'Formato Carta',
            orientationFieldLabel    : 'Orientamento',
            rangeFieldLabel          : 'Range di schedulatore',
            showHeaderLabel          : 'Mostra intestazione',
            showFooterLabel          : 'Mostra piè di pagina',
            orientationPortraitText  : 'Verticale',
            orientationLandscapeText : 'Orizzontale',
            completeViewText         : 'Schedulatore completo',
            currentViewText          : 'Vista attuale',
            dateRangeText            : 'Range di date',
            dateRangeFromText        : 'Esporta da',
            dateRangeToText          : 'Esporta a',
            adjustCols               : 'Imposta larghezza colonna',
            adjustColsAndRows        : 'Imposta larghezza colonna e altezza riga',
            exportersFieldLabel      : 'Controllare l\'impaginazione',
            specifyDateRange         : 'Specifica intervallo date',
            columnPickerLabel        : 'Scegli colonne',
            dpiFieldLabel            : 'DPI (punti per pollice)',
            completeDataText         : 'Schedulatore completo (tutti gli eventi)',
            rowsRangeLabel           : 'Range di riga',
            allRowsLabel             : 'Tutte le righe',
            visibleRowsLabel         : 'Righe visibili',
            columnEmptyText          : '[senza titolo]'
        },

        'Sch.widget.ExportDialog' : {
            title            : 'Impostazioni Esportazione',
            exportButtonText : 'Esporta',
            cancelButtonText : 'Annulla',
            progressBarText  : 'Esporta...'
        },

        'Sch.plugin.Export' : {
            generalError          : 'Si è verificato un errore',
            fetchingRows          : 'Riga {0} di {1}',
            builtPage             : 'Pagina {0} di {1}',
            requestingPrintServer : 'L\'invio dei dati...'
        },

        'Sch.plugin.Printable' : {
            dialogTitle          : 'Preferenze stampa',
            exportButtonText     : 'Stampa',
            disablePopupBlocking : 'Disabilita il blocco popup in quanto il plug-in di stampa deve essere in grado di aprire nuove schede',
            popupBlockerDetected : 'Rilevato blocco popup del browser'
        },

        'Sch.plugin.exporter.AbstractExporter' : {
            name : 'Exporter'
        },

        'Sch.plugin.exporter.SinglePage' : {
            name : 'Pagina singola'
        },

        'Sch.plugin.exporter.MultiPageVertical' : {
            name : 'Più pagine (verticalmente)'
        },

        'Sch.plugin.exporter.MultiPage' : {
            name : 'Più pagine'
        },

        'Sch.plugin.Split' : {
            splitText : 'Dividere',
            mergeText : 'Nascondi la parte divisa'
        },

        'Sch.plugin.SummaryBar' : {
            totalText : 'Totale'
        },

        'Sch.column.ResourceName' : {
            name : 'Nome'
        },

        'Sch.template.DependencyInfo' : {
            fromText : 'Da',
            toText   : 'A'
        },

        // -------------- View preset date formats/strings -------------------------------------
        'Sch.preset.Manager' : {
            hourAndDay : {
                displayDateFormat : 'G:i',
                middleDateFormat  : 'G:i',
                topDateFormat     : 'D d/m'
            },

            secondAndMinute : {
                displayDateFormat : 'G:i',
                topDateFormat     : 'D, d/m G:i'
            },

            dayAndWeek : {
                displayDateFormat : 'd/m h:i A',
                middleDateFormat  : 'D d M'
            },

            weekAndDay : {
                displayDateFormat : 'd/m',
                bottomDateFormat  : 'd M',
                middleDateFormat  : 'Y F d'
            },

            weekAndMonth : {
                displayDateFormat : 'd/m/Y',
                middleDateFormat  : 'd/m',
                topDateFormat     : 'd/m/Y'
            },

            weekAndDayLetter : {
                displayDateFormat : 'd/m/Y',
                middleDateFormat  : 'D d M Y'
            },

            weekDateAndMonth : {
                displayDateFormat : 'd/m/Y',
                middleDateFormat  : 'd',
                topDateFormat     : 'Y F'
            },

            monthAndYear : {
                displayDateFormat : 'd/m/Y',
                middleDateFormat  : 'M Y',
                topDateFormat     : 'Y'
            },

            year : {
                displayDateFormat : 'd/m/Y',
                middleDateFormat  : 'Y'
            }
        }
    }

});
