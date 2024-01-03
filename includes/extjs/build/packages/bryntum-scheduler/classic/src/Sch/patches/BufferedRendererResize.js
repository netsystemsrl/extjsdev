// https://app.assembla.com/spaces/bryntum/tickets/9653-normal-and-locked-rows-get-desynced-when-resizing-scheduler-vertically
// When application is resized theres sa major layout reflow which first handles locked view and then normal. Both times
// Ext is adjusting scroll and updating rows. when Ext is setting view size for the buffered renderer plugin in the
// locked view, first it calls for partner to update its size, i.e. normal view:
// ```
// if (lockingPartner && !fromLockingPartner) {
//     lockingPartner.setViewSize(viewSize, true);
// }
// diff = elCount - viewSize;
// if (diff) {
//     me.scrollTop = me.scroller ? me.scroller.getPosition().y : 0; // Reading position would actually trigger scroll change
//     me.viewSize = viewSize;
// ...
// ```
// as marked in the snippet, after locking partner's view size is updated, we read the scroller position. Scroll got
// dirty after partner call, so Ext triggers scroll event which buffered renderer plugin reacts to and renders new range
// of rows. BUT at this point view size of locked and normal buffered renderers is *different*. So when locked plugin
// wants to communicate with normal one it sends some incorrect data about where to scroll. Normal partner scrolls to
// negative record index which leads to wrong normal view scroll and empty space at the top.
// we can update view size *BEFORE* we read scroll position, but in that case scheduler will scroll to 0. This is done
// on purpose by ExtJS code. Standard ExtJS Grid is trying to preserve scroll position, but it walks a different code path.
// Layout flush in Scheduler works different and just doesn't go the part which is trying to restore the scroll. It
// could be caused by multiple layout suspensions we use in scheduler. There is no point trying to unsuspend them, instead
// we can just fix scroll position in the refresh method. At the same time that helps with original problem.
Ext.define('Sch.patches.BufferedRendererResize', {
    extend      : 'Sch.util.Patch',
    target      : 'Ext.grid.plugin.BufferedRenderer',
    minVersion  : '7.3.1',

    overrides : {
        doRefreshView : function () {
            var scroller = this.scroller;

            if (this.view.ownerGrid.is('timelinegrid,timelinetree') && scroller) {
                var position = this.position;
                var previousTop = this.scrollTop;
                this.callParent(arguments);
                // If scrollTop was changed doVerticalScroll was called. In which case we want to call it again but
                // with old scroll position.
                if (this.scrollTop !== previousTop) {
                    this.doVerticalScroll(scroller, position, true);
                }
            }
            else {
                this.callParent(arguments);
            }
        }
    }
});
