<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: CharacterToGlyphIndexMapping.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * A class representing the Character To Glyph Index Mapping Table (cmap) in a TrueType file.
 * https://www.microsoft.com/typography/otspec/cmap.htm
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping extends SetaPDF_Core_Font_TrueType_Table
{
    /**
     * The tag name of this class
     *
     * @var string
     */
    const TAG = SetaPDF_Core_Font_TrueType_Table_Tags::CMAP;

    /**
     * Windows Platform
     *
     * @var integer
     */
    const PLATFORM_WINDOWS = 3;

    /**
     * Macintosh Platform
     *
     * @var integer
     */
    const PLATFORM_MAC = 1;

    /**
     * Unicode Platform
     *
     * @var integer
     */
    const PLATFORM_UNICODE = 0;

    /**
     * Custom Platform
     *
     * @var integer
     */
    const PLATFORM_CUSTOM = 4;

    /**
     * The entries in that table
     *
     * @var array
     */
    protected $_entries = [
        'version' => [0, SetaPDF_Core_BitConverter::USHORT],
        'numTables' => [2, SetaPDF_Core_BitConverter::USHORT],
    ];

    /**
     * Records for the sub tables
     *
     * @var array
     */
    private $_subTableRecords = [];

    /**
     * Release cycled references / memory.
     */
    public function cleanUp()
    {
        if ($this->_subTableRecords != null) {
            foreach ($this->_subTableRecords AS $encodings) {
                foreach ($encodings AS $record) {
                    $record->cleanUp();
                }
            }
        }

        $this->_subTableRecords = null;

        parent::cleanUp();
    }

    /**
     * Get the table version.
     *
     * @return integer
     */
    public function getVersion()
    {
        return $this->_get('version');
    }

    /**
     * Get the number of sub tables.
     *
     * @return integer
     */
    public function getNumTables()
    {
        return $this->_get('numTables');
    }

    /**
     * Get information about available tables.
     *
     * @return array
     */
    public function getTableInformation()
    {
        if (!isset($this->_data['subTablesData'])) {
            $this->_readSubTableData();
        }

        $data = [];

        foreach ($this->_data['subTablesData'] as $platformId => $encodings) {
            foreach ($encodings AS $encodingId => $offset) {
                $data[] = [
                    'platformId' => $platformId,
                    'encodingId' => $encodingId
                ];
            }
        }

        return $data;
    }

    /**
     * Read sub table data.
     */
    private function _readSubTableData()
    {
        $numTables = $this->getNumTables();

        $record = $this->_record;
        $reader = $record->getFile()->getReader();
        $reader->reset($record->getOffset() + 4, $numTables * 8); // 2xUSHORT + 1xULONG

        $this->_data['subTablesData'] = [];

        for ($i = 0; $i < $numTables; $i++) {
            $_platformId = $reader->readUInt16();
            $_encodingId = $reader->readUInt16();
            $this->_data['subTablesData'][$_platformId][$_encodingId] = $reader->readUInt32();
        }
    }

    /**
     * Checks if a sub table exists in this font.
     *
     * @param integer $platformId
     * @param integer $encodingId
     * @return bool
     */
    public function hasSubTable($platformId, $encodingId)
    {
        if (!isset($this->_data['subTablesData'])) {
            $this->_readSubTableData();
        }

        return isset($this->_data['subTablesData'][$platformId][$encodingId]);
    }

    /**
     * Get a sub table.
     *
     * @param integer $platformId
     * @param integer $encodingId
     * @return bool|SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_SubTable
     */
    public function getSubTable($platformId, $encodingId)
    {
        if (isset($this->_subTableRecords[$platformId][$encodingId])) {
            return $this->_subTableRecords[$platformId][$encodingId]->getTable();
        }

        if (!$this->hasSubTable($platformId, $encodingId)) {
            return false;
        }

        $record = $this->_record;
        $reader = $record->getFile()->getReader();
        $offset = $record->getOffset() + $this->_data['subTablesData'][$platformId][$encodingId];
        $reader->reset($offset, 6);

        $classPrefix = 'SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_';

        $format = $reader->readUInt16();
        switch ($format) {
            case 0:
                $className = 'ByteEncoding';
                break;
            case 4:
                $className = 'SegmentToDelta';
                break;
            case 6:
                $className = 'Trimmed';
                break;
            case 12:
                $className = 'SegmentedCoverage';
                break;
            default:
                $className = 'SubTable';
                break;
        }

        $length = $reader->readUInt16();

        $this->_subTableRecords[$platformId][$encodingId] = new SetaPDF_Core_Font_TrueType_Table_Record(
            $record->getFile(), $offset, $length, $classPrefix . $className
        );

        return $this->_subTableRecords[$platformId][$encodingId]->getTable();
    }
}