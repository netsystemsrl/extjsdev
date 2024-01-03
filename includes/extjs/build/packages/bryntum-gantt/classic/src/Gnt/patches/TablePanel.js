// https://www.bryntum.com/forum/viewtopic.php?f=9&t=9075
// Allow a lockable GridPanel to fire an event when its Scroller has been set up
Ext.define('Gnt.patches.TablePanel', {
    extend: 'Sch.util.Patch',

    requires : ['Ext.grid.locking.Lockable'],

    target: 'Ext.panel.Table',

    minVersion: '6.2.1',

    overrides: {
        initScrollContainer: function() {
            // callParent doesn't work for mixed in methods
            Ext.grid.locking.Lockable.prototype.initScrollContainer.call(this);

            ////////////////////////////
            //
            // The fix. A new event that signals that a locking grid has set up its
            // special Y scrolling element and put the two views inside it.
            // Used by the TreViewDragDrop plugin to acquire the correct element
            // to scroll on drag.
            this.fireEvent('scrollersinitialized', this);
        }
    }
});