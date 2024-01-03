/**
 * {@img gantt/images/dependency-editor.png}
 *
 * A plugin which shows the dependency editor panel, when a user double-clicks a dependency line or arrow.
 *
 * You can add it to your gantt chart like this:
 *
 * ```javascript
 * var gantt = Ext.create('Gnt.panel.Gantt', {
 *     ...
 *     plugins : [
 *         {
 *             ptype      : 'gantt_dependencyeditor',
 *             // hide the editor if clicked outside it
 *             hideOnBlur : true
 *         }
 *     ],
 *     ...
 * })
 * ```
 * ##Customizing fields
 *
 * To customize the fields created by this plugin, override the {@link #buildFields} method.
 *
 * ```javascript
 * Ext.define('MyDependencyEditor', {
 *     extend : 'Gnt.plugin.DependencyEditor',
 *
 *     buildFields : function () {
 *         var fields = this.callParent(arguments);
 *
 *         // add extra "foo" field
 *         fields.push(new Ext.form.NumberField({
 *             name       : 'foo',
 *             fieldLabel : 'Bar'
 *         });
 *
 *         return fields;
 *     }
 * });
 * ```
 */
Ext.define("Gnt.plugin.DependencyEditor", {
    extend : "Ext.form.Panel",
    alias  : 'plugin.gantt_dependencyeditor',
    // ptype isn't filled automatically, because we do not extend AbstractPlugin
    ptype  : 'gantt_dependencyeditor',
    mixins : ['Ext.AbstractPlugin', 'Gnt.mixin.Localizable'],

    requires : [
        'Ext.data.ArrayStore',
        'Ext.util.Filter',
        'Ext.form.field.Display',
        'Ext.form.field.ComboBox',
        'Gnt.model.Dependency',
        'Gnt.field.Duration'
    ],

    /**
     * @cfg {Boolean} hideOnBlur True to hide this panel if a click is detected outside the panel (defaults to true)
     */
    hideOnBlur : true,

    /**
     * @cfg {Boolean} saveOnEnter True to save the form data and close if ENTER is pressed in one of the input fields inside the panel.
     */
    saveOnEnter : true,

    /**
     * @cfg {Object} l10n
     * A object, purposed for the class localization. Contains the following keys/values:

     - fromText         : 'From',
     - toText           : 'To',
     - typeText         : 'Type',
     - lagText          : 'Lag',
     - endToStartText   : 'Finish-To-Start',
     - startToStartText : 'Start-To-Start',
     - endToEndText     : 'Finish-To-Finish',
     - startToEndText   : 'Start-To-Finish',
     - okButtonText     : 'Ok',
     - cancelButtonText : 'Cancel',
     - deleteButtonText : 'Delete'
     */

    /**
     * @cfg {Object/false} lagField
     * Configuration object for the {@link #property-lagField lag editor}.
     *
     * Provide `false` to neither display nor create the {@link #lagField lag editor}.
     */

    /**
     * The {@link Gnt.model.Dependency#Lag lag} editor
     * @property {Gnt.field.Duration} lagField
     */
    lagField : null,

    /**
     * @cfg {Boolean} showLag
     * @deprecated Please use {@link #cfg-lagField} config to hide the {@link #property-lagField lag editor}.
     * `False` to hide the {@link #property-lagField lag editor}
     */
    showLag : true,

    /**
     * @cfg {String} triggerEvent
     * The event upon which the editor shall be shown. Defaults to 'dependencydblclick'.
     */
    triggerEvent : 'dependencydblclick',

    /**
     * @cfg {Boolean} constrain
     * Pass `true` to enable the constraining - ie editor panel will not exceed the document edges. This option will disable the animation
     * during the expansion.
     */
    constrain : true,

    lockableScope : 'top',
    // we don't use header at all
    header        : false,
    border        : false,
    frame         : true,
    labelWidth    : 60,
    fieldWidth    : 280,
    floating      : true,
    hideMode      : 'offsets',
    bodyPadding   : 10,
    model         : null,

    initComponent : function () {
        this.defaults = this.defaults || {};

        Ext.applyIf(this.defaults, {
            labelWidth : this.labelWidth,
            width      : this.fieldWidth
        });

        this.buttons = this.hasOwnProperty('buttons') ? this.buttons : (this.buttons || [
            {
                text    : this.L('okButtonText'),
                itemId  : 'okbutton',
                scope   : this,
                handler : this.onSaveClick
            },
            {
                text    : this.L('cancelButtonText'),
                itemId  : 'cancelbutton',
                scope   : this,
                handler : function () {
                    this.collapse();
                }
            },
            {
                text    : this.L('deleteButtonText'),
                itemId  : 'deletebutton',
                scope   : this,
                handler : function () {
                    var dependencyStore = this.taskStore && this.taskStore.getDependencyStore();
                    dependencyStore.remove(this.dependencyRecord);
                    this.collapse();
                }
            }
        ]);

        this.callParent(arguments);

        this.saveButton   = this.down('#okbutton');
        this.deleteButton = this.down('#deletebutton');

        this.addCls('sch-gantt-dependencyeditor');
    },

    getState : function () {
        if (this.rendered) {
            return this.callParent(arguments);
        }
    },

    init : function (cmp) {
        this.ownerCmp = cmp;

        cmp.on(this.triggerEvent, this.onTriggerEvent, this);

        this.gantt     = cmp;
        this.taskStore = cmp.getTaskStore();

        // Add fields late, when we have access to taskStore
        this.add(this.buildFields());
    },

    renderAndCollapse : function () {
        this.render(Ext.getBody());

        // Collapse after render, otherwise rendering is messed up
        this.collapse(Ext.Component.DIRECTION_TOP, false);
        this.hide();

        if (this.hideOnBlur) {
            // Hide when clicking outside panel
            this.on({
                show : function () {
                    this.mon(Ext.getBody(), {
                        click : this.onMouseClick,
                        scope : this
                    });
                },

                hide : function () {
                    this.mun(Ext.getBody(), {
                        click : this.onMouseClick,
                        scope : this
                    });
                },

                delay : 50
            });
        }

        if (this.saveOnEnter) {
            this.el.on({
                'keyup' : function (e, t) {
                    if (e.getKey() === e.ENTER && t.tagName.toLowerCase() === 'input') {
                        this.onSaveClick();
                    }
                },
                scope   : this
            });
        }
    },

    /**
     * Expands the editor
     * @param {Gnt.model.Dependency} dependencyRecord The record to show in the editor panel
     * @param {Array} xy the coordinates where the window should be shown
     */
    show : function (dependencyRecord, xy) {
        this.dependencyRecord = dependencyRecord;

        // Load form panel fields
        if (this.lagField) {
            this.lagField.durationUnit = dependencyRecord.getLagUnit();
        }

        this.getForm().loadRecord(dependencyRecord);

        this.fromLabel.setValue(this.dependencyRecord.getSourceTask().getName());
        this.toLabel.setValue(this.dependencyRecord.getTargetTask().getName());

        if (this.typeField) {
            var dependencyStore = this.taskStore && this.taskStore.getDependencyStore(),
                allowedTypes    = dependencyStore && dependencyStore.allowedDependencyTypes;

            // filter out disabled dependency types
            this.typeField.store.filter();

            // if number of allowed dependency types is less 2 we won't allow to edit this field
            this.typeField.setReadOnly(allowedTypes && allowedTypes.length < 2);
        }

        this.callParent([]);
        this.el.setXY(xy);

        this.expand(!this.constrain);

        if (this.constrain) {
            this.doConstrain(Ext.util.Region.getRegion(Ext.getBody()));
        }

        this.saveButton && this.saveButton.setVisible(!this.gantt.isReadOnly());
        this.deleteButton && this.deleteButton.setVisible(!this.gantt.isReadOnly());
    },

    onSaveClick : function () {
        if (this.getForm().isValid()) {
            this.doSave();
            this.collapse();
        }
    },

    doSave : function () {
        var me   = this,
            data = me.getForm().getValues();

        delete data[me.fromLabel.name];
        delete data[me.toLabel.name];

        if (me.lagField) {
            var duration = me.lagField.getDurationValue() || { value : 0, unit : '' };

            data[me.model.lagField]     = duration.value;
            data[me.model.lagUnitField] = duration.unit;
        }

        me.dependencyRecord.set(data);
    },


    /**
     * This method is called during the form initialization. It returns an array of fields to be assigned to the `items` property.
     * Override the method to add some extra fields or remove some of default ones. For example:
     *
     * ```javascript
     * Ext.define('MyDependencyEditor', {
     *     extend : 'Gnt.plugin.DependencyEditor',
     *
     *     buildFields : function () {
     *         var fields = this.callParent(arguments);
     *
     *         // add extra "foo" field
     *         fields.push(new Ext.form.NumberField({
     *             name       : 'foo',
     *             fieldLabel : 'Bar'
     *         });
     *
     *         return fields;
     *     }
     * });
     * ```
     *
     * @return {Ext.Component[]} List of the form fields.
     */
    buildFields : function () {
        var me              = this,
            dependencyStore = me.taskStore && me.taskStore.getDependencyStore();

        me.model = dependencyStore ? dependencyStore.model.prototype : Gnt.model.Dependency.prototype;

        var fields = [
            me.fromLabel = new Ext.form.TextField({
                readOnly   : true,
                border     : false,
                fieldLabel : me.L('fromText'),
                cls        : 'sch-gantt-dependencyeditor-readonly'
            }),

            me.toLabel = new Ext.form.TextField({
                readOnly   : true,
                border     : false,
                fieldLabel : me.L('toText'),
                cls        : 'sch-gantt-dependencyeditor-readonly'
            }),

            me.typeField = me.buildTypeField()
        ];

        if (me.showLag !== false && me.lagField !== false && (!me.lagField || !me.lagField.isInstance)) {
            me.lagField = Ext.create(Ext.apply({
                xclass     : 'Gnt.field.Duration',
                name       : me.model.lagField,
                minValue   : Number.NEGATIVE_INFINITY,
                fieldLabel : me.L('lagText')
            }, me.lagField));

            fields.push(me.lagField);
        }

        return fields;
    },

    onTriggerEvent : function (depView, record, e, t) {
        if (!this.rendered) this.renderAndCollapse();

        if (record !== this.dependencyRecord) {
            this.show(record, e.getXY());
        }
    },

    filterAllowedTypes : function (record) {
        var dependencyStore = this.taskStore && this.taskStore.getDependencyStore();

        if (!dependencyStore || !dependencyStore.allowedDependencyTypes) return true;

        var allowed = dependencyStore.allowedDependencyTypes;
        var depType = dependencyStore.model.Type;

        for (var i = 0, l = allowed.length; i < l; i++) {
            var type = depType[allowed[i]];
            if (record.getId() == type) return true;
        }

        return false;
    },

    buildTypeField : function () {
        var depClass = this.taskStore ? this.taskStore.getDependencyStore().model : Gnt.model.Dependency;
        var depType  = depClass.Type;

        this.typesFilter = new Ext.util.Filter({
            filterFn : this.filterAllowedTypes,
            scope    : this
        });

        var store = new Ext.data.ArrayStore({
            fields : [
                { name : 'id', type : 'int' },
                'text'
            ],
            data   : [
                [depType.EndToStart, this.L('endToStartText')],
                [depType.StartToStart, this.L('startToStartText')],
                [depType.EndToEnd, this.L('endToEndText')],
                [depType.StartToEnd, this.L('startToEndText')]
            ]
        });

        store.filter(this.typesFilter);

        return new Ext.form.field.ComboBox({
            name          : depClass.prototype.typeField,
            fieldLabel    : this.L('typeText'),
            cls           : 'gnt-field-with-null-value',
            triggerAction : 'all',
            queryMode     : 'local',
            editable      : false,
            valueField    : 'id',
            displayField  : 'text',
            store         : store,
            listConfig    : {
                htmlEncode : true
            }
        });
    },

    onMouseClick : function (e) {
        if (
            this.collapsed || e.within(this.getEl()) ||
            // ignore the click on the menus and combo-boxes (which usually floats as the direct child of <body> and
            // leaks through the `e.within(this.getEl())` check
            e.getTarget('.' + Ext.baseCSSPrefix + 'layer') ||

            // if clicks should be ignored for any other element - it should have this class
            e.getTarget('.sch-ignore-click')
        ) {
            return;
        }

        this.collapse();
    },

    // Always hide drag proxy on collapse
    afterCollapse : function () {
        delete this.dependencyRecord;

        // Currently the header is kept even after collapse, so need to hide the form completely
        this.hide();

        this.callParent(arguments);

        if (this.hideOnBlur) {
            // Hide when clicking outside panel
            this.mun(Ext.getBody(), 'click', this.onMouseClick, this);
        }
    }
});
