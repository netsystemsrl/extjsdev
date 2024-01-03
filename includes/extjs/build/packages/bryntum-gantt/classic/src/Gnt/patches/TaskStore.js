// https://www.sencha.com/forum/showthread.php?301768-Tree-view-is-rendered-before-load-event-is-thrown
// In Ext 5.1.1 tree view is refreshed before its store throw 'load' event.
// Only reliable way to process loaded data before that refresh is to listen 'refresh' event after store.load method in called
// This patch requires to be a mixin, to be required correctly in the task store
Ext.define('Gnt.patches.TaskStore', {
    extend    : 'Ext.Mixin',

    onClassMixedIn    : function (targetClass) {
        Ext.override(targetClass, {
            // This is new handler for 'load' event that will check if caching procedures were performed before
            // and also it will remove extra listener
            onTasksLoad : function () {
                if (!this._refreshCalled) {
                    this.onTasksLoaded();
                }
                this.un('refresh', this.onTaskStoreRefresh, this);
            },

            onTasksBeforeLoad : function () {
                // if this is a reload operation, view will be refreshed before 'load' event is fired
                // we need to recalculate cache on 'refresh' event then
                this._refreshCalled = false;
                // There's a sencha listener to refresh view, with priority of 1000, we need to prepare data before that
                // so we make priority a little bit more. Covered by 200_view
                this.on('refresh', this.onTaskStoreRefresh, this, { priority : 1001 });
            },

            // Fill cache, rise a flag about this
            onTaskStoreRefresh : function () {
                // Refresh can be called twice (6.0.2), we need to restore listeners only once
                // https://www.sencha.com/forum/showthread.php?310964-TreeStore-fires-refresh-twice-during-load
                if (!this._refreshCalled) {
                    this._refreshCalled = true;
                    this.onTasksLoaded();
                }
            },

            setupListeners    : function () {
                this.callParent(arguments);

                this.on('beforeload', this.onTasksBeforeLoad, this, { priority : 100 });

                // these events need advanced listener that will check if cache has to be recalculated
                this.un({
                    load        : this.onTasksLoaded,
                    rootchanged : this.onTasksLoaded,
                    scope       : this
                });

                this.on({
                    load        : this.onTasksLoad,
                    rootchanged : this.onTasksLoad,
                    scope       : this
                });
            }
        });
    }
});