<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Binary.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing a binary writer
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Writer_Binary
{
    /**
     * Big endian byte order
     *
     * @var string
     */
    const BYTE_ORDER_BIG_ENDIAN = SetaPDF_Core_Reader_Binary::BYTE_ORDER_BIG_ENDIAN;

    /**
     * Little endian byte order
     *
     * @var string
     */
    const BYTE_ORDER_LITTLE_ENDIAN = SetaPDF_Core_Reader_Binary::BYTE_ORDER_LITTLE_ENDIAN;

    /**
     * The main writer instance
     *
     * @var SetaPDF_Core_Writer_WriterInterface
     */
    protected $_writer;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     */
    public function __construct(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        $this->_writer = $writer;
    }

    /**
     * Release resources/cycled references.
     */
    public function cleanUp()
    {
        $this->_writer->cleanUp();
        $this->_writer = null;
    }

    /**
     * Get the writer.
     *
     * @return SetaPDF_Core_Writer_WriterInterface
     */
    public function getWiter()
    {
        return $this->_writer;
    }

    /**
     * Writes a 8-bit/1-byte signed integer.
     *
     * @param integer $int
     * @return self
     */
    public function writeInt8($int)
    {
        $this->_writer->write(SetaPDF_Core_BitConverter::formatToInt8($int));

        return $this;
    }

    /**
     * Writes a 8-bit/1-byte unsigned integer.
     * @param integer $int
     *
     * @return self
     */
    public function writeUInt8($int)
    {
        $this->_writer->write(SetaPDF_Core_BitConverter::formatToUInt8($int));

        return $this;
    }

    /**
     * Writes a 16-bit signed integer.
     *
     * @param integer $int
     * @param string $byteOrder
     * @return self
     */
    public function writeInt16($int, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        $this->_writer->write(SetaPDF_Core_BitConverter::formatToInt16($int, $byteOrder));

        return $this;
    }

    /**
     * Writes a 16-bit unsigned integer.
     *
     * @param integer $int
     * @param string $byteOrder
     * @return self
     */
    public function writeUInt16($int, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        $this->_writer->write(SetaPDF_Core_BitConverter::formatToUInt16($int, $byteOrder));

        return $this;
    }

    /**
     * Writes a 32-bit signed integer.
     *
     * @param integer $int
     * @param string $byteOrder
     * @return mixed
     */
    public function writeInt32($int, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        $this->_writer->write(SetaPDF_Core_BitConverter::formatToInt32($int, $byteOrder));

        return $this;
    }

    /**
     * Writes a 32-bit unsigned integer.
     *
     * @param integer $int
     * @param string $byteOrder
     * @return mixed
     */
    public function writeUInt32($int, $byteOrder = self::BYTE_ORDER_BIG_ENDIAN)
    {
        $this->_writer->write(SetaPDF_Core_BitConverter::formatToUInt32($int, $byteOrder));

        return $this;
    }

    /**
     * Writes various bytes.
     *
     * @param string $bytes
     */
    public function writeBytes($bytes)
    {
        $this->_writer->write($bytes);
    }
}