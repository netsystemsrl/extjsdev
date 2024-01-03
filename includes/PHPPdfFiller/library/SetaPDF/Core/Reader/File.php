<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: File.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class for a file reader
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Reader_File
    extends SetaPDF_Core_Reader_Stream
    implements SetaPDF_Core_Reader_ReaderInterface
{
    /**
     * The filename
     *
     * @var string
     */
    protected $_filename = '';

    /** @noinspection PhpMissingParentConstructorInspection */
    /**
     * The constructor.
     *
     * @param string $filename
     */
    public function __construct($filename)
    {
        $this->_setFilename($filename);
    }

    /**
     * Implementation of the __sleep() method.
     *
     * @return array
     */
    public function __sleep()
    {
        return array_keys(get_class_vars(get_class($this)));
    }

    /**
     * Opens the file.
     *
     * Mainly used for testing purposes.
     *
     * @param string $filename
     * @return resource
     */
    protected function _openFile($filename)
    {
        return fopen($filename, 'rb');
    }

    /**
     * Closes the file handle.
     *
     * Mainly used for testing purposes.
     *
     * @see SetaPDF_Core_Reader_File::_fp
     */
    protected function _closeFile()
    {
        return @fclose($this->_stream);
    }

    /**
     * Wakeup method.
     *
     * @see http://www.php.net/language.oop5.magic.php#language.oop5.magic.sleep
     */
    public function __wakeup()
    {
        $this->_setFilename($this->_filename);
    }

    /**
     * Set the filename.
     *
     * @param string $filename
     * @throws SetaPDF_Core_Reader_Exception
     */
    protected function _setFilename($filename)
    {
        if (is_resource($this->_stream)) {
            $this->_closeFile();
        }

        if (strpos($filename, "\x00") !== false) {
            throw new SetaPDF_Core_Reader_Exception(
                'Filename includes a null character. It is not a valid filename/path.'
            );
        }

        if (!file_exists($filename) || !is_readable($filename)) {
            throw new SetaPDF_Core_Reader_Exception(
                sprintf('Cannot open %s.', $filename)
            );
        }

        $fp = $this->_openFile($filename);
        if (false === $fp) {
            throw new SetaPDF_Core_Reader_Exception(
                sprintf('Cannot open %s.', $filename)
            );
        }

        $this->_filename = $filename;
        $this->_setStream($fp);
    }

    /**
     * Returns the filename.
     *
     * @return string
     */
    public function getFilename()
    {
        return $this->_filename;
    }

    /**
     * Close the file handle.
     *
     * @see SetaPDF_Core_Reader_ReaderInterface::cleanUp()
     */
    public function cleanUp()
    {
        if (is_resource($this->_stream)) {
            $this->_closeFile();
        }
    }
}