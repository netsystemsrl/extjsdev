/**
@class Sch.selection.EventModel
@extends Ext.selection.Model

This class provides the basic implementation event selection in a grid.

*/
Ext.define("Sch.selection.EventModel", {
    extend      : 'Ext.selection.Model',

    alias       : 'selection.eventmodel',

    requires    : [ 'Ext.util.KeyNav' ],

    /**
     * @cfg {Boolean} deselectOnContainerClick `True` to deselect all events when user clicks on the underlying space in scheduler. Defaults to `true`.
     */
    deselectOnContainerClick : true,

    // Stores selected record on mousedown event to avoid
    // unselecting record on click
    selectedOnMouseDown : null,

    /**
     * @event beforedeselect
     * Fired before a record is deselected. If any listener returns false, the
     * deselection is cancelled.
     * @param {Sch.selection.EventModel} this
     * @param {Sch.model.Event} record The selected event
     */

    /**
     * @event beforeselect
     * Fired before a record is selected. If any listener returns false, the
     * selection is cancelled.
     * @param {Sch.selection.EventModel} this
     * @param {Sch.model.Event} record The selected event
     */

    /**
     * @event deselect
     * Fired after a record is deselected
     * @param {Sch.selection.EventModel} this
     * @param {Sch.model.Event} record The selected event
     */

    /**
     * @event select
     * Fired after a record is selected
     * @param {Sch.selection.EventModel} this
     * @param {Sch.model.Event} record The selected event
     */

    // Some abstract methods from parent class that require to be implemented
    bindComponent : Ext.emptyFn,
    onEditorKey   : Ext.emptyFn,
    onStoreLoad   : Ext.emptyFn,

    /**
     */
    bindToView : function(view) {

        var me = this;

        me.view = view;

        me.bindStore(me.getSelectionStore(view));

        view.on({
            eventclick     : me.onEventClick,
            eventmousedown : me.onEventMouseDown,
            itemmousedown  : me.onItemMouseDown,
            refresh        : function() {
                me.refresh();
            },
            destroy        : function() {
                me.bindStore(null);
            },
            scope          : me
        });
    },

    getSelectionStore : function(view) {
        return view.getEventStore();
    },

    bindStore : function(store) {
        if (this.getStore()) {
            this.mun(this.getStore(), 'load', this.onSelectionStoreLoad, this);
        }

        if (store) {
            this.mon(store, 'load', this.onSelectionStoreLoad, this);
        }

        this.callParent(arguments);
    },

    onSelectionStoreLoad : function() {
        this.deselectAll();
    },

    onEventMouseDown: function(view, record, e) {
        // Reset previously stored records
        this.selectedOnMouseDown = null;

        // Change selection before dragging to avoid moving of unselected events
        if ((!this.ignoreRightMouseSelection || e.button !== 2) && !this.isSelected(record)) {
            this.selectedOnMouseDown = record;
            this.selectWithEvent(record, e);
        }
    },

    onEventClick: function(view, record, e) {
        // Don't change selection if record been already selected on mousedown
        if ((!this.ignoreRightMouseSelection || e.button !== 2) && !this.selectedOnMouseDown) {
            this.selectWithEvent(record, e);
        }
    },

    onItemMouseDown: function(a, b, c, d, eventObj) {
        if (this.deselectOnContainerClick && !eventObj.getTarget(this.view.eventSelector)) {
            this.deselectAll();
        }
    },

    onSelectChange: function(record, isSelected, suppressEvent, commitFn) {
         var me       = this,
            view      = me.view,
            store     = me.store,
            eventName = isSelected ? 'select' : 'deselect',
            i = 0;

        if (view && (suppressEvent || me.fireEvent('before' + eventName, me, record)) !== false && commitFn() !== false) {

            if (isSelected) {
                view.onEventBarSelect(record, suppressEvent);
            } else {
                view.onEventBarDeselect(record, suppressEvent);
            }

            if (!suppressEvent) {
                me.fireEvent(eventName, me, record);
            }
        }
    },

    // Not supported.
    selectRange : Ext.emptyFn,

    selectNode: function(node, keepExisting, suppressEvent) {
        var r = this.view.resolveEventRecord(node);
        if (r) {
            this.select(r, keepExisting, suppressEvent);
        }
    },

    deselectNode: function(node, keepExisting, suppressEvent) {
        var r = this.view.resolveEventRecord(node);
        if (r) {
            this.deselect(r, suppressEvent);
        }
    },

    /**
     * Returns first selected event record for the given resource record or null if the resource has no assigned
     * events which are selected.
     *
     * @param {Sch.model.Resource} resource
     * @return {Sch.model.Event}
     */
    getFirstSelectedEventForResource : function(resource) {
        var selections = this.getSelection(),
            event = null,
            i, len, r;

        for (i = 0, len = selections.length; !event && i < len; ++i) {
            r = selections[i];
            if (r.isAssignedTo(resource)) {
                event = r;
            }
        }

        return event;
    },

    getDraggableSelections : function() {
        return Ext.Array.filter(
            this.getSelection(),
            function(record) {
                return record.isDraggable();
            }
        );
    },

    forEachEventRelatedSelection : function(eventRecord, fn) {
        this.isSelected(eventRecord) && fn(eventRecord);
    },


    // @OVERRIDE: 6.5.1 introduced a bug/behavior change leading to records not being selected after refresh
    refresh: function() {
        var me = this,
            store = me.store,
            toBeSelected = [],
            toBeReAdded = [],
            oldSelections = me.getSelection(),
            len = oldSelections.length,
            // Will be a Collection in this and DataView classes.
            // Will be an Ext.grid.selection.Rows instance for Spreadsheet (does not callParent for other modes).
            // API used in here, getCount() and add() are common.
            selected = me.getSelected(),
            change, d, storeData, selection, rec, i;
        // Not been bound yet, or we have never selected anything.
        if (!store || !(selected.isCollection || selected.isBag || selected.isRows) || !selected.getCount()) {
            return;
        }
        // We need to look beneath any filtering to see if the selected records are still owned by the store
        storeData = store.getData();
        // Attempt to get the underlying source collection to avoid filtering
        if (storeData.getSource) {
            d = storeData.getSource();
            if (d) {
                storeData = d;
            }
        }
        me.refreshing = true;
        // Inhibit update notifications during refresh of the selected collection.
        selected.beginUpdate();
        me.suspendChanges();
        // Add currently records to the toBeSelected list if present in the Store
        // If they are not present, and pruneRemoved is false, we must still retain the record
        for (i = 0; i < len; i++) {
            selection = oldSelections[i];
            rec = storeData.get(selection.getId());
            if (rec) {
                toBeSelected.push(rec);
            }
            // Selected records no longer represented in Store must be retained
            else if (!me.pruneRemoved) {
                toBeReAdded.push(selection);
            }
            // In single select mode, only one record may be selected
            if (me.mode === 'SINGLE' && toBeReAdded.length) {
                break;
            }
        }
        // there was a change from the old selected and
        // the new selection
        if (selected.getCount() !== (toBeSelected.length + toBeReAdded.length)) {
            change = true;
        }
        me.clearSelections();
        if (toBeSelected.length) {
            // perform the selection again
            me.doSelect(toBeSelected, false, true);
        }
        // If some of the selections were not present in the Store, but pruneRemoved is false, we must add them back
        if (toBeReAdded.length) {
            selected.add(toBeReAdded);
            // No records reselected.
            if (!me.lastSelected) {
                me.lastSelected = toBeReAdded[toBeReAdded.length - 1];
            }
        }
        me.resumeChanges();
        // If the new data caused the selection to change, announce the update using endUpdate,
        // Otherwise, end the update silently.
        // Bindings may be attached to selection - we need to coalesce changes.
        if (change) {
            selected.endUpdate();
        } else {
            selected.updating--;
        }
        me.refreshing = false;
        me.maybeFireSelectionChange(change);
    }
});
