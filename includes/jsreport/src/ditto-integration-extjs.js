/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
(function() {

function transformDs(ds) {
    if (ds.store) {
        ds.extjsStore = ds.store;
        delete ds.store;
    }
    if (ds.schemaUrl) {
        ds.schema_url = ds.schemaUrl;
        delete ds.schemaUrl;
    }
    return ds;
}

/**
 * The ReportViewer renders a report in HTML within a container element.
 *
 * {@img ditto-viewer-overview.png Screenshot of the ditto viewer}
 *
 *     var viewer = Ext.create('ditto.integrations.extjs.Viewer', {
 *         id: 'viewer',
 *         report: myReportDef,
 *         dataSources: [{
 *             id: "time",
 *             name: "Time",
 *             store: store
 *         }]
 *     }); 
 */
Ext.define('ditto.integrations.extjs.Viewer', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.reportviewer',
    config: {
        /**
         * @cfg {string,object} report The report definition object to render.
         */
        report: null,
        /**
         * The set of data sources that are available for use by reports.  See {@link ditto.Designer#cfg-dataSources}
         */
        dataSources: [],
        cls: 'jsr-report-viewer',
        /**
         * @cfg {string} imageUrlPrefix An optional string to prepend to the URL of any image elements in the report definition
         */
        imageUrlPrefix: ''
    },
    constructor: function() {
        this.callParent(arguments);
        this.dataSources.forEach(transformDs);
    },
    onRender: function() {
        this.callParent(arguments);
        if (this.report) {
            this.setReport(this.report);
        }
    },
    onResize: function() {
        this.callParent(arguments);
        if (this.viewer) {
            this.viewer.resize();
        }
    },
    setReport: function(report) {
        this.report = report;
        this.renderReport();
    },
    onShow: function() {
        this.callParent(arguments);
        if (this.needsRefresh) {
            this.renderReport();
            this.needsRefresh = false;
        }
    },
    renderReport: function() {
        if (this.hidden || !this.body) {
            this.needsRefresh = true;
            return;
        }
        this.viewer = ditto.render({
            target: this.body.dom,
            report_def: this.report,
            datasets: this.dataSources,
            imageUrlPrefix: this.imageUrlPrefix
        });
    }
});

/**
 * A drag-and-drop report designer component for creating and editing report definitions.
 * 
 * {@img ditto-designer-overview.png Screenshot of the ditto designer}
 *
 *     // This store's Model will provide a data schema for the designer to use
 *     var store = Ext.create('Ext.data.Store', {
 *         model: 'TimeEntry',
 *         proxy: {
 *             type: 'ajax',
 *             url: '../data/time-data.json',
 *             reader: {
 *                 type: 'json',
 *                 totalProperty: 'total'
 *             }
 *         }
 *     });
 *     
 *     var designer = Ext.create('ditto.integrations.extjs.Designer', {
 *         id: 'designer',
 *         dataSources: [{
 *             id: "time",
 *             name: "Time",
 *             store: store
 *         }]
 *     });
 */
Ext.define('ditto.integrations.extjs.Designer', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.reportdesigner',
    config: {
        /**
         * @cfg {object} report
         * The report definition object to edit in the designer.  When not provided, a blank default report
         * will be created.
         */
        report: null,
        /**
         * @cfg {array} dataSources The set of data sources that are available for use in reports.  For the designer, each data source config must contain at least a schema or schemaUrl property; the data itself is optional.  The properties for each data source config object are listed below.
         * 
         * @cfg {string} dataSources.id (required) The unique id that will be used to refer to this data source in reports.
         * 
         * @cfg {string} dataSources.name (required) The human-friendly name to show in the designer when this data source appears as an option to select.
         * 
         * @cfg {Ext.data.Store} dataSources.store The data store that provides the records for this data source.  The store's model (from its proxy) will be
         * used as the schema for the records.
         * 
         * @cfg {Array} dataSources.data
         * Optionally, you can pass a literal array of objects as the data for this data source.  When present, this
         * property will be used instead of the "store" and "url" properties.
         *
         * @cfg {string} dataSources.url
         * A URL from which the JSON array of data can be fetched.  Will be used if "data" and "store" are not present.
         *
         * @cfg {Object} dataSources.schema
         * An object containing a "fields" property which is an array of field definitions, each with a "name" and "type"
         * property, where "type" is one of: text, number, boolean, date.  Not required if either "store" or "schemaUrl" is
         * present.
         *
         * @cfg {string} dataSources.schemaUrl
         * A URL from which the schema can be fetched.  Will be used if "store" and "schema" are not present.
         */
        dataSources: [],
        cls: 'jsr-designer',
    },
    constructor: function() {
        this.callParent(arguments);
        this.dataSources.forEach(transformDs);
    },
    onRender: function() {
        this.callParent(arguments);
        this.designer = new ditto.Designer({
            embedded: true,
            container: this.body.dom,
            data_sources: this.dataSources || [],
            report: this.report || null,
            imageUrlPrefix: this.imageUrlPrefix
        });
        $(this.designer).on('save', this.onDesignerSave.bind(this));
        this.on('activate', this.onActivate.bind(this));
    },
    onResize: function() {
        this.callParent(arguments);
        this.designer.reposition();
    },
    onActivate: function() {
        this.designer.reposition();
    },
    setReport: function(report) {
        return this.designer.setReport(report);
    },
    getReport: function() {
        return this.designer.getReport();
    },
    onDesignerSave: function(evt, reportDef) {
        /**
        * @event
        * Fired when the user saves the report in the designer.
        * @param {Ext.Component} this
        * @param {object} report The report definition object.
        */
        this.fireEvent('save', this, JSON.parse(reportDef));
    }
});

/**
 * Provides the ability to generate report files and download them without displaying them on-screen.
 */
Ext.define('ditto.integrations.extjs.Exporter', {
    statics: {
        /**
         * Generates a report to a file in the browser and downloads it.
         * @param {object} cfg 
         * @param {object} cfg.report The report definition object to render
         * @param {string} cfg.dataSources The available data sources for the report to use; see {@link ditto.Designer#cfg-dataSources}
         * @param {string} cfg.format The file format to generate.  One of "pdf", "xlsx"
         * @param {string} cfg.filename Optional filename for the downloaded file; if not provided, the report title will be used
         */
        export: function(cfg) {
            ditto.export({
                report_def: cfg.report,
                datasets: cfg.dataSources,
                format: cfg.format,
                filename: cfg.filename
            });
        }
    }
});

}());
