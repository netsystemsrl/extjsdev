/**
 * Template class for rendering the task tooltip.
 */
Ext.define("Gnt.template.TaskTooltip", {
    extend   : 'Ext.XTemplate',
    mixins   : ['Gnt.mixin.Localizable'],
    requires : ['Ext.util.Format'],

    dateFormat        : null,
    maxItemsInTooltip : 2,
    overflowTextTpl   : null,
    adjustMilestones  : true,

    /**
     * @cfg {String} markup
     * The tpl markup that will be passed to the Ext.XTemplate.
     * Default `_startText_`, `_endText_`, `_percentText` and `_format_` will be localised in the constructor.
     */
    markup         : [
        '<tpl if="records">',
            '<tpl for="records">',
                '<tpl if="xindex &lt;= _maxItemsInTooltip_">',
                    '_bodyTpl_',
                '</tpl>',
            '</tpl>',
            '<tpl if="records.length &gt; _maxItemsInTooltip_">',
                '<div class="sch-task-tip-extra">',
                '{[this.getOverflowText(values)]}',
                '</div>',
            '</tpl>',
        '<tpl else>',
            '_bodyTpl_',
        '</tpl>'
    ].join(''),

    bodyMarkup : [
        '<h2 class="sch-task-tip-header">{Name:htmlEncode}</h2>',
            '<table class="sch-task-tip">',
            '<tr><td>_startText_:</td> <td align="right">{[this.getStartDateString(values)]}</td></tr>',
            '<tr><td>_endText_:</td> <td align="right">{[this.getEndDateString(values)]}</td></tr>',
            '<tr><td>_percentText_:</td><td align="right">{[this.getPercentDoneString(values)]}%</td></tr>',
        '</table>'
    ].join(''),

    /**
     * Creates new template.
     * @param {String} markup The tpl markup that will be passed to the Ext.XTemplate. Default `_startText_`, `_endText_`, `_percentText` and `_format_` will be localised.
     */
    constructor : function (markup) {

        this.markup = markup || this.markup;

        this.markup = this.markup
            .replace(/_bodyTpl_/g, this.bodyMarkup)
            .replace(/_maxItemsInTooltip_/g, this.maxItemsInTooltip)
            .replace(/_startText_/g, this.L('startText'))
            .replace(/_endText_/g, this.L('endText'))
            .replace(/_percentText_/g, this.L('percentText'));

        this.dateFormat      = this.L('format');
        this.overflowTextTpl = new Ext.XTemplate(this.L('overflowText'));

        this.callParent([this.markup]);
    },

    getStartDateString : function (data) {
        var me    = this,
            task  = data._record,
            store = task.getTaskStore(true),
            date  = data._useBaselineData ? task.getBaselineStartDate() : task.getStartDate();

        if (store && store.disableDateAdjustments) {
            return Ext.util.Format.date(date, me.dateFormat);
        }

        return task.getDisplayStartDate(me.dateFormat, me.adjustMilestones, date, false, data._useBaselineData);
    },

    getEndDateString : function (data) {
        var me    = this,
            task  = data._record,
            store = task.getTaskStore(true),
            date  = data._useBaselineData ? task.getBaselineEndDate() : task.getEndDate();

        if (store && store.disableDateAdjustments) {
            return Ext.util.Format.date(date, me.dateFormat);
        }

        return task.getDisplayEndDate(me.dateFormat, me.adjustMilestones, date, false, data._useBaselineData);
    },

    getPercentDoneString : function(data) {
        var task  = data._record;
        var value = data._useBaselineData ? task.getBaselinePercentDone() : task.getPercentDone();

        return Math.round(value);
    },

    getOverflowText : function (values) {
        if (values.records.length > this.maxItemsInTooltip) {
            return this.overflowTextTpl.apply({
                nbrOverflowing : values.records.length - this.maxItemsInTooltip
            });
        }
    }

});

