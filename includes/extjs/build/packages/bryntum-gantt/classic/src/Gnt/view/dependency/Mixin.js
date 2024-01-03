/**
 * This mixin is a helper for Gantt panel. It adds Dependency view instance management methods.
 */
Ext.define('Gnt.view.dependency.Mixin', {
    extend : 'Sch.view.dependency.Mixin',

    requires : [
        'Gnt.view.dependency.View'
    ],

    /**
     * @cfg {Boolean} enableDependencyDragDrop
     * True to allow creation of dependencies by using drag and drop between task terminals (defaults to true)
     */
    enableDependencyDragDrop : true,

    createDependencyView : function(config, primaryView) {
        return Sch.view.dependency.View.create(Ext.apply({}, config, {
            primaryView : primaryView,
            type        : 'basegantt'
        }));
    }
});
