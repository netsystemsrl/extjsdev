/**
 @class Robo.data.Model

 This is a mixin for your models, enabling integration with the Robo undo/redo framework.
 It should be included in your model classes as any other mixin:

 Ext.define('Example.model.Branch', {
        extend      : 'Ext.data.Model',

        mixins      : { robo : 'Robo.data.Model' },

        ...
    });

 You might want to define an additional method {@link #getTitle} in your models. It will be used to build
 a transaction {@link Robo.Transaction#getTitle title}.

 */
Ext.define('Robo.data.Model', {
    extend : 'Ext.Mixin',

    /**
     * @cfg modelName
     *
     * Human readable name for transaction titles. Should be defined at the class level. This can be used
     * to build a simplified transaction title, including this "modelName" and model id.
     *
     * For detailed control of transaction titles, see {@link #getTitle} method.
     */
    modelName : null,

    editMementoFix : null,

    mixinConfig : {
        before : {
            endEdit : 'onBeforeEndEdit'
        },
        after  : {
            endEdit : 'onAfterEndEdit'
        }
    },

    // Fix for the incorrect behavior of the "previousValues" implementation in ExtJS
    onBeforeEndEdit : function (silent, modifiedFieldNames) {
        var editMemento = this.editMemento;

        if (editMemento) {
            this.editMementoFix = editMemento;

            if (!modifiedFieldNames) {
                modifiedFieldNames = this.getModifiedFieldNames(editMemento.data);
            }

            if (!editMemento.previousValues) editMemento.previousValues = {};

            Ext.Array.each(modifiedFieldNames, function (fieldName) {
                editMemento.previousValues[fieldName] = editMemento.data[fieldName];
            });
        }
    },

    onAfterEndEdit : function (silent, modifiedFieldNames) {
        delete this.editMementoFix;
    },

    /**
     * By default this method is empty, but you can override it in your models, to return a human-readable
     * title of this model instance. String should (probably) include the id of the record,
     * along with some additional information.
     *
     * For example, for the employee model you might want to return the id, first name and last name
     * (or any other important fields).
     *

     Ext.define('Example.model.Employee', {
        extend      : 'Ext.data.Model',
        mixins      : { robo : 'Robo.data.Model' },

        ...

        getTitle : function () {
            return (this.get('firstName') || '') + ' ' + (this.get('lastName') || '') + " (" + this.getId() + ")"
        }
    });

     *
     * @return {String}
     */
    getTitle : function () {
        return '';
    }
});
