<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: NameTree.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Data structure class for Name Trees
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_DataStructure_NameTree
    extends SetaPDF_Core_DataStructure_Tree
{
    /**
     * Callback function to build unique names.
     *
     * @param string $name
     * @param integer $i Attempt count
     * @return string
     */
    static public function adjustNameCallback($name, $i)
    {
        if (SetaPDF_Core_Encoding::isUtf16Be($name)) {
            $i = SetaPDF_Core_Encoding::convert($i, 'ISO-8859-1', 'UTF-16BE');
        }

        return $name . '.' . $i;
    }

    /**
     * Get the entries key name for this implementation.
     *
     * @see SetaPDF_Core_DataStructure_Tree::_getEntriesKeyName()
     * @return string
     */
    protected function _getEntriesKeyName()
    {
        return 'Names';
    }

    /**
     * Get the key class name used by this tree implementation.
     *
     * @see SetaPDF_Core_DataStructure_Tree::_getKeyClassName()
     * @return string
     */
    protected function _getKeyClassName()
    {
        return 'SetaPDF_Core_Type_String';
    }

    /**
     * Get the key instance name by tree implementation.
     *
     * @return string
     */
    protected function _getKeyInstanceName()
    {
        return 'SetaPDF_Core_Type_StringValue';
    }

    /**
     * Get the sort type for this tree implementation.
     *
     * @see SetaPDF_Core_DataStructure_Tree::_getSortType()
     * @return integer
     */
    protected function _getSortType()
    {
        return SORT_STRING;
    }
}