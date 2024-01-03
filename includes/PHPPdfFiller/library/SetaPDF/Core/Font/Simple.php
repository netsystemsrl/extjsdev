<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Simple.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Abstract class for simple fonts.
 *
 * 9.5 Introduction to Font Data Structures:
 * "[...]Type 0 fonts are called composite fonts; other types of fonts are called simple fonts.[...]"
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Font_Simple extends SetaPDF_Core_Font
{
    /**
     * The encoding table
     *
     * @var array
     */
    protected $_encodingTable = null;

    /**
     * The map that maps character codes to uncidoe values
     *
     * @var array
     */
    protected $_toUnicodeTable = null;

    /**
     * The average width of glyphs in the font.
     *
     * @var integer|float
     */
    protected $_avgWidth;

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
                } elseif ($encoding instanceof SetaPDF_Core_Type_Dictionary) {
                    $baseEncoding = $encoding->offsetExists('BaseEncoding')
                        ? $encoding->offsetGet('BaseEncoding')->ensure()->toPhp()
                        : false;

                    $diff = $encoding->offsetExists('Differences')
                        ? $encoding->offsetGet('Differences')->ensure()->toPhp()
                        : array();
                }
            }

            if ($baseEncoding) {
                $baseEncoding = substr($baseEncoding, 0, strpos($baseEncoding, 'Encoding'));
                $className = 'SetaPDF_Core_Encoding_' . $baseEncoding;

                if (is_callable(array($className, 'getTable'))) {
                    $baseEncodingTable = call_user_func(array($className, 'getTable'));
                } else {
                    $baseEncodingTable = $this->getBaseEncodingTable();
                }
            } else {
                $baseEncodingTable = $this->getBaseEncodingTable();
            }

            $newBaseEncodingTable = array();

            $currentCharCode = null;
            $touchedChars = array();

            foreach ($diff AS $value) {
                if (is_float($value) || is_int($value)) {
                    $currentCharCode = $value;
                    continue;
                }

                $utf16BeCodePoint = SetaPDF_Core_Font_Glyph_List::byName(
                    $value,
                    $this instanceof SetaPDF_Core_Font_Standard_ZapfDingbats
                        ? SetaPDF_Core_Font_Glyph_List::LIST_ZDGL
                        : SetaPDF_Core_Font_Glyph_List::LIST_AGL
                );

                if ($utf16BeCodePoint !== '') {
                    $currentChar = chr($currentCharCode);
                    if (isset($newBaseEncodingTable[$utf16BeCodePoint])) {
                        if (!is_array($newBaseEncodingTable[$utf16BeCodePoint])) {
                            $newBaseEncodingTable[$utf16BeCodePoint] = array($newBaseEncodingTable[$utf16BeCodePoint]);
                        }
                        $newBaseEncodingTable[$utf16BeCodePoint][] = $currentChar;
                    } else {
                        $newBaseEncodingTable[$utf16BeCodePoint] = $currentChar;
                    }

                    $touchedChars[] = $currentChar;
                }
                $currentCharCode++;
            }

            // remove touched chars from existing encoding:
            foreach ($baseEncodingTable AS $uni => $value) {
                if (count($touchedChars) === 0) {
                    break;
                }

                foreach ($touchedChars AS $key => $charCode) {
                    if ($value === $charCode) {
                        unset($baseEncodingTable[$uni]);
                        unset($touchedChars[$key]);
                    } elseif (is_array($value)) {
                        foreach ($value AS $_key => $_value) {
                            if ($_value === $charCode) {
                                unset($baseEncodingTable[$uni][$_key]);
                                unset($touchedChars[$key]);
                            }
                        }

                        if (count($value) === 1) {
                            $value = current($value);
                        }
                    }
                }
            }

            foreach ($baseEncodingTable AS $key => $value) {
                if (!isset($newBaseEncodingTable[$key])) {
                    $newBaseEncodingTable[$key] = $value;
                } else {
                    if (!is_array($newBaseEncodingTable[$key])) {
                        $newBaseEncodingTable[$key] = array($newBaseEncodingTable[$key]);
                    }

                    if (is_array($value)) {
                        $newBaseEncodingTable[$key] = array_merge($newBaseEncodingTable[$key], $value);
                    } else {
                        $newBaseEncodingTable[$key][] = $value;
                    }
                }
            }

            $this->_encodingTable = $this->_sortByArray($newBaseEncodingTable);

            // Try to get the "?" as substitute character
            $this->_substituteCharacter = SetaPDF_Core_Encoding::fromUtf16Be($this->_encodingTable, "\x00\x3F", true);
        }

        return $this->_encodingTable;
    }

    /**
     * Sorts an array by shifting the array values to the top of the resulting array.
     *
     * @param $array
     * @return array
     */
    protected function _sortByArray($array)
    {
        $pre = array();
        $post = array();

        foreach ($array AS $k => $v) {
            if (is_array($v)) {
                $pre[$k] = $v;
            } else {
                $post[$k] = $v;
            }
        }

        return array_merge($pre, $post);
    }

    /**
     * Get the map that maps character codes to unicode values.
     *
     * @return SetaPDF_Core_Font_Cmap|array|false
     * @throws SetaPDF_Core_Font_Exception
     */
    protected function _getCharCodesTable()
    {
        if (null === $this->_toUnicodeTable) {
            if ($this->_dictionary->offsetExists('ToUnicode')) {
                /**
                 * @var SetaPDF_Core_Type_Stream $toUnicodeStream
                 */
                $toUnicodeStream = $this->_dictionary->getValue('ToUnicode')->ensure();

                if ($toUnicodeStream instanceof SetaPDF_Core_Type_Stream) {
                    $stream = $toUnicodeStream->getStream();
                    $this->_toUnicodeTable = SetaPDF_Core_Font_Cmap::create(new SetaPDF_Core_Reader_String($stream));

                    return $this->_toUnicodeTable;
                }
            }
        } else {
            return $this->_toUnicodeTable;
        }

        $encodingTable = $this->_getEncodingTable();
        if ($encodingTable) {
            return $encodingTable;
        }

        return false;
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
            if ($calculateIfUndefined === false)
                return parent::getAvgWidth();

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
     * Resolves the width values from the font descriptor and fills the {@link $_width}-array.
     */
    abstract protected function _getWidths();
}