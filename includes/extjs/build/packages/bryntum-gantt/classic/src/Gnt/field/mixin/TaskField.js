/**
 * A mixin with common functionality for all fields used to edit {@link Gnt.model.Task} information.
 *
 * Custom field implementation example:
 *
 * ```javascript
 *     Ext.define('MyApp.model.Task', {
 *         extend : 'Gnt.model.Task',
 *
 *         customizableFields : [
 *             // task manager identifier
 *             { name : 'ManagerId', type : 'int' }
 *         ],
 *
 *         managerIdField : 'bigBossId'
 *     });
 *
 *     // drop down list of task managers
 *     Ext.define('MyApp.field.ManagerField', {
 *         extend             : 'Ext.form.field.ComboBox',
 *         mixins             : ['Gnt.field.mixin.TaskField'],
 *
 *         fieldProperty      : 'managerIdField',
 *         setTaskValueMethod : 'setManagerId',
 *         getTaskValueMethod : 'getManagerId',
 *
 *         ...
 *     });
 * ```
 */
Ext.define('Gnt.field.mixin.TaskField', {
    extend : 'Ext.Mixin',

    /**
     * @cfg {String} fieldProperty A task property holding the matching data field name.
     * Task model has special properties for all its fields. Their names look like "xxxField"
     * (for example: {@link Gnt.model.Task#startDateField}, {@link Gnt.model.Task#endDateField}, {@link Gnt.model.Task#durationField} etc.).
     * The properties support comes from extended {@link Sch.model.Customizable} class.
     * Those properties hold real field names that are used for storing the data (and communicating with the server).
     *
     * So this config should be set to the corresponding property name. For example:
     *
     * ```javascript
     *     Ext.define('MyApp.model.Task', {
     *         extend : 'Gnt.model.Task',
     *
     *         customizableFields : [
     *             // task manager identifier
     *             { name : 'ManagerId', type : 'int' }
     *         ],
     *
     *         managerIdField : 'bigBossId'
     *     });
     *
     *     // drop down list of task managers
     *     Ext.define('MyApp.field.ManagerField', {
     *         extend             : 'Ext.form.field.ComboBox',
     *         mixins             : ['Gnt.field.mixin.TaskField'],
     *
     *         fieldProperty      : 'managerIdField',
     *         setTaskValueMethod : 'setManagerId',
     *         getTaskValueMethod : 'getManagerId',
     *
     *         ...
     *     });
     * ```
     */
    fieldProperty           : '',

    /**
     * @cfg {String} getTaskValueMethod Task method name that should be used to get the field value from the task.
     */
    getTaskValueMethod      : '',

    /**
     * @cfg {String} setTaskValueMethod Task method name that should be used to put the field value into the task.
     */
    setTaskValueMethod      : '',

    isTaskField             : true,

    /**
     * @cfg {Gnt.model.Task} task Task being edited. Field will apply all it's value changes directly to this task (if {@link #instantUpdate} is `true`).
     */
    task                    : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore Task store should provided if task being edited is not in any task store yet and thus does not have a calendar.
     * In such case we'll retrieve a calendar from the task store (project calendar).
     */
    taskStore               : null,

    /**
     * @cfg {Number} suppressTaskUpdate A number flag, when greater than 0 prevents task updates.
     */
    suppressTaskUpdate      : 0,

    /**
     * @cfg {Boolean} highlightTaskUpdates When set to `true`, field will highlight itself when its value is changed due to changes in some other field.
     * For example when changing the end date of the task, its duration will change as well and will highlight itself.
     */
    highlightTaskUpdates    : true,

    /**
     * @cfg {String} highlightColor A color to use when highlighting the field. See {@link #highlightTaskUpdates} option.
     */
    highlightColor          : '#009900',

    lastHighlight           : 0,

    /**
     * @cfg {Boolean} instantUpdate Set to `false` to prevent automatic applying changes to the task on each {@link #setValue} call.
     * To apply changes manually one can use {@link #applyChanges} method.
     */
    instantUpdate           : true,

    originalInstantUpdate   : null,

    readOnlyUpdateSuspended : 0,

    mixinConfig             : {

        before  : {
            constructor : 'beforeConstructed',
            destroy     : 'beforeDestroyed'
        },

        after   : {
            constructor : 'afterConstructed'
        }

    },

    selectOnFocus : false,

    getTaskStore : function (task) {
        task = task || this.task;

        return task.getTaskStore(true) || this.taskStore;
    },

    beforeConstructed : function () {
        this.setSuppressTaskUpdate(true);

        // If implementer configures field as readOnly, make sure it stays this way and does not
        if (this.readOnly) this.forceReadOnly = true;
    },


    afterConstructed : function () {
        this.task && this.setTask(this.task);
        this.setSuppressTaskUpdate(false);
    },

    setInstantUpdate : function(value) {
        this.instantUpdate = value;
    },

    beforeDestroyed : function () {
        this.destroyTaskListener();
    },

    /**
     * Binds task to the field.
     * @param {Gnt.model.Task} task Task to bind.
     */
    setTask : function (task) {
        if (!task) return;

        this.settingTask = true;

        this.destroyTaskListener();

        this.updateReadOnly(task);

        this.task = task;

        task.on('taskupdated', this.onTaskUpdateProcess, this);

        // we need calendar to be assigned to task or task should be part of taskStore with
        // assigned calendar, if we dont`t have it lets imitate it by binding task to provided taskStore
        if (!task.getCalendar(true) && !task.getTaskStore(true)) {

            task.taskStore = task.getTaskStore(true) || this.taskStore;

            if (!task.taskStore) throw 'Configuration issue: Gnt.data.taskStore instance should be provided.';
            if (!task.getCalendar(true) && !task.taskStore.getCalendar()) throw 'Configuration issue: Gnt.data.Calendar instance should be provided.';
        }

        this.setSuppressTaskUpdate(true);
        this.onSetTask(task);
        this.setSuppressTaskUpdate(false);
        this.resetOriginalValue();

        this.settingTask = false;
    },


    onSetTask : function (task) {
        task = task || this.task;

        this.setValue(this.getTaskValue(task));
    },


    setSuppressTaskUpdate : function (inc) {
        inc ? this.suppressTaskUpdate++ : this.suppressTaskUpdate--;
    },


    getSuppressTaskUpdate : function () {
        return this.suppressTaskUpdate;
    },


    isReadOnlyUpdateSuspended : function () {
        return this.readOnlyUpdateSuspended;
    },


    suspendReadOnlyUpdate : function () {
        this.readOnlyUpdateSuspended++;
    },


    resumeReadOnlyUpdate : function () {
        if (this.isReadOnlyUpdateSuspended()) this.readOnlyUpdateSuspended--;

        // if readOnly mechanics is no longer suppressed let's update the field readOnly state
        if (!this.readOnlyUpdateSuspended) {
            this.updateReadOnly(this.task);
        }

        return this.readOnlyUpdateSuspended;
    },


    updateReadOnly : function (task) {
        if (this.fieldProperty && !this.disabled && !this.forceReadOnly && !this.isReadOnlyUpdateSuspended()) {
            if (this.editable === false) {
                // let's take into account Task.isEditable() result
                if (!task.isEditable(task[this.fieldProperty])) {
                    this.setReadOnly(true);
                // when editable is false `readOnly` should be set to `true`
                } else {
                    this.setReadOnly(false);
                    if (this.inputEl) this.inputEl.dom.readOnly = true;
                }

            } else {
                // let's take into account Task.isEditable() result
                this.setReadOnly(!task.isEditable(task[this.fieldProperty]));
            }
        }
    },


    onTaskUpdateProcess : function (task, initiator) {
        if (initiator !== this) {
            var prev = this.getValue();

            this.processingTaskUpdate = true;

            // update field editability
            this.updateReadOnly(task);

            this.setSuppressTaskUpdate(true);
            if (this.onTaskUpdate) {
                this.onTaskUpdate(task, initiator);
            } else {
                this.onSetTask(task);
            }
            this.setSuppressTaskUpdate(false);

            if (this.highlightTaskUpdates) {
                var curr    = this.getValue(),
                    isDate  = Ext.isDate(prev);

                if (isDate && (prev - curr !== 0) || (!isDate && String(prev) !== String(curr))) {
                    this.highlightField();
                }
            }

            this.processingTaskUpdate = false;
        }
    },

    highlightField : function (color, options) {
        if (this.rendered && (new Date() - this.lastHighlight > 1000)) {
            this.lastHighlight = new Date();
            this.inputEl.highlight(color || this.highlightColor, options || { attr : 'color' });
        }
    },

    destroyTaskListener : function () {
        if (this.task) {
            this.task.un('taskupdated', this.onTaskUpdateProcess, this);
        }
    },


    callTaskMethod : function (task, method, args) {
        task    = task || this.task;

        return task && task[method].apply(task, args);
    },


    getTaskValue : function (task) {
        return this.callTaskMethod(task, this.getTaskValueMethod, Ext.Array.slice(arguments, 1));
    },

    setTaskValue : function (task) {
        // TODO: HACK: If the task being modified is already in the middle of propagation we cannot start a new propagation process
        // and this happens in ext6 where we have issues w/ uncontrollable "blur" events.
        // (Note: and we assume that "setTaskValueMethod" invokes a propagation (it is true for most of our out-of-the-box fields))
        // The issue is covered by columns/1030_duration.t.js test (and seems fixed in ext > 6.0.1)
        if (task.propagating) return;

        return this.callTaskMethod(task, this.setTaskValueMethod, Ext.Array.slice(arguments, 1));
    },

    /**
     * This method applies the changes from the field to the bound task or to the task provided.
     * If {@link #instantUpdate} option is enabled this method is called automatically after any change in the field.
     *
     * @param {Gnt.model.Task} [toTask] The task to apply the changes to. If not provided, changes will be applied to the last bound task
     * (with {@link #task} config option or {@link #setTask) method)
     */
    applyChanges : function (toTask) {
        toTask = toTask || this.task;

        this.setTaskValue(toTask, this.getValue());

        toTask.fireEvent('taskupdated', toTask, this);
    }

});
