// https://www.sencha.com/forum/showthread.php?333029-Locked-view-is-not-synced-with-header-after-cell-clicked&p=1167293#post1167293
// Also https://www.sencha.com/forum/showthread.php?332451
// Covered by 1209_click_row_scroll
Ext.define('Sch.patches.TableScroller', {
    extend  : 'Sch.util.Patch',

    minVersion  : '6.2.1',

    maxVersion  : '6.5.0',

    target      : 'Ext.scroll.TableScroller',

    overrides   : {
        privates : {
            onDomScroll: function() {
                var me = this,
                    position = me.position,
                    oldX = position.x,
                    oldY = position.y,
                    x, y, xDelta, yDelta;
                position = me.updateDomScrollPosition();
                if (me.restoreTimer) {
                    clearTimeout(me.onDomScrollEnd.timer);
                    return;
                }
                x = position.x;
                y = position.y;

                xDelta = x - oldX;
                yDelta = y - oldY;

                // If we already know about the position. then we've been coerced there by a partner
                // and that will have been firing our event sequence synchronously, so they do not
                // not need to be fire in response to the ensuing scroll event.
                // HACK removing condition to always fire scroll event
                if (!me.isScrolling) {
                    me.isScrolling = Ext.isScrolling = true;
                    me.fireScrollStart(x, y, xDelta, yDelta);
                }
                me.fireScroll(x, y, xDelta, yDelta);
                me.bufferedOnDomScrollEnd(x, y, xDelta, yDelta);
            },

            // Removing check for truthy value of xDelta/yDelta - we always need to invoke partner
            invokePartners: function(method, x, y, xDelta, yDelta) {
                var me = this,
                    partners = me._partners,
                    partner, id, axes;
                if (!me.suspendSync) {
                    me.invokingPartners = true;
                    for (id in partners) {
                        axes = partners[id].axes;
                        partner = partners[id].scroller;
                        // Only pass the scroll on to partners if we are are configured to pass on the scrolled dimension
                        if (!partner.invokingPartners) {
                            partner[method](me, axes.x ? x : null, axes.y ? y : null, xDelta, yDelta);
                        }
                    }
                    me.invokingPartners = false;
                }
            }
        }
    }
});