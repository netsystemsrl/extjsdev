// Locked panel cannot be collapsed, sencha provided override to fix this, but unfortunately it doesn't work nice
// with grids, syncing row height (syncRowHeights: true)
// https://www.sencha.com/forum/showthread.php?310933
// https://fiddle.sencha.com/#fiddle/1ak8
Ext.define('Sch.layout.TableLayout', {
    extend  : 'Ext.view.TableLayout',
    alias   : 'layout.timeline_tablelayout',


    beginLayout: function (ownerContext) {
        var me = this,
            owner = me.owner,
            ownerGrid = owner.ownerGrid,
            partner = owner.lockingPartner,

        // BUG: need to test whether partner is not collapsed as well as visible.
        // ======================================================================
            partnerVisible = partner && partner.grid.isVisible() && !partner.grid.collapsed,
            context = ownerContext.context;

        // Flag whether we need to do row height synchronization.
        // syncRowHeightOnNextLayout is a one time flag used when some code knows it has changed data height
        // and that the upcoming layout must sync row heights even if the grid is configured not to for
        // general row rendering.
        ownerContext.doSyncRowHeights = partnerVisible && (ownerGrid.syncRowHeight || ownerGrid.syncRowHeightOnNextLayout);

        if (!me.columnFlusherId) {
            me.columnFlusherId = me.id + '-columns';
            me.rowHeightFlusherId = me.id + '-rows';
        }

        if (me.owner.bufferedRenderer) {
            me.owner.bufferedRenderer.beforeTableLayout(ownerContext);
        }

        // We do not want to call method on extended class, otherwise exception will be raised
        me.superclass.superclass.beginLayout.apply(this, [ ownerContext ]);

        // If we are in a twinned grid (locked view) then set up bidirectional links with
        // the other side's layout context. If the locked or normal side is hidden then
        // we should treat it as though we were laying out a single grid, so don't setup the partners.
        // This is typically if a grid is configured with locking but starts with no locked columns.
        if (partnerVisible && partner.componentLayout.isRunning()) { // BUG: if partner is not running, don't look at them
            if (!ownerContext.lockingPartnerContext) {
                (ownerContext.lockingPartnerContext = context.getCmp(partner)).
                    lockingPartnerContext = ownerContext;
            }
            if (ownerContext.doSyncRowHeights) {
                ownerContext.rowHeightSynchronizer = me.owner.syncRowHeightBegin();
            }
        }

        // Grab a ContextItem for the header container (and make sure the TableLayout can
        // reach us as well):
        (ownerContext.headerContext = context.getCmp(me.headerCt)).viewContext = ownerContext;
    }
});