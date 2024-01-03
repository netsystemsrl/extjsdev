/**
 * @class   Gnt.widget.ConstraintResolutionForm
 * @extend  Ext.form.Panel
 */
Ext.define("Gnt.widget.ConstraintResolutionForm", {
    extend : "Ext.form.Panel",

    requires : [
        'Ext.form.RadioGroup',
        'Ext.form.field.Display'
    ],

    mixins : ["Gnt.mixin.Localizable"],

    alias  : 'widget.constraintresolutionform',

    /**
     * @cfg {Object} l10n Object containing localication strings
     * An object, purposed for the class localization. Contains the following keys/values:

            - "Constraint violation" : "Constraint violation"
            - dateFormat           : "m/d/Y",
            - "OK"                 : 'OK',
            - "Cancel"             : 'Cancel',
            - "Resolution options" : "Resolution options",
            - "Don't ask again"    : "Don't ask again",
            - "Task {0} violates constraint {1}"     : "Task {0} violates constraint {1}",
            - "Task {0} violates constraint {1} {2}" : "Task {0} violates constraint {1} {2}"
     */

    legacyMode : false, // That's for localizable mixin

    config : {
        /**
         * @cfg {Object} resolutionContext Object containing a set of possible resolutions provided by {@link Gnt.constraint.Base#getResolution()}.
         */
        resolutionContext : null,
        /**
         * @cfg {String} [dateFormat=null] Date format string to use in vialotion description string. If none is given then
         * the one from {@link #l10n} will be used otherwise {@link Ext.Date#defaultFormat}.
         */
        dateFormat : null
    },

    bodyPadding : 10,
    autoScroll  : true,

    initComponent : function() {
        var me = this;

        // <debug>
        Ext.isObject(me.resolutionContext) ||
            Ext.Error.raise("Can't initialize constration resolution form, resolution context is not given!");
        // </debug>

        if (!me.getDateFormat()) {
            me.setDateFormat(me.L("dateFormat"));
        }

        me.setupItemsFromResolutionContext(me.resolutionContext);
        me.setupFooterFromResolutionContext(me.resolutionContext);

        me.callParent(arguments);
    },

    setupItemsFromResolutionContext : function(resolutionContext) {
        var me = this,
            resolutions;

        // <debug>
        Ext.isObject(resolutionContext) &&
        Ext.isArray(resolutionContext.resolutions) &&
        Ext.isFunction(resolutionContext.getCancelActionOption) ||
            Ext.Error.raise("Invalid resolution context provided!");
        // </debug>

        resolutions = Ext.Array.map(resolutionContext.resolutions, function(r, index) {
            return {
                xtype                 : 'radio',
                boxLabel              : me.getResolutionOptionDescription(r, resolutionContext),
                name                  : 'resolutionOption',
                checked               : r === resolutionContext.getCancelActionOption(),
                inputValue            : index,
                tabIndex              : index
            };
        });

        me.items = [{
            xtype      : 'displayfield',
            itemId     : 'description',
            value      : me.getConstraintViolationDescription(resolutionContext),
            anchor     : "-0"
        }, {
            xtype      : 'radiogroup',
            itemId     : 'options',
            columns    : 1,
            title      : me.L("Resolution options"),
            allowBlank : false,
            items      : resolutions,
            anchor     : "-0"
        }];
    },

    setupFooterFromResolutionContext : function(resolutionContext) {
        var me = this;

        // <debug>
        Ext.isObject(resolutionContext) && Ext.isArray(resolutionContext.resolutions) ||
            Ext.Error.raise("Invalid resolution context provided!");
        // </debug>

        me.fbar = {
            itemId : 'footer-tb',
            items  : [{
                xtype    : 'checkbox',
                itemId   : 'dont-ask-cb',
                boxLabel : me.L("Don't ask again"),
                tabIndex : resolutionContext.resolutions.length + 1
            }, '->', {
                text     : me.L("OK"),
                itemId   : 'ok-btn',
                formBind : true,
                tabIndex : resolutionContext.resolutions.length + 2,
                handler  : me.onUserActionOk,
                scope    : me
            }, {
                text     : me.L("Cancel"),
                itemId   : 'cancel-btn',
                tabIndex : resolutionContext.resolutions.length + 3,
                handler  : me.onUserActionCancel,
                scope    : me
            }]
        };
    },

    getDontAskValue : function() {
        var me = this;
        return me.down('#dont-ask-cb').getValue();
    },

    getConstraintViolationDescription : function(resolutionContext) {
        var me = this,
            constraintTitle,
            constraintDate,
            constraintClass,
            task, taskName,
            dateFormat,
            description;

        // <debug>
        Ext.isObject(resolutionContext) &&
        Ext.isDefined(resolutionContext.title) &&
        Ext.isDefined(resolutionContext.task) ||
            Ext.Error.raise("Invalid resolution context provided!");
        // </debug>

        constraintTitle = resolutionContext.title;
        task            = resolutionContext.task;
        taskName        = Ext.htmlEncode(task.getName()) || '';
        constraintClass = task.getConstraintClass();
        dateFormat      = me.getDateFormat();
        constraintDate  = constraintClass && constraintClass.getDisplayableConstraintDateForFormat(resolutionContext.date, dateFormat, task) || resolutionContext.date;

        if (resolutionContext.description) {
            description = resolutionContext.description;

        } else if (resolutionContext.getConstraintViolationDescription) {
            description = resolutionContext.getConstraintViolationDescription(resolutionContext, me);

        } else {
            description = constraintDate ?
                   Ext.String.format(
                       me.L("Task {0} violates constraint {1} {2}"),
                       taskName, constraintTitle, Ext.Date.format(constraintDate, dateFormat)
                   )
                       :
                   Ext.String.format(
                       me.L("Task {0} violates constraint {1}"),
                       taskName, constraintTitle
                   );
        }

        return description;
    },

    getResolutionOptionDescription : function(resolution, resolutionContext) {
        var me = this,
            S  = Ext.String,
            task,
            constraintDate,
            constraintClass,
            dateFormat;

        // <debug>
        Ext.isObject(resolutionContext) || Ext.Error.raise("Invalid resolution context provided!");
        // </debug>

        task            = resolutionContext.task;
        constraintClass = task.getConstraintClass();
        dateFormat      = me.getDateFormat();
        constraintDate  = constraintClass && constraintClass.getDisplayableConstraintDateForFormat(resolutionContext.date, dateFormat, task) || resolutionContext.date;

        var values = [ resolution.title ];

        if (resolution.getTitleValues) {
            values = values.concat(resolution.getTitleValues(resolutionContext, me));

            for (var i = values.length - 1; i >= 0; i--) {
                if (values[i] instanceof Date) values[i] = Ext.Date.format(values[i], dateFormat);
            }

        } else {
            values = values.concat([constraintDate && Ext.Date.format(constraintDate, dateFormat) || '']);
        }

        S.format.apply(S, values);

        return S.format.apply(S, values);
    },

    onUserActionOk : function(btn) {
        var me = this,
            result;

        result = me.getValues();

        result.dontAsk = me.getDontAskValue();

        me.fireEvent('ok', me, result);
    },

    onUserActionCancel : function(btn) {
        var me = this;
        me.fireEvent('cancel', me);
    },

    getOptimalHeight : function(width) {
        var me = this,
            originalPos, originalWidth,
            radioGroup, radioGroupOffsets,
            optimalHeight,
            footerBar;

        if (width) {
            originalPos   = me.getXY();
            originalWidth = me.getWidth();
            me.setXY([-10000, -10000]);
            me.setWidth(width);
        }

        radioGroup        = me.getComponent('options');
        radioGroupOffsets = radioGroup.getEl().getOffsetsTo(me.body);
        footerBar         = me.getDockedComponent('footer-tb');
        optimalHeight     = radioGroupOffsets[1] + Ext.getDom(radioGroup.getEl()).scrollHeight + 2 * me.bodyPadding + footerBar.getHeight() + 10 /* scroll safety */;

        if (width) {
            me.setWidth(originalWidth);
            me.setXY(originalPos);
        }

        return optimalHeight;
    }
});
