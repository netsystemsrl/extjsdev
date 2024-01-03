// @tag dependencies
/**
 * Abstract dependency rendering strategy.
 *
 * The strategy is implemented as finite state automata.
 * Please consult [the automata chart](doc-resources/scheduler/images/deps/deps_rendering_strategy.svg)
 */
Ext.define('Sch.view.dependency.renderingstrategy.Abstract', function() {

    function depsToMap(deps) {
        return Ext.Array.reduce(deps, function(result, d) {
            result[d.getId()] = d;
            return result;
        }, {});
    }

    // This is 10 times faster then simple Ext.Array.unique()
    function uniqueDeps(deps) {
        return Ext.Object.getValues(depsToMap(deps));
    }

    // This is also faster the Ext.Array.diff()
    function diffDeps(depsA, depsB) {
        var mapA, mapB,
            result = [];

        mapA = depsToMap(depsA);
        mapB = depsToMap(depsB);

        Ext.Object.each(mapA, function(k, v) {
            mapB.hasOwnProperty(k) || result.push(v);
        });

        return result;
    }

    var methodDenyFn = function() {
        Ext.Error.raise('Method is not allowed to call at this state');
    };

    // Abstract state API
    var stateApi = {
        render          : methodDenyFn,
        clear           : methodDenyFn,
        scheduledRender : methodDenyFn,
        destroy         : methodDenyFn
    };

    var readyState, scheduledRenderingState, destroyedState;

    // Initial state of the strategy rendering automata
    readyState = Ext.applyIf({

        // Event render
        render : function(me, view, deps, all) {
            var promise, resolvePromiseFn, rejectPromiseFn,
                hiddenParent;

            // Create promise
            promise = new Ext.Promise(function(resolve, reject) {
                resolvePromiseFn = resolve;
                rejectPromiseFn  = reject;
            });

            // Can render?
            if (view.canDrawDependencies()) {

                // Store deps
                me._depsToRender = deps;
                me._depsRendered = [];

                // <debug>
                Ext.Array.reduce(me._depsToRender, function(result, d) {
                    return result && !!d.store;
                }, true) || Ext.Error.raise('Can\'t render unstorred dependency');
                // </debug>

                // Detect hidden parent
                hiddenParent = view.getPrimaryView().up("{isHidden()}");

                // Has hidden parent?
                if (hiddenParent) {

                    // Schedule deferred rendering on show
                    me._scheduledRenderDetacher = hiddenParent.on('show', function() {
                        delete me._scheduledRenderDetacher;
                        me._fsaState.scheduledRender(me, view);
                    }, null, { single : true, destroyable : true });
                }
                else {

                    // Schedule deferred rendering asap
                    me._scheduledRenderCancelId = Ext.asap(function() {
                        delete me._scheduledRenderCancelId;
                        me._fsaState.scheduledRender(me, view);
                    });
                }

                // Fire start rendering
                /**
                 * @event rendering-start Fires when rendering process is scheduled to start
                 *
                 * @param {Sch.view.dependency.renderingstrategy.Abstract} me
                 *
                 * @member Sch.view.dependency.renderingstrategy.Abstract
                 */
                me.hasListeners['rendering-start'] && me.fireEvent('rendering-start', me);

                // Store promise
                me._renderPromise        = promise;
                me._renderPromiseResolve = resolvePromiseFn;
                me._renderPromiseReject  = rejectPromiseFn;

                // Ready -> Scheduled rendering state
                me._fsaState = scheduledRenderingState;
            }
            else {
                // Reject promise w/deps unredered
                rejectPromiseFn(deps);
            }

            return promise;
        },

        // Event clear
        clear : function(me, view, deps, all) {
            // Create promise
            var promise;

            // Can render?
            if (view.canDrawDependencies()) {

                // Has canvas?
                if (view.isDependencyCanvasPresent()) {
                    // Clear dependencies via painter
                    if (all) {
                        view.getPainter().paint(view.getPrimaryView(), view.getDependencyCanvas(), [], true);
                    }
                    else {
                        Ext.destroy(view.getPainter().getElementsForDependency(view.getDependencyCanvas(), deps));
                    }
                }

                // Resolve promise w/deps cleared
                promise = Ext.Promise.resolve(deps);
            }
            else {
                // Reject promise w/deps uncleared
                promise = Ext.Promise.reject(deps);
            }

            return promise;
        },

        // Event destroy
        destroy : function(me) {

            // Set destroyed
            me.destroyed = true;
            // Ready -> destroyed state
            me._fsaState = destroyedState;
        }
    }, stateApi);

    // Scheduled rendering state of the strategy rendering automata
    scheduledRenderingState = Ext.applyIf({
        // Event render
        render : function(me, view, deps, all) {

            // Unite deps w/stored deps
            me._depsToRender = all ? deps : uniqueDeps(me._depsToRender.concat(deps));

            // <debug>
            Ext.Array.reduce(me._depsToRender, function(result, d) {
                return result && !!d.store;
            }, true) || Ext.Error.raise('Can\'t render unstored dependency');
            // </debug>

            return me._renderPromise;
        },

        // Event clear
        clear : function(me, view, deps, all) {
            // Create promise
            var promise;

            // Can render?
            if (view.canDrawDependencies()) {

                // Has canvas?
                if (view.isDependencyCanvasPresent()) {
                    // Clear dependencies via painter
                    if (all) {
                        view.getPainter().paint(view.getPrimaryView(), view.getDependencyCanvas(), [], true);
                    }
                    else {
                        Ext.destroy(view.getPainter().getElementsForDependency(view.getDependencyCanvas(), deps));
                    }
                }

                // Remove deps from deps to render
                if (all) {
                    me._depsToRender = [];
                }
                else {
                    me._depsToRender = diffDeps(me._depsToRender, deps);
                }

                // Resolve promise w/deps cleared
                promise = Ext.Promise.resolve(deps);
            }
            else {
                // Reject promise w/deps uncleared
                promise = Ext.Promise.reject(deps);
            }

            return promise;
        },

        // Scheduled render event
        scheduledRender : function(me, view) {
            var hiddenParent,
                depsDone;

            // Can render?
            if (view.canDrawDependencies()) {

                // Detect hidden parent
                hiddenParent = view.getPrimaryView().up("{isHidden()}");

                // Has hidden parent?
                if (hiddenParent) {

                    // Schedule deferred rendering on show
                    me._scheduledRenderDetacher = hiddenParent.on('show', function() {
                        delete me._scheduledRenderDetacher;
                        me._fsaState.scheduledRender(me, view);
                    }, null, { single : true, destroyable : true });
                }
                else {
                    // Has deps to render?
                    if (me._depsToRender.length > 0) {

                        // <debug>
                        Ext.Array.reduce(me._depsToRender, function(result, d) {
                            return result && !!d.store;
                        }, true) || Ext.Error.raise('Can\'t render unstorred dependency');
                        // </debug>

                        // Delegate rendering
                        depsDone = me.delegateRendering(view, me._depsToRender, me._depsRendered);

                        // <debug>
                        Ext.Assert && Ext.Assert.isArray(depsDone, "Delegate rendering result must be an array");
                        Ext.Assert && Ext.Assert.truthy(depsDone.length == 2, "Delegate rendering result array length must be 2");
                        // </debug>

                        // Unite just rendered w/deps rendered
                        me._depsRendered = uniqueDeps(me._depsRendered.concat(depsDone[0]));

                        // Deps to render = left deps
                        me._depsToRender = depsDone[1];

                        // Fire rendering progress
                        /**
                        * @event rendering-progress Fires upon rendering progress
                        *
                        * @param {Sch.view.dependency.renderingstrategy.Abstract} me
                        * @param {Sch.model.DependencyBase[]} depsToRender
                        * @param {Sch.model.DependencyBase[]} depsRendered
                        *
                        * @member Sch.view.dependency.renderingstrategy.Abstract
                        */
                        me.hasListeners['rendering-progress'] && me.fireEvent('rendering-progress', me, me._depsToRender, me._depsRendered);

                        // Has deps to render left?
                        if (me._depsToRender.length > 0) {

                            // Schedule deferred rendering
                            me._scheduledRenderCancelId = Ext.asap(function() {
                                delete me._scheduledRenderCancelId;
                                me._fsaState.scheduledRender(me, view);
                            });
                        }
                        else {
                            // Fire rendering complete
                            /**
                            * @event rendering-complete Fires upon rendering completion
                            *
                            * @param {Sch.view.dependency.renderingstrategy.Abstract} me
                            * @param {Sch.model.DependencyBase[]} depsRendered
                            *
                            * @member Sch.view.dependency.renderingstrategy.Abstract
                            */
                            me.hasListeners['rendering-complete'] && me.fireEvent('rendering-complete', me, me._depsRendered);

                            // Resolve stored promise w/deps rendered
                            me._renderPromiseResolve(me._depsRendered);

                            // Delete stored promise
                            delete me._renderPromise;
                            delete me._renderPromiseResolve;
                            delete me._renderPromiseReject;
                            // Delete deps to render and rendered deps
                            delete me._depsToRender;
                            delete me._depsRendered;

                            // Scheduled rendering -> Ready state
                            me._fsaState = readyState;
                        }
                    }
                    else {
                        // Fire rendering complete
                        me.hasListeners['rendering-complete'] && me.fireEvent('rendering-complete', me, me._depsRendered);

                        // Resolve stored promise w/deps rendered
                        me._renderPromiseResolve(me._depsRendered);

                        // Delete stored promise
                        delete me._renderPromise;
                        delete me._renderPromiseResolve;
                        delete me._renderPromiseReject;
                        // Delete deps to render and rendered deps
                        delete me._depsToRender;
                        delete me._depsRendered;

                        // Scheduled rendering -> Ready state
                        me._fsaState = readyState;
                    }
                }
            }
            else {
                // Fire rendering canceled
                /**
                 * @event rendering-canceled Fires upon rendering cancelation
                 *
                 * @param {Sch.view.dependency.renderingstrategy.Abstract} me
                 * @param {Sch.model.DependencyBase[]} depsRendered
                 * @param {Sch.model.DependencyBase[]} depsToRender
                 *
                 * @member Sch.view.dependency.renderingstrategy.Abstract
                 */
                me.hasListeners['rendering-canceled'] && me.fireEvent('rendering-canceled', me, me._depsRendered, me._depsToRender);

                // Reject stored promise w/deps unrendered
                me._renderPromiseReject(me._depsToRender);

                // Delete stored promise
                delete me._renderPromise;
                delete me._renderPromiseResolve;
                delete me._renderPromiseReject;
                // Delete deps to render and rendered deps
                delete me._depsToRender;
                delete me._depsRendered;

                // Scheduled rendering -> Ready state
                me._fsaState = readyState;
            }
        },

        // Event destroy
        destroy : function(me) {

            // Has asap cancel id?
            if (me._scheduledRenderCancelId) {
                // Cancel asap
                Ext.asapCancel(me._scheduledRenderCancelId);
                // Delete cancel id
                delete me._scheduledRenderCancelId;
            }

            // Has show detacher?
            if (me._scheduledRenderDetacher) {
                // Destroy show detacher
                Ext.destroy(me._scheduledRenderDetacher);
                // Delete show detacher
                delete me._scheduledRenderDetacher;
            }

            // Fire rendering canceled
            me.hasListeners['rendering-canceled'] && me.fireEvent('rendering-canceled', me, me._depsRendered, me._depsToRender);

            // Reject stored promise w/deps unrendered
            me._renderPromiseReject(me._depsToRender);

            // Delete stored promise
            delete me._renderPromise;
            delete me._renderPromiseResolve;
            delete me._renderPromiseReject;
            // Delete deps to render and rendered deps
            delete me._depsToRender;
            delete me._depsRendered;

            // Set destroyed
            me.destroyed = true;

            // Scheduled rendering -> destroyed state
            me._fsaState = destroyedState;
        }
    }, stateApi);

    // Destroyed state of the strategy rendering automata
    destroyedState = stateApi;

    return {

        alias  : "sch_dependency_rendering_strategy.abstract",

        mixins : [
            'Ext.mixin.Factoryable',
            'Ext.mixin.Observable'
        ],

        _fsaState : readyState,

        constructor : function(config) {
            var me = this;
            me.mixins.observable.constructor.call(me, config);
        },

        destroy : function() {
            var me = this;
            return me._fsaState.destroy(me);
        },

        /**
         * Renders all or just given dependencies.
         *
         * @param {Sch.view.dependency.View} view Dependency view to draw onto.
         *
         * @param {Sch.model.DependencyBase[]|null} [deps=null] Depepndency records to draw. If null given then all dependencies
         *                                                      will be drawn.
         *
         * @return {Ext.Promise.<Sch.model.DependencyBase[], Ext.Promise.<Sch.model.DependencyBase[]>}
         *
         * Returns promise which will be resolved with dependency records rendered, or reject with dependency
         * records unrendered.
         */
        renderDependencies : function(view, deps) {
            var me = this,
                all = !deps;

            return me._fsaState.render(me, view, deps || view.getDependencyStore().getRange(), all);
        },

        /**
         * Clears all or just given dependencies.
         *
         * @param {Sch.view.dependency.View} view Dependency view to draw onto.
         *
         * @param {Sch.model.DependencyBase[]|null} [deps=null] Dependency records to clear. If null given then all dependencies
         *                                                      will be cleared.
         *
         * @return {Ext.Promise.<Sch.model.DependencyBase[], Ext.Promise.<Sch.model.DependencyBase[]>}
         *
         * Returns promise which will be resolved with dependency records cleared, or reject with dependency
         * records uncleared.
         */
        clearDependencies : function(view, deps) {
            var me = this,
                all = !deps;

            return me._fsaState.clear(me, view, deps || view.getDependencyStore().getRange(), all);
        },

        /**
         * Updates all or just given dependencies.
         *
         * @param {Sch.view.dependency.View} view Dependency view to draw onto.
         *
         * @param {Sch.model.DependencyBase[]|null} [deps=null] Dependency records to update. If null given then all dependencies
         *                                                  will be updated.
         *
         * @return {Ext.Promise.<Sch.model.DependencyBase[], Ext.Promise.<Sch.model.DependencyBase[]>}
         *
         * Returns promise which will be resolved with dependency records updated, or reject with dependency
         * records unupdated.
         */
        updateDependencies : function(view, deps) {
            var me = this,
                all = !deps;

            // No deps means all deps
            deps = deps || view.getDependencyStore().getRange();

            return me._fsaState.clear(me, view, deps, all).then(
                function() {
                    // Dependency store dataset might have been changed at this point, since the call is asynchronous
                    // so we are to re-query the store if all dependencies should be updated or filter out the one removed
                    deps = all ? view.getDependencyStore().getRange() : Ext.Array.reduce(deps, function(deps, d) {
                        // If record has id, it would not be unjoined from store immediately, but it will be present
                        // in array of removed records.
                        // dependencies/222_concurring_dependencies
                        if (d.store && Ext.Array.indexOf(d.store.removed, d) === -1) {
                            deps.push(d);
                        }
                        return deps;
                    }, []);

                    return !me.destroyed ? me._fsaState.render(me, view, deps, all) : deps;
                }
            );
        },

        /**
         * Actual dependencies rendering template method, must be implemented by inheriting strategy
         *
         * @param {Sch.view.dependency.View} view
         * @param {Sch.model.DependencyBase[]} depsToRender
         * @param {Sch.model.DependencyBase[]} depsRendered
         *
         * @return {Array}
         * @return {Sch.model.DependencyBase[]} return.0 Dependencies rendered during call to the method
         * @return {Sch.model.DependencyBase[]} return.1 Dependencies left to render
         *
         * @protected
         * @template
         */
        delegateRendering : function(view, depsToRender, depsRendered) {
            // <debug>
            Ext.Error.raise("Abstract method call");
            // </debug>
        },

        inheritableStatics : {
            depsToMap  : depsToMap,
            uniqueDeps : uniqueDeps,
            diffDeps   : diffDeps
        }
    };
});
