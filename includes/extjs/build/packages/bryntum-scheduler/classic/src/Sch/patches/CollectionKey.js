Ext.define('Sch.patches.CollectionKey', {
    extend : 'Sch.util.Patch',

    target     : 'Ext.util.CollectionKey',

    minVersion : '6.0.0',

    reportUrl  : 'https://www.sencha.com/forum/showthread.php?310532-Ext.util.Collection-key-configuration-application-and-cloning-is-broken',

    obsoleteTestName : 'patches/001_collection_key.t.js',

    description : [
        'Ext.util.CollectionKey::clone() is broken due to wrong usage of Ext\'s configuration facility.',
        'We relay on the (though) private Ext.data.LocalStore::extraKeys configuration, we use it to define additional',
        'unique but complex keys for Assignment and Dependency stores. Upon store filtering such keys are being cloned',
        'but due to the broken config key\'s clone() method throws an exception'
    ].join(' '),

    applyFn : function() {
        var applyFn;

        applyFn = Ext.util.CollectionKey.prototype.applyKeyFn;
        Ext.util.CollectionKey.prototype.applyKeyFn = Ext.identityFn;
        Ext.util.CollectionKey.prototype.updateKeyFn = applyFn;
    }
});
