<?php 
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: TransparencyGroup.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Class representing a transparency group
 * 
 * @see PDF 32000-1:2008 - 11.6.6 Transparency Group XObjects
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_TransparencyGroup
{
    /**
     * The dictionary
     * 
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_dictionary;
    
    /**
     * Creates a "Transparency Group XObjects" Group dictionary.
     * 
     * @return SetaPDF_Core_Type_Dictionary
     */
    static public function createDictionary()
    {
        $dict = new SetaPDF_Core_Type_Dictionary(array(
            'Type' => new SetaPDF_Core_Type_Name('Group', true),
            'S' => new SetaPDF_Core_Type_Name('Transparency', true),
        ));
        
        return $dict;
    }
    
    /**
     * Creates the Group dictionary for an Transparency Group XObject.
     * 
     * @param SetaPDF_Core_Type_Dictionary $dictionary
     * @throws InvalidArgumentException
     */
    public function __construct($dictionary = null)
    {
        if (!$dictionary instanceof SetaPDF_Core_Type_Dictionary) {
            $dictionary = self::createDictionary();
        }
        
        if (false === SetaPDF_Core_Type_Dictionary_Helper::keyHasValue($dictionary, 'S', 'Transparency')) {
            throw new InvalidArgumentException('Missing or invalid S entry in dictionary.');
        }
        
        $this->_dictionary = $dictionary;
    }
    
    /**
     * Get the dictionary.
     * 
     * @return SetaPDF_Core_Type_Dictionary
     */
    public function getDictionary()
    {
        return $this->_dictionary;
    }
    
    /**
     * Set the colorspace for this group.
     * 
     * Actually only standard color spaces are allowed.
     * 
     * @param string|SetaPDF_Core_Type_Name $colorSpace
     */
    public function setColorSpace($colorSpace)
    {
        if (!$colorSpace instanceof SetaPDF_Core_Type_Name)
            $colorSpace = new SetaPDF_Core_Type_Name($colorSpace);
        
        $this->_dictionary->offsetSet('CS', $colorSpace);   
    }
    
    /**
     * Return the color space.
     * 
     * @return SetaPDF_Core_Type_Name|SetaPDF_Core_Type_Array|null
     */
    public function getColorSpace()
    {
        if (!$this->_dictionary->offsetExists('CS'))
            return null;

        return $this->_dictionary->getValue('CS')->ensure();
    }
    
    /**
     * Checks whether the transparency group is isolated.
     * 
     * @return boolean
     */
    public function isIsolated()
    {
        if (!$this->_dictionary->offsetExists('I'))
            return false;
        
        return $this->_dictionary->getValue('I')->ensure()->getValue();
    }
    
    /**
     * Set whether the transparency group is isolated.
     * 
     * @param boolean $isolated
     */
    public function setIsolated($isolated)
    {
        $this->_dictionary->offsetSet('I', (boolean)$isolated);
    }
    
    /**
     * Checks whether the transparency group is a knockout group.
     * 
     * @return boolean
     */
    public function isKnockoutGroup()
    {
        if (!$this->_dictionary->offsetExists('K'))
            return false;
        
        return $this->_dictionary->getValue('K')->ensure()->getValue();
    }
    
    /**
     * Set whether the transparency group is a knockout group.
     *
     * @param boolean $knockoutGroup
     */
    public function setKnockoutGroup($knockoutGroup)
    {
        $this->_dictionary->offsetSet('K', (boolean)$knockoutGroup);
    }
}