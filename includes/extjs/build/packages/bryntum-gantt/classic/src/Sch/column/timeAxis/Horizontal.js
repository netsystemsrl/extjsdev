/**
 * @class Sch.column.timeAxis.Horizontal
 * @extends Ext.grid.column.Column
 *
 *
 * A simple grid column providing a visual representation of the time axis. This class does not produce any real Ext JS grid columns, instead it just renders a Sch.view.HorizontalTimeAxis inside its element.
 * This class can represent up to three different axes, that are defined in the view preset config object.
 */
Ext.define("Sch.column.timeAxis.Horizontal", {
    extend : 'Ext.grid.column.Column',
    alias  : 'widget.timeaxiscolumn',

    requires      : [
        'Sch.view.HorizontalTimeAxis',
        'Sch.feature.HeaderResize'
    ],

    draggable          : false,
    groupable          : false,
    hideable           : false,
    sortable           : false,
    resizable          : false,
    menuDisabled       : true,
    cls                : 'sch-simple-timeaxis',
    tdCls              : 'sch-timetd',
    enableLocking      : false,
    locked             : false,
    lockable           : false,

    /**
    * @cfg {Boolean} enableTickResizing true to enable resizing the timeaxis 'ticks'
    **/
    enableTickResizing : false,

    // Prevents Ext from focusing cells on mousedown anywhere, which resets scroll to 0
    cellFocusable : false,

    timeAxisViewModel         : null,
    headerView                : null,

    // Disable Ext JS default header hover highlight
    hoverCls                  : '',
    ownHoverCls               : 'sch-column-header-over',

    /*
     * @cfg {Boolean} trackHeaderOver `true` to highlight each header cell when the mouse is moved over it.
     */
    trackHeaderOver           : true,

    /*
     * @cfg {Number} compactCellWidthThreshold The minimum width for a bottom row header cell to be considered 'compact',
     * which adds a special CSS class to the header row.
     */
    compactCellWidthThreshold: (Ext.theme && Ext.theme.name.toLowerCase() === 'classic') ? 15 : 35,

    initComponent : function () {
        if (this.enableTickResizing) {
            this.addPlugin(new Sch.feature.HeaderResize({
                selector          : '.sch-header-cell-resizehandle',
                timeAxisViewModel : this.timeAxisViewModel
            }));
        }

        this.callParent(arguments);
    },


    afterRender : function () {
        var me = this;

        // HACK relying on private accessor 'titleEl'
        var ct = me.titleEl.createChild({
            cls : 'sch-horizontaltimeaxis-ct'
        });

        if (!(me.headerView instanceof Sch.view.HorizontalTimeAxis)) {
            me.headerView = Ext.create(Ext.applyIf(me.headerView || {}, {
                xclass                    : 'Sch.view.HorizontalTimeAxis',
                model                     : me.timeAxisViewModel,
                containerEl               : ct,
                hoverCls                  : me.ownHoverCls,
                trackHeaderOver           : me.trackHeaderOver,
                enableTickResizing        : this.enableTickResizing,
                compactCellWidthThreshold : me.compactCellWidthThreshold
            }));
        }

        me.headerView.on('refresh', me.onTimeAxisViewRefresh, me);

        me.headerView.render();

        me.ownerCt.grid.on('afterlayout', function() {
            // column can be rendered after grid was reconfigured
            if (!me.ownerCt) {
                return;
            }

            // If the container of this column changes size, we need to re-evaluate the size for the
            // time axis view
            me.mon(me.ownerCt, "resize", me.onHeaderContainerResize, me);

            if (this.getWidth() > 0) {
                // In case the timeAxisViewModel is shared, no need to update it
                if (me.getAvailableWidthForSchedule() !== me.timeAxisViewModel.getAvailableWidth()) {
                    me.timeAxisViewModel.update(me.getAvailableWidthForSchedule());
                }
                me.setWidth(me.timeAxisViewModel.getTotalWidth());
            }
        }, null, { single : true });

        this.enableBubble('timeheaderclick', 'timeheaderdblclick', 'timeheadercontextmenu', 'horizontaltimeaxiscolumnrender');

        me.relayEvents(me.headerView, [
            'timeheaderclick',
            'timeheaderdblclick',
            'timeheadercontextmenu'
        ]);

        me.callParent(arguments);

        // we don't need timeline to be focusable, it messes up the 'timeheader*' events and looses scroll in IE
        me.focusable = false;

        this.fireEvent('horizontaltimeaxiscolumnrender', this);
    },

    initRenderData : function () {
        var me = this;

        me.renderData.headerCls = me.renderData.headerCls || me.headerCls;
        return me.callParent(arguments);
    },

    destroy : function () {
        if (this.headerView) {
            this.headerView.destroy();
            this.headerView = null;
        }
        this.callParent(arguments);
    },

    onTimeAxisViewRefresh : function () {
        var owningScheduler = this.getRootHeaderCt().grid;

        // No action if the Scheduler has not completed its initial layout <--------------------- This is a general principle. on render is not useful for this reason.
        if (!owningScheduler || owningScheduler.componentLayoutCounter) {
            // Make sure we don't create an infinite loop
            this.headerView.un('refresh', this.onTimeAxisViewRefresh, this);

            var newWidth = this.timeAxisViewModel.getTotalWidth();

            if (this.getWidth() !== newWidth) {
                this.setWidth(newWidth);
            } else {
                // trigger update layout in order to flush header height
                this.updateLayout();
            }

            this.ensureSizing();

            this.headerView.on('refresh', this.onTimeAxisViewRefresh, this);
        }
    },

    getAvailableWidthForSchedule : function () {
        // When applying state to rendered scheduler, Ext will remove content from normal and locked headers keeping
        // instances alive (#2580)
        if (!this.ownerCt) {
            return 0;
        }

        // In case owner container is hidden then it and it's items will return zero width, if so we fallback to
        // lastBox private property of Ext.AbstractComponent
        var available = this.ownerCt.isVisible(true) ? this.ownerCt.getWidth() : (this.ownerCt.lastBox && this.ownerCt.lastBox.width || 0),
            items = this.ownerCt.items,
            item;

        // substracting the widths of all columns starting from 2nd ("right" columns)
        for (var i = 1; i < items.length; i++) {
            item = items.get(i);
            if (!item.hidden) {
                available -= item.isVisible(true) ? item.getWidth() : (item.lastBox && item.lastBox.width || 0);
            }
        }

        return Math.max(0, available - Ext.getScrollbarSize().width - 1);
    },

    onResize : function () {
        this.callParent(arguments);
        this.timeAxisViewModel.setAvailableWidth(this.getAvailableWidthForSchedule());
    },

    onHeaderContainerResize : function (header, width, height, oldWidth, oldHeight) {
        this.timeAxisViewModel.setAvailableWidth(this.getAvailableWidthForSchedule());

        if (height !== oldHeight) {
            this.headerView.render();
        }
    },

    // Check to make sure the timeaxis column content is at least the size of the locked grid
    // Scenario is a locked column with tall content, e.g. a text + text field, or foo<br>bar<br>baz
    // If time axis is only one level, we need to stretch it to match the height of the column
    ensureSizing : function () {
        var viewContainerEl         = this.headerView.containerEl;
        var availableHeight         = this.ownerCt.getHeight();
        var renderedTimeAxisHeight  = viewContainerEl.getHeight();

        var heightDiff      = availableHeight - renderedTimeAxisHeight;

        if(heightDiff > 0) {
            var lastRow = viewContainerEl.down('table:last-of-type tr');

            if (lastRow) {
                viewContainerEl.select('table tr').setHeight(availableHeight / this.timeAxisViewModel.getHeaders().length);
            }
        }
    },

    /*
     * Refreshes the column header contents. Useful if you have some extra meta data in your timeline header that
     * depends on external data such as the EventStore or ResourceStore.
     */
    refresh                 : function () {
        if (this.rendered) {
            // Update the model, but don't fire any events which will fully redraw view
            this.timeAxisViewModel.update(null, true);

            // Now the model state has been refreshed so headers can be rerendered
            this.headerView.render();
        }
    }
});


