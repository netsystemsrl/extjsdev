// We patched grid navigation model to not focus rows in normal view in order to save scroll in IE
// this is why under some conditions keyevent contain wrong view and target. This can break navigation
// 2117_key_navigation
Ext.define('Sch.patches.NavigationModel', {
    extend      : 'Sch.util.Patch',

    target      : 'Ext.grid.NavigationModel',

    minVersion  : '6.0.0',

    overrides   : {
        setPosition: function(recordIndex, columnIndex, keyEvent, suppressEvent, preventNavigation) {
            var me = this;
            // We need to only handle pageup/pagedown keys, because they call setPosition(record, null,...) which trigger
            // special path that leads to error when there's lastFocused property that holds
            // column from normal view and current view is locked
            // #2428
            if (Ext.isIE && keyEvent && (keyEvent.getKey() === keyEvent.PAGE_DOWN || keyEvent.getKey() === keyEvent.PAGE_UP)) {
                var lastFocused = me.lastFocused;
                if (keyEvent.view.isLockedView && lastFocused && keyEvent.view.getVisibleColumnManager().indexOf(lastFocused.column) === -1) {
                    keyEvent.view = keyEvent.view.lockingPartner;
                }
            }

            return me.callParent(arguments);
        },

        // https://app.assembla.com/spaces/bryntum/tickets/4595
        onCellClick: function(view, cell, cellIndex, record, row, recordIndex, clickEvent) {

            this.callParent(arguments);

            if (clickEvent.position.column.cellFocusable === false) {
                if (view.isNormalView) {
                    if (Ext.isIE11m) {
                        view.ownerCt.el.focus();
                    } else {
                        if (!this.lastFocused) {
                            view.el.focus();
                        }
                    }
                }
            }
        }
    }
});
