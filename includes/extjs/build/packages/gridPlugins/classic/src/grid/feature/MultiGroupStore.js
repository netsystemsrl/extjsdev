/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
/**
 * @private
 */
Ext.define('Ext.grid.feature.MultiGroupStore', {
    extend: 'Ext.util.Observable',

    isStore: true,
    isMultigroupStore: true,

    // Number of records to load into a buffered grid before it has been bound to a view of known size
    defaultViewSize: 100,

    // Use this property moving forward for all feature stores. It will be used to ensure
    // that the correct object is used to call various APIs. See EXTJSIV-10022.
    isFeatureStore: true,

    constructor: function(config) {
        var me = this,
            store = config.store;
        
        delete(config.store);
        me.callParent([config]);
        
        me.bindStore(store);

        // We don't want to listen to store events in a locking assembly.
        if (!me.multigroupingFeature.grid.isLocked) {
            me.bindViewStoreListeners();
        }
    },
    
    destroy: function(){
        var me = this;
        
        Ext.destroy(me.storeListeners);
        me.store = me.storeListeners = me.multigroupingFeature = me.renderData = null;
        me.clearListeners();

        me.callParent(arguments);
    },

    bindStore: function(store) {
        var me = this;

        if (!store || me.store !== store) {
            me.store = Ext.destroy(me.storeListeners);
        }
        if (store) {
            me.storeListeners = store.on({
                datachanged: me.onDataChanged,
                groupchange: me.onGroupChange,
                idchanged: me.onIdChanged,
                update: me.onUpdate,
                remotesummarieschanged: me.onRemoteSummaries,
                summarieschanged: me.onSummariesChanged,
                scope: me,
                destroyable: true
            });
            me.store = store;
            me.processStore();
        }
    },

    bindViewStoreListeners: function () {
        var view = this.multigroupingFeature.view,
            listeners = view.getStoreListeners(this);

        listeners.scope = view;

        this.on(listeners);
    },

    processStore: function(forceStartCollapsed) {
        var me = this,
            data = me.data,
            position = me.multigroupingFeature.summaryPosition,
            items, placeholder, groups, length, i;

        if (data) {
            data.clear();
        } else {
            data = me.data = new Ext.util.Collection({
                rootProperty: 'data',
                extraKeys: {
                    byInternalId: {
                        property: 'internalId',
                        rootProperty: ''
                    }
                }
            });
        }
        
        me.renderData = {};

        groups = me.store.getGroups();
        length = groups.length;

        if (length > 0) {
            if(forceStartCollapsed) {
                for (i = 0; i < length; i++) {
                    groups.items[i].doExpandCollapse(!me.multigroupingFeature.startCollapsed, true);
                }
            } else if(me.multigroupingFeature.startCollapsed) {
                for (i = 0; i < length; i++) {
                    groups.items[i].collapse(true);
                }
            }
            me.multigroupingFeature.startCollapsed = false;
            items = me.processGroups(groups.items);
        } else {
            items = me.store.getRange();
        }
        data.add(items);

        if(position === 'top' || position === 'bottom') {
            placeholder = me.store.getSummaryRecord();
            me.renderData[placeholder.getId()] = {
                isSummary: true
            };
            if(position === 'top') {
                data.insert(0, placeholder);
            } else {
                data.add(placeholder);
            }
        }
    },
    
    processGroups: function(groups){
        var me = this,
            data = [],
            groupCount = groups ? groups.length : 0,
            addSummary = false,
            position = me.multigroupingFeature.groupSummaryPosition,
            i, j, group, key, groupPlaceholder, depth, children;
        
        // For each record added to the data collection we need to prepare the
        // renderData object. This one will have info for:
        // - summaryData objects
        // - depth level to be able to align the record
        // - if this is the first record in a group
        // - if this is the last record in a group
        // All this info will be used by the feature setupRowData

        if (groupCount <= 0) {
            return data;
        }
        
        for (i = 0; i < groupCount; i++) {
            group = groups[i];
            addSummary = false;

            // Cache group information by group name
            key = group.getGroupKey();
            
            // if the group placeholder defined then create one
            groupPlaceholder = group.getGroupRecord();
            data.push(groupPlaceholder);
            me.renderData[groupPlaceholder.getId()] = {
                group: group,
                depth: group.getLevel(),
                isGroup: true
            };
            
            if (!group.isCollapsed) {
                children = group.getGroups();
                if(children && children.length > 0){
                    Ext.Array.insert(data, data.length, me.processGroups(children.items));
                }else{
                    Ext.Array.insert(data, data.length, group.items);
                    for(j = 0; j < group.items.length; j++){
                        me.renderData[group.items[j].getId()] = {
                            group: group,
                            depth: group.getLevel()
                        };
                    }
                }
            }

            if (position === 'bottom') {
                addSummary = !group.isCollapsed;
                depth = group.getLevel();
            }

            if (addSummary) {
                groupPlaceholder = group.getSummaryRecord();
                data.push(groupPlaceholder);
                me.renderData[groupPlaceholder.getId()] = {
                    group: group,
                    depth: depth,
                    isGroupSummary: true
                };
            }
        }
        
        return data;
    },

    onSummariesChanged: function() {
        var me = this,
            store = me.store;

        store.getSummaryRecord().calculateSummary(store.getData().items);
        me.updateSummaries(store.getGroups());
        me.fireEvent('refresh', me);
    },

    updateSummaries: function (groups) {
        var groupCount = groups ? groups.length : 0,
            i, group;

        for(i = 0; i < groupCount; i++) {
            group = groups.items[i];

            group.recalculateSummaries();

            this.updateSummaries(group.getGroups());
        }
    },

    isLoading: function() {
        return false;
    },

    getData: function () {
        return this.data;
    },

    getCount: function() {
        return this.data.getCount();
    },

    getTotalCount: function() {
        return this.data.getCount();
    },

    /**
     * Convenience function for getting the first model instance in the store.
     *
     * When store is filtered, will return first item within the filter.
     *
     * @return {Ext.data.Model/undefined} The first model instance in the store, or undefined
     */
    first: function () {
        return this.getData().first() || null;
    },

    /**
     * Convenience function for getting the last model instance in the store.
     *
     * When store is filtered, will return last item within the filter.
     *
     * @return {Ext.data.Model/undefined} The last model instance in the store, or undefined
     */
    last: function () {
        return this.getData().last() || null;
    },

    // This class is only created for fully loaded, non-buffered stores
    rangeCached: function(start, end) {
        return end < this.getCount();
    },

    getRange: function(start, end, options) {
        // Collection's getRange is exclusive. Do NOT mutate the value: it is passed to the callback.
        var result = this.data.getRange(start, Ext.isNumber(end) ? end + 1 : end);

        if (options && options.callback) {
            options.callback.call(options.scope || this, result, start, end, options);
        }
        return result;
    },

    getAt: function(index) {
        return this.data.getAt(index);
    },

    getById: function(id) {
        return this.store.getById(id);
    },

    getByInternalId: function(internalId) {
        return this.data.byInternalId.get(internalId) || null;
    },

    getRenderData: function (record) {
        return (record && record.isModel ? this.renderData[record.getId()] : null);
    },

    toggleCollapsedByRecord: function (record) {
        var data = this.renderData[record.getId()];

        if(!data) {
            return;
        }

        return this.doExpandCollapse(data.group, data.group.isCollapsed);
    },

    doExpandCollapseByPath: function (path, expanded) {
        var group = this.store.getGroups().getByPath(path);

        if(!group) {
            return;
        }

        return this.doExpandCollapse(group, expanded);
    },

    doExpandCollapse: function(group, expanded){
        var me = this,
            startIdx, items, oldItems,
            len;

        oldItems = me.processGroups([group]);
        group.doExpandCollapse(expanded);
        items = me.processGroups([group]);

        if (items.length && (startIdx = me.data.indexOf(group.getGroupRecord())) !== -1) {
            if(group.isCollapsed){
                me.isExpandingOrCollapsing = 2;
                len = oldItems.length;
                oldItems = me.data.getRange(startIdx, startIdx + len);

                // Remove the group child records
                me.data.removeAt(startIdx, len);

                me.data.insert(startIdx, items);

                me.fireEvent('replace', me, startIdx, oldItems, items);
                me.fireEvent('groupcollapse', me, group);
            }else{
                me.isExpandingOrCollapsing = 1;

                // Remove the collapsed group placeholder record
                me.data.removeAt(startIdx);

                me.data.insert(startIdx, items);
                me.fireEvent('replace', me, startIdx, oldItems, items);
                me.fireEvent('groupexpand', me, group);
            }
            me.isExpandingOrCollapsing = 0;
        }

        return items[0];
    },

    isInCollapsedGroup: function (record) {
        var expanded = true,
            groups = this.store.getGroups(),
            i, j, length, group;

        if(groups) {
            groups = groups.getGroupsByItem(record);
        }

        if(groups) {
            length = groups.length;
            for(i = 0; i < length; i++) {
                group = groups[i];
                expanded = expanded && !group.isCollapsed;
            }
        }

        return !expanded;
    },

    expandToRecord: function (record) {
        var groups = this.store.getGroups(),
            i, j, length, group;

        if(groups) {
            groups = groups.getGroupsByItem(record);
        }

        if(groups) {
            length = groups.length;
            for(i = 0; i < length; i++) {
                group = groups[i];
                if(group.isCollapsed) {
                    // expand from here
                    for(j = i+1; j < length; j++) {
                        groups[j].isCollapsed = false;
                    }
                    this.doExpandCollapse(group, true);
                    break;
                }
            }
        }
    },

    contains: function(record) {
        return this.indexOf(record) > -1;
    },

    // Find index of record in group store.
    indexOf: function(record) {
        return this.data.indexOf(record);
    },

    /**
     * Get the index within the store of the Record with the passed id.
     *
     * Like #indexOf, this method is effected by filtering.
     *
     * @param {String} id The id of the Record to find.
     * @return {Number} The index of the Record. Returns -1 if not found.
     */
    indexOfId: function(id) {
        return this.data.indexOfKey(id);
    },

    /**
     * Get the index within the entire dataset. From 0 to the totalCount.
     *
     * Like #indexOf, this method is effected by filtering.
     *
     * @param {Ext.data.Model} record The Ext.data.Model object to find.
     * @return {Number} The index of the passed Record. Returns -1 if not found.
     */
    indexOfTotal: function(record) {
        return this.store.indexOf(record);
    },

    onUpdate: function(store, record, operation, modifiedFieldNames) {
        var groupers = this.store.getGroupers(),
            len = modifiedFieldNames.length,
            refresh = false,
            i, field;

        // Propagate the record's update event
        if(groupers) {
            for(i = 0; i < len; i++) {
                field = modifiedFieldNames[i];
                refresh = refresh || !!groupers.get(field);
            }
            // if one of the modified fields is a grouper then we need to refresh the data
            if(refresh) {
                this.refreshData();
            }
        }
        if(!refresh) {
            this.fireEvent('update', this, record, operation, modifiedFieldNames);
        }
    },

    onDataChanged: function() {
        this.refreshData();
    },

    onIdChanged: function(store, rec, oldId, newId) {
        this.data.updateKey(rec, oldId);
    },

    // Relay the groupchange event
    onGroupChange: function(store, groupers) {
        if(!groupers || !groupers.length) {
            this.processStore();
        }
        this.fireEvent('groupchange', store, groupers);
    },

    refreshData: function (forceStartCollapsed) {
        this.processStore(forceStartCollapsed);
        this.fireEvent('refresh', this);
    },

    onRemoteSummaries: function () {
        this.fireEvent('refresh', this);
    }
});
