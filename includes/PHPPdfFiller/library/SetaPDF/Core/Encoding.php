<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Encoding.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A wrapper class for handling PDF specific encodings
 *
 * This class is a wrapper around iconv/mb_*-functions to offer a transparent
 * support of PDF specific and independent, unknown encodings.
 *
 * By default the class will use mb functions if available. Otherwise it will fallback to iconv functions.
 * To use specific functions just set the static property:
 *
 * <code>
 * SetaPDF_Core_Encoding::setLibrary('mb');
 * // or
 * SetaPDF_Core_Encoding::setLibrary('iconv');
 * </code>
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Encoding
{
  /* PDF specific predefined encodings */

    /**
     * WinAnsiEncoding
     *
     * @var string
     */
    const WIN_ANSI = 'WinAnsiEncoding';

    /**
     * PDFDocEncoding
     *
     * @var string
     */
    const PDF_DOC = 'PDFDocEncoding';

    /**
     * StandardEncoding
     *
     * @var string
     */
    const STANDARD = 'StandardEncoding';

    /**
     * MacRomanEncoding
     *
     * @var string
     */
    const MAC_ROMAN = 'MacRomanEncoding';

    /**
     * MacExpertEncoding
     *
     * @var string
     */
    const MAX_EXPERT = 'MacExpertEncoding';

    /**
     * ZapfDingbats
     *
     * @var string
     */
    const ZAPF_DINGBATS = 'ZapfDingbats';

    /**
     * Symbol
     *
     * @var string
     */
    const SYMBOL = 'Symbol';

    /**
     * Library to use for conversion between encodings
     *
     * @var string
     */
    static public $library = null;

    /**
     * Set the library to use for multibyte string operations.
     *
     * @param string $library Possible values are 'mb' for mbstring functions or 'iconv' for iconv functions.
     */
    static public function setLibrary($library)
    {
        self::$library = $library;
    }

    /**
     * Get the library to use for multibyte string operations.
     *
     * If none is defined the method will check for the mbstring module and define it or iconv automatically.
     *
     * @return string
     */
    static public function getLibrary()
    {
        if (null !== self::$library)
            return self::$library;

        if (extension_loaded('mbstring')) {
            /* In some PHP versions (e.g. 5.3.1 on windows mbstring adds a BOM to
             * UTF-8 strings without instruction, so let's do a check, too:
             */
            if (
                mb_convert_encoding(
                    "\xFE\xFF\x00S\x00e\x00t\x00a\x00P\x00D\x00F", 'UTF-8', 'UTF-16'
                ) === 'SetaPDF')
            {
                self::$library = 'mb';
            }
        }

        if (null === self::$library) {
            self::$library = 'iconv';
        }

        return self::$library;
    }

    /**
     * Checks if an encoding is a PDF specific predefined encoding.
     *
     * @param string $encoding
     * @return boolean
     */
    static public function isPredefinedEncoding($encoding)
    {
        $encoding = str_replace('Encoding', '', $encoding);

        switch ($encoding) {
            case 'WinAnsi':
            case 'PDFDoc':
            case 'Standard':
            case 'MacRoman':
            case 'MacExpert':
            case 'ZapfDingbats':
            case 'Symbol':
                return true;
        }

        return false;
    }

    /**
     * Get the translation table of a predefined PDF specific encodings.
     *
     * @param string $encoding
     * @return array
     * @throws InvalidArgumentException
     */
    static public function getPredefinedEncodingTable($encoding)
    {
        $encoding = str_replace('Encoding', '', $encoding);

        switch ($encoding) {
            /** @noinspection PhpMissingBreakStatementInspection */
            case 'PDFDoc':
                $encoding = 'PdfDoc';
            case 'WinAnsi':
            case 'Standard':
            case 'MacRoman':
            case 'MacExpert':
            case 'ZapfDingbats':
            case 'Symbol':
                $className = 'SetaPDF_Core_Encoding_' . $encoding;
                return call_user_func(array($className, 'getTable'));
        }

        throw new InvalidArgumentException(
            sprintf('The encoding "%s" is not a predefined encoding.', $encoding)
        );
    }

    /**
     * Converts a string from one to another encoding.
     *
     * A kind of wrapper around iconv/mb_convert_encoding plus the separate processing of
     * PDF related encodings.
     *
     * @param string $string        The string to convert in $inEncoding
     * @param string $inEncoding    The "in"-encoding
     * @param string $outEncoding    The "out"-encoding
     * @return string
     */
    static public function convert($string, $inEncoding, $outEncoding)
    {
        $_outEncoding = explode('//', $outEncoding);

        $string = (string)$string;

        if ($inEncoding === $_outEncoding[0]) {
            return $string;
        }

        if (count($_outEncoding) > 1) {
            $ignore = in_array('IGNORE', $_outEncoding);
            $translit = in_array('TRANSLIT', $_outEncoding);
        } else {
            $ignore = $translit = false;
        }

        // IN
        switch ($inEncoding) {
            case 'PDFDoc':
            /** @noinspection PhpMissingBreakStatementInspection */
            case 'PDFDocEncoding':
                $inEncoding = 'PdfDoc';
            case 'PdfDoc':
            case 'Standard':
            case 'StandardEncoding':
            case 'MacRoman':
            case 'MacRomanEncoding':
            case 'WinAnsi':
            case 'WinAnsiEncoding':
            case 'MacExpert':
            case 'MacExpertEncoding':
                $inEncoding = str_replace('Encoding', '', $inEncoding);
                $className = 'SetaPDF_Core_Encoding_' . $inEncoding;
                $string = $className::toUtf16Be($string, $ignore, $translit);
                $inEncoding = 'UTF-16BE';
                break;
        }

        // OUT
        switch ($_outEncoding[0]) {
            case 'PDFDoc':
            /** @noinspection PhpMissingBreakStatementInspection */
            case 'PDFDocEncoding':
                $_outEncoding[0] = 'PdfDoc';
            case 'PdfDoc':
            case 'Standard':
            case 'StandardEncoding':
            case 'MacRoman':
            case 'MacRomanEncoding':
            case 'WinAnsi':
            case 'WinAnsiEncoding':
            case 'MacExpert':
            case 'MacExpertEncoding':
                if ($inEncoding !== 'UTF-16BE') {
                    if ('mb' === self::getLibrary()) {
                        $string = mb_convert_encoding($string, 'UTF-16BE', $inEncoding);
                    } else {
                        $string = iconv($inEncoding, 'UTF-16BE' . ($ignore ? '//IGNORE' : '') . ($translit ? '//TRANSLIT' : ''), $string);
                    }
                }

                $_outEncoding[0] = str_replace('Encoding', '', $_outEncoding[0]);
                $className = 'SetaPDF_Core_Encoding_' . $_outEncoding[0];
                return $className::fromUtf16Be($string, $ignore, $translit);

            default:
                if ($inEncoding === $_outEncoding[0]) {
                    return $string;
                }

                if ('mb' === self::getLibrary()) {
                    return mb_convert_encoding($string, $_outEncoding[0], $inEncoding);
                } else {
                    return iconv($inEncoding, implode('//', $_outEncoding), $string);
                }
        }
    }

    /**
     * Converts a PDF string (in PDFDocEncoding or UTF-16BE) to another encoding.
     *
     * This method automatically detects UTF-16BE encoding in the input string and
     * removes the BOM.
     *
     * @param string $string The string to convert in PDFDocEncoding or UTF-16BE
     * @param string $outEncoding The "out"-encoding
     * @return string
     */
    static public function convertPdfString($string, $outEncoding = 'UTF-8')
    {
        $inEncoding = 'PdfDoc';
        /* There are corrupted documents (for example created by "Microsoft® Word 2010")
         * which really uses UTF-16LE in metadata!
         */
        if (strpos($string, "\xFE\xFF") === 0 || strpos($string, "\xFF\xFE") === 0) {
            $inEncoding = 'UTF-16';
        }

        $outEncoding = str_replace('Encoding', '', $outEncoding);

        return self::convert($string, $inEncoding, $outEncoding);
    }

    /**
     * Converts a string into PdfDocEncoding or UTF-16BE.
     *
     * Actually directly converts to UTF-16BE to support unicode.
     * Method should be optimized to choose the correct encoding (PdfDoc or UTF-16BE)
     * depending on the characters used.
     *
     * @todo Implement auto-detection of needed encoding
     * @param string $string
     * @param string $inEncoding
     * @return string
     */
    static public function toPdfString($string, $inEncoding = 'UTF-8')
    {
        $utf16Be = self::convert($string, $inEncoding, 'UTF-16BE');
        return ($utf16Be ? "\xFE\xFF" : '') . $utf16Be;
    }

    /**
     * Converts a string from UTF-16BE to another predefined encoding.
     *
     * @param array|SetaPDF_Core_Font_Cmap_CmapInterface $table The translation table
     * @param string $string The input string
     * @param boolean $ignore Characters that cannot be represented in the target charset are silently discarded
     * @param boolean $translit Transliteration activated
     * @param string $substituteChar
     * @return string
     */
    static public function fromUtf16Be($table, $string, $ignore = false, $translit = false, $substituteChar = "\x1A")
    {
        $newString = '';

        $len = self::strlen($string, 'UTF-16BE');
        for ($i = 0; $i < $len; $i++) {
            $search = self::substr($string, $i, 1, 'UTF-16BE');

            if ($table instanceof SetaPDF_Core_Font_Cmap_CmapInterface) {
                $res = $table->lookup($search);
            } else {
                $res = isset($table[$search])
                    ? $table[$search]
                    : false;

                if (is_array($res)) {
                    $res = $res[0];
                }
            }

            if ($res !== false) {
                $newString .= $res;
            } else if ($ignore === false) {
                if ($translit === true) {
                    $newString .= $substituteChar;
                } else {
                    trigger_error(__METHOD__ . '(): Detected an illegal character in input string', E_USER_NOTICE);
                }
            }
        }

        return $newString;
    }

    /**
     * Converts a string to UTF-16BE from another predefined 1-byte encoding.
     *
     * @param array|SetaPDF_Core_Font_Cmap_CmapInterface $table The translation table
     * @param string $string The input string
     * @param boolean $ignore Characters that cannot be represented in the target charset are silently discarded
     * @param boolean $translit Transliteration activated
     * @return string
     */
    static public function toUtf16Be($table, $string, $ignore = false, $translit = false)
    {
        $newString = '';

        if ($table instanceof SetaPDF_Core_Font_Cmap_CmapInterface) {
            for ($i = 0, $len = strlen($string); $i < $len; $i += $size) {
                $size = 1;
                while (($res = $table->lookup(substr($string, $i, $size))) === false) {
                    $size++;
                    if ($size > strlen($string)) {
                        break;
                    }
                }

                if ($res !== false) {
                    $newString .= $res;
                } else if ($ignore === false) {
                    if ($translit === true) {
                        $newString .= "\xFF\xFD"; // REPLACEMENT CHARACTER
                    } else {
                        trigger_error(sprintf(__METHOD__ . '(): Detected an illegal character (0x%s) in input string (%s)', bin2hex($string[$i]), $string), E_USER_NOTICE);
                    }
                }
            }
        } else {
            /* TODO: We need to switch this array to an object which will cache the results automatically.
             *       This way it will be possible to remove the cache-arrays in the font objects.
             */
            for ($i = 0, $len = strlen($string); $i < $len; $i++) {
                $res = array_search($string[$i], $table, true);
                if ($res === false) {
                    foreach ($table AS $utf16 => $char) {
                        // The table is sorted, so that array'ed values are at the top
                        if (!is_array($char)) {
                            break;
                        }

                        if (in_array($string[$i], $char)) {
                            $res = $utf16;
                            break;
                        }
                    }
                }

                if ($res !== false) {
                    $newString .= $res;
                } else if ($ignore === false) {
                    // Check for control characters
                    if ($string[$i] <= "\x1F") {
                        $newString .= "\x00" . $string[$i];
                    } elseif ($translit === true) {
                        $newString .= "\xFF\xFD"; // REPLACEMENT CHARACTER
                    } else {
                        trigger_error(sprintf(__METHOD__ . '(): Detected an illegal character (0x%s) in input string (%s)', bin2hex($string[$i]), $string), E_USER_NOTICE);
                    }
                }
            }
        }

        return $newString;
    }

    /**
     * Converts an unicode point to UTF16Be.
     *
     * @param integer $unicodePoint
     * @return string
     */
    static public function unicodePointToUtf16Be($unicodePoint)
    {
        // UTF-32 to UTF-16BE mapping
        $unicode = SetaPDF_Core_BitConverter::formatToUInt32($unicodePoint);
        if ('mb' === self::getLibrary()) {
            return mb_convert_encoding($unicode, 'UTF-16BE', 'UTF-32BE');
        } else {
            return iconv('UTF-32BE', 'UTF-16BE', $unicode);
        }
    }

    /**
     * Converts a UTF16BE character to a unicode point.
     *
     * @param string $utf16
     * @return int|bool
     */
    static public function utf16BeToUnicodePoint($utf16)
    {
        if ('mb' === self::getLibrary()) {
            $utf32 = mb_convert_encoding($utf16, 'UTF-32BE', 'UTF-16BE');
        } else {
            $utf32 = iconv('UTF-16BE', 'UTF-32BE', $utf16);
        }

        if ('' === $utf32) {
            return false;
        }

        try {
            return SetaPDF_Core_BitConverter::formatFromUInt32($utf32);
        } catch (InvalidArgumentException $e) {
            return false;
        }
    }

    /**
     * Checks a string for UTF-16BE BOM.
     *
     * @param string $string
     * @return bool
     */
    static public function isUtf16Be($string)
    {
        return strpos($string, "\xFE\xFF") === 0;
    }

    /**
     * Get the length of a string in a specific encoding.
     *
     * @param string $string
     * @param string $encoding
     * @return int
     */
    static public function strlen($string, $encoding = 'UTF-8')
    {
        if (self::isPredefinedEncoding($encoding)) {
            return strlen($string);
        }

        if ('mb' === self::getLibrary()) {
            return mb_strlen($string, $encoding);
        } else {
            return iconv_strlen($string, $encoding);
        }
    }

    /**
     * Return part of a string.
     *
     * @param string $string
     * @param int $start
     * @param int $length
     * @param string $encoding
     * @return string|bool Returns false on error
     */
    static public function substr($string, $start, $length = null, $encoding = 'UTF-8')
    {
        if ($length === 0) {
            return "";
        }

        if (self::isPredefinedEncoding($encoding)) {
            return substr($string, $start, $length);
        }

        if ('mb' === self::getLibrary()) {
            $substr = mb_substr($string, $start, $length, $encoding);

            if ($substr === '') {
                return false;
            } else {
                return $substr;
            }
        } else {
            return iconv_substr($string, $start, $length,$encoding);
        }
    }

    /**
     * Splits a string into an array.
     *
     * @param $string
     * @param string $encoding
     * @return array
     */
    static public function strSplit($string, $encoding = 'UTF-8')
    {
        if (self::isPredefinedEncoding($encoding)) {
            return str_split($string);
        }

        $result = array();
        for ($i = 0, $length = self::strlen($string, $encoding); $i < $length; $i++) {
            $result[] = self::substr($string, $i, 1, $encoding);
        }

        return $result;
    }
}