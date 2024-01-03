class AngularDimension2D_object extends BaseObject2D_object {

    constructor( _objectId  )
    {
        super( 'angular-dimension' , 'radial-object' );
        // super( 'arc-object' ,  'radial-object' , 'draw-arc-tool' );
        this.properties.startAngle = 0;
        this.properties.endAngle=90;
        this.properties.radius=100;

        this.properties.markerId = 'dimension-arrow';
        this.properties.horizontalLabel = false;
        this.properties.labelOffset = 20;
        this.properties.preText = '';
        this.properties.postText = '';

    }

    update(  )
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

            this.isInitialized = true;
        }





        let markerId = this.properties.markerId;
        this.elements['arc-dimension'].setAttribute('marker-start','url(#'+markerId+')' );
        this.elements['arc-dimension'].setAttribute('marker-end','url(#'+markerId+')' );

        const arcResult = this.elements['arc-dimension'].buildArc( {x:0,y:0}, this.properties.radius,this.properties.startAngle,this.properties.endAngle) ;
        this.elements['arc-dimension'].geometryPointList=null;

        this.elements['start-line-dimension'].updateGeometry(0,0,arcResult.startPt.x,arcResult.startPt.y);
        this.elements['end-line-dimension'].updateGeometry(0,0,arcResult.endPt.x,arcResult.endPt.y);

        const label = this.elements['label'];

        let angle = (this.properties.endAngle-this.properties.startAngle)/2;
        if(angle<0) angle+=180;
        const matrix = label.getTransform().matrix;
        matrix.identity();
        const labelPosition = SVGUtils.createSVGPointPolar( this.properties.radius+this.properties.labelOffset , (this.properties.startAngle + angle)*(Math.PI/180) );
        label.getTransform().setMatrix( matrix.translate( labelPosition.x , labelPosition.y ) );


        const activeDocument =  activeApplication.activeDocument;

        label.textContent = this.properties.preText + Math.abs( activeDocument.valueToFixed( (this.properties.endAngle-this.properties.startAngle) ) ) +' °' +  this.properties.postText;

        super.update(  );

    }

    // normalizeScale( _graphicElement , _scaleX , _scaleY , _scaleAverageXY )
    // {
    //     const properties = this.getProperties( _graphicElement );
    //     console.log('properties.radius',properties.radius);
    //     console.log('_scaleAverageXY',_scaleAverageXY);
    //     const scaledRadius = properties.radius * _scaleAverageXY;
    //     this.setProperties( _graphicElement , {radius:scaledRadius});
    // }

    create()
    {
        return `<g data-type="object" data-object-id="angular-dimension" stroke="#000000" fill="#000000" stroke-width="1" >
                    <path data-name="arc-dimension" d="M 0 0" fill="none" vector-effect="non-scaling-stroke" marker-end="url(#dimension-arrow)" ></path>
                    <line data-name="start-line-dimension" stroke-width="1" x1="0" y1="0" x2="0" y2="40" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" pointer-events="none" ></line>
                    <line data-name="end-line-dimension" stroke-width="1" x1="300" y1="0" x2="300" y2="40" stroke-dasharray="2 2" vector-effect="non-scaling-stroke" pointer-events="none" ></line>
                    <text data-name="label" y="0" font-size="10" text-anchor="middle" font-family="Roboto" stroke="none" ></text>
                </g>`;
    }


    // create()
    // {
    //     return `<path d="M 0 0" data-type="object" data-object-id="angular-dimension" stroke-width="1" stroke="#000000" fill="none" ></path>`;
    //
    //
    // }


    createInspector()
    {
        return `
                <angular-dimension-inspector>
                    <div class="property-container">

                        <div class="header">
                            <div class="title">Angular dimension</div>
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
                             

<!--                            <div class="input-property">-->
<!--                                <div class="label">Radius</div>-->
<!--                                <input name="radius" type="text" data-property-type="dimension" data-event="change:onChangeProperty"/>-->
<!--                            </div>-->
<!--                            -->
<!--                            <div class="input-property">-->
<!--                                <div class="label">Start angle</div>-->
<!--                                <input name="startAngle" type="text" data-property-type="angle" data-event="change:onChangeProperty"/>-->
<!--                            </div>-->
<!--                            -->
<!--                            <div class="input-property">-->
<!--                                <div class="label">End angle</div>-->
<!--                                <input name="endAngle" type="text" data-property-type="angle" data-event="change:onChangeProperty"/>-->
<!--                            </div>-->

                        </div>

                    </div>
                </angular-dimension-inspector>
             `;
    }

}

new AngularDimension2D_object();





/* ----------   INSPECTOR PROPERTIES  ------------------- */

class AngularDimension2D_inspector extends BaseObjectInspector_cmp
{
    constructor() {
        super();
    }
}

customElements.define("angular-dimension-inspector", AngularDimension2D_inspector );

