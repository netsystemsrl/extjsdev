/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.grid.plugin.RowExpander', {
    override: 'Ext.grid.plugin.RowExpander',

    toggleRow: function(rowIdx, record) {
        if(record.isNonData) {
            // do not expand or collapse group headers and summaries
            return;
        }
        this.callParent([rowIdx, record]);
    },

    getHeaderConfig: function() {
        var me = this,
            lockable = me.grid.lockable && me.grid;

        return {
            width: me.headerWidth,
            ignoreExport: true,
            lockable: false,
            autoLock: true,
            sortable: false,
            resizable: false,
            draggable: false,
            hideable: false,
            menuDisabled: true,
            tdCls: Ext.baseCSSPrefix + 'grid-cell-special',
            innerCls: Ext.baseCSSPrefix + 'grid-cell-inner-row-expander',
            renderer: function(value, metaData, record) {
                // return '<div class="' + Ext.baseCSSPrefix + 'grid-row-expander" role="presentation" tabIndex="0"></div>';
                // do not show the expander icon when the record is a group header or summary
                // <fix>
                var cls = Ext.baseCSSPrefix + (record.isNonData ? 'grid-row-non-expander' : 'grid-row-expander');
                return  '<div class="' + cls + '" role="presentation" tabIndex="0"></div>';
                // </fix>
            },
            processEvent: function(type, view, cell, rowIndex, cellIndex, e, record) {
                var isTouch = e.pointerType === 'touch',
                    isExpanderClick = !!e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row-expander');

                if(record && record.isNonData) {
                    return;
                }

                if ((type === "click" && isExpanderClick) || (type === 'keydown' && e.getKey() === e.SPACE)) {

                    // Focus the cell on real touch tap.
                    // This is because the toggleRow saves and restores focus
                    // which may be elsewhere than clicked on causing a scroll jump.
                    if (isTouch) {
                        cell.focus();
                    }
                    me.toggleRow(rowIndex, record, e);
                    e.stopSelection = !me.selectRowOnExpand;
                } else if (e.type === 'mousedown' && !isTouch && isExpanderClick) {
                    e.preventDefault();
                }
            },

            // This column always migrates to the locked side if the locked side is visible.
            // It has to report this correctly so that editors can position things correctly
            isLocked: function() {
                return lockable && (lockable.lockedGrid.isVisible() || this.locked);
            },

            // In an editor, this shows nothing.
            editRenderer: function() {
                return '&#160;';
            }
        };
    }

});