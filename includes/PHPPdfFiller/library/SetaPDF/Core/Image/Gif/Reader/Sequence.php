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
 * Class used to read GIF sequences.
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Image
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Image_Gif_Reader_Sequence
{
    /**
     * The currently used reader instance.
     *
     * @var SetaPDF_Core_Reader_Binary
     */
    private $_reader;

    /**
     * The buffer that will get filled with all the sequences.
     *
     * @var string
     */
    private $_buffer;

    /**
     * The current sequence position.
     *
     * @var int
     */
    private $_currentPos;

    /**
     * The position at the start of the sequence.
     *
     * @var int
     */
    private $_initialPos;

    private $_reachedEnd = false;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Reader_Binary $reader
     */
    public function __construct(SetaPDF_Core_Reader_Binary $reader)
    {
        $this->_reader = $reader;
        $this->_currentPos = $this->_initialPos = $this->_reader->getReader()->getOffset() + $this->_reader->getReader()->getPos();
        $this->_buffer = '';
    }

    /**
     * Gets the currently attached reader instance.
     *
     * @return SetaPDF_Core_Reader_Binary
     */
    public function getReader()
    {
        return $this->_reader;
    }

    /**
     * Resets the buffer.
     */
    public function reset()
    {
        $this->_buffer = '';
        $this->_currentPos = $this->_initialPos;
        $this->_reachedEnd = false;
    }

    /**
     * Reads a single byte from the sequence.
     *
     * @return false|string
     */
    public function readByte()
    {
        return $this->readBytes(1);
    }

    /**
     * Reads parts of the sequence.
     *
     * @param int $length
     * @return false|string
     */
    public function readBytes($length)
    {

        $strLen = strlen($this->_buffer);
        if ($strLen < $length) {
            if ($this->_reachedEnd) {
                return false;
            }

            while ($strLen < $length) {
                $sectionLength = $this->_reader->readByte($this->_currentPos);

                if ($sectionLength === false) {
                    throw new SetaPDF_Core_Image_Exception('Could not read sequence.');
                }

                $sectionLength = SetaPDF_Core_BitConverter::formatFromUInt8($sectionLength);
                if ($sectionLength === 0) {
                    $this->_reachedEnd = true;
                    return false;
                }

                $bytes = $this->_reader->readBytes($sectionLength, $this->_currentPos + 1);

                if ($bytes === false) {
                    throw new SetaPDF_Core_Image_Exception('Could not read sequence.');
                }

                $this->_buffer .= $bytes;

                $this->_currentPos += ($sectionLength + 1);
                $strLen += $sectionLength;
            }
        }

        if ($strLen > $length) {
            $result = substr($this->_buffer, 0, $length);
            $this->_buffer = substr($this->_buffer, $length);
        } else {
            $result = $this->_buffer;
            $this->_buffer = '';
        }

        return $result;
    }

    /**
     * Returns the buffer length.
     *
     * @return int
     */
    public function getBufferLength()
    {
        return strlen($this->_buffer);
    }

    /**
     * Reads the whole stream and moves to the end of it.
     */
    public function readUntilEndOfStream()
    {
        if ($this->_reachedEnd) {
            return;
        }

        do {
            $sectionLength = $this->_reader->readByte($this->_currentPos++);
            if ($sectionLength !== false) {
                $sectionLength = SetaPDF_Core_BitConverter::formatFromUInt8($sectionLength);
                $bytes = $this->_reader->readBytes($sectionLength, $this->_currentPos);

                if ($bytes === false) {
                    throw new SetaPDF_Core_Image_Exception('Could not read sequence.');
                }

                $this->_buffer .= $bytes;

                $this->_currentPos += $sectionLength;
            }
        } while ($sectionLength !== 0 && $sectionLength !== false);

        if ($sectionLength === false) {
            throw new SetaPDF_Core_Image_Exception('Could not read sequence.');
        }

        $this->_reachedEnd = true;
    }
}