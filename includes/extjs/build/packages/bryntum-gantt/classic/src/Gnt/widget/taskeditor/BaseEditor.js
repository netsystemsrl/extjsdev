/**
 @class Gnt.widget.taskeditor.BaseEditor
 @extends Ext.tab.Panel

 This is the baseclass for editors, it keeps the references to the stores and the loaded task instances.

 */
Ext.define('Gnt.widget.taskeditor.BaseEditor', {

    extend                  : 'Ext.tab.Panel',

    requires                : ['Gnt.util.Data'],
    uses                    : ['Gnt.data.undoredo.Manager'],

    mixins                  : {
        localizable         : 'Gnt.mixin.Localizable',
        taskFieldsContainer : 'Gnt.widget.taskeditor.mixin.TaskFieldsContainer'
    },

    margin                  : '5 0 0 0',

    height                  : (Ext.theme && Ext.theme.name.match('Graphite|Material') ? 550 : 340),
    width                   : (Ext.theme && Ext.theme.name.match('Graphite|Material') ? 800 : 600),
    layout                  : 'fit',

    border                  : false,

    plain                   : false,

    defaults                : {
        margin          : 5,
        border          : false
    },

    eventIndicator          : 'task',

    /**
     * @cfg {Gnt.model.Task} task The task to edit.
     */
    task                    : null,

    //private a buffer for the task
    taskBuffer              : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore A store with tasks.
     *
     * **Note:** This is a required option if the task being edited doesn't belong to any task store.
     */
    taskStore               : null,

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore A store with assignments.
     *
     * **Note:** It has to be provided to show the `Resources` tab (See also {@link #resourceStore}).
     */
    assignmentStore         : null,

    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore A store with resources.
     *
     * **Note:** It has to be provided to show the `Resources` tab (See also {@link #assignmentStore}).
     */
    resourceStore           : null,

    tabBar                  : {
        cls : 'gnt-taskeditor-header'
    },

    clonedStores            : null,

    taskStoreConfigsToClone : 'disableDateAdjustments,calendarManager,model,weekendsAreWorkdays,cascadeChanges,skipWeekendsDuringDragDrop,moveParentAsGroup,enableDependenciesForParentTasks,availabilitySearchLimit,dependenciesCalendar,scheduleByConstraints,projectStartDate',

    /**
     * @event validate
     * @preventable
     * Fires when task validating occurs.
     * @param {Gnt.widget.taskeditor.BaseEditor} taskEditor The task editor instance.
     * @param {Ext.Component} tabToFocus The tab panel item where one or more invalid fields was detected.
     *
     * Fires during a {@link #method-validate} method call when task validation occurs.
     * Return `false` to make the validation fail, but take care of marking invalid component somehow (to let user know of error)
     * since normally invalid components are being highlighted during validate call.
     * For example:
     *
     *      var taskEditor = Ext.create('Gnt.widget.taskeditor.TaskEditor', {
     *          items       : {
     *              title   : 'Some custom tab',
     *              items   : [{
     *                  xtype       : 'textfield',
     *                  fieldLabel  : 'Enter your name',
     *                  id          : 'enter-your-name',
     *                  allowBlank  : false,
     *                  blankText   : 'Please enter your name'
     *              }]
     *          },
     *          listeners   : {
     *              validate    : function (taskeditor, tabToFocus) {
     *                  var field = taskeditor.down('#enter-your-name');
     *                  // if validation of our field failed
     *                  if (!field.isValid()) {
     *                      // if no other tabs with some invalid control
     *                      if (!tabToFocus) {
     *                          var activeTab = taskeditor.getActiveTab();
     *                          // if our field is not placed at currently active tab
     *                          if (!field.isDescendantOf(activeTab)) {
     *                              // then we'll switch to tab where our field resides
     *                              taskeditor.setActiveTab(taskeditor.getTabByComponent(field));
     *                          }
     *                      }
     *                      // return false since validation failed
     *                      return false;
     *                  }
     *              }
     *          }
     *      });
     *
     */

    /**/
    constructor : function (config) {
        var me  = this;

        config  = config || {};

        Ext.apply(me, config);

        // Prepare empty store clones (data loading occurs in loadTask() method).
        if (!me.clonedStores && (me.task || me.taskStore)) {
            me.cloneStores();
        }

        var items   = me.buildItems(config);

        var its     = me.items;

        // user defined tabs go after our predefined ones
        if (its) {
            items.push.apply(items, Ext.isArray(its) ? its : [its]);

            delete config.items;
        }

        me.items  = items;

        // if we have the only tab let's hide the tabBar
        if (me.items.length <= 1) {
            config.tabBar   = config.tabBar || {};
            Ext.applyIf(config.tabBar, { hidden : true });
        }

        this.callParent([config]);

        // if task is provided let's load it
        if (this.task) {
            this.loadTask(this.task);

        // otherwise update enclosed components readOnly state
        } else {
            me.setReadOnly(true);
        }
    },


    buildItems : function () {
        return [];
    },


    cloneTasks : function (task) {
        task = task || this.task;

        var me         = this,
            taskStore  = me.getTaskStore(),
            newRoot    = me.cloneTask(taskStore.getRoot(), true),
            taskBuffer = newRoot.findChild(task.idProperty, task.getId(), true);

        return {
            task : taskBuffer,
            root : newRoot
        };
    },


    /**
     * Loads task data into task editor.
     * @param {Gnt.model.Task} task Task to load to editor.
     */
    loadTask : function (task) {
        if (!task) return;

        this.task = task;

        // clone stores ..if they were not cloned yet
        this.cloneStores({ task : task });

        // fill cloned stores with data
        this.loadClonedStores(task);
    },


    buildTaskStoreCloneConfig : function (store, config) {
        // TODO: ideally we need to clone calendar manager as well
        // but this is not that trivial since adding records to a calendar manager
        // automatically causes calendars creation

        var cloneConfig = Ext.apply({
            calendar           : store.getCalendar(),
            batchSync          : false,
            recalculateParents : false,
            // Switch auto normalization, since it might corrupt parent nodes auto-calculated fields (Effort etc.)
            // because we don't clone all the children
            autoNormalizeNodes : false
        }, config);

        return Ext.copyIf(cloneConfig, store, this.taskStoreConfigsToClone);
    },


    // We need fake taskStore to give task copy ability to ask it for the project calendar
    cloneTaskStore : function (task, config) {
        var store   = this.getTaskStore(),
            result;

        if (store) {
            result = this.cloneStore(store, this.buildTaskStoreCloneConfig(store, config));

            // on bind different calendar to the original task store we do the same for the copy
            this.mon(store, {
                calendarset : function (store, calendar) {
                    result.setCalendar(calendar);
                }
            });
        }

        return result;
    },


    cloneStore : function (store, config) {
        return new store.self(Ext.apply({
            isCloned : true,
            cloneOf  : store,
            model    : store.model,
            storeId  : null,
            autoSync : false,
            autoLoad : false,
            proxy    : {
                type   : 'memory',
                reader : 'json'
            }
        }, config));
    },


    cloneDependencyStore : function (task, config) {
        var taskStore = this.getTaskStore(),
            store     = this.dependencyStore || taskStore && taskStore.getDependencyStore();

        if (!store) return null;

        return this.cloneStore(store, Ext.apply({
            transitiveDependencyValidation : store.transitiveDependencyValidation,
            strictDependencyValidation     : store.strictDependencyValidation,
            allowedDependencyTypes         : store.allowedDependencyTypes,
            allowParentTaskDependencies    : store.allowParentTaskDependencies,
            autoCalculateLag               : store.autoCalculateLag
        }, config));
    },

    cloneAssignmentStore : function (task, config) {
        var taskStore = this.getTaskStore(),
            store     = this.assignmentStore || taskStore && taskStore.getAssignmentStore();

        if (!store) return null;

        return this.cloneStore(store, config);
    },

    cloneResourceStore : function (task, config) {
        var taskStore = this.getTaskStore(),
            store     = this.resourceStore || taskStore && taskStore.getResourceStore();

        if (!store) return null;

        return this.cloneStore(store, config);
    },

    cloneStores : function (config) {
        config                  = config || {};

        var task                = config.task || this.task,
            resourceStore       = this.getResourceStoreClone() || this.cloneResourceStore(task, config.resourceStore),
            assignmentStore     = this.getAssignmentStoreClone()  || this.cloneAssignmentStore(task, config.assignmentStore),
            dependencyStore     = this.getDependencyStoreClone()  || this.cloneDependencyStore(task, config.dependencyStore);

        var taskStore           = this.getTaskStoreClone() || this.cloneTaskStore(task, Ext.apply({
            assignmentStore     : assignmentStore,
            resourceStore       : resourceStore,
            dependencyStore     : dependencyStore
        }, config.taskStore));

        resourceStore.taskStore = taskStore;

        this.setResourceStoreClone(resourceStore);
        this.setAssignmentStoreClone(assignmentStore);
        this.setDependencyStoreClone(dependencyStore);
        this.setTaskStoreClone(taskStore);
    },

    setTaskStore : function (store) {
        this.taskStore = store;
        this.destroyClonedStores();
    },

    getTaskStore : function (task) {
        task = task || this.task;

        return this.taskStore || task && task.getTaskStore();
    },

    setDependencyStore : function (store) {
        // there is no this.dependencyStore, value is taken from task store always
        this.destroyClonedStores();
    },

    getDependencyStore : function (task) {
        task = task || this.task;

        // there is no this.dependencyStore, value is taken from task store always
        return this.getTaskStore(task).getDependencyStore();
    },

    setResourceStore : function (store) {
        this.resourceStore = store;
        this.destroyClonedStores();
    },

    getResourceStore : function (task) {
        task = task || this.task;

        return this.resourceStore || this.getTaskStore(task).getResourceStore();
    },

    setAssignmentStore : function (store) {
        this.assignmentStore = store;
        this.destroyClonedStores();
    },

    getAssignmentStore : function (task) {
        task = task || this.task;

        return this.assignmentStore || this.getTaskStore(task).getAssignmentStore();
    },


    getTaskStoreClone : function () {
        return this.clonedStores && this.clonedStores.taskStore;
    },

    getDependencyStoreClone : function () {
        return this.clonedStores && this.clonedStores.dependencyStore;
    },

    getAssignmentStoreClone : function () {
        return this.clonedStores && this.clonedStores.assignmentStore;
    },

    getResourceStoreClone : function () {
        return this.clonedStores && this.clonedStores.resourceStore;
    },

    setTaskStoreClone : function (store) {
        this.clonedStores = this.clonedStores || {};
        this.clonedStores.taskStore = store;
    },

    setDependencyStoreClone : function (store) {
        this.clonedStores = this.clonedStores || {};
        this.clonedStores.dependencyStore = store;
    },

    setAssignmentStoreClone : function (store) {
        this.clonedStores = this.clonedStores || {};
        this.clonedStores.assignmentStore = store;
    },

    setResourceStoreClone : function (store) {
        this.clonedStores = this.clonedStores || {};
        this.clonedStores.resourceStore = store;
    },

    loadClonedStores : function (task) {
        var me = this;

        me.loadClonedTaskStore(task);
        me.loadClonedDependencyStore(task);
        me.loadClonedResourceStore(task);
        me.loadClonedAssignmentStore(task);
    },

    loadClonedTaskStore : function (task) {
        var me         = this,
            store      = me.getTaskStoreClone(),
            copy       = me.cloneTasks(task),
            taskBuffer = copy.task;

        me.taskBuffer = taskBuffer;

        // fill task store clone w/ task copies
        store.setRoot(copy.root);

        taskBuffer.taskStore.on({
            update : function (store, record, operation) {
                if (record === taskBuffer && operation == Ext.data.Model.EDIT) {
                    me.onTaskUpdated.call(me, record);
                    record.fireEvent(me.eventIndicator + 'updated', record);
                }
            }
        });
    },

    loadClonedDependencyStore : function (task) {
        var store = this.getDependencyStoreClone();

        store && store.loadData(Gnt.util.Data.cloneModelSet(this.getDependencyStore(), function (copy, original) { copy.setId(original.getId()); }));
    },

    loadClonedResourceStore : function (task) {
        var store = this.getResourceStoreClone();

        store && store.loadData(Gnt.util.Data.cloneModelSet(this.getResourceStore(), function (copy, original) { copy.setId(original.getId()); }));
    },

    loadClonedAssignmentStore : function (task) {
        var store = this.getAssignmentStoreClone();

        store && store.loadData(Gnt.util.Data.cloneModelSet(this.getAssignmentStore(), function (copy, original) { copy.setId(original.getId()); }));
    },


    cloneTask : function (task, deep) {
        var me     = this,
            result = task.copy(task.getId(), false);

        result.taskStore = me.getTaskStoreClone();

        if (deep) {
            var len = task.childNodes.length;

            for (var i = 0; i < len; i++) {
                result.appendChild(me.cloneTask(task.childNodes[i], deep));
            }
        }

        return result;
    },


    /**
     * Returns the task editor tab that contains specified component.
     * @return {Ext.Component} Tab containing specified component or `undefined` if item is not found.
     */
    getTabByComponent : function (component) {
        var result;
        this.items.each(function (el) {
            if (component === el || component.isDescendantOf(el)) {
                result = el;
                return false;
            }
        }, this);

        return result;
    },

    /**
     * Checks data loaded or entered to task editor for errors.
     * Calls isValid methods of taskForm, dependencyGrid, advancedForm (if corresponding objects are presented at the task editor).
     * In case some of calls returns `false` switch active tab so that user can view invalid object.
     * Validation can be customized by handling {@link #event-validate} event.
     *
     * Returns `false` in that case.
     * @return {Boolean} Returns `true` if all components are valid.
     */
    validate : function() {
        var result,
            activeTab = this.getActiveTab(),
            invalidTabs = [],
            tabToActivate;

        result = this.doValidate(function (tab) {
            invalidTabs.push(tab);
        });

        if (!result && activeTab && !Ext.Array.contains(invalidTabs, activeTab)) {
            tabToActivate = invalidTabs[0];
            this.setActiveTab(tabToActivate);
        }
        else if (!result && activeTab) {
            tabToActivate = activeTab;
        }
        else if (!result) {
            tabToActivate = invalidTabs[0];
        }

        // validation result
        return (this.fireEvent('validate', this, tabToActivate) !== false) && result;
    },

    initRoboManager : function () {
        var taskStore = this.getTaskStore();

        // send "pause" command to other bound undo managers
        taskStore.fireEvent('robo-command', taskStore, 'pause', []);

        var robo = this.robo = new Gnt.data.undoredo.Manager({
            stores : [
                taskStore,
                taskStore.getDependencyStore(),
                taskStore.getAssignmentStore(),
                taskStore.getResourceStore()
            ]
        });

        // the undo manager should not listen to own "robo-command" events
        robo.disableIncomingCommands();

        robo.start();

        return this.robo;
    },

    onTaskUpdatePropagationComplete : function (cancelChanges, affectedTasks) {
        var robo = this.robo;
        var taskStore = this.getTaskStore();

        cancelChanges && robo.undo();

        var transaction = robo.currentTransaction;

        transaction && robo.endTransaction();

        if (cancelChanges) {
            robo.undo();
        } else {
            // If we've got a transaction recorded let's inform other registered undo/redo managers about it
            if (transaction && transaction.hasActions()) {
                taskStore.fireEvent('robo-command', taskStore, 'endTransaction', []);
                taskStore.fireEvent('robo-command', taskStore, 'addTransaction', [transaction]);
            }
        }

        // send "resume" command to other bound undo managers
        taskStore.fireEvent('robo-command', taskStore, 'resume', []);

        // destroy the undo/redo manager made for this operation
        robo.destroy();
    },

    propagateTaskUpdateChanger : function (task, continueFn) {
        var me = this;

        me.doUpdateTask(task, continueFn);
        me.fireEvent('afterupdate' + me.eventIndicator, me);

        continueFn(task);
    },

    propagateTaskUpdate : function (callback, scope) {
        var me   = this,
            task = me.task;

        me.initRoboManager();

        task.propagateChanges(
            Ext.bind(me.propagateTaskUpdateChanger, me),
            function onPropagationComplete (cancelChanges, affectedTasks) {
                me.onTaskUpdatePropagationComplete(cancelChanges, affectedTasks);
                callback && callback.call(scope || me, cancelChanges, affectedTasks);
            },
            null,
            true // async
        );
    },

    /**
     * Persists the changes made in the task editor into the loaded {@link Gnt.model.Task task}.
     * @return {Boolean} Returns `false` if some {@link #beforeupdatetask} listener returned `false` and `true` otherwise.
     */
    updateTask : function (callback) {
        var me     = this,
            result = false;

        function finalizeUpdateTask() {
            me.propagateTaskUpdate(callback);
        }

        if (me.fireEvent('beforeupdate' + me.eventIndicator, me, finalizeUpdateTask) !== false) {

            finalizeUpdateTask();

            result = true;
        }

        return result;
    },

    destroyClonedStores : function() {
        if (this.clonedStores) {
            Ext.Object.each(this.clonedStores, function(storeKey, store) {
                store.destroy();
            });
        }

        this.clonedStores = null;
    },

    onDestroy : function() {
        this.destroyClonedStores();

        this.callParent(arguments);
    },

    doValidate : function () {
        return true;
    },

    isDataValid : function () {
        return this.doValidate();
    },

    isDataChanged : function () {
        return false;
    },

    doUpdateTask : function () {
        throw 'Abstract method called';
    },

    /**
     * Updates underlying components readOnly state as reaction on either the editor readOnly state change
     * or the task being editing update.
     * @protected
     */
    updateReadOnly : function () {
        throw 'Abstract method called';
    },

    getReadOnly : function () {
        return !this.task || this.readOnly;
    },

    setReadOnly : function (readOnly) {
        this.readOnly = readOnly;

        this.updateReadOnly();
    },

    onTaskUpdated : function () {
        this.updateReadOnly();
    },

    init : function (cmp) {
        // Make sure Ext can position the editor on top of the z-index stack
        this.ownerCmp = cmp;

        this.callParent(arguments);
    }
});
