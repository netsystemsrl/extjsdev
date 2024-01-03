/**
 * Base locale class. You need to subclass it, when creating new locales for Bryntum components. Usually subclasses of this class
 * will be singletones.
 *
 * See <a href="#!/guide/gantt_scheduler_localization">Localization guide</a> for additional details.
 */
Ext.define('Sch.locale.Locale', {

    /**
     * @cfg {Object} l10n An object with the keys corresponding to class names and values are in turn objects with "phraseName/phraseTranslation"
     * key/values. For example:
     *
     * ```javascript
     *    l10n : {
     *       'Sch.plugin.EventEditor' : {
     *           saveText   : 'Speichern',
     *           deleteText : 'Löschen',
     *           cancelText : 'Abbrechen'
     *       },
     *
     *       'Sch.plugin.CurrentTimeLine' : {
     *           tooltipText : 'Aktuelle Zeit'
     *       },
     *
     *       ...
     *   }
     * ```
     */
    l10n : null,

    localeName  : null,
    namespaceId : null,


    constructor : function () {
        if (!Sch.locale.Active) {
            Sch.locale.Active = {};
            this.bindRequire();
        }

        var name       = this.self.getName().split('.');
        var localeName = this.localeName = name.pop();
        this.namespaceId = name.join('.');

        var currentLocale = Sch.locale.Active[this.namespaceId];

        // let's localize all the classes that are loaded
        // except the cases when English locale is being applied over some non-english locale
        if (!(localeName == 'En' && currentLocale && currentLocale.localeName != 'En')) this.apply();
    },

    bindRequire : function () {
        // OVERRIDE
        // we need central hook to localize class once it's been created
        // to achieve it we override Ext.ClassManager.triggerCreated
        var _triggerCreated = Ext.ClassManager.triggerCreated;

        Ext.ClassManager.triggerCreated = function (className) {
            _triggerCreated.apply(this, arguments);

            if (className) {
                var cls = Ext.ClassManager.get(className);
                // trying to apply locales for the loaded class
                for (var namespaceId in Sch.locale.Active) {
                    Sch.locale.Active[namespaceId].apply(cls);
                }
            }
        };
    },


    applyToClass : function (className, cls) {
        var me       = this,
            localeId = me.self.getName();

        cls = cls || Ext.ClassManager.get(className);

        if (cls && (cls.activeLocaleId !== localeId)) {
            // if (className=='Gnt.column.StartDate') debugger
            var locale = me.l10n[className];

            // if it's procedural localization - run provided callback
            if (typeof locale === 'function') {
                locale(className);

            } else {
                // if it's a singleton - apply to it
                if (cls.singleton) {
                    cls.l10n = Ext.apply({}, locale, cls.prototype && cls.prototype.l10n);

                // otherwise we override class
                } else {
                    if (cls.prototype.hasOwnProperty('l10n')) locale = Ext.apply({}, locale, cls.prototype && cls.prototype.l10n);

                    Ext.override(cls, { l10n : locale });
                }
            }

            // keep applied locale
            cls.activeLocaleId = localeId;

            // for singletons we can have some postprocessing
            if (cls.onLocalized) cls.onLocalized();
        }
    },


    /**
     * Apply this locale to classes.
     * @param {String[]/Object[]} [classNames] Array of class names (or classes themself) to localize.
     * If no classes specified then will localize all existing classes.
     */
    apply : function (classNames) {
        if (this.l10n) {
            var me = this;

            // if class name is specified
            if (classNames) {
                if (!Ext.isArray(classNames)) classNames = [classNames];

                var name, cls;
                for (var i = 0, l = classNames.length; i < l; i++) {
                    if (Ext.isObject(classNames[i])) {
                        if (classNames[i].singleton) {
                            cls  = classNames[i];
                            name = Ext.getClassName(Ext.getClass(cls));
                        } else {
                            cls  = Ext.getClass(classNames[i]);
                            name = Ext.getClassName(cls);
                        }
                    } else {
                        cls  = null;
                        name = 'string' === typeof classNames[i] ? classNames[i] : Ext.getClassName(classNames[i]);
                    }

                    if (name) {
                        if (name in this.l10n) {
                            me.applyToClass(name, cls);
                        }
                    }
                }

                // localize all the classes that we know about
            } else {
                // update active locales
                Sch.locale.Active[this.namespaceId] = this;

                for (var className in this.l10n) {
                    me.applyToClass(className);
                }
            }
        }
    }
});
