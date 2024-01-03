/**

 @class Kanban.field.TaskHighlight
 @extends Ext.form.field.Text

 A text field that allows you to highlight certain tasks in the TaskBoard view.
 */
Ext.define('Kanban.field.TaskHighlight', {
    extend            : 'Ext.form.TextField',
    alias             : 'widget.highlightfield',

    mixins          : ['Ext.AbstractPlugin'],

    enableKeyEvents   : true,
    minLength         : 2,
    preventMark       : true,

    /**
     * @cfg {Kanban.view.TaskBoard} panel (required) The kanban panel
     */
    panel             : null,

    /**
     * @cfg {String} field The {@link Kanban.model.Task} field that should be used for filtering.
     */
    field             : 'Name',

    /**
     * @cfg {Boolean} caseSensitive True to use case sensitive filtering
     */
    caseSensitive     : false,

    initComponent : function () {
        this.on('keyup', this.onMyKeyUp, this);

        this.callParent(arguments);
    },

    onMyKeyUp : function(field, e) {
        var val = this.getValue();

        if (val && val.length >= this.minLength) {
            var matches = [];
            val = this.caseSensitive ? val : val.toLowerCase();

            this.panel.highlightTasksBy(function(rec) {
                var name    = this.caseSensitive ? rec.data[this.field] : rec.data[this.field].toLowerCase();

                return name && name.indexOf(val) >= 0;
            }, this);

        } else {
            this.panel.clearHighlight();
        }
    }
});
