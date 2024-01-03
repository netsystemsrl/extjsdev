<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Filter
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: FilterInterface.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * A filter interface
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Filter
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_Filter_FilterInterface
{
    /**
     * Decode a string.
     *
     * @param string $data The input string
     * @return string
     */
    public function decode($data);

    /**
     * Encodes a string.
     *
     * @param string $data The input string
     * @return string
     */
    public function encode($data);
}