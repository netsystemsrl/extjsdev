// https://www.sencha.com/forum/showthread.php?306174-Multiple-sources-do-not-really-work
Ext.define('Gnt.patches.AbstractClipboard', {
    extend: 'Sch.util.Patch',

    target: 'Ext.plugin.AbstractClipboard',

    minVersion: '6.0.0',

    overrides: {
        privates : {
            getData: function(erase, format) {
                var me = this,
                    formats = me.getFormats(),
                    data, i, name, names;
                if (Ext.isString(format)) {
                    if (!formats[format]) {
                        Ext.raise('Invalid clipboard format "' + format + '"');
                    }
                    data = me[formats[format].get](format, erase);
                } else {
                    data = {};
                    names = [];
                    if (format) {
                        for (name in format) {
                            if (!formats[name]) {
                                Ext.raise('Invalid clipboard format "' + name + '"');
                            }
                            names.push(name);
                        }
                    } else {
                        names = Ext.Object.getAllKeys(formats);
                    }
                    for (i = names.length; i-- > 0; ) {
                        name = names[i];
                        data[name] = me[formats[name].get](name, erase && !i);
                    }
                }
                return data;
            }
        }
    }
});