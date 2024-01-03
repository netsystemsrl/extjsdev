/**
 * @class Gnt.plugin.Replicator
 * @extends Ext.grid.selection.Replicator
 *
 * This class provides selection replication feature to gantt panel and should be used instead of Ext.grid.selection.Replicator.
 * In addition to simple columns like {@link Gnt.column.Name}, it will also copy complex values like dependencies and resource
 * assignments. Following columns will be ignored:
 *
 * - {@link Gnt.column.LateEndDate}
 * - {@link Gnt.column.LateStartDate}
 * - {@link Gnt.column.Milestone}
 * - {@link Gnt.column.Sequence}
 * - {@link Gnt.column.Slack}
 * - {@link Gnt.column.WBS}
 *
 */
Ext.define('Gnt.plugin.Replicator', {
    extend  : 'Ext.grid.selection.Replicator',

    alias   : 'plugin.gantt_selectionreplicator',

    init    : function (gantt) {
        this.gantt = gantt;
        this.callParent(arguments);
    },

    /**
     * This is the method which is called when the {@link Ext.grid.selection.SpreadsheetModel} selection model's extender
     * handle is dragged and released. It is passed contextual information about the selection and the extension area.
     * By default, the selection is extended to encompass the selection area, return false to prevent that.
     * @param {Gnt.panel.Gantt} ownerGrid
     * @param {Ext.grid.selection.Selection} sel
     * @param {Object} extension
     */
    replicateSelection  : function (ownerGrid, sel, extension) {
        var me = this;

        if (extension.columns || sel.isColumns || me.gantt.isReadOnly()) {
            return;
        }

        var selFirstRowIdx = sel.getFirstRowIndex(),
            selLastRowIdx = sel.getLastRowIndex(),
            selectedRowCount = selLastRowIdx - selFirstRowIdx + 1,
            store = sel.view.dataSource,
            startIdx,
            endIdx,
            increment,
            record,
            columns = me.columns,
            colCount = columns.length,
            column, values, lastTwoRecords, i, j;

        // Single row, just duplicate values into extension
        if (selectedRowCount === 1) {
            values = me.getColumnValuesWithMetaData(store.getAt(selFirstRowIdx));
        }

        // Multiple rows, take the numeric values from the closest two rows, calculate an array of differences and propagate it
        else {

            values = new Array(colCount);

            if (extension.rows < 0) {
                lastTwoRecords = [
                    store.getAt(selFirstRowIdx + 1),
                    store.getAt(selFirstRowIdx)
                ];
            } else {
                lastTwoRecords = [
                    store.getAt(selLastRowIdx - 1),
                    store.getAt(selLastRowIdx)
                ];
            }

            lastTwoRecords[0] = me.getColumnValuesWithMetaData(lastTwoRecords[0]);
            lastTwoRecords[1] = me.getColumnValuesWithMetaData(lastTwoRecords[1]);

            // The values array will be the differences between all numeric columns in the selection of the closest two records.
            for (j = 0; j < colCount; j++) {
                values[j] = me.calculateDifference(lastTwoRecords[0][j], lastTwoRecords[1][j]);
            }
        }

        // Loop from end to start of extension area
        if (extension.rows < 0) {
            startIdx = extension.end.rowIdx;
            endIdx = extension.start.rowIdx - 1;
            increment = -1;
        } else {
            startIdx = extension.start.rowIdx;
            endIdx = extension.end.rowIdx + 1;
            increment = 1;
        }

        // Replicate single selected row
        if (selectedRowCount === 1) {

            var fromRecord                   = sel.startCell.record,
                startDateField               = fromRecord.startDateField,
                endDateField                 = fromRecord.endDateField,
                // check if we have both start & end date copied
                valuesContainStartAndEndDate = Ext.Array.findBy(columns, function (col) { return col.dataIndex === startDateField; }) &&
                    Ext.Array.findBy(columns, function (col) { return col.dataIndex === endDateField; }),
                // check if we need propagation based on which fields get changed
                needPropagation              = Boolean(Ext.Array.findBy(columns, function (col) {
                    var dataIndex = col.dataIndex;

                    return col.isResourceAssignmentColumn ||
                        dataIndex === startDateField ||
                        dataIndex === endDateField ||
                        dataIndex === fromRecord.effortField ||
                        dataIndex === fromRecord.effortUnitField ||
                        dataIndex === fromRecord.durationUnitField ||
                        dataIndex === fromRecord.durationField;
                })),
                propagationSources           = [];

            // Function that copies data to the target records
            var changerFn = function() {
                for (i = startIdx; i !== endIdx; i += increment) {
                    record = store.getAt(i);

                    var processedIndexes = {};

                    // skip if the record is not editable
                    if (!record.isReadOnly()) {
                        record.beginEdit();

                        propagationSources.push(record);

                        // if we have both start & end dates we use setStartEndDate*() method instead of calling steStartDate*() and setEndDate*()
                        if (valuesContainStartAndEndDate && record.isEditable(startDateField) && record.isEditable(endDateField)) {
                            record.setStartEndDateAndPinWithoutPropagation(fromRecord.getStartDate(), fromRecord.getEndDate());
                            // remember that we have processed start and end date fields
                            processedIndexes[startDateField] = true;
                            processedIndexes[endDateField] = true;
                        }

                        for (j = 0; j < colCount; j++) {
                            var colData = values[j],
                                value   = colData.value,
                                column  = columns[j];

                            // if the field is editable and is not processed yet
                            if (me.isEditable(column, record) && !processedIndexes[colData.dataIndex]) {

                                if (colData.dataIndex === startDateField) {
                                    value = fromRecord.getStartDate();
                                } else if (colData.dataIndex === endDateField) {
                                    value = fromRecord.getEndDate();
                                }

                                me.copyDataTo(colData, value, column, record);
                            }
                        }

                        record.endEdit();
                    }
                }

                return propagationSources;
            }

            // if we need to propagate changes wrap changerFn with propagateChanges() call
            if (needPropagation) {
                fromRecord.propagateChanges(changerFn);
            } else {
                changerFn();
            }
        }
        // Add differences from closest two rows
        else {
            var prevValues;

            for (i = startIdx; i !== endIdx; i += increment) {
                record = store.getAt(i);

                if (!record.isReadOnly()) {
                    prevValues = me.getColumnValuesWithMetaData(store.getAt(i - increment));

                    for (j = 0; j < colCount; j++) {
                        me.sumUpDifference(columns[j], record, prevValues[j], values[j]);
                    }
                }
            }
        }
    },

    isEditable : function (column, record) {

        if (column.dataIndex && !record.isEditable(column.dataIndex)) {
           return false;
        }
        else {
            return true;
        }
    },

    //called on multiple row selection - ignores unit related fields
    calculateDifference : function (first, second) {

        //we clone the meta of the second row
        var x = first.value, y = second.value, result = Ext.clone(second);

        if (!isNaN(x) && !isNaN(y)) {

            switch (second.dataIndex) {

                case second.record.durationField :
                    //TODO to be implemented if unit first and second is compatible
                    break;

                case second.record.effortField :
                    //TODO to be implemented if unit first and second is compatible
                    break;

                default :
                    result.value = Number(y) - Number(x);

            }

            return result;
        }

    },

    sumUpDifference : function (column, record, prevMeta, meta) {

        var prevValue = prevMeta.value,
            value = meta && meta.value,
            newValue;

        if (this.isEditable(column, record)) {

            if (!isNaN(prevValue) && !Ext.isEmpty(prevValue)) {

                switch (meta.dataIndex) {

                    case record.durationField :
                        //TODO to be implemented if unit prevmeta and meta is compatible
                        break;

                    case record.effortField :
                        //TODO to be implemented if unit prevmeta and meta is compatible
                        break;

                    default :

                        if (prevValue instanceof Date) {
                            newValue = Sch.util.Date.add(prevValue, 'ms', value);
                        } else {
                            newValue = Ext.coerce(Number(prevValue) + value, prevValue);
                        }

                        this.copyDataTo(meta, newValue, column, record);
                }
            }
        }
    },

    copyDataTo : function (meta, value, targetColumn, targetRecord) {
        var sourceTask = meta.record;

        if (targetColumn.isResourceAssignmentColumn) {
            targetRecord.assignAndUnassignAssignmentsWithoutPropagation(targetRecord.getResources(), value);
            return;
        }

        // Special treatment of fields causing propagation
        switch (meta.dataIndex) {
            case sourceTask.startDateField :
                targetRecord.setStartDateAndPinWithoutPropagation(value);
                break;

            case sourceTask.endDateField :
                targetRecord.setEndDateAndPinWithoutPropagation(value, false);
                break;

            case sourceTask.durationField :
                targetRecord.setDurationWithoutPropagation(value, sourceTask.getDurationUnit());
                break;

            case sourceTask.effortField :
                targetRecord.setEffortWithoutPropagation(value, sourceTask.getEffortUnit());
                break;

            default :

                if (targetColumn.putRawData) {
                    targetColumn.putRawData(Ext.clone(value), targetRecord);
                } else if (targetColumn.dataIndex) {
                    targetRecord.set(meta.dataIndex, value);
                }
        }
    },

    getColumnValuesWithMetaData :  function (record) {
        return Ext.Array.map(this.columns, function(column) {

            var obj = {
                dataIndex   : column.dataIndex,
                record      : record
            };

            if (column.getRawData) {
                obj.value = column.getRawData(record);
            } else if (column.dataIndex) {
                obj.value = record.get(column.dataIndex);
            }

            return obj;
        });
    }
});
