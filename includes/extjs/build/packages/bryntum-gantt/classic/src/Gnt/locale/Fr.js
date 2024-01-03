// @tag alternative-locale
/**
 * French translations for the Gantt component
 * including French translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Gnt.locale.Fr', {
    extend    : 'Sch.locale.Locale',
    requires  : 'Sch.locale.Fr',
    singleton : true,

    l10n      : {
        'Gnt.util.DurationParser' : {
            unitsRegex : {
                MILLI   : /^ms$|^ms/i,
                SECOND  : /^s$|^sec/i,
                MINUTE  : /^m$|^min/i,
                HOUR    : /^h$|^hr$|^heure/i,
                DAY     : /^j$|^jour/i,
                WEEK    : /^s$|^sem|^semaine/i,
                MONTH   : /^m$|^mois/i,
                QUARTER : /^t$|^trim/i,
                YEAR    : /^a$|^an|^année/i
            }
        },

        'Gnt.util.DependencyParser' : {
            typeText : {
                SS : 'DD',
                SF : 'DF',
                FS : 'FD',
                FF : 'FF'
            }
        },

        'Gnt.panel.Timeline' : {
            start : 'Début',
            end   : 'Fin',
            format : 'd.m.Y'
        },

        'Gnt.field.ShowInTimeline' : {
            yes   : 'Oui',
            no    : 'Non'
        },

        'Gnt.column.ShowInTimeline' : {
            text  : 'Affichage chronologie'
        },

        'Gnt.field.ConstraintType' : {
            none : 'Aucune',
            invalidText : 'Valeur invalide'
        },

        'Gnt.field.Duration' : {
            invalidText : 'Valeur invalide'
        },

        'Gnt.field.Cost' : {
            invalidText         : 'Valeur invalide',
            currencySymbol      : '€',
            currencySymbolAlign : 'left'
        },

        'Gnt.field.Effort' : {
            invalidText : 'Valeur invalide'
        },

        'Gnt.field.Percent' : {
            invalidText : 'Valeur invalide'
        },

        'Gnt.field.SchedulingMode' : {
            Normal              : 'Standard',
            FixedDuration       : 'Durée fixe',
            EffortDriven        : "Pilotée par l'effort",
            DynamicAssignment   : 'Affectation dynamique',
            invalidText         : 'Valeur invalide'
        },

        'Gnt.template.Deadline' : {
            deadline : 'Échéance'
        },

        'Gnt.column.DeadlineDate' : {
            text : 'Échéance'
        },

        'Gnt.Tooltip' : {
            startText    : 'Commence: ',
            endText      : "S'achève: ",
            durationText : 'Durée: '
        },

        'Gnt.template.TaskTooltip' : {
            startText    : 'Début',
            endText      : 'Fin',
            percentText  : 'Avancement',
            format       : 'd/m/Y',
            overflowText : 'Il y a encore {[values.nbrOverflowing > 1 ? "des" : "une"]} {nbrOverflowing} {[values.nbrOverflowing > 1 ? "tâches" : "tâche"]}'
        },

        'Gnt.plugin.ProjectLines' : {
            startOf : 'Début de:',
            endOf   : 'Fin de:'
        },

        'Gnt.plugin.TaskContextMenu' : {
            taskInformation    : 'Informations sur la tâche...',
            projectInformation : 'Informations sur le projet...',
            newTaskText        : 'Nouvelle tâche',
            deleteTask         : 'Supprimer la(les) tâche(s)',
            editLeftLabel      : "Modifier l'étiquette gauche",
            editRightLabel     : "Modifier l'étiquette droite",
            add                : 'Ajouter...',
            deleteDependency   : 'Supprimer la dépendance...',
            addTaskAbove       : 'Tâche ci-dessus',
            addTaskBelow       : 'Tâche ci-dessous',
            addMilestone       : 'Jalon',
            addSubtask         : 'Sous-tâche',
            addSuccessor       : 'Successeur',
            addPredecessor     : 'Prédécesseur',
            convertToMilestone : 'Convertir en jalon',
            splitTask          : 'Fractionner la tâche',
            convertToRegular   : 'Convertir en tâche'
        },

        'Gnt.plugin.DependencyEditor' : {
            fromText         : 'De',
            toText           : 'À',
            typeText         : 'Type',
            lagText          : 'Décalage',
            endToStartText   : 'Fin-à-début',
            startToStartText : 'Début-à-début',
            endToEndText     : 'Fin-à-fin',
            startToEndText   : 'Début-à-fin',
            okButtonText     : 'Ok',
            cancelButtonText : 'Annuler',
            deleteButtonText : 'Supprimer'
        },

        'Gnt.widget.calendar.Calendar' : {
            format                    : 'd.m.Y',
            dateInTextFormat          : 'M j, Y',
            dayOverrideNameHeaderText : 'Nom',
            overrideName              : 'Nom',
            startDate                 : 'Date de début',
            endDate                   : 'Date de fin',
            error                     : 'Erreur',
            dateText                  : 'Date',
            addText                   : 'Ajouter',
            editText                  : 'Modifier',
            removeText                : 'Supprimer',
            workingDayText            : 'Jour ouvré',
            weekendsText              : 'Week-ends',
            overriddenDayText         : 'Jour spécifique',
            overriddenWeekText        : 'Semaine spécifique',
            workingTimeText           : 'Temps de travail',
            nonworkingTimeText        : 'Période chômée',
            dayOverridesText          : 'Jour exception',
            weekOverridesText         : 'Semaine exception',
            okText                    : 'OK',
            cancelText                : 'Annuler',
            parentCalendarText        : 'Calendrier parent',
            noParentText              : 'Pas de parent',
            selectParentText          : 'Sélectionner un calendrier parent',
            newDayName                : '[Sans nom]',
            calendarNameText          : 'Nom de calendrier',
            isProjectCalendarText     : 'Calendrier de projet',
            tplTexts                  : {
                tplWorkingHours  : 'Horaires de travail pour',
                tplIsNonWorking  : 'Chômé',
                tplOverride      : 'Exception',
                tplInCalendar    : 'En calendrier',
                tplDayInCalendar : 'Jour standard en calendrier',
                tplBasedOn       : 'Basé sur'
            },
            overrideErrorText         : 'Il existe déjà une exception pour ce jour',
            overrideDateError         : 'Il existe déjà une semaine spécifique pour cette date: {0}',
            startAfterEndError        : 'Date de début doit être antérieure à la date de fin',
            weeksIntersectError       : "Semaines exception ne doivent pas s'intrecroiser"
        },

        'Gnt.widget.calendar.AvailabilityGrid' : {
            startText  : 'Début',
            endText    : 'Fin',
            addText    : 'Ajouter',
            removeText : 'Supprimer',
            error      : 'Erreur'
        },

        'Gnt.widget.calendar.DayEditor' : {
            workingTimeText    : 'Temps de travail',
            nonworkingTimeText : 'Période chômée'
        },

        'Gnt.widget.calendar.WeekEditor' : {
            defaultTimeText    : 'Temps par défault',
            workingTimeText    : 'Temps de travail',
            nonworkingTimeText : 'Période chômée',
            error              : 'Erreur',
            noOverrideError    : "Semaine exception contient que les jours par défault - enregistrement impossible"
        },

        'Gnt.widget.calendar.ResourceCalendarGrid' : {
            name     : 'Nom',
            calendar : 'Calendrier'
        },

        'Gnt.widget.calendar.CalendarWindow' : {
            title  : 'Calendrier',
            ok     : 'Ok',
            cancel : 'Annuler'
        },

        'Gnt.widget.calendar.CalendarManager' : {
            addText         : 'Ajouter',
            removeText      : 'Supprimer',
            add_child       : 'Ajouter un calendrier enfant',
            add_node        : 'Ajouter un calendrier',
            add_sibling     : 'Ajouter un calendrier au même niveau',
            remove          : 'Supprimer',
            calendarName    : 'Calendrier',
            confirm_action  : "Confirmez l'action",
            confirm_message : 'Calendrier contient des modifications non enregistrées.Voulez-vous sauvegarder vos modifications?'
        },

        'Gnt.widget.calendar.CalendarManagerWindow' : {
            title           : 'Gestionnaire de calendrier',
            ok              : 'Appliquer les changements',
            cancel          : 'Fermer',
            confirm_action  : "Confirmez l'action",
            confirm_message : 'Calendrier contient des modifications non enregistrées.Voulez-vous sauvegarder vos modifications?'
        },

        'Gnt.field.Assignment' : {
            cancelText : 'Annuler',
            closeText  : 'Enregistrer et fermer'
        },

        'Gnt.column.AssignmentUnits' : {
            text : 'Unitées'
        },

        'Gnt.column.Duration' : {
            text : 'Durée'
        },

        'Gnt.column.Effort' : {
            text : 'Charges'
        },

        'Gnt.column.BaselineEffort' : {
            text : 'Charges planifiées'
        },

        'Gnt.column.ActualEffort' : {
            text : 'Charges réelles'
        },

        'Gnt.column.EffortVariance' : {
            text : 'Variation de charges'
        },

        'Gnt.column.Cost' : {
            text : 'Coût'
        },

        'Gnt.column.BaselineCost' : {
            text : 'Coût planifié'
        },

        'Gnt.column.ActualCost' : {
            text : 'Coût réel'
        },

        'Gnt.column.CostVariance' : {
            text                : 'Variation de coût',
            currencySymbol      : '€',
            currencySymbolAlign : 'left'
        },

        'Gnt.column.EndDate' : {
            text : 'Fin'
        },

        'Gnt.column.PercentDone' : {
            text : '% achevé'
        },

        'Gnt.column.ResourceAssignment' : {
            text : ' Ressources assignées'
        },

        'Gnt.column.ResourceName' : {
            text : 'Nom de ressource'
        },

        'Gnt.column.Rollup' : {
            text : 'Report',
            no   : 'Non',
            yes  : 'Oui'
        },

        'Gnt.field.ManuallyScheduled' : {
            yes : 'Oui',
            no  : 'Non'
        },

        'Gnt.field.ReadOnly' : {
            yes : 'Oui',
            no  : 'Non'
        },

        'Gnt.column.ManuallyScheduled' : {
            text : 'Mode manuel'
        },

        'Gnt.column.SchedulingMode' : {
            text : 'Mode'
        },

        'Gnt.column.Predecessor' : {
            text : 'Prédécesseurs'
        },

        'Gnt.column.Successor' : {
            text : 'Successeurs'
        },

        'Gnt.column.StartDate' : {
            text : 'Début'
        },

        'Gnt.column.WBS' : {
            text : 'WBS'
        },

        'Gnt.column.Sequence' : {
            text : '#'
        },

        'Gnt.column.Calendar' : {
            text : 'Calendrier'
        },

        'Gnt.column.ReadOnly' : {
            text : ' En lecture seule'
        },

        'Gnt.widget.taskeditor.ProjectForm' : {
            nameText                : 'Nom',
            startText               : 'Début',
            finishText              : 'Fin',
            calendarText            : 'Calendrier',
            readOnlyText            : 'En lecture seule',
            allowDependenciesText   : 'Permettre les interdépendances',
            'Schedule from'         : 'Prévisions à partir de'
        },

        'Gnt.widget.taskeditor.TaskForm' : {
            taskNameText            : 'Nom',
            durationText            : 'Durée',
            datesText               : 'Dates',
            baselineText            : 'Planifié',
            startText               : 'Début',
            finishText              : 'Fin',
            percentDoneText         : 'Pourcent achevé',
            baselineStartText       : 'Début',
            baselineFinishText      : 'Fin',
            baselinePercentDoneText : 'Pourcent achevé',
            baselineEffortText      : 'Charges',
            effortText              : 'Charges',
            invalidEffortText       : 'Valeur charges invalide',
            calendarText            : 'Calendrier',
            manuallyScheduledText   : 'Mode manuel',
            schedulingModeText      : 'Mode prévisions',
            rollupText              : 'Report',
            wbsCodeText             : 'WBS',
            "Constraint Type"       : "Type contrainte",
            "Constraint Date"       : "Date contrainte",
            readOnlyText            : 'En lecture seule'
        },

        'Gnt.widget.DependencyGrid' : {
            addDependencyText         : 'Ajouter',
            dropDependencyText        : 'Supprimer',
            idText                    : '№',
            snText                    : 'SN',
            taskText                  : 'Tâche',
            blankTaskText             : 'Veuillez sélectionner une tâche',
            invalidDependencyText     : 'Dépendance invalide',
            parentChildDependencyText : 'Dépendance entre tâche enfant et tâche parent trouvée',
            duplicatingDependencyText : 'Dépendance double trouvée',
            transitiveDependencyText  : 'Dépendance transitive',
            cyclicDependencyText      : 'Dépendance cyclique',
            typeText                  : 'Type',
            lagText                   : 'Décalage',
            clsText                   : 'CSS class',
            endToStartText            : 'Fin-à-début',
            startToStartText          : 'Début-à-début',
            endToEndText              : 'Fin-à-fin',
            startToEndText            : 'Début-à-fin',
            predecessorsText          : 'Prédécesseurs',
            successorsText            : 'Successeurs'
        },

        'Gnt.widget.AssignmentEditGrid' : {
            confirmAddResourceTitle        : 'Confirmez',
            confirmAddResourceText         : "Ressource &quot;{0}&quot; ne figure pas sur la liste. Souhaitez-vous l'ajouter?",
            noValueText                    : 'Veuillez choisir une ressource',
            noResourceText                 : 'Ressource &quot;{0}&quot; ne figure pas sur la liste',
            'Resource is already assigned' : 'Ressource est déjà assignée',
            addAssignmentText  : 'Ajouter',
            dropAssignmentText : 'Supprimer'
        },

        'Gnt.widget.taskeditor.TaskEditor' : {
            generalText        : 'Général',
            resourcesText      : 'Ressources',
            notesText          : 'Notes',
            advancedText       : 'Avancé'
        },

        'Gnt.widget.taskeditor.ProjectEditor' : {
            generalText        : 'Général',
            descriptionText    : 'Déscription'
        },

        'Gnt.plugin.taskeditor.BaseEditor' : {
            title        : 'Informations sur la tâche',
            alertCaption : 'Informations',
            alertText    : 'Veuillez corriger les erreurs marquées avant de sauvegarder',
            okText       : 'Ok',
            cancelText   : 'Annuler'
        },

        'Gnt.plugin.taskeditor.ProjectEditor' : {
            title        : 'Informations sur le projet'
        },

        'Gnt.field.EndDate' : {
            endBeforeStartText : 'Date de fin est antérieure à la date de début'
        },

        'Gnt.field.ConstraintDate' : {
            format : 'd/m/Y H:i'
        },

        'Gnt.column.Note' : {
            text : 'Note'
        },

        'Gnt.column.AddNew' : {
            text : 'Ajouter une colonne...'
        },

        'Gnt.column.EarlyStartDate' : {
            text : 'Début avancé au plus tôt le'
        },

        'Gnt.column.EarlyEndDate' : {
            text : 'Fin avancée au plus tôt le'
        },

        'Gnt.column.LateStartDate' : {
            text : 'Début repoussé au plus tard le'
        },

        'Gnt.column.LateEndDate' : {
            text : 'Fin repousée au plus tard le'
        },

        'Gnt.field.Calendar' : {
            calendarNotApplicable : "Calendrier de tâches n'a pas de chevauchement avec les calendriers des ressources assignées",
            invalidText : 'Valeur invalide'
        },

        'Gnt.field.ScheduleBackwards' : {
            'Project start date'  : 'Date de début du projet',
            'Project finish date' : 'Date de fin du projet'
        },

        'Gnt.column.Slack' : {
            text : 'Marge libre'
        },

        'Gnt.column.TotalSlack' : {
            text : 'Marge totale'
        },

        'Gnt.column.Name' : {
            text : 'Nom de tâche'
        },

        'Gnt.column.BaselineStartDate' : {
            text : 'Date de début planifiée'
        },

        'Gnt.column.BaselineEndDate' : {
            text : 'Date de fin planifiée'
        },

        'Gnt.column.Milestone' : {
            text : 'Jalon'
        },

        'Gnt.field.Milestone' : {
            yes : 'Oui',
            no  : 'Non'
        },

        'Gnt.field.Dependency' : {
            invalidFormatText     : 'Format dépendance invalide',
            invalidDependencyText : "Dépendance invalide, assurez-vous dans l'absence de connections doubles ou cycliques entre les tâches",
            invalidDependencyType : 'Type de dépendance invalide {0}. Les valeurs permises sont: {1}.'
        },

        'Gnt.constraint.Base' : {
            name                                           : "Contrainte",
            // {0} constraint name
            "Remove the constraint"                        : "Continuer. Supprimer {0} la contrainte",
            "Cancel the change and do nothing"             : "Annuler les modifications",
            // {0} task name, {1} constraint name
            "This action will cause a scheduling conflict" : 'Cette action va générer un conflit prévisions pour une tâche récapitulative "{0}". Une {1} contrainte sur la tâche récapitulative la met en conflit avec une de ses sous-tâches.'
        },

        'Gnt.constraint.AsLateAsPossible' : {
            name : 'Le Plus Tard Possible'
        },

        'Gnt.constraint.AsSoonAsPossible' : {
            name : 'Dès Que Possible'
        },

        'Gnt.constraint.implicit.Dependency' : {
            // {0} dependency type
            // {1} from task
            // {2} to task
            'You moved the task away'             : 'Vous avez éloigné la tâche "{2}" de "{1}" et les deux sont liées ({0}). Par conséquent la liaison entre les tâches ne va pas définir la position de la tâche ultérieure.',
            'You moved the task before'           : 'Vous avez placé la tâche "{2}" avant "{1}" et les deux sont liées ({0}). Par conséquent la liaison ne peut pas être respectée.',
            'Remove the constraint'               : 'Supprimer la dépendance',
            depType0                              : 'Début-à-début',
            depType1                              : 'Début-à-Fin',
            depType2                              : 'Fin-à-début',
            depType3                              : 'Fin-à-fin',
            'Keep the dependency & move the task' : 'Garder la dépendance et la placer à {0}'
        },

        'Gnt.constraint.implicit.PotentialConflict' : {
            'This could result in a scheduling conflict' : 'Vous avez établi une contrainte {0} sur une tâche "{1}". Cela peut générer un confit prévisions parce que la tâche a un prédécesseur.',
            'Remove the constraint'                      : 'Continuer. Établir une contrainte {0} ',
            'Replace the constraint'                     : 'Continuer mais éviter le conflit en utilisant {0} une contrainte en échange'
        },

        'Gnt.constraint.FinishNoEarlierThan' : {
            name                             : "Fin au plus tôt le",
            "Move the task to finish on {0}" : "Bouger la fin de tâche à {0}"
        },

        "Gnt.constraint.FinishNoLaterThan" : {
            name                             : "Fin au plus tard le",
            "Move the task to finish on {0}" : "Bouger la fin de tâche à {0}"
        },

        "Gnt.constraint.MustFinishOn" : {
            name                             : "Doit finir le",
            "Move the task to finish on {0}" : "Bouger la fin de tâche à {0}"
        },

        "Gnt.constraint.MustStartOn" : {
            name                            : "Doit commencer le",
            "Move the task to start at {0}" : "Bouger le début de tâche à {0}"
        },

        "Gnt.constraint.StartNoEarlierThan" : {
            name                            : "Début au plus tôt le",
            "Move the task to start at {0}" : "Bouger le début de tâche à  {0}"
        },

        "Gnt.constraint.StartNoLaterThan" : {
            name                            : "Début au plus tard le",
            // {0} potential start date
            "Move the task to start at {0}" : "Bouger le début de tâche à {0}"
        },

        "Gnt.column.ConstraintDate" : {
            text   : " Date contrainte",
            format : 'd/m/Y H:i'
        },

        "Gnt.column.ConstraintType" : {
            text : "Type contrainte"
        },

        "Gnt.widget.ConstraintResolutionForm" : {
            dateFormat                             : "d/m/Y H:i",
            "OK"                                   : "OK",
            "Cancel"                               : "Annuler",
            "Resolution options"                   : "Options de résolution",
            "Don't ask again"                      : "Ne plus demander",
            // {0} task name, {1} constraint name
            "Task {0} violates constraint {1}"     : "Tâche \"{0}\" compromet la contrainte {1}",
            // {0} task name, {1} constraint name, {2} constraint date
            "Task {0} violates constraint {1} {2}" : "Tâche \"{0}\" compromet la contrainte {1} {2}"
        },

        "Gnt.widget.ConstraintResolutionWindow" : {
            "Constraint violation" : "Violation de contrainte"
        },

        "Gnt.panel.ResourceHistogram" : {
            resourceText : 'Ressource'
        },

        "Gnt.panel.ResourceUtilization" : {
            "calculating {0}% done" : "calculé à {0}% complet"
        }
    },

    apply : function (classNames) {
        // apply corresponding scheduler locale first
        Sch.locale.Fr.apply(classNames);
        this.callParent(arguments);
    }
});
