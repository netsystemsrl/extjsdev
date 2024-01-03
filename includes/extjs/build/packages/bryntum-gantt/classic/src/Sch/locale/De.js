// @tag alternative-locale
/**
 * German translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Sch.locale.De', {
    extend    : 'Sch.locale.Locale',
    singleton : true,

    l10n : {
        'Sch.util.Date' : {
            unitNames : {
                YEAR    : { single : 'Jahr', plural : 'Jahre', abbrev : 'j' },
                QUARTER : { single : 'Quartal', plural : 'Quartale', abbrev : 'q' },
                MONTH   : { single : 'Monat', plural : 'Monate', abbrev : 'm' },
                WEEK    : { single : 'Woche', plural : 'Wochen', abbrev : 'w' },
                DAY     : { single : 'Tag', plural : 'Tage', abbrev : 't' },
                HOUR    : { single : 'Stunde', plural : 'Stunden', abbrev : 'h' },
                MINUTE  : { single : 'Minute', plural : 'Minuten', abbrev : 'min' },
                SECOND  : { single : 'Sekunde', plural : 'Sekunden', abbrev : 's' },
                MILLI   : { single : 'Millisekunde', plural : 'Millisekunden', abbrev : 'ms' }
            }
        },

        'Sch.model.CalendarDay' : {
            startTimeAfterEndTime                   : 'Die Startzeit {0} ist größer als die Endzeit {1}',
            availabilityIntervalsShouldNotIntersect : 'Verfügbarkeits Intervalle sollten sich nicht kreuzen: [{0}] und [{1}]',
            invalidFormat                           : 'Ungültiges Format für die Verfügbarkeit String: {0}. Es sollte exaktes Format haben: hh:mm-hh:mm'
        },

        "Sch.panel.SchedulerTree" : {
            'All day'    : 'Den ganzen Tag'
        },

        "Sch.panel.SchedulerGrid" : {
            'All day'    : 'Den ganzen Tag'
        },

        'Sch.panel.TimelineGridPanel' : {
            weekStartDay : 1,
            loadingText  : 'Lade Daten, bitte warten...',
            savingText   : 'Speichere Änderungen, bitte warten...'
        },

        'Sch.panel.TimelineTreePanel' : {
            weekStartDay : 1,
            loadingText  : 'Lade Daten, bitte warten...',
            savingText   : 'Speichere Änderungen, bitte warten...'
        },

        'Sch.mixin.SchedulerView' : {
            loadingText : 'Lade Daten, bitte warten...'
        },

        'Sch.plugin.CurrentTimeLine' : {
            tooltipText : 'Aktuelle Zeit'
        },

        //region Recurrence
        'Sch.widget.recurrence.ConfirmationDialog' : {
            'delete-title'              : 'Du löschst ein Ereignis',
            'delete-all-message'        : 'Möchten Sie alle Vorkommen dieses Ereignisses löschen?',
            'delete-further-message'    : 'Möchten Sie dieses und alle zukünftigen Vorkommen dieses Ereignisses oder nur das ausgewählte Vorkommen löschen?',
            'delete-all-btn-text'       : 'Alles löschen',
            'delete-further-btn-text'   : 'Alle zukünftigen Ereignisse löschen',
            'delete-only-this-btn-text' : 'Nur dieses Ereignis löschen',

            'update-title'              : 'Sie ändern ein sich wiederholendes Ereignis',
            'update-all-message'        : 'Möchten Sie alle Vorkommen dieses Ereignisses ändern?',
            'update-further-message'    : 'Möchten Sie nur dieses Vorkommen des Ereignisses oder dieses und aller zukünftigen Ereignisse ändern?',
            'update-all-btn-text'       : 'Alles',
            'update-further-btn-text'   : 'Alle zukünftigen Ereignisse',
            'update-only-this-btn-text' : 'Nur dieses Ereignis',

            'Yes'    : 'Ja',
            'Cancel' : 'Abbrechen'
        },

        'Sch.widget.recurrence.Dialog' : {
            'Repeat event' : 'Ereignis wiederholen',
            'Cancel'       : 'Abbrechen',
            'Save'         : 'Speichern'
        },

        'Sch.widget.recurrence.Form' : {
            'Frequency'           : 'Häufigkeit',
            'Every'               : 'Jede(n/r)',
            'DAILYintervalUnit'   : 'Tag',
            'WEEKLYintervalUnit'  : 'Woche am:',
            'MONTHLYintervalUnit' : 'Monat',
            'YEARLYintervalUnit'  : 'Jahr in:',
            'Each'                : 'Jeder',
            'On the'              : 'Am',
            'End repeat'          : 'Ende',
            'time(s)'             : 'Zeit'
        },

        'Sch.widget.recurrence.field.DaysComboBox' : {
            'day'         : 'Tag',
            'weekday'     : 'Wochentag',
            'weekend day' : 'Wochenend-Tag'
        },

        'Sch.widget.recurrence.field.PositionsComboBox' : {
            'position1'  : 'ersten',
            'position2'  : 'zweiten',
            'position3'  : 'dritten',
            'position4'  : 'vierten',
            'position5'  : 'fünften',
            'position-1' : 'letzten'
        },

        'Sch.data.util.recurrence.Legend' : {
            // list delimiters
            ', '                            : ', ',
            ' and '                         : ' und ',
            // frequency patterns
            'Daily'                         : 'Täglich',
            'Weekly on {1}'                 : 'Wöchentlich am {1}',
            'Monthly on {1}'                : 'Monatlich am {1}',
            'Yearly on {1} of {2}'          : 'Jährlich am {1} von {2}',
            'Every {0} days'                : 'Alle {0} Tage',
            'Every {0} weeks on {1}'        : 'Alle {0} Wochen am {1}',
            'Every {0} months on {1}'       : 'Alle {0} Monate auf {1}',
            'Every {0} years on {1} of {2}' : 'Alle {0} Jahre auf {1} von {2}',
            // day position translations
            'position1'                     : 'ersten',
            'position2'                     : 'zweiten',
            'position3'                     : 'dritten',
            'position4'                     : 'vierten',
            'position5'                     : 'fünften',
            'position-1'                    : 'letzten',
            // day options
            'day'                           : 'Tag',
            'weekday'                       : 'Wochentag',
            'weekend day'                   : 'Wochenend-Tag',
            // {0} - day position info ("the last"/"the first"/...)
            // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
            // For example:
            //  "the last Sunday"
            //  "the first weekday"
            //  "the second weekend day"
            'daysFormat'                    : '{0} {1}'
        },

        'Sch.widget.recurrence.field.StopConditionComboBox' : {
            'Never'   : 'Niemals',
            'After'   : 'Nach',
            'On date' : 'Am Tag'
        },

        'Sch.widget.recurrence.field.FrequencyComboBox' : {
            'Daily'   : 'täglich',
            'Weekly'  : 'wöchentlich',
            'Monthly' : 'monatlich',
            'Yearly'  : 'jährlich'
        },

        'Sch.widget.recurrence.field.RecurrenceComboBox' : {
            'None'      : 'Nie',
            'Custom...' : 'Benutzerdefiniert ...'
        },

        'Sch.widget.EventEditor' : {
            'Repeat'      : 'Wiederholen',
            saveText      : 'Speichern',
            deleteText    : 'Löschen',
            cancelText    : 'Abbrechen',
            nameText      : 'Name',
            allDayText    : 'Den ganzen Tag',
            startDateText : 'Start',
            endDateText   : 'Ende',
            resourceText  : 'Ressource'
        },
        //endregion Recurrence

        'Sch.plugin.SimpleEditor' : {
            newEventText : 'Neue Buchung...'
        },

        'Sch.widget.ExportDialogForm' : {
            formatFieldLabel         : 'Papierformat',
            orientationFieldLabel    : 'Ausrichtung',
            rangeFieldLabel          : 'Ansichtsbereich',
            showHeaderLabel          : 'Kopfzeile anzeigen',
            showFooterLabel          : 'Fußzeile anzeigen',
            orientationPortraitText  : 'Hochformat',
            orientationLandscapeText : 'Querformat',
            completeViewText         : 'Vollständige Ansicht',
            currentViewText          : 'Aktuelle Ansicht',
            dateRangeText            : 'Zeitraum',
            dateRangeFromText        : 'Exportieren ab',
            dateRangeToText          : 'Exportieren bis',
            adjustCols               : 'Spaltenbreite anpassen',
            adjustColsAndRows        : 'Spaltenbreite und Höhe anpassen',
            exportersFieldLabel      : 'Festlegen von Seitenumbrüchen',
            specifyDateRange         : 'Datumsbereich festlegen',
            columnPickerLabel        : 'Spalten auswählen',
            dpiFieldLabel            : 'DPI (Punkte pro Zoll)',
            completeDataText         : 'Vollständige Ansicht (alle Veranstaltungen)',
            rowsRangeLabel           : 'Zeilenbereich',
            allRowsLabel             : 'Alle Zeilen',
            visibleRowsLabel         : 'Sichtbare Zeilen',
            columnEmptyText          : '[Kein Titel]'
        },

        'Sch.widget.ExportDialog' : {
            title            : 'Export-Einstellungen',
            exportButtonText : 'Exportieren',
            cancelButtonText : 'Abbrechen',
            progressBarText  : 'Exportiere...'
        },

        'Sch.plugin.Export' : {
            generalError          : 'Ein Fehler ist aufgetreten',
            fetchingRows          : 'Lade Zeile {0} von {1}',
            builtPage             : 'Seite {0} von {1}',
            requestingPrintServer : 'Sende Daten...'
        },

        'Sch.plugin.Printable' : {
            dialogTitle          : 'Druckeinstellungen',
            exportButtonText     : 'Drucken',
            disablePopupBlocking : 'Bitte deaktivieren Sie die Popup-Blockierung, da das Print-Plugin in der Lage sein muss, neue Tabs zu öffnen.',
            popupBlockerDetected : 'Browser-Popup-Blocker erkannt'
        },

        'Sch.plugin.exporter.AbstractExporter' : {
            name : 'Exporter'
        },

        'Sch.plugin.exporter.SinglePage' : {
            name : 'Einzelne Seite'
        },

        'Sch.plugin.exporter.MultiPageVertical' : {
            name : 'Mehrere Seiten (vertikal)'
        },

        'Sch.plugin.exporter.MultiPage' : {
            name : 'Mehrere Seiten'
        },

        'Sch.plugin.Split' : {
            splitText : 'Aufteilen',
            mergeText : 'Split-Teil ausblenden'
        },

        'Sch.plugin.SummaryBar' : {
            totalText : 'Gesamt'
        },

        'Sch.column.ResourceName' : {
            name : 'Name'
        },

        'Sch.template.DependencyInfo' : {
            fromText : 'Von',
            toText   : 'Zu'
        },

        // -------------- View preset date formats/strings -------------------------------------
        'Sch.preset.Manager' : {
            hourAndDay : {
                displayDateFormat : 'G:i',
                middleDateFormat  : 'H',
                topDateFormat     : 'D, d. M. Y'
            },

            secondAndMinute : {
                displayDateFormat : 'G:i:s',
                topDateFormat     : 'D, d H:i'
            },

            dayAndWeek : {
                displayDateFormat : 'd.m. G:i',
                middleDateFormat  : 'd.m.Y'
            },

            weekAndDay : {
                displayDateFormat : 'd.m.',
                bottomDateFormat  : 'd. M',
                middleDateFormat  : 'Y F d'
            },

            weekAndMonth : {
                displayDateFormat : 'd.m.Y',
                middleDateFormat  : 'd.m.',
                topDateFormat     : 'd.m.Y'
            },

            weekAndDayLetter : {
                displayDateFormat : 'd.m.Y',
                middleDateFormat  : 'D, d. M. Y'
            },

            weekDateAndMonth : {
                displayDateFormat : 'd.m.Y',
                middleDateFormat  : 'd',
                topDateFormat     : 'Y F'
            },

            monthAndYear : {
                displayDateFormat : 'd.m.Y',
                middleDateFormat  : 'M. Y',
                topDateFormat     : 'Y'
            },

            manyYears : {
                displayDateFormat : 'd.m.Y',
                middleDateFormat  : 'Y'
            }
        }
    }

});
