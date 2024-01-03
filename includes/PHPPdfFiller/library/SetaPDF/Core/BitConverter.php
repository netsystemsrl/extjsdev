<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: BitConverter.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class that allows you to convert base data types to bytes and vice versa.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Canvas
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_BitConverter
{
    /**
     * Constant for big endian byte order.
     *
     * @var string
     */
    const BYTE_ORDER_BIG_ENDIAN = 'bigEndian';

    /**
     * Constant for little endian byte order.
     *
     * @var string
     */
    const BYTE_ORDER_LITTLE_ENDIAN = 'littleEndian';

    const INT8 = 'Int8';
    const CHAR = 'Int8';

    const UINT8 = 'UInt8';
    const BYTE = 'UInt8';

    const INT16 = 'Int16';
    const SHORT = 'Int16';

    const UINT16 = 'UInt16';
    const USHORT = 'UInt16';

    const INT32 = 'Int32';
    const LONG = 'Int32';

    const UINT32 = 'UInt32';
    const ULONG = 'UInt32';

    const FIXED = 'Fixed';

    /**
     * The machine byte order.
     *
     * @var string
     */
    static protected $_machineByteOrder;

    /**
     * Get the size by a specific type.
     *
     * @param string $type
     * @return int
     */
    static public function getSize($type)
    {
        switch ($type) {
            case self::INT8;
            case self::UINT8:
                return 1;
            case self::INT16:
            case self::UINT16:
                return 2;
            case self::INT32:
            case self::UINT32:
            case self::FIXED:
                return 4;
        }

        throw new InvalidArgumentException('Unknown type "' . $type . '".');
    }
    /**
     * Get the machine byte order.
     *
     * @return string
     */
    static public function getMachineByteOrder()
    {
        if (null === self::$_machineByteOrder) {
            self::$_machineByteOrder = pack('L', 1) === pack('N', 1)
                ? self::BYTE_ORDER_BIG_ENDIAN
                : self::BYTE_ORDER_LITTLE_ENDIAN;
        }

        return self::$_machineByteOrder;
    }

    /**
     * Reads a signed integer.
     *
     * @param string $byte
     * @param integer $size
     * @return integer
     */
    static public function formatFromInt($byte, $size)
    {
        switch ($size) {
            case 1:
                return self::formatFromInt8($byte);
            case 2:
                return self::formatFromInt16($byte);
            case 4:
                return self::formatFromInt32($byte);
            default:
                throw new InvalidArgumentException('Invalid size argument: ' . $size);
        }
    }

    /**
     * Reads an unsigned integer.
     *
     * @param string $byte
     * @param integer $size
     * @return integer
     */
    static public function formatFromUInt($byte, $size)
    {
        switch ($size) {
            case 1:
                return self::formatFromUInt8($byte);
            case 2:
                return self::formatFromUInt16($byte);
            case 4:
                return self::formatFromUInt32($byte);
            default:
                throw new InvalidArgumentException('Invalid size argument: ' . $size);
        }
    }

    /**
     * Writes a signed integer.
     *
     * @param integer $int
     * @param integer $size
     * @return string
     */
    static public function formatToInt($int, $size)
    {
        switch ($size) {
            case 1:
                return self::formatToInt8($int);
            case 2:
                return self::formatToInt16($int);
            case 4:
                return self::formatToInt32($int);
            default:
                throw new InvalidArgumentException('Invalid size argument: ' . $size);
        }
    }

    /**
     * Writes an unsigned integer.
     *
     * @param integer $int
     * @param integer $size
     * @return string
     */
    static public function formatToUInt($int, $size)
    {
        switch ($size) {
            case 1:
                return self::formatToUInt8($int);
            case 2:
                return self::formatToUInt16($int);
            case 4:
                return self::formatToUInt32($int);
            default:
                throw new InvalidArgumentException('Invalid size argument: ' . $size);
        }
    }

    /**
     * Reads a 8-bit/1-byte signed integer.
     *
     * @param string $byte
     * @return integer
     */
    static public function formatFromInt8($byte)
    {
        if (strlen($byte) != 1) {
            throw new InvalidArgumentException(sprintf('Not enough input, need 1, have %s', strlen($byte)));
        }

        $t = unpack('c', $byte);
        return current($t);
    }

    /**
     * Writes a 8-bit/1-byte signed integer.
     *
     * @param integer $int
     * @return string
     */
    static public function formatToInt8($int)
    {
        if ($int > 127 || $int < -128) {
            throw new OutOfBoundsException('Integer is out of bounds.');
        }

        return pack('c', $int);
    }

    /**
     * Reads a 8-bit/1-byte unsigned integer.
     *
     * @param string $byte
     * @return integer
     */
    static public function formatFromUInt8($byte)
    {
        return ord($byte);
    }

    /**
     * Writes a 8-bit/1-byte unsigned integer.
     *
     * @param integer $int
     * @return string
     */
    static public function formatToUInt8($int)
    {
        if ($int > 255 || $int < 0) {
            throw new OutOfBoundsException('Integer is out of bounds.');
        }

        return chr($int);
    }

    /**
     * Reads a 16-bit signed integer.
     *
     * @param string $bytes
     * @param string $byteOrder
     * @return integer
     */
    static public function formatFromInt16($bytes, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        $value = self::formatFromUInt16($bytes, $byteOrder);
        if ($value >= 0x8000)
            $value -= 65536;

        return $value;
    }

    /**
     * Writes a 16-bit signed integer.
     *
     * @param integer $int
     * @param string $byteOrder
     * @return string
     */
    static public function formatToInt16($int, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        if ($int > 32767 || $int < -32768) {
            throw new OutOfBoundsException('Integer is out of bounds.');
        }

        $bytes = pack('s', $int);
        if ($byteOrder !== self::getMachineByteOrder()) {
            return strrev($bytes);
        }

        return $bytes;
    }

    /**
     * Reads a 16-bit unsigned integer.
     *
     * @param string $bytes
     * @param string $byteOrder
     * @return integer
     */
    static public function formatFromUInt16($bytes, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        if (strlen($bytes) != 2) {
            throw new InvalidArgumentException(sprintf('Not enough input, need 2, have %s', strlen($bytes)));
        }

        $bytesArr = unpack($byteOrder == self::BYTE_ORDER_BIG_ENDIAN ? 'n' : 'v', $bytes);
        return current($bytesArr);
    }

    /**
     * Writes a 16-bit unsigned integer.
     *
     * @param integer $int
     * @param string $byteOrder
     * @return string
     */
    static public function formatToUInt16($int, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        if ($int > 65535 || $int < 0) {
            throw new OutOfBoundsException('Integer is out of bounds.');
        }

        return pack($byteOrder == self::BYTE_ORDER_BIG_ENDIAN ? 'n' : 'v', $int);
    }

    /**
     * Reads a 32-bit signed integer.
     *
     * @param string $bytes
     * @param string $byteOrder
     * @return mixed
     */
    static public function formatFromInt32($bytes, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        $value = self::formatFromUInt32($bytes, $byteOrder);
        if ($value >= 0x80000000)
            $value -= 4294967296;

        return (int)$value;
    }

    /**
     * Writes a 32-bit signed integer.
     *
     * @param integer $int
     * @param string $byteOrder
     * @return string
     */
    static public function formatToInt32($int, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        if ($int > 2147483647 || $int < -2147483648) {
            throw new OutOfBoundsException('Integer is out of bounds.');
        }

        $bytes = pack('l', $int);
        if ($byteOrder !== self::getMachineByteOrder()) {
            return strrev($bytes);
        }

        return $bytes;
    }

    /**
     * Reads a 32-bit unsigned integer.
     *
     * @param string $bytes
     * @param string $byteOrder
     * @return mixed
     */
    static public function formatFromUInt32($bytes, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        return self::_uint32($bytes, $byteOrder);
    }

    /**
     * Formats a 32-bit unsigned integer.
     *
     * @param integer $int
     * @param string $byteOrder
     * @return mixed
     */
    static public function formatToUInt32($int, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        if ($int < 0 || $int > 4294967295) {
            throw new OutOfBoundsException('Integer is out of bounds.');
        }

        return pack(($byteOrder == self::BYTE_ORDER_BIG_ENDIAN ? 'N' : 'V'), $int);
    }

    /**
     * @see http://www.php.net/function.unpack.php#106041
     * @param string $bin Binary string
     * @param string $byteOrder Byte Order, use BYTE_ORDER_XXX constant
     * @return mixed
     * @internal
     */
    static private function _uint32($bin, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        if (strlen($bin) != 4) {
            throw new InvalidArgumentException(sprintf('Invalid input, need 4, have %s', strlen($bin)));
        }

        // $bin is the binary 32-bit BE string that represents the integer
        if (PHP_INT_SIZE <= 4) {
            $isBigEndian = (bool)($byteOrder == self::BYTE_ORDER_BIG_ENDIAN);

            if ($isBigEndian) {
                list(, $h, $l) = unpack('n*', $bin);
            } else {
                list(, $l, $h) = unpack('v*', $bin);
            }
            //     ($l | ($h << 16))
            return ($l + ($h * 0x010000));
        } else {
            list(, $int) = unpack(($byteOrder == self::BYTE_ORDER_BIG_ENDIAN ? 'N' : 'V'), $bin);
            return $int;
        }
    }

    /**
     * Reads a 32-bit signed fixed-point number.
     *
     * @param string $bytes
     * @return float
     */
    static public function formatFromFixed($bytes)
    {
        if (strlen($bytes) < 4) {
            throw new OutOfBoundsException('Not enough bytes for Fixed format.');
        }

        $integral   = self::formatFromInt16(substr($bytes, 0, 2));
        $fractional = self::formatFromUInt16(substr($bytes, 2, 2));

        return $integral + $fractional / 65536.;
    }

    /**
     * Writes a 32-bit signed fixed-point number.
     *
     * @param float $float
     * @return string
     */
    static public function formatToFixed($float)
    {
        $integral = (int)$float;

        $fractional = ($float - $integral) * 65536.;
        if ($integral < 0 && abs($fractional) > SetaPDF_Core::FLOAT_COMPARISON_PRECISION) {
            $integral--;
            $fractional = ($float - $integral) * 65536.;
        }

        $result = self::formatToInt16($integral) . self::formatToUInt16($fractional);

        return $result;
    }
}