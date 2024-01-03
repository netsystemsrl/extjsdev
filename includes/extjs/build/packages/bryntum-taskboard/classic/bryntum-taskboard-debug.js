/**
 * @class Sch.util.Patch
 * @static
 * @private
 * Private utility class for Ext JS patches for the Bryntum components.
 *
 * Each subclass of this should patch *ONE* platform bug, to be able to easily scope the fix only to affected versions
 */
Ext.define('Sch.util.Patch', {
    // Trial package dependencies
    uses: [
        'Ext.util.Cookies',
        'Ext.data.Connection',
        'Ext.Component'
    ],
    /**
     * @cfg {String} target The class name to override
     */
    target: null,
    /**
     * @cfg {String} minVersion The minimum Ext JS version for which this override is applicable. E.g. "4.0.5"
     */
    minVersion: null,
    /**
     * @cfg {String} maxVersion The highest Ext JS version for which this override is applicable. E.g. "4.0.7"
     */
    maxVersion: null,
    /**
     * @cfg {String} reportUrl A url to the forum post describing the bug/issue in greater detail
     */
    reportUrl: null,
    /**
     * @cfg {String} obsoleteTestName A name of the test checking if this patch is obsolete and might be removed
     */
    obsoleteTestName: null,
    /**
     * @cfg {String} description A brief description of why this override is required
     */
    description: null,
    /**
     * @cfg {Function} applyFn A function that will apply the patch(es) manually, instead of using 'overrides';
     */
    applyFn: null,
    /**
     * @cfg {Boolean} ieOnly true if patch is only applicable to IE
     */
    ieOnly: false,
    /**
     * @cfg {Boolean} macOnly true if patch is only applicable for Mac
     */
    macOnly: false,
    /**
     * @cfg {Object} overrides a custom object containing the methods to be overridden.
     */
    overrides: null,
    onClassExtended: function(cls, data) {
        if (Sch.disableOverrides) {
            return;
        }
        if (data.ieOnly && !Ext.isIE) {
            return;
        }
        if (data.macOnly && !Ext.isMac) {
            return;
        }
        if ((!data.minVersion || Ext.versions.extjs.equals(data.minVersion) || Ext.versions.extjs.isGreaterThan(data.minVersion)) && (!data.maxVersion || Ext.versions.extjs.equals(data.maxVersion) || Ext.versions.extjs.isLessThan(data.maxVersion))) {
            // Make sure class is loaded before applying override
            Ext.require(data.target, function() {
                if (data.applyFn) {
                    // Custom override, implementor has full control
                    data.applyFn();
                } else if (data.overrides) {
                    // Simple case, just an Ext override
                    Ext.ClassManager.get(data.target).override(data.overrides);
                }
            });
        }
    }
});

// https://app.assembla.com/spaces/bryntum/tickets/4216
// #4216 - Gantt doesn't work under FF52 on windows
Ext.define('Kanban.patch.EXTJS_23846', {
    extend: 'Sch.util.Patch',
    requires: [
        'Ext.dom.Element',
        'Ext.event.publisher.Gesture'
    ],
    target: [
        'Ext.dom.Element',
        'Ext.event.publisher.Gesture'
    ],
    maxVersion: '6.2.2',
    applyFn: function() {
        if (Ext.firefoxVersion < 51)  {
            return;
        }
        
        if (!Ext.ClassManager.isCreated('EXTJS_23846.Element')) {
            Ext.define('EXTJS_23846.Element', {
                override: 'Ext.dom.Element'
            }, function(Element) {
                var supports = Ext.supports,
                    proto = Element.prototype,
                    eventMap = proto.eventMap,
                    additiveEvents = proto.additiveEvents;
                if (Ext.os.is.Desktop && supports.TouchEvents && !supports.PointerEvents) {
                    eventMap.touchstart = 'mousedown';
                    eventMap.touchmove = 'mousemove';
                    eventMap.touchend = 'mouseup';
                    eventMap.touchcancel = 'mouseup';
                    additiveEvents.mousedown = 'mousedown';
                    additiveEvents.mousemove = 'mousemove';
                    additiveEvents.mouseup = 'mouseup';
                    additiveEvents.touchstart = 'touchstart';
                    additiveEvents.touchmove = 'touchmove';
                    additiveEvents.touchend = 'touchend';
                    additiveEvents.touchcancel = 'touchcancel';
                    additiveEvents.pointerdown = 'mousedown';
                    additiveEvents.pointermove = 'mousemove';
                    additiveEvents.pointerup = 'mouseup';
                    additiveEvents.pointercancel = 'mouseup';
                }
            });
        }
        if (!Ext.ClassManager.isCreated('EXTJS_23846.Gesture')) {
            Ext.define('EXTJS_23846.Gesture', {
                override: 'Ext.event.publisher.Gesture'
            }, function(Gesture) {
                var me = Gesture.instance;
                if (Ext.supports.TouchEvents && !Ext.isWebKit && Ext.os.is.Desktop) {
                    me.handledDomEvents.push('mousedown', 'mousemove', 'mouseup');
                    me.registerEvents();
                }
            });
        }
    }
});

/**
 * This mixin eliminates differences between flat/tree store in get by [internal] id functionality and it should be
 * mixed into data model stores.
 *
 * It adds two methods {@link #getModelById getModelById()} and {@link #getModelByInternalId getModelByInternalId()}
 * which should be used everywhere in the code instead of native getById() / getByInternalId() methods.
 *
 * @private
 */
Ext.define('Sch.data.mixin.UniversalModelGetter', {
    /**
     * @method getModelById
     * @param {String/Number} id
     * @return {Ext.data.Model/Null}
     */
    /**
     * @method getModelByInternalId
     * @param {String/Number} internalId
     * @return {Ext.data.Model/Null}
     */
    onClassMixedIn: function(targetClass) {
        var overrides = {};
        // getModelById:
        // -------------
        // - Tree store case
        if (targetClass.prototype.isTreeStore) {
            overrides.getModelById = targetClass.prototype.getNodeById;
        } else // - Flat store case
        {
            overrides.getModelById = targetClass.prototype.getById;
        }
        // getModelByInternalId:
        // ---------------------
        // - Tree store case (relaying heavily on the Sch.patch.TreeStoreInternalIdMap)
        if (targetClass.prototype.isTreeStore) {
            overrides.getModelByInternalId = function(id) {
                return this.byInternalIdMap[id] || null;
            };
        } else // - Flat store case
        {
            overrides.getModelByInternalId = targetClass.prototype.getByInternalId;
        }
        Ext.override(targetClass, overrides);
    }
});

/**
 * This mixin intercepts a set of store methods and firing a set of events providing a cache with a better hint
 * when to update itself.
 *
 * @private
 */
Ext.define('Sch.data.mixin.CacheHintHelper', {
    extend: 'Ext.Mixin',
    mixinConfig: {
        before: {
            loadRecords: 'loadRecords',
            removeAll: 'removeAll'
        }
    },
    // Call to loadRecords() results in 'datachanged' and 'refresh' events, but 'datachanged' is also fired upon
    // call to add/remove/write/filter/sort/removeAll so a cache cannot detect what method call results in 'datachanged'
    // in case of previosly mentioned methods a cache shouldn't handle 'datachanged' event it is not affected by
    // write/filter/sort at all, as for add/remove/removeAll it listens to preceding events like 'add'/'remove'/'clear'
    // and reflects updates correspondingly. But in case of loadRecords() the sequence of events fired 'datachanged' and
    // 'refresh' provides too little information to make right decision whether to reset a cache or not, moreover resetting
    // a cache on 'refresh' is to late since a lot of logic (rendering logic especially) start quering the store
    // upon 'datachanged' event and thus if cache wasn't reset it will provide that logic with outdated data.
    // Thus I have to override loadRecords() and make it fire private 'cacheresethint' event to provide a cache with
    // a way to reset itself beforehand.
    loadRecords: function() {
        this.fireEvent('cacheresethint', this);
    },
    // If no event is fired for the removal, we need to clear cache manually
    removeAll: function(silent) {
        if (silent) {
            this.fireEvent('cacheresethint', this);
        }
    }
});

/**
 * @class Sch.data.mixin.ResourceStore
 * This is a mixin for the ResourceStore functionality. It is consumed by the {@link Sch.data.ResourceStore} class ("usual" store) and {@link Sch.data.ResourceTreeStore} - tree store.
 *
 */
Ext.define("Sch.data.mixin.ResourceStore", {
    eventStore: null,
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
            oldStore;
        if (me.eventStore !== eventStore) {
            oldStore = me.eventStore;
            me.eventStore = eventStore && Ext.StoreMgr.lookup(eventStore) || null;
            /**
             * @event eventstorechange
             * Fires when new event store is set via {@link #setEventStore} method.
             * @param {Sch.data.ResourceStore}   this
             * @param {Sch.data.EventStore|null} newEventStore
             * @param {Sch.data.EventStore|null} oldEventStore
             */
            me.fireEvent('eventstorechange', me, eventStore, oldStore);
        }
    },
    getScheduledEventsInTimeSpan: function(start, end, eventStore) {
        var events = [];
        var DATE = Sch.util.Date;
        eventStore = eventStore || this.getEventStore();
        Ext.Array.each(this.getRange(), function(resource) {
            Ext.Array.each(eventStore.getEventsForResource(resource), function(event) {
                if (event.intersectsRange(start, end)) {
                    events.push(event);
                }
            });
        });
        return events;
    }
});

/**
 @class Robo.data.Store

 This is a mixin for your data stores, enabling integration with the Robo undo/redo framework.
 It should be included in your store classes as any other mixin:

 Ext.define('Example.store.Branch', {
        extend      : 'Ext.data.Store',

        mixins      : { robo : 'Robo.data.Store' },

        ...
    });

 With this mixin, {@link Robo.Manager} will call various "hook" methods of the store, notifying it about
 the current state of the data flow, like {@link #beforeUndoRedo}, {@link #afterUndoRedo}.

 The Store might override those methods, for example to turn off/on cache recalculation or other additional
 processing during the execution of the transaction.

 */
Ext.define('Robo.data.Store', {
    extend: 'Ext.Mixin',
    requires: [
        'Ext.util.Observable'
    ],
    undoRedoPostponed: null,
    inUndoRedoTransaction: false,
    undoRedoEventBus: null,
    /**
     * This is an important part of undo/redo management, it allows an undo/redo manager to always be notified about
     * low-level events of a store.
     */
    mixinConfig: {
        before: {
            constructor: 'constructor',
            destroy: 'destroy',
            fireEventArgs: 'fireEventArgs',
            setRoot: 'beforeSetRoot',
            fillNode: 'beforeFillNode'
        },
        after: {
            setRoot: 'afterSetRoot',
            fillNode: 'afterFillNode'
        }
    },
    constructor: function() {
        var me = this;
        me.undoRedoEventBus = new Ext.util.Observable();
    },
    destroy: function() {
        Ext.destroy(this.undoRedoEventBus);
    },
    fireEventArgs: function(eventName, args) {
        var me = this;
        // HACK:
        // Args is an array (i.e. passes by reference) we will use it to mark it as being fired already
        // by undo/redo event bus by adding a private property to it, otherwise we will be firing the same event
        // twice if/when the event is suspended on the original bus, queued and then fired again upon resuming.
        // Since the same args array might be used several times (in 'before' event and 'normal' event, for example),
        // we do not use just boolean flag, instead we use a map with event names as keys.
        if (!args.hasOwnProperty('$undoRedoEventBusFired')) {
            args.$undoRedoEventBusFired = {};
        }
        if (!args.$undoRedoEventBusFired[eventName]) {
            args.$undoRedoEventBusFired[eventName] = true;
            me.undoRedoEventBus.hasListener(eventName) && me.undoRedoEventBus.fireEventArgs(eventName, args);
        }
    },
    /**
     * Checks whether an undo/redo transaction is currently in progress. Not to be confused
     * with the {@link #isUndoingOrRedoing}
     *
     * @return {Boolean}
     */
    isInUndoRedoTransaction: function() {
        return this.inUndoRedoTransaction;
    },
    /**
     * Called by undo/redo manager when starting a new undo/redo transaction
     *
     * @param {Robo.Manager} manager
     * @param {Robo.Transaction} transaction
     */
    onUndoRedoTransactionStart: function(manager, transaction) {
        this.inUndoRedoTransaction = true;
    },
    /**
     * Called by undo/redo manager when finishing an undo/redo transaction
     *
     * @param {Robo.Manager} manager
     * @param {Robo.Transaction} transaction
     */
    onUndoRedoTransactionEnd: function(manager, transaction) {
        this.inUndoRedoTransaction = false;
    },
    /**
     * Checks wheither a previously recorded undo/redo transaction is being rolled back or replayed.
     *
     * @return {Boolean}
     */
    isUndoingOrRedoing: function() {
        return !!this.undoRedoPostponed;
    },
    /**
     * Called by undo manager before executing a previously recorded undo/redo transaction
     *
     * @param {Robo.Manager} manager
     */
    beforeUndoRedo: function(manager) {
        this.undoRedoPostponed = [];
    },
    /**
     * Called by undo manager after executing a previously recorded undo/redo transaction
     *
     * @param {Robo.Manager} manager
     */
    afterUndoRedo: function(manager) {
        var me = this;
        if (me.undoRedoPostponed) {
            Ext.Array.forEach(me.undoRedoPostponed, function(fn) {
                fn();
            });
        }
        me.undoRedoPostponed = null;
    },
    /**
     * Store might use this method to postpone code execution to the moment right before undo/redo transaction is
     * done. The code postponed will be called right before the call to the {@link afterUndoRedo()} method.
     *
     * @param {Function} fn A code to postpone
     */
    postponeAfterUndoRedo: function(fn) {
        Ext.Assert && Ext.Assert.isFunction(fn, 'Parameter must be a function');
        this.undoRedoPostponed.push(fn);
    },
    beforeSetRoot: function() {
        this.__isSettingRoot = true;
    },
    afterSetRoot: function() {
        this.__isSettingRoot = false;
        // https://www.sencha.com/forum/showthread.php?307767-TreeStore-removeAll-doesn-t-fire-quot-clear-quot&p=1124119#post1124119
        if (!this.getRoot()) {
            this.fireEvent('clear', this);
        }
    },
    beforeFillNode: function(node) {
        if (node.isRoot())  {
            this.beforeSetRoot();
        }
        
    },
    afterFillNode: function(node) {
        if (node.isRoot())  {
            this.afterSetRoot();
        }
        
    },
    /**
     * Returns true if this store is in process of loading/filling the root node
     *
     * @return {Boolean}
     */
    isRootSettingOrLoading: function() {
        return this.isLoading() || (this.isTreeStore && this.__isSettingRoot);
    }
});

/**
 * Base locale class. You need to subclass it, when creating new locales for Bryntum components. Usually subclasses of this class
 * will be singletones.
 *
 * See <a href="#!/guide/gantt_scheduler_localization">Localization guide</a> for additional details.
 */
Ext.define('Sch.locale.Locale', {
    /**
     * @cfg {Object} l10n An object with the keys corresponding to class names and values are in turn objects with "phraseName/phraseTranslation"
     * key/values. For example:
     *
     * ```javascript
     *    l10n : {
     *       'Sch.plugin.EventEditor' : {
     *           saveText   : 'Speichern',
     *           deleteText : 'Löschen',
     *           cancelText : 'Abbrechen'
     *       },
     *
     *       'Sch.plugin.CurrentTimeLine' : {
     *           tooltipText : 'Aktuelle Zeit'
     *       },
     *
     *       ...
     *   }
     * ```
     */
    l10n: null,
    localeName: null,
    namespaceId: null,
    constructor: function() {
        if (!Sch.locale.Active) {
            Sch.locale.Active = {};
            this.bindRequire();
        }
        var name = this.self.getName().split('.');
        var localeName = this.localeName = name.pop();
        this.namespaceId = name.join('.');
        var currentLocale = Sch.locale.Active[this.namespaceId];
        // let's localize all the classes that are loaded
        // except the cases when English locale is being applied over some non-english locale
        if (!(localeName == 'En' && currentLocale && currentLocale.localeName != 'En'))  {
            this.apply();
        }
        
    },
    bindRequire: function() {
        // OVERRIDE
        // we need central hook to localize class once it's been created
        // to achieve it we override Ext.ClassManager.triggerCreated
        var _triggerCreated = Ext.ClassManager.triggerCreated;
        Ext.ClassManager.triggerCreated = function(className) {
            _triggerCreated.apply(this, arguments);
            if (className) {
                var cls = Ext.ClassManager.get(className);
                // trying to apply locales for the loaded class
                for (var namespaceId in Sch.locale.Active) {
                    Sch.locale.Active[namespaceId].apply(cls);
                }
            }
        };
    },
    applyToClass: function(className, cls) {
        var me = this,
            localeId = me.self.getName();
        cls = cls || Ext.ClassManager.get(className);
        if (cls && (cls.activeLocaleId !== localeId)) {
            // if (className=='Gnt.column.StartDate') debugger
            var locale = me.l10n[className];
            // if it's procedural localization - run provided callback
            if (typeof locale === 'function') {
                locale(className);
            } else {
                // if it's a singleton - apply to it
                if (cls.singleton) {
                    cls.l10n = Ext.apply({}, locale, cls.prototype && cls.prototype.l10n);
                } else // otherwise we override class
                {
                    if (cls.prototype.hasOwnProperty('l10n'))  {
                        locale = Ext.apply({}, locale, cls.prototype && cls.prototype.l10n);
                    }
                    
                    Ext.override(cls, {
                        l10n: locale
                    });
                }
            }
            // keep applied locale
            cls.activeLocaleId = localeId;
            // for singletons we can have some postprocessing
            if (cls.onLocalized)  {
                cls.onLocalized();
            }
            
        }
    },
    /**
     * Apply this locale to classes.
     * @param {String[]/Object[]} [classNames] Array of class names (or classes themself) to localize.
     * If no classes specified then will localize all existing classes.
     */
    apply: function(classNames) {
        if (this.l10n) {
            var me = this;
            // if class name is specified
            if (classNames) {
                if (!Ext.isArray(classNames))  {
                    classNames = [
                        classNames
                    ];
                }
                
                var name, cls;
                for (var i = 0,
                    l = classNames.length; i < l; i++) {
                    if (Ext.isObject(classNames[i])) {
                        if (classNames[i].singleton) {
                            cls = classNames[i];
                            name = Ext.getClassName(Ext.getClass(cls));
                        } else {
                            cls = Ext.getClass(classNames[i]);
                            name = Ext.getClassName(cls);
                        }
                    } else {
                        cls = null;
                        name = 'string' === typeof classNames[i] ? classNames[i] : Ext.getClassName(classNames[i]);
                    }
                    if (name) {
                        if (name in this.l10n) {
                            me.applyToClass(name, cls);
                        }
                    }
                }
            } else // localize all the classes that we know about
            {
                // update active locales
                Sch.locale.Active[this.namespaceId] = this;
                for (var className in this.l10n) {
                    me.applyToClass(className);
                }
            }
        }
    }
});

/**
 * English translations for the Scheduler component
 *
 * NOTE: To change locale for month/day names you have to use the corresponding Ext JS language file.
 */
Ext.define('Sch.locale.En', {
    extend: 'Sch.locale.Locale',
    singleton: true,
    l10n: {
        'Sch.util.Date': {
            unitNames: {
                YEAR: {
                    single: 'year',
                    plural: 'years',
                    abbrev: 'yr'
                },
                QUARTER: {
                    single: 'quarter',
                    plural: 'quarters',
                    abbrev: 'q'
                },
                MONTH: {
                    single: 'month',
                    plural: 'months',
                    abbrev: 'mon'
                },
                WEEK: {
                    single: 'week',
                    plural: 'weeks',
                    abbrev: 'w'
                },
                DAY: {
                    single: 'day',
                    plural: 'days',
                    abbrev: 'd'
                },
                HOUR: {
                    single: 'hour',
                    plural: 'hours',
                    abbrev: 'h'
                },
                MINUTE: {
                    single: 'minute',
                    plural: 'minutes',
                    abbrev: 'min'
                },
                SECOND: {
                    single: 'second',
                    plural: 'seconds',
                    abbrev: 's'
                },
                MILLI: {
                    single: 'ms',
                    plural: 'ms',
                    abbrev: 'ms'
                }
            }
        },
        'Sch.model.CalendarDay': {
            startTimeAfterEndTime: 'Start time {0} is greater than end time {1}',
            availabilityIntervalsShouldNotIntersect: 'Availability intervals should not intersect: [{0}] and [{1}]',
            invalidFormat: 'Invalid format for availability string: {0}. It should have exact format: hh:mm-hh:mm'
        },
        "Sch.panel.SchedulerTree": {
            'All day': 'All day'
        },
        "Sch.panel.SchedulerGrid": {
            'All day': 'All day'
        },
        'Sch.panel.TimelineGridPanel': {
            weekStartDay: 1,
            loadingText: 'Loading, please wait...',
            savingText: 'Saving changes, please wait...'
        },
        'Sch.panel.TimelineTreePanel': {
            weekStartDay: 1,
            loadingText: 'Loading, please wait...',
            savingText: 'Saving changes, please wait...'
        },
        'Sch.mixin.SchedulerView': {
            loadingText: 'Loading events...'
        },
        'Sch.plugin.CurrentTimeLine': {
            tooltipText: 'Current time'
        },
        //region Recurrence
        'Sch.widget.recurrence.ConfirmationDialog': {
            'delete-title': 'You\u2019re deleting an event',
            'delete-all-message': 'Do you want to delete all occurrences of this event?',
            'delete-further-message': 'Do you want to delete this and all future occurrences of this event, or only the selected occurrence?',
            'delete-all-btn-text': 'Delete All',
            'delete-further-btn-text': 'Delete All Future Events',
            'delete-only-this-btn-text': 'Delete Only This Event',
            'update-title': 'You\u2019re changing a repeating event',
            'update-all-message': 'Do you want to change all occurrences of this event?',
            'update-further-message': 'Do you want to change only this occurrence of the event, or this and all future occurrences?',
            'update-all-btn-text': 'All',
            'update-further-btn-text': 'All Future Events',
            'update-only-this-btn-text': 'Only This Event',
            'Yes': 'Yes',
            'Cancel': 'Cancel'
        },
        'Sch.widget.recurrence.Dialog': {
            'Repeat event': 'Repeat event',
            'Cancel': 'Cancel',
            'Save': 'Save'
        },
        'Sch.widget.recurrence.Form': {
            'Frequency': 'Frequency',
            'Every': 'Every',
            'DAILYintervalUnit': 'day(s)',
            'WEEKLYintervalUnit': 'week(s) on:',
            'MONTHLYintervalUnit': 'month(s)',
            'YEARLYintervalUnit': 'year(s) in:',
            'Each': 'Each',
            'On the': 'On the',
            'End repeat': 'End repeat',
            'time(s)': 'time(s)'
        },
        'Sch.widget.recurrence.field.DaysComboBox': {
            'day': 'day',
            'weekday': 'weekday',
            'weekend day': 'weekend day'
        },
        'Sch.widget.recurrence.field.PositionsComboBox': {
            'position1': 'first',
            'position2': 'second',
            'position3': 'third',
            'position4': 'fourth',
            'position5': 'fifth',
            'position-1': 'last'
        },
        'Sch.data.util.recurrence.Legend': {
            // list delimiters
            ', ': ', ',
            ' and ': ' and ',
            // frequency patterns
            'Daily': 'Daily',
            // Weekly on Sunday
            // Weekly on Sun, Mon and Tue
            'Weekly on {1}': 'Weekly on {1}',
            // Monthly on 16
            // Monthly on the last weekday
            'Monthly on {1}': 'Monthly on {1}',
            // Yearly on 16 of January
            // Yearly on the last weekday of January and February
            'Yearly on {1} of {2}': 'Yearly on {1} of {2}',
            // Every 11 days
            'Every {0} days': 'Every {0} days',
            // Every 2 weeks on Sunday
            // Every 2 weeks on Sun, Mon and Tue
            'Every {0} weeks on {1}': 'Every {0} weeks on {1}',
            // Every 2 months on 16
            // Every 2 months on the last weekday
            'Every {0} months on {1}': 'Every {0} months on {1}',
            // Every 2 years on 16 of January
            // Every 2 years on the last weekday of January and February
            'Every {0} years on {1} of {2}': 'Every {0} years on {1} of {2}',
            // day position translations
            'position1': 'the first',
            'position2': 'the second',
            'position3': 'the third',
            'position4': 'the fourth',
            'position5': 'the fifth',
            'position-1': 'the last',
            // day options
            'day': 'day',
            'weekday': 'weekday',
            'weekend day': 'weekend day',
            // {0} - day position info ("the last"/"the first"/...)
            // {1} - day info ("Sunday"/"Monday"/.../"day"/"weekday"/"weekend day")
            // For example:
            //  "the last Sunday"
            //  "the first weekday"
            //  "the second weekend day"
            'daysFormat': '{0} {1}'
        },
        'Sch.widget.recurrence.field.StopConditionComboBox': {
            'Never': 'Never',
            'After': 'After',
            'On date': 'On date'
        },
        'Sch.widget.recurrence.field.FrequencyComboBox': {
            'Daily': 'Daily',
            'Weekly': 'Weekly',
            'Monthly': 'Monthly',
            'Yearly': 'Yearly'
        },
        'Sch.widget.recurrence.field.RecurrenceComboBox': {
            'None': 'None',
            'Custom...': 'Custom...'
        },
        'Sch.widget.EventEditor': {
            'Repeat': 'Repeat',
            saveText: 'Save',
            deleteText: 'Delete',
            cancelText: 'Cancel',
            nameText: 'Name',
            allDayText: 'All day',
            startDateText: 'Start',
            endDateText: 'End',
            resourceText: 'Resource'
        },
        //endregion Recurrence
        'Sch.plugin.SimpleEditor': {
            newEventText: 'New booking...'
        },
        'Sch.widget.ExportDialogForm': {
            formatFieldLabel: 'Paper format',
            orientationFieldLabel: 'Orientation',
            rangeFieldLabel: 'Schedule range',
            showHeaderLabel: 'Show header',
            showFooterLabel: 'Show footer',
            orientationPortraitText: 'Portrait',
            orientationLandscapeText: 'Landscape',
            completeViewText: 'Complete schedule',
            currentViewText: 'Visible schedule',
            dateRangeText: 'Date range',
            dateRangeFromText: 'Export from',
            dateRangeToText: 'Export to',
            exportersFieldLabel: 'Control pagination',
            adjustCols: 'Adjust column width',
            adjustColsAndRows: 'Adjust column width and row height',
            specifyDateRange: 'Specify date range',
            columnPickerLabel: 'Select columns',
            completeDataText: 'Complete schedule (for all events)',
            dpiFieldLabel: 'DPI (dots per inch)',
            rowsRangeLabel: 'Rows range',
            allRowsLabel: 'All rows',
            visibleRowsLabel: 'Visible rows',
            columnEmptyText: '[no title]'
        },
        'Sch.widget.ExportDialog': {
            title: 'Export Settings',
            exportButtonText: 'Export',
            cancelButtonText: 'Cancel',
            progressBarText: 'Exporting...'
        },
        'Sch.plugin.Export': {
            generalError: 'An error occurred',
            fetchingRows: 'Fetching row {0} of {1}',
            builtPage: 'Built page {0} of {1}',
            requestingPrintServer: 'Please wait...'
        },
        'Sch.plugin.Printable': {
            dialogTitle: 'Print settings',
            exportButtonText: 'Print',
            disablePopupBlocking: 'Please disable pop-up blocker since the print-plugin needs to be able to open new tabs',
            popupBlockerDetected: 'Browser pop-up blocker detected'
        },
        'Sch.plugin.exporter.AbstractExporter': {
            name: 'Exporter'
        },
        'Sch.plugin.exporter.SinglePage': {
            name: 'Single page'
        },
        'Sch.plugin.exporter.MultiPageVertical': {
            name: 'Multiple pages (vertically)'
        },
        'Sch.plugin.exporter.MultiPage': {
            name: 'Multiple pages'
        },
        'Sch.plugin.Split': {
            splitText: 'Split',
            mergeText: 'Hide split part'
        },
        'Sch.plugin.SummaryBar': {
            totalText: 'Total'
        },
        'Sch.column.ResourceName': {
            name: 'Name'
        },
        'Sch.template.DependencyInfo': {
            fromText: 'From',
            toText: 'To'
        },
        // -------------- View preset date formats/strings -------------------------------------
        'Sch.preset.Manager': {
            hourAndDay: {
                displayDateFormat: 'G:i',
                middleDateFormat: 'G:i',
                topDateFormat: 'D d/m'
            },
            secondAndMinute: {
                displayDateFormat: 'g:i:s',
                topDateFormat: 'D, d g:iA'
            },
            dayAndWeek: {
                displayDateFormat: 'm/d h:i A',
                middleDateFormat: 'D d M'
            },
            weekAndDay: {
                displayDateFormat: 'm/d',
                bottomDateFormat: 'd M',
                middleDateFormat: 'Y F d'
            },
            weekAndMonth: {
                displayDateFormat: 'm/d/Y',
                middleDateFormat: 'm/d',
                topDateFormat: 'm/d/Y'
            },
            weekAndDayLetter: {
                displayDateFormat: 'm/d/Y',
                middleDateFormat: 'D d M Y'
            },
            weekDateAndMonth: {
                displayDateFormat: 'm/d/Y',
                middleDateFormat: 'd',
                topDateFormat: 'Y F'
            },
            monthAndYear: {
                displayDateFormat: 'm/d/Y',
                middleDateFormat: 'M Y',
                topDateFormat: 'Y'
            },
            year: {
                displayDateFormat: 'm/d/Y',
                middleDateFormat: 'Y'
            },
            manyYears: {
                displayDateFormat: 'm/d/Y',
                middleDateFormat: 'Y'
            }
        }
    }
});

/**
 * A mixin providing localization functionality to the consuming class.
 *
 * ```javascript
 * Ext.define('MyToolbar', {
 *     extend : 'Ext.Toolbar',
 *     mixins : [ 'Sch.mixin.Localizable' ],
 *
 *     initComponent : function () {
 *         Ext.apply(this, {
 *             items : [
 *                 {
 *                     xtype : 'button',
 *                     // get the button label from the current locale
 *                     text  : this.L('loginText')
 *                 }
 *             ]
 *         });
 *         this.callParent(arguments);
 *     }
 * });
 * ```
 */
Ext.define('Sch.mixin.Localizable', {
    extend: 'Ext.Mixin',
    // Falling back to requiring English locale - that will cause English locale to always be included in the build
    // (even if user has specified another locale in other `requires`), but thats better than requiring users
    // to always specify and load the locale they need explicitly
    requires: [
        'Sch.locale.En'
    ],
    activeLocaleId: '',
    /**
     * @cfg {Object} l10n Container of locales for the class.
     */
    l10n: null,
    inTextLocaleRegExp: /L\{([^}]+)\}/g,
    localizableProperties: null,
    isLocaleApplied: function() {
        var activeLocaleId = (this.singleton && this.activeLocaleId) || this.self.activeLocaleId;
        if (!activeLocaleId)  {
            return false;
        }
        
        for (var ns in Sch.locale.Active) {
            if (activeLocaleId === Sch.locale.Active[ns].self.getName())  {
                return true;
            }
            
        }
        return false;
    },
    applyLocale: function() {
        // loop over activated locale classes and call apply() method of each one
        for (var ns in Sch.locale.Active) {
            Sch.locale.Active[ns].apply(this.singleton ? this : this.self.getName());
        }
    },
    /**
     * @inheritdoc #localize
     * @localdoc This is shorthand reference to {@link #localize}.
     */
    L: function() {
        return this.localize.apply(this, arguments);
    },
    /**
     * Retrieves translation of a phrase.
     * @localdoc There is a shorthand {@link #L} for this method.
     * @param {String} id Identifier of phrase.
     * @param {String} [legacyHolderProp=this.legacyHolderProp] Legacy class property name containing locales.
     * @param {Boolean} [skipLocalizedCheck=false] Do not localize class if it's not localized yet.
     * @return {String} Translation of specified phrase.
     */
    localize: function(id, legacyHolderProp, skipLocalizedCheck) {
        var result = this.getLocale(id, legacyHolderProp, skipLocalizedCheck);
        if (result === null || result === undefined)  {
            throw 'Cannot find locale: ' + id + ' [' + this.self.getName() + ']';
        }
        
        return result;
    },
    getLocale: function(id, legacyHolderProp, skipLocalizedCheck) {
        // if not localized yet let's do it
        if (!this.isLocaleApplied() && !skipLocalizedCheck) {
            this.applyLocale();
        }
        // `l10n` instance property has highest priority
        if (this.hasOwnProperty('l10n') && this.l10n && this.l10n.hasOwnProperty(id) && 'function' != typeof this.l10n[id])  {
            return this.l10n[id];
        }
        
        var clsProto = this.self && this.self.prototype;
        // let's try to get locale from class prototype `l10n` property
        var result = clsProto.l10n && clsProto.l10n[id];
        // if no transalation found
        if (result === null || result === undefined) {
            var superClass = clsProto && clsProto.superclass;
            // if parent class also has localize() method
            if (superClass && superClass.localize) {
                // try to get phrase translation from parent class
                result = superClass.localize(id, legacyHolderProp, skipLocalizedCheck);
            }
        }
        return result;
    },
    // TODO: cover below methods w/ tests and make localizeText & localizableProperties public
    localizeText: function(text) {
        var match, locale,
            regExp = this.inTextLocaleRegExp;
        while (match = regExp.exec(text)) {
            if (locale = this.getLocale(match[1])) {
                text = text.replace(match[0], locale);
            }
        }
        return text;
    },
    localizeProperties: function() {
        var me = this,
            properties = me.localizableProperties;
        if (properties) {
            properties = properties.split(',');
            for (var i = properties.length - 1; i >= 0; i--) {
                me[properties[i]] = me.localizeText(me[properties[i]]);
            }
        }
    },
    mixinConfig: {
        before: {
            'initComponent': 'beforeInitComponent'
        }
    },
    beforeInitComponent: function() {
        this.localizeProperties();
    }
});

/**
 * @class Sch.util.Date
 * @static
 * Static utility class for Date manipulation
 */
