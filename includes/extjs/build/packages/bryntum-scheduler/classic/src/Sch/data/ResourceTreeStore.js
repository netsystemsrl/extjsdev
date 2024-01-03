/**
 * @class Sch.data.ResourceTreeStore
 * @extends Ext.data.TreeStore
 * @mixins Sch.data.mixin.FilterableTreeStore
 *
 * This is a class holding all the resources to be rendered into a {@link Sch.panel.SchedulerTree}. It is a subclass of "Ext.data.TreeStore" - a store containing hierarchical data.
 *
 * Filtering capabilities are provided by {@link Sch.data.mixin.FilterableTreeStore}, please refer to its documentation for additional information.
 */
Ext.define("Sch.data.ResourceTreeStore", {
    extend      : 'Ext.data.TreeStore',

    requires    : [
        'Sch.patches.TreeStore',
        'Sch.patches.TreeStoreInternalIdMap'
    ],

    mixins      : [
        'Sch.data.mixin.UniversalModelGetter',
        'Sch.data.mixin.CacheHintHelper',
        'Sch.data.mixin.ResourceStore',
        'Sch.data.mixin.FilterableTreeStore',
        'Robo.data.Store'
    ],

    alias       : 'store.resourcetreestore',
    model       : 'Sch.model.Resource',
    storeId     : 'resources',

    constructor : function () {
        this.callParent(arguments);

        this.initTreeFiltering();

        if (this.getModel() !== Sch.model.Resource && !(this.getModel().prototype instanceof Sch.model.Resource)) {
            throw 'The model for the ResourceTreeStore must subclass Sch.model.Resource';
        }
    },

    setRootNode : function () {
        // this flag will prevent the "autoTimeSpan" feature from reacting on individual "append" events, which happens a lot
        // before the "rootchange" event
        this.isSettingRoot      = true;

        var res                 = this.callParent(arguments);

        this.isSettingRoot      = false;

        return res;
    }
});
