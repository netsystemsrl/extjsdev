/**
 * A plugin that generates PDF/PNG files out of the Scheduler panel.
 *
 * **NOTE:** This plugin will make an AJAX request to the server, POSTing
 * the HTML fragments to be exported. The {@link #printServer} URL must be configured.
 *
 * ##Configuring/usage
 *
 * To use this plugin, add it to your Scheduler as any other plugins. It's also required to have NodeJS server set and running.
 * The complete process of setting up the backend for the plugin can be found in the corresponding [guide](#!/guide/gantt_scheduler_export).
 *
 * **Note:** The export feature is currently not supported if your store is buffered.
 *
 * ```javascript
 * var panel = Ext.create('Sch.panel.SchedulerGrid', {
 *     plugins       : [
 *         {
 *             ptype       : 'scheduler_export',
 *             printServer : 'http://localhost:8080'
 *         }
 *     ],
 *     ...
 * });
 * ```
 *
 * The Scheduler instance will be extended with two new methods:
 *
 * - {@link #showExportDialog}, which shows export settings dialog
 *
 * ```javascript
 * panel.showExportDialog();
 * ```
 *
 * - {@link #doExport} which actually performs the export operation using {@link #exportConfig} or provided config object :
 *
 * ```javascript
 * panel.doExport({
 *     format      : "A5",
 *     orientation : "landscape",
 *     range       : "complete",
 *     showHeader  : true,
 *     id          : "singlepage"
 * });
 * ```
 *
 * ##Export options
 *
 * In the current state, the plugin gives few options to modify the look and feel of the generated PDF document (or the image) through a dialog window :
 *
 * {@img scheduler/images/export_dialog.png 2x}
 *
 * If no changes are made to the form, the {@link #exportConfig} will be used.
 *
 * ###Schedule range
 *
 * This setting controls the timespan visible on the exported document. The following options are available here :
 *
 * {@img scheduler/images/export_dialog_ranges.png 2x}
 *
 * ####Complete schedule
 *
 * Whole current timespan of the panel will be visible in the exported document.
 *
 * ####Complete schedule (for all events)
 *
 * The timespan will be adjusted to include all the events registered in the event store.
 *
 * ####Date range
 *
 * User can select the start and end dates visible on the exported document.
 *
 * {@img scheduler/images/export_dialog_ranges_date.png 2x}
 *
 * ####Visible schedule
 *
 * Timespan of the exported document/image will be set to the currently visible part of the time axis.
 *
 * ###Select columns
 *
 * This field allows to pick the locked grid columns to be exported:
 *
 * {@img scheduler/images/export_dialog_columns.png 2x}
 *
 * ###Rows range
 *
 * This setting controls rows to be included into the exported document. The following options are available here :
 *
 * {@img scheduler/images/export_dialog_row_ranges.png 2x}
 *
 *
 * ####All rows
 *
 * All the panel rows will be included (default mode).
 *
 * ####Visible rows
 *
 * Only currently visible part of rows will be included into the result document.
 *
 * ##Control pagination
 *
 * This field allows to pick an exporter implementing needed way of pagination. The default exporter is `Multi pages`.
 *
 * {@img scheduler/images/export_modes.png 2x}
 *
 * Options:
 *
 * - `Single page`. Creates an export that fits one single page.
 * - `Multi pages`. Creates an export that creates pages in both vertical and horizontal direction.
 * - `Multi pages (vertically)`. Creates an export that creates pages in vertical direction.
 *
 * ##Paper Format
 *
 * This combo gives control of the size of the generated document/image by choosing one from a list of supported ISO paper sizes : (`A5`, `A4`, `A3`, `Letter`). Default format is `A4`.
 *
 * {@img scheduler/images/export_dialog_format.png 2x}
 *
 * ###Orientation
 *
 * This setting defines the orientation of the generated document/image.
 *
 * {@img scheduler/images/export_dialog_orientation.png 2x}
 *
 * Default option is the `portrait` (vertical) orientation :
 *
 * {@img scheduler/images/export_dialog_portrait.png 2x}
 *
 * Second option is the `landscape` (horizontal) orientation :
 *
 * {@img scheduler/images/export_dialog_landscape.png 2x}
 *
 * ##DPI (dots per inch)
 *
 * This field controls the DPI value to use for paper format related calculations:
 *
 * {@img scheduler/images/export_dialog_dpi.png 2x}
 *
 * ##Show header
 *
 * This option allows to show a header to a page displaying the page number:
 *
 * {@img scheduler/images/export_show_header.png 2x}
 *
 * ##Custom export styling
 *
 * A special "sch-export" CSS class is added to the body of the exported pages so that you can have special
 * styles in your exported chart.
 *
 * [1]: http://www.phantomjs.org
 * [2]: http://www.imagemagick.org
 * [3]: https://bryntum.com/blog
 *
 */
