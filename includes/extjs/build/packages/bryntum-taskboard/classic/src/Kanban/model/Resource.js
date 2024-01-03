/**
 * @class Kanban.model.Resource
 *
 * A data model class describing a resource in your Kanban board that can be assigned to any {@link Kanban.model.Task}.
 */
Ext.define('Kanban.model.Resource', {
    extend : 'Sch.model.Resource',

    alias  : 'model.kanban_resourcemodel',

    customizableFields : [
        /**
         * @field ImageUrl
         * @type {String}
         * The url of an image representing the resource
         */
        { name : 'ImageUrl' }
    ],

    /**
     * @cfg {String} imageUrlField The name of the field that defines the user image url. Defaults to "ImageUrl".
     */
    imageUrlField  : 'ImageUrl'
});