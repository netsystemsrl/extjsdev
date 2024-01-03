// @tag dependencies
/**
 * This mixin is a helper for Scheduler grid/tree panels. It adds Dependency view instance management methods to
 * those panels.
 */
Ext.define('Sch.view.dependency.Mixin', {

    extend : 'Ext.Mixin',

    requires : [
        'Sch.view.dependency.View'
    ],

    mixinConfig : {
        after : {
            initComponent : 'initComponent',
            destroy       : 'destroy'
        }
    },

    /**
     * @cfg {Object} dependencyViewConfig
     *
     * Dependency view config. Use `type` property to create different type of dependency views.
     */
    dependencyViewConfig : null,

    // Private, dependency view instance
    dependencyView              : null,
    // Private, dependency view relay detacher
    dependencyViewRelayDetacher : null,
    // Private, dependency drag events relay detacher
    dependencyDragRelayDetacher : null,

    initComponent : function() {
        var me = this;

        // Locked grid relays this event from normal grid which is the grid showing scheduler events, i.e. the one
        // which has scheduling view
        me.on('viewready', function() {
            if (me.getEventStore()) {
                me.setupDependencyView(me.getDependencyViewConfig(), me.getSchedulingView());
            }
        });
    },

    /**
     * Gets current dependency view config
     *
     * @return {Object|Null}
     */
    getDependencyViewConfig : function() {
        return this.dependencyViewConfig;
    },

    /**
     * Sets current dependency view config.
     *
     * If dependency view is already created and config has different view `type` set then the view
     * might be destroyed and re-created as the side-effect of this method call.
     *
     * @param {Object} config
     */
    setDependencyViewConfig : function(config) {
        var me = this;

        if (me.dependencyViewConfig !== config) {
            me.dependencyViewConfig = config;

            if (me.dependencyView) {
                // In this case we are to re-create painter instance since painter type is changed
                if (config && 'type' in config && config.type !== me.dependencyView.type) {
                    me.setupDependencyView(config, me.getSchedulingView());
                }
                // In this case we just update current painter configuration
                else {
                    me.dependencyView.setConfig(config);
                }
            }
        }
    },

    /**
     * Checks if a component has a dependency view created.
     *
     * @return {Boolean}
     */
    hasDependencyView : function() {
        return !!this.dependencyView;
    },

    /**
     * Returns dependency view instance.
     *
     * @return {Sch.view.Dependency}
     */
    getDependencyView : function() {
        return this.dependencyView;
    },

    /**
     * Create dependency view instance.
     *
     * @protected
     */
    createDependencyView : function(config, primaryView) {
        return Sch.view.dependency.View.create(Ext.applyIf({ primaryView : primaryView }, config));
    },

    /**
     * Destroys dependency view instance. The method is called after component's `destroy` method.
     *
     * @protected
     */
    destroy : function() {
        Ext.destroyMembers(
            this,
            'dependencyViewRelayDetacher',
            'dependencyDragRelayDetacher',
            'dependencyView'
        );
    },

    /**
     * Creates, stores and setups dependency view
     *
     * @protected
     */
    setupDependencyView : function(config, primaryView) {
        var me = this;

        Ext.destroy(me.dependencyView);

        me.dependencyView = me.createDependencyView(config, primaryView);

        me.setupDependencyViewRelay();

        me.fireEvent('dependencyviewready', me, me.dependencyView);

        if (me.dependencyView.canDrawDependencies()) {
            me.dependencyView.renderAllDependencies().then(null, Ext.emptyFn);
        }
    },

    /**
     * Setups dependency view events relaying
     *
     * @protected
     */
    setupDependencyViewRelay : function() {
        var me = this;

        Ext.destroy(me.dependencyViewRelayDetacher, me.dependencyDragRelayDetacher);

        me.dependencyViewRelayDetacher = me.relayEvents(me.getDependencyView(), [
            'dependencyclick',
            'dependencydblclick',
            'dependencycontextmenu',
            'dependencymouseover',
            'dependencymouseout'
        ]);

        me.dependencyDragRelayDetacher = me.relayEvents(me.getDependencyView(), [
            'beforedrag',
            'dragstart',
            'drop',
            'afterdrop'
        ], 'dependency');
    }

    /**
     * @event dependencyviewready
     *
     * Fires after dependency view creation
     *
     * @param {Ext.Component} A component instance this mixin is mixed into
     * @param {Sch.view.Dependency} Dependency view instance
     */

    /**
     * @event dependencyclick
     *
     * Fires after clicking on a dependency line/arrow
     *
     * @param {Sch.view.dependency.View} view The dependency view instance
     * @param {Sch.model.Dependency} record The dependency record
     * @param {Ext.event.Event} event The event object
     * @param {HTMLElement} target The clicked DOM element
     */

    /**
     * @event dependencycontextmenu
     *
     * Fires after right clicking on a dependency line/arrow
     *
     * @param {Sch.view.dependency.View} view The dependency view instance
     * @param {Sch.model.Dependency} record The dependency record
     * @param {Ext.event.Event} event The event object
     * @param {HTMLElement} target The clicked DOM element
     */

    /**
     * @event dependencydblclick
     *
     * Fires after double clicking on a dependency line/arrow
     *
     * @param {Sch.view.dependency.View} view The dependency view instance
     * @param {Sch.model.Dependency} record The dependency record
     * @param {Ext.event.Event} event The event object
     * @param {HTMLElement} target The clicked DOM element
     */

    /**
     * @event dependencymouseover
     *
     * Fires when hovering over a dependency line/arrow
     *
     * @param {Sch.view.dependency.View} view The dependency view instance
     * @param {Sch.model.Dependency} record The dependency record
     * @param {Ext.event.Event} event The event object
     * @param {HTMLElement} target The target DOM element
     */

    /**
     * @event dependencymouseout
     *
     * Fires when leaving a dependency line/arrow
     *
     * @param {Sch.view.dependency.View} view The dependency view instance
     * @param {Sch.model.Dependency} record The dependency record
     * @param {Ext.event.Event} event The event object
     * @param {HTMLElement} target The target DOM element
     */

    /**
     * @event dependencybeforedrag
     * @preventable
     *
     * Fires when a create-dependency flow is about to start. Return false from a listener function to prevent the action.
     *
     * @param {Sch.view.dependency.DragZone} event The event object
     * @param {Sch.model.Event} eventRecord The source event record
     */

    /**
     * @event dependencydragstart
     *
     * Fires when a dependency drag operation starts
     *
     * @param {Sch.view.dependency.DragZone} dragZone The dragzone object
     */

    /**
     * @event dependencydrop
     *
     * Fires when a dependency drag drop operation has completed successfully and a new dependency has been created.
     *
     * @param {Sch.view.dependency.DropZone} event The event object
     * @param {Sch.model.Dependency} newDependency A dependency model representing the newly created link
     * @param {Boolean} valid true if the drop is deemed valid (as determined by the {@link Sch.data.DependencyStore#
     */

    /**
     * @event dependencyafterdrop
     *
     * Always fires after a dependency drag-drop operation.
     *
     * @param {Sch.view.dependency.DropZone} dropZone The DropZone
     */
});
