import _ from 'underscore';

export const PropTypes = {
    number: 'NUMBER',
    object: 'OBJECT',
    string: 'STRING',
    array: 'ARRAY',
    boolean: 'BOOL',
    color: 'COLOR',
    font: 'FONT',
    oneOf: list => ({ type: 'oneOf', values: list })
};

export const LengthUnits = {
    INCHES: 'INCHES',
    MM: 'MM'
};

const validators = {
    number: v => typeof v === 'number',
    object: v => typeof v === 'object',
    string: v => typeof v === 'string',
    array: v => Array.isArray(v),
    boolean: v => typeof v === 'boolean',
    color: v => true /* TODO */,
    oneOf: (v, t) => (t.values.indexOf(v) >= 0)
};

/**
 * Defines a type of element (e.g. chart, box, text) that can be added to a report.
 * Extend this class to define your own element types.  See the Line class for an
 * example.
 */
export class ReportElement {

    static propTypes = {
        top: PropTypes.number,
        left: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        conditionalRules: PropTypes.array
    };

    static defaultProps = {
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        conditionalRules: []
    };

    constructor(props) {
        // FIXME this JSON serialization will be too slow when these elements are used many times
        // FIXME in a report - need some way to safely modify non-primitive properties
        props = JSON.parse(JSON.stringify(_.extend({}, this.constructor.defaultProps, props)));
        this.validateProps(props);
        this.props = props;
    }

    validateProp(propKey, value) {
        const expectedType = this.constructor.propTypes[propKey];
        if (!expectedType) return true;
        /** Always allow calculated values regardless of final type */
        if (typeof value === 'string' && value.indexOf('=') === 0) return true;
        // Coerce numeric strings to numbers
        if (typeof value !== 'number' && expectedType === PropTypes.number) {
            const numeric = Number(value);
            if (!isNaN(numeric)) {
                value = numeric;
                // Otherwise, leave as string to hit type check below
            }
        }
        const typeKey = Object.keys(PropTypes).find(key => 
            PropTypes[key] === expectedType 
            || expectedType.type === key);
        if (validators[typeKey](value, expectedType)) return true;
        const expectedTypeDesc = typeKey === 'oneOf' ? 
            `one of: ${JSON.stringify(expectedType.values)}`
            : typeKey;
        console.warn(`Invalid value for ${this.constructor.name} element property "${propKey}": `
            + `expected ${expectedTypeDesc}; got ${JSON.stringify(value)} instead`);
        return false;
    }

    validateProps(props) {
        Object.keys(props).forEach(propKey => {
            if (!this.validateProp(propKey, props[propKey])) {
                props[propKey] = this.constructor.defaultProps[propKey];
            }
        });
        return props;
    }

    /** These properties should be overridden by subclasses */
    static typeId = '';
    static cssClass = '';
    static displayName = '';
    static allowedReportTypes = ['hierarchical'];   // Options: 'hierarchical', 'dashboard'
    static units = LengthUnits.INCHES;

    /**
     * Return the HTML to show inside the designer preview element.
     * Will be called after any property change.
     */
    getDesignerHtml() {
        return 'Designer not supported';
    }

    // TODO how are we going to handle this - need to provide access to the string evaluation
    // TODO   feature, at least
    getHtml() {
        return 'HTML rendering not supported';
    }
    
    /**
     * Return a single array of item configs for a single row of
     * toolbar items; array of arrays for multiple rows 
     */
    getToolbarItems() {
        return [];
    }

    saveExtendedProperties(props) {
        this.validateProps(props);
        _.extend(this.props, this.removeClearedProperties(props));
    }

    /** 
     * For number properties, allow entering an empty string to set the property to undefined
     */
    removeClearedProperties(props, propTypes) {
        if (!propTypes) {
            propTypes = this.constructor.propTypes;
        }
        Object.keys(props).forEach(propKey => {
            const propType = propTypes[propKey];
            if (props[propKey] === '' && propType === PropTypes.number) {
                props[propKey] = undefined;
            }
        });
        return props;
    }

    getDataSource(id) {
        // Placeholder for function injected at render time by Ditto
        return console.error('getDataSource() called outside of render context');
    }
};

export default ReportElement;
