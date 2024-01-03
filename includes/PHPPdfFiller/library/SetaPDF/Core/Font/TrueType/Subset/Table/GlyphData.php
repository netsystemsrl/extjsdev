<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: GlyphData.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * This class represents the "glyf" table in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/glyf.htm} for more details.
 *
 * @method SetaPDF_Core_Font_TrueType_Table_GlyphData getOriginalTable()
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData
    extends SetaPDF_Core_Font_TrueType_Subset_Table
{
    /**
     * The glyphs to subset.
     *
     * @var SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Glyph[]
     */
    private $_glyphs = [];

    /**
     * Original glyph id to new glyph id mapping array.
     *
     * @var int[]
     */
    private $_mapping = [];

    /**
     * The
     * @var SetaPDF_Core_Font_TrueType_Subset_File
     */
    private $_file;

    /**
     * @var SetaPDF_Core_Font_TrueType_Subset_Table_HorizontalMetrics
     */
    private $_hmtx;

    public function __construct(
        SetaPDF_Core_Font_TrueType_Table_GlyphData $table,
        SetaPDF_Core_Font_TrueType_Subset_File $file
    )
    {
        parent::__construct($table);
        $this->_hmtx = $file->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HORIZONTAL_METRICS);
        $this->_file = $file;
    }

    /**
     * @inheritdoc
     */
    public function cleanUp()
    {
        parent::cleanUp();

        foreach ($this->_glyphs as $glyph) {
            if ($glyph !== false) {
                $glyph->cleanUp();
            }
        }

        $this->_file = null;
        $this->_glyphs = null;
        $this->_mapping = null;
        $this->_hmtx = null;
    }

    /**
     * Gets the current number of registered glyphs.
     *
     * @return int
     */
    public function getNumGlyphs()
    {
        return count($this->_mapping);
    }

    /**
     * Registers a glyph using his glyph id and returns a new glyph id.
     *
     * @param int $originGlyphId The origin glyph id
     * @return int|false The new glyph id
     */
    public function registerGlyph($originGlyphId)
    {
        if (!isset($this->_mapping[$originGlyphId])) {
            $glyph = $this->getOriginalTable()->getGlyph($originGlyphId);
            $newGlyphId = count($this->_glyphs);

            // this can throw an exception, so we will do this at first, in order to make sure that we do not have invalid data.
            $this->_hmtx->addHMetric(
                $newGlyphId,
                $this->_hmtx->getOriginalTable()->getAdvanceWidth($originGlyphId),
                $this->_hmtx->getOriginalTable()->getLeftSideBearing($originGlyphId)
            );

            if ($glyph !== false) {
                $glyph = new SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Glyph($this, $glyph);
            }

            $this->_mapping[$originGlyphId] = $newGlyphId;
            $this->_glyphs[] = $glyph;
        }

        return $this->_mapping[$originGlyphId];
    }

    /**
     * Gets the new glyph.
     *
     * @param int $glyphId The new glyphId
     * @return SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Glyph|false
     */
    public function getGlyph($glyphId)
    {
        if (!isset($this->_glyphs[$glyphId])) {
            throw new InvalidArgumentException('Unknown glyph-id (' . ((int)$glyphId) . ')');
        }
        return $this->_glyphs[$glyphId];
    }

    /**
     * Gets the new glyph id by its original glyph id.
     *
     * @param int $originalGlyphId
     * @return int|int[]
     * @throws Exception
     */
    public function getNewGlyphId($originalGlyphId)
    {
        if (isset($this->_mapping[$originalGlyphId])) {
            return $this->_mapping[$originalGlyphId];
        }

        throw new SetaPDF_Core_Font_Exception(
            sprintf('Glpyh id (%s) is not registered.', $originalGlyphId)
        );
    }

    /**
     * Gets all original to new glyph id mappings.
     *
     * @return int[]
     */
    public function getMapping()
    {
        return $this->_mapping;
    }

    /**
     * @inheritdoc
     */
    public function write(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        $locations = [];

        $start = $writer->getPos();

        $format = 0;
        foreach ($this->_glyphs as $glyphId => $glyph) {
            $locations[] = $location = $writer->getPos() - $start;
            $format |= ($location & 1);

            if ($glyph !== false) {
                $glyph->write($writer);
            }
        }

        if (count($locations) === 0) {
            throw new LogicException('No glyph data available to subset.');
        }

        $locations[] = $writer->getPos() - $start;
        if ((max($locations) / 2) > 0xFFFF) {
            $format = 1;
        }

        /**
         * @var $loca SetaPDF_Core_Font_TrueType_Subset_Table_IndexToLocation
         * @var $head SetaPDF_Core_Font_TrueType_Subset_Table_Header
         */
        $loca = $this->_file->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::LOCA);
        $head = $this->_file->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::HEADER);

        $head->setIndexToLocFormat($format);

        $loca->setFormat($format);
        $loca->setLocations($locations);
    }
}