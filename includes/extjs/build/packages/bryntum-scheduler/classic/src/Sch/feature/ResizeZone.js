/**
 * @class Sch.feature.ResizeZone
 * @extends Ext.util.Observable
 * @private
 * Internal classing enabling resizing of rendered events
 * @constructor
 * @param {Sch.panel.SchedulerGrid} scheduler The scheduler instance
 * @param {Object} config The object containing the configuration of this model.
 */

Ext.define("Sch.feature.ResizeZone" , {
    extend      : "Ext.util.Observable",
    requires    : [
        'Ext.resizer.Resizer',
        'Sch.tooltip.Tooltip',
        'Sch.util.ScrollManager'
    ],

    /**
      * @cfg {Boolean} showTooltip `false` to not show a tooltip while resizing
      */
    showTooltip         : true,

    /**
     * @type {Boolean} showExactResizePosition true to see exact event length during resizing
     */
    showExactResizePosition : false,

    /**
     * An empty function by default, but provided so that you can perform custom validation on
     * the item being resized. Return true if the new duration is valid, false to signal that it is not.
     * @param {Sch.model.Resource} resourceRecord the resource to which the event belongs
     * @param {Sch.model.Event} eventRecord the event being resized
     * @param {Date} startDate
     * @param {Date} endDate
     * @param {Ext.event.Event} e The event object
     * @return {Boolean}
     */
    validatorFn         : Ext.emptyFn,

    /**
     * @cfg {Object} validatorFnScope
     * The scope for the validatorFn
     */
    validatorFnScope    : null,

    schedulerView       : null,

    origEl              : null,
    handlePos           : null,
    eventRec            : null,
    mouseDownEvent      : null,

    /**
     * @cfg {Ext.tip.ToolTip/Object} tip
     *
     * The tooltip instance to show while resizing an event or a configuration object for the {@link Sch.tooltip.Tooltip}.
     */
    tip                 : null,
    // cached reference to the created tooltip instance
    tipInstance         : null,

    startScroll         : null,

    constructor : function(config) {
        Ext.apply(this, config);
        var s = this.schedulerView;

        s.on({
            destroy : this.cleanUp,
            scope   : this
        });

        s.el.on({
            mousedown       : this.onMouseDown,
            mouseup         : this.onMouseUp,
            scope           : this,
            delegate        : '.sch-resizable-handle'
        });

        this.bindRightClickPreventer();

        this.callParent(arguments);
    },

    bindRightClickPreventer : function () {
        this.schedulerView.el.on('contextmenu', this.preventRightClick, this, { priority : 999 });
    },

    // Prevent right clicks while resizing an event
    preventRightClick : function (e) {
        if (e.button !== 0 && this.resizer) {
            e.stopEvent();
            return false;
        }
    },

    onMouseDown : function(e, t) {
        var s               = this.schedulerView;
        var eventRec        = this.eventRec = s.resolveEventRecord(t);
        var isResizable     = eventRec.isResizable();

        if (e.button !== 0 || (isResizable === false || typeof isResizable === 'string' && !t.className.match(isResizable))) {
            return;
        }

        this.eventRec       = eventRec;
        this.handlePos      = this.getHandlePosition(t);
        this.origEl         = Ext.get(e.getTarget('.sch-event'));
        this.mouseDownEvent = e;

        s.el.on({
            mousemove   : this.onMouseMove,
            scope       : this,
            single      : true
        });
    },

    onMouseUp : function(e, t) {
        var s = this.schedulerView;

        s.el.un({
            mousemove   : this.onMouseMove,
            scope       : this,
            single      : true
        });

        this.mouseDownEvent = null;
    },


    getTipInstance : function () {
        if (this.tipInstance) return this.tipInstance;

        var s               = this.schedulerView;
        var tip             = this.tip;

        if (tip instanceof Ext.tip.ToolTip) {
            tip.schedulerView = s;
        } else {
            tip     = new Sch.tooltip.Tooltip(Ext.apply({
                rtl             : this.rtl,
                schedulerView   : s,
                constrainTo     : s.up('grid').el,
                cls             : 'sch-resize-tip'
            }, tip));
        }

        return this.tipInstance = tip;
    },


    onMouseMove : function(e, t) {
        var s           = this.schedulerView,
            eventRec    = this.eventRec,
            handlePos   = this.handlePos;

        if (!eventRec || s.fireEvent('beforeeventresize', s, eventRec, e) === false) {
            return;
        }

        delete this.eventRec;
        e.stopEvent();

        this.origEl.addCls('sch-event-resizing');

        this.resizer    = this.createResizer(this.origEl, eventRec, handlePos);

        var tracker     = this.resizer.resizeTracker;

        // HACK, fake the start of the resizing right away
        tracker.onMouseDown(this.mouseDownEvent, this.resizer[ handlePos ].dom);
        tracker.onMouseMove(e, this.resizer[ handlePos ].dom);

        if (this.showTooltip) {
            var tip     = this.getTipInstance();

            tip.update(eventRec.getStartDate(), eventRec.getEndDate(), true);
            // update requires target that was removed after previous resize
            tip.showForElement(this.origEl, e.getX() - this.origEl.getX());
        }

        s.fireEvent('eventresizestart', s, eventRec);

        // Handle inifinite scroll case
        s.getScrollable().on('scroll', this.onViewScroll, this);
    },

    getHandlePosition : function(node) {
        var isStart = node.className.match('start');

        if (this.schedulerView.isHorizontal()) {
            if (this.schedulerView.rtl) {
                return isStart ? 'east' : 'west';
            }
            return isStart ? 'west' : 'east';
        } else {
             return isStart ? 'north' : 'south';
        }
    },

    // private
    createResizer : function (eventEl, eventRecord, handlePos) {
        var s                   = this.schedulerView,
            me                  = this,
            resourceRecord      = s.resolveResource(eventEl),
            increment           = s.getSnapPixelAmount(),
            constrainRegion     = s.getScheduleRegion(resourceRecord, eventRecord),
            dateConstraints     = s.getDateConstraints(resourceRecord, eventRecord),
            height              = eventEl.getHeight(),
            isStart             = (s.rtl && handlePos[0] === 'e') || (!s.rtl && handlePos[0] === 'w') || handlePos[0] === 'n',
            isVertical          = !s.isHorizontal(),

            resizerCfg          = {
                otherEdgeX      : isStart ? eventEl.getRight() : eventEl.getLeft(),
                otherEdgeY      : isStart ? eventEl.getBottom() : eventEl.getTop(),
                target          : eventEl,
                isStart         : isStart,
                dateConstraints : dateConstraints,
                resourceRecord  : resourceRecord,
                eventRecord     : eventRecord,
                handles         : handlePos[0],
                minHeight       : height,
                constrainTo     : constrainRegion,

                listeners       : {
                    resizedrag  : this.partialResize,
                    resize      : this.afterResize,
                    scope       : this
                }
            };

        // Apply orientation specific configs
        if (isVertical) {
            if (increment > 0) {
                var w = eventEl.getWidth();

                Ext.apply(resizerCfg, {
                    minHeight       : increment,
                    // To avoid SHIFT causing a ratio preserve
                    minWidth        : w,
                    maxWidth        : w,
                    heightIncrement : increment
                });
            }
        } else {
            if (increment > 0) {

                Ext.apply(resizerCfg, {
                    minWidth        : increment,
                    // To avoid SHIFT causing a ratio preserve
                    maxHeight       : height,
                    widthIncrement  : increment
                });
            }
        }

        var resizer = new Ext.resizer.Resizer(resizerCfg);

        if (resizer.resizeTracker) {

            // Force tracker to start tracking even with just 1px movement, defaults to 3.
            resizer.resizeTracker.tolerance = -1;

            // Patched to handle changes in containing scheduler view el scroll position
            // TODO re-enable this again when we support scroll triggering during resize operation which stopped working in Ext JS 5 due to internal Ext JS changes
            //
            // resizer.resizeTracker.resize = function(box) {
            //     var scrollDelta;
            //
            //     if (isVertical) {
            //         scrollDelta = s.getVerticalScroll() - me.startScroll.top;
            //
            //         if (handlePos[0] === 's') {
            //             box.y -= scrollDelta;
            //         }
            //
            //         box.height += Math.abs(scrollDelta);
            //     } else {
            //         scrollDelta = s.getScrollX()- me.startScroll.left;
            //
            //         if (handlePos[0] === 'e') {
            //             box.x -= scrollDelta;
            //         }
            //
            //         box.width += Math.abs(scrollDelta);
            //     }
            //
            //     Ext.resizer.ResizeTracker.prototype.resize.apply(this, arguments);
            // };
        }

        // Make sure the resizing event is on top of other events
        eventEl.setStyle('z-index', parseInt(eventEl.getStyle('z-index'), 10)+1);

        Sch.util.ScrollManager.activate(s, s.isHorizontal() ? 'horizontal' : 'vertical');

        this.startScroll = s.getScroll();

        return resizer;
    },

    getStartEndDates : function () {
        var r             = this.resizer,
            rEl           = r.el,
            schedulerView = this.schedulerView,
            isStart       = r.isStart,
            start, end, x, xy;

        if (isStart) {
            if (schedulerView.isHorizontal()) {
                x = schedulerView.rtl && schedulerView.shouldAdjustForRtl() ? rEl.getRight() : rEl.getLeft() + 1;

                xy = [ x, 0 ];
            } else {
                xy = [ (rEl.getRight() + rEl.getLeft()) / 2, rEl.getTop() ];
            }
            end = r.eventRecord.getEndDate();

            if (schedulerView.snapRelativeToEventStartDate) {
                start = schedulerView.getDateFromXY(xy);
                start = schedulerView.timeAxis.roundDate(start, r.eventRecord.getStartDate());
            }
            else {
                start = schedulerView.getTimeZoneDateFromXY(xy, 'round');
            }
        } else {

            if (schedulerView.isHorizontal()) {
                x = schedulerView.rtl && schedulerView.shouldAdjustForRtl() ? rEl.getLeft() : rEl.getRight();

                xy = [ x, 0 ];
            } else {
                xy = [ (rEl.getRight() + rEl.getLeft()) / 2, rEl.getBottom() ];
            }

            start = r.eventRecord.getStartDate();

            if (schedulerView.snapRelativeToEventStartDate) {
                end = schedulerView.getDateFromXY(xy);
                end = schedulerView.timeAxis.roundDate(end, r.eventRecord.getEndDate());
            }
            else {
                end = schedulerView.getTimeZoneDateFromXY(xy, 'round');
            }
        }

        start = start || r.start;
        end   = end || r.end;

        if (r.dateConstraints) {
            start = Sch.util.Date.constrain(start, r.dateConstraints.start, r.dateConstraints.end);
            end   = Sch.util.Date.constrain(end, r.dateConstraints.start, r.dateConstraints.end);
        }

        return {
            start   : start,
            end     : end
        };
    },

    // private
    partialResize : function (r, width, height, e) {
        var s               = this.schedulerView,
            xy              = e ? e.getXY() : this.resizer.resizeTracker.lastXY,
            startEndDates   = this.getStartEndDates(xy),
            start           = startEndDates.start,
            end             = startEndDates.end,
            record          = r.eventRecord,
            isHorizontal    = s.isHorizontal();

        if (this.showTooltip) {
            var valid = this.validatorFn.call(this.validatorFnScope || this, r.resourceRecord, record, start, end);
            var message = '';

            // Implementer could also return an object { valid : false, message : 'foo' }
            if (valid && typeof valid !== 'boolean') {
                message = valid.message;
                valid   = valid.valid;
            }

            this.getTipInstance().update(start, end, valid !== false, message);
        }

        if (this.showExactResizePosition) {
            var target          = r.target.el,
                exactWidth,
                cursorDate,
                offset;

            if (r.isStart) {
                if (s.isWeekView()) {
                    var column  = s.weekview.getEventColumns(record)[0];
                    exactWidth  = s.timeAxisViewModel.getDistanceBetweenDates(start, column.end);
                } else {
                    exactWidth  = s.timeAxisViewModel.getDistanceBetweenDates(start, record.getEndDate());
                }

                if (isHorizontal) {
                    cursorDate  = s.getDateFromCoordinate(r.otherEdgeX - Math.min(width, r.maxWidth)) || start;
                    offset      = s.timeAxisViewModel.getDistanceBetweenDates(cursorDate, start);
                    if (target.getWidth() !== exactWidth) {
                        target.setWidth(exactWidth);
                        target.setX(target.getX() + offset);
                    }
                } else {
                    cursorDate  = s.getDateFromCoordinate(r.otherEdgeY - Math.min(height, r.maxHeight)) || start;
                    offset      = s.timeAxisViewModel.getDistanceBetweenDates(cursorDate, start);
                    if (target.getHeight() !== exactWidth) {
                        target.setHeight(exactWidth);
                        target.setY(target.getY() + offset);
                    }
                }

            } else {
                exactWidth      = s.timeAxisViewModel.getDistanceBetweenDates(record.getStartDate(), end);
                if (isHorizontal) {
                    target.setWidth(exactWidth);
                } else {
                    target.setHeight(exactWidth);
                }
            }
        } else {
            if (!start || !end || ((r.start - start === 0) && (r.end - end === 0))) {
                return;
            }
        }

        r.end   = end;
        r.start = start;

        s.fireEvent('eventpartialresize', s, record, start, end, r.el);
    },

    onViewScroll : function(scrollable, x, y, xDelta) {
        // In FF resizing throws scroll event on first mouse move and when resizing ends
        // Usually it would be stopped by sencha, in TableScroller, but we overriden it to fix another bug.
        // Instead, we change patch to always invoke scroll and we use another patch to throw delta in scroll events
        // scroll event is fired with 3 arguments normally, so 4th one should only come from our patch.
        // Affects only 6.2.1, covered by 062_resize in FF
        if (xDelta !== 0) {
            this.resizer.resizeTracker.onDrag({});
            this.partialResize(this.resizer, 0, 0);
        }
    },

    // private
    afterResize : function (r, w, h, e) {
        var me              = this,
            resourceRecord  = r.resourceRecord,
            eventRecord     = r.eventRecord,
            oldStart        = eventRecord.getStartDate(),
            oldEnd          = eventRecord.getEndDate(),
            start           = r.start || oldStart,
            end             = r.end || oldEnd,
            s               = me.schedulerView,
            isModified      = (start - oldStart) || (end - oldEnd),
            isValid         = me.validatorFn.call(me.validatorFnScope || me, resourceRecord, eventRecord, start, end, e);

        Sch.util.ScrollManager.deactivate();
        s.getScrollable().un('scroll', this.onViewScroll , this);

        if (this.showTooltip) {
            this.getTipInstance().hide();
        }

        // Implementer could also return an object { valid : false, message : 'foo' }
        if (Ext.isObject(isValid)) {
            isValid = isValid.valid;
        }

        // If users returns nothing, that's interpreted as valid
        // End date must be later than start date
        isValid = (isValid !== false) && start && end && (end - start > 0);

        var resizeContext    = {
            resourceRecord  : r.resourceRecord,
            eventRecord     : eventRecord,
            start           : start,
            end             : end,
            valid           : isValid,
            modified        : isModified,
            finalize        : function(updateRecord) {
                me.finalize(updateRecord, resizeContext);
            }
        };

        var continueFn = function () {
            me.finalize(true, resizeContext);
        };

        var cancelFn = function () {
            me.finalize(false, resizeContext);
        };

        if (isValid && isModified) {
            if (s.fireEvent('beforeeventresizefinalize', s, resizeContext, e, continueFn, cancelFn) !== false) {
                continueFn();
            }
        } else {
            cancelFn();
        }
    },

    finalize : function(updateRecord, context) {
        var s = this.schedulerView;
        var wasChanged = false;
        var checker = function () { wasChanged = true; };

        s.getEventStore().on('update', checker);

        // Without manually destroying the target, Ext Element cache gets confused
        this.resizer.target.destroy();

        if (updateRecord) {
            if (this.resizer.isStart) {
                context.eventRecord.setStartDate(context.start, false, s.getEventStore().skipWeekendsDuringDragDrop);
            } else {
                context.eventRecord.setEndDate(context.end, false, s.getEventStore().skipWeekendsDuringDragDrop);
            }
            if (!wasChanged) s.repaintEventsForResource(context.resourceRecord);
        } else {
            s.repaintEventsForResource(context.resourceRecord);
        }

        // Destroy resizer
        this.resizer.destroy();
        delete this.resizer;

        s.getEventStore().un('update', checker);
        // first event is to make it non-breaking change
        // second event is to unify names with other drag features
        s.fireEvent('eventresizeend', s, context.eventRecord);
        s.fireEvent('aftereventresize', s, context.eventRecord);
    },

    cleanUp : function() {
        if (this.tipInstance) {
            this.tipInstance.destroy();
        }

        this.mouseDownEvent = null;
    }
});
