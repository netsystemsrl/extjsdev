// ExtJs fires scrollEvent in updateDomScrollPosition in 6.5, while we call getScrollX often we silence the call
Ext.define('Sch.patches.Scroller_6_5', {
    extend      : 'Sch.util.Patch',

    target      : 'Ext.scroll.Scroller',

    minVersion  : '6.5.0',
    maxVersion  : '6.5.1.9999',

    overrides : {

        privates : {
            updateDomScrollPosition: function(silent) {
                var me = this,
                    position = me.position,
                    oldX = position.x,
                    oldY = position.y,
                    x, y, xDelta, yDelta;

                me.readPosition(position);

                x = position.x;
                y = position.y;

                me.positionDirty = false;

                if (!silent) {
                    xDelta = x - oldX;
                    yDelta = y - oldY;

                    // If we already know about the position. then we've been coerced there by a partner
                    // and that will have been firing our event sequence synchronously, so they do not
                    // not need to be fire in response to the ensuing scroll event.

                    if (!me.isScrolling) {
                        me.isScrolling = Ext.isScrolling = true;
                        me.fireScrollStart(x, y, xDelta, yDelta);
                    }

                    me.fireScroll(x, y, xDelta, yDelta);

                    me.bufferedOnDomScrollEnd(x, y, xDelta, yDelta);
                }

                return position;
            }
        },

        getPosition: function () {

            var me = this;

            if (me.positionDirty) {
                me.updateDomScrollPosition(true);
            }
            return me.position;
        }
    }

});