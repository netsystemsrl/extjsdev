/**
 * This mixin class provides recurring events functionality to the {@link Sch.widget.EventEditor event editor} component.
 */
Ext.define("Sch.widget.recurrence.EventEditorMixin", {

    extend : 'Ext.Mixin',

    requires : [
        'Ext.form.field.Hidden',
        'Sch.widget.recurrence.field.RecurrenceComboBox',
        'Sch.widget.recurrence.LegendButton',
        'Sch.widget.recurrence.Dialog',
        'Sch.widget.RecurrenceConfirmation'
    ],

    isRecurrableEventEditor : true,

    /**
     * The recurrence rule field. A hidden field mapped to the event {@link Sch.model.Event#RecurrenceRule recurrence rule} field.
     * @property {Ext.form.field.Hidden} recurrenceRule
     */
    /**
     * The {@link #property-recurrenceRule recurrence rule field} configuration object.
     * @cfg {Object}
     */
    recurrenceRule         : null,
    /**
     * The recurrence combobox field. The field allows to choose if the event should repeat and if yes - how often (every day, week, month or year).
     * @property {Sch.widget.recurrence.field.RecurrenceComboBox} recurrenceCombo
     */
    /**
     * The {@link #property-recurrenceCombo recurrence combobox field} configuration object.
     * @cfg {Object}
     */
    recurrenceCombo        : null,
    /**
     * The recurrence button opening the recurrence dialog. The button text displays the event recurrence settings in a human readable form.
     * @property {Sch.widget.recurrence.LegendButton} recurrenceLegendButton
     */
    /**
     * The {@link #property-recurrenceLegendButton recurrence button} configuration object.
     * @cfg {Object}
     */
    recurrenceLegendButton : null,

    recurrenceDialog : null,

    config : {
        /**
         * Provide `false` to disable recurrence related fields.
         *
         * **Note:** If you want to turn off the recurring events feature completely,
         * please take a look at {@link Sch.panel.SchedulerGrid#recurringEvents Scheduler grid config}
         * @cfg {Boolean}
         */
        recurringEvents : true
    },

    onClassMixedIn : function (targetClass) {
        Ext.override(targetClass, {
            getDefaultFields : function () {
                var result = this.callParent(arguments) || [];
                return result.concat(this.getRecurrableEventDefaultFields());
            },

            getFloatingComponents : function () {
                var result = this.callParent(arguments) || [];
                return result.concat(this.getRecurrableEventFloatingComponents());
            }
        });
    },

    setupRecurrableEventEditorMixin : function (eventEditor) {
        var me = this;

        me.mon(eventEditor, {
            loadevent         : me.onRecurrableEventLoad,
            beforeeventdelete : me.onRecurrableEventBeforeDelete,
            beforeeventsave   : me.onRecurrableEventBeforeSave,
            destroy           : me.onEditorDestroy,
            scope             : eventEditor,
            priority          : -100
        });
    },

    onEditorDestroy : function () {
        this.recurrenceDialog && this.recurrenceDialog.destroy();
    },

    getRecurrableEventDefaultFields : function () {
        var me     = this,
            result = [];

        if (me.recurringEvents !== false) {

            if (!me.recurrenceRule || !me.recurrenceRule.isInstance) {
                me.recurrenceRule = Ext.create(Ext.apply({
                    xtype : 'hiddenfield',
                    name  : me.customizableFieldNames.recurrenceRuleField
                }, me.recurrenceRule));
            }

            if (!me.recurrenceCombo || !me.recurrenceCombo.isInstance) {
                me.recurrenceCombo = Ext.create(Ext.apply({
                    xtype      : 'recurrencecombo',
                    fieldLabel : me.L('Repeat'),
                    value      : [null]
                }, me.recurrenceCombo));

                me.mon(me.recurrenceCombo, 'change', me.onRecurrenceComboChange, me);
            }

            if (!me.recurrenceLegendButton || !me.recurrenceLegendButton.isInstance) {
                me.recurrenceLegendButton = Ext.create(Ext.apply({
                    xtype          : 'recurrencelegendbutton',
                    hideEmptyLabel : false,
                    handler        : me.onRecurrenceLegendClick,
                    scope          : me
                }, me.recurrenceLegendButton));
            }

            result.push(me.recurrenceRule, me.recurrenceCombo, me.recurrenceLegendButton);

            me.recurrenceDialog = Ext.create({
                xtype         : 'recurrencedialog',
                weekStartDay  : me.weekStartDay,
                dateFormat    : me.dateFormat,
                closeAction   : 'hide',
                saveHandler   : me.recurrenceDialogSaveHandler,
                cancelHandler : me.recurrenceDialogCancelHandler,
                scope         : me
            });

            me.startDateField && me.mon(me.startDateField, 'change', me.onRecurrableEventStartDateChange, me);

        }

        return result;
    },

    updateRecurringEvents : function (enabled) {
        var me = this;

        if (enabled) {
            if (me.recurrenceCombo) {
                me.recurrenceCombo.show();
            }

            if (me.recurrenceLegendButton) {
                me.recurrenceLegendButton.show();
            }

        } else {
            if (me.recurrenceCombo) {
                me.recurrenceCombo.hide();
            }

            if (me.recurrenceLegendButton) {
                me.recurrenceLegendButton.hide();
            }
        }
    },

    onRecurrableEventLoad : function (eventEditor, event, readOnly) {
        var me = this;

        me.recurrence = null;

        if (event.isRecurrableEvent && me.getRecurringEvents()) {

            var recurrence = event.isOccurrence() ? event.getRecurringEvent().getRecurrence() : event.getRecurrence();

            if (!event.getRecurrenceRule()) {
                me.recurrenceRule.setValue(null);
            }

            if (me.recurrenceCombo) {
                me.recurrenceCombo.show();
                me.recurrenceCombo.setRecurrence(recurrence);
            }

            if (me.recurrenceLegendButton) {
                me.recurrenceLegendButton.setRecurrence(recurrence);
                if (recurrence) {
                    me.recurrenceLegendButton.show();
                } else {
                    me.recurrenceLegendButton.hide();
                }
            }
        } else {
            me.recurrenceCombo && me.recurrenceCombo.hide();
            me.recurrenceLegendButton && me.recurrenceLegendButton.hide();
        }
    },

    onRecurrableEventBeforeDelete : function (eventEditor, eventRecord, continueFn) {
        var me = this;

        if (eventRecord.isRecurrableEvent && me.getRecurringEvents() && (eventRecord.isRecurring() || eventRecord.isOccurrence())) {
            Sch.widget.RecurrenceConfirmation.show({
                actionType  : 'delete',
                eventRecord : eventRecord,
                changerFn   : continueFn
            });

            return false;
        }
    },

    onRecurrableEventBeforeSave : function (eventEditor, eventRecord, values, continueFn) {
        var me = this;

        if (eventRecord.isRecurrableEvent && me.getRecurringEvents() && (eventRecord.isRecurring() || eventRecord.isOccurrence())) {
            Sch.widget.RecurrenceConfirmation.show({
                actionType  : 'update',
                eventRecord : eventRecord,
                values      : values,
                changerFn   : continueFn
            });

            return false;
        }
    },

    getRecurrableEventFloatingComponents : function () {
        var me     = this,
            result = [];

        result.push(Sch.widget.RecurrenceConfirmation);

        if (me.recurrenceDialog) {
            result.push(me.recurrenceDialog);

            var recurrenceDialogFloatingComponents = me.recurrenceDialog.getFloatingComponents && me.recurrenceDialog.getFloatingComponents();

            if (Ext.isArray(recurrenceDialogFloatingComponents)) {
                result = result.concat(recurrenceDialogFloatingComponents);
            }
        }

        return result;
    },

    onRecurrenceLegendClick : function () {
        this.showRecurrenceDialog();
    },

    makeRecurrence : function (rule) {
        var event      = this.getEventRecord(),
            recurrence = event.getRecurrence(),
            eventCopy  = event.copy(null);

        if (!rule && recurrence) {
            recurrence = recurrence.copy(null);
        } else {
            recurrence = new event.recurrenceModel({ rule : rule });
        }

        // bind cloned recurrence to the cloned event
        recurrence.setEvent(eventCopy);
        // update cloned event w/ start date from the UI field
        eventCopy.setStartDate(this.getStartDateValue());

        recurrence.suspendEventNotifying();

        return recurrence;
    },

    showRecurrenceDialog : function () {
        var event = this.eventRecord;

        if (this.recurrenceDialog && event && event.isRecurrableEvent) {
            this.captureRecurrence();
            this.recurrence = this.recurrence || this.makeRecurrence();
            // update the cloned recurrence w/ up to date start date value
            this.recurrence.getEvent().setStartDate(this.getStartDateValue());
            this.recurrenceDialog.loadRecord(this.recurrence);
            this.recurrenceDialog.show();
        }
    },

    captureRecurrence : function () {
        var rule = this.recurrenceRule.getValue();

        this.capturedRecurrence = rule ? this.makeRecurrence(rule) : null;
    },

    getCapturedRecurrence : function () {
        return this.capturedRecurrence;
    },

    onRecurrenceComboChange : function (field, value) {
        // if we are not loading record
        if (!this.loadingRecord) {
            if (value == field.customValue) {
                // if user picked "Custom" - show recurrence dialog (if we are not in the middle of changes applying)
                if (!this.inOnRecurrenceUpdate) this.showRecurrenceDialog();
            } else {
                this.onRecurrenceUpdate(value && this.makeRecurrence('FREQ=' + value) || null);
            }
        }
    },

    onRecurrenceUpdate : function (recurrence) {
        var me = this;

        if (!me.inOnRecurrenceUpdate) {

            me.inOnRecurrenceUpdate = true;

            // keep recurrence instance
            me.recurrence = recurrence;

            // update recurrence rule field if it's changed as result of user actions
            if (!me.loadingRecord) {
                me.recurrenceRule.setValue(recurrence ? recurrence.getRule() : null);
            }

            // pick corresponding options (frequency/"None" or "Custom") in combobox
            if (me.recurrenceCombo) {
                me.recurrenceCombo.setRecurrence(recurrence);
            }

            // update the recurrence legend
            if (me.recurrenceLegendButton) {
                me.recurrenceLegendButton.setRecurrence(recurrence);
                if (recurrence) {
                    me.recurrenceLegendButton.show();
                } else {
                    me.recurrenceLegendButton.hide();
                }
            }

            me.inOnRecurrenceUpdate = false;
        }
    },

    recurrenceDialogSaveHandler : function (dialog, recurrence) {
        // apply changes to the kept recurrence
        dialog.updateRecord(recurrence);

        // update the recurrence related UI
        this.onRecurrenceUpdate(recurrence);

        dialog.close();
    },

    recurrenceDialogCancelHandler : function (dialog) {
        var recurrence = this.getCapturedRecurrence();

        // update the recurrence related UI
        this.onRecurrenceUpdate(recurrence);

        dialog.close();
    },

    onRecurrableEventStartDateChange : function (field, newValue) {
        if (this.recurrenceLegendButton) {
            if (Ext.isDate(newValue)) this.recurrenceLegendButton.setEventStartDate(newValue);
        }
    }

});
