<?php
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Symbol.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing the PDF standard font Symbol 
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_Standard_Symbol extends SetaPDF_Core_Font_Standard
{
    /**
     * Gets a default dictionary for this font.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    static public function getDefaultDictionary()
    {
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary['Type'] = new SetaPDF_Core_Type_Name('Font', true);
        $dictionary['Subtype'] = new SetaPDF_Core_Type_Name('Type1', true);
        $dictionary['BaseFont'] = new SetaPDF_Core_Type_Name('Symbol', true);

        return $dictionary;
    }
    
    /**
     * Creates a font object of this font.
     * 
     * @param SetaPDF_Core_Document $document
     * @param string $baseEncoding
     * @param array $diffEncoding
     * @return SetaPDF_Core_Font_Standard_Symbol
     */
    static public function create(
        SetaPDF_Core_Document $document,
        $baseEncoding = null,
        $diffEncoding = array()
    )
    {
        $dictionary = self::getDefaultDictionary();
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
        
        $this->_fontName = 'Symbol';
        $this->_fontFamily = 'Symbol';
        
        $this->_info = array(
            SetaPDF_Core_Font::INFO_COPYRIGHT => '(c) 1985, 1987, 1989, 1990, 1997 Adobe Systems Incorporated. All rights reserved.',
            SetaPDF_Core_Font::INFO_CREATION_DATE => 'Date: Thu May  1 15:12:25 1997',
            SetaPDF_Core_Font::INFO_UNIQUE_ID => '43064',
            SetaPDF_Core_Font::INFO_VERSION => '001.008'            
        );
        
        $this->_isBold = false;
        $this->_isItalic = false;
        $this->_isMonospace = false;
        
        $this->_fontBBox = array(-180, -293, 1090, 1010);
        
        $this->_italicAngle = 0;

        $this->_underlinePosition = -100;
        $this->_underlineThickness = 50;

        $this->_widths = array(
            "\x00\x20" => 250,  "\x00\x21" => 333,  "\x22\x00" => 713,  "\x00\x23" => 500,  
            "\x22\x03" => 549,  "\x00\x25" => 833,  "\x00\x26" => 778,  "\x22\x0b" => 439,  
            "\x00\x28" => 333,  "\x00\x29" => 333,  "\x22\x17" => 500,  "\x00\x2b" => 549,  
            "\x00\x2c" => 250,  "\x22\x12" => 549,  "\x00\x2e" => 250,  "\x00\x2f" => 278,  
            "\x00\x30" => 500,  "\x00\x31" => 500,  "\x00\x32" => 500,  "\x00\x33" => 500,  
            "\x00\x34" => 500,  "\x00\x35" => 500,  "\x00\x36" => 500,  "\x00\x37" => 500,  
            "\x00\x38" => 500,  "\x00\x39" => 500,  "\x00\x3a" => 278,  "\x00\x3b" => 278,  
            "\x00\x3c" => 549,  "\x00\x3d" => 549,  "\x00\x3e" => 549,  "\x00\x3f" => 444,  
            "\x22\x45" => 549,  "\x03\x91" => 722,  "\x03\x92" => 667,  "\x03\xa7" => 722,  
            "\x22\x06" => 612,  "\x03\x95" => 611,  "\x03\xa6" => 763,  "\x03\x93" => 603,  
            "\x03\x97" => 722,  "\x03\x99" => 333,  "\x03\xd1" => 631,  "\x03\x9a" => 722,  
            "\x03\x9b" => 686,  "\x03\x9c" => 889,  "\x03\x9d" => 722,  "\x03\x9f" => 722,  
            "\x03\xa0" => 768,  "\x03\x98" => 741,  "\x03\xa1" => 556,  "\x03\xa3" => 592,  
            "\x03\xa4" => 611,  "\x03\xa5" => 690,  "\x03\xc2" => 439,  "\x21\x26" => 768,  
            "\x03\x9e" => 645,  "\x03\xa8" => 795,  "\x03\x96" => 611,  "\x00\x5b" => 333,  
            "\x22\x34" => 863,  "\x00\x5d" => 333,  "\x22\xa5" => 658,  "\x00\x5f" => 500,  
            "\xf8\xe5" => 500,  "\x03\xb1" => 631,  "\x03\xb2" => 549,  "\x03\xc7" => 549,  
            "\x03\xb4" => 494,  "\x03\xb5" => 439,  "\x03\xc6" => 521,  "\x03\xb3" => 411,  
            "\x03\xb7" => 603,  "\x03\xb9" => 329,  "\x03\xd5" => 603,  "\x03\xba" => 549,  
            "\x03\xbb" => 549,  "\x00\xb5" => 576,  "\x03\xbd" => 521,  "\x03\xbf" => 549,  
            "\x03\xc0" => 549,  "\x03\xb8" => 521,  "\x03\xc1" => 549,  "\x03\xc3" => 603,  
            "\x03\xc4" => 439,  "\x03\xc5" => 576,  "\x03\xd6" => 713,  "\x03\xc9" => 686,  
            "\x03\xbe" => 493,  "\x03\xc8" => 686,  "\x03\xb6" => 494,  "\x00\x7b" => 480,  
            "\x00\x7c" => 200,  "\x00\x7d" => 480,  "\x22\x3c" => 549,  "\x20\xac" => 750,  
            "\x03\xd2" => 620,  "\x20\x32" => 247,  "\x22\x64" => 549,  "\x20\x44" => 167,  
            "\x22\x1e" => 713,  "\x01\x92" => 500,  "\x26\x63" => 753,  "\x26\x66" => 753,  
            "\x26\x65" => 753,  "\x26\x60" => 753,  "\x21\x94" => 1042, "\x21\x90" => 987,  
            "\x21\x91" => 603,  "\x21\x92" => 987,  "\x21\x93" => 603,  "\x00\xb0" => 400,  
            "\x00\xb1" => 549,  "\x20\x33" => 411,  "\x22\x65" => 549,  "\x00\xd7" => 549,  
            "\x22\x1d" => 713,  "\x22\x02" => 494,  "\x20\x22" => 460,  "\x00\xf7" => 549,  
            "\x22\x60" => 549,  "\x22\x61" => 549,  "\x22\x48" => 549,  "\x20\x26" => 1000, 
            "\xf8\xe6" => 603,  "\xf8\xe7" => 1000, "\x21\xb5" => 658,  "\x21\x35" => 823,  
            "\x21\x11" => 686,  "\x21\x1c" => 795,  "\x21\x18" => 987,  "\x22\x97" => 768,  
            "\x22\x95" => 768,  "\x22\x05" => 823,  "\x22\x29" => 768,  "\x22\x2a" => 768,  
            "\x22\x83" => 713,  "\x22\x87" => 713,  "\x22\x84" => 713,  "\x22\x82" => 713,  
            "\x22\x86" => 713,  "\x22\x08" => 713,  "\x22\x09" => 713,  "\x22\x20" => 768,  
            "\x22\x07" => 713,  "\xf6\xda" => 790,  "\xf6\xd9" => 790,  "\xf6\xdb" => 890,  
            "\x22\x0f" => 823,  "\x22\x1a" => 549,  "\x22\xc5" => 250,  "\x00\xac" => 713,  
            "\x22\x27" => 603,  "\x22\x28" => 603,  "\x21\xd4" => 1042, "\x21\xd0" => 987,  
            "\x21\xd1" => 603,  "\x21\xd2" => 987,  "\x21\xd3" => 603,  "\x25\xca" => 494,  
            "\x23\x29" => 329,  "\xf8\xe8" => 790,  "\xf8\xe9" => 790,  "\xf8\xea" => 786,  
            "\x22\x11" => 713,  "\xf8\xeb" => 384,  "\xf8\xec" => 384,  "\xf8\xed" => 384,  
            "\xf8\xee" => 384,  "\xf8\xef" => 384,  "\xf8\xf0" => 384,  "\xf8\xf1" => 494,  
            "\xf8\xf2" => 494,  "\xf8\xf3" => 494,  "\xf8\xf4" => 494,  "\x23\x2a" => 329,  
            "\x22\x2b" => 274,  "\x23\x20" => 686,  "\xf8\xf5" => 686,  "\x23\x21" => 686,  
            "\xf8\xf6" => 384,  "\xf8\xf7" => 384,  "\xf8\xf8" => 384,  "\xf8\xf9" => 384,  
            "\xf8\xfa" => 384,  "\xf8\xfb" => 384,  "\xf8\xfc" => 494,  "\xf8\xfd" => 494,  
            "\xf8\xfe" => 494,  "\xf8\xff" => 790,          
        );
               
    }

    /**
     * Get the base encoding table.
     *
     * @return array
     */
    public function getBaseEncodingTable()
    {
        return SetaPDF_Core_Encoding_Symbol::$table;
    }

    /**
     * Converts a char code from the font specific encoding to another encoding.
     *
     * @param string $charCode The char code in the font specific encoding.
     * @param string $encoding The resulting encoding
     * @param bool $normalize Specifies if unknown mappings (e.g. to points in the private unicode area) should be
     *                        mapped to meaningful values.
     * @return string
     */
    public function getCharByCharCode($charCode, $encoding = 'UTF-8', $normalize = false)
    {
        $table = $this->_getEncodingTable();

        if ($normalize) {
            $_table = array();

            // remap "registersans" and "registerserif" to "registered"
            unset($table["\xf8\xe8"], $table["\xf6\xda"]);
            $_table["\x00\xAE"] = array("\xe2", "\xd2");

            // "copyrightsans" and "copyrightserif" to  "copyright"
            unset($table["\xf8\xe9"], $table["\xf6\xd9"]);
            $_table["\x00\xA9"] = array("\xe3", "\xd3");

            // "trademarksans" and "trademarkserif" to "trademark"
            unset($table["\xf8\xea"], $table["\xf6\xdb"]);
            $_table["\x21\x22"] = array("\xe4", "\xd4");

            $table = array_merge($_table, $table);
        }

        $char = SetaPDF_Core_Encoding::toUtf16Be($table, $charCode, false, true);
        if ($encoding !== 'UTF-16BE')
            $char = SetaPDF_Core_Encoding::convert($char, 'UTF-16BE', $encoding);

        return $char;
    }
}
