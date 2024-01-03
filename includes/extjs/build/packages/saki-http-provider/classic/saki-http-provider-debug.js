// vim: sw=4:ts=4:nu:nospell:fdc=4
/*global Ext:true */
/*jslint browser: true, devel:true, sloppy: true, white: true, plusplus: true */
/*
 This file is part of Saki Http Provider Package

 Copyright (c) 2012, Jozef Sakalos

 Package:  saki-http-provider
 Author:   Jozef Sakalos, aka Saki
 Contact:  http://extjs.eu/contact
 Date:     11. April 2014
            8. January 2015 - removed deprecated addEvents call
                            - upgraded example for Ext 5

 Commercial License
 Developer, or the specified number of developers, may use this file in any number
 of projects during the license period in accordance with the license purchased.

 Uses other than including the file in the project are prohibited.
 See http://extjs.eu/licensing for details.
*/
/**
 *
 * The provider sends and receives state information to/from server over http
 * allowing state independent from the browser used.
 *
 */
Ext.define('Ext.saki.state.HttpProvider', {
    extend: 'Ext.state.Provider',
    alias: [
        'state.saki-http',
        'state.ux-http'
    ],
    alternateClassName: 'Ext.ux.state.HttpProvider',
    /**
     * @cfg {String} saveSuccessText Save success text. Used only for logging.
     */
    saveSuccessText: 'Save Success',
    /**
     * @cfg {String} saveFailureText Save failure text. Used only for logging.
     */
    saveFailureText: 'Save Failure',
    /**
     * @cfg {String} readSuccessText Read success text. Used only for logging.
     */
    readSuccessText: 'Read Success',
    /**
     * @cfg {String} readFailureText Read failure text. Used only for logging.
     */
    readFailureText: 'Read Failure',
    /**
     * @cfg {String} dataErrorText Text to log if there is a data error.
     */
    dataErrorText: 'Data Error',
    /**
     * @cfg {Number} delay Number of milliseconds to wait before the changed state is saved to the server.
     */
    delay: 750,
    // temporary, in the attempt to solve some strange bug on line 386
    queue: [],
    /**
     * @private
     */
    dirty: false,
    /**
     * @private
     */
    started: false,
    /**
     * @cfg {Boolean} autoStart If you want the provider to start monitoring state changes
     * immediately after the instantiation set it to true. If it is set to false then you have to
     * call {@link #start start()} manually.
     */
    autoStart: true,
    /**
     * @cfg {Boolean} autoRead If you want the provider to request state data from the server
     * immediately upon instantiation set this to true. This is not recommended, see {@link #initState initState}
     * for a better way of initializing the state.
     */
    autoRead: false,
    /**
     * @cfg {String} user Set this to currently logged-in user if you wish to keep state on per-user basis.
     */
    user: 'user',
    /**
     * @cfg {Number} id Set this to any value you want if you want to keep state on per-id basis.
     */
    id: 1,
    /**
     * @cfg {String} session Set this to any value you want if you want to keep state on per-sessions basis.
     */
    session: 'session',
    /**
     * @cfg {Boolean} logFailure Set this to true, if you want to log failures to the browser's console
     */
    logFailure: false,
    /**
     * @cfg {Boolean} logSuccess Set this to true
     * if you want to log successes to the browser's console
     */
    logSuccess: false,
    /**
     * @cfg {String} url URL to both save-to and read-from the state.
     * If {@link #readUrl readUrl} and/or {@link #saveUrl saveUrl}
     * are set they take precedence.
     */
    url: '.',
    /**
     * @cfg {String} readUrl URL to read the state from.
     * If both {@link #url url} and readUrl are set, readUrl will be used.
     */
    readUrl: undefined,
    /**
     * @cfg {String} saveUrl URL to save the state to.
     * If both {@link #url url} and saveUrl are set, saveUrl will be used.
     */
    saveUrl: undefined,
    /**
     * @cfg {String} method Http method to use when communicating to the server. It is strictly recommended not to use
     * GET to avoid the risk of hitting the url length limit.
     */
    method: 'POST',
    paramNames: {
        id: 'id',
        name: 'name',
        value: 'value',
        user: 'user',
        session: 'session',
        data: 'data'
    },
    saveExtraParams: {},
    readExtraParams: {},
    constructor: function() {
        var me = this;
        // backwards compatibility
        me.saveExtraParams = me.saveBaseParams || me.saveExtraParams;
        me.readExtraParams = me.readBaseParams || me.readExtraParams;
        // init queue
        me.queue = [];
        me.callParent(arguments);
        /**
         * @event readsuccess
         * Fires after state has been successfully received from server and restored
         * @param {Ext.saki.state.HttpProvider} this
         */
        /**
         * @event readfailure
         * Fires in the case of an error when attempting to read state from server
         * @param {Ext.saki.state.HttpProvider} this
         */
        /**
         * @event savesuccess
         * Fires after the state has been successfully saved to server
         * @param {Ext.saki.state.HttpProvider} this
         */
        /**
         * @event savefailure
         * Fires in the case of an error when attempting to save state to the server
         * @param {Ext.saki.state.HttpProvider} this
         */
        if (me.autoRead) {
            me.readState();
        }
        me.dt = new Ext.util.DelayedTask(me.saveState,me);
        if (me.autoStart) {
            me.start();
        }
    },
    // eo function constructor
    /**
     * Initializes state from the passed state object or array.
     * This method can be called early during page load having the state Array/Object
     * retrieved from database by server.
     * @param {Array/Object} state State to initialize state manager with
     */
    initState: function(state) {
        var me = this;
        if (state instanceof Array) {
            Ext.each(state, function(item) {
                me.state[item[me.paramNames.name]] = me.decodeValue(item[me.paramNames.value]);
            }, me);
        } else {
            me.state = state || {};
        }
    },
    // eo function initState
    /**
     * private, submits state to server by asynchronous Ajax request
     */
    saveState: function() {
        var me = this,
            o = {
                url: me.saveUrl || me.url,
                method: me.method,
                scope: me,
                success: me.onSaveSuccess,
                failure: me.onSaveFailure,
                queue: Ext.clone(me.queue),
                params: {}
            },
            params = Ext.apply({}, me.saveExtraParams);
        if (!me.dirty) {
            if (me.started) {
                me.dt.delay(me.delay);
            }
            return;
        }
        me.dt.cancel();
        params[me.paramNames.id] = me.id;
        params[me.paramNames.user] = me.user;
        params[me.paramNames.session] = me.session;
        params[me.paramNames.data] = Ext.encode(o.queue);
        Ext.apply(o.params, params);
        // be optimistic
        me.dirty = false;
        Ext.Ajax.request(o);
    },
    // eo function saveState
    /**
     * Reads saved state from server by sending asynchronous Ajax request and processing the response
     */
    readState: function() {
        var me = this,
            o = {
                url: me.readUrl || me.url,
                method: me.method,
                scope: me,
                success: me.onReadSuccess,
                failure: me.onReadFailure,
                params: {}
            },
            params = Ext.apply({}, me.readExtraParams);
        params[me.paramNames.id] = me.id;
        params[me.paramNames.user] = me.user;
        params[me.paramNames.session] = me.session;
        Ext.apply(o.params, params);
        Ext.Ajax.request(o);
    },
    // eo function readState
    /**
     * private, read state callback
     */
    onReadFailure: function(response) {
        var me = this;
        if (true === me.logFailure) {
            me.log(me.readFailureText, response);
        }
        me.fireEvent('readfailure', me);
    },
    // eo function onReadFailure
    /**
     * private, read success callback
     */
    onReadSuccess: function(response) {
        var me = this,
            o = {},
            data;
        try {
            o = Ext.decode(response.responseText);
        } catch (e) {
            if (true === me.logFailure) {
                me.log(me.readFailureText, e, response);
            }
            return;
        }
        if (true !== o.success) {
            if (true === me.logFailure) {
                me.log(me.readFailureText, o, response);
            }
        } else {
            data = o[me.paramNames.data];
            if (!(data instanceof Array) && true === me.logFailure) {
                me.log(me.dataErrorText, data, response);
                return;
            }
            Ext.each(data, function(item) {
                me.state[item[me.paramNames.name]] = me.decodeValue(item[me.paramNames.value]);
            }, me);
            me.queue = [];
            me.dirty = false;
            if (true === me.logSuccess) {
                me.log(me.readSuccessText, data, response);
            }
            me.fireEvent('readsuccess', me);
        }
    },
    // eo function onReadSuccess
    /**
     * private, save success callback
     */
    onSaveSuccess: function(response, options) {
        var me = this,
            o = {},
            name, value, i, j, found;
        try {
            o = Ext.decode(response.responseText);
        } catch (e) {
            if (true === me.logFailure) {
                me.log(me.saveFailureText, e, response);
            }
            me.dirty = true;
            return;
        }
        if (true !== o.success) {
            if (true === me.logFailure) {
                me.log(me.saveFailureText, o, response);
            }
            me.dirty = true;
        } else {
            Ext.each(options.queue, function(item) {
                if (!item) {
                    return;
                }
                name = item[me.paramNames.name];
                value = me.decodeValue(item[me.paramNames.value]);
                if (undefined === value || null === value) {
                    Ext.saki.state.HttpProvider.superclass.clear.call(me, name);
                } else {
                    // parent sets value and fires event
                    Ext.saki.state.HttpProvider.superclass.set.call(me, name, value);
                }
            }, me);
            if (false === me.dirty) {
                me.queue = [];
            } else {
                for (i = 0; i < options.queue.length; i++) {
                    found = false;
                    for (j = 0; j < me.queue.length; j++) {
                        if (options.queue[i].name === me.queue[j].name) {
                            found = true;
                            break;
                        }
                    }
                    if (true === found && me.encodeValue(options.queue[i].value) === me.encodeValue(me.queue[j].value)) {
                        Ext.Array.remove(me.queue, me.queue[j]);
                    }
                }
            }
            if (true === me.logSuccess) {
                me.log(me.saveSuccessText, o, response);
            }
            me.fireEvent('savesuccess', me);
        }
    },
    // eo function onSaveSuccess
    /**
     * private, save failure callback
     */
    onSaveFailure: function(response) {
        if (true === this.logFailure) {
            this.log(this.saveFailureText, response);
        }
        this.dirty = true;
        this.fireEvent('savefailure', this);
    },
    // eo function onSaveFailure
    /**
     * Starts monitoring state changes and submitting them to the server.
     * Monitoring (and saving) occurs in {@link #delay delay} intervals, however,
     * if state has not changed no request is sent.
     */
    start: function() {
        var me = this;
        me.dt.delay(me.delay);
        me.started = true;
    },
    // eo function start
    /**
     * Stops monitoring (and saving) state changes. State is NOT saved to the server if the provider is stopped.
     */
    stop: function() {
        this.dt.cancel();
        this.started = false;
    },
    // eo function stop
    /**
     * @private
     */
    set: function(name, value) {
        if (!name) {
            return;
        }
        this.queueChange(name, value);
    },
    // eo function set
    /**
     * private, queues the state change if state has changed
     */
    queueChange: function(name, value) {
        var me = this,
            o = {},
            i,
            found = false,
            lastValue = this.state[name],
            changed;
        for (i = 0; i < me.queue.length; i++) {
            if (me.queue[i].name === name) {
                lastValue = me.decodeValue(me.queue[i].value);
            }
        }
        // value can be object or array so we need to encode it to effectively compare it
        changed = undefined === lastValue || Ext.encode(lastValue) !== Ext.encode(value);
        if (changed) {
            o[me.paramNames.name] = name;
            o[me.paramNames.value] = me.encodeValue(value);
            for (i = 0; i < me.queue.length; i++) {
                if (me.queue[i].name === o.name) {
                    me.queue[i] = o;
                    found = true;
                }
            }
            if (false === found) {
                me.queue.push(o);
            }
            me.dirty = true;
        }
        if (me.started) {
            me.start();
        }
        return changed;
    },
    // eo function queueChange
    clear: function(name) {
        this.set(name, undefined);
    },
    // eo function clear
    /**
     * @return {Boolean} Returns true if state data has changed and changes have not yet been saved on the server.
     */
    isDirty: function() {
        return !!this.dirty;
    },
    // eo function isDirty
    /**
     * @return {Boolean} Returns true if the provider is started (monitors and saves state changes).
     */
    isStarted: function() {
        return !!this.started;
    },
    // eo function isStarted
    /**
     * @private
     * Logs passed arguments on console
     */
    log: function() {
        if (console) {
            console.log.apply(console, arguments);
        }
    }
});

