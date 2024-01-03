/**
 * This class implements an event domain for CRUD manager instances (classes extending Sch.crud.AbstractManager).
 * So that when MVC approach is used a Controller would be able to attach listeners for CRUD manager events in a declarative way.
 *
 *       Ext.define('MyApplication', {
 *           extend          : 'Ext.app.Application',
 *
 *           requires        : [
 *               // we need this to enable CRUD managers domain
 *               'Sch.app.CrudManagerDomain',
 *               'Ext.window.MessageBox'
 *           ],
 *
 *           listen          : {
 *               crudmanager : {
 *                   // listen to all CRUD managers available
 *                   '*' : {
 *                       'loadfail' : 'onCrudException'
 *                       'syncfail' : 'onCrudException'
 *                   },
 *
 *                   // this selector matches to a CRUD manager having an alias set to `crudmanager.specific-crud`
 *                   'specific-crud' : {
 *                       'load' : 'onSpecificCrudLoaded'
 *                   }
 *               }
 *           },
 *
 *           onCrudException : function (crud, response, responseOptions) {
 *               Ext.Msg.show({
 *                   title    : 'Error',
 *                   msg      : response.message || 'Unknown error',
 *                   icon     : Ext.Msg.ERROR,
 *                   buttons  : Ext.Msg.OK,
 *                   minWidth : Ext.Msg.minWidth
 *               });
 *           },
 *
 *           onSpecificCrudLoaded : function () {
 *               ...
 *           },
 *
 *           ....
 *       });
 *
 *
 * Selectors are either CRUD manager's alias or '*' wildcard for any CRUD manager.
 */
Ext.define('Sch.app.CrudManagerDomain', {
    extend    : 'Ext.app.EventDomain',
    singleton : true,

    requires  : [
        'Sch.crud.AbstractManager'
    ],

    type      : 'crudmanager',
    prefix    : 'crudmanager.',

    constructor : function () {
        var me = this;

        me.callParent();
        me.monitor(Sch.crud.AbstractManager);
    },

    match : function(target, selector) {
        var result = false,
            alias  = target.alias;

        if (selector === '*') {
            result = true;
        } else if (alias) {
            result = Ext.Array.indexOf(alias, this.prefix + selector) > -1;
        }

        return result;
    }
});
