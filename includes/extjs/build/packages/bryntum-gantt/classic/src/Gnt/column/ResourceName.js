/*
 * @class Gnt.column.ResourceName
 * @extends Ext.grid.Column
 * @private
 * Private class used inside Gnt.widget.AssignmentGrid.
 */
Ext.define('Gnt.column.ResourceName', {
    extend         : 'Ext.grid.column.Column',
    alias          : 'widget.resourcenamecolumn',
    mixins         : ['Gnt.mixin.Localizable'],

    flex           : 1,
    align          : 'left',
    resourceStore  : null,

    constructor : function (config) {
        config = config || {};

        this.text   = config.text || this.L('text');

        Ext.apply(this, config);

        this.scope = this.scope || this;

        this.sorter = this.sorter || new Ext.util.Sorter({
            sorterFn : Ext.Function.bind(this.sortFn, this)
        });

        this.callParent(arguments);
    },

    renderer      : function (value, m, assignment) {
        var resource = assignment.getResource(this.resourceStore);

        return Ext.htmlEncode(resource && resource.getName() || value);
    },

    sortFn : function (as1, as2) {
        return as1.getResourceName(this.resourceStore) < as2.getResourceName(this.resourceStore) ? -1 : 1;
    }
});
