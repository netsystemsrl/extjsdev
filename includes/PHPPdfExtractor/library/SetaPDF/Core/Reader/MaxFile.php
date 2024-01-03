<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: MaxFile.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class for a file reader respecting the maximum allowed open file handles/descriptors.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Reader_MaxFile extends SetaPDF_Core_Reader_File
{
    /**
     * Defines if the reader is sleeping
     *
     * @var boolean
     */
    protected $_sleeping = true;

    /**
     * The position of the point before sleep() was called
     *
     * @var integer
     */
    protected $_sleepPosition = 0;

    /**
     * The handler instance
     *
     * @var SetaPDF_Core_Reader_MaxFileHandler
     */
    protected $_handler;

    /**
     * The constructor.
     *
     * @param string $filename
     * @param SetaPDF_Core_Reader_MaxFileHandler|null $handler The handler to which this instance should be bound and notify
     *                                                    when opening closing file handles.
     * @throws Exception
     */
    public function __construct($filename, SetaPDF_Core_Reader_MaxFileHandler $handler = null)
    {
        $this->setHandler($handler);

        try {
            parent::__construct($filename);
        } catch (Exception $e) {
            if ($handler !== null) {
                $handler->unregisterReader($this);
            }

            throw $e;
        }
    }

    /**
     * Returns the handler instance.
     *
     * @param boolean $check
     * @return SetaPDF_Core_Reader_MaxFileHandler
     */
    public function getHandler($check = true)
    {
        if ($check && (!$this->_handler instanceof SetaPDF_Core_Reader_MaxFileHandler)) {
            throw new BadMethodCallException('No handler attached!');
        }
        return $this->_handler;
    }

    /**
     * Set a handler.
     *
     * @param SetaPDF_Core_Reader_MaxFileHandler|null $handler
     */
    public function setHandler(SetaPDF_Core_Reader_MaxFileHandler $handler = null)
    {
        $this->_handler = $handler;

        if ($this->_handler !== null) {
            $handler->registerReader($this);
        }
    }

    /**
     * Implementation of the __sleep() method.
     *
     * @return array
     */
    public function __sleep()
    {
        throw new BadFunctionCallException('This object is not serializable.');
    }

    /**
     * Release memory/cylced references.
     */
    public function cleanUp()
    {
        // to allow mocking of this object
        if ($this->getHandler(false)) {
            $this->getHandler()->unregisterReader($this);
            $this->setHandler(null);
        }

        parent::cleanUp();
    }

    /**
     * Opens the file.
     *
     * @param string $filename
     * @return resource
     */
    protected function _openFile($filename)
    {
        $this->getHandler()->ensureFreeHandle();
        $fh = parent::_openFile($filename);
        if ($fh !== false) {
            $this->_sleeping = false;
            $this->getHandler()->onHandleOpened();
        }

        return $fh;
    }

    /**
     * Closes the file handle.
     */
    protected function _closeFile()
    {
        if (parent::_closeFile() && $this->getHandler(false)) {
            $this->getHandler()->onHandleClosed();
        }
    }

    /**
     * Gets the total available length.
     *
     * @return int
     */
    public function getTotalLength()
    {
        $this->wakeUp();
        return parent::getTotalLength();
    }

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
    public function reset($pos = 0, $length = 200)
    {
        $this->wakeUp();
        parent::reset($pos, $length);
    }

    /**
     * Forcefully read more data into the buffer.
     *
     * @param int $minLength
     * @return boolean
     */
    public function increaseLength($minLength = 100)
    {
        $this->wakeUp();
        return parent::increaseLength(max(100, $minLength));
    }

    /**
     * Copies the complete content to a writer instance.
     *
     * @param SetaPDF_Core_WriteInterface $writer
     */
    public function copyTo(SetaPDF_Core_WriteInterface $writer)
    {
        $this->wakeUp();
        parent::copyTo($writer);
    }

    /**
     * Checks if the reader is sleeping.
     *
     * @return boolean
     */
    public function isSleeping()
    {
        return $this->_sleeping;
    }

    /**
     * Set the reader into sleep-state.
     *
     * In this implementation the file handles will be closed to avoid reaching the limit
     * of open file handles.
     *
     * @see SetaPDF_Core_Reader_ReaderInterface::sleep()
     */
    public function sleep()
    {
        $this->_sleepPosition = ftell($this->_stream);
        $this->_closeFile();
        $this->_sleeping = true;
    }

    /**
     * Wake up the reader if it is in sleep-state.
     *
     * Re-open the file handle.
     *
     * @see SetaPDF_Core_Reader_ReaderInterface::wakeUp()
     * @throws SetaPDF_Core_Reader_Exception
     * @return boolean
     */
    public function wakeUp()
    {
        if (!$this->isSleeping()) {
            return true;
        }

        $fp = $this->_openFile($this->_filename);

        if (false === $fp) {
            throw new SetaPDF_Core_Reader_Exception(
                sprintf('Cannot open %s.', $this->_filename)
            );
        }

        $this->_stream = $fp;
        fseek($this->_stream, $this->_sleepPosition);
        $this->_sleeping = false;

        return true;
    }
}