<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: HorizontalHeader.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * This class represents the "hhea" table in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/hhea.htm} for more details.
 *
 * @method SetaPDF_Core_Font_TrueType_Table_HorizontalHeader getOriginalTable()
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_HorizontalHeader extends SetaPDF_Core_Font_TrueType_Subset_Table
{
    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Table_HorizontalHeader $table
     */
    public function __construct(SetaPDF_Core_Font_TrueType_Table_HorizontalHeader $table)
    {
        parent::__construct($table);
    }

    /**
     * Set the maximum advance width value in 'hmtx' table.
     *
     * @param int $value
     */
    public function setAdvanceWidthMax($value)
    {
        $this->_changedData['advanceWidthMax'] = $value;
    }

    /**
     * Set the minimum left sidebearing value in 'hmtx' table.
     *
     * @param int $value
     */
    public function setMinLeftSideBearing($value)
    {
        $this->_changedData['minLeftSideBearing'] = $value;
    }

    /**
     * Sets the minimum right sidebearing value.
     *
     * Calculated as Min(aw - lsb - (xMax - xMin)).
     *
     * @param int $value
     */
    public function setMinRightSideBearing($value)
    {
        $this->_changedData['minRightSideBearing'] = $value;
    }

    /**
     * Sets the xMax extend value.
     *
     * Calculated as Max(lsb + (xMax - xMin))
     *
     * @param int $xMaxExtent
     */
    public function setXMaxExtent($xMaxExtent)
    {
        $this->_changedData['xMaxExtent'] = $xMaxExtent;
    }

    /**
     * Sets the number of hMetric entries in 'hmtx' table.
     *
     * @param int $value
     */
    public function setNumberOfHMetrics($value)
    {
        $this->_changedData['numberOfHMetrics'] = $value;
    }
}