<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: MacRoman.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Implementation of the MacRomanEncoding
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Encoding_MacRoman
    implements SetaPDF_Core_Encoding_EncodingInterface
{
    static public $table = array(
        "\x00\x20" => array("\x20", "\xca"), // space
        "\x00\x41" => "\x41", // A
        "\x00\xc6" => "\xae", // AE
        "\x00\xc1" => "\xe7", // Aacute
        "\x00\xc2" => "\xe5", // Acircumflex
        "\x00\xc4" => "\x80", // Adieresis
        "\x00\xc0" => "\xcb", // Agrave
        "\x00\xc5" => "\x81", // Aring
        "\x00\xc3" => "\xcc", // Atilde
        "\x00\x42" => "\x42", // B
        "\x00\x43" => "\x43", // C
        "\x00\xc7" => "\x82", // Ccedilla
        "\x00\x44" => "\x44", // D
        "\x00\x45" => "\x45", // E
        "\x00\xc9" => "\x83", // Eacute
        "\x00\xca" => "\xe6", // Ecircumflex
        "\x00\xcb" => "\xe8", // Edieresis
        "\x00\xc8" => "\xe9", // Egrave
        "\x00\x46" => "\x46", // F
        "\x00\x47" => "\x47", // G
        "\x00\x48" => "\x48", // H
        "\x00\x49" => "\x49", // I
        "\x00\xcd" => "\xea", // Iacute
        "\x00\xce" => "\xeb", // Icircumflex
        "\x00\xcf" => "\xec", // Idieresis
        "\x00\xcc" => "\xed", // Igrave
        "\x00\x4a" => "\x4a", // J
        "\x00\x4b" => "\x4b", // K
        "\x00\x4c" => "\x4c", // L
        "\x00\x4d" => "\x4d", // M
        "\x00\x4e" => "\x4e", // N
        "\x00\xd1" => "\x84", // Ntilde
        "\x00\x4f" => "\x4f", // O
        "\x01\x52" => "\xce", // OE
        "\x00\xd3" => "\xee", // Oacute
        "\x00\xd4" => "\xef", // Ocircumflex
        "\x00\xd6" => "\x85", // Odieresis
        "\x00\xd2" => "\xf1", // Ograve
        "\x00\xd8" => "\xaf", // Oslash
        "\x00\xd5" => "\xcd", // Otilde
        "\x00\x50" => "\x50", // P
        "\x00\x51" => "\x51", // Q
        "\x00\x52" => "\x52", // R
        "\x00\x53" => "\x53", // S
        "\x00\x54" => "\x54", // T
        "\x00\x55" => "\x55", // U
        "\x00\xda" => "\xf2", // Uacute
        "\x00\xdb" => "\xf3", // Ucircumflex
        "\x00\xdc" => "\x86", // Udieresis
        "\x00\xd9" => "\xf4", // Ugrave
        "\x00\x56" => "\x56", // V
        "\x00\x57" => "\x57", // W
        "\x00\x58" => "\x58", // X
        "\x00\x59" => "\x59", // Y
        "\x01\x78" => "\xd9", // Ydieresis
        "\x00\x5a" => "\x5a", // Z
        "\x00\x61" => "\x61", // a
        "\x00\xe1" => "\x87", // aacute
        "\x00\xe2" => "\x89", // acircumflex
        "\x00\xb4" => "\xab", // acute
        "\x00\xe4" => "\x8a", // adieresis
        "\x00\xe6" => "\xbe", // ae
        "\x00\xe0" => "\x88", // agrave
        "\x00\x26" => "\x26", // ampersand
        "\x00\xe5" => "\x8c", // aring
        "\x00\x5e" => "\x5e", // asciicircum
        "\x00\x7e" => "\x7e", // asciitilde
        "\x00\x2a" => "\x2a", // asterisk
        "\x00\x40" => "\x40", // at
        "\x00\xe3" => "\x8b", // atilde
        "\x00\x62" => "\x62", // b
        "\x00\x5c" => "\x5c", // backslash
        "\x00\x7c" => "\x7c", // bar
        "\x00\x7b" => "\x7b", // braceleft
        "\x00\x7d" => "\x7d", // braceright
        "\x00\x5b" => "\x5b", // bracketleft
        "\x00\x5d" => "\x5d", // bracketright
        "\x02\xd8" => "\xf9", // breve
        "\x20\x22" => "\xa5", // bullet
        "\x00\x63" => "\x63", // c
        "\x02\xc7" => "\xff", // caron
        "\x00\xe7" => "\x8d", // ccedilla
        "\x00\xb8" => "\xfc", // cedilla
        "\x00\xa2" => "\xa2", // cent
        "\x02\xc6" => "\xf6", // circumflex
        "\x00\x3a" => "\x3a", // colon
        "\x00\x2c" => "\x2c", // comma
        "\x00\xa9" => "\xa9", // copyright
        "\x00\xa4" => "\xdb", // currency
        "\x00\x64" => "\x64", // d
        "\x20\x20" => "\xa0", // dagger
        "\x20\x21" => "\xe0", // daggerdbl
        "\x00\xb0" => "\xa1", // degree
        "\x00\xa8" => "\xac", // dieresis
        "\x00\xf7" => "\xd6", // divide
        "\x00\x24" => "\x24", // dollar
        "\x02\xd9" => "\xfa", // dotaccent
        "\x01\x31" => "\xf5", // dotlessi
        "\x00\x65" => "\x65", // e
        "\x00\xe9" => "\x8e", // eacute
        "\x00\xea" => "\x90", // ecircumflex
        "\x00\xeb" => "\x91", // edieresis
        "\x00\xe8" => "\x8f", // egrave
        "\x00\x38" => "\x38", // eight
        "\x20\x26" => "\xc9", // ellipsis
        "\x20\x14" => "\xd1", // emdash
        "\x20\x13" => "\xd0", // endash
        "\x00\x3d" => "\x3d", // equal
        "\x00\x21" => "\x21", // exclam
        "\x00\xa1" => "\xc1", // exclamdown
        "\x00\x66" => "\x66", // f
        "\xfb\x01" => "\xde", // fi
        "\x00\x35" => "\x35", // five
        "\xfb\x02" => "\xdf", // fl
        "\x01\x92" => "\xc4", // florin
        "\x00\x34" => "\x34", // four
        "\x20\x44" => "\xda", // fraction
        "\x00\x67" => "\x67", // g
        "\x00\xdf" => "\xa7", // germandbls
        "\x00\x60" => "\x60", // grave
        "\x00\x3e" => "\x3e", // greater
        "\x00\xab" => "\xc7", // guillemotleft
        "\x00\xbb" => "\xc8", // guillemotright
        "\x20\x39" => "\xdc", // guilsinglleft
        "\x20\x3a" => "\xdd", // guilsinglright
        "\x00\x68" => "\x68", // h
        "\x02\xdd" => "\xfd", // hungarumlaut
        "\x00\x2d" => "\x2d", // hyphen
        "\x00\x69" => "\x69", // i
        "\x00\xed" => "\x92", // iacute
        "\x00\xee" => "\x94", // icircumflex
        "\x00\xef" => "\x95", // idieresis
        "\x00\xec" => "\x93", // igrave
        "\x00\x6a" => "\x6a", // j
        "\x00\x6b" => "\x6b", // k
        "\x00\x6c" => "\x6c", // l
        "\x00\x3c" => "\x3c", // less
        "\x00\xac" => "\xc2", // logicalnot
        "\x00\x6d" => "\x6d", // m
        "\x00\xaf" => "\xf8", // macron
        "\x00\xb5" => "\xb5", // mu
        "\x00\x6e" => "\x6e", // n
        "\x00\x39" => "\x39", // nine
        "\x00\xf1" => "\x96", // ntilde
        "\x00\x23" => "\x23", // numbersign
        "\x00\x6f" => "\x6f", // o
        "\x00\xf3" => "\x97", // oacute
        "\x00\xf4" => "\x99", // ocircumflex
        "\x00\xf6" => "\x9a", // odieresis
        "\x01\x53" => "\xcf", // oe
        "\x02\xdb" => "\xfe", // ogonek
        "\x00\xf2" => "\x98", // ograve
        "\x00\x31" => "\x31", // one
        "\x00\xaa" => "\xbb", // ordfeminine
        "\x00\xba" => "\xbc", // ordmasculine
        "\x00\xf8" => "\xbf", // oslash
        "\x00\xf5" => "\x9b", // otilde
        "\x00\x70" => "\x70", // p
        "\x00\xb6" => "\xa6", // paragraph
        "\x00\x28" => "\x28", // parenleft
        "\x00\x29" => "\x29", // parenright
        "\x00\x25" => "\x25", // percent
        "\x00\x2e" => "\x2e", // period
        "\x00\xb7" => "\xe1", // periodcentered
        "\x20\x30" => "\xe4", // perthousand
        "\x00\x2b" => "\x2b", // plus
        "\x00\xb1" => "\xb1", // plusminus
        "\x00\x71" => "\x71", // q
        "\x00\x3f" => "\x3f", // question
        "\x00\xbf" => "\xc0", // questiondown
        "\x00\x22" => "\x22", // quotedbl
        "\x20\x1e" => "\xe3", // quotedblbase
        "\x20\x1c" => "\xd2", // quotedblleft
        "\x20\x1d" => "\xd3", // quotedblright
        "\x20\x18" => "\xd4", // quoteleft
        "\x20\x19" => "\xd5", // quoteright
        "\x20\x1a" => "\xe2", // quotesinglbase
        "\x00\x27" => "\x27", // quotesingle
        "\x00\x72" => "\x72", // r
        "\x00\xae" => "\xa8", // registered
        "\x02\xda" => "\xfb", // ring
        "\x00\x73" => "\x73", // s
        "\x00\xa7" => "\xa4", // section
        "\x00\x3b" => "\x3b", // semicolon
        "\x00\x37" => "\x37", // seven
        "\x00\x36" => "\x36", // six
        "\x00\x2f" => "\x2f", // slash
        "\x00\xa3" => "\xa3", // sterling
        "\x00\x74" => "\x74", // t
        "\x00\x33" => "\x33", // three
        "\x02\xdc" => "\xf7", // tilde
        "\x21\x22" => "\xaa", // trademark
        "\x00\x32" => "\x32", // two
        "\x00\x75" => "\x75", // u
        "\x00\xfa" => "\x9c", // uacute
        "\x00\xfb" => "\x9e", // ucircumflex
        "\x00\xfc" => "\x9f", // udieresis
        "\x00\xf9" => "\x9d", // ugrave
        "\x00\x5f" => "\x5f", // underscore
        "\x00\x76" => "\x76", // v
        "\x00\x77" => "\x77", // w
        "\x00\x78" => "\x78", // x
        "\x00\x79" => "\x79", // y
        "\x00\xff" => "\xd8", // ydieresis
        "\x00\xa5" => "\xb4", // yen
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
     * Converts a string from UTF-16BE to MacRomanEncoding.
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
     * Converts a string from MacRomanEncoding to UTF-16BE.
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