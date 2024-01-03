/**
 * A mixin providing localization functionality to the consuming class.
 *
 * ```javascript
 * Ext.define('MyToolbar', {
 *     extend : 'Ext.Toolbar',
 *     mixins : [ 'Sch.mixin.Localizable' ],
 *
 *     initComponent : function () {
 *         Ext.apply(this, {
 *             items : [
 *                 {
 *                     xtype : 'button',
 *                     // get the button label from the current locale
 *                     text  : this.L('loginText')
 *                 }
 *             ]
 *         });
 *         this.callParent(arguments);
 *     }
 * });
 * ```
 */
Ext.define('Sch.mixin.Localizable', {

    extend : 'Ext.Mixin',

    // Falling back to requiring English locale - that will cause English locale to always be included in the build
    // (even if user has specified another locale in other `requires`), but thats better than requiring users
    // to always specify and load the locale they need explicitly
    requires            : [ 'Sch.locale.En' ],

    activeLocaleId      : '',

    /**
     * @cfg {Object} l10n Container of locales for the class.
     */
    l10n                : null,

    inTextLocaleRegExp  : /L\{([^}]+)\}/g,

    localizableProperties : null,

    isLocaleApplied : function () {
        var activeLocaleId = (this.singleton && this.activeLocaleId) || this.self.activeLocaleId;

        if (!activeLocaleId) return false;

        for (var ns in Sch.locale.Active) {
            if (activeLocaleId === Sch.locale.Active[ns].self.getName()) return true;
        }

        return false;
    },

    applyLocale : function () {
        // loop over activated locale classes and call apply() method of each one
        for (var ns in Sch.locale.Active) {
            Sch.locale.Active[ns].apply(this.singleton ? this : this.self.getName());
        }
    },

    /**
     * @inheritdoc #localize
     * @localdoc This is shorthand reference to {@link #localize}.
     */
    L : function () {
        return this.localize.apply(this, arguments);
    },

    /**
     * Retrieves translation of a phrase.
     * @localdoc There is a shorthand {@link #L} for this method.
     * @param {String} id Identifier of phrase.
     * @param {String} [legacyHolderProp=this.legacyHolderProp] Legacy class property name containing locales.
     * @param {Boolean} [skipLocalizedCheck=false] Do not localize class if it's not localized yet.
     * @return {String} Translation of specified phrase.
     */
    localize : function (id, legacyHolderProp, skipLocalizedCheck) {
        var result = this.getLocale(id, legacyHolderProp, skipLocalizedCheck);

        if (result === null || result === undefined) throw 'Cannot find locale: '+id+' ['+this.self.getName()+']';

        return result;
    },

    getLocale : function (id, legacyHolderProp, skipLocalizedCheck) {
        // if not localized yet let's do it
        if (!this.isLocaleApplied() && !skipLocalizedCheck) {
            this.applyLocale();
        }

        // `l10n` instance property has highest priority
        if (this.hasOwnProperty('l10n') && this.l10n && this.l10n.hasOwnProperty(id) && 'function' != typeof this.l10n[id]) return this.l10n[id];

        var clsProto    = this.self && this.self.prototype;

        // let's try to get locale from class prototype `l10n` property
        var result      = clsProto.l10n && clsProto.l10n[id];

        // if no transalation found
        if (result === null || result === undefined) {

            var superClass  = clsProto && clsProto.superclass;
            // if parent class also has localize() method
            if (superClass && superClass.localize) {
                // try to get phrase translation from parent class
                result = superClass.localize(id, legacyHolderProp, skipLocalizedCheck);
            }
        }

        return result;
    },

    // TODO: cover below methods w/ tests and make localizeText & localizableProperties public
    localizeText : function (text) {
        var match, locale, regExp = this.inTextLocaleRegExp;

        while (match = regExp.exec(text)) {
            if (locale = this.getLocale(match[1])) {
                text = text.replace(match[0], locale);
            }
        }

        return text;
    },

    localizeProperties : function () {
        var me  = this,
            properties = me.localizableProperties;

        if (properties) {
            properties = properties.split(',');

            for (var i = properties.length - 1; i >= 0; i--) {
                me[properties[i]] = me.localizeText(me[properties[i]]);
            }
        }
    },

    mixinConfig : {
        before : {
            'initComponent' : 'beforeInitComponent'
        }
    },

    beforeInitComponent : function () {
        this.localizeProperties();
    }
});
