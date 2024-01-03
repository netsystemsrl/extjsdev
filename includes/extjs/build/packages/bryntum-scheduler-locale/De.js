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

        'Sch.widget.EventEditor' : {
            saveText      : 'Speichern',
            deleteText    : 'Löschen',
            cancelText    : 'Abbrechen',
            nameText      : 'Name',
            allDayText    : 'Den ganzen Tag',
            startDateText : 'Start',
            endDateText   : 'Ende',
            resourceText  : 'Ressource'
        },

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
            dialogTitle      : 'Druckeinstellungen',
            exportButtonText : 'Drucken',
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
