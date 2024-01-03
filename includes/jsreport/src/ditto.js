/*
 * jsreports 1.4.129-beta1
 * Copyright (c) 2018 jsreports
 * http://jsreports.com
 */
/** 
 * @name ditto
 * @namespace
 */
var ditto = require('./ditto-base');
import { PropTypes } from './elements/ReportElement';
import 'babel-regenerator-runtime';
import { renderBarcode } from './utils/barcodeUtils';

module.exports = function(window, saveAs, $) {

ditto.window = window;

var moment = require('moment');
var dimple = require('dimple-js/dist/dimple.latest.js');
var Parser = require('../lib/parser').Parser;
require('../lib/bootstrap-dropdown')($);
var SSF = require('ssf');
var accounting = require('accounting');
var jsep = require('../lib/jsep');
var jsPDF = require('../lib/jspdf.debug.js')(window, saveAs, ditto);
require('../lib/jspdf.plugin.autoprint.js')(jsPDF);
require('./jspdf.plugin.from_html.js')(jsPDF, $, ditto);
require('../lib/canvg-rgbcolor.js')(window);
require('../lib/canvg.js')(window);
var ExcelBuilder = require('../lib/excel-builder.js');
var ExcelDrawings = require('../lib/Excel/Drawings');
var ExcelDrawingsPicture = require('../lib/Excel/Drawings/Picture');
var ExcelPositioning = require('../lib/Excel/Positioning');
ditto.key = require('../lib/keymaster.js')(window);
var QRCode = require('../lib/QRCode.js')(window);
var Papa = require('papaparse');
var textFit = require('../lib/textfit.js');
var Downloadify = require('../lib/downloadify.min.js')(window);
var _ = require('underscore');
var showdown = require('showdown');
require('../lib/select2.full.js')($);

var customFonts = {};
var extraFontReferences = {};
var viewerId = 0;
var DEFAULT_CHART_ANIMATION_MS = 2000;
const DEFAULT_DATE_PARSE_FORMAT = 'YYYY-MM-DD';

const AGGREGATE_NAMES = ['sum', 'average', 'min', 'max', 'count', 'median', 'countdistinct', 'sumdistinct'];
const AGGREGATE_REGEX = new RegExp(`^(${AGGREGATE_NAMES.join('|')})\\((.*)\\)$`, 'i');
const UNQUOTED_AGGREGATE_FIELDNAME_REGEX = new RegExp(`(${AGGREGATE_NAMES.join('|')})\\((\\w*)\\)`, 'gi');

const productName = /*PRODUCT_NAME ||*/ 'jsreports';

const isIE = navigator.userAgent.indexOf('MSIE') !== -1 || !!document.documentMode;
const isEdge =!isIE && !!window.StyleMedia;

function requireOneOf(val, options, paramDesc) {
    if (options.indexOf(val) < 0) {
        throw new Error(paramDesc + ' must be one of: ', options.map(function(opt) { 
            return '"' + opt + '"'; 
        }).join(', '));
    }
}

function inferLibraryPath() {
    var path = $('script[src*=ditto]').attr('src');
    if (path) {
        path = path.replace(/ditto[^\/]+$/gi, '');
        if (path.length > 0 && path.substr(path.length - 1, 1) === '/') {
            path = path.substr(0, path.length - 1);
        }
    }
    return path;
}

/**
 * @property libraryPath
 * @memberof ditto
 * @public
 * The path to the ditto distribution on the server.  ditto uses this path to locate the /media and /fonts directories
 * when needed.  ditto can function without a valid libraryPath, but some features will not be available, such as the default
 * Roboto font in PDF output and IE9 file download support.
 */
ditto.libraryPath = inferLibraryPath();

function registerDefaultFonts() {
    ditto.registerFont('Roboto', ditto.libraryPath + '/fonts/Roboto-Regular.ttf');
    ditto.registerFont('Roboto', 'bold', ditto.libraryPath + '/fonts/Roboto-Bold.ttf');
    ditto.registerFont('Roboto', 'normal', 'italic', ditto.libraryPath + '/fonts/Roboto-Italic.ttf');
    ditto.registerFont('Roboto', 'bold', 'italic', ditto.libraryPath + '/fonts/Roboto-BoldItalic.ttf');
}

ditto.data = (function() {

    function some(arr, fn) {
        for (var i = 0; i < arr.length; i++) {
            if (fn(arr[i])) {
                return true;
            }
        }
        return false;
    }

    function assign(target) {
        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
            var nextSource = arguments[i];
            if (nextSource === undefined || nextSource === null) {
              continue;
            }
            nextSource = Object(nextSource);
            var keysArray = Object.keys(Object(nextSource));
            for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
              var nextKey = keysArray[nextIndex];
              var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
              if (desc !== undefined && desc.enumerable) {
                to[nextKey] = nextSource[nextKey];
              }
            }
        }
        return to;
    }

    function baseCompareAscending(value, other) {
        if (value !== other) {
          var valIsNull = value === null,
              valIsUndef = value === undefined,
              valIsReflexive = value === value;

          var othIsNull = other === null,
              othIsUndef = other === undefined,
              othIsReflexive = other === other;

          if ((value > other && !othIsNull) || !valIsReflexive ||
              (valIsNull && !othIsUndef && othIsReflexive) ||
              (valIsUndef && othIsReflexive)) {
            return 1;
          }
          if ((value < other && !valIsNull) || !othIsReflexive ||
              (othIsNull && !valIsUndef && valIsReflexive) ||
              (othIsUndef && valIsReflexive)) {
            return -1;
          }
        }
        return 0;
    }

    var sortBy = function(arr, accessor) {
        arr.sort(function(a, b) {
            return baseCompareAscending(accessor(a), accessor(b));
        });
        return arr;
    };

    var yieldRightSubList = function(sortedList, accessor) {
        var r,
            datum,
            val,
            tmpVal,
            i;
        if (sortedList.length > 0) {
            val = accessor(datum = sortedList.pop());
            r = [datum];
            i = sortedList.length;
            while (i--) {
                tmpVal = accessor(sortedList[i]);
                if (val <= tmpVal && val >= tmpVal) {
                    r.unshift(sortedList.pop());
                } else {
                    break;
                }
            }
        }
        return r ? {r: r, val: val} : r;
    };

    /**
     * From a sorted list, yield a subList where the accessor values are the same.
     * @param  {Array<Object>} sortedList
     * @param  {AccessorFunction} accessor
     * @yield  {SubList}
     * @returns {undefined}
     */
    const yieldRightSubList2 = function* (sortedList, accessor) {
        if (sortedList.length === 1) {
            yield {r: sortedList, val: accessor(sortedList[sortedList.length - 1])};
        } else if (sortedList.length > 1) {
            let i = sortedList.length,
                r = [sortedList[--i]],
                val = accessor(r[0]);
            // for each subsequent value, we'll yield when there is a
            // new tmpVal that is not equal the current val
            while (i--) {
                const tmpVal = accessor(sortedList[i]);
                if (val <= tmpVal && val >= tmpVal) {
                    r.unshift(sortedList[i]);
                } else {
                    yield {r, val};
                    r = [sortedList[i]];
                    val = tmpVal;
                }
            }
            yield {r, val};
        }
    }

    function reduceRight(array, iteratee, accumulator, initFromArray) {
        var length = array.length;
        if (initFromArray && length) {
          accumulator = array[--length];
        }
        while (length--) {
          accumulator = iteratee(accumulator, array[length], length, array);
        }
        return accumulator;
    }

    /**
     * Merge two lists into one
     * @param {Array<Object>} aDatumsR
     * @param {Array<Object>} bDatumsR
     * @returns {Array<Object>}
     */
    function mergeLists2 (aDatumsR, bDatumsR) {
        return reduceRight(aDatumsR, (previous, datum) =>
            reduceRight(bDatumsR, (prev, cDatum) => {
                prev.unshift(assign({}, datum, cDatum));
                return prev;
            }, []).concat(previous), []);
    }    

    const sortedMergeLeftOuterJoin = (a, aAccessor, b, bAccessor) => {
        if (a.length < 1 || b.length < 1) {
            return a;
        }
        const aSorted = sortBy(a, aAccessor),
            bSorted = sortBy(b, bAccessor),
            aGenerator = yieldRightSubList2(aSorted, aAccessor),
            bGenerator = yieldRightSubList2(bSorted, bAccessor);
        let r = [],
            aDatums = aGenerator.next().value,
            bDatums = bGenerator.next().value;
        while (aDatums && bDatums) {
            if (aDatums.val > bDatums.val) {
                r = aDatums.r.concat(r);
                aDatums = aGenerator.next().value;
            } else if (aDatums.val < bDatums.val) {
                bDatums = bGenerator.next().value;
            } else {
                r = mergeLists2(aDatums.r, bDatums.r).concat(r);
                aDatums = aGenerator.next().value;
                bDatums = bGenerator.next().value;
            }
        }
        while (aDatums) {
            r = aDatums.r.concat(r);
            aDatums = aGenerator.next().value;
        }
        return r;
    }    

    // var sortedMergeLeftOuterJoin = function (a, aAccessor, b, bAccessor) {
    //     if (a.length < 1 || b.length < 1) {
    //         return [];
    //     }
    //     var rreduce = Array.reduceRight ? function(array, iteratee, acc) {
    //         return array.reduceRight(iteratee, acc);
    //     } : reduceRight;
    //     var assign = Object.assign || assign;
    //     a = sortBy(a, aAccessor);
    //     b = sortBy(b, bAccessor);
    //     var r = [],
    //         aDatums = yieldRightSubList(a, aAccessor),
    //         bDatums = yieldRightSubList(b, bAccessor);
    //     while (aDatums && bDatums) {
    //         if (aDatums.val > bDatums.val) {
    //             r = aDatums.r.concat(r);
    //             aDatums = yieldRightSubList(a, aAccessor);
    //         } else if (aDatums.val < bDatums.val) {
    //             bDatums = yieldRightSubList(b, bAccessor);
    //         } else {
    //             r = rreduce(aDatums.r, function (orevious, datum) {
    //                 return rreduce(bDatums.r, function (prev, cDatum) {
    //                     prev.unshift(assign({}, datum, cDatum));
    //                     return prev;
    //                 }, []).concat(orevious);
    //             }, []).concat(r);
    //             aDatums = yieldRightSubList(a, aAccessor);
    //             bDatums = yieldRightSubList(b, bAccessor);
    //         }
    //     }
    //     if (aDatums) {
    //         r = aDatums.r.concat(r);
    //     }
    //     return a.concat(r);
    // };

    // const simpleLeftJoin = (left, leftKey, right, rightKey) => {
    //     let out = [];
    //     left.map(lRow => {
    //         const lkey = lRow[leftKey];
    //         const rRows = right.filter(r => r[rightKey] === lkey);
    //         if (rRows.length) {
    //             out = out.concat(rRows.map(rRow => ({ ...lRow, ...rRow })));
    //         } else {
    //             out.push({ ...lRow });
    //         }
    //     });
    //     return out;
    // }

    var sortedMergeInnerJoin = function (a, aAccessor, b, bAccessor) {
        if (a.length < 1 || b.length < 1) {
            return [];
        }
        var rreduce = Array.reduceRight ? function(array, iteratee, acc) {
            return array.reduceRight(iteratee, acc);
        } : reduceRight;
        var assign = Object.assign || assign;
        a = sortBy(a, aAccessor);
        b = sortBy(b, bAccessor);
        var r = [],
            aDatums = yieldRightSubList(a, aAccessor),
            bDatums = yieldRightSubList(b, bAccessor);
        while (aDatums && bDatums) {
            if (aDatums.val > bDatums.val) {
                aDatums = yieldRightSubList(a, aAccessor);
            } else if (aDatums.val < bDatums.val) {
                bDatums = yieldRightSubList(b, bAccessor);
            } else {
                r = rreduce(aDatums.r, function (orevious, datum) {
                    return rreduce(bDatums.r, function (prev, cDatum) {
                        prev.unshift(assign({}, datum, cDatum));
                        return prev;
                    }, []).concat(orevious);
                }, []).concat(r);
                aDatums = yieldRightSubList(a, aAccessor);
                bDatums = yieldRightSubList(b, bAccessor);
            }
        }
        return r;
    };

    var extTypes = {
        'auto': 'text',
        'string': 'text',
        'int': 'number',
        'float': 'number',
        'boolean': 'boolean',
        'date': 'date'
    };
    
    const getFieldTypeFromValue = (val) => {
        return (typeof val).toLowerCase();
    };

    /* Fills knownFields array with list of fields found on record */
    const inferSchemaFromRecord = (record, knownFields, knownFieldsByLowercaseName) => {
        Object.keys(record).forEach(fieldName => {
            const fieldNameLower = fieldName.toLowerCase();
            const val = record[fieldName];
            const valueType = getFieldTypeFromValue(val);
            let field = knownFieldsByLowercaseName[fieldNameLower];
            if (field) {
                if (!!field.type && (valueType !== field.type)) {
                    console.warn(`Warning: Expected ${field.type} value for field "${fieldName}", got ${valueType} instead: ${val}`);
                }
            } else {
                field = {
                    name: fieldName,
                    type: valueType
                };
                knownFields.push(field);
                knownFieldsByLowercaseName[fieldNameLower] = field;
            }
            switch (field.type) {
                case 'object':
                    /* falls through */
                case 'array':
                    if (val) {
                        field.schema = Object.assign(field.schema || {}, inferSchema(Array.isArray(val) ? val : [ val ]));
                    }
                    break;
            }
        });
    };

    /** Infer basic schema info from dataset (a raw array of data rows). */
    const inferSchema = (dataset) => {
        if (!Array.isArray(dataset)) {
            console.error(`Error: Could not infer schema for dataset.  Expected array, got ${typeof dataset}.`);
            return null;
        }
        const fields = [];
        const fieldLookup = {};
        dataset.forEach(rec => inferSchemaFromRecord(rec, fields, fieldLookup));
        return {
            fields: fields
        };
    };

    return ({

        inferSchema: inferSchema,

    /** 
     * Build a hash index into a dataset (for use in linking subreports)
     * @private
     */
    buildIndexOn: function(dataset, fieldId) {
        var index = {};
        for (var i = 0, len = dataset.length; i < len; i++) {
            var row = dataset[i];
            var key = row[fieldId];
            var bucket = index[key];
            if (!bucket) {
                index[key] = bucket = [];
            }
            bucket[bucket.length] = row;
        }
        return index;
    },

    loadDatasets: function(datasetDefs, datasets, schemas, schemasOnly, done) {
        const timeout = ditto.dataSourceTimeout !== undefined ? ditto.dataSourceTimeout : 30;

        const runPostProcess = (fn, origData, requiredDatasets, dsDef) => {
            try {
                if (requiredDatasets) {
                    return fn.apply(dsDef, requiredDatasets);
                } else {
                    return fn(origData, dsDef);
                }
            } catch(e) {
                e.message = `Error while executing postProcess function for data source "${dsDef.id}":\n ${e.message}`;
                throw e;
            }
            throw 'Unexpected result from postProcess';
        }

        const coerceDates = (data, schema) => {
        }

        var loading = [],
            schemasLoading = 0,
            joins = [],
            withDependencies = [],
            isDone = false;
        const loaded = (def, data) => {
            if (def.format && def.format.toLowerCase() === "csv") {
                data = data.data;
            }
            if (def.postProcess) {
                data = runPostProcess(def.postProcess, data, null, def);
            }
            datasets[def.id.toLowerCase()] = data;            
            const ix = loading.indexOf(def);
            loading.splice(ix, 1);
            setTimeout(checkProgress, 0);
        }
        const tryResolveDependencies = () => {
            let resolved = 0;
            const unresolved = [];
            withDependencies.forEach(def => {
                if (!def.requires.find(dep => !datasets[dep.toLowerCase()])) {
                    let data = [];
                    if (def.postProcess) {
                        data = runPostProcess(def.postProcess, null, 
                            def.requires.map(dep => datasets[dep.toLowerCase()]), def);
                    }
                    datasets[def.id.toLowerCase()] = data;
                    resolved++;
                } else {
                    unresolved.push(def);
                }
            });
            withDependencies = unresolved;
        }
        datasetDefs.forEach(function(def) {
            if (!def.id) throw new Error('Dataset missing "id" property: ' + JSON.stringify(def));
            var idLower = def.id.toLowerCase();
            if (!datasets[idLower]) {
                if (def.join) {
                    joins.push(def);
                    return;
                }
                if (def.requires) {
                    withDependencies.push(def);
                    return;
                }
                /** Even if we only need schemas, if one is not provided we have to load the data to infer a schema */
                if (!schemasOnly || (!def.schema && !def.schema_url)) {
                    if (def.data) {
                        // "data" can be an async function that calls back with
                        // the data when done
                        if (typeof def.data === 'function') {
                            datasets[idLower] = -1;
                            loading.push(def);
                            def.data((data) => {
                                loaded(def, data);
                            });
                        } else {
                            loaded(def, def.data);
                        }
                    } else if (def.url) {
                        datasets[idLower] = -1;
                        loading.push(def);
                        if (def.format && def.format.toLowerCase() === "csv") {
                            Papa.parse(def.url, {
                                download: true,
                                header: !!def.hasHeaderRow,
                                complete: loaded.bind(this, def),
                                error: function() {
                                    console.error('Error parsing CSV');
                                }
                            });
                        } else {
                            $.getJSON(def.url, loaded.bind(this, def))
                                .fail(function(d, status, err) {
                                    throw new Error('Failed to load data source: ' + def.id 
                                        + ' from ' + def.url + '.  Error was: ' + err);
                                });
                        }
                    } else if (def.extjsStore) {
                        const store = def.extjsStore;
                        const readStore = (store) => store.getData().items.map(rec => rec.data);
                        if (store.isLoaded()) {
                            datasets[idLower] = readStore(store);
                        } else {
                            loading.push(def);
                            store.on('load', () => {
                                loaded(def, readStore(store));
                            }, this, { single: true });
                            store.load();
                        }
                    }
                }
                if (def.schema_url) {
                    schemasLoading++;
                    $.getJSON(def.schema_url, function(schema) {
                        schemas[idLower] = schema;
                        schemasLoading--;
                        checkProgress();
                    })
                    .fail(function(d, status, err) {
                        throw new Error('Failed to load schema for data source: ' + def.id 
                            + ' from ' + def.schema_url + '.  Error was: ' + err);
                    });
                } else if (def.schema) {
                    if (typeof def.schema === 'function') {
                        schemasLoading++;
                        def.schema((schema) => {
                            schemas[idLower] = schema;
                            schemasLoading--;
                            checkProgress();
                        });
                    } else {
                        schemas[idLower] = def.schema;
                    }
                } else if (def.extjsStore) {
                    var proxy = def.extjsStore.getProxy();
                    if (!proxy) {
                        throw new Error('Couldn\'t find proxy for ExtJS data store');
                    }
                    var model = proxy.getModel();
                    if (!model) {
                        throw new Error('Couldn\'t find model for ExtJS data store proxy');
                    }
                    var fields = model.getFields().map(function(field) {
                        return {
                            name: field.getName(),
                            type: extTypes[field.type]
                        };
                    });
                    schemas[idLower] = { fields: fields };
                }
            }
        });
        checkProgress();
        if (timeout > 0) {
            const startTime = new Date();
            const timeoutMs = timeout * 1000;
            const timeoutInterval = setInterval(() => {
                if (new Date() - startTime > timeoutMs) {
                    clearInterval(timeoutInterval);
                    if (loading.length === 0) return;
                    const failed = loading.map(ds => ds.id || '[missing id]').join(', ');
                    console.error(`The following data source(s) failed to load within ${timeout} seconds: ${failed}`);
                }
            }, 1000);
        }
        function checkProgress() {
            if (isDone) return;
            if (loading.length === 0 && schemasLoading === 0) {
                tryResolveDependencies();
                Object.keys(datasets).forEach(dsIdLower => {
                    const data = datasets[dsIdLower];
                    // Wrap single root objects in array
                    if (typeof data === 'object' && !Array.isArray(data)) {
                        datasets[dsIdLower] = [ data ];
                    }
                    if (!schemas[dsIdLower]) {
                        schemas[dsIdLower] = inferSchema(datasets[dsIdLower]);
                    }
                });
                processJoins(() => {
                    // One more pass to resolve dependencies on joined datasets
                    tryResolveDependencies();
                    if (withDependencies.length > 0) {
                        console.error(`Error: the following data sources have unresolved dependencies: ${withDependencies.map(ds => ds.id).join(', ')}`);
                    }
                    isDone = true;
                    done();
                });
            }
        }
        function processJoins(callback) {
            if (!joins || joins.length === 0) return callback();
            joins.sort((a, b) => (a.joinOrder || 0) - (b.joinOrder || 0));
            joins.forEach(function(dsDef) {
                var joinDef = dsDef.join;
                ['left', 'right', 'leftKey', 'rightKey'].forEach(function(requiredProp) {
                    if (!joinDef[requiredProp]) {
                        throw new Error("Joined data source " + dsDef.id + " missing required property: " 
                            + requiredProp);
                    }
                });
                var algo = 
                    (joinDef.type === "left" ? sortedMergeLeftOuterJoin 
                        : sortedMergeInnerJoin),
                    left = (datasets[joinDef.left] || []).slice(0),
                    right = (datasets[joinDef.right] || []).slice(0),
                    leftKey = joinDef.leftKey,
                    rightKey = joinDef.rightKey,
                    leftAccessor = function(row) {
                        return row[leftKey] || null;
                    },
                    rightAccessor = function(row) {
                        return row[rightKey] || null;
                    };
                function requireField(targetDsID, fieldName, thisDs) {
                    if (!_.some(schemas[targetDsID.toLowerCase()].fields, function(field) {
                        return (field.name === fieldName);
                    })) {
                        throw new Error("Data source " + targetDsID + " does not have field " + fieldName 
                            + " required by join data source " + thisDs.id);
                    }
                }
                requireField(joinDef.left, leftKey, dsDef);
                requireField(joinDef.right, rightKey, dsDef);
                var newSchema = {
                    fields: $.extend([], schemas[joinDef.left].fields)
                };
                schemas[dsDef.id.toLowerCase()] = newSchema;
                var leftFields = {};
                newSchema.fields.forEach(function(field, index) {
                    leftFields[field.name.toLowerCase()] = index;
                });
                schemas[joinDef.right.toLowerCase()].fields.forEach(function(rightField) {
                    var index = leftFields[rightField.name.toLowerCase()];
                    if (typeof index !== "undefined") {
                        newSchema.fields.splice(index, 1);
                    }
                    newSchema.fields.push($.extend({}, rightField));
                });
                if (!schemasOnly) {
                    let data = algo(left, leftAccessor, right, rightAccessor);
                    if (dsDef.postProcess) {
                        data = runPostProcess(dsDef.postProcess, data, null, dsDef);
                    }
                    datasets[dsDef.id.toLowerCase()] = data;
                }
            });
            callback();
        }
    }

    });
}());

