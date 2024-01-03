Ext.define('Sch.data.util.DelayedCalls', {

    singleton : true,

    mixins : ['Ext.util.Observable'],

    delayedCallTimeout : 100,
    delayedCalls       : null,

    constructor : function (config) {
        this.mixins.observable.constructor.call(this, config);
        Ext.apply(this, config);
    },

    cancel : function () {
        var me           = this,
            delayedCalls = me.delayedCalls;

        if (delayedCalls) {
            var ids = arguments.length ? arguments : Ext.Oject.getKeys(delayedCalls);

            for (var i = ids.length - 1; i >= 0; i--) {
                var id = ids[i];

                if (delayedCalls[id] && delayedCalls[id].timer) {
                    clearTimeout(delayedCalls[id].timer);
                    delayedCalls[id].timer = null;
                }
            }
        }
    },

    execute : function (delayedCalls) {
        var scope = delayedCalls.scope,
            args;

        this.fireEvent('delayed-' + delayedCalls.id + '-start', this, delayedCalls);

        delayedCalls.beforeFn && delayedCalls.beforeFn.call(scope, delayedCalls);

        var fn = delayedCalls.fn;

        while ((args = delayedCalls.entries.shift())) {
            fn.apply(scope, args);
        }

        delayedCalls.afterFn && delayedCalls.afterFn.call(scope, delayedCalls);

        this.fireEvent('delayed-' + delayedCalls.id + '-end', this, delayedCalls);
    },

    schedule : function (config) {
        config = config || {};

        var me = this;

        me.delayedCalls = me.delayedCalls || {};

        var id   = config.id || me.schedule.caller.$name;
        var args = config.args || [];

        // get this specific group of delayed calls
        if (!me.delayedCalls[id]) {
            me.delayedCalls[id] = Ext.apply({ scope : this }, { id : id, entries : [] }, config);
            delete me.delayedCalls[id].args;
        }

        var delayedCalls = me.delayedCalls[id];

        // reset previously set timer (if set)
        me.cancel(id);

        delayedCalls.entries.push(args);

        // Setup timer to delay the call
        delayedCalls.timer = setTimeout(function () {
            me.execute(delayedCalls);
            delete me.delayedCalls[id];
        }, config.timeout || me.delayedCallTimeout);

        return delayedCalls;
    }
});
