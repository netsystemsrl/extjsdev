/**
@class Sch.plugin.TreeCellEditing
@extends Ext.grid.plugin.CellEditing

A specialized "cell editing" plugin (ptype = 'scheduler_treecellediting'), purposed to correctly work with trees. Add it to your component (scheduler with tree view or gantt)
as usual grid plugin:

    var gantt = Ext.create('Gnt.panel.Gantt', {

        plugins             : [
            Ext.create('Sch.plugin.TreeCellEditing', {
                clicksToEdit: 1
            })
        ],
        ...
    })

This class allows us to do 'complex data editing', which is not supported by the regular CellEditing plugin or the Ext.grid.CellEditor which
 assumes a column is always tied to a single field existing on the grid store model (which is not the case for Gantt, dependencies, assignments etc).
*/
Ext.define('Sch.plugin.TreeCellEditing', {
    extend              : 'Ext.grid.plugin.CellEditing',
    alias               : 'plugin.scheduler_treecellediting',

    requires : [
        'Sch.patches.Element_6_5'
    ],

    lockableScope       : 'locked',

    editorsStarted      : 0,

    init : function () {
        // This is used to prevent editing of readonly cells
        this.on('beforeedit', this.onMyBeforeEdit, this);

        this.callParent(arguments);
    },

    getEditor : function () {
        var editor = this.callParent(arguments);

        // Patch editor to suspend task updates during the editor initialization

        if (editor && !editor._startEdit) {

            var startEdit = editor._startEdit = editor.startEdit;

            editor.startEdit = function () {
                var field = this.field,
                    result;

                // if it's a task field - suspend task updates
                if (field && field.isTaskField) {
                    field.setSuppressTaskUpdate(true);
                }

                // call original method
                result = startEdit.apply(this, arguments);

                // resume task updates back
                if (field && field.isTaskField) {
                    field.setSuppressTaskUpdate(false);
                }

                return result;
            };
        }

        return editor;
    },

    activateCell : function (position) {
        var editing = this.callParent(arguments);

        if (editing) {
            var editor = this.getEditor(position.record, position.column);

            // we override the editor editor.cancelEdit method
            if (!editor._cancelEdit) {
                editor._cancelEdit = editor.cancelEdit;
                editor.cancelEdit = this.myCancelEdit;
            }

            this.fireEvent('editingstart', this, editor);
        }

        return editing;
    },

    // private
    //cacheDeactivatedEditors: function() {
    //    var me = this,
    //        editors = me.editors.items,
    //        len = editors.length,
    //        i, editor,
    //        detachedBody = Ext.getDetachedBody();
    //    for (i = 0; i < len; i++) {
    //        editor = editors[i];
    //        if (!editor.isVisible()) {
    //            detachedBody.dom.appendChild(editor.el.dom);
    //            editor.container = detachedBody;
    //
    //            // Restore default properties to allow this elements to be collected by GC
    //            editor.el.skipGarbageCollection = false;
    //            editor.el.select('*').each(function (node) {
    //                Ext.get(node).skipGarbageCollection = false;
    //            });
    //        }
    //    }
    //},

    /*
     * Checks if the panel is not locked for editing, and prevents cell edits if needed
     */
    checkReadOnly : function () {
        var pnl = this.getCmp();

        if (pnl) {
            if (!pnl.isTimelineTreePanel && !pnl.isTimelineGridPanel) {
                pnl = pnl.up('tablepanel');
            }

            return !pnl.isReadOnly();
        }
    },

    // @OVERRIDE - model set() method, since we need to do more than just a simple update of a Model field in certain editors
    // Check for 'applyChanges' method and call it if exists
    onEditComplete : function (ed, value, startValue) {
        var me = this;

        // if field instance contains applyChanges() method
        // then we delegate saving to it
        // TODO: this should be refactored
        if (ed.field.applyChanges) {
            // for Date values value !== startValue doesn't work
            if ((value instanceof Date && (value - startValue)) || !(value instanceof Date) && value !== startValue) {
                ed.field.applyChanges(ed.field.task || me.context.record);
            }
            // Calling parent with value === startValue makes it not to call record.set() method, we don't need it
            // to be called since changes are already applyed, but leaves all other functionality inplace.
            return me.callParent([ed, value, value]);
        }
        else {
            return me.callParent([ed, value, startValue]);
        }
    },


    // While canceling editing we force the field to persist "originalValue" back to the task
    // if the field is a TaskField mixed instance
    myCancelEdit : function () {
        var me      = this,
            field   = me.field;

        if (field && field.applyChanges) {
            var instantUpdate = field.instantUpdate;

            // we force the field to persist "originalValue" back to the task
            field.instantUpdate = true;
            var result = me._cancelEdit.apply(this, arguments);
            field.instantUpdate = instantUpdate;

            return result;

        } else {
            return me._cancelEdit.apply(this, arguments);
        }
    },

    onMyBeforeEdit : function (sender, context) {

        var field = context.column.getEditor();

        // if it's a field mixed with TaskField mixin
        if (field && field.setTask) {
            // then after setTask calling field already has correct value
            field.setTask(context.record);

            // Sencha will force value from record and will negate effect of this method, so we pass value through
            // using special property. see line 210782 in ext-all-debug 6.0.2
            context._valueFromTaskField = field.getValue();
        }

        return this.checkReadOnly();
    },

    // OVERRIDE private method
    setEditingContext   : function (context) {
        if (context.hasOwnProperty('_valueFromTaskField')) {
            context.value = context.originalValue = context._valueFromTaskField;
            delete context._valueFromTaskField;
        }

        this.callParent(arguments);
    }

});
