// https://www.sencha.com/forum/showthread.php?310238-Tooltip-should-not-ignore-mouseover-event-on-touch-devices
// tips shouldn't be visible on touch devices at all
Ext.define('Sch.patches.ToolTip', {
    extend : 'Sch.util.Patch',

    target : 'Ext.tip.ToolTip',

    minVersion : '6.0.0',

    applyFn : function () {
        var overrides = {
            setTarget : function (target) {
                var me = this;

                if (me.target) {
                    var oldTarget = Ext.get(me.target);

                    // check if old target still exists on the page
                    if (oldTarget) {
                        me.mun(oldTarget, {
                            mouseover : me.onTargetOver,
                            tap       : me.onTargetOver,
                            mouseout  : me.onTargetOut,
                            mousemove : me.onMouseMove,
                            scope     : me
                        });
                    }
                }

                me.target = Ext.get(target);

                // check if new target exists on the page
                if (me.target) {
                    me.mon(me.target, {
                        mouseover : me.onTargetOver,
                        tap       : me.onTargetOver,
                        mouseout  : me.onTargetOut,
                        mousemove : me.onMouseMove,
                        scope     : me
                    });
                }

                if (me.anchor) {
                    me.anchorTarget = me.target;
                }
            }
        };

        if (Ext.getVersion().isLessThan('6.0.2')) {
            overrides.afterSetPosition = function (x, y) {
                var me = this;

                me.callParent(arguments);

                if (me.anchor) {
                    if (!me.anchorEl.isVisible()) {
                        me.anchorEl.show();
                    }

                    // Sync anchor after it's visible, otherwise it'll be misplaced. Fixed in 6.0.2
                    // 1202_dragcreator
                    me.syncAnchor();
                } else {
                    me.anchorEl.hide();
                }
            };
        }

        Ext.ClassManager.get(this.target).override(overrides);
    }
});