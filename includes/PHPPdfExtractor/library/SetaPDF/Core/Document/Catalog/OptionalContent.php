<?php 
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: OptionalContent.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class for handling optional content
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Catalog_OptionalContent implements IteratorAggregate
{
    /**
     * State constant
     * 
     * @var string
     */
    const STATE_ON = 'ON';
    
    /**
     * State constant
     * 
     * @var string
     */
    const STATE_OFF = 'OFF';
    
    /**
     * State constant
     * 
     * @var string
     */
    const STATE_UNCHANGED = 'Unchanged';
    
    /**
     * The documents catalog instance
     *
     * @var SetaPDF_Core_Document_Catalog
     */
    protected $_catalog;

    /**
     * The optional contents properties dictionary
     *  
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_propertiesDictionary;
    
    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Document_Catalog $catalog
     */
    public function __construct(SetaPDF_Core_Document_Catalog $catalog)
    {
        $this->_catalog = $catalog;
    }
    
    /**
     * Release resources / cycled references.
     */
    public function cleanUp()
    {
        $this->_catalog = null;
        $this->_propertiesDictionary = null;
    }
    
    /**
     * Get the document instance.
     *
     * @return SetaPDF_Core_Document
     */
    public function getDocument()
    {
        return $this->_catalog->getDocument();
    }
    
    /**
     * Get and creates the optional content properties dictionary.
     *
     * @param boolean $create
     * @return null|SetaPDF_Core_Type_Dictionary
     */
    public function getOptionalContentPropertiesDictionary($create = false)
    {
        if (null === $this->_propertiesDictionary) {
            $catalog = $this->_catalog->getDictionary($create);
            // if $create is true $catalog will not be null at any time
            if (
                $catalog === null ||
                !$catalog->offsetExists('OCProperties') && $create === false
            ) {
                return null;
            }
             
            if ($catalog->offsetExists('OCProperties')) {
                $this->_propertiesDictionary = $catalog->offsetGet('OCProperties')->ensure();
                 
            } else {
                $this->_propertiesDictionary = new SetaPDF_Core_Type_Dictionary();
                $this->_propertiesDictionary->offsetSet('OCGs', new SetaPDF_Core_Type_Array());
                $this->_propertiesDictionary->offsetSet('D', new SetaPDF_Core_Type_Dictionary(array(
                    'Order' => new SetaPDF_Core_Type_Array()
                )));
                
                 
                $outlines = $this->getDocument()->createNewObject($this->_propertiesDictionary);
                $catalog->offsetSet('OCProperties', $outlines);
            }
        }
    
        return $this->_propertiesDictionary;
    }
    
    /**
     * Get the default viewing dictionary.
     * 
     * @see PDF 32000-1:2008 - 8.11.4.2 Optional Content Properties Dictionary
     * @param boolean $create
     * @return null|SetaPDF_Core_Type_Dictionary
     */
    public function getDefaultViewingDictionary($create = false)
    {
        $propertiesDictionary = $this->getOptionalContentPropertiesDictionary($create);
        if ($propertiesDictionary === null ||
            !$propertiesDictionary->offsetExists('D') && $create === false
        ) {
            return null;
        }
        
        if ($propertiesDictionary->offsetExists('D')) 
           return $propertiesDictionary->offsetGet('D')->ensure();
        
        $dictionary = new SetaPDF_Core_Type_Dictionary();
        $propertiesDictionary->offsetSet('D', $dictionary);
           
        return $dictionary;
    }
    
    /**
     * Get and/or create an array entry in the default viewing dictionary.
     * 
     * @param string $name
     * @param boolean $create
     * @return null|SetaPDF_Core_Type_Array
     */
    protected function _getArrayFromDefaultViewing($name, $create = false)
    {
        $defaultViewingDictionary = $this->getDefaultViewingDictionary($create);
        if ($defaultViewingDictionary === null ||
            !$defaultViewingDictionary->offsetExists($name) && $create === false
        ) {
            return null;
        }
        
        if ($defaultViewingDictionary->offsetExists($name))
            return $defaultViewingDictionary->offsetGet($name)->ensure();
        
        $array = new SetaPDF_Core_Type_Array();
        $defaultViewingDictionary->offsetSet($name, $array);
         
        return $array;
    }
    
    /**
     * Get and/or create the Order array in the default viewing dictionary.
     * 
     * @see PDF 32000-1:2008 - 8.11.4.3 Optional Content Configuration Dictionaries
     * @param boolean $create
     * @return null|SetaPDF_Core_Type_Array
     */
    public function getOrderArray($create = false)
    {
        return $this->_getArrayFromDefaultViewing('Order', $create);
    }
    
    /**
     * Get and/or create the ON array in the default viewing dictionary.
     *
     * @see PDF 32000-1:2008 - 8.11.4.3 Optional Content Configuration Dictionaries
     * @param boolean $create
     * @return null|SetaPDF_Core_Type_Array
     */
    public function getOnArray($create = false)
    {
        return $this->_getArrayFromDefaultViewing('ON', $create);
    }
    
    /**
     * Get and/or create the OFF array in the default viewing dictionary.
     *
     * @see PDF 32000-1:2008 - 8.11.4.3 Optional Content Configuration Dictionaries
     * @param boolean $create
     * @return null|SetaPDF_Core_Type_Array
     */
    public function getOffArray($create = false)
    {
        return $this->_getArrayFromDefaultViewing('OFF', $create);
    }
    
    /**
     * Get and/or create the AS array in the default viewing dictionary.
     *
     * @see PDF 32000-1:2008 - 8.11.4.3 Optional Content Configuration Dictionaries
     * @param boolean $create
     * @return null|SetaPDF_Core_Type_Array
     */
    public function getAsArray($create = false)
    {
        return $this->_getArrayFromDefaultViewing('AS', $create);
    }
    
    /**
     * Get the base state from the default viewing dictionary.
     *
     * @see PDF 32000-1:2008 - 8.11.4.3 Optional Content Configuration Dictionaries
     * @return string
     */
    public function getBaseState()
    {
        $defaultViewingDictionary = $this->getDefaultViewingDictionary();
        if (null === $defaultViewingDictionary ||
            !$defaultViewingDictionary->offsetExists('BaseState')
        ) {
            return self::STATE_ON;
        }
        
        return $defaultViewingDictionary->getValue('BaseState')->ensure()->getValue();
    }
    
    /**
     * Set the base state in the default viewing dictionary.
     *
     * @see PDF 32000-1:2008 - 8.11.4.3 Optional Content Configuration Dictionaries
     * @param string $baseState
     */
    public function setBaseState($baseState)
    {
        $defaultViewingDictionary = $this->getDefaultViewingDictionary(true);
        $defaultViewingDictionary->offsetSet('BaseState', new SetaPDF_Core_Type_Name($baseState));
    }
    
    /**
     * Set the default state of the optional content group to on.
     *  
     * @param SetaPDF_Core_Document_OptionalContent_Group $group
     */
    public function setOn(SetaPDF_Core_Document_OptionalContent_Group $group)
    {
        $onArray = $this->getOnArray(true);
        $offArray = $this->getOffArray(true);

        /**
         * @var $indirectObject SetaPDF_Core_Type_IndirectObject
         */
        $indirectObject = $group->getIndirectObject($this->getDocument());
        if (-1 === $onArray->indexOf($indirectObject))
            $onArray[] = $indirectObject;
        
        $offIndex = $offArray->indexOf($indirectObject);
        if (-1 !== $offIndex)
            $offArray->offsetUnset($offIndex);
    }
    
    /**
     * Set the default state of the optional content group to off.
     *
     * @param SetaPDF_Core_Document_OptionalContent_Group $group
     */
    public function setOff(SetaPDF_Core_Document_OptionalContent_Group $group)
    {
        $onArray = $this->getOnArray(true);
        $offArray = $this->getOffArray(true);

        /**
         * @var $indirectObject SetaPDF_Core_Type_IndirectObject
         */
        $indirectObject = $group->getIndirectObject($this->getDocument());
        if (-1 === $offArray->indexOf($indirectObject))
            $offArray[] = $indirectObject;
        
        $onIndex = $onArray->indexOf($indirectObject);
        if (-1 !== $onIndex)
            $onArray->offsetUnset($onIndex);
    }
    
    /**
     * Create and add usage application dictionaries for the given optional content group.
     * 
     * The usage definition in an optional content group will only apply to automatically
     * adjustment if the group is referenced by a usage application dictionary.
     * 
     * <code>
     * $triangle = $optionalContent->appendGroup('Triangle');
     * // Define the usage
     * $triangle->usage()->setPrintState(SetaPDF_Core_Document_Catalog_OptionalContent::STATE_OFF);
     * // Now add it to an usage application dictionary
     * $optionalContent->addUsageApplication($triangle);
     * </code>
     *
     * @see SetaPDF_Core_Document_OptionalContent_Group_Usage
     * @param SetaPDF_Core_Document_OptionalContent_Group $group
     */
    public function addUsageApplication(SetaPDF_Core_Document_OptionalContent_Group $group)
    {
        $usage = $group->usage();
        $states = array_filter(array(
            'View' => $usage->getViewState(),
            'Print' => $usage->getPrintState(),
            'Export' => $usage->getExportState()
        ));
        
        if (count($states) === 0)
            return;
        
        $as = $this->getAsArray(true);
        
        foreach ($states AS $name => $state) {
            $as[] = new SetaPDF_Core_Type_Dictionary(array(
                'Category' => new SetaPDF_Core_Type_Array(array(new SetaPDF_Core_Type_Name($name))),
                'Event' => new SetaPDF_Core_Type_Name($name),
                'OCGs' => new SetaPDF_Core_Type_Array(array($group->getIndirectObject($this->getDocument()))),
            ));
        }
    }
    
    /**
     * Get all available content groups.
     * 
     * @return SetaPDF_Core_Document_OptionalContent_Group[]
     */
    public function getGroups()
    {
        $propertiesDictionary = $this->getOptionalContentPropertiesDictionary();
        if (
            null === $propertiesDictionary ||
            !$propertiesDictionary->offsetExists('OCGs')
        ) {
            return array();
        }
        
        $optionalContentGroups = array();
        $_optionalContentGroups = $propertiesDictionary->offsetGet('OCGs')->ensure();
        foreach ($_optionalContentGroups AS $_optionalContentGroup)
            $optionalContentGroups[] = new SetaPDF_Core_Document_OptionalContent_Group($_optionalContentGroup);
        
        return $optionalContentGroups;
    }
    
    /**
     * Get a group by its name.
     * 
     * @param string $name The group name
     * @param string $encoding The input encoding
     * @return false|SetaPDF_Core_Document_OptionalContent_Group
     */
    public function getGroup($name, $encoding = 'UTF-8')
    {
        $propertiesDictionary = $this->getOptionalContentPropertiesDictionary();
        if (
            null === $propertiesDictionary ||
            !$propertiesDictionary->offsetExists('OCGs')
        ) {
            return false;
        }
        
        $optionalContentGroups = $propertiesDictionary->offsetGet('OCGs')->ensure();
        foreach ($optionalContentGroups AS $_optionalContentGroup) {
            $object = new SetaPDF_Core_Document_OptionalContent_Group($_optionalContentGroup);
            if ($object->getName($encoding) === $name) {
                return $object;
            }
        }
        
        return false;
    }
    
    /**
     * This method adds a method to the OCGs array.
     * 
     * By adding a group with this method the group will not be added to the user
     * interface.
     *  
     * @param SetaPDF_Core_Document_OptionalContent_Group|string $group
     * @return SetaPDF_Core_Document_OptionalContent_Group
     */
    public function addGroup($group)
    {
        if (!($group instanceof SetaPDF_Core_Document_OptionalContent_Group)) {
            $group = new SetaPDF_Core_Document_OptionalContent_Group($group);
        }
        
        $propertiesDictionary = $this->getOptionalContentPropertiesDictionary(true);
        $optionalContentGroups = $propertiesDictionary->offsetGet('OCGs')->ensure();
    
        $indirectObject = $group->getIndirectObject($this->getDocument());
        if (-1 === $optionalContentGroups->indexOf($indirectObject)) {
            $optionalContentGroups[] = $indirectObject;
        }
        
        return $group;
    }
    
    /**
     * Append an optional content group to the outline structure.
     * 
     * @param string|SetaPDF_Core_Document_OptionalContent_Group $group
     * @param SetaPDF_Core_Document_OptionalContent_Group $parent
     * @param integer|null $afterIndex
     * @param string|SetaPDF_Core_Document_OptionalContent_Group $nextToOrLabel
     * @param string $label
     * @return SetaPDF_Core_Document_OptionalContent_Group
     */
    public function appendGroup(
        $group,
        SetaPDF_Core_Document_OptionalContent_Group $parent = null,
        $afterIndex = null,
        $nextToOrLabel = null,
        $label = ''
    )
    {
        if (null !== $afterIndex) {
            return $this->prependGroup($group, $parent, $afterIndex + 1, $nextToOrLabel, $label);
        }
        
        $group = $this->addGroup($group);
        
        $order = $this->getOrderArray(true);
        if ($parent !== null) {
            $order = $this->_findAndPrepareOrderEntry($order, $parent);
        }
        
        if ($nextToOrLabel !== null) {
            if ($nextToOrLabel instanceof SetaPDF_Core_Document_OptionalContent_Group) {
                $order = $this->_findOrderArrayByGroup($order, $nextToOrLabel);
            }
            
            if (is_string($nextToOrLabel)) {
                $label = $nextToOrLabel;
            }
            
            if ($label !== '') {
                $element = new SetaPDF_Core_Type_Array(array(
                    new SetaPDF_Core_Type_String($label),
                    $group->getIndirectObject($this->getDocument())
                ));
                
            } else {
                $element = $group->getIndirectObject($this->getDocument());
            }
            
        } else {
            $element = $group->getIndirectObject($this->getDocument());
        }
        
        $order[] = $element;
        
        return $group;
    }
    
    /**
     * Prepends an optional content group to the outline structure.
     *
     * If the $beforeIndex parameter is out of range the group will be appended.
     *
     * @param string|SetaPDF_Core_Document_OptionalContent_Group $group
     * @param SetaPDF_Core_Document_OptionalContent_Group $parent
     * @param integer|null $beforeIndex
     * @param string|SetaPDF_Core_Document_OptionalContent_Group $nextToOrLabel
     * @param string $label
     * @return SetaPDF_Core_Document_OptionalContent_Group
     */
    public function prependGroup(
        $group,
        SetaPDF_Core_Document_OptionalContent_Group $parent = null,
        $beforeIndex = 0,
        $nextToOrLabel = null,
        $label = ''
    )
    {
        $group = $this->addGroup($group);
    
        $order = $this->getOrderArray(true);
        if ($parent !== null) {
            $order = $this->_findAndPrepareOrderEntry($order, $parent);
        }
    
        if ($nextToOrLabel !== null) {
            if ($nextToOrLabel instanceof SetaPDF_Core_Document_OptionalContent_Group) {
                $order = $this->_findOrderArrayByGroup($order, $nextToOrLabel);
            }
            
            if (is_string($nextToOrLabel)) {
                $label = $nextToOrLabel;
            }
            
            if ($label !== '') {
                $element = new SetaPDF_Core_Type_Array(array(
                    new SetaPDF_Core_Type_String($label),
                    $group->getIndirectObject($this->getDocument()
                )));
                
            } else {
                $element = $group->getIndirectObject($this->getDocument());
            }
            
        } else {
            $element = $group->getIndirectObject($this->getDocument());
        }
        
        if ($beforeIndex >= $order->count()) {
            $order[] = $element;
        } else {
            // If the current array begins with an label, we have to adjust the $beforeIndex value
            if ($order->offsetGet(0)->ensure() instanceof SetaPDF_Core_Type_StringValue)
                $beforeIndex++;
                
            $order->insertBefore($element, $beforeIndex);
        }
         
        return $group;
    }
    
    /**
     * Finds the correct order array entry by an optional content group object.
     * 
     * @param SetaPDF_Core_Type_Array $currentArray
     * @param SetaPDF_Core_Document_OptionalContent_Group $group
     * @param integer $key
     * @return Iterator|SetaPDF_Core_Type_Array
     * @internal
     */
    protected function _findOrderArrayByGroup(
        SetaPDF_Core_Type_Array $currentArray,
        SetaPDF_Core_Document_OptionalContent_Group $group,
        &$key = null
    )
    {
        $originalCurrentArray = $currentArray;
        $orderArray = $this->getOrderArray();
        if (null === $orderArray)
            return $originalCurrentArray;
        
        $iterator = new RecursiveIteratorIterator($orderArray);
        $objectIdent = $group->getIndirectObject($this->getDocument())->getObjectIdent();
         
        foreach ($iterator AS $key => $value) {
            $currentArray = $iterator->getInnerIterator();
            if (!($value instanceof SetaPDF_Core_Type_IndirectObjectInterface)) {
                continue;
            }
            
            if ($value->getObjectIdent() === $objectIdent) {
                return $currentArray;
            }
        }
            
        $key = null;
        
        return $originalCurrentArray;
    }
    
    /**
     * Finds and prepares an order array.
     * 
     * @param SetaPDF_Core_Type_Array $currentArray
     * @param SetaPDF_Core_Document_OptionalContent_Group $parent
     * @return SetaPDF_Core_Type_Array
     * @internal
     */
    protected function _findAndPrepareOrderEntry(
        SetaPDF_Core_Type_Array $currentArray,
        SetaPDF_Core_Document_OptionalContent_Group $parent
    )
    {
        $originalCurrentArray = $currentArray;
        
        $key = null;
        $currentArray = $this->_findOrderArrayByGroup($currentArray, $parent, $key);
        if ($key !== null) {
            // We are at the end of the current array
            if (!$currentArray->offsetExists($key + 1)) {
                $newArray = new SetaPDF_Core_Type_Array();
                $currentArray[] = $newArray;
                $currentArray = $newArray;
            
                // The next item is not an array
            } elseif (!($currentArray->offsetGet($key + 1)->ensure() instanceof SetaPDF_Core_Type_Array)) {
                $newArray = new SetaPDF_Core_Type_Array();
                $currentArray->insertBefore($newArray, $key + 1);
                $currentArray = $newArray;
                 
                // Next entry is an array, so use it!
            } else {
                $currentArray = $currentArray->offsetGet($key + 1)->ensure();
            }
            
            return $currentArray;
        } 
        
        return $originalCurrentArray;
    }
    
    /**
     * Implementation of IteratorAggregate.
     * 
     * A separate iterator is needed to receive SetaPDF_Core_Document_OptionalContent_Group objects while iterating.
     * 
     * @see IteratorAggregate::getIterator()
     * @return SetaPDF_Core_Document_OptionalContent_Iterator|EmptyIterator
     */
    public function getIterator() {
        $orderArray = $this->getOrderArray();
        if (null === $orderArray)
            return new EmptyIterator();
        
        return new SetaPDF_Core_Document_OptionalContent_Iterator($orderArray);
    }
}