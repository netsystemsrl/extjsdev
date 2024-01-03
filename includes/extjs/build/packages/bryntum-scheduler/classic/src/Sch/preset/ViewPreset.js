/**
@class Sch.preset.ViewPreset
Not used directly, but the properties below are rather provided inline as seen in the source of {@link Sch.preset.Manager}. This class is just provided for documentation purposes.

A sample preset looks like:

    hourAndDay : {
        timeColumnWidth         : 60,       // Time column width (used for rowHeight in vertical mode)
        rowHeight               : 24,       // Only used in horizontal orientation
        resourceColumnWidth     : 100,      // Only used in vertical orientation

        displayDateFormat       : 'G:i',    // Controls how dates will be displayed in tooltips etc

        shiftIncrement          : 1,        // Controls how much time to skip when calling shiftNext and shiftPrevious.
        shiftUnit               : 'DAY',    // Valid values are 'MILLI', 'SECOND', 'MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'.
        defaultSpan             : 12,       // By default, if no end date is supplied to a view it will show 12 hours

        timeResolution          : {         // Dates will be snapped to this resolution
            unit        : 'MINUTE',         // Valid values are 'MILLI', 'SECOND', 'MINUTE', 'HOUR', 'DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'.
            increment   : 15
        },

        headerConfig            : {         // This defines your header, you must include a 'middle' object, and top/bottom are optional.
            middle      : {                 // For each row you can define 'unit', 'increment', 'dateFormat', 'renderer', 'align', and 'scope'
                unit        : 'HOUR',
                dateFormat  : 'G:i'
            },
            top         : {
                unit        : 'DAY',
                dateFormat  : 'D d/m'
            }
        },

        linesFor                : 'middle'  // Defines header level column lines will be drawn for
    }

See the {@link Sch.preset.Manager} for the list of available presets.

Vertical mode can have multiple columns (one for every level), and you can specify name in header config:

    headerConfig : {
        middle      : {
            unit        : 'HOUR',
            dateFormat  : 'G:i',
            text        : 'second column'
        },
        top         : {
            unit        : 'DAY',
            dateFormat  : 'D d/m',
            text        : 'first column'
        }
    }

## Duration units

There are a number of configs for duration units ({@link #shiftUnit} or `unit` in {@link #timeResolution}, {@link #headerConfig} configs).

When registering a preset using {@link Sch.preset.Manager#registerPreset} method the one can provide their values both using
{@link Sch.util.Date} unit name constant values ({@link Sch.util.Date.DAY}, {@link Sch.util.Date.WEEK} etc.) and using short constants names ('DAY', 'WEEK' etc.):

    Sch.preset.Manager.registerPreset('hour', {
        displayDateFormat : 'G:i',
        shiftIncrement    : 1,
        shiftUnit         : 'DAY',
        timeColumnWidth   : 150,
        timeResolution    : {
            // Here we use Sch.util.Date.MINUTE constant value
            unit      : Sch.util.Date.MINUTE,
            increment : 5
        },
        headerConfig      : {
            middle : {
                // and here we use the last fraction Sch.util.Date.HOUR constant name
                unit       : 'HOUR',
                dateFormat : 'G:i'
            },
            top    : {
                // and here we use the last fraction of Sch.util.Date.DAY constant name
                unit       : 'DAY',
                dateFormat : 'D d/m'
            }
        }
    });

But if the one deals with preset properties on the low level (without calling {@link Sch.preset.Manager#registerPreset} method)
he can use only constant values approach:

    // providing 'MINUTE' won't work, we should use Sch.util.Date.MINUTE constant
    Sch.preset.Manager.get('hour').timeResolution.unit = Sch.util.Date.MINUTE;

*/
Ext.define("Sch.preset.ViewPreset", {
    requires : [
        'Sch.util.Date'
    ],

    /**
     * @cfg {String} name The name of the preset by which it is registered in the Manager
     */

    name                : null,

    /**
     * @cfg {Number} rowHeight The height of the row in horizontal orientation
     */
    rowHeight           : 24,

    /**
     * @cfg {Number} timeColumnWidth The width of the time tick column in horizontal orientation. Also used as height of time tick row
     * in vertical orientation, unless {@link #timeRowHeight} is provided.
     */
    timeColumnWidth     : 50,

    /**
     * @cfg {Number} timeRowHeight The height of the time tick row in vertical orientation. If omitted, a value of {@link #timeColumnWidth}
     * is used.
     */
    timeRowHeight       : null,

    /**
     * @cfg {Number} timeAxisColumnWidth The width of the time axis column in the vertical orientation
     */
    timeAxisColumnWidth : null,

    /**
    * @cfg {String} displayDateFormat Defines how dates will be formatted in tooltips etc
    */
    displayDateFormat   : 'G:i',

    /**
     * @cfg {String} shiftUnit The unit to shift when calling shiftNext/shiftPrevious to navigate in the chart.
     * Valid values are "MILLI", "SECOND", "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR".
     */
    shiftUnit           : "HOUR",

    /**
     * @cfg {Number} shiftIncrement The amount to shift (in shiftUnits)
     */
    shiftIncrement      : 1,

    /**
     * @cfg {Number} defaultSpan The amount of time to show by default in a view (in the unit defined by the middle header)
     */
    defaultSpan         : 12,

    /**
     * @cfg {Object} timeResolution An object containing a unit identifier and an increment variable. Example:
     *
        timeResolution : {
            unit        : "HOUR",  //Valid values are "MILLI", "SECOND", "MINUTE", "HOUR", "DAY", "WEEK", "MONTH", "QUARTER", "YEAR".
            increment   : 1
        }
     *
     */
    timeResolution      : null,

    /**
     * @cfg {Object} headerConfig An object containing one or more {@link Sch.preset.ViewPresetHeaderRow} rows defining how your headers shall be composed.
     * Your 'main' unit should be the middle header unit. This object can contain "bottom", "middle" and "top" header definitions. The 'middle' header is mandatory.
     */
    headerConfig        : null,

    /**
     * @cfg {String} columnLinesFor Defines the header level that the column lines will be drawn for. See {@link Sch.mixin.AbstractTimelinePanel#columnLines}
     */
    columnLinesFor            : 'middle',

    // internal properties
    headers             : null,
    mainHeader          : 0,

    /**
     * @cfg {String} ptype The viewPreset to use and extend when the preset is passed as a config object.
     */
    ptype                : '',

    constructor : function (cfg) {
        Ext.apply(this, cfg);

        this.normalizeUnits();
    },

    normalizeUnits : function() {
        var headerConfig    = this.headerConfig;
        var DATE            = Sch.util.Date;

        // Make sure date "unit" constant specified in the preset are resolved
        for (var o in headerConfig) {
            if (headerConfig.hasOwnProperty(o)) {
                if (DATE[headerConfig[o].unit]) {
                    headerConfig[o].unit = DATE[headerConfig[o].unit.toUpperCase()];
                }

                if (DATE[headerConfig[o].splitUnit]) {
                    headerConfig[o].splitUnit = DATE[headerConfig[o].splitUnit.toUpperCase()];
                }
            }
        }

        var timeResolution  = this.timeResolution;

        // Resolve date units
        if (timeResolution && DATE[ timeResolution.unit ]) {
            timeResolution.unit = DATE[ timeResolution.unit.toUpperCase() ];
        }

        var shiftUnit       = this.shiftUnit;

        // Resolve date units
        if (shiftUnit && DATE[ shiftUnit ]) {
            this.shiftUnit = DATE[ shiftUnit.toUpperCase() ];
        }
    },

    getHeaders : function () {
        if (this.headers) return this.headers;

        var headerConfig        = this.headerConfig;

        this.mainHeader         = headerConfig.top ? 1 : 0;

        return this.headers     = [].concat(headerConfig.top || [], headerConfig.middle || [], headerConfig.bottom || []);
    },

    getMainHeader : function () {
        return this.getHeaders()[ this.mainHeader ];
    },


    getBottomHeader : function () {
        var headers     = this.getHeaders();

        return headers[ headers.length - 1 ];
    },


    clone : function () {
        var config      = {};
        var me          = this;

        Ext.Array.each([
            'rowHeight',
            'timeColumnWidth',
            'timeRowHeight',
            'timeAxisColumnWidth',
            'displayDateFormat',
            'shiftUnit',
            'shiftIncrement',
            'defaultSpan',
            'timeResolution',
            'headerConfig'
        ], function (name) {
            config[ name ] = me[ name ];
        });

        return new this.self(Ext.clone(config));
    },

    isValid : function() {
        var D = Sch.util.Date,
            valid = true,
            validUnits = Sch.util.Date.units,
            ownKeys = {};

        // Make sure all date "unit" constants are valid
        for (var o in this.headerConfig) {
            if (this.headerConfig.hasOwnProperty(o)) {
                ownKeys[o] = true;
                valid = valid && Ext.Array.indexOf(validUnits, this.headerConfig[o].unit) >= 0;
            }
        }

        if (!(this.columnLinesFor in ownKeys)) {
            this.columnLinesFor = 'middle';
        }

        if (this.timeResolution) {
            valid = valid && Ext.Array.indexOf(validUnits, this.timeResolution.unit) >= 0;
        }

        if (this.shiftUnit) {
            valid = valid && Ext.Array.indexOf(validUnits, this.shiftUnit) >= 0;
        }

        return valid;
    }
});
