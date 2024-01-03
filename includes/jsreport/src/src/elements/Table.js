import { ReportElement, PropTypes } from './ReportElement';
import $ from 'jquery';
import _ from 'underscore';

const newColumn = (width, header, detail, footer) => {
    return {
        width: width,
        header: header,
        footer: footer,
        detail: detail
    };
};

const newCell = (text) => {
    const cell = {
        text: text,
        textColor: '',
        backgroundColor: '',
        bold: false,
        italic: false,
        align: ''
    };
    ['Top', 'Left', 'Bottom', 'Right'].forEach(side => {
        cell[`border${side}Width`] = 0;
        cell[`border${side}Color`] = '';
    });
    return cell;
};

class Table extends ReportElement {

    static propTypes = {
        dataSource: PropTypes.string,
        hasHeader: PropTypes.boolean,
        hasFooter: PropTypes.boolean,
        // columnCount: PropTypes.number,
        columns: PropTypes.array,
        cellBorderTopWidth: PropTypes.number,
        cellBorderTopColor: PropTypes.string,
        cellBorderLeftWidth: PropTypes.number,
        cellBorderLeftColor: PropTypes.string,
        cellBorderBottomWidth: PropTypes.number,
        cellBorderBottomColor: PropTypes.string,
        cellBorderRightWidth: PropTypes.number,
        cellBorderRightColor: PropTypes.string,
        borderTopWidth: PropTypes.number,
        borderTopColor: PropTypes.string,
        borderLeftWidth: PropTypes.number,
        borderLeftColor: PropTypes.string,
        borderBottomWidth: PropTypes.number,
        borderBottomColor: PropTypes.string,
        borderRightWidth: PropTypes.number,
        borderRightColor: PropTypes.string
    };

    static defaultProps = {
        width: 3,
        height: 1,
        dataSource: '__parentgroup',
        hasHeader: true,
        hasFooter: false,
        // 3 dummy columns to start
        columns: [1, 2, 3].map(ix =>
            newColumn('33%', newCell(`Header ${ix}`), newCell(`Detail ${ix}`), newCell(`Footer ${ix}`))),
        cellBorderTopWidth: 0,
        cellBorderTopColor: '',
        cellBorderLeftWidth: 0,
        cellBorderLeftColor: '',
        cellBorderBottomWidth: 0,
        cellBorderBottomColor: '',
        cellBorderRightWidth: 0,
        cellBorderRightColor: '',
        borderTopWidth: 0,
        borderTopColor: '',
        borderLeftWidth: 0,
        borderLeftColor: '',
        borderBottomWidth: 0,
        borderBottomColor: '',
        borderRightWidth: 0,
        borderRightColor: ''
    };

    static typeId = 'table';
    static displayName = 'Table';
    static cssClass = 'jsr-table';
    static selectedCellClass = 'jsr-table-cell-selected';
    static iconSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsAQMAAAAkSshCAAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABpJREFUGNNjIBf8B4EP2KkP/CCEQg1KDWQCAAladplDnw68AAAAAElFTkSuQmCC';
    static RESIZE_BAR_CLS = 'jsr-table-column-resize-bar';
    static RESIZE_BAR_DRAG_CLS = 'jsr-table-column-resize-bar-dragging';

    constructor() {
        super(...arguments);
    }

    getDesignerHtml() {
        const cols = this.props.columns;
        let rows = [];
        if (this.props.hasHeader) {
            rows.push(cols.map((c, i) => ({
                cell: c.header || '',
                colIx: i,
                rowId: 'header',
                cellTag: 'th'
            })));
        }
        // TODO grouping
        if (this.props.groupBy) {

        }
        rows.push(cols.map((c, i) => ({
            cell: c.detail || '',
            colIx: i,
            rowId: 'detail'
        })));
        // TODO grouping
        if (this.props.groupBy) {
            
        }
        if (this.props.hasFooter) {
            rows.push(cols.map((c, i) => ({
                cell: c.footer || '',
                colIx: i,
                rowId: 'footer'
            })));
        }
        return this.getTableHtml(rows);
    }

    escapeHtml(html) {
        return html.replace(/\</g, '&lt;')
            .replace(/\>/g, '&lt;')
            .replace(/\&/g, '&amp;');
    }

    getHtml() {
        // TODO rows from props - currently handled in main rendering engine
    }

