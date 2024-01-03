/**

 @class Gnt.data.TaskStore
 @extends Ext.data.TreeStore
 @aside guide gantt_data_integration

 A class representing the tree of tasks in the gantt chart. An individual task is represented as an instance of the {@link Gnt.model.Task} class. The store
 expects the data loaded to be hierarchical. Each parent node should contain its children in a property called 'children' (please note that this is different from the old 1.x
 version where the task store expected a flat data structure)

 Parent tasks
 ------------

 By default, when the start or end date of a task gets changed, its parent task(s) will optionally also be updated. Parent tasks always start at it earliest child and ends
 at the end date of its latest child. So be prepared to see several updates and possibly several requests to server. You can batch them with the {@link Ext.data.proxy.Proxy#batchActions} configuration
 option.

 Overall, this behavior can be controlled with the {@link #recalculateParents} configuration option (defaults to true).

 Cascading
 ---------

 In the similar way, when the start/end date of the task gets changed, gantt *can* update any dependent tasks, so they will start on the earliest date possible.
 This behavior is called "cascading" and is enabled or disabled using the {@link #cascadeChanges} configuration option.

 Backward scheduling
 -------------------

 By default tasks are scheduled as early as possible but this behavior can be changed with {@link #scheduleBackwards} config.
 That flag enables _backward scheduling_. In this mode tasks are scheduled from the project end date and begin as late as possible.

 _Backward scheduling_ is a method allowing to plan the project backwards when you have the deadline date when the project should finish.
 And you schedule your tasks based on that fixed date. All the tasks in this mode by default are placed as late as possible.
 The project start date in this mode is flexible and calculated based on the tasks.
 The method allows to estimate the latest possible date the project could start to not break the deadline.

 Scheduling by constraints
 -------------------------

 When calculating the earliest possible start dates the gantt can take into account task constraints.
 This mode can be enables using {@link #scheduleByConstraints} option.
 In the mode the {@link Gnt.model.Task#getEarlyStartDate earliest start date} of a task is calculated based on the task incoming dependencies and constraints
 (including parents dependencies and constraints).
 And when a task start date gets changed by {@link Gnt.model.setStartDate} or {@link Gnt.model.setStartEndDate} methods
 the task automatically gets fixed by the "Start-No-Earlier-Than" constraint.

 A task that is not restricted by dependencies or constraints starts at the {@link #projectStartDate project start date}.

 Integration notes
 -----------------

 For details on data integration - please see [this guide](#!/guide/gantt_data_integration).

 */
