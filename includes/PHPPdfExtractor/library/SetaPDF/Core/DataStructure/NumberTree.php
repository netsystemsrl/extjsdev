<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: NumberTree.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Data structure class for Number Trees
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_DataStructure_NumberTree
    extends SetaPDF_Core_DataStructure_Tree
{
    /**
     * Get the entries key name for this implementation.
     *
     * @see SetaPDF_Core_DataStructure_Tree::_getEntriesKeyName()
     * @return string
     */
    protected function _getEntriesKeyName()
    {
        return 'Nums';
    }

    /**
     * Get the key class name used by this tree implementation.
     *
     * @see SetaPDF_Core_DataStructure_Tree::_getKeyClassName()
     * @return string
     */
    protected function _getKeyClassName()
    {
        return 'SetaPDF_Core_Type_Numeric';
    }

    /**
     * Get the sort type for this tree implementation.
     *
     * @see SetaPDF_Core_DataStructure_Tree::_getSortType()
     * @return integer
     */
    protected function _getSortType()
    {
        return SORT_NUMERIC;
    }
}