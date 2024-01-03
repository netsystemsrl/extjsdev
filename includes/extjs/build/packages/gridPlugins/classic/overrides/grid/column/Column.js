/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
/**
 * @class Ext.grid.column.Column
 */
Ext.define('Ext.overrides.grid.column.Column', {
    override: 'Ext.grid.column.Column',

    config: {
        /**
         * @cfg {String} groupFormatter
         * This config accepts a format specification as would be used in a `Ext.Template`
         * formatted token. For example `'round(2)'` to round numbers to 2 decimal places
         * or `'date("Y-m-d")'` to format a Date.
         *
         * It is used by the {@link Ext.grid.plugin.GroupingPanel} plugin when adding groupers
         * to the store. When you drag a column from the grid to the grouping panel then the `groupFormatter`
         * will be used to create a new store grouper {@link Ext.util.Grouper#formatter}.
         *
         * **Note:** if summaries are calculated on the server side then the server
         * side grouping should match the client side formatter otherwise the
         * summaries may be wrong.
         */
        groupFormatter: false,
        /**
         * @cfg {Object/String[]} summaries
         * This config is used by {@link Ext.grid.plugin.Summaries} plugin.
         *
         * Define here what functions are available for your users to choose from
         * when they want to change the summary type on this column. By default only
         * `count` is supported but you can add more summary functions.
         *
         *      {
         *          xtype: 'column',
         *          summaries: {
         *              sum: true,
         *              average: true,
         *              count: false
         *          }
         *      }
         *
         *  Or like this if you want to bring new functions in:
         *
         *      {
         *          xtype: 'column',
         *          summaries: {
         *              calculateSomething: true
         *          }
         *      }
         *
         *  In such case `calculateSomething` needs to be defined as a summary function.
         *  For this you need to define a summary class like this:
         *
         *      Ext.define('Ext.data.summary.CalculateSomething', {
         *          extend: 'Ext.data.summary.Base',
         *          alias: 'data.summary.calculateSomething',
         *
         *          text: 'Calculate something',
         *
         *          calculate: function (records, property, root, begin, end) {
         *              // do your own calculation here
         *          }
         *      });
         *
         *
         */
        summaries: {
            $value: {
                count: true
            },
            lazy: true,
            merge: function (newValue, oldValue) {
                return this.mergeSets(newValue, oldValue);
            }
        }
    },

    /**
     * @cfg {Boolean} groupable
     * False to disable grouping of this column.
     */
    groupable: false,

    /**
     * @param {Ext.data.summary.Base}
     *
     * This function is called by {@link Ext.grid.plugin.Summaries} plugin
     * when the summary on this column is changed.
     *
     * It is quite useful when you need to change the column summary renderer/formatter
     * depending on the chosen summary.
     */
    onSummaryChange: null,

    /**
     * Returns an array of summary functions supported on this column.
      * @return {String[]}
     */
    getListOfSummaries: function() {
        var ret = [],
            v = this.getSummaries() || {},
            keys = Ext.Object.getAllKeys(v),
            len = keys.length,
            i, key;

        // we need to extract 'true' summaries from the object
        for(i = 0; i < len; i++) {
            key = keys[i];
            if(v[key]) {
                ret.push(key);
            }
        }

        return ret;
    },

    applySummaries: function (newValue, oldValue) {
        var config = this.self.getConfigurator().configs.summaries;
        return config.mergeSets(newValue);
    }


});