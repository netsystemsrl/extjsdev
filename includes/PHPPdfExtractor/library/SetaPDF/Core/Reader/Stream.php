<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Stream.php 1062 2017-06-20 12:55:44Z jan.slabon $
 */

/**
 * Class for a stream reader
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Reader_Stream
    extends SetaPDF_Core_Reader_AbstractReader
    implements SetaPDF_Core_Reader_ReaderInterface
{
    /**
     * The stream resource
     *
     * @var resource
     */
    protected $_stream;

    /**
     * The constructor.
     *
     * @param resource $stream
     */
    public function __construct($stream)
    {
        $this->_setStream($stream);
    }

    /**
     * The destruct method.
     *
     * @see http://www.php.net/__destruct
     */
    public function __destruct()
    {
        $this->cleanUp();
    }

    /**
     * Implementation of the __sleep() method.
     *
     * It is not possible to serialize a stream reader because a stream is not serializable.
     *
     * @throws BadMethodCallException
     */
    public function __sleep()
    {
        throw new BadMethodCallException('You cannot serialize a stream reader instance.');
    }

    /**
     * Set the stream.
     *
     * @param resource $stream
     * @throws InvalidArgumentException
     */
    protected function _setStream($stream)
    {
        if (!is_resource($stream)) {
            throw new InvalidArgumentException(
                'No stream given.'
            );
        }

        $metaData = stream_get_meta_data($stream);
        if (!$metaData['seekable']) {
            throw new InvalidArgumentException(
                'Given stream is not seekable!'
            );
        }

        $this->_stream = $stream;

        $this->_totalLength = null;
        $this->reset();
    }

    /**
     * Returns the stream.
     *
     * @return resource
     */
    public function getStream()
    {
        return $this->_stream;
    }

    /**
     * Gets the total available length.
     *
     * @return int
     */
    public function getTotalLength()
    {
        if (null === $this->_totalLength) {
            $stat = fstat($this->_stream);
            $this->_totalLength = $stat['size'];
        }

        return $this->_totalLength;
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
        if (null === $pos) {
            $pos = $this->_pos + $this->_offset;
        } elseif ($pos < 0) {
            $pos = max(0, $this->getTotalLength() + $pos);
        }

        fseek($this->_stream, $pos);

        $this->_pos = $pos;
        $this->_buffer = $length > 0 ? fread($this->_stream, $length) : '';
        $this->_length = strlen($this->_buffer);
        $this->_offset = 0;

        // If a stream wrapper is in use it is possible that
        // length values > 8096 will be ignored, so use the
        // increaseLength()-method to correct that behavior
        if ($this->_length < $length && $this->increaseLength($length - $this->_length)) {
            // increaseLength parameter is $minLength, so cut to have only the required bytes in the buffer
            $this->buffer = substr($this->_buffer, 0, $length);
            $this->bufferLength = strlen($this->_buffer);
        }
    }

    /**
     * Forcefully read more data into the buffer.
     *
     * @param int $minLength
     * @return boolean
     */
    public function increaseLength($minLength = 100)
    {
        $length = max($minLength, 100);

        if (feof($this->_stream) || $this->getTotalLength() == $this->_pos + $this->_length) {
            return false;
        }

        $newLength = $this->_length + $length;
        do {
            $this->_buffer .= fread($this->_stream, $newLength - $this->_length);
        } while ((($this->_length = strlen($this->_buffer)) != $newLength) && !feof($this->_stream));

        return true;
    }

    /**
     * Copies the complete content to a writer instance.
     *
     * @param SetaPDF_Core_WriteInterface $writer
     */
    public function copyTo(SetaPDF_Core_WriteInterface $writer)
    {
        if ($writer instanceof SetaPDF_Core_Writer_File) {
            $writer->copy($this->_stream);
            return;
        }

        $currentPos = $this->getPos();
        fseek($this->_stream, 0);
        while (!feof($this->_stream)) {
            $writer->write(fread($this->_stream, 8192));
        }

        fseek($this->_stream, $currentPos);
    }

    /**
     * Implementation of SetaPDF_Core_Reader_ReaderInterface (empty body for this type of reader).
     *
     * @see SetaPDF_Core_Reader_ReaderInterface::sleep()
     */
    public function cleanUp()
    {
        // empty body...
    }
}