/**
@class Sch.model.Resource

This class represent a single Resource in the scheduler chart. It's a subclass of the {@link Sch.model.Customizable}, which is in turn subclass of {@link Ext.data.Model}.
Please refer to documentation of those classes to become familar with the base interface of the resource.

A Resource has only 2 mandatory fields - `Id` and `Name`. If you want to add more fields with meta data describing your resources then you should subclass this class:

    Ext.define('MyProject.model.Resource', {
        extend      : 'Sch.model.Resource',

        fields      : [
            // `Id` and `Name` fields are already provided by the superclass
            { name: 'Company',          type : 'string' }
        ],

        getCompany : function () {
            return this.get('Company');
        },
        ...
    });

If you want to use other names for the {@link #Id} and {@link #Name} fields you can configure them as seen below:

    Ext.define('MyProject.model.Resource', {
        extend      : 'Sch.model.Resource',

        nameField   : 'UserName',
        ...
    });

Please refer to {@link Sch.model.Customizable} for details.
*/
Ext.define('Sch.model.Resource', {
    extend : 'Sch.model.Customizable',

    isResourceModel : true,

    idProperty : 'Id',
    config     : Ext.versions.touch ? { idProperty : 'Id' } : null,

    /**
     * @cfg {String} nameField The name of the field that holds the resource name.
     */
    nameField : 'Name',

    customizableFields : [
        /**
         * @field Id
         * A unique identifier of the resource
         */
        /**
         * @method getName
         *
         * Returns the resource name
         *
         * @return {String} The name of the resource
         */
        /**
         * @method setName
         *
         * Sets the resource name
         *
         * @param {String} name The new name of the resource
         */
        /**
         * @field
         * Name of the resource
         */
        { name : 'Name', type : 'string' }
    ],

    getInternalId : function() {
        return this.internalId;
    },

    /**
     * Returns a resource store this resource is part of. Resource must be part
     * of a resource store to be able to retrieve resource store.
     *
     * @return {Sch.data.ResourceStore|null}
     */
    getResourceStore : function() {
        return this.joined && this.joined[ 0 ] || this.getTreeStore && this.getTreeStore();
    },

    /**
     * Returns an event store this resource uses as default. Resource must be part
     * of a resource store to be able to retrieve event store.
     *
     * @return {Sch.data.EventStore|null}
     */
    getEventStore : function () {
        var resourceStore = this.getResourceStore();
        return resourceStore && resourceStore.getEventStore() || this.parentNode && this.parentNode.getEventStore();
    },

    /**
     * Returns as assignment store this resources uses as default. Resource must be part
     * of a resource store to be able to retrieve default assignment store.
     *
     * @return {Sch.data.AssignmentStore|null}
     */
    getAssignmentStore : function() {
        var eventStore = this.getEventStore();
        return eventStore && eventStore.getAssignmentStore();
    },

    /**
     * Returns an array of events, associated with this resource
     *
     * @param {Sch.data.EventStore} eventStore (optional) The event store to get events for (if a resource is bound to multiple stores)
     * @return {Sch.model.Range[]}
     */
    getEvents : function (eventStore) {
        var me = this;
        eventStore = eventStore || me.getEventStore();
        return eventStore && eventStore.getEventsForResource(me) || [];
    },

    /**
     * Returns all assignments for the resource. Resource must be part of the store for this method to work.
     *
     * @return {[Sch.model.Assignment]}
     */
    getAssignments : function() {
        var me = this,
            eventStore = me.getEventStore();

        return eventStore && eventStore.getAssignmentsForResource(me);
    },

    /**
     * Returns true if the Resource can be persisted.
     * In a flat store resource is always considered to be persistable, in a tree store resource is considered to
     * be persitable if it's parent node is persistable.
     *
     * @return {Boolean} true if this model can be persisted to server.
     */
    isPersistable : function() {
        var parent = this.parentNode;
        return !parent || !parent.phantom || (parent.isRoot && parent.isRoot());
    },

    /**
     * Returns true if this resource model is above the passed resource model
     * @param {Sch.model.Resource} otherResource
     * @return {Boolean}
     */
    isAbove : function(otherResource) {
        var me = this,
            store = me.getResourceStore(),
            result = false,
            current, myAncestors, otherAncestors, commonAncestorsLength, lastCommonAncestor;

        // <debug>
        Ext.Assert && Ext.Assert.truthy(store, "Resource must be added to a store to be able to check if it above of an other resource");
        // </debug>

        if (me == otherResource) {
            result = false;
        }
        else if (store && store.isTreeStore) {

            // Getting self ancestors this node including
            current = me;
            myAncestors = [];
            while (current) {
                myAncestors.push(current);
                current = current.parentNode;
            }

            // Getting other ancestors other node including
            current = otherResource;
            otherAncestors = [];
            while (current) {
                otherAncestors.push(current);
                current = current.parentNode;
            }

            // Getting common ancestors sequence length
            commonAncestorsLength = 0;
            while (
                commonAncestorsLength < myAncestors.length - 1 &&
                commonAncestorsLength < otherAncestors.length - 1 &&
                myAncestors[commonAncestorsLength] == otherAncestors[commonAncestorsLength]
            ) {
                ++commonAncestorsLength;
            }

            // Getting last common ancesstor
            lastCommonAncestor = myAncestors[commonAncestorsLength];

            // Here the next ancestor in myAncestors and next ancesstor in otherAncestors are siblings and
            // thus designate which node is above
            me            = myAncestors[commonAncestorsLength + 1];
            otherResource = otherAncestors[commonAncestorsLength + 1];

            result = lastCommonAncestor.indexOf(me) < lastCommonAncestor.indexOf(otherResource);
        }
        else {
            result = store.indexOf(me) < store.indexOf(otherResource);
        }

        return result;
    }
});
