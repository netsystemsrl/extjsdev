// @tag dependencies
/**
 * @class Sch.template.DependencyInfo
 * @protected
 *
 * Template showing details of a link between two tasks.
 * This template is given `dependency`, `fromTask` and `toTask` properties that is used for the display of task texts.
 * If `dependency` is undefined, that is potential dependency info used during dependency creation.
 */
Ext.define('Sch.template.DependencyInfo', {
    extend : 'Ext.XTemplate',

    mixins : ['Sch.mixin.Localizable'],

    text :
        '<dl class="sch-dep-tip">' +
            '<tpl if="!values.dependency">' +
                '<div class="' + Ext.baseCSSPrefix + 'fa {[values.valid ? \'fa-check-circle sch-dep-tip-valid\' : \'fa-times-circle sch-dep-tip-invalid\']}"></div>' +
            '</tpl>' +
            '<dt class="sch-dep-tip-from-title">__FROM__:</dt>' +
            '<dd class="sch-dep-tip-from-value">{[Ext.htmlEncode(values.fromTask.getName()) || "&nbsp;"]}</dd>' +
            '<dt class="sch-dep-tip-to-title">__TO__:</dt>' +
            '<dd class="sch-dep-tip-to-value">{[values.toTask && Ext.htmlEncode(values.toTask.getName()) || "&nbsp;"]}</dd>' +
        '</dl>',

    constructor : function () {
        var me = this;

        me.text = me.text.replace(/__FROM__/, me.L('fromText')).replace(/__TO__/, me.L('toText'));

        me.callParent([me.text]);
    }
});
