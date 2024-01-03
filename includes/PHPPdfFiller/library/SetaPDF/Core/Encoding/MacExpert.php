<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: MacExpert.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Implementation of the MacExpertEncoding
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Encoding_MacExpert
    implements SetaPDF_Core_Encoding_EncodingInterface
{
    static public $table = array(
        "\xf7\xe6" => "\xbe", // AEsmall
        "\xf7\xe1" => "\x87", // Aacutesmall
        "\xf7\xe2" => "\x89", // Acircumflexsmall
        "\xf7\xb4" => "\x27", // Acutesmall
        "\xf7\xe4" => "\x8a", // Adieresissmall
        "\xf7\xe0" => "\x88", // Agravesmall
        "\xf7\xe5" => "\x8c", // Aringsmall
        "\xf7\x61" => "\x61", // Asmall
        "\xf7\xe3" => "\x8b", // Atildesmall
        "\xf6\xf4" => "\xf3", // Brevesmall
        "\xf7\x62" => "\x62", // Bsmall
        "\xf6\xf5" => "\xae", // Caronsmall
        "\xf7\xe7" => "\x8d", // Ccedillasmall
        "\xf7\xb8" => "\xc9", // Cedillasmall
        "\xf6\xf6" => "\x5e", // Circumflexsmall
        "\xf7\x63" => "\x63", // Csmall
        "\xf7\xa8" => "\xac", // Dieresissmall
        "\xf6\xf7" => "\xfa", // Dotaccentsmall
        "\xf7\x64" => "\x64", // Dsmall
        "\xf7\xe9" => "\x8e", // Eacutesmall
        "\xf7\xea" => "\x90", // Ecircumflexsmall
        "\xf7\xeb" => "\x91", // Edieresissmall
        "\xf7\xe8" => "\x8f", // Egravesmall
        "\xf7\x65" => "\x65", // Esmall
        "\xf7\xf0" => "\x44", // Ethsmall
        "\xf7\x66" => "\x66", // Fsmall
        "\xf7\x60" => "\x60", // Gravesmall
        "\xf7\x67" => "\x67", // Gsmall
        "\xf7\x68" => "\x68", // Hsmall
        "\xf6\xf8" => "\x22", // Hungarumlautsmall
        "\xf7\xed" => "\x92", // Iacutesmall
        "\xf7\xee" => "\x94", // Icircumflexsmall
        "\xf7\xef" => "\x95", // Idieresissmall
        "\xf7\xec" => "\x93", // Igravesmall
        "\xf7\x69" => "\x69", // Ismall
        "\xf7\x6a" => "\x6a", // Jsmall
        "\xf7\x6b" => "\x6b", // Ksmall
        "\xf6\xf9" => "\xc2", // Lslashsmall
        "\xf7\x6c" => "\x6c", // Lsmall
        "\xf7\xaf" => "\xf4", // Macronsmall
        "\xf7\x6d" => "\x6d", // Msmall
        "\xf7\x6e" => "\x6e", // Nsmall
        "\xf7\xf1" => "\x96", // Ntildesmall
        "\xf6\xfa" => "\xcf", // OEsmall
        "\xf7\xf3" => "\x97", // Oacutesmall
        "\xf7\xf4" => "\x99", // Ocircumflexsmall
        "\xf7\xf6" => "\x9a", // Odieresissmall
        "\xf6\xfb" => "\xf2", // Ogoneksmall
        "\xf7\xf2" => "\x98", // Ogravesmall
        "\xf7\xf8" => "\xbf", // Oslashsmall
        "\xf7\x6f" => "\x6f", // Osmall
        "\xf7\xf5" => "\x9b", // Otildesmall
        "\xf7\x70" => "\x70", // Psmall
        "\xf7\x71" => "\x71", // Qsmall
        "\xf6\xfc" => "\xfb", // Ringsmall
        "\xf7\x72" => "\x72", // Rsmall
        "\xf6\xfd" => "\xa7", // Scaronsmall
        "\xf7\x73" => "\x73", // Ssmall
        "\xf7\xfe" => "\xb9", // Thornsmall
        "\xf6\xfe" => "\x7e", // Tildesmall
        "\xf7\x74" => "\x74", // Tsmall
        "\xf7\xfa" => "\x9c", // Uacutesmall
        "\xf7\xfb" => "\x9e", // Ucircumflexsmall
        "\xf7\xfc" => "\x9f", // Udieresissmall
        "\xf7\xf9" => "\x9d", // Ugravesmall
        "\xf7\x75" => "\x75", // Usmall
        "\xf7\x76" => "\x76", // Vsmall
        "\xf7\x77" => "\x77", // Wsmall
        "\xf7\x78" => "\x78", // Xsmall
        "\xf7\xfd" => "\xb4", // Yacutesmall
        "\xf7\xff" => "\xd8", // Ydieresissmall
        "\xf7\x79" => "\x79", // Ysmall
        "\xf6\xff" => "\xbd", // Zcaronsmall
        "\xf7\x7a" => "\x7a", // Zsmall
        "\xf7\x26" => "\x26", // ampersandsmall
        "\xf6\xe9" => "\x81", // asuperior
        "\xf6\xea" => "\xf5", // bsuperior
        "\xf6\xdf" => "\xa9", // centinferior
        "\xf7\xa2" => "\x23", // centoldstyle
        "\xf6\xe0" => "\x82", // centsuperior
        "\x00\x3a" => "\x3a", // colon
        "\x20\xa1" => "\x7b", // colonmonetary
        "\x00\x2c" => "\x2c", // comma
        "\xf6\xe1" => "\xb2", // commainferior
        "\xf6\xe2" => "\xf8", // commasuperior
        "\xf6\xe3" => "\xb6", // dollarinferior
        "\xf7\x24" => "\x24", // dollaroldstyle
        "\xf6\xe4" => "\x25", // dollarsuperior
        "\xf6\xeb" => "\xeb", // dsuperior
        "\x20\x88" => "\xa5", // eightinferior
        "\xf7\x38" => "\x38", // eightoldstyle
        "\x20\x78" => "\xa1", // eightsuperior
        "\xf6\xec" => "\xe4", // esuperior
        "\xf7\xa1" => "\xd6", // exclamdownsmall
        "\xf7\x21" => "\x21", // exclamsmall
        "\xfb\x00" => "\x56", // ff
        "\xfb\x03" => "\x59", // ffi
        "\xfb\x04" => "\x5a", // ffl
        "\xfb\x01" => "\x57", // fi
        "\x20\x12" => "\xd0", // figuredash
        "\x21\x5d" => "\x4c", // fiveeighths
        "\x20\x85" => "\xb0", // fiveinferior
        "\xf7\x35" => "\x35", // fiveoldstyle
        "\x20\x75" => "\xde", // fivesuperior
        "\xfb\x02" => "\x58", // fl
        "\x20\x84" => "\xa2", // fourinferior
        "\xf7\x34" => "\x34", // fouroldstyle
        "\x20\x74" => "\xdd", // foursuperior
        "\x20\x44" => "\x2f", // fraction
        "\x00\x2d" => "\x2d", // hyphen
        "\xf6\xe5" => "\x5f", // hypheninferior
        "\xf6\xe6" => "\xd1", // hyphensuperior
        "\xf6\xed" => "\xe9", // isuperior
        "\xf6\xee" => "\xf1", // lsuperior
        "\xf6\xef" => "\xf7", // msuperior
        "\x20\x89" => "\xbb", // nineinferior
        "\xf7\x39" => "\x39", // nineoldstyle
        "\x20\x79" => "\xe1", // ninesuperior
        "\x20\x7f" => "\xf6", // nsuperior
        "\x20\x24" => "\x2b", // onedotenleader
        "\x21\x5b" => "\x4a", // oneeighth
        "\xf6\xdc" => "\x7c", // onefitted
        "\x00\xbd" => "\x48", // onehalf
        "\x20\x81" => "\xc1", // oneinferior
        "\xf7\x31" => "\x31", // oneoldstyle
        "\x00\xbc" => "\x47", // onequarter
        "\x00\xb9" => "\xda", // onesuperior
        "\x21\x53" => "\x4e", // onethird
        "\xf6\xf0" => "\xaf", // osuperior
        "\x20\x8d" => "\x5b", // parenleftinferior
        "\x20\x7d" => "\x28", // parenleftsuperior
        "\x20\x8e" => "\x5d", // parenrightinferior
        "\x20\x7e" => "\x29", // parenrightsuperior
        "\x00\x2e" => "\x2e", // period
        "\xf6\xe7" => "\xb3", // periodinferior
        "\xf6\xe8" => "\xf9", // periodsuperior
        "\xf7\xbf" => "\xc0", // questiondownsmall
        "\xf7\x3f" => "\x3f", // questionsmall
        "\xf6\xf1" => "\xe5", // rsuperior
        "\xf6\xdd" => "\x7d", // rupiah
        "\x00\x3b" => "\x3b", // semicolon
        "\x21\x5e" => "\x4d", // seveneighths
        "\x20\x87" => "\xa6", // seveninferior
        "\xf7\x37" => "\x37", // sevenoldstyle
        "\x20\x77" => "\xe0", // sevensuperior
        "\x20\x86" => "\xa4", // sixinferior
        "\xf7\x36" => "\x36", // sixoldstyle
        "\x20\x76" => "\xdf", // sixsuperior
        "\x00\x20" => "\x20", // space
        "\xf6\xf2" => "\xea", // ssuperior
        "\x21\x5c" => "\x4b", // threeeighths
        "\x20\x83" => "\xa3", // threeinferior
        "\xf7\x33" => "\x33", // threeoldstyle
        "\x00\xbe" => "\x49", // threequarters
        "\xf6\xde" => "\x3d", // threequartersemdash
        "\x00\xb3" => "\xdc", // threesuperior
        "\xf6\xf3" => "\xe6", // tsuperior
        "\x20\x25" => "\x2a", // twodotenleader
        "\x20\x82" => "\xaa", // twoinferior
        "\xf7\x32" => "\x32", // twooldstyle
        "\x00\xb2" => "\xdb", // twosuperior
        "\x21\x54" => "\x4f", // twothirds
        "\x20\x80" => "\xbc", // zeroinferior
        "\xf7\x30" => "\x30", // zerooldstyle
        "\x20\x70" => "\xe2", // zerosuperior
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
     * Converts a string from UTF-16BE to MacExpertEncoding.
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
     * Converts a string from MacExpertEncoding to UTF-16BE.
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