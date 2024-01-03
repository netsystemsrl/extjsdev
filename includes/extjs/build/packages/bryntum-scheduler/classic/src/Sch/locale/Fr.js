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
    
        'Sch.model.CalendarDay' : {
            startTimeAfterEndTime                   : 'L\'heure de début {0} est supérieure à l\'heure de fin {1}',
            availabilityIntervalsShouldNotIntersect : 'Les intervalles de disponibilité ne doivent pas se croiser: [{0}] et [{1}]',
            invalidFormat                           : 'Format non valide pour la chaîne de disponibilité: {0}. il doit avoir le format exact: hh:mm-hh:mm'
        },

        "Sch.panel.SchedulerTree" : {
            'All day'    : 'Toute la journée'
        },

        "Sch.panel.SchedulerGrid" : {
            'All day'    : 'Toute la journée'
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

        //region Recurrence
        'Sch.widget.recurrence.ConfirmationDialog' : {
            'delete-title'              : 'Vous supprimez un événement',
            'delete-all-message'        : 'Voulez-vous supprimer toutes les occurrences de cet événement?',
            'delete-further-message'    : "Voulez-vous supprimer ceci et toutes les futures occurrences de cet événement, ou seulement l'occurrence sélectionnée?",
            'delete-all-btn-text'       : 'Tout supprimer',
            'delete-further-btn-text'   : 'Supprimer tous les événements futurs',
            'delete-only-this-btn-text' : 'Supprimer seulement cet événement',

            'update-title'              : 'Vous modifiez un événement récurrent',
            'update-all-message'        : 'Voulez-vous changer toutes les occurrences de cet événement?',
            'update-further-message'    : "Voulez-vous modifier uniquement cette occurrence de l'événement, ou cette occurrence et toutes les occurrences futures?",
            'update-all-btn-text'       : 'Tous',
            'update-further-btn-text'   : 'Tous les événements futurs',
            'update-only-this-btn-text' : 'Seulement cet événement',

            'Yes'    : 'Oui',
            'Cancel' : 'Annuler'
        },

        'Sch.widget.recurrence.Dialog' : {
            'Repeat event' : "Répéter l'événement",
            'Cancel'       : 'Annuler',
            'Save'         : 'Enregistrer'
        },

        'Sch.widget.recurrence.Form' : {
            'Frequency'           : 'Fréquence',
            'Every'               : 'Tous',
            'DAILYintervalUnit'   : 'jour',
            'WEEKLYintervalUnit'  : 'semaine sur:',
            'MONTHLYintervalUnit' : 'mois',
            'YEARLYintervalUnit'  : 'année dans:',
            'Each'                : 'Chacun',
            'On the'              : 'Sur le',
            'End repeat'          : 'Terminer la répétition',
            'time(s)'             : 'time'
        },

        'Sch.widget.recurrence.field.DaysComboBox' : {
            'day'         : 'jour',
            'weekday'     : 'jour de la semaine',
            'weekend day' : 'jour de fin de semaine'
        },

        'Sch.widget.recurrence.field.PositionsComboBox' : {
            'position1'  : 'premier',
            'position2'  : 'deuxième',
            'position3'  : 'troisième',
            'position4'  : 'quatrième',
            'position5'  : 'cinquième',
            'position-1' : 'dernier'
        },

        'Sch.data.util.recurrence.Legend' : {
            // list delimiters
            ', '                            : ', ',
            ' and '                         : ' et ',
            // frequency patterns
            'Daily'                         : 'Quotidien',
            'Weekly on {1}'                 : 'Hebdomadaire le {1}',
            'Monthly on {1}'                : 'Mensuel le {1}',
            'Yearly on {1} of {2}'          : 'Annuellement le {1} de {2}',
            'Every {0} days'                : 'Tous les {0} jours',
            'Every {0} weeks on {1}'        : 'Toutes les {0} semaines sur {1}',
            'Every {0} months on {1}'       : 'Tous les {0} mois sur {1}',
            'Every {0} years on {1} of {2}' : 'Tous les {0} ans le {1} sur {2}',
            // day position translations
            'position1'                     : 'le premier',
            'position2'                     : 'le second',
            'position3'                     : 'le troisième',
            'position4'                     : 'le quatrième',
            'position5'                     : 'le cinquième',
            'position-1'                    : 'le dernier',
            // day options
            'day'                           : 'jour',
            'weekday'                       : 'jour de la semaine',
            'weekend day'                   : 'jour de fin de semaine',
            // {0} - day position info ("the last"/"the first"/...)
            // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
            // For example:
            //  "the last Sunday"
            //  "the first weekday"
            //  "the second weekend day"
            'daysFormat'                    : '{0} {1}'
        },

        'Sch.widget.recurrence.field.StopConditionComboBox' : {
            'Never'   : 'Jamais',
            'After'   : 'Après',
            'On date' : 'Date'
        },

        'Sch.widget.recurrence.field.FrequencyComboBox' : {
            'Daily'   : 'Quotidien',
            'Weekly'  : 'Hebdomadaire',
            'Monthly' : 'Mensuel',
            'Yearly'  : 'Annuel'
        },

        'Sch.widget.recurrence.field.RecurrenceComboBox' : {
            'None'      : 'Aucun',
            'Custom...' : 'Personnalisé...'
        },

        'Sch.widget.EventEditor' : {
            'Repeat'      : 'Répéter',
            saveText      : 'Enregister',
            deleteText    : 'Supprimer',
            cancelText    : 'Annuler',
            nameText      : 'Nom',
            allDayText    : 'Toute la journée',
            startDateText : 'Début',
            endDateText   : 'Fin',
            resourceText  : 'Ressource'
        },
        //endregion Recurrence

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
            dialogTitle          : "Paramètres d'impression",
            exportButtonText     : 'Imprimer',
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

        'Sch.plugin.Split' : {
            splitText : 'Séparer',
            mergeText : 'Masquer la pièce divisée'
        },

        'Sch.plugin.SummaryBar' : {
            totalText : 'Total'
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
