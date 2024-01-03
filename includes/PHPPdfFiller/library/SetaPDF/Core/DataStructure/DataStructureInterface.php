<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: DataStructureInterface.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Interface for data structure classes
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage DataStructure
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_DataStructure_DataStructureInterface
{
    /**
     * Get the PDF value object.
     *
     * @return SetaPDF_Core_Type_AbstractType
     */
    public function getValue();

    /**
     * Get the data as a PHP value.
     *
     * @return mixed
     */
    public function toPhp();
}