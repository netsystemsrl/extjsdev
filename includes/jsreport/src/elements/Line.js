import { ReportElement, PropTypes } from './ReportElement';
import CompositeElement from './CompositeElement';
import ElementUtils from './ElementUtils';
import _ from 'underscore';

/**
 * Line element
 */
class Line extends CompositeElement {

    static propTypes = {
        thickness: PropTypes.number,
        direction: PropTypes.oneOf(['vertical', 'horizontal']),
        color: PropTypes.color
    };

    static defaultProps = {
        thickness: 1,
        direction: 'horizontal',
        color: 'black'
    };

    static typeId = 'line';
    static displayName = 'Line';
    static cssClass = 'jsr-line';
    static iconSrc = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoAQMAAAC2MCouAAAABlBMVEUAAAAAAAClZ7nPAAAAAXRSTlMAQObYZgAAABpJREFUCNdjoA/4AcTyDP3/////iExCxekIAIa4D6Y30X5tAAAAAElFTkSuQmCC';

    getChildElementDefinitions() {
        const horiz = (this.props.direction === 'horizontal');
        const ptsPerInch = 72;
        const thicknessInches = this.props.thickness / ptsPerInch;
        const box = _.extend(ElementUtils.getDefaultDef('box'), {
            width: horiz ? this.props.width : thicknessInches,
            height: horiz ? thicknessInches : this.props.height,
            left: 0,
            top: 0,
            background_color: this.props.color,
            border_color: 'transparent',
            borderThickness: 0
        });
        ['zIndex' /*, ...other self props to copy */].forEach(ownProp => {
            if (this.props.hasOwnProperty(ownProp)) {
                box[ownProp] = this.props[ownProp];
            }
        });
        return [ box ];
    }

    getToolbarItems() {
        return [{
            type: 'dropdown',
            label: 'Thickness',
            options: ['0.25', '0.5', '1', '2', '4'],
            allowTextInput: true,
            boundProperty: 'thickness',
            normalizeValue: val => Number(val)
        },{
            type: 'color',
            label: 'Color',
            boundProperty: 'color'
        },{
            type: 'dropdown',
            label: 'Direction',
            options: ['Horizontal', 'Vertical'],
            boundProperty: 'direction',
            normalizeValue: val => val.toLowerCase()
        }];
    }

}

export default Line;
