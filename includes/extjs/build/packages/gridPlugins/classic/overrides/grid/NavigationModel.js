/*
This file is part of Grid Plugins

Copyright (c) 2012-2019 mzSolutions & Software SRL

Contact:  http://www.mzsolutions.eu

This version of Grid Plugins is licensed commercially for a limited period for evaluation/test/trial
purposes only. Production use or use beyond the applicable evaluation period is prohibited under this license.

If your trial has expired, please contact the sales department at http://www.mzsolutions.eu.

Version: 1.1.1.64 Build date: 2019-04-03 11:26:22 (665c6ef3ef4245d25983ddb912829d5199961e75)

*/
// These overrides make key navigation work in a locked grid.
// In the framework the locked grids are not navigable with PgUp and PgDwn.
Ext.define('Ext.overrides.grid.NavigationModel', {
    override: 'Ext.grid.NavigationModel',

    // this override fixes the grid height calculation when bufferedRenderer is used
    getRowsVisible: function() {
        var rowsVisible = false,
            view = this.view,
            firstRow = view.all.first(),
            rowHeight, gridViewHeight;

        if (firstRow) {
            rowHeight = firstRow.getHeight();
            // gridViewHeight = view.el.getHeight();
            // Here is the fix of this override
            if (view.bufferedRenderer) {
                gridViewHeight = view.bufferedRenderer.viewClientHeight;
            } else {
                gridViewHeight = view.el.getHeight();
            }
            rowsVisible = Math.floor(gridViewHeight / rowHeight);
        }

        return rowsVisible;
    },

    // this override fixes the PageDown event so that we pass the record to
    // bufferedRenderer.scrollTo function
    onKeyPageDown: function(keyEvent) {
        var me = this,
            view = keyEvent.view,
            rowsVisible = me.getRowsVisible(),
            newIdx,
            newRecord;

        if (rowsVisible) {
            // If rendering is buffered, we cannot just increment the row - the row may not be there
            // We have to ask the BufferedRenderer to navigate to the target.
            // And that may involve asynchronous I/O, so must post-process in a callback.
            if (view.bufferedRenderer) {
                newIdx = Math.min(keyEvent.recordIndex + rowsVisible, view.dataSource.getCount() - 1);
                me.lastKeyEvent = keyEvent;
                // view.bufferedRenderer.scrollTo(newIdx, false, me.afterBufferedScrollTo, me);
                // Here is the fix of this override
                // use the record instead of the records index otherwise the BuffereRendered plugin won't work ok
                view.bufferedRenderer.scrollTo(view.dataSource.getAt(newIdx), false, me.afterBufferedScrollTo, me);
            } else {
                newRecord = view.walkRecs(keyEvent.record, rowsVisible);
                me.setPosition(newRecord, null, keyEvent);
            }
        }
    },

    // this override fixes the PageUp event so that we pass the record to
    // bufferedRenderer.scrollTo function
    onKeyPageUp: function(keyEvent) {
        var me = this,
            view = keyEvent.view,
            rowsVisible = me.getRowsVisible(),
            newIdx,
            newRecord;

        if (rowsVisible) {
            // If rendering is buffered, we cannot just increment the row - the row may not be there
            // We have to ask the BufferedRenderer to navigate to the target.
            // And that may involve asynchronous I/O, so must post-process in a callback.
            if (view.bufferedRenderer) {
                newIdx = Math.max(keyEvent.recordIndex - rowsVisible, 0);
                me.lastKeyEvent = keyEvent;
                // view.bufferedRenderer.scrollTo(newIdx, false, me.afterBufferedScrollTo, me);
                // Here is the fix of this override
                // use the record instead of the records index otherwise the BuffereRendered plugin won't work ok
                view.bufferedRenderer.scrollTo(view.dataSource.getAt(newIdx), false, me.afterBufferedScrollTo, me);
            } else {
                newRecord = view.walkRecs(keyEvent.record, -rowsVisible);
                me.setPosition(newRecord, null, keyEvent);
            }
        }
    },

    // this override fixes the Alt+END event so that we pass the record to
    // bufferedRenderer.scrollTo function
    onKeyEnd: function(keyEvent) {
        var me = this,
            view = keyEvent.view;

        // ALT/End - go to last visible record in grid.
        if (keyEvent.altKey) {
            if (view.bufferedRenderer) {
                // If rendering is buffered, we cannot just increment the row - the row may not be there
                // We have to ask the BufferedRenderer to navigate to the target.
                // And that may involve asynchronous I/O, so must postprocess in a callback.
                me.lastKeyEvent = keyEvent;
                // view.bufferedRenderer.scrollTo(view.store.getCount() - 1, false, me.afterBufferedScrollTo, me);
                // Here is the fix of this override
                // use the record instead of the records index otherwise the BuffereRendered plugin won't work ok
                view.bufferedRenderer.scrollTo(view.dataSource.last(), false, me.afterBufferedScrollTo, me);
            } else {
                // Walk forwards to the end record
                me.setPosition(view.walkRecs(keyEvent.record, view.dataSource.getCount() - 1 - view.dataSource.indexOf(keyEvent.record)), null, keyEvent);
            }
        }
        // End moves the focus to the last cell in the current row.
        else {
            me.setPosition(keyEvent.record, keyEvent.view.getVisibleColumnManager().getColumns().length - 1, keyEvent);
        }
    }

});