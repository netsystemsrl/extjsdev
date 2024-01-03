/**
 @class Sch.feature.Grouping
 @extends Ext.grid.feature.Grouping

 A feature extending the native Ext JS grouping feature (ftype = 'scheduler_grouping'). This features provides a
 {@link #headerRenderer} hook that you can use to render custom HTML into the group header for
 every time interval in the {@link Sch.data.TimeAxis}. This header will be automatically refreshed when changes happen in the eventStore and
 resourceStore.

 To add this feature to the scheduler:

        var scheduler = Ext.create("Sch.panel.SchedulerGrid", {

            features      : [
                {
                    id                 : 'group',
                    ftype              : 'scheduler_grouping',
                    hideGroupedHeader  : true,
                    enableGroupingMenu : false,

                    headerRenderer : function (intervalStartDate, intervalEndDate, groupResources, meta) {

                        meta.cellStyle = 'background : rgba(255, 0, 0, 0.5)';
                        meta.cellCls   = 'some-css-class';

                        return 'Any text here';
                    }
                }
            ],

            ...
        });
 */
Ext.define('Sch.feature.Grouping', {
    extend   : 'Ext.grid.feature.Grouping',
    requires : ['Sch.patches.Grouping'],
    alias    : 'feature.scheduler_grouping',

    /**
     * This renderer method is called once for each time interval in the {@link Sch.data.TimeAxis time axis} when the scheduler is rendered.
     * Additionally, it is also called when resources and events are updated, added and removed. You can return any
     * arbitrary HTML to be added to each 'cell' of the header.
     *
     * @param {Date} intervalStartDate Start date of the current time interval
     * @param {Date} intervalEndDate End date of the current time interval
     * @param {Sch.model.Resource[]} groupResources The resources in the current group
     * @param {Object} meta A special object containing rendering properties for the current cell
     * @param {Object} meta.cellCls A CSS class to add to the cell DIV
     * @param {Object} meta.cellStyle Any inline styles to add to the cell DIV
     * @return {String}
     */
    headerRenderer : Ext.emptyFn,

    eventStoreDetacher      : null,
    assignmentStoreDetacher : null,
    resourceStoreDetacher   : null,

    schedulerGroupHeaderTpl : '{[this.renderCells(values)]}',

    headerCellTpl : '<tpl for=".">' +
    '<div class="sch-grid-group-hd-cell {cellCls}" style="{cellStyle}; width: {width}px;">' +
    '<span>{value}</span>' +
    '</div>' +
    '</tpl>',

    renderCells : function (data) {
        var viewModel = this.view.getTimeAxisViewModel();
        var ticks     = viewModel.columnConfig[viewModel.columnLinesFor];

        var tplData   = Ext.Array.map(ticks, function (tick) {
            var meta = {};
            var value = this.headerRenderer(tick.start, tick.end, data.children, meta);

            meta.value = Ext.isEmpty(value) ? '&nbsp;' : value;
            meta.width = viewModel.getDistanceBetweenDates(tick.start, tick.end);

            return meta;
        }, this);

        return this.headerCellTpl.apply(tplData);
    },

    disable : function () {
        this.unbindStoreListeners();
        this.callParent(arguments);
    },

    enable : function () {
        this.bindStoreListeners();
        this.callParent(arguments);
    },

    // init works for both normal and locked grids
    init : function () {
        var view = this.view;
        var me   = this;

        this.callParent(arguments);

        if (typeof this.headerCellTpl === 'string') {
            this.headerCellTpl = new Ext.XTemplate(this.headerCellTpl);
        }

        // The functionality of this class only applies to the scheduling view section
        if (view.getResourceStore) {
            this.bindStoreListeners();

            this.groupHeaderTpl = new Ext.XTemplate(this.schedulerGroupHeaderTpl, {
                renderCells : Ext.Function.bind(me.renderCells, me)
            });

            view.on({
                resourcestorechange   : this.bindStoreListeners,
                eventstorechange      : this.bindStoreListeners,
                assignmentstorechange : this.bindStoreListeners,
                scope                 : this
            });
        }

        // HACK Still relevant for 6.5.3
        // https://www.sencha.com/forum/showthread.php?288604
        Ext.apply(view, {
            getRowNode : function (resourceRecord) {
                return this.retrieveNode(this.getRowId(resourceRecord), true);
            }
        });

        view.groupingFeature = this;
    },

    /**
     * Will bind listeners and leave detachers on normal view
     * @private
     */
    bindStoreListeners : function () {
        var view = this.view;

        if (!view.isLockedView) {
            var eventStore = view.getEventStore();
            var listeners = this.getStoreListeners();

            this.unbindStoreListeners();

            if (eventStore) {
                this.eventStoreDetacher = view.mon(eventStore, listeners.eventStore);
            }
            if (eventStore && eventStore.getAssignmentStore()) {
                this.assignmentStoreDetacher = view.mon(eventStore.getAssignmentStore(), listeners.assignmentStore);
            }

            if (view.getResourceStore()) {
                this.resourceStoreDetacher = view.mon(view.getResourceStore(), listeners.resourceStore);
            }
        }
    },

    unbindStoreListeners : function () {
        if (!this.view.isLockedView) {
            Ext.destroyMembers(this, 'eventStoreDetacher', 'resourceStoreDetacher', 'assignmentStoreDetacher');
        }
    },

    getStoreListeners : function () {
        var view      = this.view,
            listeners = {
                resourceStore : {
                    add         : this.onResourceAdd,
                    destroyable : true,
                    scope       : this
                }
            };

        if (view.getEventStore) {
            listeners.eventStore = {
                add         : this.onEventAddOrRemove,
                remove      : this.onEventAddOrRemove,
                update      : this.onEventUpdate,
                destroyable : true,
                scope       : this
            };

            if (view.getEventStore().getAssignmentStore()) {
                listeners.assignmentStore = {
                    add         : this.onAssignmentAddOrRemove,
                    update      : this.onAssignmentUpdate,
                    remove      : this.onAssignmentAddOrRemove,
                    destroyable : true,
                    scope       : this
                };
            }
        }

        return listeners;
    },

    /**
     * Will refresh grouping headers for passed resources avoiding duplicate calls
     * @param {Sch.model.Resource[]} resourceRecords
     * @private
     */
    refreshGrouping : function (resourceRecords) {
        if (!this.view.getStore().isGrouped()) return;

        var me = this;
        var resourcesToRepaint = {};

        // for each assignment
        Ext.Array.each(resourceRecords, function (resource) {
            if (resource) {
                var groups = me.getRecordGroup(resource);

                if (groups) {
                    // get first member of the resource groups
                    var first   = groups.first();
                    var firstId = first.getId();

                    // if we didn't process this group yet
                    if (!resourcesToRepaint[firstId]) {
                        resourcesToRepaint[firstId] = first;
                        me.refreshGroupHeader(first, true);
                    }
                }
            }
        });
    },

    onAssignmentAddOrRemove : function (store, records) {
        if (!this.view.getStore().isGrouped()) return;

        var resourceStore = this.view.getResourceStore();

        this.refreshGrouping(Ext.Array.map(records, function (record) {
            // no need to filter records here, we handle it further
            return record.getResource(resourceStore);
        }));
    },

    onAssignmentUpdate : function (store, assignment) {
        if (!this.view.getStore().isGrouped()) return;

        var resourceStore = this.view.getResourceStore();
        var resourceRows  = [assignment.getResource(resourceStore)];

        if (assignment.previous && assignment.previous[assignment.resourceIdField]) {
            resourceRows.push(resourceStore.getById(assignment.previous[assignment.resourceIdField]));
        }

        this.refreshGrouping(resourceRows);
    },

    onEventUpdate : function (store, record) {
        if (!this.view.getStore().isGrouped()) return;

        var me              = this;
        var assignmentStore = store.getAssignmentStore();

        if (assignmentStore) {
            me.refreshGrouping(record.getResources());
        } else {
            var groupField  = store.getResourceStore().getGroupField();
            var rowChanged  = record.previous && record.resourceIdField in record.previous;
            var newResource = record.getResource();

            if (rowChanged) {
                var oldResource = store.getResourceStore().getById(record.previous[record.resourceIdField]);

                if (oldResource && (!newResource || oldResource.get(groupField) !== newResource.get(groupField))) {
                    me.refreshGroupHeader(oldResource);
                }
            }

            if (newResource) {
                me.refreshGroupHeader(newResource);
            }
        }
    },

    onEventAddOrRemove : function (store, eventRecords) {
        // HACK avoid reacting to add events happening before a refresh event will be triggered
        // https://app.assembla.com/spaces/bryntum/tickets/4746
        if (!this.view.getStore().isGrouped() || store.ignoreCollectionAdd) return;

        var me          = this;
        var view        = me.view;
        var eventStore  = view.getEventStore();

        // Grab all affected resources
        var resourceRecords = Ext.Array.map(eventRecords, function (event) {
            return eventStore.getResourcesForEvent(event);
        });

        // Flatten first, then remove any duplicates
        resourceRecords = [].concat.apply([], resourceRecords);

        this.refreshGrouping(Ext.Array.unique(resourceRecords));
    },

    onResourceAdd : function (store, records) {
        if (!this.view.getStore().isGrouped()) return;

        this.refreshGrouping(records);
    },

    /**
     * Will first record in the same group as this resource and will repaint that node (refresh grouping header).
     * @param {Sch.model.Resource} resource Resource to repaint grouping header for.
     * @param {Boolean} [isHeader] If you know you're passing first resource in group, you can pass true here to skip
     * lookup
     * @private
     */
    refreshGroupHeader : function (resource, isHeader) {
        var me   = this,
            view = me.view;

        // feature may be disabled or store might be not grouped
        if (me.disabled || !me.view.getResourceStore().isGrouped()) return;

        view.refreshNode(isHeader ? resource : me.getRecordGroup(resource).first());
    }
});