Ext.define('Gnt.data.TaskStore', {
    extend                  : 'Ext.data.TreeStore',

    requires                : [
        'Sch.util.Date',
        'Sch.patches.TreeStore',
        'Sch.patches.TreeStoreInternalIdMap',
        'Gnt.data.Linearizator',
        'Gnt.model.Task',
        'Gnt.model.Project',
        'Gnt.data.Calendar',
        'Gnt.data.DependencyStore',
        'Gnt.data.ResourceStore',
        'Gnt.data.AssignmentStore'
    ],

    mixins                  : [
        'Gnt.patches.NodeInterface',
        'Gnt.patches.TaskStore',
        'Sch.data.mixin.FilterableTreeStore',
        'Sch.data.mixin.UniversalModelGetter',
        'Sch.data.mixin.CacheHintHelper',
        'Sch.data.mixin.EventStore',
        'Gnt.data.undoredo.mixin.TaskStoreHint',
        'Gnt.data.mixin.ProjectableStore',
        'Gnt.data.mixin.Groupable'
    ],

    /**
     * @cfg {String/Gnt.model.Task} model The task model to associate with this task store
     *
     */
    model                   : 'Gnt.model.Task',

    alias                   : 'store.gantt_taskstore',

    storeId                 : 'tasks',

    disableDateAdjustments : true,

    /**
     * @cfg {String} typeProperty
     * The name of the property in a raw task data block which indicates the type of the task to be created from that raw data.
     * This is used for heterogeneous trees containing both task and project models (the value is set on the `typeProperty` of the DataReader).
     * For example, the data may look like this:
     *
     *      [{
     *          // TaskType provided so Gnt.model.Project instance will be created for the node
     *          TaskType    : 'Gnt.model.Project',
     *          Name        : 'Main Project',
     *          StartDate   : '2015-06-01',
     *          Duration    : 100,
     *          children    : [{
     *              // since TaskType is omitted the store model will be used for the node
     *              Name        : 'Task 1',
     *              StartDate   : '2015-06-01',
     *              Duration    : 10
     *              children    : [{
     *                  // since TaskType is omitted the store model will be used for the node
     *                  Name        : 'Sub-task 1'
     *                  StartDate   : '2015-06-01',
     *                  Duration    : 10,
     *                  leaf        : true
     *              }]
     *          }]
     *      }]
     *
     * The values should correspond to a valid {@link Gnt.model.Task Task} model class.
     */
    typeProperty            : 'TaskType',

    /**
     * @cfg {Gnt.data.CalendarManager} calendarManager A calendar manager instance.
     * If specified then the task store will use its {@link Gnt.data.Calendar project calendar}.
     */
    calendarManager         : null,

    /**
     * @cfg {Gnt.data.Calendar} calendar A {@link Gnt.data.Calendar calendar} instance to use for this task store. **Should be loaded prior the task store**.
     * This option can be also specified as the configuration option for the gantt panel. If not provided, a default calendar, containing the weekends
     * only (no holidays) will be created.
     *
     */
    calendar                : null,

    calendarListeners       : null,

    /**
     * @cfg {Gnt.data.DependencyStore} dependencyStore A `Gnt.data.DependencyStore` instance with dependencies information.
     * This option can be also specified as a configuration option for the gantt panel.
     */
    dependencyStore         : null,


    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore A `Gnt.data.ResourceStore` instance with resources information.
     * This option can be also specified as a configuration option for the gantt panel.
     */
    resourceStore           : null,

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore A `Gnt.data.AssignmentStore` instance with assignments information.
     * This option can be also specified as a configuration option for the gantt panel.
     */
    assignmentStore         : null,

    /**
     * @cfg {Boolean} weekendsAreWorkdays This option will be translated to the {@link Gnt.data.Calendar#weekendsAreWorkdays corresponding option} of the calendar.
     *
     */
    weekendsAreWorkdays     : false,

    /**
     * @cfg {Boolean} cascadeChanges A boolean flag indicating whether a change in a task should be propagated to its successors.
     * This option can be also specified as a {@link Gnt.panel.Gantt#cascadeChanges configuration option} of the Gantt panel.
     */
    cascadeChanges          : true,

    /**
     * @cfg {Boolean} batchSync true to batch sync request for 500ms allowing cascade operations, or any other task change with side effects to be batched into one sync call.
     */
    batchSync               : true,

    /**
     * @cfg {Boolean} recalculateParents A boolean flag indicating whether a change in some task should update its parent task.
     * This option can be also specified as the configuration option for the gantt panel.
     */
    recalculateParents      : true,

    /**
     * @cfg {Boolean} skipWeekendsDuringDragDrop A boolean flag indicating whether a task should be moved to the next earliest available time if it falls on non-working time,
     * during move/resize/create operations.
     * This option can be also specified as a configuration option for the Gantt panel.
     */
    skipWeekendsDuringDragDrop  : true,

    /**
     * @cfg {Number} cascadeDelay If you usually have deeply nested dependencies, it might be a good idea to add a small delay
     * to allow the modified record to be refreshed in the UI right away and then handle the cascading
     */
    cascadeDelay                : 0,

    /**
     * @cfg {Boolean} moveParentAsGroup Set to `true` to move parent task together with its children, as a group. Set to `false`
     * to move only parent task itself. Note, that to enable drag and drop for parent tasks, one need to use the
     * {@link Gnt.panel.Gantt#allowParentTaskMove} option.
     */
    moveParentAsGroup           : true,

    /**
     * @cfg {Boolean} enableDependenciesForParentTasks Set to `true` to process the dependencies from/to parent tasks as any other dependency.
     * Set to `false` to ignore such dependencies and not cascade changes by them.
     *
     * Currently, support for dependencies from/to parent task is limited. Only the "start-to-end" and "start-to-start" dependencies
     * are supported. Also, if some task has incoming dependency from usual task and parent task, sometimes the dependency from
     * parent task can be ignored.
     *
     * Note, that when enabling this option requires the {@link Gnt.data.DependencyStore#strictDependencyValidation} to be set to `true` as well.
     * Otherwise it will be possible to create indirect cyclic dependencies, which will cause an infinite recursion exception.
     */
    enableDependenciesForParentTasks : true,

    /**
     * @cfg {Number} availabilitySearchLimit Maximum number of days to search for calendars common availability.
     * Used in various task calculations requiring to respect working time.
     * In these cases the system tries to account working time as intersection of the assigned resource calendars and the task calendar.
     * This config determines the range intersection will be searched in.
     * For example in case of task end date calculation system will try to find calendars intersection between task start date
     * and task start date plus `availabilitySearchLimit` days.
     */
    availabilitySearchLimit     : 1825, //5*365

    /**
     * @cfg {String} [cycleResolutionStrategy='cut'] Strategy to use to resolve cycles in dependent node sets.
     * Possible values are:
     *
     *  - "none"
     *  - "exception"
     *  - "cut"
     *
     * Each value corresponds to a public function from {@link Gnt.data.linearizator.CycleResolvers}.
     */
    cycleResolutionStrategy     : 'cut',

    /**
     * @cfg {Boolean} [autoNormalizeNodes=true]
     * If this flag is `true` when tasks are loaded to the store, missing data like {@link Gnt.model.Task#StartDate StartDate},
     * {@link Gnt.model.Task#EndDate EndDate}, {@link Gnt.model.Task#Duration Duration}, {@link Gnt.model.Task#Effort Effort},
     * will be automatically calculated in scope of this record. For example, if a task has {@link Gnt.model.Task#StartDate StartDate}
     * and {@link Gnt.model.Task#EndDate EndDate} specified, but {@link Gnt.model.Task#Duration Duration} is missing,
     * normalization will calculate the duration value. The calculation doesn't involve other tasks,
     * like parent/children or incoming/outgoing dependencies.
     */
    autoNormalizeNodes : true,

    /**
     * @cfg {Boolean} enableSetDurationOnEffortDrivenTask When true, allows to change duration on effort driven tasks
     * which do not have any assignments.
     */
    enableSetDurationOnEffortDrivenTask : true,

    /**
     * @event filter
     * Will be fired on the call to `filter` method
     * @param {Gnt.data.TaskStore} self This task store
     * @param {Object} args The arguments passed to `filter` method
     */

    /**
     * @event clearfilter
     * Will be fired on the call to `clearFilter` method
     * @param {Gnt.data.TaskStore} self This task store
     * @param {Object} args The arguments passed to `clearFilter` method
     */

    /**
    * @event beforecascade
    * Fires before a cascade operation is initiated
    * @param {Gnt.data.TaskStore} store The task store
    */

    /**
    * @event cascade
    * Fires when after a cascade operation has completed
    * @param {Gnt.data.TaskStore} store The task store
    * @param {Object} context A context object revealing details of the cascade operation, such as 'nbrAffected' - how many tasks were affected.
    */

    /**
     * @cfg {Date} projectStartDate
     * The _project start date_. When {@link #scheduleByConstraints} is enabled all tasks start on this date unless they are constrained with a dependency or a constraint.
     * Please note that children of a {@link Gnt.model.Project project task} get the _project start date_ from the project {@link Gnt.model.Project#StartDate field}.
     *
     * FYI, The value can be provided as part of the server side response when using a {@link Gnt.data.CrudManager}.
     * For details see [this guide](#!/guide/gantt_crud_manager-section-providing-the-project-start-date).
     */
    projectStartDate            : null,

    /**
     * @cfg {Date} projectEndDate
     * The _project finish date_.
     * The value is used in backward scheduled projects (when {@link #scheduleBackwards} is `true`).
     * When {@link #scheduleByConstraints} is enabled all tasks finish on this date unless they are constrained with a dependency or a constraint.
     * Please note that children of a {@link Gnt.model.Project project task} get the _project end date_ from the project {@link Gnt.model.Project#EndDate field}.
     *
     * FYI, The value can be provided as part of the server side response when using a {@link Gnt.data.CrudManager}.
     * For details see [this guide](#!/guide/gantt_crud_manager-section-providing-the-project-start-date).
     */
    projectEndDate              : null,

    /**
     * @cfg {Boolean} limitEarlyLateDatesMutually
     * The config affects task early/late dates calculation when a scheduling conflict takes place.
     * If the config is `true` task early and late dates mutually limit each other values:
     * 
     * - task {@link Gnt.model.Task#getEarlyStartDate early start date} cannot be greater than its {@link Gnt.model.Task#getLateStartDate late start date}
     * - task {@link Gnt.model.Task#getEarlyEndDate early end date} cannot be greater than its {@link Gnt.model.Task#getLateEndDate late end date}
     *
     * Which also implies vise-versa restrictions:
     *
     * - task {@link Gnt.model.Task#getLateStartDate late start date} cannot be less than its {@link Gnt.model.Task#getEarlyStartDate early start date}
     * - task {@link Gnt.model.Task#getLateEndDate late end date} cannot be less than its {@link Gnt.model.Task#getEarlyEndDate early end date}
     *
     * The option is disabled by default to not mask scheduling conflicts.
     */
    limitEarlyLateDatesMutually : false,

    cascading                   : false,
    isFillingRoot               : false,
    isSettingRoot               : false,

    // These cache objects store early/late dates indexed by task internalId-s.
    earlyDatesCache             : null,
    lateDatesCache              : null,

    earlyDatesResetNotificationSuspended : 0,
    earlyDatesResetNotificationRequested : 0,
    lateDatesResetNotificationSuspended  : 0,
    lateDatesResetNotificationRequested  : 0,

    lastTotalTimeSpan           : null,

    suspendAutoRecalculateParents : 0,
    suspendAutoCascade            : 0,

    currentCascadeBatch         : null,
    batchCascadeLevel           : 0,

    // HACK to work around strange Sencha behavior
    // https://app.assembla.com/spaces/bryntum/tickets/5059
    defaultRootText             : '',

    /**
     * @cfg {String} dependenciesCalendar A string, defining the calendar, that will be used when calculating the working time, skipped
     * by the dependencies {@link Gnt.model.Dependency#Lag lag}. Possible values are:
     *
     *  - `project` - the project calendar is used
     *  - `source` - the calendar of dependency's source task is used
     *  - `target` - the calendar of target task
     */
    dependenciesCalendar        : 'target',

    pendingDataUpdates          : null,

    // Counter for the number of store.load() calls. It's used to track nested calls.
    tasksLoadStarted            : 0,

    /**
     * Will be fired on the call to `filter` method
     * @event filter
     * @param {Gnt.data.TaskStore} self This task store
     * @param {Object} args The arguments passed to `filter` method
     */

    /**
     * Will be fired on the call to `clearFilter` method
     * @event clearfilter
     * @param {Gnt.data.TaskStore} self This task store
     * @param {Object} args The arguments passed to `clearFilter` method
     */

    /**
     * @event beforecascade
     * Fires before a cascade operation is initiated
     * @param {Gnt.data.TaskStore} store The task store
     */

    /**
     * @event cascade
     * Fires when after a cascade operation has completed
     * @param {Gnt.data.TaskStore} store The task store
     * @param {Object} context A context object revealing details of the cascade operation, such as 'nbrAffected' - how many tasks were affected.
     */

    /**
     * @cfg {Boolean} checkDependencyConstraint
     * Enables warning a user when he makes a change that breaks an incoming dependency.
     * This check works only when {@link #scheduleByConstraints} mode is enabled.
     * This warning only shows up when the change breaks a _single_ dependency.
     *
     * In case multiple dependencies are broken the gantt will try to resolve automatically:
     *
     *  - if the task was shifted away from its predecessors - the gantt will pin the task with "Start-No-Earlier-Than" constraint
     *  - if the task was shifted back from its predecessors - the task will be shifted forward to satisfy its incoming dependencies
     */
    checkDependencyConstraint : false,

    /**
     * @cfg {Boolean} checkPotentialConflictConstraint
     * Enables a warning of a user about a potential conflict that might be caused
     * by setting one of the following constraints ("Start No Later Than", "Finish No Later Than", "Must Start On", "Must Finish On") on a task that has incoming dependencies.
     *
     * This check works only when {@link #scheduleByConstraints} mode is enabled.
     */
    checkPotentialConflictConstraint : false,

    /**
     * @cfg {Boolean} scheduleByConstraints
     * Enables scheduling of the tasks based on their constraints (including ones inherited from corresponding parent tasks).
     * If a task has no affecting constraints and dependencies it would start at the _project start date_.
     * The _project start date_ value is taken either:
     *
     * - from the task's project node ({@link Gnt.model.Project} instance) if the task has it
     * - or from the {@link #projectStartDate} option
     */
    scheduleByConstraints      : false,

    /**
     * @cfg {String} projectDateFormat
     * Sets the format the _project start date_ is returned in from the server when using a {@link Gnt.data.CrudManager CrudManager}.
     * The format is any string supported by Ext.Date.parse method.
     */
    projectDateFormat          : "c",

    /**
     * @cfg {Boolean} scheduleBackwards
     *
     * Enables _backward scheduling_. In this mode tasks are scheduled from the project end date and begin as late as possible.
     *
     * _Backward scheduling_ is a method allowing to plan the project backwards when you have the deadline date when the project should finish.
     * And you schedule your tasks based on that fixed date. All the tasks in this mode by default are placed as late as possible.
     * The project start date in this mode is flexible and calculated based on the tasks.
     * The method allows to estimate the latest possible date the project could start to not break the deadline.
     *
     * By default the mode is disabled and all tasks begin as soon as possible.
     *
     * **Please note,** that if a task belongs to a {@link Gnt.model.Project project node} then this setting is taken from
     * the project node (see {@link Gnt.model.Project#getScheduleBackwards} method).
     */
    scheduleBackwards          : false,

    constructor : function (config) {
        config      = config || {};

        // calendar manager on the config has the highest prio
        var calendarManager = 'calendarManager' in config ? config.calendarManager : this.getCalendarManager();

        delete config.calendarManager;
        this.setCalendarManager(calendarManager);

        var calendar = config.calendar || this.calendar;

        if (!calendar) {

            var calendarConfig  = {};

            if (config.hasOwnProperty('weekendsAreWorkdays')) {
                calendarConfig.weekendsAreWorkdays = config.weekendsAreWorkdays;
            } else {
                if (this.self.prototype.hasOwnProperty('weekendsAreWorkdays') && this.self != Gnt.data.TaskStore) {
                    calendarConfig.weekendsAreWorkdays = this.weekendsAreWorkdays;
                }
            }

            // if we have calendarManager
            if (this.getCalendarManager()) {
                calendar = this.getCalendarManager().getProjectCalendar();
            }

            calendar = calendar && Ext.data.StoreManager.lookup(calendar) || new Gnt.data.Calendar(calendarConfig);
        }

        // If not provided, create default stores (which will be overridden by GanttPanel during instantiation

        var dependencyStore = config.dependencyStore || this.dependencyStore;
        dependencyStore = dependencyStore && Ext.data.StoreManager.lookup(dependencyStore) || Ext.create("Gnt.data.DependencyStore");
        delete config.dependencyStore;

        var resourceStore = config.resourceStore || this.resourceStore;
        resourceStore = resourceStore && Ext.data.StoreManager.lookup(resourceStore) || Ext.create("Gnt.data.ResourceStore");
        delete config.resourceStore;

        var assignmentStore = config.assignmentStore || this.assignmentStore;
        assignmentStore = assignmentStore && Ext.data.StoreManager.lookup(assignmentStore) || Ext.create("Gnt.data.AssignmentStore", {resourceStore : resourceStore});
        delete config.assignmentStore;

        if (calendar) {
            // remove config to not overwrite this.calendar after setCalendar() call
            delete config.calendar;

            this.setCalendar(calendar, true, true);
        }

        // init cache for early/late dates
        this.resetEarlyDates(true);
        this.resetLateDates(true);

        this.pendingDataUpdates = {
            recalculateParents : {}
        };

        // Nodes should not be loaded before related stores are set, thus we postpone root loading
        // to the time when class is constructed and related stores are set
        // {{{ Initial root loading and superclass construction
        var configuredRoot = config.root || this.root;
        this.root = null;
        delete config.root;

        this.callParent([ config ]);

        this.setResourceStore(resourceStore);
        this.setAssignmentStore(assignmentStore);
        this.setDependencyStore(dependencyStore);

        configuredRoot && this.setRoot(configuredRoot);
        // }}}

        this.setupListeners();

        var root = this.getRoot();

        if (root && this.autoNormalizeNodes) {
            root.normalizeParent();
        }

        if (this.autoSync && this.batchSync) {
            // Prevent operations with side effects to create lots of individual server requests
            this.sync = Ext.Function.createBuffered(this.sync, 500);
        }

        this.initTreeFiltering();
    },


    getCrudManager : function () {
        return this.crudManager;
    },


    // This hook used by the CrudManager when we register a store in it
    setCrudManager : function (crudManager) {
        this.crudManager = crudManager;
    },

    getCalendarManager : function () {
        return this.calendarManager;
    },

    setCalendarManager : function (calendarManager) {
        calendarManager = calendarManager && Ext.data.StoreManager.lookup(calendarManager);

        // If calendar manager is not changed - do nothing
        if (calendarManager === this.calendarManager) return;

        if (this.calendarManagerListeners) {
            this.calendarManagerListeners.destroy();
        }

        this.calendarManager = calendarManager;

        if (calendarManager) {
            this.projectCalendarSet = Boolean(calendarManager.getProjectCalendar());

            // wait till calendar manager set a project calendar and then use it
            this.calendarManagerListeners   = calendarManager.on({
                projectcalendarset  : function (manager, calendar) {
                    // we don't recalculate tasks after the first project calendar set
                    // further calendarManager.setProjectCalendar() calls will cause tasks adjustment
                    if (!this.settingCalendar) {
                        this.setCalendar(calendar, !this.projectCalendarSet);
                        this.projectCalendarSet = true;
                    }
                },

                scope       : this,
                destroyable : true
            });
        }

        return calendarManager;
    },


    onProjectionCommit : function (me, lastChanges, committedChanges) {
        // loop over committed tasks and commit segments changes as well
        for (var internalId in committedChanges) {
            if (committedChanges.hasOwnProperty(internalId)) {
                var task = this.getModelByInternalId(internalId);
                task && task.commitSegmentsProjection();
            }
        }
    },


    onProjectionReject : function (me, lastChanges, rejectedChanges) {
        // loop over committed tasks and revert segments changes as well
        for (var internalId in rejectedChanges) {
            if (rejectedChanges.hasOwnProperty(internalId)) {
                var task = this.getModelByInternalId(internalId);
                task && task.rejectSegmentsProjection();
            }
        }
    },

    setupListeners  : function () {
        this.listenersAreInitialized = true;

        this.on({
            nodeappend       : this.onMyNodeAdded,
            nodeinsert       : this.onMyNodeAdded,
            update           : this.onTaskUpdated,

            // track projection commit/reject
            projectioncommit : this.onProjectionCommit,
            projectionreject : this.onProjectionReject,

            // Prevent a sort from triggering 'index' field to be persisted. It should only be persisted when reordering manually
            beforesort : function () {
                var indexField = this.getModel().getField('index');

                indexField.oldPersist = indexField.persist;
                indexField.persist = false;
            },

            sort : function () {
                var indexFld = this.getModel().getField('index');

                indexFld.persist = indexFld.oldPersist;
            },
            scope            : this
        });


        this.on({
            noderemove      : this.onTaskRemoved,
            nodemove        : this.onTaskMoved,
            sort            : this.onTasksSorted,
            load            : this.onTasksLoaded,
            scope           : this,
            // This should guarantee that our listeners are run first since view should
            // only refresh after we've updated cached dependencies for each task (on store load, root change etc)
            priority        : 100
        });
    },

    // Overridden from EventStore mixin to turn off EventStore mixin's logic related to resource->events caching
    // which comes into play in absence of assignment store
    createResourceEventsCache : Ext.emptyFn,

    // Overridden from EventStore mixin to provide id consistency manager with task store instead of event store
    createIdConsistencyManager : function () {
        var me = this;
        return new Sch.data.util.IdConsistencyManager({
            eventStore      : me,
            resourceStore   : me.getResourceStore(),
            assignmentStore : me.getAssignmentStore(),
            dependencyStore : me.getDependencyStore()
        });
    },

    // Overridden from EventStore mixin to provide id consistency manager with task store instead of event store
    createModelPersistencyManager : function () {
        var me = this;
        return new Sch.data.util.ModelPersistencyManager({
            eventStore      : me,
            resourceStore   : me.getResourceStore(),
            assignmentStore : me.getAssignmentStore(),
            dependencyStore : me.getDependencyStore()
        });
    },

    fillNode: function (node, newNodes) {

        // this flag will prevent the "autoTimeSpan" feature from reacting on individual "append" events, which happens a lot
        // before the "rootchange" event

        if (node.isRoot()) {
            this.isSettingRoot = true;
        }

        this.callParent(arguments);

        if (node.isRoot()) {
            this.isSettingRoot = false;
        }
    },

    onTasksLoaded : function () {
        var root = this.getRoot();

        if (root && this.autoNormalizeNodes) {
            root.normalizeParent();
        }

        // restore back CRUD listeners to support cascading and parent recalculations
        this.onTasksLoadEnd();
    },


    onTasksLoadStart : function () {
        // store.load() might be called recursively in a tree store
        // so we keep number of invokes to restore listeners back only when the last call is done
        this.tasksLoadStarted++;

        // we don't want to recalculate parent nodes an load stage
        this.suspendAutoRecalculateParents++;

        // Overridden to avoid reacting to the removing of all the records in the store
        this.un("noderemove", this.onTaskRemoved, this);

        // 5.0.1 Seems Ext is using regular "appendChild" method during store load, which triggers all the corresponding events
        // we don't want to react on those events during loading (recalculate parents, etc)
        this.un("nodeappend", this.onMyNodeAdded, this);
        this.un("update", this.onTaskUpdated, this);
    },


    onTasksLoadEnd : function () {
        // reset total timespan cache to force its recalculating
        this.resetTotalTimeSpanCache();

        // <debug>
        (this.tasksLoadStarted > 0) || Ext.Error.raise("Invalid tasksLoadStarted flag state, should be greater than zero at this point");
        // </debug>

        this.tasksLoadStarted--;

        // if no more nested load() calls
        // let's restore CRUD listeners
        if (!this.tasksLoadStarted) {
            this.on("noderemove", this.onTaskRemoved, this);
            this.on("nodeappend", this.onMyNodeAdded, this);
            this.on("update", this.onTaskUpdated, this);
        }

        // enable parent nodes recalculating back
        this.suspendAutoRecalculateParents--;
    },


    load : function (options) {
        // suspend CRUD listeners to skip cascading and parent recalculations (we restore it back by calling onTasksLoadEnd() in a "load" event listener)
        this.on('beforeload', this.onTasksLoadStart, this, {
            // we want it to run as late as possible to make sure some other listener hadn't returned false before it
            priority : -999,
            single   : true
        });

        // Note, that gantt uses additional important override for `load` method for ExtJS 4.2.1 and below, inherited from
        // Sch.data.mixin.FilterableTreeStore
        this.callParent(arguments);
    },


    // After the task store proxy is set we map provided "typeProperty"
    // to the reader being used
    setProxy : function () {
        this.callParent(arguments);

        if (this.typeProperty) {

            var me      = this,
                reader  = me.getProxy() && me.getProxy().getReader();

            // if user has not provided "typeProperty" directly to the reader
            if (reader && !reader.getTypeProperty()) {
                reader.setTypeProperty(me.typeProperty);
            }

        }
    },

    setRoot : function (rootNode) {
        var me                  = this;
        // Ext5 NOTE: we check this.count() since it might break loading of data from "root" config if we call getRoot() too early
        var oldRoot             = this.count() && this.getRoot();

        // this flag will prevent the "autoTimeSpan" feature from reacting on individual "append" events, which happens a lot
        // before the "rootchange" event
        this.isSettingRoot      = true;

        Ext.apply(rootNode, {
            calendar            : me.calendar,
            taskStore           : me,                 // TODO: this is probably not needed anymore
            dependencyStore     : me.dependencyStore, // TODO: this is probably not needed anymore

            // HACK Prevent tree store from trying to 'create' the root node
            phantom             : false,
            dirty               : false
        });

        // if "setupListeners" was already called ..means we react on the store add/remove/update
        // let's call "onTasksLoadStart" detaching the listeners
        if (me.listenersAreInitialized) {
            me.onTasksLoadStart();
        }

        var res                 = this.callParent(arguments);

        this.isSettingRoot      = false;

        if (me.listenersAreInitialized) {
            me.onTasksLoaded();
        }

        // we reset taskStore property on the tasks of the old root when we set the new root
        oldRoot && oldRoot.cascadeBy(function (node) {
            node.setTaskStore(null);
        });

        return res;
    },

    getDependencyStore : function () {
        return this.dependencyStore;
    },

    /**
     * Sets the dependency store for this task store
     *
     * @param {Gnt.data.DependencyStore} dependencyStore
     */
    setDependencyStore : function (dependencyStore) {
        var me              = this,
            oldStore        = me.dependencyStore,
            listeners       = {
                clear   : me.onDependenciesClear,
                load    : me.onDependenciesLoad,
                add     : me.onDependencyAdd,
                update  : me.onDependencyUpdate,
                remove  : me.onDependencyDelete,
                scope   : me
            };

        if (oldStore && oldStore.isStore) {
            oldStore.un(listeners);
            oldStore.setTaskStore(null);
            me.idConsistencyManager && me.idConsistencyManager.setDependencyStore(null);
            me.modelPersistencyManager && me.modelPersistencyManager.setDependencyStore(null);
        }

        me.dependencyStore = dependencyStore && Ext.StoreMgr.lookup(dependencyStore) || null;

        if (me.dependencyStore) {
            me.modelPersistencyManager && me.modelPersistencyManager.setDependencyStore(me.dependencyStore);
            me.idConsistencyManager && me.idConsistencyManager.setDependencyStore(me.dependencyStore);
            me.dependencyStore.setTaskStore(me);
            me.dependencyStore.on(listeners);
        }

        if ((oldStore || dependencyStore) && oldStore !== dependencyStore) {
            /**
             * @event dependencystorechange
             * Fires when new dependency store is set via {@link #setDependencyStore} method.
             * @param {Gnt.data.TaskStore}           this
             * @param {Gnt.data.DependencyStore|null} newAssignmentStore
             * @param {Gnt.data.DependencyStore|null} oldAssignmentStore
             */
            // Method might be called before class is fully constructed thus we check for observable mixin to be ready
            me.events && me.fireEvent('dependencystorechange', me, dependencyStore, oldStore);
        }
    },

    /**
     * Returns a resource store instance this task store is associated with. See also {@link #setResourceStore}.
     *
     * @return {Gnt.data.ResourceStore}
     */
    getResourceStore : function () {
        return this.resourceStore || null;
    },

    /**
     * Sets the resource store for this task store
     *
     * @param {Gnt.data.ResourceStore} resourceStore
     */
    setResourceStore : function (resourceStore) {
        var me       = this,
            oldStore = me.resourceStore;

        if (oldStore && oldStore.isStore) {
            me.idConsistencyManager && me.idConsistencyManager.setResourceStore(null);
            me.modelPersistencyManager && me.modelPersistencyManager.setResourceStore(null);
        }

        me.resourceStore = resourceStore && Ext.StoreMgr.lookup(resourceStore) || null;

        if (me.resourceStore) {
            me.modelPersistencyManager && me.modelPersistencyManager.setResourceStore(me.resourceStore);
            me.idConsistencyManager && me.idConsistencyManager.setResourceStore(me.resourceStore);
            me.resourceStore.setTaskStore(me);
            me.resourceStore.normalizeResources();
        }

        if ((oldStore || resourceStore) && (oldStore !== resourceStore)) {
           /**
             * @event resourcestorechange
             * Fires when new resource store is set via {@link #setResourceStore} method.
             * @param {Gnt.data.TaskStore}          this
             * @param {Gnt.data.ResourceStore|null} newResourceStore
             * @param {Gnt.data.ResourceStore|null} oldResourceStore
             */
            // Method might be called before class is fully constructed thus we check for observable mixin to be ready
            me.events && me.fireEvent('resourcestorechange', me, resourceStore, oldStore);
        }
    },


    /**
     * Returns an assignment store this task store is associated with. See also {@link #setAssignmentStore}.
     *
     * @return {Gnt.data.AssignmentStore}
     */
    getAssignmentStore : function () {
        return this.assignmentStore || null;
    },


    /**
     * Sets the assignment store for this task store
     *
     * @param {Gnt.data.AssignmentStore} assignmentStore
     */
    setAssignmentStore : function (assignmentStore) {
        var me          = this,
            oldStore    = me.assignmentStore,
            listeners   = {
                add     : me.onAssignmentStructureMutation,
                update  : me.onAssignmentUpdate,
                remove  : me.onAssignmentStructureMutation,
                scope   : me
            };

        if (oldStore && oldStore.isStore) {
            oldStore.un(listeners);
            oldStore.setTaskStore(null);
            me.idConsistencyManager && me.idConsistencyManager.setAssignmentStore(null);
            me.modelPersistencyManager && me.modelPersistencyManager.setAssignmentStore(null);
        }

        me.assignmentStore = assignmentStore && Ext.StoreMgr.lookup(assignmentStore) || null;

        if (me.assignmentStore) {
            me.modelPersistencyManager && me.modelPersistencyManager.setAssignmentStore(me.assignmentStore);
            me.idConsistencyManager && me.idConsistencyManager.setAssignmentStore(me.assignmentStore);
            assignmentStore.setTaskStore(me);
            assignmentStore.on(listeners);
        }

        if ((oldStore || assignmentStore) && oldStore !== assignmentStore) {
            /**
             * @event assignmentstorechange
             * Fires when new assignment store is set via {@link #setAssignmentStore} method.
             * @param {Gnt.data.TaskStore}            this
             * @param {Gnt.data.AssignmentStore|null} newAssignmentStore
             * @param {Gnt.data.AssignmentStore|null} oldAssignmentStore
             */
            // Method might be called before class is fully constructed thus we check for observable mixin to be ready
            me.events && me.fireEvent('assignmentstorechange', me, assignmentStore, oldStore);
        }
    },


    /**
     * @propagating
     * Call this method if you want to adjust tasks according to the calendar dates.
     * @param  {Gnt.model.Task/Gnt.model.Task[]} [tasks] Task or list of tasks to be adjusted. If omitted all tasks will be adjusted.
     * @param  {Function} callback Function to call on propagation changes completion or failure.
     */
    adjustToCalendar : function (tasks, callback) {
        var me = this;

        // reset early/late dates cache
        me.resetEarlyDates();
        me.resetLateDates();

        if (tasks instanceof Gnt.model.Task) {
            tasks.adjustToCalendar(callback);

        } else {

            if (Ext.isFunction(tasks)) {
                callback    = tasks;
                tasks       = [];
            }

            var root              = me.getRoot(),
                doneNodes         = {},
                globalPropagation = false;

            // if no tasks provided
            if (!Ext.isArray(tasks) || !tasks.length) {
                // get 1st level tasks
                tasks             = root && root.childNodes || [];
                globalPropagation = true;
            }

            // we will initiate propagation starting from the root
            // yet real propagation sources are returned in the "propagationSources" array
            root && root.propagateChanges(function () {
                var propagationSources = [];

                for (var i = 0, l = tasks.length; i < l; i++) {
                    var node    = tasks[i];

                    // each node's child we adjust to calendar
                    node.cascadeBy(function (n) {
                        if (n !== root) n.adjustToCalendarWithoutPropagation();
                    });

                    // if we renormalize globally we say that we started propagation from tasks w/o incoming
                    // dependencies (since if we include them into "propagationSources" they will be treated as already processed
                    // and won't be aligned by incoming dependencies
                    if (!globalPropagation || !node.hasIncomingDependencies()) {
                        propagationSources.push(node);
                    }
                }

                return propagationSources.length && propagationSources || false;

            }, function (cancel, affected) {
                // remember tasks already processed as result of changes propagation
                if (!cancel) Ext.apply(doneNodes, affected);

                callback && callback.apply(this, arguments);
            });
        }
    },

    /**
     * Returns a project calendar instance.
     *
     * @return {Gnt.data.Calendar}
     */
    getCalendar : function () {
        return this.calendar || null;
    },


    /**
     * Sets the calendar for this task store
     *
     * @param {Gnt.data.Calendar} calendar
     */
    setCalendar : function (calendar, doNotChangeTasks, suppressEvent) {
        if (this.settingCalendar) return;

        this.settingCalendar = true;

        var listeners = {
            calendarchange : function () {
                this.adjustToCalendar();
            },
            destroyable    : true,
            scope          : this
        };

        if (this.calendarListeners) {
            this.calendarListeners.destroy();
            this.calendarListeners = null;
        }

        this.calendar           = calendar;

        if (calendar) {
            this.calendarListeners  = calendar.on(listeners);

            var root                = this.getRoot();

            if (root) {
                root.calendar       = calendar;
            }

            if (!doNotChangeTasks) {
                this.adjustToCalendar();
            }

            if (!suppressEvent) {
                this.fireEvent('calendarset', this, calendar);
            }

            // let calendarManager know of project calendar change
            if (this.getCalendarManager()) {
                this.getCalendarManager().setProjectCalendar(calendar);
            }
        }

        this.settingCalendar = false;
    },


    /**
     * Returns the critical path(s) containing tasks with no slack that, if shifted, will push the end date of the project forward.
     * @return {Array} paths An array of arrays (containing task chains)
     */
    getCriticalPaths: function () {
        var me         = this,
            finalTasks = [],
            projects   = me.getProjects(),
            roots      = projects.length === 0 ? [me.getRoot()] : projects;

        Ext.Array.each(roots, function (projectRoot) {
            // project end date
            var end = projectRoot.isProject && projectRoot.getEndDate() || me.getProjectEndDate();

            // find the tasks that ends on that date
            projectRoot.cascadeBy(function (task) {
                if (task.getEndDate() - end === 0 && !task.isRoot()) {
                    finalTasks.push(task);
                }
            });
        });

        return Ext.Array.map(finalTasks, function (task) {
            return task.getCriticalPaths();
        });
    },

    onMyNodeAdded : function (parent, node) {
        var me = this;

        if (!node.isRoot()) {
            if (me.lastTotalTimeSpan) {
                var span = me.getTotalTimeSpan();

                // if new task dates violates cached total range then let's reset getTotalTimeSpan() cache
                if (node.getEndDate() > span.end || node.getStartDate() < span.start) {
                    me.resetTotalTimeSpanCache();
                }
            }

            // if it's a latest task
            if (node.getEndDate() - me.getProjectEndDate() === 0) {
                me.resetLateDates();
            }

            if (!me.isUndoingOrRedoing()) {
                var dependencyStore       = this.getDependencyStore(),
                    nodeNeedsRescheduling = true;

                if (me.cascadeChanges && !me.suspendAutoCascade && (me.scheduleByConstraints || node.getParentsIncomingDependencies().length)) {

                    // Scheduling the new added task ..and its linked tasks if any
                    dependencyStore && dependencyStore.reduceTaskDependencies(node, function (result, dependency) {
                        var from = dependency.getSourceTask(),
                            to   = dependency.getTargetTask();

                        if (from && to) {
                            // re-scheduler both tasks
                            from.scheduleWithoutPropagation();
                            to.scheduleWithoutPropagation();
                            // set flag to not re-schedule the node twice
                            nodeNeedsRescheduling = false;
                        }

                    }, null, false);

                    // re-schedule the node if it's needed
                    nodeNeedsRescheduling && node.scheduleWithoutPropagation();
                }

                if (!me.cascading && me.recalculateParents && !me.suspendAutoRecalculateParents) {
                    if (me.updating) {
                        me.pendingDataUpdates.recalculateParents[node.getId()] = node;
                    }
                    else {
                        node.recalculateParents();
                    }
                }
            }
        }
    },


    onTaskUpdated : function (store, task, operation) {
        var prev = task.previous;
        var parentIdProperty = this.parentIdProperty || 'parentId';

        if (this.lastTotalTimeSpan) {
            var span = this.getTotalTimeSpan();

            // if new task dates violates cached total range then let's reset the cache
            if (prev && (prev[ task.endDateField ] - span.end === 0 || prev[ task.startDateField ] - span.start === 0) ||
                (task.getEndDate() > span.end || task.getStartDate() < span.start))
            {
                this.resetTotalTimeSpanCache();
            }
        }

        if (!this.cascading && operation !== Ext.data.Model.COMMIT && prev && !this.isUndoingOrRedoing()) {

            var parentPrev   = task.parentNode && task.parentNode.previous;
            var parentPrevId = parentPrev && parentPrev[task.idProperty];

            var doRecalcParents = task.percentDoneField in prev;

            // Check if we should cascade this update to successors
            // We're only interested in cascading operations that affect the start/end dates
            if (
                task.startDateField in prev ||
                task.endDateField in prev   ||
                // parentId got changed (and not because of a phantom parent got persisted)
                ((parentIdProperty in prev) && (!parentPrevId || parentPrevId != prev[parentIdProperty])) ||
                task.effortField in prev    ||
                // if task has changed _from_ manually scheduled mode
                prev[ task.schedulingModeField ] === 'Manual' || prev[ task.manuallyScheduledField ]
            ) {

                var cascadeSourceTask = task;

                if (this.cascadeChanges && !this.suspendAutoCascade) {
                    // if we switched scheduling mode from manual then we'll call propagateChanges() on task for some of
                    // task predecessors (if any) to update task itself
                    if (prev[ cascadeSourceTask.schedulingModeField ] == 'Manual') {
                        var deps = cascadeSourceTask.getIncomingDependencies(true);

                        if (deps.length) {
                            cascadeSourceTask = deps[ 0 ].getSourceTask();
                        }
                    }

                    this.cascadeTimer = Ext.Function.defer(cascadeSourceTask.propagateChanges, this.cascadeDelay, cascadeSourceTask, [Ext.emptyFn, null, true]);
                } else {
                    // reset early/late dates cache
                    this.resetEarlyDates();
                    this.resetLateDates();
                }

                doRecalcParents = true;

            // if task scheduling turned to manual
            } else if ((task.manuallyScheduledField in prev) && task.isManuallyScheduled()) {
                // reset early/late dates cache
                this.resetEarlyDates();
                this.resetLateDates();
            }

            if (doRecalcParents && this.recalculateParents && !this.suspendAutoRecalculateParents) {
                if (this.updating) {
                    this.pendingDataUpdates.recalculateParents[task.getId()] = task;
                }
                else {
                    task.recalculateParents();
                }
            }
        }
    },

    onEndUpdate : function () {
        var me = this,
            toRecalculateParents = {},
            task;

        if (!this.isUndoingOrRedoing()) {
            Ext.Object.each(me.pendingDataUpdates.recalculateParents, function (id, task) {
                task.parentNode && (toRecalculateParents[task.parentNode.getId()] = task.parentNode);
            });

            // Sorting lower depth first, but then pop()'ing to process deepest depth first
            toRecalculateParents = Ext.Array.sort(Ext.Object.getValues(toRecalculateParents), function (a, b) {
                return (a.data.depth > b.data.depth) ? 1 : ((a.data.depth < b.data.depth) ? -1 : 0);
            });

            while (toRecalculateParents.length > 0) {
                task = toRecalculateParents.pop();
                task.refreshCalculatedParentNodeData();
                task.recalculateParents();
            }
        }

        me.pendingDataUpdates.recalculateParents = {};

        return me.callParent(arguments);
    },

    getEmptyCascadeBatch : function () {
        var me      = this;

        return {
            nbrAffected         : 0,
            affected            : {},

            addAffected         : function (task, doNotAddParents) {
                var internalId      = task.internalId;

                if (this.affected[ internalId ]) {
                    // already added
                    return;
                } else {
                    this.affected[ internalId ]            = task;
                    this.nbrAffected++;
                }

                if (!me.cascading && this.nbrAffected > 1) {
                    me.fireEvent('beforecascade', me);
                    me.cascading = true;
                }

                if (!doNotAddParents) {
                    var byId        = this.affectedParentsbyInternalId;
                    var array       = this.affectedParentsArray;
                    var parent      = task.isLeaf() ? task.parentNode : task;

                    while (parent && !parent.data.root) {
                        if (byId[ parent.internalId ]) break;

                        byId[ parent.internalId ]   = parent;
                        array.push(parent);

                        this.addAffected(parent, true);

                        parent      = parent.parentNode;
                    }
                }
            },

            affectedParentsArray            : [],
            affectedParentsbyInternalId     : {}
        };
    },


    // starts a `batched` cascade (can contain several cascades, combined in one `currentCascadeBatch` context
    // cascade batch may actually contain 0 cascades (if for example deps are invalid)
    startBatchCascade : function () {
        if (!this.batchCascadeLevel) {
            this.currentCascadeBatch = this.getEmptyCascadeBatch();

            this.suspendAutoRecalculateParents++;
            this.suspendAutoCascade++;
        }

        this.batchCascadeLevel++;

        return this.currentCascadeBatch;
    },


    endBatchCascade : function () {

        this.batchCascadeLevel--;

        if (!this.batchCascadeLevel) {
            this.suspendAutoRecalculateParents--;
            this.suspendAutoCascade--;

            var currentCascadeBatch     = this.currentCascadeBatch;
            this.currentCascadeBatch    = null;

            this.resetEarlyDates();
            this.resetLateDates();

            if (this.cascading) {
                this.cascading          = false;
                this.fireEvent('cascade', this, currentCascadeBatch);
            }
        }
    },

    removeTaskDependencies : function (task) {
        var dependencyStore     = this.dependencyStore,
            deps                = task.getAllDependencies(dependencyStore);
        if (deps.length) dependencyStore.remove(deps);
    },


    removeTaskAssignments : function (task) {
        var assignmentStore     = this.getAssignmentStore(),
            assignments         = task.getAssignments();
        if (assignments.length) assignmentStore.remove(assignments);
    },


    // TODO: constraints
    onTaskRemoved : function (store, removedNode, isMove) {
        var dependencyStore = this.getDependencyStore();
        var assignmentStore = this.getAssignmentStore();

        var taskDropped     = !removedNode.isReplace && !isMove;

        // remove dependencies associated with the task
        if (dependencyStore && taskDropped) {
            removedNode.cascadeBy(this.removeTaskDependencies, this);
        }


        // remove task assignments
        if (assignmentStore && taskDropped) {
            // Fire this event so UI can ignore the datachanged events possibly fired below
            assignmentStore.fireEvent('beforetaskassignmentschange', assignmentStore, removedNode.getId(), []);

            removedNode.cascadeBy(this.removeTaskAssignments, this);

            // Fire this event so UI can just react and update the row for the task
            assignmentStore.fireEvent('taskassignmentschanged', assignmentStore, removedNode.getId(), []);
        }

        var span        = this.getTotalTimeSpan();
        var startDate   = removedNode.getStartDate();
        var endDate     = removedNode.getEndDate();

        // if removed task dates were equal to total range then removing can affect total time span
        // so let's reset getTotalTimeSpan() cache
        if (endDate - span.end === 0 || startDate - span.start === 0) {
            this.resetTotalTimeSpanCache();
        }

        // mark task that it's no longer belong to the task store
        if (taskDropped) removedNode.setTaskStore(null);

        //if early/late dates are supported
        this.resetEarlyDates();
        this.resetLateDates();
    },

    onTaskMoved : function (task, oldParent, newParent, index) {
        var span        = this.getTotalTimeSpan();
        var startDate   = task.getStartDate();
        var endDate     = task.getEndDate();

        // if removed task dates were equal to total range then removing can affect total time span
        // so let's reset getTotalTimeSpan() cache
        if (endDate - span.end === 0 || startDate - span.start === 0) {
            this.resetTotalTimeSpanCache();
        }

        //if early/late dates are supported
        this.resetEarlyDates();
        this.resetLateDates();
    },

    // TODO: constraints
    onAssignmentUpdate : function (assignmentStore, assignment, operation) {
        var me              = this,
            prev            = assignment.previous,
            skipRecalc      = true,
            resourceIdField = assignment.resourceIdField,
            taskIdField     = assignment.taskIdField,
            unitsField      = assignment.unitsField,
            resource, resourcePrev,
            task, taskPrev;

        // we need to recalculate (effort etc.) on ResourceId/TaskId/Units fields change
        // (for ResourceId/TaskId we skip the case when they are change because of the
        // corresponding referenced records id change)
        for (var field in prev) {
            switch (field) {
                case resourceIdField:
                    resource     = assignment.getResource();
                    resourcePrev = resource && resource.previous;
                    skipRecalc   = resourcePrev && resourcePrev[resource.idProperty] == prev[field];
                    break;
                case taskIdField:
                    task       = assignment.getTask();
                    taskPrev   = task && task.previous;
                    skipRecalc = taskPrev && taskPrev[task.idProperty] == prev[field];
                    break;
                case unitsField:
                    skipRecalc = false;
                    break;
            }

            if (skipRecalc) break;
        }

        if (!skipRecalc && !me.isUndoingOrRedoing() && operation !== Ext.data.Model.COMMIT) {
            // TaskStore could be filtered etc.
            task = assignment.getTask(me);
            if (task) {
                task.onAssignmentMutation(assignment);
            }
        }
    },


    // TODO: constraints
    onAssignmentStructureMutation : function (assignmentStore, assignments) {
        var me      = this;

        if (!this.isUndoingOrRedoing()) {
            Ext.Array.each([].concat(assignments), function (assignment) {
                var task  = assignment.getTask(me);

                if (task) {
                    task.onAssignmentStructureMutation(assignment);
                }
            });
        }
    },

    /**
     * @protected
     * Returns true to suppress propagation on a particular dependency (or a dependency field) update.
     * By default returns `true` in the following cases:
     *
     * - {@link Gnt.model.Dependency#Id Id} field change;
     * - {@link Gnt.model.Dependency#Highlighted Highlighted} field change;
     * - {@link Gnt.model.Dependency#From From} field change caused by the corresponding task {@link Gnt.model.Task#Id Id} field change;
     * - {@link Gnt.model.Dependency#To To} field change caused by the corresponding task {@link Gnt.model.Task#Id Id} field change;
     * @param {Gnt.model.Dependency} dependency The updated dependency
     * @param {String[]} modifiedFields List of modified fields
     * @return {Boolean}
     */
    skipPropagationOnDependencyUpdate : function (dependency, modifiedFields) {
        var prev       = dependency.previous,
            result     = true,
            fromField  = dependency.fromField,
            toField    = dependency.toField,
            typeField  = dependency.typeField,
            lagField   = dependency.lagField,
            lagUnitField  = dependency.lagUnitField;

        for (var field in prev) {
            switch (field) {
                // "From"/"To" fields change cause propagation except the case
                // when they got changed just because corresponding tasks have changed their Id-s
                // (happens when persisting tasks)
                case fromField:
                    var source     = dependency.getSourceTask();
                    var sourcePrev = source && source.previous;
                    result         = source && sourcePrev && sourcePrev[source.idProperty] == prev[field];
                    break;
                case toField:
                    var target     = dependency.getTargetTask();
                    var targetPrev = target && target.previous;
                    result         = target && targetPrev && targetPrev[target.idProperty] == prev[field];
                    break;
                // ... "Type"/"Lag" fields change causes propagation
                case typeField:
                case lagField:
                case lagUnitField:
                    result = false;
                    break;
            }

            if (!result) break;
        }

        return result;
    },

    // TODO: in this "update" listener we launch propagation which is wrong
    // need to get rid of this code (propagation starting logic should
    // be triggered only in the gantt specific methods).

    // covered by 221_highlight_dependency
    onDependencyUpdate : function (store, dependency, operation, modifiedFields) {
        if (operation !== Ext.data.Model.COMMIT && !this.skipPropagationOnDependencyUpdate(dependency, modifiedFields)) {
            var me = this;

            // changing a dependency might cause total time span change
            me.resetTotalTimeSpanCache();

            // reset early late dates cache
            me.resetEarlyDates();
            me.resetLateDates();

            // If cascade changes is activated, adjust the connected task start/end date
            // but not if we are in the middle of propagation or undo/redo
            if (me.cascadeChanges && !me.suspendAutoCascade && !me.isUndoingOrRedoing()) {

                var extraTasksToReschedule = [];

                if (modifiedFields) {
                    var modified          = dependency.modified,
                        task              = dependency.getSourceTask() || dependency.getTargetTask(),
                        scheduleBackwards = task && task.getProjectScheduleBackwards() || me.scheduleBackwards,
                        relatedTaskId,
                        relatedTask;

                    if (scheduleBackwards) {
                        // if the dependency source was changed
                        if (Ext.Array.contains(modifiedFields, dependency.fromField)) {
                            relatedTaskId = modified && modified[dependency.fromField];
                        }
                    } else {
                        // if the dependency target was changed
                        if (Ext.Array.contains(modifiedFields, dependency.toField)) {
                            relatedTaskId = modified && modified[dependency.toField];
                        }
                    }
                    // ..we get the old linked task and force its re-scheduling
                    relatedTask = relatedTaskId && me.getNodeById(relatedTaskId);
                    relatedTask && extraTasksToReschedule.push(relatedTask);
                }

                me.scheduleLinkedTasks([dependency], {
                    extraTasksToReschedule : extraTasksToReschedule.length && extraTasksToReschedule
                });
            }
        }
    },

    onDependenciesClear : function () {
        this.adjustToCalendar();
    },

    onDependenciesLoad : function () {
        // reset cached early/late dates
        this.resetEarlyDates();
        this.resetLateDates();
    },

    onDependencyAdd: function (store, dependencies) {
        var me = this;

        // changing a dependency might cause total time span change
        me.resetTotalTimeSpanCache();

        // reset early late dates cache
        me.resetEarlyDates();
        me.resetLateDates();

        // If cascade changes is activated, adjust the connected task start/end date
        // but not if we are in the middle of propagation or undo/redo
        if (me.cascadeChanges && !me.suspendAutoCascade && !me.isUndoingOrRedoing()) {
            me.scheduleLinkedTasks(dependencies);
        }
    },

    onDependencyDelete: function (store, dependencies) {
        var me = this;

        // changing a dependency might cause total time span change
        me.resetTotalTimeSpanCache();

        // reset early late dates cache
        me.resetEarlyDates();
        me.resetLateDates();

        // If cascade changes is activated, adjust the connected task start/end date
        // but not if we are in the middle of propagation or undo/redo
        if (me.cascadeChanges && !me.suspendAutoCascade && !me.isUndoingOrRedoing()) {

            var target, extraTasksToReschedule = [];

            // collect targets of the removed dependencies
            for (var i = 0; i < dependencies.length; i++) {
                target = dependencies[i].getTargetTask(me);
                target && extraTasksToReschedule.push(target);
            }

            me.scheduleLinkedTasks(dependencies, {
                extraTasksToReschedule : extraTasksToReschedule.length && extraTasksToReschedule
            });

        }
    },

    scheduleLinkedTasks: function (dependencies, options) {
        options = options || {};

        var me         = this,
            extraTasks = options.extraTasksToReschedule || [];

        // TODO: the following is very fragile code in case any constraint is violated (and we switch to async
        // execution) we should not propagate changes here, all changes should be propagated using corresponding
        // task/dependency model interface (linkTo/unlinkFrom etc).
        // -- Maxim

        // If cascade changes is activated, adjust the connected task start/end date
        // but not if we are in the middle of propagation or undo/redo
        if (me.cascadeChanges && !me.suspendAutoCascade && !me.isUndoingOrRedoing()) {

            var sources      = [],
                toReSchedule = [].concat(extraTasks);

            Ext.Array.each(dependencies, function (dependency) {
                var source = dependency.getSourceTask(me),
                    target = dependency.getTargetTask(me);

                if (source && target) {

                    if (source.getProjectScheduleBackwards()) {
                        sources.push(target);

                        target.isUnscheduled() && toReSchedule.push(target);
                        toReSchedule.push(source);
                    } else {
                        sources.push(source);

                        source.isUnscheduled() && toReSchedule.push(source);
                        toReSchedule.push(target);
                    }

                }
            });

            sources = sources.concat(extraTasks);

            sources.length && me.getRoot().propagateChanges(function () {

                Ext.Array.each(toReSchedule, function (task) {
                    task.markForRescheduling();
                });

                return sources;
            });
        }
    },

    forEachTaskUnordered: function (fn, scope) {
        var root    = this.getRoot();

        if (root) {
            root.cascadeBy(function (rec) {
                if (rec !== root) {
                    return fn.call(scope || this, rec);
                }
            });
        }
    },

    forEachLeafTask : function (fn, scope) {
        var root    = this.getRoot();

        if (root) {
            root.cascadeBy(function (rec) {
                if (rec.isLeaf()) {
                    return fn.call(scope || this, rec);
                }
            });
        }
    },

    getTimeSpanForTasks : function (tasks) {
        var earliest = Sch.util.Date.MAX_VALUE, latest = Sch.util.Date.MIN_VALUE;

        var compareFn = function (r) {
            var startDate = r.getStartDate();
            var endDate = r.getEndDate();

            if (startDate && startDate < earliest) {
                earliest = startDate;
            }

            // Ignore tasks without start date as they aren't rendered anyway
            if (startDate && endDate && endDate > latest) {
                latest = endDate;
            }
        };

        if (tasks) {
            if (!Ext.isArray(tasks)) tasks = [tasks];

            Ext.Array.each(tasks, compareFn);
        } else {
            this.forEachTaskUnordered(compareFn);
        }

        earliest    = earliest < Sch.util.Date.MAX_VALUE ? earliest : null;
        latest      = latest > Sch.util.Date.MIN_VALUE ? latest : null;

        return {
            start   : earliest,
            end     : latest || (earliest && Ext.Date.add(earliest, Ext.Date.DAY, 1)) || null
        };
    },

    resetTotalTimeSpanCache : function () {
        this.lastTotalTimeSpan = null;
    },

    /**
     * Returns an object defining the earliest start date and the latest end date of all the tasks in the store.
     * Tasks without start date are ignored, tasks without end date use their start date (if any) + 1 day
     * @return {Object} An object with 'start' and 'end' Date properties.
     */
    getTotalTimeSpan : function () {
        if (this.lastTotalTimeSpan) return this.lastTotalTimeSpan;

        this.lastTotalTimeSpan = this.getTimeSpanForTasks();

        return this.lastTotalTimeSpan;
    },

    // A hook used by the CrudManager to apply some extra info to the loaded store
    applyMetaData : function (metaData) {
        var projectStartDate  = metaData.projectStartDate,
            projectEndDate    = metaData.projectEndDate;

        if ('scheduleBackwards' in metaData) {
            this.setScheduleBackwards(metaData.scheduleBackwards, true);
        }

        // set project start date to the value provided from the server
        if (projectStartDate) {
            if ('string' == typeof projectStartDate) {
                metaData.projectStartDate = this.parseProjectDate(projectStartDate);
            }

            // we pass 2nd argument `true` since don't want automatic full rescheduling after the data loading
            this.setProjectStartDate(metaData.projectStartDate, true);
        }

        // set project end date to the value provided from the server
        if (projectEndDate) {
            if ('string' == typeof projectEndDate) {
                metaData.projectEndDate = this.parseProjectDate(projectEndDate);
            }

            // we pass 2nd argument `true` since don't want automatic full rescheduling after the data loading
            this.setProjectEndDate(metaData.projectEndDate, true);
        }

        if ('cascadeChanges' in metaData) {
            this.cascadeChanges = metaData.cascadeChanges;
        }

        this.metaData = metaData;
    },

    parseProjectDate : function (value) {
        return Ext.Date.parse(value, this.projectDateFormat);
    },

    /**
     * Sets the _project start date_.
     *
     * See also: {@link #projectStartDate} config.
     *
     * @param {Date} startDate The _project start date_.
     * @param {Boolean} [doNotReSchedule=false] Pass `true` to not reschedule tasks automatically (which happens by default when {@link #scheduleBackwards} is `false`).
     */
    setProjectStartDate : function (startDate, doNotReSchedule) {
        var me           = this,
            oldStartDate = me.projectStartDate;

        // if dates differ
        if (!oldStartDate || oldStartDate - startDate) {
            me.projectStartDate = startDate;

            me.fireEvent('projectstartdateset', me, null, startDate, oldStartDate);

            if (!doNotReSchedule && !me.scheduleBackwards) {
                me.schedule(true);
            }
        }
    },

    /**
     * Sets the _project end date_.
     *
     * See also: {@link #projectEndDate} config.
     *
     * @param {Date} endDate The _project end date_.
     * @param {Boolean} [doNotReSchedule=false] Pass `true` to not reschedule tasks automatically (which happens by default when {@link #scheduleBackwards} is enabled).
     */
    setProjectEndDate : function (endDate, doNotReSchedule) {
        var me          = this,
            oldEndDate  = this.projectEndDate;

        // if dates differ
        if (!oldEndDate || oldEndDate - endDate) {
            this.projectEndDate = endDate;

            this.fireEvent('projectenddateset', this, null, endDate, oldEndDate);

            if (!doNotReSchedule && me.scheduleBackwards) {
                me.schedule(true);
            }
        }
    },

    /**
     * Returns the project start date. If the {@link projectStartDate project start date} is not set
     * the method returns the earliest start of all the tasks in the store.
     *
     * See also: {@link #projectStartDate} config.
     *
     * @return {Date} The project start date.
     */
    getProjectStartDate : function () {
        return this.projectStartDate || this.getTotalTimeSpan().start;
    },

    /**
     * Returns the project end date. This value is calculated as the latest end of all the tasks in the store.
     *
     * See also: {@link #projectEndDate} config.
     *
     * @return {Date} The project end date.
     */
    getProjectEndDate : function () {
        return this.projectEndDate || this.getTotalTimeSpan().end;
    },

    /**
     * Toggles scheduling from the project end date. In this mode all tasks begin as late as possible.
     * By default the mode is disabled and all tasks begin as soon as possible.
     * @param {Boolean} value Pass `true` to enable scheduling from the project end date.
     * @param {Boolean} [doNotReSchedule=false] Pass `true` to not reschedule tasks automatically.
     */
    setScheduleBackwards : function (value, doNotReSchedule) {
        if (this.scheduleBackwards != value) {
            this.scheduleBackwards = value;

            if (this.scheduleBackwards) {
                this.setProjectStartDate(null, true);
            } else {
                this.setProjectEndDate(null, true);
            }

            if (!doNotReSchedule) this.schedule();
        }
    },

    schedule : function (resetCache, callback) {
        var me      = this,
            root    = me.getRoot(),
            // use root children as propagation sources
            sources = [].concat(root.childNodes);

        if (sources.length) {
            if (resetCache) {
                // reset early/late dates cache
                me.resetEarlyDates();
                me.resetLateDates();
            }

            // mark all the tasks as requiring rescheduling
            me.forEachTaskUnordered(function (task) {
                task.markForRescheduling();
            });

            // propagation will perform rescheduling
            root && root.propagateChanges(function () { return sources; }, callback);
        }
    },

    /**
     * Returns all projects kept in the store.
     * @return {Gnt.model.Project[]}
     */
    getProjects : function () {
        var root        = this.getRoot(),
            projects    = [],
            childNodes  = root.childNodes;

        for (var i = 0, l = childNodes.length; i < l; i++) {
            if (childNodes[i].isProject) {
                projects.push(childNodes[i]);
            }
        }

        return projects;
    },

    // Internal helper method
    getTotalTaskCount : function (ignoreRoot) {
        var count = ignoreRoot === false ? 1 : 0;

        this.forEachTaskUnordered(function() { count++; });
        return count;
    },

    /**
     * Returns an array of all the tasks in this store.
     *
     * @return {Gnt.model.Task[]} The tasks currently loaded in the store
     */
    toArray : function () {
        var tasks = [];

        this.getRoot().cascadeBy(function (t) {
            tasks.push(t);
        });

        return tasks;
    },

    beginIndent : function (nodes, context) {
        this.fireEvent('beforeindentationchange', this, nodes, context);
    },

    endIndent : function (nodes, context) {
        this.fireEvent('indentationchange', this, nodes, context);
    },

    cancelIndent : function (context) {
        this.fireEvent('indentationcancel', this, context);
    },

    /**
     * Increase the indendation level of one or more tasks in the tree
     *
     * @param {Gnt.model.Task/Gnt.model.Task[]} tasks The task(s) to indent
     * @param {Function} [callback] Callback function to call after nodes have been indented and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    indent: function (nodes, callback) {
        var me = this,
            canceled = false,
            affected = {},
            context,
            nodesToProcess;

        nodes = Ext.isArray(nodes) ? nodes.slice() : [ nodes ];

        // 1. Filtering out all nodes which parents are also to be indented as well as the ones having no previous sibling
        //    since such nodes can't be indented
        nodes = Ext.Array.filter(nodes, function(node) {
            var result;

            result = !!node.previousSibling;

            while (result && !node.isRoot()) {
                result = !Ext.Array.contains(nodes, node.parentNode);
                node = node.parentNode;
            }

            return result;
        });

        // 2. Sorting nodes by index ascending, that's related on how task.indent() method actually indents
        nodes = Ext.Array.sort(nodes, function(a, b) { return a.get('index') - b.get('index'); });

        // 3. Filter out project nodes
        nodes = Ext.Array.filter(nodes, function (record) { return !(record instanceof Gnt.model.Project); });

        // 4. Accumulating context
        context = Ext.Array.reduce(nodes, function(prev, curr) {
            prev[curr.getId()] = {
                parentNode : curr.parentNode,
                index      : curr.get('index')
            };
            return prev;
        }, {});

        // 5. Indenting taking constraints related behaviour in mind
        me.beginIndent(nodes, context);
        me.suspendEvent('beforeindentationchange', 'indentationchange');

        nodesToProcess = nodes.slice();

        (function processStep() {
            if (nodesToProcess.length) {
                nodesToProcess.shift().indent(function(cancel, affectedNodes) {
                    if (!cancel) {
                        affected = Ext.apply(affected, affectedNodes);
                        processStep();
                    }
                    else {
                        canceled = true;
                        affected = {};
                        me.resumeEvent('beforeindentationchange', 'indentationchange');
                        me.cancelIndent(context);
                    }
                });
            }
            else {
                me.resumeEvent('beforeindentationchange', 'indentationchange');
                me.endIndent(nodes, context);
                callback && callback(canceled, affected);
            }
        })();
    },


    /**
     * Decrease the indendation level of one or more tasks in the tree
     *
     * @param {Gnt.model.Task/Gnt.model.Task[]} tasks The task(s) to outdent
     * @param {Function} [callback] Callback function to call after task has been outdented and changes among dependent tasks was propagated.
     * @param {Boolean} callback.cancelChanges Flag showing that the setting has caused a constraint violation
     *  and a user opted for canceling the change and thus nothing has been updated.
     * @param {Object}   callback.affectedTasks Object containing a map (by id) of tasks affected by changes propagation.
     */
    outdent: function (nodes, callback) {
        var me = this,
            canceled = false,
            affected = {},
            context,
            nodesToProcess;

        nodes = Ext.isArray(nodes) ? nodes.slice() : [ nodes ];

        // 1. Filtering out all nodes which parents are also to be outdented as well as the ones having root parent
        //    since such nodes can't be indented
        nodes = Ext.Array.filter(nodes, function(node) {
            var result;

            result = node.parentNode && !node.parentNode.isRoot();

            while (result && !node.isRoot()) {
                result = !Ext.Array.contains(nodes, node.parentNode);
                node = node.parentNode;
            }

            return result;
        });

        // 2. Sorting nodes by index descending, that's related on how task.outdent() method actually outdents
        nodes = Ext.Array.sort(nodes, function(a, b) { return b.get('index') - a.get('index'); });

        // 3. Accumulating context
        context = Ext.Array.reduce(nodes, function(prev, curr) {
            prev[curr.getId()] = {
                parentNode : curr.parentNode,
                index      : curr.get('index')
            };
            return prev;
        }, {});

        // 4. Outdenting taking constraints related behaviour in mind
        me.beginIndent(nodes, context);
        me.suspendEvent('beforeindentationchange', 'indentationchange');

        nodesToProcess = nodes.slice();

        (function processStep() {
            if (nodesToProcess.length) {
                nodesToProcess.shift().outdent(function(cancel, affectedNodes) {
                    if (!cancel) {
                        affected = Ext.apply(affected, affectedNodes);
                        processStep();
                    }
                    else {
                        canceled = true;
                        affected = {};
                        me.resumeEvent('beforeindentationchange', 'indentationchange');
                        me.cancelIndent(context);
                    }
                });
            }
            else {
                me.resumeEvent('beforeindentationchange', 'indentationchange');
                me.endIndent(nodes, context);
                callback && callback(canceled, affected);
            }
        })();
    },

    /**
     * Returns the tasks associated with a resource
     * @param {Gnt.model.Resource} resource
     * @return {Gnt.model.Task[]} the tasks assigned to this resource
     */
    getTasksForResource: function (resource) {
        return this.getEventsForResource(resource);
    },

    /**
     * Returns the resources associated with a task
     * @param {Gnt.model.Task} task
     * @return {Gnt.model.Resource[]}
     */
    getResourcesForTask : function (task) {
        return this.getResourcesForEvent(task);
    },

    // Event store adaptions (flat store vs tree store)

    forEachScheduledEvent : function (fn, scope) {
        scope  = scope || this;

        this.forEachTaskUnordered(function (event) {
            var eventStart = event.getStartDate(),
                eventEnd = event.getEndDate();

            if (eventStart && eventEnd) {
                return fn.call(scope, event, eventStart, eventEnd);
            }
        });
    },

    onTasksSorted : function () {
        // After sorting we need to reapply filters if store was previously filtered
        if (this.lastTreeFilter) {
            this.filterTreeBy(this.lastTreeFilter);
        }
    },

    /**
     * Appends a new task to the store
     * @param {Gnt.model.Task/Object} record The record to append to the store
     * @return {Gnt.model.Task} The appended record
     */
    append : function (record) {
        return this.getRoot().appendChild(record);
    },

    notifyEarlyDatesReset : function () {
        this.fireEvent('earlydatesreset');
    },

    suspendEarlyDatesResetNotification : function () {
        this.earlyDatesResetNotificationSuspended++;
    },

    resumeEarlyDatesResetNotification : function (silent) {
        this.earlyDatesResetNotificationSuspended && this.earlyDatesResetNotificationSuspended--;

        if (!this.earlyDatesResetNotificationSuspended && this.earlyDatesResetNotificationRequested) {
            if (!silent) this.notifyEarlyDatesReset();
            this.earlyDatesResetNotificationRequested = 0;
        }
    },

    resetEarlyDates : function (silent) {
        this.earlyDatesCache    = {};

        if (!silent) {
            if (!this.earlyDatesResetNotificationSuspended) {
                this.notifyEarlyDatesReset();
            } else {
                this.earlyDatesResetNotificationRequested++;
            }
        }
    },

    notifyLateDatesReset : function () {
        this.fireEvent('latedatesreset');
    },

    suspendLateDatesResetNotification : function () {
        this.lateDatesResetNotificationSuspended++;
    },

    resumeLateDatesResetNotification : function (silent) {
        this.lateDatesResetNotificationSuspended && this.lateDatesResetNotificationSuspended--;

        if (!this.lateDatesResetNotificationSuspended && this.lateDatesResetNotificationRequested) {
            if (!silent) this.notifyLateDatesReset();
            this.lateDatesResetNotificationRequested = 0;
        }
    },

    resetLateDates : function (silent) {
        this.lateDatesCache     = {};

        if (!silent) {
            if (!this.lateDatesResetNotificationSuspended) {
                this.notifyLateDatesReset();
            } else {
                this.lateDatesResetNotificationRequested++;
            }
        }
    },

    setEarlyDateCachedValue : function (key, value) {
        this.earlyDatesCache[ key ] = value;
    },

    hasEarlyDateCachedValue : function (key) {
        return this.earlyDatesCache.hasOwnProperty(key);
    },

    getEarlyDateCachedValue : function (key) {
        return this.earlyDatesCache[ key ];
    },

    setLateDateCachedValue : function (key, value) {
        this.lateDatesCache[ key ] = value;
    },

    hasLateDateCachedValue : function (key) {
        return this.lateDatesCache.hasOwnProperty(key);
    },

    getLateDateCachedValue : function (key) {
        return this.lateDatesCache[ key ];
    },

    afterUndoRedo : function () {
        this.resetEarlyDates();
        this.resetLateDates();

        // call the default Robo.data.Store mixin implementation
        this.mixins['Gnt.data.undoredo.mixin.TaskStoreHint'].afterUndoRedo.call(this);
    },

    /**
     * Returns Task by sequential number. See {@link Gnt.model.Task#getSequenceNumber} for details.
     *
     * @param {Number} number
     *
     * @return {Gnt.model.Task}
     */
    getBySequenceNumber : function (number) {
        return this.getRoot().getBySequenceNumber(number);
    },

    destroy : function () {
        this.setCalendar(null);
        this.setCalendarManager(null);
        this.setAssignmentStore(null);
        this.setDependencyStore(null);
        this.setResourceStore(null);

        if (this.calendarManagerListeners) {
            this.calendarManagerListeners.destroy();
        }

        clearTimeout(this.cascadeTimer);
        clearTimeout(this.syncTimer);

        this.callParent(arguments);
    },


    linearWalkDependentTasks : function (sourceTaskList, processor, walkingSpecification) {
        var me = this,
            // TODO: in the future we need to handle the case when tasks belong to different projects
            scheduleBackwards = (Ext.isArray(sourceTaskList) ? sourceTaskList[0] : sourceTaskList).getProjectScheduleBackwards();

        // <debug>
        !walkingSpecification || Ext.isObject(walkingSpecification) ||
            Ext.Error.raise("Invalid arguments: walking specification must be an object");
        // </debug>

        walkingSpecification = walkingSpecification || {
            self         : true,
            ancestors    : me.recalculateParents,
            descendants  : me.moveParentAsGroup,
            successors   : me.cascadeChanges && !scheduleBackwards,
            predecessors : me.cascadeChanges && scheduleBackwards,
            cycles       : me.cycleResolutionStrategy
        };

        return Gnt.data.Linearizator.linearWalkBySpecification(
            sourceTaskList,
            processor,
            walkingSpecification
        );
    },


    getLinearWalkingSequenceForDependentTasks : function (sourceTaskList, walkingSpecification) {
        var result      = [];

        this.linearWalkDependentTasks(sourceTaskList, function (task, color, sourceSet, depsData) {
            result.push(Array.prototype.slice.call(arguments));
        }, walkingSpecification);

        return result;
    },

    // @override
    // ExtJS doesn't use getters in this method but we need to use them to take model projections into account.
    // We literally copied Ext.data.TreeStore.isVisible and replaced every node.data.* with node.get(*)
    isVisible   : function (node) {
        var parentNode = node.parentNode,
            visible = node.get('visible'),
            root = this.getRoot();
        while (visible && parentNode) {
            visible = parentNode.get('expanded') && parentNode.get('visible');
            parentNode = parentNode.parentNode;
        }

        return visible && !(node === root && !this.getRootVisible());
    },

    /**
     * Removes tasks from the store, ignoring all readOnly tasks.
     * @param {[Gnt.model.Task]/Gnt.model.Task} tasks The task(s) to remove
     * @return {[Gnt.model.Task]} The removed records
     */
    removeTasks : function(tasks) {
        tasks = [].concat(tasks);

        // Don't allow removing readOnly tasks
        tasks = Ext.Array.filter(tasks, function (task) {
            return !task.parentNode || !task.parentNode.isReadOnly();
        });

        // Sorting tasks by depth, such that children were removed before parents, otherwise
        // undo manager might have difficulties restoring the hierarchy. If children are removed
        // after parents then undo manager will catch no notification about the removal, after parents
        // have been removed the undo manager has no control over tree detached hierarchy anymore.
        tasks = Ext.Array.sort(tasks, function(a, b) {
            return b.getDepth() - a.getDepth();
        });

        /*tasks.length > 1 && */this.fireEvent('beforebatchremove', this, tasks);

        Ext.Array.forEach(tasks, function (task) {
            //task.parentNode.removeSubtaskWithoutPropagation(task);
            task.remove();
        });

        /*tasks.length > 1 && */this.fireEvent('batchremove', this, tasks);

        return tasks;
    },

    isBackwardScheduled : function () {
        return this.backwardScheduling;
    },

    /**
     * @protected
     * Returns a list of constraint classes to validate before propagating the changes to the related tasks.
     * By default the list includes:
     *
     * - Gnt.constraint.implicit.PotentialConflict - (when {@link #checkPotentialConflictConstraint} is `true`) showing a warning when user sets a constraint on a task having a predecessor (which might cause a conflict in the future).
     *
     * @param  {Gnt.model.Task} task Task to validate constraints for.
     * @return {Gnt.constraint.Base[]} Array of constraints to validate.
     */
    getPrePropagationConstraints : function (task) {
        var result = [];

        if (this.prePropagationConstraints) {
            result = this.prePropagationConstraints;
        } else {
            result = [];

            this.checkPotentialConflictConstraint && task.getPotentialConflictConstraintClass() && result.push(task.getPotentialConflictConstraintClass());

            this.prePropagationConstraints = result;
        }

        return result;
    },

    /**
     * @private
     * Returns tasks that are meant to be scheduled contrary to the project scheduling direction.
     * If the store is scheduled forwards the method returns tasks having ALAP constraint set,
     * and if the store is scheduled backwards the method returns tasks constrained ASAP.
     * @param  {Gnt.model.Project} [project] Return only tasks belonging to the provided project.
     *  If not provided proceeds all the store tasks and uses {@link #scheduleBackwards} to define the project direction.
     * @return {Gnt.model.Task[]}         Array of tasks.
     */
    getContraryScheduledTasks : function (project) {
        var result = [],
            root   = project || this.getRoot();

        root && root.cascadeBy(function (task) {
            if (task.isContraryScheduled(null, project)) result.push(task);
        });

        return result;
    },

    startInvalidatingProjectBorder : function (scheduleBackwards) {
        if (!arguments.length) scheduleBackwards = this.scheduleBackwards;

        if (scheduleBackwards) {
            this.startDateIsInvalid = true;
        } else {
            this.endDateIsInvalid = true;
        }
    },

    finishInvalidatingProjectBorder : function (scheduleBackwards) {
        if (!arguments.length) scheduleBackwards = this.scheduleBackwards;

        if (scheduleBackwards) {
            this.startDateIsInvalid = false;
        } else {
            this.endDateIsInvalid = false;
        }
    },

    isInvalidatingProjectStartDate : function () {
        return this.startDateIsInvalid;
    },

    isInvalidatingProjectEndDate : function () {
        return this.endDateIsInvalid;
    }

});