    /** @private */
    getTableHtml(rows) {
        const tableStyles = [];
        ['Top', 'Left', 'Bottom', 'Right'].forEach(side => {
            const borderWidth = this.props[`border${side}Width`];
            const borderColor = this.props[`border${side}Color`];
            if (borderWidth) {
                tableStyles.push(`border-${side.toLowerCase()}-width:${borderWidth}pt`);
            }
            if (borderColor) {
                tableStyles.push(`border-${side.toLowerCase()}-color:${borderColor}`);
            }
        });
        return [
            `<div class="jsr-table-wrap">`,
                `<table class="${Table.cssClass}" style="${tableStyles.join(';')}">`,
                    ...rows.map(row =>
                        [`<tr>`, ...row.map((cellInfo, colIx) => {
                            const cell = cellInfo.cell;
                            const tag = cellInfo.cellTag || 'td';
                            const text = (typeof cell === 'object' ? cell.text : cell);
                            return `<${tag} data-jsr-col-ix="${cellInfo.colIx}" data-jsr-row-id="${cellInfo.rowId}" style="${this.getCellStyles(cell)}" width="${this.props.columns[colIx].width}">${this.escapeHtml(text)}</${tag}>`
                        }), `</tr>`].join('')),
                `</table>`,
            `</div>`
        ].join('');
    }

    /** @private */
    getCellStyles(cell) {
        const styles = [];
        if (cell.backgroundColor) {
            styles.push(`background-color:${cell.backgroundColor}`);
        }
        if (cell.textColor) {
            styles.push(`color:${cell.textColor}`);
        }
        if (cell.bold) {
            styles.push(`font-weight:bold`);   
        }
        if (cell.italic) {
            styles.push(`font-style:italic`);   
        }
        if (cell.underline) {
            styles.push(`text-decoration:underline`);   
        }
        if (cell.align) {
            styles.push(`text-align:${cell.align}`);
        }
        ['Top', 'Left', 'Bottom', 'Right'].forEach(side => {
            const borderWidth = cell[`border${side}Width`] || this.props[`cellBorder${side}Width`];
            const borderColor = cell[`border${side}Color`] || this.props[`cellBorder${side}Color`];
            if (borderWidth) {
                styles.push(`border-${side.toLowerCase()}-width:${borderWidth}pt`);
            }
            if (borderColor) {
                styles.push(`border-${side.toLowerCase()}-color:${borderColor}`);
            }
        });
        return styles.join(';');
    }

    afterDesignerRender(domEl) {
        this.renderResizeBars(domEl);
        $(domEl).find('td, th').on('click', this.onCellClick.bind(this));
        $(domEl).on('click', this.onElClick.bind(this));
    }

    renderResizeBars(domEl) {
        const me = this;
        let offset = 0;
        const $domEl = $(domEl);
        const tableWidth = $domEl.width();
        let prevBarPos = 0;
        let prevBar = null;
        for (let i = 0; i < this.props.columns.length - 1; i++) {
            offset += (parseFloat(this.props.columns[i].width) / 100) * tableWidth;
            const bar = $(`<div class="${Table.RESIZE_BAR_CLS}"></div>`)
                .css('left', `${offset - 2}px`)
                .data({
                    'jsr-col-ix': i,
                    'jsr-bar-pos': offset,
                    'jsr-left-bar-pos': prevBarPos
                });
            if (prevBar) {
                prevBar.data('jsr-right-bar-pos', offset);
            }
            $domEl.append(bar);
            bar.drag('start', function(ev, dd) {
                dd.containerOffsetX = $domEl.offset().left;
                dd.maxX = $domEl.outerWidth() - $(this).outerWidth();
                $(this).addClass(Table.RESIZE_BAR_DRAG_CLS);
            }).drag(function(ev, dd) {
                $(this).css({ left: Math.min(dd.maxX, Math.max(dd.offsetX - dd.containerOffsetX, 0)) });
            }).drag('end', function(ev, dd) {
                $(this).removeClass(Table.RESIZE_BAR_DRAG_CLS);
                const leftBarPos = $(this).data('jsr-left-bar-pos') || 0;
                const rightBarPos = $(this).data('jsr-right-bar-pos') || tableWidth;
                const pos = Math.max(leftBarPos + 10, Math.min(rightBarPos - 10, dd.offsetX - dd.containerOffsetX));
                const colIx = $(this).data('jsr-col-ix');
                const leftPctChg = (pos - $(this).data('jsr-bar-pos')) / tableWidth * 100;
                const leftCol = me.props.columns[colIx];
                const rightCol = me.props.columns[colIx + 1];
                leftCol.width = `${(parseFloat(leftCol.width) + leftPctChg).toFixed(2)}%`;
                rightCol.width = `${(parseFloat(rightCol.width) - leftPctChg).toFixed(2)}%`;
                me.raiseEvent('propertychange');
            });
            prevBarPos = offset;
            prevBar = bar;
        }
    }

