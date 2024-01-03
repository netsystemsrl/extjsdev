<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Description.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * This class is a generic representation of the glyph description in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/glyf.htm#glyphHeaders} for more details.
 *
 * @see SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Glyph::getDescription()
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
abstract class SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Description
{
    /**
     * The glyph data table.
     *
     * @var SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData
     */
    protected $_glyf;

    /**
     * The original description.
     *
     * @var SetaPDF_Core_Font_TrueType_Table_GlyphData_Description
     */
    protected $_description;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData $glyf
     * @param SetaPDF_Core_Font_TrueType_Table_GlyphData_Description $description
     */
    public function __construct(
        SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData $glyf,
        SetaPDF_Core_Font_TrueType_Table_GlyphData_Description $description
    )
    {
        $this->_glyf = $glyf;
        $this->_description = $description;
    }

    /**
     * Gets the original description.
     *
     * @return SetaPDF_Core_Font_TrueType_Table_GlyphData_Description
     */
    public function getOrigin()
    {
        return $this->_description;
    }

    /**
     * Release memory and cycled references.
     */
    public function cleanUp()
    {
        $this->_description->cleanUp();
        $this->_glyf = null;
    }

    /**
     * Writes the description.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     */
    abstract public function write(SetaPDF_Core_Writer_WriterInterface $writer);
}