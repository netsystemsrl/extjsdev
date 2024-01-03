/**
 * A specialized field allowing a user to also specify duration unit when editing the duration value.
 * This class inherits from the standard Ext JS "number" field, so any usual Ext.form.field.Number
 * configs can be used (like `minValue/maxValue` etc).
 */
Ext.define('Gnt.field.Duration', {
    extend                  : 'Ext.form.field.Number',

    requires                : [
        'Gnt.util.DurationParser',
        'Gnt.field.trigger.DurationSpinner'
    ],

    mixins                  : ['Gnt.field.mixin.TaskField', 'Gnt.mixin.Localizable'],

    alias                   : 'widget.durationfield',
    alternateClassName      : 'Gnt.widget.DurationField',

    disableKeyFilter        : true,
    allowExponential        : false,
    minValue                : 0,


    /**
     * @cfg {String} durationUnit The duration unit to use when editing the value.
     * **Beware:** If provided this option will force to use the provided duration unit for all the edited tasks
     * and will change the tasks {@link Gnt.model.Task#DurationUnit DurationUnit} field value.
     *
     * When the option is not provided the field using unit from the `DurationUnit` field of the task.
     */
    durationUnit            : '',

    config                  : {
        triggers : {
            spinner : {
                type        : 'gantt_durationspinner',
                upHandler   : 'onSpinnerUpClick',
                downHandler : 'onSpinnerDownClick',
                scope       : 'this'
            }
        }
    },

    /**
     * @cfg {String} invalidText Text shown when field value cannot be parsed to valid duration.
     * If you want to change the text for all instances of this class please use {@link #l10n l10n} instead.
     */
    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:
     *
     * - invalidText : 'Invalid duration value'
     */

    /**
     * @cfg {Boolean} useAbbreviation When set to `true` the field will use short names of unit durations
     * (as returned by {@link Sch.util.Date#getShortNameOfUnit})
     */
    useAbbreviation         : false,

    getDurationUnitMethod   : 'getDurationUnit',
    setTaskValueMethod      : 'setDuration',
    getTaskValueMethod      : 'getDuration',

    fieldProperty           : 'durationField',

    durationParser          : null,
    durationParserConfig    : null,

    constructor : function (config) {
        var me = this;

        Ext.apply(this, config);

        // durationUnit is used for all calculations, store config value to special property to reset later
        this.originalDurationUnit = this.durationUnit;

        this.durationParser = new Gnt.util.DurationParser(Ext.apply({
            // Since we're reusing the NumberField's parsing of numbers, we have to pass this on to the parser
            // to avoid having the same definitions in the parser too
            parseNumberFn   : function() { return me.parseValue.apply(me, arguments); },
            allowDecimals   : this.decimalPrecision > 0

        }, this.durationParserConfig));

        this.callParent(arguments);

        this.invalidText = this.L('invalidText');
    },

    onSetTask : function () {
        // If field is configured with some duration unit - use it and convert value accordingly.
        // Otherwise - take from task
        this.durationUnit = this.originalDurationUnit || this.task[this.getDurationUnitMethod]();

        var value = this.getTaskValueMethod ? this.getTaskValue(null, this.durationUnit) : this.task.get(this.task[this.fieldProperty]);

        this.setValue(value);

        this.setSpinUpEnabled(value == null || value < this.maxValue, true);
        this.setSpinDownEnabled(value > this.minValue, true);
    },

    rawToValue : function (rawValue) {
        var parsed  = this.parseDuration(rawValue);

        if (!parsed) return null;

        this.durationUnit    = parsed.unit;

        return parsed.value != null ? parsed.value : null;
    },

    valueToVisible : function (value, durationUnit) {
        if (Ext.isNumber(value)) {
            var valueInt    = parseInt(value, 10),
                valueFixed  = Ext.Number.toFixed(value, this.decimalPrecision);

            return String(valueInt == valueFixed ? valueInt : valueFixed).replace('.', this.decimalSeparator) + ' ' +
                Sch.util.Date[ this.useAbbreviation ? 'getShortNameOfUnit' : 'getReadableNameOfUnit' ](durationUnit || this.durationUnit, value !== 1);
        }

        return '';
    },

    valueToRaw : function (value) {
        // Duration unit is empty string by default, in case it is missing - use hours
        return this.valueToVisible(value, this.durationUnit || 'h', this.decimalPrecision, this.useAbbreviation);
    },

    parseDuration : function (value) {
        if (value == null) {
            return null;
        }

        var duration = this.durationParser.parse(value);

        if (!duration) {
            return null;
        }

        duration.unit = duration.unit || this.durationUnit;

        return duration;
    },


    /**
     * Returns an object, representing the current value of the field:

    {
        value   : ... // duration value,
        unit    : ... // duration unit
    }

     * @return {Object}
     */
    getDurationValue : function () {
        return this.parseDuration(this.getRawValue());
    },


    getErrors : function (value) {
        var parsed;

        if (value) {
            parsed   = this.parseDuration(value);

            if (!parsed) {
                return [ this.L('invalidText') ];
            }

            value   = parsed.value;
        }

        // https://www.sencha.com/forum/showthread.php?306347-Number-field-throw-exception-when-validating-value
        if (arguments.length > 0 && value == null) {
            value = '';
        }

        return this.callParent(arguments);
    },


    // @OVERRIDE
    checkChange : function () {
        if (!this.suspendCheckChange) {
            var me = this,
                newVal = me.getDurationValue(),
                oldVal = me.lastValue;

            var isDifferent = newVal && !oldVal || !newVal && oldVal || newVal && oldVal &&
                (newVal.value != oldVal.value || newVal.unit != oldVal.unit);

            if (isDifferent && !me.isDestroyed) {
                me.lastValue = newVal;
                me.fireEvent('change', me, newVal, oldVal);
                me.onChange(newVal, oldVal);
            }
        }
    },

    // @OVERRIDE
    getValue : function () {
        return this.value;
    },


    /**
     * This method applies the changes from the field to the bound task or to the task provided as 1st argument.
     * If {@link #instantUpdate} option is enabled this method is called automatically after any change in the field.
     *
     * @param {Gnt.model.Task} [toTask] The task to apply the changes to. If not provided, changes will be applied to the last bound task
     * (with {@link #task} config option or {@link #setTask) method)
     */
    applyChanges : function (toTask) {
        toTask = toTask || this.task;

        this.setTaskValue(toTask, this.getValue(), this.durationUnit);

        // since we have an "applyChanges" method different from the one provided by "TaskField" mixin
        // we need to fire "taskupdated" ourself
        toTask.fireEvent('taskupdated', toTask, this);
    },

    // @OVERRIDE
    onBlur: function(e) {
        var me = this;

        // Field only return duration value, not unit. When editing stops and instantUpdate is disabled duration
        // unit change will be ignored, unless we force it.
        me.blurring = true;

        var result = me.callParent(arguments);

        me.blurring = false;

        return result;
    },

    // @OVERRIDE
    setValue : function (value, forceUpdate) {
        var val                 = value;

        if (Ext.isObject(value)) {
            this.durationUnit   = value.unit;
            val                 = value.value;
        }

        this.callParent([ val ]);

        if (!this.readOnly && (forceUpdate || this.blurring || this.instantUpdate) && !this.getSuppressTaskUpdate() && this.task) {
            // apply changes to task
            this.applyChanges();
        }
    },

    // @private
    // it's called in editor.completeEdit()
    assertValue : function () {
        var me      = this,
            oldVal  = me.getValue(),
            oldUnit = me.durationUnit,
            newVal  = me.getDurationValue();

        if (this.isValid()) {
            var isDifferent = /*newVal && !oldVal ||*/ !newVal && oldVal || newVal &&
                (newVal.value != oldVal || newVal.unit != oldUnit);

            if (isDifferent) {
                // at this point `setValue` should apply any changes from the field to the task
                // even if `instantUpdate` is disabled
                me.setValue(newVal, true);
            }
        }
    },

    // @OVERRIDE
    beforeBlur : function () {
        this.assertValue();
    },

    onSpinUp: function() {
        var me = this;

        if (!me.readOnly) {
            var value   = me.getValue() || 0;

            me.setSpinValue(Ext.Number.constrain(value + me.step, me.minValue, me.maxValue));
        }
    },

    onSpinDown: function() {
        var me = this;

        if (!me.readOnly) {
            var value   = me.getValue() || 0;

            me.setSpinValue(Ext.Number.constrain(value - me.step, me.minValue, me.maxValue));
        }
    }
});
