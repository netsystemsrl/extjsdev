<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: StorageInterface.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * A interface to implement different storage types
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Storage
 * @license    https://www.setasign.com/ Commercial
 */
interface SetaPDF_Extractor_Storage_StorageInterface
{
    /**
     * Create a new entry for the data using the geometry and inserts it into the storage.
     *
     * @param SetaPDF_Core_Geometry_Point|SetaPDF_Core_Geometry_Rectangle $geometry
     * @param mixed $data
     * @return SetaPDF_Extractor_Storage_StorageEntry
     */
    public function insert($geometry, $data);

    /**
     * Insert an entry into the storage.
     *
     * @param SetaPDF_Extractor_Storage_StorageEntry $entry
     * @return SetaPDF_Extractor_Storage_StorageEntry
     */
    public function insertEntry(SetaPDF_Extractor_Storage_StorageEntry $entry);

    /**
     * Remove an entry from the storage.
     *
     * @param SetaPDF_Extractor_Storage_StorageEntry $entry
     * @return SetaPDF_Extractor_Storage_StorageEntry
     */
    public function removeEntry(SetaPDF_Extractor_Storage_StorageEntry $entry);

    /**
     * Get all entries intersecting with the given geometry.
     *
     * @param SetaPDF_Core_Geometry_Rectangle|SetaPDF_Core_Geometry_Point $geometry
     * @return SetaPDF_Extractor_Storage_StorageEntry[]
     */
    public function get($geometry);

    /**
     * Get the first available storage-entry or false.
     *
     * @return SetaPDF_Extractor_Storage_StorageEntry|false
     */
    public function getFirstAvailable();

    /**
     * Removes all entries from the storage and cleans up.
     */
    public function clear();

    /**
     * Get all entries intersecting with the given entry.
     *
     * @param SetaPDF_Extractor_Storage_StorageEntry $entry
     * @return SetaPDF_Extractor_Storage_StorageEntry[]
     */
    public function getIntersecting(SetaPDF_Extractor_Storage_StorageEntry $entry);
}