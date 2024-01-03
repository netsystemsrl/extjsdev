// @tag alternative-locale
/**
 * Polish translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Sch.locale.Pl', {
    extend    : 'Sch.locale.Locale',
    singleton : true,

    l10n : {
        'Sch.util.Date' : {
            unitNames : {
                YEAR    : { single : 'rok', plural : 'lata', abbrev : 'r' },
                QUARTER : { single : 'kwartał', plural : 'kwartały', abbrev : 'kw' },
                MONTH   : { single : 'miesiąc', plural : 'miesiące', abbrev : 'm' },
                WEEK    : { single : 'tydzień', plural : 'tygodnie', abbrev : 't' },
                DAY     : { single : 'dzień', plural : 'dni', abbrev : 'd' },
                HOUR    : { single : 'godzina', plural : 'godziny', abbrev : 'g' },
                MINUTE  : { single : 'minuta', plural : 'minuty', abbrev : 'min' },
                SECOND  : { single : 'sekunda', plural : 'sekundy', abbrev : 's' },
                MILLI   : { single : 'ms', plural : 'ms', abbrev : 'ms' }
            }
        },

        'Sch.panel.TimelineGridPanel' : {
            weekStartDay : 1,
            loadingText  : 'Wczytywanie, proszę czekać...',
            savingText   : 'Zapisywanie, proszę czekać...'
        },

        'Sch.panel.TimelineTreePanel' : {
            weekStartDay : 1,
            loadingText  : 'Wczytywanie, proszę czekać...',
            savingText   : 'Zapisywanie, proszę czekać...'
        },

        'Sch.mixin.SchedulerView' : {
            loadingText : "Wczytywanie danych..."
        },

        'Sch.plugin.CurrentTimeLine' : {
            tooltipText : 'Obecny czas'
        },

        'Sch.widget.EventEditor' : {
            saveText      : 'Zapisz',
            deleteText    : 'Usuń',
            cancelText    : 'Anuluj',
            nameText      : 'Nazwa',
            allDayText    : 'Cały dzień',
            startDateText : 'Początek',
            endDateText   : 'Koniec',
            resourceText  : 'Ratunek'
        },

        'Sch.plugin.SimpleEditor' : {
            newEventText : 'Nowe zdarzenie...'
        },

        'Sch.widget.ExportDialogForm' : {
            formatFieldLabel         : 'Format papieru',
            orientationFieldLabel    : 'Orientacja',
            rangeFieldLabel          : 'Zakres grafik',
            showHeaderLabel          : 'Pokaż nagłówek',
            showFooterLabel          : 'Pokaż stopka',
            orientationPortraitText  : 'Pionowa',
            orientationLandscapeText : 'Pozioma',
            completeViewText         : 'Kompletny grafik',
            currentViewText          : 'Obecny widok',
            dateRangeText            : 'Zesięg dat',
            dateRangeFromText        : 'Eksportuj od',
            dateRangeToText          : 'Eksportuj do',
            adjustCols               : 'Dostosuj szerokość kolumn',
            adjustColsAndRows        : 'Dostosuj szerokość kolumn i wysokość wierszy',
            exportersFieldLabel      : 'Sterowanie podziałem na strony',
            specifyDateRange         : 'Wybierz zakres dat',
            columnPickerLabel        : 'Wybierz kolumny',
            dpiFieldLabel            : 'DPI (pikseli na cal)',
            completeDataText         : 'Kompletny grafik (wszystkie zdarzenia)',
            rowsRangeLabel           : 'Zakres rzędy',
            allRowsLabel             : 'Wszystko rzędy',
            visibleRowsLabel         : 'Widoczny rzędy',
            columnEmptyText          : '[bez nazwy]'
        },

        'Sch.widget.ExportDialog' : {
            title            : 'Ustawienia eksportowania',
            exportButtonText : 'Eksportuj',
            cancelButtonText : 'Anuluj',
            progressBarText  : 'Eksportowanie...'
        },

        'Sch.plugin.Export' : {
            generalError          : 'Wystąpił błąd',
            fetchingRows          : 'Pobieranie wiersz {0} z {1}',
            builtPage             : 'Strona {0} z {1}',
            requestingPrintServer : 'Wysyłanie danych...'
        },

        'Sch.plugin.Printable' : {
            dialogTitle      : 'Preferencje drukowania',
            exportButtonText : 'Drukowanie',
            disablePopupBlocking : 'Wyłącz blokowanie wyskakujących okienek, ponieważ wtyczka Print musi otwierać nowe karty',
            popupBlockerDetected : 'Wykryto blokadę wyskakujących okienek przeglądarki'
        },

        'Sch.plugin.exporter.AbstractExporter' : {
            name : 'Exporter'
        },

        'Sch.plugin.exporter.SinglePage' : {
            name : 'Jedna strona'
        },

        'Sch.plugin.exporter.MultiPageVertical' : {
            name : 'Wiele stron (pionowo)'
        },

        'Sch.plugin.exporter.MultiPage' : {
            name : 'Wiele stron'
        },

        'Sch.column.ResourceName' : {
            name : 'Nazwa'
        },

        'Sch.template.DependencyInfo' : {
            fromText : 'Od',
            toText   : 'Do'
        },

        // -------------- View preset date formats/strings -------------------------------------
        'Sch.preset.Manager' : {

            hourAndDay : {
                displayDateFormat : 'g:i A',
                middleDateFormat  : 'g A',
                topDateFormat     : 'd/m/Y'
            },

            secondAndMinute : {
                displayDateFormat : 'g:i:s A',
                topDateFormat     : 'D, d H:i'
            },

            dayAndWeek : {
                displayDateFormat : 'd/m h:i A',
                middleDateFormat  : 'd/m/Y'
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
            },

            manyYears : {
                displayDateFormat : 'd/m/Y',
                middleDateFormat  : 'Y'
            }
        }
    }

});
