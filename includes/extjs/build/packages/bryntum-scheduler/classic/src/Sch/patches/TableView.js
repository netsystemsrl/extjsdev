// Broken buffered renderer, which incorrectly instructs its view to scroll vertically which it can't in locked grid scenario
// This patch routes the vertical scrolling to the owning topmost Grid/Tree
Ext.define('Sch.patches.TableView', {
    extend : 'Sch.util.Patch',

    target : 'Ext.view.Table',

    overrides : {
        scrollBy : function (xDelta, yDelta, anim) {
            if (this.lockingPartner) {
                this.callParent([xDelta || null, null, anim]);
                this.ownerCt.ownerCt.getScrollable().scrollBy(null, yDelta, anim);
            }
            else {
                this.callParent([xDelta, yDelta, anim]);
            }
        }
    }
});
