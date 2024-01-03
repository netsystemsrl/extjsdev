/*
 * jsreports 1.4.79
 * Copyright (c) 2017 jsreports
 * http://jsreports.com
 */
/** 
 * @name jsreports
 * @namespace
 */

import Dropzone from 'dropzone';
import 'dropzone/dist/dropzone.css';
import { PropTypes } from './elements/ReportElement';
import Textarea from 'textcomplete/lib/textarea';
import Textcomplete from 'textcomplete/lib/textcomplete';

module.exports = function(jsreports, $) {

require('../lib/jquery.event.drag-2.2.js')($);
require('../lib/select2.full.js')($);
require('../lib/jquery.toolbar.js')($);
var dimple = require('dimple-js/dist/dimple.latest.js');
require('../lib/spectrum.js')($);
require('../lib/jqPropertyGrid.js')($);
require('../lib/bootstrap-datepicker.js')($);
require('../lib/jsbarcode/JsBarcode.js')(jsreports, $);
var QRCode = require('../lib/QRCode.js')(window);
var _ = require('underscore');
var showdown = require('showdown');
// require('babel-polyfill');

// var locale_blank = require('json!../locales/blank.json');

var locale = {};

var nextReportAutoId = 0;
var PRE_1_2_9_Y_SCALE_FACTOR = 1 / 82;

var t = function(s, data) {
    var localized;
    if (locale.translations) {
        localized = locale.translations[s];
        if (!localized) {
            console.warn('Missing translation for:', s);
        }
    }
    return (localized || s).replace(/\{(\w*)\}/gi, function(match, g1) {
        return data[g1] || '';
    });
};

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

const unknownElementIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyIgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwtOTUyLjM2MjE4KSI+PHBhdGggc3R5bGU9InRleHQtaW5kZW50OjA7dGV4dC10cmFuc2Zvcm06bm9uZTtkaXJlY3Rpb246bHRyO2Jsb2NrLXByb2dyZXNzaW9uOnRiO2Jhc2VsaW5lLXNoaWZ0OmJhc2VsaW5lO2NvbG9yOiMwMDAwMDA7ZW5hYmxlLWJhY2tncm91bmQ6YWNjdW11bGF0ZTsiIGQ9Im0gNDYuMDAwMTI4LDk1OS4zNjEzNiBjIC0wLjEzODEsMCAtMC4yNTU0LDAuMDEyIC0wLjM3NSwwLjA2MiBsIC0zOS44NDM4MDAxLDE1LjkzOCBjIC0wLjQ0NzIsMC4xMDAxIC0wLjc5MjIsMC41NDE5IC0wLjc4MTIsMSBsIDAsNDkuOTk5OTQgYyAtMC4wMSwwLjQ2NjYgMC4zNTQxLDAuOTEyNSAwLjgxMjUsMSBsIDM5LjYyNTAwMDEsMTcuODQzOCBjIDAuNDY0MywwLjI2MzUgMC44ODI0LDAuMTY1NiAxLjIxODcsLTAuMDYzIGwgMjEuNDY4OCwtOS42NTYyIGMgMi43NDQ3LDMuNTYyOCA3LjAzOSw1Ljg3NSAxMS44NzUsNS44NzUgOC4yNzI0LDAgMTUsLTYuNzI3NiAxNSwtMTUgMCwtNS43NDcgLTMuMjQzOCwtMTAuNzMxOSAtOCwtMTMuMjUgbCAwLC0zNi43NDk5NCBjIDAuMDE5LC0wLjQ5NDcgLTAuMzgzOCwtMC45Njk4IC0wLjg3NSwtMS4wMzEyIGwgLTM5Ljc1LC0xNS45MDYzIGMgLTAuMTE5NiwtMC4wNSAtMC4yMzY5LC0wLjA2MiAtMC4zNzUsLTAuMDYyIHogbSAwLDIuMDYyNSAzNy4zMTI1LDE0LjkzNzUgLTE3LjMxMjUsNi45MDYyIC0zNy4zMTI1LC0xNC45MDYyIDE3LjMxMjUsLTYuOTM3NSB6IG0gLTIwLDggMzcuMzEyNSwxNC45Mzc1IC0xNy4zMTI1LDYuOTA2MiAtMzcuMzEyNSwtMTQuOTA2MiAxNy4zMTI1LC02LjkzNzUgeiBtIC0xOSw4LjQwNjMgMzgsMTUuMTg3NCAwLDQ5Ljc4MTI0IC0zOCwtMTcuMDkzNyAwLC00Ny44NzQ5NCB6IG0gNzgsMCAwLDM0LjQwNjE0IGMgLTEuNTYyOCwtMC41NTMyIC0zLjI0OTksLTAuODc1IC01LC0wLjg3NSAtOC4yNzI0LDAgLTE1LDYuNzI3NiAtMTUsMTUgMCwyLjcwNzIgMC43NDA3LDUuMjQyOSAyLDcuNDM3NSBsIC0yMCw5IDAsLTQ5Ljc4MTI0IDE4LC03LjE4NzQgMCwxNC41MzEyNCBjIC0wLjAxLDAuNTI4MyAwLjQ3MTYsMSAxLDEgMC41Mjg0LDAgMS4wMDc1LC0wLjQ3MTcgMSwtMSBsIDAsLTE1LjMxMjU0IDE4LC03LjIxODcgeiBtIC01LDM1LjUzMTE0IGMgNy4xOTE2LDAgMTMsNS44MDg0IDEzLDEzIDAsNy4xOTE1IC01LjgwODQsMTMgLTEzLDEzIC03LjE5MTUsMCAtMTMsLTUuODA4NSAtMTMsLTEzIDAsLTcuMTkxNiA1LjgwODUsLTEzIDEzLC0xMyB6IG0gMCwyIGMgLTEuMzU3NiwwIC0yLjY0NywwLjI3MjUgLTMuNzE4OCwwLjg3NSAtMS4wNzE4LDAuNjAyNSAtMS45MzkxLDEuNTYxMSAtMi4yNSwyLjc4MTIgYSAxLjAwMDUzNjYsMS4wMDA1MzY2IDAgMSAwIDEuOTM3NiwwLjUgYyAwLjE1NDksLTAuNjA4MiAwLjU3MTksLTEuMTMyNSAxLjI4MTIsLTEuNTMxMiAwLjcwOTMsLTAuMzk4NyAxLjY5MjgsLTAuNjI1IDIuNzUsLTAuNjI1IDIuMjY5MywwIDQuMDExMSwxLjc4MyA0LDMgLTAuMDIsMi4xOTg4IC0xLjAyNjEsMy4xOTM0IC0yLjI4MTIsNC42MjUgLTEuMjU1NCwxLjQzMTYgLTIuNzE4OCwzLjI5MjkgLTIuNzE4OCw2LjM3NSBhIDEuMDAwMSwxLjAwMDEgMCAxIDAgMiwwIGMgMCwtMi40ODkzIDEuMDE2NywtMy42MjQ3IDIuMjUsLTUuMDMxMiAxLjIzMzMsLTEuNDA2NCAyLjcyNDEsLTMuMTE2NiAyLjc1LC01Ljk2ODggMC4wMjUsLTIuNzQ2NiAtMi43NDk1LC01IC02LC01IHogbSAwLDE5IGMgLTAuODI4NCwwIC0xLjUsMC42NzE2IC0xLjUsMS41IDAsMC44Mjg0IDAuNjcxNiwxLjUgMS41LDEuNSAwLjgyODQsMCAxLjUsLTAuNjcxNiAxLjUsLTEuNSAwLC0wLjgyODQgLTAuNjcxNiwtMS41IC0xLjUsLTEuNSB6IiBmaWxsPSIjMDAwMDAwIiBmaWxsLW9wYWNpdHk9IjEiIHN0cm9rZT0ibm9uZSIgbWFya2VyPSJub25lIiB2aXNpYmlsaXR5PSJ2aXNpYmxlIiBkaXNwbGF5PSJpbmxpbmUiIG92ZXJmbG93PSJ2aXNpYmxlIj48L3BhdGg+PC9nPjwvc3ZnPg==';

/**
 * @class
 *
 * A drag-and-drop report designer component.
 *
 * @param {Object} options
 * @param {string} [options.reportDef] - The report definition object to edit.  If not provided, the designer will be empty.
 * @param {Array} options.dataSources - Array of configuration objects for the available data sources for reports.
 * @param {Array} options.images - Available images that can be used by the report.  Each array element should contain the following properties: <br/>name (String) A description of the image<br/>url (String) The location of the image
 * @param {boolean} options.embedded - True to embed the designer in an element on the page (requires <b>container</b> config).  False to show designer in a popup.  Default: false.
 * @param {HTMLElement} options.container - When <b>embedded</b> is true, the element into which to render the designer.
 * @param {string} options.toolbarPosition - Controls where the toolbar for editing elements appears.  Options:<br/>top - Appears above report canvas<br/>bottom - Appears below report canvas<br/>float - Appears floating just below the selected element<br/>Default: top
 *
 * @example
 * var designer = new jsreports.Designer({
 *     data_sources: [ ... ],
 *     report_def: { ... },
 *     images: [ ... ],
 *     toolbarPosition: "top",
 *     embedded: true,
 *     container: $("#reportDesigner")
 * });
 *
 */
jsreports.Designer = function(cfg) {
    this.version = "1.4.79";
    this.layout = "horizontal";
    this.config = cfg;
    this.nextToolbarItemId = 1;

    // Back-compat: underscores to camelcase
    cfg.report_def = jsreports.firstDefined(cfg.report, cfg.reportDef, cfg.report_def);
    cfg.data_sources = jsreports.firstDefined(cfg.dataSources, cfg.data_sources);
    
    if (cfg.report_def) {
        if (typeof cfg.report_def === 'string') {
            try {
                cfg.report_def = JSON.parse(cfg.report_def);
            } catch (e) {
                throw new Error('Config property "report_def" for jsreports.Designer constructor must be a report definition object or a JSON string representing one');
            }
        }
        if (!cfg.report_def.id) {
            cfg.report_def.id = "jsr-auto-id-" + String(nextReportAutoId++);
        }
    }
    $.extend(true, this, {
        report_def: null,
        images: [],
        enableBarcodes: true,
        enableColumns: false,
        toolbarPosition: "top",
        embedded: false,
        embedImages: false,
        gridSize: 10,
        gridSizeInches: 0.125,
        gridSizeMm: 3.175,
        edgeSnapThresholdPx: 6,
        minimumElementSize: 10,
        showDownloadButton: false,
        showSaveButton: true,
        showConfigPanel: true,
        jasperDef: null,
        plugins: [],
        hideElementTypes: [],
        hideTabs: [],
        customElements: [],
        allowImageUpload: true
    }, cfg);
    if (!this.report_def) {
        this.report_def = JSON.parse(JSON.stringify(jsreports.defaultReport));
    }
    this.jasperMode = (jsreports.nsExists('integrations.jasper', jsreports) 
        && this.report_def.constructor === jsreports.integrations.jasper.JasperReportDef);
    if (this.jasperMode) {
        this.jasperDef = this.report_def;
        this.report_def = this.jasperDef.jsrDef;
    }
    // Apply any provided element defaults to all template elements
    const eltDefaults = this.report_def.elementDefaults;
    if (eltDefaults) {
        this.getAllElementDefs().map(elt => {
            const eltType = elt.type.toLowerCase();
            if (eltDefaults[eltType]) {
                const withDefaults = _.extend({}, eltDefaults[eltType], elt);
                _.extend(elt, withDefaults);
            }
        });
    }
    /** Add any images in the report to the set of available images if not present */
    this.getAllElementDefs().map(elt => {
        if (elt.type === 'image') {
            const urlLower = (elt.url || '').toLowerCase().trim();
            if (!this.images.find(img => 
                (img.url || '').toLowerCase().trim() === urlLower)) 
            {
                this.images.push({
                    url: elt.url,
                    name: elt.url
                });
            }
        }
    });
    this.plugins.forEach(function(plugin) {
        if (typeof plugin === 'string') {
            plugin = new jsreports.designer.plugins[plugin]();
        } else if (plugin.pluginType) {
            var pType = plugin.pluginType;
            delete plugin.pluginType;
            plugin = new jsreports.designer.plugins[pType](plugin);
        } else {
            return console.error(`Unrecognized plugin provided to designer; expected string or object with string-type property 'pluginType'`);
        }
        plugin.bind(this);
    }.bind(this));
    this.init();
};

var printError = (typeof console.error === 'function' ? console.error.bind(console) : (function(){}));

var PATTERN_OPTIONS = [
    ['0.00', '123.45'],
    ['#,##0', '12,345'],
    ['#,##0.00', '12,345.67'],
    ['$#,##0.00', '$12,345.67'],
    ['0%', '50%'],
    ['0.00%', '56.78%'],
    ['m/d/yy', '1/22/16'],
    ['d-mmm-yy', '22-Jan-16'],
    ['d-mmm', '22-Jan'],
    ['h:mm:ss AM/PM', '11:35:20 PM'],
    ['m/d/yyyy h:mm', '1/22/2016 23:35']
    ].map(function(opt) { 
    return { id: opt[0], text: opt[0] + ' (ex: ' + opt[1] + ')' }; 
});

/** @lends jsreports.Designer.prototype */
var privateApi = {

    image_placeholder_url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAm4AAAGfAQMAAADcQMxxAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAGUExURcrKyv7+/sAhN/cAAANUSURBVHja7doxspUwGIZhkBlTprXLFtxBtmUXduCW6CzvFtiBlBRIDEngEJjb5P8cmTnf23htnrm/BxJOsGkYY4wxxhhjjDHGGGOMMcYYY4wxxtiD+oblfkC1boFyGsu5FTqrh3IayznvobNCOR24HjorkGs9lNtm9QN0VhwXZ8VxcVY/ojgL5dKsfoLOCuPirL9QXJpV+RnDqU2bOxQXZx06vwBnbVBcmjWoC27WMXCY1T3NGv5cYbMukQXOiuL2WcOah5w1cIDV3RxLE4Tzx6ZjAdxr1sANwFnDjwNw1sCJV/fuNSuCM6dFXcu506yBm4Czhg95As7ayDcLd35wEnNx1vX1NyGni81avFkUs4q5clbxZlHOKuauj5wyri1nlW4W+voQJuNuj9eivec2q2yzyI+ctypvDfsJt9TPiuMUlrNQ7tNZ6ziF5eKsHzAuXsMaxcWlboZx8ZMYsFwD5WYc18S1Cco1UG7euPsDYh3ntqcvJNcjOftwbkBy5tGcxl4ocG5CcurhHHQJ6NDcsnMDgGsP7vKeQspZD+HWzLnyH7DyCergLieyQq69HKFWcs4nrrs8DQs5heL6nUvAFxFnM6d3Tj2LG3YuffXRvYQzV84IufHCDRJOXzmL5dwo4yYkp65cvnXl3JJWLBHXxUft103W5ltXzs3nE6hqbikWKJWd6m/bBzelTxrCtXlx315Gf5dw675XDOmmW9upnmt2zu5H5F7PEs4nzqzH92UJ5zLXzccREoI7ff1eRFyP5GzBtVjuOAet5cx2FvCvOCXnxhOnj3d5lZz+l5yRc9OJs1JOFZzb36vUczOS6wrOQ7l82DhIuAXJtQf3Nd9jIE4dR6FjPddsh5WR0wOUM+N+VibifObsnO+xbQOv5tzOuQXKhXvVIrifkQvXXO/knM1cuOZGd7z6EHAfkQsXyeTlnMlcuEj+ADlTnMoKuN+RsxhOo7n0pOhe3CrgVOY8lGuxXAfiusQVL5HknMZyBsS1iSte5/VizoG4Ju+EUK582Tg8h3M+fQFFcgrG2fu7shHLiX+72+dTzZl34vSjOfVOXPdorgX+B5LHc81bce7RnH0nzjya01iOMcYYY4wxxhhjjDHGGGOMMcYYY4wxxhj7X/0FnfcF5c+YfkMAAAAASUVORK5CYII=",

    chart_preview_line_data: [1, 4, 9, 16, 25].map(function(v, i) { return { 'Value field': v, l: i }; }),
    // {
        // labels: ["1", "2", "3", "4", "5"],
        // datasets: [{
        //  fillColor: "rgba(151,187,205,0.5)",
        //  strokeColor: "rgba(151,187,205,1)",
        //  data: [1, 4, 9, 16, 25]
        // }]
    // },
    chart_preview_pie_data: [1, 4, 9, 16, 25].map(function(v, i) { return { 'Value field': v, l: String.fromCharCode(65 + i) }; }),
 //    ["#F38630", "#E0E4CC", "#69D2E7", "#949FB1", "#4D5360"].map(function(color) {
    //  return { value: Math.random() * 10, color: color };
    // }),
    input_default_placeholders: {
        "text": t("ex: Smith"),
        "date": t("ex: 5/19/2017, 3 days ago"),
        "number": t("ex: 42")
    },
    element_drag_handling_delay_ms: 150,
    default_fonts: [
        { name: "Times New Roman", css: 'TimesNewRoman, "Times New Roman", Times, Baskerville, Georgia, serif' },
        { name: "Helvetica", css: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
        { name: "Consolas", css: 'Consolas, monaco, monospace' },
        { name: "Monaco", css: 'Monaco, Consolas, "Lucida Console", monospace' },
        { name: "Georgia", css: 'Georgia, Times, "Times New Roman", serif' },
        { name: "Garamond", css: 'Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", serif' },
        { name: "Calibri", css: 'Calibri, Candara, Segoe, "Segoe UI", Optima, Arial, sans-serif' },
        { name: "Arial", css: 'Arial, "Helvetica Neue", Helvetica, sans-serif' },
        { name: "Andale Mono", css: '"Andale Mono", AndaleMono, monospace' },
        { name: "Lucida Grande", css: '"Lucida Grande", "Lucida Sans Unicode", "Lucida Sans", Geneva, Verdana, sans-serif' },
        { name: "Segoe UI", css: '"Segoe UI", Frutiger, "Frutiger Linotype", "Dejavu Sans", "Helvetica Neue", Arial, sans-serif' },
        { name: "Palatino", css: 'Palatino, "Palatino Linotype", "Palatino LT STD", "Book Antiqua", Georgia, serif' },
        { name: "Tahoma", css: 'Tahoma, Verdana, Segoe, sans-serif' },
        { name: "Courier New", css: '"Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace' }
    ],
    font_size_options: [8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 54, 60, 66, 72, 80, 88, 96],
    color_palette: [
        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(117, 117, 117)", 
        "rgb(167, 167, 167)", "rgb(217, 217, 217)", "rgb(255, 255, 255)"],
        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
        "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
        ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
        "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
        "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
        "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
        "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
        "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
        "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
        "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
        "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
        "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
    ],
    auto_save_delay_ms: 5000,
    paper_sizes: {
        "letter": { name: t("Letter"), inches: ["8.5", "11"], mm: ["216", "279"] },
        "letter-landscape": { name: t("Letter (landscape)"), inches: ["11", "8.5"], mm: ["279", "216"] },
        "legal": { name: t("Legal"), inches: ["8.5", "14"], mm: ["216", "356"] },
        "legal-landscape": { name: t("Legal (landscape)"), inches: ["14", "8.5"], mm: ["356", "216"] },
        "tabloid": { name: t("Tabloid"), inches: ["11", "17"], mm: ["279", "432"] },
        "ledger": { name: t("Ledger"), inches: ["17", "11"], mm: ["432", "279"] },
        "a4": { name: t("A4"), inches: ["8.27", "11.69"], mm: ["210", "297"] },
        "a4-landscape": { name: t("A4 (landscape)"), inches: ["11.69", "8.27"], mm: ["297", "210"] },
        "a3": { name: t("A3"), inches: ["11.69", "16.54"], mm: ["297", "420"] },
        "a3-landscape": { name: t("A3 (landscape)"), inches: ["11.69", "16.54"], mm: ["297", "420"] }
    },
    mm_per_in: 25.40,
    default_margins: {
        "inches": {
            "top": 0.5,
            "left": 0.5,
            "right": 0.5,
            "bottom": 0.5
        },
        "mm": {
            "top": 12.70,
            "left": 12.70,
            "bottom": 12.70,
            "right": 12.70
        }
    },
    group_aggregate_function_suggestions: ['[SUM()]', '[AVERAGE()]', '[MAX()]', '[MIN()]', '[COUNT()]'],
    barcode_dummy_values: {
        "UPC": "123456789012",
        "EAN": "7501031311309",
        "ITF14": "1234567890123",
        "pharmacode": "123456",
        "CODE128": "12345678",
        "CODE39": "12345678",
        "QR": "123456789012345678901"
    },

    render: function(container) {
        var me = this;
        this.container = container;
        this.designer_el = $([
            '<div class="jsreports-designer jsr-style-root">',
                '<div class="jsr-designer-toolbar">',
                    // BEGIN_TRIAL_ONLY
                    // '<li><a class="logo-link" href="http://www.jsreports.com" target="_blank"><div class="jsreports-logo">jsreports</div></a></li>',
                    // END_TRIAL_ONLY
                    // '<li class="designer-control-button"><a class="report-bug-link" href="javascript:;">Report a bug</a></li>',
                    '<span class="designer-control-button"><button class="btn btn-success save-button" type="button">' + t('Save') + '</button></span>',
                    '<span class="designer-control-button"><button class="btn cancel-button" type="button">' + t('Cancel') + '</button></span>',
                    // '<span class="designer-control-button"><button class="btn preview-button" type="button">Preview</button></span>',
                    // BEGIN_TRIAL_ONLY
                    // '<li class="designer-control-button"><a class="email-support-link" href="mailto:support@jsreports.com?Subject=Question about jsreports">Email support</a></li>',
                    // END_TRIAL_ONLY
                '</div>',
            '</div>'
        ].join(''));
        $(this.container).empty().append(this.designer_el);
        if (this.showDownloadButton && !this.jasperMode) {
            var $downloadWrap = $([
                '<span class="designer-control-button dropdown">',
                    '<button type="button" class="btn btn-default dropdown-toggle download-button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">',
                        t('Download') + ' <span class="caret"></span>',
                    '</button>',
                    '<ul class="dropdown-menu dropdown-menu-right" role="menu">',
                        '<li role="menuitem"><a href="javascript:;" class="jsr-designer-download-pdf">' + t('PDF') + '</a></li>',
                        '<li role="menuitem"><a href="javascript:;" class="jsr-designer-download-xlsx">' + t('Excel') + '</a></li>',
                    '</ul>',
                '</span>'].join(''));
            this.designer_el.find('.jsr-designer-toolbar').append($downloadWrap);
            this.downloadButton = $downloadWrap.find('button');
            $downloadWrap.find('.jsr-designer-download-pdf').on('click', this.onDownloadClick.bind(this, 'pdf'));
            $downloadWrap.find('.jsr-designer-download-xlsx').on('click', this.onDownloadClick.bind(this, 'xlsx'));
            this.downloadButton.jsrDropdown();
        }
        if (this.embedded) {
            this.designer_el.addClass('jsr-designer-embedded');
        } else {
            this.designer_el.addClass('jsr-designer-popup');
        }
        // $(".navbar a:not(.logo-link, .email-support-link)", this.designer_el).on("click", this.show_header_panel.bind(this));
        this.auto_save_debounced = _.debounce(this.auto_save.bind(this), this.auto_save_delay_ms);
        $("body").on("mouseup", this.auto_save_debounced);
        $("body").on("mouseover", this.auto_save_debounced);
        $("body").on("keyup", this.auto_save_debounced);
        this.designer_el.find(".save-button").on("click", this.on_save_button_click.bind(this));
        this.designer_el.find(".cancel-button").on("click", this.on_cancel_button_click.bind(this));
        if (this.embedded) {
            this.designer_el.find(".cancel-button").hide();
        }
        if (this.showSaveButton === false) {
            this.designer_el.find(".save-button").hide();
        }
        this.window_resize_delegate = this.on_window_resize.bind(this);
        $(window).on("resize", this.window_resize_delegate);
        jsreports.key('del, delete', this.delete_selected_control.bind(this));
        jsreports.key('command+c, ctrl+c', this.copy_selection.bind(this));
        jsreports.key('command+v, ctrl+v', this.paste_selection.bind(this));
        jsreports.key('up, down, left, right, command+up, ctrl+up, '
            + 'command+down, ctrl+down, command+left, ctrl+left, '
            + 'command+right, ctrl+right', this.on_arrow_key.bind(this));
        this.renderContent();
        this.rendered = true;
        $(this).triggerHandler('render');
    },

    /** 
     * @private 
     * Renders report-specific areas like left and right panes (everything except top toolbar) 
     */
    renderContent: function() {
        var me = this;
        this.designer_el.find('.jsr-designer-left, .jsr-designer-right, .jsr-designer-empty').remove();
        if (!this.report_def) {
            this.designer_el.append($([
                '<div class="jsr-designer-empty">',
                    '<div class="jsr-designer-empty-message">' + t('No report loaded') + '</div>',
                '</div>'
            ].join('')));
            return;
        }
        const hiddenElementTypesLower = this.hideElementTypes.map(s => s.toLowerCase());
        const reportType = this.report_def.type || 'hierarchical';
        var paletteItems = Object.keys(this.elementTypes).filter(elTypeId => {
            const elClass = this.elementTypes[elTypeId].handler;
            const allowedReportTypes = elClass && elClass.allowedReportTypes;
            if (allowedReportTypes && allowedReportTypes.indexOf(reportType) < 0) {
                return false;
            }
            return (hiddenElementTypesLower.indexOf(elTypeId) < 0);
        });
        var hideInputsTab = this.hideTabs.indexOf('inputs') >= 0;
        var hidePageTab = this.hideTabs.indexOf('page') >= 0;
        const $pane = $([
            '<div class="jsr-designer-left">',
                '<div class="header jsr-settings">',
                    '<div class="navbar jsr-control-panel-toolbar">',
                      '<div class="navbar-inner">',
                        '<ul class="nav" style="width: 100%">',
                          '<li class="active jsr-designer-tab"><a href="javascript:;" data-panelname="data">' + t('Data') + '</a></li>',
                          (!hideInputsTab ? ('<li class="jsr-designer-tab"><a href="javascript:;" data-panelname="inputs">' + t('Inputs') + '</a></li>') : ''),
                          (!hidePageTab ? ('<li class="jsr-designer-tab"><a href="javascript:;" data-panelname="page-layout">' + t('Page') + '</a></li>') : ''),
                        '</ul>',
                      '</div>',
                    '</div>',
                    '<div class="header-panel jsr-settings-panel jsr-settings-panel-data data active"></div>',
                    '<div class="header-panel jsr-settings-panel jsr-settings-panel-groups groups"></div>',
                    '<div class="header-panel jsr-settings-panel jsr-settings-panel-inputs inputs"></div>',
                    '<div class="header-panel jsr-settings-panel jsr-settings-panel-page page-layout">',
                        '<div class="settings-section jsr-settings-section">',
                            '<h3>' + t('UNITS') + '</h3>',
                            '<select class="jsr-units">',
                                '<option value="inches">' + t('inches') + '</option>',
                                '<option value="mm">' + t('mm') + '</option>',
                            '</select>',
                        '</div>',
                        '<div class="settings-section jsr-settings-section">',
                            '<h3>' + t('PAPER SIZE') + '</h3>',
                            '<input class="jsr-paper-size" />',
                        '</div>',
                        '<div class="page-margins settings-section jsr-settings-section">',
                            '<h3>' + t('MARGINS') + ' (<span class="margin-units"></span>)</h3>',
                            '<label><span class="text">' + t('Top') + ':</span> <input type="text" class="margin-input margin-top" data-side="top" /></label> ',
                            '<label><span class="text">' + t('Bottom') + ':</span> <input type="text" class="margin-input margin-bottom" data-side="bottom" /></label> ',
                            '<label><span class="text">' + t('Left') + ':</span> <input type="text" class="margin-input margin-left" data-side="left" /></label> ',
                            '<label><span class="text">' + t('Right') + ':</span> <input type="text" class="margin-input margin-right" data-side="right" /></label> ',
                        '</div>',
                        '<div class="settings-section jsr-settings-section">',
                            '<h3>' + t('REPORT HEADER & FOOTER') + '</h3>',
                            '<div><label><input type="checkbox" class="show-report-header" checked /> ' + t('Show report header') + '</label></div>',
                            '<div><label><input type="checkbox" class="show-report-footer" checked /> ' + t('Show report footer') + '</label></div>',
                        '</div>',
                        '<div class="settings-section jsr-settings-section">',
                            '<h3>' + t('PAGE HEADER & FOOTER') + '</h3>',
                            '<div class="page-header"><label><input type="checkbox"> ' + t('Show page header (PDF only)') + '</label></div>',
                            '<div class="page-footer"><label><input type="checkbox"> ' + t('Show page footer (PDF only)') + '</label></div>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="palette">',
                    paletteItems.map(elTypeId => 
                        `<div class="palette-item ${elTypeId}" data-elementtype="${elTypeId}">`
                        + (this.elementTypes[elTypeId].iconSrc ? `<div class="jsr-designer-palette-icon" style="background-image:url(${this.elementTypes[elTypeId].iconSrc})" />` : '')
                        + `${t(this.elementTypes[elTypeId].name)}</div>`
                    ).join(''),
                '</div>',
                '<div class="preview">',
                    // '<div class="jsreports-designer-trash">Delete</div>',
                    '<div class="page">',
                    '</div>',
                '</div>',
                '<div class="left-pane-toggle-btn"></div>',
            '</div>',
            '<div class="jsr-designer-right">',
            '</div>'].join(''));
        this.designer_el.append($pane);
        this.designer_el.find(".jsr-control-panel-toolbar a").on("click", this.show_header_panel.bind(this));

        this.previewViewportDomEl = $('.preview', this.designer_el)[0];
        this.preview_el = $(".preview .page", this.designer_el);

        if (this.layout === "horizontal") {
            var $right = this.designer_el.find(".jsr-designer-right"),
                $palette = this.designer_el.find(".palette"),
                $preview_container = this.designer_el.find(".preview");
            $right.append($palette);
            $right.append($preview_container);
            this.designer_el.addClass("jsr-designer-horizontal");
        }
        if (this.showToolbar === false) {
            this.designer_el.find('.jsr-designer-toolbar').hide();
        }
        if (this.showConfigPanel === false) {
            this.designer_el.find('.jsr-designer-left').addClass('collapsed');
        }
        this.reposition();

        var current_template_y_pixels = this.preview_el.height(),
            units = this.report_def.page.units,
            paper_height = this.report_def.page.paper_size[units][1],
            y_units_per_pixel = paper_height / current_template_y_pixels;

        this.is_first_render = true;
        this.render_template();
        delete this.is_first_render;

        this.render_data_panel();
        this.populate_margins_panel();
        this.render_inputs_panel();
        this.preview_el.addClass("yui3-resize-knob");
        this.preview_el.on("click", this.on_preview_canvas_click.bind(this));
        this.preview_el.on("mousemove", this.on_preview_mousemove.bind(this));
        this.init_palette_events();
        this.otherSelections = [];
        // $(".preview-button", this.designer_el).on("click", this.on_preview_button_click.bind(this))
        //     .hide();
        var $units = $(".jsr-units", this.container);
        $units.select2({
            minimumResultsForSearch: -1,
            dropdownCssClass: 'jsr-select2-dropdown'
        });
        $units.select2('val', this.report_def.page.units);

        $units.on("change", function(evt) {
            var units = $(evt.target).val();
            me.report_def.page.units = units;
            $(".margin-units, .paper-size-units").text(t(units).toUpperCase());
            var paper_seln = $("input.jsr-paper-size").select2("val");
            $("input.jsr-paper-size").select2({ 
                    data: me.get_paper_size_options(),
                    dropdownAutoWidth: true,
                    dropdownCssClass: 'jsr-select2-dropdown'
                })
                .val(paper_seln);
            // convert margins to new units
            var conversion = (units === "mm" ? me.mm_per_in : (1 / me.mm_per_in));
            var precision = (units === 'mm' ? 2 : 4);
            ["top", "left", "bottom", "right"].map(function(side) {
                var $input = $("input.margin-" + side),
                    orig = Number($input.val()),
                    converted = orig * conversion;
                $input.val(+converted.toFixed(precision));
                me.report_def.page.margins[side] = converted;
            });
            // convert section heights
            me.getAllSections(null, false).forEach(function(sectionWrapper) {
                sectionWrapper.def.height = +(sectionWrapper.def.height * conversion).toFixed(precision);
            });
            // convert element dims/pos
            me.getAllElementDefs(false).forEach(function(eltDef) {
                ['top', 'left', 'width', 'height'].forEach(function(prop) {
                    eltDef[prop] = +(eltDef[prop] * conversion).toFixed(precision);
                });
            });
            me.render_template();
        });
        $("input.jsr-paper-size").select2({
            data: me.get_paper_size_options(),
            minimumResultsForSearch: -1,
            dropdownAutoWidth: true,
            dropdownCssClass: 'jsr-select2-dropdown'
        });
        if (this.report_def.page.paper_size) {
            $("input.jsr-paper-size").select2("val", (this.report_def.page.paper_size.id));
        }
        $("input.jsr-paper-size").on("change", function(evt) {
            var id = $(evt.target).val();
            me.report_def.page.paper_size = me.paper_sizes[id];
            me.report_def.page.paper_size.id = id;
            me.render_template();
        });
        $(".margin-units, .paper-size-units").text(this.report_def.page.units.toUpperCase());
        $("input.margin-input").on("change", function(evt) {
            var $input = $(evt.target),
                side = $input.data("side");
            me.report_def.page.margins[side] = Number($input.val());
            me.render_template();
        });
        this.designer_el.find(".left-pane-toggle-btn").on("click", this.on_left_pane_toggle_click.bind(this));
        this.designer_el.find(".page-header input")
            .prop("checked", this.report_def.page_header && !!this.report_def.page_header.visible)
            .on("change", evt => {
                if (!me.report_def.page_header) {
                    me.report_def.page_header = 
                        JSON.parse(JSON.stringify(jsreports.defaultReport.page_header));
                }
                this.setSectionVisibility(me.report_def.page_header, $(evt.target).is(":checked"));
                me.render_template();
            });
        this.designer_el.find(".page-footer input")
            .prop("checked", this.report_def.page_footer && !!this.report_def.page_footer.visible)
            .on("change", evt => {
                if (!me.report_def.page_footer) {
                    me.report_def.page_footer = 
                        JSON.parse(JSON.stringify(jsreports.defaultReport.page_footer));
                }
                this.setSectionVisibility(me.report_def.page_footer, $(evt.target).is(":checked"));
                me.render_template();
            });
        $pane.find("input.show-report-header")
            .prop("checked", this.report_def.header && this.report_def.header.visible !== false)
            .on("change", evt => {
                if (!this.report_def.header) {
                    this.report_def.header = JSON.parse(JSON.stringify(jsreports.defaultReport.header));
                }
                this.setSectionVisibility(me.report_def.header, $(evt.target).is(":checked"));
                this.render_template();
            });
        $pane.find("input.show-report-footer")
            .prop("checked", this.report_def.footer && this.report_def.footer.visible !== false)
            .on("change", evt => {
                if (!this.report_def.footer) {
                    this.report_def.footer = JSON.parse(JSON.stringify(jsreports.defaultReport.footer));
                }
                this.setSectionVisibility(me.report_def.footer, $(evt.target).is(":checked"));
                this.render_template();
            });
    },

    setSectionVisibility(section, visible) {
        section.visible = visible;
        if (visible) {
            section.height = Math.max(this.getMinDefaultSectionHeight(), section.height || 0);
        }
    },

    getCurrentUnits: function() {
        if (this.report_def && this.report_def.page && this.report_def.page.units === 'mm') {
            return 'mm';
        }
        return 'in';
    },

    /** The minimum height to apply when making a section visible again via a checkbox */
    getMinDefaultSectionHeight: function() {
        return (this.getCurrentUnits() === 'mm') ? 12.7 : 0.5;
    },

    onDownloadClick: function(format) {
        jsreports.export({
            report_def: this.report_def,
            format: format,
            datasets: this.data_sources
        });
    },

    addToolbarElement: function(htmlOrDom, pos) {
        if (!htmlOrDom) {
            throw new Error("jsreports.Designer.addToolbarElement requires a DOM element or HTML string as the first argument");
        }
        if (!pos) {
            pos = jsreports.ToolbarItemPosition.RIGHT;
        }
        var $elt = $(htmlOrDom);
        var $toolbar = this.designer_el.find('.jsr-designer-toolbar');
        switch (pos) {
            case jsreports.ToolbarItemPosition.LEFT:
                $toolbar.prepend($elt);
                break;
            case jsreports.ToolbarItemPosition.RIGHT:
                // Right-aligned elements are floated, so insert in reverse order and must be wrapped in <li>
                $elt.insertBefore($toolbar.find('.designer-control-button').first()).wrap('<span class="designer-control-button"></span>');
                break;
            default:
                throw new Error('Direction must be jsreports.ToolbarItemPosition.LEFT or jsreports.ToolbarItemPosition.RIGHT');
        }
        return $elt[0];
    },

    addToolbarButton: function(text, pos) {
        if (!text) {
            text = '';
        }
        var btn = this.addToolbarElement('<button class="btn" type="button"></button>', pos);
        $(btn).text(text);
        return btn;
    },

    on_window_resize: function() {
        this.reposition();
        if (this.editing_control_elt && this.toolbarPosition === "float") {
            var toolbar = this.editing_control_elt.data("toolbarObj");
            if (toolbar.toolbar.is(":visible")) {
                this.editing_control_elt.toolbar("calculatePosition");
            }
        }
    },

    on_left_pane_toggle_click: function() {
        var $leftPane = this.designer_el.find(".jsr-designer-left");
        if ($leftPane.hasClass("collapsed")) {
            $leftPane.removeClass("collapsed");
        } else {
            $leftPane.addClass("collapsed");
        }
        this.reposition();
    },

    /**
     * @private
     * Change the column count in the preview, moving any detail section controls as needed
     */
    set_column_count: function(section, column_count) {
        var prev_count = section.column_count,
            scale_factor = prev_count / column_count,
            body_els = section.elements;
        section.column_count = column_count;
        for (var i = 0; i < body_els.length; i++) {
            var el = body_els[i];
            el.left *= scale_factor;
            el.width *= scale_factor;
        }
        this.render_template();
    },

    getFontScaleFactor: function() {
        if (this.fontScaleFactor) return this.fontScaleFactor;
        if (this.scaleFonts === false) {
            this.fontScaleFactor = 1;
            return this.fontScaleFactor;
        }
        var basePPI = 96;
        var isInches = (this.getCurrentUnits() === 'in');
        var ppi = this.pixels_per_unit * (isInches ? 1 : 25.4);
        return this.fontScaleFactor = (ppi / basePPI);
    },

    /**
     * @private
     * Lay out designer, adjusting overall size to fit screen if possible, then fitting internal regions.
     * In embedded mode, do not change designer size.
     */
    reposition: function() {
        if (!this.designer_el) return;
        var collapsedLeftPaneWidth = 36,
            window_width = $(window).width(),
            window_height = $(window).height(),
            designer_width = (this.embedded ? Math.floor($(this.container).innerWidth()) : Math.max(1000, Math.min(1600, window_width - 100))),  // >1000, <1600
            designer_height = (this.embedded ? Math.floor($(this.container).innerHeight()) : Math.max(600, window_height - 100)), // >600
            left_collapsed = this.designer_el.find(".jsr-designer-left").hasClass("collapsed"),
            left_pane_width = (left_collapsed ? collapsedLeftPaneWidth : Math.max(250, Math.min(350, Math.floor(designer_width * 0.4)))),
            $navbar = this.designer_el.find(".jsr-designer-toolbar"),
            navbar_height = $navbar.is(":visible") ? $navbar.outerHeight() : 0,
            pane_height = designer_height - navbar_height,
            overlayMode = (designer_width < 1000),
            leftOverlayOpen = (overlayMode && !left_collapsed);
        this.designer_el.css({
            width: designer_width,
            height: designer_height
        });
        if (!this.embedded) {
            this.designer_el.css({
                top: Math.floor((window_height - designer_height) / 2),
                left: Math.floor((window_width - designer_width) / 2)
            });
        }
        if (this.showSettingsPane === false) {
            this.designer_el.find(".jsr-designer-left")
                .css('display', 'none');
            left_pane_width = 0;
            leftOverlayOpen = false;
            collapsedLeftPaneWidth = 0;
        } else {
            this.designer_el.find(".jsr-designer-left")
                .width(left_pane_width)
                .height(pane_height)
                .css('top', leftOverlayOpen ? (navbar_height + 'px') : 0);
        }
        // Re-check inner designer width because borders may cause it to be != requested width
        this.designer_el.find(".jsr-designer-right")
            .width(Math.floor(this.designer_el.innerWidth() - (leftOverlayOpen ? collapsedLeftPaneWidth : left_pane_width)))
            .height(pane_height)
            .css('margin-left', leftOverlayOpen ? (collapsedLeftPaneWidth + 'px') : 0);
        this.designer_el.toggleClass("jsr-overlay-left", leftOverlayOpen);
        this.adjust_preview_dimensions();
        var preview_width = this.preview_el.width();
        /** Don't re-render if dimensions remain unchanged */
        if (this.initial_render_complete && (designer_width !== this.lastDesignerWidth 
            || designer_height !== this.lastDesignerHeight
            || preview_width !== this.lastPreviewWidth)) 
        {
            this.render_template();
        }
        this.lastPreviewWidth = preview_width;
        this.lastDesignerWidth = designer_width;
        this.lastDesignerHeight = designer_height;
    },

    on_preview_mousemove: function(evt) {
        this.last_cursor_page_y = evt.pageY;
        if (!this.throttled_handle_cursor_move) {
            this.throttled_handle_cursor_move = _.throttle(this.handle_cursor_move.bind(this), 250);
        }
        this.throttled_handle_cursor_move();
    },

    handle_cursor_move: function() {
        var y_offset = this.last_cursor_page_y - this.preview_el.offset().top,
            sec = this.find_section_by_y(y_offset);
        if (sec) {
            if (sec !== this.last_hovered_section) {
                this.last_hovered_section = sec;
                this.preview_el.find(".section-label").hide();
                this.preview_el.find(".section-label").first().text(sec.label).css({
                    top: sec.top
                }).fadeIn("fast");
            }
        } else {
            this.preview_el.find(".section-label").hide();
            this.last_hovered_section = null;
        }
    },

    on_save_button_click: function() {
        var report_json = this.save();
        if (this.subreportMode) {
            var outerSubreportCtl = this.subreportCtlStack[this.subreportCtlStack.length - 1];
            outerSubreportCtl.report = JSON.parse(report_json);
            this.exitSubreport();
            return;
        }
        // At top-level report
        /**
        * Save event.
        * @event jsreports.Designer#save
        * @type {object}
        * @property {boolean} reportJson - JSON string containing report definition
        */
        $(this).trigger("save", [ report_json ]);
        if (!this.embedded) {
            this.destroy();
        }
    },

    save: function() {
        var report_json = JSON.stringify(this.getReport());
        return report_json;
    },

    on_cancel_button_click: function() {
        var currentReportStr = this.getReportStrWithoutVersion(this.getReport());
        var modified = currentReportStr !== this.originalReportStr;
        var proceed = !modified || window.confirm(t('Are you sure you want to discard changes to this report?  This action cannot be undone.'));
        if (proceed) {
            if (this.subreportMode) {
                this.exitSubreport();
            } else {
                localStorage.removeItem(this.auto_save_key);
                $(this).trigger("cancel");
                this.destroy();
            }
        }
    },

    getReportStrWithoutVersion: function(report) {
        return JSON.stringify(this.getReport(), function(key, val) {
            if (key === 'version') return undefined;
            return val;
        });
    },

    destroy: function() {
        if (!this.embedded) {
            if (this.showing_property_editor) {
                this.hidePropertyEditor();
            }
            $("body").removeClass("jsr-designer-active");
            $(window).off("resize", this.window_resize_delegate);
            $(this.container).remove();
            this.$body_mask.remove();
            jsreports.key.unbind('del, delete, command+c, ctrl+c, command+v, ctrl+v');
        }
    },

    get_paper_size_options: function() {
        var me = this,
            units = this.report_def.page.units,
            options =
                Object.keys(this.paper_sizes).map(function(size_id) {
                    var size = me.paper_sizes[size_id],
                        dimensions = size[units];
                    return {
                        id: size_id,
                        text: size.name + ' ('
                            + dimensions[0] + ' x ' + dimensions[1] + ' ' + t(units) + ')'
                    };
                });
        return { results: options };
    },
    
    on_preview_canvas_click: function(evt) {
        var offset = this.preview_el.offset();
        var y = evt.pageY - offset.top + this.preview_el[0].scrollTop;
        var section = this.find_section_by_y(y);
        if (!this.dragging) {
            this.clear_selection();
        }
        this.collapseLeftPaneIfOverlay();
        if (section) {
            this.selectSection(section);
        }
    },

    collapseLeftPaneIfOverlay: function() {
        if (!this.designer_el.hasClass('jsr-overlay-left')) return;
        var $leftPane = this.designer_el.find(".jsr-designer-left");
        if (!$leftPane.hasClass("collapsed")) {
            $leftPane.addClass("collapsed");
            this.reposition();
        }
    },

    hide_preview_output: function() {
        this.$preview_output_div.hide();
        this.$preview_mask.hide();
    },
    
    // on_preview_button_click: function() {
    //  if (this.$preview_output_div) {
    //      this.$preview_output_div.find(".jsreports-preview-content").empty();
    //  } else {
    //      this.$preview_output_div = $('<div class="jsreports-preview-output"><div class="jsreports-preview-close-button">x</div><div class="jsreports-preview-content"></div></div>');
    //      this.$preview_mask = $('<div class="jsreports-preview-mask"></div>');
    //      $(document.body).append(this.$preview_mask);
    //      $(document.body).append(this.$preview_output_div);
    //      var hide_preview_dlgt = this.hide_preview_output.bind(this);
    //      this.$preview_output_div.find(".jsreports-preview-close-button").click(hide_preview_dlgt);
    //      this.$preview_mask.click(hide_preview_dlgt);
    //  }
    //  this.$preview_mask.show();
    //  this.$preview_output_div.show();
    //  jsreports.render({
    //      report_def: this.report_def,
    //      target: this.$preview_output_div.find(".jsreports-preview-content"),
    //      datasets: this.data_sources
    //  });
    // },
    
    populate_margins_panel: function() {
        var $margins = $(".page-margins", this.container);
        $margins.find(".margin-top").val(this.report_def.page.margins.top);
        $margins.find(".margin-left").val(this.report_def.page.margins.left);
        $margins.find(".margin-bottom").val(this.report_def.page.margins.bottom);
        $margins.find(".margin-right").val(this.report_def.page.margins.right);
    },
    
    show_header_panel: function(evt) {
        $(".header .navbar li.active", this.designer_el).removeClass("active");
        $(evt.target).closest("li").addClass("active");
        $(".header-panel.active", this.designer_el).removeClass("active");
        $(".header-panel." + $(evt.target).data("panelname"), this.designer_el).addClass("active");
    },
    
    render_inputs_panel: function() {
        var $target = $(".header-panel.inputs", this.container);
        $target.html([
            '<div class="form-inline">',
                '<div><h3>' + t('INPUTS') + '</h3></div>',
                '<div class="inputs-section">',
                    '<div class="inputs-list"></div>',
                    '<div style="clear: both"></div>',
                    '<button class="add-input btn" type="button">' + t('Add input') + '</button>',
                '</div>',
            '</div>'
        ].join(""));
        this.render_inputs();
        $("button.add-input", this.container).on("click", this.add_input.bind(this));
        $("select", $target).select2({
            dropdownCssClass: 'jsr-select2-dropdown'
        });
        //this.apply_editable_row_hover();
    },
    
    render_inputs: function() {
        var me = this,
            $target = $(".header-panel.inputs .inputs-list", this.container),
            i = 0;
        $target.empty();
        this.report_def.inputs.map(function(inputdef) {
            var $row = $([
                '<div class="editable-row input-row" data-inputindex="' + (i++) + '" data-row-type="input">', 
                    t('Name') + ': <span class="input-name"><input type="text" value="', inputdef.name, '" placeholder="' + t('Input name') + '" /><span class="readonly"></span></span> ',
                    t('Type') + ': <span class="input-type">',
                        '<select style="width: 120px">',
                            '<option value="text">' + t('Text') + '</option>',
                            '<option value="number">' + t('Number') + '</option>',
                            '<option value="date">' + t('Date') + '</option>',
                        '</select></span> ',
                    t('Initial value') + ': <span class="input-default"><input type="text" value="', inputdef.default_value, '" placeholder="', this.input_default_placeholders[inputdef.type], '" /><span class="readonly"></span></span>',
                '</div>'
            ].join(''));
            $(".input-type select", $row).val(inputdef.type).select2({
                dropdownCssClass: 'jsr-select2-dropdown'
            });
            if (inputdef.type === "date") {
                this.create_date_picker($(".input-default input", $row));
            }
            this.set_input_row_readonly_text($row);
            $target.append($row);
        }.bind(this));
        $("select, input", $target).on("change", this.on_report_input_change.bind(this));
        /*
        $(".delete-row-icon", $target).on("click", function() {
            var $row = $(this).closest(".input-row"),
                ix = $row.index();
            me.report_def.inputs.splice(ix, 1);
            $row.remove();
        });
        */
        this.apply_editable_row_hover($target);
    },

    on_report_input_change: function(evt) {
        var $row = $(evt.target).closest(".input-row"),
            inputdef = this.report_def.inputs[$row.index()],
            new_type = $(".input-type select", $row).val(),
            value_input = $(".input-default input", $row),
            existing_date_picker = value_input.data("datepicker");
        $.extend(inputdef, {
            name: $(".input-name input", $row).val(),
            type: new_type,
            default_value: value_input.val()
        });
        this.set_input_row_readonly_text($row);
        if (new_type === "date" && !existing_date_picker) {
            this.create_date_picker(value_input);
        } else if (new_type !== "date" && existing_date_picker) {
            value_input.datepicker("remove");
        }
    },
    
    create_date_picker: function($input) {
        $input.datepicker({
            format: "m/d/yy",
            autoclose: true
        })
        .on("changeDate", this.on_report_input_change.bind(this))
        .on("show", function(e) { });
    },

    set_input_row_readonly_text: function($row) {
        var name_input_val = $("span.input-name input", $row).val(),
            $name_readonly = $("span.input-name .readonly", $row),
            default_input_val = $("span.input-default input", $row).val(),
            $default_readonly = $("span.input-default .readonly", $row);
        $name_readonly.text(name_input_val === '' ? ('(' + t('enter a value') + ')') : name_input_val);
        $default_readonly.text(default_input_val === '' ? ('(' + t('enter a value') + ')') : default_input_val);
    },

    /** Render the left-side config controls for a single data section (inside accordion) */
    renderDataSectionControls(section, container, isFirst, canDelete) {
        const $target = $(container);
        $target.append([
            '<div class="jsr-padding">',
                '<div class="form-inline">',
                    '<div class="settings-section jsr-settings-section jsr-settings-section-data-source">',
                        '<h3>' + t('DATA SOURCE') + '</h3>',
                            this.jasperMode ? 
                                ('(' + t('embedded schema') + ')')
                                : [
                                    '<select class="level-0-data-source">',
                                        '<option></option>',
                                    '</select> '
                                ].join(''),
                    '</div>',
                    (isFirst ? 
                        ['<div class="settings-section jsr-settings-section filters-section">',
                            '<h3>' + t('FILTERS') + '</h3>',
                            '<div class="filters-list"></div>',
                            '<div style="clear: both"></div>',
                            '<button class="add-filter btn" type="button">' + t('Add filter') + '</button>',
                        '</div>'].join('') : ''),
                    '<div class="settings-section jsr-settings-section">',
                        '<h3>' + t('GROUPING') + '</h3>',
                        '<div class="levels-list"></div>',
                        '<div style="margin-top: 5px;"><button class="add-sub-level btn" type="button">' + t('Group records') + '</button></div>',
                    '</div>',
                    '<div class="settings-section jsr-settings-section">',
                        '<h3>' + t('DETAIL') + '</h3>',
                        '<div><label><input type="checkbox" class="show-detail" checked /> ' + t('Show detail section') + '</label></div>',
                        '<div class="editable-row sort-detail-container">' + t('Order detail rows by') + ': ',
                            '<input class="sort-detail-by" type="text" />',
                            '<span class="sort-detail-direction-wrapper">, ',
                                '<select class="sort-detail-direction">',
                                    '<option value="asc">' + escapeHtml(t('A->Z')) + '</option>',
                                    '<option value="desc">' + escapeHtml(t('Z->A')) + '</option>',
                                '</select> ',
                            '</span>',
                        '</div>',
                    '</div>',
                    (this.enableColumns ? '<div><label>' + t('Columns') + ': <input type="text" class="detail-column-count" /></label></div>' : ''),
                    // Pivot only supported in first data section for now
                    (isFirst ? 
                        ['<div class="pivot-controls settings-section jsr-settings-section">',
                            '<h3>' + t('PIVOT (CROSS-TAB)') + '</h3>',
                            '<div><label><input type="checkbox" class="pivot-enabled" /> ' + t('Enable pivot') + '</label></div>',
                            '<div><label>' + t('Pivot field') + ': <input type="hidden" class="pivot-column" /></label></div>',
                            '<div><label>' + t('Pivot value bucket type') + ': ',
                                '<select class="pivot-column-bucket-type">',
                                    '<option value="">(' + t('none') + ')</option>',
                                    '<option value="day">' + t('day') + '</option>',
                                    // '<option value="week">week</option>',
                                    '<option value="month">' + t('month') + '</option>',
                                    // '<option value="quarter">quarter</option>',
                                    '<option value="year">' + t('year') + '</option>',
                                '</select>',
                            '</label></div>',
                        '</div>'].join('') : ''),
                    '<div class="jsr-settings-section jsr-data-section-controls">',
                        '<div><button class="btn jsr-add-data-section">Insert data section below</button></div>',
                        (canDelete ? '<div><button class="btn jsr-delete-data-section">Remove this data section</button></div>' : ''),
                    '</div>',
                '</div>',
            '</div>'
        ].join(""));
        if (!this.jasperMode) {
            var $dslist = $("select.level-0-data-source", $target);
            const opts = this.get_data_source_options_for_group().data
                .filter(opt => opt.id !== '__parentgroup');
            opts.forEach(opt => {
                $dslist.append($("<option/>").attr("value", opt.id).text(opt.text));
            });
            $dslist
                .val(section.data_source || '')
                .on("change", evt => {
                    const selectedId = $(evt.target).val();
                    if (this.onDataSourceSelected && typeof this.onDataSourceSelected === 'function') {
                        /** User-supplied function returns true if it handles the event and we don't */
                        if (this.onDataSourceSelected(selectedId)) return;
                    }
                    section.data_source = selectedId.toLowerCase();
                })
                .select2({
                    allowClear: true,
                    placeholder: '(' + t('None') + ')',
                    dropdownAutoWidth: true,
                    dropdownCssClass: 'jsr-select2-dropdown'
                });
        }
        if (isFirst) {
            this.refresh_filter_list();
            $("button.add-filter", this.container).on("click", this.add_filter.bind(this));
        }
        var order_detail_by = section.order_detail_by || '';
        if (order_detail_by !== '') {
            $target.find(".sort-detail-direction-wrapper").show();
        } else {
            $target.find(".sort-detail-direction-wrapper").hide();
        }
        $target.find("input.sort-detail-by")
            .val(section.order_detail_by)
            .on("change", evt => {
                    var val = $(evt.target).val();
                    section.order_detail_by = val;
                    if (val !== '') {
                        $target.find(".sort-detail-direction-wrapper").show();
                    } else {
                        $target.find(".sort-detail-direction-wrapper").hide();
                    }
                })
            .select2({
                    query: this.detail_field_selector_query.bind(this, section),
                    initSelection: this.detail_field_selector_initselection.bind(this, section),
                    allowClear: true,
                    placeholder: '(' + t('select a field') + ')',
                    dropdownAutoWidth: true,
                    dropdownCssClass: 'jsr-select2-dropdown'
                });
        $target.find("select.sort-detail-direction")
            .val(section.order_detail_dir || "asc")
            .on("change", function(evt) {
                section.order_detail_dir = $(evt.target).val();
            }.bind(this));
        $target.find("input.show-detail")
            .prop("checked", section.show_detail !== false)
            .on("change", function(evt) {
                section.show_detail = $(evt.target).prop("checked");
                this.render_template();
            }.bind(this));
        $("select.sort-detail-direction", $target).select2({
            dropdownCssClass: 'jsr-select2-dropdown'
        });
        if (this.enableColumns) {
            $target.find("input.detail-column-count")
                .val(section.column_count)
                .on("change", function(evt) {
                    var column_count = parseInt($(evt.target).val(), 10);
                    if (!isNaN(column_count) && isFinite(column_count)) {
                        if (column_count < 1) {
                            column_count = 1;
                        } else if (column_count > 99) {
                            column_count = 99;
                        }
                        $(evt.target).val(column_count);
                        this.set_column_count(section, column_count);
                    } else {
                        $(evt.target).val(section.column_count);
                    }
                }.bind(this));
        }
        this.apply_editable_row_hover($target);
        $target.find(".sort-detail-container .icon-delete").remove();

        this.render_sub_levels(section);
        const add_grouping_button = $target.find("button.add-sub-level");
        add_grouping_button.text(section.sublevels.length === 0 ? t('Add level/group') : t('Add sub-level/group'));
        add_grouping_button.on("click", this.add_group_level.bind(this, section));

        if (isFirst) {
            if (this.jasperMode) {
                // Pivot not supported in Jasper mode
                $target.find('.pivot-controls').hide();
            } else {
                $target.find("input.pivot-enabled").prop("checked", !!section.pivot_enabled)
                    .on("change", (evt) => {
                        this.set_pivot_enabled($(evt.target).is(":checked"));
                    });
                $target.find("input.pivot-column")
                    .val(section.pivot_expression || "")
                    .select2({
                        query: this.detail_field_selector_query.bind(this, section),
                        initSelection: this.detail_field_selector_initselection.bind(this, section),
                        allowClear: true,
                        placeholder: '(' + t('none') + ')',
                        dropdownAutoWidth: true,
                        dropdownCssClass: 'jsr-select2-dropdown'
                    })
                    .on("change", function(evt) {
                        var pivot_col = $(evt.target).val();
                        if (pivot_col) {
                            section.pivot_expression = "[" + pivot_col + "]";
                        }
                    });
                $target.find("select.pivot-column-bucket-type")
                    .val(section.pivot_column_bucket_type || "")
                    .select2({
                        dropdownAutoWidth: true,
                        dropdownCssClass: 'jsr-select2-dropdown'
                    })
                    .on("change", function(evt) {
                        var bucket_fn = $(evt.target).val();
                        section.pivot_column_bucket_type = bucket_fn || '';
                    });
            }
        }
        $target.find('button.jsr-add-data-section').click(this.onAddDataSectionClick.bind(this, section));
        $target.find('button.jsr-delete-data-section').click(this.onDeleteDataSectionClick.bind(this, section));
    },

    onAddDataSectionClick: function(section) {
        const dataSections = this.getDataSections();
        const ix = dataSections.indexOf(section);
        this.report_def.body = dataSections;
        const newSection = this.getDefaultDataSection();
        $(this).trigger('dataSectionCreated', [ newSection ]);
        dataSections.splice(ix + 1, 0, newSection);
        this.render_data_panel();
        this.render_template();
        this.openDataSection(ix + 1);
    },

    onDeleteDataSectionClick: function(section) {
        if (!confirm('Warning!  This will remove this data section, including any groupings and any elements within it.  Are you sure?')) return;
        const body = this.report_def.body;
        const dataSections = Array.isArray(body) ? body : [ body ];
        const ix = dataSections.indexOf(section);
        this.report_def.body = dataSections;
        dataSections.splice(ix, 1);
        this.render_data_panel();
        this.render_template();
    },

    openDataSection: function(index) {
        const $headers = $(this.container).find(".header-panel.data .jsr-data-section-accordion-header", this.container);
        $headers.eq(index).click();
    },

    getDefaultDataSection: function() {
        return JSON.parse(JSON.stringify(jsreports.defaultReport.body));
    },

    render_data_panel: function() {
        var me = this,
            $target = $(".header-panel.data", this.container);
        const body = this.report_def.body;
        const dataSections = Array.isArray(body) ? body : [ body ];
        $target.empty();
        if (dataSections.length === 1) {
            this.renderDataSectionControls(dataSections[0], $target[0], true);
        } else {
            // Accordion UI
            dataSections.forEach((sec, secIx) => {
                const $accnHeader = $(`<div class="jsr-data-section-accordion-header"><span class="jsr-accordion-icon">▸</span> Data Section ${secIx + 1}</div>`);
                $accnHeader.data('jsr-ix', secIx);
                $accnHeader.on('click', this.onDataSectionAccordionHeaderClick.bind(this));
                $target.append($accnHeader);
                const $accnPaneBody = $(`<div class="jsr-data-section-accordion-pane-body"></div>`);
                $target.append($accnPaneBody);
                this.renderDataSectionControls(sec, $accnPaneBody[0], (secIx === 0), true);
            });
            let totalHeaderHeight = 0;
            $target.find('.jsr-data-section-accordion-header').each((ix, hdr) => totalHeaderHeight += $(hdr).outerHeight());
            this.dataPaneHeight = $target.innerHeight() - totalHeaderHeight - 1;
            $target.find('.jsr-data-section-accordion-pane-body').first().height(this.dataPaneHeight);
        }
    },

    onDataSectionAccordionHeaderClick: function(e) {
        const $hdr = $(e.target);
        const ix = $hdr.data('jsr-ix');
        $(this.container).find('.jsr-data-section-accordion-header').removeClass('jsr-accordion-header-open');
        $hdr.addClass('jsr-accordion-header-open');
        const $allPanes = $(this.container).find('.header-panel.data .jsr-data-section-accordion-pane-body');
        const $thisPane = $allPanes.eq(ix);
        $allPanes.css('height', '0');
        $thisPane.css('height', `${this.dataPaneHeight}px`);
    },

    set_pivot_enabled: function(enabled) {
        const firstDetail = Array.isArray(this.report_def.body) ? this.report_def.body[0] : this.report_def.body;
        firstDetail.pivot_enabled = enabled;
        //var $pivot_inputs = $("");
        this.set_pivot_dividers_visible(enabled);
    },

    set_pivot_dividers_visible: function(visible) {
        if (!this.$pivot_dividers) {
            this.render_pivot_dividers();
        }
        this.$pivot_dividers.toggle(visible);
        this.$pivot_area_shading.toggle(visible);
    },
    
    render_pivot_dividers: function() {
        var me = this,
            html = '<div class="divider vertical pivot-column-divider"></div>',
            left_margin_in_units = this.report_def.page.margins["left"];
        this.$pivot_dividers = $(html + html + html);
        this.preview_el.append(this.$pivot_dividers);
        this.$pivot_divider_left = this.$pivot_dividers.eq(0).addClass("pivot-divider-left");
        this.$pivot_divider_right = this.$pivot_dividers.eq(1).addClass("pivot-divider-right");
        this.$pivot_area_right = this.$pivot_dividers.eq(2).addClass("pivot-divider-right");
        this.$pivot_area_shading = $('<div />').addClass("pivot-area-shading");
        this.preview_el.append(this.$pivot_area_shading);
        var units = this.report_def.page.units,
            paper_width = this.report_def.page.paper_size[units][0],
            preview_width = this.preview_el.width(),
            pixels_per_unit = (preview_width / paper_width);
        var pivot_prop_defaults = {
            'pivot_column_left': 0.45,
            'pivot_column_right': 0.55,
            'pivot_area_right': 0.7
        };
        const firstDetail = Array.isArray(this.report_def.body) ? this.report_def.body[0] : this.report_def.body;
        Object.keys(pivot_prop_defaults).forEach(function(prop) {
            if (typeof firstDetail[prop] === 'undefined') {
                firstDetail[prop] = paper_width * pivot_prop_defaults[prop] - left_margin_in_units;
            }
        });
        this.$pivot_divider_left.css("left", Math.round((firstDetail.pivot_column_left + left_margin_in_units) * pixels_per_unit));
        this.$pivot_divider_right.css("left", Math.round((firstDetail.pivot_column_right + left_margin_in_units) * pixels_per_unit));
        this.$pivot_area_right.css("left", Math.round((firstDetail.pivot_area_right + left_margin_in_units) * pixels_per_unit));
        this.refresh_pivot_shading();
        this.$pivot_dividers
            .addClass('jsr-draggable')
            .drag("start",function( ev, dd ) { 
                var which = me.$pivot_dividers.index($(this));
                dd.limit = {
                    left: (which === 0 ? me.preview_el.find(".divider.margin.left").position().left 
                        : me.$pivot_dividers.eq(which - 1).position().left + 10),
                    right: (which === 2 ? me.preview_el.find(".divider.margin.right").position().left 
                        : me.$pivot_dividers.eq(which + 1).position().left - 10)
                };
            })
            .drag("end", function(ev, dd) {
                var pixels_per_unit = me.get_current_pixels_per_unit(),
                    which = me.$pivot_dividers.index($(this)),
                    propname = Object.keys(pivot_prop_defaults)[which];
                var pos = Math.max(dd.limit.left, Math.min(dd.limit.right, dd.offsetX));
                firstDetail[propname] = (pos / pixels_per_unit) - left_margin_in_units;
                me.refresh_pivot_shading();
            }).drag(function( ev, dd ) {
                $(this).css("left", Math.max(dd.limit.left, Math.min(dd.limit.right, dd.offsetX)));
            }, { relative: true });
    },

    refresh_pivot_shading: function() {
        const firstDetail = Array.isArray(this.report_def.body) ? this.report_def.body[0] : this.report_def.body;
        var left_margin_in_units = this.report_def.page.margins["left"];
        var units = this.report_def.page.units,
            pixels_per_unit = (this.preview_el.width() / this.report_def.page.paper_size[units][0]);
        this.$pivot_area_shading.css({
            'left': parseInt(this.$pivot_divider_right.css('left'), 10) - 2,
            'width': (firstDetail.pivot_area_right - this.report_def.body.pivot_column_right) * pixels_per_unit + 1
        });
    },

    get_current_pixels_per_unit: function() {
        var units = this.report_def.page.units,
            paper_width = this.report_def.page.paper_size[units][0],
            preview_width = this.preview_el.width();
        return (preview_width / paper_width);
    },

    // Get the name of the selected field based on available fields for detail section
    detail_field_selector_initselection: function(section, element, callback) {
        var id = element.val(),
            fieldname = id;
        var data = { id: id, text: fieldname };
        callback(data);
    },

    // Find the list of fields available in the detail section; depends on the group data sources
    detail_field_selector_query: function(section, options) {
        var data = [];
        if (section.sublevels.length > 0) {
            // If groups exist, we have a function to find the effective data fields
            data = this.get_fields_for_group_data_source(section, section.sublevels.length - 1).data;
        } else {
            // Otherwise, just use fields in the data section's root data source
            data = this.get_root_data_source_fields(section).data;
        }
        options.callback({
             more: false,
             results: data
        });
    },

    get_root_data_source_fields: function(dataSection) {
        var schema = this.getSchemaForDataSection(dataSection);
        return this.get_fields_for_schema(schema);
    },

    get_fields_for_schema: function(schema) {
        var fields = [];
        var byId = {};
        if (schema) {
            fields = schema.fields.map(function(field) {
                const safeName = field.name; //field.name.replace(/\W+/g, '_');
                var option = { id: safeName, text: safeName };
                byId[option.id] = option;
                return option;
            });            
        }
        return { byId: byId, data: fields };
    },

    get_data_source_options_for_group: function() {
        let defaultOption = {
                id: "__parentgroup",
                text: "Rows in parent group"
            },
            options,
            byId = {};
        byId[defaultOption.id] = defaultOption;
        if (this.getDataSourceOptions && typeof this.getDataSourceOptions === 'function') {
            options = this.getDataSourceOptions(this.data_sources);
        } else {
            options = this.data_sources.map(ds => ({
                id: ds.id.toLowerCase(),
                text: ds.name || ""
            }));
            options.sort(function(dsA, dsB) {
                return dsA.text.localeCompare(dsB.text);
            });
        }
        options.forEach(option => {
            byId[option.id] = option;
        });
        options.splice(0, 0, defaultOption);
        return {
            data: options,
            byId: byId
        };
    },

    // Provide the list of data sources for the level data source drop-down
    level_data_source_selector_query: function(options) {
        var data_source_list = this.get_data_source_options_for_group();
        options.callback({
            more: false,
            results: data_source_list.data
        });
    },

    // Set the existing value in a level's data source drop-down
    level_data_source_selector_initselection: function(element, callback) {
        var id = element.val(),
            data_source_list = this.get_data_source_options_for_group();
        callback(data_source_list.byId[id]);
    },

    get_fields_for_group_data_source: function(section, group_index) {
        var me = this;
        var group = section.sublevels[group_index],
            options = [],
            byId = {},
            schema_id = group.data_source;
        // If parent is "__parentgroup", traverse upward to the closest non-parent or body datasource
        while (group_index > 0 && schema_id === "__parentgroup") {
            group_index--;
            schema_id = section.sublevels[group_index].data_source;
        }
        var schema;
        if (schema_id === "__parentgroup") {
            schema = this.getSchemaForDataSection(section);
        } else {
            schema = this.data_source_schemas[schema_id];
        }
        if (schema) {
            schema.fields.forEach(function(field) {
                const safeName = field.name; //field.name.replace(/\W+/g, '_');
                var option = {
                    id: me.jasperMode ? ('$F{' + safeName + '}') : safeName,
                    text: safeName
                };
                options.push(option);
                byId[option.id] = option;
            });
        }
        options.sort(function(dsA, dsB) {
            return dsA.text.localeCompare(dsB.text);
        });
        return {
            data: options,
            byId: byId
        };
    },

    /** Helper fn to find data section owning a grouping input */
    getDataSectionFromGroupingControl: function(ctlEl) {
        const $levelList = $(ctlEl).closest('.levels-list');
        const dataSectionIx = $(this.container).find('.levels-list').index($levelList);
        return this.getDataSections()[dataSectionIx];
    },

    // Provide the list of fields in the current level's selected data source
    level_field_selector_query: function(options) {
        var $row = options.element.closest(".grouping-row"),
            dataSection = this.getDataSectionFromGroupingControl(options.element),
            group_index = $row.closest(".levels-list").find('.grouping-row').index($row);
        var field_list = this.get_fields_for_group_data_source(dataSection, group_index);
        options.callback({
            more: false,
            results: field_list.data
        });
    },

    // Get the name of the selected "where" child field for a level
    level_field_selector_initselection: function(element, callback) {
        var $row = element.closest(".grouping-row"),
            dataSection = this.getDataSectionFromGroupingControl(element),
            group_index = $row.closest(".levels-list").find('.grouping-row').index($row);
        var field_list = this.get_fields_for_group_data_source(dataSection, group_index);
        const selectedVal = element.val();
        callback(field_list.byId[selectedVal] || { id: selectedVal, text: selectedVal });
    },

    // Provide the list of fields in the parent level's selected data source
    level_where_parent_field_query: function(options) {
        var $row = options.element.closest(".grouping-row"),
            dataSection = this.getDataSectionFromGroupingControl(options.element),
            group_index = $row.closest(".levels-list").find('.grouping-row').index($row);
        if (group_index < 1) return;
        var field_list = this.get_fields_for_group_data_source(dataSection, group_index - 1);
        options.callback({
            more: false,
            results: field_list.data
        });
    },

    // Get the name of the selected "where" parent field for a level
    level_where_parent_field_initselection: function(element, callback) {
        var $row = element.closest(".grouping-row"),
            dataSection = this.getDataSectionFromGroupingControl(element),
            group_index = $row.closest(".levels-list").find('.grouping-row').index($row);
        if (group_index < 1) return;
        var field_list = this.get_fields_for_group_data_source(dataSection, group_index - 1);
        callback(field_list.byId[element.val()]);
    },
    
    // on_data_source_change: function(evt) {
    //     const firstDetail = Array.isArray(this.report_def.body) ? this.report_def.body[0] : this.report_def.body;
    //     firstDetail.data_source = $(evt.target).val().toLowerCase();
    // },

    get_default_section_height: function() {
        return this.report_def.page.units === "mm" ? 25.4 : 1;
    },

    add_group_level: function(section) {
        var default_section_height = this.get_default_section_height();
        section.sublevels.push({
            "data_source": "__parentgroup", 
            "group_by": "",
            "sort_dir": "asc",
            header: {
                visible: true,
                height: default_section_height,
                elements: []
            },
            footer: {
                visible: true,
                height: default_section_height,
                elements: []
            }
        });
        this.render_sub_levels(section);
        this.render_template();
    },
    
    /**
     * @private
     * Note, removed hover effect, replaced with manual icons to switch in and out of 
     * edit mode
     */
    apply_editable_row_hover: function(container) {
        var designer = this;
        var $rows = $(".editable-row:not(.jsr-ready)", container);
        $rows.append([
                '<div class="editable-row-buttons">',
                    '<div class="editable-row-icon icon-check"><div class="icon-label">' + t('OK') + '</div></div>',
                    '<div class="editable-row-icon icon-edit"><div class="icon-label">' + t('EDIT') + '</div></div>',
                    '<div class="editable-row-icon icon-delete"><div class="icon-label">' + t('DELETE') + '</div></div>',
                '</div>'
            ].join(''))
            .addClass("inactive jsr-ready");
        $rows.find(".icon-check").on("click", this.on_row_check_click.bind(this));
        $rows.find(".icon-edit").on("click", this.on_row_edit_click.bind(this));
        $rows.find(".icon-delete").on("click", this.on_row_delete_click.bind(this));
        $rows.find("input[type=checkbox]").prop("disabled", true);
        // $rows.on("click", function(evt) {
        //  var $row = $(evt.target).closest(".editable-row");
        //  if ($row.length > 0 && $row.hasClass("inactive")) {
        //      designer.on_row_edit_click.call(designer, evt);
        //  }
        // });
        this.set_row_select2s_enabled($rows, false);
    },
    
    on_row_edit_click: function(evt) {
        var $row = $(evt.target).closest(".editable-row");
        $row.find("input[type=checkbox]").prop("disabled", false);
        $row.removeClass("inactive");
        this.set_row_select2s_enabled($row, true);
    },

    on_row_check_click: function(evt) {
        var $row = $(evt.target).closest(".editable-row");
        $row.find("input[type=checkbox]").prop("disabled", true);
        $row.addClass("inactive");
        this.set_row_select2s_enabled($row, false);
    },
    
    set_row_select2s_enabled: function($row, enabled) {
        $row.find("select, input").each(function(index, sel) {
            var $select2 = $(sel).data("select2");
            if ($select2) {
                $select2.enable(enabled);
            }
        });
    },
    
    on_row_delete_click: function(evt) {
        var $row = $(evt.target).closest(".editable-row");
        switch ($row.data("row-type")) {
            case "filter":
                this.delete_filter_row($row);
                break;
            case "group":
                this.delete_group_row($row);
                break;
            case "input":
                this.delete_input_row($row);
                break;
        }
    },
    
    delete_filter_row: function($row) {
        var ix = $row.index();
        this.report_def.filters.splice(ix, 1);
        this.refresh_filter_list();
    },
    
    delete_group_row: function($row) {
        const section = this.getDataSectionFromGroupingControl($row[0]);        
        var ix = $row.index(),
            groupdef = section.sublevels[ix],
            element_count = groupdef.header.elements.length + groupdef.footer.elements.length;
        if (element_count > 0) {
            var proceed = confirm(t('This will permanently delete {count} element(s) from the header and footer of this group.  Are you sure you want to remove this group?', { count: element_count }));
            if (!proceed) return;
        }
        section.sublevels.splice(ix, 1);
        this.render_sub_levels(section);
        this.render_template();
    },
    
    delete_input_row: function($row) {
        var ix = $row.index();
        this.report_def.inputs.splice(ix, 1);
        $row.remove();
    },
    
    reset_timeout: function($elt, fn, delay) {
        var id = $elt.attr("id");
        if (id && this.pending_timeouts[id]) {
            window.clearTimeout(this.pending_timeouts[id]);
        }
        if (fn) {
            this.pending_timeouts[id] = window.setTimeout(fn, delay);
        }
    },
    
    add_filter: function() {
        this.report_def.filters.push({
            field: "",
            operator: "is",
            operand: ""
        });
        this.refresh_filter_list();
    },
    
    add_input: function() {
        this.report_def.inputs.push({
            "name": "",
            "type": "text",
            "default": ""
        });
        this.render_inputs();
    },
    
    refresh_filter_list: function() {
        var me = this,
            $filter_section = $(".filters-section", this.container),
            $filter_list = $(".filters-list", $filter_section),
            // $first_filter_button = $("button.add-first-filter", this.container),
            i = 1,
            dataSection = this.getDataSections()[0],
            field_list_options_html = this.get_field_list_options_html(dataSection);
        // if (this.report_def.filters.length > 0) {
        //     $filter_section.show('fast');
        //     $first_filter_button.hide();
        //     $("button.add-filter", this.container).show();
        // } else {
        //     $filter_section.hide();
        //     $first_filter_button.show();
        //     $("button.add-filter", this.container).hide();
        // }
        $filter_list.empty();
        this.report_def.filters.map(function(filterdef) {
            var $filter_row = $([
                '<div class="editable-row filter-row" data-row-type="filter" data-filterindex="' + (i - 1) + '">', 
                    // '<div class="filter-row-preamble">',
                    // (i === 1 ? "Filters:" : "and"),
                    // '</div>',
                    i + ': ',
                    '<select class="filter-field filter-', i, '-field">',
                        '<option value="">(' + t('select a field') + ')</option>',
                        field_list_options_html,
                    '</select><br/>',
                    '<select class="filter-operator filter-' + i + '-operator">',
                        '<option value="is" data-fortypes="all">' + t('is') + '</option>',
                        '<option value="isnot" data-fortypes="all">' + t('is not') + '</option>',
                        '<option value="contains" data-fortypes="string">' + t('contains') + '</option>',
                        '<option value="doesnotcontain" data-fortypes="string">' + t('does not contain') + '</option>',
                        '<option value="gt" data-fortypes="number">' + t('is greater than') + '</option>',
                        '<option value="lt" data-fortypes="number">' + t('is less than') + '</option>',
                        '<option value="gte" data-fortypes="number">' + t('is greater than or equal to') + '</option>',
                        '<option value="lte" data-fortypes="number">' + t('is less than or equal to') + '</option>',
                        '<option value="before" data-fortypes="date">' + t('is before') + '</option>',
                        '<option value="after" data-fortypes="date">' + t('is after') + '</option>',
                        '<option value="onorbefore" data-fortypes="date">' + t('is on or before') + '</option>',
                        '<option value="onorafter" data-fortypes="date">' + t('is on or after') + '</option>',
                    '</select>',
                    '<span class="filter-operand filter-', i, '-operand"><input class="" /><span class="readonly"></span></span>',
                '</div>'
            ].join(''));
            $filter_list.append($filter_row);
            var $field_select = $(".filter-field", $filter_row);
            $field_select.val(filterdef.field);
            $field_select.on("change", function(evt) {
                var $row = $(evt.target).closest(".filter-row");
                me.update_filter_operand_availability($row);
            });
            var $operator_select = $(".filter-operator", $filter_row);
            var $operand_input = $(".filter-operand input", $filter_row);
            $operator_select.val(filterdef.operator)
                .on("change", function(evt) {
                    this.set_filter_operand_placeholder($operator_select.val(), $operand_input);
                }.bind(this));
            $operand_input.val(filterdef.operand);
            $operand_input.on("change", this.on_filter_operand_change.bind(this));
            $operand_input.on("change", this.on_filter_input_change.bind(this));
            $("select", $filter_row).on("change", this.on_filter_input_change.bind(this));
            this.set_filter_operand_readonly_text($operand_input);
            this.set_filter_operand_placeholder(filterdef.operator, $operand_input);
            $(".icon-delete", $filter_row).on("click", function() {
                var $row = $(this).closest(".filter-row"),
                    ix = $row.index();
                me.report_def.filters.splice(ix, 1);
                $row.remove();
                // if (me.report_def.filters.length === 0) {
                //     $filter_section.hide();
                //     $first_filter_button.show();
                // }
            });
            i++;
        }.bind(this));
        $("select", $filter_section).select2({
            //dropdownCssClass: "select2-dropdown filter-row-dropdown"
            dropdownAutoWidth: true,
            dropdownCssClass: 'jsr-select2-dropdown'
        });
        this.apply_editable_row_hover($filter_section);
    },
    
    update_filter_operand_availability: function($row) {
        // first set all enabled
        var $all_operators = $(".filter-operator option", $row);
        $all_operators.removeAttr("disabled");
        const dataSection = this.getDataSections()[0];  // First only for now
        var current_ds = this.getSchemaForDataSection(dataSection),
            filter_fieldname = $("select.filter-field", $row).val();
        if (current_ds && filter_fieldname) {
            var field = this.find_field_by_fieldname(current_ds, filter_fieldname);
            if (field) {
                $all_operators.each(function(ix, option) {
                    var $option = $(option),
                        fortypes = $option.data("fortypes");
                    if (!(fortypes === "all" || fortypes.indexOf(field.type) > -1)) {
                        $option.attr("disabled", "disabled");
                    }
                });
            }
        }
    },
    
    find_field_by_fieldname: function(ds, fieldname) {
        for (var i = 0; i < ds.fields.length; i++) {
            if (ds.fields[i].name === fieldname) {
                return ds.fields[i];
            }
        }
        return null;
    },
    
    on_filter_input_change: function(evt) {
        var $row = $(evt.target).closest(".filter-row"),
            ix = Number($row.data("filterindex")),
            field = $row.find("select.filter-field").val(),
            operator = $row.find("select.filter-operator").val(),
            operand = $row.find(".filter-operand input").val();
        $.extend(this.report_def.filters[ix], {
            field: field,
            operator: operator,
            operand: operand
        });
    },
    
    on_filter_operand_change: function(evt) {
        this.set_filter_operand_readonly_text($(evt.target));
    },
    
    set_filter_operand_readonly_text: function($input) {
        var val = $input.val(),
            readonly = (val === '' ? "(enter a value)" : val);
        $input.closest(".filter-operand").find(".readonly").text(readonly);
    },
    
    set_filter_operand_placeholder: function(operand, $input) {
        let placeholder = '';
        switch (operand) {
            case "is":
            case "isnot":
                placeholder = t('e.g. Johnson or 42 or 5/14/2017 (m/d/y)');
                break;
            case "contains":
            case "doesnotcontain":
                placeholder = t('e.g. Johnson');
                break;
            case "gt":
            case "lt":
            case "gte":
            case "lte":
                placeholder = t('e.g. 42');
                break;
            case "before":
            case "after":
            case "onorbefore":
            case "onorafter":
                placeholder = t('e.g. 5/19/2017 (m/d/y) or 2017-05-19');
                break;
            case "isoneof":
                placeholder = t('e.g. 1, 8, 42 or Johnson, Stevens, Smith');
                break;
        }
        $input.attr("placeholder", placeholder);
    },
    
    render_sub_levels: function(dataSection) {
        const body = this.report_def.body;
        const dataSections = Array.isArray(body) ? body : [ body ];
        const sectionIx = dataSections.indexOf(dataSection);
        const $levels = $(this.container).find('.levels-list').eq(sectionIx);
        var me = this,
            i = 1,
            field_list_options_html = this.get_field_list_options_html(dataSection);
        $levels.empty();
        dataSection.sublevels.forEach(function(level, index) {
            var $level = $([
                '<div class="editable-row grouping-row" data-row-type="group">', i, ': ',
                    // Jasper mode doesn't allow different data sources for sublevels (only re-grouping parent set)
                    ((index > 0 && !me.jasperMode) ? 
                        [
                            t('Using data') + ': ',
                            '<input class="level-', i, '-data-source level-data-source" type="text" /><br/>',
                            '<div class="level-', i, '-where level-where">',
                                t('where') + ': ',
                                '<input class="level-', i, '-where-child-field level-where-child-field" type="text" />',
                                '<span class="level-where-parent-wrap">',
                                    ' ' + t('equals parent\'s') + ' ',
                                    '<input class="level-', i, '-where-parent-field level-where-parent-field" type="text" />',
                                '</span>',
                            '</div>'
                        ].join('')
                        : ''),
                    ((index === 0 || me.jasperMode) ? t('Group by') : t('group by')), ' ',
                    '<input class="level-', i, '-group-by group-by" type="text" />',
                    '<div class="group-sort-controls">',
                        t('ordered by') + ' ',
                        '<input class="level-', i, '-sort-by group-sort-by" type="text" /> ',
                        '<select class="level-', i, '-sort-dir group-sort-dir">',
                            '<option value="asc">' + escapeHtml(t('A->Z')) + '</option>',
                            '<option value="desc">' + escapeHtml(t('Z->A')) + '</option>',
                        '</select>',
                    '</div>',
                    '<div>',
                        t('with') + ': ',
                        '<label class="group-header-footer-vis-cb"><input type="checkbox" class="show-header-cb" /> ' + t('header') + '</label> ',
                        '<label class="group-header-footer-vis-cb"><input type="checkbox" class="show-footer-cb" /> ' + t('footer') + '</label> ',
                    '</div>',
                '</div>'
            ].join(''));
            $(".show-header-cb", $level).prop("checked", level.header.visible !== false);
            $(".show-footer-cb", $level).prop("checked", level.footer.visible !== false);
            $("input.group-by", $level).val(level.group_by || "");
            if (me.jasperMode) {
                $level.find('.group-sort-controls').hide();
            } else {
                $("input.group-sort-by", $level).val(level.sort_by || "");
                $("select.group-sort-dir", $level).val(level.sort_dir || "asc");
            }
            var $child_filter_selector = $level.find(".level-where-child-field");
            $child_filter_selector.val(level.where_child_field || "");
            $level.find(".level-where-parent-field").val(level.where_parent_field || "");
            me.set_level_parent_wrap_visibility($child_filter_selector);
            if (index > 0 && !me.jasperMode) {
                $("input.level-data-source", $level).val(level.data_source || "__parentgroup");
                // Only levels coming from external data sources have a "where" clause
                if (level.data_source === "__parentgroup") {
                    $level.find(".level-where").hide();
                } else {
                    $level.find(".level-where").show();
                }
            }
            $levels.append($level);
            i++;
        });
        $("input.group-by, input.group-sort-by", $levels).select2({
            query: this.level_field_selector_query.bind(this),
            initSelection: this.level_field_selector_initselection.bind(this),
            allowClear: true,
            placeholder: '(' + t('select a field') + ')',
            dropdownAutoWidth: true,
            dropdownCssClass: 'jsr-select2-dropdown'
        });
        $("input.level-data-source", $levels).select2({
            query: this.level_data_source_selector_query.bind(this),
            initSelection: this.level_data_source_selector_initselection.bind(this),
            allowClear: true,
            dropdownAutoWidth: true,
            dropdownCssClass: 'jsr-select2-dropdown'
        }).on("change", function(evt) {
            var $select = $(evt.target);
            if (this.onDataSourceSelected && typeof this.onDataSourceSelected === 'function') {
                /** User-supplied function returns true if it handles the event and we don't */
                if (this.onDataSourceSelected($select.val())) return;
            }
            let $row = $select.closest(".grouping-row"),
                row_index = $levels.find(".grouping-row").index($row),
                groupdef = dataSection.sublevels[row_index];
            groupdef.data_source = $select.val();
            // When level data source changes, show/hide filter -- only allow filter for external data sources
            var $ds = $(this),
                $whereDiv = $ds.closest(".grouping-row").find(".level-where");
            if ($ds.val() === "__parentgroup") {
                $whereDiv.hide();
            } else {
                $whereDiv.show();
            }
        });
        $("input.level-where-child-field", $levels).select2({
            query: this.level_field_selector_query.bind(this),
            initSelection: this.level_field_selector_initselection.bind(this),
            allowClear: true,
            placeholder: '(' + t('no filter') + ')',
            dropdownAutoWidth: true,
            dropdownCssClass: 'jsr-select2-dropdown'
        }).on("change", function(evt) {
            var $select = $(evt.target),
                $row = $select.closest(".grouping-row"),
                row_index = $levels.find(".grouping-row").index($row),
                groupdef = dataSection.sublevels[row_index];
            groupdef.where_child_field = $select.val();
            me.set_level_parent_wrap_visibility($(this));
        });
        $("input.level-where-parent-field", $levels).select2({
            query: this.level_where_parent_field_query.bind(this),
            initSelection: this.level_where_parent_field_initselection.bind(this),
            allowClear: true,
            placeholder: '(' + t('select a field') + ')',
            dropdownAutoWidth: true,
            dropdownCssClass: 'jsr-select2-dropdown'
        }).on("change", function(evt) {
            var $select = $(evt.target),
                $row = $select.closest(".grouping-row"),
                row_index = $levels.find(".grouping-row").index($row),
                groupdef = dataSection.sublevels[row_index];
            groupdef.where_parent_field = $select.val();
            me.set_level_parent_wrap_visibility($(this));
        });
        $("select", $levels).select2({
            dropdownCssClass: 'jsr-select2-dropdown'
        });
        $("input[type=checkbox]", $levels).on("change", function(evt) {
            var $cb = $(evt.target),
                $row = $cb.closest(".grouping-row"),
                is_header_cb = $cb.hasClass("show-header-cb"),
                row_index = $levels.find(".grouping-row").index($row),
                dataSection = $cb.prop("checked"),
                section_to_modify = dataSection.sublevels[row_index].header;
            if (!is_header_cb) {
                section_to_modify = dataSection.sublevels[row_index].footer;
            }
            section_to_modify.visible = checked;
            var min_section_height = me.get_default_section_height();
            // Enforce a minimum height when (re-)activating a header/footer, can't interact w/ it otherwise
            if (checked && (section_to_modify.height || 0) < (10 / me.pixels_per_unit)) {
                section_to_modify.height = 10 / me.pixels_per_unit;
            }
            me.render_template();
        });
        $("input.group-by", $levels).on("change", function(evt) {
            var $select = $(evt.target),
                $row = $select.closest(".grouping-row"),
                row_index = $levels.find(".grouping-row").index($row),
                groupdef = dataSection.sublevels[row_index],
                $group_sort_sel = $row.find("select.group-sort-by");
            groupdef.group_by = $select.val();
            // if "sort by" not already chosen, default to sort by the new grouping key
            if ($group_sort_sel.val() === "") {
                $group_sort_sel.select2("val", groupdef.group_by);
            }
        });
        $("input.group-sort-by", $levels).on("change", function(evt) {
            var $select = $(evt.target),
                $row = $select.closest(".grouping-row"),
                row_index = $levels.find(".grouping-row").index($row),
                groupdef = dataSection.sublevels[row_index];
            groupdef.sort_by = $select.val();
        });
        $("select.group-sort-dir", $levels).on("change", function(evt) {
            var $select = $(evt.target),
                $row = $select.closest(".grouping-row"),
                row_index = $levels.find(".grouping-row").index($row),
                groupdef = dataSection.sublevels[row_index];
            groupdef.sort_dir = $select.val();
        });
        this.apply_editable_row_hover($levels);
    },

    set_level_parent_wrap_visibility: function($childFilterSelector) {
        var $parentWrap = $childFilterSelector.closest(".grouping-row").find(".level-where-parent-wrap");
        if ($childFilterSelector.val() !== "") {
            $parentWrap.show();
        } else {
            $parentWrap.hide();
        }
    },
    
    /** 
     * From a section entry wrapper object (visible section in template rendering),
     * get the data source schema for that section.
     * Check upward from a detail section or sub-level (group header/footer) to the first
     * non-inherited data source (non-"__parentgroup").
     */ 
    getSchemaForSectionEntry: function(sectionEntry) {
        const dataSection = this.getDataSections()[sectionEntry.detailIndex || 0];
        let group_index = (sectionEntry.is_detail ? 
            (dataSection.sublevels || []).length - 1 : sectionEntry.level);
        let group;
        let schema_id = '__parentgroup';
        // Traverse upward to the closest non-parent or body datasource
        while (group_index >= 0 && schema_id === "__parentgroup") {
            group = dataSection.sublevels[group_index];
            schema_id = group.data_source;
            group_index--;
        }
        var schema;
        if (schema_id === "__parentgroup") {
            // Default to data source for dataSection
            schema = this.getSchemaForDataSection(dataSection);
        } else {
            // Found direct ID reference to primary data source
            schema = this.data_source_schemas[schema_id];
        }
        return schema;
    },

    /** Expects dataSection def (raw body definition object) */
    getSchemaForDataSection: function(dataSection) {
        if (!dataSection) return null;
        if (this.jasperMode) {
            return this.jasperDef.embeddedSchema;
        }
        var selected_ds_id = dataSection.data_source;
        return (selected_ds_id ? this.data_source_schemas[selected_ds_id] : null);
    },
    
    get_field_list_options_html: function(dataSection) {
        var me = this;
        var sch = this.getSchemaForDataSection(dataSection);
        if (!sch) {
            return '<option value="">(' + t('Data source schema missing') + ')</option>';
        }
        var fields = sch.fields.sort(this.sort_fields_alpha);
        return sch.fields.map(function(fld) {
            var val = me.jasperMode ? ('$F{' + fld.name + '}') : fld.name;
            return '<option value="' + val + '">' + fld.name + '</option>';
        }).join('');
    },
    
    sort_fields_alpha: function(field_a, field_b) {
        return field_a.name.localeCompare(field_b.name);
    },

    /**
     * @private
     * Convert the dimensioned user-specified current margins to usable pixel amounts based on current preview width
     */
    compute_preview_margins: function() {
        this.preview_margins = {};
        var units = this.report_def.page.units,
            paper_width = this.report_def.page.paper_size[units][0],
            preview_width = this.preview_el.width(),
            pixels_per_unit = (preview_width / paper_width);
        ["left", "top", "right", "bottom"].map(function(side) {
            this.preview_margins[side] = Math.floor(Math.min(preview_width, this.report_def.page.margins[side] * pixels_per_unit));
        }.bind(this));
    },
    
    render_template: function() {
        if (this.toolbarPosition !== "float") {
            this.hide_toolbar();
        }
        delete this.fontScaleFactor;
        this.hideHintBar();
        this.elements_by_id = {};
        this.sections_by_element_id = {};
        this.preview_el.empty();
        this.$delete_element_button = null;
        this.preview_section_offsets = [];
        this.compute_preview_margins();
        this.$pivot_dividers = null;
        this.section_highlight_el = null;
        this.xSnapLine = null;
        this.ySnapLine = null;
        this.hintBar = null;
        var me = this,
            sections = this.getAllSections(null, true),
            $preview_el = this.preview_el,
            def = this.report_def,
            preview_width = $preview_el.width(),
            units = this.report_def.page.units,
            paper_width = this.report_def.page.paper_size[units][0],
            pixels_per_unit = (preview_width / paper_width),
            paper_height_px = this.report_def.page.paper_size[units][1] * pixels_per_unit,
            offset = this.preview_margins.top;
        this.pixels_per_unit = pixels_per_unit;

        var $divider = $('<div class="divider margin horizontal"></div>');
        $divider.css("top", Math.min(paper_height_px, this.preview_margins.top) + "px");
        $preview_el.append($divider);
        $divider = $('<div class="divider margin left"></div>');
        // Shift by 2px because we have some padding around the actual line, for a drag handle
        $divider.css("left", (this.preview_margins.left + 2) + "px");
        $preview_el.append($divider);
        $divider = $('<div class="divider margin right"></div>');
        $divider.css("left", (preview_width - this.preview_margins.right + 2) + "px");
        $preview_el.append($divider);
        $divider = $('<div class="divider margin horizontal"></div>');
        $divider.css("top", Math.max(0, paper_height_px - this.preview_margins.bottom) + "px");
        $preview_el.append($divider);
        sections.map(function(section) {
            this.render_template_section_elements(section, offset);
            var $label = $(['<div class="section-label">', section.label, '</div>'].join(''));
            $preview_el.append($label);
            $label.css({
                left: this.preview_margins.left,
                top: offset
            });
            // Keep track of section position for showing highlights when dragging
            this.preview_section_offsets.push({
                top: Math.round(offset),
                bottom: Math.round(offset + (section.def.height * this.pixels_per_unit)),
                left: this.preview_margins.left,
                right: this.preview_margins.right,
                def: section.def,
                sectionInfo: section,
                label: section.label,
                is_header: !!section.is_header,
                is_footer: !!section.is_footer,
                is_detail: !!section.is_detail,
                level: section.level
            });

            // Bottom divider for section
            var $divider = $('<div class="divider section-divider horizontal movable"></div>');
            $divider.css({
                "top": (offset + section.def.height * this.pixels_per_unit) + "px",
                "left": this.preview_margins.left + "px",
                "right": this.preview_margins.right + "px"
            });
            $preview_el.append($divider);

            $divider
                .addClass('jsr-draggable')
                .drag("start", function(ev, dd) {
                    var top_limit = 0,
                        bottom_limit = 10000,
                        my_pos = $divider.position().top;
                    $preview_el.find('.divider.horizontal').each(function(ix, el) {
                        var $el = $(el);
                        if ($el.is($divider)) return;
                        var dividerPos = $el.position().top;
                        if (dividerPos < my_pos && dividerPos > top_limit) {
                            top_limit = dividerPos;
                        } else if (dividerPos > my_pos && dividerPos < bottom_limit) {
                            bottom_limit = dividerPos;
                        }
                    });
                    dd.limit = {
                        top: top_limit + 1,
                        bottom: bottom_limit - 1
                    };
                })
                .drag("end", function(ev, dd) {
                    section.def.height += (dd.deltaY / this.pixels_per_unit);
                    me.fit_section(section.def);
                    me.render_template();
                }.bind(this))
                .drag(function( ev, dd ) {
                    $(this).css({ top: Math.max(dd.limit.top, Math.min(dd.limit.bottom, dd.offsetY)) });
                }, { relative: true });
            
            // Render column dividers & mask
            if (section.columns && section.columns > 1) {
                var col_width = Math.floor((preview_width 
                    - this.preview_margins.left 
                    - this.preview_margins.right) / section.columns);
                for (var i = 1; i < section.columns; i++) {
                    $divider = $('<div class="divider column-divider"></div>');
                    $divider.css({
                        "left": (this.preview_margins.left + (i * col_width)) + "px",
                        "top": offset + "px",
                        "height": (section.def.height * this.pixels_per_unit) + "px"
                    });
                    $preview_el.append($divider);
                }
                var $colmask = $('<div class="jsr-column-mask"></div>');
                $colmask.css({
                    top: offset + "px",
                    height: (section.def.height * this.pixels_per_unit) + "px",
                    left: (this.preview_margins.left + col_width) + "px",
                    right: this.preview_margins.right + "px"
                });
                $preview_el.append($colmask);
            }

            if (section.def.height) {
                offset += (section.def.height * this.pixels_per_unit);
            }
        }.bind(this));
        this.adjust_preview_dimensions();
        delete this.lastAutoScroll;
        const firstDetail = Array.isArray(this.report_def.body) ? this.report_def.body[0] : this.report_def.body;        
        this.set_pivot_dividers_visible(!!firstDetail.pivot_enabled);
        // Delay before cloning columns because some elements wait to render
        setTimeout(function() {
            this.update_column_clones();
            // $preview_el.removeClass("redrawing");    
            this.initial_render_complete = true;
        }.bind(this), 0);
    },

    /**
     * @private
     * Return wrapper objects for all sections in the report
     */
    getAllSections: function(def, visibleOnly) {
        var sections = [];
        if (!def) def = this.report_def;
        function addPageHeader() {
            if (def.page_header && (!visibleOnly || def.page_header.visible !== false)) {
                sections.push({ label: t('Page Header'), def: def.page_header, is_header: true });
            }
        }
        function addReportHeader() {
            if (def.header && (!visibleOnly || def.header.visible !== false)) {
                sections.push({ label: t('Report Header'), def: def.header, is_header: true });
            }
        }
        if (this.jasperMode) {
            addReportHeader();
            addPageHeader();
        } else {
            addPageHeader();
            addReportHeader();
        }
        if (def.columns && def.columns.header && (!visibleOnly || def.columns.header.visible !== false)) {
            sections.push({ label: t('Column Header'), def: def.columns.header, is_header: true });
        }
        var i, sublevel, levelname;
        let details = def.body;
        if (!Array.isArray(details)) {
            details = [ details ];
        }
        details.forEach((detail, detailIx) => {
            const sublevels = detail.sublevels || [];
            for (i = 0; i < sublevels.length; i++) {
                sublevel = sublevels[i];
                levelname = (sublevel.group_by ? 
                    t('{group_field} group header', { group_field: sublevel.group_by })
                    : t('Group {index} header', { index: i + 1 }));
                if (sublevel.header && (!visibleOnly || sublevel.header.visible !== false)) {
                    sections.push({ label: levelname, def: sublevel.header, is_header: true, level: i, detailIndex: detailIx });
                }
            }
            if (!visibleOnly || detail.show_detail !== false) {
                sections.push({ 
                    label: t('Detail {index}', { index: detailIx + 1 }), 
                    def: detail, 
                    columns: detail.column_count, 
                    is_detail: true, 
                    detailIndex: detailIx 
                });
                if (detail.extraSections) {
                    sections = sections.concat(detail.extraSections.map((section, extraIx) => ({
                        label: t('Detail {index}', { index: detailIx + 1 }), 
                        def: section,
                        columns: 1,
                        is_detail: true, 
                        detailIndex: detailIx,
                        extraSectionIndex: extraIx,
                        isExtraSection: true
                    })));
                }
            }
            for (i = sublevels.length - 1; i >= 0; i--) {
                sublevel = sublevels[i];
                levelname = (sublevel.group_by ? 
                    t('{group_field} group footer', { group_field: sublevel.group_by })
                    : t('Group {index} footer', { index: i + 1 }));
                if (sublevel.footer && (!visibleOnly || sublevel.footer.visible !== false)) {
                    sections.push({ label: levelname, def: sublevel.footer, is_footer: true, level: i, detailIndex: detailIx });
                }
            }
        });
        if (def.columns && def.columns.footer && (!visibleOnly || def.columns.footer.visible !== false)) {
            sections.push({ label: t('Column Footer'), def: def.columns.footer, is_footer: true });
        }
        function addReportFooter() {
            if (def.footer && (!visibleOnly || def.footer.visible !== false)) {
                sections.push({ label: t('Report Footer'), def: def.footer, is_footer: true });
            }
        }
        function addPageFooter() {
            if (def.page_footer && (!visibleOnly || def.page_footer.visible !== false)) {
                sections.push({ label: t('Page Footer'), def: def.page_footer, is_footer: true });
            }
        }
        if (this.jasperMode) {
            addPageFooter();
            addReportFooter();
        } else {
            addReportFooter();
            addPageFooter();
        }
        return sections;
    },

    /**
     * @private
     * Return all element definitions, visible or not
     */
    getAllElementDefs: function() {
        var sections = this.getAllSections(null, false);
        var elts = [];
        sections.forEach(function(sectionWrapper) {
            elts = elts.concat(sectionWrapper.def.elements || []);
        });
        return elts;
    },

    /**
     * @private
     * When redrawing the template or when a detail element is changed and there is more
     * than one detail column, refresh the "phantom" rendering in columns 2..n to match
     */
    update_column_clones: function() {
        this.preview_el.find(".jsr-column-clone-element").remove();
        const body = this.report_def.body;
        const details = Array.isArray(body) ? body : [ body ];
        var $clone;
        details.forEach(detail => {
            if (detail.column_count > 1) {
                var col_width = Math.floor((this.preview_el.width()
                    - this.preview_margins.left 
                    - this.preview_margins.right) / detail.column_count);
                for (var i = 0; i < detail.elements.length; i++) {
                    var $el = this.preview_el.find("#" + detail.elements[i].id),
                        is_selected = $el.is(this.editing_control_elt);
                    if ($el) {
                        var left = parseInt($el.css("left"), 10);
                        for (var col = 1; col < detail.column_count; col++) {
                            $clone = $el.clone(false).addClass("jsr-column-clone-element");
                            if (is_selected) {
                                $clone.find(".jsr-resize-handle").remove();
                            }
                            $clone.css({
                                left: (left + (col * col_width)) + "px"
                            });
                            this.preview_el.append($clone);
                        }
                    }
                }
            }
        });
    },
    
    find_section_by_y: function(y) {
        // All values in pixels
        y = Math.round(y);
        for (var i = 0; i < this.preview_section_offsets.length; i++) {
            var sec = this.preview_section_offsets[i];
            if (y >= sec.top && y < sec.bottom) {
                return sec;
            }
        }
        return null;
    },
    
    // set_section_height: function(sublevel_def, new_height) {
    //  sublevel_def.height = new_height;
    //  this.render_template();
    // },
    
    getConditionalPropertiesButton() {
        const $btn = $(`<div class="tool-item gradient jsr-toolbar-conditional-properties not-pressable"><div class="icon"></div><div class="jsr-cond-props-count-bubble"></div></div>`);
        $btn.on('click', this.onConditionalPropertiesButtonClick.bind(this));
        return $btn;
    },

    /** 
     * Takes the template div for jqtoolbar (for example, the one returned
     * by create_text_toolbar) and adds the template item for the conditional
     * properties button.  This button will need to be bound to the actual
     * toolbar instance via bindConditionalPropertiesButton().
     */
    addConditionalPropertiesButtonToToolbar(toolbarTemplateEl) {
        const existingButton = toolbarTemplateEl.querySelector('.jsr-toolbar-conditional-properties');
        if (existingButton) return;
        const $lastRow = $(toolbarTemplateEl).find('.tool-item').last().parent();
        $lastRow.append(this.getConditionalPropertiesButton());
    },

    onConditionalPropertiesButtonClick: function(evt) {
        const btn = $(evt.target).closest('.tool-item')[0];
        const propTypes = this.selectedSection ? 
            this.getPropertiesForSection()
            : this.getPropertiesForElementType(this.editing_control_def.type);
        const containingSection = this.selectedSection 
            || this.find_section_by_y(this.editing_control_elt.position().top).sectionInfo;
        const activeSchema = this.getSchemaForSectionEntry(containingSection);
        const context = {
            schema: activeSchema
        };
        if (this.conditionalPropertiesPicker) return;
        const saveCallback = $(btn).data('saveCallback') || null;
        this.conditionalPropertiesTarget = $(btn).data('targetDef') || this.editing_control_def || this.selectedSection.def;
        const getOperatorsCallback = this.getAllowedConditionalRulesOperators || null;
        var picker = new jsreports.designer.controls.ConditionalPropertiesPicker(propTypes, context, getOperatorsCallback);
        picker.setColorPalette(this.color_palette);
        picker.setFonts(this.default_fonts);
        picker.setValue(this.conditionalPropertiesTarget.conditionalRules);
        picker.showPopup(btn);
        this.conditionalPropertiesPicker = picker;
        // Temporarily store a reference to the active element due to timing issues when closing on blur
        $(picker).on('save', (evt, rules) => {
            const count = (rules ? rules.length : 0);
            if (count > 0) {
                this.conditionalPropertiesTarget.conditionalRules = rules;
            } else {
                delete this.conditionalPropertiesTarget.conditionalRules;
            }
            this.setCondPropsCount(count, btn);
            if (saveCallback) {
                saveCallback(rules);
            }
        }).on('close', () => {
            this.conditionalPropertiesPicker = null;
            this.conditionalPropertiesTarget = null;
        });
    },

    getPropertiesForSection: function() {
        return {
            visible: PropTypes.boolean,
            shrinkToFit: PropTypes.boolean
        };
    },

    getPropertiesForElementType: function(eltType) {
        let props = {
            visible: PropTypes.boolean,
            left: PropTypes.number,
            top: PropTypes.number,
            width: PropTypes.number,
            height: PropTypes.number,
        };
        switch (eltType) {
            case 'text':
                _.extend(props, {
                    text: PropTypes.string,
                    bold: PropTypes.boolean,
                    underline: PropTypes.boolean,
                    italic: PropTypes.boolean,
                    text_color: PropTypes.color,
                    background_color: PropTypes.color,
                    font: PropTypes.font,
                    fontsize: PropTypes.number,
                    align: PropTypes.oneOf(['left', 'center', 'right'])
                });
                break;
            case 'image':
                _.extend(props, {
                    url: PropTypes.string
                });
                break;
            case 'box':
                _.extend(props, {
                    background_color: PropTypes.color,
                    border_color: PropTypes.color,
                    corner_radius: PropTypes.number
                });
                break;
            case 'barcode':
                _.extend(props, {
                    value: PropTypes.string
                });
                break;
            case "chart_line":
            case "chart_bar":
            case "chart_pie":
                break;
            case 'break':
                ['left', 'width', 'height'].forEach(removeProp => { delete props[removeProp]; });
                break;
            default:
                const elClass = this.elementTypes[eltType.toLowerCase()].handler;
                if (elClass) {
                    props = _.extend({}, elClass.propTypes);
                }
        }
        return props;
    },

    create_text_toolbar: function() {
        var me = this;
        this.text_toolbar = $([
            '<div id="jsr-designer-text-toolbar" style="display:none">',
                '<div>',
                    '<div class="tool-item gradient jsr-toolbar-text-content not-pressable"><div class="input-wrap"></div></div>',
                    '<div class="tool-item gradient jsr-toolbar-text-textcolor not-pressable"><input type="text" /></div>',
                    '<div class="tool-item gradient jsr-toolbar-text-backgroundcolor not-pressable"><input type="text" /></div>',
                '</div>',
                '<div>',
                    '<div class="tool-item gradient jsr-toolbar-text-bold"><div class="icon"></div></div>',
                    '<div class="tool-item gradient jsr-toolbar-text-italic"><div class="icon"></div></div>',
                    '<div class="tool-item gradient jsr-toolbar-text-underline"><div class="icon"></div></div>',
                    '<div class="tool-item gradient jsr-toolbar-text-font-family not-pressable"><select></select>&nbsp;</div>',
                    '<div class="tool-item gradient jsr-toolbar-text-font-size not-pressable"><select></select> pt</div>',
                    '<div class="tool-item gradient jsr-toolbar-text-left"><div class="icon"></div></div>',
                    '<div class="tool-item gradient jsr-toolbar-text-center"><div class="icon"></div></div>',
                    '<div class="tool-item gradient jsr-toolbar-text-right"><div class="icon"></div></div>',
                    '<div class="tool-item gradient jsr-toolbar-text-wrap"><label><input type="checkbox" /> Wrap</label></div>',
                '</div>',
            '</div>'
        ].join(''));
        var $font_selector = $(".jsr-toolbar-text-font-family select", this.text_toolbar),
            $size_selector = $(".jsr-toolbar-text-font-size select", this.text_toolbar),
            font_options_html = ['<option value="default">(' + t('Default font') + ')</option>'];
        this.default_fonts.sort(function(a, b) {
            return a.name.localeCompare(b.name);
        }).map(function(font) {
            font_options_html.push('<option value="' + font.name + '">' + font.name + '</option>');
        });
        $font_selector.append(font_options_html.join(''));
        var font_size_options_html = ['<option value="default"></option>'];
        this.font_size_options.map(function(size) {
            var option = String(size);
            font_size_options_html.push('<option value="' + option + '">' + option + '</option>');
        });
        $size_selector.append(font_size_options_html.join(''));
        $font_selector.on("change", function(evt) {
            var fontname = $(evt.target).val(),
                css = "";
            if (fontname != "default") {
                css = me.default_fonts.filter(function(font) {
                    return (font.name.toLowerCase() === fontname.toLowerCase());
                })[0].css;
            }
            me.editing_control_def.font = { name: fontname, css: css };
            me.apply_text_styles(me.editing_control_def, me.editing_control_elt);
            me.onElementEdit();
        });
        $size_selector.on("change", function(evt) {
            var size = $(evt.target).val();
            me.editing_control_def.fontsize = size;
            me.apply_text_styles(me.editing_control_def, me.editing_control_elt);
            me.onElementEdit();
        });
        this.text_toolbar.find(".jsr-toolbar-text-left").on("click", this.handle_text_toolbar_alignment_click.bind(this, "left"));
        this.text_toolbar.find(".jsr-toolbar-text-center").on("click", this.handle_text_toolbar_alignment_click.bind(this, "center"));
        this.text_toolbar.find(".jsr-toolbar-text-right").on("click", this.handle_text_toolbar_alignment_click.bind(this, "right"));
        this.text_toolbar.find(".jsr-toolbar-text-bold").on("click", function() {
            me.editing_control_def.bold = !me.editing_control_def.bold;
            me.apply_text_styles(me.editing_control_def, me.editing_control_elt);
            me.onElementEdit();
        });
        this.text_toolbar.find(".jsr-toolbar-text-italic").on("click", function() {
            me.editing_control_def.italic = !me.editing_control_def.italic;
            me.apply_text_styles(me.editing_control_def, me.editing_control_elt);
            me.onElementEdit();
        });
        this.text_toolbar.find(".jsr-toolbar-text-underline").on("click", function() {
            me.editing_control_def.underline = !me.editing_control_def.underline;
            me.apply_text_styles(me.editing_control_def, me.editing_control_elt);
            me.onElementEdit();
        });
        this.text_toolbar.find(".jsr-toolbar-text-wrap input")
            .prop("checked", !!me.editing_control_def.wrap)
            .on("change", function(evt) {
                me.editing_control_def.wrap = $(evt.target).is(":checked");
                me.apply_text_styles(me.editing_control_def, me.editing_control_elt);
            });
        // Kill click events due to toolbar interference
        this.text_toolbar.find(".jsr-toolbar-text-wrap").find("label, input").on("click", function(evt) {
            evt.stopPropagation();
        });
        this.text_toolbar.append(this.get_advanced_editor_icon());
        $(this.container).append(this.text_toolbar);
    },

    get_advanced_editor_icon: function() {
        var icon = $('<div class="jsr-toolbar-advanced"></div>');
        icon.on("click", this.on_advanced_editor_icon_click.bind(this));
        return icon;
    },

    on_advanced_editor_icon_click: function(evt) {
        if (this.showing_property_editor) {
            return;
        }
        var icon = $(evt.target),
            icon_offset = icon.offset();
        var possible_props = {};
        var current_props = {};
        if (this.editing_control_def) {
            if (this.activeElementInstance && this.activeElementInstance.getExtendedProperties) {
                const context = this.getSelectedElementContext();
                possible_props = this.activeElementInstance.getExtendedProperties(context);
                current_props = this.activeElementInstance.getExtendedPropertyValues(context);
            } else {
                possible_props = this.get_possible_props();
                current_props = $.extend(this.get_default_props(this.editing_control_def.type), 
                    this.editing_control_def);
            }
        } else if (this.selectedSection) {
            possible_props = this.getSectionProps();
            current_props = this.getSectionPropValues(this.selectedSection.def);
        }
        _.each(possible_props, (propDef) => {
            if (propDef.type === 'string' && propDef.options) {
                propDef.type = 'options';
            } else if (propDef.type === 'color') {
                propDef.options = _.extend({
                    allowEmpty: true,
                    showInput: true,
                    showAlpha: true,
                    showPalette: true,
                    palette: this.color_palette
                }, propDef.options);
            }
        });
        if (current_props.font) {
            current_props.font = current_props.font.name;
        }
        ['$jasperId', '$jasperType'].forEach(function(disallowedKey) {
            if (current_props[disallowedKey]) {
                delete current_props[disallowedKey];
            }
        });
        var popup = $([
            '<div class="jsr-property-editor">',
                '<div class="jsr-property-editor-scrollarea"></div>',
                '<div class="jsr-property-editor-buttons">',
                    '<button class="btn jsr-property-editor-ok">' + t('OK') + '</button>',
                    '<button class="btn jsr-property-editor-cancel">' + t('Cancel') + '</button>',
                '</div>',
            '</div>'].join(''));
        $(document.body).append(popup);
        popup.find('.jsr-property-editor-scrollarea').jqPropertyGrid(current_props, possible_props);
        popup.find('button.jsr-property-editor-ok').on('click', this.on_property_editor_ok.bind(this));
        popup.find('button.jsr-property-editor-cancel').on('click', this.on_property_editor_cancel.bind(this));
        var patternField = popup.find('input[id$="pattern"]');
        if (patternField.length > 0) {
            patternField.select2({
                data: PATTERN_OPTIONS,
                dropdownAutoWidth: true,
                dropdownCssClass: 'jsr-select2-dropdown',
                createSearchChoice: function(term, data) {
                    if ($(data).filter(function() {
                        return this.text.localeCompare(term)===0;
                    }).length === 0) {
                        return { id: term, text: term };
                    }
                }
            });
        }
        popup.css({
            left: (icon_offset.left + icon.width() - popup.width()) + 'px',
            top: (icon_offset.top + icon.height()) + 'px'
        });
        this.showing_property_editor = true;
        this.property_editor = popup;
    },

    on_property_editor_ok: function() {
        var props = this.property_editor.find('.jsr-property-editor-scrollarea').jqPropertyGrid('get');
        if (typeof props.font !== 'undefined') {
            // Don't drop existing CSS unless font property was changed
            if (this.editing_control_def.font && (props.font !== this.editing_control_def.font.name)) {
                props.font = { name: props.font, css: props.font };
            } else {
                delete props.font;
            }
        }
        if (this.editing_control_def) {
            if (this.activeElementInstance) {
                this.activeElementInstance.saveExtendedProperties(props);
                // Write all properties back to template element definition
                _.extend(this.editing_control_def, this.activeElementInstance.props);
                this.updateElementRendering(this.editing_control_def, 
                    this.editing_control_elt);
            } else {
                $.extend(this.editing_control_def, props);
            }
        } else if (this.selectedSection) {
            $.extend(this.selectedSection.def, props);
        }
        this.hidePropertyEditor();
        this.render_template();
    },

    on_property_editor_cancel: function() {
        this.hidePropertyEditor();
    },

    hidePropertyEditor: function() {
        this.property_editor.remove();
        this.showing_property_editor = false;
    },

    get_default_props: function(eltType) {
        switch (eltType) {
            case "text":
                return {
                    align: "left",
                    visible: true,
                    text_color: "black",
                    background_color: "",
                    height: 20 / this.pixels_per_unit,
                    text: '',
                    fit_content: "vertical",
                    pattern: '',
                    syntax: 'plain'
                };
            case 'subreport':
                return {
                    report: null,
                    height: 100 / this.pixels_per_unit
                };
        }
        return {};
    },

    get_possible_props: function() {
        var props = {
            "left": { group: 'Position', name: 'Left' },
            "top": { group: 'Position', name: 'Top' },
            "width": { group: 'Position', name: 'Width' },
            "height": { group: 'Position', name: 'Height' },
            "visible": { group: 'Appearance', name: 'Visible', type: 'string' },
            "left_px": { browsable: false },
            "width_px": { browsable: false },
            "type": { browsable: false },
            "report": { browsable: false }
        };
        switch(this.editing_control_def.type) {
            case "text":
                props = $.extend(props, {
                    "text": { group: 'Content', name: 'Text' },
                    "pattern": { group: 'Content', name: 'Pattern', type: 'string', options: ['m/d/yy', '$#,##0.00'] },
                    "text_color": { group: 'Appearance', name: 'Text color' },
                    "background_color": { group: 'Appearance', name: 'Background color' },
                    "font": { group: 'Appearance', name: 'Font', type: 'string' },
                    "font_size": { group: 'Appearance', name: 'Font size' },
                    'syntax': { group: 'Content', name: 'Syntax', type: 'string', options: ['plain', 'markdown'] }
                });
                break;
            case "chart_line":
            case "chart_bar":
            case "chart_pie":
                break;
            case "box":
                break;
            case "image":
                break;
            case "barcode":
                props = $.extend(props, {
                    "value": { group: 'Content', name: 'Value' }
                });
                break;
        }
        return props;
    },

    getSectionProps: function(section) {
        return {
            "visible": { group: 'Appearance', name: 'Visible', type: 'string' },
            // "backgroundColor": { group: 'Position', name: 'Background color' },
            // "altBackgroundColor": { group: 'Position', name: 'Alt background color' },
            "shrinkToFit": { group: 'Position', name: 'Shrink to fit' }
        };
    },

    getSectionPropValues: function(section) {
        return {
            "visible": typeof section.visible === 'undefined' ? '' : section.visible,
            // "backgroundColor": section.backgroundColor || '',
            // "altBackgroundColor": section.altBackgroundColor || '',
            "shrinkToFit": !!section.shrinkToFit
        };
    },

    on_text_toolbar_text_change: function(text) {
        this.editing_control_def.text = text;
        this.apply_text_styles(this.editing_control_def, this.editing_control_elt);
        this.onElementEdit();
    },

    handle_text_toolbar_alignment_click: function(alignment) {
        this.editing_control_def.align = alignment;
        this.apply_text_styles(this.editing_control_def, this.editing_control_elt);
        this.onElementEdit();
    },

    apply_text_styles: function(def, $wrapElt) {
        const $elt = $wrapElt.find('.jsr-text');
        // Must pre-apply styles here to measure font size correctly
        if (def.styles) {
            if (Array.isArray(def.styles)) {
                def.styles.map(cssClass => $elt.addClass(cssClass));
            } else {
                $elt.addClass(def.styles);
            }
        }
        if (def.italic !== undefined) {
            $elt.css("font-style", def.italic ? "italic" : "normal");
        }
        if (def.underline !== undefined) {
            $elt.css("text-decoration", def.underline ? "underline" : "none");
        }
        if (def.bold !== undefined) {
            $elt.css("font-weight", def.bold ? "bold" : "normal");
        }
        if (def.align !== undefined) {
            $elt.css("text-align", def.align || "left");
        }
        if (def.fontsize) {
            const scaledFontSize = parseFloat(def.fontsize) * this.getFontScaleFactor();
            $elt.css('font-size', `${scaledFontSize.toFixed(2)}pt`);
        } else {
            // Must measure without an element fontsize set, because font size can come
            // from multiple places (CSS) and we can't calculate it directly
            const fontScalePercent = this.getFontScaleFactor() * 100;
            $elt[0].style.fontSize = '';
            let defaultFontSizeCss = $elt.css('font-size');
            if (!defaultFontSizeCss && !document.contains($wrapElt[0])) {
                // Must temporarily attach to DOM to read font size
                const origVis = $wrapElt.css('visibility');
                $wrapElt.css('visibility', 'hidden');
                this.preview_el.append($wrapElt);
                defaultFontSizeCss = $elt.css('font-size');
                $wrapElt.remove();
                $wrapElt.css('visibility', origVis);
            }
            const units = ['pt', 'px', 'em', 'rem'].find(unit => defaultFontSizeCss.indexOf(unit) >= 0);
            const scaledFontSize = parseFloat(defaultFontSizeCss) * this.getFontScaleFactor();
            $elt.css('font-size', `${scaledFontSize.toFixed(2)}${units}`);
        }
        if (def.font) {
            $elt.css("font-family", def.font.css);
        }
        if (def.text_color) {
            $elt.css("color", def.text_color);
        }
        if (def.background_color) {
            $elt.css("background-color", def.background_color);
        }
        if (def.borders) {
            ['top', 'right', 'bottom', 'left'].forEach(side => {
                if (def.borders[side]) {
                    $elt.css(`border-${side}`, def.borders[side]);
                }
            });
        }
        const isMarkdown = def.syntax === 'markdown';
        const shouldWrap = (def.wrap !== false);    // Now defaults to wrap=true
        $elt.css("white-space", (shouldWrap || isMarkdown) ? "pre-line" : "nowrap");
        let displayText = def.text.replace(/\\n/gim, '\n');
        if (isMarkdown) {
            if (!this.markdownConverter) {
                this.markdownConverter = new showdown.Converter({
                    strikethrough: true
                });
            }
            let html = this.markdownConverter.makeHtml(displayText);
            if (html.startsWith('<p>') && html.endsWith('</p>')) {
                html = html.substring(3, html.length - 4);
            }
            // Don't allow more than one linebreak between HTML tags
            html = html.replace(/>\s*\n\s*</gim, '>\n<');            
            $elt.html(html);
        } else {
            $elt.text(displayText);
        }        
    },
    
    // The jquery color picker needs to be bound directly to the live instance (copy)
    // of the toolbar, so we bind events separately after control selection
    bind_text_toolbar_events: function() {
        var me = this,
            tb_instance_el = this.editing_control_elt.toolbar("getToolbarElement");
        tb_instance_el.find(".jsr-toolbar-text-textcolor input").spectrum({
            color: this.editing_control_def.text_color || '',
            showPalette: true,
            palette: this.color_palette,
            showAlpha: false,
            allowEmpty: false,
            change: function(color) {
                var color_hex = (color === null ? "transparent" : color.toHexString());
                tb_instance_el.find(".jsr-text-color-icon").css("border-bottom-color",
                    color_hex);
                me.editing_control_def.text_color = color_hex;
                me.apply_text_styles(me.editing_control_def, me.editing_control_elt);   
                me.onElementEdit();
            }
        });
        tb_instance_el.find(".jsr-toolbar-text-backgroundcolor input").spectrum({
            color: this.editing_control_def.background_color || '',
            showPalette: true,
            palette: this.color_palette,
            showAlpha: true,
            allowEmpty: true,
            change: function(color) {
                var color_hex = (color === null ? "transparent" : color.toHexString());
                me.editing_control_def.background_color = color_hex;
                me.apply_text_styles(me.editing_control_def, me.editing_control_elt);   
                me.onElementEdit();
            }
        });
        tb_instance_el.find(".jsr-toolbar-text-textcolor .sp-preview").append('<div class="jsr-text-color-icon">A</div>');
        tb_instance_el.find(".jsr-toolbar-text-backgroundcolor .sp-preview").append('<div class="jsr-text-background-color-icon">A</div>');
        //this.editing_control_elt.toolbar("calculatePosition");
    },
    
    create_image_toolbar: function() {
        var me = this;
        this.image_toolbar = $([
            '<div id="jsr-designer-image-toolbar" style="display:none">',
                '<div>',
                    '<div class="tool-item image-list">',
                        '<div class="jsr-designer-image-dropzone">',
                            '<span class="dz-message">Drop an image file here or click</span>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''));
        var $image_list = $(".image-list", this.image_toolbar);
        this.images.map(function(imgdef) {
            var $img = $('<div class="image-item"><div class="thumbnail"></div><div class="caption"></div></div>');
            $img.find(".thumbnail").css("background-image", "url(" + imgdef.url + ")"); 
            $img.find(".caption").html(imgdef.name);    
            $img.data("img-index", me.images.indexOf(imgdef));
            $image_list.append($img);
        });
        $image_list.on("click", ".image-item", function(evt) {
            var index = $(evt.target).closest(".image-item").data("img-index"),
                url = me.images[index].url;
            $.extend(me.editing_control_def, me.images[index]);
            if (me.embedImages) {
                me.capture_image_data(me.editing_control_def, url);
            }
            $("img", me.editing_control_elt).attr("src", url);
            me.onElementEdit();
        });
        this.image_toolbar.append(this.get_advanced_editor_icon());
        $(this.container).append(this.image_toolbar);
    },

    bind_image_toolbar: function() {
        var me = this,
            tb_instance_el = this.editing_control_elt.toolbar("getToolbarElement");
        if (this.allowImageUpload) {
            tb_instance_el.find('.jsr-designer-image-dropzone').dropzone({ 
                url: '#',
                autoProcessQueue: false,
                clickable: true,
                createImageThumbnails: false,
                accept: (file, done) => {
                    this.handleDroppedImage(file, done);
                }
            });
        } else {
            tb_instance_el.find('.jsr-designer-image-dropzone').hide();
        }
    },

    handleDroppedImage: function(file, done) {
        var fileReader;
        fileReader = new FileReader();
        fileReader.onload = () => {
            const url = fileReader.result;
            const baseName = 'Uploaded'
            let name = baseName;
            let suffix = 2;
            while (this.images.find(img => 
                img.name.toLowerCase() === name.toLowerCase()) && suffix < 20) 
            {
                name = `${baseName} (${suffix++})`;
            }
            this.images.push({
                name: name,
                url: url
            });
            setTimeout(this.rebuildImageToolbar.bind(this), 0);
            done();
        };
        fileReader.readAsDataURL(file);
    },

    rebuildImageToolbar: function() {
        const selectedEl = this.editing_control_elt;
        this.clear_selection();
        selectedEl.toolbar('getToolbarElement').remove();
        selectedEl.data('toolbarObj', null);
        delete this.image_toolbar;
        $('#jsr-designer-image-toolbar').remove();
        this.select_element(selectedEl);
    },

    capture_image_data: function(elt_def, img_url) {
        var img = new Image();
        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            elt_def.url = canvas.toDataURL("image/png");
        };
        img.src = img_url;
    },
    
    create_chart_toolbar: function() {
        var me = this,
            field_list_html = this.get_field_list_options_html();
        this.chart_toolbar = $([
            '<div id="jsr-designer-chart-toolbar" class="jsr-designer-chart-toolbar" style="display:none">',
                '<div>',
                    '<div class="tool-item gradient jsr-toolbar-chart-type not-pressable">Type: <select><option value="line">Line</option><option value="bar">Bar</option><option value="pie">Pie</option></select></div>',
                    '<div class="tool-item gradient jsr-toolbar-chart-value-field not-pressable">Value field: <select><option value="">(none)</option>', field_list_html, '</select></div>',
                    '<div class="tool-item gradient jsr-toolbar-chart-label-field not-pressable">Label field: <select><option value="">(none)</option>', field_list_html, '</select></div>',
                '</div>',
            '</div>'
        ].join(''));
        $(".jsr-toolbar-chart-type select", this.chart_toolbar).on("change", function(evt) {
            var newtype = "chart_" + $(evt.target).val(),
                // $canvas = $("canvas", this.editing_control_elt),
                $toolbar = $(evt.target).closest(".tool-container");
            this.editing_control_def.type = newtype;
            // Move the label field between series[0] and x_axis depending on chart type
            switch (newtype) {
                case "chart_line":
                case "chart_bar":
                    if (!this.editing_control_def.x_axis) {
                        this.editing_control_def.x_axis = {};
                    }
                    this.editing_control_def.x_axis.label_field = $toolbar.find(".jsr-toolbar-chart-label-field select").val();
                    this.onElementEdit();
                    break;
                case "chart_pie":
                    if (!this.editing_control_def.series) {
                        this.editing_control_def.series = [{}];
                    }
                    delete this.editing_control_def.x_axis;
                    this.editing_control_def.series[0].label_field = $toolbar.find(".jsr-toolbar-chart-label-field select").val();
                    this.onElementEdit();
                    break;
            }
            this.editing_control_elt.removeClass("chart_line chart_bar chart_pie");
            this.editing_control_elt.addClass(newtype);
            this.update_preview_chart(this.editing_control_elt);
            this.onElementEdit();
        }.bind(this));
        $(".jsr-toolbar-chart-value-field select", this.chart_toolbar).on("change", function(evt) {
            var newval = $(evt.target).val();
            switch (this.editing_control_def.type) {
                case "chart_line":
                case "chart_bar":
                case "chart_pie":
                    if (!this.editing_control_def.series) {
                        this.editing_control_def.series = [{}];
                    }
                    this.editing_control_def.series[0].value_field = newval;
                    this.onElementEdit();
                    break;
            }
        }.bind(this));
        $(".jsr-toolbar-chart-label-field select", this.chart_toolbar).on("change", function(evt) {
            var newval = $(evt.target).val();
            switch (this.editing_control_def.type) {
                case "chart_line":
                case "chart_bar":
                    if (!this.editing_control_def.x_axis) {
                        this.editing_control_def.x_axis = {};
                    }
                    this.editing_control_def.x_axis.label_field = newval;
                    this.onElementEdit();
                    break;
                case "chart_pie":
                    if (!this.editing_control_def.series) {
                        this.editing_control_def.series = [{}];
                    }
                    this.editing_control_def.series[0].label_field = newval;
                    this.onElementEdit();
                    break;
            }
        }.bind(this));
        this.chart_toolbar.append(this.get_advanced_editor_icon());
        $(this.container).append(this.chart_toolbar);
    },
    
    create_box_toolbar: function() {
        var me = this;
        this.box_toolbar = $([
            '<div id="jsr-designer-box-toolbar" style="display:none">',
                '<div>',
                    '<div class="tool-item gradient jsr-toolbar-box-bordercolor not-pressable">Border: <input type="text" /></div>',
                    '<div class="tool-item gradient jsr-toolbar-box-backgroundcolor not-pressable">Background: <input type="text" /></div>',
                    '<div class="tool-item gradient jsr-toolbar-box-cornerradius not-pressable">Rounding: <input type="text" /></div>',
                '</div>',
            '</div>'
        ].join(''));
        this.box_toolbar.append(this.get_advanced_editor_icon());
        $(this.container).append(this.box_toolbar);
    },
    
    bind_box_toolbar: function() {
        var me = this,
            tb_instance_el = this.editing_control_elt.toolbar("getToolbarElement");
        tb_instance_el.find(".jsr-toolbar-box-bordercolor input").spectrum({
            color: this.editing_control_def.border_color || '',
            showPalette: true,
            palette: this.color_palette,
            showAlpha: true,
            allowEmpty: true,
            change: function(color) {
                var color_hex = (color === null ? "transparent" : color.toHexString());
                me.editing_control_def.border_color = color_hex;
                me.editing_control_elt.find(".jsr-box").css("border-color", color_hex);
                me.onElementEdit();
            }
        });
        tb_instance_el.find(".jsr-toolbar-box-backgroundcolor input").spectrum({
            color: this.editing_control_def.background_color || '',
            showPalette: true,
            palette: this.color_palette,
            showAlpha: true,
            allowEmpty: true,
            change: function(color) {
                var color_hex = (color === null ? "transparent" : color.toHexString());
                me.editing_control_def.background_color = color_hex;
                me.editing_control_elt.find(".jsr-box").css("background-color", color_hex);
                me.onElementEdit();
            }
        });
        me.editing_control_elt.find(".jsr-box");
        tb_instance_el.find(".jsr-toolbar-box-cornerradius input")
            .val(me.editing_control_def.corner_radius || '')
            .on("change", function(evt) {
                var val = $(evt.target).val(),
                    is_number = (!isNaN(parseInt(val, 10)) && isFinite(val));
                if (is_number) {
                    me.editing_control_def.corner_radius = val;
                    me.editing_control_elt.find(".jsr-box").css("border-radius", String(val) + "px");
                    me.onElementEdit();
                }
            });
        this.editing_control_elt.toolbar("calculatePosition");
    },

    create_barcode_toolbar: function() {
        this.barcode_toolbar = $([
            '<div id="jsr-designer-barcode-toolbar" style="display:none">',
                '<div>',
                    '<div class="tool-item gradient jsr-toolbar-barcode-value not-pressable"><div class="input-wrap"></div></div>',
                '</div>',
                '<div>',
                    '<div class="tool-item gradient jsr-toolbar-barcode-type not-pressable">Type: <select>',
                        '<option value="CODE128">Code 128</option>',
                        '<option value="CODE39">Code 39</option>',
                        '<option value="UPC">UPC-A</option>',
                        '<option value="EAN">EAN-13</option>',
                        '<option value="ITF14">ITF-14</option>',
                        '<option value="pharmacode">Pharmacode</option>',
                        '<option value="QR">QR Code</option>',
                    '</select></div>',
                    '<div class="tool-item gradient jsr-toolbar-barcode-show-value not-pressable"><label><input type="checkbox"> Show value</label></div>',
                '</div>',
            '</div>'
        ].join(''));
        this.barcode_toolbar.append(this.get_advanced_editor_icon());
        $(this.container).append(this.barcode_toolbar);
    },
    
    bind_barcode_toolbar: function() {
        var me = this,
            tb_instance_el = this.editing_control_elt.toolbar("getToolbarElement");

        // Barcode value field
        const $inputWrap = tb_instance_el.find(".jsr-toolbar-barcode-value .input-wrap");
        this.initTextComplete($inputWrap, this.on_barcode_value_change.bind(this));
        $inputWrap.find('textarea').val(me.editing_control_def.value);

        // Barcode type
        tb_instance_el.find(".jsr-toolbar-barcode-type select")
            .val(me.editing_control_def.barcode_type || 'CODE128')
            .on("change", function(evt) {
                var val = $(evt.target).val();
                me.editing_control_def.barcode_type = val;
                me.render_barcode(me.editing_control_elt, me.editing_control_def);
                setTimeout(function() {
                    me.onElementEdit();
                }, 0);
            });

        // Show value
        tb_instance_el.find(".jsr-toolbar-barcode-show-value input")
            .prop("checked", me.editing_control_def.show_value)
            .on("change", function(evt) {
                var checked = $(evt.target).is(":checked");
                me.editing_control_def.show_value = checked;
                me.render_barcode(me.editing_control_elt, me.editing_control_def);
                setTimeout(function() {
                    me.onElementEdit();
                }, 0);
            });
        // Kill click events on "show value" checkbox, otherwise toolbar will interfere
        tb_instance_el.find(".jsr-toolbar-barcode-show-value input, .jsr-toolbar-barcode-show-value label")
            .on("click", function(evt) {
                evt.stopPropagation();
            });

        this.editing_control_elt.toolbar("calculatePosition");
    },

    on_barcode_value_change: function(text) {
        this.editing_control_def.value = text;
        this.onElementEdit();
    },

    create_break_toolbar: function() {
        this.break_toolbar = $([
            '<div id="jsr-designer-break-toolbar" style="display:none">',
                '<div>',
                    '<div class="tool-item gradient jsr-toolbar-break-type not-pressable">Page Break</div>',
                    '<div class="tool-item gradient jsr-toolbar-break-every not-pressable">',
                        'Active every <input type="text" /> records',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''));
        this.break_toolbar.append(this.get_advanced_editor_icon());
        $(this.container).append(this.break_toolbar);
    },
    
    bind_break_toolbar: function() {
        var me = this,
            tb_instance_el = this.editing_control_elt.toolbar("getToolbarElement");

        var $everyInput = tb_instance_el.find(".jsr-toolbar-break-every input");
        $everyInput
            .val(me.editing_control_def.everyNth)
            .on('change', this.onBreakEveryChange.bind(this));

        this.editing_control_elt.toolbar("calculatePosition");
    },

    onBreakEveryChange: function(evt) {
        var val = $(evt.target).val();
        if (!$.isNumeric(val)) {
            val = 1;
            $(evt.target).val(val);
        }
        this.editing_control_def.everyNth = val;
    },

    create_subreport_toolbar: function() {
        this.subreport_toolbar = $([
            '<div id="jsr-designer-subreport-toolbar" style="display:none">',
                '<div>',
                    '<div class="tool-item gradient jsr-toolbar-subreport-edit not-pressable"><button class="btn">Edit subreport</button></div>',
                    '<div class="tool-item gradient jsr-toolbar-subreport-link not-pressable">',
                        '<label>',
                            '<input type="checkbox" class="link-fields-checkbox" /> ',
                            'Link master report field ',
                        '</label> ',
                        '<input type="text" class="subreport-link-parent" /> ',
                        'to subreport field <input type="text" class="subreport-link-child" />',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''));
        this.subreport_toolbar.append(this.get_advanced_editor_icon());
        $(this.container).append(this.subreport_toolbar);
    },
    
    bind_subreport_toolbar: function() {
        var me = this,
            tb_instance_el = this.editing_control_elt.toolbar("getToolbarElement"),
            subreportDef = this.editing_control_def.report;
        tb_instance_el.find('.jsr-toolbar-subreport-edit button').on('click', function() {
            if (!me.editing_control_def.report) {
                me.editing_control_def.report = JSON.parse(JSON.stringify(jsreports.defaultReport));
            }
            var stack = me.reportStack || [ me.report_def ];
            // stack.push(me.editing_control_def.report);
            var reportClone = JSON.parse(JSON.stringify(me.editing_control_def.report));
            stack.push(reportClone);
            me.setReport(reportClone);
            var subreportCtlStack = me.subreportCtlStack || [];
            subreportCtlStack.push(me.editing_control_def);
            me.subreportCtlStack = subreportCtlStack;
            me.reportStack = stack;
            // me.clear_selection();
            me.set_subreport_mode(true);
        });
        var containingSection = this.find_section_by_y(this.editing_control_elt.position().top);
        const dataSection = this.getDataSections()[containingSection.sectionInfo.detailIndex || 0];
        var fields;
        if (typeof containingSection.level !== 'undefined') {
            fields = this.get_fields_for_group_data_source(dataSection, containingSection.level);
        } else if (containingSection.is_detail && this.report_def.sublevels && this.report_def.sublevels.length > 0) {
            // last section fields
            fields = this.get_fields_for_group_data_source(dataSection, this.report_def.sublevels.length - 1);
        } else {
            // root data source fields
            fields = this.get_root_data_source_fields(dataSection);
        }
        tb_instance_el.find('label')
            .on('click', function(evt) {
                evt.stopPropagation();
            });
        tb_instance_el.find('input.link-fields-checkbox')
            .prop('checked', !!this.editing_control_def.linkFields)
            .on('change', function(evt) {
                this.editing_control_def.linkFields = $(evt.target).prop('checked');
                tb_instance_el.find('input.subreport-link-parent').prop('disabled', !this.editing_control_def.linkFields);
                tb_instance_el.find('input.subreport-link-child').prop('disabled', !this.editing_control_def.linkFields);
            }.bind(this));
        tb_instance_el.find('input.subreport-link-parent')
            .val(this.editing_control_def.linkParentField)
            .on("change", function(evt) {
                this.editing_control_def.linkParentField = $(evt.target).val();
            }.bind(this))
            .prop('disabled', !this.editing_control_def.linkFields)
            .select2({
                query: function(options) {
                    options.callback({
                        more: false,
                        results: fields.data
                    });
                }.bind(this),
                initSelection: function(element, callback) {
                    callback(fields.byId[element.val()]);
                }.bind(this),
                allowClear: true,
                placeholder: '(select a field)',
                dropdownAutoWidth: true,
                dropdownCssClass: 'jsr-select2-dropdown'
            });
        var subreportSchema = null;
        if (subreportDef && subreportDef.body) {
            const subreportDetails = Array.isArray(subreportDef.body) ? subreportDef.body : [ subreportDef.body ];
            if (subreportDetails[0].data_source) {
                subreportSchema = this.data_source_schemas[subreportDetails[0].data_source];
            }
        }
        var subreportFields = this.get_fields_for_schema(subreportSchema);
        tb_instance_el.find('input.subreport-link-child')
            .val(this.editing_control_def.linkChildField)
            .on("change", function(evt) {
                this.editing_control_def.linkChildField = $(evt.target).val();
            }.bind(this))
            .prop('disabled', !this.editing_control_def.linkFields)
            .select2({
                query: function(options) {
                    options.callback({
                        more: false,
                        results: subreportFields.data
                    });
                }.bind(this),
                initSelection: function(element, callback) {
                    callback(subreportFields.byId[element.val()]);
                }.bind(this),
                allowClear: true,
                placeholder: '(select a field)',
                dropdownAutoWidth: true,
                dropdownCssClass: 'jsr-select2-dropdown'
            });        
        this.editing_control_elt.toolbar("calculatePosition");
    },

    set_subreport_mode: function(is_subreport) {
        var $toolbar = $(this.container).find('.jsr-designer-toolbar');
        var $indicator = $toolbar.find('.subreport-indicator');
        if ($indicator.length > 0) {
            $indicator.toggle(is_subreport);
        } else if (is_subreport) {
            $indicator = $('<div class="subreport-indicator">' + t('Editing subreport') + '</div>');
            $toolbar.prepend($indicator);
        }
        $toolbar.find('.save-button').text(is_subreport ? t('Save and return to main report') : t('Save'));
        this.subreportMode = is_subreport;
    },

    createToolbarItem: function(item) {
        let $item = $(`<div class="tool-item gradient not-pressable jsr-element-toolbar-item-custom"></div>`);
        let $input = null;
        if (item.label) {
            $item.append($(document.createElement('label')).text(t(item.label) + ': '));
        }
        $item.addClass(`jsr-toolbar-item-${item.type}`);
        switch (item.type) {
            case 'dropdown':
                $input = $(document.createElement('input'));
                $item.append($input);
                $input.data('jsr-toolbar-item', item);
                break;
            case 'text':
                $input = $(document.createElement('input')).attr('type', 'text');
                $item.append($input);
                $input.data('jsr-toolbar-item', item);
                break;
            case 'color':
                $input = $(document.createElement('input'));
                $item.append($input);
                $input.data('jsr-toolbar-item', item);
                break;
            case 'checkbox':
                const id = `jsr-element-toolbar-checkbox-${this.nextToolbarItemId++}`;
                $input = $(document.createElement('input'))
                    .attr({
                        type: 'checkbox',
                        name: id,
                        id: id,
                        value: id
                    });
                $item.find('label').append($input);
                $input.data('jsr-toolbar-item', item);
                $item.find('label').on('click', e => {
                    e.stopPropagation();
                });
                break;
            case 'conditionalRules':
                $item = this.getConditionalPropertiesButton();
                const rules = item.value || [];
                this.setCondPropsCount(rules.length, $item[0]);
                $item.data('targetDef', { conditionalRules: rules });
                if (item.onChange) {
                    $item.data('saveCallback', (rule) => {
                        item.onChange(rules);
                    });
                }
                break;
        }
        return $item;
    },

    getDataSections: function() {
        const body = this.report_def.body;
        return Array.isArray(body) ? body : [ body ];
    },

    getAvailableDataSourcesForElement() {
        const dataSectionIx = this.sections_by_element_id[this.editing_control_def.id].detailIndex;
        const dataSection = this.getDataSections()[dataSectionIx];
        let allDataSources = this.data_sources.map(ds => ({
            id: ds.id.toLowerCase(),
            name: ds.name || "",
            schema: this.data_source_schemas[ds.id] || null
        }));
        const schema = this.getSchemaForDataSection(dataSection);
        if (schema) {
            allDataSources = allDataSources.concat(
                schema.fields.filter(field => field.type.toLowerCase() === 'array' && field.schema)
                    .map(field => ({
                        id: field.name,
                        name: field.name,
                        schema: field.schema || null
                    })));
        }
        allDataSources.sort(function(dsA, dsB) {
            return dsA.name.localeCompare(dsB.name);
        });
        return [{
            id: "__parentgroup",
            name: "Rows in parent group",
            schema: schema
        }].concat(allDataSources);
    },

    /**
     * Get context about how the element is situated within the report
     * (available data sources, etc) to pass to the element class to generate its
     * toolbar options
     */
    getSelectedElementContext: function() {
        return {
            dataSources: this.getAvailableDataSourcesForElement()
        };
    },

    createElementToolbar: function(elClass, inst, activeSchema) {
        let items = inst.getToolbarItems(activeSchema, this.getSelectedElementContext());
        const $toolbar = $(`<div id="jsr-designer-toolbar-${elClass.typeId}" style="display:none"></div>`);
        if (items.length > 0) {
            if (!Array.isArray(items[0])) {
                items = [ items ];
            }
            const rows = items;
            rows.forEach(row => {
                const $row = $('<div></div>');
                row.forEach(item => $row.append(this.createToolbarItem(item)));
                $toolbar.append($row);
            });
        }
        $toolbar.append(this.get_advanced_editor_icon());
        $(this.container).append($toolbar);
    },

    updateElementRendering: function(elDef, elt) {
        switch (elDef.type) {
            case "barcode":
                this.render_barcode(elt, elDef);
                break;
            case 'subreport':
                this.renderSubreportPreview(elDef, elt);
                break;
            default:
                const elClass = this.elementTypes[elDef.type.toLowerCase()].handler;
                if (elClass) {
                    let inst = elt.data('jsr-element-instance');
                    if (!inst) {
                        inst = new elClass(elDef);
                    }
                    elt.data('jsr-element-instance', inst);
                    if (elDef === this.editing_control_def) {
                        this.activeElementInstance = inst;
                    }
                    if (elClass.isComposite) {
                        elt.find('.jsr-designer-subelement').remove();
                        elt.append(
                            this.renderCompositeElementChildren(inst, this.pixels_per_unit));
                    } else {
                        elt.find(':not(.jsr-resize-handle)').remove();
                        elt.append(inst.getDesignerHtml());
                        if (inst.afterDesignerRender) {
                            inst.afterDesignerRender(elt[0]);
                        }
                    }
                    inst.raiseEvent = this.onElementEvent.bind(this);
                }
                break;
        }
    },

    /** Called by element instances when they raise an event */
    onElementEvent: function(eventName) {
        switch(eventName) {
            case 'toolbarchange':
                this.refreshCustomElementToolbar();
                break;
            case 'propertychange':
                this.updateElementRendering(this.editing_control_def, this.editing_control_elt);
                this.refreshCustomElementToolbar();
                break;
            default:
                throw new Error(`Unknown element event: ${eventName}`);
        }
    },

    bindElementToolbar: function(toolbarEl, elClass, eltDef) {
        const dropdowns = toolbarEl.querySelectorAll('.jsr-toolbar-item-dropdown input');
        Array.prototype.forEach.call(dropdowns, input => {
            const $input = $(input);
            const item = $input.data('jsr-toolbar-item');
            const savedValue = (typeof item.value !== 'undefined') ? item.value 
                : eltDef[item.boundProperty];
            const hasSavedValue = typeof savedValue !== 'undefined';
            let options = [ ...item.options ];
            let valueToSelect = savedValue;
            // Add saved value to dropdown if not already in options
            if (hasSavedValue) {
                const savedValueLower = String(savedValue).toLowerCase();
                const matchingOption = options.find(opt => 
                    String(typeof opt.id === 'undefined' ? opt : opt.id).toLowerCase() === savedValueLower);
                if (matchingOption) {
                    valueToSelect = typeof matchingOption.id === 'undefined' ? 
                        matchingOption : matchingOption.id;
                } else {
                    options.push(savedValue);
                }
            }
            $input.select2({
                data: options.map(opt => (opt.id ? opt : {
                    id: opt,
                    text: opt
                })),
                dropdownAutoWidth: true,
                dropdownCssClass: 'jsr-select2-dropdown',
                createSearchChoice: function(term, data) {
                    if (data.filter(existing => existing.text.localeCompare(term) === 0).length === 0) {
                        return { id: term, text: term };
                    }
                }
            }).on('change', (evt) => {
                let val = $(evt.target).val();
                this.handleToolbarInputForCustomElement(item, val);
            });
            if (hasSavedValue) {
                $input.select2('val', String(valueToSelect));
            }
        });
        const colors = toolbarEl.querySelectorAll(".jsr-toolbar-item-color input");
        Array.prototype.forEach.call(colors, input => {
            const item = $(input).data('jsr-toolbar-item');
            $(input).spectrum({
                color: this.editing_control_def[item.boundProperty] || '',
                showPalette: true,
                palette: this.color_palette,
                showAlpha: false,
                allowEmpty: false,
                change: (color) => {
                    const hexStr = (color === null ? "transparent" : color.toHexString());
                    this.handleToolbarInputForCustomElement(item, hexStr);
                }
            });
        });
        const checkboxes = toolbarEl.querySelectorAll('.jsr-toolbar-item-checkbox input');
        Array.prototype.forEach.call(checkboxes, input => {
            const $input = $(input);
            const item = $input.data('jsr-toolbar-item');
            const savedValue = (typeof item.value !== 'undefined') ? item.value : eltDef[item.boundProperty];
            $input.prop('checked', !!savedValue);
            $input.on('change', e => {
                const checked = $(e.target).is(':checked');
                this.handleToolbarInputForCustomElement(item, checked);
            });
        });
        const texts = toolbarEl.querySelectorAll('.jsr-toolbar-item-text input');
        Array.prototype.forEach.call(texts, input => {
            const $input = $(input);
            const item = $input.data('jsr-toolbar-item');
            const savedValue = (typeof item.value !== 'undefined') ? item.value : eltDef[item.boundProperty];
            if (item.suggestions) {
                const $wrap = $('<div class="input-wrap"></div>');
                $input.replaceWith($wrap);
                this.initTextComplete($wrap, (text) => {
                    this.handleToolbarInputForCustomElement(item, text);
                });
                $wrap.find('textarea').val(savedValue);
                this.autoCompleteOptions = { list: item.suggestions };
            }
        });
    },

    handleToolbarInputForCustomElement(toolbarItem, val) {
        /** Normalize the value UNLESS it's a formula, which we allow for all properties */
        if (toolbarItem.normalizeValue && (!(typeof val === 'string' && val.indexOf('=') === 0))) {
            val = toolbarItem.normalizeValue(val);
        }
        const origVal = this.activeElementInstance.props[toolbarItem.boundProperty];
        if (toolbarItem.boundProperty) {
            this.activeElementInstance.props[toolbarItem.boundProperty] = val;
            // this.editing_control_def[toolbarItem.boundProperty] = val;
        }
        if (toolbarItem.onChange) {
            const aborted = (toolbarItem.onChange(val) === false);
            if (aborted) {
                this.activeElementInstance.props[toolbarItem.boundProperty] = origVal;
                // this.editing_control_def[toolbarItem.boundProperty] = origVal;
                this.refreshCustomElementToolbar();
            }
        }
        this.onElementEdit();
    },

    /** 
     * @private
     * Back out one level from a subreport - either to the main report, or another higher subreport 
     */
    exitSubreport: function() {
        this.subreportCtlStack.pop();
        // Drop the last subreport (the one we were editing)
        this.reportStack.pop();
        var stack = this.reportStack;
        var subreportCtlStack = this.subreportCtlStack;
        this.setReport(this.reportStack[this.reportStack.length - 1]);
        // Restore the stack because setReport wipes it out
        this.reportStack = stack;
        this.subreportCtlStack = subreportCtlStack;
        this.set_subreport_mode(this.reportStack.length > 1);
    },

    sectionIsDetail: function(section) {
        const body = this.report_def.body;
        const details = Array.isArray(body) ? body : [ body ];
        return !!(details.find(detail => detail === section));
    },

    /** 
     * @private
     * Whenever an element is modified (any property), we may need to do some bookkeeping --
     * for instance, updating "shadow" (cloned) elements in columns 2..n
     */
    onElementEdit: function() {
        if (!this.editing_control_elt) return;
        if (this.activeElementInstance) {
            _.extend(this.editing_control_def, this.activeElementInstance.props);
        }
        this.updateElementRendering(this.editing_control_def, this.editing_control_elt);
        var section = this.find_section_by_y(this.editing_control_elt.position().top).def;
        if (this.sectionIsDetail(section) && section.column_count && section.column_count > 1) {
            this.update_column_clones();
        }
    },

    render_template_section_elements: function(section, offset) {
        var elements = section.def.elements;
        for (var i = 0; i < elements.length; i++) {
            var elt = elements[i];
            var newdiv = this.render_template_element(elt, offset);
            this.sections_by_element_id[elt.id] = section;
            this.preview_el.append(newdiv);
        }
    },
    
    get_next_element_id: function() {
        return "jsr-element-" + (this.next_element_id++);
    },
    
    render_template_element: function(elt, offset) {
        var me = this;
        if (elt.id) {
            var idnum = Number(elt.id.substr(elt.id.lastIndexOf('-') + 1));
            if (idnum >= this.next_element_id) {
                this.next_element_id = idnum + 1;
            }
        } else {
            elt.id = this.get_next_element_id();
        }
        this.elements_by_id[elt.id] = elt;

        var newdiv = this.renderElementHtml(elt, offset, this.preview_margins.left, this.pixels_per_unit);
        
        var dirs = ['t','l','b','r','tl','tr','bl','br'],
            min_control_size = 10;  
        if (elt.type !== 'break') {
            for (var i = 0; i < dirs.length; i++) {
                newdiv.append('<div class="jsr-resize-handle jsr-resize-handle-' + dirs[i] + '"></div>');
            }
        }
        newdiv.addClass('jsr-draggable')
            .drag("start", function( ev, dd ) {
                me.dragging = true;
                var $elt = $(ev.target).closest('div');
                dd.attr = $elt.prop("className");
                var resize_handle_classname_ix = dd.attr.indexOf("jsr-resize-handle-");
                dd.width = $(this).width();
                dd.height = $(this).height();
                var dragHint = 'Hold ' + (jsreports.isMac ? 'Cmd' : 'Ctrl') + ' for precise positioning';
                if (resize_handle_classname_ix > -1) {
                    dd.resize_dir = dd.attr.substr(resize_handle_classname_ix + 18, 2);
                    // dd.origAspectRatio = dd.width / dd.height;
                    dragHint += ', Shift to preserve proportions';
                }
                var canvasOffs = me.preview_el.offset();
                dd.canvasX = canvasOffs.left;
                dd.canvasY = canvasOffs.top;
                if (!newdiv.hasClass('active')) {
                    me.select_element(newdiv, true);
                }
                if (me.$delete_element_button) {
                    me.$delete_element_button.hide();
                }

                me.drag_elt_initial_section = me.find_section_by_y(newdiv.position().top);
                
                me.current_drag_left_section = false;
                if (me.toolbarPosition === "float") {
                    me.editing_control_elt.data("toolbarObj").hide();
                }
                me.nonDraggedElements = [];
                var thisElId = me.editing_control_elt.attr('id');
                Object.keys(me.elements_by_id).forEach(function(id) {
                    if (!me.preview_el.find("#" + id).hasClass('active')) {
                        me.nonDraggedElements.push(me.elements_by_id[id]);
                    }
                });
                me.dragSet = me.getEntireSelection();
                var primaryDragEltPos = newdiv.position();
                me.dragSet.forEach(function(draggedElt) {
                    var pos = draggedElt.elt.position();
                    var secInfo = me.find_section_by_y(pos.top);
                    draggedElt.relX = pos.left - primaryDragEltPos.left;
                    draggedElt.relY = pos.top - primaryDragEltPos.top;
                    draggedElt.origSection = secInfo;
                });
                // me.setGridVisible(true);
                me.showHintBar(dragHint);
            })
            .drag("end", function(ev, dd) {
                // me.setGridVisible(false);
                me.showSelectionHints();
                me.nonDraggedElements = [];
                var $elt;
                if (dd.resize_dir) {
                    // resize end
                    $elt = newdiv;
                    if (me.$delete_element_button) {
                        me.position_delete_button();
                        me.$delete_element_button.show();
                    }
                    setTimeout(function() {
                        me.constrain_el_to_margins(me.editing_control_elt);
                        if ($elt.hasClass('jsr-chart')) {
                            me.update_preview_chart($elt);
                        }
                        var elt_pos = $elt.position(),
                            section = me.drag_elt_initial_section,
                            new_height = $elt.height() + 1;
                        // Snap dragged top back to top of section if it was dragged past
                        if (elt_pos.top < section.top) {
                            var top_overshoot = (section.top - elt_pos.top);
                            new_height -= top_overshoot;
                            $elt.height(new_height);
                            $elt.css("top", elt_pos.top + top_overshoot);
                            elt_pos.top = section.top;
                        }
                        me.editing_control_def.top = (elt_pos.top - section.top) / me.pixels_per_unit;
                        me.editing_control_def.left = (elt_pos.left - section.left) / me.pixels_per_unit;
                        me.editing_control_def.width = ($elt.width() + 1) / me.pixels_per_unit;
                        me.editing_control_def.height = new_height / me.pixels_per_unit;
                        if (me.activeElementInstance) {
                            ['left', 'top', 'width', 'height'].forEach(dir => {
                                me.activeElementInstance.props[dir] = me.editing_control_def[dir];
                            });
                        }
                        if (me.fit_section(section.def)) {
                            me.render_template();
                        }
                        // preview might have been redrawn, need to find the new div to select it
                        $elt = me.preview_el.find("#" + elt.id);
                        me.select_element($elt);
                        me.onElementEdit();
                        setTimeout(function() {
                            if ($elt.data("toolbarObj")) {
                                me.show_toolbar($elt);
                            }
                            me.dragging = false;
                        }, 0);
                    }, 0);
                } else {
                    // drag end
                    $elt = newdiv;
                    if (me.$delete_element_button) {
                        me.position_delete_button();
                        me.$delete_element_button.show();
                    }
                    if (me.section_highlight_el) {
                        me.section_highlight_el.hide();
                    }
                    var sectionsToFit = [];
                    var detailSectionTouched = false;
                    me.dragSet.forEach(function(draggedItem) {
                        var origWidth = draggedItem.elt.width();
                        var origHeight = draggedItem.elt.height();
                        me.constrain_el_to_margins(draggedItem.elt);
                        var elt_pos = draggedItem.elt.position(),
                            new_section = me.find_section_by_y(elt_pos.top);
                        if (!new_section) {
                            var last_section = me.preview_section_offsets[me.preview_section_offsets.length - 1];
                            if (elt_pos.top > last_section.bottom) {
                                // move the control back within the section
                                draggedItem.elt.css("top", (last_section.bottom - 1) + "px");
                                elt_pos = draggedItem.elt.position();
                                new_section = last_section;
                            }
                        }
                        draggedItem.def.top = (elt_pos.top - new_section.top) / me.pixels_per_unit;
                        draggedItem.def.left = (elt_pos.left - new_section.left) / me.pixels_per_unit;
                        var newWidth = draggedItem.elt.width();
                        var newHeight = draggedItem.elt.height();
                        if (newWidth !== origWidth) {
                            draggedItem.def.width = draggedItem.elt.width() / me.pixels_per_unit;
                        }
                        if (newHeight !== origHeight) {
                            draggedItem.def.height = draggedItem.elt.height() / me.pixels_per_unit;
                        }
                        if (new_section) {
                            // Move element definition between sections in the report def
                            if (new_section !== draggedItem.origSection) {
                                var ix = draggedItem.origSection.def.elements.indexOf(draggedItem.def);
                                if (ix !== -1) {
                                    draggedItem.origSection.def.elements.splice(ix, 1);
                                }
                                new_section.def.elements.push(draggedItem.def);
                            }
                            me.sections_by_element_id[draggedItem.def.id] = new_section;
                            sectionsToFit.push(new_section.def);
                            detailSectionTouched = me.sectionIsDetail(new_section.def);
                    }
                });
                let sectionHeightChanged = false;
                sectionsToFit.forEach(section => {
                    sectionHeightChanged = me.fit_section(section) || sectionHeightChanged;
                });
                if (sectionHeightChanged) {
                    me.render_template();
                }
                if (detailSectionTouched) {
                    me.update_column_clones();
                }
                setTimeout(function() {
                    if (newdiv.data("toolbarObj")) {
                        me.show_toolbar(newdiv);
                    }
                    me.dragging = false;
                }, 0);
            }
            me.endSnapping();
        })
        .drag(function( div, ev, dd ) {
            // mouse move during drag or resize
            if (!this.throttledSnapHandlers) {
                this.createThrottledSnapHandlers();
            }
            var props = {}, min_c;
            var noSnap = jsreports.key.command || jsreports.key.control;
            var dx, dy,
                startX = dd.startX - dd.canvasX,
                startY = dd.startY - dd.canvasY;
            if (noSnap) {
                dx = dd.deltaX;
                dy = dd.deltaY;
            } else {
                dx = Math.round((startX + dd.deltaX) / this.gridSize) * this.gridSize - startX;
                dy = Math.round((startY + dd.deltaY) / this.gridSize) * this.gridSize - startY;
            }
            if (dd.resize_dir) {
                if (noSnap || !this.isSnapped) {
                    this.handleResizeMove(div, dd.resize_dir, startX, startY, dx, dy, 
                        dd.width, dd.height);
                } else {
                    this.snapResizeHandle(div, dd.resize_dir, startX, startY, dx, dy, 
                        dd.width, dd.height);
                    }
                } else {
                    var newX, newY;
                    if (noSnap) {
                        newX = dd.offsetX;
                        newY = dd.offsetY;
                    } else {
                        newX = Math.round(dd.offsetX / this.gridSize) * this.gridSize;
                        newY = Math.round(dd.offsetY / this.gridSize) * this.gridSize;
                    }
                    this.lastDragX = newX;
                    this.lastDragY = newY;
                    if (noSnap || !this.isSnapped) {
                        // If already snapped, don't pull off current snap pos, let snap algo do that on next pass
                        // $(div).css({
                        //     top: newY,
                        //     left: newX
                        // });
                        for (var i = 0; i < me.dragSet.length; i++) {
                            var item = me.dragSet[i];
                            item.elt.css({
                                top: newY + item.relY,
                                left: newX + item.relX
                            });
                        }
                    }
                    // if (noSnap) {
                    //     this.highlightAlignedElements(div);
                    // } else {
                    //     this.snapToPosition(div);
                    // }
                    me.trigger_deferred_element_drag_handling();
                }
            }.bind(this, newdiv), { relative: true });
        newdiv.on("click", this.on_preview_element_click.bind(this));
        newdiv.data("element-id", elt.id);
        newdiv.attr("id", elt.id);
        return newdiv;
    },

    renderCompositeElementChildren: function(elInst, pixelsPerUnit) {
        return _.flatten(
            elInst.getChildElementDefinitions().map(el => [
                '<div class="jsr-designer-subelement" style="',
                    `left: ${el.left * pixelsPerUnit}px;`,
                    `top: ${el.top * pixelsPerUnit}px;`,
                    `width: ${el.width * pixelsPerUnit}px;`,
                    `height: ${el.height * pixelsPerUnit}px">`,
                    this.renderElementHtml(el, 0, 0, pixelsPerUnit).html(),
                '</div>'
            ])
        ).join('');
    },

    renderElementHtml: function(elt, offsetTop, offsetLeft, pixelsPerUnit) {
        var me = this;
        var html = ['<div class="preview-element">'];
        var newdiv;
        let inst = null;
        switch(elt.type) {
            case "text":
                let rawText = elt.text.replace(/\\n/gim, '\n')
                    .replace(/\&/gim, '&amp;').replace(/\</gim, '&lt;').replace(/\>/gim, '&gt;');
                html.push(`<div class="jsr-text">${rawText}</div>`);
                html.push('</div>');
                newdiv = $(html.join(''));
                this.apply_text_styles(elt, newdiv);                
                break;
            case "image":
                html.push('<img class="jsr-designer-image"/>');
                html.push('</div>');
                newdiv = $(html.join(''));
                var url = elt.url || this.image_placeholder_url;
                var absoluteMatch = /http(s)?:\/\//.exec(url);
                if (!(absoluteMatch && absoluteMatch.index === 0)) {
                    url = (this.imageUrlPrefix || '') + url;
                }
                newdiv.find('img').attr('src', url);
                break;
            case "chart_line":
                /* falls through */
            case "chart_pie":
                /* falls through */
            case "chart_bar":
                // html.push('<canvas class="jsr-chart ' + elt.type + '"></canvas>');
                html.push('</div>');
                newdiv = $(html.join(''));
                newdiv.addClass('jsr-chart ' + elt.type);
                // Have to delay here so the chart has the properly sized element
                window.setTimeout(function() {
                    var $chart_el = $("#" + elt.id, this.preview_el);
                    this.update_preview_chart($chart_el);
                }.bind(this), 0);
                break;
            case "box":
                html.push('<div class="jsr-box" style="background-color:' + elt.background_color + ';border-color:' + elt.border_color + ';border-radius:' + elt.corner_radius + '"></div>');
                html.push('</div>');
                newdiv = $(html.join(''));
                newdiv.addClass('jsr-preview-element-box');
                break;
            case "barcode":
                html.push('<div class="jsr-barcode"></div></div>');
                newdiv = $(html.join(''));
                window.setTimeout(function() {
                    me.render_barcode(newdiv, elt);
                }.bind(this), 0);
                break;
            case "break":
                html.push('<div class="jsr-break-icon"></div></div>');
                newdiv = $(html.join(''));
                newdiv.addClass('jsr-break');
                break;
            case "subreport":
                html.push('</div>');
                newdiv = $(html.join(''));
                newdiv.addClass('jsr-subreport');
                setTimeout(function() {
                    me.renderSubreportPreview(elt, newdiv);
                }, 0);
                break;
            case "unknownJasperElement":
                html.push('</div>');
                newdiv = $(html.join(''));
                newdiv.addClass('jsr-unknown-jasper-element');
                break;
            default:
                const elClass = this.elementTypes[elt.type.toLowerCase()].handler;
                inst = new elClass(elt);
                if (elClass.isComposite) {
                    html.push(this.renderCompositeElementChildren(inst, pixelsPerUnit));
                } else {
                    html.push(inst.getDesignerHtml());
                }
                html.push('</div>');
                newdiv = $(html.join(''));
                newdiv.addClass(elClass.cssClass || ('jsr-' + elt.type));
                newdiv.data('jsr-element-instance', inst);
                inst.raiseEvent = this.onElementEvent.bind(this);
                break;
        }
        var left, width, height;
        if (elt.type === 'break') {
            left = 0;
            width = '100%';
            height = 0;
        } else {
            left = (offsetLeft + (elt.left * pixelsPerUnit)) + "px";
            width = (elt.width * pixelsPerUnit) + "px";
            height = (elt.height * pixelsPerUnit) + "px";
        }
        newdiv.css({
            top: (offsetTop + (elt.top * pixelsPerUnit)) + "px",
            left: left,
            width: width,
            height: height
        });
        if (elt.styles) {
            if (Array.isArray(elt.styles)) {
                elt.styles.map(cssClass => newdiv.addClass(cssClass));
            } else {
                newdiv.addClass(elt.styles);
            }
        }
        if (inst && inst.afterDesignerRender) {
            inst.afterDesignerRender(newdiv[0]);
        }
        return newdiv;
    },

    /** 
     * @private 
     * Render a preview of the subreport into a subreport control 
     */
    renderSubreportPreview: function(eltDef, subreportElt) {
        if (!eltDef.report) return;
        var me = this;
        var $subreportPreview = $('<div class="jsr-subreport-preview"></div>');
        subreportElt.find('.jsr-subreport-preview, .jsr-subreport-mask').remove();
        subreportElt.append($subreportPreview);
        var def = eltDef.report;
        var units = def.page.units;
        var paper_width = def.page.paper_size[units][0];
        var pxPerUnit = subreportElt.width() / paper_width;
        var subreportMarginLeft = def.page.margins.left * pxPerUnit;
        var offset = 0;
        var sections = this.getAllSections(def, true);
        sections.map(function(section) {
            section.def.elements.map(function(elt) {
                $subreportPreview.append(me.renderElementHtml(elt, offset, subreportMarginLeft, pxPerUnit));
            });
            offset += section.def.height * pxPerUnit;
        });
        subreportElt.append($('<div class="jsr-subreport-mask"></div>'));
    },

    showHintBar: function(hintText) {
        if (!this.hintBar) {
            this.hintBar = $('<div class="jsr-hint-bar"></div>');            
            this.designer_el.find('.jsr-designer-right').append(this.hintBar);
        }        
        this.hintBar.text(hintText).show();
    },

    hideHintBar: function() {
        if (this.hintBar) {
            this.hintBar.hide();
        }
    },

    setGridVisible: function(visible) {
        if (visible) {
            const nativeGridPx = 34;
            const nativeGridWidth = 1020;
            const nativeGridHeight = 680;
            const offset = this.gridSize / nativeGridPx * 2;    // 2px half-dot size
            this.preview_el.addClass('jsr-designer-grid').css({
                // background: 'radial-gradient(#888 0.5px, transparent 1px), white',
                'background-size': `${this.gridSize / nativeGridPx * nativeGridWidth}px ${this.gridSize / nativeGridPx * nativeGridHeight}px`,
                'background-position': `-${offset}px -${offset}px`  
            });
        } else {
            this.preview_el.removeClass('jsr-designer-grid');
        }
        this.gridVisible = visible;
    },

    /** 
     * @private
     * Resize the element based on an edge handle being moved, either freely with cursor or as a result of snapping 
     */
    handleResizeMove: function(el, dir, ox, oy, dx, dy, width, height) {
        var $el = $(el),
            props = { width: width, height: height },
            offs = $el.offset();
        if ( dir.indexOf("r") > -1 ) {
            props.width = Math.max( this.minimumElementSize, width + dx );
        } else if ( dir.indexOf("l") > -1 ) {
            props.width = Math.max( this.minimumElementSize, width - dx );
        }
        if ( dir.indexOf("b") > -1 ) {
            props.height = Math.max( this.minimumElementSize, height + dy );
        } else if ( dir.indexOf("t") > -1 ) {
            props.height = Math.max( this.minimumElementSize, height - dy );
        }
        if (jsreports.key.shift) {
            // Keep whichever results in the greater size
            if (props.width / width > props.height / height) {
                props.height = props.width / (width / height);
            } else {
                props.width = props.height * (width / height);
            }
        }
        if (dir.indexOf("l") > -1) {
            props.left = ox + width - props.width;
        }
        if (dir.indexOf("t") > -1 ) {
            props.top = oy + height - props.height;
        }
        $el.css(props);
    },

    createThrottledSnapHandlers: function() {
        this.snapToPosition = _.throttle(this.snapToPositionImmediate.bind(this), 250);
        this.highlightAlignedElements = _.throttle(this.highlightAlignedElementsImmediate.bind(this), 250);
        this.snapResizeHandle = _.throttle(this.snapResizeHandleImmediate.bind(this), 250);
        this.throttledSnapHandlers = true;
    },

    snapToPositionImmediate: function(el) {
        var xUnits = (this.lastDragX / this.pixels_per_unit) - this.report_def.page.margins["left"];
        var yUnits = (this.lastDragY / this.pixels_per_unit) - this.report_def.page.margins["top"];
        var snapped = this.findNearestXYInUnits(xUnits, yUnits);
        this.highlightElementsBySnapInfo(snapped);
        this.isSnapped = false;
        if (snapped.x !== null) {
            var snapXPx = (snapped.x + this.report_def.page.margins["left"]) * this.pixels_per_unit;
            $(el).css("left", snapXPx + 'px');
            this.isSnapped = true;
        } else {
            // Stop snapping, return to cursor pos
            $(el).css("left", this.lastDragX + 'px');
        }
        if (snapped.y !== null) {
            var snapYPx = (snapped.y + this.report_def.page.margins["top"]) * this.pixels_per_unit;
            $(el).css("top", snapYPx + 'px');
            this.isSnapped = true;
        } else {
            // Stop snapping, return to cursor pos
            $(el).css("top", this.lastDragY + 'px');
        }
        if (this.lastSnapEls) {
            this.lastSnapEls.removeClass("jsr-element-snapto");
        }
        snapped.els.addClass("jsr-element-snapto");
        this.lastSnapEls = snapped.els;
    },

    /** 
     * @private 
     * Attempt to snap edge during resize operation 
     */
    snapResizeHandleImmediate: function(el, dir, ox, oy, dx, dy, width, height) {
        var xUnits = ((ox + dx) / this.pixels_per_unit) - this.report_def.page.margins["left"];
        var yUnits = ((oy + dy) / this.pixels_per_unit) - this.report_def.page.margins["top"];
        var snapped = this.findNearestXYInUnits(xUnits, yUnits);
        this.highlightElementsBySnapInfo(snapped);
        this.isSnapped = false;
        if (snapped.x !== null) {
            dx = (snapped.x + this.report_def.page.margins["left"]) * this.pixels_per_unit - ox;
            this.isSnapped = true;
        }
        if (snapped.y !== null) {
            dy = (snapped.y + this.report_def.page.margins["top"]) * this.pixels_per_unit - oy;
            this.isSnapped = true;
        }
        if (this.lastSnapEls) {
            this.lastSnapEls.removeClass("jsr-element-snapto");
        }
        snapped.els.addClass("jsr-element-snapto");
        this.lastSnapEls = snapped.els;
        this.handleResizeMove(el, dir, ox, oy, dx, dy, width, height);
    },

    /** 
     * @private
     * When the user is overriding snapping, still highlight any exact snaps they happen to hit 
     */
    highlightAlignedElementsImmediate: function(el) {
        var xUnits = (this.lastDragX / this.pixels_per_unit) - this.report_def.page.margins["left"];
        var yUnits = (this.lastDragY / this.pixels_per_unit) - this.report_def.page.margins["top"];
        var lessThanOnePxInUnits = 0.9 / this.pixels_per_unit;
        var snapped = this.findNearestXYInUnits(xUnits, yUnits, lessThanOnePxInUnits);
        this.highlightElementsBySnapInfo(snapped);
    },

    /** 
     * @private 
     * Don't move any elements, but show snap results (snap lines and snap-to-element highlights) 
     */
    highlightElementsBySnapInfo: function(snapped) {
        if (snapped.x !== null) {
            var snapXPx = (snapped.x + this.report_def.page.margins["left"]) * this.pixels_per_unit;
            if (!this.xSnapLine) {
                this.xSnapLine = $('<div class="jsr-snap-marker jsr-snap-marker-vertical"></div>');
                this.preview_el.append(this.xSnapLine);
            }
            this.xSnapLine.css({
                display: 'block',
                left: snapXPx + 'px'
            });
        } else {
            if (this.xSnapLine) {
                this.xSnapLine.css('display', 'none');
            }
        }
        if (snapped.y !== null) {
            var snapYPx = (snapped.y + this.report_def.page.margins["top"]) * this.pixels_per_unit;
            if (!this.ySnapLine) {
                this.ySnapLine = $('<div class="jsr-snap-marker jsr-snap-marker-horizontal"></div>');
                this.preview_el.append(this.ySnapLine);
            }
            this.ySnapLine.css({
                display: 'block',
                top: snapYPx + 'px'
            });
        } else {
            if (this.ySnapLine) {
                this.ySnapLine.css('display', 'none');
            }
        }
        if (this.lastSnapEls) {
            this.lastSnapEls.removeClass("jsr-element-snapto");
        }
        snapped.els.addClass("jsr-element-snapto");
        this.lastSnapEls = snapped.els;
    },

    endSnapping: function() {
        this.isSnapped = false;
        if (this.xSnapLine) {
            this.xSnapLine.css('display', 'none');
        }
        if (this.ySnapLine) {
            this.ySnapLine.css('display', 'none');
        }
        if (this.lastSnapEls) {
            this.lastSnapEls.removeClass("jsr-element-snapto");
        }
    },

    /** 
     * @private
     * Find nearest snappable x, y to a given (x, y), independently of each other, all in report units 
     */
    findNearestXYInUnits: function(xUnits, yUnits, thresholdUnits) {
        var elIds = Object.keys(this.elements_by_id);
        var currentXThresholdInUnits = (typeof thresholdUnits !== 'undefined' ? thresholdUnits 
            : (this.edgeSnapThresholdPx / this.pixels_per_unit));
        var currentYThresholdInUnits = currentXThresholdInUnits;
        var newThreshold;
        var snapped = { x: null, y: null, els: $() };
        for (var i = 0; i < this.nonDraggedElements.length; i++) {
            var el = this.nonDraggedElements[i];
            if (Math.abs(el.left - xUnits) <= currentXThresholdInUnits) {
                snapped.x = el.left;
                newThreshold = Math.abs(el.left - xUnits);
                if (newThreshold < currentXThresholdInUnits) {
                    snapped.els = $();
                    currentXThresholdInUnits = newThreshold;
                }
                snapped.els = snapped.els.add(this.preview_el.find('#' + el.id));
            } else if (Math.abs(el.left + el.width - xUnits) <= currentXThresholdInUnits) {
                snapped.x = el.left + el.width;
                newThreshold = Math.abs(el.left + el.width - xUnits);
                if (newThreshold < currentXThresholdInUnits) {
                    snapped.els = $();
                    currentXThresholdInUnits = newThreshold;
                }
                snapped.els = snapped.els.add(this.preview_el.find('#' + el.id));
            }
            if (Math.abs(el.top - yUnits) <= currentYThresholdInUnits) {
                snapped.y = el.top;
                newThreshold = Math.abs(el.top - yUnits);
                if (newThreshold < currentYThresholdInUnits) {
                    snapped.els = $();
                    currentYThresholdInUnits = newThreshold;
                }
                snapped.els = snapped.els.add(this.preview_el.find('#' + el.id));
            } else if (Math.abs(el.top + el.height - yUnits) <= currentYThresholdInUnits) {
                snapped.y = el.top + el.height;
                newThreshold = Math.abs(el.top + el.height - yUnits);
                if (newThreshold < currentYThresholdInUnits) {
                    snapped.els = $();
                    currentYThresholdInUnits = newThreshold;
                }
                snapped.els = snapped.els.add(this.preview_el.find('#' + el.id));
            }
        }
        return snapped;
    },

    /**
     * @private
     * Move the displayed control element back within the margin area, BEFORE we read its position to store in the def
     */
    constrain_el_to_margins: function($elt) {
        if (this.jasperMode) return;
        var pos = $elt.position(),
            width = $elt.width(),
            height = $elt.height();
        if (pos.left < this.preview_margins.left) {
            $elt.css("left", this.preview_margins.left + "px");
            pos.left = this.preview_margins.left;
        }
        if (pos.top < this.preview_margins.top) {
            $elt.css("top", this.preview_margins.top + "px");
            pos.top = this.preview_margins.top;
        }
        if (pos.top + height > this.preview_el.height() - this.preview_margins.bottom) {
            $elt.css("height", (this.preview_el.height() - this.preview_margins.bottom - pos.top) + "px");
        }
        if (pos.left + width > this.preview_el.width() - this.preview_margins.right) {
            $elt.css("width", (this.preview_el.width() - this.preview_margins.right - pos.left) + "px");
        }
    },

    /** 
     * Increase section height if needed to contain its elements.  Returns whether
     * or not the section height was changed.
     */
    fit_section: function(sectiondef) {
        var max_y = sectiondef.height;
        sectiondef.elements.map(function(eltdef) {
            max_y = Math.max(max_y, (eltdef.top || 0) + (eltdef.height || 0));
        });
        if (max_y > sectiondef.height) {    
            sectiondef.height = max_y;
            return true;
        }
        return false;
    },
    
    trigger_deferred_element_drag_handling: function() {
        if (this.element_drag_handling_timeout) {
            //window.clearTimeout(this.element_drag_handling_timeout);
            // continuing to delay while dragging results in a laggy feel,
            // so instead we just throttle to a maximum of once per 150ms
            return;
        }
        if (!this.dlgt_do_deferred_element_drag_handling) {
            this.dlgt_do_deferred_element_drag_handling = this.do_deferred_element_drag_handling.bind(this);
        }
        this.element_drag_handling_timeout = window.setTimeout(
            this.dlgt_do_deferred_element_drag_handling, 
            this.element_drag_handling_delay_ms);
    },
    
    do_deferred_element_drag_handling: function() {
        this.element_drag_handling_timeout = null;
        if (!this.editing_control_elt) return;
        var y = this.editing_control_elt.position().top,
            sec_bounds = this.find_section_by_y(y);
        if (sec_bounds) {
            if (!this.current_drag_left_section && sec_bounds === this.drag_elt_initial_section) {
                if (this.section_highlight_el) {
                    this.section_highlight_el.hide();
                }
                return;
            }
            this.current_drag_left_section = true;
            if (!this.section_highlight_el) {
                this.section_highlight_el = $('<div class="jsr-section-highlight"></div>');
                this.preview_el.append(this.section_highlight_el);
            }
            this.section_highlight_el.show();
            this.section_highlight_el.css({
                top: sec_bounds.top + "px",
                left: (sec_bounds.left - 3) + "px",
                right: sec_bounds.right + "px",
                height: (sec_bounds.bottom - sec_bounds.top) + "px"
            });
        }
    },
    
    update_preview_chart: function($elt) {
        $elt.find('svg').remove();
        var svg = dimple.newSvg($elt[0], $elt.width(), $elt.height());
        var myChart = new dimple.chart(svg, $elt.hasClass("chart_pie") ? this.chart_preview_pie_data : this.chart_preview_line_data);
        if ($elt.hasClass("chart_pie")) {
            var legendWidth = Math.max(0, Math.min(130, $elt.width() * 0.25));
            myChart.setBounds(20, 20, Math.max(0, $elt.width() - legendWidth - 30), Math.max($elt.height() - 40, 0));
            myChart.addMeasureAxis('p', 'Value field');
            myChart.addSeries('l', dimple.plot.pie);
            myChart.addLegend($elt.width() - legendWidth, 20, legendWidth, Math.max($elt.height() - 40, 0), "left");
        } else {
            myChart.setBounds(40, 20, Math.max($elt.width() - 60, 0), Math.max($elt.height() - 40, 0));
            myChart.addCategoryAxis('x', 'l');
            myChart.addMeasureAxis('y', 'Value field');
            myChart.addSeries(null, ($elt.hasClass("chart_line") ? dimple.plot.line : dimple.plot.bar));
        }
        myChart.draw();
    },
    
    on_preview_element_click: function(evt) {
        var multiSelectKeyPressed = jsreports.key.command || jsreports.key.control,
            $el = $(evt.target).closest(".preview-element");
        const eltId = $el.data("element-id");
        if ($el.hasClass('active')) {
            // cmd+click on already selected element = de-select but keep others selected
            if (multiSelectKeyPressed) {
                if ($el.is(this.editing_control_elt)) {
                    if (this.otherSelections && this.otherSelections.length > 0) {
                        this.editing_control_elt.removeClass('active');
                        var lastAddedOtherSelection = this.otherSelections.pop();
                        this.editing_control_elt = lastAddedOtherSelection.elt;
                        this.editing_control_def = lastAddedOtherSelection.def;
                    } else {
                        this.clear_selection();
                    }
                } else {
                    for (var i = 0; i < this.otherSelections.length; i++) {
                        if ($el.is(this.otherSelections[i].elt)) {
                            this.otherSelections.splice(i, 1);
                            $el.removeClass('active');
                            break;
                        }
                    }
                }
            }
        } else {
            if (this.editing_control_elt && multiSelectKeyPressed) {
                // Add to "other selected elements" list
                if (!this.multiSelect) {
                    this.hide_toolbar();
                    this.multiSelect = true;
                }
                $el.addClass("active");
                this.otherSelections.push({
                    elt: $el,
                    def: this.elements_by_id[eltId]
                });
            } else {
                if (this.multiSelect) {
                    this.otherSelections = [];
                    this.multiSelect = false;
                }
                this.clear_selection();
                // template might have been redrawn, original $el is useless
                $el = this.preview_el.find(`#${eltId}`);
                this.select_element($el);
            }
        }
        if (this.preview_el.find('.active').length > 0) {
            this.showSelectionHints();
        } else {
            this.hideHintBar();
        }
        evt.stopPropagation();
    },

    showSelectionHints: function() {
        var keyname = jsreports.isMac ? 'Cmd' : 'Ctrl';
        this.showHintBar(keyname + '+click to add to selection, ' + keyname + '+C to copy, ' 
            + keyname + '+V to paste, Delete to delete');
    },
    
    generate_text_suggestions: function(sectionEntry) {
        const is_header_footer = sectionEntry.is_header || sectionEntry.is_footer;
        // const dataSection = this.getDataSections()[sectionEntry.detailIndex];
        // if (!dataSection) return [];
        var me = this;
        const getEmptyNode = () => ({ list: [], dict: {} });
        let autoCompleteData = getEmptyNode();
        
        var sch = this.getSchemaForSectionEntry(sectionEntry);
        if (!sch) return autoCompleteData;

        const fields = this.jasperMode ? sch.fields.map(fld => '$F{' + fld.name + '}')
            : jsreports.elements.Text.getTextSuggestions(sch);

        /** Fields can include dot-separated object properties.  We split on the dot and only suggest one piece at a time,
            so we need to maintain a nested lookup level-by-level.  Keep pointers to all lists so we can sort them later. */
        const listsToSort = [ autoCompleteData.list ];
        fields.forEach(fieldName => {
            if (fieldName[0] === '[' && fieldName[fieldName.length - 1] === ']') {
                const parts = fieldName.replace(/[\[\]]/g, '').split('.');
                let part, 
                    node = autoCompleteData;
                for (let i = 0; i < parts.length; i++) {
                    let part = parts[i];
                    if (node.dict[part] !== undefined) {
                        node = node.dict[part];
                    } else {
                        // Must convert e.g. [partA.partB.partC] -> [partA]
                        node.list.push(i === 0 ? `[${part}]` : part);
                        node.dict[part] = node = getEmptyNode();
                        listsToSort.push(node.list);
                    }
                }
            } else {
                // Not brackets, push verbatim
                autoCompleteData.list.push(fieldName);
            }
        });
        this.report_def.inputs.forEach(input => {
            autoCompleteData.list.push(`[?${input.name}]`);
        });
        if (is_header_footer) {
            this.group_aggregate_function_suggestions.forEach(suggestion => { 
                autoCompleteData.list.push(suggestion);
            });
        }
        listsToSort.forEach(list => list.sort());
        return autoCompleteData;
    },
    
    select_element: function($el, hide_toolbar) {
        var me = this;
        this.selectedSection = null;
        $(".preview .page .preview-element.active").removeClass("active");
        $el.addClass("active");
        var eltID = $el.data("element-id"),
            elt = this.elements_by_id[eltID];
        this.editing_control_def = elt;
        this.editing_control_elt = $el;
        this.activeElementInstance = null;  // will be set in default: case below
        var toolbar = $el.data("toolbarObj"),
            toolbarExisted = !!toolbar;
        var completer;
        var section;
        switch (elt.type) {
            case "text":
                if (!toolbarExisted) {
                    if (!this.text_toolbar) {
                        this.create_text_toolbar();
                    }
                    $el.toolbar({
                        content: "#jsr-designer-text-toolbar",
                        position: "bottom",
                        hideOnClick: (this.toolbarPosition === "float")
                    });
                    $el.toolbar("getToolbarElement").closest(".tool-container").addClass("jsr-toolbar");
                    toolbar = $el.data("toolbarObj");
                    this.bind_text_toolbar_events();
                    const $inputWrap = toolbar.toolbar.find(".jsr-toolbar-text-content .input-wrap");
                    this.initTextComplete($inputWrap, me.on_text_toolbar_text_change.bind(me));
                }
                section = this.find_section_by_y($el.position().top);
                this.autoCompleteOptions = this.generate_text_suggestions(section.sectionInfo);
                toolbar.toolbar.find(".jsr-toolbar-text-content textarea").val(elt.text);
                toolbar.toolbar.find(".jsr-toolbar-text-font-family select").val(elt.font ? elt.font.name : "default");
                toolbar.toolbar.find(".jsr-toolbar-text-font-size select").val(elt.fontsize || '');
                toolbar.toolbar.find(".tool-item").on("click", this.on_toolbar_element_click);
                if (!hide_toolbar) {
                    this.show_toolbar($el);
                    // setTimeout(() => {
                    //     try {
                    //         completer.input.focus(); 
                    //     } catch(e) {}
                    // }, 10);
                }
                break;
            case "image":
                if (!toolbarExisted) {
                    if (!this.image_toolbar) {
                        this.create_image_toolbar();
                    }
                    $el.toolbar({
                        content: "#jsr-designer-image-toolbar",
                        position: "bottom",
                        hideOnClick: (this.toolbarPosition === "float")
                    });
                    $el.toolbar("getToolbarElement").closest(".tool-container").addClass("jsr-toolbar");
                    this.bind_image_toolbar();
                } 
                if (!hide_toolbar) {
                    this.show_toolbar($el);
                }
                break;
            case "chart_line":
            case "chart_pie":
            case "chart_bar":
                if (!toolbarExisted) {
                    if (!this.chart_toolbar) {
                        this.create_chart_toolbar();
                    }
                    $el.toolbar({
                        content: "#jsr-designer-chart-toolbar",
                        position: "bottom",
                        hideOnClick: (this.toolbarPosition === "float")
                    });
                    $el.toolbar("getToolbarElement").closest(".tool-container").addClass("jsr-toolbar");
                    var value_field = (this.editing_control_def.series && this.editing_control_def.series.length > 0) ? 
                        this.editing_control_def.series[0].value_field 
                        : "";
                    var label_field = "";
                    if (this.editing_control_def.type === "chart_line" || this.editing_control_def.type === "chart_bar") {
                        if (this.editing_control_def.x_axis) {
                            label_field = this.editing_control_def.x_axis.label_field;
                        }
                    } else if (this.editing_control_def.type === "chart_pie") {
                        if (this.editing_control_def.series && this.editing_control_def.series.length > 0) {
                            label_field = this.editing_control_def.series[0].label_field;
                        }
                    }
                    var chart_tb_instance = $el.toolbar("getToolbarElement");
                    chart_tb_instance.find(".jsr-toolbar-chart-value-field select").val(value_field);
                    chart_tb_instance.find(".jsr-toolbar-chart-label-field select").val(label_field);
                    switch (elt.type) {
                        case "chart_line":
                            chart_tb_instance.find(".jsr-toolbar-chart-type select").val("line");
                            break;
                        case "chart_bar":
                            chart_tb_instance.find(".jsr-toolbar-chart-type select").val("bar");
                            break;
                        case "chart_pie":
                            chart_tb_instance.find(".jsr-toolbar-chart-type select").val("pie");
                            break;
                    }
                    if (!hide_toolbar) {
                        setTimeout(function() {
                            this.show_toolbar($el);
                        }.bind(this), 250);
                    }
                } else {
                    if (!hide_toolbar) {
                        this.show_toolbar($el);
                    }
                }
                break;
            case "box":
                if (!toolbarExisted) {
                    if (!this.box_toolbar) {
                        this.create_box_toolbar();
                    }
                    $el.toolbar({
                        content: "#jsr-designer-box-toolbar",
                        position: "bottom",
                        hideOnClick: (this.toolbarPosition === "float")
                    });
                    $el.toolbar("getToolbarElement").closest(".tool-container").addClass("jsr-toolbar");
                    this.bind_box_toolbar();
                }
                if (!hide_toolbar) {
                    this.show_toolbar($el);
                }
                break;
            case "barcode":
                if (!toolbarExisted) {
                    if (!this.barcode_toolbar) {
                        this.create_barcode_toolbar();
                    }
                    $el.toolbar({
                        content: "#jsr-designer-barcode-toolbar",
                        position: "bottom",
                        hideOnClick: (this.toolbarPosition === "float")
                    });
                    $el.toolbar("getToolbarElement").closest(".tool-container").addClass("jsr-toolbar");
                    this.bind_barcode_toolbar();
                }
                section = this.find_section_by_y($el.position().top);
                this.autoCompleteOptions = this.generate_text_suggestions(section.sectionInfo);
                $el.data("toolbarObj").toolbar.find(".jsr-toolbar-barcode-value input").val(elt.value);
                if (!hide_toolbar) {
                    this.show_toolbar($el);
                }
                break;
            case "break":
                if (!toolbarExisted) {
                    if (!this.break_toolbar) {
                        this.create_break_toolbar();
                    }
                    $el.toolbar({
                        content: "#jsr-designer-break-toolbar",
                        position: "bottom",
                        hideOnClick: (this.toolbarPosition === "float")
                    });
                    $el.toolbar("getToolbarElement").closest(".tool-container").addClass("jsr-toolbar");
                    this.bind_break_toolbar();
                }
                if (!hide_toolbar) {
                    this.show_toolbar($el);
                }
                break;
            case "subreport":
                if (!toolbarExisted) {
                    if (!this.subreport_toolbar) {
                        this.create_subreport_toolbar();
                    }
                    $el.toolbar({
                        content: "#jsr-designer-subreport-toolbar",
                        position: "bottom",
                        hideOnClick: (this.toolbarPosition === "float")
                    });
                    $el.toolbar("getToolbarElement").closest(".tool-container").addClass("jsr-toolbar");
                    this.bind_subreport_toolbar();
                }
                if (!hide_toolbar) {
                    this.show_toolbar($el);
                }
                break;
            default:
                const elClass = this.elementTypes[elt.type.toLowerCase()].handler;
                let inst = $el.data('jsr-element-instance');
                if (!inst) {
                    inst = new elClass(elt);
                }
                this.activeElementInstance = inst;
                this.refreshCustomElementToolbar();
                if (!hide_toolbar) {
                    this.show_toolbar($el);
                }
                if (this.activeElementInstance.onDesignerSelect) {
                    this.activeElementInstance.onDesignerSelect($el[0]);
                }
                break;
        }
        const $toolbarEl = $el.toolbar("getToolbarElement");
        if ($toolbarEl.length > 0) {
            const toolbarDomEl = $toolbarEl[0];
            const allowed = (!this.allowToolbarControl || !!this.allowToolbarControl(elt.type, 'conditionalRules'));
            if (allowed) {
                this.addConditionalPropertiesButtonToToolbar(toolbarDomEl);
                const condPropsCount = (elt && elt.conditionalRules) ? elt.conditionalRules.length : 0;
                this.setCondPropsCount(condPropsCount, toolbarDomEl);
            }
        }
        if (!this.$delete_element_button) {
            this.$delete_element_button = $('<div class="delete-element-button"><div style="float: right">' + t('Delete') + ' <span class="delete-element-icon">X</span></div><div>');
            this.$delete_element_button.on("click", this.delete_selected_control.bind(this));
            this.preview_el.append(this.$delete_element_button);
        }
        this.position_delete_button();
        this.collapseLeftPaneIfOverlay();
        this.setGridVisible(true);
    },

    initTextComplete: function($inputWrap, onChangeHandler) {
        const me = this;
        const getSubKeys = (autocompleteData, objPath) => {
            const parts = objPath.split('.')
            let node = autocompleteData;
            for (let i = 0; i < parts.length; i++) {
                node = node.dict[parts[i]];
                if (!node) return [];
            }
            return node.list;
        }

        const autocompleteStrategy = {
          id: 'textAutocompleteStrategy',
          match: /(^|\s)((\[)?[\w\-\.]*)$/,
          search: (term, callback) => {
            if (term[term.length - 1] === '.') {
                // Assuming it starts with [ here
                me.lastAutocompleteWasSubkey = true;
                return callback(getSubKeys(me.autoCompleteOptions, term.substr(1, term.length - 2))
                    // .map(subkey => `${term}${subkey}`)
                    );
            }
            me.lastAutocompleteWasSubkey = false;
            callback(me.autoCompleteOptions.list.filter(function(name) {
              return name.startsWith(term);
            }));
          },
          template: (name) => {
            return name;
          },
          replace: (name) => {
            return me.lastAutocompleteWasSubkey ? `$1$2${name}` : ('$1' + name);
          }
        };

        const $textArea = $('<textarea></textarea>');
        $inputWrap.append($textArea);
        const editor = new Textarea($textArea[0]);
        const textcomplete = new Textcomplete(editor, {
            dropdown: {
                maxCount: Infinity
            }
        });
        $textArea.data('textcomplete', textcomplete);
        textcomplete.register([ autocompleteStrategy ]);
        $textArea.on('focus', this.onToolbarTextInputFocus.bind(this));
        $textArea.on('blur', this.onToolbarTextInputBlur.bind(this));
        $textArea.on('change', (evt) => {
            onChangeHandler(evt.target.value);
            this.onElementEdit();
        });
    },

    onToolbarTextInputFocus: (evt) => {
        $(evt.target).closest('.input-wrap').addClass('jsr-input-active');
    },

    onToolbarTextInputBlur: (evt) => {
        const $textarea = $(evt.target);
        const completer = $textarea.data('textcomplete');
        if (completer && completer.dropdown) {
            completer.dropdown.deactivate();
        }
        $textarea.closest('.input-wrap').removeClass('jsr-input-active');
    },

    setCondPropsCount: function(count, toolbarDomEl) {
        const $bubble = $(toolbarDomEl).find('.jsr-cond-props-count-bubble');
        if (count > 0) {
            $bubble.text(count).css('display', 'block');
        } else {
            $bubble.css('display', 'none');
        }
    },

    refreshCustomElementToolbar: function() {
        const elDef = this.editing_control_def;
        const $el = this.editing_control_elt;
        const inst = this.activeElementInstance;
        const elClass = inst.constructor;
        if ($el.data("toolbarObj")) {
            $el.toolbar("getToolbarElement").remove();
        }
        $(`#jsr-designer-toolbar-${elDef.type}`).remove();
        const containingSection = this.find_section_by_y($el.position().top).sectionInfo;
        const activeSchema = this.getSchemaForSectionEntry(containingSection);
        this.createElementToolbar(elClass, inst, activeSchema);
        $el.toolbar({
            content: `#jsr-designer-toolbar-${elDef.type}`,
            position: 'bottom',
            hideOnClick: (this.toolbarPosition === "float")
        });
        const toolbarEl = $el.toolbar("getToolbarElement");
        toolbarEl.closest('.tool-container').addClass('jsr-toolbar');
        this.bindElementToolbar(toolbarEl[0], elClass, elDef);
        this.show_toolbar($el);
    },

    selectSection: function(section) {
        this.selectedSection = section;
        if (!this.sectionToolbar || !this.preview_el.data("toolbarObj")) {
            this.createSectionToolbarTemplateEl();
            this.preview_el.toolbar({
                content: '#jsr-designer-toolbar-section',
                position: 'bottom',
                hideOnClick: false
            });
            this.preview_el.toolbar("getToolbarElement")
                .closest('.tool-container').addClass('jsr-toolbar');
            this.sectionToolbar = this.preview_el.data("toolbarObj");
        }
        const $toolbarEl = this.preview_el.toolbar("getToolbarElement");

        // Add conditional rules button
        if ($toolbarEl.length > 0) {
            const toolbarDomEl = $toolbarEl[0];
            const allowed = (!this.allowToolbarControl || !!this.allowToolbarControl('section', 'conditionalRules'));
            if (allowed) {
                this.addConditionalPropertiesButtonToToolbar(toolbarDomEl);
                const condPropsCount = (section.def && section.def.conditionalRules) ? 
                    section.def.conditionalRules.length : 0;
                this.setCondPropsCount(condPropsCount, toolbarDomEl);
            }
        }

        this.bindSectionToolbar($toolbarEl[0], section);
        // Hide any open element toolbar
        if (this.current_toolbar_owner_el && this.toolbarPosition !== "float") {
            this.hide_toolbar();
        }
        this.dock_toolbar(this.sectionToolbar.toolbar);
        this.collapseLeftPaneIfOverlay();
    },

    createSectionToolbarTemplateEl: function() {
        $('#jsr-designer-toolbar-section').remove();
        const $toolbar = $([
            '<div id="jsr-designer-toolbar-section" style="display:none">',
                '<div>',
                    '<div class="tool-item gradient jsr-toolbar-subreport-link not-pressable">',
                        'Section: <span class="jsr-section-toolbar-section-name"></span>',
                    '</div>',
                '</div>',
            '</div>'
        ].join(''));
        // const $toolbar = $(`<div id="jsr-designer-toolbar-section" style="display:none">Section: <span class="jsr-section-toolbar-section-name"></span></div>`);
        $toolbar.append(this.get_advanced_editor_icon());
        $(this.container).append($toolbar);
    },

    bindSectionToolbar: function(toolbarEl, sectionDef) {
        $('span.jsr-section-toolbar-section-name', toolbarEl).text(sectionDef.label);
    },

    show_toolbar: function($el) {
        // Sometimes show_toolbar is called with a delay; check in case selection has changed
        if (!this.editing_control_elt.is($el)) return;
        // In docked mode, if another toolbar is present, hide it first
        if (this.current_toolbar_owner_el && !this.current_toolbar_owner_el.is($el) && this.toolbarPosition !== "float") {
            this.hide_toolbar();
        }
        var toolbar = $el.data("toolbarObj");
        if (this.toolbarPosition === "float") {
            toolbar.show();
            $el.toolbar("calculatePosition");
        } else {
            this.dock_toolbar(toolbar.toolbar);
        }
        this.current_toolbar_owner_el = $el;
    },

    hide_toolbar: function() {
        if (this.showing_property_editor) {
            this.on_property_editor_ok();   // Default to saving
        }
        var toolbar = null;
        if (this.current_toolbar_owner_el) {
            toolbar = this.current_toolbar_owner_el.data("toolbarObj");
        } else if (this.selectedSection) {
            toolbar = this.preview_el.data("toolbarObj");
        }
        if (toolbar && toolbar.toolbar.is(":visible")) {
            toolbar.toolbar.hide();
            this.adjust_preview_dimensions();
        }
        this.current_toolbar_owner_el = null;
    },

    dock_toolbar: function($toolbar_el) {
        var $right = this.designer_el.find(".jsr-designer-right"),
            $preview_container = $right.find(".preview");
        $right.append($toolbar_el);
        if (this.toolbarPosition === "top") {
            $toolbar_el.addClass("jsr-toolbar-docked").css({
                position: "absolute",
                top: this.designer_el.find(".palette").height(),
                left: 0,
                width: "100%",
                opacity: 1,
                display: "block"
            });
        } else {
            // Position at bottom
            $toolbar_el.addClass("jsr-toolbar-docked").css({
                position: "absolute",
                top: "auto",
                left: 0,
                bottom: 0,
                width: "100%",
                opacity: 1,
                display: "block"
            });
        }
        this.adjust_preview_dimensions();
    },

    render_barcode: function($elt, elt_def) {
        var type = elt_def.barcode_type,
            $barcode_container = $elt.find(".jsr-barcode");
        $barcode_container.empty().removeClass("qrcode");
        if (type === "QR") {
            // QR code wants to be rendered directly into a <div>
            var min_dimension = Math.min($elt.width(), $elt.height());
            new QRCode($barcode_container[0], {
                text: this.barcode_dummy_values[type],
                width: min_dimension,
                height: min_dimension
            });
            $barcode_container.addClass("qrcode");
        } else {
            // JSBarcode expects an <img>
            var $img = $('<img>');
            $barcode_container.append($img);
            $img.JsBarcode(this.barcode_dummy_values[type], { 
                format: type,
                displayValue: !!elt_def.show_value,
                fontSize: Math.max(12, Math.floor($barcode_container.height() / 3))
            });
        }
    },
    
    on_toolbar_element_click: function(evt) {
        //$(evt.target).closest(".tool-item").addClass("selected");
    },
    
    position_delete_button: function() {
        var offs = this.editing_control_elt.position();
        this.$delete_element_button.css({
            top: (offs.top - 19) + "px",
            right: (this.preview_el.width() - (offs.left + this.editing_control_elt.width() - 10)) + "px"
        });
        this.$delete_element_button.show();
    },
    
    getEntireSelection: function() {
        return (this.otherSelections || []).concat([{
            elt: this.editing_control_elt,
            def: this.editing_control_def
        }]);
    },

    delete_selected_control: function() {
        if (!this.editing_control_elt) return;
        var touchedDetail = false;
        var eltsToRemove = $();
        this.getEntireSelection().forEach(function(selectedItem) {
            var sectiondef = this.sections_by_element_id[selectedItem.def.id].def;
            sectiondef.elements.splice(sectiondef.elements.indexOf(selectedItem.def), 1);
            delete this.sections_by_element_id[selectedItem.def.id];
            eltsToRemove = eltsToRemove.add(selectedItem.elt);
            touchedDetail = this.sectionIsDetail(sectiondef);
        }.bind(this));
        this.clear_selection();
        eltsToRemove.remove();
        if (touchedDetail) {
            this.update_column_clones();
        }
    },
    
    copy_selection: function() {
        if (!this.editing_control_def) return;
        this.clipboard = (this.otherSelections || []).slice(0).concat([{
            elt: this.editing_control_elt,
            def: this.editing_control_def
        }]);
    },

    paste_selection: function() {
        if (!this.clipboard) return;
        var me = this;
        this.clear_selection();
        var affectedSections = {};
        // Clone selected elements, one grid square to the right, and select them
        this.clipboard.forEach(function(selection) {
            var clonedDef = $.extend(true, {}, selection.def, {
                id: me.get_next_element_id(),
                left: selection.def.left + (me.gridSize / me.pixels_per_unit),
                top: selection.def.top + (me.gridSize / me.pixels_per_unit)
            });
            var section = me.find_section_by_y(selection.elt.position().top);
            if (!section) {
                section = me.preview_section_offsets[me.preview_section_offsets.length - 1];
            }
            section.def.elements.push(clonedDef);
            me.sections_by_element_id[clonedDef.id] = section;
            var clonedElt = me.render_template_element(clonedDef, section.top);
            me.preview_el.append(clonedElt);
            me.otherSelections.push({
                def: clonedDef,
                elt: clonedElt
            });
            if (!affectedSections[section.top]) {
                affectedSections[section.top] = section;
            }
        });
        let sectionHeightChanged = false;
        Object.keys(affectedSections).forEach(function(sectionTop) {
            var section = affectedSections[sectionTop];
            sectionHeightChanged = me.fit_section(section.def) || sectionHeightChanged;
        });
        if (sectionHeightChanged) {
            this.render_template();
        }
        this.otherSelections.forEach(function (newSeln) {
            newSeln.elt = me.preview_el.find("#" + newSeln.def.id);
            newSeln.elt.addClass('active');
        });
        var lastItem = this.otherSelections.pop();
        this.editing_control_elt = lastItem.elt;
        this.editing_control_def = lastItem.def;
        this.multiSelect = this.otherSelections.length > 0;
    },

    clear_selection: function() {
        if (!this.editing_control_elt && !this.selectedSection) return;
        if (this.conditionalPropertiesPicker) {
            this.conditionalPropertiesPicker.forceClose();
            this.conditionalPropertiesPicker = null;
        }
        if (this.multiSelect) {
            this.otherSelections.forEach(function(otherSel) {
                otherSel.elt.removeClass('active');
            });
            this.otherSelections = [];
            this.multiSelect = false;
        }
        var toolbar = null;
        if (this.editing_control_elt) {
            toolbar = this.editing_control_elt.data("toolbarObj");
        } else if (this.selectedSection) {
            toolbar = this.preview_el.data("toolbarObj");
        }
        if (toolbar) {
            this.hide_toolbar();
            // if (this.toolbarPosition !== "float") {
            //     this.adjust_preview_dimensions();
            // }
        }
        if (this.editing_control_elt) {
            if (this.activeElementInstance && this.activeElementInstance.onDesignerDeselect) {
                this.activeElementInstance.onDesignerDeselect(this.editing_control_elt[0]);
            }
            this.editing_control_elt.removeClass("active");
            this.editing_control_elt = null;
            this.editing_control_def = null;
        }
        this.activeElementInstance = null;
        if (this.$delete_element_button) {
            this.$delete_element_button.hide();
        }
        this.selectedSection = null;
        this.hideHintBar();
        this.setGridVisible(false);
    },

    on_arrow_key: function(e) {
        if (!this.editing_control_elt) return;
        const elDef = this.editing_control_def;
        const el = this.editing_control_elt;
        const code = e.keyCode || e.which;
        const unitsPerGridSquare = parseFloat((this.gridSize / this.pixels_per_unit).toFixed(4));
        const onePixel = jsreports.key.command || jsreports.key.control;
        const leftSquares = Math.floor(elDef.left / unitsPerGridSquare);
        const leftGridLineUnits = leftSquares * unitsPerGridSquare;
        const leftRemainder = elDef.left - leftGridLineUnits;
        const topSquares = Math.floor(elDef.top / unitsPerGridSquare);
        const topGridLineUnits = topSquares * unitsPerGridSquare;
        const topRemainder = elDef.top - topGridLineUnits;
        const leftOffset = parseFloat(el.css('left')) - (elDef.left * this.pixels_per_unit);
        const topOffset = parseFloat(el.css('top')) - (elDef.top * this.pixels_per_unit);
        const epsilon = 0.00005;
        switch (code) {
            case 37:  // left
                if (onePixel) {
                    elDef.left -= (1 / this.pixels_per_unit);
                } else {
                    if (leftRemainder > 0) {
                        elDef.left = leftGridLineUnits;
                    } else {
                        elDef.left = leftGridLineUnits - unitsPerGridSquare;
                    }
                }
                break;
            case 38:  // up
                if (onePixel) {
                    elDef.top -= (1 / this.pixels_per_unit);
                } else {
                    if (topRemainder > 0) {
                        elDef.top = topGridLineUnits;
                    } else {
                        elDef.top = topGridLineUnits - unitsPerGridSquare;
                    }
                }
                break;
            case 39:  // right
                if (onePixel) {
                    elDef.left += (1 / this.pixels_per_unit);
                } else {
                    elDef.left = (leftSquares + 1) * unitsPerGridSquare + epsilon;
                }
                break;
            case 40:  // down
                if (onePixel) {
                    elDef.top += (1 / this.pixels_per_unit);
                } else {
                    elDef.top = (topSquares + 1) * unitsPerGridSquare + epsilon;
                }
                break;
        }
        elDef.left = Math.max(0, elDef.left);
        elDef.top = Math.max(0, elDef.top);
        this.editing_control_elt.css({
            left: leftOffset + elDef.left * this.pixels_per_unit,
            top: topOffset + elDef.top * this.pixels_per_unit
        });
        this.position_delete_button();
        e.preventDefault();
    },
    
    init_palette_events: function() {
        var me = this,
            YUI = me.YUI,
            $new_ctl_buttons = $(".palette .palette-item", this.designer_el);
        $new_ctl_buttons.each(function(index, palette_item_el) {
            $(palette_item_el)
                .addClass('jsr-draggable')
                .drag("start", function() {
                    // Hide any toolbar that may be visible
                    if (me.editing_control_elt && me.toolbarPosition === "float") {
                        me.editing_control_elt.data("toolbarObj").hide();
                    }
                    return $(this).clone()
                        .addClass("jsr-drag-proxy")
                        .css("opacity", 0.75)
                        .css("position", "absolute")
                        .appendTo(document.body);
                })
                .drag(function(ev, dd ) {
                    $( dd.proxy ).css({
                        top: dd.offsetY,
                        left: dd.offsetX
                    });
                })
                .drag("end", function( ev, dd ) {
                    // Dropping new control onto canvas
                    var elt_type = $(this).data("elementtype"),
                        page_offset = me.preview_el.offset(),
                        left = dd.offsetX - page_offset.left - me.preview_margins.left,
                        top = dd.offsetY - page_offset.top;
                    var elt = me.create_element(elt_type, left, top);
                    var $newdiv = me.render_template_element(elt, 0);
                    me.preview_el.append($newdiv);
                    $(dd.proxy).remove();
                    window.setTimeout(function() {
                       me.constrain_el_to_margins($newdiv);
                        var elt_pos = $newdiv.position(),
                            new_section = me.find_section_by_y(elt_pos.top);
                        if (!new_section) {
                            new_section = me.preview_section_offsets[me.preview_section_offsets.length - 1];
                        }
                        new_section.def.elements.push(elt);
                        me.sections_by_element_id[elt.id] = new_section;
                        elt.top = (elt_pos.top - new_section.top) / me.pixels_per_unit;
                        elt.left = (elt_pos.left - new_section.left) / me.pixels_per_unit;
                        elt.width = $newdiv.width() / me.pixels_per_unit;
                        elt.height = $newdiv.height() / me.pixels_per_unit;
                        // Update the backing instance if there is one, since we just changed props
                        const inst = $newdiv.data('jsr-element-instance');
                        if (inst) {
                            _.extend(inst.props, elt);
                        }
                        if (me.fit_section(new_section.def)) {
                            me.render_template();
                        }
                        // preview might have been redrawn, need to find the new div to select it
                        var $elt = me.preview_el.find("#" + elt.id);
                        me.select_element($elt);
                        if (me.sectionIsDetail(new_section.def)) {
                            me.update_column_clones();
                        }
                    }, 0);
                });
        });
    },
        
    create_element: function(type, left, top) {
        var elt = {
            id: this.get_next_element_id(),
            type: type,
            left: left / this.pixels_per_unit,
            top: top / this.pixels_per_unit,
            width: 150 / this.pixels_per_unit,
            height: 40 / this.pixels_per_unit,
            visible: true
        };
        switch (type) {
            case "text":
                $.extend(elt, this.get_default_props(type));
                break;
            case "image":
                elt.height = 150 / this.pixels_per_unit;
                break;
            case "chart":
                elt.type = "chart_line"; // default to line type
                elt.height = 150 / this.pixels_per_unit;
                break;
            case "box":
                elt.height = 70 / this.pixels_per_unit;
                elt.width = 70 / this.pixels_per_unit;
                elt.corner_radius = 0;
                elt.background_color = "#cdf";
                elt.border_color = "#555";
                break;
            case "barcode":
                elt.barcode_type = "CODE128";
                elt.value = "";
                elt.show_value = false;
                break;
            case "break":
                elt.breakType = 'page';
                elt.everyNth = 1;
                break;
            case "subreport":
                $.extend(elt, this.get_default_props(type));
                break;  
            default:
                const elClass = this.elementTypes[type.toLowerCase()];
                if (!elClass) throw new Error(`Couldn't find class for element type ${type}`);
                const inst = new elClass.handler();
                Object.assign(elt, inst.props);
                break;
        }
        return elt;
    },
    
    adjust_preview_dimensions: function() {
        // May be no report loaded and nothing to reposition
        if (!this.preview_el) return;

        var designer_height = this.designer_el.height(),
            $preview_container = this.designer_el.find(".preview");

        var $toolbar = $preview_container.closest(".jsr-designer-right").find(".jsr-toolbar-docked:visible"),
            toolbarHeight = ($toolbar.length > 0 ? $toolbar.outerHeight() : 0);

        var allToolbarsHeight = this.designer_el.find(".palette").outerHeight();
        if ($toolbar.length > 0) {
            allToolbarsHeight = Math.max(allToolbarsHeight, $toolbar.position().top + toolbarHeight);
        }
        const origHeight = $preview_container.height();
        const origScrollTop = this.lastAutoScroll || $preview_container.scrollTop();
        const newHeight = designer_height 
            - this.designer_el.find(".jsr-designer-toolbar").outerHeight() 
            - allToolbarsHeight
            - 20; // padding
        $preview_container.height(newHeight);

        if (this.toolbarPosition === "top") {
            $preview_container.css("top", allToolbarsHeight);
            // Offset scroll position to keep contents from moving around
            const newScroll = origScrollTop + (origHeight - newHeight);
            $preview_container.scrollTop(newScroll);
            this.lastAutoScroll = (newScroll < 0 ? newScroll : 0);
        } else if (this.toolbarPosition === "bottom") {
            $preview_container.css("top", toolbarHeight);
        }

        var preview_width = this.preview_el.width(),
            units = this.report_def.page.units,
            paper_width = this.report_def.page.paper_size[units][0],
            pixels_per_unit = (preview_width / paper_width),
            paper_height_px = this.report_def.page.paper_size[units][1] * pixels_per_unit;
        // Show one full page height, or the template height if greater
        const templateHeightInUnits = this.getAllSections().reduce((height, section) => height + (Number(section.def.height) || 0), 0);
        const templateHeightPx = templateHeightInUnits * pixels_per_unit;
        this.preview_el.height(Math.max(paper_height_px, templateHeightPx));
        const gridSizeUnits = (units === 'mm' ? this.gridSizeMm : this.gridSizeInches);
        this.gridSize = gridSizeUnits * pixels_per_unit; //Math.round(gridSizeUnits * pixels_per_unit);
        // Reset grid size
        this.setGridVisible(this.gridVisible || false);
    },
    
    auto_save: function() {
        try {
            var defstr = JSON.stringify(this.report_def);
            localStorage.setItem(this.auto_save_key, defstr);
        } catch(e) {
            if (console && console.warn) {
                console.warn(e);
            }
        }
    },
    
    load_data_source_schemas: function(dataSourceDefs) {
        var me = this;
        if (!this.data_source_schemas) {
            this.data_source_schemas = {};
        }
        // Don't load actual data unless we might need to render the report
        var schemasOnly = !this.showDownloadButton || this.jasperMode;
        jsreports.data.loadDatasets(dataSourceDefs, {}, this.data_source_schemas, schemasOnly, function() {
            $(me).trigger("all_schemas_loaded");
        });
    },

    show_fpopup: function() {
        if (!this.$fpopup) {
            this.$fpopupmask = $("<div></div>");
            this.$fpopup = $('<div><div><img src="http://www.jsreports.com/images/jsreports-logo.png" /></div>Thanks for using the jsreports trial!  Are there any features you\'d like to see added to jsreports? <div style="margin: 10px 0"><textarea placeholder="Yes, I\'d like..."></textarea></div><div style="margin: 10px 0"><button class="jsf-ok">Let us know</button><button class="jsf-cancel" style="margin-left: 10px">Nope, it\'s perfect</button></div></div>');
            this.$fpopup.find("button.jsf-ok").on("click", function() {
                this.$fpopup.hide();
                this.$fpopupmask.hide();
            }.bind(this));
            this.$fpopup.find("button.jsf-cancel").on("click", function() {
                this.$fpopup.hide();
                this.$fpopupmask.hide();
            }.bind(this));
            this.$fpopup.find("textarea").css({
                "width": "100%",
                "height": "60"
            });
            this.$fpopup.css({
                "position": "absolute",
                "width": "300px",
                "top": "200px",
                "left": "50%",
                "margin-left": "-150px",
                "padding": "15px",
                "background": "#fafafa",
                "box-shadow": "0 2px 40px rgba(0,0,0,0.2)",
                "z-index": "150000",
                "filter": "none",
                "-webkit-filter": "none",
                "border-radius": "4px"
            });
            this.$fpopupmask.css({
                "position": "absolute",
                "top": "0",
                "left": "0",
                "right": "0",
                "bottom": "0",
                "background": "rgba(0,0,0,0.5)",
                "z-index": "149999"
            });
            $(document.body).append(this.$fpopupmask);
            $(document.body).append(this.$fpopup);
        }
    },
    
    /** 
     * @private
     * Called only once at first creation; does initial render and loads report def 
     */
    init: function() {
        this.next_element_id = 0;
        this.pending_timeouts = {};
        this.elementToolbars = {};

        this.elementTypes = {
            text: { name: 'Text' },
            chart: { name: 'Chart' },
            image: { name: 'Picture' },
            box: { name: 'Box' },
            barcode: { name: 'Barcode' },
            break: { name: 'Page Break' },
            subreport: { name: 'Subreport' }
        };

        _.values(jsreports.elements).concat(this.customElements).forEach(elementClass => {
            if (typeof elementClass !== 'function') return;
            const className = elementClass.name;
            this.elementTypes[(elementClass.typeId || className).toLowerCase()] = {
                name: elementClass.displayName || className,
                handler: elementClass,
                iconSrc: elementClass.iconSrc || unknownElementIcon
            };
        });

        $(this).on("all_schemas_loaded", function() {
            var $container;
            if (this.embedded) {
                $container = $(this.container);
            } else {
                $container = $('<div class="jsr-designer-container"></div>');
                this.$body_mask = $('<div class="jsr-designer-mask"></div>');
                $(document.body).append(this.$body_mask);
                $(document.body).append($container);
                $("body").addClass("jsr-designer-active");
            }
            var def = this.report_def;
            delete this.report_def;
            this.render($container[0]);
            this.setReport(def);
            if (!this.embedded) {
                const $designer = $container.find(".jsreports-designer");
                $designer.addClass('before-fadein');
                this.$body_mask.fadeIn();
                this.$body_mask.css("opacity", "1");
                $designer.removeClass('before-fadein');
            }
        }.bind(this));
        this.load_data_source_schemas(this.data_sources);
    },

    /** 
     * @public
     * Change the active report definition in the designer.  Does not confirm; immediately overwrites any existing report in the designer.
     */
    setReport: function(reportDef) {
        // fill in any required defaults that might be missing from the report def
        this.auto_save_key = null;
        this.report_def = reportDef;
        this.reportStack = null;
        if (this.report_def) {
            this.auto_save_key = "jsr-temp-" + (this.report_def.id || "unsaved");
            if (!this.report_def['page']) {
                this.report_def['page'] = {};
            }
            if (!this.report_def['page']['units']) {
                this.report_def['page']['units'] = "inches";
            }
            if (!this.report_def['page']['paper_size']) {
                this.report_def['page']['paper_size'] = this.paper_sizes["letter"];
                this.report_def['page']['paper_size'].id = "letter";
            }
            if (!this.report_def['page']['margins']) {
                this.report_def['page']['margins'] = this.default_margins[this.report_def['page']['units']];
            }
            if (!this.report_def.filters) {
                this.report_def.filters = [];
            }
            this.getAllSections(null, false).forEach(sec => {
                this.fit_section(sec.def);
            });
            if (jsreports.version_less_than(this.report_def.version, "1.2.9")) {
                this.getAllSections(null, false).forEach(function(section) {
                    if (section.def.height) {
                        section.def.height *= PRE_1_2_9_Y_SCALE_FACTOR;
                    }
                });
                this.getAllElementDefs().forEach(function(elt) {
                    elt.top *= PRE_1_2_9_Y_SCALE_FACTOR;
                    elt.height *= PRE_1_2_9_Y_SCALE_FACTOR;
                });
            }
        }
        this.originalReportStr = this.getReportStrWithoutVersion(this.report_def);
        if (this.designer_el) {
            if (this.downloadButton) {
                this.downloadButton.prop('disabled', !this.report_def);
            }
            this.designer_el.find(".save-button").prop('disabled', !this.report_def);
            this.applyStylesheet(this.report_def.stylesheet);
            this.renderContent();
        }
    },

    /** 
     * @public
     * @returns {Object} The current active report definition object, possibly unsaved, possibly null if none loaded 
     */
    getReport: function() {
        if (this.report_def) {
            this.report_def.version = this.version;
        }
        return this.report_def || null;
    },

    /** 
     * @public
     * @returns {Object} The current Jasper report definition object when in Jasper mode 
     */
    getJasperReport: function() {
        return this.jasperDef || null;
    },

    applyStylesheet: function(stylesheet) {
        if (this.currentStylesheetDomEl) {
            this.currentStylesheetDomEl.remove();
        }
        if (!stylesheet) return;
        var style = document.createElement('style');
        style.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(style);
        Object.keys(stylesheet).forEach(name => {
            const rules = stylesheet[name];
            if (rules.length === 0) return;
            const rulesText = rules.map(rule => `${rule[0]}: ${rule[1]};`).join(' ');
            if (!(style.sheet || {}).insertRule) {
                (style.styleSheet || style.sheet).addRule(`.${name}`, rulesText);
            } else {
                style.sheet.insertRule(`.${name} { ${rulesText} }`, 0);
            }
        });
        this.currentStylesheetDomEl = style;
    }

};

$.extend(jsreports.Designer.prototype, privateApi);

};