Ext.define('Sch.util.Date', {
    requires: 'Ext.Date',
    mixins: [
        'Sch.mixin.Localizable'
    ],
    singleton: true,
    // These stem from Ext.Date in Ext JS but since they don't exist in Sencha Touch we'll need to keep them here
    stripEscapeRe: /(\\.)/g,
    hourInfoRe: /([gGhHisucUOPZ]|MS)/,
    unitHash: null,
    unitsByName: {},
    // Readonly
    MIN_VALUE: new Date(-8.64E15),
    MAX_VALUE: new Date(8.64E15),
    // Override this to localize the time unit names.
    //unitNames   : {
    //YEAR    : { single : 'year', plural : 'years', abbrev : 'yr' },
    //QUARTER : { single : 'quarter', plural : 'quarters', abbrev : 'q' },
    //MONTH   : { single : 'month', plural : 'months', abbrev : 'mon' },
    //WEEK    : { single : 'week', plural : 'weeks', abbrev : 'w' },
    //DAY     : { single : 'day', plural : 'days', abbrev : 'd' },
    //HOUR    : { single : 'hour', plural : 'hours', abbrev : 'h' },
    //MINUTE  : { single : 'minute', plural : 'minutes', abbrev : 'min' },
    //SECOND  : { single : 'second', plural : 'seconds', abbrev : 's' },
    //MILLI   : { single : 'ms', plural : 'ms', abbrev : 'ms' }
    //},
    constructor: function() {
        var me = this,
            ED = Ext.Date;
        var unitHash = me.unitHash = {
                /**
             * Date interval constant
             * @static
             * @type String
             */
                MILLI: ED.MILLI,
                /**
             * Date interval constant
             * @static
             * @type String
             */
                SECOND: ED.SECOND,
                /**
             * Date interval constant
             * @static
             * @type String
             */
                MINUTE: ED.MINUTE,
                /** Date interval constant
             * @static
             * @type String
             */
                HOUR: ED.HOUR,
                /**
             * Date interval constant
             * @static
             * @type String
             */
                DAY: ED.DAY,
                /**
             * Date interval constant
             * @static
             * @type String
             */
                WEEK: "w",
                /**
             * Date interval constant
             * @static
             * @type String
             */
                MONTH: ED.MONTH,
                /**
             * Date interval constant
             * @static
             * @type String
             */
                QUARTER: "q",
                /**
             * Date interval constant
             * @static
             * @type String
             */
                YEAR: ED.YEAR
            };
        Ext.apply(me, unitHash);
        me.units = [
            me.MILLI,
            me.SECOND,
            me.MINUTE,
            me.HOUR,
            me.DAY,
            me.WEEK,
            me.MONTH,
            me.QUARTER,
            me.YEAR
        ];
    },
    onLocalized: function() {
        this.setUnitNames(this.L('unitNames'));
    },
    /**
     * Call this method to provide your own, localized values for duration unit names. See the "/js/Sch/locale/sch-lang-*.js" files for examples
     *
     * @param {Object} unitNames
     */
    setUnitNames: function(unitNames) {
        var unitsByName = this.unitsByName = {};
        this.l10n.unitNames = unitNames;
        this._unitNames = Ext.apply({}, unitNames);
        var unitHash = this.unitHash;
        // Make it possible to lookup readable date names from both 'DAY' and 'd' etc.
        for (var name in unitHash) {
            if (unitHash.hasOwnProperty(name)) {
                var unitValue = unitHash[name];
                this._unitNames[unitValue] = this._unitNames[name];
                unitsByName[name] = unitValue;
                unitsByName[unitValue] = unitValue;
            }
        }
    },
    /**
     * Checks if this date is >= start and < end.
     * @param {Date} date The source date
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} true if this date falls on the start date or between the given start and end dates.
     * @static
     */
    betweenLesser: function(date, start, end) {
        return start <= date && date < end;
    },
    /**
     * Checks if this date is >= start and <= end.
     * @param {Date} date The source date
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Boolean} true if this date falls on or between the given start and end dates.
     * @static
     */
    betweenLesserEqual: function(date, start, end) {
        return start <= date && date <= end;
    },
    /**
     * Constrains the date within a min and a max date
     * @param {Date} date The date to constrain
     * @param {Date} min Min date
     * @param {Date} max Max date
     * @return {Date} The constrained date
     * @static
     */
    constrain: function(date, min, max) {
        return this.min(this.max(date, min), max);
    },
    /**
     * Returns 1 if first param is a greater unit than second param, -1 if the opposite is true or 0 if they're equal
     * @static
     *
     * @param {String} unit1 The 1st unit
     * @param {String} unit2 The 2nd unit
     */
    compareUnits: function(u1, u2) {
        var ind1 = Ext.Array.indexOf(this.units, u1),
            ind2 = Ext.Array.indexOf(this.units, u2);
        return ind1 > ind2 ? 1 : (ind1 < ind2 ? -1 : 0);
    },
    /**
     * Returns true if first unit passed is strictly greater than the second.
     * @static
     *
     * @param {String} unit1 The 1st unit
     * @param {String} unit2 The 2nd unit
     */
    isUnitGreater: function(u1, u2) {
        return this.compareUnits(u1, u2) > 0;
    },
    /**
     * Copies hours, minutes, seconds, milliseconds from one date to another
     * @static
     *
     * @param {Date} targetDate The target date
     * @param {Date} sourceDate The source date
     * @return {Date} The adjusted target date
     */
    copyTimeValues: function(targetDate, sourceDate) {
        targetDate.setHours(sourceDate.getHours());
        targetDate.setMinutes(sourceDate.getMinutes());
        targetDate.setSeconds(sourceDate.getSeconds());
        targetDate.setMilliseconds(sourceDate.getMilliseconds());
        return targetDate;
    },
    /**
     * Adds a date unit and interval
     * @param {Date} date The source date
     * @param {String} unit The date unit to add
     * @param {Number} value The number of units to add to the date
     * @return {Date} The new date
     * @static
     */
    add: function(date, unit, value) {
        var d = Ext.Date.clone(date);
        if (!unit || value === 0)  {
            return d;
        }
        
        switch (unit.toLowerCase()) {
            case this.MILLI:
                d = new Date(date.getTime() + value);
                break;
            case this.SECOND:
                d = new Date(date.getTime() + (value * 1000));
                break;
            case this.MINUTE:
                d = new Date(date.getTime() + (value * 60000));
                break;
            case this.HOUR:
                d = new Date(date.getTime() + (value * 3600000));
                break;
            case this.DAY:
                d.setDate(date.getDate() + value);
                if (d.getHours() === 23 && date.getHours() === 0) {
                    d = Ext.Date.add(d, Ext.Date.HOUR, 1);
                };
                break;
            case this.WEEK:
                d.setDate(date.getDate() + value * 7);
                break;
            case this.MONTH:
                var day = date.getDate();
                if (day > 28) {
                    day = Math.min(day, Ext.Date.getLastDateOfMonth(this.add(Ext.Date.getFirstDateOfMonth(date), this.MONTH, value)).getDate());
                };
                d.setDate(day);
                d.setMonth(d.getMonth() + value);
                break;
            case this.QUARTER:
                d = this.add(date, this.MONTH, value * 3);
                break;
            case this.YEAR:
                d.setFullYear(date.getFullYear() + value);
                break;
        }
        return d;
    },
    getUnitDurationInMs: function(unit) {
        // hopefully there were no DST changes in year 1
        return this.add(new Date(1, 0, 1), unit, 1) - new Date(1, 0, 1);
    },
    getMeasuringUnit: function(unit) {
        if (unit === this.WEEK) {
            return this.DAY;
        }
        return unit;
    },
    /**
     * @method getDurationInUnit
     * Returns a duration of the timeframe in the given unit.
     * @static
     * @param {Date} start The start date of the timeframe
     * @param {Date} end The end date of the timeframe
     * @param {String} unit Duration unit
     * @return {Number} The duration in the units
     */
    /** @ignore */
    getDurationInUnit: function(start, end, unit, doNotRound) {
        var units;
        switch (unit) {
            case this.YEAR:
                units = this.getDurationInYears(start, end);
                break;
            case this.QUARTER:
                units = this.getDurationInMonths(start, end) / 3;
                break;
            case this.MONTH:
                units = this.getDurationInMonths(start, end);
                break;
            case this.WEEK:
                units = this.getDurationInDays(start, end) / 7;
                break;
            case this.DAY:
                units = this.getDurationInDays(start, end);
                break;
            case this.HOUR:
                units = this.getDurationInHours(start, end);
                break;
            case this.MINUTE:
                units = this.getDurationInMinutes(start, end);
                break;
            case this.SECOND:
                units = this.getDurationInSeconds(start, end);
                break;
            case this.MILLI:
                units = this.getDurationInMilliseconds(start, end);
                break;
        }
        return doNotRound ? units : Math.round(units);
    },
    getUnitToBaseUnitRatio: function(baseUnit, unit) {
        if (baseUnit === unit) {
            return 1;
        }
        switch (baseUnit) {
            case this.YEAR:
                switch (unit) {
                    case this.QUARTER:
                        return 1 / 4;
                    case this.MONTH:
                        return 1 / 12;
                };
                break;
            case this.QUARTER:
                switch (unit) {
                    case this.YEAR:
                        return 4;
                    case this.MONTH:
                        return 1 / 3;
                };
                break;
            case this.MONTH:
                switch (unit) {
                    case this.YEAR:
                        return 12;
                    case this.QUARTER:
                        return 3;
                };
                break;
            case this.WEEK:
                switch (unit) {
                    case this.DAY:
                        return 1 / 7;
                    case this.HOUR:
                        return 1 / 168;
                };
                break;
            case this.DAY:
                switch (unit) {
                    case this.WEEK:
                        return 7;
                    case this.HOUR:
                        return 1 / 24;
                    case this.MINUTE:
                        return 1 / 1440;
                };
                break;
            case this.HOUR:
                switch (unit) {
                    case this.DAY:
                        return 24;
                    case this.MINUTE:
                        return 1 / 60;
                };
                break;
            case this.MINUTE:
                switch (unit) {
                    case this.HOUR:
                        return 60;
                    case this.SECOND:
                        return 1 / 60;
                    case this.MILLI:
                        return 1 / 60000;
                };
                break;
            case this.SECOND:
                switch (unit) {
                    case this.MILLI:
                        return 1 / 1000;
                };
                break;
            case this.MILLI:
                switch (unit) {
                    case this.SECOND:
                        return 1000;
                };
                break;
        }
        return -1;
    },
    // Returns true if a unit can be expressed as a whole number of subunits
    isUnitDivisibleIntoSubunit: function(unit, subunit) {
        var indivisible = unit === this.MONTH && subunit === this.WEEK;
        return !indivisible;
    },
    /**
     * Returns the number of milliseconds between the two dates
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} true number of minutes between the two dates
     * @static
     */
    getDurationInMilliseconds: function(start, end) {
        return (end - start);
    },
    /**
     * Returns the number of seconds between the two dates
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} The number of seconds between the two dates
     * @static
     */
    getDurationInSeconds: function(start, end) {
        return (end - start) / 1000;
    },
    /**
     * Returns the number of minutes between the two dates
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} true number of minutes between the two dates
     * @static
     */
    getDurationInMinutes: function(start, end) {
        return (end - start) / 60000;
    },
    /**
     * Returns the number of hours between the two dates.
     *
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} true number of hours between the two dates
     * @static
     */
    getDurationInHours: function(start, end) {
        return (end - start) / 3600000;
    },
    /**
     * This method returns the number of days between the two dates. It assumes a day is 24 hours and tries to take the DST into account.
     *
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} true number of days between the two dates
     *
     * @static
     */
    getDurationInDays: function(start, end) {
        var dstDiff = start.getTimezoneOffset() - end.getTimezoneOffset();
        return (end - start + dstDiff * 60 * 1000) / 86400000;
    },
    /**
     * Returns the number of whole months between the two dates
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} The number of whole months between the two dates
     * @static
     */
    getDurationInMonths: function(start, end) {
        return ((end.getFullYear() - start.getFullYear()) * 12) + (end.getMonth() - start.getMonth());
    },
    /**
     * Returns the number of years between the two dates
     * @param {Date} start Start date
     * @param {Date} end End date
     * @return {Number} The number of whole months between the two dates
     * @static
     */
    getDurationInYears: function(start, end) {
        return this.getDurationInMonths(start, end) / 12;
    },
    /**
     * Returns the lesser of the two dates
     * @param {Date} date1
     * @param {Date} date2
     * @return {Date} Returns the lesser of the two dates
     * @static
     */
    min: function(d1, d2) {
        return (d1 && d1.valueOf() || d1) < (d2 && d2.valueOf() || d2) ? d1 : d2;
    },
    // valueOf() is better for Chrome optimization
    /**
     * Returns the greater of the two dates
     * @param {Date} date1
     * @param {Date} date2
     * @return {Date} Returns the greater of the two dates
     * @static
     */
    max: function(d1, d2) {
        return (d1 && d1.valueOf() || d1) > (d2 && d2.valueOf() || d2) ? d1 : d2;
    },
    // valueOf() is better for Chrome optimization
    /**
     * Returns true if dates intersect
     * @param {Date} start1
     * @param {Date} end1
     * @param {Date} start2
     * @param {Date} end2
     * @return {Boolean} Returns true if dates intersect
     * @static
     */
    intersectSpans: function(date1Start, date1End, date2Start, date2End) {
        return this.betweenLesser(date1Start, date2Start, date2End) || this.betweenLesser(date2Start, date1Start, date1End);
    },
    /**
     * Returns a name of the duration unit, matching its property on the Sch.util.Date class.
     * So, for example:
     *
     *      Sch.util.Date.getNameOfUnit(Sch.util.Date.DAY) == 'DAY' // true
     *
     * @static
     * @param {String} unit Duration unit
     * @return {String}
     */
    getNameOfUnit: function(unit) {
        unit = this.getUnitByName(unit);
        switch (unit.toLowerCase()) {
            case this.YEAR:
                return 'YEAR';
            case this.QUARTER:
                return 'QUARTER';
            case this.MONTH:
                return 'MONTH';
            case this.WEEK:
                return 'WEEK';
            case this.DAY:
                return 'DAY';
            case this.HOUR:
                return 'HOUR';
            case this.MINUTE:
                return 'MINUTE';
            case this.SECOND:
                return 'SECOND';
            case this.MILLI:
                return 'MILLI';
        }
        throw "Incorrect UnitName";
    },
    /**
     * Returns a human-readable name of the duration unit. For for example for `Sch.util.Date.DAY` it will return either
     * "day" or "days", depending from the `plural` argument
     * @static
     * @param {String} unit Duration unit
     * @param {Boolean} plural Whether to return a plural name or singular
     * @return {String}
     */
    getReadableNameOfUnit: function(unit, plural) {
        if (!this.isLocaleApplied())  {
            this.applyLocale();
        }
        
        return this._unitNames[unit][plural ? 'plural' : 'single'];
    },
    /**
     * Returns an abbreviated form of the name of the duration unit.
     * @static
     * @param {String} unit Duration unit
     * @return {String}
     */
    getShortNameOfUnit: function(unit) {
        if (!this.isLocaleApplied())  {
            this.applyLocale();
        }
        
        return this._unitNames[unit].abbrev;
    },
    getUnitByName: function(name) {
        if (!this.isLocaleApplied())  {
            this.applyLocale();
        }
        
        if (!this.unitsByName[name]) {
            Ext.Error.raise('Unknown unit name: ' + name);
        }
        return this.unitsByName[name];
    },
    /**
     * Returns the beginning of the Nth next duration unit, after the provided `date`.
     * For example for the this call:
     *      Sch.util.Date.getNext(new Date('Jul 15, 2011'), Sch.util.Date.MONTH, 1)
     *
     * will return: Aug 1, 2011
     *
     * @static
     * @param {Date} date The date
     * @param {String} unit The duration unit
     * @param {Number} increment How many duration units to skip
     * @param {Number} [weekStartDay] The day index of the 1st day of the week.
     *                Only required when `unit` is `WEEK`. 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on (defaults to 1).
     * @param {Number} [timeZone] Time zone offset in minutes
     * @return {Date} The beginning of the next duration unit interval
     */
    getNext: function(date, unit, increment, weekStartDay, timeZone) {
        var dt = Ext.Date.clone(date);
        var hasTimeZone = timeZone != null;
        var isUTC = timeZone === 0;
        // convert to/from TZ only days and above, or hours for TZ with uneven hours offset
        var correctForTZ = this.compareUnits(this.DAY, unit) <= 0 || (unit === this.HOUR && timeZone % 60 !== 0);
        // UTC timezone has own DST correction
        if (hasTimeZone && !isUTC && correctForTZ) {
            dt = Sch.util.Date.toTimeZone(dt, timeZone);
        }
        weekStartDay = arguments.length < 4 ? 1 : weekStartDay;
        // support 0 increment
        increment = increment == null ? 1 : increment;
        switch (unit) {
            case this.MILLI:
                dt = this.add(dt, unit, increment);
                break;
            case this.SECOND:
                dt = this.add(dt, unit, increment);
                if (dt.getMilliseconds() > 0) {
                    dt.setMilliseconds(0);
                };
                break;
            case this.MINUTE:
                dt = this.add(dt, unit, increment);
                if (dt.getSeconds() > 0) {
                    dt.setSeconds(0);
                };
                if (dt.getMilliseconds() > 0) {
                    dt.setMilliseconds(0);
                };
                break;
            case this.HOUR:
                if (isUTC) {
                    dt = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours() + increment));
                } else {
                    dt = this.add(dt, unit, increment);
                    // Without these checks Firefox messes up the date and it changes timezone in certain edge cases
                    // See test 021_sch_util_date_dst.t.js
                    if (dt.getMinutes() > 0) {
                        dt.setMinutes(0);
                    }
                    if (dt.getSeconds() > 0) {
                        dt.setSeconds(0);
                    }
                    if (dt.getMilliseconds() > 0) {
                        dt.setMilliseconds(0);
                    }
                };
                break;
            case this.DAY:
                if (isUTC) {
                    // In case of UTC we just want to get start of the next day, or beginning of current day
                    dt = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate() + increment));
                } else {
                    // Check if date has 23 hrs and is in Chile timezone
                    var midnightNotInTimeScale = dt.getHours() === 23 && this.add(dt, this.HOUR, 1).getHours() === 1;
                    if (midnightNotInTimeScale) {
                        // Correct the date manually for DST transitions happening at 00:00
                        dt = this.add(dt, this.DAY, 2);
                        this.clearTime(dt);
                        return dt;
                    }
                    this.clearTime(dt);
                    dt = this.add(dt, this.DAY, increment);
                    // Brazil timezone issue #1642, tested in 028_timeaxis_dst.t.js
                    if (dt.getHours() === 1) {
                        this.clearTime(dt);
                    }
                };
                break;
            case this.WEEK:
                var day;
                if (isUTC) {
                    day = dt.getUTCDay();
                    var daysToAdd = weekStartDay - day + 7 * (increment - (weekStartDay <= day ? 0 : 1));
                    dt.setUTCDate(dt.getUTCDate() + daysToAdd);
                    dt = this.clearUTCTime(dt);
                } else {
                    this.clearTime(dt);
                    day = dt.getDay();
                    dt = this.add(dt, this.DAY, weekStartDay - day + 7 * (increment - (weekStartDay <= day ? 0 : 1)));
                    // For south american timezones, midnight does not exist on DST transitions, adjust...
                    if (dt.getDay() !== weekStartDay) {
                        dt = this.add(dt, this.HOUR, 1);
                    } else {
                        this.clearTime(dt);
                    }
                };
                break;
            case this.MONTH:
                if (isUTC) {
                    dt = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + increment, 1));
                } else {
                    dt = this.add(dt, this.MONTH, increment);
                    dt.setDate(1);
                    this.clearTime(dt);
                };
                break;
            case this.QUARTER:
                if (isUTC) {
                    var toAdd = (increment - 1) * 3 + (3 - dt.getUTCMonth() % 3);
                    dt = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + toAdd, 1));
                } else {
                    dt = this.add(dt, this.MONTH, ((increment - 1) * 3) + (3 - (dt.getMonth() % 3)));
                    this.clearTime(dt);
                    dt.setDate(1);
                };
                break;
            case this.YEAR:
                if (isUTC) {
                    dt = new Date(Date.UTC(dt.getUTCFullYear() + increment, 0, 1));
                } else {
                    dt = new Date(dt.getFullYear() + increment, 0, 1);
                };
                break;
            default:
                throw new Error('Invalid date unit' + unit);
        }
        if (hasTimeZone && !isUTC && correctForTZ) {
            // do not correct for weeks and above
            if (Sch.util.Date.compareUnits(Sch.util.Date.WEEK, unit) > 0) {
                // if DST occurred between input and output, we need to add correction
                var offset = dt.getTimezoneOffset() - date.getTimezoneOffset();
                if (offset !== 0) {
                    dt = Sch.util.Date.add(dt, this.MINUTE, offset);
                }
            }
            dt = Sch.util.Date.fromTimeZone(dt, timeZone);
            // getNext shouldn't return same date, if it wants to - just call getNext without TZ info
            if (dt - date === 0) {
                dt = this.getNext(date, unit, increment, weekStartDay);
            }
        }
        return dt;
    },
    getNumberOfMsFromTheStartOfDay: function(date) {
        return date - this.clearTime(date, true) || 86400000;
    },
    getNumberOfMsTillTheEndOfDay: function(date) {
        return this.getStartOfNextDay(date, true) - date;
    },
    getStartOfNextDay: function(date, clone, noNeedToClearTime) {
        var nextDay = this.add(noNeedToClearTime ? date : this.clearTime(date, clone), this.DAY, 1);
        // DST case
        if (nextDay.getDate() == date.getDate()) {
            var offsetNextDay = this.add(this.clearTime(date, clone), this.DAY, 2).getTimezoneOffset();
            var offsetDate = date.getTimezoneOffset();
            nextDay = this.add(nextDay, this.MINUTE, offsetDate - offsetNextDay);
        }
        return nextDay;
    },
    getEndOfPreviousDay: function(date, noNeedToClearTime) {
        var dateOnly = noNeedToClearTime ? date : this.clearTime(date, true);
        // dates are different
        if (dateOnly - date) {
            return dateOnly;
        } else {
            return this.add(dateOnly, this.DAY, -1);
        }
    },
    /**
     * Returns true if the first time span completely 'covers' the second time span. E.g.
     *      Sch.util.Date.timeSpanContains(new Date(2010, 1, 2), new Date(2010, 1, 5), new Date(2010, 1, 3), new Date(2010, 1, 4)) ==> true
     *      Sch.util.Date.timeSpanContains(new Date(2010, 1, 2), new Date(2010, 1, 5), new Date(2010, 1, 3), new Date(2010, 1, 6)) ==> false
     * @static
     * @param {Date} spanStart The start date for initial time span
     * @param {Date} spanEnd The end date for initial time span
     * @param {Date} otherSpanStart The start date for the 2nd time span
     * @param {Date} otherSpanEnd The end date for the 2nd time span
     * @return {Boolean}
     */
    timeSpanContains: function(spanStart, spanEnd, otherSpanStart, otherSpanEnd) {
        return (otherSpanStart - spanStart) >= 0 && (spanEnd - otherSpanEnd) >= 0;
    },
    /**
     * Compares two days with given precision, for example if `date1` is Aug 1st, 2014 08:00 AM and `date2`
     * is Aug 1st, 2014 09:00 and `precisionUnit` is {@link Sch.util.Date.DAY} then both dates a considered equal
     * since they point to the same day.
     *
     * @param {Date} date1
     * @param {Date} date2
     * @param {String} [precisionUnit=Sch.util.Date.MILLI]
     * @return {Integer}
     * - -1 if `date1` is lesser than `date2`
     * - +1 if `date1` is greater than `date2`
     * -  0 if `date1` is equal to `date2`
     */
    compareWithPrecision: function(date1, date2, precisionUnit) {
        var D = Sch.util.Date,
            ED = Ext.Date,
            result;
        switch (precisionUnit) {
            case D.DAY:
                date1 = Number(ED.format(date1, 'Ymd'));
                date2 = Number(ED.format(date2, 'Ymd'));
                break;
            case D.WEEK:
                date1 = Number(ED.format(date1, 'YmW'));
                date2 = Number(ED.format(date2, 'YmW'));
                break;
            case D.MONTH:
                date1 = Number(ED.format(date1, 'Ym'));
                date2 = Number(ED.format(date2, 'Ym'));
                break;
            case D.QUARTER:
                date1 = date1.getFullYear() * 4 + Math.floor(date1.getMonth() / 3);
                date2 = date2.getFullYear() * 4 + Math.floor(date2.getMonth() / 3);
                break;
            case D.YEAR:
                date1 = date1.getFullYear();
                date2 = date2.getFullYear();
                break;
            default:
            case D.MILLI:
            case D.SECOND:
            case D.MINUTE:
            case D.HOUR:
                precisionUnit = precisionUnit && this.getUnitDurationInMs(precisionUnit) || 1;
                date1 = Math.floor(date1.valueOf() / precisionUnit);
                date2 = Math.floor(date2.valueOf() / precisionUnit);
                break;
        }
        ((date1 < date2) && (result = -1)) || ((date1 > date2) && (result = +1)) || (result = 0);
        return result;
    },
    getValueInUnits: function(date, unit) {
        switch (unit) {
            case this.YEAR:
                return date.getFullYear();
            case this.QUARTER:
                return Math.floor(date.getMonth() / 3) + 1;
            case this.MONTH:
                return date.getMonth();
            case this.WEEK:
                return Ext.Date.getWeekOfYear(date);
            case this.DAY:
                return date.getDate();
            case this.HOUR:
                return date.getHours();
            case this.MINUTE:
                return date.getMinutes();
            case this.SECOND:
                return date.getSeconds();
        }
    },
    setValueInUnits: function(date, unit, value) {
        var result = Ext.Date.clone(date),
            f;
        switch (unit) {
            case this.YEAR:
                f = 'setFullYear';
                break;
            case this.MONTH:
                f = 'setMonth';
                break;
            case this.DAY:
                f = 'setDate';
                break;
            case this.HOUR:
                f = 'setHours';
                break;
            case this.MINUTE:
                f = 'setMinutes';
                break;
            case this.SECOND:
                f = 'setSeconds';
                break;
            case this.MILLI:
                f = 'setMilliseconds';
                break;
        }
        result[f](value);
        return result;
    },
    getSubUnit: function(unit) {
        switch (unit) {
            case this.YEAR:
                return this.MONTH;
            /* falls through */
            case this.MONTH:
                return this.DAY;
            /* falls through */
            case this.DAY:
                return this.HOUR;
            /* falls through */
            case this.HOUR:
                return this.MINUTE;
            /* falls through */
            case this.MINUTE:
                return this.SECOND;
            /* falls through */
            case this.SECOND:
                return this.MILLI;
        }
    },
    /* falls through */
    setValueInSubUnits: function(date, unit, value) {
        unit = this.getSubUnit(unit);
        return this.setValueInUnits(date, unit, value);
    },
    /*
     * section for calendar view related functions
     */
    // Copies date parts from source to target
    mergeDates: function(target, source, unit) {
        var copy = Ext.Date.clone(target);
        switch (unit) {
            case this.YEAR:
                copy.setFullYear(source.getFullYear());
            /* falls through */
            case this.MONTH:
                copy.setMonth(source.getMonth());
            /* falls through */
            case this.WEEK:
            /* falls through */
            case this.DAY:
                // we want to return week start day for this case
                if (unit === this.WEEK) {
                    copy = this.add(copy, this.DAY, source.getDay() - copy.getDay());
                } else {
                    copy.setDate(source.getDate());
                };
            /* falls through */
            case this.HOUR:
                copy.setHours(source.getHours());
            /* falls through */
            case this.MINUTE:
                copy.setMinutes(source.getMinutes());
            /* falls through */
            case this.SECOND:
                copy.setSeconds(source.getSeconds());
            /* falls through */
            case this.MILLI:
                copy.setMilliseconds(source.getMilliseconds());
        }
        return copy;
    },
    // splitting specified unit to subunits including start of the next span
    // e.g. week will be split to days, days to hours, etc.
    splitToSubUnits: function(start, unit, increment, weekStartDay) {
        increment = increment || 1;
        weekStartDay = arguments.length < 4 ? 1 : weekStartDay;
        switch (unit) {
            //            case this.YEAR      : return this.splitYear(start, increment, weekStartDay);
            case this.MONTH:
                return this.splitMonth(start, increment, weekStartDay);
            case this.WEEK:
            //return this.splitWeek(start, increment, weekStartDay);
            /* falls through */
            case this.DAY:
                return this.splitDay(start, increment);
            //            case this.HOUR      : return this.splitHour(start, increment);
            //            case this.MINUTE    : return this.splitMinute(start, increment);
            default:
                break;
        }
    },
    splitYear: function(start, increment) {
        var newStart = this.clearTime(start, true);
        newStart.setMonth(0);
        newStart.setDate(1);
        var result = [];
        for (var i = 0; i <= 12; i = i + increment) {
            result.push(this.add(newStart, this.MONTH, i));
        }
        return result;
    },
    splitMonth: function(start, increment, weekStartDay) {
        var newStart = this.clearTime(start, true);
        newStart.setDate(1);
        newStart = this.add(newStart, this.DAY, weekStartDay - newStart.getDay());
        var currentDate = Ext.Date.clone(newStart);
        var monthEnd = this.add(newStart, this.MONTH, 1);
        var result = [];
        for (var i = 0; currentDate.getTime() < monthEnd.getTime(); i = i + increment) {
            currentDate = this.add(newStart, this.WEEK, i);
            result.push(currentDate);
        }
        return result;
    },
    splitWeek: function(start, increment, weekStartDay) {
        var newStart = this.add(start, this.DAY, weekStartDay - start.getDay());
        newStart = this.clearTime(newStart);
        var result = [];
        for (var i = 0; i <= 7; i = i + increment) {
            result.push(this.add(newStart, this.DAY, i));
        }
        return result;
    },
    splitDay: function(start, increment) {
        var copy = this.clearTime(start, true);
        var result = [];
        for (var i = 0; i <= 24; i = i + increment) {
            result.push(this.add(copy, this.HOUR, i));
        }
        return result;
    },
    splitHour: function(start, increment) {
        var copy = new Date(start.getTime());
        copy.setMinutes(0);
        copy.setSeconds(0);
        copy.setMilliseconds(0);
        var result = [];
        for (var i = 0; i <= 60; i = i + increment) {
            result.push(this.add(copy, this.MINUTE, i));
        }
        return result;
    },
    splitMinute: function(start, increment) {
        var copy = Ext.Date.clone(start);
        copy.setSeconds(0);
        copy.setMilliseconds(0);
        var result = [];
        for (var i = 0; i <= 60; i = i + increment) {
            result.push(this.add(copy, this.SECOND, i));
        }
        return result;
    },
    // Need this to prevent some browsers (Safari in Sydney timezone) to not mess up a date
    // See tests marked *dst* and https://www.assembla.com/spaces/bryntum/tickets/1757#/activity/ticket:
    clearTime: function(dt, clone) {
        if (dt.getHours() > 0 || dt.getMinutes() > 0 || dt.getSeconds() > 0) {
            return Ext.Date.clearTime(dt, clone);
        }
        return clone ? Ext.Date.clone(dt) : dt;
    },
    clearUTCTime: function(dt) {
        dt = new Date(dt);
        dt.setUTCHours(0, 0, 0, 0);
        return dt;
    },
    getWeekNumber: function(date) {
        var target = new Date(date.valueOf());
        // ISO week date weeks start on monday
        // so correct the day number
        var dayNr = (date.getDay() + 6) % 7;
        // ISO 8601 states that week 1 is the week
        // with the first thursday of that year.
        // Set the target date to the thursday in the target week
        target.setDate(target.getDate() - dayNr + 3);
        // Store the millisecond value of the target date
        var firstThursday = target.valueOf();
        // Set the target to the first thursday of the year
        // First set the target to january first
        target.setMonth(0, 1);
        // Not a thursday? Correct the date to the next thursday
        if (target.getDay() != 4) {
            target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
        }
        // The weeknumber is the number of weeks between the
        // first thursday of the year and the thursday in the target week
        return 1 + Math.ceil((firstThursday - target) / 604800000);
    },
    // 604800000 = 7 * 24 * 3600 * 1000
    // Returns first day of week (Monday by default)
    getWeekStartDate: function(date, weekStartDay) {
        var midday = this.setDateToMidday(date, true);
        weekStartDay = typeof weekStartDay !== 'number' ? 1 : weekStartDay;
        while (midday.getDay() !== weekStartDay) {
            midday = Sch.util.Date.add(midday, Sch.util.Date.DAY, -1);
        }
        return midday;
    },
    // Returns last day of week (Sunday by default)
    getWeekEndDate: function(date, weekEndDay) {
        var midday = this.setDateToMidday(date, true);
        weekEndDay = typeof weekEndDay !== 'number' ? 0 : weekEndDay;
        while (midday.getDay() !== weekEndDay) {
            midday = Sch.util.Date.add(midday, Sch.util.Date.DAY, 1);
        }
        return midday;
    },
    setDateToHours: function(date, clone, hours) {
        if (clone) {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours);
        }
        date.setHours(hours);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        return date;
    },
    setDateToMidnight: function(date, clone) {
        return this.setDateToHours(date, clone, 0);
    },
    setDateToMidday: function(date, clone) {
        return this.setDateToHours(date, clone, 12);
    },
    isLaterDate: function(date, compareDate) {
        return !this.isSameDate(date, compareDate) && date > compareDate;
    },
    isSameDate: function(date, compareDate) {
        return date.getFullYear() === compareDate.getFullYear() && date.getMonth() === compareDate.getMonth() && date.getDate() === compareDate.getDate();
    },
    isEarlierDate: function(date, compareDate) {
        return !this.isSameDate(date, compareDate) && date < compareDate;
    },
    /**
     * Adjusts the time of the specified date to match the specified time zone. i.e. "what time is it now in this timezone?"
     *
     * JavaScript dates are always in the local time zone. This function adjusts the time to match the time in the
     * specified time zone, without altering the time zone. Thus it wont hold the same time as the original date.
     *
     * ```javascript
     * const localDate = new Date(2020, 7, 31, 7); // UTC+2
     * const utcDate   = Sch.util.Date.toTimeZone(localDate, 0); // 2020, 7, 31, 5 (still UTC+2, but appear as UTC+0)
     * ```
     * @static
     * @param {Date} date
     * @param {Number} timeZone
     * @returns {Date}
     */
    toTimeZone: function(date, timeZone) {
        var offset = date.getTimezoneOffset() + timeZone;
        var result = this.add(date, this.MINUTE, offset);
        // If date is the different time zone, add tz offset difference to it
        return this.add(result, this.MINUTE, result.getTimezoneOffset() - date.getTimezoneOffset());
    },
    /**
     * Adjusts the time of the specified date to match same local time in the specified time zone. i.e. "what time in my
     * timezone would match time in this timezone?"
     *
     * ```javascript
     * const localDate = new Date(2020, 7, 31, 7); // UTC+2
     * const utcDate   = Sch.util.Date.fromTimeZone(localDate, 0); // 2020, 7, 31, 9 (matches 2020-08-31 07:00+00:00)
     * ```
     * @static
     * @param {Date} date
     * @param {Number} timeZone
     * @returns {Date}
     */
    fromTimeZone: function(date, timeZone) {
        var offset = -date.getTimezoneOffset() - timeZone;
        return this.add(date, this.MINUTE, offset);
    },
    // returns date with time part matching UTC time
    getUTCTime: function(date) {
        // Pick any date in the mid of summer to not suffer from DST switch
        return new Date(2020, 6, 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
    },
    // returns date without time, date is matching date in UTC
    getUTCDate: function(date) {
        return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    },
    // Useful handle to format date in UTC without DST and in regular timezones. Real date in -> time zone formatted date out
    format: function(date, format, timeZone) {
        if (timeZone === 0) {
            // For UTC timezone to get rid of DST switch dates we need to remove hour information from the format string
            // and use specially crafted date to render hour info in UTC.
            // aAgGhH should be our only point of interest
            // hours
            format = format.replace('a', '%10');
            format = format.replace('A', '%11');
            format = format.replace('g', '%12');
            format = format.replace('G', '%13');
            format = format.replace('h', '%14');
            format = format.replace('H', '%15');
            // tz
            format = format.replace('O', '%16');
            format = format.replace('P', '%17');
            format = format.replace('Z', '%18');
            // iso
            format = format.replace('c', '%19');
            // days
            format = format.replace('d', '%20');
            format = format.replace('D', '%21');
            format = format.replace('j', '%22');
            format = format.replace('l', '%23');
            format = format.replace('N', '%24');
            format = format.replace('w', '%25');
            format = format.replace('z', '%26');
            // month
            format = format.replace('F', '%27');
            format = format.replace('m', '%28');
            format = format.replace('M', '%29');
            format = format.replace('n', '%30');
            // year
            format = format.replace('Y', '%31');
            format = format.replace('y', '%32');
            var result = Ext.Date.format(date, format);
            var noDSTDate = this.getUTCTime(date);
            var noDSTHours = this.getUTCDate(date);
            result = result.replace('%10', Ext.Date.format(noDSTDate, 'a'));
            result = result.replace('%11', Ext.Date.format(noDSTDate, 'A'));
            result = result.replace('%12', Ext.Date.format(noDSTDate, 'g'));
            result = result.replace('%13', Ext.Date.format(noDSTDate, 'G'));
            result = result.replace('%14', Ext.Date.format(noDSTDate, 'h'));
            result = result.replace('%15', Ext.Date.format(noDSTDate, 'H'));
            result = result.replace('%16', '+0000');
            result = result.replace('%17', '+00:00');
            result = result.replace('%18', '0');
            result = result.replace('%19', Ext.Date.format(noDSTHours, 'Y-m-d') + 'T' + Ext.Date.format(noDSTDate, 'H:i:s+00:00'));
            result = result.replace('%20', Ext.Date.format(noDSTHours, 'd'));
            result = result.replace('%21', Ext.Date.format(noDSTHours, 'D'));
            result = result.replace('%22', Ext.Date.format(noDSTHours, 'j'));
            result = result.replace('%23', Ext.Date.format(noDSTHours, 'l'));
            result = result.replace('%24', Ext.Date.format(noDSTHours, 'N'));
            result = result.replace('%25', Ext.Date.format(noDSTHours, 'w'));
            result = result.replace('%26', Ext.Date.format(noDSTHours, 'z'));
            result = result.replace('%27', Ext.Date.format(noDSTHours, 'F'));
            result = result.replace('%28', Ext.Date.format(noDSTHours, 'm'));
            result = result.replace('%29', Ext.Date.format(noDSTHours, 'M'));
            result = result.replace('%30', Ext.Date.format(noDSTHours, 'n'));
            result = result.replace('%31', Ext.Date.format(noDSTHours, 'Y'));
            result = result.replace('%32', Ext.Date.format(noDSTHours, 'y'));
            return result;
        } else {
            date = this.toTimeZone(date, timeZone);
            return Ext.Date.format(date, format);
        }
    }
});

/**
 @class Robo.data.Model

 This is a mixin for your models, enabling integration with the Robo undo/redo framework.
 It should be included in your model classes as any other mixin:

 Ext.define('Example.model.Branch', {
        extend      : 'Ext.data.Model',

        mixins      : { robo : 'Robo.data.Model' },

        ...
    });

 You might want to define an additional method {@link #getTitle} in your models. It will be used to build
 a transaction {@link Robo.Transaction#getTitle title}.

 */
Ext.define('Robo.data.Model', {
    extend: 'Ext.Mixin',
    /**
     * @cfg modelName
     *
     * Human readable name for transaction titles. Should be defined at the class level. This can be used
     * to build a simplified transaction title, including this "modelName" and model id.
     *
     * For detailed control of transaction titles, see {@link #getTitle} method.
     */
    modelName: null,
    editMementoFix: null,
    mixinConfig: {
        before: {
            endEdit: 'onBeforeEndEdit'
        },
        after: {
            endEdit: 'onAfterEndEdit'
        }
    },
    // Fix for the incorrect behavior of the "previousValues" implementation in ExtJS
    onBeforeEndEdit: function(silent, modifiedFieldNames) {
        var editMemento = this.editMemento;
        if (editMemento) {
            this.editMementoFix = editMemento;
            if (!modifiedFieldNames) {
                modifiedFieldNames = this.getModifiedFieldNames(editMemento.data);
            }
            if (!editMemento.previousValues)  {
                editMemento.previousValues = {};
            }
            
            Ext.Array.each(modifiedFieldNames, function(fieldName) {
                editMemento.previousValues[fieldName] = editMemento.data[fieldName];
            });
        }
    },
    onAfterEndEdit: function(silent, modifiedFieldNames) {
        delete this.editMementoFix;
    },
    /**
     * By default this method is empty, but you can override it in your models, to return a human-readable
     * title of this model instance. String should (probably) include the id of the record,
     * along with some additional information.
     *
     * For example, for the employee model you might want to return the id, first name and last name
     * (or any other important fields).
     *

     Ext.define('Example.model.Employee', {
        extend      : 'Ext.data.Model',
        mixins      : { robo : 'Robo.data.Model' },

        ...

        getTitle : function () {
            return (this.get('firstName') || '') + ' ' + (this.get('lastName') || '') + " (" + this.getId() + ")"
        }
    });

     *
     * @return {String}
     */
    getTitle: function() {
        return '';
    }
});

