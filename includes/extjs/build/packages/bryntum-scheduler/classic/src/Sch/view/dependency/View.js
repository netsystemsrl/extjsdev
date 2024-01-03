// @tag dependencies
/**
 * Dependency view is the utilitary view working alongside the primary `item` view of an Ext.Component, the only
 * requirement for the primary `item` view is to support the following interface:
 *
 *  - getEl() : Ext.dom.Element
 *  - isItemCanvasAvailable([layer : Number]) : Boolean
 *  - isItemCanvasPresent(layer : Number) : Boolean
 *  - getItemCanvasEl(layer : Number, canvasSpec : Object) : Ext.dom.Element
 *  - getItemBox(itemModel) : Object/Object[] {top : Number, bottom : Number, start : Number, end : Number, rendered : Boolean}
 *  - getStartConnectorSide(itemModel) : ['top'/'bottom'/'left'/'right']
 *  - getEndConnectorSide(itemModel) : ['top'/'bottom'/'left'/'right']
 *  - getViewStartDate() : Date|null
 *  - getViewEndDate() : Date|null
 *  - getEventStore() : Sch.data.EventStore
 *  - onDragDropStart() : void - optional
 *  - onDragDropEnd() : void - optional
 */
Ext.define('Sch.view.dependency.View', {

    alias : 'schdependencyview.base',

    mixins : [
        'Ext.mixin.Factoryable',
        'Ext.mixin.Observable'
    ],

    requires : [
        'Sch.view.dependency.Tooltip',
        'Sch.view.dependency.DragZone',
        'Sch.view.dependency.Painter',
        'Sch.view.dependency.renderingstrategy.Combined'
    ],

    uses : [
        'Ext.data.StoreManager',
        'Ext.Array',
        'Ext.dom.CompositeElementLite'
    ],

    config : {
        /**
         * @cfg {Sch.view.SchedulerGridView} primaryView (required)
         * Primary view instance
         */
        primaryView : null,

        /**
         * @cfg {Sch.data.EventStore|String} dependencyStore
         * Dependency store this view will work with, if none given then dependency store will be taken from the primary view.
         */
        dependencyStore : null,

        /**
         * @cfg {Boolean} drawDependencies
         * Set to false to turn dependency drawing off
         * @private
         */
        drawDependencies : true,

        /**
         * @cfg {Number} bulkRenderingDependencyLimit
         * Maximum amount of dependencies until bulk rendering strategy is used, if there're more dependencies in
         * the store then asynchronous rendering strategy will be used
         */
        bulkRenderingDependencyLimit : 100,

        /**
         * @cfg {Number} asyncRenderingDepsPerStep
         * Amount of dependencies to render per one render step if asynchronous rendering strategy is used.
         */
        asyncRenderingDepsPerStep : 50,

        /**
         * @cfg {Object} painterConfig
         * Dependency painter instance config
         */
        painterConfig : {
            canvasCls : 'sch-dependencyview-ct'
        },

        /**
         * @cfg {Number} canvasLayer
         * Dependency canvas layer position (i.e. z-index)
         * @private
         */
        canvasLayer : 0,

        /**
         * @cfg {Boolean} enableDependencyDragDrop
         * True to allow creating new links using drag drop
         */
        enableDependencyDragDrop : true,

        /**
         * @cfg {String[]} terminalSides
         * An array defining which sides to show dependency terminals
         */
        terminalSides : [ 'left', 'right', 'top', 'bottom' ],

        /**
         * @cfg {String/Ext.Template} dragTipTpl
         * A template to show when creating a new dependency using drag drop
         */
        dragTipTpl : null,

        /**
         * @cfg {String/Ext.Template} tipTpl
         * A template for the {@link #tip tooltip} to show info about a dependency.
         * See also {@link #tipCfg}
         */
        tipTpl : null,

        /**
         * @cfg {Boolean/Object} showTooltip
         * A flag to show a {@link #tip tooltip} with info about a dependency.
         * Also excepts a config for the {@link #tip tooltip}.
         * Set to `false` or `null` to turn the {@link #tip tooltip} off.
         */
        showTooltip : true,

        /**
         * Additional drag zone config.
         */
        dragZoneConfig : null,

        /**
         * @cfg {String} selectedCls
         * The CSS class to add to a dependency line when dependency is selected
         */
        selectedCls : 'sch-dependency-selected',

        /**
         * @cfg {String} overCls
         * The CSS class to add to a dependency line when hovering over it
         */
        overCls : 'sch-dependency-over'
    },

    // private
    painter                     : null,
    renderingStrategy           : null,
    primaryViewDetacher         : null,
    primaryViewLockableDetacher : null,
    primaryViewElDetacher       : null,
    dependencyStoreDetacher     : null,
    dragZone                    : null,
    scrolling                   : false,

    /**
     * @property {Ext.tip.ToolTip} tip
     * @readonly
     * @private
     * A tooltip to show info about a dependency
     */
    tip : null,

    constructor : function (config) {
        var me = this,
            view;

        // Just in case
        me.callParent([ config ]);

        // Initializing observable mixin
        me.mixins.observable.constructor.call(me, config);

        // Since we do not inherit from the Ext.Component the call to `initConfig` is required
        me.initConfig(config);

        // <debug>
        Ext.Assert && Ext.Assert.isObject(
            me.getPrimaryView(),
            'Dependency view requires a primary view to be configured in'
        );
        Ext.Assert && Ext.Assert.isFunctionProp(
            me.getPrimaryView(),
            'isItemCanvasAvailable',
            'Dependency view requires `Sch.mixin.GridViewCanvas` mixin to be mixed into scheduling view, or the corresponding interface to be implemented'
        );
        Ext.Assert && Ext.Assert.isFunctionProp(
            me.getPrimaryView(),
            'getItemCanvasEl',
            'Dependency view requires `Sch.mixin.GridViewCanvas` mixin to be mixed into scheduling view, or the corresponding interface to be implemented'
        );
        // </debug>

        me.painter = me.createPainter(Ext.apply({
            rtl : me.getPrimaryView().rtl,
            dependencyStore: me.getDependencyStore() // TODO: only needed to check if all deps are being rendered, alter renderingstrategies to pass as arg instead?
        }, me.getPainterConfig()));

        // TODO: write test that verifies that each op resets cache

        if (me.painter.getUseDependencyRowIntersectionCache()) {
            if (me.getPrimaryView().resourceStore) {
                me.getPrimaryView().mon(me.getPrimaryView().resourceStore, {
                    add     : me.resetPainterCache,
                    remove  : me.resetPainterCache,
                    //load        : me.resetPainterCache,
                    clear   : me.resetPainterCache,
                    refresh : me.resetPainterCache,
                    scope   : me
                });
            }

            if (me.getDependencyStore()) {
                me.mon(me.getDependencyStore(), {
                    add     : me.updatePainterCache,
                    remove  : me.resetPainterCache,
                    //load         : me.resetPainterCache,
                    clear   : me.resetPainterCache,
                    refresh : me.resetPainterCache,
                    scope   : me
                });
            }

            me.mon(me.getPrimaryView().ownerGrid, {
                viewchange : me.resetPainterCache,
                scope      : me
            });
        }

        if (me.canDrawDependencies()) {
            me.startDrawDependencies();
        }

        if (me.getEnableDependencyDragDrop()) {

            view = me.getPrimaryView();

            me.dragZone = me.createDragZone(Ext.apply({
                view             : view,
                ddGroup          : view.getId() + '-dep-dd',
                rtl              : view.rtl,
                terminalSelector : '.sch-terminal',
                dependencyStore  : me.getDependencyStore(),
                tipTpl           : me.getDragTipTpl()
            }, me.getDragZoneConfig() || {}));

            me.dragZone.on({
                dragstart : me.onDragStart,
                drop      : me.onDependencyDrop,
                afterdrop : me.onDependencyAfterDrop,
                scope     : me
            });

            me.relayEvents(me.dragZone, [
                'beforedrag',
                'dragstart',
                'drop',
                'afterdrop'
            ]);
        }

        var tipCfg = me.getShowTooltip();

        if (tipCfg) {
            me.tip = new Sch.view.dependency.Tooltip(Ext.apply({
                dependencyView : me,
                tpl : me.getTipTpl()
            }, tipCfg));
        }
    },

    destroy : function () {
        var me = this;

        me.stopDrawDependencies();

        me.tip && me.tip.destroy();

        me.dragZone && me.dragZone.destroy();
    },

    destroyDetachers : function () {
        var me = this;

        Ext.destroyMembers(this,
            'primaryViewDetacher',
            'primaryViewLockableDetacher',
            'primaryViewElDetacher',
            'dependencyStoreDetacher'
        );
    },

    destroyDependencyCanvas : function () {
        var me = this;

        if (me.isDependencyCanvasPresent()) {
            Ext.destroy(me.getDependencyCanvas());
        }
    },

    destroyRenderingStrategy : function () {
        var me = this;

        Ext.destroy(me.renderingStrategy);
        me.renderingStrategy = null;
    },

    resetPainterCache : function () {
        this.painter.resetRowIntersectionCache();
    },

    updatePainterCache : function () {
        this.painter.resetRowIntersectionCache(true);
    },

    /**
     * Checks if the view is ready to draw dependencies
     *
     * @param {Boolean} ignoreDrawDependencies
     * @param {Boolean} ignoreDependencyCanvas
     * @param {Boolean} ignoreDependencyStore
     *
     * @return {Boolean}
     */
    canDrawDependencies : function (ignoreDrawDependencies, ignoreDependencyCanvas, ignoreDependencyStore) {
        var me = this;

        return !!(
            me.painter &&
            me.getPrimaryView() &&
            (ignoreDrawDependencies || me.getDrawDependencies()) &&
            (ignoreDependencyCanvas || me.isDependencyCanvasAvailable()) &&
            (ignoreDependencyStore || me.getDependencyStore())
        );
    },

    startDrawDependencies : function () {
        var me              = this,
            primaryView     = me.getPrimaryView(),
            dependencyStore = me.getDependencyStore(),
            lockableView;

        if (!me.renderingStrategy) {
            me.renderingStrategy = me.createRenderingStrategy();

            me.primaryViewDetacher = primaryView.on(
                Ext.applyIf({
                    destroyable: true
                }, me.getPrimaryViewListeners())
            );

            me.primaryViewElDetacher = primaryView.getEl().on(
                Ext.applyIf({
                    destroyable: true
                }, me.getPrimaryViewElListeners())
            );

            // Primary view is not always a grid view
            // TODO: this requires more thoughts
            if (primaryView.grid) {
                // WARNING: view.grid and view.grid.ownerLockable are private properties
                lockableView = primaryView.grid.ownerLockable && primaryView.grid.ownerLockable.getView();
                if (primaryView != lockableView) {
                    me.primaryViewLockableDetacher = lockableView.on(
                        Ext.applyIf({
                            destroyable: true
                        }, me.getPrimaryViewLockableListeners())
                    );
                }
            }

            me.dependencyStoreDetacher = dependencyStore.on(
                Ext.applyIf({
                    destroyable: true
                }, me.getDependencyStoreListeners())
            );
        }

        me.renderAllDependencies().then(null, Ext.emptyFn);
    },

    stopDrawDependencies : function () {
        var me = this;

        me.destroyRenderingStrategy();
        me.destroyDetachers();
        me.destroyDependencyCanvas();
    },

    createRenderingStrategy : function () {
        var me = this;

        return Sch.view.dependency.renderingstrategy.Combined.create({
            depsPerStep : me.getAsyncRenderingDepsPerStep()
        });
    },

    maybeSwitchRenderingStrategy : function () {
        var me = this;

        if (me.getDependencyStore().getCount() <= me.getBulkRenderingDependencyLimit()) {
            me.renderingStrategy.setMode('bulk');
        }
        else {
            me.renderingStrategy.setMode('async');
        }
    },

    updatePrimaryView : function (newView, oldView) {
        var me = this;

        if (oldView) {
            me.stopDrawDependencies();
        }

        if (newView) {

            if (!me.getDependencyStore() && newView.getEventStore()) {
                me.setDependencyStore(newView.getEventStore().getDependencyStore());
            }

            if (me.canDrawDependencies()) {
                me.startDrawDependencies();
            }
        }
    },

    applyDependencyStore : function (store) {
        return store && Ext.StoreMgr.lookup(store);
    },

    updateDependencyStore : function (newStore, oldStore) {
        var me = this;

        if (oldStore) {
            me.stopDrawDependencies();
        }

        if (newStore && me.canDrawDependencies()) {
            me.startDrawDependencies();
        }
    },

    updateDrawDependencies : function (newValue, oldValue) {
        var me = this;

        if (newValue && me.canDrawDependencies(true)) {
            me.startDrawDependencies();
        }
        else if (!newValue) {
            me.stopDrawDependencies();
        }
    },

    applyPainterConfig : function (config) {
        // Do not share single config instance among several dependency canvas instances
        return Ext.isObject(config) ? Ext.apply({}, config) : config;
    },

    updatePainterConfig : function (config) {
        var me = this;

        if (me.painter) {

            if (config) {
                config = Ext.apply({}, { rtl : me.getPrimaryView().rtl }, config);
            }

            // In this case we are to re-create painter instance since painter type is changed
            if (config && 'type' in config && config.type !== me.painter.type) {

                Ext.destroy(me.painter);
                me.painter = me.createPainter(config);
            }
            // In this case we just update current painter configuration
            else {
                me.painter.setConfig(config);
            }

            // New config might provide as with new canvas specification, thus the current one should be
            // destroyed if any
            me.destroyDependencyCanvas();

            if (me.canDrawDependencies()) {
                me.renderAllDependencies().then(null, Ext.emptyFn);
            }
        }
    },

    updateCanvasLayer : function (layer) {
        var me = this;

        me.destroyDependencyCanvas();

        if (me.canDrawDependencies()) {

            me.renderAllDependencies().then(null, Ext.emptyFn);
        }
    },

    /**
     * Gets scheduling view listeners object
     *
     * @return {Object}
     * @protected
     */
    getPrimaryViewListeners : function () {
        var me = this;

        return {
            'itemadd'         : me.onPrimaryViewItemAdd,
            'itemremove'      : me.onPrimaryViewItemRemove,
            'itemupdate'      : me.onPrimaryViewItemUpdate,
            'refresh'         : me.onPrimaryViewRefresh,
            'bufferedrefresh' : me.onPrimaryViewRefresh,
            // Row expander plugin events
            'expandbody'      : me.onPrimaryViewExpandBody,
            'collapsebody'    : me.onPrimaryViewCollapseBody,
            // Bryntum custom events
            'eventrepaint'    : me.onPrimaryViewEventRepaint,
            'baseline-show'   : me.onPrimaryViewRefresh,
            'baseline-hide'   : me.onPrimaryViewRefresh,
            scope             : me
        };
    },

    /**
     * If scheduling view is part of the lockable grid then gets top level lockable view listeners object
     *
     * @return {Object}
     * @protected
     */
    getPrimaryViewLockableListeners : function () {
        var me = this;

        return {
            // Row expander plugin events
            'expandbody'   : me.onPrimaryViewExpandBody,
            'collapsebody' : me.onPrimaryViewCollapseBody,
            scope          : me
        };
    },

    /**
     * Get's primary view element listeners
     *
     * @return {Object}
     * @protected
     */
    getPrimaryViewElListeners : function () {
        var me = this;

        return {
            'dblclick'    : me.onPrimaryViewDependencyElPointerEvent,
            'click'       : me.onPrimaryViewDependencyElPointerEvent,
            'contextmenu' : me.onPrimaryViewDependencyElPointerEvent,
            'mouseover'   : me.onPrimaryViewDependencyElPointerEvent,
            'mouseout'    : me.onPrimaryViewDependencyElPointerEvent,

            delegate : '.sch-dependency',
            scope    : me
        };
    },

    /**
     * Gets dependency store listeners
     *
     * @return {Object}
     * @protected
     */
    getDependencyStoreListeners : function () {
        var me = this;

        return {
            'add'     : me.onDependencyStoreAdd,
            'remove'  : me.onDependencyStoreRemove,
            'update'  : me.onDependencyStoreUpdate,
            'refresh' : me.onDependencyStoreRefresh,
            'clear'   : me.onDependencyStoreClear,
            scope     : me
        };
    },

    /**
     * Creates painter class instance
     *
     * @param {Object} config Painter config
     * @return {Sch.view.dependency.Painter}
     * @protected
     */
    createPainter : function (config) {
        return Sch.view.dependency.Painter.create(config);
    },

    /**
     * Returns currently active painter
     *
     * @return {Sch.view.dependency.Painter}
     */
    getPainter : function () {
        return this.painter;
    },

    /**
     * Clones currently using dependency painter
     *
     * @return {Sch.view.dependency.Painter/Null}
     * @public
     */
    clonePainter : function () {
        var me = this;
        return me.painter && me.painter.clone() || null;
    },

    /**
     * Creates drag zone class instance
     *
     * @param {Object} [config]
     * @return {Sch.view.dependency.DragZone}
     */
    createDragZone : function (config) {
        return Sch.view.dependency.DragZone.create(config);
    },

    /**
     * Checks if dependency canvas is available for drawing
     *
     * @return {Boolean}
     * @protected
     */
    isDependencyCanvasAvailable : function () {
        var primaryView = this.getPrimaryView();

        return primaryView && primaryView.isItemCanvasAvailable();
    },

    /**
     * Checks if dependency canvas is present in the DOM
     *
     * @return {Boolean}
     *
     * @protected
     */
    isDependencyCanvasPresent : function () {
        var me          = this,
            primaryView = me.getPrimaryView();

        return primaryView && primaryView.isItemCanvasPresent(me.getCanvasLayer());
    },

    /**
     * Returns dependency canvas element
     *
     * @return {Ext.dom.Element}
     * @protected
     */
    getDependencyCanvas : function () {
        var me = this;

        return me.getPrimaryView().getItemCanvasEl(me.getCanvasLayer(), me.painter.getCanvasSpecification());
    },

    /**
     * Renders all the dependencies for the current view
     */
    renderAllDependencies : function () {
        var me = this,
            promise;

        if (me.canDrawDependencies() && (me.refreshing || me.fireEvent('beforerefresh', me) !== false)) {

            me.refreshing || me.renderingStrategy.on('rendering-complete', function (strategy, rendered) {
                me.refreshing = false;
                me.fireEvent('refresh', me);
            }, null, { single : true });

            me.refreshing = true;

            promise = me.renderingStrategy.updateDependencies(me);
        }
        else {
            promise = Ext.Promise.reject(me.getDependencyStore().getRange());
        }

        return promise;
    },

    /**
     * Renders dependencies for given dependency records
     *
     * @param {Sch.model.Dependency|Sch.model.Dependency[]} dependencyRecords
     * @param {Boolean} [overwrite=false]
     */
    renderDependencies : function (dependencyRecords, overwrite) {
        var me = this,
            promise;

        if (!Ext.isArray(dependencyRecords)) {
            dependencyRecords = [ dependencyRecords ];
        }

        if (me.canDrawDependencies()) {
            if (overwrite) {
                promise = me.renderingStrategy.clearDependencies(me).then(
                    function () {
                        return !me.renderingStrategy.destroyed ? me.renderingStrategy.renderDependencies(me, dependencyRecords) : dependencyRecords;
                    }
                );
            }
            else {
                promise = me.renderingStrategy.renderDependencies(me, dependencyRecords);
            }
        }
        else {
            promise = Ext.Promise.reject(dependencyRecords);
        }

        return promise;
    },

    /**
     * Re-renders dependencies for given dependency records
     *
     * @param {Sch.model.Dependency|Sch.model.Dependency[]} dependencyRecords
     */
    updateDependencies : function (dependencyRecords) {
        var me = this,
            promise;

        if (!Ext.isArray(dependencyRecords)) {
            dependencyRecords = [ dependencyRecords ];
        }

        if (me.canDrawDependencies()) {
            promise = me.renderingStrategy.updateDependencies(me, dependencyRecords);
        }
        else {
            promise = Ext.Promise.reject(dependencyRecords);
        }

        return promise;
    },

    /**
     * Clears dependencies for given dependency records
     *
     * @param {Sch.model.Dependency|Sch.model.Dependency[]} dependencyRecords
     */
    clearDependencies : function (dependencyRecords) {
        var me = this,
            promise;

        if (!Ext.isArray(dependencyRecords)) {
            dependencyRecords = [ dependencyRecords ];
        }

        if (me.canDrawDependencies()) {
            promise = me.renderingStrategy.clearDependencies(me, dependencyRecords);
        }
        else {
            promise = Ext.Promise.reject(dependencyRecords);
        }

        return promise;
    },

    /**
     * Removes all drawn dependencies elements from the canvas
     */
    clearAllDependencies : function () {
        var me = this,
            promise;

        if (me.canDrawDependencies()) {
            promise = me.renderingStrategy.clearDependencies(me);
        }
        else {
            promise = Ext.Promise.reject();
        }

        return promise;
    },

    /**
     * Returns dependency record corresponding to the given element
     * @param {HTMLElement/Ext.dom.Element/String} el
     * @return {Sch.model.Dependency/Null}
     * @protected
     */
    getDependencyForElement : function (el) {
        var me         = this,
            depStore   = me.getDependencyStore(),
            dependency = null,
            depInternalId;

        if (depStore) {
            depInternalId = me.painter.getElementDependencyInternalId(el);
            dependency    = depStore.getByInternalId(depInternalId);
        }

        return dependency;
    },

    /**
     * Highlight the elements representing a dependency
     *
     * @param {Sch.model.Dependency/Mixed} record Either the id of a record or a record in the dependency store
     * @param {String} [cls] The CSS class to use for highlighting. Defaults to the selected-state CSS class.
     */
    highlightDependency : function (record, cls) {
        var me = this;

        if (!(record && record.isModel)) {
            record = me.getDependencyStore().getById(record);
        }

        record && record.highlight(cls || me.getSelectedCls());
    },

    /**
     * Remove highlight of the elements representing a particular dependency
     *
     * @param {Sch.model.Dependency/Mixed} record Either the id of a record or a record in the dependency store
     * @param {String} [cls] The CSS class to use for highlighting. Defaults to the selected-state CSS class.
     */
    unhighlightDependency : function (record, cls) {
        var me = this;

        if (!(record && record.isModel)) {
            record = me.getDependencyStore().getById(record);
        }

        record && record.unhighlight(cls || me.getSelectedCls());
    },

    /**
     * Gets all dependency records highlighted with the CSS class given
     * @param {String} [cls]
     * @return {Sch.model.Dependency[]}
     */
    getHighlightedDependencies : function (cls) {
        var me    = this,
            store = me.getDependencyStore();

        return store && store.getHighlightedDependencies(cls || me.getSelectedCls()) || [];
    },

    onPrimaryViewItemAdd : function (records, index, node, view) {
        this.renderAllDependencies().then(null, Ext.emptyFn);
    },

    onPrimaryViewItemUpdate : function (eventRecord, index, node, view) {
        this.renderAllDependencies().then(null, Ext.emptyFn);
    },

    onPrimaryViewItemRemove : function (records, index, node, view) {
        this.renderAllDependencies().then(null, Ext.emptyFn);
    },

    onPrimaryViewRefresh : function (view) {
        this.renderAllDependencies().then(null, Ext.emptyFn);
    },

    onPrimaryViewExpandBody : function () {
        this.renderAllDependencies().then(null, Ext.emptyFn);
    },

    onPrimaryViewCollapseBody : function () {
        this.renderAllDependencies().then(null, Ext.emptyFn);
    },

    onPrimaryViewEventRepaint : function () {
        this.renderAllDependencies().then(null, Ext.emptyFn);
    },

    onPrimaryViewDependencyElPointerEvent : function (event, elDom, options) {
        var me           = this,
            dependencyId = me.painter.getElementDependencyInternalId(elDom),
            dependency   = me.getDependencyStore().getByInternalId(dependencyId);

        if (dependency) {
            me.fireEvent('dependency' + event.type, me, dependency, event, elDom);

            var overCls = this.getOverCls(),
                els     = me.painter.getElementsForDependency(me.getDependencyCanvas(), dependency);

            if (overCls && event.type === 'mouseover') {
                els.addCls(overCls);
            }
            else if (overCls && event.type === 'mouseout') {
                els.removeCls(overCls);
            }
        }
    },

    onDependencyStoreAdd : function (store, dependencies) {
        var me = this;
        me.maybeSwitchRenderingStrategy();
        me.renderDependencies(dependencies).then(null, Ext.emptyFn);
    },

    onDependencyStoreRemove : function (store, dependencies) {
        var me = this;
        me.maybeSwitchRenderingStrategy();
        me.clearDependencies(dependencies).then(null, Ext.emptyFn);
    },

    onDependencyStoreUpdate : function (store, dependency) {
        this.updateDependencies(dependency).then(null, Ext.emptyFn);
    },

    onDependencyStoreRefresh : function (store) {
        var me = this;
        me.maybeSwitchRenderingStrategy();
        me.renderAllDependencies().then(null, Ext.emptyFn);
    },

    onDependencyStoreClear : function (store) {
        var me = this;
        me.maybeSwitchRenderingStrategy();
        me.renderAllDependencies().then(null, Ext.emptyFn);
    },

    /* DRAG DROP LISTENERS */
    onDragStart : function () {
        var me          = this,
            primaryView = me.getPrimaryView();

        // Disable drag creator, tooltips etc
        primaryView.onDragDropStart && primaryView.onDragDropStart();
        me.tip && me.tip.disable();
        me.getPrimaryView().getEl().addCls('sch-terminals-visible');
    },

    onDependencyDrop : function (dropZone, newDependency, valid) {
        valid && this.getDependencyStore().add(newDependency);
    },

    onDependencyAfterDrop : function () {
        var primaryView = this.getPrimaryView();

        if (!primaryView.destroyed) {
            primaryView.onDragDropEnd && primaryView.onDragDropEnd();
            primaryView.getEl().removeCls('sch-terminals-visible');
            primaryView.getEl().select('.sch-terminal-hidden').removeCls('sch-terminal-hidden');

            this.tip && this.tip.enable();
        }
    }

    /* EOF DRAG DROP LISTENERS */

    /**
     * @event refresh
     *
     * Fires after the view has fully rendered all the dependencies in the underlying store.
     *
     * @param {Sch.view.Dependency} view The dependency view instance
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
});
