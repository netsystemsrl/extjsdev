// https://www.sencha.com/forum/showthread.php?274441
// To get rid of lock/unlock menu options when using grouping feature and a column configured as not lockable
// Covered with tests/basic_grid_features/011_column_menu.t.js
Ext.define('Sch.patches.Grouping', {
    extend : 'Sch.util.Patch',

    maxVersion : '6.5.2',

    target : 'Ext.grid.feature.Grouping',

    overrides : {
        injectGroupingMenu : function () {
            var me       = this,
                headerCt = me.view.headerCt;

            headerCt.showMenuBy   = Ext.Function.createInterceptor(headerCt.showMenuBy, me.showMenuBy);
            headerCt.getMenuItems = me.getMenuItems();
        },

        showMenuBy : function (clickEvent, t, header) {
            var me                  = this,
                menu                = me.getMenu(),
                groupMenuItem       = menu.down('#groupMenuItem'),
                groupMenuMeth       = header.groupable === false || !header.dataIndex || me.view.headerCt.getVisibleGridColumns().length < 2 ? 'disable' : 'enable',
                groupToggleMenuItem = menu.down('#groupToggleMenuItem'),
                isGrouped           = me.grid.getStore().isGrouped();

            groupMenuItem[groupMenuMeth]();

            if (groupToggleMenuItem) {
                groupToggleMenuItem.setChecked(isGrouped, true);
                groupToggleMenuItem[isGrouped ? 'enable' : 'disable']();
            }
        }
    }
});