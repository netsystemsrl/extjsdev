/**
 * This plugin contains logic responsible for resource drops processing
 */
Ext.define("Gnt.feature.taskdd.plugin.ResourceDrop", function(thisClass) {

    function toArray(records) {
        return records ? (!Ext.isArray(records) ? [records] : records) : [];
    }

    function isResourceAlike(record) {
        return record.isResource || (record.isUtilizationResource && record.isSurrogateResource());
    }

    function extractResource(record) {
        return record.isUtilizationResource ? record.getOriginalResource() : record;
    }

    function canExtractResourcesFrom(records) {
        return Ext.Array.some(toArray(records), function(r) {
            return isResourceAlike(r);
        });
    }

    function extractResourcesFrom(records) {
        return Ext.Array.reduce(toArray(records), function(result, r) {
            if (isResourceAlike(r)) {
                result.push(extractResource(r));
            }
            return result;
        }, []);
    }

    function filterOutAssignedResources(task, resources) {
        return Ext.Array.filter(toArray(resources), function(r) {
            return !task.getAssignmentFor(r);
        });
    }

    function canAssignResourcesTo(task, resources) {
        return filterOutAssignedResources(task, resources).length > 0;
    }

    function assignResourcesTo(task, resources) {
        Ext.Array.each(toArray(resources), function(r) {
            task.assign(r);
        });
    }

    function getTargetTask(gantt, targetNode) {
        return gantt.ownerGrid.resolveTaskRecord(targetNode);
    }

    return {

        extend : 'Ext.plugin.Abstract',
        alias  : 'plugin.gantt_resourcedrop',
        id     : 'resourcedrop',

        config : {
            /**
             * @cfg {Gnt.view.Gantt} gantt Gantt view the drop controller works with
             */
            gantt : null
        },

        ganttDetacher : null,

        /**
         * @inheritdoc
         */
        destroy : function() {
            var me = this;

            me.setGantt(null);   // this will detach from gantt events if any are being listened for
            me.callParent();
        },

        /**
         * Enables resource nodes drop
         */
        enable : function() {
            var me = this;

            if (me.disabled) {
                me.callParent();
                me.attachToGantt();
            }
        },

        /**
         * Disables resource nodes drop
         */
        disable : function() {
            var me = this;

            if (!me.disabled) {
                me.callParent();
                me.detachFromGantt();
            }
        },

        updateGantt : function(gantt, oldGantt) {
            var me = this;

            oldGantt && me.detachFromGantt();
            gantt && !me.disabled && me.attachToGantt();
        },

        attachToGantt : function() {
            var me = this;

            me.ganttDetacher = me.getGantt().on({
                scope : me,
                destroyable : true,
                'task-row-drag-over'  : me.onTaskRowDragOver,
                'task-row-drag-drop'  : me.onTaskRowDragDrop
            });
        },

        detachFromGantt : function() {
            var me = this;

            me.ganttDetacher && (Ext.destroy(me.ganttDetacher), me.ganttDetacher = null);
        },

        onTaskRowDragOver : function(gantt, target, dropSource, data, e, canHandleDrop) {
            var task;

            if (data.records && canExtractResourcesFrom(data.records)) {

                task = getTargetTask(gantt, target);

                if (task && canAssignResourcesTo(task, extractResourcesFrom(data.records))) {

                    canHandleDrop();
                }
            }
        },

        onTaskRowDragDrop : function(gantt, target, dropSource, data, e) {
            var resources,
                task;

            if (data.records && canExtractResourcesFrom(data.records)) {
                task = getTargetTask(gantt, target);

                if (task) {
                    resources = filterOutAssignedResources(task, extractResourcesFrom(data.records));
                    assignResourcesTo(task, resources);
                }
            }
        }
    };
});
