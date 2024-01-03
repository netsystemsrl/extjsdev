class LinearDimension2D_object extends BaseObject2D_object{

    constructor( _objectId  )
    {
        super( _objectId , 'linear-object' );
        this.properties.width=100;
        this.properties.height=100;
        this.properties.markerId = 'dimension-arrow';
        this.properties.horizontalLabel = false;
        // this.properties.lineOffset = -40;
        this.properties.labelOffset = 20;
        // this.properties.textColor = '#000000';
        // this.properties.lineColor = '#000000';
        this.properties.startWitnessLineOffsetY = 5;
        this.properties.endWitnessLineOffsetY = 5;
        // this.properties.witnessLinesColor = '#4c4c4c';
        this.properties.preText = '';
        this.properties.postText = '';
        this.createBy3Points = true;

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
                    <circle cx="0" cy="0" r="5" fill="currentColor" stroke="none"></circle>
                </marker>`
            );
            const dimensionArchitect = activeApplication.activeDocument.resources.getResourceById( 'dimension-architect');
            if(!dimensionArchitect) this.createResources
            (
`<marker id="dimension-architect" refX="0" refY="0" markerUnits="userSpaceOnUse"  markerWidth="10" markerHeight="10" viewBox="-5 -5 10 10">
                    <line stroke-width="1" x1="-5" y1="0" x2="5" y2="0" stroke="#000000"  vector-effect="non-scaling-stroke" ></line>
                    <line stroke-width="1" x1="-5" y1="5" x2="5" y2="-5" stroke="#000000" vector-effect="non-scaling-stroke" ></line>
                </marker>`
            );
            this.isInitialized = true;
        }


        const width = this.properties.width;
        const height = this.properties.height;

        this.elements['line-center-hidden'].updateGeometry(0,0,width, 0);
        this.elements['line-dimension'].updateGeometry(0,height,width, height);

        let markerId = this.properties.markerId;
        if(markerId==='dimension-arrow' && width<12 ) markerId = 'dimension-arrow-outside';
        this.elements['line-dimension'].setAttribute('marker-start','url(#'+markerId+')' );
        this.elements['line-dimension'].setAttribute('marker-end','url(#'+markerId+')' );

        let startLineOffsetY = this.properties.startWitnessLineOffsetY;
        let endLineOffsetY = this.properties.endWitnessLineOffsetY;


        const labelPosX =  width/2;
        let labelPosY = height;
        let labelOffset = this.properties.labelOffset;

        if(height<0)
        {
            startLineOffsetY = 0 - startLineOffsetY;
            endLineOffsetY = 0 - endLineOffsetY;
            labelOffset = 0 - labelOffset;
        }


        const label = this.elements['label'];

        this.elements['start-line-dimension'].updateGeometry(0,startLineOffsetY,0,height);
        this.elements['end-line-dimension'].updateGeometry(width,endLineOffsetY,width, height);

        let angle;
        const matrix = label.getTransform().matrix;
        matrix.identity();

        if(this.properties.horizontalLabel)
        {
            angle =  this.graphicElement.getCTM().inverse().getRotation();
            let labelMatrix = matrix.translate( labelPosX  , labelPosY ).rotate( angle  );
            let labelOffsetMatrix = SVGUtils.createSVGMatrix().translate( labelOffset*2, 0 );
            labelMatrix = labelMatrix.multiply( labelOffsetMatrix  );
            label.getTransform().setMatrix(labelMatrix);
        }else {

            angle = this.graphicElement.getCTM().getRotation();
            if(angle<360)angle+=360;
            if(angle>=90 && angle<270) {angle=180; labelOffset = 0 - labelOffset; } else {angle=0;}
            label.getTransform().setMatrix( matrix.translate( labelPosX , labelPosY ).rotate( angle  ).translate( 0 , labelOffset ) );
        }

        label.textContent = this.properties.preText + activeApplication.activeDocument.valueToUnit(width) +  this.properties.postText;

        super.update();
    }



    create()
    {
        return `<g data-type="object" data-object-id="linear-dimension" stroke="#000000" fill="#000000" >
                    <line data-name="line-center-hidden" stroke-width="0" x1="0" y1="0" x2="300" y2="0" vector-effect="non-scaling-stroke" ></line>
                    <line data-name="line-dimension" stroke-width="2" x1="0" y1="0" x2="300" y2="0" marker-start="url(#dimension-arrow)" marker-end="url(#dimension-arrow)" vector-effect="non-scaling-stroke" ></line>
                    <line data-name="start-line-dimension" stroke-width="1" x1="0" y1="0" x2="0" y2="40" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" pointer-events="none" ></line>
                    <line data-name="end-line-dimension" stroke-width="1" x1="300" y1="0" x2="300" y2="40" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" pointer-events="none" ></line>
                    <text data-name="label" y="0" font-size="10" text-anchor="middle" font-family="Roboto" stroke="none" ></text>
                </g>`;
    }


    createInspector()
    {
        console.log('createInspector');
        return `
                <linear-dimension-inspector>
                    <div class="divisor"></div>
                    
                    <div class="property-container">

                        <div class="header">
                            <div class="title">Linear dimension</div>
                        </div>

                        <div class="content">
                        
                       
                         <div class="input-property">
                            <div class="label" data-translate >marker type</div>
                            <select name="markerId" data-property-type="string" data-event="change:onChangeProperty">
                                <option value="dimension-arrow">arrow</option>
                                <option value="dimension-arrow-outside">arrow outside</option>
                                <option value="dimension-point">dot</option>
                                <option value="dimension-architect">architect</option>
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
                            
                        
                            
                         
                         <div class="title">Witness lines</div>
                         
                            <div class="grid-2c-content">
                                 <div class="input-property">
                                    <div class="label">Start offset</div>
                                    <input name="startWitnessLineOffsetY" type="text" data-property-type="dimension" data-event="change:onChangeProperty"/>
                                </div>
                                
                                 <div class="input-property">
                                    <div class="label">End offset</div>
                                    <input name="endWitnessLineOffsetY" type="text" data-property-type="dimension" data-event="change:onChangeProperty"/>
                                </div>
                            </div>
                                                      
                        </div>

                    </div>
                </linear-dimension-inspector>
             `;
    }


    // showInteraction()
    // {
    //
    //         const bboxInteraction2D =  activeApplication.workspace.bboxInteraction2D;
    //         bboxInteraction2D.show();
    //
    // }

}

new LinearDimension2D_object('linear-dimension');


/* ----------   INSPECTOR PROPERTIES  ------------------- */

class LinearDimension2D_inspector extends BaseObjectInspector_cmp
{
    constructor() {
        super();
    }
}

customElements.define("linear-dimension-inspector", LinearDimension2D_inspector );

