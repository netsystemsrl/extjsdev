Ext.define('Kanban.dd.DropZone', {
    extend : 'Ext.dd.DropZone',

    mixins : {
        observable : 'Ext.util.Observable'
    },

    constructor : function (config) {
        this.callParent(arguments);

        this.mixins.observable.constructor.call(this, config);
    },

    panel    : null,
    dragData : null,

    getTargetFromEvent : function (e) {
        return e.getTarget();
    },

    validatorFn          : Ext.emptyFn,
    validatorFnScope     : null,

    // list of available zoom levels
    zoomLevels           : ['large', 'medium', 'small', 'mini'],

    // returns true if we should insert placeholder before node
    shouldDropBeforeNode : function (xy, taskUnderCursor, dd) {
        var taskBox = Ext.fly(taskUnderCursor).getBox();
        var proxyXY = dd.proxy.getXY();
        var middle;

        if (this.dropMode === 'vertical') {
            middle = (taskBox.bottom - taskBox.top) / 2;

            if (this.direction.up) {
                return proxyXY[1] - taskBox.top < middle;
            } else {
                var taskHeight = Ext.fly(dd.dragData.placeholder.children[0]).getHeight();
                return proxyXY[1] + taskHeight - taskBox.top < middle;
            }
        } else {
            middle = (taskBox.right - taskBox.left) / 2;

            // in case we drag task over column with smaller tasks
            // we cannot rely on drag proxy size and should use cursor coordinates

            // more robust check, taking only zoom level into attention
            if (Ext.Array.indexOf(this.zoomLevels, dd.dragData.currentZoomLevel) > Ext.Array.indexOf(this.zoomLevels, dd.dragData.sourceZoomLevel)) {
                if (xy[1] < taskBox.top) {
                    return true;
                } else if (xy[1] > taskBox.bottom) {
                    return false;
                }

                return xy[0] - taskBox.left < (taskBox.right - taskBox.left) / 2;
            } else {
                // if we moved mouse out of the row limited by taskbox.top and taskbox.bottom
                // it's enough to look at vertical position to find out drop position
                if (xy[1] < taskBox.top) {
                    return true;
                } else if (xy[1] > taskBox.bottom) {
                    return false;
                }

                if (this.direction.left) {
                    return (proxyXY[0] - taskBox.left < middle);
                } else {
                    var taskWidth = Ext.fly(dd.dragData.placeholder.children[0]).getWidth();
                    return (proxyXY[0] + taskWidth - taskBox.left < middle);
                }
            }
        }
    },

    getDropMode : function (view) {
        // we need to define drop behaviour (where placeholder should appear)
        var tempNode = Ext.DomQuery.select(view.getItemSelector() + ':not(.sch-hidden)', view.el.dom)[0];

        // if panel doesn't have any elements rendered mode doesn't matter
        if (!tempNode) return 'vertical';

        // if rendered node takes less than half available width we can assume they form rows
        if (Ext.fly(tempNode).getWidth() * 2 < view.getWidth()) return 'horizontal';

        return 'vertical';
    },

    updatePlaceholderElements : function (taskEl, dragData) {
        var copy;

        // create wrap element
        var ctEl = Ext.core.DomHelper.createDom({
            tag : 'div',
            cls : 'sch-dd-wrap-holder'
        });

        // for each task record being dragged create proper placeholder
        for (var i = 0, l = dragData.taskRecords.length; i < l; i++) {
            copy = taskEl.cloneNode(true);

            copy.innerHTML = '';
            // boundView is required for some extjs stuff 4
            copy.boundView = taskEl.boundView;

            copy.id = Ext.id();

            var fly = Ext.fly(copy);
            fly.removeCls('sch-task-selected');
            fly.addCls('sch-task-placeholder');

            ctEl.appendChild(copy);

            // Adjust each element offset to the source event element
            Ext.fly(copy).setStyle({
                width  : taskEl.offsetWidth + 'px',
                height : taskEl.offsetHeight + 'px'
            });
        }

        return ctEl;
    },

    getSmallestTask : function (view) {
        var nodes = Ext.DomQuery.select(view.getItemSelector() + ':not(.sch-hidden)', view.el.dom);
        var smallestTask = nodes[0];

        for (var i = 0; i < nodes.length; i++) {
            smallestTask = smallestTask.offsetHeight > nodes[i].offsetHeight ? nodes[i] : smallestTask;
        }

        return smallestTask;
    },


    getNodeByCoordinate : function (xy, bodyScroll) {
        return document.elementFromPoint(xy[0] - bodyScroll.left, xy[1] - bodyScroll.top);
    },


    getTargetView : function (xy, e, data) {
        var node = this.getNodeByCoordinate(xy, data.bodyScroll);

        if (node) {
            if (!node.className.match('sch-taskview')) {
                var parent = Ext.fly(node).up('.sch-taskview');

                if (parent) {
                    node = parent.dom;
                } else {
                    node = null;
                }
            }

            if (node) {
                return Ext.getCmp(node.id);
            }
        }

        return null;
    },


    // While over a target node, return the default drop allowed class which
    // places a "tick" icon into the drag proxy.
    onNodeOver : function (target, dd, e, data) {
        var xy = e.getXY();

        this.direction = {
            left : false,
            up   : false
        };

        var prevXY = this.prevXY;

        if (prevXY) {
            if (prevXY[0] > xy[0]) {
                this.direction.left = true;
            } else {

            }
            if (prevXY[1] > xy[1]) {
                this.direction.up = true;
            }
        }

        this.prevXY = xy;

        var proxyDom = dd.proxy.el.dom;
        var allowed  = false;

        proxyDom.style.display = 'none';

        // resolve target view from mouse coordinate
        var view = this.getTargetView(xy, e, data);

        proxyDom.style.display = 'block';

        if (!view) {
            return this.dropNotAllowed;
        }

        if (view) {
            allowed = data.taskRecords[0].isValidTransition(view.state);

            if (allowed) {
                // update placeholder to match other tasks in view
                // Template for placeholder. If there is no visible task, then no need to update placeholder
                if (view != data.view) {
                    var tplEl = this.getSmallestTask(view);
                    if (tplEl) {
                        Ext.fly(data.placeholder).remove();
                        data.placeholder = this.updatePlaceholderElements(tplEl, data);
                    }
                }

                if (view != data.view || !this.dropMode) {
                    this.dropMode = this.getDropMode(view);
                    data.currentZoomLevel = view.up('panel').zoomLevel;
                }

                data.view = view;

                var placeholder = Ext.get(data.placeholder);

                // http://www.sencha.com/forum/showthread.php?294565
                // return this line when bug is fixed
//                var nodes = view.getNodes(),
                var nodes = view.all.elements.slice(),
                    start = 0,
                    end   = nodes.length - 1,
                    lastNode,
                    index,
                    dropBefore;

                // if we drop into column without any tasks we should skip this mess
                if (nodes.length) {
                    // using bisection we locate 2 tasks next to each other
                    while (end - start > 1) {
                        index = Math.floor((start + end) / 2);
                        lastNode = nodes[index];
                        if (Ext.fly(lastNode).isVisible()) {
                            dropBefore = this.shouldDropBeforeNode(xy, lastNode, dd);

                            if (dropBefore) {
                                end = index;
                            } else {
                                start = index;
                            }
                        } else {
                            nodes.splice(index, 1);
                            end = end - 1;
                        }
                    }

                    // if task is going to be dropped before first node - search is done
                    var firstNode = nodes[start],
                        dropBeforeFirst = this.shouldDropBeforeNode(xy, firstNode, dd);

                    if (dropBeforeFirst) {
                        lastNode = firstNode;
                        dropBefore = true;
                    } else if (Ext.fly(nodes[end]).isVisible()) {
                        // if we should drop after first node let's check if element is visible (can be hidden)
                        // and that can lead to wierd results
                        lastNode = nodes[end];
                        dropBefore = this.shouldDropBeforeNode(xy, lastNode, dd);
                    } else {
                        // both checks failed - we should drop element between nodes
                        lastNode = firstNode;
                        dropBefore = false;
                    }
                }

                if (lastNode) {
                    if (dropBefore) {
                        placeholder.insertBefore(lastNode);
                        data.dropOptions = {
                            task : view.getRecord(lastNode),
                            type : 'before'
                        };
                    } else {
                        placeholder.insertAfter(lastNode);
                        data.dropOptions = {
                            task : view.getRecord(lastNode),
                            type : 'after'
                        };
                    }
                } else {
                    view.el.appendChild(placeholder);
                    data.dropOptions = null;
                }
            }
        }

        return allowed ? this.dropAllowed : this.dropNotAllowed;
    },

    notifyDrop : function (dd, e, dragData) {
        var xy = e.getXY();

        dd.proxy.el.dom.style.display = 'none';

        // resolve target view from mouse coordinate
        var view = this.getTargetView(xy, e, dragData);

        dd.proxy.el.dom.style.display = 'block';

        var me         = this,
            newState   = view && view.state,
            doFinalize = true,
            valid      = newState !== false && newState !== null;

        // update dragData with new state, view etc.
        dragData.newState = newState;
        dragData.view     = view;
        dragData.proxy    = dd.proxy;

        dragData.finalize = function () {
            me.finalize.apply(me, arguments);
        };

        valid = valid && me.validatorFn.call(me.validatorFnScope || this, dragData.taskRecords, newState) !== false;

        this.dragData = dragData;

        // Allow implementor to take control of the flow, by returning false from this listener,
        // to show a confirmation popup etc.
        doFinalize = me.fireEvent('beforetaskdropfinalize', me, dragData, e) !== false;

        if (doFinalize) {
            return me.finalize(valid);
        }

        return true;
    },

    finalize : function (updateRecords) {

        var dragData      = this.dragData,
            proxy         = dragData.proxy,
            recordsToMove = [];

        Ext.fly(this.getEl()).select('.sch-dd-wrap-holder').remove();

        Ext.Array.forEach(dragData.taskEls, function (taskEl) {
            taskEl.removeCls('sch-hidden');
        });

        if (updateRecords) {
            var records       = dragData.taskRecords,
                positionField = records[0].positionField,
                newState      = dragData.newState,
                opt           = dragData.dropOptions,
                targetStore   = dragData.view.getStore(),
                masterStore   = targetStore.masterStore;

            masterStore.suspendAutoSync();

            // this will remove records from source store and append to target store
            Ext.Array.each(records, function (record) {
                if (record.isValidTransition(newState)) {
                    record.setState(newState);
                    recordsToMove.push(record);
                }
            });

            // perform this if drop is valid
            if (recordsToMove.length > 0) {
                // remove records from view store and add them again to required position
                targetStore.remove(recordsToMove);

                var dropIndex = opt ? (targetStore.indexOf(opt.task) + (opt.type == 'before' ? 0 : 1)) :
                    targetStore.getCount();

                targetStore.insert(dropIndex, recordsToMove);

                // We now set the Position field for all tasks in this store to assure order is kept intact
                // after save
                for (var j = 0; j < targetStore.getCount(); j++) {
                    targetStore.getAt(j).set(positionField, j, { silent : true });
                }

                targetStore.sort();
            }

            masterStore.resumeAutoSync(masterStore.autoSync);
        }

        // Drag was invalid
        if (recordsToMove.length === 0) {
            proxy.el.dom.style.display = 'block';
            proxy.el.animate({
                duration      : 500,
                easing        : 'ease-out',
                to            : {
                    x : dragData.repairXY[0],
                    y : dragData.repairXY[1]
                },
                stopAnimation : true
            });
        } else {
            // Signal that the drop was (at least partially) successful
            this.fireEvent('taskdrop', this, dragData.taskRecords);
        }

        delete this.dropMode;

        this.fireEvent('aftertaskdrop', this, dragData.taskRecords);

        if (dragData.placeholder) {
            Ext.fly(dragData.placeholder).remove();
        }

        return recordsToMove.length > 0;
    }
});
