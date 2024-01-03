// @tag dependencies
/**
 * Bulk dependency rendering strategy, renders all the dependencies scheduled for rendering in one bulk.
 * @private
 */
Ext.define('Sch.view.dependency.renderingstrategy.Bulk', {

    extend : 'Sch.view.dependency.renderingstrategy.Abstract',

    alias  : 'sch_dependency_rendering_strategy.bulk',

    delegateRendering : function(view, depsToRender, depsRendered) {
        view.getPainter().paint(view.getPrimaryView(), view.getDependencyCanvas(), depsToRender, false);
        return [depsToRender, []];
    }
});
