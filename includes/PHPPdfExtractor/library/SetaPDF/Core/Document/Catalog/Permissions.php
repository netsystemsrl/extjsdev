<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Permissions.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Class representing a helper object for the Perms entry in the document catalog.
 *
 * @see PDF 32000-1:2008 - 12.8.4 Permissions
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Document
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Document_Catalog_Permissions
{
    /**
     * The documents catalog instance
     *
     * @var SetaPDF_Core_Document
     */
    protected $_catalog;

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
     * Release cycled references.
     */
    public function cleanUp()
    {
        $this->_catalog = null;
    }

    /**
     * Checks if usage rights are defined for this document.
     *
     * @return bool
     */
    public function hasUsageRights()
    {
        $catalog = $this->_catalog->getDictionary();
        if (null === $catalog)
            return false;

        if (!$catalog->offsetExists('Perms'))
            return false;

        $perms = $catalog->getValue('Perms')->ensure();
        if ($perms->offsetExists('UR3')) {
            return true;
        }

        return false;
    }

    /**
     * Removes the usage rights if they are defined for this document.
     *
     * @return bool
     */
    public function removeUsageRights()
    {
        $catalog = $this->_catalog->getDictionary();
        if (null === $catalog)
            return false;

        if (!$catalog->offsetExists('Perms'))
            return false;

        $perms = $catalog->getValue('Perms')->ensure();
        /**
         * @var $catalog SetaPDF_Core_Type_Dictionary
         */
        if ($perms->offsetExists('UR3')) {
            $perms->offsetUnset('UR3');
            return true;
        }

        return false;
    }
}
