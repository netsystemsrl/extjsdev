class RadialDimension2D_object extends BaseObject2D_object{

    constructor( _objectId  )
    {
        super( _objectId , 'linear-object' ); // non è radiale , è sempre lineare
        this.properties.width=100;
        this.properties.height=100;
        this.properties.markerId = 'dimension-arrow-outside';
        this.properties.horizontalLabel = false;
        this.properties.labelOffset = 35;
        this.properties.preText = '';
        this.properties.postText = '';
    }

    update()
    {
        if(this.isInitialized===false)
        {
            const dimensionArrow = activeApplication.activeDocument.resources.getResourceById( 'dimension-arrow');
            if(!dimensionArrow) this.createResources
            (
                `<marker id="dimension-arrow" orient="auto-start-reverse" refX="5" refY="0" markerUnits="userSpaceOnUse"  markerWidth="10" markerHeight="10" viewBox="-5 -5 10 10">
                    <path d="M -5 -5 L 5 0 L -5 5 Z" stroke="none" fill="currentColor" ></path>
                </marker>`
            );
            const dimensionArrowOutside = activeApplication.activeDocument.resources.getResourceById( 'dimension-arrow-outside');
            if(!dimensionArrowOutside) this.createResources
            (
                `<marker id="dimension-arrow-outside" orient="auto-start-reverse" refX="0" refY="0" markerUnits="userSpaceOnUse"  markerWidth="10" markerHeight="10" viewBox="0 -5 10 10">
                    <path d="M 10 -5 L 0 0 L 10 5 Z" stroke="none" fill="currentColor" ></path>
                </marker>`
            );

            const dimensionPoint = activeApplication.activeDocument.resources.getResourceById( 'dimension-point');
            if(!dimensionPoint) this.createResources
            (
                `<marker id="dimension-point" refX="0" refY="0" markerUnits="userSpaceOnUse"  markerWidth="10" markerHeight="10" viewBox="-5 -5 10 10">
                    <circle cx="0" cy="0" r="3" fill="currentColor" stroke="none"></circle>
                </marker>`
            );

            this.isInitialized = true;
        }


        const width = this.properties.width;


        this.elements['line-dimension'].updateGeometry(0,0,width, 0);

        let markerId = this.properties.markerId;
        this.elements['line-dimension'].setAttribute('marker-end','url(#'+markerId+')' );

        const labelPosX =  width + this.properties.labelOffset;
        const label = this.elements['label'];

        const matrix = label.getTransform().matrix;
        matrix.identity();

        let angle =  this.graphicElement.getCTM().inverse().getRotation();
        let labelMatrix = matrix.translate( labelPosX, 0 ).rotate( angle  );

        label.getTransform().setMatrix(labelMatrix);

        label.textContent = this.properties.preText + activeApplication.activeDocument.valueToUnit(width) +  this.properties.postText;

        super.update(  );
    }


    create()
    {
        return `<g data-type="object" data-object-id="radial-dimension" stroke="#000000" fill="#000000" data-width="300" data-height="-40" >
                    <line data-name="line-dimension" stroke-width="2" x1="0" y1="0" x2="300" y2="0" marker-start="url(#dimension-point)" marker-end="url(#dimension-arrow-outside)" vector-effect="non-scaling-stroke" ></line>
                    <text data-name="label" y="0" font-size="10" text-anchor="middle" font-family="Roboto" stroke="none" ></text>
                </g>`;
    }


    createInspector()
    {
        console.log('createInspector');
        return `
                <radial-dimension-inspector>
                    <div class="divisor"></div>
                    
                    <div class="property-container">

                        <div class="header">
                            <div class="title">Radial dimension</div>
                        </div>

                        <div class="content">
                        
                       
                         <div class="input-property">
                            <div class="label" data-translate >marker type</div>
                            <select name="markerId" data-property-type="string" data-event="change:onChangeProperty">
                                <option value="dimension-arrow">arrow</option>
                                <option value="dimension-arrow-outside">arrow outside</option>
                                <option value="dimension-point">dot</option>
                            </select>
            
                        </div>
            
                            <div class="title">Label </div>
                             
                             <div class="grid-2c-content">
                                 <div class="input-property">
                                    <div class="label">Pre-text</div>
                                    <input name="preText" type="text" data-property-type="string" data-event="change:onChangeProperty"/>
                                </div>
                                
                                 <div class="input-property">
                                    <div class="label">Post-text</div>
                                    <input name="postText" type="text" data-property-type="string" data-event="change:onChangeProperty"/>
                                </div>
                            </div>
                                                      
                             <div class="grid-2c-content">
                              <div class="input-property">
                                    <div class="label">Offset</div>
                                    <input name="labelOffset" type="text" data-property-type="dimension" data-event="change:onChangeProperty"/>
                                </div>
                                <div class="input-property">
                                    <div class="label">Orient</div>
                                    <input type="checkbox" name="horizontalLabel" id="horizontalLabel" data-property-type="boolean" data-event="change:onChangeProperty">
                                    <label class="label" for="horizontalLabel" data-translate >Horizontal</label>
                                </div>
                                
                               
                            </div>
                            
                             <div class="divisor"></div>
                    </div>
                </radial-dimension-inspector>
             `;
    }

}

new RadialDimension2D_object('radial-dimension');





/* ----------   INSPECTOR PROPERTIES  ------------------- */

class RadialDimension2D_inspector extends BaseObjectInspector_cmp
{
    constructor() {
        super();
    }
}

customElements.define("radial-dimension-inspector", RadialDimension2D_inspector );

