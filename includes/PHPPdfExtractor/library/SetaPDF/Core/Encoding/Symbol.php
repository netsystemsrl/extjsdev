<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Symbol.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Implementation of the SymbolEncoding
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Encoding_Symbol
    implements SetaPDF_Core_Encoding_EncodingInterface
{
    static public $table = array(
        "\x03\x91" => "\x41", // Alpha
        "\x03\x92" => "\x42", // Beta
        "\x03\xa7" => "\x43", // Chi
        "\x22\x06" => "\x44", // Delta
        "\x03\x95" => "\x45", // Epsilon
        "\x03\x97" => "\x48", // Eta
        "\x20\xac" => "\xa0", // Euro
        "\x03\x93" => "\x47", // Gamma
        "\x21\x11" => "\xc1", // Ifraktur
        "\x03\x99" => "\x49", // Iota
        "\x03\x9a" => "\x4b", // Kappa
        "\x03\x9b" => "\x4c", // Lambda
        "\x03\x9c" => "\x4d", // Mu
        "\x03\x9d" => "\x4e", // Nu
        "\x21\x26" => "\x57", // Omega
        "\x03\x9f" => "\x4f", // Omicron
        "\x03\xa6" => "\x46", // Phi
        "\x03\xa0" => "\x50", // Pi
        "\x03\xa8" => "\x59", // Psi
        "\x21\x1c" => "\xc2", // Rfraktur
        "\x03\xa1" => "\x52", // Rho
        "\x03\xa3" => "\x53", // Sigma
        "\x03\xa4" => "\x54", // Tau
        "\x03\x98" => "\x51", // Theta
        "\x03\xa5" => "\x55", // Upsilon
        "\x03\xd2" => "\xa1", // Upsilon1
        "\x03\x9e" => "\x58", // Xi
        "\x03\x96" => "\x5a", // Zeta
        "\x21\x35" => "\xc0", // aleph
        "\x03\xb1" => "\x61", // alpha
        "\x00\x26" => "\x26", // ampersand
        "\x22\x20" => "\xd0", // angle
        "\x23\x29" => "\xe1", // angleleft
        "\x23\x2a" => "\xf1", // angleright
        "\x22\x48" => "\xbb", // approxequal
        "\x21\x94" => "\xab", // arrowboth
        "\x21\xd4" => "\xdb", // arrowdblboth
        "\x21\xd3" => "\xdf", // arrowdbldown
        "\x21\xd0" => "\xdc", // arrowdblleft
        "\x21\xd2" => "\xde", // arrowdblright
        "\x21\xd1" => "\xdd", // arrowdblup
        "\x21\x93" => "\xaf", // arrowdown
        "\xf8\xe7" => "\xbe", // arrowhorizex
        "\x21\x90" => "\xac", // arrowleft
        "\x21\x92" => "\xae", // arrowright
        "\x21\x91" => "\xad", // arrowup
        "\xf8\xe6" => "\xbd", // arrowvertex
        "\x22\x17" => "\x2a", // asteriskmath
        "\x00\x7c" => "\x7c", // bar
        "\x03\xb2" => "\x62", // beta
        "\x00\x7b" => "\x7b", // braceleft
        "\x00\x7d" => "\x7d", // braceright
        "\xf8\xf1" => "\xec", // bracelefttp
        "\xf8\xf2" => "\xed", // braceleftmid
        "\xf8\xf3" => "\xee", // braceleftbt
        "\xf8\xfc" => "\xfc", // bracerighttp
        "\xf8\xfd" => "\xfd", // bracerightmid
        "\xf8\xfe" => "\xfe", // bracerightbt
        "\xf8\xf4" => "\xef", // braceex
        "\x00\x5b" => "\x5b", // bracketleft
        "\x00\x5d" => "\x5d", // bracketright
        "\xf8\xee" => "\xe9", // bracketlefttp
        "\xf8\xef" => "\xea", // bracketleftex
        "\xf8\xf0" => "\xeb", // bracketleftbt
        "\xf8\xf9" => "\xf9", // bracketrighttp
        "\xf8\xfa" => "\xfa", // bracketrightex
        "\xf8\xfb" => "\xfb", // bracketrightbt
        "\x20\x22" => "\xb7", // bullet
        "\x21\xb5" => "\xbf", // carriagereturn
        "\x03\xc7" => "\x63", // chi
        "\x22\x97" => "\xc4", // circlemultiply
        "\x22\x95" => "\xc5", // circleplus
        "\x26\x63" => "\xa7", // club
        "\x00\x3a" => "\x3a", // colon
        "\x00\x2c" => "\x2c", // comma
        "\x22\x45" => "\x40", // congruent
        "\xf8\xe9" => "\xe3", // copyrightsans
        "\xf6\xd9" => "\xd3", // copyrightserif
        "\x00\xb0" => "\xb0", // degree
        "\x03\xb4" => "\x64", // delta
        "\x26\x66" => "\xa8", // diamond
        "\x00\xf7" => "\xb8", // divide
        "\x22\xc5" => "\xd7", // dotmath
        "\x00\x38" => "\x38", // eight
        "\x22\x08" => "\xce", // element
        "\x20\x26" => "\xbc", // ellipsis
        "\x22\x05" => "\xc6", // emptyset
        "\x03\xb5" => "\x65", // epsilon
        "\x00\x3d" => "\x3d", // equal
        "\x22\x61" => "\xba", // equivalence
        "\x03\xb7" => "\x68", // eta
        "\x00\x21" => "\x21", // exclam
        "\x22\x03" => "\x24", // existential
        "\x00\x35" => "\x35", // five
        "\x01\x92" => "\xa6", // florin
        "\x00\x34" => "\x34", // four
        "\x20\x44" => "\xa4", // fraction
        "\x03\xb3" => "\x67", // gamma
        "\x22\x07" => "\xd1", // gradient
        "\x00\x3e" => "\x3e", // greater
        "\x22\x65" => "\xb3", // greaterequal
        "\x26\x65" => "\xa9", // heart
        "\x22\x1e" => "\xa5", // infinity
        "\x22\x2b" => "\xf2", // integral
        "\x23\x20" => "\xf3", // integraltp
        "\xf8\xf5" => "\xf4", // integralex
        "\x23\x21" => "\xf5", // integralbt
        "\x22\x29" => "\xc7", // intersection
        "\x03\xb9" => "\x69", // iota
        "\x03\xba" => "\x6b", // kappa
        "\x03\xbb" => "\x6c", // lambda
        "\x00\x3c" => "\x3c", // less
        "\x22\x64" => "\xa3", // lessequal
        "\x22\x27" => "\xd9", // logicaland
        "\x00\xac" => "\xd8", // logicalnot
        "\x22\x28" => "\xda", // logicalor
        "\x25\xca" => "\xe0", // lozenge
        "\x22\x12" => "\x2d", // minus
        "\x20\x32" => "\xa2", // minute
        "\x00\xb5" => "\x6d", // mu
        "\x00\xd7" => "\xb4", // multiply
        "\x00\x39" => "\x39", // nine
        "\x22\x09" => "\xcf", // notelement
        "\x22\x60" => "\xb9", // notequal
        "\x22\x84" => "\xcb", // notsubset
        "\x03\xbd" => "\x6e", // nu
        "\x00\x23" => "\x23", // numbersign
        "\x03\xc9" => "\x77", // omega
        "\x03\xd6" => "\x76", // omega1
        "\x03\xbf" => "\x6f", // omicron
        "\x00\x31" => "\x31", // one
        "\x00\x28" => "\x28", // parenleft
        "\x00\x29" => "\x29", // parenright
        "\xf8\xeb" => "\xe6", // parenlefttp
        "\xf8\xec" => "\xe7", // parenleftex
        "\xf8\xed" => "\xe8", // parenleftbt
        "\xf8\xf6" => "\xf6", // parenrighttp
        "\xf8\xf7" => "\xf7", // parenrightex
        "\xf8\xf8" => "\xf8", // parenrightbt
        "\x22\x02" => "\xb6", // partialdiff
        "\x00\x25" => "\x25", // percent
        "\x00\x2e" => "\x2e", // period
        "\x22\xa5" => "\x5e", // perpendicular
        "\x03\xc6" => "\x66", // phi
        "\x03\xd5" => "\x6a", // phi1
        "\x03\xc0" => "\x70", // pi
        "\x00\x2b" => "\x2b", // plus
        "\x00\xb1" => "\xb1", // plusminus
        "\x22\x0f" => "\xd5", // product
        "\x22\x82" => "\xcc", // propersubset
        "\x22\x83" => "\xc9", // propersuperset
        "\x22\x1d" => "\xb5", // proportional
        "\x03\xc8" => "\x79", // psi
        "\x00\x3f" => "\x3f", // question
        "\x22\x1a" => "\xd6", // radical
        "\xf8\xe5" => "\x60", // radicalex
        "\x22\x86" => "\xcd", // reflexsubset
        "\x22\x87" => "\xca", // reflexsuperset
        "\xf8\xe8" => "\xe2", // registersans
        "\xf6\xda" => "\xd2", // registerserif
        "\x03\xc1" => "\x72", // rho
        "\x20\x33" => "\xb2", // second
        "\x00\x3b" => "\x3b", // semicolon
        "\x00\x37" => "\x37", // seven
        "\x03\xc3" => "\x73", // sigma
        "\x03\xc2" => "\x56", // sigma1
        "\x22\x3c" => "\x7e", // similar
        "\x00\x36" => "\x36", // six
        "\x00\x2f" => "\x2f", // slash
        "\x00\x20" => "\x20", // space
        "\x26\x60" => "\xaa", // spade
        "\x22\x0b" => "\x27", // suchthat
        "\x22\x11" => "\xe5", // summation
        "\x03\xc4" => "\x74", // tau
        "\x22\x34" => "\x5c", // therefore
        "\x03\xb8" => "\x71", // theta
        "\x03\xd1" => "\x4a", // theta1
        "\x00\x33" => "\x33", // three
        "\xf8\xea" => "\xe4", // trademarksans
        "\xf6\xdb" => "\xd4", // trademarkserif
        "\x00\x32" => "\x32", // two
        "\x00\x5f" => "\x5f", // underscore
        "\x22\x2a" => "\xc8", // union
        "\x22\x00" => "\x22", // universal
        "\x03\xc5" => "\x75", // upsilon
        "\x21\x18" => "\xc3", // weierstrass
        "\x03\xbe" => "\x78", // xi
        "\x00\x30" => "\x30", // zero
        "\x03\xb6" => "\x7a", // zeta
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
     * Converts a string from UTF-16BE to SymbolEncoding.
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
     * Converts a string from SymbolEncoding to UTF-16BE.
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