<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Name.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * A class representing the Naming Table (name) in a TrueType file.
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_Name extends SetaPDF_Core_Font_TrueType_Table
{
    /**
     * The tag name of this class
     *
     * @var string
     */
    const TAG = SetaPDF_Core_Font_TrueType_Table_Tags::NAME;

    /**
     * Name IDs
     *
     * @var integer
     */
    const COPYRIGHT = 0;
    const FAMILY_NAME = 1;
    const SUBFAMILY_NAME = 2;
    const UID = 3;
    const FULL_FONT_NAME = 4;
    const VERSION = 5;
    const POSTSCRIPT_NAME = 6;
    const TRADEMARK = 7;
    const MANUFACTURER_NAME = 8;
    const DESIGNER = 9;
    const DESCRIPTION = 10;
    const VENDOR_URL = 11;
    const DESIGNER_URL = 12;
    const LICENSE_DESCRIPTION = 13;
    const LICENSE_INFO_URL = 14;
    const TYPOGRAPHIC_FAMILY_NAME = 16;
    const TYPOGRAPHIC_SUBFAMILY_NAME = 17;
    const COMPATIBLE_FULL = 18;
    const SAMPLE_TEXT = 19;
    const POST_SCRIPT_CID_FINDFONT_NAME = 20;
    const WWS_FAMILY_NAME = 21;
    const WWS_SUBFAMILY_NAME = 22;
    const LIGHT_BACKGROUND_PALETTE = 23;
    const DARK_BACKGROUND_PALETTE = 24;
    const VARIATIONS_POST_SCRIPT_NAME_PREFIX = 25;

    /**
     * The table entries
     *
     * @var array
     */
    protected $_entries = [
        'format' => [0, SetaPDF_Core_BitConverter::USHORT],
        'count' => [2, SetaPDF_Core_BitConverter::USHORT],
        'stringOffset' => [4, SetaPDF_Core_BitConverter::USHORT],
    ];

    /**
     * The name records
     *
     * @var array
     */
    protected $_records = [];

    /**
     * Flag specifying if the records are read or not.
     *
     * @var bool
     */
    protected $_recordsRead = false;

    /**
     * Get the format.
     *
     * @return integer
     */
    public function getFormat()
    {
        return $this->_get('format');
    }

    /**
     * Get the number of name records.
     *
     * @return integer
     */
    public function getCount()
    {
        return $this->_get('count');
    }

    /**
     * Get the offset to start of string storage (from start of table).
     *
     * @return integer
     */
    public function getStringOffset()
    {
        return $this->_get('stringOffset');
    }

    /**
     * Checks wheter a name exists.
     *
     * @param integer $platformId
     * @param integer $encodingId
     * @param integer $languageId
     * @param integer $nameId
     * @return bool
     */
    public function hasName($platformId, $encodingId, $languageId, $nameId)
    {
        if (false === $this->_recordsRead) {
            $this->_readRecords();
        }

        return isset($this->_records[$platformId][$encodingId][$languageId][$nameId]);
    }

    /**
     * Get a name.
     *
     * @param integer $platformId
     * @param integer $encodingId
     * @param integer $languageId
     * @param integer $nameId
     * @return bool|string
     */
    public function getName($platformId, $encodingId, $languageId, $nameId)
    {
        if (!$this->hasName($platformId, $encodingId, $languageId, $nameId)) {
            return false;
        }

        $nameRecord = $this->_records[$platformId][$encodingId][$languageId][$nameId];

        $record = $this->_record;
        $reader = $record->getFile()->getReader();

        $bytes = $reader->readBytes($nameRecord[0], $record->getOffset() + $this->getStringOffset() + $nameRecord[1]);

        return $bytes;
    }

    /**
     * Get all defined names.
     *
     * @return array A multi-dimensional array with the format $result[$platformId][$encodingId][$languageId][$nameId].
     */
    public function getAllNames()
    {
        if (false === $this->_recordsRead) {
            $this->_readRecords();
        }

        $result = [];
        foreach ($this->_records AS $platformId => $encodings) {
            foreach ($encodings AS $encodingId => $language) {
                foreach ($language AS $languageId => $names) {
                    foreach (array_keys($names) as $nameId) {
                        $result[$platformId][$encodingId][$languageId][$nameId] = $this->getName(
                            $platformId, $encodingId, $languageId, $nameId
                        );
                    }
                }
            }
        }

        return $result;
    }

    /**
     * Ensure that all records are read.
     */
    protected function _readRecords()
    {
        $count = $this->getCount();

        $record = $this->_record;
        $reader = $record->getFile()->getReader();
        $reader->reset($record->getOffset() + 6, $count * 12);

        for ($i = 0; $i < $count; $i++) {
            $platformId = $reader->readUInt16();
            $encodingId = $reader->readUInt16();
            $languageId = $reader->readUInt16();
            $nameId     = $reader->readUInt16();
            $lenght     = $reader->readUInt16();
            $offset     = $reader->readUInt16();

            $this->_records[$platformId][$encodingId][$languageId][$nameId] = [$lenght, $offset];
        }

        $this->_recordsRead = true;
    }
}