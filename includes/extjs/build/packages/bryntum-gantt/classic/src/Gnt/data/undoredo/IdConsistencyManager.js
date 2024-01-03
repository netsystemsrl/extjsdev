/**
 * This class keeps ids consistent inside undo/redo queues
 * @private
 */
Ext.define('Gnt.data.undoredo.IdConsistencyManager', {
    extend : 'Sch.data.util.IdConsistencyManager',
    
    getUpdateAssignmentEventIdFieldFn : function(assignmentStore, oldId, newId) {
        return function() {
            assignmentStore.each(function(assignment) {
                assignment.getEventId() == oldId && assignment.setEventId(newId);
            });
        };
    },
    
    getUpdateAssignmentResourceIdFieldFn : function(assignmentStore, oldId, newId) {
        return function() {
            assignmentStore.each(function(assignment) {
                assignment.getResourceId() == oldId && assignment.setResourceId(newId);
            });
        };
    },
    
    getUpdateDependencySourceTargedIdFieldFn : function(dependencyStore, oldId, newId) {
        return function() {
            dependencyStore.each(function(dependency) {
                dependency.getSourceId() == oldId && dependency.setSourceId(newId);
                dependency.getTargetId() == oldId && dependency.setTargetId(newId);
            });
        };
    }
});
