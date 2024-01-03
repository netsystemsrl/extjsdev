// @tag dependencies
/**
 * @class Sch.data.DependencyStore
 * @extends Ext.data.Store
 *
 * A class representing a collection of dependencies between events in the {@link Sch.data.EventStore}.
 * Contains a collection of {@link Sch.model.Dependency} records.
 */
Ext.define('Sch.data.DependencyStore', {
    extend               : 'Ext.data.Store',

    requires : [
        'Sch.patches.CollectionKey',
        'Sch.data.util.EventDependencyCache'
    ],

    mixins               : [
        'Sch.data.mixin.UniversalModelGetter',
        'Sch.data.mixin.CacheHintHelper',
        'Robo.data.Store'
    ],

    config : {
        // WARNING: this is a private config in Ext.data.LocalStore
        extraKeys : {
            bySourceTargetId : {
                keyFn : function(dependency) {
                    return Sch.data.DependencyStore.makeDependencySourceTargetCompositeKey(
                        dependency.getSourceId(),
                        dependency.getTargetId()
                    );
                }
            }
        }
    },

    model                : 'Sch.model.Dependency',
    alias                : 'store.sch_dependencystore',
    storeId              : 'dependencies',

    eventStoreDetacher   : null,

    eventStore           : null,

    constructor : function(config) {
        var me = this;

        me.callParent([config]);

        me.eventDependencyCache = me.eventDependencyCache || me.createEventDependencyCache();
    },

    destroy : function() {
        var me = this;
        Ext.destroyMembers(
            me,
            'eventDependencyCache',
            'eventStoreDetacher'
        );
        me.callParent();
    },

    /**
     * Event->dependency cache factory
     *
     * @return {Sch.util.Cache}
     * @protected
     */
    createEventDependencyCache : function() {
        return new Sch.data.util.EventDependencyCache(this);
    },

    /**
     * Returns the associated event store instance.
     *
     * @return {Sch.data.EventStore}
     */
    getEventStore: function() {
        return this.eventStore;
    },

    /**
     * Sets the associated event store instance.
     *
     * @param {Sch.data.EventStore} eventStore
     */
    setEventStore: function(eventStore) {
        var me = this,
            oldStore = me.eventStore;

        me.eventStore = eventStore && Ext.StoreMgr.lookup(eventStore) || null;

        me.attachToEventStore(me.eventStore);

        if ((oldStore || eventStore) && oldStore !== eventStore) {
            /**
             * @event eventstorechange
             * Fires when a new event store is set via {@link #setEventStore} method.
             * @param {Sch.data.DependencyStore} this
             * @param {Sch.data.EventStore} newEventStore
             * @param {Sch.data.EventStore} oldEventStore
             */
            me.fireEvent('eventstorechange', me, eventStore, oldStore);
        }
    },

    attachToEventStore : function(eventStore) {
        var me = this;

        Ext.destroy(me.eventStoreDetacher);

        if (eventStore && eventStore.isTreeStore) {
            me.eventStoreDetacher = eventStore.on({
                'noderemove' : me.onEventNodeRemove,
                scope        : me,
                destroyable  : true,
                priority     : 200 // higher than in cache, we need those handlers to do their job before cache update
            });
        }
        else if (eventStore) {
            me.eventStoreDetacher = eventStore.on({
                'remove'    : me.onEventRemove,
                scope       : me,
                destroyable : true,
                priority    : 200 // higher than in cache, we need those handlers to do their job before cache update
            });
        }
    },

    onEventRemove : function(eventStore, events, index, isMove) {
        !isMove && this.removeEventDependencies(events, false);
    },

    onEventNodeRemove : function(eventStore, event, isMove) {
        !isMove && this.removeEventDependencies(event, false);
    },

    // TODO: document
    reduceEventDependencies : function(event, reduceFn, result, flat, depsGetterFn) {
        var me = this;

        depsGetterFn = depsGetterFn || function(event) {
            var eventId = event && event.isModel ? event.getId() : event;

            return me.eventDependencyCache.get(event, function() {
                // Full scan, but cache makes everything possible to avoid it
                return Ext.Array.filter(me.getRange(), function(dependency) {
                    return dependency.getTargetId() == eventId || dependency.getSourceId() == eventId;
                });
            });
        };

        event = Ext.isArray(event) ? event : [event];
        flat  = flat === undefined ? true  : false;

        Ext.Array.reduce(event, function(result, event) {
            if (event.isNode && !flat) {
                event.cascadeBy(function(event) {
                    result = Ext.Array.reduce(depsGetterFn(event), reduceFn, result);
                });
            }
            else {
                result = Ext.Array.reduce(depsGetterFn(event), reduceFn, result);
            }
        }, result);

        return result;
    },

    // TODO: document
    reduceEventIncomingDependencies : function(event, reduceFn, result, flat) {
        var me = this;

        return me.reduceEventDependencies(event, reduceFn, result, flat, function(event) {

            var eventId = event && event.isModel ? event.getId() : event;

            return me.eventDependencyCache.getPredecessors(event, function() {
                // Full scan, but cache makes everything possible to avoid it
                return Ext.Array.filter(me.getRange(), function(dependency) {
                    return dependency.getTargetId() == eventId;
                });
            });
        });
    },

    // TODO: document
    reduceEventOutgoingDependencies : function(event, reduceFn, result, flat) {
        var me = this;

        return me.reduceEventDependencies(event, reduceFn, result, flat, function(event) {

            var eventId = event && event.isModel ? event.getId() : event;

            return me.eventDependencyCache.getSuccessors(event, function() {
                // Full scan, but cache makes everything possible to avoid it
                return Ext.Array.filter(me.getRange(), function(dependency) {
                    return dependency.getSourceId() == eventId;
                });
            });
        });
    },

    // TODO: document
    mapEventDependencies : function(event, fn, filterFn, flat, depsGetterFn) {
        return this.reduceEventDependencies(event, function(result, dependency) {
            filterFn(dependency) && result.push(dependency);
            return result;
        }, [], flat, depsGetterFn);
    },

    // TODO: document
    mapEventIncomingDependencies : function(event, fn, filterFn, flat) {
        return this.reduceEventIncomingDependencies(event, function(result, dependency) {
            filterFn(dependency) && result.push(dependency);
            return result;
        }, [], flat);
    },

    // TODO: document
    mapEventOutgoingDependencies : function(event, fn, filterFn, flat) {
        return this.reduceEventOutgoingDependencies(event, function(result, dependency) {
            filterFn(dependency) && result.push(dependency);
            return result;
        }, [], flat);
    },

    /**
     * Returns all dependencies of for a certain event (both incoming and outgoing)
     *
     * @param {Sch.model.Event} event
     * @param {Boolean} flat
     * @return {Sch.model.Dependency[]}
     */
    getEventDependencies : function(event, flat) {
        return this.mapEventDependencies(event, Ext.identityFn, Ext.returnTrue, flat);
    },

    /**
     * Returns all incoming dependencies of the given event
     *
     * @param {Sch.model.Event} event
     * @param {Boolean} flat
     * @return {Sch.model.Dependency[]}
     */
    getEventIncomingDependencies : function(event, flat) {
        return this.mapEventIncomingDependencies(event, Ext.identityFn, Ext.returnTrue, flat);
    },

    /**
     * Returns all outcoming dependencies of a event
     *
     * @param {Sch.model.Event} event
     * @param {Boolean} flat
     * @return {Sch.model.Dependency[]}
     */
    getEventOutgoingDependencies : function(event, flat) {
        return this.mapEventOutgoingDependencies(event, Ext.identityFn, Ext.returnTrue, flat);
    },

    // TODO: document
    getEventPredecessors : function(event, flat) {
        var me = this,
            eventStore = me.getEventStore();

        // <debug>
        Ext.Assert && Ext.Assert.truthy(eventStore, "Can't get event predecessors, no event store configured");
        // </debug>

        return me.reduceEventDependencies(event, function(result, dependency) {
            var predecessorId = dependency.getFrom(),
                predecessor   = predecessorId && eventStore.getModelById(predecessorId);

            if (predecessor) {
                result.push(predecessor);
            }

            return result;
        }, [], flat, function(event) {
            return me.eventDependencyCache.getPredecessors(event);
        });
    },

    // TODO: document
    getEventSuccessors : function(event, flat) {
        var me = this,
            eventStore = me.getEventStore();

        // <debug>
        Ext.Assert && Ext.Assert.truthy(eventStore, "Can't get event successors, no event store configured");
        // </debug>

        return me.reduceEventDependencies(event, function(result, dependency) {
            var successorId = dependency.getTo(),
                successor   = successorId && eventStore.getModelById(successorId);

            if (successor) {
                result.push(successor);
            }

            return result;
        }, [], flat, function(event) {
            return me.eventDependencyCache.getSuccessors(event);
        });
    },

    // TODO: document
    removeEventDependencies : function(event, flat) {
        var me = this,
            dependencies;

        dependencies = me.getEventDependencies(event, flat);

        dependencies.length && me.remove(Ext.Array.unique(dependencies));
    },

    // TODO: document
    removeEventIncomingDependencies : function(event, flat) {
        var me = this,
            dependencies;

        dependencies = me.getEventIncomingDependencies(event, flat);

        dependencies.length && me.remove(Ext.Array.unique(dependencies));
    },

    // TODO: document
    removeEventOutgoingDependencies : function(event, flat) {
        var me = this,
            dependencies;

        dependencies = me.getEventOutgoingDependencies(event, flat);

        dependencies.length && me.remove(Ext.Array.unique(dependencies));
    },

    /**
     * Returns dependency model instance linking tasks with given ids. The dependency can be forward (from 1st
     * task to 2nd) or backward (from 2nd to 1st).
     *
     * @param {Sch.model.Event|String} sourceEvent 1st event
     * @param {Sch.model.Event|String} targetEvent 2nd event
     * @return {Sch.model.Dependency|Null}
     */
    getDependencyForSourceAndTargetEvents : function(sourceEvent, targetEvent) {
        // NOTE: In case this will not work switch to cache get and linear search
        var me = this;

        sourceEvent = sourceEvent && sourceEvent.isModel && sourceEvent.getId() || sourceEvent;
        targetEvent = targetEvent && targetEvent.isModel && targetEvent.getId() || targetEvent;

        return me.bySourceTargetId.get(me.self.makeDependencySourceTargetCompositeKey(sourceEvent, targetEvent));
    },

    /**
     * Returns a dependency model instance linking given events if such dependency exists in the store.
     * The dependency can be forward (from 1st event to 2nd) or backward (from 2nd to 1st).
     *
     * @param {Sch.model.Event|String} sourceEvent
     * @param {Sch.model.Event|String} targetEvent
     * @return {Scm.model.Dependency|null}
     */
    getEventsLinkingDependency : function(event1, event2) {
        var me = this;
        return me.getDependencyForSourceAndTargetEvents(event1, event2) ||
               me.getDependencyForSourceAndTargetEvents(event2, event1);
    },

    /**
     * Validation method used to validate a dependency. Override and return `true` to indicate that an
     * existing dependency (or a new dependency being created) between two tasks is valid.
     *
     * @param {Sch.model.Dependency} dependency The dependency model
     * @return {Boolean}
     */
    isValidDependency : function(dependency) {
        var fromId = dependency.getSourceId();
        var toId   = dependency.getTargetId();

        return fromId != null && toId != null && fromId !== toId;
    },

    /**
     * Returns all dependencies highlighted with the given CSS class
     *
     * @param {String} cls
     * @return {Sch.model.DependencyBase[]}
     */
    getHighlightedDependencies : function(cls) {
        return Ext.Array.reduce(this.getRange(), function(result, dep) {
            if (dep.isHighlightedWith(cls)) {
                result.push(dep);
            }

            return result;
        }, []);
    },

    inheritableStatics : {
        makeDependencySourceTargetCompositeKey : function() {
            var arr = [];

            return function(sourceId, targetId) {
                arr.length = 0;
                arr.push('source(', sourceId, ')-target(', targetId, ')');
                return arr.join('');
            };
        }()
    }
});
