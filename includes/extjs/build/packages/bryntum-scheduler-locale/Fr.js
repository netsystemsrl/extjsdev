// @tag alternative-locale
/**
 * French translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Sch.locale.Fr', {
    extend    : 'Sch.locale.Locale',
    singleton : true,

    l10n : {
        'Sch.util.Date' : {
            unitNames : {
                YEAR    : { single : 'année', plural : 'années', abbrev : 'a' },
                QUARTER : { single : 'trimestre', plural : 'trimestres', abbrev : 'trim' },
                MONTH   : { single : 'mois', plural : 'mois', abbrev : 'm' },
                WEEK    : { single : 'semaine', plural : 'semaines', abbrev : 'sem' },
                DAY     : { single : 'jour', plural : 'jours', abbrev : 'j' },
                HOUR    : { single : 'heure', plural : 'heures', abbrev : 'h' },
                MINUTE  : { single : 'minute', plural : 'minutes', abbrev : 'min' },
                SECOND  : { single : 'seconde', plural : 'secondes', abbrev : 's' },
                MILLI   : { single : 'ms', plural : 'ms', abbrev : 'ms' }
            }
        },

        'Sch.panel.TimelineGridPanel' : {
            weekStartDay : 1,
            loadingText  : 'Chargement en cours, veuillez patienter...',
            savingText   : 'Sauvegarde des données en cours, veuillez patienter...'
        },

        'Sch.panel.TimelineTreePanel' : {
            weekStartDay : 1,
            loadingText  : 'Chargement en cours, veuillez patienter...',
            savingText   : 'Sauvegarde des données en cours, veuillez patienter...'
        },

        'Sch.mixin.SchedulerView' : {
            loadingText : 'Chargement des données...'
        },

        'Sch.plugin.CurrentTimeLine' : {
            tooltipText : 'Temps actuel'
        },

        'Sch.widget.EventEditor' : {
            saveText      : 'Enregister',
            deleteText    : 'Supprimer',
            cancelText    : 'Annuler',
            nameText      : 'Nom',
            allDayText    : 'Toute la journée',
            startDateText : 'Début',
            endDateText   : 'Fin',
            resourceText  : 'Ressource'
        },

        'Sch.plugin.SimpleEditor' : {
            newEventText : 'Nouveau événement...'
        },

        'Sch.widget.ExportDialogForm' : {
            formatFieldLabel         : 'Format papier',
            orientationFieldLabel    : 'Orientation',
            rangeFieldLabel          : 'Plage horaire',
            showHeaderLabel          : "Afficher l'en-tête",
            showFooterLabel          : 'Afficher le pied de page',
            orientationPortraitText  : 'Portrait',
            orientationLandscapeText : 'Paysage',
            completeViewText         : 'Calendrier complet',
            currentViewText          : 'Horaire visible',
            dateRangeText            : 'Plage de dates',
            dateRangeFromText        : 'Exporter de',
            dateRangeToText          : 'Exporter à',
            exportersFieldLabel      : 'Contrôl de pagination',
            adjustCols               : 'Ajuster la largeur des colonnes',
            adjustColsAndRows        : 'Ajuster la largeur des colonnes et la hauteur de ligne',
            specifyDateRange         : 'Spécifier une plage de dates',
            columnPickerLabel        : 'Sélectionner les colonnes',
            completeDataText         : 'Calendrier complet (pour tous les événements)',
            dpiFieldLabel            : 'DPI (points par pouce)',
            rowsRangeLabel           : 'Plage de lignes',
            allRowsLabel             : 'Toutes les lignes',
            visibleRowsLabel         : 'Lignes visibles',
            columnEmptyText          : '[pas de titre]'
        },

        'Sch.widget.ExportDialog' : {
            title            : "Paramètres d'export",
            exportButtonText : 'Exporter',
            cancelButtonText : 'Annuler',
            progressBarText  : 'Export en cours...'
        },

        'Sch.plugin.Export' : {
            generalError          : 'Une erreur est survenue',
            fetchingRows          : 'Récupérer une ligne {0} de {1}',
            builtPage             : 'Page créée {0} de {1}',
            requestingPrintServer : 'Veuillez patienter...'
        },

        'Sch.plugin.Printable' : {
            dialogTitle      : "Paramètres d'impression",
            exportButtonText : 'Imprimer',
            disablePopupBlocking : 'Veuillez désactiver le blocage des popups car le plugin Print doit pouvoir ouvrir de nouveaux onglets',
            popupBlockerDetected : 'Le bloqueur de pop-up du navigateur a été détecté'
        },

        'Sch.plugin.exporter.AbstractExporter' : {
            name : 'Exporter'
        },

        'Sch.plugin.exporter.SinglePage' : {
            name : 'Une seule page'
        },

        'Sch.plugin.exporter.MultiPageVertical' : {
            name : 'Pages multiples (verticalement)'
        },

        'Sch.plugin.exporter.MultiPage' : {
            name : 'Pages multiples'
        },

        'Sch.column.ResourceName' : {
            name : 'Nom'
        },

        'Sch.template.DependencyInfo' : {
            fromText : 'De',
            toText   : 'À'
        },

        // -------------- View preset date formats/strings -------------------------------------
        'Sch.preset.Manager' : {
            hourAndDay : {
                displayDateFormat : 'G:i',
                middleDateFormat  : 'G:i',
                topDateFormat     : 'd/m/Y'
            },

            secondAndMinute : {
                displayDateFormat : 'G:i:s',
                topDateFormat     : 'D, d G:i'
            },

            dayAndWeek : {
                displayDateFormat : 'd/m H:i',
                middleDateFormat  : 'D d M'
            },

            weekAndDay : {
                displayDateFormat : 'd/m',
                bottomDateFormat  : 'd M',
                middleDateFormat  : 'j F Y'
            },

            weekAndMonth : {
                displayDateFormat : 'd/m/Y',
                middleDateFormat  : 'd/m',
                topDateFormat     : 'd/m/Y'
            },

            weekAndDayLetter : {
                displayDateFormat : 'd/m/Y',
                middleDateFormat  : 'D j M Y'
            },

            weekDateAndMonth : {
                displayDateFormat : 'd/m/Y',
                middleDateFormat  : 'd',
                topDateFormat     : 'F Y'
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
