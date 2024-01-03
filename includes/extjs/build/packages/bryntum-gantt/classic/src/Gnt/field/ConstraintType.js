/**
 * A specialized field, allowing a user to specify task constraint type.
 * This class inherits from the standard Ext JS "combo" field, so any usual `Ext.form.field.ComboBox` configs can be used.
 *
 * In default setup the value of this field can be one of the following strings:
 *
 * - "finishnoearlierthan"
 * - "finishnolaterthan"
 * - "mustfinishon"
 * - "muststarton"
 * - "startnoearlierthan"
 * - "startnolaterthan"
 * - "assoonaspossible"
 * - "aslateaspossible"
 *
 * but if one has created a new constraint class (see {@link Gnt.constraint.Base}) then this field value
 * might be that new class alias part after the 'gntconstraint.' prefix.
 */
Ext.define('Gnt.field.ConstraintType', {
    extend                  : 'Ext.form.field.ComboBox',

    mixins                  : [
        'Gnt.field.mixin.TaskField',
        'Gnt.mixin.Localizable'
    ],

    requires                : ['Sch.patches.BoundList'],

    uses                    : ['Gnt.constraint.Base'],

    alias                   : 'widget.constrainttypefield',

    alternateClassName      : 'Gnt.widget.ConstraintType.Field',

    fieldProperty           : 'constraintTypeField',
    getTaskValueMethod      : 'getConstraintType',
    setTaskValueMethod      : 'setConstraint',

    listConfig              : {
        htmlEncode : true
    },

    /**
     * @cfg {String} pickerAlign The align for combo-box's picker.
     */
    pickerAlign             : 'tl-bl?',

    /**
     * @cfg {Boolean} matchFieldWidth Whether the picker dropdown's width should be explicitly set to match the width of the field. Defaults to true.
     */
    matchFieldWidth         : false,

    forceSelection          : true,

    triggerAction           : 'all',

    /**
     * Localication object
     */
    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - none : 'None'
     */

    initComponent : function() {
        var me          = this;
        var noneString  = me.L('none');

        me.store = me.store || Gnt.field.ConstraintType.buildDefaultConstraintTypeList(noneString);
        me.emptyText = me.emptyText || noneString;

        this.on('change', this.onFieldChange, this);
        me.callParent(arguments);

        this.optionsFilter = new Ext.util.Filter({
            id       : me.getId() + '-filter',
            filterFn : me.filterOptions,
            scope    : me
        });

        me.store.addFilter(this.optionsFilter);
    },

    filterOptions : function (record) {
        var constraintType = record.get(this.valueField),
            constraint     = Gnt.constraint.Base.getConstraintClass(constraintType);

        // we show only options applicable to the task being edited
        return !this.task || !constraintType || constraint && constraint.isApplicable(this.task);
    },

    onSetTask : function (task) {
        task = task || this.task;

        this.store && this.store.addFilter(this.optionsFilter);

        this.setValue(this.getTaskValue(task));
    },

    getErrors   : function (value) {
        var errors = this.callParent(arguments);

        if (errors && errors.length) {
            return errors;
        }

        // allow empty values by default
        if (!Ext.isEmpty(value) && !(this.findRecordByDisplay(value) || this.findRecordByValue(value))) {
            return [this.L('invalidText')];
        } else {
            return [];
        }
    },

    // will be used in the column's renderer
    valueToVisible : function (value, task) {
        var me              = this,
            displayTplData  = [];

        var record = this.findRecordByValue(!Ext.isEmpty(value) ? value : null);

        if (record) {
            displayTplData.push(record.data);
        } else if (Ext.isDefined(me.valueNotFoundText)) {
            displayTplData.push(me.valueNotFoundText || "");
        }

        return me.displayTpl.apply(displayTplData);
    },

    applyChanges : function (task) {
        var me          = this,
            value       = me.getValue(),
            constraintClass;

        task            = task || me.task;
        constraintClass = Gnt.constraint.Base.getConstraintClass(value);

        me.setTaskValue(task, value, constraintClass && constraintClass.getInitialConstraintDate(task) || null);

        // since we have an "applyChanges" method different from the one provided by "TaskField" mixin
        // we need to fire "taskupdated" ourself
        task.fireEvent('taskupdated', task, me);
    },

    findRecordByDisplay : function(value) {
        if (!value) return this.store.first();

        return this.callParent(arguments);
    },

    onFieldChange : function (field, value) {
        var me = this;

        if (!me.getSuppressTaskUpdate() && me.task && (value || this.getRawValue() == me.L('none') || (!value && !this.getRawValue()))) {
            // apply changes to task
            me.applyChanges();
        }
    },

    statics : {
        /**
         * Builds default constraint type list by scanning Gnt.constraint namespace for suitable constraint classes
         *
         * @param {String} [noneText] Text to use for no constraint item, no constraint will be prepended to the list
         *  if text is given.
         */
        buildDefaultConstraintTypeList : function(noneText) {
            var result = [];

            Ext.Array.each(Ext.ClassManager.getNamesByExpression('gntconstraint.*'), function(name) {
                var singleton = Ext.ClassManager.get(name),
                    alias     = singleton.alias[0],
                    id        = alias.split('.').pop();

                singleton && (result.push([ id, singleton.L('name') ]));
            });

            result = Ext.Array.sort(result, function(a, b) { return a[1] > b[1] ? 1 : -1; });
            noneText && result.unshift( [ null, noneText ] );

            return result;
        }
    }

});