ditto.merge(ditto, (function() {

    var BATCH_RENDER_INTERVAL_MS = 250,
        BATCH_RENDER_MIN_ROWS = 5,
        EXPORT_FORMATS = {
            "pdf": {
                defaultExtension: "pdf"
            },
            "xlsx": {
                defaultExtension: "xlsx"
            }
        },
        DEFAULT_DATE_FORMAT = "m/d/yyyy",
        EXCEL_WIDTH_UNITS_PER_PX = 0.18,
        EXCEL_ROW_HEIGHT_MULTIPLIER = 6;
    var EXCEL_RESOLUTION_PX = 10;
    
    var datasets = {},
        schemas = {},
        indices = {},
        $events = $({});
    
    function clear_datasets() {
        datasets = {};
        schemas = {};
        indices = {};
    }
    var nextSectionInstanceId = 1;

    var printError = (typeof console.error === 'function' ? console.error.bind(console) : (function(){}));
    let warn = (typeof console.warn === 'function' ? console.warn.bind(console) : (function(){}));
    if (/PhantomJS/.test(window.navigator.userAgent)) {
        printError = warn = console.log.bind(console);
    }

    // placeholder translation fn
    var t = function(s, data) {
        return s.replace(/\{(\w*)\}/gi, function(match, g1) {
            return data[g1] || '';
        });
    };

    var jsepEval = (function() {
        var binops = {
            "+": function(a, b) { return a + b; },
            "-": function(a, b) { return a - b; },
            "*": function(a, b) { return a * b; },
            "/": function(a, b) { return a / b; },
            "%": function(a, b) { return a % b; }
        };
        var unops = {
            "-": function(a) { return -a; },
            "+": function(a) { return +a; },
            "!": function(a) { return !a; }
        };

        var do_eval = function(node, ctx) {
            switch (node.type) {
                case "BinaryExpression":
                    return binops[node.operator](do_eval(node.left, ctx), do_eval(node.right, ctx));
                case "UnaryExpression":
                    return unops[node.operator](do_eval(node.argument, ctx));
                case 'Identifier':
                    return ctx[node.name];
                case "Literal":
                    return node.value;
            }
        };

        var jsepCache = {};

        return function(expr, ctx) {
            var cached = jsepCache[expr];
            if (!cached) {
                cached = jsepCache[expr] = jsep(expr);
            }
            return do_eval(cached, ctx);
        };
    })();

    /**
     * Initial render only
     */
    function render_report(def, $target, forceHideToolbar) {
        this.$target = $target;
        var target = $target[0];
        if (!this.isSubreport) {
            nextSectionInstanceId = 1;
            this.allSubreportViewers = [];
            if ($target.css('position') !== "absolute") {
                target.style.position = 'relative';
            }
            this.targetWidth = $target.width();
            this.rowStack = [];
        }
        target.innerHTML = '';
        this.$target.addClass("jsr-report jsr-style-root");
        // if (!this.$target.hasClass("jsr-export-target")) {
        //  this.$target.css("overflow", "auto");
        // }
        // If using ditto to render across windows, point to the target window
        var targetDoc = $target[0].ownerDocument;
        var targetWin = targetDoc.defaultView || targetDoc.parentWindow;
        if (ditto.window !== targetWin) {
            ditto.window = targetWin;
        }

        this.elementTypes = {};
        /** Get map of custom element types for lookup by ID */
        _.values(ditto.elements).concat(this.customElements).forEach(elementClass => {
            if (typeof elementClass !== 'function') return;
            const className = elementClass.name;
            this.elementTypes[(elementClass.typeId || className).toLowerCase()] = elementClass;
        });

        this.def = def;
        this.parser = new Parser();
        this.compiled_calculations = {};
        this.compiled_js_expressions = {};
        // this.pending_height_adjustments = [];
        this.pending_text_fits = [];
        this.linked_data_index_cache = {};
        this.elt_id_counter = 1;
        this.excel_styles_by_elt_id = {};
        if (typeof(this.imageUrlPrefix) === "undefined") {
            this.imageUrlPrefix = this.def.imageUrlPrefix || "";
        }
        if (this.showToolbar && !forceHideToolbar) {
            this.$toolbar_el = $('<div class="ditto-report-toolbar"></div>');
            $target.append(this.$toolbar_el);
            render_inputs.call(this, def, this.$toolbar_el);
            $events.trigger("toolbarRendered", [ this, this.$toolbar_el[0] ]);
        }
        const details = Array.isArray(def.body) ? def.body : [ def.body ];
        var dsIdLower = (details[0].data_source || '').toLowerCase();
        this.active_schema = getDetailSchema.call(this, details[0]);
        var reportData = datasets[dsIdLower];
        details.forEach(detail => {
            const detailDataId = (detail.data_source || '').toLowerCase();
            const detailData = datasets[detailDataId];
            if (typeof(detailData) === "undefined" || !detailData) {
                throw new Error(`Missing dataset with ID "${detailDataId}" required by report`);
            }
        });
        this.detail_sort_fn = get_detail_sort_fn.call(this, def, reportData, this.active_schema);
        this.show_detail = def.body.show_detail !== false;
        if (!this.isSubreport) {
            this.$target.append($('<div class="jsr-content-viewport"><div class="ditto-report-content"></div></div>'));
            var toolbar_height = (this.showToolbar && !forceHideToolbar ? this.$target.find(".ditto-report-toolbar").outerHeight() : 0);
            this.$target.find(".jsr-content-viewport")
                .height(this.$target.height() - toolbar_height)
                .css("top", toolbar_height + "px");
        }
        if (def.defaultFont) {
            const defaultFontCss = def.defaultFont.css || def.defaultFont;
            this.$target.css(`font-family`, defaultFontCss);
        }
        if (def.defaultFontSize !== undefined) {
            const fontSize = Number(def.defaultFontSize);
            if (!isNaN(fontSize)) {
                this.$target.css(`font-size`, `${fontSize}pt`);
            }
        }
        refresh_report.call(this);
    }

    function getDetailSchema(dataSection) {
        let schema = schemas[(dataSection.data_source || '').toLowerCase()];
        if (dataSection.sublevels) {
            dataSection.sublevels.forEach(sublevel => {
                if (sublevel.data_source !== '__parentgroup') {
                    schema = schemas[sublevel.data_source.toLowerCase()];
                }
            });
        }
        return schema;
    }

    function generate_section_instance_id() {
        return nextSectionInstanceId++;
    }

    function get_excel_blob(workbook) {
        return new Blob([ ExcelBuilder.createFile(workbook, { type: "arraybuffer" }) ], 
            { type : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    }

    function get_excel_data_uri(workbook) {
        return 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' 
            + ExcelBuilder.createFile(workbook);
    }

    /** Opens the given data URI in a new browser tab/window, or the current one if that's not supported (IE) */
    function open_data_uri(data_uri) {
        var win = ditto.window.open(data_uri);
        if (win || typeof safari === "undefined") return win;
        ditto.window.document.location.href = data_uri;
    }

    function download_excel_file(workbook, filename) {
        if (navigator && navigator.getUserMedia) {
            if (ditto.window.URL === undefined || ditto.window.URL.createObjectURL === undefined) {
                return open_data_uri(get_excel_data_uri(workbook));
            }
        }
        saveAs(get_excel_blob(workbook), filename);
        if (typeof saveAs.unload === 'function') {
            if (ditto.window.setTimeout) {
                ditto.window.setTimeout(saveAs.unload, 911);
            }
        }
    }
    
    function refresh_report() {
        delete this.fontScaleFactor;
        if (!this.isSubreport) {
            show_mask.call(this);
        }
        ditto.window.setTimeout(refresh_report_internal.bind(this), 0);
    }

    /**
     * Expand the target element width as needed to fit generated pivot columns
     */
    function adjust_template_for_target(data) {
        if (this.def.body.pivot_enabled && this.def.body.pivot_expression) {
            // var $content_div = this.$target.find(".ditto-report-content");
            var default_width = this.targetWidth || this.contentDomEl.offsetWidth;
            this.pivot = true;
            var simple_pivot_field = get_schema_field_from_single_field_expression.call(this, this.def.body.pivot_expression);
            if (simple_pivot_field) {
                this.pivot_field_name = simple_pivot_field.name;
            }
            this.pivot_cols = extract_pivot_columns.call(this,
                data, 
                this.def.body.pivot_expression, 
                this.def.body.pivot_column_bucket_type, 
                this.def.body.pivot_column_sort_by
            );
            var reserved_width_px = (this.def.body.pivot_area_right ? (this.def.body.pivot_area_right - this.def.body.pivot_column_right) : 0)
                * this.pixels_per_unit; 
            this.pivot_column_width = (Number(this.def.body.pivot_column_right) - Number(this.def.body.pivot_column_left)) * this.pixels_per_unit;
            var new_width = default_width + (this.pivot_column_width * (this.pivot_cols.length - 1)) - reserved_width_px;
            this.contentDomEl.style.width = new_width + 'px';
            // Have to re-compute percentage/pixels now, because otherwise elements with an existing % width
            // would stretch due to the new parent width.  Elements should stay the same pixel size, thereby
            // getting a smaller percentage of the expanded parent width
            this.pct_per_px = 100 / new_width;
            // Remember the width increase ratio for later use by PDF renderer
            this.pivot_width_expansion_ratio = Math.max(1, new_width / default_width);
        } else {
            this.pivot = false;
        }
        convert_horizontal_units.call(this);
    }

    function getOrCreateIndex(dsId, fieldName) {
        var dsIdLower = dsId.toLowerCase();
        var key = dsIdLower + '/' + fieldName;
        var index = indices[key];
        if (!index) {
            var dataset = datasets[dsIdLower];
            indices[key] = index = ditto.data.buildIndexOn(dataset, fieldName);
        }
        return index;
    }

    function refresh_report_internal() {
        var me = this;
        ditto.totalRefreshCount = (ditto.totalRefreshCount || 0) + 1;
        var htmlDocument = ditto.window.document;
        if (this.render_timeout) {
            ditto.window.clearTimeout(me.render_timeout);
        }
        var $content_div;
        if (this.isSubreport) {
            $content_div = this.$target;
        } else {
            this.current_input_values = capture_input_values.call(this);
            $content_div = this.$target.find(".ditto-report-content");
            this.isDetachedRender = true;
            this.detachedContentDiv = $content_div;
            $content_div.detach();
        }
        // var $content_div = this.$target.find(".ditto-report-content");
        var contentDomEl = $content_div[0];
        this.contentDomEl = contentDomEl;
        var default_width = this.targetWidth || contentDomEl.offsetWidth;
        if (!this.isSubreport) {
            contentDomEl.style.width = 'auto';
            contentDomEl.innerHTML = '';
        }
        compute_margins_px.call(this, default_width);
        var filters = JSON.parse(JSON.stringify(this.def.filters || []));

        const details = Array.isArray(this.def.body) ? this.def.body : [ this.def.body ];

        var firstDetailDsId = (details[0].data_source || '').toLowerCase();
        var data = datasets[firstDetailDsId];
        if (this.subreportFilter) {
            // Always index when rendering into a linked subreport
            var index = getOrCreateIndex(firstDetailDsId, this.subreportFilter.field);
            data = index[this.subreportFilter.operand] || [];
        }
        data = apply_filters.call(this, filters, data);
        if (this.active_schema) {
            var dateFields = [];
            this.active_schema.fields.filter(function(field) {
                if (field.type === 'date') {
                    dateFields.push(field);
                }
            });
            if (dateFields.length > 0) {
                var dateVal, dateFieldSchema;
                for (var i = 0; i < data.length; i++) {
                    var row = data[i];
                    for (var j = 0; j < dateFields.length; j++) {
                        var dateFieldSchema = dateFields[j];
                        dateVal = row[dateFields.name];
                        if (dateVal && typeof dateVal === 'string') {
                            dateVal = moment(dateVal, dateFieldSchema.format || DEFAULT_DATE_FORMAT);
                            row[dateFields.name] = dateVal;
                        }
                    }
                }
            }
        }
        var report_summary_row = $.extend({}, (data.length > 0 ? data[0] : {}), {
            "___children___": data
        });
        adjust_template_for_target.call(this, data);

        if (this.def.type === 'dashboard') {
            return renderDashboard.call(this, report_summary_row);
        }

        var marginTopDomEl = htmlDocument.createElement('div');
        marginTopDomEl.className = 'jsr-top-margin-placeholder';
        marginTopDomEl.style.height = this.margins_px.top + 'px';
        this.sectionOffset = this.margins_px.top;
        this.sections = [];
        contentDomEl.appendChild(marginTopDomEl);

        // Render background if any, once only in HTML mode
        if (this.def.background) {
            var $bkgd = renderSection.call(this, this.def.background, $content_div, 
                report_summary_row, false, 0);
            if ($bkgd) {
                $bkgd.addClass('jsr-page-background');
                // For now, exclude the background section from any positioning / paging
                this.sections.pop();
            }
            // Jump back to top of report to render next section
            this.sectionOffset = this.margins_px.top;
        }

        if (this.def.page_header && this.def.page_header.visible) {
            var $page_header = renderSection.call(this, this.def.page_header, $content_div, 
                report_summary_row, true, 0);
            if ($page_header) {
                $page_header.addClass("jsr-page-header");
            }
        }
        if (this.def.header && this.def.header.visible !== false) {
            renderSection.call(this, this.def.header, $content_div, report_summary_row, false, 0);
        }
        let detailIx = 0;
        let lastData = data;
        var render_iterator = render_level.call(this, this.def, details[detailIx], 0, data, $content_div);
        var renderFn = function() {
            if (render_iterator && render_iterator.hasMore()) {
                try {
                    render_iterator.renderBatch();
                } catch(e) {
                    throw e;
                }
                me.render_timeout = ditto.window.setTimeout(renderFn, 0);
                fit_text_elements.call(me);
                return;
            }
            // Done with batch (detail)
            if (detailIx < details.length - 1) {
                // More details to render - cue the next one
                const nextDetail = details[++detailIx];
                const nextDetailDsId = (nextDetail.data_source || '').toLowerCase();
                let nextDetailData = datasets[nextDetailDsId];
                if (nextDetail.filters) {
                    // console.log('applying filters to 2nd+ detail');
                    nextDetailData = apply_filters.call(this, nextDetail.filters, nextDetailData);
                }
                lastData = nextDetailData;
                render_iterator = render_level.call(me, me.def, nextDetail, 0, nextDetailData, $content_div);
                return me.render_timeout = ditto.window.setTimeout(renderFn, 0);
            }
            // Done with all details
            if (lastData !== data) {
                // If data changed (multiple details), re-do summary row for footers to use last detail's data
                report_summary_row = $.extend({}, (lastData.length > 0 ? lastData[0] : {}), {
                    "___children___": lastData
                });
            }
            if (me.def.footer && me.def.footer.visible !== false) {
                renderSection.call(me, me.def.footer, $content_div, report_summary_row, false, 0);
            }
            if (me.def.page_footer && me.def.page_footer.visible) {
                var $page_footer = renderSection.call(me, me.def.page_footer, $content_div, 
                    report_summary_row, true, 0);
                if ($page_footer) {
                    $page_footer.addClass("jsr-page-footer");
                }
            }
            fit_text_elements.call(me);
            waitForSubreports.call(me);
        };
        me.render_timeout = ditto.window.setTimeout(renderFn, 0);
    }

    function renderDashboard(summaryDataRow) {
        const els = this.def.body.elements;
        const deferredRenderList = [];
        const $viewport = this.$target.find('.jsr-content-viewport');
        const tileSpacingPx = 10;
        const tileSpacingUnits = tileSpacingPx / this.pixels_per_unit;
        const viewportWidthUnits = $viewport.width() / this.pixels_per_unit;
        const tileWidth = (viewportWidthUnits - (tileSpacingUnits * (els.length + 1))) / 5;
        const tileHeight = tileWidth / 1.6;
        let left = tileSpacingUnits;
        let top = tileSpacingUnits;
        els.forEach((el, index) => {
            el.left = 0;
            el.top = 0;
            el.width = tileWidth;
            el.height = tileHeight;
            if (el.type === 'barChartTile') {
                el.width = el.width * 2 + tileSpacingUnits;
                el.height = el.height * 2 + tileSpacingUnits;
            }
            const $tile = $('<div class="jsr-dashboard-tile jsr-tile-before-show"></div>');
            $tile.css({
                position: 'absolute',
                width: `${el.width * this.pixels_per_unit}px`,
                height: `${el.height * this.pixels_per_unit}px`,
                left: `${left * this.pixels_per_unit}px`,
                top: `${top * this.pixels_per_unit}px`,
                background: 'white'
            });
            let rendered = render_element.call(this, el, summaryDataRow, deferredRenderList);
            if (rendered) {
                if (!Array.isArray(rendered)) {
                    rendered = [ rendered ];
                }
                rendered.forEach(renderedEl => $tile.append(renderedEl.domEl));
            }
            $(this.contentDomEl).append($tile);
            left += el.width + tileSpacingUnits;
            if (index % 5 === 4) {
                top += el.height + tileSpacingUnits;
                left = tileSpacingUnits;
            }
        });
        this.detachedContentDiv.css({
            'background-color': '#eee',
            width: `${$viewport.width()}px`,
            height: `${$viewport.height()}px`
        }).addClass('jsr-dashboard');
        $viewport.append(this.detachedContentDiv);
        this.isDetachedRender = false;
        deferredRenderList.forEach(do_deferred_render.bind(this));
        renderDeferredCharts.call(this);
        on_render_complete.call(this);
        $viewport.find('.jsr-tile-before-show').each((index, el) => {
            setTimeout(() => {
                $(el).removeClass('jsr-tile-before-show');
            }, index * 100);
        });
    }

    function resize() {
        if (this.isSubreport) return;
        const $viewport = this.$target.find('.jsr-content-viewport');
        if ($viewport.length === 0) return;
        $viewport.height(this.$target.height() - parseFloat($viewport.css('top')) + 'px');
    }

    function waitForSubreports() {
        if (!this.subreportsRendering) {
            finishRender.call(this);
        } else {
            $(this).on('subreports_rendered', finishRender.bind(this));
        }
    }

    function renderDeferredCharts() {
        if (this.charts) {
            for (var i = 0; i < this.charts.length; i++) {
                // Refresh to get correct bounds now that it's visible
                const chartInfo = this.charts[i];
                const animate = (this.outputSupportsAnimation !== false && chartInfo.def.animate !== false);
                chartInfo.chart.draw(animate ? 
                    (chartInfo.def.initialAnimationMs || DEFAULT_CHART_ANIMATION_MS) : 0, false);
                wrapChartLabelText.call(this, 
                    chartInfo.$el, 
                    chartInfo.$el.data('xAxisLabelHeight'));
            }
        }
        this.charts = [];
    }

    function finishRender() {
        if (this.isSubreport) {
            on_render_complete.call(this);
            return;
        }
        var $viewport = this.$target.children('.jsr-content-viewport');
        this.viewportDomEl = $viewport[0];

        // IMPORTANT: We do a layout/measure pass here where we set all sections to position: relative
        // (via CSS) in order to measure their heights, then set them back to absolute positioning

        // const pageSections = Array.from(
        //     this.detachedContentDiv[0].querySelectorAll('.jsr-page-header,.jsr-page-footer'));
        // pageSections.forEach(printSection => {
        //     var $textEls = $(printSection).find('.jsr-text');
        //     for (var i = 0; i < $textEls.length; i++) {
        //         var $textEl = $textEls.eq(i);
        //         var text = $textEl.text();
        //         $textEl.data('jsr-text-template', text);
        //         $textEl.text(text.replace('{{JSR_PRINT_PAGE_NUMBER}}', '1')
        //             .replace('{{JSR_PRINT_PAGE_COUNT}}', '1'));
        //     }
        // });

        // Now attach in order to measure heights
        $viewport.append(this.detachedContentDiv);
        this.isDetachedRender = false;

        $(this.contentDomEl).addClass('jsr-measure-sections');

        // First do subreport moves
        var subreportMoves = [];
        var viewers = this.allSubreportViewers.concat([ this ]);
        var movecount = 0;
        for (var i = 0, len = viewers.length; i < len; i++) {
            viewer = viewers[i];
            sections = viewer.sections;
            for (var j = 0, jlen = sections.length; j < jlen; j++) {
                var sec = sections[j];
                if (sec.subreports) {
                    var subreportChanges = prevent_subreport_overlap.call(this, sec.subreports);
                    if (subreportChanges) {
                        subreportMoves[subreportMoves.length] = 
                            subreportChanges.moves;
                    }
                }
            }
        }

        // Do the moves in a second pass to batch updates separately from measurements
        for (i = 0, len = subreportMoves.length; i < len; i++) {
            var moveset = subreportMoves[i];
            for (j = 0, movelen = moveset.length; j < movelen; j++) {
                var move = moveset[j];
                move.el.style.marginTop = String(move.top) + 'px';
                        movecount++;
            }
        }

        // While we have everything visible, draw any deferred charts
        renderDeferredCharts.call(this);

        // if (this.relative_x) {
            // Need to fix element widths in px temporarily in order
            // to measure sections
        // }

        // var start = new Date();
        var heights = [];
        var offsets = [];
        var viewerHeights = [];
        var sections;
        var viewer;
        var k = 0;
        for (var i = 0, len = viewers.length; i < len; i++) {
            viewer = viewers[i];
            sections = viewer.sections;
            var offset = 0;
            if (sections.length > 0) {
                // First offset must account for top margin (use initial offsetTop of first section)
                // unless that first section is printonly or background, in which case use 2nd section
                var firstSection = sections[0];
                if (firstSection.printOnly || firstSection.isBackground) {
                    if (sections.length > 1) {
                        offset = sections[1].section.offsetTop;
                    }
                } else {
                    offset = firstSection.section.offsetTop;
                }
            }
            for (var j = 0, jlen = sections.length; j < jlen; j++) {
                var sec = sections[j];
                var height = sec.section.offsetHeight;
                heights[k] = height;
                offsets[k] = offset;
                k++;
                offset += height;
            }
            viewerHeights[i] = viewer.contentDomEl.offsetHeight;
        }
        this.detachedContentDiv.detach();
        var k = 0;
        var i, j, len, movelen;
        for (i = 0, len = viewers.length; i < len; i++) {
            viewer = viewers[i];
            sections = viewer.sections;
            for (var j = 0, jlen = sections.length; j < jlen; j++) {
                var secDom = sections[j].section;
                secDom.style.top = offsets[k] + 'px';
                secDom.style.height = heights[k] + 'px';
                k++;
            }
            viewer.contentDomEl.style.height = viewerHeights[i] + 'px';
        }

        $(this.contentDomEl).removeClass('jsr-measure-sections');
        $viewport.append(this.detachedContentDiv);
        if (this.enableVirtualRender) {
            enterVRender.call(this);
        }
        on_render_complete.call(this);
    }

    function buildVRenderMap() {
        this.vRenderPageHeight = this.viewportDomEl.offsetHeight;
        var map = {};
        for (var i = 0, len = this.sections.length; i < len; i++) {
            var sec = this.sections[i];
            addSectionToVMap.call(this, map, sec.section, 0, sec.subreports);
        }
        this.vRenderMap = map;
    }

    function enterVRender() {
        buildVRenderMap.call(this);
        pageOutAll.call(this);
        this.vRenderPages = [];
        var scrollTop = this.viewportDomEl.scrollTop;
        vRenderPageIn.call(this, scrollTop);
        this.vrenderScrollHandler = throttleFn(onVRenderScroll.bind(this), this.virtualRenderScrollDelayMs || 150, true);
        $(this.viewportDomEl).on('scroll', this.vrenderScrollHandler);
    }

    function pageInAll() {
        setDisplayOnAllVMap.call(this, 'block');
    }

    function pageOutAll() {
        setDisplayOnAllVMap.call(this, 'none');
    }

    function setDisplayOnAllVMap(displayCss) {
        var vmap = this.vRenderMap;
        var keys = Object.keys(vmap);
        for (var i = 0, len = keys.length; i < len; i++) {
            var bucket = vmap[keys[i]];
            for (var j = 0, blen = bucket.length; j < blen; j++) {
                bucket[j].section.style.display = displayCss;
            }
        }
    }

    /** 
     * Build vrender map for (only leaf-level) descendant .jsr-sections 
     * within a top-level section
     * @private
     */
    function mapContainersInSection(sectionDomEl, sectionTop, rootVMap, childSubreports) {
        for (var i = 0, len = childSubreports.length; i < len; i++) {
            var subrep = childSubreports[i];
            var subrepTop = sectionTop + subrep.offsetTop;
            var subsections = subrep.childNodes;
            for (var j = 0, jlen = subsections.length; j < jlen; j++) {
                addSectionToVMap(rootVMap, subsections[j], subrepTop);
            }
        }
    }

    function addSectionToVMap(map, sectionDomEl, containerTop, childSubreports) {
        var top = containerTop + sectionDomEl.offsetTop;
        var height = sectionDomEl.offsetHeight;
        var pageStart = Math.floor(top / this.vRenderPageHeight);
        var heightInPages = Math.floor(height / this.vRenderPageHeight);
        var pageEnd = pageStart + heightInPages;
        var containers = null;
        if (childSubreports) {
            mapContainersInSection(sectionDomEl, top, map, childSubreports);
        }
        for (var j = pageStart; j <= pageEnd; j++) {
            var bucket = map[j];
            if (!bucket) {
                map[j] = bucket = [];
            }
            bucket.push({
                start: pageStart,
                end: pageEnd,
                section: sectionDomEl
            });
        }
    }

    function throttleFn(fn, maxMs, postpone) {
        var timeout;
        var me = this;
        var lastArgs;
        var inprogress = false;
        var queued = false;
        function timer() {
            timeout = null;
            inprogress = true;
            fn.apply(me, lastArgs);
            inprogress = false;
            // For long-running handlers, we don't want to
            // queue up a bunch of timers so instead we just
            // flag to run once when the current handler finishes
            if (queued && !postpone) {
                queued = false;
                timeout = ditto.window.setTimeout(timer, 0);
            }
        }
        return function() {
            lastArgs = arguments;
            if (timeout) {
                if (postpone) {
                    ditto.window.clearTimeout(timeout);
                } else {
                    return;
                }
            }
            if (inprogress) {
                queued = true;
                return;
            }
            timeout = ditto.window.setTimeout(timer, maxMs);
        };
    }

    function onVRenderScroll() {
        if (this.pageInTimeout) {
            ditto.window.clearTimeout(this.pageInTimeout);
        }
        this.pageInTimeout = ditto.window.setTimeout(vRenderPageIn.bind(this, this.viewportDomEl.scrollTop), 0);
    }

    function vRenderPageIn(top) {
        top = Math.min(top, this.contentDomEl.offsetHeight - this.viewportDomEl.offsetHeight);
        this.pageInInProgress = true;
        var targetPage = Math.floor(top / this.vRenderPageHeight);
        var first = Math.max(0, targetPage - 1);
        var last = targetPage + 1;
        for (var i = 0, len = this.vRenderPages.length; i < len; i++) {
            this.vRenderPages[i].style.display = 'none';
        }
        var pagedIn = [];
        var lastPagedIn = pageInSectionMap.call(this, this.vRenderMap, this.viewportDomEl, pagedIn, first, last);
        this.vRenderPages = pagedIn;
        this.vrenderStart = first;
        this.vrenderEnd = lastPagedIn;
    }

    function pageInSectionMap(map, parentDomEl, pagedIn, start, end) {
        for (var i = start; i <= end; i++) {
            var bucket = map[i];
            if (bucket) {
                for (var j = 0, len = bucket.length; j < len; j++) {
                    var entry = bucket[j];
                    i = Math.max(i, entry.end);
                    // if (entry.inner) {
                    //     pageInContainers.call(this, entry.inner, entry.section, pagedIn, start, end);
                    // }
                    // parentDomEl.appendChild(entry.section);
                    entry.section.style.display = 'block';
                    pagedIn[pagedIn.length] = entry.section;
                }
            }
        }
        // Return last paged-in page index, since we may overshoot the window
        return i - 1;
    }

    function exitVRender() {
        pageInAll.call(this);
        $(this.viewportDomEl).off('scroll', this.vrenderScrollHandler);
    }

    // Adjust font size if requested for certain text elements, to fit containing box
    function fit_text_elements() {
        for (var i = 0; i < this.pending_text_fits.length; i++) {
            var item_to_fit = this.pending_text_fits[i],
                $el = item_to_fit.el;
            textFit($el, {
                multiLine: item_to_fit.multiLine,
                reProcess: false
            });
            $el.css("visibility", "visible");
        }
        this.pending_text_fits = [];
    }

    function on_render_complete() {
        if (this.isSubreport) {
        } else {
            hide_mask.call(this);
        }
        if (!this.isSubreport) {
            $events.trigger("report_rendered");
        }
        $(this).trigger('report_rendered');
    }

    const getAllSections = (report) => {
        const details = Array.isArray(report.body) ? report.body : [ report.body ];
        const sections = _.flatten(details.map(detail => 
            [ detail, ...(detail.extraSections || []) ]));
        if (report.background) {
            sections.push(report.background);
        }
        if (report.page_header) {
            sections.push(report.page_header);
        }
        if (report.page_footer) {
            sections.push(report.page_footer);
        }
        if (report.header) {
            sections.push(report.header);
        }
        if (report.footer) {
            sections.push(report.footer);
        }
        details.forEach(detail => {
            if (detail.sublevels) {
                detail.sublevels.map(function(sublevel) {
                    if (sublevel.header) {
                        sections.push(sublevel.header);
                    }
                    if (sublevel.footer) {
                        sections.push(sublevel.footer);
                    }
                });
            }
        });
        return sections;
    }

    const getAllElements = (report) =>
        _.flatten(getAllSections(report).map(section => section.elements || []));

    function convert_horizontal_units() {
        var details = Array.isArray(this.def.body) ? this.def.body : [ this.def.body ],
            sections = getAllSections(this.def),
            firstDetail = details[0],
            pixels_per_unit = this.pixels_per_unit,
            pivot_col_left = firstDetail.pivot_column_left,
            pivot_col_right = firstDetail.pivot_column_right;
        var pivot_area_right = firstDetail.pivot_area_right || pivot_col_right;
        var reserved_width = pivot_area_right - pivot_col_right;
        var extra_pivot_width = this.pivot ? 
            ((this.pivot_cols.length - 1) * (pivot_col_right - pivot_col_left) - reserved_width) : 0;
        var y_scale_adjustment = this.def.yScaleAdjustment || 1;
        sections.forEach(function(section) {
            if (this.pivot && !this.def.adjustedForPivot) {
                section.pivot_els = [];
            }
            for (var i = section.elements.length - 1; i >= 0; i--) {
                var element = section.elements[i];
                if (!element.id) {
                    element.id = "jsr-auto-id-" + (this.elt_id_counter++);
                }
                if (this.pivot) {
                    if (this.def.adjustedForPivot) {
                        section.pivot_els.forEach(function(pivoted_el) {
                            set_element_px_pos(pivoted_el, pixels_per_unit, y_scale_adjustment);
                        });
                    } else {
                        // If element is entirely within pivot column, move it into special "pivot_els" collections
                        var element_right = element.left + element.width;
                        if (element.left >= pivot_col_left && element_right <= pivot_col_right) {
                            element.in_pivot_column = true;
                            section.pivot_els.push(element);
                            section.elements.splice(i, 1);
                        } else if (element_right > pivot_area_right) {
                            if (element.left < pivot_col_left) {
                                // Element spans entire pivot area; keep left fixed and expand width to span 
                                // all pivot cols
                                element.width += extra_pivot_width;
                            } else {
                                // Element starts in the pivot column and extends rightward past it --
                                // should move to the right with no stretching (anchored at right edge)
                                element.left += extra_pivot_width;
                            }
                        }
                    }
                }
                set_element_px_pos(element, pixels_per_unit, y_scale_adjustment);
            }
        }.bind(this));
        this.def.adjustedForPivot = true;
    }

    /** Set pixel position of element by multiplying unit position by pixels_per_unit */
    function set_element_px_pos(element_def, pixels_per_unit, y_scale_adjustment) {
        element_def.left_px = element_def.left * pixels_per_unit;
        element_def.width_px = element_def.width * pixels_per_unit;
        // NOTE y_scale_adjustment is for converting pre-1.2.9 definitions from pixel y-axis to page-units y-axis
        element_def.top_px = element_def.top * y_scale_adjustment * pixels_per_unit;
        element_def.height_px = element_def.height * y_scale_adjustment * pixels_per_unit;
    }
    
    function render_inputs(def, $toolbar_el) {
        var me = this;
        $toolbar_el.empty();
        var $inputs_ctnr = $('<div class="jsr-report-inputs"><span class="jsr-filter-label"></span></div>');
        $inputs_ctnr.find('.jsr-filter-label').text(t('Filter:'));
        var inputs = def.inputs || [];
        inputs.map(function(inputdef, index) {
            inputdef.id = "jsr-input-" + index;
            var $input = render_input_field.call(this, inputdef);
            $inputs_ctnr.append($input);
            load_input_options.call(me, inputdef, $input);
        });
        if (inputs.length === 0) {
            $inputs_ctnr.find(".jsr-filter-label").hide();
        }
        var $btns = $('<div class="jsr-toolbar-buttons"></div>'),
            $run_btn = $('<button class="jsr-btn ditto-inputs-run"></button>').text(t('Refresh'));
        $btns.append($run_btn);
        $run_btn.on("click", function() {
            refresh_report.call(this);
        }.bind(this));
        var $exportDropdown = $([
            '<div class="dropdown jsr-save-dropdown-button">',
                '<button class="jsr-btn btn-default dropdown-toggle" type="button" id="saveMenuButton" data-toggle="dropdown">',
                    t('Save'),
                    '<span class="caret"></span>',
                '</button>',
                '<ul class="dropdown-menu dropdown-menu-right" role="menu" aria-labelledby="saveMenuButton">',
                    '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="jsr-export-pdf">' + t('PDF') + '</a></li>',
                    (this.saveFormats.indexOf('xlsx') >= 0 ? ('<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="jsr-export-xlsx">' + t('Excel') + '</a></li>') : ''),
                    '<li role="presentation"><a role="menuitem" tabindex="-1" href="#" class="jsr-export-print">' + t('Print') + '</a></li>',
                '</ul>',
            '</div>'].join('')
        );
        $exportDropdown.find("a.jsr-export-pdf").on('click', function(evt) {
            if (this.preserveViewOnExport) {
                exportCurrentViewToPDF.call(this);
            } else {
                renderAndExportPDF.call(this);
            }
        }.bind(this));
        $exportDropdown.find("a.jsr-export-print").on('click', function(evt) {
            const finishPrint = (iframeElement) => {
                iframeElement.focus();
                if (isEdge || isIE) {
                    try {
                        iframeElement.contentWindow.document.execCommand('print', false, null);
                    } catch (e) {
                        iframeElement.contentWindow.print();
                    }
                } else {
                    iframeElement.contentWindow.print();
                }
                if (isIE) {
                    setTimeout(() => {
                        iframeElement.parentNode.removeChild(iframeElement);
                    }, 2000);
                }
            };
            const printToIframeHandler = (pdfBlob) => {
                const printFrame = document.createElement('iframe');
                printFrame.style.width = 0;
                printFrame.style.height = 0;
                printFrame.style.visibility = 'hidden';
                const onLoaded = () => finishPrint(printFrame);
                document.getElementsByTagName('body')[0].appendChild(printFrame);
                if (isIE || isEdge) {
                    printFrame.setAttribute('onload', onLoaded);
                } else {
                    printFrame.onload = onLoaded;
                }
                $(printFrame).attr('src', URL.createObjectURL(pdfBlob));
            }
            if (this.preserveViewOnExport) {
                exportCurrentViewToPDF.call(this, undefined, printToIframeHandler);
            } else {
                renderAndExportPDF.call(this, undefined, printToIframeHandler);
            }
        }.bind(this));
        $exportDropdown.find("a.jsr-export-xlsx").on('click', function(evt) {
            // vrendering doesn't matter here because we always use a separate export wrapper
            export_xlsx.call(this);
        }.bind(this));
        $btns.append($exportDropdown);
        // Note order is important, btns before inputs in HTML
        $toolbar_el.append($btns);
        $toolbar_el.append($inputs_ctnr);
        $toolbar_el.append('<div style="clear:both"></div>');
        $exportDropdown.find("button.dropdown-toggle").jsrDropdown();
    }

    function withVRenderDisabled(fn) {
        if (this.vRenderActive) {
            exitVRender.call(this);
            fn.call(this)
        } else {
            fn.call(this);
        }
    }

    function exportCurrentViewToPDF(filename, outputHandler, target) {
        if (this.enableVirtualRender) {
            exitVRender.call(this);
            $events.one('pdf_exported', enterVRender.bind(this));
        }
        export_pdf.call(this, filename, outputHandler, target);
    }

    function renderAndExportPDF(filename, outputHandler, target) {
        var me = this;
        var $exportWrapper = create_export_wrapper.call(me),
            $exportTarget = $exportWrapper.find(".jsr-export-target");
        $events.one("report_rendered", function() {
            delete this.renderingToPDF;
            $events.one("pdf_exported", function() {
                $exportWrapper.remove();
            });
            // Wait a tick so clients can modify styles in rendering on report_rendered
            setTimeout(() => {
                export_pdf.call(me, filename, outputHandler, target);
            }, 0);
        });
        this.renderingToPDF = true;
        render_report.call(me, me.def, $exportTarget);
    }
    
    function export_pdf(requestedFilename, outputHandler, target) {
        var me = this,
            page_width_pts = this.def.page.paper_size.inches[0] * (this.pivot_width_expansion_ratio || 1) * 72,
            page_height_pts = this.def.page.paper_size.inches[1] * 72,
            orientation = (page_height_pts > page_width_pts ? 'p' : 'l'),
            doc = new jsPDF({
                orientation: orientation, 
                unit: 'pt', 
                format: [ page_width_pts, page_height_pts ],
                disableFontEmbedding: (this.allowPDFFontEmbedding === false)
            });
        const isIE9 = (document.addEventListener && !window.requestAnimationFrame);
        if (!isIE9 && ditto.libraryPath) {
            registerDefaultFonts();
        }
        Object.keys(customFonts).forEach(function(fontKey) {
            var font = customFonts[fontKey];
            doc.registerEmbeddableFont(font.family, font.combinedStyle, font.url);
        });
        const referencedFonts = _.values(extraFontReferences);
        referencedFonts.forEach(font =>
            ['Normal', 'Bold', 'Italic', 'BoldItalic'].forEach(style => 
                doc.addFont(font.psName + (style === 'Normal' ? '' : `-${style}`), 
                    font.name, style, 'StandardEncoding')));

        // var fontUrls = {};
        // for (var sheet = 0; sheet < document.styleSheets.length; sheet++) {
        //  var rules = document.styleSheets[sheet].cssRules || [];
        //  for (var i = 0; i < rules.length; i++) {
        //      var rule = rules[i];
        //      if (rule instanceof CSSFontFaceRule && (rule.style.src.indexOf('truetype') > -1 
        //          || rule.style.src.indexOf('ttf') > -1)) {
        //          var parts = /url\(([^\)]*)\)/ig.exec(rule.style.src);
        //          if (parts[1]) {
        //              console.log('found font url', parts[1]);
        //              fontUrls[rule.style.fontFamily] = parts[1];
        //          }
        //      }
        //  }
        // }

        var usedFonts = {};
        var $reportContent = this.$target.find(".ditto-report-content");
        doc.fetchEmbeddableFonts(function() {
            const availableFonts = {};
            Object.keys(doc.getFontList()).forEach(fontName => {
                availableFonts[fontName.toLowerCase()] = true;
            });
            const availableCustomFonts = Object.keys(customFonts)
                .map(fontKey => customFonts[fontKey].family)
                .filter(fontName => !!availableFonts[fontName.toLowerCase()]);
            var robotoAvailable = !!availableFonts['roboto'];
            var fontOverrides = robotoAvailable ? { 'helvetica': 'Roboto', 'sans-serif': 'Roboto' } : {};
            doc.fromHTML($reportContent[0], 
                0, 0, 
                { 
                    // Settings
                    width: this.$target.width(), 
                    elementHandlers: {} 
                },
                {
                    // Margins
                    top: this.margins_px.top,
                    bottom: this.margins_px.bottom,
                    left: this.margins_px.left,
                    right: this.margins_px.right
                },
                availableCustomFonts,
                referencedFonts,
                usedFonts,
                fontOverrides,
                function callback() {
                    var filename = me.def.title + '.pdf';
                    if (typeof(requestedFilename) !== "undefined" && requestedFilename !== null) {
                        filename = requestedFilename;
                    }
                    if (outputHandler) {
                        // If they requested to handle the output in JavaScript directly, call their callback
                        outputHandler.call(this, doc.output("blob"));
                    } else {
                        // Otherwise, do our normal handling: attempt to download (if IE9, have to use Flash)
                        if (isIE9 && ditto.libraryPath) {
                            var $downloadify = $('<div class="jsr-pdf-manual-download">Your file is ready.  Click the button to open or save it.<div class="jsr-downloadify-button"></div></div>');
                            $(document.body).append($('<div class="jsr-downloadify-download-mask"></div>'));
                            $(document.body).append($downloadify);
                            Downloadify.create($downloadify.find(".jsr-downloadify-button")[0], {
                                filename: filename,
                                data: function() { 
                                    return doc.output();
                                },
                                onComplete: function() { 
                                    $downloadify.remove();
                                    $(".jsr-downloadify-download-mask").remove();
                                },
                                onCancel: function() { 
                                    $downloadify.remove();
                                    $(".jsr-downloadify-download-mask").remove();
                                },
                                onError: function() { 
                                    $downloadify.remove();
                                    $(".jsr-downloadify-download-mask").remove();
                                },
                                swf: ditto.libraryPath + '/media/downloadify.swf',
                                downloadImage: ditto.libraryPath + '/media/download.png',
                                width: 100,
                                height: 30,
                                transparent: true,
                                append: false
                            });
                        } else {
                            if (target === "newwindow") {
                                /** IE doesn't support opening data URIs or blobs in a new window */
                                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                    return doc.output('save', filename);
                                }
                                doc.output('dataurlnewwindow');
                            } else if (target === "print") {
                                /** IE doesn't support opening data URIs or blobs in a new window */
                                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                    return doc.output('save', filename);
                                }
                                doc.autoPrint();
                                doc.output('dataurlnewwindow', {});
                            } else {
                                doc.output('save', filename);
                            }
                        }
                    }
                    $events.trigger("pdf_exported");
                }
            );
        }.bind(this));
    }

    /**
     * Render the report offscreen in HTML mode, then generate the Excel version
     * based on that
     */
    function export_xlsx(requestedFilename, outputHandler, target) {
        var me = this,
            $origTarget = this.$target;
        var $exportWrapper = create_export_wrapper.call(me),
            $exportTarget = $exportWrapper.find(".jsr-export-target"),
            orig_output_format = me.outputFormat;
        me.outputFormat = "xlsx";
        $events.one("report_rendered", function() {
            force_load_all_images.call(me, $exportTarget, function() {
                convert_html_to_excel.call(me, $exportTarget);
                var workbook = generate_excel_workbook.call(me);
                var filename = requestedFilename || ((me.def.title || t('Report')) + '.xlsx');
                if (outputHandler) {
                    outputHandler.call(me, get_excel_blob.call(me, workbook));
                } else {
                    if (target) {
                        switch (target) {
                            case 'newwindow':
                                /** IE doesn't support opening data URIs or blobs in a new window */
                                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                                    download_excel_file.call(me, workbook, filename);
                                } else {
                                    if (URL.createObjectURL) {
                                        window.open(URL.createObjectURL(get_excel_blob(workbook)));
                                    } else if (window.navigator.msSaveOrOpenBlob) {
                                        window.navigator.msSaveOrOpenBlob(get_excel_blob(workbook), filename);
                                    } else {
                                        open_data_uri(get_excel_data_uri(workbook));
                                    }
                                }
                                break;
                            // case 'print':
                            //     break;
                            default:
                                throw new Error('Unsupported Excel export target: ' + target);
                        }
                    } else {
                        download_excel_file.call(me, workbook, filename);
                    }
                }
                $exportWrapper.remove();
                me.outputFormat = orig_output_format;
                me.$target = $origTarget;
            });
        });
        render_report.call(me, me.def, $exportTarget);
    }

    function convert_html_to_excel(target) {
        var content_el = target.find('.ditto-report-content');
        var content_width = content_el.outerWidth();
        var cols = this.excel_columns = get_excel_columns.call(this, get_x_extents.call(this, content_el), content_width);
        var cols_by_x = {};
        cols.forEach(function(col, ix) {
            cols_by_x[col.x_px] = ix;
        });
        this.excel_data = [];
        this.excel_drawings = null;
        this.excel_blank_row = this.excel_columns.map(function() { return ""; });
        this.excel_workbook = ExcelBuilder.createWorkbook();
        this.excel_stylesheet = this.excel_workbook.getStyleSheet();
        this.excel_worksheet = this.excel_workbook.createWorksheet({ name: 'Sheet1' });
        // Fill excel_data
        var sections = $(target).find('div.jsr-section:not(.jsr-print-only-section)');
        var worksheet = this.excel_worksheet;
        var blank_row = this.excel_blank_row;
        for (var i = 0; i < sections.length; i++) {
            var section = sections.eq(i);
            var row_offset = this.excel_data.length;
            var section_rows = get_excel_rows.call(this, section);
            var rows_by_y = {};
            var rows = section_rows.map(function(row, index) { 
                worksheet.setRowInstructions(row_offset + index, {
                    height: row.height * EXCEL_ROW_HEIGHT_MULTIPLIER
                });
                var new_row = blank_row.slice(0);
                rows_by_y[row.y_px] = {
                    index: index,
                    row: new_row
                };
                return new_row;
            });
            // Convert elements into Excel cells
            var elts = section.find('.jsr-element, .jsr-table th, .jsr-table td');
            for (var j = 0; j < elts.length; j++) {
                var elt = elts.eq(j);
                var tagname = elt.prop('tagName').toLowerCase();
                // Ignore table itself because its cells will be handled individually
                if (elt.hasClass('jsr-table')) continue;
                var pos = elt.position();
                if (tagname === 'td' || tagname === 'th') {
                    var tablePos = elt.closest('.jsr-table').position();
                    pos.top += tablePos.top;
                    pos.left += tablePos.left;
                }
                var roundedTop = Math.round(pos.top / EXCEL_RESOLUTION_PX) * EXCEL_RESOLUTION_PX;
                var roundedLeft = Math.round(pos.left / EXCEL_RESOLUTION_PX) * EXCEL_RESOLUTION_PX;
                var roundedRight = Math.round((pos.left + elt.outerWidth()) / EXCEL_RESOLUTION_PX) * EXCEL_RESOLUTION_PX;
                var target_row_info = rows_by_y[roundedTop];
                var target_row_ix = target_row_info.index;
                var start_col_ix = cols_by_x[roundedLeft];
                var end_col_ix = cols_by_x[roundedRight] - 1;
                var target_row = target_row_info.row;
                var overlaps = false;
                for (var target_col_ix = start_col_ix; target_col_ix < end_col_ix; target_col_ix++) {
                    if (target_row[target_col_ix]) {
                        overlaps = true;
                        break;
                    }
                }
                if (end_col_ix > start_col_ix) {
                    merge_cells.call(this, row_offset + target_row_ix, start_col_ix, end_col_ix);
                }
                if (!overlaps) {
                    var def = elt.data('jsr-def');
                    if (tagname === 'th' || tagname === 'td') {
                        def = $.extend({
                            id: 'table-cell-' + i + '-' + j,
                            type: 'text'
                        }, elt.data('jsr-cell-style'));
                    }
                    convert_element_to_excel.call(this, elt, def, target_row, row_offset + target_row_ix, start_col_ix, end_col_ix);
                }
            }
            this.excel_data = this.excel_data.concat(rows);
        }
    }

    function generate_excel_workbook() {
        var sheet = this.excel_worksheet;
        // merge_all_empty_cells.call(this, this.excel_data);
        sheet.setData(this.excel_data);
        sheet.setColumns(this.excel_columns);
        if (this.excel_drawings) {
            this.excel_worksheet.addDrawings(this.excel_drawings);
            this.excel_workbook.addDrawings(this.excel_drawings);
        }
        this.excel_workbook.setPrintArea(1, this.excel_columns.length);
        sheet.setFitToPageWidth(true);
        this.excel_workbook.addWorksheet(sheet);
        return this.excel_workbook;
    }

    function merge_all_empty_cells(data) {
        var colCount = this.excel_columns.length;
        var tempVal;
        for (var r = 0; r < data.length; r++) {
            var row = this.excel_data[r];
            var merge = null;
            for (var c = 0, len = colCount; c < len; c++) {
                var cell = row[c];
                if (cell) {
                    if (cell.metadata.align === 'right') {
                        // Right-aligned
                        if (merge) {
                            if (merge.type === 'empty') {
                                // merge in any empty leftward cells
                                // have to move value into first merged cell or it will be lost
                                delete row[c];
                                merge_cells.call(this, r, merge.start, cell.metadata.endCol);
                                row[merge.start] = cell;
                            } else {
                                // leftward cells non-empty, treat like left-aligned
                                merge_cells.call(this, r, merge.start, c - 1);
                            }
                            merge = null;
                        } else {
                            // Do the single-element merge for this right-aligned cell
                            merge_cells.call(this, r, c, cell.metadata.endCol);
                        }
                    } else {
                        // Left or any other align, close out any existing merge and start new
                        if (merge) {
                            merge_cells.call(this, r, merge.start, c - 1);
                        }
                        merge = { type: 'left', start: c };
                    }
                    c = cell.metadata.endCol;
                } else {
                    // cell empty, start an empty merge span
                    if (!merge) {
                        merge = { type: 'empty', start: c };
                    }
                }
            }
            // If line ended with no data, end any open merge
            if (merge) {
                if (merge.type === 'empty') {
                    tempVal = row[colCount - 1];
                    delete row[colCount - 1];
                }
                merge_cells.call(this, r, merge.start, colCount - 1);
                if (merge.type === 'empty') {
                    row[merge.start] = tempVal;
                }
            }
        }
    }

    function merge_cells(row, startcol, endcol) {
        if (endcol <= startcol) return;
        this.excel_worksheet.mergeCells(
            get_excel_cell_name.call(this, row + 1, startcol + 1), 
            get_excel_cell_name.call(this, row + 1, endcol + 1)
        );
    }

    function compute_margins_px(contentWidth) {
        this.margins_px = {};
        var units = this.def.page.units,
            paper_width = this.def.page.paper_size[units][0],
            preview_width = contentWidth || this.$target[0].offsetWidth,
            pixels_per_unit = (preview_width / paper_width);
        this.pixels_per_unit = pixels_per_unit;
        this.pct_per_px = 100 / preview_width;
        ["left", "top", "right", "bottom"].map(function(side) {
            this.margins_px[side] = Math.floor(Math.min(preview_width, this.def.page.margins[side] * pixels_per_unit));
        }.bind(this));
    }

    function show_mask() {
        if (!this.$mask) {
            this.$mask = $([
                '<div class="jsr-report-mask">',
                    '<div class="jsr-spinner">',
                        // '<div class="jsr-slice-clip">',
                        //     '<div class="jsr-slice"></div>',
                        // '</div>',
                    '</div>',
                '</div>'].join(''));
            if (this.$target.css("position") !== "absolute") {
                this.$target.css("position", "relative");
            }
            this.$target.append(this.$mask);
        }
        this.origTargetOverflow = this.$target.css('overflow');
        this.$target.css("overflow", "hidden");
        this.$mask.show();
    }

    function hide_mask() {
        if (this.$mask) {
            this.$mask.hide();
            this.$target.css("overflow", this.origTargetOverflow || "auto");
        }
    }

    function render_input_field(inputdef) {
        var $field;
        var default_value = inputdef.default_value;
        if (typeof default_value === "undefined") {
            default_value = "";
        }
        var displayName = inputdef.displayName || inputdef.name;
        switch (inputdef.type) {
            case "text":
                $field = $('<div class="ditto-input ditto-input-text">' + displayName + ': <input type="text" value="' + default_value + '" /></div>');
                break;
            case "number":
                $field = $('<div class="ditto-input ditto-input-number">' + displayName + ': <input type="text" value="' + default_value + '" /></div>');
                break;
            case "date":
                $field = $('<div class="ditto-input ditto-input-date">' + displayName + ': <input type="text" value="' + default_value + '" /></div>');
                $field.find("input").datepicker({
                    format: (inputdef.dateFormat ? inputdef.dateFormat.toLowerCase() : "m/d/yy"),
                    autoclose: true
                });
                break;
            case 'boolean':
                $field = $('<div class="ditto-input ditto-input-boolean"><label><input type="checkbox" checked="' + !!default_value + '" />' + displayName + '</label></div>');
                break;
        }
        $field.addClass("jsr-input-id-" + inputdef.id);
        return $field;
    }

    /** If a list of options is provided for the input, initialize that drop-down now */
    function load_input_options(inputDef, $inputWrap) {
        if (inputDef.optionSource) {
            var options = [];
            if (Array.isArray(inputDef.optionSource)) {
                options = inputDef.optionSource;
            } else if (typeof inputDef.optionSource === 'string') {
                // Treat as a data source ID
                // Expect it to be loaded because we look for optionSource when loading datasets initially
                options = datasets[inputDef.optionSource.toLowerCase()];
                if (typeof(options) === "undefined" || !options) {
                    throw new Error('Missing dataset with ID ' + inputDef.optionSource 
                        + ' required by input ' + inputDef.name);
                }
                options = options;
            } else {
                throw new Error('Unrecognized optionSource property for input ' 
                    + inputDef.name + '.  optionSource must be an array or valid data source ID string.');
            }
            if (inputDef.optionSourceField) {
                options = options.map(function(opt) {
                    return opt[inputDef.optionSourceField];
                });
            }
            options = _.uniq(options).filter(function(opt) {
                return (opt !== undefined && opt !== null);
            });
            options.sort();
            var select2Config = { 
                data: options.map(function(opt) {
                    return { id: opt, text: opt };
                }),
                dropdownAutoWidth: true,
                dropdownCssClass: 'jsr-select2-dropdown',
                placeholder: 'Select an option',
                allowClear: true,
                multiple: !!inputDef.multiple
            };
            if (!inputDef.limitToList) {
                select2Config.createSearchChoice = function(term, data) {
                    var lower = term.toLowerCase();
                    if (data.filter(function(opt) { 
                        return opt.text.toLowerCase().localeCompare(lower) === 0; 
                    }).length === 0) {
                        return { id: term, text: term };
                    }
                };
            }
            var $field = $inputWrap.find('input');
            $inputWrap.data({
                'input-field': $field,
                multiple: !!inputDef.multiple
            });
            $field.select2(select2Config)
                .on('change', on_filter_dropdown_change.bind(this));
        }
    }
    
    function on_filter_dropdown_change() {
        refresh_report.call(this);
    }

    function capture_input_values() {
        var $toolbar = this.$toolbar_el,
            values_by_input_name = {};
        if (this.showToolbar) {
            this.def.inputs.forEach(function(input) {
                var $wrapper = $toolbar.find(".jsr-input-id-" + input.id);
                var $input = $wrapper.data('input-field') || $wrapper.find('input, select');
                var val = $input.val();
                var isMultiple = !!$wrapper.data('multiple');
                if (val && input.type === 'date') {
                    val = moment(val, input.dateFormat || 'M/D/YY').format('YYYY-MM-DD');
                } else if (input.type === 'boolean') {
                    val = $input.is(':checked');
                } else if (input.type === 'number') {
                    val = Number(val);
                    if (isNaN(val)) {
                        val = null;
                    }
                } else if (isMultiple) {
                    val = val.split(',');
                }
                values_by_input_name[input.name.toLowerCase()] = val;
            });
        }
        return values_by_input_name;
    }
    
    function apply_filters(filters, data) {
        if (!data) return [];
        if (filters.length === 0) return data;
        var me = this,
            date_operands = { "before": 1, "after": 1, "onorbefore": 1, "onorafter": 1 };
        var actual_operands = filters.map(function(filterdef) {
            var operand = filterdef.operand;
            if (typeof operand === 'string') {
                if (operand.length > 2 && operand.substr(0, 1) === '['
                    && operand.substr(operand.length - 1, 1) === ']') 
                {
                    var expr_inner = operand.substr(1, operand.length - 2);
                    if (expr_inner.length > 0 && expr_inner.substr(0, 1) === "?") {
                        // Filter is matching against an input value, e.g. [?my_input]
                        var possible_input_reference = operand.substr(2, operand.length - 3).toLowerCase();
                        var matching_input_value = me.current_input_values[possible_input_reference];
                        if (typeof(matching_input_value) !== "undefined") {
                            return matching_input_value;
                        } else {
                            printError('Error: Couldn\'t find input named "' + possible_input_reference + '" referenced by filter; filter is ignored.');
                            return '';
                        }
                    } else {
                        switch(expr_inner.toLowerCase()) {
                            case "=now()":
                                operand = moment().format();
                                break;
                            case "=today()":
                                operand = moment().format("YYYY-MM-DD");
                                break;
                        }
                    }
                } else if (operand.length > 1 && operand.substr(0, 1) === '=') {
                    // Expression
                    operand = evalJSExpression.call(me, operand.substr(1), {});
                }
            }
            return operand;
        });
        return data.filter(function(row) {
            for (var i = 0; i < filters.length; i++) {
                var match = false,
                    filter = filters[i],
                    fieldval = getFieldValue(row, filter.field),
                    operand = actual_operands[i],
                    operand_date_format = "YYYY-MM-DD",
                    field_date_format = "YYYY-MM-DD";
                if (operand === '') {
                    continue;
                }
                if (date_operands[filter.operator]) {
                    var schema_field = (this.active_schema && find_field_by_name(this.active_schema, filter.field));
                    if (schema_field && schema_field.dateFormat) {
                        field_date_format = schema_field.dateFormat;
                    }
                    var field_date = moment(fieldval, field_date_format).valueOf(),
                        operand_date = moment(operand, operand_date_format).valueOf();
                    switch(filter.operator) {
                        case "before":
                            match = field_date < operand_date;
                            break;
                        case "after":
                            match = field_date > operand_date;
                            break;
                        case "onorbefore":
                            match = field_date <= operand_date;
                            break;
                        case "onorafter":
                            match = field_date >= operand_date;
                            break;
                    }
                } else {
                    const operands = Array.isArray(operand) ? operand : [ operand ];
                    match = matchesAny(filter.operator, operands, fieldval);
                }
                if (!match) {
                    return false;
                }
            }
            return true;
        }.bind(this));
    }

    function matchesAny(operator, operands, testValue) {
        for (var i = 0; i < operands.length; i++) {
            var operand = operands[i];
            let left, right;
            switch (operator) {
                case "is":
                    if (testValue === operand) return true;
                    break;
                case "isnot":
                    if (testValue !== operand) return true;
                    break;
                case "contains":
                    if (String(testValue).toLowerCase().indexOf(String(operand).toLowerCase()) > -1) return true;
                    break;
                case "doesnotcontain":
                    if (String(testValue).toLowerCase().indexOf(String(operand).toLowerCase()) === -1) return true;
                    break;
                case "gt":
                    if (Number(testValue) > Number(operand)) return true;
                    break;
                case "lt":
                    if (Number(testValue) < Number(operand)) return true;
                    break;
                case "gte":
                    if (Number(testValue) >= Number(operand)) return true;
                    break;
                case "lte":
                    if (Number(testValue) <= Number(operand)) return true;
                    break;
                case "before":
                    left = moment(testValue, 'YYYY-MM-DD').valueOf();
                    right = moment(operand, 'YYYY-MM-DD').valueOf();
                    if (left < right) return true;
                    break;
                case "after":
                    left = moment(testValue, 'YYYY-MM-DD').valueOf();
                    right = moment(operand, 'YYYY-MM-DD').valueOf();
                    if (left > right) return true;
                    break;
                case "onorbefore":
                    left = moment(testValue, 'YYYY-MM-DD').valueOf();
                    right = moment(operand, 'YYYY-MM-DD').valueOf();
                    if (left <= right) return true;
                    break;
                case "onorafter":
                    left = moment(testValue, 'YYYY-MM-DD').valueOf();
                    right = moment(operand, 'YYYY-MM-DD').valueOf();
                    if (left >= right) return true;
                    break;
            }
        }
        return false;
    }

    function find_field_by_name(schema, fieldname) {
        var needle_lower = fieldname.toLowerCase(),
            match = $.grep(schema.fields, function(item, index) {
                return (item.name.toLowerCase().localeCompare(needle_lower) === 0);
            });
        return (match.length > 0 ? match[0] : null);
    }

    function get_detail_sort_fn(report_def, data, schema) {
        const details = Array.isArray(report_def.body) ? report_def.body : [ report_def.body ];
        if (data && details[0].show_detail !== false && details[0].order_detail_by) {
            var sort_field_name = details[0].order_detail_by,
                asc = (details[0].order_detail_dir !== "desc");
            return get_sort_fn.call(this, report_def, data, schema, sort_field_name, asc);
        }
        return null;
    }

    function get_sort_fn(report_def, data, schema, sort_field_name, asc) {
        var schema_field = (schema && find_field_by_name(schema, sort_field_name)),
            field_type = (schema_field && schema_field.type);
        if (!field_type && data.length > 0 && data[0].hasOwnProperty(sort_field_name)) {
            field_type = (typeof data[0][sort_field_name]);
        }
        if (!field_type) {
            warn('Couldn\'t find requested sort field: ' + sort_field_name);
            return null;
        }
        field_type = field_type.toLowerCase();
        const extractSortKey = (row, fieldname) => {
            let key = row[fieldname];
            if (key === undefined) {
                const children = row['___children___'];
                if (children && children.length > 0) {
                    key = children[0][fieldname];
                }
            }
            return key;
        }
        switch (field_type.toLowerCase()) {
            case "number":
                if (asc) {
                    return function(rowa, rowb) {
                        let a = extractSortKey(rowa, sort_field_name);
                        let b = extractSortKey(rowb, sort_field_name);
                        const a_is_null = (a === null);
                        const b_is_null = (b === null);
                        return (a_is_null ? (b_is_null === null ? 0 : -1) : (b_is_null ? 1 : (a - b)));
                    };
                } else {
                    return function(rowa, rowb) {
                        let a = extractSortKey(rowa, sort_field_name);
                        let b = extractSortKey(rowb, sort_field_name);
                        const a_is_null = (a === null);
                        const b_is_null = (b === null);
                        return (a_is_null ? (b_is_null === null ? 0 : 1) : (b_is_null ? -1 : (b - a)));
                    };
                }
                break;
            case "date":
                var date_format = "YYYY-MM-DD";
                if (schema_field && schema_field.dateFormat) {
                    date_format = schema_field.dateFormat;
                }
                if (asc) {
                    return function(rowa, rowb) {
                        var date_a = rowa[sort_field_name],
                            date_b = rowb[sort_field_name];
                        return (date_a ? moment(date_a, date_format).valueOf() : 0) 
                            - (date_b ? moment(date_b, date_format).valueOf() : 0);
                    };
                } else {
                    return function(rowa, rowb) {
                        var date_a = rowa[sort_field_name],
                            date_b = rowb[sort_field_name];
                        return (date_b ? moment(date_b, date_format).valueOf() : 0) 
                            - (date_a ? moment(date_a, date_format).valueOf() : 0);
                    };
                }
                break;
            case "boolean":
                if (asc) {
                    return (rowA, rowB) => {
                        const a = extractSortKey(rowA, sort_field_name) || false;
                        const b = extractSortKey(rowB, sort_field_name) || false;
                        return b ? (a ? 0 : 1) : (a ? -1 : 0);
                    }
                } else {
                    return (rowA, rowB) => {
                        const a = extractSortKey(rowA, sort_field_name) || false;
                        const b = extractSortKey(rowB, sort_field_name) || false;
                        return a ? (b ? 0 : 1) : (b ? -1 : 0);
                    }
                }
            default:
                // alphanumeric case-insensitive
                if (asc) {
                    return function(rowa, rowb) {
                        var a = extractSortKey(rowa, sort_field_name) || "",
                            b = extractSortKey(rowb, sort_field_name) || "";
                        return a.toLowerCase().localeCompare(b.toLowerCase());
                    };
                } else {
                    return function(rowa, rowb) {
                        var a = extractSortKey(rowa, sort_field_name) || "",
                            b = extractSortKey(rowb, sort_field_name) || "";
                        return b.toLowerCase().localeCompare(a.toLowerCase());
                    };
                }
        }
        return null;
    }
    
    function render_level(report, detail, depth, data, $target, parentGroupRow) {
        var me = this,
            levels = detail.sublevels || [],
            is_detail = depth >= levels.length,
            level_def = (is_detail ? detail : levels[depth]),
            grouping = (level_def.group_by !== null && typeof(level_def.group_by) !== "undefined"),
            matching_rows;
        if (!grouping && depth === levels.length - 1) {
            is_detail = true;
            level_def = detail;
        }
        if (is_detail) {
            if (this.show_detail) {
                matching_rows = data;
                if (this.detail_sort_fn) {
                    matching_rows.sort(this.detail_sort_fn);
                }
            } else {
                matching_rows = [];
            }
        } else {
            if (grouping) {
                matching_rows = group_rows.call(this, data, level_def.group_by, level_def, depth, report, parentGroupRow);
            }
            if (depth < detail.sublevels.length - 1) {
                var child_level = detail.sublevels[depth + 1];
                if (child_level.data_source !== "__parentgroup") {
                    // Pull in external data source if one is specified
                    // Rows will be ALL rows in the data source UNLESS a filter is applied
                    // Have to do this ahead of time in order to set parent's ___children___ correctly
                    // Overwrite the ___children___ given by group_rows with the new external data
                    for (var rowix = 0; rowix < matching_rows.length; rowix++) {
                        matching_rows[rowix]["___children___"] = get_linked_rows.call(this, child_level, depth + 1, matching_rows[rowix]);
                    }
                }
            }
        }
        var done = false,
            childIterator = null,
            nextOffset = 0,
            visibleBands = 0,
            detailAlt = false,
            i;
        let bandsToRemoveIfEmpty = [];
        const removeBands = () => {
            // console.log('removing', bandsToRemoveIfEmpty.length, 'bands');
            bandsToRemoveIfEmpty.map($band => $band.remove());
            bandsToRemoveIfEmpty = [];
        };
        // Now return an iterator with a function to process the next batch
        return {
            renderBatch: function(startTime) {
                var start = startTime || new Date();
                if (childIterator && childIterator.hasMore()) {
                    // complete rendering the child section
                    childIterator.renderBatch(start);
                    if (childIterator.hasMore()) {
                        // yield
                        return;
                    } else {
                        if (level_def.footer && level_def.footer.visible !== false) {
                            const band = renderSection.call(me, level_def.footer, $target, matching_rows[i], false, i, depth);
                            if (band) {
                                visibleBands++;
                                if (level_def.footer.hideIfEmpty) {
                                    bandsToRemoveIfEmpty.push(band);
                                }
                            }                         
                        }
                        visibleBands += childIterator.visibleBands();
                        // console.log('child bands', childIterator.visibleBands());
                        if (childIterator.visibleBands() === 0) {
                            removeBands();
                        }
                    }
                }
                for (i = nextOffset; i < matching_rows.length; i++) {
                    if (is_detail) {
                        const band = renderSection.call(me, level_def, $target, matching_rows[i], false, i, depth);
                        if (band) {
                            visibleBands++;
                            if (detailAlt) {
                                band.addClass('jsr-detail-alt');
                            }
                            detailAlt = !detailAlt;
                        }
                    } else {
                        bandsToRemoveIfEmpty = [];
                        if (level_def.header && level_def.header.visible !== false) {
                            const band = renderSection.call(me, level_def.header, $target, matching_rows[i], false, i, depth);
                            if (band) {
                                visibleBands++;
                                if (level_def.header.hideIfEmpty) {
                                    bandsToRemoveIfEmpty.push(band);
                                }
                            }
                        }
                        let childVisibleBands = 0;
                        childIterator = render_level.call(me, report, detail, depth + 1, matching_rows[i]["___children___"], $target, matching_rows[i]);
                        childIterator.renderBatch(start);
                        if (childIterator.hasMore()) {
                            nextOffset = i + 1;
                            // yield
                            return;
                        } else {
                            childVisibleBands = childIterator.visibleBands();
                            childIterator = null;
                        }
                        // Finished rendering group
                        if (level_def.footer && level_def.footer.visible !== false) {
                            const band = renderSection.call(me, level_def.footer, $target, matching_rows[i], false, i, depth);
                            if (band) {
                                visibleBands++;
                                if (level_def.footer.hideIfEmpty) {
                                    bandsToRemoveIfEmpty.push(band);
                                }
                            }
                        }
                        visibleBands += childVisibleBands;
                        // console.log('child bands', childVisibleBands);
                        if (childVisibleBands === 0) {
                            removeBands();
                        }
                    }
                    if (i % BATCH_RENDER_MIN_ROWS === 0) {
                        if (new Date() - start > BATCH_RENDER_INTERVAL_MS) {
                            // yield
                            nextOffset = i + 1;
                            return;
                        }
                    }
                }
                // Processed all rows
                done = true;
            },

            hasMore: function() {
                return !done;
            },

            visibleBands: () => visibleBands
        };
    }
    
    function get_linked_rows(level_def, depth, parent_row) {
        var all_child_data = datasets[(level_def.data_source || '').toLowerCase()];
        if (!(level_def.where_child_field && level_def.where_parent_field)) {
            return all_child_data;
        }
        var cache_key = String(level_def.data_source + "-" + depth),
            buckets = this.linked_data_index_cache[cache_key],
            parent_linked_value = parent_row[level_def.where_parent_field],
            child_value_key = (level_def.where_child_field || "");
        if (typeof parent_linked_value === "undefined") {
            parent_linked_value = "";
        }
        parent_linked_value = String(parent_linked_value).toLowerCase();
        if (!buckets) {
            buckets = {};
            for (var i = 0; i < all_child_data.length; i++) {
                var row = all_child_data[i],
                    child_linked_value = row[child_value_key];
                if (typeof child_linked_value === "undefined") {
                    child_linked_value = "";
                }
                child_linked_value = String(child_linked_value).toLowerCase();
                var bucket = buckets[child_linked_value];
                if (!bucket) {
                    bucket = [];
                    buckets[child_linked_value] = bucket;
                }
                bucket.push(row);
            }
            this.linked_data_index_cache[cache_key] = buckets;
        }
        return buckets[parent_linked_value] || [];
    }

    function group_rows(data, group_by, level_def, depth, report_def, parentGroupRow) {
        var me = this,
            matching_rows = [],
            groups_by_key = {};
        /** Propagate grouped values downward through groups for reference in formulas */
        const parentGroupedFields = parentGroupRow ? 
            _.object(
                Object.keys(parentGroupRow)
                    .filter(key => key.indexOf('___') !== 0) 
                    .map(key => [ key, parentGroupRow[key] ]))
            : {};
        data.map(function(row) {
            if (group_by.indexOf('=') === 0) {
                group_by = eval_calculation.call(me, group_by, row, null);
            }
            var key = String(row[group_by]).toLowerCase();
            var group = groups_by_key[key];
            if (!group) {
                group = { 
                    ...parentGroupedFields,
                    ...row, // Group summary row gets non-grouped values from first row for later lookup
                    "___children___": [], 
                    "___level___": depth
                };
                group[group_by] = row[group_by];
                groups_by_key[key] = group;
                matching_rows.push(group);
            }
            group["___children___"].push(row);
        });
        // Sort groups
        if (level_def && level_def.sort_by) {
            var sort_field_name = level_def.sort_by,
                asc = (level_def.sort_dir !== "desc");
            // Pull up the sort field from the first child since we don't yet support grouping on multiple fields
            if (sort_field_name !== group_by) {
                for (var i = 0; i < matching_rows.length; i++) {
                    var grouped_row = matching_rows[i],
                        group_children = grouped_row["___children___"];
                    if (group_children.length > 0) {
                        grouped_row[sort_field_name] = group_children[0][sort_field_name];
                    } else {
                        grouped_row[sort_field_name] = null;
                    }
                }
            }
            var group_sort_fn = get_sort_fn.call(this, report_def, data, this.active_schema, level_def.sort_by, asc);
            if (group_sort_fn) {
                matching_rows.sort(group_sort_fn);
            }
        }
        return matching_rows;
    }

    /**
     * Operates on the final detail data, extracting and sorting all unique pivot values
     */
    function extract_pivot_columns(data, pivot_expr, bucket_fn, sort_by) {
        var pivot_cols = [],
            pivot_keys = {},
            pivot_datatype = get_pivot_column_datatype.call(this, pivot_expr) || "string";
        for (var i = 0; i < data.length; i++) {
            var row = data[i],
                pivot_val = evaluate_string.call(this, pivot_expr, row, (pivot_datatype === "date" ? "YYYY-MM-DD" : null));
            if (typeof pivot_val === "undefined") {
                pivot_val = "";
            }
            var key = String(pivot_val).toLowerCase();
            key = apply_pivot_bucket_fn.call(this, key, bucket_fn);
            if (!pivot_keys[key]) {
                pivot_keys[key] = true;
                pivot_cols.push({
                    key: key,
                    sample_value: row[this.pivot_field_name],
                    sort_val: get_pivot_column_sort_val.call(this, pivot_val, pivot_datatype)
                });
            }
            row["___pivot_key___"] = key;
        }
        if (pivot_cols.length > 1) {
            switch (pivot_datatype) {
                case "number":
                    pivot_cols.sort(function(a, b) {
                        return a.sort_val - b.sort_val;
                    });
                    break;
                default:
                    pivot_cols.sort(function(a, b) {
                        return (a.sort_val || "").localeCompare(b.sort_val || "");
                    });
                    break;
            }
        }
        return pivot_cols;
    }

    function apply_pivot_bucket_fn(key, bucket_fn) {
        switch (bucket_fn) {
            case "year":
                return key.substr(0, 4);
            case "month":
                return key.substr(0, 7);
            case "day":
                return key.substr(0, 10);
        }
        return key;
    }

    function get_pivot_column_sort_val(val, datatype) {
        if (datatype === "number") {
            return Number(val);
        }
        return val;
    }

    function get_pivot_column_datatype(pivot_expr) {
        var datatype = null,
            format = null;
        var schema_field = get_schema_field_from_single_field_expression.call(this, pivot_expr);
        if (schema_field) {
            datatype = schema_field.type.toLowerCase();
        }
        return datatype;
    }

    function get_schema_field_from_single_field_expression(expr) {
        if (this.active_schema 
            && expr.substr(0, 1) === "[" 
            && expr.substr(expr.length - 1, 1) === "]"
        ) {
            return find_field_by_name.call(this, this.active_schema, expr.substr(1, expr.length - 2));
        }
        return null;        
    }

    /**
     * Render a single section, e.g. a header, detail, or footer, 
     * from a single row (or grouped summary row)
     */
    function renderSection(section_def, $target, row, isPageHeaderOrFooter, rowIndex, depth) {
        depth = depth || 0;
        let props = section_def;
        if (props.conditionalRules && props.conditionalRules.length > 0) {
            props = _.extend({}, props);
            evaluateConditionalRules.call(this, props, row);
        }
        var visible = true;
        var visProp = props.visible;
        if (visProp === false) {
            visible = false;
        } else if (typeof visProp === "string" && visProp.length > 1 && visProp.substr(0, 1) === "=") {
            visible = evaluate_property_expression_boolean.call(this, visProp, row, "visible", true);
        }
        if (!visible) return null;
        var deferred_render = [],
            height = 0,
            htmlDocument = ditto.window.document,
            y_scale_factor = (this.def.yScaleAdjustment || 1) * this.pixels_per_unit,
            // pending_height_adjustments = this.pending_height_adjustments,
            element_adjustments = [],
            sectionId = generate_section_instance_id(),
            section = htmlDocument.createElement('div'),
            initialSectionHeight = props.height * y_scale_factor,
            $section = $(section).data({
                'jsr-id': sectionId,
                'jsr-depth': depth
            }),
            sectionInfo = {
                section: section,
                adjs: element_adjustments
            },
            i, elt;
        const classes = ['jsr-section'];
        if (props.cssClass) {
            classes.push(props.cssClass);
        }
        section.className = classes.join(' ');
        if (!props.shrinkToFit) {
            section.style.minHeight = initialSectionHeight + 'px';
        }
        section.style.top = this.sectionOffset + 'px';
        if (isPageHeaderOrFooter && !this.showPageHeaderAndFooter) {
            $section.addClass("jsr-print-only-section").data("section-height", section_def.height * y_scale_factor);
            sectionInfo.printOnly = true;
        } else {
            this.sectionOffset += initialSectionHeight;
        }
        var pagebreaks = [];
        for (i = 0; i < section_def.elements.length; i++) {
            elt = section_def.elements[i];
            // Store page-break positions in a data string on the section element, for use by PDF renderer
            if (elt.type === 'break') {
                // suppressFirst prevents the page break for the first record
                if (!(rowIndex === 0 && elt.suppressFirst)) {
                    var everyNth = elt.everyNth || 1;
                    if (rowIndex % everyNth === everyNth - 1) {
                        pagebreaks.push(elt.top * y_scale_factor);
                    }
                }
                continue;
            }
            let rendered = render_element.call(this, elt, row, deferred_render);
            if (!rendered) continue;
            if (!Array.isArray(rendered)) {
                rendered = [ rendered ];
            }
            // var newDomEl = $newelt[0];
            for (let j = 0, rl = rendered.length; j < rl; j++) {
                let newEl = rendered[j];
                section.appendChild(newEl.domEl);
                let renderedDef = newEl.elt;
                if ((renderedDef.type === "text" && (renderedDef.wrap !== false)) 
                    || (renderedDef.type === 'subreport')
                    || (renderedDef.type === 'table')
                    || renderedDef["fit_content"] === "vertical")
                {
                    if (renderedDef.type === 'subreport') {
                        sectionInfo.subreports = (sectionInfo.subreports || []).concat([ newEl.domEl ]);
                    }
                    element_adjustments.push(newEl);
                }
            }
        }
        if (pagebreaks.length > 0) {
            $section.data('page-breaks', pagebreaks);
        }
        if (this.pivot) {
            var pivot_children_by_key = null;
            var rows_for_key;
            if (row) {
                pivot_children_by_key = row["___pivot_children_by_key___"];
                if (!pivot_children_by_key && row["___children___"]) {
                    // Create dictionary of pivoted rows by pivot key
                    var all_children = row["___children___"];
                    pivot_children_by_key = {};
                    for (i = 0; i < all_children.length; i++) {
                        var childrow = all_children[i],
                            key = childrow["___pivot_key___"];
                        rows_for_key = pivot_children_by_key[key];
                        if (!rows_for_key) {
                            rows_for_key = [];
                            pivot_children_by_key[key] = rows_for_key;
                        }
                        rows_for_key.push(childrow);
                    }
                }
            }
            if (!pivot_children_by_key) {
                pivot_children_by_key = {};
            }
            for (i = 0; i < this.pivot_cols.length; i++) {
                var pivot_col = this.pivot_cols[i],
                    pivot_context = {
                        column_key: pivot_col.key,
                        pivot_field: this.pivot_field_name
                    },
                    pivot_children = pivot_children_by_key[pivot_col.key] || [],
                    temp_row = {
                        "___children___": pivot_children
                    };
                temp_row[this.pivot_field_name] = pivot_col.sample_value;
                for (var j = 0; j < section_def.pivot_els.length; j++) {
                    elt = section_def.pivot_els[j];
                    let rendered = render_element.call(this, elt, temp_row, deferred_render, i * this.pivot_column_width, pivot_context);
                    if (!rendered) continue;
                    if (!Array.isArray(rendered)) {
                        rendered = [ rendered ];
                    }
                    rendered.forEach(renderedEl => {
                        section.appendChild(renderedEl.domEl);
                        if ((elt.type === "text" && (elt.wrap !== false)) || elt["fit_content"] === "vertical") {
                            element_adjustments.push(renderedEl);
                        }
                    });
                }
            }
        }
        this.sections.push(sectionInfo);
        this.contentDomEl.appendChild(section);
        for (var i = 0, len = deferred_render.length; i < len; i++) {
            do_deferred_render.call(this, deferred_render[i]);
        }
        if (section_def.extraSections) {
            for (let i = 0; i < section_def.extraSections.length; i++) {
                renderSection.call(this, section_def.extraSections[i], $target, row, isPageHeaderOrFooter, rowIndex, depth);
            }
        }
        if (props.repeatEachPage) {
            $section.data({ 'jsr-repeat-each-page': true });
        }
        if (props.canBreak === false) {
            $section.data('jsr-no-break', true);
        }        
        return $section;
    }

    /**
     * Find x extents of all elements on a rendered HTML report (visible or offscreen),
     * in order to create columns in Excel
     */
    function get_x_extents(target) {
        var usedXs = {};
        var sections = $(target).find('div.jsr-section');
        for (var i = 0; i < sections.length; i++) {
            var elts = sections.eq(i).find('.jsr-element, .jsr-table td, .jsr-table th');
            for (var j = 0; j < elts.length; j++) {
                var elt = elts.eq(j);
                if (elt.hasClass('jsr-table')) continue;
                var tagname = elt.prop('tagName').toLowerCase();
                var leftPx = elt.position().left;
                if (tagname === 'td' || tagname === 'th') {
                    leftPx += elt.closest('.jsr-table').position().left;
                }
                var leftRounded = Math.round(leftPx / EXCEL_RESOLUTION_PX) * EXCEL_RESOLUTION_PX;
                var rightRounded = Math.round((leftPx + elt.outerWidth()) / EXCEL_RESOLUTION_PX) * EXCEL_RESOLUTION_PX;
                usedXs[leftRounded] = true;
                usedXs[rightRounded] = true;
            }
        }
        return Object.keys(usedXs).map(function(str_num) { return parseInt(str_num, 10); }).sort(sort_numbers);
    }

    function get_excel_columns(x_extents, canvas_width) {
        var col_dividers = x_extents;
        // If there were no elements at the left edge, make explicit a leftmost column at zero
        if (col_dividers[0] !== 0) {
            col_dividers.splice(0, 0, 0);
        }
        var rounded_canvas_width = Math.ceil(canvas_width / EXCEL_RESOLUTION_PX) * EXCEL_RESOLUTION_PX;
        if (col_dividers[col_dividers.length - 1] < rounded_canvas_width) {
            col_dividers.push(rounded_canvas_width);
        }
        return col_dividers.slice(0, col_dividers.length - 1).map(function(x, index) {
            return {
                x_px: x,
                width: (col_dividers[index + 1] - x) * EXCEL_WIDTH_UNITS_PER_PX
            };
        });
    }

    function sort_numbers(a, b) {
        return a - b;
    }

    function get_excel_rows(section) {
        var rows = [];
        var usedYs = {};
        var elts = section.find('.jsr-element, .jsr-table td, .jsr-table th');
        for (var j = 0; j < elts.length; j++) {
            var elt = elts.eq(j);
            if (elt.hasClass('jsr-table')) continue;
            var tagname = elt.prop('tagName').toLowerCase();
            var top = elt.position().top;
            if (tagname === 'td' || tagname === 'th') {
                top += elt.closest('.jsr-table').position().top;
            }
            var roundedTop = Math.round(top / EXCEL_RESOLUTION_PX) * EXCEL_RESOLUTION_PX;
            var roundedBottom = Math.round((top + elt.outerHeight()) / EXCEL_RESOLUTION_PX) * EXCEL_RESOLUTION_PX;
            usedYs[roundedTop] = true;
            usedYs[roundedBottom] = true;
        }
        var row_dividers = Object.keys(usedYs).map(function(str_num) { return parseInt(str_num, 10); }).sort(sort_numbers);
        // Add top and bottom edges of section if not already present
        if (row_dividers[0] !== 0) {
            row_dividers.splice(0, 0, 0);
        }
        var section_height = Math.ceil(section.outerHeight()  / EXCEL_RESOLUTION_PX) * EXCEL_RESOLUTION_PX;
        if (row_dividers[row_dividers.length - 1] < section_height) {
            row_dividers.push(section_height);
        }
        return row_dividers.slice(0, row_dividers.length - 1).map(function(y, index) {
            return {
                y_px: y,
                height: (row_dividers[index + 1] - y) * EXCEL_WIDTH_UNITS_PER_PX
            };
        });
    }

    function getExpressionFunctions() {
        const me = this;
        const builtIns = {
            FORMAT: (val, formatStr) => {
                return formatJSValue.call(this, val, formatStr);
            },
            DATE: (str, format) => {
                if (!str) return new Date();
                let parsed = null;
                try {
                    parsed = moment(str, format || DEFAULT_DATE_PARSE_FORMAT).toDate();
                } catch(e) {}
                return parsed;
            },
            TRANSLATE: function(templateStr) {
                // Fall back to passed template if no translation found
                var translatedTemplate = templateStr;
                if (!this.translations) {
                    translatedTemplate = this.translations[templateStr] || translatedTemplate;
                }
                var args = arguments;
                return translatedTemplate.replace(/{(\d+)}/gim, function(match, g1) {
                    return args[Number(g1) + 1];
                });
            },
            FINDDATA: function(fieldName) {
                var val = scope[fieldName];
                if (typeof val !== 'undefined') return val;
                for (var i = this.rowStack.length - 1; i >= 0; i--) {
                    val = this.rowStack[i][fieldName];
                    if (val) return val;
                }
                return null;
            },
            /** Find a value in a data source column and return that row */
            LOOKUP: function(targetValue, dataSourceId, fieldName, outputFieldName) {
                const table = datasets[(dataSourceId || '').toLowerCase()];
                if (!table) {
                    console.warn(`ERROR: Couldn't find data source "${dataSourceId}" referenced by LOOKUP formula`);
                }
                // console.log(`searching for ${targetValue} in ${dataSourceId}.${fieldName}`);
                for (let i = 0; i < table.length; i++) {
                    const row = table[i];
                    const val = row[fieldName];
                    if (typeof val !== 'undefined' && val === targetValue) {
                        // console.log(`found row matching ${fieldName}, returning`, row);
                        // console.log('returning', (typeof outputFieldName !== 'undefined' ? 
                            // row[outputFieldName] : row));
                        return (typeof outputFieldName !== 'undefined' ? 
                            row[outputFieldName] : row);
                    }
                }
                return null;
            },
            EVAL: function(expr) {
                return evalJSExpression.call(me, expr, this);
            },
            CHILDROWS: function() {
                const childRows = this['___children___'];
                return childRows || [];
            }
        };
        AGGREGATE_NAMES.forEach(aggName => {
            builtIns[aggName.toUpperCase()] = fieldName => 
                compute_aggregate.call(this, aggName, fieldName, this.currentAggregateDomain);
        });
        return $.extend(builtIns, this.customFunctions || {});
    }

    /**
     * Evaluates a JavaScript expression against a data row.  Used to evaluate
     * dynamic element properties.
     */
    function evaluate_property_expression(expr, scope) {
        let returnVal = undefined;
        try {
            returnVal = evalJSExpression.call(this, expr, scope);
        } catch(e) {
            console.error(e);
        }
        return returnVal;
    }

    function evaluate_property_expression_boolean(expr, scope, name, defaultVal) {
        var val = defaultVal;
        try {
            val = Boolean(evaluate_property_expression.call(this, expr.substr(1), scope));
        } catch(e) {
            printError("Failed to evaluate expression for \"" + name + "\" property: " + expr + ", error was: " + e);
        }
        return val;
    }

    function evaluate_property_expression_string(expr, scope, name, defaultVal) {
        var val = defaultVal;
        try {
            val = String(evaluate_property_expression.call(this, expr.substr(1), scope));
        } catch(e) {
            printError("Failed to evaluate expression for \"" + name + "\" property: " + expr + ", error was: " + e);
        }
        return val;
    }

    function evaluate_property_expression_number(expr, scope, name, defaultVal) {
        var val = defaultVal;
        try {
            val = Number(evaluate_property_expression.call(this, expr.substr(1), scope));
        } catch(e) {
            printError("Failed to evaluate expression for \"" + name + "\" property: " + expr + ", error was: " + e);
        }
        return val;
    }    

    /**
     * When font scaling is enabled, figure out the scaling ratio, which is
     * the ratio of (pixels per "inch" [logical report inch] / actual device ppi)
     * Since we can't know actual device ppi, use the next best thing which is the
     * standard 96
     * (This scales fonts to fit the rendered page on screen)
     */
    function getFontScaleFactor() {
        if (this.fontScaleFactor) return this.fontScaleFactor;
        if (this.scaleFonts === false) {
            this.fontScaleFactor = 1;
            return this.fontScaleFactor;
        }
        var basePPI = 96;
        var ppi = this.pixels_per_unit * (this.def.page.units === 'inches' ? 1 : 25.4);
        return this.fontScaleFactor = (ppi / basePPI);
    }

    /**
     * Applies conditional rules, replacing existing property values
     */
    function evaluateConditionalRules(props, row) {
        const rules = props.conditionalRules;
        let changed = false;
        rules.forEach(rule => {
            let matchedAll = true;
            for (let i = 0; i < rule.conditions.length; i++) {
                const cond = rule.conditions[i];
                let matched = false;
                let fieldVal;
                let operand = cond.operand;
                if (typeof cond.field === 'string' && cond.field.substr(0, 1) === '=') {
                    fieldVal = evaluate_property_expression.call(this, cond.field.substr(1), row);
                } else {
                    fieldVal = getFieldValue(row, cond.field);
                }
                if (typeof operand === 'string' && operand.substr(0, 1) === '=') {
                    operand = evaluate_property_expression.call(this, operand.substr(1), row);
                }
                // If we have a number-type data value and a string operand containing a number,
                // assume a numeric comparison is wanted
                if (typeof fieldVal === 'number' && typeof operand === 'string') {
                    const parsedNum = Number(operand);
                    if (!isNaN(parsedNum)) {
                        operand = parsedNum;
                    }
                }
                // console.log('condrule: test', cond.field, fieldVal, 
                //     typeof fieldVal, cond.operator, cond.operand,
                //     'matches?', matchesAny.call(this, cond.operator, [ cond.operand ], fieldVal));
                if (!matchesAny.call(this, cond.operator, [ operand ], fieldVal)) {
                    matchedAll = false;
                    // console.log(`[ ] cond rule did NOT match - tested value "${cond.field}": ${fieldVal} (${typeof fieldVal}) against "${cond.operator}" "${cond.operand}" (${typeof cond.operand})`);
                    break;
                }
                // console.log(`[X] cond rule DID match - tested value "${cond.field}": ${fieldVal} (${typeof fieldVal}) against "${cond.operator}" "${cond.operand}" (${typeof cond.operand})`);
            }
            if (matchedAll) {
                // console.log(`rule matched all - applying effects ${JSON.stringify(rule.effects, null, 2)}`);
                // Apply effects
                rule.effects.forEach(effect => {
                    let value = effect.value;
                    if (typeof value === 'string' && value.substr(0, 1) === '=') {
                        value = evaluate_property_expression.call(this, value.substr(1), row);
                    }
                    props[effect.property] = value;
                    changed = true;
                });
            }
        });
        if (changed) {
            // Update width_px etc in case dimensions, position changed
            set_element_px_pos.call(this, props, this.pixels_per_unit, this.def.yScaleAdjustment || 1);
        }
    }
    
    function getStringPropertyValue(eltProps, propName, dataRow, defaultValue) {
        let val = eltProps[propName];
        if (typeof val === "string" && val.length > 1 && val.substr(0, 1) === "=") {
            val = evaluate_property_expression_string.call(this, val, dataRow, propName, defaultValue);
        }
        return val;
    }

    function render_element(elt, row, deferred_render, left_offset, pivot_context) {
        var htmlDocument = ditto.window.document;
        var $elt,
            left_margin_px = this.margins_px.left;
        let props = elt;
        let inst;
        if (props.conditionalRules && props.conditionalRules.length > 0) {
            props = { ...props };
            evaluateConditionalRules.call(this, props, row);
        }
        let swapDimensions = false;
        var visProp = props.visible;
        if (visProp === false) {
            return null;
        } else if (typeof visProp === "string" && visProp.length > 1 && visProp.substr(0, 1) === "=") {
            var visible = evaluate_property_expression_boolean.call(this, visProp, row, "visible", true);
            if (!visible) {
                return null;
            }
        }
        var elData = {
            'jsr-def': props
        };
        const calcProps = ['left', 'top', 'width', 'height'];
        for (let i = 0; i < calcProps.length; i++) {
            const propKey = calcProps[i];
            const prop = props[propKey];
            if (typeof prop === 'string' && prop.length > 0 && prop[0] === '=') {
                // eval calculated position
                const propVal = evaluate_property_expression_number.call(this, prop, row, propKey, 0);
                props[propKey] = propVal;
                props[`${propKey}_px`] = propVal * this.pixels_per_unit;
            }
        }
        let leftPx = props.left_px;
        let topPx = props.top_px;
        switch (props.type) {
            case "text":
                var textEl = htmlDocument.createElement('div');
                textEl.className = 'jsr-element jsr-text';
                $elt = $(textEl);
                var fontsize = 'inherit';
                if (props.fontsize) {
                    if (this.scaleFonts === false) {
                        fontsize = props.fontsize + 'pt';
                    } else {
                        var dFontsize = parseFloat(props.fontsize);
                        fontsize = (dFontsize * getFontScaleFactor.call(this)).toFixed(2) + 'pt';
                        elData['font-size'] = dFontsize;
                    }
                }
                textEl.style.fontStyle = props.italic ? "italic" : "normal";
                textEl.style.textDecoration = props.underline ? "underline" : "none";
                textEl.style.textAlign = props.align || "left";
                textEl.style.fontSize = fontsize;
                textEl.style.fontFamily = props.font ? props.font.css : "inherit";
                if (props.font) {
                    ditto.requireWebFont(props.font.name || props.font.css);
                }
                if (props.bold) {
                    var bold = props.bold;
                    if (typeof bold === "string" && bold.length > 1 && bold.substr(0, 1) === "=") {
                        bold = evaluate_property_expression_boolean.call(this, bold, row, "bold", null);
                    }
                    textEl.style.fontWeight = bold ? "bold" : "normal";
                }
                if (props.text_color) {
                    const textColor = getStringPropertyValue.call(this, props, 'text_color', row, null);
                    if (textColor !== null) {
                        textEl.style.color = textColor;
                    }
                }
                if (props.background_color) {
                    const backgroundColor = getStringPropertyValue.call(this, props, 'background_color', row, null);
                    if (backgroundColor !== null) {
                        textEl.style.backgroundColor = backgroundColor;
                    }
                }
                textEl.style.whiteSpace = (props.wrap === false) ? 'nowrap' : 'pre-line';
                let rawText = evaluate_string.call(this, props.text, row, props.pattern || null, pivot_context);
                if (props.__hasPageNumber) {
                    $elt.data('jsr-text-template', rawText);
                    rawText = rawText.replace('{{JSR_PRINT_PAGE_NUMBER}}', '1')
                        .replace('{{JSR_PRINT_PAGE_COUNT}}', '1');
                }
                if (props.syntax === 'markdown') {
                    $elt.html(markdownToHtml.call(this, rawText)).addClass('jsr-markdown');
                } else if (props.syntax === 'html') {
                    $elt.html(rawText).addClass('jsr-html');
                } else {
                    rawText = rawText.replace(/\\n/gim, '\n');
                    textEl.appendChild(htmlDocument.createTextNode(rawText));
                }
                if (props.fit_text) {
                    this.pending_text_fits.push({
                        el: $elt,
                        multiLine: (props.wrap !== false)
                    });
                    $elt.css("visibility", "hidden");
                }
                if (props.rotateDegrees) {
                    $elt.addClass(`jsr-text-rotate-${props.rotateDegrees}`);
                    $elt.data('jsr-text-rotate', props.rotateDegrees);
                    if (props.rotateDegrees === 90) {
                        leftPx += props.width_px;
                        swapDimensions = true;
                    } else if (props.rotateDegrees === -90) {
                        topPx += props.height_px;
                        swapDimensions = true;
                    }
                }
                break;
            case "image":
                var url = evaluate_string.call(this, props.url || '', row, props.pattern || null, pivot_context);
                if (url.substr(0, 5) !== 'data:') {
                    url = this.imageUrlPrefix + url;
                }
                var imgWrapEl = htmlDocument.createElement('div');
                imgWrapEl.className = 'jsr-element jsr-image';
                var imgEl = htmlDocument.createElement('img');
                imgEl.src = url;
                imgWrapEl.appendChild(imgEl);
                $elt = $(imgWrapEl)
                    // .addClass("jsr-element jsr-image")
                    .data("image-url", url);
                    // .css("background-image", "url(" + url + ")");
                break;
            case "box":
                var boxEl = htmlDocument.createElement('div');
                boxEl.className = 'jsr-element jsr-box';
                boxEl.style.backgroundColor = getStringPropertyValue.call(this, props, 'background_color', row, 'transparent');
                boxEl.style.borderColor = getStringPropertyValue.call(this, props, 'border_color', row, 'transparent');
                boxEl.style.borderRadius = (props.corner_radius || 0) + "px";
                boxEl.style.borderStyle = "solid";
                let borderThicknessPts = 1;
                if (typeof props.borderThickness !== 'undefined') {
                    borderThicknessPts = props.borderThickness;
                }
                boxEl.style.borderWidth = `${borderThicknessPts}pt`;
                $elt = $(boxEl);
                break;
            case "barcode":
                $elt = $('<div class="jsr-element jsr-barcode"></div>');
                render_barcode.call(this, $elt, props, row, pivot_context);
                break;
            case 'break':
                // Do nothing; these are handled in render_section and not rendered
                return;
            case 'subreport':
                var subreportEl = htmlDocument.createElement('div');
                subreportEl.className = 'jsr-element jsr-subreport';
                subreportEl.style.marginTop = props.top_px + 'px';
                subreportEl.style.left = (this.relative_x ? (left * this.pct_per_px).toFixed(2) + "%" : (left + 'px'));
                subreportEl.style.width = (this.relative_x ? (props.width_px * this.pct_per_px).toFixed(2) + "%" : (props.width_px + 'px'));
                subreportEl.style.height = 'auto';
                $elt = $(subreportEl);
                deferred_render.push({ fn: renderSubreport.bind(this), args: [ props, $elt, row ] });
                break;
            case 'table':
                $elt = $('<div class="jsr-element jsr-table"></div>');
                $elt.css('min-height', props.height_px);
                render_table.call(this, $elt, props, row, pivot_context);
                break;
            case 'chart_pie':
                /* falls through */
            case 'chart_line':
                /* falls through */
            case 'chart_bar':
                $elt = $("<div>").addClass("jsr-element jsr-chart");
                $elt.width(props.width_px).height(props.height_px);
                deferred_render.push({ fn: render_chart, args: [ props, $elt, row ] });
                break;
            default:
                const elClass = this.elementTypes[props.type.toLowerCase()];
                if (!elClass) {
                    return console.error('Unrecognized element type:', props.type);
                }
                /** Eval all formula properties */
                const propKeys = Object.keys(elClass.propTypes);
                props = { ...props };
                inst = new elClass(props);
                inst.getDataSource = getDataSourceForCustomElement.bind(this, row);
                for (let propKeyIx = 0; propKeyIx < propKeys.length; propKeyIx++) {
                    const propKey = propKeys[propKeyIx];
                    const propVal = inst.props[propKey];
                    if (typeof propVal === 'string' && propVal.indexOf('=') === 0) {
                        const type = elClass.propTypes[propKey];
                        let evalFn = null;
                        switch (type) {
                            case PropTypes.number:
                                evalFn = evaluate_property_expression_number;
                                break;
                            case PropTypes.string:
                                evalFn = evaluate_property_expression_string;
                                break;
                            case PropTypes.boolean:
                                evalFn = evaluate_property_expression_boolean;
                                break;
                            default:
                                continue;
                        }
                        inst.props[propKey] = evalFn.call(this, propVal, row, propKey, 
                            elClass.defaultProps[propKey]);
                    }
                }
                if (elClass.isComposite) {
                    /** Composite element is replaced by its children */
                    return inst.getChildElementDefinitions().map(childEl => {
                        childEl.left += props.left;
                        childEl.top += props.top;
                        set_element_px_pos.call(this, childEl, this.pixels_per_unit, this.def.yScaleAdjustment || 1);
                        return render_element.call(this, childEl, row, deferred_render, left_offset, pivot_context);
                    });
                } else {
                    $elt = $(`<div class="jsr-element jsr-custom-element jsr-${props.type}"></div>`);
                    $elt.html(inst.getHtml());
                }
                break;
        }
        if (!$elt) {
            throw new Error(`Unrecognized element type: ${props.type}`);
        }
        if (props.styles) {
            $elt.addClass(props.styles);
        }
        $elt.data(elData);
        var left = leftPx + left_margin_px + (left_offset || 0);
        var domEl = $elt[0];
        domEl.style.marginTop = topPx + 'px';
        domEl.style.left = (this.relative_x ? ((left * this.pct_per_px).toFixed(2) + "%") : (left + 'px'));
        let widthPx = props.width_px;
        let heightPx = props.height_px;
        if (swapDimensions) {
            widthPx = props.height_px;
            heightPx = props.width_px;
        }
        domEl.style.width = (this.relative_x ? 
            ((widthPx * this.pct_per_px).toFixed(2) + "%")
            : (widthPx + 'px'));
        if (props.type === 'table' || props.type === 'subreport') {
            domEl.style.height = 'auto';
        } else if (props.fit_content === "vertical") {
            domEl.style.height = 'auto';
            domEl.style.minHeight = heightPx + 'px';
        } else {
            domEl.style.height = heightPx + 'px';
        }
        if (props.zIndex) {
            domEl.style.zIndex = Number(props.zIndex);
        }
        if (inst && inst.afterRender) {
            inst.afterRender(domEl);
            if (this.renderingToPDF && inst.convertToPDF) {
                // Note have to render to outer target here because contentDomEl is not attached
                // Replace initial rendering with primitive elements for PDF
                const primitiveElDefs = inst.convertToPDF(domEl);
                return primitiveElDefs.map(childEl => {
                    childEl.left += props.left;
                    childEl.top += props.top;
                    set_element_px_pos.call(this, childEl, this.pixels_per_unit, this.def.yScaleAdjustment || 1);
                    return render_element.call(this, childEl, row, deferred_render, left_offset, pivot_context);
                });
            }
        }
        return {
            domEl: domEl,
            elt: props
        };
    }

    function renderSubreport(eltDef, $elt, dataRow) {
        if (!eltDef.report) return;
        ditto.subreportcount = (ditto.subreportcount || 0) + 1;
        var root = (this.isSubreport ? this.root : this);
        var subreportWidthCss = $elt[0].style.width;
        var subreportWidthPx = parseFloat(subreportWidthCss);
        if (subreportWidthCss.indexOf('%') > -1) {
            subreportWidthPx /= this.pct_per_px;
        }
        var newViewer = {
            isSubreport: true,
            viewerId: ++viewerId,
            depth: (this.isSubreport ? this.depth : 0) + 1,
            root: root,
            targetWidth: subreportWidthPx,
            imageUrlPrefix: this.imageUrlPrefix,
            translations: this.translations,
            settings: this.settings,
            rowStack: this.rowStack.concat([ dataRow ]),
            customElements: this.customElements,
            customFunctions: this.customFunctions
        };
        root.allSubreportViewers.push(newViewer);
        if (eltDef.linkFields && dataRow) {
            var filterValue = dataRow[eltDef.linkParentField];
            if (typeof filterValue === 'undefined') {
                filterValue = '';
            }
            newViewer.subreportFilter = {
                field: eltDef.linkChildField,
                operand: filterValue,
                operator: 'is'
            };
        }
        this.subreportsRendering = (this.subreportsRendering || 0) + 1;
        $(newViewer).on('report_rendered', onSubreportRendered.bind(this));
        render_report.call(newViewer, eltDef.report, $elt, true);
    }

    function onSubreportRendered() {
        if (--this.subreportsRendering === 0) {
            $(this).trigger('subreports_rendered');
        }
    }

    // Convert a *1-based* row and cell index to A1, C3, etc.
    function get_excel_cell_name(row_ix, col_ix) {
        var dividend = col_ix,
            col_alpha = "",
            modulus;
        while (dividend > 0) {
            modulus = (dividend - 1) % 26;
            col_alpha = String.fromCharCode(65 + modulus) + col_alpha;
            dividend = Math.floor((dividend - modulus) / 26);
        }
        return col_alpha + String(row_ix);
    }

    function convert_element_to_excel(elt, elt_def, excel_row, excel_row_ix, excel_start_col_ix, excel_end_col_ix) {
        var url, pic, picRef;
        switch (elt_def.type) {
            case "text":
                var excel_formatter = this.excel_styles_by_elt_id[elt_def.id];
                if (!excel_formatter) {
                    var font_style = {
                        bold: !!elt_def.bold,
                        underline: !!elt_def.underline,
                        italic: !!elt_def.italic
                    };
                    if (elt_def.fontsize) {
                        font_style.size = elt_def.fontsize;
                    }
                    if (elt_def.font && elt_def.font.name) {
                        font_style.fontName = elt_def.font.name;
                    }
                    if (elt_def.text_color) {
                        font_style.color = elt_def.text_color.replace('#', '');
                    }
                    var format_cfg = {
                        font: font_style,
                        alignment: {
                            wrapText: true,
                            vertical: 'top'
                        }
                    };
                    if (elt_def.pattern) {
                        format_cfg.format = elt_def.pattern;
                    }
                    if (elt_def.align) {
                        format_cfg.alignment.horizontal = elt_def.align;
                    }
                    excel_formatter = this.excel_stylesheet.createFormat(format_cfg);
                    this.excel_styles_by_elt_id[elt_def.id] = excel_formatter;
                }
                excel_row[excel_start_col_ix] = {
                    value: elt.text(),
                    metadata: { 
                        style: excel_formatter.id, 
                        type: 'string', 
                        align: elt_def.align || null,
                        endCol: excel_end_col_ix 
                    }
                };
                break;
            case "image":
                if (!this.excel_drawings) {
                    this.excel_drawings = new ExcelDrawings();
                }
                this.excelImageCount = (this.excelImageCount || 0) + 1;
                url = elt.data('image-url');
                var jpegDataUri = ditto.imageToDataUri(url);
                jpegDataUri = jpegDataUri.substr(jpegDataUri.indexOf(',') + 1);
                picRef = this.excel_workbook.addMedia('image', String(this.excelImageCount) + '.jpg', jpegDataUri);
                pic = new ExcelDrawingsPicture();
                // Adjust height to preserve aspect ratio by default, regardless of the element height
                var tmpImage = new Image();
                tmpImage.src = url;
                var naturalAspectRatio = tmpImage.width / tmpImage.height;
                pic.createAnchor('oneCellAnchor', {
                    x: excel_start_col_ix,
                    y: excel_row_ix,
                    width: ExcelPositioning.pixelsToEMUs(elt_def.width_px), //* EXCEL_WIDTH_UNITS_PER_PX, // ditto.ExcelPositioning.pixelsToEMUs(elt.width_px),
                    height: ExcelPositioning.pixelsToEMUs(elt_def.width_px / naturalAspectRatio) //elt.height_px * EXCEL_WIDTH_UNITS_PER_PX //ditto.ExcelPositioning.pixelsToEMUs(elt.height_px)
                });
                pic.setMedia(picRef);
                this.excel_drawings.addDrawing(pic);
                break;
            case "box":
                break;
            case "barcode":
                break;
            case "chart_line":
                /* falls through */
            case "chart_bar":
                /* falls through */
            case "chart_pie":
                if (!this.excel_drawings) {
                    this.excel_drawings = new ExcelDrawings();
                }
                this.excelImageCount = (this.excelImageCount || 0) + 1;
                var chartDataUri = ditto.svgToDataUri(elt.find('svg')[0], elt_def.width_px, elt_def.height_px, 'jpg');
                chartDataUri = chartDataUri.substr(chartDataUri.indexOf(',') + 1);
                picRef = this.excel_workbook.addMedia('image', String(this.excelImageCount) + '.jpg', chartDataUri);
                pic = new ExcelDrawingsPicture();
                pic.createAnchor('oneCellAnchor', {
                    x: excel_start_col_ix,
                    y: excel_row_ix,
                    width: ExcelPositioning.pixelsToEMUs(elt_def.width_px),
                    height: ExcelPositioning.pixelsToEMUs(elt_def.height_px)
                });
                pic.setMedia(picRef);
                this.excel_drawings.addDrawing(pic);
                break;
            case "table":

                break;
        }
    }

    function force_load_all_images($container, done) {
        var loading = 0;
        var uniqueSrcs = {};
        function onImageDoneLoading() {
            if (--loading === 0) {
                done.call(this);
            }
        }
        var $imgs = $container.find('div.jsr-image');
        if ($imgs.length > 0) {
            $imgs.each(function(index, img) {
                var imgUrl = $(img).data("image-url");
                if (uniqueSrcs[imgUrl]) return;
                var tmpImage = new Image();
                tmpImage.onload = onImageDoneLoading;
                tmpImage.onerror = onImageDoneLoading;
                loading++;
                tmpImage.src = imgUrl;
                uniqueSrcs[imgUrl] = true;
            });
        } else {
            done.call(this);
        }
    }

    function render_barcode($elt, elt_def, row, pivot_context) {
        let type = elt_def.barcode_type,
            width = elt_def.width_px,
            height = elt_def.height_px;
        $elt.empty().removeClass("qrcode");
        if (type === "QR") {
            // QR code wants to be rendered directly into a <div>
            var min_dimension = Math.min(width, height);
            new QRCode($elt[0], {
                text: evaluate_string.call(this, elt_def.value, row, null, pivot_context),
                width: min_dimension,
                height: min_dimension
            });
            $elt.addClass("qrcode");
        } else {
            const barcodeVal = evaluate_string.call(this, elt_def.value, row, null, pivot_context);
            const fontSize = Math.max(16, Math.floor(height / 10));
            renderBarcode($elt[0], type, barcodeVal, Boolean(elt_def.show_value), fontSize);
        }
    }

    function prevent_subreport_overlap(subreportDomEls) {
        var count = subreportDomEls.length;
        if (count < 2) return;
        var posns = [];
        var moved = {};
        var lastOverlapsFound = 1;
        var previousOverlapsFound = -1;
        var defs = [];
        for (var i = 0, len = subreportDomEls.length; i < len; i++) {
            defs[defs.length] = $(subreportDomEls[i]).data('jsr-def');
        }
        while (lastOverlapsFound > 0 && lastOverlapsFound !== previousOverlapsFound) {
            previousOverlapsFound = lastOverlapsFound;
            lastOverlapsFound = 0;
            for (var si = 0; si < count; si++) {
                for (var sj = 0; sj < count; sj++) {
                    if (si !== sj) {
                        var iEl = subreportDomEls[si];
                        var jEl = subreportDomEls[sj];
                        var iDef = defs[si];
                        var jDef = defs[sj];
                        var ipos = posns[si] || (posns[si] = get_element_pos(iEl, iDef));
                        var jpos = posns[sj] || (posns[sj] = get_element_pos(jEl, jDef));
                        if (!((ipos.left + ipos.width < jpos.left) || (jpos.left + jpos.width < ipos.left)
                            || (ipos.top + ipos.height < jpos.top) || (jpos.top + jpos.height < ipos.top)))
                        {
                            // Overlap
                            lastOverlapsFound++;
                            if (iDef.top_px >= jDef.top_px) {
                                posns[si].top = (jpos.top + jpos.height + 1);
                                moved[si] = true;
                            } else {
                                posns[sj].top = (ipos.top + ipos.height + 1);
                                moved[sj] = true;
                            }
                        }                        
                    }
                }
            }
        }
        var movedIxes = Object.keys(moved);
        var moves = [];
        var maxBottom = 0;
        for (var i = 0; i < movedIxes.length; i++) {
            var ix = Number(movedIxes[i]);
            moves.push({
                el: subreportDomEls[ix],
                top: posns[ix].top
            });
            maxBottom = Math.max(maxBottom, posns[ix].top + posns[ix].height);
            // subreportDomEls[ix].style.top = String(posns[ix].top) + 'px';
        }
        return moves ? {
            moves: moves,
            maxBottom: maxBottom
        } : null;
    }

    function get_element_pos(el, def) {
        return {
            top: def.top_px,
            left: def.left_px,
            width: el.offsetWidth,
            height: el.offsetHeight
        };
    }
    
    function formatJSValue(val, formatStr) {
        var jsType = typeof (val);
        switch (jsType.toLowerCase()) {
            case "number":
                return format_number(val, formatStr);
            case "object":
                if (val instanceof Date) {
                    return format_date(val, formatStr);
                }
                /** falls through */
            default:
                return format_string_default(val);
        }
    }

    /** Single-quote an unquoted fieldname inside an aggregate in an expression */
    function replaceUnquotedFieldNames(expr) {
        return expr.replace(UNQUOTED_AGGREGATE_FIELDNAME_REGEX, function(match, g1, g2) {
            return g1 + '(\'' + g2 + '\')';
        });
    }

    /** Evaluate an expression, e.g. "=2 * BillingRate", returning a string */
    function eval_calculation(expr, row, format_str, rootData) {
        var me = this;
        expr = expr.substr(1);
        var val = null;
        try {
            const evaluation_result = evalJSExpression.call(this, expr, row, rootData);
            val = formatJSValue.call(this, evaluation_result, format_str);
        } catch(e) {
            var err = String(e);
            if (err.indexOf("Error: ") === 0) {
                err = err.substring(7);
            }
            val = "ERROR: " + err;
        }
        return val;
    }

    function evalJSExpression(expr, scope, rootData) {
        let compiled_fn = this.compiled_js_expressions[expr];
        if (!this.expressionFunctions) {
            this.expressionFunctions = getExpressionFunctions.call(this);
        }
        const keys = Object.keys(scope);
        for (var i = 0; i < keys.length; i++) {
            const key = keys[i];
            const safeKey = key.replace(/\W+/g, '_');
            if (key !== safeKey) {
                scope[safeKey] = scope[key];
            }
        }
        this.currentAggregateDomain = scope['___children___'] || rootData || [];
        var extendedScope = $.extend({ 
                settings: this.settings || {},
                _PARAMS: this.current_input_values || {}
            }, 
            this.current_input_values || {}, 
            scope, 
            this.expressionFunctions);
        if (!compiled_fn) {
            expr = replaceUnquotedFieldNames(expr);
            compiled_fn = new Function("with (this) { return (" + expr + "); }");
            this.compiled_js_expressions[expr] = compiled_fn;
        }
        return compiled_fn.call(extendedScope);
    }

    /** Extract a single field name or dot-separated subfield from a row */
    function getFieldValue(row, fieldPath) {
        // const parts = fieldPath.replace(/\[(\d+)\]/gi, '.$1').split('.');
        const parts = fieldPath.split('.');
        const len = parts.length;
        let val = row;
        let i = 0;
        while (i < len && val) {
            val = val[parts[i++]];
        }
        return val;
    }

    /**
     * Evaluate a bracket-expression inside a text field
     * e.g.
     * 1. My name is [name]     <- inserts field "name" value into text
     * 2. [=qty * price]        <- multiplies "qty" field * "price" field
     * 3. [SUM(qty)]            <- compute group aggregate on field name
     * 4. [SUM(qty * price)]    <- calculate expression and aggregate results over group
     * 5. [PAGE_NUMBER]         <- built-in variables, some applicable only to certain sections
     */
    function eval_bracket_expression(format_str, entire_template, pivot_context, rootData, match, literal_open_bracket, literal_close_bracket, expr) {
        if (literal_open_bracket) {
            return '[';
        }
        if (literal_close_bracket) {
            return ']';
        }
        // Look for structure of expression
        if (expr.length === 0) return '';
        var row = this.current_row,
            is_calc = (expr.charAt(0) === '='),
            // grouped_rows = (pivot_context ? pivot_context.child_rows : (row ? row["___children___"] : null)),
            grouped_rows = (row ? row["___children___"] : null),
            is_grouped = row && grouped_rows && (typeof(grouped_rows) !== "undefined"),
            val = '',
            i;
        if (is_calc) {
            // case 2
            val = eval_calculation.call(this, expr, row, format_str, rootData);
        } else {
            var aggr_match = expr.match(AGGREGATE_REGEX);
            if (aggr_match && aggr_match.length > 1) {
                var rowsToAggregate = grouped_rows;
                if (!is_grouped) {
                    if (!row['___level___'] && rootData) {
                        // Row is top-level, no grouping in effect -> promote to "over all" by default
                        rowsToAggregate = rootData;
                    } else {
                        return t('ERROR: Aggregate not supported in detail section when grouping in effect');
                    }
                }
                // case 4
                var aggr_fn = aggr_match[1].toLowerCase(),
                    aggr_expr = aggr_match[2];
                try {
                    val = compute_aggregate.call(this, aggr_fn, aggr_expr, rowsToAggregate);
                    val = format_number(val, format_str);
                } catch(e) {
                    val = String(e);
                }
            } else if (expr.charAt(0) === '?') {
                const inputName = expr.substr(1);
                val = this.current_input_values[inputName.toLowerCase()];
            } else {
                // Not a calc, not an aggregate, so: single fieldname/path in brackets
                val = getFieldValue(row, expr);
                if (typeof val === 'undefined') {
                    if (is_grouped && grouped_rows.length > 0 && grouped_rows[0].hasOwnProperty(expr)) {
                        // case 1 but look for value from first grouped row
                        val = grouped_rows[0][expr];
                    } else if (expr === "PAGE_NUMBER") {
                        val = "{{JSR_PRINT_PAGE_NUMBER}}";
                    } else if (expr === "PAGE_COUNT") {
                        val = "{{JSR_PRINT_PAGE_COUNT}}";
                    } else {
                        if (this.active_schema && find_field_by_name(this.active_schema, expr)) {
                            // Field exists in schema, treat as null
                            return '';
                        }
                        return t("FIELD_NOT_FOUND: {field}", { field: expr });
                    }
                }
                if (format_str && val && entire_template === "[" + expr + "]") {
                    var schema_field, value_type, parse_date_format = DEFAULT_DATE_PARSE_FORMAT;
                    if (this.active_schema && (schema_field = find_field_by_name(this.active_schema, expr))) {
                        value_type = schema_field.type.toLowerCase();
                        if (schema_field.dateFormat) {
                            parse_date_format = schema_field.dateFormat;
                        }
                    } else {
                        value_type = (typeof val).toLowerCase();
                    }
                    switch (value_type) {
                        case "number":
                            val = format_number(val, format_str);
                            break;
                        case "date":
                            val = format_date(moment(val, parse_date_format), format_str);
                            break;
                        default:
                            val = format_string_default(val);
                    }
                }
            }
        }
        if (val === null) {
            val = '';
        }
        return val;
    }

    function compute_aggregate(aggFn, aggExpr, rows) {
        var is_single_fieldname = (rows.length > 0 
            && rows[0].hasOwnProperty(aggExpr));
        var sum;
        var compiled_fn;
        var raw_val;
        var count;
        var i;
        let vals;
        switch(aggFn) {
            case "sum":
                sum = 0;
                if (is_single_fieldname) {
                    for (i = 0; i < rows.length; i++) {
                        sum += Number(rows[i][aggExpr]);
                    }
                } else {
                    compiled_fn = this.compiled_calculations[aggExpr];
                    if (!compiled_fn) {
                        compiled_fn = this.parser.parse(aggExpr);
                        this.compiled_calculations[aggExpr] = compiled_fn;
                    }
                    for (i = 0; i < rows.length; i++) {
                        sum += Number(compiled_fn.evaluate(rows[i]));
                    }
                }
                return sum;
            case "average":
                sum = 0;
                count = 0;
                if (is_single_fieldname) {
                    for (i = 0; i < rows.length; i++) {
                        raw_val = rows[i][aggExpr];
                        if (raw_val !== null) {
                            sum += Number(raw_val);
                            count++;
                        }
                    }
                } else {
                    compiled_fn = this.compiled_calculations[aggExpr];
                    if (!compiled_fn) {
                        compiled_fn = this.parser.parse(aggExpr);
                        this.compiled_calculations[aggExpr] = compiled_fn;
                    }
                    for (i = 0; i < rows.length; i++) {
                        sum += Number(compiled_fn.evaluate(rows[i]));
                        count++;
                    }
                }
                return sum / count;
            case "min":
                var min = null;
                if (is_single_fieldname) {
                    for (i = 0; i < rows.length; i++) {
                        raw_val = rows[i][aggExpr];
                        if (raw_val !== null) {
                            min = (min === null ? Number(raw_val) : Math.min(min, Number(raw_val)));
                        }
                    }
                } else {
                    compiled_fn = this.compiled_calculations[aggExpr];
                    if (!compiled_fn) {
                        compiled_fn = this.parser.parse(aggExpr);
                        this.compiled_calculations[aggExpr] = compiled_fn;
                    }
                    for (i = 0; i < rows.length; i++) {
                        val = Number(compiled_fn.evaluate(rows[i]));
                        min = (min === null ? val : Math.min(min, val));
                    }
                }
                return min;
            case "max":
                var max = null;
                if (is_single_fieldname) {
                    for (i = 0; i < rows.length; i++) {
                        raw_val = rows[i][aggExpr];
                        if (raw_val !== null) {
                            max = (max === null ? Number(raw_val) : Math.max(max, Number(raw_val)));
                        }
                    }
                } else {
                    compiled_fn = this.compiled_calculations[aggExpr];
                    if (!compiled_fn) {
                        compiled_fn = this.parser.parse(aggExpr);
                        this.compiled_calculations[aggExpr] = compiled_fn;
                    }
                    for (i = 0; i < rows.length; i++) {
                        val = Number(compiled_fn.evaluate(rows[i]));
                        max = (max === null ? val : Math.max(max, val));
                    }
                }
                return max;
            case "count":
                count = 0;
                if (is_single_fieldname) {
                    for (i = 0; i < rows.length; i++) {
                        raw_val = rows[i][aggExpr];
                        if (raw_val !== null) {
                            count++;
                        }
                    }
                } else {
                    compiled_fn = this.compiled_calculations[aggExpr];
                    if (!compiled_fn) {
                        compiled_fn = this.parser.parse(aggExpr);
                        this.compiled_calculations[aggExpr] = compiled_fn;
                    }
                    for (i = 0; i < rows.length; i++) {
                        if (Boolean(compiled_fn.evaluate(rows[i]))) {
                            count++;
                        }
                    }
                }
                return count;
            case "median":
                if (is_single_fieldname) {
                    vals = rows.map(r => r[aggExpr] === null ? null : Number(r[aggExpr]));
                } else {
                    compiled_fn = this.compiled_calculations[aggExpr];
                    if (!compiled_fn) {
                        compiled_fn = this.parser.parse(aggExpr);
                        this.compiled_calculations[aggExpr] = compiled_fn;
                    }
                    vals = rows.map(r => Number(compiled_fn.evaluate(r)));
                }
                vals = vals.filter(v => v !== null);
                if (vals.length > 0) {
                    const midIx = Math.floor(vals.length / 2);
                    if (vals.length % 2) {
                        // odd
                        return vals[midIx];
                    }
                    // even
                    return (vals[midIx - 1] + vals[midIx]) / 2;
                }
                return null; // empty set
            case "countdistinct":
                count = 0;
                const seenObjs = [];
                const seenPrimitives = {};
                const isDistinct = (val) => {
                    if (val === null) return false;
                    if (typeof val === 'object') {
                        if (val !== null && seenObjs.indexOf(val) < 0) {
                            seenObjs.push(val);
                            return true;
                        }
                    } else {
                        const str = String(val);
                        if (!seenPrimitives[str]) {
                            seenPrimitives[str] = true;
                            return true;
                        }
                    }
                    return false;
                }
                if (is_single_fieldname) {
                    for (i = 0; i < rows.length; i++) {
                        raw_val = rows[i][aggExpr];
                        if (isDistinct(raw_val)) {
                            count++;
                        }
                    }
                } else {
                    compiled_fn = this.compiled_calculations[aggExpr];
                    if (!compiled_fn) {
                        compiled_fn = this.parser.parse(aggExpr);
                        this.compiled_calculations[aggExpr] = compiled_fn;
                    }
                    for (i = 0; i < rows.length; i++) {
                        if (isDistinct(compiled_fn.evaluate(rows[i]))) {
                            count++;
                        }
                    }
                }
                return count;                
            case "sumdistinct":
                if (is_single_fieldname) {
                    vals = _.pluck(rows, aggExpr);
                } else {
                    compiled_fn = this.compiled_calculations[aggExpr];
                    if (!compiled_fn) {
                        compiled_fn = this.parser.parse(aggExpr);
                        this.compiled_calculations[aggExpr] = compiled_fn;
                    }
                    vals = rows.map(r => compiled_fn.evaluate(r));
                }
                const distinct = _.uniq(vals);
                return distinct.reduce((total, val) => total + (val || 0), 0);
            default: 
                return t('Unsupported aggregate function: {function}', { "function": aggFn });
                break;
        }

    }

    function format_number(val, format_str) {
        if (format_str) {
            if (format_str === '#.##0,00') {
                return accounting.formatNumber(val, 2, '.', ',');
            }
            try {
                return SSF.format(format_str, val);
            } catch(e) {
                return t('ERROR: Unsupported format: {format}', { format: format_str });
            }
        }
        return accounting.formatNumber(val, 2);
    }

    function format_date(val, format_str) {
        var jsDate = moment(val).toDate();
        var timezoneOffset = jsDate.getTimezoneOffset() / (60 * 24);
        var msDateObj = (jsDate.getTime() / 86400000) + (25569 - timezoneOffset);
        return SSF.format(format_str || DEFAULT_DATE_FORMAT, msDateObj);
    }

    function format_string_default(val) {
        var valtype = typeof(val);
        switch (valtype) {
            case "string":
                return String(val);
            case "number":
                return accounting.formatNumber(val, 2);
            case "object":
                /* falls through */
            default:
                return String(val);
        }
    }
    
    function evaluate_string(template, row, format_str, pivot_context, rootData) {
        // [open bracket][optional group of non-bracket chars followed by openbracket-nonbracketchars*-closebracket][optional group of nonbracket chars][close bracket]
        this.current_row = row;
        return template.replace(/(\[\[)|(\]\])|\[([^\]]*)\]/gi, eval_bracket_expression.bind(this, format_str, template, pivot_context, rootData || null));
    }

    function parse_number(numberstr) {
        if ((typeof numberstr).toLowerCase() === "string") {
            return Number(numberstr.replace(/[^0-9\.]+/g, ""));
        }
        return Number(numberstr);
    }

    function render_chart(elt, $target, row) {
        var me = this;
        const animate = (this.outputSupportsAnimation !== false && elt.animate !== false);
        function chartError(msg) {
            $target.empty().append($('<span class="jsr-chart-error">').text(msg));          
        }
        // Display error if no value field specified
        if (!elt.series || elt.series.length < 1 || !elt.series[0] || !elt.series[0].value_field) {
            return chartError(t('Chart is missing value field'));
        }
        var chart_data;
        // var chart_data_is_grouped = false;
        if (!elt.data && !row['___children___']) {
            return chartError(`Chart must be placed in a group header or footer, or have a separate data source provided`);
        }
        var dataSource = getDataSourceForElement.call(this, elt, row);
        if (dataSource.error) {
            return chartError(dataSource.error);
        }
        var chart_data = dataSource.data;
        // var chart_data_is_grouped = dataSource.isGrouped;   

        // If there's another grouping below this level, group the rows for the chart
        // if (depth < this.def.body.sublevels.length - 1) {
        //  var next_level_def = this.def.body.sublevels[depth + 1],
        //      next_level_has_grouping = (next_level_def.group_by !== null && typeof(next_level_def.group_by) !== "undefined");
        //  if (next_level_has_grouping) {
        //      chart_data = group_rows.call(this, chart_data, next_level_def, depth + 1, this.def);
        //      chart_data_is_grouped = true;
        //  }
        // }

        // Re-group children, if specified
        if (elt.groupBy) {
            chart_data = group_rows.call(this, chart_data, elt.groupBy);
        }

        // ctx.fillStyle = "#FFFFFF";
        // ctx.fillRect(0, 0, $target.width(), $target.height());
        // Can't read dimensions from DOM because we are rendering detached
        // In general, cannot read dimensions from DOM - must track widths & heights from root down
        var widthPx = elt.width_px;
        var heightPx = elt.height_px;
        var value_field, label_field, value_is_aggregated, svg, myChart, data, colorField;
        var chartType = elt.type.substr(6); // text following "chart_"
        var valueFieldIsExpr = false;
        const $renderTarget = $('<div class="jsr-chart-render-container"></div>')
            .width(widthPx)
            .height(heightPx);
        $(document.body).append($renderTarget);
        $target.addClass('jsr-chart-' + chartType);
        switch(chartType) {
            case "pie":
                value_field = elt.series[0].value_field;
                valueFieldIsExpr = value_field.indexOf('=') === 0;
                label_field = elt.series[0].label_field;
                colorField = elt.series[0].color_field || null;
                // value_is_aggregated = (chart_data_is_grouped && (typeof chart_data[0][value_field] === "undefined"));
                var colors = ["#4D4D4D", "#5DA5DA", "#FAA43A", "#60BD68", "#F17CB0", "#B2912F", "#B276B2", "#DECF3F", "#F15854"],
                    generate_legend = (elt.legend !== false);
                data = chart_data.map(function(r) {
                    var chartrow = {};
                    var val;
                    // if (value_is_aggregated) {
                    //  val = 0;
                    //  var children = r["___children___"];
                    //  for (var j = 0; j < children.length; j++) {
                    //      val += parse_number(children[j][value_field]);
                    //  }
                    // } else {
                    if (valueFieldIsExpr) {
                        val = eval_calculation.call(me, value_field, r, null);
                    } else {
                        val = parse_number(r[value_field]);
                    }
                    // }
                    chartrow[value_field] = val;
                    // var slice = { 
                    //  value: val, 
                    //  color: colors[i++]
                    // };
                    if (label_field) {
                        if (typeof r[label_field] === "undefined" && r["___children___"].length > 0) {
                            chartrow[label_field] = r["___children"][0][label_field];
                        } else {
                            chartrow[label_field] = r[label_field];
                        }
                    }
                    if (colorField) {
                        chartrow[colorField] = r[colorField];
                    }
                    return chartrow;
                });
                svg = dimple.newSvg($renderTarget[0], widthPx, heightPx);
                myChart = new dimple.chart(svg, data);
                var legendWidth = generate_legend ? Math.max(0, Math.min(130, widthPx * 0.25)) : 0;
                myChart.setBounds(20, 20, Math.max(0, widthPx - legendWidth - 30), Math.max(heightPx - 40, 0));
                myChart.addMeasureAxis('p', value_field);
                var sliceCategoryField = label_field || value_field;
                myChart.addSeries(sliceCategoryField, dimple.plot.pie);
                if (colorField) {
                    data.forEach(function(chrow) {
                        myChart.assignColor(chrow[sliceCategoryField], chrow[colorField]);
                    });
                }
                if (generate_legend) {
                    myChart.addLegend(widthPx - legendWidth, 20, legendWidth, Math.max(heightPx - 40, 0), "left");
                }
                myChart.ease = 'bounce';
                myChart.draw(animate ? (elt.initialAnimationMs || DEFAULT_CHART_ANIMATION_MS) : 0);
                break;
            case "line":
                /* falls through */
            case "bar":
                value_field = elt.series[0].value_field;
                valueFieldIsExpr = value_field.indexOf('=') === 0;
                label_field = elt.x_axis ? elt.x_axis.label_field : null;
                const y_axis_title = (elt.y_axis && elt.y_axis.title) ? 
                    elt.y_axis.title : value_field;
                // value_is_aggregated = (chart_data_is_grouped && (typeof chart_data[0][value_field] === "undefined"));
                var label_field_from_schema = (label_field && this.active_schema && find_field_by_name(this.active_schema, label_field));
                var label_field_is_date = (label_field_from_schema && label_field_from_schema.type 
                    && label_field_from_schema.type.toLowerCase() === 'date');
                var labels = [];
                // Label field can't come from within a group
                var value_is_string = (chart_data.length > 0 
                    && (typeof chart_data[0][value_field]).toLowerCase() === "string");
                var data = chart_data.map(function(r, i) {
                    var chartrow = {};
                    var val;
                    if (valueFieldIsExpr) {
                        val = eval_calculation.call(me, value_field, r, null);
                    } else {
                        val = parse_number(r[value_field]);
                    }
                    if (label_field) {
                        chartrow[label_field] = r[label_field];
                    } else {
                        chartrow['x'] = i + 1;
                    }
                    chartrow[value_field] = val;
                    return chartrow;
                });
                svg = dimple.newSvg($renderTarget[0], widthPx, heightPx);
                myChart = new dimple.chart(svg, data);
                const topLegendHeight = 30;
                let xAxisLabelHeight = 40;
                if (elt.x_axis && typeof elt.x_axis.labelHeight !== 'undefined') {
                    xAxisLabelHeight = Number(elt.x_axis.labelHeight) * this.pixels_per_unit;
                }
                myChart.setBounds(80, topLegendHeight, widthPx - 80, 
                    heightPx - topLegendHeight - xAxisLabelHeight);
                if (label_field_is_date) {
                    myChart.addTimeAxis('x', label_field, undefined, '%Y-%m-%d');
                } else {
                    var xAxis = myChart.addCategoryAxis("x", label_field || 'x');
                    if (!label_field) {
                        xAxis.title = '';
                    }
                }
                var yAxis = myChart.addMeasureAxis("y", value_field);
                yAxis.title = y_axis_title;
                myChart.addSeries(null, (elt.type === "chart_line" ? dimple.plot.line : dimple.plot.bar));
                myChart.addLegend(65, 10, widthPx - 80, 20, "right");
                $target.data('xAxisLabelHeight', xAxisLabelHeight);
                myChart.draw(animate ? (elt.initialAnimationMs || DEFAULT_CHART_ANIMATION_MS) : 0);
                wrapChartLabelText.call(this, 
                    $renderTarget, 
                    xAxisLabelHeight);
                break;
        }
        if (myChart) {
            register_chart.call(this, myChart, elt, $target);
        }
        $target.append($renderTarget.find('svg'));
        $renderTarget.remove();
    }

    function wrapChartLabelText($chartEl, width) {
        $chartEl.find('.dimple-axis-x .tick text').each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
                y = text.attr("y"),
                x = text.attr('x'),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null)
                    .append("tspan").attr("x", x).attr("y", y)
                    .attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan")
                        .attr("x", x).attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
                }
            }
        }); 
    }        

    function register_chart(chart, def, $el) {
        var root = this.root || this;
        if (!root.charts) {
            root.charts = [];
        }
        root.charts.push({
            chart: chart,
            def: def,
            $el: $el
        });
    }

    const findDataSourceById = (id, currentRow) => {
        let error = null;
        let data = null;
        if (Array.isArray(id)) {
        } else if (typeof id === 'string') {
            if (id === '__parentgroup') {
                if (currentRow['___children___']) {
                    data = currentRow["___children___"];
                } else {
                    data = [ currentRow ];
                }
            }
            // Look first for an array-valued property on the current row
            else if (currentRow[id] && Array.isArray(currentRow[id])) {
                data = currentRow[id];
            } else {
                // Otherwise look for an outside data source by this id
                data = datasets[id.toLowerCase()];
                if (typeof(data) === "undefined" || !data) {
                    error = t('Missing dataset with ID "{id}"', { id: id });
                }
            }
        } else {
            error = t('Invalid data supplied for element');
        }
        return {
            data: data,
            error: error
        };
    }

    function getDataSourceForElement(elt, currentRow) {
        var data = null;
        var isGrouped = false;
        var error = null;
        const dataProp = elt.data || elt.dataSource;
        if (dataProp) {
            ({ data, error } = findDataSourceById(dataProp, currentRow));
        } else {
            // Use the child rows of the current grouping
            // Display error if not in group section
            if (currentRow['___children___']) {
                data = currentRow["___children___"];
            } else {
                error = t('No data available - place element in a header or footer section, or specify a separate data source.');
            }
            // depth = row["___level___"],
            // level_def = this.def.body.sublevels[depth],
            // grouping = (level_def.group_by !== null && typeof(level_def.group_by) !== "undefined"),
            isGrouped = false;
        }
        return {
            data: data,
            isGrouped: isGrouped,
            error: error
        };
    }

    function getDataSourceForCustomElement(currentRow, dataSourceId) {
        let { data, error } = findDataSourceById(dataSourceId, currentRow);
        if (error) return null;
        return data;
    }

    function render_table($elt, tableDef, row, pivot_context) {
        var me = this;
        var dataSource = getDataSourceForElement.call(this, tableDef, row);
        if (dataSource.error) {
            return $elt.text(dataSource.error);
        }
        var tableData = dataSource.data;
        var $table = $('<table></table>');
        var tableFontSize = null;
        var ppi = this.pixels_per_unit * (this.def.page.units === 'inches' ? 1 : 25.4);
        if (this.scaleFonts === false) {
            ppi = 72;
        }
        if (tableDef.fontSize) {
            $table.css('font-size', (tableDef.fontSize * ppi / 72).toFixed(2) + 'pt');
        }
        if (tableDef.groupBy) {
            tableData = group_rows.call(this, tableData, tableDef.groupBy);
        }
        if (tableDef.hasHeader !== false) {
            var $thead = $('<thead></thead>');
            var $tr = $('<tr></tr>');
            $thead.append($tr);
            tableDef.columns.forEach(function(colDef) {
                $tr.append(render_table_cell.call(me, row, colDef.header || '', colDef, colDef.headerStyle, 'th', dataSource.data, tableDef));
            });
            $table.append($thead);
        }
        var $tbody = $('<tbody></tbody>');
        $table.append($tbody);
        render_table_rows.call(this, tableData, $tbody, tableDef);
        if (tableDef.hasFooter !== false) {
            var $tfoot = $('<tfoot></tfoot>');
            var $tr = $('<tr></tr>');
            $tfoot.append($tr);
            tableDef.columns.forEach(function(colDef) {
                $tr.append(render_table_cell.call(me, row, colDef.footer || '', colDef, colDef.footerStyle, null, dataSource.data, tableDef));
            });
            $table.append($tfoot);
        }
        $elt.append($table);
    }

    function render_table_rows(dataRows, $tbody, tableDef) {
        if (tableDef.sortBy) {
            const sortBy = Array.isArray(tableDef.sortBy) ? tableDef.sortBy : [ tableDef.sortBy ];
            for (let i = sortBy.length - 1; i >= 0; i--) {
                dataRows = _.sortBy(dataRows, sortBy[i]);
            }
        }
        if (tableDef.sortDir && tableDef.sortDir === 'desc') {
            dataRows = dataRows.reverse();
        }
        dataRows.forEach(function(dataRow) {
            if (dataRow['___children___']) {
                // For grouped rows, render header and footer for group
                // Group header defaults to true
                if (tableDef.hasGroup0Header !== false) {
                    var $tr = render_table_row.call(this, dataRow, $tbody, tableDef, 'group0Header');
                    $tr.addClass('jsr-table-group-0-header');
                }
                render_table_rows.call(this, dataRow['___children___'], $tbody, tableDef);
                // Group footer defaults to false
                if (tableDef.hasGroup0Footer) {
                    var $tr = render_table_row.call(this, dataRow, $tbody, tableDef, 'group0Footer');
                    $tr.addClass('jsr-table-group-0-footer');
                }
                return;
            }
            // Render detail row
            if (tableDef.hideRowWhenExpr) {
                var hide = jsepEval(tableDef.hideRowWhenExpr, dataRow);
                if (hide) return;
            }
            var $tr = render_table_row.call(this, dataRow, $tbody, tableDef, 'detail', dataRows);
        }.bind(this));
    }

    function render_table_row(dataRow, $tbody, tableDef, rowName, allRows) {
        var unicodeNbsp = ' ';
        var me = this;
        var styleName = rowName + 'Style';
        var $tr = $('<tr></tr>');
        tableDef.columns.forEach(function(colDef) {
            $tr.append(render_table_cell.call(me, dataRow, 
                colDef[rowName] || unicodeNbsp, colDef, colDef[styleName], 
                null, allRows, tableDef));
        });
        $tbody.append($tr);
        return $tr;
    }

    function markdownToHtml(mdText) {
        // Don't allow HTML in Markdown (for now)
        mdText = mdText
            .replace(/</gm, '&lt;')
            .replace(/>/gm, '&gt;')
            .replace(/\\n/gm, '<br>');
        if (!this.markdownConverter) {
            this.markdownConverter = new showdown.Converter({
                strikethrough: true
            });
        }
        let textHtml = this.markdownConverter.makeHtml(mdText);
        // if (textHtml.startsWith('<p>') && textHtml.endsWith('</p>')) {
        //     textHtml = textHtml.substring(3, textHtml.length - 4);
        // }
        textHtml = textHtml.replace(/\n\<li\>/gim, '<li>');
        textHtml = textHtml.replace(/\n\<\/ul\>/gim, '</ul>');
        return textHtml;
    }

    const firstDefined = (...vals) => vals.find(v => v !== undefined);

    function render_table_cell(dataRow, cellDef, colDef, style, cellTag, allRows, tableProps) {
        var htmlDocument = ditto.window.document;
        let align = colDef.align;
        let backColor = null;
        let foreColor = null;
        const hasCellDef = (typeof cellDef === 'object');
        let props = hasCellDef ? cellDef : null;
        if (props && props.conditionalRules && props.conditionalRules.length > 0) {
            props = _.extend({}, props);
            evaluateConditionalRules.call(this, props, dataRow);
        }
        var $td = $(htmlDocument.createElement(cellTag || 'td'))
            .width(colDef.width || 'auto');
        if (props) {
            align = props.align || align;
            if (props.backgroundColor) {
                $td.css('background-color', props.backgroundColor);
            }
            if (props.textColor) {
                $td.css('color', props.textColor);
            }
            if (props.italic) {
                $td.css('font-style', 'italic');
            }
            if (props.bold) {
                $td.css('font-weight', 'bold');
            }
            ['Top', 'Left', 'Bottom', 'Right'].forEach(side => {
                const borderWidth = props[`border${side}Width`] || tableProps[`cellBorder${side}Width`];
                const borderColor = props[`border${side}Color`] || tableProps[`cellBorder${side}Color`];
                if (typeof borderWidth !== 'undefined') {
                    $td.css({
                        [`border-${side.toLowerCase()}-width`]: `${borderWidth}pt`,
                        'border-style': 'solid'
                    });
                }
                if (typeof borderColor !== 'undefined') {
                    $td.css(`border-${side.toLowerCase()}-color`, borderColor);
                }
                const padding = firstDefined(props[`padding${side}`], tableProps[`cellPadding${side}`]);
                if (padding !== undefined) {
                    $td.css(`padding-${side.toLowerCase()}`, `${Number(padding) * this.pixels_per_unit}px`);
                }
            });
            if (props.cssClass) {
                $td.addClass(props.cssClass);
            }
            const wrap = firstDefined(props[`wrap`], tableProps[`cellWrap`]);
            if (wrap === false) {
                $td.css({
                    'white-space': 'pre',
                    'overflow': 'hidden',
                    'text-overflow': 'ellipsis'
                });
            } else {
                $td.css({
                    'white-space': 'pre-wrap'
                });
            }
        }
        const textExpr = props ? props.text : cellDef;
        var text = evaluate_string.call(this, textExpr || '', dataRow, 
            style ? style.pattern : null, null, allRows);
        const isMarkdown = props && props.syntax === 'markdown';
        if (isMarkdown) {
            $td.html(markdownToHtml.call(this, text)).addClass('jsr-markdown');
        } else {
            $td.text(text.replace(/\\n/gim, '<br>'));
        }
        if (align) {
            $td.css('text-align', align);
        }
        $td.data('jsr-cell-style', {
            align: align,
            pattern: style ? style.pattern : null
        });
        return $td;
    }
    
    function do_deferred_render(deferred) {
        deferred.fn.apply(this, deferred.args);
    }

    function require_properties(obj, property_names, location) {
        property_names.forEach(function(requiredProperty) {
            if (typeof obj[requiredProperty] === "undefined") {
                throw new Error("Missing required property \"" + requiredProperty + "\" in " + location);
            }
        });
    }

    /**
     * Provide some feedback if the supplied report definition is in the wrong format
     */
    function validate_def(def) {
        var type = (typeof def).toLowerCase();
        if (type === "string") {
            try {
                def = JSON.parse(def);
            } catch(e) {
                throw new Error("Error: failed to parse report definition string: " + e);
            }
        } else if (type !== "object") {
            throw new Error("Error: expected report definition type to be object or string, got " + type + " instead");
        }
        ["page", "body"].forEach(function(requiredProp) {
            if (!def.hasOwnProperty(requiredProp)) {
                throw new Error("Report definition object missing required property: " + requiredProp);
            }
        });
        var cloned_def = $.extend(true, {}, def);
        const allElements = getAllElements(cloned_def);
        // Apply any provided element defaults to all template elements
        if (def.elementDefaults) {
            allElements.map(elt => {
                const eltType = elt.type.toLowerCase();
                if (def.elementDefaults[eltType]) {
                    // Do this in two steps to modify existing element in-place
                    const withDefaults = _.extend({}, def.elementDefaults[eltType], elt);
                    _.extend(elt, withDefaults);
                }
            });
        }
        allElements.map(elt => {
            if (elt.type.toLowerCase() === 'text') {
                const text = elt.text || '';
                if (text.indexOf('PAGE_NUMBER') >= 0
                    || text.indexOf('PAGE_COUNT') >= 0) 
                {
                    elt.__hasPageNumber = true;
                }
            }
        });
        // If version < 1.2.9 then y-axis values are in template pixels and need adjustment
        // Unfortunately, since the original aspect ratio is not available, we have to make
        // a guess.  If the report is opened in the designer and re-saved, from then on the
        // correct aspect ratio will be preserved.
        if (ditto.version_less_than(cloned_def.version, "1.2.9")) {
            var guessed_template_y_pixels = 1000,
                units = cloned_def.page.units,
                paper_height = cloned_def.page.paper_size[units][1],
                y_units_per_pixel = paper_height / guessed_template_y_pixels;
            cloned_def.yScaleAdjustment = y_units_per_pixel;
        }
        return cloned_def;
    }

    function create_export_wrapper() {
        var htmlDocument = ditto.window.document;
        var $exportWrapper = $('<div class="jsr-export-wrapper"><div class="jsr-export-target"></div></div>');
        $exportWrapper.css({
            position: "absolute",
            top: 0,
            left: 0,
            width: "1px",
            height: "1px",
            overflow: "hidden"
        });
        $(htmlDocument.body).append($exportWrapper);
        var $exportTarget = $exportWrapper.find(".jsr-export-target");
        $exportTarget.css({
            width: "1000px",
            overflow: "visible"
        });
        return $exportWrapper;
    }

    /** Extract any referenced data sources from a report, including subreports */
    function findDataSources(defNode, dsList) {
        if (!dsList) dsList = [];
        Object.keys(defNode).forEach(function(key) {
            var val = defNode[key];
            if ((['data_source', 'data', 'dataSource', 'optionSource'].indexOf(key) >= 0) && val 
                && (typeof val === 'string') && val !== '__parentgroup')
            {
                dsList.push({
                    id: val,
                    required: (key === 'data_source')
                });
            }
            if (val && typeof val === 'object') {
                findDataSources(val, dsList);
            }
        });
        return dsList;
    }

    /** Reduce a list of datasets to only those referenced by the report */
    function onlyReferencedDatasets(datasets, def) {
        var needed = {};
        findDataSources(def).forEach(function(dsRef) { 
            needed[dsRef.id.toLowerCase()] = dsRef;
        });
        datasets.forEach(ds => {
            if (!!ds.required) {
                needed[ds.id.toLowerCase()] = {
                    id: ds.id,
                    required: true
                };
            }
        });
        // console.log('needed are', Object.keys(needed).join(', '));
        var found = [];
        var priorFoundCount = -1;
        const requireDs = (id) => {
            const lower = id.toLowerCase();
            var alreadyReferenced = needed[lower];
            if (alreadyReferenced) {
                alreadyReferenced.required = true;
            } else {
                needed[lower] = {
                    id: id,
                    required: true
                };
            }
        };
        // Expand to include data sources referenced by joins
        while (Object.keys(needed).length > 0 && priorFoundCount !== found.length) {
            priorFoundCount = found.length;
            datasets.forEach(function(ds) {
                var idLower = (ds.id || '').toLowerCase();
                if (needed[idLower]) {
                    // If join, work on a clone bc we may need to flag 'discardSources'
                    var dsToPush = ds.join ? { ...ds } : ds;
                    delete needed[idLower];
                    if (ds.join && ds.join.left && ds.join.right) {
                        var sourcesReferencedElsewhere = (needed[ds.join.left.toLowerCase()] 
                            || needed[ds.join.right.toLowerCase()]);
                        if (!sourcesReferencedElsewhere) {
                            dsToPush.discardSources = true;
                        }
                        [ds.join.left, ds.join.right].map(requireDs);
                    }
                    if (ds.requires) {
                        ds.requires.map(requireDs);
                    }
                    found.push(dsToPush);
                }
            });
        }
        var missingIds = Object.keys(needed).filter(function(dsId) {
            return needed[dsId].required;
        });
        if (missingIds.length > 0) {
            throw new Error('Couldn\'t find required data source' 
                + (missingIds.length > 1 ? '(s)' : '') + ': ' 
                + missingIds.map(function(idLower) { 
                    return needed[idLower].id;
                  }).join(', '));
        }
        return found;
    }

    function validateDatasets(dsConfigs) {
        if (!Array.isArray(dsConfigs)) {
            throw new Error(`Invalid datasets configuration: expected array, got ${typeof dsConfigs}`);
        }
        const requireOneOf = ['data', 'url', 'extjsStore', 'join', 'requires'];
        dsConfigs.forEach(ds => {
            if (typeof ds !== 'object') {
                throw new Error(`Invalid dataset configuration: expected object, got ${typeof ds}: ${String(ds)}`);
            }
            ['id'].forEach(prop => {
                if (!ds[prop] || typeof ds[prop] !== 'string') {
                    throw new Error(`Invalid dataset configuration: missing required property "${prop}" of type "string"`);
                }
            });
            if (!requireOneOf.find(required => !!ds[required])) {
                throw new Error(`Invalid dataset configuration: dataset requires one of: ${requireOneOf.map(s => '"' + s + '"').join(', ')}`);
            }
        });
    }
    
    return /** @lends ditto */ {

        /**
         * Render a report into an HTML element on the page.
         *
         * @param options {object} - Configuration object with the following options
         * @param options.report_def {object} - JavaScript object representing a ditto report definition, or a JSON string that can be parsed into such an object.
         * @param options.datasets {array} - JavaScript array defining the data sources that can be used by the report.
         *      Any data source referenced by the report definition must be present in this array.
         * @param options.target {DOMElement} - The target DOM element into which the report will be rendered
         * @param [options.showToolbar=true] {boolean} - Whether to show the report toolbar (default: true)
         * @param [options.imageUrlPrefix] {string} - Prefix to prepend to all image URLs in the report
         */     
        render: function(cfg) {
            const viewer = Object.assign({}, ditto);
            require_properties.call(viewer, cfg, ["report_def", "datasets", "target"], `${productName}.render`);
            validateDatasets.call(viewer, cfg.datasets);
            viewer.imageUrlPrefix = cfg.imageUrlPrefix;
            viewer.def = validate_def.call(viewer, cfg.report_def);
            viewer.showToolbar = (cfg.showToolbar !== false); // showToolbar defaults to true
            viewer.functions = (cfg.functions || {});
            viewer.relative_x = (!!cfg.autoResizeX);  // this now defaults to FALSE
            viewer.scaleFonts = (cfg.scaleFonts !== false);   // scaleFonts defaults to true
            viewer.enableVirtualRender = !!cfg.enableVirtualRender;
            viewer.virtualRenderScrollDelayMs = cfg.virtualRenderScrollDelayMs || null;
            viewer.showPageHeaderAndFooter = !!cfg.showPageHeaderAndFooter;
            viewer.preserveViewOnExport = !!cfg.preserveViewOnExport;//(cfg.preserveViewOnExport !== false);
            viewer.settings = cfg;
            viewer.translations = cfg.translations || null;
            viewer.customElements = cfg.customElements || [];
            viewer.customFunctions = cfg.customFunctions || {};
            viewer.allowPDFFontEmbedding = cfg.allowPDFFontEmbedding;
            viewer.saveFormats = cfg.saveFormats || ['pdf', 'xlsx'];
            var $target = $(cfg.target);
            if ($target.length === 0) {
                throw new Error("Target element not found");
            }
            // Set this early here because we may need to handle a resize while datasets are loading
            viewer.$target = $target;
            clear_datasets.call(viewer);
            var neededDatasets = onlyReferencedDatasets.call(viewer, cfg.datasets, viewer.def);
            ditto.data.loadDatasets.call(viewer, neededDatasets, datasets, schemas, false, function() {
                render_report.call(viewer, viewer.def, $target);
            });
            return viewer;
        },

        /**
         * Export a report directly to file.
         *
         * @param {object} options - Configuration object with the following options
         * @param {object} options.report_def - Report definition object (or JSON string)
         * @param {array} options.datasets - Array of data source definitions available for the report
         * @param {string} options.format - Output format; one of "pdf", "xlsx"
         * @param {string} options.filename - The filename to use when downloading.  Defaults to the report title.
         * @param {object} [options.customFunctions] - The filename to use when downloading.  Defaults to the report title.
         * @param {string} [options.imageUrlPrefix] - Prefix to prepend to all image URLs in the report
         * @param {Function} [options.outputHandler] - Function that will receive the binary output data instead of downloading via the browser
         */ 
        export: function(cfg) {
            const exporter = Object.assign({}, 
                cfg.exportCurrentView ? this : ditto);
            require_properties.call(exporter, cfg, ["format", "datasets", "report_def"], `${productName}.export`);
            if (!EXPORT_FORMATS[cfg.format.toLowerCase()]) {
                throw new Error("Unrecognized format for ditto.export: " + cfg.format);
            }
            validateDatasets.call(exporter, cfg.datasets);
            exporter.outputSupportsAnimation = false;
            exporter.imageUrlPrefix = cfg.imageUrlPrefix;
            exporter.def = validate_def.call(exporter, cfg.report_def);
            exporter.showToolbar = true;
            exporter.functions = (cfg.functions || {});
            exporter.translations = cfg.translations || null;
            exporter.customElements = cfg.customElements || [];
            exporter.customFunctions = cfg.customFunctions || {};
            exporter.settings = cfg;
            exporter.allowPDFFontEmbedding = cfg.allowPDFFontEmbedding;
            exporter.saveFormats = cfg.saveFormats || ['pdf', 'xlsx'];
            var requestedFormat = exporter.outputFormat = cfg.format.toLowerCase();
            // Have to render to HTML initially to load images with dynamic URLs
            if (requestedFormat === "xlsx") {
                // Default to HTML
                delete exporter.outputFormat;
            }
            exporter.relative_x = (!!cfg.autoResizeX);  // this now defaults to FALSE
            exporter.scaleFonts = (cfg.scaleFonts !== false);   // scaleFonts defaults to true
            // Render into one-pixel div with overflow hidden
            clear_datasets.call(exporter);
            var neededDatasets = onlyReferencedDatasets.call(exporter, cfg.datasets, exporter.def);
            ditto.data.loadDatasets.call(exporter, neededDatasets, datasets, schemas, false, function() {
                switch (requestedFormat) {
                    case 'xlsx':
                        export_xlsx.call(exporter, cfg.filename, cfg.outputHandler, cfg.target);
                        break;
                    case 'pdf':
                        if (cfg.exportCurrentView) {
                            exportCurrentViewToPDF.call(exporter, cfg.filename, cfg.outputHandler, cfg.target);
                        } else {
                            renderAndExportPDF.call(exporter, cfg.filename, cfg.outputHandler, cfg.target);
                        }
                        break;
                    default:
                        throw new Error('Unsupported export format: ' + cfg.format + '.  Supported formats are: pdf, xlsx');
                }
            });
        },

        print: function(cfg) {
        },

        /**
         * Return the currently edited report definition object.
         */
        getReportDefinition: function() {
            return this.def || null;
        },

        setReport: function(report) {
            if (this === ditto) throw new Error('No viewer present - use ditto.render() to retrieve a viewer first');
            this.def = validate_def.call(this, report);
            if (this.showToolbar && this.$toolbar_el) {
                this.$toolbar_el.empty();
                render_inputs.call(this, this.def, this.$toolbar_el);
                $events.trigger("toolbarRendered", [ this, this.$toolbar_el[0] ]);
            }
            refresh_report.call(this);
        },

        /**
         * Return the current data sources, including any loaded data.
         */
        getDatasets: function() {
            var ds = [];
            Object.keys(datasets).forEach(function(dsid) {
                ds.push({
                    id: dsid,
                    schema: schemas[dsid],
                    data: datasets[dsid]
                });
            });
            return ds;
        },

        /**
         * Return the current data source schemas.
         */
        getSchemas: function() {
            return $.extend({}, schemas);
        },

        on: function() {
            $events.on.apply($events, arguments);
        },

        once: function() {
            $events.one.apply($events, arguments);
        },

        /** 
         * Register a font face (a family, and optionally weight and style) for PDF font embedding.
         *
         * @param {string} family - The font family, e.g. Helvetica
         * @param {string} weight - The font weight, one of "normal" or "bold"
         * @param {string} style - The font style, one of "normal" or "italic"
         * @param {string} url - The url of the font's .ttf file
         */
        registerFont: function(family, weight, style, url) {
            if (arguments.length === 2) {
                url = weight;
                weight = 'normal';
                style = 'normal';
            } else if (arguments.length === 3) {
                url = style;
                style = 'normal';
            }
            family = family;
            weight = weight.toLowerCase();
            style = style.toLowerCase();
            requireOneOf(weight, ['normal', 'bold'], 'Font weight');
            requireOneOf(style, ['normal', 'italic'], 'Font style');
            // Allowed modifiers are normal, italic, bold, bolditalic
            var modifier = 'normal';
            if (style === 'italic') {
                modifier = (weight === 'bold' ? 'bolditalic' : 'italic');
            } else if (weight === 'bold') {
                modifier = 'bold';
            }
            var fontKey = family.toLowerCase() + '-' + modifier;
            if (!customFonts[fontKey]) {
                customFonts[fontKey] = {
                    family: family,
                    weight: weight,
                    style: style,
                    combinedStyle: modifier,
                    url: url
                };
            }
        },

        /** 
         * Enable references to a font by font name in PDF without embedding the
         * font file.  WARNING: This will result in unpredictable results when the
         * PDF is viewed on systems that do not contain the named font.
         * Unless there is a good reason, you should use registerFont instead to
         * embed an actual font file in the resulting PDF.
         * @example
         * ditto.registerFontReference('Comic Sans');
         */
        registerFontReference: function(family) {
            extraFontReferences[family.toLowerCase()] = {
                name: family,
                psName: family.replace(/\s/g, '')
            };
        },

        resize: resize

    };

})());

return ditto;

};
