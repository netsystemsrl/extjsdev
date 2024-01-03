<?php 
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Group.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * An optional content group
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_OptionalContent_Group
    implements SetaPDF_Core_Resource
{
    /**
     * The optional content group dictionary
     *
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_dictionary;
    
    /**
     * The indirect object of this group
     * 
     * @var SetaPDF_Core_Type_IndirectObjectInterface
     */
    protected $_indirectObject;
    
    /**
     * A usage helper class
     * 
     * @var SetaPDF_Core_Document_OptionalContent_Group_Usage
     */
    protected $_usage;
    
    /**
     * Creates an optional content group dictionary.
     * 
     * @param string $name
     * @param string $encoding
     * @return SetaPDF_Core_Type_Dictionary
     */
    static public function createOCGDictionary($name, $encoding = 'UTF-8')
    {
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $dictionary->offsetSet('Type', new SetaPDF_Core_Type_Name('OCG', true));
        $dictionary->offsetSet('Name', new SetaPDF_Core_Type_String(
            SetaPDF_Core_Encoding::toPdfString($name, $encoding))
        );
        
        return $dictionary;
    }
    
    /**
     * The constructor.
     * 
     * @param SetaPDF_Core_Type_IndirectObjectInterface|SetaPDF_Core_Type_Dictionary|string $ocgDictionary
     * @throws InvalidArgumentException
     * @see createOCGDictionary()
     */
    public function __construct($ocgDictionary)
    {
        if (is_scalar($ocgDictionary)) {
            $args = func_get_args();
            $ocgDictionary = call_user_func_array(
                array('SetaPDF_Core_Document_OptionalContent_Group', 'createOCGDictionary'),
                $args
            );
            unset($args);
        }
        
        if ($ocgDictionary instanceof SetaPDF_Core_Type_IndirectObjectInterface) {
            $this->_indirectObject = $ocgDictionary;
            $ocgDictionary = $ocgDictionary->ensure();
        }

        if (!$ocgDictionary instanceof SetaPDF_Core_Type_Dictionary) {
            throw new InvalidArgumentException(
                'Parameter has to be type of SetaPDF_Core_Type_Dictionary'
            );
        }

        if (!SetaPDF_Core_Type_Dictionary_Helper::keyHasValue($ocgDictionary, 'Type', 'OCG')) {
            throw new InvalidArgumentException('Invalid or missing type value for optional content group.');
        }
        
        $this->_dictionary = $ocgDictionary;
    }

    /**
     * Release memory / cycled references.
     */
    public function cleanUp()
    {
        if (null !== $this->_usage) {
            $this->_usage->cleanUp();
            $this->_usage = null;
        }
    }
    
    /**
     * Gets the usage helper class.
     *
     * @return SetaPDF_Core_Document_OptionalContent_Group_Usage
     */
    public function usage()
    {
        if (null === $this->_usage)
            $this->_usage = new SetaPDF_Core_Document_OptionalContent_Group_Usage($this);
    
        return $this->_usage;
    }
    
    /**
     * Get the name of the optional content group.
     * 
     * @param string $encoding
     * @return string
     */
    public function getName($encoding = 'UTF-8')
    {
        return SetaPDF_Core_Encoding::convertPdfString(
            $this->getDictionary()->getValue('Name')->ensure()->getValue(),
            $encoding
        );
    }
    
    /**
     * Set the name of the optional content group.
     * 
     * @param string $name
     * @param string $encoding
     */
    public function setName($name, $encoding = 'UTF-8')
    {
        $this->getDictionary()->getValue('Name')->ensure()->setValue(
            SetaPDF_Core_Encoding::toPdfString($name, $encoding)
        );
    }
    
    /**
     * Get the dictionary of the optional content group.
     * 
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary()
    {
        return $this->_dictionary;
    }
    
    /**
     * Get an indirect object for this optional content group.
     *
     * @see SetaPDF_Core_Resource::getIndirectObject()
     * @param SetaPDF_Core_Document $document
     * @return SetaPDF_Core_Type_IndirectObjectInterface
     * @throws InvalidArgumentException
     */
    public function getIndirectObject(SetaPDF_Core_Document $document = null)
    {
        if (null === $this->_indirectObject) {
            if (null === $document) {
                throw new InvalidArgumentException('To initialize a new object $document parameter is not optional!');
            }
            
            $this->_indirectObject = $document->createNewObject($this->getDictionary());
        }
        
        return $this->_indirectObject;
    }
    
    /**
     * Get the resource type for optional content groups.
     *
     * @see SetaPDF_Core_Resource::getResourceType()
     * @return string
     */
    public function getResourceType()
    {
        return SetaPDF_Core_Resource::TYPE_PROPERTIES;
    }
}