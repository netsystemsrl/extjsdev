<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: File.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A writer class for files or writable streams
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Writer_File
    extends SetaPDF_Core_Writer_AbstractWriter
    implements SetaPDF_Core_Writer_WriterInterface, SetaPDF_Core_Writer_FileInterface
{
    /**
     * Path to the output file
     *
     * @var string
     */
    protected $_path;

    /**
     * The file handle resource
     *
     * @var null|resource
     */
    protected $_handle;

    /**
     * The constructor.
     *
     * @param string $path The path to the output file
     */
    public function __construct($path)
    {
        $this->_path = $path;
    }

    /**
     * Get the file path of the writer.
     *
     * @return string
     */
    public function getPath()
    {
        return $this->_path;
    }

    /**
     * Method called when the writing process starts.
     *
     * It setups the file handle for this writer.
     */
    public function start()
    {
        // TODO: Handle this without @-sign
        $this->_handle = @fopen($this->_path, 'wb');
        if (false === $this->_handle) {
            throw new SetaPDF_Core_Writer_Exception(
                sprintf('Unable to open "%s" for writing.', $this->_path)
            );
        }

        parent::start();
    }

    /**
     * Write the content to the output file.
     *
     * @param string $s
     */
    public function write($s)
    {
        fwrite($this->_handle, $s);
    }

    /**
     * This method is called when the writing process is finished.
     *
     * It closes the file handle.
     */
    public function finish()
    {
        fclose($this->_handle);
        parent::finish();
    }

    /**
     * Returns the current position of the output file.
     *
     * @return integer
     */
    public function getPos()
    {
        return ftell($this->_handle);
    }

    /**
     * Copies an existing file into the target file and resets the file handle to the end of the file.
     *
     * @param resource $source
     */
    public function copy($source)
    {
        if (!is_resource($source)) {
            throw new InvalidArgumentException('SetaPDF_Core_Writer_File::copy needs a stream as param.');
        }

        $sourcePos = ftell($source);
        fseek($source, 0);
        stream_copy_to_stream($source, $this->_handle);
        fseek($source, $sourcePos);
    }

    /**
     * Close the file handle if needed.
     *
     * @see SetaPDF_Core_Writer_AbstractWriter::cleanUp()
     */
    public function cleanUp()
    {
        if ($this->_status > SetaPDF_Core_Writer::FINISHED && is_resource($this->_handle)) {
            fclose($this->_handle);
        }

        parent::cleanUp();
    }
}