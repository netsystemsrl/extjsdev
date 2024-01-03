// TreeStore doesn't support rejectChanges very well
// https://www.sencha.com/forum/showthread.php?300339-rejectChanges-doesn-t-work-for-TreeStore-added-removed-records&p=1097116#post1097116
Ext.define('Sch.patches.TreeStore', {
    extend     : 'Sch.util.Patch',

    target     : 'Ext.data.TreeStore',
    minVersion : '5.1.0',

    overrides  : {
        remove : function (node) {
            if (node.isModel) {
                return node.remove();
            } else if (node instanceof Array && node[0].isModel) {
                for (var i = 0; i < node.length; i++) {
                    node[i].remove();
                }
                return node;
            } else {
                return this.callParent(arguments);
            }
        }
    }

});