/**
@class Sch.model.Customizable
@extends Ext.data.Model

This class represent a model with customizable field names. Customizable fields are defined in separate
class config `customizableFields`. The format of definition is just the same as for usual fields:

        Ext.define('BaseModel', {
            extend             : 'Sch.model.Customizable',

            customizableFields : [
                { name : 'StartDate', type : 'date', dateFormat : 'c' },
                { name : 'EndDate',   type : 'date', dateFormat : 'c' }
            ],

            fields             : [
                'UsualField'
            ],

            getEndDate : function () {
                return "foo"
            }
        });

For each customizable field will be created getter and setter, using the camel-cased name of the field ("stable name"),
prepended with "get/set" respectively. They will not overwrite any existing methods:

        var baseModel   = new BaseModel({
            StartDate   : new Date(2012, 1, 1),
            EndDate     : new Date(2012, 2, 3)
        });

        // using getter for "StartDate" field
        // returns date for "2012/02/01"
        var startDate   = baseModel.getStartDate();

        // using custom getter for "EndDate" field
        // returns "foo"
        var endDate     = baseModel.getEndDate();

You can change the name of customizable fields in a subclass of the model or completely redefine them.
To do this, add a special property to the class with the name of the field with a lowercased first
letter, appended with "Field". The value of the property should contain the new name of the field.

        Ext.define('SubModel', {
            extend         : 'BaseModel',

            startDateField : 'beginDate',
            endDateField   : 'finalizeDate',

            fields         : [
                { name : 'beginDate', type : 'date', dateFormat : 'Y-m-d' },
            ]
        });

        var subModel     = new SubModel({
            beginDate    : new Date(2012, 1, 1),
            finalizeDate : new Date(2012, 2, 3)
        });

        // name of getter is still the same
        var startDate = subModel.getStartDate();

In the example above the `StartDate` field was completely re-defined to the `beginDate` field with different date format.
The `EndDate` has just changed its name to "finalizeDate". Note, that getters and setters are always named after "stable"
field name, not the customized one.
*/
Ext.define('Sch.model.Customizable', function(thisClass) {
    return {
        extend: 'Ext.data.Model',
        requires: [
            'Sch.util.Date'
        ],
        mixins: {
            robo: 'Robo.data.Model'
        },
        isCustomizableModel: true,
        /**
        * @cfg {Array} customizableFields
        *
        * The array of customizable fields definitions.
        */
        customizableFields: null,
        // @private
        // Keeps temporary state of the previous state for a model, but is only available
        // when a model has changed, e.g. after 'set' or 'reject'. After those operations are completed, this property is cleared.
        previous: null,
        // temp flag to check if we're currently editing the model
        __editing: null,
        // To support nested beginEdit calls (see 043_nested_beginedit.t.js in Gantt)
        __editCounter: 0,
        constructor: function() {
            // Sencha Touch requires the return value to be returned, hard crash without it
            var retVal = this.callParent(arguments);
            return retVal;
        },
        storePreviousFlex: Ext.Function.flexSetter(function(fieldName, value) {
            var me = this,
                currentValue = me.get(fieldName);
            // convert new value to Date if needed
            if (currentValue instanceof Date && !(value instanceof Date)) {
                value = me.getField(fieldName).convert(value, me);
            }
            // Store previous field value if it changed, if value didn't change - just return
            if ((currentValue instanceof Date && (currentValue - value)) || !(currentValue instanceof Date) && currentValue !== value) {
                // if record has a hook to process old value
                if (me.processFieldPreviousValue) {
                    currentValue = me.processFieldPreviousValue(fieldName, currentValue);
                }
                me.previous[fieldName] = currentValue;
            }
        }),
        deletePreviousFlex: Ext.Function.flexSetter(function(fieldName, value) {
            delete this.previous[fieldName];
        }),
        // Overridden to be able to track previous record field values
        set: function(fieldName, value) {
            var me = this,
                ownPrevious = false,
                result = null;
            if (!me.previous) {
                ownPrevious = true;
                me.previous = {};
            }
            me.storePreviousFlex(fieldName, value);
            // This call is mandatory, otherwise model's dirty flag / modified fields might not be properly reset
            result = me.callParent(arguments);
            if (!me.__editing) {
                if (ownPrevious) {
                    delete me.previous;
                } else {
                    me.deletePreviousFlex(fieldName, value);
                }
            }
            return result;
        },
        // Overridden to be able to track previous record field values
        reject: function() {
            var me = this,
                modified = me.modified || {},
                field;
            // Ext could call 'set' during the callParent which should not reset the 'previous' object
            me.__editing = true;
            me.previous = me.previous || {};
            for (field in modified) {
                if (modified.hasOwnProperty(field)) {
                    if (typeof modified[field] != "function") {
                        me.previous[field] = me.get(field);
                    }
                }
            }
            me.callParent(arguments);
            // Reset the previous tracking object
            delete me.previous;
            me.__editing = false;
        },
        // -------------- Supporting nested beginEdit calls - see test 043_nested_beginedit.t.js
        beginEdit: function() {
            this.__editCounter++;
            this.__editing = true;
            this.callParent(arguments);
        },
        cancelEdit: function() {
            this.__editCounter = 0;
            this.__editing = false;
            this.callParent(arguments);
            delete this.previous;
        },
        // Overridden to be able to clear the previous record field values. Must be done here to have access to the 'previous' object after
        // an endEdit call.
        endEdit: function(silent, modifiedFieldNames) {
            if (--this.__editCounter === 0) {
                // OVERRIDE HACK: If no fields were changed, make sure no events are fired by signaling 'silent'
                if (!silent && this.getModifiedFieldNames) /* Touch doesn't have this method, skip optimization */
                {
                    var editMemento = this.editMemento;
                    if (!modifiedFieldNames) {
                        modifiedFieldNames = this.getModifiedFieldNames(editMemento.data);
                    }
                    if (modifiedFieldNames && modifiedFieldNames.length === 0) {
                        silent = true;
                    }
                }
                this.callParent([
                    silent
                ].concat(Array.prototype.slice.call(arguments, 1)));
                this.__editing = false;
                delete this.previous;
            }
        }
    };
}, // -------------- EOF Supporting nested beginEdit calls - see test 043_nested_beginedit.t.js
function(thisClass) {
    // thisClass.onExtended() used few lines below puts a provided function to the end of thisClass.$onExtended array.
    // That's why we cannot use it. We need this function to start early to be able to backup originally defined "fields" config.
    // Ext.data.Model provided a function to onExtended that removes the config and it stays earlier in the thisClass.$onExtended queue.
    // So we simply put our function to the beginning of thisClass.$onExtended.
    thisClass.$onExtended.unshift({
        fn: function(cls, data) {
            if (data) {
                if (Ext.isArray(data)) {
                    cls.fieldsInitialValue = data.slice();
                } else if (data.fields) {
                    if (!Ext.isArray(data.fields)) {
                        cls.fieldsInitialValue = [
                            data.fields
                        ];
                    } else {
                        cls.fieldsInitialValue = data.fields.slice();
                    }
                }
            }
        }
    });
    thisClass.onExtended(function(cls, data, hooks) {
        var classManager = Ext.ClassManager,
            triggerCreatedOriginal = classManager.triggerCreated;
        // just before the ClassManager notifies that the class is ready we do our fields adjustments
        classManager.triggerCreated = function(className) {
            var proto = cls.prototype;
            // Combining our customizable fields with ones collected by the superclass.
            // This array has all the inherited customizable fields (yet some of them might be duplicated because of overrides)
            if (proto.customizableFields) {
                proto.allCustomizableFields = (cls.superclass.allCustomizableFields || []).concat(proto.customizableFields);
            } else {
                proto.allCustomizableFields = (cls.superclass.allCustomizableFields || []);
            }
            // we will collect fields here, overwriting old ones with new to remove duplication
            var customizableFieldsByName = {};
            Ext.Array.each(proto.allCustomizableFields, function(field) {
                // normalize to object
                if (typeof field == 'string')  {
                    field = {
                        name: field
                    };
                }
                
                customizableFieldsByName[field.name] = field;
            });
            // already processed by the Ext.data.Model `onBeforeCreated`
            var fields = proto.fields;
            var toAdd = [];
            var toRemove = [];
            Ext.Array.each(fields, function(field) {
                if (field.isCustomizableField) {
                    toRemove.push(field.getName());
                }
            });
            if (proto.idProperty !== 'id' && proto.getField('id')) {
                if (!proto.getField('id').hasOwnProperty('name')) {
                    toRemove.push('id');
                }
            }
            if (proto.idProperty !== 'Id' && proto.getField('Id')) {
                if (!proto.getField('Id').hasOwnProperty('name')) {
                    toRemove.push('Id');
                }
            }
            cls.removeFields(toRemove);
            // Finds the provided field config in the provided array of configs
            // and applies it to the provided resulting object (using Ext.applyIf)
            // @param result Resulting configuration object
            // @param fields Array of field configs
            // @param fieldName Field name
            function applyFieldConfig(result, fields, fieldName) {
                if (!fields)  {
                    return;
                }
                
                if (!Ext.isArray(fields))  {
                    fields = [
                        fields
                    ];
                }
                
                var fieldConfig;
                for (var i = fields.length - 1; i >= 0; i--) {
                    if (fields[i].name == fieldName) {
                        fieldConfig = fields[i];
                        break;
                    }
                }
                Ext.applyIf(result, fieldConfig);
            }
            // Collects the provided customizable field config based on the class inheritance
            // @param stableFieldName Stable field name (the one provided as "name" in the "customizableFields" section)
            // @return Field config
            function getFieldConfig(stableFieldName) {
                var c = cls,
                    proto = c.prototype,
                    fieldProperty = stableFieldName === 'Id' ? 'idProperty' : stableFieldName.charAt(0).toLowerCase() + stableFieldName.substr(1) + 'Field',
                    result = {
                        name: proto[fieldProperty] || stableFieldName,
                        isCustomizableField: true
                    },
                    fieldName;
                while (proto && proto.isCustomizableModel) {
                    fieldName = proto[fieldProperty] || stableFieldName;
                    // first apply "customizableFields" config data
                    // ..we use applyIf() and "customizableFields" has higher priority than "fields" config
                    proto.hasOwnProperty('customizableFields') && applyFieldConfig(result, proto.customizableFields, stableFieldName);
                    // apply "fields" config data
                    applyFieldConfig(result, c.fieldsInitialValue, fieldName);
                    // proceed to parent class
                    proto = c.superclass;
                    c = proto && proto.self;
                }
                return result;
            }
            // let's reset array there might be some more fields to remove
            toRemove = [];
            Ext.Object.each(customizableFieldsByName, function(name, customizableField) {
                var stableFieldName = customizableField.name || customizableField.getName();
                var fieldProperty = stableFieldName === 'Id' ? 'idProperty' : stableFieldName.charAt(0).toLowerCase() + stableFieldName.substr(1) + 'Field';
                var realFieldName = proto[fieldProperty] || stableFieldName;
                // if such field already exists we will remove it
                proto.getField(realFieldName) && toRemove.push(realFieldName);
                var field = getFieldConfig(stableFieldName);
                // we create a new copy of the `customizableField` using possibly new name
                toAdd.push(Ext.create('data.field.' + (field.type || 'auto'), field));
                var capitalizedStableName = Ext.String.capitalize(stableFieldName);
                // don't overwrite `getId` method
                if (capitalizedStableName != 'Id') {
                    var getter = 'get' + capitalizedStableName;
                    var setter = 'set' + capitalizedStableName;
                    // overwrite old getters, pointing to a different field name
                    if (!proto[getter] || proto[getter].__getterFor__ && proto[getter].__getterFor__ != realFieldName) {
                        proto[getter] = function() {
                            // Need to read this property from the prototype if it exists, instead of relying on the field
                            // Since if someone subclasses a model and redefines a fieldProperty - the realFieldName variable
                            // will still have the value of the superclass
                            // See test 024_event.t.js
                            return this.get(this[fieldProperty] || realFieldName);
                        };
                        proto[getter].__getterFor__ = realFieldName;
                    }
                    // same for setters
                    if (!proto[setter] || proto[setter].__setterFor__ && proto[setter].__setterFor__ != realFieldName) {
                        proto[setter] = function(value) {
                            // Need to read this property from the prototype if it exists, instead of relying on the field
                            // Since if someone subclasses a model and redefines a fieldProperty - the realFieldName variable
                            // will still have the value of the superclass
                            // See test 024_event.t.js
                            return this.set(this[fieldProperty] || realFieldName, value);
                        };
                        proto[setter].__setterFor__ = realFieldName;
                    }
                }
            });
            cls.replaceFields(toAdd, toRemove);
            // call && restore original Ext.ClassManager.triggerCreated function
            triggerCreatedOriginal.apply(this, arguments);
            classManager.triggerCreated = triggerCreatedOriginal;
        };
    });
});

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
    extend: 'Sch.model.Customizable',
    isResourceModel: true,
    idProperty: 'Id',
    config: Ext.versions.touch ? {
        idProperty: 'Id'
    } : null,
    /**
     * @cfg {String} nameField The name of the field that holds the resource name.
     */
    nameField: 'Name',
    customizableFields: [
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
        {
            name: 'Name',
            type: 'string'
        }
    ],
    getInternalId: function() {
        return this.internalId;
    },
    /**
     * Returns a resource store this resource is part of. Resource must be part
     * of a resource store to be able to retrieve resource store.
     *
     * @return {Sch.data.ResourceStore|null}
     */
    getResourceStore: function() {
        return this.joined && this.joined[0] || this.getTreeStore && this.getTreeStore();
    },
    /**
     * Returns an event store this resource uses as default. Resource must be part
     * of a resource store to be able to retrieve event store.
     *
     * @return {Sch.data.EventStore|null}
     */
    getEventStore: function() {
        var resourceStore = this.getResourceStore();
        return resourceStore && resourceStore.getEventStore() || this.parentNode && this.parentNode.getEventStore();
    },
    /**
     * Returns as assignment store this resources uses as default. Resource must be part
     * of a resource store to be able to retrieve default assignment store.
     *
     * @return {Sch.data.AssignmentStore|null}
     */
    getAssignmentStore: function() {
        var eventStore = this.getEventStore();
        return eventStore && eventStore.getAssignmentStore();
    },
    /**
     * Returns an array of events, associated with this resource
     *
     * @param {Sch.data.EventStore} eventStore (optional) The event store to get events for (if a resource is bound to multiple stores)
     * @return {Sch.model.Range[]}
     */
    getEvents: function(eventStore) {
        var me = this;
        eventStore = eventStore || me.getEventStore();
        return eventStore && eventStore.getEventsForResource(me) || [];
    },
    /**
     * Returns all assignments for the resource. Resource must be part of the store for this method to work.
     *
     * @return {[Sch.model.Assignment]}
     */
    getAssignments: function() {
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
    isPersistable: function() {
        var parent = this.parentNode;
        return !parent || !parent.phantom || (parent.isRoot && parent.isRoot());
    },
    /**
     * Returns true if this resource model is above the passed resource model
     * @param {Sch.model.Resource} otherResource
     * @return {Boolean}
     */
    isAbove: function(otherResource) {
        var me = this,
            store = me.getResourceStore(),
            result = false,
            current, myAncestors, otherAncestors, commonAncestorsLength, lastCommonAncestor;
        Ext.Assert && Ext.Assert.truthy(store, "Resource must be added to a store to be able to check if it above of an other resource");
        if (me == otherResource) {
            result = false;
        } else if (store && store.isTreeStore) {
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
            while (commonAncestorsLength < myAncestors.length - 1 && commonAncestorsLength < otherAncestors.length - 1 && myAncestors[commonAncestorsLength] == otherAncestors[commonAncestorsLength]) {
                ++commonAncestorsLength;
            }
            // Getting last common ancesstor
            lastCommonAncestor = myAncestors[commonAncestorsLength];
            // Here the next ancestor in myAncestors and next ancesstor in otherAncestors are siblings and
            // thus designate which node is above
            me = myAncestors[commonAncestorsLength + 1];
            otherResource = otherAncestors[commonAncestorsLength + 1];
            result = lastCommonAncestor.indexOf(me) < lastCommonAncestor.indexOf(otherResource);
        } else {
            result = store.indexOf(me) < store.indexOf(otherResource);
        }
        return result;
    }
});

/**
@class Sch.data.ResourceStore
@extends Ext.data.Store
@mixins Sch.data.mixin.ResourceStore

This is a class holding the collection the {@link Sch.model.Resource resources} to be rendered into a {@link Sch.panel.SchedulerGrid scheduler panel}.
It is a subclass of {@link Ext.data.Store} - a store with linear data presentation.

*/
Ext.define("Sch.data.ResourceStore", {
    extend: 'Ext.data.Store',
    model: 'Sch.model.Resource',
    config: {
        model: 'Sch.model.Resource'
    },
    alias: 'store.resourcestore',
    mixins: [
        'Sch.data.mixin.UniversalModelGetter',
        'Sch.data.mixin.CacheHintHelper',
        'Sch.data.mixin.ResourceStore',
        'Robo.data.Store'
    ],
    storeId: 'resources',
    constructor: function() {
        this.callParent(arguments);
        if (this.getModel() !== Sch.model.Resource && !(this.getModel().prototype instanceof Sch.model.Resource)) {
            throw 'The model for the ResourceStore must subclass Sch.model.Resource';
        }
    }
});

/**
 * @class Kanban.model.Resource
 *
 * A data model class describing a resource in your Kanban board that can be assigned to any {@link Kanban.model.Task}.
 */
Ext.define('Kanban.model.Resource', {
    extend: 'Sch.model.Resource',
    alias: 'model.kanban_resourcemodel',
    customizableFields: [
        /**
         * @field ImageUrl
         * @type {String}
         * The url of an image representing the resource
         */
        {
            name: 'ImageUrl'
        }
    ],
    /**
     * @cfg {String} imageUrlField The name of the field that defines the user image url. Defaults to "ImageUrl".
     */
    imageUrlField: 'ImageUrl'
});

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
    extend: 'Sch.data.ResourceStore',
    model: 'Kanban.model.Resource',
    sorters: 'Name',
    proxy: undefined,
    alias: 'store.kanban_resourcestore'
});

/**
 * This class manages id consistency among model stores, it listens to 'idchanged' event on each store and updates
 * referential fields referencing records with changed ids in other model entities.
 *
 * Note on update process:
 *  at the time when 'idchanged' handler is called we can effectively query stores which are using caches for
 *  a data cached under old id, but we cannot update related models with the new id since at the time of
 *  'idchanged' handler is called a record which id has been updated is still marked as phantom, it's
 *  phantom flag will be reset only at 'update' event time (and 'idchanged' event is always followed by 'update'
 *  event) and it's important we start updating related records after primary records are not phantoms
 *  any more since we might rely on this flag (for example a related store sync operation might be blocked
 *  if primary store records it relies on are still phantom).
 *
 * @private
 */
Ext.define('Sch.data.util.IdConsistencyManager', {
    config: {
        eventStore: null,
        resourceStore: null,
        assignmentStore: null,
        dependencyStore: null
    },
    eventStoreDetacher: null,
    resourceStoreDetacher: null,
    constructor: function(config) {
        this.initConfig(config);
    },
    // {{{ Event attachers
    updateEventStore: function(newEventStore, oldEventStore) {
        var me = this;
        Ext.destroyMembers(me, 'eventStoreDetacher');
        if (newEventStore) {
            me.eventStoreDetacher = newEventStore.on({
                idchanged: me.onEventIdChanged,
                scope: me,
                destroyable: true,
                // It's important that priority here was more then in assignment/event store caches
                // otherwise quering by old id won't return correct results, assignment will be moved
                // to new event id already if this priority is lower then the one used in cache
                priority: 200
            });
        }
    },
    updateResourceStore: function(newResourceStore, oldResourceStore) {
        var me = this;
        Ext.destroyMembers(me, 'resourceStoreDetacher');
        if (newResourceStore) {
            me.resourceStoreDetacher = newResourceStore.on({
                idchanged: me.onResourceIdChanged,
                scope: me,
                destroyable: true,
                // It's important that priority here was more then in assignment/event store caches
                // otherwise quering by old id won't return correct results, assignment will be moved
                // to new resource id already if this priority is lower then the one used in cache
                priority: 200
            });
        }
    },
    // }}}
    // {{{ Event handlers
    // Please see the note at the class description
    onEventIdChanged: function(eventStore, event, oldId, newId) {
        var me = this,
            assignmentStore = me.getAssignmentStore(),
            dependencyStore = me.getDependencyStore(),
            assignmentsUpdater, dependenciesUpdater;
        if (assignmentStore) {
            assignmentsUpdater = me.getUpdateAssignmentEventIdFieldFn(assignmentStore, oldId, newId);
        }
        if (dependencyStore) {
            dependenciesUpdater = me.getUpdateDependencySourceTargedIdFieldFn(dependencyStore, oldId, newId);
        }
        if (assignmentsUpdater || dependenciesUpdater) {
            eventStore.on('update', function() {
                assignmentsUpdater && assignmentsUpdater();
                dependenciesUpdater && dependenciesUpdater();
            }, null, {
                single: true,
                priority: 200
            });
        }
    },
    // Please see the note at the class description
    onResourceIdChanged: function(resourceStore, resource, oldId, newId) {
        var me = this,
            eventStore = me.getEventStore(),
            assignmentStore = me.getAssignmentStore(),
            eventsUpdater, assignmentsUpdater;
        if (eventStore && !assignmentStore) {
            eventsUpdater = me.getUpdateEventResourceIdFieldFn(eventStore, oldId, newId);
        }
        if (assignmentStore) {
            assignmentsUpdater = me.getUpdateAssignmentResourceIdFieldFn(assignmentStore, oldId, newId);
        }
        if (eventsUpdater || assignmentStore) {
            resourceStore.on('update', function() {
                eventsUpdater && eventsUpdater();
                assignmentsUpdater && assignmentsUpdater();
            }, null, {
                single: true,
                priority: 200
            });
        }
    },
    // }}}
    // {{{ Update rules
    getUpdateEventResourceIdFieldFn: function(eventStore, oldId, newId) {
        var events = eventStore.getRange();
        return function() {
            Ext.Array.each(events, function(event) {
                event.getResourceId() == oldId && event.setResourceId(newId);
            });
        };
    },
    getUpdateAssignmentEventIdFieldFn: function(assignmentStore, oldId, newId) {
        var assignments = assignmentStore.getAssignmentsForEvent(oldId);
        return function() {
            Ext.Array.each(assignments, function(assignment) {
                assignment.getEventId() == oldId && assignment.setEventId(newId);
            });
        };
    },
    getUpdateAssignmentResourceIdFieldFn: function(assignmentStore, oldId, newId) {
        var assignments = assignmentStore.getAssignmentsForResource(oldId);
        return function() {
            Ext.Array.each(assignments, function(assignment) {
                assignment.getResourceId() == oldId && assignment.setResourceId(newId);
            });
        };
    },
    getUpdateDependencySourceTargedIdFieldFn: function(dependencyStore, oldId, newId) {
        var dependencies = dependencyStore.getEventDependencies(oldId);
        return function() {
            Ext.Array.each(dependencies, function(dependency) {
                dependency.getSourceId() == oldId && dependency.setSourceId(newId);
                dependency.getTargetId() == oldId && dependency.setTargetId(newId);
            });
        };
    }
});
// }}}

/**
 * This class manages model persistency, it listens to model stores' beforesync event and removes all non persistable
 * records from sync operation. The logic has meaning only for CRUD-less sync operations.
 *
 * @private
 */
Ext.define('Sch.data.util.ModelPersistencyManager', {
    config: {
        eventStore: null,
        resourceStore: null,
        assignmentStore: null,
        dependencyStore: null
    },
    eventStoreDetacher: null,
    resourceStoreDetacher: null,
    assignmentStoreDetacher: null,
    dependencyStoreDetacher: null,
    constructor: function(config) {
        this.initConfig(config);
    },
    // {{{ Event attachers
    updateEventStore: function(newEventStore, oldEventStore) {
        var me = this;
        Ext.destroyMembers(me, 'eventStoreDetacher');
        if (newEventStore && newEventStore.autoSync) {
            me.eventStoreDetacher = newEventStore.on({
                beforesync: me.onEventStoreBeforeSync,
                scope: me,
                destroyable: true,
                // Just in case
                priority: 100
            });
        }
    },
    updateResourceStore: function(newResourceStore, oldResourceStore) {
        var me = this;
        Ext.destroyMembers(me, 'resourceStoreDetacher');
        if (newResourceStore && newResourceStore.autoSync) {
            me.resourceStoreDetacher = newResourceStore.on({
                beforesync: me.onResourceStoreBeforeSync,
                scope: me,
                destroyable: true,
                // Just in case
                priority: 100
            });
        }
    },
    updateAssignmentStore: function(newAssignmentStore, oldAssignmentStore) {
        var me = this;
        Ext.destroyMembers(me, 'assignmentStoreDetacher');
        if (newAssignmentStore && newAssignmentStore.autoSync) {
            me.assignmentStoreDetacher = newAssignmentStore.on({
                beforesync: me.onAssignmentStoreBeforeSync,
                scope: me,
                destroyable: true,
                // Just in case
                priority: 100
            });
        }
    },
    updateDependencyStore: function(newDependencyStore, oldDependencyStore) {
        var me = this;
        Ext.destroyMembers(me, 'dependencyStoreDetacher');
        if (newDependencyStore && newDependencyStore.autoSync) {
            me.dependencyStoreDetacher = newDependencyStore.on({
                beforesync: me.onDependencyStoreBeforeSync,
                scope: me,
                destroyable: true,
                // Just in case
                priority: 100
            });
        }
    },
    // }}}
    // {{{ Event handlers
    onEventStoreBeforeSync: function(options) {
        var me = this;
        me.removeNonPersistableRecordsToCreate(options);
        return me.shallContinueSync(options);
    },
    onResourceStoreBeforeSync: function(options) {
        var me = this;
        me.removeNonPersistableRecordsToCreate(options);
        return me.shallContinueSync(options);
    },
    onAssignmentStoreBeforeSync: function(options) {
        var me = this;
        me.removeNonPersistableRecordsToCreate(options);
        return me.shallContinueSync(options);
    },
    onDependencyStoreBeforeSync: function(options) {
        var me = this;
        me.removeNonPersistableRecordsToCreate(options);
        return me.shallContinueSync(options);
    },
    // }}}
    // {{{ Management rules
    removeNonPersistableRecordsToCreate: function(options) {
        var recordsToCreate = options.create || [],
            r, i;
        // We remove from the array we iterate thus we iterate from end to start
        for (i = recordsToCreate.length - 1; i >= 0; --i) {
            r = recordsToCreate[i];
            if (!r.isPersistable()) {
                Ext.Array.remove(recordsToCreate, r);
            }
        }
        // Prevent empty create request
        if (recordsToCreate.length === 0) {
            delete options.create;
        }
    },
    shallContinueSync: function(options) {
        return Boolean((options.create && options.create.length > 0) || (options.update && options.update.length > 0) || (options.destroy && options.destroy.length > 0));
    }
});
// }}}

/**
 * Simple caching utility.
 *
 * Internaly obtains a key value suitable to be used as object property name via {@link Sch.util.Cache#key key()}
 * method and caches a value provided under the key obtained, values with the same key are groupped
 * into single array. Cached values are obtained via {@link Sch.util.Cache#get get()} method and are managed via
 * {@link Sch.util.Cache#add add()}, {@link Sch.util.Cache#remove remove()}, {@link Sch.util.Cache#move move()},
 * {@link Sch.util.Cache#clear clear()}
 * methods.
 */
Ext.define('Sch.util.Cache', {
    cache: null,
    /**
     * @constructor
     */
    constructor: function() {
        var me = this;
        me.cache = {};
        me.self.stats[Ext.getClassName(me)] = me.stats = {
            hit: 0,
            miss: 0
        };
    },
    /**
     * A function returning a key for given value.
     *
     * @param  {Mixed} v
     * @return {String}
     * @template
     */
    key: function(v) {
        var result;
        if (v && v.isModel) {
            result = v.getId().toString();
        } else if (v === undefined || v === null) {
            result = "[ undefined / null ]";
        } else {
            result = (v).toString();
        }
        return result;
    },
    /**
     * Checks if cache has given key cached
     *
     * @param {Mixed} k
     * @return {Boolean}
     */
    has: function(k) {
        var me = this;
        k = me.key(k);
        return me.cache.hasOwnProperty(k);
    },
    /**
     * Returns all values cached with a given key, or if key isn't present executes a given function, caches
     * it's result (which should be array) after it's mapped over {@link #map} and returns it.
     *
     * *Warning*: the array returned must not be modified otherwise cache integrity will be violated.
     *
     * @param {Mixed} k
     * @param {Function} [fn]
     * @param {[Mixed]}  [fn.return]
     * @return {[Mixed]}
     */
    get: function(k, fn) {
        var me = this,
            result;
        k = me.key(k);
        result = me.cache.hasOwnProperty(k) && me.cache[k];
        !result && fn ? (++me.stats.miss) : (++me.stats.hit);
        if (!result && fn) {
            result = fn();
        } else if (!result) {
            result = [];
        }
        me.cache[k] = result;
        return result;
    },
    /**
     * Caches a value using either a key provided or a key obtained from {@link #key key()} method.
     * If value is not given then the key is added to the cache with nothing cached under it.
     *
     * @param {Mixed} k
     * @param {Mixed} [v]
     * @chainable
     */
    add: function(k, v) {
        var me = this,
            kAdopted = me.key(k);
        if (!me.cache.hasOwnProperty(kAdopted)) {
            me.cache[kAdopted] = me.get(k);
        }
        // initial key cache filling
        arguments.length > 1 && Ext.Array.include(me.cache[kAdopted], v);
        return me;
    },
    /**
     * Sets cached values for the given key, replace everything cached for the given key with new values.
     *
     * @param {Mixed} k
     * @param {[Mixed]} vals
     * @chainable
     */
    set: function(k, vals) {
        var me = this,
            kAdopted = me.key(k);
        me.cache[kAdopted] = vals;
        return me;
    },
    /**
     * Removes cached value from cache under a given key or under a key obtained from {@link #key key()} method.
     *
     * @param {Mixed} k
     * @param {Mixed} v
     * @chainable
     */
    remove: function(k, v) {
        var me = this;
        k = me.key(k);
        if (me.cache.hasOwnProperty(k)) {
            Ext.Array.remove(me.cache[k], v);
        }
        return me;
    },
    /**
     * Moves all items or a single item under old key to new key
     *
     * @param {Mixed} oldKey
     * @param {Mixed} newKey
     * @chainable
     */
    move: function(oldKey, newKey, v) {
        var me = this;
        oldKey = me.key(oldKey);
        newKey = me.key(newKey);
        if (oldKey != newKey && arguments.length >= 3) {
            me.remove(oldKey, v);
            me.add(newKey, v);
        } else if (oldKey != newKey && me.cache.hasOwnProperty(oldKey) && me.cache.hasOwnProperty(newKey)) {
            me.cache[newKey] = Ext.Array.union(me.cache[newKey], me.cache[oldKey]);
            me.cache[oldKey] = [];
        } else if (oldKey != newKey && me.cache.hasOwnProperty(oldKey)) {
            me.cache[newKey] = me.cache[oldKey];
            me.cache[oldKey] = [];
        }
        return me;
    },
    /**
     * Clears entire cache, or clears cache for a given key.
     *
     * @param {Mixed} [k]
     * @chainable
     */
    clear: function(k) {
        var me = this;
        if (!arguments.length) {
            me.cache = {};
        } else {
            k = me.key(k);
            if (me.cache.hasOwnProperty(k)) {
                delete me.cache[k];
            }
        }
        return me;
    },
    /**
     * Removes value from entire cache (from every key it exists under).
     *
     * @param {Mixed} v
     * @chainable
     */
    uncache: function(v) {
        var me = this,
            k;
        for (k in me.cache) {
            if (me.cache.hasOwnProperty(k)) {
                me.cache[k] = Ext.Array.remove(me.cache[k], v);
            }
        }
        return me;
    },
    inheritableStatics: {
        stats: {}
    }
});

/**
 * Event store's resource->events cache.
 * Uses resource records or resource record ids as keys.
 *
 * @private
 */
Ext.define('Sch.data.util.ResourceEventsCache', {
    extend: 'Sch.util.Cache',
    requires: [
        'Ext.data.Model'
    ],
    eventStore: null,
    eventStoreDetacher: null,
    resourceStoreDetacher: null,
    constructor: function(eventStore) {
        var me = this,
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
            var resourceIdField = event.resourceIdField,
                resourceIdChanged = event.previous && resourceIdField in event.previous,
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
                idchanged: onResourceIdChanged,
                remove: onResourceRemove,
                clear: onResourceStoreClearOrReset,
                cacheresethint: onResourceStoreClearOrReset,
                rootchange: onResourceStoreClearOrReset,
                priority: 100,
                destroyable: true
            });
        }
        me.eventStoreDetacher = eventStore.on({
            add: onEventAdd,
            remove: onEventRemove,
            update: onEventUpdate,
            clear: onEventStoreClearOrReset,
            cacheresethint: onEventStoreClearOrReset,
            rootchange: onEventStoreClearOrReset,
            resourcestorechange: onEventStoreResourceStoreChange,
            // subscribing to the CRUD using priority - should guarantee that our listeners
            // will be called first (before any other listeners, that could be provided in the "listeners" config)
            // and state in other listeners will be correct
            priority: 100,
            destroyable: true
        });
        me.eventStoreFiltersDetacher = eventStore.getFilters().on('endupdate', onEventStoreClearOrReset, this, {
            // priority is calculated as:
            // Ext.util.Collection.$endUpdatePriority + 1
            // to reset our cache before ExtJS "on filter end update" listeners run
            priority: 1002,
            destroyable: true
        });
        attachToResourceStore(resourceStore);
        me.eventStore = eventStore;
    },
    destroy: function() {
        var me = this;
        Ext.destroyMembers(me, 'eventStoreDetacher', 'eventStoreFiltersDetacher', 'resourceStoreDetacher');
        me.eventStore = null;
    },
    get: function(k, fn) {
        var me = this;
        k = me.key(k);
        fn = fn || function() {
            return Ext.Array.filter(me.eventStore.getRange(), function(event) {
                return event.getResourceId() == k;
            });
        };
        return me.callParent([
            k,
            fn
        ]);
    }
});

/**
 * This is a mixin, containing functionality related to managing events.
 *
 * It is consumed by the regular {@link Sch.data.EventStore} class and {@link Gnt.data.TaskStore} class
 * to allow data sharing between gantt chart and scheduler. Please note though, that datasharing is still
 * an experimental feature and not all methods of this mixin can be used yet on a TaskStore.
 *
 */
