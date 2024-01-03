<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Descriptor.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a font descriptor
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_Descriptor
{
    /**
     * The dictionary
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_dictionary;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface|SetaPDF_Core_Type_Dictionary $indirectObjectOrDictionary
     * @throws InvalidArgumentException
     * @throws SetaPDF_Core_Font_Exception
     */
    public function __construct($indirectObjectOrDictionary)
    {
        if (!$indirectObjectOrDictionary instanceof SetaPDF_Core_Type_AbstractType) {
            throw new InvalidArgumentException(
                'The argument needs to be a indirect object (reference) or a dictionary.'
            );
        }

        $dictionary = $indirectObjectOrDictionary->ensure();
        if (!($dictionary instanceof SetaPDF_Core_Type_Dictionary)) {
            throw new InvalidArgumentException('The passed value is not a dictionary object or a reference to one.');
        }

        /* This is somewhat hard and may end in trouble with specific files
        if (!$dictionary->offsetExists('Type') || $dictionary->getValue('Type')->getValue() !== 'FontDescriptor') {
            throw new SetaPDF_Core_Font_Exception('"Type" key is missing or it is not set to FontDescriptor');
        }*/

        $this->_dictionary = $dictionary;
    }

    /**
     * Get the font descriptor dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary()
    {
        return $this->_dictionary;
    }

    /**
     * Helper method to get values from a font descriptor.
     *
     * @param string $key
     * @param null|mixed $default
     * @return mixed|null
     * @throws SetaPDF_Core_Font_Exception
     */
    private function _get($key, $default = null)
    {
        $exists = $this->_dictionary->offsetExists($key);
        if ($exists === false) {
            if ($default !== null) {
                return $default;
            }

            throw new SetaPDF_Core_Font_Exception('Missing required entry in font descriptor: /' . $key);
        }

        return $this->_dictionary->getValue($key)->ensure()->getValue();
    }

    /**
     * Get the PostScript name of the font.
     *
     * @return string
     */
    public function getFontName()
    {
        return $this->_get('FontName');
    }

    /**
     * Get the preferred font family name.
     *
     * @return string|false
     */
    public function getFontFamily()
    {
        return $this->_get('FontFamily', false);
    }

    /**
     * Get the font stretch value.
     *
     * @return string|false
     */
    public function getFontStretch()
    {
        return $this->_get('FontStretch', false);
    }

    /**
     * Get the weight (thickness) component of the fully-qualified font name or font specifier.
     *
     * @return number|false
     */
    public function getFontWeight()
    {
        return $this->_get('FontWeight', false);
    }

    /**
     * Get a collection of flags defining various characteristics of the font.
     *
     * @return int
     */
    public function getFlags()
    {
        return (int)$this->_get('Flags');
    }

    /**
     * Get a rectangle, expressed in the glyph coordinate system, that shall specify the font bounding box.
     *
     * @return array|false
     */
    public function getFontBBox()
    {
        if (!$this->_dictionary->offsetExists('FontBBox')) {
            return false;
        }

        $fontBBox = $this->_dictionary->getValue('FontBBox')->ensure();

        return $fontBBox->toPhp();
    }

    /**
     * Get the angle, expressed in degrees counterclockwise from the vertical, of the dominant vertical strokes of the font.
     *
     * @return number
     */
    public function getItalicAngle()
    {
        return $this->_get('ItalicAngle');
    }

    /**
     * Get the maximum height above the baseline reached by glyphs in this font.
     *
     * @return number|false
     */
    public function getAscent()
    {
        return $this->_get('Ascent', false);
    }

    /**
     * Get the maximum depth below the baseline reached by glyphs in this font.
     *
     * @return number|false
     */
    public function getDescent()
    {
        return $this->_get('Descent', false);
    }

    /**
     * Get the spacing between baselines of consecutive lines of text.
     *
     * @return number
     */
    public function getLeading()
    {
        return $this->_get('Leading', 0);
    }

    /**
     * Get the vertical coordinate of the top of flat capital letters, measured from the baseline.
     *
     * @return number|false
     */
    public function getCapHeight()
    {
        return $this->_get('CapHeight', false);
    }

    /**
     * Get the font’s x height.
     *
     * The vertical coordinate of the top of flat nonascending lowercase letters (like the letter x), measured from the
     * baseline, in fonts that have Latin characters.
     *
     * @return number
     */
    public function getXHeight()
    {
        return $this->_get('XHeight', 0.);
    }

    /**
     * Get the thickness, measured horizontally, of the dominant vertical stems of glyphs in the font.
     *
     * @return number|false
     */
    public function getStemV()
    {
        return $this->_get('StemV', false);
    }

    /**
     * Get the thickness, measured vertically, of the dominant horizontal stems of glyphs in the font.
     *
     * @return number
     */
    public function getStemH()
    {
        return $this->_get('StemH', 0.);
    }

    /**
     * Get the average width of glyphs in the font.
     *
     * @return number
     */
    public function getAvgWidth()
    {
        return $this->_get('AvgWidth', 0.);
    }

    /**
     * Get the maximum width of glyphs in the font.
     *
     * @return number
     */
    public function getMaxWidth()
    {
        return $this->_get('MaxWidth', 0.);
    }

    /**
     * Get the  width to use for character codes whose widths are not specified in a font dictionary's Widths array.
     *
     * @return number
     */
    public function getMissingWidth()
    {
        return $this->_get('MissingWidth', 0.);
    }

    /**
     * Helper methid to get font file entries.
     *
     * @param string $key
     * @return false|SetaPDF_Core_Reader_Stream
     */
    private function _getFontFile($key)
    {
        if (!$this->_dictionary->offsetExists($key)) {
            return false;
        }

        return $this->_dictionary->offsetGet($key)->ensure();
    }

    /**
     * Get a stream containing a Type 1 font program.
     *
     * @return false|SetaPDF_Core_Reader_Stream
     */
    public function getFontFile()
    {
        return $this->_getFontFile('FontFile');
    }

    /**
     * Get a stream containing a TrueType font program.
     *
     * @return false|SetaPDF_Core_Reader_Stream
     */
    public function getFontFile2()
    {
        return $this->_getFontFile('FontFile2');
    }

    /**
     * Get a stream containing a font program whose format is specified by the Subtype entry in the stream dictionary.
     *
     * @return false|SetaPDF_Core_Reader_Stream
     */
    public function getFontFile3()
    {
        return $this->_getFontFile('FontFile3');
    }
}