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
    
        'Sch.model.CalendarDay' : {
            startTimeAfterEndTime                   : 'De begintijd {0} is groter dan de eindtijd {1}',
            availabilityIntervalsShouldNotIntersect : 'Beschikbaarheids intervallen mogen niet door elkaar snijden: [{0}] en [{1}]',
            invalidFormat                           : 'Ongeldige indeling voor beschikbaarheids tekenreeks: {0}. het moet exact formaat: hh:mm-hh:mm'
        },

        "Sch.panel.SchedulerTree" : {
            'All day'    : 'De hele dag'
        },

        "Sch.panel.SchedulerGrid" : {
            'All day'    : 'De hele dag'
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

        //region Recurrence
        'Sch.widget.recurrence.ConfirmationDialog' : {
            'delete-title'              : 'U verwijdert een plan item',
            'delete-all-message'        : 'Wilt u alle herhaalde afspraken van dit item verwijderen?',
            'delete-further-message'    : 'Wilt u het geselecteerde en alle toekomstige gebeurtenissen van dit item verwijderen, of aleen het geselecteerde item?',
            'delete-all-btn-text'       : 'Verwijder alles',
            'delete-further-btn-text'   : 'Verwijder alleen de toekomstige gebeurtenissen',
            'delete-only-this-btn-text' : 'Verwijder alleen deze gebeurtenis',

            'update-title'              : 'U verandert een herhaald item',
            'update-all-message'        : 'Wilt u alle herhaalde afspraken van dit item verwijderen?',
            'update-further-message'    : 'Wilt u het geselecteerde en alle toekomstige gebeurtenissen van dit item wijzigen, of aleen het geselecteerde item?',
            'update-all-btn-text'       : 'Wijzig alle items',
            'update-further-btn-text'   : 'Wijzig alle toekomstige items',
            'update-only-this-btn-text' : 'Wijzig alleen dit item',

            'Yes'    : 'Ja',
            'Cancel' : 'Annuleer'
        },

        'Sch.widget.recurrence.Dialog' : {
            'Repeat event' : 'Herhaal gebeurtenis',
            'Cancel'       : 'Annuleer',
            'Save'         : 'Bewaar'
        },

        'Sch.widget.recurrence.Form' : {
            'Frequency'           : 'Frequentie',
            'Every'               : 'Elke',
            'DAILYintervalUnit'   : 'dag(en)',
            'WEEKLYintervalUnit'  : 'week(en) op:',
            'MONTHLYintervalUnit' : 'maand(en)',
            'YEARLYintervalUnit'  : 'jaren(en) in:',
            'Each'                : 'Elke',
            'On the'              : 'Op de',
            'End repeat'          : 'Einde herhaling',
            'time(s)'             : 'tijd(en)'
        },

        'Sch.widget.recurrence.field.DaysComboBox' : {
            'day'         : 'dag',
            'weekday'     : 'weekdag',
            'weekend day' : 'weekend dag'
        },

        'Sch.widget.recurrence.field.PositionsComboBox' : {
            'position1'  : 'eerste',
            'position2'  : 'tweede',
            'position3'  : 'derde',
            'position4'  : 'vierde',
            'position5'  : 'vijfde',
            'position-1' : 'laatste'
        },

        'Sch.data.util.recurrence.Legend' : {
            // list delimiters
            ', '                            : ', ',
            ' and '                         : ' en ',
            // frequency patterns
            'Daily'                         : 'Dagelijks',
            'Weekly on {1}'                 : 'Wekelijks op {1}',
            'Monthly on {1}'                : 'Maandelijks op {1}',
            'Yearly on {1} of {2}'          : 'Jaarlijks op {1} {2}',
            'Every {0} days'                : 'Elke {0} dagen',
            'Every {0} weeks on {1}'        : 'Elke {0} weken op {1}',
            'Every {0} months on {1}'       : 'Elke {0} maanden in {1}',
            'Every {0} years on {1} of {2}' : 'Elke {0} jaar op {1} {2}',
            // day position translations
            'position1'                     : 'de eerste',
            'position2'                     : 'de tweede',
            'position3'                     : 'de derde',
            'position4'                     : 'de vierde',
            'position5'                     : 'de vijfde',
            'position-1'                    : 'laatste',
            // day options
            'day'                           : 'dag',
            'weekday'                       : 'weekdag',
            'weekend day'                   : 'weekend dag',
            // {0} - day position info ("the last"/"the first"/...)
            // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
            // For example:
            //  "the last Sunday"
            //  "the first weekday"
            //  "the second weekend day"
            'daysFormat'                    : '{0} {1}'
        },

        'Sch.widget.recurrence.field.StopConditionComboBox' : {
            'Never'   : 'Nooit',
            'After'   : 'Na',
            'On date' : 'Op datum'
        },

        'Sch.widget.recurrence.field.FrequencyComboBox' : {
            'Daily'   : 'Dagelijks',
            'Weekly'  : 'Wekelijks',
            'Monthly' : 'Maandelijks',
            'Yearly'  : 'Jaarlijks'
        },

        'Sch.widget.recurrence.field.RecurrenceComboBox' : {
            'None'      : 'Geen',
            'Custom...' : 'Aangepast...'
        },

        'Sch.widget.EventEditor' : {
            'Repeat'      : 'Herhaal',
            saveText      : 'Opslaan',
            deleteText    : 'Verwijderen',
            cancelText    : 'Annuleer',
            nameText      : 'Naam',
            allDayText    : 'De hele dag',
            startDateText : 'Start',
            endDateText   : 'Einde',
            resourceText  : 'Ressource'
        },
        //endregion Recurrence

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

        'Sch.plugin.Split' : {
            splitText : 'Splitsen',
            mergeText : 'Splitsen opheffen'
        },

        'Sch.plugin.SummaryBar' : {
            totalText : 'Totaal'
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
