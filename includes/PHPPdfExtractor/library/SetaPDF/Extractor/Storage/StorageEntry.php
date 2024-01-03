<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: StorageEntry.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * A basic storage entry
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Storage
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Storage_StorageEntry
{
    /**
     * The Geometry that was used to insert the data.
     *
     * @var SetaPDF_Core_Geometry_Rectangle|SetaPDF_Core_Geometry_Point
     */
    protected $_geometry;

    /**
     * The stored data.
     *
     * @var mixed
     */
    protected $_data;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Geometry_Point|SetaPDF_Core_Geometry_Rectangle $geometry
     * @param mixed $data
     */
    public function __construct($geometry, $data)
    {
        $this->_geometry = $geometry;
        $this->_data = $data;
    }

    /**
     * Get the Geometry that was used to insert the data.
     *
     * @return SetaPDF_Core_Geometry_Point|SetaPDF_Core_Geometry_Rectangle
     */
    public function getGeometry()
    {
        return $this->_geometry;
    }

    /**
     * Get the stored data.
     *
     * @return mixed
     */
    public function getData()
    {
        return $this->_data;
    }
}