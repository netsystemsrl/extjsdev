/**
 * Internal plugin enabling drag and drop for tasks
 */
Ext.define("Gnt.feature.taskdd.DragZone", {

    extend : "Ext.dd.DragZone",

    requires : [
        'Ext.mixin.Pluggable',
        'Ext.util.Point',
        'Ext.dd.StatusProxy',
        'Ext.dd.DropZone',
        'Sch.patches.DragZoneDupIds',
        'Gnt.feature.taskdd.Proxy',
        'Gnt.feature.taskdd.DropZone',
        'Gnt.feature.taskdd.plugin.InRowTaskDragDrop',
        'Gnt.feature.taskdd.plugin.SegmentDragDrop',
        'Gnt.feature.taskdd.plugin.DeadlineDragDrop',
        'Gnt.feature.taskdd.plugin.OutOfRowTaskDragDrop',
        'Gnt.feature.taskdd.plugin.ResourceDrop'
    ],

    mixins : {
        pluggable : 'Ext.mixin.Pluggable'
    },

    config : {
        /**
        * @cfg {Gnt.view.Gantt} gantt Reference to the gantt view
        */
        gantt : null,

        /**
        * @cfg {String} taskSelector Task element CSS selector
        */
        taskSelector : null,

        /**
        * @cfg {String} deadlineSelector Deadline element CSS selector
        */
        deadlineSelector : null,

        /**
        * @cfg {Boolean} [useTooltip=true] `false` to not show a tooltip while dragging
        */
        useTooltip : true,

        /**
        * @cfg {Object} [tooltipConfig=null] A custom config object to apply to the {@link Gnt.Tooltip} instance.
        */
        tooltipConfig   : null,

        /**
        * @cfg {Function} [validatorFn] An empty function by default.
        *
        * Provide to perform custom validation on the item being dragged.
        * This function is called during the drag and drop process and also after the drop is made.
        *
        * @param {Gnt.model.Task} record The record being dragged
        * @param {Date} date The new start date
        * @param {Number} duration The duration of the item being dragged, in minutes
        * @param {Ext.EventObject} e The event object
        * @return {Boolean} true if the drop position is valid, else false to prevent a drop
        */
        validatorFn : Ext.returnTrue,

        /**
        * @cfg {Object} [validatorFnScope=null]
        * The scope for the validatorFn, defaults to the gantt view instance
        */
        validatorFnScope : null,

        /**
        * @cfg {Boolean} [showExactDropPosition=false] When enabled, the task being dragged always "snaps" to the exact start date / duration that it will have after being drop.
        */
        showExactDropPosition : false,

        /**
        * @cfg {Boolean} [skipWeekendsDuringDragDrop=false] When enabled, that task being dragged will skip weekend dates.
        */
        skipWeekendsDuringDragDrop : false,

        /**
        * @cfg {Boolean} [constrainDragToTaskRow=true] When enabled dragged task element will constrained by task row
        */
        constrainDragToTaskRow : true,

        /**
        * @cfg {String} [rtlProxyCls] CSS class to add to drag proxy if Gantt is in RTL mode
        */
        rtlProxyCls     : "sch-rtl",

        /**
        * @cfg {String} [invalidTargetSelector] Invalid targets CSS selector
        */
        invalidTargetSelector : [
            // Stop task drag and drop when a resize handle, a terminal or a parent task is clicked
            '.' + Ext.baseCSSPrefix + 'resizable-handle',
            '.sch-resizable-handle',
            '.sch-terminal',
            '.sch-gantt-progressbar-handle',
            '.sch-rollup-task',
            '.sch-gantt-baseline-item .sch-gantt-item'
        ].join(','),

        /**
        * @cfg {String} [initialProxyCls] Initial drag proxy status CSS class
        */
        initialProxyCls : 'sch-gantt-dragproxy',

        /**
        * @cfg {Boolean|Object} [inRowTaskDragDrop=true] In row task drag & drop controlling parameter.
        *
        * Either true to enable, false to disable or a configuration object to enable with custom configuration
        * for {@link Gnt.feature.taskdd.plugin.InRowTaskDragDrop} plugin.
        */
        inRowTaskDragDrop    : true,

        /**
        * @cfg {Boolean|Object} [segmentDragDrop=true] Task segments drag & drop controlling parameter.
        *
        * Either true to enable, false to disable or a configuration object to enable with custom configuration
        * for {@link Gnt.feature.taskdd.plugin.SegmentDragDrop} plugin.
        */
        segmentDragDrop      : true,

        /**
        * @cfg {Boolean|Object} [deadlineDragDrop=true] Task deadline drag & drop controlling parameter.
        *
        * Either true to enable, false to disable or a configuration object to enable with custom configuration
        * for {@link Gnt.feature.taskdd.plugin.DeadlineDragDrop} plugin.
        */
        deadlineDragDrop     : true,

        /**
        * @cfg {Boolean|Object} [outOfRowDragDrop=false] Out of row task drag & drop controlling parameter.
        *
        * true to enable, false to disable or a configuration object to enable with custom configuration
        * for {@link Gnt.feature.taskdd.plugin.OutOfRowTaskDragDrop} plugin. This feature allows to drag tasks outside the Gantt view (to other Gantt/grid/tree views)
        */
        outOfRowTaskDragDrop : false,

        /**
        * @cfg {Boolean|Object} [resourceDrop=false] Resource drop controlling parameter.
        *
        * Either true to enable, false to disable or a configuration object to enable with custom configuration
        * for {@link Gnt.feature.taskdd.plugin.ResourceDrop} plugin.
        */
        resourceDrop         : false,

        /**
        * Task drop zone instance paired with this drag zone
        *
        * @cfg {Gnt.feature.taskdd.DropZone) taskDropZone
        *
        * @private
        */
        taskDropZone : null
    },

    // ----------------------------------

    // has to be set to `false` - we'll register the gantt view in the ScrollManager manually
    containerScroll : false,

    dragProxyPositionLocked : false,

    /**
    * @inheritdoc
    */
    constructor : function (el, config) {
        var me = this,
            proxy;

        config = config || {};

        proxy = me.proxy || config.proxy || {};

        if (!(proxy instanceof Ext.dd.StatusProxy)) {
            me.proxy = Ext.create(Ext.apply({}, proxy, {
                xclass   : 'Gnt.feature.taskdd.Proxy',
                $ownedBy : me
            }));

            delete config.proxy;
        }
        else {
            me.proxy = proxy;
        }

        config = Ext.applyIf(config, { ddGroup : config.gantt.id + '-task-dd' });

        me.callParent([ el, config ]);

        me.initConfig(config);

        me.view = me.getGantt(); // Compatibility with tree/grid view drag drop zones

        if (me.getGantt().rtl) {
            me.proxy.addCls(me.getRtlProxyCls());
        }

        // Creating pair drop zone if none is given
        if (!me.getTaskDropZone()) {
            me.setTaskDropZone({
                'xclass' : 'Gnt.feature.taskdd.DropZone',
                gantt    : me.getGantt(),
                ddGroup  : me.ddGroup
            });
        }

        // Tasks drag & drop support
        if (me.getInRowTaskDragDrop()) {
            me.addPlugin(Ext.apply({
                type                         : 'gantt_inrowtaskdragdrop',
                gantt                        : me.getGantt(),
                tooltip                      : me.getUseTooltip() && (me.getTooltipConfig() || true),
                validatorFn                  : me.getValidatorFn() && Ext.Function.bind(me.getValidatorFn(), me.getValidatorFnScope() || me.getGantt()),
                showExactDropPosition        : me.getShowExactDropPosition(),
                skipWeekendsDuringDragDrop   : me.getSkipWeekendsDuringDragDrop(),
                snapRelativeToEventStartDate : me.getGantt().snapRelativeToEventStartDate,
                constrainDragToTaskRow       : me.getConstrainDragToTaskRow(),
                dropAllowedCls               : me.getInitialProxyCls()
            }, me.getInRowTaskDragDrop()));
        }

        // Segments drag & drop support
        if (me.getSegmentDragDrop()) {
            me.addPlugin(Ext.apply({
                type                         : 'gantt_segmentdragdrop',
                gantt                        : me.getGantt(),
                tooltip                      : me.getUseTooltip() && (me.getTooltipConfig() || true),
                validatorFn                  : me.getValidatorFn() && Ext.Function.bind(me.getValidatorFn(), me.getValidatorFnScope() || me.getGantt()),
                showExactDropPosition        : me.getShowExactDropPosition(),
                skipWeekendsDuringDragDrop   : me.getSkipWeekendsDuringDragDrop(),
                snapRelativeToEventStartDate : me.getGantt().snapRelativeToEventStartDate,
                dropAllowedCls               : me.getInitialProxyCls()
            }, me.getSegmentDragDrop()));
        }

        // Task's deadline drag & drop support
        if (me.getDeadlineDragDrop()) {
            me.addPlugin(Ext.apply({
                type                         : 'gantt_deadlinedragdrop',
                gantt                        : me.getGantt(),
                tooltip                      : me.getUseTooltip() && (me.getTooltipConfig() || true),
                showExactDropPosition        : me.getShowExactDropPosition(),
                skipWeekendsDuringDragDrop   : me.getSkipWeekendsDuringDragDrop(),
                snapRelativeToEventStartDate : me.getGantt().snapRelativeToEventStartDate,
                dropAllowedCls               : me.getInitialProxyCls()
            }, me.getDeadlineDragDrop()));
        }

        // Task reordering and external drop support
        if (me.getOutOfRowTaskDragDrop()) {
            me.setConstrainDragToTaskRow(true);

            me.addPlugin(Ext.apply({
                type  : 'gantt_outofrowtaskdragdrop',
                gantt : me.getGantt()
            }, me.getOutOfRowTaskDragDrop()));
        }

        // Resources drop sopport
        if (me.getResourceDrop()) {
            me.addPlugin(Ext.apply({
                type  : 'gantt_resourcedrop',
                gantt : me.getGantt()
            }, me.getResourceDrop()));
        }
    },

    /**
    * @inheritdoc
    */
    destroy : function () {
        var me = this;

        me.setPlugins(null);

        me.proxy        && me.proxy.$ownedBy == me && Ext.destroy(me.proxy);
        me.taskDropZone && me.taskDropZone.getOwnerDragZone() == me && Ext.destroy(me.taskDropZone);

        me.callParent();
    },

    applyTaskDropZone : function(dropZone) {
        var me = this;

        if (!(dropZone instanceof Ext.dd.DropZone)) {
            dropZone = Ext.apply({}, dropZone || {}, {
                'xclass'      : 'Gnt.feature.taskdd.DropZone',
                gantt         : me.getGantt(),
                ddGroup       : me.ddGroup,
                ownerDragZone : me
            });

            dropZone = Ext.create(dropZone.xclass, me.getEl(), dropZone);
        }

        return dropZone;
    },

    /**
    * @inheritdoc
    */
    isValidHandleChild : function(node) {
        var me = this;

        return me.callParent([node]) && !Ext.fly(node).is(me.getInvalidTargetSelector());
    },

    /**
    * @inheritdoc
    */
    getDragData : function(e) {
        var me = this,
            gantt = me.getGantt(),
            result = null,
            taskEl, taskSegmentEl, taskSegmentIdx,
            deadlineEl,
            draggedEl,
            rowEl,
            draggedTask,
            startPoint, startPointDate, startOffsets,
            isTaskDrag, isTaskSegmentDrag, isDeadlineDrag, xy;

        taskEl         = e.getTarget(me.taskSelector);
        taskSegmentEl  = taskEl && e.getTarget('.sch-gantt-task-segment');
        taskSegmentIdx = Number(taskSegmentEl && taskSegmentEl.getAttribute('data-segmentIndex'));
        deadlineEl     = !taskEl && e.getTarget(me.deadlineSelector);
        rowEl          = e.getTarget(gantt.getItemSelector());

        // Dragging the first segment means move the entire task, otherwise drag the segment node
        draggedEl      = taskSegmentEl && taskSegmentIdx > 0 && taskSegmentEl || taskEl || deadlineEl;

        draggedTask   = draggedEl && gantt.resolveTaskRecord(draggedEl);

        if (draggedTask && taskSegmentEl && taskSegmentIdx > 0) {
            draggedTask = draggedTask.getSegment(taskSegmentIdx);
        }

        isTaskDrag        = !!taskEl && (!taskSegmentEl || taskSegmentIdx === 0);
        isTaskSegmentDrag = !!taskSegmentEl && taskSegmentIdx > 0;
        isDeadlineDrag    = !!deadlineEl;

        if (
            draggedTask && (
                (isTaskDrag        && (me.getInRowTaskDragDrop() || me.getOutOfRowTaskDragDrop())) ||
                (isTaskSegmentDrag && me.getSegmentDragDrop()) ||
                (isDeadlineDrag    && me.getDeadlineDragDrop())
            )
        ) {
            if (gantt.rtl && gantt.shouldAdjustForRtl()) {
                startPoint = Ext.util.Point.fromEvent(e);
            } else {
                xy         = e.getXY();
                startPoint = new Ext.util.Point(xy[0], xy[1]);
            }
            startPointDate = gantt.getDateFromDomEvent(e);
            startOffsets   = startPoint.getOffsetsTo(Ext.fly(draggedEl).getRegion());
            startOffsets   = new Ext.util.Point(startOffsets.x, startOffsets.y);

            result = {
                ddel              : draggedEl,
                record            : draggedTask,
                records           : [draggedTask], // compatibility with TreeView/GridView drop zone
                item              : rowEl,         // compatibility with TreeView/GridView drop zone,
                segmentIndex      : taskSegmentIdx,
                startPoint        : startPoint,
                startPointDate    : startPointDate,
                startOffsets      : startOffsets,
                isTaskDrag        : isTaskDrag,
                isTaskSegmentDrag : isTaskSegmentDrag,
                isDeadlineDrag    : isDeadlineDrag
            };
        }
        else {
            // Iterate over each plugin and allow it to provide drag data
            result = Ext.Array.reduce(me.getPlugins(), function(result, p) {
                if (!result && Ext.isFunction(p.getDragData)) {
                    result = p.getDragData(e);
                }
                return result;
            }, null);
        }

        if (result) {
            // Iterate over each plugin and allow it to extend drag data
            result = Ext.Array.reduce(me.getPlugins(), function(result, p) {
                if (Ext.isFunction(p.extendDragData)) {
                    result = p.extendDragData(e, result);
                }
                return result;
            }, result);
        }

        return result;
    },

    onBeforeDrag : function(data, e) {
        var me = this,
            result = true;

        /**
         * @event beforetaskdrag
         * @preventable
         *
         * Fires before a task drag drop is initiated, return false to cancel it
         *
         * @param {Gnt.view.Gantt} gantt The gantt view instance
         * @param {Gnt.model.Task} taskRecord The task record that's about to be dragged
         * @param {Ext.EventObject} e The event object
         * @param {Object} data Drag data
         * @param {Gnt.feature.taskdd.DragZone} dragZone
         *
         * @member Gnt.view.Gantt
         */
        if (me.gantt.hasListeners.beforetaskdrag) {
            result = (false !== me.gantt.fireEvent('beforetaskdrag', me.gantt, data.record, e, data, me));
        }

        if (result) {
            // This might be handy during drag process and shouldn't change until dragging stops
            me.cachedViewportSize = {
                width : Ext.Element.getViewportWidth(),
                height : Ext.Element.getViewportHeight()
            };
        }

        return result;
    },

    onStartDrag : function(x, y) {
        var me = this,
            data = me.dragData,
            proxy = me.getProxy();

        proxy.forceStatus(me.getInitialProxyCls());

        me.prepareProxyForDragging(proxy, data, x, y);
        me.setDelta(data.startOffsets.x, data.startOffsets.y);
        me.alignElWithMouse(proxy.getEl(), x, y);

        /**
         * @event taskdragstart
         *
         * Fires when a dnd operation starts
         *
         * @param {Gnt.view.Gantt} gantt The gantt view instance
         * @param {Gnt.model.Task} taskRecord The record being dragged
         * @param {Object} xy Pointer page coordinates
         * @param {Object} data Drag data
         * @param {Gnt.feature.taskdd.DragZone} dragZone
         *
         * @member Gnt.view.Gantt
         */
        return me.gantt.hasListeners.taskdragstart && me.gantt.fireEvent('taskdragstart', me.gantt, data.record, { x : x, y : y }, me.dragData, me);
    },

    onEndDrag : function(data, e) {
        var me = this;


        // TODO: The name of the event should be 'aftertaskdrag'
        // https://app.assembla.com/spaces/bryntum/tickets/6480-gnt-feature-taskdd-dragzone--change-event-aftertaskdrop-into-aftertaskdrag/details
        /**
         * @event aftertaskdrop
         *
         * Fires after a drag and drop operation, regardless if the drop valid or invalid
         *
         * @param {Gnt.view.Gantt} gantt The gantt view instance
         * @param {Gnt.model.Task} task The task instance
         * @param {Ext.EventObject} e The event object
         * @param {Object} data Drag data
         * @param {Gnt.feature.taskdd.DragZone} dragZone
         *
         * @member Gnt.view.Gantt
         */
        return me.gantt.hasListeners.aftertaskdrop && me.gantt.fireEvent('aftertaskdrop', me.gantt, data.record, e, data, me);
    },

    // beforeDragEnter : function(target, e, id) {},

    // afterDragEnter : function(target, e, id) {},

    // beforeDragOut : function(taget, e, id) {},

    // afterDragOut : function(target, e, id) {},

    // beforeDragOver : function(target, e, id) {},

    // afterDragOver : function(target, e, id) {},

    // beforeDragDrop : function(target, e, id) {},

    // afterDragDrop : function(target, e, id) {},

    // beforeInvalidDrop : function(target, e, id) {},

    // afterInvalidDrop : function(target, e, id) {},

    /**
    * @inheritdoc
    *
    * Overriden, to get rid of weird highlight fx in default implementation
    */
    afterRepair : function () {
        this.dragging = false;
    },

    /**
     * Prepares proxy for taking part in a drag operation.
     *
     * @param {Gnt.feature.taskdd.Proxy} proxy
     * @param {Mixed} data
     * @param {Number} x
     * @param {Number} y
     */
    prepareProxyForDragging : function(proxy, data, x, y) {
        var height = Ext.fly(data.ddel).getHeight();

        // Adjusting proxy size for exact matching look
        Ext.fly(proxy.getTaskGhostEl()).setHeight(height);

        if (data.isTaskDrag && data.record.isMilestone()) {
            // Firefox requires this to measure correctly in tests
            // 1204_dragdrop.t.js
            Ext.fly(proxy.getTaskGhostEl()).setWidth(Ext.fly(data.ddel).getWidth());
        }
    },

    /**
    * Locks drag proxy position such that {@link #alignElWithMouse} method has no effect any more.
    */
    lockDragProxyPosition : function() {
        this.dragProxyPositionLocked = true;
    },

    /**
    * Unlocks drag proxy position such that {@link #alignElWithMouse} method has effect again.
    */
    unlockDragProxyPosition : function() {
        this.dragProxyPositionLocked = false;
    },
    
    /**
     * Properly translates coordinates in case of RTL viewport
     * @param {Gnt.feature.taskdd.Proxy} proxy
     * @param {Number} x
     * @param {Number} y
     * @returns {{top: number, left: number}}
     * @private
     */
    translateXY : function(proxy, x, y) {
        var me    = this,
            gantt = me.getGantt(),
            result;
        
        if (!gantt.rtl || gantt.shouldAdjustForRtl()) {
            result = proxy.translatePoints(x, y);
        }
        else {
            var el       = proxy.el,
                styles   = el.getStyle(['position', 'top', 'right']),
                relative = styles.position === 'relative',
                left     = parseFloat(styles.right),
                top      = parseFloat(styles.top),
                xy       = proxy.getXY();
    
            if (Ext.isArray(x)) {
                y = x[1];
                x = x[0];
            }
            if (isNaN(left)) {
                left = relative ? 0 : el.dom.offsetLeft;
            }
            if (isNaN(top)) {
                top = relative ? 0 : el.dom.offsetTop;
            }
            
            left = (typeof x === 'number') ? x - xy[0] + left : undefined;
            top = (typeof y === 'number') ? y - xy[1] + top : undefined;
            
            result = {
                left : left,
                top  : top
            };
        }
        
        return result;
    },

    /**
    * @inheritdoc
    *
    * original method limits task position by viewport dimensions
    * our drag proxy might be attached to other elements but body
    * so we have to set position relative to element it's attached to
    */
    alignElWithMouse : function (el, iPageX, iPageY) {
        var me          = this,
            oCoord      = me.getTargetCoord(iPageX, iPageY),
            proxy       = me.getProxy(),
            proxySize   = proxy.getSize(),
            proxyParent = proxy.getForceAttachTo(),
            vpSize      = me.cachedViewportSize,
            localXY;

        if (!me.dragProxyPositionLocked) {
    
            // el here is actually proxy.getEl()
            localXY = me.translateXY(proxy, oCoord.x, oCoord.y);

            // If proxy is attached to body element then we are to constrain it's position within viewport
            if (!proxyParent) {

                // NOTE: me.lastPageX, me.lastPageY are set in me.cachePosition() to the proxy element
                //       last page x,y coordinates

                if (localXY.left < 0) {
                    oCoord.x = localXY.left = me.lastPageX || 0;
                }
                else if (localXY.left >= vpSize.width - proxySize.width) {
                    oCoord.x = localXY.left = me.lastPageX || (vpSize.width - proxySize.width);
                }

                if (localXY.top < 0) {
                    oCoord.y = localXY.top = me.lastPageY || 0;
                }
                else if (localXY.top >= vpSize.height - proxySize.height) {
                    oCoord.y = localXY.top = me.lastPageY || (vpSize.height - proxySize.height);
                }
            }

            proxy.setLocalXY(localXY.left, localXY.top);

            me.cachePosition(oCoord.x, oCoord.y);

            // If we are attached to body then giving chance for body scroll
            if (!proxy.getForceAttachTo()) {
                me.autoScroll(oCoord.x, oCoord.y, proxySize.width, proxySize.height);
            }
        }

        return oCoord;
    },

    // HACK: if you drag the task bar outside the window or iframe it crashes (missing e.target)
    // https://app.assembla.com/spaces/bryntum/tickets/7282-ext-supports-touch-true-causes-crash-on-task-drag/details
    onInvalidDrop : function (target, e, id) {
        if (!e) {
            e      = target;
            target = e.getTarget() || document.body;
        }

        return this.callParent([target, e, id]);
    }
});
