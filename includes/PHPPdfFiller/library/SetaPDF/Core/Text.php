<?php
/**
 * This file is part of the SetaPDF-FormFiller Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Text
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Text.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Helper class for writing and handling text
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Text
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Text
{
    /**
     * Alignment constant
     *
     * @var string
     */
    const ALIGN_LEFT = 'left';

    /**
     * Alignment constant
     *
     * @var string
     */
    const ALIGN_CENTER = 'center';

    /**
     * Alignment constant
     *
     * @var string
     */
    const ALIGN_RIGHT = 'right';

    /**
     * Alignment constant
     *
     * @var string
     */
    const ALIGN_JUSTIFY = 'justify';

    /**
     * Delimiter characters to recognize text blocks
     *
     * Value 0 means that the character prefer breaking after that character e.g. ! or ?
     *
     * Value 1 means that the character prefer breaking before that character e.g. + or :
     *
     * @var array
     */
    static public $possibleDelimiter = array(
        // 0 = right breaking

        // these have some special handling
        "\x00\x20" => 0, // space
        "\x00\x25" => 0, // % percentage sign - has a different behaviour if the previous character is a number

        "\x00\x21" => 0, // !
        "\x00\x3F" => 0, // ?
        "\x00\x7C" => 0, // |
        "\x00\x3A" => 0, // :
        "\x00\x3B" => 0, // ;
        "\x00\x29" => 0, // )
        "\x00\x7D" => 0, // }
        "\x00\x5D" => 0, // ]
        "\x20\x13" => 0, // – en dash
        "\x20\x14" => 0, // — em dash

        // 1 = left breaking
        "\x00\x2B" => 1, // +
        "\x00\x28" => 1, // (
        "\x00\x7B" => 1, // {
        "\x00\x5B" => 1, // [
        "\x00\xB4" => 1, // ´ Acute accent

        // currencies
        "\x00\x24" => 1, // $ DOLLAR SIGN
        "\x00\xA2" => 1, // ¢ CENT SIGN
        "\x00\xA3" => 1, // £ POUND SIGN
        "\x00\xA4" => 1, // ¤ CURRENCY SIGN
        "\x00\xA5" => 1, // ¥ YEN SIGN
        "\x05\x8F" => 1, //  ARMENIAN DRAM SIGN
        "\x06\x0B" => 1, // ؋ AFGHANI SIGN
        "\x09\xF2" => 1, // ৲ BENGALI RUPEE MARK
        "\x09\xF3" => 1, // ৳ BENGALI RUPEE SIGN
        "\x09\xFB" => 1, //  BENGALI GANDA MARK
        "\x0A\xF1" => 1, //  GUJARATI RUPEE SIGN
        "\x0B\xF9" => 1, // ௹ TAMIL RUPEE SIGN
        "\x0E\x3F" => 1, // ฿ THAI CURRENCY SYMBOL BAHT
        "\x17\xDB" => 1, // ៛ KHMER CURRENCY SYMBOL RIEL
        "\x20\xA0" => 1, // ₠ EURO-CURRENCY SIGN
        "\x20\xA1" => 1, // ₡ COLON SIGN
        "\x20\xA2" => 1, // ₢ CRUZEIRO SIGN
        "\x20\xA3" => 1, // ₣ FRENCH FRANC SIGN
        "\x20\xA4" => 1, // ₤ LIRA SIGN
        "\x20\xA5" => 1, // ₥ MILL SIGN
        "\x20\xA6" => 1, // ₦ NAIRA SIGN
        "\x20\xA7" => 1, // ₧ PESETA SIGN
        "\x20\xA8" => 1, // ₨ RUPEE SIGN
        "\x20\xA9" => 1, // ₩ WON SIGN
        "\x20\xAA" => 1, // ₪ NEW SHEQEL SIGN
        "\x20\xAB" => 1, // ₫ DONG SIGN
        "\x20\xAC" => 1, // € EURO SIGN
        "\x20\xAD" => 1, // ₭ KIP SIGN
        "\x20\xAE" => 1, // ₮ TUGRIK SIGN
        "\x20\xAF" => 1, // ₯ DRACHMA SIGN
        "\x20\xB0" => 1, // ₰ GERMAN PENNY SIGN
        "\x20\xB1" => 1, // ₱ PESO SIGN
        "\x20\xB2" => 1, // ₲ GUARANI SIGN
        "\x20\xB3" => 1, // ₳ AUSTRAL SIGN
        "\x20\xB4" => 1, // ₴ HRYVNIA SIGN
        "\x20\xB5" => 1, // ₵ CEDI SIGN
        "\x20\xB6" => 1, //  LIVRE TOURNOIS SIGN
        "\x20\xB7" => 1, //  SPESMILO SIGN
        "\x20\xB8" => 1, // ₸ TENGE SIGN
        "\x20\xB9" => 1, // ₹ INDIAN RUPEE SIGN
        "\x20\xBA" => 1, //  TURKISH LIRA SIGN
        "\x20\xBB" => 1, //  NORDIC MARK SIGN
        "\x20\xBC" => 1, //  MANAT SIGN
        "\x20\xBD" => 1, //  RUBLE SIGN
    );

    /**
     * Characters that can ignore the delimiters and 'glues' multiple textblocks together
     *
     * @var array
     */
    static public $possibleGlueCharacters = array(
        "\x00\x22" => true, // " double quotes
        "\x00\x27" => true, // ' single quote
        "\x00\x2C" => true, // , comma
        "\x00\x2D" => true, // - minus sign
        "\x00\x2E" => true, // . period
        "\x00\x2F" => true, // / slash
    );

    /**
     * Splits a UTF-16BE encoded string into lines based on a specific font and width.
     *
     * @param string $text The text encoded in UTF-16BE
     * @param float $width
     * @param SetaPDF_Core_Font_Glyph_Collection_CollectionInterface $font
     * @param float $fontSize
     * @param int $charSpacing
     * @param int $wordSpacing
     * @return array An array of UTF-16BE encoded strings
     * @throws InvalidArgumentException
     */
    static public function getLines(
        $text,
        $width = null,
        SetaPDF_Core_Font_Glyph_Collection_CollectionInterface $font = null,
        $fontSize = null,
        $charSpacing = 0,
        $wordSpacing = 0
    )
    {
        if ($width === null) {
            return explode("\x00\x0a", $text);
        }

        if ($font === null || $fontSize === null) {
            throw new InvalidArgumentException('Both font instance and font size is required.');
        }

        $currentLine = 0;
        $lines = array(0 => '');
        $lineWidth = 0;
        $linePosition = 0;
        $lastDelimiterPos = null;
        $lastDelimiterDirection = null;
        $lastChar = null;

        $len = SetaPDF_Core_Encoding::strlen($text, 'UTF-16BE');
        $nextChar = SetaPDF_Core_Encoding::substr($text, 0, 1, 'UTF-16BE');
        for ($i = 0; $i < $len; $i++) {
            $char = $nextChar;
            $nextChar = SetaPDF_Core_Encoding::substr($text, $i + 1, 1, 'UTF-16BE');

            if ($char == "\x00\x0a") {
                $lines[++$currentLine] = '';
                $lineWidth = 0;
                $linePosition = 0;
                $lastDelimiterPos = null;
                continue;
            }

            if (
                (
                    "\x00\x20" === $char
                    || (isset(self::$possibleDelimiter[$char]) && 1 === self::$possibleDelimiter[$char])
                    || (isset(self::$possibleDelimiter[$char]) && (
                        ($lastDelimiterPos === null && (
                                $nextChar === false || !isset(self::$possibleGlueCharacters[$nextChar])
                        )
                        || $lastDelimiterPos === ($linePosition - 1)))
                    )
                    || ("\x00\x25" === $char && (
                            $lastChar === null || $lastChar[0] !== "\x00" || !ctype_digit($lastChar[1])
                        )
                    )
                ) && ($lastChar === null || !isset(self::$possibleGlueCharacters[$lastChar]))
            ) {
                $lastDelimiterPos = $linePosition;
                $lastDelimiterDirection = self::$possibleDelimiter[$char];
            }

            $charWidth = $font->getGlyphWidth($char) / 1000 * $fontSize;

            if (
                $char !== "\x00\x20"
                && (abs($charWidth + $lineWidth) - $width > SetaPDF_Core::FLOAT_COMPARISON_PRECISION)
            ) {
                if (0 === $i) {
                    throw new InvalidArgumentException(
                        sprintf(
                            'A single character (%s) does not fits into the given $width (%F).',
                            SetaPDF_Core_Encoding::convert($char, 'UTF-16BE', 'UTF-8'),
                            $width
                        )
                    );
                }

                // If no delimiter exists in the current line, simply add a line break
                if (is_null($lastDelimiterPos)) {
                    $lines[++$currentLine] = '';
                    $lineWidth = 0;
                    $linePosition = 0;

                    // Else cut the last "word" and shift it to the next line
                } else {
                    // save last "word"
                    $tmpLine = SetaPDF_Core_Encoding::substr(
                        $lines[$currentLine],
                        $lastDelimiterPos + ($lastDelimiterDirection == 1 ? 0 : 1),
                        SetaPDF_Core_Encoding::strlen($lines[$currentLine], 'UTF-16BE'),
                        'UTF-16BE'
                    );

                    // Remove last "word"
                    $lines[$currentLine] = SetaPDF_Core_Encoding::substr(
                        $lines[$currentLine],
                        0,
                        $lastDelimiterPos + ($lastDelimiterDirection == 1 ? 0 : 1),
                        'UTF-16BE'
                    );

                    // Init next line with the last "word" of the previous line
                    $lines[++$currentLine] = $tmpLine;
                    $lineWidth = $font->getGlyphsWidth($tmpLine) / 1000 * $fontSize;
                    $linePosition = SetaPDF_Core_Encoding::strlen($tmpLine, 'UTF-16BE');
                    if ($charSpacing != 0)
                        $lineWidth += $linePosition * $charSpacing;

                    if (isset(self::$possibleDelimiter[$char]) && 0 === self::$possibleDelimiter[$char]) {
                        $lastDelimiterPos = $linePosition;
                        $lastDelimiterDirection = self::$possibleDelimiter[$char];
                    } else {
                        $lastDelimiterPos = null;
                    }
                }
            }

            if (
                $linePosition > 0
                && (
                    (isset(self::$possibleDelimiter[$char]) && 0 === self::$possibleDelimiter[$char])
                    || (
                        "\x00\x25" === $char && $lastChar !== null
                        && $lastChar[0] === "\x00" && ctype_digit($lastChar[1])
                    )
                )
                && ($nextChar === false  || !isset(self::$possibleGlueCharacters[$nextChar]))
            ) {
                $lastDelimiterPos = $linePosition;
                $lastDelimiterDirection = 0;
            }

            if ($wordSpacing != 0 && $char === "\x00\x20") {
                $lineWidth += $wordSpacing;
            }

            if ($charSpacing != 0) {
                $lineWidth += $charSpacing;
            }

            $lineWidth += $charWidth;
            $lines[$currentLine] .= $char;

            $linePosition++;
            $lastChar = $char;
        }

        return $lines;
    }

    /**
     * Normalizes line breaks in an UTF-16BE encoded string.
     *
     * \r\n to \n
     * \r to \n
     *
     * @param string $text
     * @return string
     */
    static public function normalizeLineBreaks($text)
    {
        return str_replace(["\x00\x0d\x00\x0a", "\x00\x0d"], "\x00\x0a", $text);
    }
}