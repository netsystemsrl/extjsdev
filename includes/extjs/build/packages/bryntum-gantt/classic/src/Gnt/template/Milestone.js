/**
@class Gnt.template.Milestone
@extends Ext.XTemplate

Class used to render a milestone task.
*/
Ext.define("Gnt.template.Milestone", {
    extend : 'Gnt.template.Template',

    /**
     * @cfg {String} innerTpl The template defining the inner visual markup for the milestone task.
     */
    innerTpl :
        '<img unselectable="on" ' +
            'style="<tpl if="print">height: {side}px; border-left-width: {side}px; </tpl>{style}" ' +
            'src="' + Ext.BLANK_IMAGE_URL + '" ' +
            'class="sch-gantt-milestone-diamond {cls}" />',

    getInnerTpl : function (cfg) {
        return '<div id="' + cfg.prefix + '{id}" {attr} class="sch-gantt-item sch-gantt-milestone-diamond-ct">' +

            this.innerTpl +

            '<tpl if="isRollup">' +
            '<tpl else>' +
            // Dependency terminals
            (cfg.enableDependencyDragDrop ? this.dependencyTerminalMarkup : '') +
            '</tpl>' +

            '</div>';
    }
});