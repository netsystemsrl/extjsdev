/**
 * A specialized base class used for task fields of `Date` type.
 */
Ext.define('Gnt.field.Date', {
    extend   : 'Ext.form.field.Date',
    mixins   : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],
    requires : ['Gnt.widget.DatePickerWithDateHighlighting'],

    /**
     * @cfg {Boolean} adjustMilestones
     * If `true`, the start/end dates of the milestones will be adjusted -1 day *during rendering and editing*.
     * The task model will still hold the raw unmodified date.
     *
     * **Note:** No adjustments will be applied if {@link Gnt.panel.Gantt#disableDateAdjustments} is set to `true`.
     */
    adjustMilestones : true,

    /**
     * @cfg {Boolean} keepDuration Pass `true` to keep the duration of the task ("move" the task), `false` to change the duration ("resize" the task).
     */
    keepDuration     : false,

    reAssertValue    : true,

    validateOnFocusLeave : false,

    /**
     * @cfg {Boolean} keepTime Pass `true` to keep the timepart of the passed date value.
     * Works only if the field format does not contain hours info (so a user is not able to edit time part of the field value).
     */
    keepTime         : true,

    // @OVERRIDE
    onExpand : function () {
        var value = this.valueToVisible(this.getValue());

        this._expanding = false;

        if (!this.isValid()) {
            value = this.getRawValue();
            if (value) {
                value = Ext.Date.parse(value, this.format);
            }
        }

        this.picker.setValue(Ext.isDate(value) ? value : new Date());
    },

    // @OVERRIDE to allow using our own custom date picker
    createPicker : function () {
        var old = Ext.picker.Date;

        Ext.picker.Date = Gnt.widget.DatePickerWithDateHighlighting;

        var retVal = this.callParent(arguments);

        Ext.picker.Date = old;

        return retVal;
    },

    applyKeptTimeToValue : function (value) {

        if (this.keepTime && !Ext.Date.formatContainsHourInfo(this.format)) {
            this.applyTimeToValue(value, this.getTaskValue());
        }

        return value;
    },


    applyTimeToValue : function (value, time) {

        time    = time || this.getTaskValue();

        if (Ext.isDate(value) && time) {
            value.setHours(time.getHours());
            value.setMinutes(time.getMinutes());
        }

        return value;
    },


    // @OVERRIDE
    onSelect : function (picker, pickerDate) {
        var me              = this;
        // if we display the date with hours, then we (probably) want to keep the task end date's hour/minutes
        // after selecting the date from the picker. In the same time picker will clear the time portion
        // so we need to restore it from original date
        // see also: https://www.bryntum.com/forum/viewtopic.php?f=9&t=4294
        if (this.keepTime || Ext.Date.formatContainsHourInfo(this.format)) {
            me.applyTimeToValue(pickerDate, this.getTaskValue());
        }

        var oldValue    = me.getValue();
        var newValue    = this.visibleToValue(pickerDate);
        var rawValue    = Ext.Date.format(pickerDate, this.format);

        if (oldValue != newValue) {
            if (this.getErrors(rawValue).length > 0) {
                me.setRawValue(rawValue);
                me.onTabOut(picker);
                me.validate();
            } else {
                me.setValue(newValue, true);
                me.fireEvent('select', me, newValue);
                me.onTabOut(picker);
            }
        }
    },

    // @OVERRIDE
    /**
     * Sets the value of the field.
     *
     * **Note**, that this method accept the actual date value, as it is stored in the data model.
     * The displayed value can be different, when editing milestones.
     *
     * @param {Date} value New value of the field.
     */
    setValue : function (value, forceUpdate) {
        // Field looses focus when picker is expanded. We need to prevent setValue calls in case
        // they are originated from expanding picker.
        if (this._expanding) return;

        this.callParent([ value ]);

        var task        = this.task;

        if (!this.readOnly && (forceUpdate || this.instantUpdate) && !this.getSuppressTaskUpdate() && task &&
            // in 6.5.3 there is a new 'validateOnFocusLeave' config which conflicts with validate on blur, used in 6.5.2
            task.taskStore && (value || this.allowBlank) && (!(this.validateOnBlur || this.validateOnFocusLeave) || this.isValid())) {
            // apply changes to task
            this.applyChanges();

            // potentially value can be changed during set model call
            // so let`s check it after call and set final value again
            if (this.reAssertValue) {
                var taskValue = this.getTaskValue();

                if (taskValue - this.getValue() !== 0) {
                    this.callParent([taskValue]);
                }
            }

            task.fireEvent('taskupdated', task, this);
        }
    },

    // @OVERRIDE
    rawToValue : function (rawValue) {
        if (!rawValue) return null;

        var parsedDate = this.applyKeptTimeToValue(this.parseDate(rawValue));

        return this.visibleToValue(parsedDate) || rawValue || null;
    },

    // @OVERRIDE
    valueToRaw : function (value) {
        if (!value) return value;

        return Ext.Date.format(this.valueToVisible(value), this.format);
    },

    /**
     * Returns the value of the field.
     *
     * **Note**, that this method returns the actual end date value, as it is stored in the data model.
     * The displayed value can be different, when date does not contain time information or when editing milestones.
     *
     * @return {Date}
     */
    getValue : function () {
        return Ext.isEmpty(this.value) ? null : this.value;
    },

    visibleToValue : function () {
        throw 'Abstract visibleToValue method called';
    },

    valueToVisible : function () {
        throw 'Abstract valueToVisible method called';
    },

    /*
     * We overrode 'getValue' method and broke default 'checkChange' method.
     * This fix is required for validation on-the-fly (as user type).
     * https://www.assembla.com/spaces/bryntum/tickets/1361
     */
    checkChange: function() {
        if (!this.suspendCheckChange) {
            var me = this,
            // we use raw value since 'getValue' method doesn't fire this goal after override
                newVal = me.rawToValue((me.inputEl ? me.inputEl.getValue() : Ext.valueFrom(me.rawValue, ''))),
                oldVal = me.lastValue;

            if (!me.isEqual(newVal, oldVal) && !me.isDestroyed) {
                me.lastValue = newVal;
                me.fireEvent('change', me, newVal, oldVal);
                me.onChange(newVal, oldVal);
            }
        }
    },

    // @private
    // it's called in editor.completeEdit()
    assertValue : function () {
        var me          = this,
            oldRaw      = me.rawValue,
            newRaw      = me.getRawValue(),
            oldValue    = me.getValue(),
            newValue    = me.rawToValue(newRaw),//this can be wrong value should be set
            focusTask   = me.focusTask;

        if (focusTask) {
            focusTask.cancel();
        }

        // AND changed to OR because raw values check always return false and values check seem to be enough
        if ((oldRaw != newRaw) || (newValue - oldValue !== 0)) {
            // set value only if field is valid
            if (!me.validateOnBlur || me.isValid()) {
                // at this point `setValue` should apply any changes from the field to the task
                // even if `instantUpdate` is disabled
                me.setValue(newValue, true);
            }
        }
    },

    /**
     * This method applies the changes from the field to the bound task or to the task provided as 1st argument.
     * If {@link #instantUpdate} option is enabled this method is called automatically after any change in the field.
     *
     * @param {Gnt.model.Task} [toTask] The task to apply the changes to. If not provided, changes will be applied to the last bound task
     * (with {@link #task} config option or {@link #setTask) method)
     */
    applyChanges : function (toTask) {
        toTask          = toTask || this.task;

        var taskStore   = toTask.getTaskStore(true) || this.taskStore;

        if (this.value) {
            this.setTaskValue(toTask, this.value, this.keepDuration, taskStore.skipWeekendsDuringDragDrop);
        } else {
            this.setTaskValue(toTask, null);
        }
    },

    expand  : function () {
        this._expanding = true;
        this.callParent(arguments);
    },

    // @OVERRIDE
    beforeBlur : function () {
        this.assertValue();
    }

});
