Ext.define('Gnt.util.Data', {

    singleton   : true,

    cloneModel : function (record) {
        var cloned = record.copy();

        cloned.phantom = false;
        // keep link to original record
        cloned.originalRecord  = record;

        return cloned;
    },

    // Copies a collection of records performing a copy of each model.
    // Each model in the resulting set keeps a link to its original instance in the originalRecord property.
    // Copied models have their "phantom" property set to false.
    // To apply changes made in the copy to its original data, {@link #applyCloneChanges} can be used.
    //
    // @param {Ext.data.Store/Ext.util.MixedCollection/Ext.data.Model[]} dataSet Collection of records to copy.
    // @param {Function} [fn] The function to be called at each model copying iteration.
    // @param {Ext.data.Model} fn.cloned The newly created copy of the model.
    // @param {Ext.data.Model} fn.original The original model.
    // @param {Mixed} [scope] The scope for fn function call. By default it`s the dataSet.
    // @return {Ext.data.Model[]} Array of cloned records.
    cloneModelSet : function (dataSet, fn, scope) {
        var me   = this,
            data = [];

        var process = function (record) {
            var cloned = me.cloneModel(record);

            // if callback is set
            if (fn) {
                if (fn.call(scope || dataSet, cloned, record) === false) return;
            }

            data.push(cloned);
        };

        if (dataSet.each) {
            dataSet.each(process);
        } else {
            Ext.Array.each(dataSet, process);
        }

        return data;
    },

    findOriginalRecords : function (records) {
        var result = [];

        for (var i = 0, l = records.length; i < l; i++) {
            if (records[i].originalRecord) {
                result.push(records[i].originalRecord);
            }
        }

        return result;
    },

    applyCloneChanges : function (cloneStore, originalStore, fn, scope) {
        var autoSyncSuspended = originalStore.autoSyncSuspended;

        // suspend automatic sync calls we will call sync() manually in the end of changes applying
        if (originalStore.autoSync && !autoSyncSuspended) originalStore.suspendAutoSync();

        // first apply deleted records
        var removed = cloneStore.getRemovedRecords();

        var toRemove = this.findOriginalRecords(removed);

        if (toRemove.length) {
            originalStore.remove(toRemove);

            cloneStore.removed.length = 0;
        }

        // let`s get updated & added records
        var modified    = cloneStore.getModifiedRecords(),
            originalRecord, data, added;

        // and loop over them
        for (var i = 0, l = modified.length; i < l; i++) {

            // original instance of modified record
            originalRecord  = modified[i].originalRecord;
            // new data
            data            = modified[i].getData();

            delete data[modified[i].idProperty];

            // if it`s modification of existing record
            if (originalRecord) {
                // let`s update it
                originalRecord.beginEdit();

                // if custom callback specified
                if (fn) {
                    fn.call(scope || modified[i], data, modified[i]);
                }

                originalRecord.set(data);

                originalRecord.endEdit();
            // new record creation
            } else {
                // if custom callback specified
                if (fn) {
                    fn.call(scope || modified[i], data, modified[i]);
                }

                added   = originalStore.add(data);

                // let`s bind our record to the "real" one
                modified[i].originalRecord = added && added[0];
            }

            modified[i].commit(true);
        }

        // enable autoSync back and call sync to persist changes
        if (originalStore.autoSync && !autoSyncSuspended) {
            originalStore.resumeAutoSync();
            originalStore.sync();
        }

        return {
            removed  : toRemove,
            modified : modified
        };
    }

});
