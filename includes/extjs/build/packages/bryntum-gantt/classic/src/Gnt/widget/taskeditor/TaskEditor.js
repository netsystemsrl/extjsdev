/**
 * @class Gnt.widget.taskeditor.TaskEditor
 * @extends Gnt.widget.taskeditor.BaseEditor
 *
 * A widget used to display and edit task information.
 * By default the widget is an Ext.tab.Panel instance which can contain the following tabs:
 *
 * - General information
 * - Predecessors
 * - Resources
 * - Advanced
 * - Notes
 *
 * You can easily add new custom tabs using {@link #items} config.
 *
 * # General
 *
 * {@img gantt/images/taskeditor-panel-general.png}
 *
 * Contains a customizable {@link Gnt.widget.TaskForm form} instance for viewing and editing the following task data:
 *
 * - the name of the task
 * - the start date of the task
 * - the end date of the task
 * - the task duration
 * - the task effort
 * - the current status of a task, expressed as the percentage completed
 * - the baseline start date of the task (editing of this field is optional)
 * - the baseline end date of the task (editing of this field is optional)
 * - the baseline status of a task, expressed as the percentage completed (editing of this field is optional)
 *
 * # Task data loading and persisting
 *
 * In order to load a task into the task editor the one should use {@link #loadTask} method:
 *
 * ```javascript
 * taskEditor.loadTask(task);
 * ```
 *
 * The task editor tries to load all the contained forms with the loaded task data automatically.
 * To achieve that it calls the forms `loadRecord` method. And standalone fields, not belonging to any form, are also loaded.
 * The task editor maps them to the task model fields using their `name` properties.
 *
 * Please see {@link #beforeloadtasktoform} event to prevent some form auto-loading.
 *
 * In order to apply changes to the task the one should call {@link #updateTask} method:
 *
 * ```javascript
 * // applies changes to the loaded task
 * taskEditor.updateTask(function (cancelChanges) {
 *     // a function which is called when changes are applied or canceled if some constraint violation is met
 * });
 * ```
 *
 * When persisting changes the task editor collects all the contained fields changes (regardless if a field is standalone or belongs to a form)
 * and applies them itself (form `updateRecord` method is not used).
 *
 * Due to this behavior it's normally enough to just add a new field to the model and to the task editor to see the data loaded and persisted.
 *
 * ### Task form customization
 *
 * There is a {@link #taskFormConfig} config which can be used to customize the form panel.
 *
 * ```javascript
 *    Ext.create('Gnt.widget.taskeditor.TaskEditor', {
 *        // Configure the form located in the "General" tab
 *        taskFormConfig : {
 *            // turn off fields highlighting
 *            highlightTaskUpdates : false,
 *            // alter panel margin
 *            margin : 20
 *        }
 *    });
 * ```
 *
 * ### Fields configuration
 *
 * The {@link Gnt.widget.TaskForm} class has a config for each field presented at the `General` tab.
 * And using {@link #taskFormConfig} we can get access for those options to setup fields.
 * For example:
 *
 * ```javascript
 *    Ext.create('Gnt.widget.taskeditor.TaskEditor', {
 *        // setup form located at "General" tab
 *        taskFormConfig : {
 *            // set Baseline Finish Date field invisible
 *            baselineFinishConfig : {
 *                hidden : true
 *            }
 *        }
 *    });
 * ```
 *
 * Here are some more configs for other fields:
 *
 * - {@link Gnt.widget.TaskForm#taskNameConfig taskNameConfig} (the name of the task field)
 * - {@link Gnt.widget.TaskForm#startConfig startConfig} (the start date of the task field)
 * - {@link Gnt.widget.TaskForm#finishConfig finishConfig} (the end date of the task field)
 * - {@link Gnt.widget.TaskForm#durationConfig durationConfig} (the task duration field)
 *
 * Please see {@link Gnt.widget.TaskForm} class to see the full list of available config options.
 *
 * ### Extending the General field set
 *
 * If you want to add a new field to the `General` tab you will have to extend the {@link Gnt.widget.TaskForm TaskForm} class.
 * After that you will need to configure the task editor to use your extended class:
 *
 * ```javascript
 *    // extend standard TaskForm class
 *    Ext.define('MyTaskForm', {
 *        extend : 'Gnt.widget.taskeditor.TaskForm',
 *
 *        constructor : function(config) {
 *            this.callParent(arguments);
 *
 *            // add some custom field
 *            this.add({
 *                fieldLabel  : 'Foo',
 *                name        : 'Name',
 *                width       : 200
 *            });
 *        }
 *    });
 *
 *     // Let task editor know which class to use
 *     Ext.create('Gnt.widget.taskeditor.TaskEditor', {
 *        // to use MyTaskForm to build the "General" tab
 *        taskFormClass : 'MyTaskForm'
 *    });
 * ```
 *
 * #Predecessors
 *
 * Contains a {@link Gnt.widget.DependencyGrid grid} instance displaying the predecessors for the task.
 * You can add, edit or remove dependencies of the task using this panel.
 *
 * {@img gantt/images/taskeditor-panel-predecessors.png}
 *
 * You can enable/disable this tab by setting the {@link #showDependencyGrid} option.
 * To rename this tab you can use `dependencyText` property of {@link #l10n} config.
 * Customizing the grid itself can be done via the {@link #dependencyGridConfig} config.
 * To change make this tab display successors instead of predecessors - use the following code:
 *
 * ```javascript
 *    Ext.create('Gnt.widget.taskeditor.TaskEditor', {
 *        l10n : {
 *            // here we change tab title
 *            dependencyText : 'Successors'
 *        },
 *        // here is the grid config
 *        dependencyGridConfig : {
 *            // set grid to display successors
 *            direction : 'successors'
 *        }
 *    });
 * ```
 *
 * ### Customizing the dependency grid class
 *
 * You can also configure the task editor to use a custom class to build this tab using the {@link #dependencyGridClass} option.
 * If you need to add an extra column to the grid, you can do it like this:
 *
 * ```javascript
 *     // extend standard DependencyGrid
 *     Ext.define('MyDependencyGrid', {
 *        extend: 'Gnt.widget.DependencyGrid',
 *
 *        // extend buildColumns method to append extra column
 *        buildColumns : function () {
 *            // add custom column as last one
 *            return this.callParent(arguments).concat({
 *                header    : 'Foo',
 *                dataIndex : 'foo',
 *                width     : 100
 *            });
 *        }
 *    });
 *
 *     // setup task editor
 *     Ext.create('Gnt.widget.taskeditor.TaskEditor', {
 *        // to use extended class to build tab
 *        dependencyGridClass : 'MyDependencyGrid'
 *    });
 * ```
 *
 * #Resources
 *
 * Contains a {@link Gnt.widget.AssignmentEditGrid grid} instance displaying the task assignments.
 * It allows you to add, edit or remove task assignments.
 *
 * {@img gantt/images/taskeditor-panel-resources2.png}
 *
 * It also supports inline resource adding (for more details, take a look at the {@link Gnt.widget.AssignmentEditGrid#addResources} config.
 *
 * {@img gantt/images/taskeditor-panel-resources1.png}
 *
 * You can enable/disable this tab by setting the {@link #showAssignmentGrid} option.
 * To rename this tab you can use the `resourcesText` property of {@link #l10n} config.
 * Customizing the grid can be done via the {@link #assignmentGridConfig} config.
 *
 * Example:
 *
 * ```javascript
 *    Ext.create('Gnt.widget.taskeditor.TaskEditor', {
 *        assignmentStore : assignmentStore,
 *        resourceStore : resourceStore,
 *        l10n : {
 *            // rename tab
 *            resourcesText : 'Assignments'
 *        },
 *        // here is grid the config
 *        assignmentGridConfig : {
 *            // disable in-place resources adding
 *            addResources : false
 *        }
 *    });
 * ```
 *
 * ### Customizing the assignment grid class
 *
 * You can use a custom grid class for this tab by using the {@link #assignmentGridClass} option.
 * Example: if you need to add extra column to the grid you can do it like this:
 *
 * ```javascript
 *     // Extend the standard AssignmentGrid
 *     Ext.define('MyAssignmentGrid', {
 *        extend: 'Gnt.widget.AssignmentEditGrid',
 *
 *        // extend buildColumns method to append extra column
 *        buildColumns : function () {
 *            // add custom column as last one
 *            return this.callParent(arguments).concat({
 *                header       : 'Foo',
 *                dataIndex    : 'foo',
 *                width        : 100
 *            });
 *        }
 *    });
 *
 *     // setup task editor
 *     Ext.create('Gnt.widget.taskeditor.TaskEditor', {
 *        // use extended class
 *        assignmentGridClass : 'MyAssignmentGrid'
 *    });
 * ```
 *
 * #Advanced
 *
 * Contains a {@link Gnt.widget.AdvancedForm form} instance which can be customized, allowing the user to view and edit the following task data:
 *
 * - calendar assigned to the task
 * - scheduling mode for the task
 * - manually scheduled flag
 * - WBS code
 * - rollup flag
 * - constraint type
 * - constraint date
 * - read only flag
 *
 * {@img gantt/images/taskeditor-panel-advanced.png}
 *
 * You can enable/disable this tab by setting the {@link #showAdvancedForm} option.
 * To rename this tab you can use the `advancedText` property of {@link #l10n} config.
 *
 * Customizing the form itself can be done via the {@link #advancedFormConfig} config. For example this is how form content can be overwritten:
 *
 * ```javascript
 *    Ext.create("Gnt.widget.taskeditor.TaskEditor", {
 *        advancedFormConfig: {
 *            items: [
 *                 // new fields that will go here
 *                 // will replace standard presented in the "Advanced" tab
 *                 ...
 *            ]
 *        }
 *    });
 * ```
 *
 * ### Customizing the form class
 *
 * You can use your own custom class to build this tab by using the {@link #advancedFormClass} config:
 * For example if you need to add some extra field you can do it like this:
 *
 * ```javascript
 *     // Extend standard TaskForm class
 *     Ext.define('MyAdvancedForm', {
 *        extend : 'Gnt.widget.taskeditor.AdvancedForm',
 *
 *        constructor : function(config) {
 *            this.callParent(arguments);
 *
 *            // add some custom field
 *            this.add({
 *                fieldLabel  : 'Foo',
 *                name        : 'Name',
 *                width       : 200
 *            });
 *        }
 *    });
 *
 *     // setup task editor
 *     Ext.create("Gnt.widget.taskeditor.TaskEditor", {
 *        // to use new class to build the "Advanced" tab
 *        advancedFormClass: 'MyAdvancedForm',
 *    });
 * ```
 *
 * #Notes
 *
 * Contains an {@link Ext.form.field.HtmlEditor HTML editor instance} for viewing and editing a freetext note about the task.
 *
 * {@img gantt/images/taskeditor-panel-notes.png}
 *
 * You can enable/disable this tab by setting the {@link #showNotes} option.
 * To rename this tab you can use the `notesText` property of {@link #l10n} config.
 * Customizing the grid itself can be done via the {@link #notesConfig} config.
 *
 */
