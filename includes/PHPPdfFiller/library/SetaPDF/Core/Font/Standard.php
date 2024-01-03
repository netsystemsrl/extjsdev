<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Standard.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Abstract class for standard PDF fonts
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Font_Standard
extends SetaPDF_Core_Font_Simple
{
    /**
     * The font name
     *
     * @var string
     */
    protected $_fontName;

    /**
     * The font family
     *
     * @var string
     */
    protected $_fontFamily;

    /**
     * The font bounding box
     *
     * @var array
     */
    protected $_fontBBox = array();

    /**
     * The italic angle
     *
     * @var float
     */
    protected $_italicAngle = 0;

    /**
     * The distance from baseline of highest ascender (Typographic ascent)
     *
     * @return float
     */
    protected $_ascent = 0;

    /**
     * The distance from baseline of lowest descender (Typographic descent)
     *
     * @return float
     */
    protected $_descent = 0;

    /**
     * The vertical coordinate of the top of flat capital letters, measured from the baseline.
     *
     * @var float
     */
    protected $_capHeight = 0;

    /**
     * The vertical coordinate of the top of flat non-ascending lowercase letters (like the letter x), measured from the baseline
     *
     * @var float
     */
    protected $_xHeight = 0;

    /**
     * Flag indicating if this font is bold.
     *
     * @var boolean
     */
    protected $_isBold = false;

    /**
     * Flag indicating if this font is italic.
     *
     * @var boolean
     */
    protected $_isItalic = false;

    /**
     * Flag indicating if this font is monospace.
     *
     * @var boolean
     */
    protected $_isMonospace = false;

    /**
     * Glyph widths
     *
     * @var array
     */
    protected $_widths = array();

    /**
     * Kerning pairs
     *
     * @var array
     */
    protected $_kerningPairs = array();

    /**
     * The UTF-16BE unicode value for a substitute character
     *
     * @var null|string
     */
    protected $_substituteCharacter = null;

    /**
     * Helper method to get all available standard font names and their class mapping.
     *
     * @return array
     */
    static public function getStandardFontsToClasses()
    {
        $prefix = 'SetaPDF_Core_Font_Standard_';

        return array(
            'Courier'                  => $prefix . 'Courier',
            'CourierNew'               => $prefix . 'Courier',
            'Courier-Bold'             => $prefix . 'CourierBold',
            'CourierNew,Bold'          => $prefix . 'CourierBold',
            'Courier-BoldOblique'      => $prefix . 'CourierBoldOblique',
            'CourierNew,BoldItalic'    => $prefix . 'CourierBoldOblique',
            'Courier-Oblique'          => $prefix . 'CourierOblique',
            'CourierNew,Italic'        => $prefix . 'CourierOblique',

            'Helvetica'                => $prefix . 'Helvetica',
            'Arial'                    => $prefix . 'Helvetica',
            'Helvetica-Bold'           => $prefix . 'HelveticaBold',
            'Arial,Bold'               => $prefix . 'HelveticaBold',
            'Helvetica-BoldOblique'    => $prefix . 'HelveticaBoldOblique',
            'Arial,BoldItalic'         => $prefix . 'HelveticaBoldOblique',
            'Helvetica-Oblique'        => $prefix . 'HelveticaOblique',
            'Arial,Italic'             => $prefix . 'HelveticaOblique',

            'Times-Bold'               => $prefix . 'TimesBold',
            'TimesNewRoman,Bold'       => $prefix . 'TimesBold',
            'Times-BoldItalic'         => $prefix . 'TimesBoldItalic',
            'TimesNewRoman,BoldItalic' => $prefix . 'TimesBoldItalic',
            'Times-Italic'             => $prefix . 'TimesItalic',
            'TimesNewRoman,Italic'     => $prefix . 'TimesItalic',
            'Times-Roman'              => $prefix . 'TimesRoman',
            'TimesNewRoman'            => $prefix . 'TimesRoman',

            'Symbol'                   => $prefix . 'Symbol',
            'ZapfDingbats'             => $prefix . 'ZapfDingbats'
        );
    }

    /**
     * Creates a difference array.
     *
     * @param SetaPDF_Core_Type_Dictionary $dictionary
     * @param string $baseEncoding
     * @param array $diffEncoding
     */
    static protected function _createDifferenceArray(
        SetaPDF_Core_Type_Dictionary $dictionary,
        $baseEncoding,
        array $diffEncoding
    )
    {
        if (count($diffEncoding) === 0) {
            return;
        }

        if ($baseEncoding !== null) {
            $baseEncoding = str_replace('Encoding', '', $baseEncoding);
        }

        $encoding = new SetaPDF_Core_Type_Dictionary();
        $encoding->offsetSet('Type', new SetaPDF_Core_Type_Name('Encoding', true));
        if ($baseEncoding !== null) {
            $encoding->offsetSet('BaseEncoding', new SetaPDF_Core_Type_Name($baseEncoding . 'Encoding'));
        }

        $differences = new SetaPDF_Core_Type_Array();
        $encoding->offsetSet('Differences', $differences);

        $currentCode = null;
        if (is_array($diffEncoding)) {
            foreach ($diffEncoding AS $code => $name) {
                if (null === $currentCode || $code !== $currentCode) {
                    $differences[] = new SetaPDF_Core_Type_Numeric($code);
                    $currentCode = $code;
                }

                $differences[] = new SetaPDF_Core_Type_Name($name);
                $currentCode++;
            }
        }

        $dictionary->offsetSet('Encoding', $encoding);
    }

    /**
     * Get the font name.
     *
     * @return string
     */
    public function getFontName()
    {
        return $this->_fontName;
    }

    /**
     * Get the font family.
     *
     * @return string
     */
    public function getFontFamily()
    {
        return $this->_fontFamily;
    }

    /**
     * Get the base encoding table.
     *
     * The base encoding of all Standard Fonts is StandardEncoding
     * but Symbol and ZapfDingbats. They use their own encoding.
     *
     * @see SetaPDF_Core_Encoding_Standard
     * @return array
     */
    public function getBaseEncodingTable()
    {
        return SetaPDF_Core_Encoding_Standard::$table;
    }

    /**
     * Returns the font bounding box.
     *
     * @return array
     */
    public function getFontBBox()
    {
        return $this->_fontBBox;
    }

    /**
     * Returns the distance from baseline of highest ascender (Typographic ascent).
     *
     * @return float
     */
    public function getAscent()
    {
        return $this->_ascent;
    }

    /**
     * Returns the distance from baseline of lowest descender (Typographic descent).
     *
     * @return float
     */
    public function getDescent()
    {
        return $this->_descent;
    }

    /**
     * Get the vertical coordinate of the top of flat capital letters, measured from the baseline.
     *
     * @return float
     */
    public function getCapHeight()
    {
        return $this->_capHeight;
    }

    /**
     * Get the vertical coordinate of the top of flat non-ascending lowercase letters
     * (like the letter x), measured from the baseline.
     *
     * @return float
     */
    public function getXHeight()
    {
        return $this->_xHeight;
    }

    /**
     * Returns the italic angle.
     *
     * @return float
     */
    public function getItalicAngle()
    {
        return $this->_italicAngle;
    }

    /**
     * Checks if the font is bold.
     *
     * @return boolean
     */
    public function isBold()
    {
        return $this->_isBold;
    }

    /**
     * Checks if the font is italic.
     *
     * @return boolean
     */
    public function isItalic()
    {
        return $this->_isItalic;
    }

    /**
     * Checks if the font is monospace.
     *
     * @return boolean
     */
    public function isMonospace()
    {
        return $this->_isMonospace;
    }

    /**
     * Get the width of a glpyh by its char code.
     *
     * @param string $charCode
     * @return float|int
     */
    public function getGlyphWidthByCharCode($charCode)
    {
        if (isset($this->_widthsByCharCode[$charCode])) {
            return $this->_widthsByCharCode[$charCode];
        }

        $utf16 = SetaPDF_Core_Encoding::toUtf16Be($this->_getEncodingTable(), $charCode, true);
        if (isset($this->_widths[$utf16])) {
            $this->_widthsByCharCode[$charCode] = $this->_widths[$utf16];
        } else {
            if ($this instanceof SetaPDF_Core_Font_Standard_ZapfDingbats) {
                $this->_widthsByCharCode[$charCode] = $this->getMissingWidth();
            } else {
                $this->_widthsByCharCode[$charCode] = $this->_widths["\x00\x20"];
            }
        }

        return $this->_widthsByCharCode[$charCode];
    }

    /**
     * Resolves the width values from the font descriptor and fills the {@link $_width}-array.
     */
    protected function _getWidths()
    {
        /* Standard fonts already have widths defined. Maybe we could use this method to get the data on request
         * instead of defining them in the class body.
         */
    }
}