/**
 * @class   Gnt.widget.ConstraintResolutionWindow
 * @extends Ext.window.Window
 */
Ext.define("Gnt.widget.ConstraintResolutionWindow", {
    extend   : "Ext.window.Window",
    alias    : "widget.constraintresolutionwindow",
    requires : ["Gnt.widget.ConstraintResolutionForm"],
    mixins   : ["Gnt.mixin.Localizable"],

    modal       : true,
    closable    : true,
    resizable   : true,
    collapsible : false,
    border      : false,
    bodyBorder  : false,

    /**
     * @cfg {Object} l10n Object containing localication strings
     * An object, purposed for the class localization. Contains the following keys/values:

            - "Constraint violation" : "Constraint violation"
     */

    config : {
        /**
         * @cfg {Object} resolutionContext Object containing a set of possible resolutions provided by {@link Gnt.constraint.Base#getResolution()}.
         */
        resolutionContext : null,
        /**
         * @cfg {String} dateFormat
         *
         * Date format to pass to {@link Gnt.widget.ConstraintResolutionForm}
         */
        dateFormat : null
    },

    form     : null,

    minWidth : 500,

    // this one is here to satisfy localization test: this.L("Constraint violation")

    title    : 'L{Constraint violation}',

    initComponent : function() {
        var me = this;

        me.title = me.localizeText(me.title);

        me.setupItems();

        me.height = Math.round(Ext.dom.Element.getViewportHeight() / 3);
        me.width  = Math.round(Ext.dom.Element.getViewportWidth() / 4);

        me.callParent(arguments);

        me.on('afterlayout', me.onAfterOptimalLayout, me, {single : true });
    },

    setupItems : function() {
        var me = this;

        me.layout = 'fit';

        me.form = new Gnt.widget.ConstraintResolutionForm({
            resolutionContext   : me.getResolutionContext(),
            dateFormat          : me.getDateFormat(),
            bubbleEvents        : ['ok', 'cancel']
        });

        me.items = me.form;
    },

    onAfterOptimalLayout : function() {
        var me = this,
            originalHeight,
            originalFormHeight,
            formOptimalHeight,
            optimalHeight;

        originalHeight     = me.getHeight();
        originalFormHeight = me.form.getHeight();
        formOptimalHeight  = me.form.getOptimalHeight();
        optimalHeight      = formOptimalHeight + originalHeight - originalFormHeight;

        originalHeight != optimalHeight && me.setHeight(optimalHeight);
    }
});
