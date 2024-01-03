<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Filter
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: RunLength.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class for handling run-length compression
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Filter
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Filter_RunLength implements SetaPDF_Core_Filter_FilterInterface
{

    /**
     * Decodes run-length compressed string.
     *
     * @param string $data
     * @return string
     * @throws SetaPDF_Core_Filter_Exception
     */
    public function decode($data)
    {
        $out = '';
        $length = strlen($data);
        $pos = 0;
        while ($pos < $length) {
            $byte = ord($data[$pos]);
            if ($byte == 128) {
                break;
            } elseif ($byte <= 127 && $byte >= 0) {
                if (($pos + $byte + 2) > $length) {
                    throw new SetaPDF_Core_Filter_Exception(
                        'Not enough data in run-length encoded string.',
                        SetaPDF_Core_Filter_Exception::ILLEGAL_LENGTH
                    );
                }
                $out .= substr($data, $pos + 1, $byte + 1);
                $pos += ($byte + 2);
            } elseif ($byte <= 255 && $byte >=  129) {
                if ($pos + 1 >= $length ) {
                    throw new SetaPDF_Core_Filter_Exception(
                        'Not enough data in run-length encoded string.',
                        SetaPDF_Core_Filter_Exception::ILLEGAL_LENGTH
                    );
                }
                $out .= str_repeat($data[$pos + 1], 257 - $byte);
                $pos += 2;
            }
        }

        return $out;
    }

    /**
     * Encodes a string with run-length compression.
     *
     * @param string $data
     * @return string
     */
    public function encode($data)
    {
        $out = '';
        $length = strlen($data);
        $buffer = '';
        $bufferLength = 0;

        for ($i = 0; $i < $length; $i++) {
            $currentByte = $data[$i];
            if ($i < ($length - 2)) {
                if ($currentByte == $data[$i + 1] && $data[$i + 1] == $data[$i + 2]) {
                    if ($bufferLength > 0) {
                        $out .= chr($bufferLength - 1) . $buffer;
                        $buffer = '';
                        $bufferLength = 0;
                    }
                    $start = $i;
                    $i += 2;
                    while ($i < $length && $data[$i] == $currentByte && ($i - $start) < 128) {
                        $i++;
                    }
                    $i--;
                    $out .= chr((256 - ($i - $start))) . $currentByte;
                } else {
                    $buffer .= $currentByte;
                    $bufferLength++;
                }
            } else {
                $buffer .= $currentByte;
                $bufferLength++;
            }

            if ($bufferLength >= 128) {
                $out .= chr($bufferLength - 1) . $buffer;
                $bufferLength = 0;
                $buffer = '';
            }
        }

        if ($bufferLength > 0) {
            $out .= chr($bufferLength - 1) . $buffer;
        }

        return ($out . chr(128));
    }
}