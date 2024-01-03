/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
Ext.define('Ext.overrides.grid.column.Column', {
    override: 'Ext.grid.column.Column',

    pickSorter: function() {
        var me = this,
            store = me.getGrid().getStore(),
            result, groupers;

        if(store.isGrouped()) {
            groupers = store.getGroupers();

            if( groupers && (result = groupers.get(me.getDataIndex())) ) {
                me.sortState = result.getDirection();
            } else {
                result = me.getSorter();
            }
        } else {
            result = me.getSorter();
        }

        return result;
    },

    setSortDirection: function (direction) {
        var me = this,
            grid = me.getGrid(),
            store = grid.getStore(),
            sorter = me.pickSorter(),
            sorters = store.getSorters(true),
            isSorted = sorter && (sorters.contains(sorter) || sorter.isGrouper);

        // Toggling to checked.
        if (direction) {
            if (isSorted) {
                if (sorter.getDirection() !== direction) {
                    sorter.setDirection(direction);

                    if (sorter.isGrouper) {
                        // <fix>
                        // store.group(sorter);
                        // </fix>
                    } else {
                        sorters.beginUpdate();
                        sorters.endUpdate();
                    }
                }
            }
            // Either the sorter is not applied, or it's the first time and there's no sorter.
            // Sort by direction as primary
            else {
                return me.sort(direction);
            }
        }
        // Toggled to clear.
        // If we own a sorter, and its in our direction, and it's applied to the store
        // then remove it.
        else if (sorter) {
            sorters.remove(sorter);
        }

        // A locally sorted store will not refresh in response to having a sorter
        // removed, so we must sync the column header arrows now.
        // AbstractStore#onSorterEndUpdate will however always fire the sort event
        // which is what Grid uses to trigger a HeaderContainer sort state sync
        if (!store.getRemoteSort()) {
            me.getRootHeaderCt().setSortState();
        }
    },

    onColumnTap: function (e) {
        var me = this,
            grid = me.getGrid(),
            selModel = grid.getSelectable(),
            store = grid.getStore(),
            sorters = store && store.getSorters(true),
            sorter = store && me.pickSorter(),
            sorterIndex = sorter ? sorters.indexOf(sorter) : -1,
            isSorted = sorter && (sorterIndex !== -1 || sorter === store.getGrouper());

        // Tapping on the trigger or resizer must not sort the column and
        // neither should tapping on any components (e.g. tools) contained
        // in the column.
        if (Ext.Component.from(e) !== me ||
            e.getTarget('.' + Ext.baseCSSPrefix + 'item-no-tap', me)) {
            return;
        }

        // Column tap sorts if we are sortable, and the selection model
        // is not selecting columns
        if (store && me.isSortable() && (!selModel || !selModel.getColumns())) {
            // Special case that our sorter is the grouper
            if (sorter && sorter.isGrouper) {
                sorter.toggle();
                // <fix> no need to group again
                // store.group(sorter);
                // </fix>
            }
            // If we are already the primary sorter
            // then just toggle through the three states
            else if (sorterIndex === 0) {
                me.toggleSortState();
            }
            // We must be a secondary or auxilliary in a multi column sort grid,
            // or unsorted now.
            else {
                // We're secondary or auxilliary, bring top top of sorter stack
                if (isSorted) {
                    store.sort(sorter, 'prepend');
                }
                // Our sorter is unused, go primary, ascending
                else {
                    me.sort('ASC');
                }
            }
        }

        return me.fireEvent('tap', me, e);
    },

    privates: {
        sort: function(direction, mode) {
            var me = this,
                sorter = me.pickSorter(),
                grid = me.getGrid(),
                store = grid.getStore(),
                sorters = store.getSorters();

            if (!me.isSortable()) {
                return;
            }

            // This is the "group by" column - we have to set the grouper and tell it to
            // recalculate. AbstractStore#group just calls its Collection's updateGrouper
            // if passed a Grouper because *something* in the grouper might have changed,
            // but the config system would reject that as not a change.
            if (sorter.isGrouper) {
                if (sorter.getDirection() !== direction) {
                    sorter.toggle();
                    // <fix>
                    // store.group(sorter);
                    // </fix>
                }
            }
            // We are moving to a sorted state
            else if (direction) {
                // We have a sorter - set its direction.
                if (sorter) {
                    // Not the primary. We will make it so.
                    // If it's already the primary, SorterCollection#addSort will toggle it
                    if (sorters.indexOf(sorter) !== 0) {
                        sorter.setDirection(direction);
                    }
                }
                // First time in, create a sorter with required direction
                else {
                    me.setSorter({
                        property: me.getSortParam(),
                        direction: 'ASC'
                    });

                    sorter = me.getSorter(); // not pickSorter
                }

                // If the grid is NOT configured with multi column sorting, then specify
                // "replace". Only if we are doing multi column sorting do we insert it as
                // one of a multi set.
                store.sort(sorter, mode || grid.getMultiColumnSort() ? 'multi' : 'replace');
            }
            // We're moving to an unsorted state
            else {
                if (sorter) {
                    sorters.remove(sorter);

                    // A locally sorted store will not refresh in response to having a
                    // sorter removed, so we must sync the column header arrows now.
                    // AbstractStore#onSorterEndUpdate will however always fire the sort
                    // event which is what Grid uses to trigger a HeaderContainer sort
                    // state sync
                    if (!store.getRemoteSort()) {
                        me.getRootHeaderCt().setSortState();
                    }
                }
            }
        },

    }

});