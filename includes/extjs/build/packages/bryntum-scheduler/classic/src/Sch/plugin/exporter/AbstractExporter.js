/**
 @class Sch.plugin.exporter.AbstractExporter
 @extends Ext.util.Observable

 This class represents the base implementation of an exporter.
 An exporter extracts the provided component content and packs it into array of pages (based on provided export settings and implemented algorithm).
 The main entry point for an exporter that launches the extraction process is {@link #extractPages} method:

             exporter.extractPages(component, config, function (pages) {

                alert(pages.length + " extracted");

                ...

             }, me);


*/
Ext.define('Sch.plugin.exporter.AbstractExporter', {

    extend                       : 'Ext.util.Observable',

    requires                     : [
        'Ext.XTemplate'
    ],

    mixins                       : ['Sch.mixin.Localizable'],

    /**
     * @deprecated Use {@link #headerHeight} instead.
     * @cfg {Number}
     * Header height. Amount of space for {@link #headerTpl the page header}.
     */
    pageHeaderHeight             : 41,

    /**
     * @cfg {Number}
     * Header height. Amount of space for {@link #headerTpl the page header}.
     */
    headerHeight                  : 41,

    /**
     * @deprecated Use {@link #footerHeight} instead.
     * @cfg {Number}
     * Footer height. Amount of space for {@link #footerTpl the page footer}.
     */
    pageFooterHeight              : 41,

    /**
     * @cfg {Number}
     * Footer height. Amount of space for {@link #footerTpl the page footer}.
     */
    footerHeight                 : 41,

    bufferedHeightMargin         : 25,

    /**
     * @private
     * @property {Boolean} isExporter
     * @readonly
     * `true` in this class to identify an object as an instantiated Exporter, or subclass thereof.
     */
    isExporter                   : true,

    /**
     * @private
     * @property {Number} paperWidth
     * Paper width. Calculated based on provided page format and DPI resolution.
     */
    paperWidth                   : 0,

    /**
     * @private
     * @property {Number} paperHeight
     * Paper height. Calculated based on provided page format and DPI resolution.
     */
    paperHeight                  : 0,

    /**
     * @private
     * @property {Number} printHeight
     * Paper height that can be used for printing rows. Calculated as {@link #paperHeight} minus header heights.
     */
    printHeight                  : 0,

    lockedRowsHeight             : 0,

    normalRowsHeight             : 0,

    iterateTimeout               : 10,

    /**
     * @private
     * @cfg {String} tableSelector
     * The selector for the row container used for both normalGrid and lockedGrid.
     */
    tableSelector                : undefined,

    /**
     * @private
     * @property {Ext.dom.Element} currentPage
     * Current page being extracted.
     */
    currentPage                  : undefined,

    /**
     * @deprecated
     * @cfg {Function} headerTplDataFn
     * If specified the function result will be applied to {@link #getHeaderTplData} result.
     * To define the scope please use {@link #headerTplDataFnScope}.
     */
    headerTplDataFn              : null,

    /**
     * @deprecated
     * @cfg {Function} footerTplDataFn.
     * If specified the function result will be applied to {@link #getFooterTplData} result.
     * To define the scope please use {@link #footerTplDataFnScope}.
     */
    footerTplDataFn              : null,

    /**
     * @deprecated
     * @cfg {Object} headerTplDataFnScope The scope for {@link #footerTplDataFn} template method.
     */
    headerTplDataFnScope         : null,

    /**
     * @deprecated
     * @cfg {Object} footerTplDataFnScope The scope for {@link #footerTplDataFn} template method.
     */
    footerTplDataFnScope         : null,


    config                       : {
        /**
         * @deprecated Use {@link #id} instead.
         * @cfg {String} exporterId.
         * Exporter identifier. Has to be unique among other exporters when you register in in {@link Sch.plugin.Export} instance.
         */
        exporterId                : 'abstractexporter',


        /**
         * @cfg {String}
         * Exporter identifier. Has to be unique among other exporters when you register in in {@link Sch.plugin.Export} instance.
         */
        id                        : 'abstractexporter',

        /**
         * @cfg {String}
         * Exporter name. By default will be taken from the class {@link #l10n locale}.
         */
        name                      : '',

        translateURLsToAbsolute   : true,

        expandAllBeforeExport     : false,

        /**
         * @cfg {String/Ext.XTemplate} headerTpl
         * Template of an extracted page header.
         */
        headerTpl                 : '<div class="sch-export-header" style="height:{height}px; width:{width}px"><h2>{pageNo}/{totalPages}</h2></div>',

        /**
         * @cfg {String/Ext.XTemplate} tpl
         * Template of an extracted page.
         */
        tpl                       : '<!DOCTYPE html>' +
            '<html class="' + Ext.baseCSSPrefix + 'border-box {htmlClasses}">' +
            '<head>' +
            '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />' +
            '<title>{title}</title>' +
            '{styles}' +
            '</head>' +
            '<body class="' + Ext.baseCSSPrefix + 'webkit sch-export {bodyClasses}">' +
            '{header}' +
            '<div id="{id}" class="{componentClasses}" style="height:{bodyHeight}px; width:{totalWidth}px; position: relative !important">' +
            '{HTML}' +
            '</div>' +
            '{footer}' +
            '</body>' +
            '</html>',

        /**
         * @cfg {String/Ext.XTemplate} footerTpl
         * Template of an extracted page footer.
         */
        footerTpl                 : '<div class="sch-export-header" style="height:{height}px; width:{width}px"><h2>{pageNo}/{totalPages}</h2></div>',

        //  Row visibility detection threshold (0.6 - means that when 60% of a row height is visible we consider it as visible)
        rowVisibilityThreshold    : 0.6
    },

    //private placeholder for provided callback functions passed in extractPages
    callbacks                    : undefined,

    //private String errorMessage, when internally set this message will be displayed in a pop-up message.
    error                        : undefined,

    /**
     * @private
     * @property {Object[]} extractedPages Collection of extracted pages.
     */
    extractedPages               : undefined,

    /**
     * @private
     * @property {Number} numberOfPages Total number of pages extracted.
     */
    numberOfPages                : 0,

    // vertical offset of the very first row exported
    firstExportedRowOffset       : 0,

    // Vertical offset of the secondary canvas. Initially equals to the negative "firstExportedRowOffset".
    // Though the value might change while pages getting extracted.
    secondaryCanvasOffset        : 0,

    eventBoxes                   : null,

    dependencyPainter            : null,

    dependenciesHtml             : '',

    depViewBeforeRefreshDetacher : null,

    depView                      : null,

    collectRowsTimer             : null,
    collectRowsTimerTimeout      : 1,

    collectRowsStepTimer         : null,
    scrollToTimer                : null,
    timer1                       : null,
    timer2                       : null,

    /**
     * @private
     * @property {String} stylesheets
     * Extracted CSS stylesheets of the component.
     */
    stylesheets                  : null,

    constructor : function (config) {
        var me  = this;

        config  = config || {};

        if (config.pageHeaderHeight)
            config.headerHeight = config.pageHeaderHeight;

        if (config.pageFooterHeight)
            config.footerHeight = config.pageFooterHeight;

        if (config.exporterId)
            config.id = config.exporterId;

        me.callParent(arguments);

        // initConfig thinks that we're trying to override methods so we have to delete following
        delete config.getUserHeaderTplData;
        delete config.getUserFooterTplData;

        me.initConfig(config);

        if (!config.tableSelector) {
            me.tableSelector    = '.' + Ext.baseCSSPrefix + 'grid-item-container';
        }

        // get the exporter name from locale (if not provided explicitly)
        if (!config.name) me.setName(me.L('name'));
    },

    getExporterId : function() {
       return this.getId();
    },

    destroy : function () {
        clearTimeout(this.collectRowsStepTimer);
        clearTimeout(this.collectRowsTimer);
        clearTimeout(this.scrollToTimer);
        clearTimeout(this.timer1);
        clearTimeout(this.timer2);

        this.callParent(arguments);
    },

    setHeaderTpl : function (tpl) {
        this.headerTpl = this.getTplInstance(tpl);
    },

    getHeaderTpl : function () {
       return this.headerTpl;
    },

    setTpl : function (tpl) {
        this.tpl = this.getTplInstance(tpl);
    },

    getTpl : function () {
        return this.tpl;
    },

    setFooterTpl : function (tpl) {
        this.footerTpl = this.getTplInstance(tpl);
    },

    getFooterTpl : function () {
        return this.footerTpl;
    },

    getTplInstance : function (tpl) {
        return (tpl && !tpl.isTemplate) ? new Ext.XTemplate(tpl, { disableFormats : true }) : tpl;
    },

    /**
     * @private
     * Returns the CSS classes for BODY element of extracted page. Override this if you need to customize the CSS classes of exported pages.
     * @return {String} CSS classes.
     */
    getBodyClasses : function () {
        var re      = new RegExp(Ext.baseCSSPrefix + 'ie\\d?|' + Ext.baseCSSPrefix + 'gecko', 'g'),
            result  = document.body.className.replace(re, '');

        if (Ext.isIE) {
            result  += ' sch-ie-export';
        }

        return result;
    },

    /**
     * @private
     * Returns the CSS classes for element containing exported component. Override this if you need to customize exported pages CSS classes.
     * @return {String} CSS classes.
     */
    getComponentClasses : function () {
        return this.getComponent().el.dom.className;
    },

    /**
     * @private
     * Sets the component being exported.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} component The component being exported.
     */
    setComponent : function (component) {
        var me                  = this;

        me.component            = component;
        me.view                 = component.getSchedulingView();
        me.normalGrid           = component.normalGrid;
        me.lockedGrid           = component.lockedGrid;
        me.normalView           = component.normalGrid.getView();
        me.lockedView           = component.lockedGrid.getView();
        me.lockedBodySelector   = '#' + me.lockedView.getId();
        me.normalBodySelector   = '#' + me.normalView.getId();
        me.lockedHeader         = me.lockedGrid.headerCt;
        me.normalHeader         = me.normalGrid.headerCt;
        me.gridHeaderHeight     = me.normalHeader.getHeight();

        // page height w/o component headers
        me.printHeight = Math.floor(me.paperHeight) - me.gridHeaderHeight - (me.exportConfig.showHeader ? me.headerHeight : 0) - (me.exportConfig.showFooter ? me.footerHeight : 0);

        me.saveComponentState(component);

        me.initDependencyPainter(component);
    },

    // The component being exported.
    getComponent : function () {
        return this.component;
    },

    /**
     * @private
     * Applies the selected paper size based on export configuration and {@link #paperSizes} config. Calculates {@link #paperWidth} and {@link #paperHeight} properties.
     */
    setPaperSize : function (pageSize, orientation) {
        var me          = this;

        //size of paper we will be printing on. take orientation into account
        if (orientation === 'landscape') {
            me.paperWidth   = pageSize.height;
            me.paperHeight  = pageSize.width;
        } else {
            me.paperWidth   = pageSize.width;
            me.paperHeight  = pageSize.height;
        }
    },

    /**
     * @return {String} returns the format of the current export operation.
     */
    getPaperFormat : function () {
        return this.exportConfig.format;
    },


    // Returns whether the component uses buffered rendering.
    isBuffered : function () {
        return !!this.getBufferedRenderer();
    },

    // Returns the normal grid buffered renderer instance (if the component uses buffered rendering).
    getBufferedRenderer : function () {
        return this.view.bufferedRenderer;
    },

    /**
     * @private
     * Applies the passed date range to the component.
     * @param {Object} config Export configuration.
     */
    setComponentRange : function (config) {
        var me          = this,
            component   = me.getComponent();

        // if we export a part of scheduler
        if (config.range !== 'complete') {

            var view    = me.view,
                newStart,
                newEnd;

            switch (config.range) {
                case 'date' :
                    newStart = new Date(config.dateFrom);
                    newEnd   = new Date(config.dateTo);
                    // ensure that specified period has at least a day
                    if (Sch.util.Date.getDurationInDays(newStart, newEnd) < 1) {
                        newEnd  = Sch.util.Date.add(newEnd, Sch.util.Date.DAY, 1);
                    }
                    break;

                case 'current' :
                    var visibleSpan = view.getVisibleDateRange();
                    newStart        = visibleSpan.startDate;
                    newEnd          = visibleSpan.endDate || view.timeAxis.getEnd();
                    break;

                case 'completedata' :
                   var span = component.getEventStore().getTotalTimeSpan();
                   newStart = span.start;
                   newEnd   = span.end;
                   break;
            }

            // apply new time frame
            if (newStart && newEnd) {
                component.setTimeSpan(newStart, newEnd);
            }
        }

        me.ticks  = component.timeAxis.getTicks();

        // if only currently visible rows have to be extracted
        if (config.rowsRange == 'visible') {
            // find effective currently visible rows range (an array: [startIndex, endIndex])
            config.rowsRange = me.findVisibleRowsRange();

        // all rows mode
        } else {
            config.rowsRange = null;
        }


    },

    /**
     * @private
     * Get links to the stylesheets of current page.
     */
    getStylesheets : function() {
        var translate       = this.getTranslateURLsToAbsolute(),
            styleSheetNodes = Ext.select('link[rel="stylesheet"], style', true),
            stylesString    = '';

        var host = window.origin;

        styleSheetNodes.each(function(extEl) {
            var node    = extEl.dom.cloneNode(true);

            // put absolute URL to node `href` attribute
            if (translate && node.href) {
                node.setAttribute('href', translate === true ? node.href : node.href.replace(host, translate));
            }

            stylesString += node.outerHTML;

            // Empty style tag will be copied in IE, so we need to use cssText
            // http://stackoverflow.com/questions/5227088/creating-style-node-adding-innerhtml-add-to-dom-and-ie-headaches
            if (Ext.isIE && node.styleSheet && /style/i.test(node.tagName)) {
                stylesString += '<style type="text/css">' + extEl.dom.styleSheet.cssText + '</style>';
            }
        });

        return stylesString;
    },


    // Since export is a sync operation for now, all plugins drawing lines & zones need to be temporarily adjusted
    // to draw their content synchronously.
    forEachTimeSpanPlugin : function (component, fn, scope) {
        if (Sch.feature && Sch.feature.AbstractTimeSpan) {

            var me = this;
            var plugins = [].concat(component.plugins, component.normalGrid.plugins, component.columnLinesFeature);

            for (var i = 0, l = plugins.length; i < l; i++) {
                var plugin  = plugins[i];

                if (plugin instanceof Sch.feature.AbstractTimeSpan) {
                    fn.call(scope || me, plugin);
                }
            }
        }
    },


    setCellSize : function (cellSize) {
        var me = this;

        me.timeColumnWidth = cellSize[0];

        if (me.timeColumnWidth) {
            this.getComponent().setTimeColumnWidth(me.timeColumnWidth);
        }

        // change the row height only if value is provided
        if (cellSize.length > 1) {
            me.view.setRowHeight(cellSize[1]);
        }
    },


    findVisibleRowsRange : function () {
        var me         = this,
            nodeCache  = me.lockedView.all,
            startIndex = nodeCache.startIndex,
            endIndex   = nodeCache.endIndex;

        var metVisibleNode       = false,
            firstVisibleRowIndex = -1,
            lastVisibleRowIndex  = -1;

        for (var i = startIndex; i <= endIndex; i++) {
            var node       = nodeCache.item(i, true);

            if (me.isRowVisible(node, me.lockedBox)) {
                if (!metVisibleNode) {
                    firstVisibleRowIndex = i;
                    metVisibleNode = true;
                }
                lastVisibleRowIndex = i;

            } else if (metVisibleNode) {
                break;
            }
        }

        return [firstVisibleRowIndex, lastVisibleRowIndex];
    },


    /**
     * @private
     * Prepares the component to export. This includes setting requested time span, time column width etc.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} component The component being exported.
     * @param {Object} config    Export configuration.
     */
    prepareComponent : function (component, config) {
        var me      = this;

        component   = component || me.getComponent();

        me.suspendInfiniteScroll(component);

        me.forEachTimeSpanPlugin(component, function (plugin) {
            plugin._renderDelay = plugin.renderDelay;
            plugin.renderDelay  = 0;
        });

        component.getSchedulingView().timeAxisViewModel.suppressFit = true;
        component.timeAxis.autoAdjust                               = false;
        //expand grids in case they're collapsed
        component.normalGrid.expand();
        component.lockedGrid.expand();

        // remember view regions (to be able to decide on rows visibility if requested)
        if (Ext.getVersion().isGreaterThan('6.2.0')) {
            me.lockedBox = me.lockedGrid.body.getBox();
            me.normalBox = me.normalGrid.body.getBox();
        } else {
            me.lockedBox = me.lockedView.getBox();
            me.normalBox = me.normalView.getBox();
        }

        // change timespan/tick width according to provided settings
        me.setComponentRange(config);

        // if row/column sizes provided
        config.cellSize && me.setCellSize(config.cellSize);

        // launch template method
        config.beforeExport && config.beforeExport(component, me.ticks);

        me.prepareColumns(config.columns);

        // For Tree grid, optionally expand all nodes
        if (me.expandAllBeforeExport && component.expandAll) {
            component.expandAll();
        }

        // resizes the component to fit it into specified paper size (depending on pagination rules)
        me.fitComponentIntoPage(config);

        //bug fix #2284 - MultiPage export does not sync timeaxis on first run
        me.view.timeAxisViewModel.setTickWidth(me.view.timeAxisViewModel.getTickWidth());

        // now when we adjusted the component let get its stylesheets
        me.stylesheets = me.getStylesheets();
    },

    prepareColumns : function (columns) {
        var me = this;

        // If the list of columns to export is provided
        if (columns && columns.length) {
            me.lockedGrid.headerCt.items.each(function (column) {
                // Show only passed columns
                if (Ext.Array.contains(columns, column)) {
                    column.show();
                } else {
                    column.hide();
                }
            });
        }
    },

    restoreComponent : function (component) {
        var me      = this;

        component   = component || me.getComponent();

        me.forEachTimeSpanPlugin(component, function (plugin) {
            plugin.renderDelay  = plugin._renderDelay;
            delete plugin._renderDelay;
        });

        // if we stopped the dependency view refreshing we enable it back
        if (me.depViewBeforeRefreshDetacher) {
            me.depViewBeforeRefreshDetacher.destroy();
            me.depViewBeforeRefreshDetacher = null;
            me.depView.updateCanvasLayer();
        }

        // restore scheduler state
        me.restoreComponentState(component);

        me.restoreInfiniteScroll(component);

        //We need to update TimeAxisModel for layout fix #1334
        // component.getSchedulingView().timeAxisViewModel.update();

        // call template method
        me.exportConfig.afterExport && me.exportConfig.afterExport(component);
    },


    saveComponentState : function (component) {
        component           = component || this.getComponent();

        var me              = this,
            schedulerView   = component.getSchedulingView(),
            normalGrid      = component.normalGrid,
            lockedGrid      = component.lockedGrid;

        var columns = [];

        lockedGrid.headerCt.items.each(function (column) {
            columns.push({
                column : column,
                visible : !column.isHidden()
            });
        });

        var timeAxisViewModel = schedulerView.timeAxisViewModel;

        // Store original tick width for the case described in #1624
        var originalTickWidth = timeAxisViewModel.originalTickWidth;
        // At the same time fix tick width so export would not change it
        var tickWidth = timeAxisViewModel.getTickWidth();
        timeAxisViewModel.setTickWidth(tickWidth, true);

        //values needed to restore original size/dates of component
        me.restoreSettings    = {
            width               : component.getWidth(),
            height              : component.getHeight(),
            rowHeight           : timeAxisViewModel.getViewRowHeight(),
            originalTickWidth   : originalTickWidth,
            columnWidth         : tickWidth,
            startDate           : component.getStart(),
            endDate             : component.getEnd(),
            normalWidth         : normalGrid.getWidth(),
            normalLeft          : normalGrid.getEl().getStyle('left'),
            lockedWidth         : lockedGrid.getWidth(),
            lockedCollapse      : lockedGrid.collapsed,
            normalCollapse      : normalGrid.collapsed,
            columns             : columns,
            autoAdjust          : component.timeAxis.autoAdjust,
            suppressFit         : timeAxisViewModel.suppressFit,
            startIndex          : schedulerView.all.startIndex,

            lockedScrollX       : me.lockedView.getScrollX(),
            normalScrollX       : schedulerView.getScrollX(),
            scrollY             : schedulerView.getVerticalScroll()
        };
    },

    restoreComponentState : function (component) {
        var me      = this;

        component   = component || me.getComponent();

        var config  = me.restoreSettings,
            view    = component.getSchedulingView();

        component.timeAxis.autoAdjust = config.autoAdjust;

        component.normalGrid.show();

        component.setWidth(config.width);
        component.setHeight(config.height);
        component.setTimeSpan(config.startDate, config.endDate);
        component.setTimeColumnWidth(config.columnWidth, true);

        component.setRowHeight(config.rowHeight);

        // resote locked grid columns visibility
        Ext.Array.each(config.columns, function (item) {
            item.column.setVisible(item.visible);
        });

        component.lockedGrid.show();

        component.normalGrid.setWidth(config.normalWidth);
        component.normalGrid.getEl().setStyle('left', config.normalLeft);
        component.lockedGrid.setWidth(config.lockedWidth);
        view.timeAxisViewModel.suppressFit = config.suppressFit;
        view.timeAxisViewModel.setTickWidth(config.columnWidth);
        // restore original tick width value (#1624)
        view.timeAxisViewModel.originalTickWidth = config.originalTickWidth;

        if (config.lockedCollapse) {
            component.lockedGrid.collapse();
        }

        if (config.normalCollapse) {
            component.normalGrid.collapse();
        }

        // restore scroll position
        me.restoreComponentScroll(config);
    },

    restoreComponentScroll : function (restoreSettings) {
        var me = this;

        me.lockedView.setScrollX(restoreSettings.lockedScrollX);
        me.normalView.scrollTo(restoreSettings.normalScrollX, restoreSettings.scrollY);
    },

    /**
     * @private
     * Extracts the component content. On completion calls specified callback function providing an array of extracted pages as an argument.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} component Component content of which to be extracted
     * @param {Object} config Configuration object. May contain the following properties:
     * @param {String} config.format Page format
     * @param {String} config.orientation Page orientation (either `portrait` or `landscape`)
     * @param {String} config.range Range of the panel to be exported. Options are `complete`, `current`, `date`. When `date` is specified there also has to be specified next two configs.
     * @param {Date} config.dateFrom Range start date. Used only when `config.range` is `date`
     * @param {Date} config.dateTo Range end date. Used only when `config.range` is `date`
     * @param {Boolean} config.showHeader Flag saying that page numbers header has to be shown
     * @param {Function} callback Function which is called after extraction of pages has completed. The callback will have the following arguments:
     * @param {Function} callback.pages An array with extracted pages
     * @param {Object} [scope] Scope for the callback function
     */
    extractPages : function (component, config, callback, scope) {
        var me          = this;

        // <debug>
        if (!callback) {
            throw 'Sch.plugin.exporter.AbstractExporter: [extractPages] "callback" has to be provided.';
        }
        // </debug>

        // stop garbage collecting
        me.enableGarbageCollector  = Ext.enableGarbageCollector;
        Ext.enableGarbageCollector = false;
        Ext.dom.GarbageCollector.pause();

        // keep provided export config
        me.exportConfig = config;

        me.normalRows             = [];
        me.lockedRows             = [];
        me.extractedPages         = [];
        me.numberOfPages          = 0;
        me.lockedRowsHeight       = 0;
        me.normalRowsHeight       = 0;
        me.firstExportedRowOffset = 0;
        me.secondaryCanvasOffset  = 0;
        me._abort                 = false;
        me.stylesheets            = null;

        // calculates paper sizes based on provided parameters and DPI
        me.setPaperSize(config.pageSize, config.orientation);

        // stores references to the component, its elements and makes a backup of its pre-export state
        me.setComponent(component, config);

        // prepares component to exporting (applies provided timespan etc.)
        me.prepareComponent(component, config);

        me.callbacks        = {
            success : callback,
            scope   : scope || me
        };

        // fetch all component rows into temporary arrays
        // and call 'onRowsCollected' to collect them into pages and call 'onPagesExtracted' on completion
        me.collectRowsTimer = setTimeout(function () {
            me.collectRows(me._onRowsCollected, me, config);
        }, me.collectRowsTimerTimeout);
    },

    /**
     * @protected
     * Finishes exporting process. Restores the component to its initial state and returns extracted pages by calling a provided callback.
     * @param  {Object[]} [pages] Extracted pages. If omitted then will take collected pages from {@link #extractedPages} array.
     */
    onPagesExtracted : function (pages) {
        var me  = this;

        pages = me.renderPages(pages);

        // restore panel to initial state
        me.restoreComponent();
        // and return results
        me.submitPages(pages);
    },


    submitPages : function (pages) {
        var me          = this,
            callbacks   = me.callbacks;

        callbacks.success.call(callbacks.scope, pages);

        // resume garbage collecting
        Ext.enableGarbageCollector = me.enableGarbageCollector;
        Ext.dom.GarbageCollector.resume();
    },


    // returns an Ext.Element
    getCurrentPage : function () {
        return this.currentPage;
    },


    // page should be Ext.Element
    setCurrentPage : function (page) {
        this.currentPage = page;
    },


    getExpectedNumberOfPages : function () {
        throw 'Sch.plugin.exporter.AbstractExporter: [getExpectedNumberOfPages] Abstract method called.';
    },


    /**
     * @private
     * Commits a filled page. Pushes the page into {@link #extractedPages resulted set of pages}.
     * Calls {@link #preparePageToCommit} for the final page DOM tweaking.
     * @param [config] An optional configuration object. Will also be passed to {@link #preparePageToCommit} method.
     */
    commitPage : function (config) {

        var me      = this;

        me.numberOfPages++;

        var pageBody = me.preparePageToCommit(config);

        me.fireEvent('beforecommitpage', me, pageBody, me.numberOfPages, me.getExpectedNumberOfPages());

        var page    = Ext.apply({
            // include outerHTML to fix border style
            html    : pageBody.dom.outerHTML,
            number  : me.numberOfPages
        }, config);

        me.extractedPages.push(page);

        me.fireEvent('commitpage', me, page, me.numberOfPages, me.getExpectedNumberOfPages());
    },


    /**
     * @private
     * Collects the locked grid row.
     * @param {Element} item The locked grid row
     * @param {Ext.data.Model} recordIndex Index of the record corresponding to the row.
     * @param {Boolean} isLastRow True, when last rendered row is being collected
     * @return {Object} Object keeping reference to the cloned row element and its height.
     */
    collectLockedRow : function (item, recordIndex, isLastRow) {
        var el      = Ext.get(item),
            height  = el.getHeight() - (isLastRow ? el.getBorderWidth('b') : 0);

        this.lockedRowsHeight   += height;

        var result  = {
            height  : height,
            row     : item.cloneNode(true),
            record  : this.lockedView.getRecord(recordIndex)
        };

        this.lockedRows.push(result);

        return result;
    },

    /**
     * @private
     * Collects the normal grid row.
     * @param {Element} item The normal grid row
     * @param {Number} recordIndex Index of the record corresponding to the row.
     * @param {Boolean} isLastRow True, when last rendered row is being collected
     * @return {Object} Object keeping reference to the cloned row element and its height.
     */
    collectNormalRow : function (item, recordIndex, isLastRow) {
        var el      = Ext.get(item),
            height  = el.getHeight() - (isLastRow ? el.getBorderWidth('b') : 0);

        this.normalRowsHeight   += height;

        var result  = {
            height  : height,
            row     : item.cloneNode(true),
            record  : this.normalView.getRecord(recordIndex)
        };

        this.normalRows.push(result);

        // if there is a dependency view
        // once row is collected let's remember related events coordinates to be able to render dependencies properly
        if (this.depView && this.depView.getDependencyStore()) {
            this.fillRecordRelatedBoxes(result.record);
        }

        return result;
    },

    _onRowsCollected : function () {
        var me      = this,
            depView = me.depView;

        // if there is a dependency view
        if (depView && depView.getDependencyStore()) {
            me.renderDependencies();
        }

        me.onRowsCollected.apply(me, arguments);
    },

    onRowsCollected : function () {
        throw 'Sch.plugin.exporter.AbstractExporter: [onRowsCollected] Abstract method called.';
    },

    _abort : false,

    abort : function () {
        this._abort = function () {
            this.restoreComponent();
        };
    },

    /**
     * @private
     * Iterates by calling provided function asynchronously with a delay.
     * The delay duration is specified by {@link #iterateTimeout} config.
     * @param  {Function} fn    Function implementing a single iteration step.
     * @param  {Function} fn.next Callback function to be called to run the next iteration step.
     * This will cause `fn` function launch. All arguments passed to {@link #fn.next} will be transfered to {@link #fn}.
     * @param  {[type]}   [scope] Scope for the callback function
     */
    iterateAsync : function (fn, scope) {
        var me      = this;

        scope       = scope || me;

        var next    = function () {
            var args    = arguments;

            // run iteration step asynchronously w/ delay
            me.timer2 = setTimeout(function() {
                !me._abort ? fn.apply(scope, [].concat.apply([ next ], args)) : me._abort();
            }, me.iterateTimeout);

        };

        next.apply(me, Ext.Array.slice(arguments, 2));
    },

    callAsync : function (fn, scope) {
        scope = scope || this;

        this.timer1 = setTimeout(function() {
            fn.apply(scope, Ext.Array.slice(arguments, 2));
        }, this.iterateTimeout);
    },

    canStartRowsCollecting : function () {
        var cmp     = this.getComponent(),
            depView = cmp.getDependencyView();

        // if we have dependency view we need to have its canvas rendered before we start collecting rows
        return !depView || depView.getDependencyCanvas();
    },

    depViewRefreshBlocker : function () {
        return false;
    },

    /**
     * @private
     * Collects rows from the component. Launches the provided callback and passes collected rows as its arguments.
     * @param callback {Function} The callback function when extraction of rows has finished.
     */
    collectRows : function (callback, scope, config) {
        var me              = this,
            startIndex      = 0;

        // check if we're ready for rows collecting
        if (!me.canStartRowsCollecting()) {
            var args = Ext.Array.slice(arguments, 0);

            me.collectRowsTimer = setTimeout(function () {
                me.collectRows.apply(me, args);
            }, me.collectRowsTimerTimeout);

            return;
        }

        var depView = me.getComponent().getDependencyView();

        // if we have dependency view onboard
        // stop real dependency painter to not interfere, since we're gonna use the copy of it
        if (me.depView) {
            me.depViewBeforeRefreshDetacher = depView.on({
                beforerefresh : me.depViewRefreshBlocker,
                destroyable   : true
            });
        }

        var needToScroll = me.isBuffered();

        // if rows to extract range is provided
        if (config.rowsRange) {
            // we know for sure index to start from
            startIndex = config.rowsRange[0];
            // if the range is inside the set of currently rendered rows we don't need to scroll
            needToScroll = !(config.rowsRange[0] >= me.view.all.startIndex && config.rowsRange[1] <= me.view.all.endIndex);
        }

        if (needToScroll) {
            // scroll to start index before rows collecting
            me.scrollToTimer = setTimeout(function () {
                me.scrollTo(startIndex, function () {
                    // fill firstExportedRowOffset value ..used to shift the secondary canvas vertically from page to page
                    startIndex && me.initFirstExportedRowOffset(startIndex);

                    me.iterateAsync(me.collectRowsStep, me, startIndex, callback, scope, config);
                });
            }, 1);

        } else {
            // fill firstExportedRowOffset value ..used to shift the secondary canvas vertically from page to page
            startIndex && me.initFirstExportedRowOffset(startIndex);

            me.collectRowsStepTimer = setTimeout(function () {
                me.collectRowsStep(null, startIndex, callback, scope, config);
            }, 1);
        }
    },


    initFirstExportedRowOffset : function (firstExportedRowIndex) {
        this.firstExportedRowOffset = this.view.el.getScrollTop() - this.view.el.getTop() + Ext.fly(this.view.getNode(firstExportedRowIndex)).getTop();
    },


    isRowVisible : function (rowNode, visibleBox) {
        var nodeEl        = Ext.fly(rowNode),
            nodeTop       = nodeEl.getTop(),
            nodeHeight    = nodeEl.getHeight(),
            nodeBottom    = nodeTop + nodeHeight,
            nodeThreshold = (1 - this.getRowVisibilityThreshold()) * nodeHeight;

        return nodeTop + nodeThreshold > visibleBox.top &&
            nodeBottom - nodeThreshold < visibleBox.bottom;
    },


    collectRowsStep : function (next, startIndex, callback, scope, config) {
        var me              = this,
            endIndex        = me.normalView.all.endIndex,
            count           = me.component.store.getCount(),
            rowsRange       = config.rowsRange,
            normalRows      = me.normalView.all.slice(startIndex),
            lockedRows      = me.lockedView.all.slice(startIndex),
            i               = 0;

        var lastIndex;

        // If we collect only visible rows
        if (rowsRange) {
            lastIndex = rowsRange[1];
        }

        var collected = false;

        for (var index = startIndex, l = normalRows.length; i < l; i++) {
            if (index > lastIndex) {
                collected = true;
                break;
            }

            // All default themes have special style for last row in the view, making bottom border 1px high.
            // When collecting rows, that may lead to dependency view getting placed incorrectly. We normalize
            // collected row height if
            lockedRows[i] && me.collectLockedRow(lockedRows[i], index, i + 1 === l);
            me.collectNormalRow(normalRows[i], index, i + 1 === l);

            index++;
        }


        me.fireEvent('collectrows', me, startIndex, index, count);


        // if we are in the buffered mode (and not collected all the requested rows yet)
        // we need to scroll further
        if (!collected && me.isBuffered()) {

            if (endIndex + 1 < count) {
                me.callAsync(function () {
                    me.scrollTo(endIndex + 1, function () {
                        next(endIndex + 1, callback, scope, config);
                    });
                });

            } else {
                me.callAsync(function () {
                    me.scrollTo(0, function () {
                        callback.call(scope || me, me.lockedRows, me.normalRows);
                    });
                });
            }

        // if we already collected all the needed rows - invoke the final step
        } else {
            callback.call(scope || me, me.lockedRows, me.normalRows);
        }
    },

    /**
     * @private
     * Fills extracted pages `html` property before submitting them.
     * @param  {Array} [pages] Array of pages. By default {@link #extractedPages} is used.
     * @return {Array} Array of pages.
     */
    renderPages : function (pages) {
        var me  = this;

        pages   = pages || me.extractedPages;

        for (var i = 0, l = pages.length; i < l; i++) {
            var page    = pages[i];
            page.html   = me.applyPageTpl(page);
        }

        return pages;
    },

    /**
     * @private
     * Builds HTML content of the page by applying provided page data to the {@link #tpl page template}.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {String}          HTML content of the page.
     */
    applyPageTpl : function (pageInfo) {
        var me  = this;
        return me.getTpl().apply(me.getPageTplData(pageInfo));
    },

    /**
     * @private
     * Builds HTML content of the page header by applying provided page data to the {@link #headerTpl header template}.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {String}          HTML content of the header.
     */
    applyHeaderTpl : function (pageInfo) {
        var me          = this,
            headerTpl   = me.getHeaderTpl();

        if (me.exportConfig.showHeader && headerTpl) {
            // if function was provided to alter tpl data
            var fn          = me.headerTplDataFn;
            var alterData   = fn && fn.call(me.headerTplDataFnScope || me, pageInfo);
            var headerHtml  =  headerTpl.apply(Ext.apply(me.getHeaderTplData(pageInfo), alterData));

            // Now make sure any header IMG URLs are absolute
            var div = document.createElement('div');

            div.innerHTML = headerHtml;

            Ext.fly(div).select('img').each(function (img) {
                img.dom.setAttribute('src', img.dom.src);
            });

            return div.innerHTML;
        }

        return '';
    },

    /**
     * @private
     * Builds HTML content of the page footer by applying provided page data to the {@link #footerTpl footer template}.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {String}          HTML content of the footer.
     */
    applyFooterTpl : function (pageInfo) {
        var me          = this,
            footerTpl   = me.getFooterTpl();

        if (me.exportConfig.showFooter && footerTpl) {
            // if function was provided to alter tpl data
            var fn          = me.footerTplDataFn;
            var alterData   = fn && fn.call(me.footerTplDataFnScope || me, pageInfo);
            var footerHtml  = footerTpl.apply(Ext.apply(me.getFooterTplData(pageInfo), alterData));

            // Now make sure any footer IMG URLs are absolute
            var div = document.createElement('div');

            div.innerHTML = footerHtml;

            Ext.fly(div).select('img').each(function (img) {
                img.dom.setAttribute('src', img.dom.src);
            });

            return div.innerHTML;
        }

        return '';
    },

    /**
     * @protected
     * Function to provide data for the {@link #headerTpl} template.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {Object} The template data:
     * @return {Number} return.width width of the page header (page width)
     * @return {Number} return.height height of the page header
     * @return {Number} return.totalPages total number of pages
     * @return {Number} return.pageNo the page number
     */
    getHeaderTplData : function (pageInfo) {
        var me  = this;

        return {
            width       : me.paperWidth,
            height      : me.headerHeight,
            totalPages  : me.numberOfPages,
            pageNo      : pageInfo.number
        };
    },

    /**
     * @protected
     * Function to provide data for the {@link #footerTpl} template.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {Object} The template data:
     * @return {Number} return.width width of the page footer (page width)
     * @return {Number} return.height height of the page footer
     * @return {Number} return.totalPages total number of pages
     * @return {Number} return.pageNo the page number
     */
    getFooterTplData : function (pageInfo) {
        var me  = this;

        return {
            width       : me.paperWidth,
            height      : me.footerHeight,
            totalPages  : me.numberOfPages,
            pageNo      : pageInfo.number
        };
    },

    /**
     * @private
     * Provides data to be applied to the {@link #tpl page template}.
     * @param  {Object} pageInfo Page data:
     * @param  {Object} pageInfo.html HTML code of the page
     * @param  {Object} pageInfo.number page number
     * @return {Object}      Data to be applied to the {@link #tpl page template}:
     * @return {String} return.bodyClasses         copied BODY element CSS classes
     * @return {String} return.bodyHeight          height of the HTML content of the extracted page
     * @return {String} return.componentClasses    copied the component element CSS classes
     * @return {String} return.styles              stylesheet links
     * @return {String} return.showHeader          `true` if the header has to be shown
     * @return {String} return.showFooter          `true` if the footer has to be shown
     * @return {String} return.header              the header content
     * @return {String} return.HTML                HTML content of the extracted page
     * @return {String} return.footer              the footer content
     * @return {String} return.totalWidth          the page width
     * @return {String} return.pageNo              the page number
     * @return {String} return.totalPages          total number of pages
     * @return {String} return.title               the page title
     */
    getPageTplData : function (pageInfo) {
        var me  = this;

        return {
            id                  : me.getComponent().id,
            bodyClasses         : me.getBodyClasses(),
            bodyHeight          : me.printHeight + me.gridHeaderHeight,
            componentClasses    : me.getComponentClasses(),
            styles              : me.stylesheets,
            showHeader          : me.exportConfig.showHeader,
            showFooter          : me.exportConfig.showFooter,
            header              : me.applyHeaderTpl(pageInfo),
            HTML                : pageInfo.html,
            footer              : me.applyFooterTpl(pageInfo),
            totalWidth          : me.paperWidth,
            pageNo              : pageInfo.number,
            totalPages          : me.numberOfPages,
            title               : pageInfo.number + ' of ' + me.numberOfPages
        };
    },

    /**
     * @private
     * Resizes the component to fit it into specified paper size, export settings etc. (depending on implemented pagination rules).
     */
    fitComponentIntoPage : Ext.emptyFn,

    /**
     * @private
     * Function that retrieves the table body of the locked grid.
     * @param {Ext.dom.Element} [element] The fragment root for the selector. Defaults to current page.
     * @return {HTMLElement} Table body element of the locked grid.
     */
    getLockedGridBody : function (element) {
        element    = element || this.getCurrentPage();

        return element.down(this.lockedBodySelector + ' ' + this.tableSelector, true);
    },

    /**
     * @private
     * Retrieves the table body of the normal grid.
     * @param {Ext.dom.Element} [element] The root element to retrieve from. Defaults to current page.
     * @return {HTMLElement} Table body element of the normal grid.
     */
    getNormalGridBody : function (element) {
        element = element || this.getCurrentPage();

        return element.down(this.normalBodySelector + ' ' + this.tableSelector, true);
    },


    emptyLockedGrid : function (element) {
        Ext.fly(this.getLockedGridBody(element)).select(this.lockedView.getItemSelector()).remove();
    },


    fillGrids : function (lockedRows, normalRows, clone, append) {
        var me  = this;

        me.fillLockedGrid(lockedRows, clone, append);
        me.fillNormalGrid(normalRows, clone, append);
    },


    fillLockedGrid : function (rows, clone, append) {
        var me  = this;
        if (!append) me.emptyLockedGrid();

        me.appendRows(me.getLockedGridBody(), rows || me.lockedRows, clone);
    },


    fillNormalGrid : function (rows, clone, append) {
        var me  = this;
        if (!append) me.emptyNormalGrid();

        me.appendRows(me.getNormalGridBody(), rows || me.normalRows, clone);
    },


    appendRows : function (domNode, children, clone) {

        for (var i = 0, l = children.length; i < l; i++) {
            domNode.appendChild(clone ? children[i].row.cloneNode(true) : children[i].row);
        }
    },


    emptyNormalGrid : function (element) {
        Ext.fly(this.getNormalGridBody(element)).select(this.normalView.getItemSelector()).remove();
    },


    getRowHeight : function () {
        return this.view.timeAxisViewModel.getViewRowHeight();
    },


    /**
     * @private
     * Returns full width and height of both grids.
     * @return {Object} Object containing `width` and `height` properties.
     */
    getTotalSize : function() {
        return {
            width   : this.getTotalWidth(),
            height  : this.getTotalHeight()
        };
    },

    /**
     * @private
     * Returns full height of the component.
     * @return {Number} Full height of the component.
     */
    getTotalHeight : function () {
        var me  = this,
            viewHeight;

        if (me.isBuffered()) {
            viewHeight  = me.bufferedHeightMargin + me.normalRowsHeight;
        } else {
            viewHeight  = me.lockedView.getEl().down(me.tableSelector).getHeight();
        }

        return me.headerHeight + viewHeight;
    },

    /**
     * @private
     * Returns full width of the component.
     * @return {Number} Full width of both grids.
     */
    getTotalWidth : function () {
        var splitWidth;

        // https://www.sencha.com/forum/showthread.php?332079-Split-config-is-set-on-locked-part-of-grid-not-owner-grid
        if (Ext.getVersion().isGreaterThan('6.2.0')) {
            splitWidth = this.component.lockedGrid.split ? this.component.down('splitter').getWidth() : 0;
        } else {
            splitWidth = this.component.split ? this.component.down('splitter').getWidth() : 0;
        }

        return this.getLockedGridWidth() + splitWidth + this.normalView.getEl().down(this.tableSelector).getWidth();
    },


    getLockedGridWidth : function () {
        var columns = this.exportConfig.columns;
        // #4816
        // If empty column set is exported, 0 should be returned, otherwise empty space will appear
        // in the normal view
        if (columns && columns.length === 0) {
            return 0;
        }
        return this.lockedHeader.getEl().down('.' + Ext.baseCSSPrefix + 'box-inner').getWidth();
    },


    getNormalGridWidth : function () {
        return this.normalHeader.getEl().down('.' + Ext.baseCSSPrefix + 'box-inner').getWidth();
    },


    /**
     * @private
     * Performs last changes to {@link #getCurrentPage the current page} being extracted before it's pushed into {@link #extractedPages} array.
     * @param {Object} [config] Optional configuration object.
     * @return {Ext.dom.Element} element Element holding the page.
     */
    preparePageToCommit : function (config) {
        //create empty div that will temporarily hold our panel current HTML
        var frag        = this.getCurrentPage(),
            component   = this.component,
            lockedGrid  = component.lockedGrid,
            normalGrid  = component.normalGrid,
            secondaryCanvas = frag.down('.sch-secondary-canvas', true);

        frag.select('.sch-remove').remove();

        var get             = function (id) { return frag.down('#' + id, true); },
            elapseWidth     = function (el) { if (el) el.style.width  = '100%'; },
            elapseHeight    = function (el) { if (el) el.style.height = '100%'; };

        var normalBody          = frag.down(this.normalBodySelector, true);
        normalBody.style.top    = '0px';

        var lockedBody          = frag.down(this.lockedBodySelector, true);
        lockedBody.style.top    = '0px';

        // remove transform:translate3d(...) from views item container element
        // otherwise it might mess top coordinate of the exported rows (checked in: 015_export_current_view)

        var lockedItemsContainer = this.getLockedGridBody(),
            normaItemsContainer  = this.getNormalGridBody();

        if (lockedItemsContainer) lockedItemsContainer.style.transform = '';
        if (normaItemsContainer) normaItemsContainer.style.transform = '';

        if (secondaryCanvas) {
            secondaryCanvas.style.top = this.secondaryCanvasOffset + 'px';
            Ext.fly(secondaryCanvas).select('.sch-column-line').setHeight(this.normalRowsHeight);
        }

        // we elapse some elements width and/or height

        var lockedElements  = [
            get(component.id + '-targetEl'),
            get(component.id + '-innerCt'),
            get(lockedGrid.id),
            get(lockedGrid.body.id),
            get(lockedGrid.view.el.id)
        ];

        // https://www.sencha.com/forum/showthread.php?332055-Hiding-normal-grid-messes-locked-part
        if (Ext.getVersion().isGreaterThan('6.2.0')) {
            var basePrefix = '.' + Ext.baseCSSPrefix;

            var scrollContainer = frag.down(basePrefix + 'grid-scroll-container', true);
            scrollContainer.style.top = this.gridHeaderHeight + 1 + 'px';
            scrollContainer.style.left = 0;
            elapseHeight(scrollContainer);
            elapseWidth(scrollContainer);

            // Set height of scroll body to 100% and hide vertical scrollbar
            // covered by 005_export_rows_horizontal
            var scrollBody = frag.down(basePrefix + 'grid-scroll-body', true);
            elapseHeight(scrollBody);
            scrollBody.style['overflow-y'] = 'hidden';

            // make views to fit container
            Ext.Array.each(frag.query(basePrefix + 'grid-view', true), function (el) {
                elapseHeight(el);
            });

            // remove margin so last row is displayed correctly
            lockedBody.style.margin = normalBody.style.margin = 0;
            // remove spacers, so height could be calculated correctly in test
            Ext.Array.each(frag.query(basePrefix + 'grid-scroll-container ' + basePrefix + 'scroller-spacer', true), function (el) {
                el.parentNode.removeChild(el);
            });

            // https://app.assembla.com/spaces/bryntum/tickets/3648
            // Set zindex to force splitter visibility
            var splitter = frag.down('.' + Ext.baseCSSPrefix + 'splitter', true);
            if (splitter) {
                Ext.fly(splitter).setZIndex(2);
            }
        }

        Ext.Array.each(lockedElements, elapseHeight);

        elapseWidth(lockedElements[0]);
        elapseWidth(lockedElements[1]);

        if (Ext.isIE) {
            var el = get(normalGrid.headerCt.id);

            if (el) el.style.width = '';
        }
        else {
            elapseWidth(get(normalGrid.headerCt.id));
        }

        Ext.Array.each([
            get(normalGrid.id),
            get(normalGrid.body.id),
            get(normalGrid.getView().id)
        ], function(el) {
            if (el) {
                el.style.height = el.style.width = '100%';
            }
        });

        // adjust body style to fit to content properly
        frag.dom.style.height = '100%';
        frag.dom.style.width = '';
        // remove top position since we are not exporting panel title
        frag.dom.style.top = '';

        return frag;
    },

    /**
     * @private
     * Starts a new page. Initializes {@link #currentPage} with a copy of the component that will
     * be filled with collected rows based on implemented pagination rules.
     * @param  {Ext.dom.Element} [pageEl] Element to make a copy of. This is optional by default will make a copy of {@link #getComponent the component}.
     */
    startPage : function (pageEl) {
        var me      = this;

        // make a detached copy of the component body
        var copy    = (pageEl || me.getComponent().body).dom.cloneNode(true);
        copy.id = '';

        // and put it into storedFragment
        me.setCurrentPage(Ext.get(copy));
    },

    scrollTo : function (position, callback, scope) {
        var me = this;

        var record = me.component.store.getAt(position);

        if (record) {
            me.component.ensureVisible(record, {

                callback : function () {

                    //https://app.assembla.com/spaces/bryntum/tickets/6629-exporter-collectnormalrow-and-collectlockedrows-throw-exception/details
                    me.component.syncRowHeights();

                    if (callback) {
                        callback.apply(scope || me);
                    }
                },
                select   : false,
                focus    : false,
                animate  : false
            });
        }
        else {
            callback.apply(scope || me);
        }

    },

    removeNode : function (el) {
        if (el && el.parentNode) {
            el.parentNode.removeChild(el);
        }
        else {
            if (el.elements) {

                for (var i = 0; i < el.elements.length; i++) {
                    var elem = el.elements[i];
                    elem.parentNode.removeChild(elem);
                }

            }
        }
    },

    //private
    restoreInfiniteScroll : function (panel) {

        var view = panel.getSchedulingView();

        if (panel.infiniteScroll && view.rendered) {

            // restore saved time span and scroll position
            panel.timeAxis.setTimeSpan(this._oldStart, this._oldEnd);
            view.setScrollX(this._oldScrollX);

            // enable back infiniteScroll mode event listeners
            view.bindInfiniteScrollListeners();
        }
    },

    //private
    suspendInfiniteScroll : function (panel) {

        var view = panel.getSchedulingView();

        // unbind events reacting on scroll specific to infiniteScroll mode
        if (panel.infiniteScroll && view.rendered) {

            view.unbindInfiniteScrollListeners();

            // remember current time span and scroll position
            this._oldStart      = panel.timeAxis.getStart();
            this._oldEnd        = panel.timeAxis.getEnd();
            this._oldScrollX    = view.getScrollX();

            var span = panel.getEventStore().getTotalTimeSpan();
            panel.setTimeSpan(span.start, span.end);
        }
    },

    dependencyPainterMembers : {

        getItemBox : function (primaryView, task) {
            var me  = this,
                box = me.exporter.eventBoxes[task.internalId];

            return box || this.callParent(arguments);
        }

    },

    // Cretes a copy of the component dependency painter
    // that we're gonna use instead of the component's one
    initDependencyPainter : function (component) {
        var me      = this,
            depView = component.getDependencyView();

        // if there is a dependency view
        if (depView) {
            // clone real painter
            me.dependencyPainter = depView.clonePainter();

            // and override its "exporter" property and "getItemBox" method
            Ext.override(me.dependencyPainter, Ext.apply({}, { exporter : me }, me.dependencyPainterMembers));
        }

        me.depView    = depView;

        me.eventBoxes = {};
    },


    fillRecordRelatedBoxes : function (record) {
        var me              = this,
            view            = me.normalView,
            painter         = me.depView.painter,
            dependencyStore = me.depView.getDependencyStore();

        var events = record.getEvents();

        for (var j = 0; j < events.length; j++) {
            var task = events[j];

            // Ignore events that does not belong to timeaxis
            if (view.timeAxis.isRangeInAxis(task) && dependencyStore.getEventDependencies(task).length) {

                var box = painter.getItemBox(view, task);

                for (var i = 0; i < box.length; i++) {
                    // WARNING view.bufferedRenderer.bodyTop is private
                    // dependency painter doesn't take bufferedRenderer.bodyTop into account
                    // but we need to do it
                    if (view.bufferedRenderer) {
                        box[i].top += view.bufferedRenderer.bodyTop;
                        box[i].bottom += view.bufferedRenderer.bodyTop;
                    }
                    // we want all tasks to be considered as visible
                    box[i].rendered = true;
                }

                me.eventBoxes[task.internalId] = box;
            }
        }
    },


    renderDependencies : function () {
        var me      = this,
            depView = me.depView;

        if (depView.getDrawDependencies()) {
            me.dependenciesHtml = me.dependencyPainter.generatePaintMarkup(depView.getPrimaryView(), depView.getDependencyStore().getRange());
        } else {
            me.dependenciesHtml = '';
        }
    }

});
