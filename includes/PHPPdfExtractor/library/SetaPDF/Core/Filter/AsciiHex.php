<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Filter
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: AsciiHex.php 1059 2017-06-09 09:30:10Z jan.slabon $
 */

/**
 * Class for handling ASCII hexadecimal data
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Filter
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Filter_AsciiHex implements SetaPDF_Core_Filter_FilterInterface
{
    /**
     * Converts an ASCII hexadecimal encoded string into it's binary representation.
     *
     * @see SetaPDF_Core_Filter_FilterInterface::decode()
     * @param string $data The input string
     * @return string
     */
    public function decode($data)
    {
        $data = preg_replace('/[^0-9A-Fa-f]/', '', rtrim($data, '>'));
        if ((strlen($data) % 2) === 1) {
            $data .= '0';
        }

        return pack('H*', $data);
    }

    /**
     * Converts a string into ASCII hexadecimal representation.
     *
     * @see SetaPDF_Core_Filter_FilterInterface::encode()
     * @param string $data The input string
     * @param boolean $leaveEOD
     * @return string
     */
    public function encode($data, $leaveEOD = false)
    {
        $t = unpack('H*', $data);
        return current($t)
            . ($leaveEOD ? '' : '>');
    }
}