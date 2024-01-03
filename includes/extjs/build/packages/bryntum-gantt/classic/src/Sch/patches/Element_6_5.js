Ext.define('Sch.patches.Element_6_5', {
    extend : 'Sch.util.Patch',

    target : ['Ext.dom.Element'],

    minVersion : '6.5.0',

    applyFn : function () {

        if (Ext.isIE11p) {

            Ext.override(Ext.dom.Element, {

                // In case call made to this function when dom-element is detached from document, it will throw an error.
                // This results in failures in multiple tests when the celleditor us used

                // In our tests it looks like:

                // fail 2 - Test  threw an exception
                // Unspecified error. http://local/workspace/BUILDS/20378/Bryntum/extjs-6.5.1/build/ext-all-debug.js 17996
                // fail 3 - Layouts should not be suspended globally by accident
                // Failed assertion `is`
                // Got  : 1
                // Need : 0

                selectText : function () {
                    try {
                        this.callParent(arguments);
                    }
                    catch (e) {
                    }
                }
            });
        }
    }
});
