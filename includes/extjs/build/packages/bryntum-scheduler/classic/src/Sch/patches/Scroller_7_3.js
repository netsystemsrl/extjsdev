// In Ext 7.3.1 BufferedRenderer plugin focuses the view in `onRangeFetched` callback. Which eventually involves
// cell focus and cell position calculation. Problem is that at the point of `onRangeFetched` rows are actually rendered
// to the DOM, but position is not yet updated, so view is trying to scroll to wrong position.
// Covered by 8920_CellEditingPlugin.t
Ext.define('Sch.patches.Scroller_7_3', {
    extend      : 'Sch.util.Patch',

    target      : 'Ext.scroll.Scroller',

    minVersion  : '7.3.1',

    overrides : {
        ensureVisible : function(el, options) {
            var me = this;

            var scroller = me.getLockingScroller && me.getLockingScroller();

            if (scroller && scroller.isScrolling) {
                return null;
            }
            else {
                return me.callParent(arguments);
            }
        }
    }
});
