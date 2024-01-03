/**
 * @class Sch.view.AllDayMode
 * @private
 *
 * A special view class for all day scheduler header in week/agenda views
 */
Ext.define('Sch.view.AllDay', {
    extend : 'Sch.view.SchedulerGridView',

    requires : [
        'Sch.view.AllDayMode'
    ],

    allDay              : true,

    eventAnimations     : false,
    horizontalViewClass : 'Sch.view.AllDayMode',

    additionalEventCls  : '',

    repaintEventsForResource : function() {
        this.refreshView();
    },

    generateTplData : function(event, resource, columnIndex) {
        var data, color;

        // We can't rely on resource passed as the parameter here.
        // The given resource will be always a synthetic resource created by AllDayHeader
        // So we are to reobtain the real resource from event here.
        // Since AllDay view is used in calendar only there should be no case when event
        // is assigned to multiple resources.
        // NOTE, the resource could be empty - in such case we fall back to using the dummy resource
        resource = event.getResource() || this.resourceStore.first();

        data = this.callParent([event, resource, columnIndex]);

        data.isCalendarContext = true;

        data.internalCls += ' ' + this.additionalEventCls;

        if (resource) {
            if (Ext.isFunction(resource.getCls) && resource.getCls()) {
                data.internalCls += ' ' + resource.getCls();
            }

            if (Ext.isFunction(resource.getColor) && resource.getColor()) {
                data.style = (data.style || '') + ';background-color: ' + resource.getColor() + ';';
            }
        }

        return data;
    },

    // All day header uses fake Resource store. Sch.mixin.AbstractSchedulerView.setEventStore sets
    // this fake resource store to the Event store. However main Scheduler already set the correct
    // Resource store to the Event store. So this override is required to restore the correct
    // Resource store on the Event store.
    setEventStore : function (eventStore, initial) {
        eventStore = eventStore && Ext.StoreManager.lookup(eventStore);

        var me            = this,
            oldStore      = me.getEventStore(),
            // event store has already correct resource store
            resourceStore = eventStore && eventStore.getResourceStore();

        me.suspendEvents(false);
        me.callParent(arguments);
        me.resumeEvents();

        if (me.eventStore) {
            // restore resourceStore value
            me.eventStore.setResourceStore(resourceStore);

            if (!initial) {
                me.fireEvent('eventstorechange', me, me.eventStore, oldStore);
                me.refreshView();
            }
        }
    }
});
