/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.grid.plugin.grouping.DragZone', {
    extend: 'Ext.dd.DragZone',

    groupColumnSelector: '.' + Ext.baseCSSPrefix + 'grid-group-column',
    groupColumnInnerSelector: '.' + Ext.baseCSSPrefix + 'grid-group-column-inner',
    maxProxyWidth:      120,
    dragging:           false,
    
    constructor: function(panel) {
        var me = this;
        
        me.panel = panel;
        me.ddGroup =  me.getDDGroup();
        me.callParent([panel.el]);
    },

    getDDGroup: function() {
        // return the column header dd group so we can allow column droping inside the grouping panel
        return 'header-dd-zone-' + this.panel.up('[scrollerOwner]').id;
		
		//var header = this.panel.up('gridpanel').headerCt || this.panel.up('gridpanel').getHeader();
        //return 'header-dd-zone-' + this.panel.up('gridpanel').getHeader().up('[scrollerOwner]').id;
    },

    getDragData: function(e) {
        if (e.getTarget(this.groupColumnInnerSelector)) {
            var header = e.getTarget(this.groupColumnSelector),
                headerCmp,
                headerCol,
                ddel;

            if (header) {
                headerCmp = Ext.getCmp(header.id);
                headerCol = Ext.getCmp(headerCmp.idColumn);
                
                if (!this.panel.dragging) {
                    ddel = document.createElement('div');
                    ddel.innerHTML = headerCmp.getHeader();
                    return {
                        ddel: ddel,
                        header: headerCol,
                        groupcol: headerCmp
                    };
                }
            }
        }
        return false;
    },

    onBeforeDrag: function() {
        return !(this.panel.dragging || this.disabled);
    },

    onInitDrag: function() {
        this.panel.dragging = true;
        this.callParent(arguments);
    },
    
    onDragDrop: function() {
        var me = this;
        
        if(!me.dragData.dropLocation){
            me.panel.dragging = false;
            me.callParent(arguments);
            return;
        }
        
        /*
            when a column is dragged out from the grouping panel we have to do the following:
            1. remove the column from grouping panel
            2. adjust the grid groupers
        */
        var dropCol = me.dragData.dropLocation.header, 
            groupCol = me.dragData.groupcol;

        if(dropCol.isColumn){
            me.panel.removeColumn(groupCol);
        }

        me.panel.dragging = false;
        me.callParent(arguments);
    },

    afterRepair: function() {
        this.callParent();
        this.panel.dragging = false;
    },

    getRepairXY: function() {
        return this.dragData.header.el.getXY();
    },
    
    disable: function() {
        this.disabled = true;
    },
    
    enable: function() {
        this.disabled = false;
    }

});