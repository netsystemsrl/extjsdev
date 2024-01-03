<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Glyph.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * This class represents a glyph in a sub-setting context.
 *
 * See {@link https://www.microsoft.com/typography/otspec/glyf.htm#glyphHeaders} for more details.
 *
 * @see SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData::getGlyph()
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Glyph
{
    /**
     * The original glyph.
     *
     * @var SetaPDF_Core_Font_TrueType_Table_GlyphData_Glyph
     */
    protected $_glyph;

    /**
     * The "glyf" table.
     *
     * @var SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData
     */
    protected $_glyfTable;

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData $glyf
     * @param SetaPDF_Core_Font_TrueType_Table_GlyphData_Glyph $glyph
     */
    public function __construct(
        SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData $glyf,
        SetaPDF_Core_Font_TrueType_Table_GlyphData_Glyph $glyph
    )
    {
        $this->_glyfTable = $glyf;
        $this->_glyph = $glyph;
    }

    /**
     * Gets the original Glyph.
     *
     * @return SetaPDF_Core_Font_TrueType_Table_GlyphData_Glyph
     */
    public function getOrigin()
    {
        return $this->_glyph;
    }

    /**
     * Release memory and cycled references.
     */
    public function cleanUp()
    {
        if ($this->_glyph !== null) {
            $this->_glyph->cleanUp();
        }
        $this->_glyfTable = null;
        $this->_glyph = null;
    }

    /**
     * Gets the description.
     *
     * @return SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Description
     */
    public function getDescription()
    {
        $description = $this->_glyph->getDescription();

        if ($description instanceof SetaPDF_Core_Font_TrueType_Table_GlyphData_Description_Composite) {
            return new SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Description_Composite(
                $this->_glyfTable,
                $description
            );
        }

        return new SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData_Description_Simple(
            $this->_glyfTable,
            $description
        );
    }

    /**
     * Writes the glyph.
     *
     * @param SetaPDF_Core_Writer_WriterInterface $writer
     */
    public function write(SetaPDF_Core_Writer_WriterInterface $writer)
    {
        $writer->write($this->_glyph->getRawHeader());

        $description = $this->getDescription();
        $description->write($writer);
        $description->cleanUp();
    }
}