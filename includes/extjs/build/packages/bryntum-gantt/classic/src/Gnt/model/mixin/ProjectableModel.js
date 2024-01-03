/**
 * This mixin adds transaction alike functionality into a model and works in pair with {@link Gnt.data.mixin.ProjectableStore}.
 * If you mix-in this class into a model, make sure you also mix-in {@link Gnt.model.mixin.ProjectableStore} into the store(s)
 * which will work with this model class.
 */
Ext.define('Gnt.model.mixin.ProjectableModel', function() {
    // Private
    function getUnprojected(fieldName) {
        return this.data[fieldName];
    }

    function getProjectionStack() {
        var me    = this,
            store = me.getTreeStore && me.getTreeStore() || me.store;

        return store && store.projectionStack;
    }

    function getProjection() {
        var me         = this,
            store      = me.getTreeStore && me.getTreeStore() || me.store,
            projection = store && store.getProjection && store.getProjection();

        return projection && projection.hasOwnProperty(me.internalId) ? projection[me.internalId] : null;
    }

    /**
     * Checks whether the record is projected, i.e. a projection has changed values for this record.
     * @param {String} [fieldName] Field name. If provided the method will check if this specific record field is projected (the field value has been changed).
     * @return {Boolean} `true` if the record (or its specific field) has been changed.
     */
    function isProjected(fieldName, currentProjectionOnly) {
        if (typeof fieldName === 'boolean') {
            currentProjectionOnly = fieldName;
            fieldName = undefined;
        }

        var result            = false,
            hasProjectedField = false;

        var projection = this.getProjection(currentProjectionOnly),
            projectionStack = getProjectionStack();

        if (projection) {

            if (fieldName) {
                hasProjectedField = currentProjectionOnly ? projection.hasOwnProperty(fieldName) : projection[fieldName];

            } else if (currentProjectionOnly && this.getProjectionStack().length > 1) {

                for (var prop in projection) {
                    if (Object.prototype.hasOwnProperty.call(projection, prop)) {
                        hasProjectedField = true;
                        break;
                    }
                }

            } else {
                hasProjectedField = true;
            }

            result = Boolean(projection && hasProjectedField);
        }

        return result;
    }

    // See the following function
    var flexSetProjectionResultContext = {
        record     : null,
        projection : null,
        result     : null
    };

    // This function works in pair with previous object
    var flexSetProjectionResult = Ext.Function.flexSetter(function(fieldName, value) {
        var me = this,
            record       = flexSetProjectionResultContext.record,
            projection   = flexSetProjectionResultContext.projection,
            result       = flexSetProjectionResultContext.result,
            internalId   = record.internalId,
            currentValue = record.get(fieldName), //me.getUnprojected(fieldName);
            prevVals     = record.previousValues, // see https://app.assembla.com/spaces/bryntum/tickets/3676
            valueAdopted,
            currentValueAdopted,
            data;

        valueAdopted        = (value !== undefined && value !== null) ? (value).valueOf() : value;
        currentValueAdopted = (currentValue !== undefined && currentValue !== null) ? (currentValue).valueOf() : currentValue;

        if (
            ((valueAdopted === undefined || valueAdopted === null) && valueAdopted !== currentValueAdopted) ||
            valueAdopted != currentValueAdopted
        ) {
            data = projection[ internalId ] = projection.hasOwnProperty( internalId ) && projection[ internalId ] || {};
            data[ fieldName ] = value;

            // see https://app.assembla.com/spaces/bryntum/tickets/3676
            (prevVals || (record.previousValues = prevVals = {}))[fieldName] = currentValue;

            result.push(fieldName);
        }
    });

    // Ext.override modifies $owner of the overridables object functions, thus we need to re-create it eachtime
    // we pass new overridables to Ext.override
    function makeOverridables() {

        var overridables = {};

        overridables.get = function get(fieldName) {
            var me         = this,
                store      = me.getTreeStore && me.getTreeStore() || me.store,
                projection = store && store.getProjection && store.getProjection(),
                internalId = me.internalId,
                data, value;

            if (projection && projection.hasOwnProperty(internalId)) {
                data  = projection[ internalId ];
                if (fieldName in data) {
                    value = data[ fieldName ];
                }
                else {
                    value = me.callParent([ fieldName ]);
                }
            }
            else {
                value = me.callParent([ fieldName ]);
            }

            return value;
        };


        // TODO we should probably handle 'options' object as well
        overridables.set = function set(fieldName, value, options) {
            var me         = this,
                store      = me.getTreeStore && me.getTreeStore() || me.store,
                projection = store && store.getProjection && store.getProjection(),
                internalId = me.internalId,
                result;

            if (projection) {

                flexSetProjectionResultContext.record     = me;
                flexSetProjectionResultContext.projection = projection;
                flexSetProjectionResultContext.result     = [];

                flexSetProjectionResult(fieldName, value);

                result = flexSetProjectionResultContext.result;

                flexSetProjectionResultContext.record     = null;
                flexSetProjectionResultContext.result     = null;
                flexSetProjectionResultContext.projection = null;
            }
            else {
                result = me.callParent(arguments);
            }

            return result;
        };

        return overridables;
    }


    return {
        getUnprojected  : getUnprojected,
        isProjected     : isProjected,
        getProjection   : getProjection,
        getProjectionStack : getProjectionStack,
        onClassMixedIn  : function(targetClass) {
            Ext.override(targetClass, makeOverridables());
        }
    };
});
