/**

@class Kanban.data.ResourceStore
@extends Sch.data.ResourceStore

A data store class containing {@link Kanban.model.Resource user records}. Sample usage below:

    var resourceStore = new Kanban.data.ResourceStore({
        sorters : 'Name',

        data    : [
            { Id : 1, Name : 'Dave' }
        ]
    });


You can of course also subclass this class like you would with any other Ext JS class and provide your own custom behavior.
*/
Ext.define('Kanban.data.ResourceStore', {
    extend  : 'Sch.data.ResourceStore',
    model   : 'Kanban.model.Resource',
    sorters : 'Name',
    proxy   : undefined,

    alias   : 'store.kanban_resourcestore'
});
