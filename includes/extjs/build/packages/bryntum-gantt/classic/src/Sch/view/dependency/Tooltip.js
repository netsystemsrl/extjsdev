/**
 * A tooltip for displaying info about a dependency
 * @private
 */
Ext.define('Sch.view.dependency.Tooltip', {
    extend         : 'Ext.tip.ToolTip',
    requires       : ['Sch.template.DependencyInfo'],
    cls            : 'sch-dependency-tip',
    delegate       : '.sch-dependency',
    showDelay      : 0,
    anchor         : 'bottom',
    mouseOffset    : [15, 5],
    trackMouse     : true,
    dependencyView : null,
    tpl            : null,

    initComponent : function () {
        this.target = this.dependencyView.getPrimaryView().getEl();
        this.tpl    = this.tpl || new Sch.template.DependencyInfo();

        this.callParent(arguments);
    },

    show : function () {
        this.callParent(arguments);

        var depRecord = this.dependencyView.getDependencyForElement(this.triggerElement);

        this.setData({
            dependency : depRecord,
            fromTask   : depRecord.getSourceEvent(),
            toTask     : depRecord.getTargetEvent()
        });
    }
});