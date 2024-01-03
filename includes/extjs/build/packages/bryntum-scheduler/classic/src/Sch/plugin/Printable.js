/**
@class Sch.plugin.Printable
@extends Sch.plugin.Export

Plugin (ptype = 'scheduler_printable') printing an Ext Scheduler instance. To use this plugin, add it to the scheduler as a usual plugin. The plugin will add an additional `print` method to the scheduler.

Please note that this plugin may in some cases not generate a perfect picture for example in Firefox, due to various limitations in the browsers print implementation.
If you require a high quality print in that case, you should use the Export plugin instead and first export to PDF. Chrome, IE10+ will give the best results.

The print plugin will open a print dialog. In the dialog there is a DPI field. The DPI (dots per inch) is a ratio how many browser pixels correspond to a `paper` inch.
The default is set on 72 dots. Depending on the screen resolution, this value can be increased or decreased.
Run some test prints, and adjust the DPI until the generated pages fit the print paper nicely.

* **Note** that the print feature is currently not supported if your store is buffered.

In the browser print settings the `Background Graphics` option should be set to on.

    var scheduler = Ext.create('Sch.panel.SchedulerGrid', {
        ...

        resourceStore   : resourceStore,
        eventStore      : eventStore,

        plugins         : [
            Ext.create('Sch.plugin.Printable', {
                // default values
                docType             : '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">',
                autoPrintAndClose   : true
            })
        ]
    });

    ...

    scheduler.print();

In the opened print window, a special 'sch-print-body' CSS class will be added to the BODY element. You can use this to
further customize the printed contents.

 */
