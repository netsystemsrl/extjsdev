/**
 * Adds clipboard support to a gantt panel.
 *
 * *Note that the grid must use the {@link Ext.grid.selection.SpreadsheetModel spreadsheet selection model} to utilize this plugin.*
 *
 * This class supports the following `{@link #formats formats}`
 * for grid data:
 *
 *  * `text` - Cell content stripped of HTML tags. Data from clipboard cannot be pasted into gantt in this format.
 *  * `raw` - Underlying field values based on `dataIndex`. Alternatively you can define getRawData/putRawData on
 *  column class to implement any special logic for copying/pasting complex values. For example refer to
 *  {@link Gnt.column.ResourceAssignment#getRawData} and {@link Gnt.column.ResourceAssignment#putRawData}
 *
 * Only `text` format is valid for the `{@link Ext.grid.plugin.Clipboard#system system}`
 * clipboard format.
 */
Ext.define('Gnt.plugin.Clipboard', {
    extend : 'Ext.grid.plugin.Clipboard',
    alias  : 'plugin.gantt_clipboard',

    requires : [
        'Gnt.patches.DelimitedValue',
        'Gnt.patches.AbstractClipboard'
    ],

    memory : 'raw',

    formats : {
        raw : {
            get : 'getRawData',
            put : 'putRawData'
        }
    },

    // TODO: implement conversion from visible value to data value
    putTextData : function (data, format) {
        return;
    },

    collectSelectionMeta : function (selection) {
        var result = {};

        selection.eachColumn(function (column) {
            // set flags indicating if some fields are copied

            // TODO: actually this is incorrect generally speaking. This will work only if we copy and paste into the same columns.
            // We need to do this NOT with copied data, but check which fields are pasted in.
            // Since we might copy, for example, baseline dates and paste them into start/end columns.

            switch (true) {
                case column.fieldProperty == 'startDateField': result.startDate = 1; break;

                case column.fieldProperty == 'endDateField': result.endDate = 1; break;

                case column.fieldProperty == 'durationField' : result.duration = 1; break;

                case column.fieldProperty == 'constraintDateField': result.constraintDate = 1; break;

                case column.fieldProperty == 'constraintTypeField': result.constraintType = 1; break;
            }
        });

        return result;
    },

    /**
     * Will copy raw values to clipboard
     * @param {String} format Value of {@link #source} config
     * @param {Boolean} erase When true, values in original record will be replaced with field defaults
     */
    getRawData : function (format, erase) {
        var me       = this,
            grid     = me.getCmp(),
            selModel = me.getCmp().getSelectionModel(),
            ret      = [],
            isRaw    = format === 'raw',
            isText   = format === 'text',
            selected = selModel.getSelected(),
            lastRecord, row;

        if (!selected) return ret;

        // Embed info about what is being copied
        ret.schedulingFields = me.collectSelectionMeta(selected);

        grid.taskStore.suspendAutoCascade++;

        selected.eachCell(function (cellContext) {
            var column    = cellContext.column,
                view      = cellContext.column.getView(),
                record    = cellContext.record,
                dataIndex = column.dataIndex,
                data;

            // Ignore columns that we don't want to/cannot copy (check column, row numberer, AddNew, dragcolumn etc.)
            if (!me.isColumnCopyPasteable(column, format)) {
                return;
            }

            // if new record cells started
            if (lastRecord !== record) {
                lastRecord = record;
                // start new row array
                ret.push(row = []);
            }

            if (isRaw) {
                if (column.getRawData) {
                    data = column.getRawData(record);
                } else if (dataIndex) {
                    data = record.data[dataIndex];
                }
            } else {
                // Try to access the view node.
                var viewNode = view.all.item(cellContext.rowIdx);
                // If we could not, it's because it's outside of the rendered block - recreate it.
                if (!viewNode) {
                    viewNode = Ext.fly(view.createRowElement(record, cellContext.rowIdx));
                }

                var cell = viewNode.down(column.getCellInnerSelector());
                data = cell.dom.innerHTML;

                if (isText) {
                    data = Ext.util.Format.stripTags(data);
                }
            }

            row.push(data);

            if (erase) {
                if (dataIndex) {
                    record.set(dataIndex, record.getField(dataIndex).getDefaultValue());
                } else if (column.eraseData) {
                    column.eraseData(record);
                }
            }
        });

        grid.taskStore.suspendAutoCascade--;

        return ret;
    },

    getCellData : function (format, erase) {
        return Ext.util.TSV.encode(this.getRawData(format, erase));
    },

    // @private
    // Returns if the provided column can be copied or pasted in the provided format
    isColumnCopyPasteable : function (column, format) {
        return !column.ignoreExport && (format != 'raw' || column.dataIndex || column.getRawData);
    },

    shouldSkipColumnPasting : function (column, data) {
        // If start & end date were provided we use setStartEndDateWithoutPropagation() call
        return (data.schedulingFields.hasOwnProperty('startDate') && data.schedulingFields.hasOwnProperty('endDate') &&
                (column.isMilestoneColumn ||
                column.fieldProperty === 'durationField' ||
                column.fieldProperty === 'startDateField' ||
                column.fieldProperty === 'endDateField')) ||
            // If constraint type & date were provided we use setConstraintWithoutPropagation() call
            (data.schedulingFields.hasOwnProperty('constraintDate') && data.schedulingFields.hasOwnProperty('constraintType') &&
                (column.fieldProperty === 'constraintDateField' ||
                column.fieldProperty === 'constraintTypeField')) ||
            // skip "index" column
            column.dataIndex == 'index';
    },

    collectRecordPasteContext : function (context, data, column, value, destination) {
        // if both start & end date values are copied
        if (data.schedulingFields.startDate && data.schedulingFields.endDate) {
            if (column.fieldProperty === 'startDateField') {
                context.start = value;
            }
            else if (column.fieldProperty === 'endDateField') {
                context.end = column.prepareNewEndDate(value, destination.record);
            }
        }
        // if both constraint date & type are copied
        if (data.schedulingFields.constraintDate && data.schedulingFields.constraintType) {
            if (column.fieldProperty === 'constraintDateField') {
                context.constraintDate = value;
            }
            else if (column.fieldProperty === 'constraintTypeField') {
                context.constraintType = value;
            }
        }
    },

    /**
     * Will paste values from clipboard
     * @param {Object} data Data to paste
     * @param {String} format Value of {@link #source} config. If clipboard contain some data for few formats - will
     * be called few times during one paste
     */
    putRawData : function (data, format) {
        var me          = this,
            recCount    = data.length,
            view        = me.getCmp().getView(),
            maxRowIdx   = view.dataSource.getCount() - 1,
            maxColIdx   = view.getVisibleColumnManager().getColumns().length - 1,
            navModel    = view.getNavigationModel(),
            destination = navModel.getPosition(),
            destinationStartColumn;

        if (!destination || me.getCmp().isReadOnly()) return;

        destination = new Ext.grid.CellContext(view).setPosition(destination.record, destination.column);

        destinationStartColumn = destination.colIdx;

        for (var sourceRowIdx = 0; sourceRowIdx < recCount; sourceRowIdx++) {
            var row        = data[sourceRowIdx],
                targetTask = destination.record;

            // skip target record if it's read only
            if (targetTask.isReadOnly()) continue;

            var dataObject = {},
                context    = {};

            // Collect new values in dataObject
            for (var sourceColIdx = 0; destination.colIdx < maxColIdx && sourceColIdx < row.length;) {

                var currentColumn = destination.column,
                    currentValue  = row[sourceColIdx];

                // Ignore columns that we don't want to/cannot copy (check column, row numberer, AddNew, dragcolumn etc.)
                if (me.isColumnCopyPasteable(currentColumn, format)) {

                    me.collectRecordPasteContext(context, data, currentColumn, currentValue, destination);

                    if (!me.shouldSkipColumnPasting(currentColumn, data)) {
                        var field     = currentColumn.field,
                            dataIndex = currentColumn.dataIndex;

                        // make sure value is valid and apply it then
                        if (!field || !field.getErrors(currentValue).length) {
                            if (currentColumn.putRawData) {
                                currentColumn.putRawData(currentValue, destination.record);
                            } else if (dataIndex) {
                                dataObject[dataIndex] = currentValue;
                            }
                        }
                    }

                    sourceColIdx++;
                }

                // If we are at the end of the destination row, break the column loop.
                if (destination.colIdx === maxColIdx) {
                    break;
                }

                destination.setColumn(destination.colIdx + 1);
            }

            me.applyChangesToRecord(targetTask, dataObject, context);

            // If we are at the end of the destination store, break the row loop.
            if (destination.rowIdx === maxRowIdx) {
                break;
            }

            // Jump to next row in destination
            destination.setPosition(destination.rowIdx + 1, destinationStartColumn);
        }
    },

    shouldUsePropagation : function (record, data, context) {
        return (context.hasOwnProperty('start') && context.hasOwnProperty('end')) || (context.hasOwnProperty('constraintDate') && context.hasOwnProperty('constraintType'));
    },

    applyDataToRecord : function (record, data, context) {

        record.beginEdit();

        // Update the record in one go.
        record.set(data);

        // setting start + end, need to be done manually
        if (context.hasOwnProperty('start') && context.hasOwnProperty('end')) {
            record.setStartEndDateWithoutPropagation(context.start, context.end);
        }

        if (context.hasOwnProperty('constraintDate') && context.hasOwnProperty('constraintType')) {
            record.setConstraintWithoutPropagation(context.constraintType, context.constraintDate);
        }

        record.endEdit();
    },

    applyChangesToRecord : function (record, data, context) {
        var me = this;

        if (me.shouldUsePropagation(record, data, context)) {
            record.propagateChanges(function applyChangesToRecordChangerFn () {
                me.applyDataToRecord(record, data, context);
                return record;
            });
        } else {
            me.applyDataToRecord(record, data, context);
        }
    }
});
