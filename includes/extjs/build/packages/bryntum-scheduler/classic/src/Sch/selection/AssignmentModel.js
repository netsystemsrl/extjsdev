/**
 * @class Sch.selection.AssignmentModel
 * @extends Ext.selection.Model
 *
 * This class provides assignment selection model for multiple assignments mode, i.e. when the event store is configured
 * with assignment store and uses it for storing event to resource and resource to event assignment information.
 * In multiple assignment mode there're might be several event bars rendered for each event in the event store, thus
 * an inconsistency appears, to solve the inconsistency we use assignment record as entities being selected since
 * there's direct correspondence between event bar and assignment the bar is rendered for.
 */
Ext.define('Sch.selection.AssignmentModel', {
    extend : 'Sch.selection.EventModel',
    alias  : 'selection.assignmentmodel',

    /**
     * @event beforedeselect
     * @preventable
     * Fired before a record is deselected. If any listener returns false, the
     * deselection is cancelled.
     * @param {Sch.selection.EventModel} this
     * @param {Sch.model.Assignment} record The selected assignment
     */

    /**
     * @event beforeselect
     * @preventable
     * Fired before a record is selected. If any listener returns false, the
     * selection is cancelled.
     * @param {Sch.selection.EventModel} this
     * @param {Sch.model.Assignment} record The selected assignment
     */

    /**
     * @event deselect
     * Fired after a record is deselected
     * @param {Sch.selection.EventModel} this
     * @param {Sch.model.Assignment} record The selected assignment
     */

    /**
     * @event select
     * Fired after a record is selected
     * @param {Sch.selection.EventModel} this
     * @param {Sch.model.Assignment} record The selected assignment
     */

    assignmentStoreDetacher : null,

    getSelectionStore : function(view) {
        return view.getEventStore().assignmentStore;
    },

    onBindStore : function(assignmentStore) {
        this.callParent(arguments);

        if (assignmentStore) {
            var me = this;

            me.assignmentStoreDetacher && me.assignmentStoreDetacher.destroy();

            me.assignmentStoreDetacher = assignmentStore.on({
                remove      : me.onAssignmentStoreRemove,
                clear       : me.onAssignmentStoreClear,
                refresh     : me.onAssignmentStoreRefresh,
                scope       : me,
                destroyable : true
            });
        }
    },

    onEventMouseDown: function(view, record, e) {
        // Reset previously stored records
        this.selectedOnMouseDown = null;

        var assignmentRecord = this.resolveAssignmentRecordFromEventNode(e.getTarget());

        // Change selection before dragging to avoid moving of unselected events
        if (assignmentRecord && (!this.ignoreRightMouseSelection || e.button !== 2) && !this.isSelected(assignmentRecord)) {
            this.selectedOnMouseDown = assignmentRecord;
            this.selectWithEvent(assignmentRecord, e);
        }
    },

    onEventClick: function(view, record, e) {
        var assignmentRecord = this.resolveAssignmentRecordFromEventNode(e.getTarget());

        // Don't change selection if record been already selected on mousedown
        if (assignmentRecord && (!this.ignoreRightMouseSelection || e.button !== 2) && !this.selectedOnMouseDown) {
            this.selectWithEvent(assignmentRecord, e);
        }
    },

    resolveAssignmentRecordFromEventNode : function (node) {
        var view    = this.view,
            event = view.resolveEventRecord(node),
            resource = view.resolveResource(node);

        if (event && resource) {
            var assignmentStore = view.getEventStore().getAssignmentStore();
            return assignmentStore.getAssignmentForEventAndResource(event, resource);
        }
    },

    selectNode: function(node, keepExisting, suppressEvent) {
        var assignmentRecord = this.resolveAssignmentRecordFromEventNode(node);
        if (assignmentRecord) {
            this.select(assignmentRecord, keepExisting, suppressEvent);
        }
    },

    deselectNode: function(node, keepExisting, suppressEvent) {
        var assignmentRecord = this.resolveAssignmentRecordFromEventNode(node);
        if (assignmentRecord) {
            this.deselect(assignmentRecord, suppressEvent);
        }
    },

    getFirstSelectedEventForResource : function(resource) {
        var selections = this.getSelection(),
            event = null,
            i, len, r;

        for (i = 0, len = selections.length; !event && i < len; ++i) {
            r = selections[i];
            if (r.getEvent().isAssignedTo(resource)) {
                event = r;
                break;
            }
        }

        return event;
    },

    getDraggableSelections : function() {
        return Ext.Array.filter(
            this.getSelection(),
            function(record) {
                return record.getEvent().isDraggable();
            }
        );
    },

    forEachEventRelatedSelection : function(eventRecord, fn) {
        Ext.Array.each(this.getSelection(), function(selectedRecord) {
            selectedRecord.getEvent() === eventRecord && fn(selectedRecord);
        });
    },

    onAssignmentStoreRemove : function(assignmentStore, removedRecords) {
        this.deselect(removedRecords, true);
    },

    onAssignmentStoreClear : function(assignmentStore) {
        this.clearSelections();
    },

    onAssignmentStoreRefresh : function(assignmentStore) {
        this.clearSelections();
    },

    destroy : function() {
        var me = this;

        Ext.destroyMembers(
            me,
            'assignmentStoreDetacher'
        );

        me.callParent();
    }
});
