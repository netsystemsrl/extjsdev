/**

 @class Sch.mixin.SchedulerView

 A mixin for {@link Ext.view.View} classes, providing "scheduling" functionality to the consuming view. A consuming class
 should have already consumed the {@link Sch.mixin.TimelineView} mixin.

 Generally, should not be used directly, if you need to subclass the view, subclass the {@link Sch.view.SchedulerGridView} instead.

 */
Ext.define('Sch.mixin.SchedulerView', {
    extend : 'Sch.mixin.AbstractSchedulerView',

    mixins : ['Sch.mixin.Localizable'],

    requires : [
        'Sch.patches.BoundList',
        'Sch.patches.DragDropManager',
        'Sch.patches.NavigationModel',
        'Sch.patches.NavigationModel6_0_2',
        'Sch.feature.DragCreator',
        'Sch.feature.DragDrop',
        'Sch.feature.ResizeZone',
        'Sch.column.Resource',
        'Sch.column.Day',
        'Sch.view.WeekView',
        'Ext.Factory',
        'Ext.XTemplate'
    ],

    /**
     * @property {Sch.feature.SchedulerDragZone} eventDragZone
     * Accessor to the event dragzone (available only if the drag drop feature is enabled)
     */

    /**
     * @cfg {String} eventResizeHandles Defines which resize handles to use. Possible values: 'none', 'start', 'end', 'both'. Defaults to 'end'
     */
    eventResizeHandles : 'end',

    /**
     * An empty function by default, but provided so that you can perform custom validation on
     * the item being dragged. This function is called during a drag and drop process and also after the drop is made.
     * To control what 'this' points to inside this function, use
     * {@link Sch.panel.TimelineGridPanel#validatorFnScope} or {@link Sch.panel.TimelineTreePanel#validatorFnScope}.
     * @param {Sch.model.Event[]} dragRecords an array containing the records for the events being dragged
     * @param {Sch.model.Resource} targetResourceRecord the target resource of the the event
     * @param {Date} date The date corresponding to the drag proxy position
     * @param {Number} duration The duration of the item being dragged in milliseconds
     * @param {Event} e The event object
     * @return {Boolean/Object} true if the drop position is valid, else false to prevent a drop. Or return an object containing a 'valid' boolean and a 'message' string.
     */
    dndValidatorFn : Ext.emptyFn,

    /**
     * An empty function by default, but provided so that you can perform custom validation on
     * an item being resized. To control what 'this' points to inside this function, use
     * {@link Sch.panel.TimelineGridPanel#validatorFnScope} or {@link Sch.panel.TimelineTreePanel#validatorFnScope}.
     * @param {Sch.model.Resource} resourceRecord the resource of the row in which the event is located
     * @param {Sch.model.Event} eventRecord the event being resized
     * @param {Date} startDate
     * @param {Date} endDate
     * @param {Event} e The event object
     * @return {Boolean/Object} true if the resize state is valid, else false to prevent the action. Or return an object containing a 'valid' boolean and a 'message' string.
     */
    resizeValidatorFn : Ext.emptyFn,

    /**
     * An empty function by default, but provided so that you can perform custom validation on the item being created.
     * To control what 'this' points to inside this function, use
     * {@link Sch.panel.TimelineGridPanel#validatorFnScope} or {@link Sch.panel.TimelineTreePanel#validatorFnScope}.
     * @param {Sch.model.Resource} resourceRecord the resource for which the event is being created
     * @param {Date} startDate
     * @param {Date} endDate
     * @param {Event} e The event object
     * @return {Boolean/Object} true if the state is valid, else false to prevent the action. Or return an object containing a 'valid' boolean and a 'message' string.
     */
    createValidatorFn : Ext.emptyFn,

    // Scheduled events: click events --------------------------
    /**
     * @event eventclick
     * Fires when an event is clicked
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} eventRecord The event record of the clicked event
     * @param {Ext.event.Event} e The event object
     */
    /**
     * @event eventlongpress
     * Fires when an event is longpressed
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} eventRecord The event record of the clicked event
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event eventmousedown
     * Fires when a mousedown event is detected on a rendered event
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} eventRecord The event record
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event eventmouseup
     * Fires when a mouseup event is detected on a rendered event
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} eventRecord The event record
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event eventdblclick
     * Fires when an event is double clicked
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} eventRecord The event record of the clicked event
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event eventcontextmenu
     * Fires when contextmenu is activated on an event
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} eventRecord The event record of the clicked event
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event eventmouseenter
     * Fires when the mouse moves over an event
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} eventRecord The event record
     * @param {Ext.event.Event} e The event object
     */
    /**
     * @event eventmouseout
     * Fires when the mouse moves out of an event
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} eventRecord The event record
     * @param {Ext.event.Event} e The event object
     */

    // Resizing events start --------------------------
    /**
     * @event beforeeventresize
     * @preventable
     * Fires before a resize starts, return false to stop the execution
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} record The record about to be resized
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event eventresizestart
     * Fires when resize starts
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} record The event record being resized
     */

    /**
     * @event eventpartialresize
     * Fires during a resize operation and provides information about the current start and end of the resized event
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} record The event record being resized
     * @param {Date} startDate The new start date of the event
     * @param {Date} endDate The new end date of the event
     * @param {Ext.Element} element The proxy element being resized
     */

    /**
     * @event beforeeventresizefinalize
     * @preventable
     * Fires before a successful resize operation is finalized. Return false from a listener function to prevent the finalizing to
     * be done immedieately, giving you a chance to show a confirmation popup before applying the new values.
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Object} resizeContext An object containing, 'start', 'end', 'newResource' properties.
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event eventresizeend
     * Fires after a successful resize operation
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} record The updated event record
     */

    /**
     * @event aftereventresize
     * Always fires after a resize operation
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} record The updated event record
     */
    // Resizing events end --------------------------

    // Dnd events start --------------------------
    /**
     * @event beforeeventdrag
     * @preventable
     * Fires before a dnd operation is initiated, return false to cancel it
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} record The record corresponding to the node that's about to be dragged
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event eventdragstart
     * Fires when a dnd operation starts
     * @param {Sch.mixin.SchedulerView} scheduler The scheduler object
     * @param {Sch.model.Event[]} records The event records being dragged including related records
     */

    /**
     * @event beforeeventdropfinalize
     * @preventable
     * Fires before a successful drop operation is finalized.
     * @param {Sch.mixin.SchedulerView} scheduler The scheduler object
     * @param {Object} dragContext An object containing, 'start', 'end', 'newResource' properties.
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event eventdrop
     * Fires after a successful drag and drop operation
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event[]} records The affected records (if copies were made, they were inserted into the store)
     * @param {Boolean} isCopy True if the records were copied instead of moved
     */

    /**
     * @event aftereventdrop
     * Fires when after a drag n drop operation, even when drop was performed on an invalid location
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event[]} records The affected records
     */
    // Dnd events end --------------------------

    // Drag create events start --------------------------
    /**
     * @event beforedragcreate
     * @preventable
     * Fires before a drag starts, return false to stop the execution
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Resource} resource The resource record
     * @param {Date} date The clicked date on the timeaxis
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event dragcreatestart
     * Fires when a drag is starting
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Ext.Element} el The proxy element
     */

    /**
     * @event beforedragcreatefinalize
     * @preventable
     * Fires before a successful resize operation is finalized. Return false from a listener function to prevent the finalizing to
     * be done immedieately, giving you a chance to show a confirmation popup before applying the new values.
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Object} createContext An object containing, 'start', 'end', 'resourceRecord' properties.
     * @param {Ext.event.Event} e The event object
     * @param {Ext.Element} el The proxy element
     */

    /**
     * @event dragcreateend
     * Fires after a successful drag-create operation
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} newEventRecord The newly created event record (added to the store in onEventCreated method)
     * @param {Sch.model.Resource} resource The resource record to which the event belongs
     * @param {Ext.event.Event} e The event object
     * @param {Ext.Element} el The proxy element
     */

    /**
     * @event afterdragcreate
     * Always fires after a drag-create operation
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Ext.Element} el The proxy element
     */
    // Drag create events end --------------------------

    /**
     * @event beforeeventadd
     * @preventable
     * Fires after a successful drag-create operation, before the new event is added to the store. Return false to prevent the event from being added to the store.
     * @param {Sch.mixin.SchedulerView} view The scheduler view instance
     * @param {Sch.model.Event} newEventRecord The newly created event record
     * @param {Sch.model.Resource[]} resources The resources to which the event is assigned
     */

    /**
     * @event scheduleclick
     * Fires after a click on the schedule area
     * @param {Sch.mixin.SchedulerView} schedulerView The scheduler view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event scheduledblclick
     * Fires after a doubleclick on the schedule area
     * @param {Sch.mixin.SchedulerView} schedulerView The scheduler view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event schedulecontextmenu
     * Fires after a context menu click on the schedule area
     * @param {Sch.mixin.SchedulerView} schedulerView The scheduler view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @event schedulelongpress
     * Fires when a longpress on the schedule area
     * @param {Sch.mixin.SchedulerView} schedulerView The scheduler view object
     * @param {Date} clickedDate The clicked date
     * @param {Number} rowIndex The row index
     * @param {Sch.model.Resource} resource The resource, an event occured on
     * @param {Ext.event.Event} e The event object
     */

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - loadingText : 'Loading events...'
     */

    weekViewClass               : 'Sch.view.WeekView',
    lockedGridDependsOnSchedule : null,

    _initializeSchedulerView : function () {
        var me = this;

        me.callParent(arguments);

        if (!me.eventPrefix) {
            throw 'eventPrefix missing';
        }

        me.on({
            destroy     : me._destroy,
            afterrender : me._afterRender,
            itemupdate  : me.onRowUpdated,
            scope       : me
        });

        // https://www.assembla.com/spaces/bryntum/tickets/2567
        // Covered with tests/rendering/092_rowheight.t.js
        // Cache has to be cleared on time span change in order to draw correct row height for empty rows
        me.timeAxis.on('beginreconfigure', me.clearRowHeightCache, me);

        me.on({
            resourcestorechange   : me.clearRowHeightCache,
            assignmentstorechange : me.clearRowHeightCache,
            eventstorechange      : me.clearRowHeightCache,
            scope                 : me
        });
    },

    inheritables : function () {
        return {

            // Configuring underlying grid view
            loadingText     : this.L('loadingText'),
            overItemCls     : '',
            trackOver       : false,
            selectedItemCls : '', // We don't want row selection visible here
            // EOF: Configuring underlying grid view

            setReadOnly : function (readOnly) {
                var me = this;

                if (me.dragCreator) {
                    me.dragCreator.setDisabled(readOnly);
                }

                me.callParent(arguments);
            },

            repaintEventsForResource : function (resourceRecord, refreshSelections) {
                var me           = this,
                    isHorizontal = me.isHorizontal(),
                    // For vertical, we always repaint all events (do per-column repaint is not supported)
                    index        = isHorizontal ? me.indexOf(resourceRecord) : 0;

                if (isHorizontal) {
                    me.eventLayout.horizontal.clearCache(resourceRecord);
                }

                if (index >= 0) {
                    // HACK, Ext insists on performing layouts when refreshing a grid row.
                    // Prevent this, "should be" safe.
                    Ext.suspendLayouts();

                    // we operate "resourceRecord" here since "index" might be incorrect when grouping plugin is used
                    if (isHorizontal) {
                        me.refreshNode(resourceRecord);

                        if (me.lockedGridDependsOnSchedule) {
                            me.lockingPartner.refreshNode(resourceRecord);
                        }
                    }
                    // Use index here to keep vertical view only refreshing first row always
                    else {
                        me.refreshNode(index);
                    }

                    Ext.resumeLayouts();

                    if (refreshSelections) {
                        var sm     = me.getEventSelectionModel();
                        var events = me.getEventStore().getEventsForResource(resourceRecord);

                        Ext.Array.each(events, function (ev) {
                            sm.forEachEventRelatedSelection(ev, function (selectedRecord) {
                                me.onEventBarSelect(selectedRecord, true);
                            });
                        });
                    }
                }
            },

            repaintAllEvents : function () {
                if (this.isHorizontal()) {
                    this.refreshView();
                } else {
                    // All events are rendered in first row, no need to do a full refresh
                    this.refreshNode(0);
                }
            },


            handleScheduleEvent : function (e) {
                var te = e.getTarget('.' + this.eventCls, 3),
                    t  = !te && e.getTarget('.' + this.timeCellCls, 3);

                if (t) {
                    var clickedDate  = this.getDateFromDomEvent(e, 'floor');
                    var resourceNode = this.findRowByChild(t);
                    var index        = this.indexOf(resourceNode);

                    var resource = null;

                    // All Day Header uses fake resource store
                    if (!this.allDay) {
                        if (this.isHorizontal()) {
                            resource = this.getRecordForRowNode(resourceNode);
                        } else {
                            var cellNode = e.getTarget(this.timeCellSelector, 5);

                            if (cellNode) {
                                var cellIndex = typeof cellNode.cellIndex == 'number' ? cellNode.cellIndex : cellNode.getAttribute('data-cellIndex');
                                var header    = this.headerCt.getGridColumns()[cellIndex];

                                resource = header && header.model;
                            }
                        }
                    }

                    if (e.type.indexOf('pinch') >= 0) {
                        this.fireEvent('schedule' + e.type, this, e);
                    } else {
                        this.fireEvent('schedule' + e.type, this, clickedDate, index, resource, e);
                    }
                }
            },


            onEventDataRefresh : function () {
                this.clearRowHeightCache();
                this.callParent(arguments);
            },


            onUnbindStore : function (store) {
                store.un({
                    refresh : this.clearRowHeightCache,
                    clear   : this.clearRowHeightCache,
                    load    : this.clearRowHeightCache,

                    scope : this
                });
                this.callParent(arguments);
            },

            // our listeners must go before any other listeners, that's why we override the 'bindStore'
            // instead of `onBindStore`
            bindStore : function (store) {
                store && store.on({
                    refresh : this.clearRowHeightCache,
                    clear   : this.clearRowHeightCache,
                    load    : this.clearRowHeightCache,

                    scope : this
                });
                this.callParent(arguments);
            },

            refreshKeepingScroll : function () {
                if (this.rendered) {
                    this.lockingPartner.refreshView();
                    this.callParent(arguments);
                }
            }
        };
    },

    /**
     * Returns the selection model being used, and creates it via the configuration
     * if it has not been created already.
     * @return {Sch.selection.EventModel} selModel
     */
    getEventSelectionModel : function () {
        var me = this,
            mode;

        if (me.eventSelModel && me.eventSelModel.isSelectionModel) {
            return me.eventSelModel;
        }

        if (typeof me.eventSelModel === 'string') {
            me.eventSelModel = {
                type : me.eventSelModel
            };
        }

        if (me.simpleSelect) {
            mode = 'SIMPLE';
        } else if (me.multiSelect) {
            mode = 'MULTI';
        } else {
            mode = 'SINGLE';
        }

        me.eventSelModel = Ext.Factory.selection(Ext.apply({
            type          : me.eventSelModelType || (me.getEventStore().getAssignmentStore() ? 'assignmentmodel' : 'eventmodel'),
            mode          : mode,
            allowDeselect : me.allowDeselect || me.multiSelect,
            locked        : me.disableSelection
        }, me.eventSelModel));

        return me.eventSelModel;
    },

    _afterRender : function () {
        this.setEventStore(this.eventStore, true);

        this.getEventSelectionModel().bindToView(this);

        this.setupEventListeners();

        this.configureFunctionality();

        var resizer = this.headerCt.resizer;

        if (resizer) {
            resizer.doResize = Ext.Function.createSequence(resizer.doResize, this.afterHeaderResized, this);
        }

        // Delete the hoveredEventNode (last item we hovered over) so that after a drag drop the UI considers the
        // mouse to be over the current element
        this.on('itemupdate', function () {
            this.hoveredEventNode = null;
        });
    },

    // private, clean up
    _destroy : function () {
        this.setEventStore(null);
    },


    clearRowHeightCache : function () {
        if (this.isHorizontal()) {
            this.eventLayout.horizontal.clearCache();
        }
    },


    configureFunctionality : function () {
        var me      = this,
            vfScope = me.validatorFnScope || me;

        if (me.eventResizeHandles !== 'none' && Sch.feature.ResizeZone) {
            me.resizePlug = new Sch.feature.ResizeZone(Ext.applyIf({
                schedulerView : me,

                validatorFn : function (resourceRecord, eventRecord, startDate, endDate) {
                    // For weekview, target resource contains the start/end times - ignore it
                    if (!(resourceRecord instanceof Sch.model.Resource)) {
                        resourceRecord = null;
                    }

                    return (me.allowOverlap ||
                        me.isDateRangeAvailable(startDate, endDate, eventRecord, resourceRecord)) &&
                        me.resizeValidatorFn.apply(vfScope, arguments);
                },

                validatorFnScope : me
            }, me.resizeConfig || {}));
        }

        if (me.enableEventDragDrop !== false && Sch.feature.DragDrop) {
            var hasSplitPlugin = this.ownerGrid.findPlugin('scheduler_split');

            me.dragdropPlug = new Sch.feature.DragDrop(me, {
                validatorFn : function (dragRecords, targetResourceRecord, date, duration) {
                    // For weekview, target resource contains the start/end times - ignore it
                    if (!(targetResourceRecord instanceof Sch.model.Resource)) {
                        targetResourceRecord = null;
                    }

                    return (me.allowOverlap || me.isDateRangeAvailable(date, Sch.util.Date.add(date, Sch.util.Date.MILLI, duration), dragRecords[0], targetResourceRecord)) &&
                        me.dndValidatorFn.apply(vfScope, arguments);
                },

                validatorFnScope : me,
                targetEl         : hasSplitPlugin ? me.getEl() : me.ownerGrid.el,
                dragConfig       : me.dragConfig || {}
            });
        }

        if (me.enableDragCreation !== false) {
            me.dragCreator = Ext.create(Ext.apply(
                {
                    xclass : 'Sch.feature.DragCreator'
                },
                {
                    schedulerView    : me,
                    disabled         : me.readOnly,
                    validatorFn      : function (resourceRecord, startDate, endDate) {
                        // For weekview, target resource contains the start/end times - ignore it
                        if (!(resourceRecord instanceof Sch.model.Resource)) {
                            resourceRecord = null;
                        }
                        return (me.allowOverlap || me.isDateRangeAvailable(startDate, endDate, null, resourceRecord)) &&
                            me.createValidatorFn.apply(vfScope, arguments);
                    },
                    validatorFnScope : me
                },
                me.createConfig
            ));
        }

        if (me.createEventOnDblClick !== false) {
            me.on({
                scheduledblclick  : me.doCreateEventOnDblClick,
                schedulelongpress : me.doCreateEventOnDblClick,
                scope             : me
            });
        }
    },

    // ---------------------------------------
    // Interaction listeners

    doCreateEventOnDblClick : function (view, date, rowIndex, resource) {
        if (this.readOnly) return;

        var me          = this,
            mainSchView = view.allDay && view.ownerGrid.mainScheduler.getSchedulingView(),
            editor      = mainSchView ? mainSchView.getEventEditor() : me.getEventEditor(),
            eventStore  = view.getEventStore(),
            model       = eventStore.getModel(),
            data        = {};

        // prepare the model data
        data[model.prototype.startDateField]  = date;
        data[model.prototype.endDateField]    = Sch.util.Date.add(date, view.timeAxis.unit, 1);
        data[model.prototype.allDayField]     = Boolean(view.allDay);
        data[model.prototype.resourceIdField] = resource && resource.getId() || null;

        var record = Ext.create(model, data);

        me.onEventCreated(record, resource);

        if (editor) {
            editor.showRecord(record);
        } else {
            eventStore.add(record);
        }
    },

    onDragDropStart : function () {
        if (this.dragCreator) {
            this.dragCreator.setDisabled(true);
        }

        if (this.tip) {
            this.tip.hide();
            this.tip.disable();
        }

        if (this.overScheduledEventClass) {
            this.setMouseOverEnabled(false);
        }

        this.disableViewScroller(true);

        // To be able to refresh last hovered node
        this.hoveredEventNode = null;
    },

    onDragDropEnd : function () {
        if (this.dragCreator) {
            this.dragCreator.setDisabled(false);
        }

        if (this.tip) {
            this.tip.enable();
        }

        if (this.overScheduledEventClass) {
            this.setMouseOverEnabled(true);
        }

        this.disableViewScroller(false);
    },

    onBeforeDragCreate : function (s, resourceRecord, date, e) {
        return !this.readOnly && !e.ctrlKey;
    },

    onDragCreateStart : function () {
        if (this.overScheduledEventClass) {
            this.setMouseOverEnabled(false);
        }

        if (this.tip) {
            this.tip.hide();
            this.tip.disable();
        }

        // While dragging to create an event, we don't want the scroller to interfere
        this.disableViewScroller(true);
    },

    onDragCreateEnd : function (s, newEventRecord, resourceRecord) {
        // If an event editor is defined, it has to manage how/if/when the event is added to the event store
        if (!this.getEventEditor()) {
            // we may not have any resources if we're in weekview mode
            var resources = resourceRecord ? [resourceRecord] : [];

            if (this.fireEvent('beforeeventadd', this, newEventRecord, resources) !== false) {
                var eventStore        = this.getEventStore(),
                    isAutoSyncEnabled = eventStore.getAutoSync();

                if (isAutoSyncEnabled) {
                    eventStore.suspendAutoSync();
                }

                eventStore.append(newEventRecord);

                // In weekview mode both axes are time so resourceRecord is object {start: foo, end: bar}
                // so we do not need assign this resource to event
                if (!this.isWeekView()) {
                    newEventRecord.assign(resourceRecord);
                }

                this.onEventCreated(newEventRecord, resources);

                if (isAutoSyncEnabled) {
                    eventStore.resumeAutoSync(true);
                }
            }
        }

        if (this.overScheduledEventClass) {
            this.setMouseOverEnabled(true);
        }
    },

    // Empty but provided so that you can override it to supply default record values etc.
    onEventCreated : function (newEventRecord, resources) {
    },

    onAfterDragCreate : function () {
        if (this.overScheduledEventClass) {
            this.setMouseOverEnabled(true);
        }

        if (this.tip) {
            this.tip.enable();
        }

        this.disableViewScroller(false);
    },

    onBeforeResize : function () {
        return !this.readOnly;
    },

    onResizeStart : function () {
        if (this.tip) {
            this.tip.hide();
            this.tip.disable();
        }

        if (this.dragCreator) {
            this.dragCreator.setDisabled(true);
        }

        // While dragging to create an event, we don't want the scroller to interfere
        this.disableViewScroller(true);
    },

    onResizeEnd : function () {
        if (this.tip) {
            this.tip.enable();
        }

        if (this.dragCreator) {
            this.dragCreator.setDisabled(false);
        }

        // While dragging to create an event, we don't want the scroller to interfere
        this.disableViewScroller(false);
    },

    // EOF Interaction listeners
    // ---------------------------------------


    setupEventListeners : function () {
        this.on({
            eventdragstart : this.onDragDropStart,
            aftereventdrop : this.onDragDropEnd,

            beforedragcreate : this.onBeforeDragCreate,
            dragcreatestart  : this.onDragCreateStart,
            dragcreateend    : this.onDragCreateEnd,
            afterdragcreate  : this.onAfterDragCreate,

            beforeeventresize : this.onBeforeResize,
            eventresizestart  : this.onResizeStart,
            aftereventresize  : this.onResizeEnd,

            scope : this
        });
    },

    afterHeaderResized : function () {
        var resizer = this.headerCt.resizer;

        // if we perform resize on panel with forceFit cfg set to true events will be sized incorrectly
        if (resizer && !this.isHorizontal()) {
            // if forceFit is enabled columns cannot be resized
            if (this.panel.forceFit) {
                this.setColumnWidth(resizer.origWidth);
            } else {
                var w = resizer.dragHd.getWidth();
                this.setColumnWidth(w);
            }
        }
    },

    columnRenderer : function (val, meta, record, row, col) {
        return this[this.mode].columnRenderer(val, meta, record, row, col);
    },

    onRowUpdated : function (resourceRecord) {
        var me = this,
            nodes;

        // Only relevant for horizontal mode
        if (me.isHorizontal() && me.hasListener('eventrepaint')) {
            Ext.Array.each(resourceRecord.getEvents(), function (event) {
                nodes = me.getElementsFromEventRecord(event, resourceRecord, null, true);
                Ext.Array.each(nodes, function (node) {
                    me.fireEvent('eventrepaint', me, event, node);
                });
            });
        }
    },

    /**
     * Scrolls a resource event record into the viewport.
     *
     * If the resource store is a tree store, this method will also expand all relevant parent nodes
     * to locate the event.
     *
     * @param {Sch.model.Resource} resourceRec A resource record an event record is assigned to
     * @param {Sch.model.Event} eventRec    An event record to scroll into view
     * @param {Number} index                DOM node index, applicable only for weekview
     * @param {Boolean/Object} highlight    Either `true/false` or a highlight config object used to highlight the element after scrolling it into view
     * @param {Boolean/Object} animate      Either `true/false` or an animation config object used to scroll the element
     */
    scrollResourceEventIntoView : function (resourceRec, eventRec, index, highlight, animate, callback, scope) {
        // scrollResourceEventIntoView is not supported by All Day header
        if (this.allDay) return;

        var me         = this,
            ownerCmp   = me.up('timelinegrid,timelinetree'),
            eventStart = eventRec.getStartDate(),
            eventEnd   = eventRec.getEndDate(),
            currentTimeSpanRange,
            el;

        var doScroll = function () {
            // Establishing element to scroll to
            el = me.getElementsFromEventRecord(eventRec, resourceRec, index);
            el = el.length && el[0] || null; // In weekview there might be several elements correspond to resource/event pair.

            // it will be null if event is all day and it's placed in all day header only
            if (el) {
                // Scrolling with view with animation and highlighting if needed
                me.scrollElementIntoView(el, true, animate, highlight, null, callback, scope);
            }
        };

        var timeAxisToAdjust = me.timeAxis,
            // In case the event is all day and there is all day header, need to check the event within all day header, but change time span of main scheduler
            timeAxisToCheck  = eventRec.getAllDay && eventRec.getAllDay() && ownerCmp.allDayNormalHeader ? ownerCmp.allDayNormalHeader.getSchedulingView().timeAxis : timeAxisToAdjust;

        // Make sure event is within current time axis time span, inclusively for end date
        if (!timeAxisToCheck.dateInAxis(eventStart) || !timeAxisToCheck.dateInAxis(eventEnd, true)) {
            currentTimeSpanRange = timeAxisToAdjust.getEnd() - timeAxisToAdjust.getStart();
            timeAxisToAdjust.setTimeSpan(
                new Date(eventStart.getTime() - currentTimeSpanRange / 2),
                new Date(eventEnd.getTime() + currentTimeSpanRange / 2)
            );
            // HACK:
            // After a time axis change, the header is resized and Ext JS TablePanel reacts to the size change.
            // Ext JS reacts after a short delay, so we cancel this task to prevent Ext from messing up the scroll sync
            me.up('panel').scrollTask.cancel();
        }

        if (this.isHorizontal()) {
            var isTree = ownerCmp.store.isTreeStore;

            // Dealing with buffered rendering, making sure row is rendered
            ownerCmp.ensureVisible(isTree ? resourceRec.getPath() : resourceRec, {
                callback : function () {
                    doScroll();
                }
            });
        } else {
            doScroll();
        }
    }
});
