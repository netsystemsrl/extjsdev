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

/**
 * Do not call directly.  Use <code>jsreports.createReport()</code> to get a new ReportBuilder.
 * @class ReportBuilder
 * @classdesc Provides an API for programmatic construction of report definitions.  Use <code>jsreports.createReport()</code>
 * to get a new ReportBuilder, as shown in the example below.
 *
 * @example
 * // Create a new report definition
 * var reportDef = jsreports.createReport()
 *  .data("time")
 *  .groupBy("Client_ID")
 *    .header()
 *      .text("Group header text")
 *    .footer()
 *      .text("Group footer")
 *  .detail()
 *    .text("Detail with [data]")
 *  .input('Client', 'text')
 *  .filterBy('Client_name', 'contains', '[?Client]')
 *  .done();
 * 
 * // Render the report
 * jsreports.render({
 *   report_def: reportDef,
 *   datasets: myDataSets,  // defined elsewhere
 *   target: $('#myDiv')
 * });
 */

import ElementUtils from './elements/ElementUtils';

module.exports = function(jsreports) {

jsreports.ReportBuilder = (function() {
    var nextReportId = 1;
    var version = "1.4.79";
    return function(opts) {
        if (!jsreports.defaultReport) {
            throw new Error('Missing jsreports base library - did you include all required files?');
        }
        this.def = jsreports.merge({}, jsreports.defaultReport, opts);
        delete this.def.header;
        delete this.def.footer;
        delete this.def.default_format;
        // delete this.def.page_header;
        // delete this.def.page_footer;
        this.def.id = "jsr-auto-id-" + String(nextReportId++);
        this.lastSection = this.def.body;
        this.lastLevel = null;
        this.def.version = version;
        this.nextControlId = 1;
        if (this.def.name) {
            this.def.title = this.def.name;
        }
    };
}());

const getDefaultDataSection = () => JSON.parse(JSON.stringify(jsreports.defaultReport.body));

jsreports.merge(jsreports.ReportBuilder.prototype, function() {
    
    var nextControlId = 1;

    function getDefaultSectionHeight() {
        return getInchesInReportUnits.call(this, 1);
    }

    function getInchesInReportUnits(inches) {
        return this.def.page.units === "mm" ? (25.4 * inches) : inches;
    }

    function getNextControlId() {
        return 'jsr-auto-id-' + String(this.nextControlId++);
    }

    function defineSection(height, opts) {
        this.lastSection = jsreports.merge({
            visible: true,
            height: height || getDefaultSectionHeight.call(this),
            elements: []
        }, opts);
        return this.lastSection;
    }

    function requireColumns() {
        if (!this.def.columns) {
            this.def.columns = { count: 1, spacing: 0 };
        }
    }

    var api = /** @lends ReportBuilder.prototype */ {
        
        /**
         * Begins a data section in the report using the specified data source ID.
         * When called multiple times, adds additional data sections below the first,
         * each allowing nested grouping within its own data source via subsequent
         * calls to groupBy, header, footer, detail, etc.
         * This should be one of the first methods you call when using the
         * report builder API to define a report.
         * @param {string} dataSourceId - The ID of the data source; must match a defined data source ID
         *   when the report runs
         * @memberof ReportBuilder
         * @instance
         */
        data: function(dsId) {
            let dataSection = this.def.body;
            if (this.currentDataSection) {
                // Already used the first body, add another
                if (!Array.isArray(this.def.body)) {
                    this.def.body = [ this.def.body ]
                }
                dataSection = getDefaultDataSection();
                this.def.body.push(dataSection);
            }
            dataSection.data_source = dsId;
            this.currentDataSection = dataSection;
            return this;
        },

        /**
         * Add a header to the current level.  By default, the level is the report itself;
         * if [groupBy]{@link ReportBuilder#groupBy} has been called, then the header will be added to the most recent
         * grouping level.
         * @param {number} height - The height of the header, in report units (inches or mm).
         * @memberof ReportBuilder
         * @instance
         */
        header: function(height, opts) {
            var targetLevel = this.lastLevel || this.def;
            targetLevel.header = defineSection.call(this, height, opts);
            return this;
        },

        /**
         * Add a footer to the current level.  By default, the level is the report itself;
         * if [groupBy]{@link ReportBuilder#groupBy} has been called, then the footer will be added to the most recent
         * grouping level.
         * @param {number} height - The height of the footer, in report units (inches or mm).
         * @memberof ReportBuilder
         * @instance
         */
        footer: function(height, opts) {
            var targetLevel = this.lastLevel || this.def;
            targetLevel.footer = defineSection.call(this, height, opts);
            return this;
        },

        /**
         * Add a page header to the report.
         * @param {number} height - The height of the header, in report units (inches or mm).
         * @memberof ReportBuilder
         * @instance
         */
        pageHeader: function(height, opts) {
            this.def.page_header = defineSection.call(this, height, opts);
            return this;
        },

        /**
         * Add a column header to the report.
         * @param {number} height - The height of the header, in report units (inches or mm).
         * @memberof ReportBuilder
         * @instance
         */
        columnHeader: function(height, opts) {
            requireColumns.call(this);
            this.def.columns.header = defineSection.call(this, height, opts);
            return this;
        },

        /**
         * Add a column header to the report.
         * @param {number} height - The height of the header, in report units (inches or mm).
         * @memberof ReportBuilder
         * @instance
         */
        columnFooter: function(height, opts) {
            requireColumns.call(this);
            this.def.columns.footer = defineSection.call(this, height, opts);
            return this;
        },        

        /**
         * Add a page footer to the report.
         * @param {number} height - The height of the footer, in report units (inches or mm).
         * @memberof ReportBuilder
         * @instance
         */
        pageFooter: function(height, opts) {
            this.def.page_footer = defineSection.call(this, height, opts);
            return this;
        },

        /**
         * Add a page background to the report.  The page background can contain the same
         * kinds of elements as other sections.  The background is rendered once on each
         * page in PDF mode and once at the top of the report in HTML mode.
         * @memberof ReportBuilder
         * @instance
         */
        background: function(opts) {
            this.def.background = defineSection.call(this, null, opts);
            return this;
        },

        /**
         * Set page dimensions for the report.
         * @param {number} width - The width of the page, in report units (inches or mm).
         * @param {number} height - The height of the page, in report units (inches or mm).
         * @param {string} units - The report units ('in' or 'mm'), defaults to inches
         * @example
         * // Set the report to 8.5 x 11 inches (US letter size)
         * jsreports.createReport()
         *   .setPage(8.5, 11, "inches")
         * @memberof ReportBuilder
         * @instance
         */
        page: function(width, height, units) {
            if (typeof units === "undefined" || units === "in") {
                units = "inches";
            }
            if (units !== "mm" && units !== "inches") {
                throw new Error('Allowed units are: "inches", "mm"');
            }
            this.def.page.units = units;
            this.def.page.paper_size = {};
            this.def.page.paper_size[units] = [ width, height ];
            return this;
        },

        /**
         * Set the page margins for the report.  Margins will use the units defined
         * for the report in setPage, or inches if setPage is not called.
         * If only one argument is supplied, it will be used for all four margins.
         * @param {number} top - The top margin height, in report units (inches or mm).
         * @param {number} right - The right margin width, in report units.
         * @param {number} bottom - The bottom margin height, in report units.
         * @param {number} left - The left margin width, in report units.
         * @memberof ReportBuilder
         * @instance
         */
        margins: function(top, right, bottom, left) {
            if (arguments.length === 1) {
                right = bottom = left = top;
            }
            this.def.page.margins = {
                top: top,
                right: right,
                bottom: bottom,
                left: left
            };
            return this;
        },

        /**
         * Add a user input to the report.  Inputs appear in the report viewer toolbar
         * and allow you to filter the report by user-provided values.  To filter by
         * an input value, see [addFilter]{@link ReportBuilder#filterBy}.
         * @param {string} name - User-visible name of the input field
         * @param {string} type - One of "text", "number", "date"
         * @param {string} \[defaultValue\]] - The default value for the input
         * @memberof ReportBuilder
         * @instance
         */
        input: function(name, type, defaultVal, displayName, opts) {
            this.def.inputs.push(jsreports.merge({
                name: name,
                type: type,
                default_value: defaultVal,
                displayName: displayName
            }, opts));
            return this;
        },

        /**
         * Add a filter to restrict which records are shown in the report.
         * To filter by a user input, use <code>'[?InputName]'</code> syntax
         * in the compareTo argument.
         * @param {string} field - Name of the data field to filter
         * @param {string} comparison - One of: is, isnot, contains, doesnotcontain, gt, lt, gte, lte
         * @param {string} compareTo - Expression against which the data field will be compared
         * @memberof ReportBuilder
         * @instance
         */
        filterBy: function(field, comparison, compareTo) {
            this.def.filters.push({
                field: field || "",
                operator: comparison || "is",
                operand: (typeof compareTo === "undefined" ? "" : compareTo)
            });
            return this;
        },

        /**
         * Add a text element at the specified location.
         * @param {string} text - The content of the text element.
         * @param {number} left - The distance from the left edge of the section to the left edge of the element, in report units (inches or mm), not including the page margin
         * @param {number} top - The distance from the top edge of the section to the top edge of the element, in report units
         * @param {number} width - The width of the element in report units
         * @param {number} height - The height of the element in report units
         * @param {object} opts - An object containing additional properties to apply to the element
         * @memberof ReportBuilder
         * @instance
         */
        text: function(text, left, top, width, height, opts = {}) {
            if (opts.font && typeof opts.font === 'string') {
                opts.font = { css: opts.font };
            }
            this.lastSection.elements.push(jsreports.merge(ElementUtils.getDefaultDef('text'), {
                id: getNextControlId.call(this),
                text: text || "Text",
                left: left || 0,
                top: top || 0,
                width: width || getInchesInReportUnits.call(this, 2),
                height: typeof height !== 'undefined' ? height : getInchesInReportUnits.call(this, 0.5)
            }, opts));
            return this;
        },

        /**
         * Add an image element at the specified location.
         * @param {string} url - The url of the image, either relative or absolute
         * @param {number} left - The distance from the left edge of the section to the left edge of the element, in report units (inches or mm), not including the page margin
         * @param {number} top - The distance from the top edge of the section to the top edge of the element, in report units
         * @param {number} width - The width of the element in report units
         * @param {number} height - The height of the element in report units
         * @param {object} opts - An object containing additional properties to apply to the element
         * @memberof ReportBuilder
         * @instance
         */
        image: function(url, left, top, width, height, opts) {
            this.lastSection.elements.push(jsreports.merge(ElementUtils.getDefaultDef('image'), {
                id: getNextControlId.call(this),
                url: url,
                left: left || 0,
                top: top || 0,
                width: width || getInchesInReportUnits.call(this, 1),
                height: height || getInchesInReportUnits.call(this, 1)
            }, opts));
            return this;
        },

        /**
         * Add a barcode element at the specified location.
         * @param {string} value - The expression to be evaluated and displayed as a barcode
         * @param {string} encoding - One of CODE39, CODE128, UPC, ITF14, pharmacode, QR
         * @param {number} left - The distance from the left edge of the section to the left edge of the element, in report units (inches or mm), not including the page margin
         * @param {number} top - The distance from the top edge of the section to the top edge of the element, in report units
         * @param {number} width - The width of the element in report units
         * @param {number} height - The height of the element in report units
         * @param {object} opts - An object containing additional properties to apply to the element
         * @memberof ReportBuilder
         * @instance
         */
        barcode: function(value, encoding, left, top, width, height, opts) {
            this.lastSection.elements.push(jsreports.merge({
                id: getNextControlId.call(this),
                type: "barcode",
                barcode_type: encoding || 'CODE39',
                value: value,
                show_value: false,
                left: left || 0,
                top: top || 0,
                width: width || getInchesInReportUnits.call(this, 1),
                height: height || getInchesInReportUnits.call(this, 1),
                visible: true
            }, opts));
            return this;
        },

        /**
         * Add a box element at the specified location.
         * @param {string} fill - The hex color code of the fill color, or 'transparent' (e.g. '#fc0')
         * @param {string} stroke - The hex color code of the border color, or 'transparent' (e.g. '#000')
         * @param {number} left - The distance from the left edge of the section to the left edge of the element, in report units (inches or mm), not including the page margin
         * @param {number} top - The distance from the top edge of the section to the top edge of the element, in report units
         * @param {number} width - The width of the element in report units
         * @param {number} height - The height of the element in report units
         * @param {object} opts - An object containing additional properties to apply to the element
         * @memberof ReportBuilder
         * @instance
         */
        box: function(fill, stroke, left, top, width, height, opts) {
            this.lastSection.elements.push(jsreports.merge({
                id: getNextControlId.call(this),
                type: 'box',
                corner_radius: 0,
                background_color: fill || "#cdf",
                border_color: stroke || "#000",
                left: left || 0,
                top: top || 0,
                width: width || getInchesInReportUnits.call(this, 1),
                height: height || getInchesInReportUnits.call(this, 1),
                visible: true
            }, opts));
            return this;
        },

        /**
         * Add a chart element at the specified location.
         * @param {string} chartType - One of 'line', 'bar', 'pie'
         * @param {string} \[valueField\]] - The data field containing the y-values for line and bar charts, and slice sizes for pie charts
         * @param {string} \[labelField\]] - The field containing slice labels for pie charts
         * @param {number} left - The distance from the left edge of the section to the left edge of the element, in report units (inches or mm), not including the page margin
         * @param {number} top - The distance from the top edge of the section to the top edge of the element, in report units
         * @param {number} width - The width of the element in report units
         * @param {number} height - The height of the element in report units
         * @param {object} opts - An object containing additional properties to apply to the element
         * @memberof ReportBuilder
         * @instance
         */
        chart: function(chartType, valueField, labelField, left, top, width, height, opts) {
            var types = ['line', 'bar', 'pie'];
            if (typeof valueField === 'number') {
                opts = width;
                height = top;
                width = left;
                top = labelField;
                left = valueField;
                labelField = null;
                valueField = null;
            }
            var typeLower = chartType.toLowerCase();
            if (types.indexOf(typeLower) < 0) {
                throw new Error('Allowed values for addChart chartType argument are: ' + JSON.stringify(types));
            }            
            var series = valueField ? [{
                value_field: valueField
            }] : [];
            var template = {
                id: getNextControlId.call(this),
                type: 'chart_' + typeLower,
                series: series,
                left: left || 0,
                top: top || 0,
                width: width || getInchesInReportUnits.call(this, 1),
                height: height || getInchesInReportUnits.call(this, 1),
                visible: true
            };
            switch (typeLower) {
                case "line":
                case "bar":
                    template.x_axis = {
                        label_field: labelField
                    };
                    break;
                case "pie":
                    if (labelField && template.series.length > 0) {
                        template.series[0].label_field = labelField;
                    }
                    break;
            }            
            this.lastChart = jsreports.merge(template, opts);
            this.lastSection.elements.push(this.lastChart);
            return this;
        },

        /**
         * Add a data series to the previously added chart element (see [chart]{@link ReportBuilder#chart})
         * @param {string} valueField - The data field containing the y-values for line and bar charts, and slice sizes for pie charts
         * @param {string} \[labelField\]] - The field containing slice labels for pie charts
         * @param {string} \[colorField\]] - The field containing slice labels for pie charts
         * @memberof ReportBuilder
         * @instance
         */
        series: function(valueField, labelField, colorField) {
            if (!this.lastChart) {
                throw new Error('Call to .series() requires preceding call to .chart()');
            }
            if (this.lastChart.type === 'chart_pie') {                
                this.lastChart.series.push({
                    label_field: labelField,
                    value_field: valueField,
                    color_field: colorField
                });
            } else {
                this.lastChart.series.push({
                    value_field: valueField,
                    color_field: colorField
                });
                // x-axis gets first series's label
                if (labelField && this.lastChart.series.length === 1) {
                    this.lastChart.x_axis.label_field = labelField;
                }
            }
            return this;
        },

        /**
         * Add a table element at the specified location.
         * @param {number} left - The distance from the left edge of the section to the left edge of the element, in report units (inches or mm), not including the page margin
         * @param {number} top - The distance from the top edge of the section to the top edge of the element, in report units
         * @param {number} width - The width of the element in report units
         * @param {number} height - The height of the element in report units
         * @param {object} opts - An object containing additional properties to apply to the element
         * @memberof ReportBuilder
         * @instance
         * @example
         * .table(0, 1.25, 4.75, 2.5, { data: 'changeItems', hasFooter: true, 
         *     groupBy: 'category', fontSize: 9, hideRowWhenExpr: '!description' 
         * })
         * .column('50%', '   [description]', '', '', { 
         *     align: 'left', group0Header: '[category]' })
         * .column('25%', '[currentPeriod]', 'This Period', '[SUM(currentPeriod)]', { 
         *     align: 'right',
         *     detailStyle: {
         *         pattern: '#,##0.00'
         *     },
         *     group0Header: '[SUM(currentPeriod)]',
         *     group0HeaderStyle: {
         *         pattern: '#,##0.00'
         *     }
         * })
         * .column('25%', '[ytd]', 'Year-to-Date', '[SUM(ytd)]', { 
         *     align: 'right',
         *     detailStyle: {
         *         pattern: '#,##0.00'
         *     },
         *     group0Header: '[SUM(ytd)]',
         *     group0HeaderStyle: {
         *         pattern: '#,##0.00'
         *     }
         * })
         */
        table: function(left, top, width, height, opts) {
            this.lastTable = jsreports.merge({
                id: getNextControlId.call(this),
                type: "table",
                left: left || 0,
                top: top || 0,
                width: width || getInchesInReportUnits.call(this, 2),
                height: height || getInchesInReportUnits.call(this, 2),
                hasHeader: true,
                hasFooter: false,
                columns: []
            }, opts);
            this.lastSection.elements.push(this.lastTable);
            return this;
        },

        /**
         * Add a data series to the previously added table element (see [table]{@link ReportBuilder#table})
         * @param {string|number} width - The width of the column, either a percentage of the table width (e.g. '100%') or a number in report units (e.g. 4 meaning 4 inches)
         * @param {string} detail - The text expression to evaluate and render in each detail cell in this column
         * @param {string} \[header\]] - The text expression to evaluate and render in the table header cell in this column (or null)
         * @param {string} \[footer\]] - The text expression to evaluate and render in the table footer cell in this column (or null)
         * @param {object} \[opts\]] - An object containing additional properties to apply to the column
         * @memberof ReportBuilder
         * @instance
         */
        column: function(width, detail, header, footer, opts) {
            if (!this.lastTable) {
                throw new Error('Call to .column() requires preceding call to .table()');
            }
            this.lastTable.columns.push(jsreports.merge({
                width: width,
                detail: detail,
                header: header || null,
                footer: footer || null
            }, opts));
            return this;
        },

        subreport: function(def, left, top, width, height, opts) {
            this.lastSection.elements.push(jsreports.merge({
                id: getNextControlId.call(this),
                type: "subreport",
                left: left || 0,
                top: top || 0,
                width: width || getInchesInReportUnits.call(this, 2),
                height: height || getInchesInReportUnits.call(this, 2),
                report: def
            }, opts));
            return this;
        },

        break: function(top, opts) {
            this.lastSection.elements.push(jsreports.merge({
                id: getNextControlId.call(this),
                type: "break",
                left: 0,
                top: top || 0
            }, opts));
            return this;
        },      

        line: function(direction, startLeft, startTop, length, thicknessPts, color, opts) {
            const ptsPerInch = 72;
            thicknessPts = thicknessPts || 1;
            const thicknessInches = thicknessPts / ptsPerInch;
            direction = direction || 'horizontal';
            this.lastSection.elements.push(jsreports.merge({
                id: getNextControlId.call(this),
                type: 'line',
                left: startLeft || 0,
                top: startTop || 0,
                width: (direction === 'horizontal' ? length : thicknessInches),
                height: (direction === 'horizontal' ? thicknessInches : length),
                thickness: thicknessPts || 1,
                direction: direction,
                color: color || 'black'
            }, opts));
            return this;
        },  

        /**
         * Add a new sub-grouping.  If groupBy has already been called, this adds a sub-grouping beneath that grouping.
         * Records will be grouped by the values in the groupBy data field and the groups will be arranged relative to each
         * other based on the sortBy data field, if specified.  Groups do not have headers or footers by default; use
         * [addHeader]{@link ReportBuilder#header} and [addFooter]{@link ReportBuilder#footer} to add them.
         * @param {string} groupBy - The data field containing the values defining the groups
         * @param {string} \[sortBy\]] - The data field by which groups should be sorted relative to each other (default: same as groupBy)
         * @param {string} \[sortDir\]] - One of: 'asc', 'desc' (ascending = A-Z, 0-9) (default: 'asc')
         * @memberof ReportBuilder
         * @instance
         */
        groupBy: function(groupBy, sortBy, sortDir) {
            if (typeof sortDir !== "undefined" && sortDir !== "asc" && sortDir !== "desc") {
                throw new Error('Allowed values for groupBy sortDir argument are: "asc", "desc"');
            }
            var default_section_height = getDefaultSectionHeight.call(this);
            var group = {
                data_source: "__parentgroup", 
                group_by: groupBy,
                sort_by: sortBy || groupBy,
                sort_dir: sortDir || "asc",
                header: {
                    visible: false,
                    height: default_section_height,
                    elements: []
                },
                footer: {
                    visible: false,
                    height: default_section_height,
                    elements: []
                }
            };
            const dataSection = this.currentDataSection || this.def.body;
            dataSection.sublevels.push(group);
            this.lastLevel = group;
            return this;
        },

        /**
         * Move to the detail of the current data section
         * @memberof ReportBuilder
         * @instance
         */
        detail: function(height, opts) {
            const dataSection = this.currentDataSection || this.def.body;
            let detail = dataSection;
            if (dataSection === this.lastDetailDataSection) {
                // Multiple calls to .detail() in same data section
                if (!detail.extraSections) {
                    detail.extraSections = [];
                }
                detail = defineSection.call(this);
                dataSection.extraSections.push(detail);
            }
            jsreports.merge(detail, {
                height: height,
            }, opts);
            this.lastSection = detail;
            this.lastDetailDataSection = dataSection;
            return this;
        },

        /** 
         * Add a sub-section to the current detail section.  A sub-section
         * works like any other section, containing elements.  Sub-sections
         * are stacked vertically in the order they are defined in the report.
         * @instance
         */
        // subSection: function(height, opts) {
        //     const detail = this.currentDataSection || this.def.body;
        //     if (!detail.subSections) {
        //         detail.subSections = [];
        //     }
        //     const subSection = defineSection.call(this, height, opts);
        //     detail.subSections.push(subSection);
        //     this.lastSection = subSection;
        //     return this;
        // },

        /**
         * Set the height of the report's detail section, in report units (inches or mm).
         * @memberof ReportBuilder
         * @instance
         */
        detailHeight: function(height) {
            this.def.body.height = height;
            return this;
        },

        /**
         * Order records in the report detail section by the given data field, in the given direction.
         * @param {string} sortBy - The name of the data field by which to sort
         * @param {string} \[sortDir\]] - One of: 'asc', 'desc' (ascending = A-Z, 0-9) (default: 'asc')
         * @memberof ReportBuilder
         * @instance
         */
        sortDetailBy: function(sortBy, sortDir) {
            this.def.body.order_detail_by = sortBy;
            this.def.body.order_detail_dir = sortDir || 'asc';
            return this;
        },

        /**
         * Make the report's detail section visible.
         * @memberof ReportBuilder
         * @instance
         */
        showDetail: function() {
            this.def.body.show_detail = true;
            return this;
        },

        /**
         * Make the report's detail section invisible.
         * @memberof ReportBuilder
         * @instance
         */
        hideDetail: function() {
            this.def.body.show_detail = false;
            return this;
        },

        elementDefaults: function(eltType, defaults) {
            eltType = eltType.toLowerCase();
            if (!this.def.elementDefaults) {
                this.def.elementDefaults = {};
            }
            if (eltType === 'text') {
                if (defaults.font && typeof defaults.font === 'string') {
                    defaults.font = { css: defaults.font };
                }
            }
            this.def.elementDefaults[eltType.toLowerCase()] = defaults;
            return this;
        },

        /**
         * Set the report's name (used to generate filenames for download)
         * @param {string} name - The new name for the report
         * @memberof ReportBuilder
         * @instance
         */
        name: function(name) {
            this.def.title = name;
            return this;
        },

        /**
         * Return the report definition in object form.  Call this at the end of a chain of calls that define the report.
         * The object returned by this method is the report definition that you can pass to jsreports.render()
         * or jsreports.export().
         * @example
         * // Define a simple report with one text element
         * var reportDef = jsreports.createReport()
         *   .data('mydata')
         *   .text('Data value is [myfield]')
         *   .done();
         * @memberof ReportBuilder
         * @instance
         */
        done: function() {
            this.sanityCheck();
            return this.def;
        },

        /**
         * Like [done()]{@link ReportBuilder#done}, but returns the report definition in string format.
         * @memberof ReportBuilder
         * @instance
         */
        toString: function() {
            return JSON.stringify(this.done());
        },

        toJSON: function() {
            return this.done();
        },

        sanityCheck: function() {
            var throwError = function(msg) { throw new Error('ReportBuilder error: ' + msg); };
            const details = Array.isArray(this.def.body) ? this.def.body : [ this.def.body ];
            details.forEach(detail => {
                if (!detail.data_source) {
                    throwError(`Missing data source in detail section ${index} - call .data(datasetId)`);
                }
            });
        }

    };

    api.getDetail = api.detail;
    api.addGrouping = api.groupBy;
    api.addText = api.text;
    api.addChart = api.chart;
    api.addBarcode = api.barcode;
    api.addBox = api.box;
    api.addImage = api.image;
    api.image = api.image;
    api.addHeader = api.header;
    api.addFooter = api.footer;
    api.addFilter = api.filterBy;
    api.addInput = api.input;
    api.setDataSource = api.data;
    api.addPageHeader = api.pageHeader;
    api.addPageFooter = api.pageFooter;
    api.setPage = api.page;
    api.setMargins = api.margins;
    api.setDetailHeight = api.detailHeight;

    return api;

}());

/**
 * Create a new report builder.  Chain multiple calls as in the example below to
 * build up the report, and finalize the report by calling [done]{@link ReportBuilder#done} to return the 
 * report definition object.
 * 
 * @example
 * var reportDef = jsreports.createReport()
 *   .data('balancesheet')
 *   .page("8.5", "11", 'inches')
 *   .margins(0, 0, 0, 0)
 *   .groupBy('trialbalancesection', 'asc', true, true)
 *      // Add a group header; the header goes on the group because it comes
 *      // after the call to addGrouping.  To add a report-level header, call
 *      // addHeader before addGrouping.  It's a good idea to define your report
 *      // working outside-in.
 *      .header(1)
 *        .text('[trialbalancesectionheader]', 1, 0.25, 2.5, 0.5, {
 *          bold: true
 *        })
 *      // Add a one-inch-tall footer with two text elements, with header and footer
 *      .footer(1)
 *        .text('Total [trialbalancesectionheader]', 1, 0.25, 2.5, 0.5, {
 *          bold: true
 *        })
 *        // These elements go in the group footer because that is the most recently-
 *        // added section
 *        .text('[SUM(debitamount - creditamount)]', 3.25, 0.25, 1.0, 0.5, {
 *          bold: true,
 *          align: 'right'
 *        })
 *    // Move back to the detail section to add a couple of text elements there
 *    .detail()
 *      .text('[accountid] [accountname]', 0.15, 0.25, 2.1, 0.5)
 *      .text('[=debitamount - creditamount]', 2.25, 0.25, 2, 0.5, {
 *        align: 'right'
 *      })
 *    .detailHeight(1)
 *    // Return the report definition object
 *    .done();
 */
jsreports.createReport = function(opts) {
    // Single string argument taken to be report name
    if (typeof opts === 'string') {
        opts = { name: opts };
    }
    return new jsreports.ReportBuilder(opts);
};

};
