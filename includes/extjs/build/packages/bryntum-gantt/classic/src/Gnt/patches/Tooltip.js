// https://www.sencha.com/forum/showthread.php?300781
Ext.define('Gnt.patches.Tooltip', {
    extend : 'Sch.util.Patch',

    target     : 'Ext.tip.ToolTip',
    minVersion : '5.1.0',

    overrides : {
        onDocMouseDown  : function () {
            if (this.isDisabled()) { 
                return; 
            }
            this.callParent(arguments);
        }
    }
});