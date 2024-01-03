Ext.define('Kanban.dd.DragZone', {
    extend : 'Ext.dd.DragZone',

    mixins : {
        observable : 'Ext.util.Observable'
    },

    requires : [

        // a missing require of Ext.dd.DragDrop:
        // http://www.sencha.com/forum/showthread.php?276603-4.2.1-Ext.dd.DragDrop-missing-Ext.util.Point-in-dependency-quot-requires-quot
        'Ext.util.Point'
    ],

    panel                : null,
    repairHighlight      : false,
    repairHighlightColor : 'transparent',
    containerScroll      : false,

    // @OVERRIDE
    autoOffset           : function (x, y) {
        this.setDelta(this.dragData.offsets[0], this.dragData.offsets[1]);
    },

    setVisibilityForSourceEvents : function (show) {
        Ext.each(this.dragData.taskEls, function (el) {
            el[ show ? 'removeCls' : 'addCls' ]('sch-hidden');
        });
    },

    constructor : function (config) {
        this.mixins.observable.constructor.call(this, config);

        this.callParent(arguments);

        this.proxy.el.child('.x-dd-drag-ghost').removeCls('x-dd-drag-ghost');

        this.proxy.addCls('sch-task-dd');
    },

    getPlaceholderElements : function (sourceEl, dragData) {
        var taskEls = dragData.taskEls;
        var copy;
        var offsetX = dragData.offsets[ 0 ];
        var offsetY = dragData.offsets[ 1 ];
        var sourceHeight = sourceEl.getHeight();

        var ctEl = Ext.core.DomHelper.createDom({
            tag : 'div',
            cls : 'sch-dd-wrap-holder'
        });

        Ext.Array.each(taskEls, function (el, i) {
            copy = el.dom.cloneNode(true);
            copy.innerHTML = '';

            copy.id = Ext.id();
            copy.boundView = el.dom.boundView;

            var fly = Ext.fly(copy);
            fly.removeCls('sch-task-selected');
            fly.addCls('sch-task-placeholder');

            ctEl.appendChild(copy);

            // Adjust each element offset to the source event element
            Ext.fly(copy).setStyle({
                width  : el.getWidth() + 'px',
                height : el.getHeight() + 'px'
            });
        });
        return ctEl;
    },

    getDragData : function (e) {
        var panel = this.panel,
            t = e.getTarget(panel.taskSelector);

        if (!t || panel.isReadOnly()) return;

        var task = panel.resolveRecordByNode(t);

        if (!task || task.isDraggable() === false || this.fireEvent('beforetaskdrag', this, task, e) === false) {
            return null;
        }

        e.preventDefault();

        var xy = e.getXY(),
            taskEl = Ext.get(t),
            taskXY = taskEl.getXY(),
            offsets = [ xy[0] - taskXY[0], xy[1] - taskXY[1] ],
            view = Ext.getCmp(taskEl.up('.sch-taskview').id),
            eventRegion = taskEl.getRegion();

        if (!view.isSelected(t) && !e.ctrlKey) {
            // Fire this so the task board can clear the selection models of other views if needed
            this.fireEvent('taskdragstarting', this, task, e);
        }

        // relatedRecords now hold all dragging tasks
        var relatedRecords = this.getDraggingRecords(task),
            taskEls = [];

        // Collect additional elements to drag
        Ext.Array.forEach(relatedRecords, function (r) {
            var el = panel.getElementForTask(r);

            if (el) taskEls.push(el);
        });


        var dragData = {
            view        : view,
            sourceZoomLevel : view.up('panel').zoomLevel,
            offsets     : offsets,
            repairXY    : [e.getX() - offsets[0], e.getY() - offsets[1]],
            taskEls     : taskEls,
            bodyScroll  : Ext.getBody().getScroll(),
            taskRecords : relatedRecords
        };

        // index of current task in view store
        var store = view.getStore();
        var dropBeforeTask = store.getAt(store.indexOf(task) + 1);

        if (dropBeforeTask) {
            dragData.dropOptions = {
                task    : dropBeforeTask,
                type    : 'before'
            };
        }

        dragData.ddel = this.getDragElement(taskEl, dragData);
        dragData.placeholder = this.getPlaceholderElements(taskEl, dragData);

        // To keep the look and size of the elements in the drag proxy
        this.proxy.el.set({
            size : this.panel.getZoomLevel()
        });

        return dragData;
    },

    onStartDrag : function (x, y) {
        var dd = this.dragData;

        // insert placeholder immediately
        Ext.fly(dd.placeholder).insertBefore(dd.taskEls[0]);

        Ext.Array.forEach(dd.taskEls, function (taskEl) {
            // we have to set this value because by default it will make component invisible,
            // but other components will not take it's place
            taskEl.addCls('sch-hidden');
        });

        this.fireEvent('taskdragstart', this, dd.taskRecords);
    },

    getDraggingRecords  : function (sourceEventRecord) {
        // we want to sort records by their position in view
        // in order to forbid selection order to affect position
        var records = this.getRelatedRecords(sourceEventRecord);

        // we can select few records from one column and then start drag task from another column
        // if records are from same column, then we can just sort then by position
        var store = sourceEventRecord.store;
        if (records[0] && records[0].getState() == sourceEventRecord.getState()) {
            records = Ext.Array.sort([sourceEventRecord].concat(records), this.positionSorter);
        } else {
            records = [sourceEventRecord].concat(Ext.Array.sort(records, this.positionSorter));

        }
        return records;
    },

    positionSorter : function (a, b) {
        var store = a.store;

        return store.indexOf(a) > store.indexOf(b) ? 1 : -1;
    },

    /**
     * Returns all selected draggable records except the original one to drag them together with the original event.
     * Provide your custom implementation of this to allow additional event records to be dragged together with the original one.
     * @protected
     * @template
     * @param {Kanban.model.Event} eventRecord The eventRecord about to be dragged
     * @return {Kanban.model.Event[]} An array of event records to drag together with the original event
     */
    getRelatedRecords : function (eventRecord) {
        var panel = this.panel;
        var selected = panel.getSelectedRecords();
        var result = [];

        Ext.each(selected, function (rec) {
            if (rec.getId() !== eventRecord.getId() && rec.isDraggable() !== false) {
                result.push(rec);
            }
        });

        return result;
    },

    /**
     * This function should return a DOM node representing the markup to be dragged. By default it just returns the selected element(s) that are to be dragged.
     * @param {Ext.Element} sourceEl The event element that is the source drag element
     * @param {Object} dragData The drag drop context object
     * @return {HTMLElement} The DOM node to drag
     */
    getDragElement : function (sourceEl, dragData) {
        var taskEls = dragData.taskEls;
        var copy;
        var offsetX = dragData.offsets[ 0 ];
        var offsetY = dragData.offsets[ 1 ];
        var sourceHeight = this.panel.getElementForTask(dragData.taskRecords[0]).getHeight();

        if (taskEls.length > 1) {
            var ctEl = Ext.core.DomHelper.createDom({
                tag   : 'div',
                cls   : 'sch-dd-wrap',
                style : { overflow : 'visible' }
            });

            Ext.Array.forEach(taskEls, function (el, i) {
                copy = el.dom.cloneNode(true);

                copy.id = '';

                copy.className += i === 0 ? ' sch-dd-source' : ' sch-dd-extra';

                var parent = el.up('[size]');
                var wrapper = Ext.core.DomHelper.createDom({
                    tag : 'div',
                    size    : parent.getAttribute('size')
                }).cloneNode(true); // without the extra cloneNode, IE fails (most likely due to a Sencha bug in DomHelper

                wrapper.appendChild(copy);
                ctEl.appendChild(wrapper);

                // Adjust each element offset to the source event element
                Ext.fly(copy).setStyle({
                    left     : (i > 0 ? 10 : 0) + 'px',
                    top      : (i === 0 ? 0 : (sourceHeight - 30 + i * 20)) + 'px',
                    width    : el.getWidth() + 'px',
                    height   : el.getHeight() + 'px',
                    position : "absolute"
                });
            });

            return ctEl;
        } else {
            copy = sourceEl.dom.cloneNode(true);

            copy.id = '';
            copy.style.width = sourceEl.getWidth() + 'px';
            copy.style.height = sourceEl.getHeight() + 'px';

            var parent = sourceEl.up('[size]');
            var wrapper = Ext.core.DomHelper.createDom({
                tag : 'div',
                size    : parent.getAttribute('size')
            }).cloneNode(true); // without the extra cloneNode, IE fails (most likely due to a Sencha bug in DomHelper


            wrapper.appendChild(copy);

            return wrapper;

        }
    },

    getRepairXY : function (e, data) {
        return data.repairXY;
    },

    afterRepair   : function () {
        this.dragging = false;
    },

    // HACK: Override for IE, if you drag the task bar outside the window or iframe it crashes (missing e.target)
    onInvalidDrop : function (target, e, id) {
        if (!e) {
            e      = target;
            target = e.getTarget() || document.body;
        }

        var retVal = this.callParent([ target, e, id ]);

        this.fireEvent('aftertaskdrop', this, this.dragData.taskRecords);

        if (this.dragData.placeholder) {
            Ext.fly(this.dragData.placeholder).remove();
        }

        this.setVisibilityForSourceEvents(true);

        return retVal;
    }
});