Ext.define("Sch.data.mixin.EventStore", {
    extend: 'Ext.Mixin',
    requires: [
        'Sch.util.Date',
        'Sch.data.util.IdConsistencyManager',
        'Sch.data.util.ModelPersistencyManager',
        'Sch.data.util.ResourceEventsCache'
    ],
    /**
     * Identifies an object as an instantiated event store, or subclass thereof.
     * @type {Boolean}
     */
    isEventStore: true,
    /**
     * @cfg {Sch.data.AssignmentStore} assignmentStore Provide assignment store to enable multiple connections between
     * events and resources
     */
    assignmentStore: null,
    resourceStore: null,
    resourceEventsCache: null,
    idConsistencyManager: null,
    modelPersistencyManager: null,
    mixinConfig: {
        after: {
            constructor: 'constructor',
            destroy: 'destroy'
        }
    },
    /**
     * @constructor
     */
    constructor: function() {
        var me = this;
        me.resourceEventsCache = me.createResourceEventsCache();
        me.idConsistencyManager = me.createIdConsistencyManager();
        me.modelPersistencyManager = me.createModelPersistencyManager();
    },
    destroy: function() {
        var me = this;
        Ext.destroyMembers(me, 'resourceEventsCache', 'idConsistencyManager', 'modelPersistencyManager');
    },
    /**
     * Creates and returns Resource->Events cache.
     *
     * @return {Sch.data.util.ResourceEventsCache}
     * @template
     * @protected
     */
    createResourceEventsCache: function() {
        return new Sch.data.util.ResourceEventsCache(this);
    },
    /**
     * Creates and returns id consistency manager
     *
     * @return {Sch.data.util.IdConsistencyManager}
     * @tempalte
     * @protected
     */
    createIdConsistencyManager: function() {
        var me = this;
        return new Sch.data.util.IdConsistencyManager({
            eventStore: me,
            resourceStore: me.getResourceStore(),
            assignmentStore: me.getAssignmentStore(),
            dependencyStore: me.getDependencyStore()
        });
    },
    /**
     * Creates and returns model persistency manager
     *
     * @return {Sch.data.util.ModelPersistencyManager}
     * @tempalte
     * @protected
     */
    createModelPersistencyManager: function() {
        var me = this;
        return new Sch.data.util.ModelPersistencyManager({
            eventStore: me,
            resourceStore: me.getResourceStore(),
            assignmentStore: me.getAssignmentStore(),
            dependencyStore: me.getDependencyStore()
        });
    },
    /**
     * Gets the resource store for this store
     *
     * @return {Sch.data.ResourceStore} resourceStore
     */
    getResourceStore: function() {
        return this.resourceStore;
    },
    /**
     * Sets the resource store for this store
     *
     * @param {Sch.data.ResourceStore} resourceStore
     */
    setResourceStore: function(resourceStore) {
        var me = this,
            oldStore = me.resourceStore;
        if (me.resourceStore) {
            me.resourceStore.setEventStore(null);
            me.idConsistencyManager && me.idConsistencyManager.setResourceStore(null);
            me.modelPersistencyManager && me.modelPersistencyManager.setResourceStore(null);
        }
        me.resourceStore = resourceStore && Ext.StoreMgr.lookup(resourceStore) || null;
        if (me.resourceStore) {
            me.modelPersistencyManager && me.modelPersistencyManager.setResourceStore(me.resourceStore);
            me.idConsistencyManager && me.idConsistencyManager.setResourceStore(me.resourceStore);
            resourceStore.setEventStore(me);
        }
        if ((oldStore || resourceStore) && oldStore !== resourceStore) {
            /**
             * @event resourcestorechange
             * Fires when new resource store is set via {@link #setResourceStore} method.
             * @param {Sch.data.EventStore}         this
             * @param {Sch.data.ResourceStore|null} newResourceStore
             * @param {Sch.data.ResourceStore|null} oldResourceStore
             */
            me.fireEvent('resourcestorechange', me, resourceStore, oldStore);
        }
    },
    /**
     * Returns assignment store this event store is using by default.
     *
     * @return {Sch.data.AssignmentStore}
     */
    getAssignmentStore: function() {
        return this.assignmentStore;
    },
    /**
     * Sets assignment store instance this event store will be using by default.
     *
     * @param {Sch.data.AssignmentStore} store
     */
    setAssignmentStore: function(assignmentStore) {
        var me = this,
            oldStore = me.assignmentStore;
        if (me.assignmentStore) {
            me.assignmentStore.setEventStore(null);
            me.idConsistencyManager && me.idConsistencyManager.setAssignmentStore(null);
            me.modelPersistencyManager && me.modelPersistencyManager.setAssignmentStore(null);
        }
        me.assignmentStore = assignmentStore && Ext.StoreMgr.lookup(assignmentStore) || null;
        if (me.assignmentStore) {
            me.modelPersistencyManager && me.modelPersistencyManager.setAssignmentStore(me.assignmentStore);
            me.idConsistencyManager && me.idConsistencyManager.setAssignmentStore(me.assignmentStore);
            me.assignmentStore.setEventStore(me);
            // If assignment store's set then caching now will be done by it
            // and event store doesn't need to maintain it's own resource-to-events cache.
            Ext.destroy(me.resourceEventsCache);
        } else {
            // If assignment store's reset then caching now should be done by
            // event store again.
            me.resourceEventsCache = me.createResourceEventsCache();
        }
        if ((oldStore || assignmentStore) && oldStore !== assignmentStore) {
            /**
             * @event assignmentstorechange
             * Fires when new assignment store is set via {@link #setAssignmentStore} method.
             * @param {Sch.data.EventStore}           this
             * @param {Sch.data.AssignmentStore|null} newAssignmentStore
             * @param {Sch.data.AssignmentStore|null} oldAssignmentStore
             */
            me.fireEvent('assignmentstorechange', me, assignmentStore, oldStore);
        }
    },
    /**
     * Returns a dependecy store instance this event store is associated with. See also {@link #setDependencyStore}.
     *
     * @return {Sch.data.DependencyStore}
     */
    getDependencyStore: function() {
        return this.dependencyStore;
    },
    /**
     * Sets the dependency store for this event store
     *
     * @param {Sch.data.DependencyStore} dependencyStore
     */
    setDependencyStore: function(dependencyStore) {
        var me = this,
            oldStore = me.DependencyStore;
        if (me.dependencyStore) {
            me.dependencyStore.setEventStore(null);
            me.idConsistencyManager && me.idConsistencyManager.setDependencyStore(null);
            me.modelPersistencyManager && me.modelPersistencyManager.setDependencyStore(null);
        }
        me.dependencyStore = dependencyStore && Ext.StoreMgr.lookup(dependencyStore) || null;
        if (me.dependencyStore) {
            me.modelPersistencyManager && me.modelPersistencyManager.setDependencyStore(me.dependencyStore);
            me.idConsistencyManager && me.idConsistencyManager.setDependencyStore(me.dependencyStore);
            me.dependencyStore.setEventStore(me);
        }
        if ((oldStore || dependencyStore) && oldStore !== dependencyStore) {
            /**
             * @event dependencystorechange
             * Fires when new dependency store is set via {@link #setDependencyStore} method.
             * @param {Sch.data.EventStore}           this
             * @param {Sch.data.DependencyStore|null} newDependencyStore
             * @param {Sch.data.DependencyStore|null} oldDependencyStore
             */
            me.fireEvent('dependencystorechange', me, dependencyStore, oldStore);
        }
    },
    /**
     * Checks if a date range is allocated or not for a given resource.
     * @param {Date} start The start date
     * @param {Date} end The end date
     * @param {[Sch.model.Event/Sch.model.Assignment]} excludeEvent An event (or assignment) to exclude from the check (or null)
     * @param {Sch.model.Resource} resource The resource
     * @return {Boolean} True if the timespan is available for the resource
     */
    isDateRangeAvailable: function(start, end, excludeEvent, resource) {
        var DATE = Sch.util.Date,
            events = resource ? this.getEventsForResource(resource) : this.getRange(),
            available = true;
        if (Sch.model.Assignment && excludeEvent instanceof Sch.model.Assignment) {
            excludeEvent = excludeEvent.getEvent(this);
        }
        // This can be optimized further if we use simple for() statement (will lead to -1 function call in the loop)
        Ext.each(events, function(ev) {
            available = excludeEvent === ev || !DATE.intersectSpans(start, end, ev.getStartDate(), ev.getEndDate());
            return available;
        });
        // to immediately stop looping if interval is occupied by a non excluding event
        return available;
    },
    /**
     * Returns events between the supplied start and end date
     * @param {Date} start The start date
     * @param {Date} end The end date
     * @param {Boolean} allowPartial false to only include events that start and end inside of the span
     * @return {Ext.util.MixedCollection} the events
     */
    getEventsInTimeSpan: function(start, end, allowPartial) {
        var coll = new Ext.util.MixedCollection();
        var events = [];
        if (allowPartial !== false) {
            var DATE = Sch.util.Date;
            this.forEachScheduledEvent(function(event, eventStart, eventEnd) {
                if (DATE.intersectSpans(eventStart, eventEnd, start, end)) {
                    events.push(event);
                }
            });
        } else {
            this.forEachScheduledEvent(function(event, eventStart, eventEnd) {
                if (eventStart - start >= 0 && end - eventEnd >= 0) {
                    events.push(event);
                }
            });
        }
        coll.addAll(events);
        return coll;
    },
    getEventsByStartDate: function(start) {
        var DATE = Sch.util.Date;
        var events = [];
        this.forEachScheduledEvent(function(event, eventStart, eventEnd) {
            if (DATE.compareWithPrecision(eventStart, start, DATE.DAY) === 0) {
                events.push(event);
            }
        });
        return events;
    },
    /**
     * Calls the supplied iterator function once for every scheduled event, providing these arguments
     *      - event : the event record
     *      - startDate : the event start date
     *      - endDate : the event end date
     *
     * Returning false cancels the iteration.
     *
     * @param {Function} fn iterator function
     * @param {Object} scope scope for the function
     */
    forEachScheduledEvent: function(fn, scope) {
        this.each(function(event) {
            var eventStart = event.getStartDate(),
                eventEnd = event.getEndDate();
            if (eventStart && eventEnd) {
                return fn.call(scope || this, event, eventStart, eventEnd);
            }
        }, this);
    },
    /**
     * Returns an object defining the earliest start date and the latest end date of all the events in the store.
     *
     * @return {Object} An object with 'start' and 'end' Date properties (or null values if data is missing).
     */
    getTotalTimeSpan: function() {
        var earliest = Sch.util.Date.MAX_VALUE,
            latest = Sch.util.Date.MIN_VALUE,
            D = Sch.util.Date;
        this.each(function(r) {
            if (r.getStartDate()) {
                earliest = D.min(r.getStartDate(), earliest);
            }
            if (r.getEndDate()) {
                latest = D.max(r.getEndDate(), latest);
            }
        });
        earliest = earliest < Sch.util.Date.MAX_VALUE ? earliest : null;
        latest = latest > Sch.util.Date.MIN_VALUE ? latest : null;
        // keep last calculated value to be able to track total timespan changes
        this.lastTotalTimeSpan = {
            start: earliest || null,
            end: latest || earliest || null
        };
        return this.lastTotalTimeSpan;
    },
    /**
     * Filters the events associated with a resource, based on the function provided. An array will be returned for those
     * events where the passed function returns true.
     * @private {Sch.model.Resource} resource
     * @param {Sch.model.Resource} resource
     * @param {Function} fn The function
     * @param {Object} [scope] The 'this object' for the function
     * @return {Sch.model.Event[]} the events in the time span
     */
    filterEventsForResource: function(resource, fn, scope) {
        // `getEvents` method of the resource will use either `indexByResource` or perform a full scan of the event store
        var events = resource.getEvents(this);
        return Ext.Array.filter(events, fn, scope || this);
    },
    // This method provides a way for the store to append a new record, and the consuming class has to implement it
    // since Store and TreeStore don't share the add API.
    append: function(record) {
        throw 'Must be implemented by consuming class';
    },
    // {{{ Entire data model management methods
    /**
     * Returns all resources assigned to an event.
     *
     * @param {Sch.model.Event/Mixed} event
     * @return {Sch.model.Resource[]}
     */
    getResourcesForEvent: function(event) {
        var me = this,
            assignmentStore = me.getAssignmentStore(),
            resourceStore = me.getResourceStore(),
            result;
        if (assignmentStore) {
            result = assignmentStore.getResourcesForEvent(event);
        } else if (resourceStore) {
            event = event instanceof Sch.model.Event && event || me.getModelById(event);
            result = event && resourceStore.getModelById(event.getResourceId());
            result = result && [
                result
            ] || [];
        } else {
            result = [];
        }
        return result;
    },
    /**
     * Returns all events assigned to a resource
     *
     * @param {Sch.model.Resource/Mixed} resource
     * @return {Sch.model.Event[]}
     */
    getEventsForResource: function(resource) {
        var me = this,
            assignmentStore = me.getAssignmentStore(),
            result;
        if (assignmentStore) {
            result = assignmentStore.getEventsForResource(resource);
        }
        // Resource->Events cache is not always accessible, a subclass might override createResourceEventsCache() method
        // returning null
        else if (me.resourceEventsCache) {
            result = me.resourceEventsCache.get(resource);
        } else {
            result = [];
        }
        return result;
    },
    /**
     * Returns all assignments for a given event.
     *
     * @param {Sch.model.Event/Mixed} event
     * @return {Sch.model.Assignment[]}
     */
    getAssignmentsForEvent: function(event) {
        var me = this,
            assignmentStore = me.getAssignmentStore();
        return assignmentStore && assignmentStore.getAssignmentsForEvent(event) || [];
    },
    /**
     * Returns all assignments for a given resource.
     *
     * @param {Sch.model.Resource/Mixed} resource
     * @return {Sch.model.Assignment[]}
     */
    getAssignmentsForResource: function(resource) {
        var me = this,
            assignmentStore = me.getAssignmentStore();
        return assignmentStore && assignmentStore.getAssignmentsForResource(resource) || [];
    },
    /**
     * Creates and adds assignment record for a given event and a resource.
     *
     * @param {Sch.model.Event/Mixed} event
     * @param {Sch.model.Resource/Mixed/Sch.model.Resource[]/Mixed[]} resource The resource(s) to assign to the event
     */
    assignEventToResource: function(event, resource) {
        var me = this,
            assignmentStore = me.getAssignmentStore();
        if (assignmentStore) {
            assignmentStore.assignEventToResource(event, resource);
        } else {
            if (Ext.isArray(resource))  {
                resource = resource[0];
            }
            
            event = event instanceof Sch.model.Event && event || me.getModelById(event);
            resource = resource instanceof Sch.model.Resource ? resource.getId() : resource;
            // resource id might be 0 thus we use ? operator
            event && event.setResourceId(resource);
        }
    },
    // This will update resource events cache via 'update' event.
    /**
     * Removes assignment record for a given event and a resource.
     *
     * @param {Sch.model.Event/Mixed} event
     * @param {Sch.model.Resource/Mixed} resource
     */
    unassignEventFromResource: function(event, resource) {
        var me = this,
            assignmentStore = me.getAssignmentStore();
        if (assignmentStore) {
            assignmentStore.unassignEventFromResource(event, resource);
        } else {
            event = event instanceof Sch.model.Event && event || me.getModelById(event);
            resource = resource instanceof Sch.model.Resource ? resource.getId() : resource;
            // resource id might be 0 thus we use ? operator
            if (event && (typeof resource == 'undefined' || event.getResourceId() == resource)) {
                event.setResourceId(null);
            }
        }
    },
    // This will update resource events cache via 'update' event
    /**
     * Reassigns an event from an old resource to a new resource
     *
     * @param {Sch.model.Event}    event    An event or id of the event to reassign
     * @param {Sch.model.Resource/Sch.model.Resource[]} oldResource A resource or id to unassign from
     * @param {Sch.model.Resource/Sch.model.Resource[]} newResource A resource or id to assign to
     */
    reassignEventFromResourceToResource: function(event, oldResource, newResource) {
        var me = this,
            assignmentStore = me.getAssignmentStore();
        var newResourceId = newResource instanceof Sch.model.Resource ? newResource.getId() : newResource;
        // resource id might be 0 thus we use ? operator
        var oldResourceId = oldResource instanceof Sch.model.Resource ? oldResource.getId() : oldResource;
        // resource id might be 0 thus we use ? operator
        if (assignmentStore) {
            var assignment = assignmentStore.getAssignmentForEventAndResource(event, oldResource);
            if (assignment) {
                assignment.setResourceId(newResourceId);
            } else {
                assignmentStore.assignEventToResource(event, newResource);
            }
        } else {
            event = event instanceof Sch.model.Event && event || me.getModelById(event);
            if (event.getResourceId() == oldResourceId) {
                event.setResourceId(newResourceId);
            }
        }
    },
    /**
     * Checks whether an event is assigned to a resource.
     *
     * @param {Sch.model.Event/Mixed} event
     * @param {Sch.model.Resouce/Mixed} resource
     * @return {Boolean}
     */
    isEventAssignedToResource: function(event, resource) {
        var me = this,
            assignmentStore = me.getAssignmentStore(),
            result;
        if (assignmentStore) {
            result = assignmentStore.isEventAssignedToResource(event, resource);
        } else {
            event = event instanceof Sch.model.Event && event || me.getModelById(event);
            resource = resource instanceof Sch.model.Resource ? resource.getId() : resource;
            // resource id might be 0 thus we use ? operator
            result = event && (event.getResourceId() == resource) || false;
        }
        return result;
    },
    /**
     * Removes all assignments for given event
     *
     * @param {Sch.model.Event/Mixed} event
     */
    removeAssignmentsForEvent: function(event) {
        var me = this,
            assignmentStore = me.getAssignmentStore();
        if (assignmentStore) {
            assignmentStore.removeAssignmentsForEvent(event);
        } else {
            event = event instanceof Sch.model.Event && event || me.getModelById(event);
            event && event.setResourceId(null);
        }
    },
    // This will update resource events cache via 'update' event
    /**
     * Removes all assignments for given resource
     *
     * @param {Sch.model.Resource/Mixed} resource
     */
    removeAssignmentsForResource: function(resource) {
        var me = this,
            assignmentStore = me.getAssignmentStore(),
            resourceStore = me.getResourceStore();
        if (assignmentStore) {
            assignmentStore.removeAssignmentsForResource(resource);
        } else if (resourceStore) {
            resource = resource instanceof Sch.model.Resource && resource || resourceStore.getModelById(resource);
            resource && Ext.Array.each(me.resourceEventsCache.get(resource), function(event) {
                event.setResourceId(null);
            });
        } else // This will update resource events cache via 'update' event
        {
            resource = resource instanceof Sch.model.Resource ? resource.getId() : resource;
            // resource id might be 0 thus we use ? operator
            Ext.Array.each(me.getRange(), function(event) {
                event.getResourceId() == resource && event.setResourceId(null);
            });
        }
    },
    // This will update resource events cache via 'update' event
    /**
     * Checks if given event record is persistable.
     * In case assignment store is used to assign events to resources and vise versa event is considered to be always
     * persistable. Otherwise backward compatible logic is used, i.e. event is considered to be persistable when
     * resources it's assigned to are not phantom.
     *
     * @param {Sch.model.Range} event
     * @return {Boolean}
     */
    isEventPersistable: function(event) {
        var me = this,
            assignmentStore = me.getAssignmentStore(),
            resources, i, len,
            result = true;
        if (!assignmentStore) {
            resources = event.getResources();
            for (i = 0 , len = resources.length; result && i < len; ++i) {
                result = resources[i].phantom !== true;
            }
        }
        return result;
    }
});

/**
 * This class represents an event recurrence settings.
 */
Ext.define('Sch.model.Recurrence', {
    extend: 'Sch.model.Customizable',
    idProperty: 'Id',
    isRecurrenceModel: true,
    customizableFields: [
        /**
         * @field Id
         * Unique identifier of the recurrence.
         */
        /**
         * @field
         * Field defines the recurrence frequency. Supported values are: "DAILY", "WEEKLY", "MONTHLY", "YEARLY".
         */
        {
            name: 'Frequency',
            defaultValue: "DAILY"
        },
        /**
         * @field
         * Field defines how often the recurrence repeats.
         * For example, if the recurrence is weekly its interval is 2, then the event repeats every two weeks.
         */
        {
            name: 'Interval',
            type: 'int',
            defaultValue: 1
        },
        /**
         * @field
         * End date of the recurrence in ISO 8601 format (see {@link Ext.Date} available formats). Specifies when the recurrence ends.
         * The value is optional, the recurrence can as well be stopped using {@link #Count} field value.
         */
        {
            name: 'EndDate',
            type: 'date'
        },
        /**
         * @field
         * Specifies the number of occurrences after which the recurrence ends.
         * The value includes the associated event itself so values less than 2 make no sense.
         * The field is optional, the recurrence as well can be stopped using {@link #EndDate} field value.
         */
        {
            name: 'Count',
            type: 'int',
            allowNull: true
        },
        /**
         * @field
         * @type {String[]}
         * Specifies days of the week on which the event should occur.
         * An array of string values "SU", "MO", "TU", "WE", "TH", "FR", "SA"
         * corresponding to Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, and Saturday days of the week.
         * Each value can also be preceded by a positive (+n) or negative (-n) integer.
         * If present, this indicates the nth occurrence of a specific day within the monthly or yearly recurrence.
         *
         * **Not applicable** for daily {@link #Frequency frequency}.
         */
        {
            name: 'Days',
            convert: function(value, record) {
                if (value) {
                    if (Ext.isString(value)) {
                        value = value.split(',');
                    }
                } else {
                    value = null;
                }
                return value;
            },
            isEqual: function(value1, value2) {
                return String(value1) === String(value2);
            }
        },
        /**
         * @field
         * @type {Integer[]}
         * Specifies days of the month on which the event should occur.
         * An array of integer values (-31..-1 - +1..+31, negative values mean counting backwards from the month end).
         * **Applicable only** for monthly {@link #Frequency frequency}.
         */
        {
            name: 'MonthDays',
            convert: function(value, record) {
                if (value) {
                    if (Ext.isString(value)) {
                        value = Ext.Array.map(value.split(','), function(item) {
                            return parseInt(item, 10);
                        });
                    }
                } else {
                    value = null;
                }
                return value;
            },
            isEqual: function(value1, value2) {
                return String(value1) === String(value2);
            }
        },
        /**
         * @field
         * @type {Integer[]}
         * Specifies months of the year on which the event should occur.
         * An array of integer values (1 - 12).
         * **Applicable only** for yearly {@link #Frequency frequency}.
         */
        {
            name: 'Months',
            convert: function(value, record) {
                if (value) {
                    if (Ext.isString(value)) {
                        value = Ext.Array.map(value.split(','), function(item) {
                            return parseInt(item, 10);
                        });
                    }
                } else {
                    value = null;
                }
                return value;
            },
            isEqual: function(value1, value2) {
                return String(value1) === String(value2);
            }
        },
        /**
         * @field
         * @type {Integer}
         * The positions to include in the recurrence. The values operate on a set of recurrence instances **in one interval** of the recurrence rule.
         * An array of integer values (valid values are 1 to 366 or -366 to -1, negative values mean counting backwards from the end of the built list of occurrences).
         * **Not applicable** for daily {@link #Frequency frequency}.
         */
        {
            name: 'Positions',
            convert: function(value, record) {
                if (value) {
                    if (Ext.isString(value)) {
                        value = Ext.Array.map(value.split(','), function(item) {
                            return parseInt(item, 10);
                        });
                    }
                } else {
                    value = null;
                }
                return value;
            },
            isEqual: function(value1, value2) {
                return String(value1) === String(value2);
            }
        }
    ],
    /**
     * @cfg {String} frequencyField The name of the {@link #Frequency} field.
     */
    frequencyField: 'Frequency',
    /**
     * @cfg {String} intervalField The name of the {@link #Interval} field.
     */
    intervalField: 'Interval',
    /**
     * @cfg {String} endDateField The name of the {@link #EndDate} field.
     */
    endDateField: 'EndDate',
    /**
     * @cfg {String} countField The name of the {@link #Count} field.
     */
    countField: 'Count',
    /**
     * @cfg {String} daysField The name of the {@link #Weekdays} field.
     */
    daysField: 'Days',
    /**
     * @cfg {String} monthDaysField The name of the {@link #MonthDays} field.
     */
    monthDaysField: 'MonthDays',
    /**
     * @cfg {String} monthsField The name of the {@link #Months Months} field.
     */
    monthsField: 'Months',
    /**
     * @cfg {String} positionsField The name of the {@link #Positions} field.
     */
    positionsField: 'Positions',
    inheritableStatics: {
        /**
         * @static
         * Constant for daily {@link #Frequency frequency}.
         */
        DAILY: "DAILY",
        /**
         * @static
         * Constant for weekly {@link #Frequency frequency}.
         */
        WEEKLY: "WEEKLY",
        /**
         * @static
         * Constant for monthly {@link #Frequency frequency}.
         */
        MONTHLY: "MONTHLY",
        /**
         * @static
         * Constant for yearly {@link #Frequency frequency}.
         */
        YEARLY: "YEARLY"
    },
    dateFormat: 'Ymd\\THis\\Z',
    /**
     * @cfg {Sch.model.Event}
     * The event this recurrence is associated with.
     */
    event: null,
    /**
     * @cfg {String}
     * The recurrence rule. A string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format ("RRULE" expression).
     */
    rule: null,
    suspendedEventNotifying: 0,
    constructor: function(cfg) {
        cfg = cfg || {};
        var rule, event;
        if (cfg.event) {
            event = cfg.event;
            delete cfg.event;
        }
        if (cfg.rule) {
            rule = cfg.rule;
            delete cfg.rule;
        }
        this.callParent(arguments);
        this.suspendEventNotifying();
        if (rule) {
            this.setRule(rule);
        }
        this.resumeEventNotifying();
        this.event = event;
    },
    sanitize: function() {
        var me = this,
            frequency = me.getFrequency(),
            event = me.getEvent(),
            eventStartDate = event && event.getStartDate();
        me.sanitizing = true;
        switch (frequency) {
            case 'DAILY':
                me.setPositions(null);
                me.setDays(null);
                me.setMonthDays(null);
                me.setMonths(null);
                break;
            case 'WEEKLY':
                me.setPositions(null);
                me.setMonthDays(null);
                me.setMonths(null);
                var days = me.getDays(),
                    encodeDay = Sch.data.util.recurrence.DayRuleEncoder.encodeDay;
                if (eventStartDate && days && days.length == 1 && days[0] == encodeDay(eventStartDate.getDay())) {
                    me.setDays(null);
                };
                break;
            case 'MONTHLY':
                if (me.getMonthDays() && me.getMonthDays().length) {
                    me.setPositions(null);
                    me.setDays(null);
                };
                me.setMonths(null);
                var monthDays = me.getMonthDays();
                if (eventStartDate && monthDays && monthDays.length == 1 && monthDays[0] == eventStartDate.getDate()) {
                    me.setMonthDays(null);
                };
                break;
            case 'YEARLY':
                me.setMonthDays(null);
                var months = me.getMonths();
                if (eventStartDate && months && months.length == 1 && months[0] == eventStartDate.getMonth() + 1) {
                    me.setMonths(null);
                };
                break;
        }
        me.sanitizing = false;
    },
    copy: function() {
        var result = this.callParent(arguments);
        result.dateFormat = this.dateFormat;
        result.event = this.event;
        return result;
    },
    set: function(field, value) {
        this.callParent(arguments);
        // TODO: handle beginEdit/endEdit to call this block only once
        if (!this.sanitizing) {
            // cleanup data to match the chosen frequency
            this.sanitize();
        }
        var event = this.getEvent();
        if (event && !this.suspendedEventNotifying) {
            event.onRecurrenceChanged();
        }
    },
    suspendEventNotifying: function() {
        this.suspendedEventNotifying++;
    },
    resumeEventNotifying: function() {
        if (this.suspendedEventNotifying)  {
            this.suspendedEventNotifying--;
        }
        
    },
    /**
     * Returns the event associated with this recurrence.
     * @return {Sch.model.Event} Event instance.
     */
    getEvent: function() {
        return this.event;
    },
    /**
     * Sets the event associated with this recurrence.
     * @param {Sch.model.Event} Event instance.
     */
    setEvent: function(event) {
        return this.event = event;
    },
    /**
     * Returns the recurrence rule - a string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format ("RRULE" expression).
     * @return {String} The recurrence rule.
     */
    getRule: function() {
        var me = this,
            result = [];
        if (me.getFrequency()) {
            result.push('FREQ=' + me.getFrequency());
            if (me.getInterval() > 1) {
                result.push('INTERVAL=' + me.getInterval());
            }
            if (me.getDays() && me.getDays().length) {
                result.push('BYDAY=' + me.getDays().join(','));
            }
            if (me.getMonthDays() && me.getMonthDays().length) {
                result.push('BYMONTHDAY=' + me.getMonthDays().join(','));
            }
            if (me.getMonths() && me.getMonths().length) {
                result.push('BYMONTH=' + me.getMonths().join(','));
            }
            if (me.getCount()) {
                result.push('COUNT=' + me.getCount());
            }
            if (me.getEndDate()) {
                result.push('UNTIL=' + Ext.Date.format(me.getEndDate(), me.dateFormat));
            }
            if (me.getPositions() && me.getPositions().length) {
                result.push('BYSETPOS=' + me.getPositions().join(','));
            }
        }
        return result.join(';');
    },
    /**
     * Sets the recurrence rule - a string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format ("RRULE" expression).
     * @param {String} The recurrence rule.
     */
    setRule: function(rule) {
        var me = this;
        if (rule) {
            me.beginEdit();
            var parts = rule.split(';');
            for (var i = 0,
                len = parts.length; i < len; i++) {
                var part = parts[i].split('='),
                    value = part[1];
                switch (part[0]) {
                    case 'FREQ':
                        me.setFrequency(value);
                        break;
                    case 'INTERVAL':
                        me.setInterval(value);
                        break;
                    case 'COUNT':
                        me.setCount(value);
                        break;
                    case 'UNTIL':
                        me.setEndDate(Ext.Date.parse(value, me.dateFormat));
                        break;
                    case 'BYDAY':
                        me.setDays(value);
                        break;
                    case 'BYMONTHDAY':
                        me.setMonthDays(value);
                        break;
                    case 'BYMONTH':
                        me.setMonths(value);
                        break;
                    case 'BYSETPOS':
                        me.setPositions(value);
                        break;
                }
            }
            me.endEdit();
        }
    }
});

Ext.define('Sch.data.util.DelayedCalls', {
    singleton: true,
    mixins: [
        'Ext.util.Observable'
    ],
    delayedCallTimeout: 100,
    delayedCalls: null,
    constructor: function(config) {
        this.mixins.observable.constructor.call(this, config);
        Ext.apply(this, config);
    },
    cancel: function() {
        var me = this,
            delayedCalls = me.delayedCalls;
        if (delayedCalls) {
            var ids = arguments.length ? arguments : Ext.Oject.getKeys(delayedCalls);
            for (var i = ids.length - 1; i >= 0; i--) {
                var id = ids[i];
                if (delayedCalls[id] && delayedCalls[id].timer) {
                    clearTimeout(delayedCalls[id].timer);
                    delayedCalls[id].timer = null;
                }
            }
        }
    },
    execute: function(delayedCalls) {
        var scope = delayedCalls.scope,
            args;
        this.fireEvent('delayed-' + delayedCalls.id + '-start', this, delayedCalls);
        delayedCalls.beforeFn && delayedCalls.beforeFn.call(scope, delayedCalls);
        var fn = delayedCalls.fn;
        while ((args = delayedCalls.entries.shift())) {
            fn.apply(scope, args);
        }
        delayedCalls.afterFn && delayedCalls.afterFn.call(scope, delayedCalls);
        this.fireEvent('delayed-' + delayedCalls.id + '-end', this, delayedCalls);
    },
    schedule: function(config) {
        config = config || {};
        var me = this;
        me.delayedCalls = me.delayedCalls || {};
        var id = config.id || me.schedule.caller.$name;
        var args = config.args || [];
        // get this specific group of delayed calls
        if (!me.delayedCalls[id]) {
            me.delayedCalls[id] = Ext.apply({
                scope: this
            }, {
                id: id,
                entries: []
            }, config);
            delete me.delayedCalls[id].args;
        }
        var delayedCalls = me.delayedCalls[id];
        // reset previously set timer (if set)
        me.cancel(id);
        delayedCalls.entries.push(args);
        // Setup timer to delay the call
        delayedCalls.timer = setTimeout(function() {
            me.execute(delayedCalls);
            delete me.delayedCalls[id];
        }, config.timeout || me.delayedCallTimeout);
        return delayedCalls;
    }
});

Ext.define('Sch.data.util.recurrence.AbstractIterator', {
    frequency: 'NONE',
    MAX_OCCURRENCES_COUNT: 1000000,
    /**
     * @private
     * Returns Nth occurrence of a week day in the provided period of time.
     * @param  {Date} startDate Period start date.
     * @param  {Date} endDate   Period end date.
     * @param  {Integer} day    Week day (0 - Sunday, 1 - Monday, 2 - Tuesday, etc.)
     * @param  {Integer} index  Index to find.
     * @return {Date}           Returns the found date or null if there is no `index`th entry.
     */
    getNthDayInPeriod: function(startDate, endDate, day, index) {
        var result, sign, delta, borderDate;
        if (index) {
            var dayDurationInMs = 86400000,
                weekDurationInMs = 604800000;
            if (index > 0) {
                sign = 1;
                borderDate = startDate;
            } else {
                sign = -1;
                borderDate = endDate;
            }
            // delta between requested day and border day
            delta = day - borderDate.getDay();
            // if the requested day goes after (before, depending on borderDate used (start/end))
            // we adjust index +/-1
            if (sign * delta < 0)  {
                index += sign;
            }
            
            // measure "index" weeks forward (or backward) ..take delta into account
            result = new Date(borderDate.getTime() + (index - sign) * weekDurationInMs + delta * dayDurationInMs);
            // if resulting date is outside of the provided range there is no "index"-th entry
            // of the day
            if (result < startDate || result > endDate)  {
                result = null;
            }
            
        }
        return result;
    },
    buildDate: function(year, month, date) {
        var dt = new Date(year, month, date);
        if (dt.getFullYear() == year && dt.getMonth() == month && dt.getDate() == date) {
            return dt;
        }
    },
    isValidPosition: function(position) {
        return Boolean(position);
    },
    forEachDateAtPositions: function(dates, positions, fn, scope) {
        var datesLength = dates.length,
            processed = {};
        for (var i = 0; i < positions.length; i++) {
            var index = positions[i];
            if (this.isValidPosition(index)) {
                var date = index > 0 ? dates[index - 1] : dates[datesLength + index];
                if (date && !processed[date.getTime()]) {
                    // remember that we've returned the date
                    processed[date.getTime()] = true;
                    // return false if it's time to stop recurring
                    if (fn.call(scope, date) === false)  {
                        return false;
                    }
                    
                }
            }
        }
    }
});

Ext.define('Sch.data.util.recurrence.DailyIterator', {
    extend: 'Sch.data.util.recurrence.AbstractIterator',
    requires: [
        'Sch.util.Date'
    ],
    singleton: true,
    frequency: 'DAILY',
    forEachDate: function(config) {
        var me = this,
            recurrence = config.recurrence,
            event = recurrence.getEvent(),
            eventStart = event.getStartDate(),
            startDate = config.startDate || eventStart,
            until = recurrence.getEndDate(),
            endDate = config.endDate || until,
            fn = config.fn,
            scope = config.scope || me,
            D = Sch.util.Date,
            interval = recurrence.getInterval(),
            count = recurrence.getCount(),
            counter = 0;
        if (until && endDate && endDate > until)  {
            endDate = until;
        }
        
        // iteration should not start before the event starts
        if (eventStart > startDate)  {
            startDate = eventStart;
        }
        
        var delay = startDate - eventStart,
            // recurrence interval duration in ms (86400000 is a single day duration in ms)
            intervalDuration = interval * 86400000,
            delayInIntervals = Math.floor(delay / intervalDuration);
        // TODO: need to make a constant
        if (!endDate && !count)  {
            count = me.MAX_OCCURRENCES_COUNT;
        }
        
        var date = D.add(eventStart, D.DAY, delayInIntervals);
        while (!endDate || date <= endDate) {
            counter++;
            if (date >= startDate) {
                if ((endDate && date > endDate) || fn.call(scope, date, counter) === false || (count && counter >= count))  {
                    break;
                }
                
            }
            // shift to the next day
            date = D.add(date, D.DAY, interval);
        }
    }
});

Ext.define('Sch.data.util.recurrence.DayRuleEncoder', {
    singleton: true,
    dayParseRegExp: /^([+-]?[0-9])?(SU|MO|TU|WE|TH|FR|SA)$/,
    decodeDay: function(rawDay) {
        var parsedDay, result;
        if ((parsedDay = this.dayParseRegExp.exec(rawDay))) {
            result = [];
            // parse day name
            switch (parsedDay[2]) {
                case "SU":
                    result.push(0);
                    break;
                case "MO":
                    result.push(1);
                    break;
                case "TU":
                    result.push(2);
                    break;
                case "WE":
                    result.push(3);
                    break;
                case "TH":
                    result.push(4);
                    break;
                case "FR":
                    result.push(5);
                    break;
                case "SA":
                    result.push(6);
                    break;
            }
            // optional position number
            if (result) {
                if (parsedDay[1])  {
                    parsedDay[1] = parseInt(parsedDay[1], 10);
                }
                
                result.push(parsedDay[1]);
            }
        }
        return result;
    },
    encodeDay: function(day) {
        var position;
        // support decodeDay() result format
        if (Ext.isArray(day)) {
            day = day[0];
            position = day[1];
        }
        var result = position ? position.toString() : '';
        switch (day) {
            case 0:
                result += "SU";
                break;
            case 1:
                result += "MO";
                break;
            case 2:
                result += "TU";
                break;
            case 3:
                result += "WE";
                break;
            case 4:
                result += "TH";
                break;
            case 5:
                result += "FR";
                break;
            case 6:
                result += "SA";
                break;
        }
        return result;
    },
    // Turns days values provided as an array of strings (like ["-1MO", "SU", "+3FR"])
    // into an array of [ dayIndex, position ] elements, where:
    //
    // - `dayIndex` - zero-based week day index value (0 - Sunday, 1 - Monday, 2 - Tuesday, etc.)
    // - `position` - (optional) 1-based position of the day (integer value (can be both positive and negative))
    decode: function(rawDays) {
        var result = [],
            parsedDay;
        if (rawDays) {
            for (var i = 0; i < rawDays.length; i++) {
                if ((parsedDay = this.decodeDay(rawDays[i]))) {
                    result.push(parsedDay);
                }
            }
        }
        return result;
    },
    encode: function(days) {
        var result = [],
            day;
        if (days) {
            for (var i = 0; i < days.length; i++) {
                if ((day = this.encodeDay(days[i]))) {
                    result.push(day);
                }
            }
        }
        return result;
    }
});

Ext.define('Sch.data.util.recurrence.WeeklyIterator', {
    extend: 'Sch.data.util.recurrence.AbstractIterator',
    requires: [
        'Sch.util.Date',
        'Sch.data.util.recurrence.DayRuleEncoder'
    ],
    singleton: true,
    frequency: 'WEEKLY',
    forEachDate: function(config) {
        var me = this,
            D = Sch.util.Date,
            fn = config.fn,
            scope = config.scope || me,
            recurrence = config.recurrence,
            event = config.event || recurrence && recurrence.getEvent(),
            eventStart = config.eventStartDate || event.getStartDate(),
            startDate = config.startDate || eventStart,
            until = recurrence && recurrence.getEndDate(),
            endDate = config.endDate || until,
            interval = config.interval || recurrence.getInterval(),
            weekDays = Sch.data.util.recurrence.DayRuleEncoder.decode(config.days || recurrence && recurrence.getDays()),
            count = config.count || recurrence && recurrence.getCount(),
            counter = 0,
            weekStartDate, date;
        if (until && endDate && endDate > until)  {
            endDate = until;
        }
        
        // days could be provided in any order so it's important to sort them
        if (weekDays && weekDays.length) {
            weekDays.sort(function(a, b) {
                return a[0] - b[0];
            });
        } else // "Days" might be skipped then we use the event start day
        {
            weekDays = [
                [
                    eventStart.getDay()
                ]
            ];
        }
        // iteration should not start before the event starts
        if (eventStart > startDate) {
            startDate = eventStart;
        }
        // if the recurrence is limited w/ "Count"
        // we need to 1st count passed occurrences so we always start iteration from the event start date
        if (count) {
            weekStartDate = D.getNext(eventStart, D.WEEK, 0, 0);
        } else {
            weekStartDate = D.getNext(startDate, D.WEEK, 0, 0);
        }
        if (!endDate && !count)  {
            count = me.MAX_OCCURRENCES_COUNT;
        }
        
        while (!endDate || weekStartDate <= endDate) {
            for (var i = 0; i < weekDays.length; i++) {
                date = D.copyTimeValues(D.add(weekStartDate, D.DAY, weekDays[i][0]), eventStart);
                if (date >= eventStart) {
                    counter++;
                    if (date >= startDate) {
                        if ((endDate && date > endDate) || (fn.call(scope, date, counter) === false) || (count && counter >= count))  {
                            return;
                        }
                        
                    }
                }
            }
            // get next week start
            weekStartDate = D.getNext(weekStartDate, D.WEEK, interval, 0);
        }
    }
});

Ext.define('Sch.data.util.recurrence.MonthlyIterator', {
    extend: 'Sch.data.util.recurrence.AbstractIterator',
    requires: [
        'Sch.util.Date',
        'Sch.data.util.recurrence.DayRuleEncoder'
    ],
    singleton: true,
    frequency: 'MONTHLY',
    getNthDayOfMonth: function(date, dayNum) {
        var result = null,
            daysInMonth = Ext.Date.getDaysInMonth(date);
        if (dayNum && Math.abs(dayNum) <= daysInMonth) {
            result = new Date(date.getFullYear(), date.getMonth(), dayNum < 0 ? daysInMonth + dayNum + 1 : dayNum);
        }
        return result;
    },
    isValidPosition: function(position) {
        return position && Math.abs(position) > 0 && Math.abs(position) <= 31;
    },
    forEachDate: function(config) {
        var me = this,
            D = Sch.util.Date,
            fn = config.fn,
            scope = config.scope || me,
            recurrence = config.recurrence,
            event = config.event || recurrence.getEvent(),
            eventStart = config.eventStartDate || event.getStartDate(),
            startDate = config.startDate || eventStart,
            until = recurrence && recurrence.getEndDate(),
            endDate = config.endDate || until,
            interval = config.interval || recurrence.getInterval(),
            rawDays = config.days || recurrence && recurrence.getDays(),
            weekDays = Sch.data.util.recurrence.DayRuleEncoder.decode(rawDays),
            monthDays = config.monthDays || recurrence && recurrence.getMonthDays(),
            count = config.count || recurrence && recurrence.getCount(),
            positions = config.positions || recurrence && recurrence.getPositions(),
            hasPositions = positions && positions.length,
            counter = 0,
            processedDate = {},
            weekDayPosition, monthStartDate, monthEndDate, dates, date, i;
        if (until && endDate && endDate > until)  {
            endDate = until;
        }
        
        // iteration should not start before the event starts
        if (eventStart > startDate)  {
            startDate = eventStart;
        }
        
        // if the recurrence is limited w/ "Count"
        // we need to 1st count passed occurrences so we always start iteration from the event start date
        if (count) {
            monthStartDate = new Date(D.getNext(eventStart, D.MONTH, 0));
        } else {
            monthStartDate = new Date(D.getNext(startDate, D.MONTH, 0));
        }
        monthEndDate = new Date(D.getNext(monthStartDate, D.MONTH, 1) - 1);
        // if no month days nor week days are provided let's use event start date month day
        if (!(monthDays && monthDays.length) && !(weekDays && weekDays.length)) {
            monthDays = [
                eventStart.getDate()
            ];
        }
        if (weekDays && weekDays.length) {
            // Collect hash of positions indexed by week days
            Ext.each(weekDays, function(day) {
                if (day[1]) {
                    weekDayPosition = weekDayPosition || {};
                    weekDayPosition[day[0]] = day[1];
                }
            });
        }
        // label to break nested loops
        top: while ((!endDate || endDate >= monthStartDate) && (!count || counter < count)) {
            dates = [];
            if (weekDays && weekDays.length) {
                Ext.each(weekDays, function(day) {
                    var weekDay = day[0],
                        from = 1,
                        till = 53;
                    // if position provided
                    if (day[1]) {
                        from = till = day[1];
                    }
                    for (i = from; i <= till; i++) {
                        if ((date = me.getNthDayInPeriod(monthStartDate, monthEndDate, weekDay, i))) {
                            date = D.copyTimeValues(date, eventStart);
                            if (!processedDate[date.getTime()]) {
                                // remember we processed the date
                                processedDate[date.getTime()] = true;
                                dates.push(date);
                            }
                        }
                    }
                });
                dates.sort(function(a, b) {
                    return a - b;
                });
                if (!hasPositions) {
                    for (i = 0; i < dates.length; i++) {
                        date = dates[i];
                        if (date >= eventStart) {
                            counter++;
                            if (date >= startDate) {
                                if ((endDate && date > endDate) || (fn.call(scope, date, counter) === false) || (count && counter >= count))  {
                                    return false;
                                }
                                
                            }
                        }
                    }
                }
            } else {
                var sortedMonthDates = [];
                for (i = 0; i < monthDays.length; i++) {
                    // check if the date wasn't iterated over yet
                    if ((date = me.getNthDayOfMonth(monthStartDate, monthDays[i])) && !processedDate[date.getTime()]) {
                        processedDate[date.getTime()] = true;
                        sortedMonthDates.push(date);
                    }
                }
                // it's important to sort the dates to iterate over them in the proper order
                sortedMonthDates.sort(function(a, b) {
                    return a - b;
                });
                for (i = 0; i < sortedMonthDates.length; i++) {
                    date = D.copyTimeValues(sortedMonthDates[i], eventStart);
                    if (hasPositions) {
                        dates.push(date);
                    } else if (date >= eventStart) {
                        counter++;
                        if (date >= startDate) {
                            if ((endDate && date > endDate) || (fn.call(scope, date, counter) === false) || (count && counter >= count))  {
                                break top;
                            }
                            
                        }
                    }
                }
            }
            if (hasPositions && dates.length) {
                me.forEachDateAtPositions(dates, positions, function(date) {
                    if (date >= eventStart) {
                        counter++;
                        // Ignore dates outside of the [startDate, endDate] range
                        if (date >= startDate && (!endDate || date <= endDate)) {
                            // return false if it's time to stop recurring
                            if (fn.call(scope, date, counter) === false || (count && counter >= count))  {
                                return false;
                            }
                            
                        }
                    }
                });
            }
            // get next month start
            monthStartDate = D.getNext(monthStartDate, D.MONTH, interval);
            monthEndDate = new Date(D.getNext(monthStartDate, D.MONTH, 1) - 1);
        }
    }
});

