/**
 * Dependency store event->dependencies cache.
 * Uses event records or event record ids as keys.
 *
 * The cache uses 3 keys for each event:
 * - {EventId} - contains both successors and predecessors
 * - {EventId}-succ - contains successors only
 * - {EventId}-pred - contains predecessors only
 *
 * @private
 */
Ext.define('Sch.data.util.EventDependencyCache', function() {

    var collectOptions = {
        allowNull : false,
        filtered  : false,
        collapsed : true
    };

    var cellArray = [null];

    function cacheDependencies(me, dependencies) {
        Ext.Array.each(dependencies, function(dependency) {
            var sourceId = dependency.getSourceId(),
                targetId = dependency.getTargetId();

            if (sourceId) {
                me.add(sourceId, dependency);
            }

            if (targetId) {
                me.add(targetId, dependency);
            }

            if (sourceId && targetId) {
                me.addSuccessor(sourceId, dependency);
                me.addPredecessor(targetId, dependency);
            }
        });
    }

    function uncacheDependencies(me, dependencies) {
        Ext.Array.each(dependencies, function(dependency) {
            var sourceId = dependency.getSourceId(),
                targetId = dependency.getTargetId();

            if (sourceId) {
                me.remove(sourceId, dependency);
                me.removeSuccessor(sourceId, dependency);
            }

            if (targetId) {
                me.remove(targetId, dependency);
                me.removePredecessor(targetId, dependency);
            }
        });
    }

    function uncacheEventDependencies(me, events) {
        Ext.Array.each(events, function(event) {
            me.clear(event);
            me.clearSuccessors(event);
            me.clearPredecessors(event);
        });
    }

    function updateDependency(me, newSourceId, oldSourceId, newTargetId, oldTargetId, dependency) {
        if (newSourceId !== oldSourceId) {
            me.move(oldSourceId, newSourceId, dependency);
            me.moveSuccessors(oldSourceId, newSourceId, dependency);
        }

        if (newTargetId !== oldTargetId) {
            me.move(oldTargetId, newTargetId, dependency);
            me.movePredecessors(oldTargetId, newTargetId, dependency);
        }
    }

    function moveDependencies(me, oldEventId, newEventId) {
        me.move(oldEventId, newEventId);
        me.moveSuccessors(oldEventId, newEventId);
        me.movePredecessors(oldEventId, newEventId);
    }

    function complementCache(me, events) {
        Ext.Array.each(events, function(event) {
            if (!me.has(event)) {
                me.set(event, []);
                me.setSuccessors(event, []);
                me.setPredecessors(event, []);
            }
        });
    }

    function recacheAll(me, dependencyStore, eventStore) {
        me.clear();
        cacheDependencies(me, dependencyStore.getRange());
        eventStore && (!eventStore.getRoot || eventStore.getRoot()) && complementCache(me, eventStore.collect(eventStore.getModel().idProperty, collectOptions));
    }

    function recacheKeys(me, keys, dependencyStore, eventStore) {
        // Adopting keys for fast checking and removing corresponding key from cache
        keys = Ext.Array.reduce(keys, function(result, key) {
            me.set(key, []);
            result[me.key(key)] = true;
        }, {});

        // Re-caching
        dependencyStore.each(function(dependency) {
            var sourceId      = dependency.getSourceId(),
                targetId      = dependency.getTargetId(),
                isSuccessor   = keys.hasOwnProperty(sourceId), // this dependency defines succesor of source task
                isPredecessor = keys.hasOwnProperty(targetId); // this dependency defines predecessor of a target task

            isSuccessor   && me.add(sourceId, dependency);
            isSuccessor   && me.addSuccessor(sourceId, dependency);
            isPredecessor && me.add(targetId, dependency);
            isPredecessor && me.addPredecessor(targetId, dependency);
        });

        // Complementing
        Ext.Object.each(keys, function(key) {
            if (!me.has(key) && (eventStore.getNodeById ? eventStore.getNodeById(key) : eventStore.getById(key))) {
                me.set(key, []);
            }
        });
    }

    return {
        extend                  : 'Sch.util.Cache',
        dependencyStore         : null,
        dependencyStoreDetacher : null,
        eventStoreDetacher      : null,

        constructor : function(dependencyStore) {
            var me = this;

            me.callParent();

            me.dependencyStore = dependencyStore;

            function onDependencyAdd(store, dependencies) {
                cacheDependencies(me, dependencies);
            }

            function onDependencyRemove(store, dependencies, index, isMove) {
                !isMove && uncacheDependencies(me, dependencies);
            }

            function onDependencyUpdate(store, dependency, operation) {
                var sourceIdField    = dependency.fromField,
                    targetIdField    = dependency.toField,
                    sourceIdChanged  = dependency.previous && sourceIdField in dependency.previous,
                    targetIdChanged  = dependency.previous && targetIdField in dependency.previous,
                    previousSourceId = sourceIdChanged && dependency.previous[sourceIdField],
                    previousTargetId = targetIdChanged && dependency.previous[targetIdField];

                if (sourceIdChanged || targetIdChanged) {
                    if ((!previousSourceId && dependency.previous.hasOwnProperty(sourceIdField)) || (!previousTargetId && dependency.previous.hasOwnProperty(targetIdField))) {
                        // We had the dependency not 100% filled previously so we cannot rely on its predecessors/successors cached values
                        uncacheDependencies(me, [dependency]);
                        cacheDependencies(me, [dependency]);
                    } else {
                        updateDependency(
                            me,
                            sourceIdChanged ? dependency.getSourceId() : false,
                            sourceIdChanged ? previousSourceId : false,
                            targetIdChanged ? dependency.getTargetId() : false,
                            targetIdChanged ? previousTargetId : false,
                            dependency
                        );
                    }
                }
            }

            function onDependencyStoreRefreshClearReset(store) {
                recacheAll(me, store, store.getEventStore());
            }

            function onDependencyStoreEventStoreChange(store, eventStore) {
                recacheAll(me, store, eventStore);
                attachToEventStore(eventStore);
            }

            function onEventIdChanged(eventStore, event, oldId, newId) {
                moveDependencies(me, oldId, newId);
            }

            function onEventAdd(eventStore, events) {
                complementCache(me, events);
            }

            function onEventNodeAppend(parent, node) {
                complementCache(me, cellArray[0] = node, cellArray);
            }

            function onEventNodeInsert(parent, node) {
                complementCache(me, cellArray[0] = node, cellArray);
            }

            function onEventRemove(store, events, index, isMove) {
                !isMove && uncacheEventDependencies(me, events);
            }

            function onEventNodeRemove(parent, node, isMove) {
                !isMove && uncacheEventDependencies(me, cellArray[0] = node, cellArray);
            }

            function onEventStoreRefreshClearReset() {
                recacheAll(me, me.dependencyStore, me.dependencyStore.getEventStore());
            }

            function onCacheInvalidate(store, keys) {
                if (!keys) {
                    recacheAll(me, me.dependencyStore, me.eventStore);
                }
                else {
                    if (!Ext.isArray(keys)) {
                        keys = [keys];
                    }
                    recacheKeys(me, keys, me.dependencyStore, me.eventStore);
                }
            }

            function attachToEventStore(store) {
                var listeners;

                Ext.destroy(me.eventStoreDetacher);

                if (store) {

                    listeners = {
                        'idchanged'      : onEventIdChanged,
                        'cacheresethint' : onEventStoreRefreshClearReset,
                        'clear'          : onEventStoreRefreshClearReset,
                        'refresh'        : onEventStoreRefreshClearReset,
                        // escape hatch
                        'event-dependency-cache-invalidate' : onCacheInvalidate,
                        // subscribing to the CRUD using priority - should guarantee that our listeners
                        // will be called first (before any other listeners, that could be provided in the "listeners" config)
                        // and state in other listeners will be correct
                        priority        : 100,
                        destroyable     : true
                    };

                    if (store.isTreeStore) {
                        listeners = Ext.apply(listeners, {
                            'nodeappend'     : onEventNodeAppend,
                            'nodeinsert'     : onEventNodeInsert,
                            'noderemove'     : onEventNodeRemove,
                            'rootchange'     : onEventStoreRefreshClearReset
                        });
                    }
                    else {
                        listeners = Ext.apply(listeners, {
                            'add'            : onEventAdd,
                            'remove'         : onEventRemove
                        });
                    }

                    me.eventStoreDetacher = store.on(listeners);
                }
            }

            me.dependencyStoreDetacher = dependencyStore.on({
                'add'              : onDependencyAdd,
                'remove'           : onDependencyRemove,
                'update'           : onDependencyUpdate,
                'refresh'          : onDependencyStoreRefreshClearReset,
                'cacheresethint'   : onDependencyStoreRefreshClearReset,
                'clear'            : onDependencyStoreRefreshClearReset,
                'eventstorechange' : onDependencyStoreEventStoreChange,
                // escape hatch
                'event-dependency-cache-invalidate' : onCacheInvalidate,
                // subscribing to the CRUD using priority - should guarantee that our listeners
                // will be called first (before any other listeners, that could be provided in the "listeners" config)
                // and state in other listeners will be correct
                priority           : 100,
                destroyable        : true
            });

            recacheAll(me, dependencyStore, dependencyStore.getEventStore());
        },

        destroy : function() {
            var me = this;
            Ext.destroyMembers(
                me,
                'dependencyStoreDetacher',
                'eventStoreDetacher'
            );
            me.dependencyStore = null;
        },

        // This cache maintain it's own content and doesn't need fallback query via fn parameter,
        // so I override this method to ignore the fallback query
        get : function(k, fn) {
            var me = this;
            return me.callParent([k]);
        },

        getSuccessors : function(k, fn) {
            var me = this;
            return me.get(me.self.makeSuccessorsKey(me.key(k)), fn);
        },

        getPredecessors : function(k, fn) {
            var me = this;
            return me.get(me.self.makePredecessorsKey(me.key(k)), fn);
        },

        addSuccessor : function(k, v) {
            var me = this;
            return arguments.length > 1 ? me.add(me.self.makeSuccessorsKey(me.key(k)), v) : me.add(me.self.makeSuccessorsKey(me.key(k)));
        },

        addPredecessor : function(k, v) {
            var me = this;
            return arguments.length > 1 ? me.add(me.self.makePredecessorsKey(me.key(k)), v) : me.add(me.self.makePredecessorsKey(me.key(k)));
        },

        setSuccessors : function(k, vals) {
            var me = this;
            me.set(me.self.makeSuccessorsKey(me.key(k)), vals);
        },

        setPredecessors : function(k, vals) {
            var me = this;
            me.set(me.self.makePredecessorsKey(me.key(k)), vals);
        },

        removeSuccessor : function(k, v) {
            var me = this;
            return me.remove(me.self.makeSuccessorsKey(me.key(k)), v);
        },

        removePredecessor : function(k, v) {
            var me = this;
            return me.remove(me.self.makePredecessorsKey(me.key(k)), v);
        },

        moveSuccessors : function(oldKey, newKey, v) {
            var me = this;
            return arguments.length >= 3 ?
                me.move(me.self.makeSuccessorsKey(me.key(oldKey)), me.self.makeSuccessorsKey(me.key(newKey)), v) :
                me.move(me.self.makeSuccessorsKey(me.key(oldKey)), me.self.makeSuccessorsKey(me.key(newKey)));
        },

        movePredecessors : function(oldKey, newKey, v) {
            var me = this;
            return arguments.length >= 3 ?
                me.move(me.self.makePredecessorsKey(me.key(oldKey)), me.self.makePredecessorsKey(me.key(newKey)), v) :
                me.move(me.self.makePredecessorsKey(me.key(oldKey)), me.self.makePredecessorsKey(me.key(newKey)));
        },

        clearSuccessors : function(k) {
            var me = this;
            return me.clear(me.self.makeSuccessorsKey(me.key(k)));
        },

        clearPredecessors : function(k) {
            var me = this;
            return me.clear(me.self.makePredecessorsKey(me.key(k)));
        },

        inheritableStatics : {
            splitKey : function(k) {
                k = k.split('@#!#@');
                return {
                    id   : k[0],
                    type : k.length && k[1] || false
                };
            },

            makeSuccessorsKey : function(k) {
                return k + '@#!#@succ';
            },

            makePredecessorsKey : function(k) {
                return k + '@#!#@pred';
            }
        }
    };
});
