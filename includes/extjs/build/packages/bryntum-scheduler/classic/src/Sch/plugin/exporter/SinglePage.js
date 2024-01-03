/**
 @class Sch.plugin.exporter.SinglePage
 @extends Sch.plugin.exporter.AbstractExporter

 This class extracts all scheduler data to fit in a single page.

 The exporter id of this exporter is `singlepage`
 */


Ext.define('Sch.plugin.exporter.SinglePage', {

    extend  : 'Sch.plugin.exporter.AbstractExporter',

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - name    : 'Single page'
     */

    config  : {
        id : 'singlepage'
    },

    getExpectedNumberOfPages : function () {
        return 1;
    },

    getPaperFormat : function () {
        var me          = this,
            realSize    = me.getTotalSize(),
            width       = realSize.width,
            height      = realSize.height+110;

        return width+'px*'+height+'px';
    },


    onRowsCollected : function () {
        var me = this;

        me.startPage();
        me.fillGrids();
        me.commitPage();

        me.onPagesExtracted();
    },


    getPageTplData : function () {
        var me          = this,
            realSize    = me.getTotalSize();

        return Ext.apply(me.callParent(arguments), {
            bodyHeight  : realSize.height,
            totalWidth  : realSize.width
        });
    },

    getHeaderTplData : function (pageInfo) {
        var me  = this;

        return Ext.apply(me.callParent(arguments), {
            width       : me.getTotalWidth(),
            height      : me.headerHeight
        });
    },

    getFooterTplData : function (pageInfo) {
        var me  = this;

        return Ext.apply(me.callParent(arguments), {
            width       : me.getTotalWidth(),
            height      : me.footerHeight
        });
    },

    fitComponentIntoPage : function (config) {
        var me          = this,
            lockedGrid  = me.lockedGrid;

        // If empty array of columns is passed set locked grid width to 0. Columns cannot be hidden due to sencha bug
        // see #4104
        if (config.columns && !config.columns.length) {
            lockedGrid.setWidth(0);
        } else {
            lockedGrid.setWidth(Ext.fly(lockedGrid.getView().getNodeContainer()).getWidth());
        }
    },

    preparePageToCommit : function () {
        var me              = this,
            frag            = me.callParent(arguments),
            secondaryCanvas = frag.select('.sch-secondary-canvas').first(),
            zones           = secondaryCanvas.select('.sch-zone'),
            lines           = secondaryCanvas.select('.sch-column-line'),
            height          = me.getTotalHeight();

        secondaryCanvas.setTop(-this.firstExportedRowOffset);
        zones.setHeight(height);
        lines.setHeight(height);

        var depsCt = frag.selectNode('.sch-dependencyview-ct');

        if (depsCt) {
            depsCt.innerHTML = me.dependenciesHtml;

            //move the dependencies div to match the position of the dependency lines
            depsCt.style.top = -this.firstExportedRowOffset + 'px';
            depsCt.style.left = '0px';
            depsCt.style.visibility = 'visible';
        }

        // hiding dependencies
        var normalView = me.normalView,
            tableWidth = normalView.getEl().down(me.tableSelector).getWidth(),
            id         = normalView.id,
            el         = frag.select('#' + id).first().dom;

        el.style.width = tableWidth + 'px';

        var normalViewEl = frag.selectNode('#'+me.normalView.id);
        //remove scrollbar
        normalViewEl.style.overflow = 'hidden';

        var splitter = frag.selectNode('.' + Ext.baseCSSPrefix + 'splitter');

        if (splitter) splitter.style.height = '100%';

        return frag;
    }

});
