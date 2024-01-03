/**
 * Event store's resource->events cache.
 * Uses resource records or resource record ids as keys.
 *
 * @private
 */
Ext.define('Sch.data.util.ResourceEventsCache', {
    extend   : 'Sch.util.Cache',
    requires : [
        'Ext.data.Model'
    ],

    eventStore            : null,
    eventStoreDetacher    : null,
    resourceStoreDetacher : null,

    constructor : function(eventStore) {
        var me            = this,
            resourceStore = eventStore.getResourceStore();

        me.callParent();

        function onEventAdd(eventStore, events) {
            Ext.Array.each(events, function(event) {
                me.add(event.getResourceId(), event);
            });
        }

        function onEventRemove(eventStore, events) {
            Ext.Array.each(events, function(event) {
                me.remove(event.getResourceId(), event);
            });
        }

        function onEventUpdate(eventStore, event, operation, modifiedFieldNames) {
            var resourceIdField    = event.resourceIdField,
                resourceIdChanged  = event.previous && resourceIdField in event.previous,
                previousResourceId = resourceIdChanged && event.previous[resourceIdField];

            if (resourceIdChanged) {
                me.move(previousResourceId, event.getResourceId(), event);
            }
        }

        function onEventStoreClearOrReset() {
            me.clear();
        }

        function onEventStoreResourceStoreChange(eventStore, newResourceStore, oldResourceStore) {
            me.clear();
            attachToResourceStore(newResourceStore);
        }

        function onResourceIdChanged(resourceStore, resource, oldId, newId) {
            me.move(oldId, newId);
        }

        function onResourceRemove(resourceStore, resources) {
            Ext.Array.each(resources, function(resource) {
                me.clear(resource);
            });
        }

        function onResourceStoreClearOrReset() {
            me.clear();
        }

        function attachToResourceStore(resourceStore) {
            Ext.destroy(me.resourceStoreDetacher);
            me.resourceStoreDetacher = resourceStore && resourceStore.on({
                idchanged      : onResourceIdChanged,
                remove         : onResourceRemove,
                clear          : onResourceStoreClearOrReset,
                cacheresethint : onResourceStoreClearOrReset,
                rootchange     : onResourceStoreClearOrReset,
                priority       : 100,
                destroyable    : true
            });
        }

        me.eventStoreDetacher = eventStore.on({
            add                 : onEventAdd,
            remove              : onEventRemove,
            update              : onEventUpdate,
            clear               : onEventStoreClearOrReset,
            cacheresethint      : onEventStoreClearOrReset,
            rootchange          : onEventStoreClearOrReset,
            resourcestorechange : onEventStoreResourceStoreChange,
            // subscribing to the CRUD using priority - should guarantee that our listeners
            // will be called first (before any other listeners, that could be provided in the "listeners" config)
            // and state in other listeners will be correct
            priority            : 100,
            destroyable         : true
        });

        me.eventStoreFiltersDetacher = eventStore.getFilters().on('endupdate', onEventStoreClearOrReset, this, {
            // priority is calculated as:
            // Ext.util.Collection.$endUpdatePriority + 1
            // to reset our cache before ExtJS "on filter end update" listeners run
            priority    : 1002,
            destroyable : true
        });

        attachToResourceStore(resourceStore);

        me.eventStore = eventStore;
    },

    destroy : function() {
        var me = this;
        Ext.destroyMembers(
            me,
            'eventStoreDetacher',
            'eventStoreFiltersDetacher',
            'resourceStoreDetacher'
        );
        me.eventStore = null;
    },

    get : function(k, fn) {
        var me = this;

        k = me.key(k);

        fn = fn || function() {
            return Ext.Array.filter(me.eventStore.getRange(), function(event) {
                return event.getResourceId() == k;
            });
        };

        return me.callParent([k, fn]);
    }
});
