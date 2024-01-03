// @tag alternative-locale
/**
 * Dutch translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Sch.locale.Nl', {
    extend    : 'Sch.locale.Locale',
    singleton : true,

    l10n : {
        'Sch.util.Date' : {
            unitNames : {
                YEAR    : { single : 'jaar', plural : 'jaren', abbrev : 'j' },
                QUARTER : { single : 'kwartaal', plural : 'kwartalen', abbrev : 'kw' },
                MONTH   : { single : 'maand', plural : 'maanden', abbrev : 'ma' },
                WEEK    : { single : 'week', plural : 'weken', abbrev : 'w' },
                DAY     : { single : 'dag', plural : 'dagen', abbrev : 'd' },
                HOUR    : { single : 'uur', plural : 'uren', abbrev : 'u' },
                MINUTE  : { single : 'minuut', plural : 'minuten', abbrev : 'm' },
                SECOND  : { single : 'seconde', plural : 'seconden', abbrev : 's' },
                MILLI   : { single : 'ms', plural : 'ms', abbrev : 'ms' }
            }
        },

        'Sch.panel.TimelineGridPanel' : {
            weekStartDay : 1,
            loadingText  : 'Bezig met laden...',
            savingText   : 'Bezig met opslaan...'
        },

        'Sch.panel.TimelineTreePanel' : {
            weekStartDay : 1,
            loadingText  : 'Bezig met laden...',
            savingText   : 'Bezig met opslaan...'
        },

        'Sch.mixin.SchedulerView' : {
            loadingText : 'Events laden...'
        },

        'Sch.plugin.CurrentTimeLine' : {
            tooltipText : 'Huidige tijd'
        },

        'Sch.widget.EventEditor' : {
            saveText      : 'Opslaan',
            deleteText    : 'Verwijderen',
            cancelText    : 'Annuleer',
            nameText      : 'Naam',
            allDayText    : 'De hele dag',
            startDateText : 'Start',
            endDateText   : 'Einde',
            resourceText  : 'Ressource'
        },

        'Sch.plugin.SimpleEditor' : {
            newEventText : 'Nieuwe boeking...'
        },

        'Sch.widget.ExportDialogForm' : {
            formatFieldLabel         : 'Papier formaat',
            orientationFieldLabel    : 'Oriëntatatie',
            rangeFieldLabel          : 'Scheduler bereik',
            showHeaderLabel          : 'Toon header',
            showFooterLabel          : 'Toon footer',
            orientationPortraitText  : 'Staand',
            orientationLandscapeText : 'Liggend',
            completeViewText         : 'Compleet schema',
            currentViewText          : 'Huidige weergave',
            dateRangeText            : 'Periode',
            dateRangeFromText        : 'Exporteer vanaf',
            dateRangeToText          : 'Exporteer naar',
            exportersFieldLabel      : 'Paginering beheren',
            adjustCols               : 'Wijzig kolom breedte',
            adjustColsAndRows        : 'Wijzig kolom breedte en rij hoogte',
            specifyDateRange         : 'Specificeer periode',
            columnPickerLabel        : 'Kies kolommen',
            completeDataText         : 'Alle data (events)',
            dpiFieldLabel            : 'DPI (dots per inch)',
            rowsRangeLabel           : 'Bereik rijen',
            allRowsLabel             : 'Alle rijen',
            visibleRowsLabel         : 'Zichtbare rijen',
            columnEmptyText          : '[geen titel]'
        },

        'Sch.widget.ExportDialog' : {
            title            : 'Export instellingen',
            exportButtonText : 'Exporteer',
            cancelButtonText : 'Annuleer',
            progressBarText  : 'Bezig met exporteren...'
        },

        'Sch.plugin.Export' : {
            generalError          : 'Er is een fout opgetreden',
            fetchingRows          : 'Record {0} van {1}',
            builtPage             : 'Pagina {0} van {1}',
            requestingPrintServer : 'Rapport bewerken op server...'
        },

        'Sch.plugin.Printable' : {
            dialogTitle      : 'Print instellingen',
            exportButtonText : 'Afdrukken',
            disablePopupBlocking : 'Schakel de Pop-Up blokker uit, de printplugin maakt een nieuw tabblad aan.',
            popupBlockerDetected : 'Browser Pop-Up blokker gedetecteerd.'
        },

        'Sch.plugin.exporter.AbstractExporter' : {
            name : 'Exporter'
        },

        'Sch.plugin.exporter.SinglePage' : {
            name : 'Enkele pagina'
        },

        'Sch.plugin.exporter.MultiPageVertical' : {
            name : 'Meerdere pagina\'s (verticaal)'
        },

        'Sch.plugin.exporter.MultiPage' : {
            name : 'Meerdere pagina\'s'
        },

        'Sch.column.ResourceName' : {
            name : 'Naam'
        },

        'Sch.template.DependencyInfo' : {
            fromText : 'Van',
            toText   : 'Tot'
        },

        // -------------- View preset date formats/strings -------------------------------------
        'Sch.preset.Manager' : {
            hourAndDay : {
                displayDateFormat : 'G:i',
                middleDateFormat  : 'G:i',
                topDateFormat     : 'd-m-Y'
            },

            secondAndMinute : {
                displayDateFormat : 'G:i:s',
                topDateFormat     : 'D, d G:i'
            },

            dayAndWeek : {
                displayDateFormat : 'd-m H:i',
                middleDateFormat  : 'D d M'
            },

            weekAndDay : {
                displayDateFormat : 'd-m',
                bottomDateFormat  : 'd M',
                middleDateFormat  : 'j-F Y'
            },

            weekAndMonth : {
                displayDateFormat : 'd-m-Y',
                middleDateFormat  : 'd-m',
                topDateFormat     : 'd-m-Y'
            },

            weekAndDayLetter : {
                displayDateFormat : 'd-m-Y',
                middleDateFormat  : 'D j M Y'
            },

            weekDateAndMonth : {
                displayDateFormat : 'd-m-Y',
                middleDateFormat  : 'd',
                topDateFormat     : 'F Y'
            },

            monthAndYear : {
                displayDateFormat : 'd-m-Y',
                middleDateFormat  : 'M Y',
                topDateFormat     : 'Y'
            },

            year : {
                displayDateFormat : 'd-m-Y',
                middleDateFormat  : 'Y'
            },

            manyYears : {
                displayDateFormat : 'd-m-Y',
                middleDateFormat  : 'Y'
            }
        }
    }

});
