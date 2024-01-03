<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Type3.php 1070 2017-07-13 11:59:19Z jan.slabon $
 */

/**
 * Class representing a Type3 font.
 *
 * This class is only useable by existing MMType1 fonts.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_Type3 extends SetaPDF_Core_Font
    implements SetaPDF_Core_Font_Glyph_Collection_CollectionInterface
{
    /**
     * The font name
     *
     * @var string
     */
    protected $_fontName;

    /**
     * The to unicode table.
     *
     * @var SetaPDF_Core_Font_Cmap
     */
    protected $_toUnicodeTable;

    /**
     * The encoding table.
     *
     * @var array
     */
    protected $_encodingTable;

    /**
     * Glyph widths
     *
     * @var array
     */
    protected $_widths;

    /**
     * The font bounding box
     *
     * @var array
     */
    protected $_fontBBox;

	/**
	 * The average width of glyphs in the font.
	 *
	 * @var integer|float
	 */
	protected $_avgWidth;

    /**
     * The font matrix
     *
     * @var SetaPDF_Core_Geometry_Matrix
     */
    protected $_fontMatrix;

	/**
	 * The font descriptor object
	 *
	 * @var SetaPDF_Core_Font_Descriptor
	 */
	protected $_fontDescriptor;

    /**
     * @return SetaPDF_Core_Font_Cmap|boolean
     * @throws SetaPDF_Exception_NotImplemented
     * @internal
     */
    protected function _getCharCodesTable()
    {
        if (null === $this->_toUnicodeTable) {
            if ($this->_dictionary->offsetExists('ToUnicode')) {
                $toUnicodeStream = $this->_dictionary->getValue('ToUnicode')->ensure();

                $stream = $toUnicodeStream->getStream();
                $this->_toUnicodeTable = SetaPDF_Core_Font_Cmap::create(new SetaPDF_Core_Reader_String($stream));

                return $this->_toUnicodeTable;
            }
        } else {
            return $this->_toUnicodeTable;
        }

        return false;
    }

    /**
     * Get the encoding table based on the Encoding dictionary and it's Differences entry (if available).
     *
     * @return array
     */
    protected function _getEncodingTable()
    {
        if (null === $this->_encodingTable) {
            /* 1. Check for an existing encoding which
             *    overwrites the fonts build in encoding
             */
            $baseEncoding = false;
            $diff = array();

            if ($this->_dictionary->offsetExists('Encoding')) {
                $encoding = $this->_dictionary->offsetGet('Encoding')->ensure();
                if ($encoding instanceof SetaPDF_Core_Type_Name) {
                    $baseEncoding = $encoding->getValue();
                    $diff = array();
                } else {
                    $baseEncoding = $encoding->offsetExists('BaseEncoding')
                        ? $encoding->offsetGet('BaseEncoding')->getValue()->toPhp()
                        : false;

                    $diff = $encoding->offsetExists('Differences')
                        ? $encoding->offsetGet('Differences')->getValue()->toPhp()
                        : array();
                }
            }

            if ($baseEncoding) {
                $baseEncoding = substr($baseEncoding, 0, strpos($baseEncoding, 'Encoding'));
                $className = 'SetaPDF_Core_Encoding_' . $baseEncoding;
                $baseEncodingTable = call_user_func(array($className, 'getTable'));
            } else {
                $baseEncodingTable = $this->getBaseEncodingTable();
            }

            $newBaseEncodingTable = array();

            $currentCharCode = null;
            foreach ($diff AS $value) {
                if (is_float($value) || is_int($value)) {
                    $currentCharCode = $value;
                    continue;
                }

                $utf16BeCodePoint = SetaPDF_Core_Font_Glyph_List::byName($value);
                if ($utf16BeCodePoint !== '') {
                    $newBaseEncodingTable[$utf16BeCodePoint] = chr($currentCharCode);
                }
                $currentCharCode++;
            }

            foreach ($baseEncodingTable AS $key => $value) {
                if (!isset($newBaseEncodingTable[$key])) {
                    $newBaseEncodingTable[$key] = $value;
                }
            }

            $this->_encodingTable = $newBaseEncodingTable;

            // Try to get the "?" as substitute character
            $this->_substituteCharacter = SetaPDF_Core_Encoding::fromUtf16Be($this->_encodingTable, "\x00\x3F", true);
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
        if (null === $this->_fontName) {
            if ($this->_dictionary->offsetExists('Name')) {
                $this->_fontName = $this->_dictionary->offsetGet('Name')->ensure()->getValue();
            } elseif ($this->_dictionary->offsetExists('BaseFont')) {
                $this->_fontName = $this->_dictionary->offsetGet('BaseFont')->ensure()->getValue();
            }
        }

        return $this->_fontName;
    }

    /**
     * Get the font family.
     *
     * @return false A type 3 font does not have a font family.
     */
    public function getFontFamily()
    {
        return false;
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
        try {
            return $this->getFontDescriptor()->getItalicAngle() != 0;
        } catch (SetaPDF_Core_Font_Exception $e) {
            return false;
        }
    }

    /**
     * Checks if the font is monospace.
     *
     * @return boolean
     */
    public function isMonospace()
    {
        try {
            return ($this->getFontDescriptor()->getFlags() & 1) == 1;
        } catch (SetaPDF_Core_Font_Exception $e) {
            return false;
        }
    }

    /**
     * Get the font matrix.
     *
     * @return SetaPDF_Core_Geometry_Matrix
     * @throws SetaPDF_Core_Exception
     */
    public function getFontMatrix()
    {
        if (null === $this->_fontMatrix) {
            $fontMatrix = $this->_dictionary->getValue('FontMatrix');
            if (!$fontMatrix) {
                throw new SetaPDF_Core_Exception('No FontMatrix entry found!');
            }

            $fontMatrix = $fontMatrix->ensure()->toPhp();
            $this->_fontMatrix = new SetaPDF_Core_Geometry_Matrix($fontMatrix);
        }

        return $this->_fontMatrix;
    }

    /**
     * Returns the font bounding box.
     *
     * @param boolean $recalc Set to true, to re-calculate the font bounding box by analysing the metrics of all
     *                        embedded glyphs.
     * @return array
     * @throws SetaPDF_Core_Exception
     * @internal
     */
    public function getFontBBox($recalc = false)
    {
        if ($recalc) {
            if ($this->_fontBBox !== null) {
                return $this->_fontBBox;
            }

            $procs = $this->_dictionary->getValue('CharProcs')->ensure();
            $llx = $lly = $urx = $ury = 0;

            foreach ($procs AS $proc) {
                $stream = substr($proc->ensure()->getStream(), 0, 35);
                $parser = new SetaPDF_Core_Parser_Content($stream);
                $parser->registerOperator('d0', function($args) use (&$llx, &$lly, &$urx, &$ury) {
                    $urx = max($urx, $llx + $args[0]->getValue());
                    $ury = max($ury, $lly + $args[1]->getValue());
                });

                $parser->registerOperator('d1', function($args) use (&$llx, &$lly, &$urx, &$ury) {
                    $llx = min($llx, $args[2]->getValue());
                    $lly = min($lly, $args[3]->getValue());
                    $urx = max($urx, $args[4]->getValue());
                    $ury = max($ury, $args[5]->getValue());
                });

                $parser->process();
            }

            $this->_fontBBox = [$llx, $lly, $urx, $ury];

            return $this->_fontBBox;
        }

        $fontBBox = $this->_dictionary->getValue('FontBBox');
        if (!$fontBBox) {
            throw new SetaPDF_Core_Exception('No FontBBox entry found!');
        }

        return $fontBBox->ensure()->toPhp();
    }

	/**
	 * Get the font descriptor object.
	 *
	 * @return SetaPDF_Core_Font_Descriptor
	 */
	public function getFontDescriptor()
	{
		if (null === $this->_fontDescriptor) {
			if ($this->_dictionary->offsetExists('FontDescriptor')) {
				$value = $this->_dictionary->offsetGet('FontDescriptor')->ensure();
			} else {
				$value = new SetaPDF_Core_Type_Dictionary();
			}

			$this->_fontDescriptor = new SetaPDF_Core_Font_Descriptor($value);
		}

		return $this->_fontDescriptor;
	}

    /**
     * Returns the italic angle.
     *
     * @return float
     */
    public function getItalicAngle()
    {
    	try {
        	return $this->getFontDescriptor()->getItalicAngle();
		} catch (SetaPDF_Core_Font_Exception $e) {
    		return 0;
		}
    }

    /**
     * Returns the distance from baseline of highest ascender (Typographic ascent).
     *
     * @return float|false
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
	 * Get the average glyph width.
	 *
	 * @param boolean $calculateIfUndefined
	 * @return integer|float
	 */
	public function getAvgWidth($calculateIfUndefined = false)
	{
		if (null === $this->_avgWidth) {
			$avgWidth = $this->getFontDescriptor()->getAvgWidth();
			if ($calculateIfUndefined === false || ($calculateIfUndefined && $avgWidth !== parent::getAvgWidth()))
				return $avgWidth;

			if (null === $this->_widths) {
				$this->_getWidths();
			}

			$widths = array_filter($this->_widths);
			if (count($widths) === 0) {
				return $this->getMissingWidth();
			}

			$this->_avgWidth = array_sum($widths) / count($widths);
		}

		return $this->_avgWidth;
	}

	/**
	 * Get the max. glyph width.
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
        $widths = $this->_dictionary->offsetGet('Widths')->ensure()->toPhp();

        $table = $this->_getCharCodesTable();
        if ($table === false) {
            $table = $this->_getEncodingTable();
        }

        $this->_widths = array();
        $this->_widthsByCharCode = array();

        for ($i = $firstChar ; $i <= $lastChar; $i++) {
            $charCode = chr($i);
            $width = $widths[$i - $firstChar];

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
     * Converts char codes from the font specific encoding to another encoding.
     *
     * @param string $charCodes The char codes in the font specific encoding.
     * @param string $encoding The resulting encoding
     * @param bool $asArray
     * @return string|array
     */
    public function getCharsByCharCodes($charCodes, $encoding = 'UTF-8', $asArray = true)
    {
        $table = $this->_getCharCodesTable();
        if ($table === false) {
            $table = $this->_getEncodingTable();
        }

        $chars = SetaPDF_Core_Encoding::toUtf16Be($table, $charCodes, false, true);

        if ($encoding !== 'UTF-16BE')
            $chars = SetaPDF_Core_Encoding::convert($chars, 'UTF-16BE', $encoding);

        if ($asArray) {
            $chars = SetaPDF_Core_Encoding::strSplit($chars, $encoding);
        }

        return $chars;
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