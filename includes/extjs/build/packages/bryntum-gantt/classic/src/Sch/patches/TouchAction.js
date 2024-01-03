// https://app.therootcause.io/#bryntum/ext-scheduler/errors/41d561988474d9f22262c62aa32d3ddfe7f996b7
/*
    Cannot read property 'length' of undefined

    onTouchEnd	@ TouchAction.js:289:31
    constructor.fire	@ Event.js:483:37
    fire	@ Dom.js:459:26
    publish	@ Dom.js:386:27
    publishGestures	@ Gesture.js:346:15
    onTouchEnd	@ Gesture.js:519:15
    publishDelegatedDomEvent	@ Gesture.js:434:32
    doDelegatedEvent	@ Dom.js:490:15
    onDelegatedEvent	@ Dom.js:471:17
*/
Ext.define('Sch.patches.TouchAction', {
    extend     : 'Sch.util.Patch',

    // for Sencha Cmd in production mode
    requires : ['Ext.dom.TouchAction'],

    target     : "Ext.dom.TouchAction",

    applyFn : function () {

        var old = Ext.dom.TouchAction.onTouchEnd;

        /* Ext assunes e.touches exist, crash if property doesn't exist :(

        onTouchEnd: function(e) {
            var me = this,
                dom = e.target,
                touchCount, flags, doubleTapZoom;
            touchCount = e.touches.length;
            if (touchCount === 0) {

        */
        Ext.dom.TouchAction.onTouchEnd = function(e) {
            e.touches = e.touches || [];

            return old.apply(this, arguments);
        };
    }
});
