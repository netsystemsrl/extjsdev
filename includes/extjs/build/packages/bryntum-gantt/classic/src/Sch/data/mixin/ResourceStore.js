/**
 * @class Sch.data.mixin.ResourceStore
 * This is a mixin for the ResourceStore functionality. It is consumed by the {@link Sch.data.ResourceStore} class ("usual" store) and {@link Sch.data.ResourceTreeStore} - tree store.
 *
 */
Ext.define("Sch.data.mixin.ResourceStore", {

    eventStore : null,

    /**
     * Returns the associated event store instance.
     *
     * @return {Sch.data.EventStore}
     */
    getEventStore : function () {
        return this.eventStore;
    },

    /**
     * Sets the associated event store instance.
     *
     * @param {Sch.data.EventStore} eventStore
     */
    setEventStore : function (eventStore) {
        var me = this,
            oldStore;

        if (me.eventStore !== eventStore) {
            oldStore      = me.eventStore;
            me.eventStore = eventStore && Ext.StoreMgr.lookup(eventStore) || null;
            /**
             * @event eventstorechange
             * Fires when new event store is set via {@link #setEventStore} method.
             * @param {Sch.data.ResourceStore}   this
             * @param {Sch.data.EventStore|null} newEventStore
             * @param {Sch.data.EventStore|null} oldEventStore
             */
            me.fireEvent('eventstorechange', me, eventStore, oldStore);
        }
    },

    getScheduledEventsInTimeSpan : function (start, end, eventStore) {
        var events = [];
        var DATE   = Sch.util.Date;
        eventStore = eventStore || this.getEventStore();

        Ext.Array.each(this.getRange(), function (resource) {
            Ext.Array.each(eventStore.getEventsForResource(resource), function (event) {
                if (event.intersectsRange(start, end)) {
                    events.push(event);
                }
            });
        });

        return events;
    }
});
