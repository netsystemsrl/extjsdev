/**
 * @class Sch.column.timeAxis.Vertical
 *
 * @extends Ext.grid.column.Column
 * A Column representing the time axis in vertical orientation
 * @constructor
 * @param {Object} config The configuration options
 */
Ext.define('Sch.column.timeAxis.Vertical', {

    extend : 'Ext.grid.column.Column',

    alias : 'widget.verticaltimeaxis',

    /*
     * Default timeaxis column properties
     */
    align : 'right',

    draggable             : false,
    groupable             : false,
    hideable              : false,
    sortable              : false,
    menuDisabled          : true,
    timeAxis              : null,
    timeAxisViewModel     : null,
    enableLocking         : false,
    locked                : true,
    lockable              : false,
    dataIndex             : 'start',

    initComponent : function () {
        this.callParent(arguments);
        this.tdCls = (this.tdCls || '') + ' sch-verticaltimeaxis-cell';
        this.scope = this;

        this.addCls('sch-verticaltimeaxis-header');
    },

    renderer : function (val, meta, record, rowIndex) {
        var viewModel   = this.timeAxisViewModel;

        // With forceFit option in timeAxisViewModel in vertical mode we may try to render timeaxis column
        // which doesn't make sense, because header config is empty so just skip it
        if (!viewModel.columnConfig.middle) {
            return;
        }

        // subtract 1px for cell top border, defined in Sch/view/Vertical.scss
        meta.style      = 'height:' + (viewModel.getTickWidth() - 1) + 'px';

        var header;

        // We only need fancy rendering in vertical mode
        // 040_schedulergrid
        if (!viewModel.isWeek() && val && viewModel.isMajorTick(val)) {
            header = viewModel.headerConfig[viewModel.getMajorHeaderName()];
            meta.tdCls += ' sch-column-line-solid';
        } else {
            header = viewModel.getBottomHeader();
        }

        if (header.renderer) {
            return header.renderer.call(header.scope || this, record.data.start, record.data.end, meta, rowIndex);
        } else {
            return Ext.Date.format(val, header.dateFormat);
        }
    }
});

