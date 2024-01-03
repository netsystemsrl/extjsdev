<?php
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: CourierBold.php 1145 2017-12-19 16:37:17Z jan.slabon $
 */

/**
 * Class representing the PDF standard font Courier-Bold 
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_Standard_CourierBold extends SetaPDF_Core_Font_Standard
{
    /**
     * Gets a default dictionary for this font.
     *
     * @param string $encoding
     * @return SetaPDF_Core_Type_Dictionary
     */
    static public function getDefaultDictionary($encoding = 'WinAnsi')
    {
        $encoding = str_replace('Encoding', '', $encoding);
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary['Type'] = new SetaPDF_Core_Type_Name('Font', true);
        $dictionary['Subtype'] = new SetaPDF_Core_Type_Name('Type1', true);
        $dictionary['BaseFont'] = new SetaPDF_Core_Type_Name('Courier-Bold', true);
        $dictionary['Encoding'] = new SetaPDF_Core_Type_Name($encoding . 'Encoding');

        return $dictionary;
    }
    
    /**
     * Creates a font object of this font.
     * 
     * @param SetaPDF_Core_Document $document
     * @param string $baseEncoding
     * @param array $diffEncoding
     * @return SetaPDF_Core_Font_Standard_CourierBold
     */
    static public function create(
        SetaPDF_Core_Document $document,
        $baseEncoding = SetaPDF_Core_Encoding::WIN_ANSI,
        $diffEncoding = array()
    )
    {
        $dictionary = self::getDefaultDictionary($baseEncoding);
        parent::_createDifferenceArray($dictionary, $baseEncoding, $diffEncoding);
        $fontObject = $document->createNewObject($dictionary);
        
        return new self($fontObject);  
    }

    /**
     * Constructor.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface|SetaPDF_Core_Type_Dictionary $indirectObjectOrDictionary
     */
    public function __construct($indirectObjectOrDictionary)
    {
        parent::__construct($indirectObjectOrDictionary);
        
        $this->_fontName = 'Courier-Bold';
        $this->_fontFamily = 'Courier';
        
        $this->_info = array(
            SetaPDF_Core_Font::INFO_COPYRIGHT => '(c) 1989, 1990, 1991, 1993, 1997 Adobe Systems Incorporated.  All Rights Reserved.',
            SetaPDF_Core_Font::INFO_CREATION_DATE => 'Date: Mon Jun 23 16:28:00 1997',
            SetaPDF_Core_Font::INFO_UNIQUE_ID => '43048',
            SetaPDF_Core_Font::INFO_VERSION => '003.000'            
        );
        
        $this->_isBold = true;
        $this->_isItalic = false;
        $this->_isMonospace = true;
        
        $this->_fontBBox = array(-113, -250, 749, 801);
        
        $this->_italicAngle = 0;
        
        $this->_ascent = 629;        
        $this->_descent = -157;        
        
        $this->_capHeight = 562;
        $this->_xHeight = 439;
        
        $this->_widths = array(
            "\x00\x20" => 600,  "\x00\x21" => 600,  "\x00\x22" => 600,  "\x00\x23" => 600,  
            "\x00\x24" => 600,  "\x00\x25" => 600,  "\x00\x26" => 600,  "\x20\x19" => 600,  
            "\x00\x28" => 600,  "\x00\x29" => 600,  "\x00\x2a" => 600,  "\x00\x2b" => 600,  
            "\x00\x2c" => 600,  "\x00\x2d" => 600,  "\x00\x2e" => 600,  "\x00\x2f" => 600,  
            "\x00\x30" => 600,  "\x00\x31" => 600,  "\x00\x32" => 600,  "\x00\x33" => 600,  
            "\x00\x34" => 600,  "\x00\x35" => 600,  "\x00\x36" => 600,  "\x00\x37" => 600,  
            "\x00\x38" => 600,  "\x00\x39" => 600,  "\x00\x3a" => 600,  "\x00\x3b" => 600,  
            "\x00\x3c" => 600,  "\x00\x3d" => 600,  "\x00\x3e" => 600,  "\x00\x3f" => 600,  
            "\x00\x40" => 600,  "\x00\x41" => 600,  "\x00\x42" => 600,  "\x00\x43" => 600,  
            "\x00\x44" => 600,  "\x00\x45" => 600,  "\x00\x46" => 600,  "\x00\x47" => 600,  
            "\x00\x48" => 600,  "\x00\x49" => 600,  "\x00\x4a" => 600,  "\x00\x4b" => 600,  
            "\x00\x4c" => 600,  "\x00\x4d" => 600,  "\x00\x4e" => 600,  "\x00\x4f" => 600,  
            "\x00\x50" => 600,  "\x00\x51" => 600,  "\x00\x52" => 600,  "\x00\x53" => 600,  
            "\x00\x54" => 600,  "\x00\x55" => 600,  "\x00\x56" => 600,  "\x00\x57" => 600,  
            "\x00\x58" => 600,  "\x00\x59" => 600,  "\x00\x5a" => 600,  "\x00\x5b" => 600,  
            "\x00\x5c" => 600,  "\x00\x5d" => 600,  "\x00\x5e" => 600,  "\x00\x5f" => 600,  
            "\x20\x18" => 600,  "\x00\x61" => 600,  "\x00\x62" => 600,  "\x00\x63" => 600,  
            "\x00\x64" => 600,  "\x00\x65" => 600,  "\x00\x66" => 600,  "\x00\x67" => 600,  
            "\x00\x68" => 600,  "\x00\x69" => 600,  "\x00\x6a" => 600,  "\x00\x6b" => 600,  
            "\x00\x6c" => 600,  "\x00\x6d" => 600,  "\x00\x6e" => 600,  "\x00\x6f" => 600,  
            "\x00\x70" => 600,  "\x00\x71" => 600,  "\x00\x72" => 600,  "\x00\x73" => 600,  
            "\x00\x74" => 600,  "\x00\x75" => 600,  "\x00\x76" => 600,  "\x00\x77" => 600,  
            "\x00\x78" => 600,  "\x00\x79" => 600,  "\x00\x7a" => 600,  "\x00\x7b" => 600,  
            "\x00\x7c" => 600,  "\x00\x7d" => 600,  "\x00\x7e" => 600,  "\x00\xa1" => 600,  
            "\x00\xa2" => 600,  "\x00\xa3" => 600,  "\x20\x44" => 600,  "\x00\xa5" => 600,  
            "\x01\x92" => 600,  "\x00\xa7" => 600,  "\x00\xa4" => 600,  "\x00\x27" => 600,  
            "\x20\x1c" => 600,  "\x00\xab" => 600,  "\x20\x39" => 600,  "\x20\x3a" => 600,  
            "\xfb\x01" => 600,  "\xfb\x02" => 600,  "\x20\x13" => 600,  "\x20\x20" => 600,  
            "\x20\x21" => 600,  "\x00\xb7" => 600,  "\x00\xb6" => 600,  "\x20\x22" => 600,  
            "\x20\x1a" => 600,  "\x20\x1e" => 600,  "\x20\x1d" => 600,  "\x00\xbb" => 600,  
            "\x20\x26" => 600,  "\x20\x30" => 600,  "\x00\xbf" => 600,  "\x00\x60" => 600,  
            "\x00\xb4" => 600,  "\x02\xc6" => 600,  "\x02\xdc" => 600,  "\x00\xaf" => 600,  
            "\x02\xd8" => 600,  "\x02\xd9" => 600,  "\x00\xa8" => 600,  "\x02\xda" => 600,  
            "\x00\xb8" => 600,  "\x02\xdd" => 600,  "\x02\xdb" => 600,  "\x02\xc7" => 600,  
            "\x20\x14" => 600,  "\x00\xc6" => 600,  "\x00\xaa" => 600,  "\x01\x41" => 600,  
            "\x00\xd8" => 600,  "\x01\x52" => 600,  "\x00\xba" => 600,  "\x00\xe6" => 600,  
            "\x01\x31" => 600,  "\x01\x42" => 600,  "\x00\xf8" => 600,  "\x01\x53" => 600,  
            "\x00\xdf" => 600,  "\x00\xcf" => 600,  "\x00\xe9" => 600,  "\x01\x03" => 600,  
            "\x01\x71" => 600,  "\x01\x1b" => 600,  "\x01\x78" => 600,  "\x00\xf7" => 600,  
            "\x00\xdd" => 600,  "\x00\xc2" => 600,  "\x00\xe1" => 600,  "\x00\xdb" => 600,  
            "\x00\xfd" => 600,  "\x02\x19" => 600,  "\x00\xea" => 600,  "\x01\x6e" => 600,  
            "\x00\xdc" => 600,  "\x01\x05" => 600,  "\x00\xda" => 600,  "\x01\x73" => 600,  
            "\x00\xcb" => 600,  "\x01\x10" => 600,  "\xf6\xc3" => 600,  "\x00\xa9" => 600,  
            "\x01\x12" => 600,  "\x01\x0d" => 600,  "\x00\xe5" => 600,  "\x01\x45" => 600,  
            "\x01\x3a" => 600,  "\x00\xe0" => 600,  "\x01\x62" => 600,  "\x01\x06" => 600,  
            "\x00\xe3" => 600,  "\x01\x16" => 600,  "\x01\x61" => 600,  "\x01\x5f" => 600,  
            "\x00\xed" => 600,  "\x25\xca" => 600,  "\x01\x58" => 600,  "\x01\x22" => 600,  
            "\x00\xfb" => 600,  "\x00\xe2" => 600,  "\x01\x00" => 600,  "\x01\x59" => 600,  
            "\x00\xe7" => 600,  "\x01\x7b" => 600,  "\x00\xde" => 600,  "\x01\x4c" => 600,  
            "\x01\x54" => 600,  "\x01\x5a" => 600,  "\x01\x0f" => 600,  "\x01\x6a" => 600,  
            "\x01\x6f" => 600,  "\x00\xb3" => 600,  "\x00\xd2" => 600,  "\x00\xc0" => 600,  
            "\x01\x02" => 600,  "\x00\xd7" => 600,  "\x00\xfa" => 600,  "\x01\x64" => 600,  
            "\x22\x02" => 600,  "\x00\xff" => 600,  "\x01\x43" => 600,  "\x00\xee" => 600,  
            "\x00\xca" => 600,  "\x00\xe4" => 600,  "\x00\xeb" => 600,  "\x01\x07" => 600,  
            "\x01\x44" => 600,  "\x01\x6b" => 600,  "\x01\x47" => 600,  "\x00\xcd" => 600,  
            "\x00\xb1" => 600,  "\x00\xa6" => 600,  "\x00\xae" => 600,  "\x01\x1e" => 600,  
            "\x01\x30" => 600,  "\x22\x11" => 600,  "\x00\xc8" => 600,  "\x01\x55" => 600,  
            "\x01\x4d" => 600,  "\x01\x79" => 600,  "\x01\x7d" => 600,  "\x22\x65" => 600,  
            "\x00\xd0" => 600,  "\x00\xc7" => 600,  "\x01\x3c" => 600,  "\x01\x65" => 600,  
            "\x01\x19" => 600,  "\x01\x72" => 600,  "\x00\xc1" => 600,  "\x00\xc4" => 600,  
            "\x00\xe8" => 600,  "\x01\x7a" => 600,  "\x01\x2f" => 600,  "\x00\xd3" => 600,  
            "\x00\xf3" => 600,  "\x01\x01" => 600,  "\x01\x5b" => 600,  "\x00\xef" => 600,  
            "\x00\xd4" => 600,  "\x00\xd9" => 600,  "\x22\x06" => 600,  "\x00\xfe" => 600,  
            "\x00\xb2" => 600,  "\x00\xd6" => 600,  "\x00\xb5" => 600,  "\x00\xec" => 600,  
            "\x01\x51" => 600,  "\x01\x18" => 600,  "\x01\x11" => 600,  "\x00\xbe" => 600,  
            "\x01\x5e" => 600,  "\x01\x3e" => 600,  "\x01\x36" => 600,  "\x01\x39" => 600,  
            "\x21\x22" => 600,  "\x01\x17" => 600,  "\x00\xcc" => 600,  "\x01\x2a" => 600,  
            "\x01\x3d" => 600,  "\x00\xbd" => 600,  "\x22\x64" => 600,  "\x00\xf4" => 600,  
            "\x00\xf1" => 600,  "\x01\x70" => 600,  "\x00\xc9" => 600,  "\x01\x13" => 600,  
            "\x01\x1f" => 600,  "\x00\xbc" => 600,  "\x01\x60" => 600,  "\x02\x18" => 600,  
            "\x01\x50" => 600,  "\x00\xb0" => 600,  "\x00\xf2" => 600,  "\x01\x0c" => 600,  
            "\x00\xf9" => 600,  "\x22\x1a" => 600,  "\x01\x0e" => 600,  "\x01\x57" => 600,  
            "\x00\xd1" => 600,  "\x00\xf5" => 600,  "\x01\x56" => 600,  "\x01\x3b" => 600,  
            "\x00\xc3" => 600,  "\x01\x04" => 600,  "\x00\xc5" => 600,  "\x00\xd5" => 600,  
            "\x01\x7c" => 600,  "\x01\x1a" => 600,  "\x01\x2e" => 600,  "\x01\x37" => 600,  
            "\x22\x12" => 600,  "\x00\xce" => 600,  "\x01\x48" => 600,  "\x01\x63" => 600,  
            "\x00\xac" => 600,  "\x00\xf6" => 600,  "\x00\xfc" => 600,  "\x22\x60" => 600,  
            "\x01\x23" => 600,  "\x00\xf0" => 600,  "\x01\x7e" => 600,  "\x01\x46" => 600,  
            "\x00\xb9" => 600,  "\x01\x2b" => 600,  "\x20\xac" => 600,          
        );
               
    }
}
