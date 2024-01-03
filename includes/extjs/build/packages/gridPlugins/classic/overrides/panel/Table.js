/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.panel.Table', {
    override: 'Ext.panel.Table',

    privates: {
        doEnsureVisible: function(record, options) {
            // Handle the case where this is a lockable assembly
            if (this.lockable) {
                return this.ensureLockedVisible(record, options);
            }

            // Allow them to pass the record id.
            if (typeof record !== 'number' && !record.isEntity) {
                record = this.store.getById(record);
            }
            var me = this,
                view = me.getView(),
                domNode = view.getNode(record),
                callback, scope, animate,
                highlight, select, doFocus, scrollable, column, cell;

            if (options) {
                callback = options.callback;
                scope = options.scope;
                animate = options.animate;
                highlight = options.highlight;
                select = options.select;
                doFocus = options.focus;
                column = options.column;
            }

            // Always supercede any prior deferred request
            if (me.deferredEnsureVisible) {
                me.deferredEnsureVisible.destroy();
            }

            // We have not yet run the layout.
            // Add this to the end of the first sizing process.
            // By using the resize event, we will come in AFTER any Component's onResize and onBoxReady handling.
            if (!view.componentLayoutCounter) {
                me.deferredEnsureVisible = view.on({
                    resize: me.doEnsureVisible,
                    args: Ext.Array.slice(arguments),
                    scope: me,
                    single: true,
                    destroyable: true
                });
                return;
            }

            if (typeof column === 'number') {
                column = me.ownerGrid.getVisibleColumnManager().getColumns()[column];
            }

            // We found the DOM node associated with the record
            if (domNode) {
                scrollable = view.getScrollable();
                if (column) {
                    cell = Ext.fly(domNode).selectNode(column.getCellSelector());
                }
                if (scrollable) {
                    scrollable.scrollIntoView(cell || domNode, !!column, animate, highlight);
                }
                if (!record.isEntity) {
                    record = view.getRecord(domNode);
                }
                if (select) {
                    view.getSelectionModel().select(record);
                }
                if (doFocus) {
                    // <fix>
                    // view.getNavigationModel().setPosition(record, 0);
                    view.getNavigationModel().setPosition(record, column);
                    // </fix>
                }
                Ext.callback(callback, scope || me, [true, record, domNode]);
            }
            // If we didn't find it, it's probably because of buffered rendering
            else if (view.bufferedRenderer) {
                view.bufferedRenderer.scrollTo(record, {
                    animate: animate,
                    highlight: highlight,
                    select: select,
                    focus: doFocus,
                    column: column,
                    callback: function(recordIdx, record, domNode) {
                        Ext.callback(callback, scope || me, [true, record, domNode]);
                    }
                });
            } else {
                Ext.callback(callback, scope || me, [false, null]);
            }
        }
    }
});