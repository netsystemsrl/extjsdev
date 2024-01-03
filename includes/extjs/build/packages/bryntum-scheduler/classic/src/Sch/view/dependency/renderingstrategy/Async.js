// @tag dependencies
/**
 * Async dependency rendering strategy, renders dependencies asynchronously in several steps.
 * @private
 */
Ext.define('Sch.view.dependency.renderingstrategy.Async', {

    extend : 'Sch.view.dependency.renderingstrategy.Abstract',

    alias  : 'sch_dependency_rendering_strategy.async',

    config : {
        /**
         * Amount of deps to render between rendering steps
         */
        depsPerStep : 50
    },

    delegateRendering : function(view, depsToRender, depsRendered) {
        var me = this,
            depsPerStep  = me.getDepsPerStep(),
            renderedDeps = depsToRender.slice(0, depsPerStep),
            leftDeps     = depsToRender.slice(depsPerStep);

        view.getPainter().paint(view.getPrimaryView(), view.getDependencyCanvas(), renderedDeps, false);

        return [renderedDeps, leftDeps];
    }
});
