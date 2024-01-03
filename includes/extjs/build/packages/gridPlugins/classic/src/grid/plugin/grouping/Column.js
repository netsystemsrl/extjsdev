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
 * @private
 */
Ext.define('Ext.grid.plugin.grouping.Column', {
    extend: 'Ext.Component',
    alias: 'widget.groupingpanelcolumn',

    requires: [
        'Ext.menu.Menu',
        'Ext.menu.CheckItem',
        'Ext.menu.Item',
        'Ext.menu.Separator'
    ],

    childEls: ['textCol', 'filterCol', 'sortCol'],

    tabIndex: 0,
    focusable: true,
    isGroupingPanelColumn: true,

    renderTpl:
    '<div id="{id}-configCol" role="button" class="' + Ext.baseCSSPrefix + 'grid-group-column-inner" >' +
    '<span id="{id}-customCol" role="presentation" class="' + Ext.baseCSSPrefix + 'grid-group-column-btn-customize ' + Ext.baseCSSPrefix + 'border-box ' + Ext.baseCSSPrefix + 'grid-group-column-btn ' + Ext.baseCSSPrefix + 'grid-group-column-btn-image"></span>' +
    '<span id="{id}-sortCol" role="presentation" data-ref="sortCol" class="' + Ext.baseCSSPrefix + 'border-box ' + Ext.baseCSSPrefix + 'grid-group-column-btn"></span>' +
    // '<span id="{id}-filterCol" role="presentation" data-ref="filterCol" class="' + Ext.baseCSSPrefix + 'border-box ' + Ext.baseCSSPrefix + 'grid-group-column-btn"></span>' +
    '<span id="{id}-textCol" role="presentation" data-ref="textCol" data-qtip="{header}" class="' + Ext.baseCSSPrefix + 'grid-group-column-text ' + Ext.baseCSSPrefix + 'column-header-text ' + Ext.baseCSSPrefix + 'border-box">' +
    '{header}' +
    '</span>' +
    '</div>',

    maxWidth: 200,

    baseCls: Ext.baseCSSPrefix + 'grid-group-column',
    overCls: Ext.baseCSSPrefix + 'grid-group-column-over',
    cls: Ext.baseCSSPrefix + 'unselectable',

    btnIconCls: Ext.baseCSSPrefix + 'grid-group-column-btn-image',
    btnAscSortIconCls: Ext.baseCSSPrefix + 'grid-group-column-btn-sort-asc',
    btnDescSortIconCls: Ext.baseCSSPrefix + 'grid-group-column-btn-sort-desc',

    config: {
        header: '&#160;',
        grouper: null,
        idColumn: '',
        column: null
    },

    doDestroy: function () {
        this.setGrouper(null);
        this.callParent();
    },

    initRenderData: function () {
        return Ext.apply(this.callParent(arguments), {
            header: this.header
        });
    },

    afterRender: function () {
        this.changeSortCls();
        this.callParent();
    },

    updateGrouper: function (grouper) {
        this.changeSortCls();
    },

    changeSortCls: function () {
        var me = this,
            grouper = me.getGrouper(),
            sortCol = me.sortCol,
            direction;

        if(grouper && sortCol) {
            direction = grouper.getDirection();
            if(direction === 'ASC' || !direction){
                sortCol.addCls(me.btnAscSortIconCls);
                sortCol.removeCls(me.btnDescSortIconCls);
            }else{
                sortCol.addCls(me.btnDescSortIconCls);
                sortCol.removeCls(me.btnAscSortIconCls);
            }
            sortCol.addCls(me.btnIconCls);
        }
    }

});