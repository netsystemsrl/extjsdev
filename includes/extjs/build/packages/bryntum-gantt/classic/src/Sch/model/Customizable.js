/**
@class Sch.model.Customizable
@extends Ext.data.Model

This class represent a model with customizable field names. Customizable fields are defined in separate
class config `customizableFields`. The format of definition is just the same as for usual fields:

        Ext.define('BaseModel', {
            extend             : 'Sch.model.Customizable',

            customizableFields : [
                { name : 'StartDate', type : 'date', dateFormat : 'c' },
                { name : 'EndDate',   type : 'date', dateFormat : 'c' }
            ],

            fields             : [
                'UsualField'
            ],

            getEndDate : function () {
                return "foo"
            }
        });

For each customizable field will be created getter and setter, using the camel-cased name of the field ("stable name"),
prepended with "get/set" respectively. They will not overwrite any existing methods:

        var baseModel   = new BaseModel({
            StartDate   : new Date(2012, 1, 1),
            EndDate     : new Date(2012, 2, 3)
        });

        // using getter for "StartDate" field
        // returns date for "2012/02/01"
        var startDate   = baseModel.getStartDate();

        // using custom getter for "EndDate" field
        // returns "foo"
        var endDate     = baseModel.getEndDate();

You can change the name of customizable fields in a subclass of the model or completely redefine them.
To do this, add a special property to the class with the name of the field with a lowercased first
letter, appended with "Field". The value of the property should contain the new name of the field.

        Ext.define('SubModel', {
            extend         : 'BaseModel',

            startDateField : 'beginDate',
            endDateField   : 'finalizeDate',

            fields         : [
                { name : 'beginDate', type : 'date', dateFormat : 'Y-m-d' },
            ]
        });

        var subModel     = new SubModel({
            beginDate    : new Date(2012, 1, 1),
            finalizeDate : new Date(2012, 2, 3)
        });

        // name of getter is still the same
        var startDate = subModel.getStartDate();

In the example above the `StartDate` field was completely re-defined to the `beginDate` field with different date format.
The `EndDate` has just changed its name to "finalizeDate". Note, that getters and setters are always named after "stable"
field name, not the customized one.
*/
Ext.define('Sch.model.Customizable', function(thisClass) {

    return {
        extend              : 'Ext.data.Model',

        mixins              : { robo : 'Robo.data.Model' },

        isCustomizableModel : true,

        /**
        * @cfg {Array} customizableFields
        *
        * The array of customizale fields definitions.
        */
        customizableFields  : null,

        // @private
        // Keeps temporary state of the previous state for a model, but is only available
        // when a model has changed, e.g. after 'set' or 'reject'. After those operations are completed, this property is cleared.
        previous            : null,

        // temp flag to check if we're currently editing the model
        __editing           : null,

        // To support nested beginEdit calls (see 043_nested_beginedit.t.js in Gantt)
        __editCounter       : 0,

        constructor : function() {
            // Sencha Touch requires the return value to be returned, hard crash without it
            var retVal = this.callParent(arguments);

            return retVal;
        },

        storePreviousFlex : Ext.Function.flexSetter(function(fieldName, value) {
            var me = this,
                currentValue = me.get(fieldName);

            // convert new value to Date if needed
            if (currentValue instanceof Date && !(value instanceof Date)) {
                value = me.getField(fieldName).convert(value, me);
            }

            // Store previous field value if it changed, if value didn't change - just return
            if ((currentValue instanceof Date && (currentValue - value)) || !(currentValue instanceof Date) && currentValue !== value) {
                me.previous[fieldName] = currentValue;
            }
        }),

        deletePreviousFlex : Ext.Function.flexSetter(function(fieldName, value) {
            delete this.previous[fieldName];
        }),

        // Overridden to be able to track previous record field values
        set : function(fieldName, value) {
            var me = this,
                ownPrevious = false,
                result = null;

            if (!me.previous) {
                ownPrevious = true;
                me.previous = {};
            }

            me.storePreviousFlex(fieldName, value);

            // This call is mandatory, otherwise model's dirty flag / modified fields might not be properly reset
            result = me.callParent(arguments);

            if (!me.__editing) {
                if (ownPrevious) {
                    delete me.previous;
                }
                else {
                    me.deletePreviousFlex(fieldName, value);
                }
            }

            return result;
        },

        // Overridden to be able to track previous record field values
        reject : function () {
            var me = this,
                modified = me.modified || {},
                field;

            // Ext could call 'set' during the callParent which should not reset the 'previous' object
            me.__editing = true;

            me.previous = me.previous || {};

            for (field in modified) {
                if (modified.hasOwnProperty(field)) {
                    if (typeof modified[field] != "function") {
                        me.previous[field] = me.get(field);
                    }
                }
            }
            me.callParent(arguments);

            // Reset the previous tracking object
            delete me.previous;
            me.__editing = false;
        },

        // -------------- Supporting nested beginEdit calls - see test 043_nested_beginedit.t.js
        beginEdit: function () {
            this.__editCounter++;
            this.__editing = true;

            this.callParent(arguments);
        },

        cancelEdit: function () {
            this.__editCounter = 0;
            this.__editing = false;
            this.callParent(arguments);

            delete this.previous;
        },

        // Overridden to be able to clear the previous record field values. Must be done here to have access to the 'previous' object after
        // an endEdit call.
        endEdit: function (silent, modifiedFieldNames) {
            if (--this.__editCounter === 0) {

                // OVERRIDE HACK: If no fields were changed, make sure no events are fired by signaling 'silent'
                if (!silent && this.getModifiedFieldNames /* Touch doesn't have this method, skip optimization */ ) {
                    var editMemento = this.editMemento;
                    if (!modifiedFieldNames) {
                        modifiedFieldNames = this.getModifiedFieldNames(editMemento.data);
                    }

                    if (modifiedFieldNames && modifiedFieldNames.length === 0) {
                        silent = true;
                    }
                }

                this.callParent([silent].concat(Array.prototype.slice.call(arguments, 1)));

                this.__editing = false;
                delete this.previous;
            }
        }
        // -------------- EOF Supporting nested beginEdit calls - see test 043_nested_beginedit.t.js
    };
}, function(thisClass) {

    // thisClass.onExtended() used few lines below puts a provided function to the end of thisClass.$onExtended array.
    // That's why we cannot use it. We need this function to start early to be able to backup originally defined "fields" config.
    // Ext.data.Model provided a function to onExtended that removes the config and it stays earlier in the thisClass.$onExtended queue.
    // So we simply put our function to the beginning of thisClass.$onExtended.
    thisClass.$onExtended.unshift({
        fn : function (cls, data) {
            if (data) {
                if (Ext.isArray(data)) {
                    cls.fieldsInitialValue = data.slice();
                } else if (data.fields) {
                    if (!Ext.isArray(data.fields)) {
                        cls.fieldsInitialValue = [data.fields];
                    } else {
                        cls.fieldsInitialValue = data.fields.slice();
                    }
                }
            }
        }
    });

    thisClass.onExtended(function (cls, data, hooks) {
        var classManager           = Ext.ClassManager,
            triggerCreatedOriginal = classManager.triggerCreated;

        // just before the ClassManager notifies that the class is ready we do our fields adjustments
        classManager.triggerCreated = function (className) {
            var proto = cls.prototype;

            // Combining our customizable fields with ones collected by the superclass.
            // This array has all the inherited customizable fields (yet some of them might be duplicated because of overrides)
            if (proto.customizableFields) {
                proto.allCustomizableFields = (cls.superclass.allCustomizableFields || []).concat(proto.customizableFields);
            } else {
                proto.allCustomizableFields = (cls.superclass.allCustomizableFields || []);
            }

            // we will collect fields here, overwriting old ones with new to remove duplication
            var customizableFieldsByName = {};

            Ext.Array.each(proto.allCustomizableFields, function (field) {
                // normalize to object
                if (typeof field == 'string') field = { name : field };

                customizableFieldsByName[ field.name ] = field;
            });

            // already processed by the Ext.data.Model `onBeforeCreated`
            var fields                  = proto.fields;
            var toAdd                   = [];
            var toRemove                = [];

            Ext.Array.each(fields, function (field) {
                if (field.isCustomizableField) {
                    toRemove.push(field.getName());
                }
            });

            if (proto.idProperty !== 'id' && proto.getField('id')) {

                if (!proto.getField('id').hasOwnProperty('name')) {
                    toRemove.push('id');
                }
            }

            if (proto.idProperty !== 'Id' && proto.getField('Id')) {

                if (!proto.getField('Id').hasOwnProperty('name')) {
                    toRemove.push('Id');
                }
            }

            cls.removeFields(toRemove);

            // Finds the provided field config in the provided array of configs
            // and applies it to the provided resulting object (using Ext.applyIf)
            // @param result Resulting configuration object
            // @param fields Array of field configs
            // @param fieldName Field name
            function applyFieldConfig (result, fields, fieldName) {
                if (!fields) return;

                if (!Ext.isArray(fields)) fields = [fields];

                var fieldConfig;

                for (var i = fields.length - 1; i >= 0; i--) {
                    if (fields[i].name == fieldName) {
                        fieldConfig = fields[i];
                        break;
                    }
                }

                Ext.applyIf(result, fieldConfig);
            }

            // Collects the provided customizable field config based on the class inheritance
            // @param stableFieldName Stable field name (the one provided as "name" in the "customizableFields" section)
            // @return Field config
            function getFieldConfig (stableFieldName) {
                var c             = cls,
                    proto         = c.prototype,
                    fieldProperty = stableFieldName === 'Id' ? 'idProperty' : stableFieldName.charAt(0).toLowerCase() + stableFieldName.substr(1) + 'Field',
                    result        = {
                        name                : proto[ fieldProperty ] || stableFieldName,
                        isCustomizableField : true
                    },
                    fieldName;

                while (proto && proto.isCustomizableModel) {
                    fieldName = proto[ fieldProperty ] || stableFieldName;

                    // first apply "customizableFields" config data
                    // ..we use applyIf() and "customizableFields" has higher priority than "fields" config
                    proto.hasOwnProperty('customizableFields') && applyFieldConfig(result, proto.customizableFields, stableFieldName);

                    // apply "fields" config data
                    applyFieldConfig(result, c.fieldsInitialValue, fieldName);

                    // proceed to parent class
                    proto = c.superclass;
                    c     = proto && proto.self;
                }

                return result;
            }

            // let's reset array there might be some more fields to remove
            toRemove = [];

            Ext.Object.each(customizableFieldsByName, function (name, customizableField) {
                var stableFieldName     = customizableField.name || customizableField.getName();
                var fieldProperty       = stableFieldName === 'Id' ? 'idProperty' : stableFieldName.charAt(0).toLowerCase() + stableFieldName.substr(1) + 'Field';

                var realFieldName       = proto[ fieldProperty ] || stableFieldName;

                // if such field already exists we will remove it
                proto.getField(realFieldName) && toRemove.push(realFieldName);

                var field = getFieldConfig(stableFieldName);

                // we create a new copy of the `customizableField` using possibly new name
                toAdd.push(Ext.create('data.field.' + (field.type || 'auto'), field));

                var capitalizedStableName  = Ext.String.capitalize(stableFieldName);

                // don't overwrite `getId` method
                if (capitalizedStableName != 'Id') {
                    var getter              = 'get' + capitalizedStableName;
                    var setter              = 'set' + capitalizedStableName;

                    // overwrite old getters, pointing to a different field name
                    if (!proto[ getter ] || proto[ getter ].__getterFor__ && proto[ getter ].__getterFor__ != realFieldName) {
                        proto[ getter ] = function () {
                            // Need to read this property from the prototype if it exists, instead of relying on the field
                            // Since if someone subclasses a model and redefines a fieldProperty - the realFieldName variable
                            // will still have the value of the superclass
                            // See test 024_event.t.js
                            return this.get(this[fieldProperty] || realFieldName);
                        };

                        proto[ getter ].__getterFor__   = realFieldName;
                    }

                    // same for setters
                    if (!proto[ setter ] || proto[ setter ].__setterFor__ && proto[ setter ].__setterFor__ != realFieldName) {

                        proto[ setter ] = function (value) {
                            // Need to read this property from the prototype if it exists, instead of relying on the field
                            // Since if someone subclasses a model and redefines a fieldProperty - the realFieldName variable
                            // will still have the value of the superclass
                            // See test 024_event.t.js
                            return this.set(this[fieldProperty] || realFieldName, value);
                        };

                        proto[ setter ].__setterFor__   = realFieldName;
                    }
                }
            });

            cls.replaceFields(toAdd, toRemove);

            // call && restore original Ext.ClassManager.triggerCreated function
            triggerCreatedOriginal.apply(this, arguments);
            classManager.triggerCreated = triggerCreatedOriginal;
        };
    });
});
