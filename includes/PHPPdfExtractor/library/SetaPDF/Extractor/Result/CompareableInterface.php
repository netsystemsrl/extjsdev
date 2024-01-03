<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: CompareableInterface.php 1052 2017-05-18 09:49:46Z jan.slabon $
 */

/**
 * An interface for resulting items which can be compared/sorted.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Result
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Extractor_Result_CompareableInterface
{
    /**
     * Get the orientation value.
     *
     * @return float
     */
    public function getOrientation();

    /**
     * Get the base line start vector.
     *
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function getBaseLineStart();

    /**
     * Get the base line end vector.
     *
     * @return SetaPDF_Core_Geometry_Vector
     */
    public function getBaseLineEnd();

    /**
     * Get the user space width value of the space sign.
     *
     * @return float
     */
    public function getUserSpaceSpaceWidth();
}