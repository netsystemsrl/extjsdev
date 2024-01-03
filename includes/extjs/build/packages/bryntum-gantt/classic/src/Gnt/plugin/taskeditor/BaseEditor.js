/**
@class Gnt.plugin.taskeditor.BaseEditor
*/
Ext.define('Gnt.plugin.taskeditor.BaseEditor', {
    extend                      : 'Ext.window.Window',

    requires                    : ['Ext.window.MessageBox'],
    mixins                      : ['Ext.AbstractPlugin', 'Gnt.mixin.Localizable'],

    lockableScope               : 'top',

    closeOnBlur                 : true,

    /**
    * @cfg {Object} taskEditorCls Class for the {@link Gnt.widget.taskeditor.TaskEditor} instance.
    */
    taskEditorCls               : 'Gnt.widget.taskeditor.TaskEditor',

    /**
     * @property {Boolean} isTaskEditor
     * @readonly
     * Indicates that the class extends {@link Gnt.plugin.taskeditor.BaseEditor} class.
     */
    isTaskEditor                : true,

    /**
     * @property {Gnt.widget.taskeditor.BaseEditor} taskEditor The task editor widget contained by the plugin.
     */
    taskEditor                  : null,

    /**
     * @cfg {Object} panelConfig Configuration for {@link Gnt.widget.taskeditor.BaseEditor} instance.
     */
    panelConfig                 : null,

    /**
     * @cfg {Boolean} saveOnEnter True to save the form data and close if ENTER is pressed in one of the input fields inside the form panels.
     */
    saveOnEnter : true,

    height                      : 340,
    width                       : 600,
    layout                      : 'card',
    constrain                   : true,

    /**
     * @cfg {String} triggerEvent
     * The event upon which the editor shall be shown. Defaults to 'taskdblclick'.
     */
    triggerEvent                : 'taskdblclick',

    closeAction                 : 'hide',

    modal                       : true,

    gantt                       : null,

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore A store with assignments.
     * If this config is not provided plugin will try to retrieve assignments store from {@link Gnt.panel.Gantt} instance.
     */
    assignmentStore             : null,

    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore A store with resources.
     * If this config is not provided plugin will try to retrieve resources store from {@link Gnt.panel.Gantt} instance.
     */
    resourceStore               : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore A store with tasks.
     * If this config is not provided plugin will try to retrieve tasks store from {@link Gnt.panel.Gantt} instance.
     * **Note:** Task store is required if task doesn't belong to any task store yet.
     */
    taskStore                   : null,

    /**
     * @cfg {Gnt.model.Task} task The task to show in the task editor.
     */

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

            - title               : 'Task Information',
            - alertCaption        : 'Information',
            - alertText           : 'Please correct marked errors to save changes',
            - okText              : 'Ok',
            - cancelText          : 'Cancel',
     */

    /**
     * @cfg {Boolean} [monitorDataUpdates=false]
     *
     * Whether to actively monitor data updates or not, if set to true then Ok button (if present) will be enabled
     * only if there're data changes introduced in the Task Editor and those changes are valid.
     */
    monitorDataUpdates          : false,

    /**
     * @cfg {Number} monitorDataUpdatesInterval
     *
     * Timeout to use to monitor data updates.
     */
    monitorDataUpdatesInterval  : 500,

    taskEditorConfigs           : 'l10n,task,taskStore,assignmentStore,resourceStore',

    taskFilters                 : null,

    /**
     * @event loadtask
     * Fires after task loading complete.
     * @param {Gnt.widget.taskeditor.TaskEditor} taskEditor Task editor widget instance used for editing.
     * @param {Gnt.model.Task} task The loaded task.
     *
     *
     * This event can be used to do additional data loading if task editor was extended with some extra fields.
     * Also please take a look at {@link #afterupdatetask} event to have an example of how to implement custom data saving.
     *
     *      // some custom user form
     *      var customForm = new Gnt.widget.taskeditor.TaskForm({
     *          title : 'Custom form panel',
     *          xtype : 'taskform',
     *          items : [
     *              {
     *                  fieldLabel  : 'Foo field',
     *                  name        : 'foo',
     *                  allowBlank  : false
     *              }
     *          ],
     *          taskStore   : taskStore
     *      });
     *
     *      var taskEditor = Ext.create('Gnt.plugin.TaskEditor', {
     *          // register custom form as an additional tab
     *          panelConfig : {
     *              items       : customForm
     *          },
     *          listeners   : {
     *              // populate custom form with task values
     *              loadtask : function (taskeditor, task) {
     *                  customForm.loadRecord(task);
     *              },
     *              ....
     *          }
     *      });
     */

    /**
     * @event validate
     * @preventable
     * Fires when task validation occurs. Take a look at example of using this event {@link Gnt.widget.taskeditor.TaskEditor#event-validate here}.
     * @param {Gnt.widget.taskeditor.TaskEditor} taskEditor Task editor widget instance.
     */

    /**
     * @event beforeupdatetask
     * @preventable
     * Fires before task updating occurs. Return false to prevent the update.
     * @param {Gnt.widget.taskeditor.TaskEditor} taskEditor Task editor widget instance used for editing.
     * @param {Function} proceedCallback The function which can be called manually to continue task updating. Example:
     *
     *      var taskEditor = Ext.create('Gnt.plugin.TaskEditor', {
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
     * **Note:** If a custom confirmation window messes with the default error message box you can disable it by overriding {@link #method-showErrorMessage} method. Example:
     *
     *      var taskEditor = Ext.create('Gnt.plugin.TaskEditor', {
     *          // prevent default error message box showing
     *          showErrorMessage : Ext.emptyFn,
     *          listeners   : {
     *              beforeupdatetask    : function (taskeditor, proceedCallback) {
     *                  var me  = this;
     *                  Ext.create('Ext.window.Window', {
     *                      title   : 'Complex confirmation',
     *                      width   : 100,
     *                      height  : 100,
     *                      items   : [....]
     *                  }).show();
     *                  // here we return false to stop updating
     *                  return false;
     *              }
     *          }
     *      });
     *
     */

    /**
     * @event afterupdatetask
     * Fires after task updating is finished.
     * @param {Gnt.widget.taskeditor.TaskEditor} taskEditor Task editor widget instance.
     *
     * This event can be used to do some extra processing after task was updated by task editor.
     * For example in case when you have some additional fields you can implement saving of them using this event.
     * Also please take a look at {@link #loadtask} event to have an example of how to implement custom data loading.
     *
     *      // some custom user form
     *      var customForm = new Gnt.widget.taskeditor.TaskForm({
     *          title : 'Custom form panel',
     *          xtype : 'taskform',
     *          items : [
     *              {
     *                  fieldLabel  : 'Foo field',
     *                  // foo - is the name of custom task field
     *                  name        : 'foo',
     *                  allowBlank  : false
     *              }
     *          ],
     *          taskStore   : taskStore
     *      });
     *
     *      var taskEditor = Ext.create('Gnt.plugin.TaskEditor', {
     *          // register custom form as an additional tab
     *          panelConfig : {
     *              items       : customForm
     *          },
     *          listeners   : {
     *              afterupdatetask : function (taskeditor) {
     *                  // update form fields to loaded task
     *                  customForm.updateRecord();
     *              },
     *              ....
     *          }
     *      });
     */

    constructor : function (config) {
        config              = config || {};

        this.taskFilters    = [];

        // we need to apply config to let locale()
        // know about legacy locales since it will check them in 'this'
        Ext.apply(this, config);

        this.title          = this.L('title');

        // by default we make 'Ok', 'Cancel' buttons
        if (!config.buttons) {
            this.buttons    = ['->',
                {
                    itemId  : 'teOkBtn',
                    text    : this.L('okText'),
                    handler : this.onOkClick,
                    scope   : this
                },
                {
                    text    : this.L('cancelText'),
                    handler : this.close,
                    scope   : this
                }
            ];
        }

        this.callParent([config]);
        this.addCls('gnt-taskeditor-window');

        if (this.closeOnBlur) {
            this.on('show', this.onFirstShow, this, { single : true});
        }

        this.on('beforehide', this.onBeforeHide, this);
    },

    /**
     * Displays the error message box on validation fail.
     * Override this method to customize the dialog.
     */
    showErrorMessage : function () {
        !Ext.Msg.isVisible() && Ext.Msg.alert(this.L('alertCaption'), this.L('alertText'));
    },

    onOkClick : function () {
        // Show our alert only if singleton Ext.Msg is not yet visible
        !this.completeEditing() && this.showErrorMessage();
    },

    getState : function () {
        if (this.rendered) {
            return this.callParent(arguments);
        }
    },

    init : function (cmp) {
        var me = this;

        // if assignmentStore or resourceStore wasn't defined as configuration options
        // during plugin constructing we get them from Gnt.panel.Gantt instance
        me.setAssignmentStore(me.assignmentStore || cmp.getAssignmentStore());
        me.setResourceStore(me.resourceStore || cmp.getResourceStore());
        me.setTaskStore(me.taskStore || cmp.getTaskStore());

        // build taskEditor widget
        me.buildTaskEditor(Ext.apply(me.buildTaskEditorConfig(cmp), me.panelConfig));

        me.add(me.taskEditor);

        var listenerCfg = {
            taskstorechange       : me.onTaskStoreChange,
            resourcestorechange   : me.onResourceStoreChange,
            assignmentstorechange : me.onAssignmentStoreChange,
            dependencystorechange : me.onDependencyStoreChange,

            scope                 : me
        };

        listenerCfg[me.triggerEvent] = me.onTriggerEvent;

        me.mon(cmp, listenerCfg);

        me.gantt = cmp;
    },

    onTaskStoreChange : function(cmp, store) {
        this.setTaskStore(store);
    },

    onResourceStoreChange : function(cmp, store) {
        this.setResourceStore(store);
    },

    onAssignmentStoreChange : function(cmp, store) {
        this.setAssignmentStore(store);
    },

    onDependencyStoreChange : function(cmp, store) {
        this.setDependencyStore(store);
    },

    setTaskStore : function(store) {
        var me = this;

        me.taskStore = store;

        if (me.taskEditor && me.taskEditor.isComponent) {
            me.taskEditor.setTaskStore(store);
        }
    },

    setResourceStore : function(store) {
        var me = this;

        me.resourceStore = store;

        if (me.taskEditor && me.taskEditor.isComponent) {
            me.taskEditor.setResourceStore(store);
        }
    },

    setAssignmentStore : function(store) {
        var me = this;

        me.assignmentStore = store;

        if (me.taskEditor && me.taskEditor.isComponent) {
            me.taskEditor.setAssignmentStore(store);
        }
    },

    setDependencyStore : function(store) {
        var me = this;

        // there is no this.dependencyStore, value is taken from task store always

        if (me.taskEditor && me.taskEditor.isComponent) {
            me.taskEditor.setDependencyStore(store);
        }
    },

    // Prepares a configuration object to instantiate the taskEditor widget
    buildTaskEditorConfig : function (cmp) {
        var result = {
            width                       : null,
            height                      : null,
            border                      : false,
            showBaseline                : cmp.enableBaseline,
            showRollup                  : cmp.showRollupTasks,
            allowParentTaskDependencies : cmp.allowParentTaskDependencies
        };

        var configs = this.taskEditorConfigs.split(',');

        // let's map some configuration options from plugin to taskEditor
        for (var i = 0; i < configs.length; i++) {
            var cfg = configs[i];

            if (typeof this[cfg] !== 'undefined') {
                result[cfg] = this[cfg];
            }
        }

        return result;
    },


    /**
     * @protected
     * Builds the task editor widget instance being used by the plugin.
     * By default this method creates {@link Gnt.widget.taskeditor.TaskEditor} instance and puts a reference to the instance to {@link #taskEditor} property.
     * Override this if you want to instantiate your custom class instead.
     * @param  {Object} cfg Configuration of the task editor widget being instantiated
     */
    buildTaskEditor : function (cfg) {
        this.taskEditor = Ext.create(this.taskEditorCls, cfg);
        var indicator = this.taskEditor.eventIndicator;
        this.relayEvents(this.taskEditor, ['load' + indicator, 'validate', 'beforeupdate' + indicator, 'afterupdate' + indicator]);
    },


    onTriggerEvent : function (gantt, task) {
        this.showTask(task);
    },

    /**
     * Shows window and loads task into the task editor.
     * @param {Gnt.model.Task} task Task to load.
     */
    showTask : function (task) {
        if (this.taskEditor && task && this.matchFilters(task)) {

            this.taskEditor.loadTask(task);

            var readOnly = this.gantt.isReadOnly();

            //  take into account the gantt readOnly state (the task being loaded readOnly and isEditable logic is supported on the widgets level)
            if (readOnly != this.taskEditor.setReadOnly()) {
                this.taskEditor.setReadOnly(readOnly);
            }

            var okBtn = this.down('#teOkBtn');

            if (okBtn) {
                okBtn.setVisible(!readOnly);
            }

            this.show();
        }
    },


    matchFilters : function (task) {
        if (!task) return;

        for (var i = 0; i < this.taskFilters.length; i++) {
            var filter  = this.taskFilters[i];
            if (!filter.fn.call(filter.scope, task)) return false;
        }

        return true;
    },


    addFilter : function (fn, scope) {
        this.taskFilters.push({
            fn      : fn,
            scope   : scope || this
        });
    },


    validate : function () {
        if (this.taskEditor) {
            return this.taskEditor.validate();
        }
    },

    /**
     * This function is a shorthand for the following typical steps:
     *
     *      if (!taskEditor.validate()) {
     *          Ext.MessageBox.alert('Information', 'Please correct marked errors to save changes');
     *      } else {
     *          if (taskEditor.updateTask()) taskEditor.hide();
     *      }
     *
     * Instead of above code you can write:
     *
     *      if (!taskEditor.completeEditing()) {
     *          Ext.MessageBox.alert('Information', 'Please correct marked errors to save changes');
     *      }
     *
     * @param  {Function} callback A function to call when task modification is applied (or cancelled).
     * @return {Boolean} true if validation successfully passed and record update was initiated.
     */
    completeEditing : function (callback) {

        if (this.taskEditor) {
            var activeTab = this.taskEditor.getActiveTab();

            // Force any active editing to complete first
            if (activeTab.editingPlugin && activeTab.editingPlugin.completeEdit) {
                activeTab.editingPlugin.completeEdit();
            }

            if (!this.taskEditor.validate()) return false;

            if (this.taskEditor.updateTask(callback)) {
                this.hide();
                return true;
            }

            return false;
        }
    },

    /**
     * Persists the values in this task editor into corresponding {@link Gnt.model.Task}
     * object provided to {@link #showTask}.
     * Internally just calls {@link Gnt.widget.taskeditor.TaskEditor#updateTask updateTask} method of task editor panel.
     * @param  {Function} callback A function to call when task modification is applied (or cancelled).
     */
    updateTask : function (callback) {
        if (this.taskEditor) {
            return this.taskEditor.updateTask(callback);
        }
    },

    afterRender : function() {
        var me = this;
        me.callParent(arguments);
        me.startDataUpdatesMonitoring();

        if (this.saveOnEnter) {
            this.el.on({
                'keyup' : function (e, t) {
                    if (e.getKey() === e.ENTER && t.tagName.toLowerCase() === 'input' && this.taskEditor.getActiveTab() instanceof Gnt.widget.taskeditor.BaseForm) {
                        this.onOkClick();
                    }
                },
                scope   : this
            });
        }
    },

    onFirstShow : function() {

        if (this.zIndexManager.mask) {
            this.mon(this.zIndexManager.mask, 'click', function() {
                if (this.isVisible()) {
                    this.hide();
                }
            }, this);
        }

    },

    startDataUpdatesMonitoring : function() {
        var me = this,
            okBtn = me.down('#teOkBtn'),
            timerId = true;

        function monitor() {
            if (timerId && okBtn && me.taskEditor) {
                okBtn.setDisabled(!me.taskEditor.isDataChanged() || !me.taskEditor.isDataValid());
                timerId = Ext.Function.defer(monitor, me.monitorDataUpdatesInterval);
            }
        }

        function unmonitor() {
            timerId !== true && clearTimeout(timerId);
            timerId = true;
        }

        if (me.monitorDataUpdates && okBtn) {
            me.on({
                'show'    : monitor,
                'hide'    : unmonitor,
                'destroy' : unmonitor
            });
        }
    },

    // Cancel any ongoing cell editors before hiding
    onBeforeHide : function () {
        Ext.each(this.query('[cancelEdit]'), function (grid) {
            grid.cancelEdit();
        });
    }
});
