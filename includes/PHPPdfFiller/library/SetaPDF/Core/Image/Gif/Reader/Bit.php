<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id$
 */

/**
 * Class used to read single bits.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Reader_Bit
{
    /**
     * The reader used to read bytes.
     *
     * @var SetaPDF_Core_Image_Gif_Reader_Sequence
     */
    private $_reader;

    /**
     * The number of bits that get read by readBits() call.
     *
     * @var int
     */
    private $_numBits;

    /**
     * The currently read byte converted to a unsigned int8.
     *
     * @var int
     */
    private $_currentByte;

    /**
     * The bit offset in the current byte.
     *
     * @var int
     */
    private $_bitOffset;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Image_Gif_Reader_Sequence $reader
     */
    public function __construct(SetaPDF_Core_Image_Gif_Reader_Sequence $reader)
    {
        $this->_reader = $reader;
        $this->_bitOffset = 0;
    }

    /**
     * Sets the number of bits that shall be read.
     *
     * @param int $numBits
     */
    public function setNumBits($numBits)
    {
        $this->_numBits = $numBits;
    }

    /**
     * Gets the currently attached reader instance.
     *
     * @return SetaPDF_Core_Image_Gif_Reader_Sequence
     */
    public function getReader()
    {
        return $this->_reader;
    }

    /**
     * Reads a new byte.
     *
     * @return false|int
     */
    private function _readByte()
    {
        $this->_currentByte = $this->_reader->readByte();
        if ($this->_currentByte !== false) {
            $this->_currentByte = SetaPDF_Core_BitConverter::formatFromUInt8($this->_currentByte);
        }

        return $this->_currentByte;
    }

    /**
     * Reads the next bits.
     *
     * @return int
     * @throws SetaPDF_Core_Image_Exception
     */
    public function readBits()
    {
        $bitsWritten = 0;
        $output = 0;

        while ($this->_numBits - $bitsWritten > 0) {
            if ($this->_bitOffset === 0) {
                $this->_readByte();
                $this->_bitOffset = 8;
            }

            if ($this->_currentByte === false) {
                if ($bitsWritten > 0) {
                    // if we had part of a byte to read, but we need more data, just fill it with a zero byte.
                    $byte = 0x00;
                } else {
                    throw new SetaPDF_Core_Image_Exception('Byte exceeded length.');
                }
            } else {
                $byte =  $this->_currentByte >> (8 - $this->_bitOffset);
            }
            $leftBits = $this->_numBits - $bitsWritten;
            if ($leftBits > $this->_bitOffset) {
                $bitsToRead = $this->_bitOffset;
            } else {
                $bitsToRead = $leftBits;
            }

            $tmp = $byte & ((1 << $bitsToRead) - 1);

            $output |= $tmp << $bitsWritten;
            $bitsWritten += $bitsToRead;
            $this->_bitOffset -= $bitsToRead;
        }

        return $output;
    }
}