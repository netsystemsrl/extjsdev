// With card layout scheduler may be rendered skipping layout, this will throw exception
// when reconfiguring such grid
// https://www.sencha.com/forum/showthread.php?333737
Ext.define('Sch.patches.LockingScroller', {
    extend      : 'Sch.util.Patch',

    target      : 'Ext.scroll.Scroller',

    minVersion  : '6.2.0',

    overrides   : {
        scrollTo  : function () {
            // If there's no normal scroller in timeline panel - do not scroll, otherwise exception will be raised
            if (this.getNormalScroller && !this.getNormalScroller()) {
                if (
                    Sch.panel.TimelineGridPanel && this.component instanceof Sch.panel.TimelineGridPanel ||
                    Sch.panel.TimelineTreePanel && this.component instanceof Sch.panel.TimelineTreePanel
                ) {
                    return;
                }
            }

            return this.callParent(arguments);
        }
    }
});
