/**
 * This class extracts pages in a vertical order. It fits all locked columns and the timeaxis on a single page and will generate
 * new pages vertically down for the rows.
 *
 * The exporter identifier is `multipagevertical`.
*/

Ext.define('Sch.plugin.exporter.MultiPageVertical', {

    extend                : 'Sch.plugin.exporter.AbstractExporter',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - name    : 'Multi pages (vertically)'
     */

    config                : {
        id : 'multipagevertical'
    },


    /**
     * @cfg minRowHeight Row heights are calculated based on column width shrink ratio regarding to paper width and height.
     * Minimum row height can be limited by this config.
     */
    minRowHeight          : 20,

    minAverageColumnWidth : 100,

    visibleColumns        : null,

    visibleColumnsWidth   : 0,

    depsTopOffset         : 0,


    onRowsCollected : function (lockedRows, normalRows) {
        var me          = this;

        me.depsTopOffset = -me.firstExportedRowOffset;

        me.iterateAsync(function (next, rowIndex) {

            if (rowIndex === normalRows.length) {
                me.onPagesExtracted();
                return;
            }

            var index       = rowIndex,
                spaceLeft   = me.printHeight,
                rowsHeight  = 0,
                lockeds     = [],
                normals     = [],
                newPage     = false,
                normal,
                locked;

            me.startPage();

            while (!newPage && index < normalRows.length) {

                normal      = normalRows[index];
                locked      = lockedRows[index];
                spaceLeft   -= normal.height;

                if (spaceLeft > 0) {
                    rowsHeight  += normal.height;
                    locked && lockeds.push(locked);
                    normals.push(normal);
                    index++;
                }
                else {
                    newPage = true;
                }
            }

            me.fillGrids(lockeds, normals);
            me.commitPage({ rowIndex : index, rowsHeight : rowsHeight });
            me.secondaryCanvasOffset -= rowsHeight;

            next( index );

        }, me, 0);
    },


    startPage : function () {
        var me      = this;
        me.callParent(arguments);

        var view    = me.getCurrentPage().select('#' + me.lockedView.id).first();
        view.dom.style.overflow = 'visible';
    },


    commitPage : function (pageData) {
        var me      = this;

        me.callParent(arguments);

        if (me.depView && me.depView.getDependencyStore()) {
            // on next page dependencies will be shifted vertically based on this page height
            me.depsTopOffset -= pageData.rowsHeight;
        }
    },


    getExpectedNumberOfPages : function () {
        return Math.ceil(this.normalRowsHeight / this.printHeight);
    },


    prepareColumns : function (columns) {

       this.callParent(arguments);

        var me                  = this,
            visibleColumns      = me.visibleColumns = [];

        me.visibleColumnsWidth  = 0;

        // If no columns passed to exporter, no columns should be visible
        if (columns && columns.length === 0) {
            return;
        }

        me.lockedGrid.headerCt.items.each(function (column) {
            if (!column.hidden) {
                visibleColumns.push({
                    column  : column,
                    width   : column.getWidth()
                });

                me.visibleColumnsWidth += column.getWidth();
            }
        });
    },


    fitComponentIntoPage : function () {
        var me              = this,
            component       = me.getComponent(),
            view            = component.getSchedulingView(),
            normalGrid      = component.normalGrid,
            lockedGrid      = component.lockedGrid,
            totalWidth      = me.getTotalWidth(),
            ticks           = me.ticks,
            timeColumnWidth = me.timeColumnWidth || view.timeAxisViewModel.getTickWidth();

        var lockedWidth     = Math.floor((me.visibleColumnsWidth / totalWidth) * me.paperWidth);

        //correct lockedcolumn width if it is too small
        var visibleColumnCount = me.visibleColumns.length,
            preferedLockedWidth = visibleColumnCount * me.minAverageColumnWidth;

        //preferred locked width can never take more than half of the page
        preferedLockedWidth = preferedLockedWidth > me.paperWidth / 2 ? Math.floor(me.paperWidth / 2) : preferedLockedWidth;
        //if preferred width is wider than current locked width, then use preferred width
        lockedWidth = preferedLockedWidth > lockedWidth ? preferedLockedWidth : lockedWidth;

        var normalWidth = me.paperWidth - lockedWidth;

        var tickWidth   = normalWidth / ticks.length;

        me.setRowHeight((tickWidth / timeColumnWidth) * me.getRowHeight());

        component.setWidth(me.paperWidth);
        normalGrid.setWidth(normalWidth);
        lockedGrid.setWidth(lockedWidth);
        //spread lockedcolums over the available width
        me.fitLockedColumnWidth(lockedWidth);

        component.setTimeColumnWidth(tickWidth);
    },


    setRowHeight : function (rowHeight) {
        var me = this;
        me.component.setRowHeight( rowHeight < me.minRowHeight ? me.minRowHeight : rowHeight );
    },


    /**
     * @private
     * Function that fits locked columns based on the available width.
     *
     * @param {String} totalWidth int indicating the totalWidth available for the locked columns.
     */

    fitLockedColumnWidth : function (totalWidth) {
        var me = this,
            visibleColumns = this.visibleColumns;

        //Keep ratio
        var ratio = totalWidth / me.visibleColumnsWidth;

        if (visibleColumns.length) {

            for (var i = 0; i < visibleColumns.length; i++) {

                var column = visibleColumns[i],
                    currentWidth = column.width,
                    width = Math.floor(currentWidth * ratio);

                column.column.setWidth(width);
            }

            this._restoreColumnWidth = true;
        }
    },


    restoreComponentState : function (component) {

        var me      = this;

        component   = component || me.getComponent();

        // restore original columns width (since we fit them while exporting)
        if (this._restoreColumnWidth) {

            var visibleColumns = this.visibleColumns;

            for (var i = 0; i < visibleColumns.length; i++) {
                var cWrap = visibleColumns[i];
                cWrap.column.setWidth(cWrap.width);
            }
        }

        this.callParent(arguments);

    },


    preparePageToCommit : function () {
        var me     = this,
            frag   = me.callParent(arguments),
            depsCt = frag.selectNode('.sch-dependencyview-ct');

        if (depsCt) {
            depsCt.innerHTML = me.dependenciesHtml;

            //move the dependencies div to match the position of the dependency lines
            depsCt.style.top  = me.depsTopOffset + 'px';
            depsCt.style.left = '0px';
            depsCt.style.visibility = 'visible';
        }

        // hiding dependencies
        var tableWidth = me.normalView.getEl().down(me.tableSelector).getWidth();

        var normalView = frag.selectNode('#'+me.normalView.id);

        normalView.style.width = tableWidth + 'px';

        //remove scrollbar
        normalView.style.overflow = 'hidden';

        var lockedView  = frag.selectNode('#'+me.lockedView.id);

        //remove scrollbar
        lockedView.style.overflow = 'hidden';


        var splitter = frag.selectNode('.' + Ext.baseCSSPrefix + 'splitter');

        if (splitter) splitter.style.height = '100%';

        return frag;
    }


});
