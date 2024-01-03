/**

 @class Sch.plugin.CellPlugin
 @extends Ext.plugin.Abstract

 This plugin allow user to navigate through cells using arrow keys or simple clicking, creating/editing events
 and perform selection. Plugin is built on "1 cell - 1 event" logic and tested over that,
 using this plugin under different conditions may lead to unpredictable results.

 NOTES:
 1) supports only horizontal view
 2) Tested mainly for 'table' event layout, 'horizontal' works, but you may experience some glitches

 */
Ext.define('Sch.plugin.CellPlugin', {
    extend : 'Ext.AbstractPlugin',
    alias  : 'plugin.scheduler_cellplugin',

    requires : [
        'Ext.form.field.Base',
        'Sch.field.CellEditor',
        'Sch.util.Date',
        'Sch.eventlayout.Table'
    ],

    mixins : {
        observable : 'Ext.util.Observable'
    },

    /**
     * @cfg {String} frameCls CSS class of the plugin container div.
     */
    frameCls : 'sch-cellplugin-highlighter',

    editingCls : 'sch-cellplugin-highlighter-editing',

    activeCls : 'sch-cellplugin-active',

    /**
     * @cfg {Ext.Template/Ext.XTemplate} frameTemplate A template providing markup for plugin.
     */
    frameTemplate : new Ext.Template([
        '<div class="{cls}" style="width: {width}px; height: {height}px;">',
        '<div class="sch-cellplugin-border sch-cellplugin-border-horizontal sch-cellplugin-border-top"></div>',
        '<div class="sch-cellplugin-border sch-cellplugin-border-horizontal sch-cellplugin-border-bottom"></div>',
        '<div class="sch-cellplugin-border sch-cellplugin-border-vertical sch-cellplugin-border-left"></div>',
        '<div class="sch-cellplugin-border sch-cellplugin-border-vertical sch-cellplugin-border-right"></div>',
        '</div>'
    ]),

    /**
     * @cfg {String/Object/Ext.form.field.Field} editor Configuration for the {@link Sch.field.CellEditor}.
     *
     * Examples:
     *
     *      @example
     *      // Simple string config:
     *      var plugin1 = new Sch.plugin.CellPlugin({
     *          editor  : 'Ext.form.field.Text'
     *      });
     *
     *      // {@link Sch.field.CellEditor} config
     *      var plugin2 = new Sch.plugin.CellPlugin({
     *          editor  : {
     *              dateFormat  : 'H:i',
     *              divider     : ' '
     *          }
     *      });
     *
     *      // Custom field
     *      Ext.define('MyEditor', {
     *          extend  : 'Ext.form.field.Trigger'
     *      });
     *
     *      var plugin3 = new Sch.plugin.CellPlugin({
     *          editor  : new MyEditor()
     *      });
     *
     */
    editor : 'Sch.field.CellEditor',

    /**
     * @cfg {Boolean} singleClickEditing If true editing mode will be set on plugin on a single click in the cell.
     */
    singleClickEditing : true,

    /**
     * @cfg {Number} dblClickTimeout Timeout required to catch cell double click event if {@link #singleClickEditing} is true
     */
    dblClickTimeout : 100,

    editing : false,

    /**
     * @property {Object} context Object containing information about current selection. Isn't used for navigation purposes.
     * @property {Date} context.startDate Start date of selected tick
     * @property {Date} context.endDate End date of selected tick
     * @property {Sch.model.Resource} context.resource Selected resource
     * @private
     */
    context : {},

    position : {},

    /**
     * @property {Object[]} selContext Array of {@link #context} objects for multiple selection. Doesn't contain
     * currently selected cell.
     * @private
     */
    selContext : [],

    /**
     * @event cellclick
     * Fires when cell click performed and not intercepted by double click. Return false to prevent handling.
     * @param {Sch.plugin.CellPlugin} this Plugin instance
     * @param {Number} tickIndex Current tick
     * @param {Number} resourceIndex Current resource
     */

    /**
     * @event celldblclick
     * Fires when cell double click performed. Return false to prevent handling.
     * @param {Sch.plugin.CellPlugin} this Plugin instance
     * @param {Number} tickIndex Current tick
     * @param {Number} resourceIndex Current resource
     */

    /**
     * @event beforeselect
     * @preventable
     * Fires before cell is selected. Return false to prevent selection.
     *
     * @param {Sch.view.TimelineGridView} view Scheduling view
     * @param {Sch.model.Resource} resource Currently selected resource
     * @param {Date} startDate Current tick start date
     * @param {Date} endDate Current tick end date
     */

    /**
     * @event select
     * Fires after cell is selected.
     *
     * @param {Sch.view.TimelineGridView} view Scheduling view
     * @param {Sch.model.Resource} resource Currently selected resource
     * @param {Date} startDate Current tick start date
     * @param {Date} endDate Current tick end date
     */

    /**
     * @event selectionchange
     * Fires after {@link #select} event.
     *
     * @param {Sch.plugin.CellPlugin} this Plugin instance
     * @param {Object[]} selection Current selection
     * @param {Sch.model.Resource} selection.resource Currently selected resource
     * @param {Date} selection.startDate Current tick start date
     * @param {Date} selection.endDate Current tick end date
     */

    /**
     * @event beforecelledit
     * @preventable
     * Fires before cell enters editing mode. Return false to prevent editing.
     *
     * @param {Sch.plugin.CellPlugin} this Plugin instance
     * @param {Object[]} selection Current selection
     * @param {Sch.model.Resource} selection.resource Currently selected resource
     * @param {Date} selection.startDate Current tick start date
     * @param {Date} selection.endDate Current tick end date
     */

    /**
     * @event begincelledit
     * Fires after {@link #select} event.
     *
     * @param {Sch.plugin.CellPlugin} this Plugin instance
     * @param {Object[]} selection Current selection
     * @param {Sch.model.Resource} selection.resource Currently selected resource
     * @param {Date} selection.startDate Current tick start date
     * @param {Date} selection.endDate Current tick end date
     */

    /**
     * @event beforecompletecelledit
     * @preventable
     * Fires before cell enters editing mode. Return false to continue editing cell.
     *
     * @param {Sch.plugin.CellPlugin} this Plugin instance
     * @param {String} value Editor value
     * @param {Object[]} selection Current selection
     * @param {Sch.model.Resource} selection.resource Currently selected resource
     * @param {Date} selection.startDate Current tick start date
     * @param {Date} selection.endDate Current tick end date
     */

    /**
     * @event completecelledit
     * Fires before cell enters editing mode. Return false to continue editing cell.
     *
     * @param {Sch.plugin.CellPlugin} this Plugin instance
     * @param {String} value Editor value
     * @param {Object[]} selection Current selection
     * @param {Sch.model.Resource} selection.resource Currently selected resource
     * @param {Date} selection.startDate Current tick start date
     * @param {Date} selection.endDate Current tick end date
     */

    /**
     * @event beforecancelcelledit
     * @preventable
     * Fires before cell editing is cancelled. Return false to continue editing cell.
     *
     * @param {Sch.plugin.CellPlugin} this Plugin instance
     * @param {String} value Editor value
     * @param {Object[]} selection Current selection
     * @param {Sch.model.Resource} selection.resource Currently selected resource
     * @param {Date} selection.startDate Current tick start date
     * @param {Date} selection.endDate Current tick end date
     */

    /**
     * @event cancelcelledit
     * Fires after cell editing is cancelled.
     *
     * @param {Sch.plugin.CellPlugin} this Plugin instance
     * @param {String} value Editor value
     * @param {Object[]} selection Current selection
     * @param {Sch.model.Resource} selection.resource Currently selected resource
     * @param {Date} selection.startDate Current tick start date
     * @param {Date} selection.endDate Current tick end date
     */

    lockedView        : null,
    schedulingView    : null,
    timeAxisViewModel : null,
    keyNav            : null,

    constructor : function (cfg) {
        this.mixins.observable.constructor.call(this);

        this.callParent(arguments);

        this.context = {};
        this.position = {};
    },

    init : function (scheduler) {
        var me = this;

        me.schedulingView = scheduler.getSchedulingView();
        me.lockedView     = scheduler.lockedGrid.getView();

        // HACK still valid for 6.5.3
        // Disable default grid key navigation to handle multiple cell events
        // http://www.sencha.com/forum/showthread.php?296161
        // We don't need navigation model with cellplugin, they will conflict,
        // but key navigation couldn't be disabled using config.
        scheduler.getNavigationModel().disable();

        me.timeAxisViewModel = scheduler.timeAxisViewModel;

        me.keyNav = new Ext.util.KeyNav({
            target            : me.lockedView,
            eventName         : 'itemkeydown',
            processEvent      : function (view, record, node, index, event) {
                event.stopEvent();
                return event;
            },
            ignoreInputFields : true,
            up                : me.onKeyUp,
            down              : me.onKeyDown,
            right             : me.onKeyRight,
            left              : me.onKeyLeft,
            tab               : me.onKeyTab,
            enter             : me.onKeyEnter,
            esc               : me.onKeyEsc,
            scope             : me
        });

        if (scheduler.bufferedRenderer) {
            me.schedulingView.on('afterrender', function () {
                me.schedulingView.getScrollable().on('scroll', me.onViewScroll, me);
            });

            me.schedulingView.on('itemadd', me.onItemAdd, me);
        }

        me.handleSingleClickTask = new Ext.util.DelayedTask(me.handleCellClick, me);

        scheduler.on({
            headerclick : me.onContainerClick,
            zoomchange  : me.destroyHighlighter,
            scope       : me
        });

        me.schedulingView.on({
            containerclick   : me.onContainerClick,
            scheduleclick    : me.onCellClick,
            scheduledblclick : me.onCellDblClick,
            eventclick       : me.onEventClick,
            eventdblclick    : me.onEventDblClick,
            // in case editor doesn't allow 'keydown' events we listem them on view
            containerkeydown : me.onEditorKeyDown,
            groupcollapse    : me.onGroupCollapse,
            groupexpand      : me.onGroupExpand,
            scope            : me
        });

        if (Ext.getVersion().isGreaterThan('6.2.0')) {
            me.schedulingView.on('refresh', me.moveContainerElToSecondaryCanvas, me);
            // We need to fix editor before onViewModelUpdate
            me.mon(me.timeAxisViewModel, 'update', me.moveContainerElToSecondaryCanvas, me);
        }

        me.mon(me.timeAxisViewModel, {
            update : me.onViewModelUpdate,
            scope  : me
        });

        me.mon(scheduler.getTimeAxis(), {
            beforereconfigure : me.onBeforeReconfigure,
            scope             : me
        });

        me.bindResourceStore(scheduler.getResourceStore());
        me.bindEventStore(scheduler.getEventStore());

        me.lockedView.on({
            cellclick         : me.onLockedCellClick,
            beforeitemkeydown : me.onBeforeItemKeyDown,
            scope             : me
        });

        scheduler.on('eventstorechange', function (sched, newStore, oldStore) {
            me.bindEventStore(oldStore, true);
            me.bindEventStore(newStore);
        });

        scheduler.on('resourcestorechange', function (sched, newStore, oldStore) {
            me.bindResourceStore(oldStore, true);
            me.bindResourceStore(newStore);
        });
    },

    moveContainerElToSecondaryCanvas : function () {
        if (this.containerEl) {
            this.schedulingView.getSecondaryCanvasEl().appendChild(this.containerEl);
        }
    },

    getNbrOfTicks : function () {
        return this.schedulingView.timeAxis.getCount();
    },

    onEditorKeyDown : function (view, e) {
        // If position doesn't have tick index, we should not try to do anything
        if (!this.getPosition().hasOwnProperty('tickIndex')) {
            return;
        }

        switch (e.getKey()) {
            case e.TAB    :
                e.stopEvent();

                if (e.shiftKey) {
                    this.editPrevious(e);
                } else {
                    this.editNext(e);
                }
                break;
            case e.ENTER  :
                this.onEditorKeyEnter();
                break;
            case e.ESC    :
                this.cancelEdit(e);
                break;
            default :
                break;
        }
    },

    onEditorKeyEnter : function () {
        if (this.completeEdit()) {
            this.beginEditBelow();
        } else {
            this.showEditorInCell(this.getEventOrCell(this.getPosition(), true));
        }
    },

    destroy : function () {
        this.keyNav.destroy();

        this.editor && this.editor.destroy && this.editor.destroy();
        this.destroyHighlighter();

        this.callParent(arguments);
    },

    destroyHighlighter : function () {
        var me = this;

        me.clearSelection();

        if (me.editor && me.editor.el && !me.schedulingView.destroyed) {
            // move editor to secondary canvas so it won't be deleted
            me.schedulingView.getSecondaryCanvasEl().appendChild(me.editor.el);
            me.editor.hide();
        }

        if (me.containerEl) {
            me.containerEl.destroy();
            delete me.containerEl;
        }
        me.context = {};
        me.position = {};
    },

    onGroupCollapse : function () {
        var me = this;

        if (me.getResourceIndex() === -1) {
            me.destroyHighlighter();
        } else {
            me.refreshCell();
        }
    },

    onGroupExpand : function () {
        this.refreshCell();
    },

    onViewScroll : function () {
        var me = this;

        if (me.containerEl) {
            var node = me.schedulingView.getNodeByRecord(me.getPosition().resource);
            if (node) {
                me.containerEl.setY(Ext.fly(node).getY() - 1);
            }
        }
    },

    onItemAdd : function () {
        var me = this,
            resource = me.getPosition().resource;

        if (resource) {
            var node = me.schedulingView.getNodeByRecord(resource);

            // record is rendered to view
            if (node) {
                me.containerEl.show();
            } else {
                me.containerEl.hide();
            }
        }
    },

    getResourceIndex : function (resource) {
        var me   = this;
        resource = resource || me.getPosition().resource;

        // dataSource.indexOf will return index of this record in main store
        // we need index of this record in dataSource store, so we add 'data' property
        return me.schedulingView.indexOf(resource);
    },

    getResource : function (resourceIndex) {
        return this.schedulingView.dataSource.getAt(resourceIndex);
    },

    onResourceAdd : function (store, records) {
        this.refreshCell();
    },

    onResourceRemove : function (store, records) {
        var me = this;

        // TODO: also check if selection should be partially removed
        // if all rows are removed we should also remove box
        // or if currently selected row is removed
        if (store.getCount() === 0 || Ext.Array.indexOf(records, me.getPosition().resource) !== -1) {
            me.destroyHighlighter();
        } else {
            me.refreshCell();
        }
    },

    onBeforeReconfigure : function (timeAxis) {
        var position = this.getPosition();
        // save editor position only if it wasn't saved before
        if (!this.startDate && Ext.isNumber(position.tickIndex)) {
            this.startDate = timeAxis.getAt(position.tickIndex).getStartDate();
        }
    },

    onLockedCellClick : function (lockedView, td, cellIndex, record, tr, rowIndex, e) {
        this.showEditorInCell({
            tickIndex        : this.getPosition().tickIndex || 0,
            resourceIndex    : rowIndex
        }, e);
    },

    // this method is responsible for type-away behavior
    onBeforeItemKeyDown : function (lockedView, record, item, index, e) {
        if (!e.isSpecialKey()) {
            this.beginEdit();
        }
    },

    onViewModelUpdate : function (timeAxisViewModel) {
        var me       = this,
            timeAxis = timeAxisViewModel.timeAxis;

        // if selection was active before reconfigure we should try to show editor
        if (me.startDate) {
            var newTick = timeAxis.getTickFromDate(me.startDate);

            if (newTick >= 0) {
                // remove saved editor position
                delete me.startDate;

                me.position.tickIndex = newTick;

                if (!me.containerEl) {
                    me.renderElement();
                }
                me.refreshCell();
            } else {
                me.destroyHighlighter();
            }
        } else {
            me.refreshCell();
        }
    },

    refreshCell : function () {
        var me    = this;
        var width = me.timeAxisViewModel.getTickWidth();

        if (me.containerEl) {
            me.containerEl.setWidth(width);
            me.containerEl.setLeft(width);

            me.showEditorInCell({
                tickIndex     : me.getPosition().tickIndex,
                resourceIndex : me.getResourceIndex()
            });
        }

        if (me.editor instanceof Ext.form.field.Base) {
            me.editor.setMaxWidth(width);
        }
    },

    clearSelection : function () {
        var me = this;

        if (me.schedulingView.rendered) {
            me.schedulingView.getSecondaryCanvasEl().select('.' + me.frameCls + '.sch-cellplugin-clone').remove();
        }

        me.selContext = [];
    },

    addSelection : function () {
        var me = this;

        // Cloning container element using method `clone` (`me.containerEl.clone(true);`) leads to ID duplication issue
        var clone = me.frameTemplate.apply({
            cls    : [me.frameCls, 'sch-cellplugin-clone'].join(' '),
            width  : me.containerEl.getWidth(),
            height : me.containerEl.getHeight()
        });

        clone = Ext.get(Ext.dom.Helper.append(me.containerEl.parent(), clone));

        clone.setStyle('top', me.containerEl.getStyle('top'));
        clone.setStyle('left', me.containerEl.getStyle('left'));

        me.selContext.push(Ext.apply({}, me.context));
    },

    // Navigation model changed in ext6, now when we hide editor using DISPLAY or VISIBLE
    // it'll trigger focus handling in IE. Focus goes to editor's parent (secondary canvas)
    // and ext tries to resolve position to pass it to setActionableMode method.
    // Resolved position doesn't have required property - column (ext expect focus on cell, but it goes
    // to secondary canvas). Ext doesn't have additional check, for that, so it throws exception in IE.
    // caught in 098_cellplugin_buffered
    applyVisibilityMode : function (el) {
        el.setVisibilityMode(Ext.dom.Element.OFFSETS);
    },

    renderElement : function () {
        var me = this;

        var width  = me.timeAxisViewModel.getTickWidth();
        var height = me.timeAxisViewModel.getViewRowHeight();

        var el = me.frameTemplate.apply({
            cls    : [me.frameCls, me.activeCls].join(' '),
            width  : width,
            height : height
        });

        me.containerEl = Ext.get(Ext.DomHelper.append(me.schedulingView.getSecondaryCanvasEl(), el));
        me.applyVisibilityMode(me.containerEl);

        var defaultCfg = {
            height    : height,
            maxHeight : height,
            width     : width,
            maxWidth  : width,
            listeners : {
                render : function (editor) {
                    me.applyVisibilityMode(editor.el);
                }
            },
            renderTo  : me.containerEl
        };

        if (Ext.isObject(me.editor) && !(me.editor instanceof Ext.Base)) {
            me.editor = Ext.create(Ext.apply(defaultCfg, me.editor, {xclass : 'Sch.field.CellEditor'}));
        } else if (typeof me.editor === 'string') {
            me.editor = Ext.create(me.editor, defaultCfg);
        } else {
            // editor is instance of form.field.Base
            me.containerEl.appendChild(me.editor.el);
            me.applyVisibilityMode(me.editor.el);
        }

        // Ext 5 has broken style for text editor in webkit, this action will
        // stetch input element to field height
        me.editor.inputEl.setStyle({
            height    : (height - 3) + 'px',
            minHeight : (height - 3) + 'px'
        });
    },

    // for correct work we should always keep focus on elements in locked grid
    onContainerClick : function () {
        var me = this;

        if (me.lockedView.getSelectionModel().getSelection().length > 0) {
            // focus row from locked grid only if one is selected and we are not editing cell
            if (me.editor.isVisible && me.editor.isVisible()) {
                me.editor.focus();
            }
        }
    },

    onCellClick : function () {
        this.handleSingleClickTask.delay(this.dblClickTimeout, null, null, arguments);
    },

    handleCellClick : function (view, date, rowIndex, resource, e) {
        var me = this;

        var colIndex = Math.floor(me.schedulingView.timeAxis.getTickFromDate(date));

        if (me.fireEvent('cellclick', me, colIndex, rowIndex) !== false) {
            me.showEditorInCell({
                tickIndex     : colIndex,
                resourceIndex : rowIndex
            }, e);

            if (me.singleClickEditing) {
                me.beginEdit();
            }
        }
    },

    onCellDblClick : function (view, date, rowIndex, resource, e) {
        this.handleSingleClickTask.cancel();
        this.handleCellDblClick(view, date, rowIndex, resource, e);
    },

    handleCellDblClick : function (view, date, rowIndex, resource, e) {
        var me = this;

        var colIndex = Math.floor(me.schedulingView.timeAxis.getTickFromDate(date));

        if (me.fireEvent('celldblclick', me, colIndex, rowIndex) !== false) {
            me.showEditorInCell({
                tickIndex     : colIndex,
                resourceIndex : rowIndex
            }, e);
            me.beginEdit();
        }
    },

    onEventClick : function (view, eventRecord, e) {
        var me   = this;
        var date = me.schedulingView.getDateFromDomEvent(e);
        var col  = Math.floor(me.schedulingView.timeAxis.getTickFromDate(date));
        // in case of grouped view we can't lookup indices in main store
        var row  = me.getResourceIndex(eventRecord.getResource());

        me.showEditorInCell({
            tickIndex     : col,
            resourceIndex : row,
            eventRecord   : eventRecord
        }, e);
    },

    onEventDblClick : function (view, eventRecord, e) {
        var me   = this;
        var date = me.schedulingView.getDateFromDomEvent(e);
        var col  = Math.floor(me.schedulingView.timeAxis.getTickFromDate(date));
        // in case of grouped view we can't lookup indices in main store
        var row  = me.getResourceIndex(eventRecord.getResource());

        me.showEditorInCell({
            tickIndex     : col,
            resourceIndex : row,
            eventRecord   : eventRecord
        }, e);
        me.beginEdit();
    },

    // resource record is optional param
    showEditorInCell : function (position, e) {
        var me              = this;

        if (position.tickIndex === -1 || position.resourceIndex === -1) return;

        if (!position.isCellContext) {
            position = me.getEventOrCell(position);
        }

        var startDate       = position.startDate,
            endDate         = position.endDate,
            resourceIndex   = position.resourceIndex,
            resource        = position.resource,
            eventRecord     = position.eventRecord;

        // user clicked on locked cell or normal cell (only if event layout is not table)
        if (e && e.type === 'click' && !eventRecord) {
            position.eventRecord = eventRecord = me.getCellEvents(position).getAt(0);
        }

        if (me.fireEvent('beforeselect', me, resource, startDate, endDate, eventRecord) === false) {
            return;
        }

        me.onBeforeSelect(e);

        if (!me.containerEl) {
            me.renderElement();
        } else {
            if (e && e.ctrlKey) {
                me.addSelection();
            } else {
                me.clearSelection();
            }
        }

        me.setPosition(position);

        me.alignEditor();

        me.onAfterSelect(e);

        me.fireEvent('select', me, resource, startDate, endDate);
        // TODO: append check for actual selection change
        me.fireEvent('selectionchange', me, me.getSelection());
    },

    getContextFromPosition : function (position) {
        var context = {
            startDate : position.startDate,
            endDate   : position.endDate,
            resource  : position.resource
        };

        if (position.eventRecord) {
            context.eventRecord = position.eventRecord;
        }

        return context;
    },

    getPosition : function () {
        return Ext.apply({}, this.position);
    },

    setPosition : function (position) {
        var me = this;

        me.context = me.getContextFromPosition(position);

        Ext.apply(me.position, position);
    },

    // remove all data except tick index and resource index. useful when navigating sideways
    stripPosition : function (position) {
        return {
            tickIndex : position.tickIndex,
            resourceIndex : position.resourceIndex
        };
    },

    alignEditor : function () {
        var position    = this.getPosition(),
            eventRecord = position.eventRecord;

        if (eventRecord) {
            this.alignEditorWithRecord(eventRecord, position.resource);
        } else {
            this.alignEditorWithCell();
        }
    },

    alignEditorWithRecord : function (eventRecord, resourceRecord) {
        var me = this;

        // some enhancements to make box visible
        // TODO: use z-index or wrap box around event body
        var els = me.schedulingView.getElementsFromEventRecord(eventRecord, resourceRecord),
            box = els[0].getBox();
        box.y--;
        box.x--;
        me.alignEditorToBox(box);
    },

    alignEditorWithCell : function () {
        var me          = this,
            position    = me.getPosition();

        // In case of grouping, getNode will return row and group header. We only need row with cells
        var node = Ext.get(me.schedulingView.getRow(position.resource));
        node && me.alignEditorToBox({
            left   : me.timeAxisViewModel.getTickWidth() * position.tickIndex,
            // There is 1px top row border, make some adjustments
            y      : node.getTop() - 1,
            height : node.getHeight() + 1,
            width  : me.timeAxisViewModel.getTickWidth()
        });
    },

    alignEditorToBox : function (box) {
        var me = this;

        me.containerEl.setY(box.y);
        // 'x' key is passed when box is positioned using event element - absolute coordinates
        if ('x' in box) {
            me.containerEl.setX(box.x);
        } else {
            me.containerEl.setLeft(box.left);
        }

        me.containerEl.setWidth(box.width);
        me.containerEl.setHeight(box.height);
        me.containerEl.show();
    },

    getSelection : function () {
        return this.selContext.concat(this.context);
    },

    /**
     * @method getEventRecord
     * Accepts current context (selected cell) and should always return one event record.
     * @param {Object} [context]
     * @param {Sch.model.Resource} context.resource Selected resource
     * @param {Date} context.startDate Current cell start date
     * @param {Date} context.endDate Current cell end date
     * @return {Sch.model.Event}
     */
    getEventRecord : function (context) {
        return (context || this.context).eventRecord;
    },

    /**
     * @method getResourceRecord
     * Accepts current context (selected cell) and should always return one resource record.
     * @param {Object} [context]
     * @param {Sch.model.Resource} context.resource Selected resource
     * @param {Date} context.startDate Current cell start date
     * @param {Date} context.endDate Current cell end date
     * @return {Sch.model.Resource}
     */
    getResourceRecord : function (context) {
        return (context || this.context).resource;
    },

    onKeyUp : function (e) {
        this.moveUp(e);
    },

    onKeyDown : function (e) {
        this.moveDown(e);
    },

    onKeyLeft : function (e) {
        this.moveLeft(e);
    },

    onKeyRight : function (e) {
        this.moveRight(e);
    },

    onKeyTab : function (e) {
        if (e.shiftKey) {
            this.moveLeft(e);
        } else {
            this.moveRight(e);
        }
    },

    onKeyEnter : function () {
        this.beginEdit();
    },

    onKeyEsc : function () {
        this.destroyHighlighter();
    },

    findPreviousIndex : function () {
        var me          = this,
            position    = me.getPosition();

        var prevRecord = me.schedulingView.walkRecs(position.resource, -1);

        if (prevRecord !== position.resource) {
            return me.getResourceIndex(prevRecord);
        } else {
            return -1;
        }
    },

    findNextIndex : function () {
        var me          = this,
            position    = me.getPosition();

        var prevRecord = me.schedulingView.walkRecs(position.resource, 1);

        if (prevRecord !== position.resource) {
            return me.getResourceIndex(prevRecord);
        } else {
            return -1;
        }
    },

    getCellEvents : function (position) {
        var me      = this,
            view    = me.schedulingView;

        position = position || me.getPosition();

        if (position.resourceIndex === -1 || position.tickIndex === -1) {
            return new Ext.util.MixedCollection();
        }

        var events = view.getEventStore().queryBy(function (event) {
            return event.getResourceId() === position.resource.getId() &&
                event.getStartDate() >= position.startDate &&
                event.getStartDate() < position.endDate;
        });

        events.sortBy(function (a, b) {
            var aEl = view.getElementsFromEventRecord(a, position.resource)[0],
                bEl = view.getElementsFromEventRecord(b, position.resource)[0];

            return aEl.getY() < bEl.getY() ? -1 : 1;
        });

        return events;
    },

    getAbove : function (position) {
        var me = this;

        position = position || me.getPosition();

        if (position.eventRecord) {
            var cellEvents = me.getCellEvents(position);

            var eventIndex = cellEvents.indexOf(position.eventRecord);

            // if box is currently on event in cell, check if we can just reduce the index
            if (eventIndex > 0) {
                var newEventIndex = eventIndex - 1;

                return {
                    tickIndex        : position.tickIndex,
                    resourceIndex    : position.resourceIndex,
                    eventIndexInCell : newEventIndex,
                    eventRecord      : cellEvents.getAt(newEventIndex)
                };
            }
        }

        var newResourceIndex = me.findPreviousIndex();

        // last expanded resource, cannot move down
        if (newResourceIndex === -1) {
            // have to return special index to exit routine later
            return { resourceIndex : -1 };
        }

        return me.getEventOrCell({
            tickIndex     : position.tickIndex,
            resourceIndex : newResourceIndex
        }, true);
    },

    getBelow : function (position) {
        var me = this;

        position = position || me.getPosition();

        if (position.eventRecord) {
            var cellEvents = me.getCellEvents(position);

            // if event was clicked, we don't know relative index, have to calculate it
            var eventIndex      = cellEvents.indexOf(position.eventRecord);
            var newEventIndex   = eventIndex + 1;

            if (eventIndex >= 0 && cellEvents.getCount() > newEventIndex) {
                return {
                    tickIndex        : position.tickIndex,
                    resourceIndex    : position.resourceIndex,
                    eventIndexInCell : newEventIndex,
                    eventRecord      : cellEvents.getAt(newEventIndex)
                };
            }
        }

        var newResourceIndex = me.findNextIndex();

        // last expanded resource, cannot move down
        if (newResourceIndex === -1) {
            return { resourceIndex : -1 };
        }

        return me.getEventOrCell({
            resourceIndex : newResourceIndex,
            tickIndex     : position.tickIndex
        });
    },

    /**
     * @method getEventOrCell
     * Moving box in horizontal direction should select first event in cell, or whole cell.
     * Method requires not only conventional context for next cell, but also new tickIndex and resourceIndex -
     * to avoid unnesessary lookups.
     * @param {Object} position Current {@link #context} updated with two optional properties:
     * @param {Number} [position.tickIndex] Tick index of new cell. If not provided - current is used.
     * @param {Number} [position.resourceIndex] Resource index of new cell. If not provided - current is used.
     * @param {Boolean} [pickLast=false] Pass true if you want to pick last event of cell
     *
     * @return {Object} Navigation params.
     * @return {Number} return.tickIndex Column index
     * @return {Date} return.startDate Cell start date
     * @return {Date} return.endDate Cell end date
     * @return {Number} return.resourceIndex Row number
     * @return {Sch.model.Resource} return.resource Resource record
     * @return {Sch.model.Event} return.eventRecord Event record to select, if applicable
     * @return {Number} return.eventIndexInCell Index of the event in cell, if applicable
     * @private
     */
    getEventOrCell : function (position, pickLast) {
        var me      = this;

        if (position.tickIndex === -1 || position.resourceIndex === -1) {
            return position;
        }

        var view        = this.schedulingView,
            tick        = view.timeAxis.getAt(position.tickIndex),
            startDate   = tick.getStartDate(),
            endDate     = tick.getEndDate(),
            resource    = view.dataSource.getAt(position.resourceIndex),
            eventRecord = position.eventRecord,
            eventIndexInCell = position.eventIndexInCell;

        var events = me.getCellEvents({ resource : resource, startDate : startDate, endDate : endDate });

        if (events.getCount()) {
            if (pickLast === true) {
                eventIndexInCell = events.getCount() - 1;
                eventRecord      = events.getAt(eventIndexInCell);
            // If record is provided, calculate it's index in cell. This can happen when event is clicked
            } else if (eventRecord) {
                eventIndexInCell = Ext.Array.indexOf(events, eventRecord);
            } else {
                eventIndexInCell = 0;
                eventRecord      = events.getAt(0);
            }
        }

        return {
            tickIndex           : position.tickIndex,
            startDate           : startDate,
            endDate             : endDate,
            resourceIndex       : position.resourceIndex,
            resource            : resource,
            eventRecord         : eventRecord,
            eventIndexInCell    : eventIndexInCell,
            isCellContext       : true
        };
    },

    getPrevious : function (position) {
        var me = this;

        position = me.stripPosition(position || me.getPosition());

        if (position.tickIndex > 0) {
            return me.getEventOrCell({
                tickIndex     : position.tickIndex - 1,
                resourceIndex : position.resourceIndex
            });
        } else {
            return me.getEventOrCell({
                tickIndex     : me.getNbrOfTicks() - 1,
                resourceIndex : me.findPreviousIndex()
            });
        }
    },

    getNext : function (position) {
        var me = this;

        position = me.stripPosition(position || me.getPosition());

        if (position.tickIndex < me.getNbrOfTicks() - 1) {
            return me.getEventOrCell({
                tickIndex     : position.tickIndex + 1,
                resourceIndex : position.resourceIndex
            });
        } else {
            return me.getEventOrCell({
                tickIndex     : 0,
                resourceIndex : me.findNextIndex()
            });
        }
    },

    moveUp : function (e) {
        var me = this;

        if (!me.containerEl) {
            return;
        }

        me.showEditorInCell(me.getAbove(), e);
    },

    moveDown : function (e) {
        var me = this;

        if (!me.containerEl) {
            return;
        }

        me.showEditorInCell(me.getBelow(), e);
    },

    moveLeft : function (e) {
        var me = this;

        if (!me.containerEl) {
            return;
        }

        me.showEditorInCell(me.getPrevious(), e);
    },

    moveRight : function (e) {
        var me = this;

        if (!me.containerEl) {
            return;
        }

        me.showEditorInCell(me.getNext(), e);
    },

    editNext : function (e) {
        var me          = this,
            position    = me.getPosition(),
            newPosition = me.getNext(position);

        while (!me.beginEdit(newPosition) && newPosition.resourceIndex !== -1) {
            position = newPosition;
            newPosition = me.getNext(position);
        }
    },

    editPrevious : function (e) {
        var me          = this,
            position    = me.getPosition(),
            newPosition = me.getPrevious(position);

        while (!me.beginEdit(newPosition) && newPosition.resourceIndex !== -1) {
            position = newPosition;
            newPosition = me.getPrevious(position);
        }
    },

    expandResourceRow : function (resourceNode, box, height) {
        var me = this;

        Ext.fly(resourceNode).setHeight(box.height + height);
        Ext.fly(me.lockedView.getNodeByRecord(me.getPosition().resource)).setHeight(box.height + height);

        me.__oldHeight = box.height;
    },

    getNewBottomEditorCoordinate : function (height) {
        var me           = this,
            record       = me.getCellEvents().last();

        if (record) {
            var position     = me.getPosition(),
                view         = me.schedulingView,
                resourceNode = view.getNodeByRecord(position.resource),
                box          = Ext.fly(resourceNode).getBox(),
                eventBox     = view.getElementsFromEventRecord(record, position.resource)[0].getBox();

            // we should expand row only if we do not have enough room for input
            // Let's forgive 1px - no big difference and at the same time don't expand semmingly sufficient row
            if (Math.abs(eventBox.bottom - box.bottom) < height - 1) {
                me.expandResourceRow(resourceNode, box, height);
                return box.bottom;
            } else {
                return eventBox.bottom;
            }
        }
    },

    collapseResourceRow : function () {
        var me = this;

        if (me.__oldHeight) {
            var position = me.getPosition();
            Ext.fly(me.schedulingView.getNodeByRecord(position.resource)).setHeight(me.__oldHeight);
            Ext.fly(me.lockedView.getNodeByRecord(position.resource)).setHeight(me.__oldHeight);

            delete me.__oldHeight;
        }
    },

    beginEditBelow : function () {
        var me = this;

        if (!me.containerEl) {
            return;
        }

        delete me.context.eventRecord;

        me.beginEdit();

        var height = me.timeAxisViewModel.getViewRowHeight();

        var bottom = me.getNewBottomEditorCoordinate(height);

        me.alignEditorToBox({
            left   : me.timeAxisViewModel.getTickWidth() * me.getPosition().tickIndex,
            y      : bottom,
            width  : me.timeAxisViewModel.getTickWidth(),
            height : height
        });
    },

    beginEdit : function (position) {
        var me = this;

        // When looking for next/previous edit position in editing mode position is passed as argument
        // and when editor reaches first/last cell, position has resourceIndex equal to -1
        if (!me.containerEl || (position && position.resourceIndex === -1) ) {
            return false;
        }

        // such event makes sense only if user is provided with selection information
        // e.g. he selected readonly cell
        if (me.fireEvent('beforecelledit', me, position ? [me.getContextFromPosition(position)] : me.getSelection()) === false) {
            return false;
        }

        // Sync plugin position with passed position. It will stop editing and place editor correctly
        if (position) {
            me.showEditorInCell(position);
        }

        me.editing = true;

        me.editor.startDate  = me.getPosition().startDate;
        me.editor.bottomUnit = Sch.util.Date.getSubUnit(me.timeAxisViewModel.getBottomHeader().unit);

        me.containerEl.select('.sch-cellplugin-border').hide();
        me.containerEl.addCls(me.editingCls);

        var event    = me.getEventRecord(),
            resource = me.getResourceRecord();

        if (event) {
            var date = Ext.Date;

            // TODO: this should be implemented in editor, not here
            var format    = Ext.isArray(me.editor.dateFormat) ? me.editor.dateFormat[0] : me.editor.dateFormat;
            var startDate = date.format(event.getStartDate(), format);
            var endDate   = date.format(event.getEndDate(), format);

            me.editor.record = event;

            me.editor.setValue([startDate, endDate].join(me.editor.divider));

            me.editor.recordNode = me.schedulingView.getElementsFromEventRecord(event, resource)[0];
            Ext.fly(me.editor.recordNode).hide();
        }

        me.editor.show();
        me.editor.setWidth(me.editor.getMaxWidth());
        me.editor.focus();

        me.fireEvent('begincelledit', me, me.getSelection());

        return me.editing;
    },

    cancelEdit : function () {
        var me = this;

        // If normal view is dblclicked and escape is typed this handler will be invoked. Need to check if editor is
        // present
        // 098_cellplugin
        if (me.editor && me.editor.getValue) {
            var value = me.editor.getValue();
            var selection = me.getSelection();

            if (me.fireEvent('beforecancelcelledit', me, value, selection) === false) {
                return;
            }

            me.stopEditing();

            me.fireEvent('cancelcelledit', me, value, selection);
        }
    },

    completeEdit : function () {
        var me         = this,
            addNewLine = false;

        // plugin is not in editing mode
        if (!me.editing || !me.containerEl) {
            return;
        }

        var editor    = me.editor,
            value     = me.editor.getValue(),
            selection = me.getSelection();

        if (me.fireEvent('beforecompletecelledit', me, value, selection) === false) {
            return;
        }

        if (value && editor.isValid()) {
            var view      = me.schedulingView,
                record    = editor.record,
                dates     = editor.getDates(value),
                startDate = dates[0],
                endDate   = dates[1];

            if (record) {
                record.setStartEndDate(startDate, endDate);
                delete editor.record;
            } else {
                var resource  = me.context.resource,
                    newRecord = Ext.create(view.getEventStore().getModel(), {
                    StartDate  : startDate,
                    EndDate    : endDate,
                    ResourceId : resource.getId()
                });

                view.onEventCreated(newRecord, [resource]);
                view.getEventStore().add(newRecord);
            }

            addNewLine = true;
        }

        me.stopEditing();

        me.fireEvent('completecelledit', me, value, selection);

        return addNewLine;
    },

    // resets value, restores view to state before editing
    stopEditing : function () {
        var me     = this,
            editor = me.editor;

        if (editor.recordNode) {
            Ext.fly(editor.recordNode).show();
            delete editor.recordNode;
        }

        me.collapseResourceRow();

        editor.setValue('');

        me.editing = false;
        me.clearSelection();

        me.containerEl.select('.sch-cellplugin-border').show();
        me.containerEl.removeCls(me.editingCls);
        editor.hide();

        // TODO: in IE if locked grid will have more than 1 column this can mess scroll position
        var node = me.lockedView.getRow(me.getPosition().resource);
        node && Ext.fly(node).down(me.lockedView.getCellSelector()).focus();
    },

    onBeforeSelect : function (e) {
        var me = this;

        e && e.isNavKeyPress && e.isNavKeyPress() && me.clearSelection();

        me.completeEdit();
    },

    onAfterSelect : function (e) {
        var me          = this,
            resource    = me.getPosition().resource;

        me.lockedView.getSelectionModel().select(resource);
        Ext.fly(me.lockedView.getRow(resource)).down(me.lockedView.getCellSelector()).focus();

        me.editor.setValue('');

        // TODO
        me.containerEl.scrollIntoView(me.schedulingView.getEl());
    },

    bindResourceStore : function (store, un) {
        if (store) {
            var me = this;

            me[un ? 'mun' : 'mon'](store, {
                add    : me.onResourceAdd,
                remove : me.onResourceRemove,
                clear  : me.destroyHighlighter,
                scope  : me
            });
        }
    },

    bindEventStore : function (store, un) {
        if (store) {
            var me = this;

            me[un ? 'mun' : 'mon'](store, {
                load  : me.destroyHighlighter,
                scope : me
            });
        }
    }
});
