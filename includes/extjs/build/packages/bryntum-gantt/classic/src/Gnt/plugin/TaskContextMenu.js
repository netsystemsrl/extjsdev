/**
 * Plugin for showing a context menu when right clicking a task:
 *
 * {@img gantt/images/context-menu.png}
 *
 * You can add it to your gantt chart like this:
 *
 * ```javascript
 * var gantt = Ext.create('Gnt.panel.Gantt', {
 *     plugins : [
 *         { ptype : 'gantt_taskcontextmenu' }
 *     ],
 *     ...
 * });
 * ```
 *
 * ##Customizing the menu
 *
 * To customize the content of the menu, subclass the plugin and provide your own implementation of the {@link #createMenuItems} method.
 * You can also customize various handlers for menu items, like {@link #addTaskAbove}, {@link #deleteTask} etc. For example:
 *
 * ```javascript
 * Ext.define('MyProject.plugin.TaskContextMenu', {
 *     extend     : 'Gnt.plugin.TaskContextMenu',
 *
 *     createMenuItems : function () {
 *         this.on('beforeshow', this.onMyBeforeShow, this);
 *
 *         // add a new menu entry
 *         return this.callParent().concat({
 *             text        : 'My handler',
 *
 *             handler     : this.onMyHandler,
 *             scope       : this
 *         });
 *     },
 *
 *     onMyHandler : function () {
 *         // the task on which the right click have occured
 *         var task        = this.rec;
 *
 *         ...
 *     },
 *
 *     onMyBeforeShow : function() {
 *         // Allow delete only based on some condition
 *         var isDeleteAllowed = this.rec.get('AllowDelete');
 *
 *         this.down('#deleteTask').setVisible(isDeleteAllowed);
 *     }
 * });
 * ```
 *
 * And to disable some menu items based on a condition override {@link #isMenuOptionEnabled} method:
 *
 * ```javascript
 * Ext.define('MyProject.plugin.TaskContextMenu', {
 *     extend : 'Gnt.plugin.TaskContextMenu',
 *
 *     isMenuOptionEnabled : function(item, task) {
 *         var allowAction = item.itemId !== 'deleteTask' || !task.get('IsSecretTask');
 *
 *         return allowAction;
 *     }
 * });
 * ```
 *
 * Note that when using right click to show the menu you should set the 'ignoreRightMouseSelection' to false on your selection model:
 *
 * ```javascript
 * var gantt = Ext.create('Gnt.panel.Gantt', {
 *     selModel : new Ext.selection.TreeModel({ ignoreRightMouseSelection : false }),
 *     plugins             : [
 *         Ext.create("MyProject.plugin.TaskContextMenu")
 *     ],
 *     ...
 * });
 * ```
 */
