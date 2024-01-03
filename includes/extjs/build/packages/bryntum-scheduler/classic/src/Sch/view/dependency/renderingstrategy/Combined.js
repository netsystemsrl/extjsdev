// @tag dependencies
/**
 * Combined dependency rendering strategy, maybe render dependencies in a bulk or asynchronously in several steps.
 */
Ext.define('Sch.view.dependency.renderingstrategy.Combined', {

    extend : 'Sch.view.dependency.renderingstrategy.Abstract',

    alias  : 'sch_dependency_rendering_strategy.combined',

    config : {
        /**
         * Amount of deps to render between rendering steps
         */
        depsPerStep : 50,
        /**
         * Current working mode
         */
        mode : 'bulk'
    },

    delegateRendering : function(view, depsToRender, depsRendered) {
        var me = this;
        return me.getMode() == 'bulk' ? me.delegateRenderingBulk(view, depsToRender, depsRendered) :
                                        me.delegateRenderingAsync(view, depsToRender, depsRendered);
    },

    delegateRenderingBulk : function(view, depsToRender, depsRendered) {
        view.getPainter().paint(view.getPrimaryView(), view.getDependencyCanvas(), depsToRender, false);
        return [depsToRender, []];
    },

    delegateRenderingAsync : function(view, depsToRender, depsRendered) {
        var me = this,
            depsPerStep  = me.getDepsPerStep(),
            renderedDeps = depsToRender.slice(0, depsPerStep),
            leftDeps     = depsToRender.slice(depsPerStep);

        view.getPainter().paint(view.getPrimaryView(), view.getDependencyCanvas(), renderedDeps, false);

        return [renderedDeps, leftDeps];
    }
});
