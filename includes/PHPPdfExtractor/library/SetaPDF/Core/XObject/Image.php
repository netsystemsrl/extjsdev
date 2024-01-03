<?php 
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Image.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing an Image XObject
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_XObject_Image extends SetaPDF_Core_XObject
{
    /**
     * Create an image xobject by a reader object.
     * 
     * @param SetaPDF_Core_Document $document
     * @param SetaPDF_Core_Reader_ReaderInterface $reader
     * @return SetaPDF_Core_XObject_Image
     */
    static public function create(
        SetaPDF_Core_Document $document,
        SetaPDF_Core_Reader_ReaderInterface $reader
    )
    {
        $image = SetaPDF_Core_Image::get($reader);
        return $image->toXObject($document);
    }
    
    /**
     * Get the height of the image.
     * 
     * @param float $width To get the height in relation to a width value keeping the aspect ratio
     * @return float
     */
    public function getHeight($width = null)
    {
        $dict = $this->_indirectObject->ensure()->getValue();
        
        $height = $dict->getValue('Height')->getValue();
        if (null === $width)
            return $height;
        
        return $width * $height / $this->getWidth();
    }
    
    /**
     * Get the width of the image.
     * 
     * @param float $height To get the width in relation to a height value keeping the aspect ratio
     * @return float
     */
    public function getWidth($height = null)
    {
        $dict = $this->_indirectObject->ensure()->getValue();

        $width = $dict->getValue('Width')->getValue();
        if (null === $height)
            return $width;
        
        return $height * $width / $this->getHeight();
    }

    /**
     * Get the color space of this image.
     *
     * @param bool $pdfValue
     * @return SetaPDF_Core_ColorSpace|SetaPDF_Core_ColorSpace_DeviceCmyk|SetaPDF_Core_ColorSpace_DeviceGray|SetaPDF_Core_ColorSpace_DeviceRgb|SetaPDF_Core_ColorSpace_IccBased|SetaPDF_Core_ColorSpace_Separation|string
     * @throws SetaPDF_Exception_NotImplemented
     */
    public function getColorSpace($pdfValue = false)
    {
        $dict = $this->_indirectObject->ensure()->getValue();

        $colorSpace = $dict->getValue('ColorSpace');
        if ($colorSpace) {
            if ($pdfValue)
                return $colorSpace->ensure();

            return SetaPDF_Core_ColorSpace::createByDefinition($colorSpace);
        }

        throw new SetaPDF_Exception_NotImplemented('Resolving of color space from JPEG2000 data is not implemented.');
    }

    /**
     * Get the number of bits used to represen each colour component.
     *
     * @return bool|int
     */
    public function getBitsPerComponent()
    {
        $dict = $this->_indirectObject->ensure()->getValue();

        $bitsPerComponent = $dict->getValue('BitsPerComponent');
        if ($bitsPerComponent) {
            return (int)$bitsPerComponent->ensure()->getValue();
        }

        return false;
    }

    /**
     * Draw the external object on the canvas.
     *
     * @param SetaPDF_Core_Canvas $canvas
     * @param float $x
     * @param float $y
     * @param float $width
     * @param float $height
     * @return void
     */
    public function draw(SetaPDF_Core_Canvas $canvas, $x = 0., $y = 0., $width = null, $height = null)
    {
    	$canvas->saveGraphicState();
    	if ($width === null)
    		$width = $this->getWidth($height);
    	if ($height === null)
    		$height = $this->getHeight($width);
    
    	$canvas->addCurrentTransformationMatrix($width, 0, 0, $height, $x, $y);
    	$canvas->drawXObject($this);
    	$canvas->restoreGraphicState();
    }
}