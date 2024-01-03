<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: HasBoundsInterface.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * Interface for resulting objects which have bounds.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Result
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Extractor_Result_HasBoundsInterface
{
    /**
     * Returns the bounds of a specific item.
     *
     * @return SetaPDF_Extractor_Result_Bounds[]
     */
    public function getBounds();
}