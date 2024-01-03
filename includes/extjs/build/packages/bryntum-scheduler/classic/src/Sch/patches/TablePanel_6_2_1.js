// Applying override from sencha, see related thread:
// https://www.sencha.com/forum/showthread.php?332597-Lockable-grid-normal-part-scrolls-horizontally-upon-locked-part-editor-activation
Ext.define('Sch.patches.TablePanel_6_2_1', {
    extend      : 'Sch.util.Patch',

    target      : 'Ext.panel.Table',

    minVersion  : '6.2.1',

    overrides   : {
        initComponent: function() {
            var me = this,
                headerScroller;

            me.callParent(arguments);

            // HeaderCt will get layed out, and that causes a scroll event which we do NOT
            // want propagating to partners.
            if (me.headerCt && (headerScroller = me.headerCt.getScrollable())) {
                headerScroller.suspendPartnerSync();

                // We start propagating to partners a little after the first data refresh.
                // MUST be a little after because there may be another grid involved
                // and layouts will resume after they *all* refresh, and we must not
                // do any syncing until after that process finishes.
                me.view.on({
                    refresh: function() {
                        headerScroller.resumePartnerSync();

                        // Force the HeaderCt into sync.
                        headerScroller.getElement().dom.scrollLeft = me.view.getScrollable().getElement().dom.scrollLeft;
                    },
                    single : true,
                    delay  : 100
                });
            }
        },

        privates: {
            // The focusable flag is set, but there is no focusable element.
            // Focus is delegated to the view by the focus implementation.
            initFocusableElement: function () {
            },

            doEnsureVisible: function (record, options) {
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
                    isLocking = me.ownerGrid.lockable,
                    callback, scope, animate,
                    highlight, select, doFocus, verticalScroller, horizontalScroller, column, cell;

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
                    verticalScroller = isLocking ? me.ownerGrid.getScrollable() : view.getScrollable();

                    if (verticalScroller) {
                        if (column) {
                            cell = Ext.fly(domNode).selectNode(column.getCellSelector());
                        }

                        // We're going to need two scrollers if we are locking, and we need to scroll horizontally.
                        // The whole arrangement of side by side views scrolls up and down.
                        // Each view itself scrolls horizontally.
                        if (isLocking && column) {
                            verticalScroller.scrollIntoView(domNode, false);
                            view.getScrollable().scrollIntoView(cell || domNode, true, animate, highlight);
                        }
                        // No locking, it's simple - we just use the view's scroller
                        else {
                            verticalScroller.scrollIntoView(cell || domNode, !!column, animate, highlight);
                        }
                    }
                    if (!record.isEntity) {
                        record = view.getRecord(domNode);
                    }
                    if (select) {
                        view.getSelectionModel().select(record);
                    }
                    if (doFocus) {
                        view.getNavigationModel().setPosition(record, 0);
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
                        callback: function (recordIdx, record, domNode) {
                            Ext.callback(callback, scope || me, [true, record, domNode]);
                        }
                    });
                } else {
                    Ext.callback(callback, scope || me, [false, null]);
                }
            }
        }
    }
});
