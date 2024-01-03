<?php 
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Form.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a Form XObject
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_XObject_Form extends SetaPDF_Core_XObject implements
    SetaPDF_Core_Canvas_ContainerInterface
{
    /**
     * The BBox rectangle
     */
    protected $_bbox;
    
    /**
     * The canvas object for this form XObject
     *  
     * @var SetaPDF_Core_Canvas
     */
    protected $_canvas;
    
    /**
     * Create an Form XObject.
     * 
     * @param SetaPDF_Core_Document $document
     * @param SetaPDF_Core_DataStructure_Rectangle|array $bbox
     * @return SetaPDF_Core_XObject_Form
     */
    static public function create(
		SetaPDF_Core_Document $document,
        $bbox
    )
    {
    	if (!$bbox instanceof SetaPDF_Core_DataStructure_Rectangle) {
    	    $bbox = SetaPDF_Core_DataStructure_Rectangle::byArray($bbox);
    	}
    	
    	$dict = new SetaPDF_Core_Type_Dictionary();
    	$dict->offsetSet('BBox', $bbox->getValue());
    	$dict->offsetSet('Filter', new SetaPDF_Core_Type_Name('FlateDecode', true));
    	
    	$stream = new SetaPDF_Core_Type_Stream($dict);
    	$object = $document->createNewObject($stream);
    	
    	$xObject = new self($object);
        $xObject->ensureDefaultKeys();
    	$xObject->_bbox = $bbox;
    	
    	return $xObject;
    }

    /**
     * Ensures the default keys.
     */
    public function ensureDefaultKeys()
    {
        $dict = $this->getObject()->ensure(true)->getValue();
        $dict->offsetSet('Type', new SetaPDF_Core_Type_Name('XObject', true));
        $dict->offsetSet('Subtype', new SetaPDF_Core_Type_Name('Form', true));
        $dict->offsetSet('FormType', new SetaPDF_Core_Type_Numeric(1));
    }

    /**
     * Get the canvas for this form XObject.
     * 
     * @return SetaPDF_Core_Canvas
     */
    public function getCanvas()
    {
        if (null === $this->_canvas) {
            $this->_canvas = new SetaPDF_Core_Canvas($this);
        }
        
        return $this->_canvas;
    }
    
    /**
     * Get the indirect object of this XObject.
     * 
     * @return SetaPDF_Core_Type_IndirectObject
     */
    public function getObject()
    {
        return $this->_indirectObject;
    }
    
    /**
     * Get the stream proxy.
     * 
     * @return SetaPDF_Core_Canvas_StreamProxyInterface
     */
    public function getStreamProxy()
    {
        return $this->_indirectObject->ensure(true);
    }
    
    /**
     * Get the BBox value or rectangle.
     * 
     * @param boolean $asRect
     * @return SetaPDF_Core_DataStructure_Rectangle|SetaPDF_Core_Type_Array
     */
    public function getBBox($asRect = true)
    {
        if (null === $this->_bbox) {
            $dict = $this->getObject()->ensure()->getValue();
            if ($asRect === false)
                return $dict->getValue('BBox');
            
            $this->_bbox = new SetaPDF_Core_DataStructure_Rectangle($dict->getValue('BBox'));
        }
        
        if ($asRect !== false)
            return $this->_bbox;
        
        return $this->_bbox->getValue();
    }

    /**
     * Get the bounding box after applying the transformation matrix.
     *
     * @return SetaPDF_Core_Geometry_Rectangle
     */
    protected function _getBBox()
    {
        $rect = $this->getBBox();
        $m = $this->getMatrix();
        if ($m instanceof SetaPDF_Core_Geometry_Matrix) {
            $gs = new SetaPDF_Core_Canvas_GraphicState($m);

            $ll = $gs->toUserSpace(SetaPDF_Core_Geometry_Vector::byPoint($rect->getRectangle()->getLl()));
            $ur = $gs->toUserSpace(SetaPDF_Core_Geometry_Vector::byPoint($rect->getRectangle()->getUr()));

            $rect = new SetaPDF_Core_Geometry_Rectangle(
                min($ll->getX(), $ur->getX()),
                min($ll->getY(), $ur->getY()),
                max($ll->getX(), $ur->getX()),
                max($ll->getY(), $ur->getY())
            );
        }

        return $rect;
    }

    /**
     * Get the height of the XObject.
     * 
     * @see SetaPDF_Core_Canvas_ContainerInterface::getHeight()
     * @param float $width To get the height in relation to a width value keeping the aspect ratio
     * @return float
     */
    public function getHeight($width = null)
    {
        $rect = $this->_getBBox();
         
        $height = $rect->getHeight();
        if (null === $width)
            return $height;
        
        return $width * $height / $this->getWidth();
    }
    
    /**
     * Get the width of the XObject.
     * 
     * @see SetaPDF_Core_Canvas_ContainerInterface::getWidth()
     * @param float $height To get the width in relation to a height value keeping the aspect ratio
     * @return float
     */
    public function getWidth($height = null)
    {
        $rect = $this->_getBBox();
        
        $width = $rect->getWidth();
        if (null === $height)
            return $width;
        
        return $height * $width / $this->getHeight();
    }

    /**
     * Get the form matrix.
     *
     * @param boolean $asArray Defines whether the matrix be returned as an array or as a matrix instance.
     * @return boolean|SetaPDF_Core_Geometry_Matrix|array
     */
    public function getMatrix($asArray = false)
    {
        /**
         * @var $dict SetaPDF_Core_Type_Dictionary
         */
        $dict = $this->_indirectObject->ensure(true)->getValue();
        if (!$dict->offsetExists('Matrix')) {
            return false;
        }

        $matrix = $dict->offsetGet('Matrix')->ensure();

        if ($asArray) {
            return $matrix->toPhp();
        }

        return new SetaPDF_Core_Geometry_Matrix($matrix->toPhp());
    }

    /**
     * Set the form matrix.
     *
     * @param int[]|SetaPDF_Core_Geometry_Matrix $matrix An array of six numbers or a matrix instance.
     */
    public function setMatrix($matrix)
    {
        /**
         * @var $dict SetaPDF_Core_Type_Dictionary
         */
        $dict = $this->_indirectObject->ensure(true)->getValue();

        if (!$matrix) {
            $dict->offsetUnset('Matrix');
            return;
        }

        if (!($matrix instanceof SetaPDF_Core_Geometry_Matrix)) {
            $matrix = new SetaPDF_Core_Geometry_Matrix($matrix);
        }

        $dict['Matrix'] = new SetaPDF_Core_Type_Array(array(
            new SetaPDF_Core_Type_Numeric($matrix->getA()),
            new SetaPDF_Core_Type_Numeric($matrix->getB()),
            new SetaPDF_Core_Type_Numeric($matrix->getC()),
            new SetaPDF_Core_Type_Numeric($matrix->getD()),
            new SetaPDF_Core_Type_Numeric($matrix->getE()),
            new SetaPDF_Core_Type_Numeric($matrix->getF()),
        ));
    }

    /**
     * Get a group attributes object.
     * 
     * @return null|SetaPDF_Core_TransparencyGroup
     */
    public function getGroup()
    {
        /**
         * @var $dict SetaPDF_Core_Type_Dictionary
         */
        $dict = $this->_indirectObject->ensure(true)->getValue();
        if (!$dict->offsetExists('Group')) {
            return null;
        }
        
        return new SetaPDF_Core_TransparencyGroup($dict->getValue('Group'));
    }
    
    /**
     * Set the group attributes object.
     * 
     * @param false|SetaPDF_Core_TransparencyGroup $group
     * @throws InvalidArgumentException
     */
    public function setGroup($group)
    {
        $dict = $this->_indirectObject->ensure(true)->getValue();
        if (false === $group) {
            $dict->offsetUnset('Group');
            return;
        }
        
        if (!$group instanceof SetaPDF_Core_TransparencyGroup) {
            throw new InvalidArgumentException('Group parameter has to be an instance of SetaPDF_Core_TransparencyGroup');
        }
        
        $dict['Group'] = $group->getDictionary();
    }
    
    /**
     * Draw the external object on the canvas.
     *
     * @param SetaPDF_Core_Canvas $canvas
     * @param float $x
     * @param float $y
     * @param float $width
     * @param float $height
     * @return mixed|void
     */
    public function draw(SetaPDF_Core_Canvas $canvas, $x = 0., $y = 0., $width = null, $height = null)
    {
        $origWidth = $this->getWidth();
        $origHeight = $this->getHeight();
        
    	$canvas->saveGraphicState();
    	if ($width === null)
    		$width = $this->getWidth($height);
    	if ($height === null)
    		$height = $this->getHeight($width);
    
    	$canvas->addCurrentTransformationMatrix($width / $origWidth, 0, 0, $height / $origHeight, $x, $y);
    	$canvas->drawXObject($this);
    	$canvas->restoreGraphicState();
    }
}