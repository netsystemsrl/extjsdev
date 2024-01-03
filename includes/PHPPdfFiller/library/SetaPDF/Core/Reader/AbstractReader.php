<?php
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: AbstractReader.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * An abstract reader class
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Reader_AbstractReader
{
    /**
     * The length of the buffer
     *
     * @var int
     */
    protected $_length = 0;
    
    /**
     * The total length
     *
     * @var int
     */
    protected $_totalLength = null;
    
    /**
     * The current file position
     *
     * @var int
     */
    public $_pos = 0;
    
    /**
     * The offset to the current position
     * 
     * @var int
     */
    protected $_offset = 0;
    
    /**
     * The current buffer
     *
     * @var string
     */
    protected $_buffer = '';
    
    /**
     * Returns the byte length of the buffer.
     *
     * @param boolean $atOffset
     * @return int
     */
    public function getLength($atOffset = false)
    {
        if ($atOffset === false) {
            return $this->_length;
        }

        return $this->_length - $this->_offset;
    }
    
    /**
     * Get the current position of the pointer.
     * 
     * @return int
     */
    public function getPos()
    {
        return $this->_pos;
    }
    
    /**
     * Returns the current buffer.
     *
     * @param boolean $atOffset
     * @return string
     */
    public function getBuffer($atOffset = true)
    {
        if ($atOffset === false)
            return $this->_buffer;
        
        $string = substr($this->_buffer, $this->_offset);
        
        return (string)$string;
    }

    /**
     * Gets a byte at a specific position.
     * 
     * If the position is invalid the method will return false.
     *
     * If non position is set $this->_offset will used.
     *
     * @param integer $pos
     * @return string|boolean
     */
    public function getByte($pos = null)
    {
        $pos = (int)(null !== $pos ? $pos : $this->_offset);
        if ($pos >= $this->_length &&
            ((!$this->increaseLength()) || $pos >= $this->_length)
        ) {
            return false;
        }
        
        return $this->_buffer[$pos];
    }
    
    /**
     * Returns a byte at a specific position, returns it and set the offset to the next byte position.
     *
     * If the position is invalid the method will return false.
     *
     * If non position is set $this->_offset will used.
     * 
     * @param integer $pos
     * @return string|boolean
     */
    public function readByte($pos = null)
    {
        if ($pos !== null) {
            $pos = (int)$pos;
            // check if needed bytes are available in the current buffer
            if (!($pos >= $this->_pos && $pos < $this->_pos + $this->_length)) {
                $this->reset($pos);
                $offset = $this->_offset;
            } else {
                $offset = $pos - $this->_pos;
            }
        } else {
            $offset = $this->_offset;
        }

        if ($offset >= $this->_length &&
            ((!$this->increaseLength()) || $offset >= $this->_length)
        ) {
            return false;
        }

        $this->_offset = $offset + 1;
        return $this->_buffer[$offset];
    }
    
    /**
     * Get a specific byte count from the current or at a specific offset position and set the
     * internal pointer to the next byte.
     *
     * If the position is invalid the method will return false.
     *
     * If non position is set $this->_offset will used.
     *
     * @param integer $length
     * @param integer $pos
     * @return string
     */
    public function readBytes($length, $pos = null)
    {
        $length = (int)$length;
        if ($pos !== null) {
            // check if needed bytes are available in the current buffer
            if (!($pos >= $this->_pos && $pos < $this->_pos + $this->_length)) {
                $this->reset($pos, $length);
                $offset = $this->_offset;
            } else {
                $offset = $pos - $this->_pos;
            }
        } else {
            $offset = $this->_offset;
        }

        if (($offset + $length) > $this->_length &&
            ((!$this->increaseLength($length)) || ($offset + $length) > $this->_length)
        ) {
            return false;
        }

        if ($length === 0) {
            return '';
        }

        $bytes = substr($this->_buffer, $offset, $length);
        $this->_offset = $offset + $length;

        return $bytes;
    }

    /**
     * Read a line from the current position.
     *
     * @param integer $length
     * @return string
     * @throws SetaPDF_Core_Reader_Exception
     */
    public function readLine($length = 1024)
    {
        if ($this->ensureContent() === false)
            return false;
            
        $line = '';
        while ($this->ensureContent()) {
            $char = $this->readByte();

            if ($char === "\n") {
                break;
            }

            if ($char === "\r") {
                if ($this->getByte() === "\n")
                    $this->addOffset(1);
                break;
            }

            $line .= $char;
            
            if (strlen($line) >= $length)
                break;
        }

        return $line;
    }
    
    /**
     * Set the offset position.
     *
     * @param int $offset
     * @throws SetaPDF_Core_Reader_Exception
     */
    public function setOffset($offset)
    {
        if ($offset > $this->_length || $offset < 0) {
        	throw new SetaPDF_Core_Reader_Exception(sprintf('Offset (%s) out of range', $offset));
        }
        
        $this->_offset = (int)$offset;
    }
    
    /**
     * Returns the current offset of the current position.
     * 
     * @return integer
     */
    public function getOffset()
    {
        return $this->_offset;
    }

    /**
     * Add an offset to the current offset.
     *
     * @param integer $offset
     * @throws SetaPDF_Core_Reader_Exception
     */
    public function addOffset($offset)
    {
        $this->setOffset($this->_offset + $offset);
    }
    
    /**
     * Make sure that there is at least one character beyond the current offset in the buffer.
     * 
     * @return boolean
     */
    public function ensureContent()
    {
        while($this->_offset >= $this->_length) {
            if (!$this->increaseLength()) {
                return false;
            }
        }
        return true;
    }

    /**
     * Ensures bytes in the buffer with a specific length and location in the file.
     *
     * @param int $pos
     * @param int $length
     * @see reset()
     */
    public function ensure($pos, $length)
    {
        if (
            $pos >= $this->_pos
            && $pos < ($this->_pos + $this->_length)
            && ($this->_pos + $this->_length) >= ($pos + $length)
        ) {
            $this->_offset = $pos - $this->_pos;
        } else {
            $this->reset($pos, $length);
        }
    }

    /**
     * Forcefully read more data into the buffer.
     *
     * @param int $length
     */
    abstract public function increaseLength($length = 100);

    /**
     * Resets the buffer to a specific position and reread the buffer with the given length.
     *
     * If the $pos is negative the start buffer position will be the $pos'th position from
     * the end of the file.
     *
     * If the $pos is negative and the absolute value is bigger then the totalLength of
     * the file $pos will set to zero.
     *
     * @param int|null $pos Start position of the new buffer
     * @param int $length Length of the new buffer. Mustn't be negative
     */
    abstract public function reset($pos, $length = 200);
}