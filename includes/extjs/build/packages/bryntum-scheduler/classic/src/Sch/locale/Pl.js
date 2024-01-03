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
    
        'Sch.model.CalendarDay' : {
            startTimeAfterEndTime                   : 'Czas rozpoczęcia {0} jest większy niż czas zakończenia {1}',
            availabilityIntervalsShouldNotIntersect : 'Okresy dostępności nie powinny przecinać się: [{0}] i [{1}]',
            invalidFormat                           : 'Nieprawidłowy format dla ciągu dostępności: {0}. powinien mieć dokładny format: hh:mm-hh:mm'
        },

        "Sch.panel.SchedulerTree" : {
            'All day'    : 'Cały dzień'
        },

        "Sch.panel.SchedulerGrid" : {
            'All day'    : 'Cały dzień'
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
            loadingText : 'Wczytywanie danych...'
        },

        'Sch.plugin.CurrentTimeLine' : {
            tooltipText : 'Obecny czas'
        },

        //region Recurrence
        'Sch.widget.recurrence.ConfirmationDialog' : {
            'delete-title'              : 'Usuwasz wydarzenie',
            'delete-all-message'        : 'Czy chcesz usunąć wszystkie wystąpienia tego zdarzenia?',
            'delete-further-message'    : 'Czy chcesz usunąć to i wszystkie przyszłe wystąpienia tego zdarzenia lub tylko wybrane wystąpienie?',
            'delete-all-btn-text'       : 'Usuń wszystko',
            'delete-further-btn-text'   : 'Usuń wszystkie przyszłe zdarzenia',
            'delete-only-this-btn-text' : 'Usuń tylko to wydarzenie',

            'update-title'              : 'Zmieniasz powtarzające się wydarzenie',
            'update-all-message'        : 'Czy chcesz zmienić wszystkie wystąpienia tego wydarzenia?',
            'update-further-message'    : 'Czy chcesz zmienić tylko to zdarzenie, czy to i wszystkie przyszłe zdarzenia?',
            'update-all-btn-text'       : 'Wszystkie',
            'update-further-btn-text'   : 'Wszystkie przyszłe wydarzenia',
            'update-only-this-btn-text' : 'Tylko to wydarzenie',

            'Yes'    : 'Tak',
            'Cancel' : 'Anuluj'
        },

        'Sch.widget.recurrence.Dialog' : {
            'Repeat event' : 'Powtórz wydarzenie',
            'Cancel'       : 'Anuluj',
            'Save'         : 'Zapisz'
        },

        'Sch.widget.recurrence.Form' : {
            'Frequency'           : 'Częstotliwość',
            'Every'               : 'Każdy',
            'DAILYintervalUnit'   : 'dzień',
            'WEEKLYintervalUnit'  : 'tydzień:',
            'MONTHLYintervalUnit' : 'miesiące',
            'YEARLYintervalUnit'  : 'rok w:',
            'Each'                : 'Każdy',
            'On the'              : 'Na',
            'End repeat'          : 'Zakończ powtarzanie',
            'time(s)'             : 'raz'
        },

        'Sch.widget.recurrence.field.DaysComboBox' : {
            'day'         : 'dzień',
            'weekday'     : 'dzień powszedni',
            'weekend day' : 'dzień weekendowy'
        },

        'Sch.widget.recurrence.field.PositionsComboBox' : {
            'position1'  : 'pierwszy',
            'position2'  : 'druga',
            'position3'  : 'trzeci',
            'position4'  : 'czwarty',
            'position5'  : 'piąty',
            'position-1' : 'ostatni'
        },

        'Sch.data.util.recurrence.Legend' : {
            // list delimiters
            ', '                            : ', ',
            ' and '                         : ' i ',
            // frequency patterns
            'Daily'                         : 'Codziennie',
            'Weekly on {1}'                 : 'Co tydzień w {1}',
            'Monthly on {1}'                : 'Co miesiąc w {1}',
            'Yearly on {1} of {2}'          : 'Co roku w {1} z {2}',
            'Every {0} days'                : 'Co {0} dni',
            'Every {0} weeks on {1}'        : 'Co {0} tygodni w {1}',
            'Every {0} months on {1}'       : 'Co {0} miesięcy w {1}',
            'Every {0} years on {1} of {2}' : 'Co {0} lat {1} w {2}',
            // day position translations
            'position1'                     : 'pierwszy',
            'position2'                     : 'druga',
            'position3'                     : 'trzeci',
            'position4'                     : 'czwarty',
            'position5'                     : 'piąty',
            'position-1'                    : 'ostatni',
            // day options
            'day'                           : 'dzień',
            'weekday'                       : 'dzień powszedni',
            'weekend day'                   : 'dzień weekendowy',
            // {0} - day position info ("the last"/"the first"/...)
            // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
            // For example:
            //  "the last Sunday"
            //  "the first weekday"
            //  "the second weekend day"
            'daysFormat'                    : '{0} {1}'
        },

        'Sch.widget.recurrence.field.StopConditionComboBox' : {
            'Never'   : 'Nigdy',
            'After'   : 'Po',
            'On date' : 'Na randkę'
        },

        'Sch.widget.recurrence.field.FrequencyComboBox' : {
            'Daily'   : 'Codziennie',
            'Weekly'  : 'Tygodniowy',
            'Monthly' : 'Miesięcznie',
            'Yearly'  : 'Rocznie'
        },

        'Sch.widget.recurrence.field.RecurrenceComboBox' : {
            'None'      : 'Brak',
            'Custom...' : 'Niestandardowe...'
        },

        'Sch.widget.EventEditor' : {
            'Repeat'      : 'Powtarzaj',
            saveText      : 'Zapisz',
            deleteText    : 'Usuń',
            cancelText    : 'Anuluj',
            nameText      : 'Nazwa',
            allDayText    : 'Cały dzień',
            startDateText : 'Początek',
            endDateText   : 'Koniec',
            resourceText  : 'Ratunek'
        },
        //endregion Recurrence

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
            dialogTitle          : 'Preferencje drukowania',
            exportButtonText     : 'Drukowanie',
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

        'Sch.plugin.Split' : {
            splitText : 'Podzielić',
            mergeText : 'Ukryj podzieloną część'
        },

        'Sch.plugin.SummaryBar' : {
            totalText : 'Całkowity'
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
