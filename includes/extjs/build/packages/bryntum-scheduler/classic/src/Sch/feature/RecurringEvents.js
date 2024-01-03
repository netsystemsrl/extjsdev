/**
 * @private
 * A class that adds recurring events functionality to a scheduler panel.
 *
 * The main purpose of the class is generating occurrences of the repeating events for the visible timespan.
 * To achieve this it tracks changes on the {@link #getEventStore event store} to apply a repeating event changes
 * to its visible occurrences.
 * The feature also tracks the panel visible timespan changes to make sure the new timespan is populated
 * with corresponding event occurrences.
 *
 * Additionally the class implements displaying of a {@link Sch.widget.RecurrenceConfirmation special confirmation}
 * on user mouse actions (the panel view {@link Sch.mixin.SchedulerView#beforeeventdropfinalize beforeeventdropfinalize},
 * {@link Sch.mixin.SchedulerView#beforeeventresizefinalize beforeeventresizefinalize} events) involving repeating events.

 * You don't need to instantiate this class normally since the scheduler
 * does it automatically (see {@link Sch.mixin.SchedulerPanel#recurringEvents recurringEvents} for details).
 */
Ext.define('Sch.feature.RecurringEvents', {

    alias              : 'feature.scheduler_recurring_events',

    requires           : ['Sch.widget.RecurrenceConfirmation'],

    mixins             : ['Ext.util.Observable'],

    panelCls           : 'sch-recurringevents',

    eventStoreDetacher : null,
    timeAxisDetacher   : null,
    panelDetacher      : null,
    viewDetacher       : null,

    /**
     * Scheduler panel to add the feature to.
     * @cfg {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree}
     */
    panel              : null,
    /**
     * Event store to attach the feature to.
     * By default you don't need to provide the config since the store is taken from the {@link #panel}.
     * @cfg {Sch.data.EventStore} [eventStore]
     */
    eventStore         : null,
    timeAxis           : null,

    trackingSuspended  : 0,

    constructor : function (cfg) {
        cfg = cfg || {};

        this.mixins.observable.constructor.call(this);

        if (cfg.panel) {
            this.init(cfg.panel);
        }
    },

    init : function (panel) {
        this.setPanel(panel);
    },

    /**
     * Sets the scheduler panel to add the feature to.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} panel Scheduler panel.
     */
    setPanel : function (panel) {
        var me = this;

        me.panel = panel;

        me.bindPanel(panel);

        me.setEventStore(panel && panel.getEventStore());
    },

    startTracking : function () {
        var me    = this,
            panel = me.panel;

        if (panel) {
            me.setView(me.getView(panel));
            me.setTimeAxis(panel.getTimeAxis && panel.getTimeAxis());
            me.refreshOccurrences();

            panel.addCls(me.panelCls);
        } else {
            me.stopTracking();
        }
    },

    stopTracking : function () {
        var me    = this,
            panel = me.panel;

        me.setView();
        me.setTimeAxis();

        panel && panel.removeCls(me.panelCls);
    },

    /**
     * Returns the scheduler panel associated with the feature.
     * @return {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} Scheduler panel to add the recurring events functionality to.
     */
    getPanel : function () {
        return this.panel;
    },

    getView : function (panel) {
        panel = panel || this.panel;

        return panel && panel.getSchedulingView();
    },

    setView : function (view) {
        if (view) {
            if (view.viewReady) {
                this.bindView(view);
            } else {
                this.mon(view, {
                    'viewready' : this.onViewReady,
                    single      : true,
                    scope       : this
                });
            }
        } else {
            this.bindView();
        }
    },

    /**
     * @protected
     * Setups event listeners to the provided scheduler panel or destroys existing listeners if no panel provided.
     * The method is called as part of {@link #setPanel} call.
     * Override this to setup custom event listeners to the associated panel.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} [panel] Panel to listen to. Provide `null` or skip the
     * argument to remove the current listeners.
     */
    bindPanel : function (panel) {
        this.panelDetacher && this.panelDetacher.destroy();

        if (panel) {
            this.mon(panel, {
                'eventstorechange' : this.onPanelEventStoreChange,
                'destroy'          : this.onPanelDestroy,
                scope              : this
            });
        }
    },

    onPanelDestroy : function () {
        this.setPanel();
    },

    onViewReady : function (view) {
        this.bindView(view);
    },

    bindView : function (view) {
        var me = this;

        me.viewDetacher && me.viewDetacher.destroy();

        if (view) {
            me.viewDetacher = me.mon(view, {
                'beforeeventdropfinalize'   : me.onBeforeEventDropFinalize,
                'beforeeventresizefinalize' : me.onBeforeEventResizeFinalize,
                destroyable : true,
                scope       : me,
                priority    : -100
            });
        }
    },

    /**
     * Sets the event store associated with the feature. By default the event store is taken from the {@link #panel}
     * (this method is called inside of {@link #setPanel} method).
     * @param {Sch.data.EventStore} eventStore Event store.
     */
    setEventStore : function (eventStore) {
        var me          = this,
            isSupported = eventStore && eventStore.isRecurringEventStore;

        // the feature supports only event stores having Sch.data.mixin.RecurringEvents mixed in
        eventStore = isSupported ? eventStore : null;

        me.eventStore = eventStore;
        me.bindEventStore(eventStore);

        me[isSupported ? 'startTracking' : 'stopTracking']();
    },

    /**
     * Returns the event store associated with the feature.
     * @return {Sch.data.EventStore} Event store.
     */
    getEventStore : function () {
        return this.eventStore;
    },

    /**
     * @protected
     * Setups event listeners to the provided event store or destroys existing listeners if no store provided.
     * The method is called inside of {@link #setEventStore} method
     * (which in turn is called inside of {@link #setPanel} method).
     * Override this to setup custom event listeners to the associated event store.
     * @param {Sch.data.EventStore} [eventStore] Event store to listen to. Provide `null` or skip the
     * argument to remove the current listeners.
     */
    bindEventStore : function (eventStore) {
        this.eventStoreDetacher && this.eventStoreDetacher.destroy();

        if (eventStore) {
            this.eventStoreDetacher = this.mon(eventStore, {
                'load'                                 : this.onEventsLoaded,
                'add'                                  : this.onEventAdd,
                'update'                               : this.onEventUpdate,
                'remove'                               : this.onEventRemove,
                'generate-occurrences-start'           : this.onGenerateOccurrencesStart,
                'generate-occurrences-end'             : this.onGenerateOccurrencesEnd,
                'delayed-regenerate-occurrences-start' : this.onDelayedRegenerateOccurrencesStart,
                'delayed-regenerate-occurrences-end'   : this.onDelayedRegenerateOccurrencesEnd,

                scope       : this,
                destroyable : true
            });
        }
    },

    setTimeAxis : function (timeAxis) {
        this.timeAxis = timeAxis;
        this.bindTimeAxis(timeAxis);
    },

    getTimeAxis : function () {
        return this.timeAxis;
    },

    getStartDate : function () {
        return this.getTimeAxis() && this.getTimeAxis().getStart();
    },

    getEndDate : function () {
        return this.getTimeAxis() && this.getTimeAxis().getEnd();
    },

    bindTimeAxis : function (timeAxis) {
        this.timeAxisDetacher && this.timeAxisDetacher.destroy();

        if (timeAxis) {
            this.timeAxisDetacher = this.mon(timeAxis, {
                'reconfigure' : this.onTimeAxisReconfigure,

                scope         : this,
                destroyable   : true
            });
        }
    },

    onDelayedRegenerateOccurrencesStart : function () {
        var view = this.getView();

        if (view && view.getMode() == 'horizontal') {
            // remember "fadeOutRemoval" state
            this._fadeOutRemoval = view.horizontal.fadeOutRemoval;

            // Since we are going to add & remove events massively we disable "fade out" effect
            view.horizontal.fadeOutRemoval = false;
        }
    },

    onDelayedRegenerateOccurrencesEnd : function () {
        var view = this.getView();

        if (view && view.getMode() == 'horizontal') {
            // enable "fade out" effect back
            view.horizontal.fadeOutRemoval = this._fadeOutRemoval;
        }
    },

    onGenerateOccurrencesStart : function (eventStore, events, startDate, endDate) {
        this.suspendTracking();
    },

    onGenerateOccurrencesEnd : function (eventStore, events, occurrences, startDate, endDate) {
        this.resumeTracking();
    },

    refreshOccurrences : function () {
        var eventStore = this.getEventStore(),
            startDate  = this.getStartDate(),
            endDate    = this.getEndDate();

        if (eventStore && startDate && endDate) {
            // TODO: cleanup previous range (this can be tricky need to know that the range is not used by some other view)?
            eventStore.generateOccurrencesForEventsBuffered(eventStore.getRecurringEvents(), startDate, endDate);
        }
    },

    onPanelEventStoreChange : function (panel, eventStore) {
        this.setEventStore(eventStore);
    },

    onTimeAxisReconfigure : function () {
        if (!this.isTrackingSuspended()) {
            this.refreshOccurrences();
        }
    },

    onEventsLoaded : function (eventStore, events, successful) {
        if (successful && !this.isTrackingSuspended()) {
            events = Ext.Array.filter(events, function (event) { return event.isRecurring(); });

            if (events.length) {
                // schedule event occurrences generation
                eventStore.generateOccurrencesForEventsBuffered(events, this.getStartDate(), this.getEndDate());
            }
        }
    },

    onEventAdd : function (eventStore, events) {
        if (!this.isTrackingSuspended()) {
            events = Ext.Array.filter(events, function (event) { return event.isRecurring(); });

            if (events.length) {
                // schedule event occurrences generation
                eventStore.generateOccurrencesForEventsBuffered(events, this.getStartDate(), this.getEndDate());
            }
        }
    },

    onEventUpdate : function (eventStore, event, operation, modifiedFieldNames) {
        if (operation == 'edit' && !this.isTrackingSuspended() && this.isRecurrenceRelatedFieldChange(event, modifiedFieldNames)) {

            var startDate      = this.getStartDate(),
                endDate        = this.getEndDate(),
                eventStartDate = event.getStartDate(),
                recurrence     = event.getRecurrence();

            // the event is no longer recurring
            if (!recurrence) {
                eventStore.removeOccurrencesForEvents(event);

            // If we have start & end dates and the recurrence intersects the range
            } else if (startDate && endDate && eventStartDate && (!recurrence.getEndDate() || (recurrence.getEndDate() >= startDate && eventStartDate <= endDate))) {
                // schedule event occurrences regeneration
                eventStore.regenerateOccurrencesForEventsBuffered(event, startDate, endDate);
            }
        }
    },

    onEventRemove : function (eventStore, events) {
        if (!this.isTrackingSuspended()) {
            events = Ext.Array.filter(events, function (event) { return event.isRecurring(); });

            if (events.length) {
                eventStore.removeOccurrencesForEvents(events);
            }
        }
    },

    /**
     * @protected
     * The method restricts which field modifications should trigger event occurrences rebuilding.
     * By default any field change of a recurring event causes the rebuilding.
     * @param  {Sch.model.Event} event The modified event.
     * @param  {String[]} modifiedFieldNames Array of changed field names.
     * @return {Boolean} `True` if the fields modification should trigger the event occurrences rebuilding.
     */
    isRecurrenceRelatedFieldChange : function (event, modifiedFieldNames) {
        return event.isRecurring() || Ext.Array.contains(modifiedFieldNames, event.recurrenceRuleField);
    },

    isTrackingSuspended : function () {
        return this.trackingSuspended;
    },

    suspendTracking : function () {
        this.trackingSuspended++;
    },

    resumeTracking : function () {
        this.trackingSuspended--;
    },

    onBeforeEventDropFinalize : function (schedulingView, dragContext, e, continueFn, cancelFn) {
        // TODO support multi event draggable case
        var event = dragContext.draggedRecords[0];

        if (event.isRecurrableEvent && (event.isRecurring() || event.isOccurrence())) {
            Sch.widget.RecurrenceConfirmation.show({
                actionType    : 'update',
                eventRecord   : event,
                changerFn     : continueFn,
                cancelHandler : cancelFn
            });

            return false;
        }
    },

    onBeforeEventResizeFinalize : function (view, resizeContext, e, continueFn, cancelFn) {
        var event = resizeContext.eventRecord;

        if (event.isRecurrableEvent && (event.isRecurring() || event.isOccurrence())) {
            Sch.widget.RecurrenceConfirmation.show({
                actionType    : 'update',
                eventRecord   : event,
                changerFn     : continueFn,
                cancelHandler : cancelFn
            });

            return false;
        }
    }
});
