/**

 @class Gnt.field.Assignment
 @extends Ext.form.field.Picker

 A specialized field to be used for editing in the {@link Gnt.column.ResourceAssignment} column.

 */

Ext.define('Gnt.field.Assignment', {
    extend : 'Ext.form.field.Picker',

    alias              : [ 'widget.assignmentfield', 'widget.assignmenteditor' ],
    alternateClassName : 'Gnt.widget.AssignmentField',

    requires : [
        'Gnt.widget.AssignmentGrid'
    ],

    mixins : [ 'Gnt.mixin.Localizable' ],

    matchFieldWidth : false,
    editable        : false,
    selectOnFocus   : false,
    task            : null,
    focusTimer      : null,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - cancelText : 'Cancel',
     - closeText  : 'Save and Close'
     */

    /**
     * @cfg {Gnt.data.AssignmentStore} assignmentStore A store with assignments
     */
    assignmentStore : null,

    /**
     * @cfg {Gnt.data.ResourceStore} resourceStore A store with resources
     */
    resourceStore : null,

    /**
     * @cfg {Object} gridConfig A custom config object used to configure the Gnt.widget.AssignmentGrid instance
     */
    gridConfig : null,

    /**
     * @cfg {String} formatString A string defining how an assignment should be rendered. Defaults to '{0} [{1}%]'
     */
    formatString : '{0} [{1}%]',

    /**
     * @cfg {String} unitDecimalPrecision The number of decimals to show after the unit value (e.g. a value of 1 would produce [Mike 46.3%])
     */
    unitDecimalPrecision : 1,

    /**
     * @cfg {Boolean} [expandPickerOnFocus=false] true to show the grid picker when this field receives focus.
     */
    expandPickerOnFocus : false,

    /**
     * @cfg {Boolean} [returnFocusToField=true] Weither picker should return focus to the field after collapsing
     */
    returnFocusToField : true,

    initEvents : function() {
        var me = this;

        me.callParent();

        me.on({
            'expand'   : me.onExpandHandler,
            'collapse' : me.onCollapseHandler,
            scope : me
        });
    },

    onFocusEnter : function(e) {
        var me = this;

        me.callParent([e]);

        me.expandPickerOnFocus && me.expand();
    },

    focusPickerView : function() {
        var me = this,
            pickerView = me.getPicker().getView();

        // Transfering focus to picker
        pickerView.focusCell((new Ext.grid.CellContext(pickerView)).setPosition(0, 0));
    },

    // TODO: transform it to onExpand() template method as soon as it will be documented as @template/@protected
    onExpandHandler : function () {
        var me      = this,
            picker  = me.getPicker(),
            timeout = (Ext.versions.extjs.isGreaterThanOrEqual('6.6.0') && Ext.isIE) ? 100 : 10;

        // Select the assigned resource in the grid
        picker.loadTaskAssignments(this.task.getId());

        // Can't use me.getFocusTask().delay() here, since the focus task is shared among all the currently
        // instantiated components, and the delayed me.focusPickerView() call will be cancelled by the grid's navigation
        // model, in case the field is used as grid's editor, due to some cumbersome grid's navigation model logic
        // I have no time to investigate.
        this.focusTimer = Ext.Function.defer(function () {
            me.focusPickerView();
        }, timeout);
    },

    // TODO: transform it to onCollapse() template method as soon as it will be documented as @template/@protected
    onCollapseHandler : function() {
        var me = this;

        // #4612 Force editing to stop to apply changes
        me.picker.setActionableMode(false);

        // Returning focus back to field's input element if requested and field still marked as the one obtained
        // the focus (me.hasFocus == true), the field won't has focus in case we are collapsed due to actual focus
        // lost (see Ext.form.field.Picker::onFocusLeave())
        me.returnFocusToField && me.hasFocus && me.focus(true); // This should focus field's input element
    },

    createPicker : function () {
        var grid = Ext.widget(Ext.apply({
            xclass   : 'Gnt.widget.AssignmentGrid',
            ownerCmp : this,

            resourceStore   : this.task.getResourceStore(),
            assignmentStore : this.task.getAssignmentStore(),

            fbar      : this.buildButtons(),
            listeners : {
                cellkeydown : function (view, cell, cellIndex, record, tr, rowIndex, e) {
                    var column = view.headerCt.getComponent(cellIndex);

                    // Collapse picker on ESC key press
                    if (e.getKey() === e.ESC && !grid.isEditing()) {
                        this.collapse();
                    }
                    else if (e.getKey() === e.ENTER && !grid.isEditing() && !(column.field || column.editor)) {
                        this.onSaveClick();
                    }
                },
                scope : this
            }
        }, this.gridConfig || {}));

        return grid;
    },

    buildButtons : function () {
        return [
            '->',
            {
                text : this.L('closeText'),

                handler : function () {
                    // When clicking on `close` button with editor visible
                    // the grid will be destroyed right away and seems in IE (and sporadically in FF)
                    // there will be no `blur` event for the editor.
                    // Doing a defer to let the editor to process the `blur` first
                    // and only then close the editor window.
                    this.saveTimer = Ext.defer(this.onSaveClick, Ext.isIE ? 60 : 30, this);
                },
                scope   : this
            },
            {
                text : this.L('cancelText'),

                handler : function () {
                    this.collapse();
                },
                scope   : this
            }
        ];
    },

    setTask : function (task) {
        this.task = task;
        this.setRawValue(this.getFieldDisplayValue(task));
    },

    onSaveClick : function () {
        // Update the assignment store with the assigned resource data
        var sm         = this.picker.getSelectionModel(),
            selections = sm.selected;

        this.picker.saveTaskAssignments();

        this.collapse();

        this.setRawValue(this.getFieldDisplayValue(this.task));

        this.fireEvent('select', this, selections);
    },

    isDirty : function (task) {
        task = task || this.task;
        if (!task) return false;

        var assignmentStore = this.picker && this.picker.assignmentStore || task.getAssignmentStore(),
            assignments     = task.getAssignments();

        // check if some of task assignments are dirty
        for (var i = 0, l = assignments.length; i < l; i++) {
            if (assignments[ i ].dirty || assignments[ i ].phantom) return true;
        }

        if (assignmentStore) {
            assignments = assignmentStore.getRemovedRecords();
            // check if there are some unsaved assignments removed from the task
            for (i = 0, l = assignments.length; i < l; i++) {
                if (assignments[ i ].getTaskId() == task.getId()) return true;
            }
        }

        return false;
    },

    getFieldDisplayValue : function (task) {
        task          = task || this.task;
        var precision = this.unitDecimalPrecision;

        var resourceNames = Ext.Array.map(task.getAssignments(), function (assignment) {
            var units         = parseFloat(Ext.Number.toFixed(assignment.getUnits(), precision));
            var formattedName = Ext.String.format(this.formatString, assignment.getResourceName(), units);

            return Ext.htmlEncode(formattedName);
        }, this);

        return resourceNames.join(', ');
    },

    destroy : function () {
        clearTimeout(this.focusTimer);
        clearTimeout(this.saveTimer);

        this.callParent(arguments);
    }
});
