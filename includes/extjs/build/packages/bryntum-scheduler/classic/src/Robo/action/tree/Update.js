Ext.define('Robo.action.tree.Update', {
    extend : 'Robo.action.flat.Update',

    // Ext JS UI doesn't react to record.set('expanded', false). Need to call API methods for this field
    processRestoringValue : function (value, fieldName, record, op) {
        var me = this;

        if (fieldName === 'expanded') {
            if (value) {
                record.expand();
            }
            else {
                record.collapse();
            }
            value = me.self.CUSTOMLY_PROCESSED;
        }
        else if (fieldName == 'leaf') {
            value = me.callParent(arguments);

            if (value === true && op == 'undo') record.data.loaded = false;
        }
        else {
            value = me.callParent(arguments);
        }

        return value;
    }

});
