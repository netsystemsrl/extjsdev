// https://www.sencha.com/forum/showthread.php?306315-DragDrop-on-touch-monitor-doesn-t-work-when-page-is-scrolled
// Plus additions to support different drop groups on the same dom element
Ext.define('Sch.patches.DragDropManager', {
    extend      : 'Sch.util.Patch',

    requires    : [
        'Ext.dd.ScrollManager'
    ],

    target : 'Ext.dd.DragDropManager',

    minVersion  : '6.0.0',

    applyFn     : function () {
        Ext.override(Ext.dd.DragDropManager, {
            handleMouseMove: function(e) {
                var me = this,
                    current = me.dragCurrent,
                    point = e.getXY(),
                    currentX = point[0],
                    currentY = point[1],
                    diffX, diffY;
                me.offsetX = currentX - me.startX;
                me.offsetY = currentY - me.startY;
                me.currentPoint.setPosition(point);
                if (!current) {
                    return true;
                }
                if (!me.dragThreshMet) {
                    diffX = Math.abs(me.offsetX);
                    diffY = Math.abs(me.offsetY);
                    if (diffX > me.clickPixelThresh || diffY > me.clickPixelThresh) {
                        e.claimGesture();
                        me.startDrag(me.startX, me.startY);
                    }
                }
                /* OVERRIDE TO TAKE INTO ACCOUNT THAT DRAG MIGHT HAVE BEEN ABORTED IN startDrag
                * Some Ext DD classes (Ext.panel.DD) overwrites startDrag which breaks setting the dragging property.
                */
                if (me.dragThreshMet && (!current.checkDraggingFlag || current.dragging)) {
                    current.b4Drag(e);
                    current.onDrag(e);

                    if (!current.moveOnly) {
                        me.fireEvents(e, false);
                    }
                }
                me.stopEvent(e);
                return true;
            },

            fireEvents  : function (e, isDrop) {
                var me = this,
                    isTouch = Ext.supports.Touch,
                    dragCurrent = me.dragCurrent,
                    mousePoint = me.currentPoint,
                    currentX = mousePoint.x,
                    currentY = mousePoint.y,
                    allTargets = [],
                    oldOvers = [],
                // cache the previous dragOver array
                    outEvts = [],
                    overEvts = [],
                    dropEvts = [],
                    enterEvts = [],
                    zoom = isTouch ? document.documentElement.clientWidth / window.innerWidth : 1,
                    dragEl, overTarget, overTargetEl, needsSort, i, len, sGroup, overDragEl;
                // If the user did the mouse up outside of the window, we could
                // get here even though we have ended the drag.
                if (!dragCurrent || dragCurrent.isLocked()) {
                    return;
                }
                // Touch's delegated event system means that the mousemove (which will be a touchmove really) target will be the element that the listener was requested for, NOT the actual lowest
                // level target . So we have to use elementFromPoint to find the target which we are currently over.

                // If we need to use the current mousemove target to find the over el,
                // but pointer-events is not supported, AND the delta position does not place the mouse outside of the dragEl,
                // temporarily move the dragEl away, and fake the mousemove target by using document.elementFromPoint
                // while it's out of the way.

                // The pointer events implementation is bugged in Opera, so fallback
                overDragEl = !(dragCurrent.deltaX < 0 || dragCurrent.deltaY < 0);

                if (isTouch || (!me.notifyOccluded && (!Ext.supports.CSSPointerEvents || Ext.isOpera) && overDragEl)) {
                    dragEl = dragCurrent.getDragEl();
                    // Temporarily hide the dragEl instead of moving it off the page.
                    // Moving the el off the page can cause problems when in an iframe with IE8 standards.
                    // See EXTJSIV-11728
                    if (overDragEl) {
                        dragEl.style.visibility = 'hidden';
                    }
                    // PATCH
                    // we need to take vertical scroll into account
                    var bodyScroll = Ext.getBody().getScroll();
                    e.target = document.elementFromPoint(e.clientX - bodyScroll.left / zoom, e.clientY - bodyScroll.top / zoom);
                    if (overDragEl) {
                        dragEl.style.visibility = 'visible';
                    }
                    // END PATCH
                }
                // Check to see if the object(s) we were hovering over is no longer
                // being hovered over so we can fire the onDragOut event
                for (i in me.dragOvers) {
                    overTarget = me.dragOvers[i];
                    delete me.dragOvers[i];
                    // Check to make sure that the component hasn't been destroyed in the middle of a drag operation.
                    if (!me.isTypeOfDD(overTarget) || overTarget.destroyed) {

                        continue;
                    }
                    // If notifyOccluded set, we use mouse position
                    if (me.notifyOccluded) {
                        if (!this.isOverTarget(mousePoint, overTarget, me.mode)) {
                            outEvts.push(overTarget);
                        }
                    } else // Otherwise we use event source of the mousemove event
                    {
                        if (!e.within(overTarget.getEl())) {
                            outEvts.push(overTarget);
                        }
                    }
                    oldOvers[i] = true;
                }
                // Collect all targets which are members of the same ddGoups that the dragCurrent is a member of, and which may recieve mouseover and drop notifications.
                // This is preparatory to seeing which one(s) we are currently over
                // Begin by iterating through the ddGroups of which the dragCurrent is a member
                for (sGroup in dragCurrent.groups) {
                    if ("string" !== typeof sGroup) {

                        continue;
                    }
                    // Loop over the registered members of each group, testing each as a potential target
                    for (i in me.ids[sGroup]) {
                        overTarget = me.ids[sGroup][i];
                        // The target is valid if it is a DD type
                        // And it's got a DOM element
                        // And it's configured to be a drop target
                        // And it's not locked
                        // And the DOM element is fully visible with no hidden ancestors
                        // And it's either not the dragCurrent, or, if it is, tha dragCurrent is configured to not ignore itself.
                        if (me.isTypeOfDD(overTarget) && (overTargetEl = overTarget.getEl()) && (overTarget.isTarget) && (!overTarget.isLocked()) && (Ext.fly(overTargetEl).isVisible(true)) && ((overTarget !== dragCurrent) || (dragCurrent.ignoreSelf === false))) {
                            // If notifyOccluded set, we use mouse position
                            if (me.notifyOccluded) {
                                // Only sort by zIndex if there were some which had a floating zIndex value
                                if ((overTarget.zIndex = me.getZIndex(overTargetEl)) !== -1) {
                                    needsSort = true;
                                }
                                allTargets.push(overTarget);
                            } else // Otherwise we use event source of the mousemove event
                            {
                                if (e.within(overTarget.getEl())) {
                                    allTargets.push(overTarget);
                                    break;
                                }
                            }
                        }
                    }
                }
                // If there were floating targets, sort the highest zIndex to the top
                if (needsSort) {
                    Ext.Array.sort(allTargets, me.byZIndex);
                }
                // Loop through possible targets, notifying the one(s) we are over.
                // Usually we only deliver events to the topmost.
                for (i = 0 , len = allTargets.length; i < len; i++) {
                    overTarget = allTargets[i];
                    // If we are over the overTarget, queue it up to recieve an event of whatever type we are handling
                    if (me.isOverTarget(mousePoint, overTarget, me.mode)) {
                        // look for drop interactions
                        if (isDrop) {
                            dropEvts.push(overTarget);
                        } else // look for drag enter and drag over interactions
                        {
                            // initial drag over: dragEnter fires
                            if (!oldOvers[overTarget.id]) {
                                enterEvts.push(overTarget);
                            } else // subsequent drag overs: dragOver fires
                            {
                                overEvts.push(overTarget);
                            }
                            me.dragOvers[overTarget.id] = overTarget;
                        }
                        // Unless this DragDropManager has been explicitly configured to deliver events to multiple targets, then we are done.
                        if (!me.notifyOccluded) {
                            break;
                        }
                    }
                }
                if (me.mode) {
                    if (outEvts.length) {
                        dragCurrent.b4DragOut(e, outEvts);
                        dragCurrent.onDragOut(e, outEvts);
                    }
                    if (enterEvts.length) {
                        dragCurrent.onDragEnter(e, enterEvts);
                    }
                    if (overEvts.length) {
                        dragCurrent.b4DragOver(e, overEvts);
                        dragCurrent.onDragOver(e, overEvts);
                    }
                    if (dropEvts.length) {
                        dragCurrent.b4DragDrop(e, dropEvts);
                        dragCurrent.onDragDrop(e, dropEvts);
                    }
                } else {
                    // fire dragout events
                    for (i = 0 , len = outEvts.length; i < len; ++i) {
                        dragCurrent.b4DragOut(e, outEvts[i].id);
                        dragCurrent.onDragOut(e, outEvts[i].id);
                    }
                    // fire enter events
                    for (i = 0 , len = enterEvts.length; i < len; ++i) {
                        // dc.b4DragEnter(e, oDD.id);
                        //                          To support several drop groups on the same DOM element
                        //                                             vvvvvvv
                        dragCurrent.onDragEnter(e, enterEvts[i].id, enterEvts[i]);
                    }
                    // fire over events
                    for (i = 0 , len = overEvts.length; i < len; ++i) {
                        dragCurrent.b4DragOver(e, overEvts[i].id);
                        dragCurrent.onDragOver(e, overEvts[i].id);
                    }
                    // fire drop events
                    for (i = 0 , len = dropEvts.length; i < len; ++i) {
                        dragCurrent.b4DragDrop(e, dropEvts[i].id);
                        dragCurrent.onDragDrop(e, dropEvts[i].id);
                    }
                }
                // notify about a drop that did not find a target
                if (isDrop && !dropEvts.length) {
                    dragCurrent.onInvalidDrop(e);
                }
            }
        });

        // This code is required to support several drop groups on the same DOM element
        // -------------------------------------------------------------------------------------
        Ext.override(Ext.dd.DragSource, {
            onDragEnter: function(e, id, forceTarget) {
                this.forceCachedTarget = forceTarget;
                return this.callParent([e, id]);
            },
            beforeDragEnter : function(target, e, id) {
                if (this.forceCachedTarget) {
                    target = this.cachedTarget = this.forceCachedTarget;
                    delete this.forceCachedTarget;
                }
                return this.callParent([target, e, id]);
            }
        });
        // -------------------------------------------------------------------------------------

        // We just overrode fireEvents method that is used in createSequence in scroll manager
        // so sequence was dropped and we need to create new. Check constructor in Ext.dd.ScrollManager
        var sm = Ext.dd.ScrollManager;
        var ddm = Ext.dd.DragDropManager;

        ddm.fireEvents = Ext.Function.createSequence(ddm.fireEvents, sm.onFire, sm);
        ddm.stopDrag = Ext.Function.createSequence(ddm.stopDrag, sm.onStop, sm);
    }
});
