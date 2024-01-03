/**
@class Sch.data.EventStore
@extends Ext.data.Store
@mixins Sch.data.mixin.EventStore
@mixins Sch.data.mixin.RecurringEvents

This is a class holding all the {@link Sch.model.Event events} to be rendered into a {@link Sch.SchedulerPanel scheduler panel}.
This class only accepts a model class inheriting from {@link Sch.model.Event}.
*/
Ext.define("Sch.data.EventStore", {
    extend      : 'Ext.data.Store',
    alias       : 'store.eventstore',

    mixins      : [
        'Sch.data.mixin.UniversalModelGetter',
        'Sch.data.mixin.CacheHintHelper',
        'Sch.data.mixin.EventStore',
        'Robo.data.Store',
        'Sch.data.mixin.RecurringEvents'
    ],

    storeId     : 'events',
    model       : 'Sch.model.Event',
    config      : { model : 'Sch.model.Event' },

    constructor : function(config) {
        var me = this;

        me.callParent([config]);

        me.resourceStore   && me.setResourceStore(me.resourceStore);
        me.assignmentStore && me.setAssignmentStore(me.assignmentStore);

        if (me.getModel() !== Sch.model.Event && !(me.getModel().prototype instanceof Sch.model.Event)) {
            throw 'The model for the EventStore must subclass Sch.model.Event';
        }

        me.setupRecurringEvents();
    },

    /**
     * Appends a new record to the store
     * @param {Sch.model.Event} record The record to append to the store
     */
    append : function(record) {
        this.add(record);
    }
});
