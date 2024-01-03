<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: IndexToLocation.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing the Index to Location (loca) in a TrueType file.
 * https://www.microsoft.com/typography/otspec/loca.htm
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_IndexToLocation extends SetaPDF_Core_Font_TrueType_Table
{
    /**
     * The tag name of this class
     *
     * @var string
     */
    const TAG = SetaPDF_Core_Font_TrueType_Table_Tags::LOCA;

    /**
     * The number of glyphs in the font.
     *
     * @var int
     */
    protected $_numGlyphs;

    public function __construct(SetaPDF_Core_Font_TrueType_Table_Record $record)
    {
        parent::__construct($record);

        /**
         * @var $maxp SetaPDF_Core_Font_TrueType_Table_MaximumProfile
         */
        $maxp = $record->getFile()->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::MAXIMUM_PROFILE);
        $this->_numGlyphs = $maxp->getNumGlyphs();
    }

    /**
     * Get the offset location of a single glyph.
     *
     * @param integer $glyphId
     * @return integer
     * @throws SetaPDF_Core_Font_Exception
     */
    public function getLocation($glyphId)
    {
        $result = $this->getLocations([$glyphId]);
        return $result[$glyphId];
    }

    /**
     * Get offset locations of glyphs.
     *
     * @param integer[] $glyphIds
     * @return integer[]
     * @throws SetaPDF_Core_Font_Exception
     */
    public function getLocations(array $glyphIds)
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Table_Header $headTable
         */
        $headTable = $this->_record->getFile()->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HEADER);
        $indexToLocFormat = $headTable->getIndexToLocFormat(); // 0 for short offsets, 1 for long.

        $record = $this->_record;
        $reader = $record->getFile()->getReader();
        $offset = $record->getOffset();

        $result = [];
        if ($indexToLocFormat === 0) {
            foreach ($glyphIds AS $glyphId) {
                if ($glyphId < 0 ||  $glyphId > $this->_numGlyphs) {
                    throw new SetaPDF_Core_Font_Exception(
                        'Invalid glyph id: ' . $glyphId
                    );
                }
                $result[$glyphId] = $reader->readUInt16($offset + $glyphId * 2) * 2;
            }
        } else {
            foreach ($glyphIds AS $glyphId) {
                if ($glyphId < 0 ||  $glyphId > $this->_numGlyphs) {
                    throw new SetaPDF_Core_Font_Exception(
                        'Invalid glyph id: ' . $glyphId
                    );
                }

                $result[$glyphId] = $reader->readUInt32($offset + $glyphId * 4);
            }
        }

        return $result;
    }
}