Ext.define('Gnt.widget.taskeditor.TaskEditor', {

    extend : 'Gnt.widget.taskeditor.BaseEditor',

    alias : 'widget.taskeditor',

    requires : [
        'Ext.form.field.HtmlEditor',
        'Ext.layout.container.Table',
        'Gnt.widget.taskeditor.TaskForm',
        'Gnt.widget.taskeditor.AdvancedForm',
        'Gnt.widget.AssignmentEditGrid',
        'Gnt.widget.DependencyGrid'
    ],

    alternateClassName : [ 'Gnt.widget.TaskEditor' ],

    /**
     * @event loadtask
     * Fires after task has been loaded into the editor.
     * @param {Gnt.widget.taskeditor.TaskEditor} taskEditor The task editor widget instance.
     * @param {Gnt.model.Task} task The task.
     */

    /**
     * @cfg {String} taskFormClass Class representing the form in the `General` tab.
     *
     * This option supposed to be used to implement a custom form in the `General` tab content.
     */
    taskFormClass : 'Gnt.widget.taskeditor.TaskForm',

    /**
     * @cfg {String} advancedFormClass Class representing the form in the `Advanced` tab.
     *
     * This option supposed to be used to implement a custom form in the `Advanced` tab content.
     */
    advancedFormClass : 'Gnt.widget.taskeditor.AdvancedForm',

    /**
     * @cfg {Boolean} showAssignmentGrid `true` to display the `Resources` tab.
     */
    showAssignmentGrid : true,

    /**
     * @cfg {Boolean} showDependencyGrid `true` to display the `Predecessors` tab.
     */
    showDependencyGrid : true,

    /**
     * @cfg {Boolean} allowParentTaskDependencies `false` to hide a `Predecessors` tab for parent tasks
     * (requires {@link #showDependencyGrid} to be `false` as well) and also exclude parent tasks from the list
     * of possible predecessors.
     */
    allowParentTaskDependencies : true,

    /**
     * @cfg {Boolean} showNotes `true` to display the `Notes` tab.
     */
    showNotes : true,

    /**
     * @cfg {Boolean} showAdvancedForm `true` to display the `Advanced` tab.
     */
    showAdvancedForm : true,

    /**
     * @cfg {Boolean} showRollup `true` to display rollup field on the `Advanced` tab.
     */
    showRollup : false,

    /**
     * @cfg {Boolean} showReadOnly `false` to hide readonly field on the `Advanced` tab.
     */
    showReadOnly : true,

    /**
     * @event beforeupdatetask
     * @preventable
     * Fires before task updating occurs. Return `false` to prevent the update.
     * @param {Gnt.widget.taskeditor.BaseEditor} taskEditor The task editor widget instance.
     * @param {Function} proceedCallback The function which can be called manually to continue task updating. Example:
     *
     *      var taskEditor = Ext.create('Gnt.widget.taskeditor.TaskEditor', {
     *          listeners   : {
     *              beforeupdatetask    : function (taskeditor, proceedCallback) {
     *                  var me  = this;
     *                  Ext.MessageBox.confirm('Confirm', 'Are you sure you want to do that?', function (buttonId) {
     *                      if (buttonId == 'yes') {
     *                          // here we continue updating asynchronously after user click "Yes" button
     *                          proceedCallback();
     *                          me.hide();
     *                      }
     *                  });
     *                  // here we return false to stop updating
     *                  return false;
     *              }
     *          }
     *      });
     *
     */

    /**
     * @event afterupdatetask
     * Fires after a task has been updated.
     * This event can be used to do some extra processing after the task got updated by the task editor.
     * @param {Gnt.widget.taskeditor.BaseEditor} taskEditor The task editor instance.
     */

    /**
     * @cfg {Object/Object[]} items A single item, or an array of child Components to be **appended** after default tabs to this container.
     * For example:
     *
     * ```javascript
     *      var taskEditor = Ext.create('Gnt.widget.taskeditor.TaskEditor', {
     *          items: [{
     *              title   : "Some custom tab",
     *              items   : [{
     *                  xtype       : 'textfield',
     *                  fieldLabel  : 'Enter your name',
     *                  id          : 'enter-your-name',
     *                  allowBlank  : false,
     *                  blankText   : 'Please enter your name'
     *              }]
     *          }]
     *      });
     * ```
     */

    /**
     * @cfg {Boolean} showBaseline `true` to display baseline fields in the `General` tab.
     */
    showBaseline : true,

    /**
     * @cfg {Object} taskFormConfig Configuration options to be supplied to the `General` tab.
     * For possible options take a look at the {@link Gnt.widget.TaskForm}.
     */
    taskFormConfig : null,

    /**
     * @cfg {String} dependencyGridClass Class representing the grid panel in the `Predecessor` tab.
     *
     * Override this to provide your own implementation subclassing the {@link Gnt.widget.DependencyGrid} class.
     */
    dependencyGridClass : 'Gnt.widget.DependencyGrid',

    /**
     * @cfg {Object} dependencyGridConfig Configuration options for the `Predecessors` tab.
     * For possible options take a look at the {@link Gnt.widget.DependencyGrid}.
     *
     */
    dependencyGridConfig : null,

    /**
     * @cfg {String} assignmentGridClass Class representing the grid panel in the `Resources` tab.
     *
     * Override this to provide your own implementation subclassing the {@link Gnt.widget.AssignmentEditGrid} class.
     */
    assignmentGridClass : 'Gnt.widget.AssignmentEditGrid',

    /**
     * @cfg {Object} assignmentGridConfig Configuration options for the `Resources` tab.
     * For possible options take a look at the {@link Gnt.widget.AssignmentEditGrid}.
     *
     */
    assignmentGridConfig : null,

    /**
     * @cfg {Object} advancedFormConfig Configuration options for the `Advanced` tab.
     * For possible options take a look at the {@link Gnt.widget.TaskForm}.
     *
     */
    advancedFormConfig : null,

    /**
     * @cfg {Object} notesConfig Configuration options for the HTML-editor placed in the `Notes` tab.
     * For possible options take a look at the {@link Ext.form.field.HtmlEditor}.
     */
    notesConfig : null,

    /**
     * @property {Ext.panel.Panel} notesPanel The `Notes` tab.
     * Please use {@link #notesEditor} to access an enclosed HTML-editor.
     */
    notesPanel : null,

    /**
     * @property {Ext.form.field.HtmlEditor} notesEditor The HTML-editor presented in the `Notes` tab.
     * To specify setting for the HTML-editor please use {@link #notesConfig}.
     */
    notesEditor : null,


    /**
     * @property {Gnt.widget.TaskForm} taskForm The `General` tab task form.
     * By default it's a {@link Gnt.widget.TaskForm} instance but it might be customized by using {@link #taskFormClass} option.
     */
    taskForm : null,

    /**
     * @property {Gnt.widget.AssignmentEditGrid} assignmentGrid The grid used for the `Resources` tab.
     *
     */
    assignmentGrid : null,

    /**
     * @property {Gnt.widget.DependencyGrid} dependencyGrid The `Predecessors` tab instance.
     *
     */
    dependencyGrid : null,
    /**
     * @property {Gnt.widget.TaskForm} advancedForm The `Advanced` tab form.
     * By default it's a {@link Gnt.widget.TaskForm} instance but it can be customized by using {@link #advancedFormClass} option.
     *
     */
    advancedForm   : null,

    margin : 0,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     *  - generalText         : 'General',
     *  - resourcesText       : 'Resources',
     *  - dependencyText      : 'Predecessors',
     *  - addDependencyText   : 'Add new',
     *  - dropDependencyText  : 'Remove',
     *  - notesText           : 'Notes',
     *  - advancedText        : 'Advanced',
     *  - wbsCodeText         : 'WBS code',
     *  - addAssignmentText   : 'Add new',
     *  - dropAssignmentText  : 'Remove'
     */

    notUpdatableFields      : ['index', 'isLast'],

    initComponent : function() {
        this.notUpdatableFields = this.notUpdatableFields.slice();
        this.notUpdatableFields.push(this.taskStore.parentIdProperty || 'parentId');

        this.callParent(arguments);
    },

    buildItems : function () {
        var me    = this,
            items = [];

        if (me.taskForm !== false && (!me.taskForm || !me.taskForm.isInstance)) {
            me.taskForm = Ext.create(Ext.apply({
                xtype        : 'taskform',
                xclass       : me.taskFormClass,
                task         : me.task,
                border       : false,
                taskStore    : me.taskStore,
                showBaseline : me.showBaseline,
                showRollup   : false
            }, me.taskForm, me.taskFormConfig));
        }

        if (!me.taskForm.title) {
            me.taskForm.title = me.L('generalText');
        }

        items.push(me.taskForm);

        // create DependencyGrid instance
        if (me.showDependencyGrid) {
            me.dependencyGrid = Ext.create(me.dependencyGridClass, Ext.apply({
                allowParentTaskDependencies : me.allowParentTaskDependencies,
                taskModel                   : me.taskStore.model,
                dependencyModel             : me.taskStore.getDependencyStore().getModel(),
                // task                        : me.task,
                margin                      : 0,
                border                      : false
            }, me.dependencyGridConfig));

            items.push(me.dependencyGrid);
        }

        // if AssignmentGrid required
        if (me.showAssignmentGrid && me.assignmentStore && me.resourceStore) {
            // clone assignment and resource stores if they were not copied before
            if (!me.getAssignmentStoreClone()) me.setAssignmentStoreClone(me.cloneAssignmentStore(me.task));
            if (!me.getResourceStoreClone()) me.setResourceStoreClone(me.cloneResourceStore(me.task));

            // create AssignmentGrid instance
            me.assignmentGrid = Ext.create(me.assignmentGridClass, Ext.apply({
                assignmentStore  : me.getAssignmentStoreClone(),
                resourceStore    : me.getResourceStoreClone(),
                border           : false,
                margin           : 0,
                listeners        : {
                    // we need this to draw selection properly on very first activation of tab
                    // to gracefully process deferredRender = true
                    afterrender : {
                        fn     : function (el) {
                            me.task && el.loadTaskAssignments(me.task.getId());
                        },
                        single : true
                    }
                }
            }, me.assignmentGridConfig));

            if (!me.assignmentGrid.title) {
                me.assignmentGrid.title = me.L('resourcesText');
            }

            items.push(me.assignmentGrid);
        }

        // if advanced form required
        if (me.showAdvancedForm) {
            me.advancedFormConfig = me.advancedFormConfig || {};

            // create TaskForm instance for the "Advanced" tab form
            me.advancedForm = Ext.create(me.advancedFormClass, Ext.applyIf(me.advancedFormConfig, {
                showRollup   : me.showRollup,
                showReadOnly : me.showReadOnly,

                border    : false,
                task      : me.task,
                taskStore : me.taskStore
            }));

            if (!me.advancedForm.title) {
                me.advancedForm.title = me.L('advancedText');
            }

            items.push(me.advancedForm);
        }

        // create notes panel
        if (me.showNotes) {
            // create notes HtmlEditor instance
            me.notesEditor = Ext.create('Ext.form.field.HtmlEditor', Ext.apply({
                listeners : {
                    // we need this to draw content of HtmlEditor properly on very first activation of tab
                    // to gracefully process deferredRender = true
                    afterrender : function (el) {
                        me.task && me.notesEditor.setValue(me.task.getNote());
                    }
                },

                readOnly : me.task && !me.task.isEditable(me.task.noteField),

                isDataChanged : function () {
                    return this.isDirty();
                }
            }, me.notesConfig));

            // we have to wrap it to panel since it'll be a tab in TabPanel
            // (to avoid some render bugs)
            me.notesPanel = Ext.create('Ext.Container', {
                border : false,
                margin : 0,
                layout : 'fit',
                items  : me.notesEditor
            });

            if (!me.notesPanel.title) {
                me.notesPanel.title = me.L('notesText');
            }

            items.push(me.notesPanel);
        }

        return items;
    },

    onDependencyGridStoreChange : function (store) {
        var me = this,
            dependencyGrid = me.dependencyGrid;

        dependencyGrid.suspendDependencyStoreRefresh();
        // On any change apply grid store changes to the dependency store copy
        Gnt.util.Data.applyCloneChanges(dependencyGrid.store, me.getDependencyStoreClone());
        dependencyGrid.resumeDependencyStoreRefresh();
    },

    onDependencyGridStoreAdd : function (store, records) {
        this.onDependencyGridStoreChange(store);
    },

    onDependencyGridStoreRemove : function (store, records) {
        this.onDependencyGridStoreChange(store);
    },

    onDependencyGridStoreUpdate : function (store, record, operation, modifiedFields) {
        if (operation != Ext.data.Model.COMMIT) {
            this.onDependencyGridStoreChange(store);
        }
    },

    /**
     * @private
     * Dependency grid shows only records related to the shown task.
     * At the same time we have cloned dependency store which has all the dependency copies on board.
     * Purpose of this method is to setup listeners that apply changes made in the grid store
     * to the cloned dependency store.
     */
    bindDependencyGrid : function () {
        var me                    = this,
            clonedDependencyStore = me.getDependencyStoreClone(),
            grid                  = me.dependencyGrid;

        // dependency grid store have to use cloned task store
        grid.store.taskStore = me.getTaskStoreClone();

        if (clonedDependencyStore) {

            me.mon(grid.store, {
                // add the same records to the dependency store clone as well
                'add'    : me.onDependencyGridStoreAdd,
                'update' : me.onDependencyGridStoreUpdate,
                'remove' : me.onDependencyGridStoreRemove,

                scope : me
            });

            me.dependencyGridBound = true;
        }
    },

    onAssignmentGridAssignmentStoreChange : function (store) {
        // On any change apply grid store changes to the assignment store copy
        this.assignmentGrid.saveTaskAssignments();
    },

    onAssignmentGridAssignmentStoreAdd : function (store, records) {
        this.onAssignmentGridAssignmentStoreChange(store);
    },

    onAssignmentGridAssignmentStoreRemove : function (store, records) {
        this.onAssignmentGridAssignmentStoreChange(store);
    },

    onAssignmentGridAssignmentStoreUpdate : function (store, record, operation, modifiedFields) {
        if (operation != Ext.data.Model.COMMIT) {
            this.onAssignmentGridAssignmentStoreChange(store);
        }
    },

    onAssignmentGridResourceStoreChange : function (store) {
        // On any change apply grid store changes to the resource store copy
        this.assignmentGrid.saveResources();
    },

    onAssignmentGridResourceStoreAdd : function (store, records) {
        this.onAssignmentGridResourceStoreChange(store);
    },

    onAssignmentGridResourceStoreRemove : function (store, records) {
        this.onAssignmentGridResourceStoreChange(store);
    },

    onAssignmentGridResourceStoreUpdate : function (store, record, operation, modifiedFields) {
        if (operation != Ext.data.Model.COMMIT) {
            this.onAssignmentGridResourceStoreChange(store);
        }
    },

    bindAssignmentGrid : function () {
        var me                    = this,
            clonedAssignmentStore = me.getAssignmentStoreClone(),
            clonedResourceStore   = me.getResourceStoreClone(),
            grid                  = me.assignmentGrid;

        if (clonedAssignmentStore && clonedResourceStore) {

            me.mon(grid.store, {
                'add'    : me.onAssignmentGridAssignmentStoreAdd,
                'update' : me.onAssignmentGridAssignmentStoreUpdate,
                'remove' : me.onAssignmentGridAssignmentStoreRemove,

                scope : me
            });

            me.mon(grid.resourceDupStore, {
                'add'    : me.onAssignmentGridResourceStoreAdd,
                'update' : me.onAssignmentGridResourceStoreUpdate,
                'remove' : me.onAssignmentGridResourceStoreRemove,

                scope : me
            });

            me.assignmentGridBound = true;
        }
    },

    /**
     * Loads task data into task editor.
     * @param {Gnt.model.Task} task Task to load to editor.
     */
    loadTask : function (task) {
        if (!task) return;

        this.task = task;

        var me             = this,
            dependencyGrid = me.dependencyGrid,
            assignmentGrid = me.assignmentGrid,
            readOnly       = task.isReadOnly();

        me.callParent(arguments);

        var taskBuffer = me.taskBuffer;

        if (dependencyGrid) {
            // TODO: review this
            if (!me.dependencyGridBound) me.bindDependencyGrid();

            dependencyGrid.setTask(taskBuffer);

            // we always load records into the grid event when tab is not visible
            // since we use its ability to load task dependencies to fill our dependency store clone with records
            dependencyGrid.loadDependencies(taskBuffer);

            dependencyGrid.tab.setVisible(me.allowParentTaskDependencies || task.isLeaf());
        }

        if (assignmentGrid) {
            if (!me.assignmentGridBound) me.bindAssignmentGrid();

            assignmentGrid.setAssignmentStore(me.getAssignmentStoreClone());
            assignmentGrid.setResourceStore(me.getResourceStoreClone());

            assignmentGrid.loadResources(true);
            // load task assignments to grid
            assignmentGrid.loadTaskAssignments(task.getId() || task.getPhantomId());

            assignmentGrid.task = taskBuffer;
        }

        me.loadTaskToForms(task, taskBuffer);

        if (me.notesEditor) {
            me.notesEditor.setValue(task.getNote());
        }

        me.setReadOnly(readOnly);

        me.fireEvent('loadtask', me, task);
    },

    loadTaskToForms : function (task, taskBuffer) {
        var me    = this,
            forms = me.query('form');

        for (var i = 0; i < forms.length; i++) {
            /**
             * @preventable
             * @event beforeloadtasktoform
             * Fires before a task gets loaded into a form laying on the task editor.
             *
             * By default the task editor tries to load the task into all the contained forms. Returning `false` from this event listener
             * for a specific form will prevent the form loading:
             *
             * ```javascript
             * var editor = new Gnt.widget.TaskEditor({
             *     items : [
             *         {
             *             xtype  : 'form',
             *             itemId : custom-form',
             *             title  : 'Custom fields',
             *             items  : [
             *                 {
             *                     xtype      : 'textfield',
             *                     name       : 'foo',
             *                     fieldLabel : 'Some field'
             *                 }
             *             ]
             *         }
             *     ],
             *     listeners : {
             *         'beforeloadtasktoform' : function (taskEditor, task, form) {
             *             // we don't want the custom form to be loaded automatically
             *             return form.getItemId() !== 'custom-form';
             *         }
             *     }
             * });
             * ```
             *
             * @param {Gnt.widget.taskeditor.TaskEditor} taskEditor The task editor.
             * @param {Gnt.model.Task} task Task being loaded.
             * @param {Ext.form.Panel} form Form about to be loaded with the task.
             */
            if (me.fireEvent('beforeloadtasktoform', me, task, forms[i]) !== false) {
                me.loadTaskToForm(task, forms[i], taskBuffer);
            }
        }
    },

    loadTaskToForm : function (task, form, taskBuffer) {
        if (form.isTaskEditorForm) {
            form.setSuppressTaskUpdate(true);

            form.getForm().reset();

            form.loadRecord(task, taskBuffer);

            form.setSuppressTaskUpdate(false);
        } else {
            form.getForm().reset();
            form.loadRecord(task);
        }
    },

    updateReadOnly : function () {
        var me             = this,
            task           = me.taskBuffer,
            widgetReadOnly = me.getReadOnly(),
            readOnly       = widgetReadOnly || task.isReadOnly();

        if (me.taskForm) {
            // we repeat the editor readOnly state on the taskForm
            if (widgetReadOnly != me.taskForm.getReadOnly()) {
                me.taskForm.setReadOnly(widgetReadOnly);
            } else {
                me.taskForm.updateReadOnly();
            }
        }

        if (me.assignmentGrid) {
            me.assignmentGrid.setReadOnly(readOnly);
            me.assignmentGrid.down('toolbar').setVisible(!readOnly);
        }

        if (me.dependencyGrid) {
            me.dependencyGrid.setReadOnly(readOnly);
        }

        if (me.notesEditor) {
            me.notesEditor.setReadOnly(readOnly || !task.isEditable(task.noteField));
        }

        if (me.advancedForm) {
            // we repeat the editor readOnly state on the advancedForm
            if (widgetReadOnly != me.advancedForm.getReadOnly()) {
                me.advancedForm.setReadOnly(widgetReadOnly);
            } else {
                me.advancedForm.updateReadOnly();
            }
        }
    },


    doValidate : function (invalidComponentsAccFn) {
        var result = this.callParent(arguments);

        if (this.taskForm && !this.taskForm.isValid()) {
            result = false;
            invalidComponentsAccFn && invalidComponentsAccFn(this.getTabByComponent(this.taskForm), this.taskForm);
        }

        if (this.dependencyGrid && !this.dependencyGrid.isValid()) {
            result = false;
            invalidComponentsAccFn && invalidComponentsAccFn(this.getTabByComponent(this.dependencyGrid), this.dependencyGrid);
        }

        if (this.assignmentGrid && !this.assignmentGrid.isValid()) {
            result = false;
            invalidComponentsAccFn && invalidComponentsAccFn(this.getTabByComponent(this.assignmentGrid), this.assignmentGrid);
        }

        if (this.advancedForm && !this.advancedForm.isValid()) {
            result = false;
            invalidComponentsAccFn && invalidComponentsAccFn(this.getTabByComponent(this.advancedForm), this.advancedForm);
        }

        return result;
    },

    doUpdateTask : function () {
        var me   = this,
            task = me.task;

        // push dependency store changes from copy to real store
        Gnt.util.Data.applyCloneChanges(me.getDependencyStoreClone(), me.getDependencyStore());

        var resourceStoreClone = me.getResourceStoreClone();

        Gnt.util.Data.applyCloneChanges(resourceStoreClone, me.getResourceStore());

        var resourceIdField = me.getAssignmentStore().model.prototype.resourceIdField;

        Gnt.util.Data.applyCloneChanges(me.getAssignmentStoreClone(), me.getAssignmentStore(), function (data, assignment) {
            // get assigned resource
            var resource = resourceStoreClone.getById(assignment.getResourceId());
            // and its original record
            if (resource && resource.originalRecord) {
                var existingResource = resource.originalRecord;
                // now let's use real resource ID for saving
                data[resourceIdField] = existingResource.getId() || existingResource.internalId;
            }
        });

        task.beginEdit();

        task.set(me.getTaskUpdateData(task, me.taskBuffer));

        me.notesEditor && me.task.set(me.task.noteField, me.notesEditor.getValue());

        task.endEdit();
    },

    isDataChanged : function (changedComponentsAccFn) {
        var result = this.callParent(arguments);

        if (this.taskForm && this.taskForm.isDataChanged()) {
            result = true;
            changedComponentsAccFn && changedComponentsAccFn(this.getTabByComponent(this.taskForm));
        }

        var dependencyStoreCopy = this.getDependencyStoreClone();

        if (this.dependencyGrid && dependencyStoreCopy && (dependencyStoreCopy.getModifiedRecords().length || dependencyStoreCopy.getRemovedRecords().length)) {
            result = true;
            changedComponentsAccFn && changedComponentsAccFn(this.getTabByComponent(this.dependencyGrid));
        }

        if (this.assignmentGrid && this.assignmentGrid.isDataChanged()) {
            result = true;
            changedComponentsAccFn && changedComponentsAccFn(this.getTabByComponent(this.assignmentGrid));
        }

        if (this.advancedForm && this.advancedForm.isDataChanged()) {
            result = true;
            changedComponentsAccFn && changedComponentsAccFn(this.getTabByComponent(this.advancedForm));
        }

        if (this.notesEditor && this.notesEditor.isDataChanged()) {
            result = true;
            changedComponentsAccFn && changedComponentsAccFn(this.getTabByComponent(this.notesEditor));
        }

        return result;
    }

});
