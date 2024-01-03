<?php 
/**
 * This file is part of the SetaPDF-Core Component
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage SecHandler
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Exception.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Security handler exception
 * 
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
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