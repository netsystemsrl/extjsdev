<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: String.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A writer class for string results
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Writer_String
    extends SetaPDF_Core_Writer_Echo
{
    /**
     * The string buffer
     *
     * @var string
     */
    protected $_buffer = '';

    /**
     * Initiate the buffer property.
     */
    public function start()
    {
        $this->_buffer = '';
        parent::start();
    }

    /**
     * Add content to the buffer.
     *
     * @param string $s
     */
    public function write($s)
    {
        $this->_buffer .= $s;
        $this->_pos += strlen($s);
    }

    /**
     * Get the string buffer.
     *
     * @return string
     */
    public function getBuffer()
    {
        return $this->_buffer;
    }

    /**
     * __toString()-implementation.
     *
     * @return string
     */
    public function __toString()
    {
        return $this->getBuffer();
    }
}