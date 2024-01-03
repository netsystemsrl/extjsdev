<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Header.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * A class representing the Font Header Table (head) in a TrueType file.
 * https://www.microsoft.com/typography/otspec/head.htm
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_Header extends SetaPDF_Core_Font_TrueType_Table
{
    /**
     * The tag name of this class
     *
     * @var string
     */
    const TAG = SetaPDF_Core_Font_TrueType_Table_Tags::HEADER;

    /**
     * Mac style ids.
     *
     * @integer
     */
    const MAC_STYLE_BOLD = 1;
    const MAC_STYLE_ITALIC = 2;
    const MAC_STYLE_UNDERLINE = 4;
    const MAC_STYLE_OUTLINE = 8;
    const MAC_STYLE_SHADOW = 16;
    const MAC_STYLE_CONDENSED = 32;
    const MAC_STYLE_EXTENDED = 64;

    /**
     * The entries of this table.
     *
     * @var array
     */
    protected $_entries = [
        'version' => [0, SetaPDF_Core_BitConverter::FIXED],
        'revision' => [4, SetaPDF_Core_BitConverter::FIXED],
        'checkSumAdjustment' => [8, SetaPDF_Core_BitConverter::ULONG],
        'magicNumber' => [12, SetaPDF_Core_BitConverter::ULONG],
        'flags' => [16, SetaPDF_Core_BitConverter::USHORT],
        'unitsPerEm' => [18, SetaPDF_Core_BitConverter::USHORT],
        'created' => [20, 8],
        'modified' => [28, 8],
        'xMin' => [36, SetaPDF_Core_BitConverter::SHORT],
        'yMin' => [38, SetaPDF_Core_BitConverter::SHORT],
        'xMax' => [40, SetaPDF_Core_BitConverter::SHORT],
        'yMax' => [42, SetaPDF_Core_BitConverter::SHORT],
        'macStyle' => [44, SetaPDF_Core_BitConverter::USHORT],
        'lowestRecPPEM' => [46, SetaPDF_Core_BitConverter::USHORT],
        'fontDirectionHint' => [48, SetaPDF_Core_BitConverter::SHORT],
        'indexToLocFormat' => [50, SetaPDF_Core_BitConverter::SHORT],
        'glyphDataFormat' => [52, SetaPDF_Core_BitConverter::SHORT]
    ];

    /**
     * Get the version (major.minor)
     *
     * @return float
     */
    public function getVersion()
    {
        return $this->_get('version');
    }

    /**
     * Get the font revision.
     *
     * @param boolean $round
     * @return float
     */
    public function getRevision($round = true)
    {
        if ($round) {
            return round($this->_get('revision'), 1);
        }

        return $this->_get('revision');
    }

    /**
     * Get the check sum adjustment.
     *
     * @return integer
     */
    public function getCheckSumAdjustment()
    {
        return $this->_get('checkSumAdjustment');
    }

    /**
     * Get the magic number.
     *
     * @return integer
     */
    public function getMagicNumber()
    {
        return $this->_get('magicNumber');
    }

    /**
     * Get the font flags.
     *
     * @return integer
     */
    public function getFlags()
    {
        return $this->_get('flags');
    }

    /**
     * Get the units per em value.
     *
     * @return integer
     */
    public function getUnitsPerEm()
    {
        return $this->_get('unitsPerEm');
    }

    /**
     * Get the number of seconds since 12:00 midnight that started January 1st 1904 in GMT/UTC time zone when the font was created.
     *
     * @return string The raw data representing the LONGDATETIME data type.
     */
    public function getCreated()
    {
        return $this->_get('created');
    }

    /**
     * Get the number of seconds since 12:00 midnight that started January 1st 1904 in GMT/UTC time zone when the font was modifed.
     *
     * @return string The raw data representing the LONGDATETIME data type.
     */
    public function getModified()
    {
        return $this->_get('modified');
    }

    /**
     * Get the x-min value for all glyph bounding boxes.
     *
     * @return integer
     */
    public function getXMin()
    {
        return $this->_get('xMin');
    }

    /**
     * Get the y-min value for all glyph bounding boxes.
     *
     * @return integer
     */
    public function getYMin()
    {
        return $this->_get('yMin');
    }

    /**
     * Get the x-max value for all glyph bounding boxes.
     *
     * @return integer
     */
    public function getXMax()
    {
        return $this->_get('xMax');
    }

    /**
     * Get the y-max value for all glyph bounding boxes.
     *
     * @return integer
     */
    public function getYMax()
    {
        return $this->_get('yMax');
    }

    /**
     * Get the bounding box.
     *
     * @param boolean $recalc
     * @return array
     */
    public function getBoundingBox($recalc = false)
    {
        if (false === $recalc) {
            return array(
                $this->getXMin(),
                $this->getYMin(),
                $this->getXMax(),
                $this->getYMax()
            );

        } else {
            $file = $this->_record->getFile();
            /**
             * @var SetaPDF_Core_Font_TrueType_Table_GlyphData $table
             */
            $table = $file->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::GLYF);

            $boundingBox = [0, 0, 0, 0];

            $numGlyphs = $file->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::MAXIMUM_PROFILE)->getNumGlyphs();
            for ($glyphId = 0; $glyphId < $numGlyphs; $glyphId++) {
                $glyph = $table->getGlyph($glyphId);
                if (false === $glyph)
                    continue;

                $boundingBox[0] = min($boundingBox[0], $glyph->getXMin());
                $boundingBox[1] = min($boundingBox[1], $glyph->getYMin());
                $boundingBox[2] = max($boundingBox[2], $glyph->getXMax());
                $boundingBox[3] = max($boundingBox[3], $glyph->getYMax());
            }

            return $boundingBox;
        }
    }

    /**
     * Get the MacStyle
     *
     * Bit 0: Bold (if set to 1);
     * Bit 1: Italic (if set to 1)
     * Bit 2: Underline (if set to 1)
     * Bit 3: Outline (if set to 1)
     * Bit 4: Shadow (if set to 1)
     * Bit 5: Condensed (if set to 1)
     * Bit 6: Extended (if set to 1)
     * Bits 7-15: Reserved (set to 0).
     *
     * @return integer
     */
    public function getMacStyle()
    {
        return $this->_get('macStyle');
    }

    /**
     * Checks whether a mac style is set or not.
     *
     * @param integer $style
     * @return boolean
     */
    public function hasMacStyle($style)
    {
        return ($this->getMacStyle() & $style) === $style;
    }

    /**
     * Get the smallest readable size in pixels.
     *
     * @return integer
     */
    public function getLowestRecPPEM()
    {
        return $this->_get('lowestRecPPEM');
    }

    /**
     * Get the font direction hint (deprecated).
     *
     * @return integer
     */
    public function getFontDirectionHint()
    {
        return $this->_get('fontDirectionHint');
    }

    /**
     * Get index to location format.
     *
     * @return integer 0 for short offsets, 1 for long.
     */
    public function getIndexToLocFormat()
    {
        return $this->_get('indexToLocFormat');
    }

    /**
     * Get glyph data format.
     *
     * @return integer
     */
    public function getGlyphDataFormat()
    {
        return $this->_get('glyphDataFormat');
    }
}