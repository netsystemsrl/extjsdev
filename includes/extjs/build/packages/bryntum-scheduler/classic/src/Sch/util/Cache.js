/**
 * Simple caching utility.
 *
 * Internaly obtains a key value suitable to be used as object property name via {@link Sch.util.Cache#key key()}
 * method and caches a value provided under the key obtained, values with the same key are groupped
 * into single array. Cached values are obtained via {@link Sch.util.Cache#get get()} method and are managed via
 * {@link Sch.util.Cache#add add()}, {@link Sch.util.Cache#remove remove()}, {@link Sch.util.Cache#move move()},
 * {@link Sch.util.Cache#clear clear()}
 * methods.
 */
Ext.define('Sch.util.Cache', {

    cache : null,

    /**
     * @constructor
     */
    constructor : function() {
        var me = this;

        me.cache = {};
        // <debug>
        me.self.stats[Ext.getClassName(me)] = me.stats = { hit: 0, miss: 0 };
        // </debug>
    },

    /**
     * A function returning a key for given value.
     *
     * @param  {Mixed} v
     * @return {String}
     * @template
     */
    key : function(v) {
        var result;

        if (v && v.isModel) {
            result = v.getId().toString();
        }
        else if (v === undefined || v === null) {
            result = "[ undefined / null ]";
        }
        else {
            result = (v).toString();
        }

        return result;
    },

    /**
     * Checks if cache has given key cached
     *
     * @param {Mixed} k
     * @return {Boolean}
     */
    has : function(k) {
        var me = this;

        k = me.key(k);

        return me.cache.hasOwnProperty(k);
    },

    /**
     * Returns all values cached with a given key, or if key isn't present executes a given function, caches
     * it's result (which should be array) after it's mapped over {@link #map} and returns it.
     *
     * *Warning*: the array returned must not be modified otherwise cache integrity will be violated.
     *
     * @param {Mixed} k
     * @param {Function} [fn]
     * @param {[Mixed]}  [fn.return]
     * @return {[Mixed]}
     */
    get : function(k, fn) {
        var me = this,
            result;

        k = me.key(k);

        result = me.cache.hasOwnProperty(k) && me.cache[k];

        // <debug>
        !result && fn ? (++me.stats.miss) : (++me.stats.hit);
        // </debug>

        if (!result && fn) {
            result = fn();
        }
        else if (!result) {
            result = [];
        }

        me.cache[k] = result;

        return result;
    },

    /**
     * Caches a value using either a key provided or a key obtained from {@link #key key()} method.
     * If value is not given then the key is added to the cache with nothing cached under it.
     *
     * @param {Mixed} k
     * @param {Mixed} [v]
     * @chainable
     */
    add : function(k, v) {
        var me = this,
            kAdopted = me.key(k);

        if (!me.cache.hasOwnProperty(kAdopted)) {
            me.cache[kAdopted] = me.get(k); // initial key cache filling
        }

        arguments.length > 1 && Ext.Array.include(me.cache[kAdopted], v);

        return me;
    },

    /**
     * Sets cached values for the given key, replace everything cached for the given key with new values.
     *
     * @param {Mixed} k
     * @param {[Mixed]} vals
     * @chainable
     */
    set : function(k, vals) {
        var me = this,
            kAdopted = me.key(k);

        me.cache[kAdopted] = vals;

        return me;
    },

    /**
     * Removes cached value from cache under a given key or under a key obtained from {@link #key key()} method.
     *
     * @param {Mixed} k
     * @param {Mixed} v
     * @chainable
     */
    remove : function(k, v) {
        var me = this;

        k = me.key(k);

        if (me.cache.hasOwnProperty(k)) {
            Ext.Array.remove(me.cache[k], v);
        }

        return me;
    },

    /**
     * Moves all items or a single item under old key to new key
     *
     * @param {Mixed} oldKey
     * @param {Mixed} newKey
     * @chainable
     */
    move : function(oldKey, newKey, v) {
        var me = this;

        oldKey = me.key(oldKey);
        newKey = me.key(newKey);

        if (oldKey != newKey && arguments.length >= 3) {
            me.remove(oldKey, v);
            me.add(newKey, v);
        }
        else if (oldKey != newKey && me.cache.hasOwnProperty(oldKey) && me.cache.hasOwnProperty(newKey)) {
            me.cache[newKey] = Ext.Array.union(me.cache[newKey], me.cache[oldKey]);
            me.cache[oldKey] = [];
        }
        else if (oldKey != newKey && me.cache.hasOwnProperty(oldKey)) {
            me.cache[newKey] = me.cache[oldKey];
            me.cache[oldKey] = [];
        }

        return me;
    },

    /**
     * Clears entire cache, or clears cache for a given key.
     *
     * @param {Mixed} [k]
     * @chainable
     */
    clear : function(k) {
        var me = this;

        if (!arguments.length) {
            me.cache = {};
        }
        else {
            k = me.key(k);
            if (me.cache.hasOwnProperty(k)) {
                delete me.cache[k];
            }
        }

        return me;
    },

    /**
     * Removes value from entire cache (from every key it exists under).
     *
     * @param {Mixed} v
     * @chainable
     */
    uncache : function(v) {
        var me = this,
            k;

        for (k in me.cache) {
            if (me.cache.hasOwnProperty(k)) {
                me.cache[k] = Ext.Array.remove(me.cache[k], v);
            }
        }

        return me;
    },

    inheritableStatics : {
        // <debug>
        stats : {}
        // </debug>
    }
});
