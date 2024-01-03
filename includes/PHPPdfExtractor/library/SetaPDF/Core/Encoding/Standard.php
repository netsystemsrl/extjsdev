<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Standard.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Implementation of the StandardEncoding
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Encoding_Standard
    implements SetaPDF_Core_Encoding_EncodingInterface
{
    static public $table = array(
        "\x00\x41" => "\x41", // A
        "\x00\xc6" => "\xe1", // AE
        "\x00\x42" => "\x42", // B
        "\x00\x43" => "\x43", // C
        "\x00\x44" => "\x44", // D
        "\x00\x45" => "\x45", // E
        "\x00\x46" => "\x46", // F
        "\x00\x47" => "\x47", // G
        "\x00\x48" => "\x48", // H
        "\x00\x49" => "\x49", // I
        "\x00\x4a" => "\x4a", // J
        "\x00\x4b" => "\x4b", // K
        "\x00\x4c" => "\x4c", // L
        "\x01\x41" => "\xe8", // Lslash
        "\x00\x4d" => "\x4d", // M
        "\x00\x4e" => "\x4e", // N
        "\x00\x4f" => "\x4f", // O
        "\x01\x52" => "\xea", // OE
        "\x00\xd8" => "\xe9", // Oslash
        "\x00\x50" => "\x50", // P
        "\x00\x51" => "\x51", // Q
        "\x00\x52" => "\x52", // R
        "\x00\x53" => "\x53", // S
        "\x00\x54" => "\x54", // T
        "\x00\x55" => "\x55", // U
        "\x00\x56" => "\x56", // V
        "\x00\x57" => "\x57", // W
        "\x00\x58" => "\x58", // X
        "\x00\x59" => "\x59", // Y
        "\x00\x5a" => "\x5a", // Z
        "\x00\x61" => "\x61", // a
        "\x00\xb4" => "\xc2", // acute
        "\x00\xe6" => "\xf1", // ae
        "\x00\x26" => "\x26", // ampersand
        "\x00\x5e" => "\x5e", // asciicircum
        "\x00\x7e" => "\x7e", // asciitilde
        "\x00\x2a" => "\x2a", // asterisk
        "\x00\x40" => "\x40", // at
        "\x00\x62" => "\x62", // b
        "\x00\x5c" => "\x5c", // backslash
        "\x00\x7c" => "\x7c", // bar
        "\x00\x7b" => "\x7b", // braceleft
        "\x00\x7d" => "\x7d", // braceright
        "\x00\x5b" => "\x5b", // bracketleft
        "\x00\x5d" => "\x5d", // bracketright
        "\x02\xd8" => "\xc6", // breve
        "\x20\x22" => "\xb7", // bullet
        "\x00\x63" => "\x63", // c
        "\x02\xc7" => "\xcf", // caron
        "\x00\xb8" => "\xcb", // cedilla
        "\x00\xa2" => "\xa2", // cent
        "\x02\xc6" => "\xc3", // circumflex
        "\x00\x3a" => "\x3a", // colon
        "\x00\x2c" => "\x2c", // comma
        "\x00\xa4" => "\xa8", // currency
        "\x00\x64" => "\x64", // d
        "\x20\x20" => "\xb2", // dagger
        "\x20\x21" => "\xb3", // daggerdbl
        "\x00\xa8" => "\xc8", // dieresis
        "\x00\x24" => "\x24", // dollar
        "\x02\xd9" => "\xc7", // dotaccent
        "\x01\x31" => "\xf5", // dotlessi
        "\x00\x65" => "\x65", // e
        "\x00\x38" => "\x38", // eight
        "\x20\x26" => "\xbc", // ellipsis
        "\x20\x14" => "\xd0", // emdash
        "\x20\x13" => "\xb1", // endash
        "\x00\x3d" => "\x3d", // equal
        "\x00\x21" => "\x21", // exclam
        "\x00\xa1" => "\xa1", // exclamdown
        "\x00\x66" => "\x66", // f
        "\xfb\x01" => "\xae", // fi
        "\x00\x35" => "\x35", // five
        "\xfb\x02" => "\xaf", // fl
        "\x01\x92" => "\xa6", // florin
        "\x00\x34" => "\x34", // four
        "\x20\x44" => "\xa4", // fraction
        "\x00\x67" => "\x67", // g
        "\x00\xdf" => "\xfb", // germandbls
        "\x00\x60" => "\xc1", // grave
        "\x00\x3e" => "\x3e", // greater
        "\x00\xab" => "\xab", // guillemotleft
        "\x00\xbb" => "\xbb", // guillemotright
        "\x20\x39" => "\xac", // guilsinglleft
        "\x20\x3a" => "\xad", // guilsinglright
        "\x00\x68" => "\x68", // h
        "\x02\xdd" => "\xcd", // hungarumlaut
        "\x00\x2d" => "\x2d", // hyphen
        "\x00\x69" => "\x69", // i
        "\x00\x6a" => "\x6a", // j
        "\x00\x6b" => "\x6b", // k
        "\x00\x6c" => "\x6c", // l
        "\x00\x3c" => "\x3c", // less
        "\x01\x42" => "\xf8", // lslash
        "\x00\x6d" => "\x6d", // m
        "\x00\xaf" => "\xc5", // macron
        "\x00\x6e" => "\x6e", // n
        "\x00\x39" => "\x39", // nine
        "\x00\x23" => "\x23", // numbersign
        "\x00\x6f" => "\x6f", // o
        "\x01\x53" => "\xfa", // oe
        "\x02\xdb" => "\xce", // ogonek
        "\x00\x31" => "\x31", // one
        "\x00\xaa" => "\xe3", // ordfeminine
        "\x00\xba" => "\xeb", // ordmasculine
        "\x00\xf8" => "\xf9", // oslash
        "\x00\x70" => "\x70", // p
        "\x00\xb6" => "\xb6", // paragraph
        "\x00\x28" => "\x28", // parenleft
        "\x00\x29" => "\x29", // parenright
        "\x00\x25" => "\x25", // percent
        "\x00\x2e" => "\x2e", // period
        "\x00\xb7" => "\xb4", // periodcentered
        "\x20\x30" => "\xbd", // perthousand
        "\x00\x2b" => "\x2b", // plus
        "\x00\x71" => "\x71", // q
        "\x00\x3f" => "\x3f", // question
        "\x00\xbf" => "\xbf", // questiondown
        "\x00\x22" => "\x22", // quotedbl
        "\x20\x1e" => "\xb9", // quotedblbase
        "\x20\x1c" => "\xaa", // quotedblleft
        "\x20\x1d" => "\xba", // quotedblright
        "\x20\x18" => "\x60", // quoteleft
        "\x20\x19" => "\x27", // quoteright
        "\x20\x1a" => "\xb8", // quotesinglbase
        "\x00\x27" => "\xa9", // quotesingle
        "\x00\x72" => "\x72", // r
        "\x02\xda" => "\xca", // ring
        "\x00\x73" => "\x73", // s
        "\x00\xa7" => "\xa7", // section
        "\x00\x3b" => "\x3b", // semicolon
        "\x00\x37" => "\x37", // seven
        "\x00\x36" => "\x36", // six
        "\x00\x2f" => "\x2f", // slash
        "\x00\x20" => "\x20", // space
        "\x00\xa3" => "\xa3", // sterling
        "\x00\x74" => "\x74", // t
        "\x00\x33" => "\x33", // three
        "\x02\xdc" => "\xc4", // tilde
        "\x00\x32" => "\x32", // two
        "\x00\x75" => "\x75", // u
        "\x00\x5f" => "\x5f", // underscore
        "\x00\x76" => "\x76", // v
        "\x00\x77" => "\x77", // w
        "\x00\x78" => "\x78", // x
        "\x00\x79" => "\x79", // y
        "\x00\xa5" => "\xa5", // yen
        "\x00\x7a" => "\x7a", // z
        "\x00\x30" => "\x30", // zero
    );

    /**
     * Returns the encoding table array.
     *
     * Keys are the unicode values while the values are the code points in the specific encoding.
     *
     * @see SetaPDF_Core_Encoding_EncodingInterface::getTable()
     * @return array
     */
    static public function getTable()
    {
        return self::$table;
    }

    /**
     * Converts a string from UTF-16BE to StandardEncoding.
     *
     * @param string $string The input string
     * @param boolean $ignore Characters that cannot be represented in the target charset are silently discarded
     * @param boolean $translit Transliteration activated
     * @return string
     */
    static public function fromUtf16Be($string, $ignore = false, $translit = false)
    {
        return SetaPDF_Core_Encoding::fromUtf16Be(
            self::$table, $string, $ignore, $translit
        );
    }

    /**
     * Converts a string from StandardEncoding to UTF-16BE.
     *
     * @param string $string The input string
     * @param boolean $ignore Characters that cannot be represented in the target charset are silently discarded
     * @param boolean $translit Transliteration activated
     * @return string
     */
    static public function toUtf16Be($string, $ignore = false, $translit = false)
    {
        return SetaPDF_Core_Encoding::toUtf16Be(
            self::$table, $string, $ignore, $translit
        );
    }
}