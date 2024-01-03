/**

@class Kanban.data.TaskStore
@extends Sch.data.EventStore

A data store class containing {@link Kanban.model.Task task records}. Sample usage below:

    var taskStore = new Kanban.data.TaskStore({
        sorters : 'Name',
        data    : [
            { Id : 1, Name : 'Dig hole', State : 'NotStarted'}
        ]
    });


You can of course also subclass this class like you would with any other Ext JS class and provide your own custom behavior.
*/
Ext.define('Kanban.data.TaskStore', {
    extend           : 'Sch.data.EventStore',
    model            : 'Kanban.model.Task',
    proxy            : undefined,
    alias            : 'store.kanban_taskstore',

    resourceStore    : null,

    setResourceStore : function (store) {
        this.resourceStore = Ext.data.StoreManager.lookup(store);
    },

    getResourceStore : function () {
        return this.resourceStore;
    },

    constructor : function(){

        this.callParent(arguments);

        var model = this.getModel();

        this.setSorters([{
            property    : model.prototype.positionField,
            direction   : 'ASC'
        }, {
            property    : model.prototype.nameField,
            direction   : 'ASC'
        }]);
    }
});
