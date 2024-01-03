/**
 * The mixin adds transaction alike functionality into a store, works in pair with {@link Gnt.model.mixin.ProjectableModel}
 * if you mix-in this one into a store make sure you mixin in {@link Gnt.model.mixin.ProjectableModel} into store's
 * model class as well.
 *
 * NOTE: only model updates are included into a transaction, record adding/removing are not taken into account,
 * that's why it's called "projection".
 */
Ext.define('Gnt.data.mixin.ProjectableStore', function() {

    function getByInternalId(store, id) {
        return store.byInternalIdMap && store.byInternalIdMap[id] || store.getByInternalId(id);
    }

    /**
     * @private
     * @method getProjection
     * @member Gnt.data.mixin.ProjectableStore
     */
    function getProjection() {
        var me              = this,
            projectionStack = me.projectionStack;

        return projectionStack && projectionStack[ projectionStack.length - 1 ];
    }


    /**
     * @private
     * @method getProjectionLevel
     * @member Gnt.data.mixin.ProjectableStore
     */
    function getProjectionLevel() {
        var me              = this,
            projectionStack = me.projectionStack;

        return projectionStack && projectionStack.length || 0;
    }

    /**
     * Checks if a store is currently projecting
     *
     * @return {Boolean}
     * @method isProjecting
     * @member Gnt.data.mixin.ProjectableStore
     */
    function isProjecting() {
        return this.getProjectionLevel() > 0;
    }

    /**
     * Checks whether any of given records are projected currently, i.e. any of given records has changes in current
     * projection.
     *
     * @param {Ext.data.Model/[Ext.data.Model]} records
     * @return boolean
     */
    function areProjected(records) {
        var i, len, are;

        records = [].concat(records);

        for (are = false, i = 0, len = records.length; !are && i < len; i++) {
            are = records[i].isProjected();
        }

        return are;
    }


    /**
      * Starts store's projection, any updates to any records during projection period will be put into a projection
      * storage and might be committed into record's data by calling {@link Gnt.data.mixin.ProjectableStore#commitProjection} or
      * canceled by calling {@link Gnt.data.mixin.ProjectableStore#rejectProjection}. The primary condition for this
      * to work is that store's records must use {#link Gnt.model.mixin.ProjectableModel} mixin. Projections
      * might be nested.
      *
      * @method startProjection
      * @member Gnt.data.mixin.ProjectableStore
      */
    function startProjection() {
        var me = this,
            projectionStack = me.projectionStack,
            newProjection, prevProjection;

        if (!projectionStack) {
            me.projectionStack = [{}];
        }
        else {
            prevProjection = projectionStack[ projectionStack.length - 1 ];
            newProjection  = {};

            Ext.Object.each(prevProjection, function(id, data) {
                var dataConstructor = function() {};

                dataConstructor.prototype = data;
                newProjection[id] = new dataConstructor();
            });

            projectionStack.push(newProjection);
        }

        me.fireEvent('projectionstart', me, me.getProjectionLevel());
    }


    /**
     * Commits all the changes recorded since last call to {@link #startProjection}..
     *
     * @method commitProjection
     * @member Gnt.data.mixin.ProjectableStore
     */
    function commitProjection() {
        var me = this,
            projectionStack = me.projectionStack,
            projectionData, committingData,
            modifiedData = {},
            prop, data,
            hasUpdates,
            internalId,
            record;


        // If projection level is 0 then committing recorded updates into corresponding store's records.
        if (projectionStack.length === 1) {
            committingData     = projectionStack[0];
            me.projectionStack = null;

            for (internalId in committingData) {
                if (committingData.hasOwnProperty(internalId)) {

                    record              = getByInternalId(me, internalId);

                    // Record might have been deleted from the store during projection time
                    if (record) {
                        data                = committingData[ internalId ];
                        hasUpdates          = false;

                        for (prop in data) {
                            if (data.hasOwnProperty(prop)) {
                                hasUpdates = true;
                                break;
                            }
                        }

                        if (hasUpdates) {
                            modifiedData[internalId] = record.set(data);
                        }
                    }
                }
            }
        }
        // If projection level is higher then copying current projection into lower level (previous) projection
        else {
            committingData = projectionStack.pop();
            projectionData = projectionStack[ projectionStack.length - 1 ];

            for (internalId in committingData) {
                if (committingData.hasOwnProperty(internalId)) {
                    if (!projectionData.hasOwnProperty(internalId)) {
                        projectionData[ internalId ] = committingData[ internalId ];
                    }
                    else {
                        projectionData[ internalId ] = Ext.apply(projectionData[ internalId ], committingData[ internalId ]);
                    }
                }
            }
        }

        me.fireEvent('projectioncommit', me, projectionStack && projectionStack[projectionStack.length - 1], committingData, me.getProjectionLevel());

        return modifiedData;
    }


    /**
     * Rejects all the changes to store's records recorded since projection last call to {@link #startProjection}.
     *
     * @method rejectProjection
     * @member Gnt.data.mixin.ProjectableStore
     */
    function rejectProjection() {
        var me              = this,
            projectionStack = me.projectionStack,
            projectionData  = projectionStack.pop();

        // If projection level was 1 (and now 0) then simply getting rid of projection stack
        if (projectionStack.length === 0) {
            me.projectionStack = null;
        }
        // If projection level is higher then we've got rid of changes recorded since last startProjection() call
        // by simply popping the last projection state from the projection stack.

        me.fireEvent('projectionreject', me, projectionStack && projectionStack[projectionStack.length - 1], projectionData, me.getProjectionLevel());
    }

    return {
        projectionStack  : null,

        getProjection      : getProjection,
        isProjecting       : isProjecting,
        areProjected       : areProjected,
        getProjectionLevel : getProjectionLevel,
        startProjection    : startProjection,
        commitProjection   : commitProjection,
        rejectProjection   : rejectProjection
    };
});
