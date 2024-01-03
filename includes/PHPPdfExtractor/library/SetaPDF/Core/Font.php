<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Font.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * Abstract class representing a Font
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Font implements
    SetaPDF_Core_Font_Glyph_Collection_CollectionInterface,
    SetaPDF_Core_Font_FontInterface
{
    /**
     * The font dictionary
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_dictionary;

    /**
     * The indirect object of the font
     *
     * @var SetaPDF_Core_Type_IndirectObject
     */
    protected $_indirectObject;

    /**
     * Array holding information about the font
     * 
     * @var array
     */
    protected $_info = array();

    /**
     * Glyph withds
     *
     * @var array
     */
    protected $_widths;

    /**
     * Widths by char codes
     *
     * @var array
     */
    protected $_widthsByCharCode;

    /**
     * The substitute character in a fonts specific encoding.
     *
     * @var string
     */
    protected $_substituteCharacter;

    /**
     * A char code cache which is used in {@link SetaPDF_Core_Font::getCharByCharCode()}.
     *
     * @var array
     */
    protected $_charCodeCache = array();

    /**
     * Info constant
     *
     * @var string
     */
    const INFO_COPYRIGHT = 'copyright';

    /**
     * Info constant
     *
     * @var string
     */
    const INFO_CREATION_DATE = 'creationDate';

    /**
     * Info constant
     *
     * @var string
     */
    const INFO_UNIQUE_ID = 'uniqueId';

    /**
     * Info constant
     *
     * @var string
     */
    const INFO_VERSION = 'version';

    /**
     * An array caching font objects
     *
     * @var array
     */
    static protected $_fonts = array();

    /**
     * Release font instances by a document instance.
     *
     * @param SetaPDF_Core_Document $document
     * @see freeCache()
     * @deprecated
     */
    static public function freeFontCache(SetaPDF_Core_Document $document)
    {
        self::freeCache($document);
    }

    /**
     * Release font instances by a document instance.
     *
     * @param SetaPDF_Core_Document $document
     */
    static public function freeCache(SetaPDF_Core_Document $document)
    {
        unset(self::$_fonts[$document->getInstanceIdent()]);
    }

    /**
     * Get a font object by an indirect reference.
     * 
     * The needed font object class is automatically resolve via the Subtype value
     * of the font dictionary.
     * 
     * @param SetaPDF_Core_Type_IndirectObjectInterface $indirectObjectOrDictionary
     * @return SetaPDF_Core_Font|SetaPDF_Core_Font_Cid
     * @throws SetaPDF_Exception_NotImplemented
     * @throws SetaPDF_Core_Font_Exception
     * @throws SetaPDF_Core_Type_IndirectReference_Exception
     */
    static public function get($indirectObjectOrDictionary)
    {
        if ($indirectObjectOrDictionary instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            $ident = $indirectObjectOrDictionary->getObjectIdent();
            $documentId = $indirectObjectOrDictionary->getOwnerPdfDocument()->getInstanceIdent();
            if (isset(self::$_fonts[$documentId][$ident])) {
                return self::$_fonts[$documentId][$ident];
            }
        }

        /**
         * @var $fontDict SetaPDF_Core_Type_Dictionary
         */
        $fontDict = $indirectObjectOrDictionary->ensure();
        $subType = $fontDict->getValue('Subtype')->getValue();

        if ($indirectObjectOrDictionary instanceof SetaPDF_Core_Type_IndirectReference) {
            $indirectObjectOrDictionary = $indirectObjectOrDictionary->getValue();
        }

        switch ($subType) {
            case 'Type1':
                $baseFont = $fontDict->offsetGet('BaseFont')->ensure()->getValue();
                $classes = SetaPDF_Core_Font_Standard::getStandardFontsToClasses();

                if (isset($classes[$baseFont])) {
                    $font = new $classes[$baseFont]($indirectObjectOrDictionary);
                } else {
                    $font = new SetaPDF_Core_Font_Type1($indirectObjectOrDictionary);
                }
                break;

            case 'TrueType':
                try {
                    $font = new SetaPDF_Core_Font_TrueType($indirectObjectOrDictionary);

                } catch (SetaPDF_Core_Font_Exception $e) {
                    // try to fallback to a standard font
                    $baseFont = $fontDict->getValue('BaseFont');
                    if (!$baseFont) {
                        throw $e;
                    }

                    $baseFont = $baseFont->ensure()->getValue();
                    $classes = SetaPDF_Core_Font_Standard::getStandardFontsToClasses();

                    if (!isset($classes[$baseFont])) {
                        throw $e;
                    }

                    $font = new $classes[$baseFont]($indirectObjectOrDictionary);
                }
                break;

            case 'Type0':
                $font = new SetaPDF_Core_Font_Type0($indirectObjectOrDictionary);
                break;

            case 'Type3':
                $font = new SetaPDF_Core_Font_Type3($indirectObjectOrDictionary);
                break;

            case 'MMType1':
                $font = new SetaPDF_Core_Font_MMType1($indirectObjectOrDictionary);
                break;

            case 'CIDFontType0':
                $font = new SetaPDF_Core_Font_CidType0($indirectObjectOrDictionary);
                break;

            case 'CIDFontType2':
                $font = new SetaPDF_Core_Font_CidType2($indirectObjectOrDictionary);
                break;

            default:
                throw new SetaPDF_Exception_NotImplemented('Not implemented yet. (Font: ' . $subType . ')');
        }

        if ($indirectObjectOrDictionary instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            self::$_fonts[$documentId][$ident] = $font;
        }

        return $font;
    }

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface|SetaPDF_Core_Type_Dictionary $indirectObjectOrDictionary
     */
    public function __construct($indirectObjectOrDictionary)
    {
        if ($indirectObjectOrDictionary instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            $this->_indirectObject = $indirectObjectOrDictionary;
        }

        $this->_dictionary = $indirectObjectOrDictionary->ensure();
    }

    /**
     * Get the font dictionary.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary()
    {
        return $this->_dictionary;
    }

    /**
     * Gets an indirect object for this font.
     *
     * @see SetaPDF_Core_Resource::getIndirectObject()
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_Type_IndirectObjectInterface
     * @throws InvalidArgumentException
     */
    public function getIndirectObject(SetaPDF_Core_Document $document = null)
    {
        if (null === $this->_indirectObject) {
            if (null === $document) {
                throw new InvalidArgumentException('To initialize a new object $document parameter is not optional!');
            }

            $this->_indirectObject = $document->createNewObject($this->_dictionary);
        }

        return $this->_indirectObject;
    }

    /**
     * Get the resource type.
     * 
     * @see SetaPDF_Core_Resource::getResourceType()
     * @return string
     */
    public function getResourceType()
    {
        return SetaPDF_Core_Resource::TYPE_FONT;
    }

    /**
     * Get the Subtype entry of the font dictionary.
     *
     * @return mixed
     */
    public function getType()
    {
        return $this->_dictionary->getValue('Subtype')->getValue();
    }

    /**
     * Returns the table to map character codes to unicode values.
     *
     * @return array|SetaPDF_Core_Font_Cmap_CmapInterface|false
     */
    abstract protected function _getCharCodesTable();

    /**
     * Returns the encoding table.
     *
     * @return array|SetaPDF_Core_Font_Cmap_CmapInterface|false
     */
    abstract protected function _getEncodingTable();

  /* Common methods to get information from the font descriptors dictionary */

    /**
     * Get the font family.
     *
     * @return string
     */
    abstract public function getFontFamily();

    /**
     * Checks if the font is bold.
     *
     * @return boolean
     */
    abstract public function isBold();

    /**
     * Checks if the font is italic.
     *
     * @return boolean
     */
    abstract public function isItalic();

    /**
     * Checks if the font is monospace.
     *
     * @return boolean
     */
    abstract public function isMonospace();

    /**
     * Returns the italic angle.
     *
     * @return float
     */
    abstract public function getItalicAngle();

    /** @noinspection PhpUnusedParameterInspection */
    /**
     * Get the average glyph width.
     *
     * @param boolean $calculateIfUndefined
     * @return integer|float
     */
    public function getAvgWidth($calculateIfUndefined = false)
    {
        return 0.; // default value
    }

    /**
     * Get the max. glyph width.
     *
     * @return integer|float
     */
    public function getMaxWidth()
    {
        return 0; // default value
    }

    /**
     * Get the missing glyph width.
     *
     * @return integer|float
     */
    public function getMissingWidth()
    {
        return 0; // default value from the PDF reference is "0"
    }

  /* Properties which are not defined in a dictionary but only in the font program */

    /**
     * Get information about the font.
     *
     * @param string $name The name of the font
     * @return bool|string
     */
    public function getInfo($name)
    {
        if (array_key_exists($name, $this->_info)) {
            return $this->_info[$name];
        }

        return false;
    }

  /* Handling of glyph widths */

    /**
     * Get the width of a glyph/character.
     *
     * @param string $char The character
     * @param string $encoding The input encoding
     * @return float|int
     */
    public function getGlyphWidth($char, $encoding = 'UTF-16BE')
    {
        if ($encoding !== 'UTF-16BE') {
            $char = SetaPDF_Core_Encoding::convert($char, $encoding, 'UTF-16BE');
        }

        if (isset($this->_widths[$char])) {
            return $this->_widths[$char];
        }

        return $this->getMissingWidth();
    }

    /**
     * Get the width of a glyph by its char code.
     *
     * @param string $charCode
     * @return float|int
     */
    public function getGlyphWidthByCharCode($charCode)
    {
        if (null === $this->_widthsByCharCode) {
            $this->_widthsByCharCode = array();
        }

        if (isset($this->_widthsByCharCode[$charCode])) {
            return $this->_widthsByCharCode[$charCode];
        }

        return $this->getMissingWidth();
    }

    /**
     * Get the width of the glyphs/characters.
     *
     * @param string $chars The characters
     * @param string $encoding The input encoding
     * @return float|int
     */
    public function getGlyphsWidth($chars, $encoding = 'UTF-16BE')
    {
        if ($encoding != 'UTF-16BE')
            $chars = SetaPDF_Core_Encoding::convert($chars, $encoding, 'UTF-16BE');

        $width = 0;
        $len = SetaPDF_Core_Encoding::strlen($chars, 'UTF-16BE');

        for ($i = 0; $i < $len; $i++) {
            $char = SetaPDF_Core_Encoding::substr($chars, $i, 1, 'UTF-16BE');
            $width += $this->getGlyphWidth($char);
        }

        return $width;
    }

    /**
     * Get the final character code of a single character.
     *
     * @param string $char The character
     * @param string $encoding The output encoding
     * @return string
     */
    public function getCharCode($char, $encoding = 'UTF-16BE')
    {
        if ($encoding !== 'UTF-16BE')
            $char = SetaPDF_Core_Encoding::convert($char, $encoding, 'UTF-16BE');

        $table = $this->_getEncodingTable();

        return SetaPDF_Core_Encoding::fromUtf16Be($table, $char, false, true, $this->_substituteCharacter);
    }

    /**
     * Get the final character codes of a character string.
     *
     * @param string $chars The character string
     * @param string $encoding The output encoding
     * @return array
     */
    public function getCharCodes($chars, $encoding = 'UTF-16BE')
    {
        if ($encoding !== 'UTF-16BE')
            $chars = SetaPDF_Core_Encoding::convert($chars, $encoding, 'UTF-16BE');

        $charCodes = array();
        $len = SetaPDF_Core_Encoding::strlen($chars, 'UTF-16BE');
        for ($i = 0; $i < $len; $i++) {
            $charCodes[] = $this->getCharCode(
                SetaPDF_Core_Encoding::substr($chars, $i, 1, 'UTF-16BE')
            );
        }

        return $charCodes;
    }

    /**
     * Converts a char code from the font specific encoding to another encoding.
     *
     * @param string $charCode The char code in the font specific encoding.
     * @param string $encoding The resulting encoding
     * @return string
     */
    public function getCharByCharCode($charCode, $encoding = 'UTF-8')
    {
        $cacheKey = $charCode . '|' . $encoding;
        if (isset($this->_charCodeCache[$cacheKey])) {
            return $this->_charCodeCache[$cacheKey];
        }

        $table = $this->_getCharCodesTable();
        if ($table !== false) {
            $char = SetaPDF_Core_Encoding::toUtf16Be($table, $charCode, true, true);
        }

        // check for replacement character and/or white signs (produced in some invalid ToUnicode maps)
        // and use the real Encoding to try to get a meaningful character.
        if ($table === false || $char == "\xFF\xFD" || $char === '') {
            $table = $this->_getEncodingTable();
            $char = SetaPDF_Core_Encoding::toUtf16Be($table, $charCode, false, true);
        }

        if ($encoding !== 'UTF-16BE') {
            $char = SetaPDF_Core_Encoding::convert($char, 'UTF-16BE', $encoding);
        }

        $this->_charCodeCache[$cacheKey] = $char;

        return $char;
    }

    /**
     * Converts char codes from the font specific encoding to another encoding.
     *
     * @param string $charCodes The char codes in the font specific encoding.
     * @param string $encoding The resulting encoding
     * @param bool $asArray
     * @return string|array
     */
    public function getCharsByCharCodes($charCodes, $encoding = 'UTF-8', $asArray = true)
    {
        $chars = array();

        foreach (str_split($charCodes) AS $charCode) {
            $chars[] = $this->getCharByCharCode($charCode, $encoding);
        }

        if ($asArray) {
            return $chars;
        } else {
            return join('', $chars);
        }
    }

    /**
     * Split a string of char codes into single char codes.
     *
     * @param string $charCodes
     * @return array
     */
    public function splitCharCodes($charCodes)
    {
        return str_split($charCodes);
    }
}