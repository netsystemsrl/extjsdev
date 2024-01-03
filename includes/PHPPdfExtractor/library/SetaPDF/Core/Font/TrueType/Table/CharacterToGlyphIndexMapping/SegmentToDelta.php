<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: SegmentToDelta.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * A class representing a subtable "Format 4: Segment mapping to delta values".
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_SegmentToDelta extends
    SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_SubTable
{
    /**
     * Flag specifying that the table data were read
     *
     * @var bool
     */
    protected $_tableRead = false;

    /**
     * The entries of this subtable
     *
     * @var array
     */
    protected $_entries = [
        'format' => [0, SetaPDF_Core_BitConverter::USHORT],
        'length' => [2, SetaPDF_Core_BitConverter::USHORT],
        'language' => [4, SetaPDF_Core_BitConverter::USHORT],
        'segCountX2' => [6, SetaPDF_Core_BitConverter::USHORT],
        'searchRange' => [8, SetaPDF_Core_BitConverter::USHORT],
        'entrySelector' => [10, SetaPDF_Core_BitConverter::USHORT],
        'rangeShift' => [12, SetaPDF_Core_BitConverter::USHORT],
    ];

    /**
     * The segments
     *
     * @var array
     */
    protected $_segments = [];

    /**
     * The end codes
     *
     * @var array
     */
    protected $_endCodes = [];

    /**
     * The start codes
     *
     * @var array
     */
    protected $_startCodes = [];

    /**
     * The id delta valuess
     *
     * @var array
     */
    protected $_idDeltas = [];

    /**
     * The id range offsets
     *
     * @var array
     */
    protected $_idRangeOffsets = [];

    /**
     * The range offset position
     *
     * @var integer
     */
    private $_rangeOffsetPosition;

    /**
     * The search range value
     *
     * @var integer
     */
    private $_searchRange;

    /**
     * The segment count
     *
     * @var integer
     */
    private $_segmentCount;

    /**
     * The search iteration count
     *
     * @var integer
     */
    private $_searchIterations;

    /**
     * Release memory.
     */
    public function cleanUp()
    {
        $this->_segments = null;
        $this->_endCodes = null;
        $this->_startCodes = null;
        $this->_idDeltas = null;
        $this->_idRangeOffsets = null;

        parent::cleanUp();
    }

    /**
     * Get the doubled segmentation count.
     *
     * @return integer
     */
    public function getSegCountX2()
    {
        return $this->_get('segCountX2');
    }

    /**
     * Get the search range value.
     *
     * @return integer
     */
    public function getSearchRange()
    {
        return $this->_get('searchRange');
    }

    /**
     * Get the entry selector value.
     *
     * @return integer
     */
    public function getEntrySelector()
    {
        return $this->_get('entrySelector');
    }

    /**
     * Get the range shoft value.
     *
     * @return integer
     */
    public function getRangeShift()
    {
        return $this->_get('rangeShift');
    }

    /**
     * Get the glyph index by a character code.
     *
     * @param integer $charCode
     * @return integer
     */
    public function getGlyphIndex($charCode)
    {
        if (false === $this->_tableRead) {
            $this->_readTable();
        }

        $reader = $this->_record->getFile()->getReader();

        if ($charCode > $this->_endCodes[$this->_segmentCount]) {
            return 0;
        }

        if ($this->_endCodes[$this->_searchRange] >= $charCode) {
            $searchNo = $this->_searchRange;
        } else {
            $searchNo = $this->_segmentCount;
        }

        for ($i = 1; $i <= $this->_searchIterations; $i++) {
            if ($this->_endCodes[$searchNo] < $charCode) {
                $searchNo += $this->_searchRange >> $i;
            } else {
                $segmentNo = $searchNo;
                $searchNo -= $this->_searchRange >> $i;
            }
        }

        if (!isset($segmentNo) || $this->_startCodes[$segmentNo] > $charCode) {
            return 0;
        }

        $idRangeOffset = $this->_idRangeOffsets[$segmentNo];
        if ($idRangeOffset !== 0) {
            // The character code offset from startCode is added to the idRangeOffset
            // value. This sum is used as an offset from the current location within idRangeOffset itself to
            // index out the correct glyphIdArray value. This indexing method works because glyphIdArray
            // immediately follows idRangeOffset in the font file. The address of the glyph index is given by
            // the following equation:
            // idRangeOffset[i] + 2 * (c - startCode[i]) + (Ptr) &idRangeOffset[i]
            $offset = $idRangeOffset + 2 * ($charCode - $this->_startCodes[$segmentNo])
                    + ($this->_rangeOffsetPosition + 2 * ($segmentNo - 1));

            $glyphIndex = $reader->readUInt16($offset);
        } else {
            $glyphIndex = $charCode;
        }

        return ($glyphIndex + $this->_idDeltas[$segmentNo]) & 0xFFFF;
    }

    /**
     * Reads the table data.
     */
    protected function _readTable()
    {
        $segCountX2 = $this->getSegCountX2();
        $this->_segmentCount = $segCountX2 >> 1;

        $record = $this->_record;
        $reader = $record->getFile()->getReader();
        // endCode offset
        $offset = $record->getOffset() + 6 + 8;
        $reader->reset($offset, $segCountX2 * 4 + 2);

        for ($segmentNo = 1; $segmentNo <= $this->_segmentCount; $segmentNo++) {
            $this->_endCodes[$segmentNo] = $reader->readUInt16();
        }

        $reader->skip(2);
        for ($segmentNo = 1; $segmentNo <= $this->_segmentCount; $segmentNo++) {
            $this->_startCodes[$segmentNo] = $reader->readUInt16();
        }

        for ($segmentNo = 1; $segmentNo <= $this->_segmentCount; $segmentNo++) {
            $this->_idDeltas[$segmentNo] = $reader->readInt16();
        }

        $this->_rangeOffsetPosition = $offset + $segCountX2 * 3 + 2;
        for ($segmentNo = 1; $segmentNo <= $this->_segmentCount; $segmentNo++) {
            $this->_idRangeOffsets[$segmentNo] = $reader->readUInt16();
        }

        $this->_searchRange = $this->getSearchRange() >> 1;
        $this->_searchIterations = $this->getEntrySelector() + 1;

        $this->_tableRead = true;
    }
}