/**
 * @class Gnt.data.AssignmentStore
 * @extends Schdata.AssignmentStore
 *
 * A class representing a collection of assignments between tasks in the {@link Gnt.data.TaskStore} and resources
 * in the {@link Gnt.data.ResourceStore}.
 *
 * Contains a collection of {@link Gnt.model.Assignment} records.
 */
Ext.define('Gnt.data.AssignmentStore', {
    extend                : 'Sch.data.AssignmentStore',

    requires              : [
        'Gnt.model.Assignment'
    ],

    model                 : 'Gnt.model.Assignment',
    alias                 : 'store.gantt_assignmentstore',

    storeId               : 'assignments',

    // Overriden from Sch.data.AssignmentStore due to the logic required is handled by the Gantt codebase
    attachToEventStore    : Ext.emptyFn,
    attachToResourceStore : Ext.emptyFn,

    constructor : function(config) {
        var me = this;

        me.callParent([config]);

        me.on({
            remove : me.onRecordsRemove,
            clear  : me.onRecordsRemove,
            scope  : me
        });
    },

    // https://app.assembla.com/spaces/bryntum/tickets/7284
    onRecordsRemove : function (store, records) {
        var taskStore = this.eventStore || null;

        if (records && records.length) {
            Ext.Array.each(records, function (record) {
                record.taskStore = taskStore;
            });
        }
    },

    /**
     * Returns the associated task store instance.
     *
     * @return {Gnt.data.TaskStore}
     */
    getTaskStore : function () {
        return this.getEventStore();
    },

    /**
     * Sets associated task store instance.
     *
     * @param {Gnt.data.TaskStore} store
     */
    setTaskStore : function (store) {
        return this.setEventStore(store);
    },


    /**
     * Maps over task assignments.
     *
     * @param {Gnt.model.Task/Mixed} task
     * @param {Function} [fn=Ext.identityFn]
     * @param {Function} [filterFn=Ext.returnTrue]
     * @return {Mixed[]}
     */
    mapAssignmentsForTask : function (task, fn, filterFn) {
        return this.mapAssignmentsForEvent(task, fn, filterFn);
    },

    /**
     * Returns all assignments for a given task.
     *
     * @param {Gnt.model.Task/Mixed} task
     * @return {Gnt.model.Assignment[]}
     */
    getAssignmentsForTask : function(task) {
        return this.getAssignmentsForEvent(task);
    },

    /**
     * Removes all assignments for given event
     *
     * @param {Gnt.model.Task/Mixed} task
     */
    removeAssignmentsForTask : function(task) {
        return this.removeAssignmentsForEvent(task);
    },

    /**
     * Returns all resources assigned to a task.
     *
     * @param {Gnt.model.Task/Mixed} task
     * @return {Gnt.model.Resource[]}
     */
    getResourcesForTask : function (task) {
        return this.getResourcesForEvent(task);
    },

    /**
     * Returns all tasks assigned to a resource
     *
     * @param {Gnt.model.Resource/Mixed} resource
     * @return {Gnt.model.Task[]}
     */
    getTasksForResource : function (resource) {
        return this.getEventsForResource(resource);
    },

    /**
     * Creates and adds an Assignment record for a given task and a resource.
     *
     * @param {Gnt.model.Task/Mixed} task The task record
     * @param {Gnt.model.Resource/Mixed} resource The resource record
     * @param {Object} [assignmentData] Additional data for the assignment record
     * @return {Gnt.model.Assignment[]} An array with the created assignment(s)
     */
    assignTaskToResource : function (task, resource, assignmentData) {
        return this.assignEventToResource(task, resource, function (assignment) {
            if (Ext.isObject(assignmentData)) {
                delete assignmentData [assignment.idProperty];
                Ext.apply(assignment.data, assignmentData);
            }
            return assignment;
        });
    },

    /**
     * Removes assignment record for a given task and a resource.
     *
     * @param {Gnt.model.Task/Mixed} task
     * @param {Gnt.model.Resource/Mixed} resource
     * @return {Gnt.model.Assignment}
     */
    unassignTaskFromResource : function (task, resource) {
        return this.unassignEventFromResource(task, resource);
    },

    /**
     * Checks whether a task is assigned to a resource.
     *
     * @param {Gnt.model.Task/Mixed} evnt
     * @param {Gnt.model.Resource/Mixed} resource
     * @param {Function} [fn] Function which will resieve assignment record if one present
     * @return {Boolean}
     */
    isTaskAssignedToResource : function (task, resource, fn) {
        return this.isEventAssignedToResource(task, resource, fn);
    },

    /**
     * Returns assignment record for given task and resource
     *
     * @param {Gnt.model.Task} event
     * @param {Gnt.model.Resource} resource
     * @return {Gnt.model.Assignment}
     */
    getAssignmentForTaskAndResource : function (task, resource) {
        return this.getAssignmentForEventAndResource(task, resource);
    }
}, function () {
    // #4904
    // @OVERRIDE 6.2.1 doesn't fire commit event
    if (Ext.getVersion().isLessThan('6.5.0')) {
        Ext.override(this, {
            commitChanges : function () {
                this.callParent(arguments);
                this.fireEvent('commit', this);
            }
        });
    }
});
