<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Jpeg2000.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing an JPEG2000 image
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Jpeg2000 extends SetaPDF_Core_Image
{
    /**
     * Whether opacity is availbel or not.
     *
     * @var bool
     */
    protected $_opacityAvailable = false;

    /**
     * Process the image data.
     *
     * @see SetaPDF_Core_Image::_process()
     * @throws SetaPDF_Core_Image_Exception
     * @throws SetaPDF_Exception_NotImplemented
     */
    protected function _process()
    {
        // Check the Signature box
        $this->_binaryReader->reset(0, 12);
        $signature = $this->_binaryReader->readBytes(12);
        if ($signature !== "\x00\x00\x00\x0C\x6A\x50\x20\x20\x0D\x0A\x87\x0A") {
            throw new SetaPDF_Core_Image_Exception('Invalid JPEG 2000 Signature box.');
        }
        
        $boxLength = 0;
        $boxType = '';
        
        $this->_readBoxHeader($boxLength, $boxType);
        if ($boxType !== 'ftyp') {
            throw new SetaPDF_Core_Image_Exception('File Type box expected.');
        }
        
        // Let's get the JP2 Header box
        $found = false;
        while ($boxLength > 0 && !$found) {
            $this->_binaryReader->skip($boxLength - 8);
            $this->_readBoxHeader($boxLength, $boxType);
            
            if ($boxType === 'jp2h') {
                $found = true;
            }
        }
        
        if (false === $found) {
            throw new SetaPDF_Core_Image_Exception('JP2 Header box expected.');
        }
        
        // Read the Image Header box
        $this->_readBoxHeader($boxLength, $boxType);
        if ($boxType !== 'ihdr') {
            throw new SetaPDF_Core_Image_Exception('Image Header box expected.');
        }
        
        $this->_height = $this->_binaryReader->readUInt32();
        $this->_width = $this->_binaryReader->readUInt32();

        $numberOfComponents = $this->_binaryReader->readUInt16();

        $this->_bitsPerComponent = $this->_binaryReader->readUInt8() - 1;
        //skip the rest of the ihdr box
        $this->_binaryReader->skip($boxLength-8-11);
        
        $found = false;
        while (false !== $this->_binaryReader->getReader()->ensureContent()) {
            
            $this->_readBoxHeader($boxLength, $boxType);
            if ($boxType === 'cdef') {
                $found = true;
                break;
            }
        
            if (!$boxLength)
                break;
            
            $this->_binaryReader->skip($boxLength - 8);
        }
        $colorspace = 0;
        if ($found === true) {
            for (; $numberOfComponents > 0; $numberOfComponents--) {
                $this->_binaryReader->skip(4); // N & Cn
                $type = $this->_binaryReader->readUInt16();
                if ($type == 0) {
                    $colorspace++;
                }
            }
        }
        $this->_colorSpace = $colorspace;
    }

    /**
     * Reads the header information for the following box.
     *
     * @param mixed $boxLength The BoxLength will be written in this variable.
     * @param mixed $boxType The BoxType will be written in this variable.
     * @throws SetaPDF_Exception_NotImplemented
     */
    protected function _readBoxHeader(&$boxLength, &$boxType)
    {
        $boxLength = $this->_binaryReader->readUInt32();
        $boxType = $this->_binaryReader->readBytes(4);
        
        // XLBox should be used
        if ($boxLength == 1) {
            // XLBox is a 64bit integer
            throw new SetaPDF_Exception_NotImplemented('Handling of 64bit integers for JPEG 2000 parsing is not implemented yet.');
        }
    }
    
    /**
     * Converts the JPEG 2000 image to an external object.
     *
     * @see SetaPDF_Core_Image::toXObject()
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_XObject_Image
     */
    public function toXObject(SetaPDF_Core_Document $document)
    {
        $colorSpace = 'DeviceRGB';

        switch ($this->getColorSpace()) {
            case 1:
                $colorSpace = 'DeviceGray';
                break;
            case 3:
                $colorSpace = 'DeviceRGB';
                break;
            case 4:
                $colorSpace = 'DeviceCMYK';
                break;
        }

        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('Type', new SetaPDF_Core_Type_Name('XObject', true));
        $dictionary->offsetSet('Subtype', new SetaPDF_Core_Type_Name('Image', true));
        $dictionary->offsetSet('Width', new SetaPDF_Core_Type_Numeric($this->getWidth()));
        $dictionary->offsetSet('Height', new SetaPDF_Core_Type_Numeric($this->getHeight()));
        $dictionary->offsetSet('BitsPerComponent', new SetaPDF_Core_Type_Numeric($this->getBitsPerComponent()));
        $dictionary->offsetSet('ColorSpace', new SetaPDF_Core_Type_Name($colorSpace));

        if ($this->_opacityAvailable)
            $dictionary->offsetSet('SMaskInData', new SetaPDF_Core_Type_Numeric(1));
        
        // Length -> will be set automatically
        $dictionary->offsetSet('Filter', new SetaPDF_Core_Type_Name('JPXDecode', true));
        
        $streamContent = new SetaPDF_Core_Writer();
        $this->_binaryReader->getReader()->copyTo($streamContent);
        $stream = new SetaPDF_Core_Type_Stream($dictionary, $streamContent->__toString());
        unset($streamContent);
        
        $object = $document->createNewObject($stream);
        
        return new SetaPDF_Core_XObject_Image($object);
    }
}