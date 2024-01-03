/**
@class Gnt.mixin.Localizable

A mixin providing localization functionality to the consuming class.
*/
Ext.define('Gnt.mixin.Localizable', {
    extend      : 'Sch.mixin.Localizable',
    
    // This line used to be like this:
    //      if Sch.config.locale is specified then we'll require corresponding class
    //      by default we require Gnt.locale.En class
    //      requires    : [ typeof Sch != 'undefined' && Sch.config && Sch.config.locale || 'Gnt.locale.En' ]
    //
    // But, SenchaCMD does not support dynamic expressions for `requires`
    // Falling back to requiring English locale - that will cause English locale to always be included in the build
    // (even if user has specified another locale in other `requires`), but thats better than requiring users
    // to always specify and load the locale they need explicitly
    requires    : [ 'Gnt.locale.En' ]
});