    /** @private */
    deselectCells(domEl) {
        this.selectedCellColIx = null;
        this.selectedCellRowId = null;
        $(domEl).find(`.${Table.selectedCellClass}`).removeClass(Table.selectedCellClass);
    }

    onDesignerSelect(domEl) {
        this.deselectCells(domEl);
        this.isSelected = true;
    }

    onDesignerDeselect(domEl) {
        this.deselectCells(domEl);
        this.isSelected = false;
    }

    onCellClick(evt) {
        if (!this.isSelected) return;
        const $td = $(evt.target).closest('td, th')
        const $tbl = $td.closest('table');
        const prevColIx = this.selectedCellColIx;
        const prevRowId = this.selectedCellRowId;
        const newColIx = $td.data('jsr-col-ix');
        const newRowId = $td.data('jsr-row-id');
        this.deselectCells($tbl[0]);
        // Re-clicking same cell switches back to table-selection
        if (newColIx !== prevColIx || newRowId !== prevRowId) {
            this.selectedCellColIx = newColIx;
            this.selectedCellRowId = newRowId;
            $td.addClass(Table.selectedCellClass);
        }
        this.raiseEvent('toolbarchange');
    }

    /** 
    * Handle click on element outside of table (should deselect any cell)
    * @private 
    */
    onElClick(evt) {
        if (!this.isSelected) return;
        if ($(evt.target).closest('td, th').length > 0) return;
        this.deselectCells($(evt.target)[0]);
        this.raiseEvent('toolbarchange');
    }

    getToolbarItems(schema, context) {
        return this.selectedCellRowId ? this.getCellToolbar(schema, context) : this.getTableToolbar(context);
    }

    /** @private */
    getTableToolbar(context) {
        return [{
            type: 'dropdown',
            label: 'Data source',
            options: context.dataSources.map(ds => ({
                id: ds.id,
                text: (ds.id === '__parentgroup' ? 'Grouped rows' : ds.name)
            })),
            boundProperty: 'dataSource'
        },{
            type: 'checkbox',
            label: 'Has header',
            boundProperty: 'hasHeader'
        },{
            type: 'checkbox',
            label: 'Has footer',
            boundProperty: 'hasFooter'
        },{
            type: 'dropdown',
            label: 'Columns',
            options: ['1', '2', '3', '4', '5', '6'],
            allowTextInput: true,
            value: String(this.props.columns.length),
            onChange: (val) => {
                const newCount = parseInt(val, 10);
                if (isNaN(newCount)) return;
                const origColCount = this.props.columns.length;
                const diff = newCount - origColCount;
                if (diff === 0) return;
                if (diff > 0) {
                    // Adding cols
                    const newColWidthPct = 100 / newCount;
                    // Scale down original columns, keeping relative widths
                    for (let i = 0; i < origColCount; i++) {
                        const col = this.props.columns[i];
                        col.width = `${parseFloat(col.width) * (origColCount / newCount)}%`;
                    }
                    for (let i = 0; i < diff; i++) {
                        const ix = origColCount + i + 1;
                        this.props.columns.push(newColumn(`${newColWidthPct}%`, 
                            newCell(`Header ${ix}`), 
                            newCell(`Detail ${ix}`), 
                            newCell(`Footer ${ix}`)));
                    }
                } else {
                    // Removing cols
                    if (confirm(`This will remove the rightmost ${-diff} columns from the table.  Are you sure you want to continue?`)) {
                        // Scale up original columns, keeping relative widths
                        for (let i = 0; i < origColCount; i++) {
                            const col = this.props.columns[i];
                            col.width = `${parseFloat(col.width) * (origColCount / newCount)}%`;
                        }
                        this.props.columns.splice(newCount, -diff);
                    } else {
                        // User cancelled; abort the change
                        return false;
                    }
                }
            }
        }];
    }

