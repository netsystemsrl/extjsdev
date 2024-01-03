<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Type0.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * Class for Type0 fonts
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_Type0 extends SetaPDF_Core_Font
    implements SetaPDF_Core_Font_Glyph_Collection_CollectionInterface, SetaPDF_Core_Font_DescriptorInterface
{
    /**
     * @var SetaPDF_Core_Font_Descriptor
     */
    protected $_fontDescriptor;

    /**
     * @var SetaPDF_Core_Font_Cmap_CmapInterface
     */
    protected $_toUnicodeTable;

    /**
     * @var SetaPDF_Core_Font_Cmap
     */
    protected $_encodingTable;

    /**
     * Cache for width values
     *
     * @var array
     */
    protected $_widths = array();

    /**
     * Cache array for the splitCharCodes method.
     *
     * @var array
     */
    protected $_splitCharCodesCache = array();

    /**
     * The average width of glyphs in the font.
     *
     * @var integer|float
     */
    protected $_avgWidth = null;

    /**
     * The Calcilated font bounding box.
     *
     * @var array
     */
    protected $_calcedFontBBox;

    /**
     * The TTF/OTF parser of the embedded font file.
     *
     * @var SetaPDF_Core_Font_TrueType_File
     */
    protected $_streamParser = null;

    /**
     * Get the descandant font dictionary.
     *
     * In PDF there's only a single descendant font.
     *
     * @return SetaPDF_Core_Type_Dictionary
     */
    protected function _getDescendantFontDictionary()
    {
        $dictionary = $this->_dictionary->getValue('DescendantFonts')->ensure();
        return $dictionary->offsetGet(0)->ensure();
    }

    /**
     * Get the descendant font.
     *
     * @return SetaPDF_Core_Font_Cid
     * @throws SetaPDF_Exception_NotImplemented
     * @throws SetaPDF_Core_Font_Exception
     * @throws SetaPDF_Core_Type_IndirectReference_Exception
     */
    public function getDescendantFont()
    {
        /**
         * @var SetaPDF_Core_Type_Dictionary $dictionary
         */
        $dictionary = $this->_dictionary->getValue('DescendantFonts')->ensure();
        $fontObject = $dictionary->offsetGet(0);
        return SetaPDF_Core_Font::get($fontObject);
    }

    /**
     * Get the font descriptor object.
     *
     * @return SetaPDF_Core_Font_Descriptor
     * @throws SetaPDF_Exception_NotImplemented
     * @throws SetaPDF_Core_Font_Exception
     * @throws SetaPDF_Core_Type_IndirectReference_Exception
     */
    public function getFontDescriptor()
    {
        return $this->getDescendantFont()->getFontDescriptor();
    }

    /**
     * Get the char codes table of this font.
     *
     * @return SetaPDF_Core_Font_Cmap_CmapInterface|boolean
     * @throws SetaPDF_Core_Font_Exception
     * @internal
     */
    protected function _getCharCodesTable()
    {
        if (null === $this->_toUnicodeTable) {
            if ($this->_dictionary->offsetExists('ToUnicode')) {
                $toUnicodeStream = $this->_dictionary->getValue('ToUnicode')->ensure();

                if ($toUnicodeStream instanceof SetaPDF_Core_Type_Stream) {
                    $stream = $toUnicodeStream->getStream();
                    $this->_toUnicodeTable = SetaPDF_Core_Font_Cmap::create(new SetaPDF_Core_Reader_String($stream));
                    return $this->_toUnicodeTable;
                } elseif ($toUnicodeStream instanceof SetaPDF_Core_Type_Name) {
                    $name = $toUnicodeStream->getValue();
                    if ($name === 'Identity-H' || $name === 'Identity-V') {
                        $this->_toUnicodeTable = new SetaPDF_Core_Font_Cmap_Identity();
                        return $this->_toUnicodeTable;
                    }
                }
            }
        } else {
            return $this->_toUnicodeTable;
        }

        return false;
    }

    /**
     * Get the CMaps table for this font.
     *
     * @return array|SetaPDF_Core_Font_Cmap
     * @throws SetaPDF_Core_Font_Exception
     */
    protected function _getEncodingTable()
    {
        if (isset($this->_encodingTable)) {
            return $this->_encodingTable;
        }

        /**
         * If the font is a composite font that uses one of the predefined CMaps listed in Table 118 (except
         * Identity–H and Identity–V) or whose descendant CIDFont uses the Adobe-GB1, Adobe-CNS1, Adobe-Japan1,
         * or Adobe-Korea1 character collection:
         */
        $encodingCidMap = false;
        $encoding = null;
        if ($this->_dictionary->offsetExists('Encoding')) {
            $encoding = $this->_dictionary->getValue('Encoding')->ensure();
            try {
                if ($encoding instanceof SetaPDF_Core_Type_Name) {
                    $encodingCidMap = SetaPDF_Core_Font_Cmap::createNamed($encoding->getValue());
                } else if ($encoding instanceof SetaPDF_Core_Type_Stream) {
                    $stream         = $encoding->getStream();
                    $encodingCidMap = SetaPDF_Core_Font_Cmap::create(new SetaPDF_Core_Reader_String($stream));
                }
            } catch (InvalidArgumentException $e) {}
        }

        $descendantFont = $this->getDescendantFont();
        $cidSystemInfo = $descendantFont->getCidSystemInfo();
        $cidName = $cidSystemInfo['Registry']
            . '-'
            . $cidSystemInfo['Ordering']
            . '-UCS2';

        try {
            $map = SetaPDF_Core_Font_Cmap::createNamed($cidName);
            if ($encodingCidMap) {
                $map->setCidMap($encodingCidMap);
            }

            $this->_encodingTable = $map;
            return $map;

        } catch (InvalidArgumentException $e) {
            // no cid map was found
        }


        // fallback if no encoding/ToUnicode is defined
        if ($encodingCidMap) {
            $this->_encodingTable = $encodingCidMap;
        } else {
            $this->_encodingTable = [];
        }

        return $this->_encodingTable;
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
     * @return string|null
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
        return !(abs($fontWeight - 700) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION);
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
     * @param boolean $recalc Set to true, to re-calculate the font bounding box by analysing the metrics of all
     *                        embedded glyphs.
     * @return array
     */
    public function getFontBBox($recalc = false)
    {
        if ($recalc) {
            if ($this->_calcedFontBBox !== null) {
                return $this->_calcedFontBBox;
            }

            $parser = $this->getStreamParser();
            if ($parser) {
                /**
                 * @var SetaPDF_Core_Font_TrueType_Table_Header $headerTable
                 */
                $headerTable = $parser->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HEADER);
                $f = 1000 / $headerTable->getUnitsPerEm();
                $this->_calcedFontBBox = array_map(function($v) use ($f){
                    return $v * $f;
                }, $headerTable->getBoundingBox(true));

                return $this->_calcedFontBBox;
            }
        }

        return $this->getFontDescriptor()->getFontBBox();
    }

    /**
     * Get the TTF/OTF parser for the embedded font programm.
     *
     * @return bool|SetaPDF_Core_Font_TrueType_File
     */
    public function getStreamParser()
    {
        if (null === $this->_streamParser) {
            $fontFile2 = $this->getFontDescriptor()->getFontFile2();
            if ($fontFile2) {
                try {
                    $fontFile2 = new SetaPDF_Core_Reader_Binary(new SetaPDF_Core_Reader_String($fontFile2->getStream()));
                    $this->_streamParser = new SetaPDF_Core_Font_TrueType_File($fontFile2);
                } catch (SetaPDF_Exception_NotImplemented $e) {
                    return false;
                }
                // TODO FontFile3 / OTF
            } else {
                return false;
            }
        }

        return $this->_streamParser;
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
     * @throws SetaPDF_Exception_NotImplemented
     * @internal
     */
    public function getDescent()
    {
        return $this->getFontDescriptor()->getDescent();
    }

    /**
     * Get the missing glyph width.
     *
     * @return integer|float
     */
    public function getMissingWidth()
    {
        return $this->getDescendantFont()->getDefaultWidth();
    }

    /**
     * Get the average glyph width.
     *
     * @param boolean $calculateIfUndefined
     * @return integer|float
     */
    public function getAvgWidth($calculateIfUndefined = false)
    {
        $default = parent::getAvgWidth();
        $avgWidth = $this->getFontDescriptor()->getAvgWidth();

        if ($calculateIfUndefined && $default === $avgWidth) {
            if (isset($this->_avgWidth)) {
                return $this->_avgWidth;
            }

            $dictionary = $this->getDescendantFont()->getDictionary();
            $w = $dictionary->getValue('W');
            $allWidths = array();

            if (null !== $w) {
                $w = $w->ensure()->toPhp();
                for ($i = 0, $c = count($w); $i < $c;) {
                    if (is_array($w[$i + 1])) {
                        $i++; // simulate $start
                        $widths = $w[$i++];
                        foreach ($widths AS $width) {
                            $allWidths[] = $width;
                        }
                    } else {
                        $i += 2; // simulate $start and $end
                        $allWidths[] = $w[$i++];
                    }
                }
            }

            $allWidths = array_filter($allWidths);
            if (count($allWidths) === 0) {
                return $this->getMissingWidth();
            }

            $this->_avgWidth = $avgWidth = array_sum($allWidths) / count($allWidths);
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
     * Get the width of a glyph/character.
     *
     * @param string $char
     * @param string $encoding The input encoding
     * @return float|int
     * @throws SetaPDF_Exception_NotImplemented
     * @internal
     */
    public function getGlyphWidth($char, $encoding = 'UTF-16BE')
    {
        if ($encoding !== 'UTF-16BE')
            $char = SetaPDF_Core_Encoding::convert($char, $encoding, 'UTF-16BE');

        if (isset($this->_widths[$char])) {
            return $this->_widths[$char];
        }

        $table = $this->_getCharCodesTable();
        $cidMap = $encodingTable = $this->_getEncodingTable();
        if ($cidMap->getCidMap()) {
            $cidMap = $cidMap->getCidMap();
        }

        if ($table instanceof SetaPDF_Core_Font_Cmap_CmapInterface &&
            $cidMap instanceof SetaPDF_Core_Font_Cmap_CmapInterface
        ) {
            $src = $table->reverseLookup($char);
            if ($src === false) {
                $this->_widths[$char] = $this->getMissingWidth();
                return $this->_widths[$char];
            }

            $cid = $cidMap->lookupCid($src);

            if ($cid !== null) {
                if (is_string($cid)) {
                    if (strlen($cid) === 1) {
                        $cid = ord($cid);
                    } else {
                        $cid = SetaPDF_Core_Encoding::utf16BeToUnicodePoint($cid);
                    }
                }

                $this->_widths[$char] = $this->getDescendantFont()->getGlyphWidth($cid);
                return $this->_widths[$char];
            }

        // Let's try to get the width through the encoding table
        } elseif ($encodingTable instanceof SetaPDF_Core_Font_Cmap_CmapInterface) {
            $src = $encodingTable->reverseLookup($char);
            $cid = SetaPDF_Core_Encoding::utf16BeToUnicodePoint($src);
            $this->_widths[$char] = $this->getDescendantFont()->getGlyphWidth($cid);
            return $this->_widths[$char];
        }

        return $this->getMissingWidth();
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
            $this->_widthsByCharCode = array();
        }

        if (isset($this->_widthsByCharCode[$charCode])) {
            return $this->_widthsByCharCode[$charCode];
        }

        $cidMap = $this->_getEncodingTable();
        if ($cidMap->getCidMap()) {
            $cidMap = $cidMap->getCidMap();
        }

        if ($cidMap instanceof SetaPDF_Core_Font_Cmap_CmapInterface) {
            $cid = $cidMap->lookupCid($charCode);
            if (!$cid) {
                $cid = $charCode;
            }

            if ($cid !== null) {
                if (is_string($cid)) {
                    if (strlen($cid) === 1) {
                        $cid = ord($cid);
                    } else {
                        $cid = SetaPDF_Core_Encoding::utf16BeToUnicodePoint($cid);
                    }
                }

                $this->_widthsByCharCode[$charCode] = $this->getDescendantFont()->getGlyphWidth($cid);
                return $this->_widthsByCharCode[$charCode];
            }
        }

        return $this->getMissingWidth();
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
        foreach ($this->splitCharCodes($charCodes) AS $charCode) {
            $chars[] = $this->getCharByCharCode($charCode, $encoding);
        }

        if ($asArray) {
            return $chars;
        }

        return join('', $chars);
    }

    /**
     * Split a string of char codes into single char codes.
     *
     * @param string $charCodes
     * @return array
     */
    public function splitCharCodes($charCodes)
    {
        $strings = array();
        $table = $this->_getEncodingTable();

        for ($i = 0, $len = strlen($charCodes); $i < $len; $i++) {
            $string = $charCodes[$i];

            if (!isset($this->_splitCharCodesCache[$string])) {
                $this->_splitCharCodesCache[$string] = SetaPDF_Core_Encoding::toUtf16Be($table, $string, true, true);
            }

            $text = $this->_splitCharCodesCache[$string];

            if ('' === $text && $i < ($len - 1)) {
                $string .= $charCodes[++$i];
            }

            $strings[] = $string;
        }

        return $strings;
    }
}