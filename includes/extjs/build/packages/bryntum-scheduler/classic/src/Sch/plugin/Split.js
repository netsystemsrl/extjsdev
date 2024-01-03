/**
 * A grid plugin adding the Excel-like 'split' feature.
 *
 * **Note:** This plugin is only supported in horizontal Scheduler mode!
 *
 * Sample usage:
 *
 * ```javascript
 * new Sch.panel.SchedulerGrid({
 *     plugins   : ['scheduler_split'],
 *     // To split the grid by default, or you can skip this config and split it manually from context menu.
 *     splitGrid : true
 *     ...
 * });
 * ```
 */
Ext.define('Sch.plugin.Split', {
    extend   : 'Ext.AbstractPlugin',
    mixins   : ['Sch.mixin.Localizable'],
    requires : ['Ext.menu.Menu'],

    alias : 'plugin.scheduler_split',

    /**
     * @cfg {Boolean} splitGrid
     * Set to `true` to split the grid as soon as it's shown
     */
    splitGrid : false,

    /**
     * @cfg {String} triggerEvent
     * An event that shall trigger showing the {@link #menu}.
     * Set to empty string or `null` to disable the action.
     */
    triggerEvent : 'contextmenu',

    /**
     * @cfg {Object} menuConfig
     * A config for the {@link #menu}
     */
    menuConfig : null,

    /**
     * @property {Ext.menu.Menu} menu
     * @readonly
     * A menu component provided UI to split/merge the grid
     */
    menu : null,

    /**
     * @property {Sch.panel.SchedulerGrid} grid
     * @readonly
     * The grid reference
     */
    grid : null,

    /**
     * @property {Sch.panel.SchedulerGrid} gridClone
     * @readonly
     * A clone of the grid
     */
    gridClone : null,

    splitMergeMenuItem : null,

    splitMergeMenuItemId : 'sch-dosplitmerge',

    splitCls        : 'sch-grid-split',
    resizeHandleCls : 'sch-grid-split-resize-handle',
    gridCloneCls    : 'sch-grid-split-clone',

    staticCloneConfig : {
        __cloned    : true,
        splitGrid   : false,
        eventPrefix : null,
        dock        : 'bottom',
        id          : null,
        itemId      : null,
        hideHeaders : true,
        header      : false,
        tbar        : null,
        tools       : null,
        bbar        : null,
        buttons     : null,
        margin      : 0,
        padding     : 0,
        resizable   : {
            pinned  : true,
            handles : 'n',
            dynamic : true
        }
    },

    init : function (grid) {
        // Limit to one vertical grid split
        if (!grid.__cloned) {
            grid.on('afterlayout', function () {
                this.setupGrid(grid);
            }, this, { single : true });
        }
    },

    setupGrid : function (grid) {
        this.grid = grid;

        if (this.triggerEvent) {
            this.createMenu();
            this.addGridListeners();
        }

        // Provide some functions to the grid
        grid.split   = Ext.Function.bind(this.split, this);
        grid.merge   = Ext.Function.bind(this.merge, this);
        grid.isSplit = Ext.Function.bind(this.isSplit, this);

        this.splitGrid = !Ext.isEmpty(grid.splitGrid) ? grid.splitGrid : this.splitGrid;

        if (this.splitGrid) {
            this.split();
        }
    },

    /**
     * Splits the grid into two parts
     * @param {Number} [position] Vertical position
     */
    split : function (position) {
        if (this.isSplit() || !this.grid.isHorizontal()) return;

        this.gridClone = this.cloneGrid(position);

        this.grid.addCls(this.splitCls);
        this.gridClone.addCls(this.gridCloneCls);

        var resizeHandle = this.grid.getEl().down('.' + Ext.baseCSSPrefix + 'docked .' + Ext.baseCSSPrefix + 'resizable-handle-north');

        resizeHandle.addCls(this.resizeHandleCls);

        this.gridClone.mon(resizeHandle, 'dblclick', this.merge, this);
        this.gridClone.mon(this.grid, 'resize', this.onMainGridResize, this);

        this.setupSynchronization();

        this.grid.fireEvent('split', this);
    },

    /**
     * Merges the grids into the one grid
     */
    merge : function () {
        if (!this.isSplit() || !this.grid.isHorizontal()) return;

        this.gridClone.destroy();
        this.gridClone = null;

        this.grid.removeCls(this.splitCls);
        this.grid.fireEvent('merge', this);
    },

    /**
     * Checks if the grid is split and the clone exists
     * @return {boolean} isSplit
     */
    isSplit : function () {
        return !!this.gridClone;
    },

    /**
     * A hook to extend the proposed config passed to the grid clone. Returned object will be merged with the proposed config.
     * @template
     * @protected
     * @param {Sch.panel.SchedulerGrid} grid The original grid
     * @param {Object} proposedConfig A config provided to the grid clone by default
     * @return {Object} extendedConfig A config to be merged with the proposed one
     */
    getCloneConfig : function (grid, proposedConfig) {
        return {};
    },

    onMenuTriggerEvent : function (e) {
        if (!this.grid.isHorizontal()) return;

        this.menu.showAt(e.getXY());

        if (this.splitMergeMenuItem) {
            this.splitMergeMenuItem.setText(this.isSplit() ? this.L('mergeText') : this.L('splitText'));

            var cell = e.getTarget('.' + Ext.baseCSSPrefix + 'grid-cell');

            if (cell) {
                var viewY = (this.grid.normalGrid || this.grid).getView().getEl().getY();

                this.splitMergeMenuItem.splitPosition = Ext.fly(cell).getBottom() - viewY;
            }
        }

        e.stopEvent();
    },

    createMenu : function () {
        this.menu = Ext.create(Ext.apply({
            xclass   : 'Ext.menu.Menu',
            plain    : true,
            defaults : {
                // Provide scope to all possible items
                scope : this
            },
            items    : [{
                itemId  : this.splitMergeMenuItemId,
                handler : 'onSplitMergeMenuItemClick'
            }]
        }, this.menuConfig));

        this.splitMergeMenuItem = this.menu.down('#' + this.splitMergeMenuItemId);
    },

    addGridListeners : function () {
        this.grid.on(
            'item' + this.triggerEvent,
            function (grid, item, node, index, e) {
                this.onMenuTriggerEvent(e);
            },
            this
        );

        this.grid.getEl().on(
            this.triggerEvent,
            this.onMenuTriggerEvent,
            this,
            { delegate : '.' + this.resizeHandleCls }
        );

        this.grid.on(
            'beforemodechange',
            this.onBeforeGridModeChange,
            this
        );
    },

    onBeforeGridModeChange : function (scheduler, modeCfg) {
        var modeName = Ext.isString(modeCfg) ? modeCfg : modeCfg.mode;

        if (modeName !== 'horizontal' && this.isSplit()) {
            this.merge();
        }
    },

    onSplitMergeMenuItemClick : function (menuItem, e) {
        if (this.isSplit()) {
            this.merge();
        } else {
            this.split(menuItem.splitPosition);
        }
    },

    cloneGrid : function (position) {
        var grid    = this.grid,
            columns = Ext.Array.map(grid.headerCt.getGridColumns(), this.cloneColumn, this);

        columns = Ext.Array.filter(columns, function (col) {
            return col.xtype !== 'timeaxiscolumn';
        });

        var config = Ext.apply({
            partnerTimelinePanel : grid,
            xtype                : grid.xtype,
            crudManager          : grid.crudManager,
            eventStore           : grid.eventStore,
            resourceStore        : grid.resourceStore,
            dependencyStore      : grid.dependencyStore,
            assignmentStore      : grid.assignmentStore,
            height               : position ? (this.getGridViewHeight() - position) : this.getGridViewHeight() / 2,
            maxHeight            : this.getCloneMaxHeight(),
            columns              : columns
        }, this.staticCloneConfig);

        config = Ext.applyIf(config, grid.initialConfig);

        config = Ext.apply(config, this.getCloneConfig(grid, config));

        return grid.addDocked(config)[0];
    },

    cloneColumn : function (col) {
        return Ext.applyIf({
            width  : col.getWidth(),
            locked : col.locked,
            flex   : col.flex
        }, col.initialConfig);
    },

    getGridViewHeight : function () {
        var view = this.grid.lockedGrid ? this.grid.lockedGrid.getView() : this.grid.getView();

        return view.getHeight();
    },

    setupSynchronization : function () {
        var grid  = this.grid.normalGrid || this.grid;
        var clone = this.gridClone.normalGrid || this.gridClone;

        this.setupColumnSync(grid.getHeaderContainer(), clone.getHeaderContainer());

        if (this.grid.lockedGrid) {
            this.setupColumnSync(this.grid.lockedGrid.getHeaderContainer(), this.gridClone.lockedGrid.getHeaderContainer());
        }
    },

    setupColumnSync : function (mainHeaderCt, cloneHeaderCt) {
        cloneHeaderCt.mon(mainHeaderCt, {
            columnresize : this.onColumnResize,
            scope        : cloneHeaderCt
        });

        // Column lock/unlock etc, too big change to sync, simply trigger a new split
        // will be also triggered on every hide/show/add/remove as columnschanged event is fired after those
        cloneHeaderCt.mon(mainHeaderCt, {
            columnschanged : this.onColumnsChanged,
            scope          : this
        });
    },

    onColumnResize : function (mainHeaderCt, col, width) {
        var cloneHeaderCt = this;
        var cloneColumns  = cloneHeaderCt.getGridColumns();

        cloneColumns[mainHeaderCt.items.indexOf(col)].setWidth(width);
    },

    onColumnsChanged : function (mainHeaderCt, col, fromIdx, toIdx) {
        var grid  = this.grid.normalGrid || this.grid;
        var clone = this.gridClone.normalGrid || this.gridClone;

        clone.getHeaderContainer().removeAll();
        clone.getHeaderContainer().add(Ext.Array.map(grid.getHeaderContainer().getGridColumns(), this.cloneColumn, this));

        if (this.grid.lockedGrid) {
            grid  = this.grid.lockedGrid;
            clone = this.gridClone.lockedGrid;

            clone.getHeaderContainer().removeAll();
            clone.getHeaderContainer().add(Ext.Array.map(grid.getHeaderContainer().getGridColumns(), this.cloneColumn, this));

        }
    },

    onMainGridResize : function () {
        var maxHeight = this.getCloneMaxHeight();

        // HACK still relevant in 6.5.3
        // https://www.sencha.com/forum/showthread.php?337699
        this.gridClone.resizer.maxHeight = this.gridClone.resizer.resizeTracker.maxHeight = maxHeight;


        if (this.gridClone.getHeight() > maxHeight) {
            this.gridClone.setHeight(maxHeight);
        }
        this.gridClone.setMaxHeight(maxHeight);
    },

    getCloneMaxHeight : function () {
        var headerHeight = this.grid.down('headercontainer').el.getBottom() - this.grid.el.getTop();

        return this.grid.getHeight() - headerHeight;
    },

    destroy : function () {
        if (this.menu) {
            this.menu.destroy();
        }

        this.callParent(arguments);
    }
});