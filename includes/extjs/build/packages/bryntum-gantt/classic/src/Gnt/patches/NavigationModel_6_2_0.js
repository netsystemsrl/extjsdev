// https://www.sencha.com/forum/showthread.php?332570-locked-view-and-header-are-out-of-sync-after-collapsing-node
// covered by 115_collapse_expand
Ext.define('Gnt.patches.NavigationModel_6_2_0', {
    extend: 'Sch.util.Patch',

    target: 'Ext.grid.NavigationModel',

    minVersion: '6.2.0',

    overrides: {
        focusPosition : function (position, preventNavigation) {
            // Only apply logic to gantt view
            if (this.view instanceof Gnt.view.Gantt) {
                !preventNavigation && this.callParent(arguments);
            } else {
                this.callParent(arguments);
            }
        }
    }
});
