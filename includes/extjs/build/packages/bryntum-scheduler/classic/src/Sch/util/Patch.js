/**
 * @class Sch.util.Patch
 * @static
 * @private
 * Private utility class for Ext JS patches for the Bryntum components.
 *
 * Each subclass of this should patch *ONE* platform bug, to be able to easily scope the fix only to affected versions
 */
Ext.define('Sch.util.Patch', {

    // Trial package dependencies
    uses : [
        'Ext.util.Cookies',
        'Ext.data.Connection',
        'Ext.Component'
    ],

    /**
     * @cfg {String} target The class name to override
     */
    target      : null,

    /**
     * @cfg {String} minVersion The minimum Ext JS version for which this override is applicable. E.g. "4.0.5"
     */
    minVersion  : null,

    /**
     * @cfg {String} maxVersion The highest Ext JS version for which this override is applicable. E.g. "4.0.7"
     */
    maxVersion  : null,

    /**
     * @cfg {String} reportUrl A url to the forum post describing the bug/issue in greater detail
     */
    reportUrl   : null,

    /**
     * @cfg {String} obsoleteTestName A name of the test checking if this patch is obsolete and might be removed
     */
    obsoleteTestName : null,

    /**
     * @cfg {String} description A brief description of why this override is required
     */
    description : null,

    /**
     * @cfg {Function} applyFn A function that will apply the patch(es) manually, instead of using 'overrides';
     */
    applyFn : null,

    /**
     * @cfg {Boolean} ieOnly true if patch is only applicable to IE
     */
    ieOnly : false,

    /**
     * @cfg {Boolean} macOnly true if patch is only applicable for Mac
     */
    macOnly : false,

    /**
     * @cfg {Object} overrides a custom object containing the methods to be overridden.
     */
    overrides : null,

    onClassExtended: function(cls, data) {

        if (Sch.disableOverrides) {
            return;
        }

        if (data.ieOnly && !Ext.isIE) {
            return;
        }

        if (data.macOnly && !Ext.isMac) {
            return;
        }

        if ((!data.minVersion || Ext.versions.extjs.equals(data.minVersion) || Ext.versions.extjs.isGreaterThan(data.minVersion)) &&
            (!data.maxVersion || Ext.versions.extjs.equals(data.maxVersion) || Ext.versions.extjs.isLessThan(data.maxVersion))) {
            // Make sure class is loaded before applying override
            Ext.require(data.target, function() {
                if (data.applyFn) {
                    // Custom override, implementor has full control
                    data.applyFn();
                } else if (data.overrides){
                    // Simple case, just an Ext override
                    Ext.ClassManager.get(data.target).override(data.overrides);
                }
            });
        }
    }
});
