/**
 * This mixin eliminates differences between flat/tree store in get by [internal] id functionality and it should be
 * mixed into data model stores.
 *
 * It adds two methods {@link #getModelById getModelById()} and {@link #getModelByInternalId getModelByInternalId()}
 * which should be used everywhere in the code instead of native getById() / getByInternalId() methods.
 *
 * @private
 */
Ext.define('Sch.data.mixin.UniversalModelGetter', {

    /**
     * @method getModelById
     * @param {String/Number} id
     * @return {Ext.data.Model/Null}
     */

    /**
     * @method getModelByInternalId
     * @param {String/Number} internalId
     * @return {Ext.data.Model/Null}
     */

    onClassMixedIn : function(targetClass) {
        var overrides = {};

        // getModelById:
        // -------------

        // - Tree store case
        if (targetClass.prototype.isTreeStore) {
            overrides.getModelById = targetClass.prototype.getNodeById;
        }
        // - Flat store case
        else {
            overrides.getModelById = targetClass.prototype.getById;
        }

        // getModelByInternalId:
        // ---------------------

        // - Tree store case (relaying heavily on the Sch.patch.TreeStoreInternalIdMap)
        if (targetClass.prototype.isTreeStore) {
            overrides.getModelByInternalId = function(id) {
                return this.byInternalIdMap[id] || null;
            };
        }
        // - Flat store case
        else {
            overrides.getModelByInternalId = targetClass.prototype.getByInternalId;
        }

        Ext.override(targetClass, overrides);
    }
});
