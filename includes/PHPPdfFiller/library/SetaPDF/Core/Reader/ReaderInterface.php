<?php
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: ReaderInterface.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Interface of a reader implementation 
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_Reader_ReaderInterface
{
    /**
     * Returns the byte length of the buffer.
     *
     * @param boolean $atOffset
     * @return int
     */
    public function getLength($atOffset = false);
    
    /**
     * Gets the total available length.
     * 
     * @return int
     */
    public function getTotalLength();
    
    /**
     * Gets the current position of the pointer.
     * 
     * @return int
     */
    public function getPos();
    
    /**
     * Returns the current buffer.
     *
     * @param boolean $atOffset
     * @return string
     */
    public function getBuffer($atOffset = true);
    
    /**
     * Get the byte at the current or at a specific offset position and sets the internal
     * pointer to the next byte.
     * 
     * @param integer $pos
     * @return string
     */
    public function readByte($pos = null);
    
    /**
     * Get a specific byte count from the current or at a specific offset position and set
     * the internal pointer to the next byte.
     * 
     * @param integer $length
     * @param integer $pos
     * @return string
     */
    public function readBytes($length, $pos = null);
    
    /**
     * Get the byte at the current or at a specific offset position.
     *
     * @param int $pos
     * @return string
     */
    public function getByte($pos = null);
    
    /**
     * Reads a line from the current buffer.
     * 
     * @param int $length
     * @return string
     */
    public function readLine($length = 1024);
    
    /**
     * Sets the offset of the current position.
     *
     * @param int $offset
     */
    public function setOffset($offset);
    
    /**
     * Returns the current offset of the current position.
     * 
     * @return integer
     */
    public function getOffset();
    
    /**
     * Adds an offset to the current offset.
     *
     * @param integer $offset
     */
    public function addOffset($offset);
    
    /**
     * Resets the buffer to a specific position and reread the buffer with the given length.
     *
     * @param int|null $pos
     * @param int $length
     */
    public function reset($pos = 0, $length = 100);

    /**
     * Ensures bytes in the buffer with a specific length and location in the file.
     *
     * @param int $pos
     * @param int $length
     * @see reset()
     */
    public function ensure($pos, $length);
    
    /**
     * Make sure that there is at least one character beyond the current offset in the buffer.
     * 
     * @return boolean
     */
    public function ensureContent();
    
    /**
     * Forcefully read more data into the buffer.
     *
     * @param int $minLength
     */
    public function increaseLength($minLength = 100);
    
    /**
     * Copies the complete content to the writer.
     *
     * @param SetaPDF_Core_WriteInterface $writer
     */
    public function copyTo(SetaPDF_Core_WriteInterface $writer);
    
    /**
     * Method which is called when a document is cleaned up.
     */
    public function cleanUp();
}