Ext.define('Sch.data.util.recurrence.YearlyIterator', {
    extend: 'Sch.data.util.recurrence.AbstractIterator',
    requires: [
        'Sch.util.Date',
        'Sch.data.util.recurrence.DayRuleEncoder'
    ],
    singleton: true,
    frequency: 'YEARLY',
    forEachDate: function(config) {
        var me = this,
            D = Sch.util.Date,
            fn = config.fn,
            scope = config.scope || me,
            recurrence = config.recurrence,
            event = config.event || recurrence.getEvent(),
            eventStart = config.eventStartDate || event.getStartDate(),
            startDate = config.startDate || eventStart,
            until = recurrence && recurrence.getEndDate(),
            endDate = config.endDate || until,
            interval = config.interval || recurrence.getInterval(),
            rawDays = config.days || recurrence && recurrence.getDays(),
            weekDays = Sch.data.util.recurrence.DayRuleEncoder.decode(rawDays),
            months = config.months || recurrence && recurrence.getMonths(),
            count = config.count || recurrence && recurrence.getCount(),
            positions = config.positions || recurrence && recurrence.getPositions(),
            hasPositions = positions && positions.length,
            counter = 0,
            processedDate = {},
            weekDayPosition, yearStartDate, yearEndDate, dates, date, i;
        if (until && endDate && endDate > until)  {
            endDate = until;
        }
        
        // iteration should not start before the event starts
        if (eventStart > startDate)  {
            startDate = eventStart;
        }
        
        // if the recurrence is limited w/ "Count"
        // we need to 1st count passed occurrences so we always start iteration from the event start date
        if (count) {
            yearStartDate = new Date(D.getNext(eventStart, D.YEAR, 0));
        } else {
            yearStartDate = new Date(D.getNext(startDate, D.YEAR, 0));
        }
        yearEndDate = new Date(D.getNext(yearStartDate, D.YEAR, 1) - 1);
        months && months.sort(function(a, b) {
            return a - b;
        });
        // if no months provided let's use the event month
        if (!(months && months.length) && !(weekDays && weekDays.length)) {
            months = [
                eventStart.getMonth() + 1
            ];
        }
        if (weekDays && weekDays.length) {
            // Collect hash of positions indexed by week days
            Ext.each(weekDays, function(day) {
                if (day[1]) {
                    weekDayPosition = weekDayPosition || {};
                    weekDayPosition[day[0]] = day[1];
                }
            });
        }
        // label to break nested loops
        top: while ((!endDate || endDate >= yearStartDate) && (!count || counter < count)) {
            dates = [];
            if (weekDays && weekDays.length) {
                Ext.each(weekDays, function(day) {
                    var weekDay = day[0],
                        from = 1,
                        till = 53;
                    // if position provided
                    if (day[1]) {
                        from = till = day[1];
                    }
                    for (i = from; i <= till; i++) {
                        if ((date = me.getNthDayInPeriod(yearStartDate, yearEndDate, weekDay, i))) {
                            date = D.copyTimeValues(date, eventStart);
                            if (!processedDate[date.getTime()]) {
                                // remember we processed the date
                                processedDate[date.getTime()] = true;
                                dates.push(date);
                            }
                        }
                    }
                });
                dates.sort(function(a, b) {
                    return a - b;
                });
                if (!hasPositions) {
                    for (i = 0; i < dates.length; i++) {
                        date = dates[i];
                        if (date >= eventStart) {
                            counter++;
                            if (date >= startDate) {
                                if ((endDate && date > endDate) || (fn.call(scope, date, counter) === false) || (count && counter >= count))  {
                                    return false;
                                }
                                
                            }
                        }
                    }
                }
            } else {
                for (i = 0; i < months.length; i++) {
                    if ((date = me.buildDate(yearStartDate.getFullYear(), months[i] - 1, eventStart.getDate()))) {
                        date = D.copyTimeValues(date, eventStart);
                        // check if the date wasn't iterated over yet
                        if (!processedDate[date.getTime()]) {
                            processedDate[date.getTime()] = true;
                            if (hasPositions) {
                                dates.push(date);
                            } else if (date >= eventStart) {
                                counter++;
                                if (date >= startDate) {
                                    if ((endDate && date > endDate) || (fn.call(scope, date, counter) === false) || (count && counter >= count))  {
                                        break top;
                                    }
                                    
                                }
                            }
                        }
                    }
                }
            }
            if (hasPositions && dates.length) {
                me.forEachDateAtPositions(dates, positions, function(date) {
                    if (date >= eventStart) {
                        counter++;
                        // Ignore dates outside of the [startDate, endDate] range
                        if (date >= startDate && (!endDate || date <= endDate)) {
                            // return false if it's time to stop recurring
                            if (fn.call(scope, date, counter) === false || (count && counter >= count))  {
                                return false;
                            }
                            
                        }
                    }
                });
            }
            // get next month start
            yearStartDate = D.getNext(yearStartDate, D.YEAR, interval);
            yearEndDate = new Date(D.getNext(yearStartDate, D.YEAR, 1) - 1);
        }
    }
});

/**
 * This mixin class provides recurring events functionality to the {@link Sch.data.EventStore event store}.
 */
Ext.define('Sch.data.mixin.RecurringEvents', {
    extend: 'Ext.Mixin',
    requires: [
        'Sch.model.Recurrence',
        'Sch.data.util.DelayedCalls',
        'Sch.data.util.recurrence.DailyIterator',
        'Sch.data.util.recurrence.WeeklyIterator',
        'Sch.data.util.recurrence.MonthlyIterator',
        'Sch.data.util.recurrence.YearlyIterator'
    ],
    /**
     * Indicates the store supports recurring events.
     * @property {Boolean}
     */
    isRecurringEventStore: true,
    /**
     * Timeout in milliseconds during which to collect calls for generating occurrences related methods.
     * @type {Number}
     */
    delayedCallTimeout: 100,
    setupRecurringEvents: function() {
        this.recurrenceIterators = this.recurrenceIterators || [];
        this.addRecurrenceIterators(Sch.data.util.recurrence.DailyIterator, Sch.data.util.recurrence.WeeklyIterator, Sch.data.util.recurrence.MonthlyIterator, Sch.data.util.recurrence.YearlyIterator);
        this.relayEvents(Sch.data.util.DelayedCalls, [
            'delayed-regenerate-occurrences-start',
            'delayed-regenerate-occurrences-end',
            'delayed-generate-occurrences-start',
            'delayed-generate-occurrences-end'
        ]);
        this.mon(Sch.data.util.DelayedCalls, {
            'delayed-regenerate-occurrences-end': this.onDelayedRegenerateOccurrencesEnd,
            'delayed-generate-occurrences-end': this.onDelayedGenerateOccurrencesEnd,
            scope: this
        });
        this.on('destroy', this.onEventStoreDestroy, this);
    },
    onEventStoreDestroy: function() {
        Sch.data.util.DelayedCalls.cancel('generate-occurrences', 'regenerate-occurrences');
    },
    addRecurrenceIterators: function() {
        for (var i = 0; i < arguments.length; i++) {
            this.recurrenceIterators[arguments[i].frequency] = arguments[i];
        }
    },
    getRecurrenceIteratorForEvent: function(event) {
        return this.recurrenceIterators[event.getRecurrence().getFrequency()];
    },
    /**
     * @private
     * Builds the provided repeating event occurrences for the provided timespan.
     */
    buildOccurrencesForEvent: function(event, startDate, endDate, skipExisting) {
        var occurrences = [];
        // is recurring
        if (event.isRecurring() && event.getStartDate()) {
            var me = this,
                recurrence = event.getRecurrence(),
                iterator = me.getRecurrenceIteratorForEvent(event);
            Ext.Assert && Ext.Assert.truthy(iterator, "Can't find iterator for " + recurrence.getFrequency() + " frequency");
            var duration = event.getEndDate() - event.getStartDate();
            var exceptionDates = event.getExceptionDates() ? Ext.Array.toMap(event.getExceptionDates(), function(date) {
                    return date - 0;
                }) : {};
            iterator.forEachDate({
                recurrence: recurrence,
                startDate: startDate,
                endDate: endDate,
                fn: function(date) {
                    // when it's told we don't generate occurrences if we already have ones on the calculated dates
                    if (!exceptionDates[date - 0] && (!skipExisting || !event.getOccurrenceByStartDate(date))) {
                        occurrences.push(event.buildOccurrence(date, duration));
                    }
                }
            });
        }
        return occurrences;
    },
    mergeDelayedCallEntries: function(delayedCall) {
        var entries = delayedCall.entries,
            byEventId = {},
            startDate, endDate, events, event, args;
        // first get the largest range for each requested event
        for (var i = 0; i < entries.length; i++) {
            args = entries[i];
            events = args[0];
            startDate = args[1];
            endDate = args[2];
            // Go over the events and merge this call and other ones arguments
            // so start date will be the minimal start date requested
            // and the end date the maximal end date requested
            // TODO: need to handle cases when ranges don't intersect
            for (var j = 0; j < events.length; j++) {
                event = events[j];
                var savedArgs = byEventId[event.getId()];
                if (savedArgs) {
                    if (savedArgs[1] > startDate)  {
                        savedArgs[1] = startDate;
                    }
                    
                    if (savedArgs[2] < endDate)  {
                        savedArgs[2] = endDate;
                    }
                    
                } else {
                    byEventId[event.getId()] = [
                        [
                            event
                        ]
                    ].concat(args.slice(1));
                }
            }
        }
        // ranges are grouped by event id
        entries = Ext.Object.getValues(byEventId);
        // let's try to combine calls having the same ranges
        var combinedEntries = {};
        for (i = 0; i < entries.length; i++) {
            args = entries[i];
            event = args[0];
            startDate = args[1];
            endDate = args[2];
            var key = (startDate ? startDate.getTime() : '') + '-' + (endDate ? endDate.getTime() : '');
            // if this range met already
            if (combinedEntries[key]) {
                // add event to the first argument
                combinedEntries[key][0] = combinedEntries[key][0].concat(event);
            } else // if this range isn't met yet
            // remember we met it using that call arguments
            {
                combinedEntries[key] = args;
            }
        }
        // use combined entries
        delayedCall.entries = Ext.Object.getValues(combinedEntries);
    },
    /**
     * @private
     * Schedules regenerating (removing and building back) the occurrences of the provided recurring events in the provided time interval.
     * The method waits for {@link #delayedCallTimeout} milliseconds timeout during which it collects repeating calls.
     * Every further call restarts the timeout. After the timeout the method processes the collected calls trying to merge startDate/endDate ranges
     * to reduce the number of calls and then invokes {@link #generateOccurrencesForEvents} method and removes the previous occurrences.
     * @param  {Sch.model.Event[]} events                   Events to build occurrences for.
     * @param  {Date}              startDate                Time interval start.
     * @param  {Date}              endDate                  Time interval end.
     * @param  {Boolean}           [preserveExisting=false] `True` to not not generate occurrences if there are already existing ones on the calculated dates.
     */
    regenerateOccurrencesForEventsBuffered: function(events, startDate, endDate) {
        var me = this;
        if (!Ext.isIterable(events)) {
            events = [
                events
            ];
        }
        events = Ext.Array.filter(events, function(event) {
            return event.isRecurring();
        });
        if (events.length) {
            var delayedCall = Sch.data.util.DelayedCalls.schedule({
                    id: 'regenerate-occurrences',
                    timeout: me.delayedCallTimeout,
                    beforeFn: me.mergeDelayedCallEntries,
                    fn: function(events, startDate, endDate) {
                        // Collect old occurrences we'll remove them later by using a single store.remove() call
                        var toRemove = delayedCall.occurrencesToRemove = delayedCall.occurrencesToRemove || [];
                        toRemove.push.apply(toRemove, me.getOccurrencesForEvents(events));
                        // add new occurrences
                        me.generateOccurrencesForEvents(events, startDate, endDate, false);
                    },
                    args: [
                        events,
                        startDate,
                        endDate
                    ],
                    afterFn: function(delayedCall) {
                        // remove previous occurrences (if we have any)
                        delayedCall.occurrencesToRemove.length && me.remove(delayedCall.occurrencesToRemove);
                    },
                    scope: me
                });
        }
    },
    /**
     * @private
     * Schedules generating the occurrences of the provided recurring events in the provided time interval.
     * The method waits for {@link #delayedCallTimeout} milliseconds timeout during which it collects repeating calls.
     * Every further call restarts the timeout. After the timeout the method processes the collected calls trying to merge startDate/endDate ranges
     * to reduce the number of calls and then invokes {@link #generateOccurrencesForEvents} method.
     * @param  {Sch.model.Event[]} events                   Events to build occurrences for.
     * @param  {Date}              startDate                Time interval start.
     * @param  {Date}              endDate                  Time interval end.
     * @param  {Boolean}           [preserveExisting=true]  `False` to generate occurrences even if there is already an existing one on a calculated date.
     */
    generateOccurrencesForEventsBuffered: function(events, startDate, endDate, preserveExisting) {
        var me = this;
        preserveExisting = preserveExisting !== false;
        if (!Ext.isIterable(events)) {
            events = [
                events
            ];
        }
        events = Ext.Array.filter(events, function(event) {
            return event.isRecurring();
        });
        if (events.length) {
            Sch.data.util.DelayedCalls.schedule({
                id: 'generate-occurrences',
                timeout: me.delayedCallTimeout,
                beforeFn: me.mergeDelayedCallEntries,
                fn: me.generateOccurrencesForEvents,
                args: [
                    events,
                    startDate,
                    endDate,
                    preserveExisting
                ],
                scope: me
            });
        }
    },
    /**
     * @private
     * Generates occurrences of the provided recurring events in the provided time interval.
     * @param  {Sch.model.Event[]} events                   Events to build occurrences for.
     * @param  {Date}              startDate                Time interval start.
     * @param  {Date}              endDate                  Time interval end.
     * @param  {Boolean}           [preserveExisting=true] `False` to generate occurrences even if there is already an existing one on a calculated date.
     */
    generateOccurrencesForEvents: function(events, startDate, endDate, preserveExisting) {
        if (events) {
            var me = this,
                occurrences = [],
                allOccurrences = [];
            preserveExisting = preserveExisting !== false;
            if (!Ext.isIterable(events))  {
                events = [
                    events
                ];
            }
            
            if (events.length) {
                me.fireEvent('generate-occurrences-start', me, events, startDate, endDate, preserveExisting);
                for (var i = 0; i < events.length; i++) {
                    var event = events[i],
                        firstOccurrenceStartDate, firstOccurrence, eventStartDate;
                    if ((occurrences = me.buildOccurrencesForEvent(event, startDate, endDate, preserveExisting))) {
                        eventStartDate = event.getStartDate();
                        // If requested timespan starts before or matches the event starts
                        // we treat the first built occurrence as the event itself
                        // and if the occurrence start doesn't match the event start
                        // we move the event accordingly
                        if (startDate <= eventStartDate) {
                            // get 1st occurrence
                            if ((firstOccurrence = occurrences.shift())) {
                                firstOccurrenceStartDate = firstOccurrence.getStartDate();
                                // compare its start date with the event one and shift the event if needed
                                if (firstOccurrenceStartDate - eventStartDate) {
                                    event.setStartEndDate(firstOccurrenceStartDate, firstOccurrence.getEndDate());
                                    // Since we've changed the event start date the recurrence "Days"/"MonthDays"/"Months"
                                    // might get redundant in case the event start date matches the fields values
                                    // Calling recurrence sanitize() will clean the fields in this case.
                                    event.getRecurrence().sanitize();
                                }
                            }
                        }
                        allOccurrences.push.apply(allOccurrences, occurrences);
                    }
                }
                if (allOccurrences.length) {
                    me.add(allOccurrences);
                }
                me.fireEvent('generate-occurrences-end', me, events, allOccurrences, startDate, endDate, preserveExisting);
            }
        }
    },
    /**
     * @private
     * Generates occurrences for all the existing recurring events in the provided time interval.
     * @param  {Date}    startDate                Time interval start.
     * @param  {Date}    endDate                  Time interval end.
     * @param  {Boolean} [preserveExisting=false] `True` to not not generate occurrences if there are already existing ones on the calculated dates.
     */
    generateOccurrencesForAll: function(startDate, endDate, preserveExisting) {
        var me = this,
            events;
        if ((events = me.getRecurringEvents()) && events.length) {
            me.fireEvent('generate-occurrences-all-start', me, events, startDate, endDate, preserveExisting);
            me.generateOccurrencesForEvents(events, startDate, endDate, preserveExisting);
            me.fireEvent('generate-occurrences-all-end', me, events, startDate, endDate, preserveExisting);
        }
    },
    /**
     * Returns all the recurring events.
     * @return {Sch.model.Event[]} Array of recurring events.
     */
    getRecurringEvents: function() {
        var me = this;
        return me.queryBy(function(event) {
            return event.isRecurrableEvent && event.isRecurring();
        }).getRange();
    },
    /**
     * Returns occurrences of the provided recurring events.
     * @param  {Sch.model.Event/Sch.model.Event[]} events Recurring events which occurrences should be retrieved.
     * @return {Sch.model.Event[]} Array of the events occurrences.
     */
    getOccurrencesForEvents: function(events) {
        var result = [];
        if (!Ext.isIterable(events))  {
            events = [
                events
            ];
        }
        
        if (events.length) {
            for (var i = 0; i < events.length; i++) {
                var eventId = events[i].getId();
                // TODO: cache
                result.push.apply(result, this.queryBy(function(event) {
                    return event.isRecurrableEvent && event.getRecurringEventId() == eventId;
                }).getRange());
            }
        }
        return result;
    },
    /**
     * Returns occurrences of all the existing recurring events.
     * @return {Sch.model.Event[]} Array of the occurrences.
     */
    getOccurrencesForAll: function() {
        return this.queryBy(function(event) {
            return event.isRecurrableEvent && event.isOccurrence();
        }).getRange();
    },
    /**
     * Removes occurrences of the provided recurring events.
     * @param  {Sch.model.Event/Sch.model.Event[]} events Recurring events which occurrences should be removed.
     */
    removeOccurrencesForEvents: function(events) {
        return this.remove(this.getOccurrencesForEvents(events));
    },
    /**
     * Removes occurrences of all the existing recurring events.
     */
    removeOccurrencesForAll: function() {
        return this.remove(this.getOccurrencesForAll());
    },
    onDelayedRegenerateOccurrencesEnd: function() {
        /**
         * @event occurrencesready
         * Fires when repeating events occurrences building is done. This happens on:
         *
         * - after panel got rendered;
         * - on event store load/add/update/remove events;
         * - on visible timespan change.
         * @param {Sch.data.EventStore} eventStore Event store.
         */
        this.fireEvent('occurrencesready', this);
    },
    onDelayedGenerateOccurrencesEnd: function() {
        this.fireEvent('occurrencesready', this);
    }
});

// When converting date from ISO string Ext.Date.parse adds extra hour, so use native JS parsing instead
// https://app.assembla.com/spaces/bryntum/tickets/9623
// Test in tests/datalayer/024_event_dst_switch_parse_iso_string.t.js
Ext.define('Sch.patches.DateFieldConvertDate', {
    extend: 'Sch.util.Patch',
    target: 'Ext.data.field.Date',
    minVersion: '7.0.0',
    maxVersion: '8.0.0',
    overrides: {
        // Override private implementation of convert function
        convert: function(v) {
            if (!v) {
                return null;
            }
            // instanceof check ~10 times faster than Ext.isDate. Values here will not be
            // cross-document objects
            if (v instanceof Date) {
                return v;
            }
            /* eslint-disable-next-line vars-on-top */
            var dateFormat = this.dateReadFormat || this.dateFormat,
                parsed;
            if (dateFormat) {
                //region OVERRIDE
                // Use native JS parsing in case of zero UTC string (for example '2021-03-28T01:00:00.000Z')
                // when format is one of the following:
                // - c         ISO 8601 date represented as the local time with an offset to UTC appended.
                // - C         An ISO date string as implemented by the native Date.toISOString method
                if ((dateFormat === 'c' || dateFormat === 'C') && /Z$/.test(v)) {
                    var result = new Date(v);
                    // Check if the result is not an Invalid Date object
                    return !isNaN(result.getTime()) ? result : null;
                }
                //endregion
                return Ext.Date.parse(v, dateFormat, this.useStrict);
            }
            parsed = Date.parse(v);
            return parsed ? new Date(parsed) : null;
        }
    }
});

/**
 @class Sch.model.Range

 This class represent a simple date range. It is being used in various subclasses and plugins which operate on date ranges.

 Its a subclass of the {@link Sch.model.Customizable}, which is in turn subclass of {@link Ext.data.Model}.
 Please refer to documentation of those classes to become familar with the base interface of this class.

 The name of any field can be customized in the subclass. Please refer to {@link Sch.model.Customizable} for details.
 */
Ext.define('Sch.model.Range', {
    extend: 'Sch.model.Customizable',
    requires: [
        'Sch.util.Date',
        'Sch.patches.DateFieldConvertDate'
    ],
    idProperty: 'Id',
    isRangeModel: true,
    /**
     * @cfg {String} startDateField The name of the field that defines the range start date. Defaults to "StartDate".
     */
    startDateField: 'StartDate',
    /**
     * @cfg {String} endDateField The name of the field that defines the range end date. Defaults to "EndDate".
     */
    endDateField: 'EndDate',
    /**
     * @cfg {String} nameField The name of the field that defines the range name. Defaults to "Name".
     */
    nameField: 'Name',
    /**
     * @cfg {String} clsField The name of the field that holds the range "class" value (usually corresponds to a CSS class). Defaults to "Cls".
     */
    clsField: 'Cls',
    customizableFields: [
        /**
         * @field Id
         * A unique identifier of the range
         */
        /**
         * @method getStartDate
         *
         * Returns the range start date
         *
         * @return {Date} The start date
         */
        /**
         * @field
         * The start date of the range in the ISO 8601 format. See {@link Ext.Date} for a formats definitions.
         */
        {
            name: 'StartDate',
            type: 'date',
            dateFormat: 'c'
        },
        /**
         * @method getEndDate
         *
         * Returns the range end date
         *
         * @return {Date} The end date
         */
        /**
         * @field
         * The end date of the range in the ISO 8601 format. See {@link Ext.Date} for a formats definitions.
         */
        {
            name: 'EndDate',
            type: 'date',
            dateFormat: 'c'
        },
        /**
         * @method getCls
         *
         * Gets the "class" of the range
         *
         * @return {String} cls The "class" of the range
         */
        /**
         * @method setCls
         *
         * Sets the "class" of the range
         *
         * @param {String} cls The new class of the range
         */
        /**
         * @field
         * An optional CSS class to be associated with the range.
         */
        {
            name: 'Cls',
            type: 'string'
        },
        /**
         * @method getName
         *
         * Gets the name of the range
         *
         * @return {String} name The "name" of the range
         */
        /**
         * @method setName
         *
         * Sets the "name" of the range
         *
         * @param {String} name The new name of the range
         */
        /**
         * @field
         * An optional name of the range
         */
        {
            name: 'Name',
            type: 'string'
        }
    ],
    /**
     * @method setStartDate
     *
     * Sets the range start date
     *
     * @param {Date} date The new start date
     * @param {Boolean} keepDuration Pass `true` to keep the duration of the task ("move" the event), `false` to change the duration ("resize" the event).
     * Defaults to `false`
     */
    setStartDate: function(date, keepDuration) {
        var endDate = this.getEndDate();
        var oldStart = this.getStartDate();
        this.beginEdit();
        this.set(this.startDateField, date);
        if (keepDuration === true && endDate && oldStart) {
            this.setEndDate(Sch.util.Date.add(date, Sch.util.Date.MILLI, endDate - oldStart));
        }
        this.endEdit();
    },
    /**
     * @method setEndDate
     *
     * Sets the range end date
     *
     * @param {Date} date The new end date
     * @param {Boolean} keepDuration Pass `true` to keep the duration of the task ("move" the event), `false` to change the duration ("resize" the event).
     * Defaults to `false`
     */
    setEndDate: function(date, keepDuration) {
        var startDate = this.getStartDate();
        var oldEnd = this.getEndDate();
        this.beginEdit();
        this.set(this.endDateField, date);
        if (keepDuration === true && startDate && oldEnd) {
            this.setStartDate(Sch.util.Date.add(date, Sch.util.Date.MILLI, -(oldEnd - startDate)));
        }
        this.endEdit();
    },
    /**
     * Sets the event start and end dates
     *
     * @param {Date} start The new start date
     * @param {Date} end The new end date
     */
    setStartEndDate: function(start, end) {
        this.beginEdit();
        this.set(this.startDateField, start);
        this.set(this.endDateField, end);
        this.endEdit();
    },
    /**
     * Returns an array of all dates between start and end for this range.
     * @return {Date[]}
     */
    getDates: function() {
        var dates = [],
            endDate = this.getEndDate();
        if (this.isScheduled()) {
            var startFloored = Ext.Date.clearTime(this.getStartDate(), true);
            // Zero duration range
            if (endDate - this.getStartDate() === 0) {
                dates.push(startFloored);
            } else {
                for (var date = startFloored; date < endDate; date = Sch.util.Date.add(date, Sch.util.Date.DAY, 1)) {
                    dates.push(date);
                }
            }
        }
        return dates;
    },
    /**
     * Iterates over the results from {@link #getDates}
     * @param {Function} func The function to call for each date
     * @param {Object} scope The scope to use for the function call
     */
    forEachDate: function(func, scope) {
        return Ext.Array.each(this.getDates(), func, scope);
    },
    /**
     * Checks if the range record has both start and end dates set and start <= end
     *
     * @return {Boolean}
     */
    isScheduled: function() {
        var me = this;
        return Boolean(me.getStartDate() && me.getEndDate() && me.areDatesValid());
    },
    // Simple check if end date is greater than start date
    isValid: function() {
        var me = this,
            result = me.callParent(),
            start, end;
        if (result) {
            start = me.getStartDate() , end = me.getEndDate();
            result = !start || !end || (end - start >= 0);
        }
        return result;
    },
    // Simple check if just end date is greater than start date
    areDatesValid: function() {
        var me = this,
            start = me.getStartDate(),
            end = me.getEndDate();
        return !start || !end || (end - start >= 0);
    },
    /**
     * Shift the dates for the date range by the passed amount and unit
     * @param {String} unit The unit to shift by (e.g. range.shift(Sch.util.Date.DAY, 2); ) to bump the range 2 days forward
     * @param {Number} amount The amount to shift
     */
    shift: function(unit, amount) {
        this.setStartEndDate(Sch.util.Date.add(this.getStartDate(), unit, amount), Sch.util.Date.add(this.getEndDate(), unit, amount));
    },
    fullCopy: function() {
        return this.copy.apply(this, arguments);
    },
    intersectsRange: function(start, end) {
        var myStart = this.getStartDate();
        var myEnd = this.getEndDate();
        return myStart && myEnd && Sch.util.Date.intersectSpans(myStart, myEnd, start, end);
    }
});

/**
 * This mixin class provides recurring events related fields and methods to the {@link Sch.model.Event event model}.
 *
 * The mixin introduces two types of events: __recurring event__ and its __occurrences__.
 * __Recurring event__ is an event having {@link #RecurrenceRule recurrence rule} specified and its __occurrences__ are "fake" dynamically generated events.
 * The occurrences are not persistable (the mixin overrides {@link Sch.model.Event#isPersistable isPersistable} method to take that into account).
 * Their set depends on the scheduler visible timespan and changes upon the timespan change.
 *
 * There are few methods allowing to distinguish a recurring event and an occurrence: {@link #isRecurring}, {@link #isOccurrence}
 * and {@link #getRecurringEvent} (returns the event this record is an occurrence of).
 *
 * The {@link #RecurrenceRule recurrence rule} defined for the event is parsed and
 * represented with {@link Sch.model.Recurrence} class (can be changed with {@link #recurrenceModel} config) instance.
 * See: {@link #getRecurrence}, {@link #setRecurrence} methods.
 */
Ext.define('Sch.model.mixin.RecurrableEvent', {
    extend: 'Ext.Mixin',
    requires: [
        'Sch.model.Recurrence'
    ],
    /**
     * Indicates the model supports event recurrence.
     * @property {Boolean}
     */
    isRecurrableEvent: true,
    /**
     * @cfg {String}
     * {@link #RecurringEvent} field mapping.
     */
    recurringEventIdField: 'RecurringEventId',
    /**
     * @cfg {String}
     * {@link #RecurrenceRule} field mapping.
     */
    recurrenceRuleField: 'RecurrenceRule',
    /**
     * @cfg {String}
     * {@link #ExceptionDates} field mapping.
     */
    exceptionDatesField: 'ExceptionDates',
    customizableFields: [
        /**
         * @field
         * Identifier of the "main" event this model is an occurrence of.
         * **Applicable to occurrences only.**
         */
        {
            name: 'RecurringEventId'
        },
        /**
         * @field
         * The event recurrence rule. A string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format ("RRULE" expression).
         */
        {
            name: 'RecurrenceRule',
            allowNull: true,
            convert: function(value, record) {
                // undefined, null and zero-length string will be converted to null
                if (Ext.isEmpty(value)) {
                    value = null;
                }
                return value;
            }
        },
        /**
         * @field
         * @type {Date[]}
         * The event exception dates. The dates that must be skipped when generating occurrences for a repeating event.
         * This is used to modify only individual occurrences of the event so the further regenerations
         * won't create another copy of this occurrence again.
         * Use {@link #addExceptionDate} method to add an individual entry to the dates array:
         *
         * ```javascript
         * // let the main event know that this date should be skipped when regenerating the occurrences
         * occurrence.getRecurringEvent().addExceptionDate( occurrence.getStartDate() );
         *
         * // cut the main event cord
         * occurrence.setRecurringEventId(null);
         *
         * // now the occurrence is an individual event that can be changed & persisted freely
         * occurrence.setName("I am detached!");
         * occurrence.setStartEndDate(new Date(2018, 6, 2), new Date(2018, 6, 3));
         * ```
         * **Note:** The dates in this field get automatically removed when the event changes its {@link #StartDate start date}.
         */
        {
            name: 'ExceptionDates',
            dateFormat: 'c',
            convert: function(value, record) {
                if (value) {
                    var dateFormat = this.dateFormat,
                        useStrict = this.useStrict;
                    value = Ext.isString(value) ? value.split(',') : value;
                    value = Ext.Array.map(value, function(item) {
                        if (!Ext.isDate(item)) {
                            item = Ext.Date.parse(item, dateFormat, useStrict);
                        }
                        return item;
                    });
                }
                return value;
            }
        }
    ],
    /**
     * Name of the class representing the recurrence model.
     * @cfg {String}
     */
    recurrenceModel: 'Sch.model.Recurrence',
    /**
     * Sets a recurrence for the event with a given frequency, interval, and end.
     * @param {String/Object/Sch.model.Recurrence} frequency The frequency of the recurrence, configuration object or the recurrence model. The frequency can be `DAILY`, `WEEKLY`, `MONTHLY`, or `YEARLY`.
     * ```javascript
     * // let repeat the event every other week till Jan 2 2019
     * event.setRecurrence("WEEKLY", 2, new Date(2019, 0, 2));
     * ```
     * Also a {@link Sch.model.Recurrence recurrence model} can be provided as the only argument for this method:
     *
     * ```javascript
     * var recurrence = new Sch.model.Recurrence({ Frequency : 'DAILY', Interval : 5 });
     *
     * event.setRecurrence(recurrence);
     * ```
     * @param {Integer} [interval] The interval between occurrences (instances of this recurrence). For example, a daily recurrence with an interval of 2 occurs every other day. Must be greater than 0.
     * @param {Integer/Date} [recurrenceEnd] The end of the recurrence. The value can be specified by a date or by a maximum count of occurrences (has to greater than 1, since 1 means the event itself).
     */
    setRecurrence: function(frequency, interval, recurrenceEnd) {
        var me = this,
            previousRecurrence, recurrence, value;
        // If this is an occurrence - turn it into an event first
        if (me.isOccurrence()) {
            var recurringEvent = me.getRecurringEvent();
            previousRecurrence = recurringEvent && recurringEvent.getRecurrence();
            me.setRecurringEventId(null);
        }
        // if it's a recurring event we remove its current occurrences
        // me.removeOccurrences();
        if (frequency) {
            // if we set recurrence on an occurrence model
            // we stop previous main recurrence
            previousRecurrence && previousRecurrence.setEndDate(new Date(me.getStartDate() - 1));
            if (frequency.isRecurrenceModel) {
                recurrence = frequency;
            } else if (Ext.isObject(frequency)) {
                recurrence = new this.recurrenceModel(frequency);
            } else {
                recurrence = new this.recurrenceModel();
                recurrence.setFrequency(frequency);
                interval && recurrence.setInterval(interval);
                // if the recurrence is limited
                if (recurrenceEnd) {
                    if (recurrenceEnd instanceof Date) {
                        recurrence.setEndDate(recurrenceEnd);
                    } else {
                        recurrence.setCount(recurrenceEnd);
                    }
                }
            }
            recurrence.setEvent(me);
            value = recurrence.getRule();
        }
        me.recurrence = recurrence;
        me.set(me.recurrenceRuleField, value);
    },
    /**
     * Returns the event recurrence settings.
     * @return {Sch.model.Recurrence} The recurrence model.
     */
    getRecurrence: function() {
        var me = this,
            recurrenceRule = me.getRecurrenceRule();
        if (!me.recurrence && recurrenceRule) {
            me.recurrence = new me.recurrenceModel({
                rule: recurrenceRule,
                event: me
            });
        }
        return me.recurrence;
    },
    /**
     * Indicates if the event is recurring.
     * @return {Boolean} `True` if the event is recurring.
     */
    isRecurring: function() {
        return this.getRecurrence() && !this.isOccurrence();
    },
    /**
     * Indicates if the event is an occurrence of another recurring event.
     * @return {Boolean} `True` if the event is an occurrence.
     */
    isOccurrence: function() {
        return Boolean(this.getRecurringEventId());
    },
    /**
     * Returns the "main" event this model is an occurrence of. For non-occurrences returns `null`-value.
     * @return {Sch.model.Event} The recurring event of this occurrence.
     */
    getRecurringEvent: function() {
        var masterEventId = this.getRecurringEventId(),
            eventStore = this.getEventStore();
        return masterEventId && eventStore && eventStore.getModelById(masterEventId);
    },
    getOccurrenceByStartDate: function(startDate) {
        var result, occurrences;
        if (startDate) {
            occurrences = this.getOccurrences();
            for (var i = 0; i < occurrences.length; i++) {
                if (occurrences[i].getStartDate() - startDate === 0) {
                    result = occurrences[i];
                    break;
                }
            }
        }
        return result;
    },
    /**
     * Returns list of this recurring event occurrences.
     * @return {Sch.model.Event[]} Array of the occurrences.
     */
    getOccurrences: function() {
        var eventStore = this.getEventStore();
        return eventStore && eventStore.getOccurrencesForEvents(this);
    },
    /**
     * Removes this recurring event occurrences.
     */
    removeOccurrences: function() {
        var eventStore = this.getEventStore();
        return eventStore && eventStore.removeOccurrencesForEvents(this);
    },
    /**
     * @private
     * The method is triggered when the event recurrence gets changed.
     * It updates the {@link #RecurrenceRule} field in this case.
     */
    onRecurrenceChanged: function() {
        var recurrence = this.getRecurrence();
        this.setRecurrenceRule(recurrence && recurrence.getRule() || null);
    },
    /**
     * @protected
     * Builds this event occurrence by cloning the event data.
     * The method is used internally by the __recurring events__ feature.
     * Override it if you need to customize the generated occurrences.
     * @param  {Date}    startDate  The occurrence start date.
     * @param  {Integer} [duration] The event duration in milliseconds. The value is used to calculate the occurrence end date.
     *                              If omitted the value will be calculated based on the event start/end dates.
     * @return {Sch.model.Event}    The occurrence.
     */
    buildOccurrence: function(startDate, duration) {
        duration = duration || this.getEndDate() - this.getStartDate();
        var copy = this.copy(null);
        copy.beginEdit();
        copy.setStartEndDate(startDate, new Date(startDate.getTime() + duration));
        copy.setRecurringEventId(this.getId());
        copy.endEdit();
        return copy;
    },
    /**
     * Sets a {@link #RecurrenceRule recurrence rule} for the event.
     * Provide empty value to reset the event recurrence.
     * @param {String/null} rule The event recurrence rule (a string in [RFC-5545](https://tools.ietf.org/html/rfc5545#section-3.3.10) described format ("RRULE" expression))
     *                      or null to reset the event recurrence.
     */
    setRecurrenceRule: function(rule) {
        var me = this,
            recurrence;
        if (rule != me.getRecurrenceRule()) {
            if (rule) {
                recurrence = new me.recurrenceModel({
                    rule: rule,
                    event: me
                });
            }
            me.recurrence = recurrence;
            me.set(me.recurrenceRuleField, rule);
        }
    },
    /**
     * Adds an exception date that should be skipped when generating occurrences for the event.
     * The methods adds an entry to the array kept in {@link #ExceptionDates} field.
     * @param {Date} date Exception date.
     */
    addExceptionDate: function(date) {
        var me = this,
            dates = me.getExceptionDates() || [];
        if (date) {
            me.setExceptionDates(dates.concat(date));
        }
    },
    beforeStartDateChange: function() {
        this._startDateValue = this.getStartDate();
    },
    afterStartDateChange: function() {
        if (this._startDateValue - this.getStartDate() && this.getExceptionDates())  {
            this.setExceptionDates();
        }
        
    },
    mixinConfig: {
        before: {
            setStartDate: 'beforeStartDateChange',
            setStartEndDate: 'beforeStartDateChange'
        },
        after: {
            setStartDate: 'afterStartDateChange',
            setStartEndDate: 'afterStartDateChange'
        },
        // This function is called whenever a new "derivedClass" is created
        // that extends a "baseClass" in to which this mixin was mixed.
        extended: function(baseClass, derivedClass, classBody) {
            var recurrenceModel = classBody.recurrenceModel;
            // TODO: check this
            if (typeof recurrenceModel == 'string') {
                Ext.require(recurrenceModel, function() {
                    classBody.recurrenceModel = Ext.data.schema.Schema.lookupEntity(recurrenceModel);
                    Ext.override(derivedClass, {
                        recurrenceModel: Ext.data.schema.Schema.lookupEntity(recurrenceModel)
                    });
                });
            }
        }
    },
    onClassMixedIn: function(targetClass) {
        var recurrenceModel = targetClass.prototype.recurrenceModel || this.prototype.recurrenceModel;
        if (typeof recurrenceModel == 'string') {
            Ext.require(recurrenceModel, function() {
                Ext.override(targetClass, {
                    recurrenceModel: Ext.data.schema.Schema.lookupEntity(recurrenceModel)
                });
            });
        }
        Ext.override(targetClass, {
            // override "isPersistable" method to take into account event type: event/occurrence
            // occurrence are not persistable
            isPersistable: function() {
                var me = this;
                return me.callParent(arguments) && !me.isOccurrence();
            },
            set: function(fieldName, value) {
                // reset cached recurrence link if new recurrence rule is provided to the event
                if (typeof fieldName == 'string' ? fieldName == this.recurrenceRuleField : this.recurrenceRuleField in fieldName) {
                    this.recurrence = null;
                }
                return this.callParent(arguments);
            },
            // merge the mixin and target class "customizableFields" arrays
            customizableFields: (targetClass.prototype.customizableFields || []).concat(this.prototype.customizableFields)
        });
    }
});

