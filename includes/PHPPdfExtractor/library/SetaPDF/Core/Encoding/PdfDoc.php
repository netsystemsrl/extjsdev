<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: PdfDoc.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Implementation of the PdfDocEncoding
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Encoding_PdfDoc
    implements SetaPDF_Core_Encoding_EncodingInterface
{
    static public $table = array(
        "\x00\x41" => "\x41", // A
        "\x00\xc6" => "\xc6", // AE
        "\x00\xc1" => "\xc1", // Aacute
        "\x00\xc2" => "\xc2", // Acircumflex
        "\x00\xc4" => "\xc4", // Adieresis
        "\x00\xc0" => "\xc0", // Agrave
        "\x00\xc5" => "\xc5", // Aring
        "\x00\xc3" => "\xc3", // Atilde
        "\x00\x42" => "\x42", // B
        "\x00\x43" => "\x43", // C
        "\x00\xc7" => "\xc7", // Ccedilla
        "\x00\x44" => "\x44", // D
        "\x00\x45" => "\x45", // E
        "\x00\xc9" => "\xc9", // Eacute
        "\x00\xca" => "\xca", // Ecircumflex
        "\x00\xcb" => "\xcb", // Edieresis
        "\x00\xc8" => "\xc8", // Egrave
        "\x00\xd0" => "\xd0", // Eth
        "\x20\xac" => "\xa0", // Euro
        "\x00\x46" => "\x46", // F
        "\x00\x47" => "\x47", // G
        "\x00\x48" => "\x48", // H
        "\x00\x49" => "\x49", // I
        "\x00\xcd" => "\xcd", // Iacute
        "\x00\xce" => "\xce", // Icircumflex
        "\x00\xcf" => "\xcf", // Idieresis
        "\x00\xcc" => "\xcc", // Igrave
        "\x00\x4a" => "\x4a", // J
        "\x00\x4b" => "\x4b", // K
        "\x00\x4c" => "\x4c", // L
        "\x01\x41" => "\x95", // Lslash
        "\x00\x4d" => "\x4d", // M
        "\x00\x4e" => "\x4e", // N
        "\x00\xd1" => "\xd1", // Ntilde
        "\x00\x4f" => "\x4f", // O
        "\x01\x52" => "\x96", // OE
        "\x00\xd3" => "\xd3", // Oacute
        "\x00\xd4" => "\xd4", // Ocircumflex
        "\x00\xd6" => "\xd6", // Odieresis
        "\x00\xd2" => "\xd2", // Ograve
        "\x00\xd8" => "\xd8", // Oslash
        "\x00\xd5" => "\xd5", // Otilde
        "\x00\x50" => "\x50", // P
        "\x00\x51" => "\x51", // Q
        "\x00\x52" => "\x52", // R
        "\x00\x53" => "\x53", // S
        "\x01\x60" => "\x97", // Scaron
        "\x00\x54" => "\x54", // T
        "\x00\xde" => "\xde", // Thorn
        "\x00\x55" => "\x55", // U
        "\x00\xda" => "\xda", // Uacute
        "\x00\xdb" => "\xdb", // Ucircumflex
        "\x00\xdc" => "\xdc", // Udieresis
        "\x00\xd9" => "\xd9", // Ugrave
        "\x00\x56" => "\x56", // V
        "\x00\x57" => "\x57", // W
        "\x00\x58" => "\x58", // X
        "\x00\x59" => "\x59", // Y
        "\x00\xdd" => "\xdd", // Yacute
        "\x01\x78" => "\x98", // Ydieresis
        "\x00\x5a" => "\x5a", // Z
        "\x01\x7d" => "\x99", // Zcaron
        "\x00\x61" => "\x61", // a
        "\x00\xe1" => "\xe1", // aacute
        "\x00\xe2" => "\xe2", // acircumflex
        "\x00\xb4" => "\xb4", // acute
        "\x00\xe4" => "\xe4", // adieresis
        "\x00\xe6" => "\xe6", // ae
        "\x00\xe0" => "\xe0", // agrave
        "\x00\x26" => "\x26", // ampersand
        "\x00\xe5" => "\xe5", // aring
        "\x00\x5e" => "\x5e", // asciicircum
        "\x00\x7e" => "\x7e", // asciitilde
        "\x00\x2a" => "\x2a", // asterisk
        "\x00\x40" => "\x40", // at
        "\x00\xe3" => "\xe3", // atilde
        "\x00\x62" => "\x62", // b
        "\x00\x5c" => "\x5c", // backslash
        "\x00\x7c" => "\x7c", // bar
        "\x00\x7b" => "\x7b", // braceleft
        "\x00\x7d" => "\x7d", // braceright
        "\x00\x5b" => "\x5b", // bracketleft
        "\x00\x5d" => "\x5d", // bracketright
        "\x02\xd8" => "\x18", // breve
        "\x00\xa6" => "\xa6", // brokenbar
        "\x20\x22" => "\x80", // bullet
        "\x00\x63" => "\x63", // c
        "\x02\xc7" => "\x19", // caron
        "\x00\xe7" => "\xe7", // ccedilla
        "\x00\xb8" => "\xb8", // cedilla
        "\x00\xa2" => "\xa2", // cent
        "\x02\xc6" => "\x1a", // circumflex
        "\x00\x3a" => "\x3a", // colon
        "\x00\x2c" => "\x2c", // comma
        "\x00\xa9" => "\xa9", // copyright
        "\x00\xa4" => "\xa4", // currency
        "\x00\x64" => "\x64", // d
        "\x20\x20" => "\x81", // dagger
        "\x20\x21" => "\x82", // daggerdbl
        "\x00\xb0" => "\xb0", // degree
        "\x00\xa8" => "\xa8", // dieresis
        "\x00\xf7" => "\xf7", // divide
        "\x00\x24" => "\x24", // dollar
        "\x02\xd9" => "\x1b", // dotaccent
        "\x01\x31" => "\x9a", // dotlessi
        "\x00\x65" => "\x65", // e
        "\x00\xe9" => "\xe9", // eacute
        "\x00\xea" => "\xea", // ecircumflex
        "\x00\xeb" => "\xeb", // edieresis
        "\x00\xe8" => "\xe8", // egrave
        "\x00\x38" => "\x38", // eight
        "\x20\x26" => "\x83", // ellipsis
        "\x20\x14" => "\x84", // emdash
        "\x20\x13" => "\x85", // endash
        "\x00\x3d" => "\x3d", // equal
        "\x00\xf0" => "\xf0", // eth
        "\x00\x21" => "\x21", // exclam
        "\x00\xa1" => "\xa1", // exclamdown
        "\x00\x66" => "\x66", // f
        "\xfb\x01" => "\x93", // fi
        "\x00\x35" => "\x35", // five
        "\xfb\x02" => "\x94", // fl
        "\x01\x92" => "\x86", // florin
        "\x00\x34" => "\x34", // four
        "\x20\x44" => "\x87", // fraction
        "\x00\x67" => "\x67", // g
        "\x00\xdf" => "\xdf", // germandbls
        "\x00\x60" => "\x60", // grave
        "\x00\x3e" => "\x3e", // greater
        "\x00\xab" => "\xab", // guillemotleft
        "\x00\xbb" => "\xbb", // guillemotright
        "\x20\x39" => "\x88", // guilsinglleft
        "\x20\x3a" => "\x89", // guilsinglright
        "\x00\x68" => "\x68", // h
        "\x02\xdd" => "\x1c", // hungarumlaut
        "\x00\x2d" => "\x2d", // hyphen
        "\x00\x69" => "\x69", // i
        "\x00\xed" => "\xed", // iacute
        "\x00\xee" => "\xee", // icircumflex
        "\x00\xef" => "\xef", // idieresis
        "\x00\xec" => "\xec", // igrave
        "\x00\x6a" => "\x6a", // j
        "\x00\x6b" => "\x6b", // k
        "\x00\x6c" => "\x6c", // l
        "\x00\x3c" => "\x3c", // less
        "\x00\xac" => "\xac", // logicalnot
        "\x01\x42" => "\x9b", // lslash
        "\x00\x6d" => "\x6d", // m
        "\x00\xaf" => "\xaf", // macron
        "\x22\x12" => "\x8a", // minus
        "\x00\xb5" => "\xb5", // mu
        "\x00\xd7" => "\xd7", // multiply
        "\x00\x6e" => "\x6e", // n
        "\x00\x39" => "\x39", // nine
        "\x00\xf1" => "\xf1", // ntilde
        "\x00\x23" => "\x23", // numbersign
        "\x00\x6f" => "\x6f", // o
        "\x00\xf3" => "\xf3", // oacute
        "\x00\xf4" => "\xf4", // ocircumflex
        "\x00\xf6" => "\xf6", // odieresis
        "\x01\x53" => "\x9c", // oe
        "\x02\xdb" => "\x1d", // ogonek
        "\x00\xf2" => "\xf2", // ograve
        "\x00\x31" => "\x31", // one
        "\x00\xbd" => "\xbd", // onehalf
        "\x00\xbc" => "\xbc", // onequarter
        "\x00\xb9" => "\xb9", // onesuperior
        "\x00\xaa" => "\xaa", // ordfeminine
        "\x00\xba" => "\xba", // ordmasculine
        "\x00\xf8" => "\xf8", // oslash
        "\x00\xf5" => "\xf5", // otilde
        "\x00\x70" => "\x70", // p
        "\x00\xb6" => "\xb6", // paragraph
        "\x00\x28" => "\x28", // parenleft
        "\x00\x29" => "\x29", // parenright
        "\x00\x25" => "\x25", // percent
        "\x00\x2e" => "\x2e", // period
        "\x00\xb7" => "\xb7", // periodcentered
        "\x20\x30" => "\x8b", // perthousand
        "\x00\x2b" => "\x2b", // plus
        "\x00\xb1" => "\xb1", // plusminus
        "\x00\x71" => "\x71", // q
        "\x00\x3f" => "\x3f", // question
        "\x00\xbf" => "\xbf", // questiondown
        "\x00\x22" => "\x22", // quotedbl
        "\x20\x1e" => "\x8c", // quotedblbase
        "\x20\x1c" => "\x8d", // quotedblleft
        "\x20\x1d" => "\x8e", // quotedblright
        "\x20\x18" => "\x8f", // quoteleft
        "\x20\x19" => "\x90", // quoteright
        "\x20\x1a" => "\x91", // quotesinglbase
        "\x00\x27" => "\x27", // quotesingle
        "\x00\x72" => "\x72", // r
        "\x00\xae" => "\xae", // registered
        "\x02\xda" => "\x1e", // ring
        "\x00\x73" => "\x73", // s
        "\x01\x61" => "\x9d", // scaron
        "\x00\xa7" => "\xa7", // section
        "\x00\x3b" => "\x3b", // semicolon
        "\x00\x37" => "\x37", // seven
        "\x00\x36" => "\x36", // six
        "\x00\x2f" => "\x2f", // slash
        "\x00\x20" => "\x20", // space
        "\x00\xa3" => "\xa3", // sterling
        "\x00\x74" => "\x74", // t
        "\x00\xfe" => "\xfe", // thorn
        "\x00\x33" => "\x33", // three
        "\x00\xbe" => "\xbe", // threequarters
        "\x00\xb3" => "\xb3", // threesuperior
        "\x02\xdc" => "\x1f", // tilde
        "\x21\x22" => "\x92", // trademark
        "\x00\x32" => "\x32", // two
        "\x00\xb2" => "\xb2", // twosuperior
        "\x00\x75" => "\x75", // u
        "\x00\xfa" => "\xfa", // uacute
        "\x00\xfb" => "\xfb", // ucircumflex
        "\x00\xfc" => "\xfc", // udieresis
        "\x00\xf9" => "\xf9", // ugrave
        "\x00\x5f" => "\x5f", // underscore
        "\x00\x76" => "\x76", // v
        "\x00\x77" => "\x77", // w
        "\x00\x78" => "\x78", // x
        "\x00\x79" => "\x79", // y
        "\x00\xfd" => "\xfd", // yacute
        "\x00\xff" => "\xff", // ydieresis
        "\x00\xa5" => "\xa5", // yen
        "\x00\x7a" => "\x7a", // z
        "\x01\x7e" => "\x9e", // zcaron
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
     * Converts a string from UTF-16BE to PDFDocEncoding.
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
     * Converts a string from PDFDocEncoding to UTF-16BE.
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