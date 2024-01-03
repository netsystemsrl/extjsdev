import { PropTypes } from './ReportElement';
import CompositeElement from './CompositeElement';
import ElementUtils from './ElementUtils';
import _ from 'underscore';
import base64 from 'base-64';

const checkedImageUrl = `data:image/png;base64,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\
SUtJGl2AAAAAElFTkSuQmCC`;

const uncheckedImageUrl = `data:image/png;base64,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`;

/**
 * Checkbox element.  Demonstrates how to use CompositeElement to render an element
 * made up out of one or more built-in Ditto elements, with its own properties that
 * determine the child element rendering.
 * 
 * This element just provides one property, "checked," and chooses one of two images
 * to display based on whether that property is true or false.
 */
class Checkbox extends CompositeElement {

    static propTypes = {
        checked: PropTypes.boolean
    };

    static defaultProps = {
        checked: true
    };

    static typeId = 'checkbox';
    static displayName = 'Checkbox';
    static cssClass = 'jsr-checkbox';
    static iconSrc = checkedImageUrl;

    /**
     * Returns an array of child element definitions, generated based on the composite
     * element's properties.  The resulting element definitions are used to render the
     * element both in the designer and at runtime.
     */
    getChildElementDefinitions() {
        /** 
         * Start with a regular Image element, then override the url property
         * with the correct image data URL based on whether the element is checked.
         * Here is where you should modify the child elements based on the current
         * property values of the parent composite element.
         */
        const lesserDimension = Math.min(this.props.width, this.props.height);
        const checkboxImage = _.extend(ElementUtils.getDefaultDef('image'), {
            url: this.props.checked ? checkedImageUrl : uncheckedImageUrl,
            width: lesserDimension,
            height: lesserDimension
        });
        /** Return an array of elements to render */
        return [ checkboxImage ];
    }

    // FIXME this needs to be renamed, it's confusing - "get field options for 'checked' property"
    static getCheckedOptions(schema) {
        let options = ['true', 'false'];
        if (schema) {
            options = [ ...options, ...schema.fields.map(field => `=${field.name.replace(/\W+/g, '_')}`) ];
        }
        return options;
    }

    /** 
     * Define the selectors that appear in the designer toolbar when an element
     * of this type is selected.  For the Checkbox, we have only one selector: a drop-down
     * with true/false.  The dropdown must allow free text input to allow for calculated
     * expressions, for example: =rowIsChecked
     */
    getToolbarItems(currentSchema, context) {
        return [{
            type: 'dropdown',
            label: 'Checked',
            options: Checkbox.getCheckedOptions(currentSchema),
            allowTextInput: true,
            boundProperty: 'checked',
            /** 
             * Whenever a value is chosen in the selector, normalizeValue will be called
             * to convert the value into the correct type for the property.  String values
             * beginning with an equals sign (=) (i.e., calculated property expressions)
             * do not pass through normalizeValue and are stored directly as strings.
             */
            normalizeValue: val => (val === 'true')
        }];
    }

}

export default Checkbox;
