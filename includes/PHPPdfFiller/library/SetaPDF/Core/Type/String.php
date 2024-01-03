<?php
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: String.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a string
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_String extends SetaPDF_Core_Type_AbstractType
    implements SetaPDF_Core_Type_StringValue, SetaPDF_Core_Type_ScalarValue
{
    /**
     * The plaintext value
     * 
     * @var string
     */
    protected $_value = '';
    
    /**
     * The escaped/encrypted value
     * 
     * @var string
     */
    protected $_rawValue = '';
    
    /**
     * The original owning object.
     * 
     * Needed if the string is encrypted
     * 
     * @var SetaPDF_Core_Type_IndirectObject
     */
    protected $_owningObject;
    
    /**
     * Flag saying that the stream is encrypted or not
     *
     * @var boolean
     */
    protected $_encrypted = false;
    
    /**
     * Flag saying that this stream should by pass the security handler
     *
     * @var boolean
     */
    protected $_bypassSecHandler = false;
    
    /**
     * Escapes sequences in a string according to the PDF specification.
     *  
     * @param string $s
     * @return string
     */
    static public function escape($s)
    {
        // Still a bit faster, than direct replacing
        if (strpos($s, '\\') !== false ||
            strpos($s, ')')  !== false ||
            strpos($s, '(')  !== false ||
            strpos($s, "\x0D") !== false ||
            strpos($s, "\x0A") !== false ||
            strpos($s, "\x09") !== false ||
            strpos($s, "\x08") !== false ||
            strpos($s, "\x0C") !== false
        )
        {
            // is faster than strtr(...)
            return str_replace(
                array('\\',   ')',   '(',   "\x0D",	"\x0A", "\x09", "\x08", "\x0C"),
                array('\\\\', '\\)', '\\(', '\r',   '\n',   '\t',   '\b',   '\f'),
                $s
            );
        } else {
            return $s;
        }
    }
        
    /**
     * Unescapes escaped sequences in a PDF string according to the PDF specification.
     *
     * @param string $s
     * @return string
     */
    static public function unescape($s)
    {
        $out = '';
        for ($count = 0, $n = strlen($s); $count < $n; $count++) {
            if ($s[$count] != '\\') {
                $out .= $s[$count];
            } else {
                // A backslash at the end of the string - ignore it
                if ($count == ($n - 1))
                    break;
                    
                switch ($s[++$count]) {
                    case ')':
                    case '(':
                    case '\\':
                        $out .= $s[$count];
                        break;
                    case 'f':
                        $out .= "\x0C";
                        break;
                    case 'b':
                        $out .= "\x08";
                        break;
                    case 't':
                        $out .= "\x09";
                        break;
                    case 'r':
                        $out .= "\x0D";
                        break;
                    case 'n':
                        $out .= "\x0A";
                        break;
                    case "\r":
                        if ($count != $n - 1 && $s[$count + 1] == "\n")
                            $count++;
                        break;
                    case "\n":
                        break;
                    default:
                        if (ord($s[$count]) >= ord('0') &&
                            ord($s[$count]) <= ord('9')) {
                            $oct = '' . $s[$count];
                                
                            if ($count + 1 < $n &&
                                ord($s[$count + 1]) >= ord('0') &&
                                ord($s[$count + 1]) <= ord('9')) {
                                $oct .= $s[++$count];
                                
                                if ($count + 1 < $n &&
                                    ord($s[$count + 1]) >= ord('0') &&
                                    ord($s[$count + 1]) <= ord('9')) {
                                    $oct .= $s[++$count];
                                }                           
                            }
                            
                            $out .= chr(octdec($oct));
                        } else {
                            // If the character is not one of those defined, the backslash is ignored
                            $out .= $s[$count];
                        }
                }
            }
        }
        return $out;
    }

    /**
     * Parses a php string value to a pdf string and write it into a writer.
     *
     * @see SetaPDF_Core_Type_AbstractType
     * @param SetaPDF_Core_WriteInterface $writer
     * @param string|mixed $value If it's not a string, it need to have a __toString() implementation.
     * @return void
     */
    static public function writePdfString(SetaPDF_Core_WriteInterface $writer, $value)
    {
    	$writer->write('(' . self::escape((string)$value) . ')');
    }

    /** @noinspection PhpMissingParentConstructorInspection */
    /**
     * The constructor.
     * 
     * @param string $value
     * @param boolean $raw
     * @param SetaPDF_Core_Type_IndirectObject $owningObject
     */
    public function __construct($value = '', $raw = false, SetaPDF_Core_Type_IndirectObject $owningObject = null)
    {
        unset($this->_observed);
        
        if (null !== $value) {
            if (true == $raw) {
                $this->_rawValue = (string)$value;
                if (null !== $owningObject) {
                    $this->_encrypted = true;
                    $this->_owningObject = $owningObject;
                } else {
                    unset($this->_owningObject, $this->_encrypted);
                }
                unset($this->_value);
            } else {
                $this->_value = (string)$value;
                unset($this->_rawValue, $this->_owningObject, $this->_encrypted); // saves 56 bytes property per instance
            }
        } else {
            unset($this->_rawValue, $this->_owningObject, $this->_encrypted); 
        }
        
        unset($this->_bypassSecHandler); // save memory
    }

    /**
     * Implementation of __wakeup.
     *
     * @internal
     */
    public function __wakeup()
    {
        if ($this->_encrypted === false) 
            unset($this->_encrypted);
        
        if ($this->_owningObject === null)
            unset($this->_owningObject);
        
        if ($this->_bypassSecHandler === false)
            unset($this->_bypassSecHandler);
        
        if ($this->_value === '' && $this->_rawValue !== '')
            unset($this->_value);
        
        if ($this->_rawValue === '' && $this->_value !== '')
            unset($this->_rawValue);
        
        parent::__wakeup();
    }
    
    /**
     * Set the string value.
     *
     * @see SetaPDF_Core_Type_AbstractType::setValue()
     * @param string $value
     */
    public function setValue($value)
    {
        $value = (string)$value;
        if (!isset($this->_rawValue) && $this->_value === $value) {
            return;
        }
            
        $this->_value = $value;
        
        /** 
         * if a value is set, related data to the
         * original document/object can be removed
         */
        unset($this->_rawValue, $this->_encrypted, $this->_owningObject);
        
        if (isset($this->_observed))
            $this->notify();
    }
    
    /**
     * Get the string value.
     *
     * @see SetaPDF_Core_Type_AbstractType::getValue()
     * @return string
     */
    public function getValue()
    {
        if (!isset($this->_encrypted)) {
            return isset($this->_rawValue)
                 ? self::unescape($this->_rawValue)
                 : $this->_value;
        }
        
        // decrypt and return
        return $this->_decrypt();
    }
    
    /**
     * Set the bypass security handler flag.
     *
     * @param boolean $bypassSecHandler
     */
    public function setBypassSecHandler($bypassSecHandler = true)
    {
        if ($bypassSecHandler) {
            $this->_bypassSecHandler = true;
            unset($this->_owningObject, $this->_encrypted);
        } else {
            unset($this->_bypassSecHandler);
        }
    }
    
    /**
     * Decrypts the string (if needed).
     *
     * @return string
     */
    protected function _decrypt()
    {
        if (isset($this->_encrypted)) {
            $secHandler = $this->_owningObject->getOwnerPdfDocument()->getSecHandlerIn();
            return $secHandler->decryptString(self::unescape($this->_rawValue), $this->_owningObject);
        }
        
        return $this->_value;
    }
    
    /**
     * Returns the type as a formatted PDF string.
     *
     * @param SetaPDF_Core_Document $pdfDocument
     * @return string
     */
    public function toPdfString(SetaPDF_Core_Document $pdfDocument)
    {
        // Handle write callback in the owner document instance
        $pdfDocument->getCurrentObjectDocument()->handleWriteCallback($this);
        
        $secHandler = $pdfDocument->getSecHandler();
        
        // original string is not encrypted
        if (!isset($this->_encrypted)) {
            // no need to de- or encrypt anything
            if ($secHandler === null || isset($this->_bypassSecHandler)) {
                return '('
                    . (isset($this->_value)
                        ? self::escape($this->_value)
                		: $this->_rawValue)
                		. ')';
            }
            
            // encrypt it through the document security handler
            $value = $secHandler->encryptString(
                isset($this->_value) ? $this->_value : self::unescape($this->_rawValue),
                $pdfDocument->getCurrentObject()
            );
            
            return '(' . self::escape($value) . ')';
        }
        
        /** 
         * String is already encrypted. 
         *
         * IF     the string is based on the same document, object 
         *        and security handlers encryption key, just pass it back
         * ELSE   decrypt it using the owning documents security handler
         *        and encrypt it using the security handler of the new 
         *        document.
         */
        $owningDocument = $this->_owningObject->getOwnerPdfDocument();
        $currentObjectData = $pdfDocument->getCurrentObjectData();
        $secHandlerIn = $owningDocument->getSecHandlerIn();
        if (
            $pdfDocument->getInstanceIdent() == $owningDocument->getInstanceIdent()
            &&
            $this->_owningObject->getObjectId() === $currentObjectData[0] &&
            null !== $secHandler && 
            $secHandlerIn->getEncryptionKey() === $secHandler->getEncryptionKey()
        ) {
            return '(' . $this->_rawValue . ')';
        }
        
        $value = $this->_decrypt();
        if (null !== $secHandler) {
            $value = $secHandler->encryptString($value, $pdfDocument->getCurrentObject());
        } 

        return '(' . self::escape($value) . ')';
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
     * Release objects/memory.
     *
     * @see SetaPDF_Core_Type_AbstractType::cleanUp()
     */
    public function cleanUp()
    {
        if (!isset($this->_observed))
            unset($this->_owningObject);
    }
    
    /**
     * Converts the PDF data type to a PHP data type and returns it.
     *
     * @return string
     */
    public function toPhp()
    {
        return isset($this->_value)
            ? $this->_value
            : self::unescape($this->_rawValue);
    }
}