/**
 * This class represent a single event in your schedule. Its a subclass of the {@link Sch.model.Range}, which is in turn subclass of {@link Sch.model.Customizable} and {@link Ext.data.Model}.
 * Please refer to documentation of those classes to become familiar with the base interface of the task.
 *
 * The Event model has a few predefined fields as seen below. If you want to add new fields or change the options for the existing fields,
 * you can do that by subclassing this class (see example below).
 *
 * ## Repeating events
 *
 * The Event model can be **recurring**. To make an event recurring the one should use {@link #setRecurrence} method or
 * specify a {@link #RecurrenceRule recurrence rule} for the event.
 * After doing this the scheduler will populate the event store with the event **occurrences**.
 * The occurrences are "fake" dynamically generated events. They are not persistable and their set depends on the visible timespan.
 *
 * There are few methods allowing to distinguish a recurring event or an occurrence: {@link #isRecurring}, {@link #isOccurrence}
 * and {@link #getRecurringEvent} (returns the event this record is an occurrence of).
 *
 * **Note:** There is a special {@link Sch.model.Recurrence} class representing an event recurrence settings.
 *
 * For more details see related methods: {@link #getRecurrence}, {@link #setRecurrence}, {@link #setRecurrenceRule}, {@link #isRecurring}, {@link #isOccurrence},
 * {@link #getOccurrences}, {@link #removeOccurrences}, {@link #getRecurringEvent}.
 *
 * ## Subclassing the Event model class
 *
 * ```javascript
 *     Ext.define('MyProject.model.Event', {
 *         extend      : 'Sch.model.Event',
 *
 *         fields      : [
 *             // adding new field
 *             { name: 'MyField', type : 'number', defaultValue : 0 }
 *         ],
 *
 *         myCheckMethod : function () {
 *             return this.get('MyField') > 0
 *         },
 *         ...
 *     });
 * ```
 *
 * If you want to use other names for the {@link #StartDate}, {@link #EndDate}, {@link #ResourceId} and {@link #Name} fields you can configure them as seen below:
 *
 * ```javascript
 *     Ext.define('MyProject.model.Event', {
 *         extend      : 'Sch.model.Event',
 *
 *         startDateField  : 'taskStart',
 *         endDateField    : 'taskEnd',
 *
 *         // just rename the fields
 *         resourceIdField : 'userId',
 *         nameField       : 'taskTitle',
 *
 *         fields      : [
 *             // completely change the definition of fields
 *             { name: 'taskStart', type: 'date', dateFormat : 'Y-m-d' },
 *             { name: 'taskEnd', type: 'date', dateFormat : 'Y-m-d' },
 *         ]
 *         ...
 *     });
 * ```
 *
 * Please refer to {@link Sch.model.Customizable} for additional details.
 *
 */
Ext.define('Sch.model.Event', {
    extend: 'Sch.model.Range',
    uses: [
        'Sch.util.Date'
    ],
    idProperty: 'Id',
    mixins: [
        'Sch.model.mixin.RecurrableEvent'
    ],
    isEventModel: true,
    customizableFields: [
        /**
         * @field Id
         * Unique identifier of task.
         */
        /**
         * @field Name
         * Name of the event (task title).
         */
        /**
         * @field StartDate
         * @type {Date}
         * Start date of the task in ISO 8601 format. See {@link Ext.Date} for other format definitions.
         */
        /**
         * @field EndDate
         * @type {Date}
         * End date of the task in ISO 8601 format. See {@link Ext.Date} for other format definitions.
         */
        /**
         * @field Cls
         * A field containing a CSS class to be added to the rendered event element.
         */
        /**
         * @field IconCls
         * A field containing a CSS class to be added as an icon to the event.
         */
        {
            name: 'IconCls'
        },
        /**
         * @field ResourceId
         * The id of the associated resource.
         */
        {
            name: 'ResourceId'
        },
        /**
         * @field Draggable
         * A field allowing you to easily control if an event can be dragged. (true or false)
         */
        {
            name: 'Draggable',
            type: 'boolean',
            persist: false,
            defaultValue: true
        },
        // true or false
        /**
         * @field Resizable
         * A field allowing you to easily control how an event can be resized. Possible values are:
         *
         * - true - resize of both event start and end is allowed,
         * - false - resize of both event start and end is forbidden,
         * - 'start' - event start resize is allowed
         * - 'end' - event end resize is allowed
         */
        {
            name: 'Resizable',
            persist: false,
            defaultValue: true
        },
        // true, false, 'start' or 'end'
        /**
         * @field AllDay
         *
         * A field marking event as all day(s) spanning event
         */
        {
            name: 'AllDay',
            defaultValue: false
        }
    ],
    /**
     * @cfg {String} resourceIdField The name of the field identifying the resource to which an event belongs.
     */
    resourceIdField: 'ResourceId',
    /**
     * @cfg {String} draggableField The name of the field specifying if the event should be draggable in the timeline
     */
    draggableField: 'Draggable',
    /**
     * @cfg {String} resizableField The name of the field specifying if/how the event should be resizable.
     */
    resizableField: 'Resizable',
    /**
     * @cfg {String}
     * {@link #AllDay} field mapping.
     */
    allDayField: 'AllDay',
    /**
     * @cfg {String} iconClsField The name of the field specifying the icon CSS class for an event.
     */
    iconClsField: 'IconCls',
    getInternalId: function() {
        return this.internalId;
    },
    /**
     * @property isHighlighted Set to true to highligh event on render
     * @private
     */
    isHighlighted: false,
    /**
     * Returns an event store this event is part of. Event must be part
     * of an event store to be able to retrieve event store.
     *
     * @return {Sch.data.EventStore}
     */
    getEventStore: function() {
        var me = this,
            result = me.joined && me.joined[0];
        if (result && !result.isEventStore) {
            // sort stores to avoid extra array walks in future
            Ext.Array.sort(me.joined, function(a, b) {
                return (a.isEventStore || false) > (b.isEventStore || false) && -1 || 1;
            });
            result = me.joined[0];
            // record can be joined to several stores none of which is an event store
            // e.g. if record is in viewmodel. test 025_eventstore
            result = result.isEventStore ? result : null;
        }
        return result;
    },
    /**
     * Returns a resource store this event uses as default resource store. Event must be part
     * of an event store to be able to retrieve default resource store.
     *
     * @return {Sch.data.ResourceStore}
     */
    getResourceStore: function() {
        var eventStore = this.getEventStore();
        return eventStore && eventStore.getResourceStore();
    },
    /**
     * Returns an assigment store this event uses as default assignment store. Event must be part
     * of an event store to be able to retrieve default assignment store.
     *
     * @return {Sch.data.AssignmentStore}
     */
    getAssignmentStore: function() {
        var eventStore = this.getEventStore();
        return eventStore && eventStore.getAssignmentStore();
    },
    /**
     * Returns all resources assigned to an event.
     *
     * @return {Sch.model.Resource[]}
     */
    getResources: function(eventStore) {
        var me = this;
        eventStore = eventStore || me.getEventStore();
        return eventStore && eventStore.getResourcesForEvent(me) || [];
    },
    /**
     * @private
     */
    forEachResource: function(fn, scope) {
        var rs = this.getResources();
        for (var i = 0; i < rs.length; i++) {
            if (fn.call(scope || this, rs[i]) === false) {
                return;
            }
        }
    },
    /**
     * Returns either the resource associated with this event (when called w/o `resourceId`) or resource
     * with specified id.
     *
     * @param {String} resourceId (optional)
     * @return {Sch.model.Resource}
     */
    getResource: function(resourceId) {
        var me = this,
            result = null,
            eventStore = me.getEventStore(),
            resourceStore = eventStore && eventStore.getResourceStore();
        // Allow 0 as a valid resource id
        resourceId = resourceId == null ? me.getResourceId() : resourceId;
        if (eventStore && (resourceId === null || resourceId === undefined)) {
            result = eventStore.getResourcesForEvent(me);
            if (result.length == 1) {
                result = result[0];
            } else if (result.length > 1) {
                Ext.Error.raise("Event::getResource() is not applicable for events with multiple assignments, please use Event::getResources() instead.");
            } else {
                result = null;
            }
        } else if (resourceStore) {
            result = resourceStore.getModelById(resourceId);
        }
        return result;
    },
    /**
     * Sets the resource which the event should belong to.
     *
     * @param {Sch.model.Resource/Mixed} resource The new resource
     */
    setResource: function(resource) {
        var me = this,
            eventStore = me.getEventStore();
        eventStore && eventStore.removeAssignmentsForEvent(me);
        me.assign(resource);
    },
    /**
     * Assigns this event to the specified resource.
     *
     * @param {Sch.model.Resource/Mixed/Array} resource A new resource for this event, either as a full Resource record or an id (or an array of such).
     */
    assign: function(resource) {
        var me = this,
            eventStore = me.getEventStore();
        if (resource && resource.isResourceModel) {
            resource = resource.getId();
        }
        if (eventStore) {
            eventStore.assignEventToResource(me, resource);
        } else {
            me.setResourceId(resource);
        }
    },
    /**
     * Unassigns this event from the specified resources.
     *
     * @param {Sch.model.Resource/Mixed/Array} [resource] The resource (or list of resource) to unassign from.
     */
    unassign: function(resource) {
        var me = this,
            eventStore = me.getEventStore();
        if (resource && resource.isResourceModel) {
            resource = resource.getId();
        }
        if (eventStore) {
            eventStore.unassignEventFromResource(me, resource);
        } else if (me.getResourceId() == resource) {
            me.setResourceId(null);
        }
    },
    /**
     * Reassigns an event from an old resource to a new one.
     *
     * @param {Sch.model.Resource/Mixed} oldResource Old resource (or resource identifier) to unassign the event from.
     * @param {Sch.model.Resource/Mixed} newResource New resource (or resource identifier) to assign the event to.
     */
    reassign: function(oldResource, newResource) {
        var me = this,
            eventStore = me.getEventStore();
        if (oldResource && oldResource.isResourceModel) {
            oldResource = oldResource.getId();
        }
        if (newResource && newResource.isResourceModel) {
            newResource = newResource.getId();
        }
        if (eventStore) {
            eventStore.reassignEventFromResourceToResource(me, oldResource, newResource);
        } else {
            me.setResourceId(newResource);
        }
    },
    /**
     * @method isAssignedTo
     * Returns true if this event is assigned to a certain resource.
     *
     * @param {Sch.model.Resource/Mixed} resource The resource to query for
     * @return {Boolean}
     */
    isAssignedTo: function(resource) {
        var me = this,
            eventStore = me.getEventStore(),
            result = false;
        if (resource && resource.isResourceModel) {
            resource = resource.getId();
        }
        if (eventStore) {
            result = eventStore.isEventAssignedToResource(me, resource);
        } else {
            result = me.getResourceId() == resource;
        }
        return result;
    },
    /**
     * Returns all assignments for the event. Event must be part of the store for this method to work.
     *
     * @return {Sch.model.Assignment[]}
     */
    getAssignments: function() {
        var me = this,
            eventStore = me.getEventStore();
        return eventStore && eventStore.getAssignmentsForEvent(me);
    },
    /**
     * @method setDraggable
     *
     * Sets the new draggable state for the event
     * @param {Boolean} draggable true if this event should be draggable
     */
    /**
     * @method isDraggable
     *
     * Returns true if event can be drag and dropped
     * @return {Mixed} The draggable state for the event.
     */
    isDraggable: function() {
        return this.getDraggable();
    },
    /**
     * @method setResizable
     *
     * Sets the new resizable state for the event. You can specify true/false, or 'start'/'end' to only allow resizing one end of an event.
     * @param {Boolean} resizable true if this event should be resizable
     */
    /**
     * @method getResourceId
     *
     * Returns the resource id of the resource that the event belongs to.
     * @return {Mixed} The resource Id
     */
    /**
     * @method isResizable
     *
     * Returns true if event can be resized, but can additionally return 'start' or 'end' indicating how this event can be resized.
     * @return {Mixed} The resource Id
     */
    isResizable: function() {
        return this.getResizable();
    },
    /**
     * @method setResourceId
     *
     * Sets the new resource id of the resource that the event belongs to.
     * @param {Mixed} resourceId The resource Id
     */
    /**
     * Returns false if a linked resource is a phantom record, i.e. it's not persisted in the database.
     *
     * @return {Boolean} valid
     */
    isPersistable: function() {
        var me = this,
            eventStore = me.getEventStore();
        return eventStore && eventStore.isEventPersistable(me);
    },
    /**
     * Returns event start date. If event {@link #AllDay} flag is set then date time part will be cleared
     *
     * @return {Date}
     */
    getStartDate: function() {
        var dt = this.data[this.startDateField];
        if (this.getAllDay()) {
            dt = this.statics().getAllDayStartDate(dt);
        }
        return dt;
    },
    /**
     * Returns event end date. If event {@link #AllDay} flag is set then date time part will be cleared and
     * date will be adjusted to point to the beginning of the next day.
     *
     * @return {Date}
     */
    getEndDate: function() {
        var dt = this.data[this.endDateField];
        if (this.getAllDay()) {
            dt = this.statics().getAllDayEndDate(dt);
        }
        return dt;
    },
    inheritableStatics: {
        getAllDayStartDate: function(dt) {
            if (dt instanceof Sch.model.Event) {
                dt = dt.get(dt.startDateField);
            }
            if (dt) {
                dt = Sch.util.Date.clearTime(dt, true);
            }
            return dt;
        },
        getAllDayEndDate: function(dt) {
            if (dt instanceof Sch.model.Event) {
                dt = dt.get(dt.endDateField);
            }
            if (dt && (dt.getHours() > 0 || dt.getMinutes() > 0 || dt.getSeconds() > 0 || dt.getMilliseconds() > 0)) {
                dt = Sch.util.Date.getNext(dt, 'd', 1);
            }
            return dt;
        },
        getAllDayDisplayStartDate: function(dt) {
            if (dt instanceof Sch.model.Event) {
                dt = dt.get(dt.startDateField);
            }
            return Sch.util.Date.clearTime(dt, true);
        },
        getAllDayDisplayEndDate: function(startDate, endDate) {
            var event = startDate;
            if (startDate instanceof Sch.model.Event) {
                startDate = event.get(event.startDateField);
                endDate = event.get(event.endDateField);
            }
            startDate = Sch.model.Event.getAllDayDisplayStartDate(startDate);
            // If date falls on start of the day - subtract one day to show end date correctly
            // e.g. event starts on 2017-01-01 00:00 and ends on 2017-01-02 00:00, editor should show
            // 2017-01-01 for both start and end
            if (Sch.util.Date.clearTime(endDate, true).valueOf() === endDate.valueOf()) {
                endDate = Sch.util.Date.add(endDate, Sch.util.Date.DAY, -1);
            } else if (startDate.valueOf() !== endDate.valueOf()) {
                endDate = Sch.util.Date.clearTime(endDate, true);
            }
            return endDate;
        }
    }
});

/**
@class Sch.data.EventStore
@extends Ext.data.Store
@mixins Sch.data.mixin.EventStore
@mixins Sch.data.mixin.RecurringEvents

This is a class holding all the {@link Sch.model.Event events} to be rendered into a {@link Sch.SchedulerPanel scheduler panel}.
This class only accepts a model class inheriting from {@link Sch.model.Event}.
*/
Ext.define("Sch.data.EventStore", {
    extend: 'Ext.data.Store',
    alias: 'store.eventstore',
    mixins: [
        'Sch.data.mixin.UniversalModelGetter',
        'Sch.data.mixin.CacheHintHelper',
        'Sch.data.mixin.EventStore',
        'Robo.data.Store',
        'Sch.data.mixin.RecurringEvents'
    ],
    storeId: 'events',
    model: 'Sch.model.Event',
    config: {
        model: 'Sch.model.Event'
    },
    constructor: function(config) {
        var me = this;
        me.callParent([
            config
        ]);
        me.resourceStore && me.setResourceStore(me.resourceStore);
        me.assignmentStore && me.setAssignmentStore(me.assignmentStore);
        if (me.getModel() !== Sch.model.Event && !(me.getModel().prototype instanceof Sch.model.Event)) {
            throw 'The model for the EventStore must subclass Sch.model.Event';
        }
        me.setupRecurringEvents();
    },
    /**
     * Appends a new record to the store
     * @param {Sch.model.Event} record The record to append to the store
     */
    append: function(record) {
        this.add(record);
    }
});

/**
 * @class Kanban.model.Task
 *
 * A data model class describing a task in your Kanban board. You can assign it to a resource using the {@link #assign} method or by
 * setting the 'ResourceId' property directly in the data (using {@link #setResourceId} or {@link setResource}).
 *
 * You can of course also subclass this class like you would with any other Ext JS class and add your own custom fields.
 *
 * ```javascript
 *     Ext.define('MyTask', {
 *         extend : 'Kanban.model.Task',
 *
 *         fields : [
 *             { name : 'NbrComments', type : 'int' },
 *             { name : 'Attachments', type : 'int' }
 *         ],
 *
 *         // Define the states your tasks can be in
 *         states            : [
 *             'NotStarted',
 *             'InProgress',
 *             'Test',
 *             'Acceptance',
 *             'Done'
 *         ],
 *
 *         // Here you can control which state transitions are allowed
 *         isValidTransition : function (state) {
 *             return true;
 *         }
 *     })
 * ```
 */
Ext.define('Kanban.model.Task', {
    extend: 'Sch.model.Event',
    alias: 'model.kanban_taskmodel',
    resourceStore: null,
    /**
     * @cfg {String[]} states The names of the possible states that a task can be in. Default states are ["NotStarted", "InProgress", "Test", "Done"].
     */
    states: [
        'NotStarted',
        'InProgress',
        'Test',
        'Done'
    ],
    customizableFields: [
        /**
         * @field State
         * @type {String}
         * The state of the the task, should be one of the values listed in the {@link #states} array.
         */
        {
            name: 'State',
            defaultValue: 'NotStarted'
        },
        /**
         * @field Position
         * @type {Number}
         * The order/position of the tasks in each state column.
         */
        {
            name: 'Position',
            type: 'int'
        },
        /**
         * @field CreatedDate
         * @type {Date}
         * The date when the task was created.
         */
        {
            name: 'CreatedDate',
            type: 'date'
        },
        /**
         * @field ImageUrl
         * @type {String}
         * The url of an image to be shown in the task element
         */
        {
            name: 'ImageUrl'
        }
    ],
    constructor: function() {
        this.callParent(arguments);
        if (this.phantom && !this.getCreatedDate()) {
            this.setCreatedDate(new Date());
        }
    },
    /**
     * @cfg {String} stateField The name of the field that defines the task state. Defaults to "State".
     */
    stateField: 'State',
    /**
     * @cfg {String} imageUrlField The name of the field that defines the task image url. Defaults to "ImageUrl".
     */
    imageUrlField: 'ImageUrl',
    /**
     * @cfg {String} createdDateField The name of the field that defines the task state. Defaults to "CreatedDate".
     */
    createdDateField: 'CreatedDate',
    /**
     * @cfg {String} positionField The name of the field that defines the task order. Defaults to "Position".
     */
    positionField: 'Position',
    /**
     * @method getResource
     *
     * Returns the resource that is assigned to this task.
     * @return {Kanban.model.Resource} The resource
     */
    /**
     * @method setResource
     *
     * Assigns a new resource to this task.
     * @param {Kanban.model.Resource} resource The resource
     */
    /**
     * @method getPosition
     *
     * Returns the position of this task within it's current {@link Kanban.view.TaskView view}.
     * @return {Number} The position
     */
    /**
     * @method setPosition
     *
     * Sets the position of this task within it's current {@link Kanban.view.TaskView view}.
     * @param {Number} The position
     */
    /**
     * @method setResource
     *
     * Sets the new position of this task within it's current {@link Kanban.view.TaskView view}.
     * @param {Number} The new position
     */
    /**
     * @method getState
     *
     * Returns the state identifier of this task
     * @return {String} The state
     */
    /**
     * @method setState
     *
     * Sets the state identifier of this task
     * @param {String} The state
     */
    /**
     * @method getCreatedDate
     *
     * Returns the created date for this task
     * @return {Date} The created date
     */
    /**
     * @method setCreatedDate
     *
     * Sets the created date for this task
     * @param {Date} The created date
     */
    /**
     * @method getImageUrl
     *
     * Returns the image URL for this task
     * @return {String} The created date
     */
    /**
     * @method setImageUrl
     *
     * Sets the image URL for this task
     * @param {String} The created date
     */
    /**
     * Returns the associated user store of this task.
     *
     * @return {Kanban.data.ResourceStore} The user store
     */
    getResourceStore: function() {
        if (!this.resourceStore) {
            Ext.Array.each(this.joined, function(store) {
                if (store.resourceStore) {
                    this.resourceStore = store.resourceStore;
                    return false;
                }
            }, this);
        }
        return this.resourceStore;
    },
    /**
     * @method isValidTransition
     *
     * Override this method to define which states are valid based on the current task state. If you want to allow all,
     * simply create a method which always returns true.
     *
     * @param {String} toState The new state of this task
     * @return {Boolean} true if valid
     */
    isValidTransition: function(toState) {
        var currentState = this.getState();
        // Always allow reordering in same column
        if (currentState === toState)  {
            return true;
        }
        
        switch (this.getState()) {
            case "NotStarted":
                return toState == "InProgress";
            case "InProgress":
                return toState != "Done";
            case "Test":
                return toState != "NotStarted";
            case "Done":
                return toState == "Test" || toState == "InProgress";
            default:
                return true;
        }
    }
});

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
    extend: 'Sch.data.EventStore',
    model: 'Kanban.model.Task',
    proxy: undefined,
    alias: 'store.kanban_taskstore',
    resourceStore: null,
    setResourceStore: function(store) {
        this.resourceStore = Ext.data.StoreManager.lookup(store);
    },
    getResourceStore: function() {
        return this.resourceStore;
    },
    constructor: function() {
        this.callParent(arguments);
        var model = this.getModel();
        this.setSorters([
            {
                property: model.prototype.positionField,
                direction: 'ASC'
            },
            {
                property: model.prototype.nameField,
                direction: 'ASC'
            }
        ]);
    }
});

Ext.define('Kanban.data.mixin.StoreView', {
    state: null,
    masterStore: null,
    getStoreListeners: function() {
        return {
            add: this.onMasterAdd,
            clear: this.onMasterClear,
            remove: this.onMasterRemove,
            update: this.onMasterUpdate,
            refresh: this.onMasterDataChanged,
            scope: this
        };
    },
    unbindFromStore: function() {
        this.masterStore.un(this.getStoreListeners());
    },
    bindToStore: function(store) {
        var listeners = this.getStoreListeners();
        if (this.masterStore) {
            this.masterStore.un(listeners);
        }
        this.masterStore = store;
        if (store) {
            store.on(listeners);
            this.copyStoreContent();
        }
    },
    onMasterAdd: function(store, records) {
        for (var i = 0; i < records.length; i++) {
            if (records[i].getState() === this.state) {
                this.add(records[i]);
            }
        }
    },
    onMasterClear: function() {
        this.removeAll();
    },
    onMasterUpdate: function(store, record, operation, modifiedFieldNames) {
        if (modifiedFieldNames && Ext.Array.indexOf(modifiedFieldNames, store.model.prototype.stateField) >= 0) {
            // Insert into the new store
            if (this.state === record.getState()) {
                this.add(record);
            }
            // Remove from old state store
            if (this.state === record.previous[record.stateField]) {
                this.remove(record);
            }
        }
    },
    onMasterRemove: function(store, records) {
        Ext.Array.each(records, function(rec) {
            if (rec.getState() === this.state) {
                this.remove(rec);
            }
        }, this);
    },
    onMasterDataChanged: function(store) {
        this.copyStoreContent();
    },
    copyStoreContent: function() {
        var state = this.state;
        var data = [];
        this.masterStore.each(function(rec) {
            if (rec.getState() === state)  {
                data[data.length] = rec;
            }
            
        });
        this.suspendEvents();
        this.loadData(data);
        this.resumeEvents();
        this.sort(this.masterStore.getSorters().items);
        this.sorters.removeAll();
    }
});

// Private class
Ext.define('Kanban.data.ViewStore', {
    extend: 'Ext.data.Store',
    mixins: [
        'Kanban.data.mixin.StoreView'
    ],
    proxy: 'memory',
    masterStore: null,
    state: null,
    constructor: function(config) {
        Ext.apply(this, config);
        if (this.state === null || this.state === undefined) {
            throw 'Must supply state';
        }
        if (this.masterStore) {
            var master = this.masterStore = Ext.StoreMgr.lookup(this.masterStore);
            this.model = master.model;
        } else {
            throw 'Must supply a master store';
        }
        this.callParent(arguments);
        if (this.masterStore) {
            this.bindToStore(this.masterStore);
        }
    },
    getResourceStore: function() {
        return this.masterStore.getResourceStore();
    }
});

Ext.define('Kanban.dd.DragZone', {
    extend: 'Ext.dd.DragZone',
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: [
        // a missing require of Ext.dd.DragDrop:
        // http://www.sencha.com/forum/showthread.php?276603-4.2.1-Ext.dd.DragDrop-missing-Ext.util.Point-in-dependency-quot-requires-quot
        'Ext.util.Point'
    ],
    panel: null,
    repairHighlight: false,
    repairHighlightColor: 'transparent',
    containerScroll: false,
    // @OVERRIDE
    autoOffset: function(x, y) {
        this.setDelta(this.dragData.offsets[0], this.dragData.offsets[1]);
    },
    setVisibilityForSourceEvents: function(show) {
        Ext.each(this.dragData.taskEls, function(el) {
            el[show ? 'removeCls' : 'addCls']('sch-hidden');
        });
    },
    constructor: function(config) {
        this.mixins.observable.constructor.call(this, config);
        this.callParent(arguments);
        this.proxy.el.child('.x-dd-drag-ghost').removeCls('x-dd-drag-ghost');
        this.proxy.addCls('sch-task-dd');
    },
    getPlaceholderElements: function(sourceEl, dragData) {
        var taskEls = dragData.taskEls;
        var copy;
        var offsetX = dragData.offsets[0];
        var offsetY = dragData.offsets[1];
        var sourceHeight = sourceEl.getHeight();
        var ctEl = Ext.core.DomHelper.createDom({
                tag: 'div',
                cls: 'sch-dd-wrap-holder'
            });
        Ext.Array.each(taskEls, function(el, i) {
            copy = el.dom.cloneNode(true);
            copy.innerHTML = '';
            copy.id = Ext.id();
            copy.boundView = el.dom.boundView;
            var fly = Ext.fly(copy);
            fly.removeCls('sch-task-selected');
            fly.addCls('sch-task-placeholder');
            ctEl.appendChild(copy);
            // Adjust each element offset to the source event element
            Ext.fly(copy).setStyle({
                width: el.getWidth() + 'px',
                height: el.getHeight() + 'px'
            });
        });
        return ctEl;
    },
    getDragData: function(e) {
        var panel = this.panel,
            t = e.getTarget(panel.taskSelector);
        if (!t || panel.isReadOnly())  {
            return;
        }
        
        var task = panel.resolveRecordByNode(t);
        if (!task || task.isDraggable() === false || this.fireEvent('beforetaskdrag', this, task, e) === false) {
            return null;
        }
        e.preventDefault();
        var xy = e.getXY(),
            taskEl = Ext.get(t),
            taskXY = taskEl.getXY(),
            offsets = [
                xy[0] - taskXY[0],
                xy[1] - taskXY[1]
            ],
            view = Ext.getCmp(taskEl.up('.sch-taskview').id),
            eventRegion = taskEl.getRegion();
        if (!view.isSelected(t) && !e.ctrlKey) {
            // Fire this so the task board can clear the selection models of other views if needed
            this.fireEvent('taskdragstarting', this, task, e);
        }
        // relatedRecords now hold all dragging tasks
        var relatedRecords = this.getDraggingRecords(task),
            taskEls = [];
        // Collect additional elements to drag
        Ext.Array.forEach(relatedRecords, function(r) {
            var el = panel.getElementForTask(r);
            if (el)  {
                taskEls.push(el);
            }
            
        });
        var dragData = {
                view: view,
                sourceZoomLevel: view.up('panel').zoomLevel,
                offsets: offsets,
                repairXY: [
                    e.getX() - offsets[0],
                    e.getY() - offsets[1]
                ],
                taskEls: taskEls,
                bodyScroll: Ext.getBody().getScroll(),
                taskRecords: relatedRecords
            };
        // index of current task in view store
        var store = view.getStore();
        var dropBeforeTask = store.getAt(store.indexOf(task) + 1);
        if (dropBeforeTask) {
            dragData.dropOptions = {
                task: dropBeforeTask,
                type: 'before'
            };
        }
        dragData.ddel = this.getDragElement(taskEl, dragData);
        dragData.placeholder = this.getPlaceholderElements(taskEl, dragData);
        // To keep the look and size of the elements in the drag proxy
        this.proxy.el.set({
            size: this.panel.getZoomLevel()
        });
        return dragData;
    },
    onStartDrag: function(x, y) {
        var dd = this.dragData;
        // insert placeholder immediately
        Ext.fly(dd.placeholder).insertBefore(dd.taskEls[0]);
        Ext.Array.forEach(dd.taskEls, function(taskEl) {
            // we have to set this value because by default it will make component invisible,
            // but other components will not take it's place
            taskEl.addCls('sch-hidden');
        });
        this.fireEvent('taskdragstart', this, dd.taskRecords);
    },
    getDraggingRecords: function(sourceEventRecord) {
        // we want to sort records by their position in view
        // in order to forbid selection order to affect position
        var records = this.getRelatedRecords(sourceEventRecord);
        // we can select few records from one column and then start drag task from another column
        // if records are from same column, then we can just sort then by position
        var store = sourceEventRecord.store;
        if (records[0] && records[0].getState() == sourceEventRecord.getState()) {
            records = Ext.Array.sort([
                sourceEventRecord
            ].concat(records), this.positionSorter);
        } else {
            records = [
                sourceEventRecord
            ].concat(Ext.Array.sort(records, this.positionSorter));
        }
        return records;
    },
    positionSorter: function(a, b) {
        var store = a.store;
        return store.indexOf(a) > store.indexOf(b) ? 1 : -1;
    },
    /**
     * Returns all selected draggable records except the original one to drag them together with the original event.
     * Provide your custom implementation of this to allow additional event records to be dragged together with the original one.
     * @protected
     * @template
     * @param {Kanban.model.Event} eventRecord The eventRecord about to be dragged
     * @return {Kanban.model.Event[]} An array of event records to drag together with the original event
     */
    getRelatedRecords: function(eventRecord) {
        var panel = this.panel;
        var selected = panel.getSelectedRecords();
        var result = [];
        Ext.each(selected, function(rec) {
            if (rec.getId() !== eventRecord.getId() && rec.isDraggable() !== false) {
                result.push(rec);
            }
        });
        return result;
    },
    /**
     * This function should return a DOM node representing the markup to be dragged. By default it just returns the selected element(s) that are to be dragged.
     * @param {Ext.Element} sourceEl The event element that is the source drag element
     * @param {Object} dragData The drag drop context object
     * @return {HTMLElement} The DOM node to drag
     */
    getDragElement: function(sourceEl, dragData) {
        var taskEls = dragData.taskEls;
        var copy;
        var offsetX = dragData.offsets[0];
        var offsetY = dragData.offsets[1];
        var sourceHeight = this.panel.getElementForTask(dragData.taskRecords[0]).getHeight();
        if (taskEls.length > 1) {
            var ctEl = Ext.core.DomHelper.createDom({
                    tag: 'div',
                    cls: 'sch-dd-wrap',
                    style: {
                        overflow: 'visible'
                    }
                });
            Ext.Array.forEach(taskEls, function(el, i) {
                copy = el.dom.cloneNode(true);
                copy.id = '';
                copy.className += i === 0 ? ' sch-dd-source' : ' sch-dd-extra';
                var parent = el.up('[size]');
                var wrapper = Ext.core.DomHelper.createDom({
                        tag: 'div',
                        size: parent.getAttribute('size')
                    }).cloneNode(true);
                // without the extra cloneNode, IE fails (most likely due to a Sencha bug in DomHelper
                wrapper.appendChild(copy);
                ctEl.appendChild(wrapper);
                // Adjust each element offset to the source event element
                Ext.fly(copy).setStyle({
                    left: (i > 0 ? 10 : 0) + 'px',
                    top: (i === 0 ? 0 : (sourceHeight - 30 + i * 20)) + 'px',
                    width: el.getWidth() + 'px',
                    height: el.getHeight() + 'px',
                    position: "absolute"
                });
            });
            return ctEl;
        } else {
            copy = sourceEl.dom.cloneNode(true);
            copy.id = '';
            copy.style.width = sourceEl.getWidth() + 'px';
            copy.style.height = sourceEl.getHeight() + 'px';
            var parent = sourceEl.up('[size]');
            var wrapper = Ext.core.DomHelper.createDom({
                    tag: 'div',
                    size: parent.getAttribute('size')
                }).cloneNode(true);
            // without the extra cloneNode, IE fails (most likely due to a Sencha bug in DomHelper
            wrapper.appendChild(copy);
            return wrapper;
        }
    },
    getRepairXY: function(e, data) {
        return data.repairXY;
    },
    afterRepair: function() {
        this.dragging = false;
    },
    // HACK: Override for IE, if you drag the task bar outside the window or iframe it crashes (missing e.target)
    onInvalidDrop: function(target, e, id) {
        if (!e) {
            e = target;
            target = e.getTarget() || document.body;
        }
        var retVal = this.callParent([
                target,
                e,
                id
            ]);
        this.fireEvent('aftertaskdrop', this, this.dragData.taskRecords);
        if (this.dragData.placeholder) {
            Ext.fly(this.dragData.placeholder).remove();
        }
        this.setVisibilityForSourceEvents(true);
        return retVal;
    }
});

