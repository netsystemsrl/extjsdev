<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Binary.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a binary reader
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Reader_Binary
{
    /**
     * Big endian byte order
     *
     * @var string
     */
    const BYTE_ORDER_BIG_ENDIAN = 'bigEndian';

    /**
     * Little endian byte order
     *
     * @var string
     */
    const BYTE_ORDER_LITTLE_ENDIAN = 'littleEndian';

    /**
     * The main reader instance
     *
     * @var SetaPDF_Core_Reader_ReaderInterface
     */
    protected $_reader;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Reader_ReaderInterface $reader
     */
    public function __construct(SetaPDF_Core_Reader_ReaderInterface $reader)
    {
        $this->_reader = $reader;
    }

    /**
     * Release resources/cycled references.
     */
    public function cleanUp()
    {
        $this->_reader->cleanUp();
        $this->_reader = null;
    }

    /**
     * Get the reader.
     *
     * @return SetaPDF_Core_Reader_ReaderInterface
     */
    public function getReader()
    {
        return $this->_reader;
    }

    /**
     * Reads a 8-bit/1-byte signed integer.
     *
     * @param integer|null $pos
     * @return integer
     */
    public function readInt8($pos = null)
    {
        return SetaPDF_Core_BitConverter::formatFromInt8($this->_reader->readByte($pos));
    }

    /**
     * Reads a 8-bit/1-byte unsigned integer.
     *
     * @param integer|null $pos
     * @return integer
     */
    public function readUInt8($pos = null)
    {
        return SetaPDF_Core_BitConverter::formatFromUInt8($this->_reader->readByte($pos));
    }

    /**
     * Reads a 16-bit signed integer.
     *
     * @param integer|null $pos
     * @param string $byteOrder
     * @return integer
     */
    public function readInt16($pos = null, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        return SetaPDF_Core_BitConverter::formatFromInt16($this->_reader->readBytes(2, $pos), $byteOrder);
    }

    /**
     * Reads a 16-bit unsigned integer.
     *
     * @param integer|null $pos
     * @param string $byteOrder
     * @return integer
     */
    public function readUInt16($pos = null, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        return SetaPDF_Core_BitConverter::formatFromUInt16($this->_reader->readBytes(2, $pos), $byteOrder);
    }

    /**
     * Reads a 32-bit signed integer.
     *
     * @param integer|null $pos
     * @param string $byteOrder
     * @return mixed
     */
    public function readInt32($pos = null, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        return SetaPDF_Core_BitConverter::formatFromInt32($this->_reader->readBytes(4, $pos), $byteOrder);
    }

    /**
     * Reads a 32-bit unsigned integer.
     *
     * @param integer|null $pos
     * @param string $byteOrder
     * @return mixed
     */
    public function readUInt32($pos = null, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        return SetaPDF_Core_BitConverter::formatFromUInt32($this->_reader->readBytes(4, $pos), $byteOrder);
    }

    /**
     * Read a single byte.
     *
     * @param integer $pos
     * @return string
     */
    public function readByte($pos = null)
    {
        return $this->_reader->readByte($pos);
    }

    /**
     * Read a specific amount of bytes.
     *
     * @param integer $length
     * @param integer $pos
     * @return string
     */
    public function readBytes($length, $pos = null)
    {
        return $this->_reader->readBytes($length, $pos);
    }

    /**
     * Reset the reader to a specific position.
     *
     * @param integer $position
     * @param integer $length
     */
    public function reset($position, $length)
    {
        $this->_reader->reset($position, $length);
    }

    /**
     * Seek to a position.
     *
     * @param integer $position
     */
    public function seek($position)
    {
        $this->_reader->reset($position);
    }

    /**
     * Skip a specific byte count.
     *
     * @param integer $length
     */
    public function skip($length)
    {
        $currentPos = $this->_reader->getPos();
        $currentOffset = $this->_reader->getOffset();
        $this->_reader->reset($currentPos + $currentOffset + $length);
    }
}