Ext.define("Gnt.template.RollupTask", {
    extend      : 'Ext.XTemplate',

    text : '<div class="sch-rollup-wrap">' +
        '<tpl for=".">' +
            '{[values.tpl.apply(values)]}' +
        '</tpl>' +
    '</div>',

    constructor : function (cfg) {
        this.callParent([ this.text ]);
    }
});