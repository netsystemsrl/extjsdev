<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Var.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A writer class for a referenced variable
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Writer
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Writer_Var
    extends SetaPDF_Core_Writer_AbstractWriter
    implements SetaPDF_Core_Writer_WriterInterface
{
    /**
     * The variable reference
     *
     * @var string
     */
    protected $_var;

    /**
     * The current position
     *
     * @var integer
     */
    protected $_pos = 0;

    /**
     * The constructor.
     *
     * @param string $var A reference to the variable to write to
     */
    public function __construct(&$var)
    {
        $this->_var =& $var;
    }

    /**
     * Initiate the referenced variable.
     *
     * @see SetaPDF_Core_Writer_AbstractWriter::start()
     */
    public function start()
    {
        $this->_var = '';
        parent::start();
    }

    /**
     * Adds content to the referenced variable.
     *
     * @param string $s
     */
    public function write($s)
    {
        $this->_var .= $s;
        $this->_pos += strlen($s);
    }

    /**
     * Returns the current position.
     *
     * @return integer
     */
    public function getPos()
    {
        return $this->_pos;
    }

    /**
     * __toString()-implementation.
     *
     * @return string
     */
    public function __toString()
    {
        return $this->_var;
    }

    /**
     * Unset the reference to the variable.
     *
     * @see SetaPDF_Core_Writer_AbstractWriter::cleanUp()
     */
    public function cleanUp()
    {
        unset($this->_var);
    }
}