<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Os2.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A class representing the OS/2 and Windows Metrics Table (OS/2) in a TrueType file.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_Os2 extends SetaPDF_Core_Font_TrueType_Table
{
    /**
     * The tag name of this class
     *
     * @var string
     */
    const TAG = SetaPDF_Core_Font_TrueType_Table_Tags::OS2;

    /**
     * The entries in this table
     *
     * @var array
     */
    protected $_entries = [
        'version' => [0, SetaPDF_Core_BitConverter::USHORT],
        'xAvgCharWidth' => [2, SetaPDF_Core_BitConverter::SHORT],
        'usWeightClass' => [4, SetaPDF_Core_BitConverter::USHORT],
        'usWidthClass' => [6, SetaPDF_Core_BitConverter::USHORT],
        'fsType' => [8, SetaPDF_Core_BitConverter::USHORT],
        'ySubscriptXSize' => [10, SetaPDF_Core_BitConverter::SHORT],
        'ySubscriptYSize' => [12, SetaPDF_Core_BitConverter::SHORT],
        'ySubscriptXOffset' => [14, SetaPDF_Core_BitConverter::SHORT],
        'ySubscriptYOffset' => [16, SetaPDF_Core_BitConverter::SHORT],
        'ySuperscriptXSize' => [18, SetaPDF_Core_BitConverter::SHORT],
        'ySuperscriptYSize' => [20, SetaPDF_Core_BitConverter::SHORT],
        'ySuperscriptXOffset' => [22, SetaPDF_Core_BitConverter::SHORT],
        'ySuperscriptYOffset' => [24, SetaPDF_Core_BitConverter::SHORT],
        'yStrikeoutSize' => [26, SetaPDF_Core_BitConverter::SHORT],
        'yStrikeoutPosition' => [28, SetaPDF_Core_BitConverter::SHORT],
        'sFamilyClass' => [30, SetaPDF_Core_BitConverter::SHORT],
        'panose' => [32, 10], // 10 bytes
        'ulUnicodeRange1' => [42, SetaPDF_Core_BitConverter::ULONG],
        'ulUnicodeRange2' => [46, SetaPDF_Core_BitConverter::ULONG],
        'ulUnicodeRange3' => [50, SetaPDF_Core_BitConverter::ULONG],
        'ulUnicodeRange4' => [54, SetaPDF_Core_BitConverter::ULONG],
        'achVendID' => [58, 4], // 4 Chars
        'fsSelection' => [62, SetaPDF_Core_BitConverter::USHORT],
        'usFirstCharIndex' => [64, SetaPDF_Core_BitConverter::USHORT],
        'usLastCharIndex' => [66, SetaPDF_Core_BitConverter::USHORT],
        'sTypoAscender' => [68, SetaPDF_Core_BitConverter::SHORT],
        'sTypoDescender' => [70, SetaPDF_Core_BitConverter::SHORT],
        'sTypoLineGap' => [72, SetaPDF_Core_BitConverter::SHORT],
        'usWinAscent' => [74, SetaPDF_Core_BitConverter::USHORT],
        'usWinDescent' => [76, SetaPDF_Core_BitConverter::USHORT],
        'ulCodePageRange1' => [[
            ['version', 0, null],
            78
        ], SetaPDF_Core_BitConverter::ULONG],
        'ulCodePageRange2' => [[
            ['version', 0, null],
            82
        ], SetaPDF_Core_BitConverter::ULONG],
        'sxHeight' => [[
            ['version', 0, null],
            ['version', 1, null],
            86
        ], SetaPDF_Core_BitConverter::SHORT],
        'sCapHeight' => [[
            ['version', 0, null],
            ['version', 1, null],
            88
        ], SetaPDF_Core_BitConverter::SHORT],
        'usDefaultChar' => [[
            ['version', 0, null],
            ['version', 1, null],
            90
        ], SetaPDF_Core_BitConverter::USHORT],
        'usBreakChar' => [[
            ['version', 0, null],
            ['version', 1, null],
            92
        ], SetaPDF_Core_BitConverter::USHORT],
        'usMaxContext' => [[
            ['version', 0, null],
            ['version', 1, null],
            94
        ], SetaPDF_Core_BitConverter::USHORT],
        'usLowerOpticalPointSize' => [[
            ['version', 0, null],
            ['version', 1, null],
            ['version', 2, null],
            ['version', 3, null],
            ['version', 4, null],
            96
        ], SetaPDF_Core_BitConverter::USHORT],
        'usUpperOpticalPointSize' => [[
            ['version', 0, null],
            ['version', 1, null],
            ['version', 2, null],
            ['version', 3, null],
            ['version', 4, null],
            98
        ], SetaPDF_Core_BitConverter::USHORT],
    ];

    /**
     * Get the OS/2 table version number.
     *
     * @return integer
     */
    public function getVersion()
    {
        return $this->_get('version');
    }

    /**
     * Get the average weighted escapement.
     *
     * @return integer
     */
    public function getAvgCharWidth()
    {
        return $this->_get('xAvgCharWidth');
    }

    /**
     * Get the weight class.
     *
     * @return integer
     */
    public function getWeightClass()
    {
        return $this->_get('usWeightClass');
    }

    /**
     * Get the width class.
     *
     * @return integer
     */
    public function getWidthClass()
    {
        return $this->_get('usWidthClass');
    }

    /**
     * Get the type flags.
     *
     * @return integer
     */
    public function getFsType()
    {
        return $this->_get('fsType');
    }

    /**
     * Get the subscript horizontal font size.
     *
     * @return integer
     */
    public function getSubscriptXSize()
    {
        return $this->_get('ySubscriptXSize');
    }

    /**
     * Get the subscript vertical font size.
     *
     * @return integer
     */
    public function getSubscriptYSize()
    {
        return $this->_get('ySubscriptYSize');
    }

    /**
     * Get the subscript x offset.
     *
     * @return integer
     */
    public function getSubscriptXOffset()
    {
        return $this->_get('ySubscriptXOffset');
    }

    /**
     * Get the subscript y offset.
     *
     * @return integer
     */
    public function getSubscriptYOffset()
    {
        return $this->_get('ySubscriptYOffset');
    }

    /**
     * Get the superscript horizontal font size.
     *
     * @return integer
     */
    public function getSuperscriptXSize()
    {
        return $this->_get('ySuperscriptXSize');
    }

    /**
     * Get the superscript vertical font size.
     *
     * @return integer
     */
    public function getSuperscriptYSize()
    {
        return $this->_get('ySuperscriptYSize');
    }

    /**
     * Get the superscript x offset.
     *
     * @return integer
     */
    public function getSuperscriptXOffset()
    {
        return $this->_get('ySuperscriptXOffset');
    }

    /**
     * Get the superscript y offset.
     *
     * @return integer
     */
    public function getSuperscriptYOffset()
    {
        return $this->_get('ySuperscriptYOffset');
    }

    /**
     * Get the strikeout size.
     *
     * @return integer
     */
    public function getStrikeoutSize()
    {
        return $this->_get('yStrikeoutSize');
    }

    /**
     * Get the strikeout position.
     *
     * @return integer
     */
    public function getStrikeoutPosition()
    {
        return $this->_get('yStrikeoutPosition');
    }

    /**
     * Get the font-family class and subclass.
     *
     * @return integer[]
     */
    public function getFamilyClass()
    {
        $result = $this->_get('sFamilyClass');

        return [
            ($result >> 8) & 0xFF,
            $result & 0xFF,
        ];
    }

    /**
     * Get the PANOSE classification number.
     *
     * @return string
     */
    public function getPanose()
    {
        return $this->_get('panose');
    }

    /**
     * Get Unicode Character Range 1.
     *
     * @return integer
     */
    public function getUnicodeRange1()
    {
        return $this->_get('ulUnicodeRange1');
    }

    /**
     * Get Unicode Character Range 2.
     *
     * @return integer
     */
    public function getUnicodeRange2()
    {
        return $this->_get('ulUnicodeRange2');
    }

    /**
     * Get Unicode Character Range 3.
     *
     * @return integer
     */
    public function getUnicodeRange3()
    {
        return $this->_get('ulUnicodeRange3');
    }

    /**
     * Get Unicode Character Range 4.
     *
     * @return integer
     */
    public function getUnicodeRange4()
    {
        return $this->_get('ulUnicodeRange4');
    }

    /**
     * Get the Font Vendor Identification.
     *
     * @return string
     */
    public function getVendorId()
    {
        return $this->_get('achVendID');
    }

    /**
     * Get font selection flags.
     *
     * @return integer
     */
    public function getFsSelection()
    {
        return $this->_get('fsSelection');
    }

    /**
     * Get the minimum Unicode index (character code) in this font.
     *
     * @return integer
     */
    public function getFirstCharIndex()
    {
        return $this->_get('usFirstCharIndex');
    }

    /**
     * Get the maximum Unicode index (character code) in this font.
     *
     * @return integer
     */
    public function getLastCharIndex()
    {
        return $this->_get('usLastCharIndex');
    }

    /**
     * Get the typographic ascender for this font.
     *
     * @return integer
     */
    public function getTypoAscender()
    {
        return $this->_get('sTypoAscender');
    }

    /**
     * Get the typographic descender for this font.
     *
     * @return integer
     */
    public function getTypoDescender()
    {
        return $this->_get('sTypoDescender');
    }

    /**
     * Get the typographic line gap for this font.
     *
     * @return integer
     */
    public function getTypoLineGap()
    {
        return $this->_get('sTypoLineGap');
    }

    /**
     * Get the ascender metric for Windows.
     *
     * @return integer
     */
    public function getWinAscent()
    {
        return $this->_get('usWinAscent');
    }

    /**
     * Get the descender metric for Windows.
     *
     * @return integer
     */
    public function getWinDescent()
    {
        return $this->_get('usWinDescent');
    }

    /**
     * Get Code Page Character Range 1.
     *
     * @return integer
     */
    public function getCodePageRange1()
    {
        return $this->_get('ulCodePageRange1');
    }

    /**
     * Get Code Page Character Range 2.
     *
     * @return integer
     */
    public function getCodePageRange2()
    {
        return $this->_get('ulCodePageRange2');
    }

    /**
     * Get the distance between the baseline and the approximate height of non-ascending lowercase letters.
     *
     * @return integer
     */
    public function getXHeight()
    {
        return $this->_get('sxHeight');
    }

    /**
     * Get the distance between the baseline and the approximate height of uppercase letters.
     *
     * @return integer
     */
    public function getCapHeight()
    {
        return $this->_get('sCapHeight');
    }

    /**
     * Get the default character code that should be used whenever a requested character is not in the font.
     *
     * @return integer
     */
    public function getDefaultChar()
    {
        return $this->_get('usDefaultChar');
    }

    /**
     * Get the break character.
     *
     * @return integer
     */
    public function getBreakChar()
    {
        return $this->_get('usBreakChar');
    }

    /**
     * Get the maximum length of a target glyph context for any feature in this font.
     *
     * @return integer
     */
    public function getMaxContext()
    {
        return $this->_get('usMaxContext');
    }

    /**
     * Get the lower value of the size range for which this font has been designed.
     *
     * @return integer
     */
    public function getLowerOpticalPointSize()
    {
        return $this->_get('usLowerOpticalPointSize');
    }

    /**
     * Get the upper value of the size range for which this font has been designed.
     *
     * @return integer
     */
    public function getUpperOpticalPointSize()
    {
        return $this->_get('usUpperOpticalPointSize');
    }
}