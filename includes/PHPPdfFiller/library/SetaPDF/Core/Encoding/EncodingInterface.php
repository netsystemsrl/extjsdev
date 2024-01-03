<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: EncodingInterface.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Interface for encoding tables
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Encoding
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_Encoding_EncodingInterface
{
    /**
     * Returns the encoding table array.
     *
     * Keys are the unicode values while the values are the code
     * points in the specific encoding.
     *
     * @return array
     */
    static public function getTable();
}