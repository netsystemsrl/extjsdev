<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: FilterInterface.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * The interface for filter instances.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Filter
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Extractor_Filter_FilterInterface
{
    /**
     * The method which is called with the specific text item.
     *
     * It has to return true or false, whether the item is accepted or not.
     *
     * @param SetaPDF_Extractor_TextItem $textItem
     * @return boolean|string False or true/an identifier string whether the item is accepted or not.
     */
    public function accept(SetaPDF_Extractor_TextItem $textItem);
}