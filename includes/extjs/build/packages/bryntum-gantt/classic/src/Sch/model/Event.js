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
    extend : 'Sch.model.Range',

    uses : [
        'Sch.util.Date'
    ],

    idProperty : 'Id',

    mixins : ['Sch.model.mixin.RecurrableEvent'],

    isEventModel : true,

    customizableFields : [
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
        { name : 'IconCls' },
        /**
         * @field ResourceId
         * The id of the associated resource.
         */
        { name : 'ResourceId' },
        /**
         * @field Draggable
         * A field allowing you to easily control if an event can be dragged. (true or false)
         */
        { name : 'Draggable', type : 'boolean', persist : false, defaultValue : true },   // true or false
        /**
         * @field Resizable
         * A field allowing you to easily control how an event can be resized. Possible values are:
         *
         * - true - resize of both event start and end is allowed,
         * - false - resize of both event start and end is forbidden,
         * - 'start' - event start resize is allowed
         * - 'end' - event end resize is allowed
         */
        { name : 'Resizable', persist : false, defaultValue : true },                      // true, false, 'start' or 'end'
        /**
         * @field AllDay
         *
         * A field marking event as all day(s) spanning event
         */
        { name : 'AllDay', defaultValue : false }
    ],

    /**
     * @cfg {String} resourceIdField The name of the field identifying the resource to which an event belongs.
     */
    resourceIdField : 'ResourceId',

    /**
     * @cfg {String} draggableField The name of the field specifying if the event should be draggable in the timeline
     */
    draggableField : 'Draggable',

    /**
     * @cfg {String} resizableField The name of the field specifying if/how the event should be resizable.
     */
    resizableField : 'Resizable',

    /**
     * @cfg {String}
     * {@link #AllDay} field mapping.
     */
    allDayField : 'AllDay',

    /**
     * @cfg {String} iconClsField The name of the field specifying the icon CSS class for an event.
     */
    iconClsField : 'IconCls',

    getInternalId : function() {
        return this.internalId;
    },

    /**
     * @property isHighlighted Set to true to highligh event on render
     * @private
     */
    isHighlighted : false,

    /**
     * Returns an event store this event is part of. Event must be part
     * of an event store to be able to retrieve event store.
     *
     * @return {Sch.data.EventStore}
     */
    getEventStore : function() {
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
    getResourceStore : function() {
        var eventStore = this.getEventStore();
        return eventStore && eventStore.getResourceStore();
    },

    /**
     * Returns an assigment store this event uses as default assignment store. Event must be part
     * of an event store to be able to retrieve default assignment store.
     *
     * @return {Sch.data.AssignmentStore}
     */
    getAssignmentStore : function() {
        var eventStore = this.getEventStore();
        return eventStore && eventStore.getAssignmentStore();
    },

    /**
     * Returns all resources assigned to an event.
     *
     * @return {Sch.model.Resource[]}
     */
    getResources : function(eventStore) {
        var me = this;

        eventStore = eventStore || me.getEventStore();

        return eventStore && eventStore.getResourcesForEvent(me) || [];
    },

    /**
     * @private
     */
    forEachResource : function (fn, scope) {
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
    getResource : function (resourceId) {
        var me              = this,
            result          = null,
            eventStore      = me.getEventStore(),
            resourceStore   = eventStore && eventStore.getResourceStore();

        // Allow 0 as a valid resource id
        resourceId = resourceId == null ? me.getResourceId() : resourceId;

        if (eventStore && (resourceId === null || resourceId === undefined)) {
            result = eventStore.getResourcesForEvent(me);

            if (result.length == 1) {
                result = result[0];
            }
            else if (result.length > 1) {
                Ext.Error.raise("Event::getResource() is not applicable for events with multiple assignments, please use Event::getResources() instead.");
            }
            else {
                result = null;
            }
        }
        else if (resourceStore) {
            result = resourceStore.getModelById(resourceId);
        }

        return result;
    },

    /**
     * Sets the resource which the event should belong to.
     *
     * @param {Sch.model.Resource/Mixed} resource The new resource
     */
    setResource : function(resource) {
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
    assign : function(resource) {
        var me = this,
            eventStore = me.getEventStore();

        if (resource && resource.isResourceModel) {
            resource = resource.getId();
        }

        if (eventStore) {
            eventStore.assignEventToResource(me, resource);
        }
        else {
            me.setResourceId(resource);
        }
    },

    /**
     * Unassigns this event from the specified resources.
     *
     * @param {Sch.model.Resource/Mixed/Array} [resource] The resource (or list of resource) to unassign from.
     */
    unassign : function(resource) {
        var me = this,
            eventStore = me.getEventStore();

        if (resource && resource.isResourceModel) {
            resource = resource.getId();
        }

        if (eventStore) {
            eventStore.unassignEventFromResource(me, resource);
        }
        else if (me.getResourceId() == resource) {
            me.setResourceId(null);
        }
    },

    /**
     * Reassigns an event from an old resource to a new one.
     *
     * @param {Sch.model.Resource/Mixed} oldResource Old resource (or resource identifier) to unassign the event from.
     * @param {Sch.model.Resource/Mixed} newResource New resource (or resource identifier) to assign the event to.
     */
    reassign : function(oldResource, newResource) {
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
        }
        else {
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
    isAssignedTo : function(resource) {
        var me = this,
            eventStore = me.getEventStore(),
            result = false;

        if (resource && resource.isResourceModel) {
            resource = resource.getId();
        }

        if (eventStore) {
            result = eventStore.isEventAssignedToResource(me, resource);
        }
        else {
            result = me.getResourceId() == resource;
        }

        return result;
    },

    /**
     * Returns all assignments for the event. Event must be part of the store for this method to work.
     *
     * @return {Sch.model.Assignment[]}
     */
    getAssignments : function() {
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
    isDraggable : function () {
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
    isResizable : function () {
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
    isPersistable : function () {
        var me = this,
            eventStore = me.getEventStore();
        return eventStore && eventStore.isEventPersistable(me);
    },

    /**
     * Returns event start date. If event {@link #AllDay} flag is set then date time part will be cleared
     *
     * @return {Date}
     */
    getStartDate : function () {
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
    getEndDate : function () {
        var dt = this.data[this.endDateField];

        if (this.getAllDay()) {
            dt = this.statics().getAllDayEndDate(dt);
        }

        return dt;
    },

    inheritableStatics : {
        getAllDayStartDate : function (dt) {
            if (dt instanceof Sch.model.Event) {
                dt = dt.get(dt.startDateField);
            }

            if (dt) {
                dt = Sch.util.Date.clearTime(dt, true);
            }

            return dt;
        },

        getAllDayEndDate : function (dt) {
            if (dt instanceof Sch.model.Event) {
                dt = dt.get(dt.endDateField);
            }

            if (dt && (dt.getHours() > 0 || dt.getMinutes() > 0 || dt.getSeconds() > 0 || dt.getMilliseconds() > 0)) {
                dt = Sch.util.Date.getNext(dt, 'd', 1);
            }

            return dt;
        },

        getAllDayDisplayStartDate : function(dt) {
            if (dt instanceof Sch.model.Event) {
                dt = dt.get(dt.startDateField);
            }

            return Sch.util.Date.clearTime(dt, true);
        },

        getAllDayDisplayEndDate : function(startDate, endDate) {
            var event = startDate;

            if (startDate instanceof Sch.model.Event) {
                startDate = event.get(event.startDateField);
                endDate   = event.get(event.endDateField);
            }

            startDate = Sch.model.Event.getAllDayDisplayStartDate(startDate);

            // If date falls on start of the day - subtract one day to show end date correctly
            // e.g. event starts on 2017-01-01 00:00 and ends on 2017-01-02 00:00, editor should show
            // 2017-01-01 for both start and end
            if (Sch.util.Date.clearTime(endDate, true).valueOf() === endDate.valueOf()) {
                endDate = Sch.util.Date.add(endDate, Sch.util.Date.DAY, -1);
            }
            else if (startDate.valueOf() !== endDate.valueOf()) {
                endDate = Sch.util.Date.clearTime(endDate, true);
            }

            return endDate;
        }
    }
});
