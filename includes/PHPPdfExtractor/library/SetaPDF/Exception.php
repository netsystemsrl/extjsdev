<?php
/**
 * This file is part of the SetaPDF package
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Exception.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Main exception of the SetaPDF package
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Exception extends Exception
{
    /**
     * All Exception class constants have their own prefix byte:
     *
     *  SetaPDF_Exception                                   = 0x00
     *  SetaPDF_Core_Exception                              = 0x01
     *  SetaPDF_Core_Reader_Exception                       = 0x02
     *  SetaPDF_Core_Filter_Exception                       = 0x03
     *  SetaPDF_Core_Parser_Exception                       = 0x04
     *  SetaPDF_Core_Parser_CrossReferenceTable_Exception   = 0x05
     *  SetaPDF_Core_SecHandler_Exception                   = 0x06
     *  SetaPDF_Core_Type_Exception                         = 0x07
     *  SetaPDF_Core_Type_IndirectReference_Exception       = 0x08
     *  SetaPDF_Core_Writer_Exception                       = 0x09
     *  SetaPDF_Core_Parser_Pdf_InvalidTokenException       = 0x0a
     *  SetaPDF_Core_Font_Exception                         = 0x0b
     *  = 0x0c
     *  = 0x0d
     *  = 0x0e
     *  = 0x0f
     *  = 0x10
     *  = 0x11
     *  = 0x12
     *  = 0x13
     *  = 0x14
     *  = 0x15
     *  = 0x16
     *  = 0x17
     *  = 0x18
     *  = 0x19
     *  = 0x1a
     *  = 0x1b
     *  = 0x1c
     *  = 0x1d
     */
}