<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: TempFile.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A writer class for temporary files
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Writer_TempFile
    implements SetaPDF_Core_Writer_WriterInterface, SetaPDF_Core_Writer_FileInterface
{
    /**
     * A temporary directory path
     *
     * @var string|null
     */
    static $_tempDir = null;

    /**
     * The file prefix for the temporary files
     *
     * @var string
     */
    static $_filePrefix = '.htSetaPDF';

    /**
     * Defines if the temporary file should be deleted in the destruct method or not
     *
     * @var bool
     */
    static protected $_keepFile = false;

    /**
     * Set the temporary directory path.
     *
     * @param null|string $tempDir
     * @throws InvalidArgumentException
     */
    static public function setTempDir($tempDir)
    {
        if ($tempDir !== null && !is_writable($tempDir)) {
            throw new InvalidArgumentException('Temporary path is not writable.');
        }

        self::$_tempDir = $tempDir;
    }

    /**
     * Get the current temporary directory path.
     *
     * @return null|string
     */
    static public function getTempDir()
    {
        if (null === self::$_tempDir)
            return sys_get_temp_dir();

        return self::$_tempDir;
    }

    /**
     * Set the file prefix for temporary files.
     *
     * @param string $filePrefix
     */
    static public function setFilePrefix($filePrefix)
    {
        self::$_filePrefix = $filePrefix;
    }

    /**
     * Get the file prefix for temporary files.
     *
     * @return string
     */
    static public function getFilePrefix()
    {
        return self::$_filePrefix;
    }

    /**
     * Set whether files should be kept or deleted automatically when an instance is destructed.
     *
     * @param bool $keepFile
     */
    static public function setKeepFile($keepFile)
    {
        self::$_keepFile = (boolean)$keepFile;
    }

    /**
     * Get whether files should be kept or deleted automatically when an instance is destructed.
     *
     * @return bool
     */
    static public function getKeepFile()
    {
        return self::$_keepFile;
    }

    /**
     * Creates a temporary path.
     *
     * If a parameters is left, the static class method ({@link getTempDir()} or {@link getFilePrefix()}) will be
     * used to resolve the desired data.
     *
     * @param null $tempDir
     * @param null $filePrefix
     *
     * @return string
     * @throws InvalidArgumentException
     */
    static public function createTempPath($tempDir = null, $filePrefix = null)
    {
        $filename = md5(uniqid(rand(), true) . time() . rand());

        $tempDir = $tempDir === null ? self::getTempDir() : $tempDir;
        if ($tempDir) {
            $tempDir = realpath($tempDir);
        }

        if (!$tempDir) {
            throw new InvalidArgumentException('No valid temporary path defined.');
        }

        $tempDir .= DIRECTORY_SEPARATOR;

        if (!is_writable($tempDir)) {
            throw new InvalidArgumentException('Temporary path is not writable.');
        }

        $path = $tempDir
            . ($filePrefix === null ? self::getFilePrefix() : $filePrefix)
            . $filename;

        return $path;
    }

    /**
     * Temporary file writers.
     *
     * @var array
     */
    static public $tempWriters = array();

    /**
     * Creates a temporary file and returns the temporary path to it.
     *
     * @param string $content
     * @return string
     */
    static public function createTempFile($content)
    {
        $writer = new self();
        $writer->start();
        $writer->write($content);
        $writer->finish();

        self::$tempWriters[] = $writer;

        return $writer->getPath();
    }

    /**
     * The internal file writer instance.
     *
     * @var SetaPDF_Core_Writer_File
     */
    protected $_writer;

    /**
     * The constructor.
     *
     * @param null $tempDir
     * @param null $filePrefix
     */
    public function __construct($tempDir = null, $filePrefix = null)
    {
        $this->_writer = new SetaPDF_Core_Writer_File(self::createTempPath($tempDir, $filePrefix));
    }

    /**
     * The destructor.
     *
     * This method deletes the temporary file.
     * This behavior could be controlled by the {@link setKeepFile()}-method.
     */
    public function __destruct()
    {
        $path = $this->_writer->getPath();

        if ($this->_writer->getStatus() !== SetaPDF_Core_Writer::CLEANED_UP) {
            $this->_writer->cleanUp();
        }

        if (self::$_keepFile === false) {
            @unlink($path);
        }
    }

    /**
     * Get the path of the temporary file.
     *
     * @return string
     */
    public function getPath()
    {
        return $this->_writer->getPath();
    }

    /**
     * Proxy method.
     *
     * @see SetaPDF_Core_Writer_WriterInterface::cleanUp()
     */
    public function cleanUp()
    {
        $this->_writer->cleanUp();
    }

    /**
     * Proxy method.
     *
     * @see SetaPDF_Core_Writer_WriterInterface::finish()
     */
    public function finish()
    {
        $this->_writer->finish();
    }

    /**
     * Proxy method.
     *
     * @return int
     * @see SetaPDF_Core_Writer_WriterInterface::getPos()
     */
    public function getPos()
    {
        return $this->_writer->getPos();
    }

    /**
     * Proxy method.
     *
     * @see SetaPDF_Core_Writer_WriterInterface::finish()
     */
    public function start()
    {
        $this->_writer->start();
    }

    /**
     * Proxy method.
     *
     * @param string $s
     * @see SetaPDF_Core_Writer_WriterInterface::write()
     */
    public function write($s)
    {
        $this->_writer->write($s);
    }

    /**
     * Proxy method.
     *
     * @return int|string
     * @see SetaPDF_Core_Writer_WriterInterface::getStatus()
     */
    public function getStatus()
    {
        return $this->_writer->getStatus();
    }
}