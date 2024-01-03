//https://www.sencha.com/forum/showthread.php?321953-Ext-JS-resizer-sets-height-when-resizing-east-west&p=1314032#post1314032
Ext.define('Gnt.patches.ResizeTracker', {
    extend : 'Sch.util.Patch',
    target : 'Ext.resizer.ResizeTracker',

    minVersion : '6.5.0',

    overrides : {
        resize : function (box, atEnd) {
            var me          = this,
                region      = me.activeResizeHandle.region,
                target,
                setPosition = me.setPosition;

            // We are live resizing the target, or at the end: Size the target
            if (me.dynamic || (!me.dynamic && atEnd)) {
                // Resize the target
                if (setPosition) {
                    me.target.setBox(box);
                } else {
                    if (region === 'east') {
                        me.target.setWidth(box.width);
                    }
                    else if (region === 'south') {
                        me.target.setHeight(box.height);
                    }
                    else {
                        me.target.setSize(box.width, box.height);
                    }
                }

            }

            // In the middle of a resize - just resize the proxy
            if (!atEnd) {
                target = me.getProxy();
                if (target && target !== me.target) {
                    if (setPosition || me.hideProxy) {
                        target.setBox(box);
                    } else {
                        target.setSize(box.width, box.height);
                    }
                }
            }
        }
    }
});
