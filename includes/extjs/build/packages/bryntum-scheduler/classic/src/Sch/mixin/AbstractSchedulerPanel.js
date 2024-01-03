/**

@class Sch.mixin.AbstractSchedulerPanel
@private

A mixin providing "scheduling" functionality to the consuming "panel".
A consuming class should have already consumed the {@link Sch.mixin.AbstractTimelinePanel} mixin.

This should not be used directly.

*/

Ext.define('Sch.mixin.AbstractSchedulerPanel', {

    requires: [
        'Sch.model.Event',
        'Sch.model.Resource',
        'Sch.data.EventStore',
        'Sch.data.ResourceStore',
        'Sch.util.Date',
        'Sch.plugin.ResourceZones'
    ],

    /**
    * @cfg {String} eventBarIconClsField
    * A field in the Event model whose value will be applied as a CSS class to each event bar to place a 16x16 icon.
    */
    eventBarIconClsField    : '',

    /**
    * @cfg {Boolean} enableEventDragDrop true to enable drag and drop of events, defaults to true
    */
    enableEventDragDrop: true,

    /**
    * @cfg {String} eventBarTextField The field in your data model that will be rendered into each event bar.
    * You can alternatively use the eventBarRenderer to get full control over what gets displayed.
    */

    /**
     * @cfg {String} resourceColumnClass
     * Defines the column class for the resources, override this to use your own custom column class. (Used only in vertical orientation)
     */
    resourceColumnClass : "Sch.column.Resource",

    /**
     * @cfg {Number} resourceColumnWidth
     * Used only in vertical mode. Defines the width of a single column.
     */
    resourceColumnWidth : null,

    /**
    * @cfg {Boolean} allowOverlap Set to false if you don't want to allow events overlapping (defaults to true).
    */
    allowOverlap: true,

    /**
    * @cfg {String} startParamName The name of the start date parameter that will be passed to in every `eventStore` load request.
    */
    startParamName: 'startDate',

    /**
    * @cfg {String} endParamName The name of the end date parameter that will be passed to in every `eventStore` load request.
    */
    endParamName: 'endDate',

    /**
    * @cfg {Boolean} passStartEndParameters true to apply start and end dates of the current view to any `eventStore` load requests.
    */
    passStartEndParameters: false,


    /**
     * @cfg {Number} barMargin
     * Controls how much space to leave between stacked event bars in px
     */

    /**
     * @cfg {Boolean} constrainDragToResource
     * Set to true to only allow dragging events within the same resource. Defaults to false.
     */

    /**
    * @cfg {Function} eventRenderer
    * An empty function by default, but provided so that you can override it. This function is called each time an event
    * is rendered into the schedule to render the contents of the event. It's called with the event, its resource and a tplData object which
    * allows you to populate data placeholders inside the event template.
    * By default, the {@link #eventTpl} includes placeholders for 'cls' and 'style'. The cls property is a CSS class which will be added to the
    * event element. The style property is an inline style declaration for the event element. If you override the default {@link #eventTpl}, you can of course
    * include other placeholder in your template markup. Note: You will still need to keep the original built-in placeholders for the scheduler to work.
    *
    * <pre>
    *  eventRenderer : function (eventRec, resourceRec, templateData) {
    *      templateData.style = 'color:white';                 // You can use inline styles too.
    *      templateData.cls = resourceRec.get('Category');     // Read a property from the resource record, used as a CSS class to style the event
    *
    *      return Ext.Date.format(eventRec.getStartDate(), 'Y-m-d') + ': ' + eventRec.getName();
    *  }
    *</pre>
    * @param {Sch.model.Event} eventRecord The event about to be rendered
    * @param {Sch.model.Resource} resourceRecord The resource row in which the event is being created
    * @param {Object} tplData An object that will be applied to the containing {@link #eventTpl}.
    * @param {Number} row The row index
    * @param {Number} col The column index
    * @param {Sch.data.ResourceStore} ds The resource store
    * @return {String/Object} A simple string, or a custom object which will be applied to the {@link #eventBodyTemplate}, creating the actual HTML
    */
    eventRenderer: null,

    /**
    * @cfg {Object} eventRendererScope The scope to use for the {@link #eventRenderer} function
    */
    eventRendererScope : null,

    /**
     * @cfg {Sch.data.EventStore} eventStore (required) The {@link Ext.data.Store} holding the events to be rendered into the scheduler.
     */
    eventStore: null,

    /**
     * @cfg {Sch.data.ResourceStore} resourceStore (required) The {@link Ext.data.Store} holding the resources to be rendered into the scheduler.
     */
    resourceStore: null,

    /**
     * @method onEventCreated An empty function by default, but provided so that you can override it to supply default record values etc. This function is called after a new event has been created (but
     * before it is inserted to the store). This is for example called after a user dragged a new bar in the scheduler (the DragCreate feature).
     * @param {Sch.model.Event} eventRecord The event that was just created
     * @param {Sch.model.Resource[]} resources The corresponding resources which will be assigned
     */
    onEventCreated: function (newEventRecord, resources) {},

    /**
    * @cfg {Ext.Template} eventTpl The wrapping template used to renderer your events in the scheduler. Normally you should not override this,
    * only do so if you need total control of how the events are rendered/styled. See the {@link #eventBodyTemplate} for more information.
    */

    /**
    * @cfg {String/Ext.Template} eventBodyTemplate The template used to generate the markup of your events in the scheduler. To 'populate' the eventBodyTemplate with data, use the {@link #eventRenderer} method
    */

    /**
    *  @cfg {Object} timeAxisColumnCfg A {@link Ext.grid.column.Column} config used to configure the time axis column in vertical mode.
    */

    /**
     * @cfg {Object} weekViewTimeAxisCfg A {@link Ext.grid.column.Column} config used to configure the time axis column in weekview mode.
     */

    /**
     * @cfg {Sch.data.EventStore} resourceZones A special store containing data used to highlight the underlying schedule for the resources,
     * using {@link Sch.plugin.ResourceZones}. This can be used to color non-working time or any other meta data associated with a resource.
     * See also {@link #resourceZonesConfig}.
     */
    resourceZones       : null,

    /**
     * @cfg {Object} resourceZonesConfig An object with configuration options for {@link Sch.plugin.ResourceZones}. Ignored if no {@link #resourceZones}
     * config is provided.
     */
    resourceZonesConfig : null,

    initStores : function() {
        var resourceStore   = this.resourceStore || this.store;

        if (this.crudManager) {

            if (!Sch.crud.AbstractManager) {
                throw new Error('Sch.crud.AbstractManager not loaded, did you forget to require ' +
                    'crudManager class (e.g. Sch.data.CrudManager)?');
            }

            if (!(this.crudManager instanceof Sch.crud.AbstractManager)) {
                // If xclass wasn't specified - use default one
                this.crudManager = Ext.create(this.crudManager.xclass || 'Sch.data.CrudManager', Ext.clone(this.crudManager));
            }
        }

        if (!resourceStore) {
            if (this.crudManager) {

                resourceStore = this.resourceStore = this.crudManager.getResourceStore();
            }

            if (!resourceStore) {
                if (this.isTree) {
                    resourceStore = new Sch.data.ResourceTreeStore({
                        proxy : 'memory'
                    });
                } else {
                    resourceStore = new Sch.data.ResourceStore();
                }
            }
        }

        if (!this.dependencyStore) {

            if (this.crudManager) {
                this.dependencyStore = this.crudManager.getDependencyStore();
            }

            //this.dependencyStore = this.dependencyStore || new Sch.data.DependencyStore();
        }

        if (!this.eventStore) {

            if (this.crudManager) {
                this.eventStore = this.crudManager.getEventStore();
            }

            this.eventStore = this.eventStore || new Sch.data.EventStore();
        }

        // Set "store" for the grid panel API
        this.store          = Ext.StoreManager.lookup(resourceStore);
        this.resourceStore  = this.store;

        this.setEventStore(this.eventStore);

        if (!this.eventStore || !this.eventStore.isEventStore) {
            Ext.Error.raise("Your eventStore should be a subclass of Sch.data.EventStore (or consume the EventStore mixin)");
        }

        this.resourceStore.eventStore = this.getEventStore();
    },

    _initializeSchedulerPanel : function() {
        this.initStores();

        if (this.eventBodyTemplate && typeof this.eventBodyTemplate === 'string') {
            this.eventBodyTemplate = new Ext.XTemplate(this.eventBodyTemplate);
        }

        this.on('destroy', function() {
            this.setResourceStore(null);
            this.setEventStore(null);
        });
    },

    /**
    * Returns the resource store instance
    * @return {Sch.data.ResourceStore}
    */
    getResourceStore: function () {
        return this.resourceStore;
    },

    /**
     * Sets the resource store
     * @param {Sch.data.ResourceStore} newResourceStore
     */
    setResourceStore : function (newResourceStore) {
        var oldResourceStore  = this.getResourceStore();

        this.resourceStore = newResourceStore = newResourceStore && Ext.StoreManager.lookup(newResourceStore);

        var eventStore = this.getEventStore();

        // If null is passed - do not remove link between stores. Partner panel might be destroyed
        if (eventStore && newResourceStore) {
            eventStore.setResourceStore(newResourceStore);
        }

        var view = this.getSchedulingView();

        view && view.setResourceStore(newResourceStore);

        if (newResourceStore) {
            this.fireEvent('resourcestorechange', this, newResourceStore, oldResourceStore);

            // In case of vertical view the columns are resources, so they have to be recreated
            if (this.isVertical()) {
                this.refreshResourceColumns();

                this.mun(oldResourceStore, this.verticalListeners);
                this.mon(newResourceStore, this.verticalListeners);
            }

            if (this.isWeekView()) {
                this.mun(oldResourceStore, this.calendarResourceStoreListeners);
                this.mon(newResourceStore, this.calendarResourceStoreListeners);
            }

            // if the panel is in horizontal mode (oldResourceStore === panel.store)
            // we use Sencha provided grid.reconfigure()
            if (oldResourceStore === this.store) {
                this.reconfigure(newResourceStore);
            } else {
                this.refreshViews(false);
            }

            if (this.allDayNormalHeader) {
                this.allDayNormalHeader.refreshViews(false);
            }
        }
    },

    /**
    * Returns the event store instance
    * @return {Sch.data.EventStore}
    */
    getEventStore: function () {
        return this.eventStore;
    },

    /**
     * Sets the event store
     * @param {Sch.data.EventStore} newEventStore
     */
    setEventStore: function (newEventStore) {
        var oldEventStore = this.getEventStore();

        newEventStore = newEventStore && Ext.StoreManager.lookup(newEventStore);

        if (this.getEventStore()) {
            this.mun(this.getEventStore(), 'beforeload', this.applyStartEndParameters, this);
        }

        var resourceStore = this.getResourceStore();
        var assignmentStore = this.getAssignmentStore();
        var dependencyStore = this.getDependencyStore();

        this.eventStore = newEventStore;

        // If null is passed - do not remove link between stores. Partner panel might be destroyed
        if (resourceStore && newEventStore) {
            resourceStore.setEventStore(newEventStore);
        }

        if (assignmentStore && newEventStore && !newEventStore.getAssignmentStore()) {
            newEventStore.setAssignmentStore(assignmentStore);
        }

        if (dependencyStore && newEventStore && !newEventStore.getDependencyStore()) {
            newEventStore.setDependencyStore(dependencyStore);
        }

        var view = this.getSchedulingView();

        // resource store will be bound correct under the hood of this method
        view && view.setEventStore(newEventStore);

        if (this.allDayNormalHeader) {
            this.allDayNormalHeader.setEventStore(newEventStore);
        }

        if (newEventStore) {

            this.fireEvent('eventstorechange', this, newEventStore, oldEventStore);

            if (this.passStartEndParameters) {
                this.mon(newEventStore, 'beforeload', this.applyStartEndParameters, this);
            }

            this.refreshViews(false);
        }
    },

    // Applies the start and end date to each event store request
    applyStartEndParameters: function (eventStore, options) {
        var proxy = eventStore.getProxy();

        proxy.setExtraParam(this.startParamName, this.getStart());
        proxy.setExtraParam(this.endParamName, this.getEnd());
    },

    /**
     * Returns the assignment store instance
     * @return {Sch.data.AssignmentStore}
     */
    getAssignmentStore: function () {
        var me = this,
            eventStore = me.getEventStore();

        return eventStore && eventStore.isStore && eventStore.getAssignmentStore() || me.assignmentStore;
    },

    /**
     * Sets the assignment store
     * @param {Sch.data.AssignmentStore} newAssignmentStore
     */
    setAssignmentStore: function (newAssignmentStore) {
        var oldStore = this.getAssignmentStore();

        this.getEventStore().setAssignmentStore(newAssignmentStore);

        if (newAssignmentStore) {
            this.fireEvent('assignmentstorechange', this, newAssignmentStore, oldStore);

            this.refreshViews(false);
        }
    },

    /**
     * Returns the assignment store instance
     * @return {Sch.data.DependencyStore}
     */
    getDependencyStore: function () {
        var me = this,
            eventStore = me.getEventStore();

        return eventStore && eventStore.isStore && eventStore.getDependencyStore() || me.dependencyStore;
    },

    /**
     * Sets the assignment store
     * @param {Sch.data.DependencyStore} newDependencyStore
     */
    setDependencyStore: function (newDependencyStore) {
        var oldStore = this.getDependencyStore();

        this.getEventStore().setDependencyStore(newDependencyStore);

        if (newDependencyStore) {
            this.fireEvent('dependencystorechange', this, newDependencyStore, oldStore);

            this.refreshViews(false);
        }
    },

    createResourceColumns : function (colWidth) {

        return Ext.Array.map(this.resourceStore.getRange(), function (resource) {
            return {
                xclass   : this.resourceColumnClass,
                renderer : this.mainRenderer,
                scope    : this,
                width    : colWidth || 100,
                text     : resource.getName(),
                model    : resource
            };
        }, this);
    },

    registerEventEditor : function (editor) {
        this.getSchedulingView().registerEventEditor(editor);
    }
});

