/**
 @class Sch.feature.SchedulerDragZone
 @extends Ext.dd.DragZone

 A custom scheduler dragzone that also acts as the dropzone, and optionally
 constrains the drag to the resource area that contains the dragged element.

 Generally it should not need to be used directly.
 To configure drag and drop use {@link Sch.mixin.SchedulerPanel#cfg-dragConfig SchedulerPanel} dragConfig instead.
 */
Ext.define("Sch.feature.SchedulerDragZone", {
    extend : "Ext.dd.DragZone",

    requires : [
        'Ext.dd.StatusProxy',
        'Sch.tooltip.Tooltip'
    ],

    uses : [
        'Sch.model.Event',
        'Sch.model.Assignment',
        'Sch.util.Date',
        'Sch.patches.DragZone'
    ],

    animRepair           : false,
    repairHighlight      : false,
    repairHighlightColor : 'transparent',
    // this has to be set to `false` because we will manually register the view element in the ScrollManager
    // we don't need to register the dragged element in it
    containerScroll      : false,
    checkDraggingFlag : true,

    getConstrainRegion : null,

    /**
     * @cfg {Boolean} showTooltip Specifies whether or not to show tooltip while dragging event
     */
    showTooltip : true,

    /**
     * @cfg {Ext.tip.ToolTip/Object} tip
     *
     * The tooltip instance to show while dragging event or a configuration object
     */
    tip : null,

    // this property is taking part in coordinates calculations in alignElWithMouse
    // these adjustments required for correct positioning of proxy on mouse move after view scroll
    deltaSetXY : null,

    schedulerView : null,

    _onValidDropTimer : null,

    // The last 'good' coordinates received by mousemove events (needed when a scroll event happens, which doesn't contain XY info)
    lastXY : null,

    /**
     * @type {Boolean} showExactDropPosition When enabled, the event being dragged always "snaps" to the exact start date that it will have after drop.
     */
    showExactDropPosition : false,

    /**
     * @cfg {Boolean} enableCopy true to enable copy by pressing modifier key
     * (see {@link #enableCopyKey enableCopyKey}) during drag drop.
     */
    enableCopy : false,

    /**
     *
     * @cfg {String} enableCopyKey
     * Modifier key that should be pressed during drag drop to copy item.
     * Available values are 'CTRL', 'ALT', 'SHIFT'
     */
    enableCopyKey : 'SHIFT',

    /**
     * @cfg {Object} validatorFn
     *
     * An empty function by default, but provided so that you can perform custom validation on
     * the item being dragged. This function is called during the drag and drop process and also after the drop is made
     * @param {Sch.model.Event[]} dragRecords an array containing the records for the events being dragged
     * @param {Sch.model.Resource} targetResourceRecord the target resource of the the event
     * @param {Date} date The date corresponding to the current mouse position
     * @param {Number} duration The duration of the item being dragged
     * @param {Event} e The event object
     * @return {Boolean} true if the drop position is valid, else false to prevent a drop
     */
    validatorFn : function (dragRecords, targetResourceRecord, date, duration, e) {
        return true;
    },

    /**
     * @cfg {Object} validatorFnScope
     * The scope for the {@link #validatorFn}
     */
    validatorFnScope : null,

    copyKeyPressed : false,

    keyListener        : null,
    viewScrollListener : null,
    gridScrollListener : null,

    /**
     * @cfg {String} dragDropProxyCls Special CSS class added to drag proxy to perform lookups
     * @required
     * @private
     */
    dragDropProxyCls : 'sch-dd-ref',

    invalidCssClasses : [
        'sch-resizable-handle',
        'sch-terminal'
    ],

    /**
     * @constructor
     * @param {String/HTMLElement/Ext.dom.Element} el The container element or its ID
     * @param {Object} config The object containing the configuration of this model.
     */
    constructor : function (el, config) {
        var proxy = this.proxy = this.proxy || new Ext.dd.StatusProxy({
            shadow         : false,
            dropAllowed    : this.dropAllowed,
            dropNotAllowed : this.dropNotAllowed,
            // HACK, we want the proxy inside the scheduler, so that when user drags the event
            // out of the scheduler el, the event should be cropped by the scheduler edge
            ensureAttachedToBody : Ext.emptyFn
        });

        this.callParent(arguments);
        this.isTarget   = true;
        this.scroll     = false;
        this.ignoreSelf = false;

        var schedulerView = this.schedulerView;

        Ext.Array.each(this.invalidCssClasses, this.addInvalidHandleClass, this);

        if (schedulerView.touchScroll) {
            // disable tooltips for touch devices
            this.showTooltip = false;
        }

        this.el.appendChild(proxy.el);

        this.bindRightClickPreventer();

        this.el.highlight = Ext.emptyFn; // Not interested in any animated highlight after invalid drop

        proxy.addCls('sch-dragproxy');

        // Activate the auto-scrolling behavior during the drag drop process
        schedulerView.on({
            eventdragstart : function () {
                Sch.util.ScrollManager.activate(schedulerView, schedulerView.constrainDragToResource && schedulerView.getMode());
            },

            aftereventdrop : function () {
                Sch.util.ScrollManager.deactivate();
            },

            scope : this
        });

        if (this.showTooltip) {
            var tip         = this.tip;

            if (tip instanceof Ext.tip.ToolTip) {
                tip.schedulerView = schedulerView;
            } else {
                this.tip = new Sch.tooltip.Tooltip(Ext.apply({
                    schedulerView : schedulerView,
                    constrainTo   : schedulerView.up('grid').el,
                    // bug in 6.2.1, covered by 122_dragdrop_tip
                    alignOnScroll : false,
                    cls           : 'sch-dragdrop-tip'
                }, tip));
            }
        }
    },

    bindRightClickPreventer : function () {
        this.schedulerView.el.on('mousedown', this.preventRightClick, this, { priority : 999 });
    },

    destroy : function () {
        this.tip && this.tip.destroy();

        this.cleanupListeners();

        clearTimeout(this._onValidDropTimer);

        this.callParent(arguments);
    },

    // Prevents right clicking when dragging is in progress
    preventRightClick : function (e) {
        if (this.dragging && e.button !== 0) {
            return false;
        }
    },

    // @OVERRIDE
    autoOffset : function () {
        this.setDelta(0, 0);
    },

    // private
    setupConstraints : function (constrainRegion, elRegion, xOffset, yOffset, isHorizontal, tickSize, constrained) {
        this.clearTicks();

        var xTickSize = isHorizontal && !this.showExactDropPosition && tickSize > 1 ? tickSize : 0;
        var yTickSize = !isHorizontal && !this.showExactDropPosition && tickSize > 1 ? tickSize : 0;

        this.resetConstraints();

        this.initPageX = constrainRegion.left + xOffset;
        this.initPageY = constrainRegion.top + yOffset;

        var width  = elRegion.right - elRegion.left;
        var height = elRegion.bottom - elRegion.top;

        // if `constrained` is false then we haven't specified getDateConstraint method and should constrain mouse position to scheduling area
        // else we have specified date constraints and so we should limit mouse position to smaller region inside of constrained region using offsets and width.
        if (isHorizontal) {
            if (constrained) {
                this.setXConstraint(constrainRegion.left + xOffset, constrainRegion.right - width + xOffset, xTickSize);
            } else {
                this.setXConstraint(constrainRegion.left, constrainRegion.right, xTickSize);
            }
            this.setYConstraint(constrainRegion.top + yOffset, constrainRegion.bottom - height + yOffset, yTickSize);
        } else {
            this.setXConstraint(constrainRegion.left + xOffset, constrainRegion.right - width + xOffset, xTickSize);
            if (constrained) {
                this.setYConstraint(constrainRegion.top + yOffset, constrainRegion.bottom - height + yOffset, yTickSize);
            } else {
                this.setYConstraint(constrainRegion.top, constrainRegion.bottom, yTickSize);
            }
        }
    },

    // @OVERRIDE
    setXConstraint : function (iLeft, iRight, iTickSize) {
        this.leftConstraint  = iLeft;
        this.rightConstraint = iRight;

        this.minX = iLeft;
        this.maxX = iRight;

        if (iTickSize) {
            this.setXTicks(this.initPageX, iTickSize);
        }

        this.constrainX = true;
    },

    // @OVERRIDE
    setYConstraint : function (iUp, iDown, iTickSize) {
        this.topConstraint    = iUp;
        this.bottomConstraint = iDown;

        this.minY = iUp;
        this.maxY = iDown;

        if (iTickSize) {
            this.setYTicks(this.initPageY, iTickSize);
        }

        this.constrainY = true;
    },

    // These cause exceptions, and are not needed
    onDragEnter : Ext.emptyFn,
    onDragOut   : Ext.emptyFn,


    setVisibilityForSourceEvents : function (show) {
        Ext.Array.each(this.dragData.getEventBarElements(), function (el) {
            el && Ext.fly(el)[show ? 'show' : 'hide']();
        });
    },

    // private
    onDragOver : function (e) {

        if (e && e.event.touches && e.event.touches.length > 1) {
            // Force a stop if multi touch is detected
            Ext.dd.DragDropManager.handleMouseUp(e);
            return;
        }

        var xy = e ? e.getXY() : this.lastXY;

        // May have a situation where user grabs an event, drags it outside the view - then when back in the view the first thing
        // that happens is a view scroll
        if (!xy) return;


        var dd = this.dragData;

        if (!dd.originalHidden) {
            // Hide dragged event elements at this time
            this.setVisibilityForSourceEvents(false);

            dd.originalHidden = true;

            if (this.enableCopy) {
                this.onShiftKeyStateChange(e[this.enableCopyKey.toLowerCase() + 'Key']);
            }
        }

        var start    = dd.startDate;
        var resource = dd.newResource;
        var view     = this.schedulerView;

        this.updateDragContext(e);

        if (this.showExactDropPosition) {
            var timeDiff  = view.getDateFromXY(xy) - dd.sourceDate;
            var realStart = new Date(dd.origStart - 0 + timeDiff);
            var offset    = view.timeAxisViewModel.getDistanceBetweenDates(realStart, dd.startDate);

            if (dd.startDate > view.timeAxis.getStart()) {
                var proxyEl = this.proxy.el;

                if (offset) {
                    if (view.isHorizontal()) {
                        proxyEl.setX(xy[0] + (view.shouldAdjustForRtl() ? -offset : offset));
                    } else {
                        proxyEl.setY(xy[1] + offset);
                    }
                }
            }
        }

        if (dd.startDate - start !== 0 || resource !== dd.newResource) {
            view.fireEvent('eventdrag', view, dd.draggedRecords, dd.startDate, dd.newResource, dd);
        }

        if (this.showTooltip) {
            var event = dd.getEventRecord();

            if (event.getAllDay && event.getAllDay() && !dd.isAllDayDrop) {
                this.tip.update(
                    dd.vAdjustedPointerDate,
                    Sch.util.Date.add(dd.vAdjustedPointerDate, Sch.util.Date.HOUR, 1),
                    dd.valid,
                    dd.message,
                    dd.isAllDayDrop
                );
            }
            else if (dd.isAllDayDrop) {
                this.tip.update(
                    Sch.model.Event.getAllDayDisplayStartDate(dd.startDate),
                    Sch.model.Event.getAllDayDisplayEndDate(dd.startDate, dd.endDate),
                    dd.valid,
                    dd.message,
                    dd.isAllDayDrop
                );
            }
            else {
                this.tip.update(
                    dd.startDate,
                    dd.endDate,
                    dd.valid,
                    dd.message,
                    dd.isAllDayDrop
                );
            }
        }

        if (e) {
            this.lastXY = [e.browserEvent.clientX + document.body.scrollLeft, e.getY()];
        }
    },

    getDragData : function (e) {
        var schedulerView = this.schedulerView,
            eventNode = e.getTarget(schedulerView.eventSelector);

        this.started = false;

        if (!eventNode || e.event.touches && e.event.touches.length > 1) return;

        var eventRecord      = schedulerView.resolveEventRecord(eventNode),
            resourceRecord   = schedulerView.resolveResource(eventNode),
            assignmentRecord = schedulerView.resolveAssignmentRecord(eventNode),
                               // there will be no event record when trying to drag the drag creator proxy for example
            allowDrag        = eventRecord && eventRecord.isDraggable() && !schedulerView.isReadOnly();

        if (!allowDrag) {
            return null;
        }

        var xy          = e.getXY(),
            eventXY     = Ext.fly(eventNode).getXY(),
            offsets     = [xy[0] - eventXY[0], xy[1] - eventXY[1]],
            eventRegion = Ext.fly(eventNode).getRegion();

        this.lastXY = null;

        var isHorizontal = schedulerView.isHorizontal();

        schedulerView.constrainDragToResource && !resourceRecord &&
        Ext.Error.raise('Resource could not be resolved for event: ' + eventRecord.getId());

        var dateConstraints = schedulerView.getDateConstraints(schedulerView.constrainDragToResource ? resourceRecord : null, eventRecord);
        var constrainRegion;

        if (schedulerView.isWeekView()) {
            constrainRegion = this.el.getRegion();
            if (eventRecord.getAllDay()) {
                constrainRegion = constrainRegion.adjust(-10000, 10000, 10000, -10000);
            }
        } else {
            constrainRegion = this.getConstrainRegion ? this.getConstrainRegion() : schedulerView.getScheduleRegion(schedulerView.constrainDragToResource ? resourceRecord : null, eventRecord);
        }

        this.setupConstraints(
            constrainRegion,
            eventRegion,
            offsets[0], offsets[1],
            isHorizontal,
            eventRecord.getAllDay && eventRecord.getAllDay() ? 1 : schedulerView.getSnapPixelAmount(),
            Boolean(dateConstraints)
        );

        var origStart      = eventRecord.get(eventRecord.startDateField),
            origEnd        = eventRecord.get(eventRecord.endDateField),
            timeAxis       = schedulerView.timeAxis,
            relatedRecords = this.getRelatedRecords(assignmentRecord || eventRecord) || [],
            eventBarEls    = schedulerView.getElementsFromEventRecord(eventRecord, schedulerView.isWeekView() ? null : resourceRecord, null, true);

        // Collecting additional elements to drag
        Ext.Array.each(relatedRecords, function (r) {
            if (r && r.isAssignmentModel) {
                eventBarEls = eventBarEls.concat(schedulerView.getElementsFromEventRecord(r.getEvent(), r.getResource(), null, true));
            }
            else {
                eventBarEls = eventBarEls.concat(schedulerView.getElementsFromEventRecord(r, null, null, true));
            }
        });
        eventBarEls        = Ext.Array.unique(eventBarEls); // I'm not sure if it's required, but this way it seems safer

        var dragData = {
            offsets  : offsets,
            repairXY : eventXY,
            triggerEvent : e,
            prevScroll : schedulerView.getScroll(),

            dateConstraints : dateConstraints,

            eventBarEls : eventBarEls,

            // During infinite scroll the scheduling view might be refreshed, due to time axis reconfiguration,
            // thus destroying previously stored DOM elements (and possibly new DOMs rendered),
            // by getting stored event elements via this method we make sure to always get fresh Elements
            // and ignore stale ones.
            getEventBarElements : function () {
                return dragData.eventBarEls = Ext.Array.map(dragData.eventBarEls, function (el) {
                    return el && document.getElementById(el.id);
                });
            },

            draggedRecords : [assignmentRecord || eventRecord].concat(relatedRecords),

            getEventRecord : function() {
                var record = this.draggedRecords[0];

                if (record instanceof Sch.model.Assignment) {
                    record = record.getEvent();
                }

                return record;
            },

            resourceRecord : resourceRecord,

            sourceDate : schedulerView.getTimeZoneDateFromXY(xy),
            origStart  : origStart,
            origEnd    : origEnd,
            startDate  : origStart,
            endDate    : origEnd,
            timeDiff   : 0,

            startsOutsideView : origStart < timeAxis.getStart(),
            endsOutsideView   : origEnd > timeAxis.getEnd(),

            duration : origEnd - origStart

        };

        this.copyKeyPressed = this.enableCopy && e[this.enableCopyKey.toLowerCase() + 'Key'];

        dragData.ddel = this.getDragElement(eventNode, dragData);

        return dragData;
    },

    onStartDrag : function () {
        var schedulerView = this.schedulerView,
            dd            = this.dragData;

        // To make sure any elements made visible by hover are not visible when the original element is hidden (using visibility:hidden)
        Ext.Array.each(dd.getEventBarElements(), function (el) {
            Ext.fly(el).removeCls('sch-event-hover');
        });

        schedulerView.fireEvent('eventdragstart', schedulerView, dd.draggedRecords);

        this.viewScrollListener = schedulerView.getScrollable().on({
            scroll      : this.onViewScroll,
            destroyable : true,
            scope       : this
        });

        this.gridScrollListener = schedulerView.up('timelinetree,timelinegrid').getScrollable().on({
            scroll      : this.onViewScroll,
            destroyable : true,
            scope       : this
        });
    },

    alignElWithMouse : function (el, iPageX, iPageY) {
        this.callParent(arguments);

        // HACK proxy position calculation is off the first drag action in IE with RTL + viewport
        if (Ext.isIE && this.schedulerView.rtl && this.schedulerView.up('[isViewport]')) {
            this.deltaSetXY = null;
            this.callParent(arguments);
        }

        var oCoord = this.getTargetCoord(iPageX, iPageY),
            fly    = el.dom ? el : Ext.fly(el, '_dd');

        // original method limits task position by viewport dimensions
        // our drag proxy is located on secondary canvas and can have height larger than viewport
        // so we have to set position relative to bigger secondary canvas
        this.setLocalXY(
            fly,
            oCoord.x + this.deltaSetXY[0],
            oCoord.y + this.deltaSetXY[1]
        );
    },

    onViewScroll : function (scrollable) {
        // var proxy              = this.proxy,
            // s                  = this.schedulerView,
            // dd                 = this.dragData,
            // scroll             = s.getScroll(),
            // left               = scroll.left,
            // top                = scroll.top,
            // rtlWithoutViewport = s.rtl && !s.up('[isViewport]'); // Ext JS has different behavior for viewport case vs non-viewport case.

        this.setVisibilityForSourceEvents(false);

        // var xy = proxy.getXY();
        // getScroll works different for RTL case: it will return 0 when view is scrolled max to the right
        // var newXY;
        //
        // if (rtlWithoutViewport) {
        //     newXY = [xy[0] - left + dd.prevScroll.left, xy[1] + top - dd.prevScroll.top];
        // } else {
        //     newXY = [xy[0] + left - dd.prevScroll.left, xy[1] + top - dd.prevScroll.top];
        // }

        // var deltaSetXY = this.deltaSetXY;
        // if (rtlWithoutViewport) {
        //     this.deltaSetXY = [deltaSetXY[0] - left + dd.prevScroll.left, deltaSetXY[1] + top - dd.prevScroll.top];
        // } else {
        //     this.deltaSetXY = [deltaSetXY[0] + left - dd.prevScroll.left, deltaSetXY[1] + top - dd.prevScroll.top];
        // }
        // dd.prevScroll = { left : left, top : top };

        // proxy.setXY(newXY);

        this.onDragOver();
    },


    /**
     * Returns true if the current action is a copy action.
     * @returns {boolean}
     */

    isCopyKeyPressed : function () {
        return this.enableCopy && this.copyKeyPressed;
    },

    onShiftKeyStateChange : function (pressed) {
        var dd             = this.dragData;

        if (pressed) {
            dd.refElements.addCls('sch-event-copy');
        } else {
            dd.refElements.removeCls('sch-event-copy');
        }

        this.setVisibilityForSourceEvents(pressed);

        this.copyKeyPressed = pressed;
    },


    onKey : function (e) {
        if (this.enableCopy && e.getKey() === e[this.enableCopyKey]) {
            this.onShiftKeyStateChange(e.type === 'keydown');
        }

        // Simulate abort on ESC key
        if (e.getKey() === e.ESC) {
            this.abortDrag(e);
        }
    },

    abortDrag : function(event) {
        this.dragData.ddCallbackArgs = [event.getTarget(), event, this.id];
        this.finalize(false);
        Ext.dd.DragDropManager.stopDrag(event);
        Ext.dd.DragDropManager.stopEvent(event);
    },

    // HACK, overriding private method, proxy needs to be shown before aligning to it
    startDrag : function () {
        var schedulerView = this.schedulerView,
            dragData = this.dragData;

        if (schedulerView.fireEvent('beforeeventdrag', schedulerView, dragData.draggedRecords[0], dragData.triggerEvent) === false) {
            this.abortDrag(dragData.triggerEvent);
            return;
        }

        var retVal = this.callParent(arguments);

        this.started = true;

        // No sense to use `this.schedulerView.mon` since this.destroy is called on this.schedulerView.destroy and cleans up all listeners
        this.keyListener = Ext.getDoc().on({
            keydown     : this.onKey,
            keyup       : this.onKey,
            useCapture  : true,
            destroyable : true,
            scope       : this
        });

        // This is the representation of the original element inside the proxy
        dragData.refElement  = this.proxy.el.down('.' + this.dragDropProxyCls);
        dragData.refElements = this.proxy.el.select('.sch-event');

        // The dragged element should not be in hover state
        dragData.refElement.removeCls('sch-event-hover');

        if (this.showTooltip) {
            // Seems required as of Ext 4.1.0, to clear the visibility:hidden style.
            this.tip.setStyle('visibility');
            this.tip.update(dragData.origStart, dragData.origEnd, true);
            this.tip.showForElement(dragData.refElement, dragData.offsets[0]);
        }

        if (this.copyKeyPressed) {
            dragData.refElements.addCls('sch-event-copy');
            dragData.originalHidden = true;
        }

        return retVal;
    },


    endDrag : function () {
        this.cleanupListeners();
        this.callParent(arguments);
    },

    cleanupListeners : function() {
        if (this.viewScrollListener) {
            this.viewScrollListener.destroy();
            this.viewScrollListener = null;
        }

        if (this.gridScrollListener) {
            this.gridScrollListener.destroy();
            this.gridScrollListener = null;
        }

        if (this.keyListener) {
            this.keyListener.destroy();
            this.keyListener = null;
        }
    },

    onMouseUp : function () {
        if (!this.dragging) {
            // Reset drag proxy position on a simple mouse click (which triggers a change in the 'left' position of the proxy el)
            this.afterDragFinalized();
        }
    },

    afterDragFinalized : function () {
        // https://www.assembla.com/spaces/bryntum/tickets/1524#/activity/ticket:
        // If drag is done close to the edge to invoke scrolling, the proxy could be left there and interfere
        // with the view sizing if the columns are shrunk.
        this.proxy.el.dom.style.top = this.proxy.el.dom.style.left = 0;
    },

    updateRecords : function (context) {
        var me                    = this,
            schedulerView         = me.schedulerView,
            eventStore            = schedulerView.getEventStore(),
            resourceStore         = schedulerView.getResourceStore(),
            assignmentStore       = eventStore.getAssignmentStore(),
            newResource           = context.newResource,
            draggedRecord         = context.draggedRecords[0],
            relatedDraggedRecords = context.draggedRecords.slice(1),
            resourceRecord        = context.resourceRecord,
            copyKeyPressed        = me.isCopyKeyPressed(),
            startDate             = context.startDate,
            vAdjustedPointerDate  = context.vAdjustedPointerDate,
            hAdjustedPointerDate  = context.hAdjustedPointerDate,
            // Context has a timeDiff which is a difference between pointer's start and finish positions. This time
            // diff is actual difference between initial event start date and final start date. This is used to adjust
            // related events
            timeDiff              = startDate - context.origStart,
            isWeekView            = schedulerView.isWeekView(),
            addedRecords;

        // Scheduler multiple assignment mode
        if (assignmentStore && eventStore instanceof Sch.data.EventStore) {
            me.updateRecordsMultipleAssignmentMode(
                startDate, timeDiff, draggedRecord, relatedDraggedRecords, resourceRecord,
                newResource, eventStore, resourceStore, assignmentStore, copyKeyPressed, isWeekView,
                hAdjustedPointerDate, vAdjustedPointerDate
            );
        }
        // Gantt mode (and task store instead of event store)
        else if (assignmentStore) {
            addedRecords = me.updateRecordsSingleAssignmentMode(
                startDate, timeDiff, draggedRecord.getEvent(), Ext.Array.map(relatedDraggedRecords, function (r) {
                    return r.getEvent();
                }), resourceRecord, newResource, eventStore, resourceStore, copyKeyPressed, isWeekView,
                hAdjustedPointerDate, vAdjustedPointerDate
            );
        }
        // Scheduler single assignment mode
        else {
            addedRecords = me.updateRecordsSingleAssignmentMode(
                startDate, timeDiff, draggedRecord, relatedDraggedRecords, resourceRecord,
                newResource, eventStore, resourceStore, copyKeyPressed, isWeekView,
                hAdjustedPointerDate, vAdjustedPointerDate
            );
        }

        if (copyKeyPressed) {
            context.copiedRecords = addedRecords;
        }

        // Tell the world there was a successful drop
        schedulerView.fireEvent('eventdrop', schedulerView, context.copiedRecords || context.draggedRecords, copyKeyPressed);
    },

    updateRecordsSingleAssignmentMode : function (startDate, timeDiff, draggedEvent, relatedEvents, fromResource, toResource,
                                                  eventStore, resourceStore, copy, isWeekView, hPointerDate, vPointerDate) {
        // The code is written to emit as little store events as possible
        var me        = this,
            toAdd     = [],
            wasAllDay = draggedEvent.getAllDay && draggedEvent.getAllDay(),
            UD        = Sch.util.Date,
            newStart;

        if (copy) {
            draggedEvent = draggedEvent.fullCopy(null);
            toAdd.push(draggedEvent);
        }

        // Process original dragged record
        draggedEvent.beginEdit();

        // in weekview resources are just time spans, so we have to skip this part
        if (fromResource && fromResource.isResourceModel && toResource && toResource.isResourceModel && toResource !== fromResource) {
            if (copy) {
                draggedEvent.assign(toResource);
            } else {
                draggedEvent.reassign(fromResource, toResource);
            }
        }

        draggedEvent.setAllDay && draggedEvent.setAllDay(me.dragData.isAllDayDrop);

        if (draggedEvent.getAllDay && draggedEvent.getAllDay()) {
            newStart = UD.copyTimeValues(UD.clearTime(startDate, true), me.dragData.origStart);

            // NOTE: The last parameter here is only if event store is actually a task store
            draggedEvent.setStartEndDate(
                newStart,
                UD.add(newStart, UD.MILLI, me.dragData.duration),
                eventStore.skipWeekendsDuringDragDrop
            );
        }
        else if (wasAllDay) {
            // NOTE: The last parameter here is only if event store is actually a task store
            draggedEvent.setStartEndDate(vPointerDate , UD.add(vPointerDate, UD.HOUR, 1), eventStore.skipWeekendsDuringDragDrop);
        }
        else {
            // NOTE: The last parameter here is only if event store is actually a task store
            draggedEvent.setStartDate(startDate, true, eventStore.skipWeekendsDuringDragDrop);
        }

        draggedEvent.endEdit();

        Ext.Array.each(relatedEvents, function (related) {
            // grabbing resources early, since after ".copy()" the record won't belong to any store
            // and ".getResources()" won't work
            var relatedResources = isWeekView ? null : related.getResources();

            if (copy) {
                related = related.fullCopy(null);
                toAdd.push(related);
            }

            related.beginEdit();

            // calculate new startDate (and round it) based on timeDiff
            related.setStartDate(UD.add(related.getStartDate(), UD.MILLI, timeDiff), true, eventStore.skipWeekendsDuringDragDrop);

            // in weekview drag&drop resource doesn't change
            if (!isWeekView) {
                // Process related records
                var indexDiff = resourceStore.indexOf(fromResource) - resourceStore.indexOf(toResource);

                indexDiff !== 0 && relatedResources.length && Ext.Array.each(relatedResources, function (r) {
                    var newIndex = resourceStore.indexOf(r) - indexDiff,
                        newResource;

                    if (newIndex < 0) {
                        newIndex = 0;
                    }
                    else if (newIndex >= resourceStore.getCount()) {
                        newIndex = resourceStore.getCount() - 1;
                    }

                    newResource = resourceStore.getAt(newIndex);
                    related.reassign(r, newResource);
                });
            }

            related.endEdit();
        });

        if (toAdd.length) {
            eventStore.append(toAdd);
        }

        return toAdd;
    },

    updateRecordsMultipleAssignmentMode : function (startDate, timeDiff, draggedAssignment, relatedAssignments,
                                                    fromResource, toResource, eventStore, resourceStore,
                                                    assignmentStore, copy, isWeekView, hPointerDate, vPointerDate) {
        var me = this,
            UD = Sch.util.Date;

        // In case multiSelect is true, several assignments to one event may be processed here. We will store
        // ids of processed events here to avoid setting incorrect start date
        var handledEventsMap = {};

        Ext.Array.each([].concat(draggedAssignment, relatedAssignments), function (assignment) {
            var event = assignment.getEvent();

            if (handledEventsMap[event.getId()]) {
                return;
            }

            handledEventsMap[event.getId()] = true;

            event.setStartDate(UD.add(event.getStartDate(), UD.MILLI, timeDiff), true, eventStore.skipWeekendsDuringDragDrop)

            // if we dragged the event to a different resource
            if (!isWeekView && fromResource !== toResource) {
                if (copy) {
                    event.assign(toResource);
                } else if (!event.isAssignedTo(toResource)) {
                    event.reassign(assignment.getResource(), toResource);
                } else {
                    event.unassign(assignment.getResource());
                }
            }
        });
    },

    isValidDrop : function (oldResource, newResource, sourceRecord) {
        // Not allowed to assign an event twice to the same resource -
        // which might happen when we deal with an assignment store
        if (oldResource !== newResource) {
            // if we operate assignments
            if (sourceRecord.isAssignmentModel) {
                return !sourceRecord.getEvent().isAssignedTo(newResource);
            } else {
                return !sourceRecord.isAssignedTo(newResource);
            }
        }

        return true;
    },


    resolveResource : function (xy) {
        var proxyDom    = this.proxy.el.dom;
        var bodyScroll  = Ext.getBody().getScroll();
        var view        = this.schedulerView;

        proxyDom.style.display = 'none';
        var node               = document.elementFromPoint(xy[0] - bodyScroll.left, xy[1] - bodyScroll.top);

        proxyDom.style.display = 'block';

        if (!node) {
            return null;
        }

        if (Ext.fly(node).up('.' + Ext.baseCSSPrefix + 'grid-group-hd', 4, true)) {
            return null;
        }

        // If we hover a table row border we will match a row element here.
        // We then need to adjust the Y-pos to get a cell which gives us the correct cell index.
        if (node.className.match(Ext.baseCSSPrefix + 'grid-item')) {
            return this.resolveResource([xy[0], xy[1] + 3]);
        }

        if (!node.className.match(view.timeCellCls)) {
            var parent = Ext.fly(node).up('.' + view.timeCellCls);

            if (parent) {
                node = parent.dom;
            } else {
                return null;
            }
        }
        return view.resolveResource(node);
    },

    adjustStartDate : function (startDate, timeDiff, schedulerView) {
        var view = schedulerView || this.schedulerView;

        var newStartDate = new Date(startDate - 0 + timeDiff);

        if (view.timeAxis.hasTimeZone() && Sch.util.Date.compareUnits(Sch.util.Date.DAY, view.timeAxis.resolutionUnit) <= 0) {
            return view.roundDateInTimeZone(newStartDate, 'round');
        }
        else {
            return view.timeAxis.roundDate(newStartDate, view.snapRelativeToEventStartDate ? startDate : false);
        }
    },

    resolveSchedulerView : function (e) {
        var viewEl = e.getTarget('.sch-schedulerview');

        return viewEl && Ext.getCmp(viewEl.id) || this.schedulerView;
    },

    // private
    updateDragContext : function (e) {
        var dd      = this.dragData,
            xy      = e ? e.getXY() : this.lastXY,
            clientX, rawXY;

        if (e) {
            if (e.browserEvent.touches && e.browserEvent.touches.length > 0) {
                clientX = e.browserEvent.touches[0].clientX;
            } else {
                clientX = e.browserEvent.clientX != null ? e.browserEvent.clientX : e.clientX;
            }

            // Ext JS might convert e.getXY() coordinates to be calculated from right side if Scheduler is in a viewport
            // So for resource lookup we always use the raw browser XY since we rely on document.elementFromPoint
            rawXY = [clientX + document.body.scrollLeft, e.getY()];
        } else {
            rawXY = this.lastXY;
        }

        if (!dd.refElement) {
            return;
        }

        // In week view mode, first find the responsible scheduler view
        var schedulerView = (e && this.schedulerView.isWeekView() && this.resolveSchedulerView(e)) || this.schedulerView,
            proxyRegion   = dd.refElement.getRegion(),
            pointerDate;

        pointerDate = schedulerView.getTimeZoneDateFromXY(xy);

        dd.pointerDate  = pointerDate;

        dd.vAdjustedPointerDate = this.adjustStartDate(schedulerView.getDateFromXY([xy[0] - dd.offsets[0], xy[1]]), 0, schedulerView);
        dd.hAdjustedPointerDate = this.adjustStartDate(schedulerView.getDateFromXY([xy[0], xy[1] - dd.offsets[1]]), 0, schedulerView);

        dd.isAllDayDrop = Boolean(schedulerView.allDay);

        if (schedulerView.timeAxis.isContinuous()) {
            if (
                (schedulerView.isHorizontal() && this.minX < xy[ 0 ] && xy[ 0 ] < this.maxX) ||
                (!schedulerView.isHorizontal() && this.minY < xy[ 1 ] && xy[ 1 ] < this.maxY)
            ) {
                dd.timeDiff = pointerDate - dd.sourceDate;

                // calculate and round new startDate based on actual dd.timeDiff
                dd.startDate = this.adjustStartDate(dd.origStart, dd.timeDiff);
                dd.endDate   = new Date(dd.startDate - 0 + dd.duration);
            }
        } else {
            var range;

            if (schedulerView.isWeekView()) {
                // If we dragdrop in calendar view, we need to modify region to calculate correct date. We need date
                // from the mouse horizontal position and event region top/bottom.
                var calendarRange = {
                    bottom  : proxyRegion.bottom,
                    top     : proxyRegion.top
                };
                calendarRange.left = calendarRange.right = proxyRegion.left + dd.offsets[0];
                range = this.resolveStartEndDates(schedulerView, calendarRange);
            } else {
                range = this.resolveStartEndDates(schedulerView, proxyRegion);
            }

            dd.startDate = range.startDate;
            dd.endDate   = range.endDate;

            dd.timeDiff = dd.startDate - dd.origStart;
        }

        dd.newResource = schedulerView.constrainDragToResource ? dd.resourceRecord : this.resolveResource(rawXY);

        if (dd.newResource) {
            var result = !e ||this.validatorFn.call(this.validatorFnScope || this, dd.draggedRecords, dd.newResource, dd.startDate, dd.duration, e);

            if (!result || typeof result === 'boolean') {
                dd.valid   = result !== false;
                dd.message = '';
            } else {
                dd.valid   = result.valid !== false;
                dd.message = result.message;
            }
        } else {
            dd.valid = false;
        }
    },

    /**
     * Provide your custom implementation of this to allow additional selected records to be dragged together with the original one.
     * @param {Ext.data.Model} eventRecord The eventRecord about to be dragged
     * @return {[Ext.data.Model]} An array of event records to drag together with the original event
     */
    getRelatedRecords : function (eventRecord) {
        var view   = this.schedulerView,
            sm     = view.getEventSelectionModel(),
            result = sm.getDraggableSelections();

        return Ext.Array.filter(result, function (selectedRecord) {
            return eventRecord !== selectedRecord;
        });
    },

    /**
     * This function should return a DOM node representing the markup to be dragged. By default it just returns the selected element(s) that are to be dragged.
     * If dragging multiple events, the clone of the original item should be assigned the special CSS class {@link #dragDropProxyCls}
     * @param {Ext.Element/HTMLElement} sourceEl The event element that is the source drag element
     * @param {Object} dragData The drag drop context object
     * @return {HTMLElement} The DOM node to drag
     */
    getDragElement : function (sourceEl, dragData) {
        var eventBarEls = dragData.getEventBarElements();
        var copy;
        var retVal;
        var offsetX     = dragData.offsets[0];
        var offsetY     = dragData.offsets[1];
        var sourceNode  = sourceEl.dom || sourceEl;
        var side        = this.schedulerView.rtl ? "right" : "left";

        if (eventBarEls.length > 1) {
            var ctEl = Ext.core.DomHelper.createDom({
                tag   : 'div',
                cls   : 'sch-dd-wrap',
                style : { overflow : 'visible' }
            });

            Ext.Array.each(eventBarEls, function (node) {
                copy = node.cloneNode(true);

                copy.id = Ext.id();

                if (node === sourceNode) {
                    // Using Ext fly here seems buggy in Ext 5.0.1
                    copy.className += ' ' + this.dragDropProxyCls;
                }

                ctEl.appendChild(copy);

                var elOffsets = Ext.fly(node).getOffsetsTo(sourceNode);

                // Adjust each element offset to the source event element
                copy.style[side] = elOffsets[0] - offsetX + 'px';
                copy.style.top   = elOffsets[1] - offsetY + 'px';
            }, this);

            retVal = ctEl;
        } else {
            copy    = sourceNode.cloneNode(true);
            copy.id = Ext.id();

            copy.style[side] = -offsetX + 'px';
            copy.style.top   = -offsetY + 'px';

            copy.className += ' ' + this.dragDropProxyCls;

            retVal = copy;
        }

        // TODO: fix this, it's written as if we will always have 1 element being dragged.
        // If event rendering is not using px values (could be overridden to % values in CSS) we need to
        // put a height in place for the proxy element to look correctly
        if (!sourceNode.style.height) {
            Ext.fly(retVal).setHeight(Ext.fly(sourceNode).getHeight());
        }

        return retVal;
    },


    onDragDrop : function (e, id) {
        var me = this;

        me.updateDragContext(e);

        var s             = me.schedulerView,
            target        = me.cachedTarget || Ext.dd.DragDropMgr.getDDById(id),
            dragData      = me.dragData,
            datesProvided = dragData.startDate && dragData.endDate,
            doFinalize    = true;

        if (me.tip) {
            me.tip.hide();
        }

        var modified = (dragData.startDate - dragData.origStart) !== 0 || dragData.newResource !== dragData.resourceRecord;
        var valid    = (modified || me.isCopyKeyPressed()) && dragData.valid && datesProvided && me.isValidDrop(dragData.resourceRecord, dragData.newResource, dragData.draggedRecords[0]);

        Ext.apply(dragData, {
            // Used later in finalizeDrop
            ddCallbackArgs : [target, e, id],

            // to have the same keys like doc says and like dragCreate has
            start          : dragData.startDate,
            end            : dragData.endDate,
            finalize       : function () {
                me.finalize.apply(me, arguments);
            }
        });

        // In case Ext JS sets a very high Z-index, lower it temporarily so it doesn't interfere with popups etc
        me.proxy.el.addCls('sch-before-drag-finalized');

        var continueFn = function () {
            me.finalize(true);
        };

        var cancelFn = function () {
            me.finalize(false);
        };

        if (valid) {
            if (s.fireEvent('beforeeventdropfinalize', me.schedulerView, dragData, e, continueFn, cancelFn) !== false) {
                continueFn();
            }
        } else {
            cancelFn();
        }
    },

    finalize : function (updateRecords) {
        var me         = this,
            view       = me.schedulerView,
            eventStore = view.getEventStore();

        me.proxy.el.removeCls('sch-before-drag-finalized');

        if (updateRecords) {
            // Catch one more edge case, if a taskStore with calendars is used - there is a possible scenario
            // where the UI isn't repainted. In gantt+scheduler demo, move an event in the scheduler a few px
            // and it disappears since Calendar adjusts its start date and scheduler is unaware of this.
            var updated,
                checkerFn = function () {
                    updated = true;
                };

            eventStore.on('update', checkerFn, null, { single : true });
            me.updateRecords(me.dragData);
            eventStore.un('update', checkerFn, null, { single : true });

            if (!updated) {
                me.onInvalidDrop.apply(me, me.dragData.ddCallbackArgs);
            } else {
                me.onValidDrop.apply(me, me.dragData.ddCallbackArgs);


                view.fireEvent('aftereventdrop', view, me.dragData.copiedRecords || me.dragData.draggedRecords);
            }
            me.afterDragFinalized();
        } else {
            me.onInvalidDrop.apply(me, me.dragData.ddCallbackArgs);
        }
    },

    // HACK: Override for IE11, if you drag the task bar outside the window or iframe it crashes (missing e.target)
    // https://www.assembla.com/spaces/bryntum/tickets/716
    onInvalidDrop : function (target, e, id) {
        if (!e) {
            e      = target;
            target = e.getTarget() || document.body;
        }

        if (this.tip) {
            this.tip.hide();
        }

        this.setVisibilityForSourceEvents(true);

        var schedulerView = this.schedulerView,
            retVal        = this.callParent([target, e, id]);

        if (this.started) {
            schedulerView.fireEvent('aftereventdrop', schedulerView, this.dragData.copiedRecords || this.dragData.draggedRecords);
        }

        this.afterDragFinalized();

        return retVal;
    },


    resolveStartEndDates : function (schedulerView, proxyRegion) {
        var dd    = this.dragData,
            startEnd,
            start = dd.origStart,
            end   = dd.origEnd,
            DATE = Sch.util.Date;

        if (!dd.startsOutsideView) {
            startEnd = schedulerView.getStartEndDatesFromRegion(proxyRegion, 'round');

            // Make sure we didn't target a start date that is filtered out, if we target last hour cell (e.g. 21:00) of
            // the time axis, and the next tick is 08:00 following day. Trying to drop at end of 21:00 cell should target start of next cell
            if (startEnd.start) {
                if (!schedulerView.timeAxis.dateInAxis(startEnd.start, false)) {
                    var tick = schedulerView.timeAxis.getTickFromDate(startEnd.start);

                    if (tick) {
                        startEnd.start = schedulerView.timeAxis.getDateFromTick(tick);
                    }
                }

                start = startEnd.start || dd.startDate;
                end   = DATE.add(start, DATE.MILLI, dd.duration);
            }
        } else if (!dd.endsOutsideView) {
            startEnd = schedulerView.getStartEndDatesFromRegion(proxyRegion, 'round');

            if (startEnd) {
                end   = startEnd.end || dd.endDate;
                start = DATE.add(end, DATE.MILLI, -dd.duration);
            }
        }

        return {
            startDate : start,
            endDate   : end
        };
    }

});
