<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Geometry
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Collidable.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * Interface to check for collisions between geometries
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Geometry
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Core_Geometry_Collidable
{
    /**
     * Checks if this geometry collides with another geometry.
     *
     * @param SetaPDF_Core_Geometry_Collidable $geometry
     * @return bool
     */
    public function collides(SetaPDF_Core_Geometry_Collidable $geometry);
}