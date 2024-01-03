// @tag alternative-locale
/**
 * Russia translations for the Gantt component
 * including Russia translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Gnt.locale.RuRU', {
    extend    : 'Sch.locale.Locale',
    requires  : 'Sch.locale.RuRU',
    singleton : true,

    l10n : {
        'Gnt.util.DurationParser' : {
            unitsRegex : {
                MILLI   : /^мс$|^мил/i,
                SECOND  : /^с$|^сек/i,
                MINUTE  : /^м$|^мин/i,
                HOUR    : /^ч$|^час/i,
                DAY     : /^д$|^ден|^дне/i,
                WEEK    : /^н$|^нед/i,
                MONTH   : /^мес/i,
                QUARTER : /^к$|^квар|^квр/i,
                YEAR    : /^г$|^год|^лет/i
            }
        },

        'Gnt.util.DependencyParser' : {
            typeText : {
                SS : 'НН',
                SF : 'НО',
                FS : 'ОН',
                FF : 'ОО'
            }
        },

        'Gnt.panel.Timeline' : {
            start : 'Начало',
            end   : 'Конец',
            format : 'd.m.Y'
        },

        'Gnt.field.ShowInTimeline' : {
            yes : 'Да',
            no  : 'Нет'
        },

        'Gnt.column.ShowInTimeline' : {
            text : 'Показать на временной шкале'
        },

        'Gnt.field.ConstraintType' : {
            none : 'Нет',
            invalidText : "Неверное значение"
        },

        'Gnt.field.Duration' : {
            invalidText : "Неверное значение"
        },

        'Gnt.field.Cost' : {
            invalidText         : "Неверное значение",
            currencySymbol      : 'р.',
            currencySymbolAlign : 'right'
        },

        'Gnt.field.Effort' : {
            invalidText : "Неверное значение"
        },

        'Gnt.field.Percent' : {
            invalidText : "Неверное значение"
        },

        'Gnt.field.SchedulingMode' : {
            Normal              : 'Стандартный',
            FixedDuration       : 'Фиксированная длительность',
            EffortDriven        : 'Фиксированный объем работ',
            DynamicAssignment   : 'Динамические назначения',
            invalidText         : 'Неверное значение'
        },

        'Gnt.template.Deadline' : {
            deadline : 'Крайний срок'
        },

        'Gnt.column.DeadlineDate' : {
            text : 'Крайний срок'
        },

        'Gnt.Tooltip' : {
            startText    : 'Начинается: ',
            endText      : 'Заканчивается: ',
            durationText : 'Длительность:'
        },

        'Gnt.template.TaskTooltip' : {
            startText    : 'Начинается',
            endText      : 'Заканчивается',
            percentText  : 'Завершения',
            format       : 'd.m.Y',
            overflowText : 'Есть еще {nbrOverflowing} {[values.nbrOverflowing > 1 ? "задач(и)" : "задача"]}'
        },

        'Gnt.plugin.ProjectLines' : {
            startOf : 'Начало:',
            endOf   : 'Конец:'
        },

        'Gnt.plugin.TaskContextMenu' : {
            projectInformation : 'Информация по проекту',
            taskInformation    : 'Информация по задаче',
            newTaskText        : 'Новая задача',
            deleteTask         : 'Удалить задачу(и)',
            editLeftLabel      : 'Редактировать левую метку',
            editRightLabel     : 'Редактировать правую метку',
            add                : 'Добавить...',
            deleteDependency   : 'Удалить зависимость...',
            addTaskAbove       : 'Задачу выше',
            addTaskBelow       : 'Задачу ниже',
            addMilestone       : 'Веху',
            addSubtask         : 'Под-задачу',
            addSuccessor       : 'Последующую задачу',
            addPredecessor     : 'Предшествующую задачу',
            convertToMilestone : 'Преобразовать в веху',
            convertToRegular   : 'Преобразовать в задачу',
            splitTask          : 'Прерывание задачи'
        },

        'Gnt.plugin.DependencyEditor' : {
            fromText            : 'От',
            toText              : 'К',
            typeText            : 'Тип',
            lagText             : 'Задержка',
            endToStartText      : 'Конец-К-Началу',
            startToStartText    : 'Начало-К-Началу',
            endToEndText        : 'Конец-К-Концу',
            startToEndText      : 'Начало-К-Концу',
            okButtonText        : 'Ok',
            cancelButtonText    : 'Отменить',
            deleteButtonText    : 'Удалить'
        },

        'Gnt.widget.calendar.Calendar' : {
            format                    : 'd.m.Y',
            dateInTextFormat          : 'M j, Y',
            dayOverrideNameHeaderText : 'Название',
            overrideName       : 'Наименование',
            startDate          : 'Начало',
            endDate            : 'Окончание',
            error              : 'Ошибка',
            dateText           : 'Дата',
            addText            : 'Добавить',
            editText           : 'Изменить',
            removeText         : 'Удалить',
            workingDayText     : 'Рабочий день',
            weekendsText       : 'Выходные',
            overriddenDayText  : 'Особый день',
            overriddenWeekText : 'Особая неделя',
            workingTimeText    : 'Рабочее время',
            nonworkingTimeText : 'Нерабочее время',
            dayOverridesText   : 'Особые дни',
            weekOverridesText  : 'Особые недели',
            okText             : 'Ok',
            cancelText         : 'Отменить',
            parentCalendarText : 'Родительский календарь',
            noParentText       : 'Нет родителя',
            selectParentText   : 'Выбрать родительский календарь',
            newDayName         : '[Без имени]',
            calendarNameText   : 'Название календаря',
            isProjectCalendarText   : 'Календарь проекта',
            tplTexts           : {
                tplWorkingHours     : 'Рабочие часы для',
                tplIsNonWorking     : 'нерабочее',
                tplOverride         : 'особый',
                tplInCalendar       : 'в календаре',
                tplDayInCalendar    : 'обычный день в календаре',
                tplBasedOn          : 'Основан на'
            },
            overrideErrorText         : 'Для этого дня уже создано исключение',
            overrideDateError         : 'Для {0} уже создано исключение',
            startAfterEndError        : 'Дата начала должна быть раньше даты окончания',
            weeksIntersectError       : 'Особые недели не должны пересекаться'
        },

        'Gnt.widget.calendar.CalendarManager' : {
            addText         : 'Добавить',
            removeText      : 'Удалить',
            add_child       : 'Добавить дочерний календарь',
            add_node        : 'Добавить календарь',
            add_sibling     : 'Добавить календарь на этом уровне',
            remove          : 'Удалить',
            calendarName    : 'Календарь',
            confirm_action  : 'Подтвердите действие',
            confirm_message : 'Сохранить изменения?'
        },

        'Gnt.widget.calendar.CalendarManagerWindow' : {
            ok              : 'Применить',
            cancel          : 'Закрыть',
            title           : 'Управление календарями',
            confirm_action  : 'Подтвердите действие',
            confirm_message : 'Календарь был изменен. Сохранить изменения?'
        },

        'Gnt.widget.calendar.AvailabilityGrid' : {
            startText  : 'Начало',
            endText    : 'Конец',
            addText    : 'Добавить',
            removeText : 'Удалить',
            error      : 'Ошибка'
        },

        'Gnt.widget.calendar.DayEditor' : {
            workingTimeText    : 'Рабочее время',
            nonworkingTimeText : 'Нерабочее время'
        },

        'Gnt.widget.calendar.WeekEditor' : {
            defaultTimeText    : 'Стандартное время',
            workingTimeText    : 'Рабочее время',
            nonworkingTimeText : 'Нерабочее время',
            error              : 'Ошибка',
            noOverrideError    : 'Особая неделя содержит только стандартные дни - нет данных для сохранения'
        },

        'Gnt.widget.calendar.ResourceCalendarGrid' : {
            name     : 'Ресурс',
            calendar : 'Календарь'
        },

        'Gnt.widget.calendar.CalendarWindow' : {
            title   : 'Календарь',
            ok      : 'Принять',
            cancel  : 'Отменить'
        },

        'Gnt.field.Assignment' : {
            cancelText : 'Отменить',
            closeText  : 'Сохранить и закрыть'
        },

        'Gnt.column.AssignmentUnits' : {
            text : 'Единицы'
        },

        'Gnt.column.Duration' : {
            text : 'Длительность'
        },

        'Gnt.column.Effort' : {
            text : 'Трудозатраты'
        },

        'Gnt.column.BaselineEffort' : {
            text : 'Базовые трудозатраты'
        },

        'Gnt.column.ActualEffort' : {
            text : 'Действительные трудозатраты'
        },

        'Gnt.column.EffortVariance' : {
            text : 'Отклонение по трудозатратам'
        },

        'Gnt.column.Cost' : {
            text : 'Стоимость'
        },

        'Gnt.column.BaselineCost' : {
            text : 'Базовая стоимость'
        },

        'Gnt.column.ActualCost' : {
            text : 'Действительная стоимость'
        },

        'Gnt.column.CostVariance' : {
            text                : 'Отклонение по стоимости',
            currencySymbol      : 'р.',
            currencySymbolAlign : 'right'
        },

        'Gnt.column.EndDate' : {
            text : 'Конец'
        },

        'Gnt.column.PercentDone' : {
            text : '% завершения'
        },

        'Gnt.column.ResourceAssignment' : {
            text : 'Назначенные ресурсы'
        },

        'Gnt.column.ResourceName' : {
            text : 'Имя ресурса'
        },

        'Gnt.column.Rollup' : {
            text : 'Сведение',
            yes  : 'Да',
            no   : 'Нет'
        },

        'Gnt.field.ManuallyScheduled' : {
            yes : 'Да',
            no  : 'Нет'
        },

        'Gnt.field.ReadOnly' : {
            yes : 'Да',
            no  : 'Нет'
        },

        'Gnt.column.ManuallyScheduled' : {
            text : 'Планирование вручную'
        },

        'Gnt.column.SchedulingMode' : {
            text : 'Режим'
        },

        'Gnt.column.Predecessor' : {
            text : 'Предшествующие'
        },

        'Gnt.column.Successor' : {
            text : 'Последующие'
        },

        'Gnt.column.StartDate' : {
            text : 'Начало'
        },

        'Gnt.column.WBS' : {
            text : 'СДР'
        },

        'Gnt.column.Sequence' : {
            text : '#'
        },

        'Gnt.column.Calendar' : {
            text : 'Календарь'
        },

        'Gnt.column.ReadOnly' : {
            text : 'Только чтение'
        },

        'Gnt.widget.taskeditor.ProjectForm' : {
            nameText                : 'Наименование',
            startText               : 'Начало',
            finishText              : 'Конец',
            calendarText            : 'Календарь',
            readOnlyText            : 'Только для чтения',
            allowDependenciesText   : 'Разрешить зависимости с другими проектами',
            'Schedule from'         : 'Планирование от'
        },

        'Gnt.widget.taskeditor.TaskForm' : {
            taskNameText            : 'Наименование',
            durationText            : 'Длительность',
            datesText               : 'Даты',
            baselineText            : 'Исходный план',
            startText               : 'Начало',
            finishText              : 'Конец',
            percentDoneText         : '% завершения',
            baselineStartText       : 'Начало',
            baselineFinishText      : 'Конец',
            baselinePercentDoneText : '% завершения',
            baselineEffortText      : 'Трудозатраты',
            effortText              : 'Трудозатраты',
            invalidEffortText       : 'Неверное значение трудозатрат',
            calendarText            : 'Календарь',
            manuallyScheduledText   : 'Планирование вручную',
            schedulingModeText      : 'Режим',
            rollupText              : 'Сведение',
            wbsCodeText             : 'СДР код',
            "Constraint Type"       : 'Тип ограничения',
            "Constraint Date"       : 'Дата ограничения',
            readOnlyText            : 'Только для чтения'
        },

        'Gnt.widget.DependencyGrid' : {
            addDependencyText       : 'Добавить',
            dropDependencyText      : 'Удалить',
            idText                    : 'ID',
            snText                    : 'SN',
            taskText                  : 'Задача',
            blankTaskText             : 'Пожалуйста выберите задачу',
            invalidDependencyText     : 'Неверная зависимость',
            parentChildDependencyText : 'Обнаружена зависимость между родительской и вложенной задачами',
            duplicatingDependencyText : 'Повторная зависимость',
            transitiveDependencyText  : 'Транзитивная зависимость',
            cyclicDependencyText      : 'Цикличная зависимость',
            typeText                  : 'Тип',
            lagText                   : 'Задержка',
            clsText                   : 'CSS класс',
            endToStartText            : 'Конец-К-Началу',
            startToStartText          : 'Начало-К-Началу',
            endToEndText              : 'Конец-К-Концу',
            startToEndText            : 'Начало-К-Концу',
            predecessorsText          : 'Предшественники',
            successorsText            : 'Последователи'
        },

        'Gnt.widget.AssignmentEditGrid' : {
            confirmAddResourceTitle        : 'Подтверждение',
            confirmAddResourceText         : 'Ресурс с именем &quot;{0}&quot; не найден. Добавить его в список ресурсов?',
            noValueText                    : 'Пожалуйста выберите ресурс',
            noResourceText                 : 'Ресурс с именем &quot;{0}&quot; не найден',
            'Resource is already assigned' : 'Ресурс уже назначен',
            addAssignmentText       : 'Добавить',
            dropAssignmentText      : 'Удалить'
        },

        'Gnt.widget.taskeditor.ProjectEditor' : {
            generalText     : 'Основные',
            descriptionText : 'Описание'
        },

        'Gnt.widget.taskeditor.TaskEditor' : {
            generalText             : 'Основные',
            resourcesText           : 'Ресурсы',
            notesText               : 'Примечание',
            advancedText            : 'Дополнительно'
        },

        'Gnt.plugin.taskeditor.BaseEditor' : {
            title        : 'Информация по задаче',
            alertCaption : 'Информация',
            alertText    : 'Пожалуйста исправьте отмеченные ошибки перед сохранением',
            okText       : 'Принять',
            cancelText   : 'Отмена'
        },

        'Gnt.plugin.taskeditor.ProjectEditor' : {
            title : 'Информация по проекту'
        },

        'Gnt.field.EndDate' : {
            endBeforeStartText : 'Дата окончания раньше даты начала'
        },

        'Gnt.field.ConstraintDate' : {
            format : 'd.m.Y H:i'
        },

        'Gnt.column.Note' : {
            text : 'Примечание'
        },

        'Gnt.column.AddNew' : {
            text : 'Добавить столбец...'
        },

        'Gnt.column.EarlyStartDate' : {
            text : 'Раннее начало'
        },

        'Gnt.column.EarlyEndDate' : {
            text : 'Раннее окончание'
        },

        'Gnt.column.LateStartDate' : {
            text : 'Позднее начало'
        },

        'Gnt.column.LateEndDate' : {
            text : 'Позднее окончание'
        },

        'Gnt.field.Calendar' : {
            calendarNotApplicable : 'Календарь задачи не пересекается с календарями назначенных ресурсов',
            invalidText : 'Неверное значение'
        },

        'Gnt.field.ScheduleBackwards' : {
            'Project start date'  : 'Даты начала проекта',
            'Project finish date' : 'Даты окончания проекта'
        },

        'Gnt.column.Slack' : {
            text : 'Свободный временной резерв'
        },

        'Gnt.column.TotalSlack' : {
            text            : 'Общий временной резерв'
        },

        'Gnt.column.Name' : {
            text        : 'Наименование задачи'
        },

        'Gnt.column.BaselineStartDate' : {
            text : 'Плановое начало'
        },

        'Gnt.column.BaselineEndDate' : {
            text : 'Плановый конец'
        },

        'Gnt.column.Milestone' : {
            text : 'Веха'
        },

        'Gnt.field.Milestone' : {
            yes : 'Да',
            no  : 'Нет'
        },

        'Gnt.field.Dependency' : {
            invalidFormatText     : 'Неверный формат зависимости',
            invalidDependencyText : 'Неверная зависимость, пожалуйста убедитесь в отсутствии цикличностей или повторных транзитивных связей',
            invalidDependencyType : 'Неверный тип зависимости {0}. Разрешенные типы: {1}.'
        },

        'Gnt.constraint.Base' : {
            name                                           : "Ограничение",
            "Remove the constraint"                        : "Убрать ограничение",
            "Cancel the change and do nothing"             : "Отменить изменения",
            // {0} task name, {1} constraint name
            "This action will cause a scheduling conflict" : 'Это действие приведет к конфликту планирования суммарной задачи "{0}". Ограничение {1} на задаче приводит к конфликту с одной из подзадач.'
        },

        'Gnt.constraint.AsLateAsPossible' : {
            name : 'Как можно позже'
        },

        'Gnt.constraint.AsSoonAsPossible' : {
            name : 'Как можно раньше'
        },

        'Gnt.constraint.implicit.Dependency' : {
            'You moved the task away'             : 'Вы отодвинули задачу "{2}" от "{1}" но эти задачи связаны ({0}). В результате связь перестанет определять положение зависимой задачи.',
            'You moved the task before'           : 'Вы подвинули задачу "{2}" ранее "{1}" но эти задачи связаны ({0}). В результате связь не может быть выполнена.',
            'Remove the constraint'               : 'Удалить зависимость',
            depType0                              : 'Начало-К-Началу',
            depType1                              : 'Начало-К-Концу',
            depType2                              : 'Конец-К-Началу',
            depType3                              : 'Конец-К-Концу',
            'Keep the dependency & move the task' : 'Сохранить зависимость и установить задачу на {0}'
        },

        'Gnt.constraint.implicit.PotentialConflict' : {
            'This could result in a scheduling conflict' : 'Вы ставите ограничение {0} на задачу "{1}". Это может привести к конфиликту планирования так как эта задача связана с предшествующей задачей.',
            'Remove the constraint'                      : 'Продолжить. Установить ограничение {0}',
            'Replace the constraint'                     : 'Продолжить, но избежать конфликта использовав ограничение {0} взамен'
        },

        'Gnt.constraint.FinishNoEarlierThan' : {
            name                             : "Окончание не раньше",
            "Move the task to finish on {0}" : "Сдвинуть окончание задачи на {0}"
        },

        "Gnt.constraint.FinishNoLaterThan" : {
            name                             : "Окончание не позднее",
            "Move the task to finish on {0}" : "Сдвинуть окончание задачи на {0}"
        },

        "Gnt.constraint.MustFinishOn" : {
            name                             : "Фиксированное окончание",
            "Move the task to finish on {0}" : "Сдвинуть окончание задачи на {0}"
        },

        "Gnt.constraint.MustStartOn" : {
            name                                : "Фиксированное начало",

            "Move the task to start at {0}"     : "Сдвинуть начало задачи на {0}"
        },

        "Gnt.constraint.StartNoEarlierThan" : {
            name                                : "Начало не раньше",

            "Move the task to start at {0}"     : "Сдвинуть начало задачи на {0}"
        },

        "Gnt.constraint.StartNoLaterThan" : {
            name                                : "Начало не позднее",

            "Move the task to start at {0}"     : "Сдвинуть начало задачи на {0}"
        },

        "Gnt.column.ConstraintDate" : {
            text   : "Дата ограничения",
            format : 'd.m.Y H:i'
        },

        "Gnt.column.ConstraintType" : {
            text : "Тип ограничения"
        },

        "Gnt.widget.ConstraintResolutionForm" : {
            dateFormat                             : "d.m.Y H:i",
            "OK"                                   : "Принять",
            "Cancel"                               : "Отменить",
            "Resolution options"                   : "Варианты решения",
            "Don't ask again"                      : "Не спрашивать больше",
            // {0} task name, {1} constraint name
            "Task {0} violates constraint {1}"     : "Задача \"{0}\" нарушает ограничение {1}",
            // {0} task name, {1} constraint name, {2} constraint date
            "Task {0} violates constraint {1} {2}" : "Задача \"{0}\" нарушает ограничение {1} {2}"
        },

        "Gnt.widget.ConstraintResolutionWindow" : {
            "Constraint violation" : "Нарушение ограничения"
        },

        "Gnt.panel.ResourceHistogram" : {
            resourceText : 'Ресурс'
        },

        "Gnt.panel.ResourceUtilization" : {
            "calculating {0}% done" : "рассчитывается {0}% выполнено"
        }
    },


    apply : function (classNames) {
        // apply corresponding scheduler locale first
        Sch.locale.RuRU.apply(classNames);
        this.callParent(arguments);
    }
});
