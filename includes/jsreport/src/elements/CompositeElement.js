import { ReportElement, PropTypes } from './ReportElement';
import ElementUtils from './ElementUtils';
import _ from 'underscore';

/**
 * A pre-defined element made up out of built-in Ditto elements.
 * To define a new CompositeElement, extend CompositeElement and implement
 * propTypes and getDefinition.  See the Checkbox implementation for an
 * example.
 */
export class CompositeElement extends ReportElement {

    static isComposite = true;

    getHtml() {
        return 'HTML rendering not supported';
    }

    /**
     * Generate the element definition objects that will be used to
     * render the element.  This should be an array of plain JavaScript
     * objects defining elements, and will be serialized to JSON as part
     * of the report definition.
     * Element positions should be relative to this element - that is,
     * a position of (0, 0) means the top-left corner of this element.
     * Units are in absolute report units, i.e. inches or mm.
     */
    getChildElementDefinitions() {
        return [];
    }
    
    /**
     * Returns an array of toolbar items to show in the designer
     * toolbar when the element is selected.
     */
    getToolbarItems() {
        return [];
    }
};

export default CompositeElement;
