<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Type1.php 1333 2019-05-03 08:28:17Z jan.slabon $
 */

/**
 * Class for Type1 fonts
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_Type1
    extends SetaPDF_Core_Font_Simple
    implements SetaPDF_Core_Font_Glyph_Collection_CollectionInterface, SetaPDF_Core_Font_DescriptorInterface
{
    /**
     * The font descriptor object
     *
     * @var SetaPDF_Core_Font_Descriptor
     */
    protected $_fontDescriptor;

    /**
     * Glyph widths
     *
     * @var array
     */
    protected $_widths;

    /**
     * The UTF-16BE unicode value for a substitute character
     *
     * @var null|string
     */
    protected $_substituteCharacter = null;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface|SetaPDF_Core_Type_Dictionary $indirectObjectOrDictionary
     * @throws SetaPDF_Core_Font_Exception
     */
    public function __construct($indirectObjectOrDictionary)
    {
        $dictionary = $indirectObjectOrDictionary->ensure();
        foreach (array('FirstChar', 'LastChar', 'Widths', 'FontDescriptor') AS $key) {
            if (!$dictionary->offsetExists($key)) {
                throw new SetaPDF_Core_Font_Exception(sprintf('Missing "%s" entry in font dictionary.', $key));
            }
        }

        parent::__construct($indirectObjectOrDictionary);
    }

    /**
     * Get the font descriptor object.
     *
     * @return SetaPDF_Core_Font_Descriptor
     */
    public function getFontDescriptor()
    {
        if (null === $this->_fontDescriptor) {
            $this->_fontDescriptor = new SetaPDF_Core_Font_Descriptor(
                $this->_dictionary->offsetGet('FontDescriptor')->getValue()
            );
        }

        return $this->_fontDescriptor;
    }

    /**
     * Get the font name.
     *
     * @return string
     */
    public function getFontName()
    {
        return $this->_dictionary->offsetGet('BaseFont')->ensure()->getValue();
    }

    /**
     * Get the font family.
     *
     * @return string
     */
    public function getFontFamily()
    {
        return $this->getFontDescriptor()->getFontFamily();
    }

    /**
     * Checks if the font is bold.
     *
     * @return boolean
     */
    public function isBold()
    {
        $fontWeight = $this->getFontDescriptor()->getFontWeight();
        $fontWeight = $fontWeight ? $fontWeight : 400;
        return $fontWeight >= 700;
    }

    /**
     * Checks if the font is italic.
     *
     * @return boolean
     */
    public function isItalic()
    {
        return $this->getFontDescriptor()->getItalicAngle() != 0;
    }

    /**
     * Checks if the font is monospace.
     *
     * @return boolean
     */
    public function isMonospace()
    {
        return ($this->getFontDescriptor()->getFlags() & 1) == 1;
    }

    /**
     * Returns the font bounding box.
     *
     * @return array
     */
    public function getFontBBox()
    {
        return $this->getFontDescriptor()->getFontBBox();
    }

    /**
     * Returns the italic angle.
     *
     * @return float
     */
    public function getItalicAngle()
    {
        return $this->getFontDescriptor()->getItalicAngle();
    }

    /**
     * Returns the distance from baseline of highest ascender (Typographic ascent).
     *
     * @return float
     */
    public function getAscent()
    {
        return $this->getFontDescriptor()->getAscent();
    }

    /**
     * Returns the distance from baseline of lowest descender (Typographic descent).
     *
     * @return float
     */
    public function getDescent()
    {
        return $this->getFontDescriptor()->getDescent();
    }

    /**
     * Get the average glyph width.
     *
     * @param boolean $calculateIfUndefined
     * @return integer|float
     */
    public function getAvgWidth($calculateIfUndefined = false)
    {
        $default = SetaPDF_Core_Font::getAvgWidth();
        $avgWidth = $this->getFontDescriptor()->getAvgWidth();
        if ($calculateIfUndefined && $default === $avgWidth) {
            return parent::getAvgWidth(true);
        }

        return $avgWidth;
    }

    /**
     * Get the max glyph width.
     *
     * @return integer|float
     */
    public function getMaxWidth()
    {
        return $this->getFontDescriptor()->getMaxWidth();
    }

    /**
     * Get the missing glyph width.
     *
     * @return integer|float
     */
    public function getMissingWidth()
    {
        return $this->getFontDescriptor()->getMissingWidth();
    }

    /**
     * Resolves the width values from the font descriptor and fills the {@link $_width}-array.
     */
    protected function _getWidths()
    {
        $firstChar = $this->_dictionary->offsetGet('FirstChar')->ensure()->toPhp();
        $lastChar = $this->_dictionary->offsetGet('LastChar')->ensure()->toPhp();

        $widths = [];
        /**
         * @var SetaPDF_Core_Type_Array $widthsArray
         */
        $widthsArray = $this->_dictionary->offsetGet('Widths')->ensure();
        foreach ($widthsArray as $_width) {
            $widths[] = $_width->ensure()->toPhp();
        }

        $table = $this->_getCharCodesTable();
        if (false === $table) {
            $table = $this->_getEncodingTable();
        }

        $this->_widths = array();
        $this->_widthsByCharCode = array();

        for ($i = $firstChar; $i <= $lastChar; $i++) {
            $charCode = chr($i);
            if (isset($widths[$i - $firstChar])) {
                $width = $widths[$i - $firstChar];
            } else {
                $width = $this->getMissingWidth();
            }

            $this->_widthsByCharCode[$charCode] = $width;

            $utf16BeCodePoint = SetaPDF_Core_Encoding::toUtf16Be($table, $charCode, false, true);
            if (!isset($this->_widths[$utf16BeCodePoint])) {
                $this->_widths[$utf16BeCodePoint] = $width;
            }
        }
    }

    /**
     * Get the width of a glyph/character.
     *
     * @see SetaPDF_Core_Font::getGlyphWidth()
     * @param string $char
     * @param string $encoding The input encoding
     * @return float|int
     */
    public function getGlyphWidth($char, $encoding = 'UTF-16BE')
    {
        if (null === $this->_widths) {
            $this->_getWidths();
        }

        return parent::getGlyphWidth($char, $encoding);
    }

    /**
     * Get the width of a glpyh by its char code.
     *
     * @param string $charCode
     * @return float|int
     */
    public function getGlyphWidthByCharCode($charCode)
    {
        if (null === $this->_widthsByCharCode) {
            $this->_getWidths();
        }

        return parent::getGlyphWidthByCharCode($charCode);
    }

    /**
     * Get the base encoding of the font.
     *
     * If no BaseEncoding entry is available we use the
     * Standard encoding for now. This should be extended
     * to get the fonts build in encoding later.
     *
     * @return array
     */
    public function getBaseEncodingTable()
    {
        return SetaPDF_Core_Encoding_Standard::$table;
    }
}