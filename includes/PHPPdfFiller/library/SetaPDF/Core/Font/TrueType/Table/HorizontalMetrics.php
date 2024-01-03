<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: HorizontalMetrics.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing the Horizontal Metrics Table (hmtx) in a TrueType file.
 * https://www.microsoft.com/typography/otspec/hmtx.htm
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_HorizontalMetrics extends SetaPDF_Core_Font_TrueType_Table
{
    /**
     * The tag name of this class
     *
     * @var string
     */
    const TAG = SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_METRICS;

    /**
     * Ensures the metrics of a specific glyph.
     *
     * @param integer $glyphId
     */
    protected function _ensureHMetrics($glyphId)
    {
        $numberOfHMetrics = $this->_getNumberOfMetrics();

        if ($glyphId >= $numberOfHMetrics || $glyphId < 0) {
            throw new OutOfRangeException(sprintf('Glyph id (%s) is out of range.', $glyphId));
        }

        $record = $this->_record;
        $reader = $record->getFile()->getReader();
        $reader->reset($record->getOffset() + ($glyphId * 4), 4);

        $this->_data['hMetrics'][$glyphId] = array(
            SetaPDF_Core_BitConverter::formatFromUInt16($reader->readBytes(2)),
            SetaPDF_Core_BitConverter::formatFromInt16($reader->readBytes(2))
        );
    }

    /**
     * Get the advance width of a specific glyph.
     *
     * @param integer $glyphId
     * @return integer
     */
    public function getAdvanceWidth($glyphId)
    {
        if (!isset($this->_data['hMetrics'][$glyphId])) {
            // [...]in which case the advance width value of the last record applies to all remaining glyph ID
            $numberOfHMetrics = $this->_getNumberOfMetrics();
            if ($glyphId >= $numberOfHMetrics) {
                /**
                 * @var SetaPDF_Core_Font_TrueType_Table_MaximumProfile $maxpTable
                 */
                $maxpTable = $this->_record->getFile()->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::MAXIMUM_PROFILE);
                $numOfGlyphs = $maxpTable->getNumGlyphs();

                if ($glyphId > $numOfGlyphs - 1) {
                    throw new OutOfRangeException(sprintf('Glyph id (%s) is out of range.', $glyphId));
                }

                $glyphId = $numberOfHMetrics - 1;
            }

            if (!isset($this->_data['hMetrics'][$glyphId])) {
                $this->_ensureHMetrics($glyphId);
            }
        }

        return $this->_data['hMetrics'][$glyphId][0];
    }

    /**
     * Get the left side bearing of a specifc glyph.
     *
     * @param integer $glyphId
     * @return integer
     */
    public function getLeftSideBearing($glyphId)
    {
        $numberOfHMetrics = $this->_getNumberOfMetrics();

        if ($glyphId < $numberOfHMetrics) {
            if (!isset($this->_data['hMetrics'][$glyphId])) {
                $this->_ensureHMetrics($glyphId);
            }

            return $this->_data['hMetrics'][$glyphId][1];
        }

        if (isset($this->_data['leftSideBearing'][$glyphId])) {
            return $this->_data['leftSideBearing'][$glyphId];
        }

        /**
         * @var SetaPDF_Core_Font_TrueType_Table_MaximumProfile $maxpTable
         */
        $maxpTable = $this->_record->getFile()->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::MAXIMUM_PROFILE);
        $numOfGlyphs = $maxpTable->getNumGlyphs();

        $count = $numOfGlyphs - $numberOfHMetrics;
        $index = $glyphId - $numberOfHMetrics;

        if ($index > $count - 1) {
            throw new OutOfRangeException(sprintf('Glyph id (%s) is out of range.', $glyphId));
        }

        $record = $this->_record;
        $position = $record->getOffset() + $numberOfHMetrics * 4 + $index * 2;
        $reader = $record->getFile()->getReader();
        $reader->reset($position, 2);

        $this->_data['leftSideBearing'][$glyphId] = SetaPDF_Core_BitConverter::formatFromInt16(
            $reader->readBytes(2)
        );

        return $this->_data['leftSideBearing'][$glyphId];
    }

    /**
     * Get the number of metrics.
     *
     * @return integer
     */
    private function _getNumberOfMetrics()
    {
        /**
         * @var SetaPDF_Core_Font_TrueType_Table_HorizontalHeader $hheaTable
         */
        $hheaTable = $this->_record->getFile()->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_HEADER);
        return $hheaTable->getNumberOfHMetrics();
    }
}