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
 * This class represents the "hmtx" table in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/hmtx.htm} for more details.
 *
 * @method SetaPDF_Core_Font_TrueType_Table_HorizontalMetrics getOriginalTable()
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_HorizontalMetrics extends SetaPDF_Core_Font_TrueType_Subset_Table
{
    /**
     * The horizontal metrics.
     *
     * @var array
     */
    private $_hMetrics = [];

    /**
     * The optimized horizontal metrics.
     *
     * @var null|array
     */
    private $_optimized;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Table_HorizontalMetrics $table
     */
    public function __construct(SetaPDF_Core_Font_TrueType_Table_HorizontalMetrics $table)
    {
        parent::__construct($table);
    }

    /**
     * @inheritdoc
     */
    public function cleanUp()
    {
        parent::cleanUp();
        unset($this->_hMetrics);
        unset($this->_optimized);
        $this->_hMetrics = null;
        $this->_optimized = null;
    }

    /**
     * Paired advance width and left side bearing values for each glyph.
     *
     * Records are indexed by glyph id. There is no glyph id gap allowed in the data that gets added.
     *
     * @param int $glyphId
     * @param int $advanceWidth
     * @param int $leftSideBearing
     */
    public function addHMetric($glyphId, $advanceWidth, $leftSideBearing)
    {
        if ($glyphId > count($this->_hMetrics)) {
            throw new InvalidArgumentException(
                sprintf('Next glyph id needs to be %s, got %s', count($this->_hMetrics), $glyphId)
            );
        }

        $this->_hMetrics[$glyphId] = [$advanceWidth, $leftSideBearing];
        unset($this->_optimized);
    }

    /**
     * Get the horizontal metric by a glyph id.
     *
     * @param int $glyphId
     * @return int[2]
     */
    public function getHMetric($glyphId)
    {
        if (!isset($glyphId)) {
            throw new InvalidArgumentException('Invalid glyph id.');
        }

        return $this->_hMetrics[$glyphId];
    }

    /**
     * Optimizes the horizontal metrics data.
     *
     * @return array The optimized horizontal metrics.
     */
    public function optimize()
    {
        if (isset($this->_optimized)) {
            return $this->_optimized;
        }

        $previousAdvanceWidth = null;

        $hMetrics = [];
        $leftSideBearings = [];

        foreach ($this->_hMetrics as $glyphId => $_data) {
            list ($advanceWidth, $leftSideBearing) = $_data;

            if ($previousAdvanceWidth !== $advanceWidth) {
                foreach ($leftSideBearings as $_glyphId => $_leftSideBearing) {
                    $hMetrics[$_glyphId] = [$previousAdvanceWidth, $_leftSideBearing];
                }
                $hMetrics[$glyphId] = [$advanceWidth, $leftSideBearing];
                $leftSideBearings = [];
                $previousAdvanceWidth = $advanceWidth;
            } else {
                $leftSideBearings[$glyphId] = $leftSideBearing;
            }
        }

        $this->_optimized = [
            $hMetrics,
            $leftSideBearings
        ];

        return $this->_optimized;
    }

    /**
     * @inheritdoc
     */
    public function write(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        list($hMetrics, $leftSideBearings) = $this->optimize();

        foreach ($hMetrics as $data) {
            $writer->write(
                // advance with (uint16)
                SetaPDF_Core_BitConverter::formatToUInt16($data[0]) .
                // lsb int16
                SetaPDF_Core_BitConverter::formatToInt16($data[1])
            );
        }

        foreach ($leftSideBearings as $data) {
            $writer->write(SetaPDF_Core_BitConverter::formatToInt16($data));
        }
    }
}