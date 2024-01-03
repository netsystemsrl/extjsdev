<?php
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Name.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a name object
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_Name extends SetaPDF_Core_Type_AbstractType
    implements SetaPDF_Core_Type_ScalarValue
{
    /**
     * The plaintext value
     * 
     * @var string
     */
    protected $_value = '';
    
    /**
     * The escaped value
     * 
     * @var string
     */
    protected $_rawValue = '';
    
    /**
     * Converting a character into a 2-digit hexadecimal code prefixed by a number sign.
     * 
     * @param array $matches
     * @return string
     */
    static protected function _escapeChar($matches)
    {
        return '#' . dechex(ord($matches[0]));
    }
    
    /**
     * Converts a 2-digit hexadecimal code representation into a single byte/character.
     * 
     * @param array $matches
     * @return string
     */
    static protected function _unescapeChar($matches)
    {
        return chr(hexdec($matches[0]));
    }
    
    /**
     * Escapes a name string.
     * 
     * @param string $value
     * @return string
     */
    static public function escape($value)
    {
        $pattern = '/[\x00-\x21\x7E-\xFF\(\)<>\[\]{}\/%#]/';
        if (!preg_match($pattern, $value))
            return $value;

        $value = preg_replace_callback(
			$pattern, array('SetaPDF_Core_Type_Name', '_escapeChar'), $value
        );
        
        return $value;
    }

    /**
     * Unescapes a name string.
     * 
     * @param string $value
     * @return string
     */
    static public function unescape($value)
    {
        if (false === strpos($value, '#'))
            return $value;
            
        return preg_replace_callback(
            '/#[a-fA-F\d]{2}/', array('SetaPDF_Core_Type_Name', '_unescapeChar'), $value
        );
    }

    /**
     * Parses a php string value to a pdf name string and write it into a writer.
     *
     * @see SetaPDF_Core_Type_AbstractType
     * @param SetaPDF_Core_WriteInterface $writer
     * @param string $value
     * @param boolean $isRawValue
     * @return void
     */
    static public function writePdfString(SetaPDF_Core_WriteInterface $writer, $value, $isRawValue = false)
    {
    	$writer->write('/' . (
            $isRawValue
            ? $value
            : self::escape($value)
    	));
    }

    /** @noinspection PhpMissingParentConstructorInspection */
    /**
     * The constructor.
     * 
     * @param string $value
     * @param boolean $raw
     */
    public function __construct($value = null, $raw = false)
    {
        unset($this->_observed);
        
        if (null !== $value) {
            if (true == $raw) {
                $this->_rawValue = (string)$value;
                unset($this->_value);
            } else {
                $this->_value = (string)$value;
                unset($this->_rawValue);
            }
        }
    }

    /**
     * Implementation of __wakeup.
     *
     * @internal
     */
    public function __wakeup()
    {
    	if ($this->_value === '' && $this->_rawValue !== '')
    		unset($this->_value);
    
    	if ($this->_rawValue === '' && $this->_value !== '')
    		unset($this->_rawValue);
    
    	parent::__wakeup();
    }
    
    /**
     * Set the name value.
     * 
     * @see SetaPDF_Core_Type_AbstractType::setValue()
     * @param mixed $value
     */
    public function setValue($value)
    {
        $value = (string)$value;
            
        if (isset($this->_value) && $value === $this->_value)
            return;
        
        /**
         * PDF Reference Annex C:
         * Maximum length of a name, in bytes = 127
         */
        $this->_value = $value;
        if (isset($this->_rawValue))
	        unset($this->_rawValue);
        
        if (isset($this->_observed))
            $this->notify();
    }
    
    /**
     * Get the name value.
     * 
     * @see SetaPDF_Core_Type_AbstractType::getValue()
     * @return string
     */
    public function getValue()
    {
        return isset($this->_rawValue)
             ? self::unescape($this->_rawValue)
             : $this->_value;
    }

    /**
     * Returns the type as a formatted PDF string.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     * @return string
     */
    public function toPdfString(SetaPDF_Core_Document $pdfDocument)
    {
        return '/' . (
            isset($this->_rawValue)
            ? $this->_rawValue
            : self::escape($this->_value)
        );
    }

    /**
     * Writes the type as a formatted PDF string to the document.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     */
    public function writeTo(SetaPDF_Core_Document $pdfDocument)
    {
        $pdfDocument->write($this->toPdfString($pdfDocument));
    }

    /**
     * Converts the PDF data type to a PHP data type and returns it.
     *
     * @return string
     */
    public function toPhp()
    {
        return $this->getValue();
    }
}