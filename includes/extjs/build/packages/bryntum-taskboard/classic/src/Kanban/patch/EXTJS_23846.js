// https://app.assembla.com/spaces/bryntum/tickets/4216
// #4216 - Gantt doesn't work under FF52 on windows
Ext.define('Kanban.patch.EXTJS_23846', {
    extend     : 'Sch.util.Patch',

    requires   : ['Ext.dom.Element', 'Ext.event.publisher.Gesture'],
    target     : ['Ext.dom.Element', 'Ext.event.publisher.Gesture'],

    maxVersion : '6.2.2',

    applyFn : function () {

        if (Ext.firefoxVersion < 51) return;

        if (!Ext.ClassManager.isCreated('EXTJS_23846.Element')) {
            Ext.define('EXTJS_23846.Element', {
                override : 'Ext.dom.Element'
            }, function (Element) {
                var supports       = Ext.supports,
                    proto          = Element.prototype,
                    eventMap       = proto.eventMap,
                    additiveEvents = proto.additiveEvents;

                if (Ext.os.is.Desktop && supports.TouchEvents && !supports.PointerEvents) {
                    eventMap.touchstart  = 'mousedown';
                    eventMap.touchmove   = 'mousemove';
                    eventMap.touchend    = 'mouseup';
                    eventMap.touchcancel = 'mouseup';

                    additiveEvents.mousedown   = 'mousedown';
                    additiveEvents.mousemove   = 'mousemove';
                    additiveEvents.mouseup     = 'mouseup';
                    additiveEvents.touchstart  = 'touchstart';
                    additiveEvents.touchmove   = 'touchmove';
                    additiveEvents.touchend    = 'touchend';
                    additiveEvents.touchcancel = 'touchcancel';

                    additiveEvents.pointerdown   = 'mousedown';
                    additiveEvents.pointermove   = 'mousemove';
                    additiveEvents.pointerup     = 'mouseup';
                    additiveEvents.pointercancel = 'mouseup';
                }
            });
        }

        if (!Ext.ClassManager.isCreated('EXTJS_23846.Gesture')) {
            Ext.define('EXTJS_23846.Gesture', {
                override : 'Ext.event.publisher.Gesture'
            }, function (Gesture) {
                var me = Gesture.instance;

                if (Ext.supports.TouchEvents && !Ext.isWebKit && Ext.os.is.Desktop) {
                    me.handledDomEvents.push('mousedown', 'mousemove', 'mouseup');
                    me.registerEvents();
                }
            });
        }
    }
});
