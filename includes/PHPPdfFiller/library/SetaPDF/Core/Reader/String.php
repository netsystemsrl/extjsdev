<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: String.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class for a string reader
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Reader
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Reader_String
    extends SetaPDF_Core_Reader_Stream
    implements SetaPDF_Core_Reader_ReaderInterface
{
    /**
     * The complete string.
     *
     * @var string
     */
    protected $_string = '';

    /**
     * The constructor.
     *
     * @param string $string
     */
    public function __construct($string)
    {
        $this->setString($string);
    }

    public function __sleep()
    {
        $this->_string = $this->getString();
        return ['_string'];
    }

    public function __wakeup()
    {
        $this->setString($this->_string);
        $this->_string = '';
    }

    /**
     * Returns the complete string.
     *
     * @return string
     */
    public function __toString()
    {
        return $this->getString();
    }

    /**
     * Set the string.
     *
     * @param string $string
     */
    public function setString($string)
    {
        $stream = fopen('php://temp', 'wb+');
        fwrite($stream, $string);

        $this->_setStream($stream);
    }

    /**
     * Get the complete string.
     *
     * @return string
     */
    public function getString()
    {
        $pos = $this->getPos();
        rewind($this->_stream);

        $string = stream_get_contents($this->_stream);

        $this->reset($pos);

        return $string;
    }

    /**
     * Close the file handle.
     *
     * @see SetaPDF_Core_Reader_ReaderInterface::cleanUp()
     */
    public function cleanUp()
    {
        if (is_resource($this->_stream)) {
            fclose($this->_stream);
        }
    }
}