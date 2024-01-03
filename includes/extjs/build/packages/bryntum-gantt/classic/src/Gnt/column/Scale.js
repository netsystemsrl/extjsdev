/**

@class Gnt.column.Scale
@extends Ext.grid.column.Template

A Column used to to display a vertical coordinate axis (numeric scale). This column is used by the {@link Gnt.panel.ResourceHistogram ResourceHistogram} panel.

Usage example:

    var histogram = Ext.create('Gnt.panel.ResourceHistogram', {
        taskStore           : taskStore,
        resourceStore       : resourceStore,
        startDate           : new Date(2010, 0, 11),
        endDate             : new Date(2010, 0, 21),
        renderTo            : Ext.getBody(),
        columns             : [
            {
                flex      : 1,
                dataIndex : 'Name'
            },
            {
                xtype           : 'scalecolumn'
            }
        ]
    });

#Defining the scale

The column supports two configuration modes for the numeric scale. The first one is incremental and the second one is using a fixed set of points.

#Incremental approach

To use this approach you must define the following parameters: {@link #scaleMin}, {@link #scaleMax}, {@link #scaleStep}.
Based on them, the column will build scale points taking the {@link #scaleMin} value as a start value and the {@link #scaleMax} as the last scale point.
Values between {@link #scaleMin} and {@link #scaleMax} will be calculated as:

    valueN = scaleMin + N * scaleStep

Normally this approach is meant to be used for linear scales.

#Fixed set of points

As an option to the earlier approach, you can use the {@link #scalePoints} config. This config can be used to specify an array af scale points.
The array should contain objects describing the scale points, having the following properties:

 - `value`   Scale point value. **This property is required**.
 - `label`   Label for the scale point
 - `cls`     CSS class for corresponding scale point.

For example:

    var scaleColumn = new Gnt.column.Scale({
        scalePoints : [
            {
                value   : 0
            },
            {
                value   : 1,
                label   : 'Day',
                cls     : 'dayend'
            },
            {
                value   : 0.5
            }
        ]
    });

*/
Ext.define('Gnt.column.Scale', {

    extend              : 'Ext.grid.column.Template',

    alias               : 'widget.scalecolumn',

    sortable            : false,

    /**
     * @cfg {Object[]} scalePoints An array of scale points. Each point should be represented as an object containing the following properties:
     *
     * - `value`   Scale point value **(required)**.
     * - `label`   Label for the scale point
     * - `cls`     CSS class for corresponding scale point.
     */
    scalePoints         : null,

    /**
     * @cfg {Number} scaleStep Defines the interval between two adjacent scale points.
     *
     * **Also,** this value is used as the margin between the top scale line (defined by {@link #scaleMax} option) and the top border of the cell.
     */
    scaleStep           : 2,

    /**
     * @cfg {Number} scaleLabelStep Defines the interval between the scale points with labels.
     * By default the scale values are used for the labels. To use custom labels please use the {@link #scalePoints} config.
     */
    scaleLabelStep      : 4,

    /**
     * @cfg {Number} scaleMin Minimum scale point value.
     */
    scaleMin            : 0,

    /**
     * @cfg {Number} scaleMax Maximum scale point value.
     */
    scaleMax            : 24,

    width               : 40,

    //availableHeight     : 48,

    scaleCellCls        : 'gnt-scalecolumn',

    tpl                 : '<div class="gnt-scalecolumn-wrap" style="height:{scaleHeight}px;">'+
        '<tpl for="scalePoints">'+
            '<tpl if="label !== \'\'">'+
                '<span class="gnt-scalecolumn-label-line {cls}" style="bottom:{bottom}px"><span class="gnt-scalecolumn-label">{label}</span></span>'+
            '<tpl else>'+
                '<span class="gnt-scalecolumn-line {cls}" style="bottom:{bottom}px"></span>'+
            '</tpl>'+
        '</tpl>'+
    '</div>',

    initComponent : function () {

        this.tdCls = (this.tdCls || '') + ' ' + this.scaleCellCls;

        this.callParent(arguments);

    },

    onAdded: function() {
        this.callParent(arguments);
        this.setAvailableHeight(this.up('timelinegrid').rowHeight, true);
    },

    setAvailableHeight : function (height, initial) {
        this.availableHeight    = height;

        // if no ready scalePoints array specified
        if (!this.scalePoints) {

            this.scaleStepHeight    = this.availableHeight / (this.scaleMax - this.scaleMin + this.scaleStep);

            // build scale point based on min/max/step size params
            this.scalePoints = this.buildScalePoints();

        // if scale points array provided
        } else {
            if (initial) {
                this.scalePoints.sort(function (a, b) { return a.value - b.value; });

                this.scaleMin       = this.scalePoints[0].value;
                this.scaleMax       = this.scalePoints[this.scalePoints.length - 1].value;
                this.scaleStep      = (this.scaleMax - this.scaleMin) / 10;
            }

            this.scaleStepHeight    = this.availableHeight / (this.scaleMax - this.scaleMin + this.scaleStep);

            // let's fill it with calculated coordinates
            this.updateScalePoints();
        }
    },

    defaultRenderer : function (value, meta, record) {
        var data = {
            record      : Ext.apply({}, record.data, record.getAssociatedData()),
            scaleHeight : this.availableHeight,
            scalePoints : this.scalePoints
        };

        return this.tpl.apply(data);
    },

    buildScalePoints : function () {
        var minValue        = this.scaleMin,
            value           = minValue,
            step            = this.scaleStep,
            labelStep       = this.scaleLabelStep,
            stepHeight      = this.scaleStepHeight,
            availableHeight = this.availableHeight,
            scaleCellCls    = this.scaleCellCls,
            // additional css class for scaleMin point
            cls             = scaleCellCls+'-min',
            result          = [];

        // shorthand
        var makePoint   = function (value, label, cls) {
            return {
                bottom  : Math.round((value - minValue) * stepHeight),
                value   : value,
                label   : label != 'undefined' ? label : '',
                cls     : cls || ''
            };
        };

        // push scale points starting from scaleMin
        while (value < this.scaleMax) {

            if (value > 0) {
                result.push( makePoint(value, value % labelStep || value === minValue ? '' : value, cls) );
            }

            cls = '';

            value += step;
        }

        // push scaleMax point
        result.push( makePoint(this.scaleMax, this.scaleMax, scaleCellCls+'-max') );

        return result;
    },

    updateScalePoints : function () {
        var stepHeight      = this.scaleStepHeight,
            availableHeight = this.availableHeight;

        Ext.Array.each(this.scalePoints, function(point) {
            point.bottom   = Math.round(point.value * stepHeight);
        });
    }
});
