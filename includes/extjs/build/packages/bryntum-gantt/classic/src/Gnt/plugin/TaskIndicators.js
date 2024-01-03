/**
 * The plugin allows to render custom indicators to a task row easily.
 * The indicators can be positioned by dates or coordinates.
 * To use this class the one should provide {@link #getIndicators} method either by doing this on the plugin instance level:
 *
 * ```javascript
 * var panel = new Gnt.panel.Gantt({
 *     ...
 *     plugins : [
 *         {
 *             ptype         : 'gantt_taskindicators',
 *
 *             getIndicators : function (task) {
 *                 return Ext.Array.map(task.get('Indicators'), function (data) {
 *                     return {
 *                         date    : Ext.Date.parse(data.Date, 'Y-m-d'),
 *                         iconCls : data.IconCls,
 *                         text    : data.Name,
 *                         tooltip : data.Tooltip
 *                     };
 *                 });
 *             }
 *         }
 *     ]
 * });
 * ```
 *
 * or by extending the class:
 *
 * ```javascript
 * Ext.define("MyCoolPlugin", {
 *     extend : 'Gnt.plugin.TaskIndicators',
 *
 *     alias  : 'plugin.mycoolplugin',
 *
 *     getIndicators : function (task) {
 *         return Ext.Array.map(task.get('Indicators'), function (data) {
 *             return {
 *                 date    : Ext.Date.parse(data.Date, 'Y-m-d'),
 *                 iconCls : data.IconCls,
 *                 text    : data.Name,
 *                 tooltip : data.Tooltip
 *             };
 *         });
 *     }
 * });
 *
 * var panel = new Gnt.panel.Gantt({
 *     ...
 *     plugins : [
 *         "mycoolplugin"
 *     ]
 * });
 * ```
 */
Ext.define('Gnt.plugin.TaskIndicators', {
    extend       : 'Ext.AbstractPlugin',

    alias        : 'plugin.gantt_taskindicators',

    requires     : ['Ext.XTemplate'],

    /**
     * @cfg {Ext.XTemplate/String}
     * Indicator template. In order to add custom properties to the template please override {@link #getTplData} method.
     */
    tpl          : '<label data-qtip="{tooltip:htmlEncode}" data-qalign="{tooltipAlign:htmlEncode}" class="{cls:htmlEncode}" style="{side}:{position}px"><i class="{iconCls:htmlEncode}"></i>{text:htmlEncode}</label>',

    cls          : 'gnt-indicator',

    /**
     * @cfg {String}
     * Default icon CSS class. Used when an indicator "iconCls" is empty.
     */
    iconCls      : 'fa fa-check',

    side         : null,

    /**
     * @cfg {Number}
     * Default icon size. Used when an indicator "iconSize" is not provided.
     */
    iconSize     : 10,

    tooltipAlign : 'b-tl',

    init : function (cmp) {
        this.side = cmp.rtl ? 'right' : 'left';

        if (!this.tpl.isTemplate) {
            this.tpl = Ext.create('Ext.XTemplate', this.tpl);
        }

        cmp.registerRenderer(this.indicatorRenderer, this);

        this.callParent(arguments);
    },

    /**
     * @abstract
     * Returns list of indicators that should be rendered for the task.
     * @param  {Gnt.model.Task} task Task to return indicators for.
     * @return {Object[]} Array of objects describing the task indicators. Each object should have the following properties:
     * @return {Date} return.date Datetime to show the indicator on (alternatively the indicator "position" (see below) can be defined).
     * @return {Number} return.position (optional) The coordinate to show the indicator at (can be used instead of `date`).
     * @return {String} return.text (optional) Indicator text.
     * @return {String} return.tooltip (optional) Indicator tooltip text.
     * @return {String} return.cls (optional) Indicator CSS class.
     * @return {String} return.iconCls (optional) Indicator icon CSS class.
     * @return {Number} return.iconSize (optional) Indicator icon size in pixels. If not provided {@link #iconSize} value is used. The value is used to handle "iconAlign" properly.
     * @return {String} return.iconAlign (optional) Indicator icon align (used with `date` only). Defines the icon alignment relative to `date` coordinate. Possible values are:
     *
     *  - 'left' - (default) the icon left side is aligned with the 'date' coordinate.
     *  - 'right' - the icon right side is aligned with the 'date' coordinate.
     *  - 'middle' - the icon center is aligned with the 'date' coordinate.
     */
    getIndicators : function (task) {
        return [];
    },

    calculateIndicatorPosition : function (indicator) {
        var view     = this.getCmp().getSchedulingView(),
            position = view.getCoordinateFromDate(indicator.date),
            iconSize = Ext.isNumeric(indicator.iconSize) ? indicator.iconSize : this.iconSize;

        // iconAlign == right - means the icon should snap its right border to the date
        // so we extract the icon width from the date coordinate
        if (indicator.iconAlign == 'right') {
            position -= iconSize;
        } else if (indicator.iconAlign == 'middle') {
            position -= iconSize / 2;
        }

        return position;
    },

    /**
     * @protected
     * Provides data for the {@link #tpl indicator template}.
     * @param  {Object} indicator Indicator object (see details on the object structure in {@link #getIndicators} method docs).
     * @return {Object} Template data.
     */
    getTplData : function (indicator) {
        if (indicator.date || indicator.position > 0) {
            var position = indicator.position || this.calculateIndicatorPosition(indicator);

            if (position > 0) {
                return {
                    iconCls      : indicator.iconCls || this.iconCls,
                    text         : indicator.text,
                    tooltip      : indicator.tooltip || '',
                    tooltipAlign : indicator.tooltipAlign || this.tooltipAlign,
                    cls          : this.cls +' '+ (indicator.cls || ''),
                    side         : this.side,
                    position     : position
                };
            }
        }
    },

    indicatorRenderer : function (val, meta, task) {
        var indicators = this.getIndicators(task);

        if (indicators) {
            var renderedIndicators = [];

            // render each indicator
            Ext.each(indicators, function (indicator) {
                var tplData = this.getTplData(indicator);
                // skip ones that shouldn't be rendered (empty tpl data signaling about that)
                tplData && renderedIndicators.push(this.tpl.apply(tplData));
            }, this);

            // return as a single concatenated string
            return renderedIndicators.join('');
        }
    }
});