Ext.define('Sch.plugin.Export', {
    extend                  : 'Ext.util.Observable',

    alternateClassName      : 'Sch.plugin.PdfExport',

    alias                   : 'plugin.scheduler_export',

    mixins                  : ['Ext.AbstractPlugin', 'Sch.mixin.Localizable'],

    requires        : [
        'Ext.XTemplate',
        'Sch.plugin.exporter.SinglePage',
        'Sch.plugin.exporter.MultiPage',
        'Sch.plugin.exporter.MultiPageVertical',
        'Sch.widget.ExportDialog'
    ],

    lockableScope           : 'top',

    /**
     * @cfg {Object} pageSizes
     * Definition of all available paper sizes.
     */
    pageSizes               : {
        A5      : {
            width   : 5.8,
            height  : 8.3
        },
        A4      : {
            width   : 8.3,
            height  : 11.7
        },
        A3      : {
            width   : 11.7,
            height  : 16.5
        },
        Letter  : {
            width   : 8.5,
            height  : 11
        },
        Legal   : {
            width   : 8.5,
            height  : 14
        }
    },

    /**
     * @cfg {Boolean}
     * enableWebSocket to use websockets for posting fragments to the export backend.
     */
    enableWebSocket         : false,

    /**
     * @cfg {Number} DPI
     * DPI (Dots per inch) resolution.
     */
    DPI                     : 95,

    /**
     * @cfg {String} printServer (required)
     * URL of the server responsible for running the export steps.
     */
    printServer             : undefined,


    /**
     * @cfg {Number}
     * The timeout in milliseconds to be used for print requests to server.
     */
    timeout                 : 60000,


    /**
     * @cfg headerTpl
     * @inheritdoc Sch.plugin.exporter.AbstractExporter
     * @localdoc See details on default value {@link Sch.plugin.exporter.AbstractExporter#headerTpl here}
     */
    headerTpl               : null,

    /**
     * @deprecated
     * @cfg {Function} headerTplDataFn
     * If defined provides data for the {@link #headerTpl}.
     * To define the scope please use {@link #headerTplDataFnScope}.
     * @return {Object} Header template data.
     */
    headerTplDataFn        : null,

    /**
     * @deprecated
     * @cfg {Object} headerTplDataFnScope Scope for the {@link #headerTplDataFn} function.
     */
    headerTplDataFnScope   : null,

    /**
     * @cfg {String} tpl
     * Template of extracted page.
     */
    tpl                     : null,

    /**
     * @cfg footerTpl
     * @inheritdoc Sch.plugin.exporter.AbstractExporter
     * @localdoc See details on default value {@link Sch.plugin.exporter.AbstractExporter#footerTpl here}
     */
    footerTpl               : null,

    /**
     * @deprecated
     * @cfg {Function} footerTplDataFn
     * If defined provides data for the {@link #footerTpl}.
     * To define the scope please use {@link #footerTplDataFnScope}.
     * @return {Object} Footer template data.
     */
    footerTplDataFn        : null,

    /**
     * @deprecated
     * @cfg {Object} footerTplDataFnScope Scope for the {@link #footerTplDataFn} function.
     */
    footerTplDataFnScope   : null,

    /**
     * @cfg {String}
     * Class name of the dialog used to change export settings.
     */
    exportDialogClassName   : 'Sch.widget.ExportDialog',

    /**
     * @cfg {Object}
     * Config object for the {@link #exportDialogClassName}. Use this to override default values for the export dialog.
     */
    exportDialogConfig      : {},

    /**
     * @cfg {Object}
     * Config object to apply to each {@link Sch.plugin.exporter.AbstractExporter exporter} being registered.
     */
    exporterConfig          : null,

    /**
     * @cfg {Object}
     * Default export configuration.
     */
    exportConfig           : {
        format      : 'A4',
        orientation : 'portrait',
        range       : 'complete',
        rowsRange   : 'all',
        showHeader  : true,
        showFooter  : false
    },

    /**
     * @cfg {Boolean} expandAllBeforeExport Only applicable for tree views, set to true to do a full expand prior to the export. Defaults to false.
     */
    expandAllBeforeExport   : false,

    /**
     * @cfg {Boolean|String} translateURLsToAbsolute `True` to replace all linked CSS files URLs to absolute before passing HTML to the server.
     * When passing a string the current origin of the CSS files URLS will be replaced by the passed origin.
     *
     * For example: css files pointing to ../../app.css will be translated from current origin to {translateURLsToAbsolute}/app.css
     */
    translateURLsToAbsolute : true,

    /**
     * @cfg {Boolean}
     * If set to true, open new window with the generated document after the operation has finished.
     */
    openAfterExport         : true,

    /**
     * @cfg {Boolean}
     * If set to true, a new tab will be opened. This is useful when need to show a preview page instead of downloading the file and keep the original tab opened.
     *
     * **Note:** To show a preview page Server should be configured with inline Content-Disposition header.
     */
    openInNewTab            : false,

    /**
     * An empty function by default, but provided so that you can perform a custom action
     * before the export plugin extracts data from the scheduler.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} scheduler The scheduler instance
     * @param {Object[]} ticks The ticks gathered by plugin to export.
     * @template
     * @method beforeExport
     */
    beforeExport            : Ext.emptyFn,

    /**
     * An empty function by default, but provided so that you can perform a custom action
     * after the export plugin has extracted the data from the scheduler.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} scheduler The scheduler instance
     * @template
     * @method afterExport
     */
    afterExport             : Ext.emptyFn,

    /**
     * @cfg {String}
     * Format of the exported file, selectable from `pdf` or `png`. By default plugin exports panel contents to PDF
     * but PNG file format is also available.
     */
    fileFormat              : 'pdf',

    /**
     * @cfg {String}
     * The identifier of the default exporter to be used.
     * The corresponding export mode will be selected in {@link Sch.widget.ExportDialog export dialog} by default.
     */
    defaultExporter         : 'multipage',

    /**
     * @cfg {Sch.plugin.exporter.AbstractExporter[]/Object[]}
     * The list of available exporters.
     * If no value is provided the list will be filled automatically (see {@link #buildExporters}).
     */
    exporters               : undefined,

    callbacks               : undefined,
    currentAjaxRequest      : undefined,
    currentWebSocketRequest : undefined,

    hideExportDialogTimeout : 1000,

    /**
     * @event error
     * Fires to show error in the dialog window.
     * @param {Ext.window.Window} dialog The dialog used to change export settings.
     * @param {String} message Error message to show in the dialog window.
     * @param {Object} response Full server response.
     */

    /**
     * @event progressupdate
     * Fires when a progressbar of the {@link #exportDialogClassName dialog} should update its value.
     * @param {Number} value Value (between 0 and 1) to set on the progressbar.
     */

    /**
     * @event beforeexport
     * @preventable
     * Fires before the exporting is started. Return `false` to cancel exporting.
     * @param {Sch.panel.SchedulerGrid/Sch.panel.SchedulerTree} component A scheduler panel to be exported.
     * @param {Sch.plugin.exporter.AbstractExporter} exporter The selected exporter.
     * @param {Object} config Export configuration.
     */

    /**
     * @event exportstart
     * @private
     * Fires when the exporting is started
     * @param {Sch.plugin.Export} plugin The plugin instance.
     */

    /**
     * @event afterexport
     * Fires when the exporting is done
     * @param {Sch.plugin.Export} plugin The plugin instance.
     * @param {boolean} success Export sucess or fail.
     * @param {string} url URL of resulting file.
     */

    /**
     */
    constructor : function (config) {
        var me              = this;

        config              = config || {};

        me.exportersIndex   = {};

        if (config.exportDialogConfig) {
            Ext.Object.each(this.exportConfig, function (k, v, o) {
                var configK = config.exportDialogConfig[k];
                if (configK) {
                    o[k] = configK;
                }
            });
        }

        if (!("WebSocket" in window)) {
            config.enableWebSocket = false;
        }

        me.callParent([ config ]);

        me.setFileFormat(me.fileFormat);

        // if no exporters specified let's set the list of available by default
        if (!me.exporters) {
            me.exporters    = me.buildExporters();
        }

        // instantiate exporters instances in case there were provided just objects w/ xclass
        me.initExporters();

        // listen to exporters events
        me.bindExporters();
    },

    init : function (scheduler) {
        var me                      = this;

        scheduler.showExportDialog  = Ext.Function.bind(me.showExportDialog, me);
        scheduler.doExport          = Ext.Function.bind(me.doExport, me);

        me.scheduler                = scheduler;
    },


    initExporters : function () {
        var me          = this,
            exporters   = me.exporters;

        for (var i = 0; i < exporters.length; i++) {
            // instantiate the exporter if needed
            if (!exporters[i].isExporter) {
                exporters[i]    = me.createExporter(exporters[i]);
            }
        }
    },


    bindExporters : function () {
        var exporters   = this.exporters;

        for (var i = 0; i < exporters.length; i++) {
            this.bindExporter(exporters[i]);
        }
    },


    bindExporter : function (exporter) {
        var me  = this;

        me.mon(exporter, {
            commitpage  : me.onPageCommit,
            collectrows : me.onRowCollected,
            scope       : me
        });

    },


    unbindExporter : function (exporter) {
        var me  = this;

        me.mun(exporter, {
            commitpage  : me.onPageCommit,
            collectrows : me.onRowCollected,
            scope       : me
        });

    },


    /**
     * @protected
     * Provides the list of available exporter instances.
     * This method is used to build the default state of the list when no {@link #exporters} provided.
     * @returns {Sch.plugin.exporter.AbstractExporter[]/String[]} List of exporters.
     */
    buildExporters : function () {
        return ['Sch.plugin.exporter.SinglePage', 'Sch.plugin.exporter.MultiPage', 'Sch.plugin.exporter.MultiPageVertical' ];
    },


    /**
     * @protected
     * Returns config for an exporter being initialized.
     * Override this to provide custom options for exporters being created.
     */
    getExporterConfig : function (className, config) {
        var me      = this;

        var result  = Ext.apply({
            translateURLsToAbsolute : me.translateURLsToAbsolute,
            expandAllBeforeExport   : me.expandAllBeforeExport,
            DPI                     : me.DPI
        }, me.exporterConfig);

        if (me.headerTpl) result.headerTpl  = me.headerTpl;

        if (me.headerTplDataFn) {
            result.headerTplDataFn          = me.headerTplDataFn;
            result.headerTplDataFnScope     = me.headerTplDataFnScope;
        }

        if (me.tpl) result.tpl              = me.tpl;
        if (me.footerTpl) result.footerTpl  = me.footerTpl;

        if (me.footerTplDataFn) {
            result.footerTplDataFn          = me.footerTplDataFn;
            result.footerTplDataFnScope     = me.footerTplDataFnScope;
        }

        return result;
    },


    // @protected
    createExporter : function (className, config) {
        var me              = this,
            exporterConfig  = me.getExporterConfig(className, config);

        if (Ext.isObject(className)) {
            return Ext.create(Ext.apply(exporterConfig, className));
        } else {
            return Ext.create(className, Ext.apply(exporterConfig, config));
        }
    },


    /**
     * Adds an exporter.
     * @param  {Sch.plugin.exporter.AbstractExporter/String} [exporter] An exporter to add.
     * Might be provided as {@link Sch.plugin.exporter.AbstractExporter} instance or as a class name string plus a configuration object:
     *
     *   plugin.registerExporter('MyExporter', { foo : 'bar' });
     *
     * Can be ommited to use configuration object only:
     *
     *   plugin.registerExporter({ xclass : 'MyExporter', foo : 'bar' });
     *
     * @param  {Object} [config]    A configuration object
     */
    registerExporter : function (exporter, config) {
        if (!(exporter instanceof Sch.plugin.exporter.AbstractExporter)) {
            exporter    = this.createExporter.apply(this, arguments);
        }

        this.exporters.push(exporter);

        this.bindExporter(exporter);
    },


    /**
     * Function that returns an exporter by its identifier.
     *
     * @param {String} id string indicating the registered exporter.
     *
     * @return {Sch.plugin.exporter.AbstractExporter} an instance of the exporter.
     */
    getExporter : function (id) {
        if (!id) return;

        var result  = this.exportersIndex[id];
        if (result) return result;

        result      = this.exportersIndex[id] = Ext.Array.findBy(this.exporters, function (i) {
            return i.getId() == id;
        });

        return result;
    },

    /**
     * Function that returns all registered exporters.
     *
     * @return {Object} an Object containing registered exporters.
     */
    getExporters : function () {
        return this.exporters;
    },

    /**
     * Function for setting the {@link #fileFormat} of exporting panel. Can be either `pdf` or `png`.
     *
     * @param {String} format format of the file to set. Can take either `pdf` or `png`.
     */
    setFileFormat : function (format) {
        this.fileFormat = format;
    },

    /**
     * Instantiates and shows a new {@link #exportDialogClassName} class using {@link #exportDialogConfig} config.
     * This popup allows a user to change the export settings.
     */
    showExportDialog : function () {
        var me           = this,
            activeDialog = me.getActiveExportDialog();

        // only one active dialog is allowed
        if (activeDialog) {
            activeDialog.destroy();
        }

        // create export dialog window
        me.setActiveExportDialog(me.buildExportDialog());

        activeDialog = me.getActiveExportDialog();

        activeDialog.on('destroy', me.onExportDialogDestroy, me);

        // if the dialog has a progress bar onboard
        if (activeDialog.progressBar) {
            // let's track the export progress change and update it
            activeDialog.mon(me, {
                progressupdate : me.onExportProgress,
                scope          : me
            });
        }

        activeDialog.show();
    },


    buildExportDialog : function () {
        return Ext.create(this.exportDialogClassName, this.buildExportDialogConfig());
    },


    buildExportDialogConfig : function () {
        var me   = this,
            view = me.scheduler.getSchedulingView();

        return Ext.Object.merge({
            // on submit button press we launch export
            doExportFn         : me.doExport,
            doExportFnScope    : me,

            // form related configs
            startDate          : Ext.Date.clone(me.scheduler.getStart()),
            endDate            : Ext.Date.clone(me.scheduler.getEnd()),
            rowHeight          : view.timeAxisViewModel.getViewRowHeight(),
            columnWidth        : view.timeAxisViewModel.getTickWidth(),
            defaultExporter    : me.defaultExporter,
            // TODO: move "DPI" config to "exportConfig" container and get rid of this Ext.apply()
            exportConfig       : Ext.apply(me.exportConfig, { DPI : me.DPI }),
            exporters          : me.exporters,
            pageFormats        : me.getPageFormats(),
            columnPickerConfig : {
                // Columns ignored in export should not be available to pick
                columns : me.scheduler.lockedGrid.query('gridcolumn[ignoreInExport!=true]')
            }
        }, me.exportDialogConfig);
    },


    onExportDialogDestroy : function () {
        this.cancelExport();
        this.setActiveExportDialog(null);
    },


    onExportProgress : function (value, description) {
        var activeDialog = this.getActiveExportDialog(),
            progressBar  = activeDialog && activeDialog.progressBar;

        if (progressBar) {
            progressBar.updateProgress(value);

            if (typeof description == 'string') {
                progressBar.updateText(description);
            }
        }
    },


    showError : function (error) {
        Ext.Msg.alert('', error || this.L('generalError'));
    },


    getPageFormats : function () {
        var pageSizes   = this.pageSizes,
            sizes       = [];

        Ext.Object.each(pageSizes, function (key, value) {
            sizes.push({
                width   : value.width,
                height  : value.height,
                name    : key
            });
        });

        // let's sort page sizes by width and return array of names
        return Ext.Array.map(sizes.sort(function (a, b) { return a.width - b.width; }), function (size) {
            return size.name;
        });
    },


    getExportConfig : function (config) {
        var me      = this;

        var result      = Ext.apply({
            fileFormat      : me.fileFormat,
            id              : me.defaultExporter,
            beforeExport    : Ext.Function.bind(me.beforeExport, me),
            afterExport     : Ext.Function.bind(me.afterExport, me)
        }, config, me.exportConfig);

        // get effective DPI
        result.DPI              = result.DPI || me.DPI;
        // get page size for provided paper format
        result.pageSize         = Ext.apply({}, me.pageSizes[result.format]);
        // covert page size to pixels
        result.pageSize.width   *= result.DPI;
        result.pageSize.height  *= result.DPI;

        return result;
    },


    /**
     * Function performing the export operation using provided config. After getting data
     * from the scheduler an XHR request to {@link #printServer} will be made with the following JSON encoded data :
     *
     * * `html`        - array of HTML strings containing data of each page
     * * `format`      - paper size of the exported file
     * * `orientation` - orientation of the exported file
     * * `range`       - range of the exported file
     * * `fileFormat`  - file format of the exported file
     *
     * @param {Object} [conf] Config options for exporting. If not provided, {@link #exportConfig} is used. Possible parameters are :
     * @param {String} [conf.format]            - format of the exported document/image, selectable from the {@link #pageSizes} list.
     * @param {String} [conf.orientation]       - orientation of the exported document/image. Either `portrait` or `landscape`.
     * @param {String} [conf.range]             - range of the panel to be exported. Selectable from `complete`, `current`, `date`.
     * @param {Boolean} [conf.showHeader]       - boolean value defining if exported pages should have row/column numbers added in the headers.
     * @param {String} [conf.id]                - string value defining which exporter to use.
     *
     * @param {Function} [callback] Optional function that will be called after successful response from export backend script.
     * @param {Function} [errback] Optional function that will be called if export backend script returns error.
     */
    doExport : function (conf, callback, errback, scope) {

        var me          = this,
            component   = me.scheduler,
            config      = me.getExportConfig(conf);

        me.callbacks    = {
            success     : callback,
            failure     : errback,
            scope       : scope || me
        };

        var exporter    = me.exporter = me.getExporter(config.id);

        if (me.fireEvent('beforeexport', component, exporter, config) !== false) {

            me.myBeforeExport();
            me.exporter.extractPages(component, config, function (pages) {
                me.onPagesExtracted(pages, component, exporter, config);
            }, me);
        }
    },

    /**
     * Aborts any ongoing export operation
     */
    cancelExport : function() {

        // if window is destroyed, cancel any ongoing ajax request
        if (this.currentAjaxRequest) {
            Ext.Ajax.abort(this.currentAjaxRequest);
            this.currentAjaxRequest = null;
        } else if (this.currentWebSocketRequest) {
            //close socket here
            this.currentWebSocketRequest.close();
            this.currentWebSocketRequest = null;
        }
        else {
            if (this.exporter)
                this.exporter.abort();
        }

        this.scheduler.getEl().unmask();
    },

    onPagesExtracted : function (pages, component, exporter, config) {
        this.fireEvent('progressupdate', 0.8, this.L('requestingPrintServer'));
        if (this.enableWebSocket) {
            this.doSocketRequest(pages, config);
        } else {
            this.doRequest(pages, config);
        }
    },


    onRowCollected : function (exporter, startIndex, endIndex, total) {
        this.fireEvent('progressupdate', 0.2 * (endIndex + 1) / total, Ext.String.format(this.L('fetchingRows'), endIndex, total));
    },


    onPageCommit : function (exporter, page, pageNum, total) {
        total   = Math.max(pageNum, total);
        this.fireEvent('progressupdate', 0.2 + 0.6 * pageNum / total, Ext.String.format(this.L('builtPage'), pageNum, total));
    },


    /**
     * @private
     * Method that is called after the server responds successfully.
     * The exported file is shown if {@link #openAfterExport} config is set to `true` (default).
     */
    onExportSuccess : function (result) {
        var me           = this,
            activeDialog = me.getActiveExportDialog(),
            callbacks    = me.callbacks,
            fn           = callbacks && callbacks.success,
            scope        = callbacks && callbacks.scope || me;

        //set progress to 100%
        me.fireEvent('progressupdate', 1);

        me.myAfterExport(true, result.url);

        fn && fn.apply(scope, arguments);

        me.hideExportDialogTimer = setTimeout(function() {
            activeDialog && activeDialog.destroy();

        }, me.hideExportDialogTimeout);

        if (me.openAfterExport) {
            if (Ext.isIE) {
                window.open(result.url, 'ExportedPanel');
            } else {
                var link = document.createElement('a');

                link.download = 'export';
                link.href = result.url;

                if (me.openInNewTab) {
                    link.target = '_blank';
                }

                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);
            }
        }
    },

    /**
     * @private
     * Function that is called when the exportserver returned failure. This function will fire the event error.
     * When provided in doExport the callback failure is called.
     *
     * @param {String} message Error message provided with the failure.
     * @param {Object} result object when the failure is a serverside failure.
     */
    onExportFailure : function (message, result) {
        var me          = this,
            dialog      = this.getActiveExportDialog(),
            callbacks   = me.callbacks,
            fn          = callbacks && callbacks.failure,
            scope       = callbacks && callbacks.scope || me;

        fn && fn.call(scope, message);

        me.fireEvent('error', dialog, message, result);

        me.showError(message);

        me.myAfterExport(false, null);
    },

    /**
     * @private
     * Launches a request to the {@link #printServer print server}.
     * On return {@link #onRequestSuccess} or {@link #onRequestFailure} will be called with the returned response.
     * @param {Array} exportedPages An array of paginated component content.
     * @param {Object} config Export configuration.
     */
    doSocketRequest : function (exportedPages, config) {

        var me          = this,
            component   = me.scheduler;

        if (me.printServer) {

            var url = this.printServer.replace(/^http(s)?/i, 'ws');

            var request = Ext.encode(Ext.apply({
                html       : exportedPages,
                startDate  : component.getStartDate(),
                endDate    : component.getEndDate(),
                format     : me.exporter.getPaperFormat(),
                orientation: config.orientation,
                range      : config.range,
                fileFormat : me.fileFormat
            }, this.getParameters()));


            var ws = new WebSocket(url);
            me.currentWebSocketRequest = ws;

            ws.onopen = function () {
                ws.send(request);
            };

            ws.onmessage = function (evt) {
                var result = Ext.decode(evt.data);
                ws.close();
                me.currentWebSocketRequest = null;

                if (result.success) {
                    result.url = me.printServer + '/' + result.file;
                    me.onExportSuccess(result);
                } else {
                    me.onExportFailure(result.msg, result);
                }
            };
        }
    },

    /**
     * @private
     * Launches a request to the {@link #printServer print server}.
     * On return {@link #onRequestSuccess} or {@link #onRequestFailure} will be called with the returned response.
     * @param {Array} exportedPages An array of paginated component content.
     * @param {Object} config Export configuration.
     */
    doRequest : function (exportedPages, config) {

        var me          = this,
            component   = me.scheduler;

        if (!me.test && !me.debug) {

            if (me.printServer) {

                var ajaxConfig = {
                    method      : 'POST',
                    url         : me.printServer,
                    timeout     : me.timeout,
                    params      : Ext.apply({
                        html        : {
                            array : Ext.JSON.encode(exportedPages)
                        },
                        startDate   : component.getStartDate(),
                        endDate     : component.getEndDate(),
                        format      : me.exporter.getPaperFormat(),
                        orientation : config.orientation,
                        range       : config.range,
                        fileFormat  : me.fileFormat
                    }, this.getParameters()),
                    success     : me.onRequestSuccess,
                    failure     : me.onRequestFailure,
                    scope       : me
                };

                Ext.apply(ajaxConfig, this.getAjaxConfig(ajaxConfig));

                this.currentAjaxRequest = Ext.Ajax.request(ajaxConfig);
            } else {
                me.onExportFailure('Print server URL is not defined, please specify printServer config');
            }

        } else {

            if (me.debug) {
                var pages   = exportedPages || [];

                for (var i = 0, l = pages.length; i < l; i++) {
                    var w = window.open();

                    w.document.write(pages[i].html);
                    w.document.close();
                }
            }

            me.onExportSuccess(me.testResponse || { success : true, url : 'foo', htmlArray : exportedPages });
        }
    },

    onRequestSuccess : function (response) {
        this.currentAjaxRequest = null;

        var me  = this,
            result;

        try {
            result = Ext.JSON.decode(response.responseText);
        } catch (e) {
            me.onExportFailure('Wrong server response received');
            return;
        }

        if (result.success) {
            me.onExportSuccess(result);

        } else {
            me.onExportFailure(result.msg, result);
        }
    },

    onRequestFailure : function (response) {
        this.currentAjaxRequest = null;

        var me  = this,
            msg = response.status === 200 ? response.responseText : response.statusText;

        me.onExportFailure(msg, response);
    },

    /**
     * @template
     * This method can be used to apply additional parameters to the 'params' property of the export {@link Ext.Ajax XHR} request.
     * By default this method returns an empty object.
     * @return {Object}
     */
    getParameters : function () {
        return {};
    },

    /**
     * This method can be used to return any extra configuration properties applied to the {@link Ext.Ajax#request} call.
     * @template
     * @param {Object} config The proposed Ajax configuration settings. You may read any properties from this object, but modify it at your own risk.
     * @return {Object}
     */
    getAjaxConfig : function (config) {
        return {};
    },

    /**
     * Returns the active export dialog window instance.
     * @return {Sch.widget.ExportDialog} Active export dialog window instance.
     */
    getActiveExportDialog : function () {
        return this.win;
    },


    setActiveExportDialog : function (dialog) {
        this.win = dialog;
    },

    // myBeforeExport the body, hiding panel to allow changing it's parameters in the background.
    myBeforeExport : function () {
        this.fireEvent('exportstart', this);

        var mask = this.scheduler.getEl().mask();
        mask.addCls('sch-export-mask');

        var activeDialog = this.getActiveExportDialog(),
            progressBar  = activeDialog && activeDialog.progressBar;

        // if export dialog is used and progress bar is there, let's make it visible
        if (progressBar) {
            progressBar.show();
        }
    },

    myAfterExport : function (success, url) {
        this.fireEvent('afterexport', this, success, url);

        this.scheduler.getEl().unmask();
    },

    destroy : function () {
        var dialog = this.getActiveExportDialog();
        dialog && dialog.destroy();

        this.callParent(arguments);

        clearTimeout(this.openAfterExportTimer);
        clearTimeout(this.hideExportDialogTimer);

        if (this.getActiveExportDialog()) {
            this.getActiveExportDialog().destroy();
        }
    }
});
