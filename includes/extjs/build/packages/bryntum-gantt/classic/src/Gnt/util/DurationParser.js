/**
 * @class Gnt.util.DurationParser
 * @private
 * Internal class handling the duration parsing.
 *
 *  Recognizable values for duration unit part are (the trailing `..` symbols means anything will match):
 *
 * - Milliseconds: `ms` or `mil..`
 * - Seconds: `s` or `sec..`
 * - Minutes: `m` or `min..`
 * - Hours: `h` or `hr` or `hour..`
 * - Days: `d` or `day..`
 * - Weeks: `w` or `wk` or `week..`
 * - Months: `mo..` or `mnt..`
 * - Quarters: `q` or `quar..` or `qrt..`
 * - Years: `y` or `yr..` or `year..`
 *
 * You can change that using the {@link #l10n} `unitsRegex` configuration option.
 */
Ext.define("Gnt.util.DurationParser", {
    requires        : ["Sch.util.Date"],

    mixins          : ['Gnt.mixin.Localizable'],

    parseNumberFn   : null,
    durationRegex   : null,

    /*
     * @cfg {Boolean} allowDecimals Set to `false` to disable parsing duration values with decimals component
     */
    allowDecimals   : true,

    /*
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - unitsRegex : {
     *     - MILLI       : /^ms$|^mil/i,
     *     - SECOND      : /^s$|^sec/i,
     *     - MINUTE      : /^m$|^min/i,
     *     - HOUR        : /^h$|^hr$|^hour/i,
     *     - DAY         : /^d$|^day/i,
     *     - WEEK        : /^w$|^wk|^week/i,
     *     - MONTH       : /^mo|^mnt/i,
     *     - QUARTER     : /^q$|^quar|^qrt/i,
     *     - YEAR        : /^y$|^yr|^year/i
     * }
     */

    constructor : function (config) {
        Ext.apply(this, config);

        if (this.unitsRegex) Ext.apply(this.l10n.unitsRegex, this.unitsRegex);

        if (!this.durationRegex) {
            if (this.allowDecimals) {
                this.durationRegex = /^\s*([\-+]?\d+(?:[.,]\d*)?|[\-+]?(?:[.,]\d+))\s*(.*?)(?=\s*$)/i;
            } else {
                this.durationRegex = /^\s*([\-+]?\d+)(?![.,])\s*(.*?)(?=\s*$)/i;
            }
        }
    },

    parse : function (value) {
        var match               = this.durationRegex.exec(value);

        if (value == null || !match) return null;

        var durationValue       = this.parseNumberFn(match[ 1 ]);

        var durationUnitName    = match[ 2 ];
        var durationUnit;

        if (durationUnitName) {
            Ext.iterate(this.L('unitsRegex'), function (name, regex) {

                if (regex.test(durationUnitName)) {
                    durationUnit    = Sch.util.Date.getUnitByName(name);

                    return false;
                }
            });

            if (!durationUnit) return null;
        }

        return {
            value   : durationValue,
            unit    : durationUnit
        };
    }
});
