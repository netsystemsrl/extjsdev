<?php 
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Exception.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Security handler exception
 * 
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_SecHandler_Exception extends SetaPDF_Core_Exception
{
  /** Constants prefix: 0x06 **/
    
    /**
     * @var integer
     */
    const NOT_AUTHENTICATED = 0x0600;
    
    /**
     * @var integer
     */
    const UNSUPPORTED_CRYPT_FILTER_METHOD = 0x0601;
    
    /**
     * @var integer
     */
    const UNSUPPORTED_REVISION = 0x0602;
    
    /**
     * @var integer
     */
    const NOT_ALLOWED = 0x0603;
    
}