/**
 * Base class with common functionality for {@link Gnt.widget.taskeditor.TaskForm task} and {@link Gnt.widget.taskeditor.ProjectForm project form}.
 */
Ext.define('Gnt.widget.taskeditor.BaseForm', {

    extend                  : 'Ext.form.Panel',

    mixins                  : [
        'Gnt.mixin.Localizable',
        'Sch.widget.mixin.CustomizableRecordForm',
        'Gnt.widget.taskeditor.mixin.TaskFieldsContainer'
    ],

    isTaskEditorForm        : true,

    /**
     * @cfg {Boolean} highlightTaskUpdates `true` to highlight fields updates initiated by changes of another fields.
     */
    highlightTaskUpdates    : true,

    /**
     * @cfg {Gnt.model.Task} task A task to load to the form.
     */
    /**
     * @property {Gnt.model.Task} task The task loaded in the form.
     */
    task                    : null,

    /**
     * @cfg {Gnt.model.Task} taskBuffer A task used to keep intermediate values of fields implemented by {@link Gnt.field.mixin.TaskField} mixin.
     */
    /**
     * @property {Gnt.model.Task} taskBuffer A task used to keep intermediate values of fields implemented by {@link Gnt.field.mixin.TaskField} mixin.
     */
    taskBuffer              : null,

    /**
     * @cfg {Gnt.data.TaskStore} taskStore A store with tasks.
     *
     * **Note:** This is required option if task being loaded isn't yet belong to any task store.
     */
    taskStore               : null,

    taskListeners           : null,

    autoScroll              : true,

    labelWidth              : (Ext.theme && Ext.theme.name.match('Graphite|Material') ? 180 : 130),

    padding                 : 10,

    propagateChanges        : false,

    border                  : false,
    defaultType             : 'textfield',

    // to reset dirty flags on every record load
    trackResetOnLoad        : true,

    autofillStandaloneFields : false,

    initComponent : function () {
        this.defaults = this.defaults || {};

        this.defaults.labelWidth = this.defaults.labelWidth || this.labelWidth;

        // if no field definitions provided we make the default fields set
        if (!this.items) {
            this.buildFields();
        }

        this.callParent(arguments);

        this.addBodyCls('gnt-taskeditor-form');

        if (this.task) {
            this.loadRecord(this.task, this.taskBuffer);
        }
    },

    /**
     * Suppress task updates invoking by form fields. Calls setSuppressTaskUpdate() of each field that supports this method.
     * @param {Boolean} state Suppress or allow task updating.
     */
    setSuppressTaskUpdate : function (state) {
        var fields  = this.getForm().getFields();

        fields.each(function (field) {
            // if field contains setTask() method
            field.setSuppressTaskUpdate && field.setSuppressTaskUpdate(state);
        });
    },

    isDataChanged : function() {
        return this.isDirty();
    },


    buildTaskBuffer : function (task) {
        var me  = this;

        me.taskBuffer             = task.copy();
        // since copy() doesn't copy taskStore let`s copy it ourself
        me.taskBuffer.taskStore   = task.taskStore;
    },


    /**
     * Loads an Gnt.model.Task into this form.
     * @param {Gnt.model.Task} task The record to edit.
     * @param {Gnt.model.Task} [taskBuffer] The record to be used as a buffer to keep changed values of fields which implement {@link Gnt.field.mixin.TaskField}
     * mixin interface. This parameter can be used in case when you want to implement two form instances instantly
     * reflecting changes of each other:
     *
     *      // create 1st TaskForm instance
     *      var taskForm = Ext.create('Gnt.widget.taskeditor.TaskForm');
     *      // load record into 1st form
     *      taskForm.loadRecord(someTask);
     *
     *      // create 2nd TaskForm instance
     *      var anotherForm = Ext.create('Gnt.widget.taskeditor.TaskForm');
     *      // load the same record into 2nd form
     *      // and set to share taskBuffer with 1st form to immediately refect changes of each other
     *      anotherForm.loadRecord(someTask, taskForm.taskBuffer);
     */
    loadRecord : function (task, taskBuffer) {
        var me          = this;

        me.task         = task;
        me.taskBuffer   = taskBuffer;

        // if no pre-created taskBuffer provided, let`s create it
        if (!me.taskBuffer) {
            me.buildTaskBuffer(task);
        }

        // destroy previous task listeners if any
        me.taskListeners && me.taskListeners.destroy();

        // listen to 'taskupdated' event and update fields "readonly" state
        me.taskListeners = me.mon(me.taskBuffer, {
            taskupdated : me.onTaskUpdated,
            destroyable : true,
            scope       : me
        });

        var form        = me.getForm();

        // following code is modified implementation
        // of Ext.form.Basic setValues() method
        form._record    = task;

        this.suspendLayouts();

        var data = task.getData();

        form.getFields().each(function (field) {
            var fieldName = field.getName();

            // if the record has a field w/ this name
            if (fieldName && task.getField(fieldName)) {
                // if field contains setTask() method
                // we use it since setTask() execute setValue()
                if (field.setTask) {
                    field.setTask(me.taskBuffer);
                } else {
                    // set field value
                    field.setValue(data[field.getName()]);
                }

                // and set its readOnly state depending on gantt readOnly state and task.isEditable() result
                me.updateFieldReadOnly(field);

                if (form.trackResetOnLoad) {
                    field.resetOriginalValue();
                }
            }
        });

        this.resumeLayouts(true);

        this.fireEvent('afterloadrecord', this, task);
    },


    updateFieldReadOnly : function (field) {
        var me = this;

        if (!field.disabled) {

            // Having forceReadOnly=true on a field disables TaskField and BaseForm logic that switches the field readOnly state
            // depending on the task being edited isEditable() result or the form readOnly state
            if (!field.forceReadOnly) {

                var isTaskField = field.isTaskField;

                // if the form is readOnly
                if (me.getReadOnly()) {
                    // we set the field readOnly too
                    field.setReadOnly(true);
                    // if it's a TaskField we suspend its own readOnly mechanism to prevent it from enabling the field back
                    isTaskField && !field.isReadOnlyUpdateSuspended() && field.suspendReadOnlyUpdate();

                // if the form is editable
                } else {
                    // if it's not a TaskField we take the task.isEditable() result into account
                    if (!isTaskField) {
                        var isEditable = me.taskBuffer.isEditable(field.name);

                        if (this.editable === false) {
                            if (isEditable && field.inputEl) {
                                field.inputEl.dom.readOnly = true;
                            }
                        }

                        field.setReadOnly(!isEditable);

                    } else {
                        field.resumeReadOnlyUpdate();
                        field.updateReadOnly(me.taskBuffer);
                    }
                }

            }
        }
    },


    // Updates readOnly state of all the form fields
    updateReadOnly : function () {
        var me      = this,
            form    = me.getForm();

        form.getFields().each(function (field) {
            me.updateFieldReadOnly(field);
        });
    },


    /**
     * Applies the values from this form into the passed {@link Gnt.model.Task} object.
     * If the task is not specified, it will attempt to update (if it exists) the record provided to {@link #loadRecord}.
     * @param {Gnt.model.Task} [task] The record to apply change to.
     */
    updateRecord : function (task) {
        var me = this;

        task = task || me.task;

        if (task && me.fireEvent('beforeupdaterecord', me, task, me.updateRecordFn) !== false) {

            var changerFn = function () {
                me.setSuppressTaskUpdate(true);

                me.updateRecordFn.call(me, task);

                me.setSuppressTaskUpdate(false);
                me.fireEvent('afterupdaterecord', me, task);

                return true;
            };

            if (me.propagateChanges) {
                task.propagateChanges(changerFn);
            } else {
                changerFn();
            }

            return true;
        }

        return false;
    },

    /**
     * A function that applies changes to the task. Override this function for custom logic.
     * @param task
     */
    updateRecordFn : function (task) {
        var me = this;

        task.set(me.getTaskUpdateData(task, me.taskBuffer));
    },


    // Applies "task", "taskStore", "highlightTaskUpdates" and "readOnly" configs to a field
    initFieldDefinition : function (field, cfg) {
        var me              = this;

        var commonParams    = {
            taskStore               : me.taskStore,
            task                    : me.task,
            highlightTaskUpdates    : me.highlightTaskUpdates
        };

        // if field isn't already read only then let's take into account Task.isEditable() result
        if (!field.readOnly && me.task) {
            commonParams.readOnly   = !me.task.isEditable(field.name);
        }

        return Ext.apply(field, commonParams, cfg);
    },


    // Gets the task field value
    getTaskFieldValue : function (field) {
        var me      = this,
            task    = this.task;

        return task ? task.get(me.customizableFieldNames[field]) : '';
    },


    onTaskUpdated : function (task, field) {
        // let's update fields "readonly" status after task data has been modified
        this.updateReadOnly();
    },


    getReadOnly : function () {
        return this.readOnly;
    },


    setReadOnly : function (readOnly) {
        this.readOnly = readOnly;

        this.updateReadOnly();
    }

});