Ext.define('Kanban.dd.DropZone', {
    extend: 'Ext.dd.DropZone',
    mixins: {
        observable: 'Ext.util.Observable'
    },
    constructor: function(config) {
        this.callParent(arguments);
        this.mixins.observable.constructor.call(this, config);
    },
    panel: null,
    dragData: null,
    getTargetFromEvent: function(e) {
        return e.getTarget();
    },
    validatorFn: Ext.emptyFn,
    validatorFnScope: null,
    // list of available zoom levels
    zoomLevels: [
        'large',
        'medium',
        'small',
        'mini'
    ],
    // returns true if we should insert placeholder before node
    shouldDropBeforeNode: function(xy, taskUnderCursor, dd) {
        var taskBox = Ext.fly(taskUnderCursor).getBox();
        var proxyXY = dd.proxy.getXY();
        var middle;
        if (this.dropMode === 'vertical') {
            middle = (taskBox.bottom - taskBox.top) / 2;
            if (this.direction.up) {
                return proxyXY[1] - taskBox.top < middle;
            } else {
                var taskHeight = Ext.fly(dd.dragData.placeholder.children[0]).getHeight();
                return proxyXY[1] + taskHeight - taskBox.top < middle;
            }
        } else {
            middle = (taskBox.right - taskBox.left) / 2;
            // in case we drag task over column with smaller tasks
            // we cannot rely on drag proxy size and should use cursor coordinates
            // more robust check, taking only zoom level into attention
            if (Ext.Array.indexOf(this.zoomLevels, dd.dragData.currentZoomLevel) > Ext.Array.indexOf(this.zoomLevels, dd.dragData.sourceZoomLevel)) {
                if (xy[1] < taskBox.top) {
                    return true;
                } else if (xy[1] > taskBox.bottom) {
                    return false;
                }
                return xy[0] - taskBox.left < (taskBox.right - taskBox.left) / 2;
            } else {
                // if we moved mouse out of the row limited by taskbox.top and taskbox.bottom
                // it's enough to look at vertical position to find out drop position
                if (xy[1] < taskBox.top) {
                    return true;
                } else if (xy[1] > taskBox.bottom) {
                    return false;
                }
                if (this.direction.left) {
                    return (proxyXY[0] - taskBox.left < middle);
                } else {
                    var taskWidth = Ext.fly(dd.dragData.placeholder.children[0]).getWidth();
                    return (proxyXY[0] + taskWidth - taskBox.left < middle);
                }
            }
        }
    },
    getDropMode: function(view) {
        // we need to define drop behaviour (where placeholder should appear)
        var tempNode = Ext.DomQuery.select(view.getItemSelector() + ':not(.sch-hidden)', view.el.dom)[0];
        // if panel doesn't have any elements rendered mode doesn't matter
        if (!tempNode)  {
            return 'vertical';
        }
        
        // if rendered node takes less than half available width we can assume they form rows
        if (Ext.fly(tempNode).getWidth() * 2 < view.getWidth())  {
            return 'horizontal';
        }
        
        return 'vertical';
    },
    updatePlaceholderElements: function(taskEl, dragData) {
        var copy;
        // create wrap element
        var ctEl = Ext.core.DomHelper.createDom({
                tag: 'div',
                cls: 'sch-dd-wrap-holder'
            });
        // for each task record being dragged create proper placeholder
        for (var i = 0,
            l = dragData.taskRecords.length; i < l; i++) {
            copy = taskEl.cloneNode(true);
            copy.innerHTML = '';
            // boundView is required for some extjs stuff 4
            copy.boundView = taskEl.boundView;
            copy.id = Ext.id();
            var fly = Ext.fly(copy);
            fly.removeCls('sch-task-selected');
            fly.addCls('sch-task-placeholder');
            ctEl.appendChild(copy);
            // Adjust each element offset to the source event element
            Ext.fly(copy).setStyle({
                width: taskEl.offsetWidth + 'px',
                height: taskEl.offsetHeight + 'px'
            });
        }
        return ctEl;
    },
    getSmallestTask: function(view) {
        var nodes = Ext.DomQuery.select(view.getItemSelector() + ':not(.sch-hidden)', view.el.dom);
        var smallestTask = nodes[0];
        for (var i = 0; i < nodes.length; i++) {
            smallestTask = smallestTask.offsetHeight > nodes[i].offsetHeight ? nodes[i] : smallestTask;
        }
        return smallestTask;
    },
    getNodeByCoordinate: function(xy, bodyScroll) {
        return document.elementFromPoint(xy[0] - bodyScroll.left, xy[1] - bodyScroll.top);
    },
    getTargetView: function(xy, e, data) {
        var node = this.getNodeByCoordinate(xy, data.bodyScroll);
        if (node) {
            if (!node.className.match('sch-taskview')) {
                var parent = Ext.fly(node).up('.sch-taskview');
                if (parent) {
                    node = parent.dom;
                } else {
                    node = null;
                }
            }
            if (node) {
                return Ext.getCmp(node.id);
            }
        }
        return null;
    },
    // While over a target node, return the default drop allowed class which
    // places a "tick" icon into the drag proxy.
    onNodeOver: function(target, dd, e, data) {
        var xy = e.getXY();
        this.direction = {
            left: false,
            up: false
        };
        var prevXY = this.prevXY;
        if (prevXY) {
            if (prevXY[0] > xy[0]) {
                this.direction.left = true;
            } else {}
            if (prevXY[1] > xy[1]) {
                this.direction.up = true;
            }
        }
        this.prevXY = xy;
        var proxyDom = dd.proxy.el.dom;
        var allowed = false;
        proxyDom.style.display = 'none';
        // resolve target view from mouse coordinate
        var view = this.getTargetView(xy, e, data);
        proxyDom.style.display = 'block';
        if (!view) {
            return this.dropNotAllowed;
        }
        if (view) {
            allowed = data.taskRecords[0].isValidTransition(view.state);
            if (allowed) {
                // update placeholder to match other tasks in view
                // Template for placeholder. If there is no visible task, then no need to update placeholder
                if (view != data.view) {
                    var tplEl = this.getSmallestTask(view);
                    if (tplEl) {
                        Ext.fly(data.placeholder).remove();
                        data.placeholder = this.updatePlaceholderElements(tplEl, data);
                    }
                }
                if (view != data.view || !this.dropMode) {
                    this.dropMode = this.getDropMode(view);
                    data.currentZoomLevel = view.up('panel').zoomLevel;
                }
                data.view = view;
                var placeholder = Ext.get(data.placeholder);
                // http://www.sencha.com/forum/showthread.php?294565
                // return this line when bug is fixed
                //                var nodes = view.getNodes(),
                var nodes = view.all.elements.slice(),
                    start = 0,
                    end = nodes.length - 1,
                    lastNode, index, dropBefore;
                // if we drop into column without any tasks we should skip this mess
                if (nodes.length) {
                    // using bisection we locate 2 tasks next to each other
                    while (end - start > 1) {
                        index = Math.floor((start + end) / 2);
                        lastNode = nodes[index];
                        if (Ext.fly(lastNode).isVisible()) {
                            dropBefore = this.shouldDropBeforeNode(xy, lastNode, dd);
                            if (dropBefore) {
                                end = index;
                            } else {
                                start = index;
                            }
                        } else {
                            nodes.splice(index, 1);
                            end = end - 1;
                        }
                    }
                    // if task is going to be dropped before first node - search is done
                    var firstNode = nodes[start],
                        dropBeforeFirst = this.shouldDropBeforeNode(xy, firstNode, dd);
                    if (dropBeforeFirst) {
                        lastNode = firstNode;
                        dropBefore = true;
                    } else if (Ext.fly(nodes[end]).isVisible()) {
                        // if we should drop after first node let's check if element is visible (can be hidden)
                        // and that can lead to wierd results
                        lastNode = nodes[end];
                        dropBefore = this.shouldDropBeforeNode(xy, lastNode, dd);
                    } else {
                        // both checks failed - we should drop element between nodes
                        lastNode = firstNode;
                        dropBefore = false;
                    }
                }
                if (lastNode) {
                    if (dropBefore) {
                        placeholder.insertBefore(lastNode);
                        data.dropOptions = {
                            task: view.getRecord(lastNode),
                            type: 'before'
                        };
                    } else {
                        placeholder.insertAfter(lastNode);
                        data.dropOptions = {
                            task: view.getRecord(lastNode),
                            type: 'after'
                        };
                    }
                } else {
                    view.el.appendChild(placeholder);
                    data.dropOptions = null;
                }
            }
        }
        return allowed ? this.dropAllowed : this.dropNotAllowed;
    },
    notifyDrop: function(dd, e, dragData) {
        var xy = e.getXY();
        dd.proxy.el.dom.style.display = 'none';
        // resolve target view from mouse coordinate
        var view = this.getTargetView(xy, e, dragData);
        dd.proxy.el.dom.style.display = 'block';
        var me = this,
            newState = view && view.state,
            doFinalize = true,
            valid = newState !== false && newState !== null;
        // update dragData with new state, view etc.
        dragData.newState = newState;
        dragData.view = view;
        dragData.proxy = dd.proxy;
        dragData.finalize = function() {
            me.finalize.apply(me, arguments);
        };
        valid = valid && me.validatorFn.call(me.validatorFnScope || this, dragData.taskRecords, newState) !== false;
        this.dragData = dragData;
        // Allow implementor to take control of the flow, by returning false from this listener,
        // to show a confirmation popup etc.
        doFinalize = me.fireEvent('beforetaskdropfinalize', me, dragData, e) !== false;
        if (doFinalize) {
            return me.finalize(valid);
        }
        return true;
    },
    finalize: function(updateRecords) {
        var dragData = this.dragData,
            proxy = dragData.proxy,
            recordsToMove = [];
        Ext.fly(this.getEl()).select('.sch-dd-wrap-holder').remove();
        Ext.Array.forEach(dragData.taskEls, function(taskEl) {
            taskEl.removeCls('sch-hidden');
        });
        if (updateRecords) {
            var records = dragData.taskRecords,
                positionField = records[0].positionField,
                newState = dragData.newState,
                opt = dragData.dropOptions,
                targetStore = dragData.view.getStore(),
                masterStore = targetStore.masterStore;
            masterStore.suspendAutoSync();
            // this will remove records from source store and append to target store
            Ext.Array.each(records, function(record) {
                if (record.isValidTransition(newState)) {
                    record.setState(newState);
                    recordsToMove.push(record);
                }
            });
            // perform this if drop is valid
            if (recordsToMove.length > 0) {
                // remove records from view store and add them again to required position
                targetStore.remove(recordsToMove);
                var dropIndex = opt ? (targetStore.indexOf(opt.task) + (opt.type == 'before' ? 0 : 1)) : targetStore.getCount();
                targetStore.insert(dropIndex, recordsToMove);
                // We now set the Position field for all tasks in this store to assure order is kept intact
                // after save
                for (var j = 0; j < targetStore.getCount(); j++) {
                    targetStore.getAt(j).set(positionField, j, {
                        silent: true
                    });
                }
                targetStore.sort();
            }
            masterStore.resumeAutoSync(masterStore.autoSync);
        }
        // Drag was invalid
        if (recordsToMove.length === 0) {
            proxy.el.dom.style.display = 'block';
            proxy.el.animate({
                duration: 500,
                easing: 'ease-out',
                to: {
                    x: dragData.repairXY[0],
                    y: dragData.repairXY[1]
                },
                stopAnimation: true
            });
        } else {
            // Signal that the drop was (at least partially) successful
            this.fireEvent('taskdrop', this, dragData.taskRecords);
        }
        delete this.dropMode;
        this.fireEvent('aftertaskdrop', this, dragData.taskRecords);
        if (dragData.placeholder) {
            Ext.fly(dragData.placeholder).remove();
        }
        return recordsToMove.length > 0;
    }
});

/**
 @class Kanban.editor.Base

 Internal base API for task editors
 */
Ext.define('Kanban.editor.Base', {
    /**
     * @cfg {String} triggerEvent The event that should trigger the editing to start. Set to null to disable the editor from being activated.
     */
    triggerEvent: 'taskdblclick',
    panel: null,
    selector: '.sch-task',
    editRecord: function(record, e) {
        if (this.panel.isReadOnly())  {
            return;
        }
        
        var el = this.panel.getElementForTask(record);
        if (el) {
            this.triggerEdit(record, e);
        }
    },
    triggerEdit: function(record, e) {
        throw 'Abstract method call';
    },
    init: function(panel) {
        this.panel = panel;
        if (this.triggerEvent) {
            panel.on(this.triggerEvent, function(pnl, record, node, e) {
                this.editRecord(record, e);
            }, this);
            panel.on('taskkeydown', function(taskboard, record, item, e) {
                if (e.getKey() === e.ENTER && e.getTarget().nodeName.toLowerCase() !== 'input') {
                    this.editRecord(record, e);
                }
            }, this);
        }
    }
});

/**

 @class Kanban.editor.SimpleEditor
 @extends Ext.Editor

 A textfield editor for the TaskBoard allowing you to edit the name of a task easily. By default, it reacts to the 'taskdblclick' event but you
 can configure this by using the {@link #triggerEvent} config.

 Sample usage below:

 var taskBoard = new Kanban.view.TaskBoard({
        resourceStore : resourceStore,
        taskStore     : taskStore,

        editor        : new Kanban.editor.SimpleEditor({
            dataIndex       : 'Name'
        })
    });

 */
Ext.define('Kanban.editor.SimpleEditor', {
    extend: 'Ext.Editor',
    mixins: [
        'Kanban.editor.Base'
    ],
    alias: 'widget.kanban_simpleeditor',
    alignment: 'tl',
    autoSize: {
        width: 'boundEl'
    },
    // The width will be determined by the width of the boundEl, the height from the editor (21)
    selector: '.sch-task-name',
    /**
     * @cfg {String} dataIndex The data field in your {@link Kanban.model.Task} that this being editor should be editing.
     */
    dataIndex: 'Name',
    /**
     * @cfg {Object/Ext.form.Field} field The Ext JS form field (or config) to use for editing.
     */
    field: {
        xtype: 'textfield',
        minWidth: 100,
        allowEmpty: false
    },
    minWidth: 100,
    initComponent: function() {
        var me = this;
        me.on('complete', me.onEditDone, me);
        me.callParent();
    },
    triggerEdit: function(record, e) {
        // ignore editing in mini mode
        var taskEl = this.panel.getElementForTask(record);
        if (taskEl) {
            var view = this.panel.resolveViewByNode(taskEl);
            var zoomLevel = view.up('panel').zoomLevel;
            if (zoomLevel !== 'mini') {
                this.record = record;
                this.startEdit(taskEl.down(this.selector));
            }
        }
    },
    onEditDone: function() {
        this.record.set(this.dataIndex, this.getValue());
    }
});

/**

@class Kanban.field.AddNew
@extends Ext.form.field.Text

A basic text field that allows you to easily add new tasks by typing a name and hitting the Enter key.

Sample usage:

    var taskBoard = new Kanban.view.TaskBoard({
        resourceStore : userStore,
        taskStore     : taskStore,

        // Configure each state column individually
        columnConfigs : {
            all : {
                iconCls : 'sch-header-icon'
            },

            "NotStarted" : {
                dockedItems : {
                    xtype   : 'container',
                    dock    : 'bottom',
                    layout  : 'fit',

                    items   : {
                        xtype    : 'addnewfield',
                        store    : taskStore,

                        // Configurations applied to the newly created taska
                        defaults : {
                            State : 'NewTask'
                        }
                    }
                }
            }
        }
    });

 */
Ext.define('Kanban.field.AddNew', {
    extend: 'Ext.form.TextField',
    alias: 'widget.addnewfield',
    enableKeyEvents: true,
    emptyText: 'Add new task...',
    /**
     * @cfg {Kanban.data.TaskStore} store (required) The task store
     */
    store: null,
    /**
     * @cfg {Object} defaults Any default properties to be applied to the newly created tasks
     */
    defaults: null,
    initComponent: function() {
        this.on('keyup', this.onMyKeyUp, this);
        if (Ext.isString(this.store)) {
            this.store = Ext.getStore(this.store);
        }
        this.callParent(arguments);
    },
    onMyKeyUp: function(field, e) {
        if (e.getKey() === e.ENTER) {
            this.addTask();
        }
    },
    addTask: function() {
        var vals = {};
        var column = this.up('taskcolumn');
        vals[this.store.model.prototype.nameField] = this.getValue();
        var newTask = this.store.add(Ext.apply(vals, this.defaults))[0];
        this.reset();
        if (column) {
            var view = column.down('taskview'),
                node = view.getNode(newTask);
            if (node) {
                Ext.fly(node).scrollIntoView(view.el, false, true);
            }
        }
    }
});

/**
 * A text field that allows you to filter out undesired columns from the TaskBoard view.
 *
 * @class Kanban.field.ColumnFilter
 * @extends Ext.form.field.ComboBox
 */
Ext.define('Kanban.field.ColumnFilter', {
    extend: 'Ext.form.ComboBox',
    alias: 'widget.columnfilter',
    requires: [
        'Ext.data.JsonStore'
    ],
    multiSelect: true,
    valueField: 'id',
    displayField: 'name',
    panel: null,
    queryMode: 'local',
    listConfig: {
        htmlEncode: true,
        cls: 'sch-columnfilter-list'
    },
    initComponent: function() {
        var me = this;
        me.store = new Ext.data.JsonStore({
            proxy: 'memory',
            fields: [
                'id',
                'name'
            ]
        });
        me.loadStore();
        me.callParent(arguments);
        me.getPicker().on({
            beforeshow: me.onBeforeColumnListShow,
            scope: me
        });
        me.getPicker().on({
            show: function(picker) {
                picker.on('selectionchange', me.applyFilterToColumns, me);
            },
            hide: function(picker) {
                picker.un('selectionchange', me.applyFilterToColumns, me);
            },
            delay: 50,
            // The picker fires 'selectionchange' as it shows itself
            scope: me
        });
        me.value = me.value || me.panel.query('taskcolumn').map(function(column) {
            return column.state;
        });
        // Need to apply initial filtering if values are provided
        me.applyFilterToColumns();
    },
    loadStore: function() {
        var me = this,
            locale = Sch.locale.Active['Kanban.locale'] || {},
            data = me.panel.query('taskcolumn').map(function(column) {
                return {
                    id: column.state,
                    name: column.origTitle || locale[column.state] || column.state
                };
            });
        me.store.loadData(data);
    },
    applyFilterToColumns: function() {
        var me = this,
            values = me.value;
        me.store.each(function(rec) {
            var column = me.panel.down('[state=' + rec.get('id') + ']'),
                visible = Ext.Array.indexOf(values, rec.get('id')) >= 0;
            column[visible ? 'show' : 'hide']();
        });
    },
    onBeforeColumnListShow: function() {
        var me = this,
            visible = [];
        Ext.each(me.panel.query('taskcolumn'), function(column) {
            if (column.isVisible()) {
                visible.push(me.store.getById(column.state));
            }
        });
        me.select(visible);
    }
});

/**

 @class Kanban.field.TaskFilter
 @extends Ext.form.field.Text

 A text field that allows you to filter for tasks by Name in the TaskBoard view. You can filter for another field by setting the {@link #field} config.

 To filter tasks by task name:

    {
        xtype : 'filterfield',
        store : 'myTaskStore',
        field : 'Name'
    },

 To filter tasks by resource name:

    {
        xtype : 'filterfield',
        store : 'myTaskStore',
        filter : new Ext.util.Filter({
            filterFn : function (r) {
                var resource = r.getResource();

                return resource && resource.getName().toLowerCase().indexOf(this.getValue()) >= 0;
            }
        })
    },

 */
Ext.define('Kanban.field.TaskFilter', {
    extend: 'Ext.form.TextField',
    alias: 'widget.filterfield',
    requires: [
        'Ext.util.Filter'
    ],
    enableKeyEvents: true,
    minLength: 2,
    /**
     * @cfg {Kanban.data.TaskStore/String} store (required) The store containing the tasks or a store identifier (storeId) identifying a store
     */
    store: null,
    /**
     * @cfg {String} field The {@link Kanban.model.Task} field that should be used for filtering.
     */
    /**
     * @cfg {Boolean} caseSensitive True to use case sensitive filtering
     */
    caseSensitive: false,
    /**
     * @cfg {Ext.util.Filter} filter A custom Ext JS filter that should be used for filtering.
     */
    initComponent: function() {
        this.on('change', this.onMyChange, this);
        this.store = Ext.data.StoreManager.lookup(this.store);
        this.field = this.field || this.store.getModel().prototype.nameField;
        this.filter = this.filter || new Ext.util.Filter({
            id: this.getId() + '-filter',
            property: this.field,
            value: '',
            caseSensitive: this.caseSensitive,
            anyMatch: true
        });
        this.callParent(arguments);
    },
    onMyChange: function() {
        var val = this.getValue();
        if (val && val.length >= this.minLength) {
            this.filter.setValue(val);
            this.store.addFilter(this.filter);
        } else {
            this.store.removeFilter(this.filter);
        }
    }
});

/**

 @class Kanban.field.TaskHighlight
 @extends Ext.form.field.Text

 A text field that allows you to highlight certain tasks in the TaskBoard view.
 */
Ext.define('Kanban.field.TaskHighlight', {
    extend: 'Ext.form.TextField',
    alias: 'widget.highlightfield',
    mixins: [
        'Ext.AbstractPlugin'
    ],
    enableKeyEvents: true,
    minLength: 2,
    preventMark: true,
    /**
     * @cfg {Kanban.view.TaskBoard} panel (required) The kanban panel
     */
    panel: null,
    /**
     * @cfg {String} field The {@link Kanban.model.Task} field that should be used for filtering.
     */
    field: 'Name',
    /**
     * @cfg {Boolean} caseSensitive True to use case sensitive filtering
     */
    caseSensitive: false,
    initComponent: function() {
        this.on('keyup', this.onMyKeyUp, this);
        this.callParent(arguments);
    },
    onMyKeyUp: function(field, e) {
        var val = this.getValue();
        if (val && val.length >= this.minLength) {
            var matches = [];
            val = this.caseSensitive ? val : val.toLowerCase();
            this.panel.highlightTasksBy(function(rec) {
                var name = this.caseSensitive ? rec.data[this.field] : rec.data[this.field].toLowerCase();
                return name && name.indexOf(val) >= 0;
            }, this);
        } else {
            this.panel.clearHighlight();
        }
    }
});

Ext.define('Kanban.locale.En', {
    extend: 'Sch.locale.Locale',
    singleton: true,
    constructor: function(config) {
        Ext.apply(this, {
            l10n: {
                'Kanban.menu.TaskMenuItems': {
                    copy: 'Duplicate',
                    remove: 'Delete',
                    edit: 'Edit',
                    states: 'Status',
                    users: 'Assign to'
                }
            },
            NotStarted: 'Not Started',
            InProgress: 'In Progress',
            Test: 'Test',
            Done: 'Done'
        });
        this.callParent(arguments);
    }
});

/**

@class Kanban.menu.UserMenu
@extends Ext.menu.Menu

A simple menu showing a list of users that can be assigned to a task. Intended to be used together with the TaskBoard.
Sample usage:

    var taskBoard = new Kanban.view.TaskBoard({
        resourceStore : resourceStore,
        taskStore : taskStore,

        userMenu : new Kanban.menu.UserMenu({
            resourceStore : resourceStore
        }),

        ...
    });
*/
Ext.define('Kanban.menu.UserMenu', {
    extend: 'Ext.menu.Menu',
    alias: 'widget.kanban_usermenu',
    cls: 'sch-usermenu',
    plain: true,
    /**
     * @cfg {Kanban.data.ResourceStore} store (required) The task store
     */
    resourceStore: null,
    initComponent: function() {
        var me = this;
        Ext.apply(this, {
            renderTo: document.body,
            listeners: {
                beforeshow: function() {
                    var user = this.task.getResource();
                    if (user) {
                        this.items.each(function(item) {
                            if (user == item.user) {
                                item.addCls('sch-user-selected');
                            } else {
                                item.removeCls('sch-user-selected');
                            }
                        });
                    }
                }
            }
        });
        this.resourceStore = Ext.data.StoreManager.lookup(this.resourceStore);
        this.mon(this.resourceStore, {
            load: this.populate,
            add: this.populate,
            remove: this.populate,
            update: this.populate,
            scope: this
        });
        this.callParent(arguments);
        this.populate();
    },
    showForTask: function(task, xy) {
        this.task = task;
        if (this.resourceStore.getCount() > 0) {
            this.showAt(xy);
        }
    },
    onUserSelected: function(item) {
        this.task.assign(item.user);
    },
    populate: function() {
        var me = this;
        var items = [];
        this.resourceStore.each(function(user) {
            items.push({
                text: user.getName(),
                user: user,
                handler: me.onUserSelected,
                scope: me
            });
        });
        this.removeAll(true);
        this.add(items);
    }
});

/**
 @class Kanban.menu.TaskMenuItems
 @private
 
 This class is a factory of items for the Kanban.menu.TaskMenu. This class should not be used directly.
 With the  {@link Kanban.menu.TaskMenu#defaultActions} this class can be configured.
 */
Ext.define('Kanban.menu.TaskMenuItems', {
    requires: [
        'Kanban.editor.SimpleEditor',
        'Kanban.menu.UserMenu'
    ],
    mixins: [
        'Sch.mixin.Localizable'
    ],
    taskBoard: null,
    mainMenu: null,
    defaultActions: null,
    editorClass: null,
    editor: null,
    userMenuClass: null,
    userMenu: null,
    constructor: function(config) {
        Ext.apply(this, config);
        this.mainMenu.on('beforeshow', this.onBeforeShow, this);
        this.items = this.items || [];
        if (this.defaultActions) {
            this.initEditor();
            this.initUserMenu();
            this.initStateMenu();
            this.items = this.items.concat([
                {
                    action: 'edit',
                    text: this.L('edit'),
                    handler: this.onEditClick,
                    scope: this
                },
                {
                    action: 'assign',
                    text: this.L('users'),
                    menu: this.userMenu
                },
                {
                    action: 'setState',
                    text: this.L('states'),
                    menu: this.stateMenu
                },
                {
                    action: 'copy',
                    text: this.L('copy'),
                    handler: this.onCopyClick,
                    scope: this
                },
                {
                    action: 'remove',
                    text: this.L('remove'),
                    handler: this.onRemoveClick,
                    scope: this
                }
            ]);
        }
        this.callParent(arguments);
    },
    onBeforeShow: function(menu) {
        var task = menu.getTask();
        if (this.userMenu) {
            this.userMenu.task = task;
        }
        if (this.editor) {
            this.editor.task = task;
        }
    },
    getItems: function() {
        return this.items;
    },
    initEditor: function() {
        if (!this.editor) {
            if (this.taskBoard.getTaskEditor()) {
                this.editor = this.taskBoard.getTaskEditor();
            } else {
                this.editor = Ext.create(this.editorClass, {
                    dataIndex: this.taskBoard.taskStore.model.prototype.nameField,
                    panel: this.taskBoard
                });
            }
        }
    },
    onEditClick: function(btn, e) {
        this.editor.editRecord(this.mainMenu.getTask(), e);
    },
    initUserMenu: function() {
        if (!this.userMenu) {
            this.userMenu = Ext.create(this.userMenuClass, {
                resourceStore: this.taskBoard.resourceStore,
                onBodyClick: Ext.emptyFn
            });
        }
    },
    initStateMenu: function() {
        var me = this,
            model = this.taskBoard.taskStore.model,
            stateField = model.prototype.stateField,
            states = model.prototype.states;
        var locale = Sch.locale.Active['Kanban.locale'] || {};
        var items = Ext.Array.map(states, function(state) {
                return {
                    text: locale[state] || state,
                    state: state,
                    handler: me.onStateClick,
                    scope: me
                };
            });
        var mainMenu = me.mainMenu;
        this.stateMenu = new Ext.menu.Menu({
            items: items,
            plain: true,
            listeners: {
                show: function() {
                    var task = mainMenu.getTask();
                    var state = task.get(stateField);
                    this.items.each(function(item) {
                        item.setDisabled(item.state === state || !task.isValidTransition(item.state));
                    });
                }
            }
        });
    },
    onStateClick: function(btn) {
        this.mainMenu.task.setState(btn.state);
    },
    onCopyClick: function(btn) {
        var store = this.taskBoard.taskStore,
            task = this.mainMenu.getTask(),
            newTask = task.copy(null);
        newTask.setName(newTask.getName());
        store.add(newTask);
    },
    onRemoveClick: function(btn) {
        var store = this.taskBoard.taskStore,
            task = this.mainMenu.getTask();
        store.remove(task);
    }
});

/**

 @class Kanban.menu.TaskMenu
 @extends Ext.menu.Menu

 A simple menu that can be attached to a task on the kanban board. When configured a menu-handle-icon will be rendered on the task.
 The handle template can be configured in {@link Kanban.template.Task#menuIconTpl}

 */
Ext.define('Kanban.menu.TaskMenu', {
    extend: 'Ext.menu.Menu',
    requires: [
        'Kanban.menu.TaskMenuItems'
    ],
    isTaskMenu: true,
    /**
     * @property alias
     */
    alias: 'widget.kanban_taskmenu',
    cls: 'sch-task-menu',
    handleCls: 'sch-task-menu-handle',
    /**
     * @property {Kanban.view.TaskBoard} taskBoard A reference to the Kanban taskboard.
     */
    taskBoard: null,
    /**
     * @property {Kanban.model.Task} task A reference to the current task.
     */
    config: {
        task: null
    },
    hideHandleTimer: null,
    /**
     * @cfg {Number} handleHideDelay The handle will be hidden after this number of ms, when the mouse leaves the task element.
     */
    handleHideDelay: 500,
    currentHandle: null,
    editorClass: 'Kanban.editor.SimpleEditor',
    userMenuClass: 'Kanban.menu.UserMenu',
    /**
     * @cfg {Boolean} defaultActions Set to true to include the default toolitems (Copy, delete, edit etc).
     */
    defaultActions: true,
    /**
     * @cfg {String} itemFactoryClass A classname of the class that can generate items for the menu. The factory will be used when
     * no items are set in the config.
     *
     * A factory class needs to have a public function {@link Kanban.menu.TaskMenuItems#getItems} which is called to set the items for this menu.
     */
    itemFactoryClass: 'Kanban.menu.TaskMenuItems',
    initComponent: function() {
        this.on('beforeshow', this.onBeforeShow, this);
        if (this.defaultActions) {
            this.items = Ext.create(this.itemFactoryClass, {
                editorClass: this.editorClass,
                userMenuClass: this.userMenuClass,
                defaultActions: this.defaultActions,
                items: this.items || [],
                taskBoard: this.taskBoard,
                mainMenu: this
            }).getItems();
        }
        this.callParent(arguments);
    },
    registerListeners: function() {
        this.mon(this.taskBoard.el, {
            click: this.onMenuHandleClick,
            delegate: '.' + this.handleCls,
            scope: this
        });
        this.mon(this.taskBoard, {
            taskmouseenter: this.onHandleMouseOver,
            taskmouseleave: this.onHandleMouseLeave,
            scope: this
        });
    },
    /**
     * Shows this menu.
     * @param task
     */
    showForTask: function(task, e, node) {
        var el = e.getTarget('.sch-task');
        this.setTask(task);
        this.show();
        this.alignTo(el, 'tl-tr?');
    },
    onMenuHandleClick: function(e, node) {
        var task = this.taskBoard.resolveRecordByNode(node);
        e.stopEvent();
        this.showForTask(task, e, node);
    },
    onHandleMouseOver: function(view, task, taskNode, event, eOpts) {
        window.clearTimeout(this.hideHandleTimer);
        this.hide();
        this.currentHandle && this.currentHandle.setVisible(false);
        this.currentHandle = Ext.select('.' + this.handleCls, false, taskNode).setVisible(true);
    },
    onHandleMouseLeave: function(view, task, taskNode, event, eOpts) {
        this.hideHandleTimer = Ext.defer(function() {
            this.currentHandle && this.currentHandle.setVisible(false);
        }, this.handleHideDelay, this);
    },
    /**
     * Called once for each menuitem before the menu is shown. Use this to hide/disable items on a per-task basis.
     *
     * @param {Ext.menu.Item} menuItem the menu item
     * @param {Kanban.model.Task} task The task
     * @returns {Boolean} false to hide the menu item
     */
    shouldShowItem: function(menuItem, task) {
        return true;
    },
    onBeforeShow: function(menu) {
        var task = this.getTask();
        this.items.each(function(menuItem) {
            menuItem.task = task;
            menuItem.setVisible(this.shouldShowItem(menuItem, task));
        }, this);
    },
    destroy: function() {
        clearTimeout(this.hideHandleTimer);
        this.callParent(arguments);
    }
});

Ext.define('Kanban.menu.UserPicker', {
    extend: 'Ext.view.View',
    alias: [
        'widget.userpicker',
        'widget.kanban_userpicker'
    ],
    cls: 'sch-userpicture-view',
    autoScroll: true,
    showName: true,
    padding: '10 5 5 5',
    itemSelector: '.sch-user',
    overItemCls: 'sch-user-hover',
    selectedItemCls: 'sch-user-selected',
    initComponent: function() {
        var modelProt = this.store && this.store.model && this.store.model.prototype;
        var nameField = modelProt && modelProt.nameField || 'Name';
        var imageUrlField = modelProt && modelProt.imageUrlField || 'ImageUrl';
        Ext.apply(this, {
            itemTpl: '<tpl for=".">' + '<div class="sch-user">' + '<img src="{' + imageUrlField + ':htmlEncode}" />' + (this.showName ? '<span>{' + nameField + ':htmlEncode}</span>' : '') + '</div>' + '</tpl>'
        });
        this.callParent(arguments);
    }
});

/**

@class Kanban.menu.UserPictureMenu
@extends Ext.menu.Menu

A simple menu showing a picture for each user that can be assigned to a task. Intended to be used together with the TaskBoard.
Sample usage:

    var taskBoard = new Kanban.view.TaskBoard({
        resourceStore : resourceStore,
        taskStore : taskStore,

        userMenu : new Kanban.menu.UserPictureMenu({
            resourceStore : resourceStore
        }),

        ...
    });

*/
Ext.define('Kanban.menu.UserPictureMenu', {
    extend: 'Ext.menu.Menu',
    alias: [
        'widget.userpicturemenu',
        'widget.kanban_userpicturemenu'
    ],
    requires: [
        'Kanban.menu.UserPicker'
    ],
    cls: 'sch-userpicturemenu',
    width: 290,
    height: 200,
    resourceStore: null,
    hideOnSelect: true,
    initComponent: function() {
        var me = this,
            cfg = Ext.apply({}, me.initialConfig);
        delete cfg.listeners;
        Ext.apply(me, {
            plain: true,
            showSeparator: false,
            bodyPadding: 0,
            items: Ext.applyIf({
                margin: 0,
                store: this.resourceStore,
                xtype: 'userpicker'
            }, cfg)
        });
        me.callParent(arguments);
        me.picker = me.down('userpicker');
        me.relayEvents(me.picker, [
            'select'
        ]);
        if (me.hideOnSelect) {
            me.on('select', me.onUserSelected, me);
        }
        this.mon(Ext.getBody(), 'click', this.onBodyClick, this);
    },
    showForTask: function(task, xy) {
        this.task = task;
        this.showAt(xy);
        var user = task.getResource();
        if (user) {
            this.picker.select(user, false, true);
        } else {
            this.picker.getSelectionModel().deselectAll();
        }
    },
    onUserSelected: function(picker, user) {
        this.hide();
        this.task.assign(user);
    },
    onBodyClick: function(e, t) {
        if (!e.within(this.el)) {
            this.hide();
        }
    }
});

/**
 @class Kanban.selection.TaskModel
 @extends Ext.mixin.Observable

 A composite selection model which relays methods to the various selection models used by the internal data
 views of the task board component.
 */
Ext.define('Kanban.selection.TaskModel', {
    extend: 'Ext.mixin.Observable',
    panel: null,
    selModels: null,
    constructor: function(config) {
        var me = this;
        Ext.apply(me, config);
        me.callParent(arguments);
        me.selModels = Ext.Array.map(me.panel.views, function(view) {
            return view.getSelectionModel();
        });
        me.forEachView(function(view) {
            me.mon(view, 'containerclick', me.onEmptyAreaClick, me);
            me.relayEvents(view, [
                'select',
                'deselect'
            ]);
            me.relayEvents(view.getSelectionModel(), [
                'selectionchange'
            ]);
        });
    },
    /**
     * Selects one or more tasks.
     * @param {Kanban.model.Task/Kanban.model.Task[]} tasks An array of tasks
     * @param {Boolean} [keepExisting=false] True to retain existing selections
     * @param {Boolean} [suppressEvent=false] True to not fire a select event
     */
    select: function(tasks, keepExisting, suppressEvent) {
        tasks = [].concat(tasks);
        var fired = false;
        var listener = function() {
                fired = true;
            };
        this.forEachSelModel(function(sm) {
            var recordsInView = Ext.Array.filter(tasks, function(rec) {
                    return sm.store.indexOf(rec) >= 0;
                });
            sm.on('selectionchange', listener, null, {
                single: true
            });
            if (recordsInView.length > 0) {
                sm.select(recordsInView, keepExisting, suppressEvent);
            } else {
                sm.deselectAll();
            }
            sm.un('selectionchange', listener, null, {
                single: true
            });
        });
        if (fired) {
            this.fireEvent('selectionchange', this.getSelection());
        }
    },
    /**
     * Deselects a task instance.
     * @param {Kanban.model.Task/Kanban.model.Task} tasks One or more tasks
     * @param {Boolean} [suppressEvent=false] True to not fire a deselect event
     */
    deselect: function(tasks, suppressEvent) {
        tasks = [].concat(tasks);
        this.forEachSelModel(function(sm) {
            var recordsInView = Ext.Array.filter(tasks, function(rec) {
                    return sm.store.indexOf(rec) >= 0;
                });
            sm.deselect(recordsInView, suppressEvent);
        });
        this.fireEvent('selectionchange', this.getSelection());
    },
    /**
     * Selects all tasks in the view.
     * @param {Boolean} suppressEvent True to suppress any select events
     */
    selectAll: function() {
        this.relayMethod('selectAll');
    },
    /**
     * Deselects all tasks in the view.
     * @param {Boolean} [suppressEvent] True to suppress any deselect events
     */
    deselectAll: function() {
        this.relayMethod('deselectAll');
    },
    /**
     * Returns an array of the currently selected tasks.
     * @return {Ext.data.Model[]} The selected tasks
     */
    getSelection: function() {
        return this.relayMethod('getSelection');
    },
    /**
     * Returns the count of selected tasks.
     * @return {Number} The number of selected tasks
     */
    getCount: function() {
        return Ext.Array.sum(this.relayMethod('getCount'));
    },
    // BEGIN PRIVATE METHODS
    deselectAllInOtherSelectionModels: function(selModel) {
        this.forEachSelModel(function(sm) {
            sm !== selModel && sm.deselectAll();
        });
    },
    // relays results, flattens results from all calls into one array
    relayMethod: function(method, args) {
        return [].concat.apply([], Ext.Array.map(this.selModels, function(sm) {
            return sm[method].apply(sm, args || []);
        }));
    },
    forEachSelModel: function(fn, scope) {
        Ext.Array.each(this.selModels, fn, scope || this);
    },
    onEmptyAreaClick: function() {
        this.deselectAll();
    },
    forEachView: function(fn, scope) {
        Ext.Array.each(this.panel.views, fn, scope || this);
    },
    destroy: function() {}
});
// EOF PRIVATE METHODS

/**

 @class Kanban.template.Task
 @extends Ext.XTemplate

 Template class used to render {@link Kanban.model.Task a task}.
 */
Ext.define('Kanban.template.Task', {
    extend: 'Ext.XTemplate',
    model: null,
    // the task model
    /**
     * @cfg {String} resourceImgTpl Resource image template.
     */
    /**
     * @cfg {String} taskBodyTpl Internal part of a task template.
     */
    /**
     * @cfg {String} taskToolTpl Extra template for optional task tools.
     */
    /**
     * @cfg {String} menuIconTpl Template for the taskmenu handler.
     */
    menuIconTpl: '<div class="sch-task-menu-handle x-fa fa-gear"></div>',
    constructor: function(config) {
        var me = this;
        config = config || {};
        // apply default value if undefined
        config.menuIconTpl = config.menuIconTpl !== undefined ? config.menuIconTpl : me.menuIconTpl;
        Ext.apply(me, config);
        var modelProt = me.model.prototype;
        var idProperty = modelProt.idProperty;
        var nameField = modelProt.nameField;
        if (typeof me.taskBodyTpl !== 'string') {
            me.taskBodyTpl = '<tpl if="' + modelProt.imageUrlField + '"><img class="sch-task-img" src="{taskImageUrl:htmlEncode}"/></tpl>' + '<span class="sch-task-id">{[ values.' + idProperty + ' ? "#" + values.' + idProperty + ' : "" ]}</span><span class="sch-task-name"> {' + nameField + ':htmlEncode}</span>';
        }
        if (typeof me.resourceImgTpl !== 'string') {
            me.resourceImgTpl = '<img src="{resourceImageUrl:htmlEncode}" class="sch-user-avatar {resourceImageCls:htmlEncode}" />';
        }
        me.callParent([
            '<tpl for=".">',
            '<div class="sch-task sch-task-state-{[Ext.String.htmlEncode(values.' + modelProt.stateField + '.replace(/\\s/g, \'-\'))]} {' + modelProt.clsField + ':htmlEncode} {cls:htmlEncode} x-unselectable" unselectable="on" style="{style}">' + '<div class="sch-task-inner">' + me.taskBodyTpl + me.resourceImgTpl + (me.taskToolTpl || '') + '</div>' + me.menuIconTpl + '</div>' + '</tpl>'
        ]);
    }
});

