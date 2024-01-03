/**
 * Assignment store event->assignments cache.
 * Uses event records or event record ids as keys.
 *
 * @private
 */
Ext.define('Sch.data.util.EventAssignmentsCache', {
    extend                  : 'Sch.util.Cache',
    requires                : [
        'Ext.data.Model'
    ],

    assignmentStore                : null,
    assignmentStoreDetacher        : null,
    assignmentStoreFiltersDetacher : null,
    eventStoreDetacher             : null,

    constructor : function(assignmentStore) {
        var me         = this,
            eventStore = assignmentStore.getEventStore();

        me.callParent();

        function onAssignmentAdd(store, assignments) {
            Ext.Array.each(assignments, function(assignment) {
                me.add(assignment.getEventId(), assignment);
            });
        }

        function onAssignmentRemove(store, assignments) {
            Ext.Array.each(assignments, function(assignment) {
                me.remove(assignment.getEventId(), assignment);
            });
        }

        function onAssignmentUpdate(store, assignment, operation) {
            var eventIdField    = assignment.eventIdField,
                eventIdChanged  = assignment.previous && eventIdField in assignment.previous,
                previousEventId = eventIdChanged && assignment.previous[eventIdField];

            if (eventIdChanged) {
                me.move(previousEventId, assignment.getEventId(), assignment);
            }
        }

        function onAssignmentStoreClearOrReset(store) {
            me.clear();
        }

        function onAssignmentStoreEventStoreChange(store, eventStore) {
            me.clear();
            attachToEventStore(eventStore);
        }

        function onEventIdChanged(eventStore, event, oldId, newId) {
            me.move(oldId, newId);
        }

        function onEventRemove(eventStore, events) {
            Ext.Array.each(events, function(event) {
                me.clear(event);
            });
        }

        function onEventStoreClearOrReset() {
            me.clear();
        }

        function attachToEventStore(store) {
            Ext.destroy(me.eventStoreDetacher);
            me.eventStoreDetacher = store && store.on({
                idchanged      : onEventIdChanged,
                remove         : onEventRemove,
                cacheresethint : onEventStoreClearOrReset,
                clear          : onEventStoreClearOrReset,
                rootchange     : onEventStoreClearOrReset,
                priority       : 100,
                destroyable    : true
            });
        }

        me.assignmentStoreDetacher = assignmentStore.on({
            add              : onAssignmentAdd,
            remove           : onAssignmentRemove,
            update           : onAssignmentUpdate,
            cacheresethint   : onAssignmentStoreClearOrReset,
            clear            : onAssignmentStoreClearOrReset,
            eventstorechange : onAssignmentStoreEventStoreChange,
            // subscribing to the CRUD using priority - should guarantee that our listeners
            // will be called first (before any other listeners, that could be provided in the "listeners" config)
            // and state in other listeners will be correct
            priority         : 100,
            destroyable      : true
        });

        me.assignmentStoreFiltersDetacher = assignmentStore.getFilters().on({
            endupdate : onAssignmentStoreClearOrReset,
            // priority is calculated as:
            // Ext.util.Collection.$endUpdatePriority + 1
            // to reset our cache before ExtJS "on filter end update" listeners run
            priority    : 1002,
            destroyable : true
        });

        attachToEventStore(eventStore);

        me.assignmentStore = assignmentStore;
    },

    destroy : function() {
        var me = this;
        Ext.destroyMembers(
            me,
            'assignmentStoreDetacher',
            'assignmentStoreFiltersDetacher',
            'eventStoreDetacher'
        );
        me.assignmentStore = null;
    },

    get : function(k, fn) {
        var me = this;

        k = me.key(k);

        fn = fn || function() {
            return Ext.Array.filter(me.assignmentStore.getRange(), function(assignment) {
                return assignment.getEventId() == k;
            });
        };

        return me.callParent([k, fn]);
    }
});
