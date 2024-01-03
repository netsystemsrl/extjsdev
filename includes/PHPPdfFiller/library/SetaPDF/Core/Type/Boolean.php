<?php
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Boolean.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a boolean value
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_Boolean extends SetaPDF_Core_Type_AbstractType
    implements SetaPDF_Core_Type_ScalarValue
{
    /**
     * The value
     * 
     * @var $_value boolean
     */
    protected $_value = false;

    /**
     * Parses a boolean value to a pdf boolean string and writes it into a writer.
     *
     * @see SetaPDF_Core_Type_AbstractType
     * @param SetaPDF_Core_WriteInterface $writer
     * @param boolean $value
     * @return void
     */
    static public function writePdfString(SetaPDF_Core_WriteInterface $writer, $value)
    {
        $writer->write($value ? ' true' : ' false');
    }

    /** @noinspection PhpMissingParentConstructorInspection */
    /**
     * The constructor.
     * 
     * @param boolean $value
     */
    public function __construct($value = null)
    {
        unset($this->_observed);
        if (!$value)
            unset($this->_value);
        else
            $this->_value = true;
    }

    /**
     * Implementation of __wakeup.
     *
     * @internal
     */
    public function __wakeup()
    {
        if (!$this->_value) {
            unset($this->_value);
        }
        
        parent::__wakeup();
    }
    
    /**
     * Set the value.
     * 
     * @param boolean $value
     */
    public function setValue($value)
    {
        $value = (boolean)$value;
            
        if ($value === isset($this->_value)) {
            return;
        }
            
        if ($value === true) {
            $this->_value = true;
        } else {
            unset($this->_value);
        }
        
        if (isset($this->_observed))
            $this->notify();
    }
    
    /**
     * Gets the value.
     * 
     * @return boolean
     */
    public function getValue()
    {
        return isset($this->_value);
    }
    
    /**
     * Returns the type as a formatted PDF string.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     * @return string
     */
    public function toPdfString(SetaPDF_Core_Document $pdfDocument)
    {
        return isset($this->_value)
            ? ' true'
            : ' false';
    }

    /**
     * Writes the type as a formatted PDF string to the document.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     */
    public function writeTo(SetaPDF_Core_Document $pdfDocument)
    {
        self::writePdfString($pdfDocument, isset($this->_value));
    }
    
    /**
     * Converts the PDF data type to a PHP data type and returns it.
     * 
     * @return boolean
     */
    public function toPhp()
    {
        return isset($this->_value);
    }
}