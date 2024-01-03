<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Header.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * This class represents the "head" table in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/head.htm} for more details.
 *
 * @method SetaPDF_Core_Font_TrueType_Table_Header getOriginalTable()
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_Header extends SetaPDF_Core_Font_TrueType_Subset_Table
{
    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Table_Header $table
     */
    public function __construct(SetaPDF_Core_Font_TrueType_Table_Header $table)
    {
        parent::__construct($table);
    }

    /**
     * Sets the checksum adjustment.
     *
     * @param string $value
     */
    public function setCheckSumAdjustment($value)
    {
        $this->_changedData['checkSumAdjustment'] = $value;
    }

    /**
     * Set the font revision.
     *
     * Value comes from the font manufacturer.
     *
     * @param float $value
     */
    public function setRevision($value)
    {
        $this->_changedData['revision'] = $value;
    }

    /**
     * Set the modified time.
     *
     * Number of seconds since 12:00 midnight that started January 1st 1904 in GMT/UTC time zone.
     *
     * @param int $value
     */
    public function setModified($value)
    {
        $this->_changedData['modified'] = $value;
    }

    /**
     * Set the "loca" location format.
     *
     * 0 for short offsets (Offset16), 1 for long (Offset32).
     *
     * @see SetaPDF_Core_Font_TrueType_Subset_Table_IndexToLocation::setFormat()
     * @param int $format
     */
    public function setIndexToLocFormat($format)
    {
        $this->_changedData['indexToLocFormat'] = $format;
    }

    /**
     * Set the xMin value.
     *
     * @param int $xMin
     */
    public function setXMin($xMin)
    {
        $this->_changedData['xMin'] = $xMin;
    }

    /**
     * Set the yMin value.
     *
     * @param int $yMin
     */
    public function setYMin($yMin)
    {
        $this->_changedData['yMin'] = $yMin;
    }

    /**
     * Set the xMax value.
     *
     * @param int $xMax
     */
    public function setXMax($xMax)
    {
        $this->_changedData['xMax'] = $xMax;
    }

    /**
     * Set the yMax value.
     *
     * @param int $yMax
     */
    public function setYMax($yMax)
    {
        $this->_changedData['yMax'] = $yMax;
    }

    /**
     * Get the bounding box.
     *
     * @return int[]
     */
    public function getBoundingBox()
    {
        return [
            isset($this->_changedData['xMin']) ? $this->_changedData['xMin'] : $this->getOriginalTable()->getXMin(),
            isset($this->_changedData['yMin']) ? $this->_changedData['yMin'] : $this->getOriginalTable()->getYMin(),
            isset($this->_changedData['xMax']) ? $this->_changedData['xMax'] : $this->getOriginalTable()->getXMax(),
            isset($this->_changedData['yMax']) ? $this->_changedData['yMax'] : $this->getOriginalTable()->getYMax()
        ];
    }
}