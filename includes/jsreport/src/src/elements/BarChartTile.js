import { PropTypes } from './ReportElement';
import CompositeElement from './CompositeElement';
import ElementUtils from './ElementUtils';
import _ from 'underscore';
import base64 from 'base-64';

const AGGREGATES = {
    'Total': 'SUM',
    'Minimum': 'MIN',
    'Maximum': 'MAX',
    'Count': 'COUNT',
    'Average': 'AVERAGE',
    'Median': 'MEDIAN'
};

class BarChartTile extends CompositeElement {

    static propTypes = {
        field: PropTypes.string,
        aggregate: PropTypes.string,
        title: PropTypes.string,
        computedValue: PropTypes.number
    };

    static defaultProps = {
        aggregate: 'median',
        xAxisField: '',
        yAxisField: '',
        yAxisAggregate: '',
        title: 'Title'
    };

    static typeId = 'barChartTile';
    static displayName = 'Bar Chart Tile';
    static cssClass = 'jsr-tile jsr-barchart-tile';
    static iconSrc = '';
    static allowedReportTypes = ['dashboard'];

    constructor(props) {
        // if (!props.computedValue) {
        //     console.log("Filling in computed value as", `=${AGGREGATES[props.aggregate]}('${props.field}')`);
        //     props.computedValue = `=${AGGREGATES[props.aggregate]}('${props.field}')`;
        // }
        super(props);
    }

    getChildElementDefinitions() {

        // FIXME create "EditableText" element type that allows typing over what's in there, somehow changes this
        // FIXME elt's "title" property when changed - need events
        const titleText = _.extend(ElementUtils.getDefaultDef('text'), {
            text: this.props.title,
            width: this.props.width - 0.2,
            height: 0.25, //this.props.height * 0.3,
            left: 0.1, //this.props.width * 0.05,
            top: 0.1, //this.props.width * 0.05,
            text_color: '#888888'
        });

        const ySeriesExpr = this.props.yAxisAggregate ? 
            `=${AGGREGATES[this.props.yAxisAggregate]}('${this.props.yAxisField}')`
            : this.props.yAxisField;

        const chart = _.extend(ElementUtils.getDefaultDef('chart_bar'), {
            width: this.props.width - 0.2,
            left: 0.1, //this.props.width * 0.05,
            top: 0.45, //this.props.height * 0.35,
            height: (this.props.height - 0.55),
            align: 'center',
            x_axis: {
                label_field: this.props.xAxisField
            },
            y_axis: {
                title: this.props.yAxisField
            },
            series: [{
                value_field: ySeriesExpr
            }],
            groupBy: this.props.xAxisField,
            legend: false
        });
        return [ titleText, chart ];
    }

    getToolbarItems(currentSchema) {
        return [{
            type: 'dropdown',
            label: 'Aggregate',
            options: Object.keys(AGGREGATES),
            allowTextInput: true,
            boundProperty: 'aggregate'
            // normalizeValue: val => (val === 'true')
            // TODO update computedValue when changed
        },{
            type: 'dropdown',
            label: 'Field',
            options: currentSchema ? currentSchema.fields.map(f => f.name) : [],
            // allowTextInput: true,
            boundProperty: 'field'
            // TODO update computedValue when changed
            // normalizeValue: val => (val === 'true')
        },{
            type: 'text',
            label: 'Title',
            boundProperty: 'title'
        }];
    }

}

export default BarChartTile;
