Ext.define('Gnt.data.mixin.ResourceStore', {
    extend  : 'Ext.Mixin',

    taskStore   : null,

    mixinConfig : {
        after : {
            constructor : 'constructor'
        }
    },

    constructor : function () {
        this.on(this.getStoreListeners());
    },

    getStoreListeners : function () {
        return {
            load            : this.normalizeResources,
            remove          : this.onResourceRemoved,
            clear           : this.onResourceStoreClear,
            // Our internal listeners should be ran before any client listeners
            priority        : 100
        };
    },

    normalizeResources : function () {
        // scan through all resources and re-assign the "calendarId" property to get the listeners in place
        this.each(function (resource) {
            if (!resource.normalized) {
                var calendarId      = resource.getCalendarId();

                if (calendarId) resource.setCalendarId(calendarId, true);

                resource.normalized     = true;
            }
        });
    },

    // Performance optimization possibility: Assignment store datachange will cause a full refresh
    // so removing a resource will currently cause 2 refreshes. Not critical since this is not a very common use case
    onResourceRemoved : function(store, resources) {
        var assignmentStore = this.getAssignmentStore();

        Ext.Array.each(resources, function(resource) {
            assignmentStore.removeAssignmentsForResource(resource);
        });
    },

    onResourceStoreClear : function() {
        this.getAssignmentStore().removeAll();
    },

    /**
     * Returns the associated task store instance.
     *
     * @return {Gnt.data.TaskStore|null}
     */
    getTaskStore : function() {
        return this.taskStore;
    },

    /**
     * Sets associated task store instance
     *
     * @param {Gnt.data.TaskStore} store
     */
    setTaskStore : function(store) {
        this.taskStore = store;
    },

    /**
     * Returns the associated assignment store instance.
     *
     * @return {Gnt.data.AssignmentStore|null}
     */
    getAssignmentStore : function() {
        var taskStore = this.getTaskStore();
        return taskStore && taskStore.getAssignmentStore() || null;
    },

    /**
     * Returns the associated dependency store
     *
     * @return {Gnt.data.DependencyStore|null}
     */
    getDependencyStore : function() {
        var taskStore = this.getTaskStore();
        return taskStore && taskStore.getDependencyStore() || null;
    }
});
