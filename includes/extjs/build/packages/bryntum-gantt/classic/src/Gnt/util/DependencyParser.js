/**
 * @class Gnt.util.DependencyParser
 * @private
 * Internal class handling the dependency string parsing related functionality. Used by {@link Gnt.field.Dependency} field.
 */
Ext.define('Gnt.util.DependencyParser', {
    requires : [
        'Sch.util.Date',
        'Gnt.util.DurationParser'
    ],

    mixins : ['Gnt.mixin.Localizable'],

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     - typeText :
     - SS : 'SS'
     - SF : 'SF'
     - FS : 'FS'
     - FF : 'FF'
     */

    separator       : /\s*;\s*/,
    parseNumberFn   : null,
    dependencyRegex : null,
    types           : null,

    constructor : function (config) {

        Ext.apply(this, config);

        // fill types array with values
        this.initTypes();

        var typeText = this.L('typeText');

        for (var i = 0; i < this.types.length; i++) {
            this.types[i] = (typeText[this.types[i]] || this.types[i]);
        }

        var re = '(-?\\d+)(' + this.types.join('|') + ')?([\\+\\-].*)?';

        this.dependencyRegex = this.dependencyRegex || new RegExp(re, 'i');

        this.durationParser = new Gnt.util.DurationParser({ parseNumberFn : this.parseNumberFn });
    },

    initTypes : function () {
        this.types = this.types || [
            'SS',   // Start-To-Start     //0
            'SF',   // Start-To-Finish    //1
            'FS',   // Finish-To-Start    //2
            'FF'    // Finish-To-Finish   //3
        ];
    },

    /*
     * Returns an object with the following properties (or null if the parsing fails):
            {
                taskId  : 3,    // Int, always present
                type    : "FS", // String, always present
                lag     : 3,    // Int, optional
                lagUnit : 'd'   // String, optional
            }
    **/
    parse : function (value, defaultType) {
        if (!value) {
            return [];
        }

        var parts  = value.split(this.separator),
            result = [],
            depRe  = this.dependencyRegex;

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];

            // allow ";" at the end of the string - will lead to empty element
            if (!part && i === parts.length - 1) continue;

            var match = depRe.exec(part);
            var data  = {};

            // Tolerate no sloppy input
            if (!match) {
                return null;
            }

            data.taskId = parseInt(match[1], 10);

            data.type = match[2] != null ? Ext.Array.indexOf(this.types, match[2].toUpperCase()) : (defaultType != null ? defaultType : 2); // FS is default

            var lagValue = match[3];

            if (lagValue) {
                var lag = this.durationParser.parse(lagValue);

                if (!lag) {
                    // Tolerate no sloppy input
                    return null;
                }

                data.lag     = lag.value;
                data.lagUnit = lag.unit || Sch.util.Date.DAY;
            }

            result.push(data);
        }

        return result;
    }
});
