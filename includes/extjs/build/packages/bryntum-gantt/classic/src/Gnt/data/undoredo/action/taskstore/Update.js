/**
 * Special update action which knows how to properly store segments snapshot, works in conjuction with
 * {@link Gnt.data.undoredo.mixin.TaskStoreHint} which does actual segments snapshot in response upon undo/redo
 * transaction start
 */
Ext.define('Gnt.data.undoredo.action.taskstore.Update', {

    extend : 'Robo.action.tree.Update',

    uses : [
        'Ext.Array'
    ],

    processSavingOldValue : function(fieldName, record) {
        var me = this,
            value;

        if (fieldName == record.segmentsField) {
            value = record.getTaskStore().getOriginalSegmentsState(record);
        }
        else {
            value = me.callParent([fieldName, record]);
        }

        return value;
    },

    processSavingNewValue : function(fieldName, record) {
        var me = this,
            value;

        if (fieldName === record.segmentsField) {
            value = record.buildSegmentsSnapshot();
        }
        else {
            value = me.callParent(arguments);
        }

        return value;
    },

    processRestoringValue : function(value, fieldName, record) {
        var me = this;

        if (fieldName == record.segmentsField) {

            record.rollbackSegmentsToSnapshot(value);

            value = me.self.CUSTOMLY_PROCESSED;
        }
        else {
            value = me.callParent(arguments);
        }

        return value;
    }
});