//http://www.sencha.com/forum/showthread.php?295892-Ext-JS-5.1-Post-GA-Patches&p=1080371&viewfull=1#post1080371
Ext.define('Sch.patches.View', {
    extend: 'Sch.util.Patch',
    target: 'Ext.view.View',
    minVersion: '5.1.0',
    overrides: {
        handleEvent: function(e) {
            var me = this,
                isKeyEvent = me.keyEventRe.test(e.type),
                nm = me.getNavigationModel();
            e.view = me;
            // 1002_tabbing
            if (isKeyEvent) {
                e.item = e.getTarget(me.itemSelector);
                e.record = nm.getRecord(e.item);
            }
            // If the key event was fired programatically, it will not have triggered the focus
            // so the NavigationModel will not have this information.
            if (!e.item) {
                // In Ext6 editor is moved from outside of grid to cell, so now getTarget
                // will resolve item for event, which will trigger view events. Major implications are
                // selection triggered, editor is collapsed when view dragdrop plugin is active.
                // Here we check if target element lies inside active editor, if so - no item should be
                // resolved for event
                // covered by 1017_duration_editor_place
                var editing = me.editingPlugin && me.editingPlugin.getActiveEditor && me.editingPlugin.getActiveEditor();
                if (!(editing && editing.getEl().contains(e.getTarget()))) {
                    e.item = e.getTarget(me.itemSelector);
                }
            }
            if (e.item && !e.record) {
                e.record = me.getRecord(e.item);
            }
            if (me.processUIEvent(e) !== false) {
                me.processSpecialEvent(e);
            }
            // We need to prevent default action on navigation keys
            // that can cause View element scroll unless the event is from an input field.
            // We MUST prevent browser's default action on SPACE which is to focus the event's target element.
            // Focusing causes the browser to attempt to scroll the element into view.
            if (isKeyEvent && !Ext.fly(e.target).isInputField()) {
                if (e.getKey() === e.SPACE || e.isNavKeyPress(true)) {
                    e.preventDefault();
                }
            }
            e.view = null;
        }
    }
});

/**

 @class Kanban.view.TaskView
 @extends Ext.view.View

 A task view class used internally by the Kanban Panel, based on the {@link Ext.view.View} class, showing a
 plain list of {@link Kanban.model.Task tasks}.
 */
Ext.define('Kanban.view.TaskView', {
    extend: 'Ext.view.View',
    alias: 'widget.taskview',
    requires: [
        "Kanban.template.Task",
        "Kanban.data.ViewStore"
    ],
    // Inherited configs
    autoScroll: true,
    trackOver: true,
    overItemCls: 'sch-task-over',
    selectedItemCls: 'sch-task-selected',
    itemSelector: '.sch-task',
    // Class configs & properties
    state: null,
    /**
     * @cfg {String} taskBodyTpl The template to use for the task body rendering
     */
    /**
     * @cfg {String} resourceImgTpl The template to use for the user image
     */
    /**
     * @cfg {String} taskToolTpl The template to use for any tools that should be shown at the bottom of a task box.
     */
    /**
     * @cfg {String} menuIconTpl The template to use for the task menu icon
     */
    /**
     * A renderer template method intended to be overwritten to supply custom values for the template used to render a task.
     * This is called once every time a task is rendered and two arguments are passed, the task record and a 'renderData' object containing
     * the properties that will be applied to the template. In addition to the prepopulated renderData properties such as task 'Name', 'Id' etc you can also
     * supply a 'cls' (added as a CSS class) property and 'style' (added as inline styles) to programmatically change the appearance of tasks in the list.

     * @param {Kanban.model.Task} task The task record
     * @param {Object} renderData The object that will be applied to the template
     */
    taskRenderer: function(task, renderData) {},
    initComponent: function() {
        var me = this;
        if (me.store && me.store.model) {
            me.tpl = new Kanban.template.Task({
                model: me.store.model,
                resourceImgTpl: me.resourceImgTpl,
                taskToolTpl: me.taskToolTpl,
                taskBodyTpl: me.taskBodyTpl,
                menuIconTpl: me.menuIconTpl
            });
        } else {
            me.tpl = new Ext.XTemplate('');
        }
        me.addCls('sch-taskview sch-taskview-state-' + me.state.replace(/\s/g, '-'));
        me.callParent(arguments);
    },
    bindStore: function(store) {
        // can be ext-empty-store
        if (store && store.model) {
            this.tpl = new Kanban.template.Task({
                model: store.model,
                resourceImgTpl: this.resourceImgTpl,
                taskToolTpl: this.taskToolTpl,
                taskBodyTpl: this.taskBodyTpl,
                menuIconTpl: this.menuIconTpl
            });
        }
        this.callParent(arguments);
    },
    // ViewSelector UX breaks after a view refresh :/
    // http://www.sencha.com/forum/showthread.php?293015-DragSelector-UX-broken-after-view-refresh&p=1069838#post1069838
    refresh: function() {
        var el = this.getEl();
        var selectorProxy = el.down('.' + Ext.baseCSSPrefix + 'view-selector');
        if (selectorProxy) {
            el.removeChild(selectorProxy);
        }
        this.callParent(arguments);
        if (selectorProxy) {
            el.appendChild(selectorProxy);
        }
    },
    collectData: function(records) {
        var collected = this.callParent(arguments),
            result = [];
        for (var i = 0; i < collected.length; i++) {
            // collected[i] is reference to the record[i].data
            // we don't want to pollute it so lets make a new object instead
            var taskRenderData = Ext.apply({}, collected[i]);
            var task = records[i];
            var user = task.getResource();
            var userImgUrl = user && user.getImageUrl();
            taskRenderData.resourceImageCls = '';
            taskRenderData.resourceImageUrl = userImgUrl || Ext.BLANK_IMAGE_URL;
            taskRenderData.taskImageUrl = task.getImageUrl();
            taskRenderData.task = task;
            taskRenderData.name = task.getName();
            if (!userImgUrl) {
                taskRenderData.resourceImageCls = "sch-no-img";
            }
            this.taskRenderer(task, taskRenderData);
            if (task.phantom) {
                taskRenderData.cls = (taskRenderData.cls || '') + " sch-phantom-task";
            }
            result.push(taskRenderData);
        }
        return result;
    }
});

/**

@class Kanban.view.TaskColumn
@extends Ext.panel.Panel

A panel representing a 'swim lane' in the task board, based on the {@link Ext.panel.Panel} class. The TaskColumn holds a single {@link Kanban.view.TaskView}
instance and is consumed by the TaskBoard class. You normally don't interact directly with this class, but you can configure each column
using the {@link Kanban.view.TaskBoard#columnConfigs} config option.

    var taskBoard = new Kanban.view.TaskBoard({
        resourceStore : userStore,
        taskStore     : taskStore,
        ..,

        columnConfigs : {
            // Applied to all Task Columns
            all : {
                iconCls : 'sch-header-icon'
            },

            // Configure a Task Column individually
            "NotStarted" : {
                dockedItems : {
                    xtype   : 'container',
                    dock    : 'bottom',
                    layout  : 'fit',
                    border  : 0,
                    padding : '5 8',
                    items   : {
                        height : 30,

                        xtype : 'addnewfield',
                        store : taskStore
                    }
                }
            }
        }
    });

You can also subclass it and have the {@link Kanban.view.TaskBoard} consume your own custom class instead by providing the {@link Kanban.view.TaskBoard#columnClass}
config.
*/
Ext.define('Kanban.view.TaskColumn', {
    extend: 'Ext.Panel',
    alias: 'widget.taskcolumn',
    requires: [
        // Ext JS 5 bug
        'Ext.layout.container.Fit',
        'Kanban.view.TaskView'
    ],
    flex: 1,
    layout: 'fit',
    collapseDirection: 'right',
    /**
     * @cfg {String} state (required) The state name for this column. It should contain any special characters such as , . " '
     */
    state: null,
    store: null,
    taskBodyTpl: null,
    taskToolTpl: null,
    resourceImgTpl: null,
    origTitle: null,
    view: null,
    zoomLevel: 'large',
    /**
     * @cfg {Object} viewConfig (required) A custom object containing config properties for the {@link Ext.view.View} which is added to this column
     */
    viewConfig: null,
    initComponent: function() {
        var me = this;
        if (me.state === null) {
            throw 'Must supply state';
        }
        var viewConfig = Ext.apply({
                state: me.state
            }, me.viewConfig || {});
        if (me.taskBodyTpl)  {
            viewConfig.taskBodyTpl = me.taskBodyTpl;
        }
        
        if (me.taskToolTpl)  {
            viewConfig.taskToolTpl = me.taskToolTpl;
        }
        
        if (me.resourceImgTpl)  {
            viewConfig.resourceImgTpl = me.resourceImgTpl;
        }
        
        me.items = me.view = new Kanban.view.TaskView(viewConfig);
        var locale = Sch.locale.Active['Kanban.locale'] || {};
        me.origTitle = me.title = (me.title || locale[me.state] || me.state);
        me.callParent(arguments);
        me.addCls('sch-taskcolumn sch-taskcolumn-state-' + me.state.replace(/\s/g, '-'));
    },
    onRender: function() {
        this.setZoomLevel(this.zoomLevel);
        if (this.header) {
            this.header.addCls('sch-taskcolumnheader-state-' + this.state.replace(/\s/g, '-'));
        }
        this.callParent(arguments);
    },
    refreshTitle: function() {
        var state = this.state;
        var nbrTasks = this.store.query(this.store.getModel().prototype.stateField, state, false, false, true).length;
        this.setTitle(this.origTitle + (nbrTasks ? ' (' + nbrTasks + ')' : ''));
    },
    /**
     * Bind new view store to current column
     * @param {Kanban.data.ViewStore} store New view store bound to task store
     * @private
     */
    bindStore: function(store) {
        var listeners = {
                load: this.refreshTitle,
                datachanged: this.refreshTitle,
                update: this.refreshTitle,
                add: this.refreshTitle,
                remove: this.refreshTitle,
                buffer: 20,
                scope: this
            };
        if (this.store) {
            // TODO: Need to refactor this to accept taskStore and create new viewStore here. See usages
            // To unbind old viewstore correctly, we need to also remove its listeners from master store.
            // See ViewStore constructor.
            this.store.unbindFromStore();
            this.mun(this.store, listeners);
        }
        if (store) {
            this.mon(store, listeners);
            this.view.bindStore(store);
        }
        this.store = store;
        this.refreshTitle();
    },
    getZoomLevel: function() {
        return this.zoomLevel;
    },
    setZoomLevel: function(level) {
        this.zoomLevel = level || 'large';
        this.el.set({
            size: level
        });
    }
});

/**
 * @class Kanban.view.TaskBoard
 *
 * A panel based on the {@link Ext.panel.Panel} class which allows you to visualize and manage {@link Kanban.model.Task tasks} and you can
 * also assign {@link Kanban.model.Resource resources} to these tasks. The panel expects a {@link Kanban.data.TaskStore taskStore} to be provided and can also
 * be configured with a {@link Kanban.data.ResourceStore resourceStore}. Based on the array of {@link Kanban.model.Task#states states}, a list of
 * {@link Kanban.view.TaskColumn TaskColumns} will be generated. Tasks can be dragged between these state panels, and you can control which state transitions
 * are allowed by subclassing the {@link Kanban.model.Task Task} class and overriding the {@link Kanban.model.Task#isValidTransition} method.
 *
 * Sample usage below:
 *
 *     var resourceStore = new Kanban.data.ResourceStore({
 *         data    : [
 *             { Id : 1, Name : 'Dave' }
 *         ]
 *     });
 *
 *     var taskStore = new Kanban.data.TaskStore({
 *         data    : [
 *             { Id : 1, Name : 'Dig hole', State : 'NotStarted'}
 *         ]
 *     });
 *
 *     var taskBoard = new Kanban.view.TaskBoard({
 *         resourceStore : resourceStore,
 *         taskStore     : taskStore
 *     });
 *
 *     var vp = new Ext.Viewport({
 *         items       : taskBoard,
 *         layout      : 'fit'
 *     });
 *
 * Additionally, you can control the layout of the columns yourself by providing an array of Columns yourself.
 *
 *     var taskBoard = new Kanban.view.TaskBoard({
 *         ...
 *         columns : [
 *             {
 *                 state       : 'NotStarted',
 *                 title       : 'Not Started',
 *                 dockedItems : {
 *                     xtype   : 'container',
 *                     dock    : 'bottom',
 *                     layout  : 'fit',
 *                     ...
 *                 }
 *             },
 *             {
 *                 state : 'InProgress',
 *                 title : 'In Progress'
 *             },
 *             {
 *                 xtype    : 'container',
 *                 flex     : 1,
 *                 layout   : { type : 'vbox', align : 'stretch' },
 *                 defaults : { xtype : 'taskcolumn', flex : 1 },
 *                 items    : [
 *                     {
 *                         state : 'Test',
 *                         title : 'Test'
 *                     },
 *                     {
 *                         state     : 'Acceptance',
 *                         title     : 'Acceptance',
 *
 *                         // Column-level zoom setting
 *                         zoomLevel : 'mini'
 *                     }
 *                 ]
 *             },
 *             {
 *                 state : 'Done',
 *                 title : 'Done'
 *             }
 *         ]
 *     });
 *
 * {@img taskboard/images/board.png 2x}
 *
 * You can of course also subclass this class like you would with any other Ext JS class and provide your own custom behavior.
 * Make sure to also study the other classes used by this component, the various store, model and UI classes.
 */
Ext.define('Kanban.view.TaskBoard', {
    extend: 'Ext.Panel',
    alias: 'widget.taskboard',
    requires: [
        "Sch.patches.View",
        "Kanban.patch.EXTJS_23846",
        "Kanban.locale.En",
        "Kanban.data.TaskStore",
        "Kanban.data.ResourceStore",
        "Kanban.view.TaskColumn",
        "Kanban.dd.DropZone",
        "Kanban.dd.DragZone",
        "Kanban.editor.SimpleEditor",
        "Kanban.field.AddNew",
        "Kanban.menu.UserMenu",
        "Kanban.menu.TaskMenu",
        "Kanban.selection.TaskModel"
    ],
    border: false,
    layout: {
        type: 'hbox',
        align: 'stretch'
    },
    defaultType: 'taskcolumn',
    // BEGIN PANEL SPECIFIC PROPERTIES
    config: {
        /**
         * @cfg {Kanban.data.TaskStore} taskStore (required) The store containing the tasks
         */
        taskStore: null,
        /**
         * @cfg {Kanban.data.ResourceStore} resourceStore The store containing the resources that can be assigned to tasks.
         */
        resourceStore: {
            type: 'kanban_resourcestore'
        }
    },
    /**
     * @cfg {Boolean} fitColumns Set to 'false' to make container scroll the content
     * */
    fitColumns: true,
    /**
     * @cfg {Object} dragZoneConfig A config object to apply to the DragZone used by the TaskBoard
     * */
    dragZoneConfig: null,
    /**
     * @cfg {Object} dropZoneConfig A config object to apply to the DropZone used by the TaskBoard
     * */
    dropZoneConfig: null,
    /**
     * @cfg {String} columnClass The class to use to instantiate the columns making up the task board. You can subclass
     * the default class and provide your own custom functionality by using this config property.
     * */
    columnClass: 'Kanban.view.TaskColumn',
    /**
     * @cfg {Kanban.view.TaskColumn[]} columns An array of {@link Kanban.view.TaskColumn} objects defining the various states of the tasks
     * in the board.
     * */
    columns: null,
    /**
     * @cfg {Object} columnConfigs An object containing configuration objects for individual TaskColumns. To set properties for the 'NotStarted' column,
     *               see the example below.
     *
     columnConfigs : {
        // Applied to all columns
        all : {
            iconCls : 'sch-header-icon'
        },

        "NotStarted" : {
            border : false
        }
    }
     * You can configure any columns matching the possible states defined in the TaskModel. Only relevant when not specifying the {@link columns} config option.
     * in the board.
     * */
    columnConfigs: null,
    /**
     * @cfg {Object} editor An array of objects containing configuration options for the columns which are automatically created based on
     * the possible states defined in the TaskModel. Only relevant when not specifying the {@link columns} config option.
     * in the board.
     * */
    editor: null,
    /**
     * @cfg {Object} viewConfig A custom config object that will be passed to each underlying {@link Ext.view.View} instance (one inside each state column)
     * */
    viewConfig: null,
    /**
     * @cfg {Boolean} enableUserMenu true to show a menu when clicking the user of a task.
     */
    enableUserMenu: true,
    /**
     * @cfg {Boolean} readOnly true to not allow editing or moving of tasks.
     * */
    readOnly: false,
    /**
     * @cfg {Ext.menu.Menu} userMenu A menu used to edit the assigned user for a task
     * */
    userMenu: null,
    /**
     * @cfg {Kanban.menu.TaskMenu/Object/Boolean} taskMenu Specify a menu for the task. A configuration will be passed to the {@link Kanban.view.TaskBoard#taskMenuClass}.
     *
     */
    taskMenu: true,
    /**
     * An empty function by default, but provided so that you can perform custom validation on
     * the tasks being dragged. This function is called after a drag and drop process to validate the operation.
     * To control what 'this' points to inside this function, use
     * {@link #validatorFnScope}.
     * @param {Kanban.model.Task[]} taskRecords an array containing the records being dragged
     * @param {String} newState The new state of the target task
     * @return {Boolean} true if the drop position is valid, else false to prevent a drop
     */
    dndValidatorFn: Ext.emptyFn,
    /**
     * @cfg {Object} validatorFnScope
     * The 'this' object to use for the {@link #dndValidatorFn} function
     */
    validatorFnScope: null,
    /**
     * @cfg {String} zoomLevel The size of the rendered tasks. Can also be controlled on a per-column level, see {@link Kanban.view.Column#zoomLevel}.
     * Options: ['large', 'medium', 'small', 'mini']
     * */
    zoomLevel: 'large',
    /**
     *  @cfg {Boolean} destroyStore True to destroy all stores used by this component when it's destroyed
     */
    destroyStores: false,
    /**
     *  @cfg {Boolean} enableClipboard True to allow user to copy/cut/paste selected tasks using standard keyboard shortcuts
     */
    enableClipboard: false,
    // EOF PANEL SPECIFIC PROPERTIES
    // Private properties
    taskCls: 'sch-task',
    taskSelector: '.sch-task',
    isHighlighting: false,
    views: null,
    kanbanColumns: null,
    selModel: null,
    clipboard: null,
    // EOF Private properties
    /**
     * @event taskclick
     * Fires when clicking a task
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The clicked task root HTMLElement
     * @param {Ext.EventObject} event The event object
     */
    /**
     * @event taskdblclick
     * Fires when double clicking a task
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The clicked task root HTMLElement
     * @param {Ext.EventObject} event The event object
     */
    /**
     * @event taskcontextmenu
     * Fires when right clicking a task
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The clicked task root HTMLElement
     * @param {Ext.EventObject} event The event object
     */
    /**
     * @event taskmouseenter
     * Fires when the mouse moves over a task.
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The hovered HTMLElement
     * @param {Ext.EventObject} event The event object
     */
    /**
     * @event taskmouseleave
     * Fires when the mouse leaves a task DOM node.
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The HTMLElement
     * @param {Ext.EventObject} event The event object
     */
    /**
     * @event taskkeydown
     * Fires when a keydown event happens on a task DOM node.
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The HTMLElement
     * @param {Ext.EventObject} event The event object
     */
    /**
     * @event taskkeyup
     * Fires when a keyup event happens on a task DOM node.
     * @param {Ext.view.View} view The DataView object
     * @param {Kanban.model.Task} task The task model
     * @param {HTMLElement} taskNode The HTMLElement
     * @param {Ext.EventObject} event The event object
     */
    initComponent: function() {
        var me = this;
        me.defaults = me.defaults || {};
        Ext.applyIf(me.defaults, {
            margin: 12
        });
        me.taskStore = Ext.data.StoreManager.lookup(me.taskStore);
        me.resourceStore = Ext.data.StoreManager.lookup(me.resourceStore);
        me.addCls('sch-taskboard');
        me.addBodyCls('sch-taskboard-body');
        if (!me.fitColumns) {
            me.addCls('sch-taskboard-scrollable');
            me.setScrollable('x');
            me.setLayout('auto');
        }
        var bindConfig = me.getConfig('bind');
        // If these configs are bound, we need to create empty stores, because those values will be applied
        // after render. So we need reliable setters for me stores.
        if (bindConfig) {
            if (bindConfig.taskStore) {
                me.taskStore = new Kanban.data.TaskStore();
            }
            if (bindConfig.resourceStore) {
                me.resourceStore = new Kanban.data.ResourceStore();
            }
        }
        me.taskStore = Ext.data.StoreManager.lookup(me.taskStore);
        me.resourceStore = Ext.data.StoreManager.lookup(me.resourceStore);
        me.on({
            add: me.onColumnsAdded,
            remove: me.onColumnsRemoved,
            scope: me
        });
        if (!me.columns) {
            me.columns = me.createColumns();
        } else {
            me.columns = Ext.clone(me.columns);
            me.initColumns(me.columns);
        }
        me.items = me.columns;
        if (!me.taskStore) {
            throw 'Must define a taskStore for the Panel';
        }
        if (!me.resourceStore) {
            throw 'Must define a resourceStore for the Panel';
        }
        me.callParent(arguments);
        me.bindResourceStore(me.resourceStore, true);
    },
    setTaskStore: function(store) {
        this.taskStore = Ext.StoreManager.lookup(store);
        this.taskStore.setResourceStore(this.getResourceStore());
        this.rendered && this.forEachColumn(function(column) {
            column.bindStore(new Kanban.data.ViewStore({
                masterStore: this.taskStore,
                state: column.state
            }));
        });
    },
    setResourceStore: function(store) {
        this.bindResourceStore(store);
    },
    createColumns: function() {
        var me = this;
        var states = me.taskStore.model.prototype.states;
        var colConfigs = me.columnConfigs || {};
        return Ext.Array.map(states, function(state, index) {
            return Ext.create(me.columnClass, Ext.apply({
                state: state,
                viewConfig: me.viewConfig,
                zoomLevel: me.zoomLevel,
                layout: me.fitColumns ? 'fit' : 'auto',
                manageHeight: !me.fitColumns
            }, Ext.apply(colConfigs[state] || {}, colConfigs.all)));
        });
    },
    initColumns: function(columns) {
        var me = this;
        Ext.Array.forEach(columns, function(column) {
            if (column.items) {
                me.initColumns(column.items);
            } else {
                Ext.applyIf(column, {
                    viewConfig: me.viewConfig
                });
            }
        }, this);
    },
    onColumnsAdded: function(me, component) {
        var columns = component instanceof Kanban.view.TaskColumn ? [
                component
            ] : component.query('taskcolumn');
        Ext.Array.forEach(columns, function(col) {
            col.bindStore(new Kanban.data.ViewStore({
                masterStore: this.taskStore,
                state: col.state
            }));
            this.bindViewListeners(col.view);
            // we only need to add columns and views to lists when they are being added after component is rendered
            // this listener will be invoked before we fill these properties, we can skip this part for now
            this.kanbanColumns && this.kanbanColumns.push(col);
            this.views && this.views.push(col.view);
        }, this);
    },
    onColumnsRemoved: function(me, component) {
        var column = component instanceof Kanban.view.TaskColumn && component;
        Ext.Array.remove(this.kanbanColumns, column);
        Ext.Array.remove(this.views, column.view);
    },
    afterRender: function() {
        this.callParent(arguments);
        if (!this.isReadOnly()) {
            this.setupDragDrop();
            this.initEditor();
            this.initTaskMenu();
            if (this.enableUserMenu && this.userMenu) {
                this.initUserMenu();
            }
        }
        this.views = this.query('taskview');
        this.kanbanColumns = this.query('taskcolumn');
        this.on('taskclick', this.onTaskClick, this);
        if (this.enableClipboard) {
            this.getEl().on({
                keydown: this.onKeyDown,
                scope: this
            });
        }
    },
    onKeyDown: function(event) {
        var me = this;
        if (!event.ctrlKey) {
            return;
        }
        switch (event.browserEvent.key.toLowerCase()) {
            case 'c':
                // COPY
                me.copyTasksToClipboard();
                break;
            case 'v':
                // PASTE
                me.pasteTasks();
                break;
            case 'x':
                // CUT
                me.cutTasksToClipboard();
                break;
        }
    },
    copyTasksToClipboard: function() {
        var me = this;
        me.clipboard = me.getSelectedRecords();
        me.clipboard.copy = true;
    },
    cutTasksToClipboard: function() {
        var me = this;
        me.clipboard = me.getSelectedRecords();
        me.clipboard.copy = false;
        me.clipboard.forEach(function(task) {
            var el = me.getElementForTask(task);
            el && el.addCls('sch-taskboard-cut-task');
        });
    },
    pasteTasks: function() {
        var me = this;
        var state = me.resolveState(document.activeElement);
        if (me.clipboard && state !== false) {
            me.clipboard.forEach(function(task) {
                task = me.clipboard.copy ? task.copy(null) : task;
                task.setState(state);
                if (me.clipboard.copy) {
                    me.taskStore.add(task);
                }
                var el = me.getElementForTask(task);
                el && el.removeCls('sch-taskboard-cut-task');
            });
        }
    },
    setReadOnly: function(readOnly) {
        this.readOnly = readOnly;
    },
    isReadOnly: function() {
        return this.readOnly;
    },
    bindViewListeners: function(view) {
        view.on({
            itemclick: this.getTaskListener('taskclick'),
            itemcontextmenu: this.getTaskListener('taskcontextmenu'),
            itemdblclick: this.getTaskListener('taskdblclick'),
            itemmouseenter: this.getTaskListener('taskmouseenter'),
            itemmouseleave: this.getTaskListener('taskmouseleave'),
            itemkeydown: this.getTaskListener('taskkeydown'),
            itemkeyup: this.getTaskListener('taskkeyup'),
            scope: this
        });
    },
    setupDragDrop: function() {
        var me = this;
        var ddGroup = 'kanban-dd-' + me.id,
            ddEl = me.el;
        me.dragZone = new Kanban.dd.DragZone(me.body.id, Ext.apply({
            panel: me,
            containerScroll: !me.fitColumns,
            ddGroup: ddGroup
        }, me.dragZoneConfig));
        me.dropZone = new Kanban.dd.DropZone(me.body.id, Ext.apply({
            panel: me,
            validatorFn: me.dndValidatorFn,
            validatorFnScope: me.validatorFnScope,
            ddGroup: ddGroup
        }, me.dropZoneConfig));
        me.relayEvents(me.dragZone, [
            /**
             * @event beforetaskdrag
             * Fires before a drag-drop operation is initiated, return false to cancel it
             * @param {Kanban.dd.DragZone} drag zone The drag zone
             * @param {Kanban.model.Task} task The task corresponding to the HTML node that's about to be dragged
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskdrag',
            /**
             * @event taskdragstart
             * Fires when a drag-drop operation starts
             * @param {Kanban.dd.DragZone} drag zone The drag zone
             * @param {Kanban.model.Task[]} task The tasks being dragged
             */
            'taskdragstart',
            'aftertaskdrop'
        ]);
        this.relayEvents(this.dropZone, [
            /**
             * @event beforetaskdropfinalize
             * Fires before a succesful drop operation is finalized. Return false to finalize the drop at a later time.
             * To finalize the operation, call the 'finalize' method available on the context object. Pass `true` to it to accept drop or false if you want to cancel it
             * NOTE: you should **always** call `finalize` method whether or not drop operation has been canceled
             * @param {Ext.dd.DropZone} drop zone The drop zone
             * @param {Object} dragContext An object containing 'taskRecords', 'newState' and 'finalize' properties.
             * @param {Ext.EventObject} e The event object
             */
            'beforetaskdropfinalize',
            /**
             * @event taskdrop
             * Fires after a succesful drag and drop operation
             * @param {Ext.dd.DropZone} drop zone The drop zone
             * @param {Kanban.model.Task[]} task The tasks being dragged
             */
            'taskdrop',
            /**
             * @event aftertaskdrop
             * Fires after a drag n drop operation, even when drop was performed on an invalid location
             * @param {Ext.dd.DropZone} drop zone The drop zone
             */
            'aftertaskdrop'
        ]);
        this.dropZone.on('aftertaskdrop', this.onAfterTaskDrop, this);
        this.dragZone.on('taskdragstarting', this.onDragStarting, this);
    },
    resolveState: function(el) {
        // HACK: If you drag the task bar outside the IE window or iframe it crashes (missing e.target)
        if (Ext.isIE && !el) {
            el = document.body;
        }
        if (!el.dom) {
            var columnEl = Ext.fly(el);
            if (!columnEl.is('.sch-taskview')) {
                columnEl = columnEl.up('.sch-taskview');
            }
            if (columnEl && columnEl.component) {
                return columnEl.component.state;
            }
        }
        return false;
    },
    setZoomLevel: function(level) {
        this.translateToColumns('setZoomLevel', [
            level
        ]);
    },
    // Will simply return the zoom level of the first scrum column
    getZoomLevel: function() {
        return this.down('taskcolumn').getZoomLevel();
    },
    initEditor: function() {
        if (this.editor) {
            if (!this.editor.isComponent) {
                this.editor = Ext.widget(this.editor);
            }
            this.editor.init(this);
        }
    },
    initUserMenu: function() {
        if (!(this.userMenu instanceof Ext.Component)) {
            this.userMenu = Ext.ComponentManager.create(this.userMenu);
        }
        this.el.on({
            click: this.onUserImgClick,
            delegate: '.sch-user-avatar',
            scope: this
        });
    },
    initTaskMenu: function() {
        if (this.taskMenu) {
            var taskMenu = typeof this.taskMenu === 'boolean' ? {
                    xtype: 'kanban_taskmenu'
                } : this.taskMenu;
            if (Ext.isArray(taskMenu)) {
                taskMenu = {
                    items: taskMenu
                };
            }
            taskMenu.taskBoard = this;
            if (!taskMenu.isTaskMenu) {
                this.taskMenu = Ext.widget(Ext.applyIf(taskMenu, {
                    xtype: 'kanban_taskmenu'
                }));
            }
            this.taskMenu.registerListeners();
            this.addCls('sch-taskboard-with-menu');
        }
    },
    onUserImgClick: function(e, t) {
        e.stopEvent();
        if (!this.isReadOnly()) {
            this.userMenu.showForTask(this.resolveRecordByNode(t), e.getXY());
        }
    },
    resolveViewByNode: function(node) {
        var viewEl = Ext.fly(node).up('.sch-taskview');
        return (viewEl && Ext.getCmp(viewEl.id)) || null;
    },
    resolveRecordByNode: function(node) {
        var view = this.resolveViewByNode(node);
        return (view && view.getRecord(view.findItemByChild(node))) || null;
    },
    // Clear selections in other views if CTRL is not clicked
    onTaskClick: function(view, record, item, event) {
        if (!event.ctrlKey) {
            this.deselectAllInOtherViews(view);
        }
    },
    deselectAllInOtherViews: function(view) {
        this.getSelectionModel().deselectAllInOtherSelectionModels(view.getSelectionModel());
    },
    // record or id
    getElementForTask: function(task) {
        if (!(task instanceof Ext.data.Model))  {
            task = this.taskStore.getById(task);
        }
        
        var state = task.getState();
        if (state) {
            return Ext.get(this.getViewForState(state).getNode(task));
        }
    },
    getViewForState: function(state) {
        return this.down('taskview[state=' + [
            state
        ] + ']');
    },
    forEachColumn: function(fn, scope) {
        Ext.Array.each(this.query('taskcolumn'), fn, scope || this);
    },
    translateToViews: function(method, args) {
        Ext.Array.map(this.views, function(view) {
            return view[method].apply(view, args || []);
        });
    },
    translateToColumns: function(method, args) {
        Ext.Array.map(this.kanbanColumns, function(col) {
            return col[method].apply(col, args || []);
        });
    },
    translateToSelectionModels: function(method, args) {
        Ext.Array.map(this.views, function(view) {
            var sm = view.getSelectionModel();
            sm[method].apply(sm, args || []);
        });
    },
    getSelectedRecords: function() {
        return [].concat.apply([], Ext.Array.map(this.views, function(view) {
            return view.getSelectionModel().getSelection();
        }));
    },
    selectAll: function() {
        this.getSelectionModel().selectAll();
    },
    deselectAll: function() {
        this.getSelectionModel().deselectAll();
    },
    onDestroy: function() {
        Ext.destroy(this.dragZone, this.dropZone, this.userMenu, this.taskMenu, this.editor);
        this.clipboard = null;
        if (this.destroyStores) {
            this.taskStore.destroy();
            this.resourceStore.destroy();
        }
    },
    // private
    getTaskListener: function(eventName) {
        return function(view, record, item, index, event) {
            this.fireEvent(eventName, view, record, item, event);
        };
    },
    /**
     * Highlights tasks in the board based on a callback function.
     * @param {Function} callback A function returning true (to indicate a match) or false
     * @param {Object} scope Scope for callback
     * @return {Object} The 'this' object to use for the callback. Defaults to the panel instance.
     */
    highlightTasksBy: function(callback, scope) {
        if (!this.isHighlighting) {
            this.el.addCls('sch-taskboard-filtered');
            this.isHighlighting = true;
        }
        // Clear old matches first
        this.el.select('.sch-filter-match').removeCls('sch-filter-match');
        for (var i = 0,
            l = this.taskStore.getCount(); i < l; i++) {
            var rec = this.taskStore.getAt(i);
            if (callback.call(scope || this, rec)) {
                var el = this.getElementForTask(rec);
                if (el) {
                    el.addCls('sch-filter-match');
                }
            }
        }
    },
    /**
     * Clears any highlighted tasks.
     */
    clearHighlight: function() {
        this.isHighlighting = false;
        this.el.removeCls('sch-taskboard-filtered');
        this.el.select('.sch-filter-match').removeCls('sch-filter-match');
    },
    /**
     * Refreshes all the task columns manually, which can be useful after performing lots of data operations or changes.
     */
    refresh: function() {
        this.translateToViews('refresh');
        this.fireEvent('refresh', this);
    },
    /**
     * Refreshes the element of a single the task record.
     * @param {Kanban.model.Task} task the task record
     */
    refreshTaskNode: function(task) {
        var node = this.getElementForTask(task);
        if (node) {
            var view = this.resolveViewByNode(node);
            view.refreshNode(task);
        }
    },
    bindResourceStore: function(store, suppressRefresh) {
        var listeners = {
                update: this.onResourceStoreUpdate,
                refresh: this.onResourceStoreRefresh,
                remove: this.onResourceStoreRemove,
                scope: this
            };
        if (this.resourceStore) {
            this.mun(this.resourceStore, listeners);
        }
        if (store) {
            store = Ext.data.StoreManager.lookup(store);
            this.mon(store, listeners);
            this.taskStore && this.taskStore.setResourceStore(store);
            if (!suppressRefresh && this.rendered) {
                this.refresh();
            }
        }
        this.resourceStore = store;
    },
    onResourceStoreUpdate: function() {
        // can be done cheaper
        if (this.rendered) {
            this.refresh();
        }
    },
    onResourceStoreRefresh: function() {
        // can be done cheaper
        if (this.rendered) {
            this.refresh();
        }
    },
    onResourceStoreRemove: function() {
        // can be done cheaper
        if (this.rendered) {
            this.refresh();
        }
    },
    // clear selections if user is not multi selecting
    onDragStarting: function(dz, task, e) {
        var view = this.getViewForState(task.getState());
        if (!e.ctrlKey) {
            this.deselectAll();
        }
    },
    onAfterTaskDrop: function() {
        this.getSelectionModel().deselectAll();
    },
    /**
     * Returns the task menu instance (if the task board was configured to use one).
     * @return {Kanban.menu.TaskMenu}
     */
    getTaskMenu: function() {
        return this.taskMenu;
    },
    /**
     * Returns the task store instance associated with the task board.
     * @return {Kanban.data.TaskStore}
     */
    getTaskStore: function() {
        return this.taskStore;
    },
    /**
     * Returns the resource store instance associated with the task board.
     * @return {Kanban.data.ResourceStore}
     */
    getResourceStore: function() {
        return this.resourceStore;
    },
    /**
     * Returns the task editor associated with the task board.
     * @return {Ext.Component}
     */
    getTaskEditor: function() {
        return this.editor;
    },
    /**
     * Returns the selection model associated with the task board.
     * @return {Kanban.selection.TaskModel}
     */
    getSelectionModel: function() {
        if (!this.selModel) {
            this.selModel = this.createSelectionModel();
        }
        return this.selModel;
    },
    createSelectionModel: function() {
        var selModel = new Kanban.selection.TaskModel({
                panel: this
            });
        this.relayEvents(selModel, [
            /**
             * @event deselect
             * Fired after a task record is deselected
             * @param {Ext.selection.DataViewModel} this
             * @param  {Kanban.model.Task} record The deselected record
             */
            'deselect',
            /**
             * @event select
             * Fired after a task record is selected
             * @param {Ext.selection.DataViewModel} this
             * @param  {Kanban.model.Task} record The selected record
             */
            'select'
        ]);
        return selModel;
    }
}, function() {
    Ext.apply(Kanban, {
        VERSION: '2.0.31',
        LICENSE: '%LICENSE%'
    });
});

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
    extend: 'Sch.model.Customizable',
    idProperty: 'Id',
    isAssignmentModel: true,
    customizableFields: [
        /**
         * @field Id
         * The id of the assignment
         */
        /**
         * @field
         * The id of the resource assigned
         */
        {
            name: 'ResourceId'
        },
        /**
         * @field
         * The id of the event to which the resource is assigned
         */
        {
            name: 'EventId'
        }
    ],
    /**
     * @cfg {String} resourceIdField The name of the field identifying the resource to which an assignment belongs.
     * Defaults to "ResourceId".
     */
    resourceIdField: 'ResourceId',
    /**
     * @cfg {String} eventIdField The name of the field identifying an event to which an assignment belongs.
     * Defaults to "EventId".
     */
    eventIdField: 'EventId',
    getInternalId: function() {
        return this.internalId;
    },
    /**
     * Returns an assigment store this assignment is part of. Assignment must be part of an assigment store
     * to be able to retrieve it.
     *
     * @return {Sch.data.AssignmentStore|null}
     */
    getAssignmentStore: function() {
        return this.joined && this.joined[0];
    },
    /**
     * Returns an event store this assignment uses as default event store. Assignment must be part
     * of an assignment store to be able to retrieve default event store.
     *
     * @return {Sch.data.EventStore|null}
     */
    getEventStore: function() {
        var assignmentStore = this.getAssignmentStore();
        return assignmentStore && assignmentStore.getEventStore();
    },
    /**
     * Returns a resource store this assignment uses as default resource store. Assignment must be part
     * of an assignment store to be able to retrieve default resource store.
     *
     * @return {Sch.data.ResourceStore|null}
     */
    getResourceStore: function() {
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
    getEventName: function(eventStore) {
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
    getResourceName: function(resourceStore) {
        var resource = this.getResource(resourceStore);
        return resource && resource.getName() || '';
    },
    /**
     * Returns true if the Assignment can be persisted (e.g. task and resource are not 'phantoms')
     *
     * @return {Boolean} true if this model can be persisted to server.
     */
    isPersistable: function() {
        var me = this,
            event = me.getEvent(),
            resource = me.getResource();
        return event && !event.phantom && resource && !resource.phantom;
    },
    fullCopy: function() {
        return this.copy.apply(this, arguments);
    },
    // private
    getEventResourceCompositeKey: function() {
        var me = this;
        return me.self.makeAssignmentEventResourceCompositeKey(me.getEventId(), me.getResourceId());
    },
    inheritableStatics: {
        makeAssignmentEventResourceCompositeKey: function() {
            var arr = [];
            return function(eventId, resourceId) {
                arr.length = 0;
                arr.push('event(', eventId, ')-resource(', resourceId, ')');
                return arr.join('');
            };
        }()
    }
});

