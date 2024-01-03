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

class MeasureTile extends CompositeElement {

    static propTypes = {
        field: PropTypes.string,
        aggregate: PropTypes.string,
        title: PropTypes.string,
        computedValue: PropTypes.number
    };

    static defaultProps = {
        aggregate: 'median',
        field: '',
        title: 'Title'
    };

    static typeId = 'measureTile';
    static displayName = 'Measure Tile';
    static cssClass = 'jsr-tile jsr-measure-tile';
    static iconSrc = '';
    static allowedReportTypes = ['dashboard'];

    constructor(props) {
        if (!props.computedValue) {
            props.computedValue = `=${AGGREGATES[props.aggregate]}('${props.field}')`;
        }
        super(props);
    }

    getFormattedValue() {
        if (typeof this.props.computedValue !== 'undefined') {
            return this.props.computedValue.toFixed(2); // TODO format correctly, units etc.
        }
        return '3.79M'; // Placeholder value for designer
    }

    getChildElementDefinitions() {

        // FIXME create "EditableText" element type that allows typing over what's in there, somehow changes this
        // FIXME elt's "title" property when changed - need events
        const titleFontSize = 10;
        const titleTextHeight = titleFontSize / 72 * 1.2;
        const titleText = _.extend(ElementUtils.getDefaultDef('text'), {
            text: this.props.title,
            width: this.props.width - 0.2,
            fontsize: titleFontSize,
            height: titleTextHeight,
            left: 0.1,
            top: 0.1,
            text_color: '#888888'
        });

        const numberFontSize = 20;
        const numberTextHeight = numberFontSize / 72 * 1.2;
        const remainingHeight = this.props.height - 0.2 - titleTextHeight;
        const numberTop = 0.1 + titleTextHeight + (remainingHeight - numberTextHeight) / 2;
        // TODO adapt font sizes to available space based on length of text (shrink/expand to fit)?
        const bigNumber = _.extend(ElementUtils.getDefaultDef('text'), {
            fontsize: numberFontSize,
            width: this.props.width,
            height: numberTextHeight,
            top: numberTop,
            text: this.getFormattedValue(),
            align: 'center'
        });
        return [ titleText, bigNumber ];
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

export default MeasureTile;
