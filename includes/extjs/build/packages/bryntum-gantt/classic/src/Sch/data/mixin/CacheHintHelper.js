/**
 * This mixin intercepts a set of store methods and firing a set of events providing a cache with a better hint
 * when to update itself.
 *
 * @private
 */
Ext.define('Sch.data.mixin.CacheHintHelper', {
    extend : 'Ext.Mixin',

    mixinConfig : {
        before : {
            loadRecords : 'loadRecords',
            removeAll   : 'removeAll'
        }
    },

    // Call to loadRecords() results in 'datachanged' and 'refresh' events, but 'datachanged' is also fired upon
    // call to add/remove/write/filter/sort/removeAll so a cache cannot detect what method call results in 'datachanged'
    // in case of previosly mentioned methods a cache shouldn't handle 'datachanged' event it is not affected by
    // write/filter/sort at all, as for add/remove/removeAll it listens to preceding events like 'add'/'remove'/'clear'
    // and reflects updates correspondingly. But in case of loadRecords() the sequence of events fired 'datachanged' and
    // 'refresh' provides too little information to make right decision whether to reset a cache or not, moreover resetting
    // a cache on 'refresh' is to late since a lot of logic (rendering logic especially) start quering the store
    // upon 'datachanged' event and thus if cache wasn't reset it will provide that logic with outdated data.
    // Thus I have to override loadRecords() and make it fire private 'cacheresethint' event to provide a cache with
    // a way to reset itself beforehand.
    loadRecords : function() {
        this.fireEvent('cacheresethint', this);
    },

    // If no event is fired for the removal, we need to clear cache manually
    removeAll : function(silent) {
        if (silent) {
            this.fireEvent('cacheresethint', this);
        }
    }
});