Ext.define('Sch.plugin.Printable', {

    extend                : 'Sch.plugin.Export',

    requires              : [
        'Ext.XTemplate',
        'Ext.window.Toast'
    ],

    alternateClassName    : ['Sch.plugin.Print'],

    alias                 : [
        'plugin.scheduler_printable',
        'plugin.scheduler_print'
    ],

    /**
     * @cfg {String} docType This is the DOCTYPE to use for the print window. It should be the same DOCTYPE as on your application page.
     */
    docType               : '<!DOCTYPE HTML>',

    /**
     * An empty function by default, but provided so that you can perform a custom action
     * before the print plugin extracts data from the scheduler.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} scheduler The scheduler instance
     * @method beforePrint
     */
    beforePrint           : function (){},

    /**
     * An empty function by default, but provided so that you can perform a custom action
     * after the print plugin has extracted the data from the scheduler.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} scheduler The scheduler instance
     * @method afterPrint
     */
    afterPrint            : function (){},

    exportDialogConfig    : {
        showDPIField      : true
    },

    /**
     * @cfg {Boolean} removeSecondaryCanvas set to true to remove columnlines
     */
    removeSecondaryCanvas : false,

    /**
     * @cfg {Boolean} wrapHeaders set to true to wrap the headers with a sch-print-header-wrap cls class for additional markup.
     */
    wrapHeaders           : false,

    /**
     * @cfg {Boolean} autoPrintAndClose True to automatically call print and close the new window after printing. Default value is `true`
     */
    autoPrintAndClose     : true,

    // private, the template for the new windowfg
    mainTpl               : '{docType}' +
        '<html class="' + Ext.baseCSSPrefix + 'border-box {htmlClasses}">' +
            '<head>' +
            '<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />' +
            '<title>{title}</title>' +
            '{styles}' +
            '</head>' +
        '<body class="sch-print-body {bodyClasses}">' +

            '<div class="sch-print-ct" style="width:{totalWidth}px">' +
            '<tpl for="pages">{html}</tpl>' +
            '</div>' +

            '<script type="text/javascript">' +
            '{setupScript}' +
            '</script>' +

        '</body>' +
        '</html>',

    pageTpl               : '{header}' +
        '<div id="{id}" class="{componentClasses}" style="height:{bodyHeight}px; width:{totalWidth}px; position: relative !important">{HTML}</div>' +
        '{footer}' +
        '<div style="page-break-after:always;"></div>',

    // Script executed in the newly open window, to automatically invoke window.print()
    setupScriptTpl        : "window.onload = function(){ "+
            "document._loaded  = true;"+
            "if ({autoPrintAndClose}) {"+
                "window.print();"+
                "if (!{isChrome}) window.close();"+
            "}"+
        '}',


    openAfterExport       : false,

    DPI                   : 72,

    /**
     * @cfg {Boolean} fakeBackgroundColor True to reset background-color of events and enable use of border-width to fake background color (borders print by default in every browser).
     */
    fakeBackgroundColor   : false,

    // This method is not used and doesn't make any sense for the print feature so it's overridden with an empty function
    doRequest             : function (){},

    constructor : function (config) {
        Ext.apply(this, config);

        if (!this.mainTpl.isTemplate) {
            this.mainTpl = new Ext.XTemplate(this.mainTpl);
        }

        this.callParent(arguments);

        this.exportDialogConfig = Ext.applyIf({
            l10n  : {
                title            : this.L('dialogTitle'),
                exportButtonText : this.L('exportButtonText')
            }
        }, this.exportDialogConfig);

    },

    init : function (scheduler) {
        var me = this;

        // decorate scheduler with "print" method
        scheduler.print = Ext.Function.bind(me.print, me);

        me.scheduler = scheduler;
    },

    showPopupBlockedMessage : function () {
        Ext.toast(this.getPopupBlockedMessageConfig());
    },

    getPopupBlockedMessageConfig : function () {
        return {
            html           : this.L('disablePopupBlocking'),
            title          : this.L('popupBlockerDetected'),
            autoCloseDelay : 5000
        };
    },

    getExporterConfig : function (className, config) {
        var me      = this,
            result  = me.callParent(arguments);

        return Ext.apply(result, {
            tpl : me.pageTpl
        });
    },


    getExportConfig : function (config) {
        var me      = this,
            result  = me.callParent(arguments);

        return Ext.apply(result, {
            beforeExport : Ext.Function.bind(me.beforePrint, me),
            afterExport  : Ext.Function.bind(me.afterPrint, me)
        });
    },


    onPagesExtracted : function (pages, component, exporter, config) {
        this.fireEvent('progressupdate', 0.8, this.L('requestingPrintServer'));

        this.printPages(pages, component, exporter, config);
    },

    /**
     * Instantiates and shows the Print dialog (defined by {@link #exportDialogClassName} class and using the {@link #exportDialogConfig} config).
     * In the dialog allows a user to change the print settings.
     */
    print : function () {
       this.showExportDialog();
    },

    // Adds print cls
    onBeforePageCommit : function (exporter, pageBody, pageNumber, totalNumberOfPages) {
        var component  = this.scheduler,
            lockedGrid = component.lockedGrid,
            normalGrid = component.normalGrid,
            get        = function (s) { return pageBody.select('#' + s).first(); };

        var normalBody      = pageBody.select(exporter.normalBodySelector).first(),
            normalHeader    = get(normalGrid.headerCt.id),
            lockedBody      = pageBody.select(exporter.lockedBodySelector).first(),
            lockedHeader    = get(lockedGrid.headerCt.id);

        normalBody.addCls(['sch-print-normal-rows-ct', this.fakeBackgroundColor ? 'sch-print-fake-background' : '']);
        lockedBody.addCls('sch-print-locked-rows-ct');

        if (this.removeSecondaryCanvas) {
            pageBody.select('.sch-secondary-canvas').remove();
        }

        if (this.fakeBackgroundColor) {
            var events = normalBody.select(normalGrid.view.eventSelector);
            events.each(function (item) {
                item.setStyle('border-right-width', item.dom.style.width);
            });
        }

        normalHeader.addCls('sch-print-normalheader');
        lockedHeader.addCls('sch-print-lockedheader');

        if (this.wrapHeaders) {
            normalHeader.wrap('<div class="sch-print-header-wrap"></div>');
            lockedHeader.wrap('<div class="sch-print-header-wrap"></div>');
        }

        // When printing page in IE11 with high DPI (200), it may occur that header is located incorrectly.
        // Fill correct styles to make it behave nicely.
        if (Ext.isIE && normalGrid.bodyWrap) {
            var height = normalGrid.bodyWrap.getHeight();

            // Use fly here to avoid exception from Ext.cache
            Ext.fly(lockedHeader.el.dom.parentNode).setStyle({
                position: 'absolute',
                height  : height + 'px'
            });
            Ext.fly(normalHeader.el.dom.parentNode).setStyle({
                position: 'absolute',
                height  : height + 'px'
            });
        }
    },


    prepareMainTplData : function (data) {
        return data;
    },


    printPages : function (pages, component, exporter, config) {

        if (!this.mainTpl || !this.mainTpl.isTemplate) {
            this.mainTpl       = new Ext.XTemplate(this.mainTpl, {
                compiled       : true,
                disableFormats : true
            });
        }

        var styles = exporter.stylesheets,
            body   = document.body;

        var html        = this.mainTpl.apply(this.prepareMainTplData({
            docType     : this.docType,
            htmlClasses : body.parentNode.className,
            bodyClasses : body.className,
            title       : component.title || '',
            styles      : styles,
            totalWidth  : exporter.paperWidth,
            setupScript : this.setupScriptTpl.replace('{autoPrintAndClose}', this.autoPrintAndClose).replace('{isChrome}', Ext.isChrome),
            pages       : pages
        }));

        var win         = window.open('', 'printgrid');

        // When popup is blocked there is a window but win.document is null
        if (!win || !win.document || win.closed || typeof win.closed === 'undefined') {
            this.showPopupBlockedMessage();
            return false;
        }


        // Assign to this for testability, need a reference to the opened window
        this.printWindow = win;

        win.document.write(html);
        win.document.close();

        this.onExportSuccess({ success : true, url : 'foo', htmlArray : [ html ] });
    },

    bindExporter : function (exporter) {
        var me  = this;

        me.callParent(arguments);

        me.mon(exporter, {
            beforecommitpage : me.onBeforePageCommit,
            scope            : me
        });
    },

    unbindExporter : function (exporter) {
        var me = this;

        me.callParent(arguments);

        me.mun(exporter, {
            beforecommitpage : me.onBeforePageCommit,
            scope            : me
        });
    }

});
