/**
 * A class implementing a special confirmation dialog showing up before modifying a recurring event or some of its occurrences.
 * For recurring events the dialog notifies user that the event change/removal will cause change/removal of dependent events
 * and asks to confirm the action.
 *
 * {@img scheduler/images/recurrence-confirmation1.png 2x}
 *
 * And for occurrences the dialog allows to choose if user wants to affect all further occurrences, this occurrence only or cancel the change.
 *
 * {@img scheduler/images/recurrence-confirmation2.png 2x}
 *
 * For basic usage {@link Sch.widget.RecurrenceConfirmation} singleton instance can be used and
 * to subclass the one should extend {@link Sch.widget.recurrence.ConfirmationDialog} class.
 *
 * Singleton usage example:
 *
 * ```javascript
 * Sch.widget.RecurrenceConfirmation.show({
 *     eventRecord : event,
 *     actionType  : "delete",
 *     changerFn   : function () {
 *         eventStore.remove(event);
 *     }
 * });
 * ```
 */
Ext.define('Sch.widget.recurrence.ConfirmationDialog', {
    extend    : 'Ext.window.MessageBox',

    alias     : 'widget.recurrenceconfirmationdialog',
    mixins    : ['Sch.mixin.Localizable'],

    dialogCls : 'sch-recurrenceconfirmation',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - 'delete-title'              : 'You’re deleting an event',
     * - 'delete-all-message'        : 'Do you want to delete all occurrences of this event?',
     * - 'delete-further-message'    : 'Do you want to delete this and all future occurrences of this event, or only the selected occurrence?',
     * - 'delete-all-btn-text'       : 'Delete All',
     * - 'delete-further-btn-text'   : 'Delete All Future Events',
     * - 'delete-only-this-btn-text' : 'Delete Only This Event',
     * - 'update-title'              : 'You’re changing a repeating event',
     * - 'update-all-message'        : 'Do you want to change all occurrences of this event?',
     * - 'update-further-message'    : 'Do you want to change only this occurrence of the event, or this and all future occurrences?',
     * - 'update-all-btn-text'       : 'All',
     * - 'update-further-btn-text'   : 'All Future Events',
     * - 'update-only-this-btn-text' : 'Only This Event',
     * - 'Yes'                       : 'Yes',
     * - 'Cancel'                    : 'Cancel'
     */

    /**
     * Displays the confirmation.
     * Example usage:
     *
     * ```javascript
     * Sch.widget.RecurrenceConfirmation.show({
     *     eventRecord : event,
     *     actionType  : "delete",
     *     changerFn   : function () {
     *         eventStore.remove(event);
     *     }
     * });
     * ```
     *
     * @param {Object} cfg The following config options are supported:
     * @param {Sch.model.Event} cfg.eventRecord Event to be modified.
     * @param {String} cfg.actionType Type of modification to be applied to the event. Can be either "update" or "delete".
     * @param {Function} cfg.changerFn
     * A function that should be called to apply the change to the event upon user choice.
     * @param {Function} [cfg.changerFnScope]
     * `changerFn` function scope.
     * @param {Object} [cfg.values] Values to be applied to the event.
     * @param {Function} [cfg.multipleHandler] Function that handles "Further events" button click.
     * @param {Sch.model.Event} cfg.multipleHandler.record Event record.
     * @param {Sch.model.Event} cfg.multipleHandler.values Values to be applied to the event.
     * @param {Sch.model.Event} cfg.multipleHandler.type Change type ("update"/"delete").
     * @param {Sch.model.Event} cfg.multipleHandler.changerFn Function that applies the change.
     * @param {Sch.model.Event} cfg.multipleHandler.scope Function scope.
     * @param {Function} [cfg.singleHandler] Function that handles "Only this event" button click.
     * @param {Sch.model.Event} cfg.singleHandler.record Event record.
     * @param {Sch.model.Event} cfg.singleHandler.values Values to be applied to the event.
     * @param {Sch.model.Event} cfg.singleHandler.type Change type ("update"/"delete").
     * @param {Sch.model.Event} cfg.singleHandler.changerFn Function that applies the change.
     * @param {Sch.model.Event} cfg.singleHandler.scope Function scope.
     * @param {Function} [cfg.cancelHandler] Function that handles "Cancel" button click.
     * @param {Sch.model.Event} cfg.cancelHandler.record Event record.
     * @param {Sch.model.Event} cfg.cancelHandler.values Values to be applied to the event.
     * @param {Sch.model.Event} cfg.cancelHandler.type Change type ("update"/"delete").
     * @param {Sch.model.Event} cfg.cancelHandler.changerFn Function that applies the change.
     * @param {Sch.model.Event} cfg.cancelHandler.scope Function scope.
     * @return {Sch.widget.recurrence.ConfirmationDialog} this
     */
    show : function (cfg) {
        var me = this;

        //<debug>
        if (!cfg || !cfg.actionType || !cfg.eventRecord) {
            throw new Error('actionType and eventRecord must be specified for Sch.widget.recurrence.ConfirmationDialog');
        }
        //</debug>

        cfg.cls = me.dialogCls + (cfg.cls ? ' ' + cfg.cls : '');

        var isMaster = cfg.eventRecord.isRecurring();

        cfg = Ext.apply({
            // the following lines are added to satisfy the 904_unused localization test
            // to let it know that these locales are used:
            // this.L('delete-title') not found
            // this.L('update-title') not found
            title      : me.L(cfg.actionType + '-title'),
            // the following lines are added to satisfy the 904_unused localization test
            // to let it know that these locales are used:
            // this.L('delete-all-message')
            // this.L('delete-further-message')
            // this.L('update-all-message')
            // this.L('update-further-message')
            msg        : me.L(cfg.actionType + (isMaster ? '-all-message' : '-further-message')),
            icon       : Ext.MessageBox.QUESTION,
            scope      : me,
            fn         : me.dispatchHandler,
            buttonText : cfg.buttonText || me.getButtonText(cfg)
        }, cfg);

        return me.callParent([cfg]);
    },

    getButtonText : function (cfg) {
        var me       = this,
            isMaster = cfg.eventRecord.isRecurring();

        var result = {
            // the following lines are added to satisfy the 904_unused localization test
            // to let it know that these locales are used:
            // this.L('delete-all-btn-text')
            // this.L('delete-further-btn-text')
            // this.L('delete-only-this-btn-text')
            // this.L('update-all-btn-text')
            // this.L('update-further-btn-text')
            // this.L('update-only-this-btn-text')
            yes    : me.L(cfg.actionType + (isMaster ? '-all-btn-text' : '-further-btn-text')),
            no     : me.L(cfg.actionType + '-only-this-btn-text'),
            cancel : me.L('Cancel')
        };

        // TODO: so far we remove 'Only this event' option for a recurring event itself untill this case is supported
        if (isMaster) {
            result.yes = me.L('Yes');
            delete result.no;
        }

        return result;
    },

    getButtonHandler : function (btn, text, config) {
        var fn;

        switch (btn) {
            case 'yes' : fn = config.multipleHandler || this.multipleHandler; break;
            case 'no' : fn = config.singleHandler || this.singleHandler; break;
            case 'cancel' : fn = config.cancelHandler || this.cancelHandler; break;
        }

        return fn;
    },

    dispatchHandler : function (btn, text, config) {
        config = config || {};

        var me        = this,
            fn        = me.getButtonHandler(btn, text, config),
            scope     = config.handlerScope || me,
            changerFn = config.changerFn || Ext.emptyFn;

        fn.call(scope, config.eventRecord, config.values, config.actionType, changerFn, config.changerFnScope || me);
    },

    multipleHandler : function (record, values, type, changerFn, scope) {
        var recurringEvent = record.getRecurringEvent(),
            stopDate = new Date(record.getStartDate() - 1);

        // apply changes to the occurrence
        changerFn.call(scope);

        // reset occurrence linkage to the "master" event
        record.setRecurringEventId(null);
        // stop the previous recurrence
        recurringEvent && recurringEvent.getRecurrence().setEndDate(stopDate);
    },

    singleHandler : function (record, values, type, changerFn, scope) {
        var recurringEvent = record.getRecurringEvent(),
            exceptionDate  = record.getStartDate();

        changerFn.call(scope);

        record.beginEdit();
        record.setRecurringEventId(null);
        record.setRecurrence(null);
        record.endEdit();

        recurringEvent.addExceptionDate(exceptionDate);
    },

    cancelHandler : Ext.emptyFn
});
