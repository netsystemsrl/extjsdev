/**
 * Fixes viewPreset bind in test 40_calendar_basic
 */
Ext.define('Sch.patches.LayoutContext_6_5', {
    extend      : 'Sch.util.Patch',

    target      : 'Ext.layout.Context',

    minVersion  : '6.5.0',

    overrides: {
        callLayout: function(layout, methodName) {

            this.currentLayout = layout;

            if (!layout.destroyed)
                layout[methodName](this.getCmp(layout.owner));

        }
    }
});
