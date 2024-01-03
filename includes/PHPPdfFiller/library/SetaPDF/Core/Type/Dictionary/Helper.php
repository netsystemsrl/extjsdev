<?php 
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Helper.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Helper class for handling of dictionaries
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Type_Dictionary_Helper
{
    /**
     * Resolves an attributes value by name.
     *
     * If the $name key is in the dictionary this will return the value of this entry.
     *
     * If the $parent key is in the dictionary and is also a dictionary this will search
     * the $name key in this and return it if found.
     *
     * If nothing is found $default will be returned.
     *
     * @param SetaPDF_Core_Type_Dictionary $dict
     * @param string $name
     * @param null $default
     * @param bool $ensure
     * @param string $parentName
     * @return null|SetaPDF_Core_Type_AbstractType|SetaPDF_Core_Type_Dictionary|SetaPDF_Core_Type_Array
     */
    static public function resolveAttribute(
    	SetaPDF_Core_Type_Dictionary $dict,
        $name,
        $default = null,
        $ensure = true,
        $parentName = 'Parent'
    )
    {
    	$p = $dict;
    	while (false !== $p) {
    		if ($p->offsetExists($name)) {
    			if ($ensure) {
                    return $p->offsetGet($name)->ensure();
                }
    			return $p->offsetGet($name)->getValue();
    		}
    
    		if ($p->offsetExists($parentName)) {
    			$p = $p->offsetGet($parentName)->ensure();
                if(!($p instanceof SetaPDF_Core_Type_Dictionary)) {
                    $p = false;
                }
    		} else {
    			$p = false;
    		}
    	}
    
    	return $default;
    }
    
    /**
     * Resolves an dictionary in a tree containing a specific name.
     *
     * If the $name key is in the dictionary this will return the dictionary.
     *
     * If the $parent key is in the dictionary and is also a dictionary this will search
     * the $name key in this and return the child dictionary.
     *
     * If nothing is found false will be returned.
     *
     * @param SetaPDF_Core_Type_Dictionary $dict
     * @param string $name attribute/key name
     * @param string $parentName
     * @return SetaPDF_Core_Type_Dictionary|boolean
     */
    static public function resolveDictionaryByAttribute(
        SetaPDF_Core_Type_Dictionary $dict,
        $name,
        $parentName = 'Parent'
    )
    {
    	$p = $dict;
    	while (false !== $p) {
    		if ($p->offsetExists($name)) {
                return $p;
            }
    
    		if ($p->offsetExists($parentName)) {
    			$p = $p->offsetGet($parentName)->ensure(true);
                if(!($p instanceof SetaPDF_Core_Type_Dictionary)) {
                    $p = false;
                }
    		} else {
    			$p = false;
    		}
    	}
    
    	return false;
    }
    
    /**
     * Resolves an object in a tree containing a specific name.
     *
     * @param SetaPDF_Core_Type_IndirectObjectInterface $object
     * @param string $name attribute/key name
     * @param string $parentName
     * @return boolean|SetaPDF_Core_Type_IndirectObjectInterface
     * @todo move to an object helper class
     */
    static public function resolveObjectByAttribute(
		SetaPDF_Core_Type_IndirectObjectInterface $object,
        $name,
		$parentName = 'Parent'
    )
    {
    	$p = $object;
    	while (false !== $p) {
            if (!($p instanceof SetaPDF_Core_Type_AbstractType)) {
                return false;
            }

    	    $_p = $p->ensure(true);

            if (!($_p instanceof ArrayAccess)) {
                return false;
            }

    		if ($_p->offsetExists($name)) {
                return $p;
            }
    
    		if ($_p->offsetExists($parentName)) {
    			$p = $_p->getValue($parentName)->getValue();
    		} else {
    			$p = false;
    		}
    	}
    
    	return false;
    }
    
    /**
     * Checks if a value of a key equals an expected value.
     * 
     * @param SetaPDF_Core_Type_Dictionary $dictionary
     * @param string $key
     * @param mixed $value
     * @return boolean
     */
    static public function keyHasValue(SetaPDF_Core_Type_Dictionary $dictionary, $key, $value)
    {
        if (false === $dictionary->offsetExists($key)) {
            return false;
        }

        return $dictionary->getValue($key)->ensure()->getValue() === $value;
    }


    /**
     * Get the value.
     *
     * @param SetaPDF_Core_Type_Dictionary $dictionary
     * @param string $key
     * @param null|mixed $defaultValue
     * @param boolean $phpValueFromScalarTypes
     * @return null
     */
    static public function getValue(
        SetaPDF_Core_Type_Dictionary $dictionary,
        $key,
        $defaultValue = null,
        $phpValueFromScalarTypes = false
    )
    {
        if ($dictionary->offsetExists($key)) {
            $value = $dictionary->getValue($key)->ensure();
            if ($phpValueFromScalarTypes && $value instanceof SetaPDF_Core_Type_ScalarValue)
                return $value->getValue();

            return $value;
        }
        
        return $defaultValue;
    }
}