<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: MaximumProfile.php 1185 2018-01-24 13:45:38Z timo.scholz $
 */

/**
 * A class representing the Maximum Profile (maxp) in a TrueType file.
 * https://www.microsoft.com/typography/otspec/maxp.htm
 *
 * @copyright  Copyright (c) 2017 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Table_MaximumProfile extends SetaPDF_Core_Font_TrueType_Table
{
    /**
     * The tag name of this class
     *
     * @var string
     */
    const TAG = SetaPDF_Core_Font_TrueType_Table_Tags::MAXIMUM_PROFILE;

    /**
     * The entries of this table.
     *
     * @var array
     */
    protected $_entries = [
        // Version 0.5 / 1.0
        'version' => [0, SetaPDF_Core_BitConverter::FIXED],
        'numGlyphs' => [4, SetaPDF_Core_BitConverter::USHORT],

        // Version 1.0
        'maxPoints' => [6, SetaPDF_Core_BitConverter::USHORT],
        'maxContours' => [8, SetaPDF_Core_BitConverter::USHORT],
        'maxCompositePoints' => [10, SetaPDF_Core_BitConverter::USHORT],
        'maxCompositeContours' => [12, SetaPDF_Core_BitConverter::USHORT],
        'maxZones' => [14, SetaPDF_Core_BitConverter::USHORT],
        'maxTwilightPoints' => [16, SetaPDF_Core_BitConverter::USHORT],
        'maxStorage' => [18, SetaPDF_Core_BitConverter::USHORT],
        'maxFunctionDefs' => [20, SetaPDF_Core_BitConverter::USHORT],
        'maxInstructionDefs' => [22, SetaPDF_Core_BitConverter::USHORT],
        'maxStackElements' => [24, SetaPDF_Core_BitConverter::USHORT],
        'maxSizeOfInstructions' => [26, SetaPDF_Core_BitConverter::USHORT],
        'maxComponentElements' => [28, SetaPDF_Core_BitConverter::USHORT],
        'maxComponentDepth' => [30, SetaPDF_Core_BitConverter::USHORT],
    ];

    /**
     * Get the version.
     *
     * @return float
     */
    public function getVersion()
    {
        return $this->_get('version');
    }

    /**
     * Get the number of glyphs in the font.
     *
     * @return integer
     */
    public function getNumGlyphs()
    {
        return $this->_get('numGlyphs');
    }

    /**
     * Get the maximum points in a non-composite glyph.
     *
     * @return integer
     */
    public function getMaxPoints()
    {
        return $this->_get('maxPoints');
    }

    /**
     * Get the maximum contours in a non-composite glyph.
     *
     * @return integer
     */
    public function getMaxContours()
    {
        return $this->_get('maxContours');
    }

    /**
     * Get the maximum points in a composite glyph.
     *
     * @return integer
     */
    public function getMaxCompositePoints()
    {
        return $this->_get('maxCompositePoints');
    }

    /**
     * Get the maximum contours in a composite glyph.
     *
     * @return integer
     */
    public function getMaxCompositeContours()
    {
        return $this->_get('maxCompositeContours');
    }

    /**
     * Get wheter to use the twilight zone (Z0) or not.
     *
     * @return integer
     */
    public function getMaxZones()
    {
        return $this->_get('maxZones');
    }

    /**
     * Get the maximum points used in Z0.
     *
     * @return integer
     */
    public function getMaxTwilightPoints()
    {
        return $this->_get('maxTwilightPoints');
    }

    /**
     * Get the number of Storage Area locations.
     *
     * @return integer
     */
    public function getMaxStorage()
    {
        return $this->_get('maxStorage');
    }

    /**
     * Get the number of FDEFs.
     *
     * @return integer
     */
    public function getMaxFunctionDefs()
    {
        return $this->_get('maxFunctionDefs');
    }

    /**
     * Get the number of IDEFs.
     *
     * @return integer
     */
    public function getMaxInstructionDefs()
    {
        return $this->_get('maxInstructionDefs');
    }

    /**
     * Get the maximum stack depth.
     *
     * @return integer
     */
    public function getMaxStackElements()
    {
        return $this->_get('maxStackElements');
    }

    /**
     * Get the maximum byte count for glyph instructions.
     *
     * @return integer
     */
    public function getMaxSizeOfInstructions()
    {
        return $this->_get('maxSizeOfInstructions');
    }

    /**
     * Get the maximum number of components referenced at “top level” for any composite glyph.
     *
     * @return integer
     */
    public function getMaxComponentElements()
    {
        return $this->_get('maxComponentElements');
    }

    /**
     * Get the maximum levels of recursion.
     *
     * @return integer
     */
    public function getMaxComponentDepth()
    {
        return $this->_get('maxComponentDepth');
    }
}