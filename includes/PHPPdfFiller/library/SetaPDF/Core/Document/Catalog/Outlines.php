<?php 
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Outlines.php 1345 2019-07-01 13:30:25Z jan.slabon $
 */

/**
 * Class for handling a documents outline
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Catalog_Outlines implements IteratorAggregate, ArrayAccess
{
    /**
     * The documents catalog instance.
     *
     * @var SetaPDF_Core_Document_Catalog
     */
    protected $_catalog;
    
    /**
     * The root outlines dictionary.
     * 
     * @var SetaPDF_Core_Type_Dictionary
     */
    protected $_outlinesDictionary;
    
    /**
     * The iterator instance.
     * 
     * @var RecursiveIteratorIterator
     */
    protected $_iterator;
    
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
     * Get the document instance.
     *
     * @return SetaPDF_Core_Document
     */
    public function getDocument()
    {
    	return $this->_catalog->getDocument();
    }
    
    /**
     * Release memory / Cycled references.
     */
    public function cleanUp()
    {
        $this->_iterator = null;
        $this->_outlinesDictionary = null;
        $this->_catalog = null;
    }
    
    /**
     * Get and creates the Outlines dictionary.
     * 
     * @param boolean $create
     * @return NULL|SetaPDF_Core_Type_Dictionary
     * @internal
     */
    public function getOutlinesDictionary($create = false)
    {
        if (null === $this->_outlinesDictionary) {
        	$catalog = $this->getDocument()->getCatalog()->getDictionary($create);
        	// if $create is true $catalog will not be null at any time
        	if (
        			$catalog === null ||
        			!$catalog->offsetExists('Outlines') && $create === false
        	) {
        		return null;
        	}


        	if ($catalog->offsetExists('Outlines')) {
        	    try {
        	        $this->_outlinesDictionary = $catalog->offsetGet('Outlines')->ensure();
                    return $this->_outlinesDictionary;
                } catch (SetaPDF_Core_Type_IndirectReference_Exception $e) {
        	        // catch faulty references
                }
        	}

        	if ($create) {
        	    $this->_outlinesDictionary = new SetaPDF_Core_Type_Dictionary();
        	    $this->_outlinesDictionary->offsetSet('Type', new SetaPDF_Core_Type_Name('Outlines', true));

        	    $outlines = $this->getDocument()->createNewObject($this->_outlinesDictionary);
        		$catalog->offsetSet('Outlines', $outlines);
        	}
        }
        
        return $this->_outlinesDictionary;
    }
    
    /**
     * Get an item instance of the item referenced in the 'First' key.
     *
     * @return boolean|SetaPDF_Core_Document_OutlinesItem The first item of the outlines root dictionary or false if no
     *                                                    item is set.
     */
    public function getFirstItem()
    {
        $dict = $this->getOutlinesDictionary();
        if ($dict && $dict->offsetExists('First')) {
            return new SetaPDF_Core_Document_OutlinesItem($dict->getValue('First'));
        }
        
        return false;
    }
    
    /**
     * Get an item instance of the item referenced in the 'Last' key.
     *
     * @return boolean|SetaPDF_Core_Document_OutlinesItem The last item of the outlines root dictionary or false if no
     *                                                    item is set.
     */
    public function getLastItem()
    {
    	$dict = $this->getOutlinesDictionary();
    	if ($dict && $dict->offsetExists('Last')) {
    	    return new SetaPDF_Core_Document_OutlinesItem($dict->getValue('Last'));
    	}
    
    	return false;
    }
    
    /**
     * Get the iterator reference for the outlines.
     * 
     * @see IteratorAggregate::getIterator()
     * @param boolean $recreate Specify to recreate the iterator instance
     * @return EmptyIterator|RecursiveIteratorIterator A reference to the iterator
     */
    public function getIterator($recreate = false)
    {
        if ($recreate === true)
            $this->_iterator = null;
        
        if ($this->_iterator === null) {
            $firstItem = $this->getFirstItem();
            if (false === $firstItem) {
                $this->_iterator = new EmptyIterator();
                return $this->_iterator;
            }
            
            $this->_iterator = new RecursiveIteratorIterator(
        		$firstItem,
        		RecursiveIteratorIterator::SELF_FIRST
            );
        }

        return $this->_iterator;
    }
    
    /**
     * Append an item to the outline.
     *
     * @param SetaPDF_Core_Document_OutlinesItem $item The outline item that should be append
     * @return SetaPDF_Core_Document_Catalog_Outlines
     */
    public function appendChild(SetaPDF_Core_Document_OutlinesItem $item)
    {
        $lastItem = $this->getLastItem();
        
        if (false === $lastItem) {
            $value = $item->getReferenceTo();
            $dict = $this->getOutlinesDictionary(true);
            $dict->offsetSet('First', $value);
            $dict->offsetSet('Last', $value);
            $dict->offsetSet('Count', new SetaPDF_Core_Type_Numeric(1));
            
            $catalog = $this->getDocument()->getCatalog()->getDictionary();
            $value->ensure()->offsetSet('Parent', $catalog->getValue('Outlines'));
            
            $this->getIterator(true);
        } else {
            $lastItem->append($item);
        }
        
        return $this;
    }
    
    /**
     * Append a copy of an item or outline to this outline.
     *
     * @param SetaPDF_Core_Document_OutlinesItem|SetaPDF_Core_Document_Catalog_Outlines $item The item or root outlines dictionary
     */
    public function appendChildCopy($item)
    {
        if ($item instanceof SetaPDF_Core_Document_Catalog_Outlines) {
            $iterator = $item->getIterator();
            if ($iterator instanceof RecursiveIteratorIterator)
                $iterator->setMaxDepth(0);
            $childs = array();
            foreach ($item AS $_item) {
                $childs[] = $_item;
            }
            
            foreach ($childs AS $_item) {
                $this->appendChildCopy($_item);
            }
            
            if ($iterator instanceof RecursiveIteratorIterator)
                $iterator->setMaxDepth(-1);
            return;
        }
        
        $lastItem = $this->getLastItem();
        if (false === $lastItem) {
            $root = SetaPDF_Core_Document_OutlinesItem::copyItem($this->getDocument(), $item);
            $this->appendChild($root);
            if ($item->hasFirstItem()) {
                foreach ($item->getFirstItem() AS $_item)
                    $root->appendChildCopy($_item, $this->getDocument());
            }
        } else {
            $lastItem->appendCopy($item, $this->getDocument());
        }
    }
    
  /* ArrayAccess Implementation */
    
    /**
     * Checks if an item exists at a specific position.
     *
     * @see ArrayAccess::offsetExists()
     * @param string $offset
     * @return boolean
     */
    public function offsetExists($offset)
    {
        try {
        	$this->offsetGet($offset);
        	return true;
        } catch (InvalidArgumentException $e) {
        	return false;
        }
    }
    
    /**
     * Set an item at a specific position.
     *
     * @see ArrayAccess::offsetSet()
     * @see append()
     * @see appendChild()
     * @see remove()
     * @param null|string $offset
     * @param SetaPDF_Core_Document_OutlinesItem $value
     */
    public function offsetSet($offset, $value)
    {
        if (null === $offset) {
            $lastItem = $this->getLastItem();
            if (false === $lastItem) {
            	$this->appendChild($value);
            	return;
            }
            $lastItem->append($value);
            return;
        }
        
        $current = $this->offsetGet($offset);
        $prev = $current->getPrevious();
        if ($prev) {
            $current->remove();
            $prev->append($value);
            return;
        } 
        
        $next = $current->getNext();
        if ($next) {
            $current->remove();
            $next->prepend($value);
            return;
        } 
        
        $current->remove();
        $this->appendChild($value);
    }
    
    /**
     * Get an item by a specific position.
     *
     * @see ArrayAccess::offsetGet()
     * @param string $offset
     * @return SetaPDF_Core_Document_OutlinesItem
     * @throws InvalidArgumentException
     */
    public function offsetGet($offset)
    {
        switch ($offset) {
        	case 'first':
        		$item = $this->getFirstItem();
        		break;
        	case 'last':
        		$item = $this->getLastItem();
        		break;
        	case !is_numeric($offset):
        	    $item = false;
        	    break;
        	default:
                $item = $this->getFirstItem();
            	for ($n = 0; $n < $offset && $item !== false; $n++) {
            	    $item = $item->getNext();
            	}
        }
    	
        if (false === $item) {
        	throw new InvalidArgumentException(sprintf('No item at offset "%s" found.', $offset));
        }
        
    	return $item;
    }
    
    /**
     * Removes an item at a specific position.
     *
     * @see ArrayAccess::offsetUnset()
     * @param string $offset
     * @return SetaPDF_Core_Document_OutlinesItem
     */
    public function offsetUnset($offset)
    {
        $item = $this->offsetGet($offset);
        $item->remove();
        
        // reset the iterator
        if ($this->_iterator !== null)
            $this->getIterator(true);
        
        return $item;
    }
}