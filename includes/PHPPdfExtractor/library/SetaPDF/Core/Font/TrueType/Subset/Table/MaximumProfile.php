<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: MaximumProfile.php 1186 2018-01-24 13:55:21Z timo.scholz $
 */

/**
 * This class represents the "maxp" table in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/maxp.htm} for more details.
 *
 * @method SetaPDF_Core_Font_TrueType_Table_MaximumProfile getOriginalTable()
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_MaximumProfile extends SetaPDF_Core_Font_TrueType_Subset_Table
{
    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Table_MaximumProfile $table
     */
    public function __construct(SetaPDF_Core_Font_TrueType_Table_MaximumProfile $table)
    {
        parent::__construct($table);
    }

    /**
     * Sets the number of glyphs in the font.
     *
     * @param int $value
     */
    public function setNumGlyphs($value)
    {
        $this->_changedData['numGlyphs'] = $value;
    }

    /**
     * Sets the maximum number of points in a non-composite glyph.
     *
     * @param int $value
     */
    public function setMaxPoints($value)
    {
        $this->_changedData['maxPoints'] = $value;
    }

    /**
     * Sets the maximum number of contours in a non-composite glyph.
     *
     * @param int $value
     */
    public function setMaxContours($value)
    {
        $this->_changedData['maxContours'] = $value;
    }

    /**
     * Sets the maximum number of points in a composite glyph.
     *
     * @param int $value
     */
    public function setMaxCompositePoints($value)
    {
        $this->_changedData['maxCompositePoints'] = $value;
    }

    /**
     * Sets the maximum number of contours in a composite glyph.
     *
     * @param int $value
     */
    public function setMaxCompositeContours($value)
    {
        $this->_changedData['maxCompositeContours'] = $value;
    }

    /**
     * Sets the maximum number of components referenced at “top level” for any composite glyph.
     *
     * @param int $value
     */
    public function setMaxComponentElements($value)
    {
        $this->_changedData['maxComponentElements'] = $value;
    }

    /**
     * Sets the maximum number of levels of recursion; 1 for simple components.
     *
     * @param int $value
     */
    public function setMaxComponentDepth($value)
    {
        $this->_changedData['maxComponentDepth'] = $value;
    }

    /**
     * Sets the maximum byte count for glyph instructions.
     *
     * @param $value
     */
    public function setMaxSizeOfInstructions($value)
    {
        $this->_changedData['maxSizeOfInstructions'] = $value;
    }
}