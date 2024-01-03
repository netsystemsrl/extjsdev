/**
 @class Robo.action.Base

 Base class for actions - entities that represents a change in a managed store.

 */

Ext.define('Robo.action.Base', {

    constructor : function (config) {
        Ext.apply(this, config);
    },

    undo : function () {
        throw new Error('Abstract method call');
    },

    redo : function () {
        throw new Error('Abstract method call');
    },

    getTitle : function () {
        return '';
    },

    prepareRecord : function (record) {
        // It is enough to make record phantom for it to appear in the new records array (given that record is valid)
        record.phantom = true;

        // If record (task) has phantomIdField defined - fill it with current id. That will make loaded tasks appear as
        // phantom for CRUD backend
        if (record.phantomIdField) {
            record.data[record.phantomIdField] = record.getId();
        }

        return record;
    }
});
