Ext.define('Gnt.widget.taskeditor.mixin.TaskFieldsContainer', {

    extend : 'Ext.Mixin',

    mixinConfig : {
        id : 'taskFieldsContainer',

        before : {
            loadRecord : 'beforeRecordLoaded',
            loadTask   : 'beforeRecordLoaded'
        },

        after : {
            constructor : 'afterConstructed',
            loadRecord  : 'afterRecordLoaded',
            loadTask    : 'afterRecordLoaded'
        }
    },

    /**
     * @cfg {String[]} notUpdatableFields Task fields that should not be updated when applying the form data to the task being edited.
     */
    notUpdatableFields : ['index', 'isLast'],

    autofillStandaloneFields : true,

    isFieldStandalone : function (field) {
        return !field.up('form');
    },

    fillStandaloneFields : function (task) {
        var me     = this,
            fields = me.query('field'),
            field, fieldName, modelField;

        for (var i = 0; i < fields.length; i++) {
            field      = fields[i];
            fieldName  = field.name;
            modelField = task.getField(fieldName);

            if (modelField && me.isFieldStandalone(field)) {
                field.setValue(task.get(fieldName));
            }
        }
    },

    getTaskUpdateData : function (targetTask, sourceTask) {
        var me            = this,
            newData       = Ext.apply({}, sourceTask.getProjection(), sourceTask.getData()),
            genericFields = me.query('field[isTaskField!=true]'),
            genericField, fieldName, field;

        // Loop over fields that are not mixed in w/ TaskField class
        // to collect their values
        for (var i = 0; i < genericFields.length; i++) {
            genericField = genericFields[i];
            fieldName    = genericField.name;
            field        = targetTask.getField(fieldName);

            if (field && me.isUpdatebleTaskField(targetTask, fieldName)) {
                newData[fieldName] = genericField.getValue();
            }
        }

        // A special processing for "Segments" field:
        // need to update segments internal reference to their owning task
        var segments = newData[targetTask.segmentsField];
        if (segments) {
            newData[targetTask.segmentsField] = Ext.Array.map(segments, function (segment) {
                // clone segment and provide "task" property targeting the target task
                return segment.copy(segment.getId(), false, { task : targetTask });
            });
        }

        // sanitize taskBuffer data before applying it to the task
        for (fieldName in newData) {
            if (!me.shouldUpdateTaskField(targetTask, fieldName, newData)) {
                delete newData[fieldName];
            }
        }

        return newData;
    },

    isUpdatebleTaskField : function (task, fieldName) {
        return fieldName != task.idProperty && (!this.notUpdatableFields || !Ext.Array.contains(this.notUpdatableFields, fieldName));
    },

    shouldUpdateTaskField : function (task, fieldName, newData) {
        var field = task.getField(fieldName);

        return field && this.isUpdatebleTaskField(task, fieldName) && !field.isEqual(newData[fieldName], task.get(fieldName));
    },

    afterConstructed : function () {
        var fields = this.query('field');

        for (var i = 0; i < fields.length; i++) {
            this.onTaskFieldsContainterItemAdd(this, fields[i]);
        }

        this.on('add', this.onTaskFieldsContainterItemAdd, this);
    },

    onTaskFieldsContainterItemAdd : function (container, item) {
        if (item.isFormField) {
            this.mon(item, 'change', this.onTaskFieldsContainterItemChange, this);
        }
    },

    onTaskFieldsContainterItemChange : function (field, newValue, oldValue) {
        // mark the field w/ manuallyChanged flag if the last change is made after the task is loaded and not caused by other field changes
        field.manuallyChanged = !field.loadingRecord && (field.isTaskField ? !field.processingTaskUpdate && !field.settingTask : true);
    },

    beforeRecordLoaded : function () {
        var fields = this.query('field');

        for (var i = 0; i < fields.length; i++) {
            fields[i].loadingRecord = true;
        }
    },

    afterRecordLoaded : function (task) {
        if (this.autofillStandaloneFields) {
            this.fillStandaloneFields(task);
        }

        var fields = this.query('field');

        for (var i = 0; i < fields.length; i++) {
            fields[i].loadingRecord = false;
        }
    }

});