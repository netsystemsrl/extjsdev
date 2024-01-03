<?php
/**
 * This file is part of the SetaPDF-Extractor Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: SpatialStorage.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * The implementation of a spatial storage
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Extractor
 * @subpackage SetaPDF_Extractor_Storage
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Extractor_Storage_SpatialStorage implements SetaPDF_Extractor_Storage_StorageInterface
{
    /**
     * The given cell-size that will be used to hash the points.
     *
     * @var int|float
     */
    protected $_cellSize;

    /**
     * The cells.
     *
     * @var array
     */
    protected $_cells = [];

    /**
     * All hashes.
     *
     * @var array
     */
    protected $_hashes = [];

    /**
     * The constructor.
     *
     * @param int|float $cellSize
     */
    public function __construct($cellSize)
    {
        if ($cellSize < 1) {
            throw new InvalidArgumentException('The $cellSize parameter has to be larger or equal to one.');
        }

        $this->_cellSize = $cellSize;
    }

    /**
     * Creates a hash for a given point.
     *
     * @param SetaPDF_Core_Geometry_Point $p
     * @return array
     */
    protected function _hash(SetaPDF_Core_Geometry_Point $p)
    {
        return [
            floor($p->getX() / $this->_cellSize),
            floor($p->getY() / $this->_cellSize)
        ];
    }

    /**
     * Creates a coordinate range for a geometry.
     *
     * @param SetaPDF_Core_Geometry_Rectangle|SetaPDF_Core_Geometry_Point $geometry
     * @return array
     */
    protected function _getCoordinateRange($geometry)
    {
        switch (true) {
            case $geometry instanceof SetaPDF_Core_Geometry_Rectangle:
                list($startX, $endY) = $this->_hash($geometry->getUl());
                list($endX, $startY) = $this->_hash($geometry->getLr());
                break;
            case $geometry instanceof SetaPDF_Core_Geometry_Point:
                list($startX, $endY) = list($endX, $startY) = $this->_hash($geometry);
                break;
            default:
                throw new InvalidArgumentException('Cannot create coordinate range for ' . get_class($geometry) . '.');
        }

        return [
            $startX,
            $endX,
            $startY,
            $endY
        ];
    }

    /**
     * @inheritdoc
     */
    public function insert($geometry, $data)
    {
        return $this->insertEntry(new SetaPDF_Extractor_Storage_StorageEntry(clone $geometry, $data));
    }

    /**
     * Gets the hashes for a storage entry.
     *
     * @param SetaPDF_Extractor_Storage_StorageEntry $entry
     * @return array
     */
    protected function _getHashes(SetaPDF_Extractor_Storage_StorageEntry $entry)
    {
        $index = spl_object_hash($entry);

        if (!isset($this->_hashes[$index])) {
            $hashes = [];
            list($startX, $endX, $startY, $endY) = $this->_getCoordinateRange($entry->getGeometry());
            for ($x = $startX; $x <= $endX; $x++) {
                for ($y = $startY; $y <= $endY; $y++) {
                    $hashes[] = [$x, $y];
                }
            }
            $this->_hashes[$index] = $hashes;
        }

        return $this->_hashes[$index];
    }

    /**
     * @inheritdoc
     */
    public function insertEntry(SetaPDF_Extractor_Storage_StorageEntry $entry)
    {
        foreach ($this->_getHashes($entry) as $hash) {
            list($x, $y) = $hash;
            $this->_cells[$x][$y][spl_object_hash($entry)] = $entry;
        }
        return $entry;
    }

    /**
     * @inheritdoc
     */
    public function removeEntry(SetaPDF_Extractor_Storage_StorageEntry $entry)
    {
        foreach ($this->_getHashes($entry) as $hash) {
            list($x, $y) = $hash;
            $index = spl_object_hash($entry);
            unset($this->_cells[$x][$y][$index]);
        }

        return $entry;
    }

    /**
     * @inheritdoc
     */
    public function get($geometry)
    {
        list($startX, $endX, $startY, $endY) = $this->_getCoordinateRange($geometry);

        $result = [];
        for ($x = $startX; $x <= $endX; $x++) {
            if (!isset($this->_cells[$x])) {
                continue;
            }
            for ($y = $startY; $y <= $endY; $y++) {
                if (!isset($this->_cells[$x][$y])) {
                    continue;
                }
                foreach ($this->_cells[$x][$y] as $key => $cellEntry) {
                    /**
                     * @var SetaPDF_Extractor_Storage_StorageEntry $cellEntry
                     */
                    if (isset($result[$key]) || !$geometry->collides($cellEntry->getGeometry())) {
                        continue;
                    }

                    $result[$key] = $cellEntry;
                }
            }
        }

        return $result;
    }

    /**
     * @inheritdoc
     */
    public function getIntersecting(SetaPDF_Extractor_Storage_StorageEntry $entry)
    {
        $result = [];
        $geometry = $entry->getGeometry();
        foreach ($this->_getHashes($entry) as $hash) {
            list($x, $y) = $hash;
            if (!isset($this->_cells[$x][$y])) {
                continue;
            }

            foreach ($this->_cells[$x][$y] as $key => $cellEntry) {
                /**
                 * @var SetaPDF_Extractor_Storage_StorageEntry $cellEntry
                 */
                if (isset($result[$key]) || !$geometry->collides($cellEntry->getGeometry())) {
                    continue;
                }

                $result[$key] = $cellEntry;
            }
        }

        return $result;
    }

    /**
     * @inheritdoc
     */
    public function clear()
    {
        $this->_cells = [];
        $this->_hashes = [];
    }

    /**
     * @inheritdoc
     */
    public function getFirstAvailable()
    {
        foreach ($this->_cells as $xEntries) {
            foreach ($xEntries as $yEntries) {
                foreach ($yEntries as $entry) {
                    return $entry;
                }
            }
        }

        return false;
    }
}