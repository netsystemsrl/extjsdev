/**
@class Gnt.data.ResourceStore
@extends Sch.data.ResourceStore

A class representing the collection of the resources - {@link Gnt.model.Resource} records.

*/

Ext.define('Gnt.data.ResourceStore', {
    requires    : [
        'Gnt.model.Resource'
    ],

    mixins      : ['Gnt.data.mixin.ResourceStore'],

    extend      : 'Sch.data.ResourceStore',

    storeId     : 'resources',
    model       : 'Gnt.model.Resource',
    alias       : 'store.gantt_resourcestore'

    /**
     * @property {Gnt.data.TaskStore} taskStore The task store to which this resource store is associated.
     * Usually is configured automatically, by the task store itself.
     */
});
