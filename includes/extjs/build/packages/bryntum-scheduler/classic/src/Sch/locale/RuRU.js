// @tag alternative-locale
/**
 * Russia translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Sch.locale.RuRU', {
    extend    : 'Sch.locale.Locale',
    singleton : true,

    l10n : {
        'Sch.util.Date' : {
            unitNames : {
                YEAR    : { single : 'год', plural : 'лет', abbrev : 'г' },
                QUARTER : { single : 'квартал', plural : 'кварталов', abbrev : 'квар' },
                MONTH   : { single : 'месяц', plural : 'месяцев', abbrev : 'мес' },
                WEEK    : { single : 'неделя', plural : 'недели', abbrev : 'нед' },
                DAY     : { single : 'день', plural : 'дней', abbrev : 'д' },
                HOUR    : { single : 'час', plural : 'часов', abbrev : 'ч' },
                MINUTE  : { single : 'минута', plural : 'минут', abbrev : 'мин' },
                SECOND  : { single : 'секунда', plural : 'секунд', abbrev : 'с' },
                MILLI   : { single : 'миллисек', plural : 'миллисек', abbrev : 'мс' }
            }
        },
    
        'Sch.model.CalendarDay' : {
            startTimeAfterEndTime                   : 'Время начала {0} позже времени окончания {1}',
            availabilityIntervalsShouldNotIntersect : 'Интервалы доступности не должны пересекаться: [{0}] и [{1}]',
            invalidFormat                           : 'Неверный формат строки: {0}. Формат должен быть: hh:mm-hh:mm'
        },

        "Sch.panel.SchedulerTree" : {
            'All day'    : 'Весь день'
        },

        "Sch.panel.SchedulerGrid" : {
            'All day'    : 'Весь день'
        },

        'Sch.panel.TimelineGridPanel' : {
            weekStartDay : 1,
            loadingText  : 'Загрузка, пожалуйста подождите...',
            savingText   : 'Сохраняю данные, пожалуйста подождите...'
        },

        'Sch.panel.TimelineTreePanel' : {
            weekStartDay : 1,
            loadingText  : 'Загрузка, пожалуйста подождите...',
            savingText   : 'Сохраняю данные, пожалуйста подождите...'
        },

        'Sch.mixin.SchedulerView' : {
            loadingText : "Загружаем данные..."
        },

        'Sch.plugin.CurrentTimeLine' : {
            tooltipText : 'Текущеее время'
        },

        //region Recurrence
        'Sch.widget.recurrence.ConfirmationDialog' : {
            'delete-title'              : 'Вы удаляете повторяющееся событие',
            'delete-all-message'        : 'Хотите удалить все повторения этого события?',
            'delete-further-message'    : 'Хотите удалить это и все последующие повторения этого события или только выбранное?',
            'delete-all-btn-text'       : 'Удалить все',
            'delete-further-btn-text'   : 'Удалить все будущие повторения',
            'delete-only-this-btn-text' : 'Удалить только это событие',

            'update-title'              : 'Вы изменяете повторяющееся событие',
            'update-all-message'        : 'Изменить все повторения события?',
            'update-further-message'    : 'Изменить только это повторение или это и все последующие повторения события?',
            'update-all-btn-text'       : 'Все',
            'update-further-btn-text'   : 'Все будущие повторения',
            'update-only-this-btn-text' : 'Только это событие',

            'Yes'    : 'Да',
            'Cancel' : 'Отменить'
        },

        'Sch.widget.recurrence.Dialog' : {
            'Repeat event' : 'Повторять событие',
            'Cancel'       : 'Отменить',
            'Save'         : 'Сохранить'
        },

        'Sch.widget.recurrence.Form' : {
            'Frequency'           : 'Как часто',
            'Every'               : 'Каждый(ую)',
            'DAILYintervalUnit'   : 'день',
            'WEEKLYintervalUnit'  : 'неделю по:',
            'MONTHLYintervalUnit' : 'месяц',
            'YEARLYintervalUnit'  : 'год/лет в:',
            'Each'                : 'Какого числа',
            'On the'              : 'В следующие дни',
            'End repeat'          : 'Прекратить',
            'time(s)'             : 'раз(а)'
        },

        'Sch.widget.recurrence.field.DaysComboBox' : {
            'day'         : 'день',
            'weekday'     : 'будний день',
            'weekend day' : 'выходной день'
        },

        'Sch.widget.recurrence.field.PositionsComboBox' : {
            'position1'  : 'первый',
            'position2'  : 'второй',
            'position3'  : 'третий',
            'position4'  : 'четвертый',
            'position5'  : 'пятый',
            'position-1' : 'последний'
        },

        'Sch.data.util.recurrence.Legend' : {
            // list delimiters
            ', '                            : ', ',
            ' and '                         : ' и ',
            // frequency patterns
            'Daily'                         : 'Ежедневно',
            'Weekly on {1}'                 : 'Еженедельно ({1})',
            'Monthly on {1}'                : 'Ежемесячно (день: {1})',
            'Yearly on {1} of {2}'          : 'Ежегодно (день: {1}, месяц: {2})',
            'Every {0} days'                : 'Каждый {0} день',
            'Every {0} weeks on {1}'        : 'Каждую {0} неделю, день: {1}',
            'Every {0} months on {1}'       : 'Каждый {0} месяц, день: {1}',
            'Every {0} years on {1} of {2}' : 'Каждый {0} год, день: {1} месяц: {2}',
            // day position translations
            'position1'                     : 'первый',
            'position2'                     : 'второй',
            'position3'                     : 'третий',
            'position4'                     : 'четвертый',
            'position5'                     : 'пятый',
            'position-1'                    : 'последний',
            // day options
            'day'                           : 'день',
            'weekday'                       : 'будний день',
            'weekend day'                   : 'выходной день',
            // {0} - day position info ("the last"/"the first"/...)
            // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
            // For example:
            //  "the last Sunday"
            //  "the first weekday"
            //  "the second weekend day"
            'daysFormat'                    : '{0} {1}'
        },

        'Sch.widget.recurrence.field.StopConditionComboBox' : {
            'Never'   : 'Никогда',
            'After'   : 'После',
            'On date' : 'В дату'
        },

        'Sch.widget.recurrence.field.FrequencyComboBox' : {
            'Daily'   : 'Каждый день',
            'Weekly'  : 'Каждую неделю',
            'Monthly' : 'Каждый месяц',
            'Yearly'  : 'Каждый год'
        },

        'Sch.widget.recurrence.field.RecurrenceComboBox' : {
            'None'      : 'Не выбрано',
            'Custom...' : 'Настроить...'
        },

        'Sch.widget.EventEditor' : {
            'Repeat'      : 'Повтор',
            saveText      : 'Сохранить',
            deleteText    : 'Удалить',
            cancelText    : 'Отменить',
            nameText      : 'Название',
            allDayText    : 'Весь день',
            startDateText : 'Начало',
            endDateText   : 'Конец',
            resourceText  : 'Ресурс'
        },
        //endregion Recurrence

        'Sch.plugin.SimpleEditor' : {
            newEventText : 'Новое событие...'
        },

        'Sch.widget.ExportDialogForm' : {
            formatFieldLabel         : 'Размер листа',
            orientationFieldLabel    : 'Ориентация',
            rangeFieldLabel          : 'Диапазон расписания',
            showHeaderLabel          : 'Показать верхний колонтитул',
            showFooterLabel          : 'Показать нижний колонтитул',
            orientationPortraitText  : 'Портрет',
            orientationLandscapeText : 'Ландшафт',
            completeViewText         : 'Полное расписание',
            currentViewText          : 'Текущая видимая область',
            dateRangeText            : 'Диапазон дат',
            dateRangeFromText        : 'Экспортировать с',
            dateRangeToText          : 'Экспортировать по',
            adjustCols               : 'Настройка ширины столбцов',
            adjustColsAndRows        : 'Настройка ширины столбцов и высоты строк',
            exportersFieldLabel      : 'Разбивка на страницы',
            specifyDateRange         : 'Укажите диапазон',
            columnPickerLabel        : 'Выберите столбцы',
            dpiFieldLabel            : 'DPI (точек на дюйм)',
            completeDataText         : 'Полное расписание (по всем событиям)',
            rowsRangeLabel           : 'Диапазон строк',
            allRowsLabel             : 'Все строки',
            visibleRowsLabel         : 'Видимые строки',
            columnEmptyText          : '[нет заголовка]'
        },

        'Sch.widget.ExportDialog' : {
            title            : 'Настройки экспорта',
            exportButtonText : 'Экспортировать',
            cancelButtonText : 'Отмена',
            progressBarText  : 'Экспортирование...'
        },

        'Sch.plugin.Export' : {
            generalError          : 'Произошла обшибка',
            fetchingRows          : 'Извлекается строка {0} из {1}',
            builtPage             : 'Подготовлена страница {0} из {1}',
            requestingPrintServer : 'Передача данных на сервер...'
        },

        'Sch.plugin.Printable' : {
            dialogTitle      : 'Параметры печати',
            exportButtonText : 'Печать',
            disablePopupBlocking : 'Пожалуйста, отключите блокировку всплывающих окон и вкладок. Плагину печати необходима возможность открывать новые вкладки.',
            popupBlockerDetected : 'Обнаружена блокировка всплавающих окон.'
        },

        'Sch.plugin.exporter.AbstractExporter' : {
            name : 'Выгрузка'
        },

        'Sch.plugin.exporter.SinglePage' : {
            name : 'Одна страница'
        },

        'Sch.plugin.exporter.MultiPageVertical' : {
            name : 'Многостраничный (по вертикали)'
        },

        'Sch.plugin.exporter.MultiPage' : {
            name : 'Многостраничный'
        },

        'Sch.plugin.Split' : {
            splitText : 'Разделить',
            mergeText : 'Скрыть разделенную часть'
        },

        'Sch.plugin.SummaryBar' : {
            totalText : 'Всего'
        },

        'Sch.column.ResourceName' : {
            name : 'Название'
        },

        'Sch.template.DependencyInfo' : {
            fromText : 'От',
            toText   : 'К'
        },

        // -------------- View preset date formats/strings -------------------------------------
        'Sch.preset.Manager' : {
            hourAndDay : {
                displayDateFormat : 'g:i A',
                middleDateFormat  : 'g A',
                topDateFormat     : 'd.m.Y'
            },

            secondAndMinute : {
                displayDateFormat : 'g:i:s A',
                topDateFormat     : 'D, d H:i'
            },

            dayAndWeek : {
                displayDateFormat : 'd.m h:i A',
                middleDateFormat  : 'd.m.Y'
            },

            weekAndDay : {
                displayDateFormat : 'd.m',
                bottomDateFormat  : 'd M',
                middleDateFormat  : 'Y F d'
            },

            weekAndMonth : {
                displayDateFormat : 'd.m.Y',
                middleDateFormat  : 'd.m',
                topDateFormat     : 'd.m.Y'
            },

            weekAndDayLetter : {
                displayDateFormat : 'd/m/Y',
                middleDateFormat  : 'D d M Y'
            },

            weekDateAndMonth : {
                displayDateFormat : 'd.m.Y',
                middleDateFormat  : 'd',
                topDateFormat     : 'Y F'
            },

            monthAndYear : {
                displayDateFormat : 'd.m.Y',
                middleDateFormat  : 'M Y',
                topDateFormat     : 'Y'
            },

            year : {
                displayDateFormat : 'd.m.Y',
                middleDateFormat  : 'Y'
            },

            manyYears : {
                displayDateFormat : 'd.m.Y',
                middleDateFormat  : 'Y'
            }
        }
    }
});
