/**
 * @class Gnt.feature.taskdd.DropZone
 * @extends Ext.dd.DropZone
 *
 * Special drop zone class handling drops on task scheduling view. The class delegates actual drop handling to other
 * parties capable of listening to {@link Gnt.view.Gantt gantt view} or it's relays.
 */
Ext.define('Gnt.feature.taskdd.DropZone', function(thisClass) {

    function withCanHandleDropQuery(me, gantt, eventName, args, onCanHandle, onCantHandle) {
        var handlersCount = 0,
            handlersCls   = [],
            canHandleDrop = function(proxyCls) {
                ++handlersCount;
                proxyCls && handlersCls.push(proxyCls);
            };

        gantt.hasListeners[eventName] && gantt.fireEvent.apply(gantt, [].concat(eventName, args, canHandleDrop));

        handlersCls = handlersCls.length && handlersCls.join(' ') || me.dropAllowed;

        return handlersCount > 0 ? (onCanHandle ? onCanHandle(handlersCls) : handlersCls) : (onCantHandle ? onCantHandle() : me.dropNotAllowed);
    }

    return {
        extend : 'Ext.dd.DropZone',

        config : {
            /**
             * @cfg {Gnt.view.Gantt} gantt
             */
            gantt : null,
            /**
             * @cfg {Gnt.feature.taskdd.DragZone} ownerDragZone
             */
            ownerDragZone : null
        },

        scrollDetacher : null,
        lastOverEvent  : null,

        /**
         * @inheritdoc
         */
        constructor : function(el, config) {
            var me = this;

            me.callParent([el, config]);
            me.initConfig(config);
        },

        /**
         * @inheritdoc
         */
        destroy : function() {
            var me = this;

            me.setOwnerDragZone(null);

            me.callParent();
        },

        updateOwnerDragZone : function(newDragZone, oldDragZone) {
            var me = this;

            if (me.scrollDetacher) {
                Ext.destroy(me.scrollDetacher);
                me.scrollDetacher = null;
            }

            if (newDragZone) {
                me.scrollDetacher = Ext.fly(me.getEl()).on('scroll', me.onDropZoneElementScroll, me, {
                    destroyable : true
                });
            }
        },

        onDropZoneElementScroll : function(e) {
            var me = this,
                dragZone = me.getOwnerDragZone();

            if (dragZone.dragging && me.lastOverNode) {
                dragZone.getProxy().setStatus(me.notifyOver(dragZone, me.lastOverEvent, dragZone.dragData));
            }
        },

        /**
         * @inheritdoc
         */
        getTargetFromEvent : function(e) {
            return e.getTarget(this.getGantt().getItemSelector());
        },

        /**
         * @inheritdoc
         */
        onNodeEnter : function(target, dragSource, e, data) {
            var me = this,
                gantt = me.getGantt();

            /**
             * @event 'task-row-drag-enter'
             * @member Gnt.view.Gantt
             *
             * Fires when dragging operation enter a task row.
             *
             * @param {Gnt.view.Gantt} ganttView   Gantt component view instance
             * @param {HTMLElement} target         HTML element the operation is detected over
             * @param {Ext.dd.DragZone} dragSource Dragging initiated drag source instance
             * @param {Object} data                Data returned by drag source getDragData() method
             * @param {Object} e                   Event object
             */
            gantt.hasListeners['task-row-drag-enter'] && gantt.fireEvent('task-row-drag-enter', gantt, target, dragSource, data, e);
        },

        /**
         * @inheritdoc
         */
        onNodeOut : function(target, dragSource, e, data) {
            var me = this,
                gantt = me.getGantt();

            /**
             * @event 'task-row-drag-out'
             * @member Gnt.view.Gantt
             *
             * Fires when dragging operation exits a task row.
             *
             * @param {Gnt.view.Gantt} ganttView   Gantt component view instance
             * @param {HTMLElement} target         HTML element the operation is detected over
             * @param {Ext.dd.DragZone} dragSource Dragging initiated drag source instance
             * @param {Object} data                Data returned by drag source getDragData() method
             * @param {Object} e                   Event object
             */
            gantt.hasListeners['task-row-drag-out'] && gantt.fireEvent('task-row-drag-out', gantt, target, dragSource, data, e);

            if (!me.getEl().contains(e.getTarget())) {
                /**
                 * @event 'schedule-drag-out'
                 * @member Gnt.view.Gantt
                 *
                 * Fires when dragging operation exits the gantt view
                 *
                 * @param {Gnt.view.Gantt} ganttView   Gantt component view instance
                 * @param {Ext.dd.DragZone} dragSource Dragging initiated drag source instance
                 * @param {Object} data                Data returned by drag source getDragData() method
                 * @param {Object} e                   Event object
                 */
                gantt.hasListeners['schedule-drag-out'] && gantt.fireEvent('schedule-drag-out', gantt, dragSource, data, e);
            }
        },

        /**
         * @inheritdoc
         */
        onNodeOver : function(target, dragSource, e, data) {
            var me = this,
                gantt = me.getGantt();

            me.lastOverEvent = e;

            /**
             * @event 'task-row-drag-over'
             * @member Gnt.view.Gantt
             *
             * Contantly fires while dragging operation is over a task row.
             *
             * @param {Gnt.view.Gantt} ganttView        Gantt component view instance
             * @param {HTMLElement} target              HTML element the operation is detected over
             * @param {Ext.dd.DragZone} dragSource      Dragging initiated drag source instance
             * @param {Object} data                     Data returned by drag source getDragData() method
             * @param {Object} e                        Event object
             * @param {Function} canHandleDrop          Function to call if drop zone can handle the drop
             * @param {String} [canHandleDrop.proxyCls] Status proxy CSS class to add to drag proxy
             */
            return withCanHandleDropQuery(me, gantt, 'task-row-drag-over', [gantt, target, dragSource, data, e]);
        },

        /**
         * @inheritdoc
         */
        onNodeDrop : function(target, dragSource, e, data) {
            var me = this,
                gantt = me.getGantt(),
                result = false;

            withCanHandleDropQuery(
                me, gantt, 'task-row-drag-over', [gantt, target, dragSource, data, e],
                function onCanHandleDrop() {
                    /**
                     * @event 'task-row-drag-drop'
                     * @member Gnt.view.Gantt
                     *
                     * Fires when drag drop happens over a task row.
                     *
                     * @param {Gnt.view.Gantt} ganttView   Gantt component view instance
                     * @param {HTMLElement} target         HTML element the operation is detected over
                     * @param {Ext.dd.DragZone} dragSource Dragging initiated drag source instance
                     * @param {Object} data                Data returned by drag source getDragData() method
                     * @param {Object} e                   Event object
                     */
                    gantt.hasListeners['task-row-drag-drop'] && gantt.fireEvent('task-row-drag-drop', gantt, target, dragSource, data, e);
                    result = true;
                }
            );

            return result;
        },

        /**
         * @inheritdoc
         */
        onContainerOver : function(dragSource, e, data) {
            var me = this,
                gantt = me.getGantt();

            /**
             * @event 'schedule-drag-over'
             * @member Gnt.view.Gantt
             *
             * Contantly fires while dragging operation is not over a task row but is inside the gantt view.
             *
             * @param {Gnt.view.Gantt} ganttView        Gantt component view instance
             * @param {Ext.dd.DragZone} dragSource      Dragging initiated drag source instance
             * @param {Object} data                     Data returned by drag source getDragData() method
             * @param {Object} e                        Event object
             * @param {Function} canHandleDrop          Function to call if drop zone can handle the drop
             * @param {String} [canHandleDrop.proxyCls] Status proxy CSS class to add to drag proxy
             */
            return withCanHandleDropQuery(me, gantt, 'schedule-drag-over', [gantt, dragSource, data, e]);
        },

        /**
         * @inheritdoc
         */
        onContainerDrop : function(dragSource, e, data) {
            var me = this,
                gantt = me.getGantt(),
                result = false;

            withCanHandleDropQuery(
                me, gantt, 'schedule-drag-over', [gantt, dragSource, data, e],
                function onCanHandleDrop() {
                    /**
                     * @event 'schedule-drag-drop'
                     * @member Gnt.view.Gantt
                     *
                     * Fires when drag drop happens over a gantt view but not within any view's task rows.
                     *
                     * @param {Gnt.view.Gantt} ganttView   Gantt component view instance
                     * @param {Ext.dd.DragZone} dragSource Dragging initiated drag source instance
                     * @param {Object} data                Data returned by drag source getDragData() method
                     * @param {Object} e                   Event object
                     */
                    gantt.hasListeners['schedule-drag-drop'] && gantt.fireEvent('schedule-drag-drop', gantt, dragSource, data, e);
                    result = true;
                }
            );

            return result;
        }
    };
});
