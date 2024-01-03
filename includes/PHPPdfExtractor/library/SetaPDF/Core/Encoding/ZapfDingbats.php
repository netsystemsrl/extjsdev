<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ZapfDingbats.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Implementation of the ZapfDingbatsEncoding
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Encoding_ZapfDingbats
    implements SetaPDF_Core_Encoding_EncodingInterface
{
    static public $table = array(
        "\x00\x20" => "\x20", // space
        "\x27\x01" => "\x21", // a1
        "\x27\x02" => "\x22", // a2
        "\x27\x03" => "\x23", // a202
        "\x27\x04" => "\x24", // a3
        "\x26\x0e" => "\x25", // a4
        "\x27\x06" => "\x26", // a5
        "\x27\x07" => "\x27", // a119
        "\x27\x08" => "\x28", // a118
        "\x27\x09" => "\x29", // a117
        "\x26\x1b" => "\x2a", // a11
        "\x26\x1e" => "\x2b", // a12
        "\x27\x0c" => "\x2c", // a13
        "\x27\x0d" => "\x2d", // a14
        "\x27\x0e" => "\x2e", // a15
        "\x27\x0f" => "\x2f", // a16
        "\x27\x10" => "\x30", // a105
        "\x27\x11" => "\x31", // a17
        "\x27\x12" => "\x32", // a18
        "\x27\x13" => "\x33", // a19
        "\x27\x14" => "\x34", // a20
        "\x27\x15" => "\x35", // a21
        "\x27\x16" => "\x36", // a22
        "\x27\x17" => "\x37", // a23
        "\x27\x18" => "\x38", // a24
        "\x27\x19" => "\x39", // a25
        "\x27\x1a" => "\x3a", // a26
        "\x27\x1b" => "\x3b", // a27
        "\x27\x1c" => "\x3c", // a28
        "\x27\x1d" => "\x3d", // a6
        "\x27\x1e" => "\x3e", // a7
        "\x27\x1f" => "\x3f", // a8
        "\x27\x20" => "\x40", // a9
        "\x27\x21" => "\x41", // a10
        "\x27\x22" => "\x42", // a29
        "\x27\x23" => "\x43", // a30
        "\x27\x24" => "\x44", // a31
        "\x27\x25" => "\x45", // a32
        "\x27\x26" => "\x46", // a33
        "\x27\x27" => "\x47", // a34
        "\x26\x05" => "\x48", // a35
        "\x27\x29" => "\x49", // a36
        "\x27\x2a" => "\x4a", // a37
        "\x27\x2b" => "\x4b", // a38
        "\x27\x2c" => "\x4c", // a39
        "\x27\x2d" => "\x4d", // a40
        "\x27\x2e" => "\x4e", // a41
        "\x27\x2f" => "\x4f", // a42
        "\x27\x30" => "\x50", // a43
        "\x27\x31" => "\x51", // a44
        "\x27\x32" => "\x52", // a45
        "\x27\x33" => "\x53", // a46
        "\x27\x34" => "\x54", // a47
        "\x27\x35" => "\x55", // a48
        "\x27\x36" => "\x56", // a49
        "\x27\x37" => "\x57", // a50
        "\x27\x38" => "\x58", // a51
        "\x27\x39" => "\x59", // a52
        "\x27\x3a" => "\x5a", // a53
        "\x27\x3b" => "\x5b", // a54
        "\x27\x3c" => "\x5c", // a55
        "\x27\x3d" => "\x5d", // a56
        "\x27\x3e" => "\x5e", // a57
        "\x27\x3f" => "\x5f", // a58
        "\x27\x40" => "\x60", // a59
        "\x27\x41" => "\x61", // a60
        "\x27\x42" => "\x62", // a61
        "\x27\x43" => "\x63", // a62
        "\x27\x44" => "\x64", // a63
        "\x27\x45" => "\x65", // a64
        "\x27\x46" => "\x66", // a65
        "\x27\x47" => "\x67", // a66
        "\x27\x48" => "\x68", // a67
        "\x27\x49" => "\x69", // a68
        "\x27\x4a" => "\x6a", // a69
        "\x27\x4b" => "\x6b", // a70
        "\x25\xcf" => "\x6c", // a71
        "\x27\x4d" => "\x6d", // a72
        "\x25\xa0" => "\x6e", // a73
        "\x27\x4f" => "\x6f", // a74
        "\x27\x50" => "\x70", // a203
        "\x27\x51" => "\x71", // a75
        "\x27\x52" => "\x72", // a204
        "\x25\xb2" => "\x73", // a76
        "\x25\xbc" => "\x74", // a77
        "\x25\xc6" => "\x75", // a78
        "\x27\x56" => "\x76", // a79
        "\x25\xd7" => "\x77", // a81
        "\x27\x58" => "\x78", // a82
        "\x27\x59" => "\x79", // a83
        "\x27\x5a" => "\x7a", // a84
        "\x27\x5b" => "\x7b", // a97
        "\x27\x5c" => "\x7c", // a98
        "\x27\x5d" => "\x7d", // a99
        "\x27\x5e" => "\x7e", // a100
        "\x27\x61" => "\xa1", // a101
        "\x27\x62" => "\xa2", // a102
        "\x27\x63" => "\xa3", // a103
        "\x27\x64" => "\xa4", // a104
        "\x27\x65" => "\xa5", // a106
        "\x27\x66" => "\xa6", // a107
        "\x27\x67" => "\xa7", // a108
        "\x26\x63" => "\xa8", // a112
        "\x26\x66" => "\xa9", // a111
        "\x26\x65" => "\xaa", // a110
        "\x26\x60" => "\xab", // a109
        "\x24\x60" => "\xac", // a120
        "\x24\x61" => "\xad", // a121
        "\x24\x62" => "\xae", // a122
        "\x24\x63" => "\xaf", // a123
        "\x24\x64" => "\xb0", // a124
        "\x24\x65" => "\xb1", // a125
        "\x24\x66" => "\xb2", // a126
        "\x24\x67" => "\xb3", // a127
        "\x24\x68" => "\xb4", // a128
        "\x24\x69" => "\xb5", // a129
        "\x27\x76" => "\xb6", // a130
        "\x27\x77" => "\xb7", // a131
        "\x27\x78" => "\xb8", // a132
        "\x27\x79" => "\xb9", // a133
        "\x27\x7a" => "\xba", // a134
        "\x27\x7b" => "\xbb", // a135
        "\x27\x7c" => "\xbc", // a136
        "\x27\x7d" => "\xbd", // a137
        "\x27\x7e" => "\xbe", // a138
        "\x27\x7f" => "\xbf", // a139
        "\x27\x80" => "\xc0", // a140
        "\x27\x81" => "\xc1", // a141
        "\x27\x82" => "\xc2", // a142
        "\x27\x83" => "\xc3", // a143
        "\x27\x84" => "\xc4", // a144
        "\x27\x85" => "\xc5", // a145
        "\x27\x86" => "\xc6", // a146
        "\x27\x87" => "\xc7", // a147
        "\x27\x88" => "\xc8", // a148
        "\x27\x89" => "\xc9", // a149
        "\x27\x8a" => "\xca", // a150
        "\x27\x8b" => "\xcb", // a151
        "\x27\x8c" => "\xcc", // a152
        "\x27\x8d" => "\xcd", // a153
        "\x27\x8e" => "\xce", // a154
        "\x27\x8f" => "\xcf", // a155
        "\x27\x90" => "\xd0", // a156
        "\x27\x91" => "\xd1", // a157
        "\x27\x92" => "\xd2", // a158
        "\x27\x93" => "\xd3", // a159
        "\x27\x94" => "\xd4", // a160
        "\x21\x92" => "\xd5", // a161
        "\x21\x94" => "\xd6", // a163
        "\x21\x95" => "\xd7", // a164
        "\x27\x98" => "\xd8", // a196
        "\x27\x99" => "\xd9", // a165
        "\x27\x9a" => "\xda", // a192
        "\x27\x9b" => "\xdb", // a166
        "\x27\x9c" => "\xdc", // a167
        "\x27\x9d" => "\xdd", // a168
        "\x27\x9e" => "\xde", // a169
        "\x27\x9f" => "\xdf", // a170
        "\x27\xa0" => "\xe0", // a171
        "\x27\xa1" => "\xe1", // a172
        "\x27\xa2" => "\xe2", // a173
        "\x27\xa3" => "\xe3", // a162
        "\x27\xa4" => "\xe4", // a174
        "\x27\xa5" => "\xe5", // a175
        "\x27\xa6" => "\xe6", // a176
        "\x27\xa7" => "\xe7", // a177
        "\x27\xa8" => "\xe8", // a178
        "\x27\xa9" => "\xe9", // a179
        "\x27\xaa" => "\xea", // a193
        "\x27\xab" => "\xeb", // a180
        "\x27\xac" => "\xec", // a199
        "\x27\xad" => "\xed", // a181
        "\x27\xae" => "\xee", // a200
        "\x27\xaf" => "\xef", // a182
        "\x27\xb1" => "\xf1", // a201
        "\x27\xb2" => "\xf2", // a183
        "\x27\xb3" => "\xf3", // a184
        "\x27\xb4" => "\xf4", // a197
        "\x27\xb5" => "\xf5", // a185
        "\x27\xb6" => "\xf6", // a194
        "\x27\xb7" => "\xf7", // a198
        "\x27\xb8" => "\xf8", // a186
        "\x27\xb9" => "\xf9", // a195
        "\x27\xba" => "\xfa", // a187
        "\x27\xbb" => "\xfb", // a188
        "\x27\xbc" => "\xfc", // a189
        "\x27\xbd" => "\xfd", // a190
        "\x27\xbe" => "\xfe", // a191
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
     * Converts a string from UTF-16BE to ZapfDingbatsEncoding.
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
     * Converts a string from ZapfDingbatsEncoding to UTF-16BE.
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