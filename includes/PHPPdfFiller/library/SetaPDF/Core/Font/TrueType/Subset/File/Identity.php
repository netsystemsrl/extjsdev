<?php
/**
 * This file is part of the SetaPDF-Core Component
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 * @version    $Id: Identity.php 1317 2019-01-16 09:55:08Z jan.slabon $
 */

/**
 * Font subsetting class used for identity encoding (more bytes).
 *
 * @copyright  Copyright (c) 2019 Setasign - Jan Slabon (https://www.setasign.com)
 * @category   SetaPDF
 * @package    SetaPDF_Core
 * @subpackage Font
 * @license    https://www.setasign.com/ Commercial
 */
class SetaPDF_Core_Font_TrueType_Subset_File_Identity extends SetaPDF_Core_Font_TrueType_Subset_File
{
    /**
     * The glyf table.
     *
     * @var SetaPDF_Core_Font_TrueType_Subset_Table_GlyphData
     */
    private $_glyf;

    /**
     * A cmap sub table, in order to get the glyph ids.
     *
     * @var SetaPDF_Core_Font_TrueType_Table_CharacterToGlyphIndexMapping_SubTable
     */
    private $_cmapOriginSubTable;

    /**
     * The glyph id to char code mapping.
     *
     * @var array
     */
    private $_mapping = [];

    /**
     * The constructor.
     *
     * @param SetaPDF_Core_Font_TrueType_File $font
     * @throws SetaPDF_Core_Font_Exception
     */
    public function __construct(SetaPDF_Core_Font_TrueType_File $font)
    {
        parent::__construct($font);

        $this->_glyf = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::GLYF);
        /**
         * @var SetaPDF_Core_Font_TrueType_Subset_Table_CharacterToGlyphIndexMapping $cmap
         */
        $cmap = $this->getTable(SetaPDF_Core_Font_TrueType_Table_Tags::CMAP);

        if ($cmap->getOriginalTable()->hasSubTable(3, 10)) {
            $this->_cmapOriginSubTable = $cmap->getOriginalTable()->getSubTable(3, 10);
        } else {
            $this->_cmapOriginSubTable = $cmap->getOriginalTable()->getSubTable(3, 1);
        }

        if ($this->_cmapOriginSubTable === null || $this->_cmapOriginSubTable === false) {
            throw new SetaPDF_Core_Font_Exception(
                'Encoding table (3, 1 or 3, 10) is required but not available in this font.'
            );
        }
    }

    /**
     * @inheritdoc
     */
    public function cleanUp()
    {
        parent::cleanUp();
        $this->_glyf = null;
        $this->_cmapOriginSubTable = null;
        $this->_mapping = null;
    }

    /**
     * @inheritdoc
     */
    public function addCharCode($charCode)
    {
        if (!isset($this->_mapping[$charCode])) {
            $glyphId = $this->_glyf->registerGlyph(
            // get the origin glyph
                $this->_cmapOriginSubTable->getGlyphIndex($charCode)
            );

            $this->_mapping[$charCode] = $glyphId;
        }

        return $this->_mapping[$charCode];
    }

    /**
     * @inheritdoc
     */
    public function addChar($char)
    {
        $glyphId = $this->addCharCode(SetaPDF_Core_Encoding::utf16BeToUnicodePoint($char));

        return SetaPDF_Core_BitConverter::formatToUInt16($glyphId);
    }

    /**
     * @inheritdoc
     */
    public function _prepareSubset()
    {
        parent::_prepareSubset();

        $this->_tables[SetaPDF_Core_Font_TrueType_Table_Tags::CMAP]->cleanUp();
        unset($this->_tables[SetaPDF_Core_Font_TrueType_Table_Tags::CMAP]);
    }
}
