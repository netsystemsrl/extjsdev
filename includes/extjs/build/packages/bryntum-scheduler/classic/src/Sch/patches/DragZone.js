// https://www.sencha.com/forum/showthread.php?328470
Ext.define('Sch.patches.DragZone', {
    extend : 'Sch.util.Patch',

    target   : 'Ext.dd.DragZone',

    minVersion : '6.2.0',

    overrides : {
        unreg: function() {
            try {
                this.callParent(arguments);
            } catch(e){}
        }
    }
});