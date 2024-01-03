/**
 * @class Sch.model.Assignment
 * @extends Sch.model.Customizable
 *
 * This class represent a single assignment of a resource to an event in scheduler.
 * It is a subclass of the {@link Sch.model.Customizable} class, which in its turn subclasses {@link Ext.data.Model}.
 * Please refer to documentation of those classes to become familar with the base interface of this class.
 *
 * The class fields can be customized by subclassing this class.
 * Please refer to {@link Sch.model.Customizable} for details.
 */
Ext.define('Sch.model.Assignment', {
    extend             : 'Sch.model.Customizable',

    idProperty         : 'Id',

    isAssignmentModel  : true,

    customizableFields : [
        /**
         * @field Id
         * The id of the assignment
         */
        /**
         * @field
         * The id of the resource assigned
         */
        { name : 'ResourceId' },
        /**
         * @field
         * The id of the event to which the resource is assigned
         */
        { name : 'EventId' }
    ],

    /**
     * @cfg {String} resourceIdField The name of the field identifying the resource to which an assignment belongs.
     * Defaults to "ResourceId".
     */
    resourceIdField    : 'ResourceId',

    /**
     * @cfg {String} eventIdField The name of the field identifying an event to which an assignment belongs.
     * Defaults to "EventId".
     */
    eventIdField       : 'EventId',

    getInternalId : function() {
        return this.internalId;
    },

    /**
     * Returns an assigment store this assignment is part of. Assignment must be part of an assigment store
     * to be able to retrieve it.
     *
     * @return {Sch.data.AssignmentStore|null}
     */
    getAssignmentStore : function() {
        return this.joined && this.joined[ 0 ];
    },

    /**
     * Returns an event store this assignment uses as default event store. Assignment must be part
     * of an assignment store to be able to retrieve default event store.
     *
     * @return {Sch.data.EventStore|null}
     */
    getEventStore : function() {
        var assignmentStore = this.getAssignmentStore();
        return assignmentStore && assignmentStore.getEventStore();
    },

    /**
     * Returns a resource store this assignment uses as default resource store. Assignment must be part
     * of an assignment store to be able to retrieve default resource store.
     *
     * @return {Sch.data.ResourceStore|null}
     */
    getResourceStore : function() {
        var eventStore = this.getEventStore();
        return eventStore && eventStore.getResourceStore();
    },

    /**
     * Returns an event associated with this assignment.
     * @method getEvent
     * @return {Sch.model.Range} Event instance
     */
    /**
     * @ignore
     */
    getEvent: function(eventStore) {
        var me = this;
        // removed assignment will not have "this.joined" so we are providing a way to get an event via provided
        // event store
        eventStore = eventStore || me.getEventStore();
        return eventStore && eventStore.getModelById(me.getEventId());
    },

    /**
     * Returns the resource associated with this assignment.
     * @method getResource
     * @return {Sch.model.Resource} Instance of resource
     */
    /**
     * @ignore
     */
    getResource: function(resourceStore) {
        var me = this;
        // removed assignment will not have "this.joined" so we are providing a way to get a resource via provided
        // resource store
        resourceStore = resourceStore || me.getResourceStore();
        return resourceStore && resourceStore.getModelById(me.getResourceId());
    },

    /**
     * Convenience method to get a name of the associated event.
     * @method getEventName
     * @return {String} name
     */
    /**
     * @ignore
     */
    getEventName : function(eventStore) {
        var evnt = this.getEvent(eventStore);
        return evnt && evnt.getName() || '';
    },

    /**
     * Convenience method to get a name of the associated resource.
     * @method getResourceName
     * @return {String} name
     */
    /**
     * @ignore
     */
    getResourceName : function(resourceStore) {
        var resource = this.getResource(resourceStore);
        return resource && resource.getName() || '';
    },

    /**
     * Returns true if the Assignment can be persisted (e.g. task and resource are not 'phantoms')
     *
     * @return {Boolean} true if this model can be persisted to server.
     */
    isPersistable : function() {
        var me       = this,
            event    = me.getEvent(),
            resource = me.getResource();

        return event && !event.phantom && resource && !resource.phantom;
    },

    fullCopy : function() {
        return this.copy.apply(this, arguments);
    },

    // private
    getEventResourceCompositeKey : function() {
        var me = this;

        return me.self.makeAssignmentEventResourceCompositeKey(
            me.getEventId(),
            me.getResourceId()
        );
    },

    inheritableStatics : {
        makeAssignmentEventResourceCompositeKey : function() {
            var arr = [];

            return function(eventId, resourceId) {
                arr.length = 0;
                arr.push('event(', eventId, ')-resource(', resourceId, ')');
                return arr.join('');
            };
        }()
    }
});
