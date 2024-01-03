// @tag alternative-locale
/**
 * Swedish translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Sch.locale.SvSE', {
    extend    : 'Sch.locale.Locale',
    singleton : true,


    l10n : {
        'Sch.util.Date' : {
            unitNames : {
                YEAR    : { single : 'år', plural : 'år', abbrev : 'år' },
                QUARTER : { single : 'kvartal', plural : 'kvartal', abbrev : 'kv' },
                MONTH   : { single : 'månad', plural : 'månader', abbrev : 'mån' },
                WEEK    : { single : 'vecka', plural : 'veckor', abbrev : 'v' },
                DAY     : { single : 'dag', plural : 'dagar', abbrev : 'd' },
                HOUR    : { single : 'timme', plural : 'timmar', abbrev : 'tim' },
                MINUTE  : { single : 'minut', plural : 'minuter', abbrev : 'min' },
                SECOND  : { single : 'sekund', plural : 'sekunder', abbrev : 's' },
                MILLI   : { single : 'ms', plural : 'ms', abbrev : 'ms' }
            }
        },
    
        'Sch.model.CalendarDay' : {
            startTimeAfterEndTime                   : 'Starttiden {0} är efter sluttiden {1}',
            availabilityIntervalsShouldNotIntersect : 'Tillgänglighetsintervall ska inte överlappa: [{0}] och [{1}]',
            invalidFormat                           : 'Ogiltigt format för tillgänglighetssträngen: {0}. Den borde ha ett exakt format: hh:mm-hh:mm'
        },

        "Sch.panel.SchedulerTree" : {
            'All day'    : 'Hela dagen'
        },

        "Sch.panel.SchedulerGrid" : {
            'All day'    : 'Hela dagen'
        },

        'Sch.panel.TimelineGridPanel' : {
            weekStartDay : 1,
            loadingText  : 'Laddar, vänligen vänta...',
            savingText   : 'Sparar ändringar, vänligen vänta...'
        },

        'Sch.panel.TimelineTreePanel' : {
            weekStartDay : 1,
            loadingText  : 'Laddar, vänligen vänta...',
            savingText   : 'Sparar ändringar, vänligen vänta...'
        },

        'Sch.mixin.SchedulerView' : {
            loadingText : "Laddar schema..."
        },

        'Sch.plugin.CurrentTimeLine' : {
            tooltipText : 'Aktuell tid'
        },

        //region Recurrence
        'Sch.widget.recurrence.ConfirmationDialog' : {
            'delete-title'              : 'Borttagning av bokning',
            'delete-all-message'        : 'Vill du ta bort alla instanser av denna bokning?',
            'delete-further-message'    : 'Vill du ta bort denna och alla framtida instanser av denna bokning, eller bara denna?',
            'delete-all-btn-text'       : 'Ta bort alla',
            'delete-further-btn-text'   : 'Ta bort alla framtida',
            'delete-only-this-btn-text' : 'Ta bort endast denna',

            'update-title'              : 'Redigering av upprepad bokning',
            'update-all-message'        : 'Vill du ändra alla instanser av denna bokning?',
            'update-further-message'    : 'Vill du ändra på endast denna instans, eller denna och alla framtida?',
            'update-all-btn-text'       : 'Alla',
            'update-further-btn-text'   : 'Alla framtida',
            'update-only-this-btn-text' : 'Endast denna',

            'Yes'    : 'Ja',
            'Cancel' : 'Avbryt'
        },

        'Sch.widget.recurrence.Dialog' : {
            'Repeat event' : 'Upprepa bokning',
            'Cancel'       : 'Avbryt',
            'Save'         : 'Spara'
        },

        'Sch.widget.recurrence.Form' : {
            'Frequency'           : 'Frekvens',
            'Every'               : 'Var',
            'DAILYintervalUnit'   : 'dag',
            'WEEKLYintervalUnit'  : 'vecka på:',
            'MONTHLYintervalUnit' : 'månad',
            'YEARLYintervalUnit'  : 'år i:',
            'Each'                : 'Varje',
            'On the'              : 'På den',
            'End repeat'          : 'Avsluta upprepning',
            'time(s)'             : 'upprepningar'
        },

        'Sch.widget.recurrence.field.DaysComboBox' : {
            'day'         : 'dagen',
            'weekday'     : 'veckodagen',
            'weekend day' : 'dagen i veckoslutet'
        },

        'Sch.widget.recurrence.field.PositionsComboBox' : {
            'position1'  : 'första',
            'position2'  : 'andra',
            'position3'  : 'tredje',
            'position4'  : 'fjärde',
            'position5'  : 'femte',
            'position-1' : 'sista'
        },

        'Sch.data.util.recurrence.Legend' : {
            // list delimiters
            ', '                            : ', ',
            ' and '                         : ' och ',
            // frequency patterns
            'Daily'                         : 'Daglig',
            'Weekly on {1}'                 : 'Veckovis på {1}',
            'Monthly on {1}'                : 'Måntaligen den {1}',
            'Yearly on {1} of {2}'          : 'Årligen {1} {2}',
            'Every {0} days'                : 'Var {0} dag',
            'Every {0} weeks on {1}'        : 'Var {0} vecka på {1}',
            'Every {0} months on {1}'       : 'Var {0} månad {1}',
            'Every {0} years on {1} of {2}' : 'Var {0} år på {1} av {2}',
            // day position translations
            'position1'                     : 'den första',
            'position2'                     : 'den andra',
            'position3'                     : 'den tredje',
            'position4'                     : 'den fjärde',
            'position5'                     : 'den femte',
            'position-1'                    : 'den sista',
            // day options
            'day'                           : 'dagen',
            'weekday'                       : 'veckodagen',
            'weekend day'                   : 'dagen i veckoslut',
            // {0} - day position info ("the last"/"the first"/...)
            // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
            // For example:
            //  "the last Sunday"
            //  "the first weekday"
            //  "the second weekend day"
            'daysFormat'                    : '{0} {1}'
        },

        'Sch.widget.recurrence.field.StopConditionComboBox' : {
            'Never'   : 'Aldrig',
            'After'   : 'Efter',
            'On date' : 'På datum'
        },

        'Sch.widget.recurrence.field.FrequencyComboBox' : {
            'Daily'   : 'Daglig',
            'Weekly'  : 'Veckovis',
            'Monthly' : 'Månatlig',
            'Yearly'  : 'Årlig'
        },

        'Sch.widget.recurrence.field.RecurrenceComboBox' : {
            'None'      : 'Ingen',
            'Custom...' : 'Anpassad...'
        },

        'Sch.widget.EventEditor' : {
            'Repeat'      : 'Upprepa',
            saveText      : 'Spara',
            deleteText    : 'Ta bort',
            cancelText    : 'Avbryt',
            nameText      : 'Namn',
            allDayText    : 'Hela dagen',
            startDateText : 'Start',
            endDateText   : 'Slut',
            resourceText  : 'Resurs'
        },
        //endregion Recurrence

        'Sch.plugin.SimpleEditor' : {
            newEventText : 'Ny bokning...'
        },

        'Sch.widget.ExportDialogForm' : {
            formatFieldLabel         : 'Pappersformat',
            orientationFieldLabel    : 'Orientering',
            rangeFieldLabel          : 'Tidsintervall',
            showHeaderLabel          : 'Visa rubrik',
            showFooterLabel          : 'Visa sidfot',
            orientationPortraitText  : 'Stående',
            orientationLandscapeText : 'Liggande',
            completeViewText         : 'Hela schemat',
            currentViewText          : 'Aktuell vy',
            dateRangeText            : 'Datumintervall',
            dateRangeFromText        : 'Från',
            dateRangeToText          : 'Till',
            adjustCols               : 'Ställ in kolumnbredd',
            adjustColsAndRows        : 'Ställ in radhöjd och kolumnbredd',
            exportersFieldLabel      : 'Styra sidbrytningarna',
            specifyDateRange         : 'Ställ in datumintervall',
            columnPickerLabel        : 'Välj kolumner',
            completeDataText         : 'Hela schemat (alla aktiviteter)',
            dpiFieldLabel            : 'DPI (punkter per tum)',
            rowsRangeLabel           : 'Välj rader',
            allRowsLabel             : 'Alla rader',
            visibleRowsLabel         : 'Synliga rader',
            columnEmptyText          : '[namnlös]'
        },
        'Sch.widget.ExportDialog'     : {
            title            : 'Inställningar för export',
            exportButtonText : 'Exportera',
            cancelButtonText : 'Avbryt',
            progressBarText  : 'Arbetar...'
        },

        'Sch.plugin.Export' : {
            generalError          : 'Ett fel uppstod',
            fetchingRows          : 'Hämtar rad {0} av {1}',
            builtPage             : 'Byggt sida {0} av {1}',
            requestingPrintServer : 'Var god vänta...'
        },

        'Sch.plugin.Printable' : {
            dialogTitle      : 'Utskriftsinställningar',
            exportButtonText : 'Skriv ut',
            disablePopupBlocking : 'Vänligen slå av popup-blockering eftersom utskriften behöver öppnas i en ny flik',
            popupBlockerDetected : 'Popup-blockerare upptäckt'
        },

        'Sch.plugin.exporter.AbstractExporter' : {
            name : 'Exporter'
        },

        'Sch.plugin.exporter.SinglePage' : {
            name : 'En sida'
        },

        'Sch.plugin.exporter.MultiPageVertical' : {
            name : 'Flera sidor (lodrätt)'
        },

        'Sch.plugin.exporter.MultiPage' : {
            name : 'Flera sidor'
        },

        'Sch.plugin.Split' : {
            splitText : 'Dela',
            mergeText : 'Dölj delad del'
        },

        'Sch.plugin.SummaryBar' : {
            totalText : 'Totalt'
        },

        'Sch.column.ResourceName' : {
            name : 'Namn'
        },

        'Sch.template.DependencyInfo' : {
            fromText : 'Från',
            toText   : 'Till'
        },

        // -------------- View preset date formats/strings -------------------------------------
        'Sch.preset.Manager' : {
            hourAndDay : {
                displayDateFormat : 'G:i',
                middleDateFormat  : 'G:i',
                topDateFormat     : 'l d M Y'
            },

            secondAndMinute : {
                displayDateFormat : 'G:i:s',
                topDateFormat     : 'D, d H:i'
            },

            dayAndWeek : {
                displayDateFormat : 'Y-m-d G:i',
                middleDateFormat  : 'D d M'
            },

            weekAndDay : {
                displayDateFormat : 'Y-m-d',
                bottomDateFormat  : 'D d',
                middleDateFormat  : 'd M Y'
            },

            weekAndMonth : {
                displayDateFormat : 'Y-m-d',
                middleDateFormat  : 'm/d',
                topDateFormat     : 'Y-m-d'
            },

            monthAndYear : {
                displayDateFormat : 'Y-m-d',
                middleDateFormat  : 'M Y',
                topDateFormat     : 'Y'
            },

            year : {
                displayDateFormat : 'Y-m-d',
                middleDateFormat  : 'Y'
            },

            manyYears : {
                displayDateFormat : 'Y-m-d',
                middleDateFormat  : 'Y'
            }
        }
    },


    constructor : function () {
        // Manually fixing this Sencha bug
        // https://www.sencha.com/forum/showthread.php?310118-Locale-missing-defaultDateFormat&p=1132252#post1132252
        Ext.Date.defaultFormat = 'Y-m-d';

        this.callParent(arguments);
    }
});
