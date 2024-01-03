/*
 * jsreports 1.4.79
 * Copyright (c) 2017 jsreports
 * http://jsreports.com
 */
/*
 * jsreports 1.4.79
 * Copyright (c) 2017 jsreports
 * http://jsreports.com
 */

module.exports = function(jsreports, $) {

/** @namespace jsreports.designer.plugins */
jsreports.ns('designer.plugins', jsreports);

/**
 * @class ReportList
 * @memberof jsreports.designer.plugins
 * @classdesc Adds a report selector drop-down to the designer toolbar, allowing the user to switch between
 * report definitions.  Optionally supports a "New" button enabling creation of a new report.  Pass an array
 * of plugins in the "plugins" config of the designer when creating a designer object, or pass the plugin
 * configuration along with the pluginType 
 *
 * @param {Object} options - Configuration object with the following properties
 * @param {Boolean} [options.allowNew] - Whether to show a button to create a new report, defaults to true
 * @param {Boolean} [options.allowDelete] - Whether to show a button to allow deleting the currently selected report, defaults to true
 * @param {Object} [options.newTemplate] - The report definition object to use as the template when the New Report button is clicked, defaults to built-in default template
 * @param {string} [options.selectedReportId] - Which report is initially selected; defaults to none
 * @param {Array} [options.reports] - The list of report definition objects with which to populate the selector.  Reports will be listed alphabetically by title.
 * @param {Object} [options.listeners] - Event listeners, keyed by event name
 * @param {string} [options.placeholder] - Placeholder text when no selection is made in the report selector, defaults to 'Select a report'
 * @param {string} [options.selectorLabel] - Optional label text to show next to the report selector
 *
 * @example
 * // Initialize a designer with a ReportList plugin by passing the plugin config 
 * // as an element in the plugins config array
 * var designer = new jsreports.Designer({
 *   dataSources: dataSources,
 *   report: reportDef,
 *   plugins: [{
 *     pluginType: 'ReportList',
 *     allowNew: true,
 *     allowDelete: true,
 *     newTemplate: myTemplateJson,
 *     reports: [ 
 *        // array of report definition objects
 *     ]
 *   }]
 * });
 */
jsreports.designer.plugins.ReportList = function(cfg) {
    var me = this;
    $.extend(true, this, {
        allowNew: true,
        allowDelete: true,
        newTemplate: null,
        selectedReportId: null,
        reports: [],
        listeners: {},
        placeholder: 'Select a report',
        selectorLabel: '',
        selectorCfg: {
            dropdownAutoWidth: true,
            minimumResultsForSearch: -1,
            dropdownCssClass: 'jsr-select2-dropdown'
        }
    }, cfg);
    this.selectorCfg.placeholder = this.placeholder;
    Object.keys(this.listeners).forEach(function(evtname) {
        $(me).on(evtname, me.listeners[evtname]);
    });
};

$.extend(jsreports.designer.plugins.ReportList.prototype, (function() {

    var nextReportId = 1;

    return {
    
        /** Bind this plugin to the designer */
        bind: function(designer) {
            this.designer = designer;
            $(designer).on('render', this.onDesignerRender.bind(this));
        },

        /** @private */
        onDesignerRender: function() {
            var $nav = this.designer.designer_el.find('.jsr-designer-toolbar');
            var $wrap = $('<div class="jsr-plugin-reportlist jsr-toolbar-item-left">');
            this.$select = $('<select class="jsr-plugin-reportlist-select">');
            var i = 1;
            this.usedIds = {};
            this.usedTitles = {};
            this.reports.forEach(this.validateReport.bind(this));
            this.sortReports();
            this.fillSelector();
            if (this.selectorLabel) {
                $wrap.append($('<span class="jsr-plugin-reportlist-label">').text(this.selectorLabel));
            }
            $wrap.append(this.$select);
            if (this.allowNew) {
                this.$newButton = $('<button class="btn jsr-plugin-reportlist-new">New Report</button>');
                this.$newButton.on('click', this.onNewButtonClick.bind(this));
                $wrap.append(this.$newButton);
            }
            if (this.allowDelete) {
                this.$deleteButton = $('<button class="btn jsr-plugin-reportlist-delete">Delete</button>');
                this.$deleteButton.on('click', this.onDeleteButtonClick.bind(this));
                $wrap.append(this.$deleteButton);
            }
            $nav.prepend($wrap);
            this.$select.select2(this.selectorCfg);
            this.$select.on('change', this.onSelectorChange.bind(this));
            var designerReportId = this.designer.getReport();
            // If no report ID specified for the plugin, take any active report ID from the designer
            if (designerReportId && !this.selectedReportId) {
                this.selectedReportId = designerReportId;
            }
            this.onReportChange();
        },

        validateReport: function(report) {
            if (!report.title) {
                report.title = 'Untitled Report';
                if (++i > 1) {
                    report.title += ' ' + String(i);
                }
            }
            if (!report.id) {
                report.id = 'jsr-auto-id-' + String(nextReportId++);
            } else {
                if (this.usedIds[report.id]) {
                    throw new Error('Duplicate report ID passed to report list plugin: ' + report.id);
                }
            }
            this.usedIds[report.id] = true;
        },

        sortReports: function() {
            this.reports.sort(function(a, b) {
                return a.title.localeCompare(b.title);
            });
        },

        fillSelector: function() {
            var me = this;
            this.$select.html('<option></option>');
            this.reports.forEach(function(report) {
                me.$select.append($("<option>").attr('value', report.id).text(report.title));
            });
        },

        /** Handle the user changing the selection in the drop-down */
        onSelectorChange: function() {
            this.selectedReportId = this.$select.select2('val');
            var selectedReport = this.findReportById(this.selectedReportId);
            this.designer.setReport(selectedReport);
            this.onReportChange();

            /**
             * selectreport event fires when the user changes the active report in the drop-down.
             * @event selectreport
             * @memberof ReportList
             * @param {object} event - The jQuery event object
             * @param {object} report - The newly selected report definition
             */            
            $(this).trigger('selectreport', [ selectedReport ]);
        },

        /** Handle a report selection, including those coming from the designer or initial passed config value */
        onReportChange: function() {
            this.$select.select2('val', (this.selectedReportId || ''));
            if (this.$deleteButton) {
                this.$deleteButton.prop('disabled', !this.selectedReportId);
            }
        },

        onNewButtonClick: function() {
            // then generate new default report def (from provided template or default if none)
            // and fire new event
            this.createNewReport();
        },

        createNewReport: function() {
            var def = JSON.parse(JSON.stringify(this.newTemplate || jsreports.defaultReport));
            this.validateReport(def);
            var i = 0, limit = 20, origTitle = def.title;
            // Make title unique
            while (this.reports.some(function(rpt) { return (rpt.title === def.title); }) && i++ < limit) {
                def.title = origTitle + ' ' + String(i + 1);
            }
            this.reports.push(def);
            /**
             * createreport event fires when the user creates a new report using the New button.
             * @event createreport
             * @memberof ReportList
             * @param {object} event - The jQuery event object
             * @param {object} report - The new report definition
             */             
            $(this).trigger('createreport', [ def ]);
            this.sortReports();
            this.refreshSelector();
            this.selectedReportId = def.id;
            this.onReportChange();
            this.designer.setReport(def);
        },

        onDeleteButtonClick: function() {
            var me = this;
            var report = this.findReportById(this.selectedReportId);
            if (window.confirm('Are you sure you want to delete "' + (report.title || '') 
                + '"?')) {
                me.onDeleteConfirm();
            }
        },

        findReportById: function(id) {
            var selectedReport = this.reports.filter(function(rpt) {
                return (rpt.id === id);
            });
            return (selectedReport.length > 0 ? selectedReport[0] : null);
        },

        refreshSelector: function() {
            this.$select.select2('destroy');
            this.fillSelector();
            this.$select.select2(this.selectorCfg);
        },

        onDeleteConfirm: function() {
            var evt = $.Event('deletereport');
            var report = this.findReportById(this.selectedReportId);
            /**
             * deletereport event fires when the user deletes a report using the Delete button.
             * Listen on this event in order to delete any corresponding saved report definition on
             * the server when the report is deleted in the UI.
             * To prevent deletion of the report, call preventDefault() on the event object (first argument).
             * @event deletereport
             * @memberof ReportList
             * @param {object} event - The jQuery event object
             * @param {object} report - The report definition that was deleted
             */ 
            $(this).trigger(evt, [ report ]);
            if (evt.isDefaultPrevented()) {
                // Event cancelled by listener
                return;
            }
            // Recreate drop-down
            this.reports = this.reports.filter(function(otherReport) {
                return (otherReport.id !== report.id);
            });
            delete this.usedIds[report.id];
            this.selectedReportId = null;
            this.refreshSelector();
            this.designer.setReport(null);
            this.onReportChange();
        }
    };

}()));

};
