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

        'Sch.widget.EventEditor' : {
            saveText      : 'Spara',
            deleteText    : 'Ta bort',
            cancelText    : 'Avbryt',
            nameText      : 'Namn',
            allDayText    : 'Hela dagen',
            startDateText : 'Start',
            endDateText   : 'Slut',
            resourceText  : 'Resurs'
        },

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
            disablePopupBlocking : 'Please disable Pop-Up blocking since Print plugin needs to be able to open new tabs',
            popupBlockerDetected : 'Browser Pop-Up blocker detected'
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