    /** @private */
    getCellToolbar(schema, context) {
        const cell = this.getSelectedCell();
        if (this.props.dataSource !== '__parentgroup') {
            const ds = context.dataSources.find(ds => 
                ds.id.toLowerCase() === this.props.dataSource.toLowerCase());
            if (ds) {
                schema = ds.schema;
            }
        }
        const suggestions = schema ? schema.fields.map(f => `[${f.name.replace(/\W+/g, '_')}]`) : [];
        const items = [{
            type: 'text',
            label: 'Text',
            suggestions: suggestions,
            value: (typeof cell === 'object' ? cell.text : cell),
            onChange: (val) => {
                this.setSelectedCellText(val);
            }
        }];
        if (typeof cell === 'object') {
            items.push({
                type: 'conditionalRules',
                value: cell.conditionalRules,
                onChange: (rules) => {
                    cell.conditionalRules = rules;
                }
            });
        }
        return items;
    }

    /** @private */
    getSelectedCell() {
        if (!this.selectedCellRowId) return null;
        const col = this.props.columns[this.selectedCellColIx];
        return col[this.selectedCellRowId];
    }

    setSelectedCellText(text) {
        const cell = this.getSelectedCell();
        if (typeof cell === 'object') {
            cell.text = text;
        } else {
            const col = this.props.columns[this.selectedCellColIx];
            col[this.selectedCellRowId] = text;
        }
    }

    getExtendedProperties(context) {
        return this.selectedCellRowId ? this.getExtendedCellProperties(context) : this.getExtendedTableProperties(context);
    }

    /** @private */
    getExtendedTableProperties(context) {
        const props = {
        };
        ['Top', 'Left', 'Bottom', 'Right'].forEach(side => {
            props[`border${side}Width`] = {
                group: 'Appearance', 
                name: `Table ${side} border thickness`,
                type: 'number'
            };
            props[`border${side}Color`] = {
                group: 'Appearance', 
                name: `Table ${side} border color`,
                type: 'color'
            };
            props[`cellBorder${side}Width`] = {
                group: 'Cell Defaults', 
                name: `Cell ${side} border thickness`,
                type: 'number'
            };            
            props[`cellBorder${side}Color`] = {
                group: 'Cell Defaults', 
                name: `Cell ${side} border color`,
                type: 'color'
            };
        });
        return props;
    }

    /** @private */
    getExtendedCellProperties(context) {
        const props = {
            'align': {
                group: 'Appearance', 
                name: 'Align (horizontal)',
                type: 'string', 
                options: ['left', 'center', 'right'] 
            },
            'text': {
                group: 'Content', 
                name: 'Text', 
                type: 'string'
            },
            'textColor': {
                group: 'Appearance', 
                name: 'Text color', 
                type: 'color'
            },
            'backgroundColor': {
                group: 'Appearance',
                name: 'Background color',
                type: 'color'
            },
            'bold': {
                group: 'Appearance',
                name: 'Bold',
                type: 'boolean'
            },
            'italic': {
                group: 'Appearance',
                name: 'Italic',
                type: 'boolean'
            } 
        };
        ['Top', 'Left', 'Bottom', 'Right'].forEach(side => {
            props[`border${side}Width`] = {
                group: 'Appearance', 
                name: `${side} border thickness`,
                type: 'number'
            };
            props[`border${side}Color`] = {
                group: 'Appearance', 
                name: `${side} border color`,
                type: 'color'
            };
        });
        return props;
    }

    getExtendedPropertyValues() {
        return this.selectedCellRowId ? this.getExtendedCellPropertyValues() : this.getExtendedTablePropertyValues();
    }

    /** @private */
    getExtendedTablePropertyValues() {
        const props = {};
        const propNames = ['left', 'top', 'width', 'height'];
        ['Top', 'Left', 'Bottom', 'Right'].forEach(side => {
            propNames.push(`border${side}Width`);
            propNames.push(`border${side}Color`);
            propNames.push(`cellBorder${side}Width`);
            propNames.push(`cellBorder${side}Color`);
        });
        propNames.forEach(prop => {
            props[prop] = this.props[prop];
        });
        return props;
    }

    /** @private */
    getExtendedCellPropertyValues() {
        const cell = this.getSelectedCell();
        return cell;
    }

    saveExtendedProperties(props) {
        return this.selectedCellRowId ? this.saveCellProps(props) : this.saveTableProps(props);
    }

    /** @private */
    saveCellProps(props) {
        const cell = this.getSelectedCell();
        _.extend(cell, props);
    }

    /** @private */
    saveTableProps(props) {
        _.extend(this.props, props);
    }

}

export default Table;
