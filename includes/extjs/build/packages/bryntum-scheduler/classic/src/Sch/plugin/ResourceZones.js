/**
 * A plugin (ptype = 'scheduler_resourcezones') for visualizing resource specific meta data such as availability, used internally by the Scheduler.
 * To use this feature, assign an {@link Sch.data.EventStore eventStore} to the {@link Sch.mixin.SchedulerPanel#cfg-resourceZones resourceZones}
 * config on the main Scheduler panel class. Additionally, you can provide the {@link Sch.mixin.SchedulerPanel#cfg-resourceZonesConfig resourceZonesConfig} object
 * with configuration options.
 *
 *
 *     {
 *         xtype           : 'schedulergrid',
 *         region          : 'center',
 *         startDate       : new Date(2013, 0, 1),
 *         endDate         : new Date(2014, 0, 1),
 *         resourceStore   : new Sch.data.ResourceStore(),
 *         // Meta events such as availabilities can be visualized here
 *         resourceZones   : new Sch.data.EventStore(),
 *         resourceZonesConfig : {
 *             innerTpl : '... customized template here ...'
 *         },
 *         eventStore      : new Sch.data.EventStore()  // Regular tasks in this store
 *     }
 *
 * {@img scheduler/images/resource-zones.png 2x}
 *
 * Records in the store should be regular {@link Sch.model.Event events} where you can specify the Resource, StartDate, EndDate and Cls (to set a CSS class on the rendered zone).
 */
Ext.define("Sch.plugin.ResourceZones", {
    extend : 'Sch.plugin.RowZones',
    alias  : 'plugin.scheduler_resourcezones',

    /**
     * @cfg {String/Ext.XTemplate} innerTpl A template providing additional markup to render into each timespan element
     */

    /**
     * @cfg {Sch.data.EventStore} store (required) The store containing the meta 'events' to be rendered for each resource
     */

    cls : 'sch-resourcezone',

    init : function (scheduler) {
        this.callParent(arguments);

        this.store.setResourceStore(scheduler.getResourceStore());

        scheduler.on('resourcestorechange', this.onResourceStoreChange, this);
    },

    /**
     * @method getTemplateData
     *
     * Returns data to apply to the HTML template for rendering a timespan element. You can use this to apply custom styling to each rendered timespan.
     *
     *      resourceZonesConfig : {
     *          getTemplateData : function (zone) {
     *              var data = Sch.plugin.ResourceZones.prototype.getTemplateData.call(this, zone);
     *
     *               if (zone.getResourceId() === 6) {
     *                   data.style = "background:#ddd";
     *               }
     *               return data;
     *           }
     *      }
     *
     * @param {Ext.data.Model} record
     *
     * @return {Object}
     */

    onResourceStoreChange : function (panel, newStore) {
        this.store.setResourceStore(newStore);
    },

    getRecordZones : function (record) {
        // get list of zones associated w/ the resource from this.store
        return record.getEvents(this.store);
    },

    getViewRecordByZone : function (zone) {
        return zone.getResource();
    },

    getZoneContainerEl : function (zone) {
        var result;

        if (this.scheduler.isHorizontal()) {
            result = this.callParent(arguments);
        } else {
            var view           = this.scheduler.getSchedulingView(),
                resourceRecord = zone.getResource();

            if (view.el && resourceRecord) {
                var colIndex = view.resourceStore.indexOf(resourceRecord);
                result = view.getNode(0).querySelector('.' + Ext.baseCSSPrefix + 'grid-cell:nth-child(' + (colIndex + 1) + ') .' + Ext.baseCSSPrefix + 'grid-cell-inner');
            }
        }

        return result;
    },

    fullRefresh : function () {
        var me   = this,
            view = this.scheduler.getSchedulingView();

        if (me.scheduler.isHorizontal()) {
            this.callParent(arguments);

        // if view is rendered
        } else if (view.el) {
            // remove this plugin instance related zone elements
            view.el.select('.' + this.uniqueCls).remove();

            view.resourceStore.each(function (resource) {
                me.renderRecordZones(resource, true);
            });
        }
    }

});
