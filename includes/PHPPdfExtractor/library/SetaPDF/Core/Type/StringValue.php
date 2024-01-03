<?php 
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: StringValue.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Interface for string values
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Type
 * @license    https://www.setasign.com/ Commercial
 * @see SetaPDF_Core_Type_String, SetaPDF_Core_Type_HexString
 */
interface SetaPDF_Core_Type_StringValue
{
    
  /* We cannot defined the methods here because they are already declared to be abstract
   * in SetaPDF_Core_Type_AbstractType.
   */
    
    /**
     * Get the string value
     * 
     * @return string
     */
    // public function getValue();
    
    /**
     * Set the string value
     * 
     * @param string $value
     */
    // public function setValue($value);
}