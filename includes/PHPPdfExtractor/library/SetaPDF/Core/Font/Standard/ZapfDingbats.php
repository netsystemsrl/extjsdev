<?php
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ZapfDingbats.php 1145 2017-12-19 16:37:17Z jan.slabon $
 */

/**
 * Class representing the PDF standard font ZapfDingbats 
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_Standard_ZapfDingbats extends SetaPDF_Core_Font_Standard
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
        $dictionary['BaseFont'] = new SetaPDF_Core_Type_Name('ZapfDingbats', true);

        return $dictionary;
    }
    
    /**
     * Creates a font object of this font.
     * 
     * @param SetaPDF_Core_Document $document
     * @param string $baseEncoding
     * @param array $diffEncoding
     * @return SetaPDF_Core_Font_Standard_ZapfDingbats
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
        
        $this->_fontName = 'ZapfDingbats';
        $this->_fontFamily = 'ZapfDingbats';
        
        $this->_info = array(
            SetaPDF_Core_Font::INFO_COPYRIGHT => '(c) 1985, 1987, 1988, 1989, 1997 Adobe Systems Incorporated. All Rights Reserved.',
            SetaPDF_Core_Font::INFO_CREATION_DATE => 'Date: Thu May  1 15:14:13 1997',
            SetaPDF_Core_Font::INFO_UNIQUE_ID => '43082',
            SetaPDF_Core_Font::INFO_VERSION => '002.000'            
        );
        
        $this->_isBold = false;
        $this->_isItalic = false;
        $this->_isMonospace = false;
        
        $this->_fontBBox = array(-1, -143, 981, 820);
        
        $this->_italicAngle = 0;
        
        $this->_widths = array(
            "\x00\x20" => 278,  "\x27\x01" => 974,  "\x27\x02" => 961,  "\x27\x03" => 974,  
            "\x27\x04" => 980,  "\x26\x0e" => 719,  "\x27\x06" => 789,  "\x27\x07" => 790,  
            "\x27\x08" => 791,  "\x27\x09" => 690,  "\x26\x1b" => 960,  "\x26\x1e" => 939,  
            "\x27\x0c" => 549,  "\x27\x0d" => 855,  "\x27\x0e" => 911,  "\x27\x0f" => 933,  
            "\x27\x10" => 911,  "\x27\x11" => 945,  "\x27\x12" => 974,  "\x27\x13" => 755,  
            "\x27\x14" => 846,  "\x27\x15" => 762,  "\x27\x16" => 761,  "\x27\x17" => 571,  
            "\x27\x18" => 677,  "\x27\x19" => 763,  "\x27\x1a" => 760,  "\x27\x1b" => 759,  
            "\x27\x1c" => 754,  "\x27\x1d" => 494,  "\x27\x1e" => 552,  "\x27\x1f" => 537,  
            "\x27\x20" => 577,  "\x27\x21" => 692,  "\x27\x22" => 786,  "\x27\x23" => 788,  
            "\x27\x24" => 788,  "\x27\x25" => 790,  "\x27\x26" => 793,  "\x27\x27" => 794,  
            "\x26\x05" => 816,  "\x27\x29" => 823,  "\x27\x2a" => 789,  "\x27\x2b" => 841,  
            "\x27\x2c" => 823,  "\x27\x2d" => 833,  "\x27\x2e" => 816,  "\x27\x2f" => 831,  
            "\x27\x30" => 923,  "\x27\x31" => 744,  "\x27\x32" => 723,  "\x27\x33" => 749,  
            "\x27\x34" => 790,  "\x27\x35" => 792,  "\x27\x36" => 695,  "\x27\x37" => 776,  
            "\x27\x38" => 768,  "\x27\x39" => 792,  "\x27\x3a" => 759,  "\x27\x3b" => 707,  
            "\x27\x3c" => 708,  "\x27\x3d" => 682,  "\x27\x3e" => 701,  "\x27\x3f" => 826,  
            "\x27\x40" => 815,  "\x27\x41" => 789,  "\x27\x42" => 789,  "\x27\x43" => 707,  
            "\x27\x44" => 687,  "\x27\x45" => 696,  "\x27\x46" => 689,  "\x27\x47" => 786,  
            "\x27\x48" => 787,  "\x27\x49" => 713,  "\x27\x4a" => 791,  "\x27\x4b" => 785,  
            "\x25\xcf" => 791,  "\x27\x4d" => 873,  "\x25\xa0" => 761,  "\x27\x4f" => 762,  
            "\x27\x50" => 762,  "\x27\x51" => 759,  "\x27\x52" => 759,  "\x25\xb2" => 892,  
            "\x25\xbc" => 892,  "\x25\xc6" => 788,  "\x27\x56" => 784,  "\x25\xd7" => 438,  
            "\x27\x58" => 138,  "\x27\x59" => 277,  "\x27\x5a" => 415,  "\x27\x5b" => 392,  
            "\x27\x5c" => 392,  "\x27\x5d" => 668,  "\x27\x5e" => 668,  "\x27\x68" => 390,  
            "\x27\x69" => 390,  "\x27\x6a" => 317,  "\x27\x6b" => 317,  "\x27\x6c" => 276,  
            "\x27\x6d" => 276,  "\x27\x6e" => 509,  "\x27\x6f" => 509,  "\x27\x70" => 410,  
            "\x27\x71" => 410,  "\x27\x72" => 234,  "\x27\x73" => 234,  "\x27\x74" => 334,  
            "\x27\x75" => 334,  "\x27\x61" => 732,  "\x27\x62" => 544,  "\x27\x63" => 544,  
            "\x27\x64" => 910,  "\x27\x65" => 667,  "\x27\x66" => 760,  "\x27\x67" => 760,  
            "\x26\x63" => 776,  "\x26\x66" => 595,  "\x26\x65" => 694,  "\x26\x60" => 626,  
            "\x24\x60" => 788,  "\x24\x61" => 788,  "\x24\x62" => 788,  "\x24\x63" => 788,  
            "\x24\x64" => 788,  "\x24\x65" => 788,  "\x24\x66" => 788,  "\x24\x67" => 788,  
            "\x24\x68" => 788,  "\x24\x69" => 788,  "\x27\x76" => 788,  "\x27\x77" => 788,  
            "\x27\x78" => 788,  "\x27\x79" => 788,  "\x27\x7a" => 788,  "\x27\x7b" => 788,  
            "\x27\x7c" => 788,  "\x27\x7d" => 788,  "\x27\x7e" => 788,  "\x27\x7f" => 788,  
            "\x27\x80" => 788,  "\x27\x81" => 788,  "\x27\x82" => 788,  "\x27\x83" => 788,  
            "\x27\x84" => 788,  "\x27\x85" => 788,  "\x27\x86" => 788,  "\x27\x87" => 788,  
            "\x27\x88" => 788,  "\x27\x89" => 788,  "\x27\x8a" => 788,  "\x27\x8b" => 788,  
            "\x27\x8c" => 788,  "\x27\x8d" => 788,  "\x27\x8e" => 788,  "\x27\x8f" => 788,  
            "\x27\x90" => 788,  "\x27\x91" => 788,  "\x27\x92" => 788,  "\x27\x93" => 788,  
            "\x27\x94" => 894,  "\x21\x92" => 838,  "\x21\x94" => 1016, "\x21\x95" => 458,  
            "\x27\x98" => 748,  "\x27\x99" => 924,  "\x27\x9a" => 748,  "\x27\x9b" => 918,  
            "\x27\x9c" => 927,  "\x27\x9d" => 928,  "\x27\x9e" => 928,  "\x27\x9f" => 834,  
            "\x27\xa0" => 873,  "\x27\xa1" => 828,  "\x27\xa2" => 924,  "\x27\xa3" => 924,  
            "\x27\xa4" => 917,  "\x27\xa5" => 930,  "\x27\xa6" => 931,  "\x27\xa7" => 463,  
            "\x27\xa8" => 883,  "\x27\xa9" => 836,  "\x27\xaa" => 836,  "\x27\xab" => 867,  
            "\x27\xac" => 867,  "\x27\xad" => 696,  "\x27\xae" => 696,  "\x27\xaf" => 874,  
            "\x27\xb1" => 874,  "\x27\xb2" => 760,  "\x27\xb3" => 946,  "\x27\xb4" => 771,  
            "\x27\xb5" => 865,  "\x27\xb6" => 771,  "\x27\xb7" => 888,  "\x27\xb8" => 967,  
            "\x27\xb9" => 888,  "\x27\xba" => 831,  "\x27\xbb" => 873,  "\x27\xbc" => 927,  
            "\x27\xbd" => 970,  "\x27\xbe" => 918,          
        );
               
    }

    /**
     * Get the base encoding table.
     *
     * @return array
     */
    public function getBaseEncodingTable()
    {
        return SetaPDF_Core_Encoding_ZapfDingbats::$table;
    }
}
