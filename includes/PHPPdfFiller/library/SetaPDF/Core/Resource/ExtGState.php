<?php 
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ExtGState.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Resource class for handling external graphic states
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Resource_ExtGState implements SetaPDF_Core_Resource
{
    /**
     * The graphics state parameter dictionary
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_dictionary;
    
    /**
     * The indirect object for this graphic state
     *
     * @var SetaPDF_Core_Type_IndirectObjectInterface
     */
    protected $_indirectObject;
    
    /**
     * Creates a graphics state parameter dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    static public function createExtGStateDictionary()
    {
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('Type', new SetaPDF_Core_Type_Name('ExtGState', true));
        
        return $dictionary;
    }
    
    /**
     * The constructor.
     *
     * @see createExtGStateDictionary()
     * @throws InvalidArgumentException
     * @param SetaPDF_Core_Type_IndirectObjectInterface|SetaPDF_Core_Type_Dictionary|string $extGStateDictionary
     */
    public function __construct($extGStateDictionary = null)
    {
        if (is_null($extGStateDictionary)) {
            $extGStateDictionary = call_user_func(
                array('SetaPDF_Core_Resource_ExtGState', 'createExtGStateDictionary')
            );
        }
    
        if ($extGStateDictionary instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            $this->_indirectObject = $extGStateDictionary;
            $extGStateDictionary = $extGStateDictionary->ensure();
        }

        if (!$extGStateDictionary instanceof SetaPDF_Core_Type_Dictionary) {
            throw new InvalidArgumentException(
                'Parameter has to be type of SetaPDF_Core_Type_Dictionary'
            );
        }

        $this->_dictionary = $extGStateDictionary;
    }
    
    /**
     * Set the line width.
     *
     * @see PDF 32000-1:2008 - 8.4.3.2, "Line Width"
     * @param float $lineWidth
     */
    public function setLineWidth($lineWidth)
    {
        $this->_setNumeric('LW', $lineWidth);
    }
    
    /**
     * Set the line cap style.
     *
     * @see PDF 32000-1:2008 - 8.4.3.3, "Line Cap Style"
     * @param int|float $lineCapStyle
     */
    public function setLineCapStyle($lineCapStyle)
    {
        $this->_setNumeric('LC', $lineCapStyle);
    }
    
    /**
     * Set the line join style.
     *
     * @see PDF 32000-1:2008 - 8.4.3.4, "Line Join Style"
     * @param int|float $lineJoinStyle
     */
    public function setLineJoinStyle($lineJoinStyle)
    {
        $this->_setNumeric('LJ', $lineJoinStyle);
    }
    
    /**
     * Set the miter limit.
     *
     * @see PDF 32000-1:2008 - 8.4.3.5, "Miter Limit"
     * @param int|float $miterLimit
     */
    public function setMiterLimit($miterLimit)
    {
        $this->_setNumeric('ML', $miterLimit);
    }
    
    /**
     * Set the name of the rendering intent.
     *
     * @see PDF 32000-1:2008 - 8.6.5.8, "Rendering Intents"
     * @param string $renderingIntent
     */
    public function setRenderingIntent($renderingIntent)
    {
        $this->_setName('RI', $renderingIntent);
    }
    
    /**
     * Set the flag specifying whether to apply overprint.
     *
     * @see PDF 32000-1:2008 - 8.6.7, "Overprint Control"
     * @param boolean $overprintControl
     */
    public function setOverprintControl($overprintControl)
    {
        $this->_setBoolean('OP', $overprintControl);
    }
    
    /**
     * Set the flag specifying whether to apply overprint for non-stroking operations.
     *
     * @see PDF 32000-1:2008 - 8.6.7, "Overprint Control"
     * @param boolean $overprintControl
     */
    public function setOverprintControlNonStroking($overprintControl)
    {
        $this->_setBoolean('op', $overprintControl);
    }
    
    /**
     * Set the overprint mode.
     *
     * @see PDF 32000-1:2008 - 8.6.7, "Overprint Control"
     * @param integer $overprintMode
     */
    public function setOverprintMode($overprintMode)
    {
        $this->_setNumeric('OPM', $overprintMode);
    }
    
    /**
     * Set the font configuration.
     * 
     * @param array $font
     * @throws SetaPDF_Exception_NotImplemented
     * @todo Implement
     * @internal
     */
    public function setFont($font)
    {
        throw new SetaPDF_Exception_NotImplemented('Not implemented yet.');
    }
    
    /**
     * TODO Implement BG, BG2, UCR, UCR2, TR, TR2, HT, FL, SM, SA, SMask, AIS, TK
     */
    
    /**
     * Set the blend mode to be used in transparent image model.
     *
     * @see PDF 32000-1:2008 - 11.3.5, "Blend Mode" and 11.6.3, "Specifying Blending Colour Space and Blend Mode"
     * @param null|string|SetaPDF_Core_Type_Name $blendMode
     * TODO Implement handling of an array parameter
     */
    public function setBlendMode($blendMode)
    {
        $this->_setName('BM', $blendMode);
    }
    
    /**
     * Set the current stroking alpha constant.
     * 
     * @param float $opacity
     */
    public function setConstantOpacity($opacity)
    {
        $this->_setNumeric('CA', $opacity);
    }
    
    /**
     * Set the current non-stroking alpha constant.
     *
     * @param float $opacity
     */
    public function setConstantOpacityNonStroking($opacity)
    {
        $this->_setNumeric('ca', $opacity);
    }
    
    /**
     * Get the graphics state parameter dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary()
    {
        return $this->_dictionary;
    }
    
	/**
     * Gets an indirect object for this graphics state parameter dictionary.
     *
     * @see SetaPDF_Core_Resource::getIndirectObject()
     * @param SetaPDF_Core_Document|null $document
     * @return SetaPDF_Core_Type_IndirectObjectInterface
     * @throws InvalidArgumentException
     */
    public function getIndirectObject(SetaPDF_Core_Document $document = null)
    {
        if (null === $this->_indirectObject) {
            if (null === $document) {
                throw new InvalidArgumentException('To initialize a new object $document parameter is not optional!');
            }
            
            $this->_indirectObject = $document->createNewObject($this->getDictionary());
        }
        
        return $this->_indirectObject;
    }

	/**
	 * Returns the resource type for the graphic state.
	 * 
	 * @return string
     * @see SetaPDF_Core_Resource::getResourceType()
     */
    public function getResourceType()
    {
        return SetaPDF_Core_Resource::TYPE_EXT_G_STATE;
    }

    /**
     * Sets the numeric $value on the offset $name.
     *
     * @param null|string|SetaPDF_Core_Type_Name $name
     * @param int|float $value
     */
    protected function _setNumeric($name, $value)
    {

        $this->_dictionary->offsetSet($name, new SetaPDF_Core_Type_Numeric($value));
    }

    /**
     * Sets the name $value on the offset $name.
     *
     * @param null|string|SetaPDF_Core_Type_Name $name
     * @param string $value
     */
    protected function _setName($name, $value)
    {
        $this->_dictionary->offsetSet($name, new SetaPDF_Core_Type_Name($value));
    }

    /**
     * Sets the boolean $value on the offset $name.
     *
     * @param null|string|SetaPDF_Core_Type_Name $name
     * @param string $value
     */
    protected function _setBoolean($name, $value)
    {
        $this->_dictionary->offsetSet($name, new SetaPDF_Core_Type_Boolean($value));
    }
}