/**

 @class Kanban.field.TaskFilter
 @extends Ext.form.field.Text

 A text field that allows you to filter for tasks by Name in the TaskBoard view. You can filter for another field by setting the {@link #field} config.

 To filter tasks by task name:

    {
        xtype : 'filterfield',
        store : 'myTaskStore',
        field : 'Name'
    },

 To filter tasks by resource name:

    {
        xtype : 'filterfield',
        store : 'myTaskStore',
        filter : new Ext.util.Filter({
            filterFn : function (r) {
                var resource = r.getResource();

                return resource && resource.getName().toLowerCase().indexOf(this.getValue()) >= 0;
            }
        })
    },

 */
Ext.define('Kanban.field.TaskFilter', {
    extend          : 'Ext.form.TextField',
    alias           : 'widget.filterfield',
    requires        : ['Ext.util.Filter'],
    enableKeyEvents : true,
    minLength       : 2,

    /**
     * @cfg {Kanban.data.TaskStore/String} store (required) The store containing the tasks or a store identifier (storeId) identifying a store
     */
    store           : null,

    /**
     * @cfg {String} field The {@link Kanban.model.Task} field that should be used for filtering.
     */

    /**
     * @cfg {Boolean} caseSensitive True to use case sensitive filtering
     */
    caseSensitive   : false,

    /**
     * @cfg {Ext.util.Filter} filter A custom Ext JS filter that should be used for filtering.
     */

    initComponent : function () {
        this.on('change', this.onMyChange, this);

        this.store = Ext.data.StoreManager.lookup(this.store);

        this.field = this.field || this.store.getModel().prototype.nameField;

        this.filter = this.filter || new Ext.util.Filter({
            id            : this.getId() + '-filter',
            property      : this.field,
            value         : '',
            caseSensitive : this.caseSensitive,
            anyMatch      : true
        });

        this.callParent(arguments);
    },

    onMyChange : function () {
        var val = this.getValue();

        if (val && val.length >= this.minLength) {
            this.filter.setValue(val);
            this.store.addFilter(this.filter);
        } else {
            this.store.removeFilter(this.filter);
        }
    }
});
