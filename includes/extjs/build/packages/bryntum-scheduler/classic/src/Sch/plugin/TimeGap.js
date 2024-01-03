/**
@class Sch.plugin.TimeGap
@extends Sch.plugin.Zones

Plugin (ptype = 'scheduler_timegap') for highlighting unallocated slots of time for all resources. You can use the {@link #getZoneCls} method to customize the CSS class of the "gaps".

{@img scheduler/images/plugin-timegap.png}

To add this plugin to scheduler:


    var scheduler = Ext.create('Sch.panel.SchedulerGrid', {
        ...

        resourceStore   : resourceStore,
        eventStore      : eventStore,

        plugins         : [
            Ext.create('Sch.plugin.TimeGap', {

                getZoneCls : function (startDate, endDate) {
                    return 'myGapCls'
                }
            })
        ]
    });

*/
Ext.define("Sch.plugin.TimeGap", {
    extend : "Sch.plugin.Zones",
    alias  : "plugin.scheduler_timegap",

    requires : [
        'Ext.data.JsonStore',
        'Sch.model.Range'
    ],

    /**
     * @cfg {Ext.data.Store} store
     * @hide
     */

    /**
     * @template
     * An empty function by default, but provided so that you can return a custom CSS class for each unallocated zone area
     * @param {Date} start The start date of the unallocated time slot
     * @param {Date} end The end date of the unallocated time slot
     * @return {String} The CSS class to be applied to the zone element
     */
    getZoneCls : Ext.emptyFn,

    eventStoreListeners : null,

    init : function (scheduler) {

        this.store = new Ext.data.JsonStore({
            autoDestroy : true,
            model       : 'Sch.model.Range'
        });

        this.scheduler = scheduler;

        this.setEventStore(scheduler.getEventStore());

        scheduler.on({
            afterrender         : this.populateStore,
            eventstorechange    : function(sched, newStore) {
                this.setEventStore(newStore);

                this.populateStore();
            },
            scope       : this
        });

        this.schedulerView = scheduler.getSchedulingView();

        this.callParent(arguments);
    },

    setEventStore : function(eventStore) {
        this.eventStoreListeners && this.eventStoreListeners.destroy();

        this.eventStoreListeners = this.mon(eventStore, {
            load        : this.populateStore,
            update      : this.populateStore,
            remove      : this.populateStore,
            add         : this.populateStore,
            datachanged : this.populateStore,
            destroyable : true,
            scope       : this
        });
    },

    populateStore : function (eventStore) {
        var eventsInView = this.schedulerView.getEventsInView(),
            timeGaps     = [],
            viewStart    = this.scheduler.getStart(),
            viewEnd      = this.scheduler.getEnd(),
            l            = eventsInView.getCount(),
            cursor       = viewStart,
            index        = 0,
            eventStart,
            r;

        // Sort by start time
        eventsInView.sortBy(function (r1, r2) {
            return r1.getStartDate() - r2.getStartDate();
        });

        r = eventsInView.getAt(0);

        while (cursor < viewEnd && index < l) {
            eventStart = r.getStartDate();

            if (!Sch.util.Date.betweenLesser(cursor, eventStart, r.getEndDate()) && cursor < eventStart) {
                timeGaps.push(new this.store.model({
                    StartDate : cursor,
                    EndDate   : eventStart,
                    Cls       : this.getZoneCls(cursor, eventStart) || ''
                }));
            }
            cursor = Sch.util.Date.max(r.getEndDate(), cursor);
            index++;
            r      = eventsInView.getAt(index);
        }

        // Check if there's a gap between last cursor and view end time
        if (cursor < viewEnd) {
            timeGaps.push({
                StartDate : cursor,
                EndDate   : viewEnd,
                Cls       : this.getZoneCls(cursor, viewEnd) || ''
            });
        }

        // Don't refresh twice, the add will cause the zones to redraw
        this.store.removeAll(timeGaps.length > 0);
        this.store.add(timeGaps);
    }
});
