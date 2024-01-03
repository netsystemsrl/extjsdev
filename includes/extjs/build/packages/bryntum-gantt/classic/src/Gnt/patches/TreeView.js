//https://www.sencha.com/forum/showthread.php?337241
// Spread sheet model doesn't react correctly to store.remove() called manually
Ext.define('Gnt.patches.TreeView', {
    extend: 'Sch.util.Patch',

    target: 'Ext.tree.View',

    minVersion: '6.0.2',

    overrides: {
        onFocusLeave: function(e) {
            var me = this,
                isLeavingGrid;

            // If the blur was caused by a refresh, we expect things to be refocused.
            if (!me.destroying && !me.refreshing) {
                // See if focus is really leaving the grid.
                // If we have a locking partner, and focus is going to that, we're NOT leaving the grid.
                isLeavingGrid = !e.isScroll && (!me.lockingPartner || !e.toComponent || (e.toComponent !== me.lockingPartner && !me.lockingPartner.isAncestor(e.toComponent)));
                // Ignore this event if we do not actually contain focus.
                // CellEditors are rendered into the view's encapculating element,
                // So focusleave will fire when they are programatically blurred.
                // We will not have focus at that point.
                if (me.cellFocused) {
                    // Blur the focused cell unless we are navigating into a locking partner,
                    // in which case, the focus of that will setPosition to the target
                    // without an intervening position to null.
                    if (isLeavingGrid) {
                        me.getNavigationModel().setPosition(null, null, e.event, null, true);
                    }
                    me.cellFocused = false;
                    me.focusEl = me.el;
                    me.focusEl.dom.setAttribute('tabIndex', 0);
                }
                // Exiting to outside, switch back to navigation mode before clearing the navigation position
                // so that the current position's row can have its tabbability saved.
                if (isLeavingGrid) {
                    if (me.ownerGrid.actionableMode) {
                        // If focus is thrown back in with no specific target, it should go back into
                        // navigable mode at this position.
                        // See http://www.w3.org/TR/wai-aria-practices-1.1/#h-grid
                        // "Once focus has been moved inside the grid, subsequent tab presses that re-enter the grid shall return focus to the cell that last held focus."
                        me.lastFocused = me.actionPosition;
                        me.ownerGrid.setActionableMode(false);
                    }
                } else {
                    me.actionPosition = null;
                }
                // Skip the AbstractView's implementation.
                Ext.Component.prototype.onFocusLeave.call(me, e);
            }
        }
    }
});