Ext.define("Gnt.plugin.TaskContextMenu", {
    extend        : 'Ext.menu.Menu',

    requires      : [
        'Sch.util.Date',
        'Gnt.model.Task'
    ],

    mixins        : [
        'Ext.AbstractPlugin',
        'Gnt.mixin.Localizable'
    ],

    alias         : 'plugin.gantt_taskcontextmenu',
    xtype         : 'gantt_taskcontextmenu',
    // ptype isn't filled automatically, because we do not extend AbstractPlugin
    ptype         : 'gantt_taskcontextmenu',
    lockableScope : 'top',


    plain : true,

    /**
     * @cfg {String/String[]} triggerEvent
     * The Gantt panel event(s) upon which the menu shall be shown. Might be provided as an array of multiple event names.
     * By defaults the menu is shown when right-clicking a row or task bar and when right-clicking an empty area in the grid.
     * You can change this to 'taskcontextmenu' if you want the menu to be shown only when right clicking a task bar.
     */
    triggerEvent : [ 'rowcontextmenu', 'containercontextmenu', 'rowlongpress', 'containerlongpress' ],

    hideEvent : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - newTaskText         : 'New task'
     - deleteTask          : 'Delete task(s)'
     - editLeftLabel       : 'Edit left label'
     - editRightLabel      : 'Edit right label'
     - add                 : 'Add...'
     - deleteDependency    : 'Delete dependency...'
     - addTaskAbove        : 'Task above'
     - addTaskBelow        : 'Task below'
     - addMilestone        : 'Milestone'
     - addSubtask          : 'Sub-task'
     - addSuccessor        : 'Successor'
     - addPredecessor      : 'Predecessor'
     - splitTask           : 'Split task'
     */

    grid : null,

    /**
     * @property {Gnt.model.Task} rec The task model, for which the menu was activated
     */
    rec : null,

    triggerEventXY      : null,
    lastHighlightedItem : null,

    taskEditorInjected : false,

    config : {
        /**
         * @cfg {Number} splitDuration The split duration to be used when "Split task" menu item is called.
         * Set this to zero to enable automatic split duration calculation depending on active zoom level.
         * In this mode the split duration is calculated as the clicked tick duration restricted by
         * {@link #minSplitDuration} and {@link #maxSplitDuration} values.
         */
        splitDuration     : 0,

        /**
         * @cfg {String} splitDurationUnit Split duration unit to be used when "Split task" menu item is called
         * See {@link #splitDuration} for details.
         */
        splitDurationUnit : 'd',

        /**
         * @cfg {Number} maxSplitDuration Maximum allowed split duration (use {@link #maxSplitDurationUnit} to define unit for this value).
         * The value is used when automatic split duration calculation is enabled (see {@link #splitDuration} for details).
         */
        maxSplitDuration     : 1,

        /**
         * @cfg {String} maxSplitDurationUnit Maximum allowed split duration unit.
         * See {@link #maxSplitDuration} for details.
         */
        maxSplitDurationUnit : 'd',

        /**
         * @cfg {Number} minSplitDuration Minimum allowed split duration (use {@link #minSplitDurationUnit} to define unit for this value).
         * The value is used when automatic split duration calculation is enabled (see {@link #splitDuration} for details).
         */
        minSplitDuration     : 1,

        /**
         * @cfg {String} minSplitDurationUnit Minimum allowed split duration unit.
         * See {@link #minSplitDuration} for details.
         */
        minSplitDurationUnit : 'h'
    },


    initComponent : function () {
        var me = this;

        me.defaults = me.defaults || {};

        me.defaults.scope = me;

        me.triggerEvent = [].concat(me.triggerEvent);

        if (me.hideEvent && !Ext.isArray(me.hideEvent)) {
            me.hideEvent = [me.hideEvent];
        }

        me.items = me.createMenuItems();

        me.callParent(arguments);
    },

    init : function (grid) {
        this.ownerCmp = grid;

        this.grid = grid;

        this.bindTriggerEvent();
        this.bindHideEvent();
    },


    getState : function () {
        if (this.rendered) {
            return this.callParent(arguments);
        }
    },

    isNotProject : function (task) {
        return !task || !task.isProject;
    },

    isReadOnly : function (task) {
        return this.getCmp().isReadOnly() || (task && task.isReadOnly());
    },


    /**
     * This method is being called during plugin initialization. Override if you need to customize the items in the menu.
     * The method should return an array of menu items, which will be used as the value of the `items` property.
     *
     * Each menu item is decorated with an itemId property for testability.
     *
     * @return {Array}
     */
    createMenuItems : function () {

        var me = this;

        return [
            {
                handler       : this.deleteTask,
                requiresTask  : true,
                itemId        : 'deleteTask',
                text          : this.L('deleteTask'),
                isValidAction : function (task) {
                    return !me.isReadOnly(task);
                }
            },
            {
                handler       : this.editLeftLabel,
                requiresTask  : true,
                itemId        : 'editLeftLabel',
                text          : this.L('editLeftLabel'),
                isValidAction : function (task) {
                    return me.grid.getSchedulingView().getLeftEditor() && !me.isReadOnly(task);
                }
            },
            {
                handler       : this.editRightLabel,
                requiresTask  : true,
                itemId        : 'editRightLabel',
                text          : this.L('editRightLabel'),
                isValidAction : function (task) {
                    return me.grid.getSchedulingView().getRightEditor() && !me.isReadOnly(task);
                }
            },
            {
                handler       : this.toggleMilestone,
                requiresTask  : true,
                itemId        : 'toggleMilestone',
                text          : this.L('convertToMilestone'),
                isValidAction : function (task) {
                    return this.isNotProject(task) && !me.isReadOnly(task);
                }
            },
            {
                handler       : this.splitTask,
                requiresTask  : true,
                itemId        : 'splitTask',
                isValidAction : function (task, triggerDomEvent) {
                    return task &&
                        !me.isReadOnly(task) &&
                        task.getStartDate() &&
                        task.getEndDate() &&
                        !task.isMilestone() &&
                        task.isLeaf() &&
                        triggerDomEvent &&
                        triggerDomEvent.getTarget('.sch-gantt-task-bar');
                },
                text          : this.L('splitTask')
            },
            {
                text   : this.L('add'),
                itemId : 'addTaskMenu',
                menu   : {
                    plain    : true,
                    defaults : { scope : this },
                    items    : [
                        {
                            handler       : this.addTaskAboveAction,
                            requiresTask  : true,
                            itemId        : 'addTaskAbove',
                            text          : this.L('addTaskAbove'),
                            isValidAction : function (task) {
                                return me.isNotProject(task) && !me.isReadOnly(task.parentNode);
                            }
                        },
                        {
                            handler       : this.addTaskBelowAction,
                            itemId        : 'addTaskBelow',
                            text          : this.L('addTaskBelow'),
                            isValidAction : function (task) {
                                return (task && me.isNotProject(task) && !me.isReadOnly(task.parentNode)) || (!task && !me.isReadOnly());
                            }
                        },
                        {
                            handler       : this.addMilestone,
                            itemId        : 'addMilestone',
                            requiresTask  : true,
                            text          : this.L('addMilestone'),
                            isValidAction : function (task) {
                                return me.isNotProject(task) && !me.isReadOnly(task.parentNode);
                            }
                        },
                        {
                            handler       : this.addSubtask,
                            requiresTask  : true,
                            itemId        : 'addSubtask',
                            text          : this.L('addSubtask'),
                            isValidAction : function (task) {
                                // disable menu item when store is grouped
                                // no point in >1 level of hierarchy
                                return !me.isReadOnly(task) && !task.getTreeStore().isTreeGrouped();
                            }
                        },
                        {
                            handler       : this.addSuccessor,
                            requiresTask  : true,
                            itemId        : 'addSuccessor',
                            text          : this.L('addSuccessor'),
                            isValidAction : function (task) {
                                return me.isNotProject(task) && !me.isReadOnly(task.parentNode);
                            }
                        },
                        {
                            handler       : this.addPredecessor,
                            requiresTask  : true,
                            itemId        : 'addPredecessor',
                            text          : this.L('addPredecessor'),
                            isValidAction : function (task) {
                                return me.isNotProject(task) && !me.isReadOnly(task.parentNode);
                            }
                        }
                    ]
                }
            },
            {
                text         : this.L('deleteDependency'),
                requiresTask : true,
                itemId       : 'deleteDependencyMenu',

                isValidAction : function (task) {
                    return task && !me.isReadOnly(task) && task.getAllDependencies().length > 0;
                },

                menu : {
                    plain : true,

                    listeners : {
                        beforeshow : this.populateDependencyMenu,

                        // highlight dependencies on mouseover of the menu item
                        mouseover : this.onDependencyMouseOver,

                        // unhighlight dependencies on mouseout of the menu item
                        mouseleave : this.onDependencyMouseOut,

                        scope : this
                    }
                }
            }
        ];
    },

    bindGridEvents : function (events, fn, scope) {
        scope = scope || this;

        var grid = this.getCmp();

        if (events) {
            for (var i = events.length - 1; i >= 0; i--) {
                grid.on(events[ i ], fn, scope);
            }
        }
    },

    /**
     * This method is called once for each menuitem when the menu is shown. Return false from the method to disable a menu item. The method receives the
     * menuitem and the record (if applicable) as input parameters.
     *
     * @param  {Ext.menu.Item} menuItem The menu item, the built-in menu options have 'itemId' that you can compare with ('deleteTask', 'editLeftLabel', etc)
     * @param  {Gnt.model.Task} task
     *
     * @return {Boolean}
     */
    isMenuOptionEnabled : null,

    bindTriggerEvent : function () {
        this.bindGridEvents(this.triggerEvent, this.onTriggerEvent);
    },


    bindHideEvent : function () {
        this.bindGridEvents(this.hideEvent, this.onHideEvent);
    },

    onHideEvent : function () {
        this.hide();
    },

    swallowNextClickEvent : function () {
        Ext.getBody().on('click', function (e) {
            e.stopPropagation();
        }, null, { single : true, capture : true });
    },

    populateDependencyMenu : function (menu) {
        var grid         = this.getCmp(),
            taskStore    = grid.getTaskStore(),
            dependencies = this.rec.getAllDependencies(),
            depStore     = grid.dependencyStore;

        menu.removeAll();

        if (!dependencies.length) return false;

        var taskId = this.rec.getId() || this.rec.internalId;

        Ext.Array.each(dependencies, function (dependency) {
            var fromId = dependency.getSourceId(),
                task   = taskStore.getModelById(fromId == taskId ? dependency.getTargetId() : fromId);

            if (task) {
                menu.add({
                    dependency : dependency,
                    text       : Ext.htmlEncode(Ext.util.Format.ellipsis(task.getName(), 30)),
                    scope      : this,
                    handler    : function (menuItem) {
                        depStore.remove(menuItem.dependency);
                    },
                    disabled   : this.isReadOnly(this.rec)
                });
            }
        }, this);
    },


    onDependencyMouseOver : function (menu, item, e) {
        if (item) {
            var schedulingView = this.getCmp().getSchedulingView();

            if (this.lastHighlightedItem) {
                schedulingView.unhighlightDependency(this.lastHighlightedItem.dependency);
            }

            this.lastHighlightedItem = item;

            schedulingView.highlightDependency(item.dependency);
        }
    },


    onDependencyMouseOut : function (menu, e) {
        if (this.lastHighlightedItem) {
            this.getCmp().getSchedulingView().unhighlightDependency(this.lastHighlightedItem.dependency);
        }
    },


    onTriggerEvent : function () {
        var context = this.getTriggerEventContext.apply(this, arguments);

        // Only trigger menu on longpress actions if not using a mouse
        if (!context.e.type.match('longpress') || context.e.pointerType !== 'mouse') {
            this.activateMenu(context.record, context.e);
        }
    },

    getTriggerEventContext : function () {
        var result = {};

        // loop over arguments forward searching for the task
        for (var i = 0, l = arguments.length - 1; i <= l; i++) {
            if (arguments[ i ] instanceof Gnt.model.Task) {
                result.record = arguments[ i ];
                break;
            }
        }

        // loop over arguments backward searching for the event
        for (i = arguments.length - 1; i >= 0; i--) {
            if (arguments[ i ] instanceof Ext.EventObjectImpl) {
                result.e = arguments[ i ];
                break;
            }
        }

        return result;
    },


    activateMenu : function (rec, e) {
        // Do not show menu for the root node of task store
        if (this.getCmp().taskStore.getRootNode() === rec) {
            return;
        }

        // The click event on a grid cell will trigger a focus event and context menu will hide
        if (e.type.match('longpress')) {
            this.swallowNextClickEvent();
        }

        e.stopEvent();

        this.rec            = rec;
        this.triggerEventXY = e.getXY();
        this.configureMenuItems(e);

        this.showAt(e.getXY());

        // Needed in case menu is shown from windows keyboard shortcut. https://app.assembla.com/spaces/bryntum/tickets/9464-cell-context-menu-is-not-focused-when-called-from-keyboard/details#
        if (Ext.platformTags.windows) {
            this.focus();
        }
    },


    addTaskEditorEntry : function () {
        this.insert(0, {
            text          : this.L('taskInformation'),
            itemId        : 'taskEditor',
            requiresTask  : true,
            handler       : function () {
                this.getCmp().getTaskEditor(this.rec).showTask(this.rec);
            },
            isValidAction : function (task) {
                return this.getCmp().getTaskEditor(task);
            },
            scope         : this
        });

        // remember that we added the entry
        this.taskEditorInjected = true;
    },


    setTaskEditorEntryLabel : function (task) {
        var taskEditor = this.down('#taskEditor');

        if (task && taskEditor) {
            taskEditor.setText(task.isProject ? this.L('projectInformation') : this.L('taskInformation'));
        }
    },


    configureMenuItems : function (triggerEvent) {

        var rec = this.rec;
        var me  = this;

        if (this.getCmp().getTaskEditor()) {
            if (!this.taskEditorInjected) this.addTaskEditorEntry();

            // set proper task editor menu entry title
            this.setTaskEditorEntryLabel(rec);
        }

        Ext.Array.each(this.query('menuitem'), function (item) {
            item.setDisabled(!me.isMenuItemEnabled(item, rec, triggerEvent));
        });

        var toggleMilestone = this.down('#toggleMilestone');

        if (rec && toggleMilestone) {
            toggleMilestone.setText(rec.isMilestone() ? this.L('convertToRegular') : this.L('convertToMilestone'));
        }
    },

    isMenuItemEnabled : function (item, task, triggerEvent) {
        // the menu entry has to be disabled:
        // - if it requires a task to be selected
        // - or it's not valid (dependends on its "isValidAction" result)
        var disabled = (item.requiresTask && !task) ||
            (item.isValidAction && !item.isValidAction.call(item.scope || item, task, triggerEvent));

        return !disabled && (!this.isMenuOptionEnabled || this.isMenuOptionEnabled(item, task) !== false);
    },

    copyTask : function (original, extraData) {
        var model = original && original.self || this.getCmp().getTaskStore().getModel();

        var newTask = new model({
            leaf : true
        });

        newTask.setPercentDoneWithoutPropagation(0);
        newTask.setName(this.L('newTaskText', this.texts));
        newTask.set(newTask.startDateField, (original && original.getStartDate()) || null);
        newTask.set(newTask.endDateField, (original && original.getEndDate()) || null);
        newTask.set(newTask.durationField, (original && original.getDuration()) || null);
        newTask.set(newTask.durationUnitField, (original && original.getDurationUnit()) || Sch.util.Date.DAY);
        extraData && newTask.set(extraData);

        return newTask;
    },


    // Actions follow below
    // ---------------------------------------------

    /**
     * Handler for the "add task above" menu item
     */
    addTaskAbove : function (newTask) {
        var task = this.rec;

        if (task) {
            task.addTaskAbove(newTask);
        } else {
            this.getCmp().taskStore.getRootNode().appendChild(newTask);
        }
    },

    /**
     * Handler for the "add task below" menu item
     */
    addTaskBelow : function (newTask) {
        var task = this.rec;

        if (task) {
            task.addTaskBelow(newTask);
        } else {
            this.getCmp().taskStore.getRootNode().appendChild(newTask);
        }
    },

    /**
     * Handler for the "delete task" menu item
     */
    deleteTask : function () {
        var toDelete = this.getCmp().getSelectedRows().slice();

        if (this.rec && !Ext.Array.contains(toDelete, this.rec)) {
            toDelete.push(this.rec);
        }

        this.getCmp().getTaskStore().removeTasks(toDelete);
    },

    /**
     * Handler for the "edit left label" menu item
     */
    editLeftLabel : function () {
        this.getCmp().getSchedulingView().editLeftLabel(this.rec);
    },

    /**
     * Handler for the "edit right label" menu item
     */
    editRightLabel : function () {
        this.getCmp().getSchedulingView().editRightLabel(this.rec);
    },


    /**
     * Handler for the "add task above" menu item
     */
    addTaskAboveAction : function () {
        this.addTaskAbove(this.copyTask(this.rec));
    },


    /**
     * Handler for the "add task below" menu item
     */
    addTaskBelowAction : function () {
        this.addTaskBelow(this.copyTask(this.rec));
    },


    /**
     * Handler for the "add subtask" menu item
     */
    addSubtask : function () {
        var task = this.rec;

        // we create a new task using the selected task as a pattern
        // but only if it's not a project ..since nested projects are not supported
        var copy = this.copyTask(this.isNotProject(task) && task);

        task.addSubtask(copy);
    },

    /**
     * Handler for the "add successor" menu item
     */
    addSuccessor : function () {
        var task = this.rec;
        task.addSuccessor(this.copyTask(task));
    },

    /**
     * Handler for the "add predecessor" menu item
     */
    addPredecessor : function () {
        var task = this.rec;
        task.addPredecessor(this.copyTask(task));
    },


    /**
     * Handler for the "add milestone" menu item
     */
    addMilestone : function () {
        var task      = this.rec,
            extraData = {},
            newTask;

        // copy task fields but set start date equals end date, and duration to zero
        extraData[task.startDateField] = task.getEndDate();
        extraData[task.durationField]  = 0;

        newTask = this.copyTask(task, extraData);

        task.addTaskBelow(newTask);
    },

    /**
     * Handler for the "Convert to milestone" menu item
     */
    toggleMilestone : function () {
        if (this.rec.isMilestone()) {
            this.rec.convertToRegular();
        } else {
            this.rec.convertToMilestone();
        }
    },

    /**
     * @protected
     * Returns a date for the task splitting.
     * Returns start date of the tick being clicked if the tick duration is less than {@link #maxSplitDuration} or {@link #maxSplitDuration} is zero.
     * When the tick duration is greater than {@link #maxSplitDuration} returns `context.date` rounded based on active time axis resolution unit.
     *
     * Override this method if you want to implement another way of the split date calculating.
     * See also: {@link #getSplitDuration}, {@link #getSplitDurationUnit}.
     * @param  {Object}                 context             Split call context
     * @param  {Gnt.model.Task}         context.task        Task being split
     * @param  {Array}                  context.pos         Click position. Array containing [x, y] coordinates of mouse click.
     * @param  {Date}                   context.date        Date corresponding to the click position.
     * @param  {Sch.model.TimeAxisTick} context.tick        Time axis tick corresponding to the click position.
     * @param  {Sch.data.TimeAxis}      context.timeAxis    Time axis instance.
     * @return {Date}      Returns a date to be used to split.
     */
    getSplitDate : function (context) {
        var task        = context.task,
            date        = context.date,
            tick        = context.tick,
            timeAxis    = context.timeAxis,
            maxDuration = this.getMaxSplitDuration(),
            result;

        if (tick) {
            result = tick.getStartDate();
            // we use tick duration if it's less than maximal allowed split size
            if (maxDuration) {
                maxDuration = task.getUnitConverter().convertDurationToMs(maxDuration, this.getMaxSplitDurationUnit());

                if (maxDuration < tick.getEndDate() - tick.getStartDate()) result = null;
            }
        }

        // otherwise round clicked datetime relative to task start using active time axis resolution unit
        return result || timeAxis.roundDate(date, task.getStartDate());
    },

    /**
     * @protected
     * Returns a duration for the task splitting.
     * Returns duration of the tick being clicked constrained by {@link #minSplitDuration} and {@link #maxSplitDuration} values.
     * Override this method if you want to implement another way of the split duration calculating.
     * See also: {@link #getSplitDate}, {@link #getSplitDurationUnit}.
     * @param  {Object}                 context             Split call context
     * @param  {Gnt.model.Task}         context.task        Task being split
     * @param  {Array}                  context.pos         Click position. Array containing [x, y] coordinates of mouse click.
     * @param  {Date}                   context.date        Date corresponding to the click position.
     * @param  {Sch.model.TimeAxisTick} context.tick        Time axis tick corresponding to the click position.
     * @param  {Sch.data.TimeAxis}      context.timeAxis    Time axis instance.
     * @return {Number}      Returns split duration.
     */
    getSplitDuration : function (context) {
        if (this.splitDuration) return this.splitDuration;

        var task = context.task,
            pos  = context.pos,
            date = context.date,
            tick = context.tick;

        if (tick) {
            // let's get tick length in MS as initial duration
            var result      = task.calculateDuration(tick.getStartDate(), tick.getEndDate(), Sch.util.Date.MILLI),
                converter   = task.getUnitConverter(),
                minDuration = this.getMinSplitDuration(),
                maxDuration = this.getMaxSplitDuration();

            // if we have to constrain duration
            if (minDuration || maxDuration) {
                if (maxDuration) {
                    result = Math.min(result, converter.convertDurationToMs(maxDuration, this.getMaxSplitDurationUnit()));
                }
                if (minDuration) {
                    result = Math.max(result, converter.convertDurationToMs(minDuration, this.getMinSplitDurationUnit()));
                }
            }

            // turn duration to proper duration unit
            return converter.convertMSDurationToUnit(result, this.getSplitDurationUnit(task, pos, date, tick));
        }
    },

    /**
     * @protected
     * Returns a duration unit for the task splitting.
     * Returns {@link #splitDurationUnit} when {@link #splitDuration} provided or `ms`.
     * Override this method if you want to implement another way of the split duration unit defining.
     * See also: {@link #getSplitDate}, {@link #getSplitDuration}.
     * @param  {Object}                 context             Split call context
     * @param  {Gnt.model.Task}         context.task        Task being split
     * @param  {Array}                  context.pos         Click position. Array containing [x, y] coordinates of mouse click.
     * @param  {Date}                   context.date        Date corresponding to the click position.
     * @param  {Sch.model.TimeAxisTick} context.tick        Time axis tick corresponding to the click position.
     * @param  {Sch.data.TimeAxis}      context.timeAxis    Time axis instance.
     * @return {String}      Returns split duration unit.
     */
    getSplitDurationUnit : function (context) {
        // if we have constant "splitDuration" set then we use "splitDurationUnit"
        // otherwise let's use milliseconds
        return this.splitDuration ? this.splitDurationUnit : Sch.util.Date.MILLI;
    },

    /**
     * Handler for the "Split task" menu item
     */
    splitTask : function () {
        var me         = this,
            view       = me.grid.getSchedulingView(),
            cursorDate = view.getDateFromX(me.triggerEventXY[ 0 ]),
            timeAxis   = view.timeAxis;

        var context = {
            task     : me.rec,
            pos      : me.triggerEventXY,
            date     : cursorDate,
            timeAxis : timeAxis,
            tick     : timeAxis.getAt(Math.floor(timeAxis.getTickFromDate(cursorDate)))
        };

        context.task.split(me.getSplitDate(context), me.getSplitDuration(context), me.getSplitDurationUnit(context));
    }
});
