// https://www.sencha.com/forum/showthread.php?324990-Ext-grid-column-Check-not-checking-presence-of-config-variable
Ext.define('Gnt.patches.CheckColumn', {
    extend : 'Sch.util.Patch',

    target   :'Ext.grid.column.Check',

    minVersion : '6.2.0',

    overrides : {
        constructor : function(config) {
            this.callParent([config || {}]);
        },

        // OVERRIDE https://www.sencha.com/forum/showthread.php?470577-Check-column-setDisabled-on-locked-column&p=1320409#post1320409
        _setDisabled : function (disabled) {
            this.callParent(arguments);

            var el = this.up('tablepanel').view.el;
            //HACK ExtJS bug. onDisable fn uses wrong selector
            if (el) {
                var cells = el.select(this.getCellSelector());

                cells[disabled ? 'addCls' : 'removeCls'](this.disabledCls);
            }
        }
    